import { z } from 'zod';

/**
 * Add item to cart validation schema
 * Accepts either listingId or itemId (for flexibility)
 */
export const addToCartSchema = z.object({
  body: z.object({
    // Accept either listingId or itemId
    listingId: z.string().uuid('Invalid ID format').optional(),
    itemId: z.string().uuid('Invalid ID format').optional(),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .max(100, 'Quantity cannot exceed 100')
      .optional()
      .default(1),
  }).refine(
    (data) => data.listingId || data.itemId,
    { message: 'Either listingId or itemId is required' }
  ),
});

/**
 * Update cart item quantity validation schema
 */
export const updateCartItemSchema = z.object({
  params: z.object({
    listingId: z.string().uuid('Invalid listing ID format'),
  }),
  body: z.object({
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .max(100, 'Quantity cannot exceed 100'),
  }),
});

/**
 * Remove item from cart validation schema
 */
export const removeFromCartSchema = z.object({
  params: z.object({
    listingId: z.string().uuid('Invalid listing ID format'),
  }),
});

/**
 * Types inferred from schemas
 */
export type AddToCartInput = z.infer<typeof addToCartSchema>['body'];
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
export type RemoveFromCartInput = z.infer<typeof removeFromCartSchema>;
