import { PrismaClient } from '@prisma/client';
import { isDevelopment } from './env';
import logger from '../lib/logger';

/**
 * Database Configuration
 * إعدادات قاعدة البيانات مع تحسينات الأداء
 *
 * Connection Pooling:
 * يتم التحكم في connection pool من خلال DATABASE_URL:
 * ?connection_limit=10&pool_timeout=20
 *
 * للإنتاج الموصى به:
 * connection_limit = (CPU cores * 2) + disk spindles
 * pool_timeout = 20 seconds
 */

// Prisma Client Singleton
const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
  queryMetrics: QueryMetrics;
};

/**
 * Query Metrics for Performance Monitoring
 */
interface QueryMetrics {
  totalQueries: number;
  slowQueries: number;
  errors: number;
  avgDuration: number;
  lastReset: Date;
}

const initQueryMetrics = (): QueryMetrics => ({
  totalQueries: 0,
  slowQueries: 0,
  errors: 0,
  avgDuration: 0,
  lastReset: new Date(),
});

export const queryMetrics = globalForPrisma.queryMetrics || initQueryMetrics();

// Slow query threshold (ms)
const SLOW_QUERY_THRESHOLD = 1000;

/**
 * Create Prisma Client with optimized configuration
 */
const createPrismaClient = (): PrismaClient => {
  const client = new PrismaClient({
    log: isDevelopment
      ? [
          { level: 'query', emit: 'event' },
          { level: 'error', emit: 'stdout' },
          { level: 'warn', emit: 'stdout' },
        ]
      : [{ level: 'error', emit: 'stdout' }],
  });

  // Query logging and metrics (development only)
  if (isDevelopment) {
    // استخدام type assertion للتوافق مع نسخ Prisma المختلفة
    (client.$on as (event: string, callback: (e: { query: string; duration: number; params?: string }) => void) => void)(
      'query',
      (e) => {
        const duration = e.duration;

        // Update metrics
        queryMetrics.totalQueries++;
        queryMetrics.avgDuration =
          (queryMetrics.avgDuration * (queryMetrics.totalQueries - 1) + duration) /
          queryMetrics.totalQueries;

        // Log slow queries
        if (duration > SLOW_QUERY_THRESHOLD) {
          queryMetrics.slowQueries++;
          logger.warn('Slow query detected', {
            query: e.query.substring(0, 200),
            duration: `${duration}ms`,
            params: e.params,
          });
        }
      }
    );
  }

  return client;
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (isDevelopment) {
  globalForPrisma.prisma = prisma;
  globalForPrisma.queryMetrics = queryMetrics;
}

/**
 * Get query metrics for monitoring
 */
export const getQueryMetrics = (): QueryMetrics & { queriesPerSecond: number } => {
  const elapsed = (Date.now() - queryMetrics.lastReset.getTime()) / 1000;
  return {
    ...queryMetrics,
    queriesPerSecond: elapsed > 0 ? queryMetrics.totalQueries / elapsed : 0,
  };
};

/**
 * Reset query metrics
 */
export const resetQueryMetrics = (): void => {
  queryMetrics.totalQueries = 0;
  queryMetrics.slowQueries = 0;
  queryMetrics.errors = 0;
  queryMetrics.avgDuration = 0;
  queryMetrics.lastReset = new Date();
};

/**
 * Health check for database connection
 */
export const checkDatabaseHealth = async (): Promise<{
  isHealthy: boolean;
  responseTime: number;
  error?: string;
}> => {
  const start = Date.now();
  try {
    await prisma.$queryRaw`SELECT 1`;
    return {
      isHealthy: true,
      responseTime: Date.now() - start,
    };
  } catch (error) {
    queryMetrics.errors++;
    return {
      isHealthy: false,
      responseTime: Date.now() - start,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
};

// Graceful shutdown
const shutdown = async () => {
  logger.info('Disconnecting from database...');
  await prisma.$disconnect();
  logger.info('Database disconnected');
};

process.on('beforeExit', shutdown);
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

export default prisma;
