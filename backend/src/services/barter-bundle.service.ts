import logger from '../lib/logger';
/**
 * Barter Bundle Service
 *
 * Handles multi-item bundles and preference-based matching
 * Supports:
 * - Bundle value calculation
 * - Preference set matching
 * - Balance validation
 * - Smart recommendations
 */

import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { createNotification } from './notification.service';
import prisma from '../lib/prisma';

// ============================================
// Types and Interfaces
// ============================================

interface BundleItem {
  itemId: string;
  estimatedValue: number;
  title: string;
  condition: string;
}

interface PreferenceSetInput {
  priority: number;
  itemIds: string[];
  description?: string;
}

interface ItemRequestInput {
  description: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface CreateBundleOfferInput {
  offeredItemIds: string[];
  preferenceSets: PreferenceSetInput[];
  recipientId?: string;  // Optional for open offers
  notes?: string;
  expiresAt?: Date;
  isOpenOffer?: boolean;
  offeredCashAmount?: number;
  requestedCashAmount?: number;
  itemRequests?: ItemRequestInput[];
}

interface BundleMatchResult {
  preferenceSetId: string;
  priority: number;
  items: BundleItem[];
  totalValue: number;
  valueDifference: number;
  isBalanced: boolean;
  matchScore: number;
}

// ============================================
// Bundle Value Calculation
// ============================================

/**
 * Calculate total value of a bundle of items
 */
export const calculateBundleValue = async (itemIds: string[]): Promise<number> => {
  if (!itemIds || itemIds.length === 0) {
    return 0;
  }

  const items = await prisma.item.findMany({
    where: {
      id: { in: itemIds },
    },
    select: {
      estimatedValue: true,
    },
  });

  if (items.length !== itemIds.length) {
    throw new NotFoundError('One or more items not found');
  }

  return items.reduce((sum, item) => sum + item.estimatedValue, 0);
};

/**
 * Get bundle items with details
 */
export const getBundleItems = async (itemIds: string[]): Promise<BundleItem[]> => {
  const items = await prisma.item.findMany({
    where: {
      id: { in: itemIds },
    },
    select: {
      id: true,
      title: true,
      estimatedValue: true,
      condition: true,
    },
  });

  if (items.length !== itemIds.length) {
    throw new NotFoundError('One or more items not found');
  }

  return items.map((item) => ({
    itemId: item.id,
    estimatedValue: item.estimatedValue,
    title: item.title,
    condition: item.condition,
  }));
};

/**
 * Check if bundle is balanced
 * Balanced means value difference is within acceptable range (±30%)
 */
export const isBundleBalanced = (offeredValue: number, requestedValue: number): boolean => {
  if (offeredValue === 0 || requestedValue === 0) {
    return false;
  }

  const difference = Math.abs(offeredValue - requestedValue);
  const average = (offeredValue + requestedValue) / 2;
  const percentageDiff = (difference / average) * 100;

  // Allow up to 30% difference
  return percentageDiff <= 30;
};

/**
 * Calculate value difference percentage
 */
export const calculateValueDifference = (offeredValue: number, requestedValue: number): number => {
  if (offeredValue === 0) return requestedValue;
  if (requestedValue === 0) return -offeredValue;

  return requestedValue - offeredValue;
};

// ============================================
// Preference Set Management
// ============================================

/**
 * Create preference sets for a barter offer
 */
export const createPreferenceSets = async (
  barterOfferId: string,
  offeredBundleValue: number,
  preferenceSetsInput: PreferenceSetInput[]
): Promise<void> => {
  // Validate priorities are unique
  const priorities = preferenceSetsInput.map((ps) => ps.priority);
  const uniquePriorities = new Set(priorities);
  if (priorities.length !== uniquePriorities.size) {
    throw new BadRequestError('Preference set priorities must be unique');
  }

  // Create preference sets with items
  for (const prefSetInput of preferenceSetsInput) {
    // Get items and calculate total value (handle empty itemIds for description-only)
    const itemIds = prefSetInput.itemIds || [];
    const items = itemIds.length > 0 ? await getBundleItems(itemIds) : [];
    const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0);
    const valueDiff = calculateValueDifference(offeredBundleValue, totalValue);
    const isBalanced = offeredBundleValue > 0
      ? isBundleBalanced(offeredBundleValue, totalValue)
      : totalValue === 0;

    // Create preference set
    const preferenceSet = await prisma.barterPreferenceSet.create({
      data: {
        barterOfferId,
        priority: prefSetInput.priority,
        totalValue,
        valueDifference: valueDiff,
        isBalanced,
        description: prefSetInput.description || (items.length > 0 ? items.map((i) => i.title).join(' + ') : ''),
      },
    });

    // Create preference items only if there are items
    if (items.length > 0) {
      await prisma.barterPreferenceItem.createMany({
        data: items.map((item) => ({
          preferenceSetId: preferenceSet.id,
          itemId: item.itemId,
          itemValue: item.estimatedValue,
        })),
      });
    }
  }
};

/**
 * Get preference sets for a barter offer
 */
export const getPreferenceSets = async (barterOfferId: string): Promise<any[]> => {
  return prisma.barterPreferenceSet.findMany({
    where: { barterOfferId },
    include: {
      items: {
        include: {
          item: {
            select: {
              id: true,
              title: true,
              estimatedValue: true,
              condition: true,
              images: true,
            },
          },
        },
      },
    },
    orderBy: { priority: 'asc' },
  });
};

// ============================================
// Bundle Offer Creation
// ============================================

/**
 * Create a barter offer with bundles and preferences
 */
export const createBundleOffer = async (
  userId: string,
  input: CreateBundleOfferInput
): Promise<any> => {
  logger.info('[createBundleOffer] Starting with input:', JSON.stringify(input, null, 2));

  const {
    offeredItemIds = [],
    preferenceSets = [],
    recipientId,
    notes,
    expiresAt,
    isOpenOffer,
    offeredCashAmount = 0,
    requestedCashAmount = 0,
    itemRequests = []
  } = input;

  // Validate offered items or cash
  if (offeredItemIds.length === 0 && offeredCashAmount === 0) {
    throw new BadRequestError('Must offer at least one item or cash');
  }

  // Validate preference sets, item requests, or cash request
  if (preferenceSets.length === 0 && itemRequests.length === 0 && requestedCashAmount === 0) {
    throw new BadRequestError('Must specify what you want (items, description, or cash)');
  }

  // Verify all offered items belong to user (if any)
  let offeredBundleValue = offeredCashAmount;

  if (offeredItemIds.length > 0) {
    const offeredItems = await prisma.item.findMany({
      where: {
        id: { in: offeredItemIds },
      },
      include: {
        listings: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (offeredItems.length !== offeredItemIds.length) {
      throw new NotFoundError('One or more offered items not found');
    }

    // Check ownership
    const notOwned = offeredItems.filter((item) => item.sellerId !== userId);
    if (notOwned.length > 0) {
      throw new ForbiddenError('You can only offer your own items');
    }

    // Check for active listings
    const hasActiveListings = offeredItems.some((item) => item.listings.length > 0);
    if (hasActiveListings) {
      throw new BadRequestError('Cannot barter items that have active sale listings');
    }

    // Calculate offered bundle value (items + cash)
    offeredBundleValue = offeredItems.reduce((sum, item) => sum + item.estimatedValue, 0) + offeredCashAmount;
  }

  // Validate all preference set items exist (if any)
  if (preferenceSets.length > 0) {
    const allPreferenceItemIds = preferenceSets.flatMap((ps) => ps.itemIds || []);
    const uniquePreferenceItemIds = [...new Set(allPreferenceItemIds)];

    const preferenceItems = await prisma.item.findMany({
      where: {
        id: { in: uniquePreferenceItemIds },
      },
    });

    if (preferenceItems.length !== uniquePreferenceItemIds.length) {
      throw new NotFoundError('One or more requested items not found');
    }

    // Prevent offering items you're requesting
    const offeredItemIdsSet = new Set(offeredItemIds);
    const conflictingItems = uniquePreferenceItemIds.filter((id) => offeredItemIdsSet.has(id));
    if (conflictingItems.length > 0) {
      throw new BadRequestError('Cannot request items you are offering');
    }

    // If recipientId is specified, verify they own at least one item in preferences
    if (recipientId && !isOpenOffer) {
      const recipientOwnedItems = preferenceItems.filter((item) => item.sellerId === recipientId);
      if (recipientOwnedItems.length === 0) {
        throw new BadRequestError('Recipient does not own any of the requested items');
      }
    }
  }

  // Set expiration (default 14 days for bundle offers)
  const defaultExpiry = new Date();
  defaultExpiry.setDate(defaultExpiry.getDate() + 14);

  logger.info('[createBundleOffer] Creating barter offer with:', {
    userId,
    recipientId: isOpenOffer ? null : recipientId,
    offeredItemIds,
    offeredBundleValue,
    offeredCashAmount,
    requestedCashAmount,
    isOpenOffer: isOpenOffer || (itemRequests.length > 0),
    preferenceSetsCount: preferenceSets.length,
  });

  // Create barter offer
  let barterOffer;
  try {
    barterOffer = await prisma.barterOffer.create({
      data: {
        initiatorId: userId,
        recipientId: isOpenOffer ? null : recipientId,
        offeredItemIds,
        offeredBundleValue,
        offeredCashAmount,
        requestedCashAmount,
        notes,
        expiresAt: expiresAt || defaultExpiry,
        isOpenOffer: isOpenOffer || (itemRequests.length > 0),
        status: 'PENDING',
      },
    });
    logger.info('[createBundleOffer] Created barter offer:', barterOffer.id);
  } catch (error: any) {
    logger.error('[createBundleOffer] Error creating barter offer:', error.message, error.stack);
    throw error;
  }

  // Create preference sets (if any)
  if (preferenceSets.length > 0) {
    try {
      await createPreferenceSets(barterOffer.id, offeredBundleValue, preferenceSets);
      logger.info('[createBundleOffer] Created preference sets');
    } catch (error: any) {
      logger.error('[createBundleOffer] Error creating preference sets:', error.message, error.stack);
      throw error;
    }
  }

  // Create item requests (for description-based requests)
  if (itemRequests.length > 0) {
    await prisma.itemRequest.createMany({
      data: itemRequests.map((req) => ({
        barterOfferId: barterOffer.id,
        description: req.description,
        categoryId: req.categoryId,
        minPrice: req.minPrice,
        maxPrice: req.maxPrice,
      })),
    });
  }

  // Get complete offer with preference sets
  const completeOffer = await prisma.barterOffer.findUnique({
    where: { id: barterOffer.id },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      preferenceSets: {
        include: {
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                  estimatedValue: true,
                  condition: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { priority: 'asc' },
      },
    },
  });

  // Create notification for recipient (if specified) or for open offer
  if (completeOffer && recipientId) {
    await createNotification({
      userId: recipientId,
      type: 'BARTER_OFFER_RECEIVED',
      title: 'New Barter Offer',
      message: `${completeOffer.initiator?.fullName || 'Someone'} sent you a barter offer`,
      priority: 'HIGH',
      entityType: 'BARTER_OFFER',
      entityId: completeOffer.id,
      actionUrl: `/barter/respond/${completeOffer.id}`,
      actionText: 'View Offer',
    });
  }


  return completeOffer;
};

// ============================================
// Preference Matching
// ============================================

/**
 * Find matches for user's items in preference sets
 * Returns offers where user owns items that match preference sets
 */
export const findMatchingOffersForUser = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<any> => {
  // Get user's items
  const userItems = await prisma.item.findMany({
    where: {
      sellerId: userId,
      status: 'ACTIVE',
      listings: {
        none: {
          status: 'ACTIVE',
        },
      },
    },
    select: {
      id: true,
    },
  });

  const userItemIds = userItems.map((item) => item.id);

  if (userItemIds.length === 0) {
    return {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }

  // Find preference items that match user's items
  const matchingPreferenceItems = await prisma.barterPreferenceItem.findMany({
    where: {
      itemId: { in: userItemIds },
    },
    select: {
      preferenceSetId: true,
    },
  });

  const preferenceSetIds = [...new Set(matchingPreferenceItems.map((pi) => pi.preferenceSetId))];

  if (preferenceSetIds.length === 0) {
    return {
      items: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
        hasMore: false,
      },
    };
  }

  // Get preference sets
  const preferenceSets = await prisma.barterPreferenceSet.findMany({
    where: {
      id: { in: preferenceSetIds },
    },
    select: {
      barterOfferId: true,
    },
  });

  const offerIds = [...new Set(preferenceSets.map((ps) => ps.barterOfferId))];

  // Get matching barter offers
  const skip = (page - 1) * limit;
  const total = await prisma.barterOffer.count({
    where: {
      id: { in: offerIds },
      status: 'PENDING',
      initiatorId: { not: userId }, // Not user's own offers
    },
  });

  const offers = await prisma.barterOffer.findMany({
    where: {
      id: { in: offerIds },
      status: 'PENDING',
      initiatorId: { not: userId },
    },
    skip,
    take: limit,
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      preferenceSets: {
        include: {
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                  estimatedValue: true,
                  images: true,
                },
              },
            },
          },
        },
        orderBy: { priority: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const totalPages = Math.ceil(total / limit);

  return {
    items: offers,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};

/**
 * Get best matching preference set for user's items
 * Returns the highest priority preference set where user owns all items
 */
export const getBestMatchingPreferenceSet = async (
  offerId: string,
  userId: string
): Promise<BundleMatchResult | null> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
    include: {
      preferenceSets: {
        include: {
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                  estimatedValue: true,
                  condition: true,
                  sellerId: true,
                },
              },
            },
          },
        },
        orderBy: { priority: 'asc' },
      },
    },
  });

  if (!offer) {
    throw new NotFoundError('Barter offer not found');
  }

  // Find first preference set where user owns all items
  for (const preferenceSet of offer.preferenceSets) {
    const allItemsOwnedByUser = preferenceSet.items.every(
      (prefItem) => prefItem.item.sellerId === userId
    );

    if (allItemsOwnedByUser) {
      // Calculate match score based on value balance and priority
      const valueDiffPercentage = Math.abs(preferenceSet.valueDifference) / offer.offeredBundleValue;
      const priorityScore = 1 - (preferenceSet.priority - 1) * 0.1; // Higher priority = higher score
      const balanceScore = Math.max(0, 1 - valueDiffPercentage);
      const matchScore = (priorityScore * 0.4 + balanceScore * 0.6);

      return {
        preferenceSetId: preferenceSet.id,
        priority: preferenceSet.priority,
        items: preferenceSet.items.map((prefItem) => ({
          itemId: prefItem.item.id,
          estimatedValue: prefItem.item.estimatedValue,
          title: prefItem.item.title,
          condition: prefItem.item.condition,
        })),
        totalValue: preferenceSet.totalValue,
        valueDifference: preferenceSet.valueDifference,
        isBalanced: preferenceSet.isBalanced,
        matchScore,
      };
    }
  }

  return null;
};

// ============================================
// Helper Functions
// ============================================

/**
 * Validate user owns all items in a bundle
 */
export const validateBundleOwnership = async (
  userId: string,
  itemIds: string[]
): Promise<boolean> => {
  const items = await prisma.item.findMany({
    where: {
      id: { in: itemIds },
    },
    select: {
      sellerId: true,
    },
  });

  if (items.length !== itemIds.length) {
    return false;
  }

  return items.every((item) => item.sellerId === userId);
};

/**
 * Check if items are available for barter (not in active listings)
 */
export const areItemsAvailableForBarter = async (itemIds: string[]): Promise<boolean> => {
  const items = await prisma.item.findMany({
    where: {
      id: { in: itemIds },
    },
    include: {
      listings: {
        where: { status: 'ACTIVE' },
      },
    },
  });

  return items.every((item) => item.listings.length === 0);
};

export default {
  calculateBundleValue,
  getBundleItems,
  isBundleBalanced,
  calculateValueDifference,
  createPreferenceSets,
  getPreferenceSets,
  createBundleOffer,
  findMatchingOffersForUser,
  getBestMatchingPreferenceSet,
  validateBundleOwnership,
  areItemsAvailableForBarter,
};
