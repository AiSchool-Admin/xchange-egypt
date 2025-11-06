import { Request, Response, NextFunction } from 'express';
import * as categoryService from '../services/category.service';
import { sendSuccess, sendCreated } from '../utils/response';
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  GetCategoryByIdParams,
  GetCategoryBySlugParams,
} from '../validations/category.validation';

/**
 * Get all categories
 * GET /api/v1/categories
 */
export const getAllCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await categoryService.getAllCategories(includeInactive);

    return sendSuccess(res, categories, 'Categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get root categories (no parent)
 * GET /api/v1/categories/roots
 */
export const getRootCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const categories = await categoryService.getRootCategories(includeInactive);

    return sendSuccess(res, categories, 'Root categories retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get category tree
 * GET /api/v1/categories/tree
 */
export const getCategoryTree = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const includeInactive = req.query.includeInactive === 'true';
    const tree = await categoryService.getCategoryTree(includeInactive);

    return sendSuccess(res, tree, 'Category tree retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID
 * GET /api/v1/categories/:id
 */
export const getCategoryById = async (
  req: Request<GetCategoryByIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await categoryService.getCategoryById(req.params.id);

    return sendSuccess(res, category, 'Category retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by slug
 * GET /api/v1/categories/slug/:slug
 */
export const getCategoryBySlug = async (
  req: Request<GetCategoryBySlugParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await categoryService.getCategoryBySlug(req.params.slug);

    return sendSuccess(res, category, 'Category retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Create category
 * POST /api/v1/categories
 */
export const createCategory = async (
  req: Request<object, object, CreateCategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await categoryService.createCategory(req.body);

    return sendCreated(res, category, 'Category created successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update category
 * PUT /api/v1/categories/:id
 */
export const updateCategory = async (
  req: Request<GetCategoryByIdParams, object, UpdateCategoryInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const category = await categoryService.updateCategory(req.params.id, req.body);

    return sendSuccess(res, category, 'Category updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete category
 * DELETE /api/v1/categories/:id
 */
export const deleteCategory = async (
  req: Request<GetCategoryByIdParams>,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await categoryService.deleteCategory(req.params.id);

    return sendSuccess(res, result, result.message);
  } catch (error) {
    next(error);
  }
};
