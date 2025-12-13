-- =====================================================
-- CREATE TABLE Statements for Mobile Marketplace
-- جداول سوق الموبايلات - XChange Egypt
-- Run this BEFORE running mobiles_comprehensive_seed.sql
-- =====================================================

-- =====================================================
-- ENUM Types (أنواع التعداد)
-- =====================================================

-- Mobile Brand
DO $$ BEGIN
    CREATE TYPE "MobileBrand" AS ENUM (
        'APPLE', 'SAMSUNG', 'XIAOMI', 'OPPO', 'VIVO', 'REALME',
        'HUAWEI', 'HONOR', 'ONEPLUS', 'GOOGLE', 'MOTOROLA', 'NOKIA',
        'INFINIX', 'TECNO', 'ITEL', 'NOTHING', 'ASUS', 'SONY', 'LG', 'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Condition Grade
DO $$ BEGIN
    CREATE TYPE "MobileConditionGrade" AS ENUM ('A', 'B', 'C', 'D');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Screen Condition
DO $$ BEGIN
    CREATE TYPE "MobileScreenCondition" AS ENUM ('PERFECT', 'MINOR_SCRATCHES', 'CRACKED', 'REPLACED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Body Condition
DO $$ BEGIN
    CREATE TYPE "MobileBodyCondition" AS ENUM ('LIKE_NEW', 'GOOD', 'FAIR', 'POOR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile IMEI Status
DO $$ BEGIN
    CREATE TYPE "MobileIMEIStatus" AS ENUM ('CLEAN', 'BLACKLISTED', 'FINANCED', 'LOCKED', 'UNKNOWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Listing Status
DO $$ BEGIN
    CREATE TYPE "MobileListingStatus" AS ENUM (
        'DRAFT', 'PENDING_REVIEW', 'ACTIVE', 'SOLD', 'RESERVED', 'EXPIRED', 'REJECTED', 'SUSPENDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Transaction Type
DO $$ BEGIN
    CREATE TYPE "MobileTransactionType" AS ENUM ('SALE', 'BARTER', 'BARTER_WITH_CASH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Transaction Status
DO $$ BEGIN
    CREATE TYPE "MobileTransactionStatus" AS ENUM (
        'INITIATED', 'PAYMENT_PENDING', 'PAYMENT_HELD', 'SHIPPING',
        'DELIVERED', 'INSPECTION', 'COMPLETED', 'DISPUTED', 'CANCELLED', 'REFUNDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Payment Method
DO $$ BEGIN
    CREATE TYPE "MobilePaymentMethod" AS ENUM ('ESCROW', 'COD', 'FAWRY', 'INSTAPAY', 'WALLET', 'BNPL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Delivery Method
DO $$ BEGIN
    CREATE TYPE "MobileDeliveryMethod" AS ENUM ('MEETUP', 'BOSTA', 'ARAMEX', 'EGYPT_POST', 'PARTNER_SHOP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Delivery Status
DO $$ BEGIN
    CREATE TYPE "MobileDeliveryStatus" AS ENUM ('PENDING', 'SHIPPED', 'IN_TRANSIT', 'DELIVERED', 'RETURNED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Barter Match Type
DO $$ BEGIN
    CREATE TYPE "MobileBarterMatchType" AS ENUM ('DIRECT', 'THREE_WAY', 'CHAIN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Barter Match Status
DO $$ BEGIN
    CREATE TYPE "MobileBarterMatchStatus" AS ENUM (
        'PROPOSED', 'PARTIALLY_ACCEPTED', 'ALL_ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Barter Proposal Status
DO $$ BEGIN
    CREATE TYPE "MobileBarterProposalStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COUNTERED', 'EXPIRED', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Dispute Reason
DO $$ BEGIN
    CREATE TYPE "MobileDisputeReason" AS ENUM (
        'NOT_AS_DESCRIBED', 'FAKE_DEVICE', 'NOT_RECEIVED', 'DAMAGED_IN_SHIPPING',
        'SELLER_UNRESPONSIVE', 'BATTERY_DIFFERENT', 'NON_ORIGINAL_PARTS', 'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Dispute Status
DO $$ BEGIN
    CREATE TYPE "MobileDisputeStatus" AS ENUM ('OPEN', 'UNDER_REVIEW', 'MEDIATION', 'RESOLVED', 'ESCALATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Mobile Dispute Resolution
DO $$ BEGIN
    CREATE TYPE "MobileDisputeResolution" AS ENUM ('REFUND_FULL', 'REFUND_PARTIAL', 'NO_REFUND', 'RETURN_REQUIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Promotion Tier (if not exists)
DO $$ BEGIN
    CREATE TYPE "PromotionTier" AS ENUM ('BASIC', 'FEATURED', 'PREMIUM', 'SPOTLIGHT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- Mobile Listings Table (جدول إعلانات الموبايلات)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id VARCHAR(255) NOT NULL,

    -- Basic Info
    title VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    description TEXT,
    description_ar TEXT,

    -- Device Details
    brand "MobileBrand" NOT NULL,
    model VARCHAR(200) NOT NULL,
    storage_gb INTEGER NOT NULL,
    ram_gb INTEGER,
    color VARCHAR(100),
    color_ar VARCHAR(100),

    -- IMEI Verification (Core Feature)
    imei VARCHAR(20) UNIQUE NOT NULL,
    imei_verified BOOLEAN DEFAULT false,
    imei_status "MobileIMEIStatus" DEFAULT 'UNKNOWN',
    ntra_registered BOOLEAN DEFAULT false,

    -- Condition
    condition_grade "MobileConditionGrade" NOT NULL,
    battery_health INTEGER,
    screen_condition "MobileScreenCondition",
    body_condition "MobileBodyCondition",
    original_parts BOOLEAN DEFAULT true,
    has_box BOOLEAN DEFAULT false,
    has_accessories BOOLEAN DEFAULT false,
    accessories_details TEXT,

    -- Pricing
    price_egp DOUBLE PRECISION NOT NULL,
    original_price DOUBLE PRECISION,
    negotiable BOOLEAN DEFAULT true,

    -- Barter
    accepts_barter BOOLEAN DEFAULT false,
    barter_preferences JSONB,

    -- Media
    images JSONB DEFAULT '[]'::jsonb,
    verification_image_url TEXT,
    verification_code VARCHAR(50),
    video_url TEXT,

    -- Location
    governorate VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),

    -- Status
    status "MobileListingStatus" DEFAULT 'DRAFT',
    rejection_reason TEXT,
    featured BOOLEAN DEFAULT false,
    featured_until TIMESTAMP,
    promotion_tier "PromotionTier" DEFAULT 'BASIC',

    -- Statistics
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,
    inquiries_count INTEGER DEFAULT 0,

    -- Warranty
    warranty_months INTEGER,
    warranty_provider VARCHAR(200),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP,
    sold_at TIMESTAMP
);

-- Indexes for mobile_listings
CREATE INDEX IF NOT EXISTS idx_mobile_listings_seller_id ON mobile_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_mobile_listings_brand_model ON mobile_listings(brand, model);
CREATE INDEX IF NOT EXISTS idx_mobile_listings_price_egp ON mobile_listings(price_egp);
CREATE INDEX IF NOT EXISTS idx_mobile_listings_governorate ON mobile_listings(governorate);
CREATE INDEX IF NOT EXISTS idx_mobile_listings_status ON mobile_listings(status);
CREATE INDEX IF NOT EXISTS idx_mobile_listings_condition_grade ON mobile_listings(condition_grade);
CREATE INDEX IF NOT EXISTS idx_mobile_listings_accepts_barter ON mobile_listings(accepts_barter);
CREATE INDEX IF NOT EXISTS idx_mobile_listings_created_at ON mobile_listings(created_at);
CREATE INDEX IF NOT EXISTS idx_mobile_listings_imei_status ON mobile_listings(imei_status);

-- =====================================================
-- IMEI Verification Table (جدول التحقق من IMEI)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_imei_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID UNIQUE NOT NULL REFERENCES mobile_listings(id) ON DELETE CASCADE,
    imei VARCHAR(20) NOT NULL,

    -- Verification Results
    is_blacklisted BOOLEAN,
    is_stolen BOOLEAN,
    is_financed BOOLEAN,
    carrier_lock_status VARCHAR(100),
    original_carrier VARCHAR(100),

    -- Model Verification
    reported_model VARCHAR(200),
    actual_model VARCHAR(200),
    model_matches BOOLEAN,

    -- NTRA Egypt
    ntra_registration_status VARCHAR(100),
    ntra_check_date TIMESTAMP,

    -- Provider
    verification_provider VARCHAR(100),
    raw_response JSONB,

    -- Timestamps
    verified_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for mobile_imei_verifications
CREATE INDEX IF NOT EXISTS idx_mobile_imei_verifications_imei ON mobile_imei_verifications(imei);

-- =====================================================
-- Device Diagnostics Table (جدول تشخيص الأجهزة)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_device_diagnostics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID UNIQUE NOT NULL REFERENCES mobile_listings(id) ON DELETE CASCADE,

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
    wifi_functional BOOLEAN,
    bluetooth_functional BOOLEAN,
    gps_functional BOOLEAN,
    sim_card_functional BOOLEAN,
    faceid_functional BOOLEAN,
    fingerprint_functional BOOLEAN,

    -- Overall Score
    diagnostic_score INTEGER,
    diagnostic_provider VARCHAR(100),
    raw_report JSONB,

    -- Timestamps
    diagnosed_at TIMESTAMP DEFAULT NOW()
);

-- =====================================================
-- Mobile Transactions Table (جدول معاملات الموبايلات)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID NOT NULL REFERENCES mobile_listings(id) ON DELETE CASCADE,
    buyer_id VARCHAR(255) NOT NULL,
    seller_id VARCHAR(255) NOT NULL,

    -- Transaction Type
    transaction_type "MobileTransactionType" NOT NULL,

    -- Pricing
    agreed_price_egp DOUBLE PRECISION,
    platform_fee_egp DOUBLE PRECISION,
    seller_payout_egp DOUBLE PRECISION,

    -- For Barter
    barter_listing_id UUID,
    cash_difference_egp DOUBLE PRECISION,
    cash_paid_by VARCHAR(255),

    -- Payment
    payment_method "MobilePaymentMethod",
    payment_status VARCHAR(50),
    escrow_held_at TIMESTAMP,
    escrow_released_at TIMESTAMP,
    escrow_amount DOUBLE PRECISION,

    -- Delivery
    delivery_method "MobileDeliveryMethod",
    delivery_status "MobileDeliveryStatus",
    tracking_number VARCHAR(100),
    delivery_address JSONB,
    delivery_fee DOUBLE PRECISION,

    -- Inspection Period (5 days)
    inspection_starts_at TIMESTAMP,
    inspection_ends_at TIMESTAMP,
    buyer_confirmed BOOLEAN DEFAULT false,
    buyer_notes TEXT,

    -- Status
    status "MobileTransactionStatus" DEFAULT 'INITIATED',
    status_history JSONB,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Indexes for mobile_transactions
CREATE INDEX IF NOT EXISTS idx_mobile_transactions_listing_id ON mobile_transactions(listing_id);
CREATE INDEX IF NOT EXISTS idx_mobile_transactions_buyer_id ON mobile_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_mobile_transactions_seller_id ON mobile_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_mobile_transactions_status ON mobile_transactions(status);
CREATE INDEX IF NOT EXISTS idx_mobile_transactions_transaction_type ON mobile_transactions(transaction_type);

-- =====================================================
-- Mobile Barter Matches Table (جدول مطابقات المقايضة)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_barter_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Match Type
    match_type "MobileBarterMatchType" NOT NULL,

    -- Value
    total_value_egp DOUBLE PRECISION,
    cash_settlements JSONB,

    -- Match Score
    match_score DOUBLE PRECISION,
    location_compatible BOOLEAN,

    -- Status
    status "MobileBarterMatchStatus" DEFAULT 'PROPOSED',
    expires_at TIMESTAMP,
    cancellation_reason TEXT,
    cancelled_by VARCHAR(255),

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Indexes for mobile_barter_matches
CREATE INDEX IF NOT EXISTS idx_mobile_barter_matches_status ON mobile_barter_matches(status);
CREATE INDEX IF NOT EXISTS idx_mobile_barter_matches_match_type ON mobile_barter_matches(match_type);

-- =====================================================
-- Mobile Barter Match Participants Table (جدول مشاركين المقايضة)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_barter_match_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id UUID NOT NULL REFERENCES mobile_barter_matches(id) ON DELETE CASCADE,
    user_id VARCHAR(255) NOT NULL,

    -- What participant offers
    offers_listing_id UUID NOT NULL REFERENCES mobile_listings(id),
    offers_value DOUBLE PRECISION,

    -- What participant receives
    receives_listing_id UUID,
    receives_value DOUBLE PRECISION,

    -- Cash Difference
    cash_to_pay DOUBLE PRECISION DEFAULT 0,
    cash_to_receive DOUBLE PRECISION DEFAULT 0,

    -- Acceptance
    accepted BOOLEAN DEFAULT false,
    accepted_at TIMESTAMP,

    UNIQUE(match_id, user_id)
);

-- Indexes for mobile_barter_match_participants
CREATE INDEX IF NOT EXISTS idx_mobile_barter_match_participants_user_id ON mobile_barter_match_participants(user_id);

-- =====================================================
-- Mobile Barter Proposals Table (جدول عروض المقايضة)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_barter_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposer_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,

    -- What proposer offers
    offered_listing_id UUID NOT NULL REFERENCES mobile_listings(id) ON DELETE CASCADE,

    -- What proposer requests
    requested_listing_id UUID NOT NULL REFERENCES mobile_listings(id) ON DELETE CASCADE,

    -- Cash Difference
    cash_difference DOUBLE PRECISION DEFAULT 0,
    cash_direction VARCHAR(50),

    -- Messages
    proposer_message TEXT,
    receiver_response TEXT,

    -- Counter Offer
    counter_cash_offer DOUBLE PRECISION,

    -- Status
    status "MobileBarterProposalStatus" DEFAULT 'PENDING',

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '7 days',
    responded_at TIMESTAMP
);

-- Indexes for mobile_barter_proposals
CREATE INDEX IF NOT EXISTS idx_mobile_barter_proposals_proposer_id ON mobile_barter_proposals(proposer_id);
CREATE INDEX IF NOT EXISTS idx_mobile_barter_proposals_receiver_id ON mobile_barter_proposals(receiver_id);
CREATE INDEX IF NOT EXISTS idx_mobile_barter_proposals_status ON mobile_barter_proposals(status);

-- =====================================================
-- Mobile Disputes Table (جدول نزاعات الموبايلات)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES mobile_transactions(id) ON DELETE CASCADE,
    initiated_by_id VARCHAR(255) NOT NULL,

    -- Reason
    reason "MobileDisputeReason" NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    evidence_urls JSONB,

    -- Resolution
    status "MobileDisputeStatus" DEFAULT 'OPEN',
    resolution "MobileDisputeResolution",
    resolution_notes TEXT,
    resolved_by_id VARCHAR(255),
    refund_amount DOUBLE PRECISION,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    resolved_at TIMESTAMP
);

-- Indexes for mobile_disputes
CREATE INDEX IF NOT EXISTS idx_mobile_disputes_transaction_id ON mobile_disputes(transaction_id);
CREATE INDEX IF NOT EXISTS idx_mobile_disputes_status ON mobile_disputes(status);

-- =====================================================
-- Mobile Reviews Table (جدول تقييمات الموبايلات)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES mobile_transactions(id) ON DELETE CASCADE,
    reviewer_id VARCHAR(255) NOT NULL,
    reviewee_id VARCHAR(255) NOT NULL,

    -- Rating
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    accuracy_rating INTEGER CHECK (accuracy_rating >= 1 AND accuracy_rating <= 5),
    communication_rating INTEGER CHECK (communication_rating >= 1 AND communication_rating <= 5),
    speed_rating INTEGER CHECK (speed_rating >= 1 AND speed_rating <= 5),

    -- Comment
    comment_ar TEXT,
    comment_en TEXT,

    -- Verification
    is_verified_purchase BOOLEAN DEFAULT true,

    -- Seller Response
    seller_response TEXT,
    seller_responded_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(transaction_id, reviewer_id)
);

-- Indexes for mobile_reviews
CREATE INDEX IF NOT EXISTS idx_mobile_reviews_reviewee_id ON mobile_reviews(reviewee_id);

-- =====================================================
-- Mobile Favorites Table (جدول المفضلات)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    listing_id UUID NOT NULL REFERENCES mobile_listings(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, listing_id)
);

-- Indexes for mobile_favorites
CREATE INDEX IF NOT EXISTS idx_mobile_favorites_user_id ON mobile_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_favorites_listing_id ON mobile_favorites(listing_id);

-- =====================================================
-- Mobile Price Alerts Table (جدول تنبيهات الأسعار)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_price_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,

    -- Search Criteria
    brand "MobileBrand",
    model VARCHAR(200),
    max_price_egp DOUBLE PRECISION,
    min_condition_grade "MobileConditionGrade",
    governorate VARCHAR(100),
    min_storage_gb INTEGER,

    -- Status
    is_active BOOLEAN DEFAULT true,
    last_notified_at TIMESTAMP,
    notification_count INTEGER DEFAULT 0,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for mobile_price_alerts
CREATE INDEX IF NOT EXISTS idx_mobile_price_alerts_user_id ON mobile_price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_mobile_price_alerts_is_active ON mobile_price_alerts(is_active);

-- =====================================================
-- Mobile Price References Table (جدول الأسعار المرجعية)
-- =====================================================

CREATE TABLE IF NOT EXISTS mobile_price_references (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Device Identity
    brand "MobileBrand" NOT NULL,
    model VARCHAR(200) NOT NULL,
    storage_gb INTEGER NOT NULL,
    release_year INTEGER,

    -- Price Range
    price_low DOUBLE PRECISION NOT NULL,
    price_average DOUBLE PRECISION NOT NULL,
    price_high DOUBLE PRECISION NOT NULL,

    -- Condition Multipliers
    condition_a_multiplier DOUBLE PRECISION DEFAULT 1.0,
    condition_b_multiplier DOUBLE PRECISION DEFAULT 0.85,
    condition_c_multiplier DOUBLE PRECISION DEFAULT 0.70,
    condition_d_multiplier DOUBLE PRECISION DEFAULT 0.50,

    -- Data Source
    data_source VARCHAR(100),
    sample_size INTEGER DEFAULT 0,

    -- Timestamps
    recorded_at TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP,

    UNIQUE(brand, model, storage_gb)
);

-- Indexes for mobile_price_references
CREATE INDEX IF NOT EXISTS idx_mobile_price_references_brand_model ON mobile_price_references(brand, model);

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Mobile marketplace tables created successfully!';
    RAISE NOTICE '📱 Created 12 tables for complete mobile marketplace functionality';
    RAISE NOTICE '🔗 Now you can run mobiles_comprehensive_seed.sql to add test data';
END $$;
