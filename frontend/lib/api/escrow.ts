import apiClient from './client';

// ============================================
// Types
// ============================================

export interface Escrow {
  id: string;
  escrowType: 'SALE' | 'BARTER' | 'BARTER_CHAIN';
  buyerId: string;
  sellerId: string;
  amount: number;
  currency: string;
  xcoinAmount?: number;
  status: 'CREATED' | 'FUNDED' | 'PENDING_DELIVERY' | 'DELIVERED' | 'INSPECTION' | 'RELEASED' | 'REFUNDED' | 'DISPUTED' | 'CANCELLED' | 'EXPIRED';
  autoRelease: boolean;
  autoReleaseAfter: number;
  fundedAt?: string;
  deliveredAt?: string;
  inspectionEndsAt?: string;
  releasedAt?: string;
  expiresAt: string;
  facilitatorId?: string;
  facilitatorFee?: number;
  notes?: string;
  createdAt: string;
  milestones?: EscrowMilestone[];
  dispute?: Dispute;
}

export interface EscrowMilestone {
  id: string;
  milestone: string;
  description: string;
  actorType: string;
  actorId?: string;
  evidence: string[];
  createdAt: string;
}

export interface Dispute {
  id: string;
  escrowId: string;
  initiatorId: string;
  respondentId: string;
  reason: string;
  description: string;
  evidence: string[];
  status: 'OPEN' | 'UNDER_REVIEW' | 'ESCALATED' | 'RESOLVED' | 'CLOSED';
  resolution?: string;
  resolutionAmount?: number;
  resolutionNotes?: string;
  responseDeadline: string;
  resolvedAt?: string;
  messages?: DisputeMessage[];
}

export interface DisputeMessage {
  id: string;
  senderId: string;
  senderRole: string;
  message: string;
  attachments: string[];
  createdAt: string;
}

// ============================================
// API Functions
// ============================================

export const getMyEscrows = async (params?: {
  role?: 'BUYER' | 'SELLER' | 'ALL';
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await apiClient.get('/escrow/my-escrows', { params });
  return response.data;
};

export const getEscrow = async (id: string) => {
  const response = await apiClient.get(`/escrow/${id}`);
  return response.data;
};

export const createEscrow = async (data: {
  escrowType: string;
  sellerId: string;
  amount: number;
  currency?: string;
  xcoinAmount?: number;
  itemId?: string;
  facilitatorId?: string;
  notes?: string;
}) => {
  const response = await apiClient.post('/escrow', data);
  return response.data;
};

export const fundEscrow = async (id: string) => {
  const response = await apiClient.post(`/escrow/${id}/fund`);
  return response.data;
};

export const markDelivered = async (id: string, evidence?: string[]) => {
  const response = await apiClient.post(`/escrow/${id}/deliver`, { evidence });
  return response.data;
};

export const confirmReceipt = async (id: string) => {
  const response = await apiClient.post(`/escrow/${id}/confirm`);
  return response.data;
};

export const cancelEscrow = async (id: string, reason?: string) => {
  const response = await apiClient.post(`/escrow/${id}/cancel`, { reason });
  return response.data;
};

export const openDispute = async (id: string, data: {
  reason: string;
  description: string;
  evidence?: string[];
  requestedAmount?: number;
  requestedOutcome?: string;
}) => {
  const response = await apiClient.post(`/escrow/${id}/dispute`, data);
  return response.data;
};

export const getDispute = async (disputeId: string) => {
  const response = await apiClient.get(`/escrow/disputes/${disputeId}`);
  return response.data;
};

export const respondToDispute = async (disputeId: string, data: {
  message: string;
  attachments?: string[];
}) => {
  const response = await apiClient.post(`/escrow/disputes/${disputeId}/respond`, data);
  return response.data;
};
