import apiClient from './client';

// ============================================
// Types
// ============================================

export interface BarterChain {
  id: string;
  chainType: 'CYCLE' | 'LINEAR';
  status: 'PROPOSED' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXECUTING' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  totalValue: number;
  participantCount: number;
  expiresAt: string;
  completedAt?: string;
  createdAt: string;
  participants: BarterParticipant[];
}

export interface BarterParticipant {
  id: string;
  chainId: string;
  userId: string;
  position: number;
  givingItemId: string;
  receivingItemId?: string;
  cashBalance: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  responseMessage?: string;
  respondedAt?: string;
  user?: {
    id: string;
    fullName: string;
    avatar?: string;
    phone?: string;
  };
  givingItem?: {
    id: string;
    title: string;
    images: string[];
    estimatedValue: number;
    category?: {
      id: string;
      nameAr: string;
      nameEn: string;
    };
  };
  receivingItem?: {
    id: string;
    title: string;
    images: string[];
    estimatedValue: number;
    category?: {
      id: string;
      nameAr: string;
      nameEn: string;
    };
  };
}

export interface BarterOpportunity {
  id: string;
  type: 'CYCLE' | 'LINEAR';
  participants: {
    userId: string;
    fullName: string;
    gives: { id: string; title: string; value: number };
    receives: { id: string; title: string; value: number };
  }[];
  totalValue: number;
  matchScore: number;
}

export interface ChainStats {
  total: number;
  proposed: number;
  pending: number;
  accepted: number;
  completed: number;
  rejected: number;
  successRate: string;
}

// ============================================
// API Functions
// ============================================

export const discoverOpportunities = async (itemId: string) => {
  const response = await apiClient.get(`/barter/opportunities/${itemId}`);
  return response.data;
};

export const createProposal = async (data: {
  itemId: string;
  maxParticipants?: number;
  preferCycles?: boolean;
}) => {
  const response = await apiClient.post('/barter/chains', data);
  return response.data;
};

export const getMyChains = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  const response = await apiClient.get('/barter/chains/my', { params });
  return response.data;
};

export const getPendingProposals = async () => {
  const response = await apiClient.get('/barter/chains/pending');
  return response.data;
};

export const getChain = async (id: string) => {
  const response = await apiClient.get(`/barter/chains/${id}`);
  return response.data;
};

export const respondToProposal = async (id: string, data: {
  accept: boolean;
  message?: string;
}) => {
  const response = await apiClient.post(`/barter/chains/${id}/respond`, data);
  return response.data;
};

export const cancelChain = async (id: string) => {
  const response = await apiClient.delete(`/barter/chains/${id}`);
  return response.data;
};

export const executeChain = async (id: string) => {
  const response = await apiClient.post(`/barter/chains/${id}/execute`);
  return response.data;
};

export const getChainStats = async () => {
  const response = await apiClient.get('/barter/chains/stats');
  return response.data;
};
