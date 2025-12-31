import { z } from 'zod';

// =====================================================
// WALLET SCHEMAS
// =====================================================

// GET /api/v1/wallet/transactions
export const getTransactionsSchema = z.object({
  query: z.object({
    page: z.string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1, 'الصفحة يجب أن تكون 1 أو أكثر'))
      .optional()
      .default('1'),
    limit: z.string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100, 'الحد الأقصى 100'))
      .optional()
      .default('20'),
    type: z.enum([
      'EARN',
      'SPEND',
      'TRANSFER_IN',
      'TRANSFER_OUT',
      'REFERRAL_BONUS',
      'DAILY_LOGIN',
      'PROMOTION_SPEND',
      'PURCHASE_REWARD',
      'LISTING_REWARD',
      'REVIEW_REWARD',
    ]).optional(),
  }),
});

// POST /api/v1/wallet/transfer
export const transferSchema = z.object({
  body: z.object({
    toUserId: z.string().min(1, 'معرف المستلم مطلوب'),
    amount: z.number()
      .int('المبلغ يجب أن يكون عدداً صحيحاً')
      .positive('المبلغ يجب أن يكون أكبر من صفر')
      .max(10000, 'الحد الأقصى للتحويل 10,000 XCoin'),
    description: z.string()
      .max(200, 'الوصف يجب ألا يتجاوز 200 حرف')
      .optional(),
  }),
});

// POST /api/v1/wallet/redeem
export const redeemSchema = z.object({
  body: z.object({
    amount: z.number()
      .int('المبلغ يجب أن يكون عدداً صحيحاً')
      .positive('المبلغ يجب أن يكون أكبر من صفر'),
    redeemType: z.enum(['DISCOUNT', 'PROMOTION', 'CASH_OUT']).optional(),
    relatedEntityId: z.string().optional(),
  }),
});

// Type exports
export type TransferInput = z.infer<typeof transferSchema>['body'];
export type RedeemInput = z.infer<typeof redeemSchema>['body'];
export type GetTransactionsQuery = z.infer<typeof getTransactionsSchema>['query'];
