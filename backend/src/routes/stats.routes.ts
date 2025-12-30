/**
 * Platform Statistics Routes
 * مسارات إحصائيات المنصة
 */

import { Router } from 'express';
import { platformStatsService } from '../services/platform-stats.service';
import { authenticateToken, requireAdmin } from '../middleware/auth.middleware';

const router = Router();

/**
 * @route GET /api/v1/stats/platform
 * @desc Get comprehensive platform statistics
 * @access Public (basic), Admin (full)
 */
router.get('/platform', async (req, res) => {
  try {
    const stats = await platformStatsService.getPlatformStats();

    // For public access, only return limited stats
    const publicStats = {
      users: {
        total: stats.users.total,
        active: stats.users.active,
      },
      listings: {
        total: stats.listings.total,
        active: stats.listings.active,
      },
      barters: {
        successful: stats.barters.successful,
        successRate: Math.round(stats.barters.successRate),
      },
      categories: {
        total: stats.categories.total,
        topCategories: stats.categories.topCategories.slice(0, 3),
      },
    };

    res.json({
      success: true,
      data: publicStats,
    });
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform statistics',
    });
  }
});

/**
 * @route GET /api/v1/stats/platform/full
 * @desc Get full platform statistics (admin only)
 * @access Admin
 */
router.get('/platform/full', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const stats = await platformStatsService.getPlatformStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching full platform stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch platform statistics',
    });
  }
});

/**
 * @route GET /api/v1/stats/user/:userId
 * @desc Get user-specific statistics
 * @access Private
 */
router.get('/user/:userId', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;

    // Users can only view their own stats unless admin
    if (req.user?.id !== userId && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view these statistics',
      });
    }

    const stats = await platformStatsService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching user stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch user statistics',
    });
  }
});

/**
 * @route GET /api/v1/stats/my
 * @desc Get current user's statistics
 * @access Private
 */
router.get('/my', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
      });
    }

    const stats = await platformStatsService.getUserStats(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error fetching my stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch your statistics',
    });
  }
});

/**
 * @route GET /api/v1/stats/categories
 * @desc Get category performance metrics
 * @access Public
 */
router.get('/categories', async (req, res) => {
  try {
    const categoryStats = await platformStatsService.getCategoryPerformance();

    res.json({
      success: true,
      data: categoryStats,
    });
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch category statistics',
    });
  }
});

/**
 * @route GET /api/v1/stats/daily
 * @desc Get daily activity summary
 * @access Admin
 */
router.get('/daily', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const dateParam = req.query.date as string;
    const date = dateParam ? new Date(dateParam) : new Date();

    const dailyStats = await platformStatsService.getDailyActivity(date);

    res.json({
      success: true,
      data: {
        date: date.toISOString().split('T')[0],
        ...dailyStats,
      },
    });
  } catch (error) {
    console.error('Error fetching daily stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch daily statistics',
    });
  }
});

/**
 * @route GET /api/v1/stats/health
 * @desc Platform health check with basic stats
 * @access Public
 */
router.get('/health', async (req, res) => {
  try {
    const stats = await platformStatsService.getPlatformStats();

    res.json({
      success: true,
      status: 'healthy',
      data: {
        uptime: process.uptime(),
        timestamp: new Date().toISOString(),
        metrics: {
          activeUsers: stats.users.active,
          activeListings: stats.listings.active,
          pendingBarters: stats.barters.pending,
          activeAuctions: stats.auctions.active,
        },
      },
    });
  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json({
      success: false,
      status: 'unhealthy',
      error: 'Platform health check failed',
    });
  }
});

export default router;
