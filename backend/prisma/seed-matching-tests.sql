-- ============================================
-- Smart Matching Test Data - بيانات اختبار التوافق الذكي
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Create Test Categories
-- ============================================
INSERT INTO categories (id, name_en, name_ar, slug, icon, level, is_active, created_at, updated_at)
VALUES
  ('cat-electronics-test', 'Electronics', 'إلكترونيات', 'electronics-test', '📱', 1, true, NOW(), NOW()),
  ('cat-furniture-test', 'Furniture', 'أثاث', 'furniture-test', '🛋️', 1, true, NOW(), NOW()),
  ('cat-vehicles-test', 'Vehicles', 'سيارات', 'vehicles-test', '🚗', 1, true, NOW(), NOW()),
  ('cat-clothing-test', 'Clothing', 'ملابس', 'clothing-test', '👕', 1, true, NOW(), NOW()),
  ('cat-sports-test', 'Sports', 'رياضة', 'sports-test', '⚽', 1, true, NOW(), NOW()),
  ('cat-books-test', 'Books', 'كتب', 'books-test', '📚', 1, true, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- 2. Create Test Users with Different Locations
-- ============================================
-- Cairo - Nasr City - District 1 (Same district group)
INSERT INTO users (id, email, password_hash, full_name, phone, user_type, status, email_verified, phone_verified, governorate, city, district, created_at, updated_at)
VALUES
  ('user-ahmed-test', 'ahmed@matchtest.com', '$2b$10$testHash123456789012345678901234567890123456789012', 'أحمد محمد', '+201012345678', 'INDIVIDUAL', 'ACTIVE', true, true, 'القاهرة', 'مدينة نصر', 'الحي الأول', NOW(), NOW()),
  ('user-sara-test', 'sara@matchtest.com', '$2b$10$testHash123456789012345678901234567890123456789012', 'سارة علي', '+201012345679', 'INDIVIDUAL', 'ACTIVE', true, true, 'القاهرة', 'مدينة نصر', 'الحي الأول', NOW(), NOW()),
  -- Cairo - Nasr City - District 2 (Same city, different district)
  ('user-omar-test', 'omar@matchtest.com', '$2b$10$testHash123456789012345678901234567890123456789012', 'عمر حسن', '+201012345680', 'INDIVIDUAL', 'ACTIVE', true, true, 'القاهرة', 'مدينة نصر', 'الحي الثاني', NOW(), NOW()),
  ('user-mona-test', 'mona@matchtest.com', '$2b$10$testHash123456789012345678901234567890123456789012', 'منى إبراهيم', '+201012345681', 'INDIVIDUAL', 'ACTIVE', true, true, 'القاهرة', 'مدينة نصر', 'الحي الثالث', NOW(), NOW()),
  -- Cairo - Heliopolis (Same governorate, different city)
  ('user-khaled-test', 'khaled@matchtest.com', '$2b$10$testHash123456789012345678901234567890123456789012', 'خالد أحمد', '+201012345682', 'INDIVIDUAL', 'ACTIVE', true, true, 'القاهرة', 'مصر الجديدة', 'روكسي', NOW(), NOW()),
  ('user-fatma-test', 'fatma@matchtest.com', '$2b$10$testHash123456789012345678901234567890123456789012', 'فاطمة يوسف', '+201012345683', 'INDIVIDUAL', 'ACTIVE', true, true, 'القاهرة', 'المعادي', 'المعادي الجديدة', NOW(), NOW()),
  -- Alexandria (Different governorate)
  ('user-hassan-test', 'hassan@matchtest.com', '$2b$10$testHash123456789012345678901234567890123456789012', 'حسن سعيد', '+201012345684', 'INDIVIDUAL', 'ACTIVE', true, true, 'الإسكندرية', 'سيدي جابر', 'الكورنيش', NOW(), NOW()),
  ('user-amal-test', 'amal@matchtest.com', '$2b$10$testHash123456789012345678901234567890123456789012', 'أمل محمود', '+201012345685', 'INDIVIDUAL', 'ACTIVE', true, true, 'الإسكندرية', 'سموحة', 'شارع فوزي معاذ', NOW(), NOW()),
  -- Giza
  ('user-mahmoud-test', 'mahmoud@matchtest.com', '$2b$10$testHash123456789012345678901234567890123456789012', 'محمود عبدالله', '+201012345686', 'INDIVIDUAL', 'ACTIVE', true, true, 'الجيزة', 'الدقي', 'ميدان المساحة', NOW(), NOW()),
  ('user-nadia-test', 'nadia@matchtest.com', '$2b$10$testHash123456789012345678901234567890123456789012', 'نادية حسين', '+201012345687', 'INDIVIDUAL', 'ACTIVE', true, true, 'الجيزة', 'الهرم', 'شارع الأهرام', NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 3. PERFECT BARTER MATCH SCENARIO
-- Ahmed has iPhone, wants MacBook
-- Sara has MacBook, wants iPhone
-- Both in same district → Perfect Match!
-- ============================================

-- Ahmed's iPhone (BARTER) - wants MacBook
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, desired_category_id, desired_item_title, desired_keywords, desired_value_min, desired_value_max, status, created_at, updated_at)
VALUES (
  'item-ahmed-iphone',
  'user-ahmed-test',
  'iPhone 15 Pro Max - 256GB',
  'هاتف آيفون 15 برو ماكس بحالة ممتازة، لون أسود تيتانيوم',
  'cat-electronics-test',
  'BARTER',
  'EXCELLENT',
  55000,
  ARRAY['https://example.com/iphone.jpg'],
  'القاهرة',
  'مدينة نصر',
  'الحي الأول',
  'cat-electronics-test',
  'MacBook',
  'macbook,ماك بوك,لابتوب,apple,أبل',
  40000,
  70000,
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Sara's MacBook (BARTER) - wants iPhone
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, desired_category_id, desired_item_title, desired_keywords, desired_value_min, desired_value_max, status, created_at, updated_at)
VALUES (
  'item-sara-macbook',
  'user-sara-test',
  'MacBook Pro 14 M3 - ماك بوك برو',
  'لابتوب ماك بوك برو 14 انش بمعالج M3، رام 16 جيجا',
  'cat-electronics-test',
  'BARTER',
  'EXCELLENT',
  60000,
  ARRAY['https://example.com/macbook.jpg'],
  'القاهرة',
  'مدينة نصر',
  'الحي الأول',
  'cat-electronics-test',
  'iPhone',
  'iphone,آيفون,هاتف,apple,أبل,موبايل',
  45000,
  65000,
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. GEOGRAPHIC PROXIMITY TEST
-- PS5 sellers and buyers at different distances
-- ============================================

-- Omar (same city as Ahmed, different district) - selling PS5
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, status, created_at, updated_at)
VALUES (
  'item-omar-ps5',
  'user-omar-test',
  'PlayStation 5 مع ألعاب',
  'بلايستيشن 5 ديجيتال مع 3 ألعاب وذراعين',
  'cat-electronics-test',
  'DIRECT_SALE',
  'GOOD',
  25000,
  ARRAY['https://example.com/ps5.jpg'],
  'القاهرة',
  'مدينة نصر',
  'الحي الثاني',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Khaled (same governorate, different city) - wants PS5
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, desired_keywords, desired_value_max, status, created_at, updated_at)
VALUES (
  'item-khaled-wants-ps5',
  'user-khaled-test',
  'مطلوب PlayStation 5',
  'أبحث عن بلايستيشن 5 بحالة جيدة',
  'cat-electronics-test',
  'DIRECT_BUY',
  'GOOD',
  23000,
  ARRAY[]::text[],
  'القاهرة',
  'مصر الجديدة',
  'روكسي',
  'playstation,ps5,بلايستيشن,سوني',
  26000,
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Hassan (different governorate - Alexandria) - also wants PS5
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, desired_keywords, desired_value_max, status, created_at, updated_at)
VALUES (
  'item-hassan-wants-ps5',
  'user-hassan-test',
  'مطلوب PS5 في الإسكندرية',
  'أريد بلايستيشن 5 جديد أو مستعمل',
  'cat-electronics-test',
  'DIRECT_BUY',
  'GOOD',
  24000,
  ARRAY[]::text[],
  'الإسكندرية',
  'سيدي جابر',
  'الكورنيش',
  'playstation,ps5,بلايستيشن,سوني',
  27000,
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. MULTI-PARTY BARTER CHAIN
-- A wants B, B wants C, C wants A
-- ============================================

-- Mona has furniture, wants vehicle parts
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, desired_category_id, desired_item_title, desired_keywords, status, created_at, updated_at)
VALUES (
  'item-mona-furniture',
  'user-mona-test',
  'طقم صالون كلاسيك',
  'طقم صالون 7 قطع خشب زان بحالة ممتازة',
  'cat-furniture-test',
  'BARTER',
  'EXCELLENT',
  35000,
  ARRAY['https://example.com/salon.jpg'],
  'القاهرة',
  'مدينة نصر',
  'الحي الثالث',
  'cat-vehicles-test',
  'قطع غيار سيارة',
  'قطع غيار,سيارة,موتور,vehicle,parts',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Fatma has vehicle parts, wants sports equipment
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, desired_category_id, desired_item_title, desired_keywords, status, created_at, updated_at)
VALUES (
  'item-fatma-engine',
  'user-fatma-test',
  'موتور سيارة تويوتا',
  'موتور تويوتا كامري 2019 بحالة جيدة',
  'cat-vehicles-test',
  'BARTER',
  'GOOD',
  40000,
  ARRAY['https://example.com/engine.jpg'],
  'القاهرة',
  'المعادي',
  'المعادي الجديدة',
  'cat-sports-test',
  'أدوات رياضية',
  'رياضة,جيم,أثقال,treadmill,مشاية',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Mahmoud has sports equipment, wants furniture
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, desired_category_id, desired_item_title, desired_keywords, status, created_at, updated_at)
VALUES (
  'item-mahmoud-gym',
  'user-mahmoud-test',
  'جهاز جري كهربائي وأثقال',
  'تريدميل مشاية كهربائية + مجموعة أثقال حديد',
  'cat-sports-test',
  'BARTER',
  'GOOD',
  30000,
  ARRAY['https://example.com/gym.jpg'],
  'الجيزة',
  'الدقي',
  'ميدان المساحة',
  'cat-furniture-test',
  'أثاث صالون',
  'أثاث,صالون,كنب,furniture,salon',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. SUPPLY-DEMAND MATCHING
-- ============================================

-- Amal selling books
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, status, created_at, updated_at)
VALUES (
  'item-amal-books',
  'user-amal-test',
  'مجموعة كتب برمجة وتقنية',
  'مجموعة من 10 كتب في البرمجة وعلوم الحاسب',
  'cat-books-test',
  'DIRECT_SALE',
  'EXCELLENT',
  1500,
  ARRAY['https://example.com/books.jpg'],
  'الإسكندرية',
  'سموحة',
  'شارع فوزي معاذ',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Nadia wants books
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, desired_keywords, desired_value_max, status, created_at, updated_at)
VALUES (
  'item-nadia-wants-books',
  'user-nadia-test',
  'مطلوب كتب برمجة',
  'أبحث عن كتب في تعلم البرمجة',
  'cat-books-test',
  'DIRECT_BUY',
  'GOOD',
  2000,
  ARRAY[]::text[],
  'الجيزة',
  'الهرم',
  'شارع الأهرام',
  'كتب,برمجة,تقنية,programming,books',
  2500,
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 7. VALUE RANGE MATCHING (Clothing)
-- ============================================

-- Omar selling jacket
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, status, created_at, updated_at)
VALUES (
  'item-omar-jacket',
  'user-omar-test',
  'جاكيت جلد أصلي',
  'جاكيت جلد طبيعي مقاس L بحالة ممتازة',
  'cat-clothing-test',
  'DIRECT_SALE',
  'EXCELLENT',
  500,
  ARRAY['https://example.com/jacket.jpg'],
  'القاهرة',
  'مدينة نصر',
  'الحي الثاني',
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- Mona wants jacket
INSERT INTO items (id, seller_id, title, description, category_id, listing_type, condition, estimated_value, images, governorate, city, district, desired_keywords, desired_value_min, desired_value_max, status, created_at, updated_at)
VALUES (
  'item-mona-wants-jacket',
  'user-mona-test',
  'مطلوب جاكيت جلد',
  'أبحث عن جاكيت جلد مقاس L أو XL',
  'cat-clothing-test',
  'DIRECT_BUY',
  'GOOD',
  600,
  ARRAY[]::text[],
  'القاهرة',
  'مدينة نصر',
  'الحي الثالث',
  'جاكيت,جلد,leather,jacket',
  300,
  800,
  'ACTIVE',
  NOW(),
  NOW()
) ON CONFLICT (id) DO NOTHING;

-- ============================================
-- SUMMARY
-- ============================================
-- Test Scenarios Created:
-- ✅ Perfect Barter Match: Ahmed (iPhone) ↔ Sara (MacBook) - same district
-- ✅ Geographic Proximity: PS5 across Cairo and Alexandria
-- ✅ Multi-Party Chain: Mona→Fatma→Mahmoud (furniture↔vehicle↔sports)
-- ✅ Supply-Demand: Amal books → Nadia
-- ✅ Value Range: Jacket price tolerance matching

SELECT
  'Matching Test Data Seeded Successfully!' as status,
  (SELECT COUNT(*) FROM users WHERE email LIKE '%@matchtest.com') as test_users,
  (SELECT COUNT(*) FROM categories WHERE slug LIKE '%-test') as test_categories,
  (SELECT COUNT(*) FROM items WHERE id LIKE 'item-%') as test_items;
