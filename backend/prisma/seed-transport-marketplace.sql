-- =====================================================
-- Transport Marketplace - Complete Setup for Supabase
-- =====================================================
-- سوق النقل الذكي - إعداد كامل
-- الخطوة 1: إنشاء الجداول
-- الخطوة 2: إضافة البيانات التجريبية
-- للتشغيل: انسخ والصق في Supabase SQL Editor
-- =====================================================

-- =====================================================
-- STEP 1: CREATE ENUMS - إنشاء الأنواع
-- =====================================================

DO $$ BEGIN
    CREATE TYPE "ServiceProviderType" AS ENUM ('INDIVIDUAL', 'SMALL_BUSINESS', 'COMPANY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TransportServiceType" AS ENUM ('SHIPPING', 'INTERCITY_RIDE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ServiceRequestStatus" AS ENUM ('OPEN', 'QUOTED', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ServiceQuoteStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'EXPIRED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "VehicleType" AS ENUM ('MOTORCYCLE', 'SEDAN', 'SUV', 'MINIVAN', 'VAN', 'PICKUP', 'TRUCK_SMALL', 'TRUCK_MEDIUM', 'TRUCK_LARGE', 'BUS_SMALL', 'BUS_LARGE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "ScheduleFlexibility" AS ENUM ('EXACT', 'FLEXIBLE_HOURS', 'FLEXIBLE_DAYS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TransportPaymentMethod" AS ENUM ('CASH', 'CARD', 'WALLET', 'COD');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- STEP 2: CREATE TABLES - إنشاء الجداول
-- =====================================================

-- Service Providers - مزودي الخدمات
CREATE TABLE IF NOT EXISTS service_providers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type "ServiceProviderType" NOT NULL,
    name TEXT NOT NULL,
    name_ar TEXT,
    phone TEXT NOT NULL,
    email TEXT,
    company_name TEXT,
    commercial_register TEXT,
    tax_number TEXT,
    coverage_areas TEXT[] DEFAULT '{}',
    service_types "TransportServiceType"[] DEFAULT '{}',
    rating DOUBLE PRECISION DEFAULT 0,
    total_ratings INTEGER DEFAULT 0,
    completed_orders INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_providers_user_id ON service_providers(user_id);
CREATE INDEX IF NOT EXISTS idx_service_providers_type ON service_providers(type);
CREATE INDEX IF NOT EXISTS idx_service_providers_is_active ON service_providers(is_active);

-- Provider Vehicles - مركبات المزودين
CREATE TABLE IF NOT EXISTS provider_vehicles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    provider_id TEXT NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    type "VehicleType" NOT NULL,
    make TEXT NOT NULL,
    model TEXT NOT NULL,
    year INTEGER NOT NULL,
    plate_number TEXT NOT NULL,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    photos TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_provider_vehicles_provider_id ON provider_vehicles(provider_id);

-- Service Requests - طلبات الخدمة
CREATE TABLE IF NOT EXISTS service_requests (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    service_type "TransportServiceType" NOT NULL,
    status "ServiceRequestStatus" DEFAULT 'OPEN',
    pickup_address TEXT NOT NULL,
    pickup_city TEXT NOT NULL,
    pickup_gov TEXT NOT NULL,
    pickup_lat DOUBLE PRECISION,
    pickup_lng DOUBLE PRECISION,
    dropoff_address TEXT NOT NULL,
    dropoff_city TEXT NOT NULL,
    dropoff_gov TEXT NOT NULL,
    dropoff_lat DOUBLE PRECISION,
    dropoff_lng DOUBLE PRECISION,
    shipping_details JSONB,
    ride_details JSONB,
    scheduled_date TIMESTAMP WITH TIME ZONE,
    scheduled_time TEXT,
    flexibility "ScheduleFlexibility" DEFAULT 'FLEXIBLE_HOURS',
    payment_method "TransportPaymentMethod" DEFAULT 'CASH',
    cod_amount DOUBLE PRECISION,
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    budget_min DOUBLE PRECISION,
    budget_max DOUBLE PRECISION,
    quotes_count INTEGER DEFAULT 0,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_requests_user_id ON service_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_service_type ON service_requests(service_type);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);

-- Service Quotes - عروض الأسعار
CREATE TABLE IF NOT EXISTS service_quotes (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    request_id TEXT NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
    provider_id TEXT NOT NULL REFERENCES service_providers(id) ON DELETE CASCADE,
    status "ServiceQuoteStatus" DEFAULT 'PENDING',
    price DOUBLE PRECISION NOT NULL,
    currency TEXT DEFAULT 'EGP',
    price_breakdown JSONB,
    vehicle_type TEXT,
    estimated_duration INTEGER,
    estimated_arrival TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    valid_until TIMESTAMP WITH TIME ZONE,
    rating DOUBLE PRECISION,
    review TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_service_quotes_request_id ON service_quotes(request_id);
CREATE INDEX IF NOT EXISTS idx_service_quotes_provider_id ON service_quotes(provider_id);

-- Marketplace Notifications - إشعارات السوق
CREATE TABLE IF NOT EXISTS marketplace_notifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    title_ar TEXT,
    message TEXT NOT NULL,
    message_ar TEXT,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_marketplace_notifications_user_id ON marketplace_notifications(user_id);

-- =====================================================
-- STEP 3: SEED DATA - البيانات التجريبية
-- =====================================================

DO $$
DECLARE
    user1_id TEXT;
    user2_id TEXT;
    user3_id TEXT;
    user4_id TEXT;
    user5_id TEXT;
    user6_id TEXT;
    user7_id TEXT;
    user8_id TEXT;
    user9_id TEXT;
    user10_id TEXT;

    provider1_id TEXT;
    provider2_id TEXT;
    provider3_id TEXT;
    provider4_id TEXT;
    provider5_id TEXT;
    provider6_id TEXT;
    provider7_id TEXT;
    provider8_id TEXT;
    provider9_id TEXT;
    provider10_id TEXT;

    request1_id TEXT;
    request2_id TEXT;
    request3_id TEXT;
    request4_id TEXT;
    request5_id TEXT;
    request6_id TEXT;
    request7_id TEXT;
    request8_id TEXT;
    request9_id TEXT;
    request10_id TEXT;
    request11_id TEXT;
BEGIN
    -- Get existing user IDs
    SELECT id INTO user1_id FROM users WHERE email = 'test1@xchange.eg';
    SELECT id INTO user2_id FROM users WHERE email = 'test2@xchange.eg';
    SELECT id INTO user3_id FROM users WHERE email = 'test3@xchange.eg';
    SELECT id INTO user4_id FROM users WHERE email = 'test4@xchange.eg';
    SELECT id INTO user5_id FROM users WHERE email = 'test5@xchange.eg';
    SELECT id INTO user6_id FROM users WHERE email = 'test6@xchange.eg';
    SELECT id INTO user7_id FROM users WHERE email = 'test7@xchange.eg';
    SELECT id INTO user8_id FROM users WHERE email = 'test8@xchange.eg';
    SELECT id INTO user9_id FROM users WHERE email = 'test9@xchange.eg';
    SELECT id INTO user10_id FROM users WHERE email = 'test10@xchange.eg';

    IF user1_id IS NULL THEN
        RAISE EXCEPTION 'Users not found. Please ensure test1@xchange.eg to test10@xchange.eg exist.';
    END IF;

    -- =====================================================
    -- 1. SERVICE PROVIDERS - مزودي الخدمات
    -- =====================================================

    INSERT INTO service_providers (id, user_id, type, name, name_ar, phone, email, company_name, commercial_register, tax_number, coverage_areas, service_types, rating, total_ratings, completed_orders, is_verified, is_active)
    VALUES (
        'prov_nile_express_001', user1_id, 'COMPANY', 'Nile Express Shipping', 'شركة النيل إكسبريس للشحن',
        '+201200000001', 'info@nileexpress.eg', 'شركة النيل إكسبريس للشحن', 'CR-12345', 'TAX-567890',
        ARRAY['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية'],
        ARRAY['SHIPPING']::"TransportServiceType"[], 4.8, 256, 1523, true, true
    ) RETURNING id INTO provider1_id;

    INSERT INTO service_providers (id, user_id, type, name, name_ar, phone, email, company_name, commercial_register, tax_number, coverage_areas, service_types, rating, total_ratings, completed_orders, is_verified, is_active)
    VALUES (
        'prov_cairo_trans_002', user2_id, 'COMPANY', 'Cairo Trans', 'القاهرة للنقل والتوصيل',
        '+201200000002', 'contact@cairotrans.com', 'شركة القاهرة للنقل والتوصيل', 'CR-23456', 'TAX-678901',
        ARRAY['القاهرة', 'الجيزة', 'القليوبية', 'الفيوم', 'بني سويف'],
        ARRAY['SHIPPING', 'INTERCITY_RIDE']::"TransportServiceType"[], 4.6, 189, 987, true, true
    ) RETURNING id INTO provider2_id;

    INSERT INTO service_providers (id, user_id, type, name, name_ar, phone, email, company_name, coverage_areas, service_types, rating, total_ratings, completed_orders, is_verified, is_active)
    VALUES (
        'prov_fast_alex_003', user3_id, 'SMALL_BUSINESS', 'Fast Delivery Alex', 'توصيل سريع الإسكندرية',
        '+201200000003', 'fast.alex@gmail.com', 'توصيل سريع الإسكندرية',
        ARRAY['الإسكندرية', 'البحيرة', 'مطروح', 'كفر الشيخ'],
        ARRAY['SHIPPING']::"TransportServiceType"[], 4.5, 78, 234, true, true
    ) RETURNING id INTO provider3_id;

    INSERT INTO service_providers (id, user_id, type, name, name_ar, phone, email, company_name, coverage_areas, service_types, rating, total_ratings, completed_orders, is_verified, is_active)
    VALUES (
        'prov_delta_tours_004', user4_id, 'SMALL_BUSINESS', 'Delta Tours', 'دلتا تورز للسياحة',
        '+201200000004', 'delta.tours@outlook.com', 'دلتا تورز للسياحة والنقل',
        ARRAY['الدقهلية', 'الغربية', 'كفر الشيخ', 'دمياط', 'الشرقية', 'القاهرة'],
        ARRAY['INTERCITY_RIDE']::"TransportServiceType"[], 4.7, 112, 456, true, true
    ) RETURNING id INTO provider4_id;

    INSERT INTO service_providers (id, user_id, type, name, name_ar, phone, email, company_name, coverage_areas, service_types, rating, total_ratings, completed_orders, is_verified, is_active)
    VALUES (
        'prov_hurghada_005', user5_id, 'SMALL_BUSINESS', 'Hurghada Express', 'الغردقة إكسبريس',
        '+201200000005', 'hurghada.exp@gmail.com', 'الغردقة إكسبريس للنقل',
        ARRAY['البحر الأحمر', 'قنا', 'الأقصر', 'أسوان', 'سوهاج'],
        ARRAY['SHIPPING', 'INTERCITY_RIDE']::"TransportServiceType"[], 4.4, 67, 189, true, true
    ) RETURNING id INTO provider5_id;

    INSERT INTO service_providers (id, user_id, type, name, name_ar, phone, email, coverage_areas, service_types, rating, total_ratings, completed_orders, is_verified, is_active)
    VALUES (
        'prov_mohamed_006', user6_id, 'INDIVIDUAL', 'Mohamed Ahmed', 'محمد أحمد',
        '+201200000006', 'mohamed.ahmed.driver@gmail.com',
        ARRAY['القاهرة', 'الجيزة', 'القليوبية'],
        ARRAY['SHIPPING', 'INTERCITY_RIDE']::"TransportServiceType"[], 4.9, 45, 123, true, true
    ) RETURNING id INTO provider6_id;

    INSERT INTO service_providers (id, user_id, type, name, name_ar, phone, email, coverage_areas, service_types, rating, total_ratings, completed_orders, is_verified, is_active)
    VALUES (
        'prov_ahmed_007', user7_id, 'INDIVIDUAL', 'Ahmed Hassan', 'أحمد حسن',
        '+201200000007', 'ahmed.hassan.cairo@gmail.com',
        ARRAY['القاهرة', 'الجيزة', 'الإسكندرية', 'البحيرة'],
        ARRAY['INTERCITY_RIDE']::"TransportServiceType"[], 4.7, 89, 267, true, true
    ) RETURNING id INTO provider7_id;

    INSERT INTO service_providers (id, user_id, type, name, name_ar, phone, email, coverage_areas, service_types, rating, total_ratings, completed_orders, is_verified, is_active)
    VALUES (
        'prov_mahmoud_008', user8_id, 'INDIVIDUAL', 'Mahmoud Saeed', 'محمود سعيد',
        '+201200000008', 'mahmoud.saeed@gmail.com',
        ARRAY['الإسكندرية', 'البحيرة', 'الغربية', 'كفر الشيخ'],
        ARRAY['SHIPPING']::"TransportServiceType"[], 4.3, 34, 78, true, true
    ) RETURNING id INTO provider8_id;

    INSERT INTO service_providers (id, user_id, type, name, name_ar, phone, email, coverage_areas, service_types, rating, total_ratings, completed_orders, is_verified, is_active)
    VALUES (
        'prov_khaled_009', user9_id, 'INDIVIDUAL', 'Khaled Ibrahim', 'خالد إبراهيم',
        '+201200000009', 'khaled.ibrahim.driver@gmail.com',
        ARRAY['الجيزة', 'الفيوم', 'بني سويف', 'المنيا'],
        ARRAY['SHIPPING', 'INTERCITY_RIDE']::"TransportServiceType"[], 4.6, 56, 145, false, true
    ) RETURNING id INTO provider9_id;

    INSERT INTO service_providers (id, user_id, type, name, name_ar, phone, email, coverage_areas, service_types, rating, total_ratings, completed_orders, is_verified, is_active)
    VALUES (
        'prov_youssef_010', user10_id, 'INDIVIDUAL', 'Youssef Ali', 'يوسف علي',
        '+201200000010', 'youssef.ali.transport@gmail.com',
        ARRAY['أسوان', 'الأقصر', 'قنا', 'سوهاج', 'أسيوط'],
        ARRAY['INTERCITY_RIDE']::"TransportServiceType"[], 4.8, 78, 234, true, true
    ) RETURNING id INTO provider10_id;

    -- =====================================================
    -- 2. PROVIDER VEHICLES - مركبات المزودين
    -- =====================================================

    INSERT INTO provider_vehicles (provider_id, type, make, model, year, plate_number, color, is_active, photos)
    VALUES
        (provider1_id, 'VAN', 'Mercedes', 'Sprinter', 2022, 'ق م ص 1234', 'أبيض', true, '{}'),
        (provider1_id, 'TRUCK_MEDIUM', 'Isuzu', 'NPR', 2020, 'ن ق ل 5678', 'أزرق', true, '{}'),
        (provider1_id, 'TRUCK_LARGE', 'Volvo', 'FH', 2019, 'ن ق ل 9012', 'أحمر', true, '{}'),
        (provider2_id, 'VAN', 'Hyundai', 'H350', 2021, 'ق ت ر 2345', 'أبيض', true, '{}'),
        (provider2_id, 'SUV', 'Toyota', 'Fortuner', 2023, 'ق ت ر 3456', 'أسود', true, '{}'),
        (provider2_id, 'BUS_SMALL', 'Toyota', 'Hiace', 2021, 'ق ت ر 4567', 'أبيض', true, '{}'),
        (provider3_id, 'VAN', 'Suzuki', 'Carry', 2020, 'س ك 7890', 'أبيض', true, '{}'),
        (provider3_id, 'PICKUP', 'Nissan', 'Navara', 2019, 'س ك 7891', 'رمادي', true, '{}'),
        (provider4_id, 'SEDAN', 'Hyundai', 'Elantra', 2022, 'د ت 1111', 'أبيض', true, '{}'),
        (provider4_id, 'SUV', 'Kia', 'Sportage', 2021, 'د ت 2222', 'أسود', true, '{}'),
        (provider4_id, 'MINIVAN', 'Kia', 'Carnival', 2020, 'د ت 3333', 'فضي', true, '{}'),
        (provider5_id, 'SUV', 'Toyota', 'Land Cruiser', 2021, 'غ ر د 5555', 'أبيض', true, '{}'),
        (provider5_id, 'VAN', 'Toyota', 'Hiace', 2020, 'غ ر د 6666', 'أبيض', true, '{}'),
        (provider6_id, 'PICKUP', 'Chevrolet', 'Colorado', 2021, 'م أ 8888', 'أسود', true, '{}'),
        (provider7_id, 'SEDAN', 'Toyota', 'Camry', 2022, 'أ ح 1234', 'فضي', true, '{}'),
        (provider8_id, 'VAN', 'Fiat', 'Ducato', 2019, 'م س 4567', 'أبيض', true, '{}'),
        (provider9_id, 'PICKUP', 'Toyota', 'Hilux', 2020, 'خ أ 7890', 'أبيض', true, '{}'),
        (provider9_id, 'SEDAN', 'Hyundai', 'Accent', 2021, 'خ أ 7891', 'أزرق', true, '{}'),
        (provider10_id, 'SUV', 'Mitsubishi', 'Pajero', 2019, 'ي ع 2468', 'رمادي', true, '{}');

    -- =====================================================
    -- 3. SERVICE REQUESTS - طلبات الخدمة
    -- =====================================================

    -- Shipping Request 1: OPEN
    INSERT INTO service_requests (id, user_id, service_type, status, pickup_address, pickup_city, pickup_gov, pickup_lat, pickup_lng, dropoff_address, dropoff_city, dropoff_gov, dropoff_lat, dropoff_lng, shipping_details, scheduled_date, scheduled_time, flexibility, payment_method, customer_name, customer_phone, budget_min, budget_max, quotes_count, expires_at)
    VALUES ('req_ship_001', user1_id, 'SHIPPING', 'OPEN', 'شارع مكرم عبيد، عمارة 15', 'مدينة نصر', 'القاهرة', 30.0511, 31.3486, 'شارع فوزي معاذ، بجوار كارفور', 'سموحة', 'الإسكندرية', 31.2001, 29.9187, '{"weight": 25, "packageType": "إلكترونيات", "quantity": 2, "fragile": true}', NOW() + INTERVAL '3 days', '10:00', 'FLEXIBLE_HOURS', 'CASH', 'أحمد محمد', '+201012345678', 200, 400, 0, NOW() + INTERVAL '7 days')
    RETURNING id INTO request1_id;

    -- Shipping Request 2: QUOTED
    INSERT INTO service_requests (id, user_id, service_type, status, pickup_address, pickup_city, pickup_gov, pickup_lat, pickup_lng, dropoff_address, dropoff_city, dropoff_gov, dropoff_lat, dropoff_lng, shipping_details, scheduled_date, flexibility, payment_method, customer_name, customer_phone, budget_min, budget_max, quotes_count, expires_at)
    VALUES ('req_ship_002', user2_id, 'SHIPPING', 'QUOTED', 'شارع لبنان، برج الجزيرة', 'المهندسين', 'الجيزة', 30.0444, 31.2085, 'شارع الجلاء، أمام جامعة الزقازيق', 'الزقازيق', 'الشرقية', 30.5877, 31.5039, '{"weight": 50, "packageType": "أثاث", "quantity": 5, "fragile": false}', NOW() + INTERVAL '5 days', 'FLEXIBLE_DAYS', 'CASH', 'سارة أحمد', '+201023456789', 300, 600, 3, NOW() + INTERVAL '7 days')
    RETURNING id INTO request2_id;

    -- Shipping Request 3: OPEN with COD
    INSERT INTO service_requests (id, user_id, service_type, status, pickup_address, pickup_city, pickup_gov, pickup_lat, pickup_lng, dropoff_address, dropoff_city, dropoff_gov, dropoff_lat, dropoff_lng, shipping_details, scheduled_date, scheduled_time, flexibility, payment_method, cod_amount, customer_name, customer_phone, quotes_count, expires_at)
    VALUES ('req_ship_003', user3_id, 'SHIPPING', 'OPEN', 'كيلو 21، بجوار قرية الشروق', 'العجمي', 'الإسكندرية', 31.0409, 29.7618, 'شارع 9، بجوار جراند مول', 'المعادي', 'القاهرة', 29.9602, 31.2569, '{"weight": 15, "packageType": "مستندات", "quantity": 1, "fragile": false}', NOW() + INTERVAL '2 days', '14:00', 'EXACT', 'COD', 5000, 'محمود علي', '+201034567890', 0, NOW() + INTERVAL '7 days')
    RETURNING id INTO request3_id;

    -- Ride Request 4: OPEN
    INSERT INTO service_requests (id, user_id, service_type, status, pickup_address, pickup_city, pickup_gov, pickup_lat, pickup_lng, dropoff_address, dropoff_city, dropoff_gov, dropoff_lat, dropoff_lng, ride_details, scheduled_date, scheduled_time, flexibility, payment_method, customer_name, customer_phone, budget_min, budget_max, quotes_count, expires_at)
    VALUES ('req_ride_004', user4_id, 'INTERCITY_RIDE', 'OPEN', 'ميدان تريومف، أمام سيتي ستارز', 'مصر الجديدة', 'القاهرة', 30.0729, 31.3452, 'طريق الجونة، قرية أرابيلا', 'الغردقة', 'البحر الأحمر', 27.2579, 33.8116, '{"passengers": 4, "luggage": 3, "vehiclePreference": "SUV"}', NOW() + INTERVAL '7 days', '06:00', 'EXACT', 'CASH', 'عمر حسن', '+201045678901', 1000, 1500, 0, NOW() + INTERVAL '7 days')
    RETURNING id INTO request4_id;

    -- Ride Request 5: QUOTED
    INSERT INTO service_requests (id, user_id, service_type, status, pickup_address, pickup_city, pickup_gov, pickup_lat, pickup_lng, dropoff_address, dropoff_city, dropoff_gov, dropoff_lat, dropoff_lng, ride_details, scheduled_date, scheduled_time, flexibility, payment_method, customer_name, customer_phone, quotes_count, expires_at)
    VALUES ('req_ride_005', user5_id, 'INTERCITY_RIDE', 'QUOTED', 'ميدان المساحة، برج الأطباء', 'الدقي', 'الجيزة', 30.0379, 31.2120, 'قصر المنتزه، المدخل الرئيسي', 'المنتزه', 'الإسكندرية', 31.2865, 30.0119, '{"passengers": 2, "luggage": 2, "vehiclePreference": "SEDAN"}', NOW() + INTERVAL '4 days', '08:00', 'FLEXIBLE_HOURS', 'CASH', 'نورهان محمد', '+201056789012', 4, NOW() + INTERVAL '7 days')
    RETURNING id INTO request5_id;

    -- Shipping Request 6: ACCEPTED
    INSERT INTO service_requests (id, user_id, service_type, status, pickup_address, pickup_city, pickup_gov, pickup_lat, pickup_lng, dropoff_address, dropoff_city, dropoff_gov, dropoff_lat, dropoff_lng, shipping_details, scheduled_date, flexibility, payment_method, customer_name, customer_phone, budget_max, quotes_count, expires_at)
    VALUES ('req_ship_006', user6_id, 'SHIPPING', 'ACCEPTED', 'الحي الأول، فيلا 23', 'التجمع الخامس', 'القاهرة', 30.0084, 31.4270, 'شارع التلفزيون، بجوار معبد الكرنك', 'الأقصر', 'الأقصر', 25.6872, 32.6396, '{"weight": 100, "packageType": "أجهزة منزلية", "quantity": 3, "fragile": true}', NOW() + INTERVAL '1 day', 'EXACT', 'CASH', 'كريم سمير', '+201067890123', 1200, 5, NOW() + INTERVAL '7 days')
    RETURNING id INTO request6_id;

    -- Ride Request 7: IN_PROGRESS
    INSERT INTO service_requests (id, user_id, service_type, status, pickup_address, pickup_city, pickup_gov, pickup_lat, pickup_lng, dropoff_address, dropoff_city, dropoff_gov, dropoff_lat, dropoff_lng, ride_details, scheduled_date, scheduled_time, flexibility, payment_method, customer_name, customer_phone, quotes_count, expires_at)
    VALUES ('req_ride_007', user7_id, 'INTERCITY_RIDE', 'IN_PROGRESS', 'شارع 26 يوليو، برج النيل', 'الزمالك', 'القاهرة', 30.0609, 31.2234, 'خليج نعمة، فندق هيلتون', 'شرم الشيخ', 'جنوب سيناء', 27.9158, 34.3300, '{"passengers": 3, "luggage": 4, "vehiclePreference": "SUV", "amenities": ["AC", "WIFI"]}', NOW(), '05:00', 'EXACT', 'CARD', 'ياسمين علي', '+201078901234', 6, NOW() + INTERVAL '7 days')
    RETURNING id INTO request7_id;

    -- Shipping Request 8: COMPLETED
    INSERT INTO service_requests (id, user_id, service_type, status, pickup_address, pickup_city, pickup_gov, pickup_lat, pickup_lng, dropoff_address, dropoff_city, dropoff_gov, dropoff_lat, dropoff_lng, shipping_details, scheduled_date, flexibility, payment_method, customer_name, customer_phone, quotes_count, expires_at, created_at)
    VALUES ('req_ship_008', user8_id, 'SHIPPING', 'COMPLETED', 'شارع ابو قير، عمارة 45', 'الإبراهيمية', 'الإسكندرية', 31.2156, 29.9553, 'شارع طلعت حرب، برج الجزيرة', 'وسط البلد', 'القاهرة', 30.0444, 31.2357, '{"weight": 20, "packageType": "ملابس", "quantity": 10, "fragile": false}', NOW() - INTERVAL '5 days', 'FLEXIBLE_DAYS', 'CASH', 'منى إبراهيم', '+201089012345', 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '7 days')
    RETURNING id INTO request8_id;

    -- Ride Request 9: COMPLETED
    INSERT INTO service_requests (id, user_id, service_type, status, pickup_address, pickup_city, pickup_gov, pickup_lat, pickup_lng, dropoff_address, dropoff_city, dropoff_gov, dropoff_lat, dropoff_lng, ride_details, scheduled_date, flexibility, payment_method, customer_name, customer_phone, quotes_count, expires_at, created_at)
    VALUES ('req_ride_009', user9_id, 'INTERCITY_RIDE', 'COMPLETED', 'الحي المتميز، مول مصر', 'أكتوبر', 'الجيزة', 29.9729, 30.9474, 'كورنيش الميناء', 'مرسى مطروح', 'مطروح', 31.3543, 27.2373, '{"passengers": 5, "luggage": 5, "vehiclePreference": "MINIVAN"}', NOW() - INTERVAL '10 days', 'EXACT', 'CASH', 'حسام الدين', '+201090123456', 3, NOW() - INTERVAL '5 days', NOW() - INTERVAL '12 days')
    RETURNING id INTO request9_id;

    -- Shipping Request 10: COMPLETED (Large)
    INSERT INTO service_requests (id, user_id, service_type, status, pickup_address, pickup_city, pickup_gov, pickup_lat, pickup_lng, dropoff_address, dropoff_city, dropoff_gov, dropoff_lat, dropoff_lng, shipping_details, scheduled_date, flexibility, payment_method, cod_amount, customer_name, customer_phone, quotes_count, expires_at, created_at)
    VALUES ('req_ship_010', user10_id, 'SHIPPING', 'COMPLETED', 'شارع شبرا الرئيسي', 'شبرا', 'القاهرة', 30.0771, 31.2452, 'شارع الجمهورية', 'أسيوط', 'أسيوط', 27.1809, 31.1837, '{"weight": 200, "packageType": "بضائع تجارية", "quantity": 20, "fragile": false}', NOW() - INTERVAL '15 days', 'FLEXIBLE_DAYS', 'COD', 15000, 'تاجر الصعيد', '+201101234567', 4, NOW() - INTERVAL '10 days', NOW() - INTERVAL '17 days')
    RETURNING id INTO request10_id;

    -- Shipping Request 11: CANCELLED
    INSERT INTO service_requests (id, user_id, service_type, status, pickup_address, pickup_city, pickup_gov, pickup_lat, pickup_lng, dropoff_address, dropoff_city, dropoff_gov, dropoff_lat, dropoff_lng, shipping_details, scheduled_date, flexibility, payment_method, customer_name, customer_phone, quotes_count, expires_at, created_at)
    VALUES ('req_ship_011', user1_id, 'SHIPPING', 'CANCELLED', 'ميدان رمسيس', 'وسط البلد', 'القاهرة', 30.0626, 31.2469, 'محطة مصر', 'الإسكندرية', 'الإسكندرية', 31.1923, 29.8985, '{"weight": 5, "packageType": "طرد صغير", "quantity": 1, "fragile": false}', NOW() - INTERVAL '3 days', 'FLEXIBLE_HOURS', 'CASH', 'أحمد محمد', '+201012345678', 1, NOW() - INTERVAL '1 day', NOW() - INTERVAL '5 days')
    RETURNING id INTO request11_id;

    -- =====================================================
    -- 4. SERVICE QUOTES - عروض الأسعار
    -- =====================================================

    -- Quotes for Request 2 (QUOTED - Shipping)
    INSERT INTO service_quotes (request_id, provider_id, status, price, currency, price_breakdown, vehicle_type, estimated_duration, notes, valid_until)
    VALUES
        (request2_id, provider1_id, 'PENDING', 450, 'EGP', '{"basePrice": 350, "distanceCharge": 80, "extras": [{"name": "تأمين", "price": 20}]}', 'VAN', 180, 'تأمين شامل على الشحنة', NOW() + INTERVAL '1 day'),
        (request2_id, provider3_id, 'PENDING', 380, 'EGP', '{"basePrice": 300, "distanceCharge": 80}', 'PICKUP', 200, 'سرعة في التوصيل', NOW() + INTERVAL '1 day'),
        (request2_id, provider6_id, 'PENDING', 420, 'EGP', '{"basePrice": 340, "distanceCharge": 80}', 'PICKUP', 190, 'خدمة ممتازة وسائق محترف', NOW() + INTERVAL '1 day');

    -- Quotes for Request 5 (QUOTED - Ride)
    INSERT INTO service_quotes (request_id, provider_id, status, price, currency, price_breakdown, vehicle_type, estimated_duration, notes, valid_until)
    VALUES
        (request5_id, provider2_id, 'PENDING', 650, 'EGP', '{"basePrice": 550, "distanceCharge": 100}', 'SEDAN', 150, 'سيارة مكيفة ومريحة', NOW() + INTERVAL '1 day'),
        (request5_id, provider4_id, 'PENDING', 700, 'EGP', '{"basePrice": 580, "distanceCharge": 100, "extras": [{"name": "مياه", "price": 20}]}', 'SEDAN', 140, 'واي فاي مجاني ومياه', NOW() + INTERVAL '1 day'),
        (request5_id, provider7_id, 'PENDING', 600, 'EGP', '{"basePrice": 500, "distanceCharge": 100}', 'SEDAN', 160, 'سائق محترف وملتزم بالمواعيد', NOW() + INTERVAL '1 day'),
        (request5_id, provider10_id, 'PENDING', 750, 'EGP', '{"basePrice": 620, "distanceCharge": 100, "extras": [{"name": "SUV", "price": 30}]}', 'SUV', 145, 'سيارة SUV فاخرة', NOW() + INTERVAL '1 day');

    -- Quotes for Request 6 (ACCEPTED)
    INSERT INTO service_quotes (request_id, provider_id, status, price, currency, price_breakdown, vehicle_type, estimated_duration, notes, valid_until)
    VALUES
        (request6_id, provider1_id, 'ACCEPTED', 950, 'EGP', '{"basePrice": 750, "distanceCharge": 150, "extras": [{"name": "تأمين شامل", "price": 50}]}', 'TRUCK_MEDIUM', 480, 'تأمين شامل وضمان وصول سليم', NOW() + INTERVAL '1 day'),
        (request6_id, provider5_id, 'REJECTED', 1100, 'EGP', '{"basePrice": 900, "distanceCharge": 200}', 'TRUCK_MEDIUM', 450, 'توصيل سريع', NOW() + INTERVAL '1 day'),
        (request6_id, provider2_id, 'REJECTED', 1050, 'EGP', '{"basePrice": 850, "distanceCharge": 200}', 'TRUCK_MEDIUM', 460, 'خدمة موثوقة', NOW() + INTERVAL '1 day');

    -- Quotes for Request 7 (IN_PROGRESS)
    INSERT INTO service_quotes (request_id, provider_id, status, price, currency, price_breakdown, vehicle_type, estimated_duration, notes, valid_until)
    VALUES
        (request7_id, provider4_id, 'ACCEPTED', 1800, 'EGP', '{"basePrice": 1500, "distanceCharge": 250, "extras": [{"name": "واي فاي", "price": 50}]}', 'SUV', 360, 'SUV فاخر مع واي فاي', NOW() + INTERVAL '1 day'),
        (request7_id, provider2_id, 'REJECTED', 2000, 'EGP', '{"basePrice": 1700, "distanceCharge": 300}', 'SUV', 350, 'خدمة VIP', NOW() + INTERVAL '1 day');

    -- Quotes for Completed Requests (with ratings)
    INSERT INTO service_quotes (request_id, provider_id, status, price, currency, price_breakdown, vehicle_type, estimated_duration, notes, valid_until, rating, review, created_at)
    VALUES
        (request8_id, provider3_id, 'ACCEPTED', 280, 'EGP', '{"basePrice": 220, "distanceCharge": 60}', 'VAN', 180, 'توصيل سريع', NOW() - INTERVAL '6 days', 5, 'خدمة ممتازة وسريعة!', NOW() - INTERVAL '7 days'),
        (request9_id, provider4_id, 'ACCEPTED', 1200, 'EGP', '{"basePrice": 1000, "distanceCharge": 200}', 'MINIVAN', 300, 'رحلة مريحة', NOW() - INTERVAL '11 days', 4.5, 'سائق محترم والسيارة نظيفة', NOW() - INTERVAL '12 days'),
        (request10_id, provider1_id, 'ACCEPTED', 1800, 'EGP', '{"basePrice": 1500, "distanceCharge": 250, "extras": [{"name": "تحميل وتنزيل", "price": 50}]}', 'TRUCK_LARGE', 540, 'نقل بضائع تجارية', NOW() - INTERVAL '16 days', 5, 'شركة محترمة جداً وملتزمة', NOW() - INTERVAL '17 days');

    -- =====================================================
    -- 5. NOTIFICATIONS - الإشعارات
    -- =====================================================

    INSERT INTO marketplace_notifications (user_id, type, title, title_ar, message, message_ar, is_read, created_at)
    VALUES
        (user1_id, 'NEW_QUOTE', 'New Quote Received', 'عرض سعر جديد', 'You received a new quote for your shipping request', 'استلمت عرض سعر جديد بقيمة 450 ج.م', false, NOW() - INTERVAL '1 hour'),
        (user1_id, 'ORDER_UPDATE', 'Order Status Updated', 'تحديث الطلب', 'Your order status has been updated', 'تم تحديث حالة طلبك إلى: جاري التنفيذ', true, NOW() - INTERVAL '2 days'),
        (user2_id, 'NEW_QUOTE', 'New Quote Received', 'عرض سعر جديد', 'You received 3 new quotes', 'استلمت 3 عروض أسعار جديدة', false, NOW() - INTERVAL '30 minutes'),
        (user3_id, 'NEW_REQUEST', 'New Request in Your Area', 'طلب جديد في منطقتك', 'New shipping request from Alexandria to Cairo', 'طلب شحن جديد من الإسكندرية إلى القاهرة', false, NOW() - INTERVAL '2 hours'),
        (user4_id, 'QUOTE_ACCEPTED', 'Quote Accepted!', 'تم قبول عرضك', 'Congratulations! Your quote has been accepted', 'تهانينا! تم قبول عرضك لطلب الرحلة', true, NOW() - INTERVAL '1 day'),
        (user5_id, 'NEW_REQUEST', 'New Request Available', 'طلب جديد متاح', 'New intercity ride request to Red Sea', 'طلب رحلة جديد إلى البحر الأحمر', false, NOW() - INTERVAL '3 hours'),
        (user6_id, 'QUOTE_REJECTED', 'Quote Declined', 'تم رفض عرضك', 'Your quote was not accepted', 'للأسف تم رفض عرضك لهذا الطلب', true, NOW() - INTERVAL '2 days'),
        (user7_id, 'NEW_REQUEST', 'New Request in Your Area', 'طلب جديد في منطقتك', 'New ride request from Cairo to Alexandria', 'طلب رحلة جديد من القاهرة إلى الإسكندرية', false, NOW() - INTERVAL '4 hours');

    RAISE NOTICE '✅ Transport Marketplace seeded successfully!';
    RAISE NOTICE '👥 10 Service Providers created';
    RAISE NOTICE '🚛 19 Vehicles created';
    RAISE NOTICE '📋 11 Service Requests created';
    RAISE NOTICE '💬 14 Quotes created';
    RAISE NOTICE '🔔 8 Notifications created';

END $$;

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

SELECT 'Providers by type:' as info;
SELECT type, COUNT(*) as count, ROUND(AVG(rating)::numeric, 2) as avg_rating
FROM service_providers GROUP BY type;

SELECT 'Requests by status:' as info;
SELECT service_type, status, COUNT(*) as count
FROM service_requests GROUP BY service_type, status ORDER BY service_type;

SELECT 'Quotes by status:' as info;
SELECT status, COUNT(*) as count, ROUND(AVG(price)::numeric, 2) as avg_price
FROM service_quotes GROUP BY status;
