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

export default router;
