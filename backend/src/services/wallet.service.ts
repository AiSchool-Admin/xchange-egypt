/**
 * XCoin Wallet Service
 * خدمة محفظة XCoin - نظام العملة الداخلية للمنصة
 */

import { WalletTransactionType, WalletTransactionStatus } from '../types/prisma-enums';
import prisma from '../lib/prisma';

// ============================================
// Types & Interfaces
// ============================================

interface WalletInfo {
  id: string;
  userId: string;
  balance: number;
  frozenBalance: number;
  availableBalance: number;
  lifetimeEarned: number;
  lifetimeSpent: number;
}

interface TransactionResult {
  success: boolean;
  transaction?: {
    id: string;
    walletId: string;
    type: WalletTransactionType;
    amount: number;
    balanceBefore: number;
    balanceAfter: number;
    status: WalletTransactionStatus;
    description: string | null;
    relatedEntityType: string | null;
    relatedEntityId: string | null;
    relatedUserId: string | null;
    createdAt: Date;
  };
  newBalance?: number;
  error?: string;
}

interface TransferParams {
  fromUserId: string;
  toUserId: string;
  amount: number;
  description?: string;
  relatedEntityType?: string;
  relatedEntityId?: string;
}

// ============================================
// Reward Configuration
// ============================================

const REWARDS = {
  SIGNUP: 100,              // مكافأة التسجيل
  FIRST_DEAL: 50,           // أول صفقة
  REFERRAL_REFERRER: 100,   // مكافأة المُحيل
  REFERRAL_REFERRED: 50,    // مكافأة المُحال إليه
  REVIEW: 10,               // كتابة تقييم
  DAILY_LOGIN: 5,           // دخول يومي
  FIVE_STAR_RATING: 20,     // تقييم 5 نجوم
  CHALLENGE_DAILY: 50,      // تحدي يومي
  CHALLENGE_WEEKLY: 200,    // تحدي أسبوعي
  ACHIEVEMENT_COMMON: 50,
  ACHIEVEMENT_UNCOMMON: 100,
  ACHIEVEMENT_RARE: 200,
  ACHIEVEMENT_EPIC: 400,
  ACHIEVEMENT_LEGENDARY: 1000,
};

// ============================================
// Core Wallet Functions
// ============================================

/**
 * Get or create wallet for user
 * الحصول على أو إنشاء محفظة للمستخدم
 */
export async function getOrCreateWallet(userId: string): Promise<WalletInfo> {
  let wallet = await prisma.wallet.findUnique({
    where: { userId },
  });

  if (!wallet) {
    wallet = await prisma.wallet.create({
      data: {
        userId,
        balance: 0,
        frozenBalance: 0,
        lifetimeEarned: 0,
        lifetimeSpent: 0,
      },
    });

    // Award signup bonus
    await creditWallet(userId, REWARDS.SIGNUP, WalletTransactionType.REWARD_SIGNUP, 'مكافأة التسجيل في المنصة');

    // Refresh wallet after signup bonus
    wallet = await prisma.wallet.findUnique({ where: { userId } });
  }

  // Ensure wallet exists before returning
  if (!wallet) {
    throw new Error('Failed to create or retrieve wallet');
  }

  return {
    id: wallet.id,
    userId: wallet.userId,
    balance: wallet.balance,
    frozenBalance: wallet.frozenBalance,
    availableBalance: wallet.balance - wallet.frozenBalance,
    lifetimeEarned: wallet.lifetimeEarned,
    lifetimeSpent: wallet.lifetimeSpent,
  };
}

/**
 * Get wallet balance
 * الحصول على رصيد المحفظة
 */
export async function getWalletBalance(userId: string): Promise<{
  balance: number;
  frozenBalance: number;
  availableBalance: number;
}> {
  const wallet = await getOrCreateWallet(userId);
  return {
    balance: wallet.balance,
    frozenBalance: wallet.frozenBalance,
    availableBalance: wallet.availableBalance,
  };
}

/**
 * Credit wallet (add funds)
 * إضافة رصيد للمحفظة
 */
export async function creditWallet(
  userId: string,
  amount: number,
  type: WalletTransactionType,
  description?: string,
  relatedEntityType?: string,
  relatedEntityId?: string,
  relatedUserId?: string
): Promise<TransactionResult> {
  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get or create wallet
      let wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet) {
        wallet = await tx.wallet.create({
          data: { userId, balance: 0, frozenBalance: 0, lifetimeEarned: 0, lifetimeSpent: 0 },
        });
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore + amount;

      // Update wallet
      const updatedWallet = await tx.wallet.update({
        where: { userId },
        data: {
          balance: balanceAfter,
          lifetimeEarned: { increment: amount },
        },
      });

      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type,
          amount,
          balanceBefore,
          balanceAfter,
          status: WalletTransactionStatus.COMPLETED,
          description,
          relatedEntityType,
          relatedEntityId,
          relatedUserId,
        },
      });

      return { transaction, newBalance: balanceAfter };
    });

    return { success: true, ...result };
  } catch (error) {
    console.error('Credit wallet error:', error);
    return { success: false, error: 'Failed to credit wallet' };
  }
}

/**
 * Debit wallet (remove funds)
 * خصم رصيد من المحفظة
 */
export async function debitWallet(
  userId: string,
  amount: number,
  type: WalletTransactionType,
  description?: string,
  relatedEntityType?: string,
  relatedEntityId?: string,
  relatedUserId?: string
): Promise<TransactionResult> {
  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const availableBalance = wallet.balance - wallet.frozenBalance;
      if (availableBalance < amount) {
        throw new Error('Insufficient balance');
      }

      const balanceBefore = wallet.balance;
      const balanceAfter = balanceBefore - amount;

      // Update wallet
      await tx.wallet.update({
        where: { userId },
        data: {
          balance: balanceAfter,
          lifetimeSpent: { increment: amount },
        },
      });

      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type,
          amount: -amount, // Negative for debit
          balanceBefore,
          balanceAfter,
          status: WalletTransactionStatus.COMPLETED,
          description,
          relatedEntityType,
          relatedEntityId,
          relatedUserId,
        },
      });

      return { transaction, newBalance: balanceAfter };
    });

    return { success: true, ...result };
  } catch (error: unknown) {
    console.error('Debit wallet error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to debit wallet';
    return { success: false, error: errorMessage };
  }
}

/**
 * Transfer XCoin between users
 * تحويل XCoin بين المستخدمين
 */
export async function transferXCoin(params: TransferParams): Promise<TransactionResult> {
  const { fromUserId, toUserId, amount, description, relatedEntityType, relatedEntityId } = params;

  if (fromUserId === toUserId) {
    return { success: false, error: 'Cannot transfer to yourself' };
  }

  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get sender wallet
      const senderWallet = await tx.wallet.findUnique({ where: { userId: fromUserId } });
      if (!senderWallet) {
        throw new Error('Sender wallet not found');
      }

      const senderAvailable = senderWallet.balance - senderWallet.frozenBalance;
      if (senderAvailable < amount) {
        throw new Error('Insufficient balance');
      }

      // Get or create receiver wallet
      let receiverWallet = await tx.wallet.findUnique({ where: { userId: toUserId } });
      if (!receiverWallet) {
        receiverWallet = await tx.wallet.create({
          data: { userId: toUserId, balance: 0, frozenBalance: 0, lifetimeEarned: 0, lifetimeSpent: 0 },
        });
      }

      // Debit sender
      const senderBalanceBefore = senderWallet.balance;
      const senderBalanceAfter = senderBalanceBefore - amount;

      await tx.wallet.update({
        where: { userId: fromUserId },
        data: {
          balance: senderBalanceAfter,
          lifetimeSpent: { increment: amount },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: senderWallet.id,
          type: WalletTransactionType.SENT_TO_USER,
          amount: -amount,
          balanceBefore: senderBalanceBefore,
          balanceAfter: senderBalanceAfter,
          status: WalletTransactionStatus.COMPLETED,
          description: description || `تحويل إلى مستخدم`,
          relatedUserId: toUserId,
          relatedEntityType,
          relatedEntityId,
        },
      });

      // Credit receiver
      const receiverBalanceBefore = receiverWallet.balance;
      const receiverBalanceAfter = receiverBalanceBefore + amount;

      await tx.wallet.update({
        where: { userId: toUserId },
        data: {
          balance: receiverBalanceAfter,
          lifetimeEarned: { increment: amount },
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: receiverWallet.id,
          type: WalletTransactionType.RECEIVED_FROM_USER,
          amount,
          balanceBefore: receiverBalanceBefore,
          balanceAfter: receiverBalanceAfter,
          status: WalletTransactionStatus.COMPLETED,
          description: description || `مستلم من مستخدم`,
          relatedUserId: fromUserId,
          relatedEntityType,
          relatedEntityId,
        },
      });

      return { transaction, newBalance: senderBalanceAfter };
    });

    return { success: true, ...result };
  } catch (error: unknown) {
    console.error('Transfer error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to transfer';
    return { success: false, error: errorMessage };
  }
}

/**
 * Freeze balance for escrow
 * تجميد رصيد للضمان
 */
export async function freezeBalance(
  userId: string,
  amount: number,
  escrowId: string
): Promise<TransactionResult> {
  if (amount <= 0) {
    return { success: false, error: 'Amount must be positive' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const availableBalance = wallet.balance - wallet.frozenBalance;
      if (availableBalance < amount) {
        throw new Error('Insufficient available balance');
      }

      const balanceBefore = wallet.balance;

      // Update frozen balance
      await tx.wallet.update({
        where: { userId },
        data: {
          frozenBalance: { increment: amount },
        },
      });

      // Create transaction record
      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.ESCROW_FREEZE,
          amount: -amount,
          balanceBefore,
          balanceAfter: balanceBefore, // Total balance unchanged, just frozen
          status: WalletTransactionStatus.COMPLETED,
          description: 'تجميد رصيد للضمان',
          relatedEntityType: 'escrow',
          relatedEntityId: escrowId,
        },
      });

      return { transaction, newBalance: wallet.balance - wallet.frozenBalance - amount };
    });

    return { success: true, ...result };
  } catch (error: unknown) {
    console.error('Freeze balance error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to freeze balance';
    return { success: false, error: errorMessage };
  }
}

/**
 * Release frozen balance (for escrow completion)
 * تحرير الرصيد المجمد
 */
export async function releaseFrozenBalance(
  fromUserId: string,
  toUserId: string,
  amount: number,
  escrowId: string
): Promise<TransactionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const senderWallet = await tx.wallet.findUnique({ where: { userId: fromUserId } });

      if (!senderWallet || senderWallet.frozenBalance < amount) {
        throw new Error('Insufficient frozen balance');
      }

      // Unfreeze and deduct from sender
      await tx.wallet.update({
        where: { userId: fromUserId },
        data: {
          balance: { decrement: amount },
          frozenBalance: { decrement: amount },
          lifetimeSpent: { increment: amount },
        },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: senderWallet.id,
          type: WalletTransactionType.ESCROW_RELEASE,
          amount: -amount,
          balanceBefore: senderWallet.balance,
          balanceAfter: senderWallet.balance - amount,
          status: WalletTransactionStatus.COMPLETED,
          description: 'تحرير رصيد الضمان للطرف الآخر',
          relatedEntityType: 'escrow',
          relatedEntityId: escrowId,
          relatedUserId: toUserId,
        },
      });

      // Credit receiver
      let receiverWallet = await tx.wallet.findUnique({ where: { userId: toUserId } });
      if (!receiverWallet) {
        receiverWallet = await tx.wallet.create({
          data: { userId: toUserId, balance: 0, frozenBalance: 0, lifetimeEarned: 0, lifetimeSpent: 0 },
        });
      }

      await tx.wallet.update({
        where: { userId: toUserId },
        data: {
          balance: { increment: amount },
          lifetimeEarned: { increment: amount },
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: receiverWallet.id,
          type: WalletTransactionType.ESCROW_RELEASE,
          amount,
          balanceBefore: receiverWallet.balance,
          balanceAfter: receiverWallet.balance + amount,
          status: WalletTransactionStatus.COMPLETED,
          description: 'استلام رصيد من الضمان',
          relatedEntityType: 'escrow',
          relatedEntityId: escrowId,
          relatedUserId: fromUserId,
        },
      });

      return { transaction };
    });

    return { success: true, ...result };
  } catch (error: unknown) {
    console.error('Release frozen balance error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to release frozen balance';
    return { success: false, error: errorMessage };
  }
}

/**
 * Refund frozen balance (for escrow cancellation)
 * استرداد الرصيد المجمد
 */
export async function refundFrozenBalance(
  userId: string,
  amount: number,
  escrowId: string
): Promise<TransactionResult> {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });

      if (!wallet || wallet.frozenBalance < amount) {
        throw new Error('Insufficient frozen balance');
      }

      // Just unfreeze (don't deduct)
      await tx.wallet.update({
        where: { userId },
        data: {
          frozenBalance: { decrement: amount },
        },
      });

      const transaction = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.ESCROW_REFUND,
          amount, // Positive - returning to available
          balanceBefore: wallet.balance,
          balanceAfter: wallet.balance,
          status: WalletTransactionStatus.COMPLETED,
          description: 'استرداد رصيد الضمان',
          relatedEntityType: 'escrow',
          relatedEntityId: escrowId,
        },
      });

      return { transaction, newBalance: wallet.balance - wallet.frozenBalance + amount };
    });

    return { success: true, ...result };
  } catch (error: unknown) {
    console.error('Refund frozen balance error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to refund frozen balance';
    return { success: false, error: errorMessage };
  }
}

// ============================================
// Reward Functions
// ============================================

/**
 * Award signup bonus
 * منح مكافأة التسجيل
 */
export async function awardSignupBonus(userId: string): Promise<TransactionResult> {
  return creditWallet(
    userId,
    REWARDS.SIGNUP,
    WalletTransactionType.REWARD_SIGNUP,
    'مكافأة التسجيل في المنصة - أهلاً بك!'
  );
}

/**
 * Award first deal bonus
 * منح مكافأة أول صفقة
 */
export async function awardFirstDealBonus(userId: string, dealId: string): Promise<TransactionResult> {
  // Check if user already got this reward
  const existingReward = await prisma.walletTransaction.findFirst({
    where: {
      wallet: { userId },
      type: WalletTransactionType.REWARD_FIRST_DEAL,
    },
  });

  if (existingReward) {
    return { success: false, error: 'Already received first deal bonus' };
  }

  return creditWallet(
    userId,
    REWARDS.FIRST_DEAL,
    WalletTransactionType.REWARD_FIRST_DEAL,
    'مكافأة إتمام أول صفقة!',
    'deal',
    dealId
  );
}

/**
 * Award referral bonus
 * منح مكافأة الإحالة
 */
export async function awardReferralBonus(
  referrerId: string,
  referredId: string,
  referralId: string
): Promise<{ referrerResult: TransactionResult; referredResult: TransactionResult }> {
  const referrerResult = await creditWallet(
    referrerId,
    REWARDS.REFERRAL_REFERRER,
    WalletTransactionType.REWARD_REFERRAL,
    'مكافأة إحالة صديق جديد',
    'referral',
    referralId,
    referredId
  );

  const referredResult = await creditWallet(
    referredId,
    REWARDS.REFERRAL_REFERRED,
    WalletTransactionType.REWARD_REFERRAL,
    'مكافأة الانضمام عبر دعوة صديق',
    'referral',
    referralId,
    referrerId
  );

  return { referrerResult, referredResult };
}

/**
 * Award review bonus
 * منح مكافأة كتابة تقييم
 */
export async function awardReviewBonus(userId: string, reviewId: string): Promise<TransactionResult> {
  return creditWallet(
    userId,
    REWARDS.REVIEW,
    WalletTransactionType.REWARD_REVIEW,
    'مكافأة كتابة تقييم',
    'review',
    reviewId
  );
}

/**
 * Award daily login bonus
 * منح مكافأة الدخول اليومي
 */
export async function awardDailyLoginBonus(userId: string): Promise<TransactionResult> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if already awarded today
  const existingReward = await prisma.walletTransaction.findFirst({
    where: {
      wallet: { userId },
      type: WalletTransactionType.REWARD_DAILY_LOGIN,
      createdAt: { gte: today },
    },
  });

  if (existingReward) {
    return { success: false, error: 'Already received daily login bonus today' };
  }

  return creditWallet(
    userId,
    REWARDS.DAILY_LOGIN,
    WalletTransactionType.REWARD_DAILY_LOGIN,
    'مكافأة الدخول اليومي'
  );
}

/**
 * Award achievement bonus
 * منح مكافأة إنجاز
 */
export async function awardAchievementBonus(
  userId: string,
  achievementId: string,
  coinReward: number
): Promise<TransactionResult> {
  return creditWallet(
    userId,
    coinReward,
    WalletTransactionType.REWARD_ACHIEVEMENT,
    'مكافأة إتمام إنجاز',
    'achievement',
    achievementId
  );
}

/**
 * Award challenge bonus
 * منح مكافأة تحدي
 */
export async function awardChallengeBonus(
  userId: string,
  challengeId: string,
  coinReward: number
): Promise<TransactionResult> {
  return creditWallet(
    userId,
    coinReward,
    WalletTransactionType.REWARD_CHALLENGE,
    'مكافأة إتمام تحدي',
    'challenge',
    challengeId
  );
}

// ============================================
// Spending Functions
// ============================================

/**
 * Spend XCoin for listing promotion
 * إنفاق XCoin لترويج إعلان
 */
export async function spendForPromotion(
  userId: string,
  amount: number,
  listingId: string
): Promise<TransactionResult> {
  return debitWallet(
    userId,
    amount,
    WalletTransactionType.PROMOTE_LISTING,
    'ترويج إعلان',
    'listing',
    listingId
  );
}

/**
 * Spend XCoin to unlock contact info
 * إنفاق XCoin لفتح معلومات التواصل
 */
export async function spendForContactUnlock(
  userId: string,
  targetUserId: string,
  amount: number = 10
): Promise<TransactionResult> {
  return debitWallet(
    userId,
    amount,
    WalletTransactionType.UNLOCK_CONTACT,
    'فتح معلومات تواصل',
    'user',
    targetUserId
  );
}

/**
 * Use XCoin for barter balance
 * استخدام XCoin لموازنة المقايضة
 */
export async function useForBarterBalance(
  fromUserId: string,
  toUserId: string,
  amount: number,
  barterOfferId: string
): Promise<TransactionResult> {
  return transferXCoin({
    fromUserId,
    toUserId,
    amount,
    description: 'موازنة فرق قيمة المقايضة',
    relatedEntityType: 'barter',
    relatedEntityId: barterOfferId,
  });
}

// ============================================
// Transaction History
// ============================================

/**
 * Get wallet transaction history
 * الحصول على سجل معاملات المحفظة
 */
export async function getTransactionHistory(
  userId: string,
  options: {
    limit?: number;
    offset?: number;
    type?: WalletTransactionType;
    startDate?: Date;
    endDate?: Date;
  } = {}
) {
  const { limit = 20, offset = 0, type, startDate, endDate } = options;

  const wallet = await prisma.wallet.findUnique({ where: { userId } });
  if (!wallet) {
    return { transactions: [], total: 0 };
  }

  const where: {
    walletId: string;
    type?: WalletTransactionType;
    createdAt?: { gte?: Date; lte?: Date };
  } = { walletId: wallet.id };

  if (type) {
    where.type = type;
  }

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) where.createdAt.gte = startDate;
    if (endDate) where.createdAt.lte = endDate;
  }

  const [transactions, total] = await Promise.all([
    prisma.walletTransaction.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.walletTransaction.count({ where }),
  ]);

  return { transactions, total };
}

/**
 * Get wallet statistics
 * الحصول على إحصائيات المحفظة
 */
export async function getWalletStats(userId: string) {
  const wallet = await getOrCreateWallet(userId);

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [last30DaysEarned, last7DaysEarned, transactionCount] = await Promise.all([
    prisma.walletTransaction.aggregate({
      where: {
        walletId: wallet.id,
        amount: { gt: 0 },
        createdAt: { gte: thirtyDaysAgo },
      },
      _sum: { amount: true },
    }),
    prisma.walletTransaction.aggregate({
      where: {
        walletId: wallet.id,
        amount: { gt: 0 },
        createdAt: { gte: sevenDaysAgo },
      },
      _sum: { amount: true },
    }),
    prisma.walletTransaction.count({
      where: { walletId: wallet.id },
    }),
  ]);

  return {
    ...wallet,
    last30DaysEarned: last30DaysEarned._sum.amount || 0,
    last7DaysEarned: last7DaysEarned._sum.amount || 0,
    totalTransactions: transactionCount,
  };
}

export { REWARDS };
