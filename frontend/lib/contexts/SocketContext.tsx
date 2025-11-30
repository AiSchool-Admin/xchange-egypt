'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  read: boolean;
}

interface MatchNotification {
  type: 'new_match' | 'updated_match';
  opportunityId: string;
  participantCount: number;
  averageMatchScore: number;
  participants: string[];
  timestamp: Date;
}

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  sendMessage: (conversationId: string, content: string) => void;
  joinConversation: (conversationId: string) => void;
  leaveConversation: (conversationId: string) => void;
  onMessage: (callback: (message: Message) => void) => void;
  offMessage: (callback: (message: Message) => void) => void;
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

  const sendMessage = (conversationId: string, content: string) => {
    if (!socket || !connected) {
      console.error('Socket not connected');
      return;
    }

    socket.emit('send_message', {
      conversationId,
      content,
    });
  };

  const joinConversation = (conversationId: string) => {
    if (!socket || !connected) return;

    socket.emit('join_conversation', conversationId);
    console.log(`Joined conversation: ${conversationId}`);
  };

  const leaveConversation = (conversationId: string) => {
    if (!socket || !connected) return;

    socket.emit('leave_conversation', conversationId);
    console.log(`Left conversation: ${conversationId}`);
  };

  const onMessage = (callback: (message: Message) => void) => {
    if (!socket) return;

    socket.on('new_message', callback);
  };

  const offMessage = (callback: (message: Message) => void) => {
    if (!socket) return;

    socket.off('new_message', callback);
  };

  const onMatchFound = (callback: (notification: MatchNotification) => void) => {
    if (!socket) return;

    socket.on('match:found', callback);
    console.log('🔔 Listening for match notifications');
  };

  const offMatchFound = (callback: (notification: MatchNotification) => void) => {
    if (!socket) return;

    socket.off('match:found', callback);
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        connected,
        sendMessage,
        joinConversation,
        leaveConversation,
        onMessage,
        offMessage,
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
