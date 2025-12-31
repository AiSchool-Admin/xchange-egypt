/**
 * Search Routes
 *
 * All routes for the advanced search system
 */

import { Router } from 'express';
import * as searchController from '../controllers/search.controller';
import { authenticate, optionalAuth, isAdmin } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  searchSchema,
  aiSearchSchema,
  autocompleteSchema,
  getSearchHistorySchema,
  getPopularSearchesSchema,
  getTrendingSearchesSchema,
  saveSearchSchema,
  getSavedSearchByIdSchema,
  updateSavedSearchSchema,
  deleteSavedSearchSchema,
  executeSavedSearchSchema,
  getSearchSuggestionsSchema,
  trackSuggestionClickSchema,
  createSuggestionSchema,
  multiCategorySearchSchema,
} from '../validations/search.validation';

const router = Router();

// ============================================
// Main Search Routes
// ============================================

/**
 * Advanced search with comprehensive filtering
 * GET /api/v1/search
 * Query params: See SearchFilters type
 */
router.get(
  '/',
  optionalAuth,
  validate(searchSchema),
  searchController.search
);

/**
 * AI-powered semantic search
 * GET /api/v1/search/ai
 * Query params: query (required), limit (optional)
 */
router.get(
  '/ai',
  validate(aiSearchSchema),
  searchController.aiSearch
);

/**
 * Get autocomplete suggestions
 * GET /api/v1/search/autocomplete
 * Query params: query (required), limit (optional)
 */
router.get(
  '/autocomplete',
  validate(autocompleteSchema),
  searchController.autocomplete
);

/**
 * Multi-category search
 * GET /api/v1/search/multi-category
 * Query params: categoryIds (comma-separated), other filters
 */
router.get(
  '/multi-category',
  optionalAuth,
  validate(multiCategorySearchSchema),
  searchController.multiCategorySearch
);

// ============================================
// Search History Routes
// ============================================

/**
 * Get user's search history
 * GET /api/v1/search/history
 * Query params: limit (optional)
 */
router.get(
  '/history',
  authenticate,
  validate(getSearchHistorySchema),
  searchController.getSearchHistory
);

/**
 * Clear user's search history
 * DELETE /api/v1/search/history
 */
router.delete(
  '/history',
  authenticate,
  searchController.clearSearchHistory
);

// ============================================
// Popular Searches Routes
// ============================================

/**
 * Get popular searches
 * GET /api/v1/search/popular
 * Query params: limit (optional)
 */
router.get(
  '/popular',
  validate(getPopularSearchesSchema),
  searchController.getPopularSearches
);

/**
 * Get trending searches (popular in last 24 hours)
 * GET /api/v1/search/trending
 * Query params: limit (optional)
 */
router.get(
  '/trending',
  validate(getTrendingSearchesSchema),
  searchController.getTrendingSearches
);

// ============================================
// Saved Searches Routes
// ============================================

/**
 * Save a search
 * POST /api/v1/search/saved
 * Body: { name, query?, filters, notifyOnNew? }
 */
router.post(
  '/saved',
  authenticate,
  validate(saveSearchSchema),
  searchController.saveSearch
);

/**
 * Get user's saved searches
 * GET /api/v1/search/saved
 */
router.get(
  '/saved',
  authenticate,
  searchController.getSavedSearches
);

/**
 * Get saved search by ID
 * GET /api/v1/search/saved/:id
 */
router.get(
  '/saved/:id',
  authenticate,
  validate(getSavedSearchByIdSchema),
  searchController.getSavedSearchById
);

/**
 * Update saved search
 * PATCH /api/v1/search/saved/:id
 * Body: { name?, query?, filters?, notifyOnNew? }
 */
router.patch(
  '/saved/:id',
  authenticate,
  validate(updateSavedSearchSchema),
  searchController.updateSavedSearch
);

/**
 * Delete saved search
 * DELETE /api/v1/search/saved/:id
 */
router.delete(
  '/saved/:id',
  authenticate,
  validate(deleteSavedSearchSchema),
  searchController.deleteSavedSearch
);

/**
 * Execute saved search
 * GET /api/v1/search/saved/:id/execute
 */
router.get(
  '/saved/:id/execute',
  authenticate,
  validate(executeSavedSearchSchema),
  searchController.executeSavedSearch
);

// ============================================
// Search Suggestions Routes
// ============================================

/**
 * Get search suggestions
 * GET /api/v1/search/suggestions
 * Query params: query (required), limit (optional)
 */
router.get(
  '/suggestions',
  validate(getSearchSuggestionsSchema),
  searchController.getSearchSuggestions
);

/**
 * Track suggestion click
 * POST /api/v1/search/suggestions/click
 * Body: { keyword }
 */
router.post(
  '/suggestions/click',
  validate(trackSuggestionClickSchema),
  searchController.trackSuggestionClick
);

/**
 * Create search suggestion (Admin only)
 * POST /api/v1/search/suggestions
 * Body: { keyword, displayText, category?, priority? }
 */
router.post(
  '/suggestions',
  authenticate,
  isAdmin,
  validate(createSuggestionSchema),
  searchController.createSuggestion
);

export default router;
