-- =====================================================
-- XChange Egypt - Luxury Marketplace Complete Setup
-- سوق السلع الفاخرة - إعداد كامل
-- Run in Supabase SQL Editor
-- =====================================================

-- ============================================
-- 1. Create Luxury-Specific Enums
-- ============================================

DO $$
BEGIN
    -- Luxury Item Status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LuxuryItemStatus') THEN
        CREATE TYPE "LuxuryItemStatus" AS ENUM (
            'PENDING_VERIFICATION',
            'UNDER_REVIEW',
            'VERIFIED_AUTHENTIC',
            'VERIFIED_WITH_ISSUES',
            'REJECTED_FAKE',
            'LISTED',
            'SOLD',
            'WITHDRAWN'
        );
    END IF;

    -- Luxury Category Type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'LuxuryCategoryType') THEN
        CREATE TYPE "LuxuryCategoryType" AS ENUM (
            'WATCHES',
            'JEWELRY',
            'HANDBAGS',
            'CARS',
            'ART',
            'ANTIQUES',
            'REAL_ESTATE',
            'PERFUMES',
            'PENS',
            'SUNGLASSES',
            'OTHER'
        );
    END IF;

    -- Watch Movement Type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'WatchMovementType') THEN
        CREATE TYPE "WatchMovementType" AS ENUM (
            'AUTOMATIC',
            'MANUAL',
            'QUARTZ',
            'SOLAR',
            'KINETIC',
            'SMARTWATCH'
        );
    END IF;

    -- Jewelry Metal Type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'JewelryMetalType') THEN
        CREATE TYPE "JewelryMetalType" AS ENUM (
            'GOLD_24K',
            'GOLD_21K',
            'GOLD_18K',
            'GOLD_14K',
            'WHITE_GOLD',
            'ROSE_GOLD',
            'PLATINUM',
            'SILVER_925',
            'SILVER_999',
            'TITANIUM',
            'MIXED'
        );
    END IF;

    -- Gemstone Type
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'GemstoneType') THEN
        CREATE TYPE "GemstoneType" AS ENUM (
            'DIAMOND',
            'RUBY',
            'EMERALD',
            'SAPPHIRE',
            'PEARL',
            'OPAL',
            'AMETHYST',
            'TOPAZ',
            'AQUAMARINE',
            'TURQUOISE',
            'NONE',
            'OTHER'
        );
    END IF;

    -- Verification Status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'VerificationStatus') THEN
        CREATE TYPE "VerificationStatus" AS ENUM (
            'PENDING',
            'IN_PROGRESS',
            'VERIFIED',
            'FAILED',
            'REQUIRES_PHYSICAL'
        );
    END IF;

    -- Bid Status
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'BidStatus') THEN
        CREATE TYPE "BidStatus" AS ENUM (
            'ACTIVE',
            'OUTBID',
            'WINNING',
            'WON',
            'LOST',
            'CANCELLED',
            'EXPIRED'
        );
    END IF;

EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- ============================================
-- 2. Create Luxury Items Table
-- ============================================

CREATE TABLE IF NOT EXISTS "luxury_items" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "item_id" TEXT REFERENCES "items"("id") ON DELETE CASCADE,
    "seller_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

    -- Basic Info
    "title_ar" TEXT NOT NULL,
    "title_en" TEXT,
    "description_ar" TEXT,
    "description_en" TEXT,
    "category_type" "LuxuryCategoryType" NOT NULL DEFAULT 'OTHER',
    "brand" TEXT NOT NULL,
    "model" TEXT,
    "reference_number" TEXT,
    "serial_number" TEXT,
    "year_of_manufacture" INTEGER,

    -- Pricing
    "asking_price" DECIMAL(15,2) NOT NULL,
    "min_offer_price" DECIMAL(15,2),
    "reserve_price" DECIMAL(15,2),
    "currency" TEXT DEFAULT 'EGP',
    "is_negotiable" BOOLEAN DEFAULT true,
    "accepts_offers" BOOLEAN DEFAULT true,
    "accepts_bids" BOOLEAN DEFAULT false,

    -- Auction Settings
    "auction_start" TIMESTAMP(3),
    "auction_end" TIMESTAMP(3),
    "starting_bid" DECIMAL(15,2),
    "current_bid" DECIMAL(15,2),
    "bid_increment" DECIMAL(15,2) DEFAULT 1000,
    "total_bids" INTEGER DEFAULT 0,

    -- Condition & Authenticity
    "condition_grade" TEXT, -- A+, A, B+, B, C
    "condition_notes_ar" TEXT,
    "condition_notes_en" TEXT,
    "has_original_box" BOOLEAN DEFAULT false,
    "has_papers" BOOLEAN DEFAULT false,
    "has_warranty" BOOLEAN DEFAULT false,
    "warranty_expires" DATE,
    "has_receipt" BOOLEAN DEFAULT false,
    "has_certificate" BOOLEAN DEFAULT false,

    -- Verification
    "status" "LuxuryItemStatus" NOT NULL DEFAULT 'PENDING_VERIFICATION',
    "verification_status" "VerificationStatus" DEFAULT 'PENDING',
    "verified_at" TIMESTAMP(3),
    "verified_by_id" TEXT REFERENCES "users"("id"),
    "verification_notes" TEXT,
    "certificate_url" TEXT,
    "entrupy_verified" BOOLEAN DEFAULT false,
    "entrupy_certificate_id" TEXT,

    -- Media
    "images" TEXT[],
    "videos" TEXT[],
    "documents" TEXT[],

    -- Location
    "governorate" TEXT,
    "city" TEXT,
    "can_ship" BOOLEAN DEFAULT true,
    "shipping_notes" TEXT,

    -- Stats
    "views" INTEGER DEFAULT 0,
    "favorites" INTEGER DEFAULT 0,
    "inquiries" INTEGER DEFAULT 0,

    -- Timestamps
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "listed_at" TIMESTAMP(3),
    "sold_at" TIMESTAMP(3)
);

-- Indexes
CREATE INDEX IF NOT EXISTS "luxury_items_seller_id_idx" ON "luxury_items"("seller_id");
CREATE INDEX IF NOT EXISTS "luxury_items_category_type_idx" ON "luxury_items"("category_type");
CREATE INDEX IF NOT EXISTS "luxury_items_brand_idx" ON "luxury_items"("brand");
CREATE INDEX IF NOT EXISTS "luxury_items_status_idx" ON "luxury_items"("status");
CREATE INDEX IF NOT EXISTS "luxury_items_asking_price_idx" ON "luxury_items"("asking_price");
CREATE INDEX IF NOT EXISTS "luxury_items_governorate_idx" ON "luxury_items"("governorate");

-- ============================================
-- 3. Create Watch-Specific Details Table
-- ============================================

CREATE TABLE IF NOT EXISTS "luxury_watch_details" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "luxury_item_id" TEXT NOT NULL UNIQUE REFERENCES "luxury_items"("id") ON DELETE CASCADE,

    -- Watch Specifications
    "movement_type" "WatchMovementType",
    "caliber" TEXT,
    "power_reserve_hours" INTEGER,
    "case_material" TEXT,
    "case_diameter_mm" DECIMAL(5,2),
    "case_thickness_mm" DECIMAL(5,2),
    "dial_color" TEXT,
    "crystal_type" TEXT, -- Sapphire, Mineral, etc.
    "water_resistance_meters" INTEGER,
    "strap_material" TEXT,
    "strap_color" TEXT,
    "clasp_type" TEXT,
    "complications" TEXT[], -- Chronograph, Date, Moon Phase, etc.

    -- Service History
    "last_service_date" DATE,
    "service_history" JSONB,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 4. Create Jewelry-Specific Details Table
-- ============================================

CREATE TABLE IF NOT EXISTS "luxury_jewelry_details" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "luxury_item_id" TEXT NOT NULL UNIQUE REFERENCES "luxury_items"("id") ON DELETE CASCADE,

    -- Metal Details
    "metal_type" "JewelryMetalType",
    "metal_weight_grams" DECIMAL(10,2),
    "metal_purity" TEXT,

    -- Gemstone Details
    "primary_gemstone" "GemstoneType",
    "gemstone_carat" DECIMAL(5,2),
    "gemstone_color" TEXT,
    "gemstone_clarity" TEXT,
    "gemstone_cut" TEXT,
    "gemstone_count" INTEGER DEFAULT 1,
    "secondary_gemstones" JSONB,

    -- Certifications
    "gia_certified" BOOLEAN DEFAULT false,
    "gia_certificate_number" TEXT,
    "other_certifications" TEXT[],

    -- Dimensions
    "ring_size" TEXT,
    "necklace_length_cm" DECIMAL(5,2),
    "bracelet_length_cm" DECIMAL(5,2),

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 5. Create Handbag-Specific Details Table
-- ============================================

CREATE TABLE IF NOT EXISTS "luxury_handbag_details" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "luxury_item_id" TEXT NOT NULL UNIQUE REFERENCES "luxury_items"("id") ON DELETE CASCADE,

    -- Bag Specifications
    "material" TEXT, -- Leather, Canvas, etc.
    "leather_type" TEXT, -- Togo, Epsom, Box, etc.
    "color" TEXT,
    "hardware_color" TEXT, -- Gold, Silver, Palladium
    "size" TEXT, -- Mini, Small, Medium, Large
    "dimensions_cm" TEXT, -- L x H x W

    -- Specific Models
    "model_line" TEXT, -- Birkin, Kelly, Speedy, etc.
    "collection_year" TEXT,
    "limited_edition" BOOLEAN DEFAULT false,
    "edition_number" TEXT,

    -- Condition Details
    "corners_condition" TEXT,
    "handles_condition" TEXT,
    "hardware_condition" TEXT,
    "interior_condition" TEXT,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 6. Create Luxury Bids Table
-- ============================================

CREATE TABLE IF NOT EXISTS "luxury_bids" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "luxury_item_id" TEXT NOT NULL REFERENCES "luxury_items"("id") ON DELETE CASCADE,
    "bidder_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

    "amount" DECIMAL(15,2) NOT NULL,
    "max_auto_bid" DECIMAL(15,2), -- For proxy bidding
    "status" "BidStatus" NOT NULL DEFAULT 'ACTIVE',

    "ip_address" TEXT,
    "user_agent" TEXT,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "luxury_bids_item_id_idx" ON "luxury_bids"("luxury_item_id");
CREATE INDEX IF NOT EXISTS "luxury_bids_bidder_id_idx" ON "luxury_bids"("bidder_id");
CREATE INDEX IF NOT EXISTS "luxury_bids_status_idx" ON "luxury_bids"("status");
CREATE INDEX IF NOT EXISTS "luxury_bids_amount_idx" ON "luxury_bids"("amount" DESC);

-- ============================================
-- 7. Create Luxury Offers Table
-- ============================================

CREATE TABLE IF NOT EXISTS "luxury_offers" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "luxury_item_id" TEXT NOT NULL REFERENCES "luxury_items"("id") ON DELETE CASCADE,
    "buyer_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,

    "amount" DECIMAL(15,2) NOT NULL,
    "message" TEXT,
    "status" TEXT DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED, COUNTER, EXPIRED

    "counter_amount" DECIMAL(15,2),
    "counter_message" TEXT,

    "expires_at" TIMESTAMP(3),
    "responded_at" TIMESTAMP(3),

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "luxury_offers_item_id_idx" ON "luxury_offers"("luxury_item_id");
CREATE INDEX IF NOT EXISTS "luxury_offers_buyer_id_idx" ON "luxury_offers"("buyer_id");
CREATE INDEX IF NOT EXISTS "luxury_offers_status_idx" ON "luxury_offers"("status");

-- ============================================
-- 8. Create Luxury Expert Verifiers Table
-- ============================================

CREATE TABLE IF NOT EXISTS "luxury_experts" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "user_id" TEXT NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,

    "name_ar" TEXT NOT NULL,
    "name_en" TEXT,
    "title_ar" TEXT,
    "title_en" TEXT,
    "bio_ar" TEXT,
    "bio_en" TEXT,
    "avatar" TEXT,

    -- Expertise
    "specializations" "LuxuryCategoryType"[],
    "certified_brands" TEXT[],
    "years_experience" INTEGER DEFAULT 0,

    -- Certifications
    "certifications" JSONB,
    "entrupy_certified" BOOLEAN DEFAULT false,

    -- Stats
    "total_verifications" INTEGER DEFAULT 0,
    "accuracy_rate" DECIMAL(5,2) DEFAULT 100,
    "avg_rating" DECIMAL(3,2) DEFAULT 5.0,
    "total_reviews" INTEGER DEFAULT 0,

    -- Status
    "is_active" BOOLEAN DEFAULT true,
    "is_verified" BOOLEAN DEFAULT true,

    -- Contact
    "phone" TEXT,
    "email" TEXT,
    "governorate" TEXT,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- 9. Create Luxury Verification Requests Table
-- ============================================

CREATE TABLE IF NOT EXISTS "luxury_verification_requests" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "luxury_item_id" TEXT NOT NULL REFERENCES "luxury_items"("id") ON DELETE CASCADE,
    "expert_id" TEXT REFERENCES "luxury_experts"("id"),
    "requester_id" TEXT NOT NULL REFERENCES "users"("id"),

    "verification_type" TEXT DEFAULT 'STANDARD', -- STANDARD, PREMIUM, ENTRUPY
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',

    "notes" TEXT,
    "result_notes" TEXT,
    "authenticity_score" INTEGER, -- 0-100
    "condition_score" INTEGER, -- 0-100

    "verification_fee" DECIMAL(10,2),
    "fee_paid" BOOLEAN DEFAULT false,

    "documents_submitted" TEXT[],
    "verification_report_url" TEXT,

    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "assigned_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3)
);

-- ============================================
-- 10. Create Luxury Favorites Table
-- ============================================

CREATE TABLE IF NOT EXISTS "luxury_favorites" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "user_id" TEXT NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "luxury_item_id" TEXT NOT NULL REFERENCES "luxury_items"("id") ON DELETE CASCADE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("user_id", "luxury_item_id")
);

-- ============================================
-- 11. Create Luxury Brand Market Prices Table
-- ============================================

CREATE TABLE IF NOT EXISTS "luxury_brand_prices" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::TEXT,
    "brand" TEXT NOT NULL,
    "model" TEXT,
    "category_type" "LuxuryCategoryType" NOT NULL,

    "retail_price_usd" DECIMAL(15,2),
    "market_price_usd" DECIMAL(15,2),
    "avg_resale_price_egp" DECIMAL(15,2),
    "price_trend" TEXT, -- UP, DOWN, STABLE
    "trend_percentage" DECIMAL(5,2),

    "last_sale_price" DECIMAL(15,2),
    "last_sale_date" DATE,
    "total_sales" INTEGER DEFAULT 0,

    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS "luxury_brand_prices_unique" ON "luxury_brand_prices"("brand", "model", "category_type");

-- ============================================
-- 12. Seed Luxury Expert Verifiers
-- ============================================

INSERT INTO "luxury_experts" (
    "id", "user_id", "name_ar", "name_en", "title_ar", "title_en",
    "bio_ar", "specializations", "certified_brands", "years_experience",
    "entrupy_certified", "total_verifications", "accuracy_rate", "governorate"
) VALUES
    -- Note: These use placeholder user IDs - should be linked to actual users
    (gen_random_uuid()::TEXT, gen_random_uuid()::TEXT,
     'أحمد محمود خبير الساعات', 'Ahmed Mahmoud - Watch Expert',
     'خبير ساعات معتمد', 'Certified Watch Expert',
     'خبير معتمد في الساعات الفاخرة مع خبرة 15 عاماً. متخصص في رولكس وأوميغا وباتيك فيليب.',
     ARRAY['WATCHES']::"LuxuryCategoryType"[],
     ARRAY['Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'Cartier'],
     15, true, 2500, 99.8, 'Cairo'),

    (gen_random_uuid()::TEXT, gen_random_uuid()::TEXT,
     'سارة أحمد - خبيرة المجوهرات', 'Sara Ahmed - Jewelry Expert',
     'خبيرة مجوهرات وأحجار كريمة', 'Jewelry & Gemstone Expert',
     'خبيرة معتمدة من GIA في تقييم الألماس والأحجار الكريمة. 12 عاماً من الخبرة.',
     ARRAY['JEWELRY']::"LuxuryCategoryType"[],
     ARRAY['Cartier', 'Van Cleef & Arpels', 'Bulgari', 'Tiffany', 'Harry Winston'],
     12, false, 1800, 99.5, 'Cairo'),

    (gen_random_uuid()::TEXT, gen_random_uuid()::TEXT,
     'محمد علي - خبير الحقائب الفاخرة', 'Mohamed Ali - Luxury Bags Expert',
     'خبير حقائب فاخرة معتمد من Entrupy', 'Entrupy Certified Bags Expert',
     'متخصص في توثيق حقائب هيرميس وشانيل ولويس فيتون. 10 سنوات خبرة.',
     ARRAY['HANDBAGS']::"LuxuryCategoryType"[],
     ARRAY['Hermès', 'Chanel', 'Louis Vuitton', 'Dior', 'Gucci', 'Prada'],
     10, true, 3200, 99.9, 'Alexandria'),

    (gen_random_uuid()::TEXT, gen_random_uuid()::TEXT,
     'خالد حسن - خبير التحف والفنون', 'Khaled Hassan - Art & Antiques Expert',
     'خبير تحف وفنون', 'Art & Antiques Expert',
     'خبير في تقييم اللوحات الفنية والتحف الأثرية. حاصل على شهادة من كريستيز.',
     ARRAY['ART', 'ANTIQUES']::"LuxuryCategoryType"[],
     ARRAY[]::TEXT[],
     20, false, 800, 98.5, 'Cairo')
ON CONFLICT DO NOTHING;

-- ============================================
-- 13. Seed Luxury Brand Market Prices
-- ============================================

-- Watch Prices
INSERT INTO "luxury_brand_prices" ("brand", "model", "category_type", "retail_price_usd", "market_price_usd", "avg_resale_price_egp", "price_trend", "trend_percentage") VALUES
    ('Rolex', 'Submariner Date', 'WATCHES', 10250, 15000, 750000, 'UP', 5.2),
    ('Rolex', 'Daytona', 'WATCHES', 15500, 35000, 1750000, 'UP', 8.5),
    ('Rolex', 'GMT-Master II', 'WATCHES', 11350, 18000, 900000, 'UP', 3.8),
    ('Rolex', 'Datejust 41', 'WATCHES', 8950, 12000, 600000, 'STABLE', 0.5),
    ('Rolex', 'Day-Date 40', 'WATCHES', 39650, 45000, 2250000, 'UP', 2.1),
    ('Omega', 'Speedmaster Moonwatch', 'WATCHES', 6550, 7500, 375000, 'STABLE', 1.2),
    ('Omega', 'Seamaster 300M', 'WATCHES', 5700, 6000, 300000, 'DOWN', -2.0),
    ('Patek Philippe', 'Nautilus 5711', 'WATCHES', 35000, 150000, 7500000, 'UP', 15.0),
    ('Patek Philippe', 'Aquanaut', 'WATCHES', 24000, 55000, 2750000, 'UP', 7.3),
    ('Audemars Piguet', 'Royal Oak 41mm', 'WATCHES', 28500, 65000, 3250000, 'UP', 6.8),
    ('Richard Mille', 'RM 011', 'WATCHES', 180000, 250000, 12500000, 'STABLE', 1.0),
    ('Cartier', 'Santos Medium', 'WATCHES', 7550, 8500, 425000, 'UP', 2.5),
    ('TAG Heuer', 'Carrera', 'WATCHES', 5500, 4500, 225000, 'DOWN', -5.0)
ON CONFLICT DO NOTHING;

-- Handbag Prices
INSERT INTO "luxury_brand_prices" ("brand", "model", "category_type", "retail_price_usd", "market_price_usd", "avg_resale_price_egp", "price_trend", "trend_percentage") VALUES
    ('Hermès', 'Birkin 25', 'HANDBAGS', 10400, 20000, 1000000, 'UP', 12.0),
    ('Hermès', 'Birkin 30', 'HANDBAGS', 11400, 22000, 1100000, 'UP', 10.5),
    ('Hermès', 'Birkin 35', 'HANDBAGS', 12100, 18000, 900000, 'UP', 8.0),
    ('Hermès', 'Kelly 25', 'HANDBAGS', 10000, 25000, 1250000, 'UP', 15.0),
    ('Hermès', 'Kelly 28', 'HANDBAGS', 10600, 22000, 1100000, 'UP', 11.0),
    ('Chanel', 'Classic Flap Medium', 'HANDBAGS', 10200, 12000, 600000, 'UP', 5.0),
    ('Chanel', 'Classic Flap Jumbo', 'HANDBAGS', 11500, 13000, 650000, 'STABLE', 2.0),
    ('Chanel', 'Boy Bag', 'HANDBAGS', 6000, 5500, 275000, 'DOWN', -3.0),
    ('Louis Vuitton', 'Neverfull MM', 'HANDBAGS', 2030, 2200, 110000, 'STABLE', 1.5),
    ('Louis Vuitton', 'Speedy 30', 'HANDBAGS', 1640, 1500, 75000, 'DOWN', -5.0),
    ('Dior', 'Lady Dior Medium', 'HANDBAGS', 6500, 7000, 350000, 'UP', 3.0),
    ('Gucci', 'GG Marmont', 'HANDBAGS', 2980, 2500, 125000, 'DOWN', -8.0),
    ('Prada', 'Galleria', 'HANDBAGS', 3400, 3000, 150000, 'DOWN', -4.0)
ON CONFLICT DO NOTHING;

-- Jewelry Prices (per carat / piece)
INSERT INTO "luxury_brand_prices" ("brand", "model", "category_type", "retail_price_usd", "market_price_usd", "avg_resale_price_egp", "price_trend", "trend_percentage") VALUES
    ('Cartier', 'Love Bracelet', 'JEWELRY', 7550, 8500, 425000, 'UP', 3.0),
    ('Cartier', 'Juste un Clou', 'JEWELRY', 8200, 9000, 450000, 'UP', 4.0),
    ('Cartier', 'Trinity Ring', 'JEWELRY', 1380, 1500, 75000, 'STABLE', 1.0),
    ('Van Cleef & Arpels', 'Alhambra Necklace', 'JEWELRY', 4450, 5000, 250000, 'UP', 6.0),
    ('Van Cleef & Arpels', 'Alhambra Bracelet', 'JEWELRY', 5200, 5800, 290000, 'UP', 5.5),
    ('Bulgari', 'Serpenti Bracelet', 'JEWELRY', 9500, 10000, 500000, 'STABLE', 2.0),
    ('Tiffany', 'T Wire Bracelet', 'JEWELRY', 1350, 1200, 60000, 'DOWN', -5.0),
    ('Tiffany', 'Return to Tiffany', 'JEWELRY', 500, 450, 22500, 'DOWN', -3.0),
    ('Gold 21K', 'Per Gram', 'JEWELRY', NULL, 62, 3100, 'UP', 8.0),
    ('Gold 18K', 'Per Gram', 'JEWELRY', NULL, 53, 2650, 'UP', 7.5),
    ('Diamond', 'Per Carat (VVS1)', 'JEWELRY', NULL, 12000, 600000, 'STABLE', 1.0)
ON CONFLICT DO NOTHING;

-- ============================================
-- 14. Seed Sample Luxury Items (Demo Data)
-- ============================================

-- Note: These will need valid seller_id from your users table
-- This is a template - actual insert would need real user IDs

-- Example of how to insert luxury items:
/*
INSERT INTO "luxury_items" (
    "seller_id", "title_ar", "title_en", "category_type", "brand", "model",
    "reference_number", "year_of_manufacture", "asking_price", "condition_grade",
    "has_original_box", "has_papers", "status", "governorate", "images"
) VALUES (
    'actual-user-id-here',
    'ساعة رولكس سبمارينر تاريخ أصلية',
    'Rolex Submariner Date - Authentic',
    'WATCHES',
    'Rolex',
    'Submariner Date',
    '126610LN',
    2023,
    850000,
    'A+',
    true,
    true,
    'LISTED',
    'Cairo',
    ARRAY['https://example.com/watch1.jpg', 'https://example.com/watch2.jpg']
);
*/

-- ============================================
-- 15. Create Helpful Views
-- ============================================

-- View: Active Luxury Listings
CREATE OR REPLACE VIEW "v_active_luxury_listings" AS
SELECT
    li.*,
    lwd.movement_type,
    lwd.case_diameter_mm,
    ljd.metal_type,
    ljd.primary_gemstone,
    lhd.material as bag_material,
    lhd.model_line as bag_model_line,
    u.full_name as seller_name,
    u.avatar as seller_avatar
FROM luxury_items li
LEFT JOIN luxury_watch_details lwd ON li.id = lwd.luxury_item_id
LEFT JOIN luxury_jewelry_details ljd ON li.id = ljd.luxury_item_id
LEFT JOIN luxury_handbag_details lhd ON li.id = lhd.luxury_item_id
LEFT JOIN users u ON li.seller_id = u.id
WHERE li.status = 'LISTED';

-- View: Luxury Market Stats
CREATE OR REPLACE VIEW "v_luxury_market_stats" AS
SELECT
    category_type,
    COUNT(*) as total_items,
    COUNT(*) FILTER (WHERE status = 'LISTED') as active_listings,
    COUNT(*) FILTER (WHERE status = 'SOLD') as sold_items,
    AVG(asking_price) as avg_price,
    MIN(asking_price) as min_price,
    MAX(asking_price) as max_price,
    SUM(views) as total_views
FROM luxury_items
GROUP BY category_type;

-- ============================================
-- Success Message
-- ============================================

SELECT
    'Luxury marketplace tables created successfully!' as status,
    (SELECT COUNT(*) FROM luxury_experts) as experts_count,
    (SELECT COUNT(*) FROM luxury_brand_prices) as brand_prices_count;
