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

  // Coverage thresholds - enforce minimum coverage
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
    // Higher thresholds for critical services
    './src/services/auth.service.ts': {
      branches: 70,
      functions: 70,
      lines: 70,
      statements: 70,
    },
    './src/services/barter-matching.service.ts': {
      branches: 65,
      functions: 65,
      lines: 65,
      statements: 65,
    },
  },

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
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],

  // Reporters
  reporters: [
    'default',
    [
      'jest-junit',
      {
        outputDirectory: 'coverage',
        outputName: 'junit.xml',
        suiteName: 'Xchange Backend Tests',
      },
    ],
  ],

  // Projects for different test types
  projects: [
    {
      displayName: 'unit',
      testMatch: ['<rootDir>/tests/unit/**/*.test.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: 'integration',
      testMatch: ['<rootDir>/tests/integration/**/*.test.ts'],
      testEnvironment: 'node',
    },
    {
      displayName: 'smoke',
      testMatch: ['<rootDir>/tests/smoke/**/*.test.ts'],
      testEnvironment: 'node',
    },
  ],
};
