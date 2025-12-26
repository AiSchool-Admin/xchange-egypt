/**
 * Master Board Initialization Service
 * خدمة التهيئة الشاملة للمجلس
 *
 * This service provides a single entry point to initialize and update
 * ALL board components. It can be triggered:
 * 1. Manually via endpoint (founder button click)
 * 2. Automatically on first dashboard access each day
 * 3. By external cron services (Vercel Cron, Upstash, etc.)
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import { calculateAndUpdateAllKPIs } from '../kpi/kpi-calculator.service';
import { generateMeetingAgenda } from './agenda-intelligence.service';
import { generateMOM } from './mom-generator.service';
import { BOARD_MEMBERS_CONFIG, BoardRole } from '../../config/board/board-members.config';

interface InitializationResult {
  success: boolean;
  timestamp: Date;
  components: {
    kpis: { success: boolean; updated: number; errors: string[] };
    morningIntelligence: { success: boolean; reportNumber?: string; error?: string };
    meetings: { success: boolean; created: number; existing: number };
    agendas: { success: boolean; generated: string[] };
    reports: {
      content: { success: boolean; reportNumber?: string };
      financial: { success: boolean; reportNumber?: string };
      operations: { success: boolean; reportNumber?: string };
    };
    closingReport: { success: boolean; reportNumber?: string };
  };
  summary: {
    totalSuccess: number;
    totalFailed: number;
    executionTimeMs: number;
  };
  nextScheduledRun?: Date;
}

interface InitializationOptions {
  forceRefresh?: boolean; // Force regenerate even if already exists today
  components?: {
    kpis?: boolean;
    morningIntelligence?: boolean;
    meetings?: boolean;
    agendas?: boolean;
    reports?: boolean;
    closingReport?: boolean;
  };
}

/**
 * Check if board was already initialized today
 */
const wasInitializedToday = async (): Promise<boolean> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const lastInit = await prisma.boardInitializationLog?.findFirst({
    where: {
      createdAt: { gte: today },
    },
    orderBy: { createdAt: 'desc' },
  }).catch(() => null);

  return !!lastInit;
};

/**
 * Log initialization event
 */
const logInitialization = async (result: InitializationResult): Promise<void> => {
  try {
    // Check if table exists, if not skip logging
    await prisma.$executeRaw`
      INSERT INTO board_initialization_log (id, result, created_at)
      VALUES (gen_random_uuid(), ${JSON.stringify(result)}::jsonb, NOW())
    `.catch(() => {
      // Table might not exist, that's okay
      logger.warn('[MasterInit] Could not log initialization - table may not exist');
    });
  } catch (error) {
    logger.warn('[MasterInit] Could not log initialization');
  }
};

/**
 * Initialize KPIs
 */
const initializeKPIs = async (): Promise<{ success: boolean; updated: number; errors: string[] }> => {
  const errors: string[] = [];
  try {
    logger.info('[MasterInit] Initializing KPIs...');

    // First ensure KPIs exist
    const existingKPIs = await prisma.kPIMetric.count();
    if (existingKPIs === 0) {
      // Import and run initialization
      const { initializeKPIsFromConfig } = await import('../kpi/kpi-calculator.service');
      await initializeKPIsFromConfig();
    }

    // Then calculate from real data
    const result = await calculateAndUpdateAllKPIs();
    logger.info(`[MasterInit] KPIs updated: ${result.updated}`);

    return { success: true, updated: result.updated, errors };
  } catch (error: any) {
    errors.push(error.message);
    logger.error('[MasterInit] KPI initialization failed:', error);
    return { success: false, updated: 0, errors };
  }
};

/**
 * Generate Morning Intelligence
 */
const initializeMorningIntelligence = async (): Promise<{
  success: boolean;
  reportNumber?: string;
  error?: string;
}> => {
  try {
    logger.info('[MasterInit] Generating morning intelligence...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already exists today
    const existing = await prisma.morningIntelligence.findFirst({
      where: { date: { gte: today } },
      orderBy: { date: 'desc' },
    });

    if (existing) {
      logger.info('[MasterInit] Morning intelligence already exists for today');
      return { success: true, reportNumber: existing.reportNumber };
    }

    // Generate new intelligence
    const { generateMorningIntelligence } = await import('./morning-intelligence.service');
    const intelligence = await generateMorningIntelligence();

    logger.info(`[MasterInit] Morning intelligence generated: ${intelligence.reportNumber}`);
    return { success: true, reportNumber: intelligence.reportNumber };
  } catch (error: any) {
    logger.error('[MasterInit] Morning intelligence failed:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Initialize/Schedule Meetings
 */
const initializeMeetings = async (): Promise<{
  success: boolean;
  created: number;
  existing: number;
}> => {
  try {
    logger.info('[MasterInit] Initializing meetings...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Check existing meetings today
    const existingMeetings = await prisma.boardMeeting.findMany({
      where: {
        scheduledAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const existingTypes = existingMeetings.map((m) => m.type);
    let created = 0;

    // Get all board member IDs
    const boardMembers = await prisma.boardMember.findMany({
      where: { status: 'ACTIVE' },
    });

    // Create morning meeting if not exists
    if (!existingTypes.includes('WEEKLY')) {
      const morningTime = new Date();
      morningTime.setHours(10, 0, 0, 0);

      if (morningTime > new Date()) {
        // Generate agenda
        const agenda = await generateMeetingAgenda('MORNING', 45);

        await prisma.boardMeeting.create({
          data: {
            meetingNumber: `MTG-${Date.now()}-AM`,
            type: 'WEEKLY', // Using WEEKLY for now as schema doesn't have MORNING
            title: 'Strategic Morning Standup',
            titleAr: 'الاجتماع الصباحي الاستراتيجي',
            description: 'Daily strategic review and decision making',
            descriptionAr: 'مراجعة استراتيجية يومية واتخاذ القرارات',
            scheduledAt: morningTime,
            durationMinutes: 45,
            status: 'SCHEDULED',
            isRecurring: true,
            recurrencePattern: 'DAILY',
            agenda: agenda.items as any,
            attendees: {
              create: boardMembers.map((m) => ({
                memberId: m.id,
                role: 'REQUIRED',
                status: 'PENDING',
              })),
            },
          },
        });
        created++;
      }
    }

    // Create afternoon meeting if not exists
    if (!existingTypes.includes('STANDUP')) {
      const afternoonTime = new Date();
      afternoonTime.setHours(14, 0, 0, 0);

      if (afternoonTime > new Date()) {
        const agenda = await generateMeetingAgenda('AFTERNOON', 30);

        await prisma.boardMeeting.create({
          data: {
            meetingNumber: `MTG-${Date.now()}-PM`,
            type: 'STANDUP',
            title: 'Operational Afternoon Standup',
            titleAr: 'الاجتماع المسائي التشغيلي',
            description: 'Operational review and task alignment',
            descriptionAr: 'مراجعة العمليات ومواءمة المهام',
            scheduledAt: afternoonTime,
            durationMinutes: 30,
            status: 'SCHEDULED',
            isRecurring: true,
            recurrencePattern: 'DAILY',
            agenda: agenda.items as any,
            attendees: {
              create: boardMembers.map((m) => ({
                memberId: m.id,
                role: 'REQUIRED',
                status: 'PENDING',
              })),
            },
          },
        });
        created++;
      }
    }

    logger.info(`[MasterInit] Meetings - Created: ${created}, Existing: ${existingMeetings.length}`);
    return { success: true, created, existing: existingMeetings.length };
  } catch (error: any) {
    logger.error('[MasterInit] Meeting initialization failed:', error);
    return { success: false, created: 0, existing: 0 };
  }
};

/**
 * Generate Agendas
 */
const initializeAgendas = async (): Promise<{ success: boolean; generated: string[] }> => {
  const generated: string[] = [];
  try {
    logger.info('[MasterInit] Generating agendas...');

    // Generate each type
    const morningAgenda = await generateMeetingAgenda('MORNING', 45);
    generated.push(`MORNING (${morningAgenda.items.length} items)`);

    const afternoonAgenda = await generateMeetingAgenda('AFTERNOON', 30);
    generated.push(`AFTERNOON (${afternoonAgenda.items.length} items)`);

    // Weekly on Sundays
    const today = new Date();
    if (today.getDay() === 0) {
      const weeklyAgenda = await generateMeetingAgenda('WEEKLY', 90);
      generated.push(`WEEKLY (${weeklyAgenda.items.length} items)`);
    }

    logger.info(`[MasterInit] Agendas generated: ${generated.join(', ')}`);
    return { success: true, generated };
  } catch (error: any) {
    logger.error('[MasterInit] Agenda generation failed:', error);
    return { success: false, generated };
  }
};

/**
 * Generate Board Member Reports
 */
const initializeReports = async (): Promise<{
  content: { success: boolean; reportNumber?: string };
  financial: { success: boolean; reportNumber?: string };
  operations: { success: boolean; reportNumber?: string };
}> => {
  const results = {
    content: { success: false } as { success: boolean; reportNumber?: string },
    financial: { success: false } as { success: boolean; reportNumber?: string },
    operations: { success: false } as { success: boolean; reportNumber?: string },
  };

  try {
    logger.info('[MasterInit] Generating board member reports...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get board members
    const youssef = await prisma.boardMember.findFirst({ where: { role: 'CMO' } });
    const laila = await prisma.boardMember.findFirst({ where: { role: 'CFO' } });
    const omar = await prisma.boardMember.findFirst({ where: { role: 'COO' } });

    // Import report generators
    const { generateYoussefContentPackage } = await import('./board-members/youssef-cmo.service');
    const { generateLailaFinancialReport } = await import('./board-members/laila-cfo.service');
    const { generateOmarOperationsReport } = await import('./board-members/omar-coo.service');

    // Content Package (Youssef CMO)
    try {
      const existingContent = await prisma.boardMemberDailyReport.findFirst({
        where: {
          type: 'CONTENT_PACKAGE',
          date: { gte: today },
        },
      });

      if (existingContent) {
        results.content = { success: true, reportNumber: existingContent.reportNumber };
      } else if (youssef) {
        const content = await generateYoussefContentPackage();
        results.content = { success: true, reportNumber: content.reportNumber };
      }
    } catch (e: any) {
      logger.error('[MasterInit] Content report failed:', e.message);
    }

    // Financial Report (Laila CFO)
    try {
      const existingFinancial = await prisma.boardMemberDailyReport.findFirst({
        where: {
          type: 'FINANCIAL',
          date: { gte: today },
        },
      });

      if (existingFinancial) {
        results.financial = { success: true, reportNumber: existingFinancial.reportNumber };
      } else if (laila) {
        const financial = await generateLailaFinancialReport();
        results.financial = { success: true, reportNumber: financial.reportNumber };
      }
    } catch (e: any) {
      logger.error('[MasterInit] Financial report failed:', e.message);
    }

    // Operations Report (Omar COO)
    try {
      const existingOps = await prisma.boardMemberDailyReport.findFirst({
        where: {
          type: 'OPERATIONS',
          date: { gte: today },
        },
      });

      if (existingOps) {
        results.operations = { success: true, reportNumber: existingOps.reportNumber };
      } else if (omar) {
        const ops = await generateOmarOperationsReport();
        results.operations = { success: true, reportNumber: ops.reportNumber };
      }
    } catch (e: any) {
      logger.error('[MasterInit] Operations report failed:', e.message);
    }

    logger.info('[MasterInit] Reports generated');
    return results;
  } catch (error: any) {
    logger.error('[MasterInit] Report generation failed:', error);
    return results;
  }
};

/**
 * Generate Closing Report
 */
const initializeClosingReport = async (): Promise<{
  success: boolean;
  reportNumber?: string;
}> => {
  try {
    const now = new Date();
    const hour = now.getHours();

    // Only generate closing report after 6 PM
    if (hour < 18) {
      return { success: true, reportNumber: 'NOT_TIME_YET' };
    }

    logger.info('[MasterInit] Generating closing report...');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Check if already exists
    const existing = await prisma.dailyClosingReport.findFirst({
      where: { date: { gte: today } },
    });

    if (existing) {
      return { success: true, reportNumber: existing.reportNumber };
    }

    // Generate closing report
    const { generateDailyClosingReport } = await import('./closing-report.service');
    const report = await generateDailyClosingReport();

    return { success: true, reportNumber: report.reportNumber };
  } catch (error: any) {
    logger.error('[MasterInit] Closing report failed:', error);
    return { success: false };
  }
};

/**
 * MAIN FUNCTION: Initialize entire board
 */
export const initializeBoard = async (
  options: InitializationOptions = {}
): Promise<InitializationResult> => {
  const startTime = Date.now();
  logger.info('[MasterInit] ═══════════════════════════════════════');
  logger.info('[MasterInit] Starting full board initialization...');
  logger.info('[MasterInit] ═══════════════════════════════════════');

  const components = options.components || {
    kpis: true,
    morningIntelligence: true,
    meetings: true,
    agendas: true,
    reports: true,
    closingReport: true,
  };

  // Check if already initialized today (unless force refresh)
  if (!options.forceRefresh) {
    const alreadyInit = await wasInitializedToday();
    if (alreadyInit) {
      logger.info('[MasterInit] Board already initialized today. Use forceRefresh to regenerate.');
      // Still return current state
    }
  }

  const result: InitializationResult = {
    success: true,
    timestamp: new Date(),
    components: {
      kpis: { success: false, updated: 0, errors: [] },
      morningIntelligence: { success: false },
      meetings: { success: false, created: 0, existing: 0 },
      agendas: { success: false, generated: [] },
      reports: {
        content: { success: false },
        financial: { success: false },
        operations: { success: false },
      },
      closingReport: { success: false },
    },
    summary: {
      totalSuccess: 0,
      totalFailed: 0,
      executionTimeMs: 0,
    },
  };

  // 1. Initialize KPIs (foundation for everything else)
  if (components.kpis !== false) {
    result.components.kpis = await initializeKPIs();
    if (result.components.kpis.success) result.summary.totalSuccess++;
    else result.summary.totalFailed++;
  }

  // 2. Morning Intelligence (depends on KPIs)
  if (components.morningIntelligence !== false) {
    result.components.morningIntelligence = await initializeMorningIntelligence();
    if (result.components.morningIntelligence.success) result.summary.totalSuccess++;
    else result.summary.totalFailed++;
  }

  // 3. Meetings & Agendas (can run in parallel)
  const [meetingsResult, agendasResult] = await Promise.all([
    components.meetings !== false ? initializeMeetings() : Promise.resolve({ success: true, created: 0, existing: 0 }),
    components.agendas !== false ? initializeAgendas() : Promise.resolve({ success: true, generated: [] }),
  ]);

  result.components.meetings = meetingsResult;
  result.components.agendas = agendasResult;

  if (meetingsResult.success) result.summary.totalSuccess++;
  else result.summary.totalFailed++;
  if (agendasResult.success) result.summary.totalSuccess++;
  else result.summary.totalFailed++;

  // 4. Board Member Reports
  if (components.reports !== false) {
    result.components.reports = await initializeReports();
    const reportsSuccess =
      result.components.reports.content.success ||
      result.components.reports.financial.success ||
      result.components.reports.operations.success;
    if (reportsSuccess) result.summary.totalSuccess++;
    else result.summary.totalFailed++;
  }

  // 5. Closing Report (only if after 6 PM)
  if (components.closingReport !== false) {
    result.components.closingReport = await initializeClosingReport();
    if (result.components.closingReport.success) result.summary.totalSuccess++;
    else result.summary.totalFailed++;
  }

  // Calculate execution time
  result.summary.executionTimeMs = Date.now() - startTime;

  // Set overall success
  result.success = result.summary.totalFailed === 0;

  // Calculate next scheduled run (tomorrow 6 AM Cairo time)
  const nextRun = new Date();
  nextRun.setDate(nextRun.getDate() + 1);
  nextRun.setHours(6, 0, 0, 0);
  result.nextScheduledRun = nextRun;

  // Log the initialization
  await logInitialization(result);

  logger.info('[MasterInit] ═══════════════════════════════════════');
  logger.info(`[MasterInit] Initialization complete in ${result.summary.executionTimeMs}ms`);
  logger.info(`[MasterInit] Success: ${result.summary.totalSuccess}, Failed: ${result.summary.totalFailed}`);
  logger.info('[MasterInit] ═══════════════════════════════════════');

  return result;
};

/**
 * Quick health check - returns status without modifying anything
 */
export const getBoardHealthStatus = async (): Promise<{
  initialized: boolean;
  lastInitialization?: Date;
  components: {
    kpis: { count: number; lastUpdate?: Date };
    morningIntelligence: { hasToday: boolean; reportNumber?: string };
    meetings: { todayCount: number };
    reports: { contentToday: boolean; financialToday: boolean; operationsToday: boolean };
  };
}> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [kpis, intelligence, meetings, contentReport, financialReport, opsReport] = await Promise.all([
    prisma.kPIMetric.findMany({ orderBy: { lastUpdatedAt: 'desc' }, take: 1 }),
    prisma.morningIntelligence.findFirst({ where: { date: { gte: today } } }),
    prisma.boardMeeting.count({ where: { scheduledAt: { gte: today } } }),
    prisma.boardMemberDailyReport.findFirst({ where: { type: 'CONTENT_PACKAGE', date: { gte: today } } }),
    prisma.boardMemberDailyReport.findFirst({ where: { type: 'FINANCIAL', date: { gte: today } } }),
    prisma.boardMemberDailyReport.findFirst({ where: { type: 'OPERATIONS', date: { gte: today } } }),
  ]);

  const kpiCount = await prisma.kPIMetric.count();

  return {
    initialized: !!intelligence,
    lastInitialization: kpis[0]?.lastUpdatedAt || undefined,
    components: {
      kpis: { count: kpiCount, lastUpdate: kpis[0]?.lastUpdatedAt },
      morningIntelligence: { hasToday: !!intelligence, reportNumber: intelligence?.reportNumber },
      meetings: { todayCount: meetings },
      reports: {
        contentToday: !!contentReport,
        financialToday: !!financialReport,
        operationsToday: !!opsReport,
      },
    },
  };
};

export default {
  initializeBoard,
  getBoardHealthStatus,
};
