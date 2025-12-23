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
  avatar?: string; // صورة العضو
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
  memberAvatar?: string;
  content: string;
  model: string;
  tokensUsed: number;
  toolsUsed: string[];
  ceoMode?: CEOMode;
  round?: number; // جولة العصف الذهني
}

export interface BrainstormRound {
  round: number;
  responses: BoardMemberResponse[];
}

export interface SendMessageResult {
  userMessage: BoardMessage;
  responses: BoardMemberResponse[];
  brainstormRounds?: BrainstormRound[]; // جولات العصف الذهني الإضافية
}

// نتيجة النقاش المنظم المتتابع
export interface StructuredDiscussionItem {
  sequence: number;
  response: BoardMemberResponse;
  respondingTo?: string;
  type: 'initial' | 'response' | 'question' | 'summary';
}

export interface StructuredDiscussionResult {
  userMessage: BoardMessage;
  discussion: StructuredDiscussionItem[];
  status: 'in_progress' | 'awaiting_decision' | 'decided';
}

// ملخص الرئيس التنفيذي
export interface CEOSummary {
  alternatives: string[];
  recommendation: string;
  risks: string[];
  nextSteps: string[];
}

// قرار المؤسس
export interface FounderDecisionResult {
  decision: BoardMessage;
  conversation: BoardConversation;
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
 * يدعم وضع العصف الذهني التفاعلي
 */
export const sendMessage = async (
  conversationId: string,
  data: {
    content: string;
    targetMemberIds?: string[];
    ceoMode?: CEOMode;
    features?: string[];
    enableBrainstorm?: boolean; // تفعيل العصف الذهني
    brainstormRounds?: number; // عدد الجولات (1-3)
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
 * Continue discussion - استمرار النقاش
 * يسمح للأعضاء بالتفاعل مع بعضهم البعض
 */
export const continueDiscussion = async (
  conversationId: string,
  data?: {
    prompt?: string;
    rounds?: number;
  }
): Promise<{ responses: BoardMemberResponse[] }> => {
  const response = await founderFetch(
    `/board/conversations/${conversationId}/continue`,
    {
      method: 'POST',
      body: JSON.stringify(data || {}),
    }
  );
  return response.data;
};

/**
 * Conduct structured sequential discussion - نقاش منظم متتابع
 * الأعضاء يردون بالتتابع حسب أهمية تخصصهم للموضوع
 */
export const conductStructuredDiscussion = async (
  conversationId: string,
  data: {
    content: string;
    maxResponders?: number;
  }
): Promise<StructuredDiscussionResult> => {
  const response = await founderFetch(
    `/board/conversations/${conversationId}/structured`,
    {
      method: 'POST',
      body: JSON.stringify(data),
    }
  );
  return response.data;
};

/**
 * Generate CEO summary with alternatives - ملخص الرئيس التنفيذي مع البدائل
 */
export const generateCEOSummary = async (
  conversationId: string
): Promise<CEOSummary> => {
  const response = await founderFetch(
    `/board/conversations/${conversationId}/ceo-summary`,
    {
      method: 'POST',
    }
  );
  return response.data;
};

/**
 * Record founder decision - تسجيل قرار المؤسس
 */
export const recordFounderDecision = async (
  conversationId: string,
  data: {
    decision: string;
    selectedAlternative?: string;
    notes?: string;
  }
): Promise<FounderDecisionResult> => {
  const response = await founderFetch(
    `/board/conversations/${conversationId}/decision`,
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

// ============================================
// GOVERNANCE Types - أنواع الحوكمة
// ============================================

export type KPIStatus = 'GREEN' | 'YELLOW' | 'RED';
export type KPICategory = 'FINANCIAL' | 'OPERATIONAL' | 'CUSTOMER' | 'TECHNICAL' | 'GROWTH' | 'LEGAL';
export type AlertSeverity = 'INFO' | 'WARNING' | 'CRITICAL' | 'EMERGENCY';
export type AlertStatus = 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'DISMISSED';
export type MeetingType = 'STANDUP' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'EMERGENCY';
export type MeetingStatus = 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type SPADEStatus = 'INITIATED' | 'SETTING_PHASE' | 'PEOPLE_PHASE' | 'ALTERNATIVES_PHASE' | 'DECIDE_PHASE' | 'EXPLAIN_PHASE' | 'COMPLETED' | 'CANCELLED';

export interface KPIMetric {
  code: string;
  name: string;
  nameAr: string;
  currentValue: number;
  previousValue: number | null;
  targetValue: number;
  warningThreshold: number;
  criticalThreshold: number;
  status: KPIStatus;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  category: KPICategory;
  unit?: string;
}

export interface KPIDashboard {
  summary: {
    green: number;
    yellow: number;
    red: number;
    total: number;
    healthScore: number;
  };
  criticalKPIs: KPIMetric[];
}

export interface BoardAlert {
  id: string;
  alertNumber: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  severity: AlertSeverity;
  status: AlertStatus;
  kpi?: KPIMetric;
  assignedTo?: BoardMember;
  createdAt: string;
}

export interface AlertDashboard {
  summary: {
    emergency: number;
    critical: number;
    warning: number;
    info: number;
    total: number;
  };
  recentAlerts: BoardAlert[];
}

export interface BoardMeeting {
  id: string;
  meetingNumber: string;
  type: MeetingType;
  status: MeetingStatus;
  title: string;
  titleAr: string;
  scheduledAt: string;
  duration?: number;
  attendees?: Array<{ member: BoardMember; attended: boolean }>;
}

export interface SPADEDecision {
  id: string;
  decisionNumber: string;
  title: string;
  titleAr: string;
  status: SPADEStatus;
  currentPhase: string;
  deadline?: string;
  decisionMaker?: BoardMember;
  alternatives?: Array<{ id: string; title: string; titleAr: string; votes: number }>;
}

export interface DecisionDashboard {
  summary: {
    byPhase: Record<string, number>;
    completed: number;
    inProgress: number;
  };
  actionItems: {
    pending: number;
    overdue: number;
  };
  recentDecisions: SPADEDecision[];
}

export interface ActionItem {
  id: string;
  itemNumber: string;
  title: string;
  titleAr: string;
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  dueDate: string;
  progress: number;
  assignee?: BoardMember;
}

// ============================================
// GOVERNANCE API Functions
// ============================================

// --- KPIs ---

export const getKPIs = async (): Promise<KPIMetric[]> => {
  const response = await founderFetch('/board/kpis');
  return response.data;
};

export const getKPIDashboard = async (): Promise<KPIDashboard> => {
  const response = await founderFetch('/board/kpis/dashboard');
  return response.data;
};

export const initializeKPIs = async (): Promise<{ created: number; message: string }> => {
  const response = await founderFetch('/board/kpis/initialize', { method: 'POST' });
  return response.data;
};

// --- Alerts ---

export const getAlerts = async (): Promise<BoardAlert[]> => {
  const response = await founderFetch('/board/alerts');
  return response.data;
};

export const getAlertDashboard = async (): Promise<AlertDashboard> => {
  const response = await founderFetch('/board/alerts/dashboard');
  return response.data;
};

export const acknowledgeAlert = async (alertId: string): Promise<BoardAlert> => {
  const response = await founderFetch(`/board/alerts/${alertId}/acknowledge`, { method: 'POST' });
  return response.data;
};

export const resolveAlert = async (alertId: string, resolution: string): Promise<BoardAlert> => {
  const response = await founderFetch(`/board/alerts/${alertId}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  });
  return response.data;
};

export const checkKPIsAndAlert = async (): Promise<{ checked: number; alertsCreated: number }> => {
  const response = await founderFetch('/board/alerts/check-kpis', { method: 'POST' });
  return response.data;
};

// --- Meetings ---

export const getMeetings = async (): Promise<BoardMeeting[]> => {
  const response = await founderFetch('/board/meetings');
  return response.data;
};

export const getUpcomingMeetings = async (): Promise<BoardMeeting[]> => {
  const response = await founderFetch('/board/meetings/upcoming');
  return response.data;
};

export const scheduleMeeting = async (data: {
  type: MeetingType;
  title: string;
  titleAr: string;
  scheduledAt: string;
  attendeeIds: string[];
}): Promise<BoardMeeting> => {
  const response = await founderFetch('/board/meetings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};

// --- SPADE Decisions ---

export const getDecisions = async (): Promise<SPADEDecision[]> => {
  const response = await founderFetch('/board/decisions');
  return response.data;
};

export const getDecisionDashboard = async (): Promise<DecisionDashboard> => {
  const response = await founderFetch('/board/decisions/dashboard');
  return response.data;
};

export const initiateSPADE = async (data: {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  deadline?: string;
}): Promise<SPADEDecision> => {
  const response = await founderFetch('/board/decisions', {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
};

// --- Action Items ---

export const getActionItems = async (): Promise<ActionItem[]> => {
  const response = await founderFetch('/board/action-items');
  return response.data;
};

export const getOverdueActionItems = async (): Promise<ActionItem[]> => {
  const response = await founderFetch('/board/action-items/overdue');
  return response.data;
};

// ============================================
// Governance Helper Functions
// ============================================

export const getKPIStatusColor = (status: KPIStatus): string => {
  const colors: Record<KPIStatus, string> = {
    GREEN: 'bg-green-500',
    YELLOW: 'bg-yellow-500',
    RED: 'bg-red-500',
  };
  return colors[status] || 'bg-gray-500';
};

export const getAlertSeverityColor = (severity: AlertSeverity): string => {
  const colors: Record<AlertSeverity, string> = {
    INFO: 'bg-blue-500',
    WARNING: 'bg-yellow-500',
    CRITICAL: 'bg-red-500',
    EMERGENCY: 'bg-red-600',
  };
  return colors[severity] || 'bg-gray-500';
};

export const getMeetingTypeDisplay = (type: MeetingType): string => {
  const names: Record<MeetingType, string> = {
    STANDUP: 'اجتماع يومي',
    WEEKLY: 'اجتماع أسبوعي',
    MONTHLY: 'اجتماع شهري',
    QUARTERLY: 'اجتماع ربع سنوي',
    EMERGENCY: 'اجتماع طوارئ',
  };
  return names[type] || type;
};
