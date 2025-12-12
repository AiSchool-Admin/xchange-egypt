-- ============================================
-- Silver Marketplace Migration
-- سوق الفضة
-- ============================================

-- ============================================
-- ENUMS
-- ============================================

-- Silver Purity Levels
CREATE TYPE "SilverPurity" AS ENUM ('S999', 'S925', 'S900', 'S800');

-- Silver Item Categories
CREATE TYPE "SilverItemCategory" AS ENUM (
  'RING',
  'NECKLACE',
  'BRACELET',
  'EARRING',
  'SET',
  'PENDANT',
  'ANKLET',
  'COIN',
  'BAR',
  'ANTIQUE',
  'OTHER'
);

-- Silver Item Condition
CREATE TYPE "SilverItemCondition" AS ENUM (
  'NEW',
  'LIKE_NEW',
  'GOOD',
  'FAIR',
  'ANTIQUE'
);

-- Silver Verification Level
CREATE TYPE "SilverVerificationLevel" AS ENUM (
  'BASIC',
  'VERIFIED',
  'CERTIFIED'
);

-- Silver Listing Status
CREATE TYPE "SilverListingStatus" AS ENUM (
  'DRAFT',
  'ACTIVE',
  'RESERVED',
  'SOLD',
  'EXPIRED',
  'SUSPENDED'
);

-- Silver Transaction Status
CREATE TYPE "SilverTransactionStatus" AS ENUM (
  'PENDING',
  'ESCROW_HELD',
  'SHIPPED',
  'DELIVERED',
  'INSPECTION',
  'COMPLETED',
  'DISPUTED',
  'REFUNDED',
  'CANCELLED'
);

-- Silver Delivery Method
CREATE TYPE "SilverDeliveryMethod" AS ENUM (
  'PARTNER_PICKUP',
  'BUYER_PICKUP',
  'HOME_DELIVERY'
);

-- ============================================
-- TABLES
-- ============================================

-- Silver Prices Table
CREATE TABLE "silver_prices" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "purity" "SilverPurity" NOT NULL,
  "buy_price" DECIMAL(10,2) NOT NULL,
  "sell_price" DECIMAL(10,2) NOT NULL,
  "timestamp" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "source" TEXT NOT NULL DEFAULT 'manual',
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "silver_prices_pkey" PRIMARY KEY ("id")
);

-- Silver Items Table
CREATE TABLE "silver_items" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "seller_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "category" "SilverItemCategory" NOT NULL,
  "purity" "SilverPurity" NOT NULL DEFAULT 'S925',
  "weight_grams" DECIMAL(10,3) NOT NULL,
  "condition" "SilverItemCondition" NOT NULL DEFAULT 'GOOD',
  "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "asking_price_per_gram" DECIMAL(10,2) NOT NULL,
  "total_asking_price" DECIMAL(12,2) NOT NULL,
  "silver_price_at_listing" DECIMAL(10,2) NOT NULL,
  "governorate" TEXT,
  "city" TEXT,
  "verification_level" "SilverVerificationLevel" NOT NULL DEFAULT 'BASIC',
  "certificate_id" TEXT,
  "status" "SilverListingStatus" NOT NULL DEFAULT 'ACTIVE',
  "allow_barter" BOOLEAN NOT NULL DEFAULT false,
  "allow_gold_barter" BOOLEAN NOT NULL DEFAULT false,
  "barter_description" TEXT,
  "views" INTEGER NOT NULL DEFAULT 0,
  "favorites" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),
  CONSTRAINT "silver_items_pkey" PRIMARY KEY ("id")
);

-- Silver Transactions Table
CREATE TABLE "silver_transactions" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "item_id" TEXT NOT NULL,
  "buyer_id" TEXT NOT NULL,
  "seller_id" TEXT NOT NULL,
  "silver_price_at_transaction" DECIMAL(10,2) NOT NULL,
  "item_price" DECIMAL(12,2) NOT NULL,
  "buyer_commission" DECIMAL(10,2) NOT NULL,
  "seller_commission" DECIMAL(10,2) NOT NULL,
  "delivery_fee" DECIMAL(10,2) DEFAULT 0,
  "total_amount" DECIMAL(12,2) NOT NULL,
  "status" "SilverTransactionStatus" NOT NULL DEFAULT 'PENDING',
  "delivery_method" "SilverDeliveryMethod" NOT NULL DEFAULT 'PARTNER_PICKUP',
  "delivery_address" TEXT,
  "delivery_partner_id" TEXT,
  "escrow_status" TEXT DEFAULT 'PENDING',
  "escrow_held_at" TIMESTAMPTZ,
  "escrow_released_at" TIMESTAMPTZ,
  "inspection_started_at" TIMESTAMPTZ,
  "inspection_ends_at" TIMESTAMPTZ,
  "buyer_notes" TEXT,
  "seller_notes" TEXT,
  "dispute_reason" TEXT,
  "admin_notes" TEXT,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMPTZ,
  CONSTRAINT "silver_transactions_pkey" PRIMARY KEY ("id")
);

-- Silver Certificates Table
CREATE TABLE "silver_certificates" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "certificate_number" TEXT NOT NULL,
  "item_id" TEXT,
  "partner_id" TEXT NOT NULL,
  "verified_purity" "SilverPurity" NOT NULL,
  "verified_weight" DECIMAL(10,3) NOT NULL,
  "is_authentic" BOOLEAN NOT NULL DEFAULT false,
  "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "notes" TEXT,
  "fee_paid" DECIMAL(10,2) DEFAULT 0,
  "issued_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMPTZ DEFAULT (CURRENT_TIMESTAMP + INTERVAL '365 days'),
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "silver_certificates_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "silver_certificates_certificate_number_key" UNIQUE ("certificate_number")
);

-- Silver Partners Table
CREATE TABLE "silver_partners" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "name" TEXT NOT NULL,
  "name_ar" TEXT NOT NULL,
  "shop_type" TEXT NOT NULL DEFAULT 'JEWELRY_SHOP',
  "license_number" TEXT,
  "address" TEXT NOT NULL,
  "governorate" TEXT NOT NULL,
  "city" TEXT,
  "phone" TEXT NOT NULL,
  "whatsapp" TEXT,
  "logo" TEXT,
  "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
  "working_hours" TEXT,
  "rating" DECIMAL(2,1) DEFAULT 0,
  "total_reviews" INTEGER DEFAULT 0,
  "is_verified" BOOLEAN NOT NULL DEFAULT false,
  "is_active" BOOLEAN NOT NULL DEFAULT true,
  "offers_certification" BOOLEAN NOT NULL DEFAULT true,
  "certification_fee" DECIMAL(10,2) DEFAULT 50,
  "offers_pickup" BOOLEAN NOT NULL DEFAULT true,
  "commission_rate" DECIMAL(4,2) DEFAULT 1.00,
  "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "silver_partners_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- FOREIGN KEYS
-- ============================================

-- Silver Items Foreign Keys
ALTER TABLE "silver_items"
  ADD CONSTRAINT "silver_items_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "silver_items"
  ADD CONSTRAINT "silver_items_certificate_id_fkey"
  FOREIGN KEY ("certificate_id") REFERENCES "silver_certificates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Silver Transactions Foreign Keys
ALTER TABLE "silver_transactions"
  ADD CONSTRAINT "silver_transactions_item_id_fkey"
  FOREIGN KEY ("item_id") REFERENCES "silver_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "silver_transactions"
  ADD CONSTRAINT "silver_transactions_buyer_id_fkey"
  FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "silver_transactions"
  ADD CONSTRAINT "silver_transactions_seller_id_fkey"
  FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "silver_transactions"
  ADD CONSTRAINT "silver_transactions_delivery_partner_id_fkey"
  FOREIGN KEY ("delivery_partner_id") REFERENCES "silver_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Silver Certificates Foreign Keys
ALTER TABLE "silver_certificates"
  ADD CONSTRAINT "silver_certificates_item_id_fkey"
  FOREIGN KEY ("item_id") REFERENCES "silver_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "silver_certificates"
  ADD CONSTRAINT "silver_certificates_partner_id_fkey"
  FOREIGN KEY ("partner_id") REFERENCES "silver_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ============================================
-- INDEXES
-- ============================================

-- Silver Prices Indexes
CREATE INDEX "silver_prices_purity_timestamp_idx" ON "silver_prices"("purity", "timestamp" DESC);

-- Silver Items Indexes
CREATE INDEX "silver_items_seller_id_idx" ON "silver_items"("seller_id");
CREATE INDEX "silver_items_status_idx" ON "silver_items"("status");
CREATE INDEX "silver_items_purity_idx" ON "silver_items"("purity");
CREATE INDEX "silver_items_category_idx" ON "silver_items"("category");
CREATE INDEX "silver_items_governorate_idx" ON "silver_items"("governorate");
CREATE INDEX "silver_items_created_at_idx" ON "silver_items"("created_at" DESC);
CREATE INDEX "silver_items_total_asking_price_idx" ON "silver_items"("total_asking_price");

-- Silver Transactions Indexes
CREATE INDEX "silver_transactions_buyer_id_idx" ON "silver_transactions"("buyer_id");
CREATE INDEX "silver_transactions_seller_id_idx" ON "silver_transactions"("seller_id");
CREATE INDEX "silver_transactions_item_id_idx" ON "silver_transactions"("item_id");
CREATE INDEX "silver_transactions_status_idx" ON "silver_transactions"("status");
CREATE INDEX "silver_transactions_created_at_idx" ON "silver_transactions"("created_at" DESC);

-- Silver Certificates Indexes
CREATE INDEX "silver_certificates_partner_id_idx" ON "silver_certificates"("partner_id");
CREATE INDEX "silver_certificates_item_id_idx" ON "silver_certificates"("item_id");

-- Silver Partners Indexes
CREATE INDEX "silver_partners_governorate_idx" ON "silver_partners"("governorate");
CREATE INDEX "silver_partners_is_active_idx" ON "silver_partners"("is_active");

-- ============================================
-- SEED DATA
-- ============================================

-- Insert Default Silver Prices
INSERT INTO "silver_prices" ("purity", "buy_price", "sell_price", "source") VALUES
  ('S999', 60, 65, 'manual'),
  ('S925', 50, 55, 'manual'),
  ('S900', 45, 50, 'manual'),
  ('S800', 40, 45, 'manual');

-- Insert Demo Silver Partners
INSERT INTO "silver_partners" ("name", "name_ar", "shop_type", "address", "governorate", "phone", "is_verified", "offers_certification", "certification_fee", "offers_pickup") VALUES
  ('Silver House Cairo', 'بيت الفضة القاهرة', 'SILVER_SHOP', 'شارع التحرير، وسط البلد', 'القاهرة', '01012345678', true, true, 30, true),
  ('Sterling Silver Alex', 'ستيرلينج سيلفر الإسكندرية', 'JEWELRY_SHOP', 'شارع أبو قير، محطة الرمل', 'الإسكندرية', '01123456789', true, true, 25, true),
  ('Precious Metals Giza', 'المعادن الثمينة الجيزة', 'PRECIOUS_METALS', 'شارع الهرم، الجيزة', 'الجيزة', '01234567890', true, true, 50, true);

-- ============================================
-- UPDATE TRIGGERS
-- ============================================

-- Auto-update updated_at for silver_items
CREATE OR REPLACE FUNCTION update_silver_items_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER silver_items_updated_at_trigger
  BEFORE UPDATE ON silver_items
  FOR EACH ROW
  EXECUTE FUNCTION update_silver_items_updated_at();

-- Auto-update updated_at for silver_transactions
CREATE OR REPLACE FUNCTION update_silver_transactions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER silver_transactions_updated_at_trigger
  BEFORE UPDATE ON silver_transactions
  FOR EACH ROW
  EXECUTE FUNCTION update_silver_transactions_updated_at();

-- Auto-update updated_at for silver_partners
CREATE OR REPLACE FUNCTION update_silver_partners_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER silver_partners_updated_at_trigger
  BEFORE UPDATE ON silver_partners
  FOR EACH ROW
  EXECUTE FUNCTION update_silver_partners_updated_at();

-- ============================================
-- SUCCESS MESSAGE
-- ============================================
-- Migration complete: Silver Marketplace tables created successfully!
-- Tables: silver_prices, silver_items, silver_transactions, silver_certificates, silver_partners
-- Enums: SilverPurity, SilverItemCategory, SilverItemCondition, SilverVerificationLevel, SilverListingStatus, SilverTransactionStatus, SilverDeliveryMethod
