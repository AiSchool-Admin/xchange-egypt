import { ListingType, ListingStatus } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import prisma from '../lib/prisma';

// Types
interface CreateSaleListingData {
  itemId: string;
  price: number;
  startDate?: Date;
  endDate?: Date | null;
}

interface UpdateListingData {
  price?: number;
  status?: ListingStatus;
  endDate?: Date | null;
}

interface SearchListingsParams {
  search?: string;
  categoryId?: string;
  sellerId?: string;
  type?: ListingType;
  status?: ListingStatus;
  minPrice?: number;
  maxPrice?: number;
  governorate?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'price' | 'endDate';
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  listings: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Create a direct sale listing for an item
 */
export const createSaleListing = async (
  userId: string,
  listingData: CreateSaleListingData
): Promise<any> => {
  // Verify item exists and user owns it
  const item = await prisma.item.findUnique({
    where: { id: listingData.itemId },
    include: {
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

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  if (item.sellerId !== userId) {
    throw new ForbiddenError('You can only create listings for your own items');
  }

  // Check if item already has an active listing
  const existingActiveListing = await prisma.listing.findFirst({
    where: {
      itemId: listingData.itemId,
      status: 'ACTIVE',
    },
  });

  if (existingActiveListing) {
    throw new BadRequestError(
      'Item already has an active listing. Please close or cancel the existing listing first.'
    );
  }

  // Create the listing
  const listing = await prisma.listing.create({
    data: {
      itemId: listingData.itemId,
      userId,
      listingType: ListingType.DIRECT_SALE,
      status: ListingStatus.ACTIVE,
      price: listingData.price,
      startDate: listingData.startDate || new Date(),
      endDate: listingData.endDate,
    },
    include: {
      item: {
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              businessName: true,
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
      },
    },
  });

  return listing;
};

/**
 * Get listing by ID
 */
export const getListingById = async (listingId: string): Promise<any> => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      item: {
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              businessName: true,
              phone: true,
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
      },
    },
  });

  if (!listing) {
    throw new NotFoundError('Listing not found');
  }

  return listing;
};

/**
 * Update a listing
 */
export const updateListing = async (
  listingId: string,
  userId: string,
  updateData: UpdateListingData
): Promise<any> => {
  // Check if listing exists and user owns it
  const existingListing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      item: {
        select: {
          sellerId: true,
        },
      },
    },
  });

  if (!existingListing) {
    throw new NotFoundError('Listing not found');
  }

  if (existingListing.item.sellerId !== userId) {
    throw new ForbiddenError('You can only update your own listings');
  }

  // Don't allow updating completed listings
  if (existingListing.status === 'COMPLETED') {
    throw new BadRequestError('Cannot update a completed listing');
  }

  // Update the listing
  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: updateData,
    include: {
      item: {
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
      },
    },
  });

  return updatedListing;
};

/**
 * Delete a listing (cancel)
 */
export const deleteListing = async (
  listingId: string,
  userId: string
): Promise<void> => {
  // Check if listing exists and user owns it
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      item: {
        select: {
          sellerId: true,
        },
      },
      transactions: {
        where: {
          paymentStatus: 'PENDING',
        },
      },
    },
  });

  if (!listing) {
    throw new NotFoundError('Listing not found');
  }

  if (listing.item.sellerId !== userId) {
    throw new ForbiddenError('You can only delete your own listings');
  }

  // Check if listing has active transactions
  if (listing.transactions.length > 0) {
    throw new BadRequestError(
      'Cannot delete listing with active transactions. Complete or cancel transactions first.'
    );
  }

  // If listing is completed, don't allow deletion
  if (listing.status === 'COMPLETED') {
    throw new BadRequestError('Cannot delete a completed listing');
  }

  // Delete the listing
  await prisma.listing.delete({
    where: { id: listingId },
  });
};

/**
 * Activate a listing (change status to ACTIVE)
 */
export const activateListing = async (
  listingId: string,
  userId: string
): Promise<any> => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      item: {
        select: {
          sellerId: true,
          id: true,
        },
      },
    },
  });

  if (!listing) {
    throw new NotFoundError('Listing not found');
  }

  if (listing.item.sellerId !== userId) {
    throw new ForbiddenError('You can only activate your own listings');
  }

  if (listing.status === 'ACTIVE') {
    throw new BadRequestError('Listing is already active');
  }

  if (listing.status === 'COMPLETED') {
    throw new BadRequestError('Cannot activate a completed listing');
  }

  // Check if item already has another active listing
  const existingActiveListing = await prisma.listing.findFirst({
    where: {
      itemId: listing.itemId,
      status: 'ACTIVE',
      id: { not: listingId },
    },
  });

  if (existingActiveListing) {
    throw new BadRequestError(
      'Item already has an active listing. Please close or cancel that listing first.'
    );
  }

  // Activate the listing
  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'ACTIVE' },
    include: {
      item: {
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
      },
    },
  });

  return updatedListing;
};

/**
 * Cancel a listing
 */
export const cancelListing = async (
  listingId: string,
  userId: string
): Promise<any> => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      item: {
        select: {
          sellerId: true,
        },
      },
    },
  });

  if (!listing) {
    throw new NotFoundError('Listing not found');
  }

  if (listing.item.sellerId !== userId) {
    throw new ForbiddenError('You can only cancel your own listings');
  }

  if (listing.status === 'CANCELLED') {
    throw new BadRequestError('Listing is already cancelled');
  }

  if (listing.status === 'COMPLETED') {
    throw new BadRequestError('Cannot cancel a completed listing');
  }

  // Cancel the listing
  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'CANCELLED' },
    include: {
      item: {
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
      },
    },
  });

  return updatedListing;
};

/**
 * Mark listing as completed
 */
export const markListingAsCompleted = async (
  listingId: string,
  userId: string
): Promise<any> => {
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: {
      item: {
        select: {
          sellerId: true,
        },
      },
    },
  });

  if (!listing) {
    throw new NotFoundError('Listing not found');
  }

  if (listing.item.sellerId !== userId) {
    throw new ForbiddenError('You can only mark your own listings as completed');
  }

  if (listing.status === 'COMPLETED') {
    throw new BadRequestError('Listing is already marked as completed');
  }

  // Mark as completed
  const updatedListing = await prisma.listing.update({
    where: { id: listingId },
    data: { status: 'COMPLETED' },
    include: {
      item: {
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
      },
    },
  });

  return updatedListing;
};

/**
 * Search listings with filters and pagination
 */
export const searchListings = async (
  params: SearchListingsParams
): Promise<PaginatedResult<any>> => {
  const {
    search,
    categoryId,
    sellerId,
    type = ListingType.DIRECT_SALE,
    status = ListingStatus.ACTIVE,
    minPrice,
    maxPrice,
    governorate,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = params;

  // Build where clause
  const where: any = {
    listingType: type,
    status,
  };

  // Price range filter
  if (minPrice !== undefined || maxPrice !== undefined) {
    where.price = {};
    if (minPrice !== undefined) where.price.gte = minPrice;
    if (maxPrice !== undefined) where.price.lte = maxPrice;
  }

  // Item filters
  const itemWhere: any = {};

  if (search) {
    itemWhere.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  if (categoryId) {
    itemWhere.categoryId = categoryId;
  }

  if (sellerId) {
    itemWhere.sellerId = sellerId;
  }

  if (governorate) {
    itemWhere.governorate = governorate;
  }

  if (Object.keys(itemWhere).length > 0) {
    where.item = itemWhere;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.listing.count({ where });

  // Get listings
  const listings = await prisma.listing.findMany({
    where,
    skip,
    take: limit,
    orderBy: { [sortBy]: sortOrder },
    include: {
      item: {
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
      },
    },
  });

  const totalPages = Math.ceil(total / limit);

  return {
    listings,
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
 * Get listings by user
 */
export const getUserListings = async (
  userId: string,
  type?: ListingType,
  status?: ListingStatus,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<any>> => {
  const where: any = {
    item: {
      sellerId: userId,
    },
  };

  if (type) {
    where.listingType = type;
  }

  if (status) {
    where.status = status;
  }

  const skip = (page - 1) * limit;

  const total = await prisma.listing.count({ where });

  const listings = await prisma.listing.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      item: {
        include: {
          category: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              slug: true,
            },
          },
        },
      },
    },
  });

  const totalPages = Math.ceil(total / limit);

  return {
    listings,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};
