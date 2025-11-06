import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import { validate } from '../middleware/validate';
import { authenticate } from '../middleware/auth';
import {
  registerIndividualSchema,
  registerBusinessSchema,
  loginSchema,
  refreshTokenSchema,
} from '../validations/auth.validation';

const router = Router();

/**
 * @route   POST /api/v1/auth/register/individual
 * @desc    Register a new individual user
 * @access  Public
 */
router.post(
  '/register/individual',
  validate(registerIndividualSchema),
  authController.registerIndividual
);

/**
 * @route   POST /api/v1/auth/register/business
 * @desc    Register a new business user
 * @access  Public
 */
router.post(
  '/register/business',
  validate(registerBusinessSchema),
  authController.registerBusiness
);

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token using refresh token
 * @access  Public
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user (invalidate refresh token)
 * @access  Public
 */
router.post('/logout', validate(refreshTokenSchema), authController.logout);

/**
 * @route   POST /api/v1/auth/logout-all
 * @desc    Logout from all devices
 * @access  Private
 */
router.post('/logout-all', authenticate, authController.logoutAll);

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user profile
 * @access  Private
 */
router.get('/me', authenticate, authController.getMe);

export default router;
