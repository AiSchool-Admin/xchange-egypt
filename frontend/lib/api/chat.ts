import apiClient from './client';

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  content: string;
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'ITEM' | 'OFFER' | 'SYSTEM';
  attachments: string[];
  itemId?: string;
  offerId?: string;
  isRead: boolean;
  readAt?: string;
  isEdited: boolean;
  editedAt?: string;
  isDeleted: boolean;
  status: 'SENT' | 'DELIVERED' | 'READ' | 'FAILED';
  createdAt: string;
}

export interface Conversation {
  id: string;
  participant1Id: string;
  participant2Id: string;
  itemId?: string;
  transactionId?: string;
  lastMessageAt: string;
  lastMessageText?: string;
  unreadCount1: number;
  unreadCount2: number;
  participant?: {
    id: string;
    fullName: string;
    avatar?: string;
    userType: string;
  };
  unreadCount: number;
  messages?: Message[];
  createdAt: string;
}

export interface ConversationsResponse {
  success: boolean;
  data: {
    conversations: Conversation[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface MessagesResponse {
  success: boolean;
  data: {
    messages: Message[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Get or create conversation
export const getOrCreateConversation = async (
  participant2Id: string,
  itemId?: string,
  transactionId?: string
): Promise<{ success: boolean; data: Conversation }> => {
  const response = await apiClient.post('/chat/conversations', {
    participant2Id,
    itemId,
    transactionId,
  });
  return response.data;
};

// Get user's conversations
export const getConversations = async (params?: {
  page?: number;
  limit?: number;
}): Promise<ConversationsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`/chat/conversations?${queryParams.toString()}`);
  return response.data;
};

// Get conversation by ID
export const getConversationById = async (
  conversationId: string
): Promise<{ success: boolean; data: Conversation }> => {
  const response = await apiClient.get(`/chat/conversations/${conversationId}`);
  return response.data;
};

// Get messages in conversation
export const getMessages = async (
  conversationId: string,
  params?: {
    page?: number;
    limit?: number;
  }
): Promise<MessagesResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(
    `/chat/conversations/${conversationId}/messages?${queryParams.toString()}`
  );
  return response.data;
};

// Send a message
export const sendMessage = async (
  conversationId: string,
  content: string,
  type: 'TEXT' | 'IMAGE' | 'FILE' | 'ITEM' | 'OFFER' | 'SYSTEM' = 'TEXT',
  attachments?: string[],
  itemId?: string,
  offerId?: string
): Promise<{ success: boolean; data: Message }> => {
  const response = await apiClient.post('/chat/messages', {
    conversationId,
    content,
    type,
    attachments,
    itemId,
    offerId,
  });
  return response.data;
};

// Mark messages as read
export const markMessagesAsRead = async (
  conversationId: string
): Promise<{ success: boolean; data: { count: number } }> => {
  const response = await apiClient.post(`/chat/conversations/${conversationId}/read`);
  return response.data;
};

// Edit a message
export const editMessage = async (
  messageId: string,
  content: string
): Promise<{ success: boolean; data: Message }> => {
  const response = await apiClient.patch(`/chat/messages/${messageId}`, { content });
  return response.data;
};

// Delete a message
export const deleteMessage = async (messageId: string): Promise<void> => {
  await apiClient.delete(`/chat/messages/${messageId}`);
};

// Delete conversation
export const deleteConversation = async (conversationId: string): Promise<void> => {
  await apiClient.delete(`/chat/conversations/${conversationId}`);
};

// Get unread count
export const getUnreadCount = async (): Promise<{ count: number }> => {
  const response = await apiClient.get('/chat/unread-count');
  return response.data.data;
};

// Get user presence
export const getUserPresence = async (
  userId: string
): Promise<{ success: boolean; data: { isOnline: boolean; lastSeenAt: string | null } }> => {
  const response = await apiClient.get(`/chat/presence/${userId}`);
  return response.data;
};
