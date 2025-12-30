/**
 * Reports Service
 * خدمة التقارير
 *
 * Features:
 * - Sales reports (daily, weekly, monthly)
 * - User activity reports
 * - Financial reports
 * - Export to CSV/Excel/PDF
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Report types
export type ReportFormat = 'json' | 'csv' | 'excel';
export type ReportPeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | 'custom';

// Report interfaces
export interface ReportOptions {
  startDate: Date;
  endDate: Date;
  period: ReportPeriod;
  format: ReportFormat;
  filters?: ReportFilters;
}

export interface ReportFilters {
  categories?: string[];
  governorates?: string[];
  paymentMethods?: string[];
  userTypes?: string[];
  minAmount?: number;
  maxAmount?: number;
}

export interface SalesReport {
  summary: SalesReportSummary;
  dailyBreakdown: DailySalesBreakdown[];
  categoryBreakdown: CategoryBreakdown[];
  governorateBreakdown: GovernorateBreakdown[];
  paymentMethodBreakdown: PaymentMethodBreakdown[];
  topProducts: TopProduct[];
  generatedAt: Date;
  period: { start: Date; end: Date };
}

export interface SalesReportSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  totalCommission: number;
  netRevenue: number;
  refunds: number;
  refundAmount: number;
  conversionRate: number;
  newCustomers: number;
  returningCustomers: number;
}

export interface DailySalesBreakdown {
  date: string;
  revenue: number;
  orders: number;
  averageOrderValue: number;
  commission: number;
  refunds: number;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryNameAr: string;
  revenue: number;
  orders: number;
  percentage: number;
  averagePrice: number;
  topProduct: string;
}

export interface GovernorateBreakdown {
  governorate: string;
  governorateAr: string;
  revenue: number;
  orders: number;
  percentage: number;
  averageOrderValue: number;
  shippingCosts: number;
}

export interface PaymentMethodBreakdown {
  method: string;
  methodAr: string;
  revenue: number;
  orders: number;
  percentage: number;
  fees: number;
}

export interface TopProduct {
  productId: string;
  title: string;
  category: string;
  unitsSold: number;
  revenue: number;
  averagePrice: number;
}

export interface UserActivityReport {
  summary: UserActivitySummary;
  registrationsByDay: DailyRegistrations[];
  usersByType: UserTypeBreakdown[];
  usersByGovernorate: UserGovernorateBreakdown[];
  topSellers: SellerPerformance[];
  topBuyers: BuyerPerformance[];
  retentionMetrics: RetentionMetrics;
  generatedAt: Date;
  period: { start: Date; end: Date };
}

export interface UserActivitySummary {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  verifiedUsers: number;
  bannedUsers: number;
  averageOrdersPerUser: number;
  averageRevenuePerUser: number;
}

export interface DailyRegistrations {
  date: string;
  registrations: number;
  activations: number;
  churnRate: number;
}

export interface UserTypeBreakdown {
  type: string;
  typeAr: string;
  count: number;
  percentage: number;
  averageRevenue: number;
}

export interface UserGovernorateBreakdown {
  governorate: string;
  governorateAr: string;
  count: number;
  percentage: number;
  averageActivity: number;
}

export interface SellerPerformance {
  sellerId: string;
  sellerName: string;
  totalSales: number;
  revenue: number;
  itemsSold: number;
  rating: number;
  responseTime: number;
}

export interface BuyerPerformance {
  buyerId: string;
  buyerName: string;
  totalPurchases: number;
  spent: number;
  orderCount: number;
  averageOrderValue: number;
}

export interface RetentionMetrics {
  day1: number;
  day7: number;
  day30: number;
  day90: number;
  cohortAnalysis: CohortData[];
}

export interface CohortData {
  cohort: string;
  size: number;
  week1: number;
  week2: number;
  week3: number;
  week4: number;
}

export interface FinancialReport {
  summary: FinancialSummary;
  revenueBySource: RevenueSource[];
  expensesByCategory: ExpenseCategory[];
  commissionBreakdown: CommissionBreakdown[];
  payoutSummary: PayoutSummary;
  taxSummary: TaxSummary;
  generatedAt: Date;
  period: { start: Date; end: Date };
}

export interface FinancialSummary {
  grossRevenue: number;
  netRevenue: number;
  totalCommissions: number;
  totalRefunds: number;
  totalPayouts: number;
  platformProfit: number;
  outstandingPayables: number;
  outstandingReceivables: number;
}

export interface RevenueSource {
  source: string;
  sourceAr: string;
  revenue: number;
  percentage: number;
  transactionCount: number;
}

export interface ExpenseCategory {
  category: string;
  categoryAr: string;
  amount: number;
  percentage: number;
}

export interface CommissionBreakdown {
  type: string;
  typeAr: string;
  amount: number;
  transactionCount: number;
  averageRate: number;
}

export interface PayoutSummary {
  totalPaid: number;
  pendingPayouts: number;
  failedPayouts: number;
  sellerPayouts: number;
  refundPayouts: number;
}

export interface TaxSummary {
  totalTaxCollected: number;
  vatAmount: number;
  withholdingTax: number;
}

// Governorate translations
const GOVERNORATE_AR: Record<string, string> = {
  Cairo: 'القاهرة',
  Giza: 'الجيزة',
  Alexandria: 'الإسكندرية',
  Dakahlia: 'الدقهلية',
  Sharqia: 'الشرقية',
  Qalyubia: 'القليوبية',
  // ... more governorates
};

// Payment method translations
const PAYMENT_METHOD_AR: Record<string, string> = {
  CARD: 'بطاقة ائتمان',
  FAWRY: 'فوري',
  VODAFONE_CASH: 'فودافون كاش',
  INSTAPAY: 'إنستاباي',
  COD: 'الدفع عند الاستلام',
  WALLET: 'محفظة إكسشينج',
};

// User type translations
const USER_TYPE_AR: Record<string, string> = {
  INDIVIDUAL: 'فرد',
  BUSINESS: 'تاجر',
  GOLD_DEALER: 'تاجر ذهب',
  VERIFIED_SELLER: 'بائع موثق',
};

export class ReportsService {
  /**
   * Generate sales report
   * إنشاء تقرير المبيعات
   */
  async generateSalesReport(options: ReportOptions): Promise<SalesReport> {
    const { startDate, endDate, filters } = options;

    const [
      summary,
      dailyBreakdown,
      categoryBreakdown,
      governorateBreakdown,
      paymentMethodBreakdown,
      topProducts,
    ] = await Promise.all([
      this.getSalesReportSummary(startDate, endDate, filters),
      this.getDailySalesBreakdown(startDate, endDate, filters),
      this.getCategoryBreakdown(startDate, endDate, filters),
      this.getGovernorateBreakdown(startDate, endDate, filters),
      this.getPaymentMethodBreakdown(startDate, endDate, filters),
      this.getTopProducts(startDate, endDate, 20, filters),
    ]);

    return {
      summary,
      dailyBreakdown,
      categoryBreakdown,
      governorateBreakdown,
      paymentMethodBreakdown,
      topProducts,
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
    };
  }

  /**
   * Generate user activity report
   * إنشاء تقرير نشاط المستخدمين
   */
  async generateUserActivityReport(options: ReportOptions): Promise<UserActivityReport> {
    const { startDate, endDate, filters } = options;

    const [
      summary,
      registrationsByDay,
      usersByType,
      usersByGovernorate,
      topSellers,
      topBuyers,
      retentionMetrics,
    ] = await Promise.all([
      this.getUserActivitySummary(startDate, endDate),
      this.getDailyRegistrations(startDate, endDate),
      this.getUsersByType(),
      this.getUsersByGovernorate(),
      this.getTopSellers(startDate, endDate, 20),
      this.getTopBuyers(startDate, endDate, 20),
      this.getRetentionMetrics(),
    ]);

    return {
      summary,
      registrationsByDay,
      usersByType,
      usersByGovernorate,
      topSellers,
      topBuyers,
      retentionMetrics,
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
    };
  }

  /**
   * Generate financial report
   * إنشاء التقرير المالي
   */
  async generateFinancialReport(options: ReportOptions): Promise<FinancialReport> {
    const { startDate, endDate } = options;

    const [
      summary,
      revenueBySource,
      commissionBreakdown,
      payoutSummary,
    ] = await Promise.all([
      this.getFinancialSummary(startDate, endDate),
      this.getRevenueBySource(startDate, endDate),
      this.getCommissionBreakdown(startDate, endDate),
      this.getPayoutSummary(startDate, endDate),
    ]);

    return {
      summary,
      revenueBySource,
      expensesByCategory: [], // Would need expense tracking
      commissionBreakdown,
      payoutSummary,
      taxSummary: {
        totalTaxCollected: summary.grossRevenue * 0.14, // 14% VAT
        vatAmount: summary.grossRevenue * 0.14,
        withholdingTax: 0,
      },
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
    };
  }

  /**
   * Export report to CSV format
   * تصدير التقرير بصيغة CSV
   */
  exportToCSV(data: any[], headers: string[]): string {
    const csvRows = [headers.join(',')];

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        if (typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        return value ?? '';
      });
      csvRows.push(values.join(','));
    });

    return csvRows.join('\n');
  }

  /**
   * Format report for Arabic display
   * تنسيق التقرير للعرض بالعربية
   */
  formatForArabic(report: any): any {
    // This would handle RTL formatting and Arabic number formatting
    return report;
  }

  // ==========================================
  // Private Helper Methods
  // ==========================================

  private async getSalesReportSummary(
    startDate: Date,
    endDate: Date,
    _filters?: ReportFilters
  ): Promise<SalesReportSummary> {
    const [orders, transactions, refunds, newCustomers] = await Promise.all([
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { in: ['PAID', 'DELIVERED'] },
        },
      }),
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          paymentStatus: 'COMPLETED',
        },
        _sum: { amount: true },
        _count: true,
      }),
      prisma.transaction.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          paymentStatus: 'REFUNDED',
        },
      }),
      prisma.user.count({
        where: {
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    const totalRevenue = transactions._sum.amount ? Number(transactions._sum.amount) : 0;
    const totalOrders = orders.length;
    // Transaction model doesn't have platformFee - estimate as 5% of revenue
    const totalCommission = totalRevenue * 0.05;
    const refundAmount = refunds.reduce((sum, r) => sum + (r.amount || 0), 0);

    // Get returning customers (users who made more than one order)
    const ordersByUser = orders.reduce((acc, order) => {
      acc[order.userId] = (acc[order.userId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const returningCustomers = Object.values(ordersByUser).filter((count: number) => count > 1).length;

    return {
      totalRevenue,
      totalOrders,
      averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
      totalCommission,
      netRevenue: totalRevenue - refundAmount,
      refunds: refunds.length,
      refundAmount,
      conversionRate: 3.5, // Would need session data
      newCustomers,
      returningCustomers,
    };
  }

  private async getDailySalesBreakdown(
    startDate: Date,
    endDate: Date,
    _filters?: ReportFilters
  ): Promise<DailySalesBreakdown[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        amount: true,
        paymentStatus: true,
        createdAt: true,
      },
    });

    const dailyMap = new Map<string, {
      revenue: number;
      orders: number;
      commission: number;
      refunds: number;
    }>();

    transactions.forEach((t) => {
      const date = t.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(date) || {
        revenue: 0,
        orders: 0,
        commission: 0,
        refunds: 0,
      };

      if (t.paymentStatus === 'COMPLETED') {
        const amount = t.amount || 0;
        dailyMap.set(date, {
          revenue: existing.revenue + amount,
          orders: existing.orders + 1,
          commission: existing.commission + (amount * 0.05), // Estimate 5% commission
          refunds: existing.refunds,
        });
      } else if (t.paymentStatus === 'REFUNDED') {
        dailyMap.set(date, {
          ...existing,
          refunds: existing.refunds + 1,
        });
      }
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        orders: data.orders,
        averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
        commission: data.commission,
        refunds: data.refunds,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getCategoryBreakdown(
    startDate: Date,
    endDate: Date,
    _filters?: ReportFilters
  ): Promise<CategoryBreakdown[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'COMPLETED',
      },
      include: {
        listing: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    const categoryMap = new Map<string, {
      name: string;
      nameAr: string;
      revenue: number;
      orders: number;
      products: Map<string, { title: string; revenue: number }>;
    }>();

    let totalRevenue = 0;

    transactions.forEach((t) => {
      const item = t.listing?.item;
      if (item?.category) {
        const catId = item.category.id;
        const existing = categoryMap.get(catId) || {
          name: item.category.nameEn,
          nameAr: item.category.nameAr || item.category.nameEn,
          revenue: 0,
          orders: 0,
          products: new Map(),
        };

        existing.revenue += t.amount || 0;
        existing.orders++;
        totalRevenue += t.amount || 0;

        // Track top product
        const productKey = item.id;
        const productData = existing.products.get(productKey) || {
          title: item.title,
          revenue: 0,
        };
        productData.revenue += t.amount || 0;
        existing.products.set(productKey, productData);

        categoryMap.set(catId, existing);
      }
    });

    return Array.from(categoryMap.entries())
      .map(([categoryId, data]) => {
        // Find top product
        let topProduct = '';
        let topRevenue = 0;
        data.products.forEach((p) => {
          if (p.revenue > topRevenue) {
            topRevenue = p.revenue;
            topProduct = p.title;
          }
        });

        return {
          categoryId,
          categoryName: data.name,
          categoryNameAr: data.nameAr,
          revenue: data.revenue,
          orders: data.orders,
          percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
          averagePrice: data.orders > 0 ? data.revenue / data.orders : 0,
          topProduct,
        };
      })
      .sort((a, b) => b.revenue - a.revenue);
  }

  private async getGovernorateBreakdown(
    startDate: Date,
    endDate: Date,
    _filters?: ReportFilters
  ): Promise<GovernorateBreakdown[]> {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['PAID', 'DELIVERED'] },
      },
      include: {
        shippingAddress: true,
      },
    });

    const govMap = new Map<string, {
      revenue: number;
      orders: number;
      shippingCosts: number;
    }>();

    let totalRevenue = 0;

    orders.forEach((o) => {
      const gov = o.shippingAddress?.governorate || 'Unknown';
      const existing = govMap.get(gov) || {
        revenue: 0,
        orders: 0,
        shippingCosts: 0,
      };

      govMap.set(gov, {
        revenue: existing.revenue + (o.total || 0),
        orders: existing.orders + 1,
        shippingCosts: existing.shippingCosts + (o.shippingCost || 0),
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
        averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
        shippingCosts: data.shippingCosts,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private async getPaymentMethodBreakdown(
    startDate: Date,
    endDate: Date,
    _filters?: ReportFilters
  ): Promise<PaymentMethodBreakdown[]> {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        status: { in: ['PAID', 'DELIVERED'] },
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

    // Payment method fee rates
    const feeRates: Record<string, number> = {
      CARD: 0.0275,
      FAWRY: 0.025,
      VODAFONE_CASH: 0.01,
      INSTAPAY: 0,
      COD: 0,
      WALLET: 0,
    };

    return Array.from(methodMap.entries())
      .map(([method, data]) => ({
        method,
        methodAr: PAYMENT_METHOD_AR[method] || method,
        revenue: data.revenue,
        orders: data.orders,
        percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
        fees: data.revenue * (feeRates[method] || 0),
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }

  private async getTopProducts(
    startDate: Date,
    endDate: Date,
    limit: number,
    _filters?: ReportFilters
  ): Promise<TopProduct[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'COMPLETED',
      },
      include: {
        listing: {
          include: {
            item: {
              include: {
                category: true,
              },
            },
          },
        },
      },
    });

    const productMap = new Map<string, {
      title: string;
      category: string;
      unitsSold: number;
      revenue: number;
    }>();

    transactions.forEach((t) => {
      const item = t.listing?.item;
      if (item) {
        const productId = item.id;
        const existing = productMap.get(productId) || {
          title: item.title,
          category: item.category?.nameEn || 'Unknown',
          unitsSold: 0,
          revenue: 0,
        };

        productMap.set(productId, {
          ...existing,
          unitsSold: existing.unitsSold + 1,
          revenue: existing.revenue + (t.amount || 0),
        });
      }
    });

    return Array.from(productMap.entries())
      .map(([productId, data]) => ({
        productId,
        title: data.title,
        category: data.category,
        unitsSold: data.unitsSold,
        revenue: data.revenue,
        averagePrice: data.unitsSold > 0 ? data.revenue / data.unitsSold : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  private async getUserActivitySummary(
    startDate: Date,
    endDate: Date
  ): Promise<UserActivitySummary> {
    const [totalUsers, newUsers, activeUsers, verifiedUsers, bannedUsers, orders] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({
        where: { createdAt: { gte: startDate, lte: endDate } },
      }),
      prisma.user.count({
        where: { lastLoginAt: { gte: startDate, lte: endDate } },
      }),
      prisma.user.count({
        where: { emailVerified: true },
      }),
      prisma.user.count({
        where: { status: 'SUSPENDED' },
      }),
      prisma.order.findMany({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          status: { in: ['PAID', 'DELIVERED'] },
        },
      }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const uniqueBuyers = new Set(orders.map((o) => o.userId)).size;

    return {
      totalUsers,
      newUsers,
      activeUsers,
      inactiveUsers: totalUsers - activeUsers,
      verifiedUsers,
      bannedUsers,
      averageOrdersPerUser: uniqueBuyers > 0 ? orders.length / uniqueBuyers : 0,
      averageRevenuePerUser: uniqueBuyers > 0 ? totalRevenue / uniqueBuyers : 0,
    };
  }

  private async getDailyRegistrations(
    startDate: Date,
    endDate: Date
  ): Promise<DailyRegistrations[]> {
    const users = await prisma.user.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
      },
      select: {
        createdAt: true,
        status: true,
      },
    });

    const dailyMap = new Map<string, { registrations: number; activations: number }>();

    users.forEach((u) => {
      const date = u.createdAt.toISOString().split('T')[0];
      const existing = dailyMap.get(date) || { registrations: 0, activations: 0 };

      dailyMap.set(date, {
        registrations: existing.registrations + 1,
        activations: existing.activations + (u.status === 'ACTIVE' ? 1 : 0),
      });
    });

    return Array.from(dailyMap.entries())
      .map(([date, data]) => ({
        date,
        registrations: data.registrations,
        activations: data.activations,
        churnRate: 0, // Would need historical data
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  private async getUsersByType(): Promise<UserTypeBreakdown[]> {
    const users = await prisma.user.groupBy({
      by: ['userType'],
      _count: true,
    });

    const total = users.reduce((sum, u) => sum + u._count, 0);

    // Get average revenue per type
    const revenues = await prisma.transaction.groupBy({
      by: ['sellerId'],
      where: { paymentStatus: 'COMPLETED' },
      _sum: { amount: true },
    });

    return users.map((u) => ({
      type: u.userType,
      typeAr: USER_TYPE_AR[u.userType] || u.userType,
      count: u._count,
      percentage: total > 0 ? (u._count / total) * 100 : 0,
      averageRevenue: 0, // Would need to join with transactions
    }));
  }

  private async getUsersByGovernorate(): Promise<UserGovernorateBreakdown[]> {
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
        averageActivity: 0, // Would need activity tracking
      }))
      .sort((a, b) => b.count - a.count);
  }

  private async getTopSellers(
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<SellerPerformance[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'COMPLETED',
      },
      include: {
        seller: true,
        listing: {
          include: {
            item: true,
          },
        },
      },
    });

    const sellerMap = new Map<string, {
      name: string;
      sales: number;
      revenue: number;
      items: Set<string>;
    }>();

    transactions.forEach((t) => {
      if (t.seller) {
        const sellerId = t.seller.id;
        const existing = sellerMap.get(sellerId) || {
          name: t.seller.fullName || t.seller.email || '',
          sales: 0,
          revenue: 0,
          items: new Set<string>(),
        };

        existing.sales++;
        existing.revenue += t.amount || 0;
        if (t.listing?.item?.id) existing.items.add(t.listing.item.id);

        sellerMap.set(sellerId, existing);
      }
    });

    return Array.from(sellerMap.entries())
      .map(([sellerId, data]) => ({
        sellerId,
        sellerName: data.name,
        totalSales: data.sales,
        revenue: data.revenue,
        itemsSold: data.items.size,
        rating: 4.5,
        responseTime: 2,
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, limit);
  }

  private async getTopBuyers(
    startDate: Date,
    endDate: Date,
    limit: number
  ): Promise<BuyerPerformance[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'COMPLETED',
      },
      include: {
        buyer: true,
      },
    });

    const buyerMap = new Map<string, {
      name: string;
      purchases: number;
      spent: number;
    }>();

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
      .map(([buyerId, data]) => ({
        buyerId,
        buyerName: data.name,
        totalPurchases: data.purchases,
        spent: data.spent,
        orderCount: data.purchases,
        averageOrderValue: data.purchases > 0 ? data.spent / data.purchases : 0,
      }))
      .sort((a, b) => b.spent - a.spent)
      .slice(0, limit);
  }

  private async getRetentionMetrics(): Promise<RetentionMetrics> {
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
      cohortAnalysis: [], // Would need cohort tracking
    };
  }

  private async getFinancialSummary(
    startDate: Date,
    endDate: Date
  ): Promise<FinancialSummary> {
    const [transactions, refunds] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          paymentStatus: 'COMPLETED',
        },
        _sum: { amount: true },
      }),
      prisma.transaction.aggregate({
        where: {
          createdAt: { gte: startDate, lte: endDate },
          paymentStatus: 'REFUNDED',
        },
        _sum: { amount: true },
      }),
    ]);

    const grossRevenue = transactions._sum.amount ? Number(transactions._sum.amount) : 0;
    // Transaction model doesn't have platformFee/sellerReceives - estimate 5% commission
    const totalCommissions = grossRevenue * 0.05;
    const totalRefunds = refunds._sum.amount ? Number(refunds._sum.amount) : 0;
    const totalPayouts = grossRevenue * 0.95; // 95% to sellers

    return {
      grossRevenue,
      netRevenue: grossRevenue - totalRefunds,
      totalCommissions,
      totalRefunds,
      totalPayouts,
      platformProfit: totalCommissions,
      outstandingPayables: 0, // Would need payouts tracking
      outstandingReceivables: 0,
    };
  }

  private async getRevenueBySource(
    startDate: Date,
    endDate: Date
  ): Promise<RevenueSource[]> {
    const transactions = await prisma.transaction.groupBy({
      by: ['transactionType'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'COMPLETED',
      },
      _sum: { amount: true },
      _count: true,
    });

    const totalRevenue = transactions.reduce((sum, t) => sum + (t._sum.amount ? Number(t._sum.amount) : 0), 0);

    const sourceAr: Record<string, string> = {
      DIRECT_SALE: 'بيع مباشر',
      AUCTION: 'مزاد',
      BARTER: 'مقايضة',
      GOLD_TRADE: 'تجارة ذهب',
    };

    return transactions.map((t) => {
      const revenue = t._sum.amount ? Number(t._sum.amount) : 0;
      return {
        source: t.transactionType || 'UNKNOWN',
        sourceAr: sourceAr[t.transactionType || ''] || t.transactionType || 'غير معروف',
        revenue,
        percentage: totalRevenue > 0 ? (revenue / totalRevenue) * 100 : 0,
        transactionCount: t._count,
      };
    });
  }

  private async getCommissionBreakdown(
    startDate: Date,
    endDate: Date
  ): Promise<CommissionBreakdown[]> {
    const transactions = await prisma.transaction.groupBy({
      by: ['transactionType'],
      where: {
        createdAt: { gte: startDate, lte: endDate },
        paymentStatus: 'COMPLETED',
      },
      _sum: { amount: true },
      _count: true,
    });

    const typeAr: Record<string, string> = {
      DIRECT_SALE: 'بيع مباشر',
      AUCTION: 'مزاد',
      BARTER: 'مقايضة',
      GOLD_TRADE: 'تجارة ذهب',
    };

    // Estimate 5% commission rate since Transaction model doesn't have platformFee
    const COMMISSION_RATE = 0.05;

    return transactions.map((t) => {
      const amount = t._sum.amount ? Number(t._sum.amount) : 0;
      return {
        type: t.transactionType || 'UNKNOWN',
        typeAr: typeAr[t.transactionType || ''] || t.transactionType || 'غير معروف',
        amount: amount * COMMISSION_RATE,
        transactionCount: t._count,
        averageRate: COMMISSION_RATE * 100, // 5%
      };
    });
  }

  private async getPayoutSummary(
    _startDate: Date,
    _endDate: Date
  ): Promise<PayoutSummary> {
    // Would need payout tracking system
    return {
      totalPaid: 0,
      pendingPayouts: 0,
      failedPayouts: 0,
      sellerPayouts: 0,
      refundPayouts: 0,
    };
  }
}

// Singleton instance
export const reportsService = new ReportsService();
