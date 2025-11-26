/**
 * AI Features Routes
 * FREE AI services for the Egyptian market
 */

import { Router } from 'express';
import * as aiController from '../controllers/ai.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// ============================================
// AUTO-CATEGORIZATION ENDPOINTS
// ============================================

/**
 * @route   POST /api/v1/ai/categorize
 * @desc    Automatically categorize an item
 * @access  Public
 */
router.post('/categorize', aiController.categorizeItem);

/**
 * @route   POST /api/v1/ai/categorize/batch
 * @desc    Batch categorize multiple items
 * @access  Public
 */
router.post('/categorize/batch', aiController.categorizeItems);

/**
 * @route   GET /api/v1/ai/categorize/suggestions
 * @desc    Get category suggestions for partial input
 * @access  Public
 */
router.get('/categorize/suggestions', aiController.getCategorySuggestions);

// ============================================
// PRICE ESTIMATION ENDPOINTS
// ============================================

/**
 * @route   POST /api/v1/ai/estimate-price
 * @desc    Estimate price for an item
 * @access  Public
 */
router.post('/estimate-price', aiController.estimatePrice);

/**
 * @route   GET /api/v1/ai/price-trends/:categoryId
 * @desc    Get price trends for a category
 * @access  Public
 */
router.get('/price-trends/:categoryId', aiController.getPriceTrends);

/**
 * @route   POST /api/v1/ai/validate-price
 * @desc    Validate if price is reasonable
 * @access  Public
 */
router.post('/validate-price', aiController.validatePrice);

// ============================================
// FRAUD DETECTION ENDPOINTS
// ============================================

/**
 * @route   POST /api/v1/ai/check-listing
 * @desc    Check listing for fraud indicators
 * @access  Private (authenticated users) or Admin
 */
router.post('/check-listing', optionalAuth, aiController.checkListing);

/**
 * @route   GET /api/v1/ai/check-user/:userId
 * @desc    Check user behavior for suspicious patterns
 * @access  Private (Admin only - add requireAdmin middleware)
 */
router.get('/check-user/:userId', authenticate, aiController.checkUserBehavior);

/**
 * @route   POST /api/v1/ai/check-transaction
 * @desc    Check transaction for fraud
 * @access  Private
 */
router.post('/check-transaction', authenticate, aiController.checkTransaction);

// ============================================
// SMART SEARCH ENDPOINTS
// ============================================

/**
 * @route   GET /api/v1/ai/search-terms
 * @desc    Build smart search terms with Arabic support
 * @access  Public
 */
router.get('/search-terms', aiController.getSearchTerms);

// ============================================
// STATUS & INFO
// ============================================

/**
 * @route   GET /api/v1/ai/status
 * @desc    Get AI features status and statistics
 * @access  Public
 */
router.get('/status', aiController.getAiStatus);

// ============================================
// BARTER RANKING ENDPOINTS
// ============================================

/**
 * @route   POST /api/v1/ai/rank-barter-cycle
 * @desc    Rank a barter cycle intelligently
 * @access  Private
 */
router.post('/rank-barter-cycle', authenticate, aiController.rankBarterCycle);

/**
 * @route   POST /api/v1/ai/rank-barter-cycles
 * @desc    Rank multiple barter cycles
 * @access  Private
 */
router.post('/rank-barter-cycles', authenticate, aiController.rankMultipleBarterCycles);

/**
 * @route   GET /api/v1/ai/barter-recommendations/:userId
 * @desc    Get personalized barter recommendations
 * @access  Private
 */
router.get('/barter-recommendations/:userId', authenticate, aiController.getBarterRecommendations);

export default router;
