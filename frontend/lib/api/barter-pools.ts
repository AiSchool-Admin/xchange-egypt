import apiClient from './client';

// ============================================
// Types
// ============================================

export interface BarterPool {
  id: string;
  title: string;
  description: string;
  targetCategoryId?: string;
  targetDescription: string;
  targetMinValue: number;
  targetMaxValue: number;
  maxParticipants: number;
  currentValue: number;
  participantCount: number;
  status: 'OPEN' | 'MATCHING' | 'MATCHED' | 'NEGOTIATING' | 'EXECUTING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  deadline: string;
  creatorId: string;
  matchedItemId?: string;
  matchedSellerId?: string;
  matchedValue?: number;
  completedAt?: string;
  createdAt: string;
  participants?: BarterPoolParticipant[];
}

export interface BarterPoolParticipant {
  id: string;
  poolId: string;
  userId: string;
  itemId?: string;
  cashAmount: number;
  xcoinAmount: number;
  totalValue: number;
  sharePercentage: number;
  isApproved: boolean;
  approvedAt?: string;
  createdAt: string;
}

// ============================================
// API Functions
// ============================================

export const getOpenPools = async (params?: {
  categoryId?: string;
  minValue?: number;
  maxValue?: number;
  limit?: number;
  offset?: number;
}) => {
  const response = await apiClient.get('/barter-pools', { params });
  return response.data;
};

export const getPool = async (id: string) => {
  const response = await apiClient.get(`/barter-pools/${id}`);
  return response.data;
};

export const getMyPools = async (params?: {
  role?: 'CREATOR' | 'PARTICIPANT' | 'ALL';
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await apiClient.get('/barter-pools/user/my-pools', { params });
  return response.data;
};

export const createPool = async (data: {
  title: string;
  description: string;
  targetCategoryId?: string;
  targetDescription: string;
  targetMinValue: number;
  targetMaxValue: number;
  maxParticipants?: number;
  deadlineDays: number;
  initialContribution?: {
    itemId?: string;
    cashAmount?: number;
    xcoinAmount?: number;
  };
}) => {
  const response = await apiClient.post('/barter-pools', data);
  return response.data;
};

export const joinPool = async (id: string, data: {
  itemId?: string;
  cashAmount?: number;
  xcoinAmount?: number;
}) => {
  const response = await apiClient.post(`/barter-pools/${id}/join`, data);
  return response.data;
};

export const leavePool = async (id: string) => {
  const response = await apiClient.post(`/barter-pools/${id}/leave`);
  return response.data;
};

export const approveParticipant = async (poolId: string, participantUserId: string) => {
  const response = await apiClient.post(`/barter-pools/${poolId}/approve/${participantUserId}`);
  return response.data;
};

export const startMatching = async (id: string) => {
  const response = await apiClient.post(`/barter-pools/${id}/start-matching`);
  return response.data;
};

export const acceptMatch = async (id: string) => {
  const response = await apiClient.post(`/barter-pools/${id}/accept-match`);
  return response.data;
};

export const cancelPool = async (id: string) => {
  const response = await apiClient.delete(`/barter-pools/${id}`);
  return response.data;
};
