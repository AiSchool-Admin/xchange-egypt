// ============================================
// Database Health Check - Xchange Egypt
// فحص صحة قاعدة البيانات
// ============================================

import { PrismaClient } from '@prisma/client';
import { prisma } from './prisma';

export interface DatabaseHealthStatus {
  connected: boolean;
  responseTime: number;
  version?: string;
  tables?: number;
  error?: string;
}

/**
 * Check database connectivity and health
 * فحص اتصال قاعدة البيانات وصحتها
 */
export async function checkDatabaseHealth(): Promise<DatabaseHealthStatus> {
  const startTime = Date.now();

  try {
    // Simple connectivity check
    await prisma.$queryRaw`SELECT 1`;

    // Get PostgreSQL version
    const versionResult = await prisma.$queryRaw<[{ version: string }]>`
      SELECT version()
    `;

    // Get table count
    const tableCountResult = await prisma.$queryRaw<[{ count: bigint }]>`
      SELECT COUNT(*) as count
      FROM information_schema.tables
      WHERE table_schema = 'public'
    `;

    const responseTime = Date.now() - startTime;

    return {
      connected: true,
      responseTime,
      version: versionResult[0]?.version?.split(' ').slice(0, 2).join(' '),
      tables: Number(tableCountResult[0]?.count || 0),
    };
  } catch (error) {
    const responseTime = Date.now() - startTime;

    return {
      connected: false,
      responseTime,
      error: error instanceof Error ? error.message : 'Unknown database error',
    };
  }
}

/**
 * Verify Prisma migrations are up to date
 * التحقق من أن migrations محدثة
 */
export async function checkMigrationStatus(): Promise<{
  pending: number;
  applied: number;
  lastMigration?: string;
}> {
  try {
    const migrations = await prisma.$queryRaw<{ migration_name: string; applied: boolean }[]>`
      SELECT migration_name, finished_at IS NOT NULL as applied
      FROM _prisma_migrations
      ORDER BY finished_at DESC
    `;

    const applied = migrations.filter(m => m.applied).length;
    const pending = migrations.filter(m => !m.applied).length;
    const lastMigration = migrations[0]?.migration_name;

    return { pending, applied, lastMigration };
  } catch (error) {
    // _prisma_migrations table doesn't exist
    return { pending: 0, applied: 0 };
  }
}

/**
 * Get database connection pool stats
 * إحصائيات مجموعة الاتصالات
 */
export async function getConnectionPoolStats(): Promise<{
  activeConnections: number;
  idleConnections: number;
  maxConnections: number;
}> {
  try {
    const stats = await prisma.$queryRaw<[{
      active: string;
      idle: string;
      max: string;
    }]>`
      SELECT
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'active')::text as active,
        (SELECT count(*) FROM pg_stat_activity WHERE state = 'idle')::text as idle,
        (SELECT setting FROM pg_settings WHERE name = 'max_connections')::text as max
    `;

    return {
      activeConnections: parseInt(stats[0]?.active || '0'),
      idleConnections: parseInt(stats[0]?.idle || '0'),
      maxConnections: parseInt(stats[0]?.max || '100'),
    };
  } catch (error) {
    return {
      activeConnections: 0,
      idleConnections: 0,
      maxConnections: 100,
    };
  }
}

/**
 * Perform full database health check
 * فحص صحة قاعدة البيانات الكامل
 */
export async function fullDatabaseHealthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: DatabaseHealthStatus;
  migrations: { pending: number; applied: number; lastMigration?: string };
  pool: { activeConnections: number; idleConnections: number; maxConnections: number };
  timestamp: string;
}> {
  const [details, migrations, pool] = await Promise.all([
    checkDatabaseHealth(),
    checkMigrationStatus(),
    getConnectionPoolStats(),
  ]);

  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  if (!details.connected) {
    status = 'unhealthy';
  } else if (migrations.pending > 0 || details.responseTime > 1000) {
    status = 'degraded';
  }

  return {
    status,
    details,
    migrations,
    pool,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Graceful database disconnect
 * إغلاق الاتصال بشكل آمن
 */
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected gracefully');
  } catch (error) {
    console.error('❌ Error disconnecting database:', error);
    throw error;
  }
}

/**
 * Initialize database connection
 * تهيئة اتصال قاعدة البيانات
 */
export async function initializeDatabase(): Promise<boolean> {
  try {
    console.log('🔌 Connecting to database...');

    const health = await checkDatabaseHealth();

    if (health.connected) {
      console.log(`✅ Database connected successfully`);
      console.log(`   📊 Version: ${health.version}`);
      console.log(`   📋 Tables: ${health.tables}`);
      console.log(`   ⏱️  Response time: ${health.responseTime}ms`);
      return true;
    } else {
      console.error(`❌ Database connection failed: ${health.error}`);
      return false;
    }
  } catch (error) {
    console.error('❌ Database initialization error:', error);
    return false;
  }
}

// Export prisma client for convenience
export { prisma };
