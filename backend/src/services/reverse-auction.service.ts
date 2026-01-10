/**
 * Reverse Auction Service
 *
 * Handles all business logic for reverse auctions where:
 * - Buyers create requests for items they want
 * - Sellers compete by bidding DOWN (lower prices)
 * - Winner = lowest price (or best value)
 */

import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { reverseAuctionEvents } from '../events/reverse-auction.events';

// ============================================
// Types & Interfaces
// ============================================

export interface CreateReverseAuctionInput {
  title: string;
  description: string;
  categoryId: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  specifications?: Record<string, any>;
  quantity?: number;
  location?: string;
  deliveryPreference?: string;
  maxBudget?: number;
  targetPrice?: number;
  endDate: Date;
  publicNotes?: string;
  buyerNotes?: string;
}

export interface UpdateReverseAuctionInput {
  title?: string;
  description?: string;
  condition?: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  specifications?: Record<string, any>;
  maxBudget?: number;
  targetPrice?: number;
  endDate?: Date;
  publicNotes?: string;
  buyerNotes?: string;
}

export interface SubmitBidInput {
  reverseAuctionId: string;
  bidAmount: number;
  itemId?: string;
  itemCondition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  itemDescription?: string;
  itemImages?: string[];
  deliveryOption: string;
  deliveryDays?: number;
  deliveryCost?: number;
  notes?: string;
}

export interface UpdateBidInput {
  bidAmount?: number;
  itemDescription?: string;
  itemImages?: string[];
  deliveryOption?: string;
  deliveryDays?: number;
  deliveryCost?: number;
  notes?: string;
}

// ============================================
// Reverse Auction Management (Buyer Side)
// ============================================

/**
 * Create a new reverse auction request
 */
export const createReverseAuction = async (
  buyerId: string,
  input: CreateReverseAuctionInput
): Promise<any> => {
  const {
    title,
    description,
    categoryId,
    condition,
    specifications,
    quantity = 1,
    location,
    deliveryPreference,
    maxBudget,
    targetPrice,
    endDate,
    publicNotes,
    buyerNotes,
  } = input;

  // Validate category exists
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    throw new NotFoundError('Category not found');
  }

  // Validate end date is in the future
  if (new Date(endDate) <= new Date()) {
    throw new BadRequestError('End date must be in the future');
  }

  // Validate budget logic
  if (maxBudget && targetPrice && targetPrice > maxBudget) {
    throw new BadRequestError('Target price cannot exceed max budget');
  }

  // Create reverse auction
  const reverseAuction = await prisma.reverseAuction.create({
    data: {
      buyerId,
      title,
      description,
      categoryId,
      condition,
      specifications: specifications || {},
      quantity,
      location,
      deliveryPreference,
      maxBudget,
      targetPrice,
      endDate,
      publicNotes,
      buyerNotes,
      status: 'ACTIVE', // Publish immediately
    },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
          rating: true,
          totalReviews: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  // Emit event for smart matching (notify sellers with matching items)
  reverseAuctionEvents.emitAuctionCreated({
    auctionId: reverseAuction.id,
    buyerId: reverseAuction.buyerId,
    title: reverseAuction.title,
    description: reverseAuction.description || '',
    categoryId: reverseAuction.categoryId,
    condition: reverseAuction.condition || undefined,
    targetPrice: reverseAuction.targetPrice || undefined,
    maxBudget: reverseAuction.maxBudget || undefined,
    governorate: reverseAuction.location || undefined, // ReverseAuction uses location field
    startDate: reverseAuction.startDate,
    endDate: reverseAuction.endDate,
    timestamp: new Date(),
  });

  return reverseAuction;
};

/**
 * Get all active reverse auctions with filters
 */
export const getReverseAuctions = async (
  filters: {
    status?: string;
    categoryId?: string;
    condition?: string;
    minBudget?: number;
    maxBudget?: number;
    location?: string;
    buyerId?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<any> => {
  const {
    status,
    categoryId,
    condition,
    minBudget,
    maxBudget,
    location,
    buyerId,
    page = 1,
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;

  // Build where clause
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  // Only filter by status if provided, otherwise show all for user's own auctions
  if (status) {
    where.status = status as string;
  } else if (!buyerId) {
    // Default to ACTIVE only when not filtering by buyerId
    where.status = 'ACTIVE';
  }

  if (buyerId) {
    where.buyerId = buyerId;
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (condition) {
    where.condition = condition as any;
  }

  if (minBudget !== undefined || maxBudget !== undefined) {
    where.maxBudget = {};
    if (minBudget !== undefined) {
      where.maxBudget.gte = minBudget;
    }
    if (maxBudget !== undefined) {
      where.maxBudget.lte = maxBudget;
    }
  }

  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive',
    };
  }

  // Get total count
  const total = await prisma.reverseAuction.count({ where });

  // Get auctions
  const auctions = await prisma.reverseAuction.findMany({
    where,
    skip,
    take: limit,
    orderBy: [
      { endDate: 'asc' }, // Ending soon first
      { createdAt: 'desc' },
    ],
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
          totalReviews: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
      _count: {
        select: {
          bids: true,
        },
      },
    },
  });

  return {
    items: auctions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single reverse auction with all bids
 */
export const getReverseAuctionById = async (
  auctionId: string,
  userId?: string
): Promise<any> => {
  const auction = await prisma.reverseAuction.findUnique({
    where: { id: auctionId },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          email: true,
          avatar: true,
          rating: true,
          totalReviews: true,
          city: true,
          governorate: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
      bids: {
        where: {
          status: {
            notIn: ['WITHDRAWN'],
          },
        },
        orderBy: {
          bidAmount: 'asc', // Lowest first
        },
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              rating: true,
              totalReviews: true,
              city: true,
              governorate: true,
            },
          },
        },
      },
    },
  });

  if (!auction) {
    throw new NotFoundError('Reverse auction not found');
  }

  // Recalculate and sync bid counts (fix data integrity issues)
  const activeBids = auction.bids.filter(b => b.status !== 'WITHDRAWN');
  const actualBidCount = activeBids.length;
  const actualLowestBid = activeBids.length > 0
    ? Math.min(...activeBids.map(b => b.bidAmount))
    : null;

  // Update if out of sync
  if (auction.totalBids !== actualBidCount || auction.lowestBid !== actualLowestBid) {
    await prisma.reverseAuction.update({
      where: { id: auctionId },
      data: {
        totalBids: actualBidCount,
        lowestBid: actualLowestBid,
        views: { increment: 1 },
      },
    });
    // Update the auction object with corrected values
    (auction).totalBids = actualBidCount;
    (auction).lowestBid = actualLowestBid;
  } else {
    // Just increment views
    await prisma.reverseAuction.update({
      where: { id: auctionId },
      data: { views: { increment: 1 } },
    });
  }

  // Hide buyer's private notes unless viewer is the buyer
  if (userId !== auction.buyerId) {
    delete (auction).buyerNotes;
  }

  return auction;
};

/**
 * Update reverse auction (buyer only, before end date)
 */
export const updateReverseAuction = async (
  auctionId: string,
  buyerId: string,
  input: UpdateReverseAuctionInput
): Promise<any> => {
  const auction = await prisma.reverseAuction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw new NotFoundError('Reverse auction not found');
  }

  if (auction.buyerId !== buyerId) {
    throw new ForbiddenError('Only the buyer can update this auction');
  }

  if (auction.status !== 'ACTIVE' && auction.status !== 'DRAFT') {
    throw new BadRequestError('Cannot update auction in current status');
  }

  // If end date is being updated, validate it
  if (input.endDate && new Date(input.endDate) <= new Date()) {
    throw new BadRequestError('End date must be in the future');
  }

  const updated = await prisma.reverseAuction.update({
    where: { id: auctionId },
    data: {
      ...input,
      specifications: input.specifications || undefined,
    },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
        },
      },
      category: true,
    },
  });

  return updated;
};

/**
 * Cancel reverse auction (buyer only)
 */
export const cancelReverseAuction = async (
  auctionId: string,
  buyerId: string
): Promise<any> => {
  const auction = await prisma.reverseAuction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw new NotFoundError('Reverse auction not found');
  }

  if (auction.buyerId !== buyerId) {
    throw new ForbiddenError('Only the buyer can cancel this auction');
  }

  if (auction.status !== 'ACTIVE' && auction.status !== 'DRAFT') {
    throw new BadRequestError('Cannot cancel auction in current status');
  }

  // Update auction status
  const updated = await prisma.reverseAuction.update({
    where: { id: auctionId },
    data: { status: 'CANCELLED' },
  });

  // Update all active bids to LOST
  await prisma.reverseAuctionBid.updateMany({
    where: {
      reverseAuctionId: auctionId,
      status: { in: ['ACTIVE', 'WINNING', 'OUTBID'] },
    },
    data: { status: 'LOST' },
  });

  return updated;
};

/**
 * Delete reverse auction (buyer only, draft only)
 */
export const deleteReverseAuction = async (
  auctionId: string,
  buyerId: string
): Promise<void> => {
  const auction = await prisma.reverseAuction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw new NotFoundError('Reverse auction not found');
  }

  if (auction.buyerId !== buyerId) {
    throw new ForbiddenError('Only the buyer can delete this auction');
  }

  if (auction.status !== 'DRAFT') {
    throw new BadRequestError('Can only delete draft auctions');
  }

  await prisma.reverseAuction.delete({
    where: { id: auctionId },
  });
};

// ============================================
// Bidding Management (Seller Side)
// ============================================

/**
 * Submit a bid on a reverse auction
 */
export const submitBid = async (
  sellerId: string,
  input: SubmitBidInput,
  metadata?: { ipAddress?: string; userAgent?: string }
): Promise<any> => {
  const { reverseAuctionId, bidAmount, itemId, itemCondition, itemDescription, itemImages = [], deliveryOption, deliveryDays, deliveryCost = 0, notes } = input;

  // Get auction
  const auction = await prisma.reverseAuction.findUnique({
    where: { id: reverseAuctionId },
    include: {
      bids: {
        where: { sellerId },
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!auction) {
    throw new NotFoundError('Reverse auction not found');
  }

  if (auction.status !== 'ACTIVE') {
    throw new BadRequestError('This auction is not accepting bids');
  }

  if (new Date(auction.endDate) <= new Date()) {
    throw new BadRequestError('This auction has ended');
  }

  if (auction.buyerId === sellerId) {
    throw new BadRequestError('Cannot bid on your own auction');
  }

  // Validate bid amount
  if (bidAmount <= 0) {
    throw new BadRequestError('Bid amount must be positive');
  }

  // Check if bid exceeds max budget (if set)
  if (auction.maxBudget && bidAmount > auction.maxBudget) {
    throw new BadRequestError(`Bid exceeds buyer's maximum budget of ${auction.maxBudget} EGP`);
  }

  // If seller has previous bid, get it
  const previousBid = auction.bids[0];
  const previousBidAmount = previousBid?.bidAmount;

  // Validate bid is lower than previous (if exists)
  if (previousBidAmount && bidAmount >= previousBidAmount) {
    throw new BadRequestError('New bid must be lower than your previous bid');
  }

  // Validate item if provided
  if (itemId) {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
    });

    if (!item) {
      throw new NotFoundError('Item not found');
    }

    if (item.sellerId !== sellerId) {
      throw new ForbiddenError('You do not own this item');
    }

    if (item.status !== 'ACTIVE') {
      throw new BadRequestError('Item is not available');
    }
  }

  // Create bid
  const bid = await prisma.$transaction(async (tx) => {
    // Create the new bid
    const newBid = await tx.reverseAuctionBid.create({
      data: {
        reverseAuctionId,
        sellerId,
        bidAmount,
        previousBid: previousBidAmount,
        itemId,
        itemCondition,
        itemDescription,
        itemImages,
        deliveryOption,
        deliveryDays,
        deliveryCost,
        notes,
        status: 'ACTIVE',
        ipAddress: metadata?.ipAddress,
        userAgent: metadata?.userAgent,
      },
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
            totalReviews: true,
          },
        },
      },
    });

    // Update bid statuses
    await updateBidStatuses(tx, reverseAuctionId);

    // Update auction stats
    const stats = await calculateAuctionStats(tx, reverseAuctionId);
    await tx.reverseAuction.update({
      where: { id: reverseAuctionId },
      data: {
        totalBids: stats.totalBids,
        uniqueBidders: stats.uniqueBidders,
        lowestBid: stats.lowestBid,
      },
    });

    return newBid;
  });

  return bid;
};

/**
 * Update an existing bid (seller only, if still active)
 */
export const updateBid = async (
  bidId: string,
  sellerId: string,
  input: UpdateBidInput
): Promise<any> => {
  const bid = await prisma.reverseAuctionBid.findUnique({
    where: { id: bidId },
    include: {
      reverseAuction: true,
    },
  });

  if (!bid) {
    throw new NotFoundError('Bid not found');
  }

  if (bid.sellerId !== sellerId) {
    throw new ForbiddenError('You can only update your own bids');
  }

  if (bid.status === 'WITHDRAWN' || bid.status === 'WON' || bid.status === 'LOST') {
    throw new BadRequestError('Cannot update bid in current status');
  }

  if (bid.reverseAuction.status !== 'ACTIVE') {
    throw new BadRequestError('Auction is not active');
  }

  // If updating bid amount, validate it
  if (input.bidAmount !== undefined) {
    if (input.bidAmount <= 0) {
      throw new BadRequestError('Bid amount must be positive');
    }

    if (input.bidAmount >= bid.bidAmount) {
      throw new BadRequestError('New bid amount must be lower than current bid');
    }

    if (bid.reverseAuction.maxBudget && input.bidAmount > bid.reverseAuction.maxBudget) {
      throw new BadRequestError(`Bid exceeds buyer's maximum budget`);
    }
  }

  // Update bid
  const updated = await prisma.$transaction(async (tx) => {
    const updatedBid = await tx.reverseAuctionBid.update({
      where: { id: bidId },
      data: {
        ...input,
        previousBid: bid.bidAmount,
      },
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
          },
        },
      },
    });

    // If bid amount changed, update statuses
    if (input.bidAmount !== undefined) {
      await updateBidStatuses(tx, bid.reverseAuctionId);

      const stats = await calculateAuctionStats(tx, bid.reverseAuctionId);
      await tx.reverseAuction.update({
        where: { id: bid.reverseAuctionId },
        data: {
          lowestBid: stats.lowestBid,
        },
      });
    }

    return updatedBid;
  });

  return updated;
};

/**
 * Withdraw a bid (seller only)
 */
export const withdrawBid = async (
  bidId: string,
  sellerId: string
): Promise<any> => {
  const bid = await prisma.reverseAuctionBid.findUnique({
    where: { id: bidId },
    include: {
      reverseAuction: true,
    },
  });

  if (!bid) {
    throw new NotFoundError('Bid not found');
  }

  if (bid.sellerId !== sellerId) {
    throw new ForbiddenError('You can only withdraw your own bids');
  }

  if (bid.status === 'WITHDRAWN') {
    throw new BadRequestError('Bid is already withdrawn');
  }

  if (bid.status === 'WON') {
    throw new BadRequestError('Cannot withdraw winning bid');
  }

  if (bid.reverseAuction.status !== 'ACTIVE') {
    throw new BadRequestError('Auction is not active');
  }

  // Withdraw bid
  const updated = await prisma.$transaction(async (tx) => {
    const withdrawnBid = await tx.reverseAuctionBid.update({
      where: { id: bidId },
      data: { status: 'WITHDRAWN' },
    });

    // Update bid statuses
    await updateBidStatuses(tx, bid.reverseAuctionId);

    // Update auction stats
    const stats = await calculateAuctionStats(tx, bid.reverseAuctionId);
    await tx.reverseAuction.update({
      where: { id: bid.reverseAuctionId },
      data: {
        totalBids: stats.totalBids,
        uniqueBidders: stats.uniqueBidders,
        lowestBid: stats.lowestBid,
      },
    });

    return withdrawnBid;
  });

  return updated;
};

/**
 * Get all bids for a reverse auction
 */
export const getBidsForAuction = async (
  auctionId: string
): Promise<any[]> => {
  const bids = await prisma.reverseAuctionBid.findMany({
    where: {
      reverseAuctionId: auctionId,
      status: { notIn: ['WITHDRAWN'] },
    },
    orderBy: {
      bidAmount: 'asc', // Lowest first
    },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
          totalReviews: true,
        },
      },
      item: {
        select: {
          id: true,
          title: true,
          images: true,
          condition: true,
        },
      },
    },
  });

  return bids;
};

/**
 * Get my bids (seller view)
 */
export const getMyBids = async (
  sellerId: string,
  filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<any> => {
  const { status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: Record<string, unknown> = {
    sellerId,
  };

  if (status) {
    where.status = status as string;
  }

  const total = await prisma.reverseAuctionBid.count({ where: where as any });

  const bids = await prisma.reverseAuctionBid.findMany({
    where: where as any,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      reverseAuction: {
        include: {
          buyer: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              rating: true,
            },
          },
          category: true,
        },
      },
    },
  });

  return {
    items: bids,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// Award & Complete
// ============================================

/**
 * Award auction to winning bid (buyer only)
 */
export const awardAuction = async (
  auctionId: string,
  bidId: string,
  buyerId: string
): Promise<any> => {
  const auction = await prisma.reverseAuction.findUnique({
    where: { id: auctionId },
    include: {
      bids: true,
    },
  });

  if (!auction) {
    throw new NotFoundError('Reverse auction not found');
  }

  if (auction.buyerId !== buyerId) {
    throw new ForbiddenError('Only the buyer can award this auction');
  }

  if (auction.status !== 'ACTIVE' && auction.status !== 'ENDED') {
    throw new BadRequestError('Cannot award auction in current status');
  }

  // Validate bid
  const bid = auction.bids.find((b) => b.id === bidId);
  if (!bid) {
    throw new NotFoundError('Bid not found');
  }

  if (bid.status === 'WITHDRAWN') {
    throw new BadRequestError('Cannot award to a withdrawn bid');
  }

  // Award auction
  const updated = await prisma.$transaction(async (tx) => {
    // Update auction
    const updatedAuction = await tx.reverseAuction.update({
      where: { id: auctionId },
      data: {
        status: 'AWARDED',
        winnerId: bid.sellerId,
        winningBidId: bidId,
        awardedAt: new Date(),
      },
      include: {
        buyer: true,
        winningBid: {
          include: {
            seller: true,
          },
        },
      },
    });

    // Update winning bid
    await tx.reverseAuctionBid.update({
      where: { id: bidId },
      data: { status: 'WON' },
    });

    // Update all other bids to LOST
    await tx.reverseAuctionBid.updateMany({
      where: {
        reverseAuctionId: auctionId,
        id: { not: bidId },
        status: { in: ['ACTIVE', 'WINNING', 'OUTBID'] },
      },
      data: { status: 'LOST' },
    });

    return updatedAuction;
  });

  return updated;
};

/**
 * Mark auction as completed
 */
export const completeAuction = async (
  auctionId: string,
  userId: string
): Promise<any> => {
  const auction = await prisma.reverseAuction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw new NotFoundError('Reverse auction not found');
  }

  if (auction.buyerId !== userId && auction.winnerId !== userId) {
    throw new ForbiddenError('Only buyer or winner can mark as completed');
  }

  if (auction.status !== 'AWARDED') {
    throw new BadRequestError('Auction must be awarded first');
  }

  const updated = await prisma.reverseAuction.update({
    where: { id: auctionId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });

  return updated;
};

// ============================================
// Statistics & Utilities
// ============================================

/**
 * Get reverse auctions where user has submitted bids
 */
export const getAppliedAuctions = async (
  sellerId: string,
  filters: {
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<any> => {
  const { status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  // Get unique auction IDs where user has bids
  const userBids = await prisma.reverseAuctionBid.findMany({
    where: {
      sellerId,
      ...(status && { status: status as any }),
    },
    select: {
      reverseAuctionId: true,
    },
    distinct: ['reverseAuctionId'],
  });

  const auctionIds = userBids.map(b => b.reverseAuctionId);

  if (auctionIds.length === 0) {
    return {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }

  const total = auctionIds.length;

  const auctions = await prisma.reverseAuction.findMany({
    where: {
      id: { in: auctionIds },
    },
    skip,
    take: limit,
    orderBy: { endDate: 'asc' },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
          totalReviews: true,
          governorate: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
      bids: {
        where: {
          sellerId,
        },
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          id: true,
          bidAmount: true,
          status: true,
          createdAt: true,
        },
      },
      _count: {
        select: {
          bids: true,
        },
      },
    },
  });

  // Format auctions with user's bid info
  const formattedAuctions = auctions.map(auction => ({
    ...auction,
    myBid: auction.bids[0] || null,
    bids: undefined, // Remove bids array from response
  }));

  return {
    items: formattedAuctions,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get auction statistics
 */
export const getAuctionStatistics = async (
  userId: string
): Promise<any> => {
  // As buyer
  const asBuyer = await prisma.reverseAuction.groupBy({
    by: ['status'],
    where: { buyerId: userId },
    _count: true,
  });

  // As seller
  const asSeller = await prisma.reverseAuctionBid.groupBy({
    by: ['status'],
    where: { sellerId: userId },
    _count: true,
  });

  return {
    asBuyer: asBuyer.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>),
    asSeller: asSeller.reduce((acc, item) => {
      acc[item.status] = item._count;
      return acc;
    }, {} as Record<string, number>),
  };
};

/**
 * Auto-expire auctions that have passed end date
 */
export const autoExpireAuctions = async (): Promise<number> => {
  const now = new Date();

  // Find active auctions past end date
  const expiredAuctions = await prisma.reverseAuction.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lte: now },
    },
  });

  if (expiredAuctions.length === 0) {
    return 0;
  }

  // Update to ENDED or EXPIRED
  await prisma.$transaction(async (tx) => {
    for (const auction of expiredAuctions) {
      const hasBids = await tx.reverseAuctionBid.count({
        where: {
          reverseAuctionId: auction.id,
          status: { notIn: ['WITHDRAWN'] },
        },
      });

      await tx.reverseAuction.update({
        where: { id: auction.id },
        data: {
          status: hasBids > 0 ? 'ENDED' : 'EXPIRED',
        },
      });

      // If no bids, mark all as LOST
      if (hasBids === 0) {
        await tx.reverseAuctionBid.updateMany({
          where: {
            reverseAuctionId: auction.id,
            status: { in: ['ACTIVE', 'WINNING', 'OUTBID'] },
          },
          data: { status: 'LOST' },
        });
      }
    }
  });

  return expiredAuctions.length;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Update bid statuses based on current bids
 */
async function updateBidStatuses(
  tx: Prisma.TransactionClient,
  auctionId: string
): Promise<void> {
  const bids = await tx.reverseAuctionBid.findMany({
    where: {
      reverseAuctionId: auctionId,
      status: { notIn: ['WITHDRAWN', 'WON', 'LOST', 'REJECTED'] },
    },
    orderBy: { bidAmount: 'asc' },
  });

  if (bids.length === 0) return;

  // Lowest bid is WINNING
  const lowestBid = bids[0];
  await tx.reverseAuctionBid.update({
    where: { id: lowestBid.id },
    data: { status: 'WINNING' },
  });

  // All others are OUTBID
  const otherBids = bids.slice(1);
  for (const bid of otherBids) {
    await tx.reverseAuctionBid.update({
      where: { id: bid.id },
      data: { status: 'OUTBID' },
    });
  }
}

/**
 * Calculate auction statistics
 */
async function calculateAuctionStats(
  tx: Prisma.TransactionClient,
  auctionId: string
): Promise<{ totalBids: number; uniqueBidders: number; lowestBid: number | null }> {
  const bids = await tx.reverseAuctionBid.findMany({
    where: {
      reverseAuctionId: auctionId,
      status: { notIn: ['WITHDRAWN'] },
    },
    select: {
      sellerId: true,
      bidAmount: true,
    },
  });

  const uniqueBidders = new Set(bids.map((b) => b.sellerId)).size;
  const lowestBid = bids.length > 0 ? Math.min(...bids.map((b) => b.bidAmount)) : null;

  return {
    totalBids: bids.length,
    uniqueBidders,
    lowestBid,
  };
}
