// ============================================
// Services Marketplace Controller
// سوق الخدمات - وحدة التحكم
// ============================================

import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { BadRequestError, NotFoundError, ForbiddenError } from '../utils/errors';

// ============================================
// Service Categories
// ============================================

/**
 * Get all service categories (hierarchical)
 * GET /api/v1/services/categories
 */
export const getCategories = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { flat, linkedMarketplace } = req.query;

    const whereClause: any = { isActive: true };

    if (linkedMarketplace) {
      whereClause.linkedMarketplace = linkedMarketplace;
    }

    if (flat === 'true') {
      // Return flat list
      const categories = await prisma.serviceCategory.findMany({
        where: whereClause,
        orderBy: [{ order: 'asc' }, { nameAr: 'asc' }],
      });
      return res.json({ success: true, data: categories });
    }

    // Return hierarchical (parent-children)
    const categories = await prisma.serviceCategory.findMany({
      where: {
        ...whereClause,
        parentId: null, // Only top-level
      },
      include: {
        children: {
          where: { isActive: true },
          include: {
            children: {
              where: { isActive: true },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
      orderBy: { order: 'asc' },
    });

    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category by ID or slug
 * GET /api/v1/services/categories/:idOrSlug
 */
export const getCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { idOrSlug } = req.params;

    const category = await prisma.serviceCategory.findFirst({
      where: {
        OR: [
          { id: idOrSlug },
          { slug: idOrSlug },
        ],
        isActive: true,
      },
      include: {
        parent: true,
        children: {
          where: { isActive: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Services
// ============================================

/**
 * Search services with filters
 * GET /api/v1/services/search
 */
export const searchServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      query,
      categoryId,
      linkedMarketplace,
      governorate,
      city,
      minPrice,
      maxPrice,
      minRating,
      pricingType,
      locationType,
      isExpressAvailable,
      sortBy = 'rating',
      sortOrder = 'desc',
      page = 1,
      limit = 20,
      latitude,
      longitude,
      radius,
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build where clause
    const whereClause: any = {
      isActive: true,
      provider: {
        status: 'VERIFIED',
        isAvailable: true,
      },
    };

    // Text search
    if (query) {
      whereClause.OR = [
        { titleAr: { contains: query as string, mode: 'insensitive' } },
        { titleEn: { contains: query as string, mode: 'insensitive' } },
        { descriptionAr: { contains: query as string, mode: 'insensitive' } },
        { tags: { has: query as string } },
        { tagsAr: { has: query as string } },
      ];
    }

    // Category filter
    if (categoryId) {
      whereClause.categoryId = categoryId;
    }

    // Marketplace filter
    if (linkedMarketplace) {
      whereClause.linkedMarketplace = linkedMarketplace;
    }

    // Location filter
    if (governorate) {
      whereClause.provider = {
        ...whereClause.provider,
        governorate: governorate as string,
      };
    }

    if (city) {
      whereClause.provider = {
        ...whereClause.provider,
        city: city as string,
      };
    }

    // Price filter
    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price.gte = Number(minPrice);
      if (maxPrice) whereClause.price.lte = Number(maxPrice);
    }

    // Rating filter
    if (minRating) {
      whereClause.rating = { gte: Number(minRating) };
    }

    // Pricing type filter
    if (pricingType) {
      whereClause.pricingType = pricingType;
    }

    // Location type filter
    if (locationType) {
      whereClause.locationType = locationType;
    }

    // Express filter
    if (isExpressAvailable === 'true') {
      whereClause.acceptsExpressService = true;
    }

    // Build order clause
    let orderBy: any = {};
    switch (sortBy) {
      case 'price':
        orderBy = { price: sortOrder };
        break;
      case 'rating':
        orderBy = { rating: sortOrder };
        break;
      case 'reviews':
        orderBy = { totalReviews: sortOrder };
        break;
      case 'newest':
        orderBy = { createdAt: sortOrder };
        break;
      case 'bookings':
        orderBy = { totalBookings: sortOrder };
        break;
      default:
        orderBy = { rating: 'desc' };
    }

    // Execute query
    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: whereClause,
        include: {
          provider: {
            select: {
              id: true,
              displayNameAr: true,
              displayNameEn: true,
              profileImage: true,
              rating: true,
              totalReviews: true,
              verificationLevel: true,
              subscriptionTier: true,
              governorate: true,
              city: true,
              latitude: true,
              longitude: true,
            },
          },
          category: {
            select: {
              id: true,
              nameAr: true,
              nameEn: true,
              slug: true,
            },
          },
        },
        orderBy,
        skip,
        take: Number(limit),
      }),
      prisma.service.count({ where: whereClause }),
    ]);

    // Calculate distance if coordinates provided
    let servicesWithDistance = services;
    if (latitude && longitude) {
      servicesWithDistance = services.map((service) => {
        if (service.provider.latitude && service.provider.longitude) {
          const distance = calculateDistance(
            Number(latitude),
            Number(longitude),
            service.provider.latitude,
            service.provider.longitude
          );
          return { ...service, distance };
        }
        return service;
      });

      // Filter by radius if provided
      if (radius) {
        servicesWithDistance = servicesWithDistance.filter(
          (s: any) => s.distance && s.distance <= Number(radius)
        );
      }

      // Sort by distance if requested
      if (sortBy === 'distance') {
        servicesWithDistance.sort((a: any, b: any) => {
          const distA = a.distance || Infinity;
          const distB = b.distance || Infinity;
          return sortOrder === 'asc' ? distA - distB : distB - distA;
        });
      }
    }

    res.json({
      success: true,
      data: {
        data: servicesWithDistance,
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
 * Get service by ID
 * GET /api/v1/services/:id
 */
export const getService = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const service = await prisma.service.findUnique({
      where: { id },
      include: {
        provider: {
          include: {
            certifications: {
              where: { isVerified: true },
            },
            serviceAreas: true,
          },
        },
        category: true,
        addOns: {
          where: { isActive: true },
        },
        packages: {
          where: { isActive: true },
        },
        reviews: {
          where: { isVisible: true },
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            customer: {
              select: {
                id: true,
                fullName: true,
                avatar: true,
              },
            },
          },
        },
      },
    });

    if (!service || !service.isActive) {
      throw new NotFoundError('Service not found');
    }

    // Increment view count
    await prisma.service.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({ success: true, data: service });
  } catch (error) {
    next(error);
  }
};

/**
 * Get featured services
 * GET /api/v1/services/featured
 */
export const getFeaturedServices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { limit = 10, linkedMarketplace } = req.query;

    const whereClause: any = {
      isActive: true,
      isFeatured: true,
      provider: {
        status: 'VERIFIED',
        isAvailable: true,
      },
    };

    if (linkedMarketplace) {
      whereClause.linkedMarketplace = linkedMarketplace;
    }

    const services = await prisma.service.findMany({
      where: whereClause,
      include: {
        provider: {
          select: {
            id: true,
            displayNameAr: true,
            displayNameEn: true,
            profileImage: true,
            rating: true,
            verificationLevel: true,
            governorate: true,
            city: true,
          },
        },
        category: {
          select: {
            id: true,
            nameAr: true,
            nameEn: true,
          },
        },
      },
      orderBy: [
        { rating: 'desc' },
        { totalBookings: 'desc' },
      ],
      take: Number(limit),
    });

    res.json({ success: true, data: services });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Service Recommendations (Smart Linking)
// ============================================

/**
 * Get service recommendations for a product
 * POST /api/v1/services/recommend
 */
export const getRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId, productType, transactionStage } = req.body;

    if (!productId || !productType || !transactionStage) {
      throw new BadRequestError('Missing required fields');
    }

    // Get recommendation rules
    const rules = await prisma.serviceRecommendationRule.findMany({
      where: {
        productType: productType,
        timing: transactionStage,
        isActive: true,
      },
      include: {
        serviceCategory: true,
      },
      orderBy: { priority: 'desc' },
      take: 5,
    });

    // Get recommended services
    const recommendations = await Promise.all(
      rules.map(async (rule) => {
        const services = await prisma.service.findMany({
          where: {
            categoryId: rule.serviceCategoryId,
            isActive: true,
            provider: {
              status: 'VERIFIED',
              isAvailable: true,
            },
          },
          include: {
            provider: {
              select: {
                id: true,
                displayNameAr: true,
                displayNameEn: true,
                profileImage: true,
                rating: true,
                verificationLevel: true,
              },
            },
          },
          orderBy: [
            { rating: 'desc' },
            { totalBookings: 'desc' },
          ],
          take: 3,
        });

        return services.map((service) => ({
          serviceId: service.id,
          serviceName: service.titleAr,
          serviceNameEn: service.titleEn,
          provider: service.provider,
          price: service.price,
          timing: rule.timing,
          badge: service.provider.verificationLevel,
          discount: rule.discountPercentage ? `${rule.discountPercentage}% خصم` : null,
          description: rule.descriptionAr,
          descriptionEn: rule.descriptionEn,
        }));
      })
    );

    res.json({ success: true, data: recommendations.flat() });
  } catch (error) {
    next(error);
  }
};

/**
 * Get recommendations for auction winner
 * POST /api/v1/services/recommend/auction-winner
 */
export const getAuctionWinnerRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { auctionId, itemType } = req.body;

    // Get relevant service categories for auctions
    const categories = await prisma.serviceCategory.findMany({
      where: {
        linkedMarketplace: itemType || 'AUCTIONS',
        isActive: true,
      },
    });

    const services = await prisma.service.findMany({
      where: {
        categoryId: { in: categories.map((c) => c.id) },
        isActive: true,
        provider: {
          status: 'VERIFIED',
        },
      },
      include: {
        provider: {
          select: {
            id: true,
            displayNameAr: true,
            displayNameEn: true,
            profileImage: true,
            rating: true,
            verificationLevel: true,
          },
        },
        category: true,
      },
      orderBy: { rating: 'desc' },
      take: 10,
    });

    const recommendations = services.map((service) => ({
      serviceId: service.id,
      serviceName: service.titleAr,
      serviceNameEn: service.titleEn,
      provider: service.provider,
      price: service.price,
      timing: 'after_auction_win',
      category: service.category.nameAr,
      categoryEn: service.category.nameEn,
      discount: '10% خصم للفائزين', // Special auction winner discount
    }));

    res.json({ success: true, data: recommendations });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Favorites
// ============================================

/**
 * Add service to favorites
 * POST /api/v1/services/:id/favorite
 */
export const addToFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    // Check if service exists
    const service = await prisma.service.findUnique({ where: { id } });
    if (!service) {
      throw new NotFoundError('Service not found');
    }

    // Add to favorites (upsert to avoid duplicates)
    await prisma.serviceFavorite.upsert({
      where: {
        userId_serviceId: {
          userId,
          serviceId: id,
        },
      },
      create: {
        userId,
        serviceId: id,
      },
      update: {},
    });

    res.json({ success: true, message: 'Added to favorites' });
  } catch (error) {
    next(error);
  }
};

/**
 * Remove from favorites
 * DELETE /api/v1/services/:id/favorite
 */
export const removeFromFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    await prisma.serviceFavorite.deleteMany({
      where: {
        userId,
        serviceId: id,
      },
    });

    res.json({ success: true, message: 'Removed from favorites' });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user's favorite services
 * GET /api/v1/services/favorites
 */
export const getFavorites = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);

    const [favorites, total] = await Promise.all([
      prisma.serviceFavorite.findMany({
        where: { userId },
        include: {
          service: {
            include: {
              provider: {
                select: {
                  id: true,
                  displayNameAr: true,
                  displayNameEn: true,
                  profileImage: true,
                  rating: true,
                  verificationLevel: true,
                },
              },
              category: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: Number(limit),
      }),
      prisma.serviceFavorite.count({ where: { userId } }),
    ]);

    // Extract services
    const services = favorites.map((f) => f.service);

    res.json({
      success: true,
      data: {
        data: services,
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
 * Track service view (analytics)
 * POST /api/v1/services/:id/view
 */
export const trackServiceView = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    await prisma.service.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Helper Functions
// ============================================

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}
