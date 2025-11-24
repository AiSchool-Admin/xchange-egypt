/**
 * Smart Barter Matching Service
 *
 * Advanced algorithms for multi-party barter matching
 * Supports:
 * - Cycle detection (A→B→C→A)
 * - Chain detection (A→B→C→D)
 * - Match score calculation
 * - Graph-based matching
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Types and Interfaces
// ============================================

interface BarterNode {
  userId: string;
  itemId: string;
  wantsItemId: string;
  itemValue: number;
  categoryId: string;
}

interface BarterEdge {
  from: string; // userId
  to: string;   // userId
  givingItemId: string;
  receivingItemId: string;
  matchScore: number;
}

interface BarterCycle {
  participants: BarterNode[];
  edges: BarterEdge[];
  totalScore: number;
  cycleType: 'CYCLE';
}

interface BarterChain {
  participants: BarterNode[];
  edges: BarterEdge[];
  totalScore: number;
  chainType: 'CHAIN';
}

type BarterMatch = BarterCycle | BarterChain;

interface UserPreferences {
  userId: string;
  itemId: string;
  wantedCategories: string[];
  maxDistance?: number;
  minItemValue?: number;
  maxItemValue?: number;
}

// ============================================
// Graph Building
// ============================================

/**
 * Build a directed graph of all possible barter connections
 * Each edge represents: User A wants to give Item X to get Item Y from User B
 *
 * Uses actual user preferences from barter offers to create meaningful edges
 */
export const buildBarterGraph = async (): Promise<{
  nodes: Map<string, BarterNode>;
  edges: BarterEdge[];
}> => {
  // Get all active items available for barter
  const items = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      listings: {
        none: {
          status: 'ACTIVE',
        },
      },
    },
    select: {
      id: true,
      sellerId: true,
      title: true,
      estimatedValue: true,
      categoryId: true,
      condition: true,
      seller: {
        select: {
          id: true,
          fullName: true,
        },
      },
      category: {
        select: {
          id: true,
          parentId: true,
        },
      },
    },
  });

  // Get all active/pending barter offers to understand what users want
  const barterOffers = await prisma.barterOffer.findMany({
    where: {
      status: { in: ['PENDING', 'COUNTERED'] },
      isOpenOffer: true, // Focus on open offers for chain discovery
    },
    include: {
      initiator: {
        select: { id: true, fullName: true },
      },
      // Get specific items user wants
      preferenceSets: {
        include: {
          items: {
            include: {
              item: {
                select: {
                  id: true,
                  sellerId: true,
                  categoryId: true,
                  estimatedValue: true,
                },
              },
            },
          },
        },
        orderBy: { priority: 'asc' },
      },
      // Get category/description-based requests
      itemRequests: {
        include: {
          category: {
            select: { id: true, parentId: true },
          },
        },
      },
    },
  });

  const nodes = new Map<string, BarterNode>();
  const edges: BarterEdge[] = [];

  // Create nodes for each user-item pair
  for (const item of items) {
    const nodeKey = `${item.sellerId}-${item.id}`;
    nodes.set(nodeKey, {
      userId: item.sellerId,
      itemId: item.id,
      wantsItemId: '',
      itemValue: item.estimatedValue,
      categoryId: item.categoryId,
    });
  }

  // Create edges based on actual user preferences from barter offers
  for (const offer of barterOffers) {
    const userId = offer.initiatorId;
    const offeredItemIds = offer.offeredItemIds;

    // Get user's offered items
    const userItems = items.filter(item =>
      item.sellerId === userId && offeredItemIds.includes(item.id)
    );

    if (userItems.length === 0) continue;

    // Process specific item wants from preference sets
    for (const prefSet of offer.preferenceSets) {
      for (const prefItem of prefSet.items) {
        const wantedItem = prefItem.item;
        if (!wantedItem || wantedItem.sellerId === userId) continue;

        // Create edge: User wants this specific item
        for (const userItem of userItems) {
          const score = calculatePreferenceMatchScore(userItem, wantedItem, 1.0); // High score for specific wants
          edges.push({
            from: userId,
            to: wantedItem.sellerId,
            givingItemId: userItem.id,
            receivingItemId: wantedItem.id,
            matchScore: score,
          });
        }
      }
    }

    // Process category-based wants from item requests
    for (const request of offer.itemRequests) {
      // Find items that match this category request
      const matchingItems = items.filter(item => {
        if (item.sellerId === userId) return false;

        // Category match
        if (request.categoryId) {
          if (item.categoryId !== request.categoryId &&
              item.category?.parentId !== request.categoryId) {
            return false;
          }
        }

        // Price range match
        if (request.minPrice && item.estimatedValue < request.minPrice) return false;
        if (request.maxPrice && item.estimatedValue > request.maxPrice) return false;

        // Condition match
        if (request.condition && item.condition !== request.condition) return false;

        return true;
      });

      // Create edges for category matches
      for (const matchingItem of matchingItems) {
        for (const userItem of userItems) {
          const score = calculatePreferenceMatchScore(userItem, matchingItem, 0.7); // Good score for category match

          // Avoid duplicate edges
          const existingEdge = edges.find(e =>
            e.from === userId &&
            e.to === matchingItem.sellerId &&
            e.givingItemId === userItem.id &&
            e.receivingItemId === matchingItem.id
          );

          if (!existingEdge) {
            edges.push({
              from: userId,
              to: matchingItem.sellerId,
              givingItemId: userItem.id,
              receivingItemId: matchingItem.id,
              matchScore: score,
            });
          }
        }
      }
    }
  }

  // Also add edges based on item similarity as fallback (lower score)
  // This helps find opportunities even without explicit barter offers
  for (const itemA of items) {
    for (const itemB of items) {
      if (itemA.sellerId === itemB.sellerId) continue;

      // Check if edge already exists
      const existingEdge = edges.find(e =>
        e.from === itemA.sellerId &&
        e.to === itemB.sellerId &&
        e.givingItemId === itemA.id &&
        e.receivingItemId === itemB.id
      );

      if (!existingEdge) {
        const score = calculatePairMatchScore(itemA, itemB);
        if (score > 0.5) { // Higher threshold for similarity-based matches
          edges.push({
            from: itemA.sellerId,
            to: itemB.sellerId,
            givingItemId: itemA.id,
            receivingItemId: itemB.id,
            matchScore: score * 0.5, // Reduce score for non-preference matches
          });
        }
      }
    }
  }

  return { nodes, edges };
};

/**
 * Calculate match score based on user preference
 */
const calculatePreferenceMatchScore = (
  offeredItem: any,
  wantedItem: any,
  baseScore: number
): number => {
  let score = baseScore;

  // Value similarity bonus (up to +0.2)
  const valueDiff = Math.abs(offeredItem.estimatedValue - wantedItem.estimatedValue);
  const avgValue = (offeredItem.estimatedValue + wantedItem.estimatedValue) / 2;
  if (avgValue > 0) {
    const valueScore = Math.max(0, 1 - valueDiff / avgValue);
    score += valueScore * 0.2;
  }

  // Category match bonus (up to +0.1)
  if (offeredItem.categoryId === wantedItem.categoryId) {
    score += 0.1;
  }

  return Math.min(1, score);
};

/**
 * Calculate match score between two items
 * Score 0-1 based on:
 * - Category similarity
 * - Value similarity
 * - Condition match
 */
const calculatePairMatchScore = (itemA: any, itemB: any): number => {
  let score = 0;

  // Category match (40%)
  if (itemA.categoryId === itemB.categoryId) {
    score += 0.4;
  } else if (itemA.category.parentId === itemB.category.parentId) {
    score += 0.2; // Same parent category
  }

  // Value similarity (40%)
  const valueDiff = Math.abs(itemA.estimatedValue - itemB.estimatedValue);
  const avgValue = (itemA.estimatedValue + itemB.estimatedValue) / 2;
  const valueScore = Math.max(0, 1 - valueDiff / avgValue);
  score += valueScore * 0.4;

  // Condition match (20%)
  const conditionScore =
    itemA.condition === itemB.condition
      ? 1.0
      : itemA.condition === 'NEW' || itemB.condition === 'NEW'
      ? 0.5
      : 0.7;
  score += conditionScore * 0.2;

  return Math.min(1, score);
};

// ============================================
// Cycle Detection (Tarjan's Algorithm + DFS)
// ============================================

/**
 * Find all cycles in the barter graph
 * Uses DFS-based cycle detection
 *
 * A cycle is: A→B→C→A (everyone gets what they want in a loop)
 */
export const findBarterCycles = async (
  maxCycleLength: number = 5,
  minCycleLength: number = 3,
  minScore: number = 0.5
): Promise<BarterCycle[]> => {
  const { nodes, edges } = await buildBarterGraph();

  // Build adjacency list
  const adjacencyList = new Map<string, BarterEdge[]>();
  for (const edge of edges) {
    if (!adjacencyList.has(edge.from)) {
      adjacencyList.set(edge.from, []);
    }
    adjacencyList.get(edge.from)!.push(edge);
  }

  const cycles: BarterCycle[] = [];
  const visited = new Set<string>();

  // DFS from each node to find cycles
  for (const [userId] of nodes) {
    if (!visited.has(userId)) {
      findCyclesFromNode(
        userId,
        userId,
        [],
        new Set(),
        adjacencyList,
        nodes,
        cycles,
        maxCycleLength,
        minCycleLength,
        minScore
      );
      visited.add(userId);
    }
  }

  // Sort by total score descending
  cycles.sort((a, b) => b.totalScore - a.totalScore);

  return cycles;
};

/**
 * DFS helper to find cycles starting from a specific node
 */
const findCyclesFromNode = (
  startUserId: string,
  currentUserId: string,
  path: BarterEdge[],
  pathSet: Set<string>,
  adjacencyList: Map<string, BarterEdge[]>,
  nodes: Map<string, BarterNode>,
  cycles: BarterCycle[],
  maxLength: number,
  minLength: number,
  minScore: number
) => {
  // Stop if path too long
  if (path.length >= maxLength) return;

  // Get neighbors
  const neighbors = adjacencyList.get(currentUserId) || [];

  for (const edge of neighbors) {
    // Found a cycle back to start
    if (edge.to === startUserId && path.length >= minLength - 1) {
      const cycleEdges = [...path, edge];
      const totalScore = cycleEdges.reduce((sum, e) => sum + e.matchScore, 0) / cycleEdges.length;

      if (totalScore >= minScore) {
        // Build participant list
        const participants: BarterNode[] = [];
        for (const e of cycleEdges) {
          // Find node for this user
          for (const [, node] of nodes) {
            if (node.userId === e.from && node.itemId === e.givingItemId) {
              participants.push({
                ...node,
                wantsItemId: e.receivingItemId,
              });
              break;
            }
          }
        }

        cycles.push({
          participants,
          edges: cycleEdges,
          totalScore,
          cycleType: 'CYCLE',
        });
      }
      continue;
    }

    // Skip if already in path (avoid repeating users)
    if (pathSet.has(edge.to)) continue;

    // Continue DFS
    const newPath = [...path, edge];
    const newPathSet = new Set(pathSet);
    newPathSet.add(edge.to);

    findCyclesFromNode(
      startUserId,
      edge.to,
      newPath,
      newPathSet,
      adjacencyList,
      nodes,
      cycles,
      maxLength,
      minLength,
      minScore
    );
  }
};

// ============================================
// Chain Detection
// ============================================

/**
 * Find all chains in the barter graph
 * A chain is: A→B→C→D (linear, not circular)
 *
 * Useful when there's no cycle but a sequence of barters can satisfy everyone
 */
export const findBarterChains = async (
  maxChainLength: number = 5,
  minChainLength: number = 3,
  minScore: number = 0.5
): Promise<BarterChain[]> => {
  const { nodes, edges } = await buildBarterGraph();

  // Build adjacency list
  const adjacencyList = new Map<string, BarterEdge[]>();
  for (const edge of edges) {
    if (!adjacencyList.has(edge.from)) {
      adjacencyList.set(edge.from, []);
    }
    adjacencyList.get(edge.from)!.push(edge);
  }

  const chains: BarterChain[] = [];

  // Find chains starting from each node
  for (const [userId] of nodes) {
    findChainsFromNode(
      userId,
      [],
      new Set([userId]),
      adjacencyList,
      nodes,
      chains,
      maxChainLength,
      minChainLength,
      minScore
    );
  }

  // Sort by total score descending
  chains.sort((a, b) => b.totalScore - a.totalScore);

  // Remove duplicates (same chain found from different starts)
  const uniqueChains = removeDuplicateChains(chains);

  return uniqueChains;
};

/**
 * DFS helper to find chains
 */
const findChainsFromNode = (
  currentUserId: string,
  path: BarterEdge[],
  pathSet: Set<string>,
  adjacencyList: Map<string, BarterEdge[]>,
  nodes: Map<string, BarterNode>,
  chains: BarterChain[],
  maxLength: number,
  minLength: number,
  minScore: number
) => {
  // Record chain if it meets minimum length
  if (path.length >= minLength) {
    const totalScore = path.reduce((sum, e) => sum + e.matchScore, 0) / path.length;

    if (totalScore >= minScore) {
      const participants: BarterNode[] = [];
      for (const e of path) {
        for (const [, node] of nodes) {
          if (node.userId === e.from && node.itemId === e.givingItemId) {
            participants.push({
              ...node,
              wantsItemId: e.receivingItemId,
            });
            break;
          }
        }
      }

      chains.push({
        participants,
        edges: path,
        totalScore,
        chainType: 'CHAIN',
      });
    }
  }

  // Stop if reached max length
  if (path.length >= maxLength) return;

  // Continue exploring
  const neighbors = adjacencyList.get(currentUserId) || [];
  for (const edge of neighbors) {
    // Skip if user already in path
    if (pathSet.has(edge.to)) continue;

    const newPath = [...path, edge];
    const newPathSet = new Set(pathSet);
    newPathSet.add(edge.to);

    findChainsFromNode(edge.to, newPath, newPathSet, adjacencyList, nodes, chains, maxLength, minLength, minScore);
  }
};

/**
 * Remove duplicate chains
 */
const removeDuplicateChains = (chains: BarterChain[]): BarterChain[] => {
  const seen = new Set<string>();
  const unique: BarterChain[] = [];

  for (const chain of chains) {
    // Create signature from user IDs in order
    const signature = chain.participants.map((p) => p.userId).join('→');

    if (!seen.has(signature)) {
      seen.add(signature);
      unique.push(chain);
    }
  }

  return unique;
};

// ============================================
// Smart Matching for Specific User
// ============================================

/**
 * Find best matches for a specific user's item
 * Returns both cycles and chains that include this user
 */
export const findMatchesForUser = async (
  userId: string,
  itemId: string,
  options: {
    includeCycles?: boolean;
    includeChains?: boolean;
    maxResults?: number;
  } = {}
): Promise<{
  cycles: BarterCycle[];
  chains: BarterChain[];
  totalMatches: number;
}> => {
  const { includeCycles = true, includeChains = true, maxResults = 10 } = options;

  let cycles: BarterCycle[] = [];
  let chains: BarterChain[] = [];

  if (includeCycles) {
    const allCycles = await findBarterCycles();
    cycles = allCycles.filter((c) => c.participants.some((p) => p.userId === userId && p.itemId === itemId));
  }

  if (includeChains) {
    const allChains = await findBarterChains();
    chains = allChains.filter((c) => c.participants.some((p) => p.userId === userId && p.itemId === itemId));
  }

  // Combine and sort by score
  const allMatches = [...cycles, ...chains].sort((a, b) => b.totalScore - a.totalScore);

  // Take top results
  const topMatches = allMatches.slice(0, maxResults);

  return {
    cycles: topMatches.filter((m) => 'cycleType' in m) as BarterCycle[],
    chains: topMatches.filter((m) => 'chainType' in m) as BarterChain[],
    totalMatches: allMatches.length,
  };
};

// ============================================
// Create Barter Chain Proposals
// ============================================

/**
 * Create a barter chain proposal in the database
 */
export const createBarterChainProposal = async (match: BarterMatch): Promise<any> => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // Expire in 7 days

  const chainType = 'cycleType' in match ? 'CYCLE' : 'CHAIN';

  const chain = await prisma.barterChain.create({
    data: {
      chainType,
      participantCount: match.participants.length,
      matchScore: match.totalScore,
      algorithmVersion: '1.0',
      description: generateChainDescription(match),
      status: 'PROPOSED',
      expiresAt,
      participants: {
        create: match.participants.map((participant, index) => ({
          userId: participant.userId,
          givingItemId: participant.itemId,
          receivingItemId: participant.wantsItemId,
          position: index,
          status: 'PENDING',
        })),
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
        orderBy: {
          position: 'asc',
        },
      },
    },
  });

  return chain;
};

/**
 * Generate human-readable description of the chain
 */
const generateChainDescription = (match: BarterMatch): string => {
  const userNames = match.participants.map((p) => `User ${p.userId.slice(0, 8)}`);

  if ('cycleType' in match) {
    return `Cycle: ${userNames.join(' → ')} → ${userNames[0]} (${match.participants.length} parties)`;
  } else {
    return `Chain: ${userNames.join(' → ')} (${match.participants.length} parties)`;
  }
};

// ============================================
// Exports
// ============================================

export default {
  buildBarterGraph,
  findBarterCycles,
  findBarterChains,
  findMatchesForUser,
  createBarterChainProposal,
};
