import apiClient from './client';

// ============================================
// Types
// ============================================

export interface AIConversation {
  id: string;
  userId: string;
  title?: string;
  context?: string;
  status: 'ACTIVE' | 'CLOSED' | 'ARCHIVED';
  relatedItemId?: string;
  relatedOfferId?: string;
  messageCount: number;
  createdAt: string;
  updatedAt: string;
  lastMessageAt?: string;
  messages?: AIMessage[];
}

export interface AIMessage {
  id: string;
  conversationId: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  metadata?: any;
  model?: string;
  tokens?: number;
  confidence?: number;
  suggestedItems: string[];
  suggestedAction?: string;
  createdAt: string;
}

export interface QuickSuggestions {
  suggestions: string[];
  recentItems: string[];
}

// ============================================
// API Functions
// ============================================

export const createConversation = async (data?: {
  context?: string;
  relatedItemId?: string;
}) => {
  const response = await apiClient.post('/ai-assistant/conversations', data);
  return response.data;
};

export const getConversations = async (page = 1, limit = 20) => {
  const response = await apiClient.get('/ai-assistant/conversations', {
    params: { page, limit },
  });
  return response.data;
};

export const getConversation = async (id: string) => {
  const response = await apiClient.get(`/ai-assistant/conversations/${id}`);
  return response.data;
};

export const sendMessage = async (conversationId: string, content: string) => {
  const response = await apiClient.post(
    `/ai-assistant/conversations/${conversationId}/messages`,
    { content }
  );
  return response.data;
};

export const closeConversation = async (id: string) => {
  const response = await apiClient.post(`/ai-assistant/conversations/${id}/close`);
  return response.data;
};

export const archiveConversation = async (id: string) => {
  const response = await apiClient.post(`/ai-assistant/conversations/${id}/archive`);
  return response.data;
};

export const getQuickSuggestions = async () => {
  const response = await apiClient.get('/ai-assistant/suggestions');
  return response.data;
};
