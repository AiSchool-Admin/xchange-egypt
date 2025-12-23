/**
 * Xchange Transport Marketplace - Request & Quote System
 * ======================================================
 *
 * نظام طلبات العروض للشحن والرحلات بين المدن
 *
 * يتيح للعملاء نشر طلباتهم واستقبال عروض من مزودي الخدمة
 * (أفراد وشركات صغيرة وكبيرة)
 */

// =====================================================
// ENUMS
// =====================================================

export enum ServiceType {
  SHIPPING = 'SHIPPING',           // خدمة الشحن
  INTERCITY_RIDE = 'INTERCITY_RIDE' // رحلات بين المدن
}

export enum RequestStatus {
  DRAFT = 'DRAFT',                 // مسودة
  OPEN = 'OPEN',                   // مفتوح للعروض
  QUOTED = 'QUOTED',               // تم استلام عروض
  ACCEPTED = 'ACCEPTED',           // تم قبول عرض
  IN_PROGRESS = 'IN_PROGRESS',     // جاري التنفيذ
  COMPLETED = 'COMPLETED',         // مكتمل
  CANCELLED = 'CANCELLED',         // ملغي
  EXPIRED = 'EXPIRED'              // منتهي الصلاحية
}

export enum QuoteStatus {
  PENDING = 'PENDING',             // في انتظار رد العميل
  ACCEPTED = 'ACCEPTED',           // مقبول
  REJECTED = 'REJECTED',           // مرفوض
  WITHDRAWN = 'WITHDRAWN',         // تم سحبه من المزود
  EXPIRED = 'EXPIRED'              // منتهي الصلاحية
}

export enum ProviderType {
  INDIVIDUAL = 'INDIVIDUAL',       // فرد
  SMALL_BUSINESS = 'SMALL_BUSINESS', // شركة صغيرة
  COMPANY = 'COMPANY'              // شركة كبيرة
}

export enum VehicleType {
  // للشحن
  MOTORCYCLE = 'MOTORCYCLE',       // موتوسيكل
  CAR = 'CAR',                     // سيارة
  VAN = 'VAN',                     // فان
  PICKUP = 'PICKUP',               // بيك أب
  TRUCK_SMALL = 'TRUCK_SMALL',     // نقل صغير
  TRUCK_MEDIUM = 'TRUCK_MEDIUM',   // نقل متوسط
  TRUCK_LARGE = 'TRUCK_LARGE',     // نقل كبير

  // للركوب
  SEDAN = 'SEDAN',                 // سيدان
  SUV = 'SUV',                     // SUV
  MINIVAN = 'MINIVAN',             // ميني فان
  BUS_SMALL = 'BUS_SMALL',         // ميني باص
  BUS_LARGE = 'BUS_LARGE'          // باص كبير
}

// =====================================================
// INTERFACES
// =====================================================

export interface Location {
  lat: number;
  lng: number;
  address: string;
  city: string;
  governorate: string;
  landmark?: string;
}

// طلب الخدمة
export interface ServiceRequest {
  id: string;
  userId: string;
  serviceType: ServiceType;
  status: RequestStatus;

  // المواقع
  pickup: Location;
  dropoff: Location;

  // تفاصيل الشحن (إذا كان شحن)
  shippingDetails?: {
    weight: number;            // بالكيلو
    dimensions?: {
      length: number;
      width: number;
      height: number;
    };
    packageType: string;       // طرد، مستندات، إلكترونيات، إلخ
    description: string;
    quantity: number;
    fragile: boolean;
    requiresCooling: boolean;
  };

  // تفاصيل الرحلة (إذا كانت رحلة)
  rideDetails?: {
    passengers: number;
    luggage: number;           // عدد الحقائب
    vehiclePreference?: VehicleType;
    amenities?: string[];      // WiFi, AC, etc
  };

  // الوقت
  scheduledDate: Date;
  scheduledTime?: string;      // مثل "10:00 AM"
  flexibility: 'EXACT' | 'FLEXIBLE_HOURS' | 'FLEXIBLE_DAYS';

  // الدفع
  paymentMethod: 'CASH' | 'CARD' | 'WALLET' | 'COD';
  codAmount?: number;          // للدفع عند الاستلام

  // العميل
  customerName: string;
  customerPhone: string;
  customerNotes?: string;

  // الميزانية
  budgetMin?: number;
  budgetMax?: number;

  // العروض
  quotesCount: number;
  quotes: Quote[];
  acceptedQuoteId?: string;

  // الوقت
  expiresAt: Date;            // تاريخ انتهاء الطلب
  createdAt: Date;
  updatedAt: Date;
}

// عرض السعر
export interface Quote {
  id: string;
  requestId: string;
  providerId: string;
  provider: ServiceProvider;
  status: QuoteStatus;

  // السعر
  price: number;
  currency: string;
  priceBreakdown: {
    basePrice: number;
    distanceCharge?: number;
    weightCharge?: number;
    codFee?: number;
    insuranceFee?: number;
    tollFees?: number;
    extras?: { name: string; price: number }[];
  };

  // الخدمة
  vehicleType: VehicleType;
  estimatedDuration: number;   // بالدقائق
  estimatedArrival: Date;

  // التفاصيل
  notes?: string;
  termsConditions?: string;
  validUntil: Date;

  // التقييم (إذا تم التنفيذ)
  rating?: number;
  review?: string;

  createdAt: Date;
  updatedAt: Date;
}

// مزود الخدمة
export interface ServiceProvider {
  id: string;
  userId: string;

  // المعلومات الأساسية
  type: ProviderType;
  name: string;
  nameAr: string;
  phone: string;
  email?: string;

  // للشركات
  companyName?: string;
  commercialRegister?: string;
  taxNumber?: string;

  // المركبات
  vehicles: ProviderVehicle[];

  // التغطية
  coverageAreas: string[];     // المحافظات
  serviceTypes: ServiceType[];

  // التقييم
  rating: number;
  totalRatings: number;
  completedOrders: number;

  // الحالة
  isVerified: boolean;
  isActive: boolean;

  // الصور والمستندات
  profilePhoto?: string;
  documents?: {
    type: string;
    url: string;
    verified: boolean;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

// مركبة المزود
export interface ProviderVehicle {
  id: string;
  providerId: string;
  type: VehicleType;
  make: string;              // الماركة
  model: string;             // الموديل
  year: number;
  plateNumber: string;
  color: string;
  capacity?: number;         // للركاب أو الوزن
  photos: string[];
  isActive: boolean;
}

// إشعار
export interface Notification {
  id: string;
  userId: string;
  type: 'NEW_REQUEST' | 'NEW_QUOTE' | 'QUOTE_ACCEPTED' | 'QUOTE_REJECTED' | 'ORDER_UPDATE';
  title: string;
  titleAr: string;
  message: string;
  messageAr: string;
  data?: any;
  isRead: boolean;
  createdAt: Date;
}

// =====================================================
// DATABASE SCHEMA (Prisma)
// =====================================================

export const PRISMA_SCHEMA = `
// ==================== MARKETPLACE ENUMS ====================

enum ServiceType {
  SHIPPING
  INTERCITY_RIDE
}

enum RequestStatus {
  DRAFT
  OPEN
  QUOTED
  ACCEPTED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  EXPIRED
}

enum QuoteStatus {
  PENDING
  ACCEPTED
  REJECTED
  WITHDRAWN
  EXPIRED
}

enum ProviderType {
  INDIVIDUAL
  SMALL_BUSINESS
  COMPANY
}

enum VehicleType {
  MOTORCYCLE
  CAR
  VAN
  PICKUP
  TRUCK_SMALL
  TRUCK_MEDIUM
  TRUCK_LARGE
  SEDAN
  SUV
  MINIVAN
  BUS_SMALL
  BUS_LARGE
}

// ==================== SERVICE PROVIDER ====================

model ServiceProvider {
  id                  String         @id @default(cuid())
  userId              String         @unique
  user                User           @relation(fields: [userId], references: [id])

  type                ProviderType
  name                String
  nameAr              String
  phone               String
  email               String?

  // Company info
  companyName         String?
  commercialRegister  String?
  taxNumber           String?

  // Coverage
  coverageAreas       String[]       // Governorates
  serviceTypes        ServiceType[]

  // Stats
  rating              Float          @default(0)
  totalRatings        Int            @default(0)
  completedOrders     Int            @default(0)

  // Status
  isVerified          Boolean        @default(false)
  isActive            Boolean        @default(true)

  // Media
  profilePhoto        String?

  // Relations
  vehicles            ProviderVehicle[]
  documents           ProviderDocument[]
  quotes              ServiceQuote[]

  createdAt           DateTime       @default(now())
  updatedAt           DateTime       @updatedAt

  @@index([userId])
  @@index([isActive])
  @@index([rating])
}

model ProviderVehicle {
  id          String       @id @default(cuid())
  providerId  String
  provider    ServiceProvider @relation(fields: [providerId], references: [id])

  type        VehicleType
  make        String
  model       String
  year        Int
  plateNumber String
  color       String
  capacity    Float?       // Passengers or weight in kg
  photos      String[]
  isActive    Boolean      @default(true)

  createdAt   DateTime     @default(now())
  updatedAt   DateTime     @updatedAt

  @@index([providerId])
}

model ProviderDocument {
  id          String   @id @default(cuid())
  providerId  String
  provider    ServiceProvider @relation(fields: [providerId], references: [id])

  type        String   // license, registration, insurance, etc
  url         String
  verified    Boolean  @default(false)
  verifiedAt  DateTime?
  expiresAt   DateTime?

  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([providerId])
}

// ==================== SERVICE REQUEST ====================

model ServiceRequest {
  id              String        @id @default(cuid())
  userId          String
  user            User          @relation(fields: [userId], references: [id])

  serviceType     ServiceType
  status          RequestStatus @default(DRAFT)

  // Locations
  pickupAddress   String
  pickupCity      String
  pickupGov       String
  pickupLat       Float
  pickupLng       Float
  pickupLandmark  String?

  dropoffAddress  String
  dropoffCity     String
  dropoffGov      String
  dropoffLat      Float
  dropoffLng      Float
  dropoffLandmark String?

  // Shipping details (JSON)
  shippingDetails Json?

  // Ride details (JSON)
  rideDetails     Json?

  // Schedule
  scheduledDate   DateTime
  scheduledTime   String?
  flexibility     String       @default("EXACT")

  // Payment
  paymentMethod   String       @default("CASH")
  codAmount       Decimal?     @db.Decimal(10, 2)

  // Customer
  customerName    String
  customerPhone   String
  customerNotes   String?

  // Budget
  budgetMin       Decimal?     @db.Decimal(10, 2)
  budgetMax       Decimal?     @db.Decimal(10, 2)

  // Quotes
  quotesCount     Int          @default(0)
  acceptedQuoteId String?

  // Expiry
  expiresAt       DateTime

  // Relations
  quotes          ServiceQuote[]

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([userId])
  @@index([status])
  @@index([serviceType])
  @@index([expiresAt])
}

// ==================== SERVICE QUOTE ====================

model ServiceQuote {
  id              String       @id @default(cuid())
  requestId       String
  request         ServiceRequest @relation(fields: [requestId], references: [id])

  providerId      String
  provider        ServiceProvider @relation(fields: [providerId], references: [id])

  status          QuoteStatus  @default(PENDING)

  // Pricing
  price           Decimal      @db.Decimal(10, 2)
  currency        String       @default("EGP")
  priceBreakdown  Json

  // Service
  vehicleType     VehicleType
  estimatedDuration Int        // Minutes
  estimatedArrival DateTime

  // Details
  notes           String?
  termsConditions String?
  validUntil      DateTime

  // Rating (after completion)
  rating          Float?
  review          String?

  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  @@index([requestId])
  @@index([providerId])
  @@index([status])
}

// ==================== NOTIFICATIONS ====================

model MarketplaceNotification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])

  type      String   // NEW_REQUEST, NEW_QUOTE, QUOTE_ACCEPTED, etc
  title     String
  titleAr   String
  message   String
  messageAr String
  data      Json?

  isRead    Boolean  @default(false)
  readAt    DateTime?

  createdAt DateTime @default(now())

  @@index([userId])
  @@index([isRead])
  @@index([createdAt])
}
`;
