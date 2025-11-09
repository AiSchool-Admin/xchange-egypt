/**
 * Search Controller
 *
 * HTTP request handlers for search operations
 */

import { Request, Response, NextFunction } from 'express';
import * as searchService from '../services/search.service';
import { successResponse } from '../utils/response';

// ============================================
// Main Search Controllers
// ============================================

/**
 * Advanced search with comprehensive filtering
 * GET /api/v1/search
 */
export const search = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user?.id;
    const result = await searchService.search(req.query, userId);

    res.json(
      successResponse(result, 'Search completed successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * AI-powered semantic search
 * GET /api/v1/search/ai
 */
export const aiSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { query, limit } = req.query;
    const results = await searchService.aiSearch(query as string, Number(limit) || 20);

    res.json(
      successResponse(results, 'AI search completed successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get autocomplete suggestions
 * GET /api/v1/search/autocomplete
 */
export const autocomplete = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { query, limit } = req.query;
    const result = await searchService.getAutocomplete(
      query as string,
      Number(limit) || 10
    );

    res.json(
      successResponse(result, 'Autocomplete suggestions retrieved')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Multi-category search
 * GET /api/v1/search/multi-category
 */
export const multiCategorySearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { categoryIds, ...filters } = req.query;
    const userId = req.user?.id;

    const result = await searchService.multiCategorySearch(
      categoryIds as string[],
      filters,
      userId
    );

    res.json(
      successResponse(result, 'Multi-category search completed')
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// Search History Controllers
// ============================================

/**
 * Get user's search history
 * GET /api/v1/search/history
 */
export const getSearchHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const limit = Number(req.query.limit) || 20;

    const history = await searchService.getUserSearchHistory(userId, limit);

    res.json(
      successResponse(history, 'Search history retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Clear user's search history
 * DELETE /api/v1/search/history
 */
export const clearSearchHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    await searchService.clearSearchHistory(userId);

    res.json(
      successResponse(null, 'Search history cleared successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// Popular Searches Controllers
// ============================================

/**
 * Get popular searches
 * GET /api/v1/search/popular
 */
export const getPopularSearches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 10;
    const searches = await searchService.getPopularSearches(limit);

    res.json(
      successResponse(searches, 'Popular searches retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get trending searches
 * GET /api/v1/search/trending
 */
export const getTrendingSearches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const limit = Number(req.query.limit) || 10;
    const searches = await searchService.getTrendingSearches(limit);

    res.json(
      successResponse(searches, 'Trending searches retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// Saved Searches Controllers
// ============================================

/**
 * Save a search
 * POST /api/v1/search/saved
 */
export const saveSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const savedSearch = await searchService.saveSearch(userId, req.body);

    res.status(201).json(
      successResponse(savedSearch, 'Search saved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's saved searches
 * GET /api/v1/search/saved
 */
export const getSavedSearches = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const searches = await searchService.getSavedSearches(userId);

    res.json(
      successResponse(searches, 'Saved searches retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get saved search by ID
 * GET /api/v1/search/saved/:id
 */
export const getSavedSearchById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const savedSearch = await searchService.getSavedSearchById(
      req.params.id,
      userId
    );

    res.json(
      successResponse(savedSearch, 'Saved search retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update saved search
 * PATCH /api/v1/search/saved/:id
 */
export const updateSavedSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const updated = await searchService.updateSavedSearch(
      req.params.id,
      userId,
      req.body
    );

    res.json(
      successResponse(updated, 'Saved search updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete saved search
 * DELETE /api/v1/search/saved/:id
 */
export const deleteSavedSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    await searchService.deleteSavedSearch(req.params.id, userId);

    res.json(
      successResponse(null, 'Saved search deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Execute saved search
 * GET /api/v1/search/saved/:id/execute
 */
export const executeSavedSearch = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const result = await searchService.executeSavedSearch(req.params.id, userId);

    res.json(
      successResponse(result, 'Saved search executed successfully')
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// Search Suggestions Controllers
// ============================================

/**
 * Get search suggestions
 * GET /api/v1/search/suggestions
 */
export const getSearchSuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { query, limit } = req.query;
    const suggestions = await searchService.getSearchSuggestions(
      query as string,
      Number(limit) || 10
    );

    res.json(
      successResponse(suggestions, 'Suggestions retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Track suggestion click
 * POST /api/v1/search/suggestions/click
 */
export const trackSuggestionClick = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    await searchService.trackSuggestionClick(req.body.keyword);

    res.json(
      successResponse(null, 'Click tracked successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Create search suggestion (Admin)
 * POST /api/v1/search/suggestions
 */
export const createSuggestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { keyword, displayText, category, priority } = req.body;
    const suggestion = await searchService.createSuggestion(
      keyword,
      displayText,
      category,
      priority
    );

    res.status(201).json(
      successResponse(suggestion, 'Suggestion created successfully')
    );
  } catch (error) {
    next(error);
  }
};
