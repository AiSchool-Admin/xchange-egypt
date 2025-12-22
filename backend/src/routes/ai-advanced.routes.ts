/**
 * Advanced AI Features Routes
 * خدمات الذكاء الاصطناعي المتقدمة
 *
 * Routes for:
 * - Psychological Pricing AI
 * - Seller Intelligence Dashboard
 * - Visual Authenticity AI
 */

import { Router } from 'express';
import * as advancedAiController from '../controllers/ai-advanced.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// ============================================
// PSYCHOLOGICAL PRICING AI ENDPOINTS
// ============================================

/**
 * @route   POST /api/v1/ai-advanced/pricing/psychological
 * @desc    Generate psychologically optimized prices
 * @access  Public
 */
router.post('/pricing/psychological', advancedAiController.generatePsychologicalPrices);

/**
 * @route   POST /api/v1/ai-advanced/pricing/quick
 * @desc    Get quick psychological price suggestion
 * @access  Public
 */
router.post('/pricing/quick', advancedAiController.getQuickPsychologicalPrice);

/**
 * @route   GET /api/v1/ai-advanced/pricing/analysis/:categoryId
 * @desc    Get pricing psychology analysis for a category
 * @access  Public
 */
router.get('/pricing/analysis/:categoryId', advancedAiController.getPricingAnalysis);

// ============================================
// SELLER INTELLIGENCE DASHBOARD ENDPOINTS
// ============================================

/**
 * @route   GET /api/v1/ai-advanced/seller/dashboard
 * @desc    Get comprehensive seller dashboard
 * @access  Private
 */
router.get('/seller/dashboard', authenticate, advancedAiController.getSellerDashboard);

/**
 * @route   GET /api/v1/ai-advanced/seller/quick-stats
 * @desc    Get quick seller statistics
 * @access  Private
 */
router.get('/seller/quick-stats', authenticate, advancedAiController.getQuickSellerStats);

/**
 * @route   GET /api/v1/ai-advanced/seller/performance
 * @desc    Get sales performance data
 * @access  Private
 */
router.get('/seller/performance', authenticate, advancedAiController.getSalesPerformance);

/**
 * @route   GET /api/v1/ai-advanced/seller/inventory-health
 * @desc    Get inventory health metrics
 * @access  Private
 */
router.get('/seller/inventory-health', authenticate, advancedAiController.getInventoryHealth);

/**
 * @route   GET /api/v1/ai-advanced/seller/buyer-insights
 * @desc    Get buyer behavior insights
 * @access  Private
 */
router.get('/seller/buyer-insights', authenticate, advancedAiController.getBuyerInsights);

/**
 * @route   GET /api/v1/ai-advanced/seller/competition
 * @desc    Get competition analysis
 * @access  Private
 */
router.get('/seller/competition', authenticate, advancedAiController.getCompetitionAnalysis);

/**
 * @route   GET /api/v1/ai-advanced/seller/recommendations
 * @desc    Get personalized seller recommendations
 * @access  Private
 */
router.get('/seller/recommendations', authenticate, advancedAiController.getSellerRecommendations);

/**
 * @route   GET /api/v1/ai-advanced/seller/forecast
 * @desc    Get revenue forecast
 * @access  Private
 */
router.get('/seller/forecast', authenticate, advancedAiController.getRevenueForecast);

// ============================================
// VISUAL AUTHENTICITY AI ENDPOINTS
// ============================================

/**
 * @route   POST /api/v1/ai-advanced/authenticity/analyze
 * @desc    Perform comprehensive authenticity analysis
 * @access  Private
 */
router.post('/authenticity/analyze', optionalAuth, advancedAiController.analyzeAuthenticity);

/**
 * @route   POST /api/v1/ai-advanced/authenticity/quick-check
 * @desc    Perform quick authenticity check
 * @access  Public
 */
router.post('/authenticity/quick-check', advancedAiController.quickAuthenticityCheck);

/**
 * @route   GET /api/v1/ai-advanced/authenticity/report/:itemId
 * @desc    Get authenticity report for an item
 * @access  Private
 */
router.get('/authenticity/report/:itemId', optionalAuth, advancedAiController.getAuthenticityReport);

/**
 * @route   POST /api/v1/ai-advanced/authenticity/brand-verify
 * @desc    Verify brand authenticity
 * @access  Public
 */
router.post('/authenticity/brand-verify', advancedAiController.verifyBrand);

// ============================================
// COMBINED AI INSIGHTS
// ============================================

/**
 * @route   GET /api/v1/ai-advanced/insights/:itemId
 * @desc    Get all AI insights for an item (pricing, authenticity, etc.)
 * @access  Private
 */
router.get('/insights/:itemId', authenticate, advancedAiController.getItemInsights);

/**
 * @route   GET /api/v1/ai-advanced/status
 * @desc    Get advanced AI features status
 * @access  Public
 */
router.get('/status', advancedAiController.getAdvancedAiStatus);

export default router;
