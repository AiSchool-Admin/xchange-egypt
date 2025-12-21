/**
 * Vodafone Cash Payment Gateway Service
 * خدمة بوابة دفع فودافون كاش
 *
 * Features:
 * - Mobile wallet payments
 * - Cash-in/Cash-out
 * - P2P transfers
 * - Merchant payments
 */

import crypto from 'crypto';

// Vodafone Cash configuration
export const VODAFONE_CASH_CONFIG = {
  API_BASE_URL: process.env.VODAFONE_CASH_API_URL || 'https://api.vodafone.com.eg/vfcash',
  MERCHANT_ID: process.env.VODAFONE_CASH_MERCHANT_ID || '',
  MERCHANT_PIN: process.env.VODAFONE_CASH_MERCHANT_PIN || '',
  API_KEY: process.env.VODAFONE_CASH_API_KEY || '',
  API_SECRET: process.env.VODAFONE_CASH_API_SECRET || '',
  CALLBACK_URL: process.env.VODAFONE_CASH_CALLBACK_URL || 'https://xchange.com.eg/api/v1/payments/vodafone/callback',
  MERCHANT_PHONE: process.env.VODAFONE_CASH_MERCHANT_PHONE || '',
  TIMEOUT_SECONDS: 300, // 5 minutes for payment confirmation
};

// Payment status
export enum VodafoneCashStatus {
  PENDING = 'PENDING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

// Transaction types
export enum VodafoneCashTransactionType {
  PAYMENT = 'PAYMENT',
  REFUND = 'REFUND',
  CASH_IN = 'CASH_IN',
  CASH_OUT = 'CASH_OUT',
  P2P = 'P2P',
}

// Interfaces
export interface VodafoneCashPaymentRequest {
  orderId: string;
  amount: number;
  customerPhone: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface VodafoneCashPaymentResponse {
  success: boolean;
  transactionId?: string;
  referenceNumber?: string;
  status: VodafoneCashStatus;
  message: string;
  expiresAt?: Date;
  rawResponse?: Record<string, unknown>;
}

export interface VodafoneCashCallback {
  transactionId: string;
  referenceNumber: string;
  status: string;
  amount: number;
  customerPhone: string;
  timestamp: string;
  signature: string;
  merchantId: string;
}

export interface VodafoneCashRefundRequest {
  originalTransactionId: string;
  amount: number;
  reason?: string;
}

export interface VodafoneCashBalanceResponse {
  success: boolean;
  balance?: number;
  currency?: string;
  lastUpdated?: Date;
  message: string;
}

export interface VodafoneCashTransactionDetails {
  transactionId: string;
  referenceNumber: string;
  amount: number;
  status: VodafoneCashStatus;
  type: VodafoneCashTransactionType;
  customerPhone: string;
  merchantId: string;
  createdAt: Date;
  completedAt?: Date;
  description?: string;
}

// Main Vodafone Cash Service Class
export class VodafoneCashService {
  private accessToken: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Generate request signature
   * إنشاء توقيع الطلب
   */
  private generateSignature(data: Record<string, unknown>): string {
    const sortedKeys = Object.keys(data).sort();
    const signatureString = sortedKeys.map((key) => `${key}=${data[key]}`).join('&');

    return crypto
      .createHmac('sha256', VODAFONE_CASH_CONFIG.API_SECRET)
      .update(signatureString)
      .digest('hex');
  }

  /**
   * Verify callback signature
   * التحقق من توقيع رد الدفع
   */
  verifyCallbackSignature(callback: VodafoneCashCallback): boolean {
    const { signature, ...data } = callback;
    const calculatedSignature = this.generateSignature(data);
    return calculatedSignature === signature;
  }

  /**
   * Authenticate with Vodafone Cash API
   * المصادقة مع API فودافون كاش
   */
  async authenticate(): Promise<string> {
    // Check if we have a valid token
    if (this.accessToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.accessToken;
    }

    try {
      const timestamp = Date.now().toString();
      const signature = this.generateSignature({
        merchantId: VODAFONE_CASH_CONFIG.MERCHANT_ID,
        timestamp,
      });

      const response = await fetch(`${VODAFONE_CASH_CONFIG.API_BASE_URL}/auth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Key': VODAFONE_CASH_CONFIG.API_KEY,
        },
        body: JSON.stringify({
          merchantId: VODAFONE_CASH_CONFIG.MERCHANT_ID,
          merchantPin: VODAFONE_CASH_CONFIG.MERCHANT_PIN,
          timestamp,
          signature,
        }),
      });

      if (!response.ok) {
        throw new Error(`Vodafone Cash authentication failed: ${response.statusText}`);
      }

      const data = await response.json() as { accessToken: string };
      this.accessToken = data.accessToken;
      // Token is valid for 30 minutes, we'll refresh after 25 minutes
      this.tokenExpiry = new Date(Date.now() + 25 * 60 * 1000);

      return this.accessToken;
    } catch (error) {
      console.error('Vodafone Cash authentication error:', error);
      throw new Error('فشل في المصادقة مع فودافون كاش');
    }
  }

  /**
   * Initiate payment request
   * بدء طلب الدفع
   */
  async initiatePayment(request: VodafoneCashPaymentRequest): Promise<VodafoneCashPaymentResponse> {
    try {
      const token = await this.authenticate();
      const timestamp = Date.now().toString();
      const referenceNumber = `VF${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

      const paymentData = {
        merchantId: VODAFONE_CASH_CONFIG.MERCHANT_ID,
        orderId: request.orderId,
        amount: request.amount,
        customerPhone: this.formatPhoneNumber(request.customerPhone),
        referenceNumber,
        description: request.description || `دفع لطلب ${request.orderId}`,
        callbackUrl: VODAFONE_CASH_CONFIG.CALLBACK_URL,
        timestamp,
        metadata: request.metadata,
      };

      const signature = this.generateSignature({
        merchantId: paymentData.merchantId,
        orderId: paymentData.orderId,
        amount: paymentData.amount.toString(),
        customerPhone: paymentData.customerPhone,
        referenceNumber: paymentData.referenceNumber,
        timestamp,
      });

      const response = await fetch(`${VODAFONE_CASH_CONFIG.API_BASE_URL}/payments/initiate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Signature': signature,
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Payment initiation failed: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json() as {
        transactionId?: string;
        referenceNumber?: string;
      };

      return {
        success: true,
        transactionId: data.transactionId,
        referenceNumber: data.referenceNumber || referenceNumber,
        status: VodafoneCashStatus.PENDING,
        message: 'تم إرسال طلب الدفع. سيتم إعلام العميل عبر رسالة نصية.',
        expiresAt: new Date(Date.now() + VODAFONE_CASH_CONFIG.TIMEOUT_SECONDS * 1000),
        rawResponse: data,
      };
    } catch (error) {
      console.error('Vodafone Cash payment initiation error:', error);
      return {
        success: false,
        status: VodafoneCashStatus.FAILED,
        message: error instanceof Error ? error.message : 'فشل في بدء عملية الدفع',
      };
    }
  }

  /**
   * Check payment status
   * التحقق من حالة الدفع
   */
  async checkPaymentStatus(transactionId: string): Promise<VodafoneCashPaymentResponse> {
    try {
      const token = await this.authenticate();
      const timestamp = Date.now().toString();

      const signature = this.generateSignature({
        merchantId: VODAFONE_CASH_CONFIG.MERCHANT_ID,
        transactionId,
        timestamp,
      });

      const response = await fetch(
        `${VODAFONE_CASH_CONFIG.API_BASE_URL}/payments/status/${transactionId}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Merchant-Id': VODAFONE_CASH_CONFIG.MERCHANT_ID,
            'X-Timestamp': timestamp,
            'X-Signature': signature,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json() as {
        transactionId?: string;
        referenceNumber?: string;
        status?: string;
      };

      const status = this.mapStatus(data.status || '');

      return {
        success: status === VodafoneCashStatus.SUCCESS,
        transactionId: data.transactionId,
        referenceNumber: data.referenceNumber,
        status,
        message: this.getStatusMessage(status),
        rawResponse: data,
      };
    } catch (error) {
      console.error('Vodafone Cash status check error:', error);
      return {
        success: false,
        status: VodafoneCashStatus.FAILED,
        message: 'فشل في التحقق من حالة الدفع',
      };
    }
  }

  /**
   * Handle payment callback
   * معالجة رد الدفع
   */
  async handleCallback(callback: VodafoneCashCallback): Promise<{
    success: boolean;
    transactionId: string;
    status: VodafoneCashStatus;
    amount: number;
    message: string;
  }> {
    // Verify signature
    if (!this.verifyCallbackSignature(callback)) {
      return {
        success: false,
        transactionId: callback.transactionId,
        status: VodafoneCashStatus.FAILED,
        amount: callback.amount,
        message: 'Invalid callback signature',
      };
    }

    const status = this.mapStatus(callback.status);

    return {
      success: status === VodafoneCashStatus.SUCCESS,
      transactionId: callback.transactionId,
      status,
      amount: callback.amount,
      message: this.getStatusMessage(status),
    };
  }

  /**
   * Refund a payment
   * استرداد دفعة
   */
  async refund(request: VodafoneCashRefundRequest): Promise<VodafoneCashPaymentResponse> {
    try {
      const token = await this.authenticate();
      const timestamp = Date.now().toString();

      const refundData = {
        merchantId: VODAFONE_CASH_CONFIG.MERCHANT_ID,
        originalTransactionId: request.originalTransactionId,
        amount: request.amount,
        reason: request.reason || 'Customer request',
        timestamp,
      };

      const signature = this.generateSignature({
        merchantId: refundData.merchantId,
        originalTransactionId: refundData.originalTransactionId,
        amount: refundData.amount.toString(),
        timestamp,
      });

      const response = await fetch(`${VODAFONE_CASH_CONFIG.API_BASE_URL}/payments/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'X-Signature': signature,
        },
        body: JSON.stringify(refundData),
      });

      if (!response.ok) {
        throw new Error('Refund failed');
      }

      const data = await response.json() as {
        refundTransactionId?: string;
        referenceNumber?: string;
      };

      return {
        success: true,
        transactionId: data.refundTransactionId,
        referenceNumber: data.referenceNumber,
        status: VodafoneCashStatus.REFUNDED,
        message: 'تم استرداد المبلغ بنجاح',
        rawResponse: data,
      };
    } catch (error) {
      console.error('Vodafone Cash refund error:', error);
      return {
        success: false,
        status: VodafoneCashStatus.FAILED,
        message: error instanceof Error ? error.message : 'فشل في استرداد المبلغ',
      };
    }
  }

  /**
   * Get merchant balance
   * الحصول على رصيد التاجر
   */
  async getMerchantBalance(): Promise<VodafoneCashBalanceResponse> {
    try {
      const token = await this.authenticate();
      const timestamp = Date.now().toString();

      const signature = this.generateSignature({
        merchantId: VODAFONE_CASH_CONFIG.MERCHANT_ID,
        timestamp,
      });

      const response = await fetch(`${VODAFONE_CASH_CONFIG.API_BASE_URL}/merchant/balance`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'X-Merchant-Id': VODAFONE_CASH_CONFIG.MERCHANT_ID,
          'X-Timestamp': timestamp,
          'X-Signature': signature,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to get merchant balance');
      }

      const data = await response.json() as {
        balance?: number;
        lastUpdated?: string;
      };

      return {
        success: true,
        balance: data.balance,
        currency: 'EGP',
        lastUpdated: new Date(data.lastUpdated),
        message: 'تم جلب الرصيد بنجاح',
      };
    } catch (error) {
      console.error('Vodafone Cash balance check error:', error);
      return {
        success: false,
        message: 'فشل في جلب الرصيد',
      };
    }
  }

  /**
   * Get transaction history
   * الحصول على سجل المعاملات
   */
  async getTransactionHistory(
    startDate: Date,
    endDate: Date,
    page: number = 1,
    limit: number = 50
  ): Promise<{
    success: boolean;
    transactions?: VodafoneCashTransactionDetails[];
    total?: number;
    message: string;
  }> {
    try {
      const token = await this.authenticate();
      const timestamp = Date.now().toString();

      const signature = this.generateSignature({
        merchantId: VODAFONE_CASH_CONFIG.MERCHANT_ID,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        timestamp,
      });

      const queryParams = new URLSearchParams({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        page: page.toString(),
        limit: limit.toString(),
      });

      const response = await fetch(
        `${VODAFONE_CASH_CONFIG.API_BASE_URL}/transactions?${queryParams}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token}`,
            'X-Merchant-Id': VODAFONE_CASH_CONFIG.MERCHANT_ID,
            'X-Timestamp': timestamp,
            'X-Signature': signature,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get transaction history');
      }

      const data = await response.json() as {
        transactions?: Array<{
          transactionId?: string;
          referenceNumber?: string;
          amount?: number;
          status?: string;
          type?: string;
          customerPhone?: string;
          merchantId?: string;
          createdAt?: string;
          completedAt?: string;
          description?: string;
        }>;
        total?: number;
      };

      return {
        success: true,
        transactions: (data.transactions || []).map((tx) => ({
          transactionId: tx.transactionId,
          referenceNumber: tx.referenceNumber,
          amount: tx.amount,
          status: this.mapStatus(tx.status),
          type: tx.type as VodafoneCashTransactionType,
          customerPhone: tx.customerPhone,
          merchantId: tx.merchantId,
          createdAt: new Date(tx.createdAt),
          completedAt: tx.completedAt ? new Date(tx.completedAt) : undefined,
          description: tx.description,
        })),
        total: data.total,
        message: 'تم جلب سجل المعاملات بنجاح',
      };
    } catch (error) {
      console.error('Vodafone Cash transaction history error:', error);
      return {
        success: false,
        message: 'فشل في جلب سجل المعاملات',
      };
    }
  }

  /**
   * Format phone number to Egyptian format
   * تنسيق رقم الهاتف للصيغة المصرية
   */
  private formatPhoneNumber(phone: string): string {
    // Remove any non-digit characters
    let cleaned = phone.replace(/\D/g, '');

    // Remove leading zeros
    cleaned = cleaned.replace(/^0+/, '');

    // Add Egypt country code if not present
    if (!cleaned.startsWith('20')) {
      cleaned = '20' + cleaned;
    }

    return cleaned;
  }

  /**
   * Map status string to enum
   * تحويل النص إلى حالة
   */
  private mapStatus(status: string): VodafoneCashStatus {
    const statusMap: Record<string, VodafoneCashStatus> = {
      PENDING: VodafoneCashStatus.PENDING,
      SUCCESS: VodafoneCashStatus.SUCCESS,
      SUCCESSFUL: VodafoneCashStatus.SUCCESS,
      COMPLETED: VodafoneCashStatus.SUCCESS,
      FAILED: VodafoneCashStatus.FAILED,
      FAILURE: VodafoneCashStatus.FAILED,
      EXPIRED: VodafoneCashStatus.EXPIRED,
      CANCELLED: VodafoneCashStatus.CANCELLED,
      CANCELED: VodafoneCashStatus.CANCELLED,
      REFUNDED: VodafoneCashStatus.REFUNDED,
    };

    return statusMap[status.toUpperCase()] || VodafoneCashStatus.FAILED;
  }

  /**
   * Get status message in Arabic
   * الحصول على رسالة الحالة
   */
  private getStatusMessage(status: VodafoneCashStatus): string {
    const messages: Record<VodafoneCashStatus, string> = {
      [VodafoneCashStatus.PENDING]: 'في انتظار تأكيد الدفع',
      [VodafoneCashStatus.SUCCESS]: 'تم الدفع بنجاح',
      [VodafoneCashStatus.FAILED]: 'فشلت عملية الدفع',
      [VodafoneCashStatus.EXPIRED]: 'انتهت صلاحية طلب الدفع',
      [VodafoneCashStatus.CANCELLED]: 'تم إلغاء طلب الدفع',
      [VodafoneCashStatus.REFUNDED]: 'تم استرداد المبلغ',
    };

    return messages[status];
  }
}

// Singleton instance
export const vodafoneCashService = new VodafoneCashService();

// Helper function for quick payment
export async function createVodafoneCashPayment(
  orderId: string,
  amount: number,
  customerPhone: string,
  description?: string
): Promise<VodafoneCashPaymentResponse> {
  return vodafoneCashService.initiatePayment({
    orderId,
    amount,
    customerPhone,
    description,
  });
}

// Helper function for status check
export async function checkVodafoneCashStatus(
  transactionId: string
): Promise<VodafoneCashPaymentResponse> {
  return vodafoneCashService.checkPaymentStatus(transactionId);
}

// Helper function for refund
export async function refundVodafoneCashPayment(
  transactionId: string,
  amount: number,
  reason?: string
): Promise<VodafoneCashPaymentResponse> {
  return vodafoneCashService.refund({
    originalTransactionId: transactionId,
    amount,
    reason,
  });
}
