/**
 * Security Middleware
 * تحسينات أمنية شاملة للمنصة
 */

import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import crypto from 'crypto';
import { env, isProduction } from '../config/env';
import logger from '../lib/logger';
import redis from '../config/redis';

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

/**
 * Rate Limiter للبحث
 * 60 طلب في الدقيقة
 */
export const searchLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  message: {
    success: false,
    error: {
      message: 'عدد عمليات البحث كبير جداً. يرجى التباطؤ.',
      messageEn: 'Too many search requests. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter لإنشاء المحتوى (إعلانات، عروض، إلخ)
 * 20 إنشاء كل 10 دقائق
 */
export const createContentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      message: 'تم تجاوز عدد الإعلانات المسموح إنشاؤها. يرجى المحاولة لاحقاً.',
      messageEn: 'Too many listings created. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter للمزادات (المزايدة)
 * 30 مزايدة في الدقيقة
 */
export const auctionBidLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: {
    success: false,
    error: {
      message: 'عدد المزايدات كبير جداً. يرجى التباطؤ.',
      messageEn: 'Too many bids. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter للمحادثات والرسائل
 * 100 رسالة في الدقيقة
 */
export const chatLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      message: 'عدد الرسائل كبير جداً. يرجى التباطؤ.',
      messageEn: 'Too many messages. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter للمعاملات المالية
 * 10 معاملات في الدقيقة
 */
export const transactionLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      message: 'عدد المعاملات كبير جداً. يرجى التباطؤ.',
      messageEn: 'Too many transactions. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Transaction rate limit exceeded', {
      ip: req.ip,
      userId: (req as unknown as { user?: { id: string } }).user?.id,
    });
    res.status(429).json(options.message);
  },
});

/**
 * Rate Limiter للـ AI Services
 * 20 طلب في الدقيقة (الـ AI مكلف)
 */
export const aiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 20,
  message: {
    success: false,
    error: {
      message: 'عدد طلبات الذكاء الاصطناعي كبير جداً. يرجى التباطؤ.',
      messageEn: 'Too many AI requests. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter للإشعارات
 * 50 طلب في الدقيقة
 */
export const notificationLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 50,
  message: {
    success: false,
    error: {
      message: 'عدد طلبات الإشعارات كبير جداً. يرجى التباطؤ.',
      messageEn: 'Too many notification requests. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter للعمليات الحساسة (حذف، تعديل الحساب)
 * 5 عمليات كل 5 دقائق
 */
export const sensitiveOperationsLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    error: {
      message: 'عدد العمليات الحساسة كبير جداً. يرجى المحاولة لاحقاً.',
      messageEn: 'Too many sensitive operations. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Sensitive operations rate limit exceeded', {
      ip: req.ip,
      path: req.path,
      userId: (req as unknown as { user?: { id: string } }).user?.id,
    });
    res.status(429).json(options.message);
  },
});

/**
 * Rate Limiter للتقارير والشكاوى
 * 10 تقارير كل ساعة
 */
export const reportLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: {
      message: 'تم تجاوز عدد التقارير المسموحة. يرجى المحاولة لاحقاً.',
      messageEn: 'Too many reports submitted. Please try again later.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter للمقارنات
 * 100 طلب في الدقيقة
 */
export const comparisonLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      message: 'عدد طلبات المقارنة كبير جداً. يرجى التباطؤ.',
      messageEn: 'Too many comparison requests. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Rate Limiter للمحفظة والدفع
 * 15 عملية كل 5 دقائق
 */
export const walletLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: {
      message: 'عدد عمليات المحفظة كبير جداً. يرجى التباطؤ.',
      messageEn: 'Too many wallet operations. Please slow down.',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    logger.warn('Wallet rate limit exceeded', {
      ip: req.ip,
      userId: (req as unknown as { user?: { id: string } }).user?.id,
    });
    res.status(429).json(options.message);
  },
});

/**
 * Rate Limiter للـ Admin endpoints
 * 100 طلب في الدقيقة
 */
export const adminLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    error: {
      message: 'عدد طلبات الإدارة كبير جداً. يرجى التباطؤ.',
      messageEn: 'Too many admin requests. Please slow down.',
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
  // HSTS - إجبار استخدام HTTPS (سنة كاملة + includeSubDomains)
  if (isProduction) {
    res.setHeader(
      'Strict-Transport-Security',
      'max-age=31536000; includeSubDomains; preload'
    );
  }

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
// CSRF Protection (Redis-backed with fallback)
// ============================================

// Fallback in-memory storage (for when Redis is unavailable)
const csrfTokensFallback = new Map<string, { token: string; expires: number }>();

const CSRF_TOKEN_EXPIRY = 60 * 60; // 1 hour in seconds
const CSRF_REDIS_PREFIX = 'csrf:';

/**
 * إنشاء CSRF Token مع دعم Redis
 */
export const generateCsrfToken = async (req: Request, res: Response) => {
  const token = crypto.randomBytes(32).toString('hex');
  const sessionId = req.headers['x-session-id'] as string || req.ip || 'anonymous';
  const key = `${CSRF_REDIS_PREFIX}${sessionId}`;

  try {
    // Try Redis first
    if (redis && redis.isOpen) {
      await redis.setEx(key, CSRF_TOKEN_EXPIRY, token);
      logger.debug('CSRF token stored in Redis', { sessionId: sessionId.substring(0, 10) });
    } else {
      // Fallback to in-memory
      csrfTokensFallback.set(sessionId, {
        token,
        expires: Date.now() + CSRF_TOKEN_EXPIRY * 1000,
      });

      // Clean up expired tokens periodically
      if (csrfTokensFallback.size > 1000) {
        const now = Date.now();
        for (const [k, v] of csrfTokensFallback) {
          if (v.expires < now) {
            csrfTokensFallback.delete(k);
          }
        }
      }
    }

    res.json({ csrfToken: token });
  } catch (error) {
    logger.error('Error generating CSRF token:', error);
    // Fallback to in-memory on error
    csrfTokensFallback.set(sessionId, {
      token,
      expires: Date.now() + CSRF_TOKEN_EXPIRY * 1000,
    });
    res.json({ csrfToken: token });
  }
};

/**
 * التحقق من CSRF Token مع دعم Redis
 */
export const verifyCsrfToken = async (req: Request, res: Response, next: NextFunction) => {
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
  const key = `${CSRF_REDIS_PREFIX}${sessionId}`;

  try {
    let storedToken: string | null = null;

    // Try Redis first
    if (redis && redis.isOpen) {
      storedToken = await redis.get(key);
    } else {
      // Fallback to in-memory
      const storedData = csrfTokensFallback.get(sessionId);
      if (storedData && storedData.expires > Date.now()) {
        storedToken = storedData.token;
      }
    }

    if (!storedToken || storedToken !== csrfToken) {
      logger.warn('CSRF token validation failed', {
        ip: req.ip,
        path: req.path,
        hasToken: !!csrfToken,
        hasStoredToken: !!storedToken,
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
  } catch (error) {
    logger.error('Error verifying CSRF token:', error);
    // On error, check fallback
    const storedData = csrfTokensFallback.get(sessionId);
    if (storedData && storedData.token === csrfToken && storedData.expires > Date.now()) {
      return next();
    }
    return res.status(403).json({
      success: false,
      error: {
        message: 'CSRF validation error',
        messageAr: 'خطأ في التحقق من رمز الحماية',
      },
    });
  }
};

// ============================================
// Brute Force Protection (Redis-backed with fallback)
// ============================================

const BRUTE_FORCE_PREFIX = 'bruteforce:';
const BRUTE_FORCE_MAX_ATTEMPTS = 10;
const BRUTE_FORCE_BLOCK_DURATION = 30 * 60; // 30 minutes in seconds

// Fallback in-memory storage
const failedAttemptsFallback = new Map<string, { count: number; blockedUntil: number }>();

/**
 * حماية من هجمات Brute Force مع دعم Redis
 */
export const bruteForceProtection = async (req: Request, res: Response, next: NextFunction) => {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const key = `${BRUTE_FORCE_PREFIX}${ip}`;

  try {
    let record: { count: number; blockedUntil: number } | null = null;

    // Try Redis first
    if (redis && redis.isOpen) {
      const data = await redis.get(key);
      if (data) {
        record = JSON.parse(data);
      }
    } else {
      // Fallback to in-memory
      record = failedAttemptsFallback.get(ip) || null;
      // Clean up expired records
      if (record && record.blockedUntil < now) {
        failedAttemptsFallback.delete(ip);
        record = null;
      }
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
      (async () => {
        try {
          if (res.statusCode === 401 || res.statusCode === 403) {
            let current = { count: 0, blockedUntil: 0 };

            if (redis && redis.isOpen) {
              const data = await redis.get(key);
              if (data) current = JSON.parse(data);
            } else {
              current = failedAttemptsFallback.get(ip) || current;
            }

            current.count++;

            // حظر بعد 10 محاولات فاشلة
            if (current.count >= BRUTE_FORCE_MAX_ATTEMPTS) {
              current.blockedUntil = now + BRUTE_FORCE_BLOCK_DURATION * 1000;
              logger.warn('IP blocked due to too many failed attempts', { ip, attempts: current.count });
            }

            if (redis && redis.isOpen) {
              await redis.setEx(key, BRUTE_FORCE_BLOCK_DURATION, JSON.stringify(current));
            } else {
              failedAttemptsFallback.set(ip, current);
            }
          } else if (res.statusCode === 200) {
            // إعادة تعيين العداد عند النجاح
            if (redis && redis.isOpen) {
              await redis.del(key);
            } else {
              failedAttemptsFallback.delete(ip);
            }
          }
        } catch (err) {
          logger.error('Error in brute force tracking:', err);
        }
      })();

      return originalJson(body);
    };

    next();
  } catch (error) {
    logger.error('Error in brute force protection:', error);
    next();
  }
};

// ============================================
// JWT Token Revocation System (Redis-backed)
// ============================================

const JWT_BLACKLIST_PREFIX = 'jwt:blacklist:';
const JWT_BLACKLIST_FALLBACK = new Set<string>();

/**
 * إضافة JWT token إلى القائمة السوداء
 * @param jti - معرف الـ token الفريد
 * @param expiresInSeconds - مدة الصلاحية المتبقية بالثواني
 */
export const blacklistToken = async (jti: string, expiresInSeconds: number): Promise<boolean> => {
  const key = `${JWT_BLACKLIST_PREFIX}${jti}`;

  try {
    if (redis && redis.isOpen) {
      await redis.setEx(key, expiresInSeconds, '1');
      logger.info('Token blacklisted in Redis', { jti: jti.substring(0, 8) });
      return true;
    } else {
      // Fallback - store in memory (will be lost on restart)
      JWT_BLACKLIST_FALLBACK.add(jti);
      logger.warn('Token blacklisted in memory (Redis unavailable)', { jti: jti.substring(0, 8) });
      return true;
    }
  } catch (error) {
    logger.error('Error blacklisting token:', error);
    JWT_BLACKLIST_FALLBACK.add(jti);
    return false;
  }
};

/**
 * التحقق مما إذا كان الـ token في القائمة السوداء
 * @param jti - معرف الـ token الفريد
 */
export const isTokenBlacklisted = async (jti: string): Promise<boolean> => {
  const key = `${JWT_BLACKLIST_PREFIX}${jti}`;

  try {
    if (redis && redis.isOpen) {
      const exists = await redis.exists(key);
      return exists === 1;
    } else {
      return JWT_BLACKLIST_FALLBACK.has(jti);
    }
  } catch (error) {
    logger.error('Error checking token blacklist:', error);
    return JWT_BLACKLIST_FALLBACK.has(jti);
  }
};

/**
 * إلغاء جميع tokens لمستخدم معين
 * يتطلب تخزين قائمة بـ JTIs للمستخدم
 */
export const revokeAllUserTokens = async (userId: string): Promise<boolean> => {
  const userTokensKey = `user:tokens:${userId}`;

  try {
    if (redis && redis.isOpen) {
      // Get all token JTIs for this user
      const tokens = await redis.sMembers(userTokensKey);

      // Blacklist each token
      const pipeline = redis.multi();
      for (const jti of tokens) {
        pipeline.setEx(`${JWT_BLACKLIST_PREFIX}${jti}`, 24 * 60 * 60, '1'); // 24 hours
      }
      pipeline.del(userTokensKey);
      await pipeline.exec();

      logger.info('All user tokens revoked', { userId, count: tokens.length });
      return true;
    } else {
      logger.warn('Cannot revoke all user tokens (Redis unavailable)', { userId });
      return false;
    }
  } catch (error) {
    logger.error('Error revoking user tokens:', error);
    return false;
  }
};

/**
 * تسجيل token جديد للمستخدم (لتتبع الـ tokens النشطة)
 */
export const registerUserToken = async (userId: string, jti: string, expiresInSeconds: number): Promise<void> => {
  const userTokensKey = `user:tokens:${userId}`;

  try {
    if (redis && redis.isOpen) {
      await redis.sAdd(userTokensKey, jti);
      await redis.expire(userTokensKey, expiresInSeconds);
    }
  } catch (error) {
    logger.error('Error registering user token:', error);
  }
};

/**
 * Middleware مجمع للأمان
 */
export const securityMiddleware = [
  additionalSecurityHeaders,
  sanitizeInput,
  securityLogger,
];

// ============================================
// Request Logging Middleware
// ============================================

/**
 * Middleware لتسجيل جميع الطلبات والردود
 * يوفر مراقبة شاملة للأداء والأخطاء
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // إضافة request ID للتتبع
  req.headers['x-request-id'] = requestId;

  // تسجيل الطلب الوارد
  logger.info(`→ ${req.method} ${req.path}`, {
    requestId,
    ip: req.ip,
    userAgent: req.headers['user-agent']?.substring(0, 50),
    query: Object.keys(req.query).length > 0 ? req.query : undefined,
  });

  // اعتراض الرد لتسجيل التفاصيل
  const originalSend = res.send.bind(res);
  res.send = function (body: unknown) {
    const duration = Date.now() - startTime;
    const level = res.statusCode >= 500 ? 'error' : res.statusCode >= 400 ? 'warn' : 'info';

    if (level === 'error') {
      logger.error(`← ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`, {
        requestId,
        statusCode: res.statusCode,
        duration,
      });
    } else if (level === 'warn') {
      logger.warn(`← ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`, {
        requestId,
        statusCode: res.statusCode,
        duration,
      });
    } else {
      logger.info(`← ${req.method} ${req.path} ${res.statusCode} (${duration}ms)`, {
        requestId,
        statusCode: res.statusCode,
        duration,
      });
    }

    return originalSend(body);
  };

  next();
};
