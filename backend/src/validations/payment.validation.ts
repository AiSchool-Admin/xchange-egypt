import { z } from 'zod';

// Payment method enum
const paymentMethodEnum = z.enum([
  'PAYMOB_CARD',
  'PAYMOB_WALLET',
  'PAYMOB_KIOSK',
  'INSTAPAY',
  'FAWRY',
  'VODAFONE_CASH',
  'CASH_ON_DELIVERY',
]);

// Egyptian phone number validation
const egyptianPhoneSchema = z.string()
  .regex(/^(\+201|01)[0-9]{9}$/, 'يجب أن يكون رقم هاتف مصري صحيح');

// =====================================================
// UNIFIED PAYMENT GATEWAY SCHEMAS
// =====================================================

// GET /api/v1/payment/methods
export const getPaymentMethodsSchema = z.object({
  query: z.object({
    amount: z.string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().positive('المبلغ يجب أن يكون موجباً'))
      .optional(),
  }),
});

// GET /api/v1/payment/fees
export const calculateFeesSchema = z.object({
  query: z.object({
    amount: z.string()
      .min(1, 'المبلغ مطلوب')
      .transform((val) => parseFloat(val))
      .pipe(z.number().positive('المبلغ يجب أن يكون موجباً')),
    method: paymentMethodEnum,
  }),
});

// POST /api/v1/payment/initiate
export const initiatePaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'معرف الطلب مطلوب'),
    method: paymentMethodEnum,
    walletPhone: egyptianPhoneSchema.optional(),
  }),
});

// GET /api/v1/payment/status/:transactionId
export const checkPaymentStatusSchema = z.object({
  params: z.object({
    transactionId: z.string().min(1, 'معرف المعاملة مطلوب'),
  }),
  query: z.object({
    method: paymentMethodEnum,
  }),
});

// POST /api/v1/payment/refund
export const processRefundSchema = z.object({
  body: z.object({
    transactionId: z.string().min(1, 'معرف المعاملة مطلوب'),
    method: paymentMethodEnum,
    amount: z.number().positive('المبلغ يجب أن يكون موجباً').optional(),
    reason: z.string().max(500, 'السبب يجب ألا يتجاوز 500 حرف').optional(),
  }),
});

// =====================================================
// INSTAPAY SCHEMAS
// =====================================================

// POST /api/v1/payment/instapay/initiate
export const initiateInstapaySchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'معرف الطلب مطلوب'),
  }),
});

// GET /api/v1/payment/instapay/verify/:transactionId
export const verifyInstapaySchema = z.object({
  params: z.object({
    transactionId: z.string().min(1, 'معرف المعاملة مطلوب'),
  }),
});

// =====================================================
// FAWRY SCHEMAS
// =====================================================

// POST /api/v1/payment/fawry/create
export const createFawryPaymentSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'معرف الطلب مطلوب'),
    paymentMethod: z.string().optional(),
  }),
});

// GET /api/v1/payment/fawry/status/:referenceNumber
export const checkFawryStatusSchema = z.object({
  params: z.object({
    referenceNumber: z.string().min(1, 'رقم المرجع مطلوب'),
  }),
});

// =====================================================
// PAYMOB SCHEMAS
// =====================================================

// POST /api/v1/payment/paymob/card
export const initiatePaymobCardSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'معرف الطلب مطلوب'),
  }),
});

// POST /api/v1/payment/paymob/wallet
export const initiatePaymobWalletSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'معرف الطلب مطلوب'),
    walletPhone: egyptianPhoneSchema,
  }),
});

// POST /api/v1/payment/paymob/kiosk
export const initiatePaymobKioskSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'معرف الطلب مطلوب'),
  }),
});

// GET /api/v1/payment/paymob/status/:transactionId
export const getPaymobStatusSchema = z.object({
  params: z.object({
    transactionId: z.string().min(1, 'معرف المعاملة مطلوب'),
  }),
});

// POST /api/v1/payment/paymob/refund
export const refundPaymobSchema = z.object({
  body: z.object({
    transactionId: z.string().min(1, 'معرف المعاملة مطلوب'),
    amount: z.number().positive('المبلغ يجب أن يكون موجباً').optional(),
  }),
});

// =====================================================
// VODAFONE CASH SCHEMAS
// =====================================================

// POST /api/v1/payment/vodafone/initiate
export const initiateVodafoneCashSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'معرف الطلب مطلوب'),
    customerPhone: egyptianPhoneSchema.optional(),
  }),
});

// GET /api/v1/payment/vodafone/status/:transactionId
export const checkVodafoneCashStatusSchema = z.object({
  params: z.object({
    transactionId: z.string().min(1, 'معرف المعاملة مطلوب'),
  }),
});

// POST /api/v1/payment/vodafone/refund
export const refundVodafoneCashSchema = z.object({
  body: z.object({
    transactionId: z.string().min(1, 'معرف المعاملة مطلوب'),
    amount: z.number().positive('المبلغ يجب أن يكون موجباً'),
    reason: z.string().max(500, 'السبب يجب ألا يتجاوز 500 حرف').optional(),
  }),
});

// =====================================================
// CASH ON DELIVERY SCHEMAS
// =====================================================

// POST /api/v1/payment/cod/confirm
export const confirmCodSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'معرف الطلب مطلوب'),
  }),
});

// POST /api/v1/payment/cod/collected
export const markCodCollectedSchema = z.object({
  body: z.object({
    orderId: z.string().min(1, 'معرف الطلب مطلوب'),
    collectedAmount: z.number().positive('المبلغ المحصل يجب أن يكون موجباً'),
    collectorId: z.string().min(1, 'معرف المحصل مطلوب').optional(),
  }),
});

// Type exports
export type InitiatePaymentInput = z.infer<typeof initiatePaymentSchema>['body'];
export type ProcessRefundInput = z.infer<typeof processRefundSchema>['body'];
export type CalculateFeesQuery = z.infer<typeof calculateFeesSchema>['query'];
