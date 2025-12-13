import { z } from 'zod';

/**
 * Egyptian phone number regex
 * Supports formats: +201xxxxxxxxx, 201xxxxxxxxx, 01xxxxxxxxx
 */
const egyptianPhoneRegex = /^(\+?20)?1[0125]\d{8}$/;

/**
 * Password requirements:
 * - At least 8 characters
 * - At least one uppercase letter
 * - At least one lowercase letter
 * - At least one number
 */
const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

/**
 * Register validation schema (Individual user)
 */
export const registerIndividualSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    phone: z
      .string()
      .regex(egyptianPhoneRegex, 'Invalid Egyptian phone number')
      .optional(),
    city: z.string().optional(),
    governorate: z.string().optional(),
  }),
});

/**
 * Register validation schema (Business user)
 */
export const registerBusinessSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: passwordSchema,
    fullName: z.string().min(3, 'Full name must be at least 3 characters'),
    phone: z
      .string()
      .regex(egyptianPhoneRegex, 'Invalid Egyptian phone number')
      .optional(),
    businessName: z.string().min(3, 'Business name must be at least 3 characters'),
    taxId: z.string().optional(),
    commercialRegNo: z.string().optional(),
    city: z.string().optional(),
    governorate: z.string().optional(),
  }),
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

/**
 * Refresh token validation schema
 */
export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

/**
 * Forgot password validation schema
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
  }),
});

/**
 * Reset password validation schema
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: passwordSchema,
  }),
});

/**
 * Types inferred from schemas
 */
export type RegisterIndividualInput = z.infer<typeof registerIndividualSchema>['body'];
export type RegisterBusinessInput = z.infer<typeof registerBusinessSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>['body'];
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>['body'];
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>['body'];
