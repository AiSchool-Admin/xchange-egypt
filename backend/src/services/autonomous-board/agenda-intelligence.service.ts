/**
 * Agenda Intelligence Service
 * خدمة ذكاء الأجندة
 *
 * Creates context-aware meeting agendas based on:
 * - Current company phase priorities
 * - Morning intelligence signals
 * - Pending decisions and action items
 * - KPI status and alerts
 * - Founder overrides
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';
import { getCurrentPhaseConfig, CompanyPhase } from '../../config/board';
import { BOARD_MEMBERS_CONFIG, BoardRole } from '../../config/board/board-members.config';

const anthropic = new Anthropic();

export interface AgendaItem {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  type: 'STRATEGIC' | 'OPERATIONAL' | 'INNOVATION' | 'CRISIS' | 'REVIEW' | 'DECISION';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  timeAllocation: number; // minutes
  leadMember: string; // Board member role
  participants: string[]; // Board member roles
  context: string;
  requiredDecision: boolean;
  relatedKPIs: string[];
  relatedAlerts: string[];
  source: 'SYSTEM' | 'FOUNDER' | 'BOARD' | 'INTELLIGENCE';
  founderOverride: boolean;
}

export interface MeetingAgenda {
  id: string;
  meetingType: 'MORNING' | 'AFTERNOON' | 'EMERGENCY';
  date: Date;
  totalDuration: number; // minutes
  items: AgendaItem[];
  executiveSummary: string;
  executiveSummaryAr: string;
  phaseContext: string;
  approvedByFounder: boolean;
  founderNotes?: string;
}

/**
 * Generate unique ID for agenda items
 */
const generateAgendaItemId = (): string => {
  return `AGENDA-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
};

/**
 * Get priority-based time allocation
 */
const getTimeAllocation = (priority: string, type: string): number => {
  const baseTime: Record<string, number> = {
    CRITICAL: 20,
    HIGH: 15,
    MEDIUM: 10,
    LOW: 5,
  };

  const typeMultiplier: Record<string, number> = {
    STRATEGIC: 1.5,
    DECISION: 1.3,
    CRISIS: 2.0,
    INNOVATION: 1.2,
    OPERATIONAL: 1.0,
    REVIEW: 0.8,
  };

  return Math.round((baseTime[priority] || 10) * (typeMultiplier[type] || 1));
};

/**
 * Determine lead member based on item type
 */
const getLeadMember = (type: string, context: string): string => {
  const typeToRole: Record<string, BoardRole> = {
    STRATEGIC: BoardRole.CEO,
    OPERATIONAL: BoardRole.COO,
    INNOVATION: BoardRole.CTO,
    CRISIS: BoardRole.CEO,
    REVIEW: BoardRole.CFO,
    DECISION: BoardRole.CEO,
  };

  // Check context for specific keywords to assign appropriate lead
  if (context.toLowerCase().includes('technical') || context.toLowerCase().includes('development')) {
    return BoardRole.CTO;
  }
  if (context.toLowerCase().includes('financial') || context.toLowerCase().includes('budget')) {
    return BoardRole.CFO;
  }
  if (context.toLowerCase().includes('marketing') || context.toLowerCase().includes('growth')) {
    return BoardRole.CMO;
  }
  if (context.toLowerCase().includes('legal') || context.toLowerCase().includes('compliance')) {
    return BoardRole.CLO;
  }
  if (context.toLowerCase().includes('operations') || context.toLowerCase().includes('process')) {
    return BoardRole.COO;
  }

  return typeToRole[type] || BoardRole.CEO;
};

/**
 * Get participants based on item type and lead
 */
const getParticipants = (type: string, lead: string): string[] => {
  const allRoles = Object.values(BoardRole);

  // For strategic and crisis items, all members participate
  if (type === 'STRATEGIC' || type === 'CRISIS' || type === 'DECISION') {
    return allRoles;
  }

  // For other types, include relevant members
  const coreParticipants = [BoardRole.CEO, lead];

  if (type === 'INNOVATION') {
    coreParticipants.push(BoardRole.CTO, BoardRole.CMO);
  } else if (type === 'OPERATIONAL') {
    coreParticipants.push(BoardRole.COO, BoardRole.CFO);
  } else if (type === 'REVIEW') {
    coreParticipants.push(BoardRole.CFO, BoardRole.COO);
  }

  return [...new Set(coreParticipants)];
};

/**
 * Get agenda items from system events
 */
const getSystemAgendaItems = async (): Promise<AgendaItem[]> => {
  const items: AgendaItem[] = [];
  const today = new Date();
  const startOfDay = new Date(today.setHours(0, 0, 0, 0));

  // 1. Get critical KPI alerts
  const criticalKPIs = await prisma.kPIMetric.findMany({
    where: { status: 'RED' },
  });

  for (const kpi of criticalKPIs) {
    items.push({
      id: generateAgendaItemId(),
      title: `KPI Alert: ${kpi.name}`,
      titleAr: `تنبيه مؤشر: ${kpi.nameAr}`,
      description: `${kpi.name} is in critical status (${kpi.currentValue} vs target ${kpi.targetValue})`,
      type: 'CRISIS',
      priority: 'CRITICAL',
      timeAllocation: getTimeAllocation('CRITICAL', 'CRISIS'),
      leadMember: getLeadMember('CRISIS', kpi.name),
      participants: getParticipants('CRISIS', BoardRole.CEO),
      context: `KPI ${kpi.code} requires immediate attention`,
      requiredDecision: true,
      relatedKPIs: [kpi.code],
      relatedAlerts: [],
      source: 'SYSTEM',
      founderOverride: false,
    });
  }

  // 2. Get unacknowledged alerts
  const activeAlerts = await prisma.boardAlert.findMany({
    where: { acknowledgedAt: null, resolvedAt: null },
    orderBy: { severity: 'desc' },
    take: 5,
  });

  for (const alert of activeAlerts) {
    items.push({
      id: generateAgendaItemId(),
      title: alert.title,
      titleAr: alert.titleAr || alert.title,
      description: alert.description || '',
      type: alert.severity === 'CRITICAL' ? 'CRISIS' : 'OPERATIONAL',
      priority: alert.severity as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
      timeAllocation: getTimeAllocation(alert.severity, 'OPERATIONAL'),
      leadMember: getLeadMember('OPERATIONAL', alert.title),
      participants: getParticipants('OPERATIONAL', BoardRole.COO),
      context: `Alert requires board attention`,
      requiredDecision: alert.severity === 'CRITICAL',
      relatedKPIs: [],
      relatedAlerts: [alert.id],
      source: 'SYSTEM',
      founderOverride: false,
    });
  }

  // 3. Get pending SPADE decisions
  const pendingDecisions = await prisma.boardDecisionSPADE.findMany({
    where: { status: { in: ['INITIATED', 'SETTING_PHASE', 'PEOPLE_PHASE', 'ALTERNATIVES_PHASE'] } },
    orderBy: { createdAt: 'asc' },
    take: 3,
  });

  for (const decision of pendingDecisions) {
    items.push({
      id: generateAgendaItemId(),
      title: `Decision: ${decision.title}`,
      titleAr: `قرار: ${decision.titleAr}`,
      description: decision.description || '',
      type: 'DECISION',
      priority: 'HIGH',
      timeAllocation: getTimeAllocation('HIGH', 'DECISION'),
      leadMember: BoardRole.CEO,
      participants: getParticipants('DECISION', BoardRole.CEO),
      context: `SPADE decision in ${decision.status} phase`,
      requiredDecision: true,
      relatedKPIs: [],
      relatedAlerts: [],
      source: 'SYSTEM',
      founderOverride: false,
    });
  }

  // 4. Get overdue action items
  const overdueItems = await prisma.actionItem.findMany({
    where: {
      dueDate: { lt: new Date() },
      status: { not: 'COMPLETED' },
    },
    take: 5,
  });

  if (overdueItems.length > 0) {
    items.push({
      id: generateAgendaItemId(),
      title: `Overdue Action Items Review (${overdueItems.length} items)`,
      titleAr: `مراجعة بنود العمل المتأخرة (${overdueItems.length} بنود)`,
      description: `${overdueItems.length} action items are overdue and require attention`,
      type: 'REVIEW',
      priority: 'HIGH',
      timeAllocation: getTimeAllocation('HIGH', 'REVIEW'),
      leadMember: BoardRole.COO,
      participants: getParticipants('REVIEW', BoardRole.COO),
      context: 'Action items past due date',
      requiredDecision: false,
      relatedKPIs: [],
      relatedAlerts: [],
      source: 'SYSTEM',
      founderOverride: false,
    });
  }

  return items;
};

/**
 * Get agenda items from morning intelligence
 */
const getIntelligenceAgendaItems = async (): Promise<AgendaItem[]> => {
  const items: AgendaItem[] = [];
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  // Get today's morning intelligence
  const intelligence = await prisma.morningIntelligence.findFirst({
    where: { date: { gte: startOfDay } },
    orderBy: { date: 'desc' },
  });

  if (!intelligence) return items;

  // Parse agenda suggestions from intelligence (stored in recommendations field)
  const agendaSuggestions = (intelligence as any).recommendations as { items?: Array<{ title: string; priority: string; type: string }> } | null;
  if (agendaSuggestions?.items) {
    for (const suggestion of agendaSuggestions.items) {
      items.push({
        id: generateAgendaItemId(),
        title: suggestion.title,
        titleAr: suggestion.title, // Would need translation
        description: 'Suggested by morning intelligence analysis',
        type: (suggestion.type as AgendaItem['type']) || 'STRATEGIC',
        priority: (suggestion.priority as AgendaItem['priority']) || 'MEDIUM',
        timeAllocation: getTimeAllocation(suggestion.priority || 'MEDIUM', suggestion.type || 'STRATEGIC'),
        leadMember: getLeadMember(suggestion.type || 'STRATEGIC', suggestion.title),
        participants: getParticipants(suggestion.type || 'STRATEGIC', BoardRole.CEO),
        context: 'From morning intelligence analysis',
        requiredDecision: false,
        relatedKPIs: [],
        relatedAlerts: [],
        source: 'INTELLIGENCE',
        founderOverride: false,
      });
    }
  }

  // Check for anomalies that need discussion
  const anomalies = intelligence.anomalies as Array<{ kpiCode: string; description: string; severity: string }> | null;
  if (anomalies && anomalies.length > 0) {
    for (const anomaly of anomalies.filter((a) => a.severity === 'HIGH' || a.severity === 'CRITICAL')) {
      items.push({
        id: generateAgendaItemId(),
        title: `Anomaly Discussion: ${anomaly.kpiCode}`,
        titleAr: `مناقشة الشذوذ: ${anomaly.kpiCode}`,
        description: anomaly.description,
        type: 'STRATEGIC',
        priority: anomaly.severity as 'HIGH' | 'CRITICAL',
        timeAllocation: getTimeAllocation(anomaly.severity, 'STRATEGIC'),
        leadMember: BoardRole.CEO,
        participants: Object.values(BoardRole),
        context: 'Anomaly detected in morning intelligence',
        requiredDecision: true,
        relatedKPIs: [anomaly.kpiCode],
        relatedAlerts: [],
        source: 'INTELLIGENCE',
        founderOverride: false,
      });
    }
  }

  return items;
};

/**
 * Get XChange platform-specific agenda items
 * Pulls real data from the platform for relevant discussions
 */
const getXChangePlatformItems = async (meetingType: 'MORNING' | 'AFTERNOON'): Promise<AgendaItem[]> => {
  const items: AgendaItem[] = [];
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const lastWeek = new Date(today);
  lastWeek.setDate(lastWeek.getDate() - 7);

  try {
    // Get platform statistics for morning meeting
    if (meetingType === 'MORNING') {
      // 1. Yesterday's Orders Summary
      const yesterdayOrders = await prisma.order.count({
        where: {
          createdAt: { gte: yesterday, lt: today },
        },
      });

      const pendingOrders = await prisma.order.count({
        where: { status: 'PENDING' },
      });

      if (yesterdayOrders > 0 || pendingOrders > 0) {
        items.push({
          id: generateAgendaItemId(),
          title: `Orders Review: ${yesterdayOrders} yesterday, ${pendingOrders} pending`,
          titleAr: `مراجعة الطلبات: ${yesterdayOrders} أمس، ${pendingOrders} معلقة`,
          description: `Review yesterday's ${yesterdayOrders} orders and ${pendingOrders} pending orders requiring action`,
          type: 'OPERATIONAL',
          priority: pendingOrders > 10 ? 'HIGH' : 'MEDIUM',
          timeAllocation: 8,
          leadMember: BoardRole.COO,
          participants: [BoardRole.CEO, BoardRole.COO, BoardRole.CFO],
          context: 'Daily order processing and fulfillment status',
          requiredDecision: pendingOrders > 20,
          relatedKPIs: ['ORD_FULFILLMENT', 'ORD_VOLUME'],
          relatedAlerts: [],
          source: 'SYSTEM',
          founderOverride: false,
        });
      }

      // 2. New Listings Activity
      const newListings = await prisma.listing.count({
        where: {
          createdAt: { gte: yesterday },
        },
      });

      const pendingListings = await prisma.listing.count({
        where: { status: 'ACTIVE' },
      });

      items.push({
        id: generateAgendaItemId(),
        title: `Marketplace Activity: ${newListings} new listings`,
        titleAr: `نشاط السوق: ${newListings} إعلانات جديدة`,
        description: `${newListings} new listings added, ${pendingListings} awaiting approval`,
        type: 'OPERATIONAL',
        priority: 'MEDIUM',
        timeAllocation: 5,
        leadMember: BoardRole.CMO,
        participants: [BoardRole.CEO, BoardRole.CMO, BoardRole.COO],
        context: 'Marketplace growth and listing quality',
        requiredDecision: false,
        relatedKPIs: ['MKT_LISTINGS', 'MKT_GROWTH'],
        relatedAlerts: [],
        source: 'SYSTEM',
        founderOverride: false,
      });

      // 3. User Growth
      const newUsers = await prisma.user.count({
        where: {
          createdAt: { gte: lastWeek },
        },
      });

      const totalUsers = await prisma.user.count();

      items.push({
        id: generateAgendaItemId(),
        title: `User Growth: ${newUsers} new users this week`,
        titleAr: `نمو المستخدمين: ${newUsers} مستخدم جديد هذا الأسبوع`,
        description: `Total users: ${totalUsers}, Weekly growth: ${newUsers}`,
        type: 'STRATEGIC',
        priority: 'MEDIUM',
        timeAllocation: 5,
        leadMember: BoardRole.CMO,
        participants: [BoardRole.CEO, BoardRole.CMO],
        context: 'User acquisition and retention metrics',
        requiredDecision: false,
        relatedKPIs: ['USR_GROWTH', 'USR_RETENTION'],
        relatedAlerts: [],
        source: 'SYSTEM',
        founderOverride: false,
      });

      // 4. Financial Snapshot (morning only)
      const yesterdayTransactions = await prisma.transaction.aggregate({
        where: {
          createdAt: { gte: yesterday, lt: today },
          status: 'COMPLETED',
        },
        _sum: { finalPrice: true },
      });

      const revenue = yesterdayTransactions._sum.finalPrice || 0;
      items.push({
        id: generateAgendaItemId(),
        title: `Financial Snapshot: ${revenue.toLocaleString('ar-EG')} EGP yesterday`,
        titleAr: `لمحة مالية: ${revenue.toLocaleString('ar-EG')} جنيه أمس`,
        description: `Yesterday's revenue and financial health overview`,
        type: 'REVIEW',
        priority: 'HIGH',
        timeAllocation: 8,
        leadMember: BoardRole.CFO,
        participants: [BoardRole.CEO, BoardRole.CFO],
        context: 'Daily financial performance',
        requiredDecision: false,
        relatedKPIs: ['FIN_REVENUE', 'FIN_GMV'],
        relatedAlerts: [],
        source: 'SYSTEM',
        founderOverride: false,
      });
    }

    // Afternoon meeting focuses on operations
    if (meetingType === 'AFTERNOON') {
      // 1. Customer Support Status
      const openChats = await prisma.conversation.count({
        where: {
          updatedAt: { gte: yesterday },
        },
      });

      items.push({
        id: generateAgendaItemId(),
        title: `Customer Engagement: ${openChats} active conversations`,
        titleAr: `تفاعل العملاء: ${openChats} محادثة نشطة`,
        description: `Monitor customer interactions and response quality`,
        type: 'OPERATIONAL',
        priority: 'MEDIUM',
        timeAllocation: 5,
        leadMember: BoardRole.COO,
        participants: [BoardRole.COO, BoardRole.CMO],
        context: 'Customer service performance',
        requiredDecision: false,
        relatedKPIs: ['CS_RESPONSE', 'CS_SATISFACTION'],
        relatedAlerts: [],
        source: 'SYSTEM',
        founderOverride: false,
      });

      // 2. Barter Activity
      const activeBarters = await prisma.barterOffer.count({
        where: { status: 'PENDING' },
      });

      if (activeBarters > 0) {
        items.push({
          id: generateAgendaItemId(),
          title: `Barter Exchange: ${activeBarters} active trades`,
          titleAr: `تبادل المقايضة: ${activeBarters} صفقة نشطة`,
          description: `Review barter marketplace activity and matching success`,
          type: 'OPERATIONAL',
          priority: 'MEDIUM',
          timeAllocation: 5,
          leadMember: BoardRole.COO,
          participants: [BoardRole.COO, BoardRole.CTO],
          context: 'Barter feature performance',
          requiredDecision: false,
          relatedKPIs: ['BRT_VOLUME', 'BRT_SUCCESS'],
          relatedAlerts: [],
          source: 'SYSTEM',
          founderOverride: false,
        });
      }

      // 3. Technical Health
      items.push({
        id: generateAgendaItemId(),
        title: 'Technical Systems Health Check',
        titleAr: 'فحص صحة الأنظمة التقنية',
        description: 'Review API performance, error rates, and system stability',
        type: 'OPERATIONAL',
        priority: 'MEDIUM',
        timeAllocation: 5,
        leadMember: BoardRole.CTO,
        participants: [BoardRole.CTO, BoardRole.COO],
        context: 'Platform reliability and performance',
        requiredDecision: false,
        relatedKPIs: ['TECH_UPTIME', 'TECH_ERRORS'],
        relatedAlerts: [],
        source: 'SYSTEM',
        founderOverride: false,
      });

      // 4. Action Items Progress
      const todayActionItems = await prisma.actionItem.count({
        where: {
          dueDate: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
          },
          status: { not: 'COMPLETED' },
        },
      });

      if (todayActionItems > 0) {
        items.push({
          id: generateAgendaItemId(),
          title: `Today's Action Items: ${todayActionItems} due today`,
          titleAr: `بنود العمل اليوم: ${todayActionItems} مستحقة اليوم`,
          description: `Review and ensure completion of today's action items`,
          type: 'OPERATIONAL',
          priority: 'HIGH',
          timeAllocation: 8,
          leadMember: BoardRole.COO,
          participants: Object.values(BoardRole),
          context: 'Daily task completion tracking',
          requiredDecision: false,
          relatedKPIs: [],
          relatedAlerts: [],
          source: 'SYSTEM',
          founderOverride: false,
        });
      }
    }
  } catch (error) {
    logger.error('[AgendaIntelligence] Error getting platform items:', error);
    // Return default items if database queries fail
    items.push({
      id: generateAgendaItemId(),
      title: meetingType === 'MORNING' ? 'Daily Business Review' : 'Operational Status Update',
      titleAr: meetingType === 'MORNING' ? 'مراجعة الأعمال اليومية' : 'تحديث الحالة التشغيلية',
      description: 'Review overall business performance and key metrics',
      type: 'REVIEW',
      priority: 'MEDIUM',
      timeAllocation: 10,
      leadMember: BoardRole.CEO,
      participants: Object.values(BoardRole),
      context: 'Standard daily review',
      requiredDecision: false,
      relatedKPIs: [],
      relatedAlerts: [],
      source: 'SYSTEM',
      founderOverride: false,
    });
  }

  return items;
};

/**
 * Get innovation agenda items
 */
const getInnovationAgendaItems = async (meetingType: 'MORNING' | 'AFTERNOON'): Promise<AgendaItem[]> => {
  const items: AgendaItem[] = [];
  const phaseConfig = getCurrentPhaseConfig();

  // Morning meetings focus more on innovation
  if (meetingType === 'MORNING' && phaseConfig.innovationMode !== 'CONSERVATIVE') {
    items.push({
      id: generateAgendaItemId(),
      title: 'Innovation Spotlight: 10X Thinking Session',
      titleAr: 'جلسة الابتكار: تفكير 10X',
      description: 'Brainstorm moonshot ideas that could transform the business',
      type: 'INNOVATION',
      priority: 'MEDIUM',
      timeAllocation: 15,
      leadMember: BoardRole.CTO,
      participants: [BoardRole.CEO, BoardRole.CTO, BoardRole.CMO],
      context: `Company phase: ${phaseConfig.phase} - Innovation mode: ${phaseConfig.innovationMode}`,
      requiredDecision: false,
      relatedKPIs: [],
      relatedAlerts: [],
      source: 'SYSTEM',
      founderOverride: false,
    });
  }

  // Get pending innovation ideas for review
  const pendingIdeas = await prisma.innovationIdea.count({
    where: { status: 'PROPOSED' },
  });

  if (pendingIdeas > 0) {
    items.push({
      id: generateAgendaItemId(),
      title: `Review Innovation Ideas (${pendingIdeas} pending)`,
      titleAr: `مراجعة أفكار الابتكار (${pendingIdeas} قيد الانتظار)`,
      description: `${pendingIdeas} innovation ideas await board review`,
      type: 'INNOVATION',
      priority: 'MEDIUM',
      timeAllocation: 10,
      leadMember: BoardRole.CTO,
      participants: [BoardRole.CEO, BoardRole.CTO, BoardRole.CMO, BoardRole.CFO],
      context: 'Ideas from previous meetings',
      requiredDecision: true,
      relatedKPIs: [],
      relatedAlerts: [],
      source: 'SYSTEM',
      founderOverride: false,
    });
  }

  return items;
};

/**
 * Get phase-specific agenda items
 */
const getPhaseSpecificItems = async (): Promise<AgendaItem[]> => {
  const items: AgendaItem[] = [];
  const phaseConfig = getCurrentPhaseConfig();

  // Add phase-specific review item
  items.push({
    id: generateAgendaItemId(),
    title: `${phaseConfig.name} Phase Progress Review`,
    titleAr: `مراجعة تقدم مرحلة ${phaseConfig.nameAr}`,
    description: `Review progress against ${phaseConfig.phase} phase goals`,
    type: 'REVIEW',
    priority: 'MEDIUM',
    timeAllocation: 10,
    leadMember: BoardRole.CEO,
    participants: Object.values(BoardRole),
    context: `Primary goal: ${phaseConfig.primaryGoal}`,
    requiredDecision: false,
    relatedKPIs: phaseConfig.kpis.map((k) => k.code),
    relatedAlerts: [],
    source: 'SYSTEM',
    founderOverride: false,
  });

  return items;
};

/**
 * Prioritize and order agenda items
 */
const prioritizeAgendaItems = (items: AgendaItem[], maxDuration: number): AgendaItem[] => {
  // Sort by priority and type
  const priorityOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
  const typeOrder = { CRISIS: 5, DECISION: 4, STRATEGIC: 3, OPERATIONAL: 2, INNOVATION: 1, REVIEW: 0 };

  const sorted = items.sort((a, b) => {
    // Founder overrides first
    if (a.founderOverride !== b.founderOverride) {
      return a.founderOverride ? -1 : 1;
    }

    // Then by priority
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
    if (priorityDiff !== 0) return priorityDiff;

    // Then by type
    return typeOrder[b.type] - typeOrder[a.type];
  });

  // Fit items within max duration
  let totalTime = 0;
  const selected: AgendaItem[] = [];

  for (const item of sorted) {
    if (totalTime + item.timeAllocation <= maxDuration) {
      selected.push(item);
      totalTime += item.timeAllocation;
    } else if (item.priority === 'CRITICAL') {
      // Always include critical items, adjust time if needed
      item.timeAllocation = Math.min(item.timeAllocation, maxDuration - totalTime + 10);
      selected.push(item);
      totalTime += item.timeAllocation;
    }
  }

  return selected;
};

/**
 * Generate executive summary for agenda
 */
const generateAgendaSummary = async (items: AgendaItem[]): Promise<{ en: string; ar: string }> => {
  try {
    const phaseConfig = getCurrentPhaseConfig();
    const criticalCount = items.filter((i) => i.priority === 'CRITICAL').length;
    const decisionCount = items.filter((i) => i.requiredDecision).length;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `Generate a brief executive summary for today's board meeting agenda.

Company Phase: ${phaseConfig.phase} - ${phaseConfig.name}
Total Items: ${items.length}
Critical Items: ${criticalCount}
Decisions Required: ${decisionCount}

Key Topics:
${items.slice(0, 5).map((i) => `- ${i.title} (${i.priority})`).join('\n')}

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
    logger.error('[AgendaIntelligence] Summary generation error:', error);
    return {
      en: `Today's agenda includes ${items.length} items with ${items.filter((i) => i.requiredDecision).length} decisions required.`,
      ar: `تتضمن أجندة اليوم ${items.length} بنود مع ${items.filter((i) => i.requiredDecision).length} قرارات مطلوبة.`,
    };
  }
};

/**
 * Main function to generate meeting agenda
 */
export const generateMeetingAgenda = async (
  meetingType: 'MORNING' | 'AFTERNOON' | 'EMERGENCY',
  maxDuration: number = 60, // default 60 minutes
  founderOverrides?: AgendaItem[]
): Promise<MeetingAgenda> => {
  logger.info(`[AgendaIntelligence] Generating ${meetingType} meeting agenda...`);

  // Collect agenda items from all sources
  const systemItems = await getSystemAgendaItems();
  const intelligenceItems = await getIntelligenceAgendaItems();
  const platformItems = meetingType !== 'EMERGENCY'
    ? await getXChangePlatformItems(meetingType as 'MORNING' | 'AFTERNOON')
    : [];
  const innovationItems = meetingType !== 'EMERGENCY'
    ? await getInnovationAgendaItems(meetingType as 'MORNING' | 'AFTERNOON')
    : [];
  const phaseItems = await getPhaseSpecificItems();

  // Combine all items - platform items are prioritized for relevance
  let allItems = [...systemItems, ...platformItems, ...intelligenceItems, ...innovationItems, ...phaseItems];

  // Add founder overrides with highest priority
  if (founderOverrides && founderOverrides.length > 0) {
    const overrideItems = founderOverrides.map((item) => ({
      ...item,
      founderOverride: true,
      source: 'FOUNDER' as const,
    }));
    allItems = [...overrideItems, ...allItems];
  }

  // Prioritize and select items within time budget
  const selectedItems = prioritizeAgendaItems(allItems, maxDuration);

  // Generate summary
  const summary = await generateAgendaSummary(selectedItems);

  const phaseConfig = getCurrentPhaseConfig();

  const agenda: MeetingAgenda = {
    id: `AGENDA-${meetingType}-${Date.now()}`,
    meetingType,
    date: new Date(),
    totalDuration: selectedItems.reduce((sum, item) => sum + item.timeAllocation, 0),
    items: selectedItems,
    executiveSummary: summary.en,
    executiveSummaryAr: summary.ar,
    phaseContext: `${phaseConfig.phase}: ${phaseConfig.primaryGoal}`,
    approvedByFounder: false,
  };

  logger.info(`[AgendaIntelligence] Generated agenda with ${selectedItems.length} items, ${agenda.totalDuration} minutes`);

  return agenda;
};

/**
 * Apply founder overrides to existing agenda
 */
export const applyFounderOverrides = async (
  agendaId: string,
  overrides: {
    addItems?: AgendaItem[];
    removeItemIds?: string[];
    reorderItems?: string[]; // item IDs in new order
    notes?: string;
  }
): Promise<MeetingAgenda> => {
  // This would typically fetch from database
  // For now, we regenerate with overrides
  logger.info(`[AgendaIntelligence] Applying founder overrides to agenda ${agendaId}`);

  const agenda = await generateMeetingAgenda('MORNING', 60, overrides.addItems);

  if (overrides.removeItemIds) {
    agenda.items = agenda.items.filter((item) => !overrides.removeItemIds!.includes(item.id));
  }

  if (overrides.reorderItems) {
    const reordered: AgendaItem[] = [];
    for (const id of overrides.reorderItems) {
      const item = agenda.items.find((i) => i.id === id);
      if (item) reordered.push(item);
    }
    // Add any items not in reorder list at the end
    for (const item of agenda.items) {
      if (!overrides.reorderItems.includes(item.id)) {
        reordered.push(item);
      }
    }
    agenda.items = reordered;
  }

  if (overrides.notes) {
    agenda.founderNotes = overrides.notes;
  }

  agenda.approvedByFounder = true;

  return agenda;
};

export default {
  generateMeetingAgenda,
  applyFounderOverrides,
};
