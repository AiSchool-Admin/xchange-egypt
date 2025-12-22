/**
 * Environment setup for tests
 * This file runs BEFORE any test modules are imported
 */

// Set all required environment variables
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/xchange_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-testing';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.API_URL = 'http://localhost:5000';
process.env.FRONTEND_URL = 'http://localhost:3000';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.PORT = '5000';
process.env.JWT_ACCESS_EXPIRY = '24h';
process.env.JWT_REFRESH_EXPIRY = '30d';
process.env.RATE_LIMIT_WINDOW_MS = '900000';
process.env.RATE_LIMIT_MAX_REQUESTS = '100';
process.env.MAX_FILE_SIZE_MB = '5';
process.env.MAX_FILES_PER_UPLOAD = '10';
