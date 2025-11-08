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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { participant2Id, itemId, transactionId } = req.body;

    const conversation = await chatService.getOrCreateConversation(
      userId,
      participant2Id,
      itemId,
      transactionId
    );

    res.json(
      successResponse(conversation, 'Conversation retrieved successfully')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const result = await chatService.getUserConversations(userId, page, limit);

    res.json(
      successResponse(result, 'Conversations retrieved successfully')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversation = await chatService.getConversationById(req.params.id, userId);

    res.json(
      successResponse(conversation, 'Conversation retrieved successfully')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    await chatService.deleteConversation(req.params.id, userId);

    res.json(
      successResponse(null, 'Conversation deleted successfully')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const message = await chatService.sendMessage(userId, req.body);

    res.status(201).json(
      successResponse(message, 'Message sent successfully')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;
    const { page, limit, before, after } = req.query;

    const result = await chatService.getMessages(userId, {
      conversationId,
      page: page ? Number(page) : undefined,
      limit: limit ? Number(limit) : undefined,
      before: before ? new Date(before as string) : undefined,
      after: after ? new Date(after as string) : undefined,
    });

    res.json(
      successResponse(result, 'Messages retrieved successfully')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { conversationId } = req.params;

    const count = await chatService.markMessagesAsRead(conversationId, userId);

    res.json(
      successResponse({ count }, 'Messages marked as read')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { content } = req.body;

    const message = await chatService.editMessage(id, userId, content);

    res.json(
      successResponse(message, 'Message edited successfully')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    await chatService.deleteMessage(req.params.id, userId);

    res.json(
      successResponse(null, 'Message deleted successfully')
    );
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
): Promise<void> => {
  try {
    const presence = await chatService.getUserPresence(req.params.userId);

    res.json(
      successResponse(presence, 'Presence retrieved successfully')
    );
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
): Promise<void> => {
  try {
    const { userIds } = req.body;
    const presence = await chatService.getMultipleUserPresence(userIds);

    res.json(
      successResponse(presence, 'Presence retrieved successfully')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { blockedUserId, reason } = req.body;

    const blocked = await chatService.blockUser(userId, blockedUserId, reason);

    res.status(201).json(
      successResponse(blocked, 'User blocked successfully')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    await chatService.unblockUser(userId, req.params.userId);

    res.json(
      successResponse(null, 'User unblocked successfully')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const blocked = await chatService.getBlockedUsers(userId);

    res.json(
      successResponse(blocked, 'Blocked users retrieved successfully')
    );
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
): Promise<void> => {
  try {
    const userId = req.user!.id;
    const count = await chatService.getUnreadCount(userId);

    res.json(
      successResponse({ count }, 'Unread count retrieved successfully')
    );
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
): Promise<void> => {
  try {
    const stats = await chatService.getConversationStats(req.params.conversationId);

    res.json(
      successResponse(stats, 'Statistics retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};
