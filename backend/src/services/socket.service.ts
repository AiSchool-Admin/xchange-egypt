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

/**
 * Initialize Socket.IO server
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

    console.log(`User ${userId} connected with socket ${socket.id}`);

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
        console.error('Error sending message:', error);
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
        console.error('Error marking as read:', error);
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
        console.error('Error editing message:', error);
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
        console.error('Error deleting message:', error);
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
        console.error('Error handling typing event:', error);
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
        console.error('Error handling stop_typing event:', error);
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
        console.error('Error checking presence:', error);
        if (callback) callback({ success: false, error: error.message });
      }
    });

    // ============================================
    // Disconnect
    // ============================================

    socket.on('disconnect', async () => {
      console.log(`User ${userId} disconnected`);

      // Remove from maps
      userSockets.delete(userId);
      socketUsers.delete(socket.id);

      // Set user offline
      await chatService.setUserOffline(userId);

      // Broadcast offline status
      await broadcastPresenceUpdate(io, userId, false);
    });
  });

  // Clean up expired typing indicators every 10 seconds
  setInterval(async () => {
    await chatService.clearExpiredTypingIndicators();
  }, 10000);

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
    console.error('Error broadcasting presence update:', error);
  }
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
