/**
 * Notification Dispatcher
 *
 * High-level service that dispatches notifications across multiple channels
 * (in-app, email, SMS, push) based on user preferences
 */

import * as notificationService from './notification.service';
import * as emailService from './email.service';
import { generateEmailTemplate } from '../utils/email-templates';
import prisma from '../lib/prisma';

// ============================================
// SMS Service
// ============================================

interface SMSResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send SMS using configured provider
 * Supports Twilio and local Egyptian providers
 */
const sendSMS = async (phone: string, message: string): Promise<SMSResponse> => {
  const provider = process.env.SMS_PROVIDER || 'twilio';

  try {
    if (provider === 'twilio') {
      // Twilio SMS
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_PHONE_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        console.warn('Twilio credentials not configured');
        return { success: false, error: 'SMS provider not configured' };
      }

      const response = await fetch(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: new URLSearchParams({
            To: phone,
            From: fromNumber,
            Body: message,
          }),
        }
      );

      const result: any = await response.json();

      if (response.ok) {
        console.log(`✅ SMS sent to ${phone}, SID: ${result.sid}`);
        return { success: true, messageId: result.sid };
      } else {
        console.error(`❌ SMS failed: ${result.message}`);
        return { success: false, error: result.message };
      }
    } else if (provider === 'victorylink') {
      // Victory Link (Egyptian provider)
      const apiKey = process.env.VICTORYLINK_API_KEY;
      const senderId = process.env.VICTORYLINK_SENDER_ID || 'Xchange';

      if (!apiKey) {
        return { success: false, error: 'VictoryLink API key not configured' };
      }

      const response = await fetch('https://smsmisr.com/api/v2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: process.env.VICTORYLINK_USERNAME,
          password: apiKey,
          sender: senderId,
          mobile: phone,
          message,
          language: 'arabic',
        }),
      });

      const result: any = await response.json();
      if (result.code === '1901') {
        return { success: true, messageId: result.job_id };
      }
      return { success: false, error: result.message };
    }

    return { success: false, error: 'Unknown SMS provider' };
  } catch (error: any) {
    console.error('SMS send error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Push Notification Service
// ============================================

interface PushResponse {
  success: boolean;
  successCount?: number;
  failureCount?: number;
  error?: string;
}

/**
 * Send push notification using Firebase Cloud Messaging
 */
const sendPushNotification = async (
  tokens: string[],
  title: string,
  body: string,
  data?: Record<string, any>
): Promise<PushResponse> => {
  const serverKey = process.env.FIREBASE_SERVER_KEY;

  if (!serverKey) {
    console.warn('Firebase server key not configured');
    return { success: false, error: 'Push notifications not configured' };
  }

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${serverKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registration_ids: tokens,
        notification: {
          title,
          body,
          sound: 'default',
          badge: 1,
        },
        data: {
          ...data,
          click_action: 'FLUTTER_NOTIFICATION_CLICK',
        },
        priority: 'high',
      }),
    });

    const result: any = await response.json();

    if (response.ok) {
      console.log(`✅ Push sent to ${tokens.length} devices, success: ${result.success}, failure: ${result.failure}`);
      return {
        success: result.success > 0,
        successCount: result.success,
        failureCount: result.failure,
      };
    } else {
      console.error(`❌ Push failed:`, result);
      return { success: false, error: result.error || 'FCM error' };
    }
  } catch (error: any) {
    console.error('Push notification error:', error);
    return { success: false, error: error.message };
  }
};

// ============================================
// Types
// ============================================

export interface DispatchNotificationInput {
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
  channels?: Array<'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH'>;
  emailSubject?: string;
  emailData?: Record<string, any>;
}

// ============================================
// Dispatcher
// ============================================

/**
 * Dispatch notification across multiple channels
 */
export const dispatch = async (input: DispatchNotificationInput): Promise<{
  inApp: boolean;
  email: boolean;
  sms: boolean;
  push: boolean;
}> => {
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
    channels = ['IN_APP', 'EMAIL'],
    emailSubject,
    emailData,
  } = input;

  const results = {
    inApp: false,
    email: false,
    sms: false,
    push: false,
  };

  // Get user preferences
  const preferences = await notificationService.getUserPreferences(userId);

  // Get user details for email
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      fullName: true,
    },
  });

  if (!user) {
    console.error(`User ${userId} not found`);
    return results;
  }

  // IN-APP notification
  if (
    channels.includes('IN_APP') &&
    (await notificationService.shouldNotifyUser(userId, type, 'IN_APP'))
  ) {
    try {
      await notificationService.createNotification({
        userId,
        type,
        title,
        message,
        priority,
        entityType,
        entityId,
        actionUrl,
        actionText,
        metadata,
      });
      results.inApp = true;
    } catch (error) {
      console.error('In-app notification failed:', error);
    }
  }

  // EMAIL notification
  if (
    channels.includes('EMAIL') &&
    (await notificationService.shouldNotifyUser(userId, type, 'EMAIL'))
  ) {
    try {
      const emailHtml = generateEmailTemplate(type, {
        userName: user.fullName,
        title,
        message,
        actionUrl,
        actionText,
        ...emailData,
      });

      await emailService.queueEmail({
        to: user.email,
        subject: emailSubject || title,
        html: emailHtml,
        text: message,
        userId,
        notificationType: type,
        entityType,
        entityId,
        priority,
      });
      results.email = true;
    } catch (error) {
      console.error('Email notification failed:', error);
    }
  }

  // SMS notification
  if (
    channels.includes('SMS') &&
    (await notificationService.shouldNotifyUser(userId, type, 'SMS'))
  ) {
    try {
      const userPhone = await prisma.user.findUnique({
        where: { id: userId },
        select: { phone: true },
      });

      if (userPhone?.phone && process.env.SMS_API_KEY) {
        // Send SMS using configured provider (Twilio or local provider)
        const smsResponse = await sendSMS(userPhone.phone, message);
        results.sms = smsResponse.success;
      } else if (!process.env.SMS_API_KEY) {
        console.log(`📱 SMS (Not Configured): To: ${userPhone?.phone}, Message: ${message.substring(0, 50)}...`);
      }
    } catch (error) {
      console.error('SMS notification failed:', error);
    }
  }

  // PUSH notification
  // Note: Push notifications require FCM token storage in database
  // For now, logging only - add pushToken table or fcmToken field to User model to enable
  if (
    channels.includes('PUSH') &&
    (await notificationService.shouldNotifyUser(userId, type, 'PUSH'))
  ) {
    try {
      if (!process.env.FIREBASE_SERVER_KEY) {
        console.log(`🔔 Push (Not Configured): Title: ${title}, Message: ${message.substring(0, 50)}...`);
      } else {
        // Push notifications ready - need FCM token storage to be implemented
        console.log(`🔔 Push (Token Storage Needed): User ${userId}, Title: ${title}`);
      }
    } catch (error) {
      console.error('Push notification failed:', error);
    }
  }

  return results;
};

/**
 * Dispatch to multiple users
 */
export const dispatchBulk = async (
  userIds: string[],
  input: Omit<DispatchNotificationInput, 'userId'>
): Promise<number> => {
  let successCount = 0;

  // Process in batches of 10
  const batchSize = 10;
  for (let i = 0; i < userIds.length; i += batchSize) {
    const batch = userIds.slice(i, i + batchSize);

    const promises = batch.map((userId) =>
      dispatch({ ...input, userId }).catch((error) => {
        console.error(`Failed to dispatch to user ${userId}:`, error);
        return null;
      })
    );

    const results = await Promise.all(promises);
    successCount += results.filter((r) => r !== null).length;
  }

  return successCount;
};

// ============================================
// Pre-built Notification Types
// ============================================

/**
 * Send auction bid notification
 */
export const notifyAuctionNewBid = async (
  sellerId: string,
  auctionId: string,
  bidderName: string,
  bidAmount: number
): Promise<void> => {
  await dispatch({
    userId: sellerId,
    type: 'AUCTION_NEW_BID',
    title: 'New Bid on Your Auction!',
    message: `${bidderName} placed a bid of ${bidAmount} EGP on your auction.`,
    priority: 'HIGH',
    entityType: 'auction',
    entityId: auctionId,
    actionUrl: `/auctions/${auctionId}`,
    actionText: 'View Auction',
    emailSubject: 'New Bid on Your Auction - Xchange',
    emailData: {
      bidderName,
      bidAmount,
      auctionId,
    },
  });
};

/**
 * Send outbid notification
 */
export const notifyOutbid = async (
  bidderId: string,
  auctionId: string,
  auctionTitle: string,
  newBidAmount: number
): Promise<void> => {
  await dispatch({
    userId: bidderId,
    type: 'AUCTION_OUTBID',
    title: 'You Were Outbid!',
    message: `Someone outbid you on "${auctionTitle}". New bid: ${newBidAmount} EGP.`,
    priority: 'HIGH',
    entityType: 'auction',
    entityId: auctionId,
    actionUrl: `/auctions/${auctionId}`,
    actionText: 'Place New Bid',
    emailSubject: 'You Were Outbid - Xchange',
    emailData: {
      auctionTitle,
      newBidAmount,
      auctionId,
    },
  });
};

/**
 * Send auction won notification
 */
export const notifyAuctionWon = async (
  winnerId: string,
  auctionId: string,
  auctionTitle: string,
  winningBid: number
): Promise<void> => {
  await dispatch({
    userId: winnerId,
    type: 'AUCTION_WON',
    title: 'Congratulations! You Won the Auction!',
    message: `You won the auction for "${auctionTitle}" with a bid of ${winningBid} EGP.`,
    priority: 'URGENT',
    entityType: 'auction',
    entityId: auctionId,
    actionUrl: `/auctions/${auctionId}`,
    actionText: 'Complete Purchase',
    emailSubject: 'You Won the Auction! - Xchange',
    emailData: {
      auctionTitle,
      winningBid,
      auctionId,
    },
  });
};

/**
 * Send reverse auction new request notification
 */
export const notifyReverseAuctionNewRequest = async (
  sellerId: string,
  requestId: string,
  requestTitle: string,
  maxBudget?: number
): Promise<void> => {
  await dispatch({
    userId: sellerId,
    type: 'REVERSE_AUCTION_NEW_REQUEST',
    title: 'New Buying Request!',
    message: `Someone is looking for: "${requestTitle}"${maxBudget ? ` (Budget: ${maxBudget} EGP)` : ''}`,
    priority: 'HIGH',
    entityType: 'reverse_auction',
    entityId: requestId,
    actionUrl: `/reverse-auctions/${requestId}`,
    actionText: 'Submit Bid',
    emailSubject: 'New Buying Request - Xchange',
    emailData: {
      requestTitle,
      maxBudget,
      requestId,
    },
  });
};

/**
 * Send reverse auction awarded notification
 */
export const notifyReverseAuctionAwarded = async (
  winnerId: string,
  requestId: string,
  requestTitle: string,
  winningBid: number
): Promise<void> => {
  await dispatch({
    userId: winnerId,
    type: 'REVERSE_AUCTION_AWARDED',
    title: 'Your Bid Was Accepted!',
    message: `Your bid of ${winningBid} EGP for "${requestTitle}" was accepted!`,
    priority: 'URGENT',
    entityType: 'reverse_auction',
    entityId: requestId,
    actionUrl: `/reverse-auctions/${requestId}`,
    actionText: 'View Details',
    emailSubject: 'Your Bid Was Accepted! - Xchange',
    emailData: {
      requestTitle,
      winningBid,
      requestId,
    },
  });
};

/**
 * Send barter offer notification
 */
export const notifyBarterOffer = async (
  recipientId: string,
  offerId: string,
  initiatorName: string,
  offeredItems: string[]
): Promise<void> => {
  await dispatch({
    userId: recipientId,
    type: 'BARTER_OFFER_RECEIVED',
    title: 'New Barter Offer!',
    message: `${initiatorName} wants to trade with you. They're offering: ${offeredItems.join(', ')}.`,
    priority: 'HIGH',
    entityType: 'barter',
    entityId: offerId,
    actionUrl: `/barter/respond/${offerId}`,
    actionText: 'View Offer',
    emailSubject: 'New Barter Offer - Xchange',
    emailData: {
      initiatorName,
      offeredItems,
      offerId,
    },
  });
};

/**
 * Send barter accepted notification
 */
export const notifyBarterAccepted = async (
  initiatorId: string,
  offerId: string,
  recipientName: string
): Promise<void> => {
  await dispatch({
    userId: initiatorId,
    type: 'BARTER_OFFER_ACCEPTED',
    title: 'Barter Offer Accepted!',
    message: `${recipientName} accepted your barter offer!`,
    priority: 'URGENT',
    entityType: 'barter',
    entityId: offerId,
    actionUrl: `/barter/respond/${offerId}`,
    actionText: 'View Details',
    emailSubject: 'Barter Offer Accepted! - Xchange',
    emailData: {
      recipientName,
      offerId,
    },
  });
};

/**
 * Send welcome email
 */
export const notifyUserWelcome = async (
  userId: string,
  userName: string
): Promise<void> => {
  await dispatch({
    userId,
    type: 'USER_WELCOME',
    title: 'Welcome to Xchange!',
    message: `Hi ${userName}! Welcome to Xchange, Egypt's most advanced trading platform.`,
    priority: 'MEDIUM',
    channels: ['IN_APP', 'EMAIL'],
    emailSubject: 'Welcome to Xchange!',
    emailData: {
      userName,
    },
  });
};

/**
 * Send review received notification
 */
export const notifyUserReviewReceived = async (
  userId: string,
  reviewId: string,
  transactionId: string,
  reviewerName: string,
  rating: number
): Promise<void> => {
  const stars = '⭐'.repeat(rating);
  await dispatch({
    userId,
    type: 'USER_REVIEW_RECEIVED',
    title: 'New Review Received',
    message: `${reviewerName} left you a ${rating}-star review: ${stars}`,
    priority: 'MEDIUM',
    entityType: 'review',
    entityId: reviewId,
    actionUrl: `/reviews/${reviewId}`,
    actionText: 'View Review',
    emailSubject: 'New Review Received - Xchange',
    emailData: {
      reviewerName,
      rating,
      stars,
      reviewId,
      transactionId,
    },
  });
};
