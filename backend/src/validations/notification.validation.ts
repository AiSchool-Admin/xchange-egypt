/**
 * Notification Validation Schemas
 *
 * Zod schemas for validating notification requests
 */

import { z } from 'zod';

// ============================================
// Notification Schemas
// ============================================

/**
 * Get Notifications Schema
 * GET /api/v1/notifications
 */
export const getNotificationsSchema = z.object({
  query: z.object({
    isRead: z.enum(['true', 'false']).optional(),
    type: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1))
      .default('1')
      .optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100))
      .default('20')
      .optional(),
  }),
});

/**
 * Mark as Read Schema
 * PATCH /api/v1/notifications/:id/read
 */
export const markAsReadSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid notification ID'),
  }),
});

/**
 * Delete Notification Schema
 * DELETE /api/v1/notifications/:id
 */
export const deleteNotificationSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid notification ID'),
  }),
});

// ============================================
// Preference Schemas
// ============================================

/**
 * Update Preferences Schema
 * PATCH /api/v1/notifications/preferences
 */
export const updatePreferencesSchema = z.object({
  body: z.object({
    emailEnabled: z.boolean().optional(),
    smsEnabled: z.boolean().optional(),
    pushEnabled: z.boolean().optional(),
    preferences: z.record(z.any()).optional(),
    quietHoursStart: z
      .number()
      .int()
      .min(0)
      .max(23)
      .optional()
      .nullable(),
    quietHoursEnd: z
      .number()
      .int()
      .min(0)
      .max(23)
      .optional()
      .nullable(),
    emailDigest: z.boolean().optional(),
    digestTime: z
      .number()
      .int()
      .min(0)
      .max(23)
      .optional()
      .nullable(),
  }),
});

// ============================================
// Email Queue Schemas
// ============================================

/**
 * Process Email Queue Schema
 * POST /api/v1/notifications/process-email-queue
 */
export const processEmailQueueSchema = z.object({
  body: z.object({
    batchSize: z.number().int().min(1).max(100).default(10).optional(),
  }),
});

/**
 * Cleanup Emails Schema
 * POST /api/v1/notifications/cleanup-emails
 */
export const cleanupEmailsSchema = z.object({
  body: z.object({
    olderThanDays: z.number().int().min(1).max(365).default(30).optional(),
  }),
});
