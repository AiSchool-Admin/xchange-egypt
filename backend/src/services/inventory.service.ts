import logger from '../lib/logger';
/**
 * Inventory Service
 *
 * Manages user inventory with Supply (selling) and Demand (buying) sides.
 * Supports goods, services, and cash items with multiple listing types.
 */

import { ItemType, ItemCondition, MarketType } from '../types/prisma-enums';
import prisma from '../lib/prisma';
import * as proximityMatching from './proximity-matching.service';
import { notifyDirectPurchaseMatches } from './smart-matching.service';
import { itemEvents } from '../events/item.events';

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
export type ItemConditionValue = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

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
  // Barter preferences - What user wants in exchange
  desiredItemTitle?: string;
  desiredItemDescription?: string;
  desiredCategoryId?: string;
  desiredKeywords?: string;
  desiredValueMin?: number;
  desiredValueMax?: number;
  // Item condition
  condition?: ItemConditionValue;
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

// Helper to determine side from listingType
const SUPPLY_LISTING_TYPES: ('DIRECT_SALE' | 'AUCTION' | 'BARTER')[] = ['DIRECT_SALE', 'AUCTION', 'BARTER'];
const DEMAND_LISTING_TYPES: ('DIRECT_BUY' | 'REVERSE_AUCTION')[] = ['DIRECT_BUY', 'REVERSE_AUCTION'];

const getSideFromListingType = (listingType: string): InventorySide => {
  return DEMAND_LISTING_TYPES.includes(listingType as any) ? 'DEMAND' : 'SUPPLY';
};

/**
 * Get user's inventory items
 * All items (SUPPLY and DEMAND) are now stored in the unified Item table
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
  const skip = (page - 1) * limit;

  // Build where clause based on side
  const where: any = {
    sellerId: userId,
    status: status === 'ACTIVE' ? 'ACTIVE' : status,
  };

  // Filter by side (listingType)
  if (side === 'SUPPLY') {
    where.listingType = { in: SUPPLY_LISTING_TYPES };
  } else if (side === 'DEMAND') {
    where.listingType = { in: DEMAND_LISTING_TYPES };
  }
  // If no side specified, get all

  if (type) {
    where.itemType = type === 'GOODS' ? 'GOOD' : type;
  }

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

  const mappedItems = items.map(item => {
    const itemSide = getSideFromListingType(item.listingType);
    return {
      id: item.id,
      userId: item.sellerId,
      side: itemSide,
      type: item.itemType === 'GOOD' ? 'GOODS' : item.itemType as InventoryItemType,
      title: item.title,
      description: item.description,
      estimatedValue: item.estimatedValue,
      listingType: item.listingType,
      status: item.status === 'ACTIVE' ? 'ACTIVE' : item.status === 'SOLD' ? 'COMPLETED' : item.status,
      images: item.images,
      categoryId: item.categoryId,
      categoryName: item.category?.nameAr || item.category?.nameEn,
      desiredCategoryId: item.desiredCategoryId,
      desiredCategoryName: item.desiredCategory?.nameAr || item.desiredCategory?.nameEn,
      desiredKeywords: item.desiredKeywords,
      // For DEMAND items, desiredValueMin/Max represent the budget
      budgetMin: item.desiredValueMin,
      budgetMax: item.desiredValueMax,
      marketType: item.marketType,
      governorate: item.governorate,
      city: item.city,
      district: item.district,
      viewCount: item.views || 0,
      matchCount: 0,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    };
  });

  // Get stats by listingType
  const [supplyCount, demandCount] = await Promise.all([
    prisma.item.count({
      where: { sellerId: userId, status: 'ACTIVE', listingType: { in: SUPPLY_LISTING_TYPES } }
    }),
    prisma.item.count({
      where: { sellerId: userId, status: 'ACTIVE', listingType: { in: DEMAND_LISTING_TYPES } }
    }),
  ]);

  return {
    items: mappedItems,
    total,
    stats: {
      supply: supplyCount,
      demand: demandCount,
      active: supplyCount + demandCount,
    },
  };
};

/**
 * Get inventory stats for user
 * Uses unified Item table with listingType to distinguish SUPPLY/DEMAND
 */
export const getInventoryStats = async (userId: string) => {
  const [supplyCount, demandCount, matchedCount, completedCount] = await Promise.all([
    // SUPPLY: Items with DIRECT_SALE, AUCTION, BARTER
    prisma.item.count({
      where: {
        sellerId: userId,
        status: 'ACTIVE',
        listingType: { in: SUPPLY_LISTING_TYPES }
      }
    }),
    // DEMAND: Items with DIRECT_BUY, REVERSE_AUCTION
    prisma.item.count({
      where: {
        sellerId: userId,
        status: 'ACTIVE',
        listingType: { in: DEMAND_LISTING_TYPES }
      }
    }),
    // MATCHED: Barter participants accepted
    prisma.barterParticipant.count({
      where: {
        userId,
        status: 'ACCEPTED',
        chain: { status: { in: ['PROPOSED', 'ACCEPTED'] } },
      },
    }),
    // COMPLETED: Completed transactions
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

    // Determine listing type for SUPPLY
    const hasBarterPrefs = !!(resolvedDesiredCategoryId || input.desiredItemTitle || input.desiredKeywords);
    let supplyListingType: 'DIRECT_SALE' | 'AUCTION' | 'BARTER' = 'DIRECT_SALE';
    if (input.listingType === 'AUCTION') {
      supplyListingType = 'AUCTION';
    } else if (input.listingType === 'BARTER' || hasBarterPrefs) {
      supplyListingType = 'BARTER';
    }

    // Create item in the unified Item model
    const item = await prisma.item.create({
      data: {
        seller: { connect: { id: userId } },
        title: input.title,
        description: input.description,
        itemType: itemType,
        listingType: supplyListingType, // Set the listing type
        estimatedValue: input.estimatedValue,
        category: resolvedCategoryId ? { connect: { id: resolvedCategoryId } } : undefined,
        desiredCategory: resolvedDesiredCategoryId ? { connect: { id: resolvedDesiredCategoryId } } : undefined,
        // Barter preferences - What user wants in exchange
        desiredItemTitle: input.desiredItemTitle || null,
        desiredItemDescription: input.desiredItemDescription || null,
        desiredKeywords: input.desiredKeywords || null,
        desiredValueMin: input.desiredValueMin || null,
        desiredValueMax: input.desiredValueMax || null,
        images: input.images || [],
        // Market & Location
        marketType: (input.marketType as MarketType) || 'DISTRICT',
        governorate: input.governorate || null,
        city: input.city || null,
        district: input.district || null,
        location: input.district || input.city || input.governorate || null,
        status: 'ACTIVE',
        condition: input.condition || 'GOOD',
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
      logger.error('[Inventory] Error processing proximity matching:', err);
    });

    // Emit item created event for smart matching notifications
    const hasBarterPreferences = !!(resolvedDesiredCategoryId || input.desiredItemTitle || input.desiredKeywords);
    itemEvents.emitItemCreated({
      itemId: item.id,
      userId: userId,
      categoryId: item.categoryId,
      hasBarterPreferences,
      timestamp: new Date(),
    });
    logger.info(`[Inventory] Item created event emitted for ${item.id}, hasBarterPreferences: ${hasBarterPreferences}`);

    // For BARTER listings, also create a DEMAND entry for what user wants
    // هذا يضمن ظهور الصنف المطلوب في جانب الطلب
    let linkedDemandId: string | null = null;
    if (input.listingType === 'BARTER' && (resolvedDesiredCategoryId || input.desiredKeywords)) {
      try {
        const demandOffer = await prisma.barterOffer.create({
          data: {
            initiator: { connect: { id: userId } },
            isOpenOffer: true,
            status: 'PENDING',
            offeredBundleValue: 0,
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            // Link to the supply item
            linkedItemId: item.id,
            // Market & Location (same as supply item)
            marketType: (input.marketType as MarketType) || 'DISTRICT',
            governorate: input.governorate || null,
            city: input.city || null,
            district: input.district || null,
            itemRequests: {
              create: {
                category: resolvedDesiredCategoryId ? { connect: { id: resolvedDesiredCategoryId } } : undefined,
                description: `مطلوب للمقايضة: ${input.desiredKeywords || 'أي صنف من نفس الفئة'}`,
                minPrice: input.estimatedValue * 0.7, // 70% of estimated
                maxPrice: input.estimatedValue * 1.3, // 130% of estimated
                keywords: input.desiredKeywords ? input.desiredKeywords.split(',').map(k => k.trim()) : [],
              },
            },
          },
        });
        linkedDemandId = demandOffer.id;
        logger.info(`[Inventory] Created linked DEMAND ${demandOffer.id} for SUPPLY ${item.id}`);

        // Trigger proximity matching for the demand side too
        proximityMatching.processNewDemandItem(demandOffer.id).catch(err => {
          logger.error('[Inventory] Error processing proximity matching for linked demand:', err);
        });
      } catch (err) {
        logger.error('[Inventory] Error creating linked demand for barter:', err);
        // Don't fail the whole operation if demand creation fails
      }
    }

    return {
      id: item.id,
      side: 'SUPPLY',
      type: input.type,
      title: item.title,
      listingType: input.listingType,
      marketType: input.marketType || 'DISTRICT',
      status: 'ACTIVE',
      createdAt: item.createdAt,
      linkedDemandId, // Include the linked demand ID if created
    };
  }

  // For DEMAND side - create in unified Item table with DIRECT_BUY or REVERSE_AUCTION listingType
  if (input.side === 'DEMAND') {
    // Map type to schema enum
    const itemType = input.type === 'SERVICES' ? 'SERVICE' : input.type === 'CASH' ? 'CASH' : 'GOOD';

    // Resolve category ID (handles both UUID and slug)
    const resolvedCategoryId = await resolveCategoryId(input.categoryId || input.desiredCategoryId);

    // Determine listing type for DEMAND
    const demandListingType = input.listingType === 'REVERSE_AUCTION' ? 'REVERSE_AUCTION' : 'DIRECT_BUY';

    // Create DEMAND item in unified Item table
    const item = await prisma.item.create({
      data: {
        seller: { connect: { id: userId } },
        title: input.title,
        description: input.description,
        itemType: itemType,
        listingType: demandListingType,
        estimatedValue: input.estimatedValue, // For DEMAND, this is the max budget
        category: resolvedCategoryId ? { connect: { id: resolvedCategoryId } } : undefined,
        // Budget range for DEMAND items
        desiredValueMin: input.desiredValueMin || input.estimatedValue * 0.8,
        desiredValueMax: input.desiredValueMax || input.estimatedValue * 1.2,
        // Keywords for matching
        desiredKeywords: input.desiredKeywords || null,
        images: input.images || [],
        // Market & Location
        marketType: (input.marketType as MarketType) || 'DISTRICT',
        governorate: input.governorate || null,
        city: input.city || null,
        district: input.district || null,
        location: input.district || input.city || input.governorate || null,
        status: 'ACTIVE',
        condition: input.condition || 'GOOD',
      },
      include: {
        category: true,
      },
    });

    // Emit item created event for smart matching notifications
    itemEvents.emitItemCreated({
      itemId: item.id,
      userId: userId,
      categoryId: item.categoryId,
      hasBarterPreferences: false,
      timestamp: new Date(),
    });

    // Trigger smart matching to notify supply owners about this new demand
    notifyDirectPurchaseMatches(item.id, userId).catch(err => {
      logger.error('[Inventory] Error notifying direct purchase matches:', err);
    });
    logger.info(`[Inventory] DEMAND item created: ${item.id} (${demandListingType}), triggering smart matching`);

    return {
      id: item.id,
      side: 'DEMAND',
      type: input.type,
      title: item.title,
      listingType: demandListingType,
      marketType: input.marketType || 'DISTRICT',
      status: 'ACTIVE',
      createdAt: item.createdAt,
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
 * Uses unified Item table with listingType to distinguish SUPPLY/DEMAND
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

  // Build base where clause
  const baseWhere: any = {
    status: 'ACTIVE',
  };
  if (marketType) {
    baseWhere.marketType = marketType;
  }
  if (governorate) {
    baseWhere.governorate = governorate;
  }

  // Get SUPPLY items (DIRECT_SALE, AUCTION, BARTER)
  const supplyItems = await prisma.item.findMany({
    where: {
      ...baseWhere,
      listingType: { in: SUPPLY_LISTING_TYPES },
    },
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

  // Get DEMAND items (DIRECT_BUY, REVERSE_AUCTION)
  const demandItems = await prisma.item.findMany({
    where: {
      ...baseWhere,
      listingType: { in: DEMAND_LISTING_TYPES },
    },
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

  return {
    supply: supplyItems.map(item => ({
      id: item.id,
      side: 'SUPPLY' as const,
      listingType: item.listingType,
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
    demand: demandItems.map(item => ({
      id: item.id,
      side: 'DEMAND' as const,
      listingType: item.listingType,
      title: item.title,
      description: item.description,
      estimatedValue: item.estimatedValue,
      // Budget range for DEMAND items
      minValue: item.desiredValueMin || item.estimatedValue * 0.8,
      maxValue: item.desiredValueMax || item.estimatedValue * 1.2,
      category: item.category ? {
        id: item.category.id,
        nameAr: item.category.nameAr,
        nameEn: item.category.nameEn,
      } : null,
      keywords: item.desiredKeywords?.split(',').map(k => k.trim()) || [],
      // Market & Location
      marketType: item.marketType,
      governorate: item.governorate,
      city: item.city,
      district: item.district,
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
  };
};

// ============================================
// Stock Management Functions
// ============================================

export interface StockAdjustmentInput {
  itemId: string;
  type: 'MANUAL_ADD' | 'MANUAL_SUBTRACT' | 'CORRECTION' | 'DAMAGE' | 'RETURN' | 'INITIAL';
  quantityChange: number;  // Positive for add, negative for subtract
  reason?: string;
  notes?: string;
  unitCost?: number;
}

export interface BulkImportItem {
  title: string;
  description: string;
  categoryId?: string;
  condition?: ItemConditionValue;
  estimatedValue: number;
  stockQuantity: number;
  sku?: string;
  barcode?: string;
  images?: string[];
  lowStockThreshold?: number;
  governorate?: string;
  city?: string;
  district?: string;
}

/**
 * Adjust stock for an item
 * Creates a stock adjustment record and updates the item's stock quantity
 */
export const adjustStock = async (
  userId: string,
  input: StockAdjustmentInput
): Promise<any> => {
  const item = await prisma.item.findFirst({
    where: { id: input.itemId, sellerId: userId },
  });

  if (!item) {
    throw new Error('Item not found or not owned by user');
  }

  const quantityBefore = item.stockQuantity;
  const quantityAfter = quantityBefore + input.quantityChange;

  // Check if negative stock is allowed
  if (quantityAfter < 0 && !item.allowNegativeStock) {
    throw new Error('الكمية المطلوبة غير متوفرة في المخزون');
  }

  // Create adjustment record and update stock in transaction
  const [adjustment, updatedItem] = await prisma.$transaction([
    prisma.stockAdjustment.create({
      data: {
        itemId: input.itemId,
        userId: userId,
        type: input.type,
        quantityBefore,
        quantityChange: input.quantityChange,
        quantityAfter,
        reason: input.reason,
        notes: input.notes,
        unitCost: input.unitCost,
        totalCost: input.unitCost ? Math.abs(input.quantityChange) * input.unitCost : null,
      },
    }),
    prisma.item.update({
      where: { id: input.itemId },
      data: { stockQuantity: quantityAfter },
    }),
  ]);

  // Check if stock is below threshold and trigger notification
  if (item.lowStockThreshold && quantityAfter <= item.lowStockThreshold && quantityBefore > item.lowStockThreshold) {
    // Trigger low stock notification
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'LOW_STOCK',
        title: 'تنبيه: المخزون منخفض',
        message: `المخزون منخفض للمنتج: ${item.title}. الكمية الحالية: ${quantityAfter}`,
        entityType: 'ITEM',
        entityId: input.itemId,
        priority: 'HIGH',
      } as any,
    });
  }

  // Check if stock is negative and trigger notification
  if (quantityAfter < 0 && quantityBefore >= 0) {
    await prisma.notification.create({
      data: {
        userId: userId,
        type: 'NEGATIVE_STOCK',
        title: 'تحذير: مخزون سالب',
        message: `تحذير: المخزون سالب للمنتج: ${item.title}. الكمية الحالية: ${quantityAfter}. يرجى تسوية المخزون.`,
        entityType: 'ITEM',
        entityId: input.itemId,
        priority: 'URGENT',
      } as any,
    });
  }

  return {
    adjustment,
    item: updatedItem,
    isNegativeStock: quantityAfter < 0,
    isLowStock: item.lowStockThreshold ? quantityAfter <= item.lowStockThreshold : false,
  };
};

/**
 * Get stock adjustment history for an item
 */
export const getStockAdjustments = async (
  userId: string,
  itemId: string,
  options: { page?: number; limit?: number } = {}
): Promise<{ adjustments: any[]; total: number }> => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  // Verify ownership
  const item = await prisma.item.findFirst({
    where: { id: itemId, sellerId: userId },
  });

  if (!item) {
    throw new Error('Item not found or not owned by user');
  }

  const [adjustments, total] = await Promise.all([
    prisma.stockAdjustment.findMany({
      where: { itemId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.stockAdjustment.count({ where: { itemId } }),
  ]);

  return { adjustments, total };
};

/**
 * Bulk import items for merchants
 * Creates multiple items with stock quantities at once
 */
export const bulkImportItems = async (
  userId: string,
  items: BulkImportItem[]
): Promise<{ success: number; failed: number; errors: string[]; items: any[] }> => {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
    items: [] as any[],
  };

  for (let i = 0; i < items.length; i++) {
    const itemData = items[i];
    try {
      // Resolve category ID
      const resolvedCategoryId = itemData.categoryId
        ? await resolveCategoryId(itemData.categoryId)
        : null;

      // Create item
      const item = await prisma.item.create({
        data: {
          seller: { connect: { id: userId } },
          title: itemData.title,
          description: itemData.description,
          itemType: 'GOOD',
          listingType: 'DIRECT_SALE',
          estimatedValue: itemData.estimatedValue,
          category: resolvedCategoryId ? { connect: { id: resolvedCategoryId } } : undefined,
          condition: itemData.condition || 'GOOD',
          images: itemData.images || [],
          // Stock management
          stockQuantity: itemData.stockQuantity || 0,
          sku: itemData.sku,
          barcode: itemData.barcode,
          lowStockThreshold: itemData.lowStockThreshold,
          trackInventory: true,
          // Location
          governorate: itemData.governorate,
          city: itemData.city,
          district: itemData.district,
          status: 'ACTIVE',
        },
      });

      // Create initial stock adjustment record
      if (itemData.stockQuantity > 0) {
        await prisma.stockAdjustment.create({
          data: {
            itemId: item.id,
            userId: userId,
            type: 'INITIAL',
            quantityBefore: 0,
            quantityChange: itemData.stockQuantity,
            quantityAfter: itemData.stockQuantity,
            reason: 'رصيد افتتاحي - استيراد مجمع',
          },
        });
      }

      results.success++;
      results.items.push({
        id: item.id,
        title: item.title,
        stockQuantity: item.stockQuantity,
        sku: item.sku,
      });
    } catch (error: any) {
      results.failed++;
      results.errors.push(`صف ${i + 1}: ${error.message || 'خطأ غير معروف'}`);
    }
  }

  return results;
};

/**
 * Get items with low or negative stock
 */
export const getLowStockItems = async (
  userId: string,
  options: { includeNegative?: boolean; page?: number; limit?: number } = {}
): Promise<{ items: any[]; total: number; negativeCount: number; lowCount: number }> => {
  const { includeNegative = true, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const where: any = {
    sellerId: userId,
    status: 'ACTIVE',
    trackInventory: true,
    OR: [
      // Low stock (quantity <= threshold)
      {
        lowStockThreshold: { not: null },
        stockQuantity: { lte: prisma.item.fields.lowStockThreshold },
      },
    ],
  };

  if (includeNegative) {
    where.OR.push({ stockQuantity: { lt: 0 } });
  }

  const [items, total, negativeCount, lowCount] = await Promise.all([
    prisma.item.findMany({
      where,
      skip,
      take: limit,
      orderBy: { stockQuantity: 'asc' },
      include: { category: true },
    }),
    prisma.item.count({ where }),
    prisma.item.count({
      where: { sellerId: userId, status: 'ACTIVE', trackInventory: true, stockQuantity: { lt: 0 } },
    }),
    prisma.item.count({
      where: {
        sellerId: userId,
        status: 'ACTIVE',
        trackInventory: true,
        lowStockThreshold: { not: null },
        stockQuantity: { gte: 0 },
        // This requires raw query for proper comparison
      },
    }),
  ]);

  return {
    items: items.map(item => ({
      id: item.id,
      title: item.title,
      sku: item.sku,
      stockQuantity: item.stockQuantity,
      reservedQuantity: item.reservedQuantity,
      availableQuantity: item.stockQuantity - item.reservedQuantity,
      lowStockThreshold: item.lowStockThreshold,
      isNegative: item.stockQuantity < 0,
      isLow: item.lowStockThreshold ? item.stockQuantity <= item.lowStockThreshold : false,
      category: item.category?.nameAr,
    })),
    total,
    negativeCount,
    lowCount,
  };
};

/**
 * Auto-deduct stock when order is placed
 * Called by order service
 */
export const deductStockForOrder = async (
  itemId: string,
  quantity: number,
  orderId: string
): Promise<{ success: boolean; item: any; isNegative: boolean }> => {
  const item = await prisma.item.findUnique({ where: { id: itemId } });

  if (!item) {
    throw new Error('Item not found');
  }

  if (!item.trackInventory) {
    return { success: true, item, isNegative: false };
  }

  const quantityBefore = item.stockQuantity;
  const quantityAfter = quantityBefore - quantity;

  // Check if negative stock is allowed
  if (quantityAfter < 0 && !item.allowNegativeStock) {
    throw new Error('الكمية المطلوبة غير متوفرة في المخزون');
  }

  // Create adjustment and update stock
  const [adjustment, updatedItem] = await prisma.$transaction([
    prisma.stockAdjustment.create({
      data: {
        itemId,
        userId: item.sellerId,
        type: 'SALE',
        quantityBefore,
        quantityChange: -quantity,
        quantityAfter,
        referenceType: 'ORDER',
        referenceId: orderId,
        reason: 'خصم تلقائي - طلب شراء',
      },
    }),
    prisma.item.update({
      where: { id: itemId },
      data: { stockQuantity: quantityAfter },
    }),
  ]);

  // Notify if stock became negative
  if (quantityAfter < 0 && quantityBefore >= 0) {
    await prisma.notification.create({
      data: {
        userId: item.sellerId,
        type: 'NEGATIVE_STOCK',
        title: 'تحذير: مخزون سالب',
        message: `المخزون أصبح سالباً للمنتج: ${item.title}. الكمية: ${quantityAfter}`,
        entityType: 'ITEM',
        entityId: itemId,
        priority: 'URGENT',
      } as any,
    });
  }

  // Notify if low stock
  if (item.lowStockThreshold && quantityAfter <= item.lowStockThreshold && quantityAfter >= 0) {
    await prisma.notification.create({
      data: {
        userId: item.sellerId,
        type: 'LOW_STOCK',
        title: 'تنبيه: المخزون منخفض',
        message: `المخزون منخفض للمنتج: ${item.title}. الكمية: ${quantityAfter}`,
        entityType: 'ITEM',
        entityId: itemId,
        priority: 'HIGH',
      } as any,
    });
  }

  return {
    success: true,
    item: updatedItem,
    isNegative: quantityAfter < 0,
  };
};

/**
 * Restore stock when order is cancelled or returned
 */
export const restoreStockForOrder = async (
  itemId: string,
  quantity: number,
  orderId: string,
  type: 'RETURN' | 'CORRECTION' = 'RETURN'
): Promise<{ success: boolean; item: any }> => {
  const item = await prisma.item.findUnique({ where: { id: itemId } });

  if (!item) {
    throw new Error('Item not found');
  }

  if (!item.trackInventory) {
    return { success: true, item };
  }

  const quantityBefore = item.stockQuantity;
  const quantityAfter = quantityBefore + quantity;

  // Create adjustment and update stock
  await prisma.$transaction([
    prisma.stockAdjustment.create({
      data: {
        itemId,
        userId: item.sellerId,
        type,
        quantityBefore,
        quantityChange: quantity,
        quantityAfter,
        referenceType: 'ORDER',
        referenceId: orderId,
        reason: type === 'RETURN' ? 'استرجاع - إلغاء طلب' : 'تصحيح مخزون',
      },
    }),
    prisma.item.update({
      where: { id: itemId },
      data: { stockQuantity: quantityAfter },
    }),
  ]);

  return { success: true, item: { ...item, stockQuantity: quantityAfter } };
};

/**
 * Update item stock settings
 */
export const updateStockSettings = async (
  userId: string,
  itemId: string,
  settings: {
    trackInventory?: boolean;
    allowNegativeStock?: boolean;
    lowStockThreshold?: number | null;
    sku?: string;
    barcode?: string;
  }
): Promise<any> => {
  const item = await prisma.item.findFirst({
    where: { id: itemId, sellerId: userId },
  });

  if (!item) {
    throw new Error('Item not found or not owned by user');
  }

  return prisma.item.update({
    where: { id: itemId },
    data: settings,
  });
};

export default {
  getUserInventory,
  getInventoryStats,
  createInventoryItem,
  updateInventoryItemStatus,
  deleteInventoryItem,
  findMatchesForItem,
  getLatestPublicItems,
  // Stock management
  adjustStock,
  getStockAdjustments,
  bulkImportItems,
  getLowStockItems,
  deductStockForOrder,
  restoreStockForOrder,
  updateStockSettings,
};
