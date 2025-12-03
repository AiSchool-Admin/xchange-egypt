/**
 * Smart Matching Notification Service
 *
 * Core Concept: Match SUPPLY with DEMAND regardless of listing type
 *
 * SUPPLY (العرض):
 * - Any Item with status='ACTIVE' (sale, auction, barter)
 *
 * DEMAND (الطلب):
 * - ItemRequest from barter offers (what user wants in exchange)
 * - ReverseAuction (what user wants to buy)
 *
 * When someone creates a barter offer:
 * 1. Their offered items → SUPPLY → matches others' DEMAND
 * 2. Their item requests → DEMAND → matches others' SUPPLY
 *
 * This creates two-way matching:
 * - Ahmed offers "شقة" (SUPPLY) and wants "سيارة" (DEMAND)
 * - Sara offers "سيارة" (SUPPLY) and wants "شقة" (DEMAND)
 * - Ahmed's SUPPLY matches Sara's DEMAND → Notify Sara
 * - Sara's SUPPLY matches Ahmed's DEMAND → Notify Ahmed
 * - Perfect barter match!
 */

import prisma from '../lib/prisma';
import { createNotification } from './notification.service';
import { itemEvents, ItemCreatedPayload } from '../events/item.events';
import { barterEvents, BarterOfferCreatedPayload } from '../events/barter.events';
import { reverseAuctionEvents, ReverseAuctionCreatedPayload } from '../events/reverse-auction.events';

// ============================================
// Core Matching Logic
// ============================================

/**
 * When a barter offer is created, perform two-way matching:
 * 1. Match offerer's SUPPLY (items) with others' DEMAND (requests)
 * 2. Match offerer's DEMAND (requests) with others' SUPPLY (items)
 */
export const notifyBarterMatches = async (payload: BarterOfferCreatedPayload): Promise<void> => {
  try {
    if (!payload.isOpenOffer) return; // Only match open offers

    const { offerId, initiatorId, offeredItemIds, categoryIds } = payload;

    // Get initiator info
    const initiator = await prisma.user.findUnique({
      where: { id: initiatorId },
      select: { fullName: true },
    });
    const initiatorName = initiator?.fullName || 'مستخدم';

    // Get offered items details
    const offeredItems = await prisma.item.findMany({
      where: { id: { in: offeredItemIds } },
      include: { category: { select: { id: true, nameAr: true } } },
    });

    const offeredCategoryIds = offeredItems.map(i => i.categoryId).filter(Boolean) as string[];
    const offeredValue = offeredItems.reduce((sum, i) => sum + i.estimatedValue, 0);
    const offeredValueText = offeredValue.toLocaleString('ar-EG');
    const offeredItemsText = offeredItems.map(i => `"${i.title}"`).join(' و ');

    // Get wanted categories (from ItemRequests)
    const wantedCategoryIds = categoryIds || [];
    const wantedCategories = await prisma.category.findMany({
      where: { id: { in: wantedCategoryIds } },
      select: { id: true, nameAr: true },
    });
    const wantedCategoryNames = wantedCategories.map(c => c.nameAr);

    // Get item requests (DEMAND) for this barter offer to know what initiator wants
    const initiatorItemRequests = await prisma.itemRequest.findMany({
      where: { barterOfferId: offerId },
      include: { category: { select: { nameAr: true } } },
    });

    // Build text for what the initiator is looking for
    const initiatorWantsText = initiatorItemRequests.length > 0
      ? initiatorItemRequests.map(r => r.description || r.category?.nameAr || 'سلعة').join(' أو ')
      : wantedCategoryNames.length > 0
        ? wantedCategoryNames.join(' أو ')
        : 'سلعة مقابلة';

    const notifiedUsers = new Set<string>();

    // ============================================
    // PART 1: Match my SUPPLY with others' DEMAND
    // Others want what I'm offering
    // ============================================
    console.log(`[SmartMatching] Checking who wants categories: ${offeredCategoryIds.join(', ')}`);

    // 1A. Find ItemRequests (barter demands) that match my offered items
    const matchingBarterDemands = await prisma.itemRequest.findMany({
      where: {
        OR: [
          { categoryId: { in: offeredCategoryIds } },
          { subcategoryId: { in: offeredCategoryIds } },
          { subSubcategoryId: { in: offeredCategoryIds } },
        ],
        barterOffer: {
          status: 'PENDING',
          initiatorId: { not: initiatorId },
        },
      },
      include: {
        barterOffer: {
          include: {
            initiator: { select: { id: true, fullName: true } },
          },
        },
        category: { select: { nameAr: true } },
      },
    });

    for (const demand of matchingBarterDemands) {
      const userId = demand.barterOffer.initiatorId;
      if (notifiedUsers.has(userId)) continue;
      notifiedUsers.add(userId);

      // Use description if available, otherwise category name
      const wantedItemText = demand.description || demand.category?.nameAr || 'سلعة';

      await createNotification({
        userId,
        type: 'BARTER_MATCH',
        title: '🎯 سلعة تطابق ما تبحث عنه!',
        message: `${initiatorName} يعرض ${offeredItemsText} (${offeredValueText} ج.م) - أنت تبحث عن "${wantedItemText}" للمقايضة!`,
        priority: 'HIGH',
        entityType: 'BARTER_OFFER',
        entityId: offerId,
        actionUrl: `/barter/respond/${offerId}`,
        actionText: 'عرض التفاصيل',
        metadata: {
          matchType: 'SUPPLY_TO_DEMAND',
          offerId,
          offeredItems: offeredItems.map(i => ({ id: i.id, title: i.title })),
          demandId: demand.id,
          demandDescription: demand.description,
        },
      });

      console.log(`[SmartMatching] Notified ${userId}: my supply matches their barter demand for "${wantedItemText}"`);
    }

    // 1B. Find ReverseAuctions (purchase demands) that match my offered items
    const matchingPurchaseDemands = await prisma.reverseAuction.findMany({
      where: {
        categoryId: { in: offeredCategoryIds },
        status: 'ACTIVE',
        endDate: { gt: new Date() },
        buyerId: { not: initiatorId },
      },
      include: {
        buyer: { select: { id: true, fullName: true } },
        category: { select: { nameAr: true } },
      },
    });

    for (const demand of matchingPurchaseDemands) {
      if (notifiedUsers.has(demand.buyerId)) continue;
      notifiedUsers.add(demand.buyerId);

      await createNotification({
        userId: demand.buyerId,
        type: 'ITEM_AVAILABLE',
        title: '💰 سلعة متاحة تطابق طلبك!',
        message: `${initiatorName} يعرض ${offeredItemsText} (${offeredValueText} ج.م) - يطابق طلبك "${demand.title}"!`,
        priority: 'HIGH',
        entityType: 'BARTER_OFFER',
        entityId: offerId,
        actionUrl: `/barter/respond/${offerId}`,
        actionText: 'عرض التفاصيل',
        metadata: {
          matchType: 'SUPPLY_TO_PURCHASE',
          offerId,
          auctionId: demand.id,
        },
      });

      console.log(`[SmartMatching] Notified ${demand.buyerId}: my supply matches their purchase demand`);
    }

    // ============================================
    // PART 2: Match my DEMAND with others' SUPPLY
    // Others have what I'm looking for
    // ============================================
    console.log(`[SmartMatching] Checking who has categories: ${wantedCategoryIds.join(', ')}`);

    if (wantedCategoryIds.length > 0) {
      // 2A. Find Items (supply) that match my wanted categories
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

      // Group by seller to avoid duplicate notifications
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
        const itemValue = firstItem.estimatedValue.toLocaleString('ar-EG');

        // Check if this seller also wants what I'm offering (perfect barter match!)
        const sellerAlsoWantsMyItems = await prisma.itemRequest.findFirst({
          where: {
            OR: [
              { categoryId: { in: offeredCategoryIds } },
              { subcategoryId: { in: offeredCategoryIds } },
            ],
            barterOffer: {
              status: 'PENDING',
              initiatorId: sellerId,
            },
          },
        });

        if (sellerAlsoWantsMyItems) {
          // Perfect match! Both want what the other has
          await createNotification({
            userId: sellerId,
            type: 'BARTER_MATCH',
            title: '🎯 تطابق مثالي للمقايضة!',
            message: `${initiatorName} يعرض ${offeredItemsText} (${offeredValueText} ج.م) ويبحث عن "${initiatorWantsText}" - لديك ${itemsText}! تطابق مثالي!`,
            priority: 'HIGH',
            entityType: 'BARTER_OFFER',
            entityId: offerId,
            actionUrl: `/barter/respond/${offerId}`,
            actionText: 'بدء المقايضة',
            metadata: {
              matchType: 'PERFECT_BARTER_MATCH',
              offerId,
              matchScore: 100,
              matchedItems: items.map(i => ({ id: i.id, title: i.title })),
              initiatorWants: initiatorWantsText,
            },
          });

          console.log(`[SmartMatching] Perfect match! Notified ${sellerId} - wants "${initiatorWantsText}"`);
        } else {
          // Partial match - they have what I want
          await createNotification({
            userId: sellerId,
            type: 'BARTER_MATCH',
            title: '🔄 فرصة مقايضة!',
            message: `${initiatorName} يبحث عن "${initiatorWantsText}" - لديك ${itemsText} (${itemValue} ج.م)! يعرض مقابلها: ${offeredItemsText}`,
            priority: 'MEDIUM',
            entityType: 'BARTER_OFFER',
            entityId: offerId,
            actionUrl: `/barter/respond/${offerId}`,
            actionText: 'عرض التفاصيل',
            metadata: {
              matchType: 'DEMAND_TO_SUPPLY',
              offerId,
              matchedItems: items.map(i => ({ id: i.id, title: i.title })),
              initiatorWants: initiatorWantsText,
            },
          });

          console.log(`[SmartMatching] Notified ${sellerId}: my demand for "${initiatorWantsText}" matches their supply`);
        }
      }
    }

    console.log(`[SmartMatching] Total ${notifiedUsers.size} users notified for barter offer ${offerId}`);
  } catch (error) {
    console.error('[SmartMatching] Error in notifyBarterMatches:', error);
  }
};

/**
 * When an item is listed for direct sale, match with purchase demands
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

    // Find ItemRequests (barter demands) matching this item
    const matchingBarterDemands = await prisma.itemRequest.findMany({
      where: {
        OR: [
          { categoryId: item.categoryId },
          { subcategoryId: item.categoryId },
        ],
        barterOffer: {
          status: 'PENDING',
          initiatorId: { not: sellerId },
        },
      },
      include: {
        barterOffer: {
          include: {
            initiator: { select: { id: true, fullName: true } },
          },
        },
        category: { select: { nameAr: true } },
      },
    });

    for (const demand of matchingBarterDemands) {
      if (notifiedUsers.has(demand.barterOffer.initiatorId)) continue;
      notifiedUsers.add(demand.barterOffer.initiatorId);

      // Use description if available, otherwise category name
      const wantedItemText = demand.description || demand.category?.nameAr || 'سلعة';

      await createNotification({
        userId: demand.barterOffer.initiatorId,
        type: 'ITEM_AVAILABLE',
        title: '✨ سلعة جديدة تطابق طلبك!',
        message: `"${item.title}" بسعر ${priceText} ج.م - أنت تبحث عن "${wantedItemText}"!`,
        priority: 'MEDIUM',
        entityType: 'ITEM',
        entityId: itemId,
        actionUrl: `/items/${itemId}`,
        actionText: 'عرض السلعة',
        metadata: {
          matchType: 'SALE_TO_BARTER_DEMAND',
          itemId,
          requestId: demand.id,
          demandDescription: demand.description,
        },
      });
    }

    console.log(`[SmartMatching] ${notifiedUsers.size} users notified for new sale item ${itemId}`);
  } catch (error) {
    console.error('[SmartMatching] Error in notifySaleMatches:', error);
  }
};

/**
 * When a purchase request (reverse auction) is created, match with supply
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
    const categoryName = category?.nameAr || 'سلعة';
    const budgetText = maxBudget ? `${maxBudget.toLocaleString('ar-EG')} ج.م` : 'غير محدد';
    const notifiedUsers = new Set<string>();

    // Find Items (supply) matching this demand
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
        message: `${buyerName} يبحث عن ${categoryName} "${title}" - لديك "${item.title}" (${priceText} ج.م)! الميزانية: ${budgetText}`,
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
// Item with Barter Preferences: When someone lists an item and wants something specific
// ============================================

/**
 * When an item is listed with barter preferences (wants something specific in exchange),
 * match both:
 * 1. Their SUPPLY (the item they're offering) with others' DEMAND
 * 2. Their DEMAND (what they want) with others' SUPPLY
 */
export const notifyItemWithBarterMatches = async (itemId: string, sellerId: string): Promise<void> => {
  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        category: { select: { id: true, nameAr: true } },
        desiredCategory: { select: { id: true, nameAr: true } },
        seller: { select: { fullName: true } },
      },
    });

    if (!item) return;

    const sellerName = item.seller?.fullName || 'مستخدم';
    const offeredItemText = `"${item.title}"`;
    const offeredValueText = item.estimatedValue.toLocaleString('ar-EG');

    // What they want - use desiredItemTitle if available, otherwise category
    const wantedText = item.desiredItemTitle || item.desiredCategory?.nameAr || 'سلعة للمقايضة';

    const notifiedUsers = new Set<string>();

    // PART 1: Match their SUPPLY with others' DEMAND
    // Find users with ItemRequests (from barter offers) that match this item's category
    if (item.categoryId) {
      const matchingDemands = await prisma.itemRequest.findMany({
        where: {
          OR: [
            { categoryId: item.categoryId },
            { subcategoryId: item.categoryId },
          ],
          barterOffer: {
            status: 'PENDING',
            initiatorId: { not: sellerId },
          },
        },
        include: {
          barterOffer: {
            include: {
              initiator: { select: { id: true, fullName: true } },
            },
          },
          category: { select: { nameAr: true } },
        },
      });

      for (const demand of matchingDemands) {
        const userId = demand.barterOffer.initiatorId;
        if (notifiedUsers.has(userId)) continue;
        notifiedUsers.add(userId);

        const demandText = demand.description || demand.category?.nameAr || 'سلعة';

        await createNotification({
          userId,
          type: 'BARTER_MATCH',
          title: '🎯 سلعة تطابق ما تبحث عنه!',
          message: `${sellerName} يعرض ${offeredItemText} (${offeredValueText} ج.م) - أنت تبحث عن "${demandText}"!`,
          priority: 'HIGH',
          entityType: 'ITEM',
          entityId: itemId,
          actionUrl: `/items/${itemId}`,
          actionText: 'عرض السلعة',
          metadata: {
            matchType: 'ITEM_SUPPLY_TO_BARTER_DEMAND',
            itemId,
            demandId: demand.id,
          },
        });
      }
    }

    // PART 2: Match their DEMAND with others' SUPPLY
    // Find users who have items in the desired category
    if (item.desiredCategoryId) {
      const matchingSupply = await prisma.item.findMany({
        where: {
          categoryId: item.desiredCategoryId,
          status: 'ACTIVE',
          sellerId: { not: sellerId },
        },
        include: {
          seller: { select: { id: true, fullName: true } },
          category: { select: { nameAr: true } },
        },
      });

      // Group by seller
      const sellerItems: Record<string, typeof matchingSupply> = {};
      for (const matchItem of matchingSupply) {
        if (!sellerItems[matchItem.sellerId]) {
          sellerItems[matchItem.sellerId] = [];
        }
        sellerItems[matchItem.sellerId].push(matchItem);
      }

      for (const otherSellerId of Object.keys(sellerItems)) {
        if (notifiedUsers.has(otherSellerId)) continue;
        notifiedUsers.add(otherSellerId);

        const items = sellerItems[otherSellerId];
        const firstItem = items[0];
        const itemsText = items.length > 1
          ? `"${firstItem.title}" و ${items.length - 1} سلع أخرى`
          : `"${firstItem.title}"`;

        await createNotification({
          userId: otherSellerId,
          type: 'BARTER_MATCH',
          title: '🔄 فرصة مقايضة!',
          message: `${sellerName} يبحث عن "${wantedText}" - لديك ${itemsText}! يعرض مقابلها: ${offeredItemText} (${offeredValueText} ج.م)`,
          priority: 'MEDIUM',
          entityType: 'ITEM',
          entityId: itemId,
          actionUrl: `/items/${itemId}`,
          actionText: 'عرض التفاصيل',
          metadata: {
            matchType: 'ITEM_DEMAND_TO_SUPPLY',
            itemId,
            matchedItems: items.map(i => ({ id: i.id, title: i.title })),
            wantedText,
          },
        });
      }
    }

    console.log(`[SmartMatching] ${notifiedUsers.size} users notified for item with barter prefs ${itemId}`);
  } catch (error) {
    console.error('[SmartMatching] Error in notifyItemWithBarterMatches:', error);
  }
};

// ============================================
// Initialize Event Listeners
// ============================================

export const initSmartMatchingListeners = (): void => {
  console.log('[SmartMatching] Initializing smart matching listeners...');

  // Listen for new barter offers
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

    // Check if item has barter preferences
    const hasBarterPrefs = !!(item?.desiredCategoryId || item?.desiredItemTitle);

    if (hasBarterPrefs) {
      // Item with barter preferences - match both supply and demand
      await notifyItemWithBarterMatches(payload.itemId, payload.userId);
    } else {
      // Direct sale item - only match with purchase requests
      await notifySaleMatches(payload.itemId, payload.userId);
    }
  });

  // Listen for new reverse auctions (purchase requests)
  reverseAuctionEvents.onAuctionCreated(async (payload: ReverseAuctionCreatedPayload) => {
    await notifyPurchaseRequestMatches(payload);
  });

  console.log('[SmartMatching] Smart matching listeners initialized ✅');
  console.log('[SmartMatching] SUPPLY = Items (sale, auction, barter offered)');
  console.log('[SmartMatching] DEMAND = ItemRequests (barter) + ReverseAuctions (purchase) + Item.desiredItemTitle');
};
