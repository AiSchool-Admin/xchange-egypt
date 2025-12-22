/**
 * Smart Escrow & Dispute Resolution Service
 * خدمة الضمان الذكي وحل النزاعات
 */

import { EscrowStatus, EscrowType, DisputeStatus, DisputeReason, DisputeResolution } from '../types';
import prisma from '../lib/prisma';
import * as walletService from './wallet.service';
import * as reputationService from './reputation.service';

// ============================================
// Types & Interfaces
// ============================================

interface CreateEscrowParams {
  escrowType: EscrowType;
  buyerId: string;
  sellerId: string;
  amount: number;
  currency?: string;
  xcoinAmount?: number;
  transactionId?: string;
  barterOfferId?: string;
  barterChainId?: string;
  itemId?: string;
  facilitatorId?: string;
  autoReleaseAfter?: number;
  notes?: string;
}

interface CreateDisputeParams {
  escrowId: string;
  initiatorId: string;
  reason: DisputeReason;
  description: string;
  evidence?: string[];
  requestedAmount?: number;
  requestedOutcome?: string;
}

// ============================================
// Escrow Configuration
// ============================================

const ESCROW_CONFIG = {
  defaultAutoReleaseHours: 48,
  defaultInspectionHours: 24,
  maxEscrowDays: 30,
  disputeResponseDeadlineHours: 72,
};

// ============================================
// Core Escrow Functions
// ============================================

/**
 * Create new escrow
 * إنشاء ضمان جديد
 */
export async function createEscrow(params: CreateEscrowParams) {
  const {
    escrowType,
    buyerId,
    sellerId,
    amount,
    currency = 'EGP',
    xcoinAmount,
    transactionId,
    barterOfferId,
    barterChainId,
    itemId,
    facilitatorId,
    autoReleaseAfter = ESCROW_CONFIG.defaultAutoReleaseHours,
    notes,
  } = params;

  // Calculate expiry date
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + ESCROW_CONFIG.maxEscrowDays);

  // Calculate facilitator fee if applicable
  let facilitatorFee: number | undefined;
  if (facilitatorId) {
    const facilitator = await prisma.facilitator.findUnique({ where: { id: facilitatorId } });
    if (facilitator) {
      facilitatorFee = Math.max(
        amount * facilitator.commissionRate,
        facilitator.minCommission
      );
    }
  }

  const escrow = await prisma.escrow.create({
    data: {
      escrowType,
      buyerId,
      sellerId,
      amount,
      currency,
      xcoinAmount,
      transactionId,
      barterOfferId,
      barterChainId,
      itemId,
      status: EscrowStatus.CREATED,
      autoReleaseAfter,
      autoRelease: true,
      facilitatorId,
      facilitatorFee,
      notes,
      expiresAt,
    },
  });

  // Create initial milestone
  await createMilestone(escrow.id, 'CREATED', 'تم إنشاء الضمان', 'SYSTEM');

  return escrow;
}

/**
 * Fund escrow (buyer deposits money)
 * تمويل الضمان
 */
export async function fundEscrow(escrowId: string, userId: string): Promise<{ success: boolean; error?: string }> {
  const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } });

  if (!escrow) {
    return { success: false, error: 'Escrow not found' };
  }

  if (escrow.status !== EscrowStatus.CREATED) {
    return { success: false, error: 'Escrow already funded or in invalid state' };
  }

  if (escrow.buyerId !== userId) {
    return { success: false, error: 'Only buyer can fund escrow' };
  }

  // If using XCoin, freeze the amount
  if (escrow.xcoinAmount && escrow.xcoinAmount > 0) {
    const freezeResult = await walletService.freezeBalance(userId, escrow.xcoinAmount, escrowId);
    if (!freezeResult.success) {
      return { success: false, error: freezeResult.error || 'Failed to freeze XCoin balance' };
    }
  }

  await prisma.escrow.update({
    where: { id: escrowId },
    data: {
      status: EscrowStatus.FUNDED,
      fundedAt: new Date(),
    },
  });

  await createMilestone(escrowId, 'FUNDED', 'تم تمويل الضمان', 'BUYER', userId);

  return { success: true };
}

/**
 * Mark item as delivered
 * تحديد الصنف كمسلّم
 */
export async function markDelivered(
  escrowId: string,
  userId: string,
  evidence?: string[]
): Promise<{ success: boolean; error?: string }> {
  const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } });

  if (!escrow) {
    return { success: false, error: 'Escrow not found' };
  }

  if (escrow.status !== EscrowStatus.FUNDED && escrow.status !== EscrowStatus.PENDING_DELIVERY) {
    return { success: false, error: 'Escrow not in correct state for delivery' };
  }

  if (escrow.sellerId !== userId) {
    return { success: false, error: 'Only seller can mark as delivered' };
  }

  const inspectionEndsAt = new Date();
  inspectionEndsAt.setHours(inspectionEndsAt.getHours() + ESCROW_CONFIG.defaultInspectionHours);

  await prisma.escrow.update({
    where: { id: escrowId },
    data: {
      status: EscrowStatus.DELIVERED,
      deliveredAt: new Date(),
      inspectionEndsAt,
    },
  });

  await createMilestone(escrowId, 'DELIVERED', 'تم تسليم الصنف', 'SELLER', userId, evidence);

  // Schedule auto-release check
  scheduleAutoRelease(escrowId, escrow.autoReleaseAfter);

  return { success: true };
}

/**
 * Confirm receipt (buyer confirms)
 * تأكيد الاستلام
 */
export async function confirmReceipt(
  escrowId: string,
  userId: string
): Promise<{ success: boolean; error?: string }> {
  const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } });

  if (!escrow) {
    return { success: false, error: 'Escrow not found' };
  }

  if (escrow.status !== EscrowStatus.DELIVERED && escrow.status !== EscrowStatus.INSPECTION) {
    return { success: false, error: 'Escrow not in correct state for confirmation' };
  }

  if (escrow.buyerId !== userId) {
    return { success: false, error: 'Only buyer can confirm receipt' };
  }

  // Release funds to seller
  return releaseEscrow(escrowId, userId, 'تأكيد استلام من المشتري');
}

/**
 * Release escrow funds to seller
 * تحرير أموال الضمان للبائع
 */
export async function releaseEscrow(
  escrowId: string,
  releasedBy: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } });

  if (!escrow) {
    return { success: false, error: 'Escrow not found' };
  }

  if (escrow.status === EscrowStatus.RELEASED || escrow.status === EscrowStatus.REFUNDED) {
    return { success: false, error: 'Escrow already released or refunded' };
  }

  // Release XCoin if applicable
  if (escrow.xcoinAmount && escrow.xcoinAmount > 0) {
    const releaseResult = await walletService.releaseFrozenBalance(
      escrow.buyerId,
      escrow.sellerId,
      escrow.xcoinAmount,
      escrowId
    );

    if (!releaseResult.success) {
      return { success: false, error: releaseResult.error || 'Failed to release XCoin' };
    }
  }

  // Pay facilitator fee if applicable
  if (escrow.facilitatorId && escrow.facilitatorFee) {
    // Deduct from released amount (handled in actual payment)
    await prisma.facilitatorAssignment.updateMany({
      where: { escrowId },
      data: { commissionPaid: true },
    });
  }

  await prisma.escrow.update({
    where: { id: escrowId },
    data: {
      status: EscrowStatus.RELEASED,
      releasedAt: new Date(),
    },
  });

  await createMilestone(escrowId, 'RELEASED', reason, 'SYSTEM', releasedBy);

  // Update reputations
  await reputationService.updateReputationFromDeal(escrow.sellerId, escrowId, true, 'SALE');
  await reputationService.updateReputationFromDeal(escrow.buyerId, escrowId, true, 'SALE');

  return { success: true };
}

/**
 * Refund escrow to buyer
 * استرداد الضمان للمشتري
 */
export async function refundEscrow(
  escrowId: string,
  refundedBy: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } });

  if (!escrow) {
    return { success: false, error: 'Escrow not found' };
  }

  if (escrow.status === EscrowStatus.RELEASED || escrow.status === EscrowStatus.REFUNDED) {
    return { success: false, error: 'Escrow already released or refunded' };
  }

  // Refund XCoin if applicable
  if (escrow.xcoinAmount && escrow.xcoinAmount > 0) {
    const refundResult = await walletService.refundFrozenBalance(
      escrow.buyerId,
      escrow.xcoinAmount,
      escrowId
    );

    if (!refundResult.success) {
      return { success: false, error: refundResult.error || 'Failed to refund XCoin' };
    }
  }

  await prisma.escrow.update({
    where: { id: escrowId },
    data: {
      status: EscrowStatus.REFUNDED,
    },
  });

  await createMilestone(escrowId, 'REFUNDED', reason, 'SYSTEM', refundedBy);

  return { success: true };
}

/**
 * Cancel escrow
 * إلغاء الضمان
 */
export async function cancelEscrow(
  escrowId: string,
  cancelledBy: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } });

  if (!escrow) {
    return { success: false, error: 'Escrow not found' };
  }

  if (escrow.status !== EscrowStatus.CREATED) {
    return { success: false, error: 'Can only cancel unfunded escrow' };
  }

  await prisma.escrow.update({
    where: { id: escrowId },
    data: { status: EscrowStatus.CANCELLED },
  });

  await createMilestone(escrowId, 'CANCELLED', reason, 'SYSTEM', cancelledBy);

  return { success: true };
}

// ============================================
// Dispute Functions
// ============================================

/**
 * Open a dispute
 * فتح نزاع
 */
export async function openDispute(params: CreateDisputeParams): Promise<{ success: boolean; dispute?: any; error?: string }> {
  const { escrowId, initiatorId, reason, description, evidence = [], requestedAmount, requestedOutcome } = params;

  const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } });

  if (!escrow) {
    return { success: false, error: 'Escrow not found' };
  }

  // Check if dispute already exists
  const existingDispute = await prisma.dispute.findUnique({ where: { escrowId } });
  if (existingDispute) {
    return { success: false, error: 'Dispute already exists for this escrow' };
  }

  // Determine respondent
  const respondentId = initiatorId === escrow.buyerId ? escrow.sellerId : escrow.buyerId;

  // Calculate response deadline
  const responseDeadline = new Date();
  responseDeadline.setHours(responseDeadline.getHours() + ESCROW_CONFIG.disputeResponseDeadlineHours);

  const dispute = await prisma.dispute.create({
    data: {
      escrowId,
      initiatorId,
      respondentId,
      reason,
      description,
      evidence,
      requestedAmount,
      requestedOutcome,
      status: DisputeStatus.OPEN,
      responseDeadline,
    },
  });

  // Update escrow status
  await prisma.escrow.update({
    where: { id: escrowId },
    data: { status: EscrowStatus.DISPUTED },
  });

  // Create milestone
  await createMilestone(escrowId, 'DISPUTED', `تم فتح نزاع: ${reason}`, 'BUYER', initiatorId);

  // Add initial dispute message
  await addDisputeMessage(dispute.id, initiatorId, 'INITIATOR', description, evidence);

  return { success: true, dispute };
}

/**
 * Respond to dispute
 * الرد على النزاع
 */
export async function respondToDispute(
  disputeId: string,
  respondentId: string,
  message: string,
  attachments?: string[]
): Promise<{ success: boolean; error?: string }> {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });

  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  if (dispute.respondentId !== respondentId) {
    return { success: false, error: 'Only respondent can respond' };
  }

  await addDisputeMessage(disputeId, respondentId, 'RESPONDENT', message, attachments);

  await prisma.dispute.update({
    where: { id: disputeId },
    data: { status: DisputeStatus.UNDER_REVIEW },
  });

  return { success: true };
}

/**
 * Add message to dispute
 * إضافة رسالة للنزاع
 */
export async function addDisputeMessage(
  disputeId: string,
  senderId: string,
  senderRole: string,
  message: string,
  attachments?: string[],
  isInternal: boolean = false
) {
  return prisma.disputeMessage.create({
    data: {
      disputeId,
      senderId,
      senderRole,
      message,
      attachments: attachments || [],
      isInternal,
    },
  });
}

/**
 * Resolve dispute
 * حل النزاع
 */
export async function resolveDispute(
  disputeId: string,
  resolvedBy: string,
  resolution: DisputeResolution,
  resolutionAmount?: number,
  resolutionNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const dispute = await prisma.dispute.findUnique({
    where: { id: disputeId },
    include: { escrow: true },
  });

  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  await prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: DisputeStatus.RESOLVED,
      resolution,
      resolutionAmount,
      resolutionNotes,
      resolvedBy,
      resolvedAt: new Date(),
    },
  });

  // Handle resolution based on outcome
  switch (resolution) {
    case DisputeResolution.BUYER_FAVORED:
      await refundEscrow(dispute.escrowId, resolvedBy, 'حل النزاع لصالح المشتري');
      await reputationService.updateReputationFromDispute(dispute.respondentId, disputeId, 'RESPONDENT', 'LOST');
      break;

    case DisputeResolution.SELLER_FAVORED:
      await releaseEscrow(dispute.escrowId, resolvedBy, 'حل النزاع لصالح البائع');
      await reputationService.updateReputationFromDispute(dispute.initiatorId, disputeId, 'INITIATOR', 'LOST');
      break;

    case DisputeResolution.PARTIAL_REFUND:
      // Handle partial refund logic here
      if (resolutionAmount && dispute.escrow.xcoinAmount) {
        // Partial refund to buyer, rest to seller
        const refundAmount = Math.min(resolutionAmount, dispute.escrow.xcoinAmount);
        const releaseAmount = dispute.escrow.xcoinAmount - refundAmount;

        // This would need more complex logic for partial releases
      }
      await reputationService.updateReputationFromDispute(dispute.initiatorId, disputeId, 'INITIATOR', 'MUTUAL');
      await reputationService.updateReputationFromDispute(dispute.respondentId, disputeId, 'RESPONDENT', 'MUTUAL');
      break;

    case DisputeResolution.MUTUAL_AGREEMENT:
      await reputationService.updateReputationFromDispute(dispute.initiatorId, disputeId, 'INITIATOR', 'MUTUAL');
      await reputationService.updateReputationFromDispute(dispute.respondentId, disputeId, 'RESPONDENT', 'MUTUAL');
      break;
  }

  return { success: true };
}

/**
 * Escalate dispute to admin
 * رفع النزاع للإدارة
 */
export async function escalateDispute(
  disputeId: string,
  escalatedBy: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });

  if (!dispute) {
    return { success: false, error: 'Dispute not found' };
  }

  await prisma.dispute.update({
    where: { id: disputeId },
    data: { status: DisputeStatus.ESCALATED },
  });

  await addDisputeMessage(disputeId, escalatedBy, 'SYSTEM', `تم رفع النزاع للإدارة: ${reason}`, [], true);

  return { success: true };
}

// ============================================
// Query Functions
// ============================================

/**
 * Get escrow by ID
 */
export async function getEscrow(escrowId: string) {
  return prisma.escrow.findUnique({
    where: { id: escrowId },
    include: {
      milestones: { orderBy: { createdAt: 'desc' } },
      dispute: {
        include: {
          messages: { orderBy: { createdAt: 'asc' } },
        },
      },
    },
  });
}

/**
 * Get user's escrows
 */
export async function getUserEscrows(
  userId: string,
  options: {
    role?: 'BUYER' | 'SELLER' | 'ALL';
    status?: EscrowStatus;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { role = 'ALL', status, limit = 20, offset = 0 } = options;

  const where: any = {};

  if (role === 'BUYER') {
    where.buyerId = userId;
  } else if (role === 'SELLER') {
    where.sellerId = userId;
  } else {
    where.OR = [{ buyerId: userId }, { sellerId: userId }];
  }

  if (status) {
    where.status = status;
  }

  const [escrows, total] = await Promise.all([
    prisma.escrow.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
      include: {
        dispute: true,
      },
    }),
    prisma.escrow.count({ where }),
  ]);

  return { escrows, total };
}

/**
 * Get dispute details
 */
export async function getDispute(disputeId: string) {
  return prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      escrow: true,
      messages: {
        where: { isInternal: false },
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

// ============================================
// Helper Functions
// ============================================

/**
 * Create escrow milestone
 */
async function createMilestone(
  escrowId: string,
  milestone: string,
  description: string,
  actorType: string,
  actorId?: string,
  evidence?: string[]
) {
  return prisma.escrowMilestone.create({
    data: {
      escrowId,
      milestone,
      description,
      actorType,
      actorId,
      evidence: evidence || [],
    },
  });
}

/**
 * Schedule auto-release check
 */
function scheduleAutoRelease(escrowId: string, hoursAfterDelivery: number) {
  // In production, this would use a job queue (Bull, Agenda, etc.)
  // For now, we'll just log it
  console.log(`Auto-release scheduled for escrow ${escrowId} in ${hoursAfterDelivery} hours`);

  // Simple timeout for demo (not recommended for production)
  setTimeout(async () => {
    const escrow = await prisma.escrow.findUnique({ where: { id: escrowId } });

    if (escrow && escrow.status === EscrowStatus.DELIVERED && escrow.autoRelease) {
      await releaseEscrow(escrowId, 'SYSTEM', 'تحرير تلقائي بعد انتهاء فترة الفحص');
    }
  }, hoursAfterDelivery * 60 * 60 * 1000);
}

/**
 * Check and process expired escrows
 */
export async function processExpiredEscrows() {
  const now = new Date();

  // Find expired escrows
  const expiredEscrows = await prisma.escrow.findMany({
    where: {
      expiresAt: { lte: now },
      status: { in: [EscrowStatus.CREATED, EscrowStatus.FUNDED, EscrowStatus.PENDING_DELIVERY] },
    },
  });

  for (const escrow of expiredEscrows) {
    await prisma.escrow.update({
      where: { id: escrow.id },
      data: { status: EscrowStatus.EXPIRED },
    });

    // Refund if funded
    if (escrow.status === EscrowStatus.FUNDED && escrow.xcoinAmount) {
      await walletService.refundFrozenBalance(escrow.buyerId, escrow.xcoinAmount, escrow.id);
    }

    await createMilestone(escrow.id, 'EXPIRED', 'انتهت صلاحية الضمان', 'SYSTEM');
  }

  return expiredEscrows.length;
}
