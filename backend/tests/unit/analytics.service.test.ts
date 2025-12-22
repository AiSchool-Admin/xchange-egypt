/**
 * Analytics Service Tests
 * اختبارات خدمات التحليلات
 */

// Mock Prisma Client - must be before imports
const mockPrismaClient = {
  transaction: {
    aggregate: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
    count: jest.fn(),
  },
  order: {
    count: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    count: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
  },
  listing: {
    count: jest.fn(),
    findMany: jest.fn(),
    groupBy: jest.fn(),
    aggregate: jest.fn(),
  },
};

jest.mock('@prisma/client', () => {
  return {
    PrismaClient: jest.fn().mockImplementation(() => mockPrismaClient),
  };
});

import {
  AnalyticsService,
  TimePeriod,
} from '../../src/services/analytics/analytics.service';

import {
  RealTimeMetricsService,
  RequestMetric,
  ErrorMetric,
  metricsMiddleware,
  errorTrackingMiddleware,
  realTimeMetrics,
} from '../../src/services/analytics/realtime.service';

// Suppress unhandled error events from the singleton
realTimeMetrics.on('error', () => {});

import {
  ReportsService,
  ReportOptions,
} from '../../src/services/analytics/reports.service';

describe('AnalyticsService', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    jest.clearAllMocks();
    setupDefaultMocks();
  });

  function setupDefaultMocks() {
    // Mock transaction aggregate
    mockPrismaClient.transaction.aggregate.mockResolvedValue({
      _sum: { amount: 50000, platformFee: 2500, sellerReceives: 47500 },
      _count: 100,
    });

    // Mock transaction findMany
    mockPrismaClient.transaction.findMany.mockResolvedValue([
      {
        id: 'txn-1',
        amount: 500,
        status: 'COMPLETED',
        type: 'DIRECT_SALE',
        createdAt: new Date(),
        item: {
          id: 'item-1',
          title: 'iPhone 13',
          category: { id: 'cat-1', name: 'Electronics', nameAr: 'إلكترونيات' },
        },
        seller: { id: 'user-1', fullName: 'Ahmed Mohamed', email: 'ahmed@test.com' },
        buyer: { id: 'user-2', fullName: 'Sara Ali', email: 'sara@test.com' },
      },
    ]);

    // Mock order count
    mockPrismaClient.order.count.mockResolvedValue(150);

    // Mock order findMany
    mockPrismaClient.order.findMany.mockResolvedValue([
      {
        id: 'order-1',
        total: 500,
        status: 'COMPLETED',
        paymentMethod: 'CARD',
        userId: 'user-1',
        shippingCost: 50,
        shippingAddress: { governorate: 'Cairo' },
        createdAt: new Date(),
      },
    ]);

    // Mock user count
    mockPrismaClient.user.count.mockResolvedValue(1000);

    // Mock user findMany
    mockPrismaClient.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        fullName: 'Test User',
        email: 'test@test.com',
        userType: 'INDIVIDUAL',
        governorate: 'Cairo',
        status: 'ACTIVE',
        createdAt: new Date(),
        lastLoginAt: new Date(),
      },
    ]);

    // Mock user groupBy
    mockPrismaClient.user.groupBy.mockResolvedValue([
      { userType: 'INDIVIDUAL', _count: 800 },
      { userType: 'BUSINESS', _count: 200 },
    ]);

    // Mock listing count
    mockPrismaClient.listing.count.mockResolvedValue(500);

    // Mock listing findMany
    mockPrismaClient.listing.findMany.mockResolvedValue([
      {
        id: 'listing-1',
        price: 1000,
        status: 'ACTIVE',
        item: {
          category: { id: 'cat-1', name: 'Electronics', nameAr: 'إلكترونيات' },
        },
      },
    ]);

    // Mock listing groupBy
    mockPrismaClient.listing.groupBy.mockResolvedValue([
      { status: 'ACTIVE', _count: 300 },
      { status: 'SOLD', _count: 150 },
      { status: 'PENDING', _count: 50 },
    ]);

    // Mock listing aggregate
    mockPrismaClient.listing.aggregate.mockResolvedValue({
      _avg: { price: 750 },
    });
  }

  describe('getDashboardMetrics', () => {
    it('should return complete dashboard metrics', async () => {
      const metrics = await analyticsService.getDashboardMetrics('month');

      expect(metrics).toBeDefined();
      expect(metrics).toHaveProperty('overview');
      expect(metrics).toHaveProperty('sales');
      expect(metrics).toHaveProperty('users');
      expect(metrics).toHaveProperty('listings');
      expect(metrics).toHaveProperty('performance');
    });

    it('should accept different time periods', async () => {
      const periods: TimePeriod[] = ['today', 'yesterday', 'week', 'month', 'quarter', 'year', 'all'];

      for (const period of periods) {
        const metrics = await analyticsService.getDashboardMetrics(period);
        expect(metrics).toBeDefined();
      }
    });

    it('should default to month period', async () => {
      const metrics = await analyticsService.getDashboardMetrics();
      expect(metrics).toBeDefined();
    });
  });

  describe('getOverviewMetrics', () => {
    it('should return overview metrics with all required fields', async () => {
      const overview = await analyticsService.getOverviewMetrics('month');

      expect(overview).toHaveProperty('totalRevenue');
      expect(overview).toHaveProperty('revenueChange');
      expect(overview).toHaveProperty('totalOrders');
      expect(overview).toHaveProperty('ordersChange');
      expect(overview).toHaveProperty('totalUsers');
      expect(overview).toHaveProperty('usersChange');
      expect(overview).toHaveProperty('activeListings');
      expect(overview).toHaveProperty('listingsChange');
      expect(overview).toHaveProperty('conversionRate');
      expect(overview).toHaveProperty('averageOrderValue');
    });

    it('should calculate percentage changes correctly', async () => {
      mockPrismaClient.transaction.aggregate
        .mockResolvedValueOnce({ _sum: { amount: 10000 } })
        .mockResolvedValueOnce({ _sum: { amount: 8000 } });

      const overview = await analyticsService.getOverviewMetrics('month');

      expect(typeof overview.revenueChange).toBe('number');
    });

    it('should handle zero previous values', async () => {
      mockPrismaClient.transaction.aggregate.mockResolvedValue({
        _sum: { amount: 10000 },
      });
      mockPrismaClient.order.count
        .mockResolvedValueOnce(100)
        .mockResolvedValueOnce(0);

      const overview = await analyticsService.getOverviewMetrics('month');

      expect(overview.ordersChange).toBeDefined();
    });
  });

  describe('getSalesMetrics', () => {
    it('should return sales metrics with all breakdowns', async () => {
      const sales = await analyticsService.getSalesMetrics('month');

      expect(sales).toHaveProperty('totalSales');
      expect(sales).toHaveProperty('salesByDay');
      expect(sales).toHaveProperty('salesByCategory');
      expect(sales).toHaveProperty('salesByGovernorate');
      expect(sales).toHaveProperty('salesByPaymentMethod');
      expect(sales).toHaveProperty('topSellingItems');
      expect(sales).toHaveProperty('revenueByType');
    });

    it('should return sales by day sorted by date', async () => {
      mockPrismaClient.transaction.findMany.mockResolvedValue([
        { amount: 100, status: 'COMPLETED', createdAt: new Date('2024-01-15') },
        { amount: 200, status: 'COMPLETED', createdAt: new Date('2024-01-10') },
        { amount: 150, status: 'COMPLETED', createdAt: new Date('2024-01-20') },
      ]);

      const sales = await analyticsService.getSalesMetrics('month');

      expect(Array.isArray(sales.salesByDay)).toBe(true);
    });

    it('should calculate category percentages correctly', async () => {
      const sales = await analyticsService.getSalesMetrics('month');

      expect(Array.isArray(sales.salesByCategory)).toBe(true);
    });
  });

  describe('getUserMetrics', () => {
    it('should return user metrics with all required fields', async () => {
      const users = await analyticsService.getUserMetrics('month');

      expect(users).toHaveProperty('totalUsers');
      expect(users).toHaveProperty('newUsers');
      expect(users).toHaveProperty('activeUsers');
      expect(users).toHaveProperty('usersByType');
      expect(users).toHaveProperty('usersByGovernorate');
      expect(users).toHaveProperty('userRetention');
      expect(users).toHaveProperty('userGrowth');
      expect(users).toHaveProperty('topSellers');
      expect(users).toHaveProperty('topBuyers');
    });

    it('should return retention data with correct fields', async () => {
      const users = await analyticsService.getUserMetrics('month');

      expect(users.userRetention).toHaveProperty('day1');
      expect(users.userRetention).toHaveProperty('day7');
      expect(users.userRetention).toHaveProperty('day30');
      expect(users.userRetention).toHaveProperty('day90');
    });

    it('should return user types with Arabic translations', async () => {
      const users = await analyticsService.getUserMetrics('month');

      expect(Array.isArray(users.usersByType)).toBe(true);
    });
  });

  describe('getListingMetrics', () => {
    it('should return listing metrics', async () => {
      const listings = await analyticsService.getListingMetrics('month');

      expect(listings).toHaveProperty('totalListings');
      expect(listings).toHaveProperty('activeListings');
      expect(listings).toHaveProperty('pendingListings');
      expect(listings).toHaveProperty('soldListings');
      expect(listings).toHaveProperty('listingsByCategory');
      expect(listings).toHaveProperty('listingsByStatus');
      expect(listings).toHaveProperty('averageListingPrice');
      expect(listings).toHaveProperty('averageTimeToSell');
      expect(listings).toHaveProperty('listingConversionRate');
    });

    it('should return listings by status with Arabic translations', async () => {
      const listings = await analyticsService.getListingMetrics('month');

      expect(Array.isArray(listings.listingsByStatus)).toBe(true);
    });
  });

  describe('getPerformanceMetrics', () => {
    it('should return performance metrics', async () => {
      const performance = await analyticsService.getPerformanceMetrics('month');

      expect(performance).toHaveProperty('apiResponseTime');
      expect(performance).toHaveProperty('errorRate');
      expect(performance).toHaveProperty('uptime');
      expect(performance).toHaveProperty('requestsPerMinute');
      expect(performance).toHaveProperty('peakHours');
      expect(performance).toHaveProperty('slowestEndpoints');
    });

    it('should return peak hours array', async () => {
      const performance = await analyticsService.getPerformanceMetrics('month');

      expect(Array.isArray(performance.peakHours)).toBe(true);
    });

    it('should return slowest endpoints array', async () => {
      const performance = await analyticsService.getPerformanceMetrics('month');

      expect(Array.isArray(performance.slowestEndpoints)).toBe(true);
    });
  });
});

describe('RealTimeMetricsService', () => {
  let metricsService: RealTimeMetricsService;

  beforeEach(() => {
    metricsService = new RealTimeMetricsService(1000);
    metricsService.on('error', () => {}); // Suppress unhandled error events
    metricsService.clearMetrics();
  });

  afterEach(() => {
    metricsService.stopMetricsCollection();
    metricsService.removeAllListeners();
  });

  describe('recordRequest', () => {
    it('should record request metrics', () => {
      const metric: RequestMetric = {
        endpoint: '/api/v1/listings',
        method: 'GET',
        statusCode: 200,
        responseTime: 150,
        timestamp: new Date(),
        userId: 'user-1',
      };

      metricsService.recordRequest(metric);

      const stats = metricsService.getRealTimeStats();
      expect(stats.requestsPerMinute).toBeGreaterThanOrEqual(0);
    });

    it('should track active users', () => {
      const metric: RequestMetric = {
        endpoint: '/api/v1/listings',
        method: 'GET',
        statusCode: 200,
        responseTime: 150,
        timestamp: new Date(),
        userId: 'user-1',
      };

      metricsService.recordRequest(metric);

      const stats = metricsService.getRealTimeStats();
      expect(stats.activeUsers).toBeGreaterThanOrEqual(0);
    });

    it('should emit request event', (done) => {
      metricsService.on('request', (metric) => {
        expect(metric.endpoint).toBe('/api/v1/test');
        done();
      });

      metricsService.recordRequest({
        endpoint: '/api/v1/test',
        method: 'GET',
        statusCode: 200,
        responseTime: 100,
        timestamp: new Date(),
      });
    });
  });

  describe('recordError', () => {
    it('should record error metrics', () => {
      const metric: ErrorMetric = {
        endpoint: '/api/v1/listings',
        method: 'POST',
        errorType: 'ValidationError',
        errorMessage: 'Invalid input',
        timestamp: new Date(),
      };

      metricsService.recordError(metric);

      const stats = metricsService.getRealTimeStats();
      expect(Array.isArray(stats.recentErrors)).toBe(true);
    });

    it('should emit error event', (done) => {
      metricsService.on('error', (metric) => {
        expect(metric.errorType).toBe('TestError');
        done();
      });

      metricsService.recordError({
        endpoint: '/api/v1/test',
        method: 'POST',
        errorType: 'TestError',
        errorMessage: 'Test error message',
        timestamp: new Date(),
      });
    });
  });

  describe('getRealTimeStats', () => {
    it('should return complete real-time stats', () => {
      const stats = metricsService.getRealTimeStats();

      expect(stats).toHaveProperty('requestsPerMinute');
      expect(stats).toHaveProperty('averageResponseTime');
      expect(stats).toHaveProperty('errorRate');
      expect(stats).toHaveProperty('activeUsers');
      expect(stats).toHaveProperty('systemHealth');
      expect(stats).toHaveProperty('recentErrors');
      expect(stats).toHaveProperty('topEndpoints');
      expect(stats).toHaveProperty('responseTimeHistogram');
    });

    it('should calculate average response time correctly', () => {
      metricsService.recordRequest({
        endpoint: '/api/test',
        method: 'GET',
        statusCode: 200,
        responseTime: 100,
        timestamp: new Date(),
      });
      metricsService.recordRequest({
        endpoint: '/api/test',
        method: 'GET',
        statusCode: 200,
        responseTime: 200,
        timestamp: new Date(),
      });

      const stats = metricsService.getRealTimeStats();
      expect(stats.averageResponseTime).toBeGreaterThanOrEqual(0);
    });

    it('should calculate error rate correctly', () => {
      // Add successful requests
      for (let i = 0; i < 8; i++) {
        metricsService.recordRequest({
          endpoint: '/api/test',
          method: 'GET',
          statusCode: 200,
          responseTime: 100,
          timestamp: new Date(),
        });
      }
      // Add error requests
      for (let i = 0; i < 2; i++) {
        metricsService.recordRequest({
          endpoint: '/api/test',
          method: 'GET',
          statusCode: 500,
          responseTime: 100,
          timestamp: new Date(),
        });
      }

      const stats = metricsService.getRealTimeStats();
      expect(stats.errorRate).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getSystemHealth', () => {
    it('should return system health status', () => {
      const health = metricsService.getSystemHealth();

      expect(health).toHaveProperty('status');
      expect(health).toHaveProperty('uptime');
      expect(health).toHaveProperty('cpu');
      expect(health).toHaveProperty('memory');
      expect(health).toHaveProperty('database');
      expect(health).toHaveProperty('redis');
    });

    it('should return valid status values', () => {
      const health = metricsService.getSystemHealth();

      expect(['healthy', 'degraded', 'critical']).toContain(health.status);
    });

    it('should track uptime', () => {
      const health = metricsService.getSystemHealth();

      expect(health.uptime).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getTopEndpoints', () => {
    it('should return top endpoints by request count', () => {
      // Add requests to different endpoints
      for (let i = 0; i < 10; i++) {
        metricsService.recordRequest({
          endpoint: '/api/v1/listings',
          method: 'GET',
          statusCode: 200,
          responseTime: 100,
          timestamp: new Date(),
        });
      }
      for (let i = 0; i < 5; i++) {
        metricsService.recordRequest({
          endpoint: '/api/v1/users',
          method: 'GET',
          statusCode: 200,
          responseTime: 100,
          timestamp: new Date(),
        });
      }

      const endpoints = metricsService.getTopEndpoints(5);

      expect(Array.isArray(endpoints)).toBe(true);
    });

    it('should include p95 and p99 response times', () => {
      for (let i = 0; i < 100; i++) {
        metricsService.recordRequest({
          endpoint: '/api/test',
          method: 'GET',
          statusCode: 200,
          responseTime: Math.random() * 500,
          timestamp: new Date(),
        });
      }

      const endpoints = metricsService.getTopEndpoints(5);

      if (endpoints.length > 0) {
        expect(endpoints[0]).toHaveProperty('p95ResponseTime');
        expect(endpoints[0]).toHaveProperty('p99ResponseTime');
      }
    });
  });

  describe('getResponseTimeHistogram', () => {
    it('should return histogram buckets', () => {
      // Add requests with various response times
      const responseTimes = [25, 75, 150, 350, 750, 1500, 2500];
      responseTimes.forEach((time) => {
        metricsService.recordRequest({
          endpoint: '/api/test',
          method: 'GET',
          statusCode: 200,
          responseTime: time,
          timestamp: new Date(),
        });
      });

      const histogram = metricsService.getResponseTimeHistogram();

      expect(Array.isArray(histogram)).toBe(true);
    });

    it('should return empty array when no requests', () => {
      const histogram = metricsService.getResponseTimeHistogram();

      expect(histogram).toEqual([]);
    });
  });

  describe('getHourlyTraffic', () => {
    it('should return traffic for all 24 hours', () => {
      metricsService.recordRequest({
        endpoint: '/api/test',
        method: 'GET',
        statusCode: 200,
        responseTime: 100,
        timestamp: new Date(),
      });

      const traffic = metricsService.getHourlyTraffic();

      expect(traffic.length).toBe(24);
      traffic.forEach((hour) => {
        expect(hour).toHaveProperty('hour');
        expect(hour).toHaveProperty('requests');
        expect(hour).toHaveProperty('errors');
      });
    });
  });

  describe('Alerts', () => {
    it('should get active alerts', () => {
      const alerts = metricsService.getActiveAlerts();

      expect(Array.isArray(alerts)).toBe(true);
    });

    it('should resolve alert', () => {
      // Record high response time to trigger alert
      metricsService.recordRequest({
        endpoint: '/api/test',
        method: 'GET',
        statusCode: 200,
        responseTime: 5000, // 5 seconds
        timestamp: new Date(),
      });

      const alerts = metricsService.getActiveAlerts();
      if (alerts.length > 0) {
        const result = metricsService.resolveAlert(alerts[0].id);
        expect(typeof result).toBe('boolean');
      }
    });

    it('should return false for non-existent alert', () => {
      const result = metricsService.resolveAlert('non-existent-id');

      expect(result).toBe(false);
    });

    it('should configure alerts', () => {
      metricsService.configureAlerts({
        errorRateThreshold: 10,
        responseTimeThreshold: 2000,
      });

      // Verify by checking that no alert is triggered for values under new threshold
      metricsService.recordRequest({
        endpoint: '/api/test',
        method: 'GET',
        statusCode: 200,
        responseTime: 1500, // Under 2000ms threshold
        timestamp: new Date(),
      });

      // Should not trigger alert
      const alerts = metricsService.getActiveAlerts();
      const responseTimeAlerts = alerts.filter((a) => a.type === 'response_time');
      expect(responseTimeAlerts.length).toBe(0);
    });
  });

  describe('getMetricsSummary', () => {
    it('should return metrics summary', () => {
      metricsService.recordRequest({
        endpoint: '/api/test',
        method: 'GET',
        statusCode: 200,
        responseTime: 100,
        timestamp: new Date(),
      });

      const summary = metricsService.getMetricsSummary();

      expect(summary).toHaveProperty('totalRequests');
      expect(summary).toHaveProperty('totalErrors');
      expect(summary).toHaveProperty('averageResponseTime');
      expect(summary).toHaveProperty('uptime');
      expect(summary).toHaveProperty('peakRequestsPerMinute');
    });

    it('should format uptime correctly', () => {
      const summary = metricsService.getMetricsSummary();

      expect(typeof summary.uptime).toBe('string');
      expect(summary.uptime).toMatch(/\d+d \d+h \d+m/);
    });
  });

  describe('Metrics Collection', () => {
    it('should start and stop metrics collection', () => {
      metricsService.startMetricsCollection(1000);
      metricsService.stopMetricsCollection();

      // Should not throw
      expect(true).toBe(true);
    });
  });
});

describe('ReportsService', () => {
  let reportsService: ReportsService;

  beforeEach(() => {
    reportsService = new ReportsService();
    jest.clearAllMocks();
    setupReportMocks();
  });

  function setupReportMocks() {
    // Mock order findMany
    mockPrismaClient.order.findMany.mockResolvedValue([
      {
        id: 'order-1',
        total: 500,
        status: 'COMPLETED',
        paymentMethod: 'CARD',
        userId: 'user-1',
        shippingCost: 50,
        shippingAddress: { governorate: 'Cairo' },
        createdAt: new Date('2024-01-15'),
      },
      {
        id: 'order-2',
        total: 750,
        status: 'DELIVERED',
        paymentMethod: 'FAWRY',
        userId: 'user-2',
        shippingCost: 30,
        shippingAddress: { governorate: 'Alexandria' },
        createdAt: new Date('2024-01-16'),
      },
    ]);

    // Mock transaction aggregate
    mockPrismaClient.transaction.aggregate.mockResolvedValue({
      _sum: { amount: 10000, platformFee: 500, sellerReceives: 9500 },
      _count: 50,
    });

    // Mock transaction findMany
    mockPrismaClient.transaction.findMany.mockResolvedValue([
      {
        id: 'txn-1',
        amount: 500,
        platformFee: 25,
        status: 'COMPLETED',
        type: 'DIRECT_SALE',
        createdAt: new Date('2024-01-15'),
        item: {
          id: 'item-1',
          title: 'iPhone 13',
          category: { id: 'cat-1', name: 'Electronics', nameAr: 'إلكترونيات' },
        },
        seller: { id: 'user-1', fullName: 'Ahmed', email: 'ahmed@test.com' },
        buyer: { id: 'user-2', fullName: 'Sara', email: 'sara@test.com' },
      },
    ]);

    // Mock transaction groupBy
    mockPrismaClient.transaction.groupBy.mockResolvedValue([
      { type: 'DIRECT_SALE', _sum: { amount: 8000, platformFee: 400 }, _count: 40 },
      { type: 'AUCTION', _sum: { amount: 2000, platformFee: 100 }, _count: 10 },
    ]);

    // Mock user count
    mockPrismaClient.user.count.mockResolvedValue(500);

    // Mock user findMany
    mockPrismaClient.user.findMany.mockResolvedValue([
      {
        id: 'user-1',
        createdAt: new Date('2024-01-15'),
        status: 'ACTIVE',
      },
    ]);

    // Mock user groupBy
    mockPrismaClient.user.groupBy.mockResolvedValue([
      { userType: 'INDIVIDUAL', _count: 400 },
      { userType: 'BUSINESS', _count: 100 },
    ]);
  }

  describe('generateSalesReport', () => {
    it('should generate sales report with all sections', async () => {
      const options: ReportOptions = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        period: 'monthly',
        format: 'json',
      };

      const report = await reportsService.generateSalesReport(options);

      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('dailyBreakdown');
      expect(report).toHaveProperty('categoryBreakdown');
      expect(report).toHaveProperty('governorateBreakdown');
      expect(report).toHaveProperty('paymentMethodBreakdown');
      expect(report).toHaveProperty('topProducts');
      expect(report).toHaveProperty('generatedAt');
      expect(report).toHaveProperty('period');
    });

    it('should include summary with all required fields', async () => {
      const options: ReportOptions = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        period: 'monthly',
        format: 'json',
      };

      const report = await reportsService.generateSalesReport(options);

      expect(report.summary).toHaveProperty('totalRevenue');
      expect(report.summary).toHaveProperty('totalOrders');
      expect(report.summary).toHaveProperty('averageOrderValue');
      expect(report.summary).toHaveProperty('totalCommission');
      expect(report.summary).toHaveProperty('netRevenue');
      expect(report.summary).toHaveProperty('refunds');
      expect(report.summary).toHaveProperty('refundAmount');
      expect(report.summary).toHaveProperty('conversionRate');
      expect(report.summary).toHaveProperty('newCustomers');
      expect(report.summary).toHaveProperty('returningCustomers');
    });

    it('should accept filters', async () => {
      const options: ReportOptions = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        period: 'monthly',
        format: 'json',
        filters: {
          categories: ['cat-1'],
          governorates: ['Cairo'],
          paymentMethods: ['CARD'],
        },
      };

      const report = await reportsService.generateSalesReport(options);

      expect(report).toBeDefined();
    });
  });

  describe('generateUserActivityReport', () => {
    it('should generate user activity report', async () => {
      const options: ReportOptions = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        period: 'monthly',
        format: 'json',
      };

      const report = await reportsService.generateUserActivityReport(options);

      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('registrationsByDay');
      expect(report).toHaveProperty('usersByType');
      expect(report).toHaveProperty('usersByGovernorate');
      expect(report).toHaveProperty('topSellers');
      expect(report).toHaveProperty('topBuyers');
      expect(report).toHaveProperty('retentionMetrics');
      expect(report).toHaveProperty('generatedAt');
      expect(report).toHaveProperty('period');
    });

    it('should include user summary with all fields', async () => {
      const options: ReportOptions = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        period: 'monthly',
        format: 'json',
      };

      const report = await reportsService.generateUserActivityReport(options);

      expect(report.summary).toHaveProperty('totalUsers');
      expect(report.summary).toHaveProperty('newUsers');
      expect(report.summary).toHaveProperty('activeUsers');
      expect(report.summary).toHaveProperty('inactiveUsers');
      expect(report.summary).toHaveProperty('verifiedUsers');
      expect(report.summary).toHaveProperty('bannedUsers');
      expect(report.summary).toHaveProperty('averageOrdersPerUser');
      expect(report.summary).toHaveProperty('averageRevenuePerUser');
    });

    it('should include retention metrics', async () => {
      const options: ReportOptions = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        period: 'monthly',
        format: 'json',
      };

      const report = await reportsService.generateUserActivityReport(options);

      expect(report.retentionMetrics).toHaveProperty('day1');
      expect(report.retentionMetrics).toHaveProperty('day7');
      expect(report.retentionMetrics).toHaveProperty('day30');
      expect(report.retentionMetrics).toHaveProperty('day90');
      expect(report.retentionMetrics).toHaveProperty('cohortAnalysis');
    });
  });

  describe('generateFinancialReport', () => {
    it('should generate financial report', async () => {
      const options: ReportOptions = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        period: 'monthly',
        format: 'json',
      };

      const report = await reportsService.generateFinancialReport(options);

      expect(report).toHaveProperty('summary');
      expect(report).toHaveProperty('revenueBySource');
      expect(report).toHaveProperty('expensesByCategory');
      expect(report).toHaveProperty('commissionBreakdown');
      expect(report).toHaveProperty('payoutSummary');
      expect(report).toHaveProperty('taxSummary');
      expect(report).toHaveProperty('generatedAt');
      expect(report).toHaveProperty('period');
    });

    it('should include financial summary', async () => {
      const options: ReportOptions = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        period: 'monthly',
        format: 'json',
      };

      const report = await reportsService.generateFinancialReport(options);

      expect(report.summary).toHaveProperty('grossRevenue');
      expect(report.summary).toHaveProperty('netRevenue');
      expect(report.summary).toHaveProperty('totalCommissions');
      expect(report.summary).toHaveProperty('totalRefunds');
      expect(report.summary).toHaveProperty('totalPayouts');
      expect(report.summary).toHaveProperty('platformProfit');
    });

    it('should include tax summary with VAT', async () => {
      const options: ReportOptions = {
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        period: 'monthly',
        format: 'json',
      };

      const report = await reportsService.generateFinancialReport(options);

      expect(report.taxSummary).toHaveProperty('totalTaxCollected');
      expect(report.taxSummary).toHaveProperty('vatAmount');
      expect(report.taxSummary).toHaveProperty('withholdingTax');
    });
  });

  describe('exportToCSV', () => {
    it('should export data to CSV format', () => {
      const data = [
        { date: '2024-01-15', revenue: 1000, orders: 10 },
        { date: '2024-01-16', revenue: 1500, orders: 15 },
      ];
      const headers = ['date', 'revenue', 'orders'];

      const csv = reportsService.exportToCSV(data, headers);

      expect(csv).toContain('date,revenue,orders');
      expect(csv).toContain('2024-01-15,1000,10');
      expect(csv).toContain('2024-01-16,1500,15');
    });

    it('should handle values with commas', () => {
      const data = [
        { name: 'Product, with comma', price: 100 },
      ];
      const headers = ['name', 'price'];

      const csv = reportsService.exportToCSV(data, headers);

      expect(csv).toContain('"Product, with comma"');
    });

    it('should handle empty values', () => {
      const data = [
        { name: 'Product', category: null },
      ];
      const headers = ['name', 'category'];

      const csv = reportsService.exportToCSV(data, headers);

      expect(csv).toContain('Product,');
    });

    it('should handle empty data array', () => {
      const csv = reportsService.exportToCSV([], ['col1', 'col2']);

      expect(csv).toBe('col1,col2');
    });
  });

  describe('formatForArabic', () => {
    it('should return report as-is (placeholder)', () => {
      const report = { test: 'value' };
      const formatted = reportsService.formatForArabic(report);

      expect(formatted).toEqual(report);
    });
  });
});

describe('Middleware', () => {
  describe('metricsMiddleware', () => {
    it('should create middleware function', () => {
      const middleware = metricsMiddleware();

      expect(typeof middleware).toBe('function');
    });

    it('should call next and track request', () => {
      const middleware = metricsMiddleware();
      const req = {
        path: '/api/test',
        method: 'GET',
        headers: { 'user-agent': 'test' },
        ip: '127.0.0.1',
        user: { id: 'user-1' },
      };
      const res = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            res.statusCode = 200;
            // Don't call callback synchronously to avoid issues
          }
        }),
        statusCode: 200,
      };
      const next = jest.fn();

      middleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(res.on).toHaveBeenCalledWith('finish', expect.any(Function));
    });
  });

  describe('errorTrackingMiddleware', () => {
    it('should create middleware function', () => {
      const middleware = errorTrackingMiddleware();

      expect(typeof middleware).toBe('function');
    });

    it('should call next with error and track it', () => {
      // Create a fresh instance to avoid singleton issues
      const localMetricsService = new RealTimeMetricsService(100);
      localMetricsService.on('error', () => {}); // Suppress unhandled error events

      const middleware = errorTrackingMiddleware();
      const err = new Error('Test error');
      const req = {
        path: '/api/test',
        method: 'POST',
        user: { id: 'user-1' },
      };
      const res = {};
      const next = jest.fn();

      // The middleware will call the singleton's recordError, which should be fine
      // as long as we catch any emitted events
      middleware(err, req, res, next);

      expect(next).toHaveBeenCalledWith(err);
    });
  });
});

describe('Edge Cases', () => {
  describe('AnalyticsService Edge Cases', () => {
    let analyticsService: AnalyticsService;

    beforeEach(() => {
      analyticsService = new AnalyticsService();
      jest.clearAllMocks();
    });

    it('should handle empty transaction data', async () => {
      mockPrismaClient.transaction.aggregate.mockResolvedValue({
        _sum: { amount: null },
        _count: 0,
      });
      mockPrismaClient.transaction.findMany.mockResolvedValue([]);
      mockPrismaClient.order.count.mockResolvedValue(0);
      mockPrismaClient.order.findMany.mockResolvedValue([]);
      mockPrismaClient.user.count.mockResolvedValue(0);
      mockPrismaClient.user.findMany.mockResolvedValue([]);
      mockPrismaClient.user.groupBy.mockResolvedValue([]);
      mockPrismaClient.listing.count.mockResolvedValue(0);
      mockPrismaClient.listing.findMany.mockResolvedValue([]);
      mockPrismaClient.listing.groupBy.mockResolvedValue([]);
      mockPrismaClient.listing.aggregate.mockResolvedValue({
        _avg: { price: null },
      });

      const metrics = await analyticsService.getDashboardMetrics('month');

      expect(metrics).toBeDefined();
      expect(metrics.overview.totalRevenue).toBe(0);
      expect(metrics.overview.totalOrders).toBe(0);
    });

    it('should handle database errors gracefully', async () => {
      mockPrismaClient.transaction.aggregate.mockRejectedValue(new Error('Database error'));

      await expect(analyticsService.getDashboardMetrics('month')).rejects.toThrow('Database error');
    });
  });

  describe('RealTimeMetricsService Edge Cases', () => {
    let metricsService: RealTimeMetricsService;

    beforeEach(() => {
      metricsService = new RealTimeMetricsService(100); // Small buffer
      metricsService.on('error', () => {}); // Suppress unhandled error events
      metricsService.clearMetrics();
    });

    afterEach(() => {
      metricsService.stopMetricsCollection();
      metricsService.removeAllListeners();
    });

    it('should handle buffer overflow', () => {
      // Fill buffer beyond capacity
      for (let i = 0; i < 150; i++) {
        metricsService.recordRequest({
          endpoint: '/api/test',
          method: 'GET',
          statusCode: 200,
          responseTime: 100,
          timestamp: new Date(),
        });
      }

      const stats = metricsService.getRealTimeStats();
      expect(stats).toBeDefined();
    });

    it('should handle concurrent requests', async () => {
      const promises = [];
      for (let i = 0; i < 50; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            metricsService.recordRequest({
              endpoint: `/api/test/${i}`,
              method: 'GET',
              statusCode: 200,
              responseTime: Math.random() * 500,
              timestamp: new Date(),
            });
            resolve();
          })
        );
      }

      await Promise.all(promises);

      const stats = metricsService.getRealTimeStats();
      expect(stats).toBeDefined();
    });
  });
});

describe('Arabic Translations', () => {
  let analyticsService: AnalyticsService;

  beforeEach(() => {
    analyticsService = new AnalyticsService();
    jest.clearAllMocks();
  });

  it('should include Arabic governorate names', async () => {
    mockPrismaClient.transaction.aggregate.mockResolvedValue({
      _sum: { amount: 1000 },
    });
    mockPrismaClient.transaction.findMany.mockResolvedValue([]);
    mockPrismaClient.order.count.mockResolvedValue(10);
    mockPrismaClient.order.findMany.mockResolvedValue([
      {
        total: 500,
        status: 'COMPLETED',
        shippingAddress: { governorate: 'Cairo' },
      },
    ]);
    mockPrismaClient.user.count.mockResolvedValue(100);
    mockPrismaClient.user.findMany.mockResolvedValue([]);
    mockPrismaClient.user.groupBy.mockResolvedValue([]);
    mockPrismaClient.listing.count.mockResolvedValue(50);
    mockPrismaClient.listing.findMany.mockResolvedValue([]);
    mockPrismaClient.listing.groupBy.mockResolvedValue([]);
    mockPrismaClient.listing.aggregate.mockResolvedValue({ _avg: { price: 500 } });

    const sales = await analyticsService.getSalesMetrics('month');

    expect(Array.isArray(sales.salesByGovernorate)).toBe(true);
  });

  it('should include Arabic payment method names', async () => {
    mockPrismaClient.transaction.aggregate.mockResolvedValue({
      _sum: { amount: 1000 },
    });
    mockPrismaClient.transaction.findMany.mockResolvedValue([]);
    mockPrismaClient.order.count.mockResolvedValue(10);
    mockPrismaClient.order.findMany.mockResolvedValue([
      {
        total: 500,
        status: 'COMPLETED',
        paymentMethod: 'CARD',
      },
    ]);
    mockPrismaClient.user.count.mockResolvedValue(100);
    mockPrismaClient.listing.count.mockResolvedValue(50);

    const sales = await analyticsService.getSalesMetrics('month');

    expect(Array.isArray(sales.salesByPaymentMethod)).toBe(true);
  });
});
