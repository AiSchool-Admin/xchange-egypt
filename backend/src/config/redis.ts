import { createClient } from 'redis';
import { env } from './env';

// Redis Client
export const redis = createClient({
  url: env.redis.url,
});

redis.on('error', (err) => {
  console.error('Redis Client Error:', err);
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

// Connect to Redis
export const connectRedis = async () => {
  try {
    if (!env.redis.url) {
      console.warn('⚠️ Redis URL not configured, skipping Redis connection');
      return;
    }
    await redis.connect();
  } catch (error) {
    console.error('⚠️ Failed to connect to Redis:', error);
    console.warn('⚠️ Continuing without Redis - some features may be limited');
    // Don't exit - allow server to start without Redis
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  try {
    if (redis.isOpen) {
      await redis.quit();
    }
  } catch (error) {
    console.error('Error closing Redis connection:', error);
  }
});

export default redis;
