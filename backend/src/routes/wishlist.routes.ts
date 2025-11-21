import { Router } from 'express';
import * as wishlistController from '../controllers/wishlist.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// All routes require authentication

/**
 * Get user's wish list
 * GET /api/v1/wishlist
 */
router.get(
  '/',
  authenticate,
  wishlistController.getWishList
);

/**
 * Add item to wish list
 * POST /api/v1/wishlist
 */
router.post(
  '/',
  authenticate,
  wishlistController.addToWishList
);

/**
 * Find matches for wish list
 * GET /api/v1/wishlist/matches
 */
router.get(
  '/matches',
  authenticate,
  wishlistController.findWishListMatches
);

/**
 * Check for new matches and send notifications
 * POST /api/v1/wishlist/check-matches
 */
router.post(
  '/check-matches',
  authenticate,
  wishlistController.checkMatches
);

/**
 * Get user's notifications
 * GET /api/v1/wishlist/notifications
 */
router.get(
  '/notifications',
  authenticate,
  wishlistController.getNotifications
);

/**
 * Mark notification as read
 * POST /api/v1/wishlist/notifications/:id/read
 */
router.post(
  '/notifications/:id/read',
  authenticate,
  wishlistController.markNotificationRead
);

/**
 * Remove item from wish list
 * DELETE /api/v1/wishlist/:id
 */
router.delete(
  '/:id',
  authenticate,
  wishlistController.removeFromWishList
);

export default router;
