import { createClient } from 'redis';
import { env } from './env';
import logger from '../lib/logger';

// Only create Redis client if URL is provided and valid
let redis: ReturnType<typeof createClient> | null = null;

if (env.redis.url && env.redis.url.startsWith('redis://')) {
  redis = createClient({
    url: env.redis.url,
  });

  redis.on('error', (err) => {
    logger.error('Redis Client Error:', err);
  });

  redis.on('connect', () => {
    logger.info('Redis connected');
  });
} else {
  logger.warn('Redis URL not configured or invalid, Redis features will be disabled');
}

// Connect to Redis
export const connectRedis = async () => {
  try {
    if (!redis) {
      logger.warn('Redis client not initialized, skipping connection');
      return;
    }
    if (!env.redis.url || !env.redis.url.startsWith('redis://')) {
      logger.warn('Redis URL not configured or invalid, skipping Redis connection');
      return;
    }
    await redis.connect();
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    logger.warn('Continuing without Redis - some features may be limited');
    // Don't exit - allow server to start without Redis
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  try {
    if (redis && redis.isOpen) {
      await redis.quit();
    }
  } catch (error) {
    logger.error('Error closing Redis connection:', error);
  }
});

export { redis };
export default redis;
