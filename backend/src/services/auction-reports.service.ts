/**
 * Auction Reports & Statistics Service
 * خدمة التقارير والإحصائيات للمزادات
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// فترات التقارير
export enum ReportPeriod {
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  ALL_TIME = 'ALL_TIME',
  CUSTOM = 'CUSTOM',
}

// أنواع التقارير
export enum ReportType {
  AUCTIONS_SUMMARY = 'AUCTIONS_SUMMARY',
  BIDS_ANALYSIS = 'BIDS_ANALYSIS',
  REVENUE_REPORT = 'REVENUE_REPORT',
  USER_ACTIVITY = 'USER_ACTIVITY',
  CATEGORY_PERFORMANCE = 'CATEGORY_PERFORMANCE',
  FRAUD_REPORT = 'FRAUD_REPORT',
  DISPUTE_REPORT = 'DISPUTE_REPORT',
}

export class AuctionReportsService {
  /**
   * الحصول على الإحصائيات العامة
   */
  async getDashboardStats(period: ReportPeriod = ReportPeriod.MONTH): Promise<{
    auctions: {
      total: number;
      active: number;
      ended: number;
      sold: number;
      cancelled: number;
      successRate: number;
    };
    bids: {
      total: number;
      averagePerAuction: number;
      uniqueBidders: number;
    };
    revenue: {
      totalValue: number;
      platformFees: number;
      deposits: number;
    };
    users: {
      activeBidders: number;
      activeSellers: number;
      newUsers: number;
    };
    trends: {
      auctionsChange: number;
      bidsChange: number;
      revenueChange: number;
    };
  }> {
    const dateRange = this.getDateRange(period);

    // إحصائيات المزادات
    const auctionStats = await prisma.auction.groupBy({
      by: ['status'],
      _count: true,
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    });

    const totalAuctions = auctionStats.reduce((sum, stat) => sum + stat._count, 0);
    const activeAuctions = auctionStats.find(s => s.status === 'ACTIVE')?._count || 0;
    const endedAuctions = auctionStats.find(s => s.status === 'ENDED')?._count || 0;
    const soldAuctions = auctionStats.find(s => s.status === 'COMPLETED')?._count || 0;
    const cancelledAuctions = auctionStats.find(s => s.status === 'CANCELLED')?._count || 0;

    // إحصائيات المزايدات
    const bidStats = await prisma.auctionBid.aggregate({
      _count: true,
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    });

    const uniqueBidders = await prisma.auctionBid.groupBy({
      by: ['bidderId'],
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    });

    // إحصائيات الإيرادات
    const revenueStats = await prisma.auction.aggregate({
      _sum: { currentPrice: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    });

    const depositsStats = await prisma.auctionDeposit.aggregate({
      _sum: { amount: true },
      where: {
        status: 'PAID',
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    });

    // إحصائيات المستخدمين
    const activeBidders = uniqueBidders.length;
    const activeSellers = await prisma.listing.groupBy({
      by: ['userId'],
      where: {
        listingType: 'AUCTION',
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    });

    const newUsers = await prisma.user.count({
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    });

    // حساب التغييرات (مقارنة بالفترة السابقة)
    const previousRange = this.getPreviousDateRange(period, dateRange);
    const previousAuctions = await prisma.auction.count({
      where: { createdAt: { gte: previousRange.start, lte: previousRange.end } },
    });
    const previousBids = await prisma.auctionBid.count({
      where: { createdAt: { gte: previousRange.start, lte: previousRange.end } },
    });
    const previousRevenue = await prisma.auction.aggregate({
      _sum: { currentPrice: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: previousRange.start, lte: previousRange.end },
      },
    });

    const totalValue = revenueStats._sum.currentPrice || 0;
    const platformFees = totalValue * 0.05; // 5% رسوم المنصة

    return {
      auctions: {
        total: totalAuctions,
        active: activeAuctions,
        ended: endedAuctions,
        sold: soldAuctions,
        cancelled: cancelledAuctions,
        successRate: totalAuctions > 0 ? Math.round((soldAuctions / (endedAuctions + soldAuctions)) * 100) : 0,
      },
      bids: {
        total: bidStats._count,
        averagePerAuction: totalAuctions > 0 ? Math.round(bidStats._count / totalAuctions) : 0,
        uniqueBidders: activeBidders,
      },
      revenue: {
        totalValue,
        platformFees,
        deposits: depositsStats._sum.amount || 0,
      },
      users: {
        activeBidders,
        activeSellers: activeSellers.length,
        newUsers,
      },
      trends: {
        auctionsChange: previousAuctions > 0 ? Math.round(((totalAuctions - previousAuctions) / previousAuctions) * 100) : 0,
        bidsChange: previousBids > 0 ? Math.round(((bidStats._count - previousBids) / previousBids) * 100) : 0,
        revenueChange: (previousRevenue._sum.currentPrice || 0) > 0
          ? Math.round(((totalValue - (previousRevenue._sum.currentPrice || 0)) / (previousRevenue._sum.currentPrice || 1)) * 100)
          : 0,
      },
    };
  }

  /**
   * تقرير أداء الفئات
   */
  async getCategoryPerformance(period: ReportPeriod = ReportPeriod.MONTH): Promise<{
    category: string;
    totalAuctions: number;
    soldAuctions: number;
    totalValue: number;
    averagePrice: number;
    successRate: number;
    totalBids: number;
  }[]> {
    const dateRange = this.getDateRange(period);

    const categoryStats = await prisma.auction.groupBy({
      by: ['auctionCategory'],
      _count: true,
      _sum: { currentPrice: true },
      _avg: { currentPrice: true },
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
        auctionCategory: { not: null },
      },
    });

    const results = await Promise.all(
      categoryStats.map(async (cat) => {
        const soldCount = await prisma.auction.count({
          where: {
            auctionCategory: cat.auctionCategory,
            status: 'COMPLETED',
            createdAt: { gte: dateRange.start, lte: dateRange.end },
          },
        });

        const totalBids = await prisma.auctionBid.count({
          where: {
            auction: {
              auctionCategory: cat.auctionCategory,
              createdAt: { gte: dateRange.start, lte: dateRange.end },
            },
          },
        });

        return {
          category: cat.auctionCategory || 'GENERAL',
          totalAuctions: cat._count,
          soldAuctions: soldCount,
          totalValue: cat._sum.currentPrice || 0,
          averagePrice: Math.round(cat._avg.currentPrice || 0),
          successRate: cat._count > 0 ? Math.round((soldCount / cat._count) * 100) : 0,
          totalBids,
        };
      })
    );

    return results.sort((a, b) => b.totalValue - a.totalValue);
  }

  /**
   * تقرير أفضل البائعين
   */
  async getTopSellers(period: ReportPeriod = ReportPeriod.MONTH, limit: number = 10): Promise<{
    sellerId: string;
    sellerName: string;
    totalAuctions: number;
    soldAuctions: number;
    totalValue: number;
    averageRating: number;
    successRate: number;
  }[]> {
    const dateRange = this.getDateRange(period);

    const sellerStats = await prisma.listing.groupBy({
      by: ['userId'],
      _count: true,
      where: {
        listingType: 'AUCTION',
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    });

    const results = await Promise.all(
      sellerStats.slice(0, limit * 2).map(async (seller) => {
        const user = await prisma.user.findUnique({
          where: { id: seller.userId },
          select: { fullName: true },
        });

        const soldAuctions = await prisma.auction.count({
          where: {
            listing: { userId: seller.userId },
            status: 'COMPLETED',
            createdAt: { gte: dateRange.start, lte: dateRange.end },
          },
        });

        const totalValue = await prisma.auction.aggregate({
          _sum: { currentPrice: true },
          where: {
            listing: { userId: seller.userId },
            status: 'COMPLETED',
            createdAt: { gte: dateRange.start, lte: dateRange.end },
          },
        });

        const reviews = await prisma.auctionReview.aggregate({
          _avg: { overallRating: true },
          where: {
            revieweeId: seller.userId,
          },
        });

        return {
          sellerId: seller.userId,
          sellerName: user?.fullName || 'مستخدم',
          totalAuctions: seller._count,
          soldAuctions,
          totalValue: totalValue._sum.currentPrice || 0,
          averageRating: Math.round((reviews._avg.overallRating || 0) * 10) / 10,
          successRate: seller._count > 0 ? Math.round((soldAuctions / seller._count) * 100) : 0,
        };
      })
    );

    return results
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, limit);
  }

  /**
   * تقرير النزاعات
   */
  async getDisputeReport(period: ReportPeriod = ReportPeriod.MONTH): Promise<{
    total: number;
    pending: number;
    resolved: number;
    resolutionRate: number;
    averageResolutionTime: number;
    byReason: { reason: string; count: number }[];
    byResolution: { resolution: string; count: number }[];
  }> {
    const dateRange = this.getDateRange(period);

    const disputeStats = await prisma.auctionDispute.groupBy({
      by: ['status'],
      _count: true,
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    });

    const total = disputeStats.reduce((sum, stat) => sum + stat._count, 0);
    const pendingStatuses = ['OPEN', 'UNDER_REVIEW', 'EVIDENCE_REQUESTED', 'ESCALATED'];
    const resolvedStatuses = ['RESOLVED_BUYER', 'RESOLVED_SELLER', 'CLOSED'];
    const pending = disputeStats.filter(s => pendingStatuses.includes(s.status)).reduce((sum, s) => sum + s._count, 0);
    const resolved = disputeStats.filter(s => resolvedStatuses.includes(s.status)).reduce((sum, s) => sum + s._count, 0);

    const byReason = await prisma.auctionDispute.groupBy({
      by: ['reason'],
      _count: true,
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    });

    const byResolution = await prisma.auctionDispute.groupBy({
      by: ['resolution'],
      _count: true,
      where: {
        status: { in: ['RESOLVED_BUYER', 'RESOLVED_SELLER', 'CLOSED'] },
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    });

    return {
      total,
      pending,
      resolved,
      resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0,
      averageResolutionTime: 48, // TODO: حساب فعلي
      byReason: byReason.map(r => ({ reason: r.reason || 'OTHER', count: r._count })),
      byResolution: byResolution.map(r => ({ resolution: r.resolution || 'OTHER', count: r._count })),
    };
  }

  /**
   * تقرير الاحتيال
   */
  async getFraudReport(period: ReportPeriod = ReportPeriod.MONTH): Promise<{
    totalAlerts: number;
    confirmedFraud: number;
    falsePositives: number;
    pending: number;
    byType: { type: string; count: number }[];
    topSuspiciousUsers: { userId: string; userName: string; alertCount: number }[];
  }> {
    const dateRange = this.getDateRange(period);

    // Using type assertions to work around Prisma groupBy TypeScript circular reference issue
    const alertStats = await (prisma.auctionFraudAlert.groupBy as any)({
      by: ['status'],
      _count: true,
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    }) as Array<{ status: string; _count: number }>;

    const byType = await (prisma.auctionFraudAlert.groupBy as any)({
      by: ['alertType'],
      _count: true,
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
      },
    }) as Array<{ alertType: string; _count: number }>;

    const suspiciousUsers = await (prisma.auctionFraudAlert.groupBy as any)({
      by: ['userId'],
      _count: true,
      where: {
        createdAt: { gte: dateRange.start, lte: dateRange.end },
        userId: { not: null },
      },
      orderBy: { _count: { userId: 'desc' } },
      take: 10,
    }) as Array<{ userId: string | null; _count: number }>;

    const topSuspicious = await Promise.all(
      suspiciousUsers.map(async (u) => {
        const user = await prisma.user.findUnique({
          where: { id: u.userId! },
          select: { fullName: true },
        });
        return {
          userId: u.userId!,
          userName: user?.fullName || 'مستخدم',
          alertCount: u._count,
        };
      })
    );

    return {
      totalAlerts: alertStats.reduce((sum, s) => sum + s._count, 0),
      confirmedFraud: alertStats.find(s => s.status === 'CONFIRMED')?._count || 0,
      falsePositives: alertStats.find(s => s.status === 'FALSE_POSITIVE')?._count || 0,
      pending: alertStats.find(s => s.status === 'DETECTED' || s.status === 'INVESTIGATING')?._count || 0,
      byType: byType.map(t => ({ type: t.alertType, count: t._count })),
      topSuspiciousUsers: topSuspicious,
    };
  }

  /**
   * تصدير التقرير
   */
  async exportReport(
    reportType: ReportType,
    period: ReportPeriod,
    format: 'csv' | 'xlsx' | 'pdf'
  ): Promise<{ url: string; filename: string }> {
    // TODO: تنفيذ تصدير التقارير
    const filename = `auction_report_${reportType.toLowerCase()}_${Date.now()}.${format}`;

    console.log(`Exporting ${reportType} report in ${format} format`);

    return {
      url: `/exports/${filename}`,
      filename,
    };
  }

  /**
   * الحصول على نطاق التاريخ للفترة
   */
  private getDateRange(period: ReportPeriod): { start: Date; end: Date } {
    const now = new Date();
    let start: Date;

    switch (period) {
      case ReportPeriod.TODAY:
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case ReportPeriod.WEEK:
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case ReportPeriod.MONTH:
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case ReportPeriod.QUARTER:
        start = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
        break;
      case ReportPeriod.YEAR:
        start = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        start = new Date(0);
    }

    return { start, end: now };
  }

  /**
   * الحصول على نطاق الفترة السابقة
   */
  private getPreviousDateRange(
    period: ReportPeriod,
    currentRange: { start: Date; end: Date }
  ): { start: Date; end: Date } {
    const duration = currentRange.end.getTime() - currentRange.start.getTime();
    return {
      start: new Date(currentRange.start.getTime() - duration),
      end: new Date(currentRange.start.getTime() - 1),
    };
  }
}

export const auctionReportsService = new AuctionReportsService();
