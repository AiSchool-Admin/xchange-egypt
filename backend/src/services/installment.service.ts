/**
 * Installment Payment Service
 * خدمة الدفع بالتقسيط
 *
 * Buy now, pay later system with:
 * - Flexible installment plans
 * - Down payment options
 * - Late fee management
 * - Payment tracking
 */

import prisma from '../config/database';
import { InstallmentPlanStatus, InstallmentStatus } from '@prisma/client';

// ============================================
// Types
// ============================================

interface CreateInstallmentPlanParams {
  listingId: string;
  buyerId: string;
  sellerId: string;
  totalAmount: number;
  downPaymentPercent: number;
  numberOfInstallments: number;
  interestRate?: number;
  adminFee?: number;
  paymentDay?: number;
}

interface InstallmentPlanDetails {
  id: string;
  totalAmount: number;
  downPayment: number;
  remainingAmount: number;
  numberOfInstallments: number;
  installmentAmount: number;
  interestRate: number;
  adminFee: number;
  totalWithFees: number;
  status: InstallmentPlanStatus;
  progress: {
    paidInstallments: number;
    totalPaid: number;
    missedPayments: number;
    nextPaymentDate: Date | null;
    nextPaymentAmount: number | null;
  };
  installments: InstallmentDetails[];
  listing: {
    id: string;
    title: string;
    imageUrl: string | null;
  };
  buyer: {
    id: string;
    name: string;
  };
  seller: {
    id: string;
    name: string;
  };
}

interface InstallmentDetails {
  id: string;
  number: number;
  amount: number;
  dueDate: Date;
  status: InstallmentStatus;
  paidAmount: number | null;
  paidAt: Date | null;
  lateFee: number;
  daysLate: number;
}

interface PaymentResult {
  success: boolean;
  message: string;
  messageAr: string;
  installmentId?: string;
  planCompleted?: boolean;
}

// ============================================
// Configuration
// ============================================

const CONFIG = {
  minDownPaymentPercent: 10,
  maxDownPaymentPercent: 50,
  minInstallments: 2,
  maxInstallments: 12,
  defaultInterestRate: 0, // 0% for now
  defaultAdminFee: 50, // 50 EGP admin fee
  defaultLateFee: 50, // 50 EGP late fee per installment
  gracePeriodDays: 3, // Days after due date before late fee
  maxMissedPayments: 3, // Max missed before default
};

// ============================================
// Plan Creation
// ============================================

/**
 * Calculate installment plan details
 */
export function calculatePlan(
  totalAmount: number,
  downPaymentPercent: number,
  numberOfInstallments: number,
  interestRate: number = CONFIG.defaultInterestRate,
  adminFee: number = CONFIG.defaultAdminFee
) {
  // Validate inputs
  if (downPaymentPercent < CONFIG.minDownPaymentPercent ||
      downPaymentPercent > CONFIG.maxDownPaymentPercent) {
    throw new Error(`Down payment must be between ${CONFIG.minDownPaymentPercent}% and ${CONFIG.maxDownPaymentPercent}%`);
  }

  if (numberOfInstallments < CONFIG.minInstallments ||
      numberOfInstallments > CONFIG.maxInstallments) {
    throw new Error(`Installments must be between ${CONFIG.minInstallments} and ${CONFIG.maxInstallments}`);
  }

  const downPayment = Math.round(totalAmount * (downPaymentPercent / 100));
  const remainingAmount = totalAmount - downPayment;
  const interestAmount = Math.round(remainingAmount * (interestRate / 100));
  const amountWithInterest = remainingAmount + interestAmount + adminFee;
  const installmentAmount = Math.round(amountWithInterest / numberOfInstallments);

  // Calculate total (fixing rounding issues)
  const totalInstallments = installmentAmount * numberOfInstallments;
  const adjustedLastInstallment = installmentAmount + (amountWithInterest - totalInstallments);

  return {
    totalAmount,
    downPayment,
    remainingAmount,
    interestRate,
    interestAmount,
    adminFee,
    numberOfInstallments,
    installmentAmount,
    adjustedLastInstallment, // Last installment might differ slightly
    totalWithFees: downPayment + amountWithInterest,
    monthlyPayment: installmentAmount,
  };
}

/**
 * Create a new installment plan
 */
export async function createInstallmentPlan(params: CreateInstallmentPlanParams) {
  const {
    listingId,
    buyerId,
    sellerId,
    totalAmount,
    downPaymentPercent,
    numberOfInstallments,
    interestRate = CONFIG.defaultInterestRate,
    adminFee = CONFIG.defaultAdminFee,
    paymentDay = new Date().getDate(),
  } = params;

  // Validate buyer != seller
  if (buyerId === sellerId) {
    throw new Error('Buyer and seller cannot be the same');
  }

  // Verify listing exists
  const listing = await prisma.listing.findUnique({
    where: { id: listingId },
  });

  if (!listing) {
    throw new Error('Listing not found');
  }

  // Calculate plan details
  const plan = calculatePlan(
    totalAmount,
    downPaymentPercent,
    numberOfInstallments,
    interestRate,
    adminFee
  );

  // Calculate dates
  const startDate = new Date();
  const endDate = new Date();
  endDate.setMonth(endDate.getMonth() + numberOfInstallments);

  // Create plan with transaction
  const installmentPlan = await prisma.$transaction(async (tx) => {
    // Create the plan
    const createdPlan = await tx.installmentPlan.create({
      data: {
        listingId,
        buyerId,
        sellerId,
        totalAmount: plan.totalAmount,
        downPayment: plan.downPayment,
        remainingAmount: plan.remainingAmount,
        numberOfInstallments,
        installmentAmount: plan.installmentAmount,
        interestRate: plan.interestRate,
        adminFee: plan.adminFee,
        lateFee: CONFIG.defaultLateFee,
        startDate,
        endDate,
        paymentDay,
        status: 'DRAFT',
      },
    });

    // Create individual installments
    const installments = [];
    for (let i = 1; i <= numberOfInstallments; i++) {
      const dueDate = new Date(startDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      dueDate.setDate(paymentDay);

      const amount = i === numberOfInstallments
        ? plan.adjustedLastInstallment
        : plan.installmentAmount;

      installments.push({
        planId: createdPlan.id,
        installmentNumber: i,
        amount,
        dueDate,
      });
    }

    await tx.installment.createMany({
      data: installments,
    });

    return createdPlan;
  });

  return {
    ...installmentPlan,
    calculatedPlan: plan,
  };
}

/**
 * Get installment plan options for a listing
 */
export async function getInstallmentOptions(listingPrice: number) {
  const options = [
    { downPayment: 20, installments: 3, label: '3 أشهر' },
    { downPayment: 15, installments: 6, label: '6 أشهر' },
    { downPayment: 10, installments: 12, label: '12 شهر' },
  ];

  return options.map(opt => {
    const plan = calculatePlan(listingPrice, opt.downPayment, opt.installments);
    return {
      ...opt,
      downPaymentAmount: plan.downPayment,
      monthlyPayment: plan.installmentAmount,
      totalCost: plan.totalWithFees,
    };
  });
}

// ============================================
// Plan Management
// ============================================

/**
 * Get installment plan by ID
 */
export async function getInstallmentPlan(planId: string): Promise<InstallmentPlanDetails | null> {
  const plan = await prisma.installmentPlan.findUnique({
    where: { id: planId },
    include: {
      listing: {
        include: {
          item: {
            select: { title: true, images: true },
          },
        },
      },
      installments: {
        orderBy: { installmentNumber: 'asc' },
      },
    },
  });

  if (!plan) return null;

  // Get buyer and seller names
  const [buyer, seller] = await Promise.all([
    prisma.user.findUnique({
      where: { id: plan.buyerId },
      select: { id: true, fullName: true },
    }),
    prisma.user.findUnique({
      where: { id: plan.sellerId },
      select: { id: true, fullName: true },
    }),
  ]);

  // Find next payment
  const nextInstallment = plan.installments.find(i => i.status === 'PENDING');

  return {
    id: plan.id,
    totalAmount: plan.totalAmount,
    downPayment: plan.downPayment,
    remainingAmount: plan.remainingAmount,
    numberOfInstallments: plan.numberOfInstallments,
    installmentAmount: plan.installmentAmount,
    interestRate: plan.interestRate,
    adminFee: plan.adminFee,
    totalWithFees: plan.totalAmount + (plan.remainingAmount * plan.interestRate / 100) + plan.adminFee,
    status: plan.status,
    progress: {
      paidInstallments: plan.paidInstallments,
      totalPaid: plan.totalPaid,
      missedPayments: plan.missedPayments,
      nextPaymentDate: nextInstallment?.dueDate || null,
      nextPaymentAmount: nextInstallment
        ? nextInstallment.amount + nextInstallment.lateFeeApplied
        : null,
    },
    installments: plan.installments.map(i => ({
      id: i.id,
      number: i.installmentNumber,
      amount: i.amount,
      dueDate: i.dueDate,
      status: i.status,
      paidAmount: i.paidAmount,
      paidAt: i.paidAt,
      lateFee: i.lateFeeApplied,
      daysLate: i.daysLate,
    })),
    listing: {
      id: plan.listing.id,
      title: plan.listing.item.title,
      imageUrl: plan.listing.item.images[0] || null,
    },
    buyer: {
      id: buyer?.id || '',
      name: buyer?.fullName || '',
    },
    seller: {
      id: seller?.id || '',
      name: seller?.fullName || '',
    },
  };
}

/**
 * Get user's installment plans as buyer
 */
export async function getBuyerPlans(userId: string) {
  return prisma.installmentPlan.findMany({
    where: { buyerId: userId },
    include: {
      listing: {
        include: {
          item: {
            select: { title: true, images: true },
          },
        },
      },
      installments: {
        where: { status: 'PENDING' },
        orderBy: { dueDate: 'asc' },
        take: 1,
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

/**
 * Get user's installment plans as seller
 */
export async function getSellerPlans(userId: string) {
  return prisma.installmentPlan.findMany({
    where: { sellerId: userId },
    include: {
      listing: {
        include: {
          item: {
            select: { title: true, images: true },
          },
        },
      },
      _count: {
        select: { installments: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

// ============================================
// Approval Flow
// ============================================

/**
 * Seller approves installment plan
 */
export async function sellerApprovePlan(planId: string, sellerId: string) {
  const plan = await prisma.installmentPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error('Plan not found');
  }

  if (plan.sellerId !== sellerId) {
    throw new Error('Unauthorized');
  }

  if (plan.status !== 'DRAFT') {
    throw new Error('Plan is not in draft status');
  }

  return prisma.installmentPlan.update({
    where: { id: planId },
    data: {
      sellerApproved: true,
      sellerApprovedAt: new Date(),
      status: 'ACTIVE',
    },
  });
}

/**
 * Cancel a plan (only if no payments made)
 */
export async function cancelPlan(planId: string, userId: string) {
  const plan = await prisma.installmentPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    throw new Error('Plan not found');
  }

  if (plan.buyerId !== userId && plan.sellerId !== userId) {
    throw new Error('Unauthorized');
  }

  if (plan.paidInstallments > 0) {
    throw new Error('Cannot cancel plan with payments made');
  }

  return prisma.installmentPlan.update({
    where: { id: planId },
    data: { status: 'CANCELLED' },
  });
}

// ============================================
// Payment Processing
// ============================================

/**
 * Pay an installment
 */
export async function payInstallment(
  installmentId: string,
  userId: string,
  paymentMethod: string,
  paymentReference?: string
): Promise<PaymentResult> {
  const installment = await prisma.installment.findUnique({
    where: { id: installmentId },
    include: { plan: true },
  });

  if (!installment) {
    return {
      success: false,
      message: 'Installment not found',
      messageAr: 'القسط غير موجود',
    };
  }

  if (installment.plan.buyerId !== userId) {
    return {
      success: false,
      message: 'Unauthorized',
      messageAr: 'غير مصرح',
    };
  }

  if (installment.status === 'PAID') {
    return {
      success: false,
      message: 'Installment already paid',
      messageAr: 'القسط مدفوع بالفعل',
    };
  }

  const totalDue = installment.amount + installment.lateFeeApplied;

  // Process payment with transaction
  await prisma.$transaction(async (tx) => {
    // Update installment
    await tx.installment.update({
      where: { id: installmentId },
      data: {
        status: 'PAID',
        paidAmount: totalDue,
        paidAt: new Date(),
        paymentMethod,
        paymentReference,
      },
    });

    // Update plan
    await tx.installmentPlan.update({
      where: { id: installment.planId },
      data: {
        paidInstallments: { increment: 1 },
        totalPaid: { increment: totalDue },
      },
    });
  });

  // Check if plan is complete
  const updatedPlan = await prisma.installmentPlan.findUnique({
    where: { id: installment.planId },
  });

  let planCompleted = false;
  if (updatedPlan && updatedPlan.paidInstallments >= updatedPlan.numberOfInstallments) {
    await prisma.installmentPlan.update({
      where: { id: installment.planId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
    planCompleted = true;
  }

  return {
    success: true,
    message: planCompleted ? 'Plan completed!' : 'Payment successful',
    messageAr: planCompleted ? 'تم سداد الخطة بالكامل!' : 'تم الدفع بنجاح',
    installmentId,
    planCompleted,
  };
}

/**
 * Pay down payment
 */
export async function payDownPayment(
  planId: string,
  userId: string,
  paymentMethod: string,
  paymentReference?: string
): Promise<PaymentResult> {
  const plan = await prisma.installmentPlan.findUnique({
    where: { id: planId },
  });

  if (!plan) {
    return {
      success: false,
      message: 'Plan not found',
      messageAr: 'الخطة غير موجودة',
    };
  }

  if (plan.buyerId !== userId) {
    return {
      success: false,
      message: 'Unauthorized',
      messageAr: 'غير مصرح',
    };
  }

  if (plan.status !== 'ACTIVE') {
    return {
      success: false,
      message: 'Plan is not active',
      messageAr: 'الخطة غير نشطة',
    };
  }

  // Record down payment (could add a separate table for this)
  await prisma.installmentPlan.update({
    where: { id: planId },
    data: {
      totalPaid: { increment: plan.downPayment },
    },
  });

  return {
    success: true,
    message: 'Down payment received',
    messageAr: 'تم استلام المقدم',
  };
}

// ============================================
// Late Fee Management
// ============================================

/**
 * Apply late fees to overdue installments
 */
export async function applyLateFees() {
  const now = new Date();
  const gracePeriodDate = new Date(now);
  gracePeriodDate.setDate(gracePeriodDate.getDate() - CONFIG.gracePeriodDays);

  // Find overdue installments without late fee applied
  const overdueInstallments = await prisma.installment.findMany({
    where: {
      status: 'PENDING',
      dueDate: { lt: gracePeriodDate },
      lateFeeApplied: 0,
    },
    include: { plan: true },
  });

  let feesApplied = 0;

  for (const installment of overdueInstallments) {
    const daysLate = Math.floor(
      (now.getTime() - installment.dueDate.getTime()) / (24 * 60 * 60 * 1000)
    );

    await prisma.installment.update({
      where: { id: installment.id },
      data: {
        status: 'LATE',
        lateFeeApplied: installment.plan.lateFee,
        daysLate,
      },
    });

    feesApplied++;
  }

  return feesApplied;
}

/**
 * Check for defaulted plans
 */
export async function checkForDefaults() {
  // Find plans with too many missed payments
  const plansToDefault = await prisma.installmentPlan.findMany({
    where: {
      status: 'ACTIVE',
      missedPayments: { gte: CONFIG.maxMissedPayments },
    },
  });

  for (const plan of plansToDefault) {
    await prisma.installmentPlan.update({
      where: { id: plan.id },
      data: { status: 'DEFAULTED' },
    });

    // TODO: Notify seller and buyer
    // TODO: Initiate collection process
  }

  return plansToDefault.length;
}

/**
 * Update missed payment counts
 */
export async function updateMissedPayments() {
  const now = new Date();

  // Find plans with overdue installments
  const activePlans = await prisma.installmentPlan.findMany({
    where: { status: 'ACTIVE' },
    include: {
      installments: {
        where: {
          status: { in: ['LATE', 'PENDING'] },
          dueDate: { lt: now },
        },
      },
    },
  });

  for (const plan of activePlans) {
    const missedCount = plan.installments.filter(
      i => i.status === 'LATE' ||
           (i.status === 'PENDING' && i.dueDate < now)
    ).length;

    if (missedCount !== plan.missedPayments) {
      await prisma.installmentPlan.update({
        where: { id: plan.id },
        data: { missedPayments: missedCount },
      });
    }
  }
}

// ============================================
// Payment Reminders
// ============================================

/**
 * Get upcoming installments for reminders
 */
export async function getUpcomingInstallments(daysAhead: number = 7) {
  const now = new Date();
  const futureDate = new Date(now);
  futureDate.setDate(futureDate.getDate() + daysAhead);

  return prisma.installment.findMany({
    where: {
      status: 'PENDING',
      dueDate: {
        gte: now,
        lte: futureDate,
      },
    },
    include: {
      plan: {
        include: {
          listing: {
            include: {
              item: {
                select: { title: true },
              },
            },
          },
        },
      },
    },
  });
}

/**
 * Get overdue installments
 */
export async function getOverdueInstallments() {
  return prisma.installment.findMany({
    where: {
      status: { in: ['PENDING', 'LATE'] },
      dueDate: { lt: new Date() },
    },
    include: {
      plan: {
        include: {
          listing: {
            include: {
              item: {
                select: { title: true },
              },
            },
          },
        },
      },
    },
    orderBy: { dueDate: 'asc' },
  });
}

/**
 * Record that reminder was sent
 */
export async function recordReminderSent(installmentId: string) {
  return prisma.installment.update({
    where: { id: installmentId },
    data: {
      remindersSent: { increment: 1 },
      lastReminderAt: new Date(),
    },
  });
}

// ============================================
// Statistics
// ============================================

/**
 * Get installment statistics for platform
 */
export async function getPlatformStats() {
  const [
    totalPlans,
    activePlans,
    completedPlans,
    defaultedPlans,
    totalVolume,
    totalCollected,
  ] = await Promise.all([
    prisma.installmentPlan.count(),
    prisma.installmentPlan.count({ where: { status: 'ACTIVE' } }),
    prisma.installmentPlan.count({ where: { status: 'COMPLETED' } }),
    prisma.installmentPlan.count({ where: { status: 'DEFAULTED' } }),
    prisma.installmentPlan.aggregate({
      _sum: { totalAmount: true },
    }),
    prisma.installmentPlan.aggregate({
      _sum: { totalPaid: true },
    }),
  ]);

  return {
    totalPlans,
    activePlans,
    completedPlans,
    defaultedPlans,
    completionRate: totalPlans > 0
      ? (completedPlans / totalPlans) * 100
      : 0,
    defaultRate: totalPlans > 0
      ? (defaultedPlans / totalPlans) * 100
      : 0,
    totalVolume: totalVolume._sum.totalAmount || 0,
    totalCollected: totalCollected._sum.totalPaid || 0,
    collectionRate: (totalVolume._sum.totalAmount || 0) > 0
      ? ((totalCollected._sum.totalPaid || 0) / (totalVolume._sum.totalAmount || 0)) * 100
      : 0,
  };
}

/**
 * Get user's installment statistics
 */
export async function getUserStats(userId: string) {
  const [asbuyer, asSeller] = await Promise.all([
    prisma.installmentPlan.aggregate({
      where: { buyerId: userId },
      _count: true,
      _sum: { totalAmount: true, totalPaid: true },
    }),
    prisma.installmentPlan.aggregate({
      where: { sellerId: userId },
      _count: true,
      _sum: { totalAmount: true, totalPaid: true },
    }),
  ]);

  return {
    asBuyer: {
      totalPlans: asbuyer._count,
      totalAmount: asbuyer._sum.totalAmount || 0,
      totalPaid: asbuyer._sum.totalPaid || 0,
    },
    asSeller: {
      totalPlans: asSeller._count,
      totalAmount: asSeller._sum.totalAmount || 0,
      totalReceived: asSeller._sum.totalPaid || 0,
    },
  };
}

/**
 * Scheduled job for installment management
 */
export async function runScheduledTasks() {
  const results = {
    lateFeesApplied: await applyLateFees(),
    defaultsChecked: await checkForDefaults(),
  };

  await updateMissedPayments();

  return results;
}
