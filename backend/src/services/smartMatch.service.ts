import { prisma } from '../config/database';
import { ItemCondition } from '@prisma/client';

interface ItemRequestData {
  id: string;
  description: string;
  categoryId: string | null;
  subcategoryId: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  condition: ItemCondition | null;
  keywords: string[];
}

interface MatchedItem {
  id: string;
  title: string;
  estimatedValue: number;
  condition: string;
  images: string[];
  matchScore: number;
  seller: {
    id: string;
    fullName: string;
  };
}

// Match item requests against market items
export const matchItemRequests = async (itemRequest: ItemRequestData): Promise<MatchedItem[]> => {
  // Build search query based on request
  const whereConditions: any = {
    status: 'ACTIVE',
  };

  if (itemRequest.categoryId) {
    whereConditions.categoryId = itemRequest.categoryId;
  }

  if (itemRequest.condition) {
    whereConditions.condition = itemRequest.condition;
  }

  if (itemRequest.minPrice || itemRequest.maxPrice) {
    whereConditions.estimatedValue = {};
    if (itemRequest.minPrice) {
      whereConditions.estimatedValue.gte = itemRequest.minPrice;
    }
    if (itemRequest.maxPrice) {
      whereConditions.estimatedValue.lte = itemRequest.maxPrice;
    }
  }

  // Build keyword search conditions
  if (itemRequest.keywords.length > 0) {
    whereConditions.OR = [
      ...itemRequest.keywords.map(keyword => ({
        title: { contains: keyword, mode: 'insensitive' as const },
      })),
      ...itemRequest.keywords.map(keyword => ({
        description: { contains: keyword, mode: 'insensitive' as const },
      })),
    ];
  }

  const items = await prisma.item.findMany({
    where: whereConditions,
    include: {
      seller: {
        select: { id: true, fullName: true },
      },
    },
    take: 20,
  });

  // Score and sort matches
  return items.map(item => {
    let score = 50;

    // Keyword matches in title (higher weight)
    const titleMatches = itemRequest.keywords.filter(k =>
      item.title.toLowerCase().includes(k.toLowerCase())
    ).length;
    score += titleMatches * 15;

    // Keyword matches in description (lower weight)
    const descMatches = itemRequest.keywords.filter(k =>
      item.description.toLowerCase().includes(k.toLowerCase())
    ).length;
    score += descMatches * 5;

    // Price proximity
    if (itemRequest.minPrice && itemRequest.maxPrice) {
      const targetPrice = (itemRequest.minPrice + itemRequest.maxPrice) / 2;
      const priceDiff = Math.abs(item.estimatedValue - targetPrice) / targetPrice;
      score -= priceDiff * 20;
    }

    // Condition match bonus
    if (itemRequest.condition && item.condition === itemRequest.condition) {
      score += 10;
    }

    // Category match bonus
    if (itemRequest.categoryId && item.categoryId === itemRequest.categoryId) {
      score += 5;
    }

    return {
      id: item.id,
      title: item.title,
      estimatedValue: item.estimatedValue,
      condition: item.condition,
      images: item.images,
      matchScore: Math.max(0, Math.min(100, Math.round(score))),
      seller: item.seller,
    };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
};

// Find best matches for a barter offer
export const findOfferMatches = async (offerId: string): Promise<MatchedItem[]> => {
  const offer = await prisma.barterOffer.findUnique({
    where: { id: offerId },
    include: {
      itemRequests: true,
    },
  });

  if (!offer) return [];

  const allMatches: MatchedItem[] = [];

  for (const request of offer.itemRequests) {
    const matches = await matchItemRequests(request);
    allMatches.push(...matches);
  }

  // Remove duplicates and sort by score
  const uniqueMatches = Array.from(
    new Map(allMatches.map(m => [m.id, m])).values()
  ).sort((a, b) => b.matchScore - a.matchScore);

  return uniqueMatches;
};

// Proactive search for all pending offers with item requests
export const runProactiveMatching = async (): Promise<number> => {
  const pendingOffers = await prisma.barterOffer.findMany({
    where: {
      status: 'PENDING',
      itemRequests: { some: {} },
    },
    include: {
      itemRequests: true,
      initiator: true,
    },
  });

  let notificationCount = 0;

  for (const offer of pendingOffers) {
    const matches = await findOfferMatches(offer.id);

    // Notify for high-score matches
    const highScoreMatches = matches.filter(m => m.matchScore >= 70);

    for (const match of highScoreMatches.slice(0, 3)) {
      // Check if already notified in last 24 hours
      const existing = await prisma.notification.findFirst({
        where: {
          userId: offer.initiatorId,
          entityId: match.id,
          type: 'ITEM_AVAILABLE',
          createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
        },
      });

      if (!existing) {
        await prisma.notification.create({
          data: {
            userId: offer.initiatorId,
            type: 'ITEM_AVAILABLE',
            title: 'Match Found!',
            message: `"${match.title}" matches your barter request (${match.matchScore}% match)`,
            entityId: match.id,
            entityType: 'Item',
          },
        });
        notificationCount++;
      }
    }
  }

  return notificationCount;
};

// Get smart matches for a specific offer (for API endpoint)
export const getSmartMatches = async (offerId: string, userId: string) => {
  // Verify user owns the offer
  const offer = await prisma.barterOffer.findFirst({
    where: {
      id: offerId,
      initiatorId: userId,
    },
    include: {
      itemRequests: true,
    },
  });

  if (!offer) {
    throw new Error('Offer not found or access denied');
  }

  if (offer.itemRequests.length === 0) {
    return [];
  }

  return findOfferMatches(offerId);
};
