/**
 * Sentry Error Tracking Configuration
 * Provides error tracking and performance monitoring
 */

// Note: Install @sentry/node with: npm install @sentry/node
// import * as Sentry from '@sentry/node';

interface SentryConfig {
  dsn: string;
  environment: string;
  release: string;
  tracesSampleRate: number;
  profilesSampleRate: number;
}

// Sentry configuration
export const sentryConfig: SentryConfig = {
  dsn: process.env.SENTRY_DSN || '',
  environment: process.env.NODE_ENV || 'development',
  release: process.env.npm_package_version || '0.2.2',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
};

/**
 * Initialize Sentry
 * Call this at the start of your application
 */
export const initSentry = (): void => {
  if (!sentryConfig.dsn) {
    console.info('Sentry DSN not configured, skipping initialization');
    return;
  }

  // Uncomment when @sentry/node is installed:
  /*
  Sentry.init({
    dsn: sentryConfig.dsn,
    environment: sentryConfig.environment,
    release: sentryConfig.release,
    tracesSampleRate: sentryConfig.tracesSampleRate,
    profilesSampleRate: sentryConfig.profilesSampleRate,

    // Integrations
    integrations: [
      // HTTP integration for tracking requests
      new Sentry.Integrations.Http({ tracing: true }),
      // Express integration
      new Sentry.Integrations.Express(),
    ],

    // Filter sensitive data
    beforeSend(event) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }
      return event;
    },
  });

  console.info('Sentry initialized for environment:', sentryConfig.environment);
  */
};

/**
 * Capture an exception manually
 */
export const captureException = (error: Error, context?: Record<string, unknown>): void => {
  console.error('Error captured:', error.message, context);

  // Uncomment when @sentry/node is installed:
  // Sentry.captureException(error, { extra: context });
};

/**
 * Capture a message
 */
export const captureMessage = (message: string, level: 'info' | 'warning' | 'error' = 'info'): void => {
  console.log(`[${level.toUpperCase()}] ${message}`);

  // Uncomment when @sentry/node is installed:
  // Sentry.captureMessage(message, level);
};

/**
 * Set user context for error tracking
 */
export const setUser = (user: { id: string; email?: string; username?: string }): void => {
  // Uncomment when @sentry/node is installed:
  // Sentry.setUser(user);
};

/**
 * Clear user context
 */
export const clearUser = (): void => {
  // Uncomment when @sentry/node is installed:
  // Sentry.setUser(null);
};

/**
 * Add breadcrumb for debugging
 */
export const addBreadcrumb = (breadcrumb: {
  category: string;
  message: string;
  level?: 'debug' | 'info' | 'warning' | 'error';
  data?: Record<string, unknown>;
}): void => {
  // Uncomment when @sentry/node is installed:
  // Sentry.addBreadcrumb(breadcrumb);
};

/**
 * Start a transaction for performance monitoring
 */
export const startTransaction = (name: string, op: string): unknown => {
  // Uncomment when @sentry/node is installed:
  /*
  return Sentry.startTransaction({
    name,
    op,
  });
  */
  return { finish: () => {} }; // Placeholder
};

export default {
  init: initSentry,
  captureException,
  captureMessage,
  setUser,
  clearUser,
  addBreadcrumb,
  startTransaction,
};
