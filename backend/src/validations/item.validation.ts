import { z } from 'zod';
import { ItemCondition } from '@prisma/client';

// Egyptian Governorates
export const EGYPTIAN_GOVERNORATES = [
  'Cairo',
  'Giza',
  'Alexandria',
  'Dakahlia',
  'Red Sea',
  'Beheira',
  'Fayoum',
  'Gharbiya',
  'Ismailia',
  'Menofia',
  'Minya',
  'Qaliubiya',
  'New Valley',
  'Suez',
  'Aswan',
  'Assiut',
  'Beni Suef',
  'Port Said',
  'Damietta',
  'Sharkia',
  'South Sinai',
  'Kafr El Sheikh',
  'Matrouh',
  'Luxor',
  'Qena',
  'North Sinai',
  'Sohag',
] as const;

// Item Condition validation
const itemConditionEnum = z.nativeEnum(ItemCondition, {
  errorMap: () => ({ message: 'Invalid item condition' }),
});

// Create Item Schema
export const createItemSchema = z.object({
  body: z.object({
    titleAr: z
      .string()
      .min(3, 'Arabic title must be at least 3 characters')
      .max(200, 'Arabic title must not exceed 200 characters'),
    titleEn: z
      .string()
      .min(3, 'English title must be at least 3 characters')
      .max(200, 'English title must not exceed 200 characters')
      .optional(),
    descriptionAr: z
      .string()
      .min(10, 'Arabic description must be at least 10 characters')
      .max(5000, 'Arabic description must not exceed 5000 characters'),
    descriptionEn: z
      .string()
      .min(10, 'English description must be at least 10 characters')
      .max(5000, 'English description must not exceed 5000 characters')
      .optional(),
    categoryId: z.string().uuid('Invalid category ID'),
    condition: itemConditionEnum,
    estimatedValue: z
      .number()
      .positive('Estimated value must be positive')
      .optional()
      .default(0),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .default(1),
    location: z
      .string()
      .min(3, 'Location must be at least 3 characters')
      .max(200, 'Location must not exceed 200 characters'),
    governorate: z.enum(EGYPTIAN_GOVERNORATES, {
      errorMap: () => ({ message: 'Invalid governorate' }),
    }),
  }),
});

// Update Item Schema
export const updateItemSchema = z.object({
  body: z.object({
    titleAr: z
      .string()
      .min(3, 'Arabic title must be at least 3 characters')
      .max(200, 'Arabic title must not exceed 200 characters')
      .optional(),
    titleEn: z
      .string()
      .min(3, 'English title must be at least 3 characters')
      .max(200, 'English title must not exceed 200 characters')
      .optional()
      .nullable(),
    descriptionAr: z
      .string()
      .min(10, 'Arabic description must be at least 10 characters')
      .max(5000, 'Arabic description must not exceed 5000 characters')
      .optional(),
    descriptionEn: z
      .string()
      .min(10, 'English description must be at least 10 characters')
      .max(5000, 'English description must not exceed 5000 characters')
      .optional()
      .nullable(),
    categoryId: z.string().uuid('Invalid category ID').optional(),
    condition: itemConditionEnum.optional(),
    estimatedValue: z
      .number()
      .positive('Estimated value must be positive')
      .optional(),
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .min(1, 'Quantity must be at least 1')
      .optional(),
    location: z
      .string()
      .min(3, 'Location must be at least 3 characters')
      .max(200, 'Location must not exceed 200 characters')
      .optional(),
    governorate: z
      .enum(EGYPTIAN_GOVERNORATES, {
        errorMap: () => ({ message: 'Invalid governorate' }),
      })
      .optional(),
    imageUrls: z.array(z.string().url('Invalid image URL')).optional(),
  }),
});

// Get Item by ID Schema
export const getItemByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid item ID'),
  }),
});

// Delete Item Schema
export const deleteItemSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid item ID'),
  }),
});

// Search/Filter Items Schema
export const searchItemsSchema = z.object({
  query: z.object({
    // Search
    search: z.string().optional(),

    // Filters
    categoryId: z.string().uuid('Invalid category ID').optional(),
    sellerId: z.string().uuid('Invalid seller ID').optional(),
    condition: itemConditionEnum.optional(),
    governorate: z
      .enum(EGYPTIAN_GOVERNORATES, {
        errorMap: () => ({ message: 'Invalid governorate' }),
      })
      .optional(),

    // Pagination
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

    // Sorting
    sortBy: z
      .enum(['createdAt', 'updatedAt', 'titleAr', 'titleEn'])
      .default('createdAt')
      .optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  }),
});

// Get User Items Schema
export const getUserItemsSchema = z.object({
  params: z.object({
    userId: z.string().uuid('Invalid user ID'),
  }),
  query: z.object({
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

// Get Category Items Schema
export const getCategoryItemsSchema = z.object({
  params: z.object({
    categoryId: z.string().uuid('Invalid category ID'),
  }),
  query: z.object({
    includeSubcategories: z
      .string()
      .transform((val) => val === 'true')
      .default('false')
      .optional(),
    condition: itemConditionEnum.optional(),
    governorate: z
      .enum(EGYPTIAN_GOVERNORATES, {
        errorMap: () => ({ message: 'Invalid governorate' }),
      })
      .optional(),
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
      .enum(['createdAt', 'updatedAt', 'titleAr', 'titleEn'])
      .default('createdAt')
      .optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  }),
});

// Update Item Images Schema (for removing specific images)
export const updateItemImagesSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid item ID'),
  }),
  body: z.object({
    imagesToRemove: z
      .array(z.string().url('Invalid image URL'))
      .min(1, 'At least one image URL must be provided')
      .max(10, 'Cannot remove more than 10 images at once'),
  }),
});
