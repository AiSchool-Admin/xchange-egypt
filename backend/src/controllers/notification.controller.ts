/**
 * Notification Controllers
 *
 * HTTP request handlers for notification endpoints
 */

import { Request, Response, NextFunction } from 'express';
import * as notificationService from '../services/notification.service';
import * as emailService from '../services/email.service';
import { successResponse } from '../utils/response';

// ============================================
// In-App Notifications
// ============================================

/**
 * Get user's notifications
 * GET /api/v1/notifications
 */
export const getNotifications = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const {
      isRead,
      type,
      priority,
      page,
      limit,
    } = req.query;

    const result = await notificationService.getUserNotifications(userId, {
      isRead: isRead === 'true' ? true : isRead === 'false' ? false : undefined,
      type: type as string,
      priority: priority as string,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 20,
    });

    return successResponse(res, result, 'Notifications retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get unread count
 * GET /api/v1/notifications/unread-count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.getUnreadCount(userId);

    return successResponse(res, { count }, 'Unread count retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark notification as read
 * PATCH /api/v1/notifications/:id/read
 */
export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await notificationService.markAsRead(id, userId);

    return successResponse(res, notification, 'Notification marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark all notifications as read
 * POST /api/v1/notifications/mark-all-read
 */
export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.markAllAsRead(userId);

    return successResponse(
      res,
      { count },
      `${count} notifications marked as read`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete notification
 * DELETE /api/v1/notifications/:id
 */
export const deleteNotification = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await notificationService.deleteNotification(id, userId);

    return successResponse(res, null, 'Notification deleted successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete all read notifications
 * DELETE /api/v1/notifications/read
 */
export const deleteAllRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const count = await notificationService.deleteAllRead(userId);

    return successResponse(
      res,
      { count },
      `${count} notifications deleted`
    );
  } catch (error) {
    next(error);
  }
};

// ============================================
// Notification Preferences
// ============================================

/**
 * Get notification preferences
 * GET /api/v1/notifications/preferences
 */
export const getPreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const preferences = await notificationService.getUserPreferences(userId);

    return successResponse(res, preferences, 'Preferences retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Update notification preferences
 * PATCH /api/v1/notifications/preferences
 */
export const updatePreferences = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const preferences = await notificationService.updatePreferences(userId, updates);

    return successResponse(res, preferences, 'Preferences updated successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Email Queue Management (Admin)
// ============================================

/**
 * Get email queue statistics
 * GET /api/v1/notifications/email-stats
 */
export const getEmailStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await emailService.getEmailQueueStats();

    return successResponse(res, stats, 'Email statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Process email queue manually
 * POST /api/v1/notifications/process-email-queue
 */
export const processEmailQueue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { batchSize = 10 } = req.body;
    const sentCount = await emailService.processEmailQueue(batchSize);

    return successResponse(
      res,
      { sentCount },
      `Processed ${sentCount} emails`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Retry failed emails
 * POST /api/v1/notifications/retry-failed-emails
 */
export const retryFailedEmails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const count = await emailService.retryFailedEmails();

    return successResponse(
      res,
      { count },
      `${count} failed emails queued for retry`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Clean up old emails
 * POST /api/v1/notifications/cleanup-emails
 */
export const cleanupEmails = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { olderThanDays = 30 } = req.body;
    const count = await emailService.cleanupEmailQueue(olderThanDays);

    return successResponse(
      res,
      { count },
      `${count} old emails cleaned up`
    );
  } catch (error) {
    next(error);
  }
};
