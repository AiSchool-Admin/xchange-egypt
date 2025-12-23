/**
 * Board Module Types
 * أنواع البيانات لمجلس إدارة AI
 * (تعريفات محلية لتجنب مشاكل Prisma generate)
 */

// Board Roles
export const BoardRole = {
  CEO: 'CEO',
  CTO: 'CTO',
  CFO: 'CFO',
  CMO: 'CMO',
  COO: 'COO',
  CLO: 'CLO',
} as const;
export type BoardRole = typeof BoardRole[keyof typeof BoardRole];

// Member Types
export const BoardMemberType = {
  AI: 'AI',
  HUMAN: 'HUMAN',
  HYBRID: 'HYBRID',
} as const;
export type BoardMemberType = typeof BoardMemberType[keyof typeof BoardMemberType];

// Member Status
export const BoardMemberStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  ON_LEAVE: 'ON_LEAVE',
} as const;
export type BoardMemberStatus = typeof BoardMemberStatus[keyof typeof BoardMemberStatus];

// AI Model
export const AIModel = {
  OPUS: 'OPUS',
  SONNET: 'SONNET',
  HAIKU: 'HAIKU',
} as const;
export type AIModel = typeof AIModel[keyof typeof AIModel];

// CEO Mode
export const CEOMode = {
  LEADER: 'LEADER',
  STRATEGIST: 'STRATEGIST',
  VISIONARY: 'VISIONARY',
} as const;
export type CEOMode = typeof CEOMode[keyof typeof CEOMode];

// Conversation Type
export const BoardConversationType = {
  MEETING: 'MEETING',
  QUESTION: 'QUESTION',
  TASK_DISCUSSION: 'TASK_DISCUSSION',
  BRAINSTORM: 'BRAINSTORM',
  REVIEW: 'REVIEW',
} as const;
export type BoardConversationType = typeof BoardConversationType[keyof typeof BoardConversationType];

// Conversation Status
export const BoardConversationStatus = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
  ARCHIVED: 'ARCHIVED',
} as const;
export type BoardConversationStatus = typeof BoardConversationStatus[keyof typeof BoardConversationStatus];

// Message Role
export const BoardMessageRole = {
  USER: 'USER',
  ASSISTANT: 'ASSISTANT',
  SYSTEM: 'SYSTEM',
} as const;
export type BoardMessageRole = typeof BoardMessageRole[keyof typeof BoardMessageRole];

// Task Type
export const BoardTaskType = {
  ANALYSIS: 'ANALYSIS',
  PLANNING: 'PLANNING',
  RECOMMENDATION: 'RECOMMENDATION',
  EXECUTION: 'EXECUTION',
} as const;
export type BoardTaskType = typeof BoardTaskType[keyof typeof BoardTaskType];

// Task Priority
export const BoardTaskPriority = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;
export type BoardTaskPriority = typeof BoardTaskPriority[keyof typeof BoardTaskPriority];

// Task Status
export const BoardTaskStatus = {
  PENDING: 'PENDING',
  IN_PROGRESS: 'IN_PROGRESS',
  AWAITING_APPROVAL: 'AWAITING_APPROVAL',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;
export type BoardTaskStatus = typeof BoardTaskStatus[keyof typeof BoardTaskStatus];

// Approval Status
export const BoardApprovalStatus = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CHANGES_REQUESTED: 'CHANGES_REQUESTED',
} as const;
export type BoardApprovalStatus = typeof BoardApprovalStatus[keyof typeof BoardApprovalStatus];

// Decision Outcome
export const BoardDecisionOutcome = {
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  DEFERRED: 'DEFERRED',
  NEEDS_MORE_INFO: 'NEEDS_MORE_INFO',
} as const;
export type BoardDecisionOutcome = typeof BoardDecisionOutcome[keyof typeof BoardDecisionOutcome];

// Vote Type
export const BoardVoteType = {
  APPROVE: 'APPROVE',
  REJECT: 'REJECT',
  ABSTAIN: 'ABSTAIN',
} as const;
export type BoardVoteType = typeof BoardVoteType[keyof typeof BoardVoteType];

// File Type
export const BoardFileType = {
  PDF: 'PDF',
  DOCX: 'DOCX',
  XLSX: 'XLSX',
  PPTX: 'PPTX',
  MD: 'MD',
  JSON: 'JSON',
  CSV: 'CSV',
} as const;
export type BoardFileType = typeof BoardFileType[keyof typeof BoardFileType];
