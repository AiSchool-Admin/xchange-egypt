/**
 * AI Price Prediction Service
 * خدمة التنبؤ بالأسعار بالذكاء الاصطناعي
 *
 * Advanced ML-based price prediction with:
 * - Historical data analysis
 * - Market trend detection
 * - Seasonal adjustments
 * - Demand/Supply analysis
 * - Competition analysis
 */

import prisma from '../lib/prisma';
import { ItemCondition } from '../types';

// ============================================
// Types
// ============================================

interface PredictionResult {
  predictedPrice: number;
  confidenceScore: number;
  priceRange: {
    min: number;
    max: number;
  };
  marketAnalysis: {
    trend: 'UP' | 'DOWN' | 'STABLE';
    demandLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    competitionLevel: 'HIGH' | 'MEDIUM' | 'LOW';
    seasonalFactor: number;
  };
  recommendations: PriceRecommendation[];
  dataQuality: 'EXCELLENT' | 'GOOD' | 'LIMITED';
  sampleSize: number;
  modelVersion: string;
}

interface PriceRecommendation {
  type: 'COMPETITIVE' | 'PREMIUM' | 'VALUE' | 'QUICK_SALE';
  price: number;
  description: string;
  descriptionAr: string;
  expectedDays: number;
}

interface PredictionParams {
  categoryId: string;
  condition: ItemCondition;
  title?: string;
  description?: string;
  userId?: string;
  itemId?: string;
  governorate?: string;
}

interface MarketTrendData {
  trend: 'UP' | 'DOWN' | 'STABLE';
  changePercent: number;
  dataPoints: { date: Date; avgPrice: number }[];
}

// ============================================
// Configuration
// ============================================

const MODEL_VERSION = 'v2.0.0';

const CONDITION_MULTIPLIERS: Record<ItemCondition, number> = {
  NEW: 1.0,
  LIKE_NEW: 0.85,
  GOOD: 0.65,
  FAIR: 0.45,
  POOR: 0.30,
};

const SEASONAL_FACTORS: Record<number, Record<string, number>> = {
  // Month -> Category type -> Factor
  1: { default: 0.95, electronics: 1.1 },  // يناير - بعد الأعياد
  2: { default: 1.0, electronics: 1.0 },
  3: { default: 1.0, fashion: 1.1 },       // الربيع
  4: { default: 1.05, vehicles: 1.1 },
  5: { default: 1.0 },
  6: { default: 0.95 },                    // الصيف
  7: { default: 0.9 },
  8: { default: 0.95, electronics: 1.15 }, // العودة للمدارس
  9: { default: 1.05, electronics: 1.2 },
  10: { default: 1.0 },
  11: { default: 1.1 },                    // Black Friday
  12: { default: 1.15 },                   // نهاية السنة
};

// ============================================
// Main Prediction Functions
// ============================================

/**
 * Generate AI-powered price prediction
 */
export async function predictPrice(params: PredictionParams): Promise<PredictionResult> {
  const { categoryId, condition, title, description, governorate } = params;

  // Step 1: Gather historical data
  const historicalData = await gatherHistoricalData(categoryId, condition, governorate);

  // Step 2: Analyze market trends
  const marketTrend = await analyzeMarketTrend(categoryId, 30);

  // Step 3: Analyze demand/supply
  const demandAnalysis = await analyzeDemandSupply(categoryId);

  // Step 4: Analyze competition
  const competitionAnalysis = await analyzeCompetition(categoryId, condition);

  // Step 5: Calculate seasonal factor
  const seasonalFactor = calculateSeasonalFactor(categoryId);

  // Step 6: Generate base prediction
  let basePrediction = calculateBasePrediction(historicalData, condition);

  // Step 7: Apply adjustments
  basePrediction = applyMarketAdjustments(basePrediction, {
    marketTrend,
    demandAnalysis,
    competitionAnalysis,
    seasonalFactor,
  });

  // Step 8: Calculate confidence
  const confidence = calculateConfidence(historicalData.sampleSize, historicalData.variance);

  // Step 9: Generate price range
  const priceRange = calculatePriceRange(basePrediction, confidence);

  // Step 10: Generate recommendations
  const recommendations = generateRecommendations(basePrediction, {
    marketTrend,
    demandAnalysis,
    competitionAnalysis,
  });

  // Step 11: Determine data quality
  const dataQuality = determineDataQuality(historicalData.sampleSize, historicalData.recency);

  // Step 12: Store prediction
  const prediction = await storePrediction({
    categoryId,
    condition,
    title,
    description,
    predictedPrice: basePrediction,
    confidenceScore: confidence,
    priceRangeMin: priceRange.min,
    priceRangeMax: priceRange.max,
    marketTrend: marketTrend.trend,
    demandLevel: demandAnalysis.level,
    competitionLevel: competitionAnalysis.level,
    seasonalFactor,
    sampleSize: historicalData.sampleSize,
    dataQuality,
    userId: params.userId,
    itemId: params.itemId,
    recommendations,
  });

  return {
    predictedPrice: Math.round(basePrediction),
    confidenceScore: Math.round(confidence),
    priceRange: {
      min: Math.round(priceRange.min),
      max: Math.round(priceRange.max),
    },
    marketAnalysis: {
      trend: marketTrend.trend,
      demandLevel: demandAnalysis.level,
      competitionLevel: competitionAnalysis.level,
      seasonalFactor,
    },
    recommendations,
    dataQuality,
    sampleSize: historicalData.sampleSize,
    modelVersion: MODEL_VERSION,
  };
}

/**
 * Get price prediction by ID
 */
export async function getPrediction(predictionId: string) {
  return prisma.pricePrediction.findUnique({
    where: { id: predictionId },
    include: { category: true },
  });
}

/**
 * Get user's prediction history
 */
export async function getUserPredictions(userId: string, limit: number = 20) {
  return prisma.pricePrediction.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
    include: { category: true },
  });
}

// ============================================
// Historical Data Analysis
// ============================================

interface HistoricalData {
  prices: number[];
  sampleSize: number;
  median: number;
  mean: number;
  variance: number;
  recency: number; // Average days since listing
}

async function gatherHistoricalData(
  categoryId: string,
  condition: ItemCondition,
  governorate?: string
): Promise<HistoricalData> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

  // Get category hierarchy for broader search
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { parent: { include: { parent: true } } },
  });

  const categoryIds = [
    categoryId,
    category?.parentId,
    category?.parent?.parentId,
  ].filter(Boolean) as string[];

  // First try: exact match with recent data
  let items = await prisma.item.findMany({
    where: {
      categoryId,
      condition,
      status: 'ACTIVE',
      estimatedValue: { gt: 0 },
      createdAt: { gte: thirtyDaysAgo },
      ...(governorate && { user: { governorate } }),
    },
    select: {
      estimatedValue: true,
      condition: true,
      createdAt: true,
    },
    take: 100,
  });

  // Fallback 1: Same category, any condition, 90 days
  if (items.length < 10) {
    items = await prisma.item.findMany({
      where: {
        categoryId: { in: categoryIds.slice(0, 2) },
        status: 'ACTIVE',
        estimatedValue: { gt: 0 },
        createdAt: { gte: ninetyDaysAgo },
      },
      select: {
        estimatedValue: true,
        condition: true,
        createdAt: true,
      },
      take: 200,
    });

    // Normalize prices by condition
    items = items.map(item => ({
      ...item,
      estimatedValue: normalizeByCondition(item.estimatedValue, item.condition, condition),
    }));
  }

  if (items.length === 0) {
    return {
      prices: [],
      sampleSize: 0,
      median: 0,
      mean: 0,
      variance: 0,
      recency: 0,
    };
  }

  const prices = items.map(i => i.estimatedValue);
  const mean = calculateMean(prices);
  const median = calculateMedian(prices);
  const variance = calculateVariance(prices, mean);

  // Calculate average recency
  const now = Date.now();
  const avgRecency = items.reduce((sum, i) =>
    sum + (now - i.createdAt.getTime()) / (24 * 60 * 60 * 1000), 0
  ) / items.length;

  return {
    prices,
    sampleSize: items.length,
    median,
    mean,
    variance,
    recency: avgRecency,
  };
}

function normalizeByCondition(
  price: number,
  fromCondition: ItemCondition,
  toCondition: ItemCondition
): number {
  const fromMultiplier = CONDITION_MULTIPLIERS[fromCondition];
  const toMultiplier = CONDITION_MULTIPLIERS[toCondition];
  return price * (toMultiplier / fromMultiplier);
}

// ============================================
// Market Analysis
// ============================================

async function analyzeMarketTrend(
  categoryId: string,
  days: number
): Promise<MarketTrendData> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const items = await prisma.item.findMany({
    where: {
      categoryId,
      status: 'ACTIVE',
      estimatedValue: { gt: 0 },
      createdAt: { gte: startDate },
    },
    select: {
      estimatedValue: true,
      createdAt: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  if (items.length < 5) {
    return { trend: 'STABLE', changePercent: 0, dataPoints: [] };
  }

  // Split into two halves
  const midPoint = Math.floor(items.length / 2);
  const firstHalf = items.slice(0, midPoint);
  const secondHalf = items.slice(midPoint);

  const avgFirst = calculateMean(firstHalf.map(i => i.estimatedValue));
  const avgSecond = calculateMean(secondHalf.map(i => i.estimatedValue));

  const changePercent = ((avgSecond - avgFirst) / avgFirst) * 100;

  let trend: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
  if (changePercent > 5) trend = 'UP';
  else if (changePercent < -5) trend = 'DOWN';

  // Generate data points for chart
  const dataPoints = aggregateByDay(items);

  return { trend, changePercent, dataPoints };
}

interface DemandAnalysis {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  ratio: number;
  wishlistCount: number;
  viewsPerListing: number;
}

async function analyzeDemandSupply(categoryId: string): Promise<DemandAnalysis> {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  // Count active supply (DIRECT_SALE)
  const supplyCount = await prisma.item.count({
    where: {
      categoryId,
      status: 'ACTIVE',
      listingType: 'DIRECT_SALE',
    },
  });

  // Count demand (wishlist + demand listings)
  const [wishlistCount, demandCount] = await Promise.all([
    prisma.wishListItem.count({
      where: { categoryId },
    }),
    prisma.item.count({
      where: {
        categoryId,
        status: 'ACTIVE',
        listingType: 'DIRECT_BUY',
      },
    }),
  ]);

  // Calculate average views
  const listings = await prisma.listing.findMany({
    where: {
      item: { categoryId },
      status: 'ACTIVE',
      createdAt: { gte: thirtyDaysAgo },
    },
    select: { views: true },
  });

  const avgViews = listings.length > 0
    ? listings.reduce((sum, l) => sum + l.views, 0) / listings.length
    : 0;

  const totalDemand = wishlistCount + demandCount;
  const ratio = supplyCount > 0 ? totalDemand / supplyCount : 0;

  let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  if (ratio > 2 || avgViews > 50) level = 'HIGH';
  else if (ratio < 0.5 && avgViews < 10) level = 'LOW';

  return {
    level,
    ratio,
    wishlistCount,
    viewsPerListing: avgViews,
  };
}

interface CompetitionAnalysis {
  level: 'HIGH' | 'MEDIUM' | 'LOW';
  activeListings: number;
  avgDaysToSell: number;
  priceDispersion: number;
}

async function analyzeCompetition(
  categoryId: string,
  condition: ItemCondition
): Promise<CompetitionAnalysis> {
  // Count active listings
  const activeListings = await prisma.listing.count({
    where: {
      item: { categoryId, condition },
      status: 'ACTIVE',
    },
  });

  // Calculate average days to sell
  const completedTransactions = await prisma.transaction.findMany({
    where: {
      listing: { item: { categoryId } },
      paymentStatus: 'COMPLETED',
    },
    select: {
      createdAt: true,
      listing: {
        select: { createdAt: true },
      },
    },
    take: 50,
    orderBy: { createdAt: 'desc' },
  });

  const avgDaysToSell = completedTransactions.length > 0
    ? completedTransactions.reduce((sum, t) => {
        const days = (t.createdAt.getTime() - t.listing.createdAt.getTime()) / (24 * 60 * 60 * 1000);
        return sum + days;
      }, 0) / completedTransactions.length
    : 30; // Default assumption

  // Calculate price dispersion (coefficient of variation)
  const prices = await prisma.item.findMany({
    where: {
      categoryId,
      condition,
      status: 'ACTIVE',
      estimatedValue: { gt: 0 },
    },
    select: { estimatedValue: true },
  });

  let priceDispersion = 0;
  if (prices.length > 1) {
    const mean = calculateMean(prices.map(p => p.estimatedValue));
    const stdDev = Math.sqrt(calculateVariance(prices.map(p => p.estimatedValue), mean));
    priceDispersion = stdDev / mean;
  }

  let level: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  if (activeListings > 50 || avgDaysToSell < 7) level = 'HIGH';
  else if (activeListings < 10 && avgDaysToSell > 30) level = 'LOW';

  return {
    level,
    activeListings,
    avgDaysToSell,
    priceDispersion,
  };
}

function calculateSeasonalFactor(categoryId: string): number {
  const month = new Date().getMonth() + 1;
  const monthFactors = SEASONAL_FACTORS[month] || { default: 1.0 };

  // TODO: Map categoryId to category type for better seasonal factors
  return monthFactors.default;
}

// ============================================
// Prediction Calculation
// ============================================

function calculateBasePrediction(
  historicalData: HistoricalData,
  condition: ItemCondition
): number {
  if (historicalData.sampleSize === 0) {
    return 0;
  }

  // Use weighted average of median and mean
  // Median is more robust against outliers
  const weightedPrice = historicalData.median * 0.7 + historicalData.mean * 0.3;

  return weightedPrice;
}

interface Adjustments {
  marketTrend: MarketTrendData;
  demandAnalysis: DemandAnalysis;
  competitionAnalysis: CompetitionAnalysis;
  seasonalFactor: number;
}

function applyMarketAdjustments(price: number, adjustments: Adjustments): number {
  let adjustedPrice = price;

  // Apply market trend adjustment (-5% to +5%)
  if (adjustments.marketTrend.trend === 'UP') {
    adjustedPrice *= 1 + Math.min(adjustments.marketTrend.changePercent, 10) / 200;
  } else if (adjustments.marketTrend.trend === 'DOWN') {
    adjustedPrice *= 1 + Math.max(adjustments.marketTrend.changePercent, -10) / 200;
  }

  // Apply demand adjustment (-10% to +10%)
  if (adjustments.demandAnalysis.level === 'HIGH') {
    adjustedPrice *= 1.05;
  } else if (adjustments.demandAnalysis.level === 'LOW') {
    adjustedPrice *= 0.95;
  }

  // Apply competition adjustment (-5% to +5%)
  if (adjustments.competitionAnalysis.level === 'HIGH') {
    adjustedPrice *= 0.97;
  } else if (adjustments.competitionAnalysis.level === 'LOW') {
    adjustedPrice *= 1.03;
  }

  // Apply seasonal factor
  adjustedPrice *= adjustments.seasonalFactor;

  return adjustedPrice;
}

function calculateConfidence(sampleSize: number, variance: number): number {
  // Base confidence from sample size (0-60)
  let confidence = Math.min(sampleSize * 1.5, 60);

  // Adjust for variance (0-40)
  if (variance > 0) {
    const coefficientOfVariation = Math.sqrt(variance) / sampleSize;
    if (coefficientOfVariation < 0.2) {
      confidence += 30;
    } else if (coefficientOfVariation < 0.4) {
      confidence += 20;
    } else if (coefficientOfVariation < 0.6) {
      confidence += 10;
    }
  } else {
    confidence += 20;
  }

  return Math.min(confidence, 95);
}

function calculatePriceRange(
  price: number,
  confidence: number
): { min: number; max: number } {
  // Higher confidence = narrower range
  const rangePercent = 0.30 - (confidence / 100) * 0.15;

  return {
    min: price * (1 - rangePercent),
    max: price * (1 + rangePercent),
  };
}

// ============================================
// Recommendations
// ============================================

interface RecommendationContext {
  marketTrend: MarketTrendData;
  demandAnalysis: DemandAnalysis;
  competitionAnalysis: CompetitionAnalysis;
}

function generateRecommendations(
  basePrice: number,
  context: RecommendationContext
): PriceRecommendation[] {
  const recommendations: PriceRecommendation[] = [];

  // Quick Sale price (10-15% below)
  recommendations.push({
    type: 'QUICK_SALE',
    price: Math.round(basePrice * 0.88),
    description: 'For quick sale within days',
    descriptionAr: 'للبيع السريع خلال أيام',
    expectedDays: context.demandAnalysis.level === 'HIGH' ? 2 : 5,
  });

  // Competitive price (5% below)
  recommendations.push({
    type: 'COMPETITIVE',
    price: Math.round(basePrice * 0.95),
    description: 'Competitive price for faster sale',
    descriptionAr: 'سعر تنافسي لبيع أسرع',
    expectedDays: context.demandAnalysis.level === 'HIGH' ? 5 : 10,
  });

  // Value price (market average)
  recommendations.push({
    type: 'VALUE',
    price: Math.round(basePrice),
    description: 'Fair market value',
    descriptionAr: 'القيمة السوقية العادلة',
    expectedDays: context.competitionAnalysis.avgDaysToSell || 14,
  });

  // Premium price (5-10% above)
  if (context.demandAnalysis.level === 'HIGH' || context.competitionAnalysis.level === 'LOW') {
    recommendations.push({
      type: 'PREMIUM',
      price: Math.round(basePrice * 1.08),
      description: 'Premium price for high demand',
      descriptionAr: 'سعر مميز للطلب العالي',
      expectedDays: 21,
    });
  }

  return recommendations;
}

function determineDataQuality(
  sampleSize: number,
  recency: number
): 'EXCELLENT' | 'GOOD' | 'LIMITED' {
  if (sampleSize >= 30 && recency <= 14) return 'EXCELLENT';
  if (sampleSize >= 10 && recency <= 30) return 'GOOD';
  return 'LIMITED';
}

// ============================================
// Price History Management
// ============================================

/**
 * Record price history for a category
 */
export async function recordPriceHistory(categoryId: string) {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get today's prices by condition
  const conditions: ItemCondition[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];

  for (const condition of conditions) {
    const items = await prisma.item.findMany({
      where: {
        categoryId,
        condition,
        status: 'ACTIVE',
        estimatedValue: { gt: 0 },
      },
      select: { estimatedValue: true },
    });

    if (items.length === 0) continue;

    const prices = items.map(i => i.estimatedValue);
    const avgPrice = calculateMean(prices);
    const medianPrice = calculateMedian(prices);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    await prisma.priceHistory.upsert({
      where: {
        categoryId_condition_date_periodType: {
          categoryId,
          condition,
          date: today,
          periodType: 'DAILY',
        },
      },
      update: {
        avgPrice,
        medianPrice,
        minPrice,
        maxPrice,
        sampleCount: items.length,
        totalVolume: prices.reduce((sum, p) => sum + p, 0),
      },
      create: {
        categoryId,
        condition,
        date: today,
        periodType: 'DAILY',
        avgPrice,
        medianPrice,
        minPrice,
        maxPrice,
        sampleCount: items.length,
        totalVolume: prices.reduce((sum, p) => sum + p, 0),
      },
    });
  }
}

/**
 * Get price history for a category
 */
export async function getPriceHistory(
  categoryId: string,
  condition?: ItemCondition,
  days: number = 30
) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  return prisma.priceHistory.findMany({
    where: {
      categoryId,
      ...(condition && { condition }),
      date: { gte: startDate },
      periodType: 'DAILY',
    },
    orderBy: { date: 'asc' },
  });
}

// ============================================
// Storage
// ============================================

interface StorePredictionParams {
  categoryId: string;
  condition: ItemCondition;
  title?: string;
  description?: string;
  predictedPrice: number;
  confidenceScore: number;
  priceRangeMin: number;
  priceRangeMax: number;
  marketTrend: string;
  demandLevel: string;
  competitionLevel: string;
  seasonalFactor: number;
  sampleSize: number;
  dataQuality: string;
  userId?: string;
  itemId?: string;
  recommendations: PriceRecommendation[];
}

async function storePrediction(params: StorePredictionParams) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days validity

  return prisma.pricePrediction.create({
    data: {
      categoryId: params.categoryId,
      condition: params.condition,
      title: params.title,
      description: params.description,
      predictedPrice: params.predictedPrice,
      confidenceScore: params.confidenceScore,
      priceRangeMin: params.priceRangeMin,
      priceRangeMax: params.priceRangeMax,
      marketTrend: params.marketTrend,
      demandLevel: params.demandLevel,
      competitionLevel: params.competitionLevel,
      seasonalFactor: params.seasonalFactor,
      sampleSize: params.sampleSize,
      dataQuality: params.dataQuality,
      modelVersion: MODEL_VERSION,
      userId: params.userId,
      itemId: params.itemId,
      suggestedPrice: params.recommendations.find(r => r.type === 'VALUE')?.price,
      priceStrategy: 'VALUE',
      recommendations: JSON.parse(JSON.stringify(params.recommendations)),
      expiresAt,
    },
  });
}

// ============================================
// Utility Functions
// ============================================

function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
}

function calculateVariance(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const squaredDiffs = values.map(v => Math.pow(v - mean, 2));
  return squaredDiffs.reduce((sum, d) => sum + d, 0) / values.length;
}

function aggregateByDay(
  items: { estimatedValue: number; createdAt: Date }[]
): { date: Date; avgPrice: number }[] {
  const byDay = new Map<string, number[]>();

  items.forEach(item => {
    const dateKey = item.createdAt.toISOString().split('T')[0];
    if (!byDay.has(dateKey)) {
      byDay.set(dateKey, []);
    }
    byDay.get(dateKey).push(item.estimatedValue);
  });

  return Array.from(byDay.entries())
    .map(([dateStr, prices]) => ({
      date: new Date(dateStr),
      avgPrice: calculateMean(prices),
    }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
}
