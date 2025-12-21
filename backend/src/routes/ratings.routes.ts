/**
 * Ratings Routes - نقاط API التقييمات الموحدة
 *
 * Unified rating system endpoints:
 * - Submit ratings
 * - Get rating summaries
 * - Respond to ratings
 * - Report ratings
 */

import { Router } from 'express';
import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import * as ratingService from '../services/unified-rating.service';
import { successResponse } from '../utils/response';

const router = Router();

// ============================================
// Public Routes
// ============================================

/**
 * Get rating summary for a user
 * GET /api/v1/ratings/users/:userId
 */
router.get('/users/:userId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;

    const summary = await ratingService.getUserRatingSummary(userId);

    return successResponse(res, summary, 'ملخص التقييمات');
  } catch (error) {
    next(error);
  }
});

/**
 * Get reviews for a user with pagination
 * GET /api/v1/ratings/users/:userId/reviews
 */
router.get('/users/:userId/reviews', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const result = await ratingService.getUserReviews(userId, {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    return successResponse(res, result, 'تقييمات المستخدم');
  } catch (error) {
    next(error);
  }
});

// ============================================
// Protected Routes (Require Authentication)
// ============================================

/**
 * Submit a new rating
 * POST /api/v1/ratings
 */
router.post('/', authenticate, async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    const reviewerId = req.user?.id;
    if (!reviewerId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const {
      reviewedId,
      transactionId,
      ratingType,
      overallRating,
      comment,
    } = req.body;

    if (!reviewedId || !transactionId || !ratingType || !overallRating) {
      return res.status(400).json({
        success: false,
        message: 'reviewedId, transactionId, ratingType, and overallRating are required',
        messageAr: 'معرف المستخدم ومعرف المعاملة ونوع التقييم والتقييم مطلوبة',
      });
    }

    if (overallRating < 1 || overallRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5',
        messageAr: 'التقييم يجب أن يكون بين 1 و 5',
      });
    }

    const rating = await ratingService.submitRating(reviewerId, {
      reviewedId,
      transactionId,
      ratingType,
      overallRating,
      comment,
    });

    return successResponse(res, rating, 'تم إرسال التقييم بنجاح', 201);
  } catch (error) {
    if (error instanceof Error && error.message?.includes('already reviewed')) {
      return res.status(409).json({
        success: false,
        message: error.message,
        messageAr: 'لقد قمت بتقييم هذه المعاملة من قبل',
      });
    }
    next(error);
  }
});

/**
 * Respond to a review
 * POST /api/v1/ratings/:reviewId/respond
 */
router.post('/:reviewId/respond', authenticate, async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { response } = req.body;

    if (!response) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required',
        messageAr: 'نص الرد مطلوب',
      });
    }

    const result = await ratingService.respondToReview(reviewId, userId, response);

    return successResponse(res, result, 'تم إرسال الرد بنجاح');
  } catch (error) {
    if (error instanceof Error && error.message?.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
        messageAr: 'التقييم غير موجود',
      });
    }
    if (error instanceof Error && error.message?.includes('Only the reviewed user')) {
      return res.status(403).json({
        success: false,
        message: error.message,
        messageAr: 'يمكنك الرد فقط على التقييمات الخاصة بك',
      });
    }
    next(error);
  }
});

/**
 * Report a review as inappropriate
 * POST /api/v1/ratings/:reviewId/report
 */
router.post('/:reviewId/report', authenticate, async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    const { reviewId } = req.params;
    const reporterId = req.user?.id;
    if (!reporterId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required',
        messageAr: 'سبب الإبلاغ مطلوب',
      });
    }

    const result = await ratingService.reportReview(reviewId, reporterId, reason);

    return successResponse(res, result, 'تم إرسال البلاغ بنجاح');
  } catch (error) {
    if (error instanceof Error && error.message?.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Review not found',
        messageAr: 'التقييم غير موجود',
      });
    }
    next(error);
  }
});

/**
 * Get my rating summary
 * GET /api/v1/ratings/me
 */
router.get('/me', authenticate, async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const summary = await ratingService.getUserRatingSummary(userId);

    return successResponse(res, summary, 'تقييماتي');
  } catch (error) {
    next(error);
  }
});

/**
 * Get reviews I've given
 * GET /api/v1/ratings/me/given
 */
router.get('/me/given', authenticate, async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { page, limit } = req.query;

    const result = await ratingService.getReviewsGiven(userId, {
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
    });

    return successResponse(res, result, 'التقييمات التي أعطيتها');
  } catch (error) {
    next(error);
  }
});

/**
 * Check if user can review a transaction
 * GET /api/v1/ratings/can-review/:transactionId
 */
router.get('/can-review/:transactionId', authenticate, async (req: Request & { user?: { id: string } }, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    const { transactionId } = req.params;

    const canReview = await ratingService.canReviewTransaction(userId, transactionId);

    return successResponse(res, { canReview }, canReview ? 'يمكنك التقييم' : 'لا يمكنك التقييم');
  } catch (error) {
    next(error);
  }
});

export default router;
