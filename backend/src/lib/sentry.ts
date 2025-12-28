/**
 * Sentry Error Tracking Configuration
 * مراقبة الأخطاء وتتبعها
 *
 * للتفعيل الكامل:
 * 1. أنشئ حساب مجاني على https://sentry.io
 * 2. أنشئ مشروع جديد (Node.js)
 * 3. انسخ الـ DSN وأضفه في ملف .env:
 *    SENTRY_DSN=https://xxxxx@sentry.io/xxxxx
 * 4. ثبت المكتبة: npm install @sentry/node
 */

import { Request, Response, NextFunction } from 'express';
import logger from './logger';

// Check if @sentry/node is installed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let Sentry: any = null;
try {
  Sentry = require('@sentry/node');
} catch {
  // Sentry not installed, will use fallback
}

interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  enabled: boolean;
}

// Sentry configuration
export const sentryConfig: SentryConfig = {
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.npm_package_version || '0.2.2',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  enabled: !!process.env.SENTRY_DSN && process.env.NODE_ENV === 'production',
};

// Error queue for fallback logging
interface ErrorRecord {
  timestamp: string;
  message: string;
  stack?: string;
  context?: Record<string, unknown>;
  level: string;
}

const errorQueue: ErrorRecord[] = [];
const MAX_QUEUE_SIZE = 100;

/**
 * Initialize Sentry
 */
export const initSentry = (): void => {
  if (!sentryConfig.dsn) {
    logger.info('Sentry DSN not configured - using fallback error logging');
    return;
  }

  if (Sentry) {
    Sentry.init({
      dsn: sentryConfig.dsn,
      environment: sentryConfig.environment,
      release: sentryConfig.release,
      tracesSampleRate: sentryConfig.tracesSampleRate,

      beforeSend(event) {
        // Remove sensitive headers
        if (event.request?.headers) {
          delete event.request.headers.authorization;
          delete event.request.headers.cookie;
          delete event.request.headers['x-api-key'];
        }
        // Remove sensitive data from body
        if (event.request?.data) {
          const data = typeof event.request.data === 'string'
            ? JSON.parse(event.request.data)
            : event.request.data;
          if (data.password) data.password = '[REDACTED]';
          if (data.token) data.token = '[REDACTED]';
          event.request.data = JSON.stringify(data);
        }
        return event;
      },
    });

    logger.info('Sentry initialized', { environment: sentryConfig.environment });
  } else {
    logger.info('Sentry SDK not installed - using fallback error logging');
  }
};

/**
 * Capture an exception
 */
export const captureException = (
  error: Error,
  context?: Record<string, unknown>
): void => {
  // Log locally
  logger.error('Exception captured', {
    message: error.message,
    stack: error.stack,
    ...context,
  });

  if (Sentry && sentryConfig.enabled) {
    Sentry.captureException(error, { extra: context });
  } else {
    // Fallback: store in queue
    addToQueue({
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      level: 'error',
    });
  }
};

/**
 * Capture a message
 */
export const captureMessage = (
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
): void => {
  logger.info('Message captured', { message, level, ...context });

  if (Sentry && sentryConfig.enabled) {
    Sentry.captureMessage(message, level);
  } else {
    addToQueue({
      timestamp: new Date().toISOString(),
      message,
      context,
      level,
    });
  }
};

/**
 * Set user context
 */
export const setUser = (user: { id: string; email?: string; username?: string }): void => {
  if (Sentry && sentryConfig.enabled) {
    Sentry.setUser(user);
  }
};

/**
 * Clear user context
 */
export const clearUser = (): void => {
  if (Sentry && sentryConfig.enabled) {
    Sentry.setUser(null);
  }
};

/**
 * Add breadcrumb
 */
export const addBreadcrumb = (breadcrumb: {
  category: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}): void => {
  if (Sentry && sentryConfig.enabled) {
    Sentry.addBreadcrumb(breadcrumb);
  }
};

/**
 * Express error handler middleware
 */
export const sentryErrorHandler = (
  err: Error,
  req: Request,
  _res: Response,
  next: NextFunction
): void => {
  const user = (req as Request & { user?: { id?: string; email?: string } }).user;

  captureException(err, {
    path: req.path,
    method: req.method,
    query: req.query,
    userId: user?.id,
    userEmail: user?.email,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
  });

  next(err);
};

/**
 * Express request handler for performance tracking
 */
export const sentryRequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;

    // Log slow requests (> 5 seconds)
    if (duration > 5000) {
      captureMessage(`Slow request: ${req.method} ${req.path}`, 'warning', {
        duration,
        statusCode: res.statusCode,
        path: req.path,
        method: req.method,
      });
    }

    // Log server errors
    if (res.statusCode >= 500) {
      captureMessage(`Server error: ${req.method} ${req.path}`, 'error', {
        statusCode: res.statusCode,
        duration,
        path: req.path,
      });
    }
  });

  next();
};

/**
 * Add to error queue (fallback)
 */
function addToQueue(record: ErrorRecord): void {
  errorQueue.push(record);

  // Keep queue size manageable
  if (errorQueue.length > MAX_QUEUE_SIZE) {
    errorQueue.shift();
  }
}

/**
 * Get error queue (for debugging/admin)
 */
export const getErrorQueue = (): ErrorRecord[] => {
  return [...errorQueue];
};

/**
 * Clear error queue
 */
export const clearErrorQueue = (): void => {
  errorQueue.length = 0;
};

// Initialize on import
initSentry();

export default {
  init: initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  sentryErrorHandler,
  sentryRequestHandler,
  getErrorQueue,
  clearErrorQueue,
};
