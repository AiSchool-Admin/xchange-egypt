// ============================================
// Smart Linking Engine Controller
// Product-to-Service Recommendation System
// ============================================

import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Marketplace to Service Category Mappings
const MARKETPLACE_SERVICE_MAPPINGS: Record<string, string[]> = {
  CARS: [
    'car-maintenance',
    'car-repair',
    'car-wash',
    'car-detailing',
    'tire-services',
    'car-inspection',
    'car-tinting',
    'car-accessories-installation',
    'car-insurance',
    'car-registration',
  ],
  REAL_ESTATE: [
    'home-inspection',
    'property-valuation',
    'legal-services',
    'moving-services',
    'cleaning-services',
    'home-maintenance',
    'plumbing',
    'electrical',
    'painting',
    'interior-design',
    'furniture-assembly',
    'ac-services',
    'security-installation',
  ],
  MOBILES: [
    'mobile-repair',
    'screen-replacement',
    'battery-replacement',
    'data-recovery',
    'phone-unlocking',
    'accessories-installation',
    'software-services',
  ],
  GOLD: [
    'jewelry-appraisal',
    'jewelry-repair',
    'jewelry-cleaning',
    'custom-jewelry-design',
    'gold-testing',
    'engraving',
  ],
  SILVER: [
    'silver-polishing',
    'silver-repair',
    'silver-appraisal',
    'antique-restoration',
  ],
  LUXURY: [
    'luxury-item-authentication',
    'luxury-repair',
    'watch-repair',
    'bag-restoration',
    'leather-care',
    'personal-shopping',
  ],
  SCRAP: [
    'pickup-services',
    'recycling-services',
    'disposal-services',
    'junk-removal',
  ],
  AUCTIONS: [
    'item-appraisal',
    'auction-consulting',
    'legal-services',
    'item-restoration',
    'shipping-services',
  ],
  TENDERS: [
    'bid-preparation',
    'legal-consulting',
    'document-preparation',
    'translation-services',
  ],
  BARTER: [
    'item-appraisal',
    'item-inspection',
    'legal-services',
    'shipping-services',
  ],
};

// ============================================
// Get Smart Recommendations
// ============================================

export const getSmartRecommendations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { limit = 10 } = req.query;

    // Get user's recent purchases/transactions from all marketplaces
    const recentPurchases = await prisma.order.findMany({
      where: {
        buyerId: userId,
        status: 'COMPLETED',
        createdAt: {
          gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000), // Last 90 days
        },
      },
      include: {
        listing: {
          select: {
            category: true,
            marketplace: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    // Collect relevant service categories based on purchases
    const relevantCategories: Set<string> = new Set();
    const purchaseContexts: Array<{
      marketplace: string;
      productTitle: string;
      purchaseDate: Date;
    }> = [];

    for (const purchase of recentPurchases) {
      const marketplace = purchase.listing?.marketplace as string;
      if (marketplace && MARKETPLACE_SERVICE_MAPPINGS[marketplace]) {
        MARKETPLACE_SERVICE_MAPPINGS[marketplace].forEach((cat) => relevantCategories.add(cat));
        purchaseContexts.push({
          marketplace,
          productTitle: purchase.listing?.title || '',
          purchaseDate: purchase.createdAt,
        });
      }
    }

    // Get services from relevant categories
    const services = await prisma.service.findMany({
      where: {
        category: {
          slug: {
            in: Array.from(relevantCategories),
          },
        },
        isActive: true,
        provider: {
          status: 'APPROVED',
        },
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            businessNameAr: true,
            avatar: true,
            rating: true,
            reviewCount: true,
            verificationLevel: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { provider: { rating: 'desc' } },
        { completedCount: 'desc' },
      ],
      take: Number(limit),
    });

    // Calculate relevance score for each service
    const scoredServices = services.map((service) => {
      let relevanceScore = 0;
      const categorySlug = service.category.slug;

      // Score based on recency of related purchase
      purchaseContexts.forEach((purchase, index) => {
        const mappings = MARKETPLACE_SERVICE_MAPPINGS[purchase.marketplace] || [];
        if (mappings.includes(categorySlug)) {
          // More recent purchases get higher weight
          relevanceScore += 10 - index;
          // Additional weight for direct matches
          if (service.title.toLowerCase().includes(purchase.productTitle.toLowerCase().slice(0, 10))) {
            relevanceScore += 5;
          }
        }
      });

      // Boost by provider rating
      relevanceScore += (service.provider.rating || 0) * 2;

      // Boost verified providers
      if (service.provider.verificationLevel === 'XCHANGE_CERTIFIED') {
        relevanceScore += 10;
      } else if (service.provider.verificationLevel === 'ELITE') {
        relevanceScore += 7;
      } else if (service.provider.verificationLevel === 'PRO') {
        relevanceScore += 5;
      }

      return {
        ...service,
        relevanceScore,
        recommendationReason: getRecommendationReason(categorySlug, purchaseContexts),
      };
    });

    // Sort by relevance score
    scoredServices.sort((a, b) => b.relevanceScore - a.relevanceScore);

    res.json({
      success: true,
      data: scoredServices.slice(0, Number(limit)),
      meta: {
        basedOnPurchases: purchaseContexts.length,
        totalRecommendations: scoredServices.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Recommendations for Product
// ============================================

export const getRecommendationsForProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const { limit = 6 } = req.query;

    // Get product/listing details
    const listing = await prisma.listing.findUnique({
      where: { id: productId },
      select: {
        marketplace: true,
        category: true,
        title: true,
        titleAr: true,
      },
    });

    if (!listing) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
        messageAr: 'لم يتم العثور على المنتج',
      });
    }

    const marketplace = listing.marketplace as string;
    const relevantCategories = MARKETPLACE_SERVICE_MAPPINGS[marketplace] || [];

    if (relevantCategories.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No related services found',
        messageAr: 'لا توجد خدمات متعلقة',
      });
    }

    // Get services from relevant categories
    const services = await prisma.service.findMany({
      where: {
        category: {
          slug: {
            in: relevantCategories,
          },
        },
        isActive: true,
        provider: {
          status: 'APPROVED',
        },
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            businessNameAr: true,
            avatar: true,
            rating: true,
            reviewCount: true,
            verificationLevel: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
            icon: true,
          },
        },
      },
      orderBy: [
        { provider: { rating: 'desc' } },
        { completedCount: 'desc' },
      ],
      take: Number(limit),
    });

    // Add context message
    const contextMessage = {
      en: `Services related to your ${listing.title || marketplace.toLowerCase()} purchase`,
      ar: `خدمات متعلقة بشرائك: ${listing.titleAr || listing.title}`,
    };

    res.json({
      success: true,
      data: services.map((service) => ({
        ...service,
        linkedMarketplace: marketplace,
        contextMessage,
      })),
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Services by Marketplace
// ============================================

export const getServicesByMarketplace = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { marketplace } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const normalizedMarketplace = marketplace.toUpperCase();
    const relevantCategories = MARKETPLACE_SERVICE_MAPPINGS[normalizedMarketplace] || [];

    if (relevantCategories.length === 0) {
      return res.json({
        success: true,
        data: [],
        message: 'No services linked to this marketplace',
        messageAr: 'لا توجد خدمات مرتبطة بهذا السوق',
      });
    }

    const [services, total] = await Promise.all([
      prisma.service.findMany({
        where: {
          category: {
            slug: {
              in: relevantCategories,
            },
          },
          isActive: true,
          provider: {
            status: 'APPROVED',
          },
        },
        include: {
          provider: {
            select: {
              id: true,
              businessName: true,
              businessNameAr: true,
              avatar: true,
              rating: true,
              reviewCount: true,
              verificationLevel: true,
              expressEnabled: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              nameAr: true,
              icon: true,
            },
          },
        },
        skip: (Number(page) - 1) * Number(limit),
        take: Number(limit),
        orderBy: [
          { isFeatured: 'desc' },
          { provider: { rating: 'desc' } },
        ],
      }),
      prisma.service.count({
        where: {
          category: {
            slug: {
              in: relevantCategories,
            },
          },
          isActive: true,
          provider: {
            status: 'APPROVED',
          },
        },
      }),
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
      marketplace: {
        code: normalizedMarketplace,
        linkedCategories: relevantCategories,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Get Cross-Sell Suggestions
// ============================================

export const getCrossSellSuggestions = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { serviceId } = req.params;
    const { limit = 4 } = req.query;

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      include: {
        category: true,
        provider: true,
      },
    });

    if (!service) {
      return res.status(404).json({
        success: false,
        message: 'Service not found',
        messageAr: 'لم يتم العثور على الخدمة',
      });
    }

    // Find frequently booked together services
    const frequentlyBookedTogether = await prisma.serviceBooking.groupBy({
      by: ['serviceId'],
      where: {
        customerId: {
          in: await prisma.serviceBooking
            .findMany({
              where: { serviceId },
              select: { customerId: true },
              distinct: ['customerId'],
            })
            .then((bookings) => bookings.map((b) => b.customerId)),
        },
        serviceId: { not: serviceId },
        status: 'COMPLETED',
      },
      _count: true,
      orderBy: {
        _count: {
          serviceId: 'desc',
        },
      },
      take: Number(limit),
    });

    const relatedServiceIds = frequentlyBookedTogether.map((item) => item.serviceId);

    // If not enough frequently booked together, add from same category
    if (relatedServiceIds.length < Number(limit)) {
      const sameCategoryServices = await prisma.service.findMany({
        where: {
          categoryId: service.categoryId,
          id: {
            notIn: [...relatedServiceIds, serviceId],
          },
          isActive: true,
        },
        select: { id: true },
        take: Number(limit) - relatedServiceIds.length,
        orderBy: { rating: 'desc' },
      });
      relatedServiceIds.push(...sameCategoryServices.map((s) => s.id));
    }

    // Get full service details
    const relatedServices = await prisma.service.findMany({
      where: {
        id: { in: relatedServiceIds },
        isActive: true,
      },
      include: {
        provider: {
          select: {
            id: true,
            businessName: true,
            businessNameAr: true,
            avatar: true,
            rating: true,
            verificationLevel: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            nameAr: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: relatedServices,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// Log User Interaction (for ML improvement)
// ============================================

export const logInteraction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.user!;
    const { serviceId, interactionType, source, sourceId } = req.body;

    await prisma.serviceInteraction.create({
      data: {
        userId,
        serviceId,
        type: interactionType, // VIEW, CLICK, BOOK, FAVORITE
        source, // RECOMMENDATION, SEARCH, MARKETPLACE_LINK
        sourceId, // Product ID or search query
        timestamp: new Date(),
      },
    });

    res.status(201).json({
      success: true,
      message: 'Interaction logged',
    });
  } catch (error) {
    next(error);
  }
};

// Helper function to generate recommendation reason
function getRecommendationReason(
  categorySlug: string,
  purchaseContexts: Array<{ marketplace: string; productTitle: string }>
): { en: string; ar: string } {
  for (const context of purchaseContexts) {
    const mappings = MARKETPLACE_SERVICE_MAPPINGS[context.marketplace] || [];
    if (mappings.includes(categorySlug)) {
      const reasons: Record<string, { en: string; ar: string }> = {
        CARS: {
          en: `Recommended for your car purchase`,
          ar: `موصى به لشراء سيارتك`,
        },
        REAL_ESTATE: {
          en: `Perfect for your new property`,
          ar: `مثالي لعقارك الجديد`,
        },
        MOBILES: {
          en: `For your new mobile device`,
          ar: `لجهازك المحمول الجديد`,
        },
        GOLD: {
          en: `Care for your gold jewelry`,
          ar: `للعناية بمجوهراتك الذهبية`,
        },
        LUXURY: {
          en: `Maintain your luxury item`,
          ar: `للحفاظ على منتجك الفاخر`,
        },
      };
      return reasons[context.marketplace] || {
        en: 'Recommended based on your recent purchase',
        ar: 'موصى به بناءً على مشترياتك الأخيرة',
      };
    }
  }
  return {
    en: 'Recommended for you',
    ar: 'موصى به لك',
  };
}
