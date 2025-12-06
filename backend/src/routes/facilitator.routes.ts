import { Router } from 'express';
import * as facilitatorController from '../controllers/facilitator.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// ============================================
// Public Routes
// ============================================

/**
 * @route   GET /api/v1/facilitators
 * @desc    Get available facilitators
 * @access  Public
 */
router.get('/', facilitatorController.getAvailableFacilitators);

/**
 * @route   GET /api/v1/facilitators/top
 * @desc    Get top facilitators
 * @access  Public
 */
router.get('/top', facilitatorController.getTopFacilitators);

/**
 * @route   GET /api/v1/facilitators/:id
 * @desc    Get facilitator profile
 * @access  Public
 */
router.get('/:id', facilitatorController.getFacilitatorProfile);

// ============================================
// Protected Routes
// ============================================

/**
 * @route   GET /api/v1/facilitators/user/me
 * @desc    Get my facilitator profile
 * @access  Private
 */
router.get('/user/me', authenticate, facilitatorController.getMyFacilitatorProfile);

/**
 * @route   GET /api/v1/facilitators/user/my-assignments
 * @desc    Get my assignments
 * @access  Private
 */
router.get('/user/my-assignments', authenticate, facilitatorController.getMyAssignments);

/**
 * @route   POST /api/v1/facilitators/apply
 * @desc    Apply to become facilitator
 * @access  Private
 */
router.post('/apply', authenticate, facilitatorController.applyForFacilitator);

/**
 * @route   PATCH /api/v1/facilitators/:id
 * @desc    Update facilitator profile
 * @access  Private
 */
router.patch('/:id', authenticate, facilitatorController.updateFacilitatorProfile);

/**
 * @route   POST /api/v1/facilitators/:id/toggle-availability
 * @desc    Toggle availability
 * @access  Private
 */
router.post('/:id/toggle-availability', authenticate, facilitatorController.toggleAvailability);

/**
 * @route   POST /api/v1/facilitators/:id/assign
 * @desc    Assign facilitator to deal
 * @access  Private
 */
router.post('/:id/assign', authenticate, facilitatorController.assignFacilitator);

/**
 * @route   POST /api/v1/facilitators/assignments/:assignmentId/start
 * @desc    Start assignment
 * @access  Private
 */
router.post('/assignments/:assignmentId/start', authenticate, facilitatorController.startAssignment);

/**
 * @route   POST /api/v1/facilitators/assignments/:assignmentId/complete
 * @desc    Complete assignment
 * @access  Private
 */
router.post('/assignments/:assignmentId/complete', authenticate, facilitatorController.completeAssignment);

/**
 * @route   POST /api/v1/facilitators/assignments/:assignmentId/review
 * @desc    Submit review for facilitator
 * @access  Private
 */
router.post('/assignments/:assignmentId/review', authenticate, facilitatorController.submitReview);

export default router;
