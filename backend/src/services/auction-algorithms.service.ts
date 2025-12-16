import prisma from '../lib/prisma';
import { BidStatus } from '@prisma/client';

/**
 * ============================================
 * خوارزميات المزادات المتقدمة
 * Advanced Auction Algorithms
 * ============================================
 */

/**
 * حساب الحد الأدنى للمزايدة التالية بناءً على السعر الحالي
 * Tiered bid increments based on current price
 */
export const calculateMinBidIncrement = (currentPrice: number): number => {
  if (currentPrice < 500) return 5;
  if (currentPrice < 1000) return 10;
  if (currentPrice < 5000) return 25;
  if (currentPrice < 10000) return 50;
  if (currentPrice < 50000) return 100;
  if (currentPrice < 100000) return 250;
  if (currentPrice < 500000) return 500;
  return 10000;
};

/**
 * حساب الحد الأدنى للمزايدة التالية
 */
export const getMinimumNextBid = (currentPrice: number, minBidIncrement?: number): number => {
  const increment = minBidIncrement || calculateMinBidIncrement(currentPrice);
  return currentPrice + increment;
};

/**
 * ============================================
 * خوارزمية المزايدة بالوكالة (Proxy Bidding)
 * ============================================
 *
 * تعمل المزايدة بالوكالة بالشكل التالي:
 * 1. المستخدم يحدد الحد الأقصى الذي يريد دفعه
 * 2. النظام يزايد تلقائياً بأقل مبلغ ممكن للفوز
 * 3. إذا دخل مزايد آخر، النظام يرفع تلقائياً (حتى الحد الأقصى)
 */
export const processProxyBid = async (
  auctionId: string,
  newBidderId: string,
  newBidAmount: number,
  newMaxAutoBid: number | null
) => {
  // الحصول على أعلى مزايدة بالوكالة الحالية
  const currentHighestProxyBid = await prisma.auctionBid.findFirst({
    where: {
      auctionId,
      isAutoBid: true,
      maxAutoBid: { not: null },
      status: { in: [BidStatus.ACTIVE, BidStatus.WINNING] },
    },
    orderBy: { maxAutoBid: 'desc' },
  });

  // إذا لم يكن هناك مزايدة بالوكالة، أو المزايدة الجديدة أعلى
  if (!currentHighestProxyBid) {
    return {
      shouldBid: true,
      bidAmount: newBidAmount,
      triggeredProxyBid: null,
    };
  }

  // إذا كان المزايد الجديد هو نفسه صاحب أعلى مزايدة بالوكالة
  if (currentHighestProxyBid.bidderId === newBidderId) {
    return {
      shouldBid: true,
      bidAmount: newBidAmount,
      triggeredProxyBid: null,
    };
  }

  const currentMaxAutoBid = currentHighestProxyBid.maxAutoBid!;
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    return { shouldBid: false, bidAmount: 0, triggeredProxyBid: null };
  }

  const minIncrement = auction.minBidIncrement || calculateMinBidIncrement(auction.currentPrice);

  // إذا كان الحد الأقصى للمزايدة الجديدة أعلى من الحالية
  if (newMaxAutoBid && newMaxAutoBid > currentMaxAutoBid) {
    // المزايد الجديد يفوز بأقل مبلغ فوق الحد الأقصى السابق
    const winningBid = Math.min(currentMaxAutoBid + minIncrement, newMaxAutoBid);
    return {
      shouldBid: true,
      bidAmount: winningBid,
      triggeredProxyBid: null,
    };
  }

  // إذا كان الحد الأقصى الحالي أعلى، المزايد السابق يرد تلقائياً
  if (newMaxAutoBid && currentMaxAutoBid > newMaxAutoBid) {
    // المزايد السابق يفوز بأقل مبلغ فوق المزايدة الجديدة
    const counterBid = Math.min(newMaxAutoBid + minIncrement, currentMaxAutoBid);
    return {
      shouldBid: true,
      bidAmount: newBidAmount,
      triggeredProxyBid: {
        bidderId: currentHighestProxyBid.bidderId,
        amount: counterBid,
      },
    };
  }

  // المزايدة العادية بدون وكالة
  if (newBidAmount > currentMaxAutoBid) {
    return {
      shouldBid: true,
      bidAmount: newBidAmount,
      triggeredProxyBid: null,
    };
  }

  // المزايد السابق يرد بالحد الأقصى
  const counterBid = Math.min(newBidAmount + minIncrement, currentMaxAutoBid);
  return {
    shouldBid: true,
    bidAmount: newBidAmount,
    triggeredProxyBid: {
      bidderId: currentHighestProxyBid.bidderId,
      amount: counterBid,
    },
  };
};

/**
 * ============================================
 * خوارزمية مكافحة القنص (Anti-Sniper)
 * ============================================
 *
 * تمديد المزاد تلقائياً عند المزايدة في اللحظات الأخيرة
 */
interface AntiSniperConfig {
  extensionMinutes: number;
  extensionThreshold: number; // دقائق قبل الانتهاء
  maxExtensions: number;
  timesExtended: number;
}

export const checkAntiSniper = (
  endTime: Date,
  config: AntiSniperConfig
): { shouldExtend: boolean; newEndTime?: Date } => {
  const now = new Date();
  const minutesUntilEnd = (endTime.getTime() - now.getTime()) / (1000 * 60);

  // إذا كانت المزايدة في آخر X دقائق ولم نصل للحد الأقصى
  if (
    minutesUntilEnd <= config.extensionThreshold &&
    config.timesExtended < config.maxExtensions
  ) {
    const newEndTime = new Date(endTime.getTime() + config.extensionMinutes * 60 * 1000);
    return {
      shouldExtend: true,
      newEndTime,
    };
  }

  return { shouldExtend: false };
};

/**
 * ============================================
 * خوارزمية تسجيل المزاد (Auction Scoring)
 * ============================================
 *
 * حساب نقاط المزاد لتحديد الترتيب والأهمية
 */
export const calculateAuctionScore = (auction: {
  totalBids: number;
  views: number;
  watchlistCount: number;
  endTime: Date;
  currentPrice: number;
  startingPrice: number;
}): number => {
  let score = 0;
  const now = new Date();

  // نقاط النشاط (40 نقطة كحد أقصى)
  const activityScore = Math.min(auction.totalBids * 2, 40);
  score += activityScore;

  // نقاط الإلحاح الزمني (30 نقطة كحد أقصى)
  const hoursUntilEnd = (auction.endTime.getTime() - now.getTime()) / (1000 * 60 * 60);
  if (hoursUntilEnd <= 1) {
    score += 30;
  } else if (hoursUntilEnd <= 6) {
    score += 20;
  } else if (hoursUntilEnd <= 24) {
    score += 10;
  }

  // نقاط ارتفاع السعر (20 نقطة كحد أقصى)
  const priceIncrease = ((auction.currentPrice - auction.startingPrice) / auction.startingPrice) * 100;
  score += Math.min(priceIncrease / 5, 20);

  // نقاط التفاعل (10 نقاط كحد أقصى)
  const engagementScore = Math.min((auction.views / 100) + (auction.watchlistCount * 2), 10);
  score += engagementScore;

  return Math.round(score * 100) / 100;
};

/**
 * ============================================
 * خوارزمية الرسوم الديناميكية
 * ============================================
 */
interface FeeStructure {
  sellerFee: number;      // نسبة رسوم البائع
  buyerFee: number;       // نسبة رسوم المشتري
  sellerFeeCap: number;   // الحد الأقصى لرسوم البائع
  buyerFeeCap: number;    // الحد الأقصى لرسوم المشتري
}

export const calculateFees = (
  category: string,
  finalPrice: number
): FeeStructure & { sellerFeeAmount: number; buyerFeeAmount: number } => {
  let structure: FeeStructure;

  // رسوم مختلفة حسب الفئة
  switch (category) {
    case 'CARS':
    case 'REAL_ESTATE':
      structure = {
        sellerFee: 2,
        buyerFee: 2,
        sellerFeeCap: 50000,
        buyerFeeCap: 50000,
      };
      break;
    case 'GOLD_JEWELRY':
    case 'SILVER_ITEMS':
    case 'WATCHES':
    case 'LUXURY_BAGS':
      structure = {
        sellerFee: 5,
        buyerFee: 3,
        sellerFeeCap: 25000,
        buyerFeeCap: 15000,
      };
      break;
    case 'ANTIQUES':
    case 'ART':
      structure = {
        sellerFee: 5,
        buyerFee: 5,
        sellerFeeCap: 30000,
        buyerFeeCap: 30000,
      };
      break;
    case 'CUSTOMS':
    case 'BANK_ASSETS':
      structure = {
        sellerFee: 1,
        buyerFee: 3,
        sellerFeeCap: 100000,
        buyerFeeCap: 50000,
      };
      break;
    default:
      structure = {
        sellerFee: 3,
        buyerFee: 2.5,
        sellerFeeCap: 20000,
        buyerFeeCap: 15000,
      };
  }

  const sellerFeeAmount = Math.min(
    (finalPrice * structure.sellerFee) / 100,
    structure.sellerFeeCap
  );
  const buyerFeeAmount = Math.min(
    (finalPrice * structure.buyerFee) / 100,
    structure.buyerFeeCap
  );

  return {
    ...structure,
    sellerFeeAmount,
    buyerFeeAmount,
  };
};

/**
 * ============================================
 * خوارزمية حساب السمعة
 * ============================================
 */
export const calculateReputationScore = (stats: {
  completionRate: number;     // 0-100
  averageRating: number;      // 1-5
  paymentSpeedHours: number;  // متوسط سرعة الدفع
  totalTransactions: number;
  disputeRate: number;        // 0-100
}): number => {
  let score = 0;

  // نقاط إتمام الصفقات (40 نقطة)
  score += (stats.completionRate / 100) * 40;

  // نقاط التقييم (30 نقطة)
  score += ((stats.averageRating - 1) / 4) * 30;

  // نقاط سرعة الدفع (20 نقطة) - أقل = أفضل
  if (stats.paymentSpeedHours <= 24) {
    score += 20;
  } else if (stats.paymentSpeedHours <= 48) {
    score += 15;
  } else if (stats.paymentSpeedHours <= 72) {
    score += 10;
  } else {
    score += 5;
  }

  // مكافأة حجم المعاملات (10 نقاط)
  score += Math.min(stats.totalTransactions / 10, 10);

  // خصم نسبة النزاعات
  score -= (stats.disputeRate / 100) * 20;

  return Math.max(0, Math.min(100, Math.round(score)));
};

/**
 * ============================================
 * خوارزمية المزاد الهولندي (Dutch Auction)
 * ============================================
 *
 * السعر يبدأ مرتفعاً وينخفض تدريجياً
 */
export const calculateDutchAuctionPrice = (
  startingPrice: number,
  reservePrice: number,
  startTime: Date,
  endTime: Date,
  decrementInterval: number = 60 // دقائق
): number => {
  const now = new Date();
  const totalDuration = endTime.getTime() - startTime.getTime();
  const elapsed = now.getTime() - startTime.getTime();

  if (elapsed < 0) return startingPrice;
  if (elapsed >= totalDuration) return reservePrice;

  const priceRange = startingPrice - reservePrice;
  const progress = elapsed / totalDuration;
  const currentPrice = startingPrice - (priceRange * progress);

  return Math.max(reservePrice, Math.round(currentPrice));
};
