/**
 * Silver KYC & Verification Service
 * خدمة التحقق من الهوية لسوق الفضة
 */

import prisma from '../config/database';

// ============================================
// KYC Verification
// ============================================

export interface KYCSubmission {
  idType: 'NATIONAL_ID' | 'PASSPORT';
  idNumber: string;
  idFrontUrl: string;
  idBackUrl?: string;
  selfieUrl: string;
  fullName: string;
  dateOfBirth?: string;
  address?: string;
}

/**
 * Submit KYC verification request
 */
export const submitKYCRequest = async (userId: string, data: KYCSubmission) => {
  // Check if user already has a pending or approved verification
  const existing = await prisma.sellerVerification.findFirst({
    where: {
      userId,
      status: { in: ['PENDING', 'APPROVED'] },
    },
  });

  if (existing?.status === 'APPROVED') {
    throw new Error('User already verified');
  }

  if (existing?.status === 'PENDING') {
    throw new Error('Verification request already pending');
  }

  // Create new verification request
  const verification = await prisma.sellerVerification.create({
    data: {
      userId,
      currentLevel: 'UNVERIFIED',
      requestedLevel: 'VERIFIED',
      status: 'PENDING',
      idType: data.idType,
      idNumber: data.idNumber,
      idFrontUrl: data.idFrontUrl,
      idBackUrl: data.idBackUrl,
      selfieUrl: data.selfieUrl,
      documents: {
        fullName: data.fullName,
        dateOfBirth: data.dateOfBirth,
        address: data.address,
        submittedAt: new Date().toISOString(),
      },
    },
  });

  return verification;
};

/**
 * Get user's KYC status
 */
export const getKYCStatus = async (userId: string) => {
  const verification = await prisma.sellerVerification.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!verification) {
    return {
      status: 'NOT_SUBMITTED',
      level: 'UNVERIFIED',
      canSubmit: true,
    };
  }

  return {
    id: verification.id,
    status: verification.status,
    level: verification.currentLevel,
    requestedLevel: verification.requestedLevel,
    submittedAt: verification.createdAt,
    reviewedAt: verification.reviewedAt,
    rejectionReason: verification.rejectionReason,
    validUntil: verification.validUntil,
    canSubmit: verification.status === 'REJECTED' || verification.status === 'EXPIRED',
  };
};

/**
 * Get user's verification badges
 */
export const getUserBadges = async (userId: string) => {
  const badges = await prisma.verificationBadge.findMany({
    where: { userId, isActive: true },
  });

  return badges;
};

// ============================================
// Admin KYC Management
// ============================================

/**
 * Get pending KYC requests (admin)
 */
export const getPendingKYCRequests = async (page = 1, limit = 20) => {
  const [requests, total] = await Promise.all([
    prisma.sellerVerification.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.sellerVerification.count({ where: { status: 'PENDING' } }),
  ]);

  return {
    requests,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Approve KYC request (admin)
 */
export const approveKYCRequest = async (
  verificationId: string,
  adminId: string,
  notes?: string
) => {
  const verification = await prisma.sellerVerification.update({
    where: { id: verificationId },
    data: {
      status: 'APPROVED',
      currentLevel: 'VERIFIED',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      reviewNotes: notes,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
    },
  });

  // Award verification badge
  await prisma.verificationBadge.upsert({
    where: {
      userId_badgeType: {
        userId: verification.userId,
        badgeType: 'ID_VERIFIED',
      },
    },
    update: {
      isActive: true,
      earnedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
    create: {
      userId: verification.userId,
      badgeType: 'ID_VERIFIED',
      badgeName: 'Identity Verified',
      badgeNameAr: 'هوية موثقة',
      badgeIcon: '✓',
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    },
  });

  return verification;
};

/**
 * Reject KYC request (admin)
 */
export const rejectKYCRequest = async (
  verificationId: string,
  adminId: string,
  reason: string
) => {
  const verification = await prisma.sellerVerification.update({
    where: { id: verificationId },
    data: {
      status: 'REJECTED',
      reviewedAt: new Date(),
      reviewedBy: adminId,
      rejectionReason: reason,
    },
  });

  return verification;
};
