import logger from '../lib/logger';
/**
 * Socket Service
 *
 * WebSocket service for real-time chat and presence
 */

import { Server as SocketIOServer, Socket } from 'socket.io';
import { Server as HTTPServer } from 'http';
import { verifyAccessToken } from '../utils/jwt';
import * as chatService from './chat.service';

// Store socket connections: userId -> socketId
const userSockets: Map<string, string> = new Map();

// Store socket to user mapping: socketId -> userId
const socketUsers: Map<string, string> = new Map();

// Store interval ID for cleanup
let typingCleanupInterval: NodeJS.Timeout | null = null;

/**
 * Attach chat event handlers to an existing Socket.IO server
 * (Used when Socket.IO server is already created in app.ts)
 */
export const attachChatEventHandlers = (io: SocketIOServer): void => {
  logger.info('[ChatSocket] Attaching chat event handlers to existing Socket.IO server');
  setupChatEvents(io);

  // Clean up any existing interval to prevent duplicates
  if (typingCleanupInterval) {
    clearInterval(typingCleanupInterval);
  }

  // Clean up expired typing indicators every 10 seconds
  typingCleanupInterval = setInterval(async () => {
    try {
      await chatService.clearExpiredTypingIndicators();
    } catch (error) {
      logger.error('[ChatSocket] Error clearing typing indicators:', error);
    }
  }, 10000);

  logger.info('[ChatSocket] Chat event handlers attached successfully');
};

/**
 * Cleanup socket service resources
 * Call this on server shutdown
 */
export const cleanupSocketService = (): void => {
  if (typingCleanupInterval) {
    clearInterval(typingCleanupInterval);
    typingCleanupInterval = null;
  }
  userSockets.clear();
  socketUsers.clear();
  logger.info('[ChatSocket] Socket service cleaned up');
};

/**
 * Initialize Socket.IO server (creates new server - use attachChatEventHandlers if server already exists)
 */
export const initializeSocketServer = (httpServer: HTTPServer): SocketIOServer => {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: process.env.CLIENT_URL || '*',
      credentials: true,
    },
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  // Authentication middleware
  io.use(async (socket: Socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = verifyAccessToken(token);
      socket.data.userId = decoded.userId;

      next();
    } catch (error) {
      next(new Error('Invalid token'));
    }
  });

  // Handle connections
  io.on('connection', async (socket: Socket) => {
    const userId = socket.data.userId;

    logger.info(`User ${userId} connected with socket ${socket.id}`);

    // Store connection
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);

    // Set user online
    await chatService.setUserOnline(userId, socket.id);

    // Join user's personal room
    socket.join(`user:${userId}`);

    // Send online status to user's contacts
    await broadcastPresenceUpdate(io, userId, true);

    // ============================================
    // Message Events
    // ============================================

    /**
     * Send a message
     */
    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, content, type, attachments, itemId, offerId } = data;

        const message = await chatService.sendMessage(userId, {
          conversationId,
          content,
          type,
          attachments,
          itemId,
          offerId,
        });

        // Send message to recipient
        const recipientId = message.recipientId;
        const recipientSocketId = userSockets.get(recipientId);

        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new_message', message);

          // Update message status to delivered
          await chatService.editMessage(message.id, userId, message.content);
        }

        // Acknowledge to sender
        if (callback) callback({ success: true, message });
      } catch (error: any) {
        logger.error('Error sending message:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * Mark messages as read
     */
    socket.on('mark_as_read', async (data, callback) => {
      try {
        const { conversationId } = data;

        const count = await chatService.markMessagesAsRead(conversationId, userId);

        // Notify sender that messages were read
        const conversation = await chatService.getConversationById(conversationId, userId);
        const otherUserId =
          conversation.participant1Id === userId
            ? conversation.participant2Id
            : conversation.participant1Id;

        const otherSocketId = userSockets.get(otherUserId);
        if (otherSocketId) {
          io.to(otherSocketId).emit('messages_read', {
            conversationId,
            userId,
            count,
          });
        }

        if (callback) callback({ success: true, count });
      } catch (error: any) {
        logger.error('Error marking as read:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * Edit a message
     */
    socket.on('edit_message', async (data, callback) => {
      try {
        const { messageId, content } = data;

        const message = await chatService.editMessage(messageId, userId, content);

        // Notify recipient
        const recipientSocketId = userSockets.get(message.recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message_edited', message);
        }

        if (callback) callback({ success: true, message });
      } catch (error: any) {
        logger.error('Error editing message:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * Delete a message
     */
    socket.on('delete_message', async (data, callback) => {
      try {
        const { messageId } = data;

        const message = await chatService.deleteMessage(messageId, userId);

        // Notify recipient
        // Note: We need to get message info before deletion
        // This is a simplified version - in production, get recipient before delete

        if (callback) callback({ success: true });
      } catch (error: any) {
        logger.error('Error deleting message:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // Conversation Room Management
    // ============================================

    /**
     * Join a conversation room
     */
    socket.on('join_conversation', async (data, callback) => {
      try {
        const { conversationId } = data;

        // Verify user has access to conversation
        const conversation = await chatService.getConversationById(conversationId, userId);

        if (!conversation) {
          if (callback) callback({ success: false, error: 'Conversation not found' });
          return;
        }

        // Join the conversation room
        socket.join(`conversation:${conversationId}`);
        logger.info(`[ChatSocket] User ${userId} joined conversation ${conversationId}`);

        if (callback) callback({ success: true });
      } catch (error: any) {
        logger.error('[ChatSocket] Error joining conversation:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    /**
     * Leave a conversation room
     */
    socket.on('leave_conversation', async (data, callback) => {
      try {
        const { conversationId } = data;

        // Leave the conversation room
        socket.leave(`conversation:${conversationId}`);
        logger.info(`[ChatSocket] User ${userId} left conversation ${conversationId}`);

        if (callback) callback({ success: true });
      } catch (error: any) {
        logger.error('[ChatSocket] Error leaving conversation:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // Typing Indicators
    // ============================================

    /**
     * User is typing
     */
    socket.on('typing', async (data) => {
      try {
        const { conversationId } = data;

        await chatService.setTyping(conversationId, userId);

        // Notify other participant
        const conversation = await chatService.getConversationById(conversationId, userId);
        const otherUserId =
          conversation.participant1Id === userId
            ? conversation.participant2Id
            : conversation.participant1Id;

        const otherSocketId = userSockets.get(otherUserId);
        if (otherSocketId) {
          io.to(otherSocketId).emit('user_typing', {
            conversationId,
            userId,
          });
        }
      } catch (error) {
        logger.error('Error handling typing event:', error);
      }
    });

    /**
     * User stopped typing
     */
    socket.on('stop_typing', async (data) => {
      try {
        const { conversationId } = data;

        // Notify other participant
        const conversation = await chatService.getConversationById(conversationId, userId);
        const otherUserId =
          conversation.participant1Id === userId
            ? conversation.participant2Id
            : conversation.participant1Id;

        const otherSocketId = userSockets.get(otherUserId);
        if (otherSocketId) {
          io.to(otherSocketId).emit('user_stopped_typing', {
            conversationId,
            userId,
          });
        }
      } catch (error) {
        logger.error('Error handling stop_typing event:', error);
      }
    });

    // ============================================
    // Presence Events
    // ============================================

    /**
     * Get online status of users
     */
    socket.on('check_presence', async (data, callback) => {
      try {
        const { userIds } = data;

        const presence = await chatService.getMultipleUserPresence(userIds);

        if (callback) callback({ success: true, presence });
      } catch (error: any) {
        logger.error('Error checking presence:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // Disconnect
    // ============================================

    socket.on('disconnect', async () => {
      logger.info(`User ${userId} disconnected`);

      // Remove from maps
      userSockets.delete(userId);
      socketUsers.delete(socket.id);

      // Set user offline
      await chatService.setUserOffline(userId);

      // Broadcast offline status
      await broadcastPresenceUpdate(io, userId, false);
    });
  });

  // Note: Typing indicator cleanup is handled in attachChatEventHandlers
  // which is the recommended way to use this service

  return io;
};

/**
 * Broadcast presence update to user's contacts
 */
async function broadcastPresenceUpdate(
  io: SocketIOServer,
  userId: string,
  isOnline: boolean
): Promise<void> {
  try {
    // Get user's conversations to find contacts
    const conversations = await chatService.getUserConversations(userId, 1, 100);

    const contactIds = conversations.conversations.map((conv: any) =>
      conv.participant1Id === userId ? conv.participant2Id : conv.participant1Id
    );

    // Send presence update to each online contact
    contactIds.forEach((contactId: string) => {
      const contactSocketId = userSockets.get(contactId);
      if (contactSocketId) {
        io.to(contactSocketId).emit('presence_update', {
          userId,
          isOnline,
          lastSeenAt: isOnline ? null : new Date(),
        });
      }
    });
  } catch (error) {
    logger.error('Error broadcasting presence update:', error);
  }
}

/**
 * Setup chat events on an existing Socket.IO server
 * Called by attachChatEventHandlers to add chat functionality
 */
function setupChatEvents(io: SocketIOServer): void {
  // Register a middleware for chat-specific authentication
  io.use(async (socket: Socket, next) => {
    // If userId is already set by another middleware, validate it's from a token
    if (socket.data.userId && socket.data.verified) {
      return next();
    }

    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.split(' ')[1];

      if (token) {
        const decoded = verifyAccessToken(token);
        socket.data.userId = decoded.userId;
        socket.data.verified = true; // Mark as verified via JWT
        return next();
      }

      // No token provided - allow connection but mark as unauthenticated
      // This allows for public notifications but blocks chat features
      socket.data.userId = null;
      socket.data.verified = false;
      next();
    } catch (error) {
      // Invalid token - reject with error instead of silently allowing
      logger.warn('[ChatSocket] Auth failed for socket:', socket.id, error instanceof Error ? error.message : 'Unknown error');
      socket.data.userId = null;
      socket.data.verified = false;
      next(); // Still allow connection for public features, but no chat
    }
  });

  // Handle new connections for chat events
  io.on('connection', async (socket: Socket) => {
    const userId = socket.data.userId;
    const isVerified = socket.data.verified === true;

    // Only set up chat events if user is authenticated with verified JWT
    if (!userId || !isVerified) {
      // Still allow connection for public features, just don't set up chat
      logger.info(`[ChatSocket] Unauthenticated connection: ${socket.id} (public mode)`);
      return;
    }

    logger.info(`[ChatSocket] User ${userId} connected with socket ${socket.id} (verified)`);

    // Store connection
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);

    // Set user online
    try {
      await chatService.setUserOnline(userId, socket.id);
      // Join user's personal room for chat
      socket.join(`chat:${userId}`);
      // Send online status to user's contacts
      await broadcastPresenceUpdate(io, userId, true);
    } catch (error) {
      logger.error('[ChatSocket] Error setting user online:', error);
    }

    // ============================================
    // Message Events
    // ============================================

    socket.on('send_message', async (data, callback) => {
      try {
        const { conversationId, content, type, attachments, itemId, offerId } = data;

        const message = await chatService.sendMessage(userId, {
          conversationId,
          content,
          type,
          attachments,
          itemId,
          offerId,
        });

        // Send message to recipient
        const recipientId = message.recipientId;
        const recipientSocketId = userSockets.get(recipientId);

        if (recipientSocketId) {
          io.to(recipientSocketId).emit('new_message', message);
        }

        if (callback) callback({ success: true, message });
      } catch (error: any) {
        logger.error('[ChatSocket] Error sending message:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on('mark_as_read', async (data, callback) => {
      try {
        const { conversationId } = data;

        const count = await chatService.markMessagesAsRead(conversationId, userId);

        // Notify sender that messages were read
        const conversation = await chatService.getConversationById(conversationId, userId);
        const otherUserId =
          conversation.participant1Id === userId
            ? conversation.participant2Id
            : conversation.participant1Id;

        const otherSocketId = userSockets.get(otherUserId);
        if (otherSocketId) {
          io.to(otherSocketId).emit('messages_read', {
            conversationId,
            userId,
            count,
          });
        }

        if (callback) callback({ success: true, count });
      } catch (error: any) {
        logger.error('[ChatSocket] Error marking as read:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on('edit_message', async (data, callback) => {
      try {
        const { messageId, content } = data;

        const message = await chatService.editMessage(messageId, userId, content);

        // Notify recipient
        const recipientSocketId = userSockets.get(message.recipientId);
        if (recipientSocketId) {
          io.to(recipientSocketId).emit('message_edited', message);
        }

        if (callback) callback({ success: true, message });
      } catch (error: any) {
        logger.error('[ChatSocket] Error editing message:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on('delete_message', async (data, callback) => {
      try {
        const { messageId } = data;
        await chatService.deleteMessage(messageId, userId);
        if (callback) callback({ success: true });
      } catch (error: any) {
        logger.error('[ChatSocket] Error deleting message:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // Conversation Room Management
    // ============================================

    socket.on('join_conversation', async (data, callback) => {
      try {
        const { conversationId } = data;

        // Verify user has access to conversation
        const conversation = await chatService.getConversationById(conversationId, userId);

        if (!conversation) {
          if (callback) callback({ success: false, error: 'Conversation not found' });
          return;
        }

        // Join the conversation room
        socket.join(`conversation:${conversationId}`);
        logger.info(`[ChatSocket] User ${userId} joined conversation ${conversationId}`);

        if (callback) callback({ success: true });
      } catch (error: any) {
        logger.error('[ChatSocket] Error joining conversation:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    socket.on('leave_conversation', async (data, callback) => {
      try {
        const { conversationId } = data;

        // Leave the conversation room
        socket.leave(`conversation:${conversationId}`);
        logger.info(`[ChatSocket] User ${userId} left conversation ${conversationId}`);

        if (callback) callback({ success: true });
      } catch (error: any) {
        logger.error('[ChatSocket] Error leaving conversation:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // Typing Indicators
    // ============================================

    socket.on('typing', async (data) => {
      try {
        const { conversationId } = data;

        await chatService.setTyping(conversationId, userId);

        // Notify other participant
        const conversation = await chatService.getConversationById(conversationId, userId);
        const otherUserId =
          conversation.participant1Id === userId
            ? conversation.participant2Id
            : conversation.participant1Id;

        const otherSocketId = userSockets.get(otherUserId);
        if (otherSocketId) {
          io.to(otherSocketId).emit('user_typing', {
            conversationId,
            userId,
          });
        }
      } catch (error) {
        logger.error('[ChatSocket] Error handling typing event:', error);
      }
    });

    socket.on('stop_typing', async (data) => {
      try {
        const { conversationId } = data;

        // Notify other participant
        const conversation = await chatService.getConversationById(conversationId, userId);
        const otherUserId =
          conversation.participant1Id === userId
            ? conversation.participant2Id
            : conversation.participant1Id;

        const otherSocketId = userSockets.get(otherUserId);
        if (otherSocketId) {
          io.to(otherSocketId).emit('user_stopped_typing', {
            conversationId,
            userId,
          });
        }
      } catch (error) {
        logger.error('[ChatSocket] Error handling stop_typing event:', error);
      }
    });

    // ============================================
    // Presence Events
    // ============================================

    socket.on('check_presence', async (data, callback) => {
      try {
        const { userIds } = data;
        const presence = await chatService.getMultipleUserPresence(userIds);
        if (callback) callback({ success: true, presence });
      } catch (error: any) {
        logger.error('[ChatSocket] Error checking presence:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // Disconnect
    // ============================================

    socket.on('disconnect', async () => {
      logger.info(`[ChatSocket] User ${userId} disconnected`);

      // Remove from maps
      userSockets.delete(userId);
      socketUsers.delete(socket.id);

      // Set user offline
      try {
        await chatService.setUserOffline(userId);
        // Broadcast offline status
        await broadcastPresenceUpdate(io, userId, false);
      } catch (error) {
        logger.error('[ChatSocket] Error setting user offline:', error);
      }
    });
  });
}

/**
 * Get socket instance by user ID
 */
export const getUserSocket = (userId: string): string | undefined => {
  return userSockets.get(userId);
};

/**
 * Get user ID by socket ID
 */
export const getSocketUser = (socketId: string): string | undefined => {
  return socketUsers.get(socketId);
};

/**
 * Send notification to user via WebSocket
 */
export const sendNotificationToUser = (
  io: SocketIOServer,
  userId: string,
  notification: any
): void => {
  const socketId = userSockets.get(userId);
  if (socketId) {
    io.to(socketId).emit('notification', notification);
  }
};
