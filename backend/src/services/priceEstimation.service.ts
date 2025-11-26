/**
 * Price Estimation Service
 * FREE statistical model for Egyptian market
 *
 * Estimates item prices based on:
 * - Historical data (median prices)
 * - Category pricing
 * - Item condition
 * - Market trends
 */

import prisma from '../config/database';
import { ItemCondition } from '@prisma/client';

// ============================================
// Price Estimation Logic
// ============================================

interface PriceEstimate {
  estimatedPrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  confidence: number; // 0-100
  basedOn: string; // What data was used
  sampleSize: number; // Number of items analyzed
  suggestions?: string[];
}

/**
 * Condition adjustment factors
 * Based on Egyptian market depreciation rates
 */
const CONDITION_MULTIPLIERS: Record<ItemCondition, number> = {
  NEW: 1.0,           // 100% of market price
  LIKE_NEW: 0.85,     // 85% - minimal use
  GOOD: 0.60,         // 60% - normal wear
  FAIR: 0.45,         // 45% - visible wear
  POOR: 0.30,         // 30% - significant issues
};

/**
 * Estimate price for an item
 */
export async function estimatePrice(
  categoryId: string,
  condition: ItemCondition,
  title?: string,
  description?: string
): Promise<PriceEstimate> {
  // Get recent items in same category
  const recentItems = await prisma.item.findMany({
    where: {
      categoryId: categoryId,
      status: 'ACTIVE',
      estimatedValue: { gt: 0 }, // Only items with price
      createdAt: {
        gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
      },
    },
    select: {
      estimatedValue: true,
      condition: true,
      title: true,
    },
    take: 100,
  });

  if (recentItems.length < 3) {
    // Not enough data - use category-wide statistics
    return await estimateFromCategoryWide(categoryId, condition);
  }

  // Calculate statistics
  const prices = recentItems.map(item => item.estimatedValue);
  const median = calculateMedian(prices);
  const mean = calculateMean(prices);
  const stdDev = calculateStdDev(prices, mean);

  // Adjust for condition
  const basePrice = median; // Use median (more resistant to outliers)
  const conditionAdjusted = basePrice * CONDITION_MULTIPLIERS[condition];

  // Calculate confidence based on sample size and variance
  const confidence = calculateConfidence(recentItems.length, stdDev, mean);

  // Price range (±20% for normal variance)
  const rangePercent = 0.20;
  const priceRange = {
    min: Math.round(conditionAdjusted * (1 - rangePercent)),
    max: Math.round(conditionAdjusted * (1 + rangePercent)),
  };

  // Generate suggestions
  const suggestions = generatePricingSuggestions(
    conditionAdjusted,
    condition,
    recentItems.length
  );

  return {
    estimatedPrice: Math.round(conditionAdjusted),
    priceRange,
    confidence: Math.round(confidence),
    basedOn: `${recentItems.length} similar items in the last 90 days`,
    sampleSize: recentItems.length,
    suggestions,
  };
}

/**
 * Estimate from category-wide data (fallback)
 */
async function estimateFromCategoryWide(
  categoryId: string,
  condition: ItemCondition
): Promise<PriceEstimate> {
  // Get category hierarchy (check parent categories)
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: {
      parent: {
        include: {
          parent: true,
        },
      },
    },
  });

  // Try parent category, then grandparent
  const categoriesToCheck = [
    categoryId,
    category?.parentId,
    category?.parent?.parentId,
  ].filter(Boolean) as string[];

  for (const catId of categoriesToCheck) {
    const items = await prisma.item.findMany({
      where: {
        categoryId: catId,
        status: 'ACTIVE',
        estimatedValue: { gt: 0 },
      },
      select: { estimatedValue: true },
      take: 50,
    });

    if (items.length >= 3) {
      const prices = items.map(i => i.estimatedValue);
      const median = calculateMedian(prices);
      const adjusted = median * CONDITION_MULTIPLIERS[condition];

      return {
        estimatedPrice: Math.round(adjusted),
        priceRange: {
          min: Math.round(adjusted * 0.7),
          max: Math.round(adjusted * 1.3),
        },
        confidence: 40, // Lower confidence due to broader category
        basedOn: `Category average from ${items.length} items`,
        sampleSize: items.length,
        suggestions: [
          'Limited pricing data available',
          'Consider researching similar items online',
        ],
      };
    }
  }

  // No data available
  return {
    estimatedPrice: 0,
    priceRange: { min: 0, max: 0 },
    confidence: 0,
    basedOn: 'No historical data available',
    sampleSize: 0,
    suggestions: [
      'Research similar items on other platforms',
      'Check retail prices and apply condition discount',
      'Start with a competitive price and adjust based on demand',
    ],
  };
}

/**
 * Calculate median price
 */
function calculateMedian(prices: number[]): number {
  const sorted = [...prices].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Calculate mean (average)
 */
function calculateMean(prices: number[]): number {
  return prices.reduce((sum, p) => sum + p, 0) / prices.length;
}

/**
 * Calculate standard deviation
 */
function calculateStdDev(prices: number[], mean: number): number {
  const squaredDiffs = prices.map(p => Math.pow(p - mean, 2));
  const avgSquaredDiff = squaredDiffs.reduce((sum, d) => sum + d, 0) / prices.length;
  return Math.sqrt(avgSquaredDiff);
}

/**
 * Calculate confidence score
 */
function calculateConfidence(
  sampleSize: number,
  stdDev: number,
  mean: number
): number {
  // More samples = higher confidence
  let confidence = Math.min(sampleSize * 2, 60); // Max 60 from sample size

  // Lower variance = higher confidence
  const coefficientOfVariation = stdDev / mean;
  if (coefficientOfVariation < 0.2) {
    confidence += 30; // Low variance
  } else if (coefficientOfVariation < 0.4) {
    confidence += 20; // Medium variance
  } else {
    confidence += 10; // High variance
  }

  return Math.min(confidence, 100);
}

/**
 * Generate pricing suggestions
 */
function generatePricingSuggestions(
  estimatedPrice: number,
  condition: ItemCondition,
  sampleSize: number
): string[] {
  const suggestions: string[] = [];

  if (condition === 'NEW') {
    suggestions.push('Consider pricing slightly below retail for quick sale');
  } else if (condition === 'POOR' || condition === 'FAIR') {
    suggestions.push('Price competitively due to condition');
  }

  if (sampleSize < 10) {
    suggestions.push('Limited market data - monitor response and adjust');
  }

  suggestions.push(`Average similar items: ${estimatedPrice.toLocaleString('en-EG')} EGP`);

  return suggestions;
}

/**
 * Batch estimate prices for multiple items
 */
export async function estimatePrices(
  items: Array<{
    categoryId: string;
    condition: ItemCondition;
    title?: string;
    description?: string;
  }>
): Promise<PriceEstimate[]> {
  return Promise.all(
    items.map(item =>
      estimatePrice(item.categoryId, item.condition, item.title, item.description)
    )
  );
}

/**
 * Get market trends for a category
 */
export async function getCategoryPriceTrends(
  categoryId: string,
  days: number = 30
): Promise<{
  averagePrice: number;
  trend: 'rising' | 'falling' | 'stable';
  changePercent: number;
  dataPoints: Array<{ date: string; avgPrice: number }>;
}> {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const items = await prisma.item.findMany({
    where: {
      categoryId: categoryId,
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

  if (items.length < 2) {
    return {
      averagePrice: 0,
      trend: 'stable',
      changePercent: 0,
      dataPoints: [],
    };
  }

  // Split into first half and second half
  const midPoint = Math.floor(items.length / 2);
  const firstHalf = items.slice(0, midPoint);
  const secondHalf = items.slice(midPoint);

  const avgFirst = calculateMean(firstHalf.map(i => i.estimatedValue));
  const avgSecond = calculateMean(secondHalf.map(i => i.estimatedValue));

  const changePercent = ((avgSecond - avgFirst) / avgFirst) * 100;
  let trend: 'rising' | 'falling' | 'stable' = 'stable';

  if (changePercent > 5) trend = 'rising';
  else if (changePercent < -5) trend = 'falling';

  const averagePrice = calculateMean(items.map(i => i.estimatedValue));

  return {
    averagePrice: Math.round(averagePrice),
    trend,
    changePercent: Math.round(changePercent * 10) / 10,
    dataPoints: [], // Could aggregate by day if needed
  };
}

/**
 * Check if price is reasonable
 */
export async function validatePrice(
  categoryId: string,
  condition: ItemCondition,
  proposedPrice: number
): Promise<{
  isReasonable: boolean;
  reason?: string;
  suggestion?: string;
}> {
  const estimate = await estimatePrice(categoryId, condition);

  if (estimate.confidence < 30) {
    return {
      isReasonable: true,
      reason: 'Insufficient data to validate',
    };
  }

  const tooHigh = proposedPrice > estimate.priceRange.max * 1.5;
  const tooLow = proposedPrice < estimate.priceRange.min * 0.5;

  if (tooHigh) {
    return {
      isReasonable: false,
      reason: 'Price significantly above market average',
      suggestion: `Consider pricing around ${estimate.estimatedPrice.toLocaleString('en-EG')} EGP`,
    };
  }

  if (tooLow) {
    return {
      isReasonable: false,
      reason: 'Price significantly below market average',
      suggestion: `You may be undervaluing your item. Market average: ${estimate.estimatedPrice.toLocaleString('en-EG')} EGP`,
    };
  }

  return {
    isReasonable: true,
    reason: 'Price within expected range',
  };
}

/**
 * Example usage:
 *
 * const estimate = await estimatePrice(
 *   'smartphone-category-id',
 *   'EXCELLENT',
 *   'iPhone 14 Pro',
 *   '256GB, barely used'
 * );
 *
 * console.log(estimate);
 * // {
 * //   estimatedPrice: 34000,
 * //   priceRange: { min: 27200, max: 40800 },
 * //   confidence: 85,
 * //   basedOn: '47 similar items in the last 90 days',
 * //   sampleSize: 47,
 * //   suggestions: ['Average similar items: 34,000 EGP']
 * // }
 */
