import { Router } from 'express';
import * as badgeController from '../controllers/badge.controller';
import { authenticate, isAdmin } from '../middleware/auth';

const router = Router();

// ============================================
// Badge Routes - مسارات شارات التحقق
// ============================================

/**
 * Get all available badges info
 * GET /api/v1/badges
 */
router.get(
  '/',
  badgeController.getAllBadgesInfo
);

/**
 * Get badge requirements
 * GET /api/v1/badges/requirements/:badgeType
 */
router.get(
  '/requirements/:badgeType',
  badgeController.getBadgeRequirements
);

/**
 * Get my badges
 * GET /api/v1/badges/my
 */
router.get(
  '/my',
  authenticate,
  badgeController.getMyBadges
);

/**
 * Get user's badges
 * GET /api/v1/badges/user/:userId
 */
router.get(
  '/user/:userId',
  badgeController.getUserBadges
);

/**
 * Check and award automatic badges
 * POST /api/v1/badges/check
 */
router.post(
  '/check',
  authenticate,
  badgeController.checkMyBadges
);

/**
 * Submit verification request
 * POST /api/v1/badges/verify
 * Body: { badgeType, documents?: string[] }
 */
router.post(
  '/verify',
  authenticate,
  badgeController.submitVerificationRequest
);

/**
 * Award badge to user (Admin only)
 * POST /api/v1/badges/award
 * Body: { userId, badgeType, notes? }
 */
router.post(
  '/award',
  authenticate,
  isAdmin,
  badgeController.awardBadge
);

/**
 * Revoke badge from user (Admin only)
 * DELETE /api/v1/badges/revoke
 * Body: { userId, badgeType }
 */
router.delete(
  '/revoke',
  authenticate,
  isAdmin,
  badgeController.revokeBadge
);

export default router;
