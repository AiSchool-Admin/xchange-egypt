/**
 * Chat Routes
 *
 * All routes for the real-time chat system
 */

import { Router } from 'express';
import * as chatController from '../controllers/chat.controller';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validation';
import {
  getOrCreateConversationSchema,
  getUserConversationsSchema,
  getConversationByIdSchema,
  deleteConversationSchema,
  sendMessageSchema,
  getMessagesSchema,
  markAsReadSchema,
  editMessageSchema,
  deleteMessageSchema,
  getUserPresenceSchema,
  getMultiplePresenceSchema,
  blockUserSchema,
  unblockUserSchema,
  getConversationStatsSchema,
} from '../validations/chat.validation';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// ============================================
// Conversation Routes
// ============================================

/**
 * Get or create conversation
 * POST /api/v1/chat/conversations
 * Body: { participant2Id, itemId?, transactionId? }
 */
router.post(
  '/conversations',
  validate(getOrCreateConversationSchema),
  chatController.getOrCreateConversation
);

/**
 * Get user's conversations
 * GET /api/v1/chat/conversations
 * Query: page?, limit?
 */
router.get(
  '/conversations',
  validate(getUserConversationsSchema),
  chatController.getUserConversations
);

/**
 * Get conversation by ID
 * GET /api/v1/chat/conversations/:id
 */
router.get(
  '/conversations/:id',
  validate(getConversationByIdSchema),
  chatController.getConversationById
);

/**
 * Delete conversation
 * DELETE /api/v1/chat/conversations/:id
 */
router.delete(
  '/conversations/:id',
  validate(deleteConversationSchema),
  chatController.deleteConversation
);

// ============================================
// Message Routes
// ============================================

/**
 * Send a message
 * POST /api/v1/chat/messages
 * Body: { conversationId, content, type?, attachments?, itemId?, offerId? }
 */
router.post(
  '/messages',
  validate(sendMessageSchema),
  chatController.sendMessage
);

/**
 * Get messages in conversation
 * GET /api/v1/chat/conversations/:conversationId/messages
 * Query: page?, limit?, before?, after?
 */
router.get(
  '/conversations/:conversationId/messages',
  validate(getMessagesSchema),
  chatController.getMessages
);

/**
 * Mark messages as read
 * POST /api/v1/chat/conversations/:conversationId/read
 */
router.post(
  '/conversations/:conversationId/read',
  validate(markAsReadSchema),
  chatController.markMessagesAsRead
);

/**
 * Edit a message
 * PATCH /api/v1/chat/messages/:id
 * Body: { content }
 */
router.patch(
  '/messages/:id',
  validate(editMessageSchema),
  chatController.editMessage
);

/**
 * Delete a message
 * DELETE /api/v1/chat/messages/:id
 */
router.delete(
  '/messages/:id',
  validate(deleteMessageSchema),
  chatController.deleteMessage
);

// ============================================
// Presence Routes
// ============================================

/**
 * Get user presence
 * GET /api/v1/chat/presence/:userId
 */
router.get(
  '/presence/:userId',
  validate(getUserPresenceSchema),
  chatController.getUserPresence
);

/**
 * Get multiple users presence
 * POST /api/v1/chat/presence/multiple
 * Body: { userIds: string[] }
 */
router.post(
  '/presence/multiple',
  validate(getMultiplePresenceSchema),
  chatController.getMultipleUserPresence
);

// ============================================
// Blocking Routes
// ============================================

/**
 * Block a user
 * POST /api/v1/chat/block
 * Body: { blockedUserId, reason? }
 */
router.post(
  '/block',
  validate(blockUserSchema),
  chatController.blockUser
);

/**
 * Unblock a user
 * DELETE /api/v1/chat/block/:userId
 */
router.delete(
  '/block/:userId',
  validate(unblockUserSchema),
  chatController.unblockUser
);

/**
 * Get blocked users
 * GET /api/v1/chat/blocked
 */
router.get(
  '/blocked',
  chatController.getBlockedUsers
);

// ============================================
// Statistics Routes
// ============================================

/**
 * Get unread message count
 * GET /api/v1/chat/unread-count
 */
router.get(
  '/unread-count',
  chatController.getUnreadCount
);

/**
 * Get conversation statistics
 * GET /api/v1/chat/conversations/:conversationId/stats
 */
router.get(
  '/conversations/:conversationId/stats',
  validate(getConversationStatsSchema),
  chatController.getConversationStats
);

export default router;
