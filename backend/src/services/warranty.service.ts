/**
 * Warranty & Insurance Service
 * خدمة الضمان والتأمين
 *
 * Product protection features:
 * - Seller warranties
 * - Platform warranties
 * - Extended warranties
 * - Claim management
 */

import prisma from '../config/database';
import { WarrantyType, WarrantyStatus, WarrantyClaimStatus } from '@prisma/client';

// ============================================
// Types
// ============================================

interface CreateWarrantyParams {
  transactionId: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  warrantyType: WarrantyType;
  title: string;
  description?: string;
  coverageDetails: CoverageDetails;
  exclusions?: string[];
  maxClaimValue?: number;
  durationMonths: number;
  price?: number;
}

interface CoverageDetails {
  defects: boolean;
  malfunctions: boolean;
  accidentalDamage: boolean;
  theft: boolean;
  naturalDisaster: boolean;
  customItems?: string[];
}

interface CreateClaimParams {
  warrantyId: string;
  claimantId: string;
  issueType: 'DEFECT' | 'MALFUNCTION' | 'DAMAGE' | 'OTHER';
  issueDescription: string;
  evidenceUrls: string[];
}

interface WarrantyPackage {
  id: string;
  name: string;
  nameAr: string;
  type: WarrantyType;
  durationMonths: number;
  price: number;
  pricePercentage: number; // % of item price
  coverage: CoverageDetails;
  maxClaimValue: number | null;
  maxClaims: number;
}

// ============================================
// Default Warranty Packages
// ============================================

const WARRANTY_PACKAGES: Omit<WarrantyPackage, 'id'>[] = [
  {
    name: 'Basic Protection',
    nameAr: 'الحماية الأساسية',
    type: 'PLATFORM_WARRANTY',
    durationMonths: 3,
    price: 0, // Free
    pricePercentage: 0,
    coverage: {
      defects: true,
      malfunctions: true,
      accidentalDamage: false,
      theft: false,
      naturalDisaster: false,
    },
    maxClaimValue: null,
    maxClaims: 1,
  },
  {
    name: 'Standard Protection',
    nameAr: 'الحماية القياسية',
    type: 'EXTENDED_WARRANTY',
    durationMonths: 6,
    price: 99,
    pricePercentage: 3,
    coverage: {
      defects: true,
      malfunctions: true,
      accidentalDamage: true,
      theft: false,
      naturalDisaster: false,
    },
    maxClaimValue: null,
    maxClaims: 2,
  },
  {
    name: 'Premium Protection',
    nameAr: 'الحماية المميزة',
    type: 'EXTENDED_WARRANTY',
    durationMonths: 12,
    price: 199,
    pricePercentage: 5,
    coverage: {
      defects: true,
      malfunctions: true,
      accidentalDamage: true,
      theft: true,
      naturalDisaster: true,
    },
    maxClaimValue: null,
    maxClaims: 3,
  },
  {
    name: 'Full Insurance',
    nameAr: 'التأمين الشامل',
    type: 'INSURANCE',
    durationMonths: 12,
    price: 349,
    pricePercentage: 8,
    coverage: {
      defects: true,
      malfunctions: true,
      accidentalDamage: true,
      theft: true,
      naturalDisaster: true,
    },
    maxClaimValue: null,
    maxClaims: 5,
  },
];

// ============================================
// Warranty Management
// ============================================

/**
 * Get available warranty packages for an item
 */
export function getWarrantyPackages(itemPrice: number): WarrantyPackage[] {
  return WARRANTY_PACKAGES.map((pkg, index) => ({
    ...pkg,
    id: `pkg_${index}`,
    price: pkg.price > 0
      ? Math.max(pkg.price, Math.round(itemPrice * (pkg.pricePercentage / 100)))
      : 0,
    maxClaimValue: pkg.maxClaimValue || itemPrice,
  }));
}

/**
 * Create a warranty
 */
export async function createWarranty(params: CreateWarrantyParams) {
  const {
    transactionId,
    itemId,
    buyerId,
    sellerId,
    warrantyType,
    title,
    description,
    coverageDetails,
    exclusions = [],
    maxClaimValue,
    durationMonths,
    price = 0,
  } = params;

  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + durationMonths);

  return prisma.warranty.create({
    data: {
      transactionId,
      itemId,
      buyerId,
      sellerId,
      warrantyType,
      title,
      description,
      coverageDetails: JSON.parse(JSON.stringify(coverageDetails)),
      exclusions,
      maxClaimValue,
      durationMonths,
      startDate,
      endDate,
      price,
      isPaid: price === 0,
      status: 'ACTIVE',
    },
  });
}

/**
 * Create seller warranty (default 7 days)
 */
export async function createSellerWarranty(
  transactionId: string,
  itemId: string,
  buyerId: string,
  sellerId: string,
  durationDays: number = 7
) {
  const durationMonths = Math.ceil(durationDays / 30);

  return createWarranty({
    transactionId,
    itemId,
    buyerId,
    sellerId,
    warrantyType: 'SELLER_WARRANTY',
    title: 'ضمان البائع',
    description: `ضمان من البائع لمدة ${durationDays} يوم`,
    coverageDetails: {
      defects: true,
      malfunctions: true,
      accidentalDamage: false,
      theft: false,
      naturalDisaster: false,
    },
    durationMonths,
    price: 0,
  });
}

/**
 * Purchase extended warranty
 */
export async function purchaseExtendedWarranty(
  transactionId: string,
  itemId: string,
  buyerId: string,
  sellerId: string,
  packageId: string,
  itemPrice: number
) {
  const packages = getWarrantyPackages(itemPrice);
  const pkg = packages.find(p => p.id === packageId);

  if (!pkg) {
    throw new Error('Warranty package not found');
  }

  return createWarranty({
    transactionId,
    itemId,
    buyerId,
    sellerId,
    warrantyType: pkg.type,
    title: pkg.nameAr,
    coverageDetails: pkg.coverage,
    maxClaimValue: pkg.maxClaimValue || undefined,
    durationMonths: pkg.durationMonths,
    price: pkg.price,
  });
}

/**
 * Get warranty by ID
 */
export async function getWarranty(warrantyId: string) {
  return prisma.warranty.findUnique({
    where: { id: warrantyId },
    include: {
      claims: true,
    },
  });
}

/**
 * Get warranties for a user (as buyer)
 */
export async function getUserWarranties(userId: string) {
  return prisma.warranty.findMany({
    where: { buyerId: userId },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get active warranties
 */
export async function getActiveWarranties(userId: string) {
  return prisma.warranty.findMany({
    where: {
      buyerId: userId,
      status: 'ACTIVE',
      endDate: { gt: new Date() },
    },
    orderBy: { endDate: 'asc' },
  });
}

/**
 * Check warranty validity
 */
export async function checkWarrantyValidity(
  warrantyId: string
): Promise<{
  isValid: boolean;
  reason?: string;
  daysRemaining?: number;
  claimsRemaining?: number;
}> {
  const warranty = await prisma.warranty.findUnique({
    where: { id: warrantyId },
  });

  if (!warranty) {
    return { isValid: false, reason: 'Warranty not found' };
  }

  if (warranty.status !== 'ACTIVE') {
    return { isValid: false, reason: `Warranty is ${warranty.status.toLowerCase()}` };
  }

  if (new Date() > warranty.endDate) {
    return { isValid: false, reason: 'Warranty has expired' };
  }

  if (warranty.claimsCount >= warranty.maxClaims) {
    return { isValid: false, reason: 'Maximum claims reached' };
  }

  const daysRemaining = Math.ceil(
    (warranty.endDate.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
  );

  return {
    isValid: true,
    daysRemaining,
    claimsRemaining: warranty.maxClaims - warranty.claimsCount,
  };
}

// ============================================
// Claims Management
// ============================================

/**
 * File a warranty claim
 */
export async function fileClaim(params: CreateClaimParams) {
  const { warrantyId, claimantId, issueType, issueDescription, evidenceUrls } = params;

  // Validate warranty
  const validity = await checkWarrantyValidity(warrantyId);
  if (!validity.isValid) {
    throw new Error(validity.reason);
  }

  const warranty = await prisma.warranty.findUnique({
    where: { id: warrantyId },
  });

  if (!warranty) {
    throw new Error('Warranty not found');
  }

  // Check claimant is the buyer
  if (warranty.buyerId !== claimantId) {
    throw new Error('Only warranty holder can file claims');
  }

  // Check coverage
  const coverage = warranty.coverageDetails as unknown as CoverageDetails;
  const issueTypeMap: Record<string, keyof CoverageDetails> = {
    'DEFECT': 'defects',
    'MALFUNCTION': 'malfunctions',
    'DAMAGE': 'accidentalDamage',
  };

  const coverageKey = issueTypeMap[issueType];
  if (coverageKey && !coverage[coverageKey]) {
    throw new Error(`This issue type is not covered under your warranty`);
  }

  // Create claim
  const [claim] = await prisma.$transaction([
    prisma.warrantyClaim.create({
      data: {
        warrantyId,
        claimantId,
        issueType,
        issueDescription,
        evidenceUrls,
        status: 'PENDING',
      },
    }),
    prisma.warranty.update({
      where: { id: warrantyId },
      data: {
        claimsCount: { increment: 1 },
      },
    }),
  ]);

  return claim;
}

/**
 * Get claim by ID
 */
export async function getClaim(claimId: string) {
  return prisma.warrantyClaim.findUnique({
    where: { id: claimId },
    include: {
      warranty: true,
    },
  });
}

/**
 * Get user's claims
 */
export async function getUserClaims(userId: string) {
  return prisma.warrantyClaim.findMany({
    where: { claimantId: userId },
    include: {
      warranty: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Approve claim
 */
export async function approveClaim(
  claimId: string,
  resolverId: string,
  resolutionType: 'REPAIR' | 'REPLACE' | 'REFUND',
  notes?: string
) {
  return prisma.warrantyClaim.update({
    where: { id: claimId },
    data: {
      status: 'APPROVED',
      resolutionType,
      resolutionNotes: notes,
      resolvedBy: resolverId,
    },
  });
}

/**
 * Reject claim
 */
export async function rejectClaim(
  claimId: string,
  resolverId: string,
  reason: string
) {
  return prisma.warrantyClaim.update({
    where: { id: claimId },
    data: {
      status: 'REJECTED',
      resolutionNotes: reason,
      resolvedBy: resolverId,
      resolvedAt: new Date(),
    },
  });
}

/**
 * Complete claim resolution
 */
export async function completeClaim(
  claimId: string,
  resolverId: string,
  options?: {
    refundAmount?: number;
    replacementItemId?: string;
  }
) {
  const claim = await prisma.warrantyClaim.findUnique({
    where: { id: claimId },
  });

  if (!claim) {
    throw new Error('Claim not found');
  }

  let finalStatus: WarrantyClaimStatus = 'CLOSED';
  if (claim.resolutionType === 'REFUND') {
    finalStatus = 'REFUNDED';
  } else if (claim.resolutionType === 'REPLACE') {
    finalStatus = 'REPLACED';
  }

  return prisma.warrantyClaim.update({
    where: { id: claimId },
    data: {
      status: finalStatus,
      resolvedAt: new Date(),
      resolvedBy: resolverId,
      refundAmount: options?.refundAmount,
      replacementItemId: options?.replacementItemId,
    },
  });
}

/**
 * Add message to claim
 */
export async function addClaimMessage(
  claimId: string,
  senderId: string,
  message: string
) {
  const claim = await prisma.warrantyClaim.findUnique({
    where: { id: claimId },
  });

  if (!claim) {
    throw new Error('Claim not found');
  }

  const messages = (claim.messages as any[]) || [];
  messages.push({
    senderId,
    message,
    timestamp: new Date().toISOString(),
  });

  return prisma.warrantyClaim.update({
    where: { id: claimId },
    data: { messages },
  });
}

// ============================================
// Status Management
// ============================================

/**
 * Expire old warranties
 */
export async function expireWarranties() {
  const result = await prisma.warranty.updateMany({
    where: {
      status: 'ACTIVE',
      endDate: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });

  return result.count;
}

/**
 * Void a warranty
 */
export async function voidWarranty(warrantyId: string, reason: string) {
  return prisma.warranty.update({
    where: { id: warrantyId },
    data: {
      status: 'VOIDED',
      // Could add voidReason field
    },
  });
}

// ============================================
// Statistics
// ============================================

/**
 * Get warranty statistics
 */
export async function getWarrantyStats() {
  const [
    totalWarranties,
    activeWarranties,
    totalClaims,
    pendingClaims,
    approvedClaims,
  ] = await Promise.all([
    prisma.warranty.count(),
    prisma.warranty.count({ where: { status: 'ACTIVE' } }),
    prisma.warrantyClaim.count(),
    prisma.warrantyClaim.count({ where: { status: 'PENDING' } }),
    prisma.warrantyClaim.count({ where: { status: 'APPROVED' } }),
  ]);

  const claimApprovalRate = totalClaims > 0
    ? (approvedClaims / totalClaims) * 100
    : 0;

  return {
    totalWarranties,
    activeWarranties,
    totalClaims,
    pendingClaims,
    approvedClaims,
    claimApprovalRate,
  };
}
