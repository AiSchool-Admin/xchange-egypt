/**
 * Silver Reviews & Ratings Service
 * خدمة المراجعات والتقييمات لسوق الفضة
 *
 * Uses existing Review model with Transaction
 */

import prisma from '../config/database';

export interface ReviewSubmission {
  transactionId: string;
  rating: number;
  descriptionAccuracy: number;
  communication: number;
  packagingQuality: number;
  shippingSpeed: number;
  comment?: string;
  images?: string[];
}

/**
 * Submit review for a silver transaction
 * Note: Creates a general Transaction record to link the review
 */
export const submitReview = async (userId: string, data: ReviewSubmission) => {
  // Get silver transaction and verify user is buyer
  const silverTx = await prisma.silverTransaction.findUnique({
    where: { id: data.transactionId },
    include: { item: true },
  });

  if (!silverTx) {
    throw new Error('Transaction not found');
  }

  if (silverTx.buyerId !== userId) {
    throw new Error('Only buyer can review');
  }

  if (silverTx.status !== 'COMPLETED') {
    throw new Error('Can only review completed transactions');
  }

  // Check if already reviewed by checking if a review exists for this user and seller
  // for a recent transaction
  const existingReview = await prisma.review.findFirst({
    where: {
      reviewerId: userId,
      reviewedId: silverTx.sellerId,
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }, // Last 7 days
    },
  });

  if (existingReview) {
    throw new Error('Already reviewed');
  }

  // Find or create a general transaction record to link the review
  let transaction = await prisma.transaction.findFirst({
    where: {
      buyerId: silverTx.buyerId,
      sellerId: silverTx.sellerId,
      createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
    },
  });

  if (!transaction) {
    // Create a placeholder transaction for the review
    transaction = await prisma.transaction.create({
      data: {
        buyerId: silverTx.buyerId,
        sellerId: silverTx.sellerId,
        status: 'COMPLETED',
        totalAmount: silverTx.totalAmount,
        platformFee: silverTx.buyerCommission,
        netAmount: silverTx.itemPrice,
      },
    });
  }

  // Create review
  const review = await prisma.review.create({
    data: {
      transactionId: transaction.id,
      reviewerId: userId,
      reviewedId: silverTx.sellerId,
      reviewType: 'SELLER_REVIEW',
      overallRating: Math.round(data.rating),
      itemAsDescribed: data.descriptionAccuracy,
      communication: data.communication,
      shippingSpeed: data.shippingSpeed,
      packaging: data.packagingQuality,
      comment: data.comment || '',
      images: data.images || [],
      isVerifiedPurchase: true,
    },
    include: {
      reviewer: {
        select: { id: true, fullName: true, avatar: true },
      },
    },
  });

  // Update seller's average rating
  const sellerReviews = await prisma.review.aggregate({
    where: { reviewedId: silverTx.sellerId },
    _avg: { overallRating: true },
    _count: true,
  });

  await prisma.user.update({
    where: { id: silverTx.sellerId },
    data: {
      rating: sellerReviews._avg.overallRating || 0,
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
  _marketplace?: string
) => {
  const where = { reviewedId: sellerId };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        reviewer: {
          select: { id: true, fullName: true, avatar: true },
        },
        response: true,
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
    select: {
      itemAsDescribed: true,
      communication: true,
      packaging: true,
      shippingSpeed: true,
    },
  });

  const categoryAverages = {
    descriptionAccuracy: 0,
    communication: 0,
    packagingQuality: 0,
    shippingSpeed: 0,
  };

  if (allReviews.length > 0) {
    let count = 0;
    allReviews.forEach(r => {
      if (r.itemAsDescribed) {
        categoryAverages.descriptionAccuracy += r.itemAsDescribed;
        categoryAverages.communication += r.communication || 0;
        categoryAverages.packagingQuality += r.packaging || 0;
        categoryAverages.shippingSpeed += r.shippingSpeed || 0;
        count++;
      }
    });

    if (count > 0) {
      categoryAverages.descriptionAccuracy /= count;
      categoryAverages.communication /= count;
      categoryAverages.packagingQuality /= count;
      categoryAverages.shippingSpeed /= count;
    }
  }

  return {
    reviews,
    categoryAverages,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Get reviews for an item - returns reviews for the seller
 */
export const getItemReviews = async (itemId: string) => {
  const item = await prisma.silverItem.findUnique({
    where: { id: itemId },
    select: { sellerId: true },
  });

  if (!item) return [];

  const reviews = await prisma.review.findMany({
    where: { reviewedId: item.sellerId },
    include: {
      reviewer: {
        select: { id: true, fullName: true, avatar: true },
      },
      response: true,
    },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });

  return reviews;
};

/**
 * Seller respond to review
 */
export const respondToReview = async (
  reviewId: string,
  sellerId: string,
  responseText: string
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

  // Create or update response
  const response = await prisma.reviewResponse.upsert({
    where: { reviewId },
    update: {
      message: responseText,
      isEdited: true,
      editedAt: new Date(),
    },
    create: {
      reviewId,
      responderId: sellerId,
      message: responseText,
    },
  });

  return { ...review, response };
};

/**
 * Report a review
 */
export const reportReview = async (
  reviewId: string,
  userId: string,
  reason: string
) => {
  // Create a report record
  await prisma.reviewReport.create({
    data: {
      reviewId,
      reporterId: userId,
      reason: 'OTHER',
      description: reason,
    },
  });

  // Increment report count
  const review = await prisma.review.update({
    where: { id: reviewId },
    data: {
      reportCount: { increment: 1 },
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
  const reviews = await prisma.review.findMany({
    where: { reviewedId: sellerId },
    select: { overallRating: true },
  });

  const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach(r => {
    if (r.overallRating >= 1 && r.overallRating <= 5) {
      ratingDistribution[r.overallRating]++;
    }
  });

  return {
    averageRating: user?.rating || 0,
    totalReviews: user?.totalReviews || 0,
    distribution: ratingDistribution,
  };
};
