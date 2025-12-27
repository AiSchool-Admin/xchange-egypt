import { Router } from 'express';
import * as categoryController from '../controllers/category.controller';
import { validate } from '../middleware/validate';
import { authenticate, isAdmin } from '../middleware/auth';
import {
  createCategorySchema,
  updateCategorySchema,
  getCategoryByIdSchema,
  getCategoryBySlugSchema,
} from '../validations/category.validation';

const router = Router();

// ============================================
// Public Routes (No Authentication Required)
// ============================================

/**
 * @route   GET /api/v1/categories
 * @desc    Get all categories
 * @access  Public
 * @query   includeInactive=true (optional) - Include inactive categories
 */
router.get('/', categoryController.getAllCategories);

/**
 * @route   GET /api/v1/categories/roots
 * @desc    Get root categories (no parent)
 * @access  Public
 */
router.get('/roots', categoryController.getRootCategories);

/**
 * @route   GET /api/v1/categories/tree
 * @desc    Get category tree (hierarchical structure)
 * @access  Public
 */
router.get('/tree', categoryController.getCategoryTree);

/**
 * @route   GET /api/v1/categories/slug/:slug
 * @desc    Get category by slug
 * @access  Public
 */
router.get('/slug/:slug', validate(getCategoryBySlugSchema), categoryController.getCategoryBySlug);

/**
 * @route   GET /api/v1/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', validate(getCategoryByIdSchema), categoryController.getCategoryById);

// ============================================
// Protected Routes (Admin Only)
// ============================================

/**
 * @route   POST /api/v1/categories
 * @desc    Create new category
 * @access  Private (Admin only)
 */
router.post('/', authenticate, isAdmin, validate(createCategorySchema), categoryController.createCategory);

/**
 * @route   PUT /api/v1/categories/:id
 * @desc    Update category
 * @access  Private (Admin only)
 */
router.put(
  '/:id',
  authenticate,
  isAdmin,
  validate(getCategoryByIdSchema),
  validate(updateCategorySchema),
  categoryController.updateCategory
);

/**
 * @route   DELETE /api/v1/categories/:id
 * @desc    Delete category
 * @access  Private (Admin only)
 */
router.delete(
  '/:id',
  authenticate,
  isAdmin,
  validate(getCategoryByIdSchema),
  categoryController.deleteCategory
);

export default router;
