/**
 * Intelligent Barter Recommendation Ranking
 * FREE AI-powered ranking for multi-party barter cycles
 *
 * Enhances existing barter matching with smart ranking based on:
 * - User ratings and trust scores
 * - Geographical proximity
 * - Item condition compatibility
 * - Transaction history
 * - Fair value exchange
 * - Likelihood of acceptance
 */

import prisma from '../lib/prisma';
import { ItemCondition } from '@prisma/client';

// ============================================
// Types
// ============================================

export interface BarterCycleWithRanking {
  cycleId: string;
  participants: Array<{
    userId: string;
    userName: string;
    rating: number;
    totalTransactions: number;
    itemOffered: string;
    itemReceived: string;
  }>;
  matchScore: number; // Original matching score
  rankingScore: number; // Enhanced ranking score (0-100)
  likelihood: 'very_high' | 'high' | 'medium' | 'low';
  recommendationStrength: string;
  factors: {
    userTrustScore: number;
    locationScore: number;
    valueBalanceScore: number;
    conditionCompatibilityScore: number;
    completionProbability: number;
  };
  insights: string[];
  warnings: string[];
  estimatedTimeToComplete: string; // e.g., "2-3 days"
}

export interface UserTrustMetrics {
  rating: number;
  totalTransactions: number;
  successRate: number;
  averageResponseTime: number; // hours
  hasVerifiedEmail: boolean;
  hasVerifiedPhone: boolean;
  accountAge: number; // days
}

// ============================================
// Configuration
// ============================================

const RANKING_WEIGHTS = {
  USER_TRUST: 0.30,        // 30% - User reliability
  LOCATION: 0.20,          // 20% - Geographical proximity
  VALUE_BALANCE: 0.20,     // 20% - Fair value exchange
  CONDITION: 0.15,         // 15% - Item condition compatibility
  MATCH_SCORE: 0.15,       // 15% - Original matching score
};

const DISTANCE_THRESHOLDS = {
  SAME_CITY: 10,    // km
  NEARBY: 50,       // km
  REGIONAL: 200,    // km
};

// Map each condition to compatible conditions for barter exchanges
// Users are more likely to accept items of similar or better condition
const CONDITION_COMPATIBILITY: Record<ItemCondition, ItemCondition[]> = {
  NEW: ['NEW', 'LIKE_NEW'],
  LIKE_NEW: ['NEW', 'LIKE_NEW', 'GOOD'],
  GOOD: ['LIKE_NEW', 'GOOD', 'FAIR'],
  FAIR: ['GOOD', 'FAIR', 'POOR'],
  POOR: ['FAIR', 'POOR'],
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get user trust metrics
 */
async function getUserTrustMetrics(userId: string): Promise<UserTrustMetrics> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      rating: true,
      emailVerified: true,
      phoneVerified: true,
      createdAt: true,
      _count: {
        select: {
          transactionsAsBuyer: true,
          transactionsAsSeller: true,
        },
      },
    },
  });

  if (!user) {
    return {
      rating: 0,
      totalTransactions: 0,
      successRate: 0,
      averageResponseTime: 24,
      hasVerifiedEmail: false,
      hasVerifiedPhone: false,
      accountAge: 0,
    };
  }

  const totalTransactions = (user._count.transactionsAsBuyer + user._count.transactionsAsSeller) || 0;
  const completedTransactions = await prisma.transaction.count({
    where: {
      OR: [{ buyerId: userId }, { sellerId: userId }],
      paymentStatus: 'COMPLETED',
    },
  });

  const successRate = totalTransactions > 0
    ? (completedTransactions / totalTransactions) * 100
    : 0;

  const accountAge = Math.floor(
    (Date.now() - user.createdAt.getTime()) / (24 * 60 * 60 * 1000)
  );

  return {
    rating: user.rating || 0,
    totalTransactions,
    successRate,
    averageResponseTime: 12, // TODO: Calculate from chat data
    hasVerifiedEmail: user.emailVerified,
    hasVerifiedPhone: user.phoneVerified,
    accountAge,
  };
}

/**
 * Calculate user trust score (0-100)
 */
function calculateUserTrustScore(metrics: UserTrustMetrics): number {
  let score = 0;

  // Rating (max 30 points)
  score += (metrics.rating / 5.0) * 30;

  // Transaction history (max 25 points)
  if (metrics.totalTransactions > 0) {
    score += Math.min(metrics.totalTransactions * 2, 15); // Up to 15 points
    score += (metrics.successRate / 100) * 10; // Up to 10 points
  }

  // Verification (max 20 points)
  if (metrics.hasVerifiedEmail) score += 10;
  if (metrics.hasVerifiedPhone) score += 10;

  // Account age (max 15 points)
  if (metrics.accountAge > 365) score += 15; // 1+ year
  else if (metrics.accountAge > 90) score += 10; // 3+ months
  else if (metrics.accountAge > 30) score += 5; // 1+ month

  // Response time (max 10 points)
  if (metrics.averageResponseTime < 2) score += 10;
  else if (metrics.averageResponseTime < 6) score += 7;
  else if (metrics.averageResponseTime < 24) score += 4;

  return Math.min(score, 100);
}

/**
 * Calculate average user trust for all participants
 */
async function calculateCycleUserTrust(userIds: string[]): Promise<number> {
  const metrics = await Promise.all(
    userIds.map(id => getUserTrustMetrics(id))
  );

  const scores = metrics.map(m => calculateUserTrustScore(m));
  return scores.reduce((sum, s) => sum + s, 0) / scores.length;
}

/**
 * Calculate location score based on proximity
 */
async function calculateLocationScore(userIds: string[]): Promise<number> {
  // Get user locations
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      governorate: true,
      city: true,
    },
  });

  // If all in same governorate = 100
  // If all in same region = 80
  // If Egypt-wide = 50
  // If international = 20

  const governorates = new Set(users.map(u => u.governorate).filter(Boolean));
  const cities = new Set(users.map(u => u.city).filter(Boolean));

  if (cities.size === 1) return 100; // Same city
  if (governorates.size === 1) return 85; // Same governorate
  if (governorates.size <= 3) return 60; // Nearby governorates
  return 40; // Egypt-wide
}

/**
 * Calculate value balance score
 */
function calculateValueBalanceScore(
  itemValues: number[]
): number {
  if (itemValues.length === 0) return 0;

  const total = itemValues.reduce((sum, v) => sum + v, 0);
  const average = total / itemValues.length;

  // Calculate variance
  const variance = itemValues.reduce((sum, v) => {
    return sum + Math.pow(v - average, 2);
  }, 0) / itemValues.length;

  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = average > 0 ? stdDev / average : 1;

  // Lower variation = higher score
  // CV < 0.1 = perfect balance (100 points)
  // CV < 0.3 = good balance (75 points)
  // CV < 0.5 = fair balance (50 points)
  // CV > 0.5 = poor balance (25 points)

  if (coefficientOfVariation < 0.1) return 100;
  if (coefficientOfVariation < 0.3) return 75;
  if (coefficientOfVariation < 0.5) return 50;
  return 25;
}

/**
 * Calculate condition compatibility score
 */
function calculateConditionCompatibilityScore(
  conditions: ItemCondition[]
): number {
  // Check if all conditions are compatible
  let compatiblePairs = 0;
  let totalPairs = 0;

  for (let i = 0; i < conditions.length; i++) {
    for (let j = i + 1; j < conditions.length; j++) {
      totalPairs++;
      const condition1 = conditions[i];
      const condition2 = conditions[j];

      if (CONDITION_COMPATIBILITY[condition1]?.includes(condition2)) {
        compatiblePairs++;
      }
    }
  }

  return totalPairs > 0 ? (compatiblePairs / totalPairs) * 100 : 100;
}

/**
 * Calculate completion probability
 */
function calculateCompletionProbability(
  userTrustScore: number,
  locationScore: number,
  valueBalanceScore: number
): number {
  // Weighted average with higher weight on user trust
  return (
    userTrustScore * 0.5 +
    locationScore * 0.25 +
    valueBalanceScore * 0.25
  );
}

// ============================================
// Main Ranking Function
// ============================================

/**
 * Rank barter cycles intelligently
 */
export async function rankBarterCycle(
  cycleData: {
    participants: Array<{
      userId: string;
      userName: string;
      itemId: string;
      itemValue: number;
      itemCondition: ItemCondition;
    }>;
    originalMatchScore: number;
  }
): Promise<BarterCycleWithRanking> {
  const userIds = cycleData.participants.map(p => p.userId);
  const itemValues = cycleData.participants.map(p => p.itemValue);
  const conditions = cycleData.participants.map(p => p.itemCondition);

  // Calculate all factors
  const userTrustScore = await calculateCycleUserTrust(userIds);
  const locationScore = await calculateLocationScore(userIds);
  const valueBalanceScore = calculateValueBalanceScore(itemValues);
  const conditionScore = calculateConditionCompatibilityScore(conditions);

  // Calculate final ranking score
  const rankingScore =
    userTrustScore * RANKING_WEIGHTS.USER_TRUST +
    locationScore * RANKING_WEIGHTS.LOCATION +
    valueBalanceScore * RANKING_WEIGHTS.VALUE_BALANCE +
    conditionScore * RANKING_WEIGHTS.CONDITION +
    cycleData.originalMatchScore * RANKING_WEIGHTS.MATCH_SCORE;

  const completionProbability = calculateCompletionProbability(
    userTrustScore,
    locationScore,
    valueBalanceScore
  );

  // Determine likelihood
  let likelihood: 'very_high' | 'high' | 'medium' | 'low';
  if (completionProbability >= 80) likelihood = 'very_high';
  else if (completionProbability >= 60) likelihood = 'high';
  else if (completionProbability >= 40) likelihood = 'medium';
  else likelihood = 'low';

  // Generate insights
  const insights: string[] = [];
  const warnings: string[] = [];

  if (userTrustScore >= 80) {
    insights.push('All participants have excellent ratings');
  } else if (userTrustScore < 50) {
    warnings.push('Some participants have low trust scores');
  }

  if (locationScore >= 85) {
    insights.push('Participants are in close proximity');
  } else if (locationScore < 50) {
    warnings.push('Participants are geographically dispersed');
  }

  if (valueBalanceScore >= 75) {
    insights.push('Items have similar values - fair exchange');
  } else if (valueBalanceScore < 40) {
    warnings.push('Significant value imbalance may require cash');
  }

  if (conditionScore >= 80) {
    insights.push('Item conditions are well-matched');
  } else if (conditionScore < 60) {
    warnings.push('Item condition mismatch may affect satisfaction');
  }

  // Estimate time to complete
  let estimatedTime = '3-5 days';
  if (completionProbability >= 80 && locationScore >= 80) {
    estimatedTime = '1-2 days';
  } else if (completionProbability >= 60) {
    estimatedTime = '2-4 days';
  } else if (completionProbability < 40) {
    estimatedTime = '5-10 days';
  }

  // Recommendation strength
  let recommendationStrength = 'Recommended';
  if (rankingScore >= 80) recommendationStrength = 'Highly Recommended';
  else if (rankingScore >= 60) recommendationStrength = 'Recommended';
  else if (rankingScore >= 40) recommendationStrength = 'Consider';
  else recommendationStrength = 'Not Recommended';

  return {
    cycleId: `cycle_${Date.now()}`,
    participants: cycleData.participants.map((p, i) => ({
      userId: p.userId,
      userName: p.userName,
      rating: 0, // Would be populated from user data
      totalTransactions: 0,
      itemOffered: p.itemId,
      itemReceived: cycleData.participants[(i + 1) % cycleData.participants.length].itemId,
    })),
    matchScore: cycleData.originalMatchScore,
    rankingScore: Math.round(rankingScore),
    likelihood,
    recommendationStrength,
    factors: {
      userTrustScore: Math.round(userTrustScore),
      locationScore: Math.round(locationScore),
      valueBalanceScore: Math.round(valueBalanceScore),
      conditionCompatibilityScore: Math.round(conditionScore),
      completionProbability: Math.round(completionProbability),
    },
    insights,
    warnings,
    estimatedTimeToComplete: estimatedTime,
  };
}

/**
 * Rank multiple barter cycles and return sorted by ranking score
 */
export async function rankMultipleBarterCycles(
  cycles: Array<{
    participants: Array<{
      userId: string;
      userName: string;
      itemId: string;
      itemValue: number;
      itemCondition: ItemCondition;
    }>;
    originalMatchScore: number;
  }>
): Promise<BarterCycleWithRanking[]> {
  const rankedCycles = await Promise.all(
    cycles.map(cycle => rankBarterCycle(cycle))
  );

  // Sort by ranking score (highest first)
  return rankedCycles.sort((a, b) => b.rankingScore - a.rankingScore);
}

/**
 * Get personalized barter recommendations for a user
 */
export async function getPersonalizedBarterRecommendations(
  userId: string,
  limit: number = 10
): Promise<BarterCycleWithRanking[]> {
  // Get user's barter offers
  const userOffers = await prisma.barterOffer.findMany({
    where: {
      initiatorId: userId,
      status: 'PENDING',
    },
    select: {
      id: true,
      offeredItemIds: true,
      offeredBundleValue: true,
    },
    take: 5,
  });

  // TODO: Find matching cycles using existing barter-matching.service
  // For now, return empty array
  // This would integrate with the existing cycle detection

  return [];
}

/**
 * Example usage:
 *
 * const cycle = {
 *   participants: [
 *     { userId: '1', userName: 'Ahmed', itemId: 'i1', itemValue: 5000, itemCondition: 'GOOD' },
 *     { userId: '2', userName: 'Sara', itemId: 'i2', itemValue: 5200, itemCondition: 'EXCELLENT' },
 *     { userId: '3', userName: 'Mohamed', itemId: 'i3', itemValue: 4800, itemCondition: 'GOOD' },
 *   ],
 *   originalMatchScore: 85,
 * };
 *
 * const ranking = await rankBarterCycle(cycle);
 * console.log(ranking);
 * // {
 * //   rankingScore: 87,
 * //   likelihood: 'high',
 * //   recommendationStrength: 'Highly Recommended',
 * //   factors: { ... },
 * //   insights: ['All participants have excellent ratings', ...],
 * //   estimatedTimeToComplete: '2-4 days'
 * // }
 */
