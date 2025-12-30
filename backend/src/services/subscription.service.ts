/**
 * Subscription Plans Service
 * خدمة خطط الاشتراك
 *
 * Manages premium subscriptions with:
 * - Multiple tiers (FREE, BASIC, PROFESSIONAL, BUSINESS, ENTERPRISE)
 * - Feature limits and quotas
 * - XCoin benefits
 * - Auto-renewal management
 */

import prisma from '../lib/prisma';
import { SubscriptionTier, SubscriptionStatus } from '../types/prisma-enums';
import { creditWallet } from './wallet.service';

// ============================================
// Types
// ============================================

interface SubscriptionPlanInfo {
  id: string;
  tier: SubscriptionTier;
  name: string;
  nameAr: string;
  description: string;
  descriptionAr: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: PlanFeature[];
  limits: PlanLimits;
  xcoinBenefits: XCoinBenefits;
}

interface PlanFeature {
  key: string;
  name: string;
  nameAr: string;
  included: boolean;
  value?: string | number;
}

interface PlanLimits {
  maxListings: number | null;
  maxImages: number;
  featuredListings: number;
  boostCredits: number;
  prioritySupport: boolean;
  analyticsAccess: boolean;
  apiAccess: boolean;
  customBranding: boolean;
}

interface XCoinBenefits {
  multiplier: number;
  monthlyBonus: number;
}

interface CreateSubscriptionParams {
  userId: string;
  tier: SubscriptionTier;
  billingCycle: 'MONTHLY' | 'YEARLY';
  paymentMethod?: string;
}

// ============================================
// Default Plans Configuration
// ============================================

const DEFAULT_PLANS: Omit<SubscriptionPlanInfo, 'id'>[] = [
  {
    tier: 'FREE',
    name: 'Free',
    nameAr: 'مجاني',
    description: 'Basic features for casual users',
    descriptionAr: 'ميزات أساسية للمستخدمين العاديين',
    monthlyPrice: 0,
    yearlyPrice: 0,
    features: [
      { key: 'listings', name: 'Listings', nameAr: 'الإعلانات', included: true, value: 5 },
      { key: 'images', name: 'Images per listing', nameAr: 'صور لكل إعلان', included: true, value: 3 },
      { key: 'barter', name: 'Barter trading', nameAr: 'المقايضة', included: true },
      { key: 'chat', name: 'Chat messaging', nameAr: 'الرسائل', included: true },
    ],
    limits: {
      maxListings: 5,
      maxImages: 3,
      featuredListings: 0,
      boostCredits: 0,
      prioritySupport: false,
      analyticsAccess: false,
      apiAccess: false,
      customBranding: false,
    },
    xcoinBenefits: { multiplier: 1.0, monthlyBonus: 0 },
  },
  {
    tier: 'BASIC',
    name: 'Basic',
    nameAr: 'أساسي',
    description: 'For active traders',
    descriptionAr: 'للتجار النشطين',
    monthlyPrice: 99,
    yearlyPrice: 990,
    features: [
      { key: 'listings', name: 'Listings', nameAr: 'الإعلانات', included: true, value: 20 },
      { key: 'images', name: 'Images per listing', nameAr: 'صور لكل إعلان', included: true, value: 5 },
      { key: 'featured', name: 'Featured listings', nameAr: 'إعلانات مميزة', included: true, value: 1 },
      { key: 'boost', name: 'Monthly boosts', nameAr: 'رفع شهري', included: true, value: 3 },
      { key: 'xcoin', name: 'XCoin multiplier', nameAr: 'مضاعف XCoin', included: true, value: '1.2x' },
    ],
    limits: {
      maxListings: 20,
      maxImages: 5,
      featuredListings: 1,
      boostCredits: 3,
      prioritySupport: false,
      analyticsAccess: false,
      apiAccess: false,
      customBranding: false,
    },
    xcoinBenefits: { multiplier: 1.2, monthlyBonus: 50 },
  },
  {
    tier: 'PROFESSIONAL',
    name: 'Professional',
    nameAr: 'محترف',
    description: 'For power sellers',
    descriptionAr: 'للبائعين المحترفين',
    monthlyPrice: 249,
    yearlyPrice: 2490,
    features: [
      { key: 'listings', name: 'Listings', nameAr: 'الإعلانات', included: true, value: 50 },
      { key: 'images', name: 'Images per listing', nameAr: 'صور لكل إعلان', included: true, value: 10 },
      { key: 'featured', name: 'Featured listings', nameAr: 'إعلانات مميزة', included: true, value: 3 },
      { key: 'boost', name: 'Monthly boosts', nameAr: 'رفع شهري', included: true, value: 10 },
      { key: 'analytics', name: 'Analytics dashboard', nameAr: 'لوحة التحليلات', included: true },
      { key: 'priority', name: 'Priority support', nameAr: 'دعم أولوية', included: true },
      { key: 'xcoin', name: 'XCoin multiplier', nameAr: 'مضاعف XCoin', included: true, value: '1.5x' },
    ],
    limits: {
      maxListings: 50,
      maxImages: 10,
      featuredListings: 3,
      boostCredits: 10,
      prioritySupport: true,
      analyticsAccess: true,
      apiAccess: false,
      customBranding: false,
    },
    xcoinBenefits: { multiplier: 1.5, monthlyBonus: 150 },
  },
  {
    tier: 'BUSINESS',
    name: 'Business',
    nameAr: 'تجاري',
    description: 'For businesses and shops',
    descriptionAr: 'للشركات والمتاجر',
    monthlyPrice: 499,
    yearlyPrice: 4990,
    features: [
      { key: 'listings', name: 'Listings', nameAr: 'الإعلانات', included: true, value: 'Unlimited' },
      { key: 'images', name: 'Images per listing', nameAr: 'صور لكل إعلان', included: true, value: 20 },
      { key: 'featured', name: 'Featured listings', nameAr: 'إعلانات مميزة', included: true, value: 10 },
      { key: 'boost', name: 'Monthly boosts', nameAr: 'رفع شهري', included: true, value: 30 },
      { key: 'analytics', name: 'Advanced analytics', nameAr: 'تحليلات متقدمة', included: true },
      { key: 'api', name: 'API access', nameAr: 'وصول API', included: true },
      { key: 'branding', name: 'Custom branding', nameAr: 'علامة تجارية مخصصة', included: true },
      { key: 'xcoin', name: 'XCoin multiplier', nameAr: 'مضاعف XCoin', included: true, value: '2x' },
    ],
    limits: {
      maxListings: null, // Unlimited
      maxImages: 20,
      featuredListings: 10,
      boostCredits: 30,
      prioritySupport: true,
      analyticsAccess: true,
      apiAccess: true,
      customBranding: true,
    },
    xcoinBenefits: { multiplier: 2.0, monthlyBonus: 500 },
  },
  {
    tier: 'ENTERPRISE',
    name: 'Enterprise',
    nameAr: 'مؤسسي',
    description: 'Custom solutions for large businesses',
    descriptionAr: 'حلول مخصصة للشركات الكبيرة',
    monthlyPrice: 1499,
    yearlyPrice: 14990,
    features: [
      { key: 'listings', name: 'Listings', nameAr: 'الإعلانات', included: true, value: 'Unlimited' },
      { key: 'everything', name: 'All features', nameAr: 'جميع الميزات', included: true },
      { key: 'dedicated', name: 'Dedicated account manager', nameAr: 'مدير حساب مخصص', included: true },
      { key: 'sla', name: 'SLA guarantee', nameAr: 'ضمان SLA', included: true },
      { key: 'custom', name: 'Custom integrations', nameAr: 'تكامل مخصص', included: true },
      { key: 'xcoin', name: 'XCoin multiplier', nameAr: 'مضاعف XCoin', included: true, value: '3x' },
    ],
    limits: {
      maxListings: null,
      maxImages: 50,
      featuredListings: 50,
      boostCredits: 100,
      prioritySupport: true,
      analyticsAccess: true,
      apiAccess: true,
      customBranding: true,
    },
    xcoinBenefits: { multiplier: 3.0, monthlyBonus: 2000 },
  },
];

// ============================================
// Plan Management
// ============================================

/**
 * Initialize default subscription plans
 */
export async function initializeDefaultPlans() {
  for (const plan of DEFAULT_PLANS) {
    await prisma.subscriptionPlan.upsert({
      where: { tier: plan.tier },
      update: {
        name: plan.name,
        nameAr: plan.nameAr,
        description: plan.description,
        descriptionAr: plan.descriptionAr,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        features: JSON.parse(JSON.stringify(plan.features)),
        maxListings: plan.limits.maxListings,
        maxImages: plan.limits.maxImages,
        featuredListings: plan.limits.featuredListings,
        boostCredits: plan.limits.boostCredits,
        prioritySupport: plan.limits.prioritySupport,
        analyticsAccess: plan.limits.analyticsAccess,
        apiAccess: plan.limits.apiAccess,
        customBranding: plan.limits.customBranding,
        xcoinMultiplier: plan.xcoinBenefits.multiplier,
        monthlyXcoin: plan.xcoinBenefits.monthlyBonus,
      },
      create: {
        tier: plan.tier,
        name: plan.name,
        nameAr: plan.nameAr,
        description: plan.description,
        descriptionAr: plan.descriptionAr,
        monthlyPrice: plan.monthlyPrice,
        yearlyPrice: plan.yearlyPrice,
        features: JSON.parse(JSON.stringify(plan.features)),
        maxListings: plan.limits.maxListings,
        maxImages: plan.limits.maxImages,
        featuredListings: plan.limits.featuredListings,
        boostCredits: plan.limits.boostCredits,
        prioritySupport: plan.limits.prioritySupport,
        analyticsAccess: plan.limits.analyticsAccess,
        apiAccess: plan.limits.apiAccess,
        customBranding: plan.limits.customBranding,
        xcoinMultiplier: plan.xcoinBenefits.multiplier,
        monthlyXcoin: plan.xcoinBenefits.monthlyBonus,
      },
    });
  }
}

/**
 * Get all available subscription plans
 */
export async function getAllPlans() {
  return prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    orderBy: { monthlyPrice: 'asc' },
  });
}

/**
 * Get a specific plan by tier
 */
export async function getPlanByTier(tier: SubscriptionTier) {
  return prisma.subscriptionPlan.findUnique({
    where: { tier },
  });
}

// ============================================
// User Subscription Management
// ============================================

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string) {
  const subscription = await prisma.userSubscription.findFirst({
    where: {
      userId,
      status: { in: ['ACTIVE', 'PAUSED'] },
    },
    include: { plan: true },
    orderBy: { createdAt: 'desc' },
  });

  // If no subscription, user is on FREE tier
  if (!subscription) {
    const freePlan = await getPlanByTier('FREE');
    return {
      tier: 'FREE' as SubscriptionTier,
      plan: freePlan,
      status: 'ACTIVE' as SubscriptionStatus,
      limits: freePlan ? {
        maxListings: freePlan.maxListings,
        maxImages: freePlan.maxImages,
        featuredListings: freePlan.featuredListings,
        boostCredits: freePlan.boostCredits,
      } : null,
      usage: {
        listingsUsed: 0,
        boostsUsed: 0,
        featuredUsed: 0,
      },
    };
  }

  return {
    id: subscription.id,
    tier: subscription.plan.tier,
    plan: subscription.plan,
    status: subscription.status,
    billingCycle: subscription.billingCycle,
    startDate: subscription.startDate,
    endDate: subscription.endDate,
    autoRenew: subscription.autoRenew,
    limits: {
      maxListings: subscription.plan.maxListings,
      maxImages: subscription.plan.maxImages,
      featuredListings: subscription.plan.featuredListings,
      boostCredits: subscription.plan.boostCredits,
    },
    usage: {
      listingsUsed: subscription.listingsUsed,
      boostsUsed: subscription.boostsUsed,
      featuredUsed: subscription.featuredUsed,
    },
  };
}

/**
 * Subscribe user to a plan
 */
export async function subscribe(params: CreateSubscriptionParams) {
  const { userId, tier, billingCycle, paymentMethod } = params;

  // Get the plan
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { tier },
  });

  if (!plan) {
    throw new Error('Plan not found');
  }

  // Cancel any existing active subscription
  await prisma.userSubscription.updateMany({
    where: {
      userId,
      status: 'ACTIVE',
    },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
    },
  });

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  if (billingCycle === 'MONTHLY') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  // Calculate price
  const price = billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice;

  // Create subscription
  const subscription = await prisma.userSubscription.create({
    data: {
      userId,
      planId: plan.id,
      status: 'ACTIVE',
      billingCycle,
      currentPrice: price,
      startDate,
      endDate,
      paymentMethod,
      lastPaymentAt: new Date(),
      nextPaymentAt: endDate,
    },
    include: { plan: true },
  });

  // Award monthly XCoin bonus
  if (plan.monthlyXcoin > 0) {
    await creditWallet(
      userId,
      plan.monthlyXcoin,
      'REWARD_ACHIEVEMENT',
      `مكافأة اشتراك ${plan.nameAr}`,
      'subscription',
      subscription.id
    );
  }

  return subscription;
}

/**
 * Cancel subscription
 */
export async function cancelSubscription(subscriptionId: string, userId: string) {
  const subscription = await prisma.userSubscription.findFirst({
    where: { id: subscriptionId, userId },
  });

  if (!subscription) {
    throw new Error('Subscription not found');
  }

  return prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'CANCELLED',
      cancelledAt: new Date(),
      autoRenew: false,
    },
    include: { plan: true },
  });
}

/**
 * Pause subscription
 */
export async function pauseSubscription(subscriptionId: string, userId: string) {
  const subscription = await prisma.userSubscription.findFirst({
    where: { id: subscriptionId, userId, status: 'ACTIVE' },
  });

  if (!subscription) {
    throw new Error('Active subscription not found');
  }

  return prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'PAUSED',
      pausedAt: new Date(),
    },
    include: { plan: true },
  });
}

/**
 * Resume paused subscription
 */
export async function resumeSubscription(subscriptionId: string, userId: string) {
  const subscription = await prisma.userSubscription.findFirst({
    where: { id: subscriptionId, userId, status: 'PAUSED' },
    include: { plan: true },
  });

  if (!subscription) {
    throw new Error('Paused subscription not found');
  }

  // Calculate remaining days and extend end date
  const pausedDays = subscription.pausedAt
    ? Math.floor((Date.now() - subscription.pausedAt.getTime()) / (24 * 60 * 60 * 1000))
    : 0;

  const newEndDate = new Date(subscription.endDate);
  newEndDate.setDate(newEndDate.getDate() + pausedDays);

  return prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: {
      status: 'ACTIVE',
      pausedAt: null,
      endDate: newEndDate,
    },
    include: { plan: true },
  });
}

/**
 * Upgrade/Downgrade subscription
 */
export async function changePlan(
  userId: string,
  newTier: SubscriptionTier,
  billingCycle: 'MONTHLY' | 'YEARLY'
) {
  const currentSub = await getUserSubscription(userId);
  const newPlan = await getPlanByTier(newTier);

  if (!newPlan) {
    throw new Error('Plan not found');
  }

  // If upgrading, calculate prorated credit
  let proratedCredit = 0;
  if (currentSub.id && currentSub.status === 'ACTIVE') {
    const daysRemaining = Math.max(
      0,
      Math.floor((currentSub.endDate!.getTime() - Date.now()) / (24 * 60 * 60 * 1000))
    );
    const dailyRate = currentSub.plan!.monthlyPrice / 30;
    proratedCredit = daysRemaining * dailyRate;
  }

  // Cancel current subscription
  if (currentSub.id) {
    await cancelSubscription(currentSub.id, userId);
  }

  // Create new subscription
  const newSub = await subscribe({
    userId,
    tier: newTier,
    billingCycle,
  });

  return {
    subscription: newSub,
    proratedCredit: Math.round(proratedCredit),
  };
}

// ============================================
// Usage & Limits
// ============================================

/**
 * Check if user can create more listings
 */
export async function canCreateListing(userId: string): Promise<boolean> {
  const subscription = await getUserSubscription(userId);

  if (subscription.limits?.maxListings === null) {
    return true; // Unlimited
  }

  const activeListings = await prisma.listing.count({
    where: { userId, status: 'ACTIVE' },
  });

  return activeListings < (subscription.limits?.maxListings || 5);
}

/**
 * Check available images for listing
 */
export async function getMaxImages(userId: string): Promise<number> {
  const subscription = await getUserSubscription(userId);
  return subscription.limits?.maxImages || 3;
}

/**
 * Use a boost credit
 */
export async function useBoost(userId: string): Promise<boolean> {
  const subscription = await prisma.userSubscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true },
  });

  if (!subscription) {
    return false; // FREE users have no boosts
  }

  if (subscription.boostsUsed >= subscription.plan.boostCredits) {
    return false;
  }

  await prisma.userSubscription.update({
    where: { id: subscription.id },
    data: { boostsUsed: { increment: 1 } },
  });

  return true;
}

/**
 * Use a featured listing slot
 */
export async function useFeaturedSlot(userId: string): Promise<boolean> {
  const subscription = await prisma.userSubscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true },
  });

  if (!subscription) {
    return false;
  }

  if (subscription.featuredUsed >= subscription.plan.featuredListings) {
    return false;
  }

  await prisma.userSubscription.update({
    where: { id: subscription.id },
    data: { featuredUsed: { increment: 1 } },
  });

  return true;
}

/**
 * Get XCoin multiplier for user
 */
export async function getXCoinMultiplier(userId: string): Promise<number> {
  const subscription = await prisma.userSubscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true },
  });

  return subscription?.plan.xcoinMultiplier || 1.0;
}

/**
 * Check if user has analytics access
 */
export async function hasAnalyticsAccess(userId: string): Promise<boolean> {
  const subscription = await prisma.userSubscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true },
  });

  return subscription?.plan.analyticsAccess || false;
}

/**
 * Check if user has API access
 */
export async function hasApiAccess(userId: string): Promise<boolean> {
  const subscription = await prisma.userSubscription.findFirst({
    where: { userId, status: 'ACTIVE' },
    include: { plan: true },
  });

  return subscription?.plan.apiAccess || false;
}

// ============================================
// Renewal & Expiration
// ============================================

/**
 * Process subscription renewals
 */
export async function processRenewals() {
  const expiringSoon = await prisma.userSubscription.findMany({
    where: {
      status: 'ACTIVE',
      autoRenew: true,
      endDate: {
        lte: new Date(Date.now() + 24 * 60 * 60 * 1000), // Within 24 hours
      },
    },
    include: { plan: true },
  });

  const results = {
    renewed: 0,
    failed: 0,
  };

  for (const sub of expiringSoon) {
    try {
      // TODO: Process payment
      // For now, just extend the subscription

      const newEndDate = new Date(sub.endDate);
      if (sub.billingCycle === 'MONTHLY') {
        newEndDate.setMonth(newEndDate.getMonth() + 1);
      } else {
        newEndDate.setFullYear(newEndDate.getFullYear() + 1);
      }

      await prisma.userSubscription.update({
        where: { id: sub.id },
        data: {
          endDate: newEndDate,
          lastPaymentAt: new Date(),
          nextPaymentAt: newEndDate,
          // Reset usage counters
          listingsUsed: 0,
          boostsUsed: 0,
          featuredUsed: 0,
        },
      });

      // Award monthly XCoin
      if (sub.plan.monthlyXcoin > 0) {
        await creditWallet(
          sub.userId,
          sub.plan.monthlyXcoin,
          'REWARD_ACHIEVEMENT',
          `مكافأة اشتراك ${sub.plan.nameAr} الشهرية`,
          'subscription',
          sub.id
        );
      }

      results.renewed++;
    } catch (error) {
      results.failed++;
      // TODO: Send payment failed notification
    }
  }

  return results;
}

/**
 * Expire overdue subscriptions
 */
export async function expireOverdueSubscriptions() {
  const overdue = await prisma.userSubscription.findMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: new Date() },
    },
  });

  for (const sub of overdue) {
    await prisma.userSubscription.update({
      where: { id: sub.id },
      data: { status: 'EXPIRED' },
    });

    // TODO: Send subscription expired notification
  }

  return overdue.length;
}

// ============================================
// Comparison & Recommendations
// ============================================

/**
 * Compare plans
 */
export async function comparePlans(tier1: SubscriptionTier, tier2: SubscriptionTier) {
  const [plan1, plan2] = await Promise.all([
    getPlanByTier(tier1),
    getPlanByTier(tier2),
  ]);

  if (!plan1 || !plan2) {
    throw new Error('One or both plans not found');
  }

  return {
    plan1,
    plan2,
    differences: {
      priceDiff: {
        monthly: plan2.monthlyPrice - plan1.monthlyPrice,
        yearly: plan2.yearlyPrice - plan1.yearlyPrice,
      },
      listingsDiff: (plan2.maxListings || Infinity) - (plan1.maxListings || Infinity),
      imagesDiff: plan2.maxImages - plan1.maxImages,
      boostsDiff: plan2.boostCredits - plan1.boostCredits,
      xcoinMultiplierDiff: plan2.xcoinMultiplier - plan1.xcoinMultiplier,
    },
  };
}

/**
 * Recommend plan based on usage
 */
export async function recommendPlan(userId: string) {
  // Get user's activity
  const [listingCount, transactionCount, avgPrice] = await Promise.all([
    prisma.listing.count({
      where: { userId, createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.transaction.count({
      where: {
        OR: [{ buyerId: userId }, { sellerId: userId }],
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
    }),
    prisma.listing.aggregate({
      where: { userId, price: { gt: 0 } },
      _avg: { price: true },
    }),
  ]);

  // Determine recommendation
  let recommendedTier: SubscriptionTier = 'FREE';
  let reason = 'Low activity - FREE plan is sufficient';
  let reasonAr = 'نشاط منخفض - الخطة المجانية كافية';

  if (listingCount > 30 || transactionCount > 20) {
    recommendedTier = 'BUSINESS';
    reason = 'High volume activity - Business plan recommended';
    reasonAr = 'نشاط عالي - ننصح بالخطة التجارية';
  } else if (listingCount > 15 || transactionCount > 10) {
    recommendedTier = 'PROFESSIONAL';
    reason = 'Active trading - Professional plan recommended';
    reasonAr = 'تداول نشط - ننصح بخطة المحترف';
  } else if (listingCount > 5 || transactionCount > 3) {
    recommendedTier = 'BASIC';
    reason = 'Growing activity - Basic plan recommended';
    reasonAr = 'نشاط متزايد - ننصح بالخطة الأساسية';
  }

  const plan = await getPlanByTier(recommendedTier);

  return {
    recommendedTier,
    plan,
    reason,
    reasonAr,
    userActivity: {
      listingsLast30Days: listingCount,
      transactionsLast30Days: transactionCount,
      avgListingPrice: avgPrice._avg.price ? Number(avgPrice._avg.price) : 0,
    },
  };
}
