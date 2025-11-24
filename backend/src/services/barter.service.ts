import { PrismaClient, BarterOfferStatus, ItemCondition } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

const prisma = new PrismaClient();

// Types
interface CreateBarterOfferData {
  offeredItemIds: string[];
  offeredCashAmount?: number;
  requestedCashAmount?: number;
  itemRequests?: {
    description: string;
    categoryId?: string;
    subcategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    keywords?: string[];
  }[];
  preferenceSets?: {
    priority: number;
    itemIds: string[];
    description?: string;
  }[];
  recipientId?: string;
  notes?: string;
  expiresAt?: Date;
  isOpenOffer?: boolean;
}

// Helper to extract keywords from description
function extractKeywords(description: string): string[] {
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'i', 'want', 'need', 'looking', 'any', 'some'];
  return description
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word))
    .slice(0, 10);
}

interface CreateCounterOfferData {
  notes?: string;
}

interface SearchBarterableItemsParams {
  search?: string;
  categoryId?: string;
  condition?: ItemCondition;
  governorate?: string;
  excludeMyItems?: boolean;
  userId?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Create a barter offer (Simple 2-party barter)
 * NOTE: This is a simplified version. For bundle offers, use barter-bundle.service.ts
 */
export const createBarterOffer = async (
  initiatorId: string,
  offerData: CreateBarterOfferData
): Promise<any> => {
  const {
    offeredItemIds,
    offeredCashAmount = 0,
    requestedCashAmount = 0,
    itemRequests,
    preferenceSets,
    recipientId,
    notes,
    expiresAt,
    isOpenOffer
  } = offerData;

  if ((!offeredItemIds || offeredItemIds.length === 0) && offeredCashAmount <= 0) {
    throw new BadRequestError('Must offer at least one item or cash');
  }

  let offeredBundleValue = offeredCashAmount;

  if (offeredItemIds && offeredItemIds.length > 0) {
    // Verify offered items exist and belong to initiator
    const offeredItems = await prisma.item.findMany({
      where: { id: { in: offeredItemIds } },
      include: {
        listings: {
          where: { status: 'ACTIVE' },
        },
      },
    });

    if (offeredItems.length !== offeredItemIds.length) {
      throw new NotFoundError('One or more offered items not found');
    }

    const notOwned = offeredItems.filter((item) => item.sellerId !== initiatorId);
    if (notOwned.length > 0) {
      throw new ForbiddenError('You can only offer your own items');
    }

    // Check if offered items have active listings
    const hasActiveListings = offeredItems.some((item) => item.listings.length > 0);
    if (hasActiveListings) {
      throw new BadRequestError(
        'Cannot barter items that have active sale listings. Please close the listing first.'
      );
    }

    // Calculate offered bundle value including items
    offeredBundleValue += offeredItems.reduce((sum, item) => sum + item.estimatedValue, 0);
  }

  // Build preference sets data if provided
  let preferenceSetsData;
  if (preferenceSets && preferenceSets.length > 0) {
    preferenceSetsData = {
      create: await Promise.all(preferenceSets.map(async (ps) => {
        const items = ps.itemIds && ps.itemIds.length > 0
          ? await prisma.item.findMany({
              where: { id: { in: ps.itemIds } },
            })
          : [];
        const totalValue = items.reduce((sum, item) => sum + item.estimatedValue, 0);

        // Build the preference set data
        const psData: any = {
          priority: ps.priority,
          totalValue,
          valueDifference: totalValue - offeredBundleValue,
          isBalanced: offeredBundleValue > 0
            ? Math.abs(totalValue - offeredBundleValue) / offeredBundleValue < 0.2
            : totalValue === 0,
          description: ps.description,
        };

        // Only create items relation if there are items
        if (ps.itemIds && ps.itemIds.length > 0) {
          psData.items = {
            create: ps.itemIds.map(itemId => ({
              itemId,
              itemValue: items.find(i => i.id === itemId)?.estimatedValue || 0,
            })),
          };
        }

        return psData;
      })),
    };
  }

  // Build item requests data if provided
  let itemRequestsData;
  if (itemRequests && itemRequests.length > 0) {
    itemRequestsData = {
      create: itemRequests.map(req => ({
        description: req.description,
        categoryId: req.categoryId,
        subcategoryId: req.subcategoryId,
        minPrice: req.minPrice,
        maxPrice: req.maxPrice,
        condition: req.condition as ItemCondition | undefined,
        keywords: req.keywords || extractKeywords(req.description),
      })),
    };
  }

  // Create the barter offer
  const barterOffer = await prisma.barterOffer.create({
    data: {
      initiatorId,
      recipientId,
      offeredItemIds: offeredItemIds || [],
      offeredBundleValue,
      offeredCashAmount,
      requestedCashAmount,
      status: BarterOfferStatus.PENDING,
      notes,
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      isOpenOffer: isOpenOffer ?? !recipientId,
      preferenceSets: preferenceSetsData,
      itemRequests: itemRequestsData,
    },
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
              item: true,
            },
          },
        },
      },
      itemRequests: {
        include: {
          category: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
            },
          },
        },
      },
    },
  });

  return barterOffer;
};

/**
 * Get barter offer by ID
 */
export const getBarterOfferById = async (
  offerId: string,
  userId: string
): Promise<any> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
        },
      },
      preferenceSets: {
        include: {
          items: {
            include: {
              item: {
                include: {
                  category: {
                    select: {
                      id: true,
                      nameAr: true,
                      nameEn: true,
                    },
                  },
                },
              },
            },
          },
        },
      },
      itemRequests: {
        include: {
          category: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
            },
          },
        },
      },
    },
  });

  if (!offer) {
    throw new NotFoundError('Barter offer not found');
  }

  // Only initiator or recipient can view the offer
  if (offer.initiatorId !== userId && offer.recipientId !== userId) {
    throw new ForbiddenError('You do not have permission to view this offer');
  }

  return offer;
};

/**
 * Calculate total value of offer including cash
 */
export const calculateOfferValue = async (offerId: string) => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
    include: {
      itemRequests: true,
      preferenceSets: { include: { items: { include: { item: true } } } },
    },
  });

  if (!offer) return { offered: 0, requested: 0 };

  // Offered value
  const offeredItems = await prisma.item.findMany({
    where: { id: { in: offer.offeredItemIds } },
  });
  const offeredValue = offeredItems.reduce((sum, item) => sum + item.estimatedValue, 0)
    + offer.offeredCashAmount;

  // Requested value
  let requestedValue = offer.requestedCashAmount;

  // From preference sets
  if (offer.preferenceSets.length > 0) {
    requestedValue += offer.preferenceSets[0].totalValue;
  }

  // From item requests (use average of price range)
  for (const req of offer.itemRequests) {
    if (req.minPrice && req.maxPrice) {
      requestedValue += (req.minPrice + req.maxPrice) / 2;
    } else if (req.maxPrice) {
      requestedValue += req.maxPrice;
    }
  }

  return { offered: offeredValue, requested: requestedValue };
};

/**
 * Accept a barter offer
 */
export const acceptBarterOffer = async (
  offerId: string,
  userId: string
): Promise<any> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    throw new NotFoundError('Barter offer not found');
  }

  // Only recipient can accept
  if (offer.recipientId !== userId) {
    throw new ForbiddenError('Only the recipient can accept this offer');
  }

  if (offer.status !== 'PENDING' && offer.status !== 'COUNTER_OFFERED') {
    throw new BadRequestError('This offer cannot be accepted');
  }

  // Check if offer has expired
  if (offer.expiresAt && new Date() > offer.expiresAt) {
    await prisma.barterOffer.update({
      where: { id: offerId },
      data: { status: BarterOfferStatus.EXPIRED },
    });
    throw new BadRequestError('This offer has expired');
  }

  // Update offer status to accepted
  const acceptedOffer = await prisma.barterOffer.update({
    where: { id: offerId },
    data: {
      status: BarterOfferStatus.ACCEPTED,
      respondedAt: new Date(),
    },
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
              item: true,
            },
          },
        },
      },
    },
  });

  // TODO: Create transaction or exchange record
  // TODO: Send notifications to both parties

  return acceptedOffer;
};

/**
 * Reject a barter offer
 */
export const rejectBarterOffer = async (
  offerId: string,
  userId: string,
  reason?: string
): Promise<any> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    throw new NotFoundError('Barter offer not found');
  }

  // Only recipient can reject
  if (offer.recipientId !== userId) {
    throw new ForbiddenError('Only the recipient can reject this offer');
  }

  if (offer.status !== 'PENDING' && offer.status !== 'COUNTER_OFFERED') {
    throw new BadRequestError('This offer cannot be rejected');
  }

  // Update offer status to rejected
  const rejectedOffer = await prisma.barterOffer.update({
    where: { id: offerId },
    data: {
      status: BarterOfferStatus.REJECTED,
      respondedAt: new Date(),
      notes: reason ? `${offer.notes ? offer.notes + '\n' : ''}Rejection reason: ${reason}` : offer.notes,
    },
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
    },
  });

  return rejectedOffer;
};

/**
 * Create a counter offer
 * NOTE: Counter offers are now handled via preference sets
 * This function is deprecated - use barter-bundle.service.ts instead
 */
export const createCounterOffer = async (
  offerId: string,
  userId: string,
  counterOfferData: CreateCounterOfferData
): Promise<any> => {
  const { notes } = counterOfferData;

  const originalOffer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
  });

  if (!originalOffer) {
    throw new NotFoundError('Original offer not found');
  }

  // Only recipient can counter offer
  if (originalOffer.recipientId !== userId) {
    throw new ForbiddenError('Only the recipient can create a counter offer');
  }

  if (originalOffer.status !== 'PENDING') {
    throw new BadRequestError('Can only counter pending offers');
  }

  // Update original offer with counter offer status
  const counterOffer = await prisma.barterOffer.update({
    where: { id: offerId },
    data: {
      status: BarterOfferStatus.COUNTER_OFFERED,
      respondedAt: new Date(),
      notes: notes ? `${originalOffer.notes ? originalOffer.notes + '\n' : ''}Counter offer notes: ${notes}` : originalOffer.notes,
    },
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
              item: true,
            },
          },
        },
      },
    },
  });

  return counterOffer;
};

/**
 * Cancel a barter offer
 */
export const cancelBarterOffer = async (
  offerId: string,
  userId: string
): Promise<any> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    throw new NotFoundError('Barter offer not found');
  }

  // Only initiator can cancel
  if (offer.initiatorId !== userId) {
    throw new ForbiddenError('Only the initiator can cancel this offer');
  }

  if (offer.status === 'ACCEPTED' || offer.status === 'COMPLETED') {
    throw new BadRequestError('Cannot cancel accepted or completed offers');
  }

  // Update offer status to cancelled
  const cancelledOffer = await prisma.barterOffer.update({
    where: { id: offerId },
    data: { status: BarterOfferStatus.CANCELLED },
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
    },
  });

  return cancelledOffer;
};

/**
 * Get my barter offers
 */
export const getMyBarterOffers = async (
  userId: string,
  type: 'sent' | 'received' | 'all' = 'all',
  status?: BarterOfferStatus,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<any>> => {
  const where: any = {};

  // Filter by type
  if (type === 'sent') {
    where.initiatorId = userId;
  } else if (type === 'received') {
    where.recipientId = userId;
  } else {
    where.OR = [{ initiatorId: userId }, { recipientId: userId }];
  }

  // Filter by status
  if (status) {
    where.status = status;
  }

  const skip = (page - 1) * limit;

  const total = await prisma.barterOffer.count({ where });

  const offers = await prisma.barterOffer.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
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
                  images: true,
                  condition: true,
                },
              },
            },
          },
        },
      },
      itemRequests: {
        include: {
          category: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
            },
          },
        },
      },
    },
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
 * Search barterable items (items available for barter)
 */
export const searchBarterableItems = async (
  params: SearchBarterableItemsParams
): Promise<PaginatedResult<any>> => {
  const {
    search,
    categoryId,
    condition,
    governorate,
    excludeMyItems = true,
    userId,
    page = 1,
    limit = 20,
  } = params;

  const where: any = {
    // Exclude items with active sale listings
    listings: {
      none: {
        status: 'ACTIVE',
      },
    },
  };

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (condition) {
    where.condition = condition;
  }

  if (governorate) {
    where.governorate = governorate;
  }

  if (excludeMyItems && userId) {
    where.sellerId = { not: userId };
  }

  const skip = (page - 1) * limit;

  const total = await prisma.item.count({ where });

  const items = await prisma.item.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
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

  const totalPages = Math.ceil(total / limit);

  return {
    items,
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
 * Find potential barter matches for an item
 * (Simple 2-party matching algorithm)
 */
export const findBarterMatches = async (
  itemId: string,
  userId: string,
  categoryId?: string
): Promise<any[]> => {
  // Verify item exists and belongs to user
  const myItem = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!myItem) {
    throw new NotFoundError('Item not found');
  }

  if (myItem.sellerId !== userId) {
    throw new ForbiddenError('You can only find matches for your own items');
  }

  // Find items in the same category or specified category
  const targetCategoryId = categoryId || myItem.categoryId;

  // Find users who have items I might want, and who might want my item
  const potentialMatches = await prisma.item.findMany({
    where: {
      categoryId: targetCategoryId,
      sellerId: { not: userId },
      listings: {
        none: {
          status: 'ACTIVE',
        },
      },
    },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
        include: {
          items: {
            where: {
              categoryId: myItem.categoryId,
              id: { not: itemId },
            },
            take: 5,
          },
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
        },
      },
    },
    take: 20,
  });

  return potentialMatches;
};

/**
 * Complete barter exchange (both parties confirm)
 */
export const completeBarterExchange = async (
  offerId: string,
  userId: string,
  confirmationNotes?: string
): Promise<any> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    throw new NotFoundError('Barter offer not found');
  }

  // Both parties can confirm completion
  if (offer.initiatorId !== userId && offer.recipientId !== userId) {
    throw new ForbiddenError('Only involved parties can complete the exchange');
  }

  if (offer.status !== 'ACCEPTED') {
    throw new BadRequestError('Only accepted offers can be completed');
  }

  // Mark as completed
  const completedOffer = await prisma.barterOffer.update({
    where: { id: offerId },
    data: {
      status: BarterOfferStatus.COMPLETED,
      notes: confirmationNotes
        ? `${offer.notes ? offer.notes + '\n' : ''}Completion notes: ${confirmationNotes}`
        : offer.notes,
    },
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
    },
  });

  // TODO: Transfer item ownership or mark items as exchanged
  // TODO: Create transaction records
  // TODO: Update item status to TRADED

  return completedOffer;
};
