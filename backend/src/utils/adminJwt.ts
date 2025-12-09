import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import { AdminRole } from '@prisma/client';

interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: AdminRole;
  isAdmin: true; // Flag to distinguish from user tokens
}

// Use different secrets for admin tokens (fallback to user secrets if not set)
const ADMIN_ACCESS_SECRET = process.env.ADMIN_JWT_SECRET || env.jwt.secret + '_admin';
const ADMIN_REFRESH_SECRET = process.env.ADMIN_JWT_REFRESH_SECRET || env.jwt.refreshSecret + '_admin';

/**
 * Generate JWT access token for admin
 */
export const generateAdminAccessToken = (payload: Omit<AdminTokenPayload, 'isAdmin'>): string => {
  return jwt.sign({ ...payload, isAdmin: true }, ADMIN_ACCESS_SECRET, {
    expiresIn: '4h', // Shorter expiry for admin tokens
  } as SignOptions);
};

/**
 * Generate JWT refresh token for admin
 */
export const generateAdminRefreshToken = (payload: Omit<AdminTokenPayload, 'isAdmin'>): string => {
  return jwt.sign({ ...payload, isAdmin: true }, ADMIN_REFRESH_SECRET, {
    expiresIn: '24h', // Shorter refresh token for admin
  } as SignOptions);
};

/**
 * Verify JWT access token for admin
 */
export const verifyAdminAccessToken = (token: string): AdminTokenPayload => {
  const decoded = jwt.verify(token, ADMIN_ACCESS_SECRET) as AdminTokenPayload;

  if (!decoded.isAdmin) {
    throw new Error('Not an admin token');
  }

  return decoded;
};

/**
 * Verify JWT refresh token for admin
 */
export const verifyAdminRefreshToken = (token: string): AdminTokenPayload => {
  const decoded = jwt.verify(token, ADMIN_REFRESH_SECRET) as AdminTokenPayload;

  if (!decoded.isAdmin) {
    throw new Error('Not an admin token');
  }

  return decoded;
};
