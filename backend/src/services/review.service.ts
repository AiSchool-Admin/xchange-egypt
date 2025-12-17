/**
 * Review Service
 *
 * Business logic for reviews and ratings system
 */

import prisma from '../lib/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import * as notificationDispatcher from './notification-dispatcher.service';

// ============================================
// Types
// ============================================

export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'HIDDEN';
export type ReviewType = 'SELLER_REVIEW' | 'BUYER_REVIEW' | 'ITEM_REVIEW';
export type ReportReason = 'SPAM' | 'OFFENSIVE_LANGUAGE' | 'FAKE_REVIEW' | 'IRRELEVANT' | 'PERSONAL_INFORMATION' | 'OTHER';

export interface CreateReviewInput {
  transactionId: string;
  reviewedId: string;
  reviewType?: ReviewType;
  overallRating: number;
  itemAsDescribed?: number;
  communication?: number;
  shippingSpeed?: number;
  packaging?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewInput {
  overallRating?: number;
  itemAsDescribed?: number;
  communication?: number;
  shippingSpeed?: number;
  packaging?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface GetReviewsFilters {
  reviewedId?: string;
  reviewerId?: string;
  transactionId?: string;
  reviewType?: ReviewType;
  status?: ReviewStatus;
  minRating?: number;
  maxRating?: number;
  isVerifiedPurchase?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'rating_high' | 'rating_low' | 'helpful';
}

// ============================================
// Review CRUD Operations
// ============================================

/**
 * Create a new review
 */
export const createReview = async (
  reviewerId: string,
  input: CreateReviewInput
): Promise<any> => {
  // Validate transaction exists and user is part of it
  const transaction = await prisma.transaction.findUnique({
    where: { id: input.transactionId },
    include: {
      buyer: true,
      seller: true,
    },
  });

  if (!transaction) {
    throw new NotFoundError('Transaction not found');
  }

  // Check if reviewer is part of the transaction
  if (transaction.buyerId !== reviewerId && transaction.sellerId !== reviewerId) {
    throw new ForbiddenError('You can only review transactions you are part of');
  }

  // Check if user already reviewed this transaction
  const existingReview = await prisma.review.findUnique({
    where: {
      transactionId_reviewerId: {
        transactionId: input.transactionId,
        reviewerId,
      },
    },
  });

  if (existingReview) {
    throw new BadRequestError('You have already reviewed this transaction');
  }

  // Validate ratings
  if (input.overallRating < 1 || input.overallRating > 5) {
    throw new BadRequestError('Overall rating must be between 1 and 5');
  }

  // Validate optional ratings
  const detailedRatings = [
    input.itemAsDescribed,
    input.communication,
    input.shippingSpeed,
    input.packaging,
  ];

  for (const rating of detailedRatings) {
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new BadRequestError('All ratings must be between 1 and 5');
    }
  }

  // Determine if it's a verified purchase
  const isVerifiedPurchase = transaction.paymentStatus === 'COMPLETED';

  // Create review
  const review = await prisma.review.create({
    data: {
      reviewerId,
      reviewedId: input.reviewedId,
      transactionId: input.transactionId,
      reviewType: input.reviewType || 'SELLER_REVIEW',
      overallRating: input.overallRating,
      itemAsDescribed: input.itemAsDescribed,
      communication: input.communication,
      shippingSpeed: input.shippingSpeed,
      packaging: input.packaging,
      title: input.title,
      comment: input.comment,
      images: input.images || [],
      isVerifiedPurchase,
      status: 'APPROVED', // Auto-approve for now (can add moderation later)
    },
    include: {
      reviewer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      reviewed: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  // Update user's average rating
  await updateUserRating(input.reviewedId);

  // Send notification to reviewed user
  await notificationDispatcher.notifyUserReviewReceived(
    input.reviewedId,
    review.id,
    transaction.id,
    reviewerId,
    input.overallRating
  );

  return review;
};

/**
 * Get reviews with filters
 */
export const getReviews = async (filters: GetReviewsFilters): Promise<any> => {
  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {};

  if (filters.reviewedId) {
    where.reviewedId = filters.reviewedId;
  }

  if (filters.reviewerId) {
    where.reviewerId = filters.reviewerId;
  }

  if (filters.transactionId) {
    where.transactionId = filters.transactionId;
  }

  if (filters.reviewType) {
    where.reviewType = filters.reviewType;
  }

  if (filters.status) {
    where.status = filters.status;
  } else {
    // Default: only show approved reviews
    where.status = 'APPROVED';
  }

  if (filters.isVerifiedPurchase !== undefined) {
    where.isVerifiedPurchase = filters.isVerifiedPurchase;
  }

  // Rating filters
  if (filters.minRating !== undefined || filters.maxRating !== undefined) {
    where.overallRating = {};
    if (filters.minRating !== undefined) {
      where.overallRating.gte = filters.minRating;
    }
    if (filters.maxRating !== undefined) {
      where.overallRating.lte = filters.maxRating;
    }
  }

  // Sorting
  let orderBy: any = { createdAt: 'desc' };

  if (filters.sortBy === 'rating_high') {
    orderBy = { overallRating: 'desc' };
  } else if (filters.sortBy === 'rating_low') {
    orderBy = { overallRating: 'asc' };
  } else if (filters.sortBy === 'helpful') {
    orderBy = { helpfulCount: 'desc' };
  }

  // Get reviews
  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: {
        reviewer: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
            totalReviews: true,
          },
        },
        reviewed: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
        response: true,
        _count: {
          select: {
            votes: true,
          },
        },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get a single review by ID
 */
export const getReviewById = async (reviewId: string): Promise<any> => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
    include: {
      reviewer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
          totalReviews: true,
        },
      },
      reviewed: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
        },
      },
      transaction: {
        select: {
          id: true,
          transactionType: true,
          createdAt: true,
        },
      },
      response: true,
      votes: {
        select: {
          id: true,
          userId: true,
          isHelpful: true,
        },
      },
    },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  return review;
};

/**
 * Update a review
 */
export const updateReview = async (
  reviewId: string,
  reviewerId: string,
  input: UpdateReviewInput
): Promise<any> => {
  // Check if review exists and belongs to user
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  if (review.reviewerId !== reviewerId) {
    throw new ForbiddenError('You can only update your own reviews');
  }

  // Validate ratings if provided
  if (input.overallRating !== undefined && (input.overallRating < 1 || input.overallRating > 5)) {
    throw new BadRequestError('Overall rating must be between 1 and 5');
  }

  const detailedRatings = [
    input.itemAsDescribed,
    input.communication,
    input.shippingSpeed,
    input.packaging,
  ];

  for (const rating of detailedRatings) {
    if (rating !== undefined && (rating < 1 || rating > 5)) {
      throw new BadRequestError('All ratings must be between 1 and 5');
    }
  }

  // Update review
  const updatedReview = await prisma.review.update({
    where: { id: reviewId },
    data: {
      ...input,
      isEdited: true,
      editedAt: new Date(),
    },
    include: {
      reviewer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      reviewed: {
        select: {
          id: true,
          fullName: true,
        },
      },
      response: true,
    },
  });

  // Update user's average rating if overall rating changed
  if (input.overallRating !== undefined && input.overallRating !== review.overallRating) {
    await updateUserRating(review.reviewedId);
  }

  return updatedReview;
};

/**
 * Delete a review
 */
export const deleteReview = async (reviewId: string, userId: string): Promise<void> => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  // Only reviewer can delete their review
  if (review.reviewerId !== userId) {
    throw new ForbiddenError('You can only delete your own reviews');
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  // Update user's average rating
  await updateUserRating(review.reviewedId);
};

// ============================================
// Review Responses
// ============================================

/**
 * Add a response to a review
 */
export const addReviewResponse = async (
  reviewId: string,
  responderId: string,
  message: string
): Promise<any> => {
  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  // Only the reviewed person can respond
  if (review.reviewedId !== responderId) {
    throw new ForbiddenError('You can only respond to reviews about you');
  }

  // Check if response already exists
  const existingResponse = await prisma.reviewResponse.findUnique({
    where: { reviewId },
  });

  if (existingResponse) {
    throw new BadRequestError('Response already exists. Use update instead.');
  }

  const response = await prisma.reviewResponse.create({
    data: {
      reviewId,
      responderId,
      message,
    },
  });

  return response;
};

/**
 * Update a review response
 */
export const updateReviewResponse = async (
  responseId: string,
  responderId: string,
  message: string
): Promise<any> => {
  const response = await prisma.reviewResponse.findUnique({
    where: { id: responseId },
  });

  if (!response) {
    throw new NotFoundError('Response not found');
  }

  if (response.responderId !== responderId) {
    throw new ForbiddenError('You can only update your own responses');
  }

  const updatedResponse = await prisma.reviewResponse.update({
    where: { id: responseId },
    data: {
      message,
      isEdited: true,
      editedAt: new Date(),
    },
  });

  return updatedResponse;
};

/**
 * Delete a review response
 */
export const deleteReviewResponse = async (
  responseId: string,
  responderId: string
): Promise<void> => {
  const response = await prisma.reviewResponse.findUnique({
    where: { id: responseId },
  });

  if (!response) {
    throw new NotFoundError('Response not found');
  }

  if (response.responderId !== responderId) {
    throw new ForbiddenError('You can only delete your own responses');
  }

  await prisma.reviewResponse.delete({
    where: { id: responseId },
  });
};

// ============================================
// Review Voting
// ============================================

/**
 * Vote on a review (helpful/not helpful)
 */
export const voteReview = async (
  reviewId: string,
  userId: string,
  isHelpful: boolean
): Promise<any> => {
  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  // Check if user already voted
  const existingVote = await prisma.reviewVote.findUnique({
    where: {
      reviewId_userId: {
        reviewId,
        userId,
      },
    },
  });

  if (existingVote) {
    // Update existing vote
    if (existingVote.isHelpful === isHelpful) {
      // Same vote - no change
      return existingVote;
    }

    // Different vote - update counts
    const updatedVote = await prisma.$transaction(async (tx) => {
      // Update vote
      const vote = await tx.reviewVote.update({
        where: { id: existingVote.id },
        data: { isHelpful },
      });

      // Update counts
      if (isHelpful) {
        // Changed from not helpful to helpful
        await tx.review.update({
          where: { id: reviewId },
          data: {
            helpfulCount: { increment: 1 },
            notHelpfulCount: { decrement: 1 },
          },
        });
      } else {
        // Changed from helpful to not helpful
        await tx.review.update({
          where: { id: reviewId },
          data: {
            helpfulCount: { decrement: 1 },
            notHelpfulCount: { increment: 1 },
          },
        });
      }

      return vote;
    });

    return updatedVote;
  }

  // Create new vote
  const vote = await prisma.$transaction(async (tx) => {
    const newVote = await tx.reviewVote.create({
      data: {
        reviewId,
        userId,
        isHelpful,
      },
    });

    // Update count
    if (isHelpful) {
      await tx.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { increment: 1 } },
      });
    } else {
      await tx.review.update({
        where: { id: reviewId },
        data: { notHelpfulCount: { increment: 1 } },
      });
    }

    return newVote;
  });

  return vote;
};

/**
 * Remove vote from a review
 */
export const removeVote = async (reviewId: string, userId: string): Promise<void> => {
  const vote = await prisma.reviewVote.findUnique({
    where: {
      reviewId_userId: {
        reviewId,
        userId,
      },
    },
  });

  if (!vote) {
    throw new NotFoundError('Vote not found');
  }

  await prisma.$transaction(async (tx) => {
    // Delete vote
    await tx.reviewVote.delete({
      where: { id: vote.id },
    });

    // Update count
    if (vote.isHelpful) {
      await tx.review.update({
        where: { id: reviewId },
        data: { helpfulCount: { decrement: 1 } },
      });
    } else {
      await tx.review.update({
        where: { id: reviewId },
        data: { notHelpfulCount: { decrement: 1 } },
      });
    }
  });
};

// ============================================
// Review Reporting
// ============================================

/**
 * Report a review
 */
export const reportReview = async (
  reviewId: string,
  reporterId: string,
  reason: ReportReason,
  description?: string
): Promise<any> => {
  // Check if review exists
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new NotFoundError('Review not found');
  }

  // Check if user already reported this review
  const existingReport = await prisma.reviewReport.findUnique({
    where: {
      reviewId_reporterId: {
        reviewId,
        reporterId,
      },
    },
  });

  if (existingReport) {
    throw new BadRequestError('You have already reported this review');
  }

  // Create report
  const report = await prisma.$transaction(async (tx) => {
    const newReport = await tx.reviewReport.create({
      data: {
        reviewId,
        reporterId,
        reason,
        description,
      },
    });

    // Increment report count
    await tx.review.update({
      where: { id: reviewId },
      data: { reportCount: { increment: 1 } },
    });

    // Auto-flag review if it has 3+ reports
    const updatedReview = await tx.review.findUnique({
      where: { id: reviewId },
    });

    if (updatedReview && updatedReview.reportCount >= 3 && updatedReview.status === 'APPROVED') {
      await tx.review.update({
        where: { id: reviewId },
        data: { status: 'FLAGGED' },
      });
    }

    return newReport;
  });

  return report;
};

/**
 * Get reports for a review
 */
export const getReviewReports = async (reviewId: string): Promise<any[]> => {
  const reports = await prisma.reviewReport.findMany({
    where: { reviewId },
    orderBy: { createdAt: 'desc' },
  });

  return reports;
};

// ============================================
// Statistics & Analytics
// ============================================

/**
 * Get review statistics for a user
 */
export const getUserReviewStats = async (userId: string): Promise<any> => {
  const reviews = await prisma.review.findMany({
    where: {
      reviewedId: userId,
      status: 'APPROVED',
    },
    select: {
      overallRating: true,
      itemAsDescribed: true,
      communication: true,
      shippingSpeed: true,
      packaging: true,
      isVerifiedPurchase: true,
    },
  });

  const total = reviews.length;

  if (total === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratingBreakdown: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
      verifiedPurchasePercentage: 0,
      detailedRatings: {
        itemAsDescribed: 0,
        communication: 0,
        shippingSpeed: 0,
        packaging: 0,
      },
    };
  }

  // Calculate average rating
  const averageRating = reviews.reduce((sum, r) => sum + r.overallRating, 0) / total;

  // Rating breakdown
  const ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  reviews.forEach((r) => {
    ratingBreakdown[r.overallRating as keyof typeof ratingBreakdown]++;
  });

  // Verified purchase percentage
  const verifiedCount = reviews.filter((r) => r.isVerifiedPurchase).length;
  const verifiedPurchasePercentage = (verifiedCount / total) * 100;

  // Detailed ratings averages
  const detailedRatings = {
    itemAsDescribed: 0,
    communication: 0,
    shippingSpeed: 0,
    packaging: 0,
  };

  let itemAsDescribedCount = 0;
  let communicationCount = 0;
  let shippingSpeedCount = 0;
  let packagingCount = 0;

  reviews.forEach((r) => {
    if (r.itemAsDescribed) {
      detailedRatings.itemAsDescribed += r.itemAsDescribed;
      itemAsDescribedCount++;
    }
    if (r.communication) {
      detailedRatings.communication += r.communication;
      communicationCount++;
    }
    if (r.shippingSpeed) {
      detailedRatings.shippingSpeed += r.shippingSpeed;
      shippingSpeedCount++;
    }
    if (r.packaging) {
      detailedRatings.packaging += r.packaging;
      packagingCount++;
    }
  });

  if (itemAsDescribedCount > 0) {
    detailedRatings.itemAsDescribed /= itemAsDescribedCount;
  }
  if (communicationCount > 0) {
    detailedRatings.communication /= communicationCount;
  }
  if (shippingSpeedCount > 0) {
    detailedRatings.shippingSpeed /= shippingSpeedCount;
  }
  if (packagingCount > 0) {
    detailedRatings.packaging /= packagingCount;
  }

  return {
    totalReviews: total,
    averageRating: Math.round(averageRating * 10) / 10,
    ratingBreakdown,
    verifiedPurchasePercentage: Math.round(verifiedPurchasePercentage),
    detailedRatings: {
      itemAsDescribed: Math.round(detailedRatings.itemAsDescribed * 10) / 10,
      communication: Math.round(detailedRatings.communication * 10) / 10,
      shippingSpeed: Math.round(detailedRatings.shippingSpeed * 10) / 10,
      packaging: Math.round(detailedRatings.packaging * 10) / 10,
    },
  };
};

/**
 * Update user's average rating and total reviews
 */
export const updateUserRating = async (userId: string): Promise<void> => {
  const reviews = await prisma.review.findMany({
    where: {
      reviewedId: userId,
      status: 'APPROVED',
    },
    select: {
      overallRating: true,
    },
  });

  const total = reviews.length;
  const averageRating = total > 0
    ? reviews.reduce((sum, r) => sum + r.overallRating, 0) / total
    : 0;

  await prisma.user.update({
    where: { id: userId },
    data: {
      rating: Math.round(averageRating * 10) / 10,
      totalReviews: total,
    },
  });
};

/**
 * Check if user can review a transaction
 */
export const canReviewTransaction = async (
  transactionId: string,
  userId: string
): Promise<{ canReview: boolean; reason?: string }> => {
  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
  });

  if (!transaction) {
    return { canReview: false, reason: 'Transaction not found' };
  }

  // Check if user is part of transaction
  if (transaction.buyerId !== userId && transaction.sellerId !== userId) {
    return { canReview: false, reason: 'You are not part of this transaction' };
  }

  // Check if already reviewed
  const existingReview = await prisma.review.findUnique({
    where: {
      transactionId_reviewerId: {
        transactionId,
        reviewerId: userId,
      },
    },
  });

  if (existingReview) {
    return { canReview: false, reason: 'You have already reviewed this transaction' };
  }

  // Check if transaction is completed
  if (transaction.deliveryStatus !== 'DELIVERED') {
    return { canReview: false, reason: 'Transaction must be completed before reviewing' };
  }

  return { canReview: true };
};
