/**
 * Real-time Analytics & Performance Monitoring Service
 * خدمة التحليلات اللحظية ومراقبة الأداء
 *
 * Features:
 * - Real-time metrics collection
 * - Request/Response tracking
 * - Error monitoring
 * - System health monitoring
 */

import { EventEmitter } from 'events';

// Metric types
export interface RequestMetric {
  endpoint: string;
  method: string;
  statusCode: number;
  responseTime: number;
  timestamp: Date;
  userId?: string;
  userAgent?: string;
  ip?: string;
}

export interface ErrorMetric {
  endpoint: string;
  method: string;
  errorType: string;
  errorMessage: string;
  stackTrace?: string;
  timestamp: Date;
  userId?: string;
}

export interface SystemMetric {
  cpu: number;
  memory: number;
  heapUsed: number;
  heapTotal: number;
  activeConnections: number;
  timestamp: Date;
}

export interface RealTimeStats {
  requestsPerMinute: number;
  averageResponseTime: number;
  errorRate: number;
  activeUsers: number;
  systemHealth: SystemHealth;
  recentErrors: ErrorMetric[];
  topEndpoints: EndpointStats[];
  responseTimeHistogram: HistogramBucket[];
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'critical';
  uptime: number;
  cpu: number;
  memory: number;
  database: 'connected' | 'disconnected';
  redis: 'connected' | 'disconnected';
}

export interface EndpointStats {
  endpoint: string;
  method: string;
  requestCount: number;
  averageResponseTime: number;
  errorRate: number;
  p95ResponseTime: number;
  p99ResponseTime: number;
}

export interface HistogramBucket {
  range: string;
  count: number;
  percentage: number;
}

export interface AlertConfig {
  errorRateThreshold: number;
  responseTimeThreshold: number;
  cpuThreshold: number;
  memoryThreshold: number;
}

export interface Alert {
  id: string;
  type: 'error_rate' | 'response_time' | 'cpu' | 'memory' | 'downtime';
  severity: 'warning' | 'critical';
  message: string;
  messageAr: string;
  value: number;
  threshold: number;
  timestamp: Date;
  resolved: boolean;
  resolvedAt?: Date;
}

// Default alert configuration
const DEFAULT_ALERT_CONFIG: AlertConfig = {
  errorRateThreshold: 5, // 5% error rate
  responseTimeThreshold: 1000, // 1 second
  cpuThreshold: 80, // 80% CPU
  memoryThreshold: 85, // 85% memory
};

// Circular buffer for metrics storage
class CircularBuffer<T> {
  private buffer: T[];
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;

  constructor(private capacity: number) {
    this.buffer = new Array(capacity);
  }

  push(item: T): void {
    this.buffer[this.tail] = item;
    this.tail = (this.tail + 1) % this.capacity;

    if (this.count < this.capacity) {
      this.count++;
    } else {
      this.head = (this.head + 1) % this.capacity;
    }
  }

  getAll(): T[] {
    const result: T[] = [];
    for (let i = 0; i < this.count; i++) {
      const index = (this.head + i) % this.capacity;
      result.push(this.buffer[index]);
    }
    return result;
  }

  clear(): void {
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  size(): number {
    return this.count;
  }
}

export class RealTimeMetricsService extends EventEmitter {
  private requestMetrics: CircularBuffer<RequestMetric>;
  private errorMetrics: CircularBuffer<ErrorMetric>;
  private systemMetrics: CircularBuffer<SystemMetric>;
  private activeUsers: Set<string>;
  private startTime: Date;
  private alertConfig: AlertConfig;
  private activeAlerts: Map<string, Alert>;
  private metricsInterval: NodeJS.Timeout | null = null;

  constructor(bufferSize: number = 10000) {
    super();
    this.requestMetrics = new CircularBuffer(bufferSize);
    this.errorMetrics = new CircularBuffer(1000);
    this.systemMetrics = new CircularBuffer(1440); // 24 hours at 1-minute intervals
    this.activeUsers = new Set();
    this.startTime = new Date();
    this.alertConfig = DEFAULT_ALERT_CONFIG;
    this.activeAlerts = new Map();
  }

  /**
   * Start collecting system metrics
   */
  startMetricsCollection(intervalMs: number = 60000): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
    }

    this.metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, intervalMs);

    // Collect immediately
    this.collectSystemMetrics();
  }

  /**
   * Stop collecting metrics
   */
  stopMetricsCollection(): void {
    if (this.metricsInterval) {
      clearInterval(this.metricsInterval);
      this.metricsInterval = null;
    }
  }

  /**
   * Record a request metric
   * تسجيل مقياس طلب
   */
  recordRequest(metric: RequestMetric): void {
    this.requestMetrics.push(metric);

    // Track active user
    if (metric.userId) {
      this.activeUsers.add(metric.userId);
      // Remove user after 5 minutes of inactivity
      setTimeout(() => {
        this.activeUsers.delete(metric.userId!);
      }, 5 * 60 * 1000);
    }

    // Check for alerts
    this.checkResponseTimeAlert(metric);

    // Emit event for real-time updates
    this.emit('request', metric);
  }

  /**
   * Record an error metric
   * تسجيل مقياس خطأ
   */
  recordError(metric: ErrorMetric): void {
    this.errorMetrics.push(metric);
    this.checkErrorRateAlert();
    this.emit('error', metric);
  }

  /**
   * Collect system metrics
   * جمع مقاييس النظام
   */
  private collectSystemMetrics(): void {
    const memUsage = process.memoryUsage();

    const metric: SystemMetric = {
      cpu: this.getCpuUsage(),
      memory: (memUsage.heapUsed / memUsage.heapTotal) * 100,
      heapUsed: memUsage.heapUsed,
      heapTotal: memUsage.heapTotal,
      activeConnections: this.activeUsers.size,
      timestamp: new Date(),
    };

    this.systemMetrics.push(metric);
    this.checkSystemAlerts(metric);
    this.emit('system', metric);
  }

  /**
   * Get CPU usage (approximate)
   */
  private getCpuUsage(): number {
    const startUsage = process.cpuUsage();
    // This is a simplified calculation
    const total = startUsage.user + startUsage.system;
    return Math.min((total / 1000000) * 100, 100);
  }

  /**
   * Get real-time statistics
   * الحصول على الإحصائيات اللحظية
   */
  getRealTimeStats(): RealTimeStats {
    const now = new Date();
    const oneMinuteAgo = new Date(now.getTime() - 60 * 1000);
    const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);

    const recentRequests = this.requestMetrics
      .getAll()
      .filter((r) => r.timestamp >= oneMinuteAgo);

    const recentErrors = this.errorMetrics
      .getAll()
      .filter((e) => e.timestamp >= fiveMinutesAgo);

    const requestsPerMinute = recentRequests.length;
    const averageResponseTime =
      recentRequests.length > 0
        ? recentRequests.reduce((sum, r) => sum + r.responseTime, 0) / recentRequests.length
        : 0;

    const errorCount = recentRequests.filter((r) => r.statusCode >= 400).length;
    const errorRate = requestsPerMinute > 0 ? (errorCount / requestsPerMinute) * 100 : 0;

    return {
      requestsPerMinute,
      averageResponseTime: Math.round(averageResponseTime * 100) / 100,
      errorRate: Math.round(errorRate * 100) / 100,
      activeUsers: this.activeUsers.size,
      systemHealth: this.getSystemHealth(),
      recentErrors: recentErrors.slice(-10),
      topEndpoints: this.getTopEndpoints(),
      responseTimeHistogram: this.getResponseTimeHistogram(),
    };
  }

  /**
   * Get system health status
   * الحصول على حالة صحة النظام
   */
  getSystemHealth(): SystemHealth {
    const latestMetric = this.systemMetrics.getAll().slice(-1)[0];
    const uptime = (Date.now() - this.startTime.getTime()) / 1000; // seconds

    const cpu = latestMetric?.cpu || 0;
    const memory = latestMetric?.memory || 0;

    let status: 'healthy' | 'degraded' | 'critical' = 'healthy';

    if (cpu > this.alertConfig.cpuThreshold || memory > this.alertConfig.memoryThreshold) {
      status = 'critical';
    } else if (cpu > this.alertConfig.cpuThreshold * 0.8 || memory > this.alertConfig.memoryThreshold * 0.8) {
      status = 'degraded';
    }

    return {
      status,
      uptime,
      cpu: Math.round(cpu * 100) / 100,
      memory: Math.round(memory * 100) / 100,
      database: 'connected', // Would check actual connection
      redis: 'connected', // Would check actual connection
    };
  }

  /**
   * Get top endpoints by request count
   * الحصول على أعلى النقاط النهائية
   */
  getTopEndpoints(limit: number = 10): EndpointStats[] {
    const requests = this.requestMetrics.getAll();
    const endpointMap = new Map<string, RequestMetric[]>();

    requests.forEach((r) => {
      const key = `${r.method}:${r.endpoint}`;
      if (!endpointMap.has(key)) {
        endpointMap.set(key, []);
      }
      endpointMap.get(key)!.push(r);
    });

    return Array.from(endpointMap.entries())
      .map(([key, metrics]) => {
        const [method, endpoint] = key.split(':');
        const responseTimes = metrics.map((m) => m.responseTime).sort((a, b) => a - b);
        const errors = metrics.filter((m) => m.statusCode >= 400).length;

        return {
          endpoint,
          method,
          requestCount: metrics.length,
          averageResponseTime:
            metrics.reduce((sum, m) => sum + m.responseTime, 0) / metrics.length,
          errorRate: (errors / metrics.length) * 100,
          p95ResponseTime: responseTimes[Math.floor(metrics.length * 0.95)] || 0,
          p99ResponseTime: responseTimes[Math.floor(metrics.length * 0.99)] || 0,
        };
      })
      .sort((a, b) => b.requestCount - a.requestCount)
      .slice(0, limit);
  }

  /**
   * Get response time histogram
   * الحصول على مخطط وقت الاستجابة
   */
  getResponseTimeHistogram(): HistogramBucket[] {
    const requests = this.requestMetrics.getAll();
    const total = requests.length;

    if (total === 0) {
      return [];
    }

    const buckets = [
      { range: '0-50ms', min: 0, max: 50, count: 0 },
      { range: '50-100ms', min: 50, max: 100, count: 0 },
      { range: '100-200ms', min: 100, max: 200, count: 0 },
      { range: '200-500ms', min: 200, max: 500, count: 0 },
      { range: '500ms-1s', min: 500, max: 1000, count: 0 },
      { range: '1s-2s', min: 1000, max: 2000, count: 0 },
      { range: '>2s', min: 2000, max: Infinity, count: 0 },
    ];

    requests.forEach((r) => {
      for (const bucket of buckets) {
        if (r.responseTime >= bucket.min && r.responseTime < bucket.max) {
          bucket.count++;
          break;
        }
      }
    });

    return buckets.map((b) => ({
      range: b.range,
      count: b.count,
      percentage: (b.count / total) * 100,
    }));
  }

  /**
   * Get hourly traffic pattern
   * الحصول على نمط حركة المرور بالساعة
   */
  getHourlyTraffic(): { hour: number; requests: number; errors: number }[] {
    const requests = this.requestMetrics.getAll();
    const hourlyMap = new Map<number, { requests: number; errors: number }>();

    // Initialize all hours
    for (let i = 0; i < 24; i++) {
      hourlyMap.set(i, { requests: 0, errors: 0 });
    }

    requests.forEach((r) => {
      const hour = r.timestamp.getHours();
      const data = hourlyMap.get(hour)!;
      data.requests++;
      if (r.statusCode >= 400) {
        data.errors++;
      }
    });

    return Array.from(hourlyMap.entries())
      .map(([hour, data]) => ({
        hour,
        requests: data.requests,
        errors: data.errors,
      }))
      .sort((a, b) => a.hour - b.hour);
  }

  /**
   * Get active alerts
   * الحصول على التنبيهات النشطة
   */
  getActiveAlerts(): Alert[] {
    return Array.from(this.activeAlerts.values()).filter((a) => !a.resolved);
  }

  /**
   * Resolve an alert
   * حل تنبيه
   */
  resolveAlert(alertId: string): boolean {
    const alert = this.activeAlerts.get(alertId);
    if (alert && !alert.resolved) {
      alert.resolved = true;
      alert.resolvedAt = new Date();
      this.emit('alertResolved', alert);
      return true;
    }
    return false;
  }

  /**
   * Configure alerts
   * تكوين التنبيهات
   */
  configureAlerts(config: Partial<AlertConfig>): void {
    this.alertConfig = { ...this.alertConfig, ...config };
  }

  // Alert checking methods
  private checkResponseTimeAlert(metric: RequestMetric): void {
    if (metric.responseTime > this.alertConfig.responseTimeThreshold) {
      this.createAlert({
        type: 'response_time',
        severity: metric.responseTime > this.alertConfig.responseTimeThreshold * 2 ? 'critical' : 'warning',
        message: `High response time detected: ${metric.responseTime}ms on ${metric.endpoint}`,
        messageAr: `تم اكتشاف وقت استجابة عالي: ${metric.responseTime}ms على ${metric.endpoint}`,
        value: metric.responseTime,
        threshold: this.alertConfig.responseTimeThreshold,
      });
    }
  }

  private checkErrorRateAlert(): void {
    const recentRequests = this.requestMetrics
      .getAll()
      .filter((r) => r.timestamp >= new Date(Date.now() - 60000));

    if (recentRequests.length > 10) {
      const errorRate =
        (recentRequests.filter((r) => r.statusCode >= 400).length / recentRequests.length) * 100;

      if (errorRate > this.alertConfig.errorRateThreshold) {
        this.createAlert({
          type: 'error_rate',
          severity: errorRate > this.alertConfig.errorRateThreshold * 2 ? 'critical' : 'warning',
          message: `High error rate detected: ${errorRate.toFixed(2)}%`,
          messageAr: `تم اكتشاف معدل خطأ عالي: ${errorRate.toFixed(2)}%`,
          value: errorRate,
          threshold: this.alertConfig.errorRateThreshold,
        });
      }
    }
  }

  private checkSystemAlerts(metric: SystemMetric): void {
    if (metric.cpu > this.alertConfig.cpuThreshold) {
      this.createAlert({
        type: 'cpu',
        severity: metric.cpu > 95 ? 'critical' : 'warning',
        message: `High CPU usage: ${metric.cpu.toFixed(2)}%`,
        messageAr: `استخدام المعالج عالي: ${metric.cpu.toFixed(2)}%`,
        value: metric.cpu,
        threshold: this.alertConfig.cpuThreshold,
      });
    }

    if (metric.memory > this.alertConfig.memoryThreshold) {
      this.createAlert({
        type: 'memory',
        severity: metric.memory > 95 ? 'critical' : 'warning',
        message: `High memory usage: ${metric.memory.toFixed(2)}%`,
        messageAr: `استخدام الذاكرة عالي: ${metric.memory.toFixed(2)}%`,
        value: metric.memory,
        threshold: this.alertConfig.memoryThreshold,
      });
    }
  }

  private createAlert(data: Omit<Alert, 'id' | 'timestamp' | 'resolved'>): void {
    const id = `${data.type}-${Date.now()}`;

    // Don't create duplicate alerts
    const existingAlert = Array.from(this.activeAlerts.values()).find(
      (a) => a.type === data.type && !a.resolved && Date.now() - a.timestamp.getTime() < 300000
    );

    if (existingAlert) {
      return;
    }

    const alert: Alert = {
      id,
      ...data,
      timestamp: new Date(),
      resolved: false,
    };

    this.activeAlerts.set(id, alert);
    this.emit('alert', alert);
  }

  /**
   * Get metrics summary for dashboard
   * الحصول على ملخص المقاييس للوحة التحكم
   */
  getMetricsSummary(): {
    totalRequests: number;
    totalErrors: number;
    averageResponseTime: number;
    uptime: string;
    peakRequestsPerMinute: number;
  } {
    const requests = this.requestMetrics.getAll();
    const errors = requests.filter((r) => r.statusCode >= 400).length;
    const avgResponseTime =
      requests.length > 0
        ? requests.reduce((sum, r) => sum + r.responseTime, 0) / requests.length
        : 0;

    // Calculate uptime string
    const uptimeSeconds = (Date.now() - this.startTime.getTime()) / 1000;
    const days = Math.floor(uptimeSeconds / 86400);
    const hours = Math.floor((uptimeSeconds % 86400) / 3600);
    const minutes = Math.floor((uptimeSeconds % 3600) / 60);
    const uptime = `${days}d ${hours}h ${minutes}m`;

    // Calculate peak RPM
    const hourlyTraffic = this.getHourlyTraffic();
    const peakRequestsPerMinute = Math.max(...hourlyTraffic.map((h) => h.requests)) / 60;

    return {
      totalRequests: requests.length,
      totalErrors: errors,
      averageResponseTime: Math.round(avgResponseTime * 100) / 100,
      uptime,
      peakRequestsPerMinute: Math.round(peakRequestsPerMinute),
    };
  }

  /**
   * Clear all metrics
   * مسح جميع المقاييس
   */
  clearMetrics(): void {
    this.requestMetrics.clear();
    this.errorMetrics.clear();
    this.systemMetrics.clear();
    this.activeUsers.clear();
    this.activeAlerts.clear();
  }
}

// Singleton instance
export const realTimeMetrics = new RealTimeMetricsService();

// Express middleware for automatic request tracking
export function metricsMiddleware() {
  return (req: any, res: any, next: any) => {
    const startTime = Date.now();

    res.on('finish', () => {
      realTimeMetrics.recordRequest({
        endpoint: req.path,
        method: req.method,
        statusCode: res.statusCode,
        responseTime: Date.now() - startTime,
        timestamp: new Date(),
        userId: req.user?.id,
        userAgent: req.headers['user-agent'],
        ip: req.ip,
      });
    });

    next();
  };
}

// Error tracking middleware
export function errorTrackingMiddleware() {
  return (err: any, req: any, res: any, next: any) => {
    realTimeMetrics.recordError({
      endpoint: req.path,
      method: req.method,
      errorType: err.name || 'Error',
      errorMessage: err.message,
      stackTrace: err.stack,
      timestamp: new Date(),
      userId: req.user?.id,
    });

    next(err);
  };
}
