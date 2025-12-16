/**
 * Unified Rating Service
 * نظام التقييم الموحد
 *
 * Comprehensive rating system across all platform interactions:
 * - Seller ratings
 * - Buyer ratings
 * - Transaction ratings
 * - Product ratings
 * - Service ratings (facilitators, delivery)
 */

import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import * as notificationService from './unified-notification.service';

// ============================================
// Types
// ============================================

export type RatingType =
  | 'SELLER'
  | 'BUYER'
  | 'TRANSACTION'
  | 'PRODUCT'
  | 'FACILITATOR'
  | 'DELIVERY';

export type RatingCategory =
  | 'COMMUNICATION'
  | 'ITEM_ACCURACY'
  | 'SHIPPING_SPEED'
  | 'VALUE_FOR_MONEY'
  | 'OVERALL';

export interface RatingInput {
  raterId: string;
  ratedId: string;  // User ID or Entity ID
  ratingType: RatingType;
  entityId?: string; // Transaction ID, Item ID, etc.
  score: number; // 1-5
  categories?: CategoryRating[];
  review?: string;
  reviewAr?: string;
  isAnonymous?: boolean;
  images?: string[];
}

export interface CategoryRating {
  category: RatingCategory;
  score: number;
}

export interface RatingSummary {
  averageScore: number;
  totalRatings: number;
  scoreDistribution: Record<number, number>;
  categoryAverages?: Record<RatingCategory, number>;
  recentRatings: Rating[];
  badges?: RatingBadge[];
}

export interface Rating {
  id: string;
  raterId: string;
  raterName?: string;
  raterAvatar?: string;
  ratedId: string;
  ratingType: RatingType;
  entityId?: string;
  score: number;
  categories?: CategoryRating[];
  review?: string;
  reviewAr?: string;
  isAnonymous: boolean;
  images?: string[];
  createdAt: Date;
  response?: RatingResponse;
}

export interface RatingResponse {
  id: string;
  responseText: string;
  responseTextAr?: string;
  createdAt: Date;
}

export interface RatingBadge {
  name: string;
  nameAr: string;
  icon: string;
  description: string;
  descriptionAr: string;
}

// ============================================
// Rating Badges Configuration
// ============================================

const RATING_BADGES: Record<string, RatingBadge & { criteria: (summary: RatingSummary) => boolean }> = {
  TOP_SELLER: {
    name: 'Top Seller',
    nameAr: 'بائع متميز',
    icon: '🏆',
    description: 'Maintained 4.8+ rating with 50+ reviews',
    descriptionAr: 'حافظ على تقييم 4.8+ مع 50+ تقييم',
    criteria: (s) => s.averageScore >= 4.8 && s.totalRatings >= 50,
  },
  TRUSTED_SELLER: {
    name: 'Trusted Seller',
    nameAr: 'بائع موثوق',
    icon: '✓',
    description: 'Maintained 4.5+ rating with 20+ reviews',
    descriptionAr: 'حافظ على تقييم 4.5+ مع 20+ تقييم',
    criteria: (s) => s.averageScore >= 4.5 && s.totalRatings >= 20,
  },
  RISING_STAR: {
    name: 'Rising Star',
    nameAr: 'نجم صاعد',
    icon: '⭐',
    description: 'Perfect 5-star ratings on first 10 reviews',
    descriptionAr: 'تقييمات 5 نجوم مثالية في أول 10 تقييمات',
    criteria: (s) => s.averageScore === 5 && s.totalRatings >= 10,
  },
  GREAT_COMMUNICATOR: {
    name: 'Great Communicator',
    nameAr: 'تواصل ممتاز',
    icon: '💬',
    description: 'Exceptional communication ratings',
    descriptionAr: 'تقييمات تواصل استثنائية',
    criteria: (s) => (s.categoryAverages?.COMMUNICATION || 0) >= 4.8,
  },
  FAST_SHIPPER: {
    name: 'Fast Shipper',
    nameAr: 'شحن سريع',
    icon: '🚀',
    description: 'Exceptional shipping speed ratings',
    descriptionAr: 'تقييمات سرعة شحن استثنائية',
    criteria: (s) => (s.categoryAverages?.SHIPPING_SPEED || 0) >= 4.8,
  },
  VALUE_CHAMPION: {
    name: 'Value Champion',
    nameAr: 'بطل القيمة',
    icon: '💰',
    description: 'Exceptional value for money ratings',
    descriptionAr: 'تقييمات قيمة مقابل المال استثنائية',
    criteria: (s) => (s.categoryAverages?.VALUE_FOR_MONEY || 0) >= 4.8,
  },
};

// ============================================
// Core Rating Functions
// ============================================

/**
 * Submit a new rating
 */
export const submitRating = async (input: RatingInput): Promise<Rating> => {
  const {
    raterId,
    ratedId,
    ratingType,
    entityId,
    score,
    categories,
    review,
    reviewAr,
    isAnonymous = false,
    images = [],
  } = input;

  // Validate score
  if (score < 1 || score > 5) {
    throw new Error('Rating score must be between 1 and 5');
  }

  // Check for duplicate rating
  const existingRating = await prisma.review.findFirst({
    where: {
      reviewerId: raterId,
      revieweeId: ratedId,
      ...(entityId && { itemId: entityId }),
    },
  });

  if (existingRating) {
    throw new Error('You have already submitted a rating for this transaction');
  }

  // Create the rating
  const rating = await prisma.review.create({
    data: {
      reviewerId: raterId,
      revieweeId: ratedId,
      itemId: entityId || undefined,
      rating: score,
      comment: review,
      isPublic: !isAnonymous,
      images,
      metadata: {
        ratingType,
        categories,
        reviewAr,
      } as Prisma.JsonValue,
    },
    include: {
      reviewer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });

  // Update user's average rating
  await updateUserRatingSummary(ratedId);

  // Notify the rated user
  await notifyNewRating(ratedId, raterId, score, ratingType);

  // Check and award badges
  await checkAndAwardBadges(ratedId);

  return {
    id: rating.id,
    raterId: rating.reviewerId,
    raterName: isAnonymous ? undefined : rating.reviewer?.fullName || undefined,
    raterAvatar: isAnonymous ? undefined : rating.reviewer?.avatar || undefined,
    ratedId: rating.revieweeId,
    ratingType,
    entityId: rating.itemId || undefined,
    score: rating.rating,
    categories,
    review: rating.comment || undefined,
    reviewAr: (rating.metadata as any)?.reviewAr,
    isAnonymous,
    images: rating.images,
    createdAt: rating.createdAt,
  };
};

/**
 * Get rating summary for a user
 */
export const getUserRatingSummary = async (
  userId: string,
  ratingType?: RatingType
): Promise<RatingSummary> => {
  const whereClause: Prisma.ReviewWhereInput = {
    revieweeId: userId,
    ...(ratingType && {
      metadata: {
        path: ['ratingType'],
        equals: ratingType,
      },
    }),
  };

  // Get all ratings
  const ratings = await prisma.review.findMany({
    where: whereClause,
    include: {
      reviewer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  if (ratings.length === 0) {
    return {
      averageScore: 0,
      totalRatings: 0,
      scoreDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      recentRatings: [],
    };
  }

  // Calculate average
  const totalScore = ratings.reduce((sum, r) => sum + r.rating, 0);
  const averageScore = parseFloat((totalScore / ratings.length).toFixed(2));

  // Calculate distribution
  const scoreDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratings.forEach(r => {
    scoreDistribution[r.rating]++;
  });

  // Calculate category averages if available
  const categoryScores: Record<RatingCategory, number[]> = {
    COMMUNICATION: [],
    ITEM_ACCURACY: [],
    SHIPPING_SPEED: [],
    VALUE_FOR_MONEY: [],
    OVERALL: [],
  };

  ratings.forEach(r => {
    const metadata = r.metadata as any;
    if (metadata?.categories) {
      metadata.categories.forEach((cat: CategoryRating) => {
        if (categoryScores[cat.category]) {
          categoryScores[cat.category].push(cat.score);
        }
      });
    }
  });

  const categoryAverages: Record<RatingCategory, number> = {} as any;
  Object.entries(categoryScores).forEach(([category, scores]) => {
    if (scores.length > 0) {
      categoryAverages[category as RatingCategory] =
        parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2));
    }
  });

  // Get badges
  const summary: RatingSummary = {
    averageScore,
    totalRatings: ratings.length,
    scoreDistribution,
    categoryAverages: Object.keys(categoryAverages).length > 0 ? categoryAverages : undefined,
    recentRatings: ratings.slice(0, 5).map(r => transformRating(r)),
  };

  summary.badges = getEarnedBadges(summary);

  return summary;
};

/**
 * Get ratings for a specific entity (item, transaction, etc.)
 */
export const getEntityRatings = async (
  entityId: string,
  limit = 10,
  offset = 0
): Promise<{ ratings: Rating[]; total: number }> => {
  const [ratings, total] = await Promise.all([
    prisma.review.findMany({
      where: { itemId: entityId },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.review.count({ where: { itemId: entityId } }),
  ]);

  return {
    ratings: ratings.map(r => transformRating(r)),
    total,
  };
};

/**
 * Respond to a rating (for sellers)
 */
export const respondToRating = async (
  ratingId: string,
  responderId: string,
  responseText: string,
  responseTextAr?: string
): Promise<RatingResponse> => {
  const rating = await prisma.review.findUnique({
    where: { id: ratingId },
  });

  if (!rating) {
    throw new Error('Rating not found');
  }

  if (rating.revieweeId !== responderId) {
    throw new Error('You can only respond to ratings about you');
  }

  // Update the rating with response
  const updatedRating = await prisma.review.update({
    where: { id: ratingId },
    data: {
      metadata: {
        ...(rating.metadata as any),
        response: {
          text: responseText,
          textAr: responseTextAr,
          createdAt: new Date(),
        },
      },
    },
  });

  const metadata = updatedRating.metadata as any;
  return {
    id: ratingId,
    responseText: metadata.response.text,
    responseTextAr: metadata.response.textAr,
    createdAt: new Date(metadata.response.createdAt),
  };
};

/**
 * Report a rating as inappropriate
 */
export const reportRating = async (
  ratingId: string,
  reporterId: string,
  reason: string
): Promise<void> => {
  const rating = await prisma.review.findUnique({
    where: { id: ratingId },
  });

  if (!rating) {
    throw new Error('Rating not found');
  }

  // Create report
  await prisma.report.create({
    data: {
      reporterId,
      reason,
      entityType: 'REVIEW',
      entityId: ratingId,
      status: 'PENDING',
    },
  });
};

// ============================================
// Helper Functions
// ============================================

/**
 * Update user's cached rating summary
 */
const updateUserRatingSummary = async (userId: string): Promise<void> => {
  const summary = await getUserRatingSummary(userId);

  await prisma.user.update({
    where: { id: userId },
    data: {
      rating: summary.averageScore,
    },
  });
};

/**
 * Notify user of new rating
 */
const notifyNewRating = async (
  ratedId: string,
  raterId: string,
  score: number,
  ratingType: RatingType
): Promise<void> => {
  const rater = await prisma.user.findUnique({
    where: { id: raterId },
    select: { fullName: true },
  });

  const stars = '⭐'.repeat(score);

  await notificationService.sendNotification({
    userId: ratedId,
    type: 'REVIEW_RECEIVED',
    title: 'New Rating Received!',
    titleAr: 'تقييم جديد!',
    message: `${rater?.fullName || 'Someone'} gave you ${score} stars ${stars}`,
    messageAr: `${rater?.fullName || 'شخص ما'} أعطاك ${score} نجوم ${stars}`,
    entityType: 'REVIEW',
    actionUrl: '/profile/reviews',
    actionText: 'View Review',
    actionTextAr: 'عرض التقييم',
    metadata: { score, ratingType },
  });
};

/**
 * Check and award badges based on rating summary
 */
const checkAndAwardBadges = async (userId: string): Promise<void> => {
  const summary = await getUserRatingSummary(userId);
  const earnedBadges = getEarnedBadges(summary);

  // Get user's current badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
    include: { badge: true },
  });

  const currentBadgeNames = userBadges.map(ub => ub.badge.name);

  // Award new badges
  for (const badge of earnedBadges) {
    if (!currentBadgeNames.includes(badge.name)) {
      // Find or create badge
      let dbBadge = await prisma.badge.findFirst({
        where: { name: badge.name },
      });

      if (!dbBadge) {
        dbBadge = await prisma.badge.create({
          data: {
            name: badge.name,
            nameAr: badge.nameAr,
            description: badge.description,
            descriptionAr: badge.descriptionAr,
            icon: badge.icon,
            category: 'RATING',
          },
        });
      }

      // Award badge to user
      await prisma.userBadge.create({
        data: {
          userId,
          badgeId: dbBadge.id,
        },
      });

      // Notify user
      await notificationService.notifyBadgeEarned(
        userId,
        badge.name,
        badge.nameAr,
        dbBadge.id
      );
    }
  }
};

/**
 * Get earned badges based on rating summary
 */
const getEarnedBadges = (summary: RatingSummary): RatingBadge[] => {
  const earned: RatingBadge[] = [];

  Object.values(RATING_BADGES).forEach(badge => {
    if (badge.criteria(summary)) {
      earned.push({
        name: badge.name,
        nameAr: badge.nameAr,
        icon: badge.icon,
        description: badge.description,
        descriptionAr: badge.descriptionAr,
      });
    }
  });

  return earned;
};

/**
 * Transform database rating to API rating
 */
const transformRating = (dbRating: any): Rating => {
  const metadata = dbRating.metadata as any;
  const isAnonymous = !dbRating.isPublic;

  return {
    id: dbRating.id,
    raterId: dbRating.reviewerId,
    raterName: isAnonymous ? undefined : dbRating.reviewer?.fullName,
    raterAvatar: isAnonymous ? undefined : dbRating.reviewer?.avatar,
    ratedId: dbRating.revieweeId,
    ratingType: metadata?.ratingType || 'SELLER',
    entityId: dbRating.itemId || undefined,
    score: dbRating.rating,
    categories: metadata?.categories,
    review: dbRating.comment || undefined,
    reviewAr: metadata?.reviewAr,
    isAnonymous,
    images: dbRating.images || [],
    createdAt: dbRating.createdAt,
    response: metadata?.response ? {
      id: dbRating.id,
      responseText: metadata.response.text,
      responseTextAr: metadata.response.textAr,
      createdAt: new Date(metadata.response.createdAt),
    } : undefined,
  };
};
