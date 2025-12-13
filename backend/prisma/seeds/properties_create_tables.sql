-- =====================================================
-- CREATE TABLE Statements for Real Estate Marketplace
-- جداول سوق العقارات - XChange Egypt
-- Run this BEFORE running properties_comprehensive_seed.sql
-- =====================================================

-- Drop existing tables if they exist (be careful in production!)
-- DROP TABLE IF EXISTS property_favorites CASCADE;
-- DROP TABLE IF EXISTS property_barter_proposals CASCADE;
-- DROP TABLE IF EXISTS property_transactions CASCADE;
-- DROP TABLE IF EXISTS property_prices CASCADE;
-- DROP TABLE IF EXISTS properties CASCADE;

-- =====================================================
-- ENUM Types (أنواع التعداد)
-- =====================================================

-- Property Type
DO $$ BEGIN
    CREATE TYPE "PropertyType" AS ENUM (
        'APARTMENT', 'VILLA', 'TOWNHOUSE', 'TWIN_HOUSE', 'DUPLEX',
        'PENTHOUSE', 'STUDIO', 'CHALET', 'LAND', 'OFFICE',
        'SHOP', 'WAREHOUSE', 'BUILDING', 'FARM', 'ROOF'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Title Type
DO $$ BEGIN
    CREATE TYPE "TitleType" AS ENUM ('REGISTERED', 'PRELIMINARY', 'POA');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Property Verification Level
DO $$ BEGIN
    CREATE TYPE "PropertyVerificationLevel" AS ENUM (
        'UNVERIFIED', 'DOCUMENTS_VERIFIED', 'FIELD_VERIFIED', 'GOVERNMENT_VERIFIED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Finishing Level
DO $$ BEGIN
    CREATE TYPE "FinishingLevel" AS ENUM (
        'SUPER_LUX', 'LUX', 'SEMI_FINISHED', 'UNFINISHED', 'CORE_SHELL'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Furnished Status
DO $$ BEGIN
    CREATE TYPE "FurnishedStatus" AS ENUM ('FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Property Listing Type
DO $$ BEGIN
    CREATE TYPE "PropertyListingType" AS ENUM ('SALE', 'RENT', 'BOTH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Property Delivery Status
DO $$ BEGIN
    CREATE TYPE "PropertyDeliveryStatus" AS ENUM ('READY', 'UNDER_CONSTRUCTION', 'OFF_PLAN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Property Status
DO $$ BEGIN
    CREATE TYPE "PropertyStatus" AS ENUM (
        'DRAFT', 'PENDING_VERIFICATION', 'ACTIVE', 'RESERVED', 'SOLD', 'RENTED', 'EXPIRED', 'REJECTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Property Transaction Type
DO $$ BEGIN
    CREATE TYPE "PropertyTransactionType" AS ENUM (
        'SALE', 'RENT', 'BARTER_PROPERTY', 'BARTER_CAR', 'BARTER_GOLD', 'BARTER_MULTI'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Property Escrow Status
DO $$ BEGIN
    CREATE TYPE "PropertyEscrowStatus" AS ENUM (
        'NOT_INITIATED', 'PENDING_DEPOSIT', 'DEPOSITED', 'VERIFICATION_IN_PROGRESS',
        'VERIFIED', 'RELEASED', 'REFUNDED', 'DISPUTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Property Transaction Status
DO $$ BEGIN
    CREATE TYPE "PropertyTransactionStatus" AS ENUM (
        'INITIATED', 'NEGOTIATING', 'AGREED', 'ESCROW_PENDING', 'DOCUMENTS_PENDING',
        'INSPECTION_PENDING', 'REGISTRATION_PENDING', 'COMPLETED', 'CANCELLED', 'DISPUTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Property Barter Status
DO $$ BEGIN
    CREATE TYPE "PropertyBarterStatus" AS ENUM (
        'PENDING', 'VIEWED', 'COUNTER_OFFERED', 'ACCEPTED', 'APPRAISAL_PENDING',
        'LEGAL_REVIEW', 'ESCROW_PENDING', 'REGISTRATION_PENDING', 'COMPLETED', 'REJECTED', 'EXPIRED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Promotion Tier (if not exists)
DO $$ BEGIN
    CREATE TYPE "PromotionTier" AS ENUM ('BASIC', 'FEATURED', 'PREMIUM', 'SPOTLIGHT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Rental Contract Status
DO $$ BEGIN
    CREATE TYPE "RentalContractStatus" AS ENUM (
        'DRAFT', 'ACTIVE', 'RENEWED', 'TERMINATED', 'EXPIRED', 'DISPUTED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Rental Contract Type
DO $$ BEGIN
    CREATE TYPE "RentalContractType" AS ENUM ('NEW_RENT', 'OLD_RENT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Inspection Type
DO $$ BEGIN
    CREATE TYPE "InspectionType" AS ENUM (
        'BASIC', 'STANDARD', 'COMPREHENSIVE', 'PRE_PURCHASE', 'PRE_RENTAL', 'CHECKIN', 'CHECKOUT'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Inspection Status
DO $$ BEGIN
    CREATE TYPE "InspectionStatus" AS ENUM (
        'REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Inspection Recommendation
DO $$ BEGIN
    CREATE TYPE "InspectionRecommendation" AS ENUM (
        'HIGHLY_RECOMMENDED', 'RECOMMENDED', 'NEEDS_ATTENTION', 'NOT_RECOMMENDED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- Properties Table (جدول العقارات)
-- =====================================================

CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id VARCHAR(255) NOT NULL,

    -- Basic Info
    title VARCHAR(500) NOT NULL,
    title_ar VARCHAR(500),
    description TEXT,
    description_ar TEXT,

    -- Property Type
    property_type "PropertyType" NOT NULL,

    -- Location
    governorate VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    compound_name VARCHAR(200),
    address TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,

    -- Area
    area_sqm DOUBLE PRECISION NOT NULL,
    garden_area DOUBLE PRECISION,
    roof_area DOUBLE PRECISION,

    -- Specifications
    bedrooms INTEGER,
    bathrooms INTEGER,
    floor_number INTEGER,
    total_floors INTEGER,

    -- Finishing
    finishing_level "FinishingLevel",
    furnished "FurnishedStatus",

    -- Amenities
    amenities JSONB DEFAULT '[]'::jsonb,

    -- Listing Type
    listing_type "PropertyListingType" DEFAULT 'SALE',

    -- Pricing (Sale)
    sale_price DOUBLE PRECISION,
    price_per_sqm DOUBLE PRECISION,
    price_negotiable BOOLEAN DEFAULT true,

    -- Pricing (Rent)
    rent_price DOUBLE PRECISION,
    rent_period VARCHAR(50),

    -- Installment
    installment_available BOOLEAN DEFAULT false,
    installment_years INTEGER,
    down_payment_percent DOUBLE PRECISION,
    monthly_installment DOUBLE PRECISION,

    -- Delivery Status
    delivery_status "PropertyDeliveryStatus",
    delivery_date TIMESTAMP,

    -- Verification
    title_type "TitleType" DEFAULT 'PRELIMINARY',
    government_property_id VARCHAR(100),
    government_qr_code TEXT,
    verification_level "PropertyVerificationLevel" DEFAULT 'UNVERIFIED',
    verification_date TIMESTAMP,
    verified_by_id VARCHAR(255),
    verification_notes TEXT,

    -- Barter
    open_for_barter BOOLEAN DEFAULT false,
    barter_preferences JSONB,

    -- Status
    status "PropertyStatus" DEFAULT 'DRAFT',
    rejection_reason TEXT,

    -- Promotion
    featured BOOLEAN DEFAULT false,
    promotion_tier "PromotionTier" DEFAULT 'BASIC',
    views_count INTEGER DEFAULT 0,
    favorites_count INTEGER DEFAULT 0,

    -- Media
    images JSONB DEFAULT '[]'::jsonb,
    video_url TEXT,
    virtual_tour_url TEXT,
    floor_plan_url TEXT,

    -- Valuation
    estimated_value DOUBLE PRECISION,
    last_valuation_date TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP
);

-- Indexes for properties
CREATE INDEX IF NOT EXISTS idx_properties_owner_id ON properties(owner_id);
CREATE INDEX IF NOT EXISTS idx_properties_property_type ON properties(property_type);
CREATE INDEX IF NOT EXISTS idx_properties_governorate ON properties(governorate);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_district ON properties(district);
CREATE INDEX IF NOT EXISTS idx_properties_compound_name ON properties(compound_name);
CREATE INDEX IF NOT EXISTS idx_properties_listing_type ON properties(listing_type);
CREATE INDEX IF NOT EXISTS idx_properties_sale_price ON properties(sale_price);
CREATE INDEX IF NOT EXISTS idx_properties_rent_price ON properties(rent_price);
CREATE INDEX IF NOT EXISTS idx_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS idx_properties_title_type ON properties(title_type);
CREATE INDEX IF NOT EXISTS idx_properties_verification_level ON properties(verification_level);
CREATE INDEX IF NOT EXISTS idx_properties_open_for_barter ON properties(open_for_barter);
CREATE INDEX IF NOT EXISTS idx_properties_featured ON properties(featured);

-- =====================================================
-- Property Transactions Table (جدول معاملات العقارات)
-- =====================================================

CREATE TABLE IF NOT EXISTS property_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_type "PropertyTransactionType" NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,

    -- For Barter
    secondary_item_id VARCHAR(255),
    secondary_item_type VARCHAR(100),

    -- Parties
    buyer_id VARCHAR(255),
    seller_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255),
    landlord_id VARCHAR(255),

    -- Pricing
    agreed_price DOUBLE PRECISION,
    cash_difference DOUBLE PRECISION DEFAULT 0,
    buyer_commission DOUBLE PRECISION,
    seller_commission DOUBLE PRECISION,

    -- Escrow System
    escrow_status "PropertyEscrowStatus" DEFAULT 'NOT_INITIATED',
    escrow_amount DOUBLE PRECISION,
    escrow_account_id VARCHAR(255),
    escrow_deposited_at TIMESTAMP,
    escrow_released_at TIMESTAMP,
    escrow_release_conditions JSONB,

    -- Verification
    documents_verified BOOLEAN DEFAULT false,
    field_inspection_id VARCHAR(255),
    government_verified BOOLEAN DEFAULT false,

    -- For Rent
    lease_start_date TIMESTAMP,
    lease_end_date TIMESTAMP,
    security_deposit DOUBLE PRECISION,
    deposit_protected BOOLEAN DEFAULT false,

    -- Status
    status "PropertyTransactionStatus" DEFAULT 'INITIATED',
    status_history JSONB,
    notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    completed_at TIMESTAMP
);

-- Indexes for property_transactions
CREATE INDEX IF NOT EXISTS idx_property_transactions_property_id ON property_transactions(property_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_buyer_id ON property_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_seller_id ON property_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_property_transactions_transaction_type ON property_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_property_transactions_status ON property_transactions(status);
CREATE INDEX IF NOT EXISTS idx_property_transactions_escrow_status ON property_transactions(escrow_status);

-- =====================================================
-- Property Barter Proposals Table (جدول عروض المقايضة)
-- =====================================================

CREATE TABLE IF NOT EXISTS property_barter_proposals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    proposer_id VARCHAR(255) NOT NULL,
    receiver_id VARCHAR(255) NOT NULL,

    -- What proposer offers
    offered_property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    offered_items JSONB,

    -- What proposer requests
    requested_property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    requested_items JSONB,

    -- Cash Difference
    cash_difference DOUBLE PRECISION DEFAULT 0,
    cash_payer VARCHAR(255),

    -- Valuation
    total_offered_value DOUBLE PRECISION,
    total_requested_value DOUBLE PRECISION,
    appraisals JSONB,

    -- Commission
    proposer_commission DOUBLE PRECISION,
    receiver_commission DOUBLE PRECISION,

    -- Escrow
    escrow_required BOOLEAN DEFAULT true,
    escrow_status "PropertyEscrowStatus",

    -- Status
    status "PropertyBarterStatus" DEFAULT 'PENDING',
    counter_proposal_id UUID,

    -- Messages
    proposer_message TEXT,
    receiver_response TEXT,

    -- Legal
    legal_review_status VARCHAR(50),
    legal_notes TEXT,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    expires_at TIMESTAMP DEFAULT NOW() + INTERVAL '30 days',
    responded_at TIMESTAMP,
    completed_at TIMESTAMP
);

-- Indexes for property_barter_proposals
CREATE INDEX IF NOT EXISTS idx_property_barter_proposals_proposer_id ON property_barter_proposals(proposer_id);
CREATE INDEX IF NOT EXISTS idx_property_barter_proposals_receiver_id ON property_barter_proposals(receiver_id);
CREATE INDEX IF NOT EXISTS idx_property_barter_proposals_offered_property_id ON property_barter_proposals(offered_property_id);
CREATE INDEX IF NOT EXISTS idx_property_barter_proposals_requested_property_id ON property_barter_proposals(requested_property_id);

-- =====================================================
-- Property Prices Table (جدول أسعار العقارات المرجعية)
-- =====================================================

CREATE TABLE IF NOT EXISTS property_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    governorate VARCHAR(100) NOT NULL,
    city VARCHAR(100),
    district VARCHAR(100),
    compound_name VARCHAR(200),
    property_type "PropertyType" NOT NULL,

    -- Price Range
    min_price_per_sqm DOUBLE PRECISION NOT NULL,
    max_price_per_sqm DOUBLE PRECISION NOT NULL,
    avg_price_per_sqm DOUBLE PRECISION NOT NULL,

    -- Rent Prices
    min_rent_per_sqm DOUBLE PRECISION,
    max_rent_per_sqm DOUBLE PRECISION,
    avg_rent_per_sqm DOUBLE PRECISION,

    -- Data Source
    data_source VARCHAR(100),
    sample_size INTEGER DEFAULT 0,

    -- Timestamps
    recorded_at TIMESTAMP DEFAULT NOW(),
    valid_until TIMESTAMP
);

-- Indexes for property_prices
CREATE INDEX IF NOT EXISTS idx_property_prices_governorate ON property_prices(governorate);
CREATE INDEX IF NOT EXISTS idx_property_prices_city ON property_prices(city);
CREATE INDEX IF NOT EXISTS idx_property_prices_property_type ON property_prices(property_type);

-- =====================================================
-- Property Favorites Table (جدول المفضلات)
-- =====================================================

CREATE TABLE IF NOT EXISTS property_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE(user_id, property_id)
);

-- Indexes for property_favorites
CREATE INDEX IF NOT EXISTS idx_property_favorites_user_id ON property_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_property_favorites_property_id ON property_favorites(property_id);

-- =====================================================
-- Inspectors Table (جدول المفتشين)
-- =====================================================

CREATE TABLE IF NOT EXISTS inspectors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) UNIQUE NOT NULL,

    -- Certification
    license_number VARCHAR(100),
    certification_type VARCHAR(100),
    specializations JSONB DEFAULT '[]'::jsonb,

    -- Coverage Area
    service_areas JSONB DEFAULT '[]'::jsonb,

    -- Performance
    total_inspections INTEGER DEFAULT 0,
    average_rating DOUBLE PRECISION DEFAULT 0,

    -- Status
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    verified_at TIMESTAMP,

    -- Pricing
    base_inspection_fee DOUBLE PRECISION,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for inspectors
CREATE INDEX IF NOT EXISTS idx_inspectors_user_id ON inspectors(user_id);
CREATE INDEX IF NOT EXISTS idx_inspectors_is_active ON inspectors(is_active);

-- =====================================================
-- Field Inspections Table (جدول الفحوصات الميدانية)
-- =====================================================

CREATE TABLE IF NOT EXISTS field_inspections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    inspector_id UUID REFERENCES inspectors(id),
    requested_by_id VARCHAR(255) NOT NULL,

    -- Inspection Details
    inspection_type "InspectionType" NOT NULL,
    scheduled_at TIMESTAMP,
    completed_at TIMESTAMP,
    location_verified BOOLEAN DEFAULT false,
    gps_coordinates JSONB,

    -- Results
    overall_score INTEGER,
    findings JSONB,
    inspection_photos JSONB DEFAULT '[]'::jsonb,

    -- Verification
    address_matches BOOLEAN,
    area_matches BOOLEAN,

    -- Recommendation
    recommendation "InspectionRecommendation",
    estimated_repair_cost DOUBLE PRECISION,

    -- Status
    status "InspectionStatus" DEFAULT 'REQUESTED',
    report_url TEXT,
    report_notes TEXT,

    -- Payment
    inspection_fee DOUBLE PRECISION,
    paid BOOLEAN DEFAULT false,
    paid_at TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for field_inspections
CREATE INDEX IF NOT EXISTS idx_field_inspections_property_id ON field_inspections(property_id);
CREATE INDEX IF NOT EXISTS idx_field_inspections_inspector_id ON field_inspections(inspector_id);
CREATE INDEX IF NOT EXISTS idx_field_inspections_status ON field_inspections(status);
CREATE INDEX IF NOT EXISTS idx_field_inspections_inspection_type ON field_inspections(inspection_type);

-- =====================================================
-- Rental Contracts Table (جدول عقود الإيجار)
-- =====================================================

CREATE TABLE IF NOT EXISTS rental_contracts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    landlord_id VARCHAR(255) NOT NULL,
    tenant_id VARCHAR(255) NOT NULL,

    -- Contract Details
    contract_type "RentalContractType" DEFAULT 'NEW_RENT',
    start_date TIMESTAMP NOT NULL,
    end_date TIMESTAMP NOT NULL,

    -- Amounts
    monthly_rent DOUBLE PRECISION NOT NULL,
    security_deposit DOUBLE PRECISION NOT NULL,
    annual_increase_percent DOUBLE PRECISION DEFAULT 7,

    -- Deposit Protection
    deposit_protected BOOLEAN DEFAULT false,
    deposit_protection_id VARCHAR(255),
    deposit_escrow_account VARCHAR(255),
    deposit_released BOOLEAN DEFAULT false,
    deposit_released_at TIMESTAMP,
    deposit_deductions JSONB,

    -- Inspection References
    checkin_inspection_id UUID REFERENCES field_inspections(id),
    checkout_inspection_id UUID REFERENCES field_inspections(id),

    -- Status
    status "RentalContractStatus" DEFAULT 'DRAFT',
    contract_document_url TEXT,
    notes TEXT,
    renewal_history JSONB,

    -- Timestamps
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    terminated_at TIMESTAMP
);

-- Indexes for rental_contracts
CREATE INDEX IF NOT EXISTS idx_rental_contracts_property_id ON rental_contracts(property_id);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_landlord_id ON rental_contracts(landlord_id);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_tenant_id ON rental_contracts(tenant_id);
CREATE INDEX IF NOT EXISTS idx_rental_contracts_status ON rental_contracts(status);

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Property marketplace tables created successfully!';
    RAISE NOTICE '📊 Created tables: properties, property_transactions, property_barter_proposals, property_prices, property_favorites, inspectors, field_inspections, rental_contracts';
    RAISE NOTICE '🔗 Now you can run properties_comprehensive_seed.sql to add test data';
END $$;
