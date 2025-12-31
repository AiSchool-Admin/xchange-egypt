/**
 * Analytics Controller
 * متحكم التحليلات
 *
 * Endpoints for analytics dashboard, reports, and real-time metrics
 */

import { Request, Response, NextFunction } from 'express';
import { analyticsService, TimePeriod } from '../services/analytics/analytics.service';
import { realTimeMetrics } from '../services/analytics/realtime.service';
import { reportsService, ReportFormat, ReportPeriod } from '../services/analytics/reports.service';
import { successResponse, errorResponse } from '../utils/response';

// Helper to safely get user ID from request
const getUserId = (req: Request): string | null => req.user?.id || null;

/**
 * =====================================================
 * DASHBOARD ENDPOINTS
 * نقاط نهاية لوحة التحكم
 * =====================================================
 */

/**
 * Get complete dashboard metrics
 * GET /api/v1/analytics/dashboard
 */
export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as TimePeriod) || 'month';

    const metrics = await analyticsService.getDashboardMetrics(period);

    return successResponse(res, metrics, 'Dashboard metrics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get overview metrics
 * GET /api/v1/analytics/overview
 */
export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as TimePeriod) || 'month';

    const overview = await analyticsService.getOverviewMetrics(period);

    return successResponse(res, overview, 'Overview metrics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get sales metrics
 * GET /api/v1/analytics/sales
 */
export const getSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as TimePeriod) || 'month';

    const sales = await analyticsService.getSalesMetrics(period);

    return successResponse(res, sales, 'Sales metrics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user metrics
 * GET /api/v1/analytics/users
 */
export const getUsers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as TimePeriod) || 'month';

    const users = await analyticsService.getUserMetrics(period);

    return successResponse(res, users, 'User metrics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get listing metrics
 * GET /api/v1/analytics/listings
 */
export const getListings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as TimePeriod) || 'month';

    const listings = await analyticsService.getListingMetrics(period);

    return successResponse(res, listings, 'Listing metrics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get performance metrics
 * GET /api/v1/analytics/performance
 */
export const getPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period = (req.query.period as TimePeriod) || 'month';

    const performance = await analyticsService.getPerformanceMetrics(period);

    return successResponse(res, performance, 'Performance metrics retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * =====================================================
 * REAL-TIME ENDPOINTS
 * نقاط نهاية البيانات اللحظية
 * =====================================================
 */

/**
 * Get real-time statistics
 * GET /api/v1/analytics/realtime
 */
export const getRealTimeStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const stats = realTimeMetrics.getRealTimeStats();

    return successResponse(res, stats, 'Real-time stats retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get system health
 * GET /api/v1/analytics/health
 */
export const getSystemHealth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const health = realTimeMetrics.getSystemHealth();

    return successResponse(res, health, 'System health retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get active alerts
 * GET /api/v1/analytics/alerts
 */
export const getAlerts = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const alerts = realTimeMetrics.getActiveAlerts();

    return successResponse(res, { alerts }, 'Alerts retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Resolve an alert
 * POST /api/v1/analytics/alerts/:alertId/resolve
 */
export const resolveAlert = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { alertId } = req.params;

    const resolved = realTimeMetrics.resolveAlert(alertId);

    if (resolved) {
      return successResponse(res, { resolved: true }, 'Alert resolved');
    } else {
      return errorResponse(res, 'Alert not found or already resolved', 404);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * Get top endpoints
 * GET /api/v1/analytics/endpoints
 */
export const getTopEndpoints = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const endpoints = realTimeMetrics.getTopEndpoints(limit);

    return successResponse(res, { endpoints }, 'Top endpoints retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get hourly traffic pattern
 * GET /api/v1/analytics/traffic
 */
export const getHourlyTraffic = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const traffic = realTimeMetrics.getHourlyTraffic();

    return successResponse(res, { traffic }, 'Hourly traffic retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get response time histogram
 * GET /api/v1/analytics/response-times
 */
export const getResponseTimeHistogram = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const histogram = realTimeMetrics.getResponseTimeHistogram();

    return successResponse(res, { histogram }, 'Response time histogram retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get metrics summary
 * GET /api/v1/analytics/summary
 */
export const getMetricsSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = realTimeMetrics.getMetricsSummary();

    return successResponse(res, summary, 'Metrics summary retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * =====================================================
 * REPORTS ENDPOINTS
 * نقاط نهاية التقارير
 * =====================================================
 */

/**
 * Generate sales report
 * POST /api/v1/analytics/reports/sales
 */
export const generateSalesReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, period, format, filters } = req.body;

    if (!startDate || !endDate) {
      return errorResponse(res, 'Start date and end date are required', 400);
    }

    const report = await reportsService.generateSalesReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      period: (period as ReportPeriod) || 'monthly',
      format: (format as ReportFormat) || 'json',
      filters,
    });

    // If CSV format requested, return as download
    if (format === 'csv') {
      const csvData = reportsService.exportToCSV(report.dailyBreakdown, [
        'date',
        'revenue',
        'orders',
        'averageOrderValue',
        'commission',
        'refunds',
      ]);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=sales-report.csv');
      return res.send(csvData);
    }

    return successResponse(res, report, 'Sales report generated');
  } catch (error) {
    next(error);
  }
};

/**
 * Generate user activity report
 * POST /api/v1/analytics/reports/users
 */
export const generateUserReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, period, format, filters } = req.body;

    if (!startDate || !endDate) {
      return errorResponse(res, 'Start date and end date are required', 400);
    }

    const report = await reportsService.generateUserActivityReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      period: (period as ReportPeriod) || 'monthly',
      format: (format as ReportFormat) || 'json',
      filters,
    });

    // If CSV format requested
    if (format === 'csv') {
      const csvData = reportsService.exportToCSV(report.registrationsByDay, [
        'date',
        'registrations',
        'activations',
        'churnRate',
      ]);

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=user-report.csv');
      return res.send(csvData);
    }

    return successResponse(res, report, 'User activity report generated');
  } catch (error) {
    next(error);
  }
};

/**
 * Generate financial report
 * POST /api/v1/analytics/reports/financial
 */
export const generateFinancialReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, period, format } = req.body;

    if (!startDate || !endDate) {
      return errorResponse(res, 'Start date and end date are required', 400);
    }

    const report = await reportsService.generateFinancialReport({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      period: (period as ReportPeriod) || 'monthly',
      format: (format as ReportFormat) || 'json',
    });

    return successResponse(res, report, 'Financial report generated');
  } catch (error) {
    next(error);
  }
};

/**
 * Get quick stats for admin header
 * GET /api/v1/analytics/quick-stats
 */
export const getQuickStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [overview, realtime] = await Promise.all([
      analyticsService.getOverviewMetrics('today'),
      Promise.resolve(realTimeMetrics.getRealTimeStats()),
    ]);

    const quickStats = {
      todayRevenue: overview.totalRevenue,
      todayOrders: overview.totalOrders,
      activeUsers: realtime.activeUsers,
      requestsPerMinute: realtime.requestsPerMinute,
      errorRate: realtime.errorRate,
      systemStatus: realtime.systemHealth.status,
      pendingAlerts: realTimeMetrics.getActiveAlerts().length,
    };

    return successResponse(res, quickStats, 'Quick stats retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get comparison data between two periods
 * GET /api/v1/analytics/compare
 */
export const comparePeriods = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const period1 = req.query.period1 as TimePeriod;
    const period2 = req.query.period2 as TimePeriod;

    if (!period1 || !period2) {
      return errorResponse(res, 'Both period1 and period2 are required', 400);
    }

    const [data1, data2] = await Promise.all([
      analyticsService.getOverviewMetrics(period1),
      analyticsService.getOverviewMetrics(period2),
    ]);

    const comparison = {
      period1: { period: period1, data: data1 },
      period2: { period: period2, data: data2 },
      changes: {
        revenue: data1.totalRevenue - data2.totalRevenue,
        revenuePercentage:
          data2.totalRevenue > 0
            ? ((data1.totalRevenue - data2.totalRevenue) / data2.totalRevenue) * 100
            : 0,
        orders: data1.totalOrders - data2.totalOrders,
        ordersPercentage:
          data2.totalOrders > 0
            ? ((data1.totalOrders - data2.totalOrders) / data2.totalOrders) * 100
            : 0,
        users: data1.totalUsers - data2.totalUsers,
        usersPercentage:
          data2.totalUsers > 0
            ? ((data1.totalUsers - data2.totalUsers) / data2.totalUsers) * 100
            : 0,
      },
    };

    return successResponse(res, comparison, 'Period comparison retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * =====================================================
 * SELLER ANALYTICS ENDPOINTS
 * نقاط نهاية تحليلات البائع
 * =====================================================
 */

/**
 * Get seller dashboard
 * GET /api/v1/analytics/seller/dashboard
 */
export const getSellerDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const period = (req.query.period as TimePeriod) || 'month';

    // This would fetch seller-specific analytics
    const sellerStats = {
      totalSales: 0,
      totalRevenue: 0,
      totalOrders: 0,
      averageRating: 4.5,
      responseRate: 95,
      completionRate: 98,
      activeListings: 0,
      viewsThisMonth: 0,
      topProducts: [],
      recentOrders: [],
      revenueChart: [],
    };

    return successResponse(res, sellerStats, 'Seller dashboard retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Get seller performance metrics
 * GET /api/v1/analytics/seller/performance
 */
export const getSellerPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const period = (req.query.period as TimePeriod) || 'month';

    const performance = {
      salesGrowth: 15.5,
      averageOrderValue: 450,
      customerSatisfaction: 4.7,
      responseTime: 2.5, // hours
      shippingTime: 3.2, // days
      returnRate: 2.1,
      repeatCustomerRate: 35,
      conversionRate: 8.5,
    };

    return successResponse(res, performance, 'Seller performance retrieved');
  } catch (error) {
    next(error);
  }
};
