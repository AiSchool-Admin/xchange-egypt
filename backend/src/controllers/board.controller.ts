/**
 * Board Controller
 * وحدة التحكم في مجلس إدارة AI
 *
 * ⚠️ جميع المسارات متاحة للمؤسس فقط
 */

import { Request, Response } from 'express';
import { boardEngineService } from '../services/board/board-engine.service';
import { meetingSchedulerService } from '../services/board/meeting-scheduler.service';
import { kpiTrackerService } from '../services/board/kpi-tracker.service';
import { alertEngineService } from '../services/board/alert-engine.service';
import { decisionFrameworkService } from '../services/board/decision-framework.service';
import { claudeService } from '../services/claude/claude.service';
import prisma from '../config/database';
import { AppError } from '../utils/errors';
import logger from '../lib/logger';
import { BoardConversationType, CEOMode } from '../services/board/board.types';

/**
 * Get all board members
 */
export const getBoardMembers = async (req: Request, res: Response) => {
  try {
    const members = await boardEngineService.getBoardMembers();

    res.json({
      success: true,
      data: members,
    });
  } catch (error: any) {
    logger.error('[BoardController] getBoardMembers error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Initialize board members (admin only)
 */
export const initializeBoardMembers = async (req: Request, res: Response) => {
  try {
    await boardEngineService.initializeBoardMembers();

    const members = await boardEngineService.getBoardMembers();

    res.json({
      success: true,
      message: 'Board members initialized successfully',
      data: members,
    });
  } catch (error: any) {
    logger.error('[BoardController] initializeBoardMembers error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Start a new conversation - بدء محادثة جديدة
 */
export const startConversation = async (req: Request, res: Response) => {
  try {
    const founderId = req.founder!.id;
    const { topic, topicAr, type, features } = req.body;

    if (!topic) {
      throw new AppError(400, 'الموضوع مطلوب');
    }

    const conversation = await boardEngineService.startConversation({
      founderId,
      topic,
      topicAr,
      type: type as BoardConversationType,
      features,
    });

    res.status(201).json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    logger.error('[BoardController] startConversation error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Send message to board - إرسال رسالة للمجلس
 * يدعم وضع العصف الذهني التفاعلي
 */
export const sendMessage = async (req: Request, res: Response) => {
  try {
    const founderId = req.founder!.id;
    const { conversationId } = req.params;
    const {
      content,
      targetMemberIds,
      ceoMode,
      features,
      enableBrainstorm,
      brainstormRounds,
    } = req.body;

    if (!content) {
      throw new AppError(400, 'محتوى الرسالة مطلوب');
    }

    const result = await boardEngineService.sendMessage({
      conversationId,
      founderId,
      content,
      targetMemberIds,
      ceoMode: ceoMode as CEOMode,
      features,
      enableBrainstorm: enableBrainstorm || false,
      brainstormRounds: brainstormRounds || 2,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('[BoardController] sendMessage error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Continue discussion - استمرار النقاش بين الأعضاء
 * يسمح للأعضاء بالتفاعل مع بعضهم البعض
 */
export const continueDiscussion = async (req: Request, res: Response) => {
  try {
    const founderId = req.founder!.id;
    const { conversationId } = req.params;
    const { prompt, rounds } = req.body;

    const result = await boardEngineService.continueDiscussion({
      conversationId,
      founderId,
      prompt,
      rounds: rounds || 1,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('[BoardController] continueDiscussion error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Conduct structured sequential discussion - نقاش منظم متتابع
 * كل عضو يرد بناءً على أهمية تخصصه للموضوع
 */
export const conductStructuredDiscussion = async (req: Request, res: Response) => {
  try {
    const founderId = req.founder!.id;
    const { conversationId } = req.params;
    const { content, maxResponders } = req.body;

    if (!content) {
      throw new AppError(400, 'محتوى الرسالة مطلوب');
    }

    const result = await boardEngineService.conductStructuredDiscussion({
      conversationId,
      founderId,
      content,
      maxResponders,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('[BoardController] conductStructuredDiscussion error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Generate CEO summary with alternatives - ملخص الرئيس التنفيذي مع البدائل
 */
export const generateCEOSummary = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const summary = await boardEngineService.generateCEOSummary(conversationId);

    res.json({
      success: true,
      data: summary,
    });
  } catch (error: any) {
    logger.error('[BoardController] generateCEOSummary error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Record founder decision - تسجيل قرار المؤسس
 */
export const recordFounderDecision = async (req: Request, res: Response) => {
  try {
    const founderId = req.founder!.id;
    const { conversationId } = req.params;
    const { decision, selectedAlternative, notes } = req.body;

    if (!decision) {
      throw new AppError(400, 'القرار مطلوب');
    }

    const result = await boardEngineService.recordFounderDecision({
      conversationId,
      founderId,
      decision,
      selectedAlternative,
      notes,
    });

    res.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    logger.error('[BoardController] recordFounderDecision error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get conversation details
 */
export const getConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversation = await boardEngineService.getConversation(conversationId);

    if (!conversation) {
      throw new AppError(404, 'Conversation not found');
    }

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    logger.error('[BoardController] getConversation error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get founder's conversations - محادثات المؤسس
 */
export const getFounderConversations = async (req: Request, res: Response) => {
  try {
    const founderId = req.founder!.id;

    const conversations = await boardEngineService.getFounderConversations(founderId);

    res.json({
      success: true,
      data: conversations,
    });
  } catch (error: any) {
    logger.error('[BoardController] getFounderConversations error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * End conversation and get summary
 */
export const endConversation = async (req: Request, res: Response) => {
  try {
    const { conversationId } = req.params;

    const conversation = await boardEngineService.endConversation(conversationId);

    res.json({
      success: true,
      data: conversation,
    });
  } catch (error: any) {
    logger.error('[BoardController] endConversation error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get Claude service status
 */
export const getServiceStatus = async (req: Request, res: Response) => {
  try {
    const claudeStats = claudeService.getStats();

    res.json({
      success: true,
      data: {
        claude: claudeStats,
        board: {
          initialized: true,
        },
      },
    });
  } catch (error: any) {
    logger.error('[BoardController] getServiceStatus error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Quick question to a specific member - سؤال سريع لعضو محدد
 */
export const askMember = async (req: Request, res: Response) => {
  try {
    const founderId = req.founder!.id;
    const { memberId } = req.params;
    const { question, ceoMode } = req.body;

    if (!question) {
      throw new AppError(400, 'السؤال مطلوب');
    }

    // Start a quick conversation
    const conversation = await boardEngineService.startConversation({
      founderId,
      topic: question.substring(0, 100),
      type: 'QUESTION' as BoardConversationType,
    });

    // Send message targeting specific member
    const result = await boardEngineService.sendMessage({
      conversationId: conversation.id,
      founderId,
      content: question,
      targetMemberIds: [memberId],
      ceoMode: ceoMode as CEOMode,
    });

    res.json({
      success: true,
      data: {
        conversationId: conversation.id,
        response: result.responses[0],
      },
    });
  } catch (error: any) {
    logger.error('[BoardController] askMember error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Get pending tasks for approval
 */
export const getPendingTasks = async (req: Request, res: Response) => {
  try {
    const tasks = await prisma.boardTask.findMany({
      where: {
        status: 'AWAITING_APPROVAL',
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, nameAr: true, role: true },
        },
        createdBy: {
          select: { id: true, name: true, nameAr: true, role: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: tasks,
    });
  } catch (error: any) {
    logger.error('[BoardController] getPendingTasks error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

/**
 * Approve or reject a task - الموافقة أو رفض مهمة
 */
export const reviewTask = async (req: Request, res: Response) => {
  try {
    const founderId = req.founder!.id;
    const { taskId } = req.params;
    const { decision, reason } = req.body;

    if (!decision || !['APPROVED', 'REJECTED'].includes(decision)) {
      throw new AppError(400, 'قرار صالح (APPROVED أو REJECTED) مطلوب');
    }

    const task = await prisma.boardTask.update({
      where: { id: taskId },
      data: {
        status: decision === 'APPROVED' ? 'APPROVED' : 'REJECTED',
        approvalStatus: decision,
        approvedById: founderId,
        approvedAt: new Date(),
        rejectionReason: decision === 'REJECTED' ? reason : null,
      },
      include: {
        assignedTo: true,
        createdBy: true,
      },
    });

    res.json({
      success: true,
      data: task,
    });
  } catch (error: any) {
    logger.error('[BoardController] reviewTask error:', error);
    res.status(error.statusCode || 500).json({
      success: false,
      error: error.message,
    });
  }
};

// ============================================
// GOVERNANCE CONTROLLERS - الحوكمة
// ============================================

// --- Meetings - الاجتماعات ---

export const getMeetings = async (req: Request, res: Response) => {
  try {
    const meetings = await prisma.boardMeeting.findMany({
      include: {
        attendees: { include: { member: true } },
      },
      orderBy: { scheduledAt: 'desc' },
      take: 20,
    });

    res.json({ success: true, data: meetings });
  } catch (error: any) {
    logger.error('[BoardController] getMeetings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getUpcomingMeetings = async (req: Request, res: Response) => {
  try {
    const meetings = await meetingSchedulerService.getUpcomingMeetings(10);
    res.json({ success: true, data: meetings });
  } catch (error: any) {
    logger.error('[BoardController] getUpcomingMeetings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const scheduleMeeting = async (req: Request, res: Response) => {
  try {
    const { type, title, titleAr, description, descriptionAr, scheduledAt, attendeeIds } = req.body;

    const meeting = await meetingSchedulerService.scheduleMeeting({
      type,
      title,
      titleAr,
      description,
      descriptionAr,
      scheduledAt: new Date(scheduledAt),
      attendeeIds,
    });

    res.status(201).json({ success: true, data: meeting });
  } catch (error: any) {
    logger.error('[BoardController] scheduleMeeting error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;

    const meeting = await prisma.boardMeeting.findUnique({
      where: { id: meetingId },
      include: {
        attendees: { include: { member: true } },
        actionItems: { include: { assignee: true } },
        decisions: true,
        triggerAlert: true,
      },
    });

    if (!meeting) {
      throw new AppError(404, 'Meeting not found');
    }

    res.json({ success: true, data: meeting });
  } catch (error: any) {
    logger.error('[BoardController] getMeeting error:', error);
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

export const startMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const meeting = await meetingSchedulerService.startMeeting(meetingId);
    res.json({ success: true, data: meeting });
  } catch (error: any) {
    logger.error('[BoardController] startMeeting error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const endMeeting = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { summary, summaryAr } = req.body;
    const meeting = await meetingSchedulerService.endMeeting(meetingId, summary, summaryAr);
    res.json({ success: true, data: meeting });
  } catch (error: any) {
    logger.error('[BoardController] endMeeting error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- KPIs - مؤشرات الأداء ---

export const getKPIs = async (req: Request, res: Response) => {
  try {
    const kpis = await kpiTrackerService.getAllKPIs();
    res.json({ success: true, data: kpis });
  } catch (error: any) {
    logger.error('[BoardController] getKPIs error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getKPIDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await kpiTrackerService.getDashboardSummary();
    res.json({ success: true, data: dashboard });
  } catch (error: any) {
    logger.error('[BoardController] getKPIDashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getKPI = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const kpi = await prisma.kPIMetric.findUnique({ where: { code } });

    if (!kpi) {
      throw new AppError(404, 'KPI not found');
    }

    res.json({ success: true, data: kpi });
  } catch (error: any) {
    logger.error('[BoardController] getKPI error:', error);
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

export const getKPIHistory = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const days = parseInt(req.query.days as string) || 30;
    const history = await kpiTrackerService.getKPIHistory(code, days);
    res.json({ success: true, data: history });
  } catch (error: any) {
    logger.error('[BoardController] getKPIHistory error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateKPI = async (req: Request, res: Response) => {
  try {
    const { code } = req.params;
    const { value } = req.body;
    const kpi = await kpiTrackerService.updateKPI({ code, value });
    res.json({ success: true, data: kpi });
  } catch (error: any) {
    logger.error('[BoardController] updateKPI error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const initializeKPIs = async (req: Request, res: Response) => {
  try {
    // Get CEO as default owner
    const ceo = await prisma.boardMember.findFirst({ where: { role: 'CEO' } });
    if (!ceo) {
      throw new AppError(400, 'Board members must be initialized first');
    }

    const result = await kpiTrackerService.initializeDefaultKPIs(ceo.id);
    res.json({ success: true, data: result });
  } catch (error: any) {
    logger.error('[BoardController] initializeKPIs error:', error);
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

// --- Alerts - التنبيهات ---

export const getAlerts = async (req: Request, res: Response) => {
  try {
    const alerts = await alertEngineService.getActiveAlerts();
    res.json({ success: true, data: alerts });
  } catch (error: any) {
    logger.error('[BoardController] getAlerts error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getAlertDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await alertEngineService.getAlertDashboard();
    res.json({ success: true, data: dashboard });
  } catch (error: any) {
    logger.error('[BoardController] getAlertDashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createAlert = async (req: Request, res: Response) => {
  try {
    const { title, titleAr, description, descriptionAr, severity, assignedToId } = req.body;

    // Get CEO member for createdById
    const ceo = await prisma.boardMember.findFirst({ where: { role: 'CEO' } });

    const alert = await alertEngineService.createManualAlert({
      title,
      titleAr,
      description,
      descriptionAr,
      severity,
      assignedToId,
      createdById: ceo?.id || '',
    });

    res.status(201).json({ success: true, data: alert });
  } catch (error: any) {
    logger.error('[BoardController] createAlert error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const acknowledgeAlert = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const ceo = await prisma.boardMember.findFirst({ where: { role: 'CEO' } });
    const alert = await alertEngineService.acknowledgeAlert(alertId, ceo?.id || '');
    res.json({ success: true, data: alert });
  } catch (error: any) {
    logger.error('[BoardController] acknowledgeAlert error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const resolveAlert = async (req: Request, res: Response) => {
  try {
    const { alertId } = req.params;
    const { resolution } = req.body;
    const ceo = await prisma.boardMember.findFirst({ where: { role: 'CEO' } });
    const alert = await alertEngineService.resolveAlert(alertId, ceo?.id || '', resolution);
    res.json({ success: true, data: alert });
  } catch (error: any) {
    logger.error('[BoardController] resolveAlert error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const checkKPIsAndAlert = async (req: Request, res: Response) => {
  try {
    const result = await alertEngineService.checkKPIAndAlert();
    res.json({ success: true, data: result });
  } catch (error: any) {
    logger.error('[BoardController] checkKPIsAndAlert error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- SPADE Decisions - قرارات SPADE ---

export const getDecisions = async (req: Request, res: Response) => {
  try {
    const decisions = await decisionFrameworkService.getPendingDecisions();
    res.json({ success: true, data: decisions });
  } catch (error: any) {
    logger.error('[BoardController] getDecisions error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDecisionDashboard = async (req: Request, res: Response) => {
  try {
    const dashboard = await decisionFrameworkService.getDecisionDashboard();
    res.json({ success: true, data: dashboard });
  } catch (error: any) {
    logger.error('[BoardController] getDecisionDashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const initiateSPADE = async (req: Request, res: Response) => {
  try {
    const { title, titleAr, description, descriptionAr, decisionMakerId, deadline, meetingId } = req.body;

    // Get CEO as initiator
    const ceo = await prisma.boardMember.findFirst({ where: { role: 'CEO' } });

    const decision = await decisionFrameworkService.initiateSPADE({
      title,
      titleAr,
      description,
      descriptionAr,
      initiatedById: ceo?.id || '',
      decisionMakerId: decisionMakerId || ceo?.id || '',
      deadline: deadline ? new Date(deadline) : undefined,
      meetingId,
    });

    res.status(201).json({ success: true, data: decision });
  } catch (error: any) {
    logger.error('[BoardController] initiateSPADE error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDecision = async (req: Request, res: Response) => {
  try {
    const { decisionId } = req.params;
    const decision = await decisionFrameworkService.getDecision(decisionId);

    if (!decision) {
      throw new AppError(404, 'Decision not found');
    }

    res.json({ success: true, data: decision });
  } catch (error: any) {
    logger.error('[BoardController] getDecision error:', error);
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

export const setDecisionContext = async (req: Request, res: Response) => {
  try {
    const { decisionId } = req.params;
    const { context, contextAr, constraints } = req.body;

    const decision = await decisionFrameworkService.setContext({
      decisionId,
      context,
      contextAr,
      constraints,
    });

    res.json({ success: true, data: decision });
  } catch (error: any) {
    logger.error('[BoardController] setDecisionContext error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addConsultants = async (req: Request, res: Response) => {
  try {
    const { decisionId } = req.params;
    const { memberIds, roles } = req.body;

    // Add by roles if specified
    if (roles && roles.length > 0) {
      const consultants = await decisionFrameworkService.addConsultantsByRole(decisionId, roles);
      return res.json({ success: true, data: consultants });
    }

    // Add specific members
    const consultants = await Promise.all(
      memberIds.map((memberId: string) =>
        decisionFrameworkService.addConsultant({
          decisionId,
          memberId,
          role: 'Contributor',
        })
      )
    );

    res.json({ success: true, data: consultants });
  } catch (error: any) {
    logger.error('[BoardController] addConsultants error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const addAlternative = async (req: Request, res: Response) => {
  try {
    const { decisionId } = req.params;
    const { title, titleAr, description, descriptionAr, pros, cons, risks, cost, timeEstimate } = req.body;

    const ceo = await prisma.boardMember.findFirst({ where: { role: 'CEO' } });

    const alternative = await decisionFrameworkService.addAlternative({
      decisionId,
      title,
      titleAr,
      description,
      descriptionAr,
      proposedById: ceo?.id || '',
      pros,
      cons,
      risks,
      cost,
      timeEstimate,
    });

    res.status(201).json({ success: true, data: alternative });
  } catch (error: any) {
    logger.error('[BoardController] addAlternative error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const makeDecision = async (req: Request, res: Response) => {
  try {
    const { decisionId } = req.params;
    const { selectedAlternativeId, explanation, explanationAr, communicationPlan } = req.body;

    const decision = await decisionFrameworkService.makeDecision({
      decisionId,
      selectedAlternativeId,
      explanation,
      explanationAr,
      communicationPlan,
    });

    res.json({ success: true, data: decision });
  } catch (error: any) {
    logger.error('[BoardController] makeDecision error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const completeDecision = async (req: Request, res: Response) => {
  try {
    const { decisionId } = req.params;
    const decision = await decisionFrameworkService.completeDecision(decisionId);
    res.json({ success: true, data: decision });
  } catch (error: any) {
    logger.error('[BoardController] completeDecision error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Action Items - بنود العمل ---

export const getActionItems = async (req: Request, res: Response) => {
  try {
    const items = await prisma.actionItem.findMany({
      where: { status: { in: ['PENDING', 'IN_PROGRESS'] } },
      include: { assignee: true, meeting: true, decision: true },
      orderBy: [{ priority: 'desc' }, { dueDate: 'asc' }],
    });

    res.json({ success: true, data: items });
  } catch (error: any) {
    logger.error('[BoardController] getActionItems error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getOverdueActionItems = async (req: Request, res: Response) => {
  try {
    const items = await decisionFrameworkService.getOverdueActionItems();
    res.json({ success: true, data: items });
  } catch (error: any) {
    logger.error('[BoardController] getOverdueActionItems error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const createActionItem = async (req: Request, res: Response) => {
  try {
    const { title, titleAr, description, descriptionAr, assigneeId, dueDate, priority, meetingId, decisionId } = req.body;

    const ceo = await prisma.boardMember.findFirst({ where: { role: 'CEO' } });

    const item = await decisionFrameworkService.createActionItem({
      title,
      titleAr,
      description,
      descriptionAr,
      assigneeId,
      assignedById: ceo?.id || '',
      dueDate: new Date(dueDate),
      priority,
      meetingId,
      decisionId,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error: any) {
    logger.error('[BoardController] createActionItem error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateActionItemStatus = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { status } = req.body;
    const item = await decisionFrameworkService.updateActionItemStatus(itemId, status);
    res.json({ success: true, data: item });
  } catch (error: any) {
    logger.error('[BoardController] updateActionItemStatus error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateActionItemProgress = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { progress, notes } = req.body;
    const item = await decisionFrameworkService.updateActionItemProgress(itemId, progress, notes);
    res.json({ success: true, data: item });
  } catch (error: any) {
    logger.error('[BoardController] updateActionItemProgress error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
