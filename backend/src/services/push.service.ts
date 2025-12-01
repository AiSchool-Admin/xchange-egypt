import webpush from 'web-push';
import prisma from '../lib/prisma';

// Configure web-push with VAPID keys
const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || '';
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || '';
const rawEmail = process.env.VAPID_EMAIL || 'support@xchange.eg';
// Ensure email has mailto: prefix
const VAPID_EMAIL = rawEmail.startsWith('mailto:') ? rawEmail : `mailto:${rawEmail}`;

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(VAPID_EMAIL, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);
}

interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: Record<string, any>;
  actions?: Array<{ action: string; title: string }>;
}

/**
 * Subscribe user to push notifications
 */
export const subscribe = async (
  userId: string,
  subscriptionData: {
    endpoint: string;
    p256dh: string;
    auth: string;
  }
) => {
  // Check if subscription already exists
  const existing = await prisma.pushSubscription.findUnique({
    where: { endpoint: subscriptionData.endpoint },
  });

  if (existing) {
    // Update existing subscription
    return prisma.pushSubscription.update({
      where: { endpoint: subscriptionData.endpoint },
      data: {
        userId,
        p256dh: subscriptionData.p256dh,
        auth: subscriptionData.auth,
      },
    });
  }

  // Create new subscription
  return prisma.pushSubscription.create({
    data: {
      userId,
      endpoint: subscriptionData.endpoint,
      p256dh: subscriptionData.p256dh,
      auth: subscriptionData.auth,
    },
  });
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribe = async (userId: string, endpoint: string) => {
  const subscription = await prisma.pushSubscription.findFirst({
    where: { userId, endpoint },
  });

  if (subscription) {
    await prisma.pushSubscription.delete({
      where: { id: subscription.id },
    });
  }

  return { success: true };
};

/**
 * Send push notification to a user
 */
export const sendPushToUser = async (userId: string, payload: PushPayload) => {
  const subscriptions = await prisma.pushSubscription.findMany({
    where: { userId },
  });

  if (subscriptions.length === 0) {
    return { sent: 0, failed: 0 };
  }

  const results = await Promise.allSettled(
    subscriptions.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: {
              p256dh: sub.p256dh,
              auth: sub.auth,
            },
          },
          JSON.stringify({
            title: payload.title,
            body: payload.body,
            icon: payload.icon || '/icons/icon-192x192.png',
            badge: payload.badge || '/icons/icon-72x72.png',
            tag: payload.tag,
            data: payload.data,
            actions: payload.actions,
          })
        );
        return true;
      } catch (error: any) {
        // Remove invalid subscriptions
        if (error.statusCode === 404 || error.statusCode === 410) {
          await prisma.pushSubscription.delete({
            where: { id: sub.id },
          });
        }
        throw error;
      }
    })
  );

  const sent = results.filter((r) => r.status === 'fulfilled').length;
  const failed = results.filter((r) => r.status === 'rejected').length;

  return { sent, failed };
};

/**
 * Send push notification to multiple users
 */
export const sendPushToUsers = async (userIds: string[], payload: PushPayload) => {
  const results = await Promise.allSettled(
    userIds.map((userId) => sendPushToUser(userId, payload))
  );

  let totalSent = 0;
  let totalFailed = 0;

  results.forEach((result) => {
    if (result.status === 'fulfilled') {
      totalSent += result.value.sent;
      totalFailed += result.value.failed;
    }
  });

  return { sent: totalSent, failed: totalFailed };
};

/**
 * Get user's push subscriptions
 */
export const getUserSubscriptions = async (userId: string) => {
  return prisma.pushSubscription.findMany({
    where: { userId },
    select: {
      id: true,
      endpoint: true,
      createdAt: true,
    },
  });
};

/**
 * Check if user has push subscriptions
 */
export const hasPushEnabled = async (userId: string): Promise<boolean> => {
  const count = await prisma.pushSubscription.count({
    where: { userId },
  });
  return count > 0;
};
