/**
 * Global test setup
 * Runs before all tests
 */

// Mock Prisma client globally
jest.mock('../src/lib/prisma');

// Increase timeout for all tests (database operations can be slow)
jest.setTimeout(10000);

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
