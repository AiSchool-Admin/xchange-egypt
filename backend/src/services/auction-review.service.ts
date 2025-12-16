import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuctionStatus } from '@prisma/client';
import { CreateReviewInput } from '../validations/auction.validation';

/**
 * ============================================
 * نظام تقييمات المزادات
 * Auction Review System
 * ============================================
 */

/**
 * إنشاء تقييم للمزاد
 */
export const createReview = async (
  userId: string,
  auctionId: string,
  data: CreateReviewInput
) => {
  // التحقق من وجود المزاد
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      listing: {
        include: { item: true },
      },
    },
  });

  if (!auction) {
    throw new AppError('المزاد غير موجود', 404);
  }

  // التحقق من اكتمال المزاد
  if (auction.status !== AuctionStatus.COMPLETED) {
    throw new AppError('لا يمكن تقييم مزاد غير مكتمل', 400);
  }

  // تحديد من يتم تقييمه
  const sellerId = auction.listing.item.sellerId;
  const winnerId = auction.winnerId;

  if (!winnerId) {
    throw new AppError('لا يوجد فائز في هذا المزاد', 400);
  }

  let revieweeId: string;
  if (userId === sellerId) {
    // البائع يقيم المشتري
    revieweeId = winnerId;
  } else if (userId === winnerId) {
    // المشتري يقيم البائع
    revieweeId = sellerId;
  } else {
    throw new AppError('لست طرفاً في هذا المزاد', 403);
  }

  // التحقق من عدم وجود تقييم سابق
  const existingReview = await prisma.auctionReview.findUnique({
    where: {
      auctionId_reviewerId: { auctionId, reviewerId: userId },
    },
  });

  if (existingReview) {
    throw new AppError('لقد قمت بتقييم هذا المزاد بالفعل', 400);
  }

  // إنشاء التقييم
  const review = await prisma.$transaction(async (tx) => {
    const newReview = await tx.auctionReview.create({
      data: {
        auctionId,
        reviewerId: userId,
        revieweeId,
        overallRating: data.overallRating,
        accuracyRating: data.accuracyRating,
        communicationRating: data.communicationRating,
        shippingRating: data.shippingRating,
        paymentRating: data.paymentRating,
        comment: data.comment,
        images: data.images || [],
      },
      include: {
        reviewer: {
          select: { id: true, fullName: true },
        },
        reviewee: {
          select: { id: true, fullName: true },
        },
      },
    });

    // تحديث تقييم المستخدم المُقيَّم
    const allReviews = await tx.auctionReview.findMany({
      where: { revieweeId },
      select: { overallRating: true },
    });

    const totalRating = allReviews.reduce((sum, r) => sum + r.overallRating, 0);
    const avgRating = totalRating / allReviews.length;

    await tx.user.update({
      where: { id: revieweeId },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        totalReviews: allReviews.length,
      },
    });

    // تحديث ملف المزايد إذا وجد
    const bidderProfile = await tx.bidderProfile.findUnique({
      where: { userId: revieweeId },
    });

    if (bidderProfile) {
      await tx.bidderProfile.update({
        where: { userId: revieweeId },
        data: {
          // تحديث مستوى الثقة بناءً على التقييم
          trustScore: Math.min(100, bidderProfile.trustScore + (data.overallRating >= 4 ? 2 : -1)),
        },
      });
    }

    return newReview;
  });

  return review;
};

/**
 * الرد على تقييم
 */
export const respondToReview = async (
  userId: string,
  reviewId: string,
  response: string
) => {
  const review = await prisma.auctionReview.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError('التقييم غير موجود', 404);
  }

  // فقط الشخص المُقيَّم يمكنه الرد
  if (review.revieweeId !== userId) {
    throw new AppError('لا يمكنك الرد على هذا التقييم', 403);
  }

  if (review.response) {
    throw new AppError('لقد قمت بالرد على هذا التقييم بالفعل', 400);
  }

  const updated = await prisma.auctionReview.update({
    where: { id: reviewId },
    data: {
      response,
      respondedAt: new Date(),
    },
    include: {
      reviewer: {
        select: { id: true, fullName: true },
      },
      reviewee: {
        select: { id: true, fullName: true },
      },
    },
  });

  return updated;
};

/**
 * الحصول على تقييمات مزاد
 */
export const getAuctionReviews = async (auctionId: string) => {
  const reviews = await prisma.auctionReview.findMany({
    where: { auctionId },
    include: {
      reviewer: {
        select: { id: true, fullName: true, avatar: true },
      },
      reviewee: {
        select: { id: true, fullName: true, avatar: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return reviews;
};

/**
 * الحصول على تقييمات المستخدم
 */
export const getUserReviews = async (
  userId: string,
  type: 'received' | 'given' = 'received',
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;

  const where = type === 'received' ? { revieweeId: userId } : { reviewerId: userId };

  const [reviews, total] = await Promise.all([
    prisma.auctionReview.findMany({
      where,
      include: {
        auction: {
          include: {
            listing: {
              include: {
                item: {
                  select: {
                    id: true,
                    title: true,
                  },
                },
              },
            },
          },
        },
        reviewer: {
          select: { id: true, fullName: true, avatar: true },
        },
        reviewee: {
          select: { id: true, fullName: true, avatar: true },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auctionReview.count({ where }),
  ]);

  return {
    reviews,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * الحصول على ملخص تقييمات المستخدم
 */
export const getUserReviewSummary = async (userId: string) => {
  const reviews = await prisma.auctionReview.findMany({
    where: { revieweeId: userId },
    select: {
      overallRating: true,
      accuracyRating: true,
      communicationRating: true,
      shippingRating: true,
      paymentRating: true,
    },
  });

  if (reviews.length === 0) {
    return {
      totalReviews: 0,
      averageRating: 0,
      ratings: {
        overall: 0,
        accuracy: 0,
        communication: 0,
        shipping: 0,
        payment: 0,
      },
      distribution: {
        5: 0,
        4: 0,
        3: 0,
        2: 0,
        1: 0,
      },
    };
  }

  const distribution: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let totalOverall = 0;
  let totalAccuracy = 0;
  let totalCommunication = 0;
  let totalShipping = 0;
  let totalPayment = 0;
  let accuracyCount = 0;
  let communicationCount = 0;
  let shippingCount = 0;
  let paymentCount = 0;

  for (const review of reviews) {
    const roundedRating = Math.round(review.overallRating);
    distribution[roundedRating] = (distribution[roundedRating] || 0) + 1;

    totalOverall += review.overallRating;

    if (review.accuracyRating) {
      totalAccuracy += review.accuracyRating;
      accuracyCount++;
    }
    if (review.communicationRating) {
      totalCommunication += review.communicationRating;
      communicationCount++;
    }
    if (review.shippingRating) {
      totalShipping += review.shippingRating;
      shippingCount++;
    }
    if (review.paymentRating) {
      totalPayment += review.paymentRating;
      paymentCount++;
    }
  }

  return {
    totalReviews: reviews.length,
    averageRating: Math.round((totalOverall / reviews.length) * 10) / 10,
    ratings: {
      overall: Math.round((totalOverall / reviews.length) * 10) / 10,
      accuracy: accuracyCount > 0 ? Math.round((totalAccuracy / accuracyCount) * 10) / 10 : 0,
      communication: communicationCount > 0 ? Math.round((totalCommunication / communicationCount) * 10) / 10 : 0,
      shipping: shippingCount > 0 ? Math.round((totalShipping / shippingCount) * 10) / 10 : 0,
      payment: paymentCount > 0 ? Math.round((totalPayment / paymentCount) * 10) / 10 : 0,
    },
    distribution,
  };
};

/**
 * التحقق من إمكانية التقييم
 */
export const canReview = async (userId: string, auctionId: string): Promise<{
  canReview: boolean;
  reason?: string;
}> => {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      listing: {
        include: { item: true },
      },
    },
  });

  if (!auction) {
    return { canReview: false, reason: 'المزاد غير موجود' };
  }

  if (auction.status !== AuctionStatus.COMPLETED) {
    return { canReview: false, reason: 'المزاد لم يكتمل بعد' };
  }

  const sellerId = auction.listing.item.sellerId;
  const winnerId = auction.winnerId;

  if (userId !== sellerId && userId !== winnerId) {
    return { canReview: false, reason: 'لست طرفاً في هذا المزاد' };
  }

  const existingReview = await prisma.auctionReview.findUnique({
    where: {
      auctionId_reviewerId: { auctionId, reviewerId: userId },
    },
  });

  if (existingReview) {
    return { canReview: false, reason: 'لقد قمت بتقييم هذا المزاد بالفعل' };
  }

  return { canReview: true };
};
