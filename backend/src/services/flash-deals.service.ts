/**
 * Flash Deals Service
 * خدمة العروض الخاطفة
 *
 * Time-limited deals with:
 * - Scheduled deals
 * - Stock management
 * - Claim reservations
 * - Real-time countdown
 */

import prisma from '../lib/prisma';
import { FlashDealStatus } from '@prisma/client';

// ============================================
// Types
// ============================================

interface CreateFlashDealParams {
  listingId: string;
  title: string;
  description?: string;
  dealPrice: number;
  startTime: Date;
  endTime: Date;
  totalQuantity: number;
  maxPerUser?: number;
  isFeatured?: boolean;
  priority?: number;
}

interface FlashDealWithDetails {
  id: string;
  title: string;
  description: string | null;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  startTime: Date;
  endTime: Date;
  totalQuantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  maxPerUser: number;
  status: FlashDealStatus;
  isFeatured: boolean;
  timeRemaining: number;
  listing: {
    id: string;
    item: {
      id: string;
      title: string;
      images: string[];
      category: { nameAr: string; nameEn: string };
    };
    user: {
      id: string;
      fullName: string;
      rating: number;
    };
  };
}

interface ClaimResult {
  success: boolean;
  claimId?: string;
  message: string;
  messageAr: string;
  expiresAt?: Date;
}

// ============================================
// Configuration
// ============================================

const CLAIM_EXPIRY_MINUTES = 15; // Minutes to complete purchase after claiming
const MAX_DAILY_DEALS = 50; // Maximum deals per day
const MIN_DISCOUNT_PERCENT = 10; // Minimum discount for flash deals

// ============================================
// Flash Deal CRUD
// ============================================

/**
 * Create a new flash deal
 */
export async function createFlashDeal(params: CreateFlashDealParams) {
  const {
    listingId,
    title,
    description,
    dealPrice,
    startTime,
    endTime,
    totalQuantity,
    maxPerUser = 1,
    isFeatured = false,
    priority = 0,
  } = params;

  // Get listing and validate
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
    include: { item: true },
  });

  if (!listing) {
    throw new Error('Listing not found');
  }

  if (!listing.price || listing.price <= 0) {
    throw new Error('Listing must have a valid price');
  }

  // Calculate discount
  const originalPrice = listing.price;
  const discountPercent = ((originalPrice - dealPrice) / originalPrice) * 100;

  if (discountPercent < MIN_DISCOUNT_PERCENT) {
    throw new Error(`Discount must be at least ${MIN_DISCOUNT_PERCENT}%`);
  }

  // Validate timing
  const now = new Date();
  if (startTime < now) {
    throw new Error('Start time must be in the future');
  }

  if (endTime <= startTime) {
    throw new Error('End time must be after start time');
  }

  // Check for overlapping deals on same listing
  const existingDeal = await prisma.flashDeal.findFirst({
    where: {
      listingId,
      status: { in: ['SCHEDULED', 'ACTIVE'] },
      OR: [
        {
          startTime: { lte: endTime },
          endTime: { gte: startTime },
        },
      ],
    },
  });

  if (existingDeal) {
    throw new Error('This listing already has an active or scheduled flash deal');
  }

  // Determine initial status
  const status: FlashDealStatus = startTime <= now ? 'ACTIVE' : 'SCHEDULED';

  return prisma.flashDeal.create({
    data: {
      listingId,
      title,
      description,
      originalPrice,
      dealPrice,
      discountPercent,
      startTime,
      endTime,
      totalQuantity,
      maxPerUser,
      status,
      isFeatured,
      priority,
    },
    include: {
      listing: {
        include: {
          item: {
            include: { category: true },
          },
          user: true,
        },
      },
    },
  });
}

/**
 * Get flash deal by ID
 */
export async function getFlashDeal(dealId: string): Promise<FlashDealWithDetails | null> {
  const deal = await prisma.flashDeal.findUnique({
    where: { id: dealId },
    include: {
      listing: {
        include: {
          item: {
            include: { category: true },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              rating: true,
            },
          },
        },
      },
    },
  });

  if (!deal) return null;

  return transformDealToDetails(deal);
}

/**
 * Get active flash deals
 */
export async function getActiveDeals(options?: {
  limit?: number;
  offset?: number;
  categoryId?: string;
  featured?: boolean;
}): Promise<FlashDealWithDetails[]> {
  const { limit = 20, offset = 0, categoryId, featured } = options || {};

  const deals = await prisma.flashDeal.findMany({
    where: {
      status: 'ACTIVE',
      endTime: { gt: new Date() },
      ...(categoryId && { listing: { item: { categoryId } } }),
      ...(featured !== undefined && { isFeatured: featured }),
    },
    include: {
      listing: {
        include: {
          item: {
            include: { category: true },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              rating: true,
            },
          },
        },
      },
    },
    orderBy: [
      { isFeatured: 'desc' },
      { priority: 'desc' },
      { discountPercent: 'desc' },
    ],
    take: limit,
    skip: offset,
  });

  return deals.map(transformDealToDetails);
}

/**
 * Get upcoming flash deals
 */
export async function getUpcomingDeals(limit: number = 10): Promise<FlashDealWithDetails[]> {
  const deals = await prisma.flashDeal.findMany({
    where: {
      status: 'SCHEDULED',
      startTime: { gt: new Date() },
    },
    include: {
      listing: {
        include: {
          item: {
            include: { category: true },
          },
          user: {
            select: {
              id: true,
              fullName: true,
              rating: true,
            },
          },
        },
      },
    },
    orderBy: { startTime: 'asc' },
    take: limit,
  });

  return deals.map(transformDealToDetails);
}

/**
 * Get flash deals by seller
 */
export async function getSellerDeals(userId: string) {
  return prisma.flashDeal.findMany({
    where: {
      listing: { userId },
    },
    include: {
      listing: {
        include: {
          item: true,
        },
      },
      _count: {
        select: { claims: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// Claim Management
// ============================================

/**
 * Claim a flash deal
 */
export async function claimDeal(
  dealId: string,
  userId: string,
  quantity: number = 1
): Promise<ClaimResult> {
  const deal = await prisma.flashDeal.findUnique({
    where: { id: dealId },
    include: {
      listing: { include: { item: true } },
      claims: { where: { userId } },
    },
  });

  if (!deal) {
    return {
      success: false,
      message: 'Deal not found',
      messageAr: 'العرض غير موجود',
    };
  }

  // Check deal status
  if (deal.status !== 'ACTIVE') {
    return {
      success: false,
      message: 'Deal is not active',
      messageAr: 'العرض غير نشط',
    };
  }

  // Check timing
  const now = new Date();
  if (now < deal.startTime) {
    return {
      success: false,
      message: 'Deal has not started yet',
      messageAr: 'العرض لم يبدأ بعد',
    };
  }

  if (now > deal.endTime) {
    return {
      success: false,
      message: 'Deal has ended',
      messageAr: 'العرض انتهى',
    };
  }

  // Check availability
  const availableQuantity = deal.totalQuantity - deal.soldQuantity - deal.reservedQuantity;
  if (availableQuantity < quantity) {
    return {
      success: false,
      message: 'Not enough stock available',
      messageAr: 'الكمية المتاحة غير كافية',
    };
  }

  // Check user's existing claims
  const existingClaim = deal.claims.find(c => c.status === 'CLAIMED');
  if (existingClaim) {
    return {
      success: false,
      message: 'You already have an active claim',
      messageAr: 'لديك حجز نشط بالفعل',
      claimId: existingClaim.id,
      expiresAt: existingClaim.expiresAt,
    };
  }

  // Check max per user
  const userPurchases = deal.claims.filter(c => c.status === 'PURCHASED').length;
  if (userPurchases + quantity > deal.maxPerUser) {
    return {
      success: false,
      message: `Maximum ${deal.maxPerUser} per user`,
      messageAr: `الحد الأقصى ${deal.maxPerUser} لكل مستخدم`,
    };
  }

  // Check seller not claiming own deal
  if (deal.listing.userId === userId) {
    return {
      success: false,
      message: 'Cannot claim your own deal',
      messageAr: 'لا يمكنك حجز عرضك الخاص',
    };
  }

  // Create claim with transaction
  const expiresAt = new Date(Date.now() + CLAIM_EXPIRY_MINUTES * 60 * 1000);

  const [claim] = await prisma.$transaction([
    prisma.flashDealClaim.create({
      data: {
        dealId,
        userId,
        quantity,
        priceAtClaim: deal.dealPrice,
        expiresAt,
      },
    }),
    prisma.flashDeal.update({
      where: { id: dealId },
      data: {
        reservedQuantity: { increment: quantity },
      },
    }),
  ]);

  return {
    success: true,
    claimId: claim.id,
    message: `Deal claimed! Complete purchase within ${CLAIM_EXPIRY_MINUTES} minutes`,
    messageAr: `تم الحجز! أكمل الشراء خلال ${CLAIM_EXPIRY_MINUTES} دقيقة`,
    expiresAt,
  };
}

/**
 * Complete a claim (convert to purchase)
 */
export async function completeClaim(claimId: string, userId: string) {
  const claim = await prisma.flashDealClaim.findUnique({
    where: { id: claimId },
    include: { deal: true },
  });

  if (!claim) {
    throw new Error('Claim not found');
  }

  if (claim.userId !== userId) {
    throw new Error('Unauthorized');
  }

  if (claim.status !== 'CLAIMED') {
    throw new Error('Claim is not in claimable state');
  }

  if (new Date() > claim.expiresAt) {
    throw new Error('Claim has expired');
  }

  // Update claim and deal
  const [updatedClaim] = await prisma.$transaction([
    prisma.flashDealClaim.update({
      where: { id: claimId },
      data: {
        status: 'PURCHASED',
        purchasedAt: new Date(),
      },
    }),
    prisma.flashDeal.update({
      where: { id: claim.dealId },
      data: {
        soldQuantity: { increment: claim.quantity },
        reservedQuantity: { decrement: claim.quantity },
      },
    }),
  ]);

  // Check if sold out
  const deal = await prisma.flashDeal.findUnique({
    where: { id: claim.dealId },
  });

  if (deal && deal.soldQuantity >= deal.totalQuantity) {
    await prisma.flashDeal.update({
      where: { id: claim.dealId },
      data: { status: 'SOLD_OUT' },
    });
  }

  return updatedClaim;
}

/**
 * Cancel a claim
 */
export async function cancelClaim(claimId: string, userId: string) {
  const claim = await prisma.flashDealClaim.findUnique({
    where: { id: claimId },
  });

  if (!claim) {
    throw new Error('Claim not found');
  }

  if (claim.userId !== userId) {
    throw new Error('Unauthorized');
  }

  if (claim.status !== 'CLAIMED') {
    throw new Error('Claim cannot be cancelled');
  }

  // Update claim and release reservation
  await prisma.$transaction([
    prisma.flashDealClaim.update({
      where: { id: claimId },
      data: { status: 'CANCELLED' },
    }),
    prisma.flashDeal.update({
      where: { id: claim.dealId },
      data: {
        reservedQuantity: { decrement: claim.quantity },
      },
    }),
  ]);

  return { success: true };
}

/**
 * Get user's claims
 */
export async function getUserClaims(userId: string) {
  return prisma.flashDealClaim.findMany({
    where: { userId },
    include: {
      deal: {
        include: {
          listing: {
            include: {
              item: {
                include: { category: true },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// Status Management
// ============================================

/**
 * Activate scheduled deals
 */
export async function activateScheduledDeals() {
  const now = new Date();

  const scheduledDeals = await prisma.flashDeal.findMany({
    where: {
      status: 'SCHEDULED',
      startTime: { lte: now },
    },
  });

  let activated = 0;
  for (const deal of scheduledDeals) {
    if (deal.endTime > now) {
      await prisma.flashDeal.update({
        where: { id: deal.id },
        data: { status: 'ACTIVE' },
      });
      activated++;
    } else {
      // Already past end time
      await prisma.flashDeal.update({
        where: { id: deal.id },
        data: { status: 'ENDED' },
      });
    }
  }

  return activated;
}

/**
 * End expired deals
 */
export async function endExpiredDeals() {
  const now = new Date();

  const result = await prisma.flashDeal.updateMany({
    where: {
      status: 'ACTIVE',
      endTime: { lte: now },
    },
    data: { status: 'ENDED' },
  });

  return result.count;
}

/**
 * Expire uncompleted claims
 */
export async function expireUncompletedClaims() {
  const now = new Date();

  const expiredClaims = await prisma.flashDealClaim.findMany({
    where: {
      status: 'CLAIMED',
      expiresAt: { lte: now },
    },
  });

  for (const claim of expiredClaims) {
    await prisma.$transaction([
      prisma.flashDealClaim.update({
        where: { id: claim.id },
        data: { status: 'EXPIRED' },
      }),
      prisma.flashDeal.update({
        where: { id: claim.dealId },
        data: {
          reservedQuantity: { decrement: claim.quantity },
        },
      }),
    ]);
  }

  return expiredClaims.length;
}

/**
 * Cancel a flash deal
 */
export async function cancelDeal(dealId: string, userId: string) {
  const deal = await prisma.flashDeal.findUnique({
    where: { id: dealId },
    include: { listing: true },
  });

  if (!deal) {
    throw new Error('Deal not found');
  }

  if (deal.listing.userId !== userId) {
    throw new Error('Unauthorized');
  }

  if (deal.soldQuantity > 0) {
    throw new Error('Cannot cancel deal with completed sales');
  }

  // Cancel all active claims
  await prisma.flashDealClaim.updateMany({
    where: {
      dealId,
      status: 'CLAIMED',
    },
    data: { status: 'CANCELLED' },
  });

  return prisma.flashDeal.update({
    where: { id: dealId },
    data: {
      status: 'CANCELLED',
      reservedQuantity: 0,
    },
  });
}

// ============================================
// Statistics
// ============================================

/**
 * Record deal view
 */
export async function recordView(dealId: string) {
  await prisma.flashDeal.update({
    where: { id: dealId },
    data: { viewCount: { increment: 1 } },
  });
}

/**
 * Record deal click
 */
export async function recordClick(dealId: string) {
  await prisma.flashDeal.update({
    where: { id: dealId },
    data: { clickCount: { increment: 1 } },
  });
}

/**
 * Get deal statistics
 */
export async function getDealStats(dealId: string) {
  const deal = await prisma.flashDeal.findUnique({
    where: { id: dealId },
    include: {
      _count: {
        select: { claims: true },
      },
      claims: {
        select: {
          status: true,
          quantity: true,
        },
      },
    },
  });

  if (!deal) return null;

  const claimsByStatus = deal.claims.reduce((acc, claim) => {
    acc[claim.status] = (acc[claim.status] || 0) + claim.quantity;
    return acc;
  }, {} as Record<string, number>);

  return {
    views: deal.viewCount,
    clicks: deal.clickCount,
    totalClaims: deal._count.claims,
    claimsByStatus,
    soldQuantity: deal.soldQuantity,
    reservedQuantity: deal.reservedQuantity,
    availableQuantity: deal.totalQuantity - deal.soldQuantity - deal.reservedQuantity,
    conversionRate: deal.viewCount > 0 ? (deal.soldQuantity / deal.viewCount) * 100 : 0,
    revenue: deal.soldQuantity * deal.dealPrice,
    savings: deal.soldQuantity * (deal.originalPrice - deal.dealPrice),
  };
}

/**
 * Get platform-wide flash deal statistics
 */
export async function getPlatformStats(days: number = 30) {
  const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  const [totalDeals, totalSales, activeDeals] = await Promise.all([
    prisma.flashDeal.count({
      where: { createdAt: { gte: startDate } },
    }),
    prisma.flashDealClaim.aggregate({
      where: {
        status: 'PURCHASED',
        purchasedAt: { gte: startDate },
      },
      _count: true,
      _sum: { quantity: true },
    }),
    prisma.flashDeal.count({
      where: { status: 'ACTIVE' },
    }),
  ]);

  const dealsWithRevenue = await prisma.flashDeal.findMany({
    where: {
      createdAt: { gte: startDate },
      soldQuantity: { gt: 0 },
    },
    select: {
      dealPrice: true,
      originalPrice: true,
      soldQuantity: true,
    },
  });

  const totalRevenue = dealsWithRevenue.reduce(
    (sum, d) => sum + d.dealPrice * d.soldQuantity,
    0
  );

  const totalSavings = dealsWithRevenue.reduce(
    (sum, d) => sum + (d.originalPrice - d.dealPrice) * d.soldQuantity,
    0
  );

  return {
    totalDeals,
    activeDeals,
    totalSales: totalSales._count,
    totalQuantitySold: totalSales._sum.quantity || 0,
    totalRevenue,
    totalSavings,
    avgDiscountPercent: dealsWithRevenue.length > 0
      ? dealsWithRevenue.reduce((sum, d) =>
          sum + ((d.originalPrice - d.dealPrice) / d.originalPrice) * 100, 0
        ) / dealsWithRevenue.length
      : 0,
  };
}

// ============================================
// Helpers
// ============================================

function transformDealToDetails(deal: any): FlashDealWithDetails {
  const now = Date.now();
  const timeRemaining = Math.max(0, deal.endTime.getTime() - now);
  const availableQuantity = deal.totalQuantity - deal.soldQuantity - deal.reservedQuantity;

  return {
    id: deal.id,
    title: deal.title,
    description: deal.description,
    originalPrice: deal.originalPrice,
    dealPrice: deal.dealPrice,
    discountPercent: deal.discountPercent,
    startTime: deal.startTime,
    endTime: deal.endTime,
    totalQuantity: deal.totalQuantity,
    soldQuantity: deal.soldQuantity,
    reservedQuantity: deal.reservedQuantity,
    availableQuantity,
    maxPerUser: deal.maxPerUser,
    status: deal.status,
    isFeatured: deal.isFeatured,
    timeRemaining,
    listing: {
      id: deal.listing.id,
      item: {
        id: deal.listing.item.id,
        title: deal.listing.item.title,
        images: deal.listing.item.images || [],
        category: deal.listing.item.category ? {
          nameAr: deal.listing.item.category.nameAr,
          nameEn: deal.listing.item.category.nameEn,
        } : {
          nameAr: 'عام',
          nameEn: 'General',
        },
      },
      user: deal.listing.user,
    },
  };
}

/**
 * Scheduled job to manage flash deals
 * Should be called every minute
 */
export async function runScheduledTasks() {
  const results = {
    activated: await activateScheduledDeals(),
    ended: await endExpiredDeals(),
    expiredClaims: await expireUncompletedClaims(),
  };

  return results;
}
