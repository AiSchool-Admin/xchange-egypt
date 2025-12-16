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
import { authenticate, optionalAuth } from '../middleware/auth.middleware';
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
    const { type } = req.query;

    const summary = await ratingService.getUserRatingSummary(
      userId,
      type as ratingService.RatingType
    );

    return successResponse(res, summary, 'ملخص التقييمات');
  } catch (error) {
    next(error);
  }
});

/**
 * Get ratings for an entity (item, transaction, etc.)
 * GET /api/v1/ratings/entities/:entityId
 */
router.get('/entities/:entityId', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { entityId } = req.params;
    const { limit, offset } = req.query;

    const result = await ratingService.getEntityRatings(
      entityId,
      limit ? parseInt(limit as string, 10) : 10,
      offset ? parseInt(offset as string, 10) : 0
    );

    return successResponse(res, result, 'تقييمات المنتج');
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
router.post('/', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raterId = req.user!.id;
    const {
      ratedId,
      ratingType,
      entityId,
      score,
      categories,
      review,
      reviewAr,
      isAnonymous,
      images,
    } = req.body;

    if (!ratedId || !ratingType || !score) {
      return res.status(400).json({
        success: false,
        message: 'ratedId, ratingType, and score are required',
        messageAr: 'معرف المستخدم ونوع التقييم والدرجة مطلوبة',
      });
    }

    if (score < 1 || score > 5) {
      return res.status(400).json({
        success: false,
        message: 'Score must be between 1 and 5',
        messageAr: 'الدرجة يجب أن تكون بين 1 و 5',
      });
    }

    const rating = await ratingService.submitRating({
      raterId,
      ratedId,
      ratingType,
      entityId,
      score,
      categories,
      review,
      reviewAr,
      isAnonymous,
      images,
    });

    return successResponse(res, rating, 'تم إرسال التقييم بنجاح', 201);
  } catch (error: any) {
    if (error.message.includes('already submitted')) {
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
 * Respond to a rating
 * POST /api/v1/ratings/:ratingId/respond
 */
router.post('/:ratingId/respond', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ratingId } = req.params;
    const responderId = req.user!.id;
    const { responseText, responseTextAr } = req.body;

    if (!responseText) {
      return res.status(400).json({
        success: false,
        message: 'Response text is required',
        messageAr: 'نص الرد مطلوب',
      });
    }

    const response = await ratingService.respondToRating(
      ratingId,
      responderId,
      responseText,
      responseTextAr
    );

    return successResponse(res, response, 'تم إرسال الرد بنجاح');
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
        messageAr: 'التقييم غير موجود',
      });
    }
    if (error.message.includes('only respond')) {
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
 * Report a rating as inappropriate
 * POST /api/v1/ratings/:ratingId/report
 */
router.post('/:ratingId/report', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { ratingId } = req.params;
    const reporterId = req.user!.id;
    const { reason } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Report reason is required',
        messageAr: 'سبب الإبلاغ مطلوب',
      });
    }

    await ratingService.reportRating(ratingId, reporterId, reason);

    return successResponse(res, null, 'تم إرسال البلاغ بنجاح');
  } catch (error: any) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: 'Rating not found',
        messageAr: 'التقييم غير موجود',
      });
    }
    next(error);
  }
});

/**
 * Get my ratings (ratings I've received)
 * GET /api/v1/ratings/me
 */
router.get('/me', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { type } = req.query;

    const summary = await ratingService.getUserRatingSummary(
      userId,
      type as ratingService.RatingType
    );

    return successResponse(res, summary, 'تقييماتي');
  } catch (error) {
    next(error);
  }
});

export default router;
