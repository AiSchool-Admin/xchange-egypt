import apiClient from './client';

// ============================================
// Types
// ============================================

export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  frozenBalance: number;
  availableBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: string;
  amount: number;
  balanceAfter: number;
  description?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
  status: string;
  createdAt: string;
}

export interface EarningOpportunity {
  id: string;
  type: 'DAILY' | 'ONE_TIME' | 'REPEATABLE';
  title: string;
  description: string;
  reward: number;
  icon: string;
  completed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  fullName: string;
  avatar?: string;
  lifetimeEarned: number;
}

// ============================================
// API Functions
// ============================================

export const getWallet = async () => {
  const response = await apiClient.get('/wallet');
  return response.data;
};

export const getTransactions = async (page = 1, limit = 20, type?: string) => {
  const response = await apiClient.get('/wallet/transactions', {
    params: { page, limit, type },
  });
  return response.data;
};

export const transferXCoin = async (data: {
  toUserId: string;
  amount: number;
  description?: string;
}) => {
  const response = await apiClient.post('/wallet/transfer', data);
  return response.data;
};

export const redeemXCoin = async (data: {
  amount: number;
  redeemType?: string;
  relatedEntityId?: string;
}) => {
  const response = await apiClient.post('/wallet/redeem', data);
  return response.data;
};

export const claimDailyReward = async () => {
  const response = await apiClient.post('/wallet/claim-daily');
  return response.data;
};

export const getEarningOpportunities = async () => {
  const response = await apiClient.get('/wallet/opportunities');
  return response.data;
};

export const getLeaderboard = async (limit = 10) => {
  const response = await apiClient.get('/wallet/leaderboard', {
    params: { limit },
  });
  return response.data;
};
