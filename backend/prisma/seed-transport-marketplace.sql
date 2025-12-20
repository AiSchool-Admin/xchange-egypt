-- =====================================================
-- Transport Marketplace Seed Data for Supabase
-- =====================================================
-- بيانات تجريبية لسوق النقل الذكي
-- للتشغيل: انسخ والصق في Supabase SQL Editor
-- =====================================================

-- Get user IDs for test accounts
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
    SELECT id INTO user1_id FROM "User" WHERE email = 'test1@xchange.eg';
    SELECT id INTO user2_id FROM "User" WHERE email = 'test2@xchange.eg';
    SELECT id INTO user3_id FROM "User" WHERE email = 'test3@xchange.eg';
    SELECT id INTO user4_id FROM "User" WHERE email = 'test4@xchange.eg';
    SELECT id INTO user5_id FROM "User" WHERE email = 'test5@xchange.eg';
    SELECT id INTO user6_id FROM "User" WHERE email = 'test6@xchange.eg';
    SELECT id INTO user7_id FROM "User" WHERE email = 'test7@xchange.eg';
    SELECT id INTO user8_id FROM "User" WHERE email = 'test8@xchange.eg';
    SELECT id INTO user9_id FROM "User" WHERE email = 'test9@xchange.eg';
    SELECT id INTO user10_id FROM "User" WHERE email = 'test10@xchange.eg';

    -- =====================================================
    -- 1. SERVICE PROVIDERS - مزودي الخدمات
    -- =====================================================

    -- Provider 1: شركة النيل إكسبريس للشحن (Company)
    INSERT INTO "ServiceProvider" (
        id, "userId", type, name, "nameAr", phone, email,
        "companyName", "commercialRegister", "taxNumber",
        "coverageAreas", "serviceTypes",
        rating, "totalRatings", "completedOrders",
        "isVerified", "isActive", "createdAt", "updatedAt"
    ) VALUES (
        'prov_' || substr(md5(random()::text), 1, 20),
        user1_id, 'COMPANY', 'Nile Express Shipping', 'شركة النيل إكسبريس للشحن',
        '+201200000001', 'info@nileexpress.eg',
        'شركة النيل إكسبريس للشحن', 'CR-12345', 'TAX-567890',
        ARRAY['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'الغربية', 'البحيرة'],
        ARRAY['SHIPPING']::"ServiceType"[],
        4.8, 256, 1523, true, true, NOW(), NOW()
    ) RETURNING id INTO provider1_id;

    -- Provider 2: القاهرة للنقل والتوصيل (Company)
    INSERT INTO "ServiceProvider" (
        id, "userId", type, name, "nameAr", phone, email,
        "companyName", "commercialRegister", "taxNumber",
        "coverageAreas", "serviceTypes",
        rating, "totalRatings", "completedOrders",
        "isVerified", "isActive", "createdAt", "updatedAt"
    ) VALUES (
        'prov_' || substr(md5(random()::text), 1, 20),
        user2_id, 'COMPANY', 'Cairo Trans', 'القاهرة للنقل والتوصيل',
        '+201200000002', 'contact@cairotrans.com',
        'شركة القاهرة للنقل والتوصيل', 'CR-23456', 'TAX-678901',
        ARRAY['القاهرة', 'الجيزة', 'القليوبية', 'الفيوم', 'بني سويف', 'المنيا'],
        ARRAY['SHIPPING', 'INTERCITY_RIDE']::"ServiceType"[],
        4.6, 189, 987, true, true, NOW(), NOW()
    ) RETURNING id INTO provider2_id;

    -- Provider 3: توصيل سريع الإسكندرية (Small Business)
    INSERT INTO "ServiceProvider" (
        id, "userId", type, name, "nameAr", phone, email,
        "companyName", "coverageAreas", "serviceTypes",
        rating, "totalRatings", "completedOrders",
        "isVerified", "isActive", "createdAt", "updatedAt"
    ) VALUES (
        'prov_' || substr(md5(random()::text), 1, 20),
        user3_id, 'SMALL_BUSINESS', 'Fast Delivery Alex', 'توصيل سريع الإسكندرية',
        '+201200000003', 'fast.alex@gmail.com',
        'توصيل سريع الإسكندرية',
        ARRAY['الإسكندرية', 'البحيرة', 'مطروح', 'كفر الشيخ'],
        ARRAY['SHIPPING']::"ServiceType"[],
        4.5, 78, 234, true, true, NOW(), NOW()
    ) RETURNING id INTO provider3_id;

    -- Provider 4: دلتا تورز للسياحة (Small Business)
    INSERT INTO "ServiceProvider" (
        id, "userId", type, name, "nameAr", phone, email,
        "companyName", "coverageAreas", "serviceTypes",
        rating, "totalRatings", "completedOrders",
        "isVerified", "isActive", "createdAt", "updatedAt"
    ) VALUES (
        'prov_' || substr(md5(random()::text), 1, 20),
        user4_id, 'SMALL_BUSINESS', 'Delta Tours', 'دلتا تورز للسياحة',
        '+201200000004', 'delta.tours@outlook.com',
        'دلتا تورز للسياحة والنقل',
        ARRAY['الدقهلية', 'الغربية', 'كفر الشيخ', 'دمياط', 'الشرقية', 'القاهرة'],
        ARRAY['INTERCITY_RIDE']::"ServiceType"[],
        4.7, 112, 456, true, true, NOW(), NOW()
    ) RETURNING id INTO provider4_id;

    -- Provider 5: الغردقة إكسبريس (Small Business)
    INSERT INTO "ServiceProvider" (
        id, "userId", type, name, "nameAr", phone, email,
        "companyName", "coverageAreas", "serviceTypes",
        rating, "totalRatings", "completedOrders",
        "isVerified", "isActive", "createdAt", "updatedAt"
    ) VALUES (
        'prov_' || substr(md5(random()::text), 1, 20),
        user5_id, 'SMALL_BUSINESS', 'Hurghada Express', 'الغردقة إكسبريس',
        '+201200000005', 'hurghada.exp@gmail.com',
        'الغردقة إكسبريس للنقل',
        ARRAY['البحر الأحمر', 'قنا', 'الأقصر', 'أسوان', 'سوهاج'],
        ARRAY['SHIPPING', 'INTERCITY_RIDE']::"ServiceType"[],
        4.4, 67, 189, true, true, NOW(), NOW()
    ) RETURNING id INTO provider5_id;

    -- Provider 6: محمد أحمد (Individual)
    INSERT INTO "ServiceProvider" (
        id, "userId", type, name, "nameAr", phone, email,
        "coverageAreas", "serviceTypes",
        rating, "totalRatings", "completedOrders",
        "isVerified", "isActive", "createdAt", "updatedAt"
    ) VALUES (
        'prov_' || substr(md5(random()::text), 1, 20),
        user6_id, 'INDIVIDUAL', 'Mohamed Ahmed', 'محمد أحمد',
        '+201200000006', 'mohamed.ahmed.driver@gmail.com',
        ARRAY['القاهرة', 'الجيزة', 'القليوبية'],
        ARRAY['SHIPPING', 'INTERCITY_RIDE']::"ServiceType"[],
        4.9, 45, 123, true, true, NOW(), NOW()
    ) RETURNING id INTO provider6_id;

    -- Provider 7: أحمد حسن (Individual)
    INSERT INTO "ServiceProvider" (
        id, "userId", type, name, "nameAr", phone, email,
        "coverageAreas", "serviceTypes",
        rating, "totalRatings", "completedOrders",
        "isVerified", "isActive", "createdAt", "updatedAt"
    ) VALUES (
        'prov_' || substr(md5(random()::text), 1, 20),
        user7_id, 'INDIVIDUAL', 'Ahmed Hassan', 'أحمد حسن',
        '+201200000007', 'ahmed.hassan.cairo@gmail.com',
        ARRAY['القاهرة', 'الجيزة', 'الإسكندرية', 'البحيرة'],
        ARRAY['INTERCITY_RIDE']::"ServiceType"[],
        4.7, 89, 267, true, true, NOW(), NOW()
    ) RETURNING id INTO provider7_id;

    -- Provider 8: محمود سعيد (Individual)
    INSERT INTO "ServiceProvider" (
        id, "userId", type, name, "nameAr", phone, email,
        "coverageAreas", "serviceTypes",
        rating, "totalRatings", "completedOrders",
        "isVerified", "isActive", "createdAt", "updatedAt"
    ) VALUES (
        'prov_' || substr(md5(random()::text), 1, 20),
        user8_id, 'INDIVIDUAL', 'Mahmoud Saeed', 'محمود سعيد',
        '+201200000008', 'mahmoud.saeed@gmail.com',
        ARRAY['الإسكندرية', 'البحيرة', 'الغربية', 'كفر الشيخ'],
        ARRAY['SHIPPING']::"ServiceType"[],
        4.3, 34, 78, true, true, NOW(), NOW()
    ) RETURNING id INTO provider8_id;

    -- Provider 9: خالد إبراهيم (Individual - Not Verified)
    INSERT INTO "ServiceProvider" (
        id, "userId", type, name, "nameAr", phone, email,
        "coverageAreas", "serviceTypes",
        rating, "totalRatings", "completedOrders",
        "isVerified", "isActive", "createdAt", "updatedAt"
    ) VALUES (
        'prov_' || substr(md5(random()::text), 1, 20),
        user9_id, 'INDIVIDUAL', 'Khaled Ibrahim', 'خالد إبراهيم',
        '+201200000009', 'khaled.ibrahim.driver@gmail.com',
        ARRAY['الجيزة', 'الفيوم', 'بني سويف', 'المنيا'],
        ARRAY['SHIPPING', 'INTERCITY_RIDE']::"ServiceType"[],
        4.6, 56, 145, false, true, NOW(), NOW()
    ) RETURNING id INTO provider9_id;

    -- Provider 10: يوسف علي (Individual)
    INSERT INTO "ServiceProvider" (
        id, "userId", type, name, "nameAr", phone, email,
        "coverageAreas", "serviceTypes",
        rating, "totalRatings", "completedOrders",
        "isVerified", "isActive", "createdAt", "updatedAt"
    ) VALUES (
        'prov_' || substr(md5(random()::text), 1, 20),
        user10_id, 'INDIVIDUAL', 'Youssef Ali', 'يوسف علي',
        '+201200000010', 'youssef.ali.transport@gmail.com',
        ARRAY['أسوان', 'الأقصر', 'قنا', 'سوهاج', 'أسيوط'],
        ARRAY['INTERCITY_RIDE']::"ServiceType"[],
        4.8, 78, 234, true, true, NOW(), NOW()
    ) RETURNING id INTO provider10_id;

    -- =====================================================
    -- 2. PROVIDER VEHICLES - مركبات المزودين
    -- =====================================================

    -- Vehicles for Provider 1 (Nile Express)
    INSERT INTO "ProviderVehicle" (id, "providerId", type, make, model, year, "plateNumber", color, "isActive", photos, "createdAt", "updatedAt")
    VALUES
        ('veh_' || substr(md5(random()::text), 1, 20), provider1_id, 'VAN', 'Mercedes', 'Sprinter', 2022, 'ق م ص 1234', 'أبيض', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider1_id, 'VAN', 'Mercedes', 'Sprinter', 2021, 'ق م ص 1235', 'أبيض', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider1_id, 'TRUCK_MEDIUM', 'Isuzu', 'NPR', 2020, 'ن ق ل 5678', 'أزرق', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider1_id, 'TRUCK_LARGE', 'Volvo', 'FH', 2019, 'ن ق ل 9012', 'أحمر', true, '{}', NOW(), NOW());

    -- Vehicles for Provider 2 (Cairo Trans)
    INSERT INTO "ProviderVehicle" (id, "providerId", type, make, model, year, "plateNumber", color, "isActive", photos, "createdAt", "updatedAt")
    VALUES
        ('veh_' || substr(md5(random()::text), 1, 20), provider2_id, 'VAN', 'Hyundai', 'H350', 2021, 'ق ت ر 2345', 'أبيض', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider2_id, 'PICKUP', 'Toyota', 'Hilux', 2022, 'ق ت ر 2346', 'فضي', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider2_id, 'SUV', 'Toyota', 'Fortuner', 2023, 'ق ت ر 3456', 'أسود', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider2_id, 'BUS_SMALL', 'Toyota', 'Hiace', 2021, 'ق ت ر 4567', 'أبيض', true, '{}', NOW(), NOW());

    -- Vehicles for Provider 3 (Fast Delivery Alex)
    INSERT INTO "ProviderVehicle" (id, "providerId", type, make, model, year, "plateNumber", color, "isActive", photos, "createdAt", "updatedAt")
    VALUES
        ('veh_' || substr(md5(random()::text), 1, 20), provider3_id, 'VAN', 'Suzuki', 'Carry', 2020, 'س ك 7890', 'أبيض', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider3_id, 'PICKUP', 'Nissan', 'Navara', 2019, 'س ك 7891', 'رمادي', true, '{}', NOW(), NOW());

    -- Vehicles for Provider 4 (Delta Tours)
    INSERT INTO "ProviderVehicle" (id, "providerId", type, make, model, year, "plateNumber", color, "isActive", photos, "createdAt", "updatedAt")
    VALUES
        ('veh_' || substr(md5(random()::text), 1, 20), provider4_id, 'SEDAN', 'Hyundai', 'Elantra', 2022, 'د ت 1111', 'أبيض', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider4_id, 'SUV', 'Kia', 'Sportage', 2021, 'د ت 2222', 'أسود', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider4_id, 'MINIVAN', 'Kia', 'Carnival', 2020, 'د ت 3333', 'فضي', true, '{}', NOW(), NOW());

    -- Vehicles for Provider 5 (Hurghada Express)
    INSERT INTO "ProviderVehicle" (id, "providerId", type, make, model, year, "plateNumber", color, "isActive", photos, "createdAt", "updatedAt")
    VALUES
        ('veh_' || substr(md5(random()::text), 1, 20), provider5_id, 'SUV', 'Toyota', 'Land Cruiser', 2021, 'غ ر د 5555', 'أبيض', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider5_id, 'VAN', 'Toyota', 'Hiace', 2020, 'غ ر د 6666', 'أبيض', true, '{}', NOW(), NOW());

    -- Vehicles for Individual Providers
    INSERT INTO "ProviderVehicle" (id, "providerId", type, make, model, year, "plateNumber", color, "isActive", photos, "createdAt", "updatedAt")
    VALUES
        ('veh_' || substr(md5(random()::text), 1, 20), provider6_id, 'PICKUP', 'Chevrolet', 'Colorado', 2021, 'م أ 8888', 'أسود', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider7_id, 'SEDAN', 'Toyota', 'Camry', 2022, 'أ ح 1234', 'فضي', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider8_id, 'VAN', 'Fiat', 'Ducato', 2019, 'م س 4567', 'أبيض', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider9_id, 'PICKUP', 'Toyota', 'Hilux', 2020, 'خ أ 7890', 'أبيض', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider9_id, 'SEDAN', 'Hyundai', 'Accent', 2021, 'خ أ 7891', 'أزرق', true, '{}', NOW(), NOW()),
        ('veh_' || substr(md5(random()::text), 1, 20), provider10_id, 'SUV', 'Mitsubishi', 'Pajero', 2019, 'ي ع 2468', 'رمادي', true, '{}', NOW(), NOW());

    -- =====================================================
    -- 3. SERVICE REQUESTS - طلبات الخدمة
    -- =====================================================

    -- Request 1: Shipping - OPEN (No quotes yet)
    INSERT INTO "ServiceRequest" (
        id, "userId", "serviceType", status,
        "pickupAddress", "pickupCity", "pickupGov", "pickupLat", "pickupLng",
        "dropoffAddress", "dropoffCity", "dropoffGov", "dropoffLat", "dropoffLng",
        "shippingDetails", "scheduledDate", "scheduledTime", flexibility, "paymentMethod",
        "customerName", "customerPhone", "budgetMin", "budgetMax", "quotesCount", "expiresAt",
        "createdAt", "updatedAt"
    ) VALUES (
        'req_' || substr(md5(random()::text), 1, 20),
        user1_id, 'SHIPPING', 'OPEN',
        'شارع مكرم عبيد، عمارة 15', 'مدينة نصر', 'القاهرة', 30.0511, 31.3486,
        'شارع فوزي معاذ، بجوار كارفور', 'سموحة', 'الإسكندرية', 31.2001, 29.9187,
        '{"weight": 25, "packageType": "إلكترونيات", "quantity": 2, "fragile": true, "requiresCooling": false}',
        NOW() + INTERVAL '3 days', '10:00', 'FLEXIBLE_HOURS', 'CASH',
        'أحمد محمد', '+201012345678', 200, 400, 0, NOW() + INTERVAL '7 days',
        NOW(), NOW()
    ) RETURNING id INTO request1_id;

    -- Request 2: Shipping - QUOTED (Has quotes)
    INSERT INTO "ServiceRequest" (
        id, "userId", "serviceType", status,
        "pickupAddress", "pickupCity", "pickupGov", "pickupLat", "pickupLng",
        "dropoffAddress", "dropoffCity", "dropoffGov", "dropoffLat", "dropoffLng",
        "shippingDetails", "scheduledDate", flexibility, "paymentMethod",
        "customerName", "customerPhone", "budgetMin", "budgetMax", "quotesCount", "expiresAt",
        "createdAt", "updatedAt"
    ) VALUES (
        'req_' || substr(md5(random()::text), 1, 20),
        user2_id, 'SHIPPING', 'QUOTED',
        'شارع لبنان، برج الجزيرة', 'المهندسين', 'الجيزة', 30.0444, 31.2085,
        'شارع الجلاء، أمام جامعة الزقازيق', 'الزقازيق', 'الشرقية', 30.5877, 31.5039,
        '{"weight": 50, "packageType": "أثاث", "quantity": 5, "fragile": false, "requiresCooling": false}',
        NOW() + INTERVAL '5 days', 'FLEXIBLE_DAYS', 'CASH',
        'سارة أحمد', '+201023456789', 300, 600, 3, NOW() + INTERVAL '7 days',
        NOW(), NOW()
    ) RETURNING id INTO request2_id;

    -- Request 3: Shipping - OPEN (COD)
    INSERT INTO "ServiceRequest" (
        id, "userId", "serviceType", status,
        "pickupAddress", "pickupCity", "pickupGov", "pickupLat", "pickupLng",
        "dropoffAddress", "dropoffCity", "dropoffGov", "dropoffLat", "dropoffLng",
        "shippingDetails", "scheduledDate", "scheduledTime", flexibility, "paymentMethod", "codAmount",
        "customerName", "customerPhone", "quotesCount", "expiresAt",
        "createdAt", "updatedAt"
    ) VALUES (
        'req_' || substr(md5(random()::text), 1, 20),
        user3_id, 'SHIPPING', 'OPEN',
        'كيلو 21، بجوار قرية الشروق', 'العجمي', 'الإسكندرية', 31.0409, 29.7618,
        'شارع 9، بجوار جراند مول', 'المعادي', 'القاهرة', 29.9602, 31.2569,
        '{"weight": 15, "packageType": "مستندات", "quantity": 1, "fragile": false, "requiresCooling": false}',
        NOW() + INTERVAL '2 days', '14:00', 'EXACT', 'COD', 5000,
        'محمود علي', '+201034567890', 0, NOW() + INTERVAL '7 days',
        NOW(), NOW()
    ) RETURNING id INTO request3_id;

    -- Request 4: Intercity Ride - OPEN
    INSERT INTO "ServiceRequest" (
        id, "userId", "serviceType", status,
        "pickupAddress", "pickupCity", "pickupGov", "pickupLat", "pickupLng",
        "dropoffAddress", "dropoffCity", "dropoffGov", "dropoffLat", "dropoffLng",
        "rideDetails", "scheduledDate", "scheduledTime", flexibility, "paymentMethod",
        "customerName", "customerPhone", "budgetMin", "budgetMax", "quotesCount", "expiresAt",
        "createdAt", "updatedAt"
    ) VALUES (
        'req_' || substr(md5(random()::text), 1, 20),
        user4_id, 'INTERCITY_RIDE', 'OPEN',
        'ميدان تريومف، أمام سيتي ستارز', 'مصر الجديدة', 'القاهرة', 30.0729, 31.3452,
        'طريق الجونة، قرية أرابيلا', 'الغردقة', 'البحر الأحمر', 27.2579, 33.8116,
        '{"passengers": 4, "luggage": 3, "vehiclePreference": "SUV"}',
        NOW() + INTERVAL '7 days', '06:00', 'EXACT', 'CASH',
        'عمر حسن', '+201045678901', 1000, 1500, 0, NOW() + INTERVAL '7 days',
        NOW(), NOW()
    ) RETURNING id INTO request4_id;

    -- Request 5: Intercity Ride - QUOTED
    INSERT INTO "ServiceRequest" (
        id, "userId", "serviceType", status,
        "pickupAddress", "pickupCity", "pickupGov", "pickupLat", "pickupLng",
        "dropoffAddress", "dropoffCity", "dropoffGov", "dropoffLat", "dropoffLng",
        "rideDetails", "scheduledDate", "scheduledTime", flexibility, "paymentMethod",
        "customerName", "customerPhone", "quotesCount", "expiresAt",
        "createdAt", "updatedAt"
    ) VALUES (
        'req_' || substr(md5(random()::text), 1, 20),
        user5_id, 'INTERCITY_RIDE', 'QUOTED',
        'ميدان المساحة، برج الأطباء', 'الدقي', 'الجيزة', 30.0379, 31.2120,
        'قصر المنتزه، المدخل الرئيسي', 'المنتزه', 'الإسكندرية', 31.2865, 30.0119,
        '{"passengers": 2, "luggage": 2, "vehiclePreference": "SEDAN"}',
        NOW() + INTERVAL '4 days', '08:00', 'FLEXIBLE_HOURS', 'CASH',
        'نورهان محمد', '+201056789012', 4, NOW() + INTERVAL '7 days',
        NOW(), NOW()
    ) RETURNING id INTO request5_id;

    -- Request 6: Shipping - ACCEPTED
    INSERT INTO "ServiceRequest" (
        id, "userId", "serviceType", status,
        "pickupAddress", "pickupCity", "pickupGov", "pickupLat", "pickupLng",
        "dropoffAddress", "dropoffCity", "dropoffGov", "dropoffLat", "dropoffLng",
        "shippingDetails", "scheduledDate", flexibility, "paymentMethod",
        "customerName", "customerPhone", "budgetMax", "quotesCount", "expiresAt",
        "createdAt", "updatedAt"
    ) VALUES (
        'req_' || substr(md5(random()::text), 1, 20),
        user6_id, 'SHIPPING', 'ACCEPTED',
        'الحي الأول، فيلا 23', 'التجمع الخامس', 'القاهرة', 30.0084, 31.4270,
        'شارع التلفزيون، بجوار معبد الكرنك', 'الأقصر', 'الأقصر', 25.6872, 32.6396,
        '{"weight": 100, "packageType": "أجهزة منزلية", "quantity": 3, "fragile": true, "requiresCooling": false}',
        NOW() + INTERVAL '1 day', 'EXACT', 'CASH',
        'كريم سمير', '+201067890123', 1200, 5, NOW() + INTERVAL '7 days',
        NOW(), NOW()
    ) RETURNING id INTO request6_id;

    -- Request 7: Intercity Ride - IN_PROGRESS
    INSERT INTO "ServiceRequest" (
        id, "userId", "serviceType", status,
        "pickupAddress", "pickupCity", "pickupGov", "pickupLat", "pickupLng",
        "dropoffAddress", "dropoffCity", "dropoffGov", "dropoffLat", "dropoffLng",
        "rideDetails", "scheduledDate", "scheduledTime", flexibility, "paymentMethod",
        "customerName", "customerPhone", "quotesCount", "expiresAt",
        "createdAt", "updatedAt"
    ) VALUES (
        'req_' || substr(md5(random()::text), 1, 20),
        user7_id, 'INTERCITY_RIDE', 'IN_PROGRESS',
        'شارع 26 يوليو، برج النيل', 'الزمالك', 'القاهرة', 30.0609, 31.2234,
        'خليج نعمة، فندق هيلتون', 'شرم الشيخ', 'جنوب سيناء', 27.9158, 34.3300,
        '{"passengers": 3, "luggage": 4, "vehiclePreference": "SUV", "amenities": ["AC", "WIFI"]}',
        NOW(), '05:00', 'EXACT', 'CARD',
        'ياسمين علي', '+201078901234', 6, NOW() + INTERVAL '7 days',
        NOW(), NOW()
    ) RETURNING id INTO request7_id;

    -- Request 8: Shipping - COMPLETED
    INSERT INTO "ServiceRequest" (
        id, "userId", "serviceType", status,
        "pickupAddress", "pickupCity", "pickupGov", "pickupLat", "pickupLng",
        "dropoffAddress", "dropoffCity", "dropoffGov", "dropoffLat", "dropoffLng",
        "shippingDetails", "scheduledDate", flexibility, "paymentMethod",
        "customerName", "customerPhone", "quotesCount", "expiresAt",
        "createdAt", "updatedAt"
    ) VALUES (
        'req_' || substr(md5(random()::text), 1, 20),
        user8_id, 'SHIPPING', 'COMPLETED',
        'شارع ابو قير، عمارة 45', 'الإبراهيمية', 'الإسكندرية', 31.2156, 29.9553,
        'شارع طلعت حرب، برج الجزيرة', 'وسط البلد', 'القاهرة', 30.0444, 31.2357,
        '{"weight": 20, "packageType": "ملابس", "quantity": 10, "fragile": false, "requiresCooling": false}',
        NOW() - INTERVAL '5 days', 'FLEXIBLE_DAYS', 'CASH',
        'منى إبراهيم', '+201089012345', 2, NOW() - INTERVAL '2 days',
        NOW() - INTERVAL '7 days', NOW()
    ) RETURNING id INTO request8_id;

    -- Request 9: Intercity Ride - COMPLETED
    INSERT INTO "ServiceRequest" (
        id, "userId", "serviceType", status,
        "pickupAddress", "pickupCity", "pickupGov", "pickupLat", "pickupLng",
        "dropoffAddress", "dropoffCity", "dropoffGov", "dropoffLat", "dropoffLng",
        "rideDetails", "scheduledDate", flexibility, "paymentMethod",
        "customerName", "customerPhone", "quotesCount", "expiresAt",
        "createdAt", "updatedAt"
    ) VALUES (
        'req_' || substr(md5(random()::text), 1, 20),
        user9_id, 'INTERCITY_RIDE', 'COMPLETED',
        'الحي المتميز، مول مصر', 'أكتوبر', 'الجيزة', 29.9729, 30.9474,
        'كورنيش الميناء', 'مرسى مطروح', 'مطروح', 31.3543, 27.2373,
        '{"passengers": 5, "luggage": 5, "vehiclePreference": "MINIVAN"}',
        NOW() - INTERVAL '10 days', 'EXACT', 'CASH',
        'حسام الدين', '+201090123456', 3, NOW() - INTERVAL '5 days',
        NOW() - INTERVAL '12 days', NOW()
    ) RETURNING id INTO request9_id;

    -- Request 10: Shipping - COMPLETED (Large shipment)
    INSERT INTO "ServiceRequest" (
        id, "userId", "serviceType", status,
        "pickupAddress", "pickupCity", "pickupGov", "pickupLat", "pickupLng",
        "dropoffAddress", "dropoffCity", "dropoffGov", "dropoffLat", "dropoffLng",
        "shippingDetails", "scheduledDate", flexibility, "paymentMethod", "codAmount",
        "customerName", "customerPhone", "quotesCount", "expiresAt",
        "createdAt", "updatedAt"
    ) VALUES (
        'req_' || substr(md5(random()::text), 1, 20),
        user10_id, 'SHIPPING', 'COMPLETED',
        'شارع شبرا الرئيسي', 'شبرا', 'القاهرة', 30.0771, 31.2452,
        'شارع الجمهورية', 'أسيوط', 'أسيوط', 27.1809, 31.1837,
        '{"weight": 200, "packageType": "بضائع تجارية", "quantity": 20, "fragile": false, "requiresCooling": false}',
        NOW() - INTERVAL '15 days', 'FLEXIBLE_DAYS', 'COD', 15000,
        'تاجر الصعيد', '+201101234567', 4, NOW() - INTERVAL '10 days',
        NOW() - INTERVAL '17 days', NOW()
    ) RETURNING id INTO request10_id;

    -- Request 11: Shipping - CANCELLED
    INSERT INTO "ServiceRequest" (
        id, "userId", "serviceType", status,
        "pickupAddress", "pickupCity", "pickupGov", "pickupLat", "pickupLng",
        "dropoffAddress", "dropoffCity", "dropoffGov", "dropoffLat", "dropoffLng",
        "shippingDetails", "scheduledDate", flexibility, "paymentMethod",
        "customerName", "customerPhone", "quotesCount", "expiresAt",
        "createdAt", "updatedAt"
    ) VALUES (
        'req_' || substr(md5(random()::text), 1, 20),
        user1_id, 'SHIPPING', 'CANCELLED',
        'ميدان رمسيس', 'وسط البلد', 'القاهرة', 30.0626, 31.2469,
        'محطة مصر', 'الإسكندرية', 'الإسكندرية', 31.1923, 29.8985,
        '{"weight": 5, "packageType": "طرد صغير", "quantity": 1, "fragile": false, "requiresCooling": false}',
        NOW() - INTERVAL '3 days', 'FLEXIBLE_HOURS', 'CASH',
        'أحمد محمد', '+201012345678', 1, NOW() - INTERVAL '1 day',
        NOW() - INTERVAL '5 days', NOW()
    ) RETURNING id INTO request11_id;

    -- =====================================================
    -- 4. SERVICE QUOTES - عروض الأسعار
    -- =====================================================

    -- Quotes for Request 2 (QUOTED - Shipping)
    INSERT INTO "ServiceQuote" (id, "requestId", "providerId", status, price, currency, "priceBreakdown", "vehicleType", "estimatedDuration", "estimatedArrival", notes, "validUntil", "createdAt", "updatedAt")
    VALUES
        ('quote_' || substr(md5(random()::text), 1, 18), request2_id, provider1_id, 'PENDING', 450, 'EGP', '{"basePrice": 350, "distanceCharge": 80, "extras": [{"name": "تأمين", "price": 20}]}', 'VAN', 180, NOW() + INTERVAL '5 days 3 hours', 'تأمين شامل على الشحنة. توصيل حتى باب المنزل.', NOW() + INTERVAL '1 day', NOW(), NOW()),
        ('quote_' || substr(md5(random()::text), 1, 18), request2_id, provider3_id, 'PENDING', 380, 'EGP', '{"basePrice": 300, "distanceCharge": 80}', 'PICKUP', 200, NOW() + INTERVAL '5 days 4 hours', 'سرعة في التوصيل', NOW() + INTERVAL '1 day', NOW(), NOW()),
        ('quote_' || substr(md5(random()::text), 1, 18), request2_id, provider6_id, 'PENDING', 420, 'EGP', '{"basePrice": 340, "distanceCharge": 80}', 'PICKUP', 190, NOW() + INTERVAL '5 days 3.5 hours', 'خدمة ممتازة وسائق محترف', NOW() + INTERVAL '1 day', NOW(), NOW());

    -- Quotes for Request 5 (QUOTED - Ride)
    INSERT INTO "ServiceQuote" (id, "requestId", "providerId", status, price, currency, "priceBreakdown", "vehicleType", "estimatedDuration", "estimatedArrival", notes, "validUntil", "createdAt", "updatedAt")
    VALUES
        ('quote_' || substr(md5(random()::text), 1, 18), request5_id, provider2_id, 'PENDING', 650, 'EGP', '{"basePrice": 550, "distanceCharge": 100}', 'SEDAN', 150, NOW() + INTERVAL '4 days 2.5 hours', 'سيارة مكيفة ومريحة', NOW() + INTERVAL '1 day', NOW(), NOW()),
        ('quote_' || substr(md5(random()::text), 1, 18), request5_id, provider4_id, 'PENDING', 700, 'EGP', '{"basePrice": 580, "distanceCharge": 100, "extras": [{"name": "مياه", "price": 20}]}', 'SEDAN', 140, NOW() + INTERVAL '4 days 2 hours', 'واي فاي مجاني ومياه', NOW() + INTERVAL '1 day', NOW(), NOW()),
        ('quote_' || substr(md5(random()::text), 1, 18), request5_id, provider7_id, 'PENDING', 600, 'EGP', '{"basePrice": 500, "distanceCharge": 100}', 'SEDAN', 160, NOW() + INTERVAL '4 days 3 hours', 'سائق محترف وملتزم بالمواعيد', NOW() + INTERVAL '1 day', NOW(), NOW()),
        ('quote_' || substr(md5(random()::text), 1, 18), request5_id, provider10_id, 'PENDING', 750, 'EGP', '{"basePrice": 620, "distanceCharge": 100, "extras": [{"name": "SUV", "price": 30}]}', 'SUV', 145, NOW() + INTERVAL '4 days 2.5 hours', 'سيارة SUV فاخرة', NOW() + INTERVAL '1 day', NOW(), NOW());

    -- Quotes for Request 6 (ACCEPTED - one accepted)
    INSERT INTO "ServiceQuote" (id, "requestId", "providerId", status, price, currency, "priceBreakdown", "vehicleType", "estimatedDuration", "estimatedArrival", notes, "validUntil", "createdAt", "updatedAt")
    VALUES
        ('quote_' || substr(md5(random()::text), 1, 18), request6_id, provider1_id, 'ACCEPTED', 950, 'EGP', '{"basePrice": 750, "distanceCharge": 150, "extras": [{"name": "تأمين شامل", "price": 50}]}', 'TRUCK_MEDIUM', 480, NOW() + INTERVAL '1 day 8 hours', 'تأمين شامل وضمان وصول سليم', NOW() + INTERVAL '1 day', NOW(), NOW()),
        ('quote_' || substr(md5(random()::text), 1, 18), request6_id, provider5_id, 'REJECTED', 1100, 'EGP', '{"basePrice": 900, "distanceCharge": 200}', 'TRUCK_MEDIUM', 450, NOW() + INTERVAL '1 day 7.5 hours', 'توصيل سريع', NOW() + INTERVAL '1 day', NOW(), NOW()),
        ('quote_' || substr(md5(random()::text), 1, 18), request6_id, provider2_id, 'REJECTED', 1050, 'EGP', '{"basePrice": 850, "distanceCharge": 200}', 'TRUCK_MEDIUM', 460, NOW() + INTERVAL '1 day 7.5 hours', 'خدمة موثوقة', NOW() + INTERVAL '1 day', NOW(), NOW());

    -- Quotes for Request 7 (IN_PROGRESS - one accepted)
    INSERT INTO "ServiceQuote" (id, "requestId", "providerId", status, price, currency, "priceBreakdown", "vehicleType", "estimatedDuration", "estimatedArrival", notes, "validUntil", "createdAt", "updatedAt")
    VALUES
        ('quote_' || substr(md5(random()::text), 1, 18), request7_id, provider4_id, 'ACCEPTED', 1800, 'EGP', '{"basePrice": 1500, "distanceCharge": 250, "extras": [{"name": "واي فاي", "price": 50}]}', 'SUV', 360, NOW() + INTERVAL '6 hours', 'SUV فاخر مع واي فاي', NOW() + INTERVAL '1 day', NOW(), NOW()),
        ('quote_' || substr(md5(random()::text), 1, 18), request7_id, provider2_id, 'REJECTED', 2000, 'EGP', '{"basePrice": 1700, "distanceCharge": 300}', 'SUV', 350, NOW() + INTERVAL '5.5 hours', 'خدمة VIP', NOW() + INTERVAL '1 day', NOW(), NOW());

    -- Quotes for Completed Requests
    INSERT INTO "ServiceQuote" (id, "requestId", "providerId", status, price, currency, "priceBreakdown", "vehicleType", "estimatedDuration", "estimatedArrival", notes, "validUntil", rating, review, "createdAt", "updatedAt")
    VALUES
        ('quote_' || substr(md5(random()::text), 1, 18), request8_id, provider3_id, 'ACCEPTED', 280, 'EGP', '{"basePrice": 220, "distanceCharge": 60}', 'VAN', 180, NOW() - INTERVAL '5 days', 'توصيل سريع', NOW() - INTERVAL '6 days', 5, 'خدمة ممتازة وسريعة!', NOW() - INTERVAL '7 days', NOW()),
        ('quote_' || substr(md5(random()::text), 1, 18), request9_id, provider4_id, 'ACCEPTED', 1200, 'EGP', '{"basePrice": 1000, "distanceCharge": 200}', 'MINIVAN', 300, NOW() - INTERVAL '10 days', 'رحلة مريحة', NOW() - INTERVAL '11 days', 4.5, 'سائق محترم والسيارة نظيفة', NOW() - INTERVAL '12 days', NOW()),
        ('quote_' || substr(md5(random()::text), 1, 18), request10_id, provider1_id, 'ACCEPTED', 1800, 'EGP', '{"basePrice": 1500, "distanceCharge": 250, "extras": [{"name": "تحميل وتنزيل", "price": 50}]}', 'TRUCK_LARGE', 540, NOW() - INTERVAL '15 days', 'نقل بضائع تجارية', NOW() - INTERVAL '16 days', 5, 'شركة محترمة جداً وملتزمة', NOW() - INTERVAL '17 days', NOW());

    -- =====================================================
    -- 5. NOTIFICATIONS - الإشعارات
    -- =====================================================

    INSERT INTO "MarketplaceNotification" (id, "userId", type, title, "titleAr", message, "messageAr", "isRead", "createdAt")
    VALUES
        -- Notifications for User 1
        ('notif_' || substr(md5(random()::text), 1, 18), user1_id, 'NEW_QUOTE', 'New Quote Received', 'عرض سعر جديد', 'You received a new quote for your shipping request', 'استلمت عرض سعر جديد بقيمة 450 ج.م', false, NOW() - INTERVAL '1 hour'),
        ('notif_' || substr(md5(random()::text), 1, 18), user1_id, 'ORDER_UPDATE', 'Order Status Updated', 'تحديث الطلب', 'Your order status has been updated', 'تم تحديث حالة طلبك إلى: جاري التنفيذ', true, NOW() - INTERVAL '2 days'),

        -- Notifications for User 2
        ('notif_' || substr(md5(random()::text), 1, 18), user2_id, 'NEW_QUOTE', 'New Quote Received', 'عرض سعر جديد', 'You received 3 new quotes', 'استلمت 3 عروض أسعار جديدة', false, NOW() - INTERVAL '30 minutes'),

        -- Notifications for Providers
        ('notif_' || substr(md5(random()::text), 1, 18), user3_id, 'NEW_REQUEST', 'New Request in Your Area', 'طلب جديد في منطقتك', 'New shipping request from Alexandria to Cairo', 'طلب شحن جديد من الإسكندرية إلى القاهرة', false, NOW() - INTERVAL '2 hours'),
        ('notif_' || substr(md5(random()::text), 1, 18), user4_id, 'QUOTE_ACCEPTED', 'Quote Accepted!', 'تم قبول عرضك', 'Congratulations! Your quote has been accepted', 'تهانينا! تم قبول عرضك لطلب الرحلة', true, NOW() - INTERVAL '1 day'),
        ('notif_' || substr(md5(random()::text), 1, 18), user5_id, 'NEW_REQUEST', 'New Request Available', 'طلب جديد متاح', 'New intercity ride request to Red Sea', 'طلب رحلة جديد إلى البحر الأحمر', false, NOW() - INTERVAL '3 hours'),
        ('notif_' || substr(md5(random()::text), 1, 18), user6_id, 'QUOTE_REJECTED', 'Quote Declined', 'تم رفض عرضك', 'Your quote was not accepted', 'للأسف تم رفض عرضك لهذا الطلب', true, NOW() - INTERVAL '2 days'),
        ('notif_' || substr(md5(random()::text), 1, 18), user7_id, 'NEW_REQUEST', 'New Request in Your Area', 'طلب جديد في منطقتك', 'New ride request from Cairo to Alexandria', 'طلب رحلة جديد من القاهرة إلى الإسكندرية', false, NOW() - INTERVAL '4 hours');

    RAISE NOTICE '✅ Transport Marketplace data seeded successfully!';
    RAISE NOTICE '👥 Created 10 Service Providers (2 Companies, 3 Small Businesses, 5 Individuals)';
    RAISE NOTICE '🚛 Created 22 Provider Vehicles';
    RAISE NOTICE '📋 Created 11 Service Requests (6 Shipping, 5 Rides)';
    RAISE NOTICE '💬 Created 14 Quotes';
    RAISE NOTICE '🔔 Created 8 Notifications';

END $$;

-- =====================================================
-- SUMMARY QUERIES - استعلامات التحقق
-- =====================================================

-- Check providers count by type
SELECT
    type,
    COUNT(*) as count,
    ROUND(AVG(rating), 2) as avg_rating,
    SUM("completedOrders") as total_orders
FROM "ServiceProvider"
GROUP BY type
ORDER BY count DESC;

-- Check requests by status
SELECT
    "serviceType",
    status,
    COUNT(*) as count
FROM "ServiceRequest"
GROUP BY "serviceType", status
ORDER BY "serviceType", status;

-- Check quotes by status
SELECT
    status,
    COUNT(*) as count,
    ROUND(AVG(price), 2) as avg_price
FROM "ServiceQuote"
GROUP BY status
ORDER BY count DESC;
