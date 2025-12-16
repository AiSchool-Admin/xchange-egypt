/**
 * Auction Payment Service
 * خدمة المدفوعات للمزادات - الودائع والمعاملات المالية
 */

import { PrismaClient, AuctionDepositStatus } from '@prisma/client';
import { auctionNotificationService } from './auction-notification.service';

const prisma = new PrismaClient();

// طرق الدفع المدعومة
export enum PaymentMethod {
  CARD = 'CARD',           // بطاقة ائتمان/خصم
  FAWRY = 'FAWRY',         // فوري
  VODAFONE_CASH = 'VODAFONE_CASH', // فودافون كاش
  BANK_TRANSFER = 'BANK_TRANSFER', // تحويل بنكي
  WALLET = 'WALLET',       // محفظة المنصة
}

// حالة الدفع
export enum PaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  CANCELLED = 'CANCELLED',
}

// بيانات الدفع
interface PaymentData {
  amount: number;
  method: PaymentMethod;
  userId: string;
  auctionId: string;
  metadata?: Record<string, any>;
}

// نتيجة الدفع
interface PaymentResult {
  success: boolean;
  transactionId?: string;
  paymentUrl?: string;
  error?: string;
  status: PaymentStatus;
}

export class AuctionPaymentService {
  /**
   * إنشاء طلب دفع إيداع
   */
  async createDepositPayment(paymentData: PaymentData): Promise<PaymentResult> {
    try {
      const { amount, method, userId, auctionId, metadata } = paymentData;

      // التحقق من المزاد
      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: {
          listing: { include: { item: true } },
        },
      });

      if (!auction) {
        return { success: false, error: 'المزاد غير موجود', status: PaymentStatus.FAILED };
      }

      if (!auction.requiresDeposit) {
        return { success: false, error: 'هذا المزاد لا يتطلب إيداع', status: PaymentStatus.FAILED };
      }

      // التحقق من عدم وجود إيداع سابق
      const existingDeposit = await prisma.auctionDeposit.findUnique({
        where: {
          auctionId_userId: { auctionId, userId },
        },
      });

      if (existingDeposit && existingDeposit.status === 'PAID') {
        return { success: false, error: 'لديك إيداع مدفوع بالفعل لهذا المزاد', status: PaymentStatus.FAILED };
      }

      // حساب مبلغ الإيداع
      const requiredDeposit = auction.depositAmount ||
        (auction.depositPercentage ? (auction.startingPrice * auction.depositPercentage / 100) : 0);

      if (amount < requiredDeposit) {
        return { success: false, error: `مبلغ الإيداع يجب أن يكون ${requiredDeposit} جنيه على الأقل`, status: PaymentStatus.FAILED };
      }

      // إنشاء معاملة الدفع بناءً على طريقة الدفع
      let paymentResult: PaymentResult;

      switch (method) {
        case PaymentMethod.CARD:
          paymentResult = await this.processCardPayment(amount, userId, auctionId);
          break;
        case PaymentMethod.FAWRY:
          paymentResult = await this.processFawryPayment(amount, userId, auctionId);
          break;
        case PaymentMethod.VODAFONE_CASH:
          paymentResult = await this.processVodafoneCashPayment(amount, userId, auctionId);
          break;
        case PaymentMethod.BANK_TRANSFER:
          paymentResult = await this.processBankTransferPayment(amount, userId, auctionId);
          break;
        case PaymentMethod.WALLET:
          paymentResult = await this.processWalletPayment(amount, userId, auctionId);
          break;
        default:
          return { success: false, error: 'طريقة دفع غير مدعومة', status: PaymentStatus.FAILED };
      }

      if (paymentResult.success) {
        // إنشاء أو تحديث سجل الإيداع
        const deposit = await prisma.auctionDeposit.upsert({
          where: {
            auctionId_userId: { auctionId, userId },
          },
          create: {
            auctionId,
            userId,
            amount,
            status: 'PAID',
            paymentMethod: method,
            paymentReference: paymentResult.transactionId,
            paidAt: new Date(),
          },
          update: {
            amount,
            status: 'PAID',
            paymentMethod: method,
            paymentReference: paymentResult.transactionId,
            paidAt: new Date(),
          },
        });

        // إرسال إشعار
        const auctionTitle = auction.listing?.item?.title || 'المزاد';
        await auctionNotificationService.notifyDepositReceived(userId, auctionId, auctionTitle, amount);
      }

      return paymentResult;

    } catch (error: any) {
      console.error('Payment error:', error);
      return { success: false, error: error.message || 'حدث خطأ في عملية الدفع', status: PaymentStatus.FAILED };
    }
  }

  /**
   * معالجة الدفع بالبطاقة
   */
  private async processCardPayment(amount: number, userId: string, auctionId: string): Promise<PaymentResult> {
    // في الإنتاج، تكامل مع بوابة دفع مثل PayMob أو Paytabs
    console.log(`💳 Processing card payment: ${amount} EGP for user ${userId}`);

    // محاكاة إنشاء جلسة دفع
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // TODO: تكامل مع PayMob
    // const paymentSession = await paymob.createPaymentSession({
    //   amount: amount * 100, // بالقروش
    //   currency: 'EGP',
    //   orderId: transactionId,
    //   callbackUrl: `https://api.xchange-egypt.com/webhooks/paymob`,
    // });

    return {
      success: true,
      transactionId,
      paymentUrl: `https://accept.paymob.com/api/acceptance/iframes/12345?payment_token=${transactionId}`,
      status: PaymentStatus.COMPLETED,
    };
  }

  /**
   * معالجة الدفع عبر فوري
   */
  private async processFawryPayment(amount: number, userId: string, auctionId: string): Promise<PaymentResult> {
    console.log(`📱 Processing Fawry payment: ${amount} EGP for user ${userId}`);

    const fawryReference = `FW_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // TODO: تكامل مع Fawry Pay API
    // const fawryResponse = await fawryPay.createPaymentRequest({
    //   merchantRefNum: fawryReference,
    //   amount,
    //   paymentExpiry: Date.now() + 24 * 60 * 60 * 1000,
    // });

    return {
      success: true,
      transactionId: fawryReference,
      status: PaymentStatus.PENDING, // ينتظر الدفع في فرع فوري
    };
  }

  /**
   * معالجة الدفع عبر فودافون كاش
   */
  private async processVodafoneCashPayment(amount: number, userId: string, auctionId: string): Promise<PaymentResult> {
    console.log(`📱 Processing Vodafone Cash payment: ${amount} EGP for user ${userId}`);

    const vcashReference = `VC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // TODO: تكامل مع Vodafone Cash API

    return {
      success: true,
      transactionId: vcashReference,
      status: PaymentStatus.PENDING,
    };
  }

  /**
   * معالجة التحويل البنكي
   */
  private async processBankTransferPayment(amount: number, userId: string, auctionId: string): Promise<PaymentResult> {
    console.log(`🏦 Processing bank transfer: ${amount} EGP for user ${userId}`);

    const transferReference = `BT_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      transactionId: transferReference,
      status: PaymentStatus.PENDING, // ينتظر تأكيد التحويل
    };
  }

  /**
   * معالجة الدفع من المحفظة
   */
  private async processWalletPayment(amount: number, userId: string, auctionId: string): Promise<PaymentResult> {
    console.log(`👛 Processing wallet payment: ${amount} EGP for user ${userId}`);

    // التحقق من رصيد المحفظة
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { walletBalance: true },
    });

    if (!user || (user.walletBalance || 0) < amount) {
      return {
        success: false,
        error: 'رصيد المحفظة غير كافٍ',
        status: PaymentStatus.FAILED,
      };
    }

    // خصم المبلغ من المحفظة
    await prisma.user.update({
      where: { id: userId },
      data: {
        walletBalance: { decrement: amount },
      },
    });

    const walletTransactionId = `WL_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    return {
      success: true,
      transactionId: walletTransactionId,
      status: PaymentStatus.COMPLETED,
    };
  }

  /**
   * استرداد الإيداع
   */
  async refundDeposit(
    depositId: string,
    reason: string,
    adminId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const deposit = await prisma.auctionDeposit.findUnique({
        where: { id: depositId },
        include: {
          auction: {
            include: { listing: { include: { item: true } } },
          },
          user: true,
        },
      });

      if (!deposit) {
        return { success: false, error: 'الإيداع غير موجود' };
      }

      if (deposit.status !== 'PAID') {
        return { success: false, error: 'لا يمكن استرداد إيداع غير مدفوع' };
      }

      // استرداد المبلغ للمحفظة
      await prisma.user.update({
        where: { id: deposit.userId },
        data: {
          walletBalance: { increment: deposit.amount },
        },
      });

      // تحديث حالة الإيداع
      await prisma.auctionDeposit.update({
        where: { id: depositId },
        data: {
          status: 'REFUNDED',
          refundedAt: new Date(),
          refundReason: reason,
        },
      });

      // إرسال إشعار
      const auctionTitle = deposit.auction?.listing?.item?.title || 'المزاد';
      await auctionNotificationService.sendNotification({
        type: 'DEPOSIT_REFUNDED' as any,
        userId: deposit.userId,
        auctionId: deposit.auctionId,
        title: 'تم استرداد الإيداع 💰',
        message: `تم استرداد إيداعك بقيمة ${deposit.amount.toLocaleString('ar-EG')} جنيه لمزاد "${auctionTitle}"`,
        data: { amount: deposit.amount, reason },
      });

      return { success: true };

    } catch (error: any) {
      console.error('Refund error:', error);
      return { success: false, error: error.message || 'حدث خطأ في عملية الاسترداد' };
    }
  }

  /**
   * معالجة الدفع النهائي بعد الفوز
   */
  async processWinnerPayment(
    auctionId: string,
    winnerId: string,
    paymentMethod: PaymentMethod
  ): Promise<PaymentResult> {
    try {
      const auction = await prisma.auction.findUnique({
        where: { id: auctionId },
        include: {
          listing: { include: { item: true, user: true } },
        },
      });

      if (!auction) {
        return { success: false, error: 'المزاد غير موجود', status: PaymentStatus.FAILED };
      }

      if (auction.winnerId !== winnerId) {
        return { success: false, error: 'أنت لست الفائز بهذا المزاد', status: PaymentStatus.FAILED };
      }

      const finalAmount = auction.currentPrice;

      // خصم الإيداع إن وجد
      let amountToPay = finalAmount;
      const deposit = await prisma.auctionDeposit.findUnique({
        where: {
          auctionId_userId: { auctionId, userId: winnerId },
        },
      });

      if (deposit && deposit.status === 'PAID') {
        amountToPay -= deposit.amount;

        // تحديث حالة الإيداع
        await prisma.auctionDeposit.update({
          where: { id: deposit.id },
          data: { status: 'USED' },
        });
      }

      // معالجة الدفع المتبقي
      const paymentResult = await this.createDepositPayment({
        amount: amountToPay,
        method: paymentMethod,
        userId: winnerId,
        auctionId,
        metadata: { type: 'FINAL_PAYMENT', originalAmount: finalAmount, depositUsed: deposit?.amount || 0 },
      });

      return paymentResult;

    } catch (error: any) {
      console.error('Winner payment error:', error);
      return { success: false, error: error.message, status: PaymentStatus.FAILED };
    }
  }

  /**
   * الحصول على طرق الدفع المتاحة
   */
  getAvailablePaymentMethods(): { method: PaymentMethod; label: string; icon: string; fees: number }[] {
    return [
      { method: PaymentMethod.CARD, label: 'بطاقة ائتمان/خصم', icon: '💳', fees: 2.5 },
      { method: PaymentMethod.FAWRY, label: 'فوري', icon: '📱', fees: 0 },
      { method: PaymentMethod.VODAFONE_CASH, label: 'فودافون كاش', icon: '📲', fees: 1 },
      { method: PaymentMethod.BANK_TRANSFER, label: 'تحويل بنكي', icon: '🏦', fees: 0 },
      { method: PaymentMethod.WALLET, label: 'محفظة المنصة', icon: '👛', fees: 0 },
    ];
  }

  /**
   * التحقق من حالة الدفع
   */
  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    // TODO: التحقق من حالة الدفع من بوابة الدفع
    console.log(`Checking payment status for: ${transactionId}`);
    return PaymentStatus.COMPLETED;
  }
}

export const auctionPaymentService = new AuctionPaymentService();
