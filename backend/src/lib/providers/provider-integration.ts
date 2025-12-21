/**
 * Xchange Egypt - Provider Integration Layer
 * ==========================================
 *
 * Unified interface for integrating with ride-hailing and shipping providers
 *
 * Integration Types:
 * 1. FULL_API - Complete API integration (Uber, Careem, Bosta, Aramex)
 * 2. DEEP_LINK - App deep linking (Bolt)
 * 3. WHATSAPP - WhatsApp Business integration (inDrive, DiDi, Swvl, Halan)
 */

export type IntegrationType = 'FULL_API' | 'DEEP_LINK' | 'WHATSAPP';
export type ServiceType = 'RIDE' | 'SHIPPING';

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  name?: string;
}

export interface BookingRequest {
  pickup: Location;
  dropoff: Location;
  scheduledTime?: Date;
  notes?: string;
  customerPhone?: string;
  customerName?: string;
}

export interface ShippingRequest {
  pickup: Location;
  dropoff: Location;
  weight?: number;
  dimensions?: { length: number; width: number; height: number };
  description?: string;
  codAmount?: number; // Cash on delivery
  customerPhone: string;
  customerName: string;
}

export interface BookingResponse {
  success: boolean;
  bookingId?: string;
  status?: 'PENDING' | 'CONFIRMED' | 'DRIVER_ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  driverInfo?: {
    name: string;
    phone: string;
    vehicle: string;
    plateNumber: string;
    rating: number;
    photo?: string;
  };
  eta?: number;
  trackingUrl?: string;
  error?: string;
}

export interface PriceQuote {
  provider: string;
  price: number;
  currency: string;
  eta: number;
  vehicleType: string;
}

// Provider configuration
export interface ProviderConfig {
  id: string;
  name: string;
  nameAr: string;
  serviceType: ServiceType;
  integrationType: IntegrationType;
  isActive: boolean;

  // API credentials (for FULL_API)
  apiKey?: string;
  apiSecret?: string;
  clientId?: string;
  clientSecret?: string;
  baseUrl?: string;

  // WhatsApp info (for WHATSAPP type)
  whatsappNumber?: string;
  whatsappBusinessId?: string;

  // Deep link info
  deepLinkScheme?: string;
  universalLink?: string;

  // App store links
  appStoreUrl?: string;
  playStoreUrl?: string;
}

// Provider registry
export const PROVIDER_CONFIGS: Record<string, ProviderConfig> = {
  // ============================================
  // RIDE-HAILING PROVIDERS
  // ============================================

  UBER: {
    id: 'UBER',
    name: 'Uber',
    nameAr: 'أوبر',
    serviceType: 'RIDE',
    integrationType: 'FULL_API',
    isActive: true,
    baseUrl: 'https://api.uber.com/v1.2',
    // Credentials loaded from environment
    clientId: process.env.UBER_CLIENT_ID,
    clientSecret: process.env.UBER_CLIENT_SECRET,
    deepLinkScheme: 'uber://',
    universalLink: 'https://m.uber.com/ul/',
    appStoreUrl: 'https://apps.apple.com/app/uber/id368677368',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.ubercab',
  },

  CAREEM: {
    id: 'CAREEM',
    name: 'Careem',
    nameAr: 'كريم',
    serviceType: 'RIDE',
    integrationType: 'FULL_API',
    isActive: true,
    baseUrl: 'https://api.careem.com/v1',
    clientId: process.env.CAREEM_CLIENT_ID,
    clientSecret: process.env.CAREEM_CLIENT_SECRET,
    deepLinkScheme: 'careem://',
    universalLink: 'https://app.careem.com',
    appStoreUrl: 'https://apps.apple.com/app/careem/id592978487',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.careem.acma',
  },

  BOLT: {
    id: 'BOLT',
    name: 'Bolt',
    nameAr: 'بولت',
    serviceType: 'RIDE',
    integrationType: 'DEEP_LINK',
    isActive: true,
    deepLinkScheme: 'bolt://',
    universalLink: 'https://bolt.eu/ride/',
    appStoreUrl: 'https://apps.apple.com/app/bolt-request-a-ride/id675033630',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=ee.mtakso.client',
  },

  INDRIVE: {
    id: 'INDRIVE',
    name: 'inDrive',
    nameAr: 'إن درايف',
    serviceType: 'RIDE',
    integrationType: 'WHATSAPP',
    isActive: true,
    whatsappNumber: '201000000000', // Placeholder - get real number
    deepLinkScheme: 'indrive://',
    appStoreUrl: 'https://apps.apple.com/app/indrive/id789066289',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=sinet.startup.inDriver',
  },

  DIDI: {
    id: 'DIDI',
    name: 'DiDi',
    nameAr: 'ديدي',
    serviceType: 'RIDE',
    integrationType: 'WHATSAPP',
    isActive: true,
    whatsappNumber: '201000000000', // Placeholder
    deepLinkScheme: 'didiglobal://',
    appStoreUrl: 'https://apps.apple.com/app/didi-rider/id1489604832',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.didiglobal.passenger',
  },

  SWVL: {
    id: 'SWVL',
    name: 'Swvl',
    nameAr: 'سويفل',
    serviceType: 'RIDE',
    integrationType: 'WHATSAPP',
    isActive: true,
    whatsappNumber: '201000000000', // Placeholder
    deepLinkScheme: 'swvl://',
    appStoreUrl: 'https://apps.apple.com/app/swvl/id1210151498',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.swvl.rider',
  },

  HALAN: {
    id: 'HALAN',
    name: 'Halan',
    nameAr: 'هلان',
    serviceType: 'RIDE',
    integrationType: 'WHATSAPP',
    isActive: true,
    whatsappNumber: '201000000000', // Placeholder
    deepLinkScheme: 'halan://',
    appStoreUrl: 'https://apps.apple.com/app/halan/id1434633092',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.mwasalat.halan',
  },

  // ============================================
  // SHIPPING PROVIDERS
  // ============================================

  BOSTA: {
    id: 'BOSTA',
    name: 'Bosta',
    nameAr: 'بوسطة',
    serviceType: 'SHIPPING',
    integrationType: 'FULL_API',
    isActive: true,
    baseUrl: 'https://app.bosta.co/api/v2',
    apiKey: process.env.BOSTA_API_KEY,
    appStoreUrl: 'https://apps.apple.com/app/bosta/id1436092293',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=co.bosta.app',
  },

  ARAMEX: {
    id: 'ARAMEX',
    name: 'Aramex',
    nameAr: 'أرامكس',
    serviceType: 'SHIPPING',
    integrationType: 'FULL_API',
    isActive: true,
    baseUrl: 'https://ws.aramex.net/ShippingAPI.V2',
    // Aramex uses account-based auth
    appStoreUrl: 'https://apps.apple.com/app/aramex/id1440422698',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.aramex.android',
  },

  FETCHR: {
    id: 'FETCHR',
    name: 'Fetchr',
    nameAr: 'فيتشر',
    serviceType: 'SHIPPING',
    integrationType: 'WHATSAPP',
    isActive: true,
    whatsappNumber: '201000000000', // Placeholder
    appStoreUrl: 'https://apps.apple.com/app/fetchr/id1068261498',
    playStoreUrl: 'https://play.google.com/store/apps/details?id=com.fetchr.consumer',
  },

  RABBIT: {
    id: 'RABBIT',
    name: 'Rabbit',
    nameAr: 'رابيت',
    serviceType: 'SHIPPING',
    integrationType: 'WHATSAPP',
    isActive: true,
    whatsappNumber: '201000000000', // Placeholder
  },
};

// Abstract provider interface
export interface IProviderService {
  getQuote(request: BookingRequest | ShippingRequest): Promise<PriceQuote[]>;
  createBooking(request: BookingRequest | ShippingRequest): Promise<BookingResponse>;
  cancelBooking(bookingId: string): Promise<boolean>;
  getBookingStatus(bookingId: string): Promise<BookingResponse>;
  getTrackingUrl(bookingId: string): Promise<string>;
}

// Get providers by type
export function getProvidersByType(serviceType: ServiceType): ProviderConfig[] {
  return Object.values(PROVIDER_CONFIGS).filter(
    p => p.serviceType === serviceType && p.isActive
  );
}

// Get providers by integration type
export function getProvidersByIntegration(integrationType: IntegrationType): ProviderConfig[] {
  return Object.values(PROVIDER_CONFIGS).filter(
    p => p.integrationType === integrationType && p.isActive
  );
}

// Get provider config
export function getProviderConfig(providerId: string): ProviderConfig | null {
  return PROVIDER_CONFIGS[providerId] || null;
}
