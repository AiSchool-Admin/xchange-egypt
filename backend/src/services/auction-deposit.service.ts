import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuctionDepositStatus, AuctionStatus } from '@prisma/client';

/**
 * حساب مبلغ الإيداع المطلوب
 */
export const calculateDepositAmount = (auction: any): number => {
  if (auction.depositAmount) {
    return auction.depositAmount;
  }

  if (auction.depositPercentage) {
    return (auction.currentPrice * auction.depositPercentage) / 100;
  }

  // الافتراضي: 10% من السعر الحالي
  return (auction.currentPrice * 10) / 100;
};

/**
 * دفع إيداع للمشاركة في المزاد
 */
export const payDeposit = async (
  userId: string,
  auctionId: string,
  paymentMethod: string,
  paymentReference?: string
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

  if (auction.status !== AuctionStatus.ACTIVE && auction.status !== AuctionStatus.SCHEDULED) {
    throw new AppError('المزاد غير متاح للمشاركة', 400);
  }

  if (!auction.requiresDeposit) {
    throw new AppError('هذا المزاد لا يتطلب إيداعاً', 400);
  }

  // التحقق من أن المستخدم ليس البائع
  if (auction.listing.item.sellerId === userId) {
    throw new AppError('لا يمكنك دفع إيداع على مزادك الخاص', 400);
  }

  // التحقق من عدم وجود إيداع مسبق
  const existingDeposit = await prisma.auctionDeposit.findUnique({
    where: {
      auctionId_userId: { auctionId, userId },
    },
  });

  if (existingDeposit) {
    if (existingDeposit.status === AuctionDepositStatus.PAID || existingDeposit.status === AuctionDepositStatus.HELD) {
      throw new AppError('لديك إيداع مسجل بالفعل لهذا المزاد', 400);
    }

    // تحديث الإيداع الموجود
    const updated = await prisma.auctionDeposit.update({
      where: { id: existingDeposit.id },
      data: {
        status: AuctionDepositStatus.PAID,
        paymentMethod,
        paymentReference,
        paidAt: new Date(),
      },
    });

    return updated;
  }

  // حساب مبلغ الإيداع
  const depositAmount = calculateDepositAmount(auction);

  // إنشاء إيداع جديد
  const deposit = await prisma.auctionDeposit.create({
    data: {
      auctionId,
      userId,
      amount: depositAmount,
      status: AuctionDepositStatus.PAID,
      paymentMethod,
      paymentReference,
      paidAt: new Date(),
    },
  });

  return deposit;
};

/**
 * التحقق من وجود إيداع صالح
 */
export const hasValidDeposit = async (userId: string, auctionId: string): Promise<boolean> => {
  const deposit = await prisma.auctionDeposit.findUnique({
    where: {
      auctionId_userId: { auctionId, userId },
    },
  });

  return deposit?.status === AuctionDepositStatus.PAID || deposit?.status === AuctionDepositStatus.HELD;
};

/**
 * استرداد الإيداع
 */
export const refundDeposit = async (auctionId: string, userId: string, reason: string) => {
  const deposit = await prisma.auctionDeposit.findUnique({
    where: {
      auctionId_userId: { auctionId, userId },
    },
  });

  if (!deposit) {
    throw new AppError('الإيداع غير موجود', 404);
  }

  if (deposit.status !== AuctionDepositStatus.PAID && deposit.status !== AuctionDepositStatus.HELD) {
    throw new AppError('الإيداع غير قابل للاسترداد', 400);
  }

  const refunded = await prisma.auctionDeposit.update({
    where: { id: deposit.id },
    data: {
      status: AuctionDepositStatus.REFUNDED,
      refundedAt: new Date(),
      refundReason: reason,
    },
  });

  return refunded;
};

/**
 * مصادرة الإيداع (عند عدم إتمام الشراء)
 */
export const forfeitDeposit = async (auctionId: string, userId: string, reason: string) => {
  const deposit = await prisma.auctionDeposit.findUnique({
    where: {
      auctionId_userId: { auctionId, userId },
    },
  });

  if (!deposit) {
    throw new AppError('الإيداع غير موجود', 404);
  }

  const forfeited = await prisma.auctionDeposit.update({
    where: { id: deposit.id },
    data: {
      status: AuctionDepositStatus.FORFEITED,
      forfeitedAt: new Date(),
      forfeitReason: reason,
    },
  });

  return forfeited;
};

/**
 * تطبيق الإيداع على المبلغ النهائي
 */
export const applyDepositToPayment = async (auctionId: string, userId: string) => {
  const deposit = await prisma.auctionDeposit.findUnique({
    where: {
      auctionId_userId: { auctionId, userId },
    },
  });

  if (!deposit) {
    throw new AppError('الإيداع غير موجود', 404);
  }

  if (deposit.status !== AuctionDepositStatus.PAID && deposit.status !== AuctionDepositStatus.HELD) {
    throw new AppError('الإيداع غير صالح للتطبيق', 400);
  }

  const applied = await prisma.auctionDeposit.update({
    where: { id: deposit.id },
    data: {
      status: AuctionDepositStatus.APPLIED,
    },
  });

  return applied;
};

/**
 * استرداد جميع الإيداعات للخاسرين في المزاد
 */
export const refundLosingDeposits = async (auctionId: string, winnerId: string) => {
  const deposits = await prisma.auctionDeposit.findMany({
    where: {
      auctionId,
      userId: { not: winnerId },
      status: { in: [AuctionDepositStatus.PAID, AuctionDepositStatus.HELD] },
    },
  });

  const refunded = await prisma.auctionDeposit.updateMany({
    where: {
      auctionId,
      userId: { not: winnerId },
      status: { in: [AuctionDepositStatus.PAID, AuctionDepositStatus.HELD] },
    },
    data: {
      status: AuctionDepositStatus.REFUNDED,
      refundedAt: new Date(),
      refundReason: 'انتهاء المزاد - لم تفز',
    },
  });

  return { count: refunded.count };
};

/**
 * الحصول على إيداعات المستخدم
 */
export const getUserDeposits = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [deposits, total] = await Promise.all([
    prisma.auctionDeposit.findMany({
      where: { userId },
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auctionDeposit.count({ where: { userId } }),
  ]);

  return {
    deposits,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
