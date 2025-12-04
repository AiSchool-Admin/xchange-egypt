import { Router } from 'express';
import * as escrowController from '../controllers/escrow.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// ============================================
// Protected Routes - User must be authenticated
// ============================================

/**
 * @route   GET /api/v1/escrow/my-escrows
 * @desc    Get user's escrows
 * @access  Private
 */
router.get('/my-escrows', authenticate, escrowController.getMyEscrows);

/**
 * @route   GET /api/v1/escrow/:id
 * @desc    Get escrow by ID
 * @access  Private
 */
router.get('/:id', authenticate, escrowController.getEscrow);

/**
 * @route   POST /api/v1/escrow
 * @desc    Create new escrow
 * @access  Private
 */
router.post('/', authenticate, escrowController.createEscrow);

/**
 * @route   POST /api/v1/escrow/:id/fund
 * @desc    Fund escrow (buyer deposits)
 * @access  Private
 */
router.post('/:id/fund', authenticate, escrowController.fundEscrow);

/**
 * @route   POST /api/v1/escrow/:id/deliver
 * @desc    Mark item as delivered (seller)
 * @access  Private
 */
router.post('/:id/deliver', authenticate, escrowController.markDelivered);

/**
 * @route   POST /api/v1/escrow/:id/confirm
 * @desc    Confirm receipt and release funds (buyer)
 * @access  Private
 */
router.post('/:id/confirm', authenticate, escrowController.confirmReceipt);

/**
 * @route   POST /api/v1/escrow/:id/cancel
 * @desc    Cancel escrow
 * @access  Private
 */
router.post('/:id/cancel', authenticate, escrowController.cancelEscrow);

/**
 * @route   POST /api/v1/escrow/:id/dispute
 * @desc    Open dispute on escrow
 * @access  Private
 */
router.post('/:id/dispute', authenticate, escrowController.openDispute);

/**
 * @route   GET /api/v1/escrow/disputes/:disputeId
 * @desc    Get dispute details
 * @access  Private
 */
router.get('/disputes/:disputeId', authenticate, escrowController.getDispute);

/**
 * @route   POST /api/v1/escrow/disputes/:disputeId/respond
 * @desc    Respond to dispute
 * @access  Private
 */
router.post('/disputes/:disputeId/respond', authenticate, escrowController.respondToDispute);

export default router;
