/**
 * Analytics Routes
 * مسارات التحليلات
 */

import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * =====================================================
 * DASHBOARD ROUTES (Admin Only)
 * مسارات لوحة التحكم (للمشرفين فقط)
 * =====================================================
 */

/**
 * Get complete dashboard metrics
 * GET /api/v1/analytics/dashboard
 */
router.get('/dashboard', authenticate, requireAdmin, analyticsController.getDashboard);

/**
 * Get overview metrics
 * GET /api/v1/analytics/overview
 */
router.get('/overview', authenticate, requireAdmin, analyticsController.getOverview);

/**
 * Get sales metrics
 * GET /api/v1/analytics/sales
 */
router.get('/sales', authenticate, requireAdmin, analyticsController.getSales);

/**
 * Get user metrics
 * GET /api/v1/analytics/users
 */
router.get('/users', authenticate, requireAdmin, analyticsController.getUsers);

/**
 * Get listing metrics
 * GET /api/v1/analytics/listings
 */
router.get('/listings', authenticate, requireAdmin, analyticsController.getListings);

/**
 * Get performance metrics
 * GET /api/v1/analytics/performance
 */
router.get('/performance', authenticate, requireAdmin, analyticsController.getPerformance);

/**
 * Get quick stats for admin header
 * GET /api/v1/analytics/quick-stats
 */
router.get('/quick-stats', authenticate, requireAdmin, analyticsController.getQuickStats);

/**
 * Compare two periods
 * GET /api/v1/analytics/compare
 */
router.get('/compare', authenticate, requireAdmin, analyticsController.comparePeriods);

/**
 * =====================================================
 * REAL-TIME ROUTES
 * مسارات البيانات اللحظية
 * =====================================================
 */

/**
 * Get real-time statistics
 * GET /api/v1/analytics/realtime
 */
router.get('/realtime', authenticate, requireAdmin, analyticsController.getRealTimeStats);

/**
 * Get system health
 * GET /api/v1/analytics/health
 */
router.get('/health', analyticsController.getSystemHealth);

/**
 * Get active alerts
 * GET /api/v1/analytics/alerts
 */
router.get('/alerts', authenticate, requireAdmin, analyticsController.getAlerts);

/**
 * Resolve an alert
 * POST /api/v1/analytics/alerts/:alertId/resolve
 */
router.post('/alerts/:alertId/resolve', authenticate, requireAdmin, analyticsController.resolveAlert);

/**
 * Get top endpoints
 * GET /api/v1/analytics/endpoints
 */
router.get('/endpoints', authenticate, requireAdmin, analyticsController.getTopEndpoints);

/**
 * Get hourly traffic pattern
 * GET /api/v1/analytics/traffic
 */
router.get('/traffic', authenticate, requireAdmin, analyticsController.getHourlyTraffic);

/**
 * Get response time histogram
 * GET /api/v1/analytics/response-times
 */
router.get('/response-times', authenticate, requireAdmin, analyticsController.getResponseTimeHistogram);

/**
 * Get metrics summary
 * GET /api/v1/analytics/summary
 */
router.get('/summary', authenticate, requireAdmin, analyticsController.getMetricsSummary);

/**
 * =====================================================
 * REPORTS ROUTES
 * مسارات التقارير
 * =====================================================
 */

/**
 * Generate sales report
 * POST /api/v1/analytics/reports/sales
 */
router.post('/reports/sales', authenticate, requireAdmin, analyticsController.generateSalesReport);

/**
 * Generate user activity report
 * POST /api/v1/analytics/reports/users
 */
router.post('/reports/users', authenticate, requireAdmin, analyticsController.generateUserReport);

/**
 * Generate financial report
 * POST /api/v1/analytics/reports/financial
 */
router.post('/reports/financial', authenticate, requireAdmin, analyticsController.generateFinancialReport);

/**
 * =====================================================
 * SELLER ANALYTICS ROUTES
 * مسارات تحليلات البائع
 * =====================================================
 */

/**
 * Get seller dashboard
 * GET /api/v1/analytics/seller/dashboard
 */
router.get('/seller/dashboard', authenticate, analyticsController.getSellerDashboard);

/**
 * Get seller performance metrics
 * GET /api/v1/analytics/seller/performance
 */
router.get('/seller/performance', authenticate, analyticsController.getSellerPerformance);

export default router;
