import { Request, Response, NextFunction } from 'express';
import * as itemService from '../services/item.service';
import { successResponse } from '../utils/response';

/**
 * Create a new item
 * POST /api/v1/items
 */
export const createItem = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const itemData = req.body;
    const imageFiles = req.files as Express.Multer.File[] | undefined;

    const item = await itemService.createItem(userId, itemData, imageFiles);

    res.status(201).json(successResponse(item, 'Item created successfully'));
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
): Promise<void> => {
  try {
    const { id } = req.params;

    const item = await itemService.getItemById(id);

    res.json(successResponse(item, 'Item retrieved successfully'));
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
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const updateData = req.body;

    const item = await itemService.updateItem(id, userId, updateData);

    res.json(successResponse(item, 'Item updated successfully'));
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
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await itemService.deleteItem(id, userId);

    res.json(
      successResponse({ message: 'Item deleted successfully' }, 'Item deleted successfully')
    );
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
): Promise<void> => {
  try {
    const params = req.query;

    const result = await itemService.searchItems(params);

    res.json(successResponse(result, 'Items retrieved successfully'));
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
): Promise<void> => {
  try {
    const { userId } = req.params;
    const { page, limit } = req.query;

    const result = await itemService.getUserItems(
      userId,
      page ? parseInt(page as string) : undefined,
      limit ? parseInt(limit as string) : undefined
    );

    res.json(successResponse(result, 'User items retrieved successfully'));
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
): Promise<void> => {
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

    res.json(successResponse(result, 'Category items retrieved successfully'));
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
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const imageFiles = req.files as Express.Multer.File[];

    if (!imageFiles || imageFiles.length === 0) {
      res.status(400).json({
        success: false,
        error: { message: 'No images provided' },
      });
      return;
    }

    const item = await itemService.addItemImages(id, userId, imageFiles);

    res.json(successResponse(item, 'Images added successfully'));
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
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { imagesToRemove } = req.body;

    const item = await itemService.removeItemImages(id, userId, imagesToRemove);

    res.json(successResponse(item, 'Images removed successfully'));
  } catch (error) {
    next(error);
  }
};
