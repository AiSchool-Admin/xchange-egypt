import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

interface FounderTokenPayload {
  founderId: string;
  email: string;
  isFounder: true; // Flag to distinguish from other tokens
}

// Use dedicated secrets for founder tokens (highest security)
const FOUNDER_ACCESS_SECRET = process.env.FOUNDER_JWT_SECRET || env.jwt.secret + '_founder_secure';
const FOUNDER_REFRESH_SECRET = process.env.FOUNDER_JWT_REFRESH_SECRET || env.jwt.refreshSecret + '_founder_secure';

/**
 * Generate JWT access token for founder
 */
export const generateFounderAccessToken = (payload: Omit<FounderTokenPayload, 'isFounder'>): string => {
  return jwt.sign({ ...payload, isFounder: true }, FOUNDER_ACCESS_SECRET, {
    expiresIn: '2h', // Short expiry for maximum security
  } as SignOptions);
};

/**
 * Generate JWT refresh token for founder
 */
export const generateFounderRefreshToken = (payload: Omit<FounderTokenPayload, 'isFounder'>): string => {
  return jwt.sign({ ...payload, isFounder: true }, FOUNDER_REFRESH_SECRET, {
    expiresIn: '12h', // Short refresh token for security
  } as SignOptions);
};

/**
 * Verify JWT access token for founder
 */
export const verifyFounderAccessToken = (token: string): FounderTokenPayload => {
  const decoded = jwt.verify(token, FOUNDER_ACCESS_SECRET) as FounderTokenPayload;

  if (!decoded.isFounder) {
    throw new Error('Not a founder token');
  }

  return decoded;
};

/**
 * Verify JWT refresh token for founder
 */
export const verifyFounderRefreshToken = (token: string): FounderTokenPayload => {
  const decoded = jwt.verify(token, FOUNDER_REFRESH_SECRET) as FounderTokenPayload;

  if (!decoded.isFounder) {
    throw new Error('Not a founder token');
  }

  return decoded;
};
