import { Request, Response, NextFunction } from 'express';
import * as itemService from '../services/item.service';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

/**
 * Create a new item
 * POST /api/v1/items
 */
export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const imageFiles = req.files as Express.Multer.File[] | undefined;

    // Transform validation fields (titleAr/descriptionAr) to service fields (title/description)
    const itemData = {
      title: req.body.titleAr || req.body.titleEn || req.body.title,
      description: req.body.descriptionAr || req.body.descriptionEn || req.body.description,
      categoryId: req.body.categoryId,
      condition: req.body.condition,
      estimatedValue: req.body.estimatedValue || 0,
      location: req.body.location,
      governorate: req.body.governorate,
      // Barter preferences
      desiredCategoryId: req.body.desiredCategoryId,
      desiredKeywords: req.body.desiredKeywords,
      desiredValueMin: req.body.desiredValueMin ? parseFloat(req.body.desiredValueMin) : undefined,
      desiredValueMax: req.body.desiredValueMax ? parseFloat(req.body.desiredValueMax) : undefined,
    };

    const item = await itemService.createItem(userId, itemData, imageFiles);

    return successResponse(res, item, 'Item created successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get item by ID
 * GET /api/v1/items/:id
 */
export const getItemById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const item = await itemService.getItemById(id);

    return successResponse(res, item, 'Item retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update an item
 * PUT /api/v1/items/:id
 */
export const updateItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Transform validation fields (titleAr/descriptionAr) to service fields (title/description)
    const updateData: any = {};

    if (req.body.titleAr || req.body.titleEn) {
      updateData.title = req.body.titleAr || req.body.titleEn;
    }

    if (req.body.descriptionAr || req.body.descriptionEn) {
      updateData.description = req.body.descriptionAr || req.body.descriptionEn;
    }

    if (req.body.categoryId) updateData.categoryId = req.body.categoryId;
    if (req.body.condition) updateData.condition = req.body.condition;
    if (req.body.estimatedValue !== undefined) updateData.estimatedValue = req.body.estimatedValue;
    if (req.body.quantity) updateData.quantity = req.body.quantity;
    if (req.body.location) updateData.location = req.body.location;
    if (req.body.governorate) updateData.governorate = req.body.governorate;
    if (req.body.imageUrls) updateData.imageUrls = req.body.imageUrls;

    const item = await itemService.updateItem(id, userId, updateData);

    return successResponse(res, item, 'Item updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete an item
 * DELETE /api/v1/items/:id
 */
export const deleteItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await itemService.deleteItem(id, userId);

    return successResponse(res, { message: 'Item deleted successfully' }, 'Item deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Search items with filters
 * GET /api/v1/items/search
 */
export const searchItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Parse query parameters to correct types
    const params = {
      ...req.query,
      page: req.query.page ? parseInt(req.query.page as string, 10) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
    };

    const result = await itemService.searchItems(params);

    return successResponse(res, result, 'Items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get authenticated user's items
 * GET /api/v1/items/my
 */
export const getMyItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { page, limit } = req.query;

    const result = await itemService.getUserItems(
      userId,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    return successResponse(res, result, 'Your items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's items
 * GET /api/v1/items/user/:userId
 */
export const getUserItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const result = await itemService.getUserItems(
      userId,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    return successResponse(res, result, 'User items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get category items
 * GET /api/v1/items/category/:categoryId
 */
export const getCategoryItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.params;
    const { includeSubcategories, condition, governorate, page, limit, sortBy, sortOrder } =
      req.query;

    const result = await itemService.getCategoryItems(
      categoryId,
      includeSubcategories === 'true',
      {
        condition: condition as any,
        governorate: governorate as string,
        page: page ? parseInt(page as string) : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      }
    );

    return successResponse(res, result, 'Category items retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Add images to an item
 * POST /api/v1/items/:id/images
 */
export const addItemImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const imageFiles = req.files as Express.Multer.File[];

    if (!imageFiles || imageFiles.length === 0) {
      throw new BadRequestError('No images provided');
    }

    const item = await itemService.addItemImages(id, userId, imageFiles);

    return successResponse(res, item, 'Images added successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove images from an item
 * DELETE /api/v1/items/:id/images
 */
export const removeItemImages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { imagesToRemove } = req.body;

    const item = await itemService.removeItemImages(id, userId, imagesToRemove);

    return successResponse(res, item, 'Images removed successfully');
  } catch (error) {
    next(error);
  }
};
