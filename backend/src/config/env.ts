import dotenv from 'dotenv';
import { z } from 'zod';

// Load environment variables
dotenv.config();

// Environment schema validation
const envSchema = z.object({
  // Server
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  API_URL: z.string().url(),
  FRONTEND_URL: z.string().default('http://localhost:3000'),

  // Database
  DATABASE_URL: z.string().url(),

  // Redis (optional)
  REDIS_URL: z.string().optional(),

  // JWT
  JWT_SECRET: z.string().min(10),
  JWT_REFRESH_SECRET: z.string().min(10),
  JWT_ACCESS_EXPIRY: z.string().default('15m'),
  JWT_REFRESH_EXPIRY: z.string().default('7d'),

  // CORS
  CORS_ORIGIN: z.string(),

  // Storage (Cloudflare R2)
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),
  R2_PUBLIC_URL: z.string().url().optional(),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'),
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),

  // File Upload
  MAX_FILE_SIZE_MB: z.string().default('5'),
  MAX_FILES_PER_UPLOAD: z.string().default('10'),
});

// Validate and export environment variables
const parseEnv = () => {
  try {
    const env = envSchema.parse(process.env);
    return {
      server: {
        nodeEnv: env.NODE_ENV,
        port: parseInt(env.PORT, 10),
        apiUrl: env.API_URL,
        frontendUrl: env.FRONTEND_URL,
      },
      database: {
        url: env.DATABASE_URL,
      },
      redis: {
        url: env.REDIS_URL || '',
      },
      jwt: {
        secret: env.JWT_SECRET,
        refreshSecret: env.JWT_REFRESH_SECRET,
        accessExpiry: env.JWT_ACCESS_EXPIRY,
        refreshExpiry: env.JWT_REFRESH_EXPIRY,
      },
      cors: {
        origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      },
      storage: {
        r2: {
          accountId: env.R2_ACCOUNT_ID,
          accessKeyId: env.R2_ACCESS_KEY_ID,
          secretAccessKey: env.R2_SECRET_ACCESS_KEY,
          bucketName: env.R2_BUCKET_NAME,
          publicUrl: env.R2_PUBLIC_URL,
        },
      },
      rateLimit: {
        windowMs: parseInt(env.RATE_LIMIT_WINDOW_MS, 10),
        maxRequests: parseInt(env.RATE_LIMIT_MAX_REQUESTS, 10),
      },
      upload: {
        maxFileSizeMB: parseInt(env.MAX_FILE_SIZE_MB, 10),
        maxFilesPerUpload: parseInt(env.MAX_FILES_PER_UPLOAD, 10),
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(error.format());
      process.exit(1);
    }
    throw error;
  }
};

export const env = parseEnv();

export const isDevelopment = env.server.nodeEnv === 'development';
export const isProduction = env.server.nodeEnv === 'production';
export const isTest = env.server.nodeEnv === 'test';
