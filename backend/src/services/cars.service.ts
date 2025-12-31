/**
 * Cars Marketplace Service
 * خدمة سوق السيارات
 */

import prisma from '../lib/prisma';

// Commission rates - أعلى من الذهب بسبب قيمة الصفقات
const BUYER_COMMISSION_RATE = 0.015; // 1.5%
const SELLER_COMMISSION_RATE = 0.015; // 1.5%

// ============================================
// Car Prices (Reference Prices)
// ============================================

/**
 * Get reference prices for a specific car
 */
export const getCarPriceReference = async (make: string, model: string, year: number) => {
  const price = await prisma.carPrice.findFirst({
    where: {
      make: { contains: make, mode: 'insensitive' },
      model: { contains: model, mode: 'insensitive' },
      year,
    },
  });

  return price;
};

/**
 * Get all price references for a make
 */
export const getPricesByMake = async (make: string) => {
  const prices = await prisma.carPrice.findMany({
    where: {
      make: { contains: make, mode: 'insensitive' },
    },
    orderBy: [{ model: 'asc' }, { year: 'desc' }],
  });

  return prices;
};

/**
 * Update car reference prices
 */
export const updateCarPrices = async (prices: Array<{
  make: string;
  model: string;
  year: number;
  trim?: string;
  priceLow: number;
  priceHigh: number;
  priceAverage: number;
  basePrice?: number;
  dataSource?: string;
}>) => {
  const created = await prisma.carPrice.createMany({
    data: prices.map(p => ({
      make: p.make,
      model: p.model,
      year: p.year,
      trim: p.trim,
      priceLow: p.priceLow,
      priceHigh: p.priceHigh,
      priceAverage: p.priceAverage,
      basePrice: p.basePrice || p.priceAverage,
      dataSource: p.dataSource || 'manual',
    })),
  });

  return created;
};

// ============================================
// Price Calculator
// ============================================

export interface CarPriceCalculation {
  listingPrice: number;
  marketPrice: number | null;
  buyerPays: number;
  buyerCommission: number;
  sellerGets: number;
  sellerCommission: number;
  xchangeRevenue: number;
  priceVsMarket: number | null; // percentage difference from market
}

/**
 * Calculate transaction prices
 */
export const calculateCarPrice = async (
  listingPrice: number,
  make?: string,
  model?: string,
  year?: number
): Promise<CarPriceCalculation> => {
  let marketPrice: number | null = null;

  if (make && model && year) {
    const ref = await getCarPriceReference(make, model, year);
    marketPrice = ref?.priceAverage || null;
  }

  const buyerCommission = listingPrice * BUYER_COMMISSION_RATE;
  const sellerCommission = listingPrice * SELLER_COMMISSION_RATE;

  const buyerPays = listingPrice + buyerCommission;
  const sellerGets = listingPrice - sellerCommission;
  const xchangeRevenue = buyerCommission + sellerCommission;

  const priceVsMarket = marketPrice
    ? Math.round(((listingPrice - marketPrice) / marketPrice) * 100 * 10) / 10
    : null;

  return {
    listingPrice,
    marketPrice,
    buyerPays: Math.round(buyerPays),
    buyerCommission: Math.round(buyerCommission),
    sellerGets: Math.round(sellerGets),
    sellerCommission: Math.round(sellerCommission),
    xchangeRevenue: Math.round(xchangeRevenue),
    priceVsMarket,
  };
};

// ============================================
// Car Listings
// ============================================

export interface CarListingFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  mileageMin?: number;
  mileageMax?: number;
  priceMin?: number;
  priceMax?: number;
  governorate?: string;
  city?: string;
  sellerType?: string;
  condition?: string;
  verificationLevel?: string;
  status?: string;
  sellerId?: string;
  allowBarter?: boolean;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get car listings with filters
 */
export const getCarListings = async (filters: CarListingFilters) => {
  const {
    make,
    model,
    yearMin,
    yearMax,
    bodyType,
    transmission,
    fuelType,
    mileageMin,
    mileageMax,
    priceMin,
    priceMax,
    governorate,
    city,
    sellerType,
    condition,
    verificationLevel,
    status = 'ACTIVE',
    sellerId,
    allowBarter,
    isFeatured,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const where: any = {};

  if (status) where.status = status;
  if (make) where.make = { contains: make, mode: 'insensitive' };
  if (model) where.model = { contains: model, mode: 'insensitive' };
  if (bodyType) where.bodyType = bodyType;
  if (transmission) where.transmission = transmission;
  if (fuelType) where.fuelType = fuelType;
  if (governorate) where.governorate = governorate;
  if (city) where.city = city;
  if (sellerType) where.sellerType = sellerType;
  if (condition) where.condition = condition;
  if (verificationLevel) where.verificationLevel = verificationLevel;
  if (sellerId) where.sellerId = sellerId;
  if (allowBarter !== undefined) where.openForBarter = allowBarter;
  if (isFeatured !== undefined) where.isFeatured = isFeatured;

  if (yearMin || yearMax) {
    where.year = {};
    if (yearMin) where.year.gte = yearMin;
    if (yearMax) where.year.lte = yearMax;
  }

  if (mileageMin !== undefined || mileageMax !== undefined) {
    where.mileage = {};
    if (mileageMin !== undefined) where.mileage.gte = mileageMin;
    if (mileageMax !== undefined) where.mileage.lte = mileageMax;
  }

  if (priceMin || priceMax) {
    where.askingPrice = {};
    if (priceMin) where.askingPrice.gte = priceMin;
    if (priceMax) where.askingPrice.lte = priceMax;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
      { make: { contains: search, mode: 'insensitive' } },
      { model: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [listings, total] = await Promise.all([
    prisma.carListing.findMany({
      where,
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
            totalReviews: true,
            governorate: true,
          },
        },
        inspection: {
          select: {
            id: true,
            overallScore: true,
            recommendation: true,
            status: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.carListing.count({ where }),
  ]);

  // Enrich with buyer price
  const enrichedListings = listings.map(listing => {
    const buyerPays = listing.askingPrice * (1 + BUYER_COMMISSION_RATE);

    return {
      ...listing,
      buyerPays: Math.round(buyerPays),
      buyerCommission: Math.round(listing.askingPrice * BUYER_COMMISSION_RATE),
    };
  });

  return {
    listings: enrichedListings,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single car listing by ID
 */
export const getCarListingById = async (id: string) => {
  const listing = await prisma.carListing.findUnique({
    where: { id },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
          totalReviews: true,
          governorate: true,
          city: true,
          phone: true,
          createdAt: true,
        },
      },
      inspection: true,
    },
  });

  if (!listing) return null;

  // Increment views
  await prisma.carListing.update({
    where: { id },
    data: { viewsCount: { increment: 1 } },
  });

  // Get market price reference
  const marketRef = await getCarPriceReference(listing.make, listing.model, listing.year);

  // Calculate buyer price
  const buyerPays = listing.askingPrice * (1 + BUYER_COMMISSION_RATE);
  const priceVsMarket = marketRef?.priceAverage
    ? Math.round(((listing.askingPrice - marketRef.priceAverage) / marketRef.priceAverage) * 100 * 10) / 10
    : null;

  return {
    ...listing,
    marketPrice: marketRef?.priceAverage || null,
    marketPriceRange: marketRef ? { min: marketRef.priceLow, max: marketRef.priceHigh } : null,
    buyerPays: Math.round(buyerPays),
    buyerCommission: Math.round(listing.askingPrice * BUYER_COMMISSION_RATE),
    priceVsMarket,
  };
};

/**
 * Create new car listing
 */
export const createCarListing = async (
  sellerId: string,
  data: {
    title: string;
    description?: string;
    make: string;
    model: string;
    year: number;
    trim?: string;
    bodyType: string;
    transmission: string;
    fuelType: string;
    engineSize?: number;
    cylinders?: number;
    driveType?: string;
    mileage: number;
    condition?: string;
    accidentHistory?: string;
    serviceHistory?: boolean;
    colorExterior?: string;
    colorInterior?: string;
    doors?: number;
    seats?: number;
    images: string[];
    videoUrl?: string;
    vin?: string;
    plateNumber?: string;
    askingPrice: number;
    priceNegotiable?: boolean;
    openForBarter?: boolean;
    barterPreferences?: any;
    licenseGovernorate?: string;
    isImported?: boolean;
    isCngConverted?: boolean;
    sellerType?: string;
  }
) => {
  // Get market price for reference
  const marketRef = await getCarPriceReference(data.make, data.model, data.year);

  const listing = await prisma.carListing.create({
    data: {
      sellerId,
      sellerType: (data.sellerType as any) || 'OWNER',
      title: data.title,
      description: data.description,
      make: data.make,
      model: data.model,
      year: data.year,
      trim: data.trim,
      bodyType: data.bodyType as any,
      transmission: data.transmission as any,
      fuelType: data.fuelType as any,
      engineSize: data.engineSize,
      cylinders: data.cylinders,
      driveType: data.driveType,
      mileage: data.mileage,
      condition: (data.condition as any) || 'GOOD',
      accidentHistory: (data.accidentHistory as any) || 'UNKNOWN',
      serviceHistory: data.serviceHistory ?? false,
      colorExterior: data.colorExterior,
      colorInterior: data.colorInterior,
      doors: data.doors ?? 4,
      seats: data.seats ?? 5,
      images: data.images,
      videoUrl: data.videoUrl,
      vin: data.vin,
      plateNumber: data.plateNumber,
      askingPrice: data.askingPrice,
      estimatedValue: marketRef?.priceAverage,
      priceNegotiable: data.priceNegotiable ?? true,
      openForBarter: data.openForBarter ?? true,
      barterPreferences: data.barterPreferences,
      licenseGovernorate: data.licenseGovernorate,
      isImported: data.isImported ?? false,
      isCngConverted: data.isCngConverted ?? false,
    },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });

  return listing;
};

/**
 * Update car listing
 */
export const updateCarListing = async (
  id: string,
  sellerId: string,
  data: Partial<{
    title: string;
    description: string;
    askingPrice: number;
    priceNegotiable: boolean;
    images: string[];
    videoUrl: string;
    openForBarter: boolean;
    barterPreferences: any;
  }> & { status?: any }
) => {
  // Verify ownership
  const listing = await prisma.carListing.findFirst({
    where: { id, sellerId },
  });

  if (!listing) {
    throw new Error('Listing not found or unauthorized');
  }

  const updated = await prisma.carListing.update({
    where: { id },
    data,
  });

  return updated;
};

/**
 * Delete car listing
 */
export const deleteCarListing = async (id: string, sellerId: string) => {
  const listing = await prisma.carListing.findFirst({
    where: { id, sellerId },
  });

  if (!listing) {
    throw new Error('Listing not found or unauthorized');
  }

  await prisma.carListing.delete({ where: { id } });

  return { success: true };
};

// ============================================
// Car Partners (Inspection Centers)
// ============================================

/**
 * Get car inspection partners
 */
export const getCarPartners = async (filters?: {
  governorate?: string;
  offersBasicInspection?: boolean;
  offersFullInspection?: boolean;
  offersPrePurchase?: boolean;
}) => {
  const where: any = { isActive: true };

  if (filters?.governorate) where.governorate = filters.governorate;
  if (filters?.offersBasicInspection !== undefined) where.offersBasicInspection = filters.offersBasicInspection;
  if (filters?.offersFullInspection !== undefined) where.offersFullInspection = filters.offersFullInspection;
  if (filters?.offersPrePurchase !== undefined) where.offersPrePurchase = filters.offersPrePurchase;

  const partners = await prisma.carPartner.findMany({
    where,
    orderBy: [{ isVerified: 'desc' }, { rating: 'desc' }],
  });

  return partners;
};

/**
 * Get partner by ID
 */
export const getCarPartnerById = async (id: string) => {
  return prisma.carPartner.findUnique({ where: { id } });
};

// ============================================
// Car Inspections
// ============================================

/**
 * Request car inspection
 */
export const requestCarInspection = async (
  requestedById: string,
  data: {
    carId: string;
    partnerId?: string;
    inspectionType?: string;
  }
) => {
  // Get partner fee
  let inspectionFee = 500; // default
  if (data.partnerId) {
    const partner = await prisma.carPartner.findUnique({
      where: { id: data.partnerId },
    });
    if (partner) {
      switch (data.inspectionType) {
        case 'BASIC':
          inspectionFee = partner.basicInspectionFee;
          break;
        case 'COMPREHENSIVE':
          inspectionFee = partner.comprehensiveInspectionFee;
          break;
        default:
          inspectionFee = partner.standardInspectionFee;
      }
    }
  }

  const inspection = await prisma.carInspection.create({
    data: {
      carId: data.carId,
      partnerId: data.partnerId,
      requestedById,
      inspectionType: (data.inspectionType as any) || 'STANDARD',
      inspectionFee,
    },
    include: {
      carListing: true,
      partner: true,
    },
  });

  return inspection;
};

/**
 * Update inspection status
 */
export const updateInspectionStatus = async (
  id: string,
  data: {
    status?: string;
    scheduledAt?: Date;
    overallScore?: number;
    exteriorScore?: number;
    interiorScore?: number;
    mechanicalScore?: number;
    electricalScore?: number;
    findings?: any;
    inspectionPhotos?: string[];
    recommendation?: string;
    estimatedRepairCost?: number;
    reportUrl?: string;
    paid?: boolean;
  }
) => {
  const updateData: any = { ...data };

  if (data.status === 'COMPLETED') {
    updateData.completedAt = new Date();
  }

  const inspection = await prisma.carInspection.update({
    where: { id },
    data: updateData,
    include: {
      carListing: true,
      partner: true,
    },
  });

  // If inspection completed, update car verification level
  if (data.status === 'COMPLETED' && inspection.carId) {
    await prisma.carListing.update({
      where: { id: inspection.carId },
      data: {
        verificationLevel: 'INSPECTED',
        inspectionId: inspection.id,
      },
    });
  }

  return inspection;
};

// ============================================
// Car Transactions
// ============================================

/**
 * Create car transaction
 */
export const createCarTransaction = async (
  buyerId: string,
  data: {
    carId: string;
    agreedPrice: number;
    deliveryMethod: string;
    deliveryAddress?: string;
    buyerNotes?: string;
    inspectionRequired?: boolean;
  }
) => {
  // Get listing details
  const listing = await prisma.carListing.findUnique({
    where: { id: data.carId },
  });

  if (!listing || listing.status !== 'ACTIVE') {
    throw new Error('Listing not available');
  }

  if (listing.sellerId === buyerId) {
    throw new Error('Cannot buy your own car');
  }

  // Calculate commissions
  const buyerCommission = data.agreedPrice * BUYER_COMMISSION_RATE;
  const sellerCommission = data.agreedPrice * SELLER_COMMISSION_RATE;
  const totalAmount = data.agreedPrice + buyerCommission;

  // Create transaction
  const transaction = await prisma.carTransaction.create({
    data: {
      carId: data.carId,
      buyerId,
      sellerId: listing.sellerId,
      agreedPrice: data.agreedPrice,
      buyerCommission,
      sellerCommission,
      totalAmount,
      deliveryMethod: data.deliveryMethod as any,
      deliveryAddress: data.deliveryAddress,
      buyerNotes: data.buyerNotes,
      inspectionRequired: data.inspectionRequired || false,
    },
    include: {
      car: true,
      buyer: {
        select: { id: true, fullName: true },
      },
      seller: {
        select: { id: true, fullName: true },
      },
    },
  });

  // Update listing status to RESERVED
  await prisma.carListing.update({
    where: { id: data.carId },
    data: { status: 'RESERVED' },
  });

  return transaction;
};

/**
 * Update transaction status
 */
export const updateCarTransactionStatus = async (
  id: string,
  userId: string,
  status: string,
  notes?: string
) => {
  const transaction = await prisma.carTransaction.findUnique({
    where: { id },
    include: { car: true },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  // Verify user is part of transaction
  if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
    throw new Error('Unauthorized');
  }

  const updateData: any = { status };

  // Handle specific status updates
  switch (status) {
    case 'ESCROW_HELD':
      updateData.escrowDepositedAt = new Date();
      updateData.escrowStatus = 'held';
      updateData.escrowAmount = transaction.totalAmount;
      break;
    case 'COMPLETED':
      updateData.completedAt = new Date();
      updateData.escrowReleasedAt = new Date();
      updateData.escrowStatus = 'released';
      // Update listing status
      await prisma.carListing.update({
        where: { id: transaction.carId },
        data: { status: 'SOLD', soldAt: new Date() },
      });
      break;
    case 'DISPUTED':
      updateData.disputeReason = notes;
      break;
    case 'REFUNDED':
    case 'CANCELLED':
      updateData.escrowStatus = status === 'REFUNDED' ? 'refunded' : 'cancelled';
      updateData.cancelledAt = new Date();
      updateData.cancellationReason = notes;
      // Reactivate listing
      await prisma.carListing.update({
        where: { id: transaction.carId },
        data: { status: 'ACTIVE' },
      });
      break;
  }

  const updated = await prisma.carTransaction.update({
    where: { id },
    data: updateData,
    include: {
      car: true,
      buyer: { select: { id: true, fullName: true } },
      seller: { select: { id: true, fullName: true } },
    },
  });

  return updated;
};

/**
 * Get user's car transactions
 */
export const getUserCarTransactions = async (
  userId: string,
  type: 'purchases' | 'sales' | 'all' = 'all'
) => {
  const where: any = {};

  if (type === 'purchases') {
    where.buyerId = userId;
  } else if (type === 'sales') {
    where.sellerId = userId;
  } else {
    where.OR = [{ buyerId: userId }, { sellerId: userId }];
  }

  const transactions = await prisma.carTransaction.findMany({
    where,
    include: {
      car: true,
      buyer: { select: { id: true, fullName: true, avatar: true } },
      seller: { select: { id: true, fullName: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return transactions;
};

// ============================================
// Car Barter Proposals
// ============================================

/**
 * Create barter proposal
 */
export const createBarterProposal = async (
  proposerId: string,
  data: {
    offeredCarId: string;      // الـ proposer's car
    requestedCarId: string;    // الـ receiver's car (the listing they want)
    cashDifference?: number;
    cashPayer?: string;        // 'proposer' or 'receiver'
    proposerMessage?: string;
  }
) => {
  // Get both cars
  const [offeredCar, requestedCar] = await Promise.all([
    prisma.carListing.findUnique({ where: { id: data.offeredCarId } }),
    prisma.carListing.findUnique({ where: { id: data.requestedCarId } }),
  ]);

  if (!offeredCar) {
    throw new Error('Offered car not found');
  }

  if (!requestedCar) {
    throw new Error('Requested car not found');
  }

  if (!requestedCar.openForBarter) {
    throw new Error('This listing does not accept barter');
  }

  if (offeredCar.sellerId !== proposerId) {
    throw new Error('You can only offer your own car');
  }

  if (requestedCar.sellerId === proposerId) {
    throw new Error('Cannot barter with your own listing');
  }

  // Calculate commissions (1.5% each)
  const proposerCommission = offeredCar.askingPrice * 0.015;
  const receiverCommission = requestedCar.askingPrice * 0.015;

  // Set expiry to 7 days
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const proposal = await prisma.carBarterProposal.create({
    data: {
      proposerId,
      receiverId: requestedCar.sellerId,
      offeredCarId: data.offeredCarId,
      requestedCarId: data.requestedCarId,
      offeredCarValue: offeredCar.askingPrice,
      requestedCarValue: requestedCar.askingPrice,
      cashDifference: data.cashDifference || 0,
      cashPayer: data.cashPayer,
      proposerCommission,
      receiverCommission,
      proposerMessage: data.proposerMessage,
      expiresAt,
    },
    include: {
      offeredCar: true,
      requestedCar: true,
      proposer: { select: { id: true, fullName: true, avatar: true } },
    },
  });

  return proposal;
};

/**
 * Respond to barter proposal
 */
export const respondToBarterProposal = async (
  id: string,
  userId: string,
  response: {
    action: 'ACCEPT' | 'REJECT' | 'COUNTER';
    receiverResponse?: string;
  }
) => {
  const proposal = await prisma.carBarterProposal.findUnique({
    where: { id },
  });

  if (!proposal) {
    throw new Error('Proposal not found');
  }

  if (proposal.receiverId !== userId) {
    throw new Error('Unauthorized');
  }

  let status: string;
  const updateData: any = { respondedAt: new Date() };

  switch (response.action) {
    case 'ACCEPT':
      status = 'ACCEPTED';
      break;
    case 'REJECT':
      status = 'REJECTED';
      break;
    case 'COUNTER':
      status = 'COUNTER_OFFERED';
      break;
    default:
      throw new Error('Invalid action');
  }

  updateData.status = status;
  if (response.receiverResponse) {
    updateData.receiverResponse = response.receiverResponse;
  }

  const updated = await prisma.carBarterProposal.update({
    where: { id },
    data: updateData,
    include: {
      offeredCar: true,
      requestedCar: true,
      proposer: { select: { id: true, fullName: true } },
      receiver: { select: { id: true, fullName: true } },
    },
  });

  return updated;
};

/**
 * Get user's barter proposals
 */
export const getUserBarterProposals = async (
  userId: string,
  type: 'sent' | 'received' | 'all' = 'all'
) => {
  const where: any = {};

  if (type === 'sent') {
    where.proposerId = userId;
  } else if (type === 'received') {
    where.receiverId = userId;
  } else {
    where.OR = [{ proposerId: userId }, { receiverId: userId }];
  }

  const proposals = await prisma.carBarterProposal.findMany({
    where,
    include: {
      offeredCar: true,
      requestedCar: true,
      proposer: { select: { id: true, fullName: true, avatar: true } },
      receiver: { select: { id: true, fullName: true, avatar: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return proposals;
};

// ============================================
// Statistics
// ============================================

/**
 * Get cars marketplace statistics
 */
export const getCarStatistics = async () => {
  const [
    totalListings,
    activeListings,
    totalTransactions,
    completedTransactions,
    totalPartners,
    barterListings,
  ] = await Promise.all([
    prisma.carListing.count(),
    prisma.carListing.count({ where: { status: 'ACTIVE' } }),
    prisma.carTransaction.count(),
    prisma.carTransaction.count({ where: { status: 'COMPLETED' } }),
    prisma.carPartner.count({ where: { isActive: true } }),
    prisma.carListing.count({ where: { openForBarter: true, status: 'ACTIVE' } }),
  ]);

  // Calculate total value
  const totalValue = await prisma.carTransaction.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { totalAmount: true },
  });

  // Get listings by seller type
  const bySellerType = await prisma.carListing.groupBy({
    by: ['sellerType'],
    where: { status: 'ACTIVE' },
    _count: true,
  });

  // Get top makes
  const topMakes = await prisma.carListing.groupBy({
    by: ['make'],
    where: { status: 'ACTIVE' },
    _count: true,
    orderBy: { _count: { make: 'desc' } },
    take: 10,
  });

  return {
    totalListings,
    activeListings,
    totalTransactions,
    completedTransactions,
    totalPartners,
    barterListings,
    totalTransactionValue: totalValue._sum.totalAmount ? Number(totalValue._sum.totalAmount) : 0,
    bySellerType: bySellerType.reduce((acc, item) => {
      acc[item.sellerType] = item._count;
      return acc;
    }, {} as Record<string, number>),
    topMakes: topMakes.map(m => ({ make: m.make, count: m._count })),
  };
};

/**
 * Get popular car makes and models
 */
export const getPopularCars = async () => {
  const makes = await prisma.carListing.groupBy({
    by: ['make'],
    where: { status: 'ACTIVE' },
    _count: true,
    _avg: { askingPrice: true },
    orderBy: { _count: { make: 'desc' } },
    take: 20,
  });

  return makes.map(m => ({
    make: m.make,
    count: m._count,
    avgPrice: Math.round(m._avg.askingPrice ? Number(m._avg.askingPrice) : 0),
  }));
};
