import { Router } from 'express';
import * as flashDealsController from '../controllers/flash-deals.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// ============================================
// Public Routes
// ============================================

/**
 * @route   GET /api/v1/flash-deals/active
 * @desc    Get all active flash deals
 * @access  Public
 */
router.get('/active', flashDealsController.getActiveDeals);

/**
 * @route   GET /api/v1/flash-deals/upcoming
 * @desc    Get upcoming flash deals
 * @access  Public
 */
router.get('/upcoming', flashDealsController.getUpcomingDeals);

// ============================================
// Protected Routes (must come before /:id)
// ============================================

/**
 * @route   GET /api/v1/flash-deals/my-claims
 * @desc    Get user's claimed deals
 * @access  Private
 */
router.get('/my-claims', authenticate, flashDealsController.getMyClaims);

/**
 * @route   GET /api/v1/flash-deals/my-deals
 * @desc    Get seller's flash deals
 * @access  Private
 */
router.get('/my-deals', authenticate, flashDealsController.getMyDeals);

/**
 * @route   GET /api/v1/flash-deals/:id
 * @desc    Get flash deal details by ID
 * @access  Public
 */
router.get('/:id', flashDealsController.getDeal);

/**
 * @route   POST /api/v1/flash-deals
 * @desc    Create a new flash deal
 * @access  Private (Seller)
 */
router.post('/', authenticate, flashDealsController.createDeal);

/**
 * @route   POST /api/v1/flash-deals/:id/claim
 * @desc    Claim a flash deal
 * @access  Private
 */
router.post('/:id/claim', authenticate, flashDealsController.claimDeal);

/**
 * @route   POST /api/v1/flash-deals/claims/:claimId/complete
 * @desc    Complete a claim after payment
 * @access  Private
 */
router.post('/claims/:claimId/complete', authenticate, flashDealsController.completeClaim);

/**
 * @route   DELETE /api/v1/flash-deals/:id
 * @desc    Cancel a flash deal
 * @access  Private (Seller only)
 */
router.delete('/:id', authenticate, flashDealsController.cancelDeal);

export default router;
