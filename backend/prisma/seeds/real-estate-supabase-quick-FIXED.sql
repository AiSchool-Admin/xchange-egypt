-- =====================================================
-- Real Estate Quick Seed for Supabase SQL Editor (FIXED)
-- بيانات تجريبية سريعة لسوق العقارات
-- =====================================================
-- يمكن تشغيلها مباشرة في Supabase SQL Editor
-- =====================================================

-- 1. إنشاء/التحقق من المستخدم التجريبي
-- =====================================================

DO $$
DECLARE
  test_user_id TEXT;
BEGIN
  -- التحقق من وجود المستخدم
  SELECT id INTO test_user_id FROM users WHERE email = 'admin@xchange.eg' LIMIT 1;

  -- إنشاء المستخدم إذا لم يكن موجوداً
  IF test_user_id IS NULL THEN
    INSERT INTO users (
      id, email, password_hash, full_name, phone,
      email_verified, phone_verified, created_at, updated_at
    ) VALUES (
      gen_random_uuid(),
      'admin@xchange.eg',
      '$2b$10$XYZ123placeholder', -- Placeholder - not used for login
      'Xchange Admin',
      '+201000000000',
      true,
      true,
      NOW(),
      NOW()
    ) RETURNING id INTO test_user_id;

    RAISE NOTICE 'Created test user: %', test_user_id;
  ELSE
    RAISE NOTICE 'Using existing user: %', test_user_id;
  END IF;
END $$;

-- =====================================================
-- 2. إضافة العقارات التجريبية (8 عقارات)
-- =====================================================

-- العقار 1: شقة فاخرة في التجمع الخامس
INSERT INTO properties (
  id, owner_id,
  title, title_ar,
  description, description_ar,
  property_type, status,
  governorate, city, district, compound_name,
  area_sqm, bedrooms, bathrooms, floor_number, total_floors,
  finishing_level,
  sale_price, price_per_sqm,
  amenities,
  images,
  views_count, favorites_count,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Luxury Apartment in New Cairo',
  'شقة فاخرة في التجمع الخامس',
  'Stunning 3-bedroom apartment with panoramic views. High-end finishes and premium amenities.',
  'شقة مذهلة 3 غرف نوم مع إطلالة بانورامية. تشطيبات فاخرة ومرافق متميزة.',
  'APARTMENT',
  'ACTIVE',
  'Cairo',
  'New Cairo',
  'Fifth Settlement',
  'Mivida',
  185,
  3,
  2,
  5,
  8,
  'SUPER_LUX',
  4500000,
  24324,
  '{"parking": true, "elevator": true, "security": true, "pool": true, "gym": true}'::jsonb,
  '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"]'::jsonb,
  120,
  15,
  NOW() - INTERVAL '15 days',
  NOW()
FROM users u WHERE u.email = 'admin@xchange.eg' LIMIT 1;

-- العقار 2: فيلا في الشيخ زايد
INSERT INTO properties (
  id, owner_id,
  title, title_ar,
  description, description_ar,
  property_type, status,
  governorate, city, district, compound_name,
  area_sqm, bedrooms, bathrooms, total_floors,
  finishing_level,
  sale_price, price_per_sqm,
  amenities,
  images,
  views_count, favorites_count,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Villa in Sheikh Zayed',
  'فيلا في الشيخ زايد',
  'Standalone villa with private garden and pool',
  'فيلا مستقلة بحديقة خاصة وحمام سباحة',
  'VILLA',
  'ACTIVE',
  'Giza',
  'Sheikh Zayed',
  'District 1',
  'Allegria',
  450,
  5,
  4,
  3,
  'LUX',
  12000000,
  26667,
  '{"parking": true, "garden": true, "security": true, "pool": true, "gym": true, "maid_room": true}'::jsonb,
  '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"]'::jsonb,
  200,
  35,
  NOW() - INTERVAL '10 days',
  NOW()
FROM users u WHERE u.email = 'admin@xchange.eg' LIMIT 1;

-- العقار 3: بنتهاوس في المعادي
INSERT INTO properties (
  id, owner_id,
  title, title_ar,
  description, description_ar,
  property_type, status,
  governorate, city, district, compound_name,
  area_sqm, bedrooms, bathrooms, floor_number, total_floors,
  finishing_level,
  sale_price, price_per_sqm,
  amenities,
  images,
  views_count, favorites_count,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Penthouse in Maadi',
  'بنتهاوس في المعادي',
  'Spacious penthouse with rooftop terrace',
  'بنتهاوس واسع مع تراس على السطح',
  'PENTHOUSE',
  'ACTIVE',
  'Cairo',
  'Maadi',
  'Degla',
  'Sarayat Maadi',
  320,
  4,
  3,
  10,
  10,
  'SUPER_LUX',
  8500000,
  26563,
  '{"parking": true, "elevator": true, "security": true, "rooftop": true, "balcony": true}'::jsonb,
  '["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800", "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=800"]'::jsonb,
  180,
  28,
  NOW() - INTERVAL '12 days',
  NOW()
FROM users u WHERE u.email = 'admin@xchange.eg' LIMIT 1;

-- العقار 4: ستوديو في 6 أكتوبر
INSERT INTO properties (
  id, owner_id,
  title, title_ar,
  description, description_ar,
  property_type, status,
  governorate, city, district, compound_name,
  area_sqm, bedrooms, bathrooms, floor_number, total_floors,
  finishing_level,
  sale_price, price_per_sqm,
  amenities,
  images,
  views_count, favorites_count,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Studio in 6 October',
  'ستوديو في 6 أكتوبر',
  'Fully furnished studio, ready to move',
  'ستوديو مفروش بالكامل، جاهز للسكن',
  'STUDIO',
  'ACTIVE',
  'Giza',
  '6th of October',
  'District 2',
  'Palm Parks',
  55,
  1,
  1,
  3,
  6,
  'LUX',
  950000,
  17273,
  '{"parking": true, "elevator": true, "security": true}'::jsonb,
  '["https://images.unsplash.com/photo-1600573472591-ee6b68d14c68?w=800"]'::jsonb,
  90,
  12,
  NOW() - INTERVAL '5 days',
  NOW()
FROM users u WHERE u.email = 'admin@xchange.eg' LIMIT 1;

-- العقار 5: دوبلكس في مصر الجديدة
INSERT INTO properties (
  id, owner_id,
  title, title_ar,
  description, description_ar,
  property_type, status,
  governorate, city, district,
  area_sqm, bedrooms, bathrooms, floor_number, total_floors,
  finishing_level,
  sale_price, price_per_sqm,
  amenities,
  images,
  views_count, favorites_count,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Duplex in Heliopolis',
  'دوبلكس في مصر الجديدة',
  'Modern duplex in prime location',
  'دوبلكس حديث في موقع متميز',
  'DUPLEX',
  'ACTIVE',
  'Cairo',
  'Heliopolis',
  'Sheraton',
  280,
  4,
  3,
  7,
  10,
  'SEMI_FINISHED',
  5200000,
  18571,
  '{"parking": true, "elevator": true, "balcony": true}'::jsonb,
  '["https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800", "https://images.unsplash.com/photo-1600563438938-a9a27216b4f5?w=800"]'::jsonb,
  145,
  20,
  NOW() - INTERVAL '8 days',
  NOW()
FROM users u WHERE u.email = 'admin@xchange.eg' LIMIT 1;

-- العقار 6: شاليه في الساحل الشمالي
INSERT INTO properties (
  id, owner_id,
  title, title_ar,
  description, description_ar,
  property_type, status,
  governorate, city, district, compound_name,
  area_sqm, bedrooms, bathrooms, floor_number, total_floors,
  finishing_level,
  sale_price, price_per_sqm,
  amenities,
  images,
  views_count, favorites_count,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Chalet in North Coast',
  'شاليه في الساحل الشمالي',
  'Beachfront chalet with sea view',
  'شاليه على البحر مباشرة بإطلالة بحرية',
  'CHALET',
  'ACTIVE',
  'Matrouh',
  'North Coast',
  'Sidi Abdel Rahman',
  'Marassi',
  120,
  2,
  2,
  1,
  2,
  'LUX',
  6500000,
  54167,
  '{"parking": true, "pool": true, "security": true, "garden": true, "beach_access": true}'::jsonb,
  '["https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800", "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=800"]'::jsonb,
  250,
  42,
  NOW() - INTERVAL '20 days',
  NOW()
FROM users u WHERE u.email = 'admin@xchange.eg' LIMIT 1;

-- العقار 7: تاون هاوس في الرحاب
INSERT INTO properties (
  id, owner_id,
  title, title_ar,
  description, description_ar,
  property_type, status,
  governorate, city, district, compound_name,
  area_sqm, bedrooms, bathrooms, total_floors,
  finishing_level,
  sale_price, price_per_sqm,
  amenities,
  images,
  views_count, favorites_count,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Townhouse in Rehab',
  'تاون هاوس في الرحاب',
  'Family townhouse in gated community',
  'تاون هاوس عائلي في كمبوند مغلق',
  'TOWNHOUSE',
  'ACTIVE',
  'Cairo',
  'New Cairo',
  'Rehab',
  'Rehab City',
  350,
  4,
  3,
  3,
  'LUX',
  7200000,
  20571,
  '{"parking": true, "garden": true, "security": true, "pool": true, "gym": true, "playground": true}'::jsonb,
  '["https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800", "https://images.unsplash.com/photo-1600566752355-35792bedcfea?w=800"]'::jsonb,
  165,
  25,
  NOW() - INTERVAL '7 days',
  NOW()
FROM users u WHERE u.email = 'admin@xchange.eg' LIMIT 1;

-- العقار 8: مكتب في وسط البلد
INSERT INTO properties (
  id, owner_id,
  title, title_ar,
  description, description_ar,
  property_type, status,
  governorate, city, district,
  area_sqm, bedrooms, bathrooms, floor_number, total_floors,
  finishing_level,
  sale_price, price_per_sqm,
  amenities,
  images,
  views_count, favorites_count,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Office in Downtown',
  'مكتب في وسط البلد',
  'Commercial office space in business district',
  'مساحة مكتبية تجارية في منطقة الأعمال',
  'OFFICE',
  'ACTIVE',
  'Cairo',
  'Downtown',
  'Tahrir',
  95,
  0,
  1,
  6,
  12,
  'LUX',
  2800000,
  29474,
  '{"parking": true, "elevator": true, "security": true, "central_ac": true}'::jsonb,
  '["https://images.unsplash.com/photo-1600566753151-384129cf4e3e?w=800"]'::jsonb,
  80,
  8,
  NOW() - INTERVAL '3 days',
  NOW()
FROM users u WHERE u.email = 'admin@xchange.eg' LIMIT 1;

-- =====================================================
-- 3. عرض الإحصائيات
-- =====================================================

DO $$
DECLARE
  property_count INTEGER;
  total_value NUMERIC;
BEGIN
  SELECT COUNT(*), COALESCE(SUM(sale_price), 0)
  INTO property_count, total_value
  FROM properties
  WHERE owner_id = (SELECT id FROM users WHERE email = 'admin@xchange.eg' LIMIT 1);

  RAISE NOTICE '========================================';
  RAISE NOTICE '✅ Real Estate Seed Completed!';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Properties Created: %', property_count;
  RAISE NOTICE 'Total Value: % EGP', total_value;
  RAISE NOTICE 'Average Price: % EGP', ROUND(total_value / NULLIF(property_count, 0), 0);
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Test these URLs:';
  RAISE NOTICE '/real-estate - Main marketplace';
  RAISE NOTICE '/real-estate/valuation - AVM pricing';
  RAISE NOTICE '/real-estate/recommendations - AI recommendations';
  RAISE NOTICE '/real-estate/barter - Multi-party barter';
  RAISE NOTICE '========================================';
END $$;

-- =====================================================
-- 4. عرض العقارات المضافة
-- =====================================================

SELECT
  title_ar as "العقار",
  property_type as "النوع",
  governorate as "المحافظة",
  area_sqm as "المساحة",
  sale_price as "السعر",
  views_count as "المشاهدات",
  favorites_count as "المفضلة"
FROM properties
WHERE owner_id = (SELECT id FROM users WHERE email = 'admin@xchange.eg' LIMIT 1)
ORDER BY created_at DESC;
