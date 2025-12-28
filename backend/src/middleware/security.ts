/**
 * Security Middleware
 * تحسينات أمنية شاملة للمنصة
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env';
import logger from '../lib/logger';

// ============================================
// Rate Limiters للـ Endpoints الحساسة
// ============================================

/**
 * Rate Limiter لتسجيل الدخول
 * 5 محاولات فقط كل 15 دقيقة
 */
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 دقيقة
  max: 5, // 5 محاولات فقط
  message: {
    success: false,
    error: {
      message: 'تم تجاوز عدد محاولات تسجيل الدخول المسموحة. يرجى المحاولة بعد 15 دقيقة.',
      messageEn: 'Too many login attempts. Please try again after 15 minutes.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Login rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email,
      userAgent: req.headers['user-agent'],
    });
    res.status(429).json(options.message);
  },
});

/**
 * Rate Limiter للتسجيل
 * 3 حسابات جديدة فقط كل ساعة من نفس الـ IP
 */
export const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 حسابات فقط
  message: {
    success: false,
    error: {
      message: 'تم تجاوز عدد الحسابات الجديدة المسموحة. يرجى المحاولة لاحقاً.',
      messageEn: 'Too many accounts created. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Register rate limit exceeded', {
      ip: req.ip,
      email: req.body?.email,
    });
    res.status(429).json(options.message);
  },
});

/**
 * Rate Limiter لإعادة تعيين كلمة المرور
 * 3 طلبات فقط كل ساعة
 */
export const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // ساعة واحدة
  max: 3, // 3 طلبات فقط
  message: {
    success: false,
    error: {
      message: 'تم تجاوز عدد طلبات إعادة تعيين كلمة المرور. يرجى المحاولة لاحقاً.',
      messageEn: 'Too many password reset requests. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter للـ API العام (صارم)
 * للحماية من DDoS
 */
export const strictApiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // دقيقة واحدة
  max: 30, // 30 طلب في الدقيقة
  message: {
    success: false,
    error: {
      message: 'عدد الطلبات كبير جداً. يرجى التباطؤ.',
      messageEn: 'Too many requests. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter لرفع الملفات
 * 10 ملفات فقط كل 10 دقائق
 */
export const uploadLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 دقائق
  max: 10, // 10 ملفات
  message: {
    success: false,
    error: {
      message: 'تم تجاوز عدد الملفات المسموح رفعها. يرجى المحاولة لاحقاً.',
      messageEn: 'Too many file uploads. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// ============================================
// Input Sanitization
// ============================================

/**
 * تنظيف المدخلات من الأكواد الضارة
 */
export const sanitizeInput = (req: Request, res: Response, next: NextFunction) => {
  // تنظيف body
  if (req.body && typeof req.body === 'object') {
    req.body = sanitizeObject(req.body);
  }

  // تنظيف query params
  if (req.query && typeof req.query === 'object') {
    req.query = sanitizeObject(req.query as Record<string, unknown>) as typeof req.query;
  }

  // تنظيف params
  if (req.params && typeof req.params === 'object') {
    req.params = sanitizeObject(req.params) as typeof req.params;
  }

  next();
};

/**
 * تنظيف كائن من الأكواد الضارة
 */
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeString(value);
    } else if (Array.isArray(value)) {
      sanitized[key] = value.map((item) =>
        typeof item === 'string' ? sanitizeString(item) : item
      );
    } else if (value && typeof value === 'object') {
      sanitized[key] = sanitizeObject(value as Record<string, unknown>);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * تنظيف نص من الأكواد الضارة
 */
function sanitizeString(str: string): string {
  return str
    // إزالة script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    // إزالة on* event handlers
    .replace(/\bon\w+\s*=\s*(['"]?).*?\1/gi, '')
    // تحويل HTML entities للأحرف الخطيرة
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // إزالة javascript: protocol
    .replace(/javascript:/gi, '')
    // إزالة data: protocol (يمكن استخدامه للـ XSS)
    .replace(/data:/gi, '')
    // إزالة vbscript: protocol
    .replace(/vbscript:/gi, '')
    // تنظيف النص من أحرف التحكم
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}

// ============================================
// Security Headers الإضافية
// ============================================

/**
 * إضافة headers أمنية إضافية
 */
export const additionalSecurityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // منع التضمين في iframes من مواقع أخرى
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // تفعيل XSS Protection في المتصفحات القديمة
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // منع MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // التحكم في Referrer
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  res.setHeader(
    'Permissions-Policy',
    'accelerometer=(), camera=(), geolocation=(self), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()'
  );

  next();
};

// ============================================
// Request Logging للأمان
// ============================================

/**
 * تسجيل الطلبات المشبوهة
 */
export const securityLogger = (req: Request, res: Response, next: NextFunction) => {
  // تسجيل طلبات من IPs مشبوهة أو user agents غريبة
  const suspiciousPatterns = [
    /sqlmap/i,
    /nikto/i,
    /nmap/i,
    /masscan/i,
    /curl/i, // قد تكون مشروعة لكن نسجلها
    /python-requests/i,
  ];

  const userAgent = req.headers['user-agent'] || '';

  if (suspiciousPatterns.some((pattern) => pattern.test(userAgent))) {
    logger.warn('Suspicious request detected', {
      ip: req.ip,
      userAgent,
      method: req.method,
      path: req.path,
      query: req.query,
    });
  }

  // تسجيل محاولات الوصول لمسارات حساسة
  const sensitivePaths = [
    '/admin',
    '/.env',
    '/config',
    '/wp-admin',
    '/phpmyadmin',
    '/.git',
    '/backup',
  ];

  if (sensitivePaths.some((path) => req.path.toLowerCase().includes(path))) {
    logger.warn('Sensitive path access attempt', {
      ip: req.ip,
      userAgent,
      method: req.method,
      path: req.path,
    });
  }

  next();
};

// ============================================
// CSRF Protection (Token-based)
// ============================================

const csrfTokens = new Map<string, { token: string; expires: number }>();

/**
 * إنشاء CSRF Token
 */
export const generateCsrfToken = (req: Request, res: Response) => {
  const crypto = require('crypto');
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = req.headers['x-session-id'] as string || req.ip || 'anonymous';

  csrfTokens.set(sessionId, {
    token,
    expires: Date.now() + 60 * 60 * 1000, // ساعة واحدة
  });

  // تنظيف التوكنات المنتهية
  for (const [key, value] of csrfTokens) {
    if (value.expires < Date.now()) {
      csrfTokens.delete(key);
    }
  }

  res.json({ csrfToken: token });
};

/**
 * التحقق من CSRF Token
 */
export const verifyCsrfToken = (req: Request, res: Response, next: NextFunction) => {
  // تخطي للـ GET, HEAD, OPTIONS
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
    return next();
  }

  // تخطي لـ API endpoints التي تستخدم JWT (الـ token يوفر الحماية)
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return next();
  }

  const sessionId = req.headers['x-session-id'] as string || req.ip || 'anonymous';
  const csrfToken = req.headers['x-csrf-token'] as string;
  const storedData = csrfTokens.get(sessionId);

  if (!storedData || storedData.token !== csrfToken || storedData.expires < Date.now()) {
    logger.warn('CSRF token validation failed', {
      ip: req.ip,
      path: req.path,
      hasToken: !!csrfToken,
    });

    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid or expired CSRF token',
        messageAr: 'رمز الحماية غير صالح أو منتهي',
      },
    });
  }

  next();
};

// ============================================
// Brute Force Protection
// ============================================

const failedAttempts = new Map<string, { count: number; blockedUntil: number }>();

/**
 * حماية من هجمات Brute Force
 */
export const bruteForceProtection = (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const record = failedAttempts.get(ip);

  // تنظيف السجلات القديمة
  if (record && record.blockedUntil < now) {
    failedAttempts.delete(ip);
  }

  // التحقق من الحظر
  if (record && record.blockedUntil > now) {
    const remainingMinutes = Math.ceil((record.blockedUntil - now) / 60000);
    logger.warn('Blocked IP attempted access', { ip, remainingMinutes });

    return res.status(429).json({
      success: false,
      error: {
        message: `تم حظر عنوان IP الخاص بك. يرجى المحاولة بعد ${remainingMinutes} دقيقة.`,
        messageEn: `Your IP has been blocked. Please try again in ${remainingMinutes} minutes.`,
      },
    });
  }

  // تخزين الـ response الأصلي لاعتراضه
  const originalJson = res.json.bind(res);
  res.json = function (body: unknown) {
    // إذا كان الرد خطأ مصادقة
    if (res.statusCode === 401 || res.statusCode === 403) {
      const current = failedAttempts.get(ip) || { count: 0, blockedUntil: 0 };
      current.count++;

      // حظر بعد 10 محاولات فاشلة
      if (current.count >= 10) {
        current.blockedUntil = now + 30 * 60 * 1000; // 30 دقيقة
        logger.warn('IP blocked due to too many failed attempts', { ip, attempts: current.count });
      }

      failedAttempts.set(ip, current);
    } else if (res.statusCode === 200) {
      // إعادة تعيين العداد عند النجاح
      failedAttempts.delete(ip);
    }

    return originalJson(body);
  };

  next();
};

/**
 * Middleware مجمع للأمان
 */
export const securityMiddleware = [
  additionalSecurityHeaders,
  sanitizeInput,
  securityLogger,
];
