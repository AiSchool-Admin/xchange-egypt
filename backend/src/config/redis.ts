import { createClient } from 'redis';
import { env } from './env';

// Only create Redis client if URL is provided and valid
let redis: ReturnType<typeof createClient> | null = null;

if (env.redis.url && env.redis.url.startsWith('redis://')) {
  redis = createClient({
    url: env.redis.url,
  });

  redis.on('error', (err) => {
    console.error('Redis Client Error:', err);
  });

  redis.on('connect', () => {
    console.log('✅ Redis connected');
  });
} else {
  console.warn('⚠️ Redis URL not configured or invalid, Redis features will be disabled');
}

// Helper function to add timeout to promises
const withTimeout = <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error('Operation timed out')), timeoutMs)
    ),
  ]);
};

// Connect to Redis
export const connectRedis = async () => {
  try {
    if (!redis) {
      console.warn('⚠️ Redis client not initialized, skipping connection');
      return;
    }
    if (!env.redis.url || !env.redis.url.startsWith('redis://')) {
      console.warn('⚠️ Redis URL not configured or invalid, skipping Redis connection');
      return;
    }
    // Add 5-second timeout to Redis connection
    await withTimeout(redis.connect(), 5000);
  } catch (error) {
    console.error('⚠️ Failed to connect to Redis:', error);
    console.warn('⚠️ Continuing without Redis - some features may be limited');
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
    console.error('Error closing Redis connection:', error);
  }
});

export { redis };
export default redis;
