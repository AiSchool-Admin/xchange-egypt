/**
 * Admin Routes
 * Administrative endpoints for maintenance and operations
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as adminController from '../controllers/admin.controller';

const router = Router();

/**
 * Populate governorate field for items based on seller's governorate
 * POST /api/v1/admin/populate-governorates
 *
 * This endpoint:
 * 1. Converts English governorate names to Arabic for users
 * 2. Converts English governorate names to Arabic for items
 * 3. Populates items without governorate from seller's profile
 *
 * Note: No auth required for one-time data migration
 */
router.post(
  '/populate-governorates',
  adminController.populateGovernorates
);

/**
 * Run retroactive matching for all existing items
 * POST /api/v1/admin/retroactive-matching
 *
 * This endpoint processes all existing items with barter preferences
 * and sends notifications for newly discovered matches.
 *
 * Use this once after deploying the desiredCategory fix.
 */
router.post(
  '/retroactive-matching',
  authenticate,
  adminController.runRetroactiveMatching
);

/**
 * Seed test bids for reverse auctions
 * POST /api/v1/admin/seed-reverse-auction-bids
 *
 * Creates 3 test bids from different sellers for the active reverse auction.
 * Useful for testing the award functionality.
 *
 * Note: No auth required for testing convenience
 */
router.post(
  '/seed-reverse-auction-bids',
  adminController.seedReverseAuctionBids
);

export default router;
