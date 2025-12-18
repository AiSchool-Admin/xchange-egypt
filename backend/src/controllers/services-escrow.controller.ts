// ============================================
// Services Escrow Controller - Service-Specific Escrow Management
// ============================================

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Helper function to get commission rate based on provider tier
function getCommissionRate(tier: string): number {
  const rates: Record<string, number> = {
    FREE: 0.20,
    TRUSTED: 0.15,
    PRO: 0.12,
    ELITE: 0.10,
  };
  return rates[tier] || 0.20;
}

// ============================================
// Hold Service Booking Funds
// ============================================

export const holdServiceFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.user!;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        escrow: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        messageAr: 'لم يتم العثور على الحجز',
      });
    }

    if (booking.customerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
        messageAr: 'غير مصرح',
      });
    }

    if (booking.escrow) {
      return res.status(400).json({
        success: false,
        message: 'Funds already held in escrow',
        messageAr: 'الأموال محجوزة بالفعل',
      });
    }

    // Create escrow record
    const escrow = await prisma.serviceEscrow.create({
      data: {
        bookingId,
        amount: booking.totalAmount,
        currency: 'EGP',
        status: 'HELD',
        heldAt: new Date(),
        releaseConditions: {
          autoReleaseAfterDays: 7,
          requireCustomerApproval: true,
          requireServiceCompletion: true,
        },
      },
    });

    // Update booking status
    await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'ESCROW_HELD',
      },
    });

    res.json({
      success: true,
      message: 'Funds held in escrow successfully',
      messageAr: 'تم حجز الأموال بنجاح',
      data: escrow,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Release Service Booking Funds
// ============================================

export const releaseServiceFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.user!;
    const { releaseType = 'FULL', amount } = req.body;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        customer: true,
        provider: true,
        escrow: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        messageAr: 'لم يتم العثور على الحجز',
      });
    }

    if (booking.customerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the customer can release funds',
        messageAr: 'العميل فقط يمكنه تحرير الأموال',
      });
    }

    if (!booking.escrow || booking.escrow.status !== 'HELD') {
      return res.status(400).json({
        success: false,
        message: 'No funds held in escrow',
        messageAr: 'لا توجد أموال محجوزة',
      });
    }

    if (booking.status !== 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Service must be completed before releasing funds',
        messageAr: 'يجب إكمال الخدمة قبل تحرير الأموال',
      });
    }

    const releaseAmount = releaseType === 'FULL' ? booking.escrow.amount : amount;

    // Update escrow status
    const updatedEscrow = await prisma.serviceEscrow.update({
      where: { id: booking.escrow.id },
      data: {
        status: releaseType === 'FULL' ? 'RELEASED' : 'PARTIALLY_RELEASED',
        releasedAmount: releaseAmount,
        releasedAt: new Date(),
        releasedBy: userId,
      },
    });

    // Credit provider earnings
    await prisma.serviceProvider.update({
      where: { id: booking.providerId },
      data: {
        availableBalance: {
          increment: booking.providerEarnings,
        },
        totalEarnings: {
          increment: booking.providerEarnings,
        },
      },
    });

    // Update booking payment status
    await prisma.serviceBooking.update({
      where: { id: bookingId },
      data: {
        paymentStatus: 'RELEASED',
        paidOutAt: new Date(),
      },
    });

    // Notify provider
    await prisma.notification.create({
      data: {
        userId: booking.providerId,
        type: 'PAYMENT_RELEASED',
        title: 'Payment Released',
        titleAr: 'تم تحرير الدفعة',
        message: `Payment of ${booking.providerEarnings} EGP has been released for booking ${booking.bookingNumber}`,
        messageAr: `تم تحرير دفعة ${booking.providerEarnings} جنيه للحجز ${booking.bookingNumber}`,
        data: { bookingId, amount: booking.providerEarnings },
      },
    });

    res.json({
      success: true,
      message: 'Funds released successfully',
      messageAr: 'تم تحرير الأموال بنجاح',
      data: updatedEscrow,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Create Service Milestone
// ============================================

export const createServiceMilestone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.user!;
    const { title, titleAr, description, descriptionAr, amount, dueDate } = req.body;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        provider: true,
        escrow: true,
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        messageAr: 'لم يتم العثور على الحجز',
      });
    }

    // Only provider can create milestones
    if (booking.provider.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the provider can create milestones',
        messageAr: 'مقدم الخدمة فقط يمكنه إنشاء المراحل',
      });
    }

    if (!booking.escrow) {
      return res.status(400).json({
        success: false,
        message: 'Escrow must be created first',
        messageAr: 'يجب إنشاء الضمان أولاً',
      });
    }

    // Check total milestones don't exceed booking amount
    const existingMilestones = await prisma.escrowMilestone.aggregate({
      where: { escrowId: booking.escrow.id },
      _sum: { amount: true },
    });

    const totalMilestoneAmount = (existingMilestones._sum.amount || 0) + amount;
    if (totalMilestoneAmount > booking.totalAmount) {
      return res.status(400).json({
        success: false,
        message: 'Milestone amounts exceed booking total',
        messageAr: 'مجموع المراحل يتجاوز إجمالي الحجز',
      });
    }

    const milestoneCount = await prisma.escrowMilestone.count({
      where: { escrowId: booking.escrow.id },
    });

    const milestone = await prisma.escrowMilestone.create({
      data: {
        escrowId: booking.escrow.id,
        title,
        titleAr,
        description,
        descriptionAr,
        amount,
        dueDate: dueDate ? new Date(dueDate) : null,
        status: 'PENDING',
        order: milestoneCount + 1,
      },
    });

    // Notify customer
    await prisma.notification.create({
      data: {
        userId: booking.customerId,
        type: 'MILESTONE_CREATED',
        title: 'New Milestone Created',
        titleAr: 'تم إنشاء مرحلة جديدة',
        message: `Provider has created milestone: ${title}`,
        messageAr: `قام مقدم الخدمة بإنشاء مرحلة: ${titleAr}`,
        data: { bookingId, milestoneId: milestone.id },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Milestone created successfully',
      messageAr: 'تم إنشاء المرحلة بنجاح',
      data: milestone,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Complete Service Milestone
// ============================================

export const completeMilestone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, milestoneId } = req.params;
    const { userId } = req.user!;
    const { evidence } = req.body;

    const milestone = await prisma.escrowMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        escrow: {
          include: {
            booking: {
              include: {
                provider: true,
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
        messageAr: 'لم يتم العثور على المرحلة',
      });
    }

    if (milestone.escrow.booking.provider.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the provider can complete milestones',
        messageAr: 'مقدم الخدمة فقط يمكنه إكمال المراحل',
      });
    }

    if (milestone.status !== 'PENDING' && milestone.status !== 'IN_PROGRESS') {
      return res.status(400).json({
        success: false,
        message: 'Milestone cannot be completed',
        messageAr: 'لا يمكن إكمال هذه المرحلة',
      });
    }

    const updatedMilestone = await prisma.escrowMilestone.update({
      where: { id: milestoneId },
      data: {
        status: 'PENDING_APPROVAL',
        completedAt: new Date(),
        evidence: evidence || [],
      },
    });

    // Notify customer for approval
    await prisma.notification.create({
      data: {
        userId: milestone.escrow.booking.customerId,
        type: 'MILESTONE_COMPLETED',
        title: 'Milestone Completed - Approval Needed',
        titleAr: 'تم إكمال المرحلة - مطلوب الموافقة',
        message: `Provider has completed milestone: ${milestone.title}. Please review and approve.`,
        messageAr: `أكمل مقدم الخدمة المرحلة: ${milestone.titleAr}. يرجى المراجعة والموافقة.`,
        data: { bookingId, milestoneId },
      },
    });

    res.json({
      success: true,
      message: 'Milestone marked as completed, awaiting customer approval',
      messageAr: 'تم تحديد المرحلة كمكتملة، في انتظار موافقة العميل',
      data: updatedMilestone,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Approve Service Milestone
// ============================================

export const approveMilestone = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId, milestoneId } = req.params;
    const { userId } = req.user!;

    const milestone = await prisma.escrowMilestone.findUnique({
      where: { id: milestoneId },
      include: {
        escrow: {
          include: {
            booking: {
              include: {
                provider: true,
              },
            },
          },
        },
      },
    });

    if (!milestone) {
      return res.status(404).json({
        success: false,
        message: 'Milestone not found',
        messageAr: 'لم يتم العثور على المرحلة',
      });
    }

    if (milestone.escrow.booking.customerId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Only the customer can approve milestones',
        messageAr: 'العميل فقط يمكنه الموافقة على المراحل',
      });
    }

    if (milestone.status !== 'PENDING_APPROVAL') {
      return res.status(400).json({
        success: false,
        message: 'Milestone is not pending approval',
        messageAr: 'المرحلة ليست في انتظار الموافقة',
      });
    }

    // Update milestone
    const updatedMilestone = await prisma.escrowMilestone.update({
      where: { id: milestoneId },
      data: {
        status: 'APPROVED',
        approvedAt: new Date(),
        approvedBy: userId,
      },
    });

    // Calculate and release milestone payment to provider
    const booking = milestone.escrow.booking;
    const commissionRate = getCommissionRate(booking.provider.subscriptionTier);
    const commission = milestone.amount * commissionRate;
    const providerEarnings = milestone.amount - commission;

    await prisma.serviceProvider.update({
      where: { id: booking.providerId },
      data: {
        availableBalance: {
          increment: providerEarnings,
        },
      },
    });

    // Update escrow released amount
    await prisma.serviceEscrow.update({
      where: { id: milestone.escrowId },
      data: {
        releasedAmount: {
          increment: milestone.amount,
        },
      },
    });

    // Notify provider
    await prisma.notification.create({
      data: {
        userId: booking.providerId,
        type: 'MILESTONE_APPROVED',
        title: 'Milestone Approved',
        titleAr: 'تم الموافقة على المرحلة',
        message: `Customer approved milestone: ${milestone.title}. ${providerEarnings} EGP credited.`,
        messageAr: `وافق العميل على المرحلة: ${milestone.titleAr}. تم إضافة ${providerEarnings} جنيه.`,
        data: { bookingId, milestoneId, amount: providerEarnings },
      },
    });

    res.json({
      success: true,
      message: 'Milestone approved and payment released',
      messageAr: 'تم الموافقة على المرحلة وتحرير الدفعة',
      data: updatedMilestone,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Service Escrow Details
// ============================================

export const getServiceEscrow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.params;
    const { userId } = req.user!;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        escrow: {
          include: {
            milestones: {
              orderBy: { order: 'asc' },
            },
          },
        },
        provider: {
          select: {
            userId: true,
          },
        },
      },
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: 'Booking not found',
        messageAr: 'لم يتم العثور على الحجز',
      });
    }

    // Check authorization
    const isCustomer = booking.customerId === userId;
    const isProvider = booking.provider.userId === userId;

    if (!isCustomer && !isProvider) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized',
        messageAr: 'غير مصرح',
      });
    }

    res.json({
      success: true,
      data: booking.escrow,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Process Auto-Release (Cron Job Handler)
// ============================================

export const processAutoRelease = async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Find service escrows eligible for auto-release
    const eligibleEscrows = await prisma.serviceEscrow.findMany({
      where: {
        status: 'HELD',
        booking: {
          status: 'COMPLETED',
          completedAt: {
            lte: sevenDaysAgo,
          },
        },
      },
      include: {
        booking: {
          include: {
            provider: true,
          },
        },
      },
    });

    for (const escrow of eligibleEscrows) {
      const booking = escrow.booking;

      // Update escrow
      await prisma.serviceEscrow.update({
        where: { id: escrow.id },
        data: {
          status: 'RELEASED',
          releasedAmount: escrow.amount,
          releasedAt: new Date(),
          releasedBy: 'SYSTEM_AUTO',
        },
      });

      // Credit provider
      await prisma.serviceProvider.update({
        where: { id: booking.providerId },
        data: {
          availableBalance: {
            increment: booking.providerEarnings,
          },
          totalEarnings: {
            increment: booking.providerEarnings,
          },
        },
      });

      // Update booking
      await prisma.serviceBooking.update({
        where: { id: booking.id },
        data: {
          paymentStatus: 'RELEASED',
          paidOutAt: new Date(),
        },
      });

      // Notify provider
      await prisma.notification.create({
        data: {
          userId: booking.providerId,
          type: 'AUTO_RELEASE',
          title: 'Payment Auto-Released',
          titleAr: 'تم تحرير الدفعة تلقائياً',
          message: `Payment of ${booking.providerEarnings} EGP auto-released for booking ${booking.bookingNumber}`,
          messageAr: `تم تحرير ${booking.providerEarnings} جنيه تلقائياً للحجز ${booking.bookingNumber}`,
          data: { bookingId: booking.id },
        },
      });
    }

    console.log(`[Services Escrow] Auto-released ${eligibleEscrows.length} escrows`);
    return { processed: eligibleEscrows.length };
  } catch (error) {
    console.error('[Services Escrow] Error processing auto-release:', error);
    throw error;
  }
};
