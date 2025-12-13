/**
 * Chat Validation Schemas
 *
 * Zod validation schemas for chat-related requests
 */

import { z } from 'zod';

// ============================================
// Conversation Schemas
// ============================================

/**
 * Schema for creating/getting conversation
 */
export const getOrCreateConversationSchema = z.object({
  body: z.object({
    participant2Id: z.string().min(1, 'User ID is required'),
    itemId: z.string().min(1).optional(),
    transactionId: z.string().min(1).optional(),
  }),
});

/**
 * Schema for getting user conversations
 */
export const getUserConversationsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
  }),
});

/**
 * Schema for getting conversation by ID
 */
export const getConversationByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Conversation ID is required'),
  }),
});

/**
 * Schema for deleting conversation
 */
export const deleteConversationSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Conversation ID is required'),
  }),
});

// ============================================
// Message Schemas
// ============================================

/**
 * Schema for sending a message
 */
export const sendMessageSchema = z.object({
  body: z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
    content: z.string().min(1, 'Message content is required').max(5000, 'Message too long'),
    type: z.enum(['TEXT', 'IMAGE', 'FILE', 'ITEM', 'OFFER', 'SYSTEM']).optional(),
    attachments: z.array(z.string().url()).max(10, 'Maximum 10 attachments').optional(),
    itemId: z.string().min(1).optional(),
    offerId: z.string().min(1).optional(),
  }),
});

/**
 * Schema for getting messages
 */
export const getMessagesSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
  }),
  query: z.object({
    page: z.string().transform(Number).pipe(z.number().int().min(1)).optional(),
    limit: z.string().transform(Number).pipe(z.number().int().min(1).max(100)).optional(),
    before: z.string().transform(s => new Date(s)).optional(),
    after: z.string().transform(s => new Date(s)).optional(),
  }),
});

/**
 * Schema for marking messages as read
 */
export const markAsReadSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
  }),
});

/**
 * Schema for editing message
 */
export const editMessageSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Message ID is required'),
  }),
  body: z.object({
    content: z.string().min(1, 'Content is required').max(5000, 'Message too long'),
  }),
});

/**
 * Schema for deleting message
 */
export const deleteMessageSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Message ID is required'),
  }),
});

// ============================================
// Presence Schemas
// ============================================

/**
 * Schema for getting user presence
 */
export const getUserPresenceSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
});

/**
 * Schema for getting multiple user presence
 */
export const getMultiplePresenceSchema = z.object({
  body: z.object({
    userIds: z.array(z.string().min(1)).min(1, 'At least one user ID required').max(100, 'Maximum 100 users'),
  }),
});

// ============================================
// Blocking Schemas
// ============================================

/**
 * Schema for blocking user
 */
export const blockUserSchema = z.object({
  body: z.object({
    blockedUserId: z.string().min(1, 'User ID is required'),
    reason: z.string().max(500).optional(),
  }),
});

/**
 * Schema for unblocking user
 */
export const unblockUserSchema = z.object({
  params: z.object({
    userId: z.string().min(1, 'User ID is required'),
  }),
});

// ============================================
// Statistics Schemas
// ============================================

/**
 * Schema for getting conversation stats
 */
export const getConversationStatsSchema = z.object({
  params: z.object({
    conversationId: z.string().min(1, 'Conversation ID is required'),
  }),
});
