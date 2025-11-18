import { Router } from 'express';
import * as listingController from '../controllers/listing.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  createSaleListingSchema,
  updateListingSchema,
  getListingByIdSchema,
  deleteListingSchema,
  getUserListingsSchema,
  searchListingsSchema,
  activateListingSchema,
  cancelListingSchema,
  markListingAsSoldSchema,
} from '../validations/listing.validation';

const router = Router();

// Public routes

/**
 * Search listings
 * GET /api/v1/listings/search
 */
router.get(
  '/search',
  validate(searchListingsSchema),
  listingController.searchListings
);

/**
 * Get user's listings
 * GET /api/v1/listings/user/:userId
 */
router.get(
  '/user/:userId',
  validate(getUserListingsSchema),
  listingController.getUserListings
);

/**
 * Get listing by ID
 * GET /api/v1/listings/:id
 */
router.get(
  '/:id',
  validate(getListingByIdSchema),
  listingController.getListingById
);

// Protected routes (require authentication)

/**
 * Create a direct sale listing
 * POST /api/v1/listings/sale
 */
router.post(
  '/sale',
  authenticate,
  validate(createSaleListingSchema),
  listingController.createSaleListing
);

/**
 * Update a listing
 * PUT /api/v1/listings/:id
 */
router.put(
  '/:id',
  authenticate,
  validate(getListingByIdSchema),
  validate(updateListingSchema),
  listingController.updateListing
);

/**
 * Delete a listing
 * DELETE /api/v1/listings/:id
 */
router.delete(
  '/:id',
  authenticate,
  validate(deleteListingSchema),
  listingController.deleteListing
);

/**
 * Activate a listing
 * POST /api/v1/listings/:id/activate
 */
router.post(
  '/:id/activate',
  authenticate,
  validate(activateListingSchema),
  listingController.activateListing
);

/**
 * Cancel a listing
 * POST /api/v1/listings/:id/cancel
 */
router.post(
  '/:id/cancel',
  authenticate,
  validate(cancelListingSchema),
  listingController.cancelListing
);

/**
 * Mark listing as completed
 * POST /api/v1/listings/:id/completed
 */
router.post(
  '/:id/completed',
  authenticate,
  validate(markListingAsSoldSchema),
  listingController.markListingAsCompleted
);

export default router;
