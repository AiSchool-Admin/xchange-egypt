/**
 * Paymob Payment Gateway Service
 * خدمة بوابة دفع باي موب - أكبر بوابة دفع في مصر
 *
 * Features:
 * - Card payments (Visa, Mastercard)
 * - Mobile wallets integration
 * - Installments (ValU, Souhoola)
 * - Secure payment processing
 */

import crypto from 'crypto';

// Paymob configuration
export const PAYMOB_CONFIG = {
  API_BASE_URL: process.env.PAYMOB_API_URL || 'https://accept.paymob.com/api',
  API_KEY: process.env.PAYMOB_API_KEY || '',
  INTEGRATION_ID_CARD: process.env.PAYMOB_INTEGRATION_ID_CARD || '',
  INTEGRATION_ID_WALLET: process.env.PAYMOB_INTEGRATION_ID_WALLET || '',
  INTEGRATION_ID_KIOSK: process.env.PAYMOB_INTEGRATION_ID_KIOSK || '',
  IFRAME_ID: process.env.PAYMOB_IFRAME_ID || '',
  HMAC_SECRET: process.env.PAYMOB_HMAC_SECRET || '',
  MERCHANT_ID: process.env.PAYMOB_MERCHANT_ID || '',
  CALLBACK_URL: process.env.PAYMOB_CALLBACK_URL || 'https://xchange.com.eg/api/v1/payments/paymob/callback',
};

// Payment types
export enum PaymobPaymentType {
  CARD = 'card',
  WALLET = 'wallet',
  KIOSK = 'kiosk',
  VALU = 'valu',
}

// Payment status
export enum PaymobStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  VOIDED = 'voided',
}

// Interfaces
export interface PaymobAuthResponse {
  token: string;
  profile: {
    id: number;
    user: {
      id: number;
      username: string;
      email: string;
    };
    company_name: string;
  };
}

export interface PaymobOrderRequest {
  orderId: string;
  amount: number; // In piasters (1 EGP = 100 piasters)
  currency?: string;
  items: PaymobOrderItem[];
  customer: PaymobCustomer;
  paymentType: PaymobPaymentType;
}

export interface PaymobOrderItem {
  name: string;
  amount: number; // In piasters
  description?: string;
  quantity: number;
}

export interface PaymobCustomer {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  street?: string;
  building?: string;
  floor?: string;
  apartment?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
}

export interface PaymobOrderResponse {
  id: number;
  created_at: string;
  delivery_needed: boolean;
  merchant: {
    id: number;
    company_name: string;
  };
  amount_cents: number;
  currency: string;
}

export interface PaymobPaymentKeyRequest {
  orderId: number;
  amount: number;
  currency: string;
  customer: PaymobCustomer;
  integrationId: string;
}

export interface PaymobPaymentKeyResponse {
  token: string;
}

export interface PaymobPaymentResult {
  success: boolean;
  transactionId?: string;
  orderId?: string;
  paymentUrl?: string;
  iframeUrl?: string;
  kioskReference?: string;
  walletRedirectUrl?: string;
  message: string;
  rawResponse?: Record<string, unknown>;
}

export interface PaymobCallback {
  obj: {
    id: number;
    pending: boolean;
    amount_cents: number;
    success: boolean;
    is_auth: boolean;
    is_capture: boolean;
    is_standalone_payment: boolean;
    is_voided: boolean;
    is_refunded: boolean;
    is_3d_secure: boolean;
    integration_id: number;
    profile_id: number;
    has_parent_transaction: boolean;
    order: {
      id: number;
      created_at: string;
      delivery_needed: boolean;
      merchant: {
        id: number;
        company_name: string;
      };
      amount_cents: number;
    };
    created_at: string;
    currency: string;
    error_occured: boolean;
    source_data: {
      type: string;
      sub_type: string;
      pan: string;
    };
    data: {
      message?: string;
      txn_response_code?: string;
    };
  };
  hmac: string;
}

export interface PaymobRefundRequest {
  transactionId: string;
  amount: number; // In piasters
}

// Main Paymob Service Class
export class PaymobService {
  private authToken: string | null = null;
  private tokenExpiry: Date | null = null;

  /**
   * Authenticate with Paymob API
   * المصادقة مع API باي موب
   */
  async authenticate(): Promise<string> {
    // Check if we have a valid token
    if (this.authToken && this.tokenExpiry && this.tokenExpiry > new Date()) {
      return this.authToken;
    }

    try {
      const response = await fetch(`${PAYMOB_CONFIG.API_BASE_URL}/auth/tokens`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: PAYMOB_CONFIG.API_KEY,
        }),
      });

      if (!response.ok) {
        throw new Error(`Paymob authentication failed: ${response.statusText}`);
      }

      const data = await response.json() as PaymobAuthResponse;
      this.authToken = data.token;
      // Token is valid for 1 hour, we'll refresh after 50 minutes
      this.tokenExpiry = new Date(Date.now() + 50 * 60 * 1000);

      return this.authToken;
    } catch (error) {
      console.error('Paymob authentication error:', error);
      throw new Error('فشل في المصادقة مع باي موب');
    }
  }

  /**
   * Create an order in Paymob
   * إنشاء طلب في باي موب
   */
  async createOrder(request: PaymobOrderRequest): Promise<PaymobOrderResponse> {
    const token = await this.authenticate();

    const orderData = {
      auth_token: token,
      delivery_needed: false,
      amount_cents: request.amount,
      currency: request.currency || 'EGP',
      merchant_order_id: request.orderId,
      items: request.items.map((item) => ({
        name: item.name,
        amount_cents: item.amount,
        description: item.description || item.name,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch(`${PAYMOB_CONFIG.API_BASE_URL}/ecommerce/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to create Paymob order: ${JSON.stringify(errorData)}`);
      }

      return await response.json() as PaymobOrderResponse;
    } catch (error) {
      console.error('Paymob order creation error:', error);
      throw new Error('فشل في إنشاء الطلب في باي موب');
    }
  }

  /**
   * Generate payment key for iframe/redirect
   * إنشاء مفتاح الدفع للـ iframe
   */
  async generatePaymentKey(request: PaymobPaymentKeyRequest): Promise<string> {
    const token = await this.authenticate();

    const billingData = {
      first_name: request.customer.firstName,
      last_name: request.customer.lastName,
      email: request.customer.email,
      phone_number: request.customer.phone,
      street: request.customer.street || 'NA',
      building: request.customer.building || 'NA',
      floor: request.customer.floor || 'NA',
      apartment: request.customer.apartment || 'NA',
      city: request.customer.city || 'Cairo',
      state: request.customer.state || 'Cairo',
      country: request.customer.country || 'EG',
      postal_code: request.customer.postalCode || '00000',
    };

    const paymentKeyData = {
      auth_token: token,
      amount_cents: request.amount,
      expiration: 3600, // 1 hour
      order_id: request.orderId,
      billing_data: billingData,
      currency: request.currency,
      integration_id: parseInt(request.integrationId),
      lock_order_when_paid: true,
    };

    try {
      const response = await fetch(`${PAYMOB_CONFIG.API_BASE_URL}/acceptance/payment_keys`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentKeyData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to generate payment key: ${JSON.stringify(errorData)}`);
      }

      const data = await response.json() as PaymobPaymentKeyResponse;
      return data.token;
    } catch (error) {
      console.error('Paymob payment key error:', error);
      throw new Error('فشل في إنشاء مفتاح الدفع');
    }
  }

  /**
   * Initiate card payment
   * بدء عملية الدفع بالبطاقة
   */
  async initiateCardPayment(request: PaymobOrderRequest): Promise<PaymobPaymentResult> {
    try {
      // Step 1: Create order
      const order = await this.createOrder(request);

      // Step 2: Generate payment key
      const paymentKey = await this.generatePaymentKey({
        orderId: order.id,
        amount: request.amount,
        currency: request.currency || 'EGP',
        customer: request.customer,
        integrationId: PAYMOB_CONFIG.INTEGRATION_ID_CARD,
      });

      // Step 3: Return iframe URL
      const iframeUrl = `https://accept.paymob.com/api/acceptance/iframes/${PAYMOB_CONFIG.IFRAME_ID}?payment_token=${paymentKey}`;

      return {
        success: true,
        orderId: order.id.toString(),
        iframeUrl,
        paymentUrl: iframeUrl,
        message: 'تم إنشاء رابط الدفع بنجاح',
      };
    } catch (error) {
      console.error('Card payment initiation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'فشل في بدء عملية الدفع',
      };
    }
  }

  /**
   * Initiate mobile wallet payment
   * بدء عملية الدفع بالمحفظة
   */
  async initiateWalletPayment(
    request: PaymobOrderRequest,
    walletPhone: string
  ): Promise<PaymobPaymentResult> {
    try {
      // Step 1: Create order
      const order = await this.createOrder(request);

      // Step 2: Generate payment key
      const paymentKey = await this.generatePaymentKey({
        orderId: order.id,
        amount: request.amount,
        currency: request.currency || 'EGP',
        customer: request.customer,
        integrationId: PAYMOB_CONFIG.INTEGRATION_ID_WALLET,
      });

      // Step 3: Pay with wallet
      const walletResponse = await fetch(`${PAYMOB_CONFIG.API_BASE_URL}/acceptance/payments/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: {
            identifier: walletPhone,
            subtype: 'WALLET',
          },
          payment_token: paymentKey,
        }),
      });

      if (!walletResponse.ok) {
        throw new Error('Failed to initiate wallet payment');
      }

      const walletData = await walletResponse.json() as Record<string, unknown>;

      return {
        success: true,
        orderId: order.id.toString(),
        walletRedirectUrl: walletData.redirect_url as string,
        transactionId: walletData.id?.toString(),
        message: 'تم إرسال طلب الدفع للمحفظة',
      };
    } catch (error) {
      console.error('Wallet payment initiation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'فشل في بدء الدفع بالمحفظة',
      };
    }
  }

  /**
   * Initiate kiosk payment (Aman, Masary, etc.)
   * بدء عملية الدفع عبر الكيوسك
   */
  async initiateKioskPayment(request: PaymobOrderRequest): Promise<PaymobPaymentResult> {
    try {
      // Step 1: Create order
      const order = await this.createOrder(request);

      // Step 2: Generate payment key
      const paymentKey = await this.generatePaymentKey({
        orderId: order.id,
        amount: request.amount,
        currency: request.currency || 'EGP',
        customer: request.customer,
        integrationId: PAYMOB_CONFIG.INTEGRATION_ID_KIOSK,
      });

      // Step 3: Pay with kiosk
      const kioskResponse = await fetch(`${PAYMOB_CONFIG.API_BASE_URL}/acceptance/payments/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          source: {
            identifier: 'AGGREGATOR',
            subtype: 'AGGREGATOR',
          },
          payment_token: paymentKey,
        }),
      });

      if (!kioskResponse.ok) {
        throw new Error('Failed to initiate kiosk payment');
      }

      const kioskData = await kioskResponse.json() as Record<string, unknown>;
      const kioskDataObj = kioskData.data as Record<string, unknown> | undefined;

      return {
        success: true,
        orderId: order.id.toString(),
        kioskReference: kioskDataObj?.bill_reference?.toString(),
        transactionId: kioskData.id?.toString(),
        message: `رقم المرجع للدفع: ${kioskDataObj?.bill_reference}`,
      };
    } catch (error) {
      console.error('Kiosk payment initiation error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'فشل في إنشاء رقم المرجع',
      };
    }
  }

  /**
   * Verify HMAC signature from callback
   * التحقق من توقيع HMAC
   */
  verifyCallback(callback: PaymobCallback): boolean {
    const { obj, hmac } = callback;

    // Order of fields for HMAC calculation (as per Paymob docs)
    const hmacString = [
      obj.amount_cents,
      obj.created_at,
      obj.currency,
      obj.error_occured,
      obj.has_parent_transaction,
      obj.id,
      obj.integration_id,
      obj.is_3d_secure,
      obj.is_auth,
      obj.is_capture,
      obj.is_refunded,
      obj.is_standalone_payment,
      obj.is_voided,
      obj.order.id,
      obj.pending,
      obj.source_data.pan,
      obj.source_data.sub_type,
      obj.source_data.type,
      obj.success,
    ].join('');

    const calculatedHmac = crypto
      .createHmac('sha512', PAYMOB_CONFIG.HMAC_SECRET)
      .update(hmacString)
      .digest('hex');

    return calculatedHmac === hmac;
  }

  /**
   * Handle payment callback
   * معالجة رد الدفع
   */
  async handleCallback(callback: PaymobCallback): Promise<{
    success: boolean;
    orderId: string;
    transactionId: string;
    status: PaymobStatus;
    amount: number;
    message: string;
  }> {
    // Verify HMAC
    if (!this.verifyCallback(callback)) {
      return {
        success: false,
        orderId: callback.obj.order.id.toString(),
        transactionId: callback.obj.id.toString(),
        status: PaymobStatus.FAILED,
        amount: callback.obj.amount_cents / 100,
        message: 'Invalid callback signature',
      };
    }

    const { obj } = callback;

    // Determine status
    let status: PaymobStatus;
    if (obj.is_voided) {
      status = PaymobStatus.VOIDED;
    } else if (obj.is_refunded) {
      status = PaymobStatus.REFUNDED;
    } else if (obj.success) {
      status = PaymobStatus.SUCCESS;
    } else if (obj.pending) {
      status = PaymobStatus.PENDING;
    } else {
      status = PaymobStatus.FAILED;
    }

    return {
      success: obj.success,
      orderId: obj.order.id.toString(),
      transactionId: obj.id.toString(),
      status,
      amount: obj.amount_cents / 100,
      message: obj.data.message || (obj.success ? 'تم الدفع بنجاح' : 'فشلت عملية الدفع'),
    };
  }

  /**
   * Check transaction status
   * التحقق من حالة المعاملة
   */
  async getTransactionStatus(transactionId: string): Promise<{
    success: boolean;
    status: PaymobStatus;
    amount?: number;
    message: string;
  }> {
    const token = await this.authenticate();

    try {
      const response = await fetch(
        `${PAYMOB_CONFIG.API_BASE_URL}/acceptance/transactions/${transactionId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Failed to get transaction status');
      }

      const data = await response.json() as {
        is_voided?: boolean;
        is_refunded?: boolean;
        success?: boolean;
        pending?: boolean;
        amount_cents?: number;
        data?: { message?: string };
      };

      let status: PaymobStatus;
      if (data.is_voided) {
        status = PaymobStatus.VOIDED;
      } else if (data.is_refunded) {
        status = PaymobStatus.REFUNDED;
      } else if (data.success) {
        status = PaymobStatus.SUCCESS;
      } else if (data.pending) {
        status = PaymobStatus.PENDING;
      } else {
        status = PaymobStatus.FAILED;
      }

      return {
        success: data.success,
        status,
        amount: data.amount_cents / 100,
        message: data.data?.message || 'تم جلب حالة المعاملة',
      };
    } catch (error) {
      console.error('Get transaction status error:', error);
      return {
        success: false,
        status: PaymobStatus.FAILED,
        message: 'فشل في جلب حالة المعاملة',
      };
    }
  }

  /**
   * Refund a transaction
   * استرداد معاملة
   */
  async refund(request: PaymobRefundRequest): Promise<{
    success: boolean;
    refundId?: string;
    message: string;
  }> {
    const token = await this.authenticate();

    try {
      const response = await fetch(`${PAYMOB_CONFIG.API_BASE_URL}/acceptance/void_refund/refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_token: token,
          transaction_id: request.transactionId,
          amount_cents: request.amount,
        }),
      });

      if (!response.ok) {
        throw new Error('Refund failed');
      }

      const data = await response.json() as { id?: number };

      return {
        success: true,
        refundId: data.id?.toString(),
        message: 'تم استرداد المبلغ بنجاح',
      };
    } catch (error) {
      console.error('Refund error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'فشل في استرداد المبلغ',
      };
    }
  }

  /**
   * Void a transaction (cancel before settlement)
   * إلغاء معاملة
   */
  async void(transactionId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    const token = await this.authenticate();

    try {
      const response = await fetch(`${PAYMOB_CONFIG.API_BASE_URL}/acceptance/void_refund/void`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          auth_token: token,
          transaction_id: transactionId,
        }),
      });

      if (!response.ok) {
        throw new Error('Void failed');
      }

      return {
        success: true,
        message: 'تم إلغاء المعاملة بنجاح',
      };
    } catch (error) {
      console.error('Void error:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'فشل في إلغاء المعاملة',
      };
    }
  }
}

// Singleton instance
export const paymobService = new PaymobService();

// Helper function for quick card payment
export async function createPaymobCardPayment(
  orderId: string,
  amount: number,
  customer: PaymobCustomer,
  items: PaymobOrderItem[]
): Promise<PaymobPaymentResult> {
  return paymobService.initiateCardPayment({
    orderId,
    amount: amount * 100, // Convert to piasters
    items: items.map((item) => ({
      ...item,
      amount: item.amount * 100,
    })),
    customer,
    paymentType: PaymobPaymentType.CARD,
  });
}

// Helper function for wallet payment
export async function createPaymobWalletPayment(
  orderId: string,
  amount: number,
  customer: PaymobCustomer,
  walletPhone: string,
  items: PaymobOrderItem[]
): Promise<PaymobPaymentResult> {
  return paymobService.initiateWalletPayment(
    {
      orderId,
      amount: amount * 100, // Convert to piasters
      items: items.map((item) => ({
        ...item,
        amount: item.amount * 100,
      })),
      customer,
      paymentType: PaymobPaymentType.WALLET,
    },
    walletPhone
  );
}

// Helper function for kiosk payment
export async function createPaymobKioskPayment(
  orderId: string,
  amount: number,
  customer: PaymobCustomer,
  items: PaymobOrderItem[]
): Promise<PaymobPaymentResult> {
  return paymobService.initiateKioskPayment({
    orderId,
    amount: amount * 100, // Convert to piasters
    items: items.map((item) => ({
      ...item,
      amount: item.amount * 100,
    })),
    customer,
    paymentType: PaymobPaymentType.KIOSK,
  });
}
