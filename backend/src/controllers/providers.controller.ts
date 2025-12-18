// ============================================
// Providers Controller - Service Provider Management
// ============================================

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const prisma = new PrismaClient();

// ============================================
// Provider Registration
// ============================================

export const registerProvider = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const {
      businessName,
      businessNameAr,
      description,
      descriptionAr,
      categoryIds,
      governorate,
      city,
      address,
      phone,
      whatsapp,
      nationalId,
      taxRegistrationNumber,
      commercialRegistration,
      serviceAreas,
      certifications,
    } = req.body;

    // Check if user is already a provider
    const existingProvider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (existingProvider) {
      return res.status(400).json({
        success: false,
        message: 'User is already registered as a provider',
        messageAr: 'المستخدم مسجل بالفعل كمقدم خدمة',
      });
    }

    // Create provider profile
    const provider = await prisma.serviceProvider.create({
      data: {
        userId,
        businessName,
        businessNameAr,
        description,
        descriptionAr,
        governorate,
        city,
        address,
        phone,
        whatsapp,
        nationalId,
        taxRegistrationNumber,
        commercialRegistration,
        serviceAreas: serviceAreas || [],
        verificationLevel: 'BASIC',
        subscriptionTier: 'FREE',
        status: 'PENDING_APPROVAL',
        categories: {
          connect: categoryIds.map((id: string) => ({ id })),
        },
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        categories: true,
      },
    });

    // Add certifications if provided
    if (certifications && certifications.length > 0) {
      await prisma.providerCertification.createMany({
        data: certifications.map((cert: any) => ({
          providerId: provider.id,
          name: cert.name,
          nameAr: cert.nameAr,
          issuingAuthority: cert.issuingAuthority,
          issuingAuthorityAr: cert.issuingAuthorityAr,
          certificateNumber: cert.certificateNumber,
          issueDate: new Date(cert.issueDate),
          expiryDate: cert.expiryDate ? new Date(cert.expiryDate) : null,
          documentUrl: cert.documentUrl,
          status: 'PENDING',
        })),
      });
    }

    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: 'admin', // Admin user ID
        type: 'PROVIDER_REGISTRATION',
        title: 'New Provider Registration',
        titleAr: 'تسجيل مقدم خدمة جديد',
        message: `${businessName} has registered as a service provider`,
        messageAr: `تم تسجيل ${businessNameAr} كمقدم خدمة`,
        data: { providerId: provider.id },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Provider registration submitted successfully',
      messageAr: 'تم تقديم طلب التسجيل كمقدم خدمة بنجاح',
      data: provider,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Provider Profile
// ============================================

export const getProviderProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const provider = await prisma.serviceProvider.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        categories: true,
        certifications: {
          where: { status: 'VERIFIED' },
        },
        services: {
          where: { isActive: true },
          include: {
            category: true,
            _count: {
              select: { bookings: true },
            },
          },
        },
        _count: {
          select: {
            services: true,
            bookings: { where: { status: 'COMPLETED' } },
          },
        },
      },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
        messageAr: 'لم يتم العثور على مقدم الخدمة',
      });
    }

    // Get recent reviews
    const reviews = await prisma.serviceReview.findMany({
      where: {
        booking: {
          providerId: id,
        },
        status: 'APPROVED',
      },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        booking: {
          include: {
            service: {
              select: { title: true, titleAr: true },
            },
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        ...provider,
        recentReviews: reviews,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get My Provider Profile
// ============================================

export const getMyProviderProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
            phone: true,
          },
        },
        categories: true,
        certifications: true,
        subscription: true,
      },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    res.json({
      success: true,
      data: provider,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Update Provider Profile
// ============================================

export const updateProviderProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const updates = req.body;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    const updatedProvider = await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: {
        ...updates,
        categories: updates.categoryIds
          ? { set: updates.categoryIds.map((id: string) => ({ id })) }
          : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatar: true,
          },
        },
        categories: true,
      },
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      messageAr: 'تم تحديث الملف الشخصي بنجاح',
      data: updatedProvider,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get My Services
// ============================================

export const getMyServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { status, page = 1, limit = 20 } = req.query;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    const where: any = { providerId: provider.id };
    if (status === 'active') where.isActive = true;
    if (status === 'inactive') where.isActive = false;

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { createdAt: 'desc' },
        include: {
          category: true,
          _count: {
            select: {
              bookings: true,
              favorites: true,
            },
          },
        },
      }),
      prisma.service.count({ where }),
    ]);

    res.json({
      success: true,
      data: services,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Create Service
// ============================================

export const createService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const {
      categoryId,
      title,
      titleAr,
      description,
      descriptionAr,
      basePrice,
      pricingType,
      duration,
      images,
      tags,
      addOns,
      packages,
      requirements,
      faqs,
      serviceArea,
      linkedMarketplace,
    } = req.body;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    if (provider.status !== 'APPROVED') {
      return res.status(403).json({
        success: false,
        message: 'Provider account must be approved to create services',
        messageAr: 'يجب الموافقة على حساب مقدم الخدمة لإنشاء خدمات',
      });
    }

    // Check service limit based on subscription tier
    const serviceCount = await prisma.service.count({
      where: { providerId: provider.id },
    });

    const serviceLimits: Record<string, number> = {
      FREE: 5,
      TRUSTED: 15,
      PRO: 50,
      ELITE: 999,
    };

    if (serviceCount >= serviceLimits[provider.subscriptionTier]) {
      return res.status(403).json({
        success: false,
        message: `Service limit reached for ${provider.subscriptionTier} tier. Upgrade to add more services.`,
        messageAr: `تم الوصول إلى الحد الأقصى للخدمات. قم بالترقية لإضافة المزيد.`,
      });
    }

    const service = await prisma.service.create({
      data: {
        providerId: provider.id,
        categoryId,
        title,
        titleAr,
        description,
        descriptionAr,
        basePrice,
        pricingType: pricingType || 'FIXED',
        duration,
        images: images || [],
        tags: tags || [],
        addOns: addOns || [],
        packages: packages || [],
        requirements: requirements || [],
        faqs: faqs || [],
        serviceArea: serviceArea || provider.serviceAreas,
        linkedMarketplace,
        isActive: true,
      },
      include: {
        category: true,
        provider: {
          select: {
            id: true,
            businessName: true,
            businessNameAr: true,
            avatar: true,
            verificationLevel: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Service created successfully',
      messageAr: 'تم إنشاء الخدمة بنجاح',
      data: service,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Update Service
// ============================================

export const updateService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;
    const updates = req.body;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    const service = await prisma.service.findFirst({
      where: {
        id,
        providerId: provider.id,
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
        messageAr: 'لم يتم العثور على الخدمة',
      });
    }

    const updatedService = await prisma.service.update({
      where: { id },
      data: updates,
      include: {
        category: true,
        provider: {
          select: {
            id: true,
            businessName: true,
            businessNameAr: true,
            avatar: true,
            verificationLevel: true,
          },
        },
      },
    });

    res.json({
      success: true,
      message: 'Service updated successfully',
      messageAr: 'تم تحديث الخدمة بنجاح',
      data: updatedService,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Delete Service
// ============================================

export const deleteService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    const service = await prisma.service.findFirst({
      where: {
        id,
        providerId: provider.id,
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
        messageAr: 'لم يتم العثور على الخدمة',
      });
    }

    // Check for active bookings
    const activeBookings = await prisma.serviceBooking.count({
      where: {
        serviceId: id,
        status: {
          in: ['PENDING', 'CONFIRMED', 'PROVIDER_ON_WAY', 'IN_PROGRESS'],
        },
      },
    });

    if (activeBookings > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete service with active bookings',
        messageAr: 'لا يمكن حذف الخدمة مع وجود حجوزات نشطة',
      });
    }

    // Soft delete
    await prisma.service.update({
      where: { id },
      data: {
        isActive: false,
        deletedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: 'Service deleted successfully',
      messageAr: 'تم حذف الخدمة بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Availability
// ============================================

export const getAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { startDate, endDate } = req.query;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    // Get working hours
    const workingHours = await prisma.providerAvailability.findMany({
      where: {
        providerId: provider.id,
        type: 'WORKING_HOURS',
      },
    });

    // Get blocked dates in range
    const blockedDates = await prisma.providerAvailability.findMany({
      where: {
        providerId: provider.id,
        type: 'BLOCKED',
        date: {
          gte: startDate ? new Date(startDate as string) : new Date(),
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
    });

    // Get existing bookings in range
    const bookings = await prisma.serviceBooking.findMany({
      where: {
        providerId: provider.id,
        status: {
          in: ['CONFIRMED', 'PROVIDER_ON_WAY', 'IN_PROGRESS'],
        },
        scheduledDate: {
          gte: startDate ? new Date(startDate as string) : new Date(),
          lte: endDate ? new Date(endDate as string) : undefined,
        },
      },
      select: {
        id: true,
        scheduledDate: true,
        scheduledTime: true,
        estimatedDuration: true,
        service: {
          select: {
            title: true,
            titleAr: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: {
        workingHours,
        blockedDates,
        bookings,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Update Availability
// ============================================

export const updateAvailability = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { workingHours, blockedDates } = req.body;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    // Update working hours
    if (workingHours) {
      // Delete existing working hours
      await prisma.providerAvailability.deleteMany({
        where: {
          providerId: provider.id,
          type: 'WORKING_HOURS',
        },
      });

      // Create new working hours
      await prisma.providerAvailability.createMany({
        data: workingHours.map((wh: any) => ({
          providerId: provider.id,
          type: 'WORKING_HOURS',
          dayOfWeek: wh.dayOfWeek,
          startTime: wh.startTime,
          endTime: wh.endTime,
          isAvailable: wh.isAvailable,
        })),
      });
    }

    // Update blocked dates
    if (blockedDates) {
      for (const bd of blockedDates) {
        if (bd.action === 'add') {
          await prisma.providerAvailability.create({
            data: {
              providerId: provider.id,
              type: 'BLOCKED',
              date: new Date(bd.date),
              reason: bd.reason,
            },
          });
        } else if (bd.action === 'remove') {
          await prisma.providerAvailability.deleteMany({
            where: {
              providerId: provider.id,
              type: 'BLOCKED',
              date: new Date(bd.date),
            },
          });
        }
      }
    }

    res.json({
      success: true,
      message: 'Availability updated successfully',
      messageAr: 'تم تحديث الأوقات المتاحة بنجاح',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Provider Statistics
// ============================================

export const getStatistics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { period = '30' } = req.query;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - Number(period));

    // Get booking stats
    const [totalBookings, completedBookings, cancelledBookings, pendingBookings] = await Promise.all([
      prisma.serviceBooking.count({
        where: {
          providerId: provider.id,
          createdAt: { gte: startDate },
        },
      }),
      prisma.serviceBooking.count({
        where: {
          providerId: provider.id,
          status: 'COMPLETED',
          createdAt: { gte: startDate },
        },
      }),
      prisma.serviceBooking.count({
        where: {
          providerId: provider.id,
          status: {
            in: ['CANCELLED_BY_CUSTOMER', 'CANCELLED_BY_PROVIDER'],
          },
          createdAt: { gte: startDate },
        },
      }),
      prisma.serviceBooking.count({
        where: {
          providerId: provider.id,
          status: 'PENDING',
        },
      }),
    ]);

    // Get earnings
    const earnings = await prisma.serviceBooking.aggregate({
      where: {
        providerId: provider.id,
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      _sum: {
        providerEarnings: true,
      },
    });

    // Get average rating
    const reviews = await prisma.serviceReview.aggregate({
      where: {
        booking: {
          providerId: provider.id,
        },
        status: 'APPROVED',
        createdAt: { gte: startDate },
      },
      _avg: {
        rating: true,
      },
      _count: true,
    });

    // Get daily breakdown
    const dailyBookings = await prisma.serviceBooking.groupBy({
      by: ['createdAt'],
      where: {
        providerId: provider.id,
        createdAt: { gte: startDate },
      },
      _count: true,
    });

    // Get top services
    const topServices = await prisma.serviceBooking.groupBy({
      by: ['serviceId'],
      where: {
        providerId: provider.id,
        status: 'COMPLETED',
        createdAt: { gte: startDate },
      },
      _count: true,
      orderBy: {
        _count: {
          serviceId: 'desc',
        },
      },
      take: 5,
    });

    const topServicesWithDetails = await Promise.all(
      topServices.map(async (ts) => {
        const service = await prisma.service.findUnique({
          where: { id: ts.serviceId },
          select: {
            id: true,
            title: true,
            titleAr: true,
            images: true,
          },
        });
        return {
          ...service,
          bookingCount: ts._count,
        };
      })
    );

    res.json({
      success: true,
      data: {
        overview: {
          totalBookings,
          completedBookings,
          cancelledBookings,
          pendingBookings,
          completionRate: totalBookings > 0 ? ((completedBookings / totalBookings) * 100).toFixed(1) : 0,
        },
        earnings: {
          total: earnings._sum.providerEarnings || 0,
          currency: 'EGP',
        },
        rating: {
          average: reviews._avg.rating || 0,
          count: reviews._count,
        },
        topServices: topServicesWithDetails,
        period: Number(period),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Earnings
// ============================================

export const getEarnings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { startDate, endDate, page = 1, limit = 20 } = req.query;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    const dateFilter: any = {};
    if (startDate) dateFilter.gte = new Date(startDate as string);
    if (endDate) dateFilter.lte = new Date(endDate as string);

    // Get completed bookings with earnings
    const [bookings, total, totals] = await Promise.all([
      prisma.serviceBooking.findMany({
        where: {
          providerId: provider.id,
          status: 'COMPLETED',
          completedAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: { completedAt: 'desc' },
        select: {
          id: true,
          bookingNumber: true,
          totalAmount: true,
          commissionAmount: true,
          providerEarnings: true,
          completedAt: true,
          service: {
            select: {
              id: true,
              title: true,
              titleAr: true,
            },
          },
          customer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      }),
      prisma.serviceBooking.count({
        where: {
          providerId: provider.id,
          status: 'COMPLETED',
          completedAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        },
      }),
      prisma.serviceBooking.aggregate({
        where: {
          providerId: provider.id,
          status: 'COMPLETED',
          completedAt: Object.keys(dateFilter).length > 0 ? dateFilter : undefined,
        },
        _sum: {
          totalAmount: true,
          commissionAmount: true,
          providerEarnings: true,
        },
      }),
    ]);

    // Get available balance (earnings not yet paid out)
    const availableBalance = await prisma.serviceBooking.aggregate({
      where: {
        providerId: provider.id,
        status: 'COMPLETED',
        paidOutAt: null,
      },
      _sum: {
        providerEarnings: true,
      },
    });

    // Get pending payouts
    const pendingPayouts = await prisma.providerPayout.aggregate({
      where: {
        providerId: provider.id,
        status: 'PENDING',
      },
      _sum: {
        amount: true,
      },
    });

    res.json({
      success: true,
      data: {
        earnings: bookings,
        summary: {
          totalRevenue: totals._sum.totalAmount || 0,
          totalCommission: totals._sum.commissionAmount || 0,
          totalEarnings: totals._sum.providerEarnings || 0,
          availableBalance: availableBalance._sum.providerEarnings || 0,
          pendingPayouts: pendingPayouts._sum.amount || 0,
        },
      },
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Request Payout
// ============================================

export const requestPayout = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { amount, paymentMethod, accountDetails } = req.body;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    // Get available balance
    const availableBalance = await prisma.serviceBooking.aggregate({
      where: {
        providerId: provider.id,
        status: 'COMPLETED',
        paidOutAt: null,
      },
      _sum: {
        providerEarnings: true,
      },
    });

    const available = availableBalance._sum.providerEarnings || 0;

    if (amount > available) {
      return res.status(400).json({
        success: false,
        message: 'Requested amount exceeds available balance',
        messageAr: 'المبلغ المطلوب يتجاوز الرصيد المتاح',
      });
    }

    const minPayout = 100; // Minimum payout 100 EGP
    if (amount < minPayout) {
      return res.status(400).json({
        success: false,
        message: `Minimum payout amount is ${minPayout} EGP`,
        messageAr: `الحد الأدنى للسحب هو ${minPayout} جنيه`,
      });
    }

    // Create payout request
    const payout = await prisma.providerPayout.create({
      data: {
        providerId: provider.id,
        amount,
        paymentMethod,
        accountDetails,
        status: 'PENDING',
      },
    });

    // Create notification for admin
    await prisma.notification.create({
      data: {
        userId: 'admin',
        type: 'PAYOUT_REQUEST',
        title: 'New Payout Request',
        titleAr: 'طلب سحب جديد',
        message: `${provider.businessName} requested a payout of ${amount} EGP`,
        messageAr: `${provider.businessNameAr} طلب سحب ${amount} جنيه`,
        data: { payoutId: payout.id, providerId: provider.id },
      },
    });

    res.status(201).json({
      success: true,
      message: 'Payout request submitted successfully',
      messageAr: 'تم تقديم طلب السحب بنجاح',
      data: payout,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Subscription
// ============================================

export const getSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
      include: {
        subscription: true,
      },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    const tierDetails: Record<string, any> = {
      FREE: {
        price: 0,
        commission: 20,
        features: {
          en: ['Basic listing', 'Up to 5 services', 'Email support'],
          ar: ['قائمة أساسية', 'حتى 5 خدمات', 'دعم بالبريد الإلكتروني'],
        },
      },
      TRUSTED: {
        price: 300,
        commission: 15,
        features: {
          en: ['Priority listing', 'Up to 15 services', 'Faster support', 'Basic analytics'],
          ar: ['أولوية في الظهور', 'حتى 15 خدمة', 'دعم أسرع', 'تحليلات أساسية'],
        },
      },
      PRO: {
        price: 700,
        commission: 12,
        features: {
          en: ['Pro badge', 'Up to 50 services', 'Advanced analytics', 'Live support', 'Free promotion'],
          ar: ['شارة Pro', 'حتى 50 خدمة', 'تحليلات متقدمة', 'دعم مباشر', 'ترويج مجاني'],
        },
      },
      ELITE: {
        price: 1500,
        commission: 10,
        features: {
          en: ['Same-day guarantee', 'Unlimited services', 'Dedicated account manager', 'VIP promotion', 'Emergency priority'],
          ar: ['ضمان التسليم في نفس اليوم', 'خدمات غير محدودة', 'مدير حساب مخصص', 'ترويج VIP', 'الأولوية في الطوارئ'],
        },
      },
    };

    res.json({
      success: true,
      data: {
        currentTier: provider.subscriptionTier,
        subscription: provider.subscription,
        tierDetails: tierDetails[provider.subscriptionTier],
        allTiers: tierDetails,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Upgrade Subscription
// ============================================

export const upgradeSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { tier, paymentMethod } = req.body;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    const tierOrder = ['FREE', 'TRUSTED', 'PRO', 'ELITE'];
    const currentIndex = tierOrder.indexOf(provider.subscriptionTier);
    const newIndex = tierOrder.indexOf(tier);

    if (newIndex <= currentIndex) {
      return res.status(400).json({
        success: false,
        message: 'Can only upgrade to a higher tier',
        messageAr: 'يمكن الترقية فقط إلى مستوى أعلى',
      });
    }

    const prices: Record<string, number> = {
      TRUSTED: 300,
      PRO: 700,
      ELITE: 1500,
    };

    // Create subscription record
    const subscription = await prisma.providerSubscription.create({
      data: {
        providerId: provider.id,
        tier,
        price: prices[tier],
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        status: 'ACTIVE',
        paymentMethod,
      },
    });

    // Update provider tier
    await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: {
        subscriptionTier: tier,
      },
    });

    res.json({
      success: true,
      message: `Successfully upgraded to ${tier} tier`,
      messageAr: `تمت الترقية بنجاح إلى مستوى ${tier}`,
      data: subscription,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Toggle Express Mode
// ============================================

export const toggleExpressMode = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { enabled } = req.body;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    // Check eligibility for express mode
    if (enabled) {
      if (provider.rating < 4.5) {
        return res.status(400).json({
          success: false,
          message: 'Minimum 4.5 rating required for Express mode',
          messageAr: 'يجب أن يكون التقييم 4.5 على الأقل للوضع السريع',
        });
      }

      if (provider.completedBookings < 20) {
        return res.status(400).json({
          success: false,
          message: 'Minimum 20 completed bookings required for Express mode',
          messageAr: 'يجب إكمال 20 حجز على الأقل للوضع السريع',
        });
      }
    }

    await prisma.serviceProvider.update({
      where: { id: provider.id },
      data: {
        expressEnabled: enabled,
        expressUpdatedAt: new Date(),
      },
    });

    res.json({
      success: true,
      message: enabled ? 'Express mode enabled' : 'Express mode disabled',
      messageAr: enabled ? 'تم تفعيل الوضع السريع' : 'تم إيقاف الوضع السريع',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Add Certification
// ============================================

export const addCertification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const {
      name,
      nameAr,
      issuingAuthority,
      issuingAuthorityAr,
      certificateNumber,
      issueDate,
      expiryDate,
      documentUrl,
    } = req.body;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    const certification = await prisma.providerCertification.create({
      data: {
        providerId: provider.id,
        name,
        nameAr,
        issuingAuthority,
        issuingAuthorityAr,
        certificateNumber,
        issueDate: new Date(issueDate),
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        documentUrl,
        status: 'PENDING',
      },
    });

    res.status(201).json({
      success: true,
      message: 'Certification submitted for verification',
      messageAr: 'تم تقديم الشهادة للتحقق',
      data: certification,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Certifications
// ============================================

export const getCertifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;

    const provider = await prisma.serviceProvider.findUnique({
      where: { userId },
    });

    if (!provider) {
      return res.status(404).json({
        success: false,
        message: 'Provider profile not found',
        messageAr: 'لم يتم العثور على ملف مقدم الخدمة',
      });
    }

    const certifications = await prisma.providerCertification.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: certifications,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Search Providers
// ============================================

export const searchProviders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      query,
      categoryId,
      governorate,
      verificationLevel,
      minRating,
      expressOnly,
      sortBy = 'rating',
      page = 1,
      limit = 20,
    } = req.query;

    const where: any = {
      status: 'APPROVED',
    };

    if (query) {
      where.OR = [
        { businessName: { contains: query as string, mode: 'insensitive' } },
        { businessNameAr: { contains: query as string, mode: 'insensitive' } },
        { description: { contains: query as string, mode: 'insensitive' } },
      ];
    }

    if (categoryId) {
      where.categories = { some: { id: categoryId as string } };
    }

    if (governorate) {
      where.governorate = governorate;
    }

    if (verificationLevel) {
      where.verificationLevel = verificationLevel;
    }

    if (minRating) {
      where.rating = { gte: Number(minRating) };
    }

    if (expressOnly === 'true') {
      where.expressEnabled = true;
    }

    let orderBy: any;
    switch (sortBy) {
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'bookings':
        orderBy = { completedBookings: 'desc' };
        break;
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    const [providers, total] = await Promise.all([
      prisma.serviceProvider.findMany({
        where,
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy,
        select: {
          id: true,
          businessName: true,
          businessNameAr: true,
          avatar: true,
          coverImage: true,
          governorate: true,
          city: true,
          rating: true,
          reviewCount: true,
          completedBookings: true,
          verificationLevel: true,
          subscriptionTier: true,
          expressEnabled: true,
          categories: {
            select: {
              id: true,
              name: true,
              nameAr: true,
            },
          },
        },
      }),
      prisma.serviceProvider.count({ where }),
    ]);

    res.json({
      success: true,
      data: providers,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    next(error);
  }
};
