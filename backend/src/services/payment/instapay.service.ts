import { PrismaClient, OrderStatus } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

// InstaPay configuration from environment
const INSTAPAY_CONFIG = {
  apiUrl: process.env.INSTAPAY_API_URL || 'https://api.instapay.eg',
  apiKey: process.env.INSTAPAY_API_KEY || '',
  secretKey: process.env.INSTAPAY_SECRET_KEY || '',
  merchantId: process.env.INSTAPAY_MERCHANT_ID || '',
};

interface PaymentInitiateResponse {
  success: boolean;
  transactionId: string;
  paymentUrl: string;
  expiresAt: Date;
}

interface PaymentVerifyResponse {
  success: boolean;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'EXPIRED';
  transactionId: string;
  amount: number;
  paidAt?: Date;
}

/**
 * Generate signature for InstaPay API
 */
const generateSignature = (data: Record<string, any>): string => {
  const sortedKeys = Object.keys(data).sort();
  const signatureString = sortedKeys.map(key => `${key}=${data[key]}`).join('&');
  return crypto
    .createHmac('sha256', INSTAPAY_CONFIG.secretKey)
    .update(signatureString)
    .digest('hex');
};

/**
 * Initiate InstaPay payment
 */
export const initiatePayment = async (
  orderId: string,
  amount: number,
  customerData: {
    email: string;
    phone: string;
    name: string;
  }
): Promise<PaymentInitiateResponse> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new Error('Order is not pending payment');
  }

  // TODO: Replace with actual InstaPay API call when keys are available
  // For now, return mock response
  const transactionId = `INS-${Date.now()}-${Math.random().toString(36).substring(7)}`;

  // Mock API call
  /*
  const requestData = {
    merchantId: INSTAPAY_CONFIG.merchantId,
    orderId: order.orderNumber,
    amount,
    currency: 'EGP',
    customerEmail: customerData.email,
    customerPhone: customerData.phone,
    customerName: customerData.name,
    returnUrl: `${process.env.FRONTEND_URL}/payment/success`,
    cancelUrl: `${process.env.FRONTEND_URL}/payment/failure`,
    timestamp: Date.now(),
  };

  const signature = generateSignature(requestData);

  const response = await fetch(`${INSTAPAY_CONFIG.apiUrl}/payments/initiate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': INSTAPAY_CONFIG.apiKey,
      'X-Signature': signature,
    },
    body: JSON.stringify(requestData),
  });

  const result = await response.json();
  */

  // Update order with payment ID
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentId: transactionId },
  });

  return {
    success: true,
    transactionId,
    paymentUrl: `https://pay.instapay.eg/checkout/${transactionId}`, // Mock URL
    expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
  };
};

/**
 * Verify InstaPay payment status
 */
export const verifyPayment = async (transactionId: string): Promise<PaymentVerifyResponse> => {
  // TODO: Replace with actual InstaPay API call when keys are available
  // For now, return mock response based on transaction ID

  const order = await prisma.order.findFirst({
    where: { paymentId: transactionId },
  });

  if (!order) {
    throw new Error('Transaction not found');
  }

  // Mock verification - in production, call InstaPay API
  /*
  const requestData = {
    merchantId: INSTAPAY_CONFIG.merchantId,
    transactionId,
    timestamp: Date.now(),
  };

  const signature = generateSignature(requestData);

  const response = await fetch(`${INSTAPAY_CONFIG.apiUrl}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-API-Key': INSTAPAY_CONFIG.apiKey,
      'X-Signature': signature,
    },
    body: JSON.stringify(requestData),
  });

  const result = await response.json();
  */

  return {
    success: true,
    status: order.status === OrderStatus.PAID ? 'COMPLETED' : 'PENDING',
    transactionId,
    amount: order.total,
    paidAt: order.paidAt || undefined,
  };
};

/**
 * Handle InstaPay callback/webhook
 */
export const handleCallback = async (payload: {
  transactionId: string;
  status: string;
  amount: number;
  signature: string;
}) => {
  // Verify signature
  const { signature, ...data } = payload;
  const expectedSignature = generateSignature(data);

  // In production, verify signature
  // if (signature !== expectedSignature) {
  //   throw new Error('Invalid signature');
  // }

  // Find order by payment ID
  const order = await prisma.order.findFirst({
    where: { paymentId: payload.transactionId },
  });

  if (!order) {
    throw new Error('Order not found for transaction');
  }

  // Update order status based on payment status
  if (payload.status === 'COMPLETED') {
    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
        paidAt: new Date(),
      },
    });

    // Create notification for user
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'TRANSACTION_PAYMENT_RECEIVED',
        title: 'Payment Received',
        message: `Payment for order ${order.orderNumber} has been received`,
        entityId: order.id,
        entityType: 'Order',
      },
    });

    return { success: true, message: 'Payment confirmed' };
  } else if (payload.status === 'FAILED') {
    // Optionally update order or create notification
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'TRANSACTION_PAYMENT_RECEIVED',
        title: 'Payment Failed',
        message: `Payment for order ${order.orderNumber} has failed`,
        entityId: order.id,
        entityType: 'Order',
      },
    });

    return { success: false, message: 'Payment failed' };
  }

  return { success: true, message: 'Callback processed' };
};
