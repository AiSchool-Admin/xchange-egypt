import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

interface TokenPayload {
  userId: string;
  email: string;
  userType: string;
}

/**
 * Generate JWT access token
 * @param payload - Token payload
 * @returns JWT access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwt.secret, {
    expiresIn: env.jwt.accessExpiry,
  } as SignOptions);
};

/**
 * Generate JWT refresh token
 * @param payload - Token payload
 * @returns JWT refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(payload, env.jwt.refreshSecret, {
    expiresIn: env.jwt.refreshExpiry,
  } as SignOptions);
};

/**
 * Verify JWT access token
 * @param token - JWT token
 * @returns Decoded token payload
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.jwt.secret) as TokenPayload;
};

/**
 * Verify JWT refresh token
 * @param token - JWT refresh token
 * @returns Decoded token payload
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  return jwt.verify(token, env.jwt.refreshSecret) as TokenPayload;
};

/**
 * Decode JWT token without verification (for debugging)
 * @param token - JWT token
 * @returns Decoded token payload or null
 */
export const decodeToken = (token: string): TokenPayload | null => {
  return jwt.decode(token) as TokenPayload | null;
};

interface PasswordResetPayload {
  userId: string;
  email: string;
  purpose: 'password_reset';
}

/**
 * Generate password reset token (expires in 1 hour)
 * @param payload - Token payload
 * @returns JWT password reset token
 */
export const generatePasswordResetToken = (payload: Omit<PasswordResetPayload, 'purpose'>): string => {
  return jwt.sign({ ...payload, purpose: 'password_reset' }, env.jwt.secret, {
    expiresIn: '1h',
  } as SignOptions);
};

/**
 * Verify password reset token
 * @param token - JWT password reset token
 * @returns Decoded token payload
 */
export const verifyPasswordResetToken = (token: string): PasswordResetPayload => {
  const decoded = jwt.verify(token, env.jwt.secret) as PasswordResetPayload;
  if (decoded.purpose !== 'password_reset') {
    throw new Error('Invalid token purpose');
  }
  return decoded;
};
