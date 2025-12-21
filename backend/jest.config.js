/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },

  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types/**',
    '!src/app.ts', // Main app file, tested via integration tests
    '!src/**/index.ts', // Re-export files
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'text-summary', 'lcov', 'html', 'json'],

  // Coverage thresholds - temporarily disabled for gradual improvement
  // coverageThreshold: {
  //   global: { branches: 60, functions: 60, lines: 60, statements: 60 },
  // },

  // Module configuration
  moduleFileExtensions: ['ts', 'js', 'json'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },

  // Setup and teardown
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  globalSetup: undefined,
  globalTeardown: undefined,

  // Test configuration
  testTimeout: 10000,
  verbose: true,
  forceExit: true,
  clearMocks: true,
  resetMocks: true,
  restoreMocks: true,

  // Test isolation
  maxWorkers: '50%',
  detectOpenHandles: true,
  testPathIgnorePatterns: [
    '/node_modules/',
    '/dist/',
  ],

  // Reporters
  reporters: ['default'],
};
