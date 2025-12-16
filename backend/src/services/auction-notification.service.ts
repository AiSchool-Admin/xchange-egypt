/**
 * Auction Notification Service
 * خدمة إشعارات المزادات - البريد الإلكتروني والإشعارات الفورية
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// أنواع الإشعارات
export enum AuctionNotificationType {
  OUTBID = 'OUTBID',                      // تم تجاوز المزايدة
  AUCTION_WON = 'AUCTION_WON',            // الفوز بالمزاد
  AUCTION_LOST = 'AUCTION_LOST',          // خسارة المزاد
  AUCTION_ENDING = 'AUCTION_ENDING',      // المزاد على وشك الانتهاء
  AUCTION_STARTED = 'AUCTION_STARTED',    // بدء المزاد
  WATCHLIST_UPDATE = 'WATCHLIST_UPDATE',  // تحديث في قائمة المراقبة
  NEW_BID = 'NEW_BID',                    // مزايدة جديدة (للبائع)
  DEPOSIT_RECEIVED = 'DEPOSIT_RECEIVED',  // تم استلام الإيداع
  DEPOSIT_REFUNDED = 'DEPOSIT_REFUNDED',  // تم استرداد الإيداع
  DISPUTE_OPENED = 'DISPUTE_OPENED',      // فتح نزاع
  DISPUTE_RESOLVED = 'DISPUTE_RESOLVED',  // حل النزاع
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',    // استلام تقييم
  RESERVE_MET = 'RESERVE_MET',            // الوصول للسعر الاحتياطي
  BUY_NOW = 'BUY_NOW',                    // شراء فوري
}

// إعدادات الإشعارات
interface NotificationSettings {
  emailEnabled: boolean;
  pushEnabled: boolean;
  smsEnabled: boolean;
  emailOutbid: boolean;
  emailWon: boolean;
  emailLost: boolean;
  emailEnding: boolean;
  pushOutbid: boolean;
  pushWon: boolean;
  pushEnding: boolean;
}

// بيانات الإشعار
interface NotificationData {
  type: AuctionNotificationType;
  userId: string;
  auctionId: string;
  title: string;
  message: string;
  data?: Record<string, any>;
}

export class AuctionNotificationService {
  /**
   * إرسال إشعار
   */
  async sendNotification(notificationData: NotificationData): Promise<void> {
    try {
      const { type, userId, auctionId, title, message, data } = notificationData;

      // حفظ الإشعار في قاعدة البيانات
      await prisma.auctionNotification.create({
        data: {
          userId,
          auctionId,
          type,
          title,
          message,
          data: data || {},
          isRead: false,
        },
      });

      // جلب إعدادات الإشعارات للمستخدم
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { email: true, phone: true, fullName: true },
      });

      if (!user) return;

      // إرسال البريد الإلكتروني
      await this.sendEmailNotification(user.email, title, message, type);

      // إرسال إشعار فوري (WebSocket)
      await this.sendPushNotification(userId, { type, title, message, auctionId, data });

    } catch (error) {
      console.error('Error sending notification:', error);
    }
  }

  /**
   * إرسال إشعار البريد الإلكتروني
   */
  private async sendEmailNotification(
    email: string,
    subject: string,
    message: string,
    type: AuctionNotificationType
  ): Promise<void> {
    // في الإنتاج، استخدم خدمة بريد فعلية مثل SendGrid أو Mailgun
    console.log(`📧 Sending email to ${email}: ${subject}`);

    // قالب البريد الإلكتروني بناءً على النوع
    const emailTemplate = this.getEmailTemplate(type, subject, message);

    // TODO: تكامل مع خدمة البريد الإلكتروني
    // await sendgrid.send({
    //   to: email,
    //   from: 'noreply@xchange-egypt.com',
    //   subject: subject,
    //   html: emailTemplate,
    // });
  }

  /**
   * إرسال إشعار فوري عبر WebSocket
   */
  private async sendPushNotification(
    userId: string,
    notification: { type: string; title: string; message: string; auctionId: string; data?: any }
  ): Promise<void> {
    // TODO: تكامل مع WebSocket أو Firebase Cloud Messaging
    console.log(`🔔 Push notification to user ${userId}:`, notification.title);

    // يمكن استخدام Socket.IO أو أي حل WebSocket آخر
    // io.to(userId).emit('notification', notification);
  }

  /**
   * إشعار تجاوز المزايدة
   */
  async notifyOutbid(
    userId: string,
    auctionId: string,
    auctionTitle: string,
    newBidAmount: number,
    previousBidAmount: number
  ): Promise<void> {
    await this.sendNotification({
      type: AuctionNotificationType.OUTBID,
      userId,
      auctionId,
      title: 'تم تجاوز مزايدتك! ⚠️',
      message: `قام مستخدم آخر بتقديم عرض أعلى على "${auctionTitle}". السعر الحالي: ${newBidAmount.toLocaleString('ar-EG')} جنيه`,
      data: { newBidAmount, previousBidAmount },
    });
  }

  /**
   * إشعار الفوز بالمزاد
   */
  async notifyAuctionWon(
    userId: string,
    auctionId: string,
    auctionTitle: string,
    finalPrice: number
  ): Promise<void> {
    await this.sendNotification({
      type: AuctionNotificationType.AUCTION_WON,
      userId,
      auctionId,
      title: 'مبروك! لقد فزت بالمزاد 🎉',
      message: `لقد فزت بمزاد "${auctionTitle}" بسعر ${finalPrice.toLocaleString('ar-EG')} جنيه. يرجى إتمام عملية الدفع.`,
      data: { finalPrice },
    });
  }

  /**
   * إشعار اقتراب انتهاء المزاد
   */
  async notifyAuctionEnding(
    userId: string,
    auctionId: string,
    auctionTitle: string,
    minutesRemaining: number
  ): Promise<void> {
    await this.sendNotification({
      type: AuctionNotificationType.AUCTION_ENDING,
      userId,
      auctionId,
      title: 'المزاد على وشك الانتهاء! ⏰',
      message: `مزاد "${auctionTitle}" سينتهي خلال ${minutesRemaining} دقيقة. لا تفوت الفرصة!`,
      data: { minutesRemaining },
    });
  }

  /**
   * إشعار بدء المزاد
   */
  async notifyAuctionStarted(
    userId: string,
    auctionId: string,
    auctionTitle: string,
    startingPrice: number
  ): Promise<void> {
    await this.sendNotification({
      type: AuctionNotificationType.AUCTION_STARTED,
      userId,
      auctionId,
      title: 'بدأ المزاد! 🔔',
      message: `مزاد "${auctionTitle}" بدأ الآن. سعر البداية: ${startingPrice.toLocaleString('ar-EG')} جنيه`,
      data: { startingPrice },
    });
  }

  /**
   * إشعار مزايدة جديدة (للبائع)
   */
  async notifyNewBid(
    sellerId: string,
    auctionId: string,
    auctionTitle: string,
    bidAmount: number,
    totalBids: number
  ): Promise<void> {
    await this.sendNotification({
      type: AuctionNotificationType.NEW_BID,
      userId: sellerId,
      auctionId,
      title: 'مزايدة جديدة على مزادك! 💰',
      message: `تم تقديم عرض بقيمة ${bidAmount.toLocaleString('ar-EG')} جنيه على "${auctionTitle}". إجمالي المزايدات: ${totalBids}`,
      data: { bidAmount, totalBids },
    });
  }

  /**
   * إشعار الوصول للسعر الاحتياطي
   */
  async notifyReserveMet(
    sellerId: string,
    auctionId: string,
    auctionTitle: string,
    currentPrice: number
  ): Promise<void> {
    await this.sendNotification({
      type: AuctionNotificationType.RESERVE_MET,
      userId: sellerId,
      auctionId,
      title: 'تم الوصول للسعر الاحتياطي! ✅',
      message: `مزاد "${auctionTitle}" وصل للسعر الاحتياطي. السعر الحالي: ${currentPrice.toLocaleString('ar-EG')} جنيه`,
      data: { currentPrice },
    });
  }

  /**
   * إشعار استلام الإيداع
   */
  async notifyDepositReceived(
    userId: string,
    auctionId: string,
    auctionTitle: string,
    depositAmount: number
  ): Promise<void> {
    await this.sendNotification({
      type: AuctionNotificationType.DEPOSIT_RECEIVED,
      userId,
      auctionId,
      title: 'تم استلام الإيداع ✅',
      message: `تم تأكيد إيداعك بقيمة ${depositAmount.toLocaleString('ar-EG')} جنيه لمزاد "${auctionTitle}"`,
      data: { depositAmount },
    });
  }

  /**
   * إشعار فتح نزاع
   */
  async notifyDisputeOpened(
    userId: string,
    auctionId: string,
    auctionTitle: string,
    disputeId: string
  ): Promise<void> {
    await this.sendNotification({
      type: AuctionNotificationType.DISPUTE_OPENED,
      userId,
      auctionId,
      title: 'تم فتح نزاع ⚖️',
      message: `تم فتح نزاع على مزاد "${auctionTitle}". يرجى مراجعة التفاصيل والرد.`,
      data: { disputeId },
    });
  }

  /**
   * إشعار حل النزاع
   */
  async notifyDisputeResolved(
    userId: string,
    auctionId: string,
    auctionTitle: string,
    resolution: string
  ): Promise<void> {
    await this.sendNotification({
      type: AuctionNotificationType.DISPUTE_RESOLVED,
      userId,
      auctionId,
      title: 'تم حل النزاع ✅',
      message: `تم حل النزاع على مزاد "${auctionTitle}". القرار: ${resolution}`,
      data: { resolution },
    });
  }

  /**
   * إشعار استلام تقييم
   */
  async notifyReviewReceived(
    userId: string,
    auctionId: string,
    auctionTitle: string,
    rating: number
  ): Promise<void> {
    await this.sendNotification({
      type: AuctionNotificationType.REVIEW_RECEIVED,
      userId,
      auctionId,
      title: 'تقييم جديد ⭐',
      message: `حصلت على تقييم ${rating} نجوم على مزاد "${auctionTitle}"`,
      data: { rating },
    });
  }

  /**
   * إرسال إشعارات لمشتركي قائمة المراقبة
   */
  async notifyWatchlistSubscribers(
    auctionId: string,
    event: 'price_change' | 'ending_soon' | 'new_bid',
    data: Record<string, any>
  ): Promise<void> {
    try {
      const watchlistItems = await prisma.auctionWatchlist.findMany({
        where: {
          auctionId,
          ...(event === 'price_change' ? { notifyOnPriceChange: true } : {}),
          ...(event === 'ending_soon' ? { notifyBeforeEnd: true } : {}),
          ...(event === 'new_bid' ? { notifyOnNewBid: true } : {}),
        },
        include: {
          auction: {
            include: {
              listing: {
                include: { item: true },
              },
            },
          },
        },
      });

      const auctionTitle = watchlistItems[0]?.auction?.listing?.item?.title || 'مزاد';

      for (const item of watchlistItems) {
        let title = '';
        let message = '';

        switch (event) {
          case 'price_change':
            title = 'تغيير في السعر 📊';
            message = `تغير سعر "${auctionTitle}" إلى ${data.newPrice?.toLocaleString('ar-EG')} جنيه`;
            break;
          case 'ending_soon':
            title = 'المزاد يقترب من الانتهاء ⏰';
            message = `مزاد "${auctionTitle}" سينتهي قريباً!`;
            break;
          case 'new_bid':
            title = 'مزايدة جديدة 💰';
            message = `مزايدة جديدة على "${auctionTitle}": ${data.bidAmount?.toLocaleString('ar-EG')} جنيه`;
            break;
        }

        await this.sendNotification({
          type: AuctionNotificationType.WATCHLIST_UPDATE,
          userId: item.userId,
          auctionId,
          title,
          message,
          data,
        });
      }
    } catch (error) {
      console.error('Error notifying watchlist subscribers:', error);
    }
  }

  /**
   * جلب إشعارات المستخدم
   */
  async getUserNotifications(
    userId: string,
    options: { page?: number; limit?: number; unreadOnly?: boolean } = {}
  ) {
    const { page = 1, limit = 20, unreadOnly = false } = options;

    const where = {
      userId,
      ...(unreadOnly ? { isRead: false } : {}),
    };

    const [notifications, total] = await Promise.all([
      prisma.auctionNotification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          auction: {
            include: {
              listing: {
                include: { item: { select: { title: true, images: true } } },
              },
            },
          },
        },
      }),
      prisma.auctionNotification.count({ where }),
    ]);

    return {
      notifications,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * تحديد الإشعار كمقروء
   */
  async markAsRead(notificationId: string, userId: string): Promise<void> {
    await prisma.auctionNotification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * تحديد جميع الإشعارات كمقروءة
   */
  async markAllAsRead(userId: string): Promise<void> {
    await prisma.auctionNotification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
  }

  /**
   * عدد الإشعارات غير المقروءة
   */
  async getUnreadCount(userId: string): Promise<number> {
    return prisma.auctionNotification.count({
      where: { userId, isRead: false },
    });
  }

  /**
   * حذف إشعار
   */
  async deleteNotification(notificationId: string, userId: string): Promise<void> {
    await prisma.auctionNotification.deleteMany({
      where: { id: notificationId, userId },
    });
  }

  /**
   * حذف جميع إشعارات المستخدم
   */
  async clearAllNotifications(userId: string): Promise<void> {
    await prisma.auctionNotification.deleteMany({
      where: { userId },
    });
  }

  /**
   * الحصول على قالب البريد الإلكتروني
   */
  private getEmailTemplate(type: AuctionNotificationType, subject: string, message: string): string {
    return `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #7c3aed, #a855f7); padding: 30px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 24px;">🔨 سوق المزادات</h1>
    </div>
    <div style="padding: 30px;">
      <h2 style="color: #333; margin-top: 0;">${subject}</h2>
      <p style="color: #666; font-size: 16px; line-height: 1.6;">${message}</p>
      <div style="margin-top: 30px; text-align: center;">
        <a href="https://xchange-egypt.com/auctions" style="display: inline-block; background-color: #7c3aed; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; font-weight: bold;">عرض المزادات</a>
      </div>
    </div>
    <div style="background-color: #f9fafb; padding: 20px; text-align: center; color: #999; font-size: 12px;">
      <p>هذا البريد تم إرساله تلقائياً من منصة XChange Egypt</p>
      <p>لإلغاء الاشتراك في الإشعارات، قم بتحديث إعداداتك في حسابك</p>
    </div>
  </div>
</body>
</html>
    `;
  }
}

export const auctionNotificationService = new AuctionNotificationService();
