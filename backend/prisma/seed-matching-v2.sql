-- ============================================
-- Smart Matching Test Data V2
-- يعمل مع البيانات الموجودة حالياً
-- ============================================

-- First, let's check existing categories
-- SELECT id, name_en, name_ar, slug FROM categories LIMIT 10;

-- ============================================
-- 1. Add BARTER Items (للمقايضة)
-- These items want to exchange for other items
-- ============================================

-- Get category IDs first (run this to see your categories):
-- SELECT id, name_en FROM categories WHERE is_active = true;

-- Ahmed wants to exchange his iPhone for a MacBook
INSERT INTO items (
  id, seller_id, title, description, category_id,
  listing_type, condition, estimated_value, images,
  governorate, city,
  desired_category_id, desired_item_title, desired_keywords,
  desired_value_min, desired_value_max,
  status, created_at, updated_at
)
SELECT
  'barter-iphone-for-macbook',
  u.id,
  'iPhone 15 Pro Max للمقايضة بـ MacBook',
  'آيفون 15 برو ماكس 256 جيجا بحالة ممتازة، أريد مقايضته بماك بوك برو',
  (SELECT id FROM categories WHERE slug = 'electronics' OR name_en ILIKE '%electron%' LIMIT 1),
  'BARTER',
  'EXCELLENT',
  55000,
  ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569'],
  'القاهرة',
  'مدينة نصر',
  (SELECT id FROM categories WHERE slug = 'electronics' OR name_en ILIKE '%electron%' LIMIT 1),
  'MacBook Pro',
  'macbook,ماك بوك,لابتوب,apple,أبل',
  40000,
  70000,
  'ACTIVE',
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'ahmed.hassan@demo.xchange.eg'
ON CONFLICT (id) DO NOTHING;

-- Sara wants to exchange her MacBook for an iPhone
INSERT INTO items (
  id, seller_id, title, description, category_id,
  listing_type, condition, estimated_value, images,
  governorate, city,
  desired_category_id, desired_item_title, desired_keywords,
  desired_value_min, desired_value_max,
  status, created_at, updated_at
)
SELECT
  'barter-macbook-for-iphone',
  u.id,
  'MacBook Pro M3 للمقايضة بـ iPhone',
  'ماك بوك برو M3 بحالة ممتازة، أريد مقايضته بآيفون 15 برو',
  (SELECT id FROM categories WHERE slug = 'electronics' OR name_en ILIKE '%electron%' LIMIT 1),
  'BARTER',
  'EXCELLENT',
  60000,
  ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8'],
  'القاهرة',
  'مدينة نصر',
  (SELECT id FROM categories WHERE slug = 'electronics' OR name_en ILIKE '%electron%' LIMIT 1),
  'iPhone 15',
  'iphone,آيفون,هاتف,apple,موبايل',
  45000,
  65000,
  'ACTIVE',
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'sara.mohamed@demo.xchange.eg'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 2. Add DIRECT_BUY Items (مطلوب للشراء)
-- These are purchase requests that match with existing sales
-- ============================================

-- Someone looking for PS5 (will match Omar's PS5)
INSERT INTO items (
  id, seller_id, title, description, category_id,
  listing_type, condition, estimated_value, images,
  governorate, city,
  desired_keywords, desired_value_max,
  status, created_at, updated_at
)
SELECT
  'demand-ps5-cairo',
  u.id,
  'مطلوب PlayStation 5 في القاهرة',
  'أبحث عن بلايستيشن 5 بحالة جيدة، مستعد للشراء فوراً',
  (SELECT id FROM categories WHERE slug = 'electronics' OR name_en ILIKE '%electron%' LIMIT 1),
  'DIRECT_BUY',
  'GOOD',
  25000,
  ARRAY[]::text[],
  'القاهرة',
  'مدينة نصر',
  'playstation,ps5,بلايستيشن,سوني,sony',
  28000,
  'ACTIVE',
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'fatma.ahmed@demo.xchange.eg'
ON CONFLICT (id) DO NOTHING;

-- Someone looking for refrigerator (will match Fatma's refrigerator)
INSERT INTO items (
  id, seller_id, title, description, category_id,
  listing_type, condition, estimated_value, images,
  governorate, city,
  desired_keywords, desired_value_max,
  status, created_at, updated_at
)
SELECT
  'demand-fridge-delta',
  u.id,
  'مطلوب ثلاجة توشيبا أو LG',
  'محتاج ثلاجة كبيرة للمنزل الجديد',
  (SELECT id FROM categories WHERE slug = 'appliances' OR name_en ILIKE '%applian%' OR name_en ILIKE '%home%' LIMIT 1),
  'DIRECT_BUY',
  'GOOD',
  15000,
  ARRAY[]::text[],
  'الدقهلية',
  'المنصورة',
  'ثلاجة,توشيبا,lg,refrigerator,نوفروست',
  18000,
  'ACTIVE',
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'noura.hassan@demo.xchange.eg'
ON CONFLICT (id) DO NOTHING;

-- Someone looking for furniture (will match Sara's salon set)
INSERT INTO items (
  id, seller_id, title, description, category_id,
  listing_type, condition, estimated_value, images,
  governorate, city,
  desired_keywords, desired_value_max,
  status, created_at, updated_at
)
SELECT
  'demand-furniture-giza',
  u.id,
  'مطلوب طقم صالون كلاسيك',
  'أبحث عن طقم صالون للفيلا الجديدة',
  (SELECT id FROM categories WHERE slug = 'furniture' OR name_en ILIKE '%furniture%' LIMIT 1),
  'DIRECT_BUY',
  'EXCELLENT',
  80000,
  ARRAY[]::text[],
  'الجيزة',
  'الشيخ زايد',
  'صالون,كلاسيك,أثاث,furniture,salon',
  100000,
  'ACTIVE',
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'youssef.kamal@demo.xchange.eg'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. Add Multi-Party Barter Chain
-- A wants B's stuff, B wants C's stuff, C wants A's stuff
-- ============================================

-- Omar has car parts, wants furniture
INSERT INTO items (
  id, seller_id, title, description, category_id,
  listing_type, condition, estimated_value, images,
  governorate, city,
  desired_category_id, desired_item_title, desired_keywords,
  status, created_at, updated_at
)
SELECT
  'barter-car-for-furniture',
  u.id,
  'قطع غيار سيارة للمقايضة بأثاث',
  'قطع غيار أصلية لتويوتا، أريد مقايضتها بأثاث منزلي',
  (SELECT id FROM categories WHERE slug = 'vehicles' OR name_en ILIKE '%vehicle%' OR name_en ILIKE '%car%' LIMIT 1),
  'BARTER',
  'GOOD',
  25000,
  ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3'],
  'الجيزة',
  '6 أكتوبر',
  (SELECT id FROM categories WHERE slug = 'furniture' OR name_en ILIKE '%furniture%' LIMIT 1),
  'أثاث منزلي',
  'أثاث,صالون,غرفة نوم,furniture',
  'ACTIVE',
  NOW(),
  NOW()
FROM users u
WHERE u.email = 'omar.ali@demo.xchange.eg'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- Verify the new items
-- ============================================
SELECT
  'RESULTS' as section,
  listing_type,
  COUNT(*) as count
FROM items
GROUP BY listing_type
ORDER BY listing_type;

-- Show new barter and demand items
SELECT
  i.title,
  i.listing_type,
  i.desired_item_title,
  i.governorate,
  u.full_name as owner
FROM items i
JOIN users u ON i.seller_id = u.id
WHERE i.listing_type IN ('BARTER', 'DIRECT_BUY')
ORDER BY i.listing_type, i.created_at DESC;
