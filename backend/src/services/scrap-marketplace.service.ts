import prisma from '../config/database';
import {
  ScrapType,
  ScrapCondition,
  MetalType,
  ScrapPricingType,
  ScrapDealerType,
  ScrapDealerStatus,
  ItemStatus,
} from '@prisma/client';

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

  // ============================================
  // Collection Requests (C2B) - طلبات الجمع
  // ============================================

  /**
   * Create collection request
   */
  async createCollectionRequest(userId: string, input: {
    materials: Array<{ type: string; estimatedWeight: number; condition?: string }>;
    address: string;
    governorate: string;
    city?: string;
    district?: string;
    landmark?: string;
    latitude?: number;
    longitude?: number;
    floor?: number;
    hasElevator?: boolean;
    preferredDate: Date;
    preferredTimeSlot?: string;
    alternateDate?: Date;
    contactName: string;
    contactPhone: string;
    notes?: string;
  }) {
    // Calculate estimated total value
    const prices = await this.getMaterialPrices();
    let estimatedTotalValue = 0;

    for (const material of input.materials) {
      const price = prices.find((p: any) => p.materialType === material.type);
      if (price) {
        estimatedTotalValue += material.estimatedWeight * price.pricePerKg;
      }
    }

    const request = await prisma.collectionRequest.create({
      data: {
        requesterId: userId,
        materials: input.materials,
        estimatedTotalValue,
        address: input.address,
        governorate: input.governorate,
        city: input.city,
        district: input.district,
        landmark: input.landmark,
        latitude: input.latitude,
        longitude: input.longitude,
        floor: input.floor,
        hasElevator: input.hasElevator || false,
        preferredDate: input.preferredDate,
        preferredTimeSlot: input.preferredTimeSlot,
        alternateDate: input.alternateDate,
        contactName: input.contactName,
        contactPhone: input.contactPhone,
        notes: input.notes,
        status: 'PENDING',
        beforePhotos: [],
        afterPhotos: [],
        weightingPhotos: [],
      },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
      },
    });

    return request;
  }

  /**
   * Get collection requests for user
   */
  async getUserCollectionRequests(userId: string, status?: string) {
    const where: any = { requesterId: userId };
    if (status) where.status = status;

    const requests = await prisma.collectionRequest.findMany({
      where,
      include: {
        collector: {
          select: {
            id: true,
            displayName: true,
            rating: true,
            vehicleType: true,
            user: {
              select: {
                phone: true,
                avatar: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return requests;
  }

  /**
   * Get available collection requests for collectors
   */
  async getAvailableCollections(collectorId: string, governorate?: string) {
    const collector = await prisma.collectorProfile.findUnique({
      where: { id: collectorId },
    });

    if (!collector) {
      throw new Error('ملف الجامع غير موجود');
    }

    const where: any = {
      status: 'PENDING',
      governorate: governorate || { in: collector.serviceAreas },
    };

    const requests = await prisma.collectionRequest.findMany({
      where,
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            rating: true,
          },
        },
      },
      orderBy: [{ preferredDate: 'asc' }, { createdAt: 'asc' }],
    });

    return requests;
  }

  /**
   * Accept collection request (for collectors)
   */
  async acceptCollectionRequest(collectorId: string, requestId: string) {
    const request = await prisma.collectionRequest.findFirst({
      where: {
        id: requestId,
        status: 'PENDING',
      },
    });

    if (!request) {
      throw new Error('الطلب غير موجود أو تم قبوله من جامع آخر');
    }

    const updated = await prisma.collectionRequest.update({
      where: { id: requestId },
      data: {
        collectorId,
        status: 'ACCEPTED',
        acceptedAt: new Date(),
      },
      include: {
        requester: {
          select: {
            id: true,
            fullName: true,
            phone: true,
          },
        },
        collector: true,
      },
    });

    return updated;
  }

  /**
   * Update collection status
   */
  async updateCollectionStatus(
    collectorId: string,
    requestId: string,
    status: string,
    data?: {
      collectorLocation?: { lat: number; lng: number };
      estimatedArrival?: Date;
      actualWeights?: Array<{ type: string; weight: number; pricePerKg: number; total: number }>;
      actualTotalValue?: number;
      photos?: string[];
    }
  ) {
    const request = await prisma.collectionRequest.findFirst({
      where: {
        id: requestId,
        collectorId,
      },
    });

    if (!request) {
      throw new Error('غير مصرح لك بتحديث هذا الطلب');
    }

    const updateData: any = { status };

    if (status === 'IN_TRANSIT' && data?.collectorLocation) {
      updateData.collectorLocation = data.collectorLocation;
      updateData.estimatedArrival = data.estimatedArrival;
    }

    if (status === 'ARRIVED') {
      updateData.arrivedAt = new Date();
    }

    if (status === 'WEIGHING' && data?.photos) {
      updateData.weightingPhotos = data.photos;
    }

    if (status === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.actualWeights = data?.actualWeights;
      updateData.actualTotalValue = data?.actualTotalValue;
      updateData.afterPhotos = data?.photos || [];

      // Update collector stats
      await prisma.collectorProfile.update({
        where: { id: collectorId },
        data: {
          totalCollections: { increment: 1 },
          totalWeightKg: { increment: data?.actualWeights?.reduce((sum, w) => sum + w.weight, 0) || 0 },
          totalEarnings: { increment: data?.actualTotalValue || 0 },
        },
      });
    }

    if (status === 'CANCELLED') {
      updateData.cancelledAt = new Date();
    }

    const updated = await prisma.collectionRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    return updated;
  }

  /**
   * Rate collection
   */
  async rateCollection(userId: string, requestId: string, rating: number, review?: string, isRequester: boolean = true) {
    const request = await prisma.collectionRequest.findFirst({
      where: {
        id: requestId,
        status: 'COMPLETED',
        OR: [{ requesterId: userId }, { collector: { userId } }],
      },
    });

    if (!request) {
      throw new Error('لا يمكن تقييم هذا الطلب');
    }

    const updateData = isRequester
      ? { collectorRating: rating, collectorReview: review }
      : { requesterRating: rating, requesterReview: review };

    const updated = await prisma.collectionRequest.update({
      where: { id: requestId },
      data: updateData,
    });

    // Update collector rating average if requester rated
    if (isRequester && request.collectorId) {
      const avgRating = await prisma.collectionRequest.aggregate({
        where: { collectorId: request.collectorId, collectorRating: { not: null } },
        _avg: { collectorRating: true },
        _count: { collectorRating: true },
      });

      await prisma.collectorProfile.update({
        where: { id: request.collectorId },
        data: {
          rating: avgRating._avg.collectorRating || 0,
          totalReviews: avgRating._count.collectorRating,
        },
      });
    }

    return updated;
  }

  // ============================================
  // Collector Profile - ملف الجامع
  // ============================================

  /**
   * Register as collector
   */
  async registerCollector(userId: string, input: {
    displayName: string;
    nationalId?: string;
    vehicleType?: string;
    vehiclePlate?: string;
    serviceAreas: string[];
    maxPickupWeightKg?: number;
    specializations?: ScrapType[];
    acceptedMetals?: MetalType[];
    nationalIdUrl?: string;
    vehicleLicenseUrl?: string;
    profilePhotoUrl?: string;
  }) {
    const existing = await prisma.collectorProfile.findUnique({
      where: { userId },
    });

    if (existing) {
      throw new Error('أنت مسجل كجامع بالفعل');
    }

    const collector = await prisma.collectorProfile.create({
      data: {
        userId,
        displayName: input.displayName,
        nationalId: input.nationalId,
        vehicleType: input.vehicleType,
        vehiclePlate: input.vehiclePlate,
        serviceAreas: input.serviceAreas,
        maxPickupWeightKg: input.maxPickupWeightKg || 100,
        specializations: input.specializations || [],
        acceptedMetals: input.acceptedMetals || [],
        nationalIdUrl: input.nationalIdUrl,
        vehicleLicenseUrl: input.vehicleLicenseUrl,
        profilePhotoUrl: input.profilePhotoUrl,
        isActive: true,
        isVerified: false,
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            phone: true,
            avatar: true,
          },
        },
      },
    });

    return collector;
  }

  /**
   * Update collector location
   */
  async updateCollectorLocation(userId: string, latitude: number, longitude: number, isOnline: boolean) {
    const collector = await prisma.collectorProfile.findUnique({
      where: { userId },
    });

    if (!collector) {
      throw new Error('ملف الجامع غير موجود');
    }

    return prisma.collectorProfile.update({
      where: { userId },
      data: {
        currentLatitude: latitude,
        currentLongitude: longitude,
        locationUpdatedAt: new Date(),
        isOnline,
      },
    });
  }

  /**
   * Get collector dashboard stats
   */
  async getCollectorStats(userId: string) {
    const collector = await prisma.collectorProfile.findUnique({
      where: { userId },
    });

    if (!collector) {
      throw new Error('ملف الجامع غير موجود');
    }

    const [todayCollections, pendingRequests, monthlyEarnings] = await Promise.all([
      prisma.collectionRequest.count({
        where: {
          collectorId: collector.id,
          status: 'COMPLETED',
          completedAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.collectionRequest.count({
        where: {
          collectorId: collector.id,
          status: { in: ['ACCEPTED', 'SCHEDULED', 'IN_TRANSIT'] },
        },
      }),
      prisma.collectionRequest.aggregate({
        where: {
          collectorId: collector.id,
          status: 'COMPLETED',
          completedAt: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
          },
        },
        _sum: { actualTotalValue: true },
      }),
    ]);

    return {
      collector,
      todayCollections,
      pendingRequests,
      monthlyEarnings: monthlyEarnings._sum.actualTotalValue || 0,
    };
  }

  // ============================================
  // Material Prices - أسعار المواد
  // ============================================

  /**
   * Get all material prices
   */
  async getMaterialPrices(category?: string, governorate?: string) {
    const where: any = { isActive: true };
    if (category) where.materialCategory = category;
    if (governorate) where.governorate = governorate;

    const prices = await prisma.scrapMaterialPrice.findMany({
      where,
      orderBy: [{ materialCategory: 'asc' }, { pricePerKg: 'desc' }],
    });

    // If no prices found, return default prices
    if (prices.length === 0) {
      return this.getDefaultMaterialPrices();
    }

    return prices;
  }

  /**
   * Add/update material price
   */
  async upsertMaterialPrice(input: {
    materialCategory: string;
    materialType: string;
    materialNameAr: string;
    materialNameEn?: string;
    pricePerKg: number;
    minPrice?: number;
    maxPrice?: number;
    governorate?: string;
    source?: string;
  }) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get previous price
    const previousPrice = await prisma.scrapMaterialPrice.findFirst({
      where: {
        materialType: input.materialType,
        governorate: input.governorate || null,
        isActive: true,
      },
      orderBy: { validFrom: 'desc' },
    });

    // Deactivate old price
    if (previousPrice) {
      await prisma.scrapMaterialPrice.update({
        where: { id: previousPrice.id },
        data: { isActive: false, validUntil: today },
      });
    }

    // Calculate price change
    const priceChange = previousPrice
      ? ((input.pricePerKg - previousPrice.pricePerKg) / previousPrice.pricePerKg) * 100
      : 0;
    const priceChangeType = priceChange > 0 ? 'up' : priceChange < 0 ? 'down' : 'stable';

    const price = await prisma.scrapMaterialPrice.create({
      data: {
        materialCategory: input.materialCategory,
        materialType: input.materialType,
        materialNameAr: input.materialNameAr,
        materialNameEn: input.materialNameEn,
        pricePerKg: input.pricePerKg,
        pricePerTon: input.pricePerKg * 1000,
        minPrice: input.minPrice,
        maxPrice: input.maxPrice,
        governorate: input.governorate,
        source: input.source,
        previousPrice: previousPrice?.pricePerKg,
        priceChange,
        priceChangeType,
        validFrom: today,
        isActive: true,
      },
    });

    return price;
  }

  /**
   * Get default material prices (Egyptian market Dec 2024)
   */
  private getDefaultMaterialPrices() {
    return [
      // معادن - Metals
      { materialCategory: 'metal', materialType: 'copper_red', materialNameAr: 'نحاس أحمر خام', pricePerKg: 588, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'copper_red_shiny', materialNameAr: 'نحاس أحمر لامع', pricePerKg: 529, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'copper_yellow', materialNameAr: 'نحاس أصفر/برونز', pricePerKg: 489, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'copper_wire', materialNameAr: 'سلك نحاس', pricePerKg: 525, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'aluminum_soft', materialNameAr: 'ألمونيوم طري', pricePerKg: 199, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'aluminum_hard', materialNameAr: 'ألمونيوم صلب', pricePerKg: 185, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'aluminum_cans', materialNameAr: 'علب ألمونيوم', pricePerKg: 162, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'iron_mixed', materialNameAr: 'حديد خردة مخلوط', pricePerKg: 40, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'iron_premium', materialNameAr: 'حديد خردة ممتاز', pricePerKg: 43, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'steel_stainless_304', materialNameAr: 'ستانلس 304', pricePerKg: 85, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'steel_stainless_316', materialNameAr: 'ستانلس 316', pricePerKg: 105, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'lead', materialNameAr: 'رصاص', pricePerKg: 78, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'zinc', materialNameAr: 'زنك', pricePerKg: 90, currency: 'EGP' },
      { materialCategory: 'metal', materialType: 'tin', materialNameAr: 'قصدير', pricePerKg: 850, currency: 'EGP' },

      // ورق - Paper
      { materialCategory: 'paper', materialType: 'cardboard', materialNameAr: 'كرتون', pricePerKg: 10, currency: 'EGP' },
      { materialCategory: 'paper', materialType: 'white_paper', materialNameAr: 'ورق أبيض', pricePerKg: 9, currency: 'EGP' },
      { materialCategory: 'paper', materialType: 'newspaper', materialNameAr: 'جرائد', pricePerKg: 7.5, currency: 'EGP' },
      { materialCategory: 'paper', materialType: 'mixed_paper', materialNameAr: 'ورق مخلوط', pricePerKg: 6, currency: 'EGP' },

      // بلاستيك - Plastic
      { materialCategory: 'plastic', materialType: 'pet', materialNameAr: 'بلاستيك PET (زجاجات)', pricePerKg: 38, currency: 'EGP' },
      { materialCategory: 'plastic', materialType: 'hdpe', materialNameAr: 'بلاستيك HDPE (جالونات)', pricePerKg: 45, currency: 'EGP' },
      { materialCategory: 'plastic', materialType: 'soft_plastic', materialNameAr: 'بلاستيك طري', pricePerKg: 58, currency: 'EGP' },
      { materialCategory: 'plastic', materialType: 'hard_plastic', materialNameAr: 'بلاستيك صلب', pricePerKg: 30, currency: 'EGP' },

      // زجاج - Glass
      { materialCategory: 'glass', materialType: 'clear_glass', materialNameAr: 'زجاج شفاف', pricePerKg: 1.5, currency: 'EGP' },
      { materialCategory: 'glass', materialType: 'colored_glass', materialNameAr: 'زجاج ملون', pricePerKg: 0.75, currency: 'EGP' },

      // منسوجات - Textiles
      { materialCategory: 'textile', materialType: 'cotton', materialNameAr: 'قطن', pricePerKg: 15, currency: 'EGP' },
      { materialCategory: 'textile', materialType: 'mixed_fabric', materialNameAr: 'أقمشة مخلوطة', pricePerKg: 8, currency: 'EGP' },
      { materialCategory: 'textile', materialType: 'rubber_tires', materialNameAr: 'كاوتش/إطارات', pricePerKg: 6, currency: 'EGP' },

      // إلكترونيات - E-waste
      { materialCategory: 'ewaste', materialType: 'computer_scrap', materialNameAr: 'خردة كمبيوتر', pricePerKg: 25, currency: 'EGP' },
      { materialCategory: 'ewaste', materialType: 'phone_scrap', materialNameAr: 'خردة موبايل', pricePerKg: 150, currency: 'EGP' },
      { materialCategory: 'ewaste', materialType: 'circuit_boards', materialNameAr: 'بوردات إلكترونية', pricePerKg: 200, currency: 'EGP' },
      { materialCategory: 'ewaste', materialType: 'batteries_lead', materialNameAr: 'بطاريات رصاص', pricePerKg: 35, currency: 'EGP' },
      { materialCategory: 'ewaste', materialType: 'batteries_lithium', materialNameAr: 'بطاريات ليثيوم', pricePerKg: 80, currency: 'EGP' },
    ];
  }

  // ============================================
  // Price Calculator - حاسبة الأسعار
  // ============================================

  /**
   * Calculate scrap value
   */
  async calculateScrapValue(materials: Array<{ type: string; weight: number }>, governorate?: string) {
    const prices = await this.getMaterialPrices(undefined, governorate);
    const priceMap = new Map(prices.map((p: any) => [p.materialType, p]));

    const breakdown = materials.map((m) => {
      const price = priceMap.get(m.type) as any;
      const pricePerKg = price?.pricePerKg || 0;
      const total = m.weight * pricePerKg;
      return {
        type: m.type,
        nameAr: price?.materialNameAr || m.type,
        weight: m.weight,
        pricePerKg,
        total,
      };
    });

    const totalValue = breakdown.reduce((sum, b) => sum + b.total, 0);
    const totalWeight = breakdown.reduce((sum, b) => sum + b.weight, 0);

    return {
      breakdown,
      totalWeight,
      totalValue,
      estimatedRange: {
        min: totalValue * 0.9,
        max: totalValue * 1.1,
      },
    };
  }

  // ============================================
  // ESG Certificates - شهادات الاستدامة
  // ============================================

  /**
   * Generate ESG certificate
   */
  async generateESGCertificate(userId: string, collectionRequestId?: string, materials?: Array<{ type: string; weight: number }>) {
    // CO2 savings per kg by material type (approximate values)
    const co2SavingsPerKg: Record<string, number> = {
      aluminum_soft: 9.0,
      aluminum_hard: 9.0,
      aluminum_cans: 9.0,
      copper_red: 4.0,
      copper_yellow: 4.0,
      iron_mixed: 1.5,
      iron_premium: 1.5,
      steel_stainless_304: 2.0,
      cardboard: 0.5,
      white_paper: 0.4,
      pet: 2.5,
      hdpe: 2.0,
      soft_plastic: 2.0,
      hard_plastic: 2.0,
      clear_glass: 0.3,
      cotton: 1.5,
    };

    let collectionMaterials = materials;

    if (collectionRequestId) {
      const collection = await prisma.collectionRequest.findUnique({
        where: { id: collectionRequestId },
      });
      if (collection?.actualWeights) {
        collectionMaterials = collection.actualWeights as any;
      }
    }

    if (!collectionMaterials || collectionMaterials.length === 0) {
      throw new Error('لا توجد مواد لإنشاء الشهادة');
    }

    // Calculate environmental impact
    const materialsWithImpact = collectionMaterials.map((m: any) => {
      const co2Saved = (m.weight || m.estimatedWeight || 0) * (co2SavingsPerKg[m.type] || 1);
      return {
        type: m.type,
        weight: m.weight || m.estimatedWeight || 0,
        co2Saved,
      };
    });

    const totalWeightKg = materialsWithImpact.reduce((sum, m) => sum + m.weight, 0);
    const totalCO2SavedKg = materialsWithImpact.reduce((sum, m) => sum + m.co2Saved, 0);

    // Calculate equivalents
    const treesEquivalent = totalCO2SavedKg / 21; // avg tree absorbs 21kg CO2/year
    const waterSavedLiters = totalWeightKg * 50; // approximate water savings
    const energySavedKwh = totalCO2SavedKg * 2; // approximate energy savings

    // Generate certificate number
    const certNumber = `ESG-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const certificate = await prisma.eSGCertificate.create({
      data: {
        userId,
        collectionRequestId,
        certificateNumber: certNumber,
        materials: materialsWithImpact,
        totalWeightKg,
        totalCO2SavedKg,
        treesEquivalent,
        waterSavedLiters,
        energySavedKwh,
        periodStart: new Date(),
        periodEnd: new Date(),
        isVerified: true,
        verifiedAt: new Date(),
      },
    });

    return certificate;
  }

  /**
   * Get user's ESG certificates
   */
  async getUserESGCertificates(userId: string) {
    return prisma.eSGCertificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
    });
  }

  /**
   * Get ESG certificate by number (public verification)
   */
  async verifyESGCertificate(certificateNumber: string) {
    const certificate = await prisma.eSGCertificate.findUnique({
      where: { certificateNumber },
      include: {
        user: {
          select: {
            fullName: true,
            businessName: true,
          },
        },
      },
    });

    if (!certificate) {
      throw new Error('الشهادة غير موجودة');
    }

    return certificate;
  }

  // ============================================
  // Enhanced Statistics - إحصائيات محسنة
  // ============================================

  /**
   * Get comprehensive market statistics
   */
  async getComprehensiveStats() {
    const [
      totalItems,
      totalDealers,
      totalCollectors,
      totalRequests,
      totalCollections,
      totalTransactions,
      itemsByType,
      recentPrices,
      topGovernorates,
    ] = await Promise.all([
      prisma.item.count({ where: { isScrap: true, status: 'ACTIVE' } }),
      prisma.scrapDealerVerification.count({ where: { isVerified: true } }),
      prisma.collectorProfile.count({ where: { isVerified: true } }),
      prisma.scrapPurchaseRequest.count({ where: { status: 'ACTIVE' } }),
      prisma.collectionRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.scrapTransaction.count(),
      prisma.item.groupBy({
        by: ['scrapType'],
        where: { isScrap: true, status: 'ACTIVE' },
        _count: true,
      }),
      prisma.scrapMaterialPrice.findMany({
        where: { isActive: true },
        take: 10,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.item.groupBy({
        by: ['governorate'],
        where: { isScrap: true, status: 'ACTIVE' },
        _count: true,
        orderBy: { _count: { governorate: 'desc' } },
        take: 5,
      }),
    ]);

    return {
      overview: {
        totalItems,
        totalDealers,
        totalCollectors,
        totalRequests,
        totalCollections,
        totalTransactions,
      },
      itemsByType: itemsByType.filter((i) => i.scrapType !== null),
      recentPrices,
      topGovernorates,
    };
  }
}

export const scrapMarketplaceService = new ScrapMarketplaceService();
