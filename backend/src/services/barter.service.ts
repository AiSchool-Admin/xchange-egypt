import { PrismaClient, BarterOfferStatus, ItemCondition } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

const prisma = new PrismaClient();

// Types
interface CreateBarterOfferData {
  offeredItemId: string;
  requestedItemId: string;
  notes?: string;
  expiresAt?: Date;
}

interface CreateCounterOfferData {
  counterOfferItemId: string;
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
 * Create a barter offer
 */
export const createBarterOffer = async (
  initiatorId: string,
  offerData: CreateBarterOfferData
): Promise<any> => {
  const { offeredItemId, requestedItemId, notes, expiresAt } = offerData;

  // Verify offered item exists and belongs to initiator
  const offeredItem = await prisma.item.findUnique({
    where: { id: offeredItemId },
    include: {
      listings: {
        where: { status: 'ACTIVE' },
      },
    },
  });

  if (!offeredItem) {
    throw new NotFoundError('Offered item not found');
  }

  if (offeredItem.sellerId !== initiatorId) {
    throw new ForbiddenError('You can only offer your own items');
  }

  // Check if offered item has active listings
  if (offeredItem.listings.length > 0) {
    throw new BadRequestError(
      'Cannot barter items that have active sale listings. Please close the listing first.'
    );
  }

  // Verify requested item exists
  const requestedItem = await prisma.item.findUnique({
    where: { id: requestedItemId },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      listings: {
        where: { status: 'ACTIVE' },
      },
    },
  });

  if (!requestedItem) {
    throw new NotFoundError('Requested item not found');
  }

  // Prevent self-barter
  if (requestedItem.sellerId === initiatorId) {
    throw new BadRequestError('You cannot barter with yourself');
  }

  // Check if requested item has active listings
  if (requestedItem.listings.length > 0) {
    throw new BadRequestError(
      'The requested item has active sale listings. The owner must close the listing first.'
    );
  }

  // Check for existing pending offers between same items
  const existingOffer = await prisma.barterOffer.findFirst({
    where: {
      OR: [
        {
          offeredItemId,
          requestedItemId,
          status: { in: ['PENDING', 'COUNTER_OFFERED'] },
        },
        {
          offeredItemId: requestedItemId,
          requestedItemId: offeredItemId,
          status: { in: ['PENDING', 'COUNTER_OFFERED'] },
        },
      ],
    },
  });

  if (existingOffer) {
    throw new BadRequestError(
      'There is already a pending barter offer between these items'
    );
  }

  // Create the barter offer
  const barterOffer = await prisma.barterOffer.create({
    data: {
      initiatorId,
      recipientId: requestedItem.sellerId,
      offeredItemId,
      requestedItemId,
      status: BarterOfferStatus.PENDING,
      notes,
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
    },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          accountType: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          accountType: true,
        },
      },
      offeredItem: {
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
      requestedItem: {
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
          accountType: true,
          phone: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          accountType: true,
          phone: true,
        },
      },
      offeredItem: {
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
      requestedItem: {
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
      counterOfferItem: {
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
 * Accept a barter offer
 */
export const acceptBarterOffer = async (
  offerId: string,
  userId: string
): Promise<any> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
    include: {
      offeredItem: true,
      requestedItem: true,
      counterOfferItem: true,
    },
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
    data: { status: BarterOfferStatus.ACCEPTED },
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
      offeredItem: true,
      requestedItem: true,
      counterOfferItem: true,
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
      offeredItem: true,
      requestedItem: true,
    },
  });

  return rejectedOffer;
};

/**
 * Create a counter offer
 */
export const createCounterOffer = async (
  offerId: string,
  userId: string,
  counterOfferData: CreateCounterOfferData
): Promise<any> => {
  const { counterOfferItemId, notes } = counterOfferData;

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

  // Verify counter offer item exists and belongs to recipient
  const counterItem = await prisma.item.findUnique({
    where: { id: counterOfferItemId },
  });

  if (!counterItem) {
    throw new NotFoundError('Counter offer item not found');
  }

  if (counterItem.sellerId !== userId) {
    throw new ForbiddenError('You can only counter with your own items');
  }

  // Cannot counter with the same item that was requested
  if (counterOfferItemId === originalOffer.requestedItemId) {
    throw new BadRequestError('Counter offer item cannot be the same as requested item');
  }

  // Update original offer with counter offer
  const counterOffer = await prisma.barterOffer.update({
    where: { id: offerId },
    data: {
      status: BarterOfferStatus.COUNTER_OFFERED,
      counterOfferItemId,
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
      offeredItem: true,
      requestedItem: true,
      counterOfferItem: {
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
      offeredItem: true,
      requestedItem: true,
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
      offeredItem: {
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          images: true,
          condition: true,
        },
      },
      requestedItem: {
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          images: true,
          condition: true,
        },
      },
      counterOfferItem: {
        select: {
          id: true,
          titleAr: true,
          titleEn: true,
          images: true,
          condition: true,
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
    where.OR = [
      { titleAr: { contains: search, mode: 'insensitive' } },
      { titleEn: { contains: search, mode: 'insensitive' } },
    ];
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
          accountType: true,
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
      offeredItem: true,
      requestedItem: true,
      counterOfferItem: true,
    },
  });

  // TODO: Transfer item ownership or mark items as exchanged
  // TODO: Create transaction records
  // TODO: Update item quantities

  return completedOffer;
};
