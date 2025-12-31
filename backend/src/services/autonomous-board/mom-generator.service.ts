/**
 * MOM (Minutes of Meeting) Generator Service
 * خدمة توليد محاضر الاجتماعات
 *
 * Generates formatted meeting minutes:
 * - MOM-2025-001-AM (morning)
 * - MOM-2025-001-PM (afternoon)
 *
 * Includes:
 * - Situation summary with KPI flags
 * - Discussion log
 * - Decisions made
 * - Action items
 * - Innovation ideas
 * - Approval workflow
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

type MeetingType = 'MORNING' | 'AFTERNOON' | 'EMERGENCY';

interface Decision {
  id: string;
  type: 'TYPE_1_STRATEGIC' | 'TYPE_2_OPERATIONAL';
  title: string;
  titleAr?: string;
  rationale: string;
  owner: string;
  deadline: Date;
  votes?: { memberId: string; vote: string }[];
}

interface DiscussionEntry {
  speaker: string;
  role: string;
  content: string;
  timestamp: Date;
  phase: string;
}

/**
 * Generate MOM number
 */
const generateMOMNumber = async (meetingType: MeetingType): Promise<string> => {
  const today = new Date();
  const year = today.getFullYear();
  const suffix = meetingType === 'MORNING' ? 'AM' : 'PM';

  const count = await prisma.meetingMinutes.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });

  return `MOM-${year}-${String(count + 1).padStart(3, '0')}-${suffix}`;
};

/**
 * Generate situation summary from KPIs
 */
const generateSituationSummary = async (
  kpiHighlights: { code: string; status: string; flag: string }[]
): Promise<{ english: string; arabic: string }> => {
  try {
    const greenCount = kpiHighlights.filter((k) => k.status === 'GREEN').length;
    const yellowCount = kpiHighlights.filter((k) => k.status === 'YELLOW').length;
    const redCount = kpiHighlights.filter((k) => k.status === 'RED').length;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: `Generate a brief situation summary for a board meeting based on:
- 🟢 ${greenCount} KPIs on target
- 🟡 ${yellowCount} KPIs need attention
- 🔴 ${redCount} KPIs critical

Provide in both English and Arabic.
Format:
ENGLISH: [2 sentences]
ARABIC: [2 sentences]`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const parts = content.split('ARABIC:');
    const english = parts[0]?.replace('ENGLISH:', '').trim() || '';
    const arabic = parts[1]?.trim() || '';

    return { english, arabic };
  } catch (error) {
    logger.error('[MOMGenerator] AI summary error:', error);
    return {
      english: 'Review of current KPI performance and strategic priorities.',
      arabic: 'مراجعة أداء مؤشرات الأداء الرئيسية والأولويات الاستراتيجية.',
    };
  }
};

/**
 * Format discussion log for MOM
 */
const formatDiscussionLog = (entries: DiscussionEntry[]): object[] => {
  return entries.map((entry, index) => ({
    sequence: index + 1,
    speaker: entry.speaker,
    role: entry.role,
    content: entry.content,
    phase: entry.phase,
    time: entry.timestamp,
  }));
};

/**
 * Format decisions for MOM
 */
const formatDecisions = (decisions: Decision[]): object[] => {
  return decisions.map((decision, index) => ({
    id: `DEC-${String(index + 1).padStart(3, '0')}`,
    type: decision.type,
    title: decision.title,
    titleAr: decision.titleAr,
    rationale: decision.rationale,
    owner: decision.owner,
    deadline: decision.deadline,
    requiresApproval: decision.type === 'TYPE_1_STRATEGIC',
    autoExecuteAfter: decision.type === 'TYPE_2_OPERATIONAL' ? '4 hours' : null,
    votes: decision.votes || [],
  }));
};

/**
 * Format action items for MOM
 */
const formatActionItems = (
  items: { task: string; taskAr?: string; owner: string; deadline: Date; priority: string }[]
): object[] => {
  return items.map((item, index) => ({
    id: `ACT-${String(index + 1).padStart(3, '0')}`,
    task: item.task,
    taskAr: item.taskAr,
    owner: item.owner,
    deadline: item.deadline,
    priority: item.priority,
    status: 'PENDING',
  }));
};

/**
 * Calculate innovation score
 */
const calculateInnovationScore = (ideasCount: number, techniques: string[]): number => {
  let score = 0;

  // Base score from ideas count
  if (ideasCount >= 5) score += 5;
  else if (ideasCount >= 3) score += 3;
  else if (ideasCount >= 1) score += 1;

  // Bonus for using multiple techniques
  const uniqueTechniques = new Set(techniques);
  score += Math.min(uniqueTechniques.size, 3);

  // Quality bonus (assumed from AI-generated ideas)
  score += 2;

  return Math.min(score, 10); // Cap at 10
};

/**
 * Generate MOM for a completed meeting
 */
export const generateMOM = async (
  meetingId: string,
  meetingType: MeetingType,
  discussionLog: DiscussionEntry[],
  decisions: Decision[],
  actionItems: { task: string; taskAr?: string; owner: string; deadline: Date; priority: string }[],
  ideas: { title: string; description: string; technique: string; proposedBy: string }[],
  kpiHighlights: { code: string; status: string; flag: string }[]
) => {
  logger.info(`[MOMGenerator] Generating MOM for meeting ${meetingId}...`);

  // 1. Generate MOM number
  const momNumber = await generateMOMNumber(meetingType);
  logger.info(`[MOMGenerator] MOM Number: ${momNumber}`);

  // 2. Generate situation summary
  const summary = await generateSituationSummary(kpiHighlights);

  // 3. Calculate innovation score
  const techniques = ideas.map((i) => i.technique);
  const innovationScore = calculateInnovationScore(ideas.length, techniques);

  // 4. Calculate approval deadline (4 hours for Type 2 decisions)
  const hasType2 = decisions.some((d) => d.type === 'TYPE_2_OPERATIONAL');
  const approvalDeadline = hasType2 ? new Date(Date.now() + 4 * 60 * 60 * 1000) : null;

  // 5. Create MOM record
  const mom = await prisma.meetingMinutes.create({
    data: {
      momNumber,
      meetingType,
      meetingId,
      situationSummary: summary.english,
      situationSummaryAr: summary.arabic,
      kpiHighlights: kpiHighlights,
      signalsDiscussed: discussionLog
        .filter((e) => e.phase === 'SIGNALS')
        .map((e) => ({
          type: 'SIGNAL',
          speaker: e.speaker,
          content: e.content,
        })),
      discussionLog: formatDiscussionLog(discussionLog),
      decisions: formatDecisions(decisions),
      actionItemsSummary: formatActionItems(actionItems),
      innovationScore,
      ideasGenerated: ideas.length,
      approvalStatus: 'PENDING',
      approvalDeadline,
    },
  });

  // 6. Save innovation ideas
  for (const idea of ideas) {
    const ideaNumber = await generateIdeaNumber();
    await prisma.innovationIdea.create({
      data: {
        ideaNumber,
        title: idea.title,
        description: idea.description,
        sourceType: idea.technique,
        momId: mom.id,
        proposedById: idea.proposedBy,
        status: 'PROPOSED',
      },
    });
  }

  logger.info(`[MOMGenerator] MOM ${momNumber} generated with ${ideas.length} ideas`);

  return mom;
};

/**
 * Generate idea number
 */
const generateIdeaNumber = async (): Promise<string> => {
  const year = new Date().getFullYear();
  const count = await prisma.innovationIdea.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });
  return `IDEA-${year}-${String(count + 1).padStart(3, '0')}`;
};

/**
 * Get MOM summary for founder notification
 */
export const getMOMSummaryForNotification = async (momId: string) => {
  const mom = await prisma.meetingMinutes.findUnique({
    where: { id: momId },
    include: {
      meeting: true,
    },
  });

  if (!mom) return null;

  const decisions = (mom.decisions as Decision[]) || [];
  const type1Count = decisions.filter((d) => d.type === 'TYPE_1_STRATEGIC').length;
  const type2Count = decisions.filter((d) => d.type === 'TYPE_2_OPERATIONAL').length;

  return {
    momNumber: mom.momNumber,
    meetingTitle: mom.meeting?.title,
    summary: mom.situationSummary,
    decisionsCount: decisions.length,
    strategicDecisions: type1Count,
    operationalDecisions: type2Count,
    innovationScore: mom.innovationScore,
    ideasGenerated: mom.ideasGenerated,
    approvalDeadline: mom.approvalDeadline,
    hasUrgentDecisions: type1Count > 0,
    autoExecuteIn: type2Count > 0 ? '4 hours' : null,
  };
};

/**
 * Format MOM as markdown for display/export
 */
export const formatMOMAsMarkdown = async (momId: string): Promise<string> => {
  const mom = await prisma.meetingMinutes.findUnique({
    where: { id: momId },
    include: {
      meeting: true,
      ideas: true,
    },
  });

  if (!mom) return '';

  const decisions = (mom.decisions as object[]) || [];
  const actionItems = (mom.actionItemsSummary as object[]) || [];
  const kpiHighlights = (mom.kpiHighlights as { code: string; flag: string }[]) || [];

  let md = `# ${mom.momNumber} - ${mom.meeting?.title || 'Board Meeting'}\n\n`;
  md += `**Date:** ${mom.date.toISOString().split('T')[0]}\n`;
  md += `**Type:** ${mom.meetingType}\n`;
  md += `**Status:** ${mom.approvalStatus}\n\n`;

  md += `## 📊 Situation Summary\n\n${mom.situationSummary}\n\n`;

  md += `### KPI Highlights\n`;
  for (const kpi of kpiHighlights) {
    md += `- ${kpi.flag} ${kpi.code}\n`;
  }
  md += '\n';

  md += `## 📋 Decisions (${decisions.length})\n\n`;
  for (const dec of decisions as { id: string; type: string; title: string; owner: string }[]) {
    md += `### ${dec.id}: ${dec.title}\n`;
    md += `- **Type:** ${dec.type}\n`;
    md += `- **Owner:** ${dec.owner}\n\n`;
  }

  md += `## ✅ Action Items (${actionItems.length})\n\n`;
  for (const item of actionItems as { id: string; task: string; owner: string; priority: string }[]) {
    md += `- [ ] **${item.id}** ${item.task} (${item.owner}) [${item.priority}]\n`;
  }
  md += '\n';

  md += `## 💡 Innovation\n\n`;
  md += `- **Score:** ${mom.innovationScore}/10\n`;
  md += `- **Ideas Generated:** ${mom.ideasGenerated}\n\n`;

  for (const idea of mom.ideas) {
    md += `### ${idea.ideaNumber}: ${idea.title}\n`;
    md += `${idea.description}\n\n`;
  }

  return md;
};

export default {
  generateMOM,
  getMOMSummaryForNotification,
  formatMOMAsMarkdown,
};
