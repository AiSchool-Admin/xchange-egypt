import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { AuctionDisputeStatus, AuctionStatus } from '@prisma/client';
import { CreateDisputeInput } from '../validations/auction.validation';

/**
 * ============================================
 * نظام النزاعات في المزادات
 * Auction Dispute System
 * ============================================
 */

/**
 * إنشاء نزاع جديد
 */
export const createDispute = async (
  userId: string,
  auctionId: string,
  data: CreateDisputeInput
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

  // التحقق من اكتمال المزاد
  if (auction.status !== AuctionStatus.COMPLETED) {
    throw new AppError('لا يمكن فتح نزاع إلا على مزاد مكتمل', 400);
  }

  // تحديد الطرف الآخر
  const sellerId = auction.listing.item.sellerId;
  const winnerId = auction.winnerId;

  if (!winnerId) {
    throw new AppError('لا يوجد فائز في هذا المزاد', 400);
  }

  let respondentId: string;
  if (userId === sellerId) {
    respondentId = winnerId;
  } else if (userId === winnerId) {
    respondentId = sellerId;
  } else {
    throw new AppError('لست طرفاً في هذا المزاد', 403);
  }

  // التحقق من عدم وجود نزاع مفتوح
  const existingDispute = await prisma.auctionDispute.findFirst({
    where: {
      auctionId,
      status: {
        notIn: [AuctionDisputeStatus.CLOSED, AuctionDisputeStatus.RESOLVED_BUYER, AuctionDisputeStatus.RESOLVED_SELLER],
      },
    },
  });

  if (existingDispute) {
    throw new AppError('يوجد نزاع مفتوح بالفعل لهذا المزاد', 400);
  }

  // إنشاء النزاع
  const dispute = await prisma.auctionDispute.create({
    data: {
      auctionId,
      initiatorId: userId,
      respondentId,
      reason: data.reason,
      description: data.description,
      evidenceUrls: data.evidenceUrls || [],
      status: AuctionDisputeStatus.OPEN,
    },
    include: {
      auction: true,
      initiator: {
        select: { id: true, fullName: true, email: true },
      },
      respondent: {
        select: { id: true, fullName: true, email: true },
      },
    },
  });

  return dispute;
};

/**
 * الرد على نزاع
 */
export const respondToDispute = async (
  userId: string,
  disputeId: string,
  message: string,
  attachments?: string[]
) => {
  const dispute = await prisma.auctionDispute.findUnique({
    where: { id: disputeId },
  });

  if (!dispute) {
    throw new AppError('النزاع غير موجود', 404);
  }

  // التحقق من أن المستخدم طرف في النزاع
  if (dispute.initiatorId !== userId && dispute.respondentId !== userId) {
    throw new AppError('لست طرفاً في هذا النزاع', 403);
  }

  // التحقق من أن النزاع لا يزال مفتوحاً
  if (
    dispute.status === AuctionDisputeStatus.CLOSED ||
    dispute.status === AuctionDisputeStatus.RESOLVED_BUYER ||
    dispute.status === AuctionDisputeStatus.RESOLVED_SELLER
  ) {
    throw new AppError('النزاع مغلق', 400);
  }

  // إضافة رسالة
  const disputeMessage = await prisma.auctionDisputeMessage.create({
    data: {
      disputeId,
      senderId: userId,
      message,
      attachments: attachments || [],
      isFromAdmin: false,
    },
    include: {
      sender: {
        select: { id: true, fullName: true },
      },
    },
  });

  return disputeMessage;
};

/**
 * تحديث حالة النزاع (للإدارة)
 */
export const updateDisputeStatus = async (
  disputeId: string,
  status: AuctionDisputeStatus,
  adminId: string,
  resolution?: string
) => {
  const dispute = await prisma.auctionDispute.findUnique({
    where: { id: disputeId },
  });

  if (!dispute) {
    throw new AppError('النزاع غير موجود', 404);
  }

  const updateData: any = { status };

  if (
    status === AuctionDisputeStatus.RESOLVED_BUYER ||
    status === AuctionDisputeStatus.RESOLVED_SELLER ||
    status === AuctionDisputeStatus.CLOSED
  ) {
    updateData.resolvedById = adminId;
    updateData.resolvedAt = new Date();
    updateData.resolution = resolution;
  }

  const updated = await prisma.auctionDispute.update({
    where: { id: disputeId },
    data: updateData,
    include: {
      auction: true,
      initiator: {
        select: { id: true, fullName: true, email: true },
      },
      respondent: {
        select: { id: true, fullName: true, email: true },
      },
      resolvedBy: {
        select: { id: true, fullName: true },
      },
    },
  });

  return updated;
};

/**
 * الحصول على نزاعات المستخدم
 */
export const getUserDisputes = async (userId: string, page = 1, limit = 20) => {
  const skip = (page - 1) * limit;

  const [disputes, total] = await Promise.all([
    prisma.auctionDispute.findMany({
      where: {
        OR: [{ initiatorId: userId }, { respondentId: userId }],
      },
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
        initiator: {
          select: { id: true, fullName: true },
        },
        respondent: {
          select: { id: true, fullName: true },
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auctionDispute.count({
      where: {
        OR: [{ initiatorId: userId }, { respondentId: userId }],
      },
    }),
  ]);

  return {
    disputes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * الحصول على تفاصيل نزاع
 */
export const getDisputeDetails = async (disputeId: string, userId: string) => {
  const dispute = await prisma.auctionDispute.findUnique({
    where: { id: disputeId },
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
      initiator: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      respondent: {
        select: { id: true, fullName: true, email: true, phone: true },
      },
      resolvedBy: {
        select: { id: true, fullName: true },
      },
      messages: {
        include: {
          sender: {
            select: { id: true, fullName: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!dispute) {
    throw new AppError('النزاع غير موجود', 404);
  }

  // التحقق من الصلاحية
  if (dispute.initiatorId !== userId && dispute.respondentId !== userId) {
    throw new AppError('لست طرفاً في هذا النزاع', 403);
  }

  return dispute;
};

/**
 * إضافة أدلة للنزاع
 */
export const addEvidence = async (
  disputeId: string,
  userId: string,
  evidenceUrls: string[]
) => {
  const dispute = await prisma.auctionDispute.findUnique({
    where: { id: disputeId },
  });

  if (!dispute) {
    throw new AppError('النزاع غير موجود', 404);
  }

  if (dispute.initiatorId !== userId && dispute.respondentId !== userId) {
    throw new AppError('لست طرفاً في هذا النزاع', 403);
  }

  if (
    dispute.status === AuctionDisputeStatus.CLOSED ||
    dispute.status === AuctionDisputeStatus.RESOLVED_BUYER ||
    dispute.status === AuctionDisputeStatus.RESOLVED_SELLER
  ) {
    throw new AppError('النزاع مغلق', 400);
  }

  const updated = await prisma.auctionDispute.update({
    where: { id: disputeId },
    data: {
      evidenceUrls: [...dispute.evidenceUrls, ...evidenceUrls],
    },
  });

  return updated;
};

/**
 * الحصول على نزاعات للإدارة
 */
export const getAdminDisputes = async (
  filters: {
    status?: AuctionDisputeStatus;
    auctionId?: string;
  },
  page = 1,
  limit = 20
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (filters.status) where.status = filters.status;
  if (filters.auctionId) where.auctionId = filters.auctionId;

  const [disputes, total] = await Promise.all([
    prisma.auctionDispute.findMany({
      where,
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
        initiator: {
          select: { id: true, fullName: true, email: true },
        },
        respondent: {
          select: { id: true, fullName: true, email: true },
        },
        messages: {
          take: 3,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.auctionDispute.count({ where }),
  ]);

  return {
    disputes,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

/**
 * إرسال رسالة من الإدارة
 */
export const sendAdminMessage = async (
  disputeId: string,
  adminId: string,
  message: string,
  attachments?: string[]
) => {
  const dispute = await prisma.auctionDispute.findUnique({
    where: { id: disputeId },
  });

  if (!dispute) {
    throw new AppError('النزاع غير موجود', 404);
  }

  const disputeMessage = await prisma.auctionDisputeMessage.create({
    data: {
      disputeId,
      senderId: adminId,
      message,
      attachments: attachments || [],
      isFromAdmin: true,
    },
    include: {
      sender: {
        select: { id: true, fullName: true },
      },
    },
  });

  return disputeMessage;
};
