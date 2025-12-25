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

/**
 * Update meeting agenda - تحديث أجندة الاجتماع
 */
export const updateMeetingAgenda = async (req: Request, res: Response) => {
  try {
    const { meetingId } = req.params;
    const { agenda } = req.body;

    if (!agenda || !Array.isArray(agenda)) {
      throw new AppError(400, 'الأجندة مطلوبة ويجب أن تكون قائمة');
    }

    // Verify meeting exists and is still SCHEDULED
    const existingMeeting = await prisma.boardMeeting.findUnique({
      where: { id: meetingId },
    });

    if (!existingMeeting) {
      throw new AppError(404, 'الاجتماع غير موجود');
    }

    if (existingMeeting.status !== 'SCHEDULED') {
      throw new AppError(400, 'لا يمكن تعديل أجندة اجتماع بدأ أو انتهى');
    }

    // Update the agenda
    const meeting = await prisma.boardMeeting.update({
      where: { id: meetingId },
      data: {
        agenda: agenda,
        updatedAt: new Date(),
      },
      include: {
        attendees: {
          include: {
            member: true,
          },
        },
      },
    });

    logger.info(`[BoardController] Agenda updated for meeting ${meetingId}`);
    res.json({ success: true, data: meeting });
  } catch (error: any) {
    logger.error('[BoardController] updateMeetingAgenda error:', error);
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
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

/**
 * Calculate and update all KPIs from platform data
 * حساب وتحديث جميع مؤشرات الأداء من بيانات المنصة
 */
export const calculateAllKPIs = async (req: Request, res: Response) => {
  try {
    logger.info('[BoardController] Calculating all KPIs...');

    // Import the KPI calculator
    const { calculateAndUpdateAllKPIs, getAllKPIExplanations } = await import(
      '../services/board/kpi-calculator.service'
    );

    const result = await calculateAndUpdateAllKPIs();

    // Get updated KPIs
    const kpis = await kpiTrackerService.getAllKPIs();

    res.json({
      success: true,
      message: `تم تحديث ${result.updated} مؤشر أداء`,
      data: {
        updated: result.updated,
        errors: result.errors,
        kpis,
        explanations: getAllKPIExplanations(),
      },
    });
  } catch (error: any) {
    logger.error('[BoardController] calculateAllKPIs error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Generate all daily reports manually
 * توليد جميع التقارير اليومية يدوياً
 */
export const generateDailyReports = async (req: Request, res: Response) => {
  try {
    logger.info('[BoardController] Generating all daily reports...');

    const results: any = { generated: [], errors: [] };

    // Import services
    const { generateDailyContentPackage } = await import(
      '../services/autonomous-board/youssef-cmo.service'
    );
    const { generateDailyFinancialReport } = await import(
      '../services/autonomous-board/laila-cfo.service'
    );
    const { generateDailyOperationsReport } = await import(
      '../services/autonomous-board/omar-coo.service'
    );

    // Generate Content Package (Youssef CMO)
    try {
      const content = await generateDailyContentPackage();
      results.generated.push({
        type: 'CONTENT_PACKAGE',
        member: 'Youssef (CMO)',
        id: content.id,
      });
    } catch (err: any) {
      results.errors.push({ type: 'CONTENT_PACKAGE', error: err.message });
    }

    // Generate Financial Report (Laila CFO)
    try {
      const financial = await generateDailyFinancialReport();
      results.generated.push({
        type: 'FINANCIAL_REPORT',
        member: 'Laila (CFO)',
        id: financial.id,
      });
    } catch (err: any) {
      results.errors.push({ type: 'FINANCIAL_REPORT', error: err.message });
    }

    // Generate Operations Report (Omar COO)
    try {
      const operations = await generateDailyOperationsReport();
      results.generated.push({
        type: 'OPERATIONS_REPORT',
        member: 'Omar (COO)',
        id: operations.id,
      });
    } catch (err: any) {
      results.errors.push({ type: 'OPERATIONS_REPORT', error: err.message });
    }

    // Fetch today's reports from database
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayReports = await prisma.boardMemberDailyReport.findMany({
      where: { date: { gte: today } },
      include: { member: { select: { name: true, nameAr: true, role: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      message: `تم توليد ${results.generated.length} تقارير`,
      data: {
        results,
        reports: todayReports,
      },
    });
  } catch (error: any) {
    logger.error('[BoardController] generateDailyReports error:', error);
    res.status(500).json({ success: false, error: error.message });
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

// ============================================
// Autonomous Board Routes - المجلس الذاتي
// ============================================

// --- Morning Intelligence - الاستخبارات الصباحية ---

export const getMorningIntelligence = async (req: Request, res: Response) => {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date as string) : new Date();

    const startOfDay = new Date(targetDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(targetDate);
    endOfDay.setHours(23, 59, 59, 999);

    const report = await prisma.morningIntelligence.findFirst({
      where: {
        date: { gte: startOfDay, lte: endOfDay },
      },
      orderBy: { date: 'desc' },
    });

    res.json({ success: true, data: report });
  } catch (error: any) {
    logger.error('[BoardController] getMorningIntelligence error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMorningIntelligenceHistory = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 7;

    const reports = await prisma.morningIntelligence.findMany({
      orderBy: { date: 'desc' },
      take: limit,
    });

    res.json({ success: true, data: reports });
  } catch (error: any) {
    logger.error('[BoardController] getMorningIntelligenceHistory error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Generate Morning Intelligence manually
 * توليد الاستخبارات الصباحية يدوياً
 */
export const generateMorningIntelligence = async (req: Request, res: Response) => {
  try {
    logger.info('[BoardController] Generating Morning Intelligence manually...');

    // Import and run the morning intelligence generator
    const { generateMorningIntelligence: generateIntelligence } = await import(
      '../services/autonomous-board/morning-intelligence.service'
    );

    const report = await generateIntelligence();

    res.json({
      success: true,
      message: 'تم توليد الاستخبارات الصباحية بنجاح',
      data: report,
    });
  } catch (error: any) {
    logger.error('[BoardController] generateMorningIntelligence error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Run Autonomous Meeting manually
 * تشغيل اجتماع ذاتي يدوياً
 */
export const runAutonomousMeetingManually = async (req: Request, res: Response) => {
  try {
    const { type = 'MORNING' } = req.body; // MORNING or AFTERNOON

    logger.info(`[BoardController] Running ${type} autonomous meeting manually...`);

    // Import and run the autonomous meeting
    const { runAutonomousMeeting } = await import(
      '../services/autonomous-board/autonomous-meeting.service'
    );

    const result = await runAutonomousMeeting(type);

    res.json({
      success: true,
      message: `تم عقد الاجتماع ${type === 'MORNING' ? 'الصباحي' : 'المسائي'} بنجاح`,
      data: {
        meeting: result.meeting,
        session: result.session,
        mom: result.mom,
        discussionCount: result.discussionLog.length,
        ideasCount: result.ideas.length,
      },
    });
  } catch (error: any) {
    logger.error('[BoardController] runAutonomousMeetingManually error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Generate Meeting Agenda
 * توليد أجندة الاجتماع
 */
export const generateMeetingAgendaEndpoint = async (req: Request, res: Response) => {
  try {
    const { type = 'MORNING', maxDuration = 45 } = req.body;

    logger.info(`[BoardController] Generating ${type} meeting agenda...`);

    // Import agenda intelligence service
    const { generateMeetingAgenda } = await import(
      '../services/autonomous-board/agenda-intelligence.service'
    );

    const agenda = await generateMeetingAgenda(type, maxDuration);

    res.json({
      success: true,
      message: `تم توليد أجندة الاجتماع ${type === 'MORNING' ? 'الصباحي' : 'المسائي'}`,
      data: agenda,
    });
  } catch (error: any) {
    logger.error('[BoardController] generateMeetingAgendaEndpoint error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Environment Scans - المسح البيئي ---

export const getEnvironmentScans = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const scans = await prisma.environmentScan.findMany({
      orderBy: { date: 'desc' },
      take: limit,
    });

    res.json({ success: true, data: scans });
  } catch (error: any) {
    logger.error('[BoardController] getEnvironmentScans error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEnvironmentScan = async (req: Request, res: Response) => {
  try {
    const { scanId } = req.params;

    const scan = await prisma.environmentScan.findUnique({
      where: { id: scanId },
    });

    if (!scan) {
      throw new AppError(404, 'Scan not found');
    }

    res.json({ success: true, data: scan });
  } catch (error: any) {
    logger.error('[BoardController] getEnvironmentScan error:', error);
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

// --- Meeting Minutes (MOM) - محاضر الاجتماعات ---

export const getMeetingMinutes = async (req: Request, res: Response) => {
  try {
    const { status, limit: limitParam } = req.query;
    const limit = parseInt(limitParam as string) || 20;

    const where: Record<string, unknown> = {};
    if (status) {
      where.approvalStatus = status;
    }

    const minutes = await prisma.meetingMinutes.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit,
      include: {
        meeting: { select: { title: true, type: true } },
      },
    });

    res.json({ success: true, data: minutes });
  } catch (error: any) {
    logger.error('[BoardController] getMeetingMinutes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getMeetingMinutesById = async (req: Request, res: Response) => {
  try {
    const { momId } = req.params;

    const mom = await prisma.meetingMinutes.findUnique({
      where: { id: momId },
      include: {
        meeting: true,
      },
    });

    if (!mom) {
      throw new AppError(404, 'Meeting minutes not found');
    }

    res.json({ success: true, data: mom });
  } catch (error: any) {
    logger.error('[BoardController] getMeetingMinutesById error:', error);
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

export const approveMeetingMinutes = async (req: Request, res: Response) => {
  try {
    const { momId } = req.params;
    const { status, notes } = req.body;

    // Get CEO for approval
    const ceo = await prisma.boardMember.findFirst({ where: { role: 'CEO' } });

    const mom = await prisma.meetingMinutes.update({
      where: { id: momId },
      data: {
        approvalStatus: status,
        approvedById: ceo?.id,
        approvedAt: new Date(),
        approvalNotes: notes,
      },
    });

    res.json({ success: true, data: mom });
  } catch (error: any) {
    logger.error('[BoardController] approveMeetingMinutes error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getPendingMOMs = async (req: Request, res: Response) => {
  try {
    const moms = await prisma.meetingMinutes.findMany({
      where: { approvalStatus: 'PENDING' },
      orderBy: { date: 'desc' },
      include: {
        meeting: { select: { title: true, type: true } },
      },
    });

    res.json({ success: true, data: moms });
  } catch (error: any) {
    logger.error('[BoardController] getPendingMOMs error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Innovation Ideas - أفكار الابتكار ---

export const getInnovationIdeas = async (req: Request, res: Response) => {
  try {
    const { status, limit: limitParam } = req.query;
    const limit = parseInt(limitParam as string) || 20;

    const where: Record<string, unknown> = {};
    if (status) {
      where.status = status;
    }

    const ideas = await prisma.innovationIdea.findMany({
      where,
      orderBy: [{ overallScore: 'desc' }, { createdAt: 'desc' }],
      take: limit,
      include: {
        proposedBy: { select: { name: true, role: true } },
        owner: { select: { name: true, role: true } },
      },
    });

    res.json({ success: true, data: ideas });
  } catch (error: any) {
    logger.error('[BoardController] getInnovationIdeas error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getInnovationIdea = async (req: Request, res: Response) => {
  try {
    const { ideaId } = req.params;

    const idea = await prisma.innovationIdea.findUnique({
      where: { id: ideaId },
      include: {
        proposedBy: true,
        owner: true,
        mom: { select: { momNumber: true, date: true } },
      },
    });

    if (!idea) {
      throw new AppError(404, 'Idea not found');
    }

    res.json({ success: true, data: idea });
  } catch (error: any) {
    logger.error('[BoardController] getInnovationIdea error:', error);
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

export const updateIdeaStatus = async (req: Request, res: Response) => {
  try {
    const { ideaId } = req.params;
    const { status, ownerId, implementationPlan } = req.body;

    const idea = await prisma.innovationIdea.update({
      where: { id: ideaId },
      data: {
        status,
        ownerId,
        implementationPlan,
        implementedAt: status === 'IMPLEMENTED' ? new Date() : undefined,
      },
    });

    res.json({ success: true, data: idea });
  } catch (error: any) {
    logger.error('[BoardController] updateIdeaStatus error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Competitor Watch - مراقبة المنافسين ---

export const getCompetitors = async (req: Request, res: Response) => {
  try {
    const competitors = await prisma.competitorWatch.findMany({
      orderBy: [{ threatLevel: 'desc' }, { competitorName: 'asc' }],
    });

    res.json({ success: true, data: competitors });
  } catch (error: any) {
    logger.error('[BoardController] getCompetitors error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateCompetitor = async (req: Request, res: Response) => {
  try {
    const { competitorId } = req.params;
    const { lastActivity, threatLevel, recommendedResponse, urgency } = req.body;

    const competitor = await prisma.competitorWatch.update({
      where: { id: competitorId },
      data: {
        lastActivity,
        activityDate: new Date(),
        threatLevel,
        recommendedResponse,
        urgency,
      },
    });

    res.json({ success: true, data: competitor });
  } catch (error: any) {
    logger.error('[BoardController] updateCompetitor error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// --- Daily Closing Reports - تقارير الإغلاق اليومي ---

export const getDailyClosingReports = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 7;

    const reports = await prisma.dailyClosingReport.findMany({
      orderBy: { date: 'desc' },
      take: limit,
    });

    res.json({ success: true, data: reports });
  } catch (error: any) {
    logger.error('[BoardController] getDailyClosingReports error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getDailyClosingReport = async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;

    const report = await prisma.dailyClosingReport.findUnique({
      where: { id: reportId },
    });

    if (!report) {
      throw new AppError(404, 'Report not found');
    }

    res.json({ success: true, data: report });
  } catch (error: any) {
    logger.error('[BoardController] getDailyClosingReport error:', error);
    res.status(error.statusCode || 500).json({ success: false, error: error.message });
  }
};

// --- Autonomous Dashboard - لوحة المجلس الذاتي ---

export const getAutonomousDashboard = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today);
    startOfDay.setHours(0, 0, 0, 0);

    // Get today's morning intelligence
    const morningIntel = await prisma.morningIntelligence.findFirst({
      where: { date: { gte: startOfDay } },
      orderBy: { date: 'desc' },
    });

    // Get pending MOMs
    const pendingMOMs = await prisma.meetingMinutes.count({
      where: { approvalStatus: 'PENDING' },
    });

    // Get today's meetings
    const todayMeetings = await prisma.boardMeeting.count({
      where: {
        scheduledAt: { gte: startOfDay },
        status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
      },
    });

    // Get active alerts
    const activeAlerts = await prisma.boardAlert.count({
      where: { resolvedAt: null },
    });

    // Get latest environment scan
    const latestScan = await prisma.environmentScan.findFirst({
      orderBy: { date: 'desc' },
    });

    // Get innovation ideas count
    const activeIdeas = await prisma.innovationIdea.count({
      where: { status: { in: ['PROPOSED', 'UNDER_REVIEW', 'IN_PROGRESS'] } },
    });

    // Get high-threat competitors
    const highThreatCompetitors = await prisma.competitorWatch.count({
      where: { threatLevel: { in: ['HIGH', 'CRITICAL'] } },
    });

    // Get today's board member reports
    const todayReports = await prisma.boardMemberDailyReport.findMany({
      where: { date: { gte: startOfDay } },
      include: { member: { select: { name: true, nameAr: true, role: true } } },
      orderBy: { createdAt: 'asc' },
    });

    // Get today's closing report
    const closingReport = await prisma.dailyClosingReport.findFirst({
      where: { date: { gte: startOfDay } },
      orderBy: { date: 'desc' },
    });

    // Organize reports by type
    const contentPackage = todayReports.find(r => r.type === 'CONTENT_PACKAGE');
    const financialReport = todayReports.find(r => r.type === 'FINANCIAL_REPORT');
    const operationsReport = todayReports.find(r => r.type === 'OPERATIONS_REPORT');

    res.json({
      success: true,
      data: {
        morningIntelligence: morningIntel,
        contentPackage: contentPackage ? {
          reportNumber: contentPackage.reportNumber,
          title: contentPackage.title,
          titleAr: contentPackage.titleAr,
          summary: contentPackage.summary,
          summaryAr: contentPackage.summaryAr,
          scheduledTime: contentPackage.scheduledTime,
          memberName: contentPackage.member.nameAr || contentPackage.member.name,
          content: contentPackage.content,
          generatedAt: contentPackage.generatedAt,
        } : null,
        financialReport: financialReport ? {
          reportNumber: financialReport.reportNumber,
          title: financialReport.title,
          titleAr: financialReport.titleAr,
          summary: financialReport.summary,
          summaryAr: financialReport.summaryAr,
          scheduledTime: financialReport.scheduledTime,
          memberName: financialReport.member.nameAr || financialReport.member.name,
          keyMetrics: financialReport.keyMetrics,
          alerts: financialReport.alerts,
          generatedAt: financialReport.generatedAt,
        } : null,
        operationsReport: operationsReport ? {
          reportNumber: operationsReport.reportNumber,
          title: operationsReport.title,
          titleAr: operationsReport.titleAr,
          summary: operationsReport.summary,
          summaryAr: operationsReport.summaryAr,
          scheduledTime: operationsReport.scheduledTime,
          memberName: operationsReport.member.nameAr || operationsReport.member.name,
          keyMetrics: operationsReport.keyMetrics,
          insights: operationsReport.insights,
          generatedAt: operationsReport.generatedAt,
        } : null,
        closingReport: closingReport ? {
          reportNumber: closingReport.reportNumber,
          executiveSummary: closingReport.executiveSummary,
          executiveSummaryAr: closingReport.executiveSummaryAr,
          meetingsHeld: closingReport.meetingsHeld,
          decisionsCount: closingReport.decisionsCount,
          actionItemsCreated: closingReport.actionItemsCreated,
          date: closingReport.date,
        } : null,
        stats: {
          pendingMOMs,
          todayMeetings,
          activeAlerts,
          activeIdeas,
          highThreatCompetitors,
        },
        latestEnvironmentScan: latestScan
          ? {
              scanNumber: latestScan.scanNumber,
              date: latestScan.date,
              confidenceLevel: latestScan.confidenceLevel,
            }
          : null,
      },
    });
  } catch (error: any) {
    logger.error('[BoardController] getAutonomousDashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// Daily Meeting Scheduling - جدولة الاجتماعات اليومية
// ============================================

import { scheduleDailyMeetings, getTodaysMeetings } from '../services/autonomous-board';

/**
 * Schedule today's daily meetings
 * جدولة اجتماعات اليوم
 */
export const scheduleTodaysMeetings = async (req: Request, res: Response) => {
  try {
    logger.info('[BoardController] Manually scheduling today\'s meetings...');
    const meetings = await scheduleDailyMeetings();

    res.json({
      success: true,
      message: `تم جدولة ${meetings.length} اجتماعات لليوم`,
      data: meetings,
    });
  } catch (error: any) {
    logger.error('[BoardController] scheduleTodaysMeetings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Get today's meetings
 * الحصول على اجتماعات اليوم
 */
export const getTodayBoardMeetings = async (req: Request, res: Response) => {
  try {
    const meetings = await getTodaysMeetings();

    res.json({
      success: true,
      data: meetings,
    });
  } catch (error: any) {
    logger.error('[BoardController] getTodayBoardMeetings error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// ============================================
// Company Phase - مرحلة الشركة
// ============================================

import {
  CompanyPhase,
  COMPANY_PHASES_CONFIG,
  getPhaseConfig,
} from '../config/board/company-phases.config';

/**
 * Get current company phase
 */
export const getCompanyPhase = async (req: Request, res: Response) => {
  try {
    // Try to get from database first
    const settings = await prisma.systemSettings.findFirst({
      where: { key: 'company_phase' },
    });

    const currentPhase = (settings?.value as CompanyPhase) || CompanyPhase.MVP;
    const phaseConfig = getPhaseConfig(currentPhase);

    res.json({
      success: true,
      data: {
        currentPhase,
        config: phaseConfig,
        allPhases: COMPANY_PHASES_CONFIG.map((p) => ({
          phase: p.phase,
          name: p.name,
          nameAr: p.nameAr,
          description: p.description,
          descriptionAr: p.descriptionAr,
        })),
      },
    });
  } catch (error: any) {
    logger.error('[BoardController] getCompanyPhase error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

/**
 * Update company phase (founder only)
 */
export const updateCompanyPhase = async (req: Request, res: Response) => {
  try {
    const { phase } = req.body;

    // Validate phase
    const validPhases = Object.values(CompanyPhase);
    if (!validPhases.includes(phase)) {
      return res.status(400).json({
        success: false,
        error: `Invalid phase. Valid phases: ${validPhases.join(', ')}`,
      });
    }

    // Upsert system setting
    await prisma.systemSettings.upsert({
      where: { key: 'company_phase' },
      update: { value: phase, updatedAt: new Date() },
      create: { key: 'company_phase', value: phase },
    });

    const phaseConfig = getPhaseConfig(phase);

    logger.info(`[BoardController] Company phase updated to: ${phase}`);

    res.json({
      success: true,
      data: {
        currentPhase: phase,
        config: phaseConfig,
      },
      message: `تم تحديث مرحلة الشركة إلى: ${phaseConfig?.nameAr || phase}`,
    });
  } catch (error: any) {
    logger.error('[BoardController] updateCompanyPhase error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
