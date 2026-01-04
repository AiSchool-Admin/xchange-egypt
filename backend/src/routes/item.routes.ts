import { Router } from 'express';
import * as itemController from '../controllers/item.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { uploadItemImages } from '../config/upload';
import {
  createItemSchema,
  updateItemSchema,
  getItemByIdSchema,
  deleteItemSchema,
  searchItemsSchema,
  getUserItemsSchema,
  getCategoryItemsSchema,
  updateItemImagesSchema,
} from '../validations/item.validation';

const router = Router();

// Public routes

/**
 * Search items with filters
 * GET /api/v1/items/search
 */
router.get(
  '/search',
  validate(searchItemsSchema),
  itemController.searchItems
);

/**
 * Get user's items
 * GET /api/v1/items/user/:userId
 */
router.get(
  '/user/:userId',
  validate(getUserItemsSchema),
  itemController.getUserItems
);

/**
 * Get category items
 * GET /api/v1/items/category/:categoryId
 */
router.get(
  '/category/:categoryId',
  validate(getCategoryItemsSchema),
  itemController.getCategoryItems
);

/**
 * Get featured items
 * GET /api/v1/items/featured
 * Query params: limit, categoryId, governorate, minTier
 */
router.get(
  '/featured',
  itemController.getFeaturedItems
);

/**
 * Get luxury items (high-value items)
 * GET /api/v1/items/luxury
 * Query params: limit, minPrice, categoryId, governorate, sortBy
 */
router.get(
  '/luxury',
  itemController.getLuxuryItems
);

// Protected routes (require authentication)

/**
 * Get authenticated user's items
 * GET /api/v1/items/my
 */
router.get(
  '/my',
  authenticate,
  itemController.getMyItems
);

/**
 * Create a new item with JSON body (no file upload, uses imageUrls)
 * POST /api/v1/items/create
 * This endpoint is for when images are already uploaded or provided as URLs
 */
router.post(
  '/create',
  authenticate,
  validate(createItemSchema),
  itemController.createItemJson
);

/**
 * Create a new item with images (multipart/form-data)
 * OR with JSON body (application/json) - auto-detects content type
 * POST /api/v1/items
 */
router.post(
  '/',
  authenticate,
  (req, res, next) => {
    // Check if request is JSON - skip multer and use JSON handler
    const contentType = req.headers['content-type'] || '';
    if (contentType.includes('application/json')) {
      // Validate and use JSON handler
      return validate(createItemSchema)(req, res, () => {
        itemController.createItemJson(req, res, next);
      });
    }
    // Otherwise use multer for file uploads
    uploadItemImages(req, res, (err) => {
      if (err) return next(err);
      validate(createItemSchema)(req, res, next);
    });
  },
  itemController.createItem
);

/**
 * Get item by ID - MUST BE AFTER specific routes like /my, /create
 * GET /api/v1/items/:id
 */
router.get(
  '/:id',
  validate(getItemByIdSchema),
  itemController.getItemById
);

/**
 * Update an item
 * PUT /api/v1/items/:id
 */
router.put(
  '/:id',
  authenticate,
  validate(getItemByIdSchema),
  validate(updateItemSchema),
  itemController.updateItem
);

/**
 * Delete an item
 * DELETE /api/v1/items/:id
 */
router.delete(
  '/:id',
  authenticate,
  validate(deleteItemSchema),
  itemController.deleteItem
);

/**
 * Add images to an item
 * POST /api/v1/items/:id/images
 */
router.post(
  '/:id/images',
  authenticate,
  uploadItemImages,
  validate(getItemByIdSchema),
  itemController.addItemImages
);

/**
 * Remove images from an item
 * DELETE /api/v1/items/:id/images
 */
router.delete(
  '/:id/images',
  authenticate,
  validate(updateItemImagesSchema),
  itemController.removeItemImages
);

/**
 * Promote an item
 * POST /api/v1/items/:id/promote
 * Body: { tier: 'FEATURED' | 'PREMIUM' | 'GOLD' | 'PLATINUM', durationDays?: number }
 */
router.post(
  '/:id/promote',
  authenticate,
  itemController.promoteItem
);

/**
 * Remove promotion from an item
 * DELETE /api/v1/items/:id/promote
 */
router.delete(
  '/:id/promote',
  authenticate,
  itemController.removePromotion
);

export default router;
