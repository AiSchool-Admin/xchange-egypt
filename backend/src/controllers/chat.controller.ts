/**
 * Chat Controller
 *
 * HTTP request handlers for chat operations
 */

import { Request, Response, NextFunction } from 'express';
import * as chatService from '../services/chat.service';
import { successResponse } from '../utils/response';

// ============================================
// Conversation Controllers
// ============================================

/**
 * Get or create conversation
 * POST /api/v1/chat/conversations
 */
export const getOrCreateConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { participant2Id, itemId, transactionId } = req.body;

    const conversation = await chatService.getOrCreateConversation(
      userId,
      participant2Id,
      itemId,
      transactionId
    );

    return successResponse(res, conversation, 'Conversation retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's conversations
 * GET /api/v1/chat/conversations
 */
export const getUserConversations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await chatService.getUserConversations(userId, page, limit);

    return successResponse(res, result, 'Conversations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get conversation by ID
 * GET /api/v1/chat/conversations/:id
 */
export const getConversationById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const conversation = await chatService.getConversationById(req.params.id, userId);

    return successResponse(res, conversation, 'Conversation retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete conversation
 * DELETE /api/v1/chat/conversations/:id
 */
export const deleteConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    await chatService.deleteConversation(req.params.id, userId);

    return successResponse(res, null, 'Conversation deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Message Controllers
// ============================================

/**
 * Send a message
 * POST /api/v1/chat/messages
 */
export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const message = await chatService.sendMessage(userId, req.body);

    return successResponse(res, message, 'Message sent successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Get messages in conversation
 * GET /api/v1/chat/conversations/:conversationId/messages
 */
export const getMessages = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;
    const { page, limit, before, after } = req.query;

    const result = await chatService.getMessages(userId, {
      conversationId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      before: before ? new Date(before as string) : undefined,
      after: after ? new Date(after as string) : undefined,
    });

    return successResponse(res, result, 'Messages retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Mark messages as read
 * POST /api/v1/chat/conversations/:conversationId/read
 */
export const markMessagesAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { conversationId } = req.params;

    const count = await chatService.markMessagesAsRead(conversationId, userId);

    return successResponse(res, { count }, 'Messages marked as read');
  } catch (error) {
    next(error);
  }
};

/**
 * Edit a message
 * PATCH /api/v1/chat/messages/:id
 */
export const editMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { content } = req.body;

    const message = await chatService.editMessage(id, userId, content);

    return successResponse(res, message, 'Message edited successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Delete a message
 * DELETE /api/v1/chat/messages/:id
 */
export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    await chatService.deleteMessage(req.params.id, userId);

    return successResponse(res, null, 'Message deleted successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Presence Controllers
// ============================================

/**
 * Get user presence
 * GET /api/v1/chat/presence/:userId
 */
export const getUserPresence = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const presence = await chatService.getUserPresence(req.params.userId);

    return successResponse(res, presence, 'Presence retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get multiple users presence
 * POST /api/v1/chat/presence/multiple
 */
export const getMultipleUserPresence = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userIds } = req.body;
    const presence = await chatService.getMultipleUserPresence(userIds);

    return successResponse(res, presence, 'Presence retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Blocking Controllers
// ============================================

/**
 * Block a user
 * POST /api/v1/chat/block
 */
export const blockUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const { blockedUserId, reason } = req.body;

    const blocked = await chatService.blockUser(userId, blockedUserId, reason);

    return successResponse(res, blocked, 'User blocked successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * Unblock a user
 * DELETE /api/v1/chat/block/:userId
 */
export const unblockUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    await chatService.unblockUser(userId, req.params.userId);

    return successResponse(res, null, 'User unblocked successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get blocked users
 * GET /api/v1/chat/blocked
 */
export const getBlockedUsers = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const blocked = await chatService.getBlockedUsers(userId);

    return successResponse(res, blocked, 'Blocked users retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Statistics Controllers
// ============================================

/**
 * Get unread message count
 * GET /api/v1/chat/unread-count
 */
export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user.id;
    const count = await chatService.getUnreadCount(userId);

    return successResponse(res, { count }, 'Unread count retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * Get conversation statistics
 * GET /api/v1/chat/conversations/:conversationId/stats
 */
export const getConversationStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const stats = await chatService.getConversationStats(req.params.conversationId);

    return successResponse(res, stats, 'Statistics retrieved successfully');
  } catch (error) {
    next(error);
  }
};
