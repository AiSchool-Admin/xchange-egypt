/**
 * Proximity Matching Service
 *
 * الميزة الرئيسية للمنصة: المطابقة التلقائية بالقرب الجغرافي
 * Core feature: Automatic matching based on geographic proximity
 *
 * Hierarchy: District → City → Governorate → National
 */

import { MarketType } from '../types/prisma-enums';
import { Server as SocketIOServer } from 'socket.io';
import prisma from '../lib/prisma';

// ============================================
// Types
// ============================================

export interface ProximityMatch {
  id: string;
  type: 'SUPPLY_TO_DEMAND' | 'DEMAND_TO_SUPPLY' | 'SUPPLY_TO_SUPPLY';
  score: number;
  proximityLevel: MarketType;
  distance: number | null; // In kilometers (if coordinates available)

  // Source item (the item that triggered the match)
  sourceItem: {
    id: string;
    title: string;
    type: 'SUPPLY' | 'DEMAND';
    estimatedValue: number;
    marketType: MarketType;
    userId: string;
    userName: string;
    location: {
      governorate: string | null;
      city: string | null;
      district: string | null;
      latitude: number | null;
      longitude: number | null;
    };
  };

  // Matched item
  matchedItem: {
    id: string;
    title: string;
    type: 'SUPPLY' | 'DEMAND';
    estimatedValue: number;
    marketType: MarketType;
    userId: string;
    userName: string;
    location: {
      governorate: string | null;
      city: string | null;
      district: string | null;
      latitude: number | null;
      longitude: number | null;
    };
  };

  matchReason: string;
  createdAt: Date;
}

export interface MatchNotification {
  type: 'proximity_match';
  matchId: string;
  score: number;
  proximityLevel: MarketType;
  sourceTitle: string;
  matchedTitle: string;
  matchedUserId: string;
  matchedUserName: string;
  location: string;
  timestamp: Date;
}

// ============================================
// Configuration
// ============================================

// Proximity weights (higher = better match)
const PROXIMITY_WEIGHTS = {
  DISTRICT: 1.0,      // Same district = 100% proximity score
  CITY: 0.75,         // Same city = 75% proximity score
  GOVERNORATE: 0.50,  // Same governorate = 50% proximity score
  NATIONAL: 0.25,     // National = 25% proximity score
};

// Value match tolerance (percentage difference allowed)
const VALUE_TOLERANCE = 0.30; // 30% difference allowed

// Minimum score for notification
const MIN_NOTIFICATION_SCORE = 0.50; // 50%

// ============================================
// State
// ============================================

let io: SocketIOServer | null = null;

// ============================================
// Initialization
// ============================================

/**
 * Initialize WebSocket for proximity match notifications
 */
export const initializeProximityMatching = (socketServer: SocketIOServer): void => {
  io = socketServer;
  console.log('[ProximityMatching] Service initialized');
};

// ============================================
// Core Matching Logic
// ============================================

/**
 * Find proximity-based matches for a Supply item
 * Searches for Demand items in the same geographic area
 */
export const findMatchesForSupply = async (
  itemId: string,
  options: { maxResults?: number; minScore?: number } = {}
): Promise<ProximityMatch[]> => {
  const { maxResults = 10, minScore = 0.3 } = options;

  // Get the source item
  const sourceItem = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      seller: { select: { id: true, fullName: true } },
      category: true,
    },
  });

  if (!sourceItem) {
    throw new Error('Item not found');
  }

  // Find matching Demand items (BarterOffers with isOpenOffer = true)
  const demandItems = await prisma.barterOffer.findMany({
    where: {
      isOpenOffer: true,
      status: 'PENDING',
      initiatorId: { not: sourceItem.sellerId }, // Not from same user
      expiresAt: { gt: new Date() },
      // Match by market type hierarchy
      OR: getMarketTypeFilter(sourceItem.marketType, sourceItem.governorate, sourceItem.city, sourceItem.district),
    },
    include: {
      initiator: { select: { id: true, fullName: true } },
      itemRequests: { include: { category: true } },
    },
    take: 50, // Get top 50 for scoring
  });

  // Score and rank matches
  const matches: ProximityMatch[] = [];

  for (const demand of demandItems) {
    const score = calculateMatchScore(sourceItem, demand);

    if (score.total >= minScore) {
      matches.push({
        id: `PM-${sourceItem.id}-${demand.id}`,
        type: 'SUPPLY_TO_DEMAND',
        score: score.total,
        proximityLevel: score.proximityLevel,
        distance: calculateDistance(
          sourceItem.latitude,
          sourceItem.longitude,
          null, // Demand items don't have direct coordinates
          null
        ),
        sourceItem: {
          id: sourceItem.id,
          title: sourceItem.title,
          type: 'SUPPLY',
          estimatedValue: sourceItem.estimatedValue,
          marketType: sourceItem.marketType,
          userId: sourceItem.sellerId,
          userName: sourceItem.seller.fullName,
          location: {
            governorate: sourceItem.governorate,
            city: sourceItem.city,
            district: sourceItem.district,
            latitude: sourceItem.latitude,
            longitude: sourceItem.longitude,
          },
        },
        matchedItem: {
          id: demand.id,
          title: demand.itemRequests[0]?.description || 'طلب عام',
          type: 'DEMAND',
          estimatedValue: demand.itemRequests[0]?.maxPrice || 0,
          marketType: demand.marketType,
          userId: demand.initiatorId,
          userName: demand.initiator.fullName,
          location: {
            governorate: demand.governorate,
            city: demand.city,
            district: demand.district,
            latitude: null,
            longitude: null,
          },
        },
        matchReason: score.reason,
        createdAt: new Date(),
      });
    }
  }

  // Sort by score and return top results
  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
};

/**
 * Find proximity-based matches for a Demand item
 * Searches for Supply items in the same geographic area
 */
export const findMatchesForDemand = async (
  demandId: string,
  options: { maxResults?: number; minScore?: number } = {}
): Promise<ProximityMatch[]> => {
  const { maxResults = 10, minScore = 0.3 } = options;

  // Get the demand (BarterOffer)
  const demand = await prisma.barterOffer.findUnique({
    where: { id: demandId },
    include: {
      initiator: { select: { id: true, fullName: true } },
      itemRequests: { include: { category: true } },
    },
  });

  if (!demand) {
    throw new Error('Demand not found');
  }

  // Find matching Supply items
  const supplyItems = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      sellerId: { not: demand.initiatorId }, // Not from same user
      // Match by market type hierarchy
      OR: getMarketTypeFilter(demand.marketType, demand.governorate, demand.city, demand.district),
    },
    include: {
      seller: { select: { id: true, fullName: true } },
      category: true,
    },
    take: 50,
  });

  // Score and rank matches
  const matches: ProximityMatch[] = [];

  for (const supply of supplyItems) {
    const score = calculateMatchScoreForDemand(demand, supply);

    if (score.total >= minScore) {
      matches.push({
        id: `PM-${demand.id}-${supply.id}`,
        type: 'DEMAND_TO_SUPPLY',
        score: score.total,
        proximityLevel: score.proximityLevel,
        distance: null,
        sourceItem: {
          id: demand.id,
          title: demand.itemRequests[0]?.description || 'طلب عام',
          type: 'DEMAND',
          estimatedValue: demand.itemRequests[0]?.maxPrice || 0,
          marketType: demand.marketType,
          userId: demand.initiatorId,
          userName: demand.initiator.fullName,
          location: {
            governorate: demand.governorate,
            city: demand.city,
            district: demand.district,
            latitude: null,
            longitude: null,
          },
        },
        matchedItem: {
          id: supply.id,
          title: supply.title,
          type: 'SUPPLY',
          estimatedValue: supply.estimatedValue,
          marketType: supply.marketType,
          userId: supply.sellerId,
          userName: supply.seller.fullName,
          location: {
            governorate: supply.governorate,
            city: supply.city,
            district: supply.district,
            latitude: supply.latitude,
            longitude: supply.longitude,
          },
        },
        matchReason: score.reason,
        createdAt: new Date(),
      });
    }
  }

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
};

/**
 * Find SUPPLY-to-SUPPLY barter matches
 * When person A has item X (category) and wants Y (desiredCategory)
 * And person B has item Y (category) and wants X (desiredCategory)
 * They are a perfect barter match!
 */
export const findBarterMatches = async (
  itemId: string,
  options: { maxResults?: number; minScore?: number } = {}
): Promise<ProximityMatch[]> => {
  const { maxResults = 10, minScore = 0.3 } = options;

  // Get the source item
  const sourceItem = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      seller: { select: { id: true, fullName: true } },
      category: true,
      desiredCategory: true,
    },
  });

  if (!sourceItem || !sourceItem.desiredCategoryId) {
    return []; // No desired category = not looking to barter
  }

  // Find other items where:
  // 1. Their category matches our desiredCategory
  // 2. Their desiredCategory matches our category (mutual barter)
  // 3. Same geographic area
  const potentialMatches = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      sellerId: { not: sourceItem.sellerId }, // Not from same user
      categoryId: sourceItem.desiredCategoryId, // They have what we want
      desiredCategoryId: sourceItem.categoryId, // They want what we have (optional but increases score)
      // Match by market type hierarchy
      OR: getMarketTypeFilter(sourceItem.marketType, sourceItem.governorate, sourceItem.city, sourceItem.district),
    },
    include: {
      seller: { select: { id: true, fullName: true } },
      category: true,
      desiredCategory: true,
    },
    take: 50,
  });

  // Also find items that just have what we want (even if they don't specifically want what we have)
  const looseMatches = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      sellerId: { not: sourceItem.sellerId },
      categoryId: sourceItem.desiredCategoryId, // They have what we want
      desiredCategoryId: { not: sourceItem.categoryId }, // Exclude already found (mutual matches)
      // Match by market type hierarchy
      OR: getMarketTypeFilter(sourceItem.marketType, sourceItem.governorate, sourceItem.city, sourceItem.district),
    },
    include: {
      seller: { select: { id: true, fullName: true } },
      category: true,
      desiredCategory: true,
    },
    take: 30,
  });

  const allMatches = [...potentialMatches, ...looseMatches];
  const matches: ProximityMatch[] = [];

  for (const matchedItem of allMatches) {
    const score = calculateBarterMatchScore(sourceItem, matchedItem);

    if (score.total >= minScore) {
      matches.push({
        id: `BM-${sourceItem.id}-${matchedItem.id}`,
        type: 'SUPPLY_TO_SUPPLY',
        score: score.total,
        proximityLevel: score.proximityLevel,
        distance: calculateDistance(
          sourceItem.latitude,
          sourceItem.longitude,
          matchedItem.latitude,
          matchedItem.longitude
        ),
        sourceItem: {
          id: sourceItem.id,
          title: sourceItem.title,
          type: 'SUPPLY',
          estimatedValue: sourceItem.estimatedValue,
          marketType: sourceItem.marketType,
          userId: sourceItem.sellerId,
          userName: sourceItem.seller.fullName,
          location: {
            governorate: sourceItem.governorate,
            city: sourceItem.city,
            district: sourceItem.district,
            latitude: sourceItem.latitude,
            longitude: sourceItem.longitude,
          },
        },
        matchedItem: {
          id: matchedItem.id,
          title: matchedItem.title,
          type: 'SUPPLY',
          estimatedValue: matchedItem.estimatedValue,
          marketType: matchedItem.marketType,
          userId: matchedItem.sellerId,
          userName: matchedItem.seller.fullName,
          location: {
            governorate: matchedItem.governorate,
            city: matchedItem.city,
            district: matchedItem.district,
            latitude: matchedItem.latitude,
            longitude: matchedItem.longitude,
          },
        },
        matchReason: score.reason,
        createdAt: new Date(),
      });
    }
  }

  console.log(`[ProximityMatching] Found ${matches.length} barter matches for item ${itemId}`);

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults);
};

/**
 * Calculate barter match score between two Supply items
 */
function calculateBarterMatchScore(itemA: any, itemB: any): MatchScore {
  const reasons: string[] = [];

  // 1. Proximity Score (30% weight for barter)
  const { proximityScore, level } = calculateProximityScore(
    itemA.governorate, itemA.city, itemA.district,
    itemB.governorate, itemB.city, itemB.district
  );

  if (proximityScore > 0) {
    reasons.push(getProximityLabel(level));
  }

  // 2. Category Match Score (40% weight for barter - most important)
  let categoryScore = 0;

  // They have what we want
  if (itemB.categoryId === itemA.desiredCategoryId) {
    categoryScore += 0.5;
    reasons.push('لديهم ما تريد');
  }

  // Mutual match - they also want what we have
  if (itemB.desiredCategoryId === itemA.categoryId) {
    categoryScore += 0.5;
    reasons.push('مقايضة متبادلة مثالية!');
  }

  // 3. Value Match Score (30% weight)
  let valueScore = 0;
  if (itemA.estimatedValue > 0 && itemB.estimatedValue > 0) {
    const valueDiff = Math.abs(itemA.estimatedValue - itemB.estimatedValue);
    const avgValue = (itemA.estimatedValue + itemB.estimatedValue) / 2;
    const valueRatio = 1 - Math.min(valueDiff / avgValue, 1);
    valueScore = valueRatio;

    if (valueRatio >= 0.8) {
      reasons.push('قيم متقاربة');
    }
  }

  // Calculate total score
  const total = (proximityScore * 0.3) + (categoryScore * 0.4) + (valueScore * 0.3);

  return {
    total,
    proximityScore,
    proximityLevel: level,
    categoryScore,
    valueScore,
    reason: reasons.join(' • ') || 'تطابق محتمل',
  };
}

// ============================================
// Scoring Functions
// ============================================

interface MatchScore {
  total: number;
  proximityScore: number;
  proximityLevel: MarketType;
  categoryScore: number;
  valueScore: number;
  reason: string;
}

/**
 * Calculate match score between a Supply item and a Demand item
 */
function calculateMatchScore(supply: any, demand: any): MatchScore {
  const reasons: string[] = [];

  // 1. Proximity Score (40% weight)
  const { proximityScore, level } = calculateProximityScore(
    supply.governorate,
    supply.city,
    supply.district,
    demand.governorate,
    demand.city,
    demand.district
  );

  if (proximityScore > 0) {
    reasons.push(getProximityLabel(level));
  }

  // 2. Category Match Score (30% weight)
  let categoryScore = 0;
  const demandRequest = demand.itemRequests[0];

  if (demandRequest?.categoryId && supply.categoryId === demandRequest.categoryId) {
    categoryScore = 1.0;
    reasons.push('نفس الفئة');
  } else if (demandRequest?.keywords && demandRequest.keywords.length > 0) {
    // Check keyword matches
    const supplyText = `${supply.title} ${supply.description}`.toLowerCase();
    const matchedKeywords = demandRequest.keywords.filter((kw: string) =>
      supplyText.includes(kw.toLowerCase())
    );
    if (matchedKeywords.length > 0) {
      categoryScore = matchedKeywords.length / demandRequest.keywords.length;
      reasons.push(`تطابق كلمات: ${matchedKeywords.join(', ')}`);
    }
  }

  // 3. Value Match Score (30% weight)
  let valueScore = 0;
  if (demandRequest?.minPrice && demandRequest?.maxPrice) {
    if (supply.estimatedValue >= demandRequest.minPrice &&
        supply.estimatedValue <= demandRequest.maxPrice) {
      valueScore = 1.0;
      reasons.push('السعر مناسب');
    } else {
      // Partial match if close
      const midPrice = (demandRequest.minPrice + demandRequest.maxPrice) / 2;
      const diff = Math.abs(supply.estimatedValue - midPrice) / midPrice;
      if (diff <= VALUE_TOLERANCE) {
        valueScore = 1 - diff;
      }
    }
  } else {
    // No price requirement, give partial score
    valueScore = 0.5;
  }

  // Calculate total weighted score
  const total = (proximityScore * 0.4) + (categoryScore * 0.3) + (valueScore * 0.3);

  return {
    total,
    proximityScore,
    proximityLevel: level,
    categoryScore,
    valueScore,
    reason: reasons.join(' | ') || 'تطابق جغرافي',
  };
}

/**
 * Calculate match score for Demand → Supply matching
 */
function calculateMatchScoreForDemand(demand: any, supply: any): MatchScore {
  // Similar logic but reversed
  return calculateMatchScore(supply, demand);
}

/**
 * Calculate proximity score between two locations
 */
function calculateProximityScore(
  gov1: string | null,
  city1: string | null,
  district1: string | null,
  gov2: string | null,
  city2: string | null,
  district2: string | null
): { proximityScore: number; level: MarketType } {
  // Same district
  if (district1 && district2 && district1 === district2) {
    return { proximityScore: PROXIMITY_WEIGHTS.DISTRICT, level: 'DISTRICT' };
  }

  // Same city
  if (city1 && city2 && city1 === city2) {
    return { proximityScore: PROXIMITY_WEIGHTS.CITY, level: 'CITY' };
  }

  // Same governorate
  if (gov1 && gov2 && gov1 === gov2) {
    return { proximityScore: PROXIMITY_WEIGHTS.GOVERNORATE, level: 'GOVERNORATE' };
  }

  // National (any location in Egypt)
  return { proximityScore: PROXIMITY_WEIGHTS.NATIONAL, level: 'NATIONAL' };
}

/**
 * Get human-readable proximity label
 */
function getProximityLabel(level: MarketType): string {
  switch (level) {
    case 'DISTRICT': return 'نفس الحي';
    case 'CITY': return 'نفس المدينة';
    case 'GOVERNORATE': return 'نفس المحافظة';
    case 'NATIONAL': return 'مصر';
    default: return '';
  }
}

/**
 * Build market type filter for Prisma queries
 */
function getMarketTypeFilter(
  marketType: MarketType,
  governorate: string | null,
  city: string | null,
  district: string | null
): any[] {
  const filters: any[] = [];

  // Always include national market
  filters.push({ marketType: 'NATIONAL' });

  // Include same governorate
  if (governorate) {
    filters.push({
      marketType: 'GOVERNORATE',
      governorate: governorate
    });
    filters.push({
      marketType: 'CITY',
      governorate: governorate
    });
    filters.push({
      marketType: 'DISTRICT',
      governorate: governorate
    });
  }

  // Include same city
  if (city) {
    filters.push({
      marketType: 'CITY',
      city: city
    });
    filters.push({
      marketType: 'DISTRICT',
      city: city
    });
  }

  // Include same district
  if (district) {
    filters.push({
      marketType: 'DISTRICT',
      district: district
    });
  }

  return filters;
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number | null,
  lon1: number | null,
  lat2: number | null,
  lon2: number | null
): number | null {
  if (!lat1 || !lon1 || !lat2 || !lon2) {
    return null;
  }

  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ============================================
// Notification Functions
// ============================================

/**
 * Notify user about a proximity match
 */
export const notifyProximityMatch = async (
  userId: string,
  match: ProximityMatch
): Promise<void> => {
  // Create database notification
  await prisma.notification.create({
    data: {
      userId,
      type: 'BARTER_MATCH',
      priority: 'HIGH',
      title: match.type === 'SUPPLY_TO_DEMAND'
        ? '🎯 مطابقة جديدة لعرضك!'
        : '🎯 عرض جديد يناسب طلبك!',
      message: `${match.matchReason} - ${Math.round(match.score * 100)}% تطابق`,
      entityType: match.type === 'SUPPLY_TO_DEMAND' ? 'Item' : 'BarterOffer',
      entityId: match.matchedItem.id,
      actionUrl: match.type === 'SUPPLY_TO_DEMAND'
        ? `/barter/respond/${match.matchedItem.id}`
        : `/items/${match.matchedItem.id}`,
      metadata: {
        matchId: match.id,
        score: match.score,
        proximityLevel: match.proximityLevel,
      },
    } as any,
  });

  // Send WebSocket notification
  if (io) {
    const notification: MatchNotification = {
      type: 'proximity_match',
      matchId: match.id,
      score: match.score,
      proximityLevel: match.proximityLevel,
      sourceTitle: match.sourceItem.title,
      matchedTitle: match.matchedItem.title,
      matchedUserId: match.matchedItem.userId,
      matchedUserName: match.matchedItem.userName,
      location: getProximityLabel(match.proximityLevel),
      timestamp: new Date(),
    };

    io.to(`user:${userId}`).emit('proximity_match', notification);
    console.log(`[ProximityMatching] Notified user ${userId} about match ${match.id}`);
  }
};

/**
 * Process new Supply item and find/notify matches
 */
export const processNewSupplyItem = async (itemId: string): Promise<number> => {
  console.log(`[ProximityMatching] Processing new supply item: ${itemId}`);

  try {
    let notificationCount = 0;

    // 1. Find Supply → Demand matches (traditional)
    const demandMatches = await findMatchesForSupply(itemId, {
      minScore: MIN_NOTIFICATION_SCORE
    });

    console.log(`[ProximityMatching] Found ${demandMatches.length} demand matches`);

    for (const match of demandMatches) {
      // Notify the demand owner about the new supply
      await notifyProximityMatch(match.matchedItem.userId, match);
      notificationCount++;
    }

    // 2. Find Supply → Supply barter matches (item-to-item)
    const barterMatches = await findBarterMatches(itemId, {
      minScore: MIN_NOTIFICATION_SCORE
    });

    console.log(`[ProximityMatching] Found ${barterMatches.length} barter matches`);

    for (const match of barterMatches) {
      // Notify the other item owner about potential barter
      await notifyProximityMatch(match.matchedItem.userId, match);
      notificationCount++;
    }

    console.log(`[ProximityMatching] Total notifications sent: ${notificationCount}`);
    return notificationCount;
  } catch (error) {
    console.error('[ProximityMatching] Error processing supply item:', error);
    return 0;
  }
};

/**
 * Process new Demand item and find/notify matches
 */
export const processNewDemandItem = async (demandId: string): Promise<number> => {
  console.log(`[ProximityMatching] Processing new demand: ${demandId}`);

  try {
    const matches = await findMatchesForDemand(demandId, {
      minScore: MIN_NOTIFICATION_SCORE
    });

    console.log(`[ProximityMatching] Found ${matches.length} matches`);

    let notificationCount = 0;

    for (const match of matches) {
      // Notify the supply owner about the new demand
      await notifyProximityMatch(match.matchedItem.userId, match);
      notificationCount++;
    }

    return notificationCount;
  } catch (error) {
    console.error('[ProximityMatching] Error processing demand:', error);
    return 0;
  }
};

// ============================================
// API Functions
// ============================================

/**
 * Get proximity matches for a user (all their items/demands)
 */
export const getMatchesForUser = async (
  userId: string,
  options: {
    type?: 'SUPPLY' | 'DEMAND' | 'ALL';
    limit?: number;
  } = {}
): Promise<{
  supplyMatches: ProximityMatch[];
  demandMatches: ProximityMatch[];
  total: number;
}> => {
  const { type = 'ALL', limit = 20 } = options;

  let supplyMatches: ProximityMatch[] = [];
  let demandMatches: ProximityMatch[] = [];

  if (type === 'ALL' || type === 'SUPPLY') {
    // Get user's active supply items
    const items = await prisma.item.findMany({
      where: { sellerId: userId, status: 'ACTIVE' },
      select: { id: true },
    });

    for (const item of items) {
      const matches = await findMatchesForSupply(item.id, { maxResults: 5 });
      supplyMatches.push(...matches);
    }
  }

  if (type === 'ALL' || type === 'DEMAND') {
    // Get user's active demands
    const demands = await prisma.barterOffer.findMany({
      where: {
        initiatorId: userId,
        isOpenOffer: true,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
      },
      select: { id: true },
    });

    for (const demand of demands) {
      const matches = await findMatchesForDemand(demand.id, { maxResults: 5 });
      demandMatches.push(...matches);
    }
  }

  // Sort and limit
  supplyMatches = supplyMatches.sort((a, b) => b.score - a.score).slice(0, limit);
  demandMatches = demandMatches.sort((a, b) => b.score - a.score).slice(0, limit);

  return {
    supplyMatches,
    demandMatches,
    total: supplyMatches.length + demandMatches.length,
  };
};

/**
 * Get nearby items for a location
 */
export const getNearbyItems = async (
  governorate: string,
  city?: string,
  district?: string,
  options: { type?: 'SUPPLY' | 'DEMAND'; limit?: number } = {}
): Promise<any[]> => {
  const { type = 'SUPPLY', limit = 20 } = options;

  if (type === 'SUPPLY') {
    return prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        OR: [
          { district: district || undefined },
          { city: city || undefined },
          { governorate },
          { marketType: 'NATIONAL' },
        ],
      },
      include: {
        seller: { select: { id: true, fullName: true, avatar: true } },
        category: true,
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  } else {
    return prisma.barterOffer.findMany({
      where: {
        isOpenOffer: true,
        status: 'PENDING',
        expiresAt: { gt: new Date() },
        OR: [
          { district: district || undefined },
          { city: city || undefined },
          { governorate },
          { marketType: 'NATIONAL' },
        ],
      },
      include: {
        initiator: { select: { id: true, fullName: true, avatar: true } },
        itemRequests: { include: { category: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
};

// ============================================
// Statistics
// ============================================

/**
 * Get proximity matching statistics
 */
export const getProximityMatchingStats = async () => {
  const [
    totalSupplyItems,
    totalDemandItems,
    itemsByMarket,
    demandsByMarket,
  ] = await Promise.all([
    prisma.item.count({ where: { status: 'ACTIVE' } }),
    prisma.barterOffer.count({
      where: { isOpenOffer: true, status: 'PENDING', expiresAt: { gt: new Date() } }
    }),
    prisma.item.groupBy({
      by: ['marketType'],
      where: { status: 'ACTIVE' },
      _count: true,
    }),
    prisma.barterOffer.groupBy({
      by: ['marketType'],
      where: { isOpenOffer: true, status: 'PENDING' },
      _count: true,
    }),
  ]);

  return {
    totalSupplyItems,
    totalDemandItems,
    itemsByMarket: itemsByMarket.reduce((acc, curr) => ({
      ...acc,
      [curr.marketType]: curr._count,
    }), {}),
    demandsByMarket: demandsByMarket.reduce((acc, curr) => ({
      ...acc,
      [curr.marketType]: curr._count,
    }), {}),
    websocketConnected: io !== null,
  };
};

export default {
  initializeProximityMatching,
  findMatchesForSupply,
  findMatchesForDemand,
  findBarterMatches,
  processNewSupplyItem,
  processNewDemandItem,
  getMatchesForUser,
  getNearbyItems,
  getProximityMatchingStats,
  notifyProximityMatch,
};
