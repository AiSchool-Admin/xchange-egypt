import {
  PropertyBarterStatus,
  PropertyEscrowStatus,
  PropertyStatus,
  Prisma,
} from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import prisma from '../lib/prisma';

// ============================================
// Types & Interfaces
// ============================================

interface CreateBarterProposalData {
  offeredPropertyId: string;
  requestedPropertyId: string;
  cashDifference?: number;
  cashPayer?: 'proposer' | 'receiver';
  message?: string;
}

interface RespondToProposalData {
  action: 'accept' | 'reject' | 'counter';
  counterOffer?: {
    cashDifference?: number;
    message?: string;
  };
  response?: string;
}

// ============================================
// Barter Proposal Operations
// ============================================

/**
 * Create a barter proposal for property exchange
 */
export const createBarterProposal = async (
  proposerId: string,
  data: CreateBarterProposalData
): Promise<any> => {
  // Validate offered property
  const offeredProperty = await prisma.property.findUnique({
    where: { id: data.offeredPropertyId },
    include: {
      owner: {
        select: { id: true, fullName: true },
      },
    },
  });

  if (!offeredProperty) {
    throw new NotFoundError('Offered property not found');
  }

  if (offeredProperty.ownerId !== proposerId) {
    throw new ForbiddenError('You do not own the offered property');
  }

  if (offeredProperty.status !== PropertyStatus.ACTIVE) {
    throw new BadRequestError('Offered property is not active');
  }

  // Validate requested property
  const requestedProperty = await prisma.property.findUnique({
    where: { id: data.requestedPropertyId },
    include: {
      owner: {
        select: { id: true, fullName: true },
      },
    },
  });

  if (!requestedProperty) {
    throw new NotFoundError('Requested property not found');
  }

  if (requestedProperty.status !== PropertyStatus.ACTIVE) {
    throw new BadRequestError('Requested property is not active');
  }

  if (!requestedProperty.openForBarter) {
    throw new BadRequestError('Requested property is not open for barter');
  }

  if (requestedProperty.ownerId === proposerId) {
    throw new BadRequestError('Cannot propose barter with your own property');
  }

  // Check for existing pending proposal
  const existingProposal = await prisma.propertyBarterProposal.findFirst({
    where: {
      proposerId,
      offeredPropertyId: data.offeredPropertyId,
      requestedPropertyId: data.requestedPropertyId,
      status: { in: [PropertyBarterStatus.PENDING, PropertyBarterStatus.VIEWED] },
    },
  });

  if (existingProposal) {
    throw new BadRequestError('You already have a pending proposal for this exchange');
  }

  // Calculate values and commission
  const offeredValue = offeredProperty.salePrice || offeredProperty.estimatedValue || 0;
  const requestedValue = requestedProperty.salePrice || requestedProperty.estimatedValue || 0;
  const valueDifference = requestedValue - offeredValue;

  // Determine cash difference and payer
  let cashDifference = data.cashDifference ?? Math.abs(valueDifference);
  let cashPayer = data.cashPayer || (valueDifference > 0 ? 'proposer' : 'receiver');

  // Calculate commissions (1% from each party based on their property value)
  const proposerCommission = offeredValue * 0.01;
  const receiverCommission = requestedValue * 0.01;

  // Create the proposal
  const proposal = await prisma.propertyBarterProposal.create({
    data: {
      proposerId,
      receiverId: requestedProperty.ownerId,
      offeredPropertyId: data.offeredPropertyId,
      requestedPropertyId: data.requestedPropertyId,
      offeredItems: [
        {
          type: 'property',
          id: offeredProperty.id,
          value: offeredValue,
          titleType: offeredProperty.titleType,
          verified: offeredProperty.verificationLevel !== 'UNVERIFIED',
        },
      ],
      requestedItems: [
        {
          type: 'property',
          id: requestedProperty.id,
          value: requestedValue,
          titleType: requestedProperty.titleType,
          verified: requestedProperty.verificationLevel !== 'UNVERIFIED',
        },
      ],
      cashDifference,
      cashPayer,
      totalOfferedValue: offeredValue,
      totalRequestedValue: requestedValue,
      proposerCommission,
      receiverCommission,
      proposerMessage: data.message,
      status: PropertyBarterStatus.PENDING,
    },
    include: {
      proposer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
        },
      },
      receiver: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
        },
      },
      offeredProperty: true,
      requestedProperty: true,
    },
  });

  // TODO: Send notification to receiver

  return {
    proposal,
    calculation: {
      offeredTotalValue: offeredValue,
      requestedTotalValue: requestedValue,
      cashDifference,
      cashPayer,
      proposerCommission,
      receiverCommission,
      totalTransactionValue: offeredValue + requestedValue,
    },
    requiredSteps: [
      'تقييم مهني للعقارين',
      'مراجعة قانونية',
      'إيداع Escrow',
      'نقل الملكية',
    ],
    estimatedCompletionDays: 45,
  };
};

/**
 * Get barter proposal by ID
 */
export const getBarterProposalById = async (
  proposalId: string,
  userId: string
): Promise<any> => {
  const proposal = await prisma.propertyBarterProposal.findUnique({
    where: { id: proposalId },
    include: {
      proposer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
          rating: true,
        },
      },
      receiver: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
          rating: true,
        },
      },
      offeredProperty: {
        include: {
          inspections: {
            where: { status: 'COMPLETED' },
            take: 1,
            orderBy: { completedAt: 'desc' },
          },
        },
      },
      requestedProperty: {
        include: {
          inspections: {
            where: { status: 'COMPLETED' },
            take: 1,
            orderBy: { completedAt: 'desc' },
          },
        },
      },
      counterProposal: true,
    },
  });

  if (!proposal) {
    throw new NotFoundError('Barter proposal not found');
  }

  // Check if user is involved
  if (proposal.proposerId !== userId && proposal.receiverId !== userId) {
    throw new ForbiddenError('You are not involved in this proposal');
  }

  // Mark as viewed if receiver is viewing for the first time
  if (proposal.receiverId === userId && proposal.status === PropertyBarterStatus.PENDING) {
    await prisma.propertyBarterProposal.update({
      where: { id: proposalId },
      data: { status: PropertyBarterStatus.VIEWED },
    });
  }

  return proposal;
};

/**
 * Respond to a barter proposal
 */
export const respondToProposal = async (
  proposalId: string,
  userId: string,
  data: RespondToProposalData
): Promise<any> => {
  const proposal = await prisma.propertyBarterProposal.findUnique({
    where: { id: proposalId },
    include: {
      offeredProperty: true,
      requestedProperty: true,
    },
  });

  if (!proposal) {
    throw new NotFoundError('Barter proposal not found');
  }

  if (proposal.receiverId !== userId) {
    throw new ForbiddenError('Only the receiver can respond to this proposal');
  }

  if (!['PENDING', 'VIEWED'].includes(proposal.status)) {
    throw new BadRequestError('This proposal cannot be responded to');
  }

  const now = new Date();

  switch (data.action) {
    case 'accept':
      // Update proposal status
      const acceptedProposal = await prisma.propertyBarterProposal.update({
        where: { id: proposalId },
        data: {
          status: PropertyBarterStatus.ACCEPTED,
          receiverResponse: data.response,
          respondedAt: now,
        },
        include: {
          proposer: { select: { id: true, fullName: true } },
          receiver: { select: { id: true, fullName: true } },
          offeredProperty: true,
          requestedProperty: true,
        },
      });

      // Reserve both properties
      await prisma.$transaction([
        prisma.property.update({
          where: { id: proposal.offeredPropertyId },
          data: { status: PropertyStatus.RESERVED },
        }),
        prisma.property.update({
          where: { id: proposal.requestedPropertyId },
          data: { status: PropertyStatus.RESERVED },
        }),
      ]);

      // TODO: Create escrow transaction
      // TODO: Send notifications

      return {
        proposal: acceptedProposal,
        nextSteps: [
          'سيتم إنشاء حساب Escrow للمعاملة',
          'يرجى إيداع العربون خلال 48 ساعة',
          'سيتم ترتيب فحص ميداني للعقارين',
          'بعد التحقق، سيتم نقل الملكية',
        ],
      };

    case 'reject':
      const rejectedProposal = await prisma.propertyBarterProposal.update({
        where: { id: proposalId },
        data: {
          status: PropertyBarterStatus.REJECTED,
          receiverResponse: data.response,
          respondedAt: now,
        },
      });

      // TODO: Send notification to proposer

      return { proposal: rejectedProposal };

    case 'counter':
      if (!data.counterOffer) {
        throw new BadRequestError('Counter offer details are required');
      }

      // Create counter proposal
      const counterProposal = await prisma.propertyBarterProposal.create({
        data: {
          proposerId: userId, // Receiver becomes proposer
          receiverId: proposal.proposerId, // Original proposer becomes receiver
          offeredPropertyId: proposal.requestedPropertyId, // Swap
          requestedPropertyId: proposal.offeredPropertyId, // Swap
          offeredItems: proposal.requestedItems,
          requestedItems: proposal.offeredItems,
          cashDifference: data.counterOffer.cashDifference ?? proposal.cashDifference,
          cashPayer: proposal.cashPayer === 'proposer' ? 'receiver' : 'proposer',
          totalOfferedValue: proposal.totalRequestedValue,
          totalRequestedValue: proposal.totalOfferedValue,
          proposerCommission: proposal.receiverCommission,
          receiverCommission: proposal.proposerCommission,
          proposerMessage: data.counterOffer.message,
          status: PropertyBarterStatus.PENDING,
        },
        include: {
          proposer: { select: { id: true, fullName: true } },
          receiver: { select: { id: true, fullName: true } },
          offeredProperty: true,
          requestedProperty: true,
        },
      });

      // Update original proposal
      await prisma.propertyBarterProposal.update({
        where: { id: proposalId },
        data: {
          status: PropertyBarterStatus.COUNTER_OFFERED,
          counterProposalId: counterProposal.id,
          receiverResponse: data.response,
          respondedAt: now,
        },
      });

      // TODO: Send notification to original proposer

      return {
        originalProposal: { id: proposalId, status: PropertyBarterStatus.COUNTER_OFFERED },
        counterProposal,
      };

    default:
      throw new BadRequestError('Invalid action');
  }
};

/**
 * Cancel a barter proposal
 */
export const cancelProposal = async (
  proposalId: string,
  userId: string
): Promise<any> => {
  const proposal = await prisma.propertyBarterProposal.findUnique({
    where: { id: proposalId },
  });

  if (!proposal) {
    throw new NotFoundError('Barter proposal not found');
  }

  if (proposal.proposerId !== userId) {
    throw new ForbiddenError('Only the proposer can cancel this proposal');
  }

  if (!['PENDING', 'VIEWED'].includes(proposal.status)) {
    throw new BadRequestError('This proposal cannot be cancelled');
  }

  return prisma.propertyBarterProposal.update({
    where: { id: proposalId },
    data: {
      status: PropertyBarterStatus.REJECTED,
      receiverResponse: 'ألغي بواسطة المقترح',
      respondedAt: new Date(),
    },
  });
};

/**
 * Get user's barter proposals
 */
export const getUserBarterProposals = async (
  userId: string,
  type: 'sent' | 'received' | 'all' = 'all',
  status?: PropertyBarterStatus
): Promise<any[]> => {
  const where: Prisma.PropertyBarterProposalWhereInput = {};

  if (type === 'sent') {
    where.proposerId = userId;
  } else if (type === 'received') {
    where.receiverId = userId;
  } else {
    where.OR = [{ proposerId: userId }, { receiverId: userId }];
  }

  if (status) {
    where.status = status;
  }

  return prisma.propertyBarterProposal.findMany({
    where,
    include: {
      proposer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      receiver: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      offeredProperty: {
        select: {
          id: true,
          title: true,
          propertyType: true,
          governorate: true,
          city: true,
          areaSqm: true,
          salePrice: true,
          images: true,
          titleType: true,
          verificationLevel: true,
        },
      },
      requestedProperty: {
        select: {
          id: true,
          title: true,
          propertyType: true,
          governorate: true,
          city: true,
          areaSqm: true,
          salePrice: true,
          images: true,
          titleType: true,
          verificationLevel: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

/**
 * Complete a barter transaction
 */
export const completeBarterTransaction = async (
  proposalId: string,
  adminId: string
): Promise<any> => {
  const proposal = await prisma.propertyBarterProposal.findUnique({
    where: { id: proposalId },
    include: {
      offeredProperty: true,
      requestedProperty: true,
    },
  });

  if (!proposal) {
    throw new NotFoundError('Barter proposal not found');
  }

  if (proposal.status !== PropertyBarterStatus.ACCEPTED) {
    throw new BadRequestError('Proposal must be accepted before completion');
  }

  // Update proposal status
  const completedProposal = await prisma.$transaction(async (tx) => {
    // Update proposal
    const updated = await tx.propertyBarterProposal.update({
      where: { id: proposalId },
      data: {
        status: PropertyBarterStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // Swap property ownership
    await tx.property.update({
      where: { id: proposal.offeredPropertyId },
      data: {
        ownerId: proposal.receiverId,
        status: PropertyStatus.SOLD,
      },
    });

    await tx.property.update({
      where: { id: proposal.requestedPropertyId },
      data: {
        ownerId: proposal.proposerId,
        status: PropertyStatus.SOLD,
      },
    });

    return updated;
  });

  // TODO: Send notifications
  // TODO: Update escrow status

  return completedProposal;
};

export default {
  createBarterProposal,
  getBarterProposalById,
  respondToProposal,
  cancelProposal,
  getUserBarterProposals,
  completeBarterTransaction,
};
