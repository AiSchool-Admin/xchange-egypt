/**
 * Tender Advanced Service - خدمات المناقصات المتقدمة
 *
 * Full implementation of the tender/service request system.
 */

import prisma from '../lib/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

// Define types locally until Prisma client is regenerated
export type ServiceCategory =
  | 'HOME_SERVICES'
  | 'IT_SERVICES'
  | 'CONSTRUCTION'
  | 'CONSULTING'
  | 'MARKETING'
  | 'LEGAL'
  | 'ACCOUNTING'
  | 'TRANSPORT'
  | 'CLEANING'
  | 'MAINTENANCE'
  | 'DESIGN'
  | 'TRAINING'
  | 'OTHER';

export type TenderCategory = ServiceCategory;
export type TenderUrgency = 'URGENT' | 'NORMAL' | 'FLEXIBLE';
export type TenderRequestStatus = 'DRAFT' | 'OPEN' | 'UNDER_REVIEW' | 'AWARDED' | 'CANCELLED' | 'EXPIRED' | 'COMPLETED';
export type TenderQuoteStatus = 'PENDING' | 'UNDER_REVIEW' | 'SHORTLISTED' | 'ACCEPTED' | 'REJECTED' | 'WITHDRAWN';
export type TenderContractStatus = 'PENDING_SIGNATURES' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'DISPUTED' | 'TERMINATED';

// ============================================
// Types & Interfaces
// ============================================

export interface CreateServiceRequestInput {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  category: TenderCategory;
  budgetMin?: number;
  budgetMax?: number;
  governorate: string;
  city?: string;
  district?: string;
  urgency: TenderUrgency;
  deadline?: Date;
  expectedStartDate?: Date;
  expectedDuration?: string;
  requirements?: Array<{ requirement: string; mandatory: boolean }>;
  attachments?: string[];
  expiresAt?: Date;
}

export interface SubmitQuoteInput {
  requestId?: string;
  serviceRequestId?: string;
  price: number;
  description: string;
  descriptionAr?: string;
  estimatedDuration: string;
  deliveryDate?: Date;
  termsAndConditions?: string;
  warranty?: string;
  priceBreakdown?: Array<{ item: string; amount: number }>;
  attachments?: string[];
  validUntil?: Date;
}

export interface EvaluateBidInput {
  technicalScore: number;
  financialScore: number;
  notes?: string;
}

// ============================================
// Helper Functions
// ============================================

const generateReferenceNumber = (prefix: string): string => {
  const year = new Date().getFullYear();
  const random = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return `${prefix}-${year}-${random}`;
};

// ============================================
// SERVICE REQUESTS
// ============================================

/**
 * Create a new service request
 */
export const createServiceRequest = async (
  userId: string,
  input: CreateServiceRequestInput
) => {
  // Validate user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, fullName: true }
  });

  if (!user) {
    throw new NotFoundError('المستخدم غير موجود');
  }

  const referenceNumber = generateReferenceNumber('SR');

  const request = await prisma.tenderServiceRequest.create({
    data: {
      referenceNumber,
      requesterId: userId,
      title: input.title,
      titleAr: input.titleAr,
      description: input.description,
      descriptionAr: input.descriptionAr,
      category: input.category,
      budgetMin: input.budgetMin,
      budgetMax: input.budgetMax,
      governorate: input.governorate,
      city: input.city,
      district: input.district,
      urgency: input.urgency,
      deadline: input.deadline,
      expectedStartDate: input.expectedStartDate,
      expectedDuration: input.expectedDuration,
      requirements: input.requirements,
      attachments: input.attachments || [],
      expiresAt: input.expiresAt,
      status: 'OPEN',
    },
    include: {
      requester: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
        }
      }
    }
  });

  return {
    ...request,
    message: 'تم إنشاء طلب الخدمة بنجاح',
    messageEn: 'Service request created successfully',
  };
};

/**
 * Get service requests with filters
 */
export const getServiceRequests = async (
  filters: {
    category?: TenderCategory;
    governorate?: string;
    status?: TenderRequestStatus;
    urgency?: TenderUrgency;
    minBudget?: number;
    maxBudget?: number;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  const { page = 1, limit = 20, search, ...whereFilters } = filters;
  const skip = (page - 1) * limit;

  const where: any = {
    status: whereFilters.status || { in: ['OPEN', 'UNDER_REVIEW'] },
  };

  if (whereFilters.category) where.category = whereFilters.category;
  if (whereFilters.governorate) where.governorate = whereFilters.governorate;
  if (whereFilters.urgency) where.urgency = whereFilters.urgency;
  if (whereFilters.minBudget) where.budgetMax = { gte: whereFilters.minBudget };
  if (whereFilters.maxBudget) where.budgetMin = { lte: whereFilters.maxBudget };

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.tenderServiceRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: [
        { urgency: 'desc' },
        { createdAt: 'desc' },
      ],
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
            governorate: true,
          }
        },
        _count: {
          select: { quotes: true }
        }
      }
    }),
    prisma.tenderServiceRequest.count({ where }),
  ]);

  return {
    items: items.map(item => ({
      ...item,
      quotesCount: item._count.quotes,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get single service request details
 */
export const getServiceRequestById = async (
  requestId: string,
  userId?: string
) => {
  const request = await prisma.tenderServiceRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
          totalReviews: true,
          governorate: true,
          city: true,
        }
      },
      quotes: userId ? {
        where: { providerId: userId },
        include: {
          provider: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
            }
          }
        }
      } : false,
      _count: {
        select: { quotes: true }
      }
    }
  });

  if (!request) {
    throw new NotFoundError('طلب الخدمة غير موجود');
  }

  // Increment views count
  await prisma.tenderServiceRequest.update({
    where: { id: requestId },
    data: { viewsCount: { increment: 1 } },
  });

  return {
    ...request,
    quotesCount: request._count.quotes,
    userQuote: request.quotes?.[0] || null,
  };
};

/**
 * Get user's service requests
 */
export const getMyServiceRequests = async (
  userId: string,
  filters: {
    status?: TenderRequestStatus;
    page?: number;
    limit?: number;
  } = {}
) => {
  const { page = 1, limit = 20, status } = filters;
  const skip = (page - 1) * limit;

  const where: any = { requesterId: userId };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.tenderServiceRequest.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { quotes: true }
        },
        contract: {
          select: {
            id: true,
            status: true,
            contractNumber: true,
          }
        }
      }
    }),
    prisma.tenderServiceRequest.count({ where }),
  ]);

  return {
    items: items.map(item => ({
      ...item,
      quotesCount: item._count.quotes,
    })),
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Update service request
 */
export const updateServiceRequest = async (
  requestId: string,
  userId: string,
  input: Partial<CreateServiceRequestInput>
) => {
  const request = await prisma.tenderServiceRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError('طلب الخدمة غير موجود');
  }

  if (request.requesterId !== userId) {
    throw new ForbiddenError('غير مصرح لك بتعديل هذا الطلب');
  }

  if (request.status !== 'DRAFT' && request.status !== 'OPEN') {
    throw new BadRequestError('لا يمكن تعديل الطلب في هذه الحالة');
  }

  const updated = await prisma.tenderServiceRequest.update({
    where: { id: requestId },
    data: input,
    include: {
      requester: {
        select: {
          id: true,
          fullName: true,
        }
      }
    }
  });

  return updated;
};

/**
 * Cancel service request
 */
export const cancelServiceRequest = async (
  requestId: string,
  userId: string
) => {
  const request = await prisma.tenderServiceRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError('طلب الخدمة غير موجود');
  }

  if (request.requesterId !== userId) {
    throw new ForbiddenError('غير مصرح لك بإلغاء هذا الطلب');
  }

  if (request.status === 'AWARDED' || request.status === 'COMPLETED') {
    throw new BadRequestError('لا يمكن إلغاء الطلب بعد الترسية أو الاكتمال');
  }

  const updated = await prisma.tenderServiceRequest.update({
    where: { id: requestId },
    data: {
      status: 'CANCELLED',
      closedAt: new Date(),
    },
  });

  // Reject all pending quotes
  await prisma.tenderQuote.updateMany({
    where: {
      requestId,
      status: { in: ['PENDING', 'UNDER_REVIEW', 'SHORTLISTED'] },
    },
    data: { status: 'REJECTED' },
  });

  return { ...updated, message: 'تم إلغاء الطلب بنجاح' };
};

// ============================================
// QUOTES
// ============================================

/**
 * Submit a quote for a service request
 */
export const submitQuote = async (
  providerId: string,
  input: SubmitQuoteInput
) => {
  // Handle both requestId and serviceRequestId
  const requestId = input.requestId || input.serviceRequestId;

  if (!requestId) {
    throw new BadRequestError('معرف طلب الخدمة مطلوب');
  }

  // Validate provider exists
  const provider = await prisma.user.findUnique({
    where: { id: providerId },
  });

  if (!provider) {
    throw new NotFoundError('المستخدم غير موجود');
  }

  // Validate request exists and is open
  const request = await prisma.tenderServiceRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError('طلب الخدمة غير موجود');
  }

  if (request.status !== 'OPEN') {
    throw new BadRequestError('طلب الخدمة غير مفتوح للعروض');
  }

  if (request.requesterId === providerId) {
    throw new BadRequestError('لا يمكنك تقديم عرض على طلبك الخاص');
  }

  // Check if already submitted
  const existingQuote = await prisma.tenderQuote.findFirst({
    where: {
      requestId,
      providerId,
      status: { notIn: ['WITHDRAWN', 'REJECTED'] },
    },
  });

  if (existingQuote) {
    throw new BadRequestError('لقد قدمت عرضاً مسبقاً على هذا الطلب');
  }

  const quoteNumber = generateReferenceNumber('QT');

  const quote = await prisma.tenderQuote.create({
    data: {
      quoteNumber,
      requestId,
      providerId,
      price: input.price,
      description: input.description,
      descriptionAr: input.descriptionAr,
      estimatedDuration: input.estimatedDuration,
      deliveryDate: input.deliveryDate,
      termsAndConditions: input.termsAndConditions,
      warranty: input.warranty,
      priceBreakdown: input.priceBreakdown,
      attachments: input.attachments || [],
      validUntil: input.validUntil,
      status: 'PENDING',
    },
    include: {
      provider: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
        }
      },
      request: {
        select: {
          id: true,
          title: true,
          referenceNumber: true,
        }
      }
    }
  });

  // Increment quotes count
  await prisma.tenderServiceRequest.update({
    where: { id: requestId },
    data: { quotesCount: { increment: 1 } },
  });

  return {
    ...quote,
    message: 'تم تقديم العرض بنجاح',
    messageEn: 'Quote submitted successfully',
  };
};

/**
 * Get quotes for a service request (owner only)
 */
export const getQuotesForRequest = async (
  requestId: string,
  requesterId: string
) => {
  const request = await prisma.tenderServiceRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError('طلب الخدمة غير موجود');
  }

  if (request.requesterId !== requesterId) {
    throw new ForbiddenError('غير مصرح لك بعرض العروض');
  }

  const quotes = await prisma.tenderQuote.findMany({
    where: { requestId },
    orderBy: [
      { totalScore: 'desc' },
      { price: 'asc' },
    ],
    include: {
      provider: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
          totalReviews: true,
          governorate: true,
          city: true,
        }
      }
    }
  });

  // Calculate statistics
  const prices = quotes.map(q => q.price);
  const statistics = {
    totalQuotes: quotes.length,
    lowestPrice: prices.length ? Math.min(...prices) : null,
    highestPrice: prices.length ? Math.max(...prices) : null,
    averagePrice: prices.length ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
  };

  return { quotes, statistics };
};

/**
 * Get my submitted quotes
 */
export const getMyQuotes = async (
  providerId: string,
  filters: {
    status?: TenderQuoteStatus;
    page?: number;
    limit?: number;
  } = {}
) => {
  const { page = 1, limit = 20, status } = filters;
  const skip = (page - 1) * limit;

  const where: any = { providerId };
  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.tenderQuote.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            referenceNumber: true,
            status: true,
            budgetMin: true,
            budgetMax: true,
            governorate: true,
            requester: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              }
            }
          }
        }
      }
    }),
    prisma.tenderQuote.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Withdraw a quote
 */
export const withdrawQuote = async (
  quoteId: string,
  providerId: string
) => {
  const quote = await prisma.tenderQuote.findUnique({
    where: { id: quoteId },
    include: { request: true }
  });

  if (!quote) {
    throw new NotFoundError('العرض غير موجود');
  }

  if (quote.providerId !== providerId) {
    throw new ForbiddenError('غير مصرح لك بسحب هذا العرض');
  }

  if (quote.status === 'ACCEPTED' || quote.status === 'WITHDRAWN') {
    throw new BadRequestError('لا يمكن سحب العرض في هذه الحالة');
  }

  const updated = await prisma.tenderQuote.update({
    where: { id: quoteId },
    data: { status: 'WITHDRAWN' },
  });

  // Decrement quotes count
  await prisma.tenderServiceRequest.update({
    where: { id: quote.requestId },
    data: { quotesCount: { decrement: 1 } },
  });

  return { ...updated, message: 'تم سحب العرض بنجاح' };
};

// ============================================
// EVALUATION
// ============================================

/**
 * Evaluate a quote
 */
export const evaluateQuote = async (
  quoteId: string,
  evaluatorId: string,
  input: EvaluateBidInput
) => {
  const quote = await prisma.tenderQuote.findUnique({
    where: { id: quoteId },
    include: { request: true }
  });

  if (!quote) {
    throw new NotFoundError('العرض غير موجود');
  }

  if (quote.request.requesterId !== evaluatorId) {
    throw new ForbiddenError('فقط صاحب الطلب يمكنه تقييم العروض');
  }

  // Calculate weighted score (60% technical, 40% financial)
  const totalScore = (input.technicalScore * 0.6) + (input.financialScore * 0.4);

  const updated = await prisma.tenderQuote.update({
    where: { id: quoteId },
    data: {
      technicalScore: input.technicalScore,
      financialScore: input.financialScore,
      totalScore,
      evaluationNotes: input.notes,
      evaluatedAt: new Date(),
      evaluatedBy: evaluatorId,
      status: 'UNDER_REVIEW',
    },
    include: {
      provider: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        }
      }
    }
  });

  return {
    ...updated,
    message: 'تم تقييم العرض بنجاح',
  };
};

/**
 * Shortlist a quote
 */
export const shortlistQuote = async (
  quoteId: string,
  requesterId: string
) => {
  const quote = await prisma.tenderQuote.findUnique({
    where: { id: quoteId },
    include: { request: true }
  });

  if (!quote) {
    throw new NotFoundError('العرض غير موجود');
  }

  if (quote.request.requesterId !== requesterId) {
    throw new ForbiddenError('غير مصرح لك بهذا الإجراء');
  }

  const updated = await prisma.tenderQuote.update({
    where: { id: quoteId },
    data: { status: 'SHORTLISTED' },
  });

  return { ...updated, message: 'تم إضافة العرض للقائمة المختصرة' };
};

/**
 * Accept a quote and create contract
 * Signature compatible with routes: (requestId, quoteId, requesterId)
 */
export const acceptQuote = async (
  requestIdOrQuoteId: string,
  quoteIdOrRequesterId: string,
  requesterId?: string
) => {
  // Handle both signatures: (quoteId, requesterId) or (requestId, quoteId, requesterId)
  const quoteId = requesterId ? quoteIdOrRequesterId : requestIdOrQuoteId;
  const actualRequesterId = requesterId || quoteIdOrRequesterId;

  const quote = await prisma.tenderQuote.findUnique({
    where: { id: quoteId },
    include: { request: true, provider: true }
  });

  if (!quote) {
    throw new NotFoundError('العرض غير موجود');
  }

  if (quote.request.requesterId !== actualRequesterId) {
    throw new ForbiddenError('غير مصرح لك بقبول هذا العرض');
  }

  if (quote.request.status === 'AWARDED') {
    throw new BadRequestError('تم ترسية هذا الطلب مسبقاً');
  }

  const contractNumber = generateReferenceNumber('CON');

  // Use transaction to ensure data consistency
  const result = await prisma.$transaction(async (tx) => {
    // Update quote status to accepted
    const acceptedQuote = await tx.tenderQuote.update({
      where: { id: quoteId },
      data: { status: 'ACCEPTED' },
    });

    // Reject all other quotes
    await tx.tenderQuote.updateMany({
      where: {
        requestId: quote.requestId,
        id: { not: quoteId },
        status: { in: ['PENDING', 'UNDER_REVIEW', 'SHORTLISTED'] },
      },
      data: { status: 'REJECTED' },
    });

    // Update request status
    await tx.tenderServiceRequest.update({
      where: { id: quote.requestId },
      data: {
        status: 'AWARDED',
        closedAt: new Date(),
      },
    });

    // Create contract
    const contract = await tx.tenderContract.create({
      data: {
        contractNumber,
        requestId: quote.requestId,
        quoteId: quote.id,
        buyerId: actualRequesterId,
        vendorId: quote.providerId,
        totalAmount: quote.price,
        terms: quote.termsAndConditions,
        status: 'PENDING_SIGNATURES',
        pendingAmount: quote.price,
      },
    });

    return { quote: acceptedQuote, contract };
  });

  return {
    ...result,
    message: 'تم قبول العرض وإنشاء العقد بنجاح',
    messageEn: 'Quote accepted and contract created successfully',
  };
};

// ============================================
// CONTRACT MANAGEMENT
// ============================================

/**
 * Get user's contracts
 */
export const getContracts = async (
  userId: string,
  filters: {
    role?: 'buyer' | 'vendor';
    status?: TenderContractStatus;
    page?: number;
    limit?: number;
  } = {}
) => {
  const { page = 1, limit = 20, role, status } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (role === 'buyer') {
    where.buyerId = userId;
  } else if (role === 'vendor') {
    where.vendorId = userId;
  } else {
    where.OR = [{ buyerId: userId }, { vendorId: userId }];
  }

  if (status) where.status = status;

  const [items, total] = await Promise.all([
    prisma.tenderContract.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        request: {
          select: {
            id: true,
            title: true,
            referenceNumber: true,
            category: true,
          }
        },
        buyer: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          }
        },
        vendor: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
          }
        }
      }
    }),
    prisma.tenderContract.count({ where }),
  ]);

  return {
    items,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get contract by ID
 */
export const getContractById = async (
  contractId: string,
  userId: string
) => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
    include: {
      request: {
        include: {
          requester: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              phone: true,
              email: true,
            }
          }
        }
      },
      quote: true,
      buyer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
          email: true,
        }
      },
      vendor: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          phone: true,
          email: true,
          rating: true,
          totalReviews: true,
        }
      }
    }
  });

  if (!contract) {
    throw new NotFoundError('العقد غير موجود');
  }

  if (contract.buyerId !== userId && contract.vendorId !== userId) {
    throw new ForbiddenError('غير مصرح لك بعرض هذا العقد');
  }

  return contract;
};

/**
 * Sign contract
 */
export const signContract = async (
  contractId: string,
  userId: string
) => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('العقد غير موجود');
  }

  const isBuyer = contract.buyerId === userId;
  const isVendor = contract.vendorId === userId;

  if (!isBuyer && !isVendor) {
    throw new ForbiddenError('غير مصرح لك بالتوقيع على هذا العقد');
  }

  if (contract.status !== 'PENDING_SIGNATURES') {
    throw new BadRequestError('العقد ليس في حالة انتظار التوقيعات');
  }

  const updateData: any = {};

  if (isBuyer && !contract.buyerSigned) {
    updateData.buyerSigned = true;
    updateData.buyerSignedAt = new Date();
  } else if (isVendor && !contract.vendorSigned) {
    updateData.vendorSigned = true;
    updateData.vendorSignedAt = new Date();
  } else {
    throw new BadRequestError('لقد وقعت على هذا العقد مسبقاً');
  }

  // Check if both signed to activate contract
  const willBeFullySigned =
    (isBuyer && contract.vendorSigned) || (isVendor && contract.buyerSigned);

  if (willBeFullySigned) {
    updateData.status = 'ACTIVE';
    updateData.startDate = new Date();
  }

  const updated = await prisma.tenderContract.update({
    where: { id: contractId },
    data: updateData,
  });

  return {
    ...updated,
    message: willBeFullySigned
      ? 'تم توقيع العقد وتفعيله بنجاح'
      : 'تم توقيع العقد بنجاح، في انتظار توقيع الطرف الآخر',
  };
};

/**
 * Update contract progress
 */
export const updateContractProgress = async (
  contractId: string,
  userId: string,
  input: {
    completedMilestones?: number;
    progressPercentage?: number;
    milestones?: any[];
  }
) => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('العقد غير موجود');
  }

  if (contract.vendorId !== userId) {
    throw new ForbiddenError('فقط مقدم الخدمة يمكنه تحديث التقدم');
  }

  if (contract.status !== 'ACTIVE' && contract.status !== 'IN_PROGRESS') {
    throw new BadRequestError('لا يمكن تحديث التقدم في هذه الحالة');
  }

  const updated = await prisma.tenderContract.update({
    where: { id: contractId },
    data: {
      ...input,
      status: 'IN_PROGRESS',
    },
  });

  return { ...updated, message: 'تم تحديث التقدم بنجاح' };
};

/**
 * Complete contract
 */
export const completeContract = async (
  contractId: string,
  buyerId: string
) => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
    include: { request: true }
  });

  if (!contract) {
    throw new NotFoundError('العقد غير موجود');
  }

  if (contract.buyerId !== buyerId) {
    throw new ForbiddenError('فقط المشتري يمكنه إكمال العقد');
  }

  if (contract.status !== 'IN_PROGRESS' && contract.status !== 'ACTIVE') {
    throw new BadRequestError('لا يمكن إكمال العقد في هذه الحالة');
  }

  const result = await prisma.$transaction(async (tx) => {
    const updatedContract = await tx.tenderContract.update({
      where: { id: contractId },
      data: {
        status: 'COMPLETED',
        actualEndDate: new Date(),
        progressPercentage: 100,
        paidAmount: contract.totalAmount,
        pendingAmount: 0,
      },
    });

    await tx.tenderServiceRequest.update({
      where: { id: contract.requestId },
      data: { status: 'COMPLETED' },
    });

    return updatedContract;
  });

  return { ...result, message: 'تم إكمال العقد بنجاح' };
};

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

/**
 * Get user tender dashboard
 */
export const getUserDashboard = async (userId: string) => {
  // As requester
  const myRequests = await prisma.tenderServiceRequest.groupBy({
    by: ['status'],
    where: { requesterId: userId },
    _count: true,
  });

  // As provider
  const myQuotes = await prisma.tenderQuote.groupBy({
    by: ['status'],
    where: { providerId: userId },
    _count: true,
  });

  // Recent requests
  const recentRequests = await prisma.tenderServiceRequest.findMany({
    where: { requesterId: userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      referenceNumber: true,
      status: true,
      quotesCount: true,
      createdAt: true,
    },
  });

  // Recent quotes
  const recentQuotes = await prisma.tenderQuote.findMany({
    where: { providerId: userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      request: {
        select: {
          id: true,
          title: true,
          referenceNumber: true,
        },
      },
    },
  });

  // Contracts
  const activeContracts = await prisma.tenderContract.count({
    where: {
      OR: [{ buyerId: userId }, { vendorId: userId }],
      status: { in: ['ACTIVE', 'IN_PROGRESS'] },
    },
  });

  // Win rate
  const acceptedQuotes = myQuotes.find(q => q.status === 'ACCEPTED')?._count || 0;
  const totalQuotesSubmitted = myQuotes.reduce((sum, q) => sum + q._count, 0);
  const winRate = totalQuotesSubmitted > 0 ? (acceptedQuotes / totalQuotesSubmitted) * 100 : 0;

  return {
    summary: {
      openRequests: myRequests.find(r => r.status === 'OPEN')?._count || 0,
      pendingQuotes: myQuotes.filter(q => ['PENDING', 'UNDER_REVIEW', 'SHORTLISTED'].includes(q.status)).reduce((sum, q) => sum + q._count, 0),
      activeContracts,
    },
    recentActivity: {
      requests: recentRequests,
      quotes: recentQuotes,
    },
    performance: {
      winRate: Math.round(winRate * 10) / 10,
      totalQuotesSubmitted,
      acceptedQuotes,
    },
  };
};

/**
 * Get platform tender statistics
 */
export const getPlatformStatistics = async () => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const [activeRequests, activeValue, newToday, avgQuotes] = await Promise.all([
    prisma.tenderServiceRequest.count({
      where: { status: 'OPEN' },
    }),
    prisma.tenderServiceRequest.aggregate({
      where: { status: 'OPEN' },
      _sum: { budgetMax: true },
    }),
    prisma.tenderServiceRequest.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.tenderServiceRequest.aggregate({
      where: { status: { in: ['OPEN', 'UNDER_REVIEW', 'AWARDED'] } },
      _avg: { quotesCount: true },
    }),
  ]);

  // Category distribution
  const categoryDistribution = await prisma.tenderServiceRequest.groupBy({
    by: ['category'],
    where: { status: 'OPEN' },
    _count: true,
  });

  return {
    overview: {
      totalActiveRequests: activeRequests,
      totalActiveValue: activeValue._sum.budgetMax || 0,
      newToday,
    },
    trends: {
      averageQuotesPerRequest: Math.round((avgQuotes._avg.quotesCount || 0) * 10) / 10,
    },
    categories: categoryDistribution.map(c => ({
      category: c.category,
      count: c._count,
    })),
  };
};

// ============================================
// REVERSE AUCTION BID EVALUATION (Legacy Support)
// ============================================

/**
 * Evaluate a reverse auction bid with criteria scoring
 */
export const evaluateBid = async (
  tenderId: string,
  bidId: string,
  evaluatorId: string,
  input: EvaluateBidInput
) => {
  // Validate tender exists
  const tender = await prisma.reverseAuction.findUnique({
    where: { id: tenderId },
  });

  if (!tender) {
    throw new NotFoundError('المناقصة غير موجودة');
  }

  if (tender.buyerId !== evaluatorId) {
    throw new ForbiddenError('فقط صاحب المناقصة يمكنه تقييم العروض');
  }

  // Validate bid exists
  const bid = await prisma.reverseAuctionBid.findUnique({
    where: { id: bidId },
  });

  if (!bid) {
    throw new NotFoundError('العرض غير موجود');
  }

  // Calculate weighted score (60% technical, 40% financial)
  const totalScore = (input.technicalScore * 0.6) + (input.financialScore * 0.4);

  return {
    bidId,
    evaluatorId,
    technicalScore: input.technicalScore,
    financialScore: input.financialScore,
    totalScore,
    notes: input.notes,
    evaluatedAt: new Date(),
    message: 'تم تقييم العرض بنجاح',
  };
};

/**
 * Get all evaluations for a reverse auction tender
 */
export const getTenderEvaluations = async (
  tenderId: string,
  evaluatorId: string
) => {
  const tender = await prisma.reverseAuction.findUnique({
    where: { id: tenderId },
  });

  if (!tender) {
    throw new NotFoundError('المناقصة غير موجودة');
  }

  if (tender.buyerId !== evaluatorId) {
    throw new ForbiddenError('فقط صاحب المناقصة يمكنه عرض التقييمات');
  }

  // Get bids for the tender
  const bids = await prisma.reverseAuctionBid.findMany({
    where: { reverseAuctionId: tenderId },
    include: {
      seller: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
        },
      },
    },
    orderBy: { bidAmount: 'asc' },
  });

  return bids.map(bid => ({
    bidId: bid.id,
    seller: bid.seller,
    bidAmount: bid.bidAmount,
    status: bid.status,
  }));
};

// ============================================
// MILESTONE MANAGEMENT
// ============================================

/**
 * Complete milestone (vendor)
 */
export const completeMilestone = async (
  contractId: string,
  milestoneId: string,
  vendorId: string,
  input: { completionNotes?: string; deliverables?: string[] }
) => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('العقد غير موجود');
  }

  if (contract.vendorId !== vendorId) {
    throw new ForbiddenError('فقط مقدم الخدمة يمكنه إكمال المراحل');
  }

  // Update milestone in JSON
  const milestones = (contract.milestones as any[]) || [];
  const milestoneIndex = milestones.findIndex((m: any) => m.id === milestoneId);

  if (milestoneIndex === -1) {
    throw new NotFoundError('المرحلة غير موجودة');
  }

  milestones[milestoneIndex] = {
    ...milestones[milestoneIndex],
    status: 'COMPLETED',
    completedAt: new Date(),
    completionNotes: input.completionNotes,
    deliverables: input.deliverables,
  };

  await prisma.tenderContract.update({
    where: { id: contractId },
    data: { milestones },
  });

  return {
    milestoneId,
    status: 'COMPLETED',
    completedAt: new Date(),
    message: 'تم إكمال المرحلة بنجاح',
  };
};

/**
 * Approve milestone (buyer)
 */
export const approveMilestone = async (
  contractId: string,
  milestoneId: string,
  buyerId: string
) => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('العقد غير موجود');
  }

  if (contract.buyerId !== buyerId) {
    throw new ForbiddenError('فقط المشتري يمكنه اعتماد المراحل');
  }

  // Update milestone in JSON
  const milestones = (contract.milestones as any[]) || [];
  const milestoneIndex = milestones.findIndex((m: any) => m.id === milestoneId);

  if (milestoneIndex === -1) {
    throw new NotFoundError('المرحلة غير موجودة');
  }

  milestones[milestoneIndex] = {
    ...milestones[milestoneIndex],
    status: 'APPROVED',
    approvedAt: new Date(),
  };

  // Calculate progress
  const completedCount = milestones.filter((m: any) => m.status === 'APPROVED').length;
  const progressPercentage = (completedCount / milestones.length) * 100;

  await prisma.tenderContract.update({
    where: { id: contractId },
    data: {
      milestones,
      completedMilestones: completedCount,
      progressPercentage,
    },
  });

  return {
    milestoneId,
    status: 'APPROVED',
    approvedAt: new Date(),
    message: 'تم اعتماد المرحلة بنجاح',
  };
};

/**
 * Reject milestone (buyer)
 */
export const rejectMilestone = async (
  contractId: string,
  milestoneId: string,
  buyerId: string,
  reason: string
) => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('العقد غير موجود');
  }

  if (contract.buyerId !== buyerId) {
    throw new ForbiddenError('فقط المشتري يمكنه رفض المراحل');
  }

  // Update milestone in JSON
  const milestones = (contract.milestones as any[]) || [];
  const milestoneIndex = milestones.findIndex((m: any) => m.id === milestoneId);

  if (milestoneIndex === -1) {
    throw new NotFoundError('المرحلة غير موجودة');
  }

  milestones[milestoneIndex] = {
    ...milestones[milestoneIndex],
    status: 'REJECTED',
    rejectedAt: new Date(),
    rejectionReason: reason,
  };

  await prisma.tenderContract.update({
    where: { id: contractId },
    data: { milestones },
  });

  return {
    milestoneId,
    status: 'REJECTED',
    reason,
    rejectedAt: new Date(),
    message: 'تم رفض المرحلة',
  };
};

// ============================================
// VENDOR MANAGEMENT
// ============================================

/**
 * Get vendor profile
 */
export const getVendorProfile = async (vendorId: string) => {
  const vendor = await prisma.user.findUnique({
    where: { id: vendorId },
    select: {
      id: true,
      fullName: true,
      avatar: true,
      rating: true,
      totalReviews: true,
      governorate: true,
      city: true,
      bio: true,
      createdAt: true,
    },
  });

  if (!vendor) {
    throw new NotFoundError('مقدم الخدمة غير موجود');
  }

  // Get bid statistics from reverse auctions
  const wonBids = await prisma.reverseAuctionBid.count({
    where: { sellerId: vendorId, status: 'WON' },
  });

  const totalBids = await prisma.reverseAuctionBid.count({
    where: { sellerId: vendorId },
  });

  // Get tender quote statistics
  const acceptedQuotes = await prisma.tenderQuote.count({
    where: { providerId: vendorId, status: 'ACCEPTED' },
  });

  const totalQuotes = await prisma.tenderQuote.count({
    where: { providerId: vendorId },
  });

  return {
    ...vendor,
    statistics: {
      wonBids,
      totalBids,
      bidWinRate: totalBids > 0 ? Math.round((wonBids / totalBids) * 100) : 0,
      acceptedQuotes,
      totalQuotes,
      quoteWinRate: totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0,
    },
  };
};

/**
 * Browse vendors with filters
 */
export const browseVendors = async (
  filters: {
    governorate?: string;
    minRating?: number;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
) => {
  const { governorate, minRating, search, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (governorate) {
    where.governorate = governorate;
  }

  if (minRating) {
    where.rating = { gte: minRating };
  }

  if (search) {
    where.OR = [
      { fullName: { contains: search, mode: 'insensitive' } },
      { bio: { contains: search, mode: 'insensitive' } },
    ];
  }

  const total = await prisma.user.count({ where });

  const vendors = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: [{ rating: 'desc' }, { totalReviews: 'desc' }],
    select: {
      id: true,
      fullName: true,
      avatar: true,
      rating: true,
      totalReviews: true,
      governorate: true,
      city: true,
      bio: true,
    },
  });

  return {
    items: vendors,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};
