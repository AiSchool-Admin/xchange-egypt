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
 * Get item by ID
 * GET /api/v1/items/:id
 */
router.get(
  '/:id',
  validate(getItemByIdSchema),
  itemController.getItemById
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
 * Create a new item with images
 * POST /api/v1/items
 */
router.post(
  '/',
  authenticate,
  uploadItemImages,
  validate(createItemSchema),
  itemController.createItem
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

export default router;
