/**
 * Unified Matching Orchestrator Service
 * نظام المطابقة الذكية الموحد
 *
 * Coordinates all matching types:
 * - SUPPLY ↔ DEMAND (Sale/Auction → Direct Buy/Reverse Auction)
 * - SUPPLY ↔ SUPPLY (Barter matching)
 * - Multi-party barter chains
 *
 * Geographic Priority (الأولوية الجغرافية):
 * 1. DISTRICT (الحي) - 100%
 * 2. CITY (المدينة) - 80%
 * 3. GOVERNORATE (المحافظة) - 60%
 * 4. NATIONAL (الدولة) - 40%
 */

import prisma from '../lib/prisma';
import { Server as SocketIOServer } from 'socket.io';
import { createNotification } from './notification.service';
import { itemEvents, ItemCreatedPayload, ItemUpdatedPayload } from '../events/item.events';
import { barterEvents, BarterOfferCreatedPayload } from '../events/barter.events';
import { reverseAuctionEvents, ReverseAuctionCreatedPayload } from '../events/reverse-auction.events';

// ============================================
// Types
// ============================================

interface ItemWithRelations {
  id: string;
  title: string;
  description: string | null;
  sellerId: string;
  categoryId: string | null;
  estimatedValue: number;
  listingType: string;
  status: string;
  governorate: string | null;
  city: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  desiredCategoryId: string | null;
  desiredItemTitle: string | null;
  desiredKeywords: string | null;
  desiredValueMax: number | null;
  seller?: {
    id: string;
    fullName: string;
  };
  category?: {
    id: string;
    nameAr: string;
    nameEn: string;
  } | null;
  desiredCategory?: {
    id: string;
    nameAr: string;
    nameEn: string;
  } | null;
}

export type MatchType =
  | 'PERFECT_BARTER'      // تطابق مقايضة مثالي (A↔B)
  | 'BARTER_CHAIN'        // سلسلة مقايضة (A→B→C→A)
  | 'SALE_TO_DEMAND'      // بيع يطابق طلب شراء
  | 'DEMAND_TO_SUPPLY'    // طلب شراء يطابق عرض
  | 'AUCTION_MATCH'       // مزاد يطابق طلب
  | 'REVERSE_AUCTION';    // مناقصة تطابق عرض

export type ProximityLevel = 'DISTRICT' | 'CITY' | 'GOVERNORATE' | 'NATIONAL';

export interface MatchResult {
  id: string;
  type: MatchType;
  score: number;
  proximityLevel: ProximityLevel;
  proximityScore: number;
  categoryScore: number;
  valueScore: number;
  keywordScore: number;

  sourceItem: {
    id: string;
    title: string;
    sellerId: string;
    sellerName: string;
    categoryId: string | null;
    categoryName: string | null;
    estimatedValue: number;
    listingType: string;
    location: LocationInfo;
  };

  matchedItem: {
    id: string;
    title: string;
    sellerId: string;
    sellerName: string;
    categoryId: string | null;
    categoryName: string | null;
    estimatedValue: number;
    listingType: string;
    location: LocationInfo;
  };

  matchReason: string;
  matchReasonAr: string;
  createdAt: Date;
}

interface LocationInfo {
  governorate: string | null;
  city: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
}

interface MatchScoreBreakdown {
  total: number;
  proximity: number;
  proximityLevel: ProximityLevel;
  category: number;
  value: number;
  keyword: number;
  isMutualBarter: boolean;
  reasons: string[];
  reasonsAr: string[];
}

// ============================================
// Configuration
// ============================================

// Geographic proximity weights (الأوزان الجغرافية)
const PROXIMITY_WEIGHTS: Record<ProximityLevel, number> = {
  DISTRICT: 1.0,      // نفس الحي = 100%
  CITY: 0.80,         // نفس المدينة = 80%
  GOVERNORATE: 0.60,  // نفس المحافظة = 60%
  NATIONAL: 0.40,     // أي مكان في مصر = 40%
};

// Score weights for different match types
const SCORE_WEIGHTS = {
  // For Supply ↔ Demand matching
  SUPPLY_DEMAND: {
    proximity: 0.35,    // 35% للموقع الجغرافي
    category: 0.30,     // 30% لتطابق الفئة
    value: 0.25,        // 25% لتطابق القيمة
    keyword: 0.10,      // 10% لتطابق الكلمات
  },
  // For Barter matching
  BARTER: {
    proximity: 0.25,    // 25% للموقع الجغرافي
    category: 0.35,     // 35% لتطابق الفئة (أهم في المقايضة)
    value: 0.25,        // 25% لتطابق القيمة
    keyword: 0.15,      // 15% لتطابق الكلمات
  },
};

// Thresholds
const MIN_NOTIFICATION_SCORE = 0.50;  // 50% minimum for notification
const MIN_PERFECT_MATCH_SCORE = 0.70; // 70% for "perfect match" label
const VALUE_TOLERANCE = 0.30;         // 30% price difference allowed
const NOTIFICATION_COOLDOWN_MS = 30 * 60 * 1000; // 30 minutes between duplicate notifications

// ============================================
// State
// ============================================

let io: SocketIOServer | null = null;

// Notification deduplication cache
// Key: `${userId}:${matchedItemId}:${matchType}`
const notificationCache = new Map<string, number>();

// Clean old entries every 10 minutes (only in non-test environment)
let cacheCleanupInterval: ReturnType<typeof setInterval> | null = null;

const startCacheCleanup = () => {
  if (cacheCleanupInterval || process.env.NODE_ENV === 'test') return;

  cacheCleanupInterval = setInterval(() => {
    const now = Date.now();
    Array.from(notificationCache.entries()).forEach(([key, timestamp]) => {
      if (now - timestamp > NOTIFICATION_COOLDOWN_MS) {
        notificationCache.delete(key);
      }
    });
    console.log(`[UnifiedMatching] Cache cleaned, ${notificationCache.size} entries remaining`);
  }, 10 * 60 * 1000);
};

export const stopCacheCleanup = () => {
  if (cacheCleanupInterval) {
    clearInterval(cacheCleanupInterval);
    cacheCleanupInterval = null;
  }
};

// ============================================
// Initialization
// ============================================

/**
 * Initialize the unified matching service
 */
export const initUnifiedMatching = (socketServer?: SocketIOServer): void => {
  if (socketServer) {
    io = socketServer;
  }

  // Start cache cleanup interval
  startCacheCleanup();

  console.log('[UnifiedMatching] Initializing unified matching service...');

  // Listen for new items
  itemEvents.onItemCreated(async (payload: ItemCreatedPayload) => {
    console.log(`[UnifiedMatching] New item created: ${payload.itemId}`);
    await processNewItem(payload.itemId, payload.userId);
  });

  // Listen for item updates (status change to ACTIVE)
  itemEvents.onItemUpdated(async (payload: ItemUpdatedPayload) => {
    if (payload.status === 'ACTIVE' && payload.previousStatus !== 'ACTIVE') {
      console.log(`[UnifiedMatching] Item activated: ${payload.itemId}`);
      await processNewItem(payload.itemId, payload.userId);
    }
  });

  // Listen for new barter offers
  barterEvents.onOfferCreated(async (payload: BarterOfferCreatedPayload) => {
    console.log(`[UnifiedMatching] New barter offer: ${payload.offerId}`);
    await processNewBarterOffer(payload);
  });

  // Listen for new reverse auctions (purchase requests)
  reverseAuctionEvents.onAuctionCreated(async (payload: ReverseAuctionCreatedPayload) => {
    console.log(`[UnifiedMatching] New reverse auction: ${payload.auctionId}`);
    await processNewReverseAuction(payload);
  });

  console.log('[UnifiedMatching] Service initialized ✅');
};

// ============================================
// Core Matching Logic
// ============================================

/**
 * Process a newly created item and find all matches
 */
export const processNewItem = async (itemId: string, sellerId: string): Promise<MatchResult[]> => {
  const allMatches: MatchResult[] = [];

  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        seller: { select: { id: true, fullName: true } },
        category: { select: { id: true, nameAr: true, nameEn: true } },
        desiredCategory: { select: { id: true, nameAr: true, nameEn: true } },
      },
    });

    if (!item || item.status !== 'ACTIVE') {
      return allMatches;
    }

    const isBarterItem = item.listingType === 'BARTER' ||
                         item.desiredCategoryId ||
                         item.desiredItemTitle;

    const isSupplyItem = ['DIRECT_SALE', 'AUCTION', 'BARTER'].includes(item.listingType);
    const isDemandItem = ['DIRECT_BUY', 'REVERSE_AUCTION'].includes(item.listingType);

    // 1. If SUPPLY item → Find matching DEMAND items
    if (isSupplyItem) {
      const demandMatches = await findDemandMatches(item);
      allMatches.push(...demandMatches);
    }

    // 2. If DEMAND item → Find matching SUPPLY items
    if (isDemandItem) {
      const supplyMatches = await findSupplyMatches(item);
      allMatches.push(...supplyMatches);
    }

    // 3. If BARTER item → Find perfect barter matches
    if (isBarterItem) {
      const barterMatches = await findBarterMatches(item);
      allMatches.push(...barterMatches);
    }

    // Send notifications for high-quality matches
    await sendMatchNotifications(allMatches, sellerId);

    console.log(`[UnifiedMatching] Processed item ${itemId}: ${allMatches.length} matches found`);

  } catch (error) {
    console.error('[UnifiedMatching] Error processing item:', error);
  }

  return allMatches;
};

/**
 * Find DEMAND items that match a SUPPLY item
 */
const findDemandMatches = async (supplyItem: ItemWithRelations): Promise<MatchResult[]> => {
  const matches: MatchResult[] = [];

  // Search in unified items table (DIRECT_BUY, REVERSE_AUCTION)
  const demandItems = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      listingType: { in: ['DIRECT_BUY', 'REVERSE_AUCTION'] },
      sellerId: { not: supplyItem.sellerId },
      OR: [
        // Match by category
        { categoryId: supplyItem.categoryId },
        // Match by desired keywords
        ...(supplyItem.title ? supplyItem.title.split(/[\s,،]+/)
          .filter((k: string) => k.length > 2)
          .map((keyword: string) => ({
            desiredKeywords: { contains: keyword, mode: 'insensitive' as const }
          })) : []),
      ],
    },
    include: {
      seller: { select: { id: true, fullName: true } },
      category: { select: { id: true, nameAr: true, nameEn: true } },
    },
    take: 50,
  });

  // Also search in ReverseAuctions table
  const reverseAuctions = await prisma.reverseAuction.findMany({
    where: {
      status: 'ACTIVE',
      buyerId: { not: supplyItem.sellerId },
      endDate: { gt: new Date() },
      categoryId: supplyItem.categoryId,
      OR: [
        { maxBudget: { gte: supplyItem.estimatedValue * 0.8 } },
        { maxBudget: null },
      ],
    },
    include: {
      buyer: { select: { id: true, fullName: true } },
      category: { select: { id: true, nameAr: true, nameEn: true } },
    },
    take: 30,
  });

  // Score demand items
  for (const demand of demandItems) {
    const score = calculateMatchScore(supplyItem, demand, 'SUPPLY_DEMAND');

    if (score.total >= MIN_NOTIFICATION_SCORE) {
      matches.push(createMatchResult(
        'SALE_TO_DEMAND',
        supplyItem,
        demand,
        score
      ));
    }
  }

  // Score reverse auctions
  for (const auction of reverseAuctions) {
    const auctionAsItem: ItemWithRelations = {
      id: auction.id,
      title: auction.title,
      description: auction.description || null,
      sellerId: auction.buyerId,
      seller: auction.buyer,
      categoryId: auction.categoryId,
      category: auction.category,
      estimatedValue: auction.maxBudget || 0,
      desiredValueMax: auction.maxBudget,
      governorate: auction.location || null,  // ReverseAuction uses 'location' field
      city: null,  // ReverseAuction doesn't have separate city field
      district: null,
      latitude: null,
      longitude: null,
      listingType: 'REVERSE_AUCTION',
      status: auction.status || 'ACTIVE',
      desiredCategoryId: auction.categoryId,
      desiredItemTitle: auction.title,
      desiredKeywords: null,
    };

    const score = calculateMatchScore(supplyItem, auctionAsItem, 'SUPPLY_DEMAND');

    if (score.total >= MIN_NOTIFICATION_SCORE) {
      matches.push(createMatchResult(
        'REVERSE_AUCTION',
        supplyItem,
        auctionAsItem,
        score
      ));
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, 10);
};

/**
 * Find SUPPLY items that match a DEMAND item
 */
const findSupplyMatches = async (demandItem: ItemWithRelations): Promise<MatchResult[]> => {
  const matches: MatchResult[] = [];

  const orConditions: Array<{ categoryId?: string; title?: { contains: string; mode: 'insensitive' } }> = [];

  // Match by category
  if (demandItem.categoryId) {
    orConditions.push({ categoryId: demandItem.categoryId });
  }

  // Match by keywords
  if (demandItem.desiredKeywords) {
    const keywords = demandItem.desiredKeywords.split(',').map((k: string) => k.trim()).filter((k: string) => k.length > 2);
    for (const keyword of keywords) {
      orConditions.push({ title: { contains: keyword, mode: 'insensitive' as const } });
    }
  }

  if (orConditions.length === 0) return matches;

  const supplyItems = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      listingType: { in: ['DIRECT_SALE', 'AUCTION', 'BARTER'] },
      sellerId: { not: demandItem.sellerId },
      OR: orConditions,
      ...(demandItem.desiredValueMax && {
        estimatedValue: { lte: demandItem.desiredValueMax * 1.3 }
      }),
    },
    include: {
      seller: { select: { id: true, fullName: true } },
      category: { select: { id: true, nameAr: true, nameEn: true } },
    },
    take: 50,
  });

  for (const supply of supplyItems) {
    const score = calculateMatchScore(demandItem, supply, 'SUPPLY_DEMAND');

    if (score.total >= MIN_NOTIFICATION_SCORE) {
      matches.push(createMatchResult(
        'DEMAND_TO_SUPPLY',
        demandItem,
        supply,
        score
      ));
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, 10);
};

/**
 * Find perfect BARTER matches (A wants B, B wants A)
 */
const findBarterMatches = async (item: ItemWithRelations): Promise<MatchResult[]> => {
  const matches: MatchResult[] = [];

  if (!item.desiredCategoryId && !item.desiredItemTitle) {
    return matches;
  }

  // Build search conditions for what this item wants
  const wantConditions: Array<{ categoryId?: string; title?: { contains: string; mode: 'insensitive' } }> = [];

  if (item.desiredCategoryId) {
    wantConditions.push({ categoryId: item.desiredCategoryId });
  }

  if (item.desiredItemTitle) {
    const keywords = item.desiredItemTitle.split(/[\s,،]+/).filter((k: string) => k.length > 2);
    for (const keyword of keywords) {
      wantConditions.push({ title: { contains: keyword, mode: 'insensitive' as const } });
    }
  }

  if (wantConditions.length === 0) return matches;

  // Find items that have what this user wants
  const potentialMatches = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      sellerId: { not: item.sellerId },
      OR: wantConditions,
    },
    include: {
      seller: { select: { id: true, fullName: true } },
      category: { select: { id: true, nameAr: true, nameEn: true } },
      desiredCategory: { select: { id: true, nameAr: true, nameEn: true } },
    },
    take: 100,
  });

  for (const otherItem of potentialMatches) {
    const score = calculateMatchScore(item, otherItem, 'BARTER');

    // Check if it's a mutual/perfect barter match
    if (score.isMutualBarter) {
      score.total = Math.min(score.total * 1.2, 1.0); // Boost score for mutual matches
      score.reasonsAr.unshift('🎯 تطابق مثالي متبادل!');
      score.reasons.unshift('🎯 Perfect mutual match!');
    }

    if (score.total >= MIN_NOTIFICATION_SCORE) {
      matches.push(createMatchResult(
        score.isMutualBarter ? 'PERFECT_BARTER' : 'SALE_TO_DEMAND',
        item,
        otherItem,
        score
      ));
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, 10);
};

// ============================================
// Scoring Functions
// ============================================

/**
 * Calculate comprehensive match score between two items
 */
const calculateMatchScore = (
  sourceItem: ItemWithRelations,
  targetItem: ItemWithRelations,
  matchType: 'SUPPLY_DEMAND' | 'BARTER'
): MatchScoreBreakdown => {
  const weights = SCORE_WEIGHTS[matchType];
  const reasons: string[] = [];
  const reasonsAr: string[] = [];

  // 1. Proximity Score (الموقع الجغرافي)
  const { score: proximityScore, level: proximityLevel } = calculateProximityScore(
    sourceItem.governorate, sourceItem.city, sourceItem.district,
    targetItem.governorate, targetItem.city, targetItem.district
  );

  if (proximityScore >= PROXIMITY_WEIGHTS.DISTRICT) {
    reasonsAr.push('نفس الحي');
    reasons.push('Same district');
  } else if (proximityScore >= PROXIMITY_WEIGHTS.CITY) {
    reasonsAr.push('نفس المدينة');
    reasons.push('Same city');
  } else if (proximityScore >= PROXIMITY_WEIGHTS.GOVERNORATE) {
    reasonsAr.push('نفس المحافظة');
    reasons.push('Same governorate');
  }

  // 2. Category Score (تطابق الفئة)
  let categoryScore = 0;

  // Direct category match
  if (sourceItem.categoryId && targetItem.categoryId &&
      sourceItem.categoryId === targetItem.categoryId) {
    categoryScore = 1.0;
    reasonsAr.push('نفس الفئة');
    reasons.push('Same category');
  }
  // Check if source wants target's category (for barter)
  else if (sourceItem.desiredCategoryId && targetItem.categoryId &&
           sourceItem.desiredCategoryId === targetItem.categoryId) {
    categoryScore = 0.9;
    reasonsAr.push('لديهم ما تريد');
    reasons.push('They have what you want');
  }

  // 3. Value Score (تطابق القيمة)
  let valueScore = 0;
  const sourceValue = sourceItem.estimatedValue || sourceItem.desiredValueMax || 0;
  const targetValue = targetItem.estimatedValue || targetItem.desiredValueMax || 0;

  if (sourceValue > 0 && targetValue > 0) {
    const valueDiff = Math.abs(sourceValue - targetValue);
    const avgValue = (sourceValue + targetValue) / 2;
    const valueRatio = valueDiff / avgValue;

    if (valueRatio <= VALUE_TOLERANCE) {
      valueScore = 1 - (valueRatio / VALUE_TOLERANCE);
      if (valueScore >= 0.7) {
        reasonsAr.push('قيم متقاربة');
        reasons.push('Similar values');
      }
    }
  } else {
    valueScore = 0.5; // Neutral if no values specified
  }

  // 4. Keyword Score (تطابق الكلمات)
  // Check both directions: source keywords against target, and target keywords against source
  let keywordScore = 0;
  const sourceText = `${sourceItem.title || ''} ${sourceItem.description || ''}`.toLowerCase();
  const targetText = `${targetItem.title || ''} ${targetItem.description || ''}`.toLowerCase();

  // Source's desired keywords against target's content
  const sourceDesiredKeywords = (sourceItem.desiredKeywords || sourceItem.desiredItemTitle || '').toLowerCase();
  // Target's desired keywords against source's content
  const targetDesiredKeywords = (targetItem.desiredKeywords || targetItem.desiredItemTitle || '').toLowerCase();

  let bestMatchScore = 0;
  let matchedKeywordsList: string[] = [];

  // Check source's keywords against target
  if (sourceDesiredKeywords) {
    const keywords = sourceDesiredKeywords.split(/[\s,،]+/).filter((k: string) => k.length > 2);
    const matchedKeywords = keywords.filter((kw: string) => targetText.includes(kw));
    if (keywords.length > 0) {
      const score = matchedKeywords.length / keywords.length;
      if (score > bestMatchScore) {
        bestMatchScore = score;
        matchedKeywordsList = matchedKeywords;
      }
    }
  }

  // Check target's keywords against source (reverse matching for buyer-to-seller)
  if (targetDesiredKeywords) {
    const keywords = targetDesiredKeywords.split(/[\s,،]+/).filter((k: string) => k.length > 2);
    const matchedKeywords = keywords.filter((kw: string) => sourceText.includes(kw));
    if (keywords.length > 0) {
      const score = matchedKeywords.length / keywords.length;
      if (score > bestMatchScore) {
        bestMatchScore = score;
        matchedKeywordsList = matchedKeywords;
      }
    }
  }

  keywordScore = bestMatchScore;
  if (matchedKeywordsList.length > 0) {
    reasonsAr.push(`تطابق: ${matchedKeywordsList.slice(0, 3).join('، ')}`);
    reasons.push(`Matched: ${matchedKeywordsList.slice(0, 3).join(', ')}`);
  }

  // 5. Check for mutual barter match
  let isMutualBarter = false;
  if (matchType === 'BARTER' && targetItem.desiredCategoryId && sourceItem.categoryId) {
    if (targetItem.desiredCategoryId === sourceItem.categoryId) {
      isMutualBarter = true;
    }
  }

  // Calculate weighted total
  const total =
    (proximityScore * weights.proximity) +
    (categoryScore * weights.category) +
    (valueScore * weights.value) +
    (keywordScore * weights.keyword);

  return {
    total: Math.min(total, 1.0),
    proximity: proximityScore,
    proximityLevel,
    category: categoryScore,
    value: valueScore,
    keyword: keywordScore,
    isMutualBarter,
    reasons,
    reasonsAr,
  };
};

/**
 * Calculate proximity score based on geographic hierarchy
 */
const calculateProximityScore = (
  gov1: string | null, city1: string | null, district1: string | null,
  gov2: string | null, city2: string | null, district2: string | null
): { score: number; level: ProximityLevel } => {
  // Same district (نفس الحي)
  if (district1 && district2 && normalizeLocation(district1) === normalizeLocation(district2)) {
    return { score: PROXIMITY_WEIGHTS.DISTRICT, level: 'DISTRICT' };
  }

  // Same city (نفس المدينة)
  if (city1 && city2 && normalizeLocation(city1) === normalizeLocation(city2)) {
    return { score: PROXIMITY_WEIGHTS.CITY, level: 'CITY' };
  }

  // Same governorate (نفس المحافظة)
  if (gov1 && gov2 && normalizeLocation(gov1) === normalizeLocation(gov2)) {
    return { score: PROXIMITY_WEIGHTS.GOVERNORATE, level: 'GOVERNORATE' };
  }

  // National (أي مكان في مصر)
  return { score: PROXIMITY_WEIGHTS.NATIONAL, level: 'NATIONAL' };
};

/**
 * Normalize location strings for comparison
 */
const normalizeLocation = (location: string): string => {
  return location
    .toLowerCase()
    .replace(/[\s\-_]/g, '')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/أ|إ|آ/g, 'ا');
};

// ============================================
// Helper Functions
// ============================================

/**
 * Create a MatchResult object
 */
const createMatchResult = (
  type: MatchType,
  sourceItem: ItemWithRelations,
  matchedItem: ItemWithRelations,
  score: MatchScoreBreakdown
): MatchResult => {
  return {
    id: `match-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    score: score.total,
    proximityLevel: score.proximityLevel,
    proximityScore: score.proximity,
    categoryScore: score.category,
    valueScore: score.value,
    keywordScore: score.keyword,
    sourceItem: {
      id: sourceItem.id,
      title: sourceItem.title,
      sellerId: sourceItem.sellerId,
      sellerName: sourceItem.seller?.fullName || 'مستخدم',
      categoryId: sourceItem.categoryId,
      categoryName: sourceItem.category?.nameAr || null,
      estimatedValue: sourceItem.estimatedValue || 0,
      listingType: sourceItem.listingType,
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
      sellerId: matchedItem.sellerId,
      sellerName: matchedItem.seller?.fullName || 'مستخدم',
      categoryId: matchedItem.categoryId,
      categoryName: matchedItem.category?.nameAr || null,
      estimatedValue: matchedItem.estimatedValue || 0,
      listingType: matchedItem.listingType,
      location: {
        governorate: matchedItem.governorate,
        city: matchedItem.city,
        district: matchedItem.district,
        latitude: matchedItem.latitude,
        longitude: matchedItem.longitude,
      },
    },
    matchReason: score.reasons.join(' • ') || 'Potential match',
    matchReasonAr: score.reasonsAr.join(' • ') || 'تطابق محتمل',
    createdAt: new Date(),
  };
};

// ============================================
// Notification Functions
// ============================================

/**
 * Send notifications for matches (with deduplication)
 */
const sendMatchNotifications = async (matches: MatchResult[], initiatorId: string): Promise<void> => {
  const notifiedUsers = new Set<string>();

  for (const match of matches) {
    // Don't notify the initiator
    if (match.matchedItem.sellerId === initiatorId) continue;

    // Check deduplication cache
    const cacheKey = `${match.matchedItem.sellerId}:${match.sourceItem.id}:${match.type}`;
    const lastNotified = notificationCache.get(cacheKey);

    if (lastNotified && Date.now() - lastNotified < NOTIFICATION_COOLDOWN_MS) {
      console.log(`[UnifiedMatching] Skipping duplicate notification: ${cacheKey}`);
      continue;
    }

    // Don't send multiple notifications to same user
    if (notifiedUsers.has(match.matchedItem.sellerId)) continue;
    notifiedUsers.add(match.matchedItem.sellerId);

    // Create notification
    const notification = createNotificationContent(match);

    await createNotification({
      userId: match.matchedItem.sellerId,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      priority: match.score >= MIN_PERFECT_MATCH_SCORE ? 'HIGH' : 'MEDIUM',
      entityType: 'ITEM',
      entityId: match.sourceItem.id,
      actionUrl: notification.actionUrl,
      actionText: notification.actionText,
      metadata: {
        matchId: match.id,
        matchType: match.type,
        score: Math.round(match.score * 100),
        proximityLevel: match.proximityLevel,
        sourceItemId: match.sourceItem.id,
        matchedItemId: match.matchedItem.id,
      },
    });

    // Update cache
    notificationCache.set(cacheKey, Date.now());

    // Send WebSocket notification
    if (io) {
      io.to(`user:${match.matchedItem.sellerId}`).emit('match_alert', {
        type: 'NEW_MATCH',
        matchId: match.id,
        matchType: match.type,
        score: Math.round(match.score * 100),
        title: notification.title,
        message: notification.message,
        sourceItem: match.sourceItem,
        actionUrl: notification.actionUrl,
        timestamp: new Date(),
      });
    }

    console.log(`[UnifiedMatching] Notified user ${match.matchedItem.sellerId} about ${match.type} match (${Math.round(match.score * 100)}%)`);
  }
};

/**
 * Create notification content based on match type
 */
const createNotificationContent = (match: MatchResult) => {
  const scorePercent = Math.round(match.score * 100);
  const valueText = match.sourceItem.estimatedValue.toLocaleString('ar-EG');
  const locationText = getLocationText(match.proximityLevel);

  switch (match.type) {
    case 'PERFECT_BARTER':
      return {
        type: 'BARTER_MATCH' as const,
        title: '🎯 تطابق مقايضة مثالي!',
        message: `${match.sourceItem.sellerName} يعرض "${match.sourceItem.title}" (${valueText} ج.م) ويريد ما لديك! ${locationText} - ${scorePercent}% تطابق`,
        actionUrl: `/items/${match.sourceItem.id}`,
        actionText: 'إتمام المقايضة',
      };

    case 'BARTER_CHAIN':
      return {
        type: 'BARTER_MATCH' as const,
        title: '⛓️ فرصة مقايضة متعددة!',
        message: `اكتشفنا سلسلة مقايضة تشملك - ${match.matchReasonAr}`,
        actionUrl: `/barter/chains`,
        actionText: 'عرض السلسلة',
      };

    case 'SALE_TO_DEMAND':
    case 'REVERSE_AUCTION':
      return {
        type: 'ITEM_AVAILABLE' as const,
        title: '💰 سلعة جديدة تطابق طلبك!',
        message: `"${match.sourceItem.title}" متاحة الآن بسعر ${valueText} ج.م - ${locationText} - ${scorePercent}% تطابق`,
        actionUrl: `/items/${match.sourceItem.id}`,
        actionText: 'عرض السلعة',
      };

    case 'DEMAND_TO_SUPPLY':
      return {
        type: 'PURCHASE_REQUEST_MATCH' as const,
        title: '🛒 مشتري يبحث عن سلعتك!',
        message: `${match.sourceItem.sellerName} يبحث عن "${match.sourceItem.title}" - ${locationText} - ${scorePercent}% تطابق`,
        actionUrl: `/items/${match.matchedItem.id}`,
        actionText: 'عرض طلب الشراء',
      };

    default:
      return {
        type: 'BARTER_MATCH' as const,
        title: '🔔 تطابق جديد!',
        message: `${match.matchReasonAr} - ${scorePercent}% تطابق`,
        actionUrl: `/items/${match.sourceItem.id}`,
        actionText: 'عرض التفاصيل',
      };
  }
};

/**
 * Get human-readable location text
 */
const getLocationText = (level: ProximityLevel): string => {
  switch (level) {
    case 'DISTRICT': return '📍 نفس الحي';
    case 'CITY': return '🏙️ نفس المدينة';
    case 'GOVERNORATE': return '🗺️ نفس المحافظة';
    case 'NATIONAL': return '🇪🇬 مصر';
  }
};

// ============================================
// Barter Offer Processing
// ============================================

/**
 * Process new barter offer
 */
const processNewBarterOffer = async (payload: BarterOfferCreatedPayload): Promise<void> => {
  if (!payload.offeredItemIds || payload.offeredItemIds.length === 0) return;

  // Process each offered item
  for (const itemId of payload.offeredItemIds) {
    await processNewItem(itemId, payload.initiatorId);
  }
};

// ============================================
// Reverse Auction Processing
// ============================================

/**
 * Process new reverse auction (purchase request)
 */
const processNewReverseAuction = async (payload: ReverseAuctionCreatedPayload): Promise<void> => {
  const { auctionId, buyerId, categoryId, title, maxBudget, governorate } = payload;

  // Find matching supply items
  const supplyItems = await prisma.item.findMany({
    where: {
      status: 'ACTIVE',
      listingType: { in: ['DIRECT_SALE', 'AUCTION', 'BARTER'] },
      sellerId: { not: buyerId },
      categoryId,
      ...(maxBudget && { estimatedValue: { lte: maxBudget * 1.3 } }),
    },
    include: {
      seller: { select: { id: true, fullName: true } },
      category: { select: { id: true, nameAr: true, nameEn: true } },
    },
    take: 50,
  });

  const buyer = await prisma.user.findUnique({
    where: { id: buyerId },
    select: { fullName: true },
  });

  const buyerName = buyer?.fullName || 'مشتري';
  const budgetText = maxBudget ? `${maxBudget.toLocaleString('ar-EG')} ج.م` : 'غير محدد';

  for (const item of supplyItems) {
    const cacheKey = `${item.sellerId}:${auctionId}:REVERSE_AUCTION`;

    if (notificationCache.has(cacheKey)) continue;
    notificationCache.set(cacheKey, Date.now());

    await createNotification({
      userId: item.sellerId,
      type: 'PURCHASE_REQUEST_MATCH',
      title: '🛒 مشتري محتمل لسلعتك!',
      message: `${buyerName} يبحث عن "${title}" - لديك "${item.title}" (${item.estimatedValue.toLocaleString('ar-EG')} ج.م)! الميزانية: ${budgetText}`,
      priority: 'HIGH',
      entityType: 'REVERSE_AUCTION',
      entityId: auctionId,
      actionUrl: `/reverse-auctions/${auctionId}`,
      actionText: 'تقديم عرض',
      metadata: {
        matchType: 'REVERSE_AUCTION_TO_SUPPLY',
        auctionId,
        itemId: item.id,
      },
    });

    if (io) {
      io.to(`user:${item.sellerId}`).emit('match_alert', {
        type: 'NEW_MATCH',
        matchType: 'REVERSE_AUCTION',
        title: '🛒 مشتري محتمل لسلعتك!',
        auctionId,
        buyerName,
        timestamp: new Date(),
      });
    }
  }

  console.log(`[UnifiedMatching] Processed reverse auction ${auctionId}: ${supplyItems.length} sellers notified`);
};

// ============================================
// API Functions
// ============================================

/**
 * Get matches for a specific item (API)
 */
export const getMatchesForItem = async (
  itemId: string,
  options: { minScore?: number; limit?: number } = {}
): Promise<MatchResult[]> => {
  const { minScore = 0.3, limit = 20 } = options;

  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      seller: { select: { id: true, fullName: true } },
      category: { select: { id: true, nameAr: true, nameEn: true } },
      desiredCategory: { select: { id: true, nameAr: true, nameEn: true } },
    },
  });

  if (!item) return [];

  const allMatches: MatchResult[] = [];

  // Find all match types
  if (['DIRECT_SALE', 'AUCTION', 'BARTER'].includes(item.listingType)) {
    const demandMatches = await findDemandMatches(item);
    allMatches.push(...demandMatches);
  }

  if (['DIRECT_BUY', 'REVERSE_AUCTION'].includes(item.listingType)) {
    const supplyMatches = await findSupplyMatches(item);
    allMatches.push(...supplyMatches);
  }

  if (item.desiredCategoryId || item.desiredItemTitle) {
    const barterMatches = await findBarterMatches(item);
    allMatches.push(...barterMatches);
  }

  return allMatches
    .filter(m => m.score >= minScore)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
};

/**
 * Get matches for a user's items (API)
 */
export const getMatchesForUser = async (
  userId: string,
  options: { minScore?: number; limit?: number } = {}
): Promise<{ items: MatchResult[]; demands: MatchResult[]; total: number }> => {
  const { minScore = 0.4, limit = 30 } = options;

  // Get user's active items
  const userItems = await prisma.item.findMany({
    where: { sellerId: userId, status: 'ACTIVE' },
    select: { id: true, listingType: true },
  });

  const itemMatches: MatchResult[] = [];
  const demandMatches: MatchResult[] = [];

  for (const item of userItems) {
    const matches = await getMatchesForItem(item.id, { minScore, limit: 5 });

    if (['DIRECT_BUY', 'REVERSE_AUCTION'].includes(item.listingType)) {
      demandMatches.push(...matches);
    } else {
      itemMatches.push(...matches);
    }
  }

  return {
    items: itemMatches.sort((a, b) => b.score - a.score).slice(0, limit),
    demands: demandMatches.sort((a, b) => b.score - a.score).slice(0, limit),
    total: itemMatches.length + demandMatches.length,
  };
};

/**
 * Get matching statistics
 */
export const getMatchingStats = async () => {
  const [totalItems, totalDemands, recentMatches] = await Promise.all([
    prisma.item.count({ where: { status: 'ACTIVE', listingType: { in: ['DIRECT_SALE', 'AUCTION', 'BARTER'] } } }),
    prisma.item.count({ where: { status: 'ACTIVE', listingType: { in: ['DIRECT_BUY', 'REVERSE_AUCTION'] } } }),
    prisma.notification.count({
      where: {
        type: { in: ['BARTER_MATCH', 'ITEM_AVAILABLE'] },
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
    }),
  ]);

  return {
    totalSupplyItems: totalItems,
    totalDemandItems: totalDemands,
    matchNotificationsLast24h: recentMatches,
    cacheSize: notificationCache.size,
    websocketConnected: io !== null,
  };
};

// ============================================
// Exports
// ============================================

export default {
  initUnifiedMatching,
  processNewItem,
  getMatchesForItem,
  getMatchesForUser,
  getMatchingStats,
};
