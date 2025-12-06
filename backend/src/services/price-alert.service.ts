/**
 * Price Alert Service
 * خدمة تنبيهات الأسعار
 *
 * Smart wishlist alerts for:
 * - Price drops on specific items
 * - Target price reached
 * - New items in category
 * - Search query matches
 */

import prisma from '../config/database';
import { ItemCondition } from '@prisma/client';

// ============================================
// Types
// ============================================

interface CreatePriceAlertParams {
  userId: string;
  itemId?: string;
  categoryId?: string;
  searchQuery?: string;
  targetPrice?: number;
  priceDropPercent?: number;
  alertOnNew?: boolean;
  minCondition?: ItemCondition;
  maxPrice?: number;
  governorate?: string;
  emailAlert?: boolean;
  pushAlert?: boolean;
  smsAlert?: boolean;
  expiresAt?: Date;
}

interface AlertMatch {
  alertId: string;
  userId: string;
  matchType: 'PRICE_DROP' | 'TARGET_REACHED' | 'NEW_ITEM' | 'SEARCH_MATCH';
  itemId: string;
  itemTitle: string;
  currentPrice: number;
  previousPrice?: number;
  targetPrice?: number;
  dropPercent?: number;
  emailAlert: boolean;
  pushAlert: boolean;
  smsAlert: boolean;
}

interface AlertSummary {
  id: string;
  type: 'ITEM' | 'CATEGORY' | 'SEARCH';
  targetName: string;
  targetPrice?: number;
  priceDropPercent?: number;
  alertOnNew: boolean;
  isActive: boolean;
  triggerCount: number;
  lastTriggeredAt?: Date;
  createdAt: Date;
}

// ============================================
// Alert CRUD
// ============================================

/**
 * Create a new price alert
 */
export async function createPriceAlert(params: CreatePriceAlertParams) {
  const {
    userId,
    itemId,
    categoryId,
    searchQuery,
    targetPrice,
    priceDropPercent,
    alertOnNew = true,
    minCondition,
    maxPrice,
    governorate,
    emailAlert = true,
    pushAlert = true,
    smsAlert = false,
    expiresAt,
  } = params;

  // Validate: Must have at least one target
  if (!itemId && !categoryId && !searchQuery) {
    throw new Error('Must specify item, category, or search query');
  }

  // Validate: Must have at least one alert condition
  if (!targetPrice && !priceDropPercent && !alertOnNew) {
    throw new Error('Must specify at least one alert condition');
  }

  // Check for duplicate alerts
  const existingAlert = await prisma.priceAlert.findFirst({
    where: {
      userId,
      isActive: true,
      ...(itemId && { itemId }),
      ...(categoryId && { categoryId }),
      ...(searchQuery && { searchQuery }),
    },
  });

  if (existingAlert) {
    // Update existing alert instead
    return prisma.priceAlert.update({
      where: { id: existingAlert.id },
      data: {
        targetPrice,
        priceDropPercent,
        alertOnNew,
        minCondition,
        maxPrice,
        governorate,
        emailAlert,
        pushAlert,
        smsAlert,
        expiresAt,
        updatedAt: new Date(),
      },
    });
  }

  return prisma.priceAlert.create({
    data: {
      userId,
      itemId,
      categoryId,
      searchQuery,
      targetPrice,
      priceDropPercent,
      alertOnNew,
      minCondition,
      maxPrice,
      governorate,
      emailAlert,
      pushAlert,
      smsAlert,
      expiresAt,
    },
  });
}

/**
 * Get user's price alerts
 */
export async function getUserAlerts(userId: string): Promise<AlertSummary[]> {
  const alerts = await prisma.priceAlert.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  // Fetch target names
  const alertSummaries: AlertSummary[] = [];

  for (const alert of alerts) {
    let type: 'ITEM' | 'CATEGORY' | 'SEARCH' = 'SEARCH';
    let targetName = alert.searchQuery || '';

    if (alert.itemId) {
      type = 'ITEM';
      const item = await prisma.item.findUnique({
        where: { id: alert.itemId },
        select: { title: true },
      });
      targetName = item?.title || 'Unknown Item';
    } else if (alert.categoryId) {
      type = 'CATEGORY';
      const category = await prisma.category.findUnique({
        where: { id: alert.categoryId },
        select: { nameAr: true },
      });
      targetName = category?.nameAr || 'Unknown Category';
    }

    alertSummaries.push({
      id: alert.id,
      type,
      targetName,
      targetPrice: alert.targetPrice || undefined,
      priceDropPercent: alert.priceDropPercent || undefined,
      alertOnNew: alert.alertOnNew,
      isActive: alert.isActive,
      triggerCount: alert.triggerCount,
      lastTriggeredAt: alert.lastTriggeredAt || undefined,
      createdAt: alert.createdAt,
    });
  }

  return alertSummaries;
}

/**
 * Get alert by ID
 */
export async function getAlert(alertId: string, userId: string) {
  return prisma.priceAlert.findFirst({
    where: { id: alertId, userId },
  });
}

/**
 * Update price alert
 */
export async function updateAlert(
  alertId: string,
  userId: string,
  updates: Partial<CreatePriceAlertParams>
) {
  const alert = await prisma.priceAlert.findFirst({
    where: { id: alertId, userId },
  });

  if (!alert) {
    throw new Error('Alert not found');
  }

  return prisma.priceAlert.update({
    where: { id: alertId },
    data: {
      targetPrice: updates.targetPrice,
      priceDropPercent: updates.priceDropPercent,
      alertOnNew: updates.alertOnNew,
      minCondition: updates.minCondition,
      maxPrice: updates.maxPrice,
      governorate: updates.governorate,
      emailAlert: updates.emailAlert,
      pushAlert: updates.pushAlert,
      smsAlert: updates.smsAlert,
      expiresAt: updates.expiresAt,
    },
  });
}

/**
 * Toggle alert active status
 */
export async function toggleAlert(alertId: string, userId: string) {
  const alert = await prisma.priceAlert.findFirst({
    where: { id: alertId, userId },
  });

  if (!alert) {
    throw new Error('Alert not found');
  }

  return prisma.priceAlert.update({
    where: { id: alertId },
    data: { isActive: !alert.isActive },
  });
}

/**
 * Delete price alert
 */
export async function deleteAlert(alertId: string, userId: string) {
  const alert = await prisma.priceAlert.findFirst({
    where: { id: alertId, userId },
  });

  if (!alert) {
    throw new Error('Alert not found');
  }

  await prisma.priceAlert.delete({
    where: { id: alertId },
  });

  return { success: true };
}

// ============================================
// Alert Checking
// ============================================

/**
 * Check for price drop on an item
 */
export async function checkPriceDropAlerts(
  itemId: string,
  newPrice: number,
  oldPrice: number
): Promise<AlertMatch[]> {
  if (newPrice >= oldPrice) return [];

  const dropPercent = ((oldPrice - newPrice) / oldPrice) * 100;

  // Find relevant alerts
  const alerts = await prisma.priceAlert.findMany({
    where: {
      isActive: true,
      OR: [
        { itemId }, // Direct item alerts
        {
          // Category alerts for this item's category
          categoryId: {
            not: null,
          },
        },
      ],
    },
  });

  // Get item details for category matching
  const item = await prisma.item.findUnique({
    where: { id: itemId },
    include: { category: true },
  });

  if (!item) return [];

  const matches: AlertMatch[] = [];

  for (const alert of alerts) {
    // Skip if category doesn't match
    if (alert.categoryId && alert.categoryId !== item.categoryId) {
      continue;
    }

    // Check condition filter
    if (alert.minCondition) {
      const conditionOrder: ItemCondition[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];
      const alertConditionIndex = conditionOrder.indexOf(alert.minCondition);
      const itemConditionIndex = conditionOrder.indexOf(item.condition);
      if (itemConditionIndex > alertConditionIndex) continue;
    }

    // Check max price filter
    if (alert.maxPrice && newPrice > alert.maxPrice) {
      continue;
    }

    let matchType: 'PRICE_DROP' | 'TARGET_REACHED' | null = null;

    // Check target price
    if (alert.targetPrice && newPrice <= alert.targetPrice) {
      matchType = 'TARGET_REACHED';
    }
    // Check price drop percent
    else if (alert.priceDropPercent && dropPercent >= alert.priceDropPercent) {
      matchType = 'PRICE_DROP';
    }

    if (matchType) {
      matches.push({
        alertId: alert.id,
        userId: alert.userId,
        matchType,
        itemId,
        itemTitle: item.title,
        currentPrice: newPrice,
        previousPrice: oldPrice,
        targetPrice: alert.targetPrice || undefined,
        dropPercent,
        emailAlert: alert.emailAlert,
        pushAlert: alert.pushAlert,
        smsAlert: alert.smsAlert,
      });

      // Update alert trigger count
      await prisma.priceAlert.update({
        where: { id: alert.id },
        data: {
          triggerCount: { increment: 1 },
          lastTriggeredAt: new Date(),
        },
      });
    }
  }

  return matches;
}

/**
 * Check for new item alerts
 */
export async function checkNewItemAlerts(
  itemId: string,
  categoryId: string,
  price: number,
  condition: ItemCondition,
  title: string,
  governorate?: string
): Promise<AlertMatch[]> {
  // Find relevant alerts
  const alerts = await prisma.priceAlert.findMany({
    where: {
      isActive: true,
      alertOnNew: true,
      OR: [
        { categoryId }, // Category alerts
        { searchQuery: { not: null } }, // Search query alerts
      ],
    },
  });

  const matches: AlertMatch[] = [];

  for (const alert of alerts) {
    // Check category match
    if (alert.categoryId && alert.categoryId !== categoryId) {
      continue;
    }

    // Check search query match
    if (alert.searchQuery) {
      const searchTerms = alert.searchQuery.toLowerCase().split(/\s+/);
      const titleLower = title.toLowerCase();
      const matchesSearch = searchTerms.some(term => titleLower.includes(term));
      if (!matchesSearch) continue;
    }

    // Check condition filter
    if (alert.minCondition) {
      const conditionOrder: ItemCondition[] = ['NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR'];
      const alertConditionIndex = conditionOrder.indexOf(alert.minCondition);
      const itemConditionIndex = conditionOrder.indexOf(condition);
      if (itemConditionIndex > alertConditionIndex) continue;
    }

    // Check max price filter
    if (alert.maxPrice && price > alert.maxPrice) {
      continue;
    }

    // Check governorate filter
    if (alert.governorate && governorate !== alert.governorate) {
      continue;
    }

    // Check target price (if new item is at or below target)
    let matchType: 'NEW_ITEM' | 'TARGET_REACHED' | 'SEARCH_MATCH' = 'NEW_ITEM';
    if (alert.targetPrice && price <= alert.targetPrice) {
      matchType = 'TARGET_REACHED';
    } else if (alert.searchQuery) {
      matchType = 'SEARCH_MATCH';
    }

    matches.push({
      alertId: alert.id,
      userId: alert.userId,
      matchType,
      itemId,
      itemTitle: title,
      currentPrice: price,
      targetPrice: alert.targetPrice || undefined,
      emailAlert: alert.emailAlert,
      pushAlert: alert.pushAlert,
      smsAlert: alert.smsAlert,
    });

    // Update alert trigger count
    await prisma.priceAlert.update({
      where: { id: alert.id },
      data: {
        triggerCount: { increment: 1 },
        lastTriggeredAt: new Date(),
      },
    });
  }

  return matches;
}

// ============================================
// Quick Alerts (One-click)
// ============================================

/**
 * Create quick alert for item price drop
 */
export async function createQuickItemAlert(userId: string, itemId: string) {
  const item = await prisma.item.findUnique({
    where: { id: itemId },
  });

  if (!item) {
    throw new Error('Item not found');
  }

  return createPriceAlert({
    userId,
    itemId,
    priceDropPercent: 10, // Alert on 10% drop
    alertOnNew: false,
    emailAlert: true,
    pushAlert: true,
  });
}

/**
 * Create quick alert for category
 */
export async function createQuickCategoryAlert(
  userId: string,
  categoryId: string,
  maxPrice?: number
) {
  return createPriceAlert({
    userId,
    categoryId,
    maxPrice,
    alertOnNew: true,
    priceDropPercent: 15, // Alert on 15% drop
    emailAlert: true,
    pushAlert: true,
  });
}

/**
 * Create quick alert for search
 */
export async function createQuickSearchAlert(
  userId: string,
  searchQuery: string,
  maxPrice?: number
) {
  return createPriceAlert({
    userId,
    searchQuery,
    maxPrice,
    alertOnNew: true,
    emailAlert: true,
    pushAlert: true,
  });
}

// ============================================
// Maintenance
// ============================================

/**
 * Clean up expired alerts
 */
export async function cleanupExpiredAlerts() {
  const result = await prisma.priceAlert.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  });

  return result.count;
}

/**
 * Deactivate alerts for sold items
 */
export async function deactivateAlertsForSoldItem(itemId: string) {
  return prisma.priceAlert.updateMany({
    where: {
      itemId,
      isActive: true,
    },
    data: { isActive: false },
  });
}

// ============================================
// Statistics
// ============================================

/**
 * Get alert statistics for user
 */
export async function getUserAlertStats(userId: string) {
  const [total, active, triggered] = await Promise.all([
    prisma.priceAlert.count({ where: { userId } }),
    prisma.priceAlert.count({ where: { userId, isActive: true } }),
    prisma.priceAlert.aggregate({
      where: { userId },
      _sum: { triggerCount: true },
    }),
  ]);

  return {
    totalAlerts: total,
    activeAlerts: active,
    totalTriggers: triggered._sum.triggerCount || 0,
  };
}

/**
 * Get popular alert categories
 */
export async function getPopularAlertCategories(limit: number = 10) {
  const categories = await prisma.priceAlert.groupBy({
    by: ['categoryId'],
    where: {
      categoryId: { not: null },
      isActive: true,
    },
    _count: true,
    orderBy: { _count: { categoryId: 'desc' } },
    take: limit,
  });

  // Fetch category names
  const categoryIds = categories
    .map(c => c.categoryId)
    .filter((id): id is string => id !== null);

  const categoryDetails = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true, nameAr: true, nameEn: true },
  });

  return categories.map(c => {
    const details = categoryDetails.find(d => d.id === c.categoryId);
    return {
      categoryId: c.categoryId,
      name: details?.nameAr || 'Unknown',
      nameEn: details?.nameEn || 'Unknown',
      alertCount: c._count,
    };
  });
}
