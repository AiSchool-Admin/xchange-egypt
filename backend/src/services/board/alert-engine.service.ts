/**
 * Alert Engine Service - خدمة محرك التنبيهات
 *
 * المسؤوليات:
 * - فحص KPIs وإنشاء التنبيهات
 * - إدارة دورة حياة التنبيه
 * - إطلاق اجتماعات الطوارئ تلقائياً
 * - توجيه التنبيهات للمسؤولين
 */

import { PrismaClient, AlertSeverity, AlertStatus, KPIStatus, BoardRole } from '@prisma/client';
import { meetingSchedulerService } from './meeting-scheduler.service';

const prisma = new PrismaClient();

// Role to KPI category mapping - ربط الأدوار بفئات المؤشرات
const ROLE_KPI_MAPPING: Record<string, BoardRole> = {
  FINANCIAL: 'CFO',
  OPERATIONAL: 'COO',
  CUSTOMER: 'CMO',
  TECHNICAL: 'CTO',
  GROWTH: 'CMO',
  LEGAL: 'CLO',
};

// Alert number prefix
const ALERT_PREFIX = 'ALT';

interface CreateAlertParams {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  severity: AlertSeverity;
  sourceType: string;
  sourceId?: string;
  kpiId?: string;
  assignedToId?: string;
}

interface CheckKPIParams {
  kpiCode?: string;  // If not provided, check all KPIs
  createAlert?: boolean;
}

export class AlertEngineService {
  /**
   * Generate sequential alert number - توليد رقم تسلسلي للتنبيه
   * Format: ALT-YEAR-SEQUENCE (e.g., ALT-2025-001)
   */
  async generateAlertNumber(): Promise<string> {
    const year = new Date().getFullYear();

    const count = await prisma.boardAlert.count({
      where: {
        alertNumber: {
          startsWith: `${ALERT_PREFIX}-${year}-`,
        },
      },
    });

    const sequence = String(count + 1).padStart(3, '0');
    return `${ALERT_PREFIX}-${year}-${sequence}`;
  }

  /**
   * Create alert - إنشاء تنبيه
   */
  async createAlert(params: CreateAlertParams) {
    const alertNumber = await this.generateAlertNumber();

    // Find assignee based on KPI category if not provided
    let assignedToId = params.assignedToId;
    if (!assignedToId && params.kpiId) {
      const kpi = await prisma.kPIMetric.findUnique({
        where: { id: params.kpiId },
      });
      if (kpi) {
        const role = ROLE_KPI_MAPPING[kpi.category];
        const member = await prisma.boardMember.findFirst({
          where: { role, status: 'ACTIVE' },
        });
        assignedToId = member?.id;
      }
    }

    const alert = await prisma.boardAlert.create({
      data: {
        alertNumber,
        title: params.title,
        titleAr: params.titleAr,
        description: params.description,
        descriptionAr: params.descriptionAr,
        severity: params.severity,
        status: 'ACTIVE',
        sourceType: params.sourceType,
        sourceId: params.sourceId,
        kpiId: params.kpiId,
        assignedToId,
      },
      include: {
        kpi: true,
        assignedTo: true,
      },
    });

    // Trigger emergency meeting for EMERGENCY severity
    if (params.severity === 'EMERGENCY') {
      await this.triggerEmergencyMeetingForAlert(alert.id);
    }

    return alert;
  }

  /**
   * Check KPI and create alert if needed - فحص المؤشر وإنشاء تنبيه إذا لزم الأمر
   */
  async checkKPIAndAlert(params: CheckKPIParams = {}) {
    const whereClause = params.kpiCode ? { code: params.kpiCode } : {};
    const kpis = await prisma.kPIMetric.findMany({
      where: whereClause,
      include: {
        owner: true,
      },
    });

    const alerts = [];

    for (const kpi of kpis) {
      // Skip if status is GREEN
      if (kpi.status === 'GREEN') continue;

      // Check if there's already an active alert for this KPI
      const existingAlert = await prisma.boardAlert.findFirst({
        where: {
          kpiId: kpi.id,
          status: 'ACTIVE',
        },
      });

      if (existingAlert) continue;

      // Determine severity based on KPI status
      const severity: AlertSeverity = kpi.status === 'RED' ? 'CRITICAL' : 'WARNING';

      // Create alert
      const alert = await this.createAlert({
        title: `${kpi.name} Alert`,
        titleAr: `تنبيه: ${kpi.nameAr}`,
        description: `${kpi.name} is currently at ${kpi.currentValue} ${kpi.unit || ''}, which is ${kpi.status === 'RED' ? 'critical' : 'below target'}. Target: ${kpi.targetValue} ${kpi.unit || ''}`,
        descriptionAr: `${kpi.nameAr} حالياً عند ${kpi.currentValue} ${kpi.unit || ''}، وهو ${kpi.status === 'RED' ? 'حرج' : 'أقل من الهدف'}. الهدف: ${kpi.targetValue} ${kpi.unit || ''}`,
        severity,
        sourceType: 'KPI',
        sourceId: kpi.code,
        kpiId: kpi.id,
        assignedToId: kpi.ownerId,
      });

      alerts.push(alert);
    }

    return {
      checked: kpis.length,
      alertsCreated: alerts.length,
      alerts,
    };
  }

  /**
   * Trigger emergency meeting for critical alert
   * إطلاق اجتماع طوارئ لتنبيه حرج
   */
  async triggerEmergencyMeetingForAlert(alertId: string) {
    const alert = await prisma.boardAlert.findUnique({
      where: { id: alertId },
      include: {
        kpi: true,
        assignedTo: true,
      },
    });

    if (!alert) {
      throw new Error(`Alert ${alertId} not found`);
    }

    // Get CEO as required attendee
    const ceo = await prisma.boardMember.findFirst({
      where: { role: 'CEO', status: 'ACTIVE' },
    });

    // Get relevant member based on alert source
    const relevantMembers = [ceo?.id];
    if (alert.assignedTo) {
      relevantMembers.push(alert.assignedTo.id);
    }

    const meeting = await meetingSchedulerService.triggerEmergencyMeeting({
      alertId: alert.id,
      title: `Emergency: ${alert.title}`,
      titleAr: `طوارئ: ${alert.titleAr}`,
      description: alert.description,
      descriptionAr: alert.descriptionAr,
      attendeeIds: relevantMembers.filter(Boolean) as string[],
    });

    return meeting;
  }

  /**
   * Acknowledge alert - استلام التنبيه
   */
  async acknowledgeAlert(alertId: string, memberId: string) {
    return prisma.boardAlert.update({
      where: { id: alertId },
      data: {
        status: 'ACKNOWLEDGED',
        acknowledgedById: memberId,
        acknowledgedAt: new Date(),
      },
    });
  }

  /**
   * Resolve alert - حل التنبيه
   */
  async resolveAlert(alertId: string, memberId: string, resolution: string) {
    return prisma.boardAlert.update({
      where: { id: alertId },
      data: {
        status: 'RESOLVED',
        resolvedById: memberId,
        resolvedAt: new Date(),
        resolution,
      },
    });
  }

  /**
   * Dismiss alert - تجاهل التنبيه
   */
  async dismissAlert(alertId: string, memberId: string, reason: string) {
    return prisma.boardAlert.update({
      where: { id: alertId },
      data: {
        status: 'DISMISSED',
        resolvedById: memberId,
        resolvedAt: new Date(),
        resolution: `Dismissed: ${reason}`,
      },
    });
  }

  /**
   * Get active alerts - التنبيهات النشطة
   */
  async getActiveAlerts() {
    return prisma.boardAlert.findMany({
      where: {
        status: { in: ['ACTIVE', 'ACKNOWLEDGED'] },
      },
      include: {
        kpi: true,
        assignedTo: true,
        triggeredMeeting: true,
      },
      orderBy: [
        { severity: 'desc' },  // Emergency first
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get alerts by severity - التنبيهات حسب الخطورة
   */
  async getAlertsBySeverity(severity: AlertSeverity) {
    return prisma.boardAlert.findMany({
      where: {
        severity,
        status: { in: ['ACTIVE', 'ACKNOWLEDGED'] },
      },
      include: {
        kpi: true,
        assignedTo: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Get alerts for member - التنبيهات المخصصة لعضو
   */
  async getAlertsForMember(memberId: string) {
    return prisma.boardAlert.findMany({
      where: {
        assignedToId: memberId,
        status: { in: ['ACTIVE', 'ACKNOWLEDGED'] },
      },
      include: {
        kpi: true,
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' },
      ],
    });
  }

  /**
   * Get alert dashboard - لوحة التنبيهات
   */
  async getAlertDashboard() {
    const [emergencyCount, criticalCount, warningCount, infoCount, recentAlerts] = await Promise.all([
      prisma.boardAlert.count({ where: { severity: 'EMERGENCY', status: 'ACTIVE' } }),
      prisma.boardAlert.count({ where: { severity: 'CRITICAL', status: 'ACTIVE' } }),
      prisma.boardAlert.count({ where: { severity: 'WARNING', status: 'ACTIVE' } }),
      prisma.boardAlert.count({ where: { severity: 'INFO', status: 'ACTIVE' } }),
      prisma.boardAlert.findMany({
        where: { status: { in: ['ACTIVE', 'ACKNOWLEDGED'] } },
        include: {
          kpi: true,
          assignedTo: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),
    ]);

    return {
      summary: {
        emergency: emergencyCount,
        critical: criticalCount,
        warning: warningCount,
        info: infoCount,
        total: emergencyCount + criticalCount + warningCount + infoCount,
      },
      recentAlerts,
    };
  }

  /**
   * Create manual alert - إنشاء تنبيه يدوي
   */
  async createManualAlert(params: {
    title: string;
    titleAr: string;
    description: string;
    descriptionAr: string;
    severity: AlertSeverity;
    assignedToId?: string;
    createdById: string;
  }) {
    return this.createAlert({
      ...params,
      sourceType: 'MANUAL',
      sourceId: params.createdById,
    });
  }

  /**
   * Schedule periodic KPI checks - جدولة فحص دوري للمؤشرات
   * This should be called by a cron job
   */
  async runPeriodicKPICheck() {
    console.log('[AlertEngine] Running periodic KPI check...');
    const result = await this.checkKPIAndAlert({ createAlert: true });
    console.log(`[AlertEngine] Check complete: ${result.checked} KPIs checked, ${result.alertsCreated} alerts created`);
    return result;
  }
}

export const alertEngineService = new AlertEngineService();
