import {
  RentalContractStatus,
  RentalContractType,
  PropertyStatus,
  InspectionType,
  InspectionStatus,
} from '../types/prisma-enums';
import { Prisma } from '@prisma/client';

// Model types are defined by Prisma - use any for flexibility
/* eslint-disable @typescript-eslint/no-explicit-any */
type RentalContract = any;
type RentalPayment = any;
type Property = any;
type User = any;
type FieldInspection = any;
type RentalDispute = any;
/* eslint-enable @typescript-eslint/no-explicit-any */
import { NotFoundError, BadRequestError, ForbiddenError } from '../utils/errors';
import prisma from '../lib/prisma';
import { randomUUID } from 'crypto';

// ============================================
// Types & Interfaces
// ============================================

interface CreateRentalContractData {
  propertyId: string;
  tenantId: string;
  startDate: Date;
  endDate: Date;
  monthlyRent: number;
  securityDeposit: number;
  annualIncreasePercent?: number;
  protectDeposit?: boolean;
  requireCheckinInspection?: boolean;
  notes?: string;
}

interface DepositDeduction {
  reason: string;
  amount: number;
  evidence?: string;
}

type RentalContractWithRelations = RentalContract & {
  property: Property;
  landlord: Pick<User, 'id' | 'fullName' | 'phone' | 'email' | 'avatar'>;
  tenant: Pick<User, 'id' | 'fullName' | 'phone' | 'email' | 'avatar'>;
  payments: RentalPayment[];
  disputes: RentalDispute[];
};

// ============================================
// Rental Contract Operations
// ============================================

/**
 * Create a new rental contract
 */
export const createRentalContract = async (
  landlordId: string,
  data: CreateRentalContractData
): Promise<any> => {
  // Validate property
  const property = await prisma.property.findUnique({
    where: { id: data.propertyId },
  });

  if (!property) {
    throw new NotFoundError('Property not found');
  }

  if (property.ownerId !== landlordId) {
    throw new ForbiddenError('You do not own this property');
  }

  if (property.status !== PropertyStatus.ACTIVE) {
    throw new BadRequestError('Property is not available for rent');
  }

  if (property.listingType === 'SALE') {
    throw new BadRequestError('Property is listed for sale only, not rent');
  }

  // Validate tenant exists
  const tenant = await prisma.user.findUnique({
    where: { id: data.tenantId },
  });

  if (!tenant) {
    throw new NotFoundError('Tenant not found');
  }

  if (data.tenantId === landlordId) {
    throw new BadRequestError('Landlord cannot be the tenant');
  }

  // Validate dates
  if (new Date(data.startDate) >= new Date(data.endDate)) {
    throw new BadRequestError('End date must be after start date');
  }

  // Generate protection ID if deposit protection is enabled
  const depositProtectionId = data.protectDeposit
    ? `DEP-${new Date().getFullYear()}-${randomUUID().substring(0, 8).toUpperCase()}`
    : null;

  // Create the contract
  const contract = await prisma.rentalContract.create({
    data: {
      propertyId: data.propertyId,
      landlordId,
      tenantId: data.tenantId,
      contractType: RentalContractType.NEW_RENT,
      startDate: data.startDate,
      endDate: data.endDate,
      monthlyRent: data.monthlyRent,
      securityDeposit: data.securityDeposit,
      annualIncreasePercent: data.annualIncreasePercent ?? 7,
      depositProtected: data.protectDeposit ?? false,
      depositProtectionId,
      notes: data.notes,
      status: RentalContractStatus.DRAFT,
    },
    include: {
      property: {
        select: {
          id: true,
          title: true,
          propertyType: true,
          governorate: true,
          city: true,
          district: true,
          areaSqm: true,
          bedrooms: true,
          bathrooms: true,
          images: true,
        },
      },
      landlord: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
        },
      },
      tenant: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
        },
      },
    },
  });

  // Schedule check-in inspection if requested
  let checkinInspection = null;
  if (data.requireCheckinInspection) {
    checkinInspection = await prisma.fieldInspection.create({
      data: {
        propertyId: data.propertyId,
        requestedById: landlordId,
        inspectionType: InspectionType.CHECKIN,
        status: InspectionStatus.REQUESTED,
      },
    });

    await prisma.rentalContract.update({
      where: { id: contract.id },
      data: { checkinInspectionId: checkinInspection.id },
    });
  }

  // Generate payment schedule
  const payments = await generatePaymentSchedule(
    contract.id,
    data.startDate,
    data.endDate,
    data.monthlyRent
  );

  return {
    contract,
    depositProtection: data.protectDeposit
      ? {
          enabled: true,
          protectionId: depositProtectionId,
          escrowAccount: `ESCROW-${contract.id.substring(0, 8)}`,
        }
      : { enabled: false },
    checkinInspection,
    payments,
    nextSteps: [
      data.protectDeposit ? 'إيداع التأمين في حساب Escrow' : 'دفع التأمين للمالك',
      data.requireCheckinInspection ? 'انتظار فحص التسليم' : null,
      'توقيع العقد',
      'استلام المفاتيح',
    ].filter(Boolean),
  };
};

/**
 * Generate payment schedule for a rental contract
 */
async function generatePaymentSchedule(
  contractId: string,
  startDate: Date,
  endDate: Date,
  monthlyRent: number
): Promise<RentalPayment[]> {
  const payments: Array<{ contractId: string; amount: number; dueDate: Date; status: string }> = [];
  const start = new Date(startDate);
  const end = new Date(endDate);

  const currentDate = new Date(start);
  while (currentDate < end) {
    payments.push({
      contractId,
      amount: monthlyRent,
      dueDate: new Date(currentDate),
      status: 'PENDING',
    });
    currentDate.setMonth(currentDate.getMonth() + 1);
  }

  await prisma.rentalPayment.createMany({ data: payments });

  return prisma.rentalPayment.findMany({
    where: { contractId },
    orderBy: { dueDate: 'asc' },
  });
}

/**
 * Get rental contract by ID
 */
export const getRentalContractById = async (
  contractId: string,
  userId: string
): Promise<RentalContractWithRelations> => {
  const contract = await prisma.rentalContract.findUnique({
    where: { id: contractId },
    include: {
      property: true,
      landlord: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          avatar: true,
        },
      },
      tenant: {
        select: {
          id: true,
          fullName: true,
          phone: true,
          email: true,
          avatar: true,
        },
      },
      payments: {
        orderBy: { dueDate: 'asc' },
      },
      disputes: true,
    },
  });

  if (!contract) {
    throw new NotFoundError('Rental contract not found');
  }

  // Check if user is involved
  if (contract.landlordId !== userId && contract.tenantId !== userId) {
    throw new ForbiddenError('You are not involved in this contract');
  }

  return contract;
};

/**
 * Activate rental contract
 */
export const activateContract = async (
  contractId: string,
  userId: string
): Promise<RentalContract> => {
  const contract = await prisma.rentalContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('Rental contract not found');
  }

  if (contract.landlordId !== userId) {
    throw new ForbiddenError('Only the landlord can activate the contract');
  }

  if (contract.status !== RentalContractStatus.DRAFT) {
    throw new BadRequestError('Contract is not in draft status');
  }

  // Update contract and property status
  const [updatedContract] = await prisma.$transaction([
    prisma.rentalContract.update({
      where: { id: contractId },
      data: { status: RentalContractStatus.ACTIVE },
    }),
    prisma.property.update({
      where: { id: contract.propertyId },
      data: { status: PropertyStatus.RENTED },
    }),
  ]);

  return updatedContract;
};

/**
 * Terminate rental contract
 */
export const terminateContract = async (
  contractId: string,
  userId: string,
  reason?: string
): Promise<RentalContract> => {
  const contract = await prisma.rentalContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('Rental contract not found');
  }

  if (contract.landlordId !== userId && contract.tenantId !== userId) {
    throw new ForbiddenError('You are not involved in this contract');
  }

  if (contract.status !== RentalContractStatus.ACTIVE) {
    throw new BadRequestError('Contract is not active');
  }

  // Update contract status
  const updatedContract = await prisma.$transaction([
    prisma.rentalContract.update({
      where: { id: contractId },
      data: {
        status: RentalContractStatus.TERMINATED,
        terminatedAt: new Date(),
        notes: reason ? `${contract.notes || ''}\n\nسبب الإنهاء: ${reason}` : contract.notes,
      },
    }),
    prisma.property.update({
      where: { id: contract.propertyId },
      data: { status: PropertyStatus.ACTIVE },
    }),
  ]);

  return updatedContract[0];
};

// ============================================
// Deposit Protection Operations
// ============================================

/**
 * Protect deposit (enable escrow protection)
 */
export const protectDeposit = async (
  contractId: string,
  userId: string
): Promise<{
  contract: RentalContract;
  depositProtection: {
    protectionId: string;
    escrowAccount: string;
    depositAmount: number;
    protectionFee: number;
    totalToDeposit: number;
  };
  paymentMethods: Array<{ method: string; details?: Record<string, string>; reference?: string; phone?: string }>;
}> => {
  const contract = await prisma.rentalContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('Rental contract not found');
  }

  if (contract.tenantId !== userId) {
    throw new ForbiddenError('Only the tenant can protect their deposit');
  }

  if (contract.depositProtected) {
    throw new BadRequestError('Deposit is already protected');
  }

  const protectionId = `DEP-${new Date().getFullYear()}-${randomUUID().substring(0, 8).toUpperCase()}`;
  const escrowAccount = `ESCROW-${contract.id.substring(0, 8)}`;

  const updatedContract = await prisma.rentalContract.update({
    where: { id: contractId },
    data: {
      depositProtected: true,
      depositProtectionId: protectionId,
      depositEscrowAccount: escrowAccount,
    },
  });

  return {
    contract: updatedContract,
    depositProtection: {
      protectionId,
      escrowAccount,
      depositAmount: contract.securityDeposit,
      protectionFee: contract.securityDeposit * 0.01, // 1% fee
      totalToDeposit: contract.securityDeposit * 1.01,
    },
    paymentMethods: [
      { method: 'bank_transfer', details: { bank: 'بنك مصر', accountNumber: escrowAccount } },
      { method: 'fawry', reference: protectionId },
      { method: 'instapay', phone: '01234567890' },
    ],
  };
};

/**
 * Request deposit return at end of lease
 */
export const requestDepositReturn = async (
  contractId: string,
  userId: string,
  checkoutDate: Date
): Promise<{
  inspectionScheduled: boolean;
  checkoutInspection: FieldInspection;
  depositAmount: number;
  estimatedReleaseDate: Date;
  process: string[];
}> => {
  const contract = await prisma.rentalContract.findUnique({
    where: { id: contractId },
    include: {
      property: true,
    },
  });

  if (!contract) {
    throw new NotFoundError('Rental contract not found');
  }

  if (contract.tenantId !== userId) {
    throw new ForbiddenError('Only the tenant can request deposit return');
  }

  if (!contract.depositProtected) {
    throw new BadRequestError('Deposit is not protected by escrow');
  }

  if (contract.depositReleased) {
    throw new BadRequestError('Deposit has already been released');
  }

  // Create checkout inspection
  const inspection = await prisma.fieldInspection.create({
    data: {
      propertyId: contract.propertyId,
      requestedById: userId,
      inspectionType: InspectionType.CHECKOUT,
      scheduledAt: new Date(checkoutDate),
      status: InspectionStatus.SCHEDULED,
    },
  });

  await prisma.rentalContract.update({
    where: { id: contractId },
    data: { checkoutInspectionId: inspection.id },
  });

  // Calculate estimated release date (14 days after checkout)
  const releaseDate = new Date(checkoutDate);
  releaseDate.setDate(releaseDate.getDate() + 14);

  return {
    inspectionScheduled: true,
    checkoutInspection: inspection,
    depositAmount: contract.securityDeposit,
    estimatedReleaseDate: releaseDate,
    process: [
      'فحص الخروج',
      'تقييم الأضرار (إن وجدت)',
      'موافقة المالك',
      'تحرير المبلغ',
    ],
  };
};

/**
 * Release deposit (by landlord or after dispute resolution)
 */
export const releaseDeposit = async (
  contractId: string,
  userId: string,
  deductions?: DepositDeduction[]
): Promise<{
  contract: RentalContract;
  releaseDetails: {
    originalDeposit: number;
    deductions: DepositDeduction[];
    totalDeductions: number;
    amountReleased: number;
    releasedAt: Date | null;
  };
}> => {
  const contract = await prisma.rentalContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('Rental contract not found');
  }

  if (contract.landlordId !== userId) {
    throw new ForbiddenError('Only the landlord can release the deposit');
  }

  if (!contract.depositProtected) {
    throw new BadRequestError('Deposit is not protected by escrow');
  }

  if (contract.depositReleased) {
    throw new BadRequestError('Deposit has already been released');
  }

  // Calculate total deductions
  const totalDeductions = deductions?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const amountToRelease = contract.securityDeposit - totalDeductions;

  if (amountToRelease < 0) {
    throw new BadRequestError('Deductions cannot exceed deposit amount');
  }

  const updatedContract = await prisma.rentalContract.update({
    where: { id: contractId },
    data: {
      depositReleased: true,
      depositReleasedAt: new Date(),
      depositDeductions: deductions ? JSON.parse(JSON.stringify(deductions)) : [],
    },
  });

  // TODO: Trigger actual fund transfer

  return {
    contract: updatedContract,
    releaseDetails: {
      originalDeposit: contract.securityDeposit,
      deductions: deductions || [],
      totalDeductions,
      amountReleased: amountToRelease,
      releasedAt: updatedContract.depositReleasedAt,
    },
  };
};

/**
 * Dispute deposit deductions
 */
export const disputeDeposit = async (
  contractId: string,
  userId: string,
  disputeData: {
    reason: string;
    description: string;
    disputedAmount: number;
    evidence?: string[];
  }
): Promise<{
  dispute: RentalDispute;
  message: string;
}> => {
  const contract = await prisma.rentalContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('Rental contract not found');
  }

  if (contract.tenantId !== userId) {
    throw new ForbiddenError('Only the tenant can dispute deposit deductions');
  }

  if (!contract.depositProtected) {
    throw new BadRequestError('Deposit is not protected by escrow');
  }

  // Create dispute
  const dispute = await prisma.rentalDispute.create({
    data: {
      contractId,
      reason: disputeData.reason,
      description: disputeData.description,
      disputedAmount: disputeData.disputedAmount,
      evidence: disputeData.evidence || [],
      status: 'OPEN',
    },
  });

  // Update contract status
  await prisma.rentalContract.update({
    where: { id: contractId },
    data: { status: RentalContractStatus.DISPUTED },
  });

  return {
    dispute,
    message: 'تم فتح نزاع بنجاح. سيتم مراجعته خلال 5 أيام عمل.',
  };
};

// ============================================
// Payment Operations
// ============================================

/**
 * Record rental payment
 */
export const recordPayment = async (
  paymentId: string,
  userId: string,
  paymentData: {
    paymentMethod: string;
    paymentReference?: string;
    notes?: string;
  }
): Promise<RentalPayment> => {
  const payment = await prisma.rentalPayment.findUnique({
    where: { id: paymentId },
    include: {
      contract: true,
    },
  });

  if (!payment) {
    throw new NotFoundError('Payment not found');
  }

  // Both landlord and tenant can record payment
  if (
    payment.contract.landlordId !== userId &&
    payment.contract.tenantId !== userId
  ) {
    throw new ForbiddenError('You are not involved in this contract');
  }

  if (payment.status === 'PAID') {
    throw new BadRequestError('Payment has already been recorded');
  }

  return prisma.rentalPayment.update({
    where: { id: paymentId },
    data: {
      status: 'PAID',
      paidDate: new Date(),
      paymentMethod: paymentData.paymentMethod,
      paymentReference: paymentData.paymentReference,
      notes: paymentData.notes,
    },
  });
};

/**
 * Get overdue payments for a contract
 */
export const getOverduePayments = async (
  contractId: string,
  userId: string
): Promise<RentalPayment[]> => {
  const contract = await prisma.rentalContract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new NotFoundError('Rental contract not found');
  }

  if (contract.landlordId !== userId && contract.tenantId !== userId) {
    throw new ForbiddenError('You are not involved in this contract');
  }

  return prisma.rentalPayment.findMany({
    where: {
      contractId,
      status: 'PENDING',
      dueDate: { lt: new Date() },
    },
    orderBy: { dueDate: 'asc' },
  });
};

/**
 * Get user's rental contracts
 */
export const getUserRentalContracts = async (
  userId: string,
  role: 'landlord' | 'tenant' | 'all' = 'all',
  status?: RentalContractStatus
): Promise<Array<RentalContract & {
  property: Pick<Property, 'id' | 'title' | 'propertyType' | 'governorate' | 'city' | 'images'>;
  landlord: Pick<User, 'id' | 'fullName' | 'avatar'>;
  tenant: Pick<User, 'id' | 'fullName' | 'avatar'>;
  _count: { payments: number; disputes: number };
}>> => {
  const where: Record<string, unknown> = {};

  if (role === 'landlord') {
    where.landlordId = userId;
  } else if (role === 'tenant') {
    where.tenantId = userId;
  } else {
    where.OR = [{ landlordId: userId }, { tenantId: userId }];
  }

  if (status) {
    where.status = status;
  }

  return prisma.rentalContract.findMany({
    where: where as any,
    include: {
      property: {
        select: {
          id: true,
          title: true,
          propertyType: true,
          governorate: true,
          city: true,
          images: true,
        },
      },
      landlord: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      tenant: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
        },
      },
      _count: {
        select: {
          payments: true,
          disputes: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export default {
  createRentalContract,
  getRentalContractById,
  activateContract,
  terminateContract,
  protectDeposit,
  requestDepositReturn,
  releaseDeposit,
  disputeDeposit,
  recordPayment,
  getOverduePayments,
  getUserRentalContracts,
};
