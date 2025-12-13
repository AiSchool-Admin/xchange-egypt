-- =====================================================
-- Scrap Marketplace - Complete Setup for Supabase
-- سوق الخردة - إعداد كامل لـ Supabase
-- =====================================================

-- =====================================================
-- STEP 1: Create Enums (if not exist)
-- =====================================================

DO $$ BEGIN
    CREATE TYPE "ScrapType" AS ENUM (
        'ELECTRONICS', 'HOME_APPLIANCES', 'COMPUTERS', 'PHONES',
        'CABLES_WIRES', 'MOTORS', 'BATTERIES', 'METAL_SCRAP',
        'CAR_PARTS', 'FURNITURE_PARTS', 'WOOD', 'PLASTIC',
        'TEXTILES', 'PAPER', 'GLASS', 'CONSTRUCTION',
        'INDUSTRIAL', 'MEDICAL', 'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "MetalType" AS ENUM (
        'COPPER', 'ALUMINUM', 'IRON', 'STEEL', 'BRASS',
        'BRONZE', 'LEAD', 'ZINC', 'NICKEL', 'TIN',
        'GOLD', 'SILVER', 'STAINLESS_STEEL', 'MIXED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ScrapCondition" AS ENUM (
        'TOTALLY_DAMAGED', 'NOT_WORKING', 'PARTIALLY_WORKING',
        'NEEDS_REPAIR', 'WORKING_WITH_ISSUES'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ScrapPricingType" AS ENUM (
        'PER_PIECE', 'PER_KG', 'PER_UNIT', 'NEGOTIABLE', 'REVERSE_AUCTION'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ScrapDealerType" AS ENUM (
        'INDIVIDUAL_COLLECTOR', 'SCRAP_DEALER', 'RECYCLING_COMPANY',
        'REPAIR_TECHNICIAN', 'FACTORY', 'EXPORT_COMPANY'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "CollectionRequestStatus" AS ENUM (
        'PENDING', 'ACCEPTED', 'SCHEDULED', 'IN_TRANSIT',
        'ARRIVED', 'WEIGHING', 'COMPLETED', 'CANCELLED', 'DISPUTED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- STEP 2: Create Tables
-- =====================================================

-- Scrap Material Prices Table
CREATE TABLE IF NOT EXISTS scrap_material_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    material_category TEXT NOT NULL,
    material_type TEXT NOT NULL,
    material_name_ar TEXT NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EGP',
    price_change DECIMAL(10,2),
    price_change_type TEXT DEFAULT 'stable',
    source TEXT,
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scrap_material_prices_category ON scrap_material_prices(material_category);
CREATE INDEX IF NOT EXISTS idx_scrap_material_prices_type ON scrap_material_prices(material_type);

-- Metal Prices Table (Legacy)
CREATE TABLE IF NOT EXISTS metal_prices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    metal_type TEXT NOT NULL,
    price_per_kg DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'EGP',
    source TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Scrap Dealers Table
CREATE TABLE IF NOT EXISTS scrap_dealers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    dealer_type TEXT NOT NULL,
    business_name TEXT,
    commercial_reg_no TEXT,
    tax_card_no TEXT,
    recycling_license_no TEXT,
    address TEXT,
    governorate TEXT,
    city TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    specializations TEXT[],
    accepted_metals TEXT[],
    min_weight_kg DECIMAL(10,2),
    max_weight_kg DECIMAL(10,2),
    offers_pickup BOOLEAN DEFAULT false,
    pickup_fee DECIMAL(10,2) DEFAULT 0,
    pickup_radius_km INTEGER,
    price_list JSONB,
    rating DECIMAL(3,2) DEFAULT 0,
    total_deals INTEGER DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_transactions INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scrap_dealers_user ON scrap_dealers(user_id);
CREATE INDEX IF NOT EXISTS idx_scrap_dealers_governorate ON scrap_dealers(governorate);
CREATE INDEX IF NOT EXISTS idx_scrap_dealers_verified ON scrap_dealers(is_verified);

-- Scrap Purchase Requests Table (B2B)
CREATE TABLE IF NOT EXISTS scrap_purchase_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    buyer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    scrap_type TEXT NOT NULL,
    metal_type TEXT,
    scrap_condition TEXT,
    min_weight_kg DECIMAL(10,2),
    max_weight_kg DECIMAL(10,2),
    offered_price_per_kg DECIMAL(10,2),
    offered_total_price DECIMAL(10,2),
    is_negotiable BOOLEAN DEFAULT true,
    governorate TEXT,
    city TEXT,
    offers_pickup BOOLEAN DEFAULT false,
    pickup_address TEXT,
    status TEXT DEFAULT 'ACTIVE',
    views_count INTEGER DEFAULT 0,
    offers_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_requests_buyer ON scrap_purchase_requests(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_status ON scrap_purchase_requests(status);
CREATE INDEX IF NOT EXISTS idx_purchase_requests_scrap_type ON scrap_purchase_requests(scrap_type);

-- Scrap Seller Offers Table
CREATE TABLE IF NOT EXISTS scrap_seller_offers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id UUID REFERENCES scrap_purchase_requests(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    item_id UUID,
    offered_weight_kg DECIMAL(10,2),
    offered_price_per_kg DECIMAL(10,2),
    offered_total_price DECIMAL(10,2),
    message TEXT,
    photos TEXT[],
    status TEXT DEFAULT 'PENDING',
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_seller_offers_request ON scrap_seller_offers(request_id);
CREATE INDEX IF NOT EXISTS idx_seller_offers_seller ON scrap_seller_offers(seller_id);

-- Collection Requests Table (C2B)
CREATE TABLE IF NOT EXISTS collection_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    collector_id UUID REFERENCES auth.users(id),
    materials JSONB NOT NULL,
    address TEXT NOT NULL,
    governorate TEXT NOT NULL,
    city TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    preferred_date DATE,
    preferred_time_slot TEXT,
    notes TEXT,
    photos TEXT[],
    status TEXT DEFAULT 'PENDING',
    estimated_total_value DECIMAL(10,2),
    actual_total_value DECIMAL(10,2),
    scheduled_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collection_requests_user ON collection_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_collection_requests_status ON collection_requests(status);
CREATE INDEX IF NOT EXISTS idx_collection_requests_governorate ON collection_requests(governorate);

-- ESG Certificates Table
CREATE TABLE IF NOT EXISTS esg_certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    certificate_number TEXT UNIQUE NOT NULL,
    total_weight_kg DECIMAL(10,2) DEFAULT 0,
    co2_saved_kg DECIMAL(10,2) DEFAULT 0,
    trees_equivalent DECIMAL(10,2) DEFAULT 0,
    water_saved_liters DECIMAL(10,2) DEFAULT 0,
    energy_saved_kwh DECIMAL(10,2) DEFAULT 0,
    materials_breakdown JSONB,
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_esg_certificates_user ON esg_certificates(user_id);

-- =====================================================
-- STEP 3: Insert Seed Data - Material Prices
-- =====================================================

-- Clear existing prices
DELETE FROM scrap_material_prices WHERE 1=1;

-- Metals - المعادن
INSERT INTO scrap_material_prices (material_category, material_type, material_name_ar, price_per_kg, price_change, price_change_type, source)
VALUES
  ('metal', 'copper_red', 'نحاس أحمر خام', 588.00, 5.00, 'up', 'Egyptian Scrap Market'),
  ('metal', 'copper_yellow', 'نحاس أصفر (براص)', 410.00, 3.00, 'up', 'Egyptian Scrap Market'),
  ('metal', 'copper_burnt', 'نحاس محروق', 520.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('metal', 'copper_wire', 'سلك نحاس', 550.00, 2.00, 'up', 'Egyptian Scrap Market'),
  ('metal', 'aluminum_soft', 'ألمونيوم طري', 199.00, -2.00, 'down', 'Egyptian Scrap Market'),
  ('metal', 'aluminum_hard', 'ألمونيوم كاست (صلب)', 135.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('metal', 'aluminum_cans', 'علب ألمونيوم (كانز)', 95.00, 1.00, 'up', 'Egyptian Scrap Market'),
  ('metal', 'aluminum_profiles', 'ألمونيوم بروفيل', 170.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('metal', 'iron', 'حديد خردة', 14.50, -0.50, 'down', 'Egyptian Scrap Market'),
  ('metal', 'stainless_steel', 'استانلس ستيل', 55.00, 2.00, 'up', 'Egyptian Scrap Market'),
  ('metal', 'steel_bars', 'حديد تسليح', 16.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('metal', 'lead', 'رصاص', 85.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('metal', 'zinc', 'زنك', 95.00, 1.00, 'up', 'Egyptian Scrap Market'),
  ('metal', 'brass', 'نحاس أصفر (براص)', 350.00, 5.00, 'up', 'Egyptian Scrap Market'),
  ('metal', 'bronze', 'برونز', 280.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('metal', 'tin', 'قصدير', 120.00, NULL, 'stable', 'Egyptian Scrap Market');

-- Paper - الورق والكرتون
INSERT INTO scrap_material_prices (material_category, material_type, material_name_ar, price_per_kg, price_change, price_change_type, source)
VALUES
  ('paper', 'cardboard', 'كرتون', 10.00, 0.50, 'up', 'Egyptian Scrap Market'),
  ('paper', 'white_paper', 'ورق أبيض', 12.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('paper', 'newspaper', 'جرائد', 8.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('paper', 'mixed_paper', 'ورق مخلوط', 6.00, -0.50, 'down', 'Egyptian Scrap Market'),
  ('paper', 'books', 'كتب ومجلات', 5.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('paper', 'cardboard_boxes', 'كراتين تعبئة', 9.00, NULL, 'stable', 'Egyptian Scrap Market');

-- Plastics - البلاستيك
INSERT INTO scrap_material_prices (material_category, material_type, material_name_ar, price_per_kg, price_change, price_change_type, source)
VALUES
  ('plastic', 'pet', 'بلاستيك PET (زجاجات مياه)', 38.00, 2.00, 'up', 'Egyptian Scrap Market'),
  ('plastic', 'hdpe', 'بلاستيك HDPE (جراكن)', 28.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('plastic', 'pvc', 'بلاستيك PVC (مواسير)', 18.00, -1.00, 'down', 'Egyptian Scrap Market'),
  ('plastic', 'ldpe', 'بلاستيك LDPE (أكياس)', 20.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('plastic', 'pp', 'بلاستيك PP', 25.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('plastic', 'ps', 'بلاستيك PS (ستايروفوم)', 15.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('plastic', 'mixed_plastic', 'بلاستيك مخلوط', 12.00, NULL, 'stable', 'Egyptian Scrap Market');

-- Electronics - الإلكترونيات
INSERT INTO scrap_material_prices (material_category, material_type, material_name_ar, price_per_kg, price_change, price_change_type, source)
VALUES
  ('electronics', 'computer_parts', 'قطع كمبيوتر', 45.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('electronics', 'mobile_phones', 'هواتف محمولة (للتفكيك)', 80.00, 5.00, 'up', 'Egyptian Scrap Market'),
  ('electronics', 'cables', 'كابلات وأسلاك', 65.00, 3.00, 'up', 'Egyptian Scrap Market'),
  ('electronics', 'circuit_boards', 'لوحات إلكترونية', 150.00, 10.00, 'up', 'Egyptian Scrap Market'),
  ('electronics', 'batteries', 'بطاريات (للتدوير)', 25.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('electronics', 'hard_drives', 'هارد ديسك', 35.00, NULL, 'stable', 'Egyptian Scrap Market');

-- Home Appliances - الأجهزة المنزلية
INSERT INTO scrap_material_prices (material_category, material_type, material_name_ar, price_per_kg, price_change, price_change_type, source)
VALUES
  ('appliances', 'washing_machine', 'غسالات (للتفكيك)', 18.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('appliances', 'refrigerator', 'ثلاجات (للتفكيك)', 16.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('appliances', 'air_conditioner', 'تكييفات (للتفكيك)', 22.00, 1.00, 'up', 'Egyptian Scrap Market'),
  ('appliances', 'small_appliances', 'أجهزة صغيرة', 12.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('appliances', 'motors', 'موتورات كهربائية', 35.00, 2.00, 'up', 'Egyptian Scrap Market'),
  ('appliances', 'compressors', 'كمبروسر (ضواغط)', 28.00, NULL, 'stable', 'Egyptian Scrap Market');

-- Textiles - المنسوجات
INSERT INTO scrap_material_prices (material_category, material_type, material_name_ar, price_per_kg, price_change, price_change_type, source)
VALUES
  ('textiles', 'clothes', 'ملابس مستعملة', 15.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('textiles', 'fabric_scraps', 'قصاصات قماش', 8.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('textiles', 'carpets', 'سجاد مستعمل', 5.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('textiles', 'shoes', 'أحذية مستعملة', 12.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('textiles', 'leather', 'جلود', 25.00, NULL, 'stable', 'Egyptian Scrap Market');

-- Glass - الزجاج
INSERT INTO scrap_material_prices (material_category, material_type, material_name_ar, price_per_kg, price_change, price_change_type, source)
VALUES
  ('glass', 'clear_glass', 'زجاج شفاف', 1.50, NULL, 'stable', 'Egyptian Scrap Market'),
  ('glass', 'colored_glass', 'زجاج ملون', 1.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('glass', 'broken_glass', 'زجاج مكسور', 0.80, NULL, 'stable', 'Egyptian Scrap Market'),
  ('glass', 'bottles', 'زجاجات فارغة', 2.00, NULL, 'stable', 'Egyptian Scrap Market');

-- Wood - الخشب
INSERT INTO scrap_material_prices (material_category, material_type, material_name_ar, price_per_kg, price_change, price_change_type, source)
VALUES
  ('wood', 'furniture_wood', 'خشب أثاث', 3.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('wood', 'pallets', 'طبالي خشب', 4.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('wood', 'mdf', 'خشب MDF', 2.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('wood', 'plywood', 'أبلكاش', 2.50, NULL, 'stable', 'Egyptian Scrap Market');

-- Oils - الزيوت
INSERT INTO scrap_material_prices (material_category, material_type, material_name_ar, price_per_kg, price_change, price_change_type, source)
VALUES
  ('oil', 'cooking_oil', 'زيت طعام مستعمل', 8.00, NULL, 'stable', 'Egyptian Scrap Market'),
  ('oil', 'motor_oil', 'زيت موتور مستعمل', 5.00, NULL, 'stable', 'Egyptian Scrap Market');

-- =====================================================
-- STEP 4: Insert Metal Prices (Legacy)
-- =====================================================

DELETE FROM metal_prices WHERE 1=1;

INSERT INTO metal_prices (metal_type, price_per_kg, source)
VALUES
  ('COPPER', 588.00, 'Egyptian Metal Market'),
  ('ALUMINUM', 199.00, 'Egyptian Metal Market'),
  ('IRON', 14.50, 'Egyptian Metal Market'),
  ('STEEL', 16.00, 'Egyptian Metal Market'),
  ('BRASS', 350.00, 'Egyptian Metal Market'),
  ('BRONZE', 280.00, 'Egyptian Metal Market'),
  ('LEAD', 85.00, 'Egyptian Metal Market'),
  ('ZINC', 95.00, 'Egyptian Metal Market'),
  ('STAINLESS_STEEL', 55.00, 'Egyptian Metal Market');

-- =====================================================
-- Done!
-- =====================================================

SELECT 'Scrap marketplace setup completed successfully!' as status,
       (SELECT COUNT(*) FROM scrap_material_prices) as prices_count;
