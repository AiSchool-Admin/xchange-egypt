/**
 * Mobile Marketplace API
 * سوق الموبايلات - XChange Egypt
 */

// ==========================================
// ENUMS & Types
// ==========================================

export type MobileBrand =
  | 'APPLE' | 'SAMSUNG' | 'XIAOMI' | 'OPPO' | 'VIVO' | 'REALME'
  | 'HUAWEI' | 'HONOR' | 'ONEPLUS' | 'GOOGLE' | 'MOTOROLA' | 'NOKIA'
  | 'INFINIX' | 'TECNO' | 'ITEL' | 'NOTHING' | 'ASUS' | 'SONY' | 'LG' | 'OTHER';

export type MobileConditionGrade = 'A' | 'B' | 'C' | 'D';

export type MobileScreenCondition = 'PERFECT' | 'MINOR_SCRATCHES' | 'CRACKED' | 'REPLACED';

export type MobileBodyCondition = 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

export type MobileIMEIStatus = 'CLEAN' | 'BLACKLISTED' | 'FINANCED' | 'LOCKED' | 'UNKNOWN';

export type MobileListingStatus =
  | 'DRAFT' | 'PENDING_REVIEW' | 'ACTIVE' | 'SOLD' | 'RESERVED' | 'EXPIRED' | 'REJECTED' | 'SUSPENDED';

export type MobileTransactionType = 'SALE' | 'BARTER' | 'BARTER_WITH_CASH';

export type MobileTransactionStatus =
  | 'INITIATED' | 'PAYMENT_PENDING' | 'PAYMENT_HELD' | 'SHIPPING'
  | 'DELIVERED' | 'INSPECTION' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | 'REFUNDED';

export type MobilePaymentMethod = 'ESCROW' | 'COD' | 'FAWRY' | 'INSTAPAY' | 'WALLET' | 'BNPL';

export type MobileDeliveryMethod = 'MEETUP' | 'BOSTA' | 'ARAMEX' | 'EGYPT_POST' | 'PARTNER_SHOP';

export type MobileBarterMatchType = 'DIRECT' | 'THREE_WAY' | 'CHAIN';

export type MobileBarterMatchStatus =
  | 'PROPOSED' | 'PARTIALLY_ACCEPTED' | 'ALL_ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';

export type MobileBarterProposalStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COUNTERED' | 'EXPIRED' | 'WITHDRAWN';

export type MobileDisputeReason =
  | 'NOT_AS_DESCRIBED' | 'FAKE_DEVICE' | 'NOT_RECEIVED' | 'DAMAGED_IN_SHIPPING'
  | 'SELLER_UNRESPONSIVE' | 'BATTERY_DIFFERENT' | 'NON_ORIGINAL_PARTS' | 'OTHER';

export type MobileDisputeStatus = 'OPEN' | 'UNDER_REVIEW' | 'MEDIATION' | 'RESOLVED' | 'ESCALATED';

// ==========================================
// Arabic Translations
// ==========================================

export const MOBILE_BRAND_AR: Record<MobileBrand, string> = {
  'APPLE': 'آبل',
  'SAMSUNG': 'سامسونج',
  'XIAOMI': 'شاومي',
  'OPPO': 'أوبو',
  'VIVO': 'فيفو',
  'REALME': 'ريلمي',
  'HUAWEI': 'هواوي',
  'HONOR': 'أونر',
  'ONEPLUS': 'ون بلس',
  'GOOGLE': 'جوجل',
  'MOTOROLA': 'موتورولا',
  'NOKIA': 'نوكيا',
  'INFINIX': 'إنفينكس',
  'TECNO': 'تكنو',
  'ITEL': 'آيتل',
  'NOTHING': 'ناثينج',
  'ASUS': 'أسوس',
  'SONY': 'سوني',
  'LG': 'إل جي',
  'OTHER': 'أخرى',
};

export const CONDITION_GRADE_AR: Record<MobileConditionGrade, { label: string; desc: string }> = {
  'A': { label: 'ممتاز', desc: 'حالة ممتازة - كالجديد تماماً' },
  'B': { label: 'جيد جداً', desc: 'خدوش بسيطة غير ملحوظة' },
  'C': { label: 'جيد', desc: 'علامات استخدام واضحة' },
  'D': { label: 'مقبول', desc: 'يعمل جيداً مع عيوب ظاهرة' },
};

export const SCREEN_CONDITION_AR: Record<MobileScreenCondition, string> = {
  'PERFECT': 'ممتازة - بدون خدوش',
  'MINOR_SCRATCHES': 'خدوش بسيطة',
  'CRACKED': 'مكسورة',
  'REPLACED': 'تم تغييرها',
};

export const BODY_CONDITION_AR: Record<MobileBodyCondition, string> = {
  'LIKE_NEW': 'كالجديد',
  'GOOD': 'جيدة',
  'FAIR': 'مقبولة',
  'POOR': 'ضعيفة',
};

export const IMEI_STATUS_AR: Record<MobileIMEIStatus, { label: string; color: string }> = {
  'CLEAN': { label: 'نظيف', color: 'text-green-600' },
  'BLACKLISTED': { label: 'محظور', color: 'text-red-600' },
  'FINANCED': { label: 'مموّل', color: 'text-orange-600' },
  'LOCKED': { label: 'مقفل', color: 'text-yellow-600' },
  'UNKNOWN': { label: 'غير معروف', color: 'text-gray-500' },
};

export const LISTING_STATUS_AR: Record<MobileListingStatus, { label: string; color: string }> = {
  'DRAFT': { label: 'مسودة', color: 'text-gray-500' },
  'PENDING_REVIEW': { label: 'قيد المراجعة', color: 'text-yellow-600' },
  'ACTIVE': { label: 'نشط', color: 'text-green-600' },
  'SOLD': { label: 'تم البيع', color: 'text-blue-600' },
  'RESERVED': { label: 'محجوز', color: 'text-purple-600' },
  'EXPIRED': { label: 'منتهي', color: 'text-gray-500' },
  'REJECTED': { label: 'مرفوض', color: 'text-red-600' },
  'SUSPENDED': { label: 'موقوف', color: 'text-red-600' },
};

export const TRANSACTION_STATUS_AR: Record<MobileTransactionStatus, string> = {
  'INITIATED': 'بدأت',
  'PAYMENT_PENDING': 'في انتظار الدفع',
  'PAYMENT_HELD': 'المبلغ محجوز',
  'SHIPPING': 'جاري الشحن',
  'DELIVERED': 'تم التسليم',
  'INSPECTION': 'فترة الفحص',
  'COMPLETED': 'مكتملة',
  'DISPUTED': 'متنازع عليها',
  'CANCELLED': 'ملغاة',
  'REFUNDED': 'تم الاسترداد',
};

export const PAYMENT_METHOD_AR: Record<MobilePaymentMethod, string> = {
  'ESCROW': 'ضمان المنصة',
  'COD': 'الدفع عند الاستلام',
  'FAWRY': 'فوري',
  'INSTAPAY': 'انستاباي',
  'WALLET': 'محفظة إلكترونية',
  'BNPL': 'تقسيط',
};

export const DELIVERY_METHOD_AR: Record<MobileDeliveryMethod, string> = {
  'MEETUP': 'مقابلة شخصية',
  'BOSTA': 'بوسطة',
  'ARAMEX': 'أرامكس',
  'EGYPT_POST': 'البريد المصري',
  'PARTNER_SHOP': 'متجر شريك',
};

export const BARTER_MATCH_TYPE_AR: Record<MobileBarterMatchType, string> = {
  'DIRECT': 'مباشر (طرفين)',
  'THREE_WAY': 'ثلاثي الأطراف',
  'CHAIN': 'سلسلة مقايضة',
};

export const DISPUTE_REASON_AR: Record<MobileDisputeReason, string> = {
  'NOT_AS_DESCRIBED': 'المنتج مختلف عن الوصف',
  'FAKE_DEVICE': 'جهاز مزيف',
  'NOT_RECEIVED': 'لم يصل المنتج',
  'DAMAGED_IN_SHIPPING': 'تضرر أثناء الشحن',
  'SELLER_UNRESPONSIVE': 'البائع لا يرد',
  'BATTERY_DIFFERENT': 'صحة البطارية مختلفة',
  'NON_ORIGINAL_PARTS': 'قطع غير أصلية',
  'OTHER': 'أخرى',
};

// ==========================================
// Interfaces
// ==========================================

export interface MobileListing {
  id: string;
  sellerId: string;
  title: string;
  titleAr?: string;
  description?: string;
  descriptionAr?: string;
  brand: MobileBrand;
  model: string;
  storageGb: number;
  ramGb?: number;
  color?: string;
  colorAr?: string;
  imei: string;
  imeiVerified: boolean;
  imeiStatus: MobileIMEIStatus;
  ntraRegistered: boolean;
  conditionGrade: MobileConditionGrade;
  batteryHealth?: number;
  screenCondition?: MobileScreenCondition;
  bodyCondition?: MobileBodyCondition;
  originalParts: boolean;
  hasBox: boolean;
  hasAccessories: boolean;
  accessoriesDetails?: string;
  priceEgp: number;
  originalPrice?: number;
  negotiable: boolean;
  acceptsBarter: boolean;
  barterPreferences?: {
    preferredBrands?: MobileBrand[];
    minValue?: number;
    maxCashDifference?: number;
  };
  images: string[];
  verificationImageUrl?: string;
  verificationCode?: string;
  videoUrl?: string;
  governorate: string;
  city?: string;
  district?: string;
  status: MobileListingStatus;
  featured: boolean;
  viewsCount: number;
  favoritesCount: number;
  inquiriesCount: number;
  warrantyMonths?: number;
  warrantyProvider?: string;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  soldAt?: Date;
  seller?: {
    id: string;
    name: string;
    avatar?: string;
    rating: number;
    reviewsCount: number;
    verified: boolean;
    trustLevel: 'new' | 'verified' | 'trusted' | 'pro';
  };
}

export interface MobileBarterProposal {
  id: string;
  proposerId: string;
  receiverId: string;
  offeredListingId: string;
  requestedListingId: string;
  cashDifference: number;
  cashDirection?: 'proposer_pays' | 'receiver_pays';
  proposerMessage?: string;
  receiverResponse?: string;
  counterCashOffer?: number;
  status: MobileBarterProposalStatus;
  createdAt: Date;
  expiresAt: Date;
  respondedAt?: Date;
  offeredListing?: MobileListing;
  requestedListing?: MobileListing;
}

export interface MobileTransaction {
  id: string;
  listingId: string;
  buyerId: string;
  sellerId: string;
  transactionType: MobileTransactionType;
  agreedPriceEgp?: number;
  platformFeeEgp?: number;
  sellerPayoutEgp?: number;
  barterListingId?: string;
  cashDifferenceEgp?: number;
  cashPaidBy?: string;
  paymentMethod?: MobilePaymentMethod;
  paymentStatus?: string;
  escrowHeldAt?: Date;
  escrowReleasedAt?: Date;
  escrowAmount?: number;
  deliveryMethod?: MobileDeliveryMethod;
  deliveryStatus?: string;
  trackingNumber?: string;
  deliveryFee?: number;
  inspectionStartsAt?: Date;
  inspectionEndsAt?: Date;
  buyerConfirmed: boolean;
  buyerNotes?: string;
  status: MobileTransactionStatus;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
  listing?: MobileListing;
}

export interface MobileDispute {
  id: string;
  transactionId: string;
  initiatedById: string;
  reason: MobileDisputeReason;
  descriptionAr?: string;
  descriptionEn?: string;
  evidenceUrls?: string[];
  status: MobileDisputeStatus;
  resolution?: string;
  resolutionNotes?: string;
  resolvedById?: string;
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  transaction?: MobileTransaction;
}

export interface MobileReview {
  id: string;
  transactionId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  accuracyRating?: number;
  communicationRating?: number;
  speedRating?: number;
  commentAr?: string;
  commentEn?: string;
  isVerifiedPurchase: boolean;
  sellerResponse?: string;
  sellerRespondedAt?: Date;
  createdAt: Date;
}

export interface MobilePriceAlert {
  id: string;
  userId: string;
  brand?: MobileBrand;
  model?: string;
  maxPriceEgp?: number;
  minConditionGrade?: MobileConditionGrade;
  governorate?: string;
  minStorageGb?: number;
  isActive: boolean;
  lastNotifiedAt?: Date;
  notificationCount: number;
  createdAt: Date;
}

// ==========================================
// Utility Functions
// ==========================================

export function formatMobilePrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(1)} مليون ج.م`;
  } else if (price >= 1000) {
    return `${(price / 1000).toLocaleString('ar-EG')} ألف ج.م`;
  }
  return `${price.toLocaleString('ar-EG')} ج.م`;
}

export function getConditionGradeColor(grade: MobileConditionGrade): string {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800';
    case 'B': return 'bg-blue-100 text-blue-800';
    case 'C': return 'bg-yellow-100 text-yellow-800';
    case 'D': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
}

export function getBatteryHealthColor(health: number): string {
  if (health >= 90) return 'text-green-600';
  if (health >= 80) return 'text-blue-600';
  if (health >= 70) return 'text-yellow-600';
  return 'text-red-600';
}

export function getBrandLogo(brand: MobileBrand): string {
  const logos: Partial<Record<MobileBrand, string>> = {
    'APPLE': '/images/brands/apple.svg',
    'SAMSUNG': '/images/brands/samsung.svg',
    'XIAOMI': '/images/brands/xiaomi.svg',
    'HUAWEI': '/images/brands/huawei.svg',
    'OPPO': '/images/brands/oppo.svg',
  };
  return logos[brand] || '/images/brands/default.svg';
}

// Popular models by brand
export const POPULAR_MODELS: Partial<Record<MobileBrand, string[]>> = {
  'APPLE': ['iPhone 15 Pro Max', 'iPhone 15 Pro', 'iPhone 15', 'iPhone 14 Pro Max', 'iPhone 14', 'iPhone 13', 'iPhone 12', 'iPhone 11'],
  'SAMSUNG': ['Galaxy S24 Ultra', 'Galaxy S24+', 'Galaxy S24', 'Galaxy S23 Ultra', 'Galaxy Z Fold 5', 'Galaxy Z Flip 5', 'Galaxy A54', 'Galaxy A34'],
  'XIAOMI': ['14 Ultra', '14 Pro', '14', 'Redmi Note 13 Pro+', 'Redmi Note 13', 'POCO X6 Pro', 'POCO F5'],
  'OPPO': ['Find X7 Ultra', 'Find X7', 'Reno 11 Pro', 'Reno 11', 'A98', 'A78'],
  'REALME': ['GT 5 Pro', 'GT 5', '12 Pro+', '12 Pro', 'C67', 'C55'],
  'HUAWEI': ['Mate 60 Pro', 'Mate 60', 'P60 Pro', 'P60', 'Nova 12', 'Nova 11'],
  'ONEPLUS': ['12', '12R', 'Open', 'Nord 3', 'Nord CE 3'],
  'GOOGLE': ['Pixel 8 Pro', 'Pixel 8', 'Pixel 7a', 'Pixel 7'],
  'INFINIX': ['Zero 30', 'Note 30 Pro', 'Note 30', 'Hot 40 Pro', 'Hot 40'],
  'TECNO': ['Phantom V Fold', 'Camon 20 Pro', 'Camon 20', 'Spark 20 Pro', 'Spark 20'],
};

// Storage options
export const STORAGE_OPTIONS = [32, 64, 128, 256, 512, 1024];

// Egyptian Governorates
export const EGYPTIAN_GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية',
  'القليوبية', 'البحيرة', 'الغربية', 'كفر الشيخ', 'دمياط', 'بورسعيد',
  'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء', 'الفيوم', 'بني سويف',
  'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان', 'البحر الأحمر',
  'الوادي الجديد', 'مطروح',
];

// ==========================================
// API Functions (Mock implementations)
// ==========================================

export async function getMobileListings(params?: {
  brand?: MobileBrand;
  model?: string;
  minPrice?: number;
  maxPrice?: number;
  conditionGrade?: MobileConditionGrade;
  governorate?: string;
  acceptsBarter?: boolean;
  imeiVerified?: boolean;
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  limit?: number;
  offset?: number;
}): Promise<{ listings: MobileListing[]; total: number }> {
  // Mock implementation - replace with actual API call
  console.log('Fetching mobile listings with params:', params);
  return { listings: [], total: 0 };
}

export async function getMobileListing(id: string): Promise<MobileListing | null> {
  console.log('Fetching mobile listing:', id);
  return null;
}

export async function createMobileListing(data: Partial<MobileListing>): Promise<MobileListing> {
  console.log('Creating mobile listing:', data);
  throw new Error('Not implemented');
}

export async function updateMobileListing(id: string, data: Partial<MobileListing>): Promise<MobileListing> {
  console.log('Updating mobile listing:', id, data);
  throw new Error('Not implemented');
}

export async function verifyIMEI(imei: string): Promise<{
  isValid: boolean;
  isBlacklisted: boolean;
  isStolen: boolean;
  isFinanced: boolean;
  carrierLock?: string;
  model?: string;
}> {
  console.log('Verifying IMEI:', imei);
  // Mock implementation
  return {
    isValid: true,
    isBlacklisted: false,
    isStolen: false,
    isFinanced: false,
  };
}

export async function createBarterProposal(data: {
  offeredListingId: string;
  requestedListingId: string;
  cashDifference?: number;
  message?: string;
}): Promise<MobileBarterProposal> {
  console.log('Creating barter proposal:', data);
  throw new Error('Not implemented');
}

export async function getBarterMatches(userId: string): Promise<{
  directMatches: MobileListing[];
  threeWayMatches: { listings: MobileListing[]; cashSettlements: Record<string, number> }[];
}> {
  console.log('Getting barter matches for user:', userId);
  return { directMatches: [], threeWayMatches: [] };
}

export async function createTransaction(data: {
  listingId: string;
  transactionType: MobileTransactionType;
  paymentMethod: MobilePaymentMethod;
  deliveryMethod: MobileDeliveryMethod;
  agreedPrice?: number;
  barterListingId?: string;
  cashDifference?: number;
}): Promise<MobileTransaction> {
  console.log('Creating transaction:', data);
  throw new Error('Not implemented');
}

export async function createDispute(data: {
  transactionId: string;
  reason: MobileDisputeReason;
  description: string;
  evidenceUrls?: string[];
}): Promise<MobileDispute> {
  console.log('Creating dispute:', data);
  throw new Error('Not implemented');
}

export async function createReview(data: {
  transactionId: string;
  rating: number;
  accuracyRating?: number;
  communicationRating?: number;
  speedRating?: number;
  comment?: string;
}): Promise<MobileReview> {
  console.log('Creating review:', data);
  throw new Error('Not implemented');
}

export async function createPriceAlert(data: Partial<MobilePriceAlert>): Promise<MobilePriceAlert> {
  console.log('Creating price alert:', data);
  throw new Error('Not implemented');
}
