/**
 * Global test setup
 * Runs before all tests
 */

import { PrismaClient } from '@prisma/client';

// Increase timeout for all tests (database operations can be slow)
jest.setTimeout(10000);

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/xchange_test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-for-testing';
process.env.REDIS_URL = 'redis://localhost:6379';

// Global test utilities
global.console = {
  ...console,
  // Suppress console.log during tests (optional)
  // log: jest.fn(),
  // Keep error and warn for debugging
  error: console.error,
  warn: console.warn,
  info: console.info,
  debug: console.debug,
};

// Cleanup function for tests
afterAll(async () => {
  // Add any global cleanup here
  await new Promise((resolve) => setTimeout(resolve, 500));
});
