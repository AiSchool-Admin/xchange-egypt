-- ============================================
-- سوق الذهب - Gold Marketplace Migration
-- ============================================

-- Create ENUM types
DO $$ BEGIN
    CREATE TYPE "GoldKarat" AS ENUM ('K18', 'K21', 'K24');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GoldItemCategory" AS ENUM ('RING', 'NECKLACE', 'BRACELET', 'EARRING', 'SET', 'PENDANT', 'ANKLET', 'COIN', 'BAR', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GoldItemCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GoldVerificationLevel" AS ENUM ('BASIC', 'VERIFIED', 'CERTIFIED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GoldListingStatus" AS ENUM ('ACTIVE', 'RESERVED', 'SOLD', 'EXPIRED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GoldTransactionStatus" AS ENUM ('PENDING', 'ESCROW_HELD', 'DELIVERED', 'INSPECTING', 'COMPLETED', 'DISPUTED', 'REFUNDED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "GoldDeliveryMethod" AS ENUM ('MEETUP', 'SHIPPING', 'PARTNER_PICKUP');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================
-- جدول أسعار الذهب
-- ============================================
CREATE TABLE IF NOT EXISTS "gold_prices" (
    "id" TEXT NOT NULL,
    "karat" "GoldKarat" NOT NULL,
    "buy_price" DOUBLE PRECISION NOT NULL,
    "sell_price" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,

    CONSTRAINT "gold_prices_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "gold_prices_karat_timestamp_idx" ON "gold_prices"("karat", "timestamp");

-- ============================================
-- جدول الصاغة الشركاء
-- ============================================
CREATE TABLE IF NOT EXISTS "gold_partners" (
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
    "offers_certification" BOOLEAN NOT NULL DEFAULT true,
    "offers_pickup" BOOLEAN NOT NULL DEFAULT true,
    "offers_repair" BOOLEAN NOT NULL DEFAULT false,
    "certification_fee" DOUBLE PRECISION NOT NULL DEFAULT 75,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "total_certifications" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "gold_partners_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "gold_partners_governorate_idx" ON "gold_partners"("governorate");
CREATE INDEX IF NOT EXISTS "gold_partners_is_active_idx" ON "gold_partners"("is_active");

-- ============================================
-- جدول شهادات الذهب
-- ============================================
CREATE TABLE IF NOT EXISTS "gold_certificates" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "verified_karat" "GoldKarat" NOT NULL,
    "verified_weight" DOUBLE PRECISION NOT NULL,
    "purity_percentage" DOUBLE PRECISION NOT NULL,
    "is_authentic" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "certificate_number" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "gold_certificates_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "gold_certificates_item_id_key" ON "gold_certificates"("item_id");
CREATE UNIQUE INDEX IF NOT EXISTS "gold_certificates_certificate_number_key" ON "gold_certificates"("certificate_number");
CREATE INDEX IF NOT EXISTS "gold_certificates_partner_id_idx" ON "gold_certificates"("partner_id");

-- ============================================
-- جدول قطع الذهب
-- ============================================
CREATE TABLE IF NOT EXISTS "gold_items" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" "GoldItemCategory" NOT NULL,
    "karat" "GoldKarat" NOT NULL,
    "weight_grams" DOUBLE PRECISION NOT NULL,
    "condition" "GoldItemCondition" NOT NULL DEFAULT 'GOOD',
    "images" TEXT[],
    "asking_price_per_gram" DOUBLE PRECISION NOT NULL,
    "total_asking_price" DOUBLE PRECISION NOT NULL,
    "gold_price_at_listing" DOUBLE PRECISION NOT NULL,
    "governorate" TEXT,
    "city" TEXT,
    "verification_level" "GoldVerificationLevel" NOT NULL DEFAULT 'BASIC',
    "certificate_id" TEXT,
    "status" "GoldListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "views" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "allow_barter" BOOLEAN NOT NULL DEFAULT false,
    "barter_description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "gold_items_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "gold_items_certificate_id_key" ON "gold_items"("certificate_id");
CREATE INDEX IF NOT EXISTS "gold_items_seller_id_idx" ON "gold_items"("seller_id");
CREATE INDEX IF NOT EXISTS "gold_items_category_idx" ON "gold_items"("category");
CREATE INDEX IF NOT EXISTS "gold_items_karat_idx" ON "gold_items"("karat");
CREATE INDEX IF NOT EXISTS "gold_items_status_idx" ON "gold_items"("status");
CREATE INDEX IF NOT EXISTS "gold_items_governorate_idx" ON "gold_items"("governorate");
CREATE INDEX IF NOT EXISTS "gold_items_verification_level_idx" ON "gold_items"("verification_level");
CREATE INDEX IF NOT EXISTS "gold_items_created_at_idx" ON "gold_items"("created_at");

-- ============================================
-- جدول معاملات الذهب
-- ============================================
CREATE TABLE IF NOT EXISTS "gold_transactions" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "gold_price_at_transaction" DOUBLE PRECISION NOT NULL,
    "item_price" DOUBLE PRECISION NOT NULL,
    "buyer_commission" DOUBLE PRECISION NOT NULL,
    "seller_commission" DOUBLE PRECISION NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "escrow_status" TEXT NOT NULL DEFAULT 'PENDING',
    "escrow_held_at" TIMESTAMP(3),
    "escrow_released_at" TIMESTAMP(3),
    "delivery_method" "GoldDeliveryMethod" NOT NULL,
    "delivery_address" TEXT,
    "delivery_partner_id" TEXT,
    "inspection_started_at" TIMESTAMP(3),
    "inspection_ends_at" TIMESTAMP(3),
    "status" "GoldTransactionStatus" NOT NULL DEFAULT 'PENDING',
    "buyer_notes" TEXT,
    "seller_notes" TEXT,
    "dispute_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "gold_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "gold_transactions_item_id_idx" ON "gold_transactions"("item_id");
CREATE INDEX IF NOT EXISTS "gold_transactions_buyer_id_idx" ON "gold_transactions"("buyer_id");
CREATE INDEX IF NOT EXISTS "gold_transactions_seller_id_idx" ON "gold_transactions"("seller_id");
CREATE INDEX IF NOT EXISTS "gold_transactions_status_idx" ON "gold_transactions"("status");
CREATE INDEX IF NOT EXISTS "gold_transactions_created_at_idx" ON "gold_transactions"("created_at");

-- ============================================
-- إضافة Foreign Keys
-- ============================================
ALTER TABLE "gold_certificates" DROP CONSTRAINT IF EXISTS "gold_certificates_partner_id_fkey";
ALTER TABLE "gold_certificates" ADD CONSTRAINT "gold_certificates_partner_id_fkey"
    FOREIGN KEY ("partner_id") REFERENCES "gold_partners"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "gold_items" DROP CONSTRAINT IF EXISTS "gold_items_seller_id_fkey";
ALTER TABLE "gold_items" ADD CONSTRAINT "gold_items_seller_id_fkey"
    FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "gold_items" DROP CONSTRAINT IF EXISTS "gold_items_certificate_id_fkey";
ALTER TABLE "gold_items" ADD CONSTRAINT "gold_items_certificate_id_fkey"
    FOREIGN KEY ("certificate_id") REFERENCES "gold_certificates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "gold_transactions" DROP CONSTRAINT IF EXISTS "gold_transactions_item_id_fkey";
ALTER TABLE "gold_transactions" ADD CONSTRAINT "gold_transactions_item_id_fkey"
    FOREIGN KEY ("item_id") REFERENCES "gold_items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "gold_transactions" DROP CONSTRAINT IF EXISTS "gold_transactions_buyer_id_fkey";
ALTER TABLE "gold_transactions" ADD CONSTRAINT "gold_transactions_buyer_id_fkey"
    FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "gold_transactions" DROP CONSTRAINT IF EXISTS "gold_transactions_seller_id_fkey";
ALTER TABLE "gold_transactions" ADD CONSTRAINT "gold_transactions_seller_id_fkey"
    FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "gold_transactions" DROP CONSTRAINT IF EXISTS "gold_transactions_delivery_partner_id_fkey";
ALTER TABLE "gold_transactions" ADD CONSTRAINT "gold_transactions_delivery_partner_id_fkey"
    FOREIGN KEY ("delivery_partner_id") REFERENCES "gold_partners"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================
-- إدخال أسعار الذهب الأولية (ديسمبر 2024)
-- ============================================
INSERT INTO "gold_prices" ("id", "karat", "buy_price", "sell_price", "source") VALUES
    (gen_random_uuid()::text, 'K18', 4480, 4500, 'manual'),
    (gen_random_uuid()::text, 'K21', 5600, 5620, 'manual'),
    (gen_random_uuid()::text, 'K24', 6400, 6420, 'manual')
ON CONFLICT DO NOTHING;

-- ============================================
-- إدخال صاغة شركاء تجريبيين
-- ============================================
INSERT INTO "gold_partners" ("id", "name", "name_ar", "description", "governorate", "city", "address", "phone", "certification_fee", "is_verified") VALUES
    ('partner-001', 'Al-Sagha Jewelry', 'الصاغة للمجوهرات', 'صائغ معتمد منذ 1985، متخصص في الذهب عيار 21', 'القاهرة', 'وسط البلد', 'شارع الصاغة، خان الخليلي', '+201000000001', 75, true),
    ('partner-002', 'Gold House', 'بيت الذهب', 'أكبر معرض ذهب في الإسكندرية', 'الإسكندرية', 'سموحة', 'شارع فوزي معاذ', '+201000000002', 100, true),
    ('partner-003', 'Zahab Masr', 'ذهب مصر', 'فحص وتثمين معتمد', 'الجيزة', '6 أكتوبر', 'مول العرب', '+201000000003', 50, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- إدخال قطع ذهب تجريبية
-- ============================================
INSERT INTO "gold_items" ("id", "seller_id", "title", "description", "category", "karat", "weight_grams", "condition", "images", "asking_price_per_gram", "total_asking_price", "gold_price_at_listing", "governorate", "city", "verification_level", "status", "allow_barter")
SELECT
    'gold-item-001',
    id,
    'طقم شبكة عيار 21 - 50 جرام',
    'طقم شبكة كامل عيار 21، يتضمن عقد + إسورة + خاتم + حلق. استعمال مرة واحدة فقط في الفرح. الحالة ممتازة جداً.',
    'SET',
    'K21',
    50,
    'LIKE_NEW',
    ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'],
    5640,
    282000,
    5600,
    'القاهرة',
    'مدينة نصر',
    'BASIC',
    'ACTIVE',
    true
FROM users WHERE email LIKE '%@demo.xchange.eg' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "gold_items" ("id", "seller_id", "title", "description", "category", "karat", "weight_grams", "condition", "images", "asking_price_per_gram", "total_asking_price", "gold_price_at_listing", "governorate", "city", "verification_level", "status", "allow_barter")
SELECT
    'gold-item-002',
    id,
    'خاتم سوليتير عيار 18 - 8 جرام',
    'خاتم سوليتير راقي عيار 18 مع فص ألماس صغير. مناسب للخطوبة.',
    'RING',
    'K18',
    8,
    'GOOD',
    ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'],
    4520,
    36160,
    4480,
    'الإسكندرية',
    'سموحة',
    'VERIFIED',
    'ACTIVE',
    false
FROM users WHERE email LIKE '%@demo.xchange.eg' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "gold_items" ("id", "seller_id", "title", "description", "category", "karat", "weight_grams", "condition", "images", "asking_price_per_gram", "total_asking_price", "gold_price_at_listing", "governorate", "city", "verification_level", "status", "allow_barter")
SELECT
    'gold-item-003',
    id,
    'سبيكة ذهب عيار 24 - 100 جرام',
    'سبيكة ذهب خالص عيار 24، مختومة ومعتمدة. مثالية للاستثمار.',
    'BAR',
    'K24',
    100,
    'NEW',
    ARRAY['https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800'],
    6450,
    645000,
    6400,
    'القاهرة',
    'المعادي',
    'CERTIFIED',
    'ACTIVE',
    false
FROM users WHERE email LIKE '%@demo.xchange.eg' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "gold_items" ("id", "seller_id", "title", "description", "category", "karat", "weight_grams", "condition", "images", "asking_price_per_gram", "total_asking_price", "gold_price_at_listing", "governorate", "city", "verification_level", "status", "allow_barter")
SELECT
    'gold-item-004',
    id,
    'سلسلة كارتير عيار 21 - 15 جرام',
    'سلسلة كارتير أصلية عيار 21، طول 45 سم. حالة ممتازة.',
    'NECKLACE',
    'K21',
    15,
    'LIKE_NEW',
    ARRAY['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=800'],
    5650,
    84750,
    5600,
    'الجيزة',
    'الشيخ زايد',
    'BASIC',
    'ACTIVE',
    true
FROM users WHERE email LIKE '%@demo.xchange.eg' LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO "gold_items" ("id", "seller_id", "title", "description", "category", "karat", "weight_grams", "condition", "images", "asking_price_per_gram", "total_asking_price", "gold_price_at_listing", "governorate", "city", "verification_level", "status", "allow_barter")
SELECT
    'gold-item-005',
    id,
    'جنيه ذهب جورج - 8 جرام',
    'جنيه ذهب جورج أصلي، حالة ممتازة للاستثمار أو الهدايا.',
    'COIN',
    'K21',
    8,
    'GOOD',
    ARRAY['https://images.unsplash.com/photo-1621155346337-1d19476ba7d6?w=800'],
    5680,
    45440,
    5600,
    'القاهرة',
    'وسط البلد',
    'CERTIFIED',
    'ACTIVE',
    false
FROM users WHERE email LIKE '%@demo.xchange.eg' LIMIT 1
ON CONFLICT DO NOTHING;

-- ============================================
-- تأكيد النجاح
-- ============================================
SELECT 'سوق الذهب جاهز! 🏆' as status,
       (SELECT COUNT(*) FROM gold_items) as gold_items_count,
       (SELECT COUNT(*) FROM gold_partners) as partners_count,
       (SELECT COUNT(*) FROM gold_prices) as prices_count;
