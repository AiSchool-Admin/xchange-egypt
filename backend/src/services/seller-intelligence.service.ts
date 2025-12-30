/**
 * Seller Intelligence Dashboard Service (Simplified)
 * خدمة لوحة ذكاء البائع - نسخة مبسطة
 */

import prisma from '../lib/prisma';

// ============================================
// Types
// ============================================

interface SellerDashboard {
  overview: {
    totalRevenue: number;
    totalSales: number;
    averageOrderValue: number;
    activeListings: number;
    pendingOrders: number;
    rating: number;
  };
  recommendations: {
    id: string;
    priority: string;
    titleAr: string;
    descriptionAr: string;
  }[];
  forecast: {
    nextWeek: number;
    nextMonth: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
    confidence: number;
  };
}

// ============================================
// Main Functions
// ============================================

/**
 * Get comprehensive seller dashboard
 */
export async function getSellerDashboard(
  userId: string,
  period: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' = 'MONTH'
): Promise<SellerDashboard> {
  const periodDays = getPeriodDays(period);
  const startDate = new Date(Date.now() - periodDays * 24 * 60 * 60 * 1000);

  // Get transactions where user is seller
  const transactions = await prisma.transaction.findMany({
    where: {
      sellerId: userId,
      paymentStatus: 'COMPLETED',
      createdAt: { gte: startDate },
    },
    select: {
      amount: true,
      createdAt: true,
    },
  });

  // Get active listings
  const activeListings = await prisma.listing.count({
    where: {
      userId: userId,
      status: 'ACTIVE',
    },
  });

  // Get pending transactions
  const pendingOrders = await prisma.transaction.count({
    where: {
      sellerId: userId,
      paymentStatus: 'PENDING',
    },
  });

  // Get user rating
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { rating: true },
  });

  // Calculate metrics
  const totalRevenue = transactions.reduce((sum, t) => sum + (t.amount ? Number(t.amount) : 0), 0);
  const totalSales = transactions.length;
  const averageOrderValue = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Calculate weekly averages for forecast
  const weeklyRevenue = aggregateWeekly(transactions);
  const trend = calculateTrend(weeklyRevenue);
  const avgWeeklyRevenue = weeklyRevenue.length > 0
    ? weeklyRevenue.reduce((s, w) => s + w, 0) / weeklyRevenue.length
    : 0;

  const trendMultiplier = trend === 'UP' ? 1.1 : trend === 'DOWN' ? 0.9 : 1.0;

  // Generate recommendations
  const recommendations: SellerDashboard['recommendations'] = [];

  if (activeListings > 10 && totalSales < 5) {
    recommendations.push({
      id: '1',
      priority: 'HIGH',
      titleAr: 'خفض الأسعار لزيادة المبيعات',
      descriptionAr: 'لديك إعلانات كثيرة ومبيعات قليلة، جرب تخفيض الأسعار',
    });
  }

  if (pendingOrders > 3) {
    recommendations.push({
      id: '2',
      priority: 'HIGH',
      titleAr: 'متابعة الطلبات المعلقة',
      descriptionAr: `لديك ${pendingOrders} طلبات معلقة، تابعها لإتمام البيع`,
    });
  }

  if ((user?.rating || 0) < 4) {
    recommendations.push({
      id: '3',
      priority: 'MEDIUM',
      titleAr: 'تحسين خدمة العملاء',
      descriptionAr: 'تقييمك منخفض، حاول تحسين سرعة الرد وجودة الخدمة',
    });
  }

  return {
    overview: {
      totalRevenue: Math.round(totalRevenue),
      totalSales,
      averageOrderValue: Math.round(averageOrderValue),
      activeListings,
      pendingOrders,
      rating: user?.rating || 0,
    },
    recommendations,
    forecast: {
      nextWeek: Math.round(avgWeeklyRevenue * trendMultiplier),
      nextMonth: Math.round(avgWeeklyRevenue * 4 * trendMultiplier),
      trend,
      confidence: Math.min(transactions.length * 5, 80),
    },
  };
}

/**
 * Get quick seller stats (lightweight)
 */
export async function getQuickSellerStats(userId: string): Promise<{
  revenue: number;
  sales: number;
  activeListings: number;
  rating: number;
  pendingOrders: number;
}> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [transactions, listings, user, pendingTransactions] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        sellerId: userId,
        paymentStatus: 'COMPLETED',
        createdAt: { gte: thirtyDaysAgo },
      },
      select: { amount: true },
    }),
    prisma.listing.count({
      where: { userId: userId, status: 'ACTIVE' },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { rating: true },
    }),
    prisma.transaction.count({
      where: {
        sellerId: userId,
        paymentStatus: 'PENDING',
      },
    }),
  ]);

  return {
    revenue: transactions.reduce((sum, t) => sum + (t.amount ? Number(t.amount) : 0), 0),
    sales: transactions.length,
    activeListings: listings,
    rating: user?.rating || 0,
    pendingOrders: pendingTransactions,
  };
}

// ============================================
// Helper Functions
// ============================================

function getPeriodDays(period: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'): number {
  switch (period) {
    case 'WEEK': return 7;
    case 'MONTH': return 30;
    case 'QUARTER': return 90;
    case 'YEAR': return 365;
  }
}

function aggregateWeekly(transactions: { amount: number | null; createdAt: Date }[]): number[] {
  const weeklyRevenue: number[] = [];
  const now = Date.now();

  for (let i = 0; i < 12; i++) {
    const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
    const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000;

    const weekTransactions = transactions.filter(
      (t) => t.createdAt.getTime() >= weekStart && t.createdAt.getTime() < weekEnd
    );

    weeklyRevenue.push(weekTransactions.reduce((sum, t) => sum + (t.amount ? Number(t.amount) : 0), 0));
  }

  return weeklyRevenue.reverse();
}

function calculateTrend(values: number[]): 'UP' | 'DOWN' | 'STABLE' {
  if (values.length < 2) return 'STABLE';

  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, mid);
  const secondHalf = values.slice(mid);

  const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / (firstHalf.length || 1);
  const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / (secondHalf.length || 1);

  const change = avgFirst > 0 ? (avgSecond - avgFirst) / avgFirst : 0;

  if (change > 0.1) return 'UP';
  if (change < -0.1) return 'DOWN';
  return 'STABLE';
}

export type { SellerDashboard };
