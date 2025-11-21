import { PrismaClient, BarterOfferStatus, ItemCondition } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

const prisma = new PrismaClient();

// Types
interface CreateBarterOfferData {
  offeredItemIds: string[];
  recipientId?: string;
  notes?: string;
  expiresAt?: Date;
}

interface CreateCounterOfferData {
  notes?: string;
}

interface SearchBarterableItemsParams {
  search?: string;
  categoryId?: string;
  condition?: ItemCondition;
  governorate?: string;
  excludeMyItems?: boolean;
  userId?: string;
  page?: number;
  limit?: number;
}

interface PaginatedResult<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

/**
 * Create a barter offer (Simple 2-party barter)
 * NOTE: This is a simplified version. For bundle offers, use barter-bundle.service.ts
 */
export const createBarterOffer = async (
  initiatorId: string,
  offerData: CreateBarterOfferData
): Promise<any> => {
  const { offeredItemIds, recipientId, notes, expiresAt } = offerData;

  if (!offeredItemIds || offeredItemIds.length === 0) {
    throw new BadRequestError('Must offer at least one item');
  }

  // Verify offered items exist and belong to initiator
  const offeredItems = await prisma.item.findMany({
    where: { id: { in: offeredItemIds } },
    include: {
      listings: {
        where: { status: 'ACTIVE' },
      },
    },
  });

  if (offeredItems.length !== offeredItemIds.length) {
    throw new NotFoundError('One or more offered items not found');
  }

  const notOwned = offeredItems.filter((item) => item.sellerId !== initiatorId);
  if (notOwned.length > 0) {
    throw new ForbiddenError('You can only offer your own items');
  }

  // Check if offered items have active listings
  const hasActiveListings = offeredItems.some((item) => item.listings.length > 0);
  if (hasActiveListings) {
    throw new BadRequestError(
      'Cannot barter items that have active sale listings. Please close the listing first.'
    );
  }

  // Calculate offered bundle value
  const offeredBundleValue = offeredItems.reduce((sum, item) => sum + item.estimatedValue, 0);

  // Create the barter offer (open offer without preference sets)
  const barterOffer = await prisma.barterOffer.create({
    data: {
      initiatorId,
      recipientId,
      offeredItemIds,
      offeredBundleValue,
      status: BarterOfferStatus.PENDING,
      notes,
      expiresAt: expiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default 7 days
      isOpenOffer: !recipientId,
    },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      preferenceSets: {
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      },
    },
  });

  return barterOffer;
};

/**
 * Get barter offer by ID
 */
export const getBarterOfferById = async (
  offerId: string,
  userId: string
): Promise<any> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
        },
      },
      preferenceSets: {
        include: {
          items: {
            include: {
              item: {
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
          },
        },
      },
    },
  });

  if (!offer) {
    throw new NotFoundError('Barter offer not found');
  }

  // Only initiator or recipient can view the offer
  if (offer.initiatorId !== userId && offer.recipientId !== userId) {
    throw new ForbiddenError('You do not have permission to view this offer');
  }

  return offer;
};

/**
 * Accept a barter offer
 */
export const acceptBarterOffer = async (
  offerId: string,
  userId: string
): Promise<any> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    throw new NotFoundError('Barter offer not found');
  }

  // Only recipient can accept
  if (offer.recipientId !== userId) {
    throw new ForbiddenError('Only the recipient can accept this offer');
  }

  if (offer.status !== 'PENDING' && offer.status !== 'COUNTER_OFFERED') {
    throw new BadRequestError('This offer cannot be accepted');
  }

  // Check if offer has expired
  if (offer.expiresAt && new Date() > offer.expiresAt) {
    await prisma.barterOffer.update({
      where: { id: offerId },
      data: { status: BarterOfferStatus.EXPIRED },
    });
    throw new BadRequestError('This offer has expired');
  }

  // Update offer status to accepted
  const acceptedOffer = await prisma.barterOffer.update({
    where: { id: offerId },
    data: {
      status: BarterOfferStatus.ACCEPTED,
      respondedAt: new Date(),
    },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      preferenceSets: {
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      },
    },
  });

  // TODO: Create transaction or exchange record
  // TODO: Send notifications to both parties

  return acceptedOffer;
};

/**
 * Reject a barter offer
 */
export const rejectBarterOffer = async (
  offerId: string,
  userId: string,
  reason?: string
): Promise<any> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    throw new NotFoundError('Barter offer not found');
  }

  // Only recipient can reject
  if (offer.recipientId !== userId) {
    throw new ForbiddenError('Only the recipient can reject this offer');
  }

  if (offer.status !== 'PENDING' && offer.status !== 'COUNTER_OFFERED') {
    throw new BadRequestError('This offer cannot be rejected');
  }

  // Update offer status to rejected
  const rejectedOffer = await prisma.barterOffer.update({
    where: { id: offerId },
    data: {
      status: BarterOfferStatus.REJECTED,
      respondedAt: new Date(),
      notes: reason ? `${offer.notes ? offer.notes + '\n' : ''}Rejection reason: ${reason}` : offer.notes,
    },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });

  return rejectedOffer;
};

/**
 * Create a counter offer
 * NOTE: Counter offers are now handled via preference sets
 * This function is deprecated - use barter-bundle.service.ts instead
 */
export const createCounterOffer = async (
  offerId: string,
  userId: string,
  counterOfferData: CreateCounterOfferData
): Promise<any> => {
  const { notes } = counterOfferData;

  const originalOffer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
  });

  if (!originalOffer) {
    throw new NotFoundError('Original offer not found');
  }

  // Only recipient can counter offer
  if (originalOffer.recipientId !== userId) {
    throw new ForbiddenError('Only the recipient can create a counter offer');
  }

  if (originalOffer.status !== 'PENDING') {
    throw new BadRequestError('Can only counter pending offers');
  }

  // Update original offer with counter offer status
  const counterOffer = await prisma.barterOffer.update({
    where: { id: offerId },
    data: {
      status: BarterOfferStatus.COUNTER_OFFERED,
      respondedAt: new Date(),
      notes: notes ? `${originalOffer.notes ? originalOffer.notes + '\n' : ''}Counter offer notes: ${notes}` : originalOffer.notes,
    },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      preferenceSets: {
        include: {
          items: {
            include: {
              item: true,
            },
          },
        },
      },
    },
  });

  return counterOffer;
};

/**
 * Cancel a barter offer
 */
export const cancelBarterOffer = async (
  offerId: string,
  userId: string
): Promise<any> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    throw new NotFoundError('Barter offer not found');
  }

  // Only initiator can cancel
  if (offer.initiatorId !== userId) {
    throw new ForbiddenError('Only the initiator can cancel this offer');
  }

  if (offer.status === 'ACCEPTED' || offer.status === 'COMPLETED') {
    throw new BadRequestError('Cannot cancel accepted or completed offers');
  }

  // Update offer status to cancelled
  const cancelledOffer = await prisma.barterOffer.update({
    where: { id: offerId },
    data: { status: BarterOfferStatus.CANCELLED },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });

  return cancelledOffer;
};

/**
 * Get my barter offers
 */
export const getMyBarterOffers = async (
  userId: string,
  type: 'sent' | 'received' | 'all' = 'all',
  status?: BarterOfferStatus,
  page: number = 1,
  limit: number = 20
): Promise<PaginatedResult<any>> => {
  const where: any = {};

  // Filter by type
  if (type === 'sent') {
    where.initiatorId = userId;
  } else if (type === 'received') {
    where.recipientId = userId;
  } else {
    where.OR = [{ initiatorId: userId }, { recipientId: userId }];
  }

  // Filter by status
  if (status) {
    where.status = status;
  }

  const skip = (page - 1) * limit;

  const total = await prisma.barterOffer.count({ where });

  const offers = await prisma.barterOffer.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      preferenceSets: {
        include: {
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  title: true,
                  images: true,
                  condition: true,
                },
              },
            },
          },
        },
      },
    },
  });

  const totalPages = Math.ceil(total / limit);

  return {
    items: offers,
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
 * Search barterable items (items available for barter)
 */
export const searchBarterableItems = async (
  params: SearchBarterableItemsParams
): Promise<PaginatedResult<any>> => {
  const {
    search,
    categoryId,
    condition,
    governorate,
    excludeMyItems = true,
    userId,
    page = 1,
    limit = 20,
  } = params;

  // Ensure page and limit are numbers
  const pageNum = Number(page) || 1;
  const limitNum = Number(limit) || 20;

  const where: any = {
    // Exclude items with active sale listings
    listings: {
      none: {
        status: 'ACTIVE',
      },
    },
  };

  if (search) {
    where.title = { contains: search, mode: 'insensitive' };
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  if (condition) {
    where.condition = condition;
  }

  if (governorate) {
    where.governorate = governorate;
  }

  if (excludeMyItems && userId) {
    where.sellerId = { not: userId };
  }

  const skip = (pageNum - 1) * limitNum;

  const total = await prisma.item.count({ where });

  const items = await prisma.item.findMany({
    where,
    skip,
    take: limitNum,
    orderBy: { createdAt: 'desc' },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
          slug: true,
        },
      },
    },
  });

  const totalPages = Math.ceil(total / limitNum);

  return {
    items,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages,
      hasMore: pageNum < totalPages,
    },
  };
};

/**
 * Find potential barter matches for an item
 * (Simple 2-party matching algorithm)
 */
export const findBarterMatches = async (
  itemId: string,
  userId: string,
  categoryId?: string
): Promise<any[]> => {
  // Verify item exists and belongs to user
  const myItem = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!myItem) {
    throw new NotFoundError('Item not found');
  }

  if (myItem.sellerId !== userId) {
    throw new ForbiddenError('You can only find matches for your own items');
  }

  // Find items in the same category or specified category
  const targetCategoryId = categoryId || myItem.categoryId;

  // Find users who have items I might want, and who might want my item
  const potentialMatches = await prisma.item.findMany({
    where: {
      categoryId: targetCategoryId,
      sellerId: { not: userId },
      listings: {
        none: {
          status: 'ACTIVE',
        },
      },
    },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
        include: {
          items: {
            where: {
              categoryId: myItem.categoryId,
              id: { not: itemId },
            },
            take: 5,
          },
        },
      },
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
        },
      },
    },
    take: 20,
  });

  return potentialMatches;
};

/**
 * Complete barter exchange (both parties confirm)
 */
export const completeBarterExchange = async (
  offerId: string,
  userId: string,
  confirmationNotes?: string
): Promise<any> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
  });

  if (!offer) {
    throw new NotFoundError('Barter offer not found');
  }

  // Both parties can confirm completion
  if (offer.initiatorId !== userId && offer.recipientId !== userId) {
    throw new ForbiddenError('Only involved parties can complete the exchange');
  }

  if (offer.status !== 'ACCEPTED') {
    throw new BadRequestError('Only accepted offers can be completed');
  }

  // Get full offer details with items
  const fullOffer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
    include: {
      preferenceSets: {
        include: {
          items: true,
        },
        orderBy: { priority: 'asc' },
        take: 1, // Get the first (matched) preference set
      },
    },
  });

  // Mark as completed
  const completedOffer = await prisma.barterOffer.update({
    where: { id: offerId },
    data: {
      status: BarterOfferStatus.COMPLETED,
      notes: confirmationNotes
        ? `${offer.notes ? offer.notes + '\n' : ''}Completion notes: ${confirmationNotes}`
        : offer.notes,
    },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      recipient: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
    },
  });

  // Update offered items to TRADED status
  if (offer.offeredItemIds && offer.offeredItemIds.length > 0) {
    await prisma.item.updateMany({
      where: { id: { in: offer.offeredItemIds } },
      data: { status: 'TRADED' },
    });
  }

  // Update requested items to TRADED status
  if (fullOffer?.preferenceSets && fullOffer.preferenceSets.length > 0) {
    const requestedItemIds = fullOffer.preferenceSets[0].items.map(item => item.itemId);
    if (requestedItemIds.length > 0) {
      await prisma.item.updateMany({
        where: { id: { in: requestedItemIds } },
        data: { status: 'TRADED' },
      });
    }
  }

  // Create transaction record for the barter
  // First, get or create listings for the items
  const initiatorListing = await prisma.listing.create({
    data: {
      itemId: offer.offeredItemIds[0], // Use first offered item as primary
      userId: offer.initiatorId,
      listingType: 'DIRECT_SALE',
      price: fullOffer?.offeredBundleValue || 0,
      currency: 'EGP',
      status: 'COMPLETED',
    },
  });

  // Create transaction
  await prisma.transaction.create({
    data: {
      listingId: initiatorListing.id,
      buyerId: offer.recipientId!,
      sellerId: offer.initiatorId,
      transactionType: 'BARTER',
      amount: fullOffer?.offeredBundleValue || 0,
      currency: 'EGP',
      paymentMethod: 'BARTER_EXCHANGE',
      paymentStatus: 'COMPLETED',
      deliveryStatus: 'DELIVERED',
      completedAt: new Date(),
      notes: `Barter exchange completed. Offer ID: ${offer.id}`,
    },
  });

  return completedOffer;
};

// ============================================
// MULTI-PARTY BARTER MATCHING ALGORITHM
// ============================================

interface BarterNode {
  userId: string;
  userName: string;
  userAvatar?: string;
  offeredItems: {
    id: string;
    title: string;
    value: number;
    categoryId: string;
    images?: { url: string }[];
  }[];
  wantedCategories: string[];
  wantedMinValue: number;
  wantedMaxValue: number;
}

interface BarterMatch {
  chain: BarterNode[];
  totalValue: number;
  matchScore: number;
  type: 'two-party' | 'three-party' | 'multi-party';
}

/**
 * Find multi-party barter matches using graph cycle detection
 * This finds chains where: A wants what B has, B wants what C has, C wants what A has
 */
export const findMultiPartyMatches = async (
  userId: string,
  maxChainLength: number = 5
): Promise<BarterMatch[]> => {
  // Get all active barter offers
  const activeOffers = await prisma.barterOffer.findMany({
    where: {
      status: 'PENDING',
      isOpenOffer: true,
      expiresAt: { gt: new Date() },
    },
    include: {
      initiator: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      preferenceSets: {
        include: {
          items: {
            include: {
              item: {
                select: {
                  categoryId: true,
                },
              },
            },
          },
        },
        orderBy: { priority: 'asc' },
      },
    },
  });

  // Get offered items details
  const allOfferedItemIds = activeOffers.flatMap(o => o.offeredItemIds);
  const offeredItems = await prisma.item.findMany({
    where: { id: { in: allOfferedItemIds } },
    include: {
      category: true,
    },
  });

  const itemsMap = new Map(offeredItems.map(item => [item.id, item]));

  // Build graph nodes
  const nodes: Map<string, BarterNode> = new Map();

  for (const offer of activeOffers) {
    const offeredItemDetails = offer.offeredItemIds
      .map(id => itemsMap.get(id))
      .filter(Boolean)
      .map(item => ({
        id: item!.id,
        title: item!.title,
        value: item!.estimatedValue,
        categoryId: item!.categoryId,
        images: item!.images.length > 0 ? [{ url: item!.images[0] }] : [],
      }));

    // Get wanted categories from preference sets
    const wantedCategories: string[] = [];
    let wantedMinValue = 0;
    let wantedMaxValue = Infinity;

    for (const prefSet of offer.preferenceSets) {
      for (const prefItem of prefSet.items) {
        if (prefItem.item?.categoryId) {
          wantedCategories.push(prefItem.item.categoryId);
        }
      }
      if (prefSet.totalValue > 0) {
        wantedMinValue = Math.min(wantedMinValue || prefSet.totalValue, prefSet.totalValue * 0.8);
        wantedMaxValue = Math.max(wantedMaxValue === Infinity ? 0 : wantedMaxValue, prefSet.totalValue * 1.2);
      }
    }

    // If no preferences, use offered value as reference
    if (wantedMinValue === 0) {
      wantedMinValue = offer.offeredBundleValue * 0.7;
      wantedMaxValue = offer.offeredBundleValue * 1.3;
    }

    nodes.set(offer.initiatorId, {
      userId: offer.initiatorId,
      userName: offer.initiator.fullName,
      userAvatar: offer.initiator.avatar || undefined,
      offeredItems: offeredItemDetails,
      wantedCategories: [...new Set(wantedCategories)],
      wantedMinValue,
      wantedMaxValue,
    });
  }

  // Build adjacency graph (directed edges: A -> B means A wants what B has)
  const graph: Map<string, string[]> = new Map();

  for (const [nodeIdA, nodeA] of nodes) {
    const edges: string[] = [];

    for (const [nodeIdB, nodeB] of nodes) {
      if (nodeIdA === nodeIdB) continue;

      // Check if A wants what B has
      const match = checkMatch(nodeA, nodeB);
      if (match) {
        edges.push(nodeIdB);
      }
    }

    graph.set(nodeIdA, edges);
  }

  // Find cycles starting from the current user
  const matches: BarterMatch[] = [];
  const userNode = nodes.get(userId);

  if (!userNode) {
    // User doesn't have active offers, find potential matches based on their items
    const userItems = await prisma.item.findMany({
      where: {
        sellerId: userId,
        status: 'ACTIVE',
      },
      include: {
        category: true,
      },
    });

    if (userItems.length === 0) {
      return [];
    }

    // Create a temporary node for the user
    const tempNode: BarterNode = {
      userId,
      userName: 'You',
      offeredItems: userItems.map(item => ({
        id: item.id,
        title: item.title,
        value: item.estimatedValue,
        categoryId: item.categoryId,
        images: item.images.length > 0 ? [{ url: item.images[0] }] : [],
      })),
      wantedCategories: [], // Will match any category
      wantedMinValue: 0,
      wantedMaxValue: Infinity,
    };

    nodes.set(userId, tempNode);

    // Add edges for temp node
    const edges: string[] = [];
    for (const [nodeIdB, nodeB] of nodes) {
      if (nodeIdB === userId) continue;
      // Any node that has items the user might want
      edges.push(nodeIdB);
    }
    graph.set(userId, edges);
  }

  // Find all cycles of length 2 to maxChainLength that include the user
  const cycles = findCycles(graph, userId, maxChainLength);

  // Convert cycles to BarterMatch objects
  for (const cycle of cycles) {
    const chainNodes = cycle.map(id => nodes.get(id)!).filter(Boolean);
    if (chainNodes.length < 2) continue;

    const totalValue = chainNodes.reduce(
      (sum, node) => sum + node.offeredItems.reduce((s, item) => s + item.value, 0),
      0
    );

    const matchScore = calculateMatchScore(chainNodes);

    matches.push({
      chain: chainNodes,
      totalValue,
      matchScore,
      type: cycle.length === 2 ? 'two-party' : cycle.length === 3 ? 'three-party' : 'multi-party',
    });
  }

  // Sort by match score (highest first)
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches.slice(0, 20); // Return top 20 matches
};

/**
 * Check if nodeA wants what nodeB has
 */
function checkMatch(nodeA: BarterNode, nodeB: BarterNode): boolean {
  const bOfferedValue = nodeB.offeredItems.reduce((sum, item) => sum + item.value, 0);
  const bCategories = nodeB.offeredItems.map(item => item.categoryId);

  // Check value range
  if (bOfferedValue < nodeA.wantedMinValue || bOfferedValue > nodeA.wantedMaxValue) {
    return false;
  }

  // Check category match (if A has preferences)
  if (nodeA.wantedCategories.length > 0) {
    const hasMatchingCategory = bCategories.some(cat => nodeA.wantedCategories.includes(cat));
    if (!hasMatchingCategory) {
      return false;
    }
  }

  return true;
}

/**
 * Find all cycles in the graph that include the start node
 */
function findCycles(
  graph: Map<string, string[]>,
  startNode: string,
  maxLength: number
): string[][] {
  const cycles: string[][] = [];
  const visited = new Set<string>();

  function dfs(current: string, path: string[]): void {
    if (path.length > maxLength) return;

    const neighbors = graph.get(current) || [];

    for (const neighbor of neighbors) {
      if (neighbor === startNode && path.length >= 2) {
        // Found a cycle back to start
        cycles.push([...path]);
      } else if (!visited.has(neighbor) && path.length < maxLength) {
        visited.add(neighbor);
        dfs(neighbor, [...path, neighbor]);
        visited.delete(neighbor);
      }
    }
  }

  visited.add(startNode);
  dfs(startNode, [startNode]);

  return cycles;
}

/**
 * Calculate match score based on value balance and category relevance
 */
function calculateMatchScore(chain: BarterNode[]): number {
  let score = 100;

  // Penalize for value imbalance
  const values = chain.map(node =>
    node.offeredItems.reduce((sum, item) => sum + item.value, 0)
  );
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;
  const maxDeviation = Math.max(...values.map(v => Math.abs(v - avgValue) / avgValue));
  score -= maxDeviation * 30;

  // Bonus for category matches
  const allCategories = chain.flatMap(node => node.offeredItems.map(item => item.categoryId));
  const uniqueCategories = new Set(allCategories).size;
  score += (allCategories.length - uniqueCategories) * 5; // Bonus for same categories

  // Bonus for shorter chains (more practical)
  score += (5 - chain.length) * 10;

  return Math.max(0, Math.min(100, score));
}

/**
 * Get suggested barter partners based on item compatibility
 */
export const getSuggestedBarterPartners = async (
  userId: string,
  itemId?: string
): Promise<any[]> => {
  // Get user's items
  const userItems = itemId
    ? await prisma.item.findMany({ where: { id: itemId, sellerId: userId } })
    : await prisma.item.findMany({ where: { sellerId: userId, status: 'ACTIVE' } });

  if (userItems.length === 0) {
    return [];
  }

  const categoryIds = userItems.map(item => item.categoryId);
  const totalValue = userItems.reduce((sum, item) => sum + item.estimatedValue, 0);

  // Find users with items in similar categories and value range
  const potentialPartners = await prisma.user.findMany({
    where: {
      id: { not: userId },
      items: {
        some: {
          status: 'ACTIVE',
          categoryId: { in: categoryIds },
          estimatedValue: {
            gte: totalValue * 0.5,
            lte: totalValue * 1.5,
          },
        },
      },
    },
    include: {
      items: {
        where: {
          status: 'ACTIVE',
          categoryId: { in: categoryIds },
        },
        include: {
          category: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
            },
          },
        },
        take: 5,
      },
    },
    take: 10,
  });

  return potentialPartners.map(partner => ({
    id: partner.id,
    fullName: partner.fullName,
    avatar: partner.avatar,
    matchingItems: partner.items,
    matchScore: calculatePartnerMatchScore(userItems, partner.items),
  }));
};

function calculatePartnerMatchScore(userItems: any[], partnerItems: any[]): number {
  let score = 50;

  // Category overlap
  const userCategories = new Set(userItems.map(i => i.categoryId));
  const partnerCategories = new Set(partnerItems.map(i => i.categoryId));
  const overlap = [...userCategories].filter(c => partnerCategories.has(c)).length;
  score += overlap * 10;

  // Value similarity
  const userValue = userItems.reduce((s, i) => s + i.estimatedValue, 0);
  const partnerValue = partnerItems.reduce((s, i) => s + i.estimatedValue, 0);
  const valueDiff = Math.abs(userValue - partnerValue) / Math.max(userValue, partnerValue);
  score -= valueDiff * 20;

  return Math.max(0, Math.min(100, score));
}

// ============================================
// AI PRICE RECOMMENDATIONS
// ============================================

interface PriceRecommendation {
  recommendedValue: number;
  minValue: number;
  maxValue: number;
  confidence: number;
  similarItemsCount: number;
  factors: {
    categoryAverage: number;
    conditionMultiplier: number;
    marketTrend: string;
    demandLevel: string;
  };
  similarItems: {
    id: string;
    title: string;
    value: number;
    condition: string;
  }[];
}

/**
 * Get AI-powered price recommendation for an item
 */
export const getAIPriceRecommendation = async (
  itemId?: string,
  categoryId?: string,
  condition?: string,
  userEstimate?: number
): Promise<PriceRecommendation> => {
  let targetCategoryId = categoryId;
  let targetCondition = condition;

  if (itemId) {
    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (item) {
      targetCategoryId = item.categoryId;
      targetCondition = item.condition;
      userEstimate = userEstimate || item.estimatedValue;
    }
  }

  if (!targetCategoryId) {
    throw new BadRequestError('Category ID is required');
  }

  const similarItems = await prisma.item.findMany({
    where: {
      categoryId: targetCategoryId,
      estimatedValue: { gt: 0 },
      status: { in: ['ACTIVE', 'TRADED'] },
      ...(itemId && { id: { not: itemId } }),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  if (similarItems.length === 0) {
    const defaultValue = userEstimate || 1000;
    return {
      recommendedValue: defaultValue,
      minValue: defaultValue * 0.7,
      maxValue: defaultValue * 1.3,
      confidence: 20,
      similarItemsCount: 0,
      factors: {
        categoryAverage: defaultValue,
        conditionMultiplier: 1.0,
        marketTrend: 'unknown',
        demandLevel: 'unknown',
      },
      similarItems: [],
    };
  }

  const categoryAverage = similarItems.reduce((sum, i) => sum + i.estimatedValue, 0) / similarItems.length;

  const conditionMultipliers: Record<string, number> = {
    NEW: 1.2, LIKE_NEW: 1.1, GOOD: 1.0, FAIR: 0.85, POOR: 0.7,
  };
  const conditionMultiplier = conditionMultipliers[targetCondition || 'GOOD'] || 1.0;

  const sameConditionItems = similarItems.filter(i => i.condition === targetCondition);
  const conditionAverage = sameConditionItems.length > 0
    ? sameConditionItems.reduce((sum, i) => sum + i.estimatedValue, 0) / sameConditionItems.length
    : categoryAverage * conditionMultiplier;

  let recommendedValue = sameConditionItems.length >= 3
    ? conditionAverage
    : categoryAverage * conditionMultiplier;

  if (userEstimate && userEstimate > 0) {
    recommendedValue = recommendedValue * 0.6 + userEstimate * 0.4;
  }

  const values = similarItems.map(i => i.estimatedValue);
  const variance = values.reduce((sum, v) => sum + Math.pow(v - categoryAverage, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const confidence = Math.min(100, Math.max(20, 50 + (similarItems.length * 2) - (stdDev / categoryAverage * 30)));

  const recentItems = similarItems.filter(i => {
    const days = (Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days <= 30;
  });
  const demandLevel = recentItems.length >= 10 ? 'high' : recentItems.length >= 5 ? 'medium' : 'low';

  const oldItems = similarItems.filter(i => {
    const days = (Date.now() - new Date(i.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return days > 30 && days <= 90;
  });
  const oldAverage = oldItems.length > 0
    ? oldItems.reduce((sum, i) => sum + i.estimatedValue, 0) / oldItems.length
    : categoryAverage;
  const recentAverage = recentItems.length > 0
    ? recentItems.reduce((sum, i) => sum + i.estimatedValue, 0) / recentItems.length
    : categoryAverage;

  const marketTrend = recentAverage > oldAverage * 1.1 ? 'rising' :
    recentAverage < oldAverage * 0.9 ? 'falling' : 'stable';

  if (marketTrend === 'rising') recommendedValue *= 1.05;
  else if (marketTrend === 'falling') recommendedValue *= 0.95;

  recommendedValue = Math.round(recommendedValue / 10) * 10;

  return {
    recommendedValue,
    minValue: Math.round(recommendedValue * 0.8 / 10) * 10,
    maxValue: Math.round(recommendedValue * 1.2 / 10) * 10,
    confidence: Math.round(confidence),
    similarItemsCount: similarItems.length,
    factors: {
      categoryAverage: Math.round(categoryAverage),
      conditionMultiplier,
      marketTrend,
      demandLevel,
    },
    similarItems: similarItems.slice(0, 5).map(item => ({
      id: item.id,
      title: item.title,
      value: item.estimatedValue,
      condition: item.condition,
    })),
  };
};

/**
 * Evaluate if a barter exchange is fair
 */
export const evaluateBarterFairness = async (
  offeredItemIds: string[],
  requestedItemIds: string[]
): Promise<{
  isFair: boolean;
  offeredValue: number;
  requestedValue: number;
  valueDifference: number;
  percentageDiff: number;
  recommendation: string;
}> => {
  const offeredItems = await prisma.item.findMany({ where: { id: { in: offeredItemIds } } });
  const offeredValue = offeredItems.reduce((sum, item) => sum + item.estimatedValue, 0);

  const requestedItems = await prisma.item.findMany({ where: { id: { in: requestedItemIds } } });
  const requestedValue = requestedItems.reduce((sum, item) => sum + item.estimatedValue, 0);

  const valueDifference = Math.abs(offeredValue - requestedValue);
  const avgValue = (offeredValue + requestedValue) / 2;
  const percentageDiff = avgValue > 0 ? (valueDifference / avgValue) * 100 : 0;
  const isFair = percentageDiff <= 20;

  let recommendation: string;
  if (percentageDiff <= 10) recommendation = 'Excellent match! Values are very close.';
  else if (percentageDiff <= 20) recommendation = 'Good match. Values are reasonably balanced.';
  else if (percentageDiff <= 35) recommendation = 'Consider adjusting. There is a noticeable value difference.';
  else recommendation = 'Significant imbalance. Consider adding items or finding different match.';

  return { isFair, offeredValue, requestedValue, valueDifference, percentageDiff: Math.round(percentageDiff), recommendation };
};
