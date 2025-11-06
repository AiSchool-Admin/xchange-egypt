import { z } from 'zod';
import { TransactionStatus, PaymentMethod } from '@prisma/client';

// Transaction Status validation
const transactionStatusEnum = z.nativeEnum(TransactionStatus, {
  errorMap: () => ({ message: 'Invalid transaction status' }),
});

// Payment Method validation
const paymentMethodEnum = z.nativeEnum(PaymentMethod, {
  errorMap: () => ({ message: 'Invalid payment method' }),
});

// Create Purchase Transaction Schema
export const createPurchaseSchema = z.object({
  body: z.object({
    listingId: z.string().uuid('Invalid listing ID'),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .default(1),
    paymentMethod: paymentMethodEnum,
    shippingAddress: z
      .string()
      .min(10, 'Shipping address must be at least 10 characters')
      .max(500, 'Shipping address must not exceed 500 characters'),
    notes: z
      .string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional(),
  }),
});

// Update Transaction Status Schema
export const updateTransactionStatusSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
  body: z.object({
    status: transactionStatusEnum,
    notes: z
      .string()
      .max(500, 'Notes must not exceed 500 characters')
      .optional(),
  }),
});

// Confirm Payment Schema
export const confirmPaymentSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
  body: z.object({
    paymentReference: z
      .string()
      .min(5, 'Payment reference must be at least 5 characters')
      .max(100, 'Payment reference must not exceed 100 characters')
      .optional(),
  }),
});

// Mark as Shipped Schema
export const markAsShippedSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
  body: z.object({
    trackingNumber: z
      .string()
      .min(5, 'Tracking number must be at least 5 characters')
      .max(100, 'Tracking number must not exceed 100 characters')
      .optional(),
  }),
});

// Mark as Delivered Schema
export const markAsDeliveredSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
});

// Cancel Transaction Schema
export const cancelTransactionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
  body: z.object({
    reason: z
      .string()
      .min(10, 'Cancellation reason must be at least 10 characters')
      .max(500, 'Cancellation reason must not exceed 500 characters'),
  }),
});

// Get Transaction by ID Schema
export const getTransactionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid transaction ID'),
  }),
});

// Get User Transactions Schema
export const getUserTransactionsSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
  query: z.object({
    role: z.enum(['buyer', 'seller']).optional(),
    status: transactionStatusEnum.optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1))
      .default('1')
      .optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100))
      .default('20')
      .optional(),
  }),
});

// Get My Transactions Schema (authenticated user)
export const getMyTransactionsSchema = z.object({
  query: z.object({
    role: z.enum(['buyer', 'seller']).optional(),
    status: transactionStatusEnum.optional(),
    page: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1))
      .default('1')
      .optional(),
    limit: z
      .string()
      .transform((val) => parseInt(val, 10))
      .pipe(z.number().int().min(1).max(100))
      .default('20')
      .optional(),
  }),
});
