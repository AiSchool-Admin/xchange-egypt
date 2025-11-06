import { Router } from 'express';
import * as barterController from '../controllers/barter.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createBarterOfferSchema,
  createCounterOfferSchema,
  acceptBarterOfferSchema,
  rejectBarterOfferSchema,
  cancelBarterOfferSchema,
  getBarterOfferByIdSchema,
  getMyBarterOffersSchema,
  searchBarterableItemsSchema,
  findBarterMatchesSchema,
  completeBarterExchangeSchema,
} from '../validations/barter.validation';

const router = Router();

// Public routes

/**
 * Search barterable items
 * GET /api/v1/barter/items
 */
router.get(
  '/items',
  validate(searchBarterableItemsSchema),
  barterController.searchBarterableItems
);

// Protected routes (require authentication)

/**
 * Get my barter offers
 * GET /api/v1/barter/offers/my
 */
router.get(
  '/offers/my',
  authenticate,
  validate(getMyBarterOffersSchema),
  barterController.getMyBarterOffers
);

/**
 * Create a barter offer
 * POST /api/v1/barter/offers
 */
router.post(
  '/offers',
  authenticate,
  validate(createBarterOfferSchema),
  barterController.createBarterOffer
);

/**
 * Get barter offer by ID
 * GET /api/v1/barter/offers/:offerId
 */
router.get(
  '/offers/:offerId',
  authenticate,
  validate(getBarterOfferByIdSchema),
  barterController.getBarterOfferById
);

/**
 * Accept a barter offer
 * POST /api/v1/barter/offers/:offerId/accept
 */
router.post(
  '/offers/:offerId/accept',
  authenticate,
  validate(acceptBarterOfferSchema),
  barterController.acceptBarterOffer
);

/**
 * Reject a barter offer
 * POST /api/v1/barter/offers/:offerId/reject
 */
router.post(
  '/offers/:offerId/reject',
  authenticate,
  validate(rejectBarterOfferSchema),
  barterController.rejectBarterOffer
);

/**
 * Create a counter offer
 * POST /api/v1/barter/offers/:offerId/counter
 */
router.post(
  '/offers/:offerId/counter',
  authenticate,
  validate(createCounterOfferSchema),
  barterController.createCounterOffer
);

/**
 * Cancel a barter offer
 * POST /api/v1/barter/offers/:offerId/cancel
 */
router.post(
  '/offers/:offerId/cancel',
  authenticate,
  validate(cancelBarterOfferSchema),
  barterController.cancelBarterOffer
);

/**
 * Complete barter exchange
 * POST /api/v1/barter/offers/:offerId/complete
 */
router.post(
  '/offers/:offerId/complete',
  authenticate,
  validate(completeBarterExchangeSchema),
  barterController.completeBarterExchange
);

/**
 * Find barter matches for an item
 * GET /api/v1/barter/matches/:itemId
 */
router.get(
  '/matches/:itemId',
  authenticate,
  validate(findBarterMatchesSchema),
  barterController.findBarterMatches
);

export default router;
