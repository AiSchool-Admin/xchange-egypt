/**
 * Unified Listing System Types
 * أنواع نظام الإعلانات الموحد
 */

// فئات المنتجات
export type ListingCategory =
  | 'MOBILE'
  | 'CAR'
  | 'PROPERTY'
  | 'GOLD'
  | 'LUXURY'
  | 'SCRAP'
  | 'GENERAL';

// نوع المعاملة
export type TransactionType =
  | 'DIRECT_SALE'      // بيع مباشر
  | 'DIRECT_PURCHASE'  // شراء مباشر
  | 'AUCTION'          // مزاد (للبائع)
  | 'REVERSE_AUCTION'  // مناقصة (للمشتري)
  | 'BARTER';          // مقايضة

// معلومات الفئة
export interface CategoryInfo {
  id: ListingCategory;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  description: string;
}

// الفئات المتاحة
export const LISTING_CATEGORIES: CategoryInfo[] = [
  {
    id: 'MOBILE',
    nameAr: 'موبايل',
    nameEn: 'Mobile',
    icon: '📱',
    color: 'from-blue-500 to-indigo-600',
    description: 'هواتف ذكية وأجهزة محمولة'
  },
  {
    id: 'CAR',
    nameAr: 'سيارة',
    nameEn: 'Car',
    icon: '🚗',
    color: 'from-red-500 to-orange-600',
    description: 'سيارات ومركبات'
  },
  {
    id: 'PROPERTY',
    nameAr: 'عقار',
    nameEn: 'Property',
    icon: '🏠',
    color: 'from-green-500 to-emerald-600',
    description: 'شقق وفيلات وأراضي'
  },
  {
    id: 'GOLD',
    nameAr: 'ذهب',
    nameEn: 'Gold',
    icon: '💰',
    color: 'from-yellow-500 to-amber-600',
    description: 'مجوهرات وسبائك ذهبية'
  },
  {
    id: 'LUXURY',
    nameAr: 'منتج فاخر',
    nameEn: 'Luxury',
    icon: '💎',
    color: 'from-purple-500 to-pink-600',
    description: 'ساعات ومجوهرات وحقائب فاخرة'
  },
  {
    id: 'SCRAP',
    nameAr: 'خردة',
    nameEn: 'Scrap',
    icon: '♻️',
    color: 'from-gray-500 to-slate-600',
    description: 'معادن ومواد قابلة لإعادة التدوير'
  },
  {
    id: 'GENERAL',
    nameAr: 'منتج آخر',
    nameEn: 'General',
    icon: '📦',
    color: 'from-teal-500 to-cyan-600',
    description: 'إلكترونيات وأثاث ومنتجات متنوعة'
  }
];

// أنواع المعاملات
export interface TransactionTypeInfo {
  id: TransactionType;
  nameAr: string;
  nameEn: string;
  icon: string;
  description: string;
  isSelling: boolean; // true = بيع، false = شراء
}

export const TRANSACTION_TYPES: TransactionTypeInfo[] = [
  {
    id: 'DIRECT_SALE',
    nameAr: 'بيع فوري',
    nameEn: 'Direct Sale',
    icon: '💵',
    description: 'بيع المنتج مباشرة بسعر محدد',
    isSelling: true
  },
  {
    id: 'DIRECT_PURCHASE',
    nameAr: 'شراء فوري',
    nameEn: 'Direct Purchase',
    icon: '🛒',
    description: 'طلب شراء منتج بسعر محدد',
    isSelling: false
  },
  {
    id: 'AUCTION',
    nameAr: 'مزاد',
    nameEn: 'Auction',
    icon: '🔨',
    description: 'بيع عن طريق المزايدة',
    isSelling: true
  },
  {
    id: 'REVERSE_AUCTION',
    nameAr: 'مناقصة',
    nameEn: 'Reverse Auction',
    icon: '📉',
    description: 'طلب عروض أسعار من البائعين',
    isSelling: false
  },
  {
    id: 'BARTER',
    nameAr: 'مقايضة',
    nameEn: 'Barter',
    icon: '🔄',
    description: 'تبادل المنتجات',
    isSelling: true
  }
];

// الحقول المشتركة
export interface CommonFields {
  title: string;
  description: string;
  governorate: string;
  city?: string;
  district?: string;  // الحي / المنطقة
  street?: string;    // الشارع / العنوان التفصيلي
  images: string[];
}

// حقول الموبايل
export interface MobileFields extends CommonFields {
  brand: string;
  model: string;
  storageCapacity: number;
  ramSize: number;
  batteryHealth: number;
  condition: 'A' | 'B' | 'C' | 'D';
  color?: string;
  imei?: string;
  accessories?: string[];
  acceptsBarter?: boolean;
  barterPreferences?: string[];
}

// حقول السيارة
export interface CarFields extends CommonFields {
  make: string;
  model: string;
  year: number;
  mileage: number;
  transmission: 'AUTOMATIC' | 'MANUAL' | 'CVT' | 'DCT';
  fuelType: 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'LPG' | 'NATURAL_GAS';
  bodyType: string;
  condition: string;
  exteriorColor?: string;
  interiorColor?: string;
  features?: string[];
  acceptsBarter?: boolean;
}

// حقول العقار
export interface PropertyFields extends CommonFields {
  propertyType: string;
  listingType: 'SALE' | 'RENT' | 'BOTH';
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  finishingLevel?: string;
  furnishingStatus?: string;
  amenities?: string[];
  acceptsBarter?: boolean;
}

// حقول الذهب
export interface GoldFields extends CommonFields {
  karat: 'K18' | 'K21' | 'K24';
  category: string;
  weightGrams: number;
  condition: string;
}

// حقول المنتجات الفاخرة
export interface LuxuryFields extends CommonFields {
  luxuryCategory: string;
  brand?: string;
  model?: string;
  condition: string;
  hasAuthenticityCertificate?: boolean;
  serialNumber?: string;
}

// حقول الخردة
export interface ScrapFields extends CommonFields {
  materialType: string;
  weightKg: number;
  purity?: string;
}

// حقول عامة
export interface GeneralFields extends CommonFields {
  category: string;
  subCategory?: string;
  condition: string;
}

// بيانات السعر
export interface PricingData {
  price?: number;
  minPrice?: number;
  maxPrice?: number;
  negotiable?: boolean;
  currency?: string;
}

// بيانات المزاد
export interface AuctionData {
  startingPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  startTime: string;
  endTime: string;
}

// بيانات المقايضة
export interface BarterData {
  acceptsBarter: boolean;
  preferences?: string[];
  acceptsCashDifference?: boolean;
  maxCashDifference?: number;
}

// الإعلان الموحد
export interface UnifiedListing {
  category: ListingCategory;
  transactionType: TransactionType;

  // البيانات حسب الفئة
  data: MobileFields | CarFields | PropertyFields | GoldFields | LuxuryFields | ScrapFields | GeneralFields;

  // بيانات السعر
  pricing: PricingData;

  // بيانات المزاد (إن وجد)
  auction?: AuctionData;

  // بيانات المقايضة (إن وجد)
  barter?: BarterData;
}

// خيارات الـ Wizard
export interface WizardOptions {
  // الفئة محددة مسبقاً (للأسواق المتخصصة)
  preselectedCategory?: ListingCategory;

  // نوع المعاملة محدد مسبقاً (لأسواق المزاد/المناقصة/المقايضة)
  preselectedTransactionType?: TransactionType;

  // عنوان مخصص
  customTitle?: string;

  // رابط العودة
  backUrl?: string;
}

// حالة الخطوة
export type StepStatus = 'pending' | 'current' | 'completed';

// معلومات الخطوة
export interface StepInfo {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  status: StepStatus;
  isSkipped?: boolean;
}
