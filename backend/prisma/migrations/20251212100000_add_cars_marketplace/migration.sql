-- ============================================
-- سوق السيارات - Cars Marketplace Migration
-- CORRECTED to match Prisma schema @map() decorators
-- ============================================

-- Create ENUM types for Cars Marketplace
DO $$ BEGIN
    CREATE TYPE "CarSellerType" AS ENUM ('OWNER', 'DEALER', 'SHOWROOM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarBodyType" AS ENUM ('SEDAN', 'HATCHBACK', 'SUV', 'CROSSOVER', 'COUPE', 'CONVERTIBLE', 'PICKUP', 'VAN', 'MINIVAN', 'WAGON', 'TRUCK', 'BUS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarTransmission" AS ENUM ('AUTOMATIC', 'MANUAL', 'CVT', 'DCT');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarFuelType" AS ENUM ('PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'NATURAL_GAS', 'LPG');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarCondition" AS ENUM ('NEW', 'LIKE_NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_WORK');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarAccidentHistory" AS ENUM ('NONE', 'MINOR', 'MODERATE', 'MAJOR', 'UNKNOWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarVerificationLevel" AS ENUM ('BASIC', 'VERIFIED', 'INSPECTED', 'CERTIFIED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarListingStatus" AS ENUM ('DRAFT', 'ACTIVE', 'RESERVED', 'SOLD', 'EXPIRED', 'SUSPENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarTransactionStatus" AS ENUM ('INITIATED', 'NEGOTIATING', 'AGREED', 'ESCROW_PENDING', 'ESCROW_HELD', 'INSPECTION_PENDING', 'DOCUMENTS_PENDING', 'READY_FOR_TRANSFER', 'COMPLETED', 'DISPUTED', 'REFUNDED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarDeliveryMethod" AS ENUM ('MEETUP', 'SHOWROOM', 'HOME_DELIVERY', 'PARTNER_PICKUP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarBarterStatus" AS ENUM ('PENDING', 'VIEWED', 'COUNTER_OFFERED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarInspectionType" AS ENUM ('BASIC', 'STANDARD', 'COMPREHENSIVE', 'PRE_PURCHASE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarInspectionStatus" AS ENUM ('REQUESTED', 'SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CarInspectionRecommendation" AS ENUM ('HIGHLY_RECOMMENDED', 'RECOMMENDED', 'CAUTION', 'NOT_RECOMMENDED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- جدول أسعار السيارات المرجعية
-- ============================================
CREATE TABLE IF NOT EXISTS "car_prices" (
    "id" TEXT NOT NULL,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "trim" TEXT,
    "price_low" DOUBLE PRECISION NOT NULL,
    "price_average" DOUBLE PRECISION NOT NULL,
    "price_high" DOUBLE PRECISION NOT NULL,
    "base_price" DOUBLE PRECISION NOT NULL,
    "mileage_factor" DOUBLE PRECISION NOT NULL DEFAULT 0.00005,
    "data_source" TEXT,
    "sample_size" INTEGER NOT NULL DEFAULT 0,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "valid_until" TIMESTAMP(3),

    CONSTRAINT "car_prices_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "car_prices_make_model_year_trim_key" ON "car_prices"("make", "model", "year", "trim");
CREATE INDEX IF NOT EXISTS "car_prices_make_model_idx" ON "car_prices"("make", "model");
CREATE INDEX IF NOT EXISTS "car_prices_year_idx" ON "car_prices"("year");

-- ============================================
-- جدول مراكز الفحص الشركاء (يجب إنشاؤه أولاً بسبب العلاقات)
-- ============================================
CREATE TABLE IF NOT EXISTS "car_partners" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "logo" TEXT,
    "governorate" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "phone" TEXT NOT NULL,
    "whatsapp" TEXT,
    "email" TEXT,
    "working_hours" TEXT,
    "offers_basic_inspection" BOOLEAN NOT NULL DEFAULT true,
    "offers_full_inspection" BOOLEAN NOT NULL DEFAULT true,
    "offers_pre_purchase" BOOLEAN NOT NULL DEFAULT true,
    "offers_computer_diagnostics" BOOLEAN NOT NULL DEFAULT false,
    "basic_inspection_fee" DOUBLE PRECISION NOT NULL DEFAULT 200,
    "standard_inspection_fee" DOUBLE PRECISION NOT NULL DEFAULT 500,
    "comprehensive_inspection_fee" DOUBLE PRECISION NOT NULL DEFAULT 1000,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "total_inspections" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "car_partners_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "car_partners_governorate_idx" ON "car_partners"("governorate");
CREATE INDEX IF NOT EXISTS "car_partners_is_active_idx" ON "car_partners"("is_active");

-- ============================================
-- جدول فحوصات السيارات (يجب إنشاؤه قبل car_listings بسبب العلاقة)
-- ============================================
CREATE TABLE IF NOT EXISTS "car_inspections" (
    "id" TEXT NOT NULL,
    "car_id" TEXT,
    "inspector_id" TEXT,
    "partner_id" TEXT,
    "requested_by_id" TEXT NOT NULL,
    "inspection_type" "CarInspectionType" NOT NULL DEFAULT 'STANDARD',
    "overall_score" INTEGER,
    "exterior_score" INTEGER,
    "interior_score" INTEGER,
    "mechanical_score" INTEGER,
    "electrical_score" INTEGER,
    "findings" JSONB,
    "inspection_photos" TEXT[],
    "recommendation" "CarInspectionRecommendation",
    "estimated_repair_cost" DOUBLE PRECISION,
    "status" "CarInspectionStatus" NOT NULL DEFAULT 'REQUESTED',
    "scheduled_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "report_url" TEXT,
    "inspection_fee" DOUBLE PRECISION NOT NULL,
    "paid" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "car_inspections_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "car_inspections_car_id_idx" ON "car_inspections"("car_id");
CREATE INDEX IF NOT EXISTS "car_inspections_partner_id_idx" ON "car_inspections"("partner_id");
CREATE INDEX IF NOT EXISTS "car_inspections_status_idx" ON "car_inspections"("status");

-- ============================================
-- جدول إعلانات السيارات
-- ============================================
CREATE TABLE IF NOT EXISTS "car_listings" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "make" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "trim" TEXT,
    "body_type" "CarBodyType" NOT NULL,
    "transmission" "CarTransmission" NOT NULL,
    "fuel_type" "CarFuelType" NOT NULL,
    "engine_size" DOUBLE PRECISION,
    "cylinders" INTEGER,
    "drive_type" TEXT,
    "color_exterior" TEXT,
    "color_interior" TEXT,
    "doors" INTEGER NOT NULL DEFAULT 4,
    "seats" INTEGER NOT NULL DEFAULT 5,
    "mileage" INTEGER NOT NULL,
    "condition" "CarCondition" NOT NULL DEFAULT 'GOOD',
    "accident_history" "CarAccidentHistory" NOT NULL DEFAULT 'UNKNOWN',
    "service_history" BOOLEAN DEFAULT false,
    "license_governorate" TEXT,
    "is_imported" BOOLEAN NOT NULL DEFAULT false,
    "is_cng_converted" BOOLEAN NOT NULL DEFAULT false,
    "vin" TEXT,
    "plate_number" TEXT,
    "asking_price" DOUBLE PRECISION NOT NULL,
    "estimated_value" DOUBLE PRECISION,
    "price_negotiable" BOOLEAN NOT NULL DEFAULT true,
    "seller_type" "CarSellerType" NOT NULL DEFAULT 'OWNER',
    "open_for_barter" BOOLEAN NOT NULL DEFAULT true,
    "barter_preferences" JSONB,
    "verification_level" "CarVerificationLevel" NOT NULL DEFAULT 'BASIC',
    "inspection_id" TEXT UNIQUE,
    "images" TEXT[],
    "video_url" TEXT,
    "governorate" TEXT,
    "city" TEXT,
    "district" TEXT,
    "status" "CarListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "favorites_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),
    "sold_at" TIMESTAMP(3),

    CONSTRAINT "car_listings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "car_listings_seller_id_idx" ON "car_listings"("seller_id");
CREATE INDEX IF NOT EXISTS "car_listings_make_model_idx" ON "car_listings"("make", "model");
CREATE INDEX IF NOT EXISTS "car_listings_year_idx" ON "car_listings"("year");
CREATE INDEX IF NOT EXISTS "car_listings_asking_price_idx" ON "car_listings"("asking_price");
CREATE INDEX IF NOT EXISTS "car_listings_mileage_idx" ON "car_listings"("mileage");
CREATE INDEX IF NOT EXISTS "car_listings_status_idx" ON "car_listings"("status");
CREATE INDEX IF NOT EXISTS "car_listings_seller_type_idx" ON "car_listings"("seller_type");
CREATE INDEX IF NOT EXISTS "car_listings_governorate_idx" ON "car_listings"("governorate");
CREATE INDEX IF NOT EXISTS "car_listings_body_type_idx" ON "car_listings"("body_type");
CREATE INDEX IF NOT EXISTS "car_listings_fuel_type_idx" ON "car_listings"("fuel_type");
CREATE INDEX IF NOT EXISTS "car_listings_created_at_idx" ON "car_listings"("created_at");

-- ============================================
-- جدول معاملات السيارات
-- ============================================
CREATE TABLE IF NOT EXISTS "car_transactions" (
    "id" TEXT NOT NULL,
    "transaction_type" TEXT NOT NULL DEFAULT 'direct',
    "car_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "agreed_price" DOUBLE PRECISION NOT NULL,
    "buyer_commission" DOUBLE PRECISION NOT NULL,
    "seller_commission" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "market_value_at_transaction" DOUBLE PRECISION,
    "escrow_status" TEXT NOT NULL DEFAULT 'pending',
    "escrow_amount" DOUBLE PRECISION,
    "escrow_deposited_at" TIMESTAMP(3),
    "escrow_released_at" TIMESTAMP(3),
    "inspection_required" BOOLEAN NOT NULL DEFAULT false,
    "inspection_completed" BOOLEAN NOT NULL DEFAULT false,
    "inspection_id" TEXT,
    "delivery_method" "CarDeliveryMethod" NOT NULL DEFAULT 'MEETUP',
    "delivery_address" TEXT,
    "delivery_partner_id" TEXT,
    "delivery_scheduled_at" TIMESTAMP(3),
    "status" "CarTransactionStatus" NOT NULL DEFAULT 'INITIATED',
    "buyer_confirmed_at" TIMESTAMP(3),
    "seller_confirmed_at" TIMESTAMP(3),
    "buyer_notes" TEXT,
    "seller_notes" TEXT,
    "dispute_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,

    CONSTRAINT "car_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "car_transactions_car_id_idx" ON "car_transactions"("car_id");
CREATE INDEX IF NOT EXISTS "car_transactions_buyer_id_idx" ON "car_transactions"("buyer_id");
CREATE INDEX IF NOT EXISTS "car_transactions_seller_id_idx" ON "car_transactions"("seller_id");
CREATE INDEX IF NOT EXISTS "car_transactions_status_idx" ON "car_transactions"("status");
CREATE INDEX IF NOT EXISTS "car_transactions_created_at_idx" ON "car_transactions"("created_at");

-- ============================================
-- جدول عروض المقايضة للسيارات (سيارة بسيارة)
-- ============================================
CREATE TABLE IF NOT EXISTS "car_barter_proposals" (
    "id" TEXT NOT NULL,
    "proposer_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "offered_car_id" TEXT NOT NULL,
    "requested_car_id" TEXT NOT NULL,
    "offered_car_value" DOUBLE PRECISION NOT NULL,
    "requested_car_value" DOUBLE PRECISION NOT NULL,
    "cash_difference" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cash_payer" TEXT,
    "proposer_commission" DOUBLE PRECISION NOT NULL,
    "receiver_commission" DOUBLE PRECISION NOT NULL,
    "status" "CarBarterStatus" NOT NULL DEFAULT 'PENDING',
    "counter_proposal_id" TEXT UNIQUE,
    "proposer_message" TEXT,
    "receiver_response" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "responded_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "car_barter_proposals_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "car_barter_proposals_proposer_id_idx" ON "car_barter_proposals"("proposer_id");
CREATE INDEX IF NOT EXISTS "car_barter_proposals_receiver_id_idx" ON "car_barter_proposals"("receiver_id");
CREATE INDEX IF NOT EXISTS "car_barter_proposals_offered_car_id_idx" ON "car_barter_proposals"("offered_car_id");
CREATE INDEX IF NOT EXISTS "car_barter_proposals_requested_car_id_idx" ON "car_barter_proposals"("requested_car_id");
CREATE INDEX IF NOT EXISTS "car_barter_proposals_status_idx" ON "car_barter_proposals"("status");

-- ============================================
-- إضافة Foreign Keys
-- ============================================

-- Car Inspections FKs (first because others depend on it)
ALTER TABLE "car_inspections" DROP CONSTRAINT IF EXISTS "car_inspections_partner_id_fkey";
ALTER TABLE "car_inspections" ADD CONSTRAINT "car_inspections_partner_id_fkey"
    FOREIGN KEY ("partner_id") REFERENCES "car_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "car_inspections" DROP CONSTRAINT IF EXISTS "car_inspections_requested_by_id_fkey";
ALTER TABLE "car_inspections" ADD CONSTRAINT "car_inspections_requested_by_id_fkey"
    FOREIGN KEY ("requested_by_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Car Listings FKs
ALTER TABLE "car_listings" DROP CONSTRAINT IF EXISTS "car_listings_seller_id_fkey";
ALTER TABLE "car_listings" ADD CONSTRAINT "car_listings_seller_id_fkey"
    FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "car_listings" DROP CONSTRAINT IF EXISTS "car_listings_inspection_id_fkey";
ALTER TABLE "car_listings" ADD CONSTRAINT "car_listings_inspection_id_fkey"
    FOREIGN KEY ("inspection_id") REFERENCES "car_inspections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Car Transactions FKs
ALTER TABLE "car_transactions" DROP CONSTRAINT IF EXISTS "car_transactions_car_id_fkey";
ALTER TABLE "car_transactions" ADD CONSTRAINT "car_transactions_car_id_fkey"
    FOREIGN KEY ("car_id") REFERENCES "car_listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "car_transactions" DROP CONSTRAINT IF EXISTS "car_transactions_buyer_id_fkey";
ALTER TABLE "car_transactions" ADD CONSTRAINT "car_transactions_buyer_id_fkey"
    FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "car_transactions" DROP CONSTRAINT IF EXISTS "car_transactions_seller_id_fkey";
ALTER TABLE "car_transactions" ADD CONSTRAINT "car_transactions_seller_id_fkey"
    FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Car Barter Proposals FKs
ALTER TABLE "car_barter_proposals" DROP CONSTRAINT IF EXISTS "car_barter_proposals_proposer_id_fkey";
ALTER TABLE "car_barter_proposals" ADD CONSTRAINT "car_barter_proposals_proposer_id_fkey"
    FOREIGN KEY ("proposer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "car_barter_proposals" DROP CONSTRAINT IF EXISTS "car_barter_proposals_receiver_id_fkey";
ALTER TABLE "car_barter_proposals" ADD CONSTRAINT "car_barter_proposals_receiver_id_fkey"
    FOREIGN KEY ("receiver_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "car_barter_proposals" DROP CONSTRAINT IF EXISTS "car_barter_proposals_offered_car_id_fkey";
ALTER TABLE "car_barter_proposals" ADD CONSTRAINT "car_barter_proposals_offered_car_id_fkey"
    FOREIGN KEY ("offered_car_id") REFERENCES "car_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "car_barter_proposals" DROP CONSTRAINT IF EXISTS "car_barter_proposals_requested_car_id_fkey";
ALTER TABLE "car_barter_proposals" ADD CONSTRAINT "car_barter_proposals_requested_car_id_fkey"
    FOREIGN KEY ("requested_car_id") REFERENCES "car_listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "car_barter_proposals" DROP CONSTRAINT IF EXISTS "car_barter_proposals_counter_proposal_id_fkey";
ALTER TABLE "car_barter_proposals" ADD CONSTRAINT "car_barter_proposals_counter_proposal_id_fkey"
    FOREIGN KEY ("counter_proposal_id") REFERENCES "car_barter_proposals"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- إدخال أسعار السيارات المرجعية
-- ============================================
INSERT INTO "car_prices" ("id", "make", "model", "year", "trim", "price_low", "price_average", "price_high", "base_price", "data_source") VALUES
    (gen_random_uuid()::text, 'تويوتا', 'كورولا', 2024, 'XLI', 1200000, 1300000, 1400000, 1300000, 'market'),
    (gen_random_uuid()::text, 'تويوتا', 'كورولا', 2023, 'XLI', 1050000, 1150000, 1250000, 1150000, 'market'),
    (gen_random_uuid()::text, 'تويوتا', 'كامري', 2024, 'LE', 1800000, 1950000, 2100000, 1950000, 'market'),
    (gen_random_uuid()::text, 'هيونداي', 'توسان', 2024, 'GLS', 1400000, 1550000, 1700000, 1550000, 'market'),
    (gen_random_uuid()::text, 'هيونداي', 'النترا', 2024, 'GL', 900000, 1000000, 1100000, 1000000, 'market'),
    (gen_random_uuid()::text, 'كيا', 'سبورتاج', 2024, 'LX', 1300000, 1450000, 1600000, 1450000, 'market'),
    (gen_random_uuid()::text, 'نيسان', 'صني', 2024, 'SV', 700000, 800000, 900000, 800000, 'market'),
    (gen_random_uuid()::text, 'شيري', 'تيجو 4', 2024, 'Comfort', 650000, 750000, 850000, 750000, 'market'),
    (gen_random_uuid()::text, 'MG', 'ZS', 2024, 'COM', 750000, 850000, 950000, 850000, 'market'),
    (gen_random_uuid()::text, 'بي واي دي', 'سيل', 2024, 'GL', 800000, 900000, 1000000, 900000, 'market')
ON CONFLICT DO NOTHING;

-- ============================================
-- إدخال مراكز فحص شركاء
-- ============================================
INSERT INTO "car_partners" ("id", "name", "name_ar", "description", "governorate", "city", "address", "phone", "basic_inspection_fee", "standard_inspection_fee", "comprehensive_inspection_fee", "is_verified") VALUES
    ('car-partner-001', 'AutoCheck Egypt', 'أوتوتشيك مصر', 'مركز فحص معتمد متخصص في فحص جميع أنواع السيارات', 'القاهرة', 'مدينة نصر', 'شارع عباس العقاد، أمام سيتي ستارز', '+201001234567', 200, 500, 1000, true),
    ('car-partner-002', 'Car Inspect Pro', 'كار انسبكت برو', 'فحص سيارات احترافي مع تقرير شامل', 'الجيزة', '6 أكتوبر', 'المحور المركزي، بجوار مول العرب', '+201012345678', 250, 600, 1200, true),
    ('car-partner-003', 'Alexandria Auto Service', 'الإسكندرية لخدمات السيارات', 'خبرة 20 سنة في فحص وصيانة السيارات', 'الإسكندرية', 'سموحة', 'شارع فوزي معاذ', '+201023456789', 180, 450, 900, true),
    ('car-partner-004', 'Mansoura Car Check', 'المنصورة لفحص السيارات', 'مركز فحص معتمد في الدلتا', 'الدقهلية', 'المنصورة', 'شارع الجمهورية', '+201034567890', 150, 400, 800, false)
ON CONFLICT DO NOTHING;

-- ============================================
-- إدخال إعلانات سيارات تجريبية
-- ============================================
INSERT INTO "car_listings" ("id", "seller_id", "seller_type", "title", "description", "make", "model", "year", "trim", "body_type", "transmission", "fuel_type", "engine_size", "mileage", "condition", "accident_history", "color_exterior", "color_interior", "images", "asking_price", "estimated_value", "price_negotiable", "open_for_barter", "barter_preferences", "governorate", "city", "verification_level", "status")
SELECT
    'car-listing-001',
    id,
    'OWNER',
    'تويوتا كورولا 2023 - حالة ممتازة',
    'سيارة تويوتا كورولا موديل 2023، ماشية 25,000 كم فقط. صيانة توكيل كاملة. لون أبيض لؤلؤي. فل كامل. السيارة زيرو حوادث. البيع لظروف السفر.',
    'تويوتا',
    'كورولا',
    2023,
    'XLI',
    'SEDAN',
    'AUTOMATIC',
    'PETROL',
    1.6,
    25000,
    'EXCELLENT',
    'NONE',
    'أبيض لؤلؤي',
    'بيج',
    ARRAY['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'],
    1150000,
    1150000,
    true,
    true,
    '{"accepts": ["car"], "description": "أقبل المقايضة بسيارة أحدث مع دفع الفرق"}'::jsonb,
    'القاهرة',
    'مدينة نصر',
    'BASIC',
    'ACTIVE'
FROM users WHERE email LIKE '%@demo.xchange.eg' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "car_listings" ("id", "seller_id", "seller_type", "title", "description", "make", "model", "year", "trim", "body_type", "transmission", "fuel_type", "engine_size", "mileage", "condition", "accident_history", "color_exterior", "color_interior", "images", "asking_price", "estimated_value", "price_negotiable", "open_for_barter", "governorate", "city", "verification_level", "status")
SELECT
    'car-listing-002',
    id,
    'SHOWROOM',
    'هيونداي توسان 2024 زيرو',
    'هيونداي توسان 2024 زيرو الكيلومتر. استلام فوري من المعرض. ضمان الوكيل 5 سنوات أو 100,000 كم. تمويل متاح حتى 7 سنوات.',
    'هيونداي',
    'توسان',
    2024,
    'GLS',
    'SUV',
    'AUTOMATIC',
    'PETROL',
    1.6,
    0,
    'NEW',
    'NONE',
    'أسود ميتاليك',
    'أسود',
    ARRAY['https://images.unsplash.com/photo-1633695269498-0e0e0c8bcaac?w=800'],
    1650000,
    1550000,
    false,
    false,
    'الجيزة',
    '6 أكتوبر',
    'VERIFIED',
    'ACTIVE'
FROM users WHERE email LIKE '%@demo.xchange.eg' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "car_listings" ("id", "seller_id", "seller_type", "title", "description", "make", "model", "year", "body_type", "transmission", "fuel_type", "engine_size", "mileage", "condition", "accident_history", "color_exterior", "images", "asking_price", "estimated_value", "price_negotiable", "open_for_barter", "barter_preferences", "governorate", "city", "verification_level", "status")
SELECT
    'car-listing-003',
    id,
    'OWNER',
    'مرسيدس E200 2021 - فل الفل',
    'مرسيدس E200 موديل 2021، AMG Kit أصلي. ماشية 45,000 كم. صيانة توكيل. جميع الكماليات. السيارة بحالة ممتازة. أقبل المقايضة بشقة أو أرض.',
    'مرسيدس',
    'E200',
    2021,
    'SEDAN',
    'AUTOMATIC',
    'PETROL',
    2.0,
    45000,
    'EXCELLENT',
    'NONE',
    'فضي',
    ARRAY['https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800'],
    2800000,
    2700000,
    true,
    true,
    '{"accepts": ["car", "property"], "description": "أقبل المقايضة بشقة في القاهرة الجديدة أو 6 أكتوبر مع دفع الفرق. أو سيارة SUV حديثة.", "maxCashDifference": 500000}'::jsonb,
    'القاهرة',
    'القاهرة الجديدة',
    'INSPECTED',
    'ACTIVE'
FROM users WHERE email LIKE '%@demo.xchange.eg' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "car_listings" ("id", "seller_id", "seller_type", "title", "description", "make", "model", "year", "body_type", "transmission", "fuel_type", "mileage", "condition", "accident_history", "color_exterior", "images", "asking_price", "price_negotiable", "open_for_barter", "governorate", "city", "status")
SELECT
    'car-listing-004',
    id,
    'DEALER',
    'شيري تيجو 4 - 2024 أقل سعر',
    'شيري تيجو 4 موديل 2024 زيرو. أقل سعر في السوق. ضمان 3 سنوات. تسهيلات في السداد.',
    'شيري',
    'تيجو 4',
    2024,
    'SUV',
    'AUTOMATIC',
    'PETROL',
    0,
    'NEW',
    'NONE',
    'أحمر',
    ARRAY['https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800'],
    720000,
    true,
    false,
    'الإسكندرية',
    'سموحة',
    'ACTIVE'
FROM users WHERE email LIKE '%@demo.xchange.eg' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "car_listings" ("id", "seller_id", "seller_type", "title", "description", "make", "model", "year", "body_type", "transmission", "fuel_type", "engine_size", "mileage", "condition", "accident_history", "color_exterior", "images", "asking_price", "price_negotiable", "open_for_barter", "barter_preferences", "governorate", "city", "status")
SELECT
    'car-listing-005',
    id,
    'OWNER',
    'BMW X3 2022 - M Sport',
    'BMW X3 M Sport Package موديل 2022. ماشية 30,000 كم. حالة زيرو. جميع الكماليات. أقبل المقايضة بسيارة BMW أو Mercedes أحدث.',
    'بي إم دبليو',
    'X3',
    2022,
    'SUV',
    'AUTOMATIC',
    'PETROL',
    2.0,
    30000,
    'EXCELLENT',
    'NONE',
    'أزرق ميتاليك',
    ARRAY['https://images.unsplash.com/photo-1556189250-72ba954cfc2b?w=800'],
    2400000,
    true,
    true,
    '{"accepts": ["car"], "preferredMakes": ["BMW", "Mercedes", "Audi"]}'::jsonb,
    'الجيزة',
    'الشيخ زايد',
    'ACTIVE'
FROM users WHERE email LIKE '%@demo.xchange.eg' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- تأكيد النجاح
-- ============================================
SELECT 'سوق السيارات جاهز!' as status,
       (SELECT COUNT(*) FROM car_listings) as car_listings_count,
       (SELECT COUNT(*) FROM car_partners) as partners_count,
       (SELECT COUNT(*) FROM car_prices) as prices_count;
