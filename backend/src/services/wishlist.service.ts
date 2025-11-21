import { PrismaClient } from '@prisma/client';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

const prisma = new PrismaClient();

interface CreateWishListItemData {
  categoryId?: string;
  description: string;
  keywords?: string[];
  maxPrice?: number;
}

interface WishListMatch {
  wishListItem: any;
  matchingItems: any[];
  matchScore: number;
}

/**
 * Add item to wish list
 */
export const addToWishList = async (
  userId: string,
  data: CreateWishListItemData
): Promise<any> => {
  // Extract keywords from description if not provided
  const keywords = data.keywords || extractKeywords(data.description);

  const wishListItem = await prisma.wishListItem.create({
    data: {
      userId,
      categoryId: data.categoryId,
      description: data.description,
      keywords,
      maxPrice: data.maxPrice,
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
  });

  return wishListItem;
};

/**
 * Get user's wish list
 */
export const getWishList = async (userId: string): Promise<any[]> => {
  const wishList = await prisma.wishListItem.findMany({
    where: { userId },
    include: {
      category: {
        select: {
          id: true,
          nameAr: true,
          nameEn: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return wishList;
};

/**
 * Remove item from wish list
 */
export const removeFromWishList = async (
  userId: string,
  wishListItemId: string
): Promise<void> => {
  const item = await prisma.wishListItem.findUnique({
    where: { id: wishListItemId },
  });

  if (!item) {
    throw new NotFoundError('Wish list item not found');
  }

  if (item.userId !== userId) {
    throw new ForbiddenError('You can only remove your own wish list items');
  }

  await prisma.wishListItem.delete({
    where: { id: wishListItemId },
  });
};

/**
 * Find matches for a user's wish list items
 */
export const findWishListMatches = async (
  userId: string
): Promise<WishListMatch[]> => {
  // Get user's wish list
  const wishList = await prisma.wishListItem.findMany({
    where: { userId },
    include: {
      category: true,
    },
  });

  if (wishList.length === 0) {
    return [];
  }

  const matches: WishListMatch[] = [];

  for (const wishItem of wishList) {
    // Find items that match this wish list item
    const matchingItems = await prisma.item.findMany({
      where: {
        status: 'ACTIVE',
        sellerId: { not: userId },
        ...(wishItem.categoryId && { categoryId: wishItem.categoryId }),
        ...(wishItem.maxPrice && { estimatedValue: { lte: wishItem.maxPrice } }),
        OR: [
          // Match by keywords in title
          ...wishItem.keywords.map(keyword => ({
            titleEn: { contains: keyword, mode: 'insensitive' as const },
          })),
          ...wishItem.keywords.map(keyword => ({
            titleAr: { contains: keyword, mode: 'insensitive' as const },
          })),
          // Match by keywords in description
          ...wishItem.keywords.map(keyword => ({
            descriptionEn: { contains: keyword, mode: 'insensitive' as const },
          })),
        ],
      },
      include: {
        images: { take: 1 },
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
          },
        },
      },
      take: 10,
      orderBy: { createdAt: 'desc' },
    });

    if (matchingItems.length > 0) {
      const matchScore = calculateWishMatchScore(wishItem, matchingItems);
      matches.push({
        wishListItem: wishItem,
        matchingItems,
        matchScore,
      });
    }
  }

  // Sort by match score
  matches.sort((a, b) => b.matchScore - a.matchScore);

  return matches;
};

/**
 * Check for new matches and create notifications
 */
export const checkAndNotifyMatches = async (userId: string): Promise<number> => {
  const matches = await findWishListMatches(userId);
  let notificationCount = 0;

  for (const match of matches) {
    for (const item of match.matchingItems) {
      // Check if we already notified about this match
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId,
          type: 'ITEM_AVAILABLE',
          referenceId: item.id,
          createdAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Within last 7 days
          },
        },
      });

      if (!existingNotification) {
        // Create notification
        await prisma.notification.create({
          data: {
            userId,
            type: 'ITEM_AVAILABLE',
            title: 'Item Match Found!',
            message: `"${item.titleEn || item.titleAr}" matches your wish list item "${match.wishListItem.description}"`,
            referenceId: item.id,
            referenceType: 'Item',
          },
        });
        notificationCount++;
      }
    }
  }

  return notificationCount;
};

/**
 * Get notifications for a user
 */
export const getNotifications = async (
  userId: string,
  limit: number = 20
): Promise<any[]> => {
  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  });

  return notifications;
};

/**
 * Mark notification as read
 */
export const markNotificationRead = async (
  userId: string,
  notificationId: string
): Promise<void> => {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
  });

  if (!notification || notification.userId !== userId) {
    throw new NotFoundError('Notification not found');
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { isRead: true },
  });
};

/**
 * Extract keywords from description
 */
function extractKeywords(description: string): string[] {
  // Remove common words and extract meaningful keywords
  const stopWords = ['the', 'a', 'an', 'is', 'are', 'was', 'were', 'for', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'of', 'i', 'want', 'need', 'looking'];

  const words = description
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.includes(word));

  // Return unique keywords
  return [...new Set(words)].slice(0, 10);
}

/**
 * Calculate match score for wish list item
 */
function calculateWishMatchScore(wishItem: any, matchingItems: any[]): number {
  let score = 50;

  // More matches = higher score
  score += Math.min(matchingItems.length * 5, 25);

  // Category match bonus
  const categoryMatches = matchingItems.filter(i => i.categoryId === wishItem.categoryId);
  score += (categoryMatches.length / matchingItems.length) * 15;

  // Price within budget bonus
  if (wishItem.maxPrice) {
    const withinBudget = matchingItems.filter(i => i.estimatedValue <= wishItem.maxPrice);
    score += (withinBudget.length / matchingItems.length) * 10;
  }

  return Math.min(100, Math.round(score));
}
