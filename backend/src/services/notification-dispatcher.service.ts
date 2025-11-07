/**
 * Notification Dispatcher
 *
 * High-level service that dispatches notifications across multiple channels
 * (in-app, email, SMS, push) based on user preferences
 */

import * as notificationService from './notification.service';
import * as emailService from './email.service';
import { generateEmailTemplate } from '../utils/email-templates';

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

  // SMS notification (future implementation)
  if (
    channels.includes('SMS') &&
    (await notificationService.shouldNotifyUser(userId, type, 'SMS'))
  ) {
    // TODO: Implement SMS service
    results.sms = false;
  }

  // PUSH notification (future implementation)
  if (
    channels.includes('PUSH') &&
    (await notificationService.shouldNotifyUser(userId, type, 'PUSH'))
  ) {
    // TODO: Implement push notification service
    results.push = false;
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
    actionUrl: `/barter/${offerId}`,
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
    actionUrl: `/barter/${offerId}`,
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

import prisma from '../lib/prisma';
