#!/usr/bin/env tsx
// ============================================
// Database Connection Check Script
// سكريبت فحص اتصال قاعدة البيانات
// ============================================

import { fullDatabaseHealthCheck, disconnectDatabase } from '../src/lib/database-health';

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('         🔍 Xchange Egypt - Database Health Check              ');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('');

  try {
    const health = await fullDatabaseHealthCheck();

    // Status icon
    const statusIcon = health.status === 'healthy' ? '✅' :
                       health.status === 'degraded' ? '⚠️' : '❌';

    console.log(`${statusIcon} Status: ${health.status.toUpperCase()}`);
    console.log('');

    // Connection details
    console.log('📊 Connection Details:');
    console.log(`   Connected: ${health.details.connected ? 'Yes' : 'No'}`);
    console.log(`   Response Time: ${health.details.responseTime}ms`);
    if (health.details.version) {
      console.log(`   PostgreSQL Version: ${health.details.version}`);
    }
    if (health.details.tables !== undefined) {
      console.log(`   Tables Count: ${health.details.tables}`);
    }
    if (health.details.error) {
      console.log(`   Error: ${health.details.error}`);
    }
    console.log('');

    // Migrations
    console.log('📦 Migrations:');
    console.log(`   Applied: ${health.migrations.applied}`);
    console.log(`   Pending: ${health.migrations.pending}`);
    if (health.migrations.lastMigration) {
      console.log(`   Last Migration: ${health.migrations.lastMigration}`);
    }
    console.log('');

    // Connection pool
    console.log('🔌 Connection Pool:');
    console.log(`   Active: ${health.pool.activeConnections}`);
    console.log(`   Idle: ${health.pool.idleConnections}`);
    console.log(`   Max: ${health.pool.maxConnections}`);
    console.log('');

    console.log(`⏱️  Timestamp: ${health.timestamp}`);
    console.log('');
    console.log('═══════════════════════════════════════════════════════════════');

    // Exit with appropriate code
    if (health.status === 'unhealthy') {
      process.exit(1);
    }

    await disconnectDatabase();
    process.exit(0);
  } catch (error) {
    console.error('❌ Health check failed:', error);
    process.exit(1);
  }
}

main();
