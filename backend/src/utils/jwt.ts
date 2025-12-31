import jwt, { SignOptions, VerifyOptions, Algorithm } from 'jsonwebtoken';
import crypto from 'crypto';
import { env } from '../config/env';

/**
 * JWT Security Configuration
 * إعدادات أمان JWT
 */
const JWT_CONFIG = {
  // الخوارزمية المستخدمة - HMAC SHA256 (موصى بها للـ symmetric keys)
  algorithm: 'HS256' as Algorithm,
  // مُصدر التوكن
  issuer: 'xchange-egypt-api',
  // الجمهور المستهدف
  audience: 'xchange-egypt-client',
};

interface TokenPayload {
  userId: string;
  email: string;
  userType: string;
}

interface FullTokenPayload extends TokenPayload {
  jti?: string;  // JWT ID للتتبع
  iss?: string;  // المُصدر
  aud?: string;  // الجمهور
  iat?: number;  // وقت الإصدار
  exp?: number;  // وقت الانتهاء
}

/**
 * إنشاء JWT ID فريد
 */
const generateJti = (): string => {
  return crypto.randomBytes(16).toString('hex');
};

/**
 * Generate JWT access token
 * @param payload - Token payload
 * @returns JWT access token
 */
export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(
    {
      ...payload,
      jti: generateJti(),
    },
    env.jwt.secret,
    {
      expiresIn: env.jwt.accessExpiry,
      algorithm: JWT_CONFIG.algorithm,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    } as SignOptions
  );
};

/**
 * Generate JWT refresh token
 * @param payload - Token payload
 * @returns JWT refresh token
 */
export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(
    {
      ...payload,
      jti: generateJti(),
      type: 'refresh', // تمييز نوع التوكن
    },
    env.jwt.refreshSecret,
    {
      expiresIn: env.jwt.refreshExpiry,
      algorithm: JWT_CONFIG.algorithm,
      issuer: JWT_CONFIG.issuer,
      audience: JWT_CONFIG.audience,
    } as SignOptions
  );
};

/**
 * Verify JWT access token
 * التحقق مع كل الـ claims الأمنية
 * @param token - JWT token
 * @returns Decoded token payload
 */
export const verifyAccessToken = (token: string): TokenPayload => {
  const verifyOptions: VerifyOptions = {
    algorithms: [JWT_CONFIG.algorithm], // منع algorithm confusion attacks
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
  };

  const decoded = jwt.verify(token, env.jwt.secret, verifyOptions) as FullTokenPayload;

  // استخراج الـ payload الأساسي فقط
  return {
    userId: decoded.userId,
    email: decoded.email,
    userType: decoded.userType,
  };
};

/**
 * Verify JWT refresh token
 * @param token - JWT refresh token
 * @returns Decoded token payload
 */
export const verifyRefreshToken = (token: string): TokenPayload => {
  const verifyOptions: VerifyOptions = {
    algorithms: [JWT_CONFIG.algorithm],
    issuer: JWT_CONFIG.issuer,
    audience: JWT_CONFIG.audience,
  };

  const decoded = jwt.verify(token, env.jwt.refreshSecret, verifyOptions) as FullTokenPayload & { type?: string };

  // التحقق من نوع التوكن
  if (decoded.type !== 'refresh') {
    throw new Error('Invalid token type');
  }

  return {
    userId: decoded.userId,
    email: decoded.email,
    userType: decoded.userType,
  };
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
 * محسّن مع حماية أمنية إضافية
 * @param payload - Token payload
 * @returns JWT password reset token
 */
export const generatePasswordResetToken = (payload: Omit<PasswordResetPayload, 'purpose'>): string => {
  return jwt.sign(
    {
      ...payload,
      purpose: 'password_reset',
      jti: generateJti(),
    },
    env.jwt.secret,
    {
      expiresIn: '1h',
      algorithm: JWT_CONFIG.algorithm,
      issuer: JWT_CONFIG.issuer,
      audience: 'xchange-egypt-password-reset', // جمهور مختلف لإعادة التعيين
    } as SignOptions
  );
};

/**
 * Verify password reset token
 * التحقق مع كل الـ claims الأمنية
 * @param token - JWT password reset token
 * @returns Decoded token payload
 */
export const verifyPasswordResetToken = (token: string): PasswordResetPayload => {
  const verifyOptions: VerifyOptions = {
    algorithms: [JWT_CONFIG.algorithm],
    issuer: JWT_CONFIG.issuer,
    audience: 'xchange-egypt-password-reset',
  };

  const decoded = jwt.verify(token, env.jwt.secret, verifyOptions) as PasswordResetPayload & { purpose?: string };

  if (decoded.purpose !== 'password_reset') {
    throw new Error('Invalid token purpose');
  }

  return {
    userId: decoded.userId,
    email: decoded.email,
    purpose: decoded.purpose,
  };
};
