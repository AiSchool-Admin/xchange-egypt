/**
 * Notification Service
 *
 * Handles in-app notifications
 */

import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { NotFoundError } from '../utils/errors';

// ============================================
// Types
// ============================================

export interface CreateNotificationInput {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

// ============================================
// Notification CRUD
// ============================================

/**
 * Create a notification
 */
export const createNotification = async (
  input: CreateNotificationInput
): Promise<any> => {
  const {
    userId,
    type,
    title,
    message,
    priority = 'MEDIUM',
    entityType,
    entityId,
    actionUrl,
    actionText,
    metadata,
    expiresAt,
  } = input;

  const notification = await prisma.notification.create({
    data: {
      userId,
      type: type as any,
      title,
      message,
      priority: priority as any,
      entityType,
      entityId,
      actionUrl,
      actionText,
      metadata: metadata as Prisma.JsonValue,
      expiresAt,
    },
  });

  return notification;
};

/**
 * Create bulk notifications (for multiple users)
 */
export const createBulkNotifications = async (
  userIds: string[],
  input: Omit<CreateNotificationInput, 'userId'>
): Promise<number> => {
  const notifications = userIds.map((userId) => ({
    userId,
    type: input.type as any,
    title: input.title,
    message: input.message,
    priority: (input.priority || 'MEDIUM') as any,
    entityType: input.entityType,
    entityId: input.entityId,
    actionUrl: input.actionUrl,
    actionText: input.actionText,
    metadata: input.metadata as Prisma.JsonValue,
    expiresAt: input.expiresAt,
  }));

  const result = await prisma.notification.createMany({
    data: notifications,
  });

  return result.count;
};

/**
 * Get user's notifications
 */
export const getUserNotifications = async (
  userId: string,
  filters: {
    isRead?: boolean;
    type?: string;
    priority?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<any> => {
  const {
    isRead,
    type,
    priority,
    page = 1,
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;

  const where: Prisma.NotificationWhereInput = {
    userId,
  };

  if (isRead !== undefined) {
    where.isRead = isRead;
  }

  if (type) {
    where.type = type as any;
  }

  if (priority) {
    where.priority = priority as any;
  }

  // Only get non-expired notifications
  where.OR = [
    { expiresAt: null },
    { expiresAt: { gt: new Date() } },
  ];

  const [total, notifications] = await Promise.all([
    prisma.notification.count({ where }),
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' },
      ],
    }),
  ]);

  return {
    notifications,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Mark notification as read
 */
export const markAsRead = async (
  notificationId: string,
  userId: string
): Promise<any> => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  const updated = await prisma.notification.update({
    where: { id: notificationId },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return updated;
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId: string): Promise<number> => {
  const result = await prisma.notification.updateMany({
    where: {
      userId,
      isRead: false,
    },
    data: {
      isRead: true,
      readAt: new Date(),
    },
  });

  return result.count;
};

/**
 * Delete notification
 */
export const deleteNotification = async (
  notificationId: string,
  userId: string
): Promise<void> => {
  const notification = await prisma.notification.findFirst({
    where: {
      id: notificationId,
      userId,
    },
  });

  if (!notification) {
    throw new NotFoundError('Notification not found');
  }

  await prisma.notification.delete({
    where: { id: notificationId },
  });
};

/**
 * Delete all read notifications
 */
export const deleteAllRead = async (userId: string): Promise<number> => {
  const result = await prisma.notification.deleteMany({
    where: {
      userId,
      isRead: true,
    },
  });

  return result.count;
};

/**
 * Get unread count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  const count = await prisma.notification.count({
    where: {
      userId,
      isRead: false,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });

  return count;
};

/**
 * Clean up expired notifications
 */
export const cleanupExpiredNotifications = async (): Promise<number> => {
  const result = await prisma.notification.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  return result.count;
};

// ============================================
// Notification Preferences
// ============================================

/**
 * Get user's notification preferences
 */
export const getUserPreferences = async (userId: string): Promise<any> => {
  let preferences = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  // Create default preferences if not exists
  if (!preferences) {
    preferences = await prisma.notificationPreference.create({
      data: {
        userId,
        emailEnabled: true,
        smsEnabled: false,
        pushEnabled: true,
        preferences: {},
      },
    });
  }

  return preferences;
};

/**
 * Update notification preferences
 */
export const updatePreferences = async (
  userId: string,
  updates: {
    emailEnabled?: boolean;
    smsEnabled?: boolean;
    pushEnabled?: boolean;
    preferences?: Record<string, any>;
    quietHoursStart?: number;
    quietHoursEnd?: number;
    emailDigest?: boolean;
    digestTime?: number;
  }
): Promise<any> => {
  // Ensure preferences exist
  await getUserPreferences(userId);

  const updated = await prisma.notificationPreference.update({
    where: { userId },
    data: {
      ...updates,
      preferences: updates.preferences as Prisma.JsonValue,
    },
  });

  return updated;
};

/**
 * Check if user should receive notification (based on preferences)
 */
export const shouldNotifyUser = async (
  userId: string,
  notificationType: string,
  channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP'
): Promise<boolean> => {
  const preferences = await getUserPreferences(userId);

  // Check channel enabled
  if (channel === 'EMAIL' && !preferences.emailEnabled) return false;
  if (channel === 'SMS' && !preferences.smsEnabled) return false;
  if (channel === 'PUSH' && !preferences.pushEnabled) return false;

  // Check quiet hours
  if (preferences.quietHoursStart !== null && preferences.quietHoursEnd !== null) {
    const now = new Date();
    const currentHour = now.getHours();

    const start = preferences.quietHoursStart;
    const end = preferences.quietHoursEnd;

    // Handle overnight quiet hours (e.g., 22-6)
    const isQuietTime =
      start <= end
        ? currentHour >= start && currentHour < end
        : currentHour >= start || currentHour < end;

    if (isQuietTime && channel !== 'IN_APP') {
      return false;
    }
  }

  // Check type-specific preferences
  const typePreferences = preferences.preferences as any;
  if (typePreferences[notificationType]) {
    const channelKey = channel.toLowerCase();
    if (typePreferences[notificationType][channelKey] === false) {
      return false;
    }
  }

  return true;
};
