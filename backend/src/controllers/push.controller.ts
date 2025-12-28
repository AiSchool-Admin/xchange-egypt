import { Request, Response, NextFunction } from 'express';
import * as pushService from '../services/push.service';
import { successResponse, errorResponse } from '../utils/response';

// Helper to safely get user ID from request
const getUserId = (req: Request): string | null => req.user?.id || null;

/**
 * Subscribe to push notifications
 * POST /api/v1/push/subscribe
 */
export const subscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { endpoint, p256dh, auth } = req.body;

    const subscription = await pushService.subscribe(userId, {
      endpoint,
      p256dh,
      auth,
    });

    return successResponse(res, subscription, 'Subscribed to push notifications', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Unsubscribe from push notifications
 * POST /api/v1/push/unsubscribe
 */
export const unsubscribe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }
    const { endpoint } = req.body;

    await pushService.unsubscribe(userId, endpoint);

    return successResponse(res, null, 'Unsubscribed from push notifications');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's push subscriptions
 * GET /api/v1/push/subscriptions
 */
export const getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const subscriptions = await pushService.getUserSubscriptions(userId);

    return successResponse(res, subscriptions, 'Subscriptions retrieved');
  } catch (error) {
    next(error);
  }
};

/**
 * Check if user has push enabled
 * GET /api/v1/push/status
 */
export const getStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getUserId(req);
    if (!userId) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    const enabled = await pushService.hasPushEnabled(userId);

    return successResponse(res, { enabled }, 'Push status retrieved');
  } catch (error) {
    next(error);
  }
};
