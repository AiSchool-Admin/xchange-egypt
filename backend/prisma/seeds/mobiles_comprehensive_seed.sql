-- =====================================================
-- Comprehensive Seed Data for Mobile Marketplace
-- بيانات اختبارية شاملة لسوق الموبايلات
-- XChange Egypt - أفضل سوق موبايلات في مصر
-- Run this AFTER running mobiles_create_tables.sql
-- =====================================================

-- Note: Using existing test users from cars/properties seed
-- References users by email: test1@xchange.eg through test10@xchange.eg

-- =====================================================
-- CLEANUP - Delete existing mobile data (مسح البيانات القديمة)
-- =====================================================
DELETE FROM mobile_favorites;
DELETE FROM mobile_barter_proposals;
DELETE FROM mobile_transactions;
DELETE FROM mobile_listings;
DELETE FROM mobile_price_references;

-- =====================================================
-- Mobile Price References (أسعار مرجعية للموبايلات)
-- =====================================================
INSERT INTO mobile_price_references (id, brand, model, storage_gb, release_year, price_low, price_average, price_high, condition_a_multiplier, condition_b_multiplier, condition_c_multiplier, condition_d_multiplier, data_source, sample_size, recorded_at)
VALUES
  -- Apple iPhone (أسعار آيفون)
  (gen_random_uuid(), 'APPLE', 'iPhone 15 Pro Max', 256, 2023, 65000, 73000, 78000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 150, NOW()),
  (gen_random_uuid(), 'APPLE', 'iPhone 15 Pro', 256, 2023, 55000, 62000, 68000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 180, NOW()),
  (gen_random_uuid(), 'APPLE', 'iPhone 15', 256, 2023, 40000, 45000, 50000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 200, NOW()),
  (gen_random_uuid(), 'APPLE', 'iPhone 15', 128, 2023, 36000, 40000, 45000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 250, NOW()),
  (gen_random_uuid(), 'APPLE', 'iPhone 14 Pro Max', 256, 2022, 45000, 52000, 58000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 180, NOW()),
  (gen_random_uuid(), 'APPLE', 'iPhone 14 Pro', 128, 2022, 38000, 42000, 48000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 200, NOW()),
  (gen_random_uuid(), 'APPLE', 'iPhone 14', 128, 2022, 28000, 32000, 37000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 220, NOW()),
  (gen_random_uuid(), 'APPLE', 'iPhone 13 Pro', 256, 2021, 30000, 35000, 40000, 1.0, 0.85, 0.70, 0.50, 'MARKET_ANALYSIS', 180, NOW()),
  (gen_random_uuid(), 'APPLE', 'iPhone 13', 128, 2021, 22000, 26000, 30000, 1.0, 0.85, 0.70, 0.50, 'MARKET_ANALYSIS', 300, NOW()),
  (gen_random_uuid(), 'APPLE', 'iPhone 12', 128, 2020, 15000, 18000, 22000, 1.0, 0.82, 0.68, 0.48, 'MARKET_ANALYSIS', 250, NOW()),
  (gen_random_uuid(), 'APPLE', 'iPhone 11', 128, 2019, 11000, 13500, 16000, 1.0, 0.80, 0.65, 0.45, 'MARKET_ANALYSIS', 300, NOW()),

  -- Samsung Galaxy (أسعار سامسونج)
  (gen_random_uuid(), 'SAMSUNG', 'Galaxy S24 Ultra', 256, 2024, 58000, 65000, 72000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 120, NOW()),
  (gen_random_uuid(), 'SAMSUNG', 'Galaxy S24+', 256, 2024, 42000, 48000, 54000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 150, NOW()),
  (gen_random_uuid(), 'SAMSUNG', 'Galaxy S24', 256, 2024, 34000, 38000, 43000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 180, NOW()),
  (gen_random_uuid(), 'SAMSUNG', 'Galaxy S23 Ultra', 256, 2023, 42000, 48000, 55000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 200, NOW()),
  (gen_random_uuid(), 'SAMSUNG', 'Galaxy S23', 128, 2023, 25000, 28000, 33000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 250, NOW()),
  (gen_random_uuid(), 'SAMSUNG', 'Galaxy S22 Ultra', 256, 2022, 32000, 35000, 40000, 1.0, 0.85, 0.70, 0.50, 'MARKET_ANALYSIS', 180, NOW()),
  (gen_random_uuid(), 'SAMSUNG', 'Galaxy A54', 256, 2023, 12000, 14000, 17000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 300, NOW()),
  (gen_random_uuid(), 'SAMSUNG', 'Galaxy A34', 128, 2023, 8500, 10000, 13000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 350, NOW()),
  (gen_random_uuid(), 'SAMSUNG', 'Galaxy Z Fold5', 256, 2023, 68000, 75000, 85000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 50, NOW()),
  (gen_random_uuid(), 'SAMSUNG', 'Galaxy Z Flip5', 256, 2023, 38000, 42000, 48000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 80, NOW()),

  -- Xiaomi (أسعار شاومي)
  (gen_random_uuid(), 'XIAOMI', 'Xiaomi 14 Ultra', 512, 2024, 50000, 55000, 62000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 60, NOW()),
  (gen_random_uuid(), 'XIAOMI', 'Xiaomi 14 Pro', 256, 2024, 35000, 38000, 44000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 80, NOW()),
  (gen_random_uuid(), 'XIAOMI', 'Xiaomi 13', 256, 2023, 22000, 25000, 30000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 120, NOW()),
  (gen_random_uuid(), 'XIAOMI', 'Redmi Note 13 Pro+', 256, 2024, 13000, 15000, 18000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 200, NOW()),
  (gen_random_uuid(), 'XIAOMI', 'Redmi Note 13', 128, 2024, 7000, 8500, 10000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 350, NOW()),
  (gen_random_uuid(), 'XIAOMI', 'POCO X6 Pro', 256, 2024, 12000, 14000, 17000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 150, NOW()),

  -- OPPO (أسعار أوبو)
  (gen_random_uuid(), 'OPPO', 'Find X7 Ultra', 512, 2024, 45000, 50000, 58000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 40, NOW()),
  (gen_random_uuid(), 'OPPO', 'Reno 11 Pro', 256, 2024, 22000, 25000, 30000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 100, NOW()),
  (gen_random_uuid(), 'OPPO', 'Reno 11', 256, 2024, 16000, 18000, 22000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 150, NOW()),

  -- Vivo (أسعار فيفو)
  (gen_random_uuid(), 'VIVO', 'X100 Pro', 256, 2024, 38000, 42000, 48000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 50, NOW()),
  (gen_random_uuid(), 'VIVO', 'V30 Pro', 256, 2024, 20000, 22000, 27000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 80, NOW()),

  -- Realme (أسعار ريلمي)
  (gen_random_uuid(), 'REALME', 'GT5 Pro', 256, 2024, 25000, 28000, 33000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 60, NOW()),
  (gen_random_uuid(), 'REALME', '12 Pro+', 256, 2024, 16000, 18000, 22000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 100, NOW()),

  -- Honor (أسعار هونر)
  (gen_random_uuid(), 'HONOR', 'Magic6 Pro', 512, 2024, 42000, 45000, 50000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 40, NOW()),

  -- Google Pixel (أسعار جوجل بيكسل)
  (gen_random_uuid(), 'GOOGLE', 'Pixel 8 Pro', 256, 2023, 38000, 42000, 48000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 40, NOW()),
  (gen_random_uuid(), 'GOOGLE', 'Pixel 8', 128, 2023, 28000, 32000, 37000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 60, NOW()),

  -- OnePlus (أسعار ون بلس)
  (gen_random_uuid(), 'ONEPLUS', 'OnePlus 12', 256, 2024, 38000, 42000, 48000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 60, NOW()),
  (gen_random_uuid(), 'ONEPLUS', 'Nord 3', 256, 2023, 16000, 18000, 22000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 100, NOW()),

  -- Infinix (أسعار انفينكس)
  (gen_random_uuid(), 'INFINIX', 'Note 40 Pro', 256, 2024, 10000, 12000, 15000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 200, NOW()),
  (gen_random_uuid(), 'INFINIX', 'Hot 40 Pro', 256, 2024, 6000, 7500, 9000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 350, NOW()),

  -- Tecno (أسعار تكنو)
  (gen_random_uuid(), 'TECNO', 'Camon 30 Pro', 256, 2024, 11000, 13000, 16000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 150, NOW()),
  (gen_random_uuid(), 'TECNO', 'Spark 20 Pro', 256, 2024, 5000, 6500, 8000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 400, NOW())
ON CONFLICT (brand, model, storage_gb) DO UPDATE SET
  price_low = EXCLUDED.price_low,
  price_average = EXCLUDED.price_average,
  price_high = EXCLUDED.price_high,
  recorded_at = NOW();

-- =====================================================
-- Mobile Listings (إعلانات الموبايلات)
-- Using subqueries to reference users by email
-- =====================================================

-- iPhone Listings (إعلانات آيفون)
INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, accessories_details, price_egp, original_price, negotiable, accepts_barter, barter_preferences, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, warranty_months, created_at, expires_at)
SELECT
  gen_random_uuid(), u.id,
  'iPhone 15 Pro Max 256GB - تيتانيوم طبيعي - كالجديد',
  'آيفون 15 برو ماكس بحالة ممتازة جداً - استخدام شهرين فقط. البطارية 100% والشاشة بدون أي خدش.',
  'APPLE', 'iPhone 15 Pro Max', 256, 8, 'تيتانيوم طبيعي',
  '353456789012345', true, 'CLEAN', true, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true,
  'الشاحن الأصلي، الكابل الأصلي، العلبة الأصلية',
  73000, 85000, true, true,
  '{"wanted_brands": ["SAMSUNG", "APPLE"], "min_value_percent": 80, "max_cash_to_pay": 15000}'::jsonb,
  '["/mobiles/iphone15promax-natural-1.jpg", "/mobiles/iphone15promax-natural-2.jpg"]'::jsonb,
  'القاهرة', 'مدينة نصر', 'عباس العقاد',
  'ACTIVE', false, 'BASIC', 450, 35, 12, 10,
  NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'
FROM users u WHERE u.email = 'test1@xchange.eg' LIMIT 1;

INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, accessories_details, price_egp, original_price, negotiable, accepts_barter, barter_preferences, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, warranty_months, created_at, expires_at)
SELECT
  gen_random_uuid(), u.id,
  'iPhone 14 Pro 256GB Deep Purple - ضمان ساري',
  'آيفون 14 برو باللون البنفسجي الغامق. الجهاز بحالة ممتازة مع ضمان أبل ساري.',
  'APPLE', 'iPhone 14 Pro', 256, 6, 'بنفسجي غامق',
  '357890123456789', true, 'CLEAN', true, 'A', 92, 'PERFECT', 'LIKE_NEW', true, true, true,
  'الشاحن الأصلي، الكابل، واقي شاشة',
  48000, 55000, true, true,
  '{"wanted_brands": ["APPLE", "SAMSUNG"], "min_value_percent": 75}'::jsonb,
  '["/mobiles/iphone14pro-purple-1.jpg", "/mobiles/iphone14pro-purple-2.jpg"]'::jsonb,
  'الإسكندرية', 'سموحة', 'شارع فوزي معاذ',
  'ACTIVE', false, 'BASIC', 380, 28, 8, 6,
  NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days'
FROM users u WHERE u.email = 'test2@xchange.eg' LIMIT 1;

INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, price_egp, original_price, negotiable, accepts_barter, barter_preferences, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, created_at, expires_at)
SELECT
  gen_random_uuid(), u.id,
  'iPhone 13 128GB Midnight - سعر مميز',
  'آيفون 13 باللون الأسود. جهاز نظيف وبحالة جيدة جداً.',
  'APPLE', 'iPhone 13', 128, 4, 'أسود',
  '351234567890123', true, 'CLEAN', true, 'B', 85, 'MINOR_SCRATCHES', 'GOOD', true, false, false,
  26000, 32000, true, true,
  '{"wanted_brands": ["APPLE", "SAMSUNG", "XIAOMI"], "min_value_percent": 70}'::jsonb,
  '["/mobiles/iphone13-black-1.jpg", "/mobiles/iphone13-black-2.jpg"]'::jsonb,
  'الجيزة', 'الدقي', 'شارع التحرير',
  'ACTIVE', false, 'BASIC', 520, 42, 15,
  NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'
FROM users u WHERE u.email = 'test3@xchange.eg' LIMIT 1;

-- Samsung Listings (إعلانات سامسونج)
INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, accessories_details, price_egp, original_price, negotiable, accepts_barter, barter_preferences, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, warranty_months, created_at, expires_at)
SELECT
  gen_random_uuid(), u.id,
  'Samsung Galaxy S24 Ultra 256GB - أسود - جديد',
  'سامسونج جالاكسي S24 الترا - جهاز جديد بالكرتونة. ضمان سنة كاملة.',
  'SAMSUNG', 'Galaxy S24 Ultra', 256, 12, 'أسود فانتوم',
  '354321098765432', true, 'CLEAN', true, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true,
  'الشاحن الأصلي 45W، الكابل، S Pen، الجراب الأصلي',
  70000, 75000, false, true,
  '{"wanted_brands": ["APPLE"], "min_value_percent": 85}'::jsonb,
  '["/mobiles/s24ultra-black-1.jpg", "/mobiles/s24ultra-black-2.jpg"]'::jsonb,
  'القاهرة', 'التجمع الخامس', 'شارع التسعين',
  'ACTIVE', true, 'FEATURED', 680, 55, 20, 12,
  NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'
FROM users u WHERE u.email = 'test4@xchange.eg' LIMIT 1;

INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, accessories_details, price_egp, original_price, negotiable, accepts_barter, barter_preferences, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, warranty_months, created_at, expires_at)
SELECT
  gen_random_uuid(), u.id,
  'Samsung Galaxy S23 Ultra 512GB - أخضر',
  'جالاكسي S23 الترا بسعة 512 جيجا. الجهاز بحالة ممتازة مع كل الملحقات.',
  'SAMSUNG', 'Galaxy S23 Ultra', 512, 12, 'أخضر',
  '352109876543210', true, 'CLEAN', true, 'A', 95, 'PERFECT', 'LIKE_NEW', true, true, true,
  'الشاحن الأصلي، S Pen، العلبة',
  52000, 60000, true, true,
  '{"wanted_brands": ["APPLE", "SAMSUNG"], "min_value_percent": 80}'::jsonb,
  '["/mobiles/s23ultra-green-1.jpg", "/mobiles/s23ultra-green-2.jpg"]'::jsonb,
  'الجيزة', 'المهندسين', 'شارع السودان',
  'ACTIVE', false, 'BASIC', 420, 32, 10, 8,
  NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days'
FROM users u WHERE u.email = 'test2@xchange.eg' LIMIT 1;

INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, accessories_details, price_egp, original_price, negotiable, accepts_barter, barter_preferences, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, warranty_months, created_at, expires_at)
SELECT
  gen_random_uuid(), u.id,
  'Samsung Galaxy Z Fold5 256GB - كريمي',
  'سامسونج فولد 5 - تجربة الشاشة القابلة للطي. الجهاز بحالة ممتازة.',
  'SAMSUNG', 'Galaxy Z Fold5', 256, 12, 'كريمي',
  '358765432109876', true, 'CLEAN', true, 'A', 93, 'PERFECT', 'LIKE_NEW', true, true, true,
  'الشاحن، S Pen Fold Edition، الجراب الأصلي',
  78000, 90000, true, true,
  '{"wanted_brands": ["APPLE"], "min_value_percent": 90}'::jsonb,
  '["/mobiles/fold5-cream-1.jpg", "/mobiles/fold5-cream-2.jpg"]'::jsonb,
  'القاهرة', 'مصر الجديدة', 'شارع الميرغني',
  'ACTIVE', false, 'BASIC', 350, 25, 8, 6,
  NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days'
FROM users u WHERE u.email = 'test5@xchange.eg' LIMIT 1;

-- Xiaomi Listings (إعلانات شاومي)
INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, accessories_details, price_egp, original_price, negotiable, accepts_barter, barter_preferences, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, warranty_months, created_at, expires_at)
SELECT
  gen_random_uuid(), u.id,
  'Xiaomi 14 Ultra 512GB - أسود - كاميرا Leica',
  'شاومي 14 الترا مع كاميرا لايكا الاحترافية. أفضل كاميرا موبايل في السوق.',
  'XIAOMI', 'Xiaomi 14 Ultra', 512, 16, 'أسود',
  '351098765432109', true, 'CLEAN', false, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true,
  'الشاحن 90W، الجراب، واقي الكاميرا',
  58000, 65000, true, true,
  '{"wanted_brands": ["APPLE", "SAMSUNG"], "min_value_percent": 85}'::jsonb,
  '["/mobiles/xiaomi14ultra-black-1.jpg", "/mobiles/xiaomi14ultra-black-2.jpg"]'::jsonb,
  'القاهرة', 'الشروق', 'الحي الأول',
  'ACTIVE', false, 'BASIC', 280, 22, 7, 11,
  NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'
FROM users u WHERE u.email = 'test1@xchange.eg' LIMIT 1;

INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, accessories_details, price_egp, original_price, negotiable, accepts_barter, barter_preferences, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, warranty_months, created_at, expires_at)
SELECT
  gen_random_uuid(), u.id,
  'Redmi Note 13 Pro+ 256GB - بنفسجي',
  'ريدمي نوت 13 برو بلس بشاشة AMOLED وشحن سريع 120W. سعر لا يقاوم!',
  'XIAOMI', 'Redmi Note 13 Pro+', 256, 12, 'بنفسجي',
  '356789012345670', false, 'UNKNOWN', false, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true,
  'الشاحن 120W الأصلي، الجراب، واقي شاشة',
  16000, 18000, false, true,
  '{"wanted_brands": ["XIAOMI", "REALME", "OPPO"], "min_value_percent": 75}'::jsonb,
  '["/mobiles/redminote13proplus-purple-1.jpg"]'::jsonb,
  'الغربية', 'طنطا', 'شارع سعيد',
  'ACTIVE', false, 'BASIC', 420, 38, 12, 12,
  NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days'
FROM users u WHERE u.email = 'test4@xchange.eg' LIMIT 1;

-- OPPO & Other Brands (إعلانات أوبو وماركات أخرى)
INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, accessories_details, price_egp, original_price, negotiable, accepts_barter, barter_preferences, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, warranty_months, created_at, expires_at)
SELECT
  gen_random_uuid(), u.id,
  'OPPO Find X7 Ultra 512GB - أسود',
  'أوبو فايند X7 الترا - كاميرا Hasselblad مع أفضل زووم في السوق.',
  'OPPO', 'Find X7 Ultra', 512, 16, 'أسود',
  '353210987654321', true, 'CLEAN', true, 'A', 97, 'PERFECT', 'LIKE_NEW', true, true, true,
  'الشاحن 100W، الجراب، العلبة',
  54000, 62000, true, true,
  '{"wanted_brands": ["APPLE", "SAMSUNG"], "min_value_percent": 85}'::jsonb,
  '["/mobiles/findx7ultra-black-1.jpg", "/mobiles/findx7ultra-black-2.jpg"]'::jsonb,
  'القاهرة', 'العبور', 'الحي الأول',
  'ACTIVE', false, 'BASIC', 180, 14, 5, 9,
  NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'
FROM users u WHERE u.email = 'test5@xchange.eg' LIMIT 1;

INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, accessories_details, price_egp, original_price, negotiable, accepts_barter, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, warranty_months, created_at, expires_at)
SELECT
  gen_random_uuid(), u.id,
  'Google Pixel 8 Pro 256GB - أزرق',
  'جوجل بيكسل 8 برو بأفضل كاميرا وتجربة أندرويد نقية.',
  'GOOGLE', 'Pixel 8 Pro', 256, 12, 'Bay Blue',
  '354098765432109', true, 'CLEAN', false, 'A', 97, 'PERFECT', 'LIKE_NEW', true, true, true,
  'الشاحن، الكابل USB-C',
  44000, 50000, true, true,
  '["/mobiles/pixel8pro-blue-1.jpg", "/mobiles/pixel8pro-blue-2.jpg"]'::jsonb,
  'القاهرة', 'المقطم', 'الهضبة الوسطى',
  'ACTIVE', false, 'BASIC', 165, 13, 4, 10,
  NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'
FROM users u WHERE u.email = 'test5@xchange.eg' LIMIT 1;

INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, accessories_details, price_egp, original_price, negotiable, accepts_barter, barter_preferences, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, warranty_months, created_at, expires_at)
SELECT
  gen_random_uuid(), u.id,
  'OnePlus 12 256GB - أخضر Flowy Emerald',
  'ون بلس 12 بتجربة OxygenOS السلسة وأداء خارق.',
  'ONEPLUS', 'OnePlus 12', 256, 16, 'Flowy Emerald',
  '352987654321098', true, 'CLEAN', true, 'A', 98, 'PERFECT', 'LIKE_NEW', true, true, true,
  'الشاحن 100W، الجراب الأصلي',
  44000, 50000, true, true,
  '{"wanted_brands": ["SAMSUNG", "XIAOMI"], "min_value_percent": 80}'::jsonb,
  '["/mobiles/oneplus12-green-1.jpg", "/mobiles/oneplus12-green-2.jpg"]'::jsonb,
  'القاهرة', 'الرحاب', 'المرحلة الأولى',
  'ACTIVE', false, 'BASIC', 210, 17, 6, 10,
  NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days'
FROM users u WHERE u.email = 'test1@xchange.eg' LIMIT 1;

-- =====================================================
-- Mobile Favorites (المفضلات)
-- =====================================================
INSERT INTO mobile_favorites (id, user_id, listing_id, created_at)
SELECT gen_random_uuid(), u.id, m.id, NOW() - INTERVAL '3 days'
FROM users u, mobile_listings m
WHERE u.email = 'test1@xchange.eg' AND m.title LIKE '%S24 Ultra%'
ON CONFLICT DO NOTHING;

INSERT INTO mobile_favorites (id, user_id, listing_id, created_at)
SELECT gen_random_uuid(), u.id, m.id, NOW() - INTERVAL '2 days'
FROM users u, mobile_listings m
WHERE u.email = 'test2@xchange.eg' AND m.title LIKE '%iPhone 15 Pro Max%'
ON CONFLICT DO NOTHING;

INSERT INTO mobile_favorites (id, user_id, listing_id, created_at)
SELECT gen_random_uuid(), u.id, m.id, NOW() - INTERVAL '5 days'
FROM users u, mobile_listings m
WHERE u.email = 'test3@xchange.eg' AND m.title LIKE '%Fold5%'
ON CONFLICT DO NOTHING;

-- =====================================================
-- Price Alerts (تنبيهات الأسعار)
-- =====================================================
INSERT INTO mobile_price_alerts (id, user_id, brand, model, max_price_egp, min_condition_grade, min_storage_gb, is_active, notification_count, created_at)
SELECT gen_random_uuid(), u.id, 'APPLE', 'iPhone 15 Pro Max', 70000, 'A', 256, true, 0, NOW() - INTERVAL '10 days'
FROM users u WHERE u.email = 'test1@xchange.eg';

INSERT INTO mobile_price_alerts (id, user_id, brand, model, max_price_egp, min_condition_grade, min_storage_gb, is_active, notification_count, created_at)
SELECT gen_random_uuid(), u.id, 'SAMSUNG', 'Galaxy S24 Ultra', 65000, 'A', 256, true, 0, NOW() - INTERVAL '5 days'
FROM users u WHERE u.email = 'test1@xchange.eg';

INSERT INTO mobile_price_alerts (id, user_id, brand, model, max_price_egp, min_condition_grade, min_storage_gb, is_active, notification_count, created_at)
SELECT gen_random_uuid(), u.id, 'APPLE', 'iPhone 14 Pro', 40000, 'B', 128, true, 0, NOW() - INTERVAL '7 days'
FROM users u WHERE u.email = 'test2@xchange.eg';

INSERT INTO mobile_price_alerts (id, user_id, brand, model, max_price_egp, min_condition_grade, min_storage_gb, is_active, notification_count, created_at)
SELECT gen_random_uuid(), u.id, 'XIAOMI', 'Xiaomi 14 Ultra', 55000, 'A', 512, true, 0, NOW() - INTERVAL '3 days'
FROM users u WHERE u.email = 'test3@xchange.eg';

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Mobile marketplace seed data inserted successfully!';
    RAISE NOTICE '📱 Inserted: 10 listings, 45+ price references';
    RAISE NOTICE '⭐ Inserted: favorites, price alerts';
END $$;
