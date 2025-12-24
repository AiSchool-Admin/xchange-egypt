/**
 * Emergency Meeting Service
 * خدمة الاجتماعات الطارئة
 *
 * Handles founder-initiated emergency meetings:
 * - Immediate convening of board
 * - Live MOM generation
 * - Instant approval workflow
 * - Innovation mode always enabled
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';
import { BOARD_MEMBERS_CONFIG, BoardRole, getBoardMemberByRole } from '../../config/board/board-members.config';
import { generateMeetingAgenda, AgendaItem } from './agenda-intelligence.service';
import { generateMOM } from './mom-generator.service';

const anthropic = new Anthropic();

export enum EmergencyType {
  CRISIS = 'CRISIS', // Immediate - within minutes
  URGENT = 'URGENT', // Within 1 hour
  PRIORITY = 'PRIORITY', // Within 4 hours
}

export enum EmergencyStatus {
  REQUESTED = 'REQUESTED',
  CONVENING = 'CONVENING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export interface EmergencyMeetingRequest {
  requestedBy: string; // founder ID
  type: EmergencyType;
  topic: string;
  topicAr: string;
  context: string;
  requiredMembers?: BoardRole[];
  expectedDuration?: number; // minutes
  immediateAction?: string; // What action is needed
}

export interface EmergencyMeetingSession {
  id: string;
  type: EmergencyType;
  status: EmergencyStatus;
  topic: string;
  topicAr: string;
  requestedAt: Date;
  startedAt?: Date;
  endedAt?: Date;
  participants: BoardRole[];
  founderPresent: boolean;
  liveMOMEnabled: boolean;
  discussionLog: DiscussionEntry[];
  decisions: EmergencyDecision[];
  actionItems: EmergencyAction[];
  momId?: string;
}

export interface DiscussionEntry {
  timestamp: Date;
  speaker: BoardRole;
  speakerName: string;
  message: string;
  messageAr?: string;
  type: 'STATEMENT' | 'QUESTION' | 'PROPOSAL' | 'DECISION' | 'ACTION';
}

export interface EmergencyDecision {
  id: string;
  title: string;
  titleAr: string;
  decision: string;
  decisionAr: string;
  proposedBy: BoardRole;
  approvedBy: BoardRole[];
  requiresFounderApproval: boolean;
  founderApproved?: boolean;
  executionPriority: 'IMMEDIATE' | 'TODAY' | 'THIS_WEEK';
}

export interface EmergencyAction {
  id: string;
  action: string;
  actionAr: string;
  assignedTo: BoardRole;
  deadline: Date;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
}

// Active emergency sessions in memory (would be in Redis in production)
const activeSessions: Map<string, EmergencyMeetingSession> = new Map();

/**
 * Generate session ID
 */
const generateSessionId = (): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `EMERG-${date}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

/**
 * Request an emergency meeting
 */
export const requestEmergencyMeeting = async (
  request: EmergencyMeetingRequest
): Promise<EmergencyMeetingSession> => {
  logger.info(`[EmergencyMeeting] Emergency meeting requested: ${request.type} - ${request.topic}`);

  const sessionId = generateSessionId();
  const participants = request.requiredMembers || Object.values(BoardRole);

  const session: EmergencyMeetingSession = {
    id: sessionId,
    type: request.type,
    status: EmergencyStatus.REQUESTED,
    topic: request.topic,
    topicAr: request.topicAr,
    requestedAt: new Date(),
    participants,
    founderPresent: true, // Founder initiates
    liveMOMEnabled: true,
    discussionLog: [],
    decisions: [],
    actionItems: [],
  };

  // Store session
  activeSessions.set(sessionId, session);

  // Create database record
  await prisma.boardMeeting.create({
    data: {
      meetingNumber: `EMR-${Date.now()}`,
      title: `[EMERGENCY] ${request.topic}`,
      titleAr: `[طوارئ] ${request.topicAr}`,
      type: 'EMERGENCY',
      status: 'SCHEDULED',
      scheduledAt: new Date(),
      duration: request.expectedDuration || 30,
      agenda: {
        type: request.type,
        topic: request.topic,
        context: request.context,
        immediateAction: request.immediateAction,
      },
    },
  });

  // Auto-convene based on emergency type
  if (request.type === EmergencyType.CRISIS) {
    // Immediate convening
    await conveneEmergencyMeeting(sessionId);
  }

  logger.info(`[EmergencyMeeting] Session ${sessionId} created`);
  return session;
};

/**
 * Convene the emergency meeting - gather board members
 */
export const conveneEmergencyMeeting = async (sessionId: string): Promise<EmergencyMeetingSession> => {
  const session = activeSessions.get(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  session.status = EmergencyStatus.CONVENING;
  logger.info(`[EmergencyMeeting] Convening session ${sessionId}...`);

  // Simulate notification to all board members
  for (const role of session.participants) {
    const member = getBoardMemberByRole(role);
    if (member) {
      logger.info(`[EmergencyMeeting] Notifying ${member.name} (${role})`);
    }
  }

  // Start the meeting
  return startEmergencyMeeting(sessionId);
};

/**
 * Start the emergency meeting
 */
export const startEmergencyMeeting = async (sessionId: string): Promise<EmergencyMeetingSession> => {
  const session = activeSessions.get(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  session.status = EmergencyStatus.IN_PROGRESS;
  session.startedAt = new Date();

  // CEO opens the meeting
  const ceo = getBoardMemberByRole(BoardRole.CEO);
  if (ceo) {
    session.discussionLog.push({
      timestamp: new Date(),
      speaker: BoardRole.CEO,
      speakerName: ceo.name,
      message: `Emergency meeting convened. Topic: ${session.topic}. This is a ${session.type} level situation requiring immediate attention.`,
      messageAr: `تم عقد اجتماع طوارئ. الموضوع: ${session.topicAr}. هذا موقف بمستوى ${session.type} يتطلب اهتمامًا فوريًا.`,
      type: 'STATEMENT',
    });
  }

  logger.info(`[EmergencyMeeting] Session ${sessionId} started`);
  return session;
};

/**
 * Get AI response from a board member in emergency context
 */
const getEmergencyMemberResponse = async (
  session: EmergencyMeetingSession,
  role: BoardRole,
  prompt: string
): Promise<string> => {
  const member = getBoardMemberByRole(role);
  if (!member) return '';

  try {
    const recentDiscussion = session.discussionLog
      .slice(-10)
      .map((d) => `${d.speakerName}: ${d.message}`)
      .join('\n');

    const message = await anthropic.messages.create({
      model: member.model,
      max_tokens: 500,
      system: `${member.systemPromptBase}

EMERGENCY CONTEXT:
- This is an EMERGENCY meeting of type: ${session.type}
- Topic: ${session.topic}
- Time is critical - be concise and action-oriented
- Focus on immediate solutions and risk mitigation
- Innovation mode is ENABLED - think creatively under pressure

Recent discussion:
${recentDiscussion}`,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    return message.content[0].type === 'text' ? message.content[0].text : '';
  } catch (error) {
    logger.error(`[EmergencyMeeting] Error getting response from ${role}:`, error);
    return `[${member.name} is analyzing the situation...]`;
  }
};

/**
 * Conduct emergency discussion round
 */
export const conductEmergencyDiscussion = async (
  sessionId: string,
  founderInput?: string
): Promise<DiscussionEntry[]> => {
  const session = activeSessions.get(sessionId);
  if (!session || session.status !== EmergencyStatus.IN_PROGRESS) {
    throw new Error(`Session ${sessionId} not active`);
  }

  const newEntries: DiscussionEntry[] = [];

  // Add founder input if provided
  if (founderInput) {
    newEntries.push({
      timestamp: new Date(),
      speaker: BoardRole.CEO, // Founder speaks through CEO position
      speakerName: 'Founder',
      message: founderInput,
      type: 'STATEMENT',
    });
    session.discussionLog.push(newEntries[newEntries.length - 1]);
  }

  // Get responses from key members based on emergency type
  const respondingMembers = getRespondingMembers(session.type, session.topic);

  for (const role of respondingMembers) {
    const prompt = `Given the emergency situation "${session.topic}", provide your immediate assessment and recommended action. Be concise and decisive.`;
    const response = await getEmergencyMemberResponse(session, role, prompt);

    if (response) {
      const member = getBoardMemberByRole(role);
      const entry: DiscussionEntry = {
        timestamp: new Date(),
        speaker: role,
        speakerName: member?.name || role,
        message: response,
        type: detectEntryType(response),
      };
      newEntries.push(entry);
      session.discussionLog.push(entry);
    }
  }

  // CEO synthesizes and proposes decision
  const ceoSynthesis = await getEmergencyMemberResponse(
    session,
    BoardRole.CEO,
    'Synthesize the team input and propose a clear decision and immediate action plan.'
  );

  if (ceoSynthesis) {
    const ceo = getBoardMemberByRole(BoardRole.CEO);
    newEntries.push({
      timestamp: new Date(),
      speaker: BoardRole.CEO,
      speakerName: ceo?.name || 'CEO',
      message: ceoSynthesis,
      type: 'PROPOSAL',
    });
    session.discussionLog.push(newEntries[newEntries.length - 1]);
  }

  return newEntries;
};

/**
 * Determine which members should respond based on emergency type and topic
 */
const getRespondingMembers = (type: EmergencyType, topic: string): BoardRole[] => {
  const topicLower = topic.toLowerCase();

  // Always include CEO
  const members: BoardRole[] = [BoardRole.CEO];

  // Add relevant members based on topic
  if (topicLower.includes('technical') || topicLower.includes('system') || topicLower.includes('bug')) {
    members.push(BoardRole.CTO);
  }
  if (topicLower.includes('financial') || topicLower.includes('money') || topicLower.includes('payment')) {
    members.push(BoardRole.CFO);
  }
  if (topicLower.includes('legal') || topicLower.includes('compliance') || topicLower.includes('regulation')) {
    members.push(BoardRole.CLO);
  }
  if (topicLower.includes('user') || topicLower.includes('customer') || topicLower.includes('pr')) {
    members.push(BoardRole.CMO);
  }
  if (topicLower.includes('operation') || topicLower.includes('process') || topicLower.includes('logistics')) {
    members.push(BoardRole.COO);
  }

  // For CRISIS, include all members
  if (type === EmergencyType.CRISIS) {
    return Object.values(BoardRole);
  }

  // Ensure at least 3 members
  if (members.length < 3) {
    const remaining = Object.values(BoardRole).filter((r) => !members.includes(r));
    members.push(...remaining.slice(0, 3 - members.length));
  }

  return [...new Set(members)];
};

/**
 * Detect the type of discussion entry
 */
const detectEntryType = (message: string): DiscussionEntry['type'] => {
  const lower = message.toLowerCase();
  if (lower.includes('i propose') || lower.includes('we should') || lower.includes('recommend')) {
    return 'PROPOSAL';
  }
  if (lower.includes('?') && lower.length < 200) {
    return 'QUESTION';
  }
  if (lower.includes('decision:') || lower.includes('decided') || lower.includes('approved')) {
    return 'DECISION';
  }
  if (lower.includes('action:') || lower.includes('action item') || lower.includes('will do')) {
    return 'ACTION';
  }
  return 'STATEMENT';
};

/**
 * Make an emergency decision
 */
export const makeEmergencyDecision = async (
  sessionId: string,
  decision: Omit<EmergencyDecision, 'id'>
): Promise<EmergencyDecision> => {
  const session = activeSessions.get(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const emergencyDecision: EmergencyDecision = {
    id: `EDEC-${Date.now()}`,
    ...decision,
  };

  session.decisions.push(emergencyDecision);

  // Log the decision
  session.discussionLog.push({
    timestamp: new Date(),
    speaker: decision.proposedBy,
    speakerName: getBoardMemberByRole(decision.proposedBy)?.name || decision.proposedBy,
    message: `DECISION: ${decision.title} - ${decision.decision}`,
    type: 'DECISION',
  });

  logger.info(`[EmergencyMeeting] Decision made: ${decision.title}`);
  return emergencyDecision;
};

/**
 * Create emergency action item
 */
export const createEmergencyAction = async (
  sessionId: string,
  action: Omit<EmergencyAction, 'id' | 'status'>
): Promise<EmergencyAction> => {
  const session = activeSessions.get(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  const emergencyAction: EmergencyAction = {
    id: `EACT-${Date.now()}`,
    status: 'PENDING',
    ...action,
  };

  session.actionItems.push(emergencyAction);

  // Log the action item
  session.discussionLog.push({
    timestamp: new Date(),
    speaker: action.assignedTo,
    speakerName: getBoardMemberByRole(action.assignedTo)?.name || action.assignedTo,
    message: `ACTION ITEM: ${action.action} - Due: ${action.deadline.toLocaleString()} - Priority: ${action.priority}`,
    type: 'ACTION',
  });

  // Create in database
  await prisma.actionItem.create({
    data: {
      itemNumber: `EACT-${Date.now()}`,
      title: action.action,
      titleAr: action.actionAr,
      status: 'PENDING',
      priority: action.priority,
      dueDate: action.deadline,
    },
  });

  logger.info(`[EmergencyMeeting] Action created: ${action.action}`);
  return emergencyAction;
};

/**
 * End emergency meeting and generate MOM
 */
export const endEmergencyMeeting = async (sessionId: string): Promise<EmergencyMeetingSession> => {
  const session = activeSessions.get(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  session.status = EmergencyStatus.COMPLETED;
  session.endedAt = new Date();

  // Generate MOM
  try {
    const meeting = await prisma.boardMeeting.findFirst({
      where: { title: { contains: session.topic } },
      orderBy: { createdAt: 'desc' },
    });

    if (meeting) {
      // Update meeting status
      await prisma.boardMeeting.update({
        where: { id: meeting.id },
        data: {
          status: 'COMPLETED',
          startedAt: session.startedAt,
          endedAt: session.endedAt,
          summary: JSON.stringify(session.discussionLog),
        },
      });

      // Generate MOM with session data - map to expected interface
      const discussionEntries = session.discussionLog.map((d) => ({
        speaker: d.speakerName,
        role: d.speaker,
        content: d.message,
        timestamp: d.timestamp,
        phase: d.type,
      }));

      const decisionEntries = session.decisions.map((d) => ({
        id: d.id,
        title: d.title,
        titleAr: d.titleAr,
        type: d.executionPriority === 'IMMEDIATE' ? 'TYPE_1_STRATEGIC' as const : 'TYPE_2_OPERATIONAL' as const,
        rationale: d.decision,
        owner: d.proposedBy,
        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
      }));

      const actionEntries = session.actionItems.map((a) => ({
        task: a.action,
        taskAr: a.actionAr,
        owner: a.assignedTo,
        deadline: a.deadline,
        priority: a.priority,
      }));

      const mom = await generateMOM(
        meeting.id,
        'EMERGENCY',
        discussionEntries,
        decisionEntries,
        actionEntries,
        [], // No innovation ideas in emergency meetings
        [] // KPI highlights from intelligence
      );
      session.momId = mom.id;
    }
  } catch (error) {
    logger.error('[EmergencyMeeting] Error generating MOM:', error);
  }

  // Cleanup active session after some time
  setTimeout(() => {
    activeSessions.delete(sessionId);
  }, 3600000); // Keep in memory for 1 hour

  logger.info(`[EmergencyMeeting] Session ${sessionId} ended`);
  return session;
};

/**
 * Get live session status
 */
export const getSessionStatus = (sessionId: string): EmergencyMeetingSession | undefined => {
  return activeSessions.get(sessionId);
};

/**
 * Get all active emergency sessions
 */
export const getActiveSessions = (): EmergencyMeetingSession[] => {
  return Array.from(activeSessions.values()).filter(
    (s) => s.status === EmergencyStatus.IN_PROGRESS || s.status === EmergencyStatus.CONVENING
  );
};

/**
 * Cancel emergency meeting
 */
export const cancelEmergencyMeeting = async (
  sessionId: string,
  reason: string
): Promise<EmergencyMeetingSession> => {
  const session = activeSessions.get(sessionId);
  if (!session) {
    throw new Error(`Session ${sessionId} not found`);
  }

  session.status = EmergencyStatus.CANCELLED;
  session.endedAt = new Date();

  session.discussionLog.push({
    timestamp: new Date(),
    speaker: BoardRole.CEO,
    speakerName: 'System',
    message: `Meeting cancelled: ${reason}`,
    type: 'STATEMENT',
  });

  logger.info(`[EmergencyMeeting] Session ${sessionId} cancelled: ${reason}`);
  return session;
};

export default {
  requestEmergencyMeeting,
  conveneEmergencyMeeting,
  startEmergencyMeeting,
  conductEmergencyDiscussion,
  makeEmergencyDecision,
  createEmergencyAction,
  endEmergencyMeeting,
  getSessionStatus,
  getActiveSessions,
  cancelEmergencyMeeting,
};
