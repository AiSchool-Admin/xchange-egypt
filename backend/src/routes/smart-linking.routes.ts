// ============================================
// Smart Linking Routes
// ============================================

import { Router } from 'express';
import { z } from 'zod';
import { validateRequest } from '../middlewares/validateRequest';
import { authenticate, optionalAuth } from '../middlewares/auth';
import * as smartLinkingController from '../controllers/smart-linking.controller';

const router = Router();

// ============================================
// Validation Schemas
// ============================================

const interactionSchema = z.object({
  body: z.object({
    serviceId: z.string().uuid(),
    interactionType: z.enum(['VIEW', 'CLICK', 'BOOK', 'FAVORITE']),
    source: z.enum(['RECOMMENDATION', 'SEARCH', 'MARKETPLACE_LINK', 'DIRECT']),
    sourceId: z.string().optional(),
  }),
});

// ============================================
// Routes
// ============================================

/**
 * @route GET /api/v1/smart-linking/recommendations
 * @desc Get personalized service recommendations based on purchase history
 * @access Private
 */
router.get(
  '/recommendations',
  authenticate,
  smartLinkingController.getSmartRecommendations
);

/**
 * @route GET /api/v1/smart-linking/product/:productId
 * @desc Get service recommendations for a specific product
 * @access Public
 */
router.get(
  '/product/:productId',
  optionalAuth,
  smartLinkingController.getRecommendationsForProduct
);

/**
 * @route GET /api/v1/smart-linking/marketplace/:marketplace
 * @desc Get services linked to a specific marketplace
 * @access Public
 */
router.get(
  '/marketplace/:marketplace',
  optionalAuth,
  smartLinkingController.getServicesByMarketplace
);

/**
 * @route GET /api/v1/smart-linking/cross-sell/:serviceId
 * @desc Get cross-sell service suggestions
 * @access Public
 */
router.get(
  '/cross-sell/:serviceId',
  optionalAuth,
  smartLinkingController.getCrossSellSuggestions
);

/**
 * @route POST /api/v1/smart-linking/interaction
 * @desc Log user interaction for ML improvement
 * @access Private
 */
router.post(
  '/interaction',
  authenticate,
  validateRequest(interactionSchema),
  smartLinkingController.logInteraction
);

export default router;
