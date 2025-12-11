import { Request, Response, NextFunction } from 'express';
import * as comparisonService from '../services/comparison.service';
import { successResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';

/**
 * Create a new comparison
 * POST /api/v1/comparisons
 */
export const createComparison = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { itemIds, title, categorySlug, isPublic } = req.body;

    if (!itemIds || !Array.isArray(itemIds)) {
      throw new BadRequestError('يجب تحديد المنتجات للمقارنة');
    }

    const comparison = await comparisonService.createComparison({
      userId,
      itemIds,
      title,
      categorySlug,
      isPublic,
    });

    return successResponse(res, comparison, 'تم إنشاء المقارنة بنجاح', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get comparison by ID
 * GET /api/v1/comparisons/:id
 */
export const getComparison = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const comparison = await comparisonService.getComparison(id, userId);

    return successResponse(res, comparison, 'تم جلب المقارنة بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get comparison by share code (public access)
 * GET /api/v1/comparisons/share/:shareCode
 */
export const getComparisonByShareCode = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { shareCode } = req.params;

    const comparison = await comparisonService.getComparisonByShareCode(shareCode);

    return successResponse(res, comparison, 'تم جلب المقارنة بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's comparisons
 * GET /api/v1/comparisons/my
 */
export const getUserComparisons = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { page, limit } = req.query;

    const result = await comparisonService.getUserComparisons(
      userId,
      page ? parseInt(page as string, 10) : 1,
      limit ? parseInt(limit as string, 10) : 10
    );

    return successResponse(res, result, 'تم جلب المقارنات بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Update comparison
 * PUT /api/v1/comparisons/:id
 */
export const updateComparison = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;
    const { title, itemIds, isPublic } = req.body;

    const comparison = await comparisonService.updateComparison(id, userId, {
      title,
      itemIds,
      isPublic,
    });

    return successResponse(res, comparison, 'تم تحديث المقارنة بنجاح');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete comparison
 * DELETE /api/v1/comparisons/:id
 */
export const deleteComparison = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await comparisonService.deleteComparison(id, userId);

    return successResponse(res, null, 'تم حذف المقارنة بنجاح');
  } catch (error) {
    next(error);
  }
};
