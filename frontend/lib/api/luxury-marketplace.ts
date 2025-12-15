import apiClient from './client';

// ============================================
// Types & Enums
// ============================================

export type LuxuryCategoryType =
  | 'WATCHES'
  | 'JEWELRY'
  | 'HANDBAGS'
  | 'CARS'
  | 'ART'
  | 'ANTIQUES'
  | 'REAL_ESTATE'
  | 'PERFUMES'
  | 'PENS'
  | 'SUNGLASSES'
  | 'OTHER';

export type LuxuryItemStatus =
  | 'PENDING_VERIFICATION'
  | 'UNDER_REVIEW'
  | 'VERIFIED_AUTHENTIC'
  | 'VERIFIED_WITH_ISSUES'
  | 'REJECTED_FAKE'
  | 'LISTED'
  | 'SOLD'
  | 'WITHDRAWN';

export type VerificationStatus =
  | 'PENDING'
  | 'IN_PROGRESS'
  | 'VERIFIED'
  | 'FAILED'
  | 'REQUIRES_PHYSICAL';

export type BidStatus =
  | 'ACTIVE'
  | 'OUTBID'
  | 'WINNING'
  | 'WON'
  | 'LOST'
  | 'CANCELLED'
  | 'EXPIRED';

export type WatchMovementType =
  | 'AUTOMATIC'
  | 'MANUAL'
  | 'QUARTZ'
  | 'SOLAR'
  | 'KINETIC'
  | 'SMARTWATCH';

export type JewelryMetalType =
  | 'GOLD_24K'
  | 'GOLD_21K'
  | 'GOLD_18K'
  | 'GOLD_14K'
  | 'WHITE_GOLD'
  | 'ROSE_GOLD'
  | 'PLATINUM'
  | 'SILVER_925'
  | 'SILVER_999'
  | 'TITANIUM'
  | 'MIXED';

export type GemstoneType =
  | 'DIAMOND'
  | 'RUBY'
  | 'EMERALD'
  | 'SAPPHIRE'
  | 'PEARL'
  | 'OPAL'
  | 'AMETHYST'
  | 'TOPAZ'
  | 'AQUAMARINE'
  | 'TURQUOISE'
  | 'NONE'
  | 'OTHER';

// Arabic translations
export const LUXURY_CATEGORY_AR: Record<LuxuryCategoryType, string> = {
  WATCHES: 'ساعات فاخرة',
  JEWELRY: 'مجوهرات',
  HANDBAGS: 'حقائب فاخرة',
  CARS: 'سيارات فاخرة',
  ART: 'لوحات فنية',
  ANTIQUES: 'تحف أثرية',
  REAL_ESTATE: 'عقارات',
  PERFUMES: 'عطور',
  PENS: 'أقلام فاخرة',
  SUNGLASSES: 'نظارات شمسية',
  OTHER: 'أخرى',
};

export const LUXURY_STATUS_AR: Record<LuxuryItemStatus, string> = {
  PENDING_VERIFICATION: 'في انتظار التحقق',
  UNDER_REVIEW: 'تحت المراجعة',
  VERIFIED_AUTHENTIC: 'موثق - أصلي',
  VERIFIED_WITH_ISSUES: 'موثق - مع ملاحظات',
  REJECTED_FAKE: 'مرفوض - مزيف',
  LISTED: 'معروض للبيع',
  SOLD: 'تم البيع',
  WITHDRAWN: 'تم السحب',
};

export const VERIFICATION_STATUS_AR: Record<VerificationStatus, string> = {
  PENDING: 'في الانتظار',
  IN_PROGRESS: 'جاري التحقق',
  VERIFIED: 'تم التحقق',
  FAILED: 'فشل التحقق',
  REQUIRES_PHYSICAL: 'يتطلب فحص مباشر',
};

export const WATCH_MOVEMENT_AR: Record<WatchMovementType, string> = {
  AUTOMATIC: 'أوتوماتيك',
  MANUAL: 'يدوي',
  QUARTZ: 'كوارتز',
  SOLAR: 'شمسي',
  KINETIC: 'حركي',
  SMARTWATCH: 'ذكية',
};

export const JEWELRY_METAL_AR: Record<JewelryMetalType, string> = {
  GOLD_24K: 'ذهب 24 قيراط',
  GOLD_21K: 'ذهب 21 قيراط',
  GOLD_18K: 'ذهب 18 قيراط',
  GOLD_14K: 'ذهب 14 قيراط',
  WHITE_GOLD: 'ذهب أبيض',
  ROSE_GOLD: 'ذهب وردي',
  PLATINUM: 'بلاتين',
  SILVER_925: 'فضة 925',
  SILVER_999: 'فضة 999',
  TITANIUM: 'تيتانيوم',
  MIXED: 'مختلط',
};

export const GEMSTONE_AR: Record<GemstoneType, string> = {
  DIAMOND: 'ألماس',
  RUBY: 'ياقوت أحمر',
  EMERALD: 'زمرد',
  SAPPHIRE: 'ياقوت أزرق',
  PEARL: 'لؤلؤ',
  OPAL: 'أوبال',
  AMETHYST: 'جمشت',
  TOPAZ: 'توباز',
  AQUAMARINE: 'أكوامارين',
  TURQUOISE: 'فيروز',
  NONE: 'بدون',
  OTHER: 'أخرى',
};

// ============================================
// Interfaces
// ============================================

export interface LuxuryItem {
  id: string;
  itemId?: string;
  sellerId: string;
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  categoryType: LuxuryCategoryType;
  brand: string;
  model?: string;
  referenceNumber?: string;
  serialNumber?: string;
  yearOfManufacture?: number;

  askingPrice: number;
  minOfferPrice?: number;
  reservePrice?: number;
  currency: string;
  isNegotiable: boolean;
  acceptsOffers: boolean;
  acceptsBids: boolean;

  auctionStart?: string;
  auctionEnd?: string;
  startingBid?: number;
  currentBid?: number;
  bidIncrement?: number;
  totalBids: number;

  conditionGrade?: string;
  conditionNotesAr?: string;
  hasOriginalBox: boolean;
  hasPapers: boolean;
  hasWarranty: boolean;
  warrantyExpires?: string;
  hasReceipt: boolean;
  hasCertificate: boolean;

  status: LuxuryItemStatus;
  verificationStatus: VerificationStatus;
  verifiedAt?: string;
  certificateUrl?: string;
  entrupyVerified: boolean;

  images: string[];
  videos?: string[];
  documents?: string[];

  governorate?: string;
  city?: string;
  canShip: boolean;

  views: number;
  favorites: number;
  inquiries: number;

  createdAt: string;
  updatedAt: string;
  listedAt?: string;
  soldAt?: string;

  // Relations
  seller?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  watchDetails?: WatchDetails;
  jewelryDetails?: JewelryDetails;
  handbagDetails?: HandbagDetails;
}

export interface WatchDetails {
  movementType?: WatchMovementType;
  caliber?: string;
  powerReserveHours?: number;
  caseMaterial?: string;
  caseDiameterMm?: number;
  caseThicknessMm?: number;
  dialColor?: string;
  crystalType?: string;
  waterResistanceMeters?: number;
  strapMaterial?: string;
  strapColor?: string;
  claspType?: string;
  complications?: string[];
  lastServiceDate?: string;
}

export interface JewelryDetails {
  metalType?: JewelryMetalType;
  metalWeightGrams?: number;
  metalPurity?: string;
  primaryGemstone?: GemstoneType;
  gemstoneCarat?: number;
  gemstoneColor?: string;
  gemstoneClarity?: string;
  gemstoneCut?: string;
  gemstoneCount?: number;
  giaCertified?: boolean;
  giaCertificateNumber?: string;
  ringSize?: string;
  necklaceLengthCm?: number;
  braceletLengthCm?: number;
}

export interface HandbagDetails {
  material?: string;
  leatherType?: string;
  color?: string;
  hardwareColor?: string;
  size?: string;
  dimensionsCm?: string;
  modelLine?: string;
  collectionYear?: string;
  limitedEdition?: boolean;
  editionNumber?: string;
  cornersCondition?: string;
  handlesCondition?: string;
  hardwareCondition?: string;
  interiorCondition?: string;
}

export interface LuxuryBid {
  id: string;
  luxuryItemId: string;
  bidderId: string;
  amount: number;
  maxAutoBid?: number;
  status: BidStatus;
  createdAt: string;
  bidder?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface LuxuryOffer {
  id: string;
  luxuryItemId: string;
  buyerId: string;
  amount: number;
  message?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTER' | 'EXPIRED';
  counterAmount?: number;
  counterMessage?: string;
  expiresAt?: string;
  respondedAt?: string;
  createdAt: string;
  buyer?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface LuxuryExpert {
  id: string;
  userId: string;
  nameAr: string;
  nameEn?: string;
  titleAr?: string;
  titleEn?: string;
  bioAr?: string;
  bioEn?: string;
  avatar?: string;
  specializations: LuxuryCategoryType[];
  certifiedBrands: string[];
  yearsExperience: number;
  entrupyCertified: boolean;
  totalVerifications: number;
  accuracyRate: number;
  avgRating: number;
  totalReviews: number;
  isActive: boolean;
  governorate?: string;
}

export interface LuxuryBrandPrice {
  id: string;
  brand: string;
  model?: string;
  categoryType: LuxuryCategoryType;
  retailPriceUsd?: number;
  marketPriceUsd?: number;
  avgResalePriceEgp?: number;
  priceTrend?: 'UP' | 'DOWN' | 'STABLE';
  trendPercentage?: number;
  lastSalePrice?: number;
  lastSaleDate?: string;
  totalSales: number;
}

// ============================================
// API Functions
// ============================================

// Get luxury items with filters
export interface LuxuryItemsParams {
  page?: number;
  limit?: number;
  categoryType?: LuxuryCategoryType;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: LuxuryItemStatus;
  verificationStatus?: VerificationStatus;
  governorate?: string;
  conditionGrade?: string;
  hasBox?: boolean;
  hasPapers?: boolean;
  acceptsBids?: boolean;
  sortBy?: 'price_high' | 'price_low' | 'recent' | 'popular' | 'ending_soon';
  search?: string;
}

export interface LuxuryItemsResponse {
  success: boolean;
  data: {
    items: LuxuryItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export const getLuxuryMarketplaceItems = async (
  params?: LuxuryItemsParams
): Promise<LuxuryItemsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.categoryType) queryParams.append('categoryType', params.categoryType);
  if (params?.brand) queryParams.append('brand', params.brand);
  if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.verificationStatus) queryParams.append('verificationStatus', params.verificationStatus);
  if (params?.governorate) queryParams.append('governorate', params.governorate);
  if (params?.conditionGrade) queryParams.append('conditionGrade', params.conditionGrade);
  if (params?.hasBox !== undefined) queryParams.append('hasBox', params.hasBox.toString());
  if (params?.hasPapers !== undefined) queryParams.append('hasPapers', params.hasPapers.toString());
  if (params?.acceptsBids !== undefined) queryParams.append('acceptsBids', params.acceptsBids.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.search) queryParams.append('search', params.search);

  const response = await apiClient.get(`/luxury/items?${queryParams.toString()}`);
  return response.data;
};

// Get single luxury item
export const getLuxuryItem = async (id: string): Promise<{ success: boolean; data: LuxuryItem }> => {
  const response = await apiClient.get(`/luxury/items/${id}`);
  return response.data;
};

// Create luxury item listing
export interface CreateLuxuryItemData {
  titleAr: string;
  titleEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  categoryType: LuxuryCategoryType;
  brand: string;
  model?: string;
  referenceNumber?: string;
  serialNumber?: string;
  yearOfManufacture?: number;
  askingPrice: number;
  minOfferPrice?: number;
  isNegotiable?: boolean;
  acceptsOffers?: boolean;
  acceptsBids?: boolean;
  auctionEnd?: string;
  startingBid?: number;
  bidIncrement?: number;
  conditionGrade?: string;
  conditionNotesAr?: string;
  hasOriginalBox?: boolean;
  hasPapers?: boolean;
  hasWarranty?: boolean;
  warrantyExpires?: string;
  hasReceipt?: boolean;
  hasCertificate?: boolean;
  images: string[];
  videos?: string[];
  documents?: string[];
  governorate?: string;
  city?: string;
  canShip?: boolean;
  shippingNotes?: string;
  // Category-specific details
  watchDetails?: Partial<WatchDetails>;
  jewelryDetails?: Partial<JewelryDetails>;
  handbagDetails?: Partial<HandbagDetails>;
}

export const createLuxuryItem = async (
  data: CreateLuxuryItemData
): Promise<{ success: boolean; data: LuxuryItem }> => {
  const response = await apiClient.post('/luxury/items', data);
  return response.data;
};

// Update luxury item
export const updateLuxuryItem = async (
  id: string,
  data: Partial<CreateLuxuryItemData>
): Promise<{ success: boolean; data: LuxuryItem }> => {
  const response = await apiClient.put(`/luxury/items/${id}`, data);
  return response.data;
};

// Place a bid
export interface PlaceBidData {
  amount: number;
  maxAutoBid?: number;
}

export const placeBid = async (
  itemId: string,
  data: PlaceBidData
): Promise<{ success: boolean; data: LuxuryBid }> => {
  const response = await apiClient.post(`/luxury/items/${itemId}/bids`, data);
  return response.data;
};

// Get bids for an item
export const getItemBids = async (
  itemId: string
): Promise<{ success: boolean; data: LuxuryBid[] }> => {
  const response = await apiClient.get(`/luxury/items/${itemId}/bids`);
  return response.data;
};

// Submit an offer
export interface SubmitOfferData {
  amount: number;
  message?: string;
}

export const submitOffer = async (
  itemId: string,
  data: SubmitOfferData
): Promise<{ success: boolean; data: LuxuryOffer }> => {
  const response = await apiClient.post(`/luxury/items/${itemId}/offers`, data);
  return response.data;
};

// Respond to offer (seller)
export interface RespondOfferData {
  action: 'ACCEPT' | 'REJECT' | 'COUNTER';
  counterAmount?: number;
  counterMessage?: string;
}

export const respondToOffer = async (
  offerId: string,
  data: RespondOfferData
): Promise<{ success: boolean; data: LuxuryOffer }> => {
  const response = await apiClient.put(`/luxury/offers/${offerId}`, data);
  return response.data;
};

// Get offers for an item (seller view)
export const getItemOffers = async (
  itemId: string
): Promise<{ success: boolean; data: LuxuryOffer[] }> => {
  const response = await apiClient.get(`/luxury/items/${itemId}/offers`);
  return response.data;
};

// Get my offers (buyer view)
export const getMyOffers = async (): Promise<{ success: boolean; data: LuxuryOffer[] }> => {
  const response = await apiClient.get('/luxury/offers/my');
  return response.data;
};

// Get experts
export const getLuxuryExperts = async (params?: {
  specialization?: LuxuryCategoryType;
  governorate?: string;
}): Promise<{ success: boolean; data: LuxuryExpert[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.specialization) queryParams.append('specialization', params.specialization);
  if (params?.governorate) queryParams.append('governorate', params.governorate);

  const response = await apiClient.get(`/luxury/experts?${queryParams.toString()}`);
  return response.data;
};

// Request verification
export interface RequestVerificationData {
  luxuryItemId: string;
  verificationType: 'STANDARD' | 'PREMIUM' | 'ENTRUPY';
  notes?: string;
  documentsSubmitted?: string[];
}

export const requestVerification = async (
  data: RequestVerificationData
): Promise<{ success: boolean; data: { id: string; status: VerificationStatus } }> => {
  const response = await apiClient.post('/luxury/verification/request', data);
  return response.data;
};

// Get brand prices / market data
export const getLuxuryBrandPrices = async (params?: {
  categoryType?: LuxuryCategoryType;
  brand?: string;
}): Promise<{ success: boolean; data: LuxuryBrandPrice[] }> => {
  const queryParams = new URLSearchParams();
  if (params?.categoryType) queryParams.append('categoryType', params.categoryType);
  if (params?.brand) queryParams.append('brand', params.brand);

  const response = await apiClient.get(`/luxury/prices?${queryParams.toString()}`);
  return response.data;
};

// Toggle favorite
export const toggleLuxuryFavorite = async (
  itemId: string
): Promise<{ success: boolean; isFavorited: boolean }> => {
  const response = await apiClient.post(`/luxury/items/${itemId}/favorite`);
  return response.data;
};

// Get my favorites
export const getMyLuxuryFavorites = async (): Promise<{ success: boolean; data: LuxuryItem[] }> => {
  const response = await apiClient.get('/luxury/favorites');
  return response.data;
};

// Get my listings (seller)
export const getMyLuxuryListings = async (): Promise<{ success: boolean; data: LuxuryItem[] }> => {
  const response = await apiClient.get('/luxury/items/my');
  return response.data;
};

// ============================================
// Utility Functions
// ============================================

export const formatLuxuryPrice = (price: number, currency: string = 'EGP'): string => {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون ${currency === 'EGP' ? 'ج.م' : currency}`;
  } else if (price >= 1000) {
    return `${(price / 1000).toFixed(0)} ألف ${currency === 'EGP' ? 'ج.م' : currency}`;
  }
  return `${price.toLocaleString('ar-EG')} ${currency === 'EGP' ? 'ج.م' : currency}`;
};

export const getConditionColor = (grade?: string): string => {
  switch (grade) {
    case 'A+':
      return 'bg-emerald-500 text-white';
    case 'A':
      return 'bg-green-500 text-white';
    case 'B+':
      return 'bg-blue-500 text-white';
    case 'B':
      return 'bg-indigo-500 text-white';
    case 'C':
      return 'bg-amber-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export const getStatusColor = (status: LuxuryItemStatus): string => {
  switch (status) {
    case 'LISTED':
      return 'bg-green-100 text-green-800';
    case 'VERIFIED_AUTHENTIC':
      return 'bg-emerald-100 text-emerald-800';
    case 'PENDING_VERIFICATION':
      return 'bg-yellow-100 text-yellow-800';
    case 'UNDER_REVIEW':
      return 'bg-blue-100 text-blue-800';
    case 'SOLD':
      return 'bg-gray-100 text-gray-800';
    case 'REJECTED_FAKE':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-600';
  }
};

// Popular luxury brands by category
export const LUXURY_BRANDS: Record<LuxuryCategoryType, string[]> = {
  WATCHES: [
    'Rolex',
    'Omega',
    'Patek Philippe',
    'Audemars Piguet',
    'Richard Mille',
    'Cartier',
    'TAG Heuer',
    'IWC',
    'Breitling',
    'Panerai',
    'Hublot',
    'Vacheron Constantin',
  ],
  JEWELRY: [
    'Cartier',
    'Van Cleef & Arpels',
    'Bulgari',
    'Tiffany & Co',
    'Harry Winston',
    'Chopard',
    'Graff',
    'Boucheron',
    'Piaget',
  ],
  HANDBAGS: [
    'Hermès',
    'Chanel',
    'Louis Vuitton',
    'Dior',
    'Gucci',
    'Prada',
    'Fendi',
    'Celine',
    'Bottega Veneta',
    'Balenciaga',
  ],
  CARS: ['Rolls-Royce', 'Bentley', 'Ferrari', 'Lamborghini', 'Porsche', 'Mercedes-Benz', 'BMW', 'Audi'],
  ART: [],
  ANTIQUES: [],
  REAL_ESTATE: [],
  PERFUMES: ['Creed', 'Tom Ford', 'Byredo', 'Le Labo', 'Maison Francis Kurkdjian', 'Amouage'],
  PENS: ['Montblanc', 'Parker', 'Cartier', 'S.T. Dupont', 'Aurora'],
  SUNGLASSES: ['Ray-Ban', 'Oakley', 'Gucci', 'Prada', 'Tom Ford', 'Dior'],
  OTHER: [],
};

// Category icons
export const LUXURY_CATEGORY_ICONS: Record<LuxuryCategoryType, string> = {
  WATCHES: '⌚',
  JEWELRY: '💎',
  HANDBAGS: '👜',
  CARS: '🏎️',
  ART: '🖼️',
  ANTIQUES: '🏺',
  REAL_ESTATE: '🏰',
  PERFUMES: '🌸',
  PENS: '🖊️',
  SUNGLASSES: '🕶️',
  OTHER: '👑',
};

// Price tiers for display
export const getPriceTier = (price: number): { label: string; labelAr: string; color: string } => {
  if (price >= 5000000) {
    return { label: 'Ultra Premium', labelAr: 'فائق الفخامة', color: 'from-purple-600 to-pink-600' };
  }
  if (price >= 1000000) {
    return { label: 'Platinum', labelAr: 'بلاتينيوم', color: 'from-gray-800 to-gray-600' };
  }
  if (price >= 500000) {
    return { label: 'Gold', labelAr: 'ذهبي', color: 'from-amber-500 to-yellow-400' };
  }
  if (price >= 100000) {
    return { label: 'Silver', labelAr: 'فضي', color: 'from-gray-400 to-gray-300' };
  }
  return { label: 'Premium', labelAr: 'مميز', color: 'from-emerald-500 to-teal-400' };
};
