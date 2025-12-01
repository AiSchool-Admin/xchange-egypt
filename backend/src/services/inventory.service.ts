/**
 * Inventory Service
 *
 * Manages user inventory with Supply (selling) and Demand (buying) sides.
 * Supports goods, services, and cash items with multiple listing types.
 */

import { PrismaClient, ItemType, ItemCondition, MarketType } from '@prisma/client';
import * as proximityMatching from './proximity-matching.service';

const prisma = new PrismaClient();

// ============================================
// Helper Functions
// ============================================

/**
 * Resolve category ID - handles both UUID and slug
 * If the input looks like a UUID, use it directly
 * If it's a slug, look up the actual UUID
 */
const resolveCategoryId = async (categoryIdOrSlug: string | null | undefined): Promise<string | null> => {
  if (!categoryIdOrSlug) return null;

  // UUID pattern check (simple version)
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (uuidPattern.test(categoryIdOrSlug)) {
    // It's already a UUID, verify it exists
    const category = await prisma.category.findUnique({
      where: { id: categoryIdOrSlug },
      select: { id: true }
    });
    return category?.id || null;
  }

  // It's a slug, look up the UUID
  const category = await prisma.category.findUnique({
    where: { slug: categoryIdOrSlug },
    select: { id: true }
  });
  return category?.id || null;
};

// ============================================
// Types
// ============================================

export type InventorySide = 'SUPPLY' | 'DEMAND';
export type InventoryItemType = 'GOODS' | 'SERVICES' | 'CASH';
export type ListingType = 'DIRECT_SALE' | 'AUCTION' | 'BARTER' | 'DIRECT_BUY' | 'REVERSE_AUCTION';
export type MarketTypeValue = 'DISTRICT' | 'CITY' | 'GOVERNORATE' | 'NATIONAL';

// Market configuration - Unified fees: 25 EGP + 5% commission
// الميزة الرئيسية: المطابقة التلقائية بالقرب الجغرافي
export const MARKET_CONFIG = {
  DISTRICT: {
    id: 'DISTRICT',
    nameAr: 'سوق الحي',
    nameEn: 'District Market',
    icon: '🏘️',
    color: 'green',
    description: 'نطاق الحي - أقرب المستخدمين',
    descriptionEn: 'District scope - Nearest users',
    // Unified fees
    listingFee: 25,     // 25 ج.م
    commission: 5,      // 5%
    maxValue: null,     // بدون حد
  },
  CITY: {
    id: 'CITY',
    nameAr: 'سوق المدينة',
    nameEn: 'City Market',
    icon: '🏙️',
    color: 'blue',
    description: 'نطاق المدينة بأكملها',
    descriptionEn: 'Entire city scope',
    // Unified fees
    listingFee: 25,     // 25 ج.م
    commission: 5,      // 5%
    maxValue: null,     // بدون حد
  },
  GOVERNORATE: {
    id: 'GOVERNORATE',
    nameAr: 'سوق المحافظة',
    nameEn: 'Governorate Market',
    icon: '🗺️',
    color: 'purple',
    description: 'نطاق المحافظة بأكملها',
    descriptionEn: 'Entire governorate scope',
    // Unified fees
    listingFee: 25,     // 25 ج.م
    commission: 5,      // 5%
    maxValue: null,     // بدون حد
  },
  NATIONAL: {
    id: 'NATIONAL',
    nameAr: 'السوق الشامل',
    nameEn: 'National Market',
    icon: '🇪🇬',
    color: 'amber',
    description: 'كل مصر - 27 محافظة',
    descriptionEn: 'All Egypt - 27 governorates',
    // Unified fees
    listingFee: 25,     // 25 ج.م
    commission: 5,      // 5%
    maxValue: null,     // بدون حد
  },
};

export interface InventoryItem {
  id: string;
  userId: string;
  side: InventorySide;
  type: InventoryItemType;
  title: string;
  description: string;
  estimatedValue: number;
  listingType: ListingType;
  status: 'ACTIVE' | 'PENDING' | 'MATCHED' | 'COMPLETED' | 'CANCELLED';
  images: string[];
  categoryId?: string;
  desiredCategoryId?: string;
  desiredKeywords?: string;
  // Market & Location
  marketType: MarketTypeValue;
  governorate?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  // Auction specific
  startingBid?: number;
  auctionEndDate?: Date;
  // Stats
  viewCount: number;
  matchCount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateInventoryItemInput {
  side: InventorySide;
  type: InventoryItemType;
  title: string;
  description: string;
  estimatedValue: number;
  listingType: ListingType;
  images?: string[];
  categoryId?: string;
  desiredCategoryId?: string;
  desiredKeywords?: string;
  // Market & Location
  marketType?: MarketTypeValue;
  governorate?: string;
  city?: string;
  district?: string;
  // Auction specific
  startingBid?: number;
  auctionDurationDays?: number;
}

// ============================================
// Inventory CRUD Operations
// ============================================

/**
 * Get user's inventory items
 */
export const getUserInventory = async (
  userId: string,
  options: {
    side?: InventorySide;
    type?: InventoryItemType;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<{ items: any[]; total: number; stats: any }> => {
  const { side, type, status = 'ACTIVE', page = 1, limit = 20 } = options;

  // Build where clause - get items from Item model
  const where: any = {
    sellerId: userId,
    status: status === 'ACTIVE' ? 'ACTIVE' : status,
  };

  // For now, we'll use the existing Item model
  // The "side" concept will be derived from whether it's an item listing or a want-ad
  if (type) {
    where.itemType = type;
  }

  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.item.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        category: true,
        desiredCategory: true,
      },
    }),
    prisma.item.count({ where }),
  ]);

  // Get stats
  const stats = await prisma.item.groupBy({
    by: ['status'],
    where: { sellerId: userId },
    _count: true,
  });

  return {
    items: items.map(item => ({
      id: item.id,
      userId: item.sellerId,
      side: 'SUPPLY' as InventorySide, // Currently all items are supply-side
      type: item.itemType === 'GOOD' ? 'GOODS' : item.itemType as InventoryItemType,
      title: item.title,
      description: item.description,
      estimatedValue: item.estimatedValue,
      listingType: item.desiredCategoryId ? 'BARTER' : 'DIRECT_SALE',
      status: item.status === 'ACTIVE' ? 'ACTIVE' : item.status === 'SOLD' ? 'COMPLETED' : item.status,
      images: item.images,
      categoryId: item.categoryId,
      desiredCategoryId: item.desiredCategoryId,
      desiredKeywords: item.desiredKeywords,
      governorate: item.location,
      city: item.location,
      viewCount: item.views || 0,
      matchCount: 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    })),
    total,
    stats: {
      active: stats.find(s => s.status === 'ACTIVE')?._count || 0,
      pending: stats.find(s => s.status === 'DRAFT')?._count || 0,
      sold: stats.find(s => s.status === 'SOLD')?._count || 0,
    },
  };
};

/**
 * Get inventory stats for user
 */
export const getInventoryStats = async (userId: string) => {
  const [supplyCount, demandCount, matchedCount, completedCount] = await Promise.all([
    prisma.item.count({ where: { sellerId: userId, status: 'ACTIVE' } }),
    // For now, demand items don't exist in the schema - return 0
    Promise.resolve(0),
    prisma.barterParticipant.count({
      where: {
        userId,
        status: 'ACCEPTED',
        chain: { status: { in: ['PROPOSED', 'ACCEPTED'] } },
      },
    }),
    prisma.barterParticipant.count({
      where: {
        userId,
        status: 'COMPLETED',
        chain: { status: 'COMPLETED' },
      },
    }),
  ]);

  return {
    supply: supplyCount,
    demand: demandCount,
    matched: matchedCount,
    completed: completedCount,
  };
};

/**
 * Create inventory item
 * Routes to appropriate service based on listing type
 */
export const createInventoryItem = async (
  userId: string,
  input: CreateInventoryItemInput
): Promise<any> => {
  // For SUPPLY side with different listing types
  if (input.side === 'SUPPLY') {
    // Map type to schema enum
    const itemType = input.type === 'SERVICES' ? 'SERVICE' : input.type === 'CASH' ? 'CASH' : 'GOOD';

    // Resolve category IDs (handles both UUID and slug)
    const resolvedCategoryId = await resolveCategoryId(input.categoryId);
    const resolvedDesiredCategoryId = await resolveCategoryId(input.desiredCategoryId);

    // Create item in the existing Item model
    const item = await prisma.item.create({
      data: {
        seller: { connect: { id: userId } },
        title: input.title,
        description: input.description,
        itemType: itemType,
        estimatedValue: input.estimatedValue,
        category: resolvedCategoryId ? { connect: { id: resolvedCategoryId } } : undefined,
        desiredCategory: resolvedDesiredCategoryId ? { connect: { id: resolvedDesiredCategoryId } } : undefined,
        desiredKeywords: input.desiredKeywords || null,
        images: input.images || [],
        // Market & Location
        marketType: (input.marketType as MarketType) || 'DISTRICT',
        governorate: input.governorate || null,
        city: input.city || null,
        district: input.district || null,
        location: input.district || input.city || input.governorate || null,
        status: 'ACTIVE',
        condition: 'GOOD',
      },
      include: {
        category: true,
        desiredCategory: true,
      },
    });

    // If auction, create listing and auction
    if (input.listingType === 'AUCTION' && input.startingBid) {
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (input.auctionDurationDays || 7));

      // First create listing
      const listing = await prisma.listing.create({
        data: {
          itemId: item.id,
          userId: userId,
          listingType: 'AUCTION',
          startingBid: input.startingBid,
          currentBid: input.startingBid,
          reservePrice: input.estimatedValue,
          endDate: endDate,
          status: 'ACTIVE',
        },
      });

      // Then create auction
      await prisma.auction.create({
        data: {
          listingId: listing.id,
          startingPrice: input.startingBid,
          currentPrice: input.startingBid,
          reservePrice: input.estimatedValue,
          startTime: new Date(),
          endTime: endDate,
          status: 'ACTIVE',
        },
      });
    }

    // Trigger proximity matching asynchronously (don't wait)
    proximityMatching.processNewSupplyItem(item.id).catch(err => {
      console.error('[Inventory] Error processing proximity matching:', err);
    });

    return {
      id: item.id,
      side: 'SUPPLY',
      type: input.type,
      title: item.title,
      listingType: input.listingType,
      marketType: input.marketType || 'DISTRICT',
      status: 'ACTIVE',
      createdAt: item.createdAt,
    };
  }

  // For DEMAND side - create a want-ad/request
  // For now, we'll use BarterOffer with isOpenOffer = true
  if (input.side === 'DEMAND') {
    // Resolve category ID (handles both UUID and slug)
    const resolvedDesiredCategoryId = await resolveCategoryId(input.desiredCategoryId);

    const offer = await prisma.barterOffer.create({
      data: {
        initiator: { connect: { id: userId } },
        isOpenOffer: true,
        status: 'PENDING',
        offeredBundleValue: 0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        // Market & Location
        marketType: (input.marketType as MarketType) || 'DISTRICT',
        governorate: input.governorate || null,
        city: input.city || null,
        district: input.district || null,
        itemRequests: {
          create: {
            category: resolvedDesiredCategoryId ? { connect: { id: resolvedDesiredCategoryId } } : undefined,
            description: input.description,
            minPrice: input.estimatedValue * 0.8, // 80% of estimated
            maxPrice: input.estimatedValue * 1.2, // 120% of estimated
            keywords: input.desiredKeywords ? input.desiredKeywords.split(',').map(k => k.trim()) : [],
          },
        },
      },
    });

    // Trigger proximity matching asynchronously (don't wait)
    proximityMatching.processNewDemandItem(offer.id).catch(err => {
      console.error('[Inventory] Error processing proximity matching for demand:', err);
    });

    return {
      id: offer.id,
      side: 'DEMAND',
      type: input.type,
      title: input.title,
      listingType: input.listingType,
      marketType: input.marketType || 'DISTRICT',
      status: 'ACTIVE',
      createdAt: offer.createdAt,
    };
  }

  throw new Error('Invalid inventory side');
};

/**
 * Update inventory item status
 */
export const updateInventoryItemStatus = async (
  itemId: string,
  userId: string,
  status: string
): Promise<any> => {
  const item = await prisma.item.findFirst({
    where: { id: itemId, sellerId: userId },
  });

  if (!item) {
    throw new Error('Item not found or not owned by user');
  }

  return prisma.item.update({
    where: { id: itemId },
    data: { status: status as any },
  });
};

/**
 * Delete inventory item
 */
export const deleteInventoryItem = async (
  itemId: string,
  userId: string
): Promise<void> => {
  const item = await prisma.item.findFirst({
    where: { id: itemId, sellerId: userId },
  });

  if (!item) {
    throw new Error('Item not found or not owned by user');
  }

  // Soft delete by updating status
  await prisma.item.update({
    where: { id: itemId },
    data: { status: 'DELETED' },
  });
};

// ============================================
// Match Finding
// ============================================

/**
 * Find potential matches for an inventory item
 */
export const findMatchesForItem = async (
  itemId: string,
  userId: string
): Promise<any[]> => {
  // Import barter matching service
  const barterMatching = await import('./barter-matching.service');

  const result = await barterMatching.findMatchesForUser(userId, itemId, {
    includeCycles: true,
    maxResults: 10,
  });

  return result.cycles.map((cycle, index) => ({
    id: `match-${index}`,
    score: Math.round(cycle.averageScore * 100),
    participantCount: cycle.participants.length,
    participants: cycle.participants.map(p => ({
      userId: p.userId,
      userName: p.userName,
      itemTitle: p.itemTitle,
      itemValue: p.estimatedValue,
    })),
  }));
};

/**
 * Get latest public items for home page (no auth required)
 * Supports filtering by market type and governorate
 */
export const getLatestPublicItems = async (options: {
  limit?: number;
  marketType?: MarketTypeValue;
  governorate?: string;
} = {}): Promise<{
  supply: any[];
  demand: any[];
}> => {
  const { limit = 8, marketType, governorate } = options;

  // Build where clause for SUPPLY
  const supplyWhere: any = {
    status: 'ACTIVE',
  };
  if (marketType) {
    supplyWhere.marketType = marketType;
  }
  if (governorate) {
    supplyWhere.governorate = governorate;
  }

  // Get latest SUPPLY items (Items with ACTIVE status)
  const supplyItems = await prisma.item.findMany({
    where: supplyWhere,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      category: true,
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          governorate: true,
          city: true,
        },
      },
    },
  });

  // Build where clause for DEMAND
  const demandWhere: any = {
    isOpenOffer: true,
    status: 'PENDING',
    expiresAt: {
      gt: new Date(),
    },
  };
  if (marketType) {
    demandWhere.marketType = marketType;
  }
  if (governorate) {
    demandWhere.governorate = governorate;
  }

  // Get latest DEMAND items (Open BarterOffers with ItemRequests)
  const demandOffers = await prisma.barterOffer.findMany({
    where: demandWhere,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          governorate: true,
          city: true,
        },
      },
      itemRequests: {
        include: {
          category: true,
        },
      },
    },
  });

  return {
    supply: supplyItems.map(item => ({
      id: item.id,
      side: 'SUPPLY' as const,
      type: item.itemType === 'GOOD' ? 'GOODS' : item.itemType,
      title: item.title,
      description: item.description,
      estimatedValue: item.estimatedValue,
      images: item.images,
      category: item.category ? {
        id: item.category.id,
        nameAr: item.category.nameAr,
        nameEn: item.category.nameEn,
      } : null,
      // Market & Location
      marketType: item.marketType,
      governorate: item.governorate,
      city: item.city,
      district: item.district,
      location: item.location,
      user: {
        id: item.seller.id,
        name: item.seller.fullName,
        avatar: item.seller.avatar,
        governorate: item.seller.governorate,
        city: item.seller.city,
      },
      views: item.views,
      createdAt: item.createdAt,
    })),
    demand: demandOffers.map(offer => ({
      id: offer.id,
      side: 'DEMAND' as const,
      title: offer.itemRequests[0]?.description || 'طلب عام',
      description: offer.notes || offer.itemRequests.map(r => r.description).join(', '),
      estimatedValue: offer.itemRequests[0]?.maxPrice || 0,
      minValue: offer.itemRequests[0]?.minPrice || 0,
      maxValue: offer.itemRequests[0]?.maxPrice || 0,
      category: offer.itemRequests[0]?.category ? {
        id: offer.itemRequests[0].category.id,
        nameAr: offer.itemRequests[0].category.nameAr,
        nameEn: offer.itemRequests[0].category.nameEn,
      } : null,
      keywords: offer.itemRequests.flatMap(r => r.keywords),
      // Market & Location
      marketType: offer.marketType,
      governorate: offer.governorate,
      city: offer.city,
      district: offer.district,
      user: {
        id: offer.initiator.id,
        name: offer.initiator.fullName,
        avatar: offer.initiator.avatar,
        governorate: offer.initiator.governorate,
        city: offer.initiator.city,
      },
      expiresAt: offer.expiresAt,
      createdAt: offer.createdAt,
    })),
  };
};

export default {
  getUserInventory,
  getInventoryStats,
  createInventoryItem,
  updateInventoryItemStatus,
  deleteInventoryItem,
  findMatchesForItem,
  getLatestPublicItems,
};
