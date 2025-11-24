/**
 * Optimized Complex Barter Matching Engine
 *
 * Multi-party (2-N parties) exchange cycle discovery that maximizes
 * aggregate Match Score and minimizes cash differentials.
 *
 * Weights:
 * - Value Equivalent: 35%
 * - Description (Semantic): 35%
 * - Sub-Category: 10%
 * - Primary Category: 10%
 * - Location/Logistics: 10%
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ============================================
// Types and Interfaces
// ============================================

interface BarterListing {
  userId: string;
  userName: string;
  itemId: string;
  itemTitle: string;
  offerCategory: string | null;      // Primary category ID
  offerSubCategory: string | null;   // Sub-category ID (item's categoryId)
  offerDescription: string;
  estimatedValue: number;
  desiredCategory: string | null;    // From itemRequest
  desiredSubCategory: string | null; // From itemRequest
  desiredDescription: string;        // From itemRequest
  location: { lat: number; lng: number } | null;
}

interface BarterNode {
  listing: BarterListing;
}

interface BarterEdge {
  from: string;           // userId
  to: string;             // userId
  fromItemId: string;
  toItemId: string;
  matchScore: number;
  breakdown: {
    valueScore: number;
    descriptionScore: number;
    subCategoryScore: number;
    categoryScore: number;
    locationScore: number;
  };
}

interface BarterCycle {
  participants: BarterListing[];
  edges: BarterEdge[];
  totalAggregateScore: number;
  averageScore: number;
  cashDifferential: number;
  isOptimal: boolean;
}

interface ExchangeSequenceItem {
  from: string;
  fromName: string;
  to: string;
  toName: string;
  itemOffered: string;
  itemOfferedTitle: string;
  itemValue: number;
}

interface BarterOpportunity {
  opportunityId: string;
  type: string;
  participantCount: number;
  participants: string[];
  participantNames: string[];
  exchangeSequence: ExchangeSequenceItem[];
  totalAggregateMatchScore: number;
  averageMatchScore: number;
  requiredCashDifferential: number;
  isOptimal: boolean;
  breakdown: {
    totalValueOffered: number;
    totalValueDemanded: number;
  };
}

// ============================================
// Configuration
// ============================================

export const WEIGHTS = {
  VALUE: 0.35,
  DESCRIPTION: 0.35,
  SUB_CATEGORY: 0.10,
  CATEGORY: 0.10,
  LOCATION: 0.10,
};

export const EDGE_THRESHOLD = 0.35; // Minimum score to create an edge
const MIN_CYCLE_LENGTH = 2;
const MAX_CYCLE_LENGTH = 5;
const MIN_CYCLE_SCORE = 0.30; // Minimum average score for a valid cycle

// ============================================
// Utility Functions
// ============================================

/**
 * Calculate Haversine distance between two coordinates in kilometers
 */
const calculateDistance = (
  loc1: { lat: number; lng: number } | null,
  loc2: { lat: number; lng: number } | null
): number => {
  if (!loc1 || !loc2) return 1000; // Default large distance if no location

  const R = 6371; // Earth's radius in km
  const dLat = ((loc2.lat - loc1.lat) * Math.PI) / 180;
  const dLon = ((loc2.lng - loc1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((loc1.lat * Math.PI) / 180) *
      Math.cos((loc2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Tokenize and normalize text for comparison
 */
const tokenize = (text: string): string[] => {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s\u0600-\u06FF]/g, ' ') // Keep Arabic and English chars
    .split(/\s+/)
    .filter(word => word.length > 2);
};

/**
 * Calculate semantic similarity between two descriptions
 * Using TF-IDF-like approach with keyword matching
 */
const calculateDescriptionSimilarity = (
  offerDesc: string,
  desiredDesc: string
): number => {
  const offerTokens = tokenize(offerDesc);
  const desiredTokens = tokenize(desiredDesc);

  if (offerTokens.length === 0 || desiredTokens.length === 0) {
    return 0.5; // Neutral score if no description
  }

  // Calculate Jaccard-like similarity with weighting
  const offerSet = new Set(offerTokens);
  const desiredSet = new Set(desiredTokens);

  let matchCount = 0;
  let totalWeight = 0;

  for (const token of desiredSet) {
    totalWeight += 1;
    if (offerSet.has(token)) {
      matchCount += 1;
    }
  }

  // Also check partial matches (substring)
  for (const desiredToken of desiredSet) {
    for (const offerToken of offerSet) {
      if (
        offerToken.includes(desiredToken) ||
        desiredToken.includes(offerToken)
      ) {
        if (!offerSet.has(desiredToken)) {
          matchCount += 0.5; // Partial match
        }
      }
    }
  }

  const similarity = totalWeight > 0 ? matchCount / totalWeight : 0;
  return Math.min(1, similarity);
};

/**
 * Calculate value similarity score
 * Closer values = higher score
 */
const calculateValueSimilarity = (
  offeredValue: number,
  desiredValue: number
): number => {
  if (offeredValue <= 0 || desiredValue <= 0) return 0.5;

  const ratio = Math.min(offeredValue, desiredValue) / Math.max(offeredValue, desiredValue);
  return ratio; // 1 = exact match, 0 = very different
};

/**
 * Calculate location score (inverse of distance)
 */
const calculateLocationScore = (
  loc1: { lat: number; lng: number } | null,
  loc2: { lat: number; lng: number } | null
): number => {
  const distance = calculateDistance(loc1, loc2);

  // Score decreases with distance
  // 0 km = 1.0, 50 km = 0.5, 100+ km = ~0.1
  if (distance <= 0) return 1.0;
  return Math.max(0.1, 1 / (1 + distance / 50));
};

// ============================================
// Core Match Function
// ============================================

/**
 * Calculate composite match score between Listing A's offer and Listing B's demand
 *
 * Score = Σ(Wi × Similarityi)
 *
 * Weights:
 * - Value Equivalent: 35%
 * - Description (Semantic): 35%
 * - Sub-Category: 10%
 * - Primary Category: 10%
 * - Location/Logistics: 10%
 */
const calculateMatchScore = (
  offerListing: BarterListing,
  demandListing: BarterListing
): { score: number; breakdown: BarterEdge['breakdown'] } => {
  // 1. Value Similarity (35%)
  const valueScore = calculateValueSimilarity(
    offerListing.estimatedValue,
    demandListing.estimatedValue
  );

  // 2. Description Similarity (35%)
  const descriptionScore = calculateDescriptionSimilarity(
    offerListing.offerDescription,
    demandListing.desiredDescription
  );

  // 3. Sub-Category Match (10%) - Binary
  let subCategoryScore = 0;
  if (demandListing.desiredSubCategory) {
    if (offerListing.offerSubCategory === demandListing.desiredSubCategory) {
      subCategoryScore = 1;
    }
  } else {
    subCategoryScore = 0.5; // Neutral if no specific subcategory desired
  }

  // 4. Primary Category Match (10%) - Binary
  let categoryScore = 0;
  if (demandListing.desiredCategory) {
    if (
      offerListing.offerCategory === demandListing.desiredCategory ||
      offerListing.offerSubCategory === demandListing.desiredCategory
    ) {
      categoryScore = 1;
    }
  } else {
    categoryScore = 0.5; // Neutral if no specific category desired
  }

  // 5. Location Score (10%)
  const locationScore = calculateLocationScore(
    offerListing.location,
    demandListing.location
  );

  // Calculate weighted total
  const totalScore =
    WEIGHTS.VALUE * valueScore +
    WEIGHTS.DESCRIPTION * descriptionScore +
    WEIGHTS.SUB_CATEGORY * subCategoryScore +
    WEIGHTS.CATEGORY * categoryScore +
    WEIGHTS.LOCATION * locationScore;

  return {
    score: Math.min(1, totalScore),
    breakdown: {
      valueScore,
      descriptionScore,
      subCategoryScore,
      categoryScore,
      locationScore,
    },
  };
};

// ============================================
// Graph Construction
// ============================================

/**
 * Build directed weighted graph from barter listings
 */
export const buildBarterGraph = async (
  requestingUserId?: string,
  requestingItemId?: string
): Promise<{
  nodes: Map<string, BarterNode>;
  edges: BarterEdge[];
  listings: BarterListing[];
}> => {
  // Get all active items available for barter
  const items = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      listings: {
        none: { status: 'ACTIVE' },
      },
    },
    include: {
      seller: true,
      category: {
        include: {
          parent: true,
        },
      },
    },
  });

  // Get barter offers to understand specific demands (enhances matching)
  const barterOffers = await prisma.barterOffer.findMany({
    where: {
      status: { in: ['PENDING', 'COUNTER_OFFERED'] },
      isOpenOffer: true,
    },
    include: {
      itemRequests: {
        include: {
          category: true,
        },
      },
    },
  });

  // Create a map of user demands from barter offers
  const userDemands = new Map<string, { categoryId: string | null; description: string }>();
  for (const offer of barterOffers) {
    const request = (offer as any).itemRequests?.[0];
    if (request) {
      userDemands.set(offer.initiatorId, {
        categoryId: request.categoryId || null,
        description: request.description || '',
      });
    }
  }

  // Create listings from ALL active items
  const listings: BarterListing[] = [];
  const nodes = new Map<string, BarterNode>();

  for (const item of items) {
    const userDemand = userDemands.get(item.sellerId);

    const listing: BarterListing = {
      userId: item.sellerId,
      userName: item.seller.fullName,
      itemId: item.id,
      itemTitle: item.title,
      offerCategory: item.category?.parentId || item.categoryId,
      offerSubCategory: item.categoryId,
      offerDescription: item.description || item.title,
      estimatedValue: item.estimatedValue,
      // Use specific demand if user has barter offer, otherwise open to similar value items
      desiredCategory: userDemand?.categoryId || null,
      desiredSubCategory: null,
      desiredDescription: userDemand?.description || '',
      location: (item.seller as any).latitude && (item.seller as any).longitude
        ? { lat: (item.seller as any).latitude, lng: (item.seller as any).longitude }
        : null,
    };

    listings.push(listing);
    nodes.set(`${listing.userId}-${listing.itemId}`, { listing });
  }

  // Create edges based on match scores
  const edges: BarterEdge[] = [];

  for (const listingA of listings) {
    for (const listingB of listings) {
      // Skip same user
      if (listingA.userId === listingB.userId) continue;

      // Calculate match: A's offer matches B's demand
      const { score, breakdown } = calculateMatchScore(listingA, listingB);

      if (score >= EDGE_THRESHOLD) {
        edges.push({
          from: listingA.userId,
          to: listingB.userId,
          fromItemId: listingA.itemId,
          toItemId: listingB.itemId,
          matchScore: score,
          breakdown,
        });
      }
    }
  }

  return { nodes, edges, listings };
};

// ============================================
// Cycle Finding Algorithm (DFS)
// ============================================

/**
 * Find all cycles in the graph using modified DFS
 */
export const findBarterCycles = async (
  maxLength: number = MAX_CYCLE_LENGTH,
  minLength: number = MIN_CYCLE_LENGTH,
  requestingUserId?: string,
  requestingItemId?: string
): Promise<BarterCycle[]> => {
  const { nodes, edges, listings } = await buildBarterGraph(requestingUserId, requestingItemId);

  // Build adjacency list
  const adjacencyList = new Map<string, BarterEdge[]>();
  for (const edge of edges) {
    const key = edge.from;
    if (!adjacencyList.has(key)) {
      adjacencyList.set(key, []);
    }
    adjacencyList.get(key)!.push(edge);
  }

  const cycles: BarterCycle[] = [];
  const visited = new Set<string>();

  // Get unique user IDs
  const userIds = [...new Set(listings.map(l => l.userId))];

  // DFS from each user to find cycles
  for (const startUserId of userIds) {
    findCyclesFromNode(
      startUserId,
      startUserId,
      [],
      new Set(),
      adjacencyList,
      listings,
      cycles,
      maxLength,
      minLength
    );
  }

  // Calculate additional metrics for each cycle
  const processedCycles = cycles.map(cycle => {
    // Calculate cash differential
    const totalOffered = cycle.participants.reduce((sum, p) => sum + p.estimatedValue, 0);
    const avgValue = totalOffered / cycle.participants.length;
    const cashDifferential = Math.abs(
      cycle.participants.reduce((diff, p, i) => {
        const nextP = cycle.participants[(i + 1) % cycle.participants.length];
        return diff + (p.estimatedValue - nextP.estimatedValue);
      }, 0)
    );

    return {
      ...cycle,
      cashDifferential,
      isOptimal: cycle.averageScore >= 0.70 && cashDifferential < avgValue * 0.2,
    };
  });

  // Sort by total aggregate score (descending)
  processedCycles.sort((a, b) => b.totalAggregateScore - a.totalAggregateScore);

  // Remove duplicates (same participants in different order)
  const uniqueCycles = removeDuplicateCycles(processedCycles);

  return uniqueCycles;
};

/**
 * DFS helper to find cycles
 */
const findCyclesFromNode = (
  startUserId: string,
  currentUserId: string,
  path: BarterEdge[],
  pathUsers: Set<string>,
  adjacencyList: Map<string, BarterEdge[]>,
  listings: BarterListing[],
  cycles: BarterCycle[],
  maxLength: number,
  minLength: number
): void => {
  if (path.length >= maxLength) return;

  const neighbors = adjacencyList.get(currentUserId) || [];

  for (const edge of neighbors) {
    // Found cycle back to start
    if (edge.to === startUserId && path.length >= minLength - 1) {
      const cycleEdges = [...path, edge];
      const totalScore = cycleEdges.reduce((sum, e) => sum + e.matchScore, 0);
      const avgScore = totalScore / cycleEdges.length;

      if (avgScore >= MIN_CYCLE_SCORE) {
        // Build participants list
        const participants: BarterListing[] = [];
        for (const e of cycleEdges) {
          const listing = listings.find(
            l => l.userId === e.from && l.itemId === e.fromItemId
          );
          if (listing) participants.push(listing);
        }

        cycles.push({
          participants,
          edges: cycleEdges,
          totalAggregateScore: totalScore,
          averageScore: avgScore,
          cashDifferential: 0, // Calculated later
          isOptimal: false, // Determined later
        });
      }
      continue;
    }

    // Skip if user already in path
    if (pathUsers.has(edge.to)) continue;

    // Continue DFS
    const newPath = [...path, edge];
    const newPathUsers = new Set(pathUsers);
    newPathUsers.add(edge.to);

    findCyclesFromNode(
      startUserId,
      edge.to,
      newPath,
      newPathUsers,
      adjacencyList,
      listings,
      cycles,
      maxLength,
      minLength
    );
  }
};

/**
 * Remove duplicate cycles
 */
const removeDuplicateCycles = (cycles: BarterCycle[]): BarterCycle[] => {
  const seen = new Set<string>();
  const unique: BarterCycle[] = [];

  for (const cycle of cycles) {
    // Create signature from sorted user IDs
    const signature = cycle.participants
      .map(p => p.userId)
      .sort()
      .join('-');

    if (!seen.has(signature)) {
      seen.add(signature);
      unique.push(cycle);
    }
  }

  return unique;
};

// ============================================
// API: Find Matches for User
// ============================================

/**
 * Discover barter opportunities for a specific user's item
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
  chains: BarterCycle[];
  totalMatches: number;
}> => {
  const { includeCycles = true, maxResults = 20 } = options;

  let cycles: BarterCycle[] = [];

  if (includeCycles) {
    // Pass the requesting user's item to include it in the graph
    const allCycles = await findBarterCycles(MAX_CYCLE_LENGTH, MIN_CYCLE_LENGTH, userId, itemId);

    // Filter cycles that include this user's item
    cycles = allCycles.filter(c =>
      c.participants.some(p => p.userId === userId && p.itemId === itemId)
    );
  }

  // Take top results
  const topCycles = cycles.slice(0, maxResults);

  return {
    cycles: topCycles,
    chains: [], // Chains are treated as 2-party cycles
    totalMatches: cycles.length,
  };
};

/**
 * Format cycle as API opportunity response
 */
export const formatAsOpportunity = (
  cycle: BarterCycle,
  opportunityId: string
): BarterOpportunity => {
  const exchangeSequence: ExchangeSequenceItem[] = cycle.edges.map((edge, i) => {
    const fromParticipant = cycle.participants.find(
      p => p.userId === edge.from && p.itemId === edge.fromItemId
    );
    const toParticipant = cycle.participants.find(p => p.userId === edge.to);

    return {
      from: edge.from,
      fromName: fromParticipant?.userName || 'Unknown',
      to: edge.to,
      toName: toParticipant?.userName || 'Unknown',
      itemOffered: edge.fromItemId,
      itemOfferedTitle: fromParticipant?.itemTitle || 'Unknown Item',
      itemValue: fromParticipant?.estimatedValue || 0,
    };
  });

  const totalOffered = cycle.participants.reduce((sum, p) => sum + p.estimatedValue, 0);

  return {
    opportunityId,
    type: cycle.participants.length === 2 ? 'Direct (2-Party)' : `Multi-Party (${cycle.participants.length})`,
    participantCount: cycle.participants.length,
    participants: cycle.participants.map(p => p.userId),
    participantNames: cycle.participants.map(p => p.userName),
    exchangeSequence,
    totalAggregateMatchScore: Math.round(cycle.totalAggregateScore * 100) / 100,
    averageMatchScore: Math.round(cycle.averageScore * 100) / 100,
    requiredCashDifferential: Math.round(cycle.cashDifferential),
    isOptimal: cycle.isOptimal,
    breakdown: {
      totalValueOffered: totalOffered,
      totalValueDemanded: totalOffered, // In a cycle, total offered = total demanded
    },
  };
};

// ============================================
// Create Barter Chain Proposal
// ============================================

export const createBarterChainProposal = async (cycle: BarterCycle): Promise<any> => {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7);

  const chain = await prisma.barterChain.create({
    data: {
      chainType: cycle.participants.length === 2 ? 'DIRECT' : 'CYCLE',
      participantCount: cycle.participants.length,
      matchScore: cycle.averageScore,
      algorithmVersion: '2.0',
      description: `${cycle.participants.length}-Party Exchange Cycle`,
      status: 'PROPOSED',
      expiresAt,
      participants: {
        create: cycle.participants.map((participant, index) => {
          const nextParticipant = cycle.participants[(index + 1) % cycle.participants.length];
          return {
            userId: participant.userId,
            givingItemId: participant.itemId,
            receivingItemId: nextParticipant.itemId,
            position: index,
            status: 'PENDING',
          };
        }),
      },
    },
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, fullName: true, avatar: true },
          },
          givingItem: {
            select: { id: true, title: true, images: true, estimatedValue: true },
          },
          receivingItem: {
            select: { id: true, title: true, images: true, estimatedValue: true },
          },
        },
        orderBy: { position: 'asc' },
      },
    },
  });

  return chain;
};

// ============================================
// Exports
// ============================================

export default {
  buildBarterGraph,
  findBarterCycles,
  findMatchesForUser,
  formatAsOpportunity,
  createBarterChainProposal,
  calculateMatchScore,
  WEIGHTS,
  EDGE_THRESHOLD,
};
