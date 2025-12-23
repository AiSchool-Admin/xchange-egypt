/**
 * AI Board of Directors API Client
 * واجهة برمجة التطبيقات لمجلس إدارة AI
 *
 * ⚠️ جميع الطلبات تتطلب مصادقة المؤسس
 */

import { founderFetch } from './founder';

// ============================================
// Types
// ============================================

export type BoardRole = 'CEO' | 'CTO' | 'CFO' | 'CMO' | 'COO' | 'CLO';
export type CEOMode = 'LEADER' | 'STRATEGIST' | 'VISIONARY';
export type ConversationType = 'MEETING' | 'QUESTION' | 'TASK_DISCUSSION' | 'BRAINSTORM' | 'REVIEW';
export type ConversationStatus = 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';

export interface BoardMember {
  id: string;
  name: string;
  nameAr: string;
  role: BoardRole;
  type: 'AI' | 'HUMAN' | 'HYBRID';
  model: 'OPUS' | 'SONNET' | 'HAIKU';
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE';
  personality?: {
    traits?: string[];
    expertise?: string[];
    description?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BoardMessage {
  id: string;
  conversationId: string;
  memberId?: string;
  userId?: string;
  role: 'USER' | 'ASSISTANT' | 'SYSTEM';
  content: string;
  contentAr?: string;
  model?: string;
  tokensUsed?: number;
  toolsUsed?: string[];
  ceoMode?: CEOMode;
  createdAt: string;
  member?: {
    id: string;
    name: string;
    nameAr: string;
    role: BoardRole;
  };
  user?: {
    id: string;
    fullName: string;
  };
}

export interface BoardConversation {
  id: string;
  type: ConversationType;
  topic: string;
  topicAr?: string;
  status: ConversationStatus;
  featuresUsed: string[];
  summary?: string;
  summaryAr?: string;
  messages?: BoardMessage[];
  founder?: {
    id: string;
    fullName: string;
    email: string;
    title: string;
  };
  _count?: {
    messages: number;
  };
  startedAt: string;
  endedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BoardMemberResponse {
  memberId: string;
  memberName: string;
  memberNameAr: string;
  memberRole: BoardRole;
  content: string;
  model: string;
  tokensUsed: number;
  toolsUsed: string[];
  ceoMode?: CEOMode;
}

export interface SendMessageResult {
  userMessage: BoardMessage;
  responses: BoardMemberResponse[];
}

export interface ServiceStatus {
  claude: {
    isConfigured: boolean;
    isAvailable: boolean;
    requestsThisMinute: number;
    maxRequestsPerMinute: number;
  };
  board: {
    initialized: boolean;
  };
}

// ============================================
// API Functions - تستخدم مصادقة المؤسس
// ============================================

/**
 * Get all board members
 */
export const getBoardMembers = async (): Promise<BoardMember[]> => {
  const response = await founderFetch('/board/members');
  return response.data;
};

/**
 * Get service status
 */
export const getServiceStatus = async (): Promise<ServiceStatus> => {
  const response = await founderFetch('/board/status');
  return response.data;
};

/**
 * Start a new conversation
 */
export const startConversation = async (data: {
  topic: string;
  topicAr?: string;
  type?: ConversationType;
  features?: string[];
}): Promise<BoardConversation> => {
  const response = await founderFetch('/board/conversations', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};

/**
 * Get founder's conversations
 */
export const getConversations = async (): Promise<BoardConversation[]> => {
  const response = await founderFetch('/board/conversations');
  return response.data;
};

/**
 * Get a specific conversation with messages
 */
export const getConversation = async (conversationId: string): Promise<BoardConversation> => {
  const response = await founderFetch(`/board/conversations/${conversationId}`);
  return response.data;
};

/**
 * Send message to board
 */
export const sendMessage = async (
  conversationId: string,
  data: {
    content: string;
    targetMemberIds?: string[];
    ceoMode?: CEOMode;
    features?: string[];
  }
): Promise<SendMessageResult> => {
  const response = await founderFetch(
    `/board/conversations/${conversationId}/messages`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response.data;
};

/**
 * End conversation and get summary
 */
export const endConversation = async (conversationId: string): Promise<BoardConversation> => {
  const response = await founderFetch(`/board/conversations/${conversationId}/end`, {
    method: 'POST',
  });
  return response.data;
};

/**
 * Ask a specific member directly (quick question)
 */
export const askMember = async (
  memberId: string,
  data: {
    question: string;
    ceoMode?: CEOMode;
  }
): Promise<{ conversationId: string; response: BoardMemberResponse }> => {
  const response = await founderFetch(`/board/members/${memberId}/ask`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};

/**
 * Initialize board members (admin only - uses different auth)
 * This is called by platform admins, not the founder
 */
export const initializeBoardMembers = async (): Promise<BoardMember[]> => {
  // This endpoint uses admin auth, not founder auth
  // It should be called from the admin dashboard
  throw new Error('يجب تهيئة أعضاء المجلس من لوحة تحكم المدير');
};

// ============================================
// Helper Functions
// ============================================

/**
 * Get role display name in Arabic
 */
export const getRoleDisplayName = (role: BoardRole): string => {
  const names: Record<BoardRole, string> = {
    CEO: 'الرئيس التنفيذي',
    CTO: 'المدير التقني',
    CFO: 'المدير المالي',
    CMO: 'مدير التسويق',
    COO: 'مدير العمليات',
    CLO: 'المستشار القانوني',
  };
  return names[role] || role;
};

/**
 * Get role color
 */
export const getRoleColor = (role: BoardRole): string => {
  const colors: Record<BoardRole, string> = {
    CEO: 'bg-purple-500',
    CTO: 'bg-blue-500',
    CFO: 'bg-green-500',
    CMO: 'bg-orange-500',
    COO: 'bg-yellow-500',
    CLO: 'bg-red-500',
  };
  return colors[role] || 'bg-gray-500';
};

/**
 * Get CEO mode display name
 */
export const getCEOModeDisplayName = (mode: CEOMode): string => {
  const names: Record<CEOMode, string> = {
    LEADER: 'القائد',
    STRATEGIST: 'الاستراتيجي',
    VISIONARY: 'صاحب الرؤية',
  };
  return names[mode] || mode;
};

/**
 * Get conversation type display name
 */
export const getConversationTypeDisplayName = (type: ConversationType): string => {
  const names: Record<ConversationType, string> = {
    MEETING: 'اجتماع',
    QUESTION: 'سؤال',
    TASK_DISCUSSION: 'مناقشة مهمة',
    BRAINSTORM: 'عصف ذهني',
    REVIEW: 'مراجعة',
  };
  return names[type] || type;
};
