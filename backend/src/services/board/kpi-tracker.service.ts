/**
 * KPI Tracker Service - خدمة تتبع مؤشرات الأداء
 *
 * المسؤوليات:
 * - تتبع وتحديث قيم KPIs
 * - حساب الحالة (GREEN, YELLOW, RED)
 * - تسجيل التاريخ
 * - حساب الاتجاهات
 */

import { PrismaClient } from '@prisma/client';

// Local type definitions matching Prisma schema exactly
type KPIStatus = 'GREEN' | 'YELLOW' | 'RED';
type KPICategory = 'FINANCIAL' | 'OPERATIONAL' | 'CUSTOMER' | 'TECHNICAL' | 'GROWTH' | 'LEGAL';

const prisma = new PrismaClient();

// Default KPIs for Xchange - المؤشرات الافتراضية
export const DEFAULT_KPIS = [
  // Financial - مالي
  {
    code: 'GMV',
    name: 'Gross Merchandise Value',
    nameAr: 'إجمالي قيمة البضائع',
    category: 'FINANCIAL' as KPICategory,
    unit: 'EGP',
    targetValue: 10000000,
    warningThreshold: 7000000,
    criticalThreshold: 5000000,
    thresholdDirection: 'above',
  },
  {
    code: 'REVENUE',
    name: 'Monthly Revenue',
    nameAr: 'الإيرادات الشهرية',
    category: 'FINANCIAL' as KPICategory,
    unit: 'EGP',
    targetValue: 500000,
    warningThreshold: 350000,
    criticalThreshold: 250000,
    thresholdDirection: 'above',
  },
  {
    code: 'CAC',
    name: 'Customer Acquisition Cost',
    nameAr: 'تكلفة اكتساب العميل',
    category: 'FINANCIAL' as KPICategory,
    unit: 'EGP',
    targetValue: 50,
    warningThreshold: 75,
    criticalThreshold: 100,
    thresholdDirection: 'below',
  },
  {
    code: 'LTV',
    name: 'Customer Lifetime Value',
    nameAr: 'القيمة الدائمة للعميل',
    category: 'FINANCIAL' as KPICategory,
    unit: 'EGP',
    targetValue: 1000,
    warningThreshold: 700,
    criticalThreshold: 500,
    thresholdDirection: 'above',
  },

  // Operational - تشغيلي
  {
    code: 'ORDER_FULFILLMENT',
    name: 'Order Fulfillment Rate',
    nameAr: 'معدل إتمام الطلبات',
    category: 'OPERATIONAL' as KPICategory,
    unit: '%',
    targetValue: 95,
    warningThreshold: 85,
    criticalThreshold: 75,
    thresholdDirection: 'above',
  },
  {
    code: 'DELIVERY_TIME',
    name: 'Average Delivery Time',
    nameAr: 'متوسط وقت التوصيل',
    category: 'OPERATIONAL' as KPICategory,
    unit: 'hours',
    targetValue: 48,
    warningThreshold: 72,
    criticalThreshold: 96,
    thresholdDirection: 'below',
  },
  {
    code: 'DISPUTE_RATE',
    name: 'Dispute Rate',
    nameAr: 'معدل النزاعات',
    category: 'OPERATIONAL' as KPICategory,
    unit: '%',
    targetValue: 2,
    warningThreshold: 5,
    criticalThreshold: 10,
    thresholdDirection: 'below',
  },

  // Customer - عملاء
  {
    code: 'NPS',
    name: 'Net Promoter Score',
    nameAr: 'صافي نقاط الترويج',
    category: 'CUSTOMER' as KPICategory,
    unit: 'score',
    targetValue: 50,
    warningThreshold: 30,
    criticalThreshold: 10,
    thresholdDirection: 'above',
  },
  {
    code: 'RETENTION',
    name: 'Customer Retention Rate',
    nameAr: 'معدل الاحتفاظ بالعملاء',
    category: 'CUSTOMER' as KPICategory,
    unit: '%',
    targetValue: 80,
    warningThreshold: 60,
    criticalThreshold: 40,
    thresholdDirection: 'above',
  },
  {
    code: 'SUPPORT_RESPONSE',
    name: 'Support Response Time',
    nameAr: 'وقت استجابة الدعم',
    category: 'CUSTOMER' as KPICategory,
    unit: 'minutes',
    targetValue: 30,
    warningThreshold: 60,
    criticalThreshold: 120,
    thresholdDirection: 'below',
  },

  // Technical - تقني
  {
    code: 'UPTIME',
    name: 'System Uptime',
    nameAr: 'وقت تشغيل النظام',
    category: 'TECHNICAL' as KPICategory,
    unit: '%',
    targetValue: 99.9,
    warningThreshold: 99,
    criticalThreshold: 95,
    thresholdDirection: 'above',
  },
  {
    code: 'API_LATENCY',
    name: 'API Response Time',
    nameAr: 'وقت استجابة API',
    category: 'TECHNICAL' as KPICategory,
    unit: 'ms',
    targetValue: 200,
    warningThreshold: 500,
    criticalThreshold: 1000,
    thresholdDirection: 'below',
  },
  {
    code: 'ERROR_RATE',
    name: 'Error Rate',
    nameAr: 'معدل الأخطاء',
    category: 'TECHNICAL' as KPICategory,
    unit: '%',
    targetValue: 0.1,
    warningThreshold: 1,
    criticalThreshold: 5,
    thresholdDirection: 'below',
  },

  // Growth - نمو
  {
    code: 'MAU',
    name: 'Monthly Active Users',
    nameAr: 'المستخدمين النشطين شهرياً',
    category: 'GROWTH' as KPICategory,
    unit: 'users',
    targetValue: 100000,
    warningThreshold: 70000,
    criticalThreshold: 50000,
    thresholdDirection: 'above',
  },
  {
    code: 'USER_GROWTH',
    name: 'User Growth Rate',
    nameAr: 'معدل نمو المستخدمين',
    category: 'GROWTH' as KPICategory,
    unit: '%',
    targetValue: 10,
    warningThreshold: 5,
    criticalThreshold: 0,
    thresholdDirection: 'above',
  },
  {
    code: 'LISTING_GROWTH',
    name: 'New Listings Growth',
    nameAr: 'نمو الإعلانات الجديدة',
    category: 'GROWTH' as KPICategory,
    unit: '%',
    targetValue: 15,
    warningThreshold: 5,
    criticalThreshold: -5,
    thresholdDirection: 'above',
  },
];

interface UpdateKPIParams {
  code: string;
  value: number;
  recordHistory?: boolean;
}

interface KPIWithTrend {
  code: string;
  name: string;
  nameAr: string;
  currentValue: number;
  previousValue: number | null;
  status: KPIStatus;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  category: KPICategory;
}

export class KPITrackerService {
  /**
   * Calculate KPI status based on value and thresholds
   * حساب حالة المؤشر بناءً على القيمة والعتبات
   */
  calculateStatus(
    value: number,
    targetValue: number,
    warningThreshold: number,
    criticalThreshold: number,
    direction: string
  ): KPIStatus {
    if (direction === 'above') {
      // Higher is better (e.g., revenue, retention)
      if (value >= targetValue) return 'GREEN';
      if (value >= warningThreshold) return 'YELLOW';
      return 'RED';
    } else {
      // Lower is better (e.g., CAC, error rate)
      if (value <= targetValue) return 'GREEN';
      if (value <= warningThreshold) return 'YELLOW';
      return 'RED';
    }
  }

  /**
   * Calculate trend based on current and previous values
   * حساب الاتجاه بناءً على القيمة الحالية والسابقة
   */
  calculateTrend(
    currentValue: number,
    previousValue: number | null
  ): { trend: 'up' | 'down' | 'stable'; percentage: number } {
    if (previousValue === null || previousValue === 0) {
      return { trend: 'stable', percentage: 0 };
    }

    const change = ((currentValue - previousValue) / previousValue) * 100;

    if (Math.abs(change) < 1) {
      return { trend: 'stable', percentage: 0 };
    }

    return {
      trend: change > 0 ? 'up' : 'down',
      percentage: Math.round(change * 100) / 100,
    };
  }

  /**
   * Update KPI value - تحديث قيمة المؤشر
   */
  async updateKPI(params: UpdateKPIParams) {
    const kpi = await prisma.kPIMetric.findUnique({
      where: { code: params.code },
    });

    if (!kpi) {
      throw new Error(`KPI with code ${params.code} not found`);
    }

    // Calculate new status
    const status = this.calculateStatus(
      params.value,
      kpi.targetValue,
      kpi.warningThreshold,
      kpi.criticalThreshold,
      kpi.thresholdDirection
    );

    // Calculate trend
    const { trend, percentage } = this.calculateTrend(params.value, kpi.currentValue);

    // Update KPI
    const updated = await prisma.kPIMetric.update({
      where: { code: params.code },
      data: {
        previousValue: kpi.currentValue,
        currentValue: params.value,
        status,
        trend,
        trendPercentage: percentage,
        lastUpdatedAt: new Date(),
      },
    });

    // Record history if requested
    if (params.recordHistory !== false) {
      await prisma.kPIHistory.create({
        data: {
          kpiId: kpi.id,
          value: params.value,
          status,
          recordedAt: new Date(),
        },
      });
    }

    return updated;
  }

  /**
   * Get all KPIs with current status - جميع المؤشرات مع الحالة الحالية
   */
  async getAllKPIs(): Promise<KPIWithTrend[]> {
    const kpis = await prisma.kPIMetric.findMany({
      orderBy: [{ category: 'asc' }, { code: 'asc' }],
    });

    return kpis.map(kpi => ({
      code: kpi.code,
      name: kpi.name,
      nameAr: kpi.nameAr,
      currentValue: kpi.currentValue,
      previousValue: kpi.previousValue,
      status: kpi.status,
      trend: (kpi.trend as 'up' | 'down' | 'stable') || 'stable',
      trendPercentage: kpi.trendPercentage || 0,
      category: kpi.category,
    }));
  }

  /**
   * Get KPIs by status - المؤشرات حسب الحالة
   */
  async getKPIsByStatus(status: KPIStatus) {
    return prisma.kPIMetric.findMany({
      where: { status },
      orderBy: { category: 'asc' },
    });
  }

  /**
   * Get KPIs by category - المؤشرات حسب الفئة
   */
  async getKPIsByCategory(category: KPICategory) {
    return prisma.kPIMetric.findMany({
      where: { category },
      orderBy: { code: 'asc' },
    });
  }

  /**
   * Get critical KPIs (RED status) - المؤشرات الحرجة
   */
  async getCriticalKPIs() {
    return this.getKPIsByStatus('RED');
  }

  /**
   * Get KPI history - سجل المؤشر
   */
  async getKPIHistory(code: string, days = 30) {
    const kpi = await prisma.kPIMetric.findUnique({
      where: { code },
    });

    if (!kpi) {
      throw new Error(`KPI with code ${code} not found`);
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    return prisma.kPIHistory.findMany({
      where: {
        kpiId: kpi.id,
        recordedAt: {
          gte: startDate,
        },
      },
      orderBy: { recordedAt: 'asc' },
    });
  }

  /**
   * Initialize default KPIs - تهيئة المؤشرات الافتراضية
   */
  async initializeDefaultKPIs(ownerId: string) {
    const existingKPIs = await prisma.kPIMetric.findMany({
      select: { code: true },
    });
    const existingCodes = new Set(existingKPIs.map(k => k.code));

    const newKPIs = DEFAULT_KPIS.filter(kpi => !existingCodes.has(kpi.code));

    if (newKPIs.length === 0) {
      return { created: 0, message: 'All default KPIs already exist' };
    }

    await prisma.kPIMetric.createMany({
      data: newKPIs.map(kpi => ({
        ...kpi,
        ownerId,
        currentValue: 0,
        lastUpdatedAt: new Date(),
      })),
    });

    return { created: newKPIs.length, message: `Created ${newKPIs.length} default KPIs` };
  }

  /**
   * Get KPI dashboard summary - ملخص لوحة المؤشرات
   */
  async getDashboardSummary() {
    const [greenCount, yellowCount, redCount, allKPIs] = await Promise.all([
      prisma.kPIMetric.count({ where: { status: 'GREEN' } }),
      prisma.kPIMetric.count({ where: { status: 'YELLOW' } }),
      prisma.kPIMetric.count({ where: { status: 'RED' } }),
      prisma.kPIMetric.findMany({
        where: { status: 'RED' },
        orderBy: { updatedAt: 'desc' },
        take: 5,
      }),
    ]);

    return {
      summary: {
        green: greenCount,
        yellow: yellowCount,
        red: redCount,
        total: greenCount + yellowCount + redCount,
        healthScore: Math.round((greenCount / (greenCount + yellowCount + redCount)) * 100),
      },
      criticalKPIs: allKPIs,
    };
  }

  /**
   * Bulk update KPIs from external data source
   * تحديث مجموعة مؤشرات من مصدر بيانات خارجي
   */
  async bulkUpdateFromSource(updates: Array<{ code: string; value: number }>) {
    const results = [];

    for (const update of updates) {
      try {
        const result = await this.updateKPI(update);
        results.push({ code: update.code, success: true, status: result.status });
      } catch (error) {
        results.push({ code: update.code, success: false, error: (error as Error).message });
      }
    }

    return results;
  }
}

export const kpiTrackerService = new KPITrackerService();
