/**
 * Barter Chain Service
 *
 * Manages multi-party barter chains (cycles and linear chains)
 * Handles proposal, acceptance, rejection, and execution
 */

import { PrismaClient, BarterChainStatus, ParticipantStatus } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import * as matchingService from './barter-matching.service';

const prisma = new PrismaClient();

// ============================================
// Types
// ============================================

interface CreateProposalInput {
  itemId: string;
  maxParticipants?: number;
  preferCycles?: boolean;
}

interface ParticipantResponse {
  accept: boolean;
  message?: string;
}

// ============================================
// Discovery and Proposal
// ============================================

/**
 * Discover smart barter opportunities for a user's item
 * Returns potential cycles in the new optimized format
 */
export const discoverBarterOpportunities = async (userId: string, itemId: string) => {
  // Verify item belongs to user
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      seller: {
        select: { id: true, fullName: true },
      },
    },
  });

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  if (item.sellerId !== userId) {
    throw new ForbiddenError('This item does not belong to you');
  }

  // Find matches using optimized algorithm
  const matches = await matchingService.findMatchesForUser(userId, itemId, {
    includeCycles: true,
    includeChains: true,
    maxResults: 20,
  });

  // Format opportunities with full exchange sequence
  const opportunities = matches.cycles.map((cycle, index) => {
    return matchingService.formatAsOpportunity(
      cycle,
      `OPP-${Date.now()}-${index}`
    );
  });

  return {
    item,
    opportunities,
    total: matches.totalMatches,
    weights: matchingService.WEIGHTS,
    threshold: matchingService.EDGE_THRESHOLD,
  };
};

/**
 * Create a smart barter proposal
 * Algorithm automatically finds best matches and creates proposal
 */
export const createSmartProposal = async (
  userId: string,
  input: CreateProposalInput
): Promise<any> => {
  const { itemId, maxParticipants = 5, preferCycles = true } = input;

  // Verify item ownership
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      listings: {
        where: { status: 'ACTIVE' },
      },
    },
  });

  if (!item) {
    throw new NotFoundError('Item not found');
  }

  if (item.sellerId !== userId) {
    throw new ForbiddenError('This item does not belong to you');
  }

  if (item.listings.length > 0) {
    throw new BadRequestError('Cannot create barter proposal for items with active listings');
  }

  // Find best matches
  const matches = await matchingService.findMatchesForUser(userId, itemId, {
    includeCycles: preferCycles,
    includeChains: true,
    maxResults: 10,
  });

  // Get best match
  const bestMatch = preferCycles && matches.cycles.length > 0 ? matches.cycles[0] : matches.chains[0];

  if (!bestMatch) {
    throw new BadRequestError('No suitable barter matches found for this item');
  }

  // Limit participants if needed
  if (bestMatch.participants.length > maxParticipants) {
    bestMatch.participants = bestMatch.participants.slice(0, maxParticipants);
    bestMatch.edges = bestMatch.edges.slice(0, maxParticipants);
  }

  // Create proposal
  const proposal = await matchingService.createBarterChainProposal(bestMatch);

  // TODO: Send notifications to all participants

  return proposal;
};

// ============================================
// Chain Management
// ============================================

/**
 * Get barter chain by ID
 */
export const getBarterChainById = async (chainId: string, userId: string): Promise<any> => {
  const chain = await prisma.barterChain.findUnique({
    where: { id: chainId },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              phone: true,
            },
          },
          givingItem: {
            include: {
              category: {
                select: {
                  id: true,
                  nameAr: true,
                  nameEn: true,
                },
              },
            },
          },
          receivingItem: {
            include: {
              category: {
                select: {
                  id: true,
                  nameAr: true,
                  nameEn: true,
                },
              },
            },
          },
        },
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  if (!chain) {
    throw new NotFoundError('Barter chain not found');
  }

  // Check if user is a participant
  const isParticipant = chain.participants.some((p) => p.userId === userId);
  if (!isParticipant) {
    throw new ForbiddenError('You are not a participant in this barter chain');
  }

  return chain;
};

/**
 * Respond to a barter chain proposal (accept or reject)
 */
export const respondToChainProposal = async (
  chainId: string,
  userId: string,
  response: ParticipantResponse
): Promise<any> => {
  const chain = await prisma.barterChain.findUnique({
    where: { id: chainId },
    include: {
      participants: true,
    },
  });

  if (!chain) {
    throw new NotFoundError('Barter chain not found');
  }

  if (chain.status !== 'PROPOSED' && chain.status !== 'PENDING') {
    throw new BadRequestError('This barter chain is no longer accepting responses');
  }

  // Check if expired
  if (new Date() > chain.expiresAt) {
    await prisma.barterChain.update({
      where: { id: chainId },
      data: { status: BarterChainStatus.EXPIRED },
    });
    throw new BadRequestError('This barter chain has expired');
  }

  // Find participant
  const participant = chain.participants.find((p) => p.userId === userId);
  if (!participant) {
    throw new ForbiddenError('You are not a participant in this barter chain');
  }

  if (participant.status !== 'PENDING') {
    throw new BadRequestError('You have already responded to this proposal');
  }

  // Update participant status
  const newStatus = response.accept ? ParticipantStatus.ACCEPTED : ParticipantStatus.REJECTED;

  await prisma.barterParticipant.update({
    where: { id: participant.id },
    data: {
      status: newStatus,
      responseMessage: response.message,
      respondedAt: new Date(),
    },
  });

  // Check if all participants responded
  const updatedChain = await prisma.barterChain.findUnique({
    where: { id: chainId },
    include: {
      participants: true,
    },
  });

  // If anyone rejected, mark chain as rejected
  if (updatedChain!.participants.some((p) => p.status === 'REJECTED')) {
    await prisma.barterChain.update({
      where: { id: chainId },
      data: { status: BarterChainStatus.REJECTED },
    });
  }
  // If all accepted, mark as accepted
  else if (updatedChain!.participants.every((p) => p.status === 'ACCEPTED')) {
    await prisma.barterChain.update({
      where: { id: chainId },
      data: { status: BarterChainStatus.ACCEPTED },
    });

    // TODO: Lock items, create transactions
  }
  // Otherwise, keep as PENDING
  else {
    await prisma.barterChain.update({
      where: { id: chainId },
      data: { status: BarterChainStatus.PENDING },
    });
  }

  // Get updated chain
  return getBarterChainById(chainId, userId);
};

/**
 * Cancel a barter chain proposal
 * Only the initiator (first participant) can cancel
 */
export const cancelBarterChain = async (chainId: string, userId: string): Promise<any> => {
  const chain = await prisma.barterChain.findUnique({
    where: { id: chainId },
    include: {
      participants: {
        orderBy: { position: 'asc' },
      },
    },
  });

  if (!chain) {
    throw new NotFoundError('Barter chain not found');
  }

  // Only initiator can cancel
  const initiator = chain.participants[0];
  if (initiator.userId !== userId) {
    throw new ForbiddenError('Only the initiator can cancel this barter chain');
  }

  if (chain.status === 'COMPLETED') {
    throw new BadRequestError('Cannot cancel a completed barter chain');
  }

  const cancelled = await prisma.barterChain.update({
    where: { id: chainId },
    data: { status: BarterChainStatus.CANCELLED },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
            },
          },
        },
      },
    },
  });

  return cancelled;
};

/**
 * Execute a barter chain
 * All parties confirm they've completed the exchange
 */
export const executeBarterChain = async (chainId: string, userId: string): Promise<any> => {
  const chain = await prisma.barterChain.findUnique({
    where: { id: chainId },
    include: {
      participants: true,
    },
  });

  if (!chain) {
    throw new NotFoundError('Barter chain not found');
  }

  if (chain.status !== 'ACCEPTED') {
    throw new BadRequestError('Chain must be accepted by all parties before execution');
  }

  // Find participant
  const participant = chain.participants.find((p) => p.userId === userId);
  if (!participant) {
    throw new ForbiddenError('You are not a participant in this barter chain');
  }

  if (participant.status === 'COMPLETED') {
    throw new BadRequestError('You have already confirmed completion');
  }

  // Mark participant as completed
  await prisma.barterParticipant.update({
    where: { id: participant.id },
    data: { status: ParticipantStatus.COMPLETED },
  });

  // Check if all completed
  const updatedChain = await prisma.barterChain.findUnique({
    where: { id: chainId },
    include: {
      participants: true,
    },
  });

  if (updatedChain!.participants.every((p) => p.status === 'COMPLETED')) {
    // All completed - finalize the chain
    await prisma.barterChain.update({
      where: { id: chainId },
      data: {
        status: BarterChainStatus.COMPLETED,
        completedAt: new Date(),
      },
    });

    // TODO: Update item ownership/status
    // TODO: Create transaction records
  }

  return getBarterChainById(chainId, userId);
};

// ============================================
// List and Query
// ============================================

/**
 * Get my barter chains
 */
export const getMyBarterChains = async (
  userId: string,
  status?: BarterChainStatus,
  page: number = 1,
  limit: number = 20
): Promise<any> => {
  const where: any = {
    participants: {
      some: {
        userId,
      },
    },
  };

  if (status) {
    where.status = status;
  }

  const skip = (page - 1) * limit;
  const total = await prisma.barterChain.count({ where });

  const chains = await prisma.barterChain.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
          givingItem: {
            select: {
              id: true,
              title: true,
              images: true,
              estimatedValue: true,
            },
          },
          receivingItem: {
            select: {
              id: true,
              title: true,
              images: true,
              estimatedValue: true,
            },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
  });

  const totalPages = Math.ceil(total / limit);

  return {
    items: chains,
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
 * Get pending proposals for user
 */
export const getPendingProposals = async (userId: string): Promise<any[]> => {
  const chains = await prisma.barterChain.findMany({
    where: {
      status: { in: ['PROPOSED', 'PENDING'] },
      participants: {
        some: {
          userId,
          status: 'PENDING',
        },
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            },
          },
          givingItem: true,
          receivingItem: true,
        },
        orderBy: { position: 'asc' },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return chains;
};

// ============================================
// Statistics
// ============================================

/**
 * Get barter chain statistics for user
 */
export const getBarterChainStats = async (userId: string): Promise<any> => {
  const [total, proposed, pending, accepted, completed, rejected] = await Promise.all([
    prisma.barterChain.count({
      where: {
        participants: {
          some: { userId },
        },
      },
    }),
    prisma.barterChain.count({
      where: {
        status: 'PROPOSED',
        participants: {
          some: { userId },
        },
      },
    }),
    prisma.barterChain.count({
      where: {
        status: 'PENDING',
        participants: {
          some: { userId },
        },
      },
    }),
    prisma.barterChain.count({
      where: {
        status: 'ACCEPTED',
        participants: {
          some: { userId },
        },
      },
    }),
    prisma.barterChain.count({
      where: {
        status: 'COMPLETED',
        participants: {
          some: { userId },
        },
      },
    }),
    prisma.barterChain.count({
      where: {
        status: 'REJECTED',
        participants: {
          some: { userId },
        },
      },
    }),
  ]);

  return {
    total,
    proposed,
    pending,
    accepted,
    completed,
    rejected,
    successRate: total > 0 ? ((completed / total) * 100).toFixed(1) : '0.0',
  };
};
