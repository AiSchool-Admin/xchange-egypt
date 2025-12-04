import api from './index';

// ============================================
// سوق التوالف - Scrap Marketplace API
// ============================================

// Types
export type ScrapType =
  | 'ELECTRONICS'
  | 'HOME_APPLIANCES'
  | 'COMPUTERS'
  | 'PHONES'
  | 'CABLES_WIRES'
  | 'MOTORS'
  | 'BATTERIES'
  | 'METAL_SCRAP'
  | 'CAR_PARTS'
  | 'FURNITURE_PARTS'
  | 'WOOD'
  | 'PLASTIC'
  | 'TEXTILES'
  | 'PAPER'
  | 'GLASS'
  | 'CONSTRUCTION'
  | 'INDUSTRIAL'
  | 'MEDICAL'
  | 'OTHER';

export type ScrapCondition =
  | 'TOTALLY_DAMAGED'
  | 'NOT_WORKING'
  | 'PARTIALLY_WORKING'
  | 'WORKING_OLD';

export type MetalType =
  | 'COPPER'
  | 'ALUMINUM'
  | 'IRON'
  | 'STEEL'
  | 'BRASS'
  | 'BRONZE'
  | 'LEAD'
  | 'ZINC'
  | 'NICKEL'
  | 'TIN'
  | 'GOLD'
  | 'SILVER'
  | 'STAINLESS_STEEL'
  | 'MIXED';

export type ScrapPricingType = 'PER_PIECE' | 'PER_KG' | 'PER_LOT' | 'REVERSE_AUCTION';

export type ScrapDealerType =
  | 'INDIVIDUAL_COLLECTOR'
  | 'SCRAP_DEALER'
  | 'RECYCLING_COMPANY'
  | 'REPAIR_TECHNICIAN'
  | 'FACTORY'
  | 'EXPORT_COMPANY';

// Arabic translations
export const SCRAP_TYPE_AR: Record<ScrapType, string> = {
  ELECTRONICS: 'إلكترونيات',
  HOME_APPLIANCES: 'أجهزة منزلية',
  COMPUTERS: 'كمبيوترات ولابتوبات',
  PHONES: 'هواتف وتابلت',
  CABLES_WIRES: 'كابلات وأسلاك',
  MOTORS: 'موتورات',
  BATTERIES: 'بطاريات',
  METAL_SCRAP: 'خردة معادن',
  CAR_PARTS: 'قطع غيار سيارات',
  FURNITURE_PARTS: 'أجزاء أثاث',
  WOOD: 'خشب',
  PLASTIC: 'بلاستيك',
  TEXTILES: 'منسوجات',
  PAPER: 'ورق وكرتون',
  GLASS: 'زجاج',
  CONSTRUCTION: 'مواد بناء',
  INDUSTRIAL: 'معدات صناعية',
  MEDICAL: 'معدات طبية',
  OTHER: 'أخرى',
};

export const SCRAP_CONDITION_AR: Record<ScrapCondition, string> = {
  TOTALLY_DAMAGED: 'تالف بالكامل',
  NOT_WORKING: 'لا يعمل',
  PARTIALLY_WORKING: 'يعمل جزئياً',
  WORKING_OLD: 'قديم يعمل',
};

export const METAL_TYPE_AR: Record<MetalType, string> = {
  COPPER: 'نحاس',
  ALUMINUM: 'ألومنيوم',
  IRON: 'حديد',
  STEEL: 'صلب',
  BRASS: 'نحاس أصفر',
  BRONZE: 'برونز',
  LEAD: 'رصاص',
  ZINC: 'زنك',
  NICKEL: 'نيكل',
  TIN: 'قصدير',
  GOLD: 'ذهب',
  SILVER: 'فضة',
  STAINLESS_STEEL: 'ستانلس ستيل',
  MIXED: 'مخلوط',
};

export const SCRAP_PRICING_AR: Record<ScrapPricingType, string> = {
  PER_PIECE: 'بالقطعة',
  PER_KG: 'بالكيلو',
  PER_LOT: 'بالجملة',
  REVERSE_AUCTION: 'مزاد عكسي',
};

export const DEALER_TYPE_AR: Record<ScrapDealerType, string> = {
  INDIVIDUAL_COLLECTOR: 'جامع فردي',
  SCRAP_DEALER: 'تاجر خردة',
  RECYCLING_COMPANY: 'شركة إعادة تدوير',
  REPAIR_TECHNICIAN: 'فني إصلاح',
  FACTORY: 'مصنع',
  EXPORT_COMPANY: 'شركة تصدير',
};

// ============================================
// Scrap Items API
// ============================================

export interface ScrapItemFilters {
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

export interface CreateScrapItemInput {
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

export const getScrapItems = async (filters: ScrapItemFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  const response = await api.get(`/scrap/items?${params.toString()}`);
  return response.data;
};

export const getScrapItemDetails = async (itemId: string) => {
  const response = await api.get(`/scrap/items/${itemId}`);
  return response.data;
};

export const createScrapItem = async (data: CreateScrapItemInput) => {
  const response = await api.post('/scrap/items', data);
  return response.data;
};

// ============================================
// Scrap Dealers API
// ============================================

export interface DealerFilters {
  dealerType?: ScrapDealerType;
  governorate?: string;
  specialization?: ScrapType;
  metalType?: MetalType;
  offersPickup?: boolean;
  page?: number;
  limit?: number;
}

export interface RegisterDealerInput {
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

export const getScrapDealers = async (filters: DealerFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  const response = await api.get(`/scrap/dealers?${params.toString()}`);
  return response.data;
};

export const getDealerDetails = async (dealerId: string) => {
  const response = await api.get(`/scrap/dealers/${dealerId}`);
  return response.data;
};

export const registerScrapDealer = async (data: RegisterDealerInput) => {
  const response = await api.post('/scrap/dealers/register', data);
  return response.data;
};

// ============================================
// Metal Prices API
// ============================================

export const getMetalPrices = async () => {
  const response = await api.get('/scrap/metal-prices');
  return response.data;
};

export const getMetalPriceHistory = async (metalType: MetalType, days: number = 30) => {
  const response = await api.get(`/scrap/metal-prices/${metalType}/history?days=${days}`);
  return response.data;
};

export const addMetalPrice = async (data: { metalType: MetalType; pricePerKg: number; source?: string }) => {
  const response = await api.post('/scrap/metal-prices', data);
  return response.data;
};

// ============================================
// Purchase Requests API
// ============================================

export interface PurchaseRequestFilters {
  scrapType?: ScrapType;
  metalType?: MetalType;
  governorate?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface CreatePurchaseRequestInput {
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
  expiresAt?: string;
}

export interface SubmitOfferInput {
  itemId?: string;
  offeredWeightKg: number;
  offeredPricePerKg?: number;
  offeredTotalPrice: number;
  message?: string;
  photos?: string[];
}

export const getPurchaseRequests = async (filters: PurchaseRequestFilters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      params.append(key, String(value));
    }
  });
  const response = await api.get(`/scrap/purchase-requests?${params.toString()}`);
  return response.data;
};

export const createPurchaseRequest = async (data: CreatePurchaseRequestInput) => {
  const response = await api.post('/scrap/purchase-requests', data);
  return response.data;
};

export const submitSellerOffer = async (requestId: string, data: SubmitOfferInput) => {
  const response = await api.post(`/scrap/purchase-requests/${requestId}/offers`, data);
  return response.data;
};

export const getRequestOffers = async (requestId: string) => {
  const response = await api.get(`/scrap/purchase-requests/${requestId}/offers`);
  return response.data;
};

export const acceptOffer = async (offerId: string) => {
  const response = await api.post(`/scrap/offers/${offerId}/accept`);
  return response.data;
};

// ============================================
// Statistics API
// ============================================

export const getMarketStats = async () => {
  const response = await api.get('/scrap/stats');
  return response.data;
};

export const getScrapByType = async () => {
  const response = await api.get('/scrap/stats/by-type');
  return response.data;
};
