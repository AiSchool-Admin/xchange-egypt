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

import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import * as pushService from './push.service';
import { Server as SocketIOServer } from 'socket.io';

// ============================================
// Types
// ============================================

export type NotificationType =
  | 'AUCTION_BID'
  | 'AUCTION_WON'
  | 'AUCTION_OUTBID'
  | 'AUCTION_ENDING'
  | 'BARTER_MATCH'
  | 'BARTER_OFFER'
  | 'BARTER_ACCEPTED'
  | 'BARTER_REJECTED'
  | 'BARTER_COUNTER'
  | 'TENDER_BID'
  | 'TENDER_AWARDED'
  | 'PRICE_ALERT'
  | 'PRICE_DROP'
  | 'NEW_MESSAGE'
  | 'ORDER_UPDATE'
  | 'PAYMENT_RECEIVED'
  | 'PAYMENT_RELEASED'
  | 'ITEM_SOLD'
  | 'ITEM_FAVORITED'
  | 'REVIEW_RECEIVED'
  | 'BADGE_EARNED'
  | 'SYSTEM_ANNOUNCEMENT'
  | 'MARKET_UPDATE';

export type NotificationChannel = 'IN_APP' | 'PUSH' | 'EMAIL' | 'WEBSOCKET';

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface NotificationPayload {
  userId: string;
  type: NotificationType;
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  priority?: NotificationPriority;
  channels?: NotificationChannel[];
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  actionText?: string;
  actionTextAr?: string;
  imageUrl?: string;
  metadata?: Record<string, any>;
  expiresAt?: Date;
}

export interface BulkNotificationPayload extends Omit<NotificationPayload, 'userId'> {
  userIds: string[];
}

// ============================================
// Notification Templates
// ============================================

const NOTIFICATION_TEMPLATES: Record<NotificationType, {
  defaultChannels: NotificationChannel[];
  defaultPriority: NotificationPriority;
}> = {
  AUCTION_BID: { defaultChannels: ['IN_APP', 'WEBSOCKET'], defaultPriority: 'MEDIUM' },
  AUCTION_WON: { defaultChannels: ['IN_APP', 'PUSH', 'EMAIL'], defaultPriority: 'HIGH' },
  AUCTION_OUTBID: { defaultChannels: ['IN_APP', 'PUSH', 'WEBSOCKET'], defaultPriority: 'HIGH' },
  AUCTION_ENDING: { defaultChannels: ['IN_APP', 'PUSH'], defaultPriority: 'MEDIUM' },
  BARTER_MATCH: { defaultChannels: ['IN_APP', 'PUSH', 'WEBSOCKET'], defaultPriority: 'HIGH' },
  BARTER_OFFER: { defaultChannels: ['IN_APP', 'PUSH'], defaultPriority: 'MEDIUM' },
  BARTER_ACCEPTED: { defaultChannels: ['IN_APP', 'PUSH'], defaultPriority: 'HIGH' },
  BARTER_REJECTED: { defaultChannels: ['IN_APP'], defaultPriority: 'MEDIUM' },
  BARTER_COUNTER: { defaultChannels: ['IN_APP', 'PUSH'], defaultPriority: 'MEDIUM' },
  TENDER_BID: { defaultChannels: ['IN_APP', 'WEBSOCKET'], defaultPriority: 'MEDIUM' },
  TENDER_AWARDED: { defaultChannels: ['IN_APP', 'PUSH', 'EMAIL'], defaultPriority: 'HIGH' },
  PRICE_ALERT: { defaultChannels: ['IN_APP', 'PUSH'], defaultPriority: 'MEDIUM' },
  PRICE_DROP: { defaultChannels: ['IN_APP', 'PUSH'], defaultPriority: 'MEDIUM' },
  NEW_MESSAGE: { defaultChannels: ['IN_APP', 'PUSH', 'WEBSOCKET'], defaultPriority: 'MEDIUM' },
  ORDER_UPDATE: { defaultChannels: ['IN_APP', 'PUSH'], defaultPriority: 'MEDIUM' },
  PAYMENT_RECEIVED: { defaultChannels: ['IN_APP', 'PUSH', 'EMAIL'], defaultPriority: 'HIGH' },
  PAYMENT_RELEASED: { defaultChannels: ['IN_APP', 'PUSH', 'EMAIL'], defaultPriority: 'HIGH' },
  ITEM_SOLD: { defaultChannels: ['IN_APP', 'PUSH'], defaultPriority: 'HIGH' },
  ITEM_FAVORITED: { defaultChannels: ['IN_APP'], defaultPriority: 'LOW' },
  REVIEW_RECEIVED: { defaultChannels: ['IN_APP', 'PUSH'], defaultPriority: 'MEDIUM' },
  BADGE_EARNED: { defaultChannels: ['IN_APP', 'PUSH'], defaultPriority: 'MEDIUM' },
  SYSTEM_ANNOUNCEMENT: { defaultChannels: ['IN_APP', 'PUSH'], defaultPriority: 'MEDIUM' },
  MARKET_UPDATE: { defaultChannels: ['IN_APP'], defaultPriority: 'LOW' },
};

// Global WebSocket instance
let io: SocketIOServer | null = null;

// ============================================
// Initialize WebSocket
// ============================================

export const initializeWebSocket = (socketServer: SocketIOServer) => {
  io = socketServer;
};

// ============================================
// Core Notification Functions
// ============================================

/**
 * Send notification to a single user
 */
export const sendNotification = async (payload: NotificationPayload): Promise<void> => {
  const template = NOTIFICATION_TEMPLATES[payload.type];
  const channels = payload.channels || template.defaultChannels;
  const priority = payload.priority || template.defaultPriority;

  // Check user notification preferences
  const userPrefs = await getUserNotificationPreferences(payload.userId);

  // Send through each enabled channel
  const promises: Promise<void>[] = [];

  if (channels.includes('IN_APP') && userPrefs.inApp) {
    promises.push(sendInAppNotification(payload, priority));
  }

  if (channels.includes('PUSH') && userPrefs.push) {
    promises.push(sendPushNotification(payload));
  }

  if (channels.includes('EMAIL') && userPrefs.email) {
    promises.push(sendEmailNotification(payload));
  }

  if (channels.includes('WEBSOCKET') && userPrefs.websocket) {
    promises.push(sendWebSocketNotification(payload));
  }

  await Promise.allSettled(promises);
};

/**
 * Send notification to multiple users
 */
export const sendBulkNotification = async (payload: BulkNotificationPayload): Promise<void> => {
  const { userIds, ...notificationData } = payload;

  // Process in batches to avoid overwhelming the system
  const batchSize = 100;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);

    await Promise.allSettled(
      batch.map(userId => sendNotification({ ...notificationData, userId }))
    );
  }
};

// ============================================
// Channel-Specific Senders
// ============================================

/**
 * Send in-app notification (stored in database)
 */
const sendInAppNotification = async (
  payload: NotificationPayload,
  priority: NotificationPriority
): Promise<void> => {
  await prisma.notification.create({
    data: {
      userId: payload.userId,
      type: payload.type as any,
      title: payload.titleAr || payload.title,
      message: payload.messageAr || payload.message,
      priority: priority as any,
      entityType: payload.entityType,
      entityId: payload.entityId,
      actionUrl: payload.actionUrl,
      actionText: payload.actionTextAr || payload.actionText,
      metadata: payload.metadata as Prisma.JsonValue,
      expiresAt: payload.expiresAt,
    },
  });
};

/**
 * Send push notification
 */
const sendPushNotification = async (payload: NotificationPayload): Promise<void> => {
  try {
    // Get user's push tokens
    const tokens = await prisma.pushToken.findMany({
      where: { userId: payload.userId },
    });

    if (tokens.length === 0) return;

    await pushService.sendPushNotification({
      tokens: tokens.map(t => t.token),
      title: payload.titleAr || payload.title,
      body: payload.messageAr || payload.message,
      data: {
        type: payload.type,
        entityType: payload.entityType,
        entityId: payload.entityId,
        actionUrl: payload.actionUrl,
        ...payload.metadata,
      },
      imageUrl: payload.imageUrl,
    });
  } catch (error) {
    console.error('Push notification error:', error);
  }
};

/**
 * Send email notification
 */
const sendEmailNotification = async (payload: NotificationPayload): Promise<void> => {
  try {
    // Get user's email
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { email: true, fullName: true },
    });

    if (!user?.email) return;

    // TODO: Implement email sending
    // For now, just log
    console.log(`📧 Email notification to ${user.email}: ${payload.title}`);
  } catch (error) {
    console.error('Email notification error:', error);
  }
};

/**
 * Send WebSocket real-time notification
 */
const sendWebSocketNotification = async (payload: NotificationPayload): Promise<void> => {
  if (!io) {
    console.warn('WebSocket not initialized for notifications');
    return;
  }

  io.to(`user:${payload.userId}`).emit('notification', {
    type: payload.type,
    title: payload.titleAr || payload.title,
    message: payload.messageAr || payload.message,
    entityType: payload.entityType,
    entityId: payload.entityId,
    actionUrl: payload.actionUrl,
    imageUrl: payload.imageUrl,
    metadata: payload.metadata,
    timestamp: new Date().toISOString(),
  });
};

// ============================================
// User Preferences
// ============================================

interface UserNotificationPreferences {
  inApp: boolean;
  push: boolean;
  email: boolean;
  websocket: boolean;
}

const getUserNotificationPreferences = async (userId: string): Promise<UserNotificationPreferences> => {
  // Default preferences - all enabled
  const defaults: UserNotificationPreferences = {
    inApp: true,
    push: true,
    email: true,
    websocket: true,
  };

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { notificationSettings: true },
    });

    if (user?.notificationSettings) {
      const settings = user.notificationSettings as any;
      return {
        inApp: settings.inApp !== false,
        push: settings.push !== false,
        email: settings.email !== false,
        websocket: settings.websocket !== false,
      };
    }
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
  }

  return defaults;
};

// ============================================
// Convenience Functions for Common Notifications
// ============================================

/**
 * Notify user of new barter match
 */
export const notifyBarterMatch = async (
  userId: string,
  matchedItemTitle: string,
  matchId: string
): Promise<void> => {
  await sendNotification({
    userId,
    type: 'BARTER_MATCH',
    title: 'New Barter Match!',
    titleAr: 'مطابقة جديدة!',
    message: `Your item matched with "${matchedItemTitle}"`,
    messageAr: `منتجك متطابق مع "${matchedItemTitle}"`,
    entityType: 'BARTER_MATCH',
    entityId: matchId,
    actionUrl: `/barter/matches/${matchId}`,
    actionText: 'View Match',
    actionTextAr: 'عرض المطابقة',
  });
};

/**
 * Notify user they were outbid
 */
export const notifyAuctionOutbid = async (
  userId: string,
  auctionTitle: string,
  auctionId: string,
  newBidAmount: number
): Promise<void> => {
  await sendNotification({
    userId,
    type: 'AUCTION_OUTBID',
    title: 'You were outbid!',
    titleAr: 'تم تجاوز مزايدتك!',
    message: `Someone placed a higher bid of ${newBidAmount} EGP on "${auctionTitle}"`,
    messageAr: `مزايدة أعلى بقيمة ${newBidAmount} ج.م على "${auctionTitle}"`,
    entityType: 'AUCTION',
    entityId: auctionId,
    actionUrl: `/auctions/${auctionId}`,
    actionText: 'Bid Again',
    actionTextAr: 'زايد مرة أخرى',
    metadata: { newBidAmount },
  });
};

/**
 * Notify auction winner
 */
export const notifyAuctionWon = async (
  userId: string,
  auctionTitle: string,
  auctionId: string,
  winningBid: number
): Promise<void> => {
  await sendNotification({
    userId,
    type: 'AUCTION_WON',
    title: 'Congratulations! You won the auction!',
    titleAr: 'تهانينا! فزت بالمزاد!',
    message: `You won "${auctionTitle}" with a bid of ${winningBid} EGP`,
    messageAr: `فزت بـ "${auctionTitle}" بمزايدة ${winningBid} ج.م`,
    entityType: 'AUCTION',
    entityId: auctionId,
    actionUrl: `/auctions/${auctionId}`,
    actionText: 'Complete Purchase',
    actionTextAr: 'إتمام الشراء',
    metadata: { winningBid },
    priority: 'URGENT',
  });
};

/**
 * Notify seller of new message
 */
export const notifyNewMessage = async (
  userId: string,
  senderName: string,
  chatId: string,
  preview: string
): Promise<void> => {
  await sendNotification({
    userId,
    type: 'NEW_MESSAGE',
    title: `New message from ${senderName}`,
    titleAr: `رسالة جديدة من ${senderName}`,
    message: preview.substring(0, 100) + (preview.length > 100 ? '...' : ''),
    messageAr: preview.substring(0, 100) + (preview.length > 100 ? '...' : ''),
    entityType: 'CHAT',
    entityId: chatId,
    actionUrl: `/chat/${chatId}`,
    actionText: 'Reply',
    actionTextAr: 'رد',
  });
};

/**
 * Notify price drop on favorited item
 */
export const notifyPriceDrop = async (
  userId: string,
  itemTitle: string,
  itemId: string,
  oldPrice: number,
  newPrice: number
): Promise<void> => {
  const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  await sendNotification({
    userId,
    type: 'PRICE_DROP',
    title: 'Price Drop Alert!',
    titleAr: 'تنبيه انخفاض السعر!',
    message: `"${itemTitle}" price dropped ${discount}% to ${newPrice} EGP`,
    messageAr: `انخفض سعر "${itemTitle}" بنسبة ${discount}% إلى ${newPrice} ج.م`,
    entityType: 'ITEM',
    entityId: itemId,
    actionUrl: `/items/${itemId}`,
    actionText: 'View Item',
    actionTextAr: 'عرض المنتج',
    metadata: { oldPrice, newPrice, discount },
  });
};

/**
 * Notify user of payment received
 */
export const notifyPaymentReceived = async (
  userId: string,
  amount: number,
  transactionId: string
): Promise<void> => {
  await sendNotification({
    userId,
    type: 'PAYMENT_RECEIVED',
    title: 'Payment Received!',
    titleAr: 'تم استلام الدفع!',
    message: `You received a payment of ${amount} EGP`,
    messageAr: `تم استلام دفعة بقيمة ${amount} ج.م`,
    entityType: 'TRANSACTION',
    entityId: transactionId,
    actionUrl: `/transactions/${transactionId}`,
    actionText: 'View Details',
    actionTextAr: 'عرض التفاصيل',
    metadata: { amount },
    priority: 'HIGH',
  });
};

/**
 * Notify user of badge earned
 */
export const notifyBadgeEarned = async (
  userId: string,
  badgeName: string,
  badgeNameAr: string,
  badgeId: string
): Promise<void> => {
  await sendNotification({
    userId,
    type: 'BADGE_EARNED',
    title: 'New Badge Earned!',
    titleAr: 'شارة جديدة!',
    message: `You earned the "${badgeName}" badge`,
    messageAr: `حصلت على شارة "${badgeNameAr}"`,
    entityType: 'BADGE',
    entityId: badgeId,
    actionUrl: '/profile/badges',
    actionText: 'View Badge',
    actionTextAr: 'عرض الشارة',
    metadata: { badgeName, badgeNameAr },
  });
};
