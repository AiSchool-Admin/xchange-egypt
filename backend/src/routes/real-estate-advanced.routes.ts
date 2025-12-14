/**
 * @fileoverview مسارات الخدمات المتقدمة لسوق العقارات
 * @description API routes للتسعير والمقايضة والتوصيات
 * @author Xchange Real Estate
 * @version 1.0.0
 */

import { Router } from 'express';
import {
  estimateValue,
  updateMarketPrices,
  getMarketPrices,
  findBarterMatches,
  findDirectBarterMatches,
  validateBarterChain,
  saveBarterChain,
  getBarterStats,
  getUserRecommendations,
  getSimilarProperties,
  getTrendingRecommendations,
  refreshRecommendations,
  recordInteraction,
} from '../controllers/real-estate-advanced.controller';
import { authenticate, optionalAuth } from '../middleware/auth';
import { isAdmin } from '../middleware/admin';

const router = Router();

// ============================================
// التسعير العقاري (AVM)
// ============================================

/**
 * @route   POST /api/real-estate/advanced/estimate-value
 * @desc    تقدير قيمة العقار
 * @access  Public
 * @body    {
 *            propertyType: string,
 *            totalArea: number,
 *            governorate: string,
 *            city?: string,
 *            area?: string,
 *            district?: string,
 *            compoundName?: string,
 *            bedrooms?: number,
 *            bathrooms?: number,
 *            floor?: number,
 *            buildingAge?: number,
 *            condition: 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR',
 *            furnishingType?: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED',
 *            features?: string[],
 *            latitude?: number,
 *            longitude?: number,
 *            finishingLevel?: string
 *          }
 */
router.post('/estimate-value', estimateValue);

/**
 * @route   GET /api/real-estate/advanced/market-prices
 * @desc    الحصول على متوسط الأسعار حسب المنطقة
 * @access  Public
 * @query   governorate?, city?, propertyType?
 */
router.get('/market-prices', getMarketPrices);

/**
 * @route   POST /api/real-estate/advanced/admin/update-prices
 * @desc    تحديث أسعار السوق (Admin only)
 * @access  Admin
 */
router.post('/admin/update-prices', authenticate, isAdmin, updateMarketPrices);

// ============================================
// نظام المقايضة متعدد الأطراف
// ============================================

/**
 * @route   GET /api/real-estate/advanced/barter/matches
 * @desc    البحث عن سلاسل المقايضة
 * @access  Private
 * @query   maxChainLength?, minFairnessScore?, maxCashFlowPercent?, prioritizeSimplicity?, limit?
 */
router.get('/barter/matches', authenticate, findBarterMatches);

/**
 * @route   GET /api/real-estate/advanced/barter/:offerId/direct-matches
 * @desc    البحث عن مطابقات مباشرة لعرض معين
 * @access  Private
 */
router.get('/barter/:offerId/direct-matches', authenticate, findDirectBarterMatches);

/**
 * @route   POST /api/real-estate/advanced/barter/validate-chain
 * @desc    التحقق من صحة سلسلة مقايضة
 * @access  Private
 * @body    { chain: BarterChain }
 */
router.post('/barter/validate-chain', authenticate, validateBarterChain);

/**
 * @route   POST /api/real-estate/advanced/barter/save-chain
 * @desc    حفظ سلسلة مقايضة
 * @access  Private
 * @body    { chain: BarterChain }
 */
router.post('/barter/save-chain', authenticate, saveBarterChain);

/**
 * @route   GET /api/real-estate/advanced/barter/stats
 * @desc    الحصول على إحصائيات المقايضة
 * @access  Private
 */
router.get('/barter/stats', authenticate, getBarterStats);

// ============================================
// محرك التوصيات الذكي
// ============================================

/**
 * @route   GET /api/real-estate/advanced/recommendations
 * @desc    الحصول على التوصيات للمستخدم
 * @access  Private
 * @query   limit?, includeViewed?, includeFavorites?, diversityRatio?
 */
router.get('/recommendations', authenticate, getUserRecommendations);

/**
 * @route   GET /api/real-estate/advanced/recommendations/trending
 * @desc    الحصول على توصيات للمستخدمين الجدد
 * @access  Public
 * @query   governorate?, limit?
 */
router.get('/recommendations/trending', getTrendingRecommendations);

/**
 * @route   GET /api/real-estate/advanced/:propertyId/similar
 * @desc    الحصول على عقارات مشابهة
 * @access  Public
 * @params  propertyId
 * @query   limit?
 */
router.get('/:propertyId/similar', optionalAuth, getSimilarProperties);

/**
 * @route   POST /api/real-estate/advanced/recommendations/refresh
 * @desc    إبطال التخزين المؤقت للتوصيات
 * @access  Private
 */
router.post('/recommendations/refresh', authenticate, refreshRecommendations);

/**
 * @route   POST /api/real-estate/advanced/recommendations/interaction
 * @desc    تسجيل تفاعل المستخدم (لتحسين التوصيات)
 * @access  Private
 * @body    { propertyId: string, interactionType: string, duration?: number }
 */
router.post('/recommendations/interaction', authenticate, recordInteraction);

export default router;
