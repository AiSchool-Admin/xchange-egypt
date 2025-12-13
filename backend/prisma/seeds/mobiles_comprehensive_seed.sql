-- =====================================================
-- Comprehensive Seed Data for Mobile Marketplace
-- بيانات اختبارية شاملة لسوق الموبايلات
-- XChange Egypt - أفضل سوق موبايلات في مصر
-- Run this AFTER running mobiles_create_tables.sql
-- =====================================================

-- Note: Using existing test users from cars/properties seed
-- Test Users IDs: user_test_1, user_test_2, user_test_3, user_test_4, user_test_5, user_admin

-- =====================================================
-- Mobile Price References (أسعار مرجعية للموبايلات)
-- =====================================================
INSERT INTO mobile_price_references (id, brand, model, storage_gb, release_year, price_low, price_average, price_high, condition_a_multiplier, condition_b_multiplier, condition_c_multiplier, condition_d_multiplier, data_source, sample_size, recorded_at)
VALUES
  -- Apple iPhone (أسعار آيفون)
  ('price_iphone_15_pro_max_256', 'APPLE', 'iPhone 15 Pro Max', 256, 2023, 65000, 73000, 78000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 150, NOW()),
  ('price_iphone_15_pro_256', 'APPLE', 'iPhone 15 Pro', 256, 2023, 55000, 62000, 68000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 180, NOW()),
  ('price_iphone_15_256', 'APPLE', 'iPhone 15', 256, 2023, 40000, 45000, 50000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 200, NOW()),
  ('price_iphone_15_128', 'APPLE', 'iPhone 15', 128, 2023, 36000, 40000, 45000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 250, NOW()),
  ('price_iphone_14_pro_max_256', 'APPLE', 'iPhone 14 Pro Max', 256, 2022, 45000, 52000, 58000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 180, NOW()),
  ('price_iphone_14_pro_128', 'APPLE', 'iPhone 14 Pro', 128, 2022, 38000, 42000, 48000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 200, NOW()),
  ('price_iphone_14_128', 'APPLE', 'iPhone 14', 128, 2022, 28000, 32000, 37000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 220, NOW()),
  ('price_iphone_13_pro_256', 'APPLE', 'iPhone 13 Pro', 256, 2021, 30000, 35000, 40000, 1.0, 0.85, 0.70, 0.50, 'MARKET_ANALYSIS', 180, NOW()),
  ('price_iphone_13_128', 'APPLE', 'iPhone 13', 128, 2021, 22000, 26000, 30000, 1.0, 0.85, 0.70, 0.50, 'MARKET_ANALYSIS', 300, NOW()),
  ('price_iphone_12_128', 'APPLE', 'iPhone 12', 128, 2020, 15000, 18000, 22000, 1.0, 0.82, 0.68, 0.48, 'MARKET_ANALYSIS', 250, NOW()),
  ('price_iphone_11_128', 'APPLE', 'iPhone 11', 128, 2019, 11000, 13500, 16000, 1.0, 0.80, 0.65, 0.45, 'MARKET_ANALYSIS', 300, NOW()),

  -- Samsung Galaxy (أسعار سامسونج)
  ('price_s24_ultra_256', 'SAMSUNG', 'Galaxy S24 Ultra', 256, 2024, 58000, 65000, 72000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 120, NOW()),
  ('price_s24_plus_256', 'SAMSUNG', 'Galaxy S24+', 256, 2024, 42000, 48000, 54000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 150, NOW()),
  ('price_s24_256', 'SAMSUNG', 'Galaxy S24', 256, 2024, 34000, 38000, 43000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 180, NOW()),
  ('price_s23_ultra_256', 'SAMSUNG', 'Galaxy S23 Ultra', 256, 2023, 42000, 48000, 55000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 200, NOW()),
  ('price_s23_128', 'SAMSUNG', 'Galaxy S23', 128, 2023, 25000, 28000, 33000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 250, NOW()),
  ('price_s22_ultra_256', 'SAMSUNG', 'Galaxy S22 Ultra', 256, 2022, 32000, 35000, 40000, 1.0, 0.85, 0.70, 0.50, 'MARKET_ANALYSIS', 180, NOW()),
  ('price_a54_256', 'SAMSUNG', 'Galaxy A54', 256, 2023, 12000, 14000, 17000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 300, NOW()),
  ('price_a34_128', 'SAMSUNG', 'Galaxy A34', 128, 2023, 8500, 10000, 13000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 350, NOW()),
  ('price_fold5_256', 'SAMSUNG', 'Galaxy Z Fold5', 256, 2023, 68000, 75000, 85000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 50, NOW()),
  ('price_flip5_256', 'SAMSUNG', 'Galaxy Z Flip5', 256, 2023, 38000, 42000, 48000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 80, NOW()),

  -- Xiaomi (أسعار شاومي)
  ('price_xiaomi_14_ultra_512', 'XIAOMI', 'Xiaomi 14 Ultra', 512, 2024, 50000, 55000, 62000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 60, NOW()),
  ('price_xiaomi_14_pro_256', 'XIAOMI', 'Xiaomi 14 Pro', 256, 2024, 35000, 38000, 44000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 80, NOW()),
  ('price_xiaomi_13_256', 'XIAOMI', 'Xiaomi 13', 256, 2023, 22000, 25000, 30000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 120, NOW()),
  ('price_redmi_note_13_pro_256', 'XIAOMI', 'Redmi Note 13 Pro+', 256, 2024, 13000, 15000, 18000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 200, NOW()),
  ('price_redmi_note_13_128', 'XIAOMI', 'Redmi Note 13', 128, 2024, 7000, 8500, 10000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 350, NOW()),
  ('price_poco_x6_pro_256', 'XIAOMI', 'POCO X6 Pro', 256, 2024, 12000, 14000, 17000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 150, NOW()),

  -- OPPO (أسعار أوبو)
  ('price_oppo_find_x7_ultra_512', 'OPPO', 'Find X7 Ultra', 512, 2024, 45000, 50000, 58000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 40, NOW()),
  ('price_oppo_reno_11_pro_256', 'OPPO', 'Reno 11 Pro', 256, 2024, 22000, 25000, 30000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 100, NOW()),
  ('price_oppo_reno_11_256', 'OPPO', 'Reno 11', 256, 2024, 16000, 18000, 22000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 150, NOW()),

  -- Vivo (أسعار فيفو)
  ('price_vivo_x100_pro_256', 'VIVO', 'X100 Pro', 256, 2024, 38000, 42000, 48000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 50, NOW()),
  ('price_vivo_v30_pro_256', 'VIVO', 'V30 Pro', 256, 2024, 20000, 22000, 27000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 80, NOW()),

  -- Realme (أسعار ريلمي)
  ('price_realme_gt5_pro_256', 'REALME', 'GT5 Pro', 256, 2024, 25000, 28000, 33000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 60, NOW()),
  ('price_realme_12_pro_plus_256', 'REALME', '12 Pro+', 256, 2024, 16000, 18000, 22000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 100, NOW()),

  -- Honor (أسعار هونر)
  ('price_honor_magic6_pro_512', 'HONOR', 'Magic6 Pro', 512, 2024, 42000, 45000, 50000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 40, NOW()),

  -- Google Pixel (أسعار جوجل بيكسل)
  ('price_pixel_8_pro_256', 'GOOGLE', 'Pixel 8 Pro', 256, 2023, 38000, 42000, 48000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 40, NOW()),
  ('price_pixel_8_128', 'GOOGLE', 'Pixel 8', 128, 2023, 28000, 32000, 37000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 60, NOW()),

  -- OnePlus (أسعار ون بلس)
  ('price_oneplus_12_256', 'ONEPLUS', 'OnePlus 12', 256, 2024, 38000, 42000, 48000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 60, NOW()),
  ('price_oneplus_nord_3_256', 'ONEPLUS', 'Nord 3', 256, 2023, 16000, 18000, 22000, 1.0, 0.85, 0.72, 0.52, 'MARKET_ANALYSIS', 100, NOW()),

  -- Infinix (أسعار انفينكس)
  ('price_infinix_note_40_pro_256', 'INFINIX', 'Note 40 Pro', 256, 2024, 10000, 12000, 15000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 200, NOW()),
  ('price_infinix_hot_40_pro_256', 'INFINIX', 'Hot 40 Pro', 256, 2024, 6000, 7500, 9000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 350, NOW()),

  -- Tecno (أسعار تكنو)
  ('price_tecno_camon_30_pro_256', 'TECNO', 'Camon 30 Pro', 256, 2024, 11000, 13000, 16000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 150, NOW()),
  ('price_tecno_spark_20_pro_256', 'TECNO', 'Spark 20 Pro', 256, 2024, 5000, 6500, 8000, 1.0, 0.88, 0.75, 0.55, 'MARKET_ANALYSIS', 400, NOW())
ON CONFLICT (brand, model, storage_gb) DO UPDATE SET
  price_low = EXCLUDED.price_low,
  price_average = EXCLUDED.price_average,
  price_high = EXCLUDED.price_high,
  recorded_at = NOW();

-- =====================================================
-- Mobile Listings (إعلانات الموبايلات)
-- =====================================================
INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, storage_gb, ram_gb, color, imei, imei_verified, imei_status, ntra_registered, condition_grade, battery_health, screen_condition, body_condition, original_parts, has_box, has_accessories, accessories_details, price_egp, original_price, negotiable, accepts_barter, barter_preferences, images, governorate, city, district, status, featured, promotion_tier, views_count, favorites_count, inquiries_count, warranty_months, created_at, expires_at)
VALUES
  -- iPhone Listings (إعلانات آيفون)
  ('mobile_1', 'user_test_1', 'iPhone 15 Pro Max 256GB - تيتانيوم طبيعي - كالجديد', 'آيفون 15 برو ماكس بحالة ممتازة جداً - استخدام شهرين فقط. البطارية 100% والشاشة بدون أي خدش.', 'APPLE', 'iPhone 15 Pro Max', 256, 8, 'تيتانيوم طبيعي', '353456789012345', true, 'CLEAN', true, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن الأصلي، الكابل الأصلي، العلبة الأصلية', 73000, 85000, true, true, '{"wanted_brands": ["SAMSUNG", "APPLE"], "min_value_percent": 80, "max_cash_to_pay": 15000}', '["/mobiles/iphone15promax-natural-1.jpg", "/mobiles/iphone15promax-natural-2.jpg"]', 'القاهرة', 'مدينة نصر', 'عباس العقاد', 'ACTIVE', false, 'BASIC', 450, 35, 12, 10, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),

  ('mobile_2', 'user_test_2', 'iPhone 14 Pro 256GB Deep Purple - ضمان ساري', 'آيفون 14 برو باللون البنفسجي الغامق. الجهاز بحالة ممتازة مع ضمان أبل ساري.', 'APPLE', 'iPhone 14 Pro', 256, 6, 'بنفسجي غامق', '357890123456789', true, 'CLEAN', true, 'A', 92, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن الأصلي، الكابل، واقي شاشة', 48000, 55000, true, true, '{"wanted_brands": ["APPLE", "SAMSUNG"], "min_value_percent": 75}', '["/mobiles/iphone14pro-purple-1.jpg", "/mobiles/iphone14pro-purple-2.jpg"]', 'الإسكندرية', 'سموحة', 'شارع فوزي معاذ', 'ACTIVE', false, 'BASIC', 380, 28, 8, 6, NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days'),

  ('mobile_3', 'user_test_3', 'iPhone 13 128GB Midnight - سعر مميز', 'آيفون 13 باللون الأسود. جهاز نظيف وبحالة جيدة جداً.', 'APPLE', 'iPhone 13', 128, 4, 'أسود', '351234567890123', true, 'CLEAN', true, 'B', 85, 'MINOR_SCRATCHES', 'GOOD', true, false, false, NULL, 26000, 32000, true, true, '{"wanted_brands": ["APPLE", "SAMSUNG", "XIAOMI"], "min_value_percent": 70}', '["/mobiles/iphone13-black-1.jpg", "/mobiles/iphone13-black-2.jpg"]', 'الجيزة', 'الدقي', 'شارع التحرير', 'ACTIVE', false, 'BASIC', 520, 42, 15, NULL, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'),

  ('mobile_4', 'user_test_1', 'iPhone 12 Pro Max 256GB Pacific Blue', 'آيفون 12 برو ماكس - الجهاز يعمل بشكل ممتاز. البطارية تم تغييرها في مركز معتمد.', 'APPLE', 'iPhone 12 Pro Max', 256, 6, 'أزرق', '359876543210987', true, 'CLEAN', true, 'B', 100, 'PERFECT', 'GOOD', true, false, false, 'الكابل فقط', 22000, 28000, true, false, NULL, '["/mobiles/iphone12promax-blue-1.jpg"]', 'القاهرة', 'المعادي', 'دجلة', 'ACTIVE', false, 'BASIC', 290, 18, 6, NULL, NOW() - INTERVAL '12 days', NOW() + INTERVAL '18 days'),

  -- Samsung Listings (إعلانات سامسونج)
  ('mobile_5', 'user_test_4', 'Samsung Galaxy S24 Ultra 256GB - أسود - جديد', 'سامسونج جالاكسي S24 الترا - جهاز جديد بالكرتونة. ضمان سنة كاملة.', 'SAMSUNG', 'Galaxy S24 Ultra', 256, 12, 'أسود فانتوم', '354321098765432', true, 'CLEAN', true, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن الأصلي 45W، الكابل، S Pen، الجراب الأصلي', 70000, 75000, false, true, '{"wanted_brands": ["APPLE"], "min_value_percent": 85}', '["/mobiles/s24ultra-black-1.jpg", "/mobiles/s24ultra-black-2.jpg"]', 'القاهرة', 'التجمع الخامس', 'شارع التسعين', 'ACTIVE', true, 'FEATURED', 680, 55, 20, 12, NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),

  ('mobile_6', 'user_test_2', 'Samsung Galaxy S23 Ultra 512GB - أخضر', 'جالاكسي S23 الترا بسعة 512 جيجا. الجهاز بحالة ممتازة مع كل الملحقات.', 'SAMSUNG', 'Galaxy S23 Ultra', 512, 12, 'أخضر', '352109876543210', true, 'CLEAN', true, 'A', 95, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن الأصلي، S Pen، العلبة', 52000, 60000, true, true, '{"wanted_brands": ["APPLE", "SAMSUNG"], "min_value_percent": 80}', '["/mobiles/s23ultra-green-1.jpg", "/mobiles/s23ultra-green-2.jpg"]', 'الجيزة', 'المهندسين', 'شارع السودان', 'ACTIVE', false, 'BASIC', 420, 32, 10, 8, NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days'),

  ('mobile_7', 'user_test_5', 'Samsung Galaxy Z Fold5 256GB - كريمي', 'سامسونج فولد 5 - تجربة الشاشة القابلة للطي. الجهاز بحالة ممتازة.', 'SAMSUNG', 'Galaxy Z Fold5', 256, 12, 'كريمي', '358765432109876', true, 'CLEAN', true, 'A', 93, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن، S Pen Fold Edition، الجراب الأصلي', 78000, 90000, true, true, '{"wanted_brands": ["APPLE"], "min_value_percent": 90}', '["/mobiles/fold5-cream-1.jpg", "/mobiles/fold5-cream-2.jpg"]', 'القاهرة', 'مصر الجديدة', 'شارع الميرغني', 'ACTIVE', false, 'BASIC', 350, 25, 8, 6, NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days'),

  ('mobile_8', 'user_test_3', 'Samsung Galaxy A54 256GB - أبيض', 'جالاكسي A54 بسعر مميز جداً. جهاز اقتصادي بمواصفات قوية.', 'SAMSUNG', 'Galaxy A54', 256, 8, 'أبيض', '355432109876543', false, 'UNKNOWN', false, 'B', 88, 'MINOR_SCRATCHES', 'GOOD', true, false, false, 'شاحن فقط', 14500, 18000, true, true, '{"wanted_brands": ["SAMSUNG", "XIAOMI", "OPPO"], "min_value_percent": 70}', '["/mobiles/a54-white-1.jpg"]', 'الدقهلية', 'المنصورة', 'حي الجامعة', 'ACTIVE', false, 'BASIC', 180, 15, 5, NULL, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),

  -- Xiaomi Listings (إعلانات شاومي)
  ('mobile_9', 'user_test_1', 'Xiaomi 14 Ultra 512GB - أسود - كاميرا Leica', 'شاومي 14 الترا مع كاميرا لايكا الاحترافية. أفضل كاميرا موبايل في السوق.', 'XIAOMI', 'Xiaomi 14 Ultra', 512, 16, 'أسود', '351098765432109', true, 'CLEAN', false, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن 90W، الجراب، واقي الكاميرا', 58000, 65000, true, true, '{"wanted_brands": ["APPLE", "SAMSUNG"], "min_value_percent": 85}', '["/mobiles/xiaomi14ultra-black-1.jpg", "/mobiles/xiaomi14ultra-black-2.jpg"]', 'القاهرة', 'الشروق', 'الحي الأول', 'ACTIVE', false, 'BASIC', 280, 22, 7, 11, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'),

  ('mobile_10', 'user_test_4', 'Redmi Note 13 Pro+ 256GB - بنفسجي', 'ريدمي نوت 13 برو بلس بشاشة AMOLED وشحن سريع 120W. سعر لا يقاوم!', 'XIAOMI', 'Redmi Note 13 Pro+', 256, 12, 'بنفسجي', '356789012345670', false, 'UNKNOWN', false, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن 120W الأصلي، الجراب، واقي شاشة', 16000, 18000, false, true, '{"wanted_brands": ["XIAOMI", "REALME", "OPPO"], "min_value_percent": 75}', '["/mobiles/redminote13proplus-purple-1.jpg"]', 'الغربية', 'طنطا', 'شارع سعيد', 'ACTIVE', false, 'BASIC', 420, 38, 12, 12, NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days'),

  ('mobile_11', 'user_test_2', 'POCO X6 Pro 256GB - أصفر', 'بوكو X6 برو - أداء خارق بسعر منافس. مثالي للألعاب.', 'XIAOMI', 'POCO X6 Pro', 256, 12, 'أصفر', '356789012345678', true, 'CLEAN', true, 'B', 92, 'MINOR_SCRATCHES', 'GOOD', true, true, false, 'الشاحن فقط', 14000, 17000, true, true, '{"wanted_brands": ["XIAOMI", "REALME"], "min_value_percent": 70}', '["/mobiles/pocox6pro-yellow-1.jpg"]', 'القاهرة', '6 أكتوبر', 'الحي الثامن', 'ACTIVE', false, 'BASIC', 310, 25, 8, NULL, NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days'),

  -- OPPO Listings (إعلانات أوبو)
  ('mobile_12', 'user_test_5', 'OPPO Find X7 Ultra 512GB - أسود', 'أوبو فايند X7 الترا - كاميرا Hasselblad مع أفضل زووم في السوق.', 'OPPO', 'Find X7 Ultra', 512, 16, 'أسود', '353210987654321', true, 'CLEAN', true, 'A', 97, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن 100W، الجراب، العلبة', 54000, 62000, true, true, '{"wanted_brands": ["APPLE", "SAMSUNG"], "min_value_percent": 85}', '["/mobiles/findx7ultra-black-1.jpg", "/mobiles/findx7ultra-black-2.jpg"]', 'القاهرة', 'العبور', 'الحي الأول', 'ACTIVE', false, 'BASIC', 180, 14, 5, 9, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),

  ('mobile_13', 'user_test_3', 'OPPO Reno 11 Pro 256GB - رمادي', 'أوبو رينو 11 برو بتصميم أنيق وكاميرا بورتريه احترافية.', 'OPPO', 'Reno 11 Pro', 256, 12, 'رمادي', '354567890123456', false, 'UNKNOWN', false, 'A', 99, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن 80W، الجراب الأصلي', 27000, 32000, true, false, NULL, '["/mobiles/reno11pro-gray-1.jpg"]', 'الإسكندرية', 'جليم', 'شارع أبو قير', 'ACTIVE', false, 'BASIC', 220, 18, 6, 11, NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days'),

  -- Vivo Listings (إعلانات فيفو)
  ('mobile_14', 'user_test_4', 'Vivo X100 Pro 256GB - أزرق', 'فيفو X100 برو بمعالج Dimensity 9300 وكاميرا ZEISS.', 'VIVO', 'X100 Pro', 256, 16, 'أزرق', '357654321098760', false, 'UNKNOWN', false, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن 100W، الكابل، الجراب', 45000, 50000, true, true, '{"wanted_brands": ["SAMSUNG", "XIAOMI"], "min_value_percent": 80}', '["/mobiles/vivox100pro-blue-1.jpg"]', 'القاهرة', 'المعادي', 'كورنيش المعادي', 'ACTIVE', false, 'BASIC', 150, 12, 4, 12, NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),

  -- Realme Listings (إعلانات ريلمي)
  ('mobile_15', 'user_test_1', 'Realme GT5 Pro 256GB - أخضر', 'ريلمي GT5 برو بأداء فائق ومعالج Snapdragon 8 Gen 3.', 'REALME', 'GT5 Pro', 256, 16, 'أخضر', '357654321098765', true, 'CLEAN', true, 'A', 96, 'PERFECT', 'LIKE_NEW', true, true, false, 'الشاحن 100W', 30000, 35000, true, true, '{"wanted_brands": ["XIAOMI", "ONEPLUS"], "min_value_percent": 75}', '["/mobiles/realmegt5pro-green-1.jpg"]', 'الجيزة', 'الشيخ زايد', 'الحي الأول', 'ACTIVE', false, 'BASIC', 195, 16, 5, NULL, NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days'),

  -- Honor Listings (إعلانات هونر)
  ('mobile_16', 'user_test_2', 'Honor Magic6 Pro 512GB - أسود', 'هونر ماجيك 6 برو بكاميرا متطورة وأداء قوي.', 'HONOR', 'Magic6 Pro', 512, 16, 'أسود', '358765432109870', false, 'UNKNOWN', false, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن 80W، العلبة كاملة', 48000, 55000, true, true, '{"wanted_brands": ["HUAWEI", "SAMSUNG"], "min_value_percent": 80}', '["/mobiles/honor-magic6pro-black-1.jpg"]', 'القاهرة', 'مدينة نصر', 'المنطقة العاشرة', 'ACTIVE', false, 'BASIC', 120, 10, 3, 12, NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days'),

  -- Google Pixel Listings (إعلانات جوجل بيكسل)
  ('mobile_17', 'user_test_5', 'Google Pixel 8 Pro 256GB - أزرق', 'جوجل بيكسل 8 برو بأفضل كاميرا وتجربة أندرويد نقية.', 'GOOGLE', 'Pixel 8 Pro', 256, 12, 'Bay Blue', '354098765432109', true, 'CLEAN', false, 'A', 97, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن، الكابل USB-C', 44000, 50000, true, true, '{"wanted_brands": ["APPLE", "SAMSUNG"], "min_value_percent": 80}', '["/mobiles/pixel8pro-blue-1.jpg", "/mobiles/pixel8pro-blue-2.jpg"]', 'القاهرة', 'المقطم', 'الهضبة الوسطى', 'ACTIVE', false, 'BASIC', 165, 13, 4, 10, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),

  -- Infinix Listings (إعلانات انفينكس)
  ('mobile_18', 'user_test_3', 'Infinix Note 40 Pro 256GB - ذهبي', 'انفينكس نوت 40 برو بسعر اقتصادي ومواصفات ممتازة.', 'INFINIX', 'Note 40 Pro', 256, 12, 'ذهبي', '359876543210980', false, 'UNKNOWN', false, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن 68W، الجراب', 13000, 15000, false, true, '{"wanted_brands": ["INFINIX", "TECNO", "XIAOMI"], "min_value_percent": 70}', '["/mobiles/infinixnote40pro-gold-1.jpg"]', 'الشرقية', 'الزقازيق', 'وسط المدينة', 'ACTIVE', false, 'BASIC', 280, 22, 8, 12, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'),

  -- Tecno Listings (إعلانات تكنو)
  ('mobile_19', 'user_test_4', 'Tecno Camon 30 Pro 256GB - أخضر', 'تكنو كامون 30 برو بكاميرا 50 ميجابيكسل وشاشة AMOLED.', 'TECNO', 'Camon 30 Pro', 256, 12, 'أخضر', '350987654321098', false, 'UNKNOWN', false, 'A', 100, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن 70W، السماعات', 14000, 16000, false, true, '{"wanted_brands": ["TECNO", "INFINIX"], "min_value_percent": 70}', '["/mobiles/tecnocamon30pro-green-1.jpg"]', 'المنيا', 'مغاغة', 'وسط المدينة', 'ACTIVE', false, 'BASIC', 150, 12, 4, 12, NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),

  -- OnePlus Listings (إعلانات ون بلس)
  ('mobile_20', 'user_test_1', 'OnePlus 12 256GB - أخضر Flowy Emerald', 'ون بلس 12 بتجربة OxygenOS السلسة وأداء خارق.', 'ONEPLUS', 'OnePlus 12', 256, 16, 'Flowy Emerald', '352987654321098', true, 'CLEAN', true, 'A', 98, 'PERFECT', 'LIKE_NEW', true, true, true, 'الشاحن 100W، الجراب الأصلي', 44000, 50000, true, true, '{"wanted_brands": ["SAMSUNG", "XIAOMI"], "min_value_percent": 80}', '["/mobiles/oneplus12-green-1.jpg", "/mobiles/oneplus12-green-2.jpg"]', 'القاهرة', 'الرحاب', 'المرحلة الأولى', 'ACTIVE', false, 'BASIC', 210, 17, 6, 10, NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days')

ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  favorites_count = EXCLUDED.favorites_count;

-- =====================================================
-- IMEI Verifications (تحققات IMEI)
-- =====================================================
INSERT INTO mobile_imei_verifications (id, listing_id, imei, is_blacklisted, is_stolen, is_financed, carrier_lock_status, original_carrier, reported_model, actual_model, model_matches, ntra_registration_status, ntra_check_date, verification_provider, verified_at)
VALUES
  ('imei_1', 'mobile_1', '353456789012345', false, false, false, 'UNLOCKED', NULL, 'iPhone 15 Pro Max', 'iPhone 15 Pro Max', true, 'REGISTERED', NOW() - INTERVAL '4 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '4 days'),
  ('imei_2', 'mobile_2', '357890123456789', false, false, false, 'UNLOCKED', NULL, 'iPhone 14 Pro', 'iPhone 14 Pro', true, 'REGISTERED', NOW() - INTERVAL '7 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '7 days'),
  ('imei_3', 'mobile_3', '351234567890123', false, false, false, 'UNLOCKED', NULL, 'iPhone 13', 'iPhone 13', true, 'REGISTERED', NOW() - INTERVAL '2 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '2 days'),
  ('imei_4', 'mobile_4', '359876543210987', false, false, false, 'UNLOCKED', NULL, 'iPhone 12 Pro Max', 'iPhone 12 Pro Max', true, 'REGISTERED', NOW() - INTERVAL '11 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '11 days'),
  ('imei_5', 'mobile_5', '354321098765432', false, false, false, 'UNLOCKED', NULL, 'Galaxy S24 Ultra', 'Galaxy S24 Ultra', true, 'REGISTERED', NOW() - INTERVAL '1 day', 'GSMA_IMEI_DB', NOW() - INTERVAL '1 day'),
  ('imei_6', 'mobile_6', '352109876543210', false, false, false, 'UNLOCKED', NULL, 'Galaxy S23 Ultra', 'Galaxy S23 Ultra', true, 'REGISTERED', NOW() - INTERVAL '5 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '5 days'),
  ('imei_7', 'mobile_7', '358765432109876', false, false, false, 'UNLOCKED', NULL, 'Galaxy Z Fold5', 'Galaxy Z Fold5', true, 'REGISTERED', NOW() - INTERVAL '3 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '3 days'),
  ('imei_9', 'mobile_9', '351098765432109', false, false, false, 'UNLOCKED', NULL, 'Xiaomi 14 Ultra', 'Xiaomi 14 Ultra', true, 'NOT_REGISTERED', NOW() - INTERVAL '2 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '2 days'),
  ('imei_11', 'mobile_11', '356789012345678', false, false, false, 'UNLOCKED', NULL, 'POCO X6 Pro', 'POCO X6 Pro', true, 'REGISTERED', NOW() - INTERVAL '6 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '6 days'),
  ('imei_12', 'mobile_12', '353210987654321', false, false, false, 'UNLOCKED', NULL, 'Find X7 Ultra', 'Find X7 Ultra', true, 'REGISTERED', NOW() - INTERVAL '4 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '4 days'),
  ('imei_15', 'mobile_15', '357654321098765', false, false, false, 'UNLOCKED', NULL, 'GT5 Pro', 'GT5 Pro', true, 'REGISTERED', NOW() - INTERVAL '5 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '5 days'),
  ('imei_17', 'mobile_17', '354098765432109', false, false, false, 'UNLOCKED', NULL, 'Pixel 8 Pro', 'Pixel 8 Pro', true, 'NOT_REGISTERED', NOW() - INTERVAL '4 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '4 days'),
  ('imei_20', 'mobile_20', '352987654321098', false, false, false, 'UNLOCKED', NULL, 'OnePlus 12', 'OnePlus 12', true, 'REGISTERED', NOW() - INTERVAL '3 days', 'GSMA_IMEI_DB', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Device Diagnostics (تقارير فحص الأجهزة)
-- =====================================================
INSERT INTO mobile_device_diagnostics (id, listing_id, battery_health_percent, battery_cycle_count, battery_original, dead_pixels_count, touch_responsive, screen_original, cameras_functional, speakers_functional, microphone_functional, sensors_functional, buttons_functional, wifi_functional, bluetooth_functional, gps_functional, sim_card_functional, faceid_functional, fingerprint_functional, diagnostic_score, diagnostic_provider, diagnosed_at)
VALUES
  ('diag_1', 'mobile_1', 100, 45, true, 0, true, true, true, true, true, true, true, true, true, true, true, true, NULL, 98, 'XChange_DiagTool', NOW() - INTERVAL '5 days'),
  ('diag_2', 'mobile_2', 92, 180, true, 0, true, true, true, true, true, true, true, true, true, true, true, true, NULL, 95, 'XChange_DiagTool', NOW() - INTERVAL '8 days'),
  ('diag_5', 'mobile_5', 100, 10, true, 0, true, true, true, true, true, true, true, true, true, true, true, NULL, true, 100, 'XChange_DiagTool', NOW() - INTERVAL '2 days'),
  ('diag_6', 'mobile_6', 95, 120, true, 0, true, true, true, true, true, true, true, true, true, true, true, NULL, true, 97, 'XChange_DiagTool', NOW() - INTERVAL '6 days'),
  ('diag_7', 'mobile_7', 93, 150, true, 0, true, true, true, true, true, true, true, true, true, true, true, NULL, true, 96, 'XChange_DiagTool', NOW() - INTERVAL '4 days'),
  ('diag_9', 'mobile_9', 100, 20, true, 0, true, true, true, true, true, true, true, true, true, true, true, NULL, true, 99, 'XChange_DiagTool', NOW() - INTERVAL '3 days'),
  ('diag_12', 'mobile_12', 97, 80, true, 0, true, true, true, true, true, true, true, true, true, true, true, NULL, true, 98, 'XChange_DiagTool', NOW() - INTERVAL '5 days'),
  ('diag_17', 'mobile_17', 97, 90, true, 0, true, true, true, true, true, true, true, true, true, true, true, true, true, 97, 'XChange_DiagTool', NOW() - INTERVAL '5 days'),
  ('diag_20', 'mobile_20', 98, 60, true, 0, true, true, true, true, true, true, true, true, true, true, true, NULL, true, 98, 'XChange_DiagTool', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Mobile Transactions (معاملات الموبايلات)
-- =====================================================
INSERT INTO mobile_transactions (id, listing_id, buyer_id, seller_id, transaction_type, agreed_price_egp, platform_fee_egp, seller_payout_egp, payment_method, escrow_amount, escrow_held_at, escrow_released_at, delivery_method, delivery_status, inspection_starts_at, inspection_ends_at, buyer_confirmed, status, created_at, completed_at)
VALUES
  ('trans_1', 'mobile_3', 'user_test_4', 'user_test_3', 'SALE', 26000, 520, 25480, 'ESCROW', 26000, NOW() - INTERVAL '18 days', NOW() - INTERVAL '10 days', 'MEETUP', 'DELIVERED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '10 days', true, 'COMPLETED', NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days'),
  ('trans_2', 'mobile_8', 'user_test_1', 'user_test_3', 'SALE', 14500, 290, 14210, 'ESCROW', 14500, NOW() - INTERVAL '13 days', NOW() - INTERVAL '5 days', 'BOSTA', 'DELIVERED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '5 days', true, 'COMPLETED', NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days'),
  ('trans_3', 'mobile_1', 'user_test_5', 'user_test_1', 'SALE', 72000, 1440, 70560, 'ESCROW', 72000, NOW() - INTERVAL '2 days', NULL, 'MEETUP', 'DELIVERED', NOW() - INTERVAL '2 days', NOW() + INTERVAL '3 days', false, 'INSPECTION', NOW() - INTERVAL '2 days', NULL),
  ('trans_4', 'mobile_5', 'user_test_2', 'user_test_4', 'SALE', 69000, 1380, 67620, 'ESCROW', 69000, NOW() - INTERVAL '3 days', NULL, 'BOSTA', 'IN_TRANSIT', NULL, NULL, false, 'SHIPPING', NOW() - INTERVAL '3 days', NULL),
  ('trans_5', 'mobile_2', 'user_test_3', 'user_test_2', 'BARTER_WITH_CASH', NULL, 0, NULL, 'ESCROW', 5000, NOW() - INTERVAL '16 days', NOW() - INTERVAL '8 days', 'MEETUP', 'DELIVERED', NOW() - INTERVAL '13 days', NOW() - INTERVAL '8 days', true, 'COMPLETED', NOW() - INTERVAL '18 days', NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Barter Matches (مطابقات المقايضة)
-- =====================================================
INSERT INTO mobile_barter_matches (id, match_type, total_value_egp, cash_settlements, match_score, location_compatible, status, created_at)
VALUES
  ('match_1', 'DIRECT', 143000, '{"user_test_1": -3000, "user_test_4": 3000}', 85.5, true, 'PROPOSED', NOW() - INTERVAL '1 day'),
  ('match_2', 'DIRECT', 110000, '{"user_test_2": -6500, "user_test_1": 6500}', 78.0, true, 'PROPOSED', NOW() - INTERVAL '2 days'),
  ('match_3', 'DIRECT', 78000, '{"user_test_3": 18000, "user_test_2": -18000}', 72.0, true, 'ALL_ACCEPTED', NOW() - INTERVAL '5 days'),
  ('match_4', 'DIRECT', 27000, '{"user_test_3": -1000, "user_test_2": 1000}', 80.0, false, 'PROPOSED', NOW() - INTERVAL '1 day'),
  ('match_5', 'DIRECT', 151000, '{"user_test_5": 5000, "user_test_1": -5000}', 75.0, true, 'PROPOSED', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Barter Match Participants (مشاركين المقايضة)
-- =====================================================
INSERT INTO mobile_barter_match_participants (id, match_id, user_id, offers_listing_id, offers_value, receives_listing_id, receives_value, cash_to_pay, cash_to_receive, accepted, accepted_at)
VALUES
  ('part_1a', 'match_1', 'user_test_1', 'mobile_1', 73000, 'mobile_5', 70000, 3000, 0, false, NULL),
  ('part_1b', 'match_1', 'user_test_4', 'mobile_5', 70000, 'mobile_1', 73000, 0, 3000, false, NULL),
  ('part_2a', 'match_2', 'user_test_2', 'mobile_6', 52000, 'mobile_9', 58000, 6500, 0, false, NULL),
  ('part_2b', 'match_2', 'user_test_1', 'mobile_9', 58000, 'mobile_6', 52000, 0, 6500, false, NULL),
  ('part_3a', 'match_3', 'user_test_3', 'mobile_15', 30000, 'mobile_2', 48000, 0, 18000, true, NOW() - INTERVAL '4 days'),
  ('part_3b', 'match_3', 'user_test_2', 'mobile_2', 48000, 'mobile_15', 30000, 18000, 0, true, NOW() - INTERVAL '4 days')
ON CONFLICT (match_id, user_id) DO NOTHING;

-- =====================================================
-- Barter Proposals (عروض المقايضة)
-- =====================================================
INSERT INTO mobile_barter_proposals (id, proposer_id, receiver_id, offered_listing_id, requested_listing_id, cash_difference, cash_direction, proposer_message, status, created_at, expires_at)
VALUES
  ('proposal_1', 'user_test_1', 'user_test_4', 'mobile_1', 'mobile_5', 3000, 'PROPOSER_PAYS', 'مهتم بالمقايضة - الجهاز نظيف جداً وبحالة ممتازة. مستعد لدفع فرق 3000 جنيه.', 'PENDING', NOW() - INTERVAL '12 hours', NOW() + INTERVAL '6 days 12 hours'),
  ('proposal_2', 'user_test_2', 'user_test_1', 'mobile_6', 'mobile_9', 6500, 'PROPOSER_PAYS', 'جهازي S23 Ultra بحالة ممتازة - مستعد للمقايضة مع دفع الفرق', 'PENDING', NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days'),
  ('proposal_3', 'user_test_3', 'user_test_2', 'mobile_15', 'mobile_2', 18000, 'RECEIVER_PAYS', 'مستعد لاستلام فرق 18000 جنيه مع المقايضة', 'ACCEPTED', NOW() - INTERVAL '5 days', NOW() + INTERVAL '2 days'),
  ('proposal_4', 'user_test_3', 'user_test_2', 'mobile_18', 'mobile_11', 1000, 'PROPOSER_PAYS', 'موافق على المقايضة مع دفع فرق بسيط', 'PENDING', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '6 days 18 hours')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Mobile Reviews (تقييمات الموبايلات)
-- =====================================================
INSERT INTO mobile_reviews (id, transaction_id, reviewer_id, reviewee_id, rating, accuracy_rating, communication_rating, speed_rating, comment_ar, is_verified_purchase, seller_response, created_at)
VALUES
  ('review_1', 'trans_1', 'user_test_4', 'user_test_3', 5, 5, 5, 5, 'الجهاز وصل بحالة ممتازة تماماً كما في الوصف. البائع متعاون جداً والتواصل كان سهل. أنصح بالتعامل معه.', true, 'شكراً لك على ثقتك. سعيد أن الجهاز نال إعجابك!', NOW() - INTERVAL '10 days'),
  ('review_2', 'trans_1', 'user_test_3', 'user_test_4', 5, 5, 5, 5, 'مشتري ممتاز. تعامل محترم وسريع. تم إتمام المعاملة بسلاسة.', true, NULL, NOW() - INTERVAL '9 days'),
  ('review_3', 'trans_2', 'user_test_1', 'user_test_3', 4, 4, 5, 4, 'الجهاز بحالة جيدة. توجد بعض الخدوش البسيطة كما ذكر البائع. سعر مناسب جداً.', true, 'شكراً لتقييمك. سعيد أن المعاملة تمت بنجاح.', NOW() - INTERVAL '5 days'),
  ('review_4', 'trans_5', 'user_test_3', 'user_test_2', 5, 5, 5, 5, 'تجربة مقايضة ممتازة. الجهاز مطابق للوصف والبائع كان صريح جداً في كل التفاصيل.', true, NULL, NOW() - INTERVAL '8 days'),
  ('review_5', 'trans_5', 'user_test_2', 'user_test_3', 5, 5, 5, 5, 'شخص موثوق. تعامل راقي ومحترم. المقايضة تمت بنجاح وسهولة.', true, NULL, NOW() - INTERVAL '7 days')
ON CONFLICT (transaction_id, reviewer_id) DO NOTHING;

-- =====================================================
-- Mobile Favorites (المفضلات)
-- =====================================================
INSERT INTO mobile_favorites (id, user_id, listing_id, created_at)
VALUES
  ('fav_1', 'user_test_1', 'mobile_5', NOW() - INTERVAL '3 days'),
  ('fav_2', 'user_test_1', 'mobile_7', NOW() - INTERVAL '2 days'),
  ('fav_3', 'user_test_2', 'mobile_1', NOW() - INTERVAL '4 days'),
  ('fav_4', 'user_test_2', 'mobile_9', NOW() - INTERVAL '1 day'),
  ('fav_5', 'user_test_3', 'mobile_5', NOW() - INTERVAL '5 days'),
  ('fav_6', 'user_test_3', 'mobile_6', NOW() - INTERVAL '3 days'),
  ('fav_7', 'user_test_4', 'mobile_1', NOW() - INTERVAL '2 days'),
  ('fav_8', 'user_test_4', 'mobile_17', NOW() - INTERVAL '4 days'),
  ('fav_9', 'user_test_5', 'mobile_9', NOW() - INTERVAL '1 day'),
  ('fav_10', 'user_test_5', 'mobile_20', NOW() - INTERVAL '3 days')
ON CONFLICT (user_id, listing_id) DO NOTHING;

-- =====================================================
-- Price Alerts (تنبيهات الأسعار)
-- =====================================================
INSERT INTO mobile_price_alerts (id, user_id, brand, model, max_price_egp, min_condition_grade, governorate, min_storage_gb, is_active, notification_count, created_at)
VALUES
  ('alert_1', 'user_test_1', 'APPLE', 'iPhone 15 Pro Max', 70000, 'A', NULL, 256, true, 0, NOW() - INTERVAL '10 days'),
  ('alert_2', 'user_test_1', 'SAMSUNG', 'Galaxy S24 Ultra', 65000, 'A', NULL, 256, true, 0, NOW() - INTERVAL '5 days'),
  ('alert_3', 'user_test_2', 'APPLE', 'iPhone 14 Pro', 40000, 'B', NULL, 128, true, 0, NOW() - INTERVAL '7 days'),
  ('alert_4', 'user_test_3', 'XIAOMI', 'Xiaomi 14 Ultra', 55000, 'A', NULL, 512, true, 0, NOW() - INTERVAL '3 days'),
  ('alert_5', 'user_test_4', 'SAMSUNG', 'Galaxy Z Fold5', 75000, 'A', NULL, 256, true, 0, NOW() - INTERVAL '8 days'),
  ('alert_6', 'user_test_5', 'GOOGLE', 'Pixel 8 Pro', 42000, 'A', NULL, 256, true, 1, NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Mobile Disputes (نزاعات الموبايلات)
-- =====================================================
INSERT INTO mobile_disputes (id, transaction_id, initiated_by_id, reason, description_ar, evidence_urls, status, resolution, resolution_notes, resolved_by_id, refund_amount, created_at, resolved_at)
VALUES
  ('dispute_1', 'trans_2', 'user_test_1', 'NOT_AS_DESCRIBED', 'البطارية أقل من المذكور في الإعلان (85% بدلاً من 88%)', '["/evidence/dispute1_battery_screenshot.jpg"]', 'RESOLVED', 'REFUND_PARTIAL', 'تم الاتفاق على خصم 500 جنيه من المبلغ كتعويض عن فرق حالة البطارية. تم استكمال المعاملة.', 'user_admin', 500, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Success Message
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Mobile marketplace seed data inserted successfully!';
    RAISE NOTICE '📱 Inserted: 20 listings, 45 price references, 13 IMEI verifications';
    RAISE NOTICE '💳 Inserted: 5 transactions, 5 barter matches, 4 proposals';
    RAISE NOTICE '⭐ Inserted: 5 reviews, 10 favorites, 6 price alerts, 1 dispute';
END $$;
