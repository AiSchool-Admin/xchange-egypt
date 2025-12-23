/**
 * Board Routes
 * مسارات مجلس إدارة AI
 */

import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authenticateAdmin, requireSuperAdmin } from '../middleware/adminAuth';
import * as boardController from '../controllers/board.controller';

const router = Router();

// ============================================
// Public Routes (require authentication)
// ============================================

// Get all board members
router.get('/members', authenticate, boardController.getBoardMembers);

// Get service status
router.get('/status', authenticate, boardController.getServiceStatus);

// ============================================
// Conversation Routes
// ============================================

// Start a new conversation
router.post('/conversations', authenticate, boardController.startConversation);

// Get user's conversations
router.get('/conversations', authenticate, boardController.getUserConversations);

// Get specific conversation
router.get('/conversations/:conversationId', authenticate, boardController.getConversation);

// Send message to conversation
router.post('/conversations/:conversationId/messages', authenticate, boardController.sendMessage);

// End conversation and get summary
router.post('/conversations/:conversationId/end', authenticate, boardController.endConversation);

// ============================================
// Quick Question Routes
// ============================================

// Ask a specific member directly
router.post('/members/:memberId/ask', authenticate, boardController.askMember);

// ============================================
// Task & Approval Routes
// ============================================

// Get pending tasks for approval
router.get('/tasks/pending', authenticate, boardController.getPendingTasks);

// Approve or reject a task
router.post('/tasks/:taskId/review', authenticate, boardController.reviewTask);

// ============================================
// Admin Routes
// ============================================

// Initialize board members (first-time setup)
router.post('/admin/initialize', authenticateAdmin, requireSuperAdmin, boardController.initializeBoardMembers);

export default router;
