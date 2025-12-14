# 🏆 Xchange Gold Marketplace - حزمة التطوير الكاملة

**نظام متكامل لتجارة الذهب الإلكترونية في مصر**

تاريخ الإنشاء: ديسمبر 2024
المنصة: Xchange Egypt
التقنيات: Next.js, Express, PostgreSQL, Prisma

---

## 📋 جدول المحتويات

1. [Database Schema (Prisma)](#database-schema)
2. [API Endpoints Documentation](#api-endpoints)
3. [User Stories التفصيلية](#user-stories)
4. [Integration Guides](#integration-guides)
5. [Business Logic & Algorithms](#business-logic)
6. [Testing Scenarios](#testing-scenarios)
7. [Security & Compliance](#security)

---

## 1. DATABASE SCHEMA (Prisma) {#database-schema}

### 1.1 Gold Product Models

```prisma
// ============================================
// GOLD MARKETPLACE SCHEMA
// ============================================

enum GoldProductType {
  BULLION        // سبائك
  COIN           // جنيهات ذهب
  JEWELRY        // مشغولات
  CUSTOM         // حسب الطلب
}

enum GoldKarat {
  K24    // 999 (24 قيراط)
  K21    // 875 (21 قيراط)
  K18    // 750 (18 قيراط)
  K14    // 585 (14 قيراط)
}

enum GoldCondition {
  NEW            // جديد
  EXCELLENT      // ممتاز (استعمال خفيف)
  GOOD           // جيد (استعمال متوسط)
  FAIR           // مقبول (استعمال كثيف)
  SCRAP          // كسر للصهر
}

enum DamghaType {
  EGYPTIAN_OFFICIAL    // دمغة مصرية رسمية
  LASER_QR            // دمغة ليزر بـ QR
  IMPORTED            // دمغة مستوردة
  NONE                // بدون دمغة
}

enum GoldVerificationStatus {
  PENDING           // في انتظار الفحص
  VERIFIED          // تم التحقق
  REJECTED          // مرفوض
  REQUIRES_RECHECK  // يحتاج فحص إضافي
}

model GoldProduct {
  id                  String              @id @default(uuid())
  
  // Basic Information
  type                GoldProductType
  karat               GoldKarat
  condition           GoldCondition
  
  // Weight & Purity
  grossWeight         Float               // الوزن الإجمالي (جرام)
  netWeight           Float               // الوزن الصافي (بعد خصم الفصوص/الشوائب)
  purityPercentage    Float               // نسبة النقاء الفعلية (من XRF)
  
  // Pricing Components
  baseGoldPrice       Float               // سعر الذهب الخام للجرام (من API)
  workmanshipFee      Float               // المصنعية للجرام
  totalWorkmanship    Float               // إجمالي المصنعية
  damghaFee           Float               // رسوم الدمغة
  vat                 Float               // ضريبة القيمة المضافة (14% على المصنعية)
  finalPrice          Float               // السعر النهائي
  
  // Buyback/Trade-in Info
  buybackPrice        Float?              // سعر إعادة الشراء المضمون
  buybackExpiry       DateTime?           // تاريخ انتهاء ضمان إعادة الشراء
  
  // Description
  title               String
  titleAr             String
  description         String?
  descriptionAr       String?
  
  // Damgha Information
  damghaType          DamghaType
  damghaNumber        String?             // رقم الدمغة
  damghaQRCode        String?             // QR Code للدمغة الليزر
  damghaYear          Int?                // سنة الدمغ
  manufacturerCode    String?             // رمز الشركة المصنعة
  
  // Verification
  verificationStatus  GoldVerificationStatus @default(PENDING)
  xrfTestResult       Json?               // نتيجة فحص XRF كاملة
  xrfTestedAt         DateTime?
  xrfTestedBy         String?             // User ID
  certificateNumber   String?             @unique // رقم شهادة الأصالة
  
  // Images & Documentation
  images              String[]            // Array of image URLs
  certificateImage    String?             // صورة الشهادة
  damghaImage         String?             // صورة الدمغة عن قرب
  
  // Gems & Stones (for jewelry)
  hasGems             Boolean             @default(false)
  gemsDetails         Json?               // {type, weight, value, count}
  gemsNotIncluded     Boolean             @default(true) // الفصوص لا تحسب في إعادة البيع
  
  // Stock & Availability
  quantity            Int                 @default(1)
  isAvailable         Boolean             @default(true)
  reservedUntil       DateTime?
  
  // Seller Information
  sellerId            String
  seller              User                @relation("GoldSeller", fields: [sellerId], references: [id])
  
  // Relationships
  category            GoldCategory        @relation(fields: [categoryId], references: [id])
  categoryId          String
  
  barterListings      BarterListing[]     // قوائم المقايضة
  orders              OrderItem[]
  reviews             Review[]
  
  // Timestamps
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  
  @@index([karat])
  @@index([type])
  @@index([condition])
  @@index([verificationStatus])
  @@index([sellerId])
}

model GoldCategory {
  id              String          @id @default(uuid())
  name            String
  nameAr          String
  slug            String          @unique
  description     String?
  descriptionAr   String?
  
  // Category specifics
  allowedKarats   GoldKarat[]     // العيارات المسموحة في هذه الفئة
  allowedTypes    GoldProductType[]
  
  products        GoldProduct[]
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

// ============================================
// GOLD PRICING SYSTEM
// ============================================

model GoldPriceHistory {
  id              String          @id @default(uuid())
  
  // Market Prices (from API)
  karat24Price    Float           // سعر عيار 24 (جنيه/جرام)
  karat21Price    Float           // سعر عيار 21
  karat18Price    Float           // سعر عيار 18
  karat14Price    Float           // سعر عيار 14
  
  // International Reference
  goldOunceUSD    Float           // سعر الأونصة عالمياً بالدولار
  usdToEGP        Float           // سعر صرف الدولار/جنيه
  
  // Spread (الفرق بين البيع والشراء)
  buySpread       Float           // هامش الشراء (جنيه/جرام)
  sellSpread      Float           // هامش البيع
  
  // Source
  source          String          // API source (e.g., "metals-api")
  
  timestamp       DateTime        @default(now())
  
  @@index([timestamp])
}

model WorkmanshipFeeTemplate {
  id              String          @id @default(uuid())
  
  name            String
  nameAr          String
  description     String?
  
  // Applicable to
  productType     GoldProductType
  minWeight       Float?          // الحد الأدنى للوزن
  maxWeight       Float?          // الحد الأقصى
  
  // Fee Structure
  feeType         String          // "FIXED" or "PERCENTAGE" or "WEIGHT_BASED"
  fixedFee        Float?          // رسم ثابت بالجنيه
  percentageFee   Float?          // نسبة من قيمة الذهب
  perGramFee      Float?          // رسم لكل جرام
  
  isActive        Boolean         @default(true)
  
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

// ============================================
// GOLD BARTER SYSTEM (المقايضة)
// ============================================

enum BarterType {
  GOLD_TO_GOLD        // ذهب مقابل ذهب
  GOLD_TO_MOBILE      // ذهب مقابل موبايل
  GOLD_TO_CAR         // ذهب مقابل سيارة
  GOLD_TO_SCRAP       // ذهب مقابل خردة
  MOBILE_TO_GOLD      // موبايل مقابل ذهب
  CAR_TO_GOLD         // سيارة مقابل ذهب
}

enum BarterStatus {
  PENDING             // في انتظار الموافقة
  ACCEPTED            // مقبول من الطرف الآخر
  COUNTER_OFFERED     // عرض مضاد
  NEGOTIATING         // في مرحلة التفاوض
  AGREED              // اتفاق نهائي
  COMPLETED           // تم التنفيذ
  CANCELLED           // ملغي
  EXPIRED             // منتهي
}

model BarterListing {
  id                  String          @id @default(uuid())
  
  barterType          BarterType
  status              BarterStatus    @default(PENDING)
  
  // What user is offering
  offeringUserId      String
  offeringUser        User            @relation("BarterOffering", fields: [offeringUserId], references: [id])
  
  // Gold items offered
  goldItemsOffered    GoldProduct[]   @relation("OfferedGold")
  totalGoldValue      Float           // القيمة الإجمالية للذهب المعروض
  
  // What user wants in return
  seekingItemType     String          // "GOLD", "MOBILE", "CAR", "SCRAP"
  seekingItemId       String?         // ID of specific item if any
  seekingValue        Float           // القيمة المطلوبة
  seekingDescription  String?
  
  // Price difference to be paid
  priceDifference     Float           // الفرق السعري (+ or -)
  payerUserId         String?         // من سيدفع الفرق
  
  // Counterparty (if matched)
  counterpartyId      String?
  counterparty        User?           @relation("BarterCounterparty", fields: [counterpartyId], references: [id])
  
  // Negotiation history
  negotiations        BarterNegotiation[]
  
  // Expiry
  expiresAt           DateTime
  
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  
  @@index([barterType])
  @@index([status])
  @@index([offeringUserId])
}

model BarterNegotiation {
  id              String          @id @default(uuid())
  
  barterId        String
  barter          BarterListing   @relation(fields: [barterId], references: [id])
  
  userId          String
  user            User            @relation(fields: [userId], references: [id])
  
  message         String?
  proposedValue   Float?          // القيمة المقترحة
  
  createdAt       DateTime        @default(now())
  
  @@index([barterId])
}

// ============================================
// GOLD SAVINGS PROGRAM (برنامج الادخار)
// ============================================

enum SavingsPlanStatus {
  ACTIVE
  PAUSED
  COMPLETED
  CANCELLED
}

model GoldSavingsPlan {
  id                  String              @id @default(uuid())
  
  userId              String
  user                User                @relation(fields: [userId], references: [id])
  
  // Plan Details
  targetGrams         Float               // الهدف بالجرامات
  targetKarat         GoldKarat
  monthlyAmount       Float               // المبلغ الشهري
  
  // Progress
  currentGrams        Float               @default(0)
  currentValue        Float               @default(0)
  
  status              SavingsPlanStatus   @default(ACTIVE)
  
  // Payment history
  payments            SavingsPayment[]
  
  // Completion
  completedAt         DateTime?
  deliveredAt         DateTime?
  
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  
  @@index([userId])
  @@index([status])
}

model SavingsPayment {
  id              String              @id @default(uuid())
  
  planId          String
  plan            GoldSavingsPlan     @relation(fields: [planId], references: [id])
  
  amount          Float               // المبلغ المدفوع
  goldPriceAtTime Float               // سعر الذهب وقت الدفع
  gramsAdded      Float               // الجرامات المضافة
  
  paymentMethod   String
  transactionId   String?
  
  paidAt          DateTime            @default(now())
  
  @@index([planId])
}

// ============================================
// VERIFICATION & AUTHENTICATION
// ============================================

model XRFTestResult {
  id                  String          @id @default(uuid())
  
  productId           String          @unique
  product             GoldProduct     @relation(fields: [productId], references: [id])
  
  // Test Details
  deviceModel         String          // e.g., "VR-T6"
  deviceSerialNumber  String
  
  // Results
  goldPercentage      Float           // نسبة الذهب
  silverPercentage    Float?
  copperPercentage    Float?
  otherMetals         Json?           // {zinc: 0.5, nickel: 0.2, etc}
  
  // Verification
  expectedKarat       GoldKarat
  actualKarat         Float           // القيراط الفعلي المحسوب
  karatMatch          Boolean         // هل يطابق المتوقع؟
  tolerance           Float           // هامش الخطأ
  
  // Test metadata
  testedBy            String          // User ID of technician
  testLocation        String?
  notes               String?
  
  // Images
  testResultImage     String?         // صورة شاشة الجهاز
  
  testedAt            DateTime        @default(now())
  
  @@index([productId])
}

model AuthenticationCertificate {
  id                  String          @id @default(uuid())
  
  certificateNumber   String          @unique
  
  productId           String
  product             GoldProduct     @relation(fields: [productId], references: [id])
  
  // Certificate details
  issuer              String          // "Xchange Egypt"
  issueDate           DateTime        @default(now())
  expiryDate          DateTime?
  
  // Blockchain reference (future)
  blockchainHash      String?
  blockchainTxId      String?
  
  // QR Code
  qrCodeUrl           String
  
  // PDF
  pdfUrl              String?
  
  isActive            Boolean         @default(true)
  
  createdAt           DateTime        @default(now())
  
  @@index([certificateNumber])
}

// ============================================
// INSURANCE & PROTECTION
// ============================================

enum InsuranceStatus {
  ACTIVE
  EXPIRED
  CLAIMED
  CANCELLED
}

model GoldInsurance {
  id                  String              @id @default(uuid())
  
  productId           String
  product             GoldProduct         @relation(fields: [productId], references: [id])
  
  userId              String
  user                User                @relation(fields: [userId], references: [id])
  
  // Coverage
  insuredValue        Float
  premium             Float               // قسط التأمين
  coverageType        String              // "THEFT", "LOSS", "DAMAGE", "ALL"
  
  // Period
  startDate           DateTime
  endDate             DateTime
  
  status              InsuranceStatus     @default(ACTIVE)
  
  // Provider
  insuranceProvider   String?
  policyNumber        String?
  
  // Claims
  claims              InsuranceClaim[]
  
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  
  @@index([userId])
  @@index([status])
}

model InsuranceClaim {
  id              String          @id @default(uuid())
  
  insuranceId     String
  insurance       GoldInsurance   @relation(fields: [insuranceId], references: [id])
  
  claimType       String          // "THEFT", "LOSS", "DAMAGE"
  claimAmount     Float
  description     String
  
  // Documentation
  policeReport    String?         // رابط بلاغ الشرطة
  evidenceImages  String[]
  
  // Status
  status          String          // "SUBMITTED", "UNDER_REVIEW", "APPROVED", "REJECTED", "PAID"
  reviewedBy      String?
  reviewNotes     String?
  
  paidAmount      Float?
  paidAt          DateTime?
  
  claimedAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
  
  @@index([insuranceId])
}

// ============================================
// USER EXTENSIONS FOR GOLD
// ============================================

model User {
  // ... existing user fields ...
  
  // Gold-specific
  goldProductsSelling     GoldProduct[]       @relation("GoldSeller")
  barterListingsOffering  BarterListing[]     @relation("BarterOffering")
  barterListingsReceived  BarterListing[]     @relation("BarterCounterparty")
  barterNegotiations      BarterNegotiation[]
  savingsPlans            GoldSavingsPlan[]
  goldInsurances          GoldInsurance[]
  
  // Verification level for gold trades
  goldTraderVerified      Boolean             @default(false)
  goldTraderLevel         String?             // "BASIC", "VERIFIED", "PREMIUM"
  totalGoldTradeValue     Float               @default(0)
  
  // Preferences
  preferredKarat          GoldKarat?
  notifyPriceAlerts       Boolean             @default(false)
  priceAlertThreshold     Float?              // يُنبه عند الوصول لهذا السعر
}

```

---

## 2. API ENDPOINTS DOCUMENTATION {#api-endpoints}

### 2.1 Gold Pricing APIs

#### GET /api/gold/prices/current
**الحصول على الأسعار الحالية لكل العيارات**

```typescript
// Request
GET /api/gold/prices/current

// Response
{
  "success": true,
  "data": {
    "karat24": {
      "buy": 4265,
      "sell": 4245,
      "spread": 20
    },
    "karat21": {
      "buy": 3740,
      "sell": 3720,
      "spread": 20
    },
    "karat18": {
      "buy": 3199,
      "sell": 3180,
      "spread": 19
    },
    "karat14": {
      "buy": 2488,
      "sell": 2470,
      "spread": 18
    },
    "goldOunceUSD": 2025.50,
    "usdToEGP": 49.85,
    "lastUpdated": "2024-12-14T10:30:00Z",
    "source": "metals-api"
  }
}
```

#### POST /api/gold/prices/calculate
**حساب السعر النهائي لقطعة ذهب**

```typescript
// Request
POST /api/gold/prices/calculate
{
  "karat": "K21",
  "grossWeight": 10.5,        // جرام
  "netWeight": 10.2,           // بعد خصم الفصوص
  "workmanshipType": "CUSTOM", // or "STANDARD"
  "workmanshipFeePerGram": 100,
  "hasGems": true,
  "gemsValue": 500,
  "includeVAT": true
}

// Response
{
  "success": true,
  "data": {
    "baseGoldPrice": 3740,
    "goldValue": 38148,           // 10.2 * 3740
    "workmanshipTotal": 1020,     // 10.2 * 100
    "vat": 142.80,                // 14% on workmanship
    "gemsValue": 500,
    "damghaFee": 25,
    "subtotal": 39835.80,
    "finalPrice": 39835.80,
    "breakdown": {
      "goldComponent": 38148,
      "workmanship": 1020,
      "taxes": 142.80,
      "fees": 25,
      "gems": 500
    }
  }
}
```

#### GET /api/gold/prices/history
**تاريخ الأسعار**

```typescript
// Request
GET /api/gold/prices/history?karat=K21&days=30

// Response
{
  "success": true,
  "data": [
    {
      "date": "2024-12-14",
      "price": 3740,
      "high": 3760,
      "low": 3720,
      "volume": 1250  // عدد المعاملات
    },
    // ... more days
  ],
  "stats": {
    "highest": 3820,
    "lowest": 3650,
    "average": 3720,
    "volatility": 2.3  // نسبة التقلب
  }
}
```

---

### 2.2 Product Management APIs

#### POST /api/gold/products
**إضافة منتج ذهبي جديد**

```typescript
// Request
POST /api/gold/products
Headers: { Authorization: "Bearer <token>" }
Body: {
  "type": "BULLION",
  "karat": "K24",
  "condition": "NEW",
  "grossWeight": 10.0,
  "netWeight": 10.0,
  "title": "Egypt Gold 10g Bullion Bar",
  "titleAr": "سبيكة ذهب مصرية 10 جرام",
  "description": "24K pure gold bullion bar with certificate",
  "damghaType": "EGYPTIAN_OFFICIAL",
  "damghaNumber": "12345678",
  "workmanshipFee": 20,
  "quantity": 5,
  "categoryId": "cat-bullion-001",
  "images": [
    "https://cdn.xchange.eg/gold/bullion-front.jpg",
    "https://cdn.xchange.eg/gold/bullion-back.jpg"
  ]
}

// Response
{
  "success": true,
  "data": {
    "id": "gold-prod-001",
    "type": "BULLION",
    "karat": "K24",
    "finalPrice": 42770,  // auto-calculated
    "verificationStatus": "PENDING",
    "certificateNumber": null,
    "createdAt": "2024-12-14T10:45:00Z"
  },
  "message": "Product created successfully. Awaiting XRF verification."
}
```

#### GET /api/gold/products
**قائمة المنتجات مع فلترة وترتيب**

```typescript
// Request
GET /api/gold/products?karat=K21&type=JEWELRY&minWeight=5&maxWeight=20&sort=price_asc&page=1&limit=20

// Response
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "gold-prod-123",
        "type": "JEWELRY",
        "karat": "K21",
        "condition": "NEW",
        "netWeight": 8.5,
        "finalPrice": 32500,
        "title": "Gold Chain Necklace",
        "images": ["..."],
        "verificationStatus": "VERIFIED",
        "seller": {
          "id": "user-456",
          "name": "Ahmed Jewelers",
          "rating": 4.8
        }
      },
      // ... more products
    ],
    "pagination": {
      "total": 156,
      "page": 1,
      "limit": 20,
      "pages": 8
    },
    "filters": {
      "applied": {
        "karat": "K21",
        "type": "JEWELRY"
      },
      "available": {
        "karats": ["K24", "K21", "K18"],
        "types": ["JEWELRY", "BULLION", "COIN"],
        "priceRange": { "min": 5000, "max": 150000 }
      }
    }
  }
}
```

#### GET /api/gold/products/:id
**تفاصيل منتج واحد**

```typescript
// Response
{
  "success": true,
  "data": {
    "id": "gold-prod-123",
    "type": "JEWELRY",
    "karat": "K21",
    "condition": "NEW",
    "grossWeight": 8.7,
    "netWeight": 8.5,
    "purityPercentage": 87.5,
    "baseGoldPrice": 3740,
    "workmanshipFee": 120,
    "totalWorkmanship": 1020,
    "damghaFee": 25,
    "vat": 142.80,
    "finalPrice": 32950.80,
    "buybackPrice": 31000,
    "buybackExpiry": "2025-12-14T00:00:00Z",
    "title": "Gold Chain Necklace 21K",
    "description": "Beautiful handcrafted chain...",
    "damghaType": "EGYPTIAN_OFFICIAL",
    "damghaNumber": "87654321",
    "verificationStatus": "VERIFIED",
    "xrfTestResult": {
      "goldPercentage": 87.5,
      "silverPercentage": 10.2,
      "copperPercentage": 2.3,
      "testedAt": "2024-12-10T14:30:00Z"
    },
    "certificateNumber": "XCH-GOLD-2024-000123",
    "images": ["url1", "url2", "url3"],
    "certificateImage": "cert-url",
    "quantity": 1,
    "seller": {
      "id": "user-456",
      "name": "Ahmed Jewelers",
      "rating": 4.8,
      "totalGoldSales": 245,
      "goldTraderLevel": "PREMIUM"
    },
    "category": {
      "id": "cat-necklaces",
      "name": "Necklaces",
      "nameAr": "سلاسل"
    },
    "reviews": {
      "average": 4.9,
      "count": 12
    },
    "createdAt": "2024-12-01T09:00:00Z"
  }
}
```

---

### 2.3 XRF Verification APIs

#### POST /api/gold/verify/xrf
**تسجيل نتيجة فحص XRF**

```typescript
// Request
POST /api/gold/verify/xrf
Headers: { Authorization: "Bearer <technician_token>" }
Body: {
  "productId": "gold-prod-123",
  "deviceModel": "VR-T6",
  "deviceSerialNumber": "XRF-2024-001",
  "goldPercentage": 87.48,
  "silverPercentage": 10.15,
  "copperPercentage": 2.37,
  "otherMetals": {
    "zinc": 0.0,
    "nickel": 0.0
  },
  "testLocation": "Xchange Lab - Cairo",
  "notes": "Consistent readings across 3 tests",
  "testResultImage": "https://cdn.xchange.eg/xrf-results/test-123.jpg"
}

// Response
{
  "success": true,
  "data": {
    "testId": "xrf-test-001",
    "productId": "gold-prod-123",
    "expectedKarat": "K21",
    "actualKarat": 20.99,
    "karatMatch": true,
    "tolerance": 0.01,
    "verificationStatus": "VERIFIED",
    "certificateGenerated": true,
    "certificateNumber": "XCH-GOLD-2024-000123",
    "testedAt": "2024-12-14T11:00:00Z"
  },
  "message": "Product verified successfully. Certificate issued."
}
```

#### GET /api/gold/verify/certificate/:certificateNumber
**التحقق من شهادة الأصالة**

```typescript
// Request
GET /api/gold/verify/certificate/XCH-GOLD-2024-000123

// Response
{
  "success": true,
  "data": {
    "certificateNumber": "XCH-GOLD-2024-000123",
    "productId": "gold-prod-123",
    "issuedDate": "2024-12-14T11:05:00Z",
    "expiryDate": null,
    "status": "ACTIVE",
    "product": {
      "type": "JEWELRY",
      "karat": "K21",
      "weight": 8.5,
      "damghaNumber": "87654321"
    },
    "verification": {
      "xrfTested": true,
      "actualPurity": 87.48,
      "testedAt": "2024-12-14T11:00:00Z"
    },
    "qrCodeUrl": "https://cdn.xchange.eg/qr/cert-123.png",
    "pdfUrl": "https://cdn.xchange.eg/certs/cert-123.pdf",
    "blockchainVerified": false
  }
}
```

---

### 2.4 Barter (المقايضة) APIs

#### POST /api/gold/barter/create
**إنشاء عرض مقايضة**

```typescript
// Request
POST /api/gold/barter/create
Headers: { Authorization: "Bearer <token>" }
Body: {
  "barterType": "GOLD_TO_MOBILE",
  "goldItemsOffered": ["gold-prod-123", "gold-prod-456"],
  "seekingItemType": "MOBILE",
  "seekingItemId": "mobile-prod-789",  // optional
  "seekingValue": 35000,
  "seekingDescription": "iPhone 15 Pro 256GB or equivalent",
  "expiresInDays": 7
}

// Response
{
  "success": true,
  "data": {
    "id": "barter-001",
    "barterType": "GOLD_TO_MOBILE",
    "status": "PENDING",
    "totalGoldValue": 38500,
    "seekingValue": 35000,
    "priceDifference": -3500,  // user will receive 3500 EGP extra
    "payerUserId": null,  // other party pays
    "expiresAt": "2024-12-21T11:30:00Z",
    "createdAt": "2024-12-14T11:30:00Z"
  },
  "message": "Barter listing created. Waiting for matching offers."
}
```

#### GET /api/gold/barter/matches
**العثور على عروض مطابقة**

```typescript
// Request
GET /api/gold/barter/matches?barterType=MOBILE_TO_GOLD&myItemValue=35000

// Response
{
  "success": true,
  "data": {
    "matches": [
      {
        "barterId": "barter-001",
        "offeredBy": {
          "id": "user-123",
          "name": "Mohamed Ali",
          "rating": 4.7
        },
        "goldItemsOffered": [
          {
            "id": "gold-prod-123",
            "karat": "K21",
            "weight": 8.5,
            "value": 32000
          }
        ],
        "totalValue": 38500,
        "priceDifference": 3500,
        "matchScore": 95,  // نسبة المطابقة
        "expiresAt": "2024-12-21T11:30:00Z"
      },
      // ... more matches
    ],
    "totalMatches": 3
  }
}
```

#### POST /api/gold/barter/:id/accept
**قبول عرض مقايضة**

```typescript
// Request
POST /api/gold/barter/barter-001/accept
Headers: { Authorization: "Bearer <token>" }
Body: {
  "myItemId": "mobile-prod-789",
  "agreeToTerms": true
}

// Response
{
  "success": true,
  "data": {
    "barterId": "barter-001",
    "status": "ACCEPTED",
    "nextSteps": [
      "Both parties must verify items",
      "Schedule inspection appointment",
      "Complete exchange at Xchange location"
    ],
    "escrowInitiated": true,
    "inspectionDeadline": "2024-12-17T23:59:59Z"
  },
  "message": "Barter accepted. Escrow initiated for both items."
}
```

#### POST /api/gold/barter/:id/negotiate
**التفاوض على عرض**

```typescript
// Request
POST /api/gold/barter/barter-001/negotiate
Headers: { Authorization: "Bearer <token>" }
Body: {
  "proposedValue": 36000,
  "message": "Can you add 1000 EGP to balance the trade?"
}

// Response
{
  "success": true,
  "data": {
    "negotiationId": "neg-001",
    "barterId": "barter-001",
    "status": "NEGOTIATING",
    "yourProposal": 36000,
    "currentDifference": 2500,
    "awaitingResponse": true
  }
}
```

---

### 2.5 Gold Savings Program APIs

#### POST /api/gold/savings/plans
**إنشاء خطة ادخار ذهب**

```typescript
// Request
POST /api/gold/savings/plans
Headers: { Authorization: "Bearer <token>" }
Body: {
  "targetGrams": 20,
  "targetKarat": "K21",
  "monthlyAmount": 3000
}

// Response
{
  "success": true,
  "data": {
    "planId": "savings-001",
    "targetGrams": 20,
    "targetKarat": "K21",
    "monthlyAmount": 3000,
    "estimatedCompletionMonths": 25,  // based on current price
    "currentGrams": 0,
    "currentValue": 0,
    "status": "ACTIVE",
    "nextPaymentDue": "2025-01-14T00:00:00Z"
  },
  "message": "Savings plan created successfully."
}
```

#### POST /api/gold/savings/plans/:id/pay
**إضافة دفعة لخطة الادخار**

```typescript
// Request
POST /api/gold/savings/plans/savings-001/pay
Headers: { Authorization: "Bearer <token>" }
Body: {
  "amount": 3000,
  "paymentMethod": "CARD"
}

// Response
{
  "success": true,
  "data": {
    "paymentId": "pay-001",
    "amount": 3000,
    "goldPriceAtTime": 3740,
    "gramsAdded": 0.802,  // 3000 / 3740
    "planProgress": {
      "currentGrams": 0.802,
      "targetGrams": 20,
      "percentComplete": 4.01,
      "remainingGrams": 19.198
    },
    "nextPaymentDue": "2025-02-14T00:00:00Z"
  }
}
```

#### GET /api/gold/savings/plans/:id
**تفاصيل خطة الادخار**

```typescript
// Response
{
  "success": true,
  "data": {
    "planId": "savings-001",
    "targetGrams": 20,
    "targetKarat": "K21",
    "currentGrams": 12.5,
    "currentValue": 46750,  // based on today's price
    "percentComplete": 62.5,
    "status": "ACTIVE",
    "payments": [
      {
        "date": "2024-12-14",
        "amount": 3000,
        "goldPrice": 3740,
        "gramsAdded": 0.802
      },
      // ... more payments
    ],
    "totalPaid": 45000,
    "averagePurchasePrice": 3600,
    "currentMarketPrice": 3740,
    "unrealizedGain": 1750,  // (3740 - 3600) * 12.5
    "estimatedCompletionDate": "2025-10-14"
  }
}
```

---

### 2.6 Buyback & Trade-in APIs

#### POST /api/gold/buyback/quote
**الحصول على عرض سعر لإعادة شراء**

```typescript
// Request
POST /api/gold/buyback/quote
Body: {
  "karat": "K21",
  "weight": 10.5,
  "condition": "GOOD",
  "hasDamgha": true,
  "hasGems": false,
  "photos": [
    "https://cdn.xchange.eg/user-uploads/gold-1.jpg",
    "https://cdn.xchange.eg/user-uploads/gold-2.jpg"
  ]
}

// Response
{
  "success": true,
  "data": {
    "quoteId": "quote-001",
    "estimatedValue": {
      "min": 36000,
      "max": 38500,
      "average": 37250
    },
    "breakdown": {
      "goldValue": 39270,  // 10.5 * 3740
      "conditionDiscount": -2020,  // 5% for GOOD condition
      "finalOffer": 37250
    },
    "validUntil": "2024-12-15T11:45:00Z",
    "nextSteps": [
      "Schedule XRF verification appointment",
      "Bring item to Xchange location",
      "Receive final offer after inspection"
    ]
  },
  "message": "Quote valid for 24 hours. Price may change based on market."
}
```

#### POST /api/gold/buyback/:quoteId/accept
**قبول عرض إعادة الشراء وجدولة موعد**

```typescript
// Request
POST /api/gold/buyback/quote-001/accept
Headers: { Authorization: "Bearer <token>" }
Body: {
  "preferredDate": "2024-12-16",
  "preferredTime": "14:00",
  "location": "Xchange Cairo Branch"
}

// Response
{
  "success": true,
  "data": {
    "appointmentId": "appt-001",
    "quoteId": "quote-001",
    "date": "2024-12-16T14:00:00Z",
    "location": {
      "name": "Xchange Cairo Branch",
      "address": "123 Tahrir Square, Cairo",
      "phone": "+20 2 1234 5678"
    },
    "estimatedDuration": "30 minutes",
    "whatToBring": [
      "Original gold item",
      "National ID",
      "Purchase receipt (if available)",
      "Damgha certificate (if available)"
    ]
  }
}
```

---

## 3. USER STORIES التفصيلية {#user-stories}

### Story 1: بائع يريد بيع ذهب قديم

**As a** gold seller  
**I want to** sell my old gold jewelry  
**So that** I can get cash at fair market price

**Acceptance Criteria:**
1. User uploads photos of gold item
2. User enters basic details (karat, approximate weight, condition)
3. System provides instant price estimate
4. User schedules XRF verification appointment
5. After verification, system generates final offer
6. User accepts offer
7. Payment processed within 24 hours

**Technical Flow:**
```
POST /api/gold/buyback/quote
  → AI estimates condition from photos
  → Calculate price range based on current market
  → Generate quote valid for 24h
  
POST /api/gold/buyback/:quoteId/accept
  → Create appointment
  → Send calendar invite + SMS reminder
  
[At appointment]
POST /api/gold/verify/xrf
  → Technician performs XRF test
  → System calculates final offer
  → If accepted: Create transaction
  
POST /api/gold/buyback/:id/complete
  → Release payment
  → Update inventory
  → Issue receipt
```

---

### Story 2: مشتري يريد شراء سبائك ذهب للاستثمار

**As a** first-time gold investor  
**I want to** buy gold bullion bars safely  
**So that** I can protect my savings from inflation

**Acceptance Criteria:**
1. User browses verified gold bullion inventory
2. User sees transparent pricing breakdown
3. User can compare prices across different weights
4. User receives authentication certificate with QR
5. User can opt for insured delivery or pickup
6. User receives proof of purchase for tax purposes

**Technical Flow:**
```
GET /api/gold/products?type=BULLION&karat=K24&sort=price_asc
  → Display verified inventory only
  → Show XRF test results
  
GET /api/gold/products/:id
  → Full details with certificate preview
  
POST /api/orders/create
  → Escrow payment
  → Schedule delivery/pickup
  
POST /api/gold/verify/certificate/generate
  → Create blockchain-backed certificate
  → Generate QR code
  → Send digital copy to user
  
POST /api/orders/:id/complete
  → Release payment to seller
  → Transfer certificate ownership
  → Send tax invoice
```

---

### Story 3: مستخدم يريد مقايضة ذهب قديم بموبايل جديد

**As a** user with old gold jewelry  
**I want to** trade it for a new mobile phone  
**So that** I avoid selling gold and then buying mobile separately

**Acceptance Criteria:**
1. User creates barter listing with gold item(s)
2. User specifies desired mobile model or price range
3. System finds matching offers from mobile sellers
4. Both parties verify items at Xchange location
5. System calculates price difference (if any)
6. Exchange completed with escrow protection

**Technical Flow:**
```
POST /api/gold/barter/create
  {
    "barterType": "GOLD_TO_MOBILE",
    "goldItemsOffered": ["gold-123"],
    "seekingItemType": "MOBILE",
    "seekingDescription": "iPhone 15 Pro 256GB"
  }
  → System calculates gold value
  → Creates listing with 7-day expiry
  
GET /api/gold/barter/matches?barterType=MOBILE_TO_GOLD
  → Mobile sellers see matching opportunities
  
POST /api/gold/barter/:id/accept
  → Both items go into escrow
  → Schedule inspection appointment
  
[At appointment]
POST /api/gold/verify/xrf (for gold)
POST /api/mobile/verify/imei (for phone)
  → If both verified: Complete barter
  → Transfer ownership
  → Release any price difference payment
```

---

### Story 4: مستخدم يبدأ برنامج ادخار ذهب شهري

**As a** salaried employee  
**I want to** save for gold gradually  
**So that** I can accumulate grams without large upfront cost

**Acceptance Criteria:**
1. User sets target grams and karat
2. User chooses monthly payment amount
3. System calculates estimated completion time
4. Auto-debit every month on chosen date
5. User can see accumulated grams in real-time
6. User can withdraw physical gold anytime after reaching minimum (e.g., 5 grams)
7. User sees unrealized gains/losses

**Technical Flow:**
```
POST /api/gold/savings/plans
  {
    "targetGrams": 20,
    "targetKarat": "K21",
    "monthlyAmount": 3000
  }
  → Calculate estimated completion
  → Set up recurring payment
  
[Every month]
POST /api/gold/savings/plans/:id/pay
  → Deduct payment
  → Get current gold price from API
  → Calculate grams purchased
  → Update plan progress
  → Send summary SMS/email
  
GET /api/gold/savings/plans/:id
  → Show current value at today's price
  → Show unrealized gain/loss
  
POST /api/gold/savings/plans/:id/withdraw
  → User requests physical delivery
  → System allocates nearest gram quantities
  → Schedule delivery
```

---

### Story 5: محل ذهب يريد بيع مخزونه على Xchange

**As a** jewelry store owner  
**I want to** list my inventory on Xchange  
**So that** I can reach more customers online

**Acceptance Criteria:**
1. Store owner registers as business account
2. Uploads bulk inventory via CSV
3. Each item gets XRF verified by Xchange
4. Items appear with "Verified Seller" badge
5. Store receives orders in dashboard
6. Can offer special promotions/discounts

**Technical Flow:**
```
POST /api/sellers/register
  → KYC for business
  → Upload commercial registration
  → Get verified seller status
  
POST /api/gold/products/bulk
  → Upload CSV with products
  → System validates data
  → Creates products in PENDING status
  
[Xchange team schedules visit]
POST /api/gold/verify/xrf (for each item)
  → Batch XRF testing
  → Update status to VERIFIED
  → Products go live
  
GET /api/sellers/dashboard
  → See orders, inventory, analytics
  
POST /api/promotions/create
  → Create time-limited offers
  → System applies discounts automatically
```

---

## 4. INTEGRATION GUIDES {#integration-guides}

### 4.1 Metals-API Integration (أسعار الذهب الفورية)

**Provider:** https://metals-api.com  
**Update Frequency:** Every 60 seconds  
**Cost:** Free tier: 100 requests/month, Paid: $19/month for 10,000 requests

#### Setup

```javascript
// services/goldPriceService.js

const METALS_API_KEY = process.env.METALS_API_KEY;
const BASE_URL = 'https://metals-api.com/api';

async function getCurrentGoldPrice() {
  try {
    const response = await fetch(
      `${BASE_URL}/latest?access_key=${METALS_API_KEY}&base=XAU&symbols=EGP`
    );
    
    const data = await response.json();
    
    if (!data.success) {
      throw new Error('Metals API error: ' + data.error.info);
    }
    
    // Gold price is in troy ounce, convert to gram
    const goldPricePerOunce = 1 / data.rates.EGP;
    const goldPricePerGram = goldPricePerOunce / 31.1035;
    
    // Calculate different karats
    const karat24 = goldPricePerGram;
    const karat21 = goldPricePerGram * (21/24);
    const karat18 = goldPricePerGram * (18/24);
    const karat14 = goldPricePerGram * (14/24);
    
    // Add spread (buying is higher, selling is lower)
    const SPREAD = 20; // EGP per gram
    
    return {
      karat24: {
        buy: Math.round(karat24 + SPREAD),
        sell: Math.round(karat24),
        spread: SPREAD
      },
      karat21: {
        buy: Math.round(karat21 + SPREAD),
        sell: Math.round(karat21),
        spread: SPREAD
      },
      karat18: {
        buy: Math.round(karat18 + SPREAD),
        sell: Math.round(karat18),
        spread: SPREAD
      },
      karat14: {
        buy: Math.round(karat14 + SPREAD),
        sell: Math.round(karat14),
        spread: SPREAD
      },
      goldOunceUSD: goldPricePerOunce,
      lastUpdated: new Date().toISOString(),
      source: 'metals-api'
    };
  } catch (error) {
    console.error('Error fetching gold price:', error);
    throw error;
  }
}

// Cache price for 60 seconds to avoid hitting API limits
let cachedPrice = null;
let cacheExpiry = null;

async function getGoldPrice() {
  if (cachedPrice && cacheExpiry && Date.now() < cacheExpiry) {
    return cachedPrice;
  }
  
  cachedPrice = await getCurrentGoldPrice();
  cacheExpiry = Date.now() + 60000; // 60 seconds
  
  // Save to database
  await prisma.goldPriceHistory.create({
    data: {
      karat24Price: cachedPrice.karat24.buy,
      karat21Price: cachedPrice.karat21.buy,
      karat18Price: cachedPrice.karat18.buy,
      karat14Price: cachedPrice.karat14.buy,
      goldOunceUSD: cachedPrice.goldOunceUSD,
      usdToEGP: cachedPrice.usdToEGP || 0,
      buySpread: cachedPrice.karat24.spread,
      sellSpread: cachedPrice.karat24.spread,
      source: 'metals-api'
    }
  });
  
  return cachedPrice;
}

module.exports = { getGoldPrice };
```

#### Webhook Setup (for real-time updates)

```javascript
// routes/webhooks/metalsApi.js

router.post('/metals-api/price-update', async (req, res) => {
  const { base, rates, timestamp } = req.body;
  
  if (base !== 'XAU') {
    return res.status(400).json({ error: 'Invalid base currency' });
  }
  
  // Process price update
  const goldPricePerGram = (1 / rates.EGP) / 31.1035;
  
  // Notify subscribed users about price alerts
  await notifyPriceAlerts(goldPricePerGram);
  
  res.json({ success: true });
});

async function notifyPriceAlerts(currentPrice) {
  // Find users with price alerts
  const users = await prisma.user.findMany({
    where: {
      notifyPriceAlerts: true,
      priceAlertThreshold: {
        lte: currentPrice
      }
    }
  });
  
  for (const user of users) {
    await sendPriceAlertNotification(user, currentPrice);
  }
}
```

---

### 4.2 XRF Device Integration

**Recommended Device:** VR-T6 Desktop XRF Analyzer  
**Communication:** USB Serial Port or Bluetooth  
**Software:** Vendor SDK or custom serial communication

#### Driver Setup

```javascript
// services/xrfService.js

const SerialPort = require('serialport');
const Readline = require('@serialport/parser-readline');

class XRFService {
  constructor() {
    this.port = null;
    this.parser = null;
  }
  
  async connect(portPath = '/dev/ttyUSB0') {
    this.port = new SerialPort(portPath, {
      baudRate: 9600,
      dataBits: 8,
      parity: 'none',
      stopBits: 1
    });
    
    this.parser = this.port.pipe(new Readline({ delimiter: '\r\n' }));
    
    return new Promise((resolve, reject) => {
      this.port.on('open', () => {
        console.log('XRF device connected');
        resolve();
      });
      
      this.port.on('error', (err) => {
        console.error('XRF connection error:', err);
        reject(err);
      });
    });
  }
  
  async performTest(sampleId) {
    return new Promise((resolve, reject) => {
      let testData = '';
      
      // Send test command
      this.port.write('START_TEST\n');
      
      // Listen for results
      const timeout = setTimeout(() => {
        reject(new Error('XRF test timeout'));
      }, 120000); // 2 minutes
      
      this.parser.on('data', (line) => {
        testData += line + '\n';
        
        if (line.includes('TEST_COMPLETE')) {
          clearTimeout(timeout);
          
          // Parse results
          const results = this.parseXRFResults(testData);
          resolve(results);
        }
      });
    });
  }
  
  parseXRFResults(data) {
    // Example parsing (actual format depends on device)
    const goldMatch = data.match(/Au:\s*([\d.]+)%/);
    const silverMatch = data.match(/Ag:\s*([\d.]+)%/);
    const copperMatch = data.match(/Cu:\s*([\d.]+)%/);
    
    return {
      goldPercentage: goldMatch ? parseFloat(goldMatch[1]) : 0,
      silverPercentage: silverMatch ? parseFloat(silverMatch[1]) : 0,
      copperPercentage: copperMatch ? parseFloat(copperMatch[1]) : 0,
      rawData: data
    };
  }
  
  disconnect() {
    if (this.port && this.port.isOpen) {
      this.port.close();
    }
  }
}

module.exports = new XRFService();
```

#### API Integration

```javascript
// routes/verification.js

router.post('/gold/verify/xrf', authenticateTechnician, async (req, res) => {
  const {
    productId,
    deviceModel,
    deviceSerialNumber,
    testLocation,
    notes
  } = req.body;
  
  try {
    // Get product
    const product = await prisma.goldProduct.findUnique({
      where: { id: productId }
    });
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Perform XRF test
    const xrfResults = await xrfService.performTest(productId);
    
    // Calculate actual karat
    const actualKarat = (xrfResults.goldPercentage / 100) * 24;
    
    // Expected karat for comparison
    const expectedKaratMap = {
      'K24': 24,
      'K21': 21,
      'K18': 18,
      'K14': 14
    };
    const expectedKarat = expectedKaratMap[product.karat];
    
    // Check tolerance (±0.5 karat)
    const karatMatch = Math.abs(actualKarat - expectedKarat) <= 0.5;
    
    // Save test result
    const testResult = await prisma.xRFTestResult.create({
      data: {
        productId,
        deviceModel,
        deviceSerialNumber,
        goldPercentage: xrfResults.goldPercentage,
        silverPercentage: xrfResults.silverPercentage,
        copperPercentage: xrfResults.copperPercentage,
        otherMetals: xrfResults.otherMetals || {},
        expectedKarat: product.karat,
        actualKarat,
        karatMatch,
        tolerance: Math.abs(actualKarat - expectedKarat),
        testedBy: req.user.id,
        testLocation,
        notes
      }
    });
    
    // Update product verification status
    const verificationStatus = karatMatch ? 'VERIFIED' : 'REJECTED';
    
    await prisma.goldProduct.update({
      where: { id: productId },
      data: {
        verificationStatus,
        purityPercentage: xrfResults.goldPercentage,
        xrfTestResult: xrfResults,
        xrfTestedAt: new Date(),
        xrfTestedBy: req.user.id
      }
    });
    
    // Generate certificate if verified
    let certificateNumber = null;
    if (karatMatch) {
      certificateNumber = await generateCertificate(productId);
    }
    
    res.json({
      success: true,
      data: {
        testId: testResult.id,
        productId,
        expectedKarat: product.karat,
        actualKarat: actualKarat.toFixed(2),
        karatMatch,
        tolerance: Math.abs(actualKarat - expectedKarat).toFixed(2),
        verificationStatus,
        certificateGenerated: karatMatch,
        certificateNumber,
        testedAt: new Date().toISOString()
      },
      message: karatMatch 
        ? 'Product verified successfully. Certificate issued.'
        : 'Product failed verification. Karat mismatch.'
    });
    
  } catch (error) {
    console.error('XRF verification error:', error);
    res.status(500).json({ error: 'Verification failed' });
  }
});
```

---

### 4.3 Certificate Generation with QR Code

```javascript
// services/certificateService.js

const QRCode = require('qrcode');
const PDFDocument = require('pdfkit');
const { Storage } = require('@google-cloud/storage');

async function generateCertificate(productId) {
  const product = await prisma.goldProduct.findUnique({
    where: { id: productId },
    include: {
      seller: true,
      category: true
    }
  });
  
  // Generate unique certificate number
  const certificateNumber = `XCH-GOLD-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000000)).padStart(6, '0')}`;
  
  // Generate QR code
  const qrData = JSON.stringify({
    certificateNumber,
    productId,
    karat: product.karat,
    weight: product.netWeight,
    verifiedAt: new Date().toISOString(),
    verifyUrl: `https://xchange.eg/verify/${certificateNumber}`
  });
  
  const qrCodeBuffer = await QRCode.toBuffer(qrData, {
    errorCorrectionLevel: 'H',
    type: 'png',
    width: 300
  });
  
  // Upload QR code
  const qrCodeUrl = await uploadToStorage(qrCodeBuffer, `qr/${certificateNumber}.png`);
  
  // Generate PDF certificate
  const pdfBuffer = await generateCertificatePDF(product, certificateNumber, qrCodeBuffer);
  const pdfUrl = await uploadToStorage(pdfBuffer, `certificates/${certificateNumber}.pdf`);
  
  // Save certificate to database
  await prisma.authenticationCertificate.create({
    data: {
      certificateNumber,
      productId,
      issuer: 'Xchange Egypt',
      qrCodeUrl,
      pdfUrl,
      isActive: true
    }
  });
  
  // Update product
  await prisma.goldProduct.update({
    where: { id: productId },
    data: {
      certificateNumber
    }
  });
  
  return certificateNumber;
}

async function generateCertificatePDF(product, certificateNumber, qrCodeBuffer) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4' });
    const buffers = [];
    
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfBuffer = Buffer.concat(buffers);
      resolve(pdfBuffer);
    });
    doc.on('error', reject);
    
    // Header
    doc.fontSize(24).text('شهادة أصالة ذهب', { align: 'center' });
    doc.fontSize(18).text('Gold Authentication Certificate', { align: 'center' });
    doc.moveDown();
    
    // Certificate number
    doc.fontSize(14).text(`رقم الشهادة / Certificate No: ${certificateNumber}`, { align: 'center' });
    doc.moveDown(2);
    
    // Product details
    doc.fontSize(12);
    doc.text(`النوع / Type: ${product.type}`);
    doc.text(`العيار / Karat: ${product.karat}`);
    doc.text(`الوزن الصافي / Net Weight: ${product.netWeight} جرام`);
    doc.text(`النقاء / Purity: ${product.purityPercentage}%`);
    doc.text(`الدمغة / Damgha: ${product.damghaNumber || 'N/A'}`);
    doc.moveDown();
    
    // XRF verification
    doc.text(`تم الفحص بجهاز XRF`);
    doc.text(`XRF Verified: ${new Date(product.xrfTestedAt).toLocaleDateString('ar-EG')}`);
    doc.moveDown();
    
    // QR Code
    doc.text('للتحقق / Verify:', { align: 'center' });
    doc.image(qrCodeBuffer, {
      fit: [150, 150],
      align: 'center'
    });
    
    // Footer
    doc.fontSize(10);
    doc.text('Xchange Egypt - Your Trusted Gold Marketplace', { align: 'center' });
    doc.text('www.xchange.eg', { align: 'center', link: 'https://xchange.eg' });
    
    doc.end();
  });
}

async function uploadToStorage(buffer, destination) {
  const storage = new Storage();
  const bucket = storage.bucket(process.env.GCS_BUCKET_NAME);
  const file = bucket.file(destination);
  
  await file.save(buffer, {
    metadata: {
      contentType: destination.endsWith('.pdf') ? 'application/pdf' : 'image/png'
    }
  });
  
  await file.makePublic();
  
  return `https://storage.googleapis.com/${process.env.GCS_BUCKET_NAME}/${destination}`;
}

module.exports = { generateCertificate };
```

---

## 5. BUSINESS LOGIC & ALGORITHMS {#business-logic}

### 5.1 Dynamic Pricing Algorithm

```javascript
// services/pricingService.js

/**
 * حساب السعر النهائي لمنتج ذهبي
 */
async function calculateGoldPrice(params) {
  const {
    karat,
    grossWeight,
    netWeight,
    workmanshipFeePerGram,
    hasGems = false,
    gemsValue = 0,
    condition = 'NEW',
    includeVAT = true
  } = params;
  
  // 1. Get current gold price
  const goldPrices = await getGoldPrice();
  const karatPriceMap = {
    'K24': goldPrices.karat24.buy,
    'K21': goldPrices.karat21.buy,
    'K18': goldPrices.karat18.buy,
    'K14': goldPrices.karat14.buy
  };
  
  const baseGoldPrice = karatPriceMap[karat];
  
  // 2. Calculate gold value (net weight only)
  const goldValue = netWeight * baseGoldPrice;
  
  // 3. Calculate workmanship
  const totalWorkmanship = netWeight * workmanshipFeePerGram;
  
  // 4. Damgha fee (fixed per piece)
  const damghaFee = 25;
  
  // 5. VAT (14% on workmanship only)
  const vat = includeVAT ? (totalWorkmanship * 0.14) : 0;
  
  // 6. Condition discount (for used items)
  const conditionDiscounts = {
    'NEW': 0,
    'EXCELLENT': 0.02,
    'GOOD': 0.05,
    'FAIR': 0.10,
    'SCRAP': 0.15
  };
  const conditionDiscount = goldValue * (conditionDiscounts[condition] || 0);
  
  // 7. Calculate final price
  const subtotal = goldValue - conditionDiscount + totalWorkmanship + damghaFee + vat + gemsValue;
  const finalPrice = Math.round(subtotal);
  
  return {
    baseGoldPrice,
    goldValue: Math.round(goldValue),
    workmanshipTotal: Math.round(totalWorkmanship),
    vat: Math.round(vat),
    damghaFee,
    gemsValue,
    conditionDiscount: Math.round(conditionDiscount),
    subtotal: Math.round(subtotal),
    finalPrice,
    breakdown: {
      goldComponent: Math.round(goldValue - conditionDiscount),
      workmanship: Math.round(totalWorkmanship),
      taxes: Math.round(vat),
      fees: damghaFee,
      gems: gemsValue
    }
  };
}

/**
 * حساب سعر إعادة الشراء (Buyback)
 */
function calculateBuybackPrice(params) {
  const {
    karat,
    netWeight,
    condition,
    hasDamgha,
    hasOriginalReceipt
  } = params;
  
  // Get sell price (lower than buy price)
  const goldPrices = getGoldPrice();
  const karatPriceMap = {
    'K24': goldPrices.karat24.sell,
    'K21': goldPrices.karat21.sell,
    'K18': goldPrices.karat18.sell,
    'K14': goldPrices.karat14.sell
  };
  
  const baseGoldPrice = karatPriceMap[karat];
  
  // Base value
  let buybackValue = netWeight * baseGoldPrice;
  
  // Condition penalty
  const conditionPenalties = {
    'NEW': 0,
    'EXCELLENT': 0.02,
    'GOOD': 0.05,
    'FAIR': 0.08,
    'SCRAP': 0.10
  };
  buybackValue *= (1 - (conditionPenalties[condition] || 0.05));
  
  // Damgha bonus (verified authenticity)
  if (hasDamgha) {
    buybackValue *= 1.01; // 1% bonus
  }
  
  // Original receipt bonus
  if (hasOriginalReceipt) {
    buybackValue *= 1.005; // 0.5% bonus
  }
  
  // Transaction fee (Xchange keeps 2%)
  buybackValue *= 0.98;
  
  return {
    estimatedValue: {
      min: Math.round(buybackValue * 0.95),
      max: Math.round(buybackValue * 1.05),
      average: Math.round(buybackValue)
    },
    breakdown: {
      baseValue: Math.round(netWeight * baseGoldPrice),
      conditionPenalty: Math.round(netWeight * baseGoldPrice * (conditionPenalties[condition] || 0)),
      damghaBonus: hasDamgha ? Math.round(buybackValue * 0.01) : 0,
      receiptBonus: hasOriginalReceipt ? Math.round(buybackValue * 0.005) : 0,
      transactionFee: Math.round(buybackValue * 0.02),
      finalOffer: Math.round(buybackValue)
    }
  };
}

module.exports = {
  calculateGoldPrice,
  calculateBuybackPrice
};
```

---

### 5.2 Barter Matching Algorithm

```javascript
// services/barterService.js

/**
 * إيجاد أفضل مطابقات للمقايضة
 */
async function findBarterMatches(params) {
  const {
    barterType,
    myItemValue,
    myItemType,
    seekingItemType,
    maxPriceDifference = 5000, // Maximum acceptable price difference
    userId
  } = params;
  
  // Define inverse barter types
  const inverseBarterMap = {
    'GOLD_TO_MOBILE': 'MOBILE_TO_GOLD',
    'GOLD_TO_CAR': 'CAR_TO_GOLD',
    'GOLD_TO_SCRAP': 'SCRAP_TO_GOLD',
    'MOBILE_TO_GOLD': 'GOLD_TO_MOBILE',
    'CAR_TO_GOLD': 'GOLD_TO_CAR'
  };
  
  const inverseType = inverseBarterMap[barterType];
  
  // Find matching listings
  const matches = await prisma.barterListing.findMany({
    where: {
      barterType: inverseType,
      status: 'PENDING',
      expiresAt: {
        gt: new Date()
      },
      offeringUserId: {
        not: userId  // Don't match with own listings
      },
      // Value should be close
      totalGoldValue: {
        gte: myItemValue - maxPriceDifference,
        lte: myItemValue + maxPriceDifference
      }
    },
    include: {
      offeringUser: {
        select: {
          id: true,
          name: true,
          rating: true,
          goldTraderVerified: true
        }
      },
      goldItemsOffered: {
        include: {
          category: true
        }
      }
    }
  });
  
  // Calculate match scores
  const scoredMatches = matches.map(match => {
    const priceDifference = Math.abs(match.totalGoldValue - myItemValue);
    const priceMatchScore = Math.max(0, 100 - (priceDifference / myItemValue * 100));
    
    const userReputationScore = (match.offeringUser.rating / 5) * 100;
    const verificationBonus = match.offeringUser.goldTraderVerified ? 10 : 0;
    
    const overallScore = (priceMatchScore * 0.6) + (userReputationScore * 0.3) + verificationBonus;
    
    return {
      ...match,
      matchScore: Math.round(overallScore),
      priceDifference: Math.round(priceDifference)
    };
  });
  
  // Sort by match score
  scoredMatches.sort((a, b) => b.matchScore - a.matchScore);
  
  return scoredMatches;
}

/**
 * حساب الفرق السعري وتحديد من يدفع
 */
function calculateBarterPriceDifference(item1Value, item2Value) {
  const difference = item1Value - item2Value;
  
  return {
    priceDifference: Math.abs(difference),
    payerSide: difference > 0 ? 'ITEM2_OWNER' : 'ITEM1_OWNER',
    item1Value,
    item2Value,
    isEvenTrade: Math.abs(difference) < 100 // Less than 100 EGP is considered even
  };
}

module.exports = {
  findBarterMatches,
  calculateBarterPriceDifference
};
```

---

### 5.3 Fraud Detection Algorithm

```javascript
// services/fraudDetectionService.js

/**
 * كشف محاولات الاحتيال في قوائم الذهب
 */
async function detectFraudulentListing(productId) {
  const product = await prisma.goldProduct.findUnique({
    where: { id: productId },
    include: {
      seller: {
        include: {
          goldProductsSelling: true
        }
      }
    }
  });
  
  const fraudIndicators = [];
  let riskScore = 0;
  
  // 1. Price anomaly detection
  const goldPrices = await getGoldPrice();
  const expectedPrice = await calculateGoldPrice({
    karat: product.karat,
    grossWeight: product.grossWeight,
    netWeight: product.netWeight,
    workmanshipFeePerGram: 100, // Average
    condition: product.condition
  });
  
  const priceDeviation = Math.abs(product.finalPrice - expectedPrice.finalPrice) / expectedPrice.finalPrice;
  
  if (priceDeviation > 0.3) { // 30% deviation
    fraudIndicators.push('PRICE_TOO_GOOD');
    riskScore += 40;
  }
  
  // 2. Seller history check
  if (product.seller.goldProductsSelling.length === 1) {
    fraudIndicators.push('NEW_SELLER');
    riskScore += 20;
  }
  
  if (!product.seller.goldTraderVerified) {
    fraudIndicators.push('UNVERIFIED_SELLER');
    riskScore += 15;
  }
  
  // 3. Product verification status
  if (product.verificationStatus === 'PENDING') {
    fraudIndicators.push('NOT_XRF_VERIFIED');
    riskScore += 30;
  }
  
  // 4. Missing damgha
  if (product.damghaType === 'NONE' && product.condition === 'NEW') {
    fraudIndicators.push('NO_DAMGHA_NEW_ITEM');
    riskScore += 25;
  }
  
  // 5. Image quality check (placeholder - would use AI)
  if (product.images.length < 3) {
    fraudIndicators.push('INSUFFICIENT_IMAGES');
    riskScore += 10;
  }
  
  // 6. Duplicate listing detection
  const similarListings = await prisma.goldProduct.findMany({
    where: {
      sellerId: product.sellerId,
      karat: product.karat,
      netWeight: {
        gte: product.netWeight * 0.95,
        lte: product.netWeight * 1.05
      },
      id: {
        not: productId
      },
      createdAt: {
        gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
      }
    }
  });
  
  if (similarListings.length > 0) {
    fraudIndicators.push('DUPLICATE_LISTING');
    riskScore += 30;
  }
  
  // Calculate final risk level
  let riskLevel = 'LOW';
  if (riskScore >= 70) {
    riskLevel = 'HIGH';
  } else if (riskScore >= 40) {
    riskLevel = 'MEDIUM';
  }
  
  return {
    riskLevel,
    riskScore,
    fraudIndicators,
    requiresManualReview: riskScore >= 50,
    recommendations: generateFraudRecommendations(fraudIndicators)
  };
}

function generateFraudRecommendations(indicators) {
  const recommendations = [];
  
  if (indicators.includes('PRICE_TOO_GOOD')) {
    recommendations.push('Verify pricing matches current market rates');
  }
  
  if (indicators.includes('NOT_XRF_VERIFIED')) {
    recommendations.push('Require XRF verification before listing goes live');
  }
  
  if (indicators.includes('NO_DAMGHA_NEW_ITEM')) {
    recommendations.push('Request damgha certificate or explanation');
  }
  
  if (indicators.includes('UNVERIFIED_SELLER')) {
    recommendations.push('Require seller KYC verification');
  }
  
  return recommendations;
}

module.exports = {
  detectFraudulentListing
};
```

---

## 6. TESTING SCENARIOS {#testing-scenarios}

### 6.1 Unit Tests

```javascript
// tests/services/pricingService.test.js

const { calculateGoldPrice, calculateBuybackPrice } = require('../../services/pricingService');

describe('Gold Pricing Service', () => {
  
  test('should calculate correct price for 10g 21K new jewelry', async () => {
    const result = await calculateGoldPrice({
      karat: 'K21',
      grossWeight: 10.2,
      netWeight: 10.0,
      workmanshipFeePerGram: 100,
      hasGems: false,
      condition: 'NEW',
      includeVAT: true
    });
    
    // Assuming gold price is 3740 EGP/gram
    expect(result.goldValue).toBe(37400); // 10 * 3740
    expect(result.workmanshipTotal).toBe(1000); // 10 * 100
    expect(result.vat).toBe(140); // 14% of 1000
    expect(result.damghaFee).toBe(25);
    expect(result.finalPrice).toBe(38565); // 37400 + 1000 + 140 + 25
  });
  
  test('should apply condition discount for used gold', async () => {
    const result = await calculateGoldPrice({
      karat: 'K21',
      grossWeight: 10.0,
      netWeight: 10.0,
      workmanshipFeePerGram: 50,
      hasGems: false,
      condition: 'GOOD',
      includeVAT: true
    });
    
    // 5% discount for GOOD condition
    const expectedDiscount = 37400 * 0.05; // 1870
    expect(result.conditionDiscount).toBe(1870);
    expect(result.finalPrice).toBeLessThan(38000);
  });
  
  test('should calculate buyback price with all factors', () => {
    const result = calculateBuybackPrice({
      karat: 'K21',
      netWeight: 10.0,
      condition: 'EXCELLENT',
      hasDamgha: true,
      hasOriginalReceipt: true
    });
    
    expect(result.estimatedValue.average).toBeGreaterThan(0);
    expect(result.breakdown.damghaBonus).toBeGreaterThan(0);
    expect(result.breakdown.receiptBonus).toBeGreaterThan(0);
  });
});
```

---

### 6.2 Integration Tests

```javascript
// tests/integration/goldMarketplace.test.js

const request = require('supertest');
const app = require('../../app');

describe('Gold Marketplace Integration Tests', () => {
  
  let authToken;
  let productId;
  
  beforeAll(async () => {
    // Login to get auth token
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@xchange.eg',
        password: 'testpass123'
      });
    
    authToken = res.body.token;
  });
  
  test('Complete flow: Create product → Verify → List → Purchase', async () => {
    
    // 1. Create product
    const createRes = await request(app)
      .post('/api/gold/products')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        type: 'BULLION',
        karat: 'K24',
        condition: 'NEW',
        grossWeight: 10.0,
        netWeight: 10.0,
        title: 'Test Gold Bar',
        titleAr: 'سبيكة ذهب اختبار',
        damghaType: 'EGYPTIAN_OFFICIAL',
        damghaNumber: 'TEST123',
        workmanshipFee: 20,
        quantity: 1,
        categoryId: 'cat-bullion-001',
        images: ['https://example.com/image.jpg']
      });
    
    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    productId = createRes.body.data.id;
    
    // 2. XRF Verification (as technician)
    const verifyRes = await request(app)
      .post('/api/gold/verify/xrf')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        productId,
        deviceModel: 'VR-T6',
        deviceSerialNumber: 'TEST-001',
        goldPercentage: 99.9,
        silverPercentage: 0,
        copperPercentage: 0.1,
        testLocation: 'Test Lab'
      });
    
    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.verificationStatus).toBe('VERIFIED');
    expect(verifyRes.body.data.certificateGenerated).toBe(true);
    
    // 3. Get product details
    const getRes = await request(app)
      .get(`/api/gold/products/${productId}`);
    
    expect(getRes.status).toBe(200);
    expect(getRes.body.data.verificationStatus).toBe('VERIFIED');
    expect(getRes.body.data.certificateNumber).toBeTruthy();
    
    // 4. Create order
    const orderRes = await request(app)
      .post('/api/orders/create')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        items: [{
          productId,
          quantity: 1
        }],
        shippingAddress: {
          street: 'Test Street',
          city: 'Cairo',
          postalCode: '11511'
        },
        paymentMethod: 'CARD'
      });
    
    expect(orderRes.status).toBe(201);
    expect(orderRes.body.data.status).toBe('PENDING_PAYMENT');
  });
});
```

---

### 6.3 E2E Test Scenarios

```javascript
// tests/e2e/goldBarter.test.js

describe('Gold Barter E2E Test', () => {
  
  test('User A creates gold barter, User B accepts with mobile', async () => {
    
    // User A: Create gold product
    const goldProduct = await createGoldProduct(userAToken, {
      type: 'JEWELRY',
      karat: 'K21',
      netWeight: 10.0,
      finalPrice: 38000
    });
    
    // User A: Create barter listing
    const barter = await createBarterListing(userAToken, {
      barterType: 'GOLD_TO_MOBILE',
      goldItemsOffered: [goldProduct.id],
      seekingValue: 35000,
      seekingDescription: 'iPhone 15 Pro'
    });
    
    expect(barter.status).toBe('PENDING');
    
    // User B: Find matching offers
    const matches = await findBarterMatches(userBToken, {
      barterType: 'MOBILE_TO_GOLD',
      myItemValue: 36000
    });
    
    expect(matches.length).toBeGreaterThan(0);
    expect(matches[0].barterId).toBe(barter.id);
    
    // User B: Accept barter
    const acceptance = await acceptBarter(userBToken, barter.id, {
      myItemId: 'mobile-123'
    });
    
    expect(acceptance.status).toBe('ACCEPTED');
    expect(acceptance.escrowInitiated).toBe(true);
    
    // Both users: Schedule inspection
    const inspection = await scheduleInspection({
      barterId: barter.id,
      preferredDate: '2024-12-16',
      preferredTime: '14:00'
    });
    
    expect(inspection.confirmed).toBe(true);
    
    // Technician: Verify both items
    await verifyGoldItem(goldProduct.id);
    await verifyMobileItem('mobile-123');
    
    // Complete barter
    const completion = await completeBarter(barter.id);
    
    expect(completion.status).toBe('COMPLETED');
    expect(completion.goldTransferred).toBe(true);
    expect(completion.mobileTransferred).toBe(true);
  });
});
```

---

## 7. SECURITY & COMPLIANCE {#security}

### 7.1 Data Encryption

```javascript
// middleware/encryption.js

const crypto = require('crypto');

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes
const IV_LENGTH = 16;

function encrypt(text) {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift(), 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  
  return decrypted.toString();
}

// Middleware to encrypt sensitive fields before saving
function encryptSensitiveFields(req, res, next) {
  if (req.body.damghaNumber) {
    req.body.damghaNumber = encrypt(req.body.damghaNumber);
  }
  
  if (req.body.certificateNumber) {
    req.body.certificateNumber = encrypt(req.body.certificateNumber);
  }
  
  next();
}

module.exports = {
  encrypt,
  decrypt,
  encryptSensitiveFields
};
```

---

### 7.2 Role-Based Access Control (RBAC)

```javascript
// middleware/rbac.js

const roles = {
  USER: 'user',
  VERIFIED_SELLER: 'verified_seller',
  TECHNICIAN: 'technician',
  ADMIN: 'admin'
};

const permissions = {
  // Product management
  CREATE_GOLD_PRODUCT: [roles.USER, roles.VERIFIED_SELLER, roles.ADMIN],
  VERIFY_GOLD_PRODUCT: [roles.TECHNICIAN, roles.ADMIN],
  DELETE_GOLD_PRODUCT: [roles.ADMIN],
  
  // Barter
  CREATE_BARTER: [roles.USER, roles.VERIFIED_SELLER, roles.ADMIN],
  APPROVE_BARTER: [roles.ADMIN],
  
  // Pricing
  UPDATE_GOLD_PRICES: [roles.ADMIN],
  VIEW_PRICING_HISTORY: [roles.ADMIN, roles.TECHNICIAN],
  
  // Certificates
  ISSUE_CERTIFICATE: [roles.TECHNICIAN, roles.ADMIN],
  REVOKE_CERTIFICATE: [roles.ADMIN]
};

function hasPermission(userRole, requiredPermission) {
  return permissions[requiredPermission]?.includes(userRole) || false;
}

function authorize(requiredPermission) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    if (!hasPermission(req.user.role, requiredPermission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredPermission,
        userRole: req.user.role
      });
    }
    
    next();
  };
}

// Usage in routes
router.post('/api/gold/verify/xrf', 
  authenticate,
  authorize('VERIFY_GOLD_PRODUCT'),
  verifyGoldProductHandler
);

module.exports = {
  roles,
  permissions,
  hasPermission,
  authorize
};
```

---

### 7.3 Audit Logging

```javascript
// services/auditService.js

async function logAudit(params) {
  const {
    userId,
    action,
    resourceType,
    resourceId,
    metadata = {},
    ipAddress,
    userAgent
  } = params;
  
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      resourceType,
      resourceId,
      metadata,
      ipAddress,
      userAgent,
      timestamp: new Date()
    }
  });
}

// Middleware to automatically log sensitive actions
function auditMiddleware(action, resourceType) {
  return async (req, res, next) => {
    // Store original json function
    const originalJson = res.json.bind(res);
    
    // Override json function
    res.json = function(data) {
      // Log after successful response
      if (res.statusCode < 400) {
        logAudit({
          userId: req.user?.id,
          action,
          resourceType,
          resourceId: data.data?.id || req.params.id,
          metadata: {
            body: req.body,
            params: req.params
          },
          ipAddress: req.ip,
          userAgent: req.headers['user-agent']
        }).catch(err => console.error('Audit log failed:', err));
      }
      
      // Call original json function
      return originalJson(data);
    };
    
    next();
  };
}

// Usage
router.post('/api/gold/verify/xrf',
  authenticate,
  authorize('VERIFY_GOLD_PRODUCT'),
  auditMiddleware('VERIFY_XRF', 'GOLD_PRODUCT'),
  verifyGoldProductHandler
);

module.exports = {
  logAudit,
  auditMiddleware
};
```

---

## 🎉 ملخص حزمة التطوير

هذه الحزمة تحتوي على **كل ما يحتاجه Claude Code** للبدء فوراً في تطوير سوق الذهب:

✅ **Database Schema** كامل مع جميع الجداول والعلاقات  
✅ **API Endpoints** مع أمثلة Request/Response  
✅ **User Stories** مفصلة لكل حالة استخدام  
✅ **Integration Guides** خطوة بخطوة  
✅ **Business Logic** جاهز للتنفيذ  
✅ **Testing Scenarios** شاملة  
✅ **Security** و Compliance

---

**الخطوة التالية:**
نسخ هذا الملف ومشاركته مع Claude Code لبدء التطوير الفعلي! 🚀
