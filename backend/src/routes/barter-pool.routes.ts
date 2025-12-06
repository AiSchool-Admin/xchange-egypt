import { Router } from 'express';
import * as barterPoolController from '../controllers/barter-pool.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// ============================================
// Public Routes
// ============================================

/**
 * @route   GET /api/v1/barter-pools
 * @desc    Get open pools
 * @access  Public
 */
router.get('/', barterPoolController.getOpenPools);

/**
 * @route   GET /api/v1/barter-pools/:id
 * @desc    Get pool by ID
 * @access  Public
 */
router.get('/:id', barterPoolController.getPool);

// ============================================
// Protected Routes
// ============================================

/**
 * @route   GET /api/v1/barter-pools/user/my-pools
 * @desc    Get user's pools
 * @access  Private
 */
router.get('/user/my-pools', authenticate, barterPoolController.getMyPools);

/**
 * @route   POST /api/v1/barter-pools
 * @desc    Create new pool
 * @access  Private
 */
router.post('/', authenticate, barterPoolController.createPool);

/**
 * @route   POST /api/v1/barter-pools/:id/join
 * @desc    Join a pool
 * @access  Private
 */
router.post('/:id/join', authenticate, barterPoolController.joinPool);

/**
 * @route   POST /api/v1/barter-pools/:id/leave
 * @desc    Leave a pool
 * @access  Private
 */
router.post('/:id/leave', authenticate, barterPoolController.leavePool);

/**
 * @route   POST /api/v1/barter-pools/:id/approve/:participantUserId
 * @desc    Approve participant (creator only)
 * @access  Private
 */
router.post('/:id/approve/:participantUserId', authenticate, barterPoolController.approveParticipant);

/**
 * @route   POST /api/v1/barter-pools/:id/start-matching
 * @desc    Start matching process
 * @access  Private
 */
router.post('/:id/start-matching', authenticate, barterPoolController.startMatching);

/**
 * @route   POST /api/v1/barter-pools/:id/accept-match
 * @desc    Accept a match
 * @access  Private
 */
router.post('/:id/accept-match', authenticate, barterPoolController.acceptMatch);

/**
 * @route   DELETE /api/v1/barter-pools/:id
 * @desc    Cancel pool
 * @access  Private
 */
router.delete('/:id', authenticate, barterPoolController.cancelPool);

export default router;
