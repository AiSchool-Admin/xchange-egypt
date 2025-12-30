/**
 * Cash Flow Service
 *
 * Manages cash movements in barter chains, including:
 * - Cash to balance unequal trades
 * - Platform commissions
 * - Shipping fees
 * - Manual adjustments
 *
 * Provides full audit trail for all cash transactions
 */

import { Prisma } from '@prisma/client';
import { CashFlowStatus, CashFlowType } from '../types';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import prisma from '../lib/prisma';

// ============================================
// Types
// ============================================

export interface CreateCashFlowInput {
  chainId?: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency?: string;
  flowType?: CashFlowType;
  paymentMethod?: string;
  description?: string;
  notes?: string;
}

export interface UpdateCashFlowInput {
  cashFlowId: string;
  paymentStatus?: CashFlowStatus;
  paymentReference?: string;
  notes?: string;
}

export interface CashFlowQuery {
  chainId?: string;
  userId?: string;
  status?: CashFlowStatus;
  flowType?: CashFlowType;
  page?: number;
  limit?: number;
}

// ============================================
// Constants
// ============================================

export const DEFAULT_COMMISSION_RATE = 0.05; // 5%
export const DEFAULT_CURRENCY = 'EGP';

// ============================================
// Cash Flow Management
// ============================================

/**
 * Create a new cash flow record
 */
export const createCashFlow = async (input: CreateCashFlowInput) => {
  const {
    chainId,
    fromUserId,
    toUserId,
    amount,
    currency = DEFAULT_CURRENCY,
    flowType = CashFlowType.CHAIN_BALANCE,
    paymentMethod,
    description,
    notes,
  } = input;

  // Validate amount
  if (amount <= 0) {
    throw new BadRequestError('Amount must be greater than zero');
  }

  // Validate users exist
  const [fromUser, toUser] = await Promise.all([
    prisma.user.findUnique({
      where: { id: fromUserId },
      select: { id: true, fullName: true },
    }),
    prisma.user.findUnique({
      where: { id: toUserId },
      select: { id: true, fullName: true },
    }),
  ]);

  if (!fromUser) {
    throw new NotFoundError('Sender user not found');
  }

  if (!toUser) {
    throw new NotFoundError('Recipient user not found');
  }

  // Validate chain exists if provided
  if (chainId) {
    const chain = await prisma.barterChain.findUnique({
      where: { id: chainId },
    });

    if (!chain) {
      throw new NotFoundError('Barter chain not found');
    }
  }

  // Create cash flow
  const cashFlow = await prisma.cashFlow.create({
    data: {
      chainId,
      fromUserId,
      toUserId,
      amount,
      currency,
      flowType,
      paymentMethod,
      paymentStatus: CashFlowStatus.PENDING,
      description,
      notes,
    },
  });

  return cashFlow;
};

/**
 * Update cash flow status
 */
export const updateCashFlow = async (input: UpdateCashFlowInput, userId: string) => {
  const { cashFlowId, paymentStatus, paymentReference, notes } = input;

  const cashFlow = await prisma.cashFlow.findUnique({
    where: { id: cashFlowId },
  });

  if (!cashFlow) {
    throw new NotFoundError('Cash flow not found');
  }

  // Only the sender or recipient can update
  if (cashFlow.fromUserId !== userId && cashFlow.toUserId !== userId) {
    throw new ForbiddenError('You are not authorized to update this cash flow');
  }

  // Validate status transition
  if (paymentStatus) {
    validateStatusTransition(cashFlow.paymentStatus, paymentStatus);
  }

  const updateData: Record<string, unknown> = {};
  if (paymentStatus) updateData.paymentStatus = paymentStatus;
  if (paymentReference) updateData.paymentReference = paymentReference;
  if (notes) updateData.notes = notes;

  // Set completed/refunded timestamps
  if (paymentStatus === CashFlowStatus.COMPLETED) {
    updateData.completedAt = new Date();
  } else if (paymentStatus === CashFlowStatus.REFUNDED) {
    updateData.refundedAt = new Date();
  }

  const updated = await prisma.cashFlow.update({
    where: { id: cashFlowId },
    data: updateData as any,
  });

  return updated;
};

/**
 * Mark cash flow as completed
 */
export const completeCashFlow = async (cashFlowId: string, userId: string, paymentReference?: string) => {
  return await updateCashFlow(
    {
      cashFlowId,
      paymentStatus: CashFlowStatus.COMPLETED,
      paymentReference,
    },
    userId
  );
};

/**
 * Mark cash flow as failed
 */
export const failCashFlow = async (cashFlowId: string, userId: string, reason?: string) => {
  return await updateCashFlow(
    {
      cashFlowId,
      paymentStatus: CashFlowStatus.FAILED,
      notes: reason,
    },
    userId
  );
};

/**
 * Refund a cash flow
 */
export const refundCashFlow = async (cashFlowId: string, userId: string, reason?: string) => {
  const cashFlow = await prisma.cashFlow.findUnique({
    where: { id: cashFlowId },
  });

  if (!cashFlow) {
    throw new NotFoundError('Cash flow not found');
  }

  if (cashFlow.paymentStatus !== CashFlowStatus.COMPLETED) {
    throw new BadRequestError('Can only refund completed cash flows');
  }

  return await updateCashFlow(
    {
      cashFlowId,
      paymentStatus: CashFlowStatus.REFUNDED,
      notes: reason,
    },
    userId
  );
};

/**
 * Cancel a pending cash flow
 */
export const cancelCashFlow = async (cashFlowId: string, userId: string, reason?: string) => {
  const cashFlow = await prisma.cashFlow.findUnique({
    where: { id: cashFlowId },
  });

  if (!cashFlow) {
    throw new NotFoundError('Cash flow not found');
  }

  if (cashFlow.paymentStatus !== CashFlowStatus.PENDING) {
    throw new BadRequestError('Can only cancel pending cash flows');
  }

  return await updateCashFlow(
    {
      cashFlowId,
      paymentStatus: CashFlowStatus.CANCELLED,
      notes: reason,
    },
    userId
  );
};

// ============================================
// Chain-Specific Operations
// ============================================

/**
 * Create all cash flows for a barter chain
 * Automatically calculates balance adjustments and commission
 */
export const createChainCashFlows = async (chainId: string) => {
  const chain = await prisma.barterChain.findUnique({
    where: { id: chainId },
    include: {
      participants: {
        include: {
          givingItem: true,
          receivingItem: true,
        },
      },
    },
  });

  if (!chain) {
    throw new NotFoundError('Barter chain not found');
  }

  const cashFlows = [];

  // Calculate value differences and create balance cash flows
  for (const participant of chain.participants) {
    const givingValue = participant.givingItem.estimatedValue;
    const receivingValue = participant.receivingItem.estimatedValue;
    const difference = receivingValue - givingValue;

    // If receiving item is worth more, participant needs to pay cash
    if (difference > 0) {
      const nextParticipant = chain.participants.find(
        (p) => p.receivingItemId === participant.givingItemId
      );

      if (nextParticipant) {
        const cashFlow = await createCashFlow({
          chainId,
          fromUserId: participant.userId,
          toUserId: nextParticipant.userId,
          amount: difference,
          flowType: CashFlowType.CHAIN_BALANCE,
          description: `Balance payment for unequal trade in chain ${chainId}`,
        });
        cashFlows.push(cashFlow);
      }
    }
  }

  // Create commission cash flow if applicable
  if (chain.commissionAmount && chain.commissionAmount > 0) {
    // Commission typically paid by the chain initiator (first participant)
    const initiator = chain.participants[0];

    const commissionFlow = await createCashFlow({
      chainId,
      fromUserId: initiator.userId,
      toUserId: 'PLATFORM', // Special ID for platform
      amount: chain.commissionAmount,
      flowType: CashFlowType.COMMISSION,
      description: `Platform commission for chain ${chainId}`,
    });
    cashFlows.push(commissionFlow);
  }

  // Update chain totals
  const totalCashFlow = cashFlows
    .filter((cf) => cf.flowType === CashFlowType.CHAIN_BALANCE)
    .reduce((sum, cf) => sum + Number(cf.amount), 0);

  await prisma.barterChain.update({
    where: { id: chainId },
    data: {
      involvesCash: cashFlows.length > 0,
      totalCashFlow,
    },
  });

  return cashFlows;
};

/**
 * Get all cash flows for a chain
 */
export const getChainCashFlows = async (chainId: string) => {
  const cashFlows = await prisma.cashFlow.findMany({
    where: { chainId },
    orderBy: { createdAt: 'desc' },
  });

  return cashFlows;
};

/**
 * Calculate total pending cash flows for a chain
 */
export const getChainPendingTotal = async (chainId: string) => {
  const result = await prisma.cashFlow.aggregate({
    where: {
      chainId,
      paymentStatus: CashFlowStatus.PENDING,
    },
    _sum: {
      amount: true,
    },
  });

  return result._sum.amount ? Number(result._sum.amount) : 0;
};

// ============================================
// Commission Calculations
// ============================================

/**
 * Calculate commission for a given total value
 */
export const calculateCommission = (totalValue: number, rate: number = DEFAULT_COMMISSION_RATE): number => {
  if (totalValue <= 0) {
    return 0;
  }

  if (rate < 0 || rate > 1) {
    throw new BadRequestError('Commission rate must be between 0 and 1');
  }

  return Math.round(totalValue * rate * 100) / 100; // Round to 2 decimals
};

/**
 * Create a commission cash flow
 */
export const createCommissionFlow = async (
  chainId: string,
  fromUserId: string,
  amount: number
) => {
  return await createCashFlow({
    chainId,
    fromUserId,
    toUserId: 'PLATFORM',
    amount,
    flowType: CashFlowType.COMMISSION,
    description: `Platform commission for chain ${chainId}`,
  });
};

// ============================================
// Queries
// ============================================

/**
 * Get cash flows with filters and pagination
 */
export const getCashFlows = async (query: CashFlowQuery) => {
  const { chainId, userId, status, flowType, page = 1, limit = 20 } = query;

  const where: Record<string, unknown> = {};

  if (chainId) {
    where.chainId = chainId;
  }

  if (userId) {
    where.OR = [{ fromUserId: userId }, { toUserId: userId }];
  }

  if (status) {
    where.paymentStatus = status;
  }

  if (flowType) {
    where.flowType = flowType;
  }

  const skip = (page - 1) * limit;
  const total = await prisma.cashFlow.count({ where: where as any });

  const cashFlows = await prisma.cashFlow.findMany({
    where: where as any,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
  });

  const totalPages = Math.ceil(total / limit);

  return {
    items: cashFlows,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasMore: page < totalPages,
    },
  };
};

/**
 * Get user's cash flow summary
 */
export const getUserCashFlowSummary = async (userId: string) => {
  const [sent, received, pending] = await Promise.all([
    prisma.cashFlow.aggregate({
      where: {
        fromUserId: userId,
        paymentStatus: CashFlowStatus.COMPLETED,
      },
      _sum: { amount: true },
    }),
    prisma.cashFlow.aggregate({
      where: {
        toUserId: userId,
        paymentStatus: CashFlowStatus.COMPLETED,
      },
      _sum: { amount: true },
    }),
    prisma.cashFlow.aggregate({
      where: {
        OR: [{ fromUserId: userId }, { toUserId: userId }],
        paymentStatus: CashFlowStatus.PENDING,
      },
      _sum: { amount: true },
    }),
  ]);

  const sentAmount = sent._sum.amount ? Number(sent._sum.amount) : 0;
  const receivedAmount = received._sum.amount ? Number(received._sum.amount) : 0;
  const pendingAmt = pending._sum.amount ? Number(pending._sum.amount) : 0;

  return {
    totalSent: sentAmount,
    totalReceived: receivedAmount,
    pendingAmount: pendingAmt,
    netFlow: receivedAmount - sentAmount,
  };
};

/**
 * Get cash flow statistics
 */
export const getCashFlowStats = async () => {
  const [total, completed, pending, failed, byType] = await Promise.all([
    prisma.cashFlow.count(),
    prisma.cashFlow.aggregate({
      where: { paymentStatus: CashFlowStatus.COMPLETED },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.cashFlow.aggregate({
      where: { paymentStatus: CashFlowStatus.PENDING },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.cashFlow.count({
      where: { paymentStatus: CashFlowStatus.FAILED },
    }),
    prisma.cashFlow.groupBy({
      by: ['flowType'],
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  return {
    totalTransactions: total,
    completedAmount: completed._sum.amount ? Number(completed._sum.amount) : 0,
    completedCount: completed._count,
    pendingAmount: pending._sum.amount ? Number(pending._sum.amount) : 0,
    pendingCount: pending._count,
    failedCount: failed,
    byType: byType.reduce((acc, item) => {
      acc[item.flowType] = {
        amount: item._sum.amount ? Number(item._sum.amount) : 0,
        count: item._count,
      };
      return acc;
    }, {} as Record<string, { amount: number; count: number }>),
  };
};

// ============================================
// Helpers
// ============================================

/**
 * Validate status transition
 */
function validateStatusTransition(from: CashFlowStatus, to: CashFlowStatus) {
  const validTransitions: Record<CashFlowStatus, CashFlowStatus[]> = {
    [CashFlowStatus.PENDING]: [
      CashFlowStatus.COMPLETED,
      CashFlowStatus.FAILED,
      CashFlowStatus.CANCELLED,
    ],
    [CashFlowStatus.COMPLETED]: [CashFlowStatus.REFUNDED],
    [CashFlowStatus.FAILED]: [CashFlowStatus.PENDING], // Retry
    [CashFlowStatus.REFUNDED]: [],
    [CashFlowStatus.CANCELLED]: [],
  };

  if (!validTransitions[from].includes(to)) {
    throw new BadRequestError(
      `Invalid status transition from ${from} to ${to}`
    );
  }
}
