import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AddToWatchlistInput } from '../validations/auction.validation';

/**
 * إضافة مزاد إلى قائمة المراقبة
 */
export const addToWatchlist = async (userId: string, auctionId: string, data: AddToWatchlistInput) => {
  // التحقق من وجود المزاد
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw new AppError('المزاد غير موجود', 404);
  }

  // التحقق من عدم وجود المزاد في القائمة مسبقاً
  const existing = await prisma.auctionWatchlist.findUnique({
    where: {
      userId_auctionId: { userId, auctionId },
    },
  });

  if (existing) {
    // تحديث الإعدادات إذا كان موجوداً
    const updated = await prisma.auctionWatchlist.update({
      where: { id: existing.id },
      data: {
        notifyOnBid: data.notifyOnBid,
        notifyOnOutbid: data.notifyOnOutbid,
        notifyOnEnding: data.notifyOnEnding,
        notifyBeforeEnd: data.notifyBeforeEnd,
        priceThreshold: data.priceThreshold,
      },
      include: {
        auction: {
          include: {
            listing: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    return updated;
  }

  // إنشاء إدخال جديد
  const watchlistItem = await prisma.$transaction(async (tx) => {
    // إضافة إلى القائمة
    const item = await tx.auctionWatchlist.create({
      data: {
        userId,
        auctionId,
        notifyOnBid: data.notifyOnBid,
        notifyOnOutbid: data.notifyOnOutbid,
        notifyOnEnding: data.notifyOnEnding,
        notifyBeforeEnd: data.notifyBeforeEnd,
        priceThreshold: data.priceThreshold,
      },
      include: {
        auction: {
          include: {
            listing: {
              include: {
                item: true,
              },
            },
          },
        },
      },
    });

    // تحديث عداد المراقبة في المزاد
    await tx.auction.update({
      where: { id: auctionId },
      data: { watchlistCount: { increment: 1 } },
    });

    return item;
  });

  return watchlistItem;
};

/**
 * إزالة مزاد من قائمة المراقبة
 */
export const removeFromWatchlist = async (userId: string, auctionId: string) => {
  const existing = await prisma.auctionWatchlist.findUnique({
    where: {
      userId_auctionId: { userId, auctionId },
    },
  });

  if (!existing) {
    throw new AppError('المزاد غير موجود في قائمة المراقبة', 404);
  }

  await prisma.$transaction(async (tx) => {
    // حذف من القائمة
    await tx.auctionWatchlist.delete({
      where: { id: existing.id },
    });

    // تحديث عداد المراقبة
    await tx.auction.update({
      where: { id: auctionId },
      data: { watchlistCount: { decrement: 1 } },
    });
  });

  return { message: 'تم إزالة المزاد من قائمة المراقبة' };
};

/**
 * الحصول على قائمة المراقبة للمستخدم
 */
export const getUserWatchlist = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    prisma.auctionWatchlist.findMany({
      where: { userId },
      include: {
        auction: {
          include: {
            listing: {
              include: {
                item: {
                  include: {
                    category: true,
                    seller: {
                      select: {
                        id: true,
                        fullName: true,
                        businessName: true,
                        rating: true,
                      },
                    },
                  },
                },
              },
            },
            bids: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { addedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auctionWatchlist.count({ where: { userId } }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * التحقق من وجود مزاد في قائمة المراقبة
 */
export const isInWatchlist = async (userId: string, auctionId: string): Promise<boolean> => {
  const item = await prisma.auctionWatchlist.findUnique({
    where: {
      userId_auctionId: { userId, auctionId },
    },
  });

  return !!item;
};

/**
 * الحصول على المستخدمين الذين يراقبون مزاداً معيناً (للإشعارات)
 */
export const getWatchlistUsersForAuction = async (auctionId: string, notificationType: 'bid' | 'outbid' | 'ending') => {
  const where: any = { auctionId };

  switch (notificationType) {
    case 'bid':
      where.notifyOnBid = true;
      break;
    case 'outbid':
      where.notifyOnOutbid = true;
      break;
    case 'ending':
      where.notifyOnEnding = true;
      break;
  }

  const items = await prisma.auctionWatchlist.findMany({
    where,
    select: {
      userId: true,
      priceThreshold: true,
      notifyBeforeEnd: true,
    },
  });

  return items;
};
