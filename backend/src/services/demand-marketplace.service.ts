/**
 * Demand Marketplace Service
 *
 * Provides a unified view of all demand-side items:
 * 1. Barter ItemRequests - Items users want in exchange for barter
 * 2. ReverseAuctions - Items users want to buy via reverse bidding
 * 3. Direct Purchase Requests - Items users want to buy directly
 *
 * This enables smart matching between Supply and Demand sides:
 *
 * SUPPLY SIDE:
 * - Direct Sale (البيع المباشر)
 * - Auction (المزايدة)
 * - Barter Offer (المقايضة)
 *
 * DEMAND SIDE:
 * - Direct Purchase Request (طلب الشراء المباشر)
 * - Reverse Auction (المناقصة/المزايدة العكسية)
 * - Barter Wanted Item (الصنف المطلوب مقايضته)
 */

import prisma from '../lib/prisma';
import { itemEvents, ItemCreatedPayload } from '../events/item.events';
import { barterEvents, BarterItemRequestCreatedPayload } from '../events/barter.events';
import { reverseAuctionEvents, ReverseAuctionCreatedPayload } from '../events/reverse-auction.events';
import { createNotification } from './notification.service';

// ============================================
// Types
// ============================================

export type DemandType = 'BARTER_REQUEST' | 'REVERSE_AUCTION' | 'PURCHASE_REQUEST';

export interface DemandItem {
  id: string;
  type: DemandType;
  userId: string;
  userName?: string;
  title: string;
  description: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subSubcategoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  keywords?: string[];
  governorate?: string;
  city?: string;
  district?: string;
  marketType?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  // Additional fields based on type
  barterOfferId?: string; // For BARTER_REQUEST
  reverseAuctionId?: string; // For REVERSE_AUCTION
  lowestBid?: number; // For REVERSE_AUCTION
  endDate?: Date; // For REVERSE_AUCTION
}

export interface DemandSearchParams {
  categoryId?: string;
  subcategoryId?: string;
  subSubcategoryId?: string;
  governorate?: string;
  city?: string;
  district?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string;
  keywords?: string;
  type?: DemandType;
  excludeUserId?: string;
  page?: number;
  limit?: number;
}

// ============================================
// Public Demand Marketplace
// ============================================

/**
 * Get all public demand items (barter requests + reverse auctions)
 */
export const getPublicDemandItems = async (
  params: DemandSearchParams = {}
): Promise<{ items: DemandItem[]; total: number }> => {
  const {
    categoryId,
    subcategoryId,
    subSubcategoryId,
    governorate,
    city,
    district,
    minPrice,
    maxPrice,
    condition,
    keywords,
    type,
    excludeUserId,
    page = 1,
    limit = 20,
  } = params;

  const allItems: DemandItem[] = [];

  // ============================================
  // 1. Get Barter ItemRequests (public open offers)
  // ============================================
  if (!type || type === 'BARTER_REQUEST') {
    const barterWhere: any = {
      barterOffer: {
        isOpenOffer: true,
        status: 'PENDING',
        ...(excludeUserId && { initiatorId: { not: excludeUserId } }),
        ...(governorate && { governorate }),
        ...(city && { city }),
        ...(district && { district }),
      },
    };

    // Category filters
    if (categoryId) barterWhere.categoryId = categoryId;
    if (subcategoryId) barterWhere.subcategoryId = subcategoryId;
    if (subSubcategoryId) barterWhere.subSubcategoryId = subSubcategoryId;

    // Price range
    if (minPrice !== undefined) barterWhere.maxPrice = { gte: minPrice };
    if (maxPrice !== undefined) barterWhere.minPrice = { lte: maxPrice };

    // Condition
    if (condition) barterWhere.condition = condition;

    // Keywords search
    if (keywords) {
      barterWhere.OR = [
        { description: { contains: keywords, mode: 'insensitive' } },
        { keywords: { hasSome: keywords.split(' ') } },
      ];
    }

    const barterRequests = await prisma.itemRequest.findMany({
      where: barterWhere,
      include: {
        barterOffer: {
          include: {
            initiator: {
              select: { id: true, fullName: true },
            },
          },
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedBarter: DemandItem[] = barterRequests.map(req => ({
      id: req.id,
      type: 'BARTER_REQUEST' as DemandType,
      userId: req.barterOffer.initiatorId,
      userName: req.barterOffer.initiator.fullName,
      title: req.description?.substring(0, 100) || 'طلب مقايضة',
      description: req.description,
      categoryId: req.categoryId || undefined,
      categoryName: req.category?.nameAr,
      subcategoryId: req.subcategoryId || undefined,
      subSubcategoryId: req.subSubcategoryId || undefined,
      minPrice: req.minPrice || undefined,
      maxPrice: req.maxPrice || undefined,
      condition: req.condition || undefined,
      keywords: req.keywords || [],
      governorate: req.barterOffer.governorate || undefined,
      city: req.barterOffer.city || undefined,
      district: req.barterOffer.district || undefined,
      marketType: req.barterOffer.marketType,
      status: 'ACTIVE',
      createdAt: req.createdAt,
      updatedAt: req.createdAt,
      barterOfferId: req.barterOfferId,
    }));

    allItems.push(...mappedBarter);
  }

  // ============================================
  // 2. Get Reverse Auctions
  // ============================================
  if (!type || type === 'REVERSE_AUCTION') {
    const reverseWhere: any = {
      status: 'ACTIVE',
      endDate: { gt: new Date() },
      ...(excludeUserId && { buyerId: { not: excludeUserId } }),
    };

    // Location filter (ReverseAuction uses 'location' field)
    if (governorate || city || district) {
      const locationSearch = [governorate, city, district].filter(Boolean).join(' ');
      reverseWhere.location = { contains: locationSearch, mode: 'insensitive' };
    }

    // Category filter
    if (categoryId) reverseWhere.categoryId = categoryId;

    // Price range (use maxBudget)
    if (minPrice !== undefined) reverseWhere.maxBudget = { gte: minPrice };
    if (maxPrice !== undefined) {
      reverseWhere.OR = [
        { targetPrice: { lte: maxPrice } },
        { maxBudget: { lte: maxPrice } },
      ];
    }

    // Condition
    if (condition) reverseWhere.condition = condition;

    // Keywords search
    if (keywords) {
      reverseWhere.OR = [
        { title: { contains: keywords, mode: 'insensitive' } },
        { description: { contains: keywords, mode: 'insensitive' } },
      ];
    }

    const reverseAuctions = await prisma.reverseAuction.findMany({
      where: reverseWhere,
      include: {
        buyer: {
          select: { id: true, fullName: true },
        },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const mappedReverse: DemandItem[] = reverseAuctions.map(auction => ({
      id: auction.id,
      type: 'REVERSE_AUCTION' as DemandType,
      userId: auction.buyerId,
      userName: auction.buyer.fullName,
      title: auction.title,
      description: auction.description || '',
      categoryId: auction.categoryId,
      categoryName: auction.category?.nameAr,
      minPrice: auction.targetPrice || undefined,
      maxPrice: auction.maxBudget || undefined,
      condition: auction.condition || undefined,
      keywords: [],
      governorate: auction.location || undefined, // ReverseAuction uses location field
      status: auction.status,
      createdAt: auction.startDate,
      updatedAt: auction.updatedAt || auction.startDate,
      reverseAuctionId: auction.id,
      lowestBid: auction.lowestBid || undefined,
      endDate: auction.endDate,
    }));

    allItems.push(...mappedReverse);
  }

  // Sort by creation date
  allItems.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  // Pagination
  const total = allItems.length;
  const start = (page - 1) * limit;
  const paginatedItems = allItems.slice(start, start + limit);

  return { items: paginatedItems, total };
};

// ============================================
// Smart Matching Functions
// ============================================

/**
 * Find matching supply items for a demand item
 */
export const findMatchingSupplyItems = async (
  demandItem: DemandItem,
  limit: number = 10
): Promise<any[]> => {
  const where: any = {
    status: 'ACTIVE',
    sellerId: { not: demandItem.userId },
  };

  // Category matching
  if (demandItem.categoryId) {
    where.OR = [
      { categoryId: demandItem.categoryId },
      { category: { parentId: demandItem.categoryId } },
    ];
  }

  // Price matching
  if (demandItem.maxPrice) {
    where.estimatedValue = { lte: demandItem.maxPrice };
  }
  if (demandItem.minPrice) {
    where.estimatedValue = { gte: demandItem.minPrice };
  }

  // Condition matching
  if (demandItem.condition) {
    where.condition = demandItem.condition;
  }

  // Location matching
  if (demandItem.governorate) {
    where.governorate = demandItem.governorate;
  }

  const matchingItems = await prisma.item.findMany({
    where,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      seller: {
        select: { id: true, fullName: true },
      },
    },
  });

  return matchingItems;
};

/**
 * Find matching demand items for a supply item
 */
export const findMatchingDemandItems = async (
  supplyItem: {
    id: string;
    sellerId: string;
    categoryId?: string;
    estimatedValue: number;
    condition?: string;
    governorate?: string;
  },
  limit: number = 10
): Promise<DemandItem[]> => {
  const { items } = await getPublicDemandItems({
    categoryId: supplyItem.categoryId,
    minPrice: supplyItem.estimatedValue * 0.8, // 20% tolerance
    maxPrice: supplyItem.estimatedValue * 1.2,
    condition: supplyItem.condition,
    governorate: supplyItem.governorate,
    excludeUserId: supplyItem.sellerId,
    limit,
  });

  return items;
};

// ============================================
// Notification Integration
// ============================================

/**
 * Notify users with matching demand when new supply item is created
 */
export const notifyMatchingDemandUsers = async (
  supplyItem: {
    id: string;
    title: string;
    sellerId: string;
    categoryId?: string;
    estimatedValue: number;
    condition?: string;
    governorate?: string;
    listingType: string;
  }
): Promise<void> => {
  const matchingDemands = await findMatchingDemandItems(supplyItem, 50);

  const notifiedUsers = new Set<string>();

  for (const demand of matchingDemands) {
    if (notifiedUsers.has(demand.userId)) continue;
    notifiedUsers.add(demand.userId);

    let message = '';
    let actionUrl = '';

    switch (demand.type) {
      case 'BARTER_REQUEST':
        message = `سلعة جديدة "${supplyItem.title}" تطابق ما تبحث عنه للمقايضة!`;
        actionUrl = `/items/${supplyItem.id}`;
        break;
      case 'REVERSE_AUCTION':
        message = `سلعة جديدة "${supplyItem.title}" تطابق طلبك في المناقصة!`;
        actionUrl = `/reverse-auctions/${demand.reverseAuctionId}`;
        break;
      default:
        message = `سلعة جديدة "${supplyItem.title}" تطابق اهتماماتك!`;
        actionUrl = `/items/${supplyItem.id}`;
    }

    await createNotification({
      userId: demand.userId,
      type: 'SMART_MATCH_FOUND',
      title: 'تطابق جديد!',
      message,
      metadata: {
        supplyItemId: supplyItem.id,
        demandItemId: demand.id,
        demandType: demand.type,
        matchType: 'SUPPLY_MATCHES_DEMAND',
      },
      actionUrl,
    });
  }
};

/**
 * Notify users with matching supply when new demand item is created
 */
export const notifyMatchingSupplyUsers = async (
  demandItem: DemandItem
): Promise<void> => {
  const matchingSupply = await findMatchingSupplyItems(demandItem, 50);

  const notifiedUsers = new Set<string>();

  for (const supply of matchingSupply) {
    if (notifiedUsers.has(supply.sellerId)) continue;
    notifiedUsers.add(supply.sellerId);

    let message = '';

    switch (demandItem.type) {
      case 'BARTER_REQUEST':
        message = `مستخدم يبحث عن سلعة تشبه "${supply.title}" للمقايضة!`;
        break;
      case 'REVERSE_AUCTION':
        message = `مناقصة جديدة تطابق سلعتك "${supply.title}"!`;
        break;
      default:
        message = `طلب جديد يطابق سلعتك "${supply.title}"!`;
    }

    await createNotification({
      userId: supply.sellerId,
      type: 'SMART_MATCH_FOUND',
      title: 'فرصة جديدة!',
      message,
      metadata: {
        supplyItemId: supply.id,
        demandItemId: demandItem.id,
        demandType: demandItem.type,
        matchType: 'DEMAND_MATCHES_SUPPLY',
      },
      actionUrl: demandItem.type === 'REVERSE_AUCTION'
        ? `/reverse-auctions/${demandItem.reverseAuctionId}`
        : `/barter/${demandItem.barterOfferId}`,
    });
  }
};

// ============================================
// Event Listeners for Smart Matching
// ============================================

/**
 * Initialize demand marketplace event listeners
 */
export const initDemandMarketplaceListeners = (): void => {
  // Listen for new items (supply side)
  itemEvents.onItemCreated(async (payload: ItemCreatedPayload) => {
    try {
      // Get full item details
      const item = await prisma.item.findUnique({
        where: { id: payload.itemId },
        include: { category: true },
      });

      if (!item) return;

      await notifyMatchingDemandUsers({
        id: item.id,
        title: item.title,
        sellerId: item.sellerId,
        categoryId: item.categoryId || undefined,
        estimatedValue: item.estimatedValue,
        condition: item.condition || undefined,
        governorate: item.governorate || undefined,
        listingType: item.desiredCategoryId ? 'BARTER' : 'DIRECT_SALE',
      });
    } catch (error) {
      console.error('Error notifying matching demand users:', error);
    }
  });

  // Listen for new barter item requests (demand side)
  barterEvents.onItemRequestCreated(async (payload: BarterItemRequestCreatedPayload) => {
    try {
      const demandItem: DemandItem = {
        id: payload.requestId,
        type: 'BARTER_REQUEST',
        userId: payload.initiatorId,
        title: payload.description?.substring(0, 100) || 'طلب مقايضة',
        description: payload.description,
        categoryId: payload.categoryId,
        subcategoryId: payload.subcategoryId,
        subSubcategoryId: payload.subSubcategoryId,
        minPrice: payload.minPrice,
        maxPrice: payload.maxPrice,
        condition: payload.condition,
        keywords: payload.keywords || [],
        governorate: payload.governorate,
        status: 'ACTIVE',
        createdAt: payload.timestamp,
        updatedAt: payload.timestamp,
        barterOfferId: payload.offerId,
      };

      await notifyMatchingSupplyUsers(demandItem);
    } catch (error) {
      console.error('Error notifying matching supply users for barter:', error);
    }
  });

  // Listen for new reverse auctions (demand side)
  reverseAuctionEvents.onAuctionCreated(async (payload: ReverseAuctionCreatedPayload) => {
    try {
      const demandItem: DemandItem = {
        id: payload.auctionId,
        type: 'REVERSE_AUCTION',
        userId: payload.buyerId,
        title: payload.title,
        description: payload.description || '',
        categoryId: payload.categoryId,
        minPrice: payload.targetPrice,
        maxPrice: payload.maxBudget,
        condition: payload.condition,
        keywords: [],
        governorate: payload.governorate,
        city: payload.city,
        district: payload.district,
        marketType: payload.marketType,
        status: 'ACTIVE',
        createdAt: payload.startDate,
        updatedAt: payload.startDate,
        reverseAuctionId: payload.auctionId,
        endDate: payload.endDate,
      };

      await notifyMatchingSupplyUsers(demandItem);
    } catch (error) {
      console.error('Error notifying matching supply users for reverse auction:', error);
    }
  });

  console.log('✅ Demand marketplace listeners initialized');
};

// ============================================
// Export for API routes
// ============================================

export default {
  getPublicDemandItems,
  findMatchingSupplyItems,
  findMatchingDemandItems,
  notifyMatchingDemandUsers,
  notifyMatchingSupplyUsers,
  initDemandMarketplaceListeners,
};
