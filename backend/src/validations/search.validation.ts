/**
 * Search Validation Schemas
 *
 * Zod validation schemas for search-related requests
 */

import { z } from 'zod';

// ============================================
// Search Schemas
// ============================================

/**
 * Schema for advanced search
 */
export const searchSchema = z.object({
  query: z.object({
    // Text search
    query: z.string().min(1).max(200).optional(),

    // Category
    categoryId: z.string().min(1).optional(),
    categorySlug: z.string().optional(),

    // Price range
    minPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
    maxPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),

    // Item condition
    condition: z.union([
      z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']),
      z.string().transform(s => s.split(',')),
    ]).optional(),

    // Item status
    status: z.union([
      z.enum(['ACTIVE', 'SOLD', 'TRADED']),
      z.string().transform(s => s.split(',')),
    ]).optional(),

    // Location
    location: z.string().optional(),
    governorate: z.string().optional(),
    latitude: z.string().transform(Number).pipe(z.number()).optional(),
    longitude: z.string().transform(Number).pipe(z.number()).optional(),
    radius: z.string().transform(Number).pipe(z.number().positive()).optional(),

    // User filters
    sellerId: z.string().min(1).optional(),
    userType: z.enum(['INDIVIDUAL', 'BUSINESS']).optional(),
    minRating: z.string().transform(Number).pipe(z.number().min(0).max(5)).optional(),

    // Listing type
    listingType: z.union([
      z.enum(['DIRECT_SALE', 'AUCTION', 'REVERSE_AUCTION', 'BARTER']),
      z.string().transform(s => s.split(',')),
    ]).optional(),

    // Auction filters
    activeAuctions: z.string().transform(v => v === 'true').optional(),
    endingSoon: z.string().transform(v => v === 'true').optional(),

    // Reverse auction filters
    activeReverseAuctions: z.string().transform(v => v === 'true').optional(),

    // Date filters
    createdAfter: z.string().transform(s => new Date(s)).optional(),
    createdBefore: z.string().transform(s => new Date(s)).optional(),

    // Verification
    verifiedSellers: z.string().transform(v => v === 'true').optional(),

    // Pagination
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),

    // Sorting
    sortBy: z.enum([
      'relevance',
      'price_low',
      'price_high',
      'newest',
      'oldest',
      'popular',
      'rating',
    ]).optional(),
  }),
});

/**
 * Schema for AI-powered search
 */
export const aiSearchSchema = z.object({
  query: z.object({
    query: z.string().min(3, 'Query must be at least 3 characters').max(200),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
  }),
});

/**
 * Schema for autocomplete
 */
export const autocompleteSchema = z.object({
  query: z.object({
    query: z.string().min(2, 'Query must be at least 2 characters').max(100),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(20)).optional(),
  }),
});

// ============================================
// Search History Schemas
// ============================================

/**
 * Schema for getting search history
 */
export const getSearchHistorySchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
});

// ============================================
// Popular Searches Schemas
// ============================================

/**
 * Schema for getting popular searches
 */
export const getPopularSearchesSchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
  }),
});

/**
 * Schema for getting trending searches
 */
export const getTrendingSearchesSchema = z.object({
  query: z.object({
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(50)).optional(),
  }),
});

// ============================================
// Saved Searches Schemas
// ============================================

/**
 * Schema for saving a search
 */
export const saveSearchSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
    query: z.string().max(200).optional(),
    filters: z.record(z.any()),
    notifyOnNew: z.boolean().optional(),
  }),
});

/**
 * Schema for getting saved search by ID
 */
export const getSavedSearchByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Saved search ID is required'),
  }),
});

/**
 * Schema for updating saved search
 */
export const updateSavedSearchSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Saved search ID is required'),
  }),
  body: z.object({
    name: z.string().min(1).max(100).optional(),
    query: z.string().max(200).optional(),
    filters: z.record(z.any()).optional(),
    notifyOnNew: z.boolean().optional(),
  }),
});

/**
 * Schema for deleting saved search
 */
export const deleteSavedSearchSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Saved search ID is required'),
  }),
});

/**
 * Schema for executing saved search
 */
export const executeSavedSearchSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Saved search ID is required'),
  }),
});

// ============================================
// Search Suggestions Schemas
// ============================================

/**
 * Schema for getting search suggestions
 */
export const getSearchSuggestionsSchema = z.object({
  query: z.object({
    query: z.string().min(2, 'Query must be at least 2 characters').max(100),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(20)).optional(),
  }),
});

/**
 * Schema for tracking suggestion click
 */
export const trackSuggestionClickSchema = z.object({
  body: z.object({
    keyword: z.string().min(1, 'Keyword is required'),
  }),
});

/**
 * Schema for creating suggestion (Admin)
 */
export const createSuggestionSchema = z.object({
  body: z.object({
    keyword: z.string().min(1, 'Keyword is required').max(100),
    displayText: z.string().min(1, 'Display text is required').max(200),
    category: z.string().max(100).optional(),
    priority: z.number().int().min(0).max(100).optional(),
  }),
});

// ============================================
// Multi-Category Search Schema
// ============================================

/**
 * Schema for multi-category search
 */
export const multiCategorySearchSchema = z.object({
  query: z.object({
    categoryIds: z.string().transform(s => s.split(',')),
    query: z.string().optional(),
    minPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
    maxPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
    condition: z.string().optional(),
    location: z.string().optional(),
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
    sortBy: z.enum([
      'relevance',
      'price_low',
      'price_high',
      'newest',
      'oldest',
      'popular',
      'rating',
    ]).optional(),
  }),
});
