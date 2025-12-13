import { Router } from 'express';
import * as comparisonController from '../controllers/comparison.controller';
import { authenticate, optionalAuth } from '../middleware/auth';

const router = Router();

// ============================================
// Item Comparison Routes - مسارات مقارنة المنتجات
// ============================================

/**
 * Get comparison by share code (public)
 * GET /api/v1/comparisons/share/:shareCode
 */
router.get(
  '/share/:shareCode',
  comparisonController.getComparisonByShareCode
);

/**
 * Get user's comparisons
 * GET /api/v1/comparisons/my
 */
router.get(
  '/my',
  authenticate,
  comparisonController.getUserComparisons
);

/**
 * Get comparison by ID
 * GET /api/v1/comparisons/:id
 */
router.get(
  '/:id',
  optionalAuth,
  comparisonController.getComparison
);

/**
 * Create a new comparison
 * POST /api/v1/comparisons
 * Body: { itemIds: string[], title?: string, categorySlug?: string, isPublic?: boolean }
 */
router.post(
  '/',
  authenticate,
  comparisonController.createComparison
);

/**
 * Update comparison
 * PUT /api/v1/comparisons/:id
 * Body: { title?: string, itemIds?: string[], isPublic?: boolean }
 */
router.put(
  '/:id',
  authenticate,
  comparisonController.updateComparison
);

/**
 * Delete comparison
 * DELETE /api/v1/comparisons/:id
 */
router.delete(
  '/:id',
  authenticate,
  comparisonController.deleteComparison
);

export default router;
