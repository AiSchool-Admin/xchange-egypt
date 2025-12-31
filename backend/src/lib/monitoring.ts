/**
 * Monitoring & Observability Utilities
 * أدوات المراقبة والرصد للمنصة
 *
 * يوفر هذا الملف:
 * - جمع مقاييس النظام (System Metrics)
 * - مراقبة صحة الخدمات (Health Checks)
 * - تنبيهات تلقائية (Alerts)
 * - إحصائيات الأداء (Performance Stats)
 */

import os from 'os';
import { getQueryMetrics, checkDatabaseHealth } from '../config/database';
import { getCacheStats, isRedisAvailable } from './cache';
import logger from './logger';

/**
 * System Metrics
 */
export interface SystemMetrics {
  uptime: number;
  memory: {
    total: number;
    free: number;
    used: number;
    usagePercent: number;
    heapUsed: number;
    heapTotal: number;
  };
  cpu: {
    cores: number;
    loadAverage: number[];
  };
  process: {
    pid: number;
    uptime: number;
    memoryUsage: NodeJS.MemoryUsage;
  };
}

/**
 * Health Status
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: string; responseTime?: number; error?: string };
    cache: { status: string; type: string; itemCount: number };
    memory: { status: string; usagePercent: number };
  };
}

/**
 * جمع مقاييس النظام
 */
export const getSystemMetrics = (): SystemMetrics => {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const usedMem = totalMem - freeMem;
  const memUsage = process.memoryUsage();

  return {
    uptime: os.uptime(),
    memory: {
      total: Math.round(totalMem / 1024 / 1024),
      free: Math.round(freeMem / 1024 / 1024),
      used: Math.round(usedMem / 1024 / 1024),
      usagePercent: Math.round((usedMem / totalMem) * 100),
      heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
      heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
    },
    cpu: {
      cores: os.cpus().length,
      loadAverage: os.loadavg(),
    },
    process: {
      pid: process.pid,
      uptime: process.uptime(),
      memoryUsage: memUsage,
    },
  };
};

/**
 * فحص صحة جميع الخدمات
 */
export const getHealthStatus = async (): Promise<HealthStatus> => {
  const checks: HealthStatus['checks'] = {
    database: { status: 'unknown' },
    cache: { status: 'unknown', type: 'unknown', itemCount: 0 },
    memory: { status: 'unknown', usagePercent: 0 },
  };

  // فحص قاعدة البيانات
  try {
    const dbHealth = await checkDatabaseHealth();
    checks.database = {
      status: dbHealth.isHealthy ? 'healthy' : 'unhealthy',
      responseTime: dbHealth.responseTime,
      error: dbHealth.error,
    };
  } catch (error) {
    checks.database = {
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }

  // فحص الـ Cache
  try {
    const cacheStats = await getCacheStats();
    checks.cache = {
      status: cacheStats.isAvailable ? 'healthy' : 'degraded',
      type: cacheStats.type,
      itemCount: cacheStats.itemCount,
    };
  } catch {
    checks.cache = {
      status: 'unhealthy',
      type: 'unknown',
      itemCount: 0,
    };
  }

  // فحص الذاكرة
  const metrics = getSystemMetrics();
  const memUsagePercent = metrics.memory.usagePercent;
  checks.memory = {
    status: memUsagePercent < 80 ? 'healthy' : memUsagePercent < 90 ? 'degraded' : 'unhealthy',
    usagePercent: memUsagePercent,
  };

  // تحديد الحالة الإجمالية
  const statuses = Object.values(checks).map((c) => c.status);
  let overallStatus: HealthStatus['status'] = 'healthy';
  if (statuses.includes('unhealthy')) {
    overallStatus = 'unhealthy';
  } else if (statuses.includes('degraded')) {
    overallStatus = 'degraded';
  }

  return {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '0.2.2',
    uptime: process.uptime(),
    checks,
  };
};

/**
 * إحصائيات الأداء الشاملة
 */
export interface PerformanceStats {
  requests: {
    total: number;
    perSecond: number;
  };
  database: {
    totalQueries: number;
    slowQueries: number;
    avgDuration: number;
    errors: number;
  };
  cache: {
    type: string;
    itemCount: number;
    isAvailable: boolean;
  };
  system: SystemMetrics;
}

export const getPerformanceStats = async (): Promise<PerformanceStats> => {
  const queryMetrics = getQueryMetrics();
  const cacheStats = await getCacheStats();
  const systemMetrics = getSystemMetrics();

  return {
    requests: {
      total: 0, // سيتم تتبعها لاحقاً
      perSecond: 0,
    },
    database: {
      totalQueries: queryMetrics.totalQueries,
      slowQueries: queryMetrics.slowQueries,
      avgDuration: Math.round(queryMetrics.avgDuration * 100) / 100,
      errors: queryMetrics.errors,
    },
    cache: {
      type: cacheStats.type,
      itemCount: cacheStats.itemCount,
      isAvailable: cacheStats.isAvailable,
    },
    system: systemMetrics,
  };
};

/**
 * Alert Thresholds
 */
const ALERT_THRESHOLDS = {
  memoryUsagePercent: 85,
  slowQueryThreshold: 1000, // ms
  errorRate: 5, // errors per minute
  cacheHitRate: 50, // percent
};

/**
 * فحص التنبيهات
 */
export const checkAlerts = async (): Promise<Array<{
  type: 'warning' | 'critical';
  message: string;
  value: number;
  threshold: number;
}>> => {
  const alerts: Array<{
    type: 'warning' | 'critical';
    message: string;
    value: number;
    threshold: number;
  }> = [];

  const stats = await getPerformanceStats();

  // تنبيه الذاكرة
  if (stats.system.memory.usagePercent >= ALERT_THRESHOLDS.memoryUsagePercent) {
    alerts.push({
      type: stats.system.memory.usagePercent >= 95 ? 'critical' : 'warning',
      message: 'High memory usage detected',
      value: stats.system.memory.usagePercent,
      threshold: ALERT_THRESHOLDS.memoryUsagePercent,
    });
  }

  // تنبيه الاستعلامات البطيئة
  if (stats.database.slowQueries > 10) {
    alerts.push({
      type: 'warning',
      message: 'High number of slow database queries',
      value: stats.database.slowQueries,
      threshold: 10,
    });
  }

  // تسجيل التنبيهات
  for (const alert of alerts) {
    if (alert.type === 'critical') {
      logger.error(`🚨 CRITICAL: ${alert.message}`, {
        value: alert.value,
        threshold: alert.threshold,
      });
    } else {
      logger.warn(`⚠️ WARNING: ${alert.message}`, {
        value: alert.value,
        threshold: alert.threshold,
      });
    }
  }

  return alerts;
};

/**
 * Periodic health check (run every minute)
 */
let healthCheckInterval: NodeJS.Timeout | null = null;

export const startHealthMonitoring = (intervalMs: number = 60000): void => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
  }

  healthCheckInterval = setInterval(async () => {
    try {
      const health = await getHealthStatus();
      if (health.status !== 'healthy') {
        logger.warn('System health degraded', { health });
      }

      const alerts = await checkAlerts();
      if (alerts.length > 0) {
        logger.warn(`${alerts.length} active alerts detected`);
      }
    } catch (error) {
      logger.error('Health monitoring error', error);
    }
  }, intervalMs);

  logger.info('Health monitoring started', { intervalMs });
};

export const stopHealthMonitoring = (): void => {
  if (healthCheckInterval) {
    clearInterval(healthCheckInterval);
    healthCheckInterval = null;
    logger.info('Health monitoring stopped');
  }
};

export default {
  getSystemMetrics,
  getHealthStatus,
  getPerformanceStats,
  checkAlerts,
  startHealthMonitoring,
  stopHealthMonitoring,
};
