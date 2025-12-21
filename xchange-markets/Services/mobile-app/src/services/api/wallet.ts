// ============================================
// Wallet & Payments API - Xchange Egypt
// خدمات المحفظة والمدفوعات
// ============================================

import { apiClient } from './client';
import { PaginatedResponse } from './listings';

// Types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: 'EGP';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Transaction {
  id: string;
  type: 'DEPOSIT' | 'WITHDRAWAL' | 'PAYMENT' | 'REFUND' | 'ESCROW_HOLD' | 'ESCROW_RELEASE' | 'COMMISSION';
  amount: number;
  currency: 'EGP';
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  description: string;
  descriptionAr?: string;
  reference?: string;
  referenceType?: 'ORDER' | 'AUCTION' | 'GOLD_ORDER' | 'DEPOSIT' | 'WITHDRAWAL';
  paymentMethod?: string;
  fee?: number;
  balanceAfter?: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentMethod {
  id: string;
  type: 'CARD' | 'BANK_ACCOUNT' | 'MOBILE_WALLET' | 'FAWRY';
  name: string;
  nameAr: string;
  icon?: string;
  isDefault: boolean;
  isActive: boolean;
  details: {
    last4?: string;
    brand?: string;
    bankName?: string;
    accountNumber?: string;
    walletNumber?: string;
  };
  createdAt: string;
}

export interface DepositOptions {
  methods: {
    type: string;
    name: string;
    nameAr: string;
    icon: string;
    minAmount: number;
    maxAmount: number;
    fee: number;
    feeType: 'FIXED' | 'PERCENTAGE';
    estimatedTime: string;
  }[];
}

export interface WithdrawalOptions {
  methods: {
    type: string;
    name: string;
    nameAr: string;
    icon: string;
    minAmount: number;
    maxAmount: number;
    fee: number;
    feeType: 'FIXED' | 'PERCENTAGE';
    estimatedTime: string;
    requiresVerification: boolean;
  }[];
  limits: {
    daily: number;
    weekly: number;
    monthly: number;
    used: {
      daily: number;
      weekly: number;
      monthly: number;
    };
  };
}

export interface Escrow {
  id: string;
  orderId: string;
  amount: number;
  currency: 'EGP';
  status: 'HELD' | 'RELEASED' | 'REFUNDED' | 'DISPUTED';
  buyerId: string;
  sellerId: string;
  holdDate: string;
  releaseDate?: string;
  expiresAt: string;
  createdAt: string;
}

// API Functions
export const walletApi = {
  // Get wallet details
  getWallet: async (): Promise<Wallet> => {
    const response = await apiClient.get('/wallet');
    return response.data;
  },

  // Get wallet balance
  getBalance: async (): Promise<{ balance: number; currency: string; pending: number }> => {
    const response = await apiClient.get('/wallet/balance');
    return response.data;
  },

  // Get transactions history
  getTransactions: async (
    filters?: {
      type?: string;
      status?: string;
      startDate?: string;
      endDate?: string;
    },
    page = 1,
    limit = 20
  ): Promise<PaginatedResponse<Transaction>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });
    }

    const response = await apiClient.get(`/wallet/transactions?${params.toString()}`);
    return response.data;
  },

  // Get single transaction
  getTransaction: async (id: string): Promise<Transaction> => {
    const response = await apiClient.get(`/wallet/transactions/${id}`);
    return response.data;
  },

  // Get deposit options
  getDepositOptions: async (): Promise<DepositOptions> => {
    const response = await apiClient.get('/wallet/deposit/options');
    return response.data;
  },

  // Initiate deposit
  initiateDeposit: async (data: {
    amount: number;
    method: string;
    returnUrl?: string;
  }): Promise<{
    transactionId: string;
    paymentUrl?: string;
    reference?: string;
    instructions?: string;
    expiresAt?: string;
  }> => {
    const response = await apiClient.post('/wallet/deposit', data);
    return response.data;
  },

  // Verify deposit (for Fawry/reference-based)
  verifyDeposit: async (transactionId: string, reference?: string): Promise<Transaction> => {
    const response = await apiClient.post(`/wallet/deposit/${transactionId}/verify`, { reference });
    return response.data;
  },

  // Get withdrawal options
  getWithdrawalOptions: async (): Promise<WithdrawalOptions> => {
    const response = await apiClient.get('/wallet/withdraw/options');
    return response.data;
  },

  // Request withdrawal
  requestWithdrawal: async (data: {
    amount: number;
    method: string;
    accountDetails: {
      bankName?: string;
      accountNumber?: string;
      accountName?: string;
      walletNumber?: string;
    };
  }): Promise<Transaction> => {
    const response = await apiClient.post('/wallet/withdraw', data);
    return response.data;
  },

  // Cancel withdrawal
  cancelWithdrawal: async (transactionId: string): Promise<Transaction> => {
    const response = await apiClient.post(`/wallet/withdraw/${transactionId}/cancel`);
    return response.data;
  },

  // Get payment methods
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await apiClient.get('/wallet/payment-methods');
    return response.data;
  },

  // Add payment method
  addPaymentMethod: async (data: {
    type: string;
    name: string;
    details: Record<string, any>;
    isDefault?: boolean;
  }): Promise<PaymentMethod> => {
    const response = await apiClient.post('/wallet/payment-methods', data);
    return response.data;
  },

  // Remove payment method
  removePaymentMethod: async (id: string): Promise<void> => {
    await apiClient.delete(`/wallet/payment-methods/${id}`);
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id: string): Promise<void> => {
    await apiClient.put(`/wallet/payment-methods/${id}/default`);
  },

  // Pay for order
  payForOrder: async (data: {
    orderId: string;
    amount: number;
    paymentMethod: 'WALLET' | 'CARD' | 'FAWRY' | 'VODAFONE_CASH' | 'INSTAPAY';
    paymentMethodId?: string;
    returnUrl?: string;
  }): Promise<{
    success: boolean;
    transactionId: string;
    paymentUrl?: string;
    reference?: string;
    message?: string;
  }> => {
    const response = await apiClient.post('/wallet/pay', data);
    return response.data;
  },

  // Get escrow details
  getEscrow: async (orderId: string): Promise<Escrow> => {
    const response = await apiClient.get(`/wallet/escrow/${orderId}`);
    return response.data;
  },

  // Get active escrows
  getActiveEscrows: async (): Promise<Escrow[]> => {
    const response = await apiClient.get('/wallet/escrows');
    return response.data;
  },

  // Release escrow (seller confirms delivery)
  releaseEscrow: async (escrowId: string): Promise<Escrow> => {
    const response = await apiClient.post(`/wallet/escrow/${escrowId}/release`);
    return response.data;
  },

  // Request escrow refund
  requestEscrowRefund: async (escrowId: string, reason: string): Promise<Escrow> => {
    const response = await apiClient.post(`/wallet/escrow/${escrowId}/refund`, { reason });
    return response.data;
  },

  // Get wallet summary/stats
  getWalletSummary: async (period: '7d' | '30d' | '90d' | '1y' = '30d'): Promise<{
    totalDeposits: number;
    totalWithdrawals: number;
    totalSpent: number;
    totalEarned: number;
    totalFees: number;
    transactionsCount: number;
    pendingBalance: number;
    escrowBalance: number;
    chartData: { date: string; balance: number }[];
  }> => {
    const response = await apiClient.get(`/wallet/summary?period=${period}`);
    return response.data;
  },

  // Transfer to another user
  transferToUser: async (data: {
    recipientId?: string;
    recipientPhone?: string;
    recipientEmail?: string;
    amount: number;
    note?: string;
  }): Promise<Transaction> => {
    const response = await apiClient.post('/wallet/transfer', data);
    return response.data;
  },

  // Get transfer limits
  getTransferLimits: async (): Promise<{
    minAmount: number;
    maxAmount: number;
    dailyLimit: number;
    monthlyLimit: number;
    used: {
      daily: number;
      monthly: number;
    };
  }> => {
    const response = await apiClient.get('/wallet/transfer/limits');
    return response.data;
  },
};

export default walletApi;
