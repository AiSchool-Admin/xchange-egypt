/**
 * Advanced Search Service
 *
 * Comprehensive search functionality with advanced filtering,
 * sorting, full-text search, and AI-powered search
 */

import prisma from '../config/database';
import { NotFoundError, BadRequestError } from '../utils/errors';

// ============================================
// Types
// ============================================

export interface SearchFilters {
  // Text search
  query?: string;

  // Category
  categoryId?: string;
  categorySlug?: string;

  // Price range
  minPrice?: number;
  maxPrice?: number;

  // Item condition
  condition?: string | string[];

  // Item status
  status?: string | string[];

  // Location
  location?: string;
  governorate?: string;
  latitude?: number;
  longitude?: number;
  radius?: number; // km

  // User filters
  sellerId?: string;
  userType?: string; // INDIVIDUAL or BUSINESS
  minRating?: number;

  // Listing type
  listingType?: string | string[];

  // Auction filters
  activeAuctions?: boolean;
  endingSoon?: boolean; // Ending within 24 hours

  // Reverse auction filters
  activeReverseAuctions?: boolean;

  // Date filters
  createdAfter?: Date;
  createdBefore?: Date;

  // Verification
  verifiedSellers?: boolean;

  // Pagination
  page?: number;
  limit?: number;

  // Sorting
  sortBy?: 'relevance' | 'price_low' | 'price_high' | 'newest' | 'oldest' | 'popular' | 'rating';
}

export interface SearchResult {
  items: any[];
  listings: any[];
  auctions: any[];
  reverseAuctions: any[];
  total: number;
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  };
  suggestions?: string[];
}

export interface SavedSearchInput {
  name: string;
  query?: string;
  filters: Record<string, any>;
  notifyOnNew?: boolean;
}

// ============================================
// Main Search Function
// ============================================

/**
 * Advanced search with comprehensive filtering
 */
export const search = async (
  filters: SearchFilters,
  userId?: string
): Promise<SearchResult> => {
  const page = filters.page || 1;
  const limit = Math.min(filters.limit || 20, 100);
  const skip = (page - 1) * limit;

  // Build search conditions
  const itemWhere: any = { status: 'ACTIVE' };
  const listingWhere: any = { status: 'ACTIVE' };
  const auctionWhere: any = {};
  const reverseAuctionWhere: any = {};

  // Text search - full-text search on title and description
  if (filters.query) {
    const searchTerms = filters.query.toLowerCase().split(' ').filter(t => t.length > 2);

    if (searchTerms.length > 0) {
      itemWhere.OR = [
        { title: { contains: filters.query, mode: 'insensitive' } },
        { description: { contains: filters.query, mode: 'insensitive' } },
        ...searchTerms.map(term => ({
          title: { contains: term, mode: 'insensitive' }
        })),
        ...searchTerms.map(term => ({
          description: { contains: term, mode: 'insensitive' }
        }))
      ];
    }
  }

  // Category filter
  if (filters.categoryId) {
    itemWhere.categoryId = filters.categoryId;
  }

  if (filters.categorySlug) {
    const category = await prisma.category.findUnique({
      where: { slug: filters.categorySlug },
    });
    if (category) {
      itemWhere.categoryId = category.id;
    }
  }

  // Condition filter
  if (filters.condition) {
    if (Array.isArray(filters.condition)) {
      itemWhere.condition = { in: filters.condition };
    } else {
      itemWhere.condition = filters.condition;
    }
  }

  // Location filters
  if (filters.location) {
    itemWhere.location = { contains: filters.location, mode: 'insensitive' };
  }

  if (filters.governorate) {
    itemWhere.seller = {
      governorate: { contains: filters.governorate, mode: 'insensitive' }
    };
  }

  // Seller filters
  if (filters.sellerId) {
    itemWhere.sellerId = filters.sellerId;
  }

  if (filters.userType) {
    itemWhere.seller = {
      ...itemWhere.seller,
      userType: filters.userType
    };
  }

  if (filters.minRating) {
    itemWhere.seller = {
      ...itemWhere.seller,
      rating: { gte: filters.minRating }
    };
  }

  if (filters.verifiedSellers) {
    itemWhere.seller = {
      ...itemWhere.seller,
      emailVerified: true
    };
  }

  // Date filters
  if (filters.createdAfter) {
    itemWhere.createdAt = { gte: filters.createdAfter };
  }

  if (filters.createdBefore) {
    itemWhere.createdAt = {
      ...itemWhere.createdAt,
      lte: filters.createdBefore
    };
  }

  // Listing type filter - apply to both listings and items queries
  if (filters.listingType) {
    if (Array.isArray(filters.listingType)) {
      listingWhere.listingType = { in: filters.listingType };
      // Also filter items to only include those with active listings of these types
      itemWhere.listings = {
        some: {
          listingType: { in: filters.listingType },
          status: 'ACTIVE',
        },
      };
    } else {
      listingWhere.listingType = filters.listingType;
      // Also filter items to only include those with an active listing of this type
      itemWhere.listings = {
        some: {
          listingType: filters.listingType,
          status: 'ACTIVE',
        },
      };
    }
  }

  // Price range filter (for listings with price)
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    listingWhere.price = {};
    if (filters.minPrice !== undefined) {
      listingWhere.price.gte = filters.minPrice;
    }
    if (filters.maxPrice !== undefined) {
      listingWhere.price.lte = filters.maxPrice;
    }
  }

  // Auction filters
  if (filters.activeAuctions) {
    auctionWhere.status = 'ACTIVE';
    auctionWhere.endTime = { gt: new Date() };
  }

  if (filters.endingSoon) {
    const in24Hours = new Date(Date.now() + 24 * 60 * 60 * 1000);
    auctionWhere.status = 'ACTIVE';
    auctionWhere.endTime = {
      gt: new Date(),
      lte: in24Hours
    };
  }

  // Reverse auction filters
  if (filters.activeReverseAuctions) {
    reverseAuctionWhere.status = 'ACTIVE';
    reverseAuctionWhere.endDate = { gt: new Date() };
  }

  // Sorting
  let orderBy: any = { createdAt: 'desc' }; // Default

  if (filters.sortBy === 'price_low') {
    orderBy = { estimatedValue: 'asc' };
  } else if (filters.sortBy === 'price_high') {
    orderBy = { estimatedValue: 'desc' };
  } else if (filters.sortBy === 'newest') {
    orderBy = { createdAt: 'desc' };
  } else if (filters.sortBy === 'oldest') {
    orderBy = { createdAt: 'asc' };
  } else if (filters.sortBy === 'popular') {
    orderBy = { views: 'desc' };
  }

  // Execute search queries in parallel
  const [items, listings, auctions, reverseAuctions, totalItems] = await Promise.all([
    // Search items
    prisma.item.findMany({
      where: itemWhere,
      skip,
      take: limit,
      orderBy,
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
            totalReviews: true,
            emailVerified: true,
            userType: true,
            city: true,
            governorate: true,
          },
        },
        category: {
          select: {
            id: true,
            nameEn: true,
            nameAr: true,
            slug: true,
          },
        },
      },
    }),

    // Search active listings
    prisma.listing.findMany({
      where: {
        ...listingWhere,
        item: itemWhere,
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        item: {
          include: {
            seller: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                rating: true,
              },
            },
            category: true,
          },
        },
      },
    }),

    // Search auctions
    filters.activeAuctions || filters.endingSoon
      ? prisma.auction.findMany({
          where: auctionWhere,
          take: 10,
          orderBy: { endTime: 'asc' },
          include: {
            listing: {
              include: {
                item: {
                  include: {
                    seller: {
                      select: {
                        id: true,
                        fullName: true,
                        avatar: true,
                        rating: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })
      : [],

    // Search reverse auctions
    filters.activeReverseAuctions
      ? prisma.reverseAuction.findMany({
          where: reverseAuctionWhere,
          take: 10,
          orderBy: { endDate: 'asc' },
          include: {
            buyer: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
                rating: true,
              },
            },
            category: true,
          },
        })
      : [],

    // Count total results
    prisma.item.count({ where: itemWhere }),
  ]);

  // Track search in history
  if (filters.query || Object.keys(filters).length > 2) {
    await trackSearch(userId, filters, totalItems);
  }

  // Get search suggestions if query provided
  let suggestions: string[] = [];
  if (filters.query && filters.query.length >= 2) {
    suggestions = await getSearchSuggestions(filters.query, 5);
  }

  return {
    items,
    listings,
    auctions,
    reverseAuctions,
    total: totalItems,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    },
    suggestions,
  };
};

/**
 * AI-powered semantic search
 * Uses keyword matching and relevance scoring
 */
export const aiSearch = async (
  query: string,
  limit: number = 20
): Promise<any[]> => {
  // Extract keywords and expand search terms
  const keywords = extractKeywords(query);
  const expandedTerms = expandSearchTerms(keywords);

  // Build advanced search query
  const searchConditions = expandedTerms.flatMap(term => [
    { title: { contains: term, mode: 'insensitive' as const } },
    { description: { contains: term, mode: 'insensitive' as const } },
  ]);

  // Search with expanded terms
  const items = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      OR: searchConditions,
    },
    take: limit,
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
          totalReviews: true,
        },
      },
      category: {
        select: {
          id: true,
          nameEn: true,
          nameAr: true,
          slug: true,
        },
      },
    },
  });

  // Calculate relevance scores
  const scoredItems = items.map(item => {
    const score = calculateRelevanceScore(query, item, keywords);
    return { ...item, relevanceScore: score };
  });

  // Sort by relevance
  scoredItems.sort((a, b) => b.relevanceScore - a.relevanceScore);

  return scoredItems;
};

// ============================================
// Search History
// ============================================

/**
 * Track search query
 */
export const trackSearch = async (
  userId: string | undefined,
  filters: SearchFilters,
  resultsCount: number
): Promise<void> => {
  try {
    // Save to search history
    await prisma.searchHistory.create({
      data: {
        userId,
        query: filters.query || '',
        filters: filters as any,
        resultsCount,
        category: filters.categoryId,
        location: filters.location,
      },
    });

    // Update popular searches
    if (filters.query && filters.query.length >= 3) {
      await updatePopularSearch(filters.query);
    }
  } catch (error) {
    // Don't throw - tracking failures shouldn't break search
    console.error('Failed to track search:', error);
  }
};

/**
 * Get user's search history
 */
export const getUserSearchHistory = async (
  userId: string,
  limit: number = 20
): Promise<any[]> => {
  return prisma.searchHistory.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
};

/**
 * Clear user's search history
 */
export const clearSearchHistory = async (userId: string): Promise<void> => {
  await prisma.searchHistory.deleteMany({
    where: { userId },
  });
};

// ============================================
// Popular Searches
// ============================================

/**
 * Update popular search count
 */
export const updatePopularSearch = async (query: string): Promise<void> => {
  const normalized = query.toLowerCase().trim();

  const existing = await prisma.popularSearch.findUnique({
    where: { query: normalized },
  });

  if (existing) {
    // Update count and calculate trend
    const hoursSinceLastSearch =
      (Date.now() - existing.lastSearchedAt.getTime()) / (1000 * 60 * 60);
    const trendScore = existing.searchCount / Math.max(hoursSinceLastSearch, 1);

    await prisma.popularSearch.update({
      where: { id: existing.id },
      data: {
        searchCount: { increment: 1 },
        trend: trendScore,
        lastSearchedAt: new Date(),
      },
    });
  } else {
    // Create new popular search
    await prisma.popularSearch.create({
      data: {
        query: normalized,
        searchCount: 1,
        trend: 1,
        lastSearchedAt: new Date(),
      },
    });
  }
};

/**
 * Get popular searches
 */
export const getPopularSearches = async (limit: number = 10): Promise<any[]> => {
  return prisma.popularSearch.findMany({
    orderBy: [
      { trend: 'desc' },
      { searchCount: 'desc' },
    ],
    take: limit,
  });
};

/**
 * Get trending searches (popular in last 24 hours)
 */
export const getTrendingSearches = async (limit: number = 10): Promise<any[]> => {
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return prisma.popularSearch.findMany({
    where: {
      lastSearchedAt: { gte: yesterday },
    },
    orderBy: { trend: 'desc' },
    take: limit,
  });
};

// ============================================
// Saved Searches
// ============================================

/**
 * Save a search
 */
export const saveSearch = async (
  userId: string,
  input: SavedSearchInput
): Promise<any> => {
  return prisma.savedSearch.create({
    data: {
      userId,
      name: input.name,
      query: input.query,
      filters: input.filters as any,
      notifyOnNew: input.notifyOnNew || false,
    },
  });
};

/**
 * Get user's saved searches
 */
export const getSavedSearches = async (userId: string): Promise<any[]> => {
  return prisma.savedSearch.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Get saved search by ID
 */
export const getSavedSearchById = async (
  id: string,
  userId: string
): Promise<any> => {
  const savedSearch = await prisma.savedSearch.findUnique({
    where: { id },
  });

  if (!savedSearch) {
    throw new NotFoundError('Saved search not found');
  }

  if (savedSearch.userId !== userId) {
    throw new BadRequestError('Not authorized to access this saved search');
  }

  return savedSearch;
};

/**
 * Update saved search
 */
export const updateSavedSearch = async (
  id: string,
  userId: string,
  input: Partial<SavedSearchInput>
): Promise<any> => {
  await getSavedSearchById(id, userId); // Check ownership

  return prisma.savedSearch.update({
    where: { id },
    data: {
      ...(input.name && { name: input.name }),
      ...(input.query !== undefined && { query: input.query }),
      ...(input.filters && { filters: input.filters as any }),
      ...(input.notifyOnNew !== undefined && { notifyOnNew: input.notifyOnNew }),
      lastUsedAt: new Date(),
    },
  });
};

/**
 * Delete saved search
 */
export const deleteSavedSearch = async (
  id: string,
  userId: string
): Promise<void> => {
  await getSavedSearchById(id, userId); // Check ownership

  await prisma.savedSearch.delete({
    where: { id },
  });
};

/**
 * Execute saved search
 */
export const executeSavedSearch = async (
  id: string,
  userId: string
): Promise<SearchResult> => {
  const savedSearch = await getSavedSearchById(id, userId);

  // Update last used timestamp
  await prisma.savedSearch.update({
    where: { id },
    data: { lastUsedAt: new Date() },
  });

  // Execute the search
  return search(savedSearch.filters as SearchFilters, userId);
};

// ============================================
// Search Suggestions
// ============================================

/**
 * Get search suggestions based on query
 */
export const getSearchSuggestions = async (
  query: string,
  limit: number = 10
): Promise<string[]> => {
  const suggestions = await prisma.searchSuggestion.findMany({
    where: {
      isActive: true,
      OR: [
        { keyword: { contains: query, mode: 'insensitive' } },
        { displayText: { contains: query, mode: 'insensitive' } },
      ],
    },
    orderBy: [
      { priority: 'desc' },
      { clickCount: 'desc' },
    ],
    take: limit,
  });

  // Also get suggestions from popular searches
  const popularSuggestions = await prisma.popularSearch.findMany({
    where: {
      query: { contains: query, mode: 'insensitive' },
    },
    orderBy: { searchCount: 'desc' },
    take: 5,
  });

  const allSuggestions = [
    ...suggestions.map(s => s.displayText),
    ...popularSuggestions.map(s => s.query),
  ];

  // Remove duplicates and return
  return [...new Set(allSuggestions)].slice(0, limit);
};

/**
 * Track suggestion click
 */
export const trackSuggestionClick = async (keyword: string): Promise<void> => {
  await prisma.searchSuggestion.updateMany({
    where: { keyword },
    data: { clickCount: { increment: 1 } },
  });
};

/**
 * Create search suggestion (Admin)
 */
export const createSuggestion = async (
  keyword: string,
  displayText: string,
  category?: string,
  priority: number = 0
): Promise<any> => {
  return prisma.searchSuggestion.create({
    data: {
      keyword: keyword.toLowerCase(),
      displayText,
      category,
      priority,
    },
  });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Extract keywords from query
 */
function extractKeywords(query: string): string[] {
  // Remove common stop words
  const stopWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for'];

  const words = query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));

  return [...new Set(words)];
}

/**
 * Expand search terms with synonyms
 */
function expandSearchTerms(keywords: string[]): string[] {
  const synonyms: Record<string, string[]> = {
    phone: ['mobile', 'smartphone', 'cell'],
    laptop: ['notebook', 'computer', 'pc'],
    car: ['vehicle', 'automobile', 'auto'],
    bike: ['bicycle', 'cycle'],
    watch: ['timepiece', 'clock'],
    // Add more synonyms as needed
  };

  const expanded = [...keywords];

  keywords.forEach(keyword => {
    if (synonyms[keyword]) {
      expanded.push(...synonyms[keyword]);
    }
  });

  return [...new Set(expanded)];
}

/**
 * Calculate relevance score for an item
 */
function calculateRelevanceScore(
  query: string,
  item: any,
  keywords: string[]
): number {
  let score = 0;
  const queryLower = query.toLowerCase();
  const titleLower = item.title.toLowerCase();
  const descLower = item.description.toLowerCase();

  // Exact match in title (highest score)
  if (titleLower.includes(queryLower)) {
    score += 100;
  }

  // Exact match in description
  if (descLower.includes(queryLower)) {
    score += 50;
  }

  // Keyword matches
  keywords.forEach(keyword => {
    if (titleLower.includes(keyword)) {
      score += 20;
    }
    if (descLower.includes(keyword)) {
      score += 10;
    }
  });

  // Boost for verified sellers
  if (item.seller?.emailVerified) {
    score += 10;
  }

  // Boost for highly rated sellers
  if (item.seller?.rating >= 4.5) {
    score += 15;
  }

  // Boost for newer items
  const daysOld = (Date.now() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (daysOld < 7) {
    score += 10;
  }

  // Boost for popular items (views)
  score += Math.min(item.views / 10, 20);

  return score;
}

/**
 * Search in multiple categories simultaneously
 */
export const multiCategorySearch = async (
  categoryIds: string[],
  filters: Omit<SearchFilters, 'categoryId'>,
  userId?: string
): Promise<SearchResult> => {
  const results = await Promise.all(
    categoryIds.map(categoryId =>
      search({ ...filters, categoryId }, userId)
    )
  );

  // Merge results
  const mergedItems = results.flatMap(r => r.items);
  const mergedListings = results.flatMap(r => r.listings);
  const totalResults = results.reduce((sum, r) => sum + r.total, 0);

  return {
    items: mergedItems.slice(0, filters.limit || 20),
    listings: mergedListings.slice(0, 10),
    auctions: [],
    reverseAuctions: [],
    total: totalResults,
    pagination: {
      page: filters.page || 1,
      limit: filters.limit || 20,
      totalPages: Math.ceil(totalResults / (filters.limit || 20)),
    },
  };
};

/**
 * Get autocomplete suggestions
 */
export const getAutocomplete = async (
  query: string,
  limit: number = 10
): Promise<{
  suggestions: string[];
  items: any[];
  categories: any[];
}> => {
  if (query.length < 2) {
    return { suggestions: [], items: [], categories: [] };
  }

  const [suggestions, items, categories] = await Promise.all([
    getSearchSuggestions(query, limit),

    // Quick item search
    prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 5,
      select: {
        id: true,
        title: true,
        images: true,
        estimatedValue: true,
      },
    }),

    // Category suggestions
    prisma.category.findMany({
      where: {
        isActive: true,
        OR: [
          { nameEn: { contains: query, mode: 'insensitive' } },
          { nameAr: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 3,
      select: {
        id: true,
        nameEn: true,
        nameAr: true,
        slug: true,
        icon: true,
      },
    }),
  ]);

  return { suggestions, items, categories };
};
