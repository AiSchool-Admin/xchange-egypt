import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import { uploadAvatar, handleMulterError } from '../config/upload';
import {
  updateIndividualProfileSchema,
  updateBusinessProfileSchema,
  changePasswordSchema,
  getUserByIdSchema,
} from '../validations/user.validation';

const router = Router();

/**
 * @route   GET /api/v1/users/:id
 * @desc    Get user by ID (public profile)
 * @access  Public
 */
router.get('/:id', validate(getUserByIdSchema), userController.getUserById);

/**
 * @route   GET /api/v1/users/:id/stats
 * @desc    Get user statistics
 * @access  Public
 */
router.get('/:id/stats', validate(getUserByIdSchema), userController.getUserStats);

/**
 * @route   PUT /api/v1/users/profile/individual
 * @desc    Update individual user profile
 * @access  Private (Individual only)
 */
router.put(
  '/profile/individual',
  authenticate,
  validate(updateIndividualProfileSchema),
  userController.updateIndividualProfile
);

/**
 * @route   PUT /api/v1/users/profile/business
 * @desc    Update business user profile
 * @access  Private (Business only)
 */
router.put(
  '/profile/business',
  authenticate,
  validate(updateBusinessProfileSchema),
  userController.updateBusinessProfile
);

/**
 * @route   POST /api/v1/users/avatar
 * @desc    Upload avatar
 * @access  Private
 */
router.post(
  '/avatar',
  authenticate,
  uploadAvatar,
  handleMulterError,
  userController.uploadAvatar
);

/**
 * @route   DELETE /api/v1/users/avatar
 * @desc    Delete avatar
 * @access  Private
 */
router.delete('/avatar', authenticate, userController.deleteAvatar);

/**
 * @route   PUT /api/v1/users/password
 * @desc    Change password
 * @access  Private
 */
router.put(
  '/password',
  authenticate,
  validate(changePasswordSchema),
  userController.changePassword
);

/**
 * @route   DELETE /api/v1/users/account
 * @desc    Delete account
 * @access  Private
 */
router.delete('/account', authenticate, userController.deleteAccount);

export default router;
