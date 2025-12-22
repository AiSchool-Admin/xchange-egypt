/**
 * Xchange Marketplace Engine
 * ==========================
 *
 * محرك سوق النقل الذكي - يدير طلبات العروض والمزودين
 */

import {
  ServiceType,
  RequestStatus,
  QuoteStatus,
  ServiceRequest,
  Quote,
  ServiceProvider,
  Location,
  VehicleType,
} from './types';

// =====================================================
// MARKETPLACE ENGINE
// =====================================================

export class MarketplaceEngine {
  /**
   * إنشاء طلب خدمة جديد
   */
  async createRequest(
    userId: string,
    data: CreateRequestInput
  ): Promise<ServiceRequest> {
    // Set expiry (24 hours for urgent, 7 days for flexible)
    const expiresAt = this.calculateExpiry(data.flexibility);

    // Create request in database
    // const request = await prisma.serviceRequest.create({ ... });

    // Notify relevant providers
    await this.notifyProvidersOfNewRequest(data);

    // Return created request
    return {} as ServiceRequest;
  }

  /**
   * البحث عن طلبات متاحة (للمزودين)
   */
  async findOpenRequests(
    providerId: string,
    filters: RequestFilters
  ): Promise<ServiceRequest[]> {
    // Get provider's coverage areas and service types
    // Filter requests matching provider's capabilities
    // Return matching open requests

    return [];
  }

  /**
   * تقديم عرض سعر
   */
  async submitQuote(
    providerId: string,
    requestId: string,
    data: SubmitQuoteInput
  ): Promise<Quote> {
    // Validate provider can quote this request
    // Create quote in database
    // Notify customer of new quote
    // Update request quotes count

    return {} as Quote;
  }

  /**
   * قبول عرض
   */
  async acceptQuote(
    userId: string,
    quoteId: string
  ): Promise<{ request: ServiceRequest; quote: Quote }> {
    // Verify user owns the request
    // Update quote status to ACCEPTED
    // Update request status to ACCEPTED
    // Reject all other quotes
    // Notify provider of acceptance

    return {} as any;
  }

  /**
   * رفض عرض
   */
  async rejectQuote(
    userId: string,
    quoteId: string,
    reason?: string
  ): Promise<Quote> {
    // Update quote status to REJECTED
    // Notify provider

    return {} as Quote;
  }

  /**
   * إلغاء طلب
   */
  async cancelRequest(
    userId: string,
    requestId: string,
    reason?: string
  ): Promise<ServiceRequest> {
    // Verify user owns request
    // Update request status to CANCELLED
    // Notify providers who quoted

    return {} as ServiceRequest;
  }

  /**
   * حساب تاريخ انتهاء الطلب
   */
  private calculateExpiry(flexibility: string): Date {
    const now = new Date();
    switch (flexibility) {
      case 'EXACT':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours
      case 'FLEXIBLE_HOURS':
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      case 'FLEXIBLE_DAYS':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }

  /**
   * إشعار المزودين بطلب جديد
   * الإستراتيجية: إرسال لجميع مزودي الخدمة في مصر
   * مع ترتيب الأولوية: المحافظة ← المدينة ← الحي
   */
  private async notifyProvidersOfNewRequest(data: CreateRequestInput): Promise<void> {
    // Get all active providers in Egypt who support this service type
    // const allProviders = await prisma.serviceProvider.findMany({
    //   where: {
    //     isActive: true,
    //     serviceTypes: { has: data.serviceType },
    //   },
    // });

    // Calculate priority score for each provider based on location match
    // Priority: Same district > Same city > Same governorate > Other areas in Egypt
    const calculateProviderPriority = (provider: ServiceProvider): number => {
      const pickupGov = data.pickup.governorate;
      const pickupCity = data.pickup.city;

      // Check if provider covers the pickup governorate
      const coversGovernorate = provider.coverageAreas.includes(pickupGov);

      if (coversGovernorate) {
        // Highest priority - same governorate
        // Additional logic could check city/district if stored
        return 100;
      }

      // Lower priority - other areas in Egypt
      return 50;
    };

    // Sort providers by priority (highest first)
    // const sortedProviders = allProviders.sort((a, b) =>
    //   calculateProviderPriority(b) - calculateProviderPriority(a)
    // );

    // Send notifications to ALL providers (Egypt-wide)
    // Priority determines notification order and prominence
    // sortedProviders.forEach(async (provider, index) => {
    //   const priority = calculateProviderPriority(provider);
    //   const isHighPriority = priority >= 100;
    //
    //   // Create notification
    //   await prisma.marketplaceNotification.create({
    //     data: {
    //       userId: provider.userId,
    //       type: 'NEW_REQUEST',
    //       title: 'New Service Request',
    //       titleAr: 'طلب خدمة جديد',
    //       message: isHighPriority
    //         ? `New ${data.serviceType} request in your area!`
    //         : `New ${data.serviceType} request available`,
    //       messageAr: isHighPriority
    //         ? `طلب ${data.serviceType === 'SHIPPING' ? 'شحن' : 'رحلة'} جديد في منطقتك!`
    //         : `طلب ${data.serviceType === 'SHIPPING' ? 'شحن' : 'رحلة'} جديد متاح`,
    //       data: {
    //         requestId: 'request_id',
    //         priority,
    //         serviceType: data.serviceType,
    //         pickupGov: data.pickup.governorate,
    //         pickupCity: data.pickup.city,
    //       },
    //     },
    //   });
    //
    //   // Send push notification
    //   // High priority providers get immediate push
    //   // Lower priority may be batched or delayed
    //   if (isHighPriority) {
    //     await sendPushNotification(provider.userId, { ... });
    //   }
    //
    //   // SMS/WhatsApp for high priority only
    //   if (isHighPriority && provider.phone) {
    //     await sendWhatsAppNotification(provider.phone, { ... });
    //   }
    // });
  }

  /**
   * الحصول على مزودي الخدمة مرتبين حسب الأولوية
   * الترتيب: نفس الحي ← نفس المدينة ← نفس المحافظة ← باقي مصر
   */
  async getProvidersForRequest(
    requestId: string,
    pickup: Location
  ): Promise<{ provider: ServiceProvider; priority: 'HIGH' | 'MEDIUM' | 'LOW' }[]> {
    // const allProviders = await prisma.serviceProvider.findMany({
    //   where: { isActive: true },
    // });

    // const providersWithPriority = allProviders.map(provider => {
    //   let priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
    //
    //   // Check coverage match
    //   if (provider.coverageAreas.includes(pickup.governorate)) {
    //     priority = 'HIGH';
    //   } else if (provider.coverageAreas.some(area =>
    //     ADJACENT_GOVERNORATES[pickup.governorate]?.includes(area)
    //   )) {
    //     priority = 'MEDIUM';
    //   }
    //
    //   return { provider, priority };
    // });

    // // Sort: HIGH first, then MEDIUM, then LOW
    // return providersWithPriority.sort((a, b) => {
    //   const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
    //   return priorityOrder[a.priority] - priorityOrder[b.priority];
    // });

    return [];
  }

  /**
   * تقدير السعر (للعميل قبل النشر)
   */
  async estimatePrice(data: CreateRequestInput): Promise<PriceEstimation> {
    const distance = this.calculateDistance(data.pickup, data.dropoff);

    // Base estimates per service type
    if (data.serviceType === ServiceType.SHIPPING) {
      return this.estimateShippingPrice(data, distance);
    } else {
      return this.estimateRidePrice(data, distance);
    }
  }

  /**
   * تقدير سعر الشحن
   */
  private estimateShippingPrice(
    data: CreateRequestInput,
    distanceKm: number
  ): PriceEstimation {
    const weight = data.shippingDetails?.weight || 1;
    const isIntercity = data.pickup.governorate !== data.dropoff.governorate;

    // Base rates (EGP)
    const baseRate = isIntercity ? 50 : 30;
    const perKmRate = isIntercity ? 2 : 1.5;
    const perKgRate = 5;

    const basePrice = baseRate + (distanceKm * perKmRate) + (weight * perKgRate);

    return {
      estimatedMin: Math.round(basePrice * 0.8),
      estimatedMax: Math.round(basePrice * 1.3),
      currency: 'EGP',
      factors: [
        { name: 'المسافة', nameAr: 'المسافة', value: `${distanceKm} كم` },
        { name: 'الوزن', nameAr: 'الوزن', value: `${weight} كجم` },
        { name: 'النوع', nameAr: 'النوع', value: isIntercity ? 'بين المحافظات' : 'داخل المدينة' },
      ],
      note: 'هذا تقدير أولي. ستتلقى عروض أسعار دقيقة من مزودي الخدمة.',
    };
  }

  /**
   * تقدير سعر الرحلة
   */
  private estimateRidePrice(
    data: CreateRequestInput,
    distanceKm: number
  ): PriceEstimation {
    const passengers = data.rideDetails?.passengers || 1;
    const isIntercity = data.pickup.governorate !== data.dropoff.governorate;

    // Base rates for intercity (EGP per km)
    const perKmRate = passengers <= 4 ? 5 : passengers <= 7 ? 6 : 8;
    const basePrice = distanceKm * perKmRate;

    return {
      estimatedMin: Math.round(basePrice * 0.85),
      estimatedMax: Math.round(basePrice * 1.25),
      currency: 'EGP',
      factors: [
        { name: 'المسافة', nameAr: 'المسافة', value: `${distanceKm} كم` },
        { name: 'الركاب', nameAr: 'عدد الركاب', value: `${passengers}` },
        { name: 'النوع', nameAr: 'النوع', value: isIntercity ? 'بين المحافظات' : 'داخل المدينة' },
      ],
      note: 'هذا تقدير أولي. ستتلقى عروض أسعار دقيقة من السائقين.',
    };
  }

  /**
   * حساب المسافة بين نقطتين
   */
  private calculateDistance(from: Location, to: Location): number {
    const R = 6371; // Earth's radius in km
    const dLat = (to.lat - from.lat) * Math.PI / 180;
    const dLng = (to.lng - from.lng) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(from.lat * Math.PI / 180) * Math.cos(to.lat * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 1.3); // 1.3 for road distance approximation
  }
}

// =====================================================
// INPUT TYPES
// =====================================================

export interface CreateRequestInput {
  serviceType: ServiceType;
  pickup: Location;
  dropoff: Location;
  shippingDetails?: {
    weight: number;
    dimensions?: { length: number; width: number; height: number };
    packageType: string;
    description: string;
    quantity: number;
    fragile: boolean;
    requiresCooling: boolean;
  };
  rideDetails?: {
    passengers: number;
    luggage: number;
    vehiclePreference?: VehicleType;
    amenities?: string[];
  };
  scheduledDate: Date;
  scheduledTime?: string;
  flexibility: 'EXACT' | 'FLEXIBLE_HOURS' | 'FLEXIBLE_DAYS';
  paymentMethod: 'CASH' | 'CARD' | 'WALLET' | 'COD';
  codAmount?: number;
  customerName: string;
  customerPhone: string;
  customerNotes?: string;
  budgetMin?: number;
  budgetMax?: number;
}

export interface SubmitQuoteInput {
  price: number;
  priceBreakdown: {
    basePrice: number;
    distanceCharge?: number;
    weightCharge?: number;
    codFee?: number;
    insuranceFee?: number;
    tollFees?: number;
    extras?: { name: string; price: number }[];
  };
  vehicleType: VehicleType;
  estimatedDuration: number;
  estimatedArrival: Date;
  notes?: string;
  termsConditions?: string;
  validHours?: number; // Default 24 hours
}

export interface RequestFilters {
  serviceType?: ServiceType;
  governorate?: string;
  city?: string;
  minBudget?: number;
  maxBudget?: number;
  scheduledAfter?: Date;
  scheduledBefore?: Date;
}

export interface PriceEstimation {
  estimatedMin: number;
  estimatedMax: number;
  currency: string;
  factors: { name: string; nameAr: string; value: string }[];
  note: string;
}

// =====================================================
// SINGLETON EXPORT
// =====================================================

export const marketplaceEngine = new MarketplaceEngine();
