import { z } from 'zod';
import { ItemCondition } from '@prisma/client';

// Egyptian Governorates (English and Arabic names)
export const EGYPTIAN_GOVERNORATES = [
  // English names
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
  // Arabic names
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'البحر الأحمر',
  'البحيرة',
  'الفيوم',
  'الغربية',
  'الإسماعيلية',
  'المنوفية',
  'المنيا',
  'القليوبية',
  'الوادي الجديد',
  'السويس',
  'أسوان',
  'أسيوط',
  'بني سويف',
  'بورسعيد',
  'دمياط',
  'الشرقية',
  'جنوب سيناء',
  'كفر الشيخ',
  'مطروح',
  'الأقصر',
  'قنا',
  'شمال سيناء',
  'سوهاج',
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
    categoryId: z.string().min(1, 'Category ID is required'),
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
    }).optional(), // Made optional since Item model doesn't have this field
    // Barter preferences
    desiredCategoryId: z.string().min(1).optional(),
    desiredKeywords: z.string().max(500, 'Keywords must not exceed 500 characters').optional(),
    desiredValueMin: z.number().positive('Minimum value must be positive').optional(),
    desiredValueMax: z.number().positive('Maximum value must be positive').optional(),
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
    categoryId: z.string().min(1).optional(),
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
    id: z.string().min(1, 'Item ID is required'),
  }),
});

// Delete Item Schema
export const deleteItemSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Item ID is required'),
  }),
});

// Search/Filter Items Schema
export const searchItemsSchema = z.object({
  query: z.object({
    // Search
    search: z.string().optional(),

    // Filters
    categoryId: z.string().min(1).optional(),
    sellerId: z.string().min(1).optional(),
    condition: itemConditionEnum.optional(),
    status: z.enum(['DRAFT', 'ACTIVE', 'SOLD', 'TRADED', 'ARCHIVED', 'DELETED']).optional(),
    governorate: z
      .enum(EGYPTIAN_GOVERNORATES, {
        errorMap: () => ({ message: 'Invalid governorate' }),
      })
      .optional(),
    city: z.string().optional(),
    district: z.string().optional(),
    minPrice: z.string().optional(),
    maxPrice: z.string().optional(),

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
      .enum(['createdAt', 'updatedAt', 'titleAr', 'titleEn', 'title'])
      .default('createdAt')
      .optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc').optional(),
  }),
});

// Get User Items Schema
export const getUserItemsSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
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
    categoryId: z.string().min(1, 'Category ID is required'),
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
    id: z.string().min(1, 'Item ID is required'),
  }),
  body: z.object({
    imagesToRemove: z
      .array(z.string().url('Invalid image URL'))
      .min(1, 'At least one image URL must be provided')
      .max(10, 'Cannot remove more than 10 images at once'),
  }),
});
