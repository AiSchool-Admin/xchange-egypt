import logger from '../lib/logger';
/**
 * WebSocket Match Alerts Service
 * خدمة تنبيهات المطابقة الفورية
 *
 * Real-time WebSocket notifications for:
 * - New item matches
 * - Price drops on watched items
 * - Barter chain opportunities
 * - Flash deal alerts
 * - Auction updates
 * - Follower activities
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import prisma from '../lib/prisma';

// ============================================
// Types
// ============================================

type AlertType =
  | 'NEW_MATCH'           // مطابقة جديدة
  | 'PRICE_DROP'          // انخفاض سعر
  | 'BARTER_CHAIN'        // فرصة سلسلة مقايضة
  | 'FLASH_DEAL'          // عرض خاطف
  | 'AUCTION_UPDATE'      // تحديث مزاد
  | 'AUCTION_ENDING'      // مزاد ينتهي قريباً
  | 'OUTBID'              // تم تجاوز عرضك
  | 'FOLLOWER_LISTING'    // إعلان من متابَع
  | 'WISHLIST_MATCH'      // تطابق قائمة الرغبات
  | 'TARGET_PRICE'        // وصول السعر المستهدف
  | 'ESCROW_UPDATE'       // تحديث الضمان
  | 'INSTALLMENT_DUE'     // قسط مستحق
  | 'DEAL_OPPORTUNITY';   // فرصة صفقة

interface MatchAlert {
  id: string;
  type: AlertType;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  imageUrl?: string;
  actionUrl: string;
  actionText: string;
  actionTextAr: string;
  metadata: Record<string, unknown>;
  expiresAt?: Date;
  createdAt: Date;
}

interface MatchAlertSubscription {
  userId: string;
  alertTypes: AlertType[];
  categoryIds?: string[];
  governorates?: string[];
  priceMin?: number;
  priceMax?: number;
  conditions?: string[];
}

// ============================================
// Socket.IO Instance
// ============================================

let io: SocketIOServer | null = null;

// User subscriptions map: userId -> subscription settings
const userSubscriptions: Map<string, MatchAlertSubscription> = new Map();

// User rooms: track which alert rooms each user is in
const userAlertRooms: Map<string, Set<string>> = new Map();

// ============================================
// Initialization
// ============================================

/**
 * Initialize the WebSocket match alerts service
 */
export function initializeMatchAlerts(socketIo: SocketIOServer): void {
  io = socketIo;

  logger.info('[MatchAlerts] Initializing WebSocket match alerts service');

  io.on('connection', (socket) => {
    const userId = socket.data.userId;

    if (!userId) return;

    logger.info(`[MatchAlerts] User ${userId} connected for alerts`);

    // Join user's personal alert room
    socket.join(`alerts:${userId}`);

    // Load user's subscription preferences
    loadUserSubscription(userId).then(subscription => {
      if (subscription) {
        userSubscriptions.set(userId, subscription);
        joinAlertRooms(socket, subscription);
      }
    });

    // ============================================
    // Alert Subscription Events
    // ============================================

    /**
     * Subscribe to specific alert types
     */
    socket.on('subscribe_alerts', async (data, callback) => {
      try {
        const subscription: MatchAlertSubscription = {
          userId,
          alertTypes: data.alertTypes || ['NEW_MATCH', 'PRICE_DROP', 'FLASH_DEAL'],
          categoryIds: data.categoryIds,
          governorates: data.governorates,
          priceMin: data.priceMin,
          priceMax: data.priceMax,
          conditions: data.conditions,
        };

        userSubscriptions.set(userId, subscription);
        await saveUserSubscription(userId, subscription);
        joinAlertRooms(socket, subscription);

        if (callback) callback({ success: true, subscription });
      } catch (error: unknown) {
        logger.error('[MatchAlerts] Error subscribing:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (callback) callback({ success: false, error: errorMessage });
      }
    });

    /**
     * Update subscription preferences
     */
    socket.on('update_alert_preferences', async (data, callback) => {
      try {
        const existing = userSubscriptions.get(userId) || {
          userId,
          alertTypes: [],
        };

        const updated: MatchAlertSubscription = {
          ...existing,
          ...data,
        };

        userSubscriptions.set(userId, updated);
        await saveUserSubscription(userId, updated);

        // Update room memberships
        leaveAlertRooms(socket, userId);
        joinAlertRooms(socket, updated);

        if (callback) callback({ success: true, subscription: updated });
      } catch (error: unknown) {
        logger.error('[MatchAlerts] Error updating preferences:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (callback) callback({ success: false, error: errorMessage });
      }
    });

    /**
     * Unsubscribe from alerts
     */
    socket.on('unsubscribe_alerts', async (data, callback) => {
      try {
        const alertTypes = data.alertTypes as AlertType[];

        const existing = userSubscriptions.get(userId);
        if (existing) {
          existing.alertTypes = existing.alertTypes.filter(t => !alertTypes.includes(t));
          userSubscriptions.set(userId, existing);
          await saveUserSubscription(userId, existing);
        }

        if (callback) callback({ success: true });
      } catch (error: unknown) {
        logger.error('[MatchAlerts] Error unsubscribing:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        if (callback) callback({ success: false, error: errorMessage });
      }
    });

    /**
     * Get current subscription
     */
    socket.on('get_alert_subscription', (data, callback) => {
      const subscription = userSubscriptions.get(userId);
      if (callback) callback({ success: true, subscription });
    });

    /**
     * Acknowledge alert (mark as seen)
     */
    socket.on('acknowledge_alert', async (data) => {
      try {
        const { alertId } = data;
        await markAlertAsSeen(userId, alertId);
      } catch (error) {
        logger.error('[MatchAlerts] Error acknowledging alert:', error);
      }
    });

    // Cleanup on disconnect
    socket.on('disconnect', () => {
      leaveAlertRooms(socket, userId);
    });
  });

  logger.info('[MatchAlerts] WebSocket match alerts service initialized');
}

// ============================================
// Room Management
// ============================================

function joinAlertRooms(socket: Socket, subscription: MatchAlertSubscription): void {
  const rooms = new Set<string>();

  // Join alert type rooms
  for (const alertType of subscription.alertTypes) {
    const room = `alert:type:${alertType}`;
    socket.join(room);
    rooms.add(room);
  }

  // Join category rooms
  if (subscription.categoryIds) {
    for (const categoryId of subscription.categoryIds) {
      const room = `alert:category:${categoryId}`;
      socket.join(room);
      rooms.add(room);
    }
  }

  // Join governorate rooms
  if (subscription.governorates) {
    for (const gov of subscription.governorates) {
      const room = `alert:gov:${gov}`;
      socket.join(room);
      rooms.add(room);
    }
  }

  userAlertRooms.set(subscription.userId, rooms);
}

function leaveAlertRooms(socket: Socket, userId: string): void {
  const rooms = userAlertRooms.get(userId);
  if (rooms) {
    for (const room of rooms) {
      socket.leave(room);
    }
    userAlertRooms.delete(userId);
  }
}

// ============================================
// Alert Sending Functions
// ============================================

/**
 * Send alert to specific user
 */
export function sendAlertToUser(userId: string, alert: MatchAlert): void {
  if (!io) return;

  // Check if user wants this type of alert
  const subscription = userSubscriptions.get(userId);
  if (subscription && !subscription.alertTypes.includes(alert.type)) {
    return;
  }

  io.to(`alerts:${userId}`).emit('match_alert', alert);

  // Store alert for later retrieval
  storeAlert(userId, alert).catch(err =>
    logger.error('[MatchAlerts] Error storing alert:', err)
  );
}

/**
 * Send alert to multiple users
 */
export function sendAlertToUsers(userIds: string[], alert: MatchAlert): void {
  for (const userId of userIds) {
    sendAlertToUser(userId, alert);
  }
}

/**
 * Broadcast alert to a room
 */
export function broadcastAlert(room: string, alert: MatchAlert): void {
  if (!io) return;

  io.to(room).emit('match_alert', alert);
}

/**
 * Send alert to all subscribers of an alert type
 */
export function sendAlertByType(alertType: AlertType, alert: MatchAlert): void {
  if (!io) return;

  io.to(`alert:type:${alertType}`).emit('match_alert', alert);
}

/**
 * Send alert to category subscribers
 */
export function sendCategoryAlert(categoryId: string, alert: MatchAlert): void {
  if (!io) return;

  io.to(`alert:category:${categoryId}`).emit('match_alert', alert);
}

/**
 * Send alert to governorate subscribers
 */
export function sendGovernorateAlert(governorate: string, alert: MatchAlert): void {
  if (!io) return;

  io.to(`alert:gov:${governorate}`).emit('match_alert', alert);
}

// ============================================
// Specific Alert Types
// ============================================

/**
 * Send new item match alert
 */
export async function sendNewMatchAlert(
  userId: string,
  itemId: string,
  matchReason: string,
  matchReasonAr: string
): Promise<void> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      category: { select: { nameAr: true, nameEn: true } },
      seller: { select: { fullName: true } },
    },
  });

  if (!item) return;

  const alert: MatchAlert = {
    id: generateAlertId(),
    type: 'NEW_MATCH',
    priority: 'MEDIUM',
    title: 'New Item Match!',
    titleAr: 'مطابقة جديدة! ✨',
    message: `"${item.title}" matches your interests`,
    messageAr: `"${item.title}" يطابق اهتماماتك`,
    imageUrl: item.images[0],
    actionUrl: `/items/${itemId}`,
    actionText: 'View Item',
    actionTextAr: 'عرض السلعة',
    metadata: {
      itemId,
      categoryId: item.categoryId,
      price: item.estimatedValue,
      condition: item.condition,
      governorate: item.governorate,
      matchReason,
      matchReasonAr,
    },
    createdAt: new Date(),
  };

  sendAlertToUser(userId, alert);
}

/**
 * Send price drop alert
 */
export async function sendPriceDropAlert(
  userIds: string[],
  itemId: string,
  oldPrice: number,
  newPrice: number
): Promise<void> {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) return;

  const dropPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

  const alert: MatchAlert = {
    id: generateAlertId(),
    type: 'PRICE_DROP',
    priority: 'HIGH',
    title: `Price Drop: ${dropPercent}% off!`,
    titleAr: `انخفاض السعر: ${dropPercent}% تخفيض!`,
    message: `"${item.title}" is now ${formatPrice(newPrice)}`,
    messageAr: `"${item.title}" الآن بسعر ${formatPrice(newPrice)} ج.م`,
    imageUrl: item.images[0],
    actionUrl: `/items/${itemId}`,
    actionText: 'Buy Now',
    actionTextAr: 'اشتري الآن',
    metadata: {
      itemId,
      oldPrice,
      newPrice,
      dropPercent,
    },
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
    createdAt: new Date(),
  };

  sendAlertToUsers(userIds, alert);

  // Also broadcast to category room
  if (item.categoryId) {
    sendCategoryAlert(item.categoryId, alert);
  }
}

/**
 * Send flash deal alert
 */
export async function sendFlashDealAlert(
  dealId: string,
  categoryId?: string
): Promise<void> {
  const deal = await prisma.flashDeal.findUnique({
    where: { id: dealId },
    include: {
      listing: {
        include: {
          item: true,
        },
      },
    },
  });

  if (!deal) return;

  const timeRemaining = Math.floor(
    (deal.endTime.getTime() - Date.now()) / (60 * 1000)
  );

  const alert: MatchAlert = {
    id: generateAlertId(),
    type: 'FLASH_DEAL',
    priority: 'HIGH',
    title: `⚡ Flash Deal: ${deal.discountPercent}% Off!`,
    titleAr: `⚡ عرض خاطف: ${deal.discountPercent}% خصم!`,
    message: `${deal.title} - Only ${deal.totalQuantity - deal.soldQuantity} left!`,
    messageAr: `${deal.title} - متبقي ${deal.totalQuantity - deal.soldQuantity} فقط!`,
    imageUrl: deal.listing.item.images[0],
    actionUrl: `/flash-deals/${dealId}`,
    actionText: 'Claim Now',
    actionTextAr: 'احجز الآن',
    metadata: {
      dealId,
      originalPrice: deal.originalPrice,
      dealPrice: deal.dealPrice,
      discountPercent: deal.discountPercent,
      timeRemaining,
      quantityLeft: deal.totalQuantity - deal.soldQuantity,
    },
    expiresAt: deal.endTime,
    createdAt: new Date(),
  };

  // Broadcast to flash deal subscribers
  sendAlertByType('FLASH_DEAL', alert);

  // Also send to category subscribers
  if (categoryId) {
    sendCategoryAlert(categoryId, alert);
  }
}

/**
 * Send auction update alert
 */
export async function sendAuctionAlert(
  auctionId: string,
  alertSubType: 'NEW_BID' | 'ENDING_SOON' | 'OUTBID' | 'WON' | 'LOST',
  targetUserIds?: string[]
): Promise<void> {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      listing: {
        include: { item: true },
      },
    },
  });

  if (!auction) return;

  const timeRemaining = Math.floor(
    (auction.endTime.getTime() - Date.now()) / (60 * 1000)
  );

  let alert: MatchAlert;

  switch (alertSubType) {
    case 'ENDING_SOON':
      alert = {
        id: generateAlertId(),
        type: 'AUCTION_ENDING',
        priority: 'HIGH',
        title: '⏰ Auction Ending Soon!',
        titleAr: '⏰ المزاد ينتهي قريباً!',
        message: `"${auction.listing.item.title}" ends in ${timeRemaining} minutes`,
        messageAr: `"${auction.listing.item.title}" ينتهي خلال ${timeRemaining} دقيقة`,
        imageUrl: auction.listing.item.images[0],
        actionUrl: `/auctions/${auctionId}`,
        actionText: 'Place Bid',
        actionTextAr: 'قدم عرضك',
        metadata: {
          auctionId,
          currentBid: auction.listing.currentBid,
          timeRemaining,
        },
        expiresAt: auction.endTime,
        createdAt: new Date(),
      };
      break;

    case 'OUTBID':
      alert = {
        id: generateAlertId(),
        type: 'OUTBID',
        priority: 'HIGH',
        title: '😮 You\'ve Been Outbid!',
        titleAr: '😮 تم تجاوز عرضك!',
        message: `New bid: ${formatPrice(auction.listing.currentBid)} on "${auction.listing.item.title}"`,
        messageAr: `عرض جديد: ${formatPrice(auction.listing.currentBid)} ج.م على "${auction.listing.item.title}"`,
        imageUrl: auction.listing.item.images[0],
        actionUrl: `/auctions/${auctionId}`,
        actionText: 'Bid Higher',
        actionTextAr: 'زِد عرضك',
        metadata: {
          auctionId,
          currentBid: auction.listing.currentBid,
          timeRemaining,
        },
        createdAt: new Date(),
      };
      break;

    default:
      alert = {
        id: generateAlertId(),
        type: 'AUCTION_UPDATE',
        priority: 'MEDIUM',
        title: 'Auction Update',
        titleAr: 'تحديث المزاد',
        message: `Update on "${auction.listing.item.title}"`,
        messageAr: `تحديث على "${auction.listing.item.title}"`,
        imageUrl: auction.listing.item.images[0],
        actionUrl: `/auctions/${auctionId}`,
        actionText: 'View',
        actionTextAr: 'عرض',
        metadata: {
          auctionId,
          alertSubType,
        },
        createdAt: new Date(),
      };
  }

  if (targetUserIds) {
    sendAlertToUsers(targetUserIds, alert);
  } else {
    sendAlertByType('AUCTION_UPDATE', alert);
  }
}

/**
 * Send barter chain opportunity alert
 */
export async function sendBarterChainAlert(
  userIds: string[],
  chainId: string,
  chainDescription: string
): Promise<void> {
  const alert: MatchAlert = {
    id: generateAlertId(),
    type: 'BARTER_CHAIN',
    priority: 'HIGH',
    title: '🔗 Barter Chain Found!',
    titleAr: '🔗 تم إيجاد سلسلة مقايضة!',
    message: chainDescription,
    messageAr: chainDescription,
    actionUrl: `/barter-chains/${chainId}`,
    actionText: 'View Chain',
    actionTextAr: 'عرض السلسلة',
    metadata: { chainId },
    expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000), // 48 hours
    createdAt: new Date(),
  };

  sendAlertToUsers(userIds, alert);
}

/**
 * Send follower new listing alert
 */
export async function sendFollowerListingAlert(
  followerId: string,
  sellerId: string,
  itemId: string
): Promise<void> {
  const [seller, item] = await Promise.all([
    prisma.user.findUnique({
      where: { id: sellerId },
      select: { fullName: true, avatar: true },
    }),
    prisma.item.findUnique({
      where: { id: itemId },
    }),
  ]);

  if (!seller || !item) return;

  const alert: MatchAlert = {
    id: generateAlertId(),
    type: 'FOLLOWER_LISTING',
    priority: 'MEDIUM',
    title: `${seller.fullName} posted a new item`,
    titleAr: `${seller.fullName} نشر سلعة جديدة`,
    message: item.title,
    messageAr: item.title,
    imageUrl: item.images[0],
    actionUrl: `/items/${itemId}`,
    actionText: 'View',
    actionTextAr: 'عرض',
    metadata: {
      sellerId,
      sellerName: seller.fullName,
      sellerAvatar: seller.avatar,
      itemId,
    },
    createdAt: new Date(),
  };

  sendAlertToUser(followerId, alert);
}

/**
 * Send installment due alert
 */
export async function sendInstallmentDueAlert(
  userId: string,
  installmentId: string,
  amount: number,
  dueDate: Date,
  daysUntilDue: number
): Promise<void> {
  const alert: MatchAlert = {
    id: generateAlertId(),
    type: 'INSTALLMENT_DUE',
    priority: daysUntilDue <= 3 ? 'HIGH' : 'MEDIUM',
    title: daysUntilDue <= 0
      ? '⚠️ Installment Overdue!'
      : `💳 Installment Due in ${daysUntilDue} Days`,
    titleAr: daysUntilDue <= 0
      ? '⚠️ قسط متأخر!'
      : `💳 قسط مستحق خلال ${daysUntilDue} أيام`,
    message: `Amount: ${formatPrice(amount)} EGP`,
    messageAr: `المبلغ: ${formatPrice(amount)} ج.م`,
    actionUrl: `/installments/${installmentId}`,
    actionText: 'Pay Now',
    actionTextAr: 'ادفع الآن',
    metadata: {
      installmentId,
      amount,
      dueDate: dueDate.toISOString(),
      daysUntilDue,
      isOverdue: daysUntilDue <= 0,
    },
    createdAt: new Date(),
  };

  sendAlertToUser(userId, alert);
}

// ============================================
// Storage Functions
// ============================================

async function loadUserSubscription(
  userId: string
): Promise<MatchAlertSubscription | null> {
  const prefs = await prisma.notificationPreference.findUnique({
    where: { userId },
  });

  if (!prefs) return null;

  // Parse stored preferences (you may need to add a field to NotificationPreference model)
  return {
    userId,
    alertTypes: ['NEW_MATCH', 'PRICE_DROP', 'FLASH_DEAL', 'AUCTION_UPDATE'],
    // Add more from stored prefs
  };
}

async function saveUserSubscription(
  userId: string,
  subscription: MatchAlertSubscription
): Promise<void> {
  // Store subscription preferences
  // You may need to add fields to NotificationPreference model
  await prisma.notificationPreference.upsert({
    where: { userId },
    update: {
      // Store subscription as JSON in a new field
    },
    create: {
      userId,
      // Default preferences
    },
  });
}

async function storeAlert(userId: string, alert: MatchAlert): Promise<void> {
  // Store alert in database for history
  // You could create an AlertHistory model for this
}

async function markAlertAsSeen(userId: string, alertId: string): Promise<void> {
  // Mark alert as seen in database
}

// ============================================
// Utility Functions
// ============================================

function generateAlertId(): string {
  return `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function formatPrice(price: number): string {
  return price.toLocaleString('ar-EG');
}

// ============================================
// Export Socket.IO instance getter
// ============================================

export function getSocketIO(): SocketIOServer | null {
  return io;
}
