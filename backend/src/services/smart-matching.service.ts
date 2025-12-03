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
 * ONLY perfect matches get notifications - one per user.
 */

import prisma from '../lib/prisma';
import { createNotification } from './notification.service';
import { itemEvents, ItemCreatedPayload } from '../events/item.events';
import { barterEvents, BarterOfferCreatedPayload } from '../events/barter.events';
import { reverseAuctionEvents, ReverseAuctionCreatedPayload } from '../events/reverse-auction.events';

// Track recently notified pairs to avoid duplicate notifications
// Key format: "userId:itemId" - tracks which user was notified about which item
const recentlyNotifiedUsers = new Set<string>();

const makeUserItemKey = (userId: string, itemId: string): string => {
  return `${userId}:${itemId}`;
};

// Clear old notification keys every 10 minutes
setInterval(() => {
  recentlyNotifiedUsers.clear();
  console.log('[SmartMatching] Cleared notification cache');
}, 10 * 60 * 1000);

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
 * When an item is created with barter preferences, find PERFECT matches only
 * A perfect match is when:
 * - User A has Item X and wants Item Y
 * - User B has Item Y and wants Item X
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

    // Must have barter preferences
    if (!item.desiredCategoryId && !item.desiredItemTitle) {
      console.log(`[SmartMatching] Item ${itemId} has no barter preferences, skipping`);
      return;
    }

    const myName = item.seller?.fullName || 'مستخدم';
    const myItem = item.title;
    const myItemValue = item.estimatedValue.toLocaleString('ar-EG');
    const myWantedText = item.desiredItemTitle || item.desiredCategory?.nameAr || 'سلعة';

    console.log(`[SmartMatching] Looking for PERFECT matches: ${myName} offers "${myItem}" and wants "${myWantedText}"`);

    // Find items that match what I want (by category or title keyword)
    const matchConditions: any[] = [];

    // Match by desired category
    if (item.desiredCategoryId) {
      matchConditions.push({ categoryId: item.desiredCategoryId });
    }

    // Match by title keywords
    if (item.desiredItemTitle) {
      const keywords = item.desiredItemTitle.split(/[\s,،]+/).filter(k => k.length > 2);
      for (const keyword of keywords) {
        matchConditions.push({ title: { contains: keyword, mode: 'insensitive' as const } });
      }
    }

    if (matchConditions.length === 0) return;

    const potentialMatches = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        sellerId: { not: sellerId },
        OR: matchConditions,
      },
      include: {
        category: { select: { id: true, nameAr: true } },
        desiredCategory: { select: { id: true, nameAr: true } },
        seller: { select: { id: true, fullName: true } },
      },
    });

    console.log(`[SmartMatching] Found ${potentialMatches.length} potential matches for "${myItem}"`);

    let perfectMatchCount = 0;

    // Check each potential match for TWO-WAY barter compatibility (perfect match)
    for (const otherItem of potentialMatches) {
      // Skip if already notified this user about this item
      const notifKey = makeUserItemKey(otherItem.sellerId, itemId);
      if (recentlyNotifiedUsers.has(notifKey)) {
        console.log(`[SmartMatching] Already notified user ${otherItem.sellerId} about item ${itemId}`);
        continue;
      }

      // Check if the OTHER person wants what I'M offering (two-way match)
      const theyWantMyItem = checkIfItemMatches(item, otherItem);

      if (theyWantMyItem) {
        // PERFECT BARTER MATCH! Both parties have what each other wants
        perfectMatchCount++;
        recentlyNotifiedUsers.add(notifKey);

        const theirName = otherItem.seller?.fullName || 'مستخدم';
        const theirItem = otherItem.title;
        const theirItemValue = otherItem.estimatedValue.toLocaleString('ar-EG');

        console.log(`[SmartMatching] 🎯 PERFECT MATCH: ${myName} (${myItem}) ↔ ${theirName} (${theirItem})`);

        // Send ONE clear notification to the other user
        await createNotification({
          userId: otherItem.sellerId,
          type: 'BARTER_MATCH',
          title: '🎯 تطابق مثالي للمقايضة!',
          message: `${myName} يعرض "${myItem}" (${myItemValue} ج.م) ويريد ما لديك "${theirItem}" (${theirItemValue} ج.م) - تطابق مثالي!`,
          priority: 'HIGH',
          entityType: 'ITEM',
          entityId: itemId,
          actionUrl: `/items/${itemId}`,
          actionText: 'إتمام المقايضة',
          metadata: {
            matchType: 'PERFECT_BARTER_MATCH',
            myItemId: itemId,
            myItemTitle: myItem,
            myItemValue: item.estimatedValue,
            theirItemId: otherItem.id,
            theirItemTitle: theirItem,
            theirItemValue: otherItem.estimatedValue,
            initiatorId: sellerId,
            initiatorName: myName,
          },
        });
      }
      // NO notification for partial matches - only perfect matches get notified
    }

    console.log(`[SmartMatching] Sent ${perfectMatchCount} perfect match notification(s) for item ${itemId}`);
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
 * Match against:
 * 1. ReverseAuctions (reverse auction purchase demands)
 * 2. BarterOffers with isOpenOffer=true (direct purchase demands)
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

    // 1. Find ReverseAuctions (reverse auction purchase demands) matching this item
    const matchingReverseAuctions = await prisma.reverseAuction.findMany({
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

    for (const demand of matchingReverseAuctions) {
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
          matchType: 'SALE_TO_REVERSE_AUCTION',
          itemId,
          auctionId: demand.id,
        },
      });
    }

    // 2. Find DEMAND items (DIRECT_BUY, REVERSE_AUCTION) in unified Item table
    const keywordConditions = item.title
      ? item.title.split(/[\s,،]+/).filter(k => k.length > 2).map(keyword => ({
          desiredKeywords: { contains: keyword, mode: 'insensitive' as const }
        }))
      : [];

    const matchingDemandItems = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        listingType: { in: ['DIRECT_BUY', 'REVERSE_AUCTION'] },
        sellerId: { not: sellerId },
        OR: [
          { categoryId: item.categoryId },
          ...keywordConditions
        ],
        // Budget match - DEMAND item's max budget should cover the price
        desiredValueMax: { gte: item.estimatedValue * 0.8 } // 20% tolerance
      },
      include: {
        seller: { select: { id: true, fullName: true } },
        category: { select: { id: true, nameAr: true } },
      },
    });

    for (const demand of matchingDemandItems) {
      if (notifiedUsers.has(demand.sellerId)) continue;
      notifiedUsers.add(demand.sellerId);

      const demandTitle = demand.title || 'طلب شراء';
      const budgetText = demand.desiredValueMax
        ? `${demand.desiredValueMax.toLocaleString('ar-EG')} ج.م`
        : 'غير محدد';

      await createNotification({
        userId: demand.sellerId,
        type: 'ITEM_AVAILABLE',
        title: '💰 سلعة جديدة تطابق طلبك!',
        message: `"${item.title}" متاحة الآن بسعر ${priceText} ج.م - تطابق طلبك "${demandTitle}"!`,
        priority: 'HIGH',
        entityType: 'ITEM',
        entityId: itemId,
        actionUrl: `/items/${itemId}`,
        actionText: 'عرض السلعة',
        metadata: {
          matchType: 'SALE_TO_DIRECT_PURCHASE',
          itemId,
          demandId: demand.id,
        },
      });
    }

    console.log(`[SmartMatching] ${notifiedUsers.size} users notified for new sale item ${itemId}`);
  } catch (error) {
    console.error('[SmartMatching] Error in notifySaleMatches:', error);
  }
};

/**
 * When a direct purchase demand (Item with listingType DIRECT_BUY) is created
 * Notify supply item owners who have matching items
 */
export const notifyDirectPurchaseMatches = async (demandId: string, buyerId: string): Promise<void> => {
  try {
    // Fetch DEMAND item from unified Item table
    const demand = await prisma.item.findUnique({
      where: { id: demandId },
      include: {
        seller: { select: { id: true, fullName: true } },
        category: { select: { id: true, nameAr: true } },
      },
    });

    // Only process DEMAND items (DIRECT_BUY or REVERSE_AUCTION)
    if (!demand || !['DIRECT_BUY', 'REVERSE_AUCTION'].includes(demand.listingType)) return;

    const buyerName = demand.seller?.fullName || 'مشتري';
    const demandTitle = demand.title || 'سلعة';
    const budgetText = demand.desiredValueMax
      ? `${demand.desiredValueMax.toLocaleString('ar-EG')} ج.م`
      : 'غير محدد';
    const notifiedUsers = new Set<string>();

    // Build search conditions for matching supply items
    const orConditions: any[] = [];

    // Match by category
    if (demand.categoryId) {
      orConditions.push({ categoryId: demand.categoryId });
    }

    // Match by keywords
    if (demand.desiredKeywords) {
      const keywords = demand.desiredKeywords.split(',').map(k => k.trim()).filter(k => k.length > 2);
      for (const keyword of keywords) {
        orConditions.push({ title: { contains: keyword, mode: 'insensitive' as const } });
      }
    }

    if (orConditions.length === 0) return;

    // Find matching SUPPLY items
    const matchingSupply = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        listingType: { in: ['DIRECT_SALE', 'AUCTION', 'BARTER'] }, // Only SUPPLY types
        sellerId: { not: buyerId },
        OR: orConditions,
        // Price range match if specified
        ...(demand.desiredValueMax && {
          estimatedValue: { lte: demand.desiredValueMax * 1.2 } // 20% tolerance
        }),
      },
      include: {
        seller: { select: { id: true, fullName: true } },
        category: { select: { id: true, nameAr: true } },
      },
    });

    for (const item of matchingSupply) {
      if (notifiedUsers.has(item.sellerId)) continue;
      notifiedUsers.add(item.sellerId);

      const priceText = item.estimatedValue.toLocaleString('ar-EG');

      await createNotification({
        userId: item.sellerId,
        type: 'PURCHASE_REQUEST_MATCH',
        title: '🛒 مشتري يبحث عن سلعتك!',
        message: `${buyerName} يبحث عن "${demandTitle}" - لديك "${item.title}" (${priceText} ج.م)! الميزانية: ${budgetText}`,
        priority: 'HIGH',
        entityType: 'ITEM',
        entityId: demandId,
        actionUrl: `/items/${item.id}`,
        actionText: 'عرض طلب الشراء',
        metadata: {
          matchType: 'DIRECT_PURCHASE_TO_SALE',
          demandId,
          itemId: item.id,
        },
      });
    }

    console.log(`[SmartMatching] ${notifiedUsers.size} sellers notified for new direct purchase demand ${demandId}`);
  } catch (error) {
    console.error('[SmartMatching] Error in notifyDirectPurchaseMatches:', error);
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
