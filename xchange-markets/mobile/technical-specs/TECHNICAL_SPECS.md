# 📱 Xchange Mobile Marketplace - Technical Specifications
## المواصفات التقنية الكاملة لسوق الموبايلات

---

## 1. Technology Stack

### Frontend (Mobile-First)
```yaml
Framework: Next.js 14 (App Router)
Language: TypeScript
Styling: Tailwind CSS + Shadcn/ui
State: Zustand + React Query
Forms: React Hook Form + Zod
i18n: next-intl (Arabic RTL first)
PWA: next-pwa
```

### Backend
```yaml
Runtime: Node.js 20 LTS
Framework: Express.js / Fastify
Language: TypeScript
ORM: Prisma
Database: PostgreSQL 16
Cache: Redis
Queue: BullMQ
Search: Meilisearch (Arabic support)
Storage: S3-compatible (Cloudflare R2)
```

### Infrastructure
```yaml
Hosting: Vercel (Frontend) + Railway/Render (Backend)
CDN: Cloudflare
Monitoring: Sentry + Posthog
CI/CD: GitHub Actions
```

---

## 2. Database Schema

### Core Tables

```sql
-- Users & Authentication
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone VARCHAR(20) UNIQUE NOT NULL,  -- Egyptian phone: +201XXXXXXXXX
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255),
    full_name_ar VARCHAR(255) NOT NULL,
    full_name_en VARCHAR(255),
    national_id VARCHAR(14) UNIQUE,     -- Egyptian National ID
    national_id_verified BOOLEAN DEFAULT FALSE,
    profile_image_url TEXT,
    
    -- Trust System
    trust_level ENUM('new', 'verified', 'trusted', 'pro') DEFAULT 'new',
    trust_score INTEGER DEFAULT 0,
    total_sales INTEGER DEFAULT 0,
    total_purchases INTEGER DEFAULT 0,
    total_barters INTEGER DEFAULT 0,
    
    -- Location
    governorate VARCHAR(100),           -- المحافظة
    city VARCHAR(100),                  -- المدينة
    area VARCHAR(255),                  -- المنطقة
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Phone Listings
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id),
    
    -- Device Info
    brand VARCHAR(100) NOT NULL,        -- Samsung, Apple, Xiaomi...
    model VARCHAR(255) NOT NULL,        -- iPhone 15 Pro Max
    storage_gb INTEGER NOT NULL,        -- 128, 256, 512...
    color VARCHAR(100),
    
    -- Verification (الميزة التنافسية الأساسية)
    imei VARCHAR(15) NOT NULL UNIQUE,
    imei_verified BOOLEAN DEFAULT FALSE,
    imei_status ENUM('clean', 'blacklisted', 'financed', 'locked') DEFAULT 'clean',
    ntra_registered BOOLEAN DEFAULT FALSE,  -- تسجيل NTRA الجديد
    
    -- Condition & Grading
    condition_grade ENUM('A', 'B', 'C', 'D') NOT NULL,
    battery_health INTEGER,             -- 80-100%
    screen_condition ENUM('perfect', 'minor_scratches', 'cracked', 'replaced'),
    body_condition ENUM('like_new', 'good', 'fair', 'poor'),
    original_parts BOOLEAN DEFAULT TRUE,
    has_box BOOLEAN DEFAULT FALSE,
    has_accessories BOOLEAN DEFAULT FALSE,
    
    -- Pricing
    price_egp DECIMAL(10,2) NOT NULL,
    negotiable BOOLEAN DEFAULT TRUE,
    accepts_barter BOOLEAN DEFAULT FALSE,
    barter_preferences JSONB,           -- What they want in exchange
    
    -- Media
    images JSONB NOT NULL,              -- Array of image URLs
    verification_image_url TEXT,        -- صورة التحقق مع الرمز
    
    -- Location
    governorate VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    
    -- Status
    status ENUM('draft', 'pending_review', 'active', 'sold', 'reserved', 'expired', 'rejected') DEFAULT 'draft',
    rejection_reason TEXT,
    featured BOOLEAN DEFAULT FALSE,
    featured_until TIMESTAMP,
    views_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- IMEI Verification Records
CREATE TABLE imei_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id),
    imei VARCHAR(15) NOT NULL,
    
    -- Check Results
    is_blacklisted BOOLEAN,
    is_stolen BOOLEAN,
    is_financed BOOLEAN,
    carrier_lock_status VARCHAR(50),
    original_carrier VARCHAR(100),
    
    -- Device Validation
    reported_model VARCHAR(255),
    actual_model VARCHAR(255),
    model_matches BOOLEAN,
    
    -- NTRA Egypt
    ntra_registration_status VARCHAR(50),
    ntra_check_date TIMESTAMP,
    
    -- Provider
    verification_provider VARCHAR(100),  -- IMEI.org, GSMA, etc.
    raw_response JSONB,
    
    verified_at TIMESTAMP DEFAULT NOW()
);

-- Device Diagnostics
CREATE TABLE device_diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id),
    
    -- Battery
    battery_health_percent INTEGER,
    battery_cycle_count INTEGER,
    battery_original BOOLEAN,
    
    -- Screen
    dead_pixels_count INTEGER,
    touch_responsive BOOLEAN,
    screen_original BOOLEAN,
    
    -- Hardware
    cameras_functional BOOLEAN,
    speakers_functional BOOLEAN,
    microphone_functional BOOLEAN,
    sensors_functional BOOLEAN,
    buttons_functional BOOLEAN,
    
    -- Overall
    diagnostic_score INTEGER,           -- 0-100
    diagnostic_provider VARCHAR(100),   -- NSYS, Phonecheck
    raw_report JSONB,
    
    diagnosed_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id),
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    
    -- Type
    transaction_type ENUM('sale', 'barter', 'barter_with_cash') NOT NULL,
    
    -- Pricing
    agreed_price_egp DECIMAL(10,2),
    platform_fee_egp DECIMAL(10,2),
    seller_payout_egp DECIMAL(10,2),
    
    -- For Barter
    barter_listing_id UUID REFERENCES listings(id),
    cash_difference_egp DECIMAL(10,2),
    cash_paid_by ENUM('buyer', 'seller'),
    
    -- Payment
    payment_method ENUM('escrow', 'cod', 'fawry', 'instapay', 'wallet', 'bnpl'),
    payment_status ENUM('pending', 'held', 'released', 'refunded', 'disputed'),
    escrow_held_at TIMESTAMP,
    escrow_released_at TIMESTAMP,
    
    -- Delivery
    delivery_method ENUM('meetup', 'bosta', 'aramex', 'egypt_post'),
    delivery_status ENUM('pending', 'shipped', 'in_transit', 'delivered', 'returned'),
    tracking_number VARCHAR(100),
    
    -- Inspection Period
    inspection_starts_at TIMESTAMP,
    inspection_ends_at TIMESTAMP,
    buyer_confirmed BOOLEAN DEFAULT FALSE,
    
    -- Status
    status ENUM('initiated', 'payment_pending', 'payment_held', 'shipping', 'delivered', 'inspection', 'completed', 'disputed', 'cancelled', 'refunded') DEFAULT 'initiated',
    
    created_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Barter Matches (خوارزمية المقايضة)
CREATE TABLE barter_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Match Type
    match_type ENUM('direct', 'three_way', 'chain') NOT NULL,
    
    -- Participants (JSONB for flexibility with multi-party)
    participants JSONB NOT NULL,
    /*
    Example for 3-way:
    [
        {"user_id": "xxx", "offers_listing_id": "aaa", "wants_listing_id": "bbb"},
        {"user_id": "yyy", "offers_listing_id": "bbb", "wants_listing_id": "ccc"},
        {"user_id": "zzz", "offers_listing_id": "ccc", "wants_listing_id": "aaa"}
    ]
    */
    
    -- Value Calculation
    total_value_egp DECIMAL(12,2),
    cash_settlements JSONB,             -- Who pays whom
    
    -- Matching Score
    match_score DECIMAL(5,2),           -- Algorithm confidence 0-100
    location_compatible BOOLEAN,
    
    -- Status
    status ENUM('proposed', 'all_accepted', 'partially_accepted', 'expired', 'completed', 'cancelled') DEFAULT 'proposed',
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Reviews & Ratings
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    reviewer_id UUID REFERENCES users(id),
    reviewee_id UUID REFERENCES users(id),
    
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    
    -- Detailed Ratings
    accuracy_rating INTEGER,            -- وصف دقيق
    communication_rating INTEGER,       -- تواصل
    speed_rating INTEGER,               -- سرعة
    
    comment_ar TEXT,
    comment_en TEXT,
    
    -- Verification
    is_verified_purchase BOOLEAN DEFAULT TRUE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Disputes
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID REFERENCES transactions(id),
    initiated_by UUID REFERENCES users(id),
    
    reason ENUM('not_as_described', 'fake_device', 'not_received', 'damaged_in_shipping', 'seller_unresponsive', 'other'),
    description_ar TEXT,
    evidence_urls JSONB,
    
    -- Resolution
    status ENUM('open', 'under_review', 'mediation', 'resolved', 'escalated') DEFAULT 'open',
    resolution ENUM('refund_full', 'refund_partial', 'no_refund', 'return_required'),
    resolution_notes TEXT,
    resolved_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Favorites/Watchlist
CREATE TABLE favorites (
    user_id UUID REFERENCES users(id),
    listing_id UUID REFERENCES listings(id),
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (user_id, listing_id)
);

-- Search & Price Alerts
CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    brand VARCHAR(100),
    model VARCHAR(255),
    max_price_egp DECIMAL(10,2),
    min_condition_grade ENUM('A', 'B', 'C', 'D'),
    governorate VARCHAR(100),
    
    is_active BOOLEAN DEFAULT TRUE,
    last_notified_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    
    type ENUM('listing_approved', 'new_message', 'price_drop', 'barter_match', 'payment_received', 'review_received', 'dispute_update'),
    title_ar VARCHAR(255),
    title_en VARCHAR(255),
    body_ar TEXT,
    body_en TEXT,
    data JSONB,
    
    is_read BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_listings_brand_model ON listings(brand, model);
CREATE INDEX idx_listings_price ON listings(price_egp);
CREATE INDEX idx_listings_governorate ON listings(governorate);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_listings_condition ON listings(condition_grade);
CREATE INDEX idx_listings_barter ON listings(accepts_barter) WHERE accepts_barter = TRUE;
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_users_trust ON users(trust_level, trust_score);
```

---

## 3. API Endpoints

### Authentication
```yaml
POST /api/auth/send-otp:
  body: { phone: "+201XXXXXXXXX" }
  response: { success: true, expires_in: 120 }

POST /api/auth/verify-otp:
  body: { phone: "+201XXXXXXXXX", otp: "123456" }
  response: { token: "jwt...", user: {...} }

POST /api/auth/refresh:
  headers: { Authorization: "Bearer refresh_token" }
  response: { access_token: "jwt..." }
```

### Listings
```yaml
GET /api/listings:
  query: 
    - brand: string
    - model: string
    - min_price: number
    - max_price: number
    - condition: A|B|C|D
    - governorate: string
    - accepts_barter: boolean
    - sort: price_asc|price_desc|newest|popular
    - page: number
    - limit: number
  response: { listings: [...], total: number, page: number }

GET /api/listings/:id:
  response: { listing: {...}, seller: {...}, similar: [...] }

POST /api/listings:
  auth: required
  body:
    brand: string
    model: string
    storage_gb: number
    imei: string
    condition_grade: A|B|C|D
    battery_health: number
    price_egp: number
    accepts_barter: boolean
    barter_preferences: object
    images: string[]
  response: { listing: {...}, verification_code: "XCH-XXXXX" }

PUT /api/listings/:id:
  auth: required (owner only)

DELETE /api/listings/:id:
  auth: required (owner only)

POST /api/listings/:id/verify-image:
  auth: required
  body: { verification_image: File }
  description: "Upload photo with device showing verification code"
```

### IMEI Verification
```yaml
POST /api/verify/imei:
  auth: required
  body: { imei: "XXXXXXXXXXXXXXX" }
  response:
    is_clean: boolean
    is_blacklisted: boolean
    carrier_status: string
    ntra_registered: boolean
    device_info:
      brand: string
      model: string
      specs: object

GET /api/verify/imei/:imei/certificate:
  response: PDF certificate
```

### Barter System
```yaml
GET /api/barter/matches:
  auth: required
  query: { listing_id: uuid }
  response: 
    direct_matches: [...]
    multi_party_matches: [...]

POST /api/barter/propose:
  auth: required
  body:
    my_listing_id: uuid
    their_listing_id: uuid
    cash_offer: number (optional)
    message: string
  response: { barter_request: {...} }

POST /api/barter/respond:
  auth: required
  body:
    barter_id: uuid
    action: accept|reject|counter
    counter_offer: number (optional)

GET /api/barter/suggestions:
  auth: required
  description: "AI-powered barter suggestions based on user's listings and wishlist"
  response: { suggestions: [...] }
```

### Transactions
```yaml
POST /api/transactions/initiate:
  auth: required
  body:
    listing_id: uuid
    payment_method: escrow|cod|fawry|instapay
    delivery_method: meetup|bosta|aramex
    delivery_address: object (if shipping)

POST /api/transactions/:id/pay:
  auth: required
  response: { payment_url: string } | { escrow_status: "held" }

POST /api/transactions/:id/confirm-delivery:
  auth: required (buyer)
  body: { condition_ok: boolean, notes: string }

POST /api/transactions/:id/release-payment:
  auth: system (after inspection period)

POST /api/transactions/:id/dispute:
  auth: required
  body: { reason: string, description: string, evidence: File[] }
```

### Reviews
```yaml
POST /api/reviews:
  auth: required
  body:
    transaction_id: uuid
    rating: 1-5
    accuracy_rating: 1-5
    communication_rating: 1-5
    speed_rating: 1-5
    comment: string

GET /api/users/:id/reviews:
  response: { reviews: [...], average_rating: number, total: number }
```

---

## 4. Barter Algorithm (خوارزمية المقايضة)

### Direct Match (مطابقة مباشرة)
```typescript
interface DirectMatch {
  user_a: { has: Listing, wants: ListingCriteria }
  user_b: { has: Listing, wants: ListingCriteria }
  value_difference: number
  cash_settlement: { payer: 'a' | 'b', amount: number }
  match_score: number
}

function findDirectMatches(listing: Listing): DirectMatch[] {
  // 1. Find listings that match what this user wants
  const potentialMatches = await db.listings.findMany({
    where: {
      brand: { in: listing.barter_preferences.wanted_brands },
      price_egp: { 
        gte: listing.price_egp * 0.7,  // 30% tolerance
        lte: listing.price_egp * 1.3 
      },
      accepts_barter: true,
      status: 'active',
      seller_id: { not: listing.seller_id }
    }
  });
  
  // 2. Check if those sellers want what this user has
  const matches = potentialMatches.filter(match => {
    return matchesCriteria(listing, match.barter_preferences);
  });
  
  // 3. Calculate value difference and score
  return matches.map(match => ({
    ...calculateMatchDetails(listing, match),
    match_score: calculateMatchScore(listing, match)
  }));
}
```

### Multi-Party Match (مطابقة متعددة الأطراف)
```typescript
interface MultiPartyMatch {
  participants: Array<{
    user_id: string
    offers: Listing
    receives: Listing
  }>
  chain_length: number
  total_value: number
  cash_settlements: CashSettlement[]
  match_score: number
}

function findMultiPartyMatches(listing: Listing, maxChainLength = 4): MultiPartyMatch[] {
  // Graph-based approach
  // 1. Build a directed graph where:
  //    - Nodes = Listings that accept barter
  //    - Edge A→B exists if owner of A wants something like B
  
  // 2. Find cycles that include the given listing
  //    Using modified DFS with cycle detection
  
  // 3. For each cycle found:
  //    - Calculate total value flow
  //    - Determine cash settlements to balance
  //    - Score based on value alignment and location proximity
  
  const graph = buildBarterGraph();
  const cycles = findCyclesIncluding(graph, listing.id, maxChainLength);
  
  return cycles.map(cycle => ({
    participants: cycle.nodes.map(nodeToParticipant),
    chain_length: cycle.length,
    total_value: calculateChainValue(cycle),
    cash_settlements: balanceChain(cycle),
    match_score: scoreChain(cycle)
  }));
}

function calculateMatchScore(listing1: Listing, listing2: Listing): number {
  let score = 0;
  
  // Value alignment (40% weight)
  const valueDiff = Math.abs(listing1.price_egp - listing2.price_egp);
  const valueScore = Math.max(0, 100 - (valueDiff / listing1.price_egp * 100));
  score += valueScore * 0.4;
  
  // Location proximity (25% weight)
  if (listing1.governorate === listing2.governorate) score += 25;
  else if (areNeighboringGovernorates(listing1.governorate, listing2.governorate)) score += 15;
  
  // Condition compatibility (20% weight)
  const conditionDiff = Math.abs(
    gradeToNumber(listing1.condition_grade) - 
    gradeToNumber(listing2.condition_grade)
  );
  score += (4 - conditionDiff) * 5;
  
  // Trust score of other party (15% weight)
  const otherUserTrust = await getUserTrustScore(listing2.seller_id);
  score += otherUserTrust * 0.15;
  
  return score;
}
```

---

## 5. Commission Structure (هيكل العمولات)

```typescript
const COMMISSION_STRUCTURE = {
  // Standard Sale
  sale: {
    buyer_fee_percent: 0,           // Free for buyers (جذب المشترين)
    seller_fee_percent: 5,          // 5% من البائع
    min_fee_egp: 50,                // حد أدنى 50 جنيه
    max_fee_egp: 2000               // حد أقصى 2000 جنيه
  },
  
  // Barter
  barter: {
    per_party_fee_percent: 2.5,     // 2.5% من كل طرف
    min_fee_egp: 25,
    // Cash difference also charged at 5%
    cash_difference_fee_percent: 5
  },
  
  // Featured Listings
  featured: {
    '7_days': 99,                   // 99 جنيه لمدة 7 أيام
    '14_days': 179,
    '30_days': 299,
    'top_of_search': 49             // يومياً
  },
  
  // Premium Seller
  premium_subscription: {
    monthly: 299,
    yearly: 2499,                   // خصم 30%
    benefits: [
      'unlimited_featured',
      'priority_support',
      'advanced_analytics',
      'verified_badge',
      'lower_commission'            // 3% instead of 5%
    ]
  },
  
  // Extended Warranty (شراكة)
  extended_warranty: {
    '6_months': { price: 299, margin_percent: 30 },
    '12_months': { price: 499, margin_percent: 30 },
    '24_months': { price: 799, margin_percent: 30 }
  }
};
```

---

## 6. Security Requirements

### Authentication
```typescript
// JWT with short-lived access tokens
const AUTH_CONFIG = {
  access_token_expiry: '15m',
  refresh_token_expiry: '7d',
  otp_expiry: 120,                  // seconds
  max_otp_attempts: 3,
  lockout_duration: '30m'
};

// Rate limiting
const RATE_LIMITS = {
  'auth/send-otp': '3/minute',
  'listings/create': '10/hour',
  'messages/send': '60/minute',
  'search': '100/minute'
};
```

### Data Protection
```typescript
// Encryption
const ENCRYPTION = {
  passwords: 'bcrypt with cost 12',
  national_ids: 'AES-256-GCM',
  payment_data: 'handled by Paymob (PCI compliant)',
  at_rest: 'PostgreSQL TDE',
  in_transit: 'TLS 1.3'
};

// Data retention
const RETENTION = {
  transactions: '7 years',          // Legal requirement
  messages: '2 years',
  listings_inactive: '1 year',
  user_data_after_deletion: '30 days'
};
```

---

## 7. MVP Scope (Phase 1)

### Must Have
- [ ] User registration with phone OTP
- [ ] Create listing with basic verification
- [ ] IMEI verification (basic blacklist check)
- [ ] Search and filter listings
- [ ] Direct messaging between users
- [ ] Manual escrow (admin-assisted)
- [ ] Basic review system
- [ ] Arabic-first UI

### Should Have
- [ ] Full IMEI verification with NTRA
- [ ] Automated escrow with Paymob
- [ ] Direct barter (2-party)
- [ ] Push notifications
- [ ] Price history and alerts

### Nice to Have
- [ ] Multi-party barter
- [ ] AI-powered pricing suggestions
- [ ] Device diagnostics integration
- [ ] BNPL integration
- [ ] Extended warranty marketplace

---

## 8. File Structure for Claude Code

```
xchange-mobile/
├── apps/
│   ├── web/                    # Next.js frontend
│   │   ├── app/
│   │   │   ├── [locale]/       # i18n (ar, en)
│   │   │   ├── (auth)/
│   │   │   ├── (marketplace)/
│   │   │   └── api/
│   │   ├── components/
│   │   ├── lib/
│   │   └── styles/
│   │
│   └── api/                    # Express/Fastify backend
│       ├── src/
│       │   ├── modules/
│       │   │   ├── auth/
│       │   │   ├── listings/
│       │   │   ├── barter/
│       │   │   ├── transactions/
│       │   │   └── users/
│       │   ├── services/
│       │   │   ├── imei/
│       │   │   ├── payment/
│       │   │   └── notification/
│       │   └── utils/
│       └── prisma/
│           └── schema.prisma
│
├── packages/
│   ├── shared/                 # Shared types & utilities
│   └── ui/                     # Shared components
│
└── docs/
    ├── MOBILE_MARKETPLACE_PLAN_AR.docx
    ├── TECHNICAL_SPECS.md
    └── API_DOCS.yaml
```

---

*Document Version: 1.0*
*Last Updated: December 2024*
*For: Claude Code Development*
