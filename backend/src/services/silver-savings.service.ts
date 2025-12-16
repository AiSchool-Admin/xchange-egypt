/**
 * Silver Savings Account Service
 * خدمة حساب التوفير بالفضة
 */

import prisma from '../config/database';
import { getPriceByPurity } from './silver.service';

const STORAGE_FEE_ANNUAL = 0.005; // 0.5% annual storage fee
const MINIMUM_DEPOSIT = 100; // EGP
const WITHDRAWAL_FEE = 0.01; // 1% withdrawal fee
const PROCESSING_DAYS = 3; // Days for withdrawal processing

export interface SavingsAccountCreate {
  accountName: string;
  targetGoal?: number; // Target in grams
  targetDate?: Date;
  autoInvestAmount?: number; // Monthly auto-invest in EGP
  autoInvestDay?: number; // Day of month (1-28)
}

export interface DepositRequest {
  amount: number; // EGP
  paymentMethod: 'CARD' | 'FAWRY' | 'INSTAPAY' | 'BANK_TRANSFER';
  paymentReference?: string;
}

export interface WithdrawalRequest {
  type: 'CASH' | 'PHYSICAL' | 'PARTIAL';
  grams?: number; // For partial/physical
  deliveryAddress?: string; // For physical delivery
}

/**
 * Create savings account
 */
export const createSavingsAccount = async (userId: string, data: SavingsAccountCreate) => {
  // Check if user already has an account
  const existing = await prisma.silverSavingsAccount.findFirst({
    where: { userId, isActive: true },
  });

  if (existing) {
    throw new Error('User already has an active savings account');
  }

  const account = await prisma.silverSavingsAccount.create({
    data: {
      userId,
      accountNumber: `SAV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
      accountName: data.accountName,
      balanceGrams: 0,
      balanceEGP: 0,
      targetGoalGrams: data.targetGoal,
      targetDate: data.targetDate,
      autoInvestAmount: data.autoInvestAmount,
      autoInvestDay: data.autoInvestDay,
      isActive: true,
    },
  });

  return account;
};

/**
 * Get user's savings account
 */
export const getSavingsAccount = async (userId: string) => {
  const account = await prisma.silverSavingsAccount.findFirst({
    where: { userId, isActive: true },
  });

  if (!account) return null;

  // Get current silver price
  const currentPrice = await getPriceByPurity('S999');
  const pricePerGram = currentPrice?.buyPrice || 65;

  // Calculate current value
  const currentValue = account.balanceGrams * pricePerGram;

  // Calculate profit/loss
  const profitLoss = currentValue - account.totalDeposited;
  const profitLossPercent = account.totalDeposited > 0
    ? (profitLoss / account.totalDeposited) * 100
    : 0;

  // Calculate goal progress
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

  const account = await prisma.silverSavingsAccount.findFirst({
    where: { id: accountId, userId, isActive: true },
  });

  if (!account) {
    throw new Error('Account not found');
  }

  // Get current price
  const currentPrice = await getPriceByPurity('S999');
  const pricePerGram = currentPrice?.buyPrice || 65;

  // Calculate grams purchased
  const gramsAdded = data.amount / pricePerGram;

  // Create transaction
  const transaction = await prisma.silverSavingsTransaction.create({
    data: {
      accountId,
      type: 'DEPOSIT',
      amountEGP: data.amount,
      amountGrams: gramsAdded,
      pricePerGram,
      paymentMethod: data.paymentMethod,
      paymentReference: data.paymentReference,
      status: 'COMPLETED',
    },
  });

  // Update account balance
  await prisma.silverSavingsAccount.update({
    where: { id: accountId },
    data: {
      balanceGrams: { increment: gramsAdded },
      balanceEGP: { increment: data.amount },
      totalDeposited: { increment: data.amount },
      averagePurchasePrice: account.totalDeposited > 0
        ? (account.averagePurchasePrice * account.totalDeposited + pricePerGram * data.amount) / (account.totalDeposited + data.amount)
        : pricePerGram,
    },
  });

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
  const account = await prisma.silverSavingsAccount.findFirst({
    where: { id: accountId, userId, isActive: true },
  });

  if (!account) {
    throw new Error('Account not found');
  }

  // Get current price
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

  // Create withdrawal request
  const transaction = await prisma.silverSavingsTransaction.create({
    data: {
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
    },
  });

  // Update account (pending withdrawal)
  await prisma.silverSavingsAccount.update({
    where: { id: accountId },
    data: {
      pendingWithdrawal: gramsToWithdraw,
    },
  });

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
  const account = await prisma.silverSavingsAccount.findFirst({
    where: { id: accountId, userId },
  });

  if (!account) {
    throw new Error('Account not found');
  }

  const [transactions, total] = await Promise.all([
    prisma.silverSavingsTransaction.findMany({
      where: { accountId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.silverSavingsTransaction.count({ where: { accountId } }),
  ]);

  return {
    transactions,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
};

/**
 * Get price history for charts
 */
export const getPriceHistory = async (days = 30) => {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const prices = await prisma.silverPrice.findMany({
    where: {
      purity: 'S999',
      timestamp: { gte: startDate },
    },
    orderBy: { timestamp: 'asc' },
    select: {
      buyPrice: true,
      sellPrice: true,
      timestamp: true,
    },
  });

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

  // Assume 5% annual silver price appreciation (conservative)
  const monthlyGrowthRate = 0.05 / 12;

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
