/**
 * Review Validation Schemas
 *
 * Zod validation schemas for review-related requests
 */

import { z } from 'zod';

// ============================================
// Review Schemas
// ============================================

/**
 * Schema for creating a review
 */
export const createReviewSchema = z.object({
  body: z.object({
    transactionId: z.string().uuid('Invalid transaction ID'),
    reviewedId: z.string().uuid('Invalid reviewed user ID'),
    reviewType: z.enum(['SELLER_REVIEW', 'BUYER_REVIEW', 'ITEM_REVIEW']).optional(),

    // Ratings (1-5 stars)
    overallRating: z
      .number()
      .int('Overall rating must be an integer')
      .min(1, 'Overall rating must be at least 1')
      .max(5, 'Overall rating must be at most 5'),

    itemAsDescribed: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .optional(),

    communication: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .optional(),

    shippingSpeed: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .optional(),

    packaging: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .optional(),

    // Content
    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters')
      .optional(),

    comment: z
      .string()
      .min(10, 'Comment must be at least 10 characters')
      .max(2000, 'Comment must be at most 2000 characters')
      .optional(),

    images: z
      .array(z.string().url('Invalid image URL'))
      .max(5, 'Maximum 5 images allowed')
      .optional(),
  }),
});

/**
 * Schema for updating a review
 */
export const updateReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    overallRating: z
      .number()
      .int('Overall rating must be an integer')
      .min(1, 'Overall rating must be at least 1')
      .max(5, 'Overall rating must be at most 5')
      .optional(),

    itemAsDescribed: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .optional(),

    communication: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .optional(),

    shippingSpeed: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .optional(),

    packaging: z
      .number()
      .int('Rating must be an integer')
      .min(1, 'Rating must be at least 1')
      .max(5, 'Rating must be at most 5')
      .optional(),

    title: z
      .string()
      .min(3, 'Title must be at least 3 characters')
      .max(100, 'Title must be at most 100 characters')
      .optional(),

    comment: z
      .string()
      .min(10, 'Comment must be at least 10 characters')
      .max(2000, 'Comment must be at most 2000 characters')
      .optional(),

    images: z
      .array(z.string().url('Invalid image URL'))
      .max(5, 'Maximum 5 images allowed')
      .optional(),
  }),
});

/**
 * Schema for getting reviews
 */
export const getReviewsSchema = z.object({
  query: z.object({
    reviewedId: z.string().uuid('Invalid user ID').optional(),
    reviewerId: z.string().uuid('Invalid user ID').optional(),
    transactionId: z.string().uuid('Invalid transaction ID').optional(),
    reviewType: z.enum(['SELLER_REVIEW', 'BUYER_REVIEW', 'ITEM_REVIEW']).optional(),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED', 'FLAGGED', 'HIDDEN']).optional(),
    minRating: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1).max(5))
      .optional(),
    maxRating: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1).max(5))
      .optional(),
    isVerifiedPurchase: z
      .string()
      .transform((val) => val === 'true')
      .optional(),
    page: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1))
      .optional(),
    limit: z
      .string()
      .transform(Number)
      .pipe(z.number().int().min(1).max(100))
      .optional(),
    sortBy: z
      .enum(['recent', 'rating_high', 'rating_low', 'helpful'])
      .optional(),
  }),
});

/**
 * Schema for getting a single review
 */
export const getReviewByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
});

/**
 * Schema for deleting a review
 */
export const deleteReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
});

// ============================================
// Review Response Schemas
// ============================================

/**
 * Schema for adding a response to a review
 */
export const addReviewResponseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    message: z
      .string()
      .min(10, 'Response must be at least 10 characters')
      .max(1000, 'Response must be at most 1000 characters'),
  }),
});

/**
 * Schema for updating a review response
 */
export const updateReviewResponseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid response ID'),
  }),
  body: z.object({
    message: z
      .string()
      .min(10, 'Response must be at least 10 characters')
      .max(1000, 'Response must be at most 1000 characters'),
  }),
});

/**
 * Schema for deleting a review response
 */
export const deleteReviewResponseSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid response ID'),
  }),
});

// ============================================
// Review Voting Schemas
// ============================================

/**
 * Schema for voting on a review
 */
export const voteReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    isHelpful: z.boolean({
      required_error: 'isHelpful is required',
      invalid_type_error: 'isHelpful must be a boolean',
    }),
  }),
});

/**
 * Schema for removing a vote
 */
export const removeVoteSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
});

// ============================================
// Review Reporting Schemas
// ============================================

/**
 * Schema for reporting a review
 */
export const reportReviewSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
  body: z.object({
    reason: z.enum([
      'SPAM',
      'OFFENSIVE_LANGUAGE',
      'FAKE_REVIEW',
      'IRRELEVANT',
      'PERSONAL_INFORMATION',
      'OTHER',
    ]),
    description: z
      .string()
      .min(10, 'Description must be at least 10 characters')
      .max(500, 'Description must be at most 500 characters')
      .optional(),
  }),
});

/**
 * Schema for getting review reports
 */
export const getReviewReportsSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid review ID'),
  }),
});

// ============================================
// Statistics Schemas
// ============================================

/**
 * Schema for getting user review statistics
 */
export const getUserReviewStatsSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
});

/**
 * Schema for checking if user can review
 */
export const canReviewTransactionSchema = z.object({
  params: z.object({
    transactionId: z.string().uuid('Invalid transaction ID'),
  }),
});
