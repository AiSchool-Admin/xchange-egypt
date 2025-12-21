/**
 * Sentry Configuration for Frontend
 * Error tracking and performance monitoring
 *
 * To use:
 * 1. Install: npm install @sentry/nextjs
 * 2. Run: npx @sentry/wizard@latest -i nextjs
 * 3. Add NEXT_PUBLIC_SENTRY_DSN to .env
 */

interface SentryConfig {
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  replaysSessionSampleRate: number;
  replaysOnErrorSampleRate: number;
}

// Sentry configuration
export const sentryConfig: SentryConfig = {
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
};

/**
 * Error boundary fallback component
 */
export const ErrorFallback = ({ error, resetError }: { error: Error; resetError: () => void }) => {
  return {
    type: 'div',
    props: {
      className: 'min-h-screen flex items-center justify-center bg-gray-100',
      children: {
        type: 'div',
        props: {
          className: 'text-center p-8 bg-white rounded-lg shadow-lg',
          children: [
            { type: 'h1', props: { className: 'text-2xl font-bold text-red-600 mb-4', children: 'حدث خطأ' } },
            { type: 'p', props: { className: 'text-gray-600 mb-4', children: error.message } },
            { type: 'button', props: { onClick: resetError, className: 'px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600', children: 'حاول مرة أخرى' } },
          ],
        },
      },
    },
  };
};

/**
 * Log error to console (placeholder for Sentry)
 */
export const captureException = (error: Error, context?: Record<string, unknown>): void => {
  console.error('Frontend Error:', error.message, context);

  // Uncomment when @sentry/nextjs is installed:
  // Sentry.captureException(error, { extra: context });
};

/**
 * Log message (placeholder for Sentry)
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info'): void => {
  console.log(`[${level.toUpperCase()}] ${message}`);

  // Uncomment when @sentry/nextjs is installed:
  // Sentry.captureMessage(message, level);
};

/**
 * Track user for error context
 */
export const setUser = (user: { id: string; email?: string; username?: string } | null): void => {
  // Uncomment when @sentry/nextjs is installed:
  // Sentry.setUser(user);
};

export default {
  captureException,
  captureMessage,
  setUser,
  config: sentryConfig,
};
