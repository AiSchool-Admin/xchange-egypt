/**
 * Silver Reviews & Ratings Service
 * خدمة المراجعات والتقييمات لسوق الفضة
 */

import prisma from '../config/database';

export interface ReviewSubmission {
  transactionId: string;
  rating: number; // 1-5
  descriptionAccuracy: number; // 1-5
  communication: number; // 1-5
  packagingQuality: number; // 1-5
  shippingSpeed: number; // 1-5
  comment?: string;
  images?: string[];
}

/**
 * Submit review for a transaction
 */
export const submitReview = async (userId: string, data: ReviewSubmission) => {
  // Get transaction and verify user is buyer
  const transaction = await prisma.silverTransaction.findUnique({
    where: { id: data.transactionId },
    include: { item: true },
  });

  if (!transaction) {
    throw new Error('Transaction not found');
  }

  if (transaction.buyerId !== userId) {
    throw new Error('Only buyer can review');
  }

  if (transaction.status !== 'COMPLETED') {
    throw new Error('Can only review completed transactions');
  }

  // Check if already reviewed
  const existingReview = await prisma.review.findFirst({
    where: {
      reviewerId: userId,
      transactionId: data.transactionId,
    },
  });

  if (existingReview) {
    throw new Error('Already reviewed');
  }

  // Calculate overall rating
  const overallRating = (
    data.rating +
    data.descriptionAccuracy +
    data.communication +
    data.packagingQuality +
    data.shippingSpeed
  ) / 5;

  // Create review
  const review = await prisma.review.create({
    data: {
      reviewerId: userId,
      reviewedId: transaction.sellerId,
      transactionId: data.transactionId,
      itemId: transaction.itemId,
      rating: Math.round(overallRating * 10) / 10,
      comment: data.comment,
      isVerifiedPurchase: true,
      metadata: {
        descriptionAccuracy: data.descriptionAccuracy,
        communication: data.communication,
        packagingQuality: data.packagingQuality,
        shippingSpeed: data.shippingSpeed,
        images: data.images,
        marketplace: 'silver',
      },
    },
    include: {
      reviewer: {
        select: { id: true, fullName: true, avatar: true },
      },
    },
  });

  // Update seller's average rating
  const sellerReviews = await prisma.review.aggregate({
    where: { reviewedId: transaction.sellerId },
    _avg: { rating: true },
    _count: true,
  });

  await prisma.user.update({
    where: { id: transaction.sellerId },
    data: {
      rating: sellerReviews._avg.rating || 0,
      totalReviews: sellerReviews._count,
    },
  });

  return review;
};

/**
 * Get reviews for a seller
 */
export const getSellerReviews = async (
  sellerId: string,
  page = 1,
  limit = 10,
  marketplace?: string
) => {
  const where: any = { reviewedId: sellerId };

  if (marketplace) {
    where.metadata = { path: ['marketplace'], equals: marketplace };
  }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.review.count({ where }),
  ]);

  // Calculate category averages
  const allReviews = await prisma.review.findMany({
    where: { reviewedId: sellerId },
    select: { metadata: true },
  });

  const categoryAverages = {
    descriptionAccuracy: 0,
    communication: 0,
    packagingQuality: 0,
    shippingSpeed: 0,
  };

  let count = 0;
  allReviews.forEach(r => {
    const meta = r.metadata as any;
    if (meta?.descriptionAccuracy) {
      categoryAverages.descriptionAccuracy += meta.descriptionAccuracy;
      categoryAverages.communication += meta.communication || 0;
      categoryAverages.packagingQuality += meta.packagingQuality || 0;
      categoryAverages.shippingSpeed += meta.shippingSpeed || 0;
      count++;
    }
  });

  if (count > 0) {
    categoryAverages.descriptionAccuracy /= count;
    categoryAverages.communication /= count;
    categoryAverages.packagingQuality /= count;
    categoryAverages.shippingSpeed /= count;
  }

  return {
    reviews,
    categoryAverages,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Get reviews for an item
 */
export const getItemReviews = async (itemId: string) => {
  const reviews = await prisma.review.findMany({
    where: { itemId },
    include: {
      reviewer: {
        select: { id: true, fullName: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return reviews;
};

/**
 * Seller respond to review
 */
export const respondToReview = async (
  reviewId: string,
  sellerId: string,
  response: string
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.reviewedId !== sellerId) {
    throw new Error('Unauthorized');
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: {
      sellerResponse: response,
      sellerRespondedAt: new Date(),
    },
  });

  return updated;
};

/**
 * Report a review
 */
export const reportReview = async (
  reviewId: string,
  userId: string,
  reason: string
) => {
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      isReported: true,
      reportReason: reason,
      reportedBy: userId,
      reportedAt: new Date(),
    },
  });

  return review;
};

/**
 * Get seller rating summary
 */
export const getSellerRatingSummary = async (sellerId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: sellerId },
    select: { rating: true, totalReviews: true },
  });

  // Get rating distribution
  const distribution = await prisma.review.groupBy({
    by: ['rating'],
    where: { reviewedId: sellerId },
    _count: true,
  });

  const ratingDistribution = {
    5: 0, 4: 0, 3: 0, 2: 0, 1: 0,
  };

  distribution.forEach(d => {
    const rounded = Math.round(d.rating);
    if (rounded >= 1 && rounded <= 5) {
      ratingDistribution[rounded as keyof typeof ratingDistribution] = d._count;
    }
  });

  return {
    averageRating: user?.rating || 0,
    totalReviews: user?.totalReviews || 0,
    distribution: ratingDistribution,
  };
};
