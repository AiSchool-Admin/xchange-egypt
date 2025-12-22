/**
 * Multi-Dimensional Reputation Service
 * خدمة السمعة متعددة الأبعاد
 */

import { TrustLevel } from '../types/prisma-enums';
import prisma from '../lib/prisma';

// ============================================
// Types & Interfaces
// ============================================

interface ReputationScores {
  overallScore: number;
  communicationScore: number;
  reliabilityScore: number;
  itemAccuracyScore: number;
  deliverySpeedScore: number;
  fairnessScore: number;
  barterQualityScore: number;
}

interface ReputationUpdate {
  dimension: keyof ReputationScores;
  change: number;
  reason: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

// ============================================
// Trust Level Thresholds
// ============================================

const TRUST_LEVEL_THRESHOLDS = {
  NEWCOMER: { minDeals: 0, minScore: 0 },
  BRONZE: { minDeals: 5, minScore: 40 },
  SILVER: { minDeals: 20, minScore: 55 },
  GOLD: { minDeals: 50, minScore: 70 },
  PLATINUM: { minDeals: 100, minScore: 80 },
  DIAMOND: { minDeals: 250, minScore: 90 },
  ELITE: { minDeals: 500, minScore: 95 },
};

const BADGES = {
  VERIFIED_SELLER: { requirement: 'emailVerified && phoneVerified', icon: '✓' },
  FAST_SHIPPER: { requirement: 'deliverySpeedScore >= 80', icon: '⚡' },
  FAIR_TRADER: { requirement: 'fairnessScore >= 85', icon: '⚖️' },
  TRUSTED_BARTERER: { requirement: 'barterQualityScore >= 80 && totalBarters >= 10', icon: '🔄' },
  COMMUNICATION_STAR: { requirement: 'communicationScore >= 90', icon: '💬' },
  RELIABLE_PARTNER: { requirement: 'reliabilityScore >= 85', icon: '🤝' },
  ACCURATE_DESCRIBER: { requirement: 'itemAccuracyScore >= 90', icon: '📝' },
  TOP_RATED: { requirement: 'overallScore >= 90', icon: '⭐' },
  DISPUTE_FREE: { requirement: 'disputesLost == 0 && totalDeals >= 20', icon: '🛡️' },
  CENTURY_CLUB: { requirement: 'totalDeals >= 100', icon: '💯' },
};

// ============================================
// Core Reputation Functions
// ============================================

/**
 * Get or create user reputation
 * الحصول على أو إنشاء سمعة المستخدم
 */
export async function getOrCreateReputation(userId: string) {
  let reputation = await prisma.userReputation.findUnique({
    where: { userId },
    include: { history: { take: 10, orderBy: { createdAt: 'desc' } } },
  });

  if (!reputation) {
    reputation = await prisma.userReputation.create({
      data: {
        userId,
        overallScore: 50,
        trustLevel: TrustLevel.NEWCOMER,
        communicationScore: 50,
        reliabilityScore: 50,
        itemAccuracyScore: 50,
        deliverySpeedScore: 50,
        fairnessScore: 50,
        barterQualityScore: 50,
        totalDeals: 0,
        successfulDeals: 0,
        disputesInitiated: 0,
        disputesLost: 0,
        refundsGiven: 0,
        badges: [],
      },
      include: { history: true },
    });
  }

  return reputation;
}

/**
 * Get user reputation summary
 * الحصول على ملخص سمعة المستخدم
 */
export async function getReputationSummary(userId: string) {
  const reputation = await getOrCreateReputation(userId);

  const successRate = reputation.totalDeals > 0
    ? (reputation.successfulDeals / reputation.totalDeals) * 100
    : 100;

  const disputeRate = reputation.totalDeals > 0
    ? (reputation.disputesLost / reputation.totalDeals) * 100
    : 0;

  return {
    ...reputation,
    successRate: Math.round(successRate * 10) / 10,
    disputeRate: Math.round(disputeRate * 10) / 10,
    trustLevelProgress: calculateTrustLevelProgress(reputation),
    nextTrustLevel: getNextTrustLevel(reputation.trustLevel),
    badgeDetails: reputation.badges.map(badge => ({
      code: badge,
      ...BADGES[badge as keyof typeof BADGES],
    })),
  };
}

/**
 * Update reputation after a review
 * تحديث السمعة بعد تقييم
 */
export async function updateReputationFromReview(
  userId: string,
  review: {
    overallRating: number;
    itemAsDescribed?: number;
    communication?: number;
    shippingSpeed?: number;
    packaging?: number;
  },
  reviewId: string
) {
  const reputation = await getOrCreateReputation(userId);
  const updates: ReputationUpdate[] = [];

  // Convert 1-5 rating to 0-100 score impact
  const ratingToScoreChange = (rating: number, weight: number = 1) => {
    // Rating 5 = +3, Rating 4 = +1, Rating 3 = 0, Rating 2 = -2, Rating 1 = -5
    const changes = { 5: 3, 4: 1, 3: 0, 2: -2, 1: -5 };
    return (changes[rating as keyof typeof changes] || 0) * weight;
  };

  // Overall score impact
  updates.push({
    dimension: 'overallScore',
    change: ratingToScoreChange(review.overallRating, 1),
    reason: `تقييم عام ${review.overallRating} نجوم`,
    relatedEntityType: 'review',
    relatedEntityId: reviewId,
  });

  // Item accuracy from "itemAsDescribed"
  if (review.itemAsDescribed) {
    updates.push({
      dimension: 'itemAccuracyScore',
      change: ratingToScoreChange(review.itemAsDescribed, 1.2),
      reason: `دقة الوصف ${review.itemAsDescribed} نجوم`,
      relatedEntityType: 'review',
      relatedEntityId: reviewId,
    });
  }

  // Communication score
  if (review.communication) {
    updates.push({
      dimension: 'communicationScore',
      change: ratingToScoreChange(review.communication, 1),
      reason: `التواصل ${review.communication} نجوم`,
      relatedEntityType: 'review',
      relatedEntityId: reviewId,
    });
  }

  // Delivery speed score
  if (review.shippingSpeed) {
    updates.push({
      dimension: 'deliverySpeedScore',
      change: ratingToScoreChange(review.shippingSpeed, 1),
      reason: `سرعة الشحن ${review.shippingSpeed} نجوم`,
      relatedEntityType: 'review',
      relatedEntityId: reviewId,
    });
  }

  // Apply updates
  await applyReputationUpdates(userId, updates);

  return getOrCreateReputation(userId);
}

/**
 * Update reputation after deal completion
 * تحديث السمعة بعد إتمام صفقة
 */
export async function updateReputationFromDeal(
  userId: string,
  dealId: string,
  success: boolean,
  dealType: 'SALE' | 'BARTER' | 'AUCTION'
) {
  const updates: ReputationUpdate[] = [];

  if (success) {
    // Successful deal boosts reliability
    updates.push({
      dimension: 'reliabilityScore',
      change: 2,
      reason: 'إتمام صفقة ناجحة',
      relatedEntityType: 'deal',
      relatedEntityId: dealId,
    });

    // Barter-specific bonus
    if (dealType === 'BARTER') {
      updates.push({
        dimension: 'barterQualityScore',
        change: 3,
        reason: 'إتمام مقايضة ناجحة',
        relatedEntityType: 'deal',
        relatedEntityId: dealId,
      });
    }
  } else {
    // Failed deal hurts reliability
    updates.push({
      dimension: 'reliabilityScore',
      change: -5,
      reason: 'صفقة غير مكتملة',
      relatedEntityType: 'deal',
      relatedEntityId: dealId,
    });
  }

  await applyReputationUpdates(userId, updates);

  // Update deal counts
  await prisma.userReputation.update({
    where: { userId },
    data: {
      totalDeals: { increment: 1 },
      ...(success ? { successfulDeals: { increment: 1 } } : {}),
    },
  });

  // Recalculate trust level
  await recalculateTrustLevel(userId);

  return getOrCreateReputation(userId);
}

/**
 * Update reputation after dispute resolution
 * تحديث السمعة بعد حل نزاع
 */
export async function updateReputationFromDispute(
  userId: string,
  disputeId: string,
  role: 'INITIATOR' | 'RESPONDENT',
  resolution: 'WON' | 'LOST' | 'MUTUAL'
) {
  const updates: ReputationUpdate[] = [];

  if (resolution === 'LOST') {
    // Lost dispute significantly hurts reputation
    updates.push({
      dimension: 'overallScore',
      change: -10,
      reason: 'خسارة نزاع',
      relatedEntityType: 'dispute',
      relatedEntityId: disputeId,
    });

    updates.push({
      dimension: 'reliabilityScore',
      change: -15,
      reason: 'خسارة نزاع - تأثير على الموثوقية',
      relatedEntityType: 'dispute',
      relatedEntityId: disputeId,
    });

    await prisma.userReputation.update({
      where: { userId },
      data: { disputesLost: { increment: 1 } },
    });
  } else if (resolution === 'MUTUAL') {
    // Mutual agreement - slight negative for both
    updates.push({
      dimension: 'overallScore',
      change: -2,
      reason: 'تسوية نزاع بالاتفاق',
      relatedEntityType: 'dispute',
      relatedEntityId: disputeId,
    });
  }

  if (role === 'INITIATOR') {
    await prisma.userReputation.update({
      where: { userId },
      data: { disputesInitiated: { increment: 1 } },
    });
  }

  await applyReputationUpdates(userId, updates);
  await recalculateTrustLevel(userId);

  return getOrCreateReputation(userId);
}

/**
 * Apply multiple reputation updates
 * تطبيق تحديثات متعددة للسمعة
 */
async function applyReputationUpdates(userId: string, updates: ReputationUpdate[]) {
  const reputation = await getOrCreateReputation(userId);

  for (const update of updates) {
    const currentValue = reputation[update.dimension] as number;
    const newValue = Math.max(0, Math.min(100, currentValue + update.change));

    // Update the specific dimension
    await prisma.userReputation.update({
      where: { userId },
      data: {
        [update.dimension]: newValue,
        lastCalculatedAt: new Date(),
      },
    });

    // Record history
    await prisma.reputationHistory.create({
      data: {
        reputationId: reputation.id,
        overallScore: newValue,
        trustLevel: reputation.trustLevel,
        changeReason: update.reason,
        changeAmount: update.change,
        relatedEntityType: update.relatedEntityType,
        relatedEntityId: update.relatedEntityId,
      },
    });
  }

  // Recalculate overall score
  await recalculateOverallScore(userId);
}

/**
 * Recalculate overall score from dimensions
 * إعادة حساب النتيجة الإجمالية
 */
async function recalculateOverallScore(userId: string) {
  const reputation = await prisma.userReputation.findUnique({ where: { userId } });
  if (!reputation) return;

  // Weighted average of dimensions
  const weights = {
    communicationScore: 0.15,
    reliabilityScore: 0.25,
    itemAccuracyScore: 0.20,
    deliverySpeedScore: 0.15,
    fairnessScore: 0.10,
    barterQualityScore: 0.15,
  };

  const overallScore =
    reputation.communicationScore * weights.communicationScore +
    reputation.reliabilityScore * weights.reliabilityScore +
    reputation.itemAccuracyScore * weights.itemAccuracyScore +
    reputation.deliverySpeedScore * weights.deliverySpeedScore +
    reputation.fairnessScore * weights.fairnessScore +
    reputation.barterQualityScore * weights.barterQualityScore;

  await prisma.userReputation.update({
    where: { userId },
    data: { overallScore: Math.round(overallScore * 10) / 10 },
  });
}

/**
 * Recalculate trust level based on deals and score
 * إعادة حساب مستوى الثقة
 */
async function recalculateTrustLevel(userId: string) {
  const reputation = await prisma.userReputation.findUnique({ where: { userId } });
  if (!reputation) return;

  let newLevel: TrustLevel = TrustLevel.NEWCOMER;

  // Check each level from highest to lowest
  const levels: TrustLevel[] = ['ELITE', 'DIAMOND', 'PLATINUM', 'GOLD', 'SILVER', 'BRONZE', 'NEWCOMER'];

  for (const level of levels) {
    const threshold = TRUST_LEVEL_THRESHOLDS[level];
    if (
      reputation.totalDeals >= threshold.minDeals &&
      reputation.overallScore >= threshold.minScore
    ) {
      newLevel = level;
      break;
    }
  }

  if (newLevel !== reputation.trustLevel) {
    await prisma.userReputation.update({
      where: { userId },
      data: { trustLevel: newLevel },
    });

    // Record level change in history
    await prisma.reputationHistory.create({
      data: {
        reputationId: reputation.id,
        overallScore: reputation.overallScore,
        trustLevel: newLevel,
        changeReason: `ترقية إلى مستوى ${newLevel}`,
        changeAmount: 0,
      },
    });
  }

  // Update badges
  await updateBadges(userId);
}

/**
 * Update user badges
 * تحديث شارات المستخدم
 */
async function updateBadges(userId: string) {
  const reputation = await prisma.userReputation.findUnique({ where: { userId } });
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!reputation || !user) return;

  const earnedBadges: string[] = [];

  // Check each badge condition
  if (user.emailVerified && user.phoneVerified) {
    earnedBadges.push('VERIFIED_SELLER');
  }

  if (reputation.deliverySpeedScore >= 80) {
    earnedBadges.push('FAST_SHIPPER');
  }

  if (reputation.fairnessScore >= 85) {
    earnedBadges.push('FAIR_TRADER');
  }

  if (reputation.barterQualityScore >= 80 && reputation.totalDeals >= 10) {
    earnedBadges.push('TRUSTED_BARTERER');
  }

  if (reputation.communicationScore >= 90) {
    earnedBadges.push('COMMUNICATION_STAR');
  }

  if (reputation.reliabilityScore >= 85) {
    earnedBadges.push('RELIABLE_PARTNER');
  }

  if (reputation.itemAccuracyScore >= 90) {
    earnedBadges.push('ACCURATE_DESCRIBER');
  }

  if (reputation.overallScore >= 90) {
    earnedBadges.push('TOP_RATED');
  }

  if (reputation.disputesLost === 0 && reputation.totalDeals >= 20) {
    earnedBadges.push('DISPUTE_FREE');
  }

  if (reputation.totalDeals >= 100) {
    earnedBadges.push('CENTURY_CLUB');
  }

  // Update badges if changed
  const currentBadges = new Set(reputation.badges as string[]);
  const newBadges = new Set(earnedBadges);

  if (
    currentBadges.size !== newBadges.size ||
    ![...currentBadges].every(b => newBadges.has(b))
  ) {
    await prisma.userReputation.update({
      where: { userId },
      data: { badges: earnedBadges },
    });
  }
}

/**
 * Calculate progress to next trust level
 * حساب التقدم نحو المستوى التالي
 */
function calculateTrustLevelProgress(reputation: any): {
  dealsProgress: number;
  scoreProgress: number;
  overallProgress: number;
} {
  const nextLevel = getNextTrustLevel(reputation.trustLevel);
  if (!nextLevel) {
    return { dealsProgress: 100, scoreProgress: 100, overallProgress: 100 };
  }

  const currentThreshold = TRUST_LEVEL_THRESHOLDS[reputation.trustLevel as keyof typeof TRUST_LEVEL_THRESHOLDS];
  const nextThreshold = TRUST_LEVEL_THRESHOLDS[nextLevel as keyof typeof TRUST_LEVEL_THRESHOLDS];

  const dealsRange = nextThreshold.minDeals - currentThreshold.minDeals;
  const dealsProgress = dealsRange > 0
    ? Math.min(100, ((reputation.totalDeals - currentThreshold.minDeals) / dealsRange) * 100)
    : 100;

  const scoreRange = nextThreshold.minScore - currentThreshold.minScore;
  const scoreProgress = scoreRange > 0
    ? Math.min(100, ((reputation.overallScore - currentThreshold.minScore) / scoreRange) * 100)
    : 100;

  return {
    dealsProgress: Math.round(dealsProgress),
    scoreProgress: Math.round(scoreProgress),
    overallProgress: Math.round((dealsProgress + scoreProgress) / 2),
  };
}

/**
 * Get next trust level
 * الحصول على المستوى التالي
 */
function getNextTrustLevel(currentLevel: TrustLevel): TrustLevel | null {
  const levels: TrustLevel[] = ['NEWCOMER', 'BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND', 'ELITE'];
  const currentIndex = levels.indexOf(currentLevel);
  return currentIndex < levels.length - 1 ? levels[currentIndex + 1] : null;
}

/**
 * Get leaderboard
 * الحصول على قائمة المتصدرين
 */
export async function getLeaderboard(
  options: {
    limit?: number;
    governorate?: string;
    category?: string;
  } = {}
) {
  const { limit = 10, governorate } = options;

  const where: any = {};

  if (governorate) {
    where.user = { governorate };
  }

  const topUsers = await prisma.userReputation.findMany({
    where,
    orderBy: [
      { overallScore: 'desc' },
      { totalDeals: 'desc' },
    ],
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          governorate: true,
        },
      },
    },
  });

  return topUsers.map((rep, index) => ({
    rank: index + 1,
    userId: rep.userId,
    userName: rep.user.fullName,
    avatar: rep.user.avatar,
    governorate: rep.user.governorate,
    overallScore: rep.overallScore,
    trustLevel: rep.trustLevel,
    totalDeals: rep.totalDeals,
    badges: rep.badges,
  }));
}

/**
 * Get reputation history
 * الحصول على سجل السمعة
 */
export async function getReputationHistory(
  userId: string,
  options: { limit?: number; offset?: number } = {}
) {
  const { limit = 20, offset = 0 } = options;

  const reputation = await prisma.userReputation.findUnique({ where: { userId } });
  if (!reputation) {
    return { history: [], total: 0 };
  }

  const [history, total] = await Promise.all([
    prisma.reputationHistory.findMany({
      where: { reputationId: reputation.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.reputationHistory.count({
      where: { reputationId: reputation.id },
    }),
  ]);

  return { history, total };
}

export { TRUST_LEVEL_THRESHOLDS, BADGES };
