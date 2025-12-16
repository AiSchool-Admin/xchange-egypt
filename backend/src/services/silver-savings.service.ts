/**
 * Silver Savings Account Service
 * خدمة حساب التوفير بالفضة
 *
 * Note: This is a placeholder implementation. The actual database tables
 * need to be created via migration before full functionality.
 */

import { getPriceByPurity } from './silver.service';

const MINIMUM_DEPOSIT = 100; // EGP
const WITHDRAWAL_FEE = 0.01; // 1% withdrawal fee
const PROCESSING_DAYS = 3; // Days for withdrawal processing

// In-memory storage for development (replace with DB when tables are created)
const accountsStore: Map<string, any> = new Map();
const transactionsStore: Map<string, any[]> = new Map();

export interface SavingsAccountCreate {
  accountName: string;
  targetGoal?: number;
  targetDate?: Date;
  autoInvestAmount?: number;
  autoInvestDay?: number;
}

export interface DepositRequest {
  amount: number;
  paymentMethod: 'CARD' | 'FAWRY' | 'INSTAPAY' | 'BANK_TRANSFER';
  paymentReference?: string;
}

export interface WithdrawalRequest {
  type: 'CASH' | 'PHYSICAL' | 'PARTIAL';
  grams?: number;
  deliveryAddress?: string;
}

/**
 * Create savings account
 */
export const createSavingsAccount = async (userId: string, data: SavingsAccountCreate) => {
  const existing = accountsStore.get(userId);
  if (existing?.isActive) {
    throw new Error('User already has an active savings account');
  }

  const account = {
    id: `sav-${Date.now()}`,
    userId,
    accountNumber: `SAV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
    accountName: data.accountName,
    balanceGrams: 0,
    balanceEGP: 0,
    totalDeposited: 0,
    totalWithdrawn: 0,
    averagePurchasePrice: 0,
    targetGoalGrams: data.targetGoal,
    targetDate: data.targetDate,
    autoInvestAmount: data.autoInvestAmount,
    autoInvestDay: data.autoInvestDay,
    pendingWithdrawal: 0,
    isActive: true,
    createdAt: new Date(),
  };

  accountsStore.set(userId, account);
  transactionsStore.set(account.id, []);

  return account;
};

/**
 * Get user's savings account
 */
export const getSavingsAccount = async (userId: string) => {
  const account = accountsStore.get(userId);
  if (!account?.isActive) return null;

  const currentPrice = await getPriceByPurity('S999');
  const pricePerGram = currentPrice?.buyPrice || 65;

  const currentValue = account.balanceGrams * pricePerGram;
  const profitLoss = currentValue - account.totalDeposited;
  const profitLossPercent = account.totalDeposited > 0
    ? (profitLoss / account.totalDeposited) * 100
    : 0;

  const goalProgress = account.targetGoalGrams
    ? (account.balanceGrams / account.targetGoalGrams) * 100
    : null;

  return {
    ...account,
    currentPricePerGram: pricePerGram,
    currentValue: Math.round(currentValue),
    profitLoss: Math.round(profitLoss),
    profitLossPercent: Math.round(profitLossPercent * 100) / 100,
    goalProgress: goalProgress ? Math.round(goalProgress * 100) / 100 : null,
  };
};

/**
 * Deposit to savings account
 */
export const deposit = async (userId: string, accountId: string, data: DepositRequest) => {
  if (data.amount < MINIMUM_DEPOSIT) {
    throw new Error(`Minimum deposit is ${MINIMUM_DEPOSIT} EGP`);
  }

  const account = accountsStore.get(userId);
  if (!account || account.id !== accountId || !account.isActive) {
    throw new Error('Account not found');
  }

  const currentPrice = await getPriceByPurity('S999');
  const pricePerGram = currentPrice?.buyPrice || 65;
  const gramsAdded = data.amount / pricePerGram;

  const transaction = {
    id: `tx-${Date.now()}`,
    accountId,
    type: 'DEPOSIT',
    amountEGP: data.amount,
    amountGrams: gramsAdded,
    pricePerGram,
    paymentMethod: data.paymentMethod,
    paymentReference: data.paymentReference,
    status: 'COMPLETED',
    createdAt: new Date(),
  };

  const transactions = transactionsStore.get(accountId) || [];
  transactions.unshift(transaction);
  transactionsStore.set(accountId, transactions);

  // Update account
  account.balanceGrams += gramsAdded;
  account.balanceEGP += data.amount;
  account.totalDeposited += data.amount;
  account.averagePurchasePrice = account.totalDeposited > 0
    ? (account.averagePurchasePrice * (account.totalDeposited - data.amount) + pricePerGram * data.amount) / account.totalDeposited
    : pricePerGram;

  accountsStore.set(userId, account);

  return {
    transaction,
    gramsAdded: Math.round(gramsAdded * 1000) / 1000,
    pricePerGram,
  };
};

/**
 * Request withdrawal
 */
export const requestWithdrawal = async (
  userId: string,
  accountId: string,
  data: WithdrawalRequest
) => {
  const account = accountsStore.get(userId);
  if (!account || account.id !== accountId || !account.isActive) {
    throw new Error('Account not found');
  }

  const currentPrice = await getPriceByPurity('S999');
  const pricePerGram = currentPrice?.sellPrice || 63;

  let gramsToWithdraw = account.balanceGrams;
  let egpAmount = 0;

  if (data.type === 'PARTIAL' && data.grams) {
    if (data.grams > account.balanceGrams) {
      throw new Error('Insufficient balance');
    }
    gramsToWithdraw = data.grams;
  }

  if (data.type === 'CASH' || data.type === 'PARTIAL') {
    egpAmount = gramsToWithdraw * pricePerGram;
    const fee = egpAmount * WITHDRAWAL_FEE;
    egpAmount -= fee;
  }

  const transaction = {
    id: `tx-${Date.now()}`,
    accountId,
    type: 'WITHDRAWAL',
    withdrawalType: data.type,
    amountGrams: gramsToWithdraw,
    amountEGP: egpAmount,
    pricePerGram,
    fee: egpAmount * WITHDRAWAL_FEE,
    deliveryAddress: data.deliveryAddress,
    status: 'PENDING',
    estimatedCompletion: new Date(Date.now() + PROCESSING_DAYS * 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  };

  const transactions = transactionsStore.get(accountId) || [];
  transactions.unshift(transaction);
  transactionsStore.set(accountId, transactions);

  account.pendingWithdrawal = gramsToWithdraw;
  accountsStore.set(userId, account);

  return {
    transaction,
    gramsToWithdraw,
    egpAmount: Math.round(egpAmount),
    fee: Math.round(egpAmount * WITHDRAWAL_FEE),
    estimatedCompletion: transaction.estimatedCompletion,
  };
};

/**
 * Get account history
 */
export const getAccountHistory = async (
  userId: string,
  accountId: string,
  page = 1,
  limit = 20
) => {
  const account = accountsStore.get(userId);
  if (!account || account.id !== accountId) {
    throw new Error('Account not found');
  }

  const allTransactions = transactionsStore.get(accountId) || [];
  const start = (page - 1) * limit;
  const transactions = allTransactions.slice(start, start + limit);

  return {
    transactions,
    pagination: {
      page,
      limit,
      total: allTransactions.length,
      totalPages: Math.ceil(allTransactions.length / limit),
    },
  };
};

/**
 * Get price history for charts
 */
export const getPriceHistory = async (days = 30) => {
  // Return mock data for now
  const prices = [];
  const now = Date.now();
  const basePrice = 65;

  for (let i = days; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000);
    const variation = (Math.random() - 0.5) * 2; // +/- 1 EGP
    prices.push({
      buyPrice: basePrice + variation,
      sellPrice: basePrice + variation - 2,
      timestamp: date,
    });
  }

  return prices;
};

/**
 * Calculate projected growth
 */
export const calculateProjectedGrowth = async (
  currentGrams: number,
  monthlyDeposit: number,
  months: number
) => {
  const currentPrice = await getPriceByPurity('S999');
  const pricePerGram = currentPrice?.buyPrice || 65;
  const monthlyGrowthRate = 0.05 / 12; // 5% annual

  let balance = currentGrams;
  const projections = [];

  for (let i = 1; i <= months; i++) {
    const gramsFromDeposit = monthlyDeposit / pricePerGram;
    balance += gramsFromDeposit;

    const projectedPrice = pricePerGram * Math.pow(1 + monthlyGrowthRate, i);
    const projectedValue = balance * projectedPrice;

    projections.push({
      month: i,
      balanceGrams: Math.round(balance * 1000) / 1000,
      projectedPrice: Math.round(projectedPrice * 100) / 100,
      projectedValue: Math.round(projectedValue),
    });
  }

  return projections;
};
