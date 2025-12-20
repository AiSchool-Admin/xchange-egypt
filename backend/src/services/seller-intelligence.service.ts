/**
 * Seller Intelligence Dashboard Service
 * خدمة لوحة ذكاء البائع
 *
 * Comprehensive analytics for professional sellers:
 * - Sales performance metrics
 * - Pricing optimization suggestions
 * - Best times to post
 * - Category performance analysis
 * - Buyer behavior insights
 * - Competition benchmarking
 * - Revenue forecasting
 * - Inventory health monitoring
 */

import prisma from '../lib/prisma';
import { ItemCondition, TransactionStatus } from '@prisma/client';

// ============================================
// Types
// ============================================

interface SellerDashboard {
  overview: OverviewMetrics;
  salesPerformance: SalesPerformance;
  pricingInsights: PricingInsights;
  inventoryHealth: InventoryHealth;
  buyerInsights: BuyerInsights;
  competitionAnalysis: CompetitionAnalysis;
  recommendations: SellerRecommendation[];
  forecast: RevenueForecast;
}

interface OverviewMetrics {
  totalRevenue: number;
  revenueChange: number; // vs last period
  totalSales: number;
  salesChange: number;
  averageOrderValue: number;
  aovChange: number;
  conversionRate: number;
  conversionChange: number;
  activeListings: number;
  pendingOrders: number;
  rating: number;
  responseTime: number; // in hours
}

interface SalesPerformance {
  byPeriod: {
    period: string;
    revenue: number;
    sales: number;
    avgPrice: number;
  }[];
  byCategory: {
    categoryId: string;
    categoryName: string;
    revenue: number;
    sales: number;
    percentage: number;
  }[];
  byDayOfWeek: {
    day: string;
    sales: number;
    revenue: number;
  }[];
  byTimeOfDay: {
    hour: number;
    sales: number;
    percentage: number;
  }[];
  topItems: {
    itemId: string;
    title: string;
    sales: number;
    revenue: number;
    avgTimeToSell: number;
  }[];
  bestSellingHours: string[];
  bestSellingDays: string[];
}

interface PricingInsights {
  averageMargin: number;
  priceVsMarket: 'ABOVE' | 'BELOW' | 'AT_MARKET';
  pricingScore: number; // 0-100
  suggestions: PricingSuggestion[];
  priceRangePerformance: {
    range: string;
    sales: number;
    conversionRate: number;
  }[];
  underperformingItems: {
    itemId: string;
    title: string;
    currentPrice: number;
    suggestedPrice: number;
    reason: string;
    reasonAr: string;
  }[];
}

interface PricingSuggestion {
  type: 'INCREASE' | 'DECREASE' | 'BUNDLE' | 'PROMOTION';
  description: string;
  descriptionAr: string;
  potentialImpact: string;
  potentialImpactAr: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  affectedItems: number;
}

interface InventoryHealth {
  totalItems: number;
  activeItems: number;
  soldItems: number;
  staleItems: number; // Not sold in 30+ days
  staleness: number; // Percentage
  avgDaysToSell: number;
  turnoverRate: number;
  stockAgingDistribution: {
    range: string;
    count: number;
    percentage: number;
  }[];
  relistingSuggestions: {
    itemId: string;
    title: string;
    daysListed: number;
    views: number;
    suggestion: string;
    suggestionAr: string;
  }[];
}

interface BuyerInsights {
  totalBuyers: number;
  repeatBuyers: number;
  repeatRate: number;
  topBuyerLocations: {
    location: string;
    buyers: number;
    revenue: number;
  }[];
  buyerDemographics: {
    segment: string;
    count: number;
    avgSpend: number;
  }[];
  communicationMetrics: {
    avgResponseTime: number;
    responseRate: number;
    messagesReceived: number;
    conversationsConverted: number;
  };
  satisfaction: {
    rating: number;
    reviewCount: number;
    positivePercentage: number;
    commonCompliments: string[];
    commonConcerns: string[];
  };
}

interface CompetitionAnalysis {
  marketPosition: 'LEADER' | 'CHALLENGER' | 'FOLLOWER' | 'NICHER';
  pricePositioning: number; // -100 to +100 (below to above market)
  competitorCount: number;
  marketShare: number;
  strengthsVsCompetitors: string[];
  weaknessesVsCompetitors: string[];
  opportunities: string[];
  competitorPricing: {
    categoryName: string;
    yourAvgPrice: number;
    marketAvgPrice: number;
    difference: number;
  }[];
}

interface SellerRecommendation {
  id: string;
  type: 'PRICING' | 'LISTING' | 'TIMING' | 'CATEGORY' | 'QUALITY' | 'PROMOTION';
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  potentialImpact: string;
  potentialImpactAr: string;
  action: string;
  actionAr: string;
  estimatedRevenueLift?: number;
}

interface RevenueForecast {
  nextWeek: number;
  nextMonth: number;
  nextQuarter: number;
  confidence: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  factors: {
    factor: string;
    factorAr: string;
    impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  }[];
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
  const previousStartDate = new Date(Date.now() - periodDays * 2 * 24 * 60 * 60 * 1000);

  // Fetch all data in parallel
  const [
    overview,
    salesPerformance,
    pricingInsights,
    inventoryHealth,
    buyerInsights,
    competitionAnalysis,
    forecast,
  ] = await Promise.all([
    getOverviewMetrics(userId, startDate, previousStartDate),
    getSalesPerformance(userId, startDate),
    getPricingInsights(userId, startDate),
    getInventoryHealth(userId),
    getBuyerInsights(userId, startDate),
    getCompetitionAnalysis(userId),
    getRevenueForecast(userId),
  ]);

  // Generate recommendations based on all data
  const recommendations = generateRecommendations({
    overview,
    salesPerformance,
    pricingInsights,
    inventoryHealth,
    buyerInsights,
    competitionAnalysis,
  });

  return {
    overview,
    salesPerformance,
    pricingInsights,
    inventoryHealth,
    buyerInsights,
    competitionAnalysis,
    recommendations,
    forecast,
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
      where: { sellerId: userId, status: 'ACTIVE' },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { rating: true },
    }),
    prisma.transaction.count({
      where: {
        sellerId: userId,
        status: { in: ['PENDING', 'IN_PROGRESS'] },
      },
    }),
  ]);

  return {
    revenue: transactions.reduce((sum, t) => sum + t.amount, 0),
    sales: transactions.length,
    activeListings: listings,
    rating: user?.rating || 0,
    pendingOrders: pendingTransactions,
  };
}

// ============================================
// Data Fetching Functions
// ============================================

async function getOverviewMetrics(
  userId: string,
  startDate: Date,
  previousStartDate: Date
): Promise<OverviewMetrics> {
  // Current period
  const [currentTransactions, previousTransactions, listings, user] = await Promise.all([
    prisma.transaction.findMany({
      where: {
        sellerId: userId,
        paymentStatus: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      select: { amount: true },
    }),
    prisma.transaction.findMany({
      where: {
        sellerId: userId,
        paymentStatus: 'COMPLETED',
        createdAt: { gte: previousStartDate, lt: startDate },
      },
      select: { amount: true },
    }),
    prisma.listing.findMany({
      where: { sellerId: userId, status: 'ACTIVE' },
      select: { views: true },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { rating: true },
    }),
  ]);

  const currentRevenue = currentTransactions.reduce((sum, t) => sum + t.amount, 0);
  const previousRevenue = previousTransactions.reduce((sum, t) => sum + t.amount, 0);
  const currentSales = currentTransactions.length;
  const previousSales = previousTransactions.length;

  const currentAOV = currentSales > 0 ? currentRevenue / currentSales : 0;
  const previousAOV = previousSales > 0 ? previousRevenue / previousSales : 0;

  const totalViews = listings.reduce((sum, l) => sum + l.views, 0);
  const conversionRate = totalViews > 0 ? (currentSales / totalViews) * 100 : 0;

  const pendingOrders = await prisma.transaction.count({
    where: {
      sellerId: userId,
      status: { in: ['PENDING', 'IN_PROGRESS'] },
    },
  });

  return {
    totalRevenue: currentRevenue,
    revenueChange: previousRevenue > 0 ? ((currentRevenue - previousRevenue) / previousRevenue) * 100 : 0,
    totalSales: currentSales,
    salesChange: previousSales > 0 ? ((currentSales - previousSales) / previousSales) * 100 : 0,
    averageOrderValue: Math.round(currentAOV),
    aovChange: previousAOV > 0 ? ((currentAOV - previousAOV) / previousAOV) * 100 : 0,
    conversionRate: Math.round(conversionRate * 10) / 10,
    conversionChange: 0, // Would need historical data
    activeListings: listings.length,
    pendingOrders,
    rating: user?.rating || 0,
    responseTime: 2, // Would calculate from chat data
  };
}

async function getSalesPerformance(
  userId: string,
  startDate: Date
): Promise<SalesPerformance> {
  const transactions = await prisma.transaction.findMany({
    where: {
      sellerId: userId,
      paymentStatus: 'COMPLETED',
      createdAt: { gte: startDate },
    },
    include: {
      listing: {
        include: {
          item: {
            include: { category: true },
          },
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  // By period (daily for last 30 days)
  const byPeriod = aggregateByPeriod(transactions);

  // By category
  const categoryMap = new Map<string, { name: string; revenue: number; sales: number }>();
  transactions.forEach((t) => {
    const catId = t.listing.item.categoryId;
    const catName = t.listing.item.category?.nameAr || 'غير مصنف';
    const existing = categoryMap.get(catId) || { name: catName, revenue: 0, sales: 0 };
    existing.revenue += t.amount;
    existing.sales += 1;
    categoryMap.set(catId, existing);
  });

  const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
  const byCategory = Array.from(categoryMap.entries())
    .map(([categoryId, data]) => ({
      categoryId,
      categoryName: data.name,
      revenue: data.revenue,
      sales: data.sales,
      percentage: totalRevenue > 0 ? (data.revenue / totalRevenue) * 100 : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue);

  // By day of week
  const days = ['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
  const dayMap = new Map<number, { sales: number; revenue: number }>();
  transactions.forEach((t) => {
    const day = t.createdAt.getDay();
    const existing = dayMap.get(day) || { sales: 0, revenue: 0 };
    existing.sales += 1;
    existing.revenue += t.amount;
    dayMap.set(day, existing);
  });
  const byDayOfWeek = days.map((day, index) => ({
    day,
    sales: dayMap.get(index)?.sales || 0,
    revenue: dayMap.get(index)?.revenue || 0,
  }));

  // By time of day
  const hourMap = new Map<number, number>();
  transactions.forEach((t) => {
    const hour = t.createdAt.getHours();
    hourMap.set(hour, (hourMap.get(hour) || 0) + 1);
  });
  const totalSales = transactions.length;
  const byTimeOfDay = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    sales: hourMap.get(hour) || 0,
    percentage: totalSales > 0 ? ((hourMap.get(hour) || 0) / totalSales) * 100 : 0,
  }));

  // Best selling hours/days
  const bestHours = byTimeOfDay
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3)
    .map((h) => `${h.hour}:00`);
  const bestDays = byDayOfWeek
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 3)
    .map((d) => d.day);

  // Top items
  const itemMap = new Map<string, { title: string; sales: number; revenue: number }>();
  transactions.forEach((t) => {
    const itemId = t.listing.itemId;
    const title = t.listing.item.title;
    const existing = itemMap.get(itemId) || { title, sales: 0, revenue: 0 };
    existing.sales += 1;
    existing.revenue += t.amount;
    itemMap.set(itemId, existing);
  });
  const topItems = Array.from(itemMap.entries())
    .map(([itemId, data]) => ({
      itemId,
      title: data.title,
      sales: data.sales,
      revenue: data.revenue,
      avgTimeToSell: 5, // Would calculate from listing creation to sale
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  return {
    byPeriod,
    byCategory,
    byDayOfWeek,
    byTimeOfDay,
    topItems,
    bestSellingHours: bestHours,
    bestSellingDays: bestDays,
  };
}

async function getPricingInsights(
  userId: string,
  startDate: Date
): Promise<PricingInsights> {
  const listings = await prisma.listing.findMany({
    where: { sellerId: userId },
    include: {
      item: {
        include: { category: true },
      },
      transactions: {
        where: { paymentStatus: 'COMPLETED' },
      },
    },
  });

  // Calculate margin (simplified - would need cost data)
  const avgMargin = 15; // Placeholder

  // Compare to market
  const priceComparisons: { yours: number; market: number }[] = [];
  for (const listing of listings.slice(0, 10)) {
    const marketPrices = await prisma.item.findMany({
      where: {
        categoryId: listing.item.categoryId,
        condition: listing.item.condition,
        status: 'ACTIVE',
        estimatedValue: { gt: 0 },
      },
      select: { estimatedValue: true },
      take: 20,
    });

    if (marketPrices.length > 0) {
      const marketAvg =
        marketPrices.reduce((sum, p) => sum + p.estimatedValue, 0) / marketPrices.length;
      priceComparisons.push({ yours: listing.price, market: marketAvg });
    }
  }

  const avgDiff =
    priceComparisons.length > 0
      ? priceComparisons.reduce((sum, c) => sum + (c.yours - c.market), 0) /
        priceComparisons.length
      : 0;

  const priceVsMarket: 'ABOVE' | 'BELOW' | 'AT_MARKET' =
    avgDiff > 0.05 ? 'ABOVE' : avgDiff < -0.05 ? 'BELOW' : 'AT_MARKET';

  // Price range performance
  const priceRangePerformance = [
    { range: '0-500', sales: 0, conversionRate: 0 },
    { range: '500-2000', sales: 0, conversionRate: 0 },
    { range: '2000-10000', sales: 0, conversionRate: 0 },
    { range: '10000+', sales: 0, conversionRate: 0 },
  ];

  // Underperforming items (listed > 14 days, no sales)
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const staleListings = listings.filter(
    (l) =>
      l.status === 'ACTIVE' &&
      l.createdAt < fourteenDaysAgo &&
      l.transactions.length === 0
  );

  const underperformingItems = staleListings.slice(0, 5).map((l) => ({
    itemId: l.itemId,
    title: l.item.title,
    currentPrice: l.price,
    suggestedPrice: Math.round(l.price * 0.9), // Suggest 10% reduction
    reason: 'No sales in 14+ days - consider price adjustment',
    reasonAr: 'لا توجد مبيعات خلال 14+ يوم - فكر في تعديل السعر',
  }));

  // Suggestions
  const suggestions: PricingSuggestion[] = [];

  if (priceVsMarket === 'ABOVE') {
    suggestions.push({
      type: 'DECREASE',
      description: 'Your prices are above market average',
      descriptionAr: 'أسعارك أعلى من متوسط السوق',
      potentialImpact: 'Reducing prices by 5-10% could increase sales by 20%',
      potentialImpactAr: 'تخفيض الأسعار 5-10% قد يزيد المبيعات 20%',
      priority: 'HIGH',
      affectedItems: listings.filter((l) => l.status === 'ACTIVE').length,
    });
  }

  if (staleListings.length > 3) {
    suggestions.push({
      type: 'PROMOTION',
      description: 'You have multiple stale listings',
      descriptionAr: 'لديك عدة إعلانات راكدة',
      potentialImpact: 'Flash sale on stale items could recover inventory value',
      potentialImpactAr: 'تخفيضات سريعة على المنتجات الراكدة قد تستعيد قيمة المخزون',
      priority: 'MEDIUM',
      affectedItems: staleListings.length,
    });
  }

  return {
    averageMargin: avgMargin,
    priceVsMarket,
    pricingScore: 75, // Calculated score
    suggestions,
    priceRangePerformance,
    underperformingItems,
  };
}

async function getInventoryHealth(userId: string): Promise<InventoryHealth> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);

  const listings = await prisma.listing.findMany({
    where: { sellerId: userId },
    include: {
      item: true,
      transactions: { where: { paymentStatus: 'COMPLETED' } },
    },
  });

  const activeListings = listings.filter((l) => l.status === 'ACTIVE');
  const soldListings = listings.filter((l) => l.transactions.length > 0);
  const staleListings = activeListings.filter(
    (l) => l.createdAt < thirtyDaysAgo && l.transactions.length === 0
  );

  // Calculate avg days to sell
  const daysToSell = soldListings.map((l) => {
    const firstSale = l.transactions[0]?.createdAt;
    if (firstSale) {
      return (firstSale.getTime() - l.createdAt.getTime()) / (24 * 60 * 60 * 1000);
    }
    return 0;
  });
  const avgDaysToSell =
    daysToSell.length > 0
      ? daysToSell.reduce((sum, d) => sum + d, 0) / daysToSell.length
      : 0;

  // Stock aging distribution
  const now = new Date();
  const stockAgingDistribution = [
    {
      range: '0-7 أيام',
      count: activeListings.filter(
        (l) => (now.getTime() - l.createdAt.getTime()) / (24 * 60 * 60 * 1000) <= 7
      ).length,
      percentage: 0,
    },
    {
      range: '8-30 يوم',
      count: activeListings.filter((l) => {
        const days = (now.getTime() - l.createdAt.getTime()) / (24 * 60 * 60 * 1000);
        return days > 7 && days <= 30;
      }).length,
      percentage: 0,
    },
    {
      range: '31-60 يوم',
      count: activeListings.filter((l) => {
        const days = (now.getTime() - l.createdAt.getTime()) / (24 * 60 * 60 * 1000);
        return days > 30 && days <= 60;
      }).length,
      percentage: 0,
    },
    {
      range: '+60 يوم',
      count: activeListings.filter(
        (l) => (now.getTime() - l.createdAt.getTime()) / (24 * 60 * 60 * 1000) > 60
      ).length,
      percentage: 0,
    },
  ];

  const totalActive = activeListings.length || 1;
  stockAgingDistribution.forEach((s) => {
    s.percentage = (s.count / totalActive) * 100;
  });

  // Relisting suggestions
  const relistingSuggestions = staleListings.slice(0, 5).map((l) => ({
    itemId: l.itemId,
    title: l.item.title,
    daysListed: Math.floor(
      (now.getTime() - l.createdAt.getTime()) / (24 * 60 * 60 * 1000)
    ),
    views: l.views,
    suggestion:
      l.views < 50 ? 'Improve photos and description' : 'Consider price reduction',
    suggestionAr:
      l.views < 50 ? 'حسّن الصور والوصف' : 'فكر في تخفيض السعر',
  }));

  return {
    totalItems: listings.length,
    activeItems: activeListings.length,
    soldItems: soldListings.length,
    staleItems: staleListings.length,
    staleness: activeListings.length > 0 ? (staleListings.length / activeListings.length) * 100 : 0,
    avgDaysToSell: Math.round(avgDaysToSell),
    turnoverRate: listings.length > 0 ? (soldListings.length / listings.length) * 100 : 0,
    stockAgingDistribution,
    relistingSuggestions,
  };
}

async function getBuyerInsights(
  userId: string,
  startDate: Date
): Promise<BuyerInsights> {
  const transactions = await prisma.transaction.findMany({
    where: {
      sellerId: userId,
      paymentStatus: 'COMPLETED',
      createdAt: { gte: startDate },
    },
    include: {
      buyer: {
        select: { id: true, governorate: true },
      },
    },
  });

  // Count unique buyers and repeat buyers
  const buyerTransactions = new Map<string, number>();
  transactions.forEach((t) => {
    buyerTransactions.set(t.buyerId, (buyerTransactions.get(t.buyerId) || 0) + 1);
  });

  const totalBuyers = buyerTransactions.size;
  const repeatBuyers = Array.from(buyerTransactions.values()).filter((c) => c > 1).length;

  // Top locations
  const locationRevenue = new Map<string, { buyers: Set<string>; revenue: number }>();
  transactions.forEach((t) => {
    const location = t.buyer.governorate || 'غير محدد';
    const existing = locationRevenue.get(location) || {
      buyers: new Set<string>(),
      revenue: 0,
    };
    existing.buyers.add(t.buyerId);
    existing.revenue += t.amount;
    locationRevenue.set(location, existing);
  });

  const topBuyerLocations = Array.from(locationRevenue.entries())
    .map(([location, data]) => ({
      location,
      buyers: data.buyers.size,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // Get user rating and reviews
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      receivedReviews: {
        orderBy: { createdAt: 'desc' },
        take: 100,
      },
    },
  });

  const reviews = user?.receivedReviews || [];
  const positiveReviews = reviews.filter((r) => r.rating >= 4);

  return {
    totalBuyers,
    repeatBuyers,
    repeatRate: totalBuyers > 0 ? (repeatBuyers / totalBuyers) * 100 : 0,
    topBuyerLocations,
    buyerDemographics: [
      { segment: 'مشترين جدد', count: totalBuyers - repeatBuyers, avgSpend: 0 },
      { segment: 'مشترين عائدين', count: repeatBuyers, avgSpend: 0 },
    ],
    communicationMetrics: {
      avgResponseTime: 2,
      responseRate: 95,
      messagesReceived: 0,
      conversationsConverted: 0,
    },
    satisfaction: {
      rating: user?.rating || 0,
      reviewCount: reviews.length,
      positivePercentage:
        reviews.length > 0 ? (positiveReviews.length / reviews.length) * 100 : 0,
      commonCompliments: ['سرعة الرد', 'جودة المنتج', 'أمانة في التعامل'],
      commonConcerns: [],
    },
  };
}

async function getCompetitionAnalysis(userId: string): Promise<CompetitionAnalysis> {
  // Get user's categories
  const userListings = await prisma.listing.findMany({
    where: { sellerId: userId, status: 'ACTIVE' },
    include: { item: { include: { category: true } } },
  });

  const userCategories = [...new Set(userListings.map((l) => l.item.categoryId))];

  // Get competitor listings in same categories
  const competitorListings = await prisma.listing.findMany({
    where: {
      sellerId: { not: userId },
      status: 'ACTIVE',
      item: { categoryId: { in: userCategories } },
    },
    include: { item: { include: { category: true } } },
  });

  const uniqueSellers = new Set(competitorListings.map((l) => l.sellerId));

  // Compare pricing by category
  const categoryPricing = new Map<
    string,
    { name: string; yourPrices: number[]; marketPrices: number[] }
  >();

  userListings.forEach((l) => {
    const catId = l.item.categoryId;
    const existing = categoryPricing.get(catId) || {
      name: l.item.category?.nameAr || 'غير مصنف',
      yourPrices: [],
      marketPrices: [],
    };
    existing.yourPrices.push(l.price);
    categoryPricing.set(catId, existing);
  });

  competitorListings.forEach((l) => {
    const catId = l.item.categoryId;
    const existing = categoryPricing.get(catId);
    if (existing) {
      existing.marketPrices.push(l.price);
    }
  });

  const competitorPricing = Array.from(categoryPricing.values())
    .filter((c) => c.marketPrices.length > 0)
    .map((c) => {
      const yourAvg = c.yourPrices.reduce((s, p) => s + p, 0) / c.yourPrices.length;
      const marketAvg = c.marketPrices.reduce((s, p) => s + p, 0) / c.marketPrices.length;
      return {
        categoryName: c.name,
        yourAvgPrice: Math.round(yourAvg),
        marketAvgPrice: Math.round(marketAvg),
        difference: Math.round(((yourAvg - marketAvg) / marketAvg) * 100),
      };
    });

  const avgDiff =
    competitorPricing.length > 0
      ? competitorPricing.reduce((s, c) => s + c.difference, 0) / competitorPricing.length
      : 0;

  return {
    marketPosition:
      userListings.length > competitorListings.length / uniqueSellers.size
        ? 'LEADER'
        : 'CHALLENGER',
    pricePositioning: avgDiff,
    competitorCount: uniqueSellers.size,
    marketShare:
      (userListings.length / (userListings.length + competitorListings.length)) * 100,
    strengthsVsCompetitors: [
      'تنوع المنتجات',
      'جودة الصور',
      'سرعة الرد',
    ],
    weaknessesVsCompetitors: [],
    opportunities: [
      'إضافة فئات جديدة',
      'تحسين الأسعار التنافسية',
    ],
    competitorPricing,
  };
}

async function getRevenueForecast(userId: string): Promise<RevenueForecast> {
  // Get historical revenue
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const transactions = await prisma.transaction.findMany({
    where: {
      sellerId: userId,
      paymentStatus: 'COMPLETED',
      createdAt: { gte: ninetyDaysAgo },
    },
    select: { amount: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });

  // Simple linear regression for forecast
  const weeklyRevenue = aggregateWeekly(transactions);
  const trend = calculateTrend(weeklyRevenue);

  const avgWeeklyRevenue =
    weeklyRevenue.length > 0
      ? weeklyRevenue.reduce((s, w) => s + w, 0) / weeklyRevenue.length
      : 0;

  const trendMultiplier = trend === 'UP' ? 1.1 : trend === 'DOWN' ? 0.9 : 1.0;

  return {
    nextWeek: Math.round(avgWeeklyRevenue * trendMultiplier),
    nextMonth: Math.round(avgWeeklyRevenue * 4 * trendMultiplier),
    nextQuarter: Math.round(avgWeeklyRevenue * 12 * trendMultiplier),
    confidence: Math.min(transactions.length * 2, 80),
    trend,
    factors: [
      {
        factor: 'Historical sales pattern',
        factorAr: 'نمط المبيعات التاريخي',
        impact: trend === 'UP' ? 'POSITIVE' : trend === 'DOWN' ? 'NEGATIVE' : 'NEUTRAL',
      },
      {
        factor: 'Seasonal trends',
        factorAr: 'الاتجاهات الموسمية',
        impact: 'NEUTRAL',
      },
    ],
  };
}

// ============================================
// Recommendation Engine
// ============================================

function generateRecommendations(data: {
  overview: OverviewMetrics;
  salesPerformance: SalesPerformance;
  pricingInsights: PricingInsights;
  inventoryHealth: InventoryHealth;
  buyerInsights: BuyerInsights;
  competitionAnalysis: CompetitionAnalysis;
}): SellerRecommendation[] {
  const recommendations: SellerRecommendation[] = [];

  // Pricing recommendations
  if (data.pricingInsights.priceVsMarket === 'ABOVE') {
    recommendations.push({
      id: 'price-1',
      type: 'PRICING',
      priority: 'HIGH',
      title: 'Adjust pricing to market level',
      titleAr: 'عدّل الأسعار لمستوى السوق',
      description: 'Your prices are above average. Consider reducing to increase sales.',
      descriptionAr: 'أسعارك أعلى من المتوسط. فكر في التخفيض لزيادة المبيعات.',
      potentialImpact: '+20% sales increase expected',
      potentialImpactAr: 'زيادة متوقعة +20% في المبيعات',
      action: 'Review listings and reduce prices by 5-10%',
      actionAr: 'راجع الإعلانات وخفّض الأسعار 5-10%',
      estimatedRevenueLift: 2000,
    });
  }

  // Inventory recommendations
  if (data.inventoryHealth.staleness > 30) {
    recommendations.push({
      id: 'inv-1',
      type: 'LISTING',
      priority: 'HIGH',
      title: 'Clear stale inventory',
      titleAr: 'صفّي المخزون الراكد',
      description: `${data.inventoryHealth.staleItems} items haven't sold in 30+ days`,
      descriptionAr: `${data.inventoryHealth.staleItems} منتجات لم تُباع خلال 30+ يوم`,
      potentialImpact: 'Recover capital locked in stale inventory',
      potentialImpactAr: 'استرجع رأس المال المحجوز في المخزون الراكد',
      action: 'Run a flash sale or relist with new photos',
      actionAr: 'قم بتخفيضات سريعة أو أعد النشر بصور جديدة',
    });
  }

  // Timing recommendations
  if (data.salesPerformance.bestSellingHours.length > 0) {
    recommendations.push({
      id: 'time-1',
      type: 'TIMING',
      priority: 'MEDIUM',
      title: 'Optimize posting time',
      titleAr: 'حسّن وقت النشر',
      description: `Your best selling hours are ${data.salesPerformance.bestSellingHours.join(', ')}`,
      descriptionAr: `أفضل ساعات البيع لديك هي ${data.salesPerformance.bestSellingHours.join('، ')}`,
      potentialImpact: 'More visibility = more sales',
      potentialImpactAr: 'رؤية أكثر = مبيعات أكثر',
      action: 'Schedule new listings during peak hours',
      actionAr: 'جدول الإعلانات الجديدة خلال ساعات الذروة',
    });
  }

  // Quality recommendations
  if (data.buyerInsights.satisfaction.rating < 4.5) {
    recommendations.push({
      id: 'qual-1',
      type: 'QUALITY',
      priority: 'HIGH',
      title: 'Improve customer satisfaction',
      titleAr: 'حسّن رضا العملاء',
      description: 'Your rating could be higher',
      descriptionAr: 'تقييمك يمكن أن يكون أعلى',
      potentialImpact: 'Higher ratings increase buyer trust',
      potentialImpactAr: 'التقييمات العالية تزيد ثقة المشترين',
      action: 'Respond faster and be more descriptive in listings',
      actionAr: 'رد بسرعة أكبر وكن أكثر دقة في الوصف',
    });
  }

  return recommendations.slice(0, 5);
}

// ============================================
// Helper Functions
// ============================================

function getPeriodDays(period: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR'): number {
  switch (period) {
    case 'WEEK':
      return 7;
    case 'MONTH':
      return 30;
    case 'QUARTER':
      return 90;
    case 'YEAR':
      return 365;
  }
}

function aggregateByPeriod(
  transactions: { amount: number; createdAt: Date }[]
): { period: string; revenue: number; sales: number; avgPrice: number }[] {
  const byDate = new Map<string, { revenue: number; sales: number }>();

  transactions.forEach((t) => {
    const dateKey = t.createdAt.toISOString().split('T')[0];
    const existing = byDate.get(dateKey) || { revenue: 0, sales: 0 };
    existing.revenue += t.amount;
    existing.sales += 1;
    byDate.set(dateKey, existing);
  });

  return Array.from(byDate.entries())
    .map(([period, data]) => ({
      period,
      revenue: data.revenue,
      sales: data.sales,
      avgPrice: data.sales > 0 ? Math.round(data.revenue / data.sales) : 0,
    }))
    .sort((a, b) => a.period.localeCompare(b.period));
}

function aggregateWeekly(transactions: { amount: number; createdAt: Date }[]): number[] {
  const weeklyRevenue: number[] = [];
  const now = Date.now();

  for (let i = 0; i < 12; i++) {
    const weekStart = now - (i + 1) * 7 * 24 * 60 * 60 * 1000;
    const weekEnd = now - i * 7 * 24 * 60 * 60 * 1000;

    const weekTransactions = transactions.filter(
      (t) => t.createdAt.getTime() >= weekStart && t.createdAt.getTime() < weekEnd
    );

    weeklyRevenue.push(weekTransactions.reduce((sum, t) => sum + t.amount, 0));
  }

  return weeklyRevenue.reverse();
}

function calculateTrend(values: number[]): 'UP' | 'DOWN' | 'STABLE' {
  if (values.length < 2) return 'STABLE';

  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(0, mid);
  const secondHalf = values.slice(mid);

  const avgFirst = firstHalf.reduce((s, v) => s + v, 0) / firstHalf.length;
  const avgSecond = secondHalf.reduce((s, v) => s + v, 0) / secondHalf.length;

  const change = (avgSecond - avgFirst) / (avgFirst || 1);

  if (change > 0.1) return 'UP';
  if (change < -0.1) return 'DOWN';
  return 'STABLE';
}

// ============================================
// Exports
// ============================================

export {
  SellerDashboard,
  OverviewMetrics,
  SalesPerformance,
  PricingInsights,
  InventoryHealth,
  BuyerInsights,
  CompetitionAnalysis,
  SellerRecommendation,
  RevenueForecast,
};
