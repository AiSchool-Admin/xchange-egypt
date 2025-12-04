-- Flash Deals Migration
-- نظام العروض الخاطفة

-- ============================================
-- Flash Deal Status Enum
-- ============================================

CREATE TYPE "FlashDealStatus" AS ENUM (
    'SCHEDULED',
    'ACTIVE',
    'ENDED',
    'SOLD_OUT',
    'CANCELLED'
);

-- ============================================
-- Flash Deals Table
-- ============================================

CREATE TABLE "flash_deals" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "original_price" DOUBLE PRECISION NOT NULL,
    "deal_price" DOUBLE PRECISION NOT NULL,
    "discount_percent" DOUBLE PRECISION NOT NULL,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "total_quantity" INTEGER NOT NULL,
    "sold_quantity" INTEGER NOT NULL DEFAULT 0,
    "reserved_quantity" INTEGER NOT NULL DEFAULT 0,
    "max_per_user" INTEGER NOT NULL DEFAULT 1,
    "status" "FlashDealStatus" NOT NULL DEFAULT 'SCHEDULED',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "conversion_rate" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "flash_deals_pkey" PRIMARY KEY ("id")
);

-- Indexes for flash_deals
CREATE INDEX "flash_deals_listing_id_idx" ON "flash_deals"("listing_id");
CREATE INDEX "flash_deals_status_idx" ON "flash_deals"("status");
CREATE INDEX "flash_deals_start_time_idx" ON "flash_deals"("start_time");
CREATE INDEX "flash_deals_end_time_idx" ON "flash_deals"("end_time");
CREATE INDEX "flash_deals_is_featured_idx" ON "flash_deals"("is_featured");

-- ============================================
-- Flash Deal Claims Table
-- ============================================

CREATE TABLE "flash_deal_claims" (
    "id" TEXT NOT NULL,
    "deal_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "price_at_claim" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'CLAIMED',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "purchased_at" TIMESTAMP(3),

    CONSTRAINT "flash_deal_claims_pkey" PRIMARY KEY ("id")
);

-- Indexes for flash_deal_claims
CREATE UNIQUE INDEX "flash_deal_claims_deal_id_user_id_key" ON "flash_deal_claims"("deal_id", "user_id");
CREATE INDEX "flash_deal_claims_deal_id_idx" ON "flash_deal_claims"("deal_id");
CREATE INDEX "flash_deal_claims_user_id_idx" ON "flash_deal_claims"("user_id");
CREATE INDEX "flash_deal_claims_status_idx" ON "flash_deal_claims"("status");
CREATE INDEX "flash_deal_claims_expires_at_idx" ON "flash_deal_claims"("expires_at");

-- ============================================
-- Foreign Key Constraints
-- ============================================

ALTER TABLE "flash_deals" ADD CONSTRAINT "flash_deals_listing_id_fkey"
    FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "flash_deal_claims" ADD CONSTRAINT "flash_deal_claims_deal_id_fkey"
    FOREIGN KEY ("deal_id") REFERENCES "flash_deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
