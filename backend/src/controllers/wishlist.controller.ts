import { Request, Response, NextFunction } from 'express';
import * as wishlistService from '../services/wishlist.service';
import { successResponse } from '../utils/response';

/**
 * Add item to wish list
 * POST /api/v1/wishlist
 */
export const addToWishList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { categoryId, description, keywords, maxPrice } = req.body;

    const wishListItem = await wishlistService.addToWishList(userId, {
      categoryId,
      description,
      keywords,
      maxPrice,
    });

    return successResponse(res, wishListItem, 'Item added to wish list', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's wish list
 * GET /api/v1/wishlist
 */
export const getWishList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const wishList = await wishlistService.getWishList(userId);

    return successResponse(res, { items: wishList }, 'Wish list retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Remove item from wish list
 * DELETE /api/v1/wishlist/:id
 */
export const removeFromWishList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await wishlistService.removeFromWishList(userId, id);

    return successResponse(res, null, 'Item removed from wish list');
  } catch (error) {
    next(error);
  }
};

/**
 * Find matches for wish list
 * GET /api/v1/wishlist/matches
 */
export const findWishListMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const matches = await wishlistService.findWishListMatches(userId);

    return successResponse(res, { matches }, 'Wish list matches found');
  } catch (error) {
    next(error);
  }
};

/**
 * Check for new matches and send notifications
 * POST /api/v1/wishlist/check-matches
 */
export const checkMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const notificationCount = await wishlistService.checkAndNotifyMatches(userId);

    return successResponse(res, { notificationCount }, `Found ${notificationCount} new matches`);
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's notifications
 * GET /api/v1/wishlist/notifications
 */
export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { limit } = req.query;
    const notifications = await wishlistService.getNotifications(
      userId,
      limit ? parseInt(limit as string) : 20
    );

    return successResponse(res, { notifications }, 'Notifications retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * POST /api/v1/wishlist/notifications/:id/read
 */
export const markNotificationRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    await wishlistService.markNotificationRead(userId, id);

    return successResponse(res, null, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};
