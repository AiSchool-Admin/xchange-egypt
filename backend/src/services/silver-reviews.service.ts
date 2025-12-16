/**
 * Silver Reviews & Ratings Service
 * خدمة المراجعات والتقييمات لسوق الفضة
 *
 * Note: This is a placeholder implementation using in-memory storage.
 * Full functionality requires linking to Transaction model with proper listingId.
 */

import prisma from '../config/database';

// In-memory storage for silver reviews (placeholder)
const reviewsStore: Map<string, any> = new Map();

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

  // Check if already reviewed
  const reviewKey = `${userId}-${silverTx.sellerId}-${data.transactionId}`;
  if (reviewsStore.has(reviewKey)) {
    throw new Error('Already reviewed');
  }

  // Create review (in-memory)
  const review = {
    id: `review-${Date.now()}`,
    transactionId: data.transactionId,
    silverTransactionId: silverTx.id,
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
    createdAt: new Date(),
    reviewer: {
      id: userId,
      fullName: 'User',
      avatar: null,
    },
  };

  reviewsStore.set(reviewKey, review);
  reviewsStore.set(review.id, review);

  // Update seller's average rating from in-memory reviews
  const sellerReviews: any[] = [];
  reviewsStore.forEach((r) => {
    if (r.reviewedId === silverTx.sellerId && r.overallRating) {
      sellerReviews.push(r);
    }
  });

  if (sellerReviews.length > 0) {
    const avgRating = sellerReviews.reduce((sum, r) => sum + r.overallRating, 0) / sellerReviews.length;
    await prisma.user.update({
      where: { id: silverTx.sellerId },
      data: {
        rating: avgRating,
        totalReviews: sellerReviews.length,
      },
    });
  }

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
  const reviews: any[] = [];

  reviewsStore.forEach((r) => {
    if (r.reviewedId === sellerId && r.overallRating) {
      reviews.push(r);
    }
  });

  // Sort by createdAt desc
  reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const total = reviews.length;
  const start = (page - 1) * limit;
  const paginatedReviews = reviews.slice(start, start + limit);

  // Calculate category averages
  const categoryAverages = {
    descriptionAccuracy: 0,
    communication: 0,
    packagingQuality: 0,
    shippingSpeed: 0,
  };

  if (reviews.length > 0) {
    reviews.forEach((r) => {
      categoryAverages.descriptionAccuracy += r.itemAsDescribed || 0;
      categoryAverages.communication += r.communication || 0;
      categoryAverages.packagingQuality += r.packaging || 0;
      categoryAverages.shippingSpeed += r.shippingSpeed || 0;
    });

    categoryAverages.descriptionAccuracy /= reviews.length;
    categoryAverages.communication /= reviews.length;
    categoryAverages.packagingQuality /= reviews.length;
    categoryAverages.shippingSpeed /= reviews.length;
  }

  return {
    reviews: paginatedReviews,
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

  const reviews: any[] = [];
  reviewsStore.forEach((r) => {
    if (r.reviewedId === item.sellerId && r.overallRating) {
      reviews.push(r);
    }
  });

  // Sort and take first 5
  reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return reviews.slice(0, 5);
};

/**
 * Seller respond to review
 */
export const respondToReview = async (
  reviewId: string,
  sellerId: string,
  responseText: string
) => {
  const review = reviewsStore.get(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  if (review.reviewedId !== sellerId) {
    throw new Error('Unauthorized');
  }

  // Add response to review
  review.response = {
    id: `response-${Date.now()}`,
    reviewId,
    responderId: sellerId,
    message: responseText,
    createdAt: new Date(),
  };

  reviewsStore.set(reviewId, review);

  return review;
};

/**
 * Report a review
 */
export const reportReview = async (
  reviewId: string,
  userId: string,
  reason: string
) => {
  const review = reviewsStore.get(reviewId);

  if (!review) {
    throw new Error('Review not found');
  }

  // Track reports
  review.reports = review.reports || [];
  review.reports.push({
    reporterId: userId,
    reason,
    createdAt: new Date(),
  });
  review.reportCount = review.reports.length;

  reviewsStore.set(reviewId, review);

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

  // Get rating distribution from in-memory
  const reviews: any[] = [];
  reviewsStore.forEach((r) => {
    if (r.reviewedId === sellerId && r.overallRating) {
      reviews.push(r);
    }
  });

  const ratingDistribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };

  reviews.forEach((r) => {
    const rating = Math.round(r.overallRating);
    if (rating >= 1 && rating <= 5) {
      ratingDistribution[rating]++;
    }
  });

  return {
    averageRating: user?.rating || 0,
    totalReviews: user?.totalReviews || 0,
    distribution: ratingDistribution,
  };
};
