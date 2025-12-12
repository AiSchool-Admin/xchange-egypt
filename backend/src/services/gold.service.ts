/**
 * Gold Marketplace Service
 * خدمة سوق الذهب
 */

import prisma from '../config/database';

// Commission rates
const BUYER_COMMISSION_RATE = 0.007; // 0.7%
const SELLER_COMMISSION_RATE = 0.007; // 0.7%
const NEW_GOLD_MARKUP = 0.045; // 4.5% average markup for new gold

// ============================================
// Gold Prices
// ============================================

/**
 * Get latest gold prices for all karats
 */
export const getLatestPrices = async () => {
  const prices = await prisma.goldPrice.findMany({
    orderBy: { timestamp: 'desc' },
    distinct: ['karat'],
  });

  const priceMap: Record<string, { buyPrice: number; sellPrice: number; timestamp: Date }> = {};

  prices.forEach(price => {
    priceMap[price.karat] = {
      buyPrice: price.buyPrice,
      sellPrice: price.sellPrice,
      timestamp: price.timestamp,
    };
  });

  return priceMap;
};

/**
 * Get price for specific karat
 */
export const getPriceByKarat = async (karat: 'K18' | 'K21' | 'K24') => {
  const price = await prisma.goldPrice.findFirst({
    where: { karat },
    orderBy: { timestamp: 'desc' },
  });

  return price;
};

/**
 * Update gold prices (manual or from API)
 */
export const updatePrices = async (prices: Array<{
  karat: 'K18' | 'K21' | 'K24';
  buyPrice: number;
  sellPrice: number;
  source?: string;
}>) => {
  const created = await prisma.goldPrice.createMany({
    data: prices.map(p => ({
      karat: p.karat,
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
  newGoldPrice: number;
  savings: number;
  savingsPercent: number;
  xchangeRevenue: number;
}

/**
 * Calculate prices for a gold transaction
 */
export const calculatePrice = async (
  weightGrams: number,
  karat: 'K18' | 'K21' | 'K24',
  sellerPricePerGram: number
): Promise<PriceCalculation> => {
  const currentPrice = await getPriceByKarat(karat);
  const marketPrice = currentPrice?.buyPrice || getDefaultPrice(karat);

  const basePrice = weightGrams * marketPrice;
  const sellerAskingTotal = weightGrams * sellerPricePerGram;

  const sellerCommission = sellerAskingTotal * SELLER_COMMISSION_RATE;
  const buyerCommission = sellerAskingTotal * BUYER_COMMISSION_RATE;

  const sellerGets = sellerAskingTotal - sellerCommission;
  const buyerPays = sellerAskingTotal + buyerCommission;

  const newGoldPrice = basePrice * (1 + NEW_GOLD_MARKUP);
  const savings = newGoldPrice - buyerPays;
  const savingsPercent = (savings / newGoldPrice) * 100;

  const xchangeRevenue = sellerCommission + buyerCommission;

  return {
    basePrice,
    sellerGets,
    sellerCommission,
    buyerPays,
    buyerCommission,
    newGoldPrice,
    savings,
    savingsPercent: Math.round(savingsPercent * 100) / 100,
    xchangeRevenue,
  };
};

/**
 * Get suggested price range for seller
 */
export const getSuggestedPriceRange = async (karat: 'K18' | 'K21' | 'K24') => {
  const currentPrice = await getPriceByKarat(karat);
  const marketPrice = currentPrice?.buyPrice || getDefaultPrice(karat);

  return {
    marketPrice,
    minSuggested: Math.round(marketPrice * 1.005), // +0.5%
    maxSuggested: Math.round(marketPrice * 1.015), // +1.5%
    sellerBonus: '+0.5% إلى +1.5% فوق سعر البورصة',
  };
};

function getDefaultPrice(karat: 'K18' | 'K21' | 'K24'): number {
  const defaults: Record<string, number> = {
    K18: 4480,
    K21: 5600,
    K24: 6400,
  };
  return defaults[karat] || 5600;
}

// ============================================
// Gold Items
// ============================================

export interface GoldItemFilters {
  category?: string;
  karat?: string;
  minWeight?: number;
  maxWeight?: number;
  minPrice?: number;
  maxPrice?: number;
  governorate?: string;
  verificationLevel?: string;
  status?: string;
  sellerId?: string;
  allowBarter?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Get gold items with filters
 */
export const getGoldItems = async (filters: GoldItemFilters) => {
  const {
    category,
    karat,
    minWeight,
    maxWeight,
    minPrice,
    maxPrice,
    governorate,
    verificationLevel,
    status = 'ACTIVE',
    sellerId,
    allowBarter,
    search,
    page = 1,
    limit = 20,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  } = filters;

  const where: any = {};

  if (status) where.status = status;
  if (category) where.category = category;
  if (karat) where.karat = karat;
  if (governorate) where.governorate = governorate;
  if (verificationLevel) where.verificationLevel = verificationLevel;
  if (sellerId) where.sellerId = sellerId;
  if (allowBarter !== undefined) where.allowBarter = allowBarter;

  if (minWeight || maxWeight) {
    where.weightGrams = {};
    if (minWeight) where.weightGrams.gte = minWeight;
    if (maxWeight) where.weightGrams.lte = maxWeight;
  }

  if (minPrice || maxPrice) {
    where.totalAskingPrice = {};
    if (minPrice) where.totalAskingPrice.gte = minPrice;
    if (maxPrice) where.totalAskingPrice.lte = maxPrice;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.goldItem.findMany({
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
            verifiedKarat: true,
            verifiedWeight: true,
            isAuthentic: true,
          },
        },
      },
      orderBy: { [sortBy]: sortOrder },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.goldItem.count({ where }),
  ]);

  // Enrich with current prices and savings
  const currentPrices = await getLatestPrices();

  const enrichedItems = items.map(item => {
    const marketPrice = currentPrices[item.karat]?.buyPrice || getDefaultPrice(item.karat as any);
    const newGoldPrice = item.weightGrams * marketPrice * (1 + NEW_GOLD_MARKUP);
    const buyerPays = item.totalAskingPrice * (1 + BUYER_COMMISSION_RATE);
    const savings = newGoldPrice - buyerPays;

    return {
      ...item,
      currentMarketPrice: marketPrice,
      buyerPays: Math.round(buyerPays),
      savings: Math.round(savings),
      savingsPercent: Math.round((savings / newGoldPrice) * 100 * 10) / 10,
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
 * Get single gold item by ID
 */
export const getGoldItemById = async (id: string) => {
  const item = await prisma.goldItem.findUnique({
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
  await prisma.goldItem.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  // Enrich with current prices
  const currentPrice = await getPriceByKarat(item.karat as any);
  const marketPrice = currentPrice?.buyPrice || getDefaultPrice(item.karat as any);
  const newGoldPrice = item.weightGrams * marketPrice * (1 + NEW_GOLD_MARKUP);
  const buyerPays = item.totalAskingPrice * (1 + BUYER_COMMISSION_RATE);
  const savings = newGoldPrice - buyerPays;

  return {
    ...item,
    currentMarketPrice: marketPrice,
    buyerPays: Math.round(buyerPays),
    buyerCommission: Math.round(item.totalAskingPrice * BUYER_COMMISSION_RATE),
    newGoldPrice: Math.round(newGoldPrice),
    savings: Math.round(savings),
    savingsPercent: Math.round((savings / newGoldPrice) * 100 * 10) / 10,
  };
};

/**
 * Create new gold item
 */
export const createGoldItem = async (
  sellerId: string,
  data: {
    title: string;
    description?: string;
    category: string;
    karat: string;
    weightGrams: number;
    condition?: string;
    images: string[];
    askingPricePerGram: number;
    governorate?: string;
    city?: string;
    allowBarter?: boolean;
    barterDescription?: string;
  }
) => {
  // Get current gold price
  const currentPrice = await getPriceByKarat(data.karat as any);
  const marketPrice = currentPrice?.buyPrice || getDefaultPrice(data.karat as any);

  const totalAskingPrice = data.weightGrams * data.askingPricePerGram;

  const item = await prisma.goldItem.create({
    data: {
      sellerId,
      title: data.title,
      description: data.description,
      category: data.category as any,
      karat: data.karat as any,
      weightGrams: data.weightGrams,
      condition: (data.condition as any) || 'GOOD',
      images: data.images,
      askingPricePerGram: data.askingPricePerGram,
      totalAskingPrice,
      goldPriceAtListing: marketPrice,
      governorate: data.governorate,
      city: data.city,
      allowBarter: data.allowBarter || false,
      barterDescription: data.barterDescription,
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
 * Update gold item
 */
export const updateGoldItem = async (
  id: string,
  sellerId: string,
  data: Partial<{
    title: string;
    description: string;
    askingPricePerGram: number;
    images: string[];
    status: string;
    allowBarter: boolean;
    barterDescription: string;
  }>
) => {
  // Verify ownership
  const item = await prisma.goldItem.findFirst({
    where: { id, sellerId },
  });

  if (!item) {
    throw new Error('Item not found or unauthorized');
  }

  const updateData: any = { ...data };

  // Recalculate total if price changed
  if (data.askingPricePerGram) {
    updateData.totalAskingPrice = item.weightGrams * data.askingPricePerGram;
  }

  const updated = await prisma.goldItem.update({
    where: { id },
    data: updateData,
  });

  return updated;
};

/**
 * Delete gold item
 */
export const deleteGoldItem = async (id: string, sellerId: string) => {
  const item = await prisma.goldItem.findFirst({
    where: { id, sellerId },
  });

  if (!item) {
    throw new Error('Item not found or unauthorized');
  }

  await prisma.goldItem.delete({ where: { id } });

  return { success: true };
};

// ============================================
// Gold Partners
// ============================================

/**
 * Get gold partners
 */
export const getGoldPartners = async (filters?: {
  governorate?: string;
  offersCertification?: boolean;
  offersPickup?: boolean;
}) => {
  const where: any = { isActive: true };

  if (filters?.governorate) where.governorate = filters.governorate;
  if (filters?.offersCertification !== undefined) where.offersCertification = filters.offersCertification;
  if (filters?.offersPickup !== undefined) where.offersPickup = filters.offersPickup;

  const partners = await prisma.goldPartner.findMany({
    where,
    orderBy: [{ isVerified: 'desc' }, { rating: 'desc' }],
  });

  return partners;
};

/**
 * Get partner by ID
 */
export const getGoldPartnerById = async (id: string) => {
  return prisma.goldPartner.findUnique({ where: { id } });
};

// ============================================
// Gold Transactions
// ============================================

/**
 * Create gold transaction
 */
export const createGoldTransaction = async (
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
  const item = await prisma.goldItem.findUnique({
    where: { id: data.itemId },
  });

  if (!item || item.status !== 'ACTIVE') {
    throw new Error('Item not available');
  }

  if (item.sellerId === buyerId) {
    throw new Error('Cannot buy your own item');
  }

  // Get current gold price
  const currentPrice = await getPriceByKarat(item.karat as any);
  const goldPrice = currentPrice?.buyPrice || getDefaultPrice(item.karat as any);

  // Calculate commissions
  const buyerCommission = item.totalAskingPrice * BUYER_COMMISSION_RATE;
  const sellerCommission = item.totalAskingPrice * SELLER_COMMISSION_RATE;
  const totalAmount = item.totalAskingPrice + buyerCommission;

  // Create transaction
  const transaction = await prisma.goldTransaction.create({
    data: {
      itemId: data.itemId,
      buyerId,
      sellerId: item.sellerId,
      goldPriceAtTransaction: goldPrice,
      itemPrice: item.totalAskingPrice,
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
  await prisma.goldItem.update({
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
  const transaction = await prisma.goldTransaction.findUnique({
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
      await prisma.goldItem.update({
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
      await prisma.goldItem.update({
        where: { id: transaction.itemId },
        data: { status: 'ACTIVE' },
      });
      break;
  }

  const updated = await prisma.goldTransaction.update({
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
 * Get user's gold transactions
 */
export const getUserGoldTransactions = async (
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

  const transactions = await prisma.goldTransaction.findMany({
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
 * Get gold marketplace statistics
 */
export const getGoldStatistics = async () => {
  const [
    totalItems,
    activeItems,
    totalTransactions,
    completedTransactions,
    totalPartners,
  ] = await Promise.all([
    prisma.goldItem.count(),
    prisma.goldItem.count({ where: { status: 'ACTIVE' } }),
    prisma.goldTransaction.count(),
    prisma.goldTransaction.count({ where: { status: 'COMPLETED' } }),
    prisma.goldPartner.count({ where: { isActive: true } }),
  ]);

  // Calculate total value
  const totalValue = await prisma.goldTransaction.aggregate({
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
