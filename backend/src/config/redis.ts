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
    await redis.connect();
  } catch (error) {
    console.error('Failed to connect to Redis:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('beforeExit', async () => {
  await redis.quit();
});

export default redis;
