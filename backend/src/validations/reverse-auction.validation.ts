/**
 * Reverse Auction Validation Schemas
 *
 * Zod schemas for validating reverse auction requests
 */

import { z } from 'zod';

// ============================================
// Enum Schemas
// ============================================

const itemConditionSchema = z.enum(['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR']);
const deliveryOptionSchema = z.enum(['PICKUP', 'DELIVERY', 'BOTH']);
const reverseAuctionStatusSchema = z.enum([
  'DRAFT',
  'ACTIVE',
  'ENDED',
  'AWARDED',
  'COMPLETED',
  'CANCELLED',
  'EXPIRED',
]);
const bidStatusSchema = z.enum([
  'ACTIVE',
  'OUTBID',
  'WINNING',
  'WON',
  'LOST',
  'WITHDRAWN',
  'REJECTED',
]);

// ============================================
// Reverse Auction Schemas
// ============================================

/**
 * Create Reverse Auction Schema
 * POST /api/v1/reverse-auctions
 */
export const createReverseAuctionSchema = z.object({
  body: z
    .object({
      title: z
        .string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must not exceed 200 characters')
        .trim(),
      description: z
        .string()
        .min(20, 'Description must be at least 20 characters')
        .max(2000, 'Description must not exceed 2000 characters')
        .trim(),
      categoryId: z.string().uuid('Invalid category ID'),
      condition: itemConditionSchema,
      specifications: z.record(z.any()).optional(),
      quantity: z
        .number()
        .int('Quantity must be an integer')
        .min(1, 'Quantity must be at least 1')
        .max(1000, 'Quantity must not exceed 1000')
        .default(1)
        .optional(),
      location: z.string().max(200, 'Location must not exceed 200 characters').optional(),
      deliveryPreference: deliveryOptionSchema.optional(),
      maxBudget: z
        .number()
        .positive('Max budget must be positive')
        .max(10000000, 'Max budget must not exceed 10,000,000 EGP')
        .optional(),
      targetPrice: z
        .number()
        .positive('Target price must be positive')
        .max(10000000, 'Target price must not exceed 10,000,000 EGP')
        .optional(),
      endDate: z
        .string()
        .datetime('Invalid end date')
        .transform((val) => new Date(val)),
      publicNotes: z
        .string()
        .max(1000, 'Public notes must not exceed 1000 characters')
        .optional(),
      buyerNotes: z
        .string()
        .max(1000, 'Buyer notes must not exceed 1000 characters')
        .optional(),
    })
    .refine(
      (data) => {
        // End date must be in the future
        return new Date(data.endDate) > new Date();
      },
      {
        message: 'End date must be in the future',
        path: ['endDate'],
      }
    )
    .refine(
      (data) => {
        // End date must be within 90 days
        const maxDate = new Date();
        maxDate.setDate(maxDate.getDate() + 90);
        return new Date(data.endDate) <= maxDate;
      },
      {
        message: 'End date must be within 90 days from now',
        path: ['endDate'],
      }
    )
    .refine(
      (data) => {
        // Target price must not exceed max budget
        if (data.maxBudget && data.targetPrice) {
          return data.targetPrice <= data.maxBudget;
        }
        return true;
      },
      {
        message: 'Target price cannot exceed max budget',
        path: ['targetPrice'],
      }
    ),
});

/**
 * Get Reverse Auctions Schema
 * GET /api/v1/reverse-auctions
 */
export const getReverseAuctionsSchema = z.object({
  query: z.object({
    status: reverseAuctionStatusSchema.optional(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    condition: itemConditionSchema.optional(),
    buyerId: z.string().uuid('Invalid buyer ID').optional(),
    minBudget: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().positive())
      .optional(),
    maxBudget: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().positive())
      .optional(),
    location: z.string().optional(),
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

/**
 * Get Single Reverse Auction Schema
 * GET /api/v1/reverse-auctions/:id
 */
export const getReverseAuctionByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid auction ID'),
  }),
});

/**
 * Update Reverse Auction Schema
 * PATCH /api/v1/reverse-auctions/:id
 */
export const updateReverseAuctionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid auction ID'),
  }),
  body: z
    .object({
      title: z
        .string()
        .min(5, 'Title must be at least 5 characters')
        .max(200, 'Title must not exceed 200 characters')
        .trim()
        .optional(),
      description: z
        .string()
        .min(20, 'Description must be at least 20 characters')
        .max(2000, 'Description must not exceed 2000 characters')
        .trim()
        .optional(),
      condition: itemConditionSchema.optional(),
      specifications: z.record(z.any()).optional(),
      maxBudget: z
        .number()
        .positive('Max budget must be positive')
        .max(10000000, 'Max budget must not exceed 10,000,000 EGP')
        .optional(),
      targetPrice: z
        .number()
        .positive('Target price must be positive')
        .max(10000000, 'Target price must not exceed 10,000,000 EGP')
        .optional(),
      endDate: z
        .string()
        .datetime('Invalid end date')
        .transform((val) => new Date(val))
        .optional(),
      publicNotes: z
        .string()
        .max(1000, 'Public notes must not exceed 1000 characters')
        .optional(),
      buyerNotes: z
        .string()
        .max(1000, 'Buyer notes must not exceed 1000 characters')
        .optional(),
    })
    .refine(
      (data) => {
        // If end date provided, must be in the future
        if (data.endDate) {
          return new Date(data.endDate) > new Date();
        }
        return true;
      },
      {
        message: 'End date must be in the future',
        path: ['endDate'],
      }
    )
    .refine(
      (data) => {
        // Target price must not exceed max budget
        if (data.maxBudget && data.targetPrice) {
          return data.targetPrice <= data.maxBudget;
        }
        return true;
      },
      {
        message: 'Target price cannot exceed max budget',
        path: ['targetPrice'],
      }
    ),
});

/**
 * Cancel Reverse Auction Schema
 * POST /api/v1/reverse-auctions/:id/cancel
 */
export const cancelReverseAuctionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid auction ID'),
  }),
});

/**
 * Delete Reverse Auction Schema
 * DELETE /api/v1/reverse-auctions/:id
 */
export const deleteReverseAuctionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid auction ID'),
  }),
});

// ============================================
// Bid Schemas
// ============================================

/**
 * Submit Bid Schema
 * POST /api/v1/reverse-auctions/:id/bids
 */
export const submitBidSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid auction ID'),
  }),
  body: z.object({
    bidAmount: z
      .number()
      .positive('Bid amount must be positive')
      .max(10000000, 'Bid amount must not exceed 10,000,000 EGP'),
    itemId: z.string().uuid('Invalid item ID').optional(),
    itemCondition: itemConditionSchema,
    itemDescription: z
      .string()
      .min(10, 'Item description must be at least 10 characters')
      .max(1000, 'Item description must not exceed 1000 characters')
      .optional(),
    itemImages: z
      .array(z.string().url('Invalid image URL'))
      .max(10, 'Maximum 10 images allowed')
      .default([])
      .optional(),
    deliveryOption: deliveryOptionSchema,
    deliveryDays: z
      .number()
      .int('Delivery days must be an integer')
      .min(0, 'Delivery days must be non-negative')
      .max(365, 'Delivery days must not exceed 365')
      .optional(),
    deliveryCost: z
      .number()
      .min(0, 'Delivery cost must be non-negative')
      .max(10000, 'Delivery cost must not exceed 10,000 EGP')
      .default(0)
      .optional(),
    notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  }),
});

/**
 * Get Bids Schema
 * GET /api/v1/reverse-auctions/:id/bids
 */
export const getBidsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid auction ID'),
  }),
});

/**
 * Update Bid Schema
 * PATCH /api/v1/reverse-auctions/bids/:bidId
 */
export const updateBidSchema = z.object({
  params: z.object({
    bidId: z.string().uuid('Invalid bid ID'),
  }),
  body: z.object({
    bidAmount: z
      .number()
      .positive('Bid amount must be positive')
      .max(10000000, 'Bid amount must not exceed 10,000,000 EGP')
      .optional(),
    itemDescription: z
      .string()
      .min(10, 'Item description must be at least 10 characters')
      .max(1000, 'Item description must not exceed 1000 characters')
      .optional(),
    itemImages: z
      .array(z.string().url('Invalid image URL'))
      .max(10, 'Maximum 10 images allowed')
      .optional(),
    deliveryOption: deliveryOptionSchema.optional(),
    deliveryDays: z
      .number()
      .int('Delivery days must be an integer')
      .min(0, 'Delivery days must be non-negative')
      .max(365, 'Delivery days must not exceed 365')
      .optional(),
    deliveryCost: z
      .number()
      .min(0, 'Delivery cost must be non-negative')
      .max(10000, 'Delivery cost must not exceed 10,000 EGP')
      .optional(),
    notes: z.string().max(500, 'Notes must not exceed 500 characters').optional(),
  }),
});

/**
 * Withdraw Bid Schema
 * POST /api/v1/reverse-auctions/bids/:bidId/withdraw
 */
export const withdrawBidSchema = z.object({
  params: z.object({
    bidId: z.string().uuid('Invalid bid ID'),
  }),
});

/**
 * Get My Bids Schema
 * GET /api/v1/reverse-auctions/bids/my-bids
 */
export const getMyBidsSchema = z.object({
  query: z.object({
    status: bidStatusSchema.optional(),
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

// ============================================
// Award & Complete Schemas
// ============================================

/**
 * Award Auction Schema
 * POST /api/v1/reverse-auctions/:id/award
 */
export const awardAuctionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid auction ID'),
  }),
  body: z.object({
    bidId: z.string().uuid('Invalid bid ID'),
  }),
});

/**
 * Complete Auction Schema
 * POST /api/v1/reverse-auctions/:id/complete
 */
export const completeAuctionSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid auction ID'),
  }),
});

/**
 * Get Statistics Schema
 * GET /api/v1/reverse-auctions/stats
 */
export const getStatisticsSchema = z.object({
  query: z.object({}),
});
