-- =====================================================
-- Comprehensive Seed Data for Scrap Marketplace
-- بيانات اختبارية شاملة لسوق الخردة والتدوير
-- December 2024 Egyptian Market Prices
-- =====================================================

-- =====================================================
-- SCRAP MATERIAL PRICES - أسعار المواد (ديسمبر 2024)
-- =====================================================

-- Clear existing prices
DELETE FROM scrap_material_prices WHERE 1=1;

-- Metals - المعادن
INSERT INTO scrap_material_prices (id, material_category, material_type, material_name_ar, price_per_kg, currency, price_change, price_change_type, source, last_updated, created_at)
VALUES
  -- Copper - النحاس
  (gen_random_uuid(), 'metal', 'copper_red', 'نحاس أحمر خام', 588.00, 'EGP', 5.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'copper_yellow', 'نحاس أصفر (براص)', 410.00, 'EGP', 3.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'copper_burnt', 'نحاس محروق', 520.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'copper_wire', 'سلك نحاس', 550.00, 'EGP', 2.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),

  -- Aluminum - الألمونيوم
  (gen_random_uuid(), 'metal', 'aluminum_soft', 'ألمونيوم طري', 199.00, 'EGP', -2.00, 'down', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'aluminum_hard', 'ألمونيوم كاست (صلب)', 135.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'aluminum_cans', 'علب ألمونيوم (كانز)', 95.00, 'EGP', 1.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'aluminum_profiles', 'ألمونيوم بروفيل', 170.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),

  -- Iron & Steel - الحديد والصلب
  (gen_random_uuid(), 'metal', 'iron', 'حديد خردة', 14.50, 'EGP', -0.50, 'down', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'stainless_steel', 'استانلس ستيل', 55.00, 'EGP', 2.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'steel_bars', 'حديد تسليح', 16.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),

  -- Other Metals - معادن أخرى
  (gen_random_uuid(), 'metal', 'lead', 'رصاص', 85.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'zinc', 'زنك', 95.00, 'EGP', 1.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'brass', 'نحاس أصفر (براص)', 350.00, 'EGP', 5.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'bronze', 'برونز', 280.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'metal', 'tin', 'قصدير', 120.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW());

-- Paper & Cardboard - الورق والكرتون
INSERT INTO scrap_material_prices (id, material_category, material_type, material_name_ar, price_per_kg, currency, price_change, price_change_type, source, last_updated, created_at)
VALUES
  (gen_random_uuid(), 'paper', 'cardboard', 'كرتون', 10.00, 'EGP', 0.50, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'paper', 'white_paper', 'ورق أبيض', 12.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'paper', 'newspaper', 'جرائد', 8.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'paper', 'mixed_paper', 'ورق مخلوط', 6.00, 'EGP', -0.50, 'down', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'paper', 'books', 'كتب ومجلات', 5.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'paper', 'cardboard_boxes', 'كراتين تعبئة', 9.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW());

-- Plastics - البلاستيك
INSERT INTO scrap_material_prices (id, material_category, material_type, material_name_ar, price_per_kg, currency, price_change, price_change_type, source, last_updated, created_at)
VALUES
  (gen_random_uuid(), 'plastic', 'pet', 'بلاستيك PET (زجاجات مياه)', 38.00, 'EGP', 2.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'plastic', 'hdpe', 'بلاستيك HDPE (جراكن)', 28.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'plastic', 'pvc', 'بلاستيك PVC (مواسير)', 18.00, 'EGP', -1.00, 'down', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'plastic', 'ldpe', 'بلاستيك LDPE (أكياس)', 20.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'plastic', 'pp', 'بلاستيك PP', 25.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'plastic', 'ps', 'بلاستيك PS (ستايروفوم)', 15.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'plastic', 'mixed_plastic', 'بلاستيك مخلوط', 12.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW());

-- Electronics - الإلكترونيات
INSERT INTO scrap_material_prices (id, material_category, material_type, material_name_ar, price_per_kg, currency, price_change, price_change_type, source, last_updated, created_at)
VALUES
  (gen_random_uuid(), 'electronics', 'computer_parts', 'قطع كمبيوتر', 45.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'electronics', 'mobile_phones', 'هواتف محمولة (للتفكيك)', 80.00, 'EGP', 5.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'electronics', 'cables', 'كابلات وأسلاك', 65.00, 'EGP', 3.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'electronics', 'circuit_boards', 'لوحات إلكترونية', 150.00, 'EGP', 10.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'electronics', 'batteries', 'بطاريات (للتدوير)', 25.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'electronics', 'hard_drives', 'هارد ديسك', 35.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW());

-- Home Appliances - الأجهزة المنزلية
INSERT INTO scrap_material_prices (id, material_category, material_type, material_name_ar, price_per_kg, currency, price_change, price_change_type, source, last_updated, created_at)
VALUES
  (gen_random_uuid(), 'appliances', 'washing_machine', 'غسالات (للتفكيك)', 18.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'appliances', 'refrigerator', 'ثلاجات (للتفكيك)', 16.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'appliances', 'air_conditioner', 'تكييفات (للتفكيك)', 22.00, 'EGP', 1.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'appliances', 'small_appliances', 'أجهزة صغيرة (خلاط، مكواة)', 12.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'appliances', 'motors', 'موتورات كهربائية', 35.00, 'EGP', 2.00, 'up', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'appliances', 'compressors', 'كمبروسر (ضواغط)', 28.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW());

-- Textiles - المنسوجات
INSERT INTO scrap_material_prices (id, material_category, material_type, material_name_ar, price_per_kg, currency, price_change, price_change_type, source, last_updated, created_at)
VALUES
  (gen_random_uuid(), 'textiles', 'clothes', 'ملابس مستعملة', 15.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'textiles', 'fabric_scraps', 'قصاصات قماش', 8.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'textiles', 'carpets', 'سجاد مستعمل', 5.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'textiles', 'shoes', 'أحذية مستعملة', 12.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'textiles', 'leather', 'جلود', 25.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW());

-- Glass - الزجاج
INSERT INTO scrap_material_prices (id, material_category, material_type, material_name_ar, price_per_kg, currency, price_change, price_change_type, source, last_updated, created_at)
VALUES
  (gen_random_uuid(), 'glass', 'clear_glass', 'زجاج شفاف', 1.50, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'glass', 'colored_glass', 'زجاج ملون', 1.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'glass', 'broken_glass', 'زجاج مكسور', 0.80, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'glass', 'bottles', 'زجاجات فارغة', 2.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW());

-- Wood - الخشب
INSERT INTO scrap_material_prices (id, material_category, material_type, material_name_ar, price_per_kg, currency, price_change, price_change_type, source, last_updated, created_at)
VALUES
  (gen_random_uuid(), 'wood', 'furniture_wood', 'خشب أثاث', 3.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'wood', 'pallets', 'طبالي خشب', 4.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'wood', 'mdf', 'خشب MDF', 2.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'wood', 'plywood', 'أبلكاش', 2.50, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW());

-- Oils - الزيوت
INSERT INTO scrap_material_prices (id, material_category, material_type, material_name_ar, price_per_kg, currency, price_change, price_change_type, source, last_updated, created_at)
VALUES
  (gen_random_uuid(), 'oil', 'cooking_oil', 'زيت طعام مستعمل', 8.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW()),
  (gen_random_uuid(), 'oil', 'motor_oil', 'زيت موتور مستعمل', 5.00, 'EGP', NULL, 'stable', 'Egyptian Scrap Market', NOW(), NOW());

-- =====================================================
-- SCRAP ITEMS - منتجات الخردة
-- =====================================================

-- Scrap Item 1: ثلاجة تالفة
INSERT INTO items (
  id, seller_id, category_id, title, description, condition, status,
  images, price_type, estimated_value, location, governorate, city, district,
  scrap_type, scrap_condition, scrap_pricing_type, weight_kg, defect_description, is_repairable, repair_cost_estimate,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  c.id,
  'ثلاجة توشيبا 16 قدم تالفة',
  'ثلاجة توشيبا 16 قدم - الكمبروسر تالف ولكن باقي الأجزاء سليمة. الباب والأرفف في حالة جيدة. مناسبة للتفكيك أو الإصلاح.',
  'DAMAGED',
  'ACTIVE',
  '["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=800"]'::jsonb,
  'FIXED',
  2500.00,
  'مدينة نصر',
  'القاهرة',
  'مدينة نصر',
  'الحي العاشر',
  'HOME_APPLIANCES',
  'NOT_WORKING',
  'PER_PIECE',
  85,
  'الكمبروسر تالف - باقي الأجزاء سليمة',
  true,
  800,
  NOW() - INTERVAL '5 days',
  NOW()
FROM users u, categories c
WHERE u.email = 'test6@xchange.eg' AND c.slug = 'scrap'
LIMIT 1;

-- Scrap Item 2: كابلات نحاس
INSERT INTO items (
  id, seller_id, category_id, title, description, condition, status,
  images, price_type, estimated_value, location, governorate, city,
  scrap_type, scrap_condition, scrap_pricing_type, weight_kg, metal_type, price_per_kg,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  c.id,
  'كابلات نحاس مستعملة 50 كيلو',
  'كابلات نحاس كهربائية مستعملة بأقطار مختلفة. نحاس أحمر نقي بدون عازل. مناسب للتدوير.',
  'USED',
  'ACTIVE',
  '["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"]'::jsonb,
  'PER_KG',
  27500.00,
  'العبور',
  'القاهرة',
  'العبور',
  'CABLES_WIRES',
  'TOTALLY_DAMAGED',
  'PER_KG',
  50,
  'COPPER',
  550,
  NOW() - INTERVAL '3 days',
  NOW()
FROM users u, categories c
WHERE u.email = 'test6@xchange.eg' AND c.slug = 'scrap'
LIMIT 1;

-- Scrap Item 3: غسالة تالفة
INSERT INTO items (
  id, seller_id, category_id, title, description, condition, status,
  images, price_type, estimated_value, location, governorate, city,
  scrap_type, scrap_condition, scrap_pricing_type, weight_kg, defect_description, is_repairable, working_parts_desc,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  c.id,
  'غسالة ال جي فول أوتوماتيك 9 كيلو',
  'غسالة ال جي فول أوتوماتيك - لا تعمل. الموتور سليم لكن البوردة تالفة. مناسبة لقطع الغيار.',
  'DAMAGED',
  'ACTIVE',
  '["https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800"]'::jsonb,
  'FIXED',
  1800.00,
  'المعادي',
  'القاهرة',
  'المعادي',
  'HOME_APPLIANCES',
  'NOT_WORKING',
  'PER_PIECE',
  65,
  'البوردة الإلكترونية تالفة',
  true,
  'الموتور - الدرم - الباب',
  NOW() - INTERVAL '7 days',
  NOW()
FROM users u, categories c
WHERE u.email = 'test6@xchange.eg' AND c.slug = 'scrap'
LIMIT 1;

-- Scrap Item 4: ألمونيوم خردة
INSERT INTO items (
  id, seller_id, category_id, title, description, condition, status,
  images, price_type, estimated_value, location, governorate, city,
  scrap_type, scrap_condition, scrap_pricing_type, weight_kg, metal_type, price_per_kg,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  c.id,
  'ألمونيوم طري 100 كيلو',
  'ألمونيوم طري من بقايا مصنع. نظيف وجاهز للتدوير. الوزن قابل للتفاوض.',
  'USED',
  'ACTIVE',
  '["https://images.unsplash.com/photo-1558618047-f4b511dd5cd4?w=800"]'::jsonb,
  'PER_KG',
  19900.00,
  'شبرا الخيمة',
  'القليوبية',
  'شبرا الخيمة',
  'METAL_SCRAP',
  'TOTALLY_DAMAGED',
  'PER_KG',
  100,
  'ALUMINUM',
  199,
  NOW() - INTERVAL '2 days',
  NOW()
FROM users u, categories c
WHERE u.email = 'test6@xchange.eg' AND c.slug = 'scrap'
LIMIT 1;

-- Scrap Item 5: كمبيوتر قديم
INSERT INTO items (
  id, seller_id, category_id, title, description, condition, status,
  images, price_type, estimated_value, location, governorate, city,
  scrap_type, scrap_condition, scrap_pricing_type, defect_description, is_repairable, working_parts_desc,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  c.id,
  'جهاز كمبيوتر ديسكتوب قديم',
  'كمبيوتر ديسكتوب قديم Core 2 Duo - يعمل لكن بطيء جداً. مناسب للتفكيك أو الاستخدام كقطع غيار.',
  'DAMAGED',
  'ACTIVE',
  '["https://images.unsplash.com/photo-1593062096033-9a26b09da705?w=800"]'::jsonb,
  'FIXED',
  500.00,
  'الدقي',
  'الجيزة',
  'الدقي',
  'COMPUTERS',
  'PARTIALLY_WORKING',
  'PER_PIECE',
  'بطيء جداً - يحتاج ترقية',
  false,
  'الشاشة - الكيبورد - الماوس',
  NOW() - INTERVAL '10 days',
  NOW()
FROM users u, categories c
WHERE u.email = 'test6@xchange.eg' AND c.slug = 'scrap'
LIMIT 1;

-- Scrap Item 6: كرتون للتدوير
INSERT INTO items (
  id, seller_id, category_id, title, description, condition, status,
  images, price_type, estimated_value, location, governorate, city,
  scrap_type, scrap_condition, scrap_pricing_type, weight_kg, price_per_kg,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  c.id,
  'كرتون نظيف 200 كيلو',
  'كراتين تعبئة نظيفة من مصنع. جاهزة للتدوير. التوصيل متاح للكميات الكبيرة.',
  'USED',
  'ACTIVE',
  '["https://images.unsplash.com/photo-1607473129014-0afb7e4bfbf4?w=800"]'::jsonb,
  'PER_KG',
  2000.00,
  '6 أكتوبر',
  'الجيزة',
  '6 أكتوبر',
  'PAPER',
  'TOTALLY_DAMAGED',
  'PER_KG',
  200,
  10,
  NOW() - INTERVAL '1 day',
  NOW()
FROM users u, categories c
WHERE u.email = 'test6@xchange.eg' AND c.slug = 'scrap'
LIMIT 1;

-- Scrap Item 7: تكييف سبليت تالف
INSERT INTO items (
  id, seller_id, category_id, title, description, condition, status,
  images, price_type, estimated_value, location, governorate, city,
  scrap_type, scrap_condition, scrap_pricing_type, weight_kg, defect_description, is_repairable, repair_cost_estimate, working_parts_desc,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  c.id,
  'تكييف شارب 2.25 حصان سبليت',
  'تكييف شارب سبليت انفرتر - الكمبروسر ضعيف والوحدة الخارجية بها صدأ. الوحدة الداخلية سليمة.',
  'DAMAGED',
  'ACTIVE',
  '["https://images.unsplash.com/photo-1585338447937-7082f8fc763d?w=800"]'::jsonb,
  'FIXED',
  3500.00,
  'الرحاب',
  'القاهرة',
  'الرحاب',
  'HOME_APPLIANCES',
  'PARTIALLY_WORKING',
  'PER_PIECE',
  45,
  'الكمبروسر ضعيف - صدأ في الوحدة الخارجية',
  true,
  2000,
  'الوحدة الداخلية - الريموت',
  NOW() - INTERVAL '4 days',
  NOW()
FROM users u, categories c
WHERE u.email = 'test6@xchange.eg' AND c.slug = 'scrap'
LIMIT 1;

-- Scrap Item 8: زجاجات بلاستيك PET
INSERT INTO items (
  id, seller_id, category_id, title, description, condition, status,
  images, price_type, estimated_value, location, governorate, city,
  scrap_type, scrap_condition, scrap_pricing_type, weight_kg, price_per_kg,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  c.id,
  'زجاجات بلاستيك PET فارغة 500 كيلو',
  'زجاجات مياه وعصائر فارغة. بلاستيك PET نظيف. الكمية كبيرة والسعر قابل للتفاوض للكميات.',
  'USED',
  'ACTIVE',
  '["https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800"]'::jsonb,
  'PER_KG',
  19000.00,
  'الإسكندرية',
  'الإسكندرية',
  'سموحة',
  'PLASTIC',
  'TOTALLY_DAMAGED',
  'PER_KG',
  500,
  38,
  NOW() - INTERVAL '6 days',
  NOW()
FROM users u, categories c
WHERE u.email = 'test6@xchange.eg' AND c.slug = 'scrap'
LIMIT 1;

-- =====================================================
-- SCRAP DEALERS - تجار الخردة
-- =====================================================

-- Dealer 1
INSERT INTO scrap_dealers (
  id, user_id, dealer_type, business_name, commercial_reg_no,
  address, governorate, city, latitude, longitude,
  specializations, accepted_metals, min_weight_kg,
  offers_pickup, pickup_fee, pickup_radius_km,
  rating, total_deals, is_verified,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'SCRAP_DEALER',
  'مؤسسة النيل للخردة والمعادن',
  'CR-12345',
  'شارع الصناعة، المنطقة الصناعية',
  'القاهرة',
  'شبرا الخيمة',
  30.1286,
  31.2422,
  ARRAY['METAL_SCRAP', 'CABLES_WIRES', 'HOME_APPLIANCES']::scrap_type[],
  ARRAY['COPPER', 'ALUMINUM', 'IRON', 'BRASS']::metal_type[],
  10,
  true,
  50.00,
  30,
  4.8,
  156,
  true,
  NOW() - INTERVAL '180 days',
  NOW()
FROM users u WHERE u.email = 'test6@xchange.eg' LIMIT 1;

-- Dealer 2
INSERT INTO scrap_dealers (
  id, user_id, dealer_type, business_name, commercial_reg_no,
  address, governorate, city, latitude, longitude,
  specializations, accepted_metals, min_weight_kg,
  offers_pickup, pickup_fee, pickup_radius_km,
  rating, total_deals, is_verified,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'RECYCLING_COMPANY',
  'شركة إيكو مصر للتدوير',
  'CR-67890',
  'المنطقة الصناعية الأولى',
  'الجيزة',
  '6 أكتوبر',
  30.0176,
  30.9192,
  ARRAY['PAPER', 'PLASTIC', 'ELECTRONICS']::scrap_type[],
  NULL,
  50,
  true,
  0.00,
  50,
  4.9,
  234,
  true,
  NOW() - INTERVAL '365 days',
  NOW()
FROM users u WHERE u.email = 'test6@xchange.eg' LIMIT 1;

-- Dealer 3
INSERT INTO scrap_dealers (
  id, user_id, dealer_type, business_name,
  address, governorate, city, latitude, longitude,
  specializations, min_weight_kg,
  offers_pickup, pickup_fee, pickup_radius_km,
  rating, total_deals, is_verified,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'INDIVIDUAL_COLLECTOR',
  'أبو أحمد للخردة',
  'شارع الجمهورية',
  'القاهرة',
  'مدينة نصر',
  30.0444,
  31.3403,
  ARRAY['HOME_APPLIANCES', 'ELECTRONICS', 'METAL_SCRAP']::scrap_type[],
  5,
  true,
  30.00,
  15,
  4.5,
  89,
  false,
  NOW() - INTERVAL '90 days',
  NOW()
FROM users u WHERE u.email = 'test6@xchange.eg' LIMIT 1;

-- =====================================================
-- PURCHASE REQUESTS - طلبات الشراء
-- =====================================================

INSERT INTO scrap_purchase_requests (
  id, buyer_id, title, description,
  scrap_type, metal_type, min_weight_kg, max_weight_kg,
  offered_price_per_kg, is_negotiable,
  governorate, city, offers_pickup, pickup_address,
  status, expires_at,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'مطلوب نحاس أحمر - كميات كبيرة',
  'نشتري النحاس الأحمر بأعلى الأسعار. الدفع فوري والاستلام من الموقع.',
  'METAL_SCRAP',
  'COPPER',
  50,
  1000,
  580.00,
  true,
  'القاهرة',
  'شبرا الخيمة',
  true,
  'المنطقة الصناعية، شارع الصناعة',
  'ACTIVE',
  NOW() + INTERVAL '30 days',
  NOW() - INTERVAL '2 days',
  NOW()
FROM users u WHERE u.email = 'test6@xchange.eg' LIMIT 1;

INSERT INTO scrap_purchase_requests (
  id, buyer_id, title, description,
  scrap_type, min_weight_kg, max_weight_kg,
  offered_price_per_kg, is_negotiable,
  governorate, offers_pickup,
  status, expires_at,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'مطلوب كرتون نظيف',
  'شراء كرتون نظيف للتدوير. نقبل جميع الأحجام. التوصيل متاح.',
  'PAPER',
  100,
  5000,
  9.50,
  true,
  'الجيزة',
  true,
  'ACTIVE',
  NOW() + INTERVAL '45 days',
  NOW() - INTERVAL '5 days',
  NOW()
FROM users u WHERE u.email = 'test6@xchange.eg' LIMIT 1;

INSERT INTO scrap_purchase_requests (
  id, buyer_id, title, description,
  scrap_type, min_weight_kg,
  offered_total_price, is_negotiable,
  governorate, city, offers_pickup,
  status, expires_at,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'مطلوب أجهزة منزلية تالفة للتفكيك',
  'نشتري جميع الأجهزة المنزلية التالفة: ثلاجات، غسالات، تكييفات، سخانات. الاستلام من المنزل.',
  'HOME_APPLIANCES',
  NULL,
  NULL,
  true,
  'القاهرة',
  NULL,
  true,
  'ACTIVE',
  NOW() + INTERVAL '60 days',
  NOW() - INTERVAL '1 day',
  NOW()
FROM users u WHERE u.email = 'test6@xchange.eg' LIMIT 1;

-- =====================================================
-- METAL PRICES (Legacy) - أسعار المعادن القديمة
-- =====================================================

INSERT INTO metal_prices (id, metal_type, price_per_kg, currency, source, created_at)
VALUES
  (gen_random_uuid(), 'COPPER', 588.00, 'EGP', 'Egyptian Metal Market', NOW()),
  (gen_random_uuid(), 'ALUMINUM', 199.00, 'EGP', 'Egyptian Metal Market', NOW()),
  (gen_random_uuid(), 'IRON', 14.50, 'EGP', 'Egyptian Metal Market', NOW()),
  (gen_random_uuid(), 'STEEL', 16.00, 'EGP', 'Egyptian Metal Market', NOW()),
  (gen_random_uuid(), 'BRASS', 350.00, 'EGP', 'Egyptian Metal Market', NOW()),
  (gen_random_uuid(), 'BRONZE', 280.00, 'EGP', 'Egyptian Metal Market', NOW()),
  (gen_random_uuid(), 'LEAD', 85.00, 'EGP', 'Egyptian Metal Market', NOW()),
  (gen_random_uuid(), 'ZINC', 95.00, 'EGP', 'Egyptian Metal Market', NOW()),
  (gen_random_uuid(), 'STAINLESS_STEEL', 55.00, 'EGP', 'Egyptian Metal Market', NOW());

-- =====================================================
-- Update Statistics
-- =====================================================
SELECT 'Scrap marketplace seed completed successfully!' as status;
