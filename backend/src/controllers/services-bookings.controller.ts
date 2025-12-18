// ============================================
// Services Bookings Controller
// حجوزات الخدمات - وحدة التحكم
// ============================================

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';
import { sendNotification } from '../services/notification.service';
import { generateBookingNumber } from '../utils/generators';

// Commission rates by subscription tier
const COMMISSION_RATES = {
  FREE: 0.20,
  TRUSTED: 0.15,
  PRO: 0.12,
  ELITE: 0.10,
};

// Protection costs (percentage of service price)
const PROTECTION_COSTS = {
  NONE: 0,
  BASIC: 0,
  STANDARD: 0.05,
  PREMIUM: 0.10,
  ELITE: 0.15,
};

// Protection durations in days
const PROTECTION_DURATIONS = {
  NONE: 0,
  BASIC: 14,
  STANDARD: 30,
  PREMIUM: 90,
  ELITE: 365,
};

// ============================================
// Create Booking
// ============================================

/**
 * Create a new service booking
 * POST /api/v1/bookings
 */
export const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user!.id;
    const {
      serviceId,
      scheduledDate,
      scheduledTimeStart,
      scheduledTimeEnd,
      locationType,
      serviceAddress,
      serviceCity,
      serviceGovernorate,
      serviceLatitude,
      serviceLongitude,
      customerNotes,
      selectedAddOnIds,
      protectLevel = 'NONE',
      payWithCredits = 0,
      discountCode,
      linkedProductId,
      linkedProductType,
      isExpressService = false,
    } = req.body;

    // Validate service exists and is active
    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: true,
        addOns: { where: { isActive: true } },
      },
    });

    if (!service || !service.isActive) {
      throw new NotFoundError('Service not found');
    }

    if (service.provider.status !== 'VERIFIED') {
      throw new BadRequestError('Provider is not verified');
    }

    if (!service.provider.isAvailable) {
      throw new BadRequestError('Provider is currently unavailable');
    }

    // Check express service availability
    if (isExpressService && !service.acceptsExpressService) {
      throw new BadRequestError('Express service not available for this service');
    }

    // Calculate prices
    let basePrice = service.price;
    let addOnsPrice = 0;
    let expressCharge = 0;

    // Calculate add-ons
    const selectedAddOns: { addOnName: string; addOnPrice: number }[] = [];
    if (selectedAddOnIds && selectedAddOnIds.length > 0) {
      const addOns = service.addOns.filter((a) => selectedAddOnIds.includes(a.id));
      addOnsPrice = addOns.reduce((sum, a) => sum + a.price, 0);
      addOns.forEach((a) => {
        selectedAddOns.push({ addOnName: a.nameAr, addOnPrice: a.price });
      });
    }

    // Calculate express charge
    if (isExpressService && service.expressExtraCharge) {
      expressCharge = basePrice * (service.expressExtraCharge / 100);
    } else if (isExpressService) {
      expressCharge = basePrice * 0.50; // Default 50% extra for express
    }

    // Calculate protection charge
    const protectCharge = basePrice * PROTECTION_COSTS[protectLevel as keyof typeof PROTECTION_COSTS];

    // Calculate discount
    let discountAmount = 0;
    if (discountCode) {
      // TODO: Implement discount code validation
      // const discount = await validateDiscountCode(discountCode, serviceId);
      // if (discount) discountAmount = calculateDiscount(discount, basePrice);
    }

    // Calculate totals
    const subtotal = basePrice + addOnsPrice + expressCharge + protectCharge;
    const totalAmount = subtotal - discountAmount;

    // Calculate commission
    const commissionRate = COMMISSION_RATES[service.provider.subscriptionTier as keyof typeof COMMISSION_RATES];
    const commissionAmount = (basePrice + addOnsPrice) * commissionRate;
    const providerPayout = totalAmount - commissionAmount - protectCharge;

    // Validate credits
    let creditsToUse = 0;
    if (payWithCredits > 0) {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: customerId },
      });

      if (!wallet || wallet.tradeCredits < payWithCredits) {
        throw new BadRequestError('Insufficient trade credits');
      }

      // Credits can only cover part of the payment
      creditsToUse = Math.min(payWithCredits, totalAmount * 0.5); // Max 50% can be paid with credits
    }

    const paidWithCash = totalAmount - creditsToUse;

    // Calculate protection expiry
    let protectExpiresAt = null;
    if (protectLevel !== 'NONE') {
      const expiryDate = new Date(scheduledDate);
      expiryDate.setDate(expiryDate.getDate() + PROTECTION_DURATIONS[protectLevel as keyof typeof PROTECTION_DURATIONS]);
      protectExpiresAt = expiryDate;
    }

    // Generate booking number
    const bookingNumber = generateBookingNumber();

    // Create booking in transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking
      const newBooking = await tx.serviceBooking.create({
        data: {
          bookingNumber,
          customerId,
          providerId: service.providerId,
          serviceId,
          scheduledDate: new Date(scheduledDate),
          scheduledTimeStart,
          scheduledTimeEnd,
          locationType,
          serviceAddress,
          serviceCity,
          serviceGovernorate,
          serviceLatitude,
          serviceLongitude,
          basePrice,
          addOnsPrice,
          expressCharge,
          protectCharge,
          discountAmount,
          discountCode,
          subtotal,
          commissionAmount,
          providerPayout,
          totalAmount,
          paymentStatus: 'PENDING',
          paidWithCash,
          paidWithCredits: creditsToUse,
          protectLevel,
          protectExpiresAt,
          status: 'PENDING',
          isExpressService,
          customerNotes,
          linkedProductId,
          linkedProductType,
          selectedAddOns: {
            create: selectedAddOns,
          },
        },
        include: {
          service: true,
          provider: true,
          selectedAddOns: true,
        },
      });

      // Create escrow
      await tx.serviceEscrow.create({
        data: {
          bookingId: newBooking.id,
          totalAmount,
          heldAmount: 0,
          creditsHeld: 0,
          status: 'PENDING',
          autoReleaseHours: isExpressService ? 24 : 48,
        },
      });

      // Create initial status history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: newBooking.id,
          toStatus: 'PENDING',
          changedBy: customerId,
        },
      });

      // Create chat room
      await tx.serviceChat.create({
        data: {
          bookingId: newBooking.id,
        },
      });

      // Deduct credits if used
      if (creditsToUse > 0) {
        await tx.wallet.update({
          where: { userId: customerId },
          data: {
            tradeCredits: { decrement: creditsToUse },
            lifetimeCreditsSpent: { increment: creditsToUse },
          },
        });

        // Record transaction
        const wallet = await tx.wallet.findUnique({ where: { userId: customerId } });
        await tx.walletTransaction.create({
          data: {
            walletId: wallet!.id,
            type: 'TRADE_CREDITS_SPENT',
            amount: -creditsToUse,
            balanceBefore: wallet!.balance,
            balanceAfter: wallet!.balance,
            status: 'COMPLETED',
            relatedEntityType: 'booking',
            relatedEntityId: newBooking.id,
            description: `استخدام كريديت لحجز خدمة - ${newBooking.bookingNumber}`,
          },
        });
      }

      return newBooking;
    });

    // Send notification to provider
    await sendNotification({
      userId: service.provider.userId,
      type: 'BOOKING_REQUEST',
      titleAr: 'طلب حجز جديد',
      titleEn: 'New Booking Request',
      bodyAr: `لديك طلب حجز جديد لخدمة ${service.titleAr}`,
      bodyEn: `You have a new booking request for ${service.titleEn || service.titleAr}`,
      bookingId: booking.id,
      serviceId: service.id,
    });

    res.status(201).json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

/**
 * Calculate booking price
 * POST /api/v1/bookings/calculate-price
 */
export const calculatePrice = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      serviceId,
      selectedAddOnIds,
      protectLevel = 'NONE',
      isExpressService = false,
      discountCode,
    } = req.body;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        provider: true,
        addOns: { where: { isActive: true } },
      },
    });

    if (!service) {
      throw new NotFoundError('Service not found');
    }

    let basePrice = service.price;
    let addOnsPrice = 0;
    let expressCharge = 0;

    // Calculate add-ons
    if (selectedAddOnIds && selectedAddOnIds.length > 0) {
      const addOns = service.addOns.filter((a) => selectedAddOnIds.includes(a.id));
      addOnsPrice = addOns.reduce((sum, a) => sum + a.price, 0);
    }

    // Calculate express charge
    if (isExpressService) {
      expressCharge = basePrice * (service.expressExtraCharge || 50) / 100;
    }

    // Calculate protection charge
    const protectCharge = basePrice * PROTECTION_COSTS[protectLevel as keyof typeof PROTECTION_COSTS];

    // Calculate discount
    let discountAmount = 0;
    // TODO: Implement discount validation

    const subtotal = basePrice + addOnsPrice + expressCharge + protectCharge;
    const totalAmount = subtotal - discountAmount;

    // Get user's available credits
    const userId = req.user?.id;
    let maxCreditsUsable = 0;
    if (userId) {
      const wallet = await prisma.wallet.findUnique({ where: { userId } });
      if (wallet) {
        maxCreditsUsable = Math.min(wallet.tradeCredits, totalAmount * 0.5);
      }
    }

    res.json({
      success: true,
      data: {
        basePrice,
        addOnsPrice,
        expressCharge,
        protectCharge,
        discountAmount,
        subtotal,
        totalAmount,
        maxCreditsUsable,
        protectDetails: {
          level: protectLevel,
          cost: protectCharge,
          coverage: getProtectionCoverage(protectLevel),
          duration: `${PROTECTION_DURATIONS[protectLevel as keyof typeof PROTECTION_DURATIONS]} days`,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Bookings
// ============================================

/**
 * Get customer's bookings
 * GET /api/v1/bookings/my
 */
export const getMyBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customerId = req.user!.id;
    const { status, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const whereClause: any = { customerId };

    if (status) {
      whereClause.status = status;
    }

    const [bookings, total] = await Promise.all([
      prisma.serviceBooking.findMany({
        where: whereClause,
        include: {
          service: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              images: true,
            },
          },
          provider: {
            select: {
              id: true,
              displayNameAr: true,
              displayNameEn: true,
              profileImage: true,
              phone: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.serviceBooking.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: {
        data: bookings,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get booking by ID
 * GET /api/v1/bookings/:id
 */
export const getBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        service: true,
        provider: {
          include: {
            user: {
              select: { id: true },
            },
          },
        },
        customer: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            avatar: true,
          },
        },
        escrow: true,
        review: true,
        dispute: true,
        milestones: { orderBy: { order: 'asc' } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        selectedAddOns: true,
        chat: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    // Verify user has access (customer or provider)
    if (booking.customerId !== userId && booking.provider.user.id !== userId) {
      throw new ForbiddenError('Access denied');
    }

    res.json({ success: true, data: booking });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Booking Actions - Customer
// ============================================

/**
 * Cancel booking (customer)
 * POST /api/v1/bookings/:id/cancel
 */
export const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const customerId = req.user!.id;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: { escrow: true, provider: true },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.customerId !== customerId) {
      throw new ForbiddenError('Access denied');
    }

    // Can only cancel pending or confirmed bookings
    if (!['PENDING', 'CONFIRMED'].includes(booking.status)) {
      throw new BadRequestError('Cannot cancel booking in current status');
    }

    // Update booking
    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.serviceBooking.update({
        where: { id },
        data: {
          status: 'CANCELLED_BY_CUSTOMER',
          cancelledAt: new Date(),
          cancelledBy: 'CUSTOMER',
          cancellationReason: reason,
          paymentStatus: 'REFUNDED',
        },
      });

      // Refund credits if used
      if (booking.paidWithCredits > 0) {
        await tx.wallet.update({
          where: { userId: customerId },
          data: {
            tradeCredits: { increment: booking.paidWithCredits },
          },
        });
      }

      // Update escrow
      if (booking.escrow) {
        await tx.serviceEscrow.update({
          where: { id: booking.escrow.id },
          data: {
            status: 'REFUNDED',
            refundedAmount: booking.escrow.heldAmount,
            creditsReleased: booking.escrow.creditsHeld,
            refundedAt: new Date(),
          },
        });
      }

      // Add status history
      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: booking.status as any,
          toStatus: 'CANCELLED_BY_CUSTOMER',
          changedBy: customerId,
          note: reason,
        },
      });

      return updated;
    });

    // Notify provider
    await sendNotification({
      userId: booking.provider.userId,
      type: 'BOOKING_CANCELLED',
      titleAr: 'تم إلغاء الحجز',
      titleEn: 'Booking Cancelled',
      bodyAr: `تم إلغاء الحجز #${booking.bookingNumber} من قبل العميل`,
      bodyEn: `Booking #${booking.bookingNumber} has been cancelled by the customer`,
      bookingId: id,
    });

    res.json({ success: true, data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

/**
 * Confirm service completion (customer)
 * POST /api/v1/bookings/:id/confirm-completion
 */
export const confirmCompletion = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const customerId = req.user!.id;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: { escrow: true, provider: true, service: true },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.customerId !== customerId) {
      throw new ForbiddenError('Access denied');
    }

    if (booking.status !== 'COMPLETED') {
      throw new BadRequestError('Service must be marked as completed by provider first');
    }

    // Release escrow to provider
    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Update escrow
      if (booking.escrow) {
        await tx.serviceEscrow.update({
          where: { id: booking.escrow.id },
          data: {
            status: 'RELEASED',
            releasedAmount: booking.escrow.heldAmount,
            releasedAt: new Date(),
          },
        });
      }

      // Credit provider's wallet
      let providerWallet = await tx.wallet.findUnique({
        where: { userId: booking.provider.userId },
      });

      if (!providerWallet) {
        providerWallet = await tx.wallet.create({
          data: { userId: booking.provider.userId },
        });
      }

      await tx.wallet.update({
        where: { id: providerWallet.id },
        data: {
          balance: { increment: booking.providerPayout },
          lifetimeEarned: { increment: booking.providerPayout },
        },
      });

      // Record transaction
      await tx.walletTransaction.create({
        data: {
          walletId: providerWallet.id,
          type: 'EARNING',
          amount: booking.providerPayout,
          balanceBefore: providerWallet.balance,
          balanceAfter: providerWallet.balance + booking.providerPayout,
          status: 'COMPLETED',
          relatedEntityType: 'booking',
          relatedEntityId: booking.id,
          description: `إيرادات حجز خدمة - ${booking.bookingNumber}`,
        },
      });

      // Update provider stats
      await tx.serviceProvider.update({
        where: { id: booking.providerId },
        data: {
          completedBookings: { increment: 1 },
          totalEarnings: { increment: booking.providerPayout },
        },
      });

      // Update service stats
      await tx.service.update({
        where: { id: booking.serviceId },
        data: {
          totalBookings: { increment: 1 },
        },
      });

      // Update payment status
      const updated = await tx.serviceBooking.update({
        where: { id },
        data: {
          paymentStatus: 'RELEASED',
        },
      });

      return updated;
    });

    // Notify provider
    await sendNotification({
      userId: booking.provider.userId,
      type: 'PAYMENT_RELEASED',
      titleAr: 'تم تحرير المبلغ',
      titleEn: 'Payment Released',
      bodyAr: `تم تحرير مبلغ ${booking.providerPayout} ج.م لحجز #${booking.bookingNumber}`,
      bodyEn: `${booking.providerPayout} EGP has been released for booking #${booking.bookingNumber}`,
      bookingId: id,
    });

    res.json({ success: true, data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Booking Actions - Provider
// ============================================

/**
 * Accept booking (provider)
 * POST /api/v1/bookings/:id/accept
 */
export const acceptBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        provider: { include: { user: true } },
        service: true,
        customer: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.provider.user.id !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestError('Booking is not pending');
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.serviceBooking.update({
        where: { id },
        data: {
          status: 'CONFIRMED',
          confirmedAt: new Date(),
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: 'PENDING',
          toStatus: 'CONFIRMED',
          changedBy: userId,
        },
      });

      return updated;
    });

    // Notify customer
    await sendNotification({
      userId: booking.customerId,
      type: 'BOOKING_CONFIRMED',
      titleAr: 'تم تأكيد الحجز',
      titleEn: 'Booking Confirmed',
      bodyAr: `تم تأكيد حجزك لخدمة ${booking.service.titleAr}`,
      bodyEn: `Your booking for ${booking.service.titleEn || booking.service.titleAr} has been confirmed`,
      bookingId: id,
    });

    res.json({ success: true, data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

/**
 * Reject booking (provider)
 * POST /api/v1/bookings/:id/reject
 */
export const rejectBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const userId = req.user!.id;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        provider: { include: { user: true } },
        escrow: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.provider.user.id !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (booking.status !== 'PENDING') {
      throw new BadRequestError('Booking is not pending');
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.serviceBooking.update({
        where: { id },
        data: {
          status: 'CANCELLED_BY_PROVIDER',
          cancelledAt: new Date(),
          cancelledBy: 'PROVIDER',
          cancellationReason: reason,
          paymentStatus: 'REFUNDED',
        },
      });

      // Refund credits if used
      if (booking.paidWithCredits > 0) {
        await tx.wallet.update({
          where: { userId: booking.customerId },
          data: {
            tradeCredits: { increment: booking.paidWithCredits },
          },
        });
      }

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: 'PENDING',
          toStatus: 'CANCELLED_BY_PROVIDER',
          changedBy: userId,
          note: reason,
        },
      });

      return updated;
    });

    // Notify customer
    await sendNotification({
      userId: booking.customerId,
      type: 'BOOKING_CANCELLED',
      titleAr: 'تم رفض الحجز',
      titleEn: 'Booking Rejected',
      bodyAr: `للأسف، تم رفض حجزك. السبب: ${reason}`,
      bodyEn: `Unfortunately, your booking was rejected. Reason: ${reason}`,
      bookingId: id,
    });

    res.json({ success: true, data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

/**
 * Start on way (provider)
 * POST /api/v1/bookings/:id/on-way
 */
export const startOnWay = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        provider: { include: { user: true } },
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.provider.user.id !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (booking.status !== 'CONFIRMED') {
      throw new BadRequestError('Booking must be confirmed first');
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.serviceBooking.update({
        where: { id },
        data: {
          status: 'PROVIDER_ON_WAY',
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: 'CONFIRMED',
          toStatus: 'PROVIDER_ON_WAY',
          changedBy: userId,
        },
      });

      return updated;
    });

    // Notify customer
    await sendNotification({
      userId: booking.customerId,
      type: 'PROVIDER_ON_WAY',
      titleAr: 'مقدم الخدمة في الطريق',
      titleEn: 'Provider On the Way',
      bodyAr: 'مقدم الخدمة في طريقه إليك الآن',
      bodyEn: 'The service provider is on their way to you',
      bookingId: id,
    });

    res.json({ success: true, data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

/**
 * Start service (provider)
 * POST /api/v1/bookings/:id/start
 */
export const startService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { beforePhotos } = req.body;
    const userId = req.user!.id;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        provider: { include: { user: true } },
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.provider.user.id !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (!['CONFIRMED', 'PROVIDER_ON_WAY'].includes(booking.status)) {
      throw new BadRequestError('Cannot start service in current status');
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      const updated = await tx.serviceBooking.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          actualStartTime: new Date(),
          beforePhotos: beforePhotos || [],
        },
      });

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: booking.status as any,
          toStatus: 'IN_PROGRESS',
          changedBy: userId,
        },
      });

      return updated;
    });

    // Notify customer
    await sendNotification({
      userId: booking.customerId,
      type: 'SERVICE_STARTED',
      titleAr: 'بدأت الخدمة',
      titleEn: 'Service Started',
      bodyAr: 'بدأ مقدم الخدمة في تنفيذ الخدمة',
      bodyEn: 'The service provider has started working',
      bookingId: id,
    });

    res.json({ success: true, data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete service (provider)
 * POST /api/v1/bookings/:id/complete
 */
export const completeService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { afterPhotos, notes } = req.body;
    const userId = req.user!.id;

    const booking = await prisma.serviceBooking.findUnique({
      where: { id },
      include: {
        provider: { include: { user: true } },
        escrow: true,
      },
    });

    if (!booking) {
      throw new NotFoundError('Booking not found');
    }

    if (booking.provider.user.id !== userId) {
      throw new ForbiddenError('Access denied');
    }

    if (booking.status !== 'IN_PROGRESS') {
      throw new BadRequestError('Service must be in progress');
    }

    const updatedBooking = await prisma.$transaction(async (tx) => {
      // Calculate auto-release time
      const autoReleaseAt = new Date();
      autoReleaseAt.setHours(autoReleaseAt.getHours() + (booking.escrow?.autoReleaseHours || 48));

      const updated = await tx.serviceBooking.update({
        where: { id },
        data: {
          status: 'COMPLETED',
          actualEndTime: new Date(),
          completedAt: new Date(),
          afterPhotos: afterPhotos || [],
          providerNotes: notes,
        },
      });

      // Update escrow with auto-release time
      if (booking.escrow) {
        await tx.serviceEscrow.update({
          where: { id: booking.escrow.id },
          data: {
            autoReleaseAt,
          },
        });
      }

      await tx.bookingStatusHistory.create({
        data: {
          bookingId: id,
          fromStatus: 'IN_PROGRESS',
          toStatus: 'COMPLETED',
          changedBy: userId,
          note: notes,
        },
      });

      return updated;
    });

    // Notify customer
    await sendNotification({
      userId: booking.customerId,
      type: 'SERVICE_COMPLETED',
      titleAr: 'تم إتمام الخدمة',
      titleEn: 'Service Completed',
      bodyAr: 'تم إتمام الخدمة بنجاح. يرجى تأكيد الإتمام لتحرير المبلغ.',
      bodyEn: 'Service completed successfully. Please confirm completion to release payment.',
      bookingId: id,
    });

    res.json({ success: true, data: updatedBooking });
  } catch (error) {
    next(error);
  }
};

/**
 * Get provider's bookings
 * GET /api/v1/bookings/provider
 */
export const getProviderBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { status, date, page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    // Get provider
    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      throw new ForbiddenError('Not a provider');
    }

    const whereClause: any = { providerId: provider.id };

    if (status) {
      whereClause.status = status;
    }

    if (date) {
      const startOfDay = new Date(date as string);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date as string);
      endOfDay.setHours(23, 59, 59, 999);

      whereClause.scheduledDate = {
        gte: startOfDay,
        lte: endOfDay,
      };
    }

    const [bookings, total] = await Promise.all([
      prisma.serviceBooking.findMany({
        where: whereClause,
        include: {
          service: {
            select: {
              id: true,
              titleAr: true,
              titleEn: true,
              images: true,
            },
          },
          customer: {
            select: {
              id: true,
              fullName: true,
              phone: true,
              avatar: true,
            },
          },
        },
        orderBy: { scheduledDate: 'asc' },
        skip,
        take: Number(limit),
      }),
      prisma.serviceBooking.count({ where: whereClause }),
    ]);

    res.json({
      success: true,
      data: {
        data: bookings,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
        limit: Number(limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Helper Functions
// ============================================

function getProtectionCoverage(level: string): string {
  const coverages: Record<string, string> = {
    NONE: 'No coverage',
    BASIC: 'Free re-service if unsatisfied',
    STANDARD: 'Full refund or free re-service',
    PREMIUM: 'Full refund + 10% compensation',
    ELITE: 'Full coverage including insurance',
  };
  return coverages[level] || 'No coverage';
}
