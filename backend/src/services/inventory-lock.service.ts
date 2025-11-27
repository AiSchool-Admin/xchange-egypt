/**
 * Inventory Lock Service
 *
 * Manages item locking to prevent race conditions and double-booking
 * in competing barter chains and offers.
 *
 * Lock Types:
 * - SOFT: Advisory lock, can be overridden by HARD locks
 * - HARD: Strict lock, prevents all other operations
 * - RESERVED: Item reserved for specific chain/offer
 */

import { PrismaClient, LockType, LockStatus } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

const prisma = new PrismaClient();

// ============================================
// Types
// ============================================

export interface LockItemInput {
  itemId: string;
  userId: string;
  lockType?: LockType;
  durationMinutes?: number;
  chainId?: string;
  offerId?: string;
}

export interface ReleaseLockInput {
  lockId: string;
  userId: string;
  reason?: string;
}

export interface CheckLockInput {
  itemId: string;
  excludeLockId?: string;
}

// ============================================
// Lock Management
// ============================================

/**
 * Lock an item to prevent concurrent modifications
 * Checks for existing locks before creating new one
 */
export const lockItem = async (input: LockItemInput) => {
  const {
    itemId,
    userId,
    lockType = LockType.SOFT,
    durationMinutes = 30,
    chainId,
    offerId,
  } = input;

  // Verify item exists
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    select: { id: true, sellerId: true, status: true },
  });

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  if (item.sellerId !== userId) {
    throw new ForbiddenError('You do not own this item');
  }

  if (item.status !== 'ACTIVE') {
    throw new BadRequestError('Item is not available for locking');
  }

  // Check for existing active locks
  const existingLock = await prisma.inventoryLock.findFirst({
    where: {
      itemId,
      lockStatus: LockStatus.ACTIVE,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: 'desc' },
  });

  // If there's an existing HARD lock, prevent new lock
  if (existingLock && existingLock.lockType === LockType.HARD) {
    throw new BadRequestError(
      `Item is hard-locked until ${existingLock.expiresAt.toISOString()}`
    );
  }

  // If trying to create SOFT lock but HARD lock exists, prevent
  if (existingLock && lockType === LockType.SOFT && existingLock.lockType === LockType.HARD) {
    throw new BadRequestError('Cannot create soft lock when hard lock exists');
  }

  // Calculate expiration time
  const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

  // If upgrading from SOFT to HARD/RESERVED, update existing lock
  if (existingLock && existingLock.userId === userId && lockType !== LockType.SOFT) {
    return await prisma.inventoryLock.update({
      where: { id: existingLock.id },
      data: {
        lockType,
        expiresAt,
        lockedByChainId: chainId || existingLock.lockedByChainId,
        lockedByOfferId: offerId || existingLock.lockedByOfferId,
      },
    });
  }

  // Create new lock
  const lock = await prisma.inventoryLock.create({
    data: {
      itemId,
      userId,
      lockType,
      lockStatus: LockStatus.ACTIVE,
      expiresAt,
      lockedByChainId: chainId,
      lockedByOfferId: offerId,
      autoRelease: true,
    },
  });

  return lock;
};

/**
 * Release a lock manually
 */
export const releaseLock = async (input: ReleaseLockInput) => {
  const { lockId, userId, reason } = input;

  const lock = await prisma.inventoryLock.findUnique({
    where: { id: lockId },
  });

  if (!lock) {
    throw new NotFoundError('Lock not found');
  }

  if (lock.lockStatus !== LockStatus.ACTIVE) {
    throw new BadRequestError('Lock is not active');
  }

  // Only the lock owner can release it
  if (lock.userId !== userId) {
    throw new ForbiddenError('You do not own this lock');
  }

  const released = await prisma.inventoryLock.update({
    where: { id: lockId },
    data: {
      lockStatus: LockStatus.RELEASED,
      releasedAt: new Date(),
      releasedBy: userId,
      releaseReason: reason,
    },
  });

  return released;
};

/**
 * Release all locks for a specific chain
 * Used when chain is rejected or cancelled
 */
export const releaseChainLocks = async (chainId: string, userId: string, reason?: string) => {
  const locks = await prisma.inventoryLock.findMany({
    where: {
      lockedByChainId: chainId,
      lockStatus: LockStatus.ACTIVE,
    },
  });

  if (locks.length === 0) {
    return [];
  }

  // Release all locks
  const released = await prisma.inventoryLock.updateMany({
    where: {
      lockedByChainId: chainId,
      lockStatus: LockStatus.ACTIVE,
    },
    data: {
      lockStatus: LockStatus.RELEASED,
      releasedAt: new Date(),
      releasedBy: userId,
      releaseReason: reason || 'Chain cancelled/rejected',
    },
  });

  return locks;
};

/**
 * Release all locks for a specific offer
 */
export const releaseOfferLocks = async (offerId: string, userId: string, reason?: string) => {
  const locks = await prisma.inventoryLock.findMany({
    where: {
      lockedByOfferId: offerId,
      lockStatus: LockStatus.ACTIVE,
    },
  });

  if (locks.length === 0) {
    return [];
  }

  await prisma.inventoryLock.updateMany({
    where: {
      lockedByOfferId: offerId,
      lockStatus: LockStatus.ACTIVE,
    },
    data: {
      lockStatus: LockStatus.RELEASED,
      releasedAt: new Date(),
      releasedBy: userId,
      releaseReason: reason || 'Offer cancelled/rejected',
    },
  });

  return locks;
};

/**
 * Upgrade locks from SOFT to HARD
 * Used when barter chain is accepted by all parties
 */
export const upgradeLocks = async (chainId: string, toType: LockType = LockType.HARD) => {
  const locks = await prisma.inventoryLock.findMany({
    where: {
      lockedByChainId: chainId,
      lockStatus: LockStatus.ACTIVE,
      lockType: LockType.SOFT,
    },
  });

  if (locks.length === 0) {
    return [];
  }

  await prisma.inventoryLock.updateMany({
    where: {
      lockedByChainId: chainId,
      lockStatus: LockStatus.ACTIVE,
      lockType: LockType.SOFT,
    },
    data: {
      lockType: toType,
      // Extend expiration by 24 hours for hard locks
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  return locks;
};

// ============================================
// Lock Queries
// ============================================

/**
 * Check if an item is locked
 * Returns active lock or null
 */
export const checkItemLock = async (input: CheckLockInput) => {
  const { itemId, excludeLockId } = input;

  const where: any = {
    itemId,
    lockStatus: LockStatus.ACTIVE,
    expiresAt: { gt: new Date() },
  };

  if (excludeLockId) {
    where.id = { not: excludeLockId };
  }

  const lock = await prisma.inventoryLock.findFirst({
    where,
    orderBy: { createdAt: 'desc' },
  });

  return lock;
};

/**
 * Check if item is available for locking
 * Returns true if no active locks or only SOFT locks exist
 */
export const isItemAvailable = async (itemId: string, allowSoftLock: boolean = true) => {
  const lock = await checkItemLock({ itemId });

  if (!lock) {
    return true; // No locks
  }

  // If HARD or RESERVED lock exists, item is not available
  if (lock.lockType === LockType.HARD || lock.lockType === LockType.RESERVED) {
    return false;
  }

  // If only SOFT lock exists and soft locks are allowed, item is available
  if (lock.lockType === LockType.SOFT && allowSoftLock) {
    return true;
  }

  return false;
};

/**
 * Get all locks for an item (including expired)
 */
export const getItemLocks = async (itemId: string) => {
  const locks = await prisma.inventoryLock.findMany({
    where: { itemId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return locks;
};

/**
 * Get all active locks for a user
 */
export const getUserLocks = async (userId: string) => {
  const locks = await prisma.inventoryLock.findMany({
    where: {
      userId,
      lockStatus: LockStatus.ACTIVE,
      expiresAt: { gt: new Date() },
    },
    include: {
      item: {
        select: {
          id: true,
          title: true,
          images: true,
          estimatedValue: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return locks;
};

/**
 * Get all locks for a chain
 */
export const getChainLocks = async (chainId: string) => {
  const locks = await prisma.inventoryLock.findMany({
    where: { lockedByChainId: chainId },
    include: {
      item: {
        select: {
          id: true,
          title: true,
          images: true,
          estimatedValue: true,
          sellerId: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return locks;
};

// ============================================
// Cleanup
// ============================================

/**
 * Expire old locks automatically
 * Should be called by a background job
 */
export const expireOldLocks = async () => {
  const expiredLocks = await prisma.inventoryLock.findMany({
    where: {
      lockStatus: LockStatus.ACTIVE,
      expiresAt: { lt: new Date() },
      autoRelease: true,
    },
  });

  if (expiredLocks.length === 0) {
    return { expired: 0, locks: [] };
  }

  await prisma.inventoryLock.updateMany({
    where: {
      lockStatus: LockStatus.ACTIVE,
      expiresAt: { lt: new Date() },
      autoRelease: true,
    },
    data: {
      lockStatus: LockStatus.EXPIRED,
      releasedAt: new Date(),
    },
  });

  return { expired: expiredLocks.length, locks: expiredLocks };
};

/**
 * Get lock statistics
 */
export const getLockStats = async () => {
  const [active, expired, released, byType] = await Promise.all([
    prisma.inventoryLock.count({
      where: {
        lockStatus: LockStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
    }),
    prisma.inventoryLock.count({
      where: { lockStatus: LockStatus.EXPIRED },
    }),
    prisma.inventoryLock.count({
      where: { lockStatus: LockStatus.RELEASED },
    }),
    prisma.inventoryLock.groupBy({
      by: ['lockType'],
      where: {
        lockStatus: LockStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
      _count: true,
    }),
  ]);

  return {
    active,
    expired,
    released,
    byType: byType.reduce((acc, item) => {
      acc[item.lockType] = item._count;
      return acc;
    }, {} as Record<string, number>),
  };
};
