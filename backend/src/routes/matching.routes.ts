/**
 * Matching API Routes
 * واجهة برمجة التطبيقات للمطابقات
 */

import { Router, Request, Response } from 'express';
import { authenticate } from '../middleware/auth';
import {
  getMatchesForItem,
  getMatchesForUser,
  getMatchingStats,
  processNewItem,
} from '../services/unified-matching.service';

const router = Router();

// ============================================
// Public Routes
// ============================================

/**
 * GET /api/v1/matching/stats
 * Get matching service statistics
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const stats = await getMatchingStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    console.error('[MatchingRoutes] Error getting stats:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب الإحصائيات',
      error: error.message,
    });
  }
});

// ============================================
// Authenticated Routes
// ============================================

/**
 * GET /api/v1/matching/items/:itemId
 * Get matches for a specific item
 */
router.get('/items/:itemId', authenticate, async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const minScore = parseFloat(req.query.minScore as string) || 0.3;
    const limit = parseInt(req.query.limit as string) || 20;

    const matches = await getMatchesForItem(itemId, { minScore, limit });

    res.json({
      success: true,
      data: {
        itemId,
        matchCount: matches.length,
        matches: matches.map(m => ({
          id: m.id,
          type: m.type,
          score: Math.round(m.score * 100),
          scoreBreakdown: {
            proximity: Math.round(m.proximityScore * 100),
            category: Math.round(m.categoryScore * 100),
            value: Math.round(m.valueScore * 100),
            keyword: Math.round(m.keywordScore * 100),
          },
          proximityLevel: m.proximityLevel,
          matchedItem: {
            id: m.matchedItem.id,
            title: m.matchedItem.title,
            estimatedValue: m.matchedItem.estimatedValue,
            sellerName: m.matchedItem.sellerName,
            location: m.matchedItem.location,
          },
          matchReason: m.matchReasonAr,
          createdAt: m.createdAt,
        })),
      },
    });
  } catch (error: any) {
    console.error('[MatchingRoutes] Error getting item matches:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب المطابقات',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/matching/my-matches
 * Get matches for all user's items
 */
router.get('/my-matches', authenticate, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const minScore = parseFloat(req.query.minScore as string) || 0.4;
    const limit = parseInt(req.query.limit as string) || 30;

    const result = await getMatchesForUser(userId, { minScore, limit });

    res.json({
      success: true,
      data: {
        totalMatches: result.total,
        itemMatches: result.items.map(m => ({
          id: m.id,
          type: m.type,
          score: Math.round(m.score * 100),
          proximityLevel: m.proximityLevel,
          sourceItem: {
            id: m.sourceItem.id,
            title: m.sourceItem.title,
          },
          matchedItem: {
            id: m.matchedItem.id,
            title: m.matchedItem.title,
            estimatedValue: m.matchedItem.estimatedValue,
            sellerName: m.matchedItem.sellerName,
            location: m.matchedItem.location,
          },
          matchReason: m.matchReasonAr,
        })),
        demandMatches: result.demands.map(m => ({
          id: m.id,
          type: m.type,
          score: Math.round(m.score * 100),
          proximityLevel: m.proximityLevel,
          sourceItem: {
            id: m.sourceItem.id,
            title: m.sourceItem.title,
          },
          matchedItem: {
            id: m.matchedItem.id,
            title: m.matchedItem.title,
            estimatedValue: m.matchedItem.estimatedValue,
            sellerName: m.matchedItem.sellerName,
            location: m.matchedItem.location,
          },
          matchReason: m.matchReasonAr,
        })),
      },
    });
  } catch (error: any) {
    console.error('[MatchingRoutes] Error getting user matches:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب مطابقاتك',
      error: error.message,
    });
  }
});

/**
 * POST /api/v1/matching/trigger/:itemId
 * Manually trigger matching for an item (for testing)
 */
router.post('/trigger/:itemId', authenticate, async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const userId = (req as any).user.id;

    console.log(`[MatchingRoutes] Manual trigger for item ${itemId} by user ${userId}`);

    const matches = await processNewItem(itemId, userId);

    res.json({
      success: true,
      message: `تم العثور على ${matches.length} تطابق وإرسال الإشعارات`,
      data: {
        itemId,
        matchCount: matches.length,
        matches: matches.map(m => ({
          id: m.id,
          type: m.type,
          score: Math.round(m.score * 100),
          proximityLevel: m.proximityLevel,
          matchedUserId: m.matchedItem.sellerId,
          matchedItemTitle: m.matchedItem.title,
          matchReason: m.matchReasonAr,
        })),
      },
    });
  } catch (error: any) {
    console.error('[MatchingRoutes] Error triggering match:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء تشغيل المطابقة',
      error: error.message,
    });
  }
});

/**
 * GET /api/v1/matching/proximity-test
 * Test proximity scoring between two locations
 */
router.get('/proximity-test', async (req: Request, res: Response) => {
  try {
    const { gov1, city1, district1, gov2, city2, district2 } = req.query;

    // Simple proximity test logic
    let level: string;
    let score: number;

    if (district1 && district2 && district1 === district2) {
      level = 'DISTRICT';
      score = 100;
    } else if (city1 && city2 && city1 === city2) {
      level = 'CITY';
      score = 80;
    } else if (gov1 && gov2 && gov1 === gov2) {
      level = 'GOVERNORATE';
      score = 60;
    } else {
      level = 'NATIONAL';
      score = 40;
    }

    res.json({
      success: true,
      data: {
        location1: { governorate: gov1, city: city1, district: district1 },
        location2: { governorate: gov2, city: city2, district: district2 },
        proximityLevel: level,
        proximityScore: score,
        proximityLevelAr: {
          DISTRICT: 'نفس الحي',
          CITY: 'نفس المدينة',
          GOVERNORATE: 'نفس المحافظة',
          NATIONAL: 'مصر',
        }[level],
      },
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'حدث خطأ',
      error: error.message,
    });
  }
});

export default router;
