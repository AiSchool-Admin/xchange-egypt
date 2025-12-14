# 🔧 المواصفات التقنية - Xchange Luxury

## Technical Specifications for Luxury Marketplace

---

## 📊 نظرة عامة على النظام

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                              │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐             │
│  │  Web App    │  │ Mobile App  │  │ Admin Panel │             │
│  │  (Next.js)  │  │(React Native)│  │  (Next.js)  │             │
│  └─────────────┘  └─────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        API GATEWAY                               │
│                    (Express + GraphQL)                           │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Auth Service   │  │ Product Service │  │ Payment Service │
└─────────────────┘  └─────────────────┘  └─────────────────┘
         │                    │                    │
         ▼                    ▼                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                                │
├─────────────────┬─────────────────┬─────────────────────────────┤
│   PostgreSQL    │     Redis       │    Elasticsearch            │
│   (Primary DB)  │    (Cache)      │    (Search)                 │
└─────────────────┴─────────────────┴─────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    EXTERNAL SERVICES                             │
├─────────────┬─────────────┬─────────────┬─────────────┬────────┤
│  Entrupy    │   Paymob    │    Bosta    │  Firebase   │  AWS   │
│  (Auth AI)  │  (Payment)  │  (Shipping) │   (Push)    │  (S3)  │
└─────────────┴─────────────┴─────────────┴─────────────┴────────┘
```

---

## 🗄️ Database Schema

### Core Tables

#### 1. Users (المستخدمين)

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    avatar_url TEXT,
    
    -- Verification
    is_phone_verified BOOLEAN DEFAULT FALSE,
    is_email_verified BOOLEAN DEFAULT FALSE,
    is_identity_verified BOOLEAN DEFAULT FALSE,
    identity_document_url TEXT,
    
    -- Seller Info
    seller_level VARCHAR(20) DEFAULT 'new', -- new, verified, trusted, pro
    seller_rating DECIMAL(3,2) DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    
    -- Settings
    preferred_language VARCHAR(10) DEFAULT 'ar',
    notification_settings JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_active_at TIMESTAMP
);

CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_seller_level ON users(seller_level);
```

#### 2. Categories (الفئات)

```sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_ar VARCHAR(100) NOT NULL,
    name_en VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    icon VARCHAR(50),
    parent_id UUID REFERENCES categories(id),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Category-specific settings
    requires_authentication BOOLEAN DEFAULT TRUE,
    commission_rate DECIMAL(5,2) DEFAULT 12.00,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed categories
INSERT INTO categories (name_ar, name_en, slug, icon) VALUES
('ساعات', 'Watches', 'watches', '⌚'),
('حقائب', 'Bags', 'bags', '👜'),
('مجوهرات', 'Jewelry', 'jewelry', '💎'),
('ملابس', 'Clothing', 'clothing', '👔'),
('أحذية', 'Shoes', 'shoes', '👞'),
('إكسسوارات', 'Accessories', 'accessories', '🎀');
```

#### 3. Brands (الماركات)

```sql
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    logo_url TEXT,
    country VARCHAR(100),
    
    -- Classification
    tier VARCHAR(20) NOT NULL, -- ultra_luxury, prestige, entry_luxury
    category_id UUID REFERENCES categories(id),
    
    -- Value retention
    avg_value_retention DECIMAL(5,2), -- percentage after 1 year
    
    -- Authentication
    is_entrupy_supported BOOLEAN DEFAULT FALSE,
    authentication_notes TEXT,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Seed luxury brands
INSERT INTO brands (name, slug, tier, category_id) VALUES
-- Watches
('Rolex', 'rolex', 'prestige', (SELECT id FROM categories WHERE slug='watches')),
('Patek Philippe', 'patek-philippe', 'ultra_luxury', (SELECT id FROM categories WHERE slug='watches')),
('Audemars Piguet', 'audemars-piguet', 'ultra_luxury', (SELECT id FROM categories WHERE slug='watches')),
('Omega', 'omega', 'prestige', (SELECT id FROM categories WHERE slug='watches')),
('Cartier', 'cartier', 'prestige', (SELECT id FROM categories WHERE slug='watches')),
('TAG Heuer', 'tag-heuer', 'entry_luxury', (SELECT id FROM categories WHERE slug='watches')),
-- Bags
('Hermès', 'hermes', 'ultra_luxury', (SELECT id FROM categories WHERE slug='bags')),
('Chanel', 'chanel', 'ultra_luxury', (SELECT id FROM categories WHERE slug='bags')),
('Louis Vuitton', 'louis-vuitton', 'prestige', (SELECT id FROM categories WHERE slug='bags')),
('Gucci', 'gucci', 'prestige', (SELECT id FROM categories WHERE slug='bags')),
('Dior', 'dior', 'prestige', (SELECT id FROM categories WHERE slug='bags'));
```

#### 4. Products (المنتجات)

```sql
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) NOT NULL,
    category_id UUID REFERENCES categories(id) NOT NULL,
    brand_id UUID REFERENCES brands(id) NOT NULL,
    
    -- Basic Info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    model VARCHAR(255),
    reference_number VARCHAR(100), -- للساعات
    
    -- Condition
    condition VARCHAR(20) NOT NULL, -- new, excellent, very_good, good, fair
    condition_notes TEXT,
    
    -- Pricing
    price DECIMAL(12,2) NOT NULL,
    original_retail_price DECIMAL(12,2),
    currency VARCHAR(3) DEFAULT 'EGP',
    is_negotiable BOOLEAN DEFAULT TRUE,
    accepts_trade BOOLEAN DEFAULT FALSE,
    
    -- Authentication
    authentication_status VARCHAR(20) DEFAULT 'pending',
    -- pending, ai_verified, expert_verified, fully_verified, rejected
    authentication_certificate_url TEXT,
    entrupy_result JSONB,
    expert_notes TEXT,
    
    -- Watch-specific
    watch_movement VARCHAR(50), -- automatic, manual, quartz
    watch_case_size VARCHAR(20),
    watch_case_material VARCHAR(50),
    watch_dial_color VARCHAR(50),
    watch_bracelet_material VARCHAR(50),
    watch_year INTEGER,
    watch_box_papers BOOLEAN DEFAULT FALSE,
    watch_service_history TEXT,
    
    -- Bag-specific
    bag_size VARCHAR(50),
    bag_material VARCHAR(100),
    bag_color VARCHAR(50),
    bag_hardware_color VARCHAR(50),
    bag_date_code VARCHAR(50),
    bag_includes_dustbag BOOLEAN DEFAULT FALSE,
    bag_includes_box BOOLEAN DEFAULT FALSE,
    
    -- Jewelry-specific
    jewelry_metal VARCHAR(50),
    jewelry_metal_purity VARCHAR(20),
    jewelry_gemstone VARCHAR(100),
    jewelry_certification VARCHAR(50), -- GIA, IGI, etc
    jewelry_carat_weight DECIMAL(6,3),
    
    -- Status
    status VARCHAR(20) DEFAULT 'draft',
    -- draft, pending_review, active, sold, reserved, expired
    
    -- Metrics
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    published_at TIMESTAMP,
    sold_at TIMESTAMP,
    expires_at TIMESTAMP
);

CREATE INDEX idx_products_seller ON products(seller_id);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_status ON products(status);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created ON products(created_at DESC);
```

#### 5. Product Images (صور المنتجات)

```sql
CREATE TABLE product_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    image_type VARCHAR(50), -- main, detail, serial, box, certificate
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_product_images_product ON product_images(product_id);
```

#### 6. Offers (العروض)

```sql
CREATE TABLE offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    buyer_id UUID REFERENCES users(id) NOT NULL,
    
    -- Offer Details
    offer_type VARCHAR(20) NOT NULL, -- cash, trade, mixed
    cash_amount DECIMAL(12,2),
    trade_product_id UUID REFERENCES products(id), -- للمقايضة
    message TEXT,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending',
    -- pending, accepted, rejected, expired, withdrawn
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    responded_at TIMESTAMP
);

CREATE INDEX idx_offers_product ON offers(product_id);
CREATE INDEX idx_offers_buyer ON offers(buyer_id);
CREATE INDEX idx_offers_status ON offers(status);
```

#### 7. Transactions (المعاملات)

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Parties
    seller_id UUID REFERENCES users(id) NOT NULL,
    buyer_id UUID REFERENCES users(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    offer_id UUID REFERENCES offers(id),
    
    -- Type
    transaction_type VARCHAR(20) NOT NULL, -- sale, trade, mixed
    
    -- Amounts
    sale_price DECIMAL(12,2) NOT NULL,
    platform_fee DECIMAL(12,2) NOT NULL,
    seller_payout DECIMAL(12,2) NOT NULL,
    
    -- For trades
    trade_product_id UUID REFERENCES products(id),
    cash_difference DECIMAL(12,2),
    
    -- Status
    status VARCHAR(30) DEFAULT 'pending_payment',
    -- pending_payment, paid, shipped, delivered, 
    -- inspection_period, completed, disputed, refunded
    
    -- Payment
    payment_method VARCHAR(30),
    payment_reference VARCHAR(100),
    escrow_released_at TIMESTAMP,
    
    -- Shipping
    shipping_provider VARCHAR(50),
    tracking_number VARCHAR(100),
    shipped_at TIMESTAMP,
    delivered_at TIMESTAMP,
    
    -- Inspection
    inspection_ends_at TIMESTAMP,
    buyer_confirmed_at TIMESTAMP,
    
    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_transactions_seller ON transactions(seller_id);
CREATE INDEX idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

#### 8. Authentication Records (سجلات التحقق)

```sql
CREATE TABLE authentication_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) NOT NULL,
    
    -- AI Authentication
    ai_provider VARCHAR(50), -- entrupy, custom
    ai_result VARCHAR(20), -- authentic, unidentified, counterfeit
    ai_confidence DECIMAL(5,2),
    ai_response JSONB,
    ai_certificate_url TEXT,
    ai_checked_at TIMESTAMP,
    
    -- Expert Authentication
    expert_id UUID REFERENCES users(id),
    expert_result VARCHAR(20), -- authentic, suspicious, counterfeit
    expert_notes TEXT,
    expert_checked_at TIMESTAMP,
    
    -- Final Result
    final_result VARCHAR(20),
    final_certificate_url TEXT,
    blockchain_hash VARCHAR(100),
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 9. Reviews (التقييمات)

```sql
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id) NOT NULL,
    
    -- Who reviews whom
    reviewer_id UUID REFERENCES users(id) NOT NULL,
    reviewed_id UUID REFERENCES users(id) NOT NULL,
    review_type VARCHAR(20) NOT NULL, -- buyer_to_seller, seller_to_buyer
    
    -- Rating
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Detailed ratings
    item_as_described INTEGER CHECK (item_as_described >= 1 AND item_as_described <= 5),
    communication INTEGER CHECK (communication >= 1 AND communication <= 5),
    shipping_speed INTEGER CHECK (shipping_speed >= 1 AND shipping_speed <= 5),
    
    -- Content
    comment TEXT,
    
    -- Response
    response TEXT,
    responded_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);
```

#### 10. Price History (تاريخ الأسعار)

```sql
CREATE TABLE price_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    brand_id UUID REFERENCES brands(id) NOT NULL,
    model VARCHAR(255) NOT NULL,
    reference_number VARCHAR(100),
    
    -- Price Data
    avg_price DECIMAL(12,2) NOT NULL,
    min_price DECIMAL(12,2),
    max_price DECIMAL(12,2),
    sample_size INTEGER,
    
    -- Source
    source VARCHAR(50), -- chrono24, internal, market_research
    
    -- Period
    recorded_at TIMESTAMP DEFAULT NOW(),
    period VARCHAR(20) -- daily, weekly, monthly
);

CREATE INDEX idx_price_history_brand ON price_history(brand_id);
CREATE INDEX idx_price_history_model ON price_history(model);
CREATE INDEX idx_price_history_date ON price_history(recorded_at);
```

#### 11. Favorites (المفضلات)

```sql
CREATE TABLE favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    product_id UUID REFERENCES products(id) NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(user_id, product_id)
);
```

#### 12. Notifications (الإشعارات)

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    type VARCHAR(50) NOT NULL,
    title_ar VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    body_ar TEXT,
    body_en TEXT,
    
    -- Reference
    reference_type VARCHAR(50),
    reference_id UUID,
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(user_id, is_read);
```

---

## 🔌 API Endpoints

### Authentication

```
POST   /api/auth/send-otp          # إرسال OTP
POST   /api/auth/verify-otp        # التحقق من OTP
POST   /api/auth/refresh           # تجديد التوكن
POST   /api/auth/logout            # تسجيل الخروج
```

### Users

```
GET    /api/users/me               # الملف الشخصي
PUT    /api/users/me               # تحديث الملف الشخصي
POST   /api/users/verify-identity  # رفع وثائق الهوية
GET    /api/users/:id/public       # الملف العام للبائع
GET    /api/users/:id/products     # منتجات البائع
GET    /api/users/:id/reviews      # تقييمات البائع
```

### Products

```
GET    /api/products               # قائمة المنتجات (مع فلاتر)
GET    /api/products/:id           # تفاصيل منتج
POST   /api/products               # إضافة منتج جديد
PUT    /api/products/:id           # تحديث منتج
DELETE /api/products/:id           # حذف منتج

POST   /api/products/:id/images    # رفع صور
DELETE /api/products/:id/images/:imageId  # حذف صورة

POST   /api/products/:id/publish   # نشر المنتج
POST   /api/products/:id/unpublish # إلغاء النشر

GET    /api/products/:id/similar   # منتجات مشابهة
GET    /api/products/:id/price-history  # تاريخ الأسعار
```

### Search

```
GET    /api/search                 # بحث متقدم
GET    /api/search/suggestions     # اقتراحات البحث
GET    /api/search/filters         # الفلاتر المتاحة
```

### Offers

```
GET    /api/offers/sent            # العروض المرسلة
GET    /api/offers/received        # العروض المستلمة
POST   /api/offers                 # تقديم عرض
PUT    /api/offers/:id/accept      # قبول عرض
PUT    /api/offers/:id/reject      # رفض عرض
PUT    /api/offers/:id/withdraw    # سحب عرض
POST   /api/offers/:id/counter     # عرض مضاد
```

### Transactions

```
GET    /api/transactions           # معاملاتي
GET    /api/transactions/:id       # تفاصيل معاملة
POST   /api/transactions/:id/pay   # دفع
POST   /api/transactions/:id/ship  # تأكيد الشحن
POST   /api/transactions/:id/confirm  # تأكيد الاستلام
POST   /api/transactions/:id/dispute  # فتح نزاع
```

### Authentication (Product)

```
POST   /api/authentication/request    # طلب تحقق
GET    /api/authentication/:productId # نتيجة التحقق
POST   /api/authentication/ai-check   # فحص AI
POST   /api/authentication/expert-review  # مراجعة خبير
```

### Favorites

```
GET    /api/favorites              # المفضلات
POST   /api/favorites/:productId   # إضافة للمفضلة
DELETE /api/favorites/:productId   # إزالة من المفضلة
```

### Reviews

```
POST   /api/reviews                # كتابة تقييم
PUT    /api/reviews/:id/respond    # الرد على تقييم
```

### Notifications

```
GET    /api/notifications          # الإشعارات
PUT    /api/notifications/:id/read # تحديد كمقروء
PUT    /api/notifications/read-all # تحديد الكل كمقروء
```

### Prices

```
GET    /api/prices/estimate        # تقدير سعر منتج
GET    /api/prices/history/:brandId/:model  # تاريخ أسعار موديل
GET    /api/prices/trends          # اتجاهات الأسعار
```

---

## 🔐 Authentication Flow

### OTP Authentication

```typescript
// 1. Send OTP
POST /api/auth/send-otp
Body: { phone: "+201234567890" }
Response: { success: true, expiresIn: 120 }

// 2. Verify OTP
POST /api/auth/verify-otp
Body: { phone: "+201234567890", otp: "123456" }
Response: {
  accessToken: "eyJ...",
  refreshToken: "eyJ...",
  user: { id, phone, fullName, ... },
  isNewUser: true/false
}

// 3. Refresh Token
POST /api/auth/refresh
Body: { refreshToken: "eyJ..." }
Response: { accessToken: "eyJ..." }
```

### JWT Structure

```typescript
// Access Token (expires: 1 hour)
{
  sub: "user-uuid",
  phone: "+201234567890",
  role: "user" | "expert" | "admin",
  sellerLevel: "new" | "verified" | "trusted" | "pro",
  iat: 1234567890,
  exp: 1234571490
}

// Refresh Token (expires: 30 days)
{
  sub: "user-uuid",
  type: "refresh",
  iat: 1234567890,
  exp: 1237159890
}
```

---

## 💳 Payment Flow

### Escrow System

```
┌─────────────────────────────────────────────────────────────────┐
│                     ESCROW PAYMENT FLOW                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. Buyer → Xchange Escrow                                      │
│     └── المشتري يدفع المبلغ كاملاً                              │
│                                                                  │
│  2. Xchange → Seller Notification                               │
│     └── إشعار البائع بالدفع                                     │
│                                                                  │
│  3. Seller → Ships Product                                      │
│     └── البائع يشحن المنتج                                      │
│                                                                  │
│  4. Buyer → Receives & Inspects (14 days)                       │
│     └── المشتري يفحص المنتج                                     │
│                                                                  │
│  5a. Buyer Confirms → Escrow releases to Seller                 │
│      └── المشتري يؤكد → المبلغ يصل للبائع                       │
│                                                                  │
│  5b. Buyer Disputes → Review process                            │
│      └── المشتري يعترض → مراجعة النزاع                          │
│                                                                  │
│  5c. No Action (14 days) → Auto-release to Seller               │
│      └── لا إجراء → المبلغ يصل للبائع تلقائياً                  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Paymob Integration

```typescript
// Create Payment Intent
const createPayment = async (transaction: Transaction) => {
  // 1. Auth Request
  const authToken = await paymob.authenticate(API_KEY);
  
  // 2. Order Registration
  const order = await paymob.registerOrder({
    auth_token: authToken,
    amount_cents: transaction.salePrice * 100,
    currency: "EGP",
    merchant_order_id: transaction.id,
    items: [{
      name: transaction.product.title,
      amount_cents: transaction.salePrice * 100,
      quantity: 1
    }]
  });
  
  // 3. Payment Key
  const paymentKey = await paymob.getPaymentKey({
    auth_token: authToken,
    order_id: order.id,
    amount_cents: transaction.salePrice * 100,
    currency: "EGP",
    billing_data: {
      first_name: transaction.buyer.firstName,
      last_name: transaction.buyer.lastName,
      phone_number: transaction.buyer.phone,
      email: transaction.buyer.email
    }
  });
  
  return paymentKey;
};
```

---

## 🤖 AI Authentication Integration

### Entrupy API

```typescript
interface EntrupyAuthRequest {
  images: string[];  // Base64 encoded images
  brand: string;
  category: 'handbag' | 'sneaker';
  metadata?: {
    model?: string;
    color?: string;
    size?: string;
  };
}

interface EntrupyAuthResponse {
  result: 'Authentic' | 'Unidentified' | 'Not Authentic';
  confidence: number;  // 0-100
  certificateUrl: string;
  details: {
    checksPerformed: string[];
    flaggedAreas?: string[];
  };
}

// Service Implementation
class EntrupyService {
  private apiKey: string;
  private baseUrl = 'https://api.entrupy.com/v1';
  
  async authenticate(product: Product): Promise<AuthResult> {
    const images = await this.prepareImages(product.images);
    
    const response = await fetch(`${this.baseUrl}/authenticate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        images,
        brand: product.brand.name,
        category: this.mapCategory(product.category),
        metadata: {
          model: product.model,
          color: product.bagColor || product.watchDialColor
        }
      })
    });
    
    return response.json();
  }
}
```

### Custom AI Model (للساعات)

```typescript
// Watch Authentication Points
const watchAuthenticationChecks = [
  'serial_number_verification',
  'movement_inspection',
  'case_back_engraving',
  'dial_printing_quality',
  'crown_logo_detail',
  'bracelet_clasp_quality',
  'lume_application',
  'date_magnification',
  'bezel_alignment',
  'weight_verification'
];

// Price Estimation Model
interface PriceEstimation {
  estimatedPrice: number;
  priceRange: {
    low: number;
    high: number;
  };
  factors: {
    brandPremium: number;
    conditionAdjustment: number;
    marketDemand: number;
    rarity: number;
    completeness: number;  // box, papers
  };
  comparables: Product[];
}
```

---

## 🔍 Search & Filtering

### Elasticsearch Mapping

```json
{
  "mappings": {
    "properties": {
      "id": { "type": "keyword" },
      "title": { 
        "type": "text",
        "analyzer": "arabic",
        "fields": {
          "keyword": { "type": "keyword" }
        }
      },
      "description": { "type": "text", "analyzer": "arabic" },
      "brand": {
        "properties": {
          "id": { "type": "keyword" },
          "name": { "type": "keyword" },
          "tier": { "type": "keyword" }
        }
      },
      "category": {
        "properties": {
          "id": { "type": "keyword" },
          "slug": { "type": "keyword" }
        }
      },
      "price": { "type": "float" },
      "condition": { "type": "keyword" },
      "authentication_status": { "type": "keyword" },
      "location": { "type": "geo_point" },
      "created_at": { "type": "date" },
      "seller": {
        "properties": {
          "id": { "type": "keyword" },
          "level": { "type": "keyword" },
          "rating": { "type": "float" }
        }
      }
    }
  }
}
```

### Search Query Builder

```typescript
interface SearchFilters {
  query?: string;
  category?: string;
  brands?: string[];
  priceMin?: number;
  priceMax?: number;
  condition?: string[];
  authenticationStatus?: string[];
  sellerLevel?: string[];
  location?: {
    lat: number;
    lng: number;
    radius: number;
  };
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'relevance';
}

const buildSearchQuery = (filters: SearchFilters) => {
  const must: any[] = [];
  const filter: any[] = [];
  
  if (filters.query) {
    must.push({
      multi_match: {
        query: filters.query,
        fields: ['title^3', 'description', 'brand.name^2', 'model']
      }
    });
  }
  
  if (filters.category) {
    filter.push({ term: { 'category.slug': filters.category }});
  }
  
  if (filters.brands?.length) {
    filter.push({ terms: { 'brand.id': filters.brands }});
  }
  
  if (filters.priceMin || filters.priceMax) {
    filter.push({
      range: {
        price: {
          gte: filters.priceMin || 0,
          lte: filters.priceMax || 999999999
        }
      }
    });
  }
  
  return {
    query: {
      bool: { must, filter }
    },
    sort: getSortOrder(filters.sortBy)
  };
};
```

---

## 📱 Real-time Features

### WebSocket Events

```typescript
// Socket.io Event Types
enum SocketEvents {
  // Offers
  NEW_OFFER = 'offer:new',
  OFFER_ACCEPTED = 'offer:accepted',
  OFFER_REJECTED = 'offer:rejected',
  
  // Transactions
  PAYMENT_RECEIVED = 'transaction:paid',
  ITEM_SHIPPED = 'transaction:shipped',
  ITEM_DELIVERED = 'transaction:delivered',
  
  // Messages
  NEW_MESSAGE = 'message:new',
  
  // Notifications
  NOTIFICATION = 'notification:new',
  
  // Price Alerts
  PRICE_ALERT = 'price:alert'
}

// Client Connection
const socket = io('wss://api.xchange.com', {
  auth: { token: accessToken }
});

socket.on(SocketEvents.NEW_OFFER, (offer) => {
  showNotification(`عرض جديد: ${offer.amount} ج.م`);
});
```

---

## 🚀 Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS ARCHITECTURE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  CloudFront (CDN)                                               │
│       │                                                          │
│       ▼                                                          │
│  ┌─────────────────┐                                            │
│  │  S3 (Frontend)  │                                            │
│  └─────────────────┘                                            │
│                                                                  │
│  Route 53 → ALB → ECS Cluster                                   │
│                    │                                             │
│              ┌─────┴─────┐                                      │
│              │           │                                       │
│         API Tasks   Worker Tasks                                │
│              │           │                                       │
│              └─────┬─────┘                                      │
│                    │                                             │
│  ┌─────────┬───────┼───────┬─────────┐                         │
│  │         │       │       │         │                          │
│  RDS    ElastiCache   SQS   S3     Elasticsearch               │
│(Postgres) (Redis)  (Queue)(Media)  (Search)                    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Monitoring & Analytics

### Key Metrics

```typescript
// Business Metrics
const businessMetrics = {
  gmv: 'Total Gross Merchandise Value',
  transactionCount: 'Number of completed transactions',
  avgOrderValue: 'Average transaction value',
  conversionRate: 'Views to purchase ratio',
  returnRate: 'Returns/disputes percentage',
  authenticationAccuracy: 'AI vs expert agreement rate'
};

// Technical Metrics
const technicalMetrics = {
  apiLatency: 'P95 response time',
  errorRate: '5xx error percentage',
  uptime: 'Service availability',
  searchLatency: 'Search response time',
  imageUploadTime: 'Image processing time'
};
```

---

*آخر تحديث: ديسمبر 2024*
