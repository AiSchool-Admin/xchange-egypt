import { z } from 'zod';

/**
 * Egyptian phone number regex
 */
const egyptianPhoneRegex = /^(\+?20)?1[0125]\d{8}$/;

/**
 * Password schema (same as auth)
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Update individual user profile
 */
export const updateIndividualProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters').optional(),
    phone: z.string().regex(egyptianPhoneRegex, 'Invalid Egyptian phone number').optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    governorate: z.string().optional(),
    postalCode: z.string().optional(),
  }),
});

/**
 * Update business user profile
 */
export const updateBusinessProfileSchema = z.object({
  body: z.object({
    fullName: z.string().min(3, 'Full name must be at least 3 characters').optional(),
    phone: z.string().regex(egyptianPhoneRegex, 'Invalid Egyptian phone number').optional(),
    bio: z.string().max(500, 'Bio must be less than 500 characters').optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    governorate: z.string().optional(),
    postalCode: z.string().optional(),
    businessName: z.string().min(3, 'Business name must be at least 3 characters').optional(),
    taxId: z.string().optional(),
    commercialRegNo: z.string().optional(),
  }),
});

/**
 * Change password
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  }),
});

/**
 * Get user by ID param
 */
export const getUserByIdSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid user ID'),
  }),
});

/**
 * Types
 */
export type UpdateIndividualProfileInput = z.infer<
  typeof updateIndividualProfileSchema
>['body'];
export type UpdateBusinessProfileInput = z.infer<typeof updateBusinessProfileSchema>['body'];
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>['body'];
export type GetUserByIdParams = z.infer<typeof getUserByIdSchema>['params'];
