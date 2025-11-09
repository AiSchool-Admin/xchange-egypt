/**
 * Reverse Auction Routes
 *
 * All routes for the reverse auction system where:
 * - Buyers create requests for items
 * - Sellers compete by bidding lower prices
 */

import { Router } from 'express';
import * as reverseAuctionController from '../controllers/reverse-auction.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  createReverseAuctionSchema,
  getReverseAuctionsSchema,
  getReverseAuctionByIdSchema,
  updateReverseAuctionSchema,
  cancelReverseAuctionSchema,
  deleteReverseAuctionSchema,
  submitBidSchema,
  getBidsSchema,
  updateBidSchema,
  withdrawBidSchema,
  getMyBidsSchema,
  awardAuctionSchema,
  completeAuctionSchema,
  getStatisticsSchema,
} from '../validations/reverse-auction.validation';

const router = Router();

// ============================================
// Public Routes (No authentication required)
// ============================================

/**
 * Get all active reverse auctions
 * GET /api/v1/reverse-auctions
 * Query params: status, categoryId, condition, minBudget, maxBudget, location, page, limit
 */
router.get(
  '/',
  validate(getReverseAuctionsSchema),
  reverseAuctionController.getReverseAuctions
);

/**
 * Get single reverse auction by ID with all bids
 * GET /api/v1/reverse-auctions/:id
 */
router.get(
  '/:id',
  validate(getReverseAuctionByIdSchema),
  reverseAuctionController.getReverseAuctionById
);

/**
 * Get all bids for a specific reverse auction
 * GET /api/v1/reverse-auctions/:id/bids
 */
router.get(
  '/:id/bids',
  validate(getBidsSchema),
  reverseAuctionController.getBidsForAuction
);

// ============================================
// Authenticated Routes (Buyer & Seller)
// ============================================

/**
 * Get statistics for current user
 * GET /api/v1/reverse-auctions/stats
 */
router.get(
  '/stats',
  authenticate,
  validate(getStatisticsSchema),
  reverseAuctionController.getStatistics
);

/**
 * Create a new reverse auction (Buyer)
 * POST /api/v1/reverse-auctions
 */
router.post(
  '/',
  authenticate,
  validate(createReverseAuctionSchema),
  reverseAuctionController.createReverseAuction
);

/**
 * Update reverse auction (Buyer only)
 * PATCH /api/v1/reverse-auctions/:id
 */
router.patch(
  '/:id',
  authenticate,
  validate(updateReverseAuctionSchema),
  reverseAuctionController.updateReverseAuction
);

/**
 * Cancel reverse auction (Buyer only)
 * POST /api/v1/reverse-auctions/:id/cancel
 */
router.post(
  '/:id/cancel',
  authenticate,
  validate(cancelReverseAuctionSchema),
  reverseAuctionController.cancelReverseAuction
);

/**
 * Delete reverse auction (Buyer only, draft only)
 * DELETE /api/v1/reverse-auctions/:id
 */
router.delete(
  '/:id',
  authenticate,
  validate(deleteReverseAuctionSchema),
  reverseAuctionController.deleteReverseAuction
);

/**
 * Award auction to winning bid (Buyer only)
 * POST /api/v1/reverse-auctions/:id/award
 * Body: { bidId: string }
 */
router.post(
  '/:id/award',
  authenticate,
  validate(awardAuctionSchema),
  reverseAuctionController.awardAuction
);

/**
 * Mark auction as completed (Buyer or Winner)
 * POST /api/v1/reverse-auctions/:id/complete
 */
router.post(
  '/:id/complete',
  authenticate,
  validate(completeAuctionSchema),
  reverseAuctionController.completeAuction
);

// ============================================
// Bidding Routes (Seller)
// ============================================

/**
 * Submit a bid on a reverse auction (Seller)
 * POST /api/v1/reverse-auctions/:id/bids
 */
router.post(
  '/:id/bids',
  authenticate,
  validate(submitBidSchema),
  reverseAuctionController.submitBid
);

/**
 * Get my bids (Seller view)
 * GET /api/v1/reverse-auctions/bids/my-bids
 * Query params: status, page, limit
 */
router.get(
  '/bids/my-bids',
  authenticate,
  validate(getMyBidsSchema),
  reverseAuctionController.getMyBids
);

/**
 * Update a bid (Seller only)
 * PATCH /api/v1/reverse-auctions/bids/:bidId
 */
router.patch(
  '/bids/:bidId',
  authenticate,
  validate(updateBidSchema),
  reverseAuctionController.updateBid
);

/**
 * Withdraw a bid (Seller only)
 * POST /api/v1/reverse-auctions/bids/:bidId/withdraw
 */
router.post(
  '/bids/:bidId/withdraw',
  authenticate,
  validate(withdrawBidSchema),
  reverseAuctionController.withdrawBid
);

export default router;
