/**
 * Cross-Market Integration Service
 * خدمة التكامل بين الأسواق
 *
 * Provides unified functionality across all platform markets:
 * - Universal search
 * - Cross-market recommendations
 * - Price comparison
 * - Market analytics
 * - Trending items
 */

import prisma from '../lib/prisma';

// ============================================
// Types
// ============================================

export type MarketType =
  | 'GENERAL'
  | 'VEHICLES'
  | 'REAL_ESTATE'
  | 'MOBILES'
  | 'AUCTIONS'
  | 'TENDERS'
  | 'BARTER'
  | 'GOLD'
  | 'SILVER'
  | 'LUXURY'
  | 'SCRAP';

export interface UniversalSearchParams {
  query?: string;
  markets?: MarketType[];
  governorate?: string;
  city?: string;
  priceMin?: number;
  priceMax?: number;
  condition?: string;
  sortBy?: 'relevance' | 'price_asc' | 'price_desc' | 'date' | 'popularity';
  page?: number;
  limit?: number;
}

export interface SearchResult {
  id: string;
  market: MarketType;
  title: string;
  description: string;
  price: number | null;
  currency: string;
  images: string[];
  location: {
    governorate: string;
    city?: string;
  };
  seller: {
    id: string;
    name: string;
    rating: number;
  };
  createdAt: Date;
  url: string;
}

// ============================================
// Universal Search
// ============================================

/**
 * Search across all markets
 */
export const universalSearch = async (
  params: UniversalSearchParams
): Promise<{
  results: SearchResult[];
  total: number;
  markets: Record<MarketType, number>;
  pagination: { page: number; limit: number; totalPages: number };
}> => {
  const {
    query,
    markets = ['GENERAL', 'VEHICLES', 'REAL_ESTATE', 'MOBILES', 'AUCTIONS', 'GOLD', 'SILVER'],
    governorate,
    priceMin,
    priceMax,
    page = 1,
    limit = 20,
  } = params;

  const results: SearchResult[] = [];
  const marketCounts: Record<MarketType, number> = {
    GENERAL: 0,
    VEHICLES: 0,
    REAL_ESTATE: 0,
    MOBILES: 0,
    AUCTIONS: 0,
    TENDERS: 0,
    BARTER: 0,
    GOLD: 0,
    SILVER: 0,
    LUXURY: 0,
    SCRAP: 0,
  };

  // Search General Market (Items)
  if (markets.includes('GENERAL')) {
    const items = await searchGeneralMarket(query, governorate, priceMin, priceMax);
    results.push(...items);
    marketCounts.GENERAL = items.length;
  }

  // Search Gold
  if (markets.includes('GOLD')) {
    const goldItems = await searchGold(query, governorate);
    results.push(...goldItems);
    marketCounts.GOLD = goldItems.length;
  }

  // Search Silver
  if (markets.includes('SILVER')) {
    const silverItems = await searchSilver(query, governorate);
    results.push(...silverItems);
    marketCounts.SILVER = silverItems.length;
  }

  // Search Real Estate
  if (markets.includes('REAL_ESTATE')) {
    const properties = await searchRealEstate(query, governorate, priceMin, priceMax);
    results.push(...properties);
    marketCounts.REAL_ESTATE = properties.length;
  }

  // Sort results
  const sortedResults = sortResults(results, params.sortBy || 'relevance');

  // Paginate
  const startIndex = (page - 1) * limit;
  const paginatedResults = sortedResults.slice(startIndex, startIndex + limit);
  const total = results.length;

  return {
    results: paginatedResults,
    total,
    markets: marketCounts,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// Market-Specific Search Functions
// ============================================

async function searchGeneralMarket(
  query?: string,
  governorate?: string,
  priceMin?: number,
  priceMax?: number
): Promise<SearchResult[]> {
  const where: any = { status: 'ACTIVE' };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (governorate) {
    where.governorate = governorate;
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    where.estimatedValue = {};
    if (priceMin !== undefined) where.estimatedValue.gte = priceMin;
    if (priceMax !== undefined) where.estimatedValue.lte = priceMax;
  }

  const items = await prisma.item.findMany({
    where,
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: { id: true, fullName: true, rating: true },
      },
    },
  });

  return items.map((item) => ({
    id: item.id,
    market: 'GENERAL' as MarketType,
    title: item.title,
    description: item.description || '',
    price: item.estimatedValue,
    currency: 'EGP',
    images: item.images || [],
    location: {
      governorate: item.governorate || '',
      city: item.city || undefined,
    },
    seller: {
      id: item.seller.id,
      name: item.seller.fullName,
      rating: item.seller.rating,
    },
    createdAt: item.createdAt,
    url: `/items/${item.id}`,
  }));
}

async function searchRealEstate(
  query?: string,
  governorate?: string,
  priceMin?: number,
  priceMax?: number
): Promise<SearchResult[]> {
  const where: any = { status: 'ACTIVE' };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (governorate) {
    where.governorate = governorate;
  }

  if (priceMin !== undefined || priceMax !== undefined) {
    where.salePrice = {};
    if (priceMin !== undefined) where.salePrice.gte = priceMin;
    if (priceMax !== undefined) where.salePrice.lte = priceMax;
  }

  const properties = await prisma.property.findMany({
    where,
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: { id: true, fullName: true, rating: true },
      },
    },
  });

  return properties.map((property) => ({
    id: property.id,
    market: 'REAL_ESTATE' as MarketType,
    title: property.title,
    description: property.description || '',
    price: property.salePrice,
    currency: 'EGP',
    images: (property.images as string[]) || [],
    location: {
      governorate: property.governorate || '',
      city: property.city || undefined,
    },
    seller: {
      id: property.owner.id,
      name: property.owner.fullName,
      rating: property.owner.rating,
    },
    createdAt: property.createdAt,
    url: `/properties/${property.id}`,
  }));
}

async function searchGold(query?: string, governorate?: string): Promise<SearchResult[]> {
  const where: any = { status: 'ACTIVE' };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (governorate) {
    where.governorate = governorate;
  }

  const goldItems = await prisma.goldItem.findMany({
    where,
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: { id: true, fullName: true, rating: true },
      },
    },
  });

  return goldItems.map((item) => ({
    id: item.id,
    market: 'GOLD' as MarketType,
    title: item.title,
    description: item.description || '',
    price: item.totalAskingPrice,
    currency: 'EGP',
    images: item.images || [],
    location: {
      governorate: item.governorate || '',
      city: item.city || undefined,
    },
    seller: {
      id: item.seller.id,
      name: item.seller.fullName,
      rating: item.seller.rating,
    },
    createdAt: item.createdAt,
    url: `/gold/${item.id}`,
  }));
}

async function searchSilver(query?: string, governorate?: string): Promise<SearchResult[]> {
  const where: any = { status: 'ACTIVE' };

  if (query) {
    where.OR = [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ];
  }

  if (governorate) {
    where.governorate = governorate;
  }

  const silverItems = await prisma.silverItem.findMany({
    where,
    take: 50,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: { id: true, fullName: true, rating: true },
      },
    },
  });

  return silverItems.map((item) => ({
    id: item.id,
    market: 'SILVER' as MarketType,
    title: item.title,
    description: item.description || '',
    price: item.askingPrice,
    currency: 'EGP',
    images: item.images || [],
    location: {
      governorate: item.governorate || '',
      city: item.city || undefined,
    },
    seller: {
      id: item.seller.id,
      name: item.seller.fullName,
      rating: item.seller.rating,
    },
    createdAt: item.createdAt,
    url: `/silver/${item.id}`,
  }));
}

function sortResults(
  results: SearchResult[],
  sortBy: 'relevance' | 'price_asc' | 'price_desc' | 'date' | 'popularity'
): SearchResult[] {
  switch (sortBy) {
    case 'price_asc':
      return [...results].sort((a, b) => (a.price || 0) - (b.price || 0));
    case 'price_desc':
      return [...results].sort((a, b) => (b.price || 0) - (a.price || 0));
    case 'date':
      return [...results].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    case 'popularity':
      return [...results].sort((a, b) => b.seller.rating - a.seller.rating);
    case 'relevance':
    default:
      return results;
  }
}

// ============================================
// Market Statistics
// ============================================

/**
 * Get statistics across all markets
 */
export const getMarketStatistics = async (): Promise<{
  markets: Record<MarketType, { totalListings: number; totalValue: number }>;
  totals: { listings: number; value: number };
}> => {
  const stats: Record<MarketType, { totalListings: number; totalValue: number }> = {
    GENERAL: { totalListings: 0, totalValue: 0 },
    VEHICLES: { totalListings: 0, totalValue: 0 },
    REAL_ESTATE: { totalListings: 0, totalValue: 0 },
    MOBILES: { totalListings: 0, totalValue: 0 },
    AUCTIONS: { totalListings: 0, totalValue: 0 },
    TENDERS: { totalListings: 0, totalValue: 0 },
    BARTER: { totalListings: 0, totalValue: 0 },
    GOLD: { totalListings: 0, totalValue: 0 },
    SILVER: { totalListings: 0, totalValue: 0 },
    LUXURY: { totalListings: 0, totalValue: 0 },
    SCRAP: { totalListings: 0, totalValue: 0 },
  };

  // General market
  const generalStats = await prisma.item.aggregate({
    where: { status: 'ACTIVE' },
    _count: true,
    _sum: { estimatedValue: true },
  });
  stats.GENERAL = {
    totalListings: generalStats._count,
    totalValue: generalStats._sum.estimatedValue || 0,
  };

  // Gold market
  const goldStats = await prisma.goldItem.aggregate({
    where: { status: 'ACTIVE' },
    _count: true,
    _sum: { totalAskingPrice: true },
  });
  stats.GOLD = {
    totalListings: goldStats._count,
    totalValue: goldStats._sum.totalAskingPrice || 0,
  };

  // Silver market
  const silverStats = await prisma.silverItem.aggregate({
    where: { status: 'ACTIVE' },
    _count: true,
    _sum: { askingPrice: true },
  });
  stats.SILVER = {
    totalListings: silverStats._count,
    totalValue: silverStats._sum.askingPrice || 0,
  };

  // Real Estate
  const propertyStats = await prisma.property.aggregate({
    where: { status: 'ACTIVE' },
    _count: true,
    _sum: { salePrice: true },
  });
  stats.REAL_ESTATE = {
    totalListings: propertyStats._count,
    totalValue: propertyStats._sum.salePrice || 0,
  };

  // Auctions
  const auctionStats = await prisma.auction.aggregate({
    where: { status: 'ACTIVE' },
    _count: true,
    _sum: { currentPrice: true },
  });
  stats.AUCTIONS = {
    totalListings: auctionStats._count,
    totalValue: auctionStats._sum.currentPrice || 0,
  };

  // Tenders
  const tenderStats = await prisma.reverseAuction.aggregate({
    where: { status: 'ACTIVE' },
    _count: true,
    _sum: { maxBudget: true },
  });
  stats.TENDERS = {
    totalListings: tenderStats._count,
    totalValue: tenderStats._sum.maxBudget || 0,
  };

  // Calculate totals
  const totals = Object.values(stats).reduce(
    (acc, market) => ({
      listings: acc.listings + market.totalListings,
      value: acc.value + market.totalValue,
    }),
    { listings: 0, value: 0 }
  );

  return { markets: stats, totals };
};

// ============================================
// Trending Items
// ============================================

/**
 * Get trending items across markets
 */
export const getTrendingItems = async (limit: number = 20): Promise<SearchResult[]> => {
  const results: SearchResult[] = [];

  // Get trending items from general market (most viewed)
  const trendingItems = await prisma.item.findMany({
    where: { status: 'ACTIVE' },
    take: limit,
    orderBy: { views: 'desc' },
    include: {
      seller: {
        select: { id: true, fullName: true, rating: true },
      },
    },
  });

  results.push(
    ...trendingItems.map((item) => ({
      id: item.id,
      market: 'GENERAL' as MarketType,
      title: item.title,
      description: item.description || '',
      price: item.estimatedValue,
      currency: 'EGP',
      images: item.images || [],
      location: {
        governorate: item.governorate || '',
        city: item.city || undefined,
      },
      seller: {
        id: item.seller.id,
        name: item.seller.fullName,
        rating: item.seller.rating,
      },
      createdAt: item.createdAt,
      url: `/items/${item.id}`,
    }))
  );

  return results;
};

// ============================================
// Recommendations
// ============================================

/**
 * Get personalized recommendations for a user
 */
export const getRecommendations = async (
  userId: string,
  limit: number = 10
): Promise<SearchResult[]> => {
  // Get user's location preference
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { governorate: true, city: true },
  });

  if (!user) {
    return getTrendingItems(limit);
  }

  // Get items from user's governorate
  const localItems = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      governorate: user.governorate || undefined,
      sellerId: { not: userId },
    },
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: { id: true, fullName: true, rating: true },
      },
    },
  });

  return localItems.map((item) => ({
    id: item.id,
    market: 'GENERAL' as MarketType,
    title: item.title,
    description: item.description || '',
    price: item.estimatedValue,
    currency: 'EGP',
    images: item.images || [],
    location: {
      governorate: item.governorate || '',
      city: item.city || undefined,
    },
    seller: {
      id: item.seller.id,
      name: item.seller.fullName,
      rating: item.seller.rating,
    },
    createdAt: item.createdAt,
    url: `/items/${item.id}`,
  }));
};
