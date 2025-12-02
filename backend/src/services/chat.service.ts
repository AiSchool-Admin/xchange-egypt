/**
 * Chat Service
 *
 * Business logic for real-time messaging and chat conversations
 */

import prisma from '../config/database';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import { createNotification } from './notification.service';

// ============================================
// Types
// ============================================

export type MessageType = 'TEXT' | 'IMAGE' | 'FILE' | 'ITEM' | 'OFFER' | 'SYSTEM';
export type MessageStatus = 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';

export interface CreateConversationInput {
  participant2Id: string;
  itemId?: string;
  transactionId?: string;
}

export interface SendMessageInput {
  conversationId: string;
  content: string;
  type?: MessageType;
  attachments?: string[];
  itemId?: string;
  offerId?: string;
}

export interface GetMessagesFilters {
  conversationId: string;
  page?: number;
  limit?: number;
  before?: Date;
  after?: Date;
}

// ============================================
// Conversation Management
// ============================================

/**
 * Get or create a conversation between two users
 */
export const getOrCreateConversation = async (
  participant1Id: string,
  participant2Id: string,
  itemId?: string,
  transactionId?: string
): Promise<any> => {
  // Users can't chat with themselves
  if (participant1Id === participant2Id) {
    throw new BadRequestError('Cannot create conversation with yourself');
  }

  // Check if users are blocked
  const isBlocked = await isUserBlocked(participant1Id, participant2Id);
  if (isBlocked) {
    throw new ForbiddenError('Cannot create conversation with this user');
  }

  // Order participants to ensure uniqueness (p1 < p2 alphabetically)
  const [p1, p2] = [participant1Id, participant2Id].sort();

  // Try to find existing conversation
  let conversation = await prisma.conversation.findUnique({
    where: {
      participant1Id_participant2Id: {
        participant1Id: p1,
        participant2Id: p2,
      },
    },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!conversation) {
    // Create new conversation
    conversation = await prisma.conversation.create({
      data: {
        participant1Id: p1,
        participant2Id: p2,
        itemId,
        transactionId,
      },
      include: {
        messages: true,
      },
    });
  }

  return conversation;
};

/**
 * Get user's conversations
 */
export const getUserConversations = async (
  userId: string,
  page: number = 1,
  limit: number = 20
): Promise<any> => {
  const skip = (page - 1) * limit;

  const [conversations, total] = await Promise.all([
    prisma.conversation.findMany({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
      skip,
      take: limit,
      orderBy: {
        lastMessageAt: 'desc',
      },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            content: true,
            type: true,
            senderId: true,
            createdAt: true,
            isRead: true,
          },
        },
      },
    }),

    prisma.conversation.count({
      where: {
        OR: [
          { participant1Id: userId },
          { participant2Id: userId },
        ],
      },
    }),
  ]);

  // Get other participant info for each conversation
  const conversationsWithParticipant = await Promise.all(
    conversations.map(async (conv) => {
      const otherParticipantId =
        conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id;

      const participant = await prisma.user.findUnique({
        where: { id: otherParticipantId },
        select: {
          id: true,
          fullName: true,
          avatar: true,
          userType: true,
        },
      });

      const unreadCount =
        conv.participant1Id === userId ? conv.unreadCount1 : conv.unreadCount2;

      return {
        ...conv,
        participant,
        unreadCount,
      };
    })
  );

  return {
    conversations: conversationsWithParticipant,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get conversation by ID
 */
export const getConversationById = async (
  conversationId: string,
  userId: string
): Promise<any> => {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      messages: {
        take: 50,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  // Check if user is a participant
  if (
    conversation.participant1Id !== userId &&
    conversation.participant2Id !== userId
  ) {
    throw new ForbiddenError('Not authorized to access this conversation');
  }

  return conversation;
};

/**
 * Delete conversation
 */
export const deleteConversation = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  const conversation = await getConversationById(conversationId, userId);

  await prisma.conversation.delete({
    where: { id: conversationId },
  });
};

// ============================================
// Message Management
// ============================================

/**
 * Send a message
 */
export const sendMessage = async (
  senderId: string,
  input: SendMessageInput
): Promise<any> => {
  const { conversationId, content, type = 'TEXT', attachments, itemId, offerId } = input;

  // Get conversation and verify sender is a participant
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  });

  if (!conversation) {
    throw new NotFoundError('Conversation not found');
  }

  if (
    conversation.participant1Id !== senderId &&
    conversation.participant2Id !== senderId
  ) {
    throw new ForbiddenError('Not authorized to send messages in this conversation');
  }

  // Determine recipient
  const recipientId =
    conversation.participant1Id === senderId
      ? conversation.participant2Id
      : conversation.participant1Id;

  // Check if users are blocked
  const isBlocked = await isUserBlocked(senderId, recipientId);
  if (isBlocked) {
    throw new ForbiddenError('Cannot send message to this user');
  }

  // Create message
  const message = await prisma.$transaction(async (tx) => {
    const newMessage = await tx.message.create({
      data: {
        conversationId,
        senderId,
        recipientId,
        content,
        type,
        attachments: attachments || [],
        itemId,
        offerId,
      },
    });

    // Update conversation
    const updateData: any = {
      lastMessageAt: new Date(),
      lastMessageText: type === 'TEXT' ? content.substring(0, 100) : `[${type}]`,
    };

    // Increment unread count for recipient
    if (conversation.participant1Id === recipientId) {
      updateData.unreadCount1 = { increment: 1 };
    } else {
      updateData.unreadCount2 = { increment: 1 };
    }

    await tx.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    return newMessage;
  });

  // Send notification to recipient about new message
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    select: { fullName: true },
  });

  const senderName = sender?.fullName || 'مستخدم';
  const messagePreview = type === 'TEXT'
    ? content.substring(0, 50) + (content.length > 50 ? '...' : '')
    : `[${type === 'IMAGE' ? 'صورة' : type === 'FILE' ? 'ملف' : type === 'ITEM' ? 'سلعة' : 'رسالة'}]`;

  await createNotification({
    userId: recipientId,
    type: 'SYSTEM_ANNOUNCEMENT', // Using available type for messages
    title: `رسالة جديدة من ${senderName}`,
    message: messagePreview,
    priority: 'MEDIUM',
    entityType: 'CONVERSATION',
    entityId: conversationId,
    actionUrl: `/messages/${conversationId}`,
    actionText: 'عرض الرسالة',
  });

  return message;
};

/**
 * Get messages in a conversation
 */
export const getMessages = async (
  userId: string,
  filters: GetMessagesFilters
): Promise<any> => {
  const { conversationId, page = 1, limit = 50, before, after } = filters;

  // Verify user is a participant
  await getConversationById(conversationId, userId);

  const skip = (page - 1) * limit;

  // Build where clause
  const where: any = {
    conversationId,
    isDeleted: false,
  };

  if (before) {
    where.createdAt = { lt: before };
  }

  if (after) {
    where.createdAt = { ...where.createdAt, gt: after };
  }

  const [messages, total] = await Promise.all([
    prisma.message.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),

    prisma.message.count({ where }),
  ]);

  return {
    messages: messages.reverse(), // Oldest first
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  conversationId: string,
  userId: string
): Promise<number> => {
  // Verify user is a participant
  const conversation = await getConversationById(conversationId, userId);

  // Update unread messages
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.message.updateMany({
      where: {
        conversationId,
        recipientId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
        status: 'READ',
      },
    });

    // Reset unread count for this user
    const updateData =
      conversation.participant1Id === userId
        ? { unreadCount1: 0 }
        : { unreadCount2: 0 };

    await tx.conversation.update({
      where: { id: conversationId },
      data: updateData,
    });

    return updated.count;
  });

  return result;
};

/**
 * Edit a message
 */
export const editMessage = async (
  messageId: string,
  userId: string,
  content: string
): Promise<any> => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new NotFoundError('Message not found');
  }

  if (message.senderId !== userId) {
    throw new ForbiddenError('Can only edit your own messages');
  }

  if (message.isDeleted) {
    throw new BadRequestError('Cannot edit deleted message');
  }

  const updated = await prisma.message.update({
    where: { id: messageId },
    data: {
      content,
      isEdited: true,
      editedAt: new Date(),
    },
  });

  return updated;
};

/**
 * Delete a message
 */
export const deleteMessage = async (
  messageId: string,
  userId: string
): Promise<void> => {
  const message = await prisma.message.findUnique({
    where: { id: messageId },
  });

  if (!message) {
    throw new NotFoundError('Message not found');
  }

  if (message.senderId !== userId) {
    throw new ForbiddenError('Can only delete your own messages');
  }

  await prisma.message.update({
    where: { id: messageId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
};

// ============================================
// Typing Indicators
// ============================================

/**
 * Set typing indicator
 */
export const setTyping = async (
  conversationId: string,
  userId: string
): Promise<void> => {
  const expiresAt = new Date(Date.now() + 5000); // 5 seconds

  await prisma.typingIndicator.upsert({
    where: {
      conversationId_userId: {
        conversationId,
        userId,
      },
    },
    create: {
      conversationId,
      userId,
      expiresAt,
    },
    update: {
      expiresAt,
    },
  });
};

/**
 * Get typing users in conversation
 */
export const getTypingUsers = async (conversationId: string): Promise<string[]> => {
  const indicators = await prisma.typingIndicator.findMany({
    where: {
      conversationId,
      expiresAt: { gt: new Date() },
    },
    select: {
      userId: true,
    },
  });

  return indicators.map((i) => i.userId);
};

/**
 * Clear expired typing indicators
 */
export const clearExpiredTypingIndicators = async (): Promise<void> => {
  await prisma.typingIndicator.deleteMany({
    where: {
      expiresAt: { lte: new Date() },
    },
  });
};

// ============================================
// User Presence
// ============================================

/**
 * Set user online
 */
export const setUserOnline = async (
  userId: string,
  socketId: string
): Promise<void> => {
  await prisma.userPresence.upsert({
    where: { userId },
    create: {
      userId,
      isOnline: true,
      lastSeenAt: new Date(),
      socketId,
    },
    update: {
      isOnline: true,
      lastSeenAt: new Date(),
      socketId,
    },
  });
};

/**
 * Set user offline
 */
export const setUserOffline = async (userId: string): Promise<void> => {
  await prisma.userPresence.update({
    where: { userId },
    data: {
      isOnline: false,
      lastSeenAt: new Date(),
      socketId: null,
    },
  });
};

/**
 * Get user presence
 */
export const getUserPresence = async (userId: string): Promise<any> => {
  const presence = await prisma.userPresence.findUnique({
    where: { userId },
  });

  return presence || { isOnline: false, lastSeenAt: null };
};

/**
 * Get multiple users presence
 */
export const getMultipleUserPresence = async (
  userIds: string[]
): Promise<Record<string, any>> => {
  const presences = await prisma.userPresence.findMany({
    where: {
      userId: { in: userIds },
    },
  });

  const presenceMap: Record<string, any> = {};
  presences.forEach((p) => {
    presenceMap[p.userId] = {
      isOnline: p.isOnline,
      lastSeenAt: p.lastSeenAt,
    };
  });

  // Add offline status for users not in database
  userIds.forEach((id) => {
    if (!presenceMap[id]) {
      presenceMap[id] = { isOnline: false, lastSeenAt: null };
    }
  });

  return presenceMap;
};

// ============================================
// Blocking
// ============================================

/**
 * Block a user
 */
export const blockUser = async (
  userId: string,
  blockedUserId: string,
  reason?: string
): Promise<any> => {
  if (userId === blockedUserId) {
    throw new BadRequestError('Cannot block yourself');
  }

  const blocked = await prisma.blockedUser.create({
    data: {
      userId,
      blockedUserId,
      reason,
    },
  });

  return blocked;
};

/**
 * Unblock a user
 */
export const unblockUser = async (
  userId: string,
  blockedUserId: string
): Promise<void> => {
  await prisma.blockedUser.deleteMany({
    where: {
      userId,
      blockedUserId,
    },
  });
};

/**
 * Get blocked users
 */
export const getBlockedUsers = async (userId: string): Promise<any[]> => {
  const blocked = await prisma.blockedUser.findMany({
    where: { userId },
  });

  return blocked;
};

/**
 * Check if user is blocked
 */
export const isUserBlocked = async (
  userId: string,
  otherUserId: string
): Promise<boolean> => {
  const blocked = await prisma.blockedUser.findFirst({
    where: {
      OR: [
        { userId, blockedUserId: otherUserId },
        { userId: otherUserId, blockedUserId: userId },
      ],
    },
  });

  return !!blocked;
};

// ============================================
// Statistics
// ============================================

/**
 * Get unread message count
 */
export const getUnreadCount = async (userId: string): Promise<number> => {
  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { participant1Id: userId },
        { participant2Id: userId },
      ],
    },
    select: {
      participant1Id: true,
      participant2Id: true,
      unreadCount1: true,
      unreadCount2: true,
    },
  });

  let totalUnread = 0;
  conversations.forEach((conv) => {
    if (conv.participant1Id === userId) {
      totalUnread += conv.unreadCount1;
    } else {
      totalUnread += conv.unreadCount2;
    }
  });

  return totalUnread;
};

/**
 * Get conversation statistics
 */
export const getConversationStats = async (conversationId: string): Promise<any> => {
  const [totalMessages, unreadMessages, participants] = await Promise.all([
    prisma.message.count({
      where: { conversationId, isDeleted: false },
    }),

    prisma.message.count({
      where: { conversationId, isRead: false, isDeleted: false },
    }),

    prisma.conversation.findUnique({
      where: { id: conversationId },
      select: {
        participant1Id: true,
        participant2Id: true,
      },
    }),
  ]);

  return {
    totalMessages,
    unreadMessages,
    participants: participants
      ? [participants.participant1Id, participants.participant2Id]
      : [],
  };
};
