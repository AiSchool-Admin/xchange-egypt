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

import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';

// ============================================
// Types
// ============================================

export type MarketType =
  | 'GENERAL'
  | 'CARS'
  | 'PROPERTIES'
  | 'MOBILES'
  | 'AUCTIONS'
  | 'TENDERS'
  | 'BARTER'
  | 'GOLD'
  | 'SILVER'
  | 'LUXURY'
  | 'SCRAP';

export interface UniversalSearchParams {
  query: string;
  markets?: MarketType[];
  minPrice?: number;
  maxPrice?: number;
  governorate?: string;
  condition?: string;
  sortBy?: 'price_asc' | 'price_desc' | 'recent' | 'relevance';
  limit?: number;
  offset?: number;
}

export interface SearchResult {
  id: string;
  title: string;
  description?: string;
  price?: number;
  estimatedValue?: number;
  market: MarketType;
  marketIcon: string;
  marketNameAr: string;
  images: string[];
  governorate?: string;
  condition?: string;
  listingType?: string;
  createdAt: Date;
  seller?: {
    id: string;
    name: string;
    rating?: number;
  };
  url: string;
}

export interface MarketStats {
  market: MarketType;
  totalItems: number;
  activeItems: number;
  avgPrice: number;
  minPrice: number;
  maxPrice: number;
  totalTransactions: number;
  trendingUp: boolean;
}

export interface TrendingItem {
  id: string;
  title: string;
  market: MarketType;
  price: number;
  views: number;
  saves: number;
  imageUrl?: string;
  url: string;
}

export interface RecommendationParams {
  userId: string;
  limit?: number;
  excludeViewed?: boolean;
}

// ============================================
// Market Metadata
// ============================================

const MARKET_METADATA: Record<MarketType, { icon: string; nameAr: string; baseUrl: string }> = {
  GENERAL: { icon: '🛒', nameAr: 'السوق العام', baseUrl: '/items' },
  CARS: { icon: '🚗', nameAr: 'السيارات', baseUrl: '/cars' },
  PROPERTIES: { icon: '🏠', nameAr: 'العقارات', baseUrl: '/properties' },
  MOBILES: { icon: '📱', nameAr: 'الموبايلات', baseUrl: '/mobiles' },
  AUCTIONS: { icon: '🔨', nameAr: 'المزادات', baseUrl: '/auctions' },
  TENDERS: { icon: '📋', nameAr: 'المناقصات', baseUrl: '/reverse-auctions' },
  BARTER: { icon: '🔄', nameAr: 'المقايضة', baseUrl: '/pools' },
  GOLD: { icon: '🥇', nameAr: 'الذهب', baseUrl: '/gold' },
  SILVER: { icon: '🥈', nameAr: 'الفضة', baseUrl: '/silver' },
  LUXURY: { icon: '💎', nameAr: 'الرفاهية', baseUrl: '/luxury' },
  SCRAP: { icon: '♻️', nameAr: 'الخردة', baseUrl: '/scrap' },
};

// ============================================
// Universal Search
// ============================================

/**
 * Search across all markets
 */
export const universalSearch = async (params: UniversalSearchParams): Promise<{
  results: SearchResult[];
  total: number;
  facets: Record<MarketType, number>;
}> => {
  const {
    query,
    markets = Object.keys(MARKET_METADATA) as MarketType[],
    minPrice,
    maxPrice,
    governorate,
    condition,
    sortBy = 'relevance',
    limit = 20,
    offset = 0,
  } = params;

  const results: SearchResult[] = [];
  const facets: Record<MarketType, number> = {} as Record<MarketType, number>;

  // Build base where clause for items
  const baseWhere: Prisma.ItemWhereInput = {
    status: 'ACTIVE',
    OR: [
      { title: { contains: query, mode: 'insensitive' } },
      { description: { contains: query, mode: 'insensitive' } },
    ],
    ...(minPrice && { estimatedValue: { gte: minPrice } }),
    ...(maxPrice && { estimatedValue: { lte: maxPrice } }),
    ...(governorate && { governorate }),
    ...(condition && { condition: condition as any }),
  };

  // Search in general items
  if (markets.includes('GENERAL') || markets.includes('LUXURY')) {
    const items = await prisma.item.findMany({
      where: baseWhere,
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            fullName: true,
          },
        },
        category: true,
      },
      take: limit,
      skip: offset,
      orderBy: getOrderBy(sortBy),
    });

    const itemCount = await prisma.item.count({ where: baseWhere });
    facets.GENERAL = itemCount;

    // Separate luxury items
    const luxuryItems = items.filter(i => (i.estimatedValue || 0) >= 50000);
    const regularItems = items.filter(i => (i.estimatedValue || 0) < 50000);

    facets.LUXURY = luxuryItems.length;

    regularItems.forEach(item => {
      results.push(transformItemToSearchResult(item, 'GENERAL'));
    });

    luxuryItems.forEach(item => {
      results.push(transformItemToSearchResult(item, 'LUXURY'));
    });
  }

  // Search in cars
  if (markets.includes('CARS')) {
    const cars = await prisma.car.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        ...(minPrice && { price: { gte: minPrice } }),
        ...(maxPrice && { price: { lte: maxPrice } }),
        ...(governorate && { governorate }),
      },
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      take: Math.min(limit, 10),
    });

    facets.CARS = await prisma.car.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    cars.forEach(car => {
      results.push({
        id: car.id,
        title: car.title,
        description: car.description || undefined,
        price: car.price,
        market: 'CARS',
        marketIcon: MARKET_METADATA.CARS.icon,
        marketNameAr: MARKET_METADATA.CARS.nameAr,
        images: car.images?.map((img: any) => img.url) || [],
        governorate: car.governorate || undefined,
        condition: car.condition || undefined,
        createdAt: car.createdAt,
        seller: car.seller ? {
          id: car.seller.id,
          name: car.seller.fullName || '',
        } : undefined,
        url: `/cars/${car.id}`,
      });
    });
  }

  // Search in properties
  if (markets.includes('PROPERTIES')) {
    const properties = await prisma.property.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        ...(minPrice && { price: { gte: minPrice } }),
        ...(maxPrice && { price: { lte: maxPrice } }),
        ...(governorate && { governorate }),
      },
      include: {
        images: true,
        seller: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      take: Math.min(limit, 10),
    });

    facets.PROPERTIES = await prisma.property.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    properties.forEach(property => {
      results.push({
        id: property.id,
        title: property.title,
        description: property.description || undefined,
        price: property.price,
        market: 'PROPERTIES',
        marketIcon: MARKET_METADATA.PROPERTIES.icon,
        marketNameAr: MARKET_METADATA.PROPERTIES.nameAr,
        images: property.images?.map((img: any) => img.url) || [],
        governorate: property.governorate || undefined,
        createdAt: property.createdAt,
        seller: property.seller ? {
          id: property.seller.id,
          name: property.seller.fullName || '',
        } : undefined,
        url: `/properties/${property.id}`,
      });
    });
  }

  // Search in auctions
  if (markets.includes('AUCTIONS')) {
    const auctions = await prisma.auction.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
        ...(minPrice && { currentBid: { gte: minPrice } }),
        ...(maxPrice && { currentBid: { lte: maxPrice } }),
      },
      include: {
        item: {
          include: {
            images: true,
          },
        },
        seller: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      take: Math.min(limit, 10),
    });

    facets.AUCTIONS = await prisma.auction.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    auctions.forEach(auction => {
      results.push({
        id: auction.id,
        title: auction.title,
        description: auction.description || undefined,
        price: auction.currentBid,
        market: 'AUCTIONS',
        marketIcon: MARKET_METADATA.AUCTIONS.icon,
        marketNameAr: MARKET_METADATA.AUCTIONS.nameAr,
        images: auction.item?.images?.map((img: any) => img.url) || [],
        createdAt: auction.createdAt,
        seller: auction.seller ? {
          id: auction.seller.id,
          name: auction.seller.fullName || '',
        } : undefined,
        url: `/auctions/${auction.id}`,
      });
    });
  }

  // Search in gold items
  if (markets.includes('GOLD')) {
    const goldItems = await prisma.goldItem.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { titleAr: { contains: query, mode: 'insensitive' } },
        ],
        ...(minPrice && { totalPrice: { gte: minPrice } }),
        ...(maxPrice && { totalPrice: { lte: maxPrice } }),
      },
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
          },
        },
      },
      take: Math.min(limit, 10),
    });

    facets.GOLD = await prisma.goldItem.count({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { titleAr: { contains: query, mode: 'insensitive' } },
        ],
      },
    });

    goldItems.forEach(item => {
      results.push({
        id: item.id,
        title: item.titleAr || item.title,
        description: item.descriptionAr || item.description || undefined,
        price: item.totalPrice,
        market: 'GOLD',
        marketIcon: MARKET_METADATA.GOLD.icon,
        marketNameAr: MARKET_METADATA.GOLD.nameAr,
        images: item.images || [],
        condition: item.condition || undefined,
        createdAt: item.createdAt,
        seller: item.seller ? {
          id: item.seller.id,
          name: item.seller.fullName || '',
        } : undefined,
        url: `/gold/${item.id}`,
      });
    });
  }

  // Sort all results
  const sortedResults = sortResults(results, sortBy);

  return {
    results: sortedResults.slice(offset, offset + limit),
    total: Object.values(facets).reduce((a, b) => a + b, 0),
    facets,
  };
};

// ============================================
// Market Statistics
// ============================================

/**
 * Get statistics for all markets
 */
export const getMarketStatistics = async (): Promise<MarketStats[]> => {
  const stats: MarketStats[] = [];

  // General market stats
  const generalItems = await prisma.item.aggregate({
    where: { status: 'ACTIVE' },
    _count: true,
    _avg: { estimatedValue: true },
    _min: { estimatedValue: true },
    _max: { estimatedValue: true },
  });

  stats.push({
    market: 'GENERAL',
    totalItems: generalItems._count,
    activeItems: generalItems._count,
    avgPrice: generalItems._avg.estimatedValue || 0,
    minPrice: generalItems._min.estimatedValue || 0,
    maxPrice: generalItems._max.estimatedValue || 0,
    totalTransactions: 0, // TODO: Calculate from transactions
    trendingUp: true,
  });

  // Cars market stats
  const carStats = await prisma.car.aggregate({
    where: { status: 'ACTIVE' },
    _count: true,
    _avg: { price: true },
    _min: { price: true },
    _max: { price: true },
  });

  stats.push({
    market: 'CARS',
    totalItems: carStats._count,
    activeItems: carStats._count,
    avgPrice: carStats._avg.price || 0,
    minPrice: carStats._min.price || 0,
    maxPrice: carStats._max.price || 0,
    totalTransactions: 0,
    trendingUp: true,
  });

  // Properties market stats
  const propertyStats = await prisma.property.aggregate({
    where: { status: 'ACTIVE' },
    _count: true,
    _avg: { price: true },
    _min: { price: true },
    _max: { price: true },
  });

  stats.push({
    market: 'PROPERTIES',
    totalItems: propertyStats._count,
    activeItems: propertyStats._count,
    avgPrice: propertyStats._avg.price || 0,
    minPrice: propertyStats._min.price || 0,
    maxPrice: propertyStats._max.price || 0,
    totalTransactions: 0,
    trendingUp: true,
  });

  // Auctions stats
  const auctionStats = await prisma.auction.aggregate({
    where: { status: 'ACTIVE' },
    _count: true,
    _avg: { currentBid: true },
    _min: { startingPrice: true },
    _max: { currentBid: true },
  });

  stats.push({
    market: 'AUCTIONS',
    totalItems: auctionStats._count,
    activeItems: auctionStats._count,
    avgPrice: auctionStats._avg.currentBid || 0,
    minPrice: auctionStats._min.startingPrice || 0,
    maxPrice: auctionStats._max.currentBid || 0,
    totalTransactions: 0,
    trendingUp: true,
  });

  // Gold stats
  const goldStats = await prisma.goldItem.aggregate({
    where: { status: 'ACTIVE' },
    _count: true,
    _avg: { totalPrice: true },
    _min: { totalPrice: true },
    _max: { totalPrice: true },
  });

  stats.push({
    market: 'GOLD',
    totalItems: goldStats._count,
    activeItems: goldStats._count,
    avgPrice: goldStats._avg.totalPrice || 0,
    minPrice: goldStats._min.totalPrice || 0,
    maxPrice: goldStats._max.totalPrice || 0,
    totalTransactions: 0,
    trendingUp: true,
  });

  return stats;
};

/**
 * Get trending items across all markets
 */
export const getTrendingItems = async (limit = 10): Promise<TrendingItem[]> => {
  const trending: TrendingItem[] = [];

  // Get recent items with activity (views would need a view tracking system)
  // For now, get recently created items with high values
  const items = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
    include: {
      images: true,
      _count: {
        select: {
          favorites: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  items.forEach(item => {
    const isLuxury = (item.estimatedValue || 0) >= 50000;
    trending.push({
      id: item.id,
      title: item.title,
      market: isLuxury ? 'LUXURY' : 'GENERAL',
      price: item.estimatedValue || 0,
      views: 0, // TODO: Implement view tracking
      saves: item._count.favorites,
      imageUrl: item.images[0]?.url,
      url: isLuxury ? `/luxury/${item.id}` : `/items/${item.id}`,
    });
  });

  return trending;
};

/**
 * Get personalized recommendations for a user
 */
export const getRecommendations = async (params: RecommendationParams): Promise<SearchResult[]> => {
  const { userId, limit = 10, excludeViewed = true } = params;

  // Get user's recent activity
  const userFavorites = await prisma.favorite.findMany({
    where: { userId },
    include: {
      item: {
        include: {
          category: true,
        },
      },
    },
    take: 20,
    orderBy: { createdAt: 'desc' },
  });

  // Extract preferred categories
  const preferredCategories = [...new Set(
    userFavorites
      .map(f => f.item?.categoryId)
      .filter(Boolean)
  )];

  // Get user's governorate from profile
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { governorate: true },
  });

  // Find similar items
  const recommendations = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      ...(preferredCategories.length > 0 && {
        categoryId: { in: preferredCategories as string[] },
      }),
      ...(user?.governorate && { governorate: user.governorate }),
      // Exclude user's own items
      sellerId: { not: userId },
      // Exclude favorited items
      ...(excludeViewed && {
        id: { notIn: userFavorites.map(f => f.itemId).filter(Boolean) as string[] },
      }),
    },
    include: {
      images: true,
      seller: {
        select: {
          id: true,
          fullName: true,
        },
      },
      category: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit,
  });

  return recommendations.map(item => transformItemToSearchResult(item, 'GENERAL'));
};

// ============================================
// Helper Functions
// ============================================

function transformItemToSearchResult(item: any, market: MarketType): SearchResult {
  const metadata = MARKET_METADATA[market];
  return {
    id: item.id,
    title: item.title,
    description: item.description || undefined,
    price: item.price,
    estimatedValue: item.estimatedValue,
    market,
    marketIcon: metadata.icon,
    marketNameAr: metadata.nameAr,
    images: item.images?.map((img: any) => img.url) || [],
    governorate: item.governorate || undefined,
    condition: item.condition || undefined,
    listingType: item.listingType || undefined,
    createdAt: item.createdAt,
    seller: item.seller ? {
      id: item.seller.id,
      name: item.seller.fullName || '',
      rating: item.seller.rating,
    } : undefined,
    url: `${metadata.baseUrl}/${item.id}`,
  };
}

function getOrderBy(sortBy: string): Prisma.ItemOrderByWithRelationInput {
  switch (sortBy) {
    case 'price_asc':
      return { estimatedValue: 'asc' };
    case 'price_desc':
      return { estimatedValue: 'desc' };
    case 'recent':
      return { createdAt: 'desc' };
    default:
      return { createdAt: 'desc' };
  }
}

function sortResults(results: SearchResult[], sortBy: string): SearchResult[] {
  return results.sort((a, b) => {
    switch (sortBy) {
      case 'price_asc':
        return (a.price || a.estimatedValue || 0) - (b.price || b.estimatedValue || 0);
      case 'price_desc':
        return (b.price || b.estimatedValue || 0) - (a.price || a.estimatedValue || 0);
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });
}
