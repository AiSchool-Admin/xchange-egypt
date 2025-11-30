/**
 * Inventory Service
 *
 * Manages user inventory with Supply (selling) and Demand (buying) sides.
 * Supports goods, services, and cash items with multiple listing types.
 */

import { PrismaClient, ItemType, ItemCondition } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Types
// ============================================

export type InventorySide = 'SUPPLY' | 'DEMAND';
export type InventoryItemType = 'GOODS' | 'SERVICES' | 'CASH';
export type ListingType = 'DIRECT_SALE' | 'AUCTION' | 'BARTER' | 'DIRECT_BUY' | 'REVERSE_AUCTION';

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
  governorate?: string;
  city?: string;
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
  governorate?: string;
  city?: string;
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

    // Create item in the existing Item model
    const item = await prisma.item.create({
      data: {
        sellerId: userId,
        title: input.title,
        description: input.description,
        itemType: itemType,
        estimatedValue: input.estimatedValue,
        categoryId: input.categoryId || null,
        desiredCategoryId: input.desiredCategoryId || null,
        desiredKeywords: input.desiredKeywords || null,
        images: input.images || [],
        location: input.city || input.governorate || null,
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

    return {
      id: item.id,
      side: 'SUPPLY',
      type: input.type,
      title: item.title,
      listingType: input.listingType,
      status: 'ACTIVE',
      createdAt: item.createdAt,
    };
  }

  // For DEMAND side - create a want-ad/request
  // For now, we'll use BarterOffer with isOpenOffer = true
  if (input.side === 'DEMAND') {
    const offer = await prisma.barterOffer.create({
      data: {
        initiatorId: userId,
        isOpenOffer: true,
        status: 'PENDING',
        offeredBundleValue: 0,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        itemRequests: {
          create: {
            categoryId: input.desiredCategoryId || null,
            description: input.description,
            minPrice: input.estimatedValue * 0.8, // 80% of estimated
            maxPrice: input.estimatedValue * 1.2, // 120% of estimated
            keywords: input.desiredKeywords ? input.desiredKeywords.split(',').map(k => k.trim()) : [],
          },
        },
      },
    });

    return {
      id: offer.id,
      side: 'DEMAND',
      type: input.type,
      title: input.title,
      listingType: input.listingType,
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

export default {
  getUserInventory,
  getInventoryStats,
  createInventoryItem,
  updateInventoryItemStatus,
  deleteInventoryItem,
  findMatchesForItem,
};
