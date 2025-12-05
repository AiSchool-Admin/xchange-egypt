'use client';

import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId?: string;
  content: string;
  type?: 'TEXT' | 'IMAGE' | 'FILE' | 'ITEM' | 'OFFER' | 'SYSTEM';
  createdAt: string;
  read?: boolean;
  isRead?: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
  attachments?: string[];
  status?: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
}

interface MatchNotification {
  type: 'new_match' | 'updated_match';
  opportunityId: string;
  participantCount: number;
  averageMatchScore: number;
  participants: string[];
  timestamp: Date;
}

interface TypingEvent {
  conversationId: string;
  userId: string;
  userName?: string;
}

interface ReadEvent {
  conversationId: string;
  userId: string;
  messageIds?: string[];
}

interface PresenceEvent {
  userId: string;
  isOnline: boolean;
  lastSeenAt?: string;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  // Messaging
  sendMessage: (conversationId: string, content: string, type?: string) => void;
  editMessage: (messageId: string, content: string) => void;
  deleteMessage: (messageId: string) => void;
  markAsRead: (conversationId: string) => void;
  // Typing
  startTyping: (conversationId: string) => void;
  stopTyping: (conversationId: string) => void;
  // Presence
  checkPresence: (userIds: string[]) => void;
  // Conversations
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  // Event listeners
  onMessage: (callback: (message: Message) => void) => void;
  offMessage: (callback: (message: Message) => void) => void;
  onMessageEdited: (callback: (message: Message) => void) => void;
  offMessageEdited: (callback: (message: Message) => void) => void;
  onMessageDeleted: (callback: (data: { messageId: string; conversationId: string }) => void) => void;
  offMessageDeleted: (callback: (data: { messageId: string; conversationId: string }) => void) => void;
  onMessagesRead: (callback: (event: ReadEvent) => void) => void;
  offMessagesRead: (callback: (event: ReadEvent) => void) => void;
  onTyping: (callback: (event: TypingEvent) => void) => void;
  offTyping: (callback: (event: TypingEvent) => void) => void;
  onStopTyping: (callback: (event: TypingEvent) => void) => void;
  offStopTyping: (callback: (event: TypingEvent) => void) => void;
  onPresenceUpdate: (callback: (event: PresenceEvent) => void) => void;
  offPresenceUpdate: (callback: (event: PresenceEvent) => void) => void;
  onMatchFound: (callback: (notification: MatchNotification) => void) => void;
  offMatchFound: (callback: (notification: MatchNotification) => void) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'https://xchange-egypt-production.up.railway.app';

export const SocketProvider = ({ children }: { children: ReactNode }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Only connect if user is authenticated
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Create socket connection
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    const newSocket = io(WS_URL, {
      auth: {
        token,
        userId: user.id,
      },
      transports: ['websocket', 'polling'],
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('✅ Socket connected');
      setConnected(true);
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setConnected(false);
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setConnected(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [user]);

  // === MESSAGING ===
  const sendMessage = useCallback((conversationId: string, content: string, type: string = 'TEXT') => {
    if (!socket || !connected) {
      console.error('Socket not connected');
      return;
    }
    socket.emit('send_message', { conversationId, content, type });
  }, [socket, connected]);

  const editMessage = useCallback((messageId: string, content: string) => {
    if (!socket || !connected) return;
    socket.emit('edit_message', { messageId, content });
  }, [socket, connected]);

  const deleteMessage = useCallback((messageId: string) => {
    if (!socket || !connected) return;
    socket.emit('delete_message', { messageId });
  }, [socket, connected]);

  const markAsRead = useCallback((conversationId: string) => {
    if (!socket || !connected) return;
    socket.emit('mark_as_read', { conversationId });
  }, [socket, connected]);

  // === TYPING ===
  const startTyping = useCallback((conversationId: string) => {
    if (!socket || !connected) return;
    socket.emit('typing', { conversationId });
  }, [socket, connected]);

  const stopTyping = useCallback((conversationId: string) => {
    if (!socket || !connected) return;
    socket.emit('stop_typing', { conversationId });
  }, [socket, connected]);

  // === PRESENCE ===
  const checkPresence = useCallback((userIds: string[]) => {
    if (!socket || !connected) return;
    socket.emit('check_presence', { userIds });
  }, [socket, connected]);

  // === CONVERSATIONS ===
  const joinConversation = useCallback((conversationId: string) => {
    if (!socket || !connected) return;
    socket.emit('join_conversation', conversationId);
  }, [socket, connected]);

  const leaveConversation = useCallback((conversationId: string) => {
    if (!socket || !connected) return;
    socket.emit('leave_conversation', conversationId);
  }, [socket, connected]);

  // === EVENT LISTENERS ===
  const onMessage = useCallback((callback: (message: Message) => void) => {
    if (!socket) return;
    socket.on('new_message', callback);
  }, [socket]);

  const offMessage = useCallback((callback: (message: Message) => void) => {
    if (!socket) return;
    socket.off('new_message', callback);
  }, [socket]);

  const onMessageEdited = useCallback((callback: (message: Message) => void) => {
    if (!socket) return;
    socket.on('message_edited', callback);
  }, [socket]);

  const offMessageEdited = useCallback((callback: (message: Message) => void) => {
    if (!socket) return;
    socket.off('message_edited', callback);
  }, [socket]);

  const onMessageDeleted = useCallback((callback: (data: { messageId: string; conversationId: string }) => void) => {
    if (!socket) return;
    socket.on('message_deleted', callback);
  }, [socket]);

  const offMessageDeleted = useCallback((callback: (data: { messageId: string; conversationId: string }) => void) => {
    if (!socket) return;
    socket.off('message_deleted', callback);
  }, [socket]);

  const onMessagesRead = useCallback((callback: (event: ReadEvent) => void) => {
    if (!socket) return;
    socket.on('messages_read', callback);
  }, [socket]);

  const offMessagesRead = useCallback((callback: (event: ReadEvent) => void) => {
    if (!socket) return;
    socket.off('messages_read', callback);
  }, [socket]);

  const onTyping = useCallback((callback: (event: TypingEvent) => void) => {
    if (!socket) return;
    socket.on('user_typing', callback);
  }, [socket]);

  const offTyping = useCallback((callback: (event: TypingEvent) => void) => {
    if (!socket) return;
    socket.off('user_typing', callback);
  }, [socket]);

  const onStopTyping = useCallback((callback: (event: TypingEvent) => void) => {
    if (!socket) return;
    socket.on('user_stopped_typing', callback);
  }, [socket]);

  const offStopTyping = useCallback((callback: (event: TypingEvent) => void) => {
    if (!socket) return;
    socket.off('user_stopped_typing', callback);
  }, [socket]);

  const onPresenceUpdate = useCallback((callback: (event: PresenceEvent) => void) => {
    if (!socket) return;
    socket.on('presence_update', callback);
  }, [socket]);

  const offPresenceUpdate = useCallback((callback: (event: PresenceEvent) => void) => {
    if (!socket) return;
    socket.off('presence_update', callback);
  }, [socket]);

  const onMatchFound = useCallback((callback: (notification: MatchNotification) => void) => {
    if (!socket) return;
    socket.on('match:found', callback);
  }, [socket]);

  const offMatchFound = useCallback((callback: (notification: MatchNotification) => void) => {
    if (!socket) return;
    socket.off('match:found', callback);
  }, [socket]);

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        // Messaging
        sendMessage,
        editMessage,
        deleteMessage,
        markAsRead,
        // Typing
        startTyping,
        stopTyping,
        // Presence
        checkPresence,
        // Conversations
        joinConversation,
        leaveConversation,
        // Event listeners
        onMessage,
        offMessage,
        onMessageEdited,
        offMessageEdited,
        onMessageDeleted,
        offMessageDeleted,
        onMessagesRead,
        offMessagesRead,
        onTyping,
        offTyping,
        onStopTyping,
        offStopTyping,
        onPresenceUpdate,
        offPresenceUpdate,
        onMatchFound,
        offMatchFound,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

// Hook to use socket context
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
