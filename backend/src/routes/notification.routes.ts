/**
 * Notification Routes
 *
 * All routes for the notification system
 */

import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validation.middleware';
import {
  getNotificationsSchema,
  markAsReadSchema,
  deleteNotificationSchema,
  updatePreferencesSchema,
  processEmailQueueSchema,
  cleanupEmailsSchema,
} from '../validations/notification.validation';

const router = Router();

// ============================================
// In-App Notifications (Authenticated)
// ============================================

/**
 * Get user's notifications
 * GET /api/v1/notifications
 * Query params: isRead, type, priority, page, limit
 */
router.get(
  '/',
  authenticate,
  validate(getNotificationsSchema),
  notificationController.getNotifications
);

/**
 * Get unread count
 * GET /api/v1/notifications/unread-count
 */
router.get(
  '/unread-count',
  authenticate,
  notificationController.getUnreadCount
);

/**
 * Mark notification as read
 * PATCH /api/v1/notifications/:id/read
 */
router.patch(
  '/:id/read',
  authenticate,
  validate(markAsReadSchema),
  notificationController.markAsRead
);

/**
 * Mark all notifications as read
 * POST /api/v1/notifications/mark-all-read
 */
router.post(
  '/mark-all-read',
  authenticate,
  notificationController.markAllAsRead
);

/**
 * Delete notification
 * DELETE /api/v1/notifications/:id
 */
router.delete(
  '/:id',
  authenticate,
  validate(deleteNotificationSchema),
  notificationController.deleteNotification
);

/**
 * Delete all read notifications
 * DELETE /api/v1/notifications/read
 */
router.delete(
  '/read',
  authenticate,
  notificationController.deleteAllRead
);

// ============================================
// Notification Preferences (Authenticated)
// ============================================

/**
 * Get notification preferences
 * GET /api/v1/notifications/preferences
 */
router.get(
  '/preferences',
  authenticate,
  notificationController.getPreferences
);

/**
 * Update notification preferences
 * PATCH /api/v1/notifications/preferences
 */
router.patch(
  '/preferences',
  authenticate,
  validate(updatePreferencesSchema),
  notificationController.updatePreferences
);

// ============================================
// Email Queue Management (Authenticated - Admin only in production)
// ============================================

/**
 * Get email queue statistics
 * GET /api/v1/notifications/email-stats
 */
router.get(
  '/email-stats',
  authenticate,
  notificationController.getEmailStats
);

/**
 * Process email queue manually
 * POST /api/v1/notifications/process-email-queue
 */
router.post(
  '/process-email-queue',
  authenticate,
  validate(processEmailQueueSchema),
  notificationController.processEmailQueue
);

/**
 * Retry failed emails
 * POST /api/v1/notifications/retry-failed-emails
 */
router.post(
  '/retry-failed-emails',
  authenticate,
  notificationController.retryFailedEmails
);

/**
 * Clean up old emails
 * POST /api/v1/notifications/cleanup-emails
 */
router.post(
  '/cleanup-emails',
  authenticate,
  validate(cleanupEmailsSchema),
  notificationController.cleanupEmails
);

export default router;
