import { z } from 'zod';

// Create Auction Schema
export const createAuctionSchema = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    startingPrice: z.number().positive('Starting price must be positive'),
    buyNowPrice: z.number().positive('Buy now price must be positive').optional(),
    reservePrice: z.number().positive('Reserve price must be positive').optional(),
    minBidIncrement: z.number().positive('Minimum bid increment must be positive').default(1.0),

    // Timing - Accept flexible date formats (ISO 8601, date strings, timestamps)
    startTime: z.string().min(1, 'Start time is required').transform((val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid start time format');
      }
      return date;
    }),
    endTime: z.string().min(1, 'End time is required').transform((val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid end time format');
      }
      return date;
    }),

    // Auto-extension settings
    autoExtend: z.boolean().default(true),
    extensionMinutes: z.number().int().min(1).max(30).default(5),
    extensionThreshold: z.number().int().min(1).max(15).default(5),
    maxExtensions: z.number().int().min(0).max(10).default(3),
  }).refine(
    (data) => {
      const start = new Date(data.startTime);
      const end = new Date(data.endTime);
      return end > start;
    },
    { message: 'End time must be after start time', path: ['endTime'] }
  ).refine(
    (data) => {
      const start = new Date(data.startTime);
      return start > new Date();
    },
    { message: 'Start time must be in the future', path: ['startTime'] }
  ).refine(
    (data) => {
      if (data.reservePrice && data.startingPrice) {
        return data.reservePrice >= data.startingPrice;
      }
      return true;
    },
    { message: 'Reserve price must be greater than or equal to starting price', path: ['reservePrice'] }
  ).refine(
    (data) => {
      if (data.buyNowPrice && data.startingPrice) {
        return data.buyNowPrice > data.startingPrice;
      }
      return true;
    },
    { message: 'Buy now price must be greater than starting price', path: ['buyNowPrice'] }
  ),
});

// Update Auction Schema
export const updateAuctionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Auction ID is required'),
  }),
  body: z.object({
    buyNowPrice: z.number().positive('Buy now price must be positive').optional(),
    reservePrice: z.number().positive('Reserve price must be positive').optional(),
    endTime: z.string().min(1).transform((val) => {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid end time format');
      }
      return date;
    }).optional(),
    autoExtend: z.boolean().optional(),
    extensionMinutes: z.number().int().min(1).max(30).optional(),
    maxExtensions: z.number().int().min(0).max(10).optional(),
  }),
});

// Place Bid Schema
export const placeBidSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Auction ID is required'),
  }),
  body: z.object({
    bidAmount: z.number().positive('Bid amount must be positive'),
    maxAutoBid: z.number().positive('Maximum auto-bid must be positive').optional(),
  }).refine(
    (data) => {
      if (data.maxAutoBid && data.bidAmount) {
        return data.maxAutoBid >= data.bidAmount;
      }
      return true;
    },
    { message: 'Maximum auto-bid must be greater than or equal to bid amount', path: ['maxAutoBid'] }
  ),
});

// Buy Now Schema
export const buyNowSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Auction ID is required'),
  }),
});

// Get Auction Schema
export const getAuctionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Auction ID is required'),
  }),
});

// List Auctions Schema
export const listAuctionsSchema = z.object({
  query: z.object({
    status: z.enum(['DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED', 'COMPLETED']).optional(),
    categoryId: z.string().min(1).optional(),
    minPrice: z.string().transform((val) => parseFloat(val)).optional(),
    maxPrice: z.string().transform((val) => parseFloat(val)).optional(),
    sortBy: z.enum(['price', 'endTime', 'bids', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    page: z.string().transform((val) => parseInt(val, 10)).default('1'),
    limit: z.string().transform((val) => parseInt(val, 10)).default('20'),
  }),
});

// Get Auction Bids Schema
export const getAuctionBidsSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Auction ID is required'),
  }),
  query: z.object({
    page: z.string().transform((val) => parseInt(val, 10)).default('1'),
    limit: z.string().transform((val) => parseInt(val, 10)).default('50'),
  }),
});

// Cancel Auction Schema
export const cancelAuctionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Auction ID is required'),
  }),
  body: z.object({
    reason: z.string().min(10, 'Cancellation reason must be at least 10 characters').optional(),
  }),
});

// End Auction Schema (Admin only)
export const endAuctionSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Auction ID is required'),
  }),
});

export type CreateAuctionInput = z.infer<typeof createAuctionSchema>['body'];
export type UpdateAuctionInput = z.infer<typeof updateAuctionSchema>['body'];
export type PlaceBidInput = z.infer<typeof placeBidSchema>['body'];
export type ListAuctionsQuery = z.infer<typeof listAuctionsSchema>['query'];
