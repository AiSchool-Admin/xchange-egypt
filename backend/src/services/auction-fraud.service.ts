import prisma from '../lib/prisma';
import { FraudAlertType, FraudAlertStatus } from '@prisma/client';

/**
 * ============================================
 * نظام كشف الاحتيال في المزادات
 * Auction Fraud Detection System
 * ============================================
 */

interface FraudScore {
  type: FraudAlertType;
  score: number;
  description: string;
}

/**
 * حساب نقاط الاحتيال للمزايدة الوهمية (Shill Bidding)
 */
export const detectShillBidding = async (
  auctionId: string,
  bidderId: string,
  sellerId: string
): Promise<FraudScore[]> => {
  const scores: FraudScore[] = [];

  // 1. التحقق من بصمة الجهاز المتطابقة مع البائع (30 نقطة)
  const sellerFingerprints = await prisma.deviceFingerprint.findMany({
    where: { userId: sellerId },
    select: { fingerprint: true },
  });

  const bidderFingerprints = await prisma.deviceFingerprint.findMany({
    where: { userId: bidderId },
    select: { fingerprint: true },
  });

  const sellerFpSet = new Set(sellerFingerprints.map((f) => f.fingerprint));
  const hasMatchingFingerprint = bidderFingerprints.some((f) =>
    sellerFpSet.has(f.fingerprint)
  );

  if (hasMatchingFingerprint) {
    scores.push({
      type: FraudAlertType.DEVICE_FINGERPRINT,
      score: 30,
      description: 'بصمة الجهاز متطابقة مع البائع',
    });
  }

  // 2. التحقق من تكرار المزايدة على منتجات البائع (25 نقطة)
  const bidderAuctionsOnSeller = await prisma.auctionBid.count({
    where: {
      bidderId,
      auction: {
        listing: {
          item: { sellerId },
        },
      },
    },
  });

  if (bidderAuctionsOnSeller > 5) {
    scores.push({
      type: FraudAlertType.SHILL_BIDDING,
      score: 25,
      description: `المزايد شارك في ${bidderAuctionsOnSeller} مزادات لنفس البائع`,
    });
  }

  // 3. التحقق من سلوك المزايدة المتكرر (Bid Shielding) (20 نقطة)
  const recentBids = await prisma.auctionBid.findMany({
    where: {
      auctionId,
      bidderId,
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
  });

  // إذا كان المزايد يزايد باستمرار ثم يتراجع
  const withdrawnBids = recentBids.filter((b) => b.status === 'OUTBID').length;
  if (withdrawnBids >= 5) {
    scores.push({
      type: FraudAlertType.SHILL_BIDDING,
      score: 20,
      description: 'سلوك مزايدة وقائية مشبوه',
    });
  }

  return scores;
};

/**
 * كشف المزايدة السريعة المشبوهة
 */
export const detectRapidBidding = async (
  auctionId: string,
  bidderId: string
): Promise<FraudScore[]> => {
  const scores: FraudScore[] = [];

  // الحصول على آخر 10 مزايدات للمستخدم في آخر 5 دقائق
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);

  const recentBids = await prisma.auctionBid.findMany({
    where: {
      auctionId,
      bidderId,
      createdAt: { gte: fiveMinutesAgo },
    },
    orderBy: { createdAt: 'asc' },
  });

  if (recentBids.length >= 5) {
    // حساب متوسط الفاصل الزمني بين المزايدات
    let totalInterval = 0;
    for (let i = 1; i < recentBids.length; i++) {
      totalInterval +=
        recentBids[i].createdAt.getTime() - recentBids[i - 1].createdAt.getTime();
    }
    const avgInterval = totalInterval / (recentBids.length - 1);

    // إذا كان متوسط الفاصل أقل من 10 ثواني
    if (avgInterval < 10000) {
      scores.push({
        type: FraudAlertType.RAPID_BIDDING,
        score: 15,
        description: `مزايدة سريعة جداً: ${recentBids.length} مزايدات في 5 دقائق`,
      });
    }
  }

  return scores;
};

/**
 * كشف الحسابات المتعددة
 */
export const detectMultipleAccounts = async (
  userId: string,
  ipAddress: string,
  deviceFingerprint: string
): Promise<FraudScore[]> => {
  const scores: FraudScore[] = [];

  // البحث عن حسابات أخرى بنفس بصمة الجهاز
  const sameFingerprint = await prisma.deviceFingerprint.findMany({
    where: {
      fingerprint: deviceFingerprint,
      userId: { not: userId },
    },
    select: { userId: true },
  });

  if (sameFingerprint.length > 0) {
    scores.push({
      type: FraudAlertType.MULTIPLE_ACCOUNTS,
      score: 25,
      description: `بصمة الجهاز مرتبطة بـ ${sameFingerprint.length} حساب(ات) أخرى`,
    });
  }

  // البحث عن حسابات أخرى بنفس IP
  const sameIp = await prisma.deviceFingerprint.findMany({
    where: {
      ipAddresses: { has: ipAddress },
      userId: { not: userId },
    },
    select: { userId: true },
    distinct: ['userId'],
  });

  if (sameIp.length > 2) {
    scores.push({
      type: FraudAlertType.MULTIPLE_ACCOUNTS,
      score: 15,
      description: `عنوان IP مرتبط بـ ${sameIp.length} حساب(ات)`,
    });
  }

  return scores;
};

/**
 * إنشاء تنبيه احتيال
 */
export const createFraudAlert = async (data: {
  auctionId?: string;
  userId?: string;
  bidId?: string;
  alertType: FraudAlertType;
  description: string;
  confidence: number;
  deviceFingerprint?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}) => {
  const alert = await prisma.auctionFraudAlert.create({
    data: {
      auctionId: data.auctionId,
      userId: data.userId,
      bidId: data.bidId,
      alertType: data.alertType,
      description: data.description,
      confidence: data.confidence,
      deviceFingerprint: data.deviceFingerprint,
      ipAddress: data.ipAddress,
      userAgent: data.userAgent,
      metadata: data.metadata,
      status: FraudAlertStatus.DETECTED,
    },
  });

  return alert;
};

/**
 * تحليل شامل للمزايدة
 */
export const analyzeBid = async (params: {
  auctionId: string;
  bidderId: string;
  sellerId: string;
  ipAddress?: string;
  deviceFingerprint?: string;
  userAgent?: string;
}): Promise<{
  isAllowed: boolean;
  totalScore: number;
  alerts: FraudScore[];
  action: 'ALLOW' | 'FLAG' | 'BLOCK';
}> => {
  const allScores: FraudScore[] = [];

  // كشف المزايدة الوهمية
  const shillScores = await detectShillBidding(
    params.auctionId,
    params.bidderId,
    params.sellerId
  );
  allScores.push(...shillScores);

  // كشف المزايدة السريعة
  const rapidScores = await detectRapidBidding(params.auctionId, params.bidderId);
  allScores.push(...rapidScores);

  // كشف الحسابات المتعددة
  if (params.ipAddress && params.deviceFingerprint) {
    const multipleAccountScores = await detectMultipleAccounts(
      params.bidderId,
      params.ipAddress,
      params.deviceFingerprint
    );
    allScores.push(...multipleAccountScores);
  }

  // حساب المجموع
  const totalScore = allScores.reduce((sum, s) => sum + s.score, 0);

  // تحديد الإجراء
  let action: 'ALLOW' | 'FLAG' | 'BLOCK';
  let isAllowed = true;

  if (totalScore >= 50) {
    action = 'BLOCK';
    isAllowed = false;

    // إنشاء تنبيه
    for (const score of allScores) {
      await createFraudAlert({
        auctionId: params.auctionId,
        userId: params.bidderId,
        alertType: score.type,
        description: score.description,
        confidence: score.score,
        deviceFingerprint: params.deviceFingerprint,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
    }
  } else if (totalScore >= 30) {
    action = 'FLAG';
    isAllowed = true;

    // إنشاء تنبيه للمراجعة
    for (const score of allScores) {
      await createFraudAlert({
        auctionId: params.auctionId,
        userId: params.bidderId,
        alertType: score.type,
        description: score.description,
        confidence: score.score,
        deviceFingerprint: params.deviceFingerprint,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
      });
    }
  } else {
    action = 'ALLOW';
    isAllowed = true;
  }

  return {
    isAllowed,
    totalScore,
    alerts: allScores,
    action,
  };
};

/**
 * تسجيل/تحديث بصمة الجهاز
 */
export const recordDeviceFingerprint = async (
  userId: string,
  fingerprint: string,
  metadata: {
    browser?: string;
    os?: string;
    device?: string;
    screenResolution?: string;
    timezone?: string;
    language?: string;
    ipAddress?: string;
  }
) => {
  const existing = await prisma.deviceFingerprint.findUnique({
    where: { fingerprint },
  });

  if (existing) {
    // تحديث البصمة الموجودة
    const ipAddresses = existing.ipAddresses || [];
    if (metadata.ipAddress && !ipAddresses.includes(metadata.ipAddress)) {
      ipAddresses.push(metadata.ipAddress);
    }

    return prisma.deviceFingerprint.update({
      where: { id: existing.id },
      data: {
        lastSeenAt: new Date(),
        usageCount: { increment: 1 },
        ipAddresses,
      },
    });
  }

  // إنشاء بصمة جديدة
  return prisma.deviceFingerprint.create({
    data: {
      userId,
      fingerprint,
      browser: metadata.browser,
      os: metadata.os,
      device: metadata.device,
      screenResolution: metadata.screenResolution,
      timezone: metadata.timezone,
      language: metadata.language,
      ipAddresses: metadata.ipAddress ? [metadata.ipAddress] : [],
    },
  });
};

/**
 * الحصول على تنبيهات الاحتيال
 */
export const getFraudAlerts = async (
  filters: {
    auctionId?: string;
    userId?: string;
    status?: FraudAlertStatus;
    alertType?: FraudAlertType;
  },
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.auctionId) where.auctionId = filters.auctionId;
  if (filters.userId) where.userId = filters.userId;
  if (filters.status) where.status = filters.status;
  if (filters.alertType) where.alertType = filters.alertType;

  const [alerts, total] = await Promise.all([
    prisma.auctionFraudAlert.findMany({
      where,
      include: {
        auction: true,
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: { detectedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auctionFraudAlert.count({ where }),
  ]);

  return {
    alerts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * تحديث حالة تنبيه الاحتيال
 */
export const updateFraudAlertStatus = async (
  alertId: string,
  status: FraudAlertStatus,
  actionById: string,
  actionTaken?: string
) => {
  return prisma.auctionFraudAlert.update({
    where: { id: alertId },
    data: {
      status,
      actionById,
      actionTaken,
      actionAt: new Date(),
      resolvedAt: status === FraudAlertStatus.RESOLVED ? new Date() : undefined,
    },
  });
};
