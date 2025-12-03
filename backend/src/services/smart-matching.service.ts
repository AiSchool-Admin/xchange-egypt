/**
 * Smart Matching Notification Service
 *
 * Core Concept: Match SUPPLY with DEMAND for BARTER
 *
 * When Ahmed lists "صنف1" for sale and wants "صنف2" in exchange:
 * - His SUPPLY = صنف1
 * - His DEMAND = صنف2
 *
 * When Sara lists "صنف2" for sale and wants "صنف1" in exchange:
 * - Her SUPPLY = صنف2
 * - Her DEMAND = صنف1
 *
 * Perfect Match! Ahmed's SUPPLY matches Sara's DEMAND AND vice versa.
 * Both get ONE notification about the match.
 */

import prisma from '../lib/prisma';
import { createNotification } from './notification.service';
import { itemEvents, ItemCreatedPayload } from '../events/item.events';
import { barterEvents, BarterOfferCreatedPayload } from '../events/barter.events';
import { reverseAuctionEvents, ReverseAuctionCreatedPayload } from '../events/reverse-auction.events';

// Track recently notified pairs to avoid duplicate notifications
const recentlyNotifiedPairs = new Set<string>();

const makeNotificationKey = (user1: string, user2: string, item1: string, item2: string): string => {
  // Sort to ensure consistent key regardless of order
  const users = [user1, user2].sort().join('-');
  const items = [item1, item2].sort().join('-');
  return `${users}:${items}`;
};

// Clear old notification keys periodically (every 5 minutes)
setInterval(() => {
  recentlyNotifiedPairs.clear();
}, 5 * 60 * 1000);

// ============================================
// Main Barter Matching Logic
// ============================================

/**
 * When an item with barter preferences is created:
 * 1. Find items that match what this user wants
 * 2. Check if those item owners want what this user is offering
 * 3. Send ONE clear notification to both parties
 */
export const notifyBarterMatches = async (payload: BarterOfferCreatedPayload): Promise<void> => {
  // For barter offers created from inventory, don't trigger - let item events handle it
  if (!payload.offeredItemIds || payload.offeredItemIds.length === 0) {
    console.log('[SmartMatching] Skipping barter offer without offered items (handled by item events)');
    return;
  }

  // Original barter offer logic for standalone offers
  await handleStandaloneBarterOffer(payload);
};

/**
 * When an item is created with barter preferences, find matches
 */
export const notifyItemWithBarterMatches = async (itemId: string, sellerId: string): Promise<void> => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        category: { select: { id: true, nameAr: true } },
        desiredCategory: { select: { id: true, nameAr: true } },
        seller: { select: { id: true, fullName: true } },
      },
    });

    if (!item) return;

    const myName = item.seller?.fullName || 'مستخدم';
    const myItem = item.title;
    const myItemValue = item.estimatedValue.toLocaleString('ar-EG');
    const myWantedText = item.desiredItemTitle || item.desiredCategory?.nameAr || 'سلعة';

    console.log(`[SmartMatching] Looking for matches: ${myName} offers "${myItem}" and wants "${myWantedText}"`);

    // Find items that match what I want (by category or title keyword)
    const matchConditions: any = {
      status: 'ACTIVE',
      sellerId: { not: sellerId },
    };

    // Match by desired category
    if (item.desiredCategoryId) {
      matchConditions.categoryId = item.desiredCategoryId;
    }

    const potentialMatches = await prisma.item.findMany({
      where: matchConditions,
      include: {
        category: { select: { id: true, nameAr: true } },
        desiredCategory: { select: { id: true, nameAr: true } },
        seller: { select: { id: true, fullName: true } },
      },
    });

    // Also search by title keyword if desiredItemTitle is specified
    let keywordMatches: typeof potentialMatches = [];
    if (item.desiredItemTitle) {
      const keywords = item.desiredItemTitle.split(/[\s,،]+/).filter(k => k.length > 2);
      if (keywords.length > 0) {
        keywordMatches = await prisma.item.findMany({
          where: {
            status: 'ACTIVE',
            sellerId: { not: sellerId },
            OR: keywords.map(keyword => ({
              title: { contains: keyword, mode: 'insensitive' as const },
            })),
          },
          include: {
            category: { select: { id: true, nameAr: true } },
            desiredCategory: { select: { id: true, nameAr: true } },
            seller: { select: { id: true, fullName: true } },
          },
        });
      }
    }

    // Combine and dedupe matches
    const allMatches = [...potentialMatches];
    for (const match of keywordMatches) {
      if (!allMatches.find(m => m.id === match.id)) {
        allMatches.push(match);
      }
    }

    console.log(`[SmartMatching] Found ${allMatches.length} potential matches`);

    // Check each potential match for two-way barter compatibility
    for (const otherItem of allMatches) {
      const notifKey = makeNotificationKey(sellerId, otherItem.sellerId, itemId, otherItem.id);

      if (recentlyNotifiedPairs.has(notifKey)) {
        console.log(`[SmartMatching] Skipping duplicate notification for pair`);
        continue;
      }

      // Check if the other person wants what I'm offering
      const theyWantMyItem = checkIfItemMatches(item, otherItem);

      if (theyWantMyItem) {
        // PERFECT BARTER MATCH!
        recentlyNotifiedPairs.add(notifKey);

        const theirName = otherItem.seller?.fullName || 'مستخدم';
        const theirItem = otherItem.title;
        const theirItemValue = otherItem.estimatedValue.toLocaleString('ar-EG');
        const theirWantedText = otherItem.desiredItemTitle || otherItem.desiredCategory?.nameAr || 'سلعة';

        console.log(`[SmartMatching] 🎯 PERFECT MATCH: ${myName} ↔ ${theirName}`);

        // Notify the other user (the one who has what I want)
        await createNotification({
          userId: otherItem.sellerId,
          type: 'BARTER_MATCH',
          title: '🎯 تطابق مثالي للمقايضة!',
          message: `${myName} يعرض "${myItem}" (${myItemValue} ج.م) مقابل "${myWantedText}" - لديك "${theirItem}"!`,
          priority: 'HIGH',
          entityType: 'ITEM',
          entityId: itemId,
          actionUrl: `/barter/initiate?offeredItem=${otherItem.id}&wantedItem=${itemId}`,
          actionText: 'بدء المقايضة',
          metadata: {
            matchType: 'PERFECT_BARTER_MATCH',
            myItemId: itemId,
            myItemTitle: myItem,
            theirItemId: otherItem.id,
            theirItemTitle: theirItem,
            initiatorId: sellerId,
            initiatorName: myName,
          },
        });

        console.log(`[SmartMatching] Notified ${theirName} about perfect match with ${myName}`);
      } else {
        // Partial match - they have what I want but may not want what I have
        // Still notify them as they might be interested
        const theirName = otherItem.seller?.fullName || 'مستخدم';
        const theirItem = otherItem.title;
        const theirItemValue = otherItem.estimatedValue.toLocaleString('ar-EG');

        // Don't send if already notified
        if (!recentlyNotifiedPairs.has(notifKey)) {
          recentlyNotifiedPairs.add(notifKey);

          await createNotification({
            userId: otherItem.sellerId,
            type: 'BARTER_MATCH',
            title: '🔄 فرصة مقايضة جديدة',
            message: `${myName} يبحث عن "${myWantedText}" ويعرض "${myItem}" (${myItemValue} ج.م) - لديك "${theirItem}"!`,
            priority: 'MEDIUM',
            entityType: 'ITEM',
            entityId: itemId,
            actionUrl: `/barter/initiate?offeredItem=${otherItem.id}&wantedItem=${itemId}`,
            actionText: 'عرض التفاصيل',
            metadata: {
              matchType: 'PARTIAL_BARTER_MATCH',
              myItemId: itemId,
              theirItemId: otherItem.id,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('[SmartMatching] Error in notifyItemWithBarterMatches:', error);
  }
};

/**
 * Check if my item matches what the other person wants
 */
const checkIfItemMatches = (myItem: any, theirItem: any): boolean => {
  // Check if they want my category
  if (theirItem.desiredCategoryId && myItem.categoryId === theirItem.desiredCategoryId) {
    return true;
  }

  // Check if they want my item by title keyword
  if (theirItem.desiredItemTitle && myItem.title) {
    const theirKeywords = theirItem.desiredItemTitle.toLowerCase().split(/[\s,،]+/).filter((k: string) => k.length > 2);
    const myTitle = myItem.title.toLowerCase();

    for (const keyword of theirKeywords) {
      if (myTitle.includes(keyword)) {
        return true;
      }
    }
  }

  return false;
};

/**
 * Handle standalone barter offers (not from inventory)
 */
const handleStandaloneBarterOffer = async (payload: BarterOfferCreatedPayload): Promise<void> => {
  try {
    if (!payload.isOpenOffer) return;

    const { offerId, initiatorId, offeredItemIds, categoryIds } = payload;

    const initiator = await prisma.user.findUnique({
      where: { id: initiatorId },
      select: { fullName: true },
    });
    const initiatorName = initiator?.fullName || 'مستخدم';

    const offeredItems = await prisma.item.findMany({
      where: { id: { in: offeredItemIds } },
      include: { category: { select: { id: true, nameAr: true } } },
    });

    const offeredCategoryIds = offeredItems.map(i => i.categoryId).filter(Boolean) as string[];
    const offeredValue = offeredItems.reduce((sum, i) => sum + i.estimatedValue, 0);
    const offeredValueText = offeredValue.toLocaleString('ar-EG');
    const offeredItemsText = offeredItems.map(i => `"${i.title}"`).join(' و ');

    const initiatorItemRequests = await prisma.itemRequest.findMany({
      where: { barterOfferId: offerId },
      include: { category: { select: { nameAr: true } } },
    });

    const initiatorWantsText = initiatorItemRequests.length > 0
      ? initiatorItemRequests.map(r => r.description || r.category?.nameAr || 'سلعة').join(' أو ')
      : 'سلعة مقابلة';

    const notifiedUsers = new Set<string>();
    const wantedCategoryIds = categoryIds || [];

    // Find matching supply
    if (wantedCategoryIds.length > 0) {
      const matchingSupply = await prisma.item.findMany({
        where: {
          categoryId: { in: wantedCategoryIds },
          status: 'ACTIVE',
          sellerId: { not: initiatorId },
        },
        include: {
          seller: { select: { id: true, fullName: true } },
          category: { select: { nameAr: true } },
        },
      });

      const sellerItems: Record<string, typeof matchingSupply> = {};
      for (const item of matchingSupply) {
        if (!sellerItems[item.sellerId]) {
          sellerItems[item.sellerId] = [];
        }
        sellerItems[item.sellerId].push(item);
      }

      for (const sellerId of Object.keys(sellerItems)) {
        const items = sellerItems[sellerId];
        if (notifiedUsers.has(sellerId)) continue;
        notifiedUsers.add(sellerId);

        const firstItem = items[0];
        const itemsText = items.length > 1
          ? `"${firstItem.title}" و ${items.length - 1} سلع أخرى`
          : `"${firstItem.title}"`;

        await createNotification({
          userId: sellerId,
          type: 'BARTER_MATCH',
          title: '🔄 فرصة مقايضة!',
          message: `${initiatorName} يبحث عن "${initiatorWantsText}" - لديك ${itemsText}! يعرض مقابلها: ${offeredItemsText} (${offeredValueText} ج.م)`,
          priority: 'MEDIUM',
          entityType: 'BARTER_OFFER',
          entityId: offerId,
          actionUrl: `/barter/respond/${offerId}`,
          actionText: 'عرض التفاصيل',
          metadata: {
            matchType: 'BARTER_OFFER_MATCH',
            offerId,
          },
        });
      }
    }

    console.log(`[SmartMatching] ${notifiedUsers.size} users notified for barter offer ${offerId}`);
  } catch (error) {
    console.error('[SmartMatching] Error in handleStandaloneBarterOffer:', error);
  }
};

/**
 * When an item is listed for direct sale (no barter preferences)
 */
export const notifySaleMatches = async (itemId: string, sellerId: string): Promise<void> => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        category: { select: { id: true, nameAr: true } },
        seller: { select: { fullName: true } },
      },
    });

    if (!item || !item.categoryId) return;

    const priceText = item.estimatedValue.toLocaleString('ar-EG');
    const sellerName = item.seller?.fullName || 'بائع';
    const notifiedUsers = new Set<string>();

    // Find ReverseAuctions (purchase demands) matching this item
    const matchingDemands = await prisma.reverseAuction.findMany({
      where: {
        categoryId: item.categoryId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
        buyerId: { not: sellerId },
        OR: [
          { maxBudget: { gte: item.estimatedValue } },
          { maxBudget: null },
        ],
      },
      include: {
        buyer: { select: { id: true, fullName: true } },
      },
    });

    for (const demand of matchingDemands) {
      if (notifiedUsers.has(demand.buyerId)) continue;
      notifiedUsers.add(demand.buyerId);

      await createNotification({
        userId: demand.buyerId,
        type: 'ITEM_AVAILABLE',
        title: '💰 سلعة جديدة تطابق طلبك!',
        message: `"${item.title}" متاحة الآن بسعر ${priceText} ج.م - تطابق طلبك "${demand.title}"!`,
        priority: 'HIGH',
        entityType: 'ITEM',
        entityId: itemId,
        actionUrl: `/items/${itemId}`,
        actionText: 'عرض السلعة',
        metadata: {
          matchType: 'SALE_TO_PURCHASE',
          itemId,
          auctionId: demand.id,
        },
      });
    }

    console.log(`[SmartMatching] ${notifiedUsers.size} users notified for new sale item ${itemId}`);
  } catch (error) {
    console.error('[SmartMatching] Error in notifySaleMatches:', error);
  }
};

/**
 * When a purchase request (reverse auction) is created
 */
export const notifyPurchaseRequestMatches = async (payload: ReverseAuctionCreatedPayload): Promise<void> => {
  try {
    const { auctionId, buyerId, categoryId, title, maxBudget } = payload;

    const buyer = await prisma.user.findUnique({
      where: { id: buyerId },
      select: { fullName: true },
    });

    const category = await prisma.category.findUnique({
      where: { id: categoryId },
      select: { nameAr: true },
    });

    const buyerName = buyer?.fullName || 'مشتري';
    const budgetText = maxBudget ? `${maxBudget.toLocaleString('ar-EG')} ج.م` : 'غير محدد';
    const notifiedUsers = new Set<string>();

    const matchingSupply = await prisma.item.findMany({
      where: {
        categoryId,
        status: 'ACTIVE',
        sellerId: { not: buyerId },
        ...(maxBudget && { estimatedValue: { lte: maxBudget * 1.2 } }),
      },
      include: {
        seller: { select: { id: true, fullName: true } },
      },
    });

    for (const item of matchingSupply) {
      if (notifiedUsers.has(item.sellerId)) continue;
      notifiedUsers.add(item.sellerId);

      const priceText = item.estimatedValue.toLocaleString('ar-EG');

      await createNotification({
        userId: item.sellerId,
        type: 'PURCHASE_REQUEST_MATCH',
        title: '🛒 مشتري محتمل لسلعتك!',
        message: `${buyerName} يبحث عن "${title}" - لديك "${item.title}" (${priceText} ج.م)! الميزانية: ${budgetText}`,
        priority: 'HIGH',
        entityType: 'REVERSE_AUCTION',
        entityId: auctionId,
        actionUrl: `/reverse-auctions/${auctionId}`,
        actionText: 'تقديم عرض',
        metadata: {
          matchType: 'PURCHASE_TO_SUPPLY',
          auctionId,
          itemId: item.id,
        },
      });
    }

    console.log(`[SmartMatching] ${notifiedUsers.size} users notified for new purchase request ${auctionId}`);
  } catch (error) {
    console.error('[SmartMatching] Error in notifyPurchaseRequestMatches:', error);
  }
};

// ============================================
// Initialize Event Listeners
// ============================================

export const initSmartMatchingListeners = (): void => {
  console.log('[SmartMatching] Initializing smart matching listeners...');

  // Listen for new barter offers (standalone)
  barterEvents.onOfferCreated(async (payload: BarterOfferCreatedPayload) => {
    await notifyBarterMatches(payload);
  });

  // Listen for new items
  itemEvents.onItemCreated(async (payload: ItemCreatedPayload) => {
    const item = await prisma.item.findUnique({
      where: { id: payload.itemId },
      select: {
        desiredCategoryId: true,
        desiredItemTitle: true,
      },
    });

    const hasBarterPrefs = !!(item?.desiredCategoryId || item?.desiredItemTitle);

    if (hasBarterPrefs) {
      await notifyItemWithBarterMatches(payload.itemId, payload.userId);
    } else {
      await notifySaleMatches(payload.itemId, payload.userId);
    }
  });

  // Listen for new reverse auctions (purchase requests)
  reverseAuctionEvents.onAuctionCreated(async (payload: ReverseAuctionCreatedPayload) => {
    await notifyPurchaseRequestMatches(payload);
  });

  console.log('[SmartMatching] Smart matching listeners initialized ✅');
};
