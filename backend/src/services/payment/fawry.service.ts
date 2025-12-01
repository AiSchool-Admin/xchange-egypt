import { OrderStatus } from '@prisma/client';
import crypto from 'crypto';
import prisma from '../../lib/prisma';

// Fawry configuration from environment
const FAWRY_CONFIG = {
  baseUrl: process.env.FAWRY_BASE_URL || 'https://atfawry.com',
  merchantCode: process.env.FAWRY_MERCHANT_CODE || '',
  securityKey: process.env.FAWRY_SECURITY_KEY || '',
};

interface FawryPaymentResponse {
  success: boolean;
  referenceNumber: string;
  expiryDate: Date;
  paymentInstructions: {
    ar: string;
    en: string;
  };
}

interface FawryStatusResponse {
  success: boolean;
  status: 'UNPAID' | 'PAID' | 'EXPIRED' | 'REFUNDED';
  referenceNumber: string;
  amount: number;
  paidAt?: Date;
}

/**
 * Generate Fawry signature
 */
const generateFawrySignature = (data: string[]): string => {
  const signatureString = data.join('') + FAWRY_CONFIG.securityKey;
  return crypto
    .createHash('sha256')
    .update(signatureString)
    .digest('hex');
};

/**
 * Create Fawry payment reference
 */
export const createFawryPayment = async (
  orderId: string,
  amount: number,
  customerData: {
    email: string;
    phone: string;
    name: string;
  }
): Promise<FawryPaymentResponse> => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) {
    throw new Error('Order not found');
  }

  if (order.status !== OrderStatus.PENDING) {
    throw new Error('Order is not pending payment');
  }

  // Generate Fawry reference number
  const referenceNumber = `FWR-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

  // TODO: Replace with actual Fawry API call when keys are available
  /*
  const signature = generateFawrySignature([
    FAWRY_CONFIG.merchantCode,
    order.orderNumber,
    customerData.phone,
    customerData.email,
    amount.toFixed(2),
  ]);

  const requestBody = {
    merchantCode: FAWRY_CONFIG.merchantCode,
    merchantRefNum: order.orderNumber,
    customerMobile: customerData.phone,
    customerEmail: customerData.email,
    customerName: customerData.name,
    paymentMethod: 'PAYATFAWRY',
    amount: amount,
    currencyCode: 'EGP',
    language: 'ar-eg',
    chargeItems: [{
      itemId: order.id,
      description: `Order ${order.orderNumber}`,
      price: amount,
      quantity: 1,
    }],
    signature,
    paymentExpiry: Date.now() + 48 * 60 * 60 * 1000, // 48 hours
  };

  const response = await fetch(`${FAWRY_CONFIG.baseUrl}/fawrypay-api/api/payments/init`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  const result = await response.json();
  */

  // Update order with payment ID
  await prisma.order.update({
    where: { id: orderId },
    data: { paymentId: referenceNumber },
  });

  // Expiry date - 48 hours from now
  const expiryDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

  return {
    success: true,
    referenceNumber,
    expiryDate,
    paymentInstructions: {
      ar: `قم بالدفع في أي فرع فوري باستخدام الرقم المرجعي: ${referenceNumber}. المبلغ: ${amount} جنيه. صالح حتى: ${expiryDate.toLocaleDateString('ar-EG')}`,
      en: `Pay at any Fawry outlet using reference number: ${referenceNumber}. Amount: ${amount} EGP. Valid until: ${expiryDate.toLocaleDateString('en-EG')}`,
    },
  };
};

/**
 * Check Fawry payment status
 */
export const checkPaymentStatus = async (referenceNumber: string): Promise<FawryStatusResponse> => {
  const order = await prisma.order.findFirst({
    where: { paymentId: referenceNumber },
  });

  if (!order) {
    throw new Error('Reference number not found');
  }

  // TODO: Replace with actual Fawry API call when keys are available
  /*
  const signature = generateFawrySignature([
    FAWRY_CONFIG.merchantCode,
    order.orderNumber,
  ]);

  const response = await fetch(
    `${FAWRY_CONFIG.baseUrl}/fawrypay-api/api/payments/status/v2?merchantCode=${FAWRY_CONFIG.merchantCode}&merchantRefNumber=${order.orderNumber}&signature=${signature}`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  const result = await response.json();
  */

  // Return mock status based on order status
  let status: 'UNPAID' | 'PAID' | 'EXPIRED' | 'REFUNDED' = 'UNPAID';

  if (order.status === OrderStatus.PAID) {
    status = 'PAID';
  } else if (order.status === OrderStatus.CANCELLED) {
    status = 'EXPIRED';
  } else if (order.status === OrderStatus.REFUNDED) {
    status = 'REFUNDED';
  }

  return {
    success: true,
    status,
    referenceNumber,
    amount: order.total,
    paidAt: order.paidAt || undefined,
  };
};

/**
 * Handle Fawry callback/webhook
 */
export const handleFawryCallback = async (payload: {
  referenceNumber: string;
  orderStatus: string;
  fawryRefNumber: string;
  paymentAmount: number;
  messageSignature: string;
}) => {
  // Verify signature
  const expectedSignature = generateFawrySignature([
    payload.referenceNumber,
    payload.orderStatus,
    payload.paymentAmount.toString(),
    payload.fawryRefNumber,
  ]);

  // In production, verify signature
  // if (payload.messageSignature !== expectedSignature) {
  //   throw new Error('Invalid signature');
  // }

  // Find order by payment ID
  const order = await prisma.order.findFirst({
    where: { paymentId: payload.referenceNumber },
  });

  if (!order) {
    throw new Error('Order not found for reference number');
  }

  // Update order status based on Fawry status
  if (payload.orderStatus === 'PAID') {
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
        message: `Payment for order ${order.orderNumber} has been received via Fawry`,
        entityId: order.id,
        entityType: 'Order',
      },
    });

    return { success: true, message: 'Payment confirmed' };
  } else if (payload.orderStatus === 'EXPIRED') {
    await prisma.notification.create({
      data: {
        userId: order.userId,
        type: 'TRANSACTION_PAYMENT_RECEIVED',
        title: 'Payment Expired',
        message: `Fawry payment reference for order ${order.orderNumber} has expired`,
        entityId: order.id,
        entityType: 'Order',
      },
    });

    return { success: false, message: 'Payment expired' };
  }

  return { success: true, message: 'Callback processed' };
};
