/**
 * Test Database Helpers
 * Utilities for managing test database state
 */

import { PrismaClient } from '@prisma/client';

let prisma: PrismaClient;

/**
 * Get or create Prisma test client
 */
export const getTestDb = (): PrismaClient => {
  if (!prisma) {
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: process.env.TEST_DATABASE_URL || process.env.DATABASE_URL,
        },
      },
    });
  }
  return prisma;
};

/**
 * Clean all tables in the database
 * WARNING: This will delete ALL data in test database
 */
export const cleanDatabase = async () => {
  const db = getTestDb();

  // Disable foreign key checks
  await db.$executeRawUnsafe('SET session_replication_role = replica;');

  // Get all table names
  const tables = await db.$queryRawUnsafe<Array<{ tablename: string }>>(`
    SELECT tablename FROM pg_tables
    WHERE schemaname = 'public'
    AND tablename != '_prisma_migrations'
  `);

  // Truncate all tables
  for (const { tablename } of tables) {
    await db.$executeRawUnsafe(`TRUNCATE TABLE "${tablename}" CASCADE;`);
  }

  // Re-enable foreign key checks
  await db.$executeRawUnsafe('SET session_replication_role = DEFAULT;');
};

/**
 * Disconnect test database
 */
export const disconnectTestDb = async () => {
  if (prisma) {
    await prisma.$disconnect();
  }
};

/**
 * Seed minimal test data
 */
export const seedTestData = async () => {
  const db = getTestDb();

  // Create a test category
  const category = await db.category.create({
    data: {
      nameEn: 'Test Electronics',
      nameAr: 'إلكترونيات تجريبية',
      slug: 'test-electronics',
      icon: '📱',
      level: 1,
      isActive: true,
    },
  });

  return { category };
};
