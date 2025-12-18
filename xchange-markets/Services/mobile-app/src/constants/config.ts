// ============================================
// App Configuration Constants
// ============================================

// API Configuration
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.xchange.eg/api/v1';
export const SOCKET_URL = process.env.EXPO_PUBLIC_SOCKET_URL || 'https://api.xchange.eg';

// App Configuration
export const APP_CONFIG = {
  name: 'Xchange Services',
  nameAr: 'خدمات إكسشينج',
  version: '1.0.0',
  buildNumber: 1,

  // Support
  supportEmail: 'support@xchange.eg',
  supportPhone: '+201000000000',
  supportWhatsApp: '+201000000000',

  // Social Media
  facebookUrl: 'https://facebook.com/xchangeeg',
  instagramUrl: 'https://instagram.com/xchangeeg',
  twitterUrl: 'https://twitter.com/xchangeeg',
  linkedInUrl: 'https://linkedin.com/company/xchangeeg',

  // Website
  websiteUrl: 'https://xchange.eg',
  termsUrl: 'https://xchange.eg/terms',
  privacyUrl: 'https://xchange.eg/privacy',

  // App Store Links
  appStoreUrl: 'https://apps.apple.com/app/xchange-services/id123456789',
  playStoreUrl: 'https://play.google.com/store/apps/details?id=eg.xchange.services',
};

// Map Configuration
export const MAP_CONFIG = {
  defaultRegion: {
    latitude: 30.0444, // Cairo
    longitude: 31.2357,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  },
  defaultZoom: 14,
};

// Upload Configuration
export const UPLOAD_CONFIG = {
  maxImageSize: 10 * 1024 * 1024, // 10MB
  maxVideoSize: 50 * 1024 * 1024, // 50MB
  maxImagesPerUpload: 10,
  allowedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],
  allowedVideoTypes: ['video/mp4', 'video/quicktime'],
  imageQuality: 0.8,
  thumbnailSize: { width: 300, height: 300 },
};

// Pagination
export const PAGINATION_CONFIG = {
  defaultPageSize: 20,
  searchPageSize: 20,
  reviewsPageSize: 10,
  chatMessagesPageSize: 50,
};

// Cache Configuration
export const CACHE_CONFIG = {
  categoriesTTL: 24 * 60 * 60 * 1000, // 24 hours
  serviceTTL: 5 * 60 * 1000, // 5 minutes
  providerTTL: 5 * 60 * 1000, // 5 minutes
  searchTTL: 1 * 60 * 1000, // 1 minute
};

// Egyptian Governorates
export const GOVERNORATES = [
  { id: 'cairo', nameAr: 'القاهرة', nameEn: 'Cairo' },
  { id: 'giza', nameAr: 'الجيزة', nameEn: 'Giza' },
  { id: 'alexandria', nameAr: 'الإسكندرية', nameEn: 'Alexandria' },
  { id: 'qalyubia', nameAr: 'القليوبية', nameEn: 'Qalyubia' },
  { id: 'sharqia', nameAr: 'الشرقية', nameEn: 'Sharqia' },
  { id: 'dakahlia', nameAr: 'الدقهلية', nameEn: 'Dakahlia' },
  { id: 'gharbia', nameAr: 'الغربية', nameEn: 'Gharbia' },
  { id: 'menoufia', nameAr: 'المنوفية', nameEn: 'Menoufia' },
  { id: 'beheira', nameAr: 'البحيرة', nameEn: 'Beheira' },
  { id: 'kafr_el_sheikh', nameAr: 'كفر الشيخ', nameEn: 'Kafr El Sheikh' },
  { id: 'damietta', nameAr: 'دمياط', nameEn: 'Damietta' },
  { id: 'port_said', nameAr: 'بورسعيد', nameEn: 'Port Said' },
  { id: 'ismailia', nameAr: 'الإسماعيلية', nameEn: 'Ismailia' },
  { id: 'suez', nameAr: 'السويس', nameEn: 'Suez' },
  { id: 'north_sinai', nameAr: 'شمال سيناء', nameEn: 'North Sinai' },
  { id: 'south_sinai', nameAr: 'جنوب سيناء', nameEn: 'South Sinai' },
  { id: 'red_sea', nameAr: 'البحر الأحمر', nameEn: 'Red Sea' },
  { id: 'matrouh', nameAr: 'مطروح', nameEn: 'Matrouh' },
  { id: 'fayoum', nameAr: 'الفيوم', nameEn: 'Fayoum' },
  { id: 'beni_suef', nameAr: 'بني سويف', nameEn: 'Beni Suef' },
  { id: 'minya', nameAr: 'المنيا', nameEn: 'Minya' },
  { id: 'assiut', nameAr: 'أسيوط', nameEn: 'Assiut' },
  { id: 'sohag', nameAr: 'سوهاج', nameEn: 'Sohag' },
  { id: 'qena', nameAr: 'قنا', nameEn: 'Qena' },
  { id: 'luxor', nameAr: 'الأقصر', nameEn: 'Luxor' },
  { id: 'aswan', nameAr: 'أسوان', nameEn: 'Aswan' },
  { id: 'new_valley', nameAr: 'الوادي الجديد', nameEn: 'New Valley' },
];

// Service Categories Configuration
export const SERVICE_CATEGORIES = {
  CARS: {
    id: 'cars',
    nameAr: 'خدمات السيارات',
    nameEn: 'Automotive Services',
    icon: 'car',
    linkedMarketplace: 'CARS',
  },
  PROPERTIES: {
    id: 'properties',
    nameAr: 'خدمات العقارات',
    nameEn: 'Real Estate Services',
    icon: 'home',
    linkedMarketplace: 'PROPERTIES',
  },
  MOBILES: {
    id: 'mobiles',
    nameAr: 'خدمات الموبايلات',
    nameEn: 'Mobile Services',
    icon: 'phone-portrait',
    linkedMarketplace: 'MOBILES',
  },
  GOLD: {
    id: 'gold',
    nameAr: 'خدمات الذهب',
    nameEn: 'Gold Services',
    icon: 'diamond',
    linkedMarketplace: 'GOLD',
  },
  SILVER: {
    id: 'silver',
    nameAr: 'خدمات الفضة',
    nameEn: 'Silver Services',
    icon: 'diamond-outline',
    linkedMarketplace: 'SILVER',
  },
  LUXURY: {
    id: 'luxury',
    nameAr: 'خدمات الرفاهية',
    nameEn: 'Luxury Services',
    icon: 'sparkles',
    linkedMarketplace: 'LUXURY',
  },
  SCRAP: {
    id: 'scrap',
    nameAr: 'خدمات التوالف',
    nameEn: 'Scrap Services',
    icon: 'trash',
    linkedMarketplace: 'SCRAP',
  },
  AUCTIONS: {
    id: 'auctions',
    nameAr: 'خدمات المزادات',
    nameEn: 'Auction Services',
    icon: 'hammer',
    linkedMarketplace: 'AUCTIONS',
  },
  TENDERS: {
    id: 'tenders',
    nameAr: 'خدمات المناقصات',
    nameEn: 'Tender Services',
    icon: 'document-text',
    linkedMarketplace: 'TENDERS',
  },
  BARTER: {
    id: 'barter',
    nameAr: 'خدمات المقايضة',
    nameEn: 'Barter Services',
    icon: 'swap-horizontal',
    linkedMarketplace: 'BARTER',
  },
  GENERAL: {
    id: 'general',
    nameAr: 'خدمات عامة',
    nameEn: 'General Services',
    icon: 'grid',
    linkedMarketplace: 'GENERAL',
  },
};

// Payment Methods
export const PAYMENT_METHODS = [
  {
    id: 'card',
    nameAr: 'بطاقة ائتمان/مدى',
    nameEn: 'Credit/Debit Card',
    icon: 'card',
    enabled: true,
  },
  {
    id: 'wallet',
    nameAr: 'محفظة إكسشينج',
    nameEn: 'Xchange Wallet',
    icon: 'wallet',
    enabled: true,
  },
  {
    id: 'credits',
    nameAr: 'كريديت التجارة',
    nameEn: 'Trade Credits',
    icon: 'diamond',
    enabled: true,
  },
  {
    id: 'cash',
    nameAr: 'دفع عند الاستلام',
    nameEn: 'Cash on Delivery',
    icon: 'cash',
    enabled: true,
  },
  {
    id: 'fawry',
    nameAr: 'فوري',
    nameEn: 'Fawry',
    icon: 'qr-code',
    enabled: true,
  },
];

// Express Service Configuration
export const EXPRESS_CONFIG = {
  responseTimeMinutes: 60,
  extraChargePercentage: 50,
  weekendExtraChargePercentage: 40,
  minimumProviderRating: 4.5,
  minimumCompletedBookings: 20,
};

// Auto-release Configuration
export const ESCROW_CONFIG = {
  defaultAutoReleaseHours: 48,
  expressAutoReleaseHours: 24,
  largeProjectAutoReleaseHours: 72,
};

// Review Configuration
export const REVIEW_CONFIG = {
  maxTextLength: 500,
  maxImages: 5,
  maxVideos: 1,
  minRating: 1,
  maxRating: 5,
};

// Notification Types
export const NOTIFICATION_TYPES = {
  BOOKING_REQUEST: 'booking_request',
  BOOKING_CONFIRMED: 'booking_confirmed',
  BOOKING_CANCELLED: 'booking_cancelled',
  PROVIDER_ON_WAY: 'provider_on_way',
  SERVICE_STARTED: 'service_started',
  SERVICE_COMPLETED: 'service_completed',
  PAYMENT_RECEIVED: 'payment_received',
  PAYMENT_RELEASED: 'payment_released',
  REVIEW_RECEIVED: 'review_received',
  DISPUTE_OPENED: 'dispute_opened',
  DISPUTE_RESOLVED: 'dispute_resolved',
  CHAT_MESSAGE: 'chat_message',
  EXPRESS_REQUEST: 'express_request',
  PREDICTIVE_MAINTENANCE: 'predictive_maintenance',
  PROMOTION: 'promotion',
};
