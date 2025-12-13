import { z } from 'zod';
import { ListingType, ListingStatus } from '@prisma/client';

// Listing Type validation
const listingTypeEnum = z.nativeEnum(ListingType, {
  errorMap: () => ({ message: 'Invalid listing type' }),
});

// Listing Status validation
const listingStatusEnum = z.nativeEnum(ListingStatus, {
  errorMap: () => ({ message: 'Invalid listing status' }),
});

// Create Direct Sale Listing Schema
export const createSaleListingSchema = z.object({
  body: z.object({
    itemId: z.string().min(1, 'Item ID is required'),
    price: z
      .number()
      .positive('Price must be positive')
      .max(999999999, 'Price is too high'),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .optional(),
    startDate: z
      .string()
      .datetime('Invalid start date')
      .optional()
      .transform((val) => (val ? new Date(val) : undefined)),
    endDate: z
      .string()
      .datetime('Invalid end date')
      .optional()
      .transform((val) => (val ? new Date(val) : undefined))
      .nullable(),
    notes: z
      .string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional(),
  }).refine(
    (data) => {
      if (data.startDate && data.endDate) {
        return data.endDate > data.startDate;
      }
      return true;
    },
    {
      message: 'End date must be after start date',
      path: ['endDate'],
    }
  ),
});

// Update Listing Schema
export const updateListingSchema = z.object({
  body: z.object({
    price: z
      .number()
      .positive('Price must be positive')
      .max(999999999, 'Price is too high')
      .optional(),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .optional(),
    status: listingStatusEnum.optional(),
    endDate: z
      .string()
      .datetime('Invalid end date')
      .optional()
      .transform((val) => (val ? new Date(val) : undefined))
      .nullable(),
    notes: z
      .string()
      .max(1000, 'Notes must not exceed 1000 characters')
      .optional(),
  }),
});

// Get Listing by ID Schema
export const getListingByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Listing ID is required'),
  }),
});

// Delete Listing Schema
export const deleteListingSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Listing ID is required'),
  }),
});

// Get User Listings Schema
export const getUserListingsSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
  query: z.object({
    type: listingTypeEnum.optional(),
    status: listingStatusEnum.optional(),
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

// Search Listings Schema
export const searchListingsSchema = z.object({
  query: z.object({
    search: z.string().optional(),
    categoryId: z.string().min(1).optional(),
    sellerId: z.string().min(1).optional(),
    type: listingTypeEnum.optional(),
    status: listingStatusEnum.optional(),
    minPrice: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().nonnegative())
      .optional(),
    maxPrice: z
      .string()
      .transform((val) => parseFloat(val))
      .pipe(z.number().nonnegative())
      .optional(),
    governorate: z.string().optional(),
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
    sortBy: z
      .enum(['createdAt', 'price', 'endDate'])
      .default('createdAt')
      .optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  }),
});

// Activate Listing Schema
export const activateListingSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Listing ID is required'),
  }),
});

// Cancel Listing Schema
export const cancelListingSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Listing ID is required'),
  }),
});

// Mark Listing as Sold Schema
export const markListingAsSoldSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Listing ID is required'),
  }),
});
