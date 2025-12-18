// ============================================
// Chat API Service
// ============================================

import { apiClient } from './client';

export interface ChatMessage {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  type: 'text' | 'image' | 'file' | 'location';
  readAt?: string;
  createdAt: string;
}

export interface ChatRoom {
  id: string;
  participants: {
    id: string;
    firstName: string;
    lastName: string;
    avatar?: string;
  }[];
  lastMessage?: ChatMessage;
  unreadCount: number;
  bookingId?: string;
}

export interface ChatbotMessage {
  message: string;
  language: 'ar-EG' | 'en';
  context?: {
    userId?: string;
    location?: { lat: number; lng: number };
    previousMessages?: string[];
  };
}

export interface ChatbotResponse {
  message: string;
  suggestions?: string[];
  recommendations?: {
    id: string;
    title: string;
    titleAr: string;
    basePrice: number;
    rating: number;
    provider: {
      id: string;
      businessName: string;
      businessNameAr: string;
    };
  }[];
  intent?: string;
}

export const chatApi = {
  // Get chat rooms
  getChatRooms: async (): Promise<{ data: ChatRoom[] }> => {
    const response = await apiClient.get('/chat/rooms');
    return response.data;
  },

  // Get or create chat room
  getOrCreateRoom: async (params: {
    providerId?: string;
    customerId?: string;
    bookingId?: string;
  }): Promise<{ data: ChatRoom }> => {
    const response = await apiClient.post('/chat/rooms', params);
    return response.data;
  },

  // Get room messages
  getRoomMessages: async (
    roomId: string,
    params?: { limit?: number; before?: string }
  ): Promise<{ data: ChatMessage[]; hasMore: boolean }> => {
    const response = await apiClient.get(`/chat/rooms/${roomId}/messages`, { params });
    return response.data;
  },

  // Send message
  sendMessage: async (
    roomId: string,
    data: {
      content: string;
      type?: 'text' | 'image' | 'file' | 'location';
      metadata?: any;
    }
  ): Promise<{ data: ChatMessage }> => {
    const response = await apiClient.post(`/chat/rooms/${roomId}/messages`, data);
    return response.data;
  },

  // Mark messages as read
  markAsRead: async (roomId: string): Promise<void> => {
    await apiClient.post(`/chat/rooms/${roomId}/read`);
  },

  // Upload file for chat
  uploadChatFile: async (file: FormData): Promise<{ data: { url: string; type: string } }> => {
    const response = await apiClient.post('/chat/upload', file, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // AI Chatbot
  sendChatbotMessage: async (data: ChatbotMessage): Promise<{ data: ChatbotResponse }> => {
    const response = await apiClient.post('/chatbot/message', data);
    return response.data;
  },

  // Get chatbot conversation history
  getChatbotHistory: async (): Promise<{
    data: {
      id: string;
      messages: { role: 'user' | 'assistant'; content: string; timestamp: string }[];
    }[];
  }> => {
    const response = await apiClient.get('/chatbot/history');
    return response.data;
  },

  // Clear chatbot conversation
  clearChatbotHistory: async (): Promise<void> => {
    await apiClient.delete('/chatbot/history');
  },

  // Get typing status
  sendTypingStatus: async (roomId: string, isTyping: boolean): Promise<void> => {
    await apiClient.post(`/chat/rooms/${roomId}/typing`, { isTyping });
  },
};

export default chatApi;
