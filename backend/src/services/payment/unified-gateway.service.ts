/**
 * Unified Payment Gateway Service
 * بوابة الدفع الموحدة - تجمع كل وسائل الدفع المصرية
 *
 * Supported Payment Methods:
 * - Fawry (Cash at retail stores + Online)
 * - Paymob (Cards, Wallets, Kiosk, ValU)
 * - Vodafone Cash (Mobile wallet)
 * - InstaPay (Bank transfers)
 *
 * Features:
 * - Unified API for all payment methods
 * - Automatic retry with fallback
 * - Transaction logging
 * - Webhook handling
 */

import { fawryService, FawryPaymentResponse } from './fawry.service';
import { paymobService, PaymobPaymentResult, PaymobCustomer, PaymobOrderItem } from './paymob.service';
import { vodafoneCashService, VodafoneCashPaymentResponse } from './vodafonecash.service';
import { instapayService, InstaPayPaymentResponse } from './instapay.service';

// Payment method types
export enum PaymentMethod {
  FAWRY = 'fawry',
  FAWRY_CASH = 'fawry_cash',
  PAYMOB_CARD = 'paymob_card',
  PAYMOB_WALLET = 'paymob_wallet',
  PAYMOB_KIOSK = 'paymob_kiosk',
  PAYMOB_VALU = 'paymob_valu',
  VODAFONE_CASH = 'vodafone_cash',
  INSTAPAY = 'instapay',
  CASH_ON_DELIVERY = 'cod',
  WALLET = 'wallet', // Internal Xchange wallet
}

// Unified payment status
export enum UnifiedPaymentStatus {
  INITIATED = 'INITIATED',
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

// Interfaces
export interface UnifiedPaymentRequest {
  orderId: string;
  amount: number;
  currency?: string;
  method: PaymentMethod;
  customer: CustomerInfo;
  items?: PaymentItem[];
  metadata?: Record<string, any>;
  // Method-specific options
  walletPhone?: string; // For mobile wallets
  cardToken?: string; // For saved cards
  installments?: number; // For ValU
}

export interface CustomerInfo {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address?: {
    street?: string;
    city?: string;
    governorate?: string;
    postalCode?: string;
  };
}

export interface PaymentItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  category?: string;
}

export interface UnifiedPaymentResponse {
  success: boolean;
  transactionId?: string;
  orderId: string;
  method: PaymentMethod;
  status: UnifiedPaymentStatus;
  amount: number;
  currency: string;
  message: string;
  messageAr: string;
  // Method-specific responses
  paymentUrl?: string; // Redirect URL for card payments
  iframeUrl?: string; // Paymob iframe
  referenceNumber?: string; // Fawry/Kiosk reference
  walletRedirectUrl?: string; // Wallet redirect
  qrCode?: string; // QR code for mobile payment
  expiresAt?: Date;
  instructions?: string[];
  rawResponse?: any;
}

export interface UnifiedRefundRequest {
  transactionId: string;
  amount?: number; // If not specified, full refund
  reason?: string;
  method: PaymentMethod;
}

export interface UnifiedRefundResponse {
  success: boolean;
  refundId?: string;
  originalTransactionId: string;
  amount: number;
  status: UnifiedPaymentStatus;
  message: string;
}

export interface PaymentStatusResponse {
  success: boolean;
  transactionId: string;
  orderId?: string;
  status: UnifiedPaymentStatus;
  amount: number;
  method: PaymentMethod;
  paidAt?: Date;
  message: string;
}

// Payment method configuration
export interface PaymentMethodConfig {
  enabled: boolean;
  displayName: string;
  displayNameAr: string;
  description: string;
  descriptionAr: string;
  icon: string;
  minAmount?: number;
  maxAmount?: number;
  fees?: {
    fixed?: number;
    percentage?: number;
  };
  processingTime?: string;
}

export const PAYMENT_METHODS_CONFIG: Record<PaymentMethod, PaymentMethodConfig> = {
  [PaymentMethod.FAWRY]: {
    enabled: true,
    displayName: 'Fawry',
    displayNameAr: 'فوري',
    description: 'Pay online with Fawry',
    descriptionAr: 'ادفع أونلاين عبر فوري',
    icon: 'fawry',
    minAmount: 1,
    maxAmount: 50000,
    fees: { fixed: 5, percentage: 2.5 },
    processingTime: 'Instant',
  },
  [PaymentMethod.FAWRY_CASH]: {
    enabled: true,
    displayName: 'Fawry Cash',
    displayNameAr: 'فوري كاش',
    description: 'Pay at any Fawry retail store',
    descriptionAr: 'ادفع في أي منفذ فوري',
    icon: 'fawry',
    minAmount: 10,
    maxAmount: 10000,
    fees: { fixed: 5 },
    processingTime: 'Up to 24 hours',
  },
  [PaymentMethod.PAYMOB_CARD]: {
    enabled: true,
    displayName: 'Credit/Debit Card',
    displayNameAr: 'بطاقة ائتمان/خصم',
    description: 'Pay with Visa or Mastercard',
    descriptionAr: 'ادفع بفيزا أو ماستركارد',
    icon: 'card',
    minAmount: 1,
    maxAmount: 100000,
    fees: { percentage: 2.75 },
    processingTime: 'Instant',
  },
  [PaymentMethod.PAYMOB_WALLET]: {
    enabled: true,
    displayName: 'Mobile Wallet',
    displayNameAr: 'محفظة إلكترونية',
    description: 'Pay with any mobile wallet',
    descriptionAr: 'ادفع بأي محفظة إلكترونية',
    icon: 'wallet',
    minAmount: 1,
    maxAmount: 30000,
    fees: { percentage: 1.5 },
    processingTime: 'Instant',
  },
  [PaymentMethod.PAYMOB_KIOSK]: {
    enabled: true,
    displayName: 'Aman/Masary',
    displayNameAr: 'أمان/مصاري',
    description: 'Pay at Aman or Masary outlets',
    descriptionAr: 'ادفع في منافذ أمان أو مصاري',
    icon: 'kiosk',
    minAmount: 10,
    maxAmount: 5000,
    fees: { fixed: 5 },
    processingTime: 'Up to 24 hours',
  },
  [PaymentMethod.PAYMOB_VALU]: {
    enabled: true,
    displayName: 'ValU Installments',
    displayNameAr: 'تقسيط فاليو',
    description: 'Buy now, pay later with ValU',
    descriptionAr: 'اشتري الآن وادفع لاحقاً مع فاليو',
    icon: 'valu',
    minAmount: 500,
    maxAmount: 50000,
    fees: { percentage: 0 },
    processingTime: 'Instant',
  },
  [PaymentMethod.VODAFONE_CASH]: {
    enabled: true,
    displayName: 'Vodafone Cash',
    displayNameAr: 'فودافون كاش',
    description: 'Pay with Vodafone Cash wallet',
    descriptionAr: 'ادفع بمحفظة فودافون كاش',
    icon: 'vodafone',
    minAmount: 1,
    maxAmount: 30000,
    fees: { percentage: 1 },
    processingTime: 'Instant',
  },
  [PaymentMethod.INSTAPAY]: {
    enabled: true,
    displayName: 'InstaPay',
    displayNameAr: 'إنستاباي',
    description: 'Bank transfer via InstaPay',
    descriptionAr: 'تحويل بنكي عبر إنستاباي',
    icon: 'instapay',
    minAmount: 1,
    maxAmount: 100000,
    fees: { fixed: 0 },
    processingTime: 'Instant',
  },
  [PaymentMethod.CASH_ON_DELIVERY]: {
    enabled: true,
    displayName: 'Cash on Delivery',
    displayNameAr: 'الدفع عند الاستلام',
    description: 'Pay when you receive your order',
    descriptionAr: 'ادفع عند استلام طلبك',
    icon: 'cod',
    minAmount: 1,
    maxAmount: 10000,
    fees: { fixed: 20 },
    processingTime: 'On delivery',
  },
  [PaymentMethod.WALLET]: {
    enabled: true,
    displayName: 'Xchange Wallet',
    displayNameAr: 'محفظة إكسشينج',
    description: 'Pay with your Xchange wallet balance',
    descriptionAr: 'ادفع من رصيد محفظتك',
    icon: 'xchange-wallet',
    minAmount: 1,
    maxAmount: 50000,
    fees: { percentage: 0 },
    processingTime: 'Instant',
  },
};

// Main Unified Gateway Class
export class UnifiedPaymentGateway {
  /**
   * Get available payment methods
   * الحصول على وسائل الدفع المتاحة
   */
  getAvailablePaymentMethods(amount?: number): PaymentMethodConfig[] {
    const methods = Object.entries(PAYMENT_METHODS_CONFIG)
      .filter(([_, config]) => {
        if (!config.enabled) return false;
        if (amount) {
          if (config.minAmount && amount < config.minAmount) return false;
          if (config.maxAmount && amount > config.maxAmount) return false;
        }
        return true;
      })
      .map(([method, config]) => ({
        method: method as PaymentMethod,
        ...config,
      }));

    return methods;
  }

  /**
   * Calculate payment fees
   * حساب رسوم الدفع
   */
  calculateFees(amount: number, method: PaymentMethod): number {
    const config = PAYMENT_METHODS_CONFIG[method];
    if (!config || !config.fees) return 0;

    let fees = 0;
    if (config.fees.fixed) {
      fees += config.fees.fixed;
    }
    if (config.fees.percentage) {
      fees += (amount * config.fees.percentage) / 100;
    }

    return Math.round(fees * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Initiate payment
   * بدء عملية الدفع
   */
  async initiatePayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    const { method, orderId, amount, customer, items } = request;
    const currency = request.currency || 'EGP';

    // Validate amount against method limits
    const config = PAYMENT_METHODS_CONFIG[method];
    if (!config || !config.enabled) {
      return {
        success: false,
        orderId,
        method,
        status: UnifiedPaymentStatus.FAILED,
        amount,
        currency,
        message: 'Payment method not available',
        messageAr: 'وسيلة الدفع غير متاحة',
      };
    }

    if (config.minAmount && amount < config.minAmount) {
      return {
        success: false,
        orderId,
        method,
        status: UnifiedPaymentStatus.FAILED,
        amount,
        currency,
        message: `Minimum amount is ${config.minAmount} ${currency}`,
        messageAr: `الحد الأدنى للمبلغ ${config.minAmount} ${currency}`,
      };
    }

    if (config.maxAmount && amount > config.maxAmount) {
      return {
        success: false,
        orderId,
        method,
        status: UnifiedPaymentStatus.FAILED,
        amount,
        currency,
        message: `Maximum amount is ${config.maxAmount} ${currency}`,
        messageAr: `الحد الأقصى للمبلغ ${config.maxAmount} ${currency}`,
      };
    }

    try {
      switch (method) {
        case PaymentMethod.FAWRY:
        case PaymentMethod.FAWRY_CASH:
          return await this.handleFawryPayment(request);

        case PaymentMethod.PAYMOB_CARD:
          return await this.handlePaymobCardPayment(request);

        case PaymentMethod.PAYMOB_WALLET:
          return await this.handlePaymobWalletPayment(request);

        case PaymentMethod.PAYMOB_KIOSK:
          return await this.handlePaymobKioskPayment(request);

        case PaymentMethod.VODAFONE_CASH:
          return await this.handleVodafoneCashPayment(request);

        case PaymentMethod.INSTAPAY:
          return await this.handleInstaPayPayment(request);

        case PaymentMethod.CASH_ON_DELIVERY:
          return this.handleCashOnDelivery(request);

        case PaymentMethod.WALLET:
          return await this.handleWalletPayment(request);

        default:
          return {
            success: false,
            orderId,
            method,
            status: UnifiedPaymentStatus.FAILED,
            amount,
            currency,
            message: 'Unsupported payment method',
            messageAr: 'وسيلة دفع غير مدعومة',
          };
      }
    } catch (error) {
      console.error(`Payment error for ${method}:`, error);
      return {
        success: false,
        orderId,
        method,
        status: UnifiedPaymentStatus.FAILED,
        amount,
        currency,
        message: error instanceof Error ? error.message : 'Payment failed',
        messageAr: 'فشلت عملية الدفع',
      };
    }
  }

  /**
   * Handle Fawry payment
   */
  private async handleFawryPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    const fawryItems = (request.items || []).map((item) => ({
      itemId: item.id || `item-${Date.now()}`,
      description: item.name,
      price: item.unitPrice,
      quantity: item.quantity,
    }));

    // If no items provided, create a single item for the full amount
    if (fawryItems.length === 0) {
      fawryItems.push({
        itemId: `order-${request.orderId}`,
        description: `طلب رقم ${request.orderId}`,
        price: request.amount,
        quantity: 1,
      });
    }

    const result: FawryPaymentResponse = await fawryService.createPayment(
      request.orderId,
      request.amount,
      {
        email: request.customer.email,
        phone: request.customer.phone,
        name: `${request.customer.firstName} ${request.customer.lastName}`,
      }
    );

    if (result.success) {
      return {
        success: true,
        transactionId: result.fawryRefNumber,
        orderId: request.orderId,
        method: request.method,
        status: UnifiedPaymentStatus.PENDING,
        amount: request.amount,
        currency: request.currency || 'EGP',
        message: 'Payment initiated successfully',
        messageAr: 'تم بدء عملية الدفع بنجاح',
        referenceNumber: result.fawryRefNumber,
        paymentUrl: result.paymentUrl,
        expiresAt: result.expiryDate ? new Date(result.expiryDate) : undefined,
        instructions:
          request.method === PaymentMethod.FAWRY_CASH
            ? [
                `رقم المرجع: ${result.fawryRefNumber}`,
                'توجه لأي منفذ فوري',
                'أخبرهم أنك تريد الدفع لفوري Pay',
                'أعطهم رقم المرجع',
              ]
            : undefined,
      };
    }

    return {
      success: false,
      orderId: request.orderId,
      method: request.method,
      status: UnifiedPaymentStatus.FAILED,
      amount: request.amount,
      currency: request.currency || 'EGP',
      message: result.message || 'Payment failed',
      messageAr: result.message || 'فشلت عملية الدفع',
    };
  }

  /**
   * Handle Paymob card payment
   */
  private async handlePaymobCardPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    const customer: PaymobCustomer = {
      firstName: request.customer.firstName,
      lastName: request.customer.lastName,
      email: request.customer.email,
      phone: request.customer.phone,
      street: request.customer.address?.street,
      city: request.customer.address?.city,
      state: request.customer.address?.governorate,
      country: 'EG',
      postalCode: request.customer.address?.postalCode,
    };

    const items: PaymobOrderItem[] = (request.items || []).map((item) => ({
      name: item.name,
      amount: item.unitPrice * 100, // Convert to piasters
      description: item.description,
      quantity: item.quantity,
    }));

    if (items.length === 0) {
      items.push({
        name: `طلب رقم ${request.orderId}`,
        amount: request.amount * 100,
        description: `دفع لطلب ${request.orderId}`,
        quantity: 1,
      });
    }

    const result: PaymobPaymentResult = await paymobService.initiateCardPayment({
      orderId: request.orderId,
      amount: request.amount * 100, // Convert to piasters
      currency: request.currency || 'EGP',
      customer,
      items,
      paymentType: 'card' as any,
    });

    if (result.success) {
      return {
        success: true,
        transactionId: result.orderId,
        orderId: request.orderId,
        method: request.method,
        status: UnifiedPaymentStatus.PENDING,
        amount: request.amount,
        currency: request.currency || 'EGP',
        message: 'Redirect to payment page',
        messageAr: 'سيتم تحويلك لصفحة الدفع',
        paymentUrl: result.paymentUrl,
        iframeUrl: result.iframeUrl,
      };
    }

    return {
      success: false,
      orderId: request.orderId,
      method: request.method,
      status: UnifiedPaymentStatus.FAILED,
      amount: request.amount,
      currency: request.currency || 'EGP',
      message: result.message,
      messageAr: result.message,
    };
  }

  /**
   * Handle Paymob wallet payment
   */
  private async handlePaymobWalletPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    if (!request.walletPhone) {
      return {
        success: false,
        orderId: request.orderId,
        method: request.method,
        status: UnifiedPaymentStatus.FAILED,
        amount: request.amount,
        currency: request.currency || 'EGP',
        message: 'Wallet phone number is required',
        messageAr: 'رقم هاتف المحفظة مطلوب',
      };
    }

    const customer: PaymobCustomer = {
      firstName: request.customer.firstName,
      lastName: request.customer.lastName,
      email: request.customer.email,
      phone: request.customer.phone,
    };

    const items: PaymobOrderItem[] = [
      {
        name: `طلب رقم ${request.orderId}`,
        amount: request.amount * 100,
        description: `دفع لطلب ${request.orderId}`,
        quantity: 1,
      },
    ];

    const result = await paymobService.initiateWalletPayment(
      {
        orderId: request.orderId,
        amount: request.amount * 100,
        currency: request.currency || 'EGP',
        customer,
        items,
        paymentType: 'wallet' as any,
      },
      request.walletPhone
    );

    if (result.success) {
      return {
        success: true,
        transactionId: result.orderId,
        orderId: request.orderId,
        method: request.method,
        status: UnifiedPaymentStatus.PENDING,
        amount: request.amount,
        currency: request.currency || 'EGP',
        message: 'Payment request sent to wallet',
        messageAr: 'تم إرسال طلب الدفع للمحفظة',
        walletRedirectUrl: result.walletRedirectUrl,
      };
    }

    return {
      success: false,
      orderId: request.orderId,
      method: request.method,
      status: UnifiedPaymentStatus.FAILED,
      amount: request.amount,
      currency: request.currency || 'EGP',
      message: result.message,
      messageAr: result.message,
    };
  }

  /**
   * Handle Paymob kiosk payment
   */
  private async handlePaymobKioskPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    const customer: PaymobCustomer = {
      firstName: request.customer.firstName,
      lastName: request.customer.lastName,
      email: request.customer.email,
      phone: request.customer.phone,
    };

    const items: PaymobOrderItem[] = [
      {
        name: `طلب رقم ${request.orderId}`,
        amount: request.amount * 100,
        description: `دفع لطلب ${request.orderId}`,
        quantity: 1,
      },
    ];

    const result = await paymobService.initiateKioskPayment({
      orderId: request.orderId,
      amount: request.amount * 100,
      currency: request.currency || 'EGP',
      customer,
      items,
      paymentType: 'kiosk' as any,
    });

    if (result.success) {
      return {
        success: true,
        transactionId: result.orderId,
        orderId: request.orderId,
        method: request.method,
        status: UnifiedPaymentStatus.PENDING,
        amount: request.amount,
        currency: request.currency || 'EGP',
        message: `Reference number: ${result.kioskReference}`,
        messageAr: `رقم المرجع: ${result.kioskReference}`,
        referenceNumber: result.kioskReference,
        instructions: [
          `رقم المرجع: ${result.kioskReference}`,
          'توجه لأي منفذ أمان أو مصاري',
          'أخبرهم أنك تريد دفع فاتورة',
          'أعطهم رقم المرجع',
        ],
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      };
    }

    return {
      success: false,
      orderId: request.orderId,
      method: request.method,
      status: UnifiedPaymentStatus.FAILED,
      amount: request.amount,
      currency: request.currency || 'EGP',
      message: result.message,
      messageAr: result.message,
    };
  }

  /**
   * Handle Vodafone Cash payment
   */
  private async handleVodafoneCashPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    const result: VodafoneCashPaymentResponse = await vodafoneCashService.initiatePayment({
      orderId: request.orderId,
      amount: request.amount,
      customerPhone: request.walletPhone || request.customer.phone,
      description: `دفع لطلب ${request.orderId}`,
    });

    if (result.success) {
      return {
        success: true,
        transactionId: result.transactionId,
        orderId: request.orderId,
        method: request.method,
        status: UnifiedPaymentStatus.PENDING,
        amount: request.amount,
        currency: request.currency || 'EGP',
        message: 'Payment request sent',
        messageAr: 'تم إرسال طلب الدفع',
        referenceNumber: result.referenceNumber,
        expiresAt: result.expiresAt,
        instructions: ['ستصلك رسالة نصية من فودافون كاش', 'قم بتأكيد الدفع من خلال الرسالة', 'أو افتح تطبيق فودافون كاش'],
      };
    }

    return {
      success: false,
      orderId: request.orderId,
      method: request.method,
      status: UnifiedPaymentStatus.FAILED,
      amount: request.amount,
      currency: request.currency || 'EGP',
      message: result.message,
      messageAr: result.message,
    };
  }

  /**
   * Handle InstaPay payment
   */
  private async handleInstaPayPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    const result: InstaPayPaymentResponse = await instapayService.initiatePayment(
      request.orderId,
      request.amount,
      {
        email: request.customer.email,
        phone: request.customer.phone,
        name: `${request.customer.firstName} ${request.customer.lastName}`,
      }
    );

    if (result.success) {
      return {
        success: true,
        transactionId: result.transactionId,
        orderId: request.orderId,
        method: request.method,
        status: UnifiedPaymentStatus.PENDING,
        amount: request.amount,
        currency: request.currency || 'EGP',
        message: 'Bank transfer details generated',
        messageAr: 'تم إنشاء بيانات التحويل البنكي',
        referenceNumber: result.referenceNumber,
        paymentUrl: result.paymentUrl,
        instructions: [
          'افتح تطبيق البنك الخاص بك',
          'اختر InstaPay',
          `حول المبلغ ${request.amount} جنيه`,
          `استخدم رقم المرجع: ${result.referenceNumber}`,
        ],
      };
    }

    return {
      success: false,
      orderId: request.orderId,
      method: request.method,
      status: UnifiedPaymentStatus.FAILED,
      amount: request.amount,
      currency: request.currency || 'EGP',
      message: result.message,
      messageAr: result.message,
    };
  }

  /**
   * Handle Cash on Delivery
   */
  private handleCashOnDelivery(request: UnifiedPaymentRequest): UnifiedPaymentResponse {
    const referenceNumber = `COD${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    return {
      success: true,
      transactionId: referenceNumber,
      orderId: request.orderId,
      method: request.method,
      status: UnifiedPaymentStatus.PENDING,
      amount: request.amount,
      currency: request.currency || 'EGP',
      message: 'Cash on delivery order confirmed',
      messageAr: 'تم تأكيد الطلب - الدفع عند الاستلام',
      referenceNumber,
      instructions: [
        'سيتم التواصل معك لتأكيد موعد التسليم',
        'جهز المبلغ نقداً عند الاستلام',
        `المبلغ المطلوب: ${request.amount} جنيه`,
      ],
    };
  }

  /**
   * Handle internal wallet payment
   */
  private async handleWalletPayment(request: UnifiedPaymentRequest): Promise<UnifiedPaymentResponse> {
    // This would integrate with the internal wallet service
    // For now, return a pending status that requires wallet balance check
    return {
      success: true,
      orderId: request.orderId,
      method: request.method,
      status: UnifiedPaymentStatus.PROCESSING,
      amount: request.amount,
      currency: request.currency || 'EGP',
      message: 'Processing wallet payment',
      messageAr: 'جاري معالجة الدفع من المحفظة',
    };
  }

  /**
   * Check payment status
   * التحقق من حالة الدفع
   */
  async checkPaymentStatus(transactionId: string, method: PaymentMethod): Promise<PaymentStatusResponse> {
    try {
      switch (method) {
        case PaymentMethod.FAWRY:
        case PaymentMethod.FAWRY_CASH: {
          const status = await fawryService.checkPaymentStatus(transactionId);
          return {
            success: status.success,
            transactionId,
            status: this.mapFawryStatus(status.status),
            amount: status.amount || 0,
            method,
            message: status.message,
          };
        }

        case PaymentMethod.PAYMOB_CARD:
        case PaymentMethod.PAYMOB_WALLET:
        case PaymentMethod.PAYMOB_KIOSK: {
          const status = await paymobService.getTransactionStatus(transactionId);
          return {
            success: status.success,
            transactionId,
            status: this.mapPaymobStatus(status.status),
            amount: status.amount || 0,
            method,
            message: status.message,
          };
        }

        case PaymentMethod.VODAFONE_CASH: {
          const status = await vodafoneCashService.checkPaymentStatus(transactionId);
          return {
            success: status.success,
            transactionId,
            status: this.mapVodafoneStatus(status.status),
            amount: 0,
            method,
            message: status.message,
          };
        }

        case PaymentMethod.INSTAPAY: {
          const status = await instapayService.verifyPayment(transactionId);
          return {
            success: status.success,
            transactionId,
            status: status.verified ? UnifiedPaymentStatus.SUCCESS : UnifiedPaymentStatus.PENDING,
            amount: status.amount || 0,
            method,
            message: status.message,
          };
        }

        default:
          return {
            success: false,
            transactionId,
            status: UnifiedPaymentStatus.FAILED,
            amount: 0,
            method,
            message: 'Unsupported payment method for status check',
          };
      }
    } catch (error) {
      console.error('Status check error:', error);
      return {
        success: false,
        transactionId,
        status: UnifiedPaymentStatus.FAILED,
        amount: 0,
        method,
        message: 'Failed to check payment status',
      };
    }
  }

  /**
   * Process refund
   * معالجة استرداد
   */
  async refund(request: UnifiedRefundRequest): Promise<UnifiedRefundResponse> {
    try {
      switch (request.method) {
        case PaymentMethod.PAYMOB_CARD:
        case PaymentMethod.PAYMOB_WALLET: {
          const result = await paymobService.refund({
            transactionId: request.transactionId,
            amount: (request.amount || 0) * 100,
          });
          return {
            success: result.success,
            refundId: result.refundId,
            originalTransactionId: request.transactionId,
            amount: request.amount || 0,
            status: result.success ? UnifiedPaymentStatus.REFUNDED : UnifiedPaymentStatus.FAILED,
            message: result.message,
          };
        }

        case PaymentMethod.VODAFONE_CASH: {
          const result = await vodafoneCashService.refund({
            originalTransactionId: request.transactionId,
            amount: request.amount || 0,
            reason: request.reason,
          });
          return {
            success: result.success,
            refundId: result.transactionId,
            originalTransactionId: request.transactionId,
            amount: request.amount || 0,
            status: result.success ? UnifiedPaymentStatus.REFUNDED : UnifiedPaymentStatus.FAILED,
            message: result.message,
          };
        }

        default:
          return {
            success: false,
            originalTransactionId: request.transactionId,
            amount: request.amount || 0,
            status: UnifiedPaymentStatus.FAILED,
            message: 'Refund not supported for this payment method',
          };
      }
    } catch (error) {
      console.error('Refund error:', error);
      return {
        success: false,
        originalTransactionId: request.transactionId,
        amount: request.amount || 0,
        status: UnifiedPaymentStatus.FAILED,
        message: 'Refund failed',
      };
    }
  }

  // Status mapping helpers
  private mapFawryStatus(status: string): UnifiedPaymentStatus {
    const map: Record<string, UnifiedPaymentStatus> = {
      PAID: UnifiedPaymentStatus.SUCCESS,
      NEW: UnifiedPaymentStatus.PENDING,
      UNPAID: UnifiedPaymentStatus.PENDING,
      EXPIRED: UnifiedPaymentStatus.EXPIRED,
      CANCELLED: UnifiedPaymentStatus.CANCELLED,
      REFUNDED: UnifiedPaymentStatus.REFUNDED,
    };
    return map[status] || UnifiedPaymentStatus.FAILED;
  }

  private mapPaymobStatus(status: string): UnifiedPaymentStatus {
    const map: Record<string, UnifiedPaymentStatus> = {
      success: UnifiedPaymentStatus.SUCCESS,
      pending: UnifiedPaymentStatus.PENDING,
      failed: UnifiedPaymentStatus.FAILED,
      refunded: UnifiedPaymentStatus.REFUNDED,
      voided: UnifiedPaymentStatus.CANCELLED,
    };
    return map[status] || UnifiedPaymentStatus.FAILED;
  }

  private mapVodafoneStatus(status: string): UnifiedPaymentStatus {
    const map: Record<string, UnifiedPaymentStatus> = {
      SUCCESS: UnifiedPaymentStatus.SUCCESS,
      PENDING: UnifiedPaymentStatus.PENDING,
      FAILED: UnifiedPaymentStatus.FAILED,
      EXPIRED: UnifiedPaymentStatus.EXPIRED,
      CANCELLED: UnifiedPaymentStatus.CANCELLED,
      REFUNDED: UnifiedPaymentStatus.REFUNDED,
    };
    return map[status] || UnifiedPaymentStatus.FAILED;
  }
}

// Singleton instance
export const unifiedPaymentGateway = new UnifiedPaymentGateway();

// Convenience exports
export const initiatePayment = (request: UnifiedPaymentRequest) =>
  unifiedPaymentGateway.initiatePayment(request);

export const checkPaymentStatus = (transactionId: string, method: PaymentMethod) =>
  unifiedPaymentGateway.checkPaymentStatus(transactionId, method);

export const refundPayment = (request: UnifiedRefundRequest) =>
  unifiedPaymentGateway.refund(request);

export const getAvailablePaymentMethods = (amount?: number) =>
  unifiedPaymentGateway.getAvailablePaymentMethods(amount);

export const calculatePaymentFees = (amount: number, method: PaymentMethod) =>
  unifiedPaymentGateway.calculateFees(amount, method);
