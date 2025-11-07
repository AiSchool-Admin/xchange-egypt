/**
 * Review Routes
 *
 * All routes for the review and rating system
 */

import { Router } from 'express';
import * as reviewController from '../controllers/review.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createReviewSchema,
  updateReviewSchema,
  getReviewsSchema,
  getReviewByIdSchema,
  deleteReviewSchema,
  addReviewResponseSchema,
  updateReviewResponseSchema,
  deleteReviewResponseSchema,
  voteReviewSchema,
  removeVoteSchema,
  reportReviewSchema,
  getReviewReportsSchema,
  getUserReviewStatsSchema,
  canReviewTransactionSchema,
} from '../validations/review.validation';

const router = Router();

// ============================================
// Review CRUD Routes
// ============================================

/**
 * Create a new review
 * POST /api/v1/reviews
 * Body: {
 *   transactionId: string,
 *   reviewedId: string,
 *   reviewType?: 'SELLER_REVIEW' | 'BUYER_REVIEW' | 'ITEM_REVIEW',
 *   overallRating: number (1-5),
 *   itemAsDescribed?: number (1-5),
 *   communication?: number (1-5),
 *   shippingSpeed?: number (1-5),
 *   packaging?: number (1-5),
 *   title?: string,
 *   comment?: string,
 *   images?: string[]
 * }
 */
router.post(
  '/',
  authenticate,
  validate(createReviewSchema),
  reviewController.createReview
);

/**
 * Get reviews with filters
 * GET /api/v1/reviews
 * Query params:
 *   - reviewedId?: string
 *   - reviewerId?: string
 *   - transactionId?: string
 *   - reviewType?: 'SELLER_REVIEW' | 'BUYER_REVIEW' | 'ITEM_REVIEW'
 *   - status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'HIDDEN'
 *   - minRating?: number (1-5)
 *   - maxRating?: number (1-5)
 *   - isVerifiedPurchase?: boolean
 *   - page?: number
 *   - limit?: number
 *   - sortBy?: 'recent' | 'rating_high' | 'rating_low' | 'helpful'
 */
router.get(
  '/',
  validate(getReviewsSchema),
  reviewController.getReviews
);

/**
 * Get a single review by ID
 * GET /api/v1/reviews/:id
 */
router.get(
  '/:id',
  validate(getReviewByIdSchema),
  reviewController.getReviewById
);

/**
 * Update a review
 * PATCH /api/v1/reviews/:id
 * Body: {
 *   overallRating?: number (1-5),
 *   itemAsDescribed?: number (1-5),
 *   communication?: number (1-5),
 *   shippingSpeed?: number (1-5),
 *   packaging?: number (1-5),
 *   title?: string,
 *   comment?: string,
 *   images?: string[]
 * }
 */
router.patch(
  '/:id',
  authenticate,
  validate(updateReviewSchema),
  reviewController.updateReview
);

/**
 * Delete a review
 * DELETE /api/v1/reviews/:id
 */
router.delete(
  '/:id',
  authenticate,
  validate(deleteReviewSchema),
  reviewController.deleteReview
);

// ============================================
// Review Response Routes
// ============================================

/**
 * Add a response to a review
 * POST /api/v1/reviews/:id/response
 * Body: {
 *   message: string
 * }
 */
router.post(
  '/:id/response',
  authenticate,
  validate(addReviewResponseSchema),
  reviewController.addReviewResponse
);

/**
 * Update a review response
 * PATCH /api/v1/reviews/responses/:id
 * Body: {
 *   message: string
 * }
 */
router.patch(
  '/responses/:id',
  authenticate,
  validate(updateReviewResponseSchema),
  reviewController.updateReviewResponse
);

/**
 * Delete a review response
 * DELETE /api/v1/reviews/responses/:id
 */
router.delete(
  '/responses/:id',
  authenticate,
  validate(deleteReviewResponseSchema),
  reviewController.deleteReviewResponse
);

// ============================================
// Review Voting Routes
// ============================================

/**
 * Vote on a review (helpful/not helpful)
 * POST /api/v1/reviews/:id/vote
 * Body: {
 *   isHelpful: boolean
 * }
 */
router.post(
  '/:id/vote',
  authenticate,
  validate(voteReviewSchema),
  reviewController.voteReview
);

/**
 * Remove vote from a review
 * DELETE /api/v1/reviews/:id/vote
 */
router.delete(
  '/:id/vote',
  authenticate,
  validate(removeVoteSchema),
  reviewController.removeVote
);

// ============================================
// Review Reporting Routes
// ============================================

/**
 * Report a review
 * POST /api/v1/reviews/:id/report
 * Body: {
 *   reason: 'SPAM' | 'OFFENSIVE_LANGUAGE' | 'FAKE_REVIEW' | 'IRRELEVANT' | 'PERSONAL_INFORMATION' | 'OTHER',
 *   description?: string
 * }
 */
router.post(
  '/:id/report',
  authenticate,
  validate(reportReviewSchema),
  reviewController.reportReview
);

/**
 * Get reports for a review (Admin/Moderation)
 * GET /api/v1/reviews/:id/reports
 */
router.get(
  '/:id/reports',
  authenticate,
  validate(getReviewReportsSchema),
  reviewController.getReviewReports
);

// ============================================
// Statistics Routes
// ============================================

/**
 * Get review statistics for a user
 * GET /api/v1/reviews/users/:userId/stats
 */
router.get(
  '/users/:userId/stats',
  validate(getUserReviewStatsSchema),
  reviewController.getUserReviewStats
);

/**
 * Check if user can review a transaction
 * GET /api/v1/reviews/transactions/:transactionId/can-review
 */
router.get(
  '/transactions/:transactionId/can-review',
  authenticate,
  validate(canReviewTransactionSchema),
  reviewController.canReviewTransaction
);

export default router;
