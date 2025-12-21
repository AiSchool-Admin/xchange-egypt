import prisma from '../lib/prisma';
import { NotFoundError, BadRequestError } from '../utils/errors';
import { BadgeType } from '../types';

// ============================================
// User Badge Service
// خدمة شارات التحقق
// ============================================

interface BadgeInfo {
  type: string;
  nameAr: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
  requirements: string[];
}

// Badge configurations
const BADGE_CONFIG: Record<string, BadgeInfo> = {
  PHONE_VERIFIED: {
    type: 'PHONE_VERIFIED',
    nameAr: 'رقم الهاتف موثق',
    nameEn: 'Phone Verified',
    description: 'تم التحقق من رقم الهاتف',
    icon: '📱',
    color: '#10B981',
    requirements: ['التحقق من رقم الهاتف عبر OTP'],
  },
  EMAIL_VERIFIED: {
    type: 'EMAIL_VERIFIED',
    nameAr: 'البريد الإلكتروني موثق',
    nameEn: 'Email Verified',
    description: 'تم التحقق من البريد الإلكتروني',
    icon: '📧',
    color: '#3B82F6',
    requirements: ['التحقق من البريد الإلكتروني'],
  },
  ID_VERIFIED: {
    type: 'ID_VERIFIED',
    nameAr: 'الهوية موثقة',
    nameEn: 'ID Verified',
    description: 'تم التحقق من الهوية الوطنية',
    icon: '🪪',
    color: '#8B5CF6',
    requirements: ['رفع صورة البطاقة الشخصية', 'مراجعة من قبل الإدارة'],
  },
  ADDRESS_VERIFIED: {
    type: 'ADDRESS_VERIFIED',
    nameAr: 'العنوان موثق',
    nameEn: 'Address Verified',
    description: 'تم التحقق من العنوان',
    icon: '📍',
    color: '#F59E0B',
    requirements: ['رفع فاتورة خدمات حديثة', 'مراجعة من قبل الإدارة'],
  },
  BUSINESS_VERIFIED: {
    type: 'BUSINESS_VERIFIED',
    nameAr: 'نشاط تجاري موثق',
    nameEn: 'Business Verified',
    description: 'تم التحقق من السجل التجاري',
    icon: '🏢',
    color: '#6366F1',
    requirements: ['رفع السجل التجاري', 'رفع البطاقة الضريبية', 'مراجعة من قبل الإدارة'],
  },
  TRUSTED_SELLER: {
    type: 'TRUSTED_SELLER',
    nameAr: 'بائع موثوق',
    nameEn: 'Trusted Seller',
    description: 'بائع أتم 10 معاملات ناجحة على الأقل',
    icon: '⭐',
    color: '#EAB308',
    requirements: ['إتمام 10 معاملات ناجحة', 'تقييم 4.0 أو أعلى'],
  },
  TOP_RATED: {
    type: 'TOP_RATED',
    nameAr: 'أفضل تقييم',
    nameEn: 'Top Rated',
    description: 'بائع حصل على تقييم 4.8 أو أعلى',
    icon: '🏆',
    color: '#F59E0B',
    requirements: ['تقييم 4.8 أو أعلى', '25 تقييم على الأقل'],
  },
  FAST_RESPONDER: {
    type: 'FAST_RESPONDER',
    nameAr: 'سريع الرد',
    nameEn: 'Fast Responder',
    description: 'متوسط وقت الرد أقل من ساعة',
    icon: '⚡',
    color: '#10B981',
    requirements: ['متوسط وقت الرد أقل من 60 دقيقة'],
  },
  PREMIUM_MEMBER: {
    type: 'PREMIUM_MEMBER',
    nameAr: 'عضو مميز',
    nameEn: 'Premium Member',
    description: 'عضوية بريميوم مفعلة',
    icon: '👑',
    color: '#9333EA',
    requirements: ['اشتراك بريميوم نشط'],
  },
};

/**
 * Get all available badges info
 */
export const getAllBadgesInfo = (): BadgeInfo[] => {
  return Object.values(BADGE_CONFIG);
};

/**
 * Get user's badges
 */
export const getUserBadges = async (userId: string): Promise<any[]> => {
  const badges = await prisma.userBadge.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  return badges.map((badge) => ({
    ...badge,
    info: BADGE_CONFIG[badge.badgeType] || null,
  }));
};

/**
 * Award badge to user
 */
export const awardBadge = async (
  userId: string,
  badgeType: string,
  verifiedBy?: string,
  notes?: string
): Promise<any> => {
  if (!BADGE_CONFIG[badgeType]) {
    throw new BadRequestError('نوع الشارة غير صحيح');
  }

  // Check if user already has this badge
  const existing = await prisma.userBadge.findFirst({
    where: { userId, badgeType: badgeType as BadgeType },
  });

  if (existing) {
    throw new BadRequestError('المستخدم حاصل على هذه الشارة بالفعل');
  }

  const badge = await prisma.userBadge.create({
    data: {
      userId,
      badgeType: badgeType as BadgeType,
      verifiedBy,
      verificationData: notes ? { notes } : undefined,
      verifiedAt: new Date(),
    },
  });

  return {
    ...badge,
    info: BADGE_CONFIG[badgeType],
  };
};

/**
 * Revoke badge from user
 */
export const revokeBadge = async (userId: string, badgeType: string): Promise<void> => {
  const badge = await prisma.userBadge.findFirst({
    where: { userId, badgeType: badgeType as BadgeType },
  });

  if (!badge) {
    throw new NotFoundError('الشارة غير موجودة');
  }

  await prisma.userBadge.delete({
    where: { id: badge.id },
  });
};

/**
 * Check and award automatic badges based on user activity
 */
export const checkAndAwardAutomaticBadges = async (userId: string): Promise<any[]> => {
  const awardedBadges: any[] = [];

  // Get user basic info
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('المستخدم غير موجود');
  }

  // Get user's existing badges
  const userBadges = await prisma.userBadge.findMany({
    where: { userId },
  });
  const existingBadgeTypes = userBadges.map((b) => b.badgeType);

  // Phone verified badge
  if (user.phoneVerified && !existingBadgeTypes.includes('PHONE_VERIFIED' as BadgeType)) {
    const badge = await awardBadge(userId, 'PHONE_VERIFIED', 'SYSTEM', 'Automatic verification');
    awardedBadges.push(badge);
  }

  // Email verified badge
  if (user.emailVerified && !existingBadgeTypes.includes('EMAIL_VERIFIED' as BadgeType)) {
    const badge = await awardBadge(userId, 'EMAIL_VERIFIED', 'SYSTEM', 'Automatic verification');
    awardedBadges.push(badge);
  }

  // Get completed transactions as seller (check paymentStatus = COMPLETED)
  const completedTransactions = await prisma.transaction.count({
    where: {
      sellerId: userId,
      paymentStatus: 'COMPLETED',
    },
  });

  // Trusted seller badge (10+ completed transactions)
  if (
    completedTransactions >= 10 &&
    user.rating >= 4.0 &&
    !existingBadgeTypes.includes('TRUSTED_SELLER' as BadgeType)
  ) {
    const badge = await awardBadge(userId, 'TRUSTED_SELLER', 'SYSTEM', 'Automatic - 10+ transactions with 4.0+ rating');
    awardedBadges.push(badge);
  }

  // Get reviews received count
  const reviewsCount = await prisma.review.count({
    where: { reviewedId: userId },
  });

  // Top rated badge (4.8+ rating with 25+ reviews)
  if (
    user.rating >= 4.8 &&
    reviewsCount >= 25 &&
    !existingBadgeTypes.includes('TOP_RATED' as BadgeType)
  ) {
    const badge = await awardBadge(userId, 'TOP_RATED', 'SYSTEM', 'Automatic - 4.8+ rating with 25+ reviews');
    awardedBadges.push(badge);
  }

  return awardedBadges;
};

/**
 * Get badge verification requirements
 */
export const getBadgeRequirements = (badgeType: string): string[] | null => {
  const config = BADGE_CONFIG[badgeType];
  return config ? config.requirements : null;
};

/**
 * Submit badge verification request
 */
export const submitVerificationRequest = async (
  userId: string,
  badgeType: string,
  documents: string[]
): Promise<any> => {
  if (!BADGE_CONFIG[badgeType]) {
    throw new BadRequestError('نوع الشارة غير صحيح');
  }

  // Only certain badges can be requested
  const requestableBadges = ['ID_VERIFIED', 'ADDRESS_VERIFIED', 'BUSINESS_VERIFIED'];
  if (!requestableBadges.includes(badgeType)) {
    throw new BadRequestError('هذه الشارة لا يمكن طلبها');
  }

  // Check if already has badge
  const existing = await prisma.userBadge.findFirst({
    where: { userId, badgeType: badgeType as BadgeType },
  });

  if (existing) {
    throw new BadRequestError('حاصل على هذه الشارة بالفعل');
  }

  // Create a pending notification for admin review
  await prisma.notification.create({
    data: {
      userId,
      type: 'SYSTEM' as any,
      title: `طلب توثيق: ${BADGE_CONFIG[badgeType].nameAr}`,
      message: `قدم المستخدم طلب توثيق ${BADGE_CONFIG[badgeType].nameAr}`,
      metadata: {
        badgeType,
        documents,
        requestedAt: new Date().toISOString(),
      },
    },
  });

  return {
    status: 'pending',
    message: 'تم إرسال طلب التوثيق وسيتم مراجعته قريباً',
    badgeType,
    info: BADGE_CONFIG[badgeType],
  };
};

export default {
  getAllBadgesInfo,
  getUserBadges,
  awardBadge,
  revokeBadge,
  checkAndAwardAutomaticBadges,
  getBadgeRequirements,
  submitVerificationRequest,
};
