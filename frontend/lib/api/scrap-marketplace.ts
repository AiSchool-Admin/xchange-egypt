import api from './client';

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
  // Handle nested data structure: { success, message, data: { items, pagination } }
  const responseData = response.data?.data || response.data;
  return responseData;
};

export const getScrapItemDetails = async (itemId: string) => {
  const response = await api.get(`/scrap/items/${itemId}`);
  return response.data?.data || response.data;
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
  return response.data?.data || response.data;
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
  return response.data?.data || response.data;
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

export interface PurchaseRequest {
  id: string;
  buyerId: string;
  title: string;
  description?: string;
  scrapType: ScrapType;
  metalType?: MetalType;
  minWeightKg?: number;
  maxWeightKg?: number;
  scrapCondition?: ScrapCondition;
  offeredPricePerKg?: number;
  offeredTotalPrice?: number;
  isNegotiable: boolean;
  governorate?: string;
  city?: string;
  offersPickup: boolean;
  pickupAddress?: string;
  expiresAt?: string;
  status: string;
  viewsCount: number;
  offersCount: number;
  createdAt: string;
  updatedAt: string;
  buyer?: {
    id: string;
    fullName: string;
    avatar?: string;
    businessName?: string;
    rating: number;
  };
}

export interface SellerOffer {
  id: string;
  requestId: string;
  sellerId: string;
  itemId?: string;
  offeredWeightKg: number;
  offeredPricePerKg?: number;
  offeredTotalPrice: number;
  message?: string;
  photos: string[];
  status: string;
  rejectionReason?: string;
  createdAt: string;
  seller?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating: number;
    phone?: string;
  };
  item?: {
    id: string;
    title: string;
    images: string[];
  };
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
  return response.data?.data || response.data;
};

export const getScrapByType = async () => {
  const response = await api.get('/scrap/stats/by-type');
  return response.data;
};

export const getComprehensiveStats = async () => {
  const response = await api.get('/scrap/stats/comprehensive');
  return response.data?.data || response.data;
};

// ============================================
// Material Prices API - أسعار المواد
// ============================================

export interface MaterialPrice {
  id: string;
  materialCategory: string;
  materialType: string;
  materialNameAr: string;
  pricePerKg: number;
  currency: string;
  priceChange?: number;
  priceChangeType?: 'up' | 'down' | 'stable';
  lastUpdated: string;
}

export const getMaterialPrices = async (category?: string) => {
  const params = category ? `?category=${category}` : '';
  const response = await api.get(`/scrap/material-prices${params}`);
  return response.data?.data || response.data;
};

export const upsertMaterialPrice = async (data: {
  materialCategory: string;
  materialType: string;
  materialNameAr: string;
  pricePerKg: number;
}) => {
  const response = await api.post('/scrap/material-prices', data);
  return response.data;
};

// ============================================
// Price Calculator API - حاسبة الأسعار
// ============================================

export interface CalculatorMaterial {
  materialType: string;
  weightKg: number;
}

export interface CalculatorResult {
  materials: Array<{
    materialType: string;
    materialNameAr: string;
    weightKg: number;
    pricePerKg: number;
    subtotal: number;
  }>;
  totalValue: number;
  currency: string;
  estimatedCO2Saved: number;
}

export const calculateScrapValue = async (materials: CalculatorMaterial[]): Promise<CalculatorResult> => {
  const response = await api.post('/scrap/calculator', { materials });
  return response.data?.data || response.data;
};

// ============================================
// Collection Requests API - طلبات الجمع (C2B)
// ============================================

export type CollectionRequestStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'SCHEDULED'
  | 'IN_TRANSIT'
  | 'ARRIVED'
  | 'WEIGHING'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'DISPUTED';

export const COLLECTION_STATUS_AR: Record<CollectionRequestStatus, string> = {
  PENDING: 'في الانتظار',
  ACCEPTED: 'مقبول',
  SCHEDULED: 'مجدول',
  IN_TRANSIT: 'في الطريق',
  ARRIVED: 'وصل',
  WEIGHING: 'جاري الوزن',
  COMPLETED: 'مكتمل',
  CANCELLED: 'ملغي',
  DISPUTED: 'متنازع عليه',
};

export interface CollectionMaterial {
  materialType: string;
  estimatedWeightKg: number;
  description?: string;
}

export interface CreateCollectionInput {
  materials: CollectionMaterial[];
  address: string;
  governorate: string;
  city?: string;
  preferredDate: string;
  preferredTimeSlot?: string;
  notes?: string;
  photos?: string[];
  latitude?: number;
  longitude?: number;
}

export interface CollectionRequest {
  id: string;
  requesterId: string;
  collectorId?: string;
  materials: CollectionMaterial[];
  estimatedTotalValue?: number;
  address: string;
  governorate: string;
  city?: string;
  preferredDate: string;
  preferredTimeSlot?: string;
  status: CollectionRequestStatus;
  actualWeights?: Record<string, number>;
  actualTotalValue?: number;
  collectionFee?: number;
  netAmount?: number;
  collectorRating?: number;
  requesterRating?: number;
  notes?: string;
  photos?: string[];
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
  collector?: {
    id: string;
    displayName: string;
    phoneNumber?: string;
    vehicleType?: string;
    rating: number;
  };
  requester?: {
    id: string;
    name: string;
    phoneNumber?: string;
  };
}

export const createCollectionRequest = async (data: CreateCollectionInput) => {
  const response = await api.post('/scrap/collections', data);
  return response.data?.data || response.data;
};

export const getUserCollections = async (status?: CollectionRequestStatus) => {
  const params = status ? `?status=${status}` : '';
  const response = await api.get(`/scrap/collections/my-requests${params}`);
  return response.data?.data || response.data;
};

export const getAvailableCollections = async (governorate?: string) => {
  const params = governorate ? `?governorate=${governorate}` : '';
  const response = await api.get(`/scrap/collections/available${params}`);
  return response.data?.data || response.data;
};

export const acceptCollection = async (requestId: string, scheduledDate?: string) => {
  const response = await api.post(`/scrap/collections/${requestId}/accept`, { scheduledDate });
  return response.data?.data || response.data;
};

export const updateCollectionStatus = async (
  requestId: string,
  status: CollectionRequestStatus,
  data?: {
    actualWeights?: Record<string, number>;
    actualTotalValue?: number;
    collectionFee?: number;
    notes?: string;
  }
) => {
  const response = await api.put(`/scrap/collections/${requestId}/status`, { status, ...data });
  return response.data?.data || response.data;
};

export const rateCollection = async (requestId: string, rating: number, review?: string) => {
  const response = await api.post(`/scrap/collections/${requestId}/rate`, { rating, review });
  return response.data?.data || response.data;
};

// ============================================
// Collector API - الجامعين
// ============================================

export interface RegisterCollectorInput {
  displayName: string;
  phoneNumber: string;
  vehicleType?: string;
  vehiclePlateNumber?: string;
  serviceAreas: string[];
  specializations?: ScrapType[];
  nationalIdUrl?: string;
  vehicleLicenseUrl?: string;
}

export interface CollectorProfile {
  id: string;
  userId: string;
  displayName: string;
  phoneNumber?: string;
  vehicleType?: string;
  vehiclePlateNumber?: string;
  serviceAreas: string[];
  specializations: ScrapType[];
  rating: number;
  totalCollections: number;
  totalWeightCollected: number;
  totalEarnings: number;
  isOnline: boolean;
  isVerified: boolean;
  currentLatitude?: number;
  currentLongitude?: number;
  createdAt: string;
}

export interface CollectorStats {
  profile: CollectorProfile;
  todayCollections: number;
  weekCollections: number;
  monthCollections: number;
  pendingRequests: number;
  activeRequest?: CollectionRequest;
  recentCollections: CollectionRequest[];
  earningsBreakdown: {
    today: number;
    week: number;
    month: number;
  };
}

export const registerCollector = async (data: RegisterCollectorInput) => {
  const response = await api.post('/scrap/collectors/register', data);
  return response.data?.data || response.data;
};

export const updateCollectorLocation = async (latitude: number, longitude: number, isOnline?: boolean) => {
  const response = await api.put('/scrap/collectors/location', { latitude, longitude, isOnline });
  return response.data?.data || response.data;
};

export const getCollectorStats = async (): Promise<CollectorStats> => {
  const response = await api.get('/scrap/collectors/stats');
  return response.data?.data || response.data;
};

// ============================================
// ESG Certificates API - شهادات ESG البيئية
// ============================================

export interface ESGCertificate {
  id: string;
  userId: string;
  certificateNumber: string;
  collectionRequestId?: string;
  transactionId?: string;
  materials: Array<{
    materialType: string;
    weightKg: number;
    co2SavedKg: number;
  }>;
  totalWeightKg: number;
  totalCO2SavedKg: number;
  treesEquivalent?: number;
  waterSavedLiters?: number;
  energySavedKwh?: number;
  issuedAt: string;
  validUntil?: string;
  qrCodeUrl?: string;
  pdfUrl?: string;
}

export interface GenerateESGInput {
  collectionRequestId?: string;
  transactionId?: string;
  materials?: Array<{
    materialType: string;
    weightKg: number;
  }>;
}

export const generateESGCertificate = async (data: GenerateESGInput): Promise<ESGCertificate> => {
  const response = await api.post('/scrap/esg/generate', data);
  return response.data?.data || response.data;
};

export const getUserESGCertificates = async (): Promise<ESGCertificate[]> => {
  const response = await api.get('/scrap/esg/my-certificates');
  return response.data?.data || response.data;
};

export const verifyESGCertificate = async (certificateNumber: string): Promise<ESGCertificate | null> => {
  const response = await api.get(`/scrap/esg/verify/${certificateNumber}`);
  return response.data?.data || response.data;
};

// ============================================
// Material Categories - فئات المواد
// ============================================

export const MATERIAL_CATEGORIES = {
  metal: {
    nameAr: 'معادن',
    icon: '⚙️',
    types: [
      { type: 'copper_red', nameAr: 'نحاس أحمر خام' },
      { type: 'copper_yellow', nameAr: 'نحاس أصفر' },
      { type: 'copper_burnt', nameAr: 'نحاس محروق' },
      { type: 'aluminum_soft', nameAr: 'ألمونيوم طري' },
      { type: 'aluminum_hard', nameAr: 'ألمونيوم كاست' },
      { type: 'aluminum_cans', nameAr: 'علب ألمونيوم' },
      { type: 'iron', nameAr: 'حديد خردة' },
      { type: 'stainless_steel', nameAr: 'استانلس ستيل' },
      { type: 'lead', nameAr: 'رصاص' },
      { type: 'zinc', nameAr: 'زنك' },
      { type: 'brass', nameAr: 'نحاس أصفر (براص)' },
    ],
  },
  paper: {
    nameAr: 'ورق وكرتون',
    icon: '📄',
    types: [
      { type: 'cardboard', nameAr: 'كرتون' },
      { type: 'white_paper', nameAr: 'ورق أبيض' },
      { type: 'newspaper', nameAr: 'جرائد' },
      { type: 'mixed_paper', nameAr: 'ورق مخلوط' },
      { type: 'books', nameAr: 'كتب ومجلات' },
    ],
  },
  plastic: {
    nameAr: 'بلاستيك',
    icon: '♻️',
    types: [
      { type: 'pet', nameAr: 'بلاستيك PET (زجاجات)' },
      { type: 'hdpe', nameAr: 'بلاستيك HDPE' },
      { type: 'pvc', nameAr: 'بلاستيك PVC' },
      { type: 'ldpe', nameAr: 'بلاستيك LDPE (أكياس)' },
      { type: 'pp', nameAr: 'بلاستيك PP' },
      { type: 'mixed_plastic', nameAr: 'بلاستيك مخلوط' },
    ],
  },
  electronics: {
    nameAr: 'إلكترونيات',
    icon: '💻',
    types: [
      { type: 'computer_parts', nameAr: 'قطع كمبيوتر' },
      { type: 'mobile_phones', nameAr: 'هواتف محمولة' },
      { type: 'cables', nameAr: 'كابلات وأسلاك' },
      { type: 'circuit_boards', nameAr: 'لوحات إلكترونية' },
      { type: 'batteries', nameAr: 'بطاريات' },
    ],
  },
  appliances: {
    nameAr: 'أجهزة منزلية',
    icon: '🔌',
    types: [
      { type: 'washing_machine', nameAr: 'غسالات' },
      { type: 'refrigerator', nameAr: 'ثلاجات' },
      { type: 'air_conditioner', nameAr: 'تكييفات' },
      { type: 'small_appliances', nameAr: 'أجهزة صغيرة' },
      { type: 'motors', nameAr: 'موتورات' },
    ],
  },
  textiles: {
    nameAr: 'منسوجات',
    icon: '👕',
    types: [
      { type: 'clothes', nameAr: 'ملابس مستعملة' },
      { type: 'fabric_scraps', nameAr: 'قصاصات قماش' },
      { type: 'carpets', nameAr: 'سجاد' },
      { type: 'shoes', nameAr: 'أحذية' },
    ],
  },
  glass: {
    nameAr: 'زجاج',
    icon: '🫙',
    types: [
      { type: 'clear_glass', nameAr: 'زجاج شفاف' },
      { type: 'colored_glass', nameAr: 'زجاج ملون' },
      { type: 'broken_glass', nameAr: 'زجاج مكسور' },
    ],
  },
  wood: {
    nameAr: 'خشب',
    icon: '🪵',
    types: [
      { type: 'furniture_wood', nameAr: 'خشب أثاث' },
      { type: 'pallets', nameAr: 'طبالي خشب' },
      { type: 'mdf', nameAr: 'خشب MDF' },
    ],
  },
  oil: {
    nameAr: 'زيوت',
    icon: '🛢️',
    types: [
      { type: 'cooking_oil', nameAr: 'زيت طعام مستعمل' },
      { type: 'motor_oil', nameAr: 'زيت موتور' },
    ],
  },
};
