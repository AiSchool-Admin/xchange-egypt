/**
 * Core Analytics Service
 * خدمة التحليلات الأساسية
 *
 * Provides comprehensive analytics for the Xchange Egypt platform
 * including real-time metrics, historical data, and insights
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Time period types
export type TimePeriod = 'today' | 'yesterday' | 'week' | 'month' | 'quarter' | 'year' | 'all';

// Dashboard metrics interface
export interface DashboardMetrics {
  overview: OverviewMetrics;
  sales: SalesMetrics;
  users: UserMetrics;
  listings: ListingMetrics;
  performance: PerformanceMetrics;
}

export interface OverviewMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalOrders: number;
  ordersChange: number;
  totalUsers: number;
  usersChange: number;
  activeListings: number;
  listingsChange: number;
  conversionRate: number;
  averageOrderValue: number;
}

export interface SalesMetrics {
  totalSales: number;
  salesByDay: DailySales[];
  salesByCategory: CategorySales[];
  salesByGovernorate: GovernorateSales[];
  salesByPaymentMethod: PaymentMethodSales[];
  topSellingItems: TopItem[];
  revenueByType: RevenueByType[];
}

export interface DailySales {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
}

export interface CategorySales {
  categoryId: string;
  categoryName: string;
  categoryNameAr: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface GovernorateSales {
  governorate: string;
  governorateAr: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface PaymentMethodSales {
  method: string;
  methodAr: string;
  revenue: number;
  orders: number;
  percentage: number;
}

export interface TopItem {
  itemId: string;
  title: string;
  sales: number;
  revenue: number;
  category: string;
}

export interface RevenueByType {
  type: string;
  typeAr: string;
  revenue: number;
  count: number;
  percentage: number;
}

export interface UserMetrics {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  usersByType: UsersByType[];
  usersByGovernorate: UsersByGovernorate[];
  userRetention: RetentionData;
  userGrowth: GrowthData[];
  topSellers: TopSeller[];
  topBuyers: TopBuyer[];
}

export interface UsersByType {
  type: string;
  typeAr: string;
  count: number;
  percentage: number;
}

export interface UsersByGovernorate {
  governorate: string;
  governorateAr: string;
  count: number;
  percentage: number;
}

export interface RetentionData {
  day1: number;
  day7: number;
  day30: number;
  day90: number;
}

export interface GrowthData {
  date: string;
  newUsers: number;
  totalUsers: number;
  growthRate: number;
}

export interface TopSeller {
  userId: string;
  name: string;
  totalSales: number;
  revenue: number;
  itemsSold: number;
  rating: number;
}

export interface TopBuyer {
  userId: string;
  name: string;
  totalPurchases: number;
  spent: number;
  orderCount: number;
}

export interface ListingMetrics {
  totalListings: number;
  activeListings: number;
  pendingListings: number;
  soldListings: number;
  listingsByCategory: ListingsByCategory[];
  listingsByStatus: ListingsByStatus[];
  averageListingPrice: number;
  averageTimeToSell: number;
  listingConversionRate: number;
}

export interface ListingsByCategory {
  categoryId: string;
  categoryName: string;
  categoryNameAr: string;
  count: number;
  percentage: number;
  averagePrice: number;
}

export interface ListingsByStatus {
  status: string;
  statusAr: string;
  count: number;
  percentage: number;
}

export interface PerformanceMetrics {
  apiResponseTime: number;
  errorRate: number;
  uptime: number;
  requestsPerMinute: number;
  peakHours: PeakHour[];
  slowestEndpoints: SlowEndpoint[];
}

export interface PeakHour {
  hour: number;
  requests: number;
  averageResponseTime: number;
}

export interface SlowEndpoint {
  endpoint: string;
  averageTime: number;
  callCount: number;
}

// Governorate translations
const GOVERNORATE_AR: Record<string, string> = {
  Cairo: 'القاهرة',
  Giza: 'الجيزة',
  Alexandria: 'الإسكندرية',
  Dakahlia: 'الدقهلية',
  Sharqia: 'الشرقية',
  Qalyubia: 'القليوبية',
  'Kafr El Sheikh': 'كفر الشيخ',
  Gharbia: 'الغربية',
  Monufia: 'المنوفية',
  Beheira: 'البحيرة',
  Ismailia: 'الإسماعيلية',
  Suez: 'السويس',
  'Port Said': 'بورسعيد',
  Damietta: 'دمياط',
  Fayoum: 'الفيوم',
  'Beni Suef': 'بني سويف',
  Minya: 'المنيا',
  Asyut: 'أسيوط',
  Sohag: 'سوهاج',
  Qena: 'قنا',
  Luxor: 'الأقصر',
  Aswan: 'أسوان',
  'Red Sea': 'البحر الأحمر',
  'New Valley': 'الوادي الجديد',
  Matruh: 'مطروح',
  'North Sinai': 'شمال سيناء',
  'South Sinai': 'جنوب سيناء',
};

// Payment method translations
const PAYMENT_METHOD_AR: Record<string, string> = {
  CARD: 'بطاقة ائتمان',
  FAWRY: 'فوري',
  VODAFONE_CASH: 'فودافون كاش',
  INSTAPAY: 'إنستاباي',
  COD: 'الدفع عند الاستلام',
  WALLET: 'محفظة إكسشينج',
  PAYMOB: 'باي موب',
};

// User type translations
const USER_TYPE_AR: Record<string, string> = {
  INDIVIDUAL: 'فرد',
  BUSINESS: 'تاجر',
  GOLD_DEALER: 'تاجر ذهب',
  VERIFIED_SELLER: 'بائع موثق',
};

// Transaction type translations
const TRANSACTION_TYPE_AR: Record<string, string> = {
  DIRECT_SALE: 'بيع مباشر',
  AUCTION: 'مزاد',
  BARTER: 'مقايضة',
  GOLD_TRADE: 'تجارة ذهب',
};

// Listing status translations
const LISTING_STATUS_AR: Record<string, string> = {
  ACTIVE: 'نشط',
  PENDING: 'قيد المراجعة',
  SOLD: 'مباع',
  EXPIRED: 'منتهي',
  CANCELLED: 'ملغي',
  DRAFT: 'مسودة',
};

export class AnalyticsService {
  /**
   * Get date range based on period
   */
  private getDateRange(period: TimePeriod): { start: Date; end: Date } {
    const end = new Date();
    let start = new Date();

    switch (period) {
      case 'today':
        start.setHours(0, 0, 0, 0);
        break;
      case 'yesterday':
        start.setDate(start.getDate() - 1);
        start.setHours(0, 0, 0, 0);
        end.setDate(end.getDate() - 1);
        end.setHours(23, 59, 59, 999);
        break;
      case 'week':
        start.setDate(start.getDate() - 7);
        break;
      case 'month':
        start.setMonth(start.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(start.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(start.getFullYear() - 1);
        break;
      case 'all':
        start = new Date(0);
        break;
    }

    return { start, end };
  }

  /**
   * Get previous period for comparison
   */
  private getPreviousPeriod(period: TimePeriod): { start: Date; end: Date } {
    const { start, end } = this.getDateRange(period);
    const duration = end.getTime() - start.getTime();

    return {
      start: new Date(start.getTime() - duration),
      end: new Date(end.getTime() - duration),
    };
  }

  /**
   * Calculate percentage change
   */
  private calculateChange(current: number, previous: number): number {
    if (previous === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - previous) / previous) * 100 * 100) / 100;
  }

  /**
   * Get complete dashboard metrics
   * الحصول على مقاييس لوحة التحكم الكاملة
   */
  async getDashboardMetrics(period: TimePeriod = 'month'): Promise<DashboardMetrics> {
    const [overview, sales, users, listings, performance] = await Promise.all([
      this.getOverviewMetrics(period),
      this.getSalesMetrics(period),
      this.getUserMetrics(period),
      this.getListingMetrics(period),
      this.getPerformanceMetrics(period),
    ]);

    return {
      overview,
      sales,
      users,
      listings,
      performance,
    };
  }

  /**
   * Get overview metrics
   * مقاييس النظرة العامة
   */
  async getOverviewMetrics(period: TimePeriod = 'month'): Promise<OverviewMetrics> {
    const { start, end } = this.getDateRange(period);
    const previous = this.getPreviousPeriod(period);

    // Current period metrics
    const [currentRevenue, currentOrders, currentUsers, currentListings] = await Promise.all([
      this.getTotalRevenue(start, end),
      this.getTotalOrders(start, end),
      this.getTotalUsers(start, end),
      this.getActiveListings(),
    ]);

    // Previous period metrics for comparison
    const [previousRevenue, previousOrders, previousUsers, previousListings] = await Promise.all([
      this.getTotalRevenue(previous.start, previous.end),
      this.getTotalOrders(previous.start, previous.end),
      this.getTotalUsers(previous.start, previous.end),
      this.getActiveListingsAt(previous.end),
    ]);

    // Calculate conversion rate (orders / unique visitors)
    const conversionRate = await this.getConversionRate(start, end);

    // Average order value
    const averageOrderValue = currentOrders > 0 ? currentRevenue / currentOrders : 0;

    return {
      totalRevenue: currentRevenue,
      revenueChange: this.calculateChange(currentRevenue, previousRevenue),
      totalOrders: currentOrders,
      ordersChange: this.calculateChange(currentOrders, previousOrders),
      totalUsers: currentUsers,
      usersChange: this.calculateChange(currentUsers, previousUsers),
      activeListings: currentListings,
      listingsChange: this.calculateChange(currentListings, previousListings),
      conversionRate: Math.round(conversionRate * 100) / 100,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
    };
  }

  /**
   * Get sales metrics
   * مقاييس المبيعات
   */
  async getSalesMetrics(period: TimePeriod = 'month'): Promise<SalesMetrics> {
    const { start, end } = this.getDateRange(period);

    const [
      totalSales,
      salesByDay,
      salesByCategory,
      salesByGovernorate,
      salesByPaymentMethod,
      topSellingItems,
      revenueByType,
    ] = await Promise.all([
      this.getTotalRevenue(start, end),
      this.getSalesByDay(start, end),
      this.getSalesByCategory(start, end),
      this.getSalesByGovernorate(start, end),
      this.getSalesByPaymentMethod(start, end),
      this.getTopSellingItems(start, end, 10),
      this.getRevenueByType(start, end),
    ]);

    return {
      totalSales,
      salesByDay,
      salesByCategory,
      salesByGovernorate,
      salesByPaymentMethod,
      topSellingItems,
      revenueByType,
    };
  }

  /**
   * Get user metrics
   * مقاييس المستخدمين
   */
  async getUserMetrics(period: TimePeriod = 'month'): Promise<UserMetrics> {
    const { start, end } = this.getDateRange(period);

    const [
      totalUsers,
      newUsers,
      activeUsers,
      usersByType,
      usersByGovernorate,
      userRetention,
      userGrowth,
      topSellers,
      topBuyers,
    ] = await Promise.all([
      this.getTotalUsersCount(),
      this.getNewUsers(start, end),
      this.getActiveUsers(start, end),
      this.getUsersByType(),
      this.getUsersByGovernorate(),
      this.getUserRetention(),
      this.getUserGrowth(start, end),
      this.getTopSellers(start, end, 10),
      this.getTopBuyers(start, end, 10),
    ]);

    return {
      totalUsers,
      newUsers,
      activeUsers,
      usersByType,
      usersByGovernorate,
      userRetention,
      userGrowth,
      topSellers,
      topBuyers,
    };
  }

  /**
   * Get listing metrics
   * مقاييس الإعلانات
   */
  async getListingMetrics(period: TimePeriod = 'month'): Promise<ListingMetrics> {
    const { start, end } = this.getDateRange(period);

    const [
      totalListings,
      activeListings,
      pendingListings,
      soldListings,
      listingsByCategory,
      listingsByStatus,
      averageListingPrice,
      averageTimeToSell,
      listingConversionRate,
    ] = await Promise.all([
      this.getTotalListings(),
      this.getActiveListings(),
      this.getPendingListings(),
      this.getSoldListings(start, end),
      this.getListingsByCategory(),
      this.getListingsByStatus(),
      this.getAverageListingPrice(),
      this.getAverageTimeToSell(start, end),
      this.getListingConversionRate(start, end),
    ]);

    return {
      totalListings,
      activeListings,
      pendingListings,
      soldListings,
      listingsByCategory,
      listingsByStatus,
      averageListingPrice,
      averageTimeToSell,
      listingConversionRate,
    };
  }

  /**
   * Get performance metrics
   * مقاييس الأداء
   */
  async getPerformanceMetrics(_period: TimePeriod = 'month'): Promise<PerformanceMetrics> {
    // These would typically come from a monitoring service like Prometheus/Grafana
    // For now, we'll return mock data structure
    return {
      apiResponseTime: 125, // ms
      errorRate: 0.5, // percentage
      uptime: 99.9, // percentage
      requestsPerMinute: 150,
      peakHours: this.getPeakHours(),
      slowestEndpoints: this.getSlowestEndpoints(),
    };
  }

  // ==========================================
  // Helper Methods
  // ==========================================

  private async getTotalRevenue(start: Date, end: Date): Promise<number> {
    const result = await prisma.transaction.aggregate({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      _sum: { amount: true },
    });
    return result._sum.amount || 0;
  }

  private async getTotalOrders(start: Date, end: Date): Promise<number> {
    return prisma.order.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });
  }

  private async getTotalUsers(start: Date, end: Date): Promise<number> {
    return prisma.user.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });
  }

  private async getTotalUsersCount(): Promise<number> {
    return prisma.user.count();
  }

  private async getActiveListings(): Promise<number> {
    return prisma.listing.count({
      where: { status: 'ACTIVE' },
    });
  }

  private async getActiveListingsAt(_date: Date): Promise<number> {
    // This would need historical data tracking
    // For now, return current active listings
    return this.getActiveListings();
  }

  private async getConversionRate(_start: Date, _end: Date): Promise<number> {
    // Conversion rate = orders / unique visitors
    // Would need session/visitor tracking
    return 3.5; // Mock value
  }

  private async getSalesByDay(start: Date, end: Date): Promise<DailySales[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    const dailyMap = new Map<string, { revenue: number; orders: number }>();

    transactions.forEach((t) => {
      const date = t.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { revenue: 0, orders: 0 };
      dailyMap.set(date, {
        revenue: existing.revenue + (t.amount || 0),
        orders: existing.orders + 1,
      });
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
        averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getSalesByCategory(start: Date, end: Date): Promise<CategorySales[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      include: {
        item: {
          include: {
            category: true,
          },
        },
      },
    });

    const categoryMap = new Map<string, { name: string; nameAr: string; revenue: number; orders: number }>();
    let totalRevenue = 0;

    transactions.forEach((t) => {
      if (t.item?.category) {
        const catId = t.item.category.id;
        const existing = categoryMap.get(catId) || {
          name: t.item.category.name,
          nameAr: t.item.category.nameAr || t.item.category.name,
          revenue: 0,
          orders: 0,
        };
        categoryMap.set(catId, {
          ...existing,
          revenue: existing.revenue + (t.amount || 0),
          orders: existing.orders + 1,
        });
        totalRevenue += t.amount || 0;
      }
    });

    return Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        categoryNameAr: data.nameAr,
        revenue: data.revenue,
        orders: data.orders,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private async getSalesByGovernorate(start: Date, end: Date): Promise<GovernorateSales[]> {
    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      include: {
        shippingAddress: true,
      },
    });

    const govMap = new Map<string, { revenue: number; orders: number }>();
    let totalRevenue = 0;

    orders.forEach((o) => {
      const gov = o.shippingAddress?.governorate || 'Unknown';
      const existing = govMap.get(gov) || { revenue: 0, orders: 0 };
      govMap.set(gov, {
        revenue: existing.revenue + (o.total || 0),
        orders: existing.orders + 1,
      });
      totalRevenue += o.total || 0;
    });

    return Array.from(govMap.entries())
      .map(([governorate, data]) => ({
        governorate,
        governorateAr: GOVERNORATE_AR[governorate] || governorate,
        revenue: data.revenue,
        orders: data.orders,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private async getSalesByPaymentMethod(start: Date, end: Date): Promise<PaymentMethodSales[]> {
    const orders = await prisma.order.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      select: {
        total: true,
        paymentMethod: true,
      },
    });

    const methodMap = new Map<string, { revenue: number; orders: number }>();
    let totalRevenue = 0;

    orders.forEach((o) => {
      const method = o.paymentMethod || 'UNKNOWN';
      const existing = methodMap.get(method) || { revenue: 0, orders: 0 };
      methodMap.set(method, {
        revenue: existing.revenue + (o.total || 0),
        orders: existing.orders + 1,
      });
      totalRevenue += o.total || 0;
    });

    return Array.from(methodMap.entries())
      .map(([method, data]) => ({
        method,
        methodAr: PAYMENT_METHOD_AR[method] || method,
        revenue: data.revenue,
        orders: data.orders,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private async getTopSellingItems(start: Date, end: Date, limit: number): Promise<TopItem[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      include: {
        item: {
          include: {
            category: true,
          },
        },
      },
    });

    const itemMap = new Map<string, { title: string; sales: number; revenue: number; category: string }>();

    transactions.forEach((t) => {
      if (t.item) {
        const itemId = t.item.id;
        const existing = itemMap.get(itemId) || {
          title: t.item.title,
          sales: 0,
          revenue: 0,
          category: t.item.category?.name || 'Unknown',
        };
        itemMap.set(itemId, {
          ...existing,
          sales: existing.sales + 1,
          revenue: existing.revenue + (t.amount || 0),
        });
      }
    });

    return Array.from(itemMap.entries())
      .map(([itemId, data]) => ({
        itemId,
        title: data.title,
        sales: data.sales,
        revenue: data.revenue,
        category: data.category,
      }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, limit);
  }

  private async getRevenueByType(start: Date, end: Date): Promise<RevenueByType[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      select: {
        amount: true,
        type: true,
      },
    });

    const typeMap = new Map<string, { revenue: number; count: number }>();
    let totalRevenue = 0;

    transactions.forEach((t) => {
      const type = t.type || 'DIRECT_SALE';
      const existing = typeMap.get(type) || { revenue: 0, count: 0 };
      typeMap.set(type, {
        revenue: existing.revenue + (t.amount || 0),
        count: existing.count + 1,
      });
      totalRevenue += t.amount || 0;
    });

    return Array.from(typeMap.entries())
      .map(([type, data]) => ({
        type,
        typeAr: TRANSACTION_TYPE_AR[type] || type,
        revenue: data.revenue,
        count: data.count,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private async getNewUsers(start: Date, end: Date): Promise<number> {
    return prisma.user.count({
      where: {
        createdAt: { gte: start, lte: end },
      },
    });
  }

  private async getActiveUsers(start: Date, end: Date): Promise<number> {
    return prisma.user.count({
      where: {
        lastLoginAt: { gte: start, lte: end },
      },
    });
  }

  private async getUsersByType(): Promise<UsersByType[]> {
    const users = await prisma.user.groupBy({
      by: ['userType'],
      _count: true,
    });

    const total = users.reduce((sum, u) => sum + u._count, 0);

    return users.map((u) => ({
      type: u.userType,
      typeAr: USER_TYPE_AR[u.userType] || u.userType,
      count: u._count,
      percentage: total > 0 ? (u._count / total) * 100 : 0,
    }));
  }

  private async getUsersByGovernorate(): Promise<UsersByGovernorate[]> {
    const users = await prisma.user.groupBy({
      by: ['governorate'],
      _count: true,
    });

    const total = users.reduce((sum, u) => sum + u._count, 0);

    return users
      .filter((u) => u.governorate)
      .map((u) => ({
        governorate: u.governorate!,
        governorateAr: GOVERNORATE_AR[u.governorate!] || u.governorate!,
        count: u._count,
        percentage: total > 0 ? (u._count / total) * 100 : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private async getUserRetention(): Promise<RetentionData> {
    // Calculate retention rates based on user activity
    const now = new Date();
    const day1 = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const day7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const day30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const day90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);

    const [total, active1, active7, active30, active90] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { lastLoginAt: { gte: day1 } } }),
      prisma.user.count({ where: { lastLoginAt: { gte: day7 } } }),
      prisma.user.count({ where: { lastLoginAt: { gte: day30 } } }),
      prisma.user.count({ where: { lastLoginAt: { gte: day90 } } }),
    ]);

    return {
      day1: total > 0 ? (active1 / total) * 100 : 0,
      day7: total > 0 ? (active7 / total) * 100 : 0,
      day30: total > 0 ? (active30 / total) * 100 : 0,
      day90: total > 0 ? (active90 / total) * 100 : 0,
    };
  }

  private async getUserGrowth(start: Date, end: Date): Promise<GrowthData[]> {
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: start, lte: end },
      },
      select: {
        createdAt: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    const dailyMap = new Map<string, number>();
    users.forEach((u) => {
      const date = u.createdAt.toISOString().split('T')[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    });

    let runningTotal = await prisma.user.count({
      where: { createdAt: { lt: start } },
    });

    const result: GrowthData[] = [];
    let previousTotal = runningTotal;

    Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .forEach(([date, newUsers]) => {
        runningTotal += newUsers;
        const growthRate = previousTotal > 0 ? ((runningTotal - previousTotal) / previousTotal) * 100 : 0;
        result.push({
          date,
          newUsers,
          totalUsers: runningTotal,
          growthRate: Math.round(growthRate * 100) / 100,
        });
        previousTotal = runningTotal;
      });

    return result;
  }

  private async getTopSellers(start: Date, end: Date, limit: number): Promise<TopSeller[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      include: {
        seller: true,
      },
    });

    const sellerMap = new Map<string, { name: string; sales: number; revenue: number; items: Set<string> }>();

    transactions.forEach((t) => {
      if (t.seller) {
        const sellerId = t.seller.id;
        const existing = sellerMap.get(sellerId) || {
          name: t.seller.fullName || t.seller.email,
          sales: 0,
          revenue: 0,
          items: new Set<string>(),
        };
        existing.sales++;
        existing.revenue += t.amount || 0;
        if (t.itemId) existing.items.add(t.itemId);
        sellerMap.set(sellerId, existing);
      }
    });

    return Array.from(sellerMap.entries())
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        totalSales: data.sales,
        revenue: data.revenue,
        itemsSold: data.items.size,
        rating: 4.5, // Would come from reviews
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  private async getTopBuyers(start: Date, end: Date, limit: number): Promise<TopBuyer[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end },
      },
      include: {
        buyer: true,
      },
    });

    const buyerMap = new Map<string, { name: string; purchases: number; spent: number }>();

    transactions.forEach((t) => {
      if (t.buyer) {
        const buyerId = t.buyer.id;
        const existing = buyerMap.get(buyerId) || {
          name: t.buyer.fullName || t.buyer.email,
          purchases: 0,
          spent: 0,
        };
        existing.purchases++;
        existing.spent += t.amount || 0;
        buyerMap.set(buyerId, existing);
      }
    });

    return Array.from(buyerMap.entries())
      .map(([userId, data]) => ({
        userId,
        name: data.name,
        totalPurchases: data.purchases,
        spent: data.spent,
        orderCount: data.purchases,
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, limit);
  }

  private async getTotalListings(): Promise<number> {
    return prisma.listing.count();
  }

  private async getPendingListings(): Promise<number> {
    return prisma.listing.count({
      where: { status: 'PENDING' },
    });
  }

  private async getSoldListings(start: Date, end: Date): Promise<number> {
    return prisma.listing.count({
      where: {
        status: 'SOLD',
        updatedAt: { gte: start, lte: end },
      },
    });
  }

  private async getListingsByCategory(): Promise<ListingsByCategory[]> {
    const listings = await prisma.listing.findMany({
      include: {
        item: {
          include: {
            category: true,
          },
        },
      },
    });

    const categoryMap = new Map<string, { name: string; nameAr: string; count: number; totalPrice: number }>();
    let totalListings = listings.length;

    listings.forEach((l) => {
      if (l.item?.category) {
        const catId = l.item.category.id;
        const existing = categoryMap.get(catId) || {
          name: l.item.category.name,
          nameAr: l.item.category.nameAr || l.item.category.name,
          count: 0,
          totalPrice: 0,
        };
        categoryMap.set(catId, {
          ...existing,
          count: existing.count + 1,
          totalPrice: existing.totalPrice + (l.price || 0),
        });
      }
    });

    return Array.from(categoryMap.entries())
      .map(([categoryId, data]) => ({
        categoryId,
        categoryName: data.name,
        categoryNameAr: data.nameAr,
        count: data.count,
        percentage: totalListings > 0 ? (data.count / totalListings) * 100 : 0,
        averagePrice: data.count > 0 ? data.totalPrice / data.count : 0,
      }))
      .sort((a, b) => b.count - a.count);
  }

  private async getListingsByStatus(): Promise<ListingsByStatus[]> {
    const listings = await prisma.listing.groupBy({
      by: ['status'],
      _count: true,
    });

    const total = listings.reduce((sum, l) => sum + l._count, 0);

    return listings.map((l) => ({
      status: l.status,
      statusAr: LISTING_STATUS_AR[l.status] || l.status,
      count: l._count,
      percentage: total > 0 ? (l._count / total) * 100 : 0,
    }));
  }

  private async getAverageListingPrice(): Promise<number> {
    const result = await prisma.listing.aggregate({
      where: { status: 'ACTIVE' },
      _avg: { price: true },
    });
    return result._avg.price || 0;
  }

  private async getAverageTimeToSell(_start: Date, _end: Date): Promise<number> {
    // Calculate average days from listing creation to sale
    // Would need to track this in the database
    return 7; // Mock value: 7 days average
  }

  private async getListingConversionRate(_start: Date, _end: Date): Promise<number> {
    // Listings that resulted in sales / total listings
    const [total, sold] = await Promise.all([
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'SOLD' } }),
    ]);

    return total > 0 ? (sold / total) * 100 : 0;
  }

  private getPeakHours(): PeakHour[] {
    // Would come from request logging
    return [
      { hour: 10, requests: 450, averageResponseTime: 120 },
      { hour: 14, requests: 520, averageResponseTime: 135 },
      { hour: 20, requests: 680, averageResponseTime: 145 },
      { hour: 21, requests: 720, averageResponseTime: 150 },
      { hour: 22, requests: 650, averageResponseTime: 140 },
    ];
  }

  private getSlowestEndpoints(): SlowEndpoint[] {
    // Would come from APM monitoring
    return [
      { endpoint: '/api/v1/search', averageTime: 350, callCount: 15000 },
      { endpoint: '/api/v1/listings', averageTime: 250, callCount: 25000 },
      { endpoint: '/api/v1/categories', averageTime: 180, callCount: 10000 },
    ];
  }
}

// Singleton instance
export const analyticsService = new AnalyticsService();
