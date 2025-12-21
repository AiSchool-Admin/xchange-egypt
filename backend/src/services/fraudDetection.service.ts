/**
 * Fraud Detection Service
 * FREE rule-based system for Egyptian market
 *
 * Detects:
 * - Suspicious listings
 * - Scam patterns
 * - Fake accounts
 * - Price manipulation
 * - Counterfeit indicators
 */

import prisma from '../lib/prisma';
import { ItemCondition, ListingType } from '@prisma/client';

// ============================================
// Types
// ============================================

export interface FraudCheckResult {
  isSuspicious: boolean;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  riskScore: number; // 0-100
  flags: FraudFlag[];
  recommendations: string[];
  shouldBlock: boolean; // Auto-block if true
}

export interface FraudFlag {
  type: string;
  severity: 'info' | 'warning' | 'danger' | 'critical';
  message: string;
  details?: string;
}

// ============================================
// Fraud Detection Rules
// ============================================

/**
 * Check if listing is suspicious
 */
export async function checkListing(
  userId: string,
  title: string,
  description: string,
  price: number,
  condition: ItemCondition,
  categoryId: string,
  images?: number
): Promise<FraudCheckResult> {
  const flags: FraudFlag[] = [];
  let riskScore = 0;

  // ============================================
  // USER BEHAVIOR CHECKS
  // ============================================

  // Check user age and activity
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      createdAt: true,
      status: true,
      emailVerified: true,
      phoneVerified: true,
      rating: true,
      _count: {
        select: {
          items: true,
          listings: true,
          transactionsAsBuyer: true,
          transactionsAsSeller: true,
        },
      },
    },
  });

  if (!user) {
    flags.push({
      type: 'invalid_user',
      severity: 'critical',
      message: 'User not found',
    });
    riskScore += 100;
  } else {
    // New user (< 7 days)
    const userAge = Date.now() - user.createdAt.getTime();
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const totalTransactions = user._count.transactionsAsBuyer + user._count.transactionsAsSeller;

    if (userAge < sevenDays) {
      flags.push({
        type: 'new_user',
        severity: 'warning',
        message: 'New user account (less than 7 days old)',
        details: 'New accounts have higher fraud risk',
      });
      riskScore += 15;
    }

    // Unverified email
    if (!user.emailVerified) {
      flags.push({
        type: 'unverified_email',
        severity: 'warning',
        message: 'Email not verified',
      });
      riskScore += 10;
    }

    // Unverified phone
    if (!user.phoneVerified) {
      flags.push({
        type: 'unverified_phone',
        severity: 'warning',
        message: 'Phone not verified',
      });
      riskScore += 10;
    }

    // Low rating (if user has transactions)
    if (totalTransactions > 5 && user.rating < 2.0) {
      flags.push({
        type: 'low_rating',
        severity: 'danger',
        message: `Low user rating: ${user.rating}/5.0`,
        details: 'User has poor transaction history',
      });
      riskScore += 25;
    }

    // Check for listing spam (too many listings in short time)
    if (user._count.listings > 20 && userAge < sevenDays) {
      flags.push({
        type: 'listing_spam',
        severity: 'danger',
        message: 'Excessive listings for new account',
        details: `${user._count.listings} listings in ${Math.round(userAge / (24 * 60 * 60 * 1000))} days`,
      });
      riskScore += 30;
    }
  }

  // ============================================
  // PRICE CHECKS
  // ============================================

  // Too-good-to-be-true pricing
  if (price < 100) {
    flags.push({
      type: 'suspiciously_low_price',
      severity: 'warning',
      message: 'Very low price',
      details: 'Items under 100 EGP may indicate spam or test listings',
    });
    riskScore += 5;
  }

  // Check against market average
  const recentItems = await prisma.item.findMany({
    where: {
      categoryId: categoryId,
      estimatedValue: { gt: 0 },
      status: 'ACTIVE',
    },
    select: { estimatedValue: true },
    take: 50,
  });

  if (recentItems.length > 5) {
    const avgPrice = recentItems.reduce((sum, i) => sum + i.estimatedValue, 0) / recentItems.length;

    // Price is 70% below market average
    if (price < avgPrice * 0.3) {
      flags.push({
        type: 'too_good_to_be_true',
        severity: 'danger',
        message: 'Price significantly below market average',
        details: `Listed at ${price} EGP, market average is ${Math.round(avgPrice)} EGP`,
      });
      riskScore += 35;
    }

    // Price is 3x above market average
    if (price > avgPrice * 3) {
      flags.push({
        type: 'overpriced',
        severity: 'warning',
        message: 'Price significantly above market average',
        details: 'May indicate price manipulation or unrealistic expectations',
      });
      riskScore += 10;
    }
  }

  // New item at very low price (common scam)
  if (condition === 'NEW' && price < 500) {
    flags.push({
      type: 'new_item_low_price',
      severity: 'warning',
      message: 'New item at suspiciously low price',
      details: 'New items under 500 EGP are often scams or counterfeit',
    });
    riskScore += 15;
  }

  // ============================================
  // CONTENT CHECKS
  // ============================================

  const textToCheck = `${title} ${description}`.toLowerCase();

  // Scam keywords (Egyptian context)
  const scamKeywords = [
    // Urgency/pressure
    'urgent', 'عاجل', 'سريع', 'فوري',
    // Too good to be true
    'gift', 'هدية', 'مجانا', 'free',
    // Contact outside platform
    'whatsapp only', 'واتس فقط', 'call me', 'اتصل بي',
    // Suspicious offers
    'guaranteed', 'مضمون 100', 'no risk', 'بدون مخاطر',
  ];

  const foundScamKeywords = scamKeywords.filter(keyword =>
    textToCheck.includes(keyword)
  );

  if (foundScamKeywords.length > 0) {
    flags.push({
      type: 'scam_keywords',
      severity: 'warning',
      message: 'Listing contains suspicious keywords',
      details: `Found: ${foundScamKeywords.join(', ')}`,
    });
    riskScore += foundScamKeywords.length * 8;
  }

  // External contact info (trying to avoid platform)
  const phonePattern = /\b(010|011|012|015)\d{8}\b/;
  const whatsappPattern = /whatsapp|واتساب|واتس/i;
  const emailPattern = /\b[\w._%+-]+@[\w.-]+\.[a-zA-Z]{2,}\b/;

  if (phonePattern.test(textToCheck)) {
    flags.push({
      type: 'phone_in_listing',
      severity: 'warning',
      message: 'Phone number in listing description',
      details: 'Sellers should use platform messaging',
    });
    riskScore += 15;
  }

  if (whatsappPattern.test(textToCheck)) {
    flags.push({
      type: 'whatsapp_only',
      severity: 'warning',
      message: 'Requesting WhatsApp contact',
      details: 'May be trying to move conversation off-platform',
    });
    riskScore += 12;
  }

  if (emailPattern.test(textToCheck)) {
    flags.push({
      type: 'email_in_listing',
      severity: 'warning',
      message: 'Email address in listing',
    });
    riskScore += 10;
  }

  // ============================================
  // IMAGE CHECKS
  // ============================================

  // No images (suspicious)
  if (!images || images === 0) {
    flags.push({
      type: 'no_images',
      severity: 'warning',
      message: 'No images provided',
      details: 'Listings without images are often suspicious',
    });
    riskScore += 20;
  }

  // Only 1 image for high-value item
  if (images === 1 && price > 5000) {
    flags.push({
      type: 'insufficient_images',
      severity: 'info',
      message: 'High-value item with only 1 image',
      details: 'Legitimate sellers usually provide multiple images',
    });
    riskScore += 8;
  }

  // ============================================
  // DUPLICATE LISTING CHECK
  // ============================================

  const duplicates = await prisma.item.findMany({
    where: {
      title: { equals: title, mode: 'insensitive' },
      sellerId: { not: userId },
      createdAt: {
        gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
      },
    },
    select: { id: true, sellerId: true },
  });

  if (duplicates.length > 0) {
    flags.push({
      type: 'duplicate_listing',
      severity: 'danger',
      message: 'Identical listing found from another user',
      details: 'May indicate copied/scam listing',
    });
    riskScore += 40;
  }

  // ============================================
  // TEXT QUALITY CHECKS
  // ============================================

  // Very short description
  if (description.length < 20) {
    flags.push({
      type: 'short_description',
      severity: 'info',
      message: 'Very short description',
      details: 'Legitimate sellers usually provide detailed descriptions',
    });
    riskScore += 5;
  }

  // ALL CAPS (spam indicator)
  if (title === title.toUpperCase() && title.length > 10) {
    flags.push({
      type: 'all_caps',
      severity: 'warning',
      message: 'Title in ALL CAPS',
      details: 'Common spam indicator',
    });
    riskScore += 10;
  }

  // Excessive punctuation
  if ((title.match(/!+/g) || []).length > 2) {
    flags.push({
      type: 'excessive_punctuation',
      severity: 'info',
      message: 'Excessive exclamation marks',
    });
    riskScore += 5;
  }

  // ============================================
  // DETERMINE RISK LEVEL
  // ============================================

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let shouldBlock = false;

  if (riskScore >= 80) {
    riskLevel = 'critical';
    shouldBlock = true; // Auto-block highly suspicious listings
  } else if (riskScore >= 50) {
    riskLevel = 'high';
  } else if (riskScore >= 25) {
    riskLevel = 'medium';
  }

  // ============================================
  // GENERATE RECOMMENDATIONS
  // ============================================

  const recommendations: string[] = [];

  if (riskLevel === 'critical' || riskLevel === 'high') {
    recommendations.push('This listing requires manual review by admin');
  }

  if (flags.some(f => f.type === 'new_user')) {
    recommendations.push('Request email and phone verification before listing');
  }

  if (flags.some(f => f.type === 'no_images')) {
    recommendations.push('Require at least 3 images for listing approval');
  }

  if (flags.some(f => f.type === 'too_good_to_be_true')) {
    recommendations.push('Flag for admin review - potential scam');
  }

  if (riskLevel === 'low') {
    recommendations.push('Listing appears legitimate');
  }

  return {
    isSuspicious: riskScore > 25,
    riskLevel,
    riskScore: Math.min(riskScore, 100),
    flags,
    recommendations,
    shouldBlock,
  };
}

/**
 * Check user for suspicious patterns
 */
export async function checkUserBehavior(userId: string): Promise<{
  isSuspicious: boolean;
  flags: FraudFlag[];
  actions: string[];
}> {
  const flags: FraudFlag[] = [];

  // Get user data
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: {
          items: true,
          listings: true,
          transactionsAsBuyer: true,
          transactionsAsSeller: true,
        },
      },
    },
  });

  if (!user) {
    return {
      isSuspicious: true,
      flags: [{ type: 'invalid_user', severity: 'critical', message: 'User not found' }],
      actions: ['Block account'],
    };
  }

  const userAge = Date.now() - user.createdAt.getTime();
  const userAgeDays = userAge / (24 * 60 * 60 * 1000);

  // Multiple accounts from same IP (would need IP tracking)
  // Multiple failed transactions
  // Excessive account creation/deletion
  // Pattern of dispute initiation

  // High listing velocity
  if (user._count.listings > 50 && userAgeDays < 7) {
    flags.push({
      type: 'listing_spam',
      severity: 'danger',
      message: 'Excessive listing creation',
      details: `${user._count.listings} listings in ${Math.round(userAgeDays)} days`,
    });
  }

  // No transactions despite many listings
  if (user._count.listings > 20 && user._count.transactionsAsSeller === 0) {
    flags.push({
      type: 'no_transactions',
      severity: 'warning',
      message: 'Many listings but no completed transactions',
      details: 'May indicate inactive or spam account',
    });
  }

  const actions: string[] = [];

  if (flags.length > 0) {
    actions.push('Flag account for review');
  }

  if (flags.some(f => f.severity === 'critical')) {
    actions.push('Suspend account pending investigation');
  }

  return {
    isSuspicious: flags.length > 0,
    flags,
    actions,
  };
}

/**
 * Check transaction for fraud patterns
 */
export async function checkTransaction(
  buyerId: string,
  sellerId: string,
  amount: number
): Promise<FraudCheckResult> {
  const flags: FraudFlag[] = [];
  let riskScore = 0;

  // Check if buyer and seller are same person (self-dealing)
  if (buyerId === sellerId) {
    flags.push({
      type: 'self_dealing',
      severity: 'critical',
      message: 'Buyer and seller are the same user',
    });
    riskScore += 100;
  }

  // Check for rapid back-and-forth transactions (collusion)
  const recentTransactions = await prisma.transaction.findMany({
    where: {
      OR: [
        { buyerId: buyerId, sellerId: sellerId },
        { buyerId: sellerId, sellerId: buyerId },
      ],
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
      },
    },
  });

  if (recentTransactions.length > 3) {
    flags.push({
      type: 'suspicious_pattern',
      severity: 'danger',
      message: 'Multiple transactions between same users',
      details: 'May indicate rating manipulation or money laundering',
    });
    riskScore += 45;
  }

  let riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  if (riskScore >= 80) riskLevel = 'critical';
  else if (riskScore >= 50) riskLevel = 'high';
  else if (riskScore >= 25) riskLevel = 'medium';

  return {
    isSuspicious: riskScore > 25,
    riskLevel,
    riskScore,
    flags,
    recommendations: flags.length > 0 ? ['Flag transaction for admin review'] : [],
    shouldBlock: riskScore >= 80,
  };
}

/**
 * Example usage:
 *
 * const result = await checkListing(
 *   'user-id',
 *   'ايفون 15 برو ماكس جديد',
 *   'للبيع ايفون جديد 256 جيجا اتصل واتساب 01012345678',
 *   500, // Suspiciously low price
 *   'NEW',
 *   'smartphone-category-id',
 *   0 // No images
 * );
 *
 * if (result.shouldBlock) {
 *   // Block listing automatically
 * } else if (result.riskLevel === 'high') {
 *   // Flag for admin review
 * } else {
 *   // Allow listing
 * }
 */
