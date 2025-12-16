/**
 * Unified Notification Service
 * نظام الإشعارات الموحد
 *
 * Centralized notification management across all markets:
 * - In-app notifications
 * - Push notifications
 * - Email notifications
 * - WebSocket real-time updates
 */

import prisma from '../lib/prisma';
import { NotificationType } from '@prisma/client';
import { Server as SocketIOServer } from 'socket.io';

// ============================================
// Types
// ============================================

export type NotificationChannel = 'IN_APP' | 'PUSH' | 'EMAIL' | 'WEBSOCKET';

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  data?: Record<string, any>;
  channels?: NotificationChannel[];
  priority?: 'low' | 'normal' | 'high' | 'urgent';
}

// Store for Socket.IO instance
let io: SocketIOServer | null = null;

// ============================================
// Initialization
// ============================================

/**
 * Initialize the notification service with Socket.IO
 */
export const initializeNotificationService = (socketIO: SocketIOServer): void => {
  io = socketIO;
  console.log('Unified Notification Service initialized');
};

// ============================================
// Core Notification Functions
// ============================================

/**
 * Send a notification through all specified channels
 */
export const sendNotification = async (payload: NotificationPayload): Promise<void> => {
  const {
    userId,
    type,
    title,
    titleAr,
    message,
    messageAr,
    data = {},
    channels = ['IN_APP', 'WEBSOCKET'],
    priority = 'normal',
  } = payload;

  // Create in-app notification
  if (channels.includes('IN_APP')) {
    await createInAppNotification(userId, type, title, titleAr, message, messageAr, data);
  }

  // Send WebSocket notification
  if (channels.includes('WEBSOCKET') && io) {
    sendWebSocketNotification(userId, { type, title, titleAr, message, messageAr, data, priority });
  }

  // Push notification would go here (requires additional setup)
  if (channels.includes('PUSH')) {
    await sendPushNotification(userId, title, message, data);
  }
};

/**
 * Create an in-app notification record
 */
async function createInAppNotification(
  userId: string,
  type: NotificationType,
  title: string,
  titleAr: string,
  message: string,
  messageAr: string,
  data: Record<string, any>
): Promise<void> {
  await prisma.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      metadata: { titleAr, messageAr, ...data },
      isRead: false,
    },
  });
}

/**
 * Send real-time WebSocket notification
 */
function sendWebSocketNotification(
  userId: string,
  notification: {
    type: NotificationType;
    title: string;
    titleAr: string;
    message: string;
    messageAr: string;
    data: Record<string, any>;
    priority: string;
  }
): void {
  if (io) {
    io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date().toISOString(),
    });
  }
}

/**
 * Send push notification (placeholder)
 */
async function sendPushNotification(
  userId: string,
  title: string,
  message: string,
  data: Record<string, any>
): Promise<void> {
  // Get user's push subscriptions
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  // Would send push notifications here
  // For now, just log
  if (subscriptions.length > 0) {
    console.log(`Push notification to user ${userId}: ${title}`);
  }
}

// ============================================
// Convenience Functions for Common Notifications
// ============================================

/**
 * Notify about a new barter match
 */
export const notifyBarterMatch = async (
  userId: string,
  matchData: { offerId: string; matchedItemTitle: string }
): Promise<void> => {
  await sendNotification({
    userId,
    type: 'BARTER_MATCH',
    title: 'New Barter Match!',
    titleAr: 'تطابق مقايضة جديد!',
    message: `Found a match for your item: ${matchData.matchedItemTitle}`,
    messageAr: `تم العثور على تطابق: ${matchData.matchedItemTitle}`,
    data: matchData,
    channels: ['IN_APP', 'WEBSOCKET', 'PUSH'],
    priority: 'high',
  });
};

/**
 * Notify about auction outbid
 */
export const notifyAuctionOutbid = async (
  userId: string,
  auctionData: { auctionId: string; itemTitle: string; currentBid: number }
): Promise<void> => {
  await sendNotification({
    userId,
    type: 'AUCTION_OUTBID',
    title: 'You have been outbid!',
    titleAr: 'تم تجاوز عرضك!',
    message: `Someone placed a higher bid on "${auctionData.itemTitle}"`,
    messageAr: `قام شخص بوضع عرض أعلى على "${auctionData.itemTitle}"`,
    data: auctionData,
    channels: ['IN_APP', 'WEBSOCKET', 'PUSH'],
    priority: 'urgent',
  });
};

/**
 * Notify about tender awarded
 */
export const notifyTenderAwarded = async (
  userId: string,
  tenderData: { tenderId: string; tenderTitle: string; bidAmount: number }
): Promise<void> => {
  await sendNotification({
    userId,
    type: 'REVERSE_AUCTION_AWARDED',
    title: 'Congratulations! You won the tender!',
    titleAr: 'تهانينا! لقد فزت بالمناقصة!',
    message: `Your bid of ${tenderData.bidAmount} EGP on "${tenderData.tenderTitle}" was accepted`,
    messageAr: `تم قبول عرضك بقيمة ${tenderData.bidAmount} ج.م على "${tenderData.tenderTitle}"`,
    data: tenderData,
    channels: ['IN_APP', 'WEBSOCKET', 'PUSH', 'EMAIL'],
    priority: 'high',
  });
};

/**
 * Notify about new message
 */
export const notifyNewMessage = async (
  userId: string,
  messageData: { senderId: string; senderName: string; preview: string; conversationId: string }
): Promise<void> => {
  await sendNotification({
    userId,
    type: 'NEW_MESSAGE',
    title: `New message from ${messageData.senderName}`,
    titleAr: `رسالة جديدة من ${messageData.senderName}`,
    message: messageData.preview,
    messageAr: messageData.preview,
    data: messageData,
    channels: ['WEBSOCKET', 'PUSH'],
    priority: 'normal',
  });
};

/**
 * Notify about new review
 */
export const notifyNewReview = async (
  userId: string,
  reviewData: { reviewerId: string; reviewerName: string; rating: number; itemTitle?: string }
): Promise<void> => {
  await sendNotification({
    userId,
    type: 'REVIEW_RECEIVED',
    title: `New ${reviewData.rating}-star review!`,
    titleAr: `تقييم جديد ${reviewData.rating} نجوم!`,
    message: `${reviewData.reviewerName} left you a review`,
    messageAr: `${reviewData.reviewerName} ترك لك تقييماً`,
    data: reviewData,
    channels: ['IN_APP', 'WEBSOCKET'],
    priority: 'normal',
  });
};

// ============================================
// User Notification Management
// ============================================

/**
 * Get user's notifications
 */
export const getUserNotifications = async (
  userId: string,
  options: { unreadOnly?: boolean; page?: number; limit?: number } = {}
): Promise<{ notifications: any[]; unreadCount: number; total: number }> => {
  const { unreadOnly = false, page = 1, limit = 20 } = options;
  const skip = (page - 1) * limit;

  const where: any = { userId };
  if (unreadOnly) {
    where.isRead = false;
  }

  const [notifications, unreadCount, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.notification.count({ where: { userId, isRead: false } }),
    prisma.notification.count({ where }),
  ]);

  return { notifications, unreadCount, total };
};

/**
 * Mark notification as read
 */
export const markAsRead = async (notificationId: string, userId: string): Promise<void> => {
  await prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { isRead: true, readAt: new Date() },
  });
};

/**
 * Mark all notifications as read
 */
export const markAllAsRead = async (userId: string): Promise<void> => {
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true, readAt: new Date() },
  });
};

/**
 * Delete a notification
 */
export const deleteNotification = async (notificationId: string, userId: string): Promise<void> => {
  await prisma.notification.deleteMany({
    where: { id: notificationId, userId },
  });
};

/**
 * Get unread count for a user
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  return prisma.notification.count({
    where: { userId, isRead: false },
  });
};
