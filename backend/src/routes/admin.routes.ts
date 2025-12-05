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

export default router;
