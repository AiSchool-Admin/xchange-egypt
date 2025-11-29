/**
 * Admin Routes
 * Administrative endpoints for maintenance and operations
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import * as adminController from '../controllers/admin.controller';

const router = Router();

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
