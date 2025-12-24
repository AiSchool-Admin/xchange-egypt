/**
 * Autonomous Meeting Service
 * خدمة الاجتماعات الذاتية
 *
 * Conducts AI board meetings:
 * - Morning Strategic Meeting (10:00 AM, 45 min)
 * - Afternoon Operational Meeting (2:00 PM, 30 min)
 *
 * Meeting Flow:
 * 1. Opening - CEO reviews intelligence
 * 2. Situation - KPI discussion
 * 3. Signals - Opportunities/Threats
 * 4. Decisions - SPADE framework
 * 5. Innovation - Brainstorming
 * 6. Closing - Action items
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

type MeetingType = 'MORNING' | 'AFTERNOON';
type MeetingPhase = 'OPENING' | 'SITUATION' | 'SIGNALS' | 'DECISIONS' | 'INNOVATION' | 'CLOSING';

interface DiscussionEntry {
  speaker: string;
  role: string;
  content: string;
  contentAr?: string;
  timestamp: Date;
  phase: MeetingPhase;
}

interface Decision {
  id: string;
  type: 'TYPE_1_STRATEGIC' | 'TYPE_2_OPERATIONAL';
  title: string;
  titleAr: string;
  rationale: string;
  owner: string;
  deadline: Date;
  votes: { memberId: string; vote: 'FOR' | 'AGAINST' | 'ABSTAIN' }[];
}

interface ActionItem {
  task: string;
  taskAr: string;
  owner: string;
  deadline: Date;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface InnovationIdea {
  title: string;
  description: string;
  technique: string;
  proposedBy: string;
}

// Board member system prompts for different perspectives
const MEMBER_PERSPECTIVES: Record<string, string> = {
  CEO: `You are Karim (كريم), CEO of Xchange Egypt. You lead the meeting, synthesize perspectives, and drive towards decisions. Focus on strategic alignment and company vision. Be decisive but inclusive.`,

  CFO: `You are Nadia (نادية), CFO of Xchange Egypt. Analyze financial implications of every decision. Question costs, ROI, and resource allocation. Be conservative with spending but open to investments with clear returns.`,

  COO: `You are Hassan (حسن), COO of Xchange Egypt. Focus on operational feasibility and execution. How will decisions affect daily operations? What resources are needed? Identify bottlenecks and propose solutions.`,

  CTO: `You are Layla (ليلى), CTO of Xchange Egypt. Evaluate technical feasibility and innovation opportunities. Consider scalability, security, and tech debt. Propose technical solutions but be realistic about timelines.`,

  CMO: `You are Omar (عمر), CMO of Xchange Egypt. Think about customer impact and market positioning. How do decisions affect user experience and brand? Advocate for the customer's voice.`,

  CLO: `You are Fatima (فاطمة), Chief Legal Officer of Xchange Egypt. Identify regulatory risks and compliance issues. Ensure decisions align with Egyptian law and protect the company legally.`,
};

// Innovation techniques
const INNOVATION_TECHNIQUES = [
  {
    name: '10X_THINKING',
    prompt: 'What if we had to grow this metric by 10X? What radical changes would be needed?',
  },
  {
    name: 'CROSS_POLLINATION',
    prompt: 'What successful strategy from another industry (fintech, logistics, social media) could we adapt?',
  },
  {
    name: 'CUSTOMER_OBSESSION',
    prompt: 'What is the #1 customer complaint and how can we turn it into our biggest strength?',
  },
  {
    name: 'COMPETITOR_PARANOIA',
    prompt: 'If OLX or Facebook Marketplace launched a killer feature tomorrow, what would it be and how should we preempt it?',
  },
  {
    name: 'INVERSION',
    prompt: 'What would guarantee our failure? Now how do we ensure the opposite?',
  },
];

/**
 * Generate meeting number
 */
const generateMeetingNumber = async (type: MeetingType): Promise<string> => {
  const today = new Date();
  const year = today.getFullYear();
  const prefix = type === 'MORNING' ? 'STR' : 'OPS'; // Strategic or Operational

  const count = await prisma.boardMeeting.count({
    where: {
      type: type === 'MORNING' ? 'WEEKLY' : 'STANDUP',
      scheduledAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });

  return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
};

/**
 * Generate session number
 */
const generateSessionNumber = async (meetingType: MeetingType): Promise<string> => {
  const today = new Date();
  const year = today.getFullYear();
  const suffix = meetingType === 'MORNING' ? 'AM' : 'PM';

  const count = await prisma.autonomousMeetingSession.count({
    where: {
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });

  return `SES-${year}-${String(count + 1).padStart(3, '0')}-${suffix}`;
};

/**
 * Get AI response from a board member
 */
const getMemberResponse = async (
  memberId: string,
  role: string,
  context: string,
  question: string
): Promise<string> => {
  try {
    const systemPrompt = MEMBER_PERSPECTIVES[role] || MEMBER_PERSPECTIVES.CEO;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 300,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `Context: ${context}\n\nQuestion: ${question}\n\nProvide a brief, actionable response (2-3 sentences).`,
        },
      ],
    });

    return message.content[0].type === 'text' ? message.content[0].text : '';
  } catch (error) {
    logger.error(`[AutonomousMeeting] AI error for ${role}:`, error);
    return `[${role}]: Unable to provide input at this time.`;
  }
};

/**
 * Run the opening phase
 */
const runOpeningPhase = async (
  meetingId: string,
  intelligence: {
    executiveSummary?: string | null;
    kpiSnapshot?: object;
    anomalies?: object;
  } | null
): Promise<DiscussionEntry[]> => {
  const entries: DiscussionEntry[] = [];

  // CEO opens the meeting
  entries.push({
    speaker: 'Karim',
    role: 'CEO',
    content: `Good morning, board members. Let me brief you on today's intelligence. ${intelligence?.executiveSummary || 'Today we have important matters to discuss.'}`,
    timestamp: new Date(),
    phase: 'OPENING',
  });

  return entries;
};

/**
 * Run the situation review phase
 */
const runSituationPhase = async (
  meetingId: string,
  kpiSnapshot: object[]
): Promise<DiscussionEntry[]> => {
  const entries: DiscussionEntry[] = [];
  const redKPIs = Array.isArray(kpiSnapshot) ? kpiSnapshot.filter((k: { status?: string }) => k.status === 'RED') : [];

  // CFO reviews financial KPIs
  const cfoResponse = await getMemberResponse(
    'cfo',
    'CFO',
    `Current KPIs: ${JSON.stringify(kpiSnapshot.slice(0, 5))}`,
    'What are your concerns about the financial KPIs?'
  );

  entries.push({
    speaker: 'Nadia',
    role: 'CFO',
    content: cfoResponse,
    timestamp: new Date(),
    phase: 'SITUATION',
  });

  // COO reviews operational KPIs
  if (redKPIs.length > 0) {
    const cooResponse = await getMemberResponse(
      'coo',
      'COO',
      `Red KPIs: ${JSON.stringify(redKPIs)}`,
      'What operational changes do we need to address these red KPIs?'
    );

    entries.push({
      speaker: 'Hassan',
      role: 'COO',
      content: cooResponse,
      timestamp: new Date(),
      phase: 'SITUATION',
    });
  }

  return entries;
};

/**
 * Run the signals discussion phase
 */
const runSignalsPhase = async (
  opportunities: object[],
  threats: object[]
): Promise<DiscussionEntry[]> => {
  const entries: DiscussionEntry[] = [];

  // CMO discusses opportunities
  if (Array.isArray(opportunities) && opportunities.length > 0) {
    const cmoResponse = await getMemberResponse(
      'cmo',
      'CMO',
      `Opportunities: ${JSON.stringify(opportunities)}`,
      'Which opportunity should we prioritize and why?'
    );

    entries.push({
      speaker: 'Omar',
      role: 'CMO',
      content: cmoResponse,
      timestamp: new Date(),
      phase: 'SIGNALS',
    });
  }

  // CTO discusses threats
  if (Array.isArray(threats) && threats.length > 0) {
    const ctoResponse = await getMemberResponse(
      'cto',
      'CTO',
      `Threats: ${JSON.stringify(threats)}`,
      'What technical solutions can address these threats?'
    );

    entries.push({
      speaker: 'Layla',
      role: 'CTO',
      content: ctoResponse,
      timestamp: new Date(),
      phase: 'SIGNALS',
    });
  }

  return entries;
};

/**
 * Run the innovation phase
 */
const runInnovationPhase = async (
  members: { id: string; role: string; name: string }[]
): Promise<{ entries: DiscussionEntry[]; ideas: InnovationIdea[] }> => {
  const entries: DiscussionEntry[] = [];
  const ideas: InnovationIdea[] = [];

  // Pick a random technique
  const technique = INNOVATION_TECHNIQUES[Math.floor(Math.random() * INNOVATION_TECHNIQUES.length)];

  // CEO introduces the technique
  entries.push({
    speaker: 'Karim',
    role: 'CEO',
    content: `Let's do some innovation brainstorming. Using ${technique.name}: ${technique.prompt}`,
    timestamp: new Date(),
    phase: 'INNOVATION',
  });

  // Get ideas from 2-3 random members
  const respondingMembers = members.slice(0, 3);
  for (const member of respondingMembers) {
    const response = await getMemberResponse(
      member.id,
      member.role,
      `Innovation technique: ${technique.name}`,
      technique.prompt
    );

    entries.push({
      speaker: member.name,
      role: member.role,
      content: response,
      timestamp: new Date(),
      phase: 'INNOVATION',
    });

    ideas.push({
      title: `Idea from ${member.name}`,
      description: response,
      technique: technique.name,
      proposedBy: member.id,
    });
  }

  return { entries, ideas };
};

/**
 * Run the closing phase
 */
const runClosingPhase = async (
  decisions: Decision[],
  actionItems: ActionItem[]
): Promise<DiscussionEntry[]> => {
  const entries: DiscussionEntry[] = [];

  // CEO closes the meeting
  entries.push({
    speaker: 'Karim',
    role: 'CEO',
    content: `To summarize: We've made ${decisions.length} decisions and assigned ${actionItems.length} action items. Let's execute with excellence. Meeting adjourned.`,
    timestamp: new Date(),
    phase: 'CLOSING',
  });

  return entries;
};

/**
 * Main function to run an autonomous meeting
 */
export const runAutonomousMeeting = async (type: MeetingType) => {
  logger.info(`[AutonomousMeeting] Starting ${type} meeting...`);

  // 1. Get today's intelligence
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const intelligence = await prisma.morningIntelligence.findFirst({
    where: {
      date: {
        gte: today,
        lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  // 2. Get board members
  const members = await prisma.boardMember.findMany({
    where: { status: 'ACTIVE', type: 'AI' },
    select: { id: true, name: true, role: true },
  });

  // 3. Create meeting record
  const meetingNumber = await generateMeetingNumber(type);
  const duration = type === 'MORNING' ? 45 : 30;

  const meeting = await prisma.boardMeeting.create({
    data: {
      meetingNumber,
      type: type === 'MORNING' ? 'WEEKLY' : 'STANDUP',
      status: 'IN_PROGRESS',
      title: type === 'MORNING' ? 'Strategic Morning Meeting' : 'Operational Afternoon Meeting',
      titleAr: type === 'MORNING' ? 'الاجتماع الاستراتيجي الصباحي' : 'الاجتماع التشغيلي المسائي',
      scheduledAt: new Date(),
      startedAt: new Date(),
      duration,
    },
  });

  // 4. Create session record
  const sessionNumber = await generateSessionNumber(type);
  const session = await prisma.autonomousMeetingSession.create({
    data: {
      sessionNumber,
      meetingId: meeting.id,
      participants: members.map((m) => ({
        memberId: m.id,
        role: m.role,
        joinedAt: new Date(),
      })),
      status: 'IN_PROGRESS',
      currentPhase: 'OPENING',
    },
  });

  // 5. Run meeting phases
  const discussionLog: DiscussionEntry[] = [];
  const phaseHistory: { phase: string; startedAt: Date; endedAt?: Date }[] = [];
  let allIdeas: InnovationIdea[] = [];

  const kpiSnapshot = (intelligence?.kpiSnapshot as object[]) || [];
  const opportunities = (intelligence?.opportunities as object[]) || [];
  const threats = (intelligence?.threats as object[]) || [];

  // Opening
  phaseHistory.push({ phase: 'OPENING', startedAt: new Date() });
  const openingEntries = await runOpeningPhase(meeting.id, intelligence);
  discussionLog.push(...openingEntries);
  phaseHistory[phaseHistory.length - 1].endedAt = new Date();

  // Situation
  phaseHistory.push({ phase: 'SITUATION', startedAt: new Date() });
  const situationEntries = await runSituationPhase(meeting.id, kpiSnapshot);
  discussionLog.push(...situationEntries);
  phaseHistory[phaseHistory.length - 1].endedAt = new Date();

  // Signals
  phaseHistory.push({ phase: 'SIGNALS', startedAt: new Date() });
  const signalEntries = await runSignalsPhase(opportunities, threats);
  discussionLog.push(...signalEntries);
  phaseHistory[phaseHistory.length - 1].endedAt = new Date();

  // Innovation (only for morning meetings)
  if (type === 'MORNING') {
    phaseHistory.push({ phase: 'INNOVATION', startedAt: new Date() });
    const { entries: innovationEntries, ideas } = await runInnovationPhase(
      members.map((m) => ({ id: m.id, role: m.role, name: m.name }))
    );
    discussionLog.push(...innovationEntries);
    allIdeas = ideas;
    phaseHistory[phaseHistory.length - 1].endedAt = new Date();
  }

  // Closing
  phaseHistory.push({ phase: 'CLOSING', startedAt: new Date() });
  const closingEntries = await runClosingPhase([], []);
  discussionLog.push(...closingEntries);
  phaseHistory[phaseHistory.length - 1].endedAt = new Date();

  // 6. Update session and meeting
  await prisma.autonomousMeetingSession.update({
    where: { id: session.id },
    data: {
      status: 'COMPLETED',
      endedAt: new Date(),
      currentPhase: 'CLOSING',
      phaseHistory: phaseHistory,
      messageCount: discussionLog.length,
    },
  });

  await prisma.boardMeeting.update({
    where: { id: meeting.id },
    data: {
      status: 'COMPLETED',
      endedAt: new Date(),
    },
  });

  // 7. Link intelligence to meeting
  if (intelligence) {
    await prisma.morningIntelligence.update({
      where: { id: intelligence.id },
      data: { meetingId: meeting.id },
    });
  }

  logger.info(`[AutonomousMeeting] ${type} meeting completed: ${meetingNumber}`);

  return {
    meeting,
    session,
    discussionLog,
    ideas: allIdeas,
  };
};

export default {
  runAutonomousMeeting,
};
