-- XChange Egypt - Scrap Marketplace Migration
-- سوق التوالف

-- ============================================
-- 1. Create MetalType Enum (Required by other tables)
-- ============================================

CREATE TYPE "MetalType" AS ENUM (
    'COPPER',
    'ALUMINUM',
    'IRON',
    'STEEL',
    'BRASS',
    'BRONZE',
    'LEAD',
    'ZINC',
    'NICKEL',
    'TIN',
    'GOLD',
    'SILVER',
    'STAINLESS_STEEL',
    'MIXED'
);

-- ============================================
-- 2. Create Scrap Marketplace Enums
-- ============================================

-- Scrap Pricing Type
CREATE TYPE "ScrapPricingType" AS ENUM (
    'PER_PIECE',
    'PER_KG',
    'PER_UNIT',
    'NEGOTIABLE'
);

-- Scrap Condition
CREATE TYPE "ScrapCondition" AS ENUM (
    'TOTALLY_DAMAGED',
    'NOT_WORKING',
    'PARTIALLY_WORKING',
    'NEEDS_REPAIR',
    'WORKING_WITH_ISSUES'
);

-- Scrap Type
CREATE TYPE "ScrapType" AS ENUM (
    'ELECTRONICS',
    'HOME_APPLIANCES',
    'FURNITURE',
    'VEHICLES',
    'MACHINERY',
    'TEXTILES',
    'METALS',
    'PLASTICS',
    'PAPER',
    'GLASS',
    'CONSTRUCTION',
    'MIXED',
    'OTHER'
);

-- Scrap Dealer Type
CREATE TYPE "ScrapDealerType" AS ENUM (
    'INDIVIDUAL_COLLECTOR',
    'SCRAP_DEALER',
    'RECYCLING_COMPANY',
    'REPAIR_SHOP',
    'RESELLER'
);

-- Scrap Dealer Status
CREATE TYPE "ScrapDealerStatus" AS ENUM (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'SUSPENDED'
);

-- ============================================
-- 3. Add Scrap Fields to Items Table
-- ============================================

ALTER TABLE "items" ADD COLUMN "is_scrap" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "items" ADD COLUMN "scrap_type" "ScrapType";
ALTER TABLE "items" ADD COLUMN "scrap_condition" "ScrapCondition";
ALTER TABLE "items" ADD COLUMN "scrap_pricing_type" "ScrapPricingType";
ALTER TABLE "items" ADD COLUMN "weight_kg" DOUBLE PRECISION;
ALTER TABLE "items" ADD COLUMN "metal_type" "MetalType";

-- Add indexes
CREATE INDEX "items_is_scrap_idx" ON "items"("is_scrap");
CREATE INDEX "items_scrap_type_idx" ON "items"("scrap_type");
CREATE INDEX "items_metal_type_idx" ON "items"("metal_type");
CREATE INDEX "items_is_scrap_scrap_type_idx" ON "items"("is_scrap", "scrap_type");
CREATE INDEX "items_is_scrap_status_idx" ON "items"("is_scrap", "status");

-- ============================================
-- 4. Create Scrap Dealer Verifications Table
-- ============================================

CREATE TABLE "scrap_dealer_verifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "dealer_type" "ScrapDealerType" NOT NULL,

    -- Business Information
    "business_name" TEXT,
    "commercial_registration" TEXT,
    "tax_number" TEXT,
    "years_in_business" INTEGER DEFAULT 0,

    -- Contact & Location
    "business_address" TEXT,
    "governorate" TEXT NOT NULL,
    "city" TEXT,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,

    -- Specializations
    "specializations" "ScrapType"[],
    "accepted_metals" "MetalType"[],
    "min_weight_kg" DOUBLE PRECISION DEFAULT 0,
    "max_weight_kg" DOUBLE PRECISION,

    -- Service Options
    "offers_pickup" BOOLEAN DEFAULT false,
    "pickup_radius_km" INTEGER,
    "has_transport" BOOLEAN DEFAULT false,
    "has_weighing" BOOLEAN DEFAULT false,
    "same_day_payment" BOOLEAN DEFAULT false,

    -- Verification & Rating
    "status" "ScrapDealerStatus" NOT NULL DEFAULT 'PENDING',
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "verified_at" TIMESTAMP(3),
    "verified_by_id" TEXT,
    "rejection_reason" TEXT,

    -- Stats
    "total_purchases" INTEGER DEFAULT 0,
    "total_weight_kg" DOUBLE PRECISION DEFAULT 0,
    "avg_rating" DOUBLE PRECISION DEFAULT 0,
    "total_reviews" INTEGER DEFAULT 0,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scrap_dealer_verifications_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "scrap_dealer_verifications_user_id_key" ON "scrap_dealer_verifications"("user_id");
CREATE INDEX "scrap_dealer_verifications_user_id_idx" ON "scrap_dealer_verifications"("user_id");
CREATE INDEX "scrap_dealer_verifications_governorate_idx" ON "scrap_dealer_verifications"("governorate");
CREATE INDEX "scrap_dealer_verifications_status_idx" ON "scrap_dealer_verifications"("status");
CREATE INDEX "scrap_dealer_verifications_dealer_type_idx" ON "scrap_dealer_verifications"("dealer_type");

-- Foreign Key
ALTER TABLE "scrap_dealer_verifications" ADD CONSTRAINT "scrap_dealer_verifications_user_id_fkey"
    FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "scrap_dealer_verifications" ADD CONSTRAINT "scrap_dealer_verifications_verified_by_id_fkey"
    FOREIGN KEY ("verified_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- 5. Create Scrap Purchase Requests Table (Reverse Auction)
-- ============================================

CREATE TABLE "scrap_purchase_requests" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "request_number" TEXT NOT NULL,

    "title" TEXT NOT NULL,
    "description" TEXT,
    "scrap_type" "ScrapType" NOT NULL,
    "metal_type" "MetalType",
    "min_weight_kg" DOUBLE PRECISION,
    "max_weight_kg" DOUBLE PRECISION,
    "scrap_condition" "ScrapCondition",

    -- Pricing
    "target_price_per_kg" DOUBLE PRECISION,
    "max_total_budget" DOUBLE PRECISION,
    "currency" TEXT DEFAULT 'EGP',

    -- Location
    "governorate" TEXT NOT NULL,
    "city" TEXT,
    "pickup_available" BOOLEAN DEFAULT true,

    -- Status
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "offers_count" INTEGER DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scrap_purchase_requests_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "scrap_purchase_requests_request_number_key" ON "scrap_purchase_requests"("request_number");
CREATE INDEX "scrap_purchase_requests_buyer_id_idx" ON "scrap_purchase_requests"("buyer_id");
CREATE INDEX "scrap_purchase_requests_status_idx" ON "scrap_purchase_requests"("status");
CREATE INDEX "scrap_purchase_requests_scrap_type_idx" ON "scrap_purchase_requests"("scrap_type");
CREATE INDEX "scrap_purchase_requests_governorate_idx" ON "scrap_purchase_requests"("governorate");
CREATE INDEX "scrap_purchase_requests_expires_at_idx" ON "scrap_purchase_requests"("expires_at");

-- Foreign Key
ALTER TABLE "scrap_purchase_requests" ADD CONSTRAINT "scrap_purchase_requests_buyer_id_fkey"
    FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- 6. Create Scrap Seller Offers Table
-- ============================================

CREATE TABLE "scrap_seller_offers" (
    "id" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "item_id" TEXT,

    -- Offer Details
    "offered_price_per_kg" DOUBLE PRECISION NOT NULL,
    "estimated_weight_kg" DOUBLE PRECISION NOT NULL,
    "total_price" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "images" TEXT[],

    -- Status
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "is_accepted" BOOLEAN DEFAULT false,
    "accepted_at" TIMESTAMP(3),
    "rejection_reason" TEXT,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scrap_seller_offers_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "scrap_seller_offers_request_id_seller_id_key" ON "scrap_seller_offers"("request_id", "seller_id");
CREATE INDEX "scrap_seller_offers_request_id_idx" ON "scrap_seller_offers"("request_id");
CREATE INDEX "scrap_seller_offers_seller_id_idx" ON "scrap_seller_offers"("seller_id");
CREATE INDEX "scrap_seller_offers_status_idx" ON "scrap_seller_offers"("status");

-- Foreign Keys
ALTER TABLE "scrap_seller_offers" ADD CONSTRAINT "scrap_seller_offers_request_id_fkey"
    FOREIGN KEY ("request_id") REFERENCES "scrap_purchase_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "scrap_seller_offers" ADD CONSTRAINT "scrap_seller_offers_seller_id_fkey"
    FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "scrap_seller_offers" ADD CONSTRAINT "scrap_seller_offers_item_id_fkey"
    FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
