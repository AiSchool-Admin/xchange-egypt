import crypto from 'crypto';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuctionStatus } from '@prisma/client';
import { SubmitSealedBidInput } from '../validations/auction.validation';

// مفتاح التشفير (يجب أن يكون في متغيرات البيئة)
const ENCRYPTION_KEY = process.env.SEALED_BID_ENCRYPTION_KEY || 'xchange-auction-sealed-bid-key-32';
const IV_LENGTH = 16;

/**
 * تشفير مبلغ المزايدة
 */
const encryptAmount = (amount: number): string => {
  const iv = crypto.randomBytes(IV_LENGTH);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  let encrypted = cipher.update(amount.toString(), 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
};

/**
 * فك تشفير مبلغ المزايدة
 */
const decryptAmount = (encryptedAmount: string): number => {
  const [ivHex, encrypted] = encryptedAmount.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-cbc', key, iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return parseFloat(decrypted);
};

/**
 * إنشاء تجزئة للتحقق من سلامة البيانات
 */
const createBidHash = (auctionId: string, bidderId: string, amount: number): string => {
  return crypto
    .createHash('sha256')
    .update(`${auctionId}:${bidderId}:${amount}:${Date.now()}`)
    .digest('hex');
};

/**
 * تقديم مزايدة مختومة
 */
export const submitSealedBid = async (
  userId: string,
  auctionId: string,
  data: SubmitSealedBidInput
) => {
  // التحقق من وجود المزاد
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
    include: {
      listing: {
        include: { item: true },
      },
    },
  });

  if (!auction) {
    throw new AppError('المزاد غير موجود', 404);
  }

  // التحقق من أن المزاد مختوم
  if ((auction as any).auctionType !== 'SEALED_BID') {
    throw new AppError('هذا المزاد ليس مزاداً مختوماً', 400);
  }

  // التحقق من حالة المزاد
  if (auction.status !== AuctionStatus.ACTIVE) {
    throw new AppError('المزاد غير نشط', 400);
  }

  // التحقق من التوقيت
  const now = new Date();
  if (now > auction.endTime) {
    throw new AppError('انتهى وقت تقديم العروض', 400);
  }

  // التحقق من أن المستخدم ليس البائع
  if (auction.listing.item.sellerId === userId) {
    throw new AppError('لا يمكنك المزايدة على مزادك الخاص', 400);
  }

  // التحقق من أن المبلغ يفوق السعر الابتدائي
  if (data.bidAmount < auction.startingPrice) {
    throw new AppError(`المبلغ يجب أن يكون على الأقل ${auction.startingPrice} ج.م`, 400);
  }

  // التحقق من عدم وجود عرض سابق
  const existingBid = await prisma.auctionSealedBid.findUnique({
    where: {
      auctionId_bidderId: { auctionId, bidderId: userId },
    },
  });

  if (existingBid) {
    throw new AppError('لقد قدمت عرضاً مختوماً بالفعل. لا يمكن تعديله.', 400);
  }

  // تشفير المبلغ
  const encryptedAmount = encryptAmount(data.bidAmount);
  const bidHash = createBidHash(auctionId, userId, data.bidAmount);

  // إنشاء العرض المختوم
  const sealedBid = await prisma.auctionSealedBid.create({
    data: {
      auctionId,
      bidderId: userId,
      encryptedAmount,
      bidHash,
      notes: data.notes,
    },
  });

  // تحديث عدد المزايدات
  await prisma.auction.update({
    where: { id: auctionId },
    data: { totalBids: { increment: 1 } },
  });

  return {
    id: sealedBid.id,
    submittedAt: sealedBid.submittedAt,
    message: 'تم تقديم عرضك المختوم بنجاح. سيتم الكشف عنه بعد انتهاء المزاد.',
  };
};

/**
 * الكشف عن جميع العروض المختومة (بعد انتهاء المزاد)
 */
export const revealSealedBids = async (auctionId: string) => {
  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw new AppError('المزاد غير موجود', 404);
  }

  // التحقق من انتهاء المزاد
  const now = new Date();
  if (now < auction.endTime) {
    throw new AppError('لا يمكن الكشف عن العروض قبل انتهاء المزاد', 400);
  }

  // الحصول على جميع العروض غير المكشوفة
  const sealedBids = await prisma.auctionSealedBid.findMany({
    where: {
      auctionId,
      isRevealed: false,
    },
  });

  const revealedBids: any[] = [];

  for (const bid of sealedBids) {
    try {
      const amount = decryptAmount(bid.encryptedAmount);

      await prisma.auctionSealedBid.update({
        where: { id: bid.id },
        data: {
          revealedAmount: amount,
          isRevealed: true,
          revealedAt: new Date(),
        },
      });

      revealedBids.push({
        id: bid.id,
        bidderId: bid.bidderId,
        amount,
        submittedAt: bid.submittedAt,
      });
    } catch (error) {
      console.error(`فشل فك تشفير العرض ${bid.id}:`, error);
    }
  }

  // ترتيب العروض من الأعلى للأقل
  revealedBids.sort((a, b) => b.amount - a.amount);

  return revealedBids;
};

/**
 * تحديد الفائز في المزاد المختوم
 */
export const determineSealedBidWinner = async (auctionId: string) => {
  // الكشف عن العروض أولاً
  const revealedBids = await revealSealedBids(auctionId);

  if (revealedBids.length === 0) {
    return { hasWinner: false, message: 'لا توجد عروض لهذا المزاد' };
  }

  const auction = await prisma.auction.findUnique({
    where: { id: auctionId },
  });

  if (!auction) {
    throw new AppError('المزاد غير موجود', 404);
  }

  // الفائز هو صاحب أعلى عرض
  const winner = revealedBids[0];

  // التحقق من تجاوز السعر الاحتياطي
  if (auction.reservePrice && winner.amount < auction.reservePrice) {
    return {
      hasWinner: false,
      message: 'لم يصل أي عرض إلى السعر الاحتياطي',
      highestBid: winner.amount,
      reservePrice: auction.reservePrice,
    };
  }

  // تحديث المزاد بالفائز
  await prisma.auction.update({
    where: { id: auctionId },
    data: {
      status: AuctionStatus.COMPLETED,
      winnerId: winner.bidderId,
      currentPrice: winner.amount,
      actualEndTime: new Date(),
    },
  });

  return {
    hasWinner: true,
    winner: {
      bidderId: winner.bidderId,
      amount: winner.amount,
    },
    allBids: revealedBids,
  };
};

/**
 * الحصول على عدد العروض المختومة (بدون الكشف عن المبالغ)
 */
export const getSealedBidCount = async (auctionId: string): Promise<number> => {
  return prisma.auctionSealedBid.count({
    where: { auctionId },
  });
};

/**
 * التحقق من تقديم المستخدم لعرض مختوم
 */
export const hasSubmittedSealedBid = async (userId: string, auctionId: string): Promise<boolean> => {
  const bid = await prisma.auctionSealedBid.findUnique({
    where: {
      auctionId_bidderId: { auctionId, bidderId: userId },
    },
  });

  return !!bid;
};

/**
 * الحصول على عروضي المختومة
 */
export const getMySealedBids = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [bids, total] = await Promise.all([
    prisma.auctionSealedBid.findMany({
      where: { bidderId: userId },
      include: {
        auction: {
          include: {
            listing: {
              include: {
                item: {
                  include: {
                    category: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: { submittedAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auctionSealedBid.count({ where: { bidderId: userId } }),
  ]);

  // إخفاء المبالغ غير المكشوفة
  const safeBids = bids.map((bid) => ({
    ...bid,
    encryptedAmount: undefined,
    bidHash: undefined,
    amount: bid.isRevealed ? bid.revealedAmount : null,
  }));

  return {
    bids: safeBids,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
