# 🔧 المواصفات التقنية - سوق الخردة والتوالف

## Xchange Scrap Marketplace Technical Specifications

---

## 📋 الفهرس

1. [نظرة عامة على النظام](#1-نظرة-عامة-على-النظام)
2. [Technology Stack](#2-technology-stack)
3. [Database Schema](#3-database-schema)
4. [API Specifications](#4-api-specifications)
5. [خوارزمية التسعير](#5-خوارزمية-التسعير)
6. [نظام التصنيف والجودة](#6-نظام-التصنيف-والجودة)
7. [نظام الدفع](#7-نظام-الدفع)
8. [الأمان والخصوصية](#8-الأمان-والخصوصية)
9. [MVP Scope](#9-mvp-scope)
10. [هيكل المشروع](#10-هيكل-المشروع)

---

## 1. نظرة عامة على النظام

### 1.1 أنواع المستخدمين

| النوع | الوصف | الصلاحيات |
|-------|-------|----------|
| **فرد بائع** | مواطن يبيع خردة منزلية | إنشاء طلب جمع، تتبع، استلام المال |
| **فرد مشتري** | يشتري مواد محددة | تصفح، شراء، تقييم |
| **روبابيكيا** | جامع خردة تقليدي | جمع، بيع بالجملة، تتبع |
| **تاجر جملة** | تاجر خردة كبير | بيع/شراء بالجملة، مزادات |
| **شركة/مصنع** | مصدر أو مستهلك خردة | عقود B2B، شهادات ESG |
| **مصنع تدوير** | يشتري للتصنيع | شراء بالجملة، عقود |
| **مدير النظام** | Xchange Admin | إدارة كاملة |

### 1.2 الوحدات الرئيسية

```
┌─────────────────────────────────────────────────────────────┐
│                    Xchange Scrap Platform                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Price      │  │  C2B        │  │  B2B                │  │
│  │  Tracker    │  │  Pickup     │  │  Marketplace        │  │
│  │  Module     │  │  Service    │  │  Module             │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Dealer     │  │  Payment    │  │  ESG                │  │
│  │  Directory  │  │  System     │  │  Certificates       │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │  Logistics  │  │  Rating     │  │  Analytics          │  │
│  │  Module     │  │  System     │  │  Dashboard          │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### 2.1 Frontend

| Technology | Purpose |
|------------|---------|
| **Next.js 14** | React framework with App Router |
| **TypeScript** | Type safety |
| **Tailwind CSS** | Styling with RTL support |
| **React Query** | Server state management |
| **Zustand** | Client state management |
| **React Hook Form** | Form handling |
| **Zod** | Schema validation |

### 2.2 Backend

| Technology | Purpose |
|------------|---------|
| **Node.js 20** | Runtime |
| **Express.js** | API framework |
| **TypeScript** | Type safety |
| **Prisma** | ORM |
| **PostgreSQL 16** | Primary database |
| **Redis** | Caching + Sessions |
| **Bull** | Job queue (price updates, notifications) |

### 2.3 Infrastructure

| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Nginx** | Reverse proxy |
| **AWS S3 / Cloudinary** | Image storage |
| **Firebase FCM** | Push notifications |
| **Twilio / Vodafone** | SMS OTP |

### 2.4 External APIs

| Service | Purpose |
|---------|---------|
| **LME API** | أسعار المعادن العالمية |
| **Currency API** | سعر صرف الدولار |
| **Google Maps** | تحديد المواقع والمسافات |
| **Paymob** | بوابة الدفع |
| **Fawry** | الدفع النقدي |

---

## 3. Database Schema

### 3.1 جدول المستخدمين (users)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(15) UNIQUE NOT NULL,
    phone_verified BOOLEAN DEFAULT FALSE,
    email VARCHAR(255),
    name VARCHAR(255),
    national_id VARCHAR(14),
    national_id_verified BOOLEAN DEFAULT FALSE,
    user_type ENUM('individual', 'collector', 'dealer', 'company', 'recycler', 'admin') NOT NULL,
    company_name VARCHAR(255),
    commercial_register VARCHAR(50),
    tax_id VARCHAR(50),
    profile_image_url TEXT,
    address_governorate VARCHAR(50),
    address_city VARCHAR(100),
    address_street TEXT,
    address_lat DECIMAL(10, 8),
    address_lng DECIMAL(11, 8),
    rating_avg DECIMAL(3, 2) DEFAULT 0,
    rating_count INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    total_weight_kg DECIMAL(12, 2) DEFAULT 0,
    wallet_balance DECIMAL(12, 2) DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_type ON users(user_type);
CREATE INDEX idx_users_governorate ON users(address_governorate);
CREATE INDEX idx_users_verified ON users(is_verified);
```

### 3.2 جدول فئات المواد (material_categories)

```sql
CREATE TABLE material_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    parent_id UUID REFERENCES material_categories(id),
    icon_url TEXT,
    description_ar TEXT,
    description_en TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- الفئات الرئيسية:
-- معادن حديدية (حديد، صلب، صاج)
-- معادن غير حديدية (نحاس، ألومنيوم، رصاص، زنك)
-- بلاستيك (PET، PE، PP، PVC)
-- ورق وكرتون
-- زجاج
-- إلكترونيات
-- أجهزة منزلية
-- مخلفات صناعية
```

### 3.3 جدول أنواع المواد (material_types)

```sql
CREATE TABLE material_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES material_categories(id) NOT NULL,
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    unit ENUM('kg', 'ton', 'piece', 'unit') DEFAULT 'kg',
    min_quantity DECIMAL(10, 2) DEFAULT 1,
    image_url TEXT,
    quality_grades JSONB, -- درجات الجودة المتاحة
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_material_types_category ON material_types(category_id);
CREATE INDEX idx_material_types_slug ON material_types(slug);
```

### 3.4 جدول الأسعار (prices)

```sql
CREATE TABLE prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_type_id UUID REFERENCES material_types(id) NOT NULL,
    quality_grade VARCHAR(20) DEFAULT 'standard', -- premium, standard, low
    price_per_kg DECIMAL(10, 2) NOT NULL,
    price_per_ton DECIMAL(12, 2),
    currency VARCHAR(3) DEFAULT 'EGP',
    source ENUM('manual', 'lme', 'market', 'algorithm') DEFAULT 'manual',
    governorate VARCHAR(50), -- NULL = سعر عام
    effective_date DATE NOT NULL,
    expiry_date DATE,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_prices_material ON prices(material_type_id);
CREATE INDEX idx_prices_date ON prices(effective_date);
CREATE INDEX idx_prices_governorate ON prices(governorate);
CREATE UNIQUE INDEX idx_prices_unique ON prices(material_type_id, quality_grade, governorate, effective_date);
```

### 3.5 جدول الإعلانات/العروض (listings)

```sql
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    listing_type ENUM('sell', 'buy', 'auction') NOT NULL,
    material_type_id UUID REFERENCES material_types(id) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    quality_grade VARCHAR(20) DEFAULT 'standard',
    quantity_kg DECIMAL(12, 2) NOT NULL,
    quantity_estimated BOOLEAN DEFAULT FALSE,
    price_per_kg DECIMAL(10, 2),
    price_total DECIMAL(12, 2),
    price_negotiable BOOLEAN DEFAULT TRUE,
    min_quantity_kg DECIMAL(10, 2),
    images JSONB, -- array of image URLs
    address_governorate VARCHAR(50) NOT NULL,
    address_city VARCHAR(100),
    address_details TEXT,
    address_lat DECIMAL(10, 8),
    address_lng DECIMAL(11, 8),
    pickup_available BOOLEAN DEFAULT TRUE,
    delivery_available BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'pending', 'active', 'sold', 'expired', 'cancelled') DEFAULT 'pending',
    featured BOOLEAN DEFAULT FALSE,
    views_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP,
    sold_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_listings_user ON listings(user_id);
CREATE INDEX idx_listings_material ON listings(material_type_id);
CREATE INDEX idx_listings_type ON listings(listing_type);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_governorate ON listings(address_governorate);
CREATE INDEX idx_listings_created ON listings(created_at DESC);
```

### 3.6 جدول طلبات الجمع C2B (pickup_requests)

```sql
CREATE TABLE pickup_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_number VARCHAR(20) UNIQUE NOT NULL, -- XSP-2024-000001
    user_id UUID REFERENCES users(id) NOT NULL,
    collector_id UUID REFERENCES users(id), -- الروبابيكيا المعين
    
    -- المواد المطلوب جمعها
    materials JSONB NOT NULL, -- [{material_type_id, estimated_kg, quality_grade}]
    total_estimated_kg DECIMAL(10, 2),
    total_actual_kg DECIMAL(10, 2),
    
    -- التسعير
    estimated_price DECIMAL(10, 2),
    final_price DECIMAL(10, 2),
    platform_fee DECIMAL(10, 2),
    collector_payout DECIMAL(10, 2),
    
    -- العنوان والموعد
    address_governorate VARCHAR(50) NOT NULL,
    address_city VARCHAR(100) NOT NULL,
    address_street TEXT NOT NULL,
    address_building VARCHAR(100),
    address_floor VARCHAR(20),
    address_landmark TEXT,
    address_lat DECIMAL(10, 8),
    address_lng DECIMAL(11, 8),
    preferred_date DATE NOT NULL,
    preferred_time_slot ENUM('morning', 'afternoon', 'evening') DEFAULT 'morning',
    
    -- الحالة
    status ENUM(
        'pending',      -- في انتظار التعيين
        'assigned',     -- تم تعيين جامع
        'confirmed',    -- تأكيد الموعد
        'on_the_way',   -- الجامع في الطريق
        'arrived',      -- وصل
        'weighing',     -- جاري الوزن
        'payment',      -- في انتظار الدفع
        'completed',    -- تم بنجاح
        'cancelled',    -- ملغي
        'disputed'      -- نزاع
    ) DEFAULT 'pending',
    
    -- التتبع
    collector_location_lat DECIMAL(10, 8),
    collector_location_lng DECIMAL(11, 8),
    collector_location_updated_at TIMESTAMP,
    
    -- الملاحظات
    user_notes TEXT,
    collector_notes TEXT,
    cancellation_reason TEXT,
    
    -- التواريخ
    assigned_at TIMESTAMP,
    confirmed_at TIMESTAMP,
    arrived_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_pickup_user ON pickup_requests(user_id);
CREATE INDEX idx_pickup_collector ON pickup_requests(collector_id);
CREATE INDEX idx_pickup_status ON pickup_requests(status);
CREATE INDEX idx_pickup_date ON pickup_requests(preferred_date);
CREATE INDEX idx_pickup_governorate ON pickup_requests(address_governorate);
```

### 3.7 جدول المعاملات (transactions)

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_number VARCHAR(20) UNIQUE NOT NULL, -- XST-2024-000001
    
    -- الأطراف
    seller_id UUID REFERENCES users(id) NOT NULL,
    buyer_id UUID REFERENCES users(id) NOT NULL,
    
    -- المصدر
    source_type ENUM('listing', 'pickup', 'b2b_contract', 'auction') NOT NULL,
    source_id UUID NOT NULL, -- ID of listing/pickup/contract
    
    -- المواد
    materials JSONB NOT NULL, -- تفاصيل المواد والأوزان
    total_weight_kg DECIMAL(12, 2) NOT NULL,
    
    -- المالية
    subtotal DECIMAL(12, 2) NOT NULL,
    platform_fee_seller DECIMAL(10, 2) DEFAULT 0,
    platform_fee_buyer DECIMAL(10, 2) DEFAULT 0,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(12, 2) NOT NULL,
    
    -- الدفع
    payment_method ENUM('cash', 'wallet', 'bank_transfer', 'fawry', 'vodafone_cash', 'instapay') NOT NULL,
    payment_status ENUM('pending', 'paid', 'refunded', 'failed') DEFAULT 'pending',
    payment_reference VARCHAR(100),
    paid_at TIMESTAMP,
    
    -- الحالة
    status ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'disputed') DEFAULT 'pending',
    
    -- التواريخ
    confirmed_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);
```

### 3.8 جدول التقييمات (reviews)

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) NOT NULL,
    reviewer_id UUID REFERENCES users(id) NOT NULL,
    reviewed_id UUID REFERENCES users(id) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    weight_accuracy INTEGER CHECK (weight_accuracy >= 1 AND weight_accuracy <= 5), -- دقة الوزن
    quality_accuracy INTEGER CHECK (quality_accuracy >= 1 AND quality_accuracy <= 5), -- دقة الجودة
    punctuality INTEGER CHECK (punctuality >= 1 AND punctuality <= 5), -- الالتزام بالموعد
    communication INTEGER CHECK (communication >= 1 AND communication <= 5), -- التواصل
    comment TEXT,
    images JSONB,
    is_verified BOOLEAN DEFAULT TRUE, -- معاملة موثقة
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX idx_reviews_unique ON reviews(transaction_id, reviewer_id);
CREATE INDEX idx_reviews_reviewed ON reviews(reviewed_id);
```

### 3.9 جدول عقود B2B (b2b_contracts)

```sql
CREATE TABLE b2b_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contract_number VARCHAR(20) UNIQUE NOT NULL, -- XSC-2024-000001
    seller_id UUID REFERENCES users(id) NOT NULL,
    buyer_id UUID REFERENCES users(id) NOT NULL,
    
    -- تفاصيل العقد
    material_type_id UUID REFERENCES material_types(id) NOT NULL,
    quality_grade VARCHAR(20) NOT NULL,
    quantity_kg_per_period DECIMAL(12, 2) NOT NULL,
    period_type ENUM('weekly', 'monthly', 'quarterly') NOT NULL,
    price_per_kg DECIMAL(10, 2) NOT NULL,
    price_adjustment_formula TEXT, -- صيغة تعديل السعر
    
    -- المدة
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    
    -- الشروط
    delivery_terms TEXT,
    payment_terms TEXT,
    quality_standards TEXT,
    penalties TEXT,
    
    -- الحالة
    status ENUM('draft', 'pending_approval', 'active', 'suspended', 'completed', 'terminated') DEFAULT 'draft',
    
    -- ESG
    esg_certificate_required BOOLEAN DEFAULT FALSE,
    esg_certificate_url TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 3.10 جدول الجامعين/الروبابيكيا (collectors)

```sql
CREATE TABLE collectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
    
    -- معلومات العمل
    vehicle_type ENUM('tricycle', 'pickup', 'truck', 'van', 'none') DEFAULT 'tricycle',
    vehicle_plate VARCHAR(20),
    vehicle_capacity_kg DECIMAL(10, 2),
    
    -- منطقة العمل
    service_governorates JSONB, -- المحافظات
    service_cities JSONB, -- المدن
    service_radius_km INTEGER DEFAULT 10,
    
    -- التوفر
    is_available BOOLEAN DEFAULT TRUE,
    working_hours JSONB, -- {saturday: {start: "09:00", end: "18:00"}, ...}
    
    -- الإحصائيات
    total_pickups INTEGER DEFAULT 0,
    total_weight_collected_kg DECIMAL(12, 2) DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    completion_rate DECIMAL(5, 2) DEFAULT 100,
    
    -- الموقع الحالي (للتتبع)
    current_lat DECIMAL(10, 8),
    current_lng DECIMAL(11, 8),
    location_updated_at TIMESTAMP,
    
    -- الحالة
    is_verified BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_collectors_available ON collectors(is_available, is_active);
CREATE INDEX idx_collectors_location ON collectors USING GIST (
    point(current_lng, current_lat)
);
```

### 3.11 جدول التجار (dealers)

```sql
CREATE TABLE dealers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) UNIQUE NOT NULL,
    
    -- معلومات المحل/المخزن
    business_name VARCHAR(255) NOT NULL,
    business_type ENUM('shop', 'warehouse', 'factory', 'recycler') NOT NULL,
    specializations JSONB, -- أنواع المواد المتخصص فيها
    
    -- العنوان
    address_governorate VARCHAR(50) NOT NULL,
    address_city VARCHAR(100) NOT NULL,
    address_street TEXT,
    address_lat DECIMAL(10, 8),
    address_lng DECIMAL(11, 8),
    
    -- التواصل
    phone_secondary VARCHAR(15),
    whatsapp VARCHAR(15),
    
    -- ساعات العمل
    working_hours JSONB,
    
    -- المرافق
    has_scale BOOLEAN DEFAULT FALSE, -- ميزان
    scale_capacity_kg DECIMAL(10, 2),
    has_loading_equipment BOOLEAN DEFAULT FALSE, -- معدات تحميل
    accepts_small_quantities BOOLEAN DEFAULT TRUE,
    min_quantity_kg DECIMAL(10, 2) DEFAULT 1,
    
    -- الخدمات
    offers_pickup BOOLEAN DEFAULT FALSE,
    pickup_fee_per_km DECIMAL(6, 2),
    
    -- الإحصائيات
    total_transactions INTEGER DEFAULT 0,
    total_weight_kg DECIMAL(14, 2) DEFAULT 0,
    avg_rating DECIMAL(3, 2) DEFAULT 0,
    
    -- الحالة
    is_verified BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_dealers_governorate ON dealers(address_governorate);
CREATE INDEX idx_dealers_type ON dealers(business_type);
CREATE INDEX idx_dealers_verified ON dealers(is_verified, is_active);
```

---

## 4. API Specifications

### 4.1 Authentication APIs

```typescript
// POST /api/auth/send-otp
// إرسال رمز التحقق
Request: {
  phone: "+201012345678"
}
Response: {
  success: true,
  message: "OTP sent",
  expiresIn: 300 // seconds
}

// POST /api/auth/verify-otp
// التحقق من الرمز
Request: {
  phone: "+201012345678",
  otp: "123456"
}
Response: {
  success: true,
  token: "jwt_token",
  refreshToken: "refresh_token",
  user: { ... },
  isNewUser: true
}

// POST /api/auth/register
// إكمال التسجيل
Request: {
  name: "أحمد محمد",
  userType: "individual", // individual, collector, dealer, company
  governorate: "القاهرة",
  city: "مدينة نصر"
}
Response: {
  success: true,
  user: { ... }
}
```

### 4.2 Price APIs

```typescript
// GET /api/prices
// الحصول على الأسعار الحالية
Query: {
  categoryId?: string,
  materialTypeId?: string,
  governorate?: string
}
Response: {
  prices: [
    {
      materialType: { id, nameAr, nameEn, category },
      qualityGrade: "standard",
      pricePerKg: 40,
      pricePerTon: 40000,
      change24h: 2.5, // نسبة التغير
      updatedAt: "2024-12-13T10:00:00Z"
    }
  ],
  lastUpdated: "2024-12-13T10:00:00Z"
}

// GET /api/prices/history/:materialTypeId
// تاريخ الأسعار
Query: {
  period: "7d" | "30d" | "90d" | "1y",
  governorate?: string
}
Response: {
  history: [
    { date: "2024-12-01", price: 38 },
    { date: "2024-12-02", price: 39 },
    ...
  ]
}

// GET /api/prices/calculator
// حاسبة قيمة الخردة
Query: {
  materials: [
    { materialTypeId: "xxx", weightKg: 100, qualityGrade: "standard" }
  ],
  governorate?: string
}
Response: {
  items: [
    {
      materialType: { ... },
      weightKg: 100,
      pricePerKg: 40,
      subtotal: 4000
    }
  ],
  total: 4000,
  estimatedRange: { min: 3800, max: 4200 }
}
```

### 4.3 Pickup Request APIs (C2B)

```typescript
// POST /api/pickups
// إنشاء طلب جمع
Request: {
  materials: [
    { materialTypeId: "xxx", estimatedKg: 50, qualityGrade: "standard" }
  ],
  address: {
    governorate: "القاهرة",
    city: "مدينة نصر",
    street: "شارع مصطفى النحاس",
    building: "عمارة 5",
    floor: "3",
    landmark: "بجوار مسجد الحمد",
    lat: 30.0444,
    lng: 31.2357
  },
  preferredDate: "2024-12-15",
  preferredTimeSlot: "morning",
  notes: "الخردة في البلكونة"
}
Response: {
  success: true,
  pickup: {
    id: "xxx",
    requestNumber: "XSP-2024-000001",
    status: "pending",
    estimatedPrice: 2000,
    ...
  }
}

// GET /api/pickups/:id
// تفاصيل طلب الجمع
Response: {
  pickup: {
    id: "xxx",
    requestNumber: "XSP-2024-000001",
    status: "on_the_way",
    collector: {
      id: "xxx",
      name: "محمد",
      phone: "+201012345678",
      rating: 4.8,
      vehicleType: "tricycle",
      currentLocation: { lat: 30.05, lng: 31.24 },
      eta: 15 // minutes
    },
    materials: [...],
    estimatedPrice: 2000,
    address: {...},
    timeline: [
      { status: "pending", at: "2024-12-13T10:00:00Z" },
      { status: "assigned", at: "2024-12-13T10:05:00Z" },
      { status: "on_the_way", at: "2024-12-13T10:30:00Z" }
    ]
  }
}

// PATCH /api/pickups/:id/status
// تحديث حالة الطلب (للجامع)
Request: {
  status: "arrived" | "weighing" | "completed",
  actualMaterials?: [
    { materialTypeId: "xxx", actualKg: 48, qualityGrade: "standard" }
  ],
  finalPrice?: 1920,
  notes?: "وزن فعلي أقل من المتوقع"
}

// POST /api/pickups/:id/confirm-payment
// تأكيد الدفع
Request: {
  paymentMethod: "cash" | "wallet",
  amount: 1920
}
```

### 4.4 Listings APIs

```typescript
// POST /api/listings
// إنشاء إعلان
Request: {
  listingType: "sell",
  materialTypeId: "xxx",
  title: "حديد خردة ممتاز - 500 كيلو",
  description: "حديد تسليح من هدم عمارة",
  qualityGrade: "premium",
  quantityKg: 500,
  pricePerKg: 42, // اختياري
  priceNegotiable: true,
  images: ["url1", "url2"],
  address: {
    governorate: "الجيزة",
    city: "6 أكتوبر",
    details: "المنطقة الصناعية"
  },
  pickupAvailable: true
}

// GET /api/listings
// تصفح الإعلانات
Query: {
  listingType?: "sell" | "buy",
  categoryId?: string,
  materialTypeId?: string,
  governorate?: string,
  minQuantity?: number,
  maxQuantity?: number,
  minPrice?: number,
  maxPrice?: number,
  sortBy?: "price" | "quantity" | "date" | "rating",
  page?: number,
  limit?: number
}

// GET /api/listings/:id
// تفاصيل الإعلان
Response: {
  listing: {
    id: "xxx",
    seller: {
      id: "xxx",
      name: "أحمد",
      rating: 4.5,
      totalTransactions: 50,
      isVerified: true
    },
    materialType: {...},
    title: "حديد خردة ممتاز",
    quantityKg: 500,
    pricePerKg: 42,
    images: [...],
    address: {...},
    viewsCount: 120,
    createdAt: "..."
  },
  similarListings: [...],
  currentPrice: 40 // سعر السوق للمقارنة
}
```

### 4.5 Dealer Directory APIs

```typescript
// GET /api/dealers
// دليل التجار
Query: {
  governorate?: string,
  city?: string,
  materialTypeId?: string,
  businessType?: "shop" | "warehouse" | "factory" | "recycler",
  hasScale?: boolean,
  offersPickup?: boolean,
  isVerified?: boolean,
  lat?: number,
  lng?: number,
  radiusKm?: number,
  sortBy?: "distance" | "rating" | "transactions"
}
Response: {
  dealers: [
    {
      id: "xxx",
      businessName: "مخازن الأمل للخردة",
      businessType: "warehouse",
      specializations: ["حديد", "نحاس", "ألومنيوم"],
      address: {...},
      distance: 2.5, // km
      rating: 4.7,
      totalTransactions: 500,
      hasScale: true,
      scaleCapacityKg: 5000,
      offersPickup: true,
      workingHours: {...},
      isVerified: true
    }
  ],
  total: 50,
  page: 1
}
```

### 4.6 B2B Contract APIs

```typescript
// POST /api/b2b/contracts
// إنشاء عقد B2B
Request: {
  buyerId: "xxx",
  materialTypeId: "xxx",
  qualityGrade: "premium",
  quantityKgPerPeriod: 10000,
  periodType: "monthly",
  pricePerKg: 41,
  startDate: "2025-01-01",
  endDate: "2025-12-31",
  deliveryTerms: "التسليم في مقر المشتري",
  paymentTerms: "الدفع خلال 15 يوم من التسليم",
  esgCertificateRequired: true
}

// GET /api/b2b/contracts
// عقودي
Query: {
  status?: "active" | "pending" | "completed",
  role?: "seller" | "buyer"
}
```

---

## 5. خوارزمية التسعير

### 5.1 مصادر الأسعار

```typescript
interface PriceSource {
  lme: number;           // بورصة لندن للمعادن
  localMarket: number;   // السوق المحلي (السبتية، إلخ)
  platformAvg: number;   // متوسط المنصة
  historicalTrend: number;
}

// حساب السعر المرجعي
function calculateReferencePrice(
  materialType: string,
  sources: PriceSource
): number {
  const weights = {
    lme: 0.3,          // 30% من سعر LME
    localMarket: 0.4,  // 40% من السوق المحلي
    platformAvg: 0.2,  // 20% من متوسط المنصة
    historicalTrend: 0.1 // 10% من الاتجاه التاريخي
  };
  
  return (
    sources.lme * weights.lme +
    sources.localMarket * weights.localMarket +
    sources.platformAvg * weights.platformAvg +
    sources.historicalTrend * weights.historicalTrend
  );
}
```

### 5.2 تعديلات السعر

```typescript
interface PriceAdjustments {
  qualityGrade: number;    // premium: +10%, low: -15%
  quantity: number;        // bulk discount
  location: number;        // بعد عن مراكز التجميع
  urgency: number;         // طلب عاجل
}

function applyAdjustments(
  basePrice: number,
  adjustments: PriceAdjustments
): number {
  let finalPrice = basePrice;
  
  // تعديل الجودة
  const qualityMultipliers = {
    premium: 1.10,
    standard: 1.00,
    low: 0.85
  };
  finalPrice *= qualityMultipliers[adjustments.qualityGrade];
  
  // خصم الكمية
  if (adjustments.quantity > 1000) {
    finalPrice *= 1.05; // +5% للكميات الكبيرة
  } else if (adjustments.quantity < 10) {
    finalPrice *= 0.95; // -5% للكميات الصغيرة
  }
  
  // تعديل الموقع
  finalPrice *= adjustments.location;
  
  return Math.round(finalPrice * 100) / 100;
}
```

### 5.3 تحديث الأسعار الآلي

```typescript
// Job يعمل كل ساعة
async function updatePricesJob() {
  // 1. جلب أسعار LME
  const lmePrices = await fetchLMEPrices();
  
  // 2. جلب سعر الصرف
  const exchangeRate = await fetchExchangeRate('USD', 'EGP');
  
  // 3. حساب الأسعار الجديدة
  for (const material of materials) {
    const newPrice = calculateNewPrice(material, lmePrices, exchangeRate);
    
    // 4. التحقق من التغير الكبير
    const oldPrice = await getCurrentPrice(material.id);
    const changePercent = ((newPrice - oldPrice) / oldPrice) * 100;
    
    if (Math.abs(changePercent) > 10) {
      // تغير كبير - يحتاج مراجعة يدوية
      await flagForReview(material.id, newPrice, changePercent);
    } else {
      await updatePrice(material.id, newPrice);
    }
  }
  
  // 5. إرسال تنبيهات للمشتركين
  await sendPriceAlerts();
}
```

---

## 6. نظام التصنيف والجودة

### 6.1 درجات الجودة للمعادن

```typescript
const qualityGrades = {
  metals: {
    premium: {
      nameAr: "ممتاز",
      description: "نظيف، نقي، بدون شوائب",
      priceMultiplier: 1.10
    },
    standard: {
      nameAr: "عادي",
      description: "نظيف نسبياً، شوائب قليلة",
      priceMultiplier: 1.00
    },
    mixed: {
      nameAr: "مخلوط",
      description: "مخلوط بأنواع أخرى",
      priceMultiplier: 0.90
    },
    low: {
      nameAr: "منخفض",
      description: "ملوث أو صدئ",
      priceMultiplier: 0.80
    }
  },
  
  electronics: {
    working: {
      nameAr: "يعمل",
      description: "جهاز يعمل بشكل كامل",
      priceMultiplier: 1.50
    },
    repairable: {
      nameAr: "قابل للإصلاح",
      description: "يحتاج إصلاح بسيط",
      priceMultiplier: 1.20
    },
    forParts: {
      nameAr: "للقطع",
      description: "للتفكيك واستخراج القطع",
      priceMultiplier: 1.00
    },
    scrap: {
      nameAr: "خردة",
      description: "لاستخراج المعادن فقط",
      priceMultiplier: 0.70
    }
  }
};
```

### 6.2 معايير التصنيف للحديد

```typescript
const ironGradingCriteria = {
  premium: {
    rust: "لا صدأ أو صدأ سطحي خفيف",
    contamination: "لا شوائب",
    thickness: "> 3mm",
    type: "حديد تسليح، صاج سميك"
  },
  standard: {
    rust: "صدأ سطحي متوسط",
    contamination: "شوائب < 5%",
    thickness: "> 1mm",
    type: "حديد مخلوط"
  },
  low: {
    rust: "صدأ كثيف",
    contamination: "شوائب > 10%",
    thickness: "أي سماكة",
    type: "حديد ملوث أو مخلوط بمواد أخرى"
  }
};
```

---

## 7. نظام الدفع

### 7.1 طرق الدفع المدعومة

```typescript
const paymentMethods = {
  // للجمع من الباب (C2B)
  c2b: [
    { id: 'cash', nameAr: 'نقداً', fee: 0 },
    { id: 'vodafone_cash', nameAr: 'فودافون كاش', fee: 0 },
    { id: 'wallet', nameAr: 'محفظة Xchange', fee: 0 }
  ],
  
  // للمعاملات الكبيرة (B2B)
  b2b: [
    { id: 'bank_transfer', nameAr: 'تحويل بنكي', fee: 0 },
    { id: 'instapay', nameAr: 'انستاباي', fee: 0 },
    { id: 'check', nameAr: 'شيك', fee: 0 },
    { id: 'credit_30', nameAr: 'آجل 30 يوم', fee: '2%' }
  ]
};
```

### 7.2 هيكل العمولات

```typescript
const commissionStructure = {
  // C2B - جمع من الأفراد
  c2b: {
    platformMargin: 0.15, // 15% هامش المنصة
    collectorPayout: 0.85 // 85% للجامع
  },
  
  // C2C - بيع مباشر
  c2c: {
    sellerFee: 0.03, // 3% من البائع
    buyerFee: 0.02,  // 2% من المشتري
    minFee: 10       // حد أدنى 10 جنيه
  },
  
  // B2B - عقود الشركات
  b2b: {
    transactionFee: 0.02, // 2% من قيمة المعاملة
    subscriptionMonthly: {
      basic: 500,    // 500 ج.م/شهر
      pro: 2000,     // 2000 ج.م/شهر
      enterprise: 5000 // 5000 ج.م/شهر
    }
  }
};
```

---

## 8. الأمان والخصوصية

### 8.1 المصادقة

```typescript
const authConfig = {
  jwt: {
    accessTokenExpiry: '1h',
    refreshTokenExpiry: '30d',
    algorithm: 'RS256'
  },
  otp: {
    length: 6,
    expiry: 300, // 5 minutes
    maxAttempts: 3,
    cooldown: 60 // 1 minute between requests
  },
  rateLimit: {
    login: { window: '15m', max: 5 },
    otp: { window: '1h', max: 10 },
    api: { window: '1m', max: 100 }
  }
};
```

### 8.2 التشفير

```typescript
const securityConfig = {
  encryption: {
    algorithm: 'AES-256-GCM',
    fields: ['national_id', 'bank_account']
  },
  hashing: {
    algorithm: 'argon2id'
  },
  tls: {
    minVersion: 'TLSv1.3'
  }
};
```

### 8.3 التحقق من الهوية

```typescript
const verificationLevels = {
  basic: {
    requirements: ['phone_verified'],
    limits: { dailyTransaction: 5000, monthlyTransaction: 20000 }
  },
  verified: {
    requirements: ['phone_verified', 'national_id_verified'],
    limits: { dailyTransaction: 50000, monthlyTransaction: 200000 }
  },
  business: {
    requirements: ['phone_verified', 'commercial_register', 'tax_id'],
    limits: { dailyTransaction: 500000, monthlyTransaction: 5000000 }
  }
};
```

---

## 9. MVP Scope

### 9.1 المرحلة الأولى (Must Have) - 3 أشهر

| الميزة | الوصف | الأولوية |
|--------|-------|----------|
| تسجيل بـ OTP | تسجيل دخول بالموبايل | 🔴 |
| عرض الأسعار | أسعار 30+ نوع خردة | 🔴 |
| حاسبة القيمة | حساب قيمة الخردة | 🔴 |
| دليل التجار | قائمة تجار بالموقع | 🔴 |
| طلب جمع بسيط | طلب جمع من الباب | 🔴 |
| إشعارات | تنبيهات الأسعار | 🔴 |

### 9.2 المرحلة الثانية (Should Have) - 3 أشهر

| الميزة | الوصف | الأولوية |
|--------|-------|----------|
| تتبع الطلب | تتبع مباشر للجامع | 🟠 |
| الدفع الإلكتروني | فودافون كاش، انستاباي | 🟠 |
| الإعلانات | نشر إعلانات بيع/شراء | 🟠 |
| التقييمات | نظام تقييم كامل | 🟠 |
| لوحة التاجر | لوحة تحكم للتجار | 🟠 |
| تنبيهات الأسعار | إشعارات تغير الأسعار | 🟠 |

### 9.3 المرحلة الثالثة (Nice to Have) - 3 أشهر

| الميزة | الوصف | الأولوية |
|--------|-------|----------|
| عقود B2B | عقود مع الشركات | 🟡 |
| شهادات ESG | شهادات الاستدامة | 🟡 |
| المزادات | مزادات للكميات الكبيرة | 🟡 |
| تطبيق الجامع | تطبيق خاص للروبابيكيا | 🟡 |
| التحليلات | تقارير وإحصائيات | 🟡 |
| برنامج الامتياز | نظام الفرنشايز | 🟡 |

---

## 10. هيكل المشروع

```
xchange-scrap/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (auth)/        # صفحات المصادقة
│   │   │   ├── (main)/        # الصفحات الرئيسية
│   │   │   │   ├── prices/    # الأسعار
│   │   │   │   ├── pickup/    # طلب الجمع
│   │   │   │   ├── listings/  # الإعلانات
│   │   │   │   ├── dealers/   # دليل التجار
│   │   │   │   └── profile/   # الحساب
│   │   │   └── api/           # API routes
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── lib/
│   │   └── styles/
│   │
│   ├── api/                    # Express Backend
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── middleware/
│   │   │   ├── routes/
│   │   │   ├── jobs/          # Background jobs
│   │   │   └── utils/
│   │   └── prisma/
│   │       └── schema.prisma
│   │
│   └── collector-app/          # تطبيق الجامع (React Native)
│
├── packages/
│   ├── shared/                 # Shared types & utils
│   ├── ui/                     # Shared UI components
│   └── config/                 # Shared configs
│
├── docker/
├── docs/
└── scripts/
```

---

## 📝 ملاحظات التنفيذ

### أولويات التطوير:

1. **البدء بمنصة الأسعار** - أقل تعقيداً، أعلى قيمة
2. **إضافة دليل التجار** - يجذب التجار للمنصة
3. **خدمة الجمع C2B** - يحتاج عمليات ميدانية
4. **السوق B2B** - يحتاج شراكات مسبقة

### التحديات التقنية:

- **تحديث الأسعار** - يحتاج مصادر موثوقة
- **التتبع المباشر** - يحتاج GPS دقيق
- **الدفع الفوري** - يحتاج سيولة

---

*آخر تحديث: ديسمبر 2024*
*Xchange Egypt - Scrap Marketplace*
