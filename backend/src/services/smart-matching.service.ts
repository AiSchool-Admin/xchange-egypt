/**
 * Smart Matching Notification Service
 *
 * This is the ONLY service that handles supply-demand matching notifications.
 * Consolidates all matching logic into one place.
 *
 * SCENARIOS:
 * 1. New barter offer created → Notify users who have matching items OR want matching items
 * 2. New item listed for sale → Notify users with matching purchase requests
 * 3. New purchase request (reverse auction) → Notify users with matching items for sale
 *
 * MATCHING LOGIC:
 * - Barter: Match offered item category with wanted item category
 * - Sale: Match item category with purchase requests
 * - Purchase: Match request category with available items
 */

import prisma from '../lib/prisma';
import { createNotification } from './notification.service';
import { itemEvents, ItemCreatedPayload } from '../events/item.events';
import { barterEvents, BarterOfferCreatedPayload, BarterItemRequestCreatedPayload } from '../events/barter.events';
import { reverseAuctionEvents, ReverseAuctionCreatedPayload } from '../events/reverse-auction.events';

// ============================================
// Types
// ============================================

interface MatchedUser {
  userId: string;
  reason: string;
  actionUrl: string;
  matchType: 'BARTER_MATCH' | 'SALE_MATCH' | 'PURCHASE_MATCH';
  metadata: Record<string, any>;
}

// ============================================
// Barter Matching: When someone offers an item for barter
// ============================================

/**
 * When a new barter offer is created, notify users who:
 * 1. Have items matching what the offerer wants (by category)
 * 2. Want items matching what the offerer has (by category)
 */
export const notifyBarterMatches = async (
  offerId: string,
  initiatorId: string,
  offeredItemIds: string[],
  wantedCategories: string[]
): Promise<void> => {
  try {
    // Get details of offered items
    const offeredItems = await prisma.item.findMany({
      where: { id: { in: offeredItemIds } },
      include: { category: true },
    });

    if (offeredItems.length === 0) return;

    const offeredItemsText = offeredItems.map(i => `"${i.title}"`).join(' و ');
    const offeredValue = offeredItems.reduce((sum, i) => sum + i.estimatedValue, 0);
    const offeredValueText = offeredValue.toLocaleString('ar-EG');
    const offeredCategoryIds = offeredItems.map(i => i.categoryId).filter(Boolean) as string[];

    // Get initiator name
    const initiator = await prisma.user.findUnique({
      where: { id: initiatorId },
      select: { fullName: true },
    });
    const initiatorName = initiator?.fullName || 'مستخدم';

    // Get wanted category names
    const wantedCategoriesData = await prisma.category.findMany({
      where: { id: { in: wantedCategories } },
      select: { id: true, nameAr: true },
    });
    const wantedCategoryNames = wantedCategoriesData.map(c => c.nameAr);
    const wantedText = wantedCategoryNames.length > 0
      ? wantedCategoryNames.join(' أو ')
      : 'سلعة مقابلة';

    const matchedUsers: MatchedUser[] = [];

    // 1. Find users who HAVE items in the wanted categories
    // These users could trade with the offerer
    if (wantedCategories.length > 0) {
      const usersWithWantedItems = await prisma.item.findMany({
        where: {
          categoryId: { in: wantedCategories },
          sellerId: { not: initiatorId },
          status: 'ACTIVE',
        },
        include: {
          seller: { select: { id: true, fullName: true } },
          category: { select: { nameAr: true } },
        },
        distinct: ['sellerId'],
      });

      for (const item of usersWithWantedItems) {
        // Check if this user also wants what the offerer has
        const userAlsoWantsOfferedItem = await prisma.item.findFirst({
          where: {
            sellerId: item.sellerId,
            desiredCategoryId: { in: offeredCategoryIds },
            status: 'ACTIVE',
          },
        });

        if (userAlsoWantsOfferedItem) {
          // Perfect match! Both want what the other has
          matchedUsers.push({
            userId: item.sellerId,
            reason: `🎯 تطابق مثالي للمقايضة! ${initiatorName} يعرض ${offeredItemsText} (${offeredValueText} ج.م) ويبحث عن ${item.category?.nameAr} - لديك "${item.title}"!`,
            actionUrl: `/barter/respond/${offerId}`,
            matchType: 'BARTER_MATCH',
            metadata: {
              offerId,
              offeredItems: offeredItems.map(i => ({ id: i.id, title: i.title })),
              matchedItemId: item.id,
              matchedItemTitle: item.title,
              matchScore: 100,
            },
          });
        } else {
          // Partial match - user has what offerer wants
          matchedUsers.push({
            userId: item.sellerId,
            reason: `🔄 فرصة مقايضة! ${initiatorName} يبحث عن ${item.category?.nameAr} - لديك "${item.title}"! يعرض مقابلها ${offeredItemsText} (${offeredValueText} ج.م)`,
            actionUrl: `/barter/respond/${offerId}`,
            matchType: 'BARTER_MATCH',
            metadata: {
              offerId,
              offeredItems: offeredItems.map(i => ({ id: i.id, title: i.title })),
              matchedItemId: item.id,
              matchedItemTitle: item.title,
              matchScore: 75,
            },
          });
        }
      }
    }

    // 2. Find users who WANT what the offerer has (via desiredCategoryId)
    const usersWantingOfferedItems = await prisma.item.findMany({
      where: {
        desiredCategoryId: { in: offeredCategoryIds },
        sellerId: { not: initiatorId },
        status: 'ACTIVE',
      },
      include: {
        seller: { select: { id: true, fullName: true } },
        category: { select: { nameAr: true } },
        desiredCategory: { select: { nameAr: true } },
      },
      distinct: ['sellerId'],
    });

    for (const item of usersWantingOfferedItems) {
      // Skip if already notified
      if (matchedUsers.some(m => m.userId === item.sellerId)) continue;

      matchedUsers.push({
        userId: item.sellerId,
        reason: `🔄 سلعة تطابق ما تبحث عنه! ${initiatorName} يعرض ${offeredItemsText} (${offeredValueText} ج.م) - أنت تبحث عن ${item.desiredCategory?.nameAr}!`,
        actionUrl: `/barter/respond/${offerId}`,
        matchType: 'BARTER_MATCH',
        metadata: {
          offerId,
          offeredItems: offeredItems.map(i => ({ id: i.id, title: i.title })),
          userItemId: item.id,
          matchScore: 80,
        },
      });
    }

    // 3. Find users with ItemRequests matching offered items
    const matchingRequests = await prisma.itemRequest.findMany({
      where: {
        OR: [
          { categoryId: { in: offeredCategoryIds } },
          { subcategoryId: { in: offeredCategoryIds } },
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

    for (const request of matchingRequests) {
      // Skip if already notified
      if (matchedUsers.some(m => m.userId === request.barterOffer.initiatorId)) continue;

      matchedUsers.push({
        userId: request.barterOffer.initiatorId,
        reason: `🔄 سلعة تطابق طلبك! ${initiatorName} يعرض ${offeredItemsText} (${offeredValueText} ج.م) - يطابق طلبك في ${request.category?.nameAr || 'المقايضة'}!`,
        actionUrl: `/barter/respond/${offerId}`,
        matchType: 'BARTER_MATCH',
        metadata: {
          offerId,
          offeredItems: offeredItems.map(i => ({ id: i.id, title: i.title })),
          requestId: request.id,
          matchScore: 70,
        },
      });
    }

    // Send notifications
    for (const match of matchedUsers) {
      await createNotification({
        userId: match.userId,
        type: 'BARTER_MATCH',
        title: '🔄 فرصة مقايضة جديدة!',
        message: match.reason,
        priority: 'HIGH',
        entityType: 'BARTER_OFFER',
        entityId: offerId,
        actionUrl: match.actionUrl,
        actionText: 'عرض التفاصيل',
        metadata: match.metadata,
      });
    }

    console.log(`[SmartMatching] Sent ${matchedUsers.length} barter match notifications for offer ${offerId}`);
  } catch (error) {
    console.error('[SmartMatching] Error in notifyBarterMatches:', error);
  }
};

// ============================================
// Sale Matching: When someone lists an item for direct sale
// ============================================

/**
 * When a new item is listed for sale, notify users who:
 * 1. Have purchase requests (reverse auctions) for this category
 * 2. Have barter item requests for this category
 */
export const notifySaleMatches = async (
  itemId: string,
  sellerId: string
): Promise<void> => {
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

    const matchedUsers: MatchedUser[] = [];

    // 1. Find users with active reverse auctions in this category
    const matchingAuctions = await prisma.reverseAuction.findMany({
      where: {
        categoryId: item.categoryId,
        status: 'ACTIVE',
        endDate: { gt: new Date() },
        buyerId: { not: sellerId },
        OR: [
          { maxBudget: { gte: item.estimatedValue } },
          { maxBudget: null }, // No budget limit
        ],
      },
      include: {
        buyer: { select: { id: true, fullName: true } },
        category: { select: { nameAr: true } },
      },
    });

    for (const auction of matchingAuctions) {
      matchedUsers.push({
        userId: auction.buyerId,
        reason: `💰 سلعة تطابق طلبك! "${item.title}" متاحة الآن بسعر ${priceText} ج.م - تطابق طلبك "${auction.title}"!`,
        actionUrl: `/items/${itemId}`,
        matchType: 'SALE_MATCH',
        metadata: {
          itemId,
          itemTitle: item.title,
          itemPrice: item.estimatedValue,
          auctionId: auction.id,
          auctionTitle: auction.title,
        },
      });
    }

    // 2. Find users with barter item requests in this category
    const matchingBarterRequests = await prisma.itemRequest.findMany({
      where: {
        AND: [
          {
            OR: [
              { categoryId: item.categoryId },
              { subcategoryId: item.categoryId },
            ],
          },
          {
            OR: [
              { maxPrice: { gte: item.estimatedValue } },
              { maxPrice: null },
            ],
          },
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

    for (const request of matchingBarterRequests) {
      if (matchedUsers.some(m => m.userId === request.barterOffer.initiatorId)) continue;

      matchedUsers.push({
        userId: request.barterOffer.initiatorId,
        reason: `✨ سلعة جديدة تطابق اهتماماتك! "${item.title}" بسعر ${priceText} ج.م في ${item.category?.nameAr}!`,
        actionUrl: `/items/${itemId}`,
        matchType: 'SALE_MATCH',
        metadata: {
          itemId,
          itemTitle: item.title,
          itemPrice: item.estimatedValue,
          requestId: request.id,
        },
      });
    }

    // Send notifications
    for (const match of matchedUsers) {
      await createNotification({
        userId: match.userId,
        type: 'ITEM_AVAILABLE',
        title: '💰 سلعة متاحة للشراء!',
        message: match.reason,
        priority: 'MEDIUM',
        entityType: 'ITEM',
        entityId: itemId,
        actionUrl: match.actionUrl,
        actionText: 'عرض السلعة',
        metadata: match.metadata,
      });
    }

    console.log(`[SmartMatching] Sent ${matchedUsers.length} sale match notifications for item ${itemId}`);
  } catch (error) {
    console.error('[SmartMatching] Error in notifySaleMatches:', error);
  }
};

// ============================================
// Purchase Request Matching: When someone creates a purchase request
// ============================================

/**
 * When a new purchase request (reverse auction) is created, notify users who:
 * 1. Have items for sale in this category
 * 2. Have items for barter in this category
 */
export const notifyPurchaseRequestMatches = async (
  requestId: string,
  buyerId: string,
  categoryId: string,
  title: string,
  maxBudget?: number
): Promise<void> => {
  try {
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

    const matchedUsers: MatchedUser[] = [];

    // Find users with items in this category
    const matchingItems = await prisma.item.findMany({
      where: {
        categoryId,
        status: 'ACTIVE',
        sellerId: { not: buyerId },
        ...(maxBudget && { estimatedValue: { lte: maxBudget * 1.2 } }), // 20% tolerance
      },
      include: {
        seller: { select: { id: true, fullName: true } },
        category: { select: { nameAr: true } },
      },
    });

    for (const item of matchingItems) {
      const priceText = item.estimatedValue.toLocaleString('ar-EG');
      matchedUsers.push({
        userId: item.sellerId,
        reason: `🛒 مشتري محتمل! ${buyerName} يبحث عن ${categoryName} "${title}" - لديك "${item.title}" (${priceText} ج.م)! الميزانية: ${budgetText}`,
        actionUrl: `/reverse-auctions/${requestId}`,
        matchType: 'PURCHASE_MATCH',
        metadata: {
          requestId,
          requestTitle: title,
          itemId: item.id,
          itemTitle: item.title,
          itemPrice: item.estimatedValue,
          buyerBudget: maxBudget,
        },
      });
    }

    // Send notifications
    for (const match of matchedUsers) {
      await createNotification({
        userId: match.userId,
        type: 'PURCHASE_REQUEST_MATCH',
        title: '🛒 مشتري محتمل لسلعتك!',
        message: match.reason,
        priority: 'HIGH',
        entityType: 'REVERSE_AUCTION',
        entityId: requestId,
        actionUrl: match.actionUrl,
        actionText: 'تقديم عرض',
        metadata: match.metadata,
      });
    }

    console.log(`[SmartMatching] Sent ${matchedUsers.length} purchase request notifications`);
  } catch (error) {
    console.error('[SmartMatching] Error in notifyPurchaseRequestMatches:', error);
  }
};

// ============================================
// Initialize Event Listeners
// ============================================

export const initSmartMatchingListeners = (): void => {
  console.log('[SmartMatching] Initializing smart matching listeners...');

  // Listen for new barter offers
  barterEvents.onOfferCreated(async (payload: BarterOfferCreatedPayload) => {
    if (!payload.isOpenOffer) return; // Only match open offers

    await notifyBarterMatches(
      payload.offerId,
      payload.initiatorId,
      payload.offeredItemIds,
      payload.categoryIds
    );
  });

  // Listen for new items (check if barter or sale)
  itemEvents.onItemCreated(async (payload: ItemCreatedPayload) => {
    // Get item details
    const item = await prisma.item.findUnique({
      where: { id: payload.itemId },
      select: { desiredCategoryId: true },
    });

    if (item?.desiredCategoryId) {
      // Item is for barter - matching is handled by barter offer creation
      return;
    }

    // Item is for direct sale
    await notifySaleMatches(payload.itemId, payload.userId);
  });

  // Listen for new reverse auctions
  reverseAuctionEvents.onAuctionCreated(async (payload: ReverseAuctionCreatedPayload) => {
    await notifyPurchaseRequestMatches(
      payload.auctionId,
      payload.buyerId,
      payload.categoryId,
      payload.title,
      payload.maxBudget
    );
  });

  console.log('[SmartMatching] Smart matching listeners initialized ✅');
};
