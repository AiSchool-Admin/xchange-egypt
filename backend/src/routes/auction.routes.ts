import { Router } from 'express';
import * as auctionController from '../controllers/auction.controller';
import * as auctionAdvancedController from '../controllers/auction-advanced.controller';
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
  addToWatchlistSchema,
  removeFromWatchlistSchema,
  payDepositSchema,
  submitSealedBidSchema,
  createDisputeSchema,
  respondToDisputeSchema,
  createReviewSchema,
  respondToReviewSchema,
  setProxyBidSchema,
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

// ============================================
// Protected Routes - MUST be BEFORE /:id route
// ============================================

/**
 * @route   GET /api/v1/auctions/my
 * @desc    Get my auctions
 * @access  Private
 */
router.get('/my', authenticate, auctionController.getMyAuctions);

/**
 * @route   GET /api/v1/auctions/my-bids
 * @desc    Get my bids
 * @access  Private
 */
router.get('/my-bids', authenticate, auctionController.getMyBids);

// ============================================
// Public Routes (continued)
// ============================================

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
 * @desc    Cancel/delete auction
 * @access  Private (Seller only, before bids)
 */
router.delete(
  '/:id',
  authenticate,
  validate(cancelAuctionSchema),
  auctionController.cancelAuction
);

/**
 * @route   PATCH /api/v1/auctions/:id/cancel
 * @desc    Cancel auction (alternative endpoint for frontend compatibility)
 * @access  Private (Seller only, before bids)
 */
router.patch(
  '/:id/cancel',
  authenticate,
  validate(cancelAuctionSchema),
  auctionController.cancelAuction
);

/**
 * @route   POST /api/v1/auctions/:id/bid
 * @desc    Place a bid on an auction
 * @access  Private
 */
router.post(
  '/:id/bid',
  authenticate,
  validate(placeBidSchema),
  auctionController.placeBid
);

/**
 * @route   POST /api/v1/auctions/:id/bids (legacy support)
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

// ============================================
// سوق المزادات المتقدم - Advanced Auction Marketplace
// ============================================

// قائمة المراقبة - Watchlist
/**
 * @route   GET /api/v1/auctions/watchlist
 * @desc    Get user's watchlist
 * @access  Private
 */
router.get('/watchlist', authenticate, auctionAdvancedController.getWatchlist);

/**
 * @route   POST /api/v1/auctions/:id/watchlist
 * @desc    Add auction to watchlist
 * @access  Private
 */
router.post(
  '/:id/watchlist',
  authenticate,
  validate(addToWatchlistSchema),
  auctionAdvancedController.addToWatchlist
);

/**
 * @route   DELETE /api/v1/auctions/:id/watchlist
 * @desc    Remove auction from watchlist
 * @access  Private
 */
router.delete(
  '/:id/watchlist',
  authenticate,
  validate(removeFromWatchlistSchema),
  auctionAdvancedController.removeFromWatchlist
);

/**
 * @route   GET /api/v1/auctions/:id/watchlist/check
 * @desc    Check if auction is in watchlist
 * @access  Private
 */
router.get('/:id/watchlist/check', authenticate, auctionAdvancedController.checkWatchlist);

// الإيداعات - Deposits
/**
 * @route   GET /api/v1/auctions/deposits
 * @desc    Get user's deposits
 * @access  Private
 */
router.get('/deposits', authenticate, auctionAdvancedController.getUserDeposits);

/**
 * @route   POST /api/v1/auctions/:id/deposit
 * @desc    Pay deposit for an auction
 * @access  Private
 */
router.post(
  '/:id/deposit',
  authenticate,
  validate(payDepositSchema),
  auctionAdvancedController.payDeposit
);

/**
 * @route   GET /api/v1/auctions/:id/deposit/check
 * @desc    Check if user has valid deposit
 * @access  Private
 */
router.get('/:id/deposit/check', authenticate, auctionAdvancedController.checkDeposit);

// المزايدات المختومة - Sealed Bids
/**
 * @route   POST /api/v1/auctions/:id/sealed-bid
 * @desc    Submit a sealed bid
 * @access  Private
 */
router.post(
  '/:id/sealed-bid',
  authenticate,
  validate(submitSealedBidSchema),
  auctionAdvancedController.submitSealedBid
);

/**
 * @route   GET /api/v1/auctions/my-sealed-bids
 * @desc    Get user's sealed bids
 * @access  Private
 */
router.get('/my-sealed-bids', authenticate, auctionAdvancedController.getMySealedBids);

/**
 * @route   GET /api/v1/auctions/:id/sealed-bid/check
 * @desc    Check if user has submitted sealed bid
 * @access  Private
 */
router.get('/:id/sealed-bid/check', authenticate, auctionAdvancedController.checkSealedBid);

// المزايدة بالوكالة - Proxy Bidding
/**
 * @route   POST /api/v1/auctions/:id/proxy-bid
 * @desc    Set proxy (auto) bid
 * @access  Private
 */
router.post(
  '/:id/proxy-bid',
  authenticate,
  validate(setProxyBidSchema),
  auctionAdvancedController.setProxyBid
);

// النزاعات - Disputes
/**
 * @route   GET /api/v1/auctions/disputes
 * @desc    Get user's disputes
 * @access  Private
 */
router.get('/disputes', authenticate, auctionAdvancedController.getUserDisputes);

/**
 * @route   POST /api/v1/auctions/:id/dispute
 * @desc    Create a dispute for an auction
 * @access  Private
 */
router.post(
  '/:id/dispute',
  authenticate,
  validate(createDisputeSchema),
  auctionAdvancedController.createDispute
);

/**
 * @route   GET /api/v1/auctions/disputes/:disputeId
 * @desc    Get dispute details
 * @access  Private
 */
router.get('/disputes/:disputeId', authenticate, auctionAdvancedController.getDisputeDetails);

/**
 * @route   POST /api/v1/auctions/disputes/:disputeId/respond
 * @desc    Respond to a dispute
 * @access  Private
 */
router.post(
  '/disputes/:disputeId/respond',
  authenticate,
  validate(respondToDisputeSchema),
  auctionAdvancedController.respondToDispute
);

// التقييمات - Reviews
/**
 * @route   POST /api/v1/auctions/:id/review
 * @desc    Create a review for an auction
 * @access  Private
 */
router.post(
  '/:id/review',
  authenticate,
  validate(createReviewSchema),
  auctionAdvancedController.createReview
);

/**
 * @route   GET /api/v1/auctions/:id/reviews
 * @desc    Get reviews for an auction
 * @access  Public
 */
router.get('/:id/reviews', auctionAdvancedController.getAuctionReviews);

/**
 * @route   POST /api/v1/auctions/reviews/:reviewId/respond
 * @desc    Respond to a review
 * @access  Private
 */
router.post(
  '/reviews/:reviewId/respond',
  authenticate,
  validate(respondToReviewSchema),
  auctionAdvancedController.respondToReview
);

/**
 * @route   GET /api/v1/auctions/:id/can-review
 * @desc    Check if user can review
 * @access  Private
 */
router.get('/:id/can-review', authenticate, auctionAdvancedController.canReview);

/**
 * @route   GET /api/v1/auctions/my-reviews
 * @desc    Get user's reviews
 * @access  Private
 */
router.get('/my-reviews', authenticate, auctionAdvancedController.getMyReviews);

export default router;
