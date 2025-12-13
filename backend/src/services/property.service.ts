import {
  PropertyType,
  TitleType,
  VerificationLevel,
  FinishingLevel,
  FurnishedStatus,
  PropertyListingType,
  DeliveryStatus,
  PropertyStatus,
  PromotionTier,
  Prisma,
} from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import prisma from '../lib/prisma';

// ============================================
// Types & Interfaces
// ============================================

interface CreatePropertyData {
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  propertyType: PropertyType;

  // Location
  governorate: string;
  city?: string;
  district?: string;
  compoundName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;

  // Size
  areaSqm: number;
  gardenArea?: number;
  roofArea?: number;

  // Specs
  bedrooms?: number;
  bathrooms?: number;
  floorNumber?: number;
  totalFloors?: number;

  // Finishing
  finishingLevel?: FinishingLevel;
  furnished?: FurnishedStatus;
  amenities?: Record<string, any>;

  // Listing
  listingType?: PropertyListingType;

  // Pricing (Sale)
  salePrice?: number;
  priceNegotiable?: boolean;

  // Pricing (Rent)
  rentPrice?: number;
  rentPeriod?: string;

  // Installment
  installmentAvailable?: boolean;
  installmentYears?: number;
  downPaymentPercent?: number;
  monthlyInstallment?: number;

  // Delivery
  deliveryStatus?: DeliveryStatus;
  deliveryDate?: Date;

  // Title/Ownership
  titleType?: TitleType;
  governmentPropertyId?: string;
  governmentQrCode?: string;

  // Barter
  openForBarter?: boolean;
  barterPreferences?: Record<string, any>;

  // Media
  images?: any[];
  videoUrl?: string;
  virtualTourUrl?: string;
  floorPlanUrl?: string;
}

interface UpdatePropertyData extends Partial<CreatePropertyData> {
  status?: PropertyStatus;
  verificationLevel?: VerificationLevel;
  verificationNotes?: string;
}

interface SearchPropertiesParams {
  search?: string;

  // Location
  governorate?: string;
  city?: string;
  district?: string;
  compoundName?: string;

  // Type
  propertyType?: PropertyType | PropertyType[];
  listingType?: PropertyListingType;

  // Price
  priceMin?: number;
  priceMax?: number;
  rentMin?: number;
  rentMax?: number;

  // Size
  areaMin?: number;
  areaMax?: number;
  bedroomsMin?: number;
  bedroomsMax?: number;
  bathroomsMin?: number;

  // Finishing
  finishingLevel?: FinishingLevel | FinishingLevel[];
  furnished?: FurnishedStatus;

  // Title/Verification
  titleType?: TitleType | TitleType[];
  verificationLevel?: VerificationLevel | VerificationLevel[];
  governmentVerified?: boolean;

  // Delivery
  deliveryStatus?: DeliveryStatus;

  // Barter
  openForBarter?: boolean;
  barterAccepts?: string[];

  // Featured
  featured?: boolean;
  promotionTier?: PromotionTier;

  // Status
  status?: PropertyStatus;
  ownerId?: string;

  // Pagination & Sorting
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'salePrice' | 'rentPrice' | 'areaSqm' | 'viewsCount';
  sortOrder?: 'asc' | 'desc';
}

interface PaginatedResult<T> {
  properties: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
  priceStats?: {
    avgPricePerSqm: number | null;
    priceRange: { min: number | null; max: number | null };
  };
}

// ============================================
// CRUD Operations
// ============================================

/**
 * Create a new property listing
 */
export const createProperty = async (
  userId: string,
  data: CreatePropertyData
): Promise<any> => {
  // Calculate price per sqm if sale price is provided
  const pricePerSqm = data.salePrice && data.areaSqm
    ? data.salePrice / data.areaSqm
    : null;

  const property = await prisma.property.create({
    data: {
      ownerId: userId,
      title: data.title,
      titleAr: data.titleAr,
      description: data.description,
      descriptionAr: data.descriptionAr,
      propertyType: data.propertyType,

      // Location
      governorate: data.governorate,
      city: data.city,
      district: data.district,
      compoundName: data.compoundName,
      address: data.address,
      latitude: data.latitude,
      longitude: data.longitude,

      // Size
      areaSqm: data.areaSqm,
      gardenArea: data.gardenArea,
      roofArea: data.roofArea,

      // Specs
      bedrooms: data.bedrooms,
      bathrooms: data.bathrooms,
      floorNumber: data.floorNumber,
      totalFloors: data.totalFloors,

      // Finishing
      finishingLevel: data.finishingLevel,
      furnished: data.furnished,
      amenities: data.amenities,

      // Listing
      listingType: data.listingType || PropertyListingType.SALE,

      // Pricing
      salePrice: data.salePrice,
      pricePerSqm: pricePerSqm,
      priceNegotiable: data.priceNegotiable ?? true,
      rentPrice: data.rentPrice,
      rentPeriod: data.rentPeriod,

      // Installment
      installmentAvailable: data.installmentAvailable,
      installmentYears: data.installmentYears,
      downPaymentPercent: data.downPaymentPercent,
      monthlyInstallment: data.monthlyInstallment,

      // Delivery
      deliveryStatus: data.deliveryStatus,
      deliveryDate: data.deliveryDate,

      // Title
      titleType: data.titleType || TitleType.PRELIMINARY,
      governmentPropertyId: data.governmentPropertyId,
      governmentQrCode: data.governmentQrCode,

      // Barter
      openForBarter: data.openForBarter,
      barterPreferences: data.barterPreferences,

      // Media
      images: data.images || [],
      videoUrl: data.videoUrl,
      virtualTourUrl: data.virtualTourUrl,
      floorPlanUrl: data.floorPlanUrl,

      // Status
      status: PropertyStatus.DRAFT,
    },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
          rating: true,
        },
      },
    },
  });

  return property;
};

/**
 * Get property by ID
 */
export const getPropertyById = async (
  propertyId: string,
  userId?: string,
  incrementViews: boolean = true
): Promise<any> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
          rating: true,
          totalReviews: true,
          userType: true,
          businessName: true,
          createdAt: true,
        },
      },
      verifiedBy: {
        select: {
          id: true,
          fullName: true,
        },
      },
      inspections: {
        where: { status: 'COMPLETED' },
        orderBy: { completedAt: 'desc' },
        take: 1,
        select: {
          id: true,
          overallScore: true,
          recommendation: true,
          completedAt: true,
          reportUrl: true,
        },
      },
      favorites: userId ? {
        where: { userId },
        select: { id: true },
      } : false,
    },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  // Increment views (don't count owner's views)
  if (incrementViews && property.ownerId !== userId) {
    await prisma.property.update({
      where: { id: propertyId },
      data: { viewsCount: { increment: 1 } },
    });
  }

  // Get similar properties
  const similarProperties = await prisma.property.findMany({
    where: {
      id: { not: propertyId },
      status: PropertyStatus.ACTIVE,
      propertyType: property.propertyType,
      governorate: property.governorate,
      ...(property.salePrice && {
        salePrice: {
          gte: property.salePrice * 0.7,
          lte: property.salePrice * 1.3,
        },
      }),
    },
    take: 4,
    select: {
      id: true,
      title: true,
      propertyType: true,
      governorate: true,
      city: true,
      areaSqm: true,
      bedrooms: true,
      bathrooms: true,
      salePrice: true,
      rentPrice: true,
      images: true,
      titleType: true,
      verificationLevel: true,
    },
  });

  // Get price analysis
  const priceAnalysis = await getPropertyPriceAnalysis(property);

  // Check if user has favorited
  const isFavorited = userId && property.favorites && property.favorites.length > 0;

  return {
    property: {
      ...property,
      favorites: undefined,
    },
    isFavorited,
    priceAnalysis,
    similarProperties,
  };
};

/**
 * Update property
 */
export const updateProperty = async (
  propertyId: string,
  userId: string,
  data: UpdatePropertyData
): Promise<any> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  if (property.ownerId !== userId) {
    throw new ForbiddenError('You do not own this property');
  }

  // Recalculate price per sqm if needed
  let pricePerSqm = property.pricePerSqm;
  if (data.salePrice !== undefined || data.areaSqm !== undefined) {
    const newPrice = data.salePrice ?? property.salePrice;
    const newArea = data.areaSqm ?? property.areaSqm;
    pricePerSqm = newPrice && newArea ? newPrice / newArea : null;
  }

  const updated = await prisma.property.update({
    where: { id: propertyId },
    data: {
      ...data,
      pricePerSqm,
      updatedAt: new Date(),
    },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Delete property
 */
export const deleteProperty = async (
  propertyId: string,
  userId: string
): Promise<void> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  if (property.ownerId !== userId) {
    throw new ForbiddenError('You do not own this property');
  }

  await prisma.property.delete({
    where: { id: propertyId },
  });
};

/**
 * Search properties with advanced filters
 */
export const searchProperties = async (
  params: SearchPropertiesParams
): Promise<PaginatedResult<any>> => {
  const page = params.page || 1;
  const limit = Math.min(params.limit || 20, 100);
  const skip = (page - 1) * limit;

  // Build where clause
  const where: Prisma.PropertyWhereInput = {
    status: params.status || PropertyStatus.ACTIVE,
  };

  // Text search
  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: 'insensitive' } },
      { titleAr: { contains: params.search, mode: 'insensitive' } },
      { description: { contains: params.search, mode: 'insensitive' } },
      { compoundName: { contains: params.search, mode: 'insensitive' } },
      { address: { contains: params.search, mode: 'insensitive' } },
    ];
  }

  // Location filters
  if (params.governorate) where.governorate = params.governorate;
  if (params.city) where.city = params.city;
  if (params.district) where.district = params.district;
  if (params.compoundName) where.compoundName = { contains: params.compoundName, mode: 'insensitive' };

  // Property type filter
  if (params.propertyType) {
    if (Array.isArray(params.propertyType)) {
      where.propertyType = { in: params.propertyType };
    } else {
      where.propertyType = params.propertyType;
    }
  }

  // Listing type filter
  if (params.listingType) where.listingType = params.listingType;

  // Price filters (for sale)
  if (params.priceMin !== undefined || params.priceMax !== undefined) {
    where.salePrice = {};
    if (params.priceMin !== undefined) where.salePrice.gte = params.priceMin;
    if (params.priceMax !== undefined) where.salePrice.lte = params.priceMax;
  }

  // Rent filters
  if (params.rentMin !== undefined || params.rentMax !== undefined) {
    where.rentPrice = {};
    if (params.rentMin !== undefined) where.rentPrice.gte = params.rentMin;
    if (params.rentMax !== undefined) where.rentPrice.lte = params.rentMax;
  }

  // Area filters
  if (params.areaMin !== undefined || params.areaMax !== undefined) {
    where.areaSqm = {};
    if (params.areaMin !== undefined) where.areaSqm.gte = params.areaMin;
    if (params.areaMax !== undefined) where.areaSqm.lte = params.areaMax;
  }

  // Bedrooms filter
  if (params.bedroomsMin !== undefined || params.bedroomsMax !== undefined) {
    where.bedrooms = {};
    if (params.bedroomsMin !== undefined) where.bedrooms.gte = params.bedroomsMin;
    if (params.bedroomsMax !== undefined) where.bedrooms.lte = params.bedroomsMax;
  }

  // Bathrooms filter
  if (params.bathroomsMin !== undefined) {
    where.bathrooms = { gte: params.bathroomsMin };
  }

  // Finishing level filter
  if (params.finishingLevel) {
    if (Array.isArray(params.finishingLevel)) {
      where.finishingLevel = { in: params.finishingLevel };
    } else {
      where.finishingLevel = params.finishingLevel;
    }
  }

  // Furnished filter
  if (params.furnished) where.furnished = params.furnished;

  // Title type filter (IMPORTANT for verification)
  if (params.titleType) {
    if (Array.isArray(params.titleType)) {
      where.titleType = { in: params.titleType };
    } else {
      where.titleType = params.titleType;
    }
  }

  // Verification level filter
  if (params.verificationLevel) {
    if (Array.isArray(params.verificationLevel)) {
      where.verificationLevel = { in: params.verificationLevel };
    } else {
      where.verificationLevel = params.verificationLevel;
    }
  }

  // Government verified filter
  if (params.governmentVerified) {
    where.verificationLevel = VerificationLevel.GOVERNMENT_VERIFIED;
  }

  // Delivery status filter
  if (params.deliveryStatus) where.deliveryStatus = params.deliveryStatus;

  // Barter filter
  if (params.openForBarter !== undefined) where.openForBarter = params.openForBarter;

  // Featured filter
  if (params.featured !== undefined) where.featured = params.featured;
  if (params.promotionTier) where.promotionTier = params.promotionTier;

  // Owner filter
  if (params.ownerId) where.ownerId = params.ownerId;

  // Sorting
  const orderBy: Prisma.PropertyOrderByWithRelationInput = {};
  const sortBy = params.sortBy || 'createdAt';
  const sortOrder = params.sortOrder || 'desc';
  orderBy[sortBy] = sortOrder;

  // Execute query
  const [properties, total] = await Promise.all([
    prisma.property.findMany({
      where,
      orderBy: [
        { featured: 'desc' },
        { promotionTier: 'desc' },
        orderBy,
      ],
      skip,
      take: limit,
      include: {
        owner: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
            userType: true,
          },
        },
      },
    }),
    prisma.property.count({ where }),
  ]);

  // Get price statistics
  const priceAggregation = await prisma.property.aggregate({
    where,
    _avg: { pricePerSqm: true },
    _min: { salePrice: true },
    _max: { salePrice: true },
  });

  return {
    properties,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasMore: skip + properties.length < total,
    },
    priceStats: {
      avgPricePerSqm: priceAggregation._avg.pricePerSqm,
      priceRange: {
        min: priceAggregation._min.salePrice,
        max: priceAggregation._max.salePrice,
      },
    },
  };
};

/**
 * Get user's properties
 */
export const getUserProperties = async (
  userId: string,
  status?: PropertyStatus
): Promise<any[]> => {
  const where: Prisma.PropertyWhereInput = { ownerId: userId };
  if (status) where.status = status;

  return prisma.property.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: {
      _count: {
        select: {
          favorites: true,
          transactions: true,
          barterProposalsOffered: true,
          barterProposalsRequested: true,
        },
      },
    },
  });
};

// ============================================
// Property Status Operations
// ============================================

/**
 * Submit property for verification
 */
export const submitForVerification = async (
  propertyId: string,
  userId: string
): Promise<any> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  if (property.ownerId !== userId) {
    throw new ForbiddenError('You do not own this property');
  }

  if (property.status !== PropertyStatus.DRAFT) {
    throw new BadRequestError('Property must be in draft status to submit for verification');
  }

  // Validate required fields
  if (!property.images || (property.images as any[]).length === 0) {
    throw new BadRequestError('At least one image is required');
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      status: PropertyStatus.PENDING_VERIFICATION,
    },
  });
};

/**
 * Activate property (after verification)
 */
export const activateProperty = async (
  propertyId: string,
  verifierId: string,
  verificationNotes?: string
): Promise<any> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      status: PropertyStatus.ACTIVE,
      verificationLevel: VerificationLevel.DOCUMENTS_VERIFIED,
      verificationDate: new Date(),
      verifiedById: verifierId,
      verificationNotes,
    },
  });
};

/**
 * Reject property
 */
export const rejectProperty = async (
  propertyId: string,
  reason: string
): Promise<any> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      status: PropertyStatus.REJECTED,
      rejectionReason: reason,
    },
  });
};

/**
 * Mark property as sold
 */
export const markPropertyAsSold = async (
  propertyId: string,
  userId: string
): Promise<any> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  if (property.ownerId !== userId) {
    throw new ForbiddenError('You do not own this property');
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      status: PropertyStatus.SOLD,
    },
  });
};

/**
 * Mark property as rented
 */
export const markPropertyAsRented = async (
  propertyId: string,
  userId: string
): Promise<any> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  if (property.ownerId !== userId) {
    throw new ForbiddenError('You do not own this property');
  }

  return prisma.property.update({
    where: { id: propertyId },
    data: {
      status: PropertyStatus.RENTED,
    },
  });
};

// ============================================
// Favorites
// ============================================

/**
 * Add property to favorites
 */
export const addToFavorites = async (
  propertyId: string,
  userId: string
): Promise<any> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  // Check if already favorited
  const existing = await prisma.propertyFavorite.findUnique({
    where: {
      userId_propertyId: { userId, propertyId },
    },
  });

  if (existing) {
    throw new BadRequestError('Property already in favorites');
  }

  // Add to favorites and increment count
  const [favorite] = await prisma.$transaction([
    prisma.propertyFavorite.create({
      data: { userId, propertyId },
    }),
    prisma.property.update({
      where: { id: propertyId },
      data: { favoritesCount: { increment: 1 } },
    }),
  ]);

  return favorite;
};

/**
 * Remove property from favorites
 */
export const removeFromFavorites = async (
  propertyId: string,
  userId: string
): Promise<void> => {
  const favorite = await prisma.propertyFavorite.findUnique({
    where: {
      userId_propertyId: { userId, propertyId },
    },
  });

  if (!favorite) {
    throw new NotFoundError('Property not in favorites');
  }

  await prisma.$transaction([
    prisma.propertyFavorite.delete({
      where: { id: favorite.id },
    }),
    prisma.property.update({
      where: { id: propertyId },
      data: { favoritesCount: { decrement: 1 } },
    }),
  ]);
};

/**
 * Get user's favorite properties
 */
export const getUserFavorites = async (userId: string): Promise<any[]> => {
  const favorites = await prisma.propertyFavorite.findMany({
    where: { userId },
    include: {
      property: {
        include: {
          owner: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return favorites.map((f) => f.property);
};

// ============================================
// Price Analysis
// ============================================

/**
 * Get property price analysis
 */
async function getPropertyPriceAnalysis(property: any): Promise<any> {
  if (!property.salePrice) return null;

  // Get market prices for this area
  const marketPrice = await prisma.propertyPrice.findFirst({
    where: {
      governorate: property.governorate,
      city: property.city || undefined,
      district: property.district || undefined,
      propertyType: property.propertyType,
    },
    orderBy: { recordedAt: 'desc' },
  });

  // Get comparable properties
  const comparables = await prisma.property.findMany({
    where: {
      id: { not: property.id },
      status: PropertyStatus.ACTIVE,
      propertyType: property.propertyType,
      governorate: property.governorate,
      city: property.city,
      areaSqm: {
        gte: property.areaSqm * 0.8,
        lte: property.areaSqm * 1.2,
      },
    },
    select: {
      salePrice: true,
      pricePerSqm: true,
      areaSqm: true,
    },
    take: 10,
  });

  const avgPricePerSqm = comparables.length > 0
    ? comparables.reduce((sum, p) => sum + (p.pricePerSqm || 0), 0) / comparables.length
    : marketPrice?.pricePerSqmAvg || null;

  // Calculate price rating
  let priceRating: 'excellent' | 'good' | 'fair' | 'high' = 'fair';
  if (avgPricePerSqm && property.pricePerSqm) {
    const ratio = property.pricePerSqm / avgPricePerSqm;
    if (ratio <= 0.9) priceRating = 'excellent';
    else if (ratio <= 1.05) priceRating = 'good';
    else if (ratio <= 1.15) priceRating = 'fair';
    else priceRating = 'high';
  }

  return {
    askingPrice: property.salePrice,
    pricePerSqm: property.pricePerSqm,
    marketAvgPerSqm: avgPricePerSqm,
    priceRating,
    priceTrend: marketPrice?.priceChangeMonthly
      ? `${marketPrice.priceChangeMonthly > 0 ? '+' : ''}${marketPrice.priceChangeMonthly}% last month`
      : null,
    comparablesCount: comparables.length,
  };
}

/**
 * Estimate property value
 */
export const estimatePropertyValue = async (data: {
  governorate: string;
  city?: string;
  district?: string;
  compoundName?: string;
  propertyType: PropertyType;
  areaSqm: number;
  bedrooms?: number;
  bathrooms?: number;
  floorNumber?: number;
  finishingLevel?: FinishingLevel;
  deliveryStatus?: DeliveryStatus;
  amenities?: string[];
}): Promise<any> => {
  // Get market prices
  const marketPrice = await prisma.propertyPrice.findFirst({
    where: {
      governorate: data.governorate,
      city: data.city || undefined,
      propertyType: data.propertyType,
    },
    orderBy: { recordedAt: 'desc' },
  });

  // Get comparable properties
  const comparables = await prisma.property.findMany({
    where: {
      status: PropertyStatus.ACTIVE,
      propertyType: data.propertyType,
      governorate: data.governorate,
      city: data.city || undefined,
      areaSqm: {
        gte: data.areaSqm * 0.8,
        lte: data.areaSqm * 1.2,
      },
    },
    select: {
      salePrice: true,
      pricePerSqm: true,
      areaSqm: true,
      finishingLevel: true,
      bedrooms: true,
    },
    take: 20,
  });

  // Base price calculation
  let basePricePerSqm = marketPrice?.pricePerSqmAvg || 30000; // Default fallback

  if (comparables.length > 0) {
    basePricePerSqm = comparables.reduce((sum, p) => sum + (p.pricePerSqm || 0), 0) / comparables.length;
  }

  // Apply adjustments
  let adjustedPrice = basePricePerSqm;
  const factors: Record<string, string> = {};

  // Finishing level adjustment
  if (data.finishingLevel) {
    switch (data.finishingLevel) {
      case FinishingLevel.SUPER_LUX:
        adjustedPrice *= 1.15;
        factors['finishing_premium'] = '+15%';
        break;
      case FinishingLevel.LUX:
        adjustedPrice *= 1.08;
        factors['finishing_premium'] = '+8%';
        break;
      case FinishingLevel.SEMI_FINISHED:
        adjustedPrice *= 0.85;
        factors['finishing_adjustment'] = '-15%';
        break;
      case FinishingLevel.UNFINISHED:
        adjustedPrice *= 0.7;
        factors['finishing_adjustment'] = '-30%';
        break;
    }
  }

  // Compound premium
  if (data.compoundName) {
    adjustedPrice *= 1.1;
    factors['compound_premium'] = '+10%';
  }

  // Floor adjustment
  if (data.floorNumber !== undefined) {
    if (data.floorNumber <= 2) {
      adjustedPrice *= 0.98;
      factors['floor_adjustment'] = '-2%';
    } else if (data.floorNumber >= 5 && data.floorNumber <= 10) {
      adjustedPrice *= 1.03;
      factors['floor_adjustment'] = '+3%';
    }
  }

  // Calculate estimates
  const avgEstimate = Math.round(adjustedPrice * data.areaSqm);
  const lowEstimate = Math.round(avgEstimate * 0.9);
  const highEstimate = Math.round(avgEstimate * 1.1);

  // Rental estimate
  const rentalYield = marketPrice?.rentalYieldAvg || 0.07;
  const monthlyRent = Math.round((avgEstimate * rentalYield) / 12);

  return {
    estimatedValue: {
      low: lowEstimate,
      average: avgEstimate,
      high: highEstimate,
    },
    pricePerSqm: {
      low: Math.round(lowEstimate / data.areaSqm),
      average: Math.round(avgEstimate / data.areaSqm),
      high: Math.round(highEstimate / data.areaSqm),
    },
    confidenceScore: comparables.length >= 10 ? 0.9 : comparables.length >= 5 ? 0.75 : 0.5,
    factors,
    rentalEstimate: {
      monthly: monthlyRent,
      yield: `${(rentalYield * 100).toFixed(1)}%`,
    },
    comparableCount: comparables.length,
  };
};

// ============================================
// Barter Suggestions
// ============================================

/**
 * Get barter suggestions for a property
 */
export const getBarterSuggestions = async (
  propertyId: string,
  userId: string
): Promise<any> => {
  const property = await prisma.property.findUnique({
    where: { id: propertyId },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  const propertyValue = property.salePrice || property.estimatedValue || 0;

  // Direct matches (properties open for barter with similar value)
  const directMatches = await prisma.property.findMany({
    where: {
      id: { not: propertyId },
      ownerId: { not: property.ownerId },
      status: PropertyStatus.ACTIVE,
      openForBarter: true,
      salePrice: {
        gte: propertyValue * 0.8,
        lte: propertyValue * 1.2,
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
    take: 10,
  });

  // Upgrade options (higher value properties)
  const upgradeOptions = await prisma.property.findMany({
    where: {
      id: { not: propertyId },
      ownerId: { not: property.ownerId },
      status: PropertyStatus.ACTIVE,
      openForBarter: true,
      salePrice: {
        gt: propertyValue * 1.2,
        lte: propertyValue * 2,
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
    take: 5,
  });

  // Downgrade options (lower value properties + cash back)
  const downgradeOptions = await prisma.property.findMany({
    where: {
      id: { not: propertyId },
      ownerId: { not: property.ownerId },
      status: PropertyStatus.ACTIVE,
      openForBarter: true,
      salePrice: {
        lt: propertyValue * 0.8,
        gte: propertyValue * 0.5,
      },
    },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
    take: 5,
  });

  return {
    directMatches: directMatches.map((p) => ({
      property: p,
      matchScore: calculateMatchScore(property, p),
      valueDifference: Math.abs((p.salePrice || 0) - propertyValue),
    })),
    upgradeOptions: upgradeOptions.map((p) => ({
      property: p,
      additionalCashNeeded: (p.salePrice || 0) - propertyValue,
    })),
    downgradeOptions: downgradeOptions.map((p) => ({
      property: p,
      cashYouReceive: propertyValue - (p.salePrice || 0),
    })),
  };
};

/**
 * Calculate match score between two properties
 */
function calculateMatchScore(property1: any, property2: any): number {
  let score = 0;
  let maxScore = 0;

  // Value similarity (max 40 points)
  maxScore += 40;
  const valueDiff = Math.abs((property1.salePrice || 0) - (property2.salePrice || 0));
  const avgValue = ((property1.salePrice || 0) + (property2.salePrice || 0)) / 2;
  if (avgValue > 0) {
    const valueRatio = 1 - (valueDiff / avgValue);
    score += Math.max(0, valueRatio * 40);
  }

  // Same governorate (20 points)
  maxScore += 20;
  if (property1.governorate === property2.governorate) score += 20;

  // Same property type (20 points)
  maxScore += 20;
  if (property1.propertyType === property2.propertyType) score += 20;

  // Similar size (20 points)
  maxScore += 20;
  const areaDiff = Math.abs((property1.areaSqm || 0) - (property2.areaSqm || 0));
  const avgArea = ((property1.areaSqm || 0) + (property2.areaSqm || 0)) / 2;
  if (avgArea > 0) {
    const areaRatio = 1 - (areaDiff / avgArea);
    score += Math.max(0, areaRatio * 20);
  }

  return Math.round((score / maxScore) * 100);
}

export default {
  createProperty,
  getPropertyById,
  updateProperty,
  deleteProperty,
  searchProperties,
  getUserProperties,
  submitForVerification,
  activateProperty,
  rejectProperty,
  markPropertyAsSold,
  markPropertyAsRented,
  addToFavorites,
  removeFromFavorites,
  getUserFavorites,
  estimatePropertyValue,
  getBarterSuggestions,
};
