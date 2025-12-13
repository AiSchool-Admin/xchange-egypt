-- =====================================================
-- Comprehensive Seed Data for Mobile Marketplace
-- بيانات اختبارية شاملة لسوق الموبايلات
-- XChange Egypt - أفضل سوق موبايلات في مصر
-- =====================================================

-- Note: Using existing test users from cars/properties seed
-- Test Users IDs: user_test_1, user_test_2, user_test_3, user_test_4, user_test_5, user_admin

-- =====================================================
-- Mobile Price References (أسعار مرجعية للموبايلات)
-- =====================================================
INSERT INTO mobile_price_references (id, brand, model, variant, storage_capacity, condition, min_price, max_price, avg_price, currency, data_source, sample_size, last_updated)
VALUES
  -- Apple iPhone (أسعار آيفون)
  ('price_iphone_15_pro_max_256_a', 'APPLE', 'iPhone 15 Pro Max', NULL, 256, 'A', 72000, 78000, 75000, 'EGP', 'MARKET_ANALYSIS', 150, NOW()),
  ('price_iphone_15_pro_max_256_b', 'APPLE', 'iPhone 15 Pro Max', NULL, 256, 'B', 65000, 72000, 68500, 'EGP', 'MARKET_ANALYSIS', 120, NOW()),
  ('price_iphone_15_pro_max_256_c', 'APPLE', 'iPhone 15 Pro Max', NULL, 256, 'C', 58000, 65000, 61500, 'EGP', 'MARKET_ANALYSIS', 80, NOW()),
  ('price_iphone_15_pro_256_a', 'APPLE', 'iPhone 15 Pro', NULL, 256, 'A', 62000, 68000, 65000, 'EGP', 'MARKET_ANALYSIS', 180, NOW()),
  ('price_iphone_15_pro_256_b', 'APPLE', 'iPhone 15 Pro', NULL, 256, 'B', 55000, 62000, 58500, 'EGP', 'MARKET_ANALYSIS', 150, NOW()),
  ('price_iphone_15_256_a', 'APPLE', 'iPhone 15', NULL, 256, 'A', 45000, 50000, 47500, 'EGP', 'MARKET_ANALYSIS', 200, NOW()),
  ('price_iphone_15_128_a', 'APPLE', 'iPhone 15', NULL, 128, 'A', 40000, 45000, 42500, 'EGP', 'MARKET_ANALYSIS', 250, NOW()),
  ('price_iphone_14_pro_max_256_a', 'APPLE', 'iPhone 14 Pro Max', NULL, 256, 'A', 52000, 58000, 55000, 'EGP', 'MARKET_ANALYSIS', 180, NOW()),
  ('price_iphone_14_pro_max_256_b', 'APPLE', 'iPhone 14 Pro Max', NULL, 256, 'B', 45000, 52000, 48500, 'EGP', 'MARKET_ANALYSIS', 150, NOW()),
  ('price_iphone_14_pro_128_a', 'APPLE', 'iPhone 14 Pro', NULL, 128, 'A', 42000, 48000, 45000, 'EGP', 'MARKET_ANALYSIS', 200, NOW()),
  ('price_iphone_14_128_a', 'APPLE', 'iPhone 14', NULL, 128, 'A', 32000, 37000, 34500, 'EGP', 'MARKET_ANALYSIS', 220, NOW()),
  ('price_iphone_13_pro_256_a', 'APPLE', 'iPhone 13 Pro', NULL, 256, 'A', 35000, 40000, 37500, 'EGP', 'MARKET_ANALYSIS', 180, NOW()),
  ('price_iphone_13_128_a', 'APPLE', 'iPhone 13', NULL, 128, 'A', 25000, 30000, 27500, 'EGP', 'MARKET_ANALYSIS', 300, NOW()),
  ('price_iphone_12_128_a', 'APPLE', 'iPhone 12', NULL, 128, 'A', 18000, 22000, 20000, 'EGP', 'MARKET_ANALYSIS', 250, NOW()),
  ('price_iphone_11_128_a', 'APPLE', 'iPhone 11', NULL, 128, 'A', 13000, 16000, 14500, 'EGP', 'MARKET_ANALYSIS', 300, NOW()),

  -- Samsung Galaxy (أسعار سامسونج)
  ('price_s24_ultra_256_a', 'SAMSUNG', 'Galaxy S24 Ultra', NULL, 256, 'A', 65000, 72000, 68500, 'EGP', 'MARKET_ANALYSIS', 120, NOW()),
  ('price_s24_ultra_256_b', 'SAMSUNG', 'Galaxy S24 Ultra', NULL, 256, 'B', 58000, 65000, 61500, 'EGP', 'MARKET_ANALYSIS', 100, NOW()),
  ('price_s24_plus_256_a', 'SAMSUNG', 'Galaxy S24+', NULL, 256, 'A', 48000, 54000, 51000, 'EGP', 'MARKET_ANALYSIS', 150, NOW()),
  ('price_s24_256_a', 'SAMSUNG', 'Galaxy S24', NULL, 256, 'A', 38000, 43000, 40500, 'EGP', 'MARKET_ANALYSIS', 180, NOW()),
  ('price_s23_ultra_256_a', 'SAMSUNG', 'Galaxy S23 Ultra', NULL, 256, 'A', 48000, 55000, 51500, 'EGP', 'MARKET_ANALYSIS', 200, NOW()),
  ('price_s23_ultra_256_b', 'SAMSUNG', 'Galaxy S23 Ultra', NULL, 256, 'B', 42000, 48000, 45000, 'EGP', 'MARKET_ANALYSIS', 180, NOW()),
  ('price_s23_128_a', 'SAMSUNG', 'Galaxy S23', NULL, 128, 'A', 28000, 33000, 30500, 'EGP', 'MARKET_ANALYSIS', 250, NOW()),
  ('price_s22_ultra_256_a', 'SAMSUNG', 'Galaxy S22 Ultra', NULL, 256, 'A', 35000, 40000, 37500, 'EGP', 'MARKET_ANALYSIS', 180, NOW()),
  ('price_a54_256_a', 'SAMSUNG', 'Galaxy A54', NULL, 256, 'A', 14000, 17000, 15500, 'EGP', 'MARKET_ANALYSIS', 300, NOW()),
  ('price_a34_128_a', 'SAMSUNG', 'Galaxy A34', NULL, 128, 'A', 10000, 13000, 11500, 'EGP', 'MARKET_ANALYSIS', 350, NOW()),
  ('price_fold5_256_a', 'SAMSUNG', 'Galaxy Z Fold5', NULL, 256, 'A', 75000, 85000, 80000, 'EGP', 'MARKET_ANALYSIS', 50, NOW()),
  ('price_flip5_256_a', 'SAMSUNG', 'Galaxy Z Flip5', NULL, 256, 'A', 42000, 48000, 45000, 'EGP', 'MARKET_ANALYSIS', 80, NOW()),

  -- Xiaomi (أسعار شاومي)
  ('price_xiaomi_14_ultra_512_a', 'XIAOMI', 'Xiaomi 14 Ultra', NULL, 512, 'A', 55000, 62000, 58500, 'EGP', 'MARKET_ANALYSIS', 60, NOW()),
  ('price_xiaomi_14_pro_256_a', 'XIAOMI', 'Xiaomi 14 Pro', NULL, 256, 'A', 38000, 44000, 41000, 'EGP', 'MARKET_ANALYSIS', 80, NOW()),
  ('price_xiaomi_13_256_a', 'XIAOMI', 'Xiaomi 13', NULL, 256, 'A', 25000, 30000, 27500, 'EGP', 'MARKET_ANALYSIS', 120, NOW()),
  ('price_redmi_note_13_pro_256_a', 'XIAOMI', 'Redmi Note 13 Pro+', NULL, 256, 'A', 15000, 18000, 16500, 'EGP', 'MARKET_ANALYSIS', 200, NOW()),
  ('price_redmi_note_13_128_a', 'XIAOMI', 'Redmi Note 13', NULL, 128, 'A', 8000, 10000, 9000, 'EGP', 'MARKET_ANALYSIS', 350, NOW()),
  ('price_poco_x6_pro_256_a', 'XIAOMI', 'POCO X6 Pro', NULL, 256, 'A', 14000, 17000, 15500, 'EGP', 'MARKET_ANALYSIS', 150, NOW()),

  -- OPPO (أسعار أوبو)
  ('price_oppo_find_x7_ultra_512_a', 'OPPO', 'Find X7 Ultra', NULL, 512, 'A', 50000, 58000, 54000, 'EGP', 'MARKET_ANALYSIS', 40, NOW()),
  ('price_oppo_reno_11_pro_256_a', 'OPPO', 'Reno 11 Pro', NULL, 256, 'A', 25000, 30000, 27500, 'EGP', 'MARKET_ANALYSIS', 100, NOW()),
  ('price_oppo_reno_11_256_a', 'OPPO', 'Reno 11', NULL, 256, 'A', 18000, 22000, 20000, 'EGP', 'MARKET_ANALYSIS', 150, NOW()),
  ('price_oppo_a78_128_a', 'OPPO', 'A78', NULL, 128, 'A', 8000, 10000, 9000, 'EGP', 'MARKET_ANALYSIS', 250, NOW()),

  -- Vivo (أسعار فيفو)
  ('price_vivo_x100_pro_256_a', 'VIVO', 'X100 Pro', NULL, 256, 'A', 42000, 48000, 45000, 'EGP', 'MARKET_ANALYSIS', 50, NOW()),
  ('price_vivo_v30_pro_256_a', 'VIVO', 'V30 Pro', NULL, 256, 'A', 22000, 27000, 24500, 'EGP', 'MARKET_ANALYSIS', 80, NOW()),
  ('price_vivo_y100_128_a', 'VIVO', 'Y100', NULL, 128, 'A', 10000, 13000, 11500, 'EGP', 'MARKET_ANALYSIS', 150, NOW()),

  -- Realme (أسعار ريلمي)
  ('price_realme_gt5_pro_256_a', 'REALME', 'GT5 Pro', NULL, 256, 'A', 28000, 33000, 30500, 'EGP', 'MARKET_ANALYSIS', 60, NOW()),
  ('price_realme_12_pro_plus_256_a', 'REALME', '12 Pro+', NULL, 256, 'A', 18000, 22000, 20000, 'EGP', 'MARKET_ANALYSIS', 100, NOW()),
  ('price_realme_c67_128_a', 'REALME', 'C67', NULL, 128, 'A', 6000, 8000, 7000, 'EGP', 'MARKET_ANALYSIS', 300, NOW()),

  -- Huawei (أسعار هواوي)
  ('price_huawei_mate_60_pro_512_a', 'HUAWEI', 'Mate 60 Pro', NULL, 512, 'A', 55000, 65000, 60000, 'EGP', 'MARKET_ANALYSIS', 30, NOW()),
  ('price_huawei_nova_12_256_a', 'HUAWEI', 'Nova 12', NULL, 256, 'A', 18000, 22000, 20000, 'EGP', 'MARKET_ANALYSIS', 80, NOW()),

  -- OnePlus (أسعار ون بلس)
  ('price_oneplus_12_256_a', 'ONEPLUS', 'OnePlus 12', NULL, 256, 'A', 42000, 48000, 45000, 'EGP', 'MARKET_ANALYSIS', 60, NOW()),
  ('price_oneplus_nord_3_256_a', 'ONEPLUS', 'Nord 3', NULL, 256, 'A', 18000, 22000, 20000, 'EGP', 'MARKET_ANALYSIS', 100, NOW()),

  -- Google Pixel (أسعار جوجل بيكسل)
  ('price_pixel_8_pro_256_a', 'GOOGLE', 'Pixel 8 Pro', NULL, 256, 'A', 42000, 48000, 45000, 'EGP', 'MARKET_ANALYSIS', 40, NOW()),
  ('price_pixel_8_128_a', 'GOOGLE', 'Pixel 8', NULL, 128, 'A', 32000, 37000, 34500, 'EGP', 'MARKET_ANALYSIS', 60, NOW()),

  -- Infinix (أسعار انفينكس)
  ('price_infinix_note_40_pro_256_a', 'INFINIX', 'Note 40 Pro', NULL, 256, 'A', 12000, 15000, 13500, 'EGP', 'MARKET_ANALYSIS', 200, NOW()),
  ('price_infinix_hot_40_pro_256_a', 'INFINIX', 'Hot 40 Pro', NULL, 256, 'A', 7000, 9000, 8000, 'EGP', 'MARKET_ANALYSIS', 350, NOW()),

  -- Tecno (أسعار تكنو)
  ('price_tecno_camon_30_pro_256_a', 'TECNO', 'Camon 30 Pro', NULL, 256, 'A', 13000, 16000, 14500, 'EGP', 'MARKET_ANALYSIS', 150, NOW()),
  ('price_tecno_spark_20_pro_256_a', 'TECNO', 'Spark 20 Pro', NULL, 256, 'A', 6000, 8000, 7000, 'EGP', 'MARKET_ANALYSIS', 400, NOW())
ON CONFLICT (id) DO UPDATE SET
  min_price = EXCLUDED.min_price,
  max_price = EXCLUDED.max_price,
  avg_price = EXCLUDED.avg_price,
  last_updated = NOW();

-- =====================================================
-- Mobile Listings (إعلانات الموبايلات)
-- =====================================================
INSERT INTO mobile_listings (id, seller_id, title, description, brand, model, variant, color, storage_capacity, ram_size, condition, condition_notes, price, negotiable, accepts_barter, barter_preferences, images, battery_health, screen_condition, body_condition, accessories, original_box, warranty, warranty_expiry, purchase_date, governorate, city, area, status, imei_verified, views_count, favorites_count, created_at, expires_at)
VALUES
  -- iPhone Listings (إعلانات آيفون)
  ('mobile_1', 'user_test_1', 'iPhone 15 Pro Max 256GB - تيتانيوم طبيعي - كالجديد', 'آيفون 15 برو ماكس بحالة ممتازة جداً - استخدام شهرين فقط. البطارية 100% والشاشة بدون أي خدش. يأتي مع العلبة الأصلية والشاحن والكابل.', 'APPLE', 'iPhone 15 Pro Max', 'Natural Titanium', 'تيتانيوم طبيعي', 256, 8, 'A', 'كالجديد تماماً - بدون أي علامات استخدام', 73000, true, true, '{"brands": ["SAMSUNG", "APPLE"], "models": ["Galaxy S24 Ultra", "iPhone 14 Pro Max"], "min_condition": "B", "accepts_cash_difference": true, "max_cash_difference": 15000}', '["/mobiles/iphone15promax-natural-1.jpg", "/mobiles/iphone15promax-natural-2.jpg", "/mobiles/iphone15promax-natural-3.jpg"]', 100, 'EXCELLENT', 'EXCELLENT', '["الشاحن الأصلي", "الكابل الأصلي", "العلبة الأصلية"]', true, true, NOW() + INTERVAL '10 months', NOW() - INTERVAL '2 months', 'القاهرة', 'مدينة نصر', 'عباس العقاد', 'ACTIVE', true, 450, 35, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),

  ('mobile_2', 'user_test_2', 'iPhone 14 Pro 256GB Deep Purple - ضمان ساري', 'آيفون 14 برو باللون البنفسجي الغامق. الجهاز بحالة ممتازة مع ضمان أبل ساري لمدة 6 أشهر إضافية.', 'APPLE', 'iPhone 14 Pro', 'Deep Purple', 'بنفسجي غامق', 256, 6, 'A', 'استخدام خفيف - حالة ممتازة', 48000, true, true, '{"brands": ["APPLE", "SAMSUNG"], "models": ["iPhone 13 Pro", "Galaxy S23"], "min_condition": "B", "accepts_cash_difference": true}', '["/mobiles/iphone14pro-purple-1.jpg", "/mobiles/iphone14pro-purple-2.jpg"]', 92, 'EXCELLENT', 'EXCELLENT', '["الشاحن الأصلي", "الكابل", "واقي شاشة"]', true, true, NOW() + INTERVAL '6 months', NOW() - INTERVAL '6 months', 'الإسكندرية', 'سموحة', 'شارع فوزي معاذ', 'ACTIVE', true, 380, 28, NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days'),

  ('mobile_3', 'user_test_3', 'iPhone 13 128GB Midnight - سعر مميز', 'آيفون 13 باللون الأسود. جهاز نظيف وبحالة جيدة جداً. مناسب لمن يبحث عن آيفون بسعر معقول.', 'APPLE', 'iPhone 13', 'Midnight', 'أسود', 128, 4, 'B', 'خدوش بسيطة جداً على الإطار الجانبي', 26000, true, true, '{"brands": ["APPLE", "SAMSUNG", "XIAOMI"], "min_condition": "C", "accepts_cash_difference": true}', '["/mobiles/iphone13-black-1.jpg", "/mobiles/iphone13-black-2.jpg"]', 85, 'GOOD', 'GOOD', '["شاحن غير أصلي", "جراب"]', false, false, NULL, NOW() - INTERVAL '18 months', 'الجيزة', 'الدقي', 'شارع التحرير', 'ACTIVE', true, 520, 42, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'),

  ('mobile_4', 'user_test_1', 'iPhone 12 Pro Max 256GB Pacific Blue', 'آيفون 12 برو ماكس - الجهاز يعمل بشكل ممتاز. البطارية تم تغييرها في مركز معتمد.', 'APPLE', 'iPhone 12 Pro Max', 'Pacific Blue', 'أزرق', 256, 6, 'B', 'تم تغيير البطارية - الشاشة أصلية', 22000, true, false, '{}', '["/mobiles/iphone12promax-blue-1.jpg"]', 100, 'EXCELLENT', 'GOOD', '["الكابل"]', false, false, NULL, NOW() - INTERVAL '30 months', 'القاهرة', 'المعادي', 'دجلة', 'ACTIVE', true, 290, 18, NOW() - INTERVAL '12 days', NOW() + INTERVAL '18 days'),

  -- Samsung Listings (إعلانات سامسونج)
  ('mobile_5', 'user_test_4', 'Samsung Galaxy S24 Ultra 256GB - أسود - جديد', 'سامسونج جالاكسي S24 الترا - جهاز جديد بالكرتونة. ضمان سنة كاملة من الموزع المعتمد.', 'SAMSUNG', 'Galaxy S24 Ultra', NULL, 'أسود فانتوم', 256, 12, 'A', 'جديد بالكرتونة - لم يستخدم', 70000, false, true, '{"brands": ["APPLE"], "models": ["iPhone 15 Pro Max", "iPhone 15 Pro"], "min_condition": "A", "accepts_cash_difference": true}', '["/mobiles/s24ultra-black-1.jpg", "/mobiles/s24ultra-black-2.jpg", "/mobiles/s24ultra-black-3.jpg"]', 100, 'NEW', 'NEW', '["الشاحن الأصلي 45W", "الكابل", "S Pen", "الجراب الأصلي"]', true, true, NOW() + INTERVAL '12 months', NOW() - INTERVAL '1 week', 'القاهرة', 'التجمع الخامس', 'شارع التسعين', 'ACTIVE', true, 680, 55, NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),

  ('mobile_6', 'user_test_2', 'Samsung Galaxy S23 Ultra 512GB - أخضر', 'جالاكسي S23 الترا بسعة 512 جيجا. الجهاز بحالة ممتازة مع كل الملحقات الأصلية.', 'SAMSUNG', 'Galaxy S23 Ultra', NULL, 'أخضر', 512, 12, 'A', 'حالة ممتازة - استخدام 4 أشهر', 52000, true, true, '{"brands": ["APPLE", "SAMSUNG"], "min_condition": "B", "accepts_cash_difference": true}', '["/mobiles/s23ultra-green-1.jpg", "/mobiles/s23ultra-green-2.jpg"]', 95, 'EXCELLENT', 'EXCELLENT', '["الشاحن الأصلي", "S Pen", "العلبة"]', true, true, NOW() + INTERVAL '8 months', NOW() - INTERVAL '4 months', 'الجيزة', 'المهندسين', 'شارع السودان', 'ACTIVE', true, 420, 32, NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days'),

  ('mobile_7', 'user_test_5', 'Samsung Galaxy Z Fold5 256GB - كريمي', 'سامسونج فولد 5 - تجربة الشاشة القابلة للطي. الجهاز بحالة ممتازة بدون أي عيوب.', 'SAMSUNG', 'Galaxy Z Fold5', NULL, 'كريمي', 256, 12, 'A', 'حالة ممتازة - الشاشة الداخلية مثالية', 78000, true, true, '{"brands": ["APPLE"], "models": ["iPhone 15 Pro Max"], "accepts_cash_difference": true}', '["/mobiles/fold5-cream-1.jpg", "/mobiles/fold5-cream-2.jpg"]', 93, 'EXCELLENT', 'EXCELLENT', '["الشاحن", "S Pen Fold Edition", "الجراب الأصلي"]', true, true, NOW() + INTERVAL '6 months', NOW() - INTERVAL '5 months', 'القاهرة', 'مصر الجديدة', 'شارع الميرغني', 'ACTIVE', true, 350, 25, NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days'),

  ('mobile_8', 'user_test_3', 'Samsung Galaxy A54 256GB - أبيض', 'جالاكسي A54 بسعر مميز جداً. جهاز اقتصادي بمواصفات قوية.', 'SAMSUNG', 'Galaxy A54', NULL, 'أبيض', 256, 8, 'B', 'استخدام عادي - حالة جيدة جداً', 14500, true, true, '{"brands": ["SAMSUNG", "XIAOMI", "OPPO"], "min_condition": "C", "accepts_cash_difference": true}', '["/mobiles/a54-white-1.jpg"]', 88, 'GOOD', 'GOOD', '["شاحن"]', false, false, NULL, NOW() - INTERVAL '8 months', 'الدقهلية', 'المنصورة', 'حي الجامعة', 'ACTIVE', true, 180, 15, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),

  -- Xiaomi Listings (إعلانات شاومي)
  ('mobile_9', 'user_test_1', 'Xiaomi 14 Ultra 512GB - أسود - كاميرا Leica', 'شاومي 14 الترا مع كاميرا لايكا الاحترافية. أفضل كاميرا موبايل في السوق.', 'XIAOMI', 'Xiaomi 14 Ultra', NULL, 'أسود', 512, 16, 'A', 'جديد - استخدام أسبوع واحد فقط', 58000, true, true, '{"brands": ["APPLE", "SAMSUNG"], "min_condition": "A", "accepts_cash_difference": true}', '["/mobiles/xiaomi14ultra-black-1.jpg", "/mobiles/xiaomi14ultra-black-2.jpg"]', 100, 'EXCELLENT', 'EXCELLENT', '["الشاحن 90W", "الجراب", "واقي الكاميرا"]', true, true, NOW() + INTERVAL '11 months', NOW() - INTERVAL '1 week', 'القاهرة', 'الشروق', 'الحي الأول', 'ACTIVE', true, 280, 22, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'),

  ('mobile_10', 'user_test_4', 'Redmi Note 13 Pro+ 256GB - بنفسجي', 'ريدمي نوت 13 برو بلس بشاشة AMOLED وشحن سريع 120W. سعر لا يقاوم!', 'XIAOMI', 'Redmi Note 13 Pro+', NULL, 'بنفسجي', 256, 12, 'A', 'جديد بالكرتونة', 16000, false, true, '{"brands": ["XIAOMI", "REALME", "OPPO"], "min_condition": "B", "accepts_cash_difference": true}', '["/mobiles/redminote13proplus-purple-1.jpg"]', 100, 'NEW', 'NEW', '["الشاحن 120W الأصلي", "الجراب", "واقي شاشة"]', true, true, NOW() + INTERVAL '12 months', NOW(), 'الغربية', 'طنطا', 'شارع سعيد', 'ACTIVE', false, 420, 38, NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days'),

  ('mobile_11', 'user_test_2', 'POCO X6 Pro 256GB - أصفر', 'بوكو X6 برو - أداء خارق بسعر منافس. مثالي للألعاب.', 'XIAOMI', 'POCO X6 Pro', NULL, 'أصفر', 256, 12, 'B', 'استخدام 3 أشهر - حالة جيدة جداً', 14000, true, true, '{"brands": ["XIAOMI", "REALME"], "min_condition": "C", "accepts_cash_difference": true}', '["/mobiles/pocox6pro-yellow-1.jpg"]', 92, 'GOOD', 'GOOD', '["الشاحن"]', true, false, NULL, NOW() - INTERVAL '3 months', 'القاهرة', '6 أكتوبر', 'الحي الثامن', 'ACTIVE', true, 310, 25, NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days'),

  -- OPPO Listings (إعلانات أوبو)
  ('mobile_12', 'user_test_5', 'OPPO Find X7 Ultra 512GB - أسود', 'أوبو فايند X7 الترا - كاميرا Hasselblad مع أفضل زووم في السوق.', 'OPPO', 'Find X7 Ultra', NULL, 'أسود', 512, 16, 'A', 'حالة ممتازة كالجديد', 54000, true, true, '{"brands": ["APPLE", "SAMSUNG"], "min_condition": "B", "accepts_cash_difference": true}', '["/mobiles/findx7ultra-black-1.jpg", "/mobiles/findx7ultra-black-2.jpg"]', 97, 'EXCELLENT', 'EXCELLENT', '["الشاحن 100W", "الجراب", "العلبة"]', true, true, NOW() + INTERVAL '9 months', NOW() - INTERVAL '3 months', 'القاهرة', 'العبور', 'الحي الأول', 'ACTIVE', true, 180, 14, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),

  ('mobile_13', 'user_test_3', 'OPPO Reno 11 Pro 256GB - رمادي', 'أوبو رينو 11 برو بتصميم أنيق وكاميرا بورتريه احترافية.', 'OPPO', 'Reno 11 Pro', NULL, 'رمادي', 256, 12, 'A', 'جديد - استخدام شهر', 27000, true, false, '{}', '["/mobiles/reno11pro-gray-1.jpg"]', 99, 'EXCELLENT', 'EXCELLENT', '["الشاحن 80W", "الجراب الأصلي"]', true, true, NOW() + INTERVAL '11 months', NOW() - INTERVAL '1 month', 'الإسكندرية', 'جليم', 'شارع أبو قير', 'ACTIVE', true, 220, 18, NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days'),

  -- Vivo Listings (إعلانات فيفو)
  ('mobile_14', 'user_test_4', 'Vivo X100 Pro 256GB - أزرق', 'فيفو X100 برو بمعالج Dimensity 9300 وكاميرا ZEISS.', 'VIVO', 'X100 Pro', NULL, 'أزرق', 256, 16, 'A', 'جديد بالضمان', 45000, true, true, '{"brands": ["SAMSUNG", "XIAOMI"], "min_condition": "A", "accepts_cash_difference": true}', '["/mobiles/vivox100pro-blue-1.jpg"]', 100, 'NEW', 'NEW', '["الشاحن 100W", "الكابل", "الجراب"]', true, true, NOW() + INTERVAL '12 months', NOW(), 'القاهرة', 'المعادي', 'كورنيش المعادي', 'ACTIVE', false, 150, 12, NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),

  -- Realme Listings (إعلانات ريلمي)
  ('mobile_15', 'user_test_1', 'Realme GT5 Pro 256GB - أخضر', 'ريلمي GT5 برو بأداء فائق ومعالج Snapdragon 8 Gen 3.', 'REALME', 'GT5 Pro', NULL, 'أخضر', 256, 16, 'A', 'حالة ممتازة', 30000, true, true, '{"brands": ["XIAOMI", "ONEPLUS"], "min_condition": "B", "accepts_cash_difference": true}', '["/mobiles/realmegt5pro-green-1.jpg"]', 96, 'EXCELLENT', 'EXCELLENT', '["الشاحن 100W"]', true, false, NULL, NOW() - INTERVAL '2 months', 'الجيزة', 'الشيخ زايد', 'الحي الأول', 'ACTIVE', true, 195, 16, NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days'),

  -- Honor Listings (إعلانات هونر)
  ('mobile_16', 'user_test_2', 'Honor Magic6 Pro 512GB - أسود', 'هونر ماجيك 6 برو بكاميرا متطورة وأداء قوي.', 'HONOR', 'Magic6 Pro', NULL, 'أسود', 512, 16, 'A', 'جديد - فتح الكرتونة للتجربة فقط', 48000, true, true, '{"brands": ["HUAWEI", "SAMSUNG"], "min_condition": "A", "accepts_cash_difference": true}', '["/mobiles/honor-magic6pro-black-1.jpg"]', 100, 'NEW', 'NEW', '["الشاحن 80W", "العلبة كاملة"]', true, true, NOW() + INTERVAL '12 months', NOW(), 'القاهرة', 'مدينة نصر', 'المنطقة العاشرة', 'ACTIVE', false, 120, 10, NOW() - INTERVAL '1 day', NOW() + INTERVAL '29 days'),

  -- Google Pixel Listings (إعلانات جوجل بيكسل)
  ('mobile_17', 'user_test_5', 'Google Pixel 8 Pro 256GB - أزرق', 'جوجل بيكسل 8 برو بأفضل كاميرا وتجربة أندرويد نقية.', 'GOOGLE', 'Pixel 8 Pro', NULL, 'Bay Blue', 256, 12, 'A', 'حالة ممتازة - استخدام شهرين', 44000, true, true, '{"brands": ["APPLE", "SAMSUNG"], "min_condition": "B", "accepts_cash_difference": true}', '["/mobiles/pixel8pro-blue-1.jpg", "/mobiles/pixel8pro-blue-2.jpg"]', 97, 'EXCELLENT', 'EXCELLENT', '["الشاحن", "الكابل USB-C"]', true, true, NOW() + INTERVAL '10 months', NOW() - INTERVAL '2 months', 'القاهرة', 'المقطم', 'الهضبة الوسطى', 'ACTIVE', true, 165, 13, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),

  -- Infinix Listings (إعلانات انفينكس)
  ('mobile_18', 'user_test_3', 'Infinix Note 40 Pro 256GB - ذهبي', 'انفينكس نوت 40 برو بسعر اقتصادي ومواصفات ممتازة.', 'INFINIX', 'Note 40 Pro', NULL, 'ذهبي', 256, 12, 'A', 'جديد بالكرتونة', 13000, false, true, '{"brands": ["INFINIX", "TECNO", "XIAOMI"], "min_condition": "B", "accepts_cash_difference": true}', '["/mobiles/infinixnote40pro-gold-1.jpg"]', 100, 'NEW', 'NEW', '["الشاحن 68W", "الجراب"]', true, true, NOW() + INTERVAL '12 months', NOW(), 'الشرقية', 'الزقازيق', 'وسط المدينة', 'ACTIVE', false, 280, 22, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'),

  -- Tecno Listings (إعلانات تكنو)
  ('mobile_19', 'user_test_4', 'Tecno Camon 30 Pro 256GB - أخضر', 'تكنو كامون 30 برو بكاميرا 50 ميجابيكسل وشاشة AMOLED.', 'TECNO', 'Camon 30 Pro', NULL, 'أخضر', 256, 12, 'A', 'جديد - لم يستخدم', 14000, false, true, '{"brands": ["TECNO", "INFINIX"], "min_condition": "B", "accepts_cash_difference": true}', '["/mobiles/tecnocamon30pro-green-1.jpg"]', 100, 'NEW', 'NEW', '["الشاحن 70W", "السماعات"]', true, true, NOW() + INTERVAL '12 months', NOW(), 'المنيا', 'مغاغة', 'وسط المدينة', 'ACTIVE', false, 150, 12, NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days'),

  -- OnePlus Listings (إعلانات ون بلس)
  ('mobile_20', 'user_test_1', 'OnePlus 12 256GB - أخضر Flowy Emerald', 'ون بلس 12 بتجربة OxygenOS السلسة وأداء خارق.', 'ONEPLUS', 'OnePlus 12', NULL, 'Flowy Emerald', 256, 16, 'A', 'حالة ممتازة كالجديد', 44000, true, true, '{"brands": ["SAMSUNG", "XIAOMI"], "min_condition": "A", "accepts_cash_difference": true}', '["/mobiles/oneplus12-green-1.jpg", "/mobiles/oneplus12-green-2.jpg"]', 98, 'EXCELLENT', 'EXCELLENT', '["الشاحن 100W", "الجراب الأصلي"]', true, true, NOW() + INTERVAL '10 months', NOW() - INTERVAL '2 months', 'القاهرة', 'الرحاب', 'المرحلة الأولى', 'ACTIVE', true, 210, 17, NOW() - INTERVAL '4 days', NOW() + INTERVAL '26 days')

ON CONFLICT (id) DO UPDATE SET
  status = EXCLUDED.status,
  views_count = EXCLUDED.views_count,
  favorites_count = EXCLUDED.favorites_count;

-- =====================================================
-- IMEI Verifications (تحققات IMEI)
-- =====================================================
INSERT INTO mobile_imei_verifications (id, listing_id, imei_number, verification_status, is_blacklisted, is_stolen, carrier_lock_status, ntra_registered, original_device_info, verification_source, verified_at, created_at)
VALUES
  ('imei_1', 'mobile_1', '353456789012345', 'VERIFIED', false, false, 'UNLOCKED', true, '{"brand": "Apple", "model": "iPhone 15 Pro Max", "manufacturing_date": "2023-09"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days'),
  ('imei_2', 'mobile_2', '357890123456789', 'VERIFIED', false, false, 'UNLOCKED', true, '{"brand": "Apple", "model": "iPhone 14 Pro", "manufacturing_date": "2023-02"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '7 days', NOW() - INTERVAL '8 days'),
  ('imei_3', 'mobile_3', '351234567890123', 'VERIFIED', false, false, 'UNLOCKED', true, '{"brand": "Apple", "model": "iPhone 13", "manufacturing_date": "2022-01"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
  ('imei_4', 'mobile_4', '359876543210987', 'VERIFIED', false, false, 'UNLOCKED', true, '{"brand": "Apple", "model": "iPhone 12 Pro Max", "manufacturing_date": "2021-03"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '11 days', NOW() - INTERVAL '12 days'),
  ('imei_5', 'mobile_5', '354321098765432', 'VERIFIED', false, false, 'UNLOCKED', true, '{"brand": "Samsung", "model": "Galaxy S24 Ultra", "manufacturing_date": "2024-01"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days'),
  ('imei_6', 'mobile_6', '352109876543210', 'VERIFIED', false, false, 'UNLOCKED', true, '{"brand": "Samsung", "model": "Galaxy S23 Ultra", "manufacturing_date": "2023-03"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days'),
  ('imei_7', 'mobile_7', '358765432109876', 'VERIFIED', false, false, 'UNLOCKED', true, '{"brand": "Samsung", "model": "Galaxy Z Fold5", "manufacturing_date": "2023-08"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days'),
  ('imei_9', 'mobile_9', '351098765432109', 'VERIFIED', false, false, 'UNLOCKED', false, '{"brand": "Xiaomi", "model": "Xiaomi 14 Ultra", "manufacturing_date": "2024-02"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '2 days', NOW() - INTERVAL '3 days'),
  ('imei_11', 'mobile_11', '356789012345678', 'VERIFIED', false, false, 'UNLOCKED', true, '{"brand": "Xiaomi", "model": "POCO X6 Pro", "manufacturing_date": "2024-01"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '6 days', NOW() - INTERVAL '7 days'),
  ('imei_12', 'mobile_12', '353210987654321', 'VERIFIED', false, false, 'UNLOCKED', true, '{"brand": "OPPO", "model": "Find X7 Ultra", "manufacturing_date": "2024-01"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days'),
  ('imei_15', 'mobile_15', '357654321098765', 'VERIFIED', false, false, 'UNLOCKED', true, '{"brand": "Realme", "model": "GT5 Pro", "manufacturing_date": "2023-12"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '5 days', NOW() - INTERVAL '6 days'),
  ('imei_17', 'mobile_17', '354098765432109', 'VERIFIED', false, false, 'UNLOCKED', false, '{"brand": "Google", "model": "Pixel 8 Pro", "manufacturing_date": "2023-10"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '4 days', NOW() - INTERVAL '5 days'),
  ('imei_20', 'mobile_20', '352987654321098', 'VERIFIED', false, false, 'UNLOCKED', true, '{"brand": "OnePlus", "model": "OnePlus 12", "manufacturing_date": "2024-01"}', 'GSMA_IMEI_DB', NOW() - INTERVAL '3 days', NOW() - INTERVAL '4 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Device Diagnostics (تقارير فحص الأجهزة)
-- =====================================================
INSERT INTO mobile_device_diagnostics (id, listing_id, overall_score, battery_health, screen_test, touch_test, speaker_test, microphone_test, camera_test, wifi_test, bluetooth_test, gps_test, fingerprint_test, face_id_test, accelerometer_test, gyroscope_test, proximity_test, tested_at, report_url)
VALUES
  ('diag_1', 'mobile_1', 98, 100, true, true, true, true, true, true, true, true, true, true, true, true, true, NOW() - INTERVAL '5 days', '/reports/diag_mobile_1.pdf'),
  ('diag_2', 'mobile_2', 95, 92, true, true, true, true, true, true, true, true, true, true, true, true, true, NOW() - INTERVAL '8 days', '/reports/diag_mobile_2.pdf'),
  ('diag_5', 'mobile_5', 100, 100, true, true, true, true, true, true, true, true, true, true, true, true, true, NOW() - INTERVAL '2 days', '/reports/diag_mobile_5.pdf'),
  ('diag_6', 'mobile_6', 97, 95, true, true, true, true, true, true, true, true, true, true, true, true, true, NOW() - INTERVAL '6 days', '/reports/diag_mobile_6.pdf'),
  ('diag_7', 'mobile_7', 96, 93, true, true, true, true, true, true, true, true, true, true, true, true, true, NOW() - INTERVAL '4 days', '/reports/diag_mobile_7.pdf'),
  ('diag_9', 'mobile_9', 99, 100, true, true, true, true, true, true, true, true, true, true, true, true, true, NOW() - INTERVAL '3 days', '/reports/diag_mobile_9.pdf'),
  ('diag_12', 'mobile_12', 98, 97, true, true, true, true, true, true, true, true, true, true, true, true, true, NOW() - INTERVAL '5 days', '/reports/diag_mobile_12.pdf'),
  ('diag_17', 'mobile_17', 97, 97, true, true, true, true, true, true, true, true, true, true, true, true, true, NOW() - INTERVAL '5 days', '/reports/diag_mobile_17.pdf'),
  ('diag_20', 'mobile_20', 98, 98, true, true, true, true, true, true, true, true, true, true, true, true, true, NOW() - INTERVAL '4 days', '/reports/diag_mobile_20.pdf')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Mobile Transactions (معاملات الموبايلات)
-- =====================================================
INSERT INTO mobile_transactions (id, listing_id, buyer_id, seller_id, transaction_type, status, price, escrow_amount, escrow_status, payment_method, delivery_method, meetup_location, shipping_address, inspection_period_days, inspection_deadline, buyer_confirmed_receipt, seller_confirmed_shipment, platform_fee, platform_fee_paid, notes, created_at, completed_at)
VALUES
  -- Completed Sales (مبيعات مكتملة)
  ('trans_1', 'mobile_3', 'user_test_4', 'user_test_3', 'SALE', 'COMPLETED', 26000, 26000, 'RELEASED', 'ESCROW', 'MEETUP', 'محطة مترو السادات - القاهرة', NULL, 5, NOW() - INTERVAL '10 days', true, true, 520, true, 'تمت المعاملة بنجاح', NOW() - INTERVAL '20 days', NOW() - INTERVAL '10 days'),

  ('trans_2', 'mobile_8', 'user_test_1', 'user_test_3', 'SALE', 'COMPLETED', 14500, 14500, 'RELEASED', 'ESCROW', 'SHIPPING', NULL, '15 شارع التحرير، الدقي، الجيزة', 5, NOW() - INTERVAL '5 days', true, true, 290, true, 'تم التوصيل بنجاح', NOW() - INTERVAL '15 days', NOW() - INTERVAL '5 days'),

  -- Active Transactions (معاملات نشطة)
  ('trans_3', 'mobile_1', 'user_test_5', 'user_test_1', 'SALE', 'IN_INSPECTION', 72000, 72000, 'HELD', 'ESCROW', 'MEETUP', 'كافيه ستاربكس - سيتي ستارز', NULL, 5, NOW() + INTERVAL '3 days', true, true, 1440, false, 'في فترة الفحص', NOW() - INTERVAL '2 days', NULL),

  ('trans_4', 'mobile_5', 'user_test_2', 'user_test_4', 'SALE', 'PENDING_DELIVERY', 69000, 69000, 'HELD', 'ESCROW', 'SHIPPING', NULL, '25 شارع فوزي معاذ، سموحة، الإسكندرية', 5, NULL, false, true, 1380, false, 'تم الشحن - في انتظار الاستلام', NOW() - INTERVAL '3 days', NULL),

  -- Barter Transaction (معاملة مقايضة)
  ('trans_5', 'mobile_2', 'user_test_3', 'user_test_2', 'BARTER', 'COMPLETED', 0, 5000, 'RELEASED', 'ESCROW', 'MEETUP', 'مول العرب - 6 أكتوبر', NULL, 5, NOW() - INTERVAL '8 days', true, true, 0, false, 'مقايضة ناجحة - تم دفع فرق 5000 جنيه', NOW() - INTERVAL '18 days', NOW() - INTERVAL '8 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Barter Matches (مطابقات المقايضة)
-- =====================================================
INSERT INTO mobile_barter_matches (id, listing1_id, listing2_id, match_type, match_score, value_difference, status, algorithm_version, match_factors, created_at)
VALUES
  ('match_1', 'mobile_1', 'mobile_5', 'DIRECT', 85, 3000, 'PENDING', '2.0', '{"brand_match": 0.7, "condition_match": 1.0, "price_proximity": 0.9, "location_proximity": 0.8}', NOW() - INTERVAL '1 day'),
  ('match_2', 'mobile_6', 'mobile_9', 'DIRECT', 78, 6500, 'PENDING', '2.0', '{"brand_match": 0.6, "condition_match": 1.0, "price_proximity": 0.85, "location_proximity": 0.7}', NOW() - INTERVAL '2 days'),
  ('match_3', 'mobile_2', 'mobile_15', 'DIRECT', 72, 18000, 'ACCEPTED', '2.0', '{"brand_match": 0.5, "condition_match": 1.0, "price_proximity": 0.6, "location_proximity": 0.9}', NOW() - INTERVAL '5 days'),
  ('match_4', 'mobile_11', 'mobile_18', 'DIRECT', 80, 1000, 'PENDING', '2.0', '{"brand_match": 0.8, "condition_match": 0.9, "price_proximity": 0.95, "location_proximity": 0.6}', NOW() - INTERVAL '1 day'),
  ('match_5', 'mobile_7', 'mobile_1', 'DIRECT', 75, 5000, 'PENDING', '2.0', '{"brand_match": 0.6, "condition_match": 1.0, "price_proximity": 0.85, "location_proximity": 0.8}', NOW() - INTERVAL '3 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Barter Proposals (عروض المقايضة)
-- =====================================================
INSERT INTO mobile_barter_proposals (id, match_id, proposer_id, proposer_listing_id, target_listing_id, proposed_cash_difference, message, status, created_at, responded_at)
VALUES
  ('proposal_1', 'match_1', 'user_test_1', 'mobile_1', 'mobile_5', 3000, 'مهتم بالمقايضة - الجهاز نظيف جداً وبحالة ممتازة. مستعد لدفع فرق 3000 جنيه.', 'PENDING', NOW() - INTERVAL '12 hours', NULL),
  ('proposal_2', 'match_2', 'user_test_2', 'mobile_6', 'mobile_9', 6500, 'جهازي S23 Ultra بحالة ممتازة - مستعد للمقايضة مع دفع الفرق', 'PENDING', NOW() - INTERVAL '1 day', NULL),
  ('proposal_3', 'match_3', 'user_test_3', 'mobile_15', 'mobile_2', -18000, 'مستعد لاستلام فرق 18000 جنيه مع المقايضة', 'ACCEPTED', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),
  ('proposal_4', 'match_4', 'user_test_3', 'mobile_18', 'mobile_11', 1000, 'موافق على المقايضة مع دفع فرق بسيط', 'PENDING', NOW() - INTERVAL '6 hours', NULL)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Mobile Reviews (تقييمات الموبايلات)
-- =====================================================
INSERT INTO mobile_reviews (id, transaction_id, reviewer_id, reviewed_user_id, listing_id, rating, title, comment, device_as_described, communication_rating, shipping_rating, is_verified_purchase, helpful_count, created_at)
VALUES
  ('review_1', 'trans_1', 'user_test_4', 'user_test_3', 'mobile_3', 5, 'جهاز ممتاز كما في الوصف', 'الجهاز وصل بحالة ممتازة تماماً كما في الوصف. البائع متعاون جداً والتواصل كان سهل. أنصح بالتعامل معه.', true, 5, 5, true, 12, NOW() - INTERVAL '10 days'),
  ('review_2', 'trans_1', 'user_test_3', 'user_test_4', NULL, 5, 'مشتري ممتاز', 'تعامل محترم وسريع. تم إتمام المعاملة بسلاسة.', true, 5, 5, true, 8, NOW() - INTERVAL '9 days'),
  ('review_3', 'trans_2', 'user_test_1', 'user_test_3', 'mobile_8', 4, 'جهاز جيد بسعر مناسب', 'الجهاز بحالة جيدة. توجد بعض الخدوش البسيطة كما ذكر البائع. سعر مناسب جداً.', true, 5, 4, true, 6, NOW() - INTERVAL '5 days'),
  ('review_4', 'trans_5', 'user_test_3', 'user_test_2', 'mobile_2', 5, 'مقايضة ناجحة', 'تجربة مقايضة ممتازة. الجهاز مطابق للوصف والبائع كان صريح جداً في كل التفاصيل.', true, 5, 5, true, 15, NOW() - INTERVAL '8 days'),
  ('review_5', 'trans_5', 'user_test_2', 'user_test_3', NULL, 5, 'شخص موثوق', 'تعامل راقي ومحترم. المقايضة تمت بنجاح وسهولة.', true, 5, 5, true, 10, NOW() - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

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
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Price Alerts (تنبيهات الأسعار)
-- =====================================================
INSERT INTO mobile_price_alerts (id, user_id, brand, model, storage_capacity, condition, target_price, is_active, notification_method, last_notified_at, created_at)
VALUES
  ('alert_1', 'user_test_1', 'APPLE', 'iPhone 15 Pro Max', 256, 'A', 70000, true, 'PUSH', NULL, NOW() - INTERVAL '10 days'),
  ('alert_2', 'user_test_1', 'SAMSUNG', 'Galaxy S24 Ultra', 256, 'A', 65000, true, 'EMAIL', NULL, NOW() - INTERVAL '5 days'),
  ('alert_3', 'user_test_2', 'APPLE', 'iPhone 14 Pro', 128, 'B', 40000, true, 'BOTH', NULL, NOW() - INTERVAL '7 days'),
  ('alert_4', 'user_test_3', 'XIAOMI', 'Xiaomi 14 Ultra', 512, 'A', 55000, true, 'PUSH', NULL, NOW() - INTERVAL '3 days'),
  ('alert_5', 'user_test_4', 'SAMSUNG', 'Galaxy Z Fold5', 256, 'A', 75000, true, 'EMAIL', NULL, NOW() - INTERVAL '8 days'),
  ('alert_6', 'user_test_5', 'GOOGLE', 'Pixel 8 Pro', 256, 'A', 42000, true, 'BOTH', NOW() - INTERVAL '1 day', NOW() - INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Mobile Disputes (نزاعات الموبايلات)
-- =====================================================
INSERT INTO mobile_disputes (id, transaction_id, raised_by_id, dispute_type, status, description, evidence_urls, resolution, resolved_by_id, refund_amount, created_at, resolved_at)
VALUES
  ('dispute_1', 'trans_2', 'user_test_1', 'ITEM_NOT_AS_DESCRIBED', 'RESOLVED', 'البطارية أقل من المذكور في الإعلان (85% بدلاً من 88%)', '["/evidence/dispute1_battery_screenshot.jpg"]', 'تم الاتفاق على خصم 500 جنيه من المبلغ كتعويض عن فرق حالة البطارية. تم استكمال المعاملة.', 'user_admin', 500, NOW() - INTERVAL '6 days', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- Summary Statistics
-- =====================================================
-- Total Listings: 20
-- Brands covered: Apple, Samsung, Xiaomi, OPPO, Vivo, Realme, Honor, Google, Infinix, Tecno, OnePlus
-- IMEI Verified: 13 listings
-- Device Diagnostics: 9 listings
-- Active Transactions: 2
-- Completed Transactions: 3
-- Barter Matches: 5
-- Barter Proposals: 4
-- Reviews: 5
-- Favorites: 10
-- Price Alerts: 6
-- Disputes: 1 (resolved)
