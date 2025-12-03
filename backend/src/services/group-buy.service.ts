/**
 * Group Buying (Tawfir) Service
 * خدمة الشراء الجماعي (توفير)
 *
 * Collective buying for better discounts:
 * - Tiered discount pricing
 * - Group management
 * - Payment coordination
 * - Real-time progress tracking
 */

import prisma from '../config/database';
import { GroupBuyStatus } from '@prisma/client';

// ============================================
// Types
// ============================================

interface DiscountTier {
  minQty: number;
  discount: number; // Percentage
  price?: number;   // Calculated price
}

interface CreateGroupBuyParams {
  listingId: string;
  organizerId: string;
  title: string;
  description?: string;
  targetQuantity: number;
  maxQuantity?: number;
  discountTiers: DiscountTier[];
  endDate: Date;
  maxPerUser?: number;
}

interface JoinGroupBuyParams {
  groupBuyId: string;
  userId: string;
  quantity: number;
}

interface GroupBuyDetails {
  id: string;
  title: string;
  description: string | null;
  originalPrice: number;
  currentPrice: number;
  currentDiscount: number;
  targetQuantity: number;
  currentQuantity: number;
  maxQuantity: number | null;
  participantCount: number;
  discountTiers: DiscountTier[];
  nextTier: DiscountTier | null;
  quantityToNextTier: number;
  status: GroupBuyStatus;
  startDate: Date;
  endDate: Date;
  timeRemaining: number;
  progress: number;
  isTargetReached: boolean;
  listing: {
    id: string;
    title: string;
    images: string[];
    seller: {
      id: string;
      name: string;
      rating: number;
    };
  };
}

// ============================================
// Group Buy CRUD
// ============================================

/**
 * Create a new group buy
 */
export async function createGroupBuy(params: CreateGroupBuyParams) {
  const {
    listingId,
    organizerId,
    title,
    description,
    targetQuantity,
    maxQuantity,
    discountTiers,
    endDate,
    maxPerUser = 5,
  } = params;

  // Get listing and validate
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { item: true },
  });

  if (!listing) {
    throw new Error('Listing not found');
  }

  if (!listing.price) {
    throw new Error('Listing must have a price');
  }

  // Validate discount tiers
  if (!discountTiers || discountTiers.length === 0) {
    throw new Error('At least one discount tier is required');
  }

  // Sort tiers by minQty and calculate prices
  const sortedTiers = discountTiers
    .sort((a, b) => a.minQty - b.minQty)
    .map(tier => ({
      ...tier,
      price: listing.price! * (1 - tier.discount / 100),
    }));

  // Validate end date
  if (endDate <= new Date()) {
    throw new Error('End date must be in the future');
  }

  return prisma.groupBuy.create({
    data: {
      listingId,
      organizerId,
      title,
      description,
      originalPrice: listing.price,
      targetQuantity,
      maxQuantity,
      discountTiers: sortedTiers,
      currentPrice: listing.price,
      startDate: new Date(),
      endDate,
      maxPerUser,
      status: 'ACTIVE',
    },
    include: {
      listing: {
        include: {
          item: true,
          user: true,
        },
      },
    },
  });
}

/**
 * Get group buy by ID
 */
export async function getGroupBuy(groupBuyId: string): Promise<GroupBuyDetails | null> {
  const groupBuy = await prisma.groupBuy.findUnique({
    where: { id: groupBuyId },
    include: {
      listing: {
        include: {
          item: true,
          user: {
            select: {
              id: true,
              fullName: true,
              rating: true,
            },
          },
        },
      },
    },
  });

  if (!groupBuy) return null;

  return transformToDetails(groupBuy);
}

/**
 * Get active group buys
 */
export async function getActiveGroupBuys(options?: {
  limit?: number;
  offset?: number;
  categoryId?: string;
}): Promise<GroupBuyDetails[]> {
  const { limit = 20, offset = 0, categoryId } = options || {};

  const groupBuys = await prisma.groupBuy.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { gt: new Date() },
      ...(categoryId && { listing: { item: { categoryId } } }),
    },
    include: {
      listing: {
        include: {
          item: true,
          user: {
            select: {
              id: true,
              fullName: true,
              rating: true,
            },
          },
        },
      },
    },
    orderBy: [
      { participantCount: 'desc' },
      { createdAt: 'desc' },
    ],
    take: limit,
    skip: offset,
  });

  return groupBuys.map(transformToDetails);
}

/**
 * Get user's group buys
 */
export async function getUserGroupBuys(userId: string) {
  // As organizer
  const organized = await prisma.groupBuy.findMany({
    where: { organizerId: userId },
    include: {
      listing: { include: { item: true } },
      _count: { select: { participants: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  // As participant
  const participating = await prisma.groupBuyParticipant.findMany({
    where: { userId },
    include: {
      groupBuy: {
        include: {
          listing: { include: { item: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return {
    organized,
    participating: participating.map(p => ({
      participation: p,
      groupBuy: p.groupBuy,
    })),
  };
}

// ============================================
// Participation
// ============================================

/**
 * Join a group buy
 */
export async function joinGroupBuy(params: JoinGroupBuyParams) {
  const { groupBuyId, userId, quantity } = params;

  const groupBuy = await prisma.groupBuy.findUnique({
    where: { id: groupBuyId },
    include: {
      participants: { where: { userId } },
    },
  });

  if (!groupBuy) {
    throw new Error('Group buy not found');
  }

  if (groupBuy.status !== 'ACTIVE') {
    throw new Error('Group buy is not active');
  }

  if (new Date() > groupBuy.endDate) {
    throw new Error('Group buy has ended');
  }

  // Check organizer not joining own group buy
  if (groupBuy.organizerId === userId) {
    throw new Error('Organizer cannot join their own group buy');
  }

  // Check existing participation
  if (groupBuy.participants.length > 0) {
    throw new Error('Already participating in this group buy');
  }

  // Check max per user
  if (quantity > groupBuy.maxPerUser) {
    throw new Error(`Maximum ${groupBuy.maxPerUser} items per user`);
  }

  // Check max quantity
  if (groupBuy.maxQuantity &&
      groupBuy.currentQuantity + quantity > groupBuy.maxQuantity) {
    throw new Error('Exceeds maximum group buy quantity');
  }

  // Create participation
  const [participant] = await prisma.$transaction([
    prisma.groupBuyParticipant.create({
      data: {
        groupBuyId,
        userId,
        quantity,
        unitPrice: groupBuy.currentPrice,
        totalPrice: groupBuy.currentPrice * quantity,
      },
    }),
    prisma.groupBuy.update({
      where: { id: groupBuyId },
      data: {
        currentQuantity: { increment: quantity },
        participantCount: { increment: 1 },
      },
    }),
  ]);

  // Update pricing after new participation
  await updateGroupBuyPricing(groupBuyId);

  return participant;
}

/**
 * Update quantity in group buy
 */
export async function updateParticipation(
  groupBuyId: string,
  userId: string,
  newQuantity: number
) {
  const participation = await prisma.groupBuyParticipant.findUnique({
    where: {
      groupBuyId_userId: { groupBuyId, userId },
    },
    include: { groupBuy: true },
  });

  if (!participation) {
    throw new Error('Not participating in this group buy');
  }

  if (participation.status !== 'JOINED') {
    throw new Error('Cannot update participation after payment');
  }

  if (newQuantity > participation.groupBuy.maxPerUser) {
    throw new Error(`Maximum ${participation.groupBuy.maxPerUser} items per user`);
  }

  const quantityDiff = newQuantity - participation.quantity;

  await prisma.$transaction([
    prisma.groupBuyParticipant.update({
      where: { id: participation.id },
      data: {
        quantity: newQuantity,
        unitPrice: participation.groupBuy.currentPrice,
        totalPrice: participation.groupBuy.currentPrice * newQuantity,
      },
    }),
    prisma.groupBuy.update({
      where: { id: groupBuyId },
      data: {
        currentQuantity: { increment: quantityDiff },
      },
    }),
  ]);

  await updateGroupBuyPricing(groupBuyId);

  return { success: true };
}

/**
 * Leave group buy
 */
export async function leaveGroupBuy(groupBuyId: string, userId: string) {
  const participation = await prisma.groupBuyParticipant.findUnique({
    where: {
      groupBuyId_userId: { groupBuyId, userId },
    },
  });

  if (!participation) {
    throw new Error('Not participating in this group buy');
  }

  if (participation.status !== 'JOINED') {
    throw new Error('Cannot leave after payment');
  }

  await prisma.$transaction([
    prisma.groupBuyParticipant.delete({
      where: { id: participation.id },
    }),
    prisma.groupBuy.update({
      where: { id: groupBuyId },
      data: {
        currentQuantity: { decrement: participation.quantity },
        participantCount: { decrement: 1 },
      },
    }),
  ]);

  await updateGroupBuyPricing(groupBuyId);

  return { success: true };
}

// ============================================
// Pricing Updates
// ============================================

/**
 * Update group buy pricing based on current quantity
 */
async function updateGroupBuyPricing(groupBuyId: string) {
  const groupBuy = await prisma.groupBuy.findUnique({
    where: { id: groupBuyId },
  });

  if (!groupBuy) return;

  const tiers = groupBuy.discountTiers as DiscountTier[];

  // Find applicable tier
  let applicableTier: DiscountTier | null = null;
  for (const tier of tiers) {
    if (groupBuy.currentQuantity >= tier.minQty) {
      applicableTier = tier;
    } else {
      break;
    }
  }

  const currentDiscount = applicableTier?.discount || 0;
  const currentPrice = groupBuy.originalPrice * (1 - currentDiscount / 100);

  // Check if target reached
  const isTargetReached = groupBuy.currentQuantity >= groupBuy.targetQuantity;
  const newStatus: GroupBuyStatus = isTargetReached ? 'TARGET_REACHED' : 'ACTIVE';

  await prisma.groupBuy.update({
    where: { id: groupBuyId },
    data: {
      currentDiscount,
      currentPrice,
      status: groupBuy.status === 'ACTIVE' ? newStatus : groupBuy.status,
    },
  });

  // Update all participants' prices
  await prisma.groupBuyParticipant.updateMany({
    where: {
      groupBuyId,
      status: 'JOINED',
    },
    data: {
      unitPrice: currentPrice,
    },
  });

  // Recalculate total prices for each participant
  const participants = await prisma.groupBuyParticipant.findMany({
    where: { groupBuyId, status: 'JOINED' },
  });

  for (const p of participants) {
    await prisma.groupBuyParticipant.update({
      where: { id: p.id },
      data: {
        totalPrice: currentPrice * p.quantity,
      },
    });
  }
}

// ============================================
// Status Management
// ============================================

/**
 * Confirm group buy (after target reached)
 */
export async function confirmGroupBuy(groupBuyId: string, organizerId: string) {
  const groupBuy = await prisma.groupBuy.findUnique({
    where: { id: groupBuyId },
  });

  if (!groupBuy) {
    throw new Error('Group buy not found');
  }

  if (groupBuy.organizerId !== organizerId) {
    throw new Error('Only organizer can confirm');
  }

  if (groupBuy.status !== 'TARGET_REACHED') {
    throw new Error('Target not yet reached');
  }

  return prisma.groupBuy.update({
    where: { id: groupBuyId },
    data: {
      status: 'CONFIRMED',
      confirmedAt: new Date(),
    },
  });
}

/**
 * Complete group buy
 */
export async function completeGroupBuy(groupBuyId: string) {
  return prisma.groupBuy.update({
    where: { id: groupBuyId },
    data: {
      status: 'COMPLETED',
      completedAt: new Date(),
    },
  });
}

/**
 * Cancel group buy
 */
export async function cancelGroupBuy(groupBuyId: string, organizerId: string) {
  const groupBuy = await prisma.groupBuy.findUnique({
    where: { id: groupBuyId },
  });

  if (!groupBuy) {
    throw new Error('Group buy not found');
  }

  if (groupBuy.organizerId !== organizerId) {
    throw new Error('Only organizer can cancel');
  }

  // Can only cancel if not confirmed
  if (['CONFIRMED', 'COMPLETED'].includes(groupBuy.status)) {
    throw new Error('Cannot cancel after confirmation');
  }

  // Cancel all participations
  await prisma.groupBuyParticipant.updateMany({
    where: { groupBuyId },
    data: { status: 'CANCELLED' },
  });

  return prisma.groupBuy.update({
    where: { id: groupBuyId },
    data: { status: 'CANCELLED' },
  });
}

/**
 * Check and expire ended group buys
 */
export async function expireEndedGroupBuys() {
  const ended = await prisma.groupBuy.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: new Date() },
    },
  });

  for (const groupBuy of ended) {
    const newStatus: GroupBuyStatus =
      groupBuy.currentQuantity >= groupBuy.targetQuantity
        ? 'TARGET_REACHED'
        : 'FAILED';

    await prisma.groupBuy.update({
      where: { id: groupBuy.id },
      data: { status: newStatus },
    });

    if (newStatus === 'FAILED') {
      // Refund all participants
      await prisma.groupBuyParticipant.updateMany({
        where: { groupBuyId: groupBuy.id },
        data: { status: 'REFUNDED' },
      });
    }
  }

  return ended.length;
}

// ============================================
// Payment
// ============================================

/**
 * Record participant payment
 */
export async function recordPayment(
  groupBuyId: string,
  userId: string,
  paymentMethod: string,
  paymentRef: string
) {
  const participation = await prisma.groupBuyParticipant.findUnique({
    where: {
      groupBuyId_userId: { groupBuyId, userId },
    },
  });

  if (!participation) {
    throw new Error('Participation not found');
  }

  return prisma.groupBuyParticipant.update({
    where: { id: participation.id },
    data: {
      status: 'PAID',
      paidAt: new Date(),
      paymentMethod,
      paymentRef,
    },
  });
}

// ============================================
// Statistics
// ============================================

/**
 * Record group buy view
 */
export async function recordView(groupBuyId: string) {
  await prisma.groupBuy.update({
    where: { id: groupBuyId },
    data: { viewCount: { increment: 1 } },
  });
}

/**
 * Get group buy statistics
 */
export async function getStats(groupBuyId: string) {
  const groupBuy = await prisma.groupBuy.findUnique({
    where: { id: groupBuyId },
    include: {
      participants: true,
    },
  });

  if (!groupBuy) return null;

  const totalSavings = groupBuy.participants.reduce((sum, p) => {
    return sum + (groupBuy.originalPrice - p.unitPrice) * p.quantity;
  }, 0);

  const paidCount = groupBuy.participants.filter(p => p.status === 'PAID').length;

  return {
    participantCount: groupBuy.participantCount,
    paidCount,
    currentQuantity: groupBuy.currentQuantity,
    targetQuantity: groupBuy.targetQuantity,
    progress: (groupBuy.currentQuantity / groupBuy.targetQuantity) * 100,
    currentDiscount: groupBuy.currentDiscount,
    totalSavings,
    viewCount: groupBuy.viewCount,
  };
}

// ============================================
// Helpers
// ============================================

function transformToDetails(groupBuy: any): GroupBuyDetails {
  const tiers = groupBuy.discountTiers as DiscountTier[];
  const now = Date.now();
  const timeRemaining = Math.max(0, groupBuy.endDate.getTime() - now);

  // Find next tier
  let nextTier: DiscountTier | null = null;
  let quantityToNextTier = 0;

  for (const tier of tiers) {
    if (groupBuy.currentQuantity < tier.minQty) {
      nextTier = tier;
      quantityToNextTier = tier.minQty - groupBuy.currentQuantity;
      break;
    }
  }

  const progress = Math.min(100, (groupBuy.currentQuantity / groupBuy.targetQuantity) * 100);

  return {
    id: groupBuy.id,
    title: groupBuy.title,
    description: groupBuy.description,
    originalPrice: groupBuy.originalPrice,
    currentPrice: groupBuy.currentPrice,
    currentDiscount: groupBuy.currentDiscount,
    targetQuantity: groupBuy.targetQuantity,
    currentQuantity: groupBuy.currentQuantity,
    maxQuantity: groupBuy.maxQuantity,
    participantCount: groupBuy.participantCount,
    discountTiers: tiers,
    nextTier,
    quantityToNextTier,
    status: groupBuy.status,
    startDate: groupBuy.startDate,
    endDate: groupBuy.endDate,
    timeRemaining,
    progress,
    isTargetReached: groupBuy.currentQuantity >= groupBuy.targetQuantity,
    listing: {
      id: groupBuy.listing.id,
      title: groupBuy.listing.item.title,
      images: groupBuy.listing.item.images,
      seller: {
        id: groupBuy.listing.user.id,
        name: groupBuy.listing.user.fullName,
        rating: groupBuy.listing.user.rating,
      },
    },
  };
}
