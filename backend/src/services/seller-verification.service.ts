/**
 * Seller Verification Service
 * خدمة التحقق من البائعين
 *
 * Multi-level seller verification:
 * - Identity verification
 * - Business verification
 * - Address verification
 * - Badge management
 */

import prisma from '../lib/prisma';
import { VerificationLevel, VerificationStatus } from '../types/prisma-enums';

// ============================================
// Types
// ============================================

interface VerificationRequest {
  userId: string;
  requestedLevel: VerificationLevel;
  documents: DocumentInfo[];
  idType?: 'NATIONAL_ID' | 'PASSPORT';
  idNumber?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  selfieUrl?: string;
  businessName?: string;
  commercialRegNo?: string;
  taxId?: string;
  businessDocUrl?: string;
  addressProofUrl?: string;
}

interface DocumentInfo {
  type: string;
  url: string;
  uploadedAt: string;
}

interface VerificationResult {
  success: boolean;
  verificationId?: string;
  message: string;
  messageAr: string;
  estimatedDays?: number;
}

interface BadgeInfo {
  type: string;
  name: string;
  nameAr: string;
  icon: string;
  earnedAt: Date;
  expiresAt?: Date;
}

// ============================================
// Verification Level Configuration
// ============================================

const LEVEL_CONFIG: Record<VerificationLevel, {
  name: string;
  nameAr: string;
  requirements: string[];
  benefits: string[];
  validityMonths: number | null;
}> = {
  NONE: {
    name: 'None',
    nameAr: 'بدون توثيق',
    requirements: [],
    benefits: [],
    validityMonths: null,
  },
  UNVERIFIED: {
    name: 'Unverified',
    nameAr: 'غير موثق',
    requirements: [],
    benefits: ['Basic listing'],
    validityMonths: null,
  },
  EMAIL: {
    name: 'Email Verified',
    nameAr: 'موثق البريد الإلكتروني',
    requirements: ['Verified email'],
    benefits: ['Email verification badge'],
    validityMonths: null,
  },
  PHONE: {
    name: 'Phone Verified',
    nameAr: 'موثق الهاتف',
    requirements: ['Verified phone'],
    benefits: ['Phone verification badge'],
    validityMonths: null,
  },
  BASIC: {
    name: 'Basic Verified',
    nameAr: 'موثق أساسي',
    requirements: ['Verified email', 'Verified phone'],
    benefits: ['More listings', 'Basic badge'],
    validityMonths: null,
  },
  ID: {
    name: 'ID Verified',
    nameAr: 'موثق الهوية',
    requirements: ['National ID or Passport', 'Selfie verification'],
    benefits: ['ID verification badge', 'Higher trust'],
    validityMonths: 24,
  },
  VERIFIED: {
    name: 'Verified',
    nameAr: 'موثق',
    requirements: ['National ID or Passport', 'Selfie verification'],
    benefits: ['Verified badge', 'Higher trust', 'Priority support'],
    validityMonths: 24,
  },
  BUSINESS: {
    name: 'Business Verified',
    nameAr: 'موثق تجاري',
    requirements: ['Commercial registration', 'Tax ID', 'Business address'],
    benefits: ['Business badge', 'Unlimited listings', 'Analytics'],
    validityMonths: 12,
  },
  PREMIUM: {
    name: 'Premium Verified',
    nameAr: 'موثق مميز',
    requirements: ['Full background check', 'In-person verification'],
    benefits: ['Premium badge', 'Featured placement', 'Dedicated support'],
    validityMonths: 12,
  },
  TRUSTED: {
    name: 'Trusted Partner',
    nameAr: 'شريك موثوق',
    requirements: ['Platform partnership agreement', 'Performance review'],
    benefits: ['Trusted badge', 'Exclusive features', 'Revenue sharing'],
    validityMonths: 12,
  },
  FULL: {
    name: 'Fully Verified',
    nameAr: 'موثق بالكامل',
    requirements: ['All verifications complete'],
    benefits: ['Full verification badge', 'Maximum trust'],
    validityMonths: 24,
  },
};

// ============================================
// Verification Requests
// ============================================

/**
 * Get level requirements
 */
export function getLevelRequirements(level: VerificationLevel) {
  return LEVEL_CONFIG[level];
}

/**
 * Get all levels with requirements
 */
export function getAllLevels() {
  return Object.entries(LEVEL_CONFIG).map(([level, config]) => ({
    level: level as VerificationLevel,
    ...config,
  }));
}

/**
 * Submit verification request
 */
export async function submitVerificationRequest(
  request: VerificationRequest
): Promise<VerificationResult> {
  const {
    userId,
    requestedLevel,
    documents,
    idType,
    idNumber,
    idFrontUrl,
    idBackUrl,
    selfieUrl,
    businessName,
    commercialRegNo,
    taxId,
    businessDocUrl,
    addressProofUrl,
  } = request;

  // Check if user already has pending request
  const existingRequest = await prisma.sellerVerification.findFirst({
    where: {
      userId,
      status: 'PENDING',
    },
  });

  if (existingRequest) {
    return {
      success: false,
      message: 'You already have a pending verification request',
      messageAr: 'لديك طلب توثيق قيد المراجعة بالفعل',
    };
  }

  // Get current level
  const currentVerification = await prisma.sellerVerification.findFirst({
    where: {
      userId,
      status: 'APPROVED',
    },
    orderBy: { currentLevel: 'desc' },
  });

  const currentLevel = currentVerification?.currentLevel || 'UNVERIFIED';

  // Validate level progression
  const levelOrder: VerificationLevel[] = [
    'UNVERIFIED', 'BASIC', 'VERIFIED', 'BUSINESS', 'PREMIUM', 'TRUSTED'
  ];
  const currentIndex = levelOrder.indexOf(currentLevel);
  const requestedIndex = levelOrder.indexOf(requestedLevel);

  if (requestedIndex <= currentIndex) {
    return {
      success: false,
      message: 'Cannot request same or lower verification level',
      messageAr: 'لا يمكن طلب نفس المستوى أو مستوى أقل',
    };
  }

  // Validate required documents
  const validation = validateDocuments(requestedLevel, {
    idType, idFrontUrl, idBackUrl, selfieUrl,
    businessName, commercialRegNo, taxId, businessDocUrl,
    addressProofUrl,
  });

  if (!validation.valid) {
    return {
      success: false,
      message: validation.message,
      messageAr: validation.messageAr,
    };
  }

  // Create verification request
  const verification = await prisma.sellerVerification.create({
    data: {
      userId,
      currentLevel,
      requestedLevel,
      status: 'PENDING',
      documents: JSON.parse(JSON.stringify(documents)),
      idType,
      idNumber,
      idFrontUrl,
      idBackUrl,
      selfieUrl,
      businessName,
      commercialRegNo,
      taxId,
      businessDocUrl,
      addressProofUrl,
    },
  });

  const estimatedDays = requestedLevel === 'TRUSTED' ? 7 :
                         requestedLevel === 'PREMIUM' ? 5 :
                         requestedLevel === 'BUSINESS' ? 3 : 1;

  return {
    success: true,
    verificationId: verification.id,
    message: 'Verification request submitted successfully',
    messageAr: 'تم تقديم طلب التوثيق بنجاح',
    estimatedDays,
  };
}

/**
 * Validate documents for requested level
 */
function validateDocuments(
  level: VerificationLevel,
  docs: {
    idType?: string;
    idFrontUrl?: string;
    idBackUrl?: string;
    selfieUrl?: string;
    businessName?: string;
    commercialRegNo?: string;
    taxId?: string;
    businessDocUrl?: string;
    addressProofUrl?: string;
  }
): { valid: boolean; message: string; messageAr: string } {
  switch (level) {
    case 'VERIFIED':
      if (!docs.idType || !docs.idFrontUrl || !docs.idBackUrl) {
        return {
          valid: false,
          message: 'ID front and back photos are required',
          messageAr: 'صور الهوية الأمامية والخلفية مطلوبة',
        };
      }
      if (!docs.selfieUrl) {
        return {
          valid: false,
          message: 'Selfie verification photo is required',
          messageAr: 'صورة التحقق الشخصية مطلوبة',
        };
      }
      break;

    case 'BUSINESS':
      if (!docs.businessName || !docs.commercialRegNo) {
        return {
          valid: false,
          message: 'Business name and commercial registration are required',
          messageAr: 'اسم الشركة والسجل التجاري مطلوبان',
        };
      }
      if (!docs.businessDocUrl) {
        return {
          valid: false,
          message: 'Business registration document is required',
          messageAr: 'وثيقة السجل التجاري مطلوبة',
        };
      }
      break;

    case 'PREMIUM':
    case 'TRUSTED':
      if (!docs.addressProofUrl) {
        return {
          valid: false,
          message: 'Address proof is required',
          messageAr: 'إثبات العنوان مطلوب',
        };
      }
      break;
  }

  return { valid: true, message: '', messageAr: '' };
}

/**
 * Get user's verification status
 */
export async function getUserVerificationStatus(userId: string) {
  const verifications = await prisma.sellerVerification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  const approved = verifications.find(v => v.status === 'APPROVED');
  const pending = verifications.find(v => v.status === 'PENDING');

  const badges = await prisma.verificationBadge.findMany({
    where: { userId, isActive: true },
  });

  return {
    currentLevel: approved?.currentLevel || 'UNVERIFIED',
    pendingRequest: pending ? {
      id: pending.id,
      requestedLevel: pending.requestedLevel,
      submittedAt: pending.createdAt,
    } : null,
    validUntil: approved?.validUntil,
    badges: badges.map(b => ({
      type: b.badgeType,
      name: b.badgeName,
      nameAr: b.badgeNameAr,
      icon: b.badgeIcon,
      earnedAt: b.earnedAt,
      expiresAt: b.expiresAt,
    })),
    history: verifications.map(v => ({
      id: v.id,
      level: v.requestedLevel,
      status: v.status,
      submittedAt: v.createdAt,
      reviewedAt: v.reviewedAt,
    })),
  };
}

/**
 * Get pending verification requests (admin)
 */
export async function getPendingRequests(options?: {
  limit?: number;
  offset?: number;
  level?: VerificationLevel;
}) {
  const { limit = 20, offset = 0, level } = options || {};

  return prisma.sellerVerification.findMany({
    where: {
      status: 'PENDING',
      ...(level && { requestedLevel: level }),
    },
    orderBy: { createdAt: 'asc' },
    take: limit,
    skip: offset,
  });
}

// ============================================
// Verification Review (Admin)
// ============================================

/**
 * Approve verification request
 */
export async function approveVerification(
  verificationId: string,
  reviewerId: string,
  notes?: string
) {
  const verification = await prisma.sellerVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('Verification request not found');
  }

  if (verification.status !== 'PENDING') {
    throw new Error('Request is not pending');
  }

  const config = LEVEL_CONFIG[verification.requestedLevel];
  const validFrom = new Date();
  const validUntil = config.validityMonths
    ? new Date(validFrom.getTime() + config.validityMonths * 30 * 24 * 60 * 60 * 1000)
    : null;

  // Update verification
  const updated = await prisma.sellerVerification.update({
    where: { id: verificationId },
    data: {
      status: 'APPROVED',
      currentLevel: verification.requestedLevel,
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      reviewNotes: notes,
      validFrom,
      validUntil,
    },
  });

  // Award badges
  await awardVerificationBadges(verification.userId, verification.requestedLevel);

  return updated;
}

/**
 * Reject verification request
 */
export async function rejectVerification(
  verificationId: string,
  reviewerId: string,
  reason: string
) {
  const verification = await prisma.sellerVerification.findUnique({
    where: { id: verificationId },
  });

  if (!verification) {
    throw new Error('Verification request not found');
  }

  return prisma.sellerVerification.update({
    where: { id: verificationId },
    data: {
      status: 'REJECTED',
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      rejectionReason: reason,
    },
  });
}

/**
 * Revoke verification
 */
export async function revokeVerification(
  userId: string,
  reviewerId: string,
  reason: string
) {
  // Revoke all approved verifications
  await prisma.sellerVerification.updateMany({
    where: {
      userId,
      status: 'APPROVED',
    },
    data: {
      status: 'REVOKED',
      reviewedAt: new Date(),
      reviewedBy: reviewerId,
      reviewNotes: reason,
    },
  });

  // Deactivate all badges
  await prisma.verificationBadge.updateMany({
    where: { userId },
    data: { isActive: false },
  });

  return { success: true };
}

// ============================================
// Badge Management
// ============================================

const BADGES: Record<string, Omit<BadgeInfo, 'earnedAt' | 'expiresAt'>> = {
  EMAIL_VERIFIED: {
    type: 'EMAIL_VERIFIED',
    name: 'Email Verified',
    nameAr: 'البريد موثق',
    icon: '✉️',
  },
  PHONE_VERIFIED: {
    type: 'PHONE_VERIFIED',
    name: 'Phone Verified',
    nameAr: 'الهاتف موثق',
    icon: '📱',
  },
  ID_VERIFIED: {
    type: 'ID_VERIFIED',
    name: 'ID Verified',
    nameAr: 'الهوية موثقة',
    icon: '🪪',
  },
  BUSINESS_VERIFIED: {
    type: 'BUSINESS_VERIFIED',
    name: 'Business Verified',
    nameAr: 'تجاري موثق',
    icon: '🏢',
  },
  PREMIUM_SELLER: {
    type: 'PREMIUM_SELLER',
    name: 'Premium Seller',
    nameAr: 'بائع مميز',
    icon: '⭐',
  },
  TRUSTED_PARTNER: {
    type: 'TRUSTED_PARTNER',
    name: 'Trusted Partner',
    nameAr: 'شريك موثوق',
    icon: '🤝',
  },
  TOP_RATED: {
    type: 'TOP_RATED',
    name: 'Top Rated',
    nameAr: 'الأعلى تقييماً',
    icon: '🏆',
  },
  FAST_RESPONDER: {
    type: 'FAST_RESPONDER',
    name: 'Fast Responder',
    nameAr: 'سريع الرد',
    icon: '⚡',
  },
};

/**
 * Award verification badges
 */
async function awardVerificationBadges(
  userId: string,
  level: VerificationLevel
) {
  const badgesToAward: string[] = [];

  switch (level) {
    case 'TRUSTED':
      badgesToAward.push('TRUSTED_PARTNER');
    // Fall through
    case 'PREMIUM':
      badgesToAward.push('PREMIUM_SELLER');
    // Fall through
    case 'BUSINESS':
      badgesToAward.push('BUSINESS_VERIFIED');
    // Fall through
    case 'VERIFIED':
      badgesToAward.push('ID_VERIFIED');
    // Fall through
    case 'BASIC':
      badgesToAward.push('EMAIL_VERIFIED', 'PHONE_VERIFIED');
      break;
  }

  for (const badgeType of badgesToAward) {
    const badge = BADGES[badgeType];
    if (!badge) continue;

    await prisma.verificationBadge.upsert({
      where: {
        userId_badgeType: { userId, badgeType },
      },
      update: {
        isActive: true,
        earnedAt: new Date(),
      },
      create: {
        userId,
        badgeType,
        badgeName: badge.name,
        badgeNameAr: badge.nameAr,
        badgeIcon: badge.icon,
      },
    });
  }
}

/**
 * Award special badge
 */
export async function awardBadge(
  userId: string,
  badgeType: string,
  expiresAt?: Date
) {
  const badge = BADGES[badgeType];
  if (!badge) {
    throw new Error('Unknown badge type');
  }

  return prisma.verificationBadge.upsert({
    where: {
      userId_badgeType: { userId, badgeType },
    },
    update: {
      isActive: true,
      earnedAt: new Date(),
      expiresAt,
    },
    create: {
      userId,
      badgeType,
      badgeName: badge.name,
      badgeNameAr: badge.nameAr,
      badgeIcon: badge.icon,
      expiresAt,
    },
  });
}

/**
 * Get user's badges
 */
export async function getUserBadges(userId: string): Promise<BadgeInfo[]> {
  const badges = await prisma.verificationBadge.findMany({
    where: {
      userId,
      isActive: true,
      OR: [
        { expiresAt: null },
        { expiresAt: { gt: new Date() } },
      ],
    },
  });

  return badges.map(b => ({
    type: b.badgeType,
    name: b.badgeName,
    nameAr: b.badgeNameAr,
    icon: b.badgeIcon || '',
    earnedAt: b.earnedAt,
    expiresAt: b.expiresAt || undefined,
  }));
}

// ============================================
// Maintenance
// ============================================

/**
 * Expire old verifications
 */
export async function expireVerifications() {
  const expired = await prisma.sellerVerification.updateMany({
    where: {
      status: 'APPROVED',
      validUntil: { lt: new Date() },
    },
    data: { status: 'EXPIRED' },
  });

  return expired.count;
}

/**
 * Expire old badges
 */
export async function expireBadges() {
  const expired = await prisma.verificationBadge.updateMany({
    where: {
      isActive: true,
      expiresAt: { lt: new Date() },
    },
    data: { isActive: false },
  });

  return expired.count;
}

/**
 * Run scheduled maintenance
 */
export async function runMaintenance() {
  const [expiredVerifications, expiredBadges] = await Promise.all([
    expireVerifications(),
    expireBadges(),
  ]);

  return {
    expiredVerifications,
    expiredBadges,
  };
}
