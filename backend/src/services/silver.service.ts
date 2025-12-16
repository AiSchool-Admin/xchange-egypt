/**
 * Silver Marketplace Service
 * خدمة سوق الفضة
 */

import prisma from '../config/database';

// Commission rates - Higher than gold due to lower transaction values
const BUYER_COMMISSION_RATE = 0.02; // 2%
const SELLER_COMMISSION_RATE = 0.02; // 2%
const NEW_SILVER_MARKUP = 0.45; // 45% average markup for new silver jewelry

// ============================================
// Silver Prices
// ============================================

/**
 * Get latest silver prices for all purities
 */
export const getLatestPrices = async () => {
  const prices = await prisma.silverPrice.findMany({
    orderBy: { timestamp: 'desc' },
    distinct: ['purity'],
  });

  const priceMap: Record<string, { buyPrice: number; sellPrice: number; timestamp: Date }> = {};

  prices.forEach(price => {
    priceMap[price.purity] = {
      buyPrice: price.buyPrice,
      sellPrice: price.sellPrice,
      timestamp: price.timestamp,
    };
  });

  return priceMap;
};

/**
 * Get price for specific purity
 */
export const getPriceByPurity = async (purity: 'S999' | 'S925' | 'S900' | 'S800') => {
  const price = await prisma.silverPrice.findFirst({
    where: { purity },
    orderBy: { timestamp: 'desc' },
  });

  return price;
};

/**
 * Update silver prices (manual or from API)
 */
export const updatePrices = async (prices: Array<{
  purity: 'S999' | 'S925' | 'S900' | 'S800';
  buyPrice: number;
  sellPrice: number;
  source?: string;
}>) => {
  const created = await prisma.silverPrice.createMany({
    data: prices.map(p => ({
      purity: p.purity,
      buyPrice: p.buyPrice,
      sellPrice: p.sellPrice,
      source: p.source || 'manual',
    })),
  });

  return created;
};

// ============================================
// Price Calculator
// ============================================

export interface PriceCalculation {
  basePrice: number;
  sellerGets: number;
  sellerCommission: number;
  buyerPays: number;
  buyerCommission: number;
  newSilverPrice: number;
  savings: number;
  savingsPercent: number;
  xchangeRevenue: number;
}

/**
 * Calculate prices for a silver transaction
 */
export const calculatePrice = async (
  weightGrams: number,
  purity: 'S999' | 'S925' | 'S900' | 'S800',
  sellerPricePerGram: number
): Promise<PriceCalculation> => {
  const currentPrice = await getPriceByPurity(purity);
  const marketPrice = currentPrice?.buyPrice || getDefaultPrice(purity);

  const basePrice = weightGrams * marketPrice;
  const sellerAskingTotal = weightGrams * sellerPricePerGram;

  const sellerCommission = sellerAskingTotal * SELLER_COMMISSION_RATE;
  const buyerCommission = sellerAskingTotal * BUYER_COMMISSION_RATE;

  const sellerGets = sellerAskingTotal - sellerCommission;
  const buyerPays = sellerAskingTotal + buyerCommission;

  const newSilverPrice = basePrice * (1 + NEW_SILVER_MARKUP);
  const savings = newSilverPrice - buyerPays;
  const savingsPercent = (savings / newSilverPrice) * 100;

  const xchangeRevenue = sellerCommission + buyerCommission;

  return {
    basePrice,
    sellerGets,
    sellerCommission,
    buyerPays,
    buyerCommission,
    newSilverPrice,
    savings,
    savingsPercent: Math.round(savingsPercent * 100) / 100,
    xchangeRevenue,
  };
};

/**
 * Get suggested price range for seller
 */
export const getSuggestedPriceRange = async (purity: 'S999' | 'S925' | 'S900' | 'S800') => {
  const currentPrice = await getPriceByPurity(purity);
  const marketPrice = currentPrice?.buyPrice || getDefaultPrice(purity);

  return {
    marketPrice,
    minSuggested: Math.round(marketPrice * 1.01), // +1%
    maxSuggested: Math.round(marketPrice * 1.05), // +5%
    sellerBonus: '+1% إلى +5% فوق سعر السوق',
  };
};

function getDefaultPrice(purity: 'S999' | 'S925' | 'S900' | 'S800'): number {
  const defaults: Record<string, number> = {
    S999: 65, // 65 EGP/gram for pure silver
    S925: 55, // 55 EGP/gram for sterling silver
    S900: 50, // 50 EGP/gram
    S800: 45, // 45 EGP/gram
  };
  return defaults[purity] || 55;
}

// ============================================
// Silver Items
// ============================================

export interface SilverItemFilters {
  category?: string;
  purity?: string;
  minWeight?: number;
  maxWeight?: number;
  minPrice?: number;
  maxPrice?: number;
  governorate?: string;
  verificationLevel?: string;
  status?: string;
  sellerId?: string;
  allowBarter?: boolean;
  allowGoldBarter?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get silver items with filters
 */
export const getSilverItems = async (filters: SilverItemFilters) => {
  const {
    category,
    purity,
    minWeight,
    maxWeight,
    minPrice,
    maxPrice,
    governorate,
    verificationLevel,
    status = 'ACTIVE',
    sellerId,
    allowBarter,
    allowGoldBarter,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const where: any = {};

  if (status) where.status = status;
  if (category) where.category = category;
  if (purity) where.purity = purity;
  if (governorate) where.governorate = governorate;
  if (verificationLevel) where.verificationLevel = verificationLevel;
  if (sellerId) where.sellerId = sellerId;
  if (allowBarter !== undefined) where.allowBarter = allowBarter;
  if (allowGoldBarter !== undefined) where.allowGoldBarter = allowGoldBarter;

  if (minWeight || maxWeight) {
    where.weightGrams = {};
    if (minWeight) where.weightGrams.gte = minWeight;
    if (maxWeight) where.weightGrams.lte = maxWeight;
  }

  if (minPrice || maxPrice) {
    where.askingPrice = {};
    if (minPrice) where.askingPrice.gte = minPrice;
    if (maxPrice) where.askingPrice.lte = maxPrice;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.silverItem.findMany({
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
        certificate: {
          select: {
            id: true,
            certificateNumber: true,
            verifiedPurity: true,
            verifiedWeight: true,
            isAuthentic: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.silverItem.count({ where }),
  ]);

  // Enrich with current prices and savings
  const currentPrices = await getLatestPrices();

  const enrichedItems = items.map(item => {
    const marketPrice = currentPrices[item.purity]?.buyPrice || getDefaultPrice(item.purity);
    const newSilverPrice = item.weightGrams * marketPrice * (1 + NEW_SILVER_MARKUP);
    const buyerPays = item.askingPrice * (1 + BUYER_COMMISSION_RATE);
    const savings = newSilverPrice - buyerPays;

    return {
      ...item,
      currentMarketPrice: marketPrice,
      buyerPays: Math.round(buyerPays),
      savings: Math.round(savings),
      savingsPercent: Math.round((savings / newSilverPrice) * 100 * 10) / 10,
    };
  });

  return {
    items: enrichedItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single silver item by ID
 */
export const getSilverItemById = async (id: string) => {
  const item = await prisma.silverItem.findUnique({
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
          createdAt: true,
        },
      },
      certificate: true,
    },
  });

  if (!item) return null;

  // Increment views
  await prisma.silverItem.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  // Enrich with current prices
  const currentPrice = await getPriceByPurity(item.purity);
  const marketPrice = currentPrice?.buyPrice || getDefaultPrice(item.purity);
  const newSilverPrice = item.weightGrams * marketPrice * (1 + NEW_SILVER_MARKUP);
  const buyerPays = item.askingPrice * (1 + BUYER_COMMISSION_RATE);
  const savings = newSilverPrice - buyerPays;

  return {
    ...item,
    currentMarketPrice: marketPrice,
    buyerPays: Math.round(buyerPays),
    buyerCommission: Math.round(item.askingPrice * BUYER_COMMISSION_RATE),
    newSilverPrice: Math.round(newSilverPrice),
    savings: Math.round(savings),
    savingsPercent: Math.round((savings / newSilverPrice) * 100 * 10) / 10,
  };
};

/**
 * Create new silver item
 */
export const createSilverItem = async (
  sellerId: string,
  data: {
    title: string;
    description?: string;
    category: string;
    purity: string;
    weightGrams: number;
    condition?: string;
    brand?: string;
    images: string[];
    askingPrice: number;
    governorate?: string;
    city?: string;
    allowBarter?: boolean;
    barterPreferences?: string;
  }
) => {
  // Get current silver price
  const currentPrice = await getPriceByPurity(data.purity as any);
  const marketPrice = currentPrice?.buyPrice || getDefaultPrice(data.purity as any);

  // Calculate raw value based on weight and market price
  const rawValue = data.weightGrams * marketPrice;

  const item = await prisma.silverItem.create({
    data: {
      sellerId,
      title: data.title,
      description: data.description,
      category: data.category as any,
      purity: data.purity as any,
      weightGrams: data.weightGrams,
      condition: (data.condition as any) || 'GOOD',
      brand: data.brand,
      images: data.images,
      askingPrice: data.askingPrice,
      rawValue,
      silverPriceAtListing: marketPrice,
      governorate: data.governorate,
      city: data.city,
      allowBarter: data.allowBarter ?? true,
      barterPreferences: data.barterPreferences,
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

  return item;
};

/**
 * Update silver item
 */
export const updateSilverItem = async (
  id: string,
  sellerId: string,
  data: Partial<{
    title: string;
    description: string;
    askingPrice: number;
    images: string[];
    allowBarter: boolean;
    barterPreferences: string;
  }> & { status?: any }
) => {
  // Verify ownership
  const item = await prisma.silverItem.findFirst({
    where: { id, sellerId },
  });

  if (!item) {
    throw new Error('Item not found or unauthorized');
  }

  const updated = await prisma.silverItem.update({
    where: { id },
    data,
  });

  return updated;
};

/**
 * Delete silver item
 */
export const deleteSilverItem = async (id: string, sellerId: string) => {
  const item = await prisma.silverItem.findFirst({
    where: { id, sellerId },
  });

  if (!item) {
    throw new Error('Item not found or unauthorized');
  }

  await prisma.silverItem.delete({ where: { id } });

  return { success: true };
};

// ============================================
// Silver Partners
// ============================================

/**
 * Get silver partners
 */
export const getSilverPartners = async (filters?: {
  governorate?: string;
  offersCertification?: boolean;
  offersPickup?: boolean;
}) => {
  const where: any = { isActive: true };

  if (filters?.governorate) where.governorate = filters.governorate;
  if (filters?.offersCertification !== undefined) where.offersCertification = filters.offersCertification;
  if (filters?.offersPickup !== undefined) where.offersPickup = filters.offersPickup;

  const partners = await prisma.silverPartner.findMany({
    where,
    orderBy: [{ isVerified: 'desc' }, { rating: 'desc' }],
  });

  return partners;
};

/**
 * Get partner by ID
 */
export const getSilverPartnerById = async (id: string) => {
  return prisma.silverPartner.findUnique({ where: { id } });
};

// ============================================
// Silver Transactions
// ============================================

/**
 * Create silver transaction
 */
export const createSilverTransaction = async (
  buyerId: string,
  data: {
    itemId: string;
    deliveryMethod: string;
    deliveryAddress?: string;
    deliveryPartnerId?: string;
    buyerNotes?: string;
  }
) => {
  // Get item details
  const item = await prisma.silverItem.findUnique({
    where: { id: data.itemId },
  });

  if (!item || item.status !== 'ACTIVE') {
    throw new Error('Item not available');
  }

  if (item.sellerId === buyerId) {
    throw new Error('Cannot buy your own item');
  }

  // Get current silver price
  const currentPrice = await getPriceByPurity(item.purity);
  const silverPrice = currentPrice?.buyPrice || getDefaultPrice(item.purity);

  // Calculate commissions
  const buyerCommission = item.askingPrice * BUYER_COMMISSION_RATE;
  const sellerCommission = item.askingPrice * SELLER_COMMISSION_RATE;
  const totalAmount = item.askingPrice + buyerCommission;

  // Create transaction
  const transaction = await prisma.silverTransaction.create({
    data: {
      itemId: data.itemId,
      buyerId,
      sellerId: item.sellerId,
      silverPriceAtTransaction: silverPrice,
      itemPrice: item.askingPrice,
      buyerCommission,
      sellerCommission,
      totalAmount,
      deliveryMethod: data.deliveryMethod as any,
      deliveryAddress: data.deliveryAddress,
      deliveryPartnerId: data.deliveryPartnerId,
      buyerNotes: data.buyerNotes,
    },
    include: {
      item: true,
      buyer: {
        select: { id: true, fullName: true },
      },
      seller: {
        select: { id: true, fullName: true },
      },
    },
  });

  // Update item status to RESERVED
  await prisma.silverItem.update({
    where: { id: data.itemId },
    data: { status: 'RESERVED' },
  });

  return transaction;
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (
  id: string,
  userId: string,
  status: string,
  notes?: string
) => {
  const transaction = await prisma.silverTransaction.findUnique({
    where: { id },
    include: { item: true },
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
      updateData.escrowHeldAt = new Date();
      updateData.escrowStatus = 'HELD';
      break;
    case 'DELIVERED':
      updateData.inspectionStartedAt = new Date();
      updateData.inspectionEndsAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
      break;
    case 'COMPLETED':
      updateData.completedAt = new Date();
      updateData.escrowReleasedAt = new Date();
      updateData.escrowStatus = 'RELEASED';
      // Update item status
      await prisma.silverItem.update({
        where: { id: transaction.itemId },
        data: { status: 'SOLD' },
      });
      break;
    case 'DISPUTED':
      updateData.disputeReason = notes;
      break;
    case 'REFUNDED':
    case 'CANCELLED':
      updateData.escrowStatus = status === 'REFUNDED' ? 'REFUNDED' : 'CANCELLED';
      // Reactivate item
      await prisma.silverItem.update({
        where: { id: transaction.itemId },
        data: { status: 'ACTIVE' },
      });
      break;
  }

  const updated = await prisma.silverTransaction.update({
    where: { id },
    data: updateData,
    include: {
      item: true,
      buyer: { select: { id: true, fullName: true } },
      seller: { select: { id: true, fullName: true } },
    },
  });

  return updated;
};

/**
 * Get user's silver transactions
 */
export const getUserSilverTransactions = async (
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

  const transactions = await prisma.silverTransaction.findMany({
    where,
    include: {
      item: true,
      buyer: { select: { id: true, fullName: true, avatar: true } },
      seller: { select: { id: true, fullName: true, avatar: true } },
      deliveryPartner: { select: { id: true, name: true, nameAr: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return transactions;
};

// ============================================
// Statistics
// ============================================

/**
 * Get silver marketplace statistics
 */
export const getSilverStatistics = async () => {
  const [
    totalItems,
    activeItems,
    totalTransactions,
    completedTransactions,
    totalPartners,
  ] = await Promise.all([
    prisma.silverItem.count(),
    prisma.silverItem.count({ where: { status: 'ACTIVE' } }),
    prisma.silverTransaction.count(),
    prisma.silverTransaction.count({ where: { status: 'COMPLETED' } }),
    prisma.silverPartner.count({ where: { isActive: true } }),
  ]);

  // Calculate total value
  const totalValue = await prisma.silverTransaction.aggregate({
    where: { status: 'COMPLETED' },
    _sum: { totalAmount: true },
  });

  return {
    totalItems,
    activeItems,
    totalTransactions,
    completedTransactions,
    totalPartners,
    totalTransactionValue: totalValue._sum.totalAmount || 0,
  };
};
