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
 * Uses actual barter offers to determine what users want
 * Supports both specific item selections AND description-based requests
 */
export const buildBarterGraph = async (): Promise<{
  nodes: Map<string, BarterNode>;
  edges: BarterEdge[];
}> => {
  // Get all pending barter offers with their preferences AND item requests
  const offers = await prisma.barterOffer.findMany({
    where: {
      status: 'PENDING',
    },
    include: {
      preferenceSets: {
        include: {
          items: {
            include: {
              item: {
                include: {
                  seller: true,
                  category: true,
                },
              },
            },
          },
        },
      },
      itemRequests: {
        include: {
          category: true,
        },
      },
    },
  });

  // Get all offered items
  const allOfferedItemIds = offers.flatMap(o => o.offeredItemIds);
  const offeredItems = await prisma.item.findMany({
    where: {
      id: { in: allOfferedItemIds },
    },
    include: {
      category: true,
    },
  });

  // Get ALL available items for description matching
  const allAvailableItems = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
    },
    include: {
      seller: true,
      category: true,
    },
  });

  // Create a map for quick lookup
  const itemMap = new Map(offeredItems.map(item => [item.id, item]));

  const nodes = new Map<string, BarterNode>();
  const edges: BarterEdge[] = [];

  // Process each offer to create graph edges
  for (const offer of offers) {
    // Get what the user is offering
    for (const offeredItemId of offer.offeredItemIds) {
      const offeredItem = itemMap.get(offeredItemId);
      if (!offeredItem) continue;

      const nodeKey = `${offer.initiatorId}-${offeredItemId}`;
      nodes.set(nodeKey, {
        userId: offer.initiatorId,
        itemId: offeredItemId,
        wantsItemId: '', // Will be filled when finding matches
        itemValue: offeredItem.estimatedValue,
        categoryId: offeredItem.categoryId,
      });

      // Create edges from specific item preferences
      for (const prefSet of offer.preferenceSets) {
        for (const wantedItem of prefSet.items) {
          // Skip if same owner
          if (wantedItem.item.sellerId === offer.initiatorId) continue;

          // Calculate match score based on value similarity
          const valueDiff = Math.abs(offeredItem.estimatedValue - wantedItem.item.estimatedValue);
          const avgValue = (offeredItem.estimatedValue + wantedItem.item.estimatedValue) / 2;
          const valueScore = avgValue > 0 ? Math.max(0, 1 - valueDiff / avgValue) : 0.5;

          // Higher base score since this is an actual preference (not guessed)
          const matchScore = 0.5 + (valueScore * 0.5);

          edges.push({
            from: offer.initiatorId,
            to: wantedItem.item.sellerId,
            givingItemId: offeredItemId,
            receivingItemId: wantedItem.itemId,
            matchScore,
          });

          // Also create node for the wanted item owner
          const wantedNodeKey = `${wantedItem.item.sellerId}-${wantedItem.itemId}`;
          if (!nodes.has(wantedNodeKey)) {
            nodes.set(wantedNodeKey, {
              userId: wantedItem.item.sellerId,
              itemId: wantedItem.itemId,
              wantsItemId: '',
              itemValue: wantedItem.item.estimatedValue,
              categoryId: wantedItem.item.categoryId,
            });
          }
        }
      }

      // Create edges from description-based requests (itemRequests)
      for (const itemRequest of offer.itemRequests || []) {
        // Find items matching the description
        const matchingItems = findItemsMatchingDescription(
          itemRequest,
          allAvailableItems,
          offer.initiatorId
        );

        for (const matchedItem of matchingItems) {
          // Calculate match score based on description match quality and value
          const valueDiff = Math.abs(offeredItem.estimatedValue - matchedItem.item.estimatedValue);
          const avgValue = (offeredItem.estimatedValue + matchedItem.item.estimatedValue) / 2;
          const valueScore = avgValue > 0 ? Math.max(0, 1 - valueDiff / avgValue) : 0.5;

          // Lower base score for description matches (less certain than specific items)
          const matchScore = 0.3 + (matchedItem.confidence * 0.4) + (valueScore * 0.3);

          edges.push({
            from: offer.initiatorId,
            to: matchedItem.item.sellerId,
            givingItemId: offeredItemId,
            receivingItemId: matchedItem.item.id,
            matchScore,
          });

          // Create node for matched item owner
          const matchedNodeKey = `${matchedItem.item.sellerId}-${matchedItem.item.id}`;
          if (!nodes.has(matchedNodeKey)) {
            nodes.set(matchedNodeKey, {
              userId: matchedItem.item.sellerId,
              itemId: matchedItem.item.id,
              wantsItemId: '',
              itemValue: matchedItem.item.estimatedValue,
              categoryId: matchedItem.item.categoryId,
            });
          }
        }
      }
    }
  }

  return { nodes, edges };
};

/**
 * Find items matching a description-based request
 * Uses category matching and keyword similarity
 */
const findItemsMatchingDescription = (
  request: { description: string; categoryId?: string | null; minPrice?: number | null; maxPrice?: number | null },
  allItems: any[],
  excludeUserId: string
): { item: any; confidence: number }[] => {
  const matches: { item: any; confidence: number }[] = [];
  const descriptionLower = request.description.toLowerCase();
  // Split on spaces and filter short words, but keep Arabic words
  const keywords = descriptionLower.split(/\s+/).filter(w => w.length > 1);

  for (const item of allItems) {
    // Skip own items
    if (item.sellerId === excludeUserId) continue;

    let confidence = 0;

    // Category match (high confidence boost)
    if (request.categoryId && item.categoryId === request.categoryId) {
      confidence += 0.5;
    }

    // Price range match
    if (request.minPrice && item.estimatedValue < request.minPrice) continue;
    if (request.maxPrice && item.estimatedValue > request.maxPrice) continue;

    // Keyword matching in title and description
    const itemTitle = (item.title || '').toLowerCase();
    const itemDesc = (item.description || '').toLowerCase();
    const itemText = `${itemTitle} ${itemDesc}`;

    let keywordMatches = 0;
    for (const keyword of keywords) {
      // Check if keyword appears in item text (partial match for Arabic)
      if (itemText.includes(keyword) || itemTitle.includes(keyword)) {
        keywordMatches++;
      }
      // Also check if any item word contains the keyword (for partial Arabic matches)
      const itemWords = itemText.split(/\s+/);
      for (const itemWord of itemWords) {
        if (itemWord.includes(keyword) || keyword.includes(itemWord)) {
          if (itemWord.length > 2) {
            keywordMatches += 0.5;
            break;
          }
        }
      }
    }

    if (keywords.length > 0) {
      const keywordScore = Math.min(1, keywordMatches / keywords.length);
      confidence += keywordScore * 0.5;
    }

    // If no category selected but keywords match, give base confidence
    if (!request.categoryId && keywordMatches > 0) {
      confidence += 0.2;
    }

    // Lower threshold to be more inclusive
    if (confidence > 0.15) {
      matches.push({ item, confidence: Math.min(1, confidence) });
    }
  }

  // Sort by confidence and return top matches
  matches.sort((a, b) => b.confidence - a.confidence);
  return matches.slice(0, 15); // Increased limit to 15 matches
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

  // Get unique userIds from nodes
  const userIds = new Set<string>();
  for (const [, node] of nodes) {
    userIds.add(node.userId);
  }

  // DFS from each user to find cycles
  for (const userId of userIds) {
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
 * Now validates that items properly connect (what A wants = what B gives)
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

  // Determine what item the current user must give
  // (must match what the previous user wanted)
  const requiredGivingItemId = path.length > 0
    ? path[path.length - 1].receivingItemId
    : null;

  for (const edge of neighbors) {
    // If we have a required item, only follow edges where user gives that item
    if (requiredGivingItemId && edge.givingItemId !== requiredGivingItemId) {
      continue;
    }

    // Found a cycle back to start
    if (edge.to === startUserId && path.length >= minLength - 1) {
      // Validate the cycle closes properly:
      // What this edge wants (receivingItemId) must be what the start user gives
      const firstEdgeGivingItemId = path[0].givingItemId;
      if (edge.receivingItemId !== firstEdgeGivingItemId) {
        continue; // Invalid cycle - items don't connect
      }

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

  // Get unique userIds from nodes
  const userIds = new Set<string>();
  for (const [, node] of nodes) {
    userIds.add(node.userId);
  }

  // Find chains starting from each user
  for (const userId of userIds) {
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
