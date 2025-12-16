/**
 * Markets Routes - نقاط API الموحدة للأسواق
 *
 * Unified API endpoints for cross-market operations:
 * - Universal search
 * - Market statistics
 * - Trending items
 * - Recommendations
 */

import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as crossMarketService from '../services/cross-market.service';
import { successResponse } from '../utils/response';

const router = Router();

// ============================================
// Public Routes
// ============================================

/**
 * Universal search across all markets
 * GET /api/v1/markets/search
 */
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      q,
      query,
      markets,
      priceMin,
      priceMax,
      governorate,
      condition,
      sortBy,
      page,
      limit,
    } = req.query;

    const searchQuery = (q || query) as string;

    if (!searchQuery || searchQuery.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Search query must be at least 2 characters',
        messageAr: 'يجب أن يكون البحث على الأقل حرفين',
      });
    }

    const results = await crossMarketService.universalSearch({
      query: searchQuery,
      markets: markets ? (markets as string).split(',') as crossMarketService.MarketType[] : undefined,
      priceMin: priceMin ? parseFloat(priceMin as string) : undefined,
      priceMax: priceMax ? parseFloat(priceMax as string) : undefined,
      governorate: governorate as string,
      condition: condition as string,
      sortBy: sortBy as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    return successResponse(res, results, 'نتائج البحث');
  } catch (error) {
    next(error);
  }
});

/**
 * Get statistics for all markets
 * GET /api/v1/markets/statistics
 */
router.get('/statistics', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = await crossMarketService.getMarketStatistics();
    return successResponse(res, stats, 'إحصائيات الأسواق');
  } catch (error) {
    next(error);
  }
});

/**
 * Get trending items across all markets
 * GET /api/v1/markets/trending
 */
router.get('/trending', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit } = req.query;
    const trending = await crossMarketService.getTrendingItems(
      limit ? parseInt(limit as string, 10) : 10
    );
    return successResponse(res, trending, 'المنتجات الرائجة');
  } catch (error) {
    next(error);
  }
});

/**
 * Get all available markets with metadata
 * GET /api/v1/markets
 */
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const markets = [
      { id: 'GENERAL', nameAr: 'السوق العام', icon: '🛒', url: '/items', color: '#3B82F6' },
      { id: 'CARS', nameAr: 'السيارات', icon: '🚗', url: '/cars', color: '#10B981' },
      { id: 'PROPERTIES', nameAr: 'العقارات', icon: '🏠', url: '/properties', color: '#8B5CF6' },
      { id: 'MOBILES', nameAr: 'الموبايلات', icon: '📱', url: '/mobiles', color: '#F59E0B' },
      { id: 'AUCTIONS', nameAr: 'المزادات', icon: '🔨', url: '/auctions', color: '#EF4444' },
      { id: 'TENDERS', nameAr: 'المناقصات', icon: '📋', url: '/reverse-auctions', color: '#6366F1' },
      { id: 'BARTER', nameAr: 'المقايضة', icon: '🔄', url: '/pools', color: '#14B8A6' },
      { id: 'GOLD', nameAr: 'الذهب', icon: '🥇', url: '/gold', color: '#F59E0B' },
      { id: 'SILVER', nameAr: 'الفضة', icon: '🥈', url: '/silver', color: '#9CA3AF' },
      { id: 'LUXURY', nameAr: 'الرفاهية', icon: '💎', url: '/luxury', color: '#8B5CF6' },
      { id: 'SCRAP', nameAr: 'الخردة', icon: '♻️', url: '/scrap', color: '#22C55E' },
    ];

    return successResponse(res, markets, 'قائمة الأسواق');
  } catch (error) {
    next(error);
  }
});

// ============================================
// Protected Routes (Require Authentication)
// ============================================

/**
 * Get personalized recommendations
 * GET /api/v1/markets/recommendations
 */
router.get('/recommendations', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const { limit } = req.query;

    const recommendations = await crossMarketService.getRecommendations(
      userId,
      limit ? parseInt(limit as string, 10) : 10
    );

    return successResponse(res, recommendations, 'توصيات مخصصة');
  } catch (error) {
    next(error);
  }
});

export default router;
