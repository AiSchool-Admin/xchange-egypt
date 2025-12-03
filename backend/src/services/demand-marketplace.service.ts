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
import { createNotification } from './notification.service';

// NOTE: Event listeners have been moved to smart-matching.service.ts
// The imports below are kept for backward compatibility with notification functions

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

  const itemValue = supplyItem.estimatedValue.toLocaleString('ar-EG');

  for (const demand of matchingDemands) {
    if (notifiedUsers.has(demand.userId)) continue;
    notifiedUsers.add(demand.userId);

    let message = '';
    let actionUrl = '';
    let title = '';

    switch (demand.type) {
      case 'BARTER_REQUEST':
        title = '🔄 تطابق مقايضة جديد!';
        message = `سلعة "${supplyItem.title}" بقيمة ${itemValue} ج.م متاحة للمقايضة وتطابق طلبك!`;
        actionUrl = `/items/${supplyItem.id}`;
        break;
      case 'REVERSE_AUCTION':
        title = '📢 عرض يطابق مناقصتك!';
        message = `سلعة "${supplyItem.title}" بقيمة ${itemValue} ج.م تطابق طلبك في المناقصة!`;
        actionUrl = `/reverse-auctions/${demand.reverseAuctionId}`;
        break;
      default:
        title = '✨ سلعة تطابق اهتماماتك!';
        message = `سلعة "${supplyItem.title}" بقيمة ${itemValue} ج.م تطابق ما تبحث عنه!`;
        actionUrl = `/items/${supplyItem.id}`;
    }

    await createNotification({
      userId: demand.userId,
      type: 'SMART_MATCH_FOUND',
      title,
      message,
      metadata: {
        supplyItemId: supplyItem.id,
        supplyItemTitle: supplyItem.title,
        supplyItemValue: supplyItem.estimatedValue,
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

  const demandBudget = demandItem.maxPrice
    ? demandItem.maxPrice.toLocaleString('ar-EG')
    : null;

  for (const supply of matchingSupply) {
    if (notifiedUsers.has(supply.sellerId)) continue;
    notifiedUsers.add(supply.sellerId);

    let message = '';
    let title = '';
    const supplyValue = supply.estimatedValue.toLocaleString('ar-EG');

    switch (demandItem.type) {
      case 'BARTER_REQUEST':
        title = '🔄 فرصة مقايضة جديدة!';
        message = demandBudget
          ? `مستخدم يبحث عن سلعة تشبه "${supply.title}" (${supplyValue} ج.م) للمقايضة - ميزانيته حتى ${demandBudget} ج.م`
          : `مستخدم يبحث عن سلعة تشبه "${supply.title}" (${supplyValue} ج.م) للمقايضة!`;
        break;
      case 'REVERSE_AUCTION':
        title = '📢 مناقصة تطابق سلعتك!';
        message = demandBudget
          ? `مناقصة جديدة تطابق سلعتك "${supply.title}" (${supplyValue} ج.م) - الميزانية حتى ${demandBudget} ج.م`
          : `مناقصة جديدة تطابق سلعتك "${supply.title}" (${supplyValue} ج.م)!`;
        break;
      default:
        title = '✨ طلب جديد يطابق سلعتك!';
        message = demandBudget
          ? `طلب جديد يطابق سلعتك "${supply.title}" (${supplyValue} ج.م) - الميزانية حتى ${demandBudget} ج.م`
          : `طلب جديد يطابق سلعتك "${supply.title}" (${supplyValue} ج.م)!`;
    }

    await createNotification({
      userId: supply.sellerId,
      type: 'SMART_MATCH_FOUND',
      title,
      message,
      metadata: {
        supplyItemId: supply.id,
        supplyItemTitle: supply.title,
        supplyItemValue: supply.estimatedValue,
        demandItemId: demandItem.id,
        demandType: demandItem.type,
        demandBudget: demandItem.maxPrice,
        matchType: 'DEMAND_MATCHES_SUPPLY',
      },
      actionUrl: demandItem.type === 'REVERSE_AUCTION'
        ? `/reverse-auctions/${demandItem.reverseAuctionId}`
        : `/barter/respond/${demandItem.barterOfferId}`,
    });
  }
};

// ============================================
// Event Listeners - DISABLED
// ============================================

/**
 * Initialize demand marketplace event listeners
 *
 * NOTE: Notification listeners have been moved to smart-matching.service.ts
 * to avoid duplicate notifications. This function is kept for backwards
 * compatibility but does nothing.
 */
export const initDemandMarketplaceListeners = (): void => {
  // Notification listeners are now handled by smart-matching.service.ts
  // This function is kept for backwards compatibility
  console.log('[DemandMarketplace] Listeners disabled - using smart-matching.service.ts instead');
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
