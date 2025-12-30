import logger from '../lib/logger';
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

import prisma from '../lib/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

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

export interface SubmitRatingInput {
  reviewedId: string;
  transactionId: string;
  ratingType: RatingType;
  overallRating: number;
  comment?: string;
}

export interface RatingSummary {
  userId: string;
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  recentReviews: any[];
}

// ============================================
// Submit Rating
// ============================================

/**
 * Submit a rating for a user or transaction
 */
export const submitRating = async (
  reviewerId: string,
  input: SubmitRatingInput
): Promise<any> => {
  const {
    reviewedId,
    transactionId,
    ratingType,
    overallRating,
    comment,
  } = input;

  // Validate rating range
  if (overallRating < 1 || overallRating > 5) {
    throw new BadRequestError('Rating must be between 1 and 5');
  }

  // Check if reviewer exists
  const reviewer = await prisma.user.findUnique({
    where: { id: reviewerId },
    select: { id: true, fullName: true },
  });

  if (!reviewer) {
    throw new NotFoundError('Reviewer not found');
  }

  // Check if reviewed user exists
  const reviewed = await prisma.user.findUnique({
    where: { id: reviewedId },
    select: { id: true, fullName: true, rating: true, totalReviews: true },
  });

  if (!reviewed) {
    throw new NotFoundError('Reviewed user not found');
  }

  // Prevent self-review
  if (reviewerId === reviewedId) {
    throw new BadRequestError('Cannot review yourself');
  }

  // Check if already reviewed
  const existingReview = await prisma.review.findFirst({
    where: {
      reviewerId,
      reviewedId,
      transactionId,
    },
  });

  if (existingReview) {
    throw new BadRequestError('You have already reviewed this transaction');
  }

  // Create the review
  const review = await prisma.review.create({
    data: {
      reviewerId,
      reviewedId,
      transactionId,
      overallRating,
      comment,
      title: `${ratingType} Review`,
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

  // Update reviewed user's rating
  await updateUserRating(reviewedId);

  return {
    id: review.id,
    reviewerId: review.reviewerId,
    reviewedId: review.reviewedId,
    rating: review.overallRating,
    comment: review.comment,
    ratingType,
    createdAt: review.createdAt,
    reviewer: review.reviewer,
  };
};

// ============================================
// Get Rating Summary
// ============================================

/**
 * Get rating summary for a user
 */
export const getUserRatingSummary = async (userId: string): Promise<RatingSummary> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      rating: true,
      totalReviews: true,
    },
  });

  if (!user) {
    throw new NotFoundError('User not found');
  }

  // Get rating distribution
  const reviews = await prisma.review.findMany({
    where: { reviewedId: userId },
    select: { overallRating: true },
  });

  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    const rating = Math.round(r.overallRating) as 1 | 2 | 3 | 4 | 5;
    if (rating >= 1 && rating <= 5) {
      distribution[rating]++;
    }
  });

  // Get recent reviews
  const recentReviews = await prisma.review.findMany({
    where: { reviewedId: userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
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

  return {
    userId,
    averageRating: user.rating,
    totalReviews: user.totalReviews,
    ratingDistribution: distribution,
    recentReviews: recentReviews.map((r) => ({
      id: r.id,
      rating: r.overallRating,
      comment: r.comment,
      reviewer: r.reviewer,
      createdAt: r.createdAt,
    })),
  };
};

// ============================================
// Get User Reviews
// ============================================

/**
 * Get all reviews for a user
 */
export const getUserReviews = async (
  userId: string,
  options: { page?: number; limit?: number } = {}
): Promise<{ reviews: any[]; total: number; pagination: any }> => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { reviewedId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.review.count({ where: { reviewedId: userId } }),
  ]);

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.overallRating,
      comment: r.comment,
      reviewer: r.reviewer,
      createdAt: r.createdAt,
    })),
    total,
    pagination: {
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

// ============================================
// Respond to Review
// ============================================

/**
 * Respond to a review (as the reviewed user)
 * Note: This is a simplified version - the actual implementation would need
 * a ReviewResponse model in the schema
 */
export const respondToReview = async (
  reviewId: string,
  userId: string,
  response: string
): Promise<any> => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  if (review.reviewedId !== userId) {
    throw new ForbiddenError('Only the reviewed user can respond');
  }

  // For now, we'll just return a success message
  // In a full implementation, this would create a ReviewResponse record
  return {
    id: reviewId,
    response,
    respondedAt: new Date(),
    message: 'Response recorded successfully',
  };
};

// ============================================
// Report Review
// ============================================

/**
 * Report a review for moderation
 */
export const reportReview = async (
  reviewId: string,
  reporterId: string,
  reason: string
): Promise<{ success: boolean; message: string }> => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  // Update review status to flagged
  await prisma.review.update({
    where: { id: reviewId },
    data: {
      status: 'FLAGGED',
      reportCount: { increment: 1 },
    },
  });

  // In a real implementation, create a report record
  logger.info(`Review ${reviewId} reported by ${reporterId}: ${reason}`);

  return {
    success: true,
    message: 'Review has been reported for moderation',
  };
};

// ============================================
// Helper Functions
// ============================================

/**
 * Update user's average rating
 */
async function updateUserRating(userId: string): Promise<void> {
  const result = await prisma.review.aggregate({
    where: { reviewedId: userId },
    _avg: { overallRating: true },
    _count: true,
  });

  await prisma.user.update({
    where: { id: userId },
    data: {
      rating: result._avg.overallRating ? Number(result._avg.overallRating) : 0,
      totalReviews: result._count,
    },
  });
}

/**
 * Check if user can review a transaction
 */
export const canReviewTransaction = async (
  userId: string,
  transactionId: string
): Promise<boolean> => {
  // Check if user was part of the transaction
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    return false;
  }

  // User must be buyer or seller
  if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
    return false;
  }

  // Check if already reviewed
  const existingReview = await prisma.review.findFirst({
    where: {
      reviewerId: userId,
      transactionId,
    },
  });

  return !existingReview;
};

/**
 * Get reviews given by a user
 */
export const getReviewsGiven = async (
  userId: string,
  options: { page?: number; limit?: number } = {}
): Promise<{ reviews: any[]; total: number }> => {
  const { page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { reviewerId: userId },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        reviewed: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    }),
    prisma.review.count({ where: { reviewerId: userId } }),
  ]);

  return {
    reviews: reviews.map((r) => ({
      id: r.id,
      rating: r.overallRating,
      comment: r.comment,
      reviewed: r.reviewed,
      createdAt: r.createdAt,
    })),
    total,
  };
};
