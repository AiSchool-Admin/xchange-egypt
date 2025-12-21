// ============================================
// Prisma Configuration - Xchange Egypt Platform
// تكوين Prisma للمنصة
// ============================================

import path from 'path';

/**
 * Prisma Configuration
 * @see https://pris.ly/prisma-config
 */
export default {
  // Schema location
  schema: path.join(__dirname, 'prisma/schema.prisma'),

  // Migration settings
  migrate: {
    // Auto-apply migrations in development
    applyMigrations: process.env.NODE_ENV === 'development',
  },

  // Studio settings
  studio: {
    port: 5555,
    browser: 'chrome',
  },

  // Client generation settings
  client: {
    // Output directory for generated client
    output: './node_modules/.prisma/client',

    // Engine type
    engineType: process.env.NODE_ENV === 'production' ? 'binary' : 'library',
  },

  // Logging configuration
  log: {
    // Log query events in development
    query: process.env.NODE_ENV === 'development',
    // Always log errors
    error: true,
    // Log warnings in development
    warn: process.env.NODE_ENV === 'development',
    // Log info in development
    info: process.env.NODE_ENV === 'development',
  },
};
