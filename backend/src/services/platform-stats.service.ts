/**
 * Platform Statistics Service
 * خدمة إحصائيات المنصة
 *
 * يوفر إحصائيات شاملة عن المنصة للمستخدمين والمشرفين
 */

import { prisma } from '../config/database';

export interface PlatformStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
    verified: number;
  };
  listings: {
    total: number;
    active: number;
    sold: number;
    forBarter: number;
    forSale: number;
    inAuction: number;
  };
  transactions: {
    total: number;
    thisMonth: number;
    totalValue: number;
    averageValue: number;
  };
  barters: {
    total: number;
    successful: number;
    pending: number;
    successRate: number;
  };
  auctions: {
    total: number;
    active: number;
    completed: number;
    averageBids: number;
  };
  categories: {
    total: number;
    topCategories: Array<{ name: string; count: number }>;
  };
  growth: {
    usersGrowth: number;
    listingsGrowth: number;
    transactionsGrowth: number;
  };
}

export interface UserStats {
  totalListings: number;
  activeListings: number;
  soldItems: number;
  successfulBarters: number;
  pendingBarters: number;
  rating: number;
  totalReviews: number;
  walletBalance: number;
  memberSince: Date;
  lastActive: Date;
}

class PlatformStatsService {
  /**
   * Get comprehensive platform statistics
   */
  async getPlatformStats(): Promise<PlatformStats> {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // User stats
    const [
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      verifiedUsers,
      newUsersLastMonth,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
      prisma.user.count({ where: { isVerified: true } }),
      prisma.user.count({
        where: {
          createdAt: { gte: lastMonth, lt: startOfMonth },
        },
      }),
    ]);

    // Listing stats
    const [
      totalListings,
      activeListings,
      soldListings,
      barterListings,
      saleListings,
      auctionListings,
      listingsLastMonth,
    ] = await Promise.all([
      prisma.item.count(),
      prisma.item.count({ where: { status: 'ACTIVE' } }),
      prisma.item.count({ where: { status: 'SOLD' } }),
      prisma.item.count({ where: { isForBarter: true } }),
      prisma.item.count({ where: { isForSale: true } }),
      prisma.item.count({ where: { isForAuction: true } }),
      prisma.item.count({
        where: {
          createdAt: { gte: lastMonth, lt: startOfMonth },
        },
      }),
    ]);

    // Transaction stats
    const [transactions, transactionsThisMonth, transactionsLastMonth] =
      await Promise.all([
        prisma.transaction.findMany({
          select: { amount: true },
        }),
        prisma.transaction.count({
          where: { createdAt: { gte: startOfMonth } },
        }),
        prisma.transaction.count({
          where: {
            createdAt: { gte: lastMonth, lt: startOfMonth },
          },
        }),
      ]);

    const totalTransactionsValue = transactions.reduce(
      (sum, t) => sum + Number(t.amount || 0),
      0
    );
    const averageTransactionValue =
      transactions.length > 0 ? totalTransactionsValue / transactions.length : 0;

    // Barter stats
    const [totalBarters, successfulBarters, pendingBarters] = await Promise.all([
      prisma.barterOffer.count(),
      prisma.barterOffer.count({ where: { status: 'COMPLETED' } }),
      prisma.barterOffer.count({ where: { status: 'PENDING' } }),
    ]);

    const barterSuccessRate =
      totalBarters > 0 ? (successfulBarters / totalBarters) * 100 : 0;

    // Auction stats
    const [totalAuctions, activeAuctions, completedAuctions] = await Promise.all([
      prisma.auction.count(),
      prisma.auction.count({ where: { status: 'ACTIVE' } }),
      prisma.auction.count({ where: { status: 'COMPLETED' } }),
    ]);

    // Get average bids per auction
    const auctionsWithBids = await prisma.auction.findMany({
      include: { _count: { select: { bids: true } } },
    });
    const averageBids =
      auctionsWithBids.length > 0
        ? auctionsWithBids.reduce((sum, a) => sum + a._count.bids, 0) /
          auctionsWithBids.length
        : 0;

    // Category stats
    const totalCategories = await prisma.category.count();
    const topCategories = await prisma.category.findMany({
      take: 5,
      include: { _count: { select: { items: true } } },
      orderBy: { items: { _count: 'desc' } },
    });

    // Calculate growth rates
    const usersGrowth =
      newUsersLastMonth > 0
        ? ((newUsersThisMonth - newUsersLastMonth) / newUsersLastMonth) * 100
        : 100;

    const listingsGrowth =
      listingsLastMonth > 0
        ? ((activeListings - listingsLastMonth) / listingsLastMonth) * 100
        : 100;

    const transactionsGrowth =
      transactionsLastMonth > 0
        ? ((transactionsThisMonth - transactionsLastMonth) / transactionsLastMonth) *
          100
        : 100;

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        newThisMonth: newUsersThisMonth,
        verified: verifiedUsers,
      },
      listings: {
        total: totalListings,
        active: activeListings,
        sold: soldListings,
        forBarter: barterListings,
        forSale: saleListings,
        inAuction: auctionListings,
      },
      transactions: {
        total: transactions.length,
        thisMonth: transactionsThisMonth,
        totalValue: totalTransactionsValue,
        averageValue: averageTransactionValue,
      },
      barters: {
        total: totalBarters,
        successful: successfulBarters,
        pending: pendingBarters,
        successRate: barterSuccessRate,
      },
      auctions: {
        total: totalAuctions,
        active: activeAuctions,
        completed: completedAuctions,
        averageBids: averageBids,
      },
      categories: {
        total: totalCategories,
        topCategories: topCategories.map((c) => ({
          name: c.name,
          count: c._count.items,
        })),
      },
      growth: {
        usersGrowth,
        listingsGrowth,
        transactionsGrowth,
      },
    };
  }

  /**
   * Get user-specific statistics
   */
  async getUserStats(userId: string): Promise<UserStats> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        items: true,
        reviews: true,
        wallet: true,
        barterOffersInitiated: true,
        barterOffersReceived: true,
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const activeListings = user.items.filter((i) => i.status === 'ACTIVE').length;
    const soldItems = user.items.filter((i) => i.status === 'SOLD').length;

    const allBarters = [
      ...user.barterOffersInitiated,
      ...user.barterOffersReceived,
    ];
    const successfulBarters = allBarters.filter(
      (b) => b.status === 'COMPLETED'
    ).length;
    const pendingBarters = allBarters.filter(
      (b) => b.status === 'PENDING'
    ).length;

    const ratings = user.reviews.map((r) => r.rating);
    const averageRating =
      ratings.length > 0
        ? ratings.reduce((a, b) => a + b, 0) / ratings.length
        : 0;

    return {
      totalListings: user.items.length,
      activeListings,
      soldItems,
      successfulBarters,
      pendingBarters,
      rating: averageRating,
      totalReviews: user.reviews.length,
      walletBalance: Number(user.wallet?.balance || 0),
      memberSince: user.createdAt,
      lastActive: user.updatedAt,
    };
  }

  /**
   * Get category performance metrics
   */
  async getCategoryPerformance(): Promise<
    Array<{
      id: string;
      name: string;
      totalItems: number;
      activeItems: number;
      soldItems: number;
      averagePrice: number;
      popularityScore: number;
    }>
  > {
    const categories = await prisma.category.findMany({
      include: {
        items: {
          select: {
            id: true,
            status: true,
            price: true,
          },
        },
      },
    });

    return categories.map((category) => {
      const items = category.items;
      const activeItems = items.filter((i) => i.status === 'ACTIVE');
      const soldItems = items.filter((i) => i.status === 'SOLD');

      const prices = items
        .filter((i) => i.price)
        .map((i) => Number(i.price));
      const averagePrice =
        prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;

      // Popularity score based on items count and sold items
      const popularityScore = items.length * 0.3 + soldItems.length * 0.7;

      return {
        id: category.id,
        name: category.name,
        totalItems: items.length,
        activeItems: activeItems.length,
        soldItems: soldItems.length,
        averagePrice,
        popularityScore,
      };
    });
  }

  /**
   * Get daily activity summary
   */
  async getDailyActivity(date: Date = new Date()): Promise<{
    newUsers: number;
    newListings: number;
    newTransactions: number;
    newBarters: number;
    activeUsers: number;
  }> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const [newUsers, newListings, newTransactions, newBarters] =
      await Promise.all([
        prisma.user.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        prisma.item.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        prisma.transaction.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
        prisma.barterOffer.count({
          where: {
            createdAt: { gte: startOfDay, lte: endOfDay },
          },
        }),
      ]);

    // Active users - users who logged in today (simplified)
    const activeUsers = await prisma.user.count({
      where: {
        updatedAt: { gte: startOfDay, lte: endOfDay },
      },
    });

    return {
      newUsers,
      newListings,
      newTransactions,
      newBarters,
      activeUsers,
    };
  }
}

export const platformStatsService = new PlatformStatsService();
