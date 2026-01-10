/**
 * Collective Barter Pools Service
 * خدمة صناديق المقايضة الجماعية
 */

import { BarterPoolStatus } from '../types';
import prisma from '../lib/prisma';
import { createNotification } from './notification.service';

// ============================================
// Types & Interfaces
// ============================================

interface CreatePoolParams {
  creatorId: string;
  title: string;
  description: string;
  targetCategoryId?: string;
  targetDescription: string;
  targetMinValue: number;
  targetMaxValue: number;
  maxParticipants?: number;
  deadlineDays: number;
  initialContribution?: {
    itemId?: string;
    cashAmount?: number;
    xcoinAmount?: number;
  };
}

interface JoinPoolParams {
  poolId: string;
  userId: string;
  itemId?: string;
  cashAmount?: number;
  xcoinAmount?: number;
}

// ============================================
// Core Pool Functions
// ============================================

/**
 * Create a new barter pool
 * إنشاء صندوق مقايضة جماعية جديد
 */
export async function createPool(params: CreatePoolParams) {
  const {
    creatorId,
    title,
    description,
    targetCategoryId,
    targetDescription,
    targetMinValue,
    targetMaxValue,
    maxParticipants = 10,
    deadlineDays,
    initialContribution,
  } = params;

  // Calculate deadline
  const deadline = new Date();
  deadline.setDate(deadline.getDate() + deadlineDays);

  // Start transaction
  const result = await prisma.$transaction(async (tx) => {
    // Create pool
    const pool = await tx.barterPool.create({
      data: {
        title,
        description,
        targetCategoryId,
        targetDescription,
        targetMinValue,
        targetMaxValue,
        maxParticipants,
        status: BarterPoolStatus.OPEN,
        creatorId,
        deadline,
        currentValue: 0,
        participantCount: 0,
      },
    });

    // Add creator as first participant if they have initial contribution
    if (initialContribution) {
      const totalValue = await calculateContributionValue(
        initialContribution.itemId,
        initialContribution.cashAmount,
        initialContribution.xcoinAmount
      );

      if (totalValue > 0) {
        await tx.barterPoolParticipant.create({
          data: {
            poolId: pool.id,
            userId: creatorId,
            itemId: initialContribution.itemId,
            cashAmount: initialContribution.cashAmount || 0,
            xcoinAmount: initialContribution.xcoinAmount || 0,
            totalValue,
            sharePercentage: 100, // Will be recalculated
            isApproved: true,
            approvedAt: new Date(),
          },
        });

        // Update pool
        await tx.barterPool.update({
          where: { id: pool.id },
          data: {
            currentValue: totalValue,
            participantCount: 1,
          },
        });
      }
    }

    return pool;
  });

  return result;
}

/**
 * Join an existing pool
 * الانضمام لصندوق موجود
 */
export async function joinPool(params: JoinPoolParams): Promise<{ success: boolean; error?: string }> {
  const { poolId, userId, itemId, cashAmount = 0, xcoinAmount = 0 } = params;

  const pool = await prisma.barterPool.findUnique({
    where: { id: poolId },
    include: { participants: true },
  });

  if (!pool) {
    return { success: false, error: 'Pool not found' };
  }

  if (pool.status !== BarterPoolStatus.OPEN) {
    return { success: false, error: 'Pool is not open for new participants' };
  }

  if (pool.participantCount >= pool.maxParticipants) {
    return { success: false, error: 'Pool is full' };
  }

  if (new Date() > pool.deadline) {
    return { success: false, error: 'Pool deadline has passed' };
  }

  // Check if user already joined
  const existingParticipant = pool.participants.find(p => p.userId === userId);
  if (existingParticipant) {
    return { success: false, error: 'Already joined this pool' };
  }

  // Calculate contribution value
  const totalValue = await calculateContributionValue(itemId, cashAmount, xcoinAmount);

  if (totalValue <= 0) {
    return { success: false, error: 'Contribution must have value' };
  }

  // Validate item ownership if providing item
  if (itemId) {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item || item.sellerId !== userId) {
      return { success: false, error: 'Invalid item or not owned by user' };
    }
    if (item.status !== 'ACTIVE') {
      return { success: false, error: 'Item is not available' };
    }
  }

  await prisma.$transaction(async (tx) => {
    // Add participant
    await tx.barterPoolParticipant.create({
      data: {
        poolId,
        userId,
        itemId,
        cashAmount,
        xcoinAmount,
        totalValue,
        sharePercentage: 0, // Will be calculated
        isApproved: false,
      },
    });

    // Update pool value and count
    const newTotalValue = pool.currentValue + totalValue;
    const newParticipantCount = pool.participantCount + 1;

    await tx.barterPool.update({
      where: { id: poolId },
      data: {
        currentValue: newTotalValue,
        participantCount: newParticipantCount,
      },
    });

    // Recalculate share percentages for all participants
    await recalculateShares(tx, poolId);
  });

  return { success: true };
}

/**
 * Approve participant (by pool creator)
 * الموافقة على مشارك
 */
export async function approveParticipant(
  poolId: string,
  participantUserId: string,
  approvedBy: string
): Promise<{ success: boolean; error?: string }> {
  const pool = await prisma.barterPool.findUnique({ where: { id: poolId } });

  if (!pool) {
    return { success: false, error: 'Pool not found' };
  }

  if (pool.creatorId !== approvedBy) {
    return { success: false, error: 'Only pool creator can approve participants' };
  }

  const participant = await prisma.barterPoolParticipant.findUnique({
    where: { poolId_userId: { poolId, userId: participantUserId } },
  });

  if (!participant) {
    return { success: false, error: 'Participant not found' };
  }

  if (participant.isApproved) {
    return { success: false, error: 'Participant already approved' };
  }

  await prisma.barterPoolParticipant.update({
    where: { id: participant.id },
    data: {
      isApproved: true,
      approvedAt: new Date(),
    },
  });

  return { success: true };
}

/**
 * Leave pool (before matching)
 * مغادرة الصندوق
 */
export async function leavePool(
  poolId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const pool = await prisma.barterPool.findUnique({ where: { id: poolId } });

  if (!pool) {
    return { success: false, error: 'Pool not found' };
  }

  if (pool.status !== BarterPoolStatus.OPEN) {
    return { success: false, error: 'Cannot leave pool after matching started' };
  }

  if (pool.creatorId === userId) {
    return { success: false, error: 'Creator cannot leave pool. Cancel it instead.' };
  }

  const participant = await prisma.barterPoolParticipant.findUnique({
    where: { poolId_userId: { poolId, userId } },
  });

  if (!participant) {
    return { success: false, error: 'Not a participant in this pool' };
  }

  await prisma.$transaction(async (tx) => {
    // Remove participant
    await tx.barterPoolParticipant.delete({
      where: { id: participant.id },
    });

    // Update pool
    await tx.barterPool.update({
      where: { id: poolId },
      data: {
        currentValue: { decrement: participant.totalValue },
        participantCount: { decrement: 1 },
      },
    });

    // Recalculate shares
    await recalculateShares(tx, poolId);
  });

  return { success: true };
}

/**
 * Start matching process
 * بدء عملية المطابقة
 */
export async function startMatching(
  poolId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const pool = await prisma.barterPool.findUnique({
    where: { id: poolId },
    include: { participants: { where: { isApproved: true } } },
  });

  if (!pool) {
    return { success: false, error: 'Pool not found' };
  }

  if (pool.creatorId !== userId) {
    return { success: false, error: 'Only creator can start matching' };
  }

  if (pool.status !== BarterPoolStatus.OPEN) {
    return { success: false, error: 'Pool is not in open status' };
  }

  if (pool.participants.length < 2) {
    return { success: false, error: 'Need at least 2 approved participants' };
  }

  // Check if pool value meets target
  if (pool.currentValue < pool.targetMinValue) {
    return { success: false, error: `Pool value (${pool.currentValue}) below minimum target (${pool.targetMinValue})` };
  }

  await prisma.barterPool.update({
    where: { id: poolId },
    data: { status: BarterPoolStatus.MATCHING },
  });

  // Trigger matching algorithm (async)
  findMatchingOffers(poolId);

  return { success: true };
}

/**
 * Cancel pool
 * إلغاء الصندوق
 */
export async function cancelPool(
  poolId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const pool = await prisma.barterPool.findUnique({ where: { id: poolId } });

  if (!pool) {
    return { success: false, error: 'Pool not found' };
  }

  if (pool.creatorId !== userId) {
    return { success: false, error: 'Only creator can cancel pool' };
  }

  if (pool.status === BarterPoolStatus.EXECUTING || pool.status === BarterPoolStatus.COMPLETED) {
    return { success: false, error: 'Cannot cancel pool in execution or completed' };
  }

  await prisma.barterPool.update({
    where: { id: poolId },
    data: { status: BarterPoolStatus.CANCELLED },
  });

  return { success: true };
}

// ============================================
// Matching Functions
// ============================================

/**
 * Find matching offers for pool
 * البحث عن عروض مطابقة للصندوق
 */
async function findMatchingOffers(poolId: string) {
  const pool = await prisma.barterPool.findUnique({
    where: { id: poolId },
    include: { participants: { where: { isApproved: true } } },
  });

  if (!pool) return;

  // Find items that match pool criteria
  const matchingItems = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      listingType: { in: ['DIRECT_SALE', 'BARTER'] },
      estimatedValue: {
        gte: pool.targetMinValue,
        lte: pool.targetMaxValue,
      },
      ...(pool.targetCategoryId ? { categoryId: pool.targetCategoryId } : {}),
      // Exclude items from pool participants
      sellerId: { notIn: pool.participants.map(p => p.userId) },
    },
    orderBy: { estimatedValue: 'asc' },
    take: 10,
  });

  if (matchingItems.length === 0) {
    // No matches found
    await prisma.barterPool.update({
      where: { id: poolId },
      data: { status: BarterPoolStatus.OPEN }, // Back to open
    });
    return;
  }

  // For simplicity, take the best match
  const bestMatch = matchingItems[0];

  const updatedPool = await prisma.barterPool.update({
    where: { id: poolId },
    data: {
      status: BarterPoolStatus.MATCHED,
      matchedItemId: bestMatch.id,
      matchedSellerId: bestMatch.sellerId,
      matchedValue: bestMatch.estimatedValue,
    },
    include: { participants: true },
  });

  // Send notifications to all participants
  for (const participant of updatedPool.participants) {
    await createNotification({
      userId: participant.userId,
      type: 'BARTER_POOL_MATCH',
      title: 'تم إيجاد مطابقة!',
      message: `تم إيجاد سلعة مطابقة لصندوق "${pool.title}" بقيمة ${bestMatch.estimatedValue.toLocaleString()} ج.م`,
      priority: 'HIGH',
      entityType: 'BARTER_POOL',
      entityId: poolId,
      actionUrl: `/pools/${poolId}`,
      actionText: 'عرض المطابقة',
    });
  }

  // Notify the matched seller
  await createNotification({
    userId: bestMatch.sellerId,
    type: 'BARTER_POOL_INTEREST',
    title: 'صندوق مهتم بسلعتك!',
    message: `صندوق "${pool.title}" مهتم بسلعتك "${bestMatch.title}". يمكنهم تقديم عرض قريباً.`,
    priority: 'MEDIUM',
    entityType: 'BARTER_POOL',
    entityId: poolId,
    actionUrl: `/pools/${poolId}`,
    actionText: 'عرض التفاصيل',
  });
}

/**
 * Accept match (by pool creator on behalf of pool)
 * قبول المطابقة
 */
export async function acceptMatch(
  poolId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const pool = await prisma.barterPool.findUnique({ where: { id: poolId } });

  if (!pool) {
    return { success: false, error: 'Pool not found' };
  }

  if (pool.creatorId !== userId) {
    return { success: false, error: 'Only creator can accept match' };
  }

  if (pool.status !== BarterPoolStatus.MATCHED) {
    return { success: false, error: 'Pool has no active match' };
  }

  const updatedPool = await prisma.barterPool.update({
    where: { id: poolId },
    data: { status: BarterPoolStatus.NEGOTIATING },
    include: { participants: true },
  });

  // Send negotiation request to matched seller
  if (pool.matchedSellerId) {
    await createNotification({
      userId: pool.matchedSellerId,
      type: 'BARTER_POOL_NEGOTIATION',
      title: 'طلب تفاوض جديد!',
      message: `صندوق "${pool.title}" مهتم بسلعتك. يمكنك بدء التفاوض الآن.`,
      priority: 'HIGH',
      entityType: 'BARTER_POOL',
      entityId: poolId,
      actionUrl: `/pools/${poolId}`,
      actionText: 'بدء التفاوض',
    });
  }

  // Notify all participants
  for (const participant of updatedPool.participants) {
    await createNotification({
      userId: participant.userId,
      type: 'BARTER_POOL_UPDATE',
      title: 'تم قبول المطابقة!',
      message: `تم قبول المطابقة في صندوق "${pool.title}". جاري التفاوض مع البائع.`,
      priority: 'MEDIUM',
      entityType: 'BARTER_POOL',
      entityId: poolId,
      actionUrl: `/pools/${poolId}`,
      actionText: 'متابعة',
    });
  }

  return { success: true };
}

/**
 * Complete pool exchange
 * إتمام تبادل الصندوق
 */
export async function completePoolExchange(
  poolId: string
): Promise<{ success: boolean; error?: string }> {
  const pool = await prisma.barterPool.findUnique({
    where: { id: poolId },
    include: { participants: { where: { isApproved: true } } },
  });

  if (!pool) {
    return { success: false, error: 'Pool not found' };
  }

  if (pool.status !== BarterPoolStatus.EXECUTING) {
    return { success: false, error: 'Pool not in executing state' };
  }

  await prisma.$transaction(async (tx) => {
    // Update pool status
    await tx.barterPool.update({
      where: { id: poolId },
      data: {
        status: BarterPoolStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Update all contributed items to TRADED status
    for (const participant of pool.participants) {
      if (participant.itemIds && participant.itemIds.length > 0) {
        await tx.item.updateMany({
          where: {
            id: { in: participant.itemIds },
          },
          data: {
            status: 'TRADED',
          },
        });
      }
    }

    // Update matched item if exists
    if (pool.matchedItemId) {
      await tx.item.update({
        where: { id: pool.matchedItemId },
        data: { status: 'TRADED' },
      });
    }
  });

  // Send completion notifications to all participants
  for (const participant of pool.participants) {
    await createNotification({
      userId: participant.userId,
      type: 'BARTER_POOL_COMPLETED',
      title: 'تم إتمام صندوق المقايضة!',
      message: `تم إتمام صندوق "${pool.title}" بنجاح. شكراً لمشاركتك!`,
      priority: 'HIGH',
      entityType: 'BARTER_POOL',
      entityId: poolId,
      actionUrl: `/pools/${poolId}`,
      actionText: 'عرض التفاصيل',
    });
  }

  return { success: true };
}

// ============================================
// Query Functions
// ============================================

/**
 * Get pool by ID
 */
export async function getPool(poolId: string) {
  return prisma.barterPool.findUnique({
    where: { id: poolId },
    include: {
      participants: {
        include: {
          // Would need to add user relation
        },
      },
    },
  });
}

/**
 * Get open pools
 */
export async function getOpenPools(options: {
  categoryId?: string;
  minValue?: number;
  maxValue?: number;
  limit?: number;
  offset?: number;
} = {}) {
  const { categoryId, minValue, maxValue, limit = 20, offset = 0 } = options;

  const where: any = {
    status: BarterPoolStatus.OPEN,
    deadline: { gt: new Date() },
  };

  if (categoryId) {
    where.targetCategoryId = categoryId;
  }

  if (minValue !== undefined) {
    where.targetMinValue = { gte: minValue };
  }

  if (maxValue !== undefined) {
    where.targetMaxValue = { lte: maxValue };
  }

  const [pools, total] = await Promise.all([
    prisma.barterPool.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.barterPool.count({ where }),
  ]);

  return { pools, total };
}

/**
 * Get user's pools
 */
export async function getUserPools(
  userId: string,
  options: {
    role?: 'CREATOR' | 'PARTICIPANT' | 'ALL';
    status?: BarterPoolStatus;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { role = 'ALL', status, limit = 20, offset = 0 } = options;

  const where: any = {};

  if (role === 'CREATOR') {
    where.creatorId = userId;
  } else if (role === 'PARTICIPANT') {
    where.participants = { some: { userId } };
  } else {
    where.OR = [
      { creatorId: userId },
      { participants: { some: { userId } } },
    ];
  }

  if (status) {
    where.status = status;
  }

  const [pools, total] = await Promise.all([
    prisma.barterPool.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: { participants: true },
    }),
    prisma.barterPool.count({ where }),
  ]);

  return { pools, total };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate contribution value
 */
async function calculateContributionValue(
  itemId?: string,
  cashAmount?: number,
  xcoinAmount?: number
): Promise<number> {
  let totalValue = (cashAmount || 0) + (xcoinAmount || 0);

  if (itemId) {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (item) {
      totalValue += item.estimatedValue;
    }
  }

  return totalValue;
}

/**
 * Recalculate share percentages
 */
async function recalculateShares(tx: any, poolId: string) {
  const pool = await tx.barterPool.findUnique({
    where: { id: poolId },
    include: { participants: true },
  });

  if (!pool || pool.currentValue === 0) return;

  // Execute all updates in parallel to avoid N+1 queries
  const updatePromises = pool.participants.map(participant => {
    const sharePercentage = (participant.totalValue / pool.currentValue) * 100;
    return tx.barterPoolParticipant.update({
      where: { id: participant.id },
      data: { sharePercentage },
    });
  });

  await Promise.all(updatePromises);
}

/**
 * Process expired pools
 */
export async function processExpiredPools() {
  const now = new Date();

  const expiredPools = await prisma.barterPool.findMany({
    where: {
      deadline: { lt: now },
      status: { in: [BarterPoolStatus.OPEN, BarterPoolStatus.MATCHING] },
    },
  });

  // Use updateMany instead of loop to avoid N+1 queries
  if (expiredPools.length > 0) {
    await prisma.barterPool.updateMany({
      where: {
        id: { in: expiredPools.map(p => p.id) },
      },
      data: { status: BarterPoolStatus.FAILED },
    });
  }

  return expiredPools.length;
}
