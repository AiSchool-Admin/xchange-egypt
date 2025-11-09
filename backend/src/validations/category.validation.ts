import { z } from 'zod';

/**
 * Create category validation schema
 */
export const createCategorySchema = z.object({
  body: z.object({
    nameAr: z.string().min(2, 'Arabic name must be at least 2 characters'),
    nameEn: z.string().min(2, 'English name must be at least 2 characters'),
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only'),
    description: z.string().optional(),
    icon: z.string().optional(),
    image: z.string().optional(),
    parentId: z.string().uuid('Invalid parent ID').optional().nullable(),
    order: z.number().int().min(0).default(0).optional(),
    isActive: z.boolean().default(true).optional(),
  }),
});

/**
 * Update category validation schema
 */
export const updateCategorySchema = z.object({
  body: z.object({
    nameAr: z.string().min(2, 'Arabic name must be at least 2 characters').optional(),
    nameEn: z.string().min(2, 'English name must be at least 2 characters').optional(),
    slug: z
      .string()
      .min(2, 'Slug must be at least 2 characters')
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase with hyphens only')
      .optional(),
    description: z.string().optional().nullable(),
    icon: z.string().optional().nullable(),
    image: z.string().optional().nullable(),
    parentId: z.string().uuid('Invalid parent ID').optional().nullable(),
    order: z.number().int().min(0).optional(),
    isActive: z.boolean().optional(),
  }),
});

/**
 * Get category by ID param
 */
export const getCategoryByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid category ID'),
  }),
});

/**
 * Get category by slug param
 */
export const getCategoryBySlugSchema = z.object({
  params: z.object({
    slug: z.string().min(1, 'Slug is required'),
  }),
});

/**
 * Types
 */
export type CreateCategoryInput = z.infer<typeof createCategorySchema>['body'];
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>['body'];
export type GetCategoryByIdParams = z.infer<typeof getCategoryByIdSchema>['params'];
export type GetCategoryBySlugParams = z.infer<typeof getCategoryBySlugSchema>['params'];
