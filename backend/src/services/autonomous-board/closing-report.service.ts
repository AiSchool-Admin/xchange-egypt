/**
 * Daily Closing Report Service
 * خدمة تقرير الإغلاق اليومي
 *
 * Runs daily at 6:00 PM Cairo time
 * Generates comprehensive end-of-day summary including:
 * - KPI changes from morning to evening
 * - Meetings held and decisions made
 * - Action items created and completed
 * - Pending approvals status
 * - Tomorrow's agenda and alerts
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface KPIChange {
  code: string;
  name: string;
  morningValue: number;
  eveningValue: number;
  change: number;
  changePercent: number;
  status: 'IMPROVED' | 'DECLINED' | 'STABLE';
}

interface DaySummary {
  meetingsHeld: number;
  decisionsCount: number;
  actionItemsCreated: number;
  actionItemsCompleted: number;
  ideasGenerated: number;
  pendingApprovals: number;
  approvedToday: number;
  autoExecuted: number;
}

/**
 * Generate report number
 */
const generateReportNumber = async (): Promise<string> => {
  const today = new Date();
  const dateStr = today.toISOString().split('T')[0].replace(/-/g, '');

  // Check for existing reports today
  const existingCount = await prisma.dailyClosingReport.count({
    where: {
      date: {
        gte: new Date(today.setHours(0, 0, 0, 0)),
        lt: new Date(today.setHours(23, 59, 59, 999)),
      },
    },
  });

  return `CLOSE-${dateStr}-${String(existingCount + 1).padStart(2, '0')}`;
};

/**
 * Get KPI changes from morning to evening
 */
const getKPIChanges = async (): Promise<KPIChange[]> => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  // Get morning intelligence for today's starting values
  const morningIntel = await prisma.morningIntelligence.findFirst({
    where: {
      date: {
        gte: startOfDay,
      },
    },
    orderBy: { date: 'asc' },
  });

  // Get current KPI values
  const currentKPIs = await prisma.kPIMetric.findMany({});

  const changes: KPIChange[] = [];

  for (const kpi of currentKPIs) {
    const morningSnapshot = morningIntel?.kpiSnapshot as Record<string, { value: number }> | null;
    const morningValue = morningSnapshot?.[kpi.code]?.value ?? kpi.currentValue;
    const eveningValue = kpi.currentValue;
    const change = eveningValue - morningValue;
    const changePercent = morningValue !== 0 ? (change / morningValue) * 100 : 0;

    let status: 'IMPROVED' | 'DECLINED' | 'STABLE' = 'STABLE';
    if (Math.abs(changePercent) > 1) {
      // Determine if change is positive based on KPI threshold direction
      const isPositiveChange = kpi.thresholdDirection === 'above' ? change > 0 : change < 0;
      status = isPositiveChange ? 'IMPROVED' : 'DECLINED';
    }

    changes.push({
      code: kpi.code,
      name: kpi.name,
      morningValue,
      eveningValue,
      change,
      changePercent: Math.round(changePercent * 100) / 100,
      status,
    });
  }

  return changes;
};

/**
 * Get day's activity summary
 */
const getDaySummary = async (): Promise<DaySummary> => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date(today);
  endOfDay.setHours(23, 59, 59, 999);

  const dateFilter = {
    gte: startOfDay,
    lte: endOfDay,
  };

  // Count meetings held today
  const meetingsHeld = await prisma.boardMeeting.count({
    where: {
      startedAt: dateFilter,
      status: { in: ['IN_PROGRESS', 'COMPLETED'] },
    },
  });

  // Count decisions made today
  const decisionsCount = await prisma.boardDecisionSPADE.count({
    where: {
      updatedAt: dateFilter,
      status: 'COMPLETED',
    },
  });

  // Count action items created today
  const actionItemsCreated = await prisma.actionItem.count({
    where: {
      createdAt: dateFilter,
    },
  });

  // Count action items completed today
  const actionItemsCompleted = await prisma.actionItem.count({
    where: {
      completedAt: dateFilter,
    },
  });

  // Count ideas generated today
  const ideasGenerated = await prisma.innovationIdea.count({
    where: {
      createdAt: dateFilter,
    },
  });

  // Count pending approvals
  const pendingApprovals = await prisma.meetingMinutes.count({
    where: {
      approvalStatus: 'PENDING',
    },
  });

  // Count approved today
  const approvedToday = await prisma.meetingMinutes.count({
    where: {
      approvedAt: dateFilter,
      approvalStatus: 'APPROVED',
    },
  });

  // Count auto-executed today
  const autoExecuted = await prisma.meetingMinutes.count({
    where: {
      autoExecutedAt: dateFilter,
    },
  });

  return {
    meetingsHeld,
    decisionsCount,
    actionItemsCreated,
    actionItemsCompleted,
    ideasGenerated,
    pendingApprovals,
    approvedToday,
    autoExecuted,
  };
};

/**
 * Generate tomorrow's agenda
 */
const generateTomorrowAgenda = async (): Promise<{ item: string; priority: string; time?: string }[]> => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);
  const tomorrowEnd = new Date(tomorrow);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const agenda: { item: string; priority: string; time?: string }[] = [];

  // Add scheduled meetings
  const scheduledMeetings = await prisma.boardMeeting.findMany({
    where: {
      scheduledAt: {
        gte: tomorrow,
        lte: tomorrowEnd,
      },
      status: 'SCHEDULED',
    },
    orderBy: { scheduledAt: 'asc' },
  });

  for (const meeting of scheduledMeetings) {
    const time = meeting.scheduledAt.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    agenda.push({
      item: `${meeting.type} Meeting: ${meeting.title}`,
      priority: meeting.type === 'EMERGENCY' ? 'HIGH' : 'NORMAL',
      time,
    });
  }

  // Add overdue action items
  const overdueItems = await prisma.actionItem.count({
    where: {
      dueDate: { lt: new Date() },
      status: { not: 'COMPLETED' },
    },
  });

  if (overdueItems > 0) {
    agenda.push({
      item: `Review ${overdueItems} overdue action items`,
      priority: 'HIGH',
    });
  }

  // Add pending decisions requiring review
  const pendingDecisions = await prisma.boardDecisionSPADE.count({
    where: {
      status: { in: ['INITIATED', 'SETTING_PHASE', 'ALTERNATIVES_PHASE', 'PEOPLE_PHASE'] },
    },
  });

  if (pendingDecisions > 0) {
    agenda.push({
      item: `${pendingDecisions} SPADE decisions awaiting completion`,
      priority: 'MEDIUM',
    });
  }

  // Default morning items
  agenda.unshift({
    item: 'Morning Intelligence Review',
    priority: 'NORMAL',
    time: '06:00 AM',
  });

  agenda.push({
    item: 'Strategic Morning Meeting',
    priority: 'NORMAL',
    time: '10:00 AM',
  });

  agenda.push({
    item: 'Operational Afternoon Meeting',
    priority: 'NORMAL',
    time: '02:00 PM',
  });

  return agenda;
};

/**
 * Generate tomorrow's alerts
 */
const generateTomorrowAlerts = async (): Promise<{ alert: string; severity: string }[]> => {
  const alerts: { alert: string; severity: string }[] = [];

  // Check for KPIs in critical state
  const criticalKPIs = await prisma.kPIMetric.findMany({
    where: {
      status: 'RED',
    },
  });

  for (const kpi of criticalKPIs) {
    alerts.push({
      alert: `KPI ${kpi.code} remains in critical state`,
      severity: 'HIGH',
    });
  }

  // Check for unacknowledged alerts
  const unacknowledgedAlerts = await prisma.boardAlert.count({
    where: {
      acknowledgedAt: null,
      resolvedAt: null,
    },
  });

  if (unacknowledgedAlerts > 0) {
    alerts.push({
      alert: `${unacknowledgedAlerts} unacknowledged alerts require attention`,
      severity: 'MEDIUM',
    });
  }

  // Check tomorrow's day for environment scan
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayOfWeek = tomorrow.getDay();

  if (dayOfWeek === 0 || dayOfWeek === 3) {
    alerts.push({
      alert: 'Environment Scan scheduled for 11:00 AM',
      severity: 'INFO',
    });
  }

  return alerts;
};

/**
 * Generate executive summary using AI
 */
const generateExecutiveSummary = async (
  kpiChanges: KPIChange[],
  daySummary: DaySummary
): Promise<{ en: string; ar: string }> => {
  try {
    const improvedKPIs = kpiChanges.filter((k) => k.status === 'IMPROVED');
    const declinedKPIs = kpiChanges.filter((k) => k.status === 'DECLINED');

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: `Generate a brief executive summary for Xchange Egypt's daily closing report.

Data:
- Meetings held: ${daySummary.meetingsHeld}
- Decisions made: ${daySummary.decisionsCount}
- Action items created: ${daySummary.actionItemsCreated}, completed: ${daySummary.actionItemsCompleted}
- Ideas generated: ${daySummary.ideasGenerated}
- Pending approvals: ${daySummary.pendingApprovals}
- KPIs improved: ${improvedKPIs.length}, declined: ${declinedKPIs.length}
${declinedKPIs.length > 0 ? `- Declined KPIs: ${declinedKPIs.map((k) => k.code).join(', ')}` : ''}

Provide response in JSON format:
{"en": "English summary (2-3 sentences)", "ar": "Arabic summary (2-3 sentences)"}`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { en: '', ar: '' };
  } catch (error) {
    logger.error('[ClosingReport] Executive summary generation error:', error);
    return {
      en: `Day completed with ${daySummary.meetingsHeld} meetings and ${daySummary.decisionsCount} decisions made.`,
      ar: `انتهى اليوم بعقد ${daySummary.meetingsHeld} اجتماعات واتخاذ ${daySummary.decisionsCount} قرارات.`,
    };
  }
};

/**
 * Calculate founder interaction time
 */
const calculateFounderInteraction = async (): Promise<{ minutes: number; decisions: number }> => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  // Count conversations with founder today
  const conversations = await prisma.boardConversation.findMany({
    where: {
      createdAt: { gte: startOfDay },
    },
    include: {
      _count: { select: { messages: true } },
    },
  });

  // Estimate 2 minutes per message as interaction time
  const totalMessages = conversations.reduce((sum, c) => sum + c._count.messages, 0);
  const estimatedMinutes = totalMessages * 2;

  // Count founder decisions today
  const founderDecisions = await prisma.boardDecisionSPADE.count({
    where: {
      decidedAt: { gte: startOfDay },
      status: 'COMPLETED',
    },
  });

  return {
    minutes: estimatedMinutes,
    decisions: founderDecisions,
  };
};

/**
 * Main function to generate daily closing report
 */
export const generateDailyClosingReport = async () => {
  logger.info('[ClosingReport] Generating daily closing report...');

  // 1. Generate report number
  const reportNumber = await generateReportNumber();

  // 2. Get KPI changes
  const kpiChanges = await getKPIChanges();

  // 3. Get day summary
  const daySummary = await getDaySummary();

  // 4. Generate executive summary
  const executiveSummary = await generateExecutiveSummary(kpiChanges, daySummary);

  // 5. Generate tomorrow's agenda
  const tomorrowAgenda = await generateTomorrowAgenda();

  // 6. Generate tomorrow's alerts
  const tomorrowAlerts = await generateTomorrowAlerts();

  // 7. Calculate founder interaction
  const founderInteraction = await calculateFounderInteraction();

  // 8. Get current KPI values
  const currentKPIs = await prisma.kPIMetric.findMany({});

  const kpiEndOfDay = currentKPIs.reduce(
    (acc, kpi) => {
      acc[kpi.code] = {
        value: kpi.currentValue,
        target: kpi.targetValue,
        status: kpi.status,
      };
      return acc;
    },
    {} as Record<string, { value: number; target: number; status: string }>
  );

  // 9. Save report to database
  const report = await prisma.dailyClosingReport.create({
    data: {
      reportNumber,
      date: new Date(),
      executiveSummary: executiveSummary.en,
      executiveSummaryAr: executiveSummary.ar,
      kpiEndOfDay: kpiEndOfDay as object,
      kpiChanges: kpiChanges as object,
      meetingsHeld: daySummary.meetingsHeld,
      decisionsCount: daySummary.decisionsCount,
      actionItemsCreated: daySummary.actionItemsCreated,
      ideasGenerated: daySummary.ideasGenerated,
      pendingApprovals: daySummary.pendingApprovals,
      approvedToday: daySummary.approvedToday,
      autoExecuted: daySummary.autoExecuted,
      tomorrowAgenda: tomorrowAgenda as object,
      tomorrowAlerts: tomorrowAlerts as object,
      founderInteractionMinutes: founderInteraction.minutes,
      founderDecisions: founderInteraction.decisions,
    },
  });

  logger.info(`[ClosingReport] Report ${reportNumber} generated successfully`);
  logger.info(`  - KPIs: ${kpiChanges.filter((k) => k.status === 'IMPROVED').length} improved, ${kpiChanges.filter((k) => k.status === 'DECLINED').length} declined`);
  logger.info(`  - Meetings: ${daySummary.meetingsHeld}, Decisions: ${daySummary.decisionsCount}`);
  logger.info(`  - Founder interaction: ${founderInteraction.minutes} minutes`);

  return report;
};

/**
 * Format closing report as markdown for notification
 */
export const formatClosingReportAsMarkdown = async (reportId: string): Promise<string> => {
  const report = await prisma.dailyClosingReport.findUnique({
    where: { id: reportId },
  });

  if (!report) {
    throw new Error('Report not found');
  }

  const kpiChanges = report.kpiChanges as KPIChange[];
  const tomorrowAgenda = report.tomorrowAgenda as { item: string; priority: string; time?: string }[];
  const tomorrowAlerts = report.tomorrowAlerts as { alert: string; severity: string }[];

  let markdown = `# Daily Closing Report - ${report.reportNumber}\n`;
  markdown += `📅 ${report.date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}\n\n`;

  markdown += `## Executive Summary\n${report.executiveSummary}\n\n`;
  markdown += `### الملخص التنفيذي\n${report.executiveSummaryAr}\n\n`;

  markdown += `## Day's Activity\n`;
  markdown += `| Metric | Value |\n|--------|-------|\n`;
  markdown += `| Meetings Held | ${report.meetingsHeld} |\n`;
  markdown += `| Decisions Made | ${report.decisionsCount} |\n`;
  markdown += `| Action Items Created | ${report.actionItemsCreated} |\n`;
  markdown += `| Ideas Generated | ${report.ideasGenerated} |\n`;
  markdown += `| Pending Approvals | ${report.pendingApprovals} |\n`;
  markdown += `| Approved Today | ${report.approvedToday} |\n`;
  markdown += `| Auto-Executed | ${report.autoExecuted} |\n\n`;

  markdown += `## KPI Changes\n`;
  for (const kpi of kpiChanges) {
    const emoji = kpi.status === 'IMPROVED' ? '📈' : kpi.status === 'DECLINED' ? '📉' : '➡️';
    markdown += `${emoji} **${kpi.code}**: ${kpi.morningValue} → ${kpi.eveningValue} (${kpi.changePercent > 0 ? '+' : ''}${kpi.changePercent}%)\n`;
  }
  markdown += '\n';

  markdown += `## Tomorrow's Agenda\n`;
  for (const item of tomorrowAgenda) {
    const priorityEmoji = item.priority === 'HIGH' ? '🔴' : item.priority === 'MEDIUM' ? '🟡' : '⚪';
    markdown += `${priorityEmoji} ${item.time ? `[${item.time}] ` : ''}${item.item}\n`;
  }
  markdown += '\n';

  if (tomorrowAlerts.length > 0) {
    markdown += `## Alerts for Tomorrow\n`;
    for (const alert of tomorrowAlerts) {
      const severityEmoji = alert.severity === 'HIGH' ? '⚠️' : alert.severity === 'MEDIUM' ? '📢' : 'ℹ️';
      markdown += `${severityEmoji} ${alert.alert}\n`;
    }
    markdown += '\n';
  }

  markdown += `---\n`;
  markdown += `*Founder Interaction: ${report.founderInteractionMinutes} minutes | Decisions: ${report.founderDecisions}*\n`;

  return markdown;
};

export default {
  generateDailyClosingReport,
  formatClosingReportAsMarkdown,
};
