import { Router } from 'express';
import * as auctionController from '../controllers/auction.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createAuctionSchema,
  updateAuctionSchema,
  placeBidSchema,
  buyNowSchema,
  getAuctionSchema,
  listAuctionsSchema,
  getAuctionBidsSchema,
  cancelAuctionSchema,
  endAuctionSchema,
} from '../validations/auction.validation';

const router = Router();

// ============================================
// Public Routes
// ============================================

/**
 * @route   GET /api/v1/auctions
 * @desc    List all auctions with filters
 * @access  Public
 */
router.get('/', validate(listAuctionsSchema), auctionController.listAuctions);

/**
 * @route   GET /api/v1/auctions/:id
 * @desc    Get auction details by ID
 * @access  Public
 */
router.get('/:id', validate(getAuctionSchema), auctionController.getAuction);

/**
 * @route   GET /api/v1/auctions/:id/bids
 * @desc    Get all bids for an auction
 * @access  Public
 */
router.get(
  '/:id/bids',
  validate(getAuctionBidsSchema),
  auctionController.getAuctionBids
);

// ============================================
// Protected Routes (Require Authentication)
// ============================================

/**
 * @route   POST /api/v1/auctions
 * @desc    Create a new auction
 * @access  Private
 */
router.post(
  '/',
  authenticate,
  validate(createAuctionSchema),
  auctionController.createAuction
);

/**
 * @route   PATCH /api/v1/auctions/:id
 * @desc    Update auction details
 * @access  Private (Seller only)
 */
router.patch(
  '/:id',
  authenticate,
  validate(updateAuctionSchema),
  auctionController.updateAuction
);

/**
 * @route   DELETE /api/v1/auctions/:id
 * @desc    Cancel auction
 * @access  Private (Seller only, before bids)
 */
router.delete(
  '/:id',
  authenticate,
  validate(cancelAuctionSchema),
  auctionController.cancelAuction
);

/**
 * @route   POST /api/v1/auctions/:id/bids
 * @desc    Place a bid on an auction
 * @access  Private
 */
router.post(
  '/:id/bids',
  authenticate,
  validate(placeBidSchema),
  auctionController.placeBid
);

/**
 * @route   POST /api/v1/auctions/:id/buy-now
 * @desc    Buy item instantly at buy now price
 * @access  Private
 */
router.post(
  '/:id/buy-now',
  authenticate,
  validate(buyNowSchema),
  auctionController.buyNow
);

/**
 * @route   POST /api/v1/auctions/:id/end
 * @desc    End auction manually (Admin or scheduled job)
 * @access  Private (Admin only - add admin middleware here)
 */
router.post(
  '/:id/end',
  authenticate,
  // TODO: Add admin middleware
  validate(endAuctionSchema),
  auctionController.endAuction
);

/**
 * @route   GET /api/v1/auctions/my-auctions
 * @desc    Get my auctions
 * @access  Private
 */
router.get('/my/auctions', authenticate, auctionController.getMyAuctions);

/**
 * @route   GET /api/v1/auctions/my-bids
 * @desc    Get my bids
 * @access  Private
 */
router.get('/my/bids', authenticate, auctionController.getMyBids);

export default router;
