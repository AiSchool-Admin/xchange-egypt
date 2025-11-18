/**
 * Review Controller
 *
 * HTTP request handlers for review and rating operations
 */

import { Request, Response, NextFunction } from 'express';
import * as reviewService from '../services/review.service';
import { successResponse } from '../utils/response';
import { AuthRequest } from '../middleware/auth.middleware';

// ============================================
// Review CRUD Controllers
// ============================================

/**
 * Create a new review
 * POST /api/v1/reviews
 */
export const createReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const review = await reviewService.createReview(userId, req.body);

    return successResponse(res, review, 'Review created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get reviews with filters
 * GET /api/v1/reviews
 */
export const getReviews = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await reviewService.getReviews(req.query);

    return successResponse(res, result, 'Reviews retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get a single review by ID
 * GET /api/v1/reviews/:id
 */
export const getReviewById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const review = await reviewService.getReviewById(req.params.id);

    return successResponse(res, review, 'Review retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review
 * PATCH /api/v1/reviews/:id
 */
export const updateReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const review = await reviewService.updateReview(
      req.params.id,
      userId,
      req.body
    );

    return successResponse(res, review, 'Review updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review
 * DELETE /api/v1/reviews/:id
 */
export const deleteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    await reviewService.deleteReview(req.params.id, userId);

    return successResponse(res, null, 'Review deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Review Response Controllers
// ============================================

/**
 * Add a response to a review
 * POST /api/v1/reviews/:id/response
 */
export const addReviewResponse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const response = await reviewService.addReviewResponse(
      req.params.id,
      userId,
      req.body.message
    );

    return successResponse(res, response, 'Response added successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Update a review response
 * PATCH /api/v1/reviews/responses/:id
 */
export const updateReviewResponse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const response = await reviewService.updateReviewResponse(
      req.params.id,
      userId,
      req.body.message
    );

    return successResponse(res, response, 'Response updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a review response
 * DELETE /api/v1/reviews/responses/:id
 */
export const deleteReviewResponse = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    await reviewService.deleteReviewResponse(req.params.id, userId);

    return successResponse(res, null, 'Response deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Review Voting Controllers
// ============================================

/**
 * Vote on a review (helpful/not helpful)
 * POST /api/v1/reviews/:id/vote
 */
export const voteReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const vote = await reviewService.voteReview(
      req.params.id,
      userId,
      req.body.isHelpful
    );

    return successResponse(res, vote, 'Vote recorded successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove vote from a review
 * DELETE /api/v1/reviews/:id/vote
 */
export const removeVote = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    await reviewService.removeVote(req.params.id, userId);

    return successResponse(res, null, 'Vote removed successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Review Reporting Controllers
// ============================================

/**
 * Report a review
 * POST /api/v1/reviews/:id/report
 */
export const reportReview = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const report = await reviewService.reportReview(
      req.params.id,
      userId,
      req.body.reason,
      req.body.description
    );

    return successResponse(res, report, 'Review reported successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get reports for a review
 * GET /api/v1/reviews/:id/reports
 */
export const getReviewReports = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const reports = await reviewService.getReviewReports(req.params.id);

    return successResponse(res, reports, 'Reports retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Statistics Controllers
// ============================================

/**
 * Get review statistics for a user
 * GET /api/v1/reviews/users/:userId/stats
 */
export const getUserReviewStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await reviewService.getUserReviewStats(req.params.userId);

    return successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user can review a transaction
 * GET /api/v1/reviews/transactions/:transactionId/can-review
 */
export const canReviewTransaction = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const result = await reviewService.canReviewTransaction(
      req.params.transactionId,
      userId
    );

    return successResponse(res, result, 'Check completed successfully');
  } catch (error) {
    next(error);
  }
};
