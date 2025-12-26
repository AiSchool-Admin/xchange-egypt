/**
 * Board Routes
 * مسارات مجلس إدارة AI
 *
 * ⚠️ هذه المسارات متاحة للمؤسس فقط
 * All routes are FOUNDER-ONLY
 */

import { Router } from 'express';
import { authenticateFounder } from '../middleware/founderAuth';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/adminAuth';
import * as boardController from '../controllers/board.controller';

const router = Router();

// ============================================
// Founder Routes - مسارات المؤسس فقط
// ============================================

// Get all board members
router.get('/members', authenticateFounder, boardController.getBoardMembers);

// Get service status
router.get('/status', authenticateFounder, boardController.getServiceStatus);

// ============================================
// Conversation Routes - المحادثات
// ============================================

// Start a new conversation
router.post('/conversations', authenticateFounder, boardController.startConversation);

// Get founder's conversations
router.get('/conversations', authenticateFounder, boardController.getFounderConversations);

// Get specific conversation
router.get('/conversations/:conversationId', authenticateFounder, boardController.getConversation);

// Send message to conversation (supports brainstorming)
router.post('/conversations/:conversationId/messages', authenticateFounder, boardController.sendMessage);

// Continue discussion - الأعضاء يتفاعلون مع بعضهم
router.post('/conversations/:conversationId/continue', authenticateFounder, boardController.continueDiscussion);

// Structured sequential discussion - نقاش متتابع منظم
router.post('/conversations/:conversationId/structured', authenticateFounder, boardController.conductStructuredDiscussion);

// Get CEO summary with alternatives - ملخص الرئيس التنفيذي مع البدائل
router.post('/conversations/:conversationId/ceo-summary', authenticateFounder, boardController.generateCEOSummary);

// Record founder decision - تسجيل قرار المؤسس
router.post('/conversations/:conversationId/decision', authenticateFounder, boardController.recordFounderDecision);

// End conversation and get summary
router.post('/conversations/:conversationId/end', authenticateFounder, boardController.endConversation);

// ============================================
// Quick Question Routes - أسئلة سريعة
// ============================================

// Ask a specific member directly
router.post('/members/:memberId/ask', authenticateFounder, boardController.askMember);

// ============================================
// Task & Approval Routes - المهام والموافقات
// ============================================

// Get pending tasks for approval
router.get('/tasks/pending', authenticateFounder, boardController.getPendingTasks);

// Approve or reject a task
router.post('/tasks/:taskId/review', authenticateFounder, boardController.reviewTask);

// ============================================
// Admin Routes - إعداد المجلس
// ============================================

// Initialize board members (first-time setup by platform admin)
router.post('/admin/initialize', authenticateAdmin, requireSuperAdmin, boardController.initializeBoardMembers);

// ============================================
// Governance Routes - الحوكمة
// ============================================

// --- Meetings - الاجتماعات ---
router.get('/meetings', authenticateFounder, boardController.getMeetings);
router.get('/meetings/upcoming', authenticateFounder, boardController.getUpcomingMeetings);
router.get('/meetings/today', authenticateFounder, boardController.getTodayBoardMeetings);
router.post('/meetings', authenticateFounder, boardController.scheduleMeeting);
router.post('/meetings/schedule-today', authenticateFounder, boardController.scheduleTodaysMeetings);
router.get('/meetings/:meetingId', authenticateFounder, boardController.getMeeting);
router.put('/meetings/:meetingId/agenda', authenticateFounder, boardController.updateMeetingAgenda);
router.post('/meetings/:meetingId/start', authenticateFounder, boardController.startMeeting);
router.post('/meetings/:meetingId/end', authenticateFounder, boardController.endMeeting);

// --- KPIs - مؤشرات الأداء ---
router.get('/kpis', authenticateFounder, boardController.getKPIs);
router.get('/kpis/dashboard', authenticateFounder, boardController.getKPIDashboard);
router.get('/kpis/:code', authenticateFounder, boardController.getKPI);
router.get('/kpis/:code/history', authenticateFounder, boardController.getKPIHistory);
router.put('/kpis/:code', authenticateFounder, boardController.updateKPI);
router.post('/kpis/initialize', authenticateFounder, boardController.initializeKPIs);
router.post('/kpis/calculate', authenticateFounder, boardController.calculateAllKPIs);
router.post('/reports/generate', authenticateFounder, boardController.generateDailyReports);

// --- Alerts - التنبيهات ---
router.get('/alerts', authenticateFounder, boardController.getAlerts);
router.get('/alerts/dashboard', authenticateFounder, boardController.getAlertDashboard);
router.post('/alerts', authenticateFounder, boardController.createAlert);
router.post('/alerts/:alertId/acknowledge', authenticateFounder, boardController.acknowledgeAlert);
router.post('/alerts/:alertId/resolve', authenticateFounder, boardController.resolveAlert);
router.post('/alerts/check-kpis', authenticateFounder, boardController.checkKPIsAndAlert);

// --- SPADE Decisions - قرارات SPADE ---
router.get('/decisions', authenticateFounder, boardController.getDecisions);
router.get('/decisions/dashboard', authenticateFounder, boardController.getDecisionDashboard);
router.post('/decisions', authenticateFounder, boardController.initiateSPADE);
router.get('/decisions/:decisionId', authenticateFounder, boardController.getDecision);
router.post('/decisions/:decisionId/context', authenticateFounder, boardController.setDecisionContext);
router.post('/decisions/:decisionId/consultants', authenticateFounder, boardController.addConsultants);
router.post('/decisions/:decisionId/alternatives', authenticateFounder, boardController.addAlternative);
router.post('/decisions/:decisionId/decide', authenticateFounder, boardController.makeDecision);
router.post('/decisions/:decisionId/complete', authenticateFounder, boardController.completeDecision);

// --- Action Items - بنود العمل ---
router.get('/action-items', authenticateFounder, boardController.getActionItems);
router.get('/action-items/overdue', authenticateFounder, boardController.getOverdueActionItems);
router.post('/action-items', authenticateFounder, boardController.createActionItem);
router.put('/action-items/:itemId/status', authenticateFounder, boardController.updateActionItemStatus);
router.put('/action-items/:itemId/progress', authenticateFounder, boardController.updateActionItemProgress);

// ============================================
// Autonomous Board Routes - المجلس الذاتي
// ============================================

// --- Autonomous Dashboard - لوحة المجلس الذاتي ---
router.get('/autonomous/dashboard', authenticateFounder, boardController.getAutonomousDashboard);

// --- Morning Intelligence - الاستخبارات الصباحية ---
router.get('/autonomous/intelligence', authenticateFounder, boardController.getMorningIntelligence);
router.get('/autonomous/intelligence/history', authenticateFounder, boardController.getMorningIntelligenceHistory);
router.post('/autonomous/morning-intelligence/generate', authenticateFounder, boardController.generateMorningIntelligence);

// --- Environment Scans - المسح البيئي ---
router.get('/autonomous/scans', authenticateFounder, boardController.getEnvironmentScans);
router.get('/autonomous/scans/:scanId', authenticateFounder, boardController.getEnvironmentScan);

// --- Meeting Minutes (MOM) - محاضر الاجتماعات ---
router.get('/autonomous/moms', authenticateFounder, boardController.getMeetingMinutes);
router.get('/autonomous/moms/pending', authenticateFounder, boardController.getPendingMOMs);
router.get('/autonomous/moms/:momId', authenticateFounder, boardController.getMeetingMinutesById);
router.post('/autonomous/moms/:momId/approve', authenticateFounder, boardController.approveMeetingMinutes);

// --- Innovation Ideas - أفكار الابتكار ---
router.get('/autonomous/ideas', authenticateFounder, boardController.getInnovationIdeas);
router.get('/autonomous/ideas/:ideaId', authenticateFounder, boardController.getInnovationIdea);
router.put('/autonomous/ideas/:ideaId/status', authenticateFounder, boardController.updateIdeaStatus);

// --- Competitor Watch - مراقبة المنافسين ---
router.get('/autonomous/competitors', authenticateFounder, boardController.getCompetitors);
router.put('/autonomous/competitors/:competitorId', authenticateFounder, boardController.updateCompetitor);

// --- Daily Closing Reports - تقارير الإغلاق اليومي ---
router.get('/autonomous/closing-reports', authenticateFounder, boardController.getDailyClosingReports);
router.get('/autonomous/closing-reports/:reportId', authenticateFounder, boardController.getDailyClosingReport);

// --- Run Autonomous Meeting Manually - تشغيل اجتماع ذاتي يدوياً ---
router.post('/autonomous/meetings/run', authenticateFounder, boardController.runAutonomousMeetingManually);

// --- Generate Meeting Agenda - توليد أجندة الاجتماع ---
router.post('/autonomous/agenda/generate', authenticateFounder, boardController.generateMeetingAgendaEndpoint);

// ============================================
// Company Phase Routes - مسارات مرحلة الشركة
// ============================================
router.get('/phase', authenticateFounder, boardController.getCompanyPhase);
router.put('/phase', authenticateFounder, boardController.updateCompanyPhase);

// ============================================
// Master Initialization Routes - التهيئة الشاملة
// ============================================
// Initialize ALL board components at once
router.post('/master/initialize', authenticateFounder, boardController.masterBoardInitialize);
// Check board health/initialization status
router.get('/master/health', authenticateFounder, boardController.getBoardHealthStatus);

// ============================================
// External Intelligence Routes - الاستخبارات الخارجية
// ============================================
// Generate external intelligence (RSS + Competitors + Economy)
router.post('/external-intelligence/generate', authenticateFounder, boardController.generateExternalIntelligenceReport);

export default router;
