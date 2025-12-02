/**
 * Item Match Notification Service
 *
 * Notifies users when new items match their interests
 * - Items matching barter preferences
 * - Items in categories users have searched for
 * - Items in governorates users are interested in
 */

import { createNotification } from './notification.service';
import { itemEvents, ItemCreatedPayload } from '../events/item.events';
import prisma from '../lib/prisma';

/**
 * Find users who might be interested in a new item
 */
const findInterestedUsers = async (
  itemId: string,
  sellerId: string
): Promise<{ userId: string; reason: string }[]> => {
  const interestedUsers: { userId: string; reason: string }[] = [];

  // Get the new item details
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: {
      category: {
        select: {
          id: true,
          nameAr: true,
          parentId: true,
        },
      },
    },
  });

  if (!item) return [];

  // 1. Find users with barter offers looking for items in this category
  const barterOffersLookingForCategory = await prisma.barterOffer.findMany({
    where: {
      status: 'PENDING',
      initiatorId: { not: sellerId },
      preferenceSets: {
        some: {
          items: {
            some: {
              item: {
                categoryId: item.categoryId,
              },
            },
          },
        },
      },
    },
    select: {
      initiatorId: true,
    },
    distinct: ['initiatorId'],
  });

  for (const offer of barterOffersLookingForCategory) {
    interestedUsers.push({
      userId: offer.initiatorId,
      reason: `سلعة جديدة في فئة "${item.category.nameAr}" تطابق تفضيلات المقايضة الخاصة بك`,
    });
  }

  // 2. Find users who have items with desired category matching this item's category
  const usersLookingForThisCategory = await prisma.item.findMany({
    where: {
      sellerId: { not: sellerId },
      desiredCategoryId: item.categoryId,
      status: 'ACTIVE',
    },
    select: {
      sellerId: true,
    },
    distinct: ['sellerId'],
  });

  for (const userItem of usersLookingForThisCategory) {
    // Avoid duplicates
    if (!interestedUsers.find(u => u.userId === userItem.sellerId)) {
      interestedUsers.push({
        userId: userItem.sellerId,
        reason: `سلعة جديدة في فئة "${item.category.nameAr}" تطابق ما تبحث عنه`,
      });
    }
  }

  // 3. Find users with item requests matching this item
  const matchingItemRequests = await prisma.itemRequest.findMany({
    where: {
      OR: [
        { categoryId: item.categoryId },
        { subcategoryId: item.categoryId },
        { subSubcategoryId: item.categoryId },
        {
          AND: [
            { minPrice: { lte: item.estimatedValue } },
            { maxPrice: { gte: item.estimatedValue } },
          ],
        },
      ],
      barterOffer: {
        status: 'PENDING',
        initiatorId: { not: sellerId },
      },
    },
    select: {
      barterOffer: {
        select: {
          initiatorId: true,
        },
      },
    },
  });

  for (const request of matchingItemRequests) {
    const userId = request.barterOffer.initiatorId;
    if (!interestedUsers.find(u => u.userId === userId)) {
      interestedUsers.push({
        userId,
        reason: `سلعة جديدة تطابق طلبك في "${item.category.nameAr}"`,
      });
    }
  }

  // 4. Find users in the same governorate looking for items
  if (item.governorate) {
    const usersInSameGovernorate = await prisma.barterOffer.findMany({
      where: {
        status: 'PENDING',
        initiatorId: { not: sellerId },
        initiator: {
          governorate: item.governorate,
        },
        preferenceSets: {
          some: {
            items: {
              some: {
                item: {
                  categoryId: item.categoryId,
                },
              },
            },
          },
        },
      },
      select: {
        initiatorId: true,
      },
      distinct: ['initiatorId'],
    });

    for (const user of usersInSameGovernorate) {
      if (!interestedUsers.find(u => u.userId === user.initiatorId)) {
        interestedUsers.push({
          userId: user.initiatorId,
          reason: `سلعة جديدة في منطقتك "${item.governorate}"`,
        });
      }
    }
  }

  return interestedUsers;
};

/**
 * Notify users about a new item that matches their interests
 */
export const notifyMatchingUsers = async (payload: ItemCreatedPayload): Promise<void> => {
  try {
    const { itemId, userId: sellerId } = payload;

    // Get item details for notification
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      select: {
        id: true,
        title: true,
        estimatedValue: true,
        governorate: true,
        category: {
          select: {
            nameAr: true,
          },
        },
        seller: {
          select: {
            fullName: true,
          },
        },
      },
    });

    if (!item) return;

    // Find interested users
    const interestedUsers = await findInterestedUsers(itemId, sellerId);

    // Send notifications (limit to prevent spam)
    const maxNotifications = 20;
    const usersToNotify = interestedUsers.slice(0, maxNotifications);

    for (const { userId, reason } of usersToNotify) {
      await createNotification({
        userId,
        type: 'ITEM_AVAILABLE',
        title: 'سلعة جديدة تطابق اهتماماتك! ✨',
        message: `"${item.title}" - ${formatPrice(item.estimatedValue)} ج.م في ${item.category.nameAr}`,
        priority: 'MEDIUM',
        entityType: 'ITEM',
        entityId: itemId,
        actionUrl: `/items/${itemId}`,
        actionText: 'عرض السلعة',
        metadata: {
          reason,
          governorate: item.governorate,
          category: item.category.nameAr,
        },
      });
    }

    console.log(`[ItemMatchNotification] Sent ${usersToNotify.length} notifications for item ${itemId}`);
  } catch (error) {
    console.error('[ItemMatchNotification] Error sending notifications:', error);
  }
};

/**
 * Format price for display
 */
const formatPrice = (price: number): string => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)} ألف`;
  }
  return price.toLocaleString('ar-EG');
};

/**
 * Initialize event listeners for item matching notifications
 */
export const initItemMatchNotifications = (): void => {
  console.log('[ItemMatchNotification] Initializing item match notification service...');

  // Listen for new items
  itemEvents.onItemCreated(async (payload) => {
    // Only trigger for items with barter preferences or in active categories
    await notifyMatchingUsers(payload);
  });

  console.log('[ItemMatchNotification] Service initialized successfully');
};
