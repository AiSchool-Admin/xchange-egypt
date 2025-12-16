/**
 * Tender Advanced Service - خدمات المناقصات المتقدمة
 *
 * Advanced features for the tender/reverse auction system:
 * - Service Requests (C2C/C2B)
 * - Evaluation Criteria Scoring
 * - Contract Management
 * - Vendor Management
 * - Document Management
 */

import { Prisma } from '@prisma/client';
import prisma from '../lib/prisma';
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';

// ============================================
// Types & Interfaces
// ============================================

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
  | 'OTHER';

export type ServiceUrgency = 'URGENT' | 'NORMAL' | 'FLEXIBLE';
export type QuoteStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'WITHDRAWN';
export type ContractStatus = 'DRAFT' | 'PENDING_SIGNATURES' | 'ACTIVE' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
export type MilestoneStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'APPROVED' | 'REJECTED';

export interface CreateServiceRequestInput {
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  category: ServiceCategory;
  subcategory?: string;
  budgetType: 'FIXED' | 'RANGE' | 'HOURLY' | 'OPEN';
  budgetMin?: number;
  budgetMax?: number;
  governorate: string;
  city?: string;
  district?: string;
  urgency: ServiceUrgency;
  preferredDate?: Date;
  preferredTimeSlot?: 'morning' | 'afternoon' | 'evening' | 'anytime';
  flexibleDate?: boolean;
  requirements?: string;
  photos?: string[];
  autoMatch?: boolean;
  maxQuotes?: number;
}

export interface SubmitQuoteInput {
  serviceRequestId: string;
  price: number;
  priceType: 'FIXED' | 'HOURLY' | 'ESTIMATE';
  priceBreakdown?: string;
  description: string;
  estimatedDuration: string;
  availableDate?: Date;
  availableTimeSlot?: string;
  message?: string;
}

export interface EvaluateBidInput {
  technicalScore: number;
  financialScore: number;
  criteriaScores: Array<{
    criteriaId: string;
    score: number;
    notes?: string;
  }>;
  notes?: string;
}

export interface CreateContractInput {
  tenderId?: string;
  serviceRequestId?: string;
  bidId?: string;
  quoteId?: string;
  buyerId: string;
  vendorId: string;
  title: string;
  description: string;
  totalAmount: number;
  currency: string;
  startDate: Date;
  endDate: Date;
  milestones?: Array<{
    title: string;
    description: string;
    amount: number;
    dueDate: Date;
    deliverables?: string[];
  }>;
  terms?: string;
}

// ============================================
// SERVICE REQUESTS (C2C/C2B)
// ============================================

/**
 * Create a new service request
 */
export const createServiceRequest = async (
  userId: string,
  input: CreateServiceRequestInput
): Promise<any> => {
  const {
    title,
    titleAr,
    description,
    descriptionAr,
    category,
    subcategory,
    budgetType,
    budgetMin,
    budgetMax,
    governorate,
    city,
    district,
    urgency,
    preferredDate,
    preferredTimeSlot,
    flexibleDate = true,
    requirements,
    photos = [],
    autoMatch = true,
    maxQuotes = 5,
  } = input;

  // Validate budget
  if (budgetType === 'RANGE' && (!budgetMin || !budgetMax)) {
    throw new BadRequestError('Budget range requires min and max values');
  }

  if (budgetMin && budgetMax && budgetMin > budgetMax) {
    throw new BadRequestError('Minimum budget cannot exceed maximum');
  }

  // Generate reference number
  const count = await prisma.serviceRequest.count();
  const referenceNumber = `SR-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

  const serviceRequest = await prisma.serviceRequest.create({
    data: {
      referenceNumber,
      requesterId: userId,
      title,
      titleAr,
      description,
      descriptionAr,
      category,
      subcategory,
      budgetType,
      budgetMin,
      budgetMax,
      governorate,
      city,
      district,
      urgency,
      preferredDate,
      preferredTimeSlot,
      flexibleDate,
      requirements,
      photos,
      autoMatch,
      maxQuotes,
      status: 'OPEN',
    },
    include: {
      requester: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
        },
      },
    },
  });

  // If autoMatch is enabled, find matching providers (async)
  if (autoMatch) {
    // This would trigger a background job to notify matching providers
    // For now, we'll count matching providers
    const matchedProviders = await countMatchingProviders(category, governorate);
    (serviceRequest as any).matchedProviders = matchedProviders;
  }

  return serviceRequest;
};

/**
 * Get service requests with filters (for providers)
 */
export const getServiceRequests = async (
  filters: {
    category?: ServiceCategory;
    governorate?: string;
    city?: string;
    urgency?: ServiceUrgency;
    budgetMin?: number;
    budgetMax?: number;
    status?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<any> => {
  const {
    category,
    governorate,
    city,
    urgency,
    budgetMin,
    budgetMax,
    status = 'OPEN',
    page = 1,
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {};

  if (status) where.status = status;
  if (category) where.category = category;
  if (governorate) where.governorate = governorate;
  if (city) where.city = city;
  if (urgency) where.urgency = urgency;

  if (budgetMin !== undefined || budgetMax !== undefined) {
    where.OR = [];
    if (budgetMin !== undefined) {
      where.OR.push({ budgetMin: { gte: budgetMin } });
      where.OR.push({ budgetMax: { gte: budgetMin } });
    }
    if (budgetMax !== undefined) {
      where.OR.push({ budgetMin: { lte: budgetMax } });
      where.OR.push({ budgetMax: { lte: budgetMax } });
    }
  }

  const total = await prisma.serviceRequest.count({ where });

  const requests = await prisma.serviceRequest.findMany({
    where,
    skip,
    take: limit,
    orderBy: [
      { urgency: 'asc' }, // URGENT first
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
        },
      },
      _count: {
        select: {
          quotes: true,
        },
      },
    },
  });

  return {
    items: requests,
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
): Promise<any> => {
  const request = await prisma.serviceRequest.findUnique({
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
        },
      },
      quotes: userId
        ? {
            where: { providerId: userId },
          }
        : false,
    },
  });

  if (!request) {
    throw new NotFoundError('Service request not found');
  }

  // Increment view count
  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { views: { increment: 1 } },
  });

  return request;
};

/**
 * Submit a quote for a service request
 */
export const submitQuote = async (
  providerId: string,
  input: SubmitQuoteInput
): Promise<any> => {
  const {
    serviceRequestId,
    price,
    priceType,
    priceBreakdown,
    description,
    estimatedDuration,
    availableDate,
    availableTimeSlot,
    message,
  } = input;

  // Get service request
  const request = await prisma.serviceRequest.findUnique({
    where: { id: serviceRequestId },
    include: {
      quotes: true,
    },
  });

  if (!request) {
    throw new NotFoundError('Service request not found');
  }

  if (request.status !== 'OPEN') {
    throw new BadRequestError('Service request is not accepting quotes');
  }

  if (request.requesterId === providerId) {
    throw new BadRequestError('Cannot quote on your own request');
  }

  // Check max quotes
  if (request.quotes.length >= (request.maxQuotes || 10)) {
    throw new BadRequestError('Maximum quotes reached for this request');
  }

  // Check if already quoted
  const existingQuote = request.quotes.find(q => q.providerId === providerId);
  if (existingQuote) {
    throw new BadRequestError('You have already submitted a quote');
  }

  // Create quote
  const quote = await prisma.serviceQuote.create({
    data: {
      serviceRequestId,
      providerId,
      price,
      priceType,
      priceBreakdown,
      description,
      estimatedDuration,
      availableDate,
      availableTimeSlot,
      message,
      status: 'PENDING',
    },
    include: {
      provider: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
          totalReviews: true,
        },
      },
    },
  });

  // Update service request quote count
  await prisma.serviceRequest.update({
    where: { id: serviceRequestId },
    data: {
      quoteCount: { increment: 1 },
    },
  });

  return quote;
};

/**
 * Get quotes for a service request (owner only)
 */
export const getQuotesForRequest = async (
  requestId: string,
  requesterId: string
): Promise<any> => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError('Service request not found');
  }

  if (request.requesterId !== requesterId) {
    throw new ForbiddenError('Only the requester can view all quotes');
  }

  const quotes = await prisma.serviceQuote.findMany({
    where: { serviceRequestId: requestId },
    orderBy: { createdAt: 'desc' },
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
        },
      },
    },
  });

  // Calculate statistics
  const prices = quotes.map(q => q.price);
  const statistics = {
    totalQuotes: quotes.length,
    lowestPrice: prices.length > 0 ? Math.min(...prices) : null,
    highestPrice: prices.length > 0 ? Math.max(...prices) : null,
    averagePrice: prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : null,
  };

  return { quotes, statistics };
};

/**
 * Accept a quote
 */
export const acceptQuote = async (
  requestId: string,
  quoteId: string,
  requesterId: string
): Promise<any> => {
  const request = await prisma.serviceRequest.findUnique({
    where: { id: requestId },
  });

  if (!request) {
    throw new NotFoundError('Service request not found');
  }

  if (request.requesterId !== requesterId) {
    throw new ForbiddenError('Only the requester can accept quotes');
  }

  if (request.status !== 'OPEN') {
    throw new BadRequestError('Service request is not open');
  }

  const quote = await prisma.serviceQuote.findUnique({
    where: { id: quoteId },
    include: {
      provider: true,
    },
  });

  if (!quote) {
    throw new NotFoundError('Quote not found');
  }

  if (quote.serviceRequestId !== requestId) {
    throw new BadRequestError('Quote does not belong to this request');
  }

  // Accept quote and reject others
  const result = await prisma.$transaction(async (tx) => {
    // Accept the selected quote
    const acceptedQuote = await tx.serviceQuote.update({
      where: { id: quoteId },
      data: { status: 'ACCEPTED' },
      include: {
        provider: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
          },
        },
      },
    });

    // Reject all other quotes
    await tx.serviceQuote.updateMany({
      where: {
        serviceRequestId: requestId,
        id: { not: quoteId },
        status: 'PENDING',
      },
      data: { status: 'REJECTED' },
    });

    // Update service request status
    await tx.serviceRequest.update({
      where: { id: requestId },
      data: {
        status: 'ASSIGNED',
        assignedProviderId: quote.providerId,
      },
    });

    // Create contract
    const contract = await createContractFromQuote(
      tx,
      request,
      acceptedQuote
    );

    return { quote: acceptedQuote, contract };
  });

  return result;
};

// ============================================
// EVALUATION CRITERIA SCORING
// ============================================

/**
 * Evaluate a bid with criteria scoring
 */
export const evaluateBid = async (
  tenderId: string,
  bidId: string,
  evaluatorId: string,
  input: EvaluateBidInput
): Promise<any> => {
  const { technicalScore, financialScore, criteriaScores, notes } = input;

  // Get tender and validate ownership
  const tender = await prisma.reverseAuction.findUnique({
    where: { id: tenderId },
  });

  if (!tender) {
    throw new NotFoundError('Tender not found');
  }

  if (tender.buyerId !== evaluatorId) {
    throw new ForbiddenError('Only the tender owner can evaluate bids');
  }

  // Get bid
  const bid = await prisma.reverseAuctionBid.findUnique({
    where: { id: bidId },
  });

  if (!bid) {
    throw new NotFoundError('Bid not found');
  }

  if (bid.reverseAuctionId !== tenderId) {
    throw new BadRequestError('Bid does not belong to this tender');
  }

  // Calculate weighted score
  const totalScore = calculateWeightedScore(technicalScore, financialScore, criteriaScores);

  // Create evaluation
  const evaluation = await prisma.bidEvaluation.create({
    data: {
      bidId,
      evaluatorId,
      technicalScore,
      financialScore,
      totalScore,
      criteriaScores: criteriaScores as any,
      notes,
    },
  });

  // Update bid with evaluation score
  await prisma.reverseAuctionBid.update({
    where: { id: bidId },
    data: {
      evaluationScore: totalScore,
    },
  });

  return evaluation;
};

/**
 * Get all evaluations for a tender
 */
export const getTenderEvaluations = async (
  tenderId: string,
  evaluatorId: string
): Promise<any> => {
  const tender = await prisma.reverseAuction.findUnique({
    where: { id: tenderId },
  });

  if (!tender) {
    throw new NotFoundError('Tender not found');
  }

  if (tender.buyerId !== evaluatorId) {
    throw new ForbiddenError('Only the tender owner can view evaluations');
  }

  const evaluations = await prisma.bidEvaluation.findMany({
    where: {
      bid: {
        reverseAuctionId: tenderId,
      },
    },
    include: {
      bid: {
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
      },
    },
    orderBy: {
      totalScore: 'desc',
    },
  });

  return evaluations;
};

// ============================================
// CONTRACT MANAGEMENT
// ============================================

/**
 * Create a contract from awarded bid or accepted quote
 */
export const createContract = async (
  input: CreateContractInput
): Promise<any> => {
  const {
    tenderId,
    serviceRequestId,
    bidId,
    quoteId,
    buyerId,
    vendorId,
    title,
    description,
    totalAmount,
    currency = 'EGP',
    startDate,
    endDate,
    milestones = [],
    terms,
  } = input;

  // Generate reference number
  const count = await prisma.tenderContract.count();
  const referenceNumber = `CON-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

  const contract = await prisma.tenderContract.create({
    data: {
      referenceNumber,
      tenderId,
      serviceRequestId,
      bidId,
      quoteId,
      buyerId,
      vendorId,
      title,
      description,
      totalAmount,
      currency,
      startDate,
      endDate,
      terms,
      status: 'PENDING_SIGNATURES',
      milestones: {
        create: milestones.map((m, index) => ({
          title: m.title,
          description: m.description,
          amount: m.amount,
          dueDate: m.dueDate,
          deliverables: m.deliverables || [],
          order: index + 1,
          status: 'PENDING',
        })),
      },
    },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      vendor: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      milestones: true,
    },
  });

  return contract;
};

/**
 * Get user's contracts
 */
export const getContracts = async (
  userId: string,
  filters: {
    role?: 'buyer' | 'vendor';
    status?: ContractStatus;
    page?: number;
    limit?: number;
  } = {}
): Promise<any> => {
  const { role, status, page = 1, limit = 20 } = filters;
  const skip = (page - 1) * limit;

  const where: any = {};

  if (role === 'buyer') {
    where.buyerId = userId;
  } else if (role === 'vendor') {
    where.vendorId = userId;
  } else {
    where.OR = [{ buyerId: userId }, { vendorId: userId }];
  }

  if (status) {
    where.status = status;
  }

  const total = await prisma.tenderContract.count({ where });

  const contracts = await prisma.tenderContract.findMany({
    where,
    skip,
    take: limit,
    orderBy: { createdAt: 'desc' },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      vendor: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      milestones: {
        orderBy: { order: 'asc' },
      },
    },
  });

  return {
    items: contracts,
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
): Promise<any> => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          email: true,
          phone: true,
        },
      },
      vendor: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          email: true,
          phone: true,
        },
      },
      milestones: {
        orderBy: { order: 'asc' },
      },
      tender: true,
      serviceRequest: true,
    },
  });

  if (!contract) {
    throw new NotFoundError('Contract not found');
  }

  // Check access
  if (contract.buyerId !== userId && contract.vendorId !== userId) {
    throw new ForbiddenError('You do not have access to this contract');
  }

  return contract;
};

/**
 * Sign contract
 */
export const signContract = async (
  contractId: string,
  userId: string
): Promise<any> => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('Contract not found');
  }

  if (contract.buyerId !== userId && contract.vendorId !== userId) {
    throw new ForbiddenError('You are not a party to this contract');
  }

  if (contract.status !== 'PENDING_SIGNATURES') {
    throw new BadRequestError('Contract is not pending signatures');
  }

  // Determine which party is signing
  const isBuyer = contract.buyerId === userId;
  const updateData: any = {};

  if (isBuyer) {
    if (contract.buyerSignedAt) {
      throw new BadRequestError('You have already signed this contract');
    }
    updateData.buyerSignedAt = new Date();
  } else {
    if (contract.vendorSignedAt) {
      throw new BadRequestError('You have already signed this contract');
    }
    updateData.vendorSignedAt = new Date();
  }

  // Check if both parties will have signed
  const otherPartySigned = isBuyer ? contract.vendorSignedAt : contract.buyerSignedAt;
  if (otherPartySigned) {
    updateData.status = 'ACTIVE';
  }

  const updated = await prisma.tenderContract.update({
    where: { id: contractId },
    data: updateData,
    include: {
      buyer: {
        select: {
          id: true,
          fullName: true,
        },
      },
      vendor: {
        select: {
          id: true,
          fullName: true,
        },
      },
    },
  });

  return updated;
};

/**
 * Complete milestone (vendor)
 */
export const completeMilestone = async (
  contractId: string,
  milestoneId: string,
  vendorId: string,
  input: {
    completionNotes?: string;
    deliverables?: string[];
  }
): Promise<any> => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
    include: {
      milestones: true,
    },
  });

  if (!contract) {
    throw new NotFoundError('Contract not found');
  }

  if (contract.vendorId !== vendorId) {
    throw new ForbiddenError('Only the vendor can complete milestones');
  }

  if (contract.status !== 'ACTIVE') {
    throw new BadRequestError('Contract is not active');
  }

  const milestone = contract.milestones.find(m => m.id === milestoneId);
  if (!milestone) {
    throw new NotFoundError('Milestone not found');
  }

  if (milestone.status !== 'PENDING' && milestone.status !== 'IN_PROGRESS') {
    throw new BadRequestError('Milestone cannot be completed in current status');
  }

  const updated = await prisma.contractMilestone.update({
    where: { id: milestoneId },
    data: {
      status: 'COMPLETED',
      completionNotes: input.completionNotes,
      deliverables: input.deliverables || milestone.deliverables,
      completedAt: new Date(),
    },
  });

  return updated;
};

/**
 * Approve milestone (buyer)
 */
export const approveMilestone = async (
  contractId: string,
  milestoneId: string,
  buyerId: string
): Promise<any> => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
    include: {
      milestones: true,
    },
  });

  if (!contract) {
    throw new NotFoundError('Contract not found');
  }

  if (contract.buyerId !== buyerId) {
    throw new ForbiddenError('Only the buyer can approve milestones');
  }

  const milestone = contract.milestones.find(m => m.id === milestoneId);
  if (!milestone) {
    throw new NotFoundError('Milestone not found');
  }

  if (milestone.status !== 'COMPLETED') {
    throw new BadRequestError('Milestone must be completed first');
  }

  const updated = await prisma.$transaction(async (tx) => {
    const approvedMilestone = await tx.contractMilestone.update({
      where: { id: milestoneId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
      },
    });

    // Check if all milestones are approved
    const allMilestones = await tx.contractMilestone.findMany({
      where: { contractId },
    });

    const allApproved = allMilestones.every(m => m.status === 'APPROVED');

    if (allApproved) {
      await tx.tenderContract.update({
        where: { id: contractId },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      });
    }

    return approvedMilestone;
  });

  return updated;
};

/**
 * Reject milestone (buyer)
 */
export const rejectMilestone = async (
  contractId: string,
  milestoneId: string,
  buyerId: string,
  reason: string
): Promise<any> => {
  const contract = await prisma.tenderContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('Contract not found');
  }

  if (contract.buyerId !== buyerId) {
    throw new ForbiddenError('Only the buyer can reject milestones');
  }

  const updated = await prisma.contractMilestone.update({
    where: { id: milestoneId },
    data: {
      status: 'REJECTED',
      rejectionReason: reason,
      rejectedAt: new Date(),
    },
  });

  return updated;
};

// ============================================
// VENDOR MANAGEMENT
// ============================================

/**
 * Get vendor profile
 */
export const getVendorProfile = async (vendorId: string): Promise<any> => {
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
      // Vendor-specific data
      _count: {
        select: {
          reverseAuctionBids: {
            where: { status: 'WON' },
          },
          serviceQuotes: {
            where: { status: 'ACCEPTED' },
          },
        },
      },
    },
  });

  if (!vendor) {
    throw new NotFoundError('Vendor not found');
  }

  // Get additional statistics
  const stats = await getVendorStatistics(vendorId);

  return {
    ...vendor,
    statistics: stats,
  };
};

/**
 * Browse vendors with filters
 */
export const browseVendors = async (
  filters: {
    category?: string;
    governorate?: string;
    minRating?: number;
    verified?: boolean;
    search?: string;
    page?: number;
    limit?: number;
  } = {}
): Promise<any> => {
  const {
    governorate,
    minRating,
    search,
    page = 1,
    limit = 20,
  } = filters;

  const skip = (page - 1) * limit;

  const where: any = {
    // Vendors are users who have submitted bids or quotes
    OR: [
      { reverseAuctionBids: { some: {} } },
      { serviceQuotes: { some: {} } },
    ],
  };

  if (governorate) {
    where.governorate = governorate;
  }

  if (minRating) {
    where.rating = { gte: minRating };
  }

  if (search) {
    where.AND = [
      {
        OR: [
          { fullName: { contains: search, mode: 'insensitive' } },
          { bio: { contains: search, mode: 'insensitive' } },
        ],
      },
    ];
  }

  const total = await prisma.user.count({ where });

  const vendors = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: [
      { rating: 'desc' },
      { totalReviews: 'desc' },
    ],
    select: {
      id: true,
      fullName: true,
      avatar: true,
      rating: true,
      totalReviews: true,
      governorate: true,
      city: true,
      bio: true,
      _count: {
        select: {
          reverseAuctionBids: {
            where: { status: 'WON' },
          },
        },
      },
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

// ============================================
// DASHBOARD & ANALYTICS
// ============================================

/**
 * Get user tender dashboard
 */
export const getUserDashboard = async (userId: string): Promise<any> => {
  // Get tender stats as buyer
  const asBuyer = await prisma.reverseAuction.groupBy({
    by: ['status'],
    where: { buyerId: userId },
    _count: true,
  });

  // Get bid stats as seller
  const asSeller = await prisma.reverseAuctionBid.groupBy({
    by: ['status'],
    where: { sellerId: userId },
    _count: true,
  });

  // Get contract stats
  const contracts = await prisma.tenderContract.groupBy({
    by: ['status'],
    where: {
      OR: [{ buyerId: userId }, { vendorId: userId }],
    },
    _count: true,
  });

  // Get service request stats
  const serviceRequests = await prisma.serviceRequest.groupBy({
    by: ['status'],
    where: { requesterId: userId },
    _count: true,
  });

  // Get recent activity
  const recentTenders = await prisma.reverseAuction.findMany({
    where: { buyerId: userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      title: true,
      status: true,
      createdAt: true,
      totalBids: true,
    },
  });

  const recentBids = await prisma.reverseAuctionBid.findMany({
    where: { sellerId: userId },
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      reverseAuction: {
        select: {
          id: true,
          title: true,
        },
      },
    },
  });

  // Get upcoming deadlines
  const upcomingDeadlines = await prisma.reverseAuction.findMany({
    where: {
      OR: [{ buyerId: userId }, { bids: { some: { sellerId: userId } } }],
      status: 'ACTIVE',
      endDate: { gt: new Date() },
    },
    take: 5,
    orderBy: { endDate: 'asc' },
    select: {
      id: true,
      title: true,
      endDate: true,
    },
  });

  // Calculate win rate
  const wonBids = asSeller.find(s => s.status === 'WON')?._count || 0;
  const totalBidsSubmitted = asSeller.reduce((sum, s) => sum + s._count, 0);
  const winRate = totalBidsSubmitted > 0 ? (wonBids / totalBidsSubmitted) * 100 : 0;

  return {
    summary: {
      activeTenders: asBuyer.find(s => s.status === 'ACTIVE')?._count || 0,
      pendingBids: asSeller.filter(s => ['ACTIVE', 'WINNING', 'OUTBID'].includes(s.status)).reduce((sum, s) => sum + s._count, 0),
      activeContracts: contracts.find(s => s.status === 'ACTIVE')?._count || 0,
      completedContracts: contracts.find(s => s.status === 'COMPLETED')?._count || 0,
      openServiceRequests: serviceRequests.find(s => s.status === 'OPEN')?._count || 0,
    },
    recentActivity: {
      tenders: recentTenders,
      bids: recentBids,
    },
    upcomingDeadlines,
    performance: {
      winRate: Math.round(winRate * 10) / 10,
      totalBidsSubmitted,
      wonBids,
    },
  };
};

/**
 * Get platform tender statistics
 */
export const getPlatformStatistics = async (): Promise<any> => {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Active tenders
  const activeTenders = await prisma.reverseAuction.count({
    where: { status: 'ACTIVE' },
  });

  // Total value of active tenders
  const activeValue = await prisma.reverseAuction.aggregate({
    where: { status: 'ACTIVE' },
    _sum: { maxBudget: true },
  });

  // Closing today
  const closingToday = await prisma.reverseAuction.count({
    where: {
      status: 'ACTIVE',
      endDate: {
        gte: todayStart,
        lt: new Date(todayStart.getTime() + 24 * 60 * 60 * 1000),
      },
    },
  });

  // New today
  const newToday = await prisma.reverseAuction.count({
    where: {
      createdAt: { gte: todayStart },
    },
  });

  // By category
  const byCategory = await prisma.reverseAuction.groupBy({
    by: ['categoryId'],
    where: { status: 'ACTIVE' },
    _count: true,
  });

  // By governorate
  const byGovernorate = await prisma.reverseAuction.groupBy({
    by: ['location'],
    where: { status: 'ACTIVE' },
    _count: true,
  });

  // Average bids per tender
  const avgBids = await prisma.reverseAuction.aggregate({
    where: { status: { in: ['ACTIVE', 'ENDED', 'AWARDED'] } },
    _avg: { totalBids: true },
  });

  return {
    overview: {
      totalActiveTenders: activeTenders,
      totalActiveValue: activeValue._sum.maxBudget || 0,
      closingToday,
      newToday,
    },
    categories: byCategory.reduce((acc, item) => {
      acc[item.categoryId || 'OTHER'] = item._count;
      return acc;
    }, {} as Record<string, number>),
    governorates: byGovernorate.reduce((acc, item) => {
      acc[item.location || 'غير محدد'] = item._count;
      return acc;
    }, {} as Record<string, number>),
    trends: {
      averageBidsPerTender: Math.round((avgBids._avg.totalBids || 0) * 10) / 10,
    },
  };
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Count matching service providers
 */
async function countMatchingProviders(
  category: ServiceCategory,
  governorate: string
): Promise<number> {
  // Count users who have accepted quotes in this category and governorate
  const count = await prisma.user.count({
    where: {
      governorate,
      serviceQuotes: {
        some: {
          status: 'ACCEPTED',
        },
      },
    },
  });

  return count;
}

/**
 * Create contract from accepted quote
 */
async function createContractFromQuote(
  tx: Prisma.TransactionClient,
  request: any,
  quote: any
): Promise<any> {
  const count = await tx.tenderContract.count();
  const referenceNumber = `CON-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

  const contract = await tx.tenderContract.create({
    data: {
      referenceNumber,
      serviceRequestId: request.id,
      quoteId: quote.id,
      buyerId: request.requesterId,
      vendorId: quote.providerId,
      title: request.title,
      description: request.description,
      totalAmount: quote.price,
      currency: 'EGP',
      startDate: quote.availableDate || new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default 30 days
      status: 'PENDING_SIGNATURES',
    },
  });

  return contract;
}

/**
 * Calculate weighted score for bid evaluation
 */
function calculateWeightedScore(
  technicalScore: number,
  financialScore: number,
  criteriaScores: Array<{ criteriaId: string; score: number }>
): number {
  // Default weights: Technical 40%, Financial 30%, Criteria 30%
  const technicalWeight = 0.4;
  const financialWeight = 0.3;
  const criteriaWeight = 0.3;

  const criteriaAvg =
    criteriaScores.length > 0
      ? criteriaScores.reduce((sum, c) => sum + c.score, 0) / criteriaScores.length
      : 0;

  return (
    technicalScore * technicalWeight +
    financialScore * financialWeight +
    criteriaAvg * criteriaWeight
  );
}

/**
 * Get vendor statistics
 */
async function getVendorStatistics(vendorId: string): Promise<any> {
  const wonBids = await prisma.reverseAuctionBid.count({
    where: { sellerId: vendorId, status: 'WON' },
  });

  const totalBids = await prisma.reverseAuctionBid.count({
    where: { sellerId: vendorId },
  });

  const acceptedQuotes = await prisma.serviceQuote.count({
    where: { providerId: vendorId, status: 'ACCEPTED' },
  });

  const completedContracts = await prisma.tenderContract.count({
    where: { vendorId, status: 'COMPLETED' },
  });

  const totalContractValue = await prisma.tenderContract.aggregate({
    where: { vendorId, status: 'COMPLETED' },
    _sum: { totalAmount: true },
  });

  return {
    wonBids,
    totalBids,
    winRate: totalBids > 0 ? Math.round((wonBids / totalBids) * 100) : 0,
    acceptedQuotes,
    completedContracts,
    totalContractValue: totalContractValue._sum.totalAmount || 0,
  };
}
