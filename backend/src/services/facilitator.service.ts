/**
 * Certified Facilitators Network Service
 * خدمة شبكة الوسطاء المعتمدين
 */

import { FacilitatorLevel, FacilitatorStatus } from '@prisma/client';
import prisma from '../lib/prisma';

// ============================================
// Configuration
// ============================================

const FACILITATOR_CONFIG = {
  levels: {
    BRONZE: { minDeals: 0, minRating: 0, maxInsurance: 10000, commissionRate: 0.03 },
    SILVER: { minDeals: 20, minRating: 4.0, maxInsurance: 25000, commissionRate: 0.025 },
    GOLD: { minDeals: 50, minRating: 4.5, maxInsurance: 50000, commissionRate: 0.02 },
    PLATINUM: { minDeals: 100, minRating: 4.8, maxInsurance: 100000, commissionRate: 0.015 },
  },
  minCommission: 50,
};

// ============================================
// Application & Registration
// ============================================

/**
 * Apply to become a facilitator
 * التقدم لتصبح وسيطاً معتمداً
 */
export async function applyForFacilitator(
  userId: string,
  data: {
    displayName: string;
    bio?: string;
    specializations: string[];
    serviceAreas: string[];
    idDocument: string;
    commercialReg?: string;
  }
): Promise<{ success: boolean; facilitator?: any; error?: string }> {
  // Check if already applied
  const existing = await prisma.facilitator.findUnique({ where: { userId } });
  if (existing) {
    return { success: false, error: 'Already applied or registered as facilitator' };
  }

  // Check user eligibility
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: 'User not found' };
  }

  if (!user.emailVerified || !user.phoneVerified) {
    return { success: false, error: 'Email and phone must be verified' };
  }

  const facilitator = await prisma.facilitator.create({
    data: {
      userId,
      displayName: data.displayName,
      bio: data.bio,
      specializations: data.specializations,
      serviceAreas: data.serviceAreas,
      idDocument: data.idDocument,
      commercialReg: data.commercialReg,
      level: FacilitatorLevel.BRONZE,
      status: FacilitatorStatus.PENDING,
      commissionRate: FACILITATOR_CONFIG.levels.BRONZE.commissionRate,
      minCommission: FACILITATOR_CONFIG.minCommission,
      insuranceCoverage: FACILITATOR_CONFIG.levels.BRONZE.maxInsurance,
    },
  });

  return { success: true, facilitator };
}

/**
 * Approve facilitator application (admin)
 * الموافقة على طلب الوسيط
 */
export async function approveFacilitator(
  facilitatorId: string,
  approvedBy: string
): Promise<{ success: boolean; error?: string }> {
  const facilitator = await prisma.facilitator.findUnique({ where: { id: facilitatorId } });

  if (!facilitator) {
    return { success: false, error: 'Facilitator not found' };
  }

  if (facilitator.status !== FacilitatorStatus.PENDING) {
    return { success: false, error: 'Facilitator is not pending approval' };
  }

  await prisma.facilitator.update({
    where: { id: facilitatorId },
    data: {
      status: FacilitatorStatus.ACTIVE,
      verifiedAt: new Date(),
      verifiedBy: approvedBy,
    },
  });

  return { success: true };
}

/**
 * Reject facilitator application
 * رفض طلب الوسيط
 */
export async function rejectFacilitator(
  facilitatorId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const facilitator = await prisma.facilitator.findUnique({ where: { id: facilitatorId } });

  if (!facilitator) {
    return { success: false, error: 'Facilitator not found' };
  }

  await prisma.facilitator.update({
    where: { id: facilitatorId },
    data: { status: FacilitatorStatus.REVOKED },
  });

  return { success: true };
}

// ============================================
// Assignment Functions
// ============================================

/**
 * Find available facilitators for an assignment
 * البحث عن وسطاء متاحين
 */
export async function findAvailableFacilitators(options: {
  governorate?: string;
  specialization?: string;
  minRating?: number;
  dealValue?: number;
}) {
  const { governorate, specialization, minRating = 0, dealValue } = options;

  const where: any = {
    status: FacilitatorStatus.ACTIVE,
    isAvailable: true,
    avgRating: { gte: minRating },
  };

  if (governorate) {
    where.serviceAreas = { has: governorate };
  }

  if (specialization) {
    where.specializations = { has: specialization };
  }

  if (dealValue) {
    where.insuranceCoverage = { gte: dealValue };
  }

  const facilitators = await prisma.facilitator.findMany({
    where,
    orderBy: [{ avgRating: 'desc' }, { successfulDeals: 'desc' }],
    include: {
      user: {
        select: { id: true, fullName: true, avatar: true, governorate: true },
      },
    },
  });

  return facilitators.map(f => ({
    id: f.id,
    userId: f.userId,
    displayName: f.displayName,
    level: f.level,
    avgRating: f.avgRating,
    totalDeals: f.totalDeals,
    successfulDeals: f.successfulDeals,
    commissionRate: f.commissionRate,
    minCommission: f.minCommission,
    insuranceCoverage: f.insuranceCoverage,
    specializations: f.specializations,
    serviceAreas: f.serviceAreas,
    user: f.user,
  }));
}

/**
 * Assign facilitator to escrow/deal
 * تعيين وسيط لضمان/صفقة
 */
export async function assignFacilitator(
  facilitatorId: string,
  params: {
    assignmentType: 'ESCROW' | 'BARTER_CHAIN' | 'INSPECTION';
    escrowId?: string;
    barterChainId?: string;
    buyerId: string;
    sellerId: string;
    dealValue: number;
  }
): Promise<{ success: boolean; assignment?: any; error?: string }> {
  const facilitator = await prisma.facilitator.findUnique({ where: { id: facilitatorId } });

  if (!facilitator) {
    return { success: false, error: 'Facilitator not found' };
  }

  if (facilitator.status !== FacilitatorStatus.ACTIVE) {
    return { success: false, error: 'Facilitator is not active' };
  }

  if (!facilitator.isAvailable) {
    return { success: false, error: 'Facilitator is not available' };
  }

  // Calculate commission
  const commissionAmount = Math.max(
    params.dealValue * facilitator.commissionRate,
    facilitator.minCommission
  );

  const assignment = await prisma.facilitatorAssignment.create({
    data: {
      facilitatorId,
      assignmentType: params.assignmentType,
      escrowId: params.escrowId,
      barterChainId: params.barterChainId,
      buyerId: params.buyerId,
      sellerId: params.sellerId,
      commissionAmount,
      status: 'ASSIGNED',
    },
  });

  return { success: true, assignment };
}

/**
 * Start working on assignment
 * بدء العمل على المهمة
 */
export async function startAssignment(
  assignmentId: string,
  facilitatorUserId: string
): Promise<{ success: boolean; error?: string }> {
  const assignment = await prisma.facilitatorAssignment.findUnique({
    where: { id: assignmentId },
    include: { facilitator: true },
  });

  if (!assignment) {
    return { success: false, error: 'Assignment not found' };
  }

  if (assignment.facilitator.userId !== facilitatorUserId) {
    return { success: false, error: 'Not authorized' };
  }

  if (assignment.status !== 'ASSIGNED') {
    return { success: false, error: 'Assignment not in assigned status' };
  }

  await prisma.facilitatorAssignment.update({
    where: { id: assignmentId },
    data: { status: 'IN_PROGRESS' },
  });

  return { success: true };
}

/**
 * Complete assignment
 * إتمام المهمة
 */
export async function completeAssignment(
  assignmentId: string,
  facilitatorUserId: string,
  completionNotes?: string
): Promise<{ success: boolean; error?: string }> {
  const assignment = await prisma.facilitatorAssignment.findUnique({
    where: { id: assignmentId },
    include: { facilitator: true },
  });

  if (!assignment) {
    return { success: false, error: 'Assignment not found' };
  }

  if (assignment.facilitator.userId !== facilitatorUserId) {
    return { success: false, error: 'Not authorized' };
  }

  await prisma.$transaction(async (tx) => {
    // Update assignment
    await tx.facilitatorAssignment.update({
      where: { id: assignmentId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
        completionNotes,
      },
    });

    // Update facilitator stats
    await tx.facilitator.update({
      where: { id: assignment.facilitatorId },
      data: {
        totalDeals: { increment: 1 },
        successfulDeals: { increment: 1 },
        totalVolume: { increment: assignment.commissionAmount / assignment.facilitator.commissionRate },
      },
    });
  });

  // Check for level upgrade
  await checkLevelUpgrade(assignment.facilitatorId);

  return { success: true };
}

/**
 * Cancel assignment
 * إلغاء المهمة
 */
export async function cancelAssignment(
  assignmentId: string,
  cancelledBy: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const assignment = await prisma.facilitatorAssignment.findUnique({ where: { id: assignmentId } });

  if (!assignment) {
    return { success: false, error: 'Assignment not found' };
  }

  if (assignment.status === 'COMPLETED') {
    return { success: false, error: 'Cannot cancel completed assignment' };
  }

  await prisma.facilitatorAssignment.update({
    where: { id: assignmentId },
    data: {
      status: 'CANCELLED',
      notes: reason,
    },
  });

  return { success: true };
}

// ============================================
// Review Functions
// ============================================

/**
 * Submit facilitator review
 * تقديم تقييم للوسيط
 */
export async function submitFacilitatorReview(
  assignmentId: string,
  reviewerId: string,
  data: {
    rating: number;
    professionalismRating: number;
    communicationRating: number;
    speedRating: number;
    comment?: string;
  }
): Promise<{ success: boolean; error?: string }> {
  const assignment = await prisma.facilitatorAssignment.findUnique({ where: { id: assignmentId } });

  if (!assignment) {
    return { success: false, error: 'Assignment not found' };
  }

  if (assignment.status !== 'COMPLETED') {
    return { success: false, error: 'Can only review completed assignments' };
  }

  // Check if reviewer is buyer or seller
  if (reviewerId !== assignment.buyerId && reviewerId !== assignment.sellerId) {
    return { success: false, error: 'Only buyer or seller can review' };
  }

  // Check if already reviewed
  const existing = await prisma.facilitatorReview.findUnique({
    where: { assignmentId_reviewerId: { assignmentId, reviewerId } },
  });

  if (existing) {
    return { success: false, error: 'Already reviewed this assignment' };
  }

  await prisma.$transaction(async (tx) => {
    // Create review
    await tx.facilitatorReview.create({
      data: {
        facilitatorId: assignment.facilitatorId,
        reviewerId,
        assignmentId,
        rating: data.rating,
        professionalismRating: data.professionalismRating,
        communicationRating: data.communicationRating,
        speedRating: data.speedRating,
        comment: data.comment,
      },
    });

    // Update facilitator average rating
    const reviews = await tx.facilitatorReview.findMany({
      where: { facilitatorId: assignment.facilitatorId },
    });

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;

    await tx.facilitator.update({
      where: { id: assignment.facilitatorId },
      data: { avgRating },
    });
  });

  // Check for level upgrade
  await checkLevelUpgrade(assignment.facilitatorId);

  return { success: true };
}

// ============================================
// Profile Management
// ============================================

/**
 * Update facilitator profile
 * تحديث ملف الوسيط
 */
export async function updateFacilitatorProfile(
  facilitatorId: string,
  userId: string,
  data: {
    displayName?: string;
    bio?: string;
    specializations?: string[];
    serviceAreas?: string[];
    isAvailable?: boolean;
    availabilitySchedule?: any;
  }
): Promise<{ success: boolean; error?: string }> {
  const facilitator = await prisma.facilitator.findUnique({ where: { id: facilitatorId } });

  if (!facilitator) {
    return { success: false, error: 'Facilitator not found' };
  }

  if (facilitator.userId !== userId) {
    return { success: false, error: 'Not authorized' };
  }

  await prisma.facilitator.update({
    where: { id: facilitatorId },
    data: {
      ...(data.displayName && { displayName: data.displayName }),
      ...(data.bio !== undefined && { bio: data.bio }),
      ...(data.specializations && { specializations: data.specializations }),
      ...(data.serviceAreas && { serviceAreas: data.serviceAreas }),
      ...(data.isAvailable !== undefined && { isAvailable: data.isAvailable }),
      ...(data.availabilitySchedule && { availabilitySchedule: data.availabilitySchedule }),
    },
  });

  return { success: true };
}

/**
 * Toggle availability
 * تبديل حالة التوفر
 */
export async function toggleAvailability(
  facilitatorId: string,
  userId: string
): Promise<{ success: boolean; isAvailable?: boolean; error?: string }> {
  const facilitator = await prisma.facilitator.findUnique({ where: { id: facilitatorId } });

  if (!facilitator) {
    return { success: false, error: 'Facilitator not found' };
  }

  if (facilitator.userId !== userId) {
    return { success: false, error: 'Not authorized' };
  }

  const updated = await prisma.facilitator.update({
    where: { id: facilitatorId },
    data: { isAvailable: !facilitator.isAvailable },
  });

  return { success: true, isAvailable: updated.isAvailable };
}

// ============================================
// Query Functions
// ============================================

/**
 * Get facilitator profile
 */
export async function getFacilitatorProfile(facilitatorId: string) {
  return prisma.facilitator.findUnique({
    where: { id: facilitatorId },
    include: {
      user: {
        select: { id: true, fullName: true, avatar: true, governorate: true, createdAt: true },
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  });
}

/**
 * Get facilitator by user ID
 */
export async function getFacilitatorByUserId(userId: string) {
  return prisma.facilitator.findUnique({
    where: { userId },
    include: {
      assignments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });
}

/**
 * Get facilitator assignments
 */
export async function getFacilitatorAssignments(
  facilitatorId: string,
  options: {
    status?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  const { status, limit = 20, offset = 0 } = options;

  const where: any = { facilitatorId };
  if (status) where.status = status;

  const [assignments, total] = await Promise.all([
    prisma.facilitatorAssignment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.facilitatorAssignment.count({ where }),
  ]);

  return { assignments, total };
}

/**
 * Get top facilitators
 */
export async function getTopFacilitators(options: {
  governorate?: string;
  specialization?: string;
  limit?: number;
} = {}) {
  const { governorate, specialization, limit = 10 } = options;

  const where: any = { status: FacilitatorStatus.ACTIVE };

  if (governorate) {
    where.serviceAreas = { has: governorate };
  }

  if (specialization) {
    where.specializations = { has: specialization };
  }

  return prisma.facilitator.findMany({
    where,
    orderBy: [{ avgRating: 'desc' }, { totalDeals: 'desc' }],
    take: limit,
    include: {
      user: {
        select: { id: true, fullName: true, avatar: true },
      },
    },
  });
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check and upgrade facilitator level
 */
async function checkLevelUpgrade(facilitatorId: string) {
  const facilitator = await prisma.facilitator.findUnique({ where: { id: facilitatorId } });

  if (!facilitator) return;

  const levels: FacilitatorLevel[] = ['PLATINUM', 'GOLD', 'SILVER', 'BRONZE'];
  let newLevel: FacilitatorLevel = FacilitatorLevel.BRONZE;

  for (const level of levels) {
    const config = FACILITATOR_CONFIG.levels[level];
    if (
      facilitator.successfulDeals >= config.minDeals &&
      facilitator.avgRating >= config.minRating
    ) {
      newLevel = level;
      break;
    }
  }

  if (newLevel !== facilitator.level) {
    const levelConfig = FACILITATOR_CONFIG.levels[newLevel];

    await prisma.facilitator.update({
      where: { id: facilitatorId },
      data: {
        level: newLevel,
        commissionRate: levelConfig.commissionRate,
        insuranceCoverage: levelConfig.maxInsurance,
      },
    });
  }
}

/**
 * Suspend facilitator
 */
export async function suspendFacilitator(
  facilitatorId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  const facilitator = await prisma.facilitator.findUnique({ where: { id: facilitatorId } });

  if (!facilitator) {
    return { success: false, error: 'Facilitator not found' };
  }

  await prisma.facilitator.update({
    where: { id: facilitatorId },
    data: { status: FacilitatorStatus.SUSPENDED },
  });

  return { success: true };
}

/**
 * Reactivate facilitator
 */
export async function reactivateFacilitator(
  facilitatorId: string
): Promise<{ success: boolean; error?: string }> {
  const facilitator = await prisma.facilitator.findUnique({ where: { id: facilitatorId } });

  if (!facilitator) {
    return { success: false, error: 'Facilitator not found' };
  }

  if (facilitator.status !== FacilitatorStatus.SUSPENDED) {
    return { success: false, error: 'Facilitator is not suspended' };
  }

  await prisma.facilitator.update({
    where: { id: facilitatorId },
    data: { status: FacilitatorStatus.ACTIVE },
  });

  return { success: true };
}

export { FACILITATOR_CONFIG };
