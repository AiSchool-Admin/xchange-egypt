import prisma from '../lib/prisma';

// ============================================
// Search Alerts Service
// خدمة تنبيهات البحث
// ============================================

export class SearchAlertsService {
  /**
   * Create saved search
   */
  async createSavedSearch(
    userId: string,
    data: {
      name: string;
      query?: string;
      filters: {
        categoryId?: string;
        governorate?: string;
        minPrice?: number;
        maxPrice?: number;
        condition?: string;
        type?: string;
      };
      notifyOnNew?: boolean;
    }
  ) {
    const savedSearch = await prisma.savedSearch.create({
      data: {
        userId,
        name: data.name,
        query: data.query,
        filters: data.filters,
        notifyOnNew: data.notifyOnNew ?? true,
      },
    });

    // Create alert if notifications enabled
    if (data.notifyOnNew) {
      await prisma.searchAlert.create({
        data: {
          savedSearchId: savedSearch.id,
          userId,
          isActive: true,
          frequency: 'INSTANT',
          notifyPush: true,
        },
      });
    }

    return savedSearch;
  }

  /**
   * Get user's saved searches
   */
  async getSavedSearches(userId: string) {
    return prisma.savedSearch.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });
  }

  /**
   * Get saved search by ID
   */
  async getSavedSearch(id: string, userId: string) {
    return prisma.savedSearch.findFirst({
      where: { id, userId },
    });
  }

  /**
   * Update saved search
   */
  async updateSavedSearch(
    id: string,
    userId: string,
    data: {
      name?: string;
      query?: string;
      filters?: any;
      notifyOnNew?: boolean;
    }
  ) {
    return prisma.savedSearch.updateMany({
      where: { id, userId },
      data: {
        name: data.name,
        query: data.query,
        filters: data.filters,
        notifyOnNew: data.notifyOnNew,
      },
    });
  }

  /**
   * Delete saved search
   */
  async deleteSavedSearch(id: string, userId: string) {
    // Delete associated alerts
    await prisma.searchAlert.deleteMany({
      where: { savedSearchId: id, userId },
    });

    return prisma.savedSearch.deleteMany({
      where: { id, userId },
    });
  }

  /**
   * Execute saved search
   */
  async executeSavedSearch(id: string, userId: string, page = 1, limit = 20) {
    const savedSearch = await prisma.savedSearch.findFirst({
      where: { id, userId },
    });

    if (!savedSearch) {
      throw new Error('البحث المحفوظ غير موجود');
    }

    // Update last used
    await prisma.savedSearch.update({
      where: { id },
      data: { lastUsedAt: new Date() },
    });

    // Build query
    const filters = savedSearch.filters as any;
    const where: any = {
      status: 'ACTIVE',
      sellerId: { not: userId }, // Exclude own items
    };

    if (savedSearch.query) {
      where.OR = [
        { title: { contains: savedSearch.query, mode: 'insensitive' } },
        { description: { contains: savedSearch.query, mode: 'insensitive' } },
      ];
    }

    if (filters.categoryId) {
      where.categoryId = filters.categoryId;
    }

    if (filters.governorate) {
      where.seller = { governorate: filters.governorate };
    }

    if (filters.minPrice || filters.maxPrice) {
      where.estimatedValue = {};
      if (filters.minPrice) where.estimatedValue.gte = filters.minPrice;
      if (filters.maxPrice) where.estimatedValue.lte = filters.maxPrice;
    }

    if (filters.condition) {
      where.condition = filters.condition;
    }

    if (filters.type) {
      where.type = filters.type;
    }

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          category: true,
          seller: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              governorate: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.item.count({ where }),
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
  }

  /**
   * Get user's alerts
   */
  async getAlerts(userId: string) {
    return prisma.searchAlert.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Create or update alert for saved search
   */
  async createAlert(
    userId: string,
    savedSearchId: string,
    data: {
      frequency?: string;
      notifyPush?: boolean;
      notifyEmail?: boolean;
      notifyWhatsapp?: boolean;
    }
  ) {
    // Verify saved search belongs to user
    const savedSearch = await prisma.savedSearch.findFirst({
      where: { id: savedSearchId, userId },
    });

    if (!savedSearch) {
      throw new Error('البحث المحفوظ غير موجود');
    }

    // Upsert alert
    return prisma.searchAlert.upsert({
      where: {
        savedSearchId_userId: {
          savedSearchId,
          userId,
        },
      },
      create: {
        savedSearchId,
        userId,
        isActive: true,
        frequency: data.frequency || 'INSTANT',
        notifyPush: data.notifyPush ?? true,
        notifyEmail: data.notifyEmail ?? false,
        notifyWhatsapp: data.notifyWhatsapp ?? false,
      },
      update: {
        isActive: true,
        frequency: data.frequency,
        notifyPush: data.notifyPush,
        notifyEmail: data.notifyEmail,
        notifyWhatsapp: data.notifyWhatsapp,
      },
    });
  }

  /**
   * Toggle alert status
   */
  async toggleAlert(alertId: string, userId: string) {
    const alert = await prisma.searchAlert.findFirst({
      where: { id: alertId, userId },
    });

    if (!alert) {
      throw new Error('التنبيه غير موجود');
    }

    return prisma.searchAlert.update({
      where: { id: alertId },
      data: { isActive: !alert.isActive },
    });
  }

  /**
   * Delete alert
   */
  async deleteAlert(alertId: string, userId: string) {
    return prisma.searchAlert.deleteMany({
      where: { id: alertId, userId },
    });
  }

  /**
   * Check for matching items and send alerts
   * (Called by cron job or when new item is created)
   */
  async checkAndSendAlerts(newItemId: string) {
    const newItem = await prisma.item.findUnique({
      where: { id: newItemId },
      include: { category: true, seller: true },
    });

    if (!newItem || newItem.status !== 'ACTIVE') {
      return;
    }

    // Find matching saved searches
    const savedSearches = await prisma.savedSearch.findMany({
      where: {
        notifyOnNew: true,
        userId: { not: newItem.sellerId }, // Don't notify item owner
      },
    });

    const matchingSearches: string[] = [];

    for (const search of savedSearches) {
      const filters = search.filters as any;
      let matches = true;

      // Check query match
      if (search.query) {
        const query = search.query.toLowerCase();
        const titleMatch = newItem.title.toLowerCase().includes(query);
        const descMatch = newItem.description?.toLowerCase().includes(query);
        if (!titleMatch && !descMatch) matches = false;
      }

      // Check category match
      if (filters.categoryId && newItem.categoryId !== filters.categoryId) {
        matches = false;
      }

      // Check price range
      if (filters.minPrice && (newItem.estimatedValue || 0) < filters.minPrice) {
        matches = false;
      }
      if (filters.maxPrice && (newItem.estimatedValue || 0) > filters.maxPrice) {
        matches = false;
      }

      // Check condition
      if (filters.condition && newItem.condition !== filters.condition) {
        matches = false;
      }

      // Check governorate
      if (filters.governorate && newItem.seller?.governorate !== filters.governorate) {
        matches = false;
      }

      if (matches) {
        matchingSearches.push(search.id);
      }
    }

    if (matchingSearches.length === 0) {
      return;
    }

    // Get active alerts for matching searches
    const alerts = await prisma.searchAlert.findMany({
      where: {
        savedSearchId: { in: matchingSearches },
        isActive: true,
        frequency: 'INSTANT', // Only instant alerts
      },
    });

    // Create notifications for each alert
    for (const alert of alerts) {
      // Update alert stats
      await prisma.searchAlert.update({
        where: { id: alert.id },
        data: {
          alertsSent: { increment: 1 },
          lastAlertAt: new Date(),
          matchedItems: { increment: 1 },
        },
      });

      // Create notification
      await prisma.notification.create({
        data: {
          userId: alert.userId,
          type: 'ITEM_AVAILABLE',
          title: '🔔 منتج جديد يطابق بحثك!',
          message: `تم إضافة "${newItem.title}" والذي يطابق أحد عمليات البحث المحفوظة لديك`,
          data: {
            itemId: newItem.id,
            alertId: alert.id,
          },
        },
      });

      // TODO: Send push notification if notifyPush is true
      // TODO: Send email if notifyEmail is true
      // TODO: Send WhatsApp if notifyWhatsapp is true
    }

    return matchingSearches.length;
  }

  /**
   * Get alert statistics for user
   */
  async getAlertStats(userId: string) {
    const [totalAlerts, activeAlerts, totalSent, matchedItems] = await Promise.all([
      prisma.searchAlert.count({ where: { userId } }),
      prisma.searchAlert.count({ where: { userId, isActive: true } }),
      prisma.searchAlert.aggregate({
        where: { userId },
        _sum: { alertsSent: true },
      }),
      prisma.searchAlert.aggregate({
        where: { userId },
        _sum: { matchedItems: true },
      }),
    ]);

    return {
      totalAlerts,
      activeAlerts,
      totalSent: totalSent._sum.alertsSent || 0,
      matchedItems: matchedItems._sum.matchedItems || 0,
    };
  }

  /**
   * Get recent matches for a saved search
   */
  async getRecentMatches(savedSearchId: string, userId: string, limit = 10) {
    const savedSearch = await prisma.savedSearch.findFirst({
      where: { id: savedSearchId, userId },
    });

    if (!savedSearch) {
      throw new Error('البحث المحفوظ غير موجود');
    }

    const filters = savedSearch.filters as any;
    const where: any = {
      status: 'ACTIVE',
      sellerId: { not: userId },
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    };

    if (savedSearch.query) {
      where.OR = [
        { title: { contains: savedSearch.query, mode: 'insensitive' } },
        { description: { contains: savedSearch.query, mode: 'insensitive' } },
      ];
    }

    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.minPrice) where.estimatedValue = { ...where.estimatedValue, gte: filters.minPrice };
    if (filters.maxPrice) where.estimatedValue = { ...where.estimatedValue, lte: filters.maxPrice };
    if (filters.condition) where.condition = filters.condition;

    return prisma.item.findMany({
      where,
      include: {
        category: true,
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }
}

export const searchAlertsService = new SearchAlertsService();
