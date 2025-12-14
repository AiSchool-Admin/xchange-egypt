/**
 * Xchange Vehicle Marketplace API
 * أكبر سوق سيارات في مصر مع خوارزميات ذكية للتسعير والمقايضة والتوصيات
 *
 * @module vehicle-marketplace
 * @version 2.0.0
 */

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export type VehicleMake =
  | 'TOYOTA' | 'HYUNDAI' | 'KIA' | 'NISSAN' | 'CHEVROLET' | 'MERCEDES'
  | 'BMW' | 'AUDI' | 'VOLKSWAGEN' | 'HONDA' | 'MAZDA' | 'MITSUBISHI'
  | 'SUZUKI' | 'PEUGEOT' | 'RENAULT' | 'FIAT' | 'JEEP' | 'FORD'
  | 'MG' | 'CHERY' | 'BYD' | 'GEELY' | 'HAVAL' | 'CHANGAN'
  | 'JAC' | 'JETOUR' | 'SKODA' | 'SEAT' | 'OPEL' | 'CITROEN'
  | 'LEXUS' | 'INFINITI' | 'PORSCHE' | 'LAND_ROVER' | 'VOLVO' | 'OTHER';

export type VehicleBodyType =
  | 'SEDAN' | 'HATCHBACK' | 'SUV' | 'CROSSOVER' | 'COUPE' | 'CONVERTIBLE'
  | 'PICKUP' | 'VAN' | 'MINIVAN' | 'WAGON' | 'TRUCK' | 'BUS' | 'MICROBUS';

export type FuelType = 'PETROL' | 'DIESEL' | 'HYBRID' | 'ELECTRIC' | 'CNG' | 'LPG';

export type TransmissionType = 'MANUAL' | 'AUTOMATIC' | 'CVT' | 'DCT' | 'SEMI_AUTO';

export type VehicleCondition =
  | 'NEW' | 'LIKE_NEW' | 'EXCELLENT' | 'VERY_GOOD' | 'GOOD' | 'FAIR' | 'NEEDS_WORK';

export type SellerType = 'OWNER' | 'DEALER' | 'SHOWROOM';

export type ListingStatus = 'DRAFT' | 'PENDING' | 'ACTIVE' | 'RESERVED' | 'SOLD' | 'EXPIRED' | 'REMOVED';

export type VerificationLevel = 'BASIC' | 'VERIFIED' | 'INSPECTED' | 'CERTIFIED' | 'PREMIUM';

export type InspectionGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type BarterType = 'CAR_FOR_CAR' | 'CAR_FOR_PROPERTY' | 'CAR_FOR_GOLD' | 'CAR_FOR_PHONE' | 'CAR_FOR_MIXED';

export type BarterStatus = 'PROPOSED' | 'NEGOTIATING' | 'ACCEPTED' | 'IN_ESCROW' | 'COMPLETED' | 'REJECTED' | 'CANCELLED';

export type TransactionStatus = 'INITIATED' | 'PAYMENT_PENDING' | 'IN_ESCROW' | 'INSPECTION' | 'TRANSFER' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED' | 'REFUNDED';

export type MarketDemand = 'VERY_HIGH' | 'HIGH' | 'MEDIUM' | 'LOW' | 'VERY_LOW';

export type Governorate =
  | 'CAIRO' | 'GIZA' | 'ALEXANDRIA' | 'DAKAHLIA' | 'RED_SEA' | 'BEHEIRA'
  | 'FAYOUM' | 'GHARBIA' | 'ISMAILIA' | 'MENOFIA' | 'MINYA' | 'QALYUBIA'
  | 'NEW_VALLEY' | 'SUEZ' | 'ASWAN' | 'ASSIUT' | 'BENI_SUEF' | 'PORT_SAID'
  | 'DAMIETTA' | 'SHARQIA' | 'SOUTH_SINAI' | 'KAFR_EL_SHEIKH' | 'MATROUH'
  | 'LUXOR' | 'QENA' | 'NORTH_SINAI' | 'SOHAG';

// =============================================================================
// ARABIC TRANSLATIONS
// =============================================================================

export const VEHICLE_MAKE_AR: Record<VehicleMake, string> = {
  TOYOTA: 'تويوتا',
  HYUNDAI: 'هيونداي',
  KIA: 'كيا',
  NISSAN: 'نيسان',
  CHEVROLET: 'شيفروليه',
  MERCEDES: 'مرسيدس',
  BMW: 'بي إم دبليو',
  AUDI: 'أودي',
  VOLKSWAGEN: 'فولكس فاجن',
  HONDA: 'هوندا',
  MAZDA: 'مازدا',
  MITSUBISHI: 'ميتسوبيشي',
  SUZUKI: 'سوزوكي',
  PEUGEOT: 'بيجو',
  RENAULT: 'رينو',
  FIAT: 'فيات',
  JEEP: 'جيب',
  FORD: 'فورد',
  MG: 'إم جي',
  CHERY: 'شيري',
  BYD: 'بي واي دي',
  GEELY: 'جيلي',
  HAVAL: 'هافال',
  CHANGAN: 'شانجان',
  JAC: 'جاك',
  JETOUR: 'جيتور',
  SKODA: 'سكودا',
  SEAT: 'سيات',
  OPEL: 'أوبل',
  CITROEN: 'سيتروين',
  LEXUS: 'لكزس',
  INFINITI: 'إنفينيتي',
  PORSCHE: 'بورش',
  LAND_ROVER: 'لاند روفر',
  VOLVO: 'فولفو',
  OTHER: 'أخرى',
};

export const BODY_TYPE_AR: Record<VehicleBodyType, { label: string; icon: string }> = {
  SEDAN: { label: 'سيدان', icon: '🚗' },
  HATCHBACK: { label: 'هاتشباك', icon: '🚙' },
  SUV: { label: 'SUV', icon: '🚙' },
  CROSSOVER: { label: 'كروس أوفر', icon: '🚙' },
  COUPE: { label: 'كوبيه', icon: '🚘' },
  CONVERTIBLE: { label: 'مكشوفة', icon: '🏎️' },
  PICKUP: { label: 'بيك أب', icon: '🛻' },
  VAN: { label: 'فان', icon: '🚐' },
  MINIVAN: { label: 'ميني فان', icon: '🚐' },
  WAGON: { label: 'ستيشن', icon: '🚗' },
  TRUCK: { label: 'شاحنة', icon: '🚚' },
  BUS: { label: 'أتوبيس', icon: '🚌' },
  MICROBUS: { label: 'ميكروباص', icon: '🚐' },
};

export const FUEL_TYPE_AR: Record<FuelType, string> = {
  PETROL: 'بنزين',
  DIESEL: 'ديزل',
  HYBRID: 'هايبرد',
  ELECTRIC: 'كهربائي',
  CNG: 'غاز طبيعي',
  LPG: 'غاز',
};

export const TRANSMISSION_AR: Record<TransmissionType, string> = {
  MANUAL: 'مانيوال',
  AUTOMATIC: 'أوتوماتيك',
  CVT: 'CVT',
  DCT: 'DCT',
  SEMI_AUTO: 'نصف أوتوماتيك',
};

export const CONDITION_AR: Record<VehicleCondition, { label: string; description: string }> = {
  NEW: { label: 'جديدة (زيرو)', description: 'سيارة جديدة لم تستخدم' },
  LIKE_NEW: { label: 'كالجديدة', description: 'استخدام خفيف جداً' },
  EXCELLENT: { label: 'ممتازة', description: 'حالة ممتازة بدون أي عيوب' },
  VERY_GOOD: { label: 'جيدة جداً', description: 'عيوب طفيفة جداً' },
  GOOD: { label: 'جيدة', description: 'بعض العيوب البسيطة' },
  FAIR: { label: 'مقبولة', description: 'تحتاج بعض الإصلاحات' },
  NEEDS_WORK: { label: 'تحتاج صيانة', description: 'تحتاج إصلاحات كبيرة' },
};

export const SELLER_TYPE_AR: Record<SellerType, { label: string; icon: string; color: string }> = {
  OWNER: { label: 'مالك', icon: '👤', color: 'bg-blue-100 text-blue-700' },
  DEALER: { label: 'تاجر', icon: '🏪', color: 'bg-purple-100 text-purple-700' },
  SHOWROOM: { label: 'معرض', icon: '🏢', color: 'bg-amber-100 text-amber-700' },
};

export const VERIFICATION_AR: Record<VerificationLevel, { label: string; icon: string; color: string }> = {
  BASIC: { label: 'أساسي', icon: '⚪', color: 'bg-gray-100 text-gray-600' },
  VERIFIED: { label: 'موثق', icon: '🔵', color: 'bg-blue-100 text-blue-700' },
  INSPECTED: { label: 'مفحوصة', icon: '✅', color: 'bg-green-100 text-green-700' },
  CERTIFIED: { label: 'معتمدة', icon: '🟢', color: 'bg-emerald-100 text-emerald-700' },
  PREMIUM: { label: 'بريميوم', icon: '⭐', color: 'bg-amber-100 text-amber-700' },
};

export const GOVERNORATE_AR: Record<Governorate, string> = {
  CAIRO: 'القاهرة',
  GIZA: 'الجيزة',
  ALEXANDRIA: 'الإسكندرية',
  DAKAHLIA: 'الدقهلية',
  RED_SEA: 'البحر الأحمر',
  BEHEIRA: 'البحيرة',
  FAYOUM: 'الفيوم',
  GHARBIA: 'الغربية',
  ISMAILIA: 'الإسماعيلية',
  MENOFIA: 'المنوفية',
  MINYA: 'المنيا',
  QALYUBIA: 'القليوبية',
  NEW_VALLEY: 'الوادي الجديد',
  SUEZ: 'السويس',
  ASWAN: 'أسوان',
  ASSIUT: 'أسيوط',
  BENI_SUEF: 'بني سويف',
  PORT_SAID: 'بورسعيد',
  DAMIETTA: 'دمياط',
  SHARQIA: 'الشرقية',
  SOUTH_SINAI: 'جنوب سيناء',
  KAFR_EL_SHEIKH: 'كفر الشيخ',
  MATROUH: 'مطروح',
  LUXOR: 'الأقصر',
  QENA: 'قنا',
  NORTH_SINAI: 'شمال سيناء',
  SOHAG: 'سوهاج',
};

export const INSPECTION_GRADE_AR: Record<InspectionGrade, { label: string; description: string; color: string }> = {
  A: { label: 'ممتاز', description: 'حالة ممتازة - 90% فأكثر', color: 'bg-green-500 text-white' },
  B: { label: 'جيد جداً', description: 'حالة جيدة جداً - 75-89%', color: 'bg-blue-500 text-white' },
  C: { label: 'جيد', description: 'حالة جيدة - 60-74%', color: 'bg-yellow-500 text-white' },
  D: { label: 'مقبول', description: 'حالة مقبولة - 40-59%', color: 'bg-orange-500 text-white' },
  F: { label: 'ضعيف', description: 'يحتاج إصلاحات - أقل من 40%', color: 'bg-red-500 text-white' },
};

// =============================================================================
// POPULAR MODELS BY MAKE
// =============================================================================

export const POPULAR_MODELS: Record<string, string[]> = {
  TOYOTA: ['Corolla', 'Camry', 'Yaris', 'Fortuner', 'Land Cruiser', 'Hilux', 'Rush', 'RAV4', 'C-HR', 'Prado'],
  HYUNDAI: ['Elantra', 'Tucson', 'Accent', 'Creta', 'Santa Fe', 'Sonata', 'i10', 'i20', 'Verna', 'Kona'],
  KIA: ['Cerato', 'Sportage', 'Rio', 'Sorento', 'Seltos', 'Picanto', 'K5', 'Soul', 'Carnival', 'Niro'],
  NISSAN: ['Sunny', 'Sentra', 'Juke', 'Qashqai', 'X-Trail', 'Kicks', 'Patrol', 'Navara', 'Maxima', 'Altima'],
  CHEVROLET: ['Optra', 'Cruze', 'Aveo', 'Captiva', 'Equinox', 'Tahoe', 'Suburban', 'Malibu', 'Spark', 'Trax'],
  MERCEDES: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'A-Class', 'CLA', 'GLA', 'G-Class', 'AMG GT'],
  BMW: ['3 Series', '5 Series', '7 Series', 'X1', 'X3', 'X5', 'X7', '1 Series', '4 Series', 'M3'],
  MG: ['MG5', 'MG6', 'ZS', 'HS', 'RX5', 'RX8', 'MG GT', 'Marvel R', 'EP', 'Cyberster'],
  CHERY: ['Tiggo 2', 'Tiggo 3', 'Tiggo 4', 'Tiggo 7', 'Tiggo 8', 'Arrizo 5', 'Arrizo 6', 'Arrizo 8'],
  BYD: ['F3', 'Song Plus', 'Tang', 'Han', 'Dolphin', 'Seal', 'Atto 3', 'Qin Plus'],
  GEELY: ['Emgrand', 'Coolray', 'Azkarra', 'Okavango', 'Monjaro', 'Atlas', 'Preface'],
};

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * معلومات البائع
 */
export interface Seller {
  id: string;
  fullName: string;
  fullNameAr?: string;
  avatar?: string;
  type: SellerType;
  showroomName?: string;
  showroomNameAr?: string;
  rating: number;
  totalReviews: number;
  totalSales: number;
  responseRate: number;
  responseTime: string;
  memberSince: string;
  verified: boolean;
  phone?: string;
  whatsapp?: string;
}

/**
 * صورة السيارة
 */
export interface VehicleImage {
  id: string;
  url: string;
  thumbnailUrl?: string;
  caption?: string;
  captionAr?: string;
  order: number;
  isPrimary: boolean;
}

/**
 * فيديو السيارة
 */
export interface VehicleVideo {
  id: string;
  url: string;
  thumbnailUrl?: string;
  duration: number;
  caption?: string;
}

/**
 * مميزات السيارة
 */
export interface VehicleFeatures {
  // السلامة
  airbags: number;
  abs: boolean;
  esp: boolean;
  tractionControl: boolean;
  hillAssist: boolean;
  blindSpotMonitor: boolean;
  laneDepartureWarning: boolean;
  parkingSensors: 'NONE' | 'REAR' | 'FRONT_REAR' | '360';
  reverseCamera: boolean;
  camera360: boolean;
  adaptiveCruise: boolean;

  // الراحة
  airConditioning: 'NONE' | 'MANUAL' | 'AUTO' | 'DUAL_ZONE' | 'TRI_ZONE';
  sunroof: 'NONE' | 'STANDARD' | 'PANORAMIC';
  leatherSeats: boolean;
  heatedSeats: boolean;
  cooledSeats: boolean;
  electricSeats: boolean;
  memorySeats: boolean;
  keylessEntry: boolean;
  pushStart: boolean;
  remoteStart: boolean;
  electricMirrors: boolean;
  foldingMirrors: boolean;

  // الترفيه
  touchscreen: boolean;
  screenSize?: number;
  appleCarPlay: boolean;
  androidAuto: boolean;
  bluetooth: boolean;
  usbPorts: number;
  speakers: number;
  premiumAudio?: string;
  wirelessCharging: boolean;

  // الأداء
  turbo: boolean;
  paddleShifters: boolean;
  sportMode: boolean;
  allWheelDrive: boolean;

  // أخرى
  ledLights: boolean;
  fogLights: boolean;
  automaticLights: boolean;
  rainSensor: boolean;
  electricTrunk: boolean;
  spareTire: 'NONE' | 'TEMPORARY' | 'FULL_SIZE';
}

/**
 * نتيجة الفحص
 */
export interface InspectionResult {
  id: string;
  date: string;
  centerId: string;
  centerName: string;
  centerNameAr: string;
  inspectorName: string;
  overallGrade: InspectionGrade;
  overallScore: number;

  // التفاصيل
  exteriorScore: number;
  interiorScore: number;
  mechanicalScore: number;
  electricalScore: number;

  // فحص خاص
  paintThickness: Record<string, number>;
  obdScanResults?: string;
  tireCondition: Record<string, number>;
  brakeCondition: number;
  suspensionCondition: number;

  // الملاحظات
  issues: Array<{
    category: string;
    description: string;
    descriptionAr: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    estimatedRepairCost?: number;
  }>;

  recommendation: string;
  recommendationAr: string;
  reportUrl?: string;
}

/**
 * إعلان سيارة
 */
export interface VehicleListing {
  id: string;

  // البيانات الأساسية
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;

  // المواصفات
  make: VehicleMake;
  model: string;
  year: number;
  trim?: string;
  bodyType: VehicleBodyType;
  fuelType: FuelType;
  transmission: TransmissionType;
  engineSize?: number; // cc
  enginePower?: number; // hp
  cylinders?: number;

  // الحالة
  condition: VehicleCondition;
  mileage: number;
  hasAccidents: boolean;
  accidentDetails?: string;
  previousOwners: number;
  serviceHistory: boolean;
  warranty: boolean;
  warrantyMonths?: number;

  // اللون
  exteriorColor: string;
  exteriorColorAr: string;
  interiorColor?: string;
  interiorColorAr?: string;

  // الوثائق
  plateType: 'PRIVATE' | 'COMMERCIAL' | 'DIPLOMATIC' | 'TAXI';
  licensedUntil?: string;
  vin?: string;

  // السعر
  askingPrice: number;
  marketPrice?: number;
  priceNegotiable: boolean;
  acceptsFinancing: boolean;

  // المقايضة
  allowBarter: boolean;
  barterTypes: BarterType[];
  barterPreferences?: string;

  // الموقع
  governorate: Governorate;
  city: string;
  area?: string;

  // الوسائط
  images: VehicleImage[];
  videos: VehicleVideo[];

  // المميزات
  features: Partial<VehicleFeatures>;

  // الفحص
  inspection?: InspectionResult;

  // البائع
  seller: Seller;
  sellerType: SellerType;

  // الحالة
  status: ListingStatus;
  verificationLevel: VerificationLevel;
  featured: boolean;
  boosted: boolean;
  boostExpiresAt?: string;

  // الإحصائيات
  views: number;
  favorites: number;
  inquiries: number;

  // التواريخ
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
}

// =============================================================================
// DYNAMIC PRICING ALGORITHM TYPES
// =============================================================================

/**
 * مدخلات خوارزمية التسعير
 */
export interface PricingInput {
  make: VehicleMake;
  model: string;
  year: number;
  mileage: number;
  condition: VehicleCondition;
  fuelType: FuelType;
  transmission: TransmissionType;
  bodyType: VehicleBodyType;
  governorate: Governorate;

  // اختياري
  trim?: string;
  exteriorColor?: string;
  hasAccidents?: boolean;
  accidentSeverity?: 'MINOR' | 'MODERATE' | 'MAJOR';
  previousOwners?: number;
  serviceHistory?: boolean;
  features?: Partial<VehicleFeatures>;
  inspectionGrade?: InspectionGrade;
}

/**
 * بيانات السوق للتسعير
 */
export interface MarketData {
  comparables: Array<{
    listingId: string;
    price: number;
    make: string;
    model: string;
    year: number;
    mileage: number;
    condition: string;
    governorate: string;
    daysListed: number;
    sold: boolean;
    soldPrice?: number;
  }>;

  averagePrice: number;
  medianPrice: number;
  priceStdDev: number;

  supplyDemandRatio: number;
  averageDaysOnMarket: number;
  recentSalesCount: number;
}

/**
 * نتيجة التسعير الديناميكي
 */
export interface PriceEstimate {
  // السعر الأساسي
  estimatedValue: number;

  // نطاق السعر
  priceRange: {
    min: number;
    max: number;
  };

  // الثقة
  confidence: number; // 0-100

  // حالة السوق
  marketDemand: MarketDemand;
  supplyLevel: 'LOW' | 'MEDIUM' | 'HIGH';

  // التوصيات
  recommendedAskingPrice: number;
  recommendedMinPrice: number;
  quickSalePrice: number;

  // معدل الاستهلاك
  depreciationRate: number;
  estimatedValueNextYear: number;

  // تفصيل التعديلات
  breakdown: {
    basePrice: number;
    mileageAdjustment: number;
    conditionAdjustment: number;
    locationAdjustment: number;
    featuresAdjustment: number;
    marketAdjustment: number;
    seasonalAdjustment: number;
    accidentAdjustment: number;
    ownershipAdjustment: number;
  };

  // السيارات المقارنة
  comparables: Array<{
    listingId: string;
    title: string;
    price: number;
    similarity: number; // 0-100
    daysListed: number;
    link: string;
  }>;

  // رؤى إضافية
  insights: Array<{
    type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
    message: string;
    messageAr: string;
  }>;
}

// =============================================================================
// BARTER MATCHING TYPES
// =============================================================================

/**
 * عنصر للمقايضة
 */
export interface BarterItem {
  id: string;
  userId: string;
  type: 'VEHICLE' | 'PROPERTY' | 'GOLD' | 'PHONE' | 'CASH';

  // للسيارات
  listingId?: string;
  vehicleInfo?: {
    make: string;
    model: string;
    year: number;
    mileage: number;
    condition: string;
  };

  // للعقارات
  propertyInfo?: {
    type: string;
    area: number;
    location: string;
  };

  estimatedValue: number;
  description: string;
  descriptionAr: string;
  images: string[];
}

/**
 * تفضيلات المقايضة
 */
export interface BarterPreference {
  userId: string;
  offerItem: BarterItem;

  // ما يبحث عنه
  seekingTypes: ('VEHICLE' | 'PROPERTY' | 'GOLD' | 'PHONE' | 'MIXED')[];

  // للسيارات
  vehiclePreferences?: {
    makes?: VehicleMake[];
    minYear?: number;
    maxMileage?: number;
    bodyTypes?: VehicleBodyType[];
  };

  // القيمة
  minValue: number;
  maxValue: number;

  // فرق نقدي
  acceptsCashDifference: boolean;
  maxCashToReceive?: number;
  maxCashToPay?: number;

  // الموقع
  preferredGovernorates?: Governorate[];
}

/**
 * سلسلة المقايضة
 */
export interface BarterChain {
  id: string;
  type: 'DIRECT' | 'THREE_WAY' | 'CHAIN';

  // المشاركين
  participants: Array<{
    userId: string;
    userName: string;
    gives: BarterItem;
    receives: BarterItem;
    cashFlow: number; // موجب = يستلم، سالب = يدفع
  }>;

  // التقييم
  totalValue: number;
  maxImbalance: number;
  fairnessScore: number; // 0-100
  feasibilityScore: number; // 0-100
  overallScore: number; // 0-100

  // التدفقات النقدية
  cashFlows: Array<{
    from: string;
    to: string;
    amount: number;
    reason: string;
  }>;

  // الحالة
  status: BarterStatus;
  expiresAt: string;

  // الأسباب
  matchReasons: string[];
  matchReasonsAr: string[];
}

/**
 * نتيجة البحث عن مقايضات
 */
export interface BarterMatchResult {
  directMatches: BarterChain[];
  threeWayMatches: BarterChain[];
  chainMatches: BarterChain[];

  totalMatches: number;
  bestMatch?: BarterChain;

  suggestions: Array<{
    type: 'ADJUST_VALUE' | 'ADD_CASH' | 'EXPAND_PREFERENCES';
    message: string;
    messageAr: string;
  }>;
}

// =============================================================================
// RECOMMENDATION ENGINE TYPES
// =============================================================================

/**
 * ملف المستخدم للتوصيات
 */
export interface UserProfile {
  userId: string;

  // التفضيلات الصريحة
  explicitPreferences?: {
    preferredMakes: VehicleMake[];
    preferredBodyTypes: VehicleBodyType[];
    budgetMin: number;
    budgetMax: number;
    preferredFuelTypes: FuelType[];
    preferredTransmissions: TransmissionType[];
    maxMileage?: number;
    minYear?: number;
  };

  // التفضيلات المستنتجة
  implicitPreferences: {
    makeAffinity: Record<string, number>; // 0-1
    bodyTypeAffinity: Record<string, number>;
    priceRange: { min: number; max: number };
    averageViewedPrice: number;
    preferredConditions: Record<string, number>;
  };

  // السجل
  viewHistory: Array<{
    listingId: string;
    timestamp: string;
    duration: number; // seconds
    source: 'SEARCH' | 'RECOMMENDATION' | 'DIRECT';
  }>;

  searchHistory: Array<{
    query: string;
    filters: Record<string, any>;
    timestamp: string;
    resultsClicked: number;
  }>;

  favoriteListings: string[];
  inquiredListings: string[];

  // الديموغرافيا
  governorate?: Governorate;
  memberSince: string;
}

/**
 * نتيجة التوصية
 */
export interface RecommendationResult {
  listingId: string;
  listing: VehicleListing;

  // النتيجة
  score: number; // 0-100

  // تفصيل النتيجة
  scoreBreakdown: {
    relevance: number;
    popularity: number;
    freshness: number;
    value: number;
    diversity: number;
  };

  // أسباب التوصية
  reasons: string[];
  reasonsAr: string[];

  // نوع التوصية
  recommendationType: 'PERSONALIZED' | 'SIMILAR' | 'TRENDING' | 'COLLABORATIVE' | 'NEW_ARRIVAL';
}

/**
 * استجابة التوصيات
 */
export interface RecommendationsResponse {
  personalized: RecommendationResult[];
  trending: RecommendationResult[];
  newArrivals: RecommendationResult[];
  similarToViewed: RecommendationResult[];
  similarToFavorites: RecommendationResult[];

  // للباردة
  coldStartRecommendations?: RecommendationResult[];
}

// =============================================================================
// TRANSACTION TYPES
// =============================================================================

/**
 * المعاملة
 */
export interface Transaction {
  id: string;
  type: 'PURCHASE' | 'BARTER' | 'TRADE_IN';

  // الأطراف
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;

  // السيارة
  listingId: string;
  vehicleTitle: string;
  vehicleMake: string;
  vehicleModel: string;
  vehicleYear: number;

  // المبالغ
  agreedPrice: number;
  platformFee: number;
  buyerCommission: number;
  sellerCommission: number;
  escrowAmount: number;

  // للمقايضة
  barterChain?: BarterChain;

  // الحالة
  status: TransactionStatus;

  // التواريخ
  initiatedAt: string;
  paymentAt?: string;
  inspectionAt?: string;
  transferAt?: string;
  completedAt?: string;

  // الملاحظات
  notes?: string;
}

// =============================================================================
// FILTER & SEARCH TYPES
// =============================================================================

/**
 * فلاتر البحث
 */
export interface VehicleFilters {
  // النص
  search?: string;

  // المواصفات
  makes?: VehicleMake[];
  models?: string[];
  yearMin?: number;
  yearMax?: number;
  bodyTypes?: VehicleBodyType[];
  fuelTypes?: FuelType[];
  transmissions?: TransmissionType[];

  // الحالة
  conditions?: VehicleCondition[];
  mileageMax?: number;
  hasAccidents?: boolean;

  // السعر
  priceMin?: number;
  priceMax?: number;
  priceNegotiable?: boolean;
  acceptsFinancing?: boolean;

  // المقايضة
  allowBarter?: boolean;
  barterTypes?: BarterType[];

  // البائع
  sellerTypes?: SellerType[];
  verificationLevels?: VerificationLevel[];

  // الموقع
  governorates?: Governorate[];

  // الترتيب
  sortBy?: 'newest' | 'oldest' | 'price_asc' | 'price_desc' | 'mileage_asc' | 'year_desc' | 'popular';

  // الصفحة
  page?: number;
  limit?: number;
}

/**
 * نتيجة البحث
 */
export interface SearchResult {
  listings: VehicleListing[];
  totalCount: number;
  page: number;
  totalPages: number;

  // الفلاتر المتاحة
  availableFilters: {
    makes: Array<{ value: string; count: number }>;
    bodyTypes: Array<{ value: string; count: number }>;
    years: Array<{ value: number; count: number }>;
    governorates: Array<{ value: string; count: number }>;
    priceRanges: Array<{ min: number; max: number; count: number }>;
  };
}

// =============================================================================
// STATISTICS TYPES
// =============================================================================

/**
 * إحصائيات السوق
 */
export interface MarketStatistics {
  totalListings: number;
  activeListings: number;
  barterListings: number;
  certifiedListings: number;

  completedTransactions: {
    total: number;
    thisMonth: number;
    thisWeek: number;
  };

  averagePrice: number;
  medianPrice: number;
  priceChange: number; // percentage

  topMakes: Array<{ make: string; count: number; percentage: number }>;
  topModels: Array<{ make: string; model: string; count: number }>;

  byGovernorate: Array<{ governorate: string; count: number; avgPrice: number }>;
  byBodyType: Array<{ bodyType: string; count: number; avgPrice: number }>;
  byYear: Array<{ year: number; count: number; avgPrice: number }>;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL || '';

/**
 * تنسيق السعر بالجنيه المصري
 */
export function formatVehiclePrice(price: number): string {
  if (price >= 1000000) {
    return `${(price / 1000000).toFixed(2)} مليون ج.م`;
  }
  return `${new Intl.NumberFormat('ar-EG').format(price)} ج.م`;
}

/**
 * تنسيق الكيلومترات
 */
export function formatMileage(km: number): string {
  if (km >= 1000) {
    return `${Math.round(km / 1000)}K كم`;
  }
  return `${km} كم`;
}

/**
 * حساب عمر السيارة
 */
export function getVehicleAge(year: number): string {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  if (age === 0) return 'موديل السنة';
  if (age === 1) return 'سنة واحدة';
  if (age === 2) return 'سنتان';
  if (age <= 10) return `${age} سنوات`;
  return `${age} سنة`;
}

/**
 * جلب إعلانات السيارات
 */
export async function getVehicleListings(filters: VehicleFilters): Promise<SearchResult> {
  const params = new URLSearchParams();

  if (filters.search) params.append('search', filters.search);
  if (filters.makes?.length) params.append('makes', filters.makes.join(','));
  if (filters.bodyTypes?.length) params.append('bodyTypes', filters.bodyTypes.join(','));
  if (filters.yearMin) params.append('yearMin', filters.yearMin.toString());
  if (filters.yearMax) params.append('yearMax', filters.yearMax.toString());
  if (filters.priceMin) params.append('priceMin', filters.priceMin.toString());
  if (filters.priceMax) params.append('priceMax', filters.priceMax.toString());
  if (filters.mileageMax) params.append('mileageMax', filters.mileageMax.toString());
  if (filters.allowBarter !== undefined) params.append('allowBarter', filters.allowBarter.toString());
  if (filters.sellerTypes?.length) params.append('sellerTypes', filters.sellerTypes.join(','));
  if (filters.governorates?.length) params.append('governorates', filters.governorates.join(','));
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await fetch(`${API_BASE}/vehicles/listings?${params}`);
  return response.json();
}

/**
 * جلب تفاصيل إعلان
 */
export async function getVehicleListing(id: string): Promise<VehicleListing> {
  const response = await fetch(`${API_BASE}/vehicles/listings/${id}`);
  return response.json();
}

/**
 * حساب السعر الديناميكي
 */
export async function calculateVehiclePrice(input: PricingInput): Promise<PriceEstimate> {
  const response = await fetch(`${API_BASE}/vehicles/pricing/calculate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  return response.json();
}

/**
 * البحث عن مقايضات
 */
export async function findBarterMatches(preference: BarterPreference): Promise<BarterMatchResult> {
  const response = await fetch(`${API_BASE}/vehicles/barter/find-matches`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(preference),
  });
  return response.json();
}

/**
 * جلب التوصيات
 */
export async function getRecommendations(userId: string): Promise<RecommendationsResponse> {
  const response = await fetch(`${API_BASE}/vehicles/recommendations/${userId}`);
  return response.json();
}

/**
 * جلب إحصائيات السوق
 */
export async function getMarketStatistics(): Promise<MarketStatistics> {
  const response = await fetch(`${API_BASE}/vehicles/statistics`);
  return response.json();
}

/**
 * إنشاء إعلان جديد
 */
export async function createVehicleListing(data: Partial<VehicleListing>): Promise<VehicleListing> {
  const response = await fetch(`${API_BASE}/vehicles/listings`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

/**
 * تحديث إعلان
 */
export async function updateVehicleListing(id: string, data: Partial<VehicleListing>): Promise<VehicleListing> {
  const response = await fetch(`${API_BASE}/vehicles/listings/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  return response.json();
}

// =============================================================================
// MOCK DATA
// =============================================================================

export const MOCK_SELLERS: Seller[] = [
  {
    id: 'seller-1',
    fullName: 'أحمد محمد',
    type: 'OWNER',
    rating: 4.8,
    totalReviews: 23,
    totalSales: 5,
    responseRate: 95,
    responseTime: '< ساعة',
    memberSince: '2022-03-15',
    verified: true,
  },
  {
    id: 'seller-2',
    fullName: 'معرض النجوم للسيارات',
    fullNameAr: 'معرض النجوم للسيارات',
    type: 'SHOWROOM',
    showroomName: 'El-Nogoum Cars',
    showroomNameAr: 'معرض النجوم',
    rating: 4.6,
    totalReviews: 156,
    totalSales: 89,
    responseRate: 98,
    responseTime: '< 30 دقيقة',
    memberSince: '2020-01-10',
    verified: true,
  },
  {
    id: 'seller-3',
    fullName: 'محمد السيد',
    type: 'DEALER',
    rating: 4.5,
    totalReviews: 45,
    totalSales: 32,
    responseRate: 90,
    responseTime: '< ساعتين',
    memberSince: '2021-06-20',
    verified: true,
  },
];

export const MOCK_VEHICLE_LISTINGS: VehicleListing[] = [
  {
    id: 'v-001',
    title: 'Toyota Corolla 2023 Full Option',
    titleAr: 'تويوتا كورولا 2023 فل كامل',
    description: 'Brand new condition, first owner, full service history',
    descriptionAr: 'حالة ممتازة كالزيرو، مالك أول، سجل صيانة كامل',
    make: 'TOYOTA',
    model: 'Corolla',
    year: 2023,
    trim: 'XLi',
    bodyType: 'SEDAN',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: 1800,
    enginePower: 139,
    cylinders: 4,
    condition: 'LIKE_NEW',
    mileage: 15000,
    hasAccidents: false,
    previousOwners: 1,
    serviceHistory: true,
    warranty: true,
    warrantyMonths: 24,
    exteriorColor: 'White',
    exteriorColorAr: 'أبيض',
    interiorColor: 'Black',
    interiorColorAr: 'أسود',
    plateType: 'PRIVATE',
    licensedUntil: '2025-06-15',
    askingPrice: 980000,
    marketPrice: 950000,
    priceNegotiable: true,
    acceptsFinancing: true,
    allowBarter: true,
    barterTypes: ['CAR_FOR_CAR'],
    barterPreferences: 'أقبل مقايضة بسيارة أحدث مع دفع الفرق',
    governorate: 'CAIRO',
    city: 'مدينة نصر',
    area: 'الحي الثامن',
    images: [
      { id: 'img-1', url: '/images/vehicles/corolla-1.jpg', order: 1, isPrimary: true },
      { id: 'img-2', url: '/images/vehicles/corolla-2.jpg', order: 2, isPrimary: false },
    ],
    videos: [],
    features: {
      airbags: 7,
      abs: true,
      esp: true,
      parkingSensors: 'FRONT_REAR',
      reverseCamera: true,
      airConditioning: 'DUAL_ZONE',
      sunroof: 'NONE',
      leatherSeats: false,
      keylessEntry: true,
      pushStart: true,
      touchscreen: true,
      screenSize: 8,
      appleCarPlay: true,
      androidAuto: true,
      bluetooth: true,
      usbPorts: 2,
      ledLights: true,
    },
    inspection: {
      id: 'insp-1',
      date: '2024-01-15',
      centerId: 'center-1',
      centerName: 'Xchange Inspection Center',
      centerNameAr: 'مركز فحص اكسشينج',
      inspectorName: 'محمد علي',
      overallGrade: 'A',
      overallScore: 92,
      exteriorScore: 95,
      interiorScore: 90,
      mechanicalScore: 93,
      electricalScore: 90,
      paintThickness: { hood: 120, roof: 115, doors: 118 },
      tireCondition: { fl: 85, fr: 85, rl: 80, rr: 80 },
      brakeCondition: 90,
      suspensionCondition: 88,
      issues: [],
      recommendation: 'Excellent condition, highly recommended',
      recommendationAr: 'حالة ممتازة، ينصح بالشراء',
    },
    seller: MOCK_SELLERS[0],
    sellerType: 'OWNER',
    status: 'ACTIVE',
    verificationLevel: 'CERTIFIED',
    featured: true,
    boosted: true,
    boostExpiresAt: '2024-02-15',
    views: 1250,
    favorites: 45,
    inquiries: 12,
    createdAt: '2024-01-10T10:00:00Z',
    updatedAt: '2024-01-15T14:30:00Z',
    expiresAt: '2024-04-10T10:00:00Z',
  },
  {
    id: 'v-002',
    title: 'Hyundai Tucson 2022 GLS',
    titleAr: 'هيونداي توسان 2022 GLS',
    description: 'Excellent SUV, low mileage, accident free',
    descriptionAr: 'سيارة عائلية ممتازة، كيلومترات قليلة، بدون حوادث',
    make: 'HYUNDAI',
    model: 'Tucson',
    year: 2022,
    trim: 'GLS',
    bodyType: 'SUV',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: 2000,
    enginePower: 156,
    cylinders: 4,
    condition: 'EXCELLENT',
    mileage: 35000,
    hasAccidents: false,
    previousOwners: 1,
    serviceHistory: true,
    warranty: false,
    exteriorColor: 'Gray',
    exteriorColorAr: 'رمادي',
    interiorColor: 'Beige',
    interiorColorAr: 'بيج',
    plateType: 'PRIVATE',
    licensedUntil: '2025-03-20',
    askingPrice: 1150000,
    marketPrice: 1100000,
    priceNegotiable: true,
    acceptsFinancing: true,
    allowBarter: true,
    barterTypes: ['CAR_FOR_CAR', 'CAR_FOR_PROPERTY'],
    barterPreferences: 'أقبل مقايضة بشقة في القاهرة الجديدة',
    governorate: 'GIZA',
    city: '6 أكتوبر',
    images: [
      { id: 'img-3', url: '/images/vehicles/tucson-1.jpg', order: 1, isPrimary: true },
    ],
    videos: [],
    features: {
      airbags: 6,
      abs: true,
      esp: true,
      parkingSensors: 'FRONT_REAR',
      reverseCamera: true,
      camera360: true,
      airConditioning: 'DUAL_ZONE',
      sunroof: 'PANORAMIC',
      leatherSeats: true,
      keylessEntry: true,
      pushStart: true,
      touchscreen: true,
      screenSize: 10.25,
      appleCarPlay: true,
      androidAuto: true,
      bluetooth: true,
      wirelessCharging: true,
      ledLights: true,
    },
    seller: MOCK_SELLERS[1],
    sellerType: 'SHOWROOM',
    status: 'ACTIVE',
    verificationLevel: 'INSPECTED',
    featured: false,
    boosted: false,
    views: 890,
    favorites: 32,
    inquiries: 8,
    createdAt: '2024-01-08T09:00:00Z',
    updatedAt: '2024-01-12T11:00:00Z',
    expiresAt: '2024-04-08T09:00:00Z',
  },
  {
    id: 'v-003',
    title: 'Mercedes-Benz C200 2021',
    titleAr: 'مرسيدس C200 2021',
    description: 'Luxury sedan in perfect condition',
    descriptionAr: 'سيدان فاخرة في حالة مثالية',
    make: 'MERCEDES',
    model: 'C-Class',
    year: 2021,
    trim: 'C200',
    bodyType: 'SEDAN',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: 1500,
    enginePower: 204,
    cylinders: 4,
    condition: 'EXCELLENT',
    mileage: 45000,
    hasAccidents: false,
    previousOwners: 1,
    serviceHistory: true,
    warranty: false,
    exteriorColor: 'Black',
    exteriorColorAr: 'أسود',
    interiorColor: 'Red',
    interiorColorAr: 'أحمر',
    plateType: 'PRIVATE',
    askingPrice: 2200000,
    marketPrice: 2100000,
    priceNegotiable: true,
    acceptsFinancing: true,
    allowBarter: false,
    barterTypes: [],
    governorate: 'CAIRO',
    city: 'التجمع الخامس',
    images: [
      { id: 'img-4', url: '/images/vehicles/mercedes-1.jpg', order: 1, isPrimary: true },
    ],
    videos: [],
    features: {
      airbags: 9,
      abs: true,
      esp: true,
      blindSpotMonitor: true,
      laneDepartureWarning: true,
      parkingSensors: '360',
      reverseCamera: true,
      camera360: true,
      adaptiveCruise: true,
      airConditioning: 'TRI_ZONE',
      sunroof: 'PANORAMIC',
      leatherSeats: true,
      heatedSeats: true,
      cooledSeats: true,
      electricSeats: true,
      memorySeats: true,
      keylessEntry: true,
      pushStart: true,
      touchscreen: true,
      screenSize: 12.3,
      appleCarPlay: true,
      androidAuto: true,
      premiumAudio: 'Burmester',
      wirelessCharging: true,
      turbo: true,
      ledLights: true,
      electricTrunk: true,
    },
    seller: MOCK_SELLERS[0],
    sellerType: 'OWNER',
    status: 'ACTIVE',
    verificationLevel: 'CERTIFIED',
    featured: true,
    boosted: true,
    views: 2100,
    favorites: 78,
    inquiries: 25,
    createdAt: '2024-01-05T08:00:00Z',
    updatedAt: '2024-01-14T16:00:00Z',
    expiresAt: '2024-04-05T08:00:00Z',
  },
  {
    id: 'v-004',
    title: 'MG ZS 2024 Luxury',
    titleAr: 'إم جي ZS 2024 لاكشري',
    description: 'Brand new MG ZS, zero kilometers',
    descriptionAr: 'إم جي ZS جديدة زيرو، صفر كيلومتر',
    make: 'MG',
    model: 'ZS',
    year: 2024,
    trim: 'Luxury',
    bodyType: 'CROSSOVER',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: 1500,
    enginePower: 118,
    cylinders: 4,
    condition: 'NEW',
    mileage: 0,
    hasAccidents: false,
    previousOwners: 0,
    serviceHistory: false,
    warranty: true,
    warrantyMonths: 60,
    exteriorColor: 'Blue',
    exteriorColorAr: 'أزرق',
    interiorColor: 'Black',
    interiorColorAr: 'أسود',
    plateType: 'PRIVATE',
    askingPrice: 850000,
    marketPrice: 870000,
    priceNegotiable: false,
    acceptsFinancing: true,
    allowBarter: true,
    barterTypes: ['CAR_FOR_CAR'],
    governorate: 'ALEXANDRIA',
    city: 'سموحة',
    images: [
      { id: 'img-5', url: '/images/vehicles/mg-zs-1.jpg', order: 1, isPrimary: true },
    ],
    videos: [],
    features: {
      airbags: 6,
      abs: true,
      esp: true,
      parkingSensors: 'FRONT_REAR',
      reverseCamera: true,
      airConditioning: 'AUTO',
      sunroof: 'PANORAMIC',
      leatherSeats: true,
      keylessEntry: true,
      pushStart: true,
      touchscreen: true,
      screenSize: 10.1,
      appleCarPlay: true,
      androidAuto: true,
      bluetooth: true,
      ledLights: true,
    },
    seller: MOCK_SELLERS[1],
    sellerType: 'SHOWROOM',
    status: 'ACTIVE',
    verificationLevel: 'VERIFIED',
    featured: false,
    boosted: false,
    views: 650,
    favorites: 28,
    inquiries: 15,
    createdAt: '2024-01-12T12:00:00Z',
    updatedAt: '2024-01-12T12:00:00Z',
    expiresAt: '2024-04-12T12:00:00Z',
  },
  {
    id: 'v-005',
    title: 'Kia Sportage 2023',
    titleAr: 'كيا سبورتاج 2023',
    description: 'Family SUV, excellent condition',
    descriptionAr: 'سيارة عائلية، حالة ممتازة',
    make: 'KIA',
    model: 'Sportage',
    year: 2023,
    trim: 'LX',
    bodyType: 'SUV',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: 2000,
    enginePower: 150,
    cylinders: 4,
    condition: 'EXCELLENT',
    mileage: 22000,
    hasAccidents: false,
    previousOwners: 1,
    serviceHistory: true,
    warranty: true,
    warrantyMonths: 36,
    exteriorColor: 'Silver',
    exteriorColorAr: 'فضي',
    plateType: 'PRIVATE',
    askingPrice: 1050000,
    marketPrice: 1020000,
    priceNegotiable: true,
    acceptsFinancing: true,
    allowBarter: true,
    barterTypes: ['CAR_FOR_CAR', 'CAR_FOR_GOLD'],
    governorate: 'CAIRO',
    city: 'مصر الجديدة',
    images: [
      { id: 'img-6', url: '/images/vehicles/sportage-1.jpg', order: 1, isPrimary: true },
    ],
    videos: [],
    features: {
      airbags: 6,
      abs: true,
      esp: true,
      parkingSensors: 'FRONT_REAR',
      reverseCamera: true,
      airConditioning: 'DUAL_ZONE',
      sunroof: 'STANDARD',
      leatherSeats: false,
      keylessEntry: true,
      pushStart: true,
      touchscreen: true,
      screenSize: 8,
      appleCarPlay: true,
      androidAuto: true,
      bluetooth: true,
      ledLights: true,
    },
    seller: MOCK_SELLERS[2],
    sellerType: 'DEALER',
    status: 'ACTIVE',
    verificationLevel: 'INSPECTED',
    featured: false,
    boosted: false,
    views: 780,
    favorites: 35,
    inquiries: 10,
    createdAt: '2024-01-09T15:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
    expiresAt: '2024-04-09T15:00:00Z',
  },
  {
    id: 'v-006',
    title: 'BMW X5 2020 xDrive40i',
    titleAr: 'بي إم دبليو X5 2020',
    description: 'Luxury SUV, full options, excellent condition',
    descriptionAr: 'سيارة فاخرة، فل كامل، حالة ممتازة',
    make: 'BMW',
    model: 'X5',
    year: 2020,
    trim: 'xDrive40i',
    bodyType: 'SUV',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: 3000,
    enginePower: 340,
    cylinders: 6,
    condition: 'VERY_GOOD',
    mileage: 65000,
    hasAccidents: false,
    previousOwners: 2,
    serviceHistory: true,
    warranty: false,
    exteriorColor: 'White',
    exteriorColorAr: 'أبيض',
    interiorColor: 'Brown',
    interiorColorAr: 'بني',
    plateType: 'PRIVATE',
    askingPrice: 3500000,
    marketPrice: 3400000,
    priceNegotiable: true,
    acceptsFinancing: true,
    allowBarter: true,
    barterTypes: ['CAR_FOR_PROPERTY'],
    barterPreferences: 'مقايضة بشقة أو فيلا في القاهرة الجديدة',
    governorate: 'GIZA',
    city: 'الشيخ زايد',
    images: [
      { id: 'img-7', url: '/images/vehicles/bmw-x5-1.jpg', order: 1, isPrimary: true },
    ],
    videos: [],
    features: {
      airbags: 8,
      abs: true,
      esp: true,
      blindSpotMonitor: true,
      laneDepartureWarning: true,
      parkingSensors: '360',
      reverseCamera: true,
      camera360: true,
      adaptiveCruise: true,
      airConditioning: 'TRI_ZONE',
      sunroof: 'PANORAMIC',
      leatherSeats: true,
      heatedSeats: true,
      cooledSeats: true,
      electricSeats: true,
      memorySeats: true,
      keylessEntry: true,
      pushStart: true,
      touchscreen: true,
      screenSize: 12.3,
      appleCarPlay: true,
      androidAuto: true,
      premiumAudio: 'Harman Kardon',
      wirelessCharging: true,
      turbo: true,
      allWheelDrive: true,
      ledLights: true,
      electricTrunk: true,
    },
    seller: MOCK_SELLERS[0],
    sellerType: 'OWNER',
    status: 'ACTIVE',
    verificationLevel: 'CERTIFIED',
    featured: true,
    boosted: false,
    views: 1850,
    favorites: 62,
    inquiries: 18,
    createdAt: '2024-01-07T11:00:00Z',
    updatedAt: '2024-01-14T09:00:00Z',
    expiresAt: '2024-04-07T11:00:00Z',
  },
  {
    id: 'v-007',
    title: 'Nissan Sunny 2022',
    titleAr: 'نيسان صني 2022',
    description: 'Economic sedan, low fuel consumption',
    descriptionAr: 'سيدان اقتصادية، استهلاك وقود منخفض',
    make: 'NISSAN',
    model: 'Sunny',
    year: 2022,
    trim: 'SV',
    bodyType: 'SEDAN',
    fuelType: 'PETROL',
    transmission: 'AUTOMATIC',
    engineSize: 1600,
    enginePower: 118,
    cylinders: 4,
    condition: 'EXCELLENT',
    mileage: 40000,
    hasAccidents: false,
    previousOwners: 1,
    serviceHistory: true,
    warranty: false,
    exteriorColor: 'Silver',
    exteriorColorAr: 'فضي',
    plateType: 'PRIVATE',
    askingPrice: 520000,
    marketPrice: 510000,
    priceNegotiable: true,
    acceptsFinancing: true,
    allowBarter: true,
    barterTypes: ['CAR_FOR_CAR'],
    governorate: 'SHARQIA',
    city: 'الزقازيق',
    images: [
      { id: 'img-8', url: '/images/vehicles/sunny-1.jpg', order: 1, isPrimary: true },
    ],
    videos: [],
    features: {
      airbags: 2,
      abs: true,
      esp: true,
      parkingSensors: 'REAR',
      reverseCamera: true,
      airConditioning: 'MANUAL',
      keylessEntry: true,
      touchscreen: true,
      bluetooth: true,
      usbPorts: 1,
    },
    seller: MOCK_SELLERS[2],
    sellerType: 'DEALER',
    status: 'ACTIVE',
    verificationLevel: 'VERIFIED',
    featured: false,
    boosted: false,
    views: 420,
    favorites: 18,
    inquiries: 6,
    createdAt: '2024-01-11T14:00:00Z',
    updatedAt: '2024-01-11T14:00:00Z',
    expiresAt: '2024-04-11T14:00:00Z',
  },
  {
    id: 'v-008',
    title: 'Chery Tiggo 4 Pro 2024',
    titleAr: 'شيري تيجو 4 برو 2024',
    description: 'New crossover, great value',
    descriptionAr: 'كروس أوفر جديدة، قيمة ممتازة',
    make: 'CHERY',
    model: 'Tiggo 4',
    year: 2024,
    trim: 'Pro',
    bodyType: 'CROSSOVER',
    fuelType: 'PETROL',
    transmission: 'CVT',
    engineSize: 1500,
    enginePower: 147,
    cylinders: 4,
    condition: 'NEW',
    mileage: 100,
    hasAccidents: false,
    previousOwners: 0,
    serviceHistory: false,
    warranty: true,
    warrantyMonths: 60,
    exteriorColor: 'Red',
    exteriorColorAr: 'أحمر',
    plateType: 'PRIVATE',
    askingPrice: 720000,
    priceNegotiable: false,
    acceptsFinancing: true,
    allowBarter: true,
    barterTypes: ['CAR_FOR_CAR'],
    governorate: 'CAIRO',
    city: 'المعادي',
    images: [
      { id: 'img-9', url: '/images/vehicles/tiggo4-1.jpg', order: 1, isPrimary: true },
    ],
    videos: [],
    features: {
      airbags: 6,
      abs: true,
      esp: true,
      parkingSensors: 'FRONT_REAR',
      reverseCamera: true,
      airConditioning: 'AUTO',
      sunroof: 'PANORAMIC',
      leatherSeats: true,
      keylessEntry: true,
      pushStart: true,
      touchscreen: true,
      screenSize: 10.25,
      appleCarPlay: true,
      androidAuto: true,
      bluetooth: true,
      turbo: true,
      ledLights: true,
    },
    seller: MOCK_SELLERS[1],
    sellerType: 'SHOWROOM',
    status: 'ACTIVE',
    verificationLevel: 'VERIFIED',
    featured: true,
    boosted: true,
    views: 980,
    favorites: 42,
    inquiries: 20,
    createdAt: '2024-01-13T10:00:00Z',
    updatedAt: '2024-01-13T10:00:00Z',
    expiresAt: '2024-04-13T10:00:00Z',
  },
];

export const MOCK_MARKET_STATS: MarketStatistics = {
  totalListings: 15420,
  activeListings: 12850,
  barterListings: 4230,
  certifiedListings: 890,
  completedTransactions: {
    total: 28500,
    thisMonth: 1250,
    thisWeek: 320,
  },
  averagePrice: 850000,
  medianPrice: 720000,
  priceChange: 5.2,
  topMakes: [
    { make: 'TOYOTA', count: 3200, percentage: 25 },
    { make: 'HYUNDAI', count: 2100, percentage: 16 },
    { make: 'KIA', count: 1800, percentage: 14 },
    { make: 'NISSAN', count: 1500, percentage: 12 },
    { make: 'CHEVROLET', count: 1200, percentage: 9 },
    { make: 'MG', count: 980, percentage: 8 },
    { make: 'MERCEDES', count: 650, percentage: 5 },
    { make: 'BMW', count: 520, percentage: 4 },
  ],
  topModels: [
    { make: 'TOYOTA', model: 'Corolla', count: 1200 },
    { make: 'HYUNDAI', model: 'Elantra', count: 850 },
    { make: 'KIA', model: 'Cerato', count: 720 },
    { make: 'NISSAN', model: 'Sunny', count: 680 },
    { make: 'HYUNDAI', model: 'Tucson', count: 520 },
  ],
  byGovernorate: [
    { governorate: 'CAIRO', count: 4500, avgPrice: 920000 },
    { governorate: 'GIZA', count: 3200, avgPrice: 880000 },
    { governorate: 'ALEXANDRIA', count: 1800, avgPrice: 750000 },
    { governorate: 'SHARQIA', count: 850, avgPrice: 620000 },
    { governorate: 'DAKAHLIA', count: 720, avgPrice: 580000 },
  ],
  byBodyType: [
    { bodyType: 'SEDAN', count: 5200, avgPrice: 680000 },
    { bodyType: 'SUV', count: 3800, avgPrice: 1100000 },
    { bodyType: 'CROSSOVER', count: 2100, avgPrice: 850000 },
    { bodyType: 'HATCHBACK', count: 1200, avgPrice: 450000 },
  ],
  byYear: [
    { year: 2024, count: 1800, avgPrice: 950000 },
    { year: 2023, count: 2500, avgPrice: 820000 },
    { year: 2022, count: 2200, avgPrice: 720000 },
    { year: 2021, count: 1900, avgPrice: 650000 },
    { year: 2020, count: 1500, avgPrice: 580000 },
  ],
};
