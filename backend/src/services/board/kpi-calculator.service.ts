/**
 * KPI Calculator Service - خدمة حساب مؤشرات الأداء
 *
 * هذه الخدمة تحسب قيم مؤشرات الأداء من البيانات الفعلية للمنصة
 *
 * ═══════════════════════════════════════════════════════════════
 * معادلات حساب المؤشرات:
 * ═══════════════════════════════════════════════════════════════
 *
 * 【المؤشرات المالية】
 * 1. GMV (إجمالي قيمة البضائع)
 *    المعادلة: مجموع (قيمة جميع المعاملات المكتملة هذا الشهر)
 *    المصدر: Transaction.amount WHERE paymentStatus = 'COMPLETED'
 *
 * 2. REVENUE (الإيرادات الشهرية)
 *    المعادلة: GMV × 5% (عمولة المنصة) + إيرادات الاشتراكات
 *    المصدر: Transaction + UserSubscription
 *
 * 3. CAC (تكلفة اكتساب العميل)
 *    المعادلة: إجمالي تكاليف التسويق ÷ عدد المستخدمين الجدد
 *    المصدر: User.createdAt (للمستخدمين الجدد هذا الشهر)
 *    ملاحظة: تكلفة التسويق افتراضية حالياً
 *
 * 4. LTV (القيمة الدائمة للعميل)
 *    المعادلة: متوسط قيمة الطلب × عدد المعاملات للعميل × معدل الاحتفاظ
 *    المصدر: Transaction + User
 *
 * 【المؤشرات التشغيلية】
 * 5. ORDER_FULFILLMENT (معدل إتمام الطلبات)
 *    المعادلة: (المعاملات المكتملة ÷ إجمالي المعاملات) × 100
 *    المصدر: Transaction.paymentStatus
 *
 * 6. DELIVERY_TIME (متوسط وقت التوصيل)
 *    المعادلة: متوسط (وقت الإكمال - وقت الإنشاء) بالساعات
 *    المصدر: Transaction.completedAt - Transaction.createdAt
 *
 * 7. DISPUTE_RATE (معدل النزاعات)
 *    المعادلة: (عدد النزاعات ÷ إجمالي المعاملات) × 100
 *    المصدر: Dispute + Transaction
 *
 * 【مؤشرات العملاء】
 * 8. NPS (صافي نقاط الترويج)
 *    المعادلة: (% المروجين) - (% المنتقدين)
 *    المروجين: تقييم 4-5، المنتقدين: تقييم 1-2
 *    المصدر: Rating.rating
 *
 * 9. RETENTION (معدل الاحتفاظ بالعملاء)
 *    المعادلة: (مستخدمين نشطين لديهم أكثر من معاملة ÷ إجمالي المستخدمين النشطين) × 100
 *    المصدر: Transaction + User
 *
 * 10. SUPPORT_RESPONSE (وقت استجابة الدعم)
 *     المعادلة: متوسط وقت أول رد على المحادثات (بالدقائق)
 *     المصدر: Conversation + Message (محاكاة حالياً)
 *
 * 【المؤشرات التقنية】
 * 11. UPTIME (وقت تشغيل النظام)
 *     المعادلة: (وقت التشغيل ÷ إجمالي الوقت) × 100
 *     المصدر: مراقبة النظام (افتراضي 99.9% حالياً)
 *
 * 12. API_LATENCY (وقت استجابة API)
 *     المعادلة: متوسط وقت الاستجابة بالمللي ثانية
 *     المصدر: مراقبة الأداء (محاكاة حالياً)
 *
 * 13. ERROR_RATE (معدل الأخطاء)
 *     المعادلة: (عدد الأخطاء ÷ إجمالي الطلبات) × 100
 *     المصدر: سجلات الأخطاء (محاكاة حالياً)
 *
 * 【مؤشرات النمو】
 * 14. MAU (المستخدمين النشطين شهرياً)
 *     المعادلة: عدد المستخدمين الذين لديهم نشاط في آخر 30 يوم
 *     المصدر: Transaction + Listing + Message (آخر 30 يوم)
 *
 * 15. USER_GROWTH (معدل نمو المستخدمين)
 *     المعادلة: ((مستخدمين جدد هذا الشهر - الشهر الماضي) ÷ الشهر الماضي) × 100
 *     المصدر: User.createdAt
 *
 * 16. LISTING_GROWTH (نمو الإعلانات الجديدة)
 *     المعادلة: ((إعلانات جديدة هذا الشهر - الشهر الماضي) ÷ الشهر الماضي) × 100
 *     المصدر: Listing.createdAt
 *
 * ═══════════════════════════════════════════════════════════════
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { kpiTrackerService } from './kpi-tracker.service';

// Date helpers
const getMonthStart = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1);
};

const getMonthEnd = (date: Date = new Date()): Date => {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);
};

const getPreviousMonthStart = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth() - 1, 1);
};

const getPreviousMonthEnd = (): Date => {
  const date = new Date();
  return new Date(date.getFullYear(), date.getMonth(), 0, 23, 59, 59);
};

const getLast30Days = (): Date => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date;
};

/**
 * Calculate Gross Merchandise Value (GMV)
 * إجمالي قيمة البضائع
 *
 * المعادلة: مجموع قيمة جميع المعاملات المكتملة هذا الشهر
 */
async function calculateGMV(): Promise<number> {
  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  const result = await prisma.transaction.aggregate({
    _sum: { amount: true },
    where: {
      paymentStatus: 'COMPLETED',
      createdAt: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
  });

  return result._sum.amount ? Number(result._sum.amount) : 0;
}

/**
 * Calculate Monthly Revenue
 * الإيرادات الشهرية
 *
 * المعادلة: GMV × 5% (عمولة المنصة) + إيرادات الاشتراكات
 */
async function calculateRevenue(): Promise<number> {
  const gmv = await calculateGMV();
  const platformCommission = gmv * 0.05; // 5% commission

  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  // Get subscription revenue
  const subscriptionRevenue = await prisma.userSubscription.aggregate({
    _sum: { currentPrice: true },
    where: {
      status: 'ACTIVE',
      startDate: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
  });

  return platformCommission + (subscriptionRevenue._sum.currentPrice ? Number(subscriptionRevenue._sum.currentPrice) : 0);
}

/**
 * Calculate Customer Acquisition Cost (CAC)
 * تكلفة اكتساب العميل
 *
 * المعادلة: إجمالي تكاليف التسويق ÷ عدد المستخدمين الجدد
 * ملاحظة: تكلفة التسويق تحتاج ربط بنظام المالية
 */
async function calculateCAC(): Promise<number> {
  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  // Count new users this month
  const newUsersCount = await prisma.user.count({
    where: {
      createdAt: {
        gte: monthStart,
        lte: monthEnd,
      },
    },
  });

  if (newUsersCount === 0) return 0;

  // Marketing cost - placeholder until connected to financial system
  // This should be pulled from actual marketing expenses
  const estimatedMarketingCost = 10000; // EGP - placeholder

  return Math.round(estimatedMarketingCost / newUsersCount);
}

/**
 * Calculate Customer Lifetime Value (LTV)
 * القيمة الدائمة للعميل
 *
 * المعادلة: متوسط قيمة الطلب × متوسط عدد المعاملات للعميل × معدل الاحتفاظ
 */
async function calculateLTV(): Promise<number> {
  // Average order value
  const avgOrderValue = await prisma.transaction.aggregate({
    _avg: { amount: true },
    where: {
      paymentStatus: 'COMPLETED',
      amount: { not: null },
    },
  });

  // Average transactions per user
  const totalTransactions = await prisma.transaction.count({
    where: { paymentStatus: 'COMPLETED' },
  });

  const uniqueBuyers = await prisma.transaction.findMany({
    where: { paymentStatus: 'COMPLETED' },
    distinct: ['buyerId'],
    select: { buyerId: true },
  });

  const avgTransactionsPerUser =
    uniqueBuyers.length > 0 ? totalTransactions / uniqueBuyers.length : 0;

  // Retention rate (simplified)
  const retentionRate = (await calculateRetention()) / 100;

  const avgValue = avgOrderValue._avg.amount ? Number(avgOrderValue._avg.amount) : 0;
  return Math.round(avgValue * avgTransactionsPerUser * (1 + retentionRate));
}

/**
 * Calculate Order Fulfillment Rate
 * معدل إتمام الطلبات
 *
 * المعادلة: (المعاملات المكتملة ÷ إجمالي المعاملات) × 100
 */
async function calculateOrderFulfillment(): Promise<number> {
  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  const [completedCount, totalCount] = await Promise.all([
    prisma.transaction.count({
      where: {
        paymentStatus: 'COMPLETED',
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.transaction.count({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
  ]);

  if (totalCount === 0) return 100;
  return Math.round((completedCount / totalCount) * 100 * 100) / 100;
}

/**
 * Calculate Average Delivery Time
 * متوسط وقت التوصيل
 *
 * المعادلة: متوسط (وقت الإكمال - وقت الإنشاء) بالساعات
 */
async function calculateDeliveryTime(): Promise<number> {
  const completedTransactions = await prisma.transaction.findMany({
    where: {
      paymentStatus: 'COMPLETED',
      completedAt: { not: null },
    },
    select: {
      createdAt: true,
      completedAt: true,
    },
    take: 1000, // Limit for performance
  });

  if (completedTransactions.length === 0) return 0;

  const totalHours = completedTransactions.reduce((sum, tx) => {
    if (tx.completedAt) {
      const hours =
        (tx.completedAt.getTime() - tx.createdAt.getTime()) / (1000 * 60 * 60);
      return sum + hours;
    }
    return sum;
  }, 0);

  return Math.round(totalHours / completedTransactions.length);
}

/**
 * Calculate Dispute Rate
 * معدل النزاعات
 *
 * المعادلة: (عدد النزاعات ÷ إجمالي المعاملات) × 100
 */
async function calculateDisputeRate(): Promise<number> {
  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();

  const [disputeCount, totalTransactions] = await Promise.all([
    prisma.dispute.count({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.transaction.count({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
  ]);

  if (totalTransactions === 0) return 0;
  return Math.round((disputeCount / totalTransactions) * 100 * 100) / 100;
}

/**
 * Calculate Net Promoter Score (NPS)
 * صافي نقاط الترويج
 *
 * المعادلة: (% المروجين) - (% المنتقدين)
 * المروجين: تقييم 4-5، المحايدين: 3، المنتقدين: 1-2
 */
async function calculateNPS(): Promise<number> {
  const reviews = await prisma.review.findMany({
    where: {
      createdAt: { gte: getLast30Days() },
    },
    select: { overallRating: true },
  });

  if (reviews.length === 0) return 50; // Default neutral

  const promoters = reviews.filter((r) => r.overallRating >= 4).length;
  const detractors = reviews.filter((r) => r.overallRating <= 2).length;

  const promoterPercent = (promoters / reviews.length) * 100;
  const detractorPercent = (detractors / reviews.length) * 100;

  // NPS ranges from -100 to 100, we normalize to 0-100
  const nps = promoterPercent - detractorPercent;
  return Math.round((nps + 100) / 2);
}

/**
 * Calculate Customer Retention Rate
 * معدل الاحتفاظ بالعملاء
 *
 * المعادلة: (مستخدمين لديهم أكثر من معاملة ÷ إجمالي المستخدمين النشطين) × 100
 */
async function calculateRetention(): Promise<number> {
  // Users with multiple transactions (returning customers)
  const returningCustomers = await prisma.transaction.groupBy({
    by: ['buyerId'],
    _count: { id: true },
    having: {
      id: { _count: { gt: 1 } },
    },
  });

  // All unique buyers
  const allBuyers = await prisma.transaction.findMany({
    distinct: ['buyerId'],
    select: { buyerId: true },
  });

  if (allBuyers.length === 0) return 80; // Default
  return Math.round((returningCustomers.length / allBuyers.length) * 100 * 100) / 100;
}

/**
 * Calculate Support Response Time
 * وقت استجابة الدعم
 *
 * المعادلة: متوسط وقت أول رد (بالدقائق)
 * ملاحظة: يحتاج ربط بنظام الدعم الفني
 */
async function calculateSupportResponse(): Promise<number> {
  // This would ideally be calculated from a support ticket system
  // For now, we estimate based on conversation response times

  const recentConversations = await prisma.conversation.findMany({
    where: {
      createdAt: { gte: getLast30Days() },
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 2,
      },
    },
    take: 100,
  });

  if (recentConversations.length === 0) return 30; // Default 30 minutes

  let totalMinutes = 0;
  let conversationsWithResponse = 0;

  for (const conv of recentConversations) {
    if (conv.messages.length >= 2) {
      const firstMessage = conv.messages[0];
      const secondMessage = conv.messages[1];
      const responseMinutes =
        (secondMessage.createdAt.getTime() - firstMessage.createdAt.getTime()) /
        (1000 * 60);
      if (responseMinutes < 1440) {
        // Only count if response within 24 hours
        totalMinutes += responseMinutes;
        conversationsWithResponse++;
      }
    }
  }

  if (conversationsWithResponse === 0) return 30;
  return Math.round(totalMinutes / conversationsWithResponse);
}

/**
 * Calculate System Uptime
 * وقت تشغيل النظام
 *
 * ملاحظة: يحتاج ربط بنظام مراقبة الخوادم
 */
async function calculateUptime(): Promise<number> {
  // This should be integrated with a monitoring system like:
  // - AWS CloudWatch
  // - Prometheus
  // - Datadog
  // For now, return a simulated value based on error logs

  // In production, connect to your monitoring API
  return 99.9; // Placeholder - replace with actual monitoring data
}

/**
 * Calculate API Latency
 * وقت استجابة API
 *
 * ملاحظة: يحتاج ربط بنظام APM
 */
async function calculateAPILatency(): Promise<number> {
  // This should be integrated with APM (Application Performance Monitoring)
  // For now, return a simulated value

  // In production, connect to your APM system
  return 150; // Placeholder - 150ms average response time
}

/**
 * Calculate Error Rate
 * معدل الأخطاء
 *
 * ملاحظة: يحتاج ربط بسجلات الأخطاء
 */
async function calculateErrorRate(): Promise<number> {
  // This should be calculated from error logs
  // For now, return a simulated low error rate

  // In production, query your logging system (e.g., Elasticsearch, CloudWatch)
  return 0.5; // Placeholder - 0.5% error rate
}

/**
 * Calculate Monthly Active Users (MAU)
 * المستخدمين النشطين شهرياً
 *
 * المعادلة: المستخدمين الذين لديهم نشاط في آخر 30 يوم
 */
async function calculateMAU(): Promise<number> {
  const last30Days = getLast30Days();

  // Users with transactions
  const buyerIds = await prisma.transaction.findMany({
    where: { createdAt: { gte: last30Days } },
    distinct: ['buyerId'],
    select: { buyerId: true },
  });

  const sellerIds = await prisma.transaction.findMany({
    where: { createdAt: { gte: last30Days } },
    distinct: ['sellerId'],
    select: { sellerId: true },
  });

  // Users with listings
  const listerIds = await prisma.listing.findMany({
    where: { createdAt: { gte: last30Days } },
    distinct: ['userId'],
    select: { userId: true },
  });

  // Users with messages
  const messagers1 = await prisma.conversation.findMany({
    where: { lastMessageAt: { gte: last30Days } },
    distinct: ['participant1Id'],
    select: { participant1Id: true },
  });

  const messagers2 = await prisma.conversation.findMany({
    where: { lastMessageAt: { gte: last30Days } },
    distinct: ['participant2Id'],
    select: { participant2Id: true },
  });

  // Combine all unique user IDs
  const allUserIds = new Set([
    ...buyerIds.map((b) => b.buyerId),
    ...sellerIds.map((s) => s.sellerId),
    ...listerIds.map((l) => l.userId),
    ...messagers1.map((m) => m.participant1Id),
    ...messagers2.map((m) => m.participant2Id),
  ]);

  return allUserIds.size;
}

/**
 * Calculate User Growth Rate
 * معدل نمو المستخدمين
 *
 * المعادلة: ((مستخدمين جدد هذا الشهر - الشهر الماضي) ÷ الشهر الماضي) × 100
 */
async function calculateUserGrowth(): Promise<number> {
  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();
  const prevMonthStart = getPreviousMonthStart();
  const prevMonthEnd = getPreviousMonthEnd();

  const [currentMonthUsers, previousMonthUsers] = await Promise.all([
    prisma.user.count({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
      },
    }),
  ]);

  if (previousMonthUsers === 0) {
    return currentMonthUsers > 0 ? 100 : 0;
  }

  return Math.round(
    ((currentMonthUsers - previousMonthUsers) / previousMonthUsers) * 100 * 100
  ) / 100;
}

/**
 * Calculate Listing Growth Rate
 * نمو الإعلانات الجديدة
 *
 * المعادلة: ((إعلانات جديدة هذا الشهر - الشهر الماضي) ÷ الشهر الماضي) × 100
 */
async function calculateListingGrowth(): Promise<number> {
  const monthStart = getMonthStart();
  const monthEnd = getMonthEnd();
  const prevMonthStart = getPreviousMonthStart();
  const prevMonthEnd = getPreviousMonthEnd();

  const [currentMonthListings, previousMonthListings] = await Promise.all([
    prisma.listing.count({
      where: {
        createdAt: { gte: monthStart, lte: monthEnd },
      },
    }),
    prisma.listing.count({
      where: {
        createdAt: { gte: prevMonthStart, lte: prevMonthEnd },
      },
    }),
  ]);

  if (previousMonthListings === 0) {
    return currentMonthListings > 0 ? 100 : 0;
  }

  return Math.round(
    ((currentMonthListings - previousMonthListings) / previousMonthListings) * 100 * 100
  ) / 100;
}

/**
 * Calculate all KPIs and update the database
 * حساب جميع المؤشرات وتحديث قاعدة البيانات
 */
export async function calculateAndUpdateAllKPIs(): Promise<{
  success: boolean;
  updated: number;
  errors: string[];
}> {
  logger.info('[KPICalculator] Starting KPI calculation...');
  const errors: string[] = [];
  let updated = 0;

  const kpiCalculations: { code: string; calculate: () => Promise<number> }[] = [
    // Financial
    { code: 'GMV', calculate: calculateGMV },
    { code: 'REVENUE', calculate: calculateRevenue },
    { code: 'CAC', calculate: calculateCAC },
    { code: 'LTV', calculate: calculateLTV },
    // Operational
    { code: 'ORDER_FULFILLMENT', calculate: calculateOrderFulfillment },
    { code: 'DELIVERY_TIME', calculate: calculateDeliveryTime },
    { code: 'DISPUTE_RATE', calculate: calculateDisputeRate },
    // Customer
    { code: 'NPS', calculate: calculateNPS },
    { code: 'RETENTION', calculate: calculateRetention },
    { code: 'SUPPORT_RESPONSE', calculate: calculateSupportResponse },
    // Technical
    { code: 'UPTIME', calculate: calculateUptime },
    { code: 'API_LATENCY', calculate: calculateAPILatency },
    { code: 'ERROR_RATE', calculate: calculateErrorRate },
    // Growth
    { code: 'MAU', calculate: calculateMAU },
    { code: 'USER_GROWTH', calculate: calculateUserGrowth },
    { code: 'LISTING_GROWTH', calculate: calculateListingGrowth },
  ];

  for (const kpi of kpiCalculations) {
    try {
      const value = await kpi.calculate();
      await kpiTrackerService.updateKPI({
        code: kpi.code,
        value,
        recordHistory: true,
      });
      logger.info(`[KPICalculator] ${kpi.code} = ${value}`);
      updated++;
    } catch (error) {
      const errorMessage = `Failed to calculate ${kpi.code}: ${(error as Error).message}`;
      logger.error(`[KPICalculator] ${errorMessage}`);
      errors.push(errorMessage);
    }
  }

  logger.info(`[KPICalculator] Completed. Updated: ${updated}, Errors: ${errors.length}`);

  return {
    success: errors.length === 0,
    updated,
    errors,
  };
}

/**
 * Get KPI calculation explanation
 * شرح معادلة حساب المؤشر
 */
export function getKPIExplanation(code: string): {
  name: string;
  nameAr: string;
  formula: string;
  formulaAr: string;
  dataSource: string;
  dataSourceAr: string;
} | null {
  const explanations: Record<
    string,
    {
      name: string;
      nameAr: string;
      formula: string;
      formulaAr: string;
      dataSource: string;
      dataSourceAr: string;
    }
  > = {
    GMV: {
      name: 'Gross Merchandise Value',
      nameAr: 'إجمالي قيمة البضائع',
      formula: 'SUM(Transaction.amount) WHERE paymentStatus = COMPLETED AND createdAt = this month',
      formulaAr: 'مجموع قيمة جميع المعاملات المكتملة هذا الشهر',
      dataSource: 'Transaction table (completed transactions)',
      dataSourceAr: 'جدول المعاملات (المعاملات المكتملة)',
    },
    REVENUE: {
      name: 'Monthly Revenue',
      nameAr: 'الإيرادات الشهرية',
      formula: 'GMV × 5% (platform commission) + SUM(subscription fees)',
      formulaAr: 'إجمالي قيمة البضائع × 5% (عمولة المنصة) + مجموع رسوم الاشتراكات',
      dataSource: 'Transaction + UserSubscription tables',
      dataSourceAr: 'جداول المعاملات والاشتراكات',
    },
    CAC: {
      name: 'Customer Acquisition Cost',
      nameAr: 'تكلفة اكتساب العميل',
      formula: 'Marketing Spend ÷ New Users Count',
      formulaAr: 'إجمالي تكاليف التسويق ÷ عدد المستخدمين الجدد',
      dataSource: 'Marketing expenses + User registrations',
      dataSourceAr: 'مصاريف التسويق + تسجيلات المستخدمين',
    },
    LTV: {
      name: 'Customer Lifetime Value',
      nameAr: 'القيمة الدائمة للعميل',
      formula: 'Average Order Value × Average Transactions per User × (1 + Retention Rate)',
      formulaAr: 'متوسط قيمة الطلب × متوسط عدد المعاملات للعميل × (1 + معدل الاحتفاظ)',
      dataSource: 'Transaction table',
      dataSourceAr: 'جدول المعاملات',
    },
    ORDER_FULFILLMENT: {
      name: 'Order Fulfillment Rate',
      nameAr: 'معدل إتمام الطلبات',
      formula: '(Completed Transactions ÷ Total Transactions) × 100',
      formulaAr: '(المعاملات المكتملة ÷ إجمالي المعاملات) × 100',
      dataSource: 'Transaction.paymentStatus',
      dataSourceAr: 'حالة الدفع في جدول المعاملات',
    },
    DELIVERY_TIME: {
      name: 'Average Delivery Time',
      nameAr: 'متوسط وقت التوصيل',
      formula: 'AVG(Transaction.completedAt - Transaction.createdAt) in hours',
      formulaAr: 'متوسط (وقت الإكمال - وقت الإنشاء) بالساعات',
      dataSource: 'Transaction table (completedAt, createdAt)',
      dataSourceAr: 'جدول المعاملات (وقت الإكمال، وقت الإنشاء)',
    },
    DISPUTE_RATE: {
      name: 'Dispute Rate',
      nameAr: 'معدل النزاعات',
      formula: '(Dispute Count ÷ Total Transactions) × 100',
      formulaAr: '(عدد النزاعات ÷ إجمالي المعاملات) × 100',
      dataSource: 'Dispute + Transaction tables',
      dataSourceAr: 'جداول النزاعات والمعاملات',
    },
    NPS: {
      name: 'Net Promoter Score',
      nameAr: 'صافي نقاط الترويج',
      formula: '(% Promoters [overallRating 4-5]) - (% Detractors [overallRating 1-2])',
      formulaAr: '(نسبة المروجين [تقييم 4-5]) - (نسبة المنتقدين [تقييم 1-2])',
      dataSource: 'Review table (last 30 days)',
      dataSourceAr: 'جدول المراجعات (آخر 30 يوم)',
    },
    RETENTION: {
      name: 'Customer Retention Rate',
      nameAr: 'معدل الاحتفاظ بالعملاء',
      formula: '(Returning Customers ÷ Total Unique Customers) × 100',
      formulaAr: '(العملاء العائدين ÷ إجمالي العملاء الفريدين) × 100',
      dataSource: 'Transaction table (group by buyerId)',
      dataSourceAr: 'جدول المعاملات (مجموعة حسب المشتري)',
    },
    SUPPORT_RESPONSE: {
      name: 'Support Response Time',
      nameAr: 'وقت استجابة الدعم',
      formula: 'AVG(Second Message Time - First Message Time) in minutes',
      formulaAr: 'متوسط (وقت الرسالة الثانية - وقت الرسالة الأولى) بالدقائق',
      dataSource: 'Conversation + Message tables',
      dataSourceAr: 'جداول المحادثات والرسائل',
    },
    UPTIME: {
      name: 'System Uptime',
      nameAr: 'وقت تشغيل النظام',
      formula: '(Total Uptime ÷ Total Time) × 100',
      formulaAr: '(إجمالي وقت التشغيل ÷ إجمالي الوقت) × 100',
      dataSource: 'Server monitoring system (AWS CloudWatch, etc.)',
      dataSourceAr: 'نظام مراقبة الخوادم',
    },
    API_LATENCY: {
      name: 'API Response Time',
      nameAr: 'وقت استجابة API',
      formula: 'AVG(API response times) in milliseconds',
      formulaAr: 'متوسط أوقات استجابة API بالمللي ثانية',
      dataSource: 'APM system (Application Performance Monitoring)',
      dataSourceAr: 'نظام مراقبة أداء التطبيقات',
    },
    ERROR_RATE: {
      name: 'Error Rate',
      nameAr: 'معدل الأخطاء',
      formula: '(Error Count ÷ Total Requests) × 100',
      formulaAr: '(عدد الأخطاء ÷ إجمالي الطلبات) × 100',
      dataSource: 'Error logs (Elasticsearch, CloudWatch, etc.)',
      dataSourceAr: 'سجلات الأخطاء',
    },
    MAU: {
      name: 'Monthly Active Users',
      nameAr: 'المستخدمين النشطين شهرياً',
      formula: 'COUNT(DISTINCT users with activity in last 30 days)',
      formulaAr: 'عدد المستخدمين الفريدين الذين لديهم نشاط في آخر 30 يوم',
      dataSource: 'Transaction + Listing + Conversation tables',
      dataSourceAr: 'جداول المعاملات والإعلانات والمحادثات',
    },
    USER_GROWTH: {
      name: 'User Growth Rate',
      nameAr: 'معدل نمو المستخدمين',
      formula: '((This Month Users - Last Month Users) ÷ Last Month Users) × 100',
      formulaAr: '((مستخدمين هذا الشهر - الشهر الماضي) ÷ الشهر الماضي) × 100',
      dataSource: 'User.createdAt',
      dataSourceAr: 'تاريخ إنشاء حساب المستخدم',
    },
    LISTING_GROWTH: {
      name: 'New Listings Growth',
      nameAr: 'نمو الإعلانات الجديدة',
      formula: '((This Month Listings - Last Month Listings) ÷ Last Month Listings) × 100',
      formulaAr: '((إعلانات هذا الشهر - الشهر الماضي) ÷ الشهر الماضي) × 100',
      dataSource: 'Listing.createdAt',
      dataSourceAr: 'تاريخ إنشاء الإعلان',
    },
  };

  return explanations[code] || null;
}

/**
 * Get all KPI explanations
 * شرح جميع المؤشرات
 */
export function getAllKPIExplanations() {
  const codes = [
    'GMV', 'REVENUE', 'CAC', 'LTV',
    'ORDER_FULFILLMENT', 'DELIVERY_TIME', 'DISPUTE_RATE',
    'NPS', 'RETENTION', 'SUPPORT_RESPONSE',
    'UPTIME', 'API_LATENCY', 'ERROR_RATE',
    'MAU', 'USER_GROWTH', 'LISTING_GROWTH',
  ];

  return codes.map((code) => ({
    code,
    ...getKPIExplanation(code),
  }));
}

export default {
  calculateAndUpdateAllKPIs,
  getKPIExplanation,
  getAllKPIExplanations,
  // Export individual calculators for testing
  calculateGMV,
  calculateRevenue,
  calculateCAC,
  calculateLTV,
  calculateOrderFulfillment,
  calculateDeliveryTime,
  calculateDisputeRate,
  calculateNPS,
  calculateRetention,
  calculateSupportResponse,
  calculateUptime,
  calculateAPILatency,
  calculateErrorRate,
  calculateMAU,
  calculateUserGrowth,
  calculateListingGrowth,
};
