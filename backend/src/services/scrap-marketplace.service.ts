import prisma from '../lib/prisma';
import {
  ScrapType,
  ScrapCondition,
  MetalType,
  ScrapPricingType,
  ScrapDealerType,
  ScrapDealerStatus,
  ItemStatus,
} from '../types/prisma-enums';

// ============================================
// سوق التوالف - Scrap Marketplace Service
// ============================================

interface ScrapItemInput {
  title: string;
  description: string;
  categoryId?: string;
  scrapType: ScrapType;
  scrapCondition: ScrapCondition;
  scrapPricingType: ScrapPricingType;
  estimatedValue: number;
  weightKg?: number;
  pricePerKg?: number;
  metalType?: MetalType;
  metalPurity?: number;
  isRepairable?: boolean;
  repairCostEstimate?: number;
  workingPartsDesc?: string;
  defectDescription?: string;
  images: string[];
  governorate?: string;
  city?: string;
  district?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

interface ScrapItemFilters {
  scrapType?: ScrapType;
  scrapCondition?: ScrapCondition;
  metalType?: MetalType;
  minWeight?: number;
  maxWeight?: number;
  minPrice?: number;
  maxPrice?: number;
  governorate?: string;
  isRepairable?: boolean;
  pricingType?: ScrapPricingType;
  page?: number;
  limit?: number;
}

interface DealerFilters {
  dealerType?: ScrapDealerType;
  governorate?: string;
  specialization?: ScrapType;
  metalType?: MetalType;
  offersPickup?: boolean;
  page?: number;
  limit?: number;
}

interface DealerRegistrationInput {
  dealerType: ScrapDealerType;
  businessName?: string;
  commercialRegNo?: string;
  taxCardNo?: string;
  recyclingLicenseNo?: string;
  address?: string;
  governorate?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  specializations: ScrapType[];
  acceptedMetals?: MetalType[];
  minWeightKg?: number;
  maxWeightKg?: number;
  priceList?: object;
  offersPickup?: boolean;
  pickupFee?: number;
  pickupRadiusKm?: number;
  idDocumentUrl?: string;
  commercialRegUrl?: string;
  taxCardUrl?: string;
  recyclingLicenseUrl?: string;
  locationPhotos?: string[];
}

interface PurchaseRequestInput {
  title: string;
  description?: string;
  scrapType: ScrapType;
  metalType?: MetalType;
  minWeightKg?: number;
  maxWeightKg?: number;
  scrapCondition?: ScrapCondition;
  offeredPricePerKg?: number;
  offeredTotalPrice?: number;
  isNegotiable?: boolean;
  governorate?: string;
  city?: string;
  offersPickup?: boolean;
  pickupAddress?: string;
  expiresAt?: Date;
}

interface SellerOfferInput {
  itemId?: string;
  offeredWeightKg: number;
  offeredPricePerKg?: number;
  offeredTotalPrice: number;
  message?: string;
  photos?: string[];
}

class ScrapMarketplaceService {
  // ============================================
  // Scrap Items
  // ============================================

  /**
   * Create a new scrap item
   */
  async createScrapItem(sellerId: string, input: ScrapItemInput) {
    const item = await prisma.item.create({
      data: {
        sellerId,
        title: input.title,
        description: input.description,
        categoryId: input.categoryId,
        condition: 'POOR', // Default for scrap
        estimatedValue: input.estimatedValue,
        images: input.images,
        governorate: input.governorate,
        city: input.city,
        district: input.district,
        location: input.location,
        latitude: input.latitude,
        longitude: input.longitude,
        // Scrap-specific fields
        isScrap: true,
        scrapType: input.scrapType,
        scrapCondition: input.scrapCondition,
        scrapPricingType: input.scrapPricingType,
        weightKg: input.weightKg,
        pricePerKg: input.pricePerKg,
        metalType: input.metalType,
        metalPurity: input.metalPurity,
        isRepairable: input.isRepairable,
        repairCostEstimate: input.repairCostEstimate,
        workingPartsDesc: input.workingPartsDesc,
        defectDescription: input.defectDescription,
        status: 'ACTIVE',
      },
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
            governorate: true,
          },
        },
        category: true,
      },
    });

    return item;
  }

  /**
   * Get scrap items with filters
   */
  async getScrapItems(filters: ScrapItemFilters) {
    const {
      scrapType,
      scrapCondition,
      metalType,
      minWeight,
      maxWeight,
      minPrice,
      maxPrice,
      governorate,
      isRepairable,
      pricingType,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {
      isScrap: true,
      status: 'ACTIVE',
    };

    if (scrapType) where.scrapType = scrapType;
    if (scrapCondition) where.scrapCondition = scrapCondition;
    if (metalType) where.metalType = metalType;
    if (pricingType) where.scrapPricingType = pricingType;
    if (governorate) where.governorate = governorate;
    if (typeof isRepairable === 'boolean') where.isRepairable = isRepairable;

    if (minWeight || maxWeight) {
      where.weightKg = {};
      if (minWeight) where.weightKg.gte = minWeight;
      if (maxWeight) where.weightKg.lte = maxWeight;
    }

    if (minPrice || maxPrice) {
      where.estimatedValue = {};
      if (minPrice) where.estimatedValue.gte = minPrice;
      if (maxPrice) where.estimatedValue.lte = maxPrice;
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          seller: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              rating: true,
              governorate: true,
            },
          },
          category: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);

    return {
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get scrap item details
   */
  async getScrapItemDetails(itemId: string) {
    const item = await prisma.item.findFirst({
      where: {
        id: itemId,
        isScrap: true,
      },
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            phone: true,
            rating: true,
            totalReviews: true,
            governorate: true,
            createdAt: true,
          },
        },
        category: true,
      },
    });

    if (!item) {
      throw new Error('المنتج غير موجود');
    }

    // Increment views
    await prisma.item.update({
      where: { id: itemId },
      data: { views: { increment: 1 } },
    });

    return item;
  }

  // ============================================
  // Scrap Dealers
  // ============================================

  /**
   * Register as a scrap dealer
   */
  async registerScrapDealer(userId: string, input: DealerRegistrationInput) {
    // Check if already registered
    const existing = await prisma.scrapDealerVerification.findFirst({
      where: { userId },
    });

    if (existing) {
      throw new Error('أنت مسجل بالفعل كتاجر توالف');
    }

    const dealer = await prisma.scrapDealerVerification.create({
      data: {
        userId,
        dealerType: input.dealerType,
        businessName: input.businessName,
        commercialRegNo: input.commercialRegNo,
        taxCardNo: input.taxCardNo,
        recyclingLicenseNo: input.recyclingLicenseNo,
        address: input.address,
        governorate: input.governorate,
        city: input.city,
        latitude: input.latitude,
        longitude: input.longitude,
        specializations: input.specializations,
        acceptedMetals: input.acceptedMetals || [],
        minWeightKg: input.minWeightKg || 0,
        maxWeightKg: input.maxWeightKg,
        priceList: input.priceList,
        offersPickup: input.offersPickup || false,
        pickupFee: input.pickupFee || 0,
        pickupRadiusKm: input.pickupRadiusKm || 0,
        idDocumentUrl: input.idDocumentUrl,
        commercialRegUrl: input.commercialRegUrl,
        taxCardUrl: input.taxCardUrl,
        recyclingLicenseUrl: input.recyclingLicenseUrl,
        locationPhotos: input.locationPhotos || [],
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            phone: true,
          },
        },
      },
    });

    return dealer;
  }

  /**
   * Get verified scrap dealers
   */
  async getVerifiedDealers(filters: DealerFilters) {
    const {
      dealerType,
      governorate,
      specialization,
      metalType,
      offersPickup,
      page = 1,
      limit = 20,
    } = filters;

    const where: any = {
      status: 'APPROVED',
      isVerified: true,
    };

    if (dealerType) where.dealerType = dealerType;
    if (governorate) where.governorate = governorate;
    if (specialization) where.specializations = { has: specialization };
    if (metalType) where.acceptedMetals = { has: metalType };
    if (offersPickup) where.offersPickup = true;

    const [dealers, total] = await Promise.all([
      prisma.scrapDealerVerification.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              rating: true,
              phone: true,
            },
          },
        },
        orderBy: [{ rating: 'desc' }, { totalTransactions: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.scrapDealerVerification.count({ where }),
    ]);

    return {
      dealers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get dealer details
   */
  async getDealerDetails(dealerId: string) {
    const dealer = await prisma.scrapDealerVerification.findUnique({
      where: { id: dealerId },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            phone: true,
            rating: true,
            totalReviews: true,
            createdAt: true,
          },
        },
      },
    });

    if (!dealer) {
      throw new Error('التاجر غير موجود');
    }

    return dealer;
  }

  // ============================================
  // Metal Prices
  // ============================================

  /**
   * Get current metal prices
   */
  async getCurrentMetalPrices() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const prices = await prisma.metalPrice.findMany({
      where: {
        date: {
          gte: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
        },
      },
      orderBy: { date: 'desc' },
      distinct: ['metalType'],
    });

    // If no prices found, return default prices
    if (prices.length === 0) {
      return this.getDefaultMetalPrices();
    }

    return prices;
  }

  /**
   * Add metal price (admin only)
   */
  async addMetalPrice(data: { metalType: MetalType; pricePerKg: number; source?: string }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const price = await prisma.metalPrice.upsert({
      where: {
        metalType_date: {
          metalType: data.metalType,
          date: today,
        },
      },
      update: {
        pricePerKg: data.pricePerKg,
        source: data.source,
      },
      create: {
        metalType: data.metalType,
        pricePerKg: data.pricePerKg,
        source: data.source,
        date: today,
      },
    });

    return price;
  }

  /**
   * Get metal price history
   */
  async getMetalPriceHistory(metalType: MetalType, days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const prices = await prisma.metalPrice.findMany({
      where: {
        metalType,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    return prices;
  }

  /**
   * Get default metal prices (Egyptian market rates)
   */
  private getDefaultMetalPrices() {
    return [
      { metalType: 'COPPER' as MetalType, pricePerKg: 250, currency: 'EGP' },
      { metalType: 'ALUMINUM' as MetalType, pricePerKg: 80, currency: 'EGP' },
      { metalType: 'IRON' as MetalType, pricePerKg: 12, currency: 'EGP' },
      { metalType: 'STEEL' as MetalType, pricePerKg: 15, currency: 'EGP' },
      { metalType: 'BRASS' as MetalType, pricePerKg: 180, currency: 'EGP' },
      { metalType: 'BRONZE' as MetalType, pricePerKg: 200, currency: 'EGP' },
      { metalType: 'LEAD' as MetalType, pricePerKg: 45, currency: 'EGP' },
      { metalType: 'STAINLESS_STEEL' as MetalType, pricePerKg: 35, currency: 'EGP' },
    ];
  }

  // ============================================
  // Purchase Requests (Reverse Auction)
  // ============================================

  /**
   * Create a purchase request
   */
  async createPurchaseRequest(buyerId: string, input: PurchaseRequestInput) {
    const request = await prisma.scrapPurchaseRequest.create({
      data: {
        buyerId,
        title: input.title,
        description: input.description,
        scrapType: input.scrapType,
        metalType: input.metalType,
        minWeightKg: input.minWeightKg,
        maxWeightKg: input.maxWeightKg,
        scrapCondition: input.scrapCondition,
        offeredPricePerKg: input.offeredPricePerKg,
        offeredTotalPrice: input.offeredTotalPrice,
        isNegotiable: input.isNegotiable ?? true,
        governorate: input.governorate,
        city: input.city,
        offersPickup: input.offersPickup || false,
        pickupAddress: input.pickupAddress,
        expiresAt: input.expiresAt,
        status: 'ACTIVE',
      },
      include: {
        buyer: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
          },
        },
      },
    });

    return request;
  }

  /**
   * Get purchase requests
   */
  async getPurchaseRequests(filters: {
    scrapType?: ScrapType;
    metalType?: MetalType;
    governorate?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const { scrapType, metalType, governorate, status, page = 1, limit = 20 } = filters;

    const where: any = {};

    if (scrapType) where.scrapType = scrapType;
    if (metalType) where.metalType = metalType;
    if (governorate) where.governorate = governorate;
    if (status) where.status = status;
    else where.status = 'ACTIVE';

    // Only show non-expired requests
    where.OR = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];

    const [requests, total] = await Promise.all([
      prisma.scrapPurchaseRequest.findMany({
        where,
        include: {
          buyer: {
            select: {
              id: true,
              fullName: true,
              avatar: true,
              rating: true,
              governorate: true,
            },
          },
          _count: {
            select: { sellerOffers: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.scrapPurchaseRequest.count({ where }),
    ]);

    return {
      requests,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Submit seller offer on purchase request
   */
  async submitSellerOffer(sellerId: string, requestId: string, input: SellerOfferInput) {
    // Check if request exists and is active
    const request = await prisma.scrapPurchaseRequest.findFirst({
      where: {
        id: requestId,
        status: 'ACTIVE',
      },
    });

    if (!request) {
      throw new Error('طلب الشراء غير موجود أو منتهي');
    }

    // Check if seller already submitted an offer
    const existingOffer = await prisma.scrapSellerOffer.findFirst({
      where: {
        requestId,
        sellerId,
      },
    });

    if (existingOffer) {
      throw new Error('لقد قدمت عرضاً على هذا الطلب من قبل');
    }

    const offer = await prisma.scrapSellerOffer.create({
      data: {
        requestId,
        sellerId,
        itemId: input.itemId,
        offeredWeightKg: input.offeredWeightKg,
        offeredPricePerKg: input.offeredPricePerKg,
        offeredTotalPrice: input.offeredTotalPrice,
        message: input.message,
        photos: input.photos || [],
        status: 'PENDING',
      },
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            rating: true,
          },
        },
        item: true,
      },
    });

    // Update offers count
    await prisma.scrapPurchaseRequest.update({
      where: { id: requestId },
      data: { offersCount: { increment: 1 } },
    });

    return offer;
  }

  /**
   * Get offers on a purchase request (for buyer)
   */
  async getRequestOffers(requestId: string, userId: string) {
    // Verify user owns the request
    const request = await prisma.scrapPurchaseRequest.findFirst({
      where: {
        id: requestId,
        buyerId: userId,
      },
    });

    if (!request) {
      throw new Error('غير مصرح لك بمشاهدة العروض');
    }

    const offers = await prisma.scrapSellerOffer.findMany({
      where: { requestId },
      include: {
        seller: {
          select: {
            id: true,
            fullName: true,
            avatar: true,
            phone: true,
            rating: true,
            totalReviews: true,
            governorate: true,
          },
        },
        item: true,
      },
      orderBy: { offeredTotalPrice: 'asc' }, // Cheapest first
    });

    return offers;
  }

  /**
   * Accept an offer
   */
  async acceptOffer(offerId: string, userId: string) {
    const offer = await prisma.scrapSellerOffer.findUnique({
      where: { id: offerId },
      include: { request: true },
    });

    if (!offer) {
      throw new Error('العرض غير موجود');
    }

    if (offer.request.buyerId !== userId) {
      throw new Error('غير مصرح لك بقبول هذا العرض');
    }

    // Update offer status
    const updatedOffer = await prisma.scrapSellerOffer.update({
      where: { id: offerId },
      data: { status: 'ACCEPTED' },
    });

    // Reject other offers
    await prisma.scrapSellerOffer.updateMany({
      where: {
        requestId: offer.requestId,
        id: { not: offerId },
      },
      data: { status: 'REJECTED' },
    });

    // Update request status
    await prisma.scrapPurchaseRequest.update({
      where: { id: offer.requestId },
      data: { status: 'COMPLETED' },
    });

    return updatedOffer;
  }

  // ============================================
  // Statistics
  // ============================================

  /**
   * Get market statistics
   */
  async getMarketStats() {
    const [totalItems, totalDealers, totalRequests, itemsByType] = await Promise.all([
      prisma.item.count({ where: { isScrap: true, status: 'ACTIVE' } }),
      prisma.scrapDealerVerification.count({ where: { isVerified: true } }),
      prisma.scrapPurchaseRequest.count({ where: { status: 'ACTIVE' } }),
      prisma.item.groupBy({
        by: ['scrapType'],
        where: { isScrap: true, status: 'ACTIVE' },
        _count: true,
      }),
    ]);

    return {
      totalItems,
      totalDealers,
      totalRequests,
      itemsByType: itemsByType.filter((i) => i.scrapType !== null),
    };
  }

  /**
   * Get scrap items grouped by type
   */
  async getScrapByType() {
    const grouped = await prisma.item.groupBy({
      by: ['scrapType'],
      where: { isScrap: true, status: 'ACTIVE' },
      _count: true,
      _sum: { estimatedValue: true },
    });

    return grouped.filter((g) => g.scrapType !== null);
  }
}

export const scrapMarketplaceService = new ScrapMarketplaceService();
