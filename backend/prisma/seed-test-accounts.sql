-- =====================================================
-- 5 TEST ACCOUNTS FOR XCHANGE PLATFORM
-- =====================================================
-- Password for ALL accounts: Test@1234
-- Hash: $2b$10$rQZ5QzZQzZQzZQzZQzZQzO (bcrypt)
-- =====================================================

-- Clear existing test users (if any)
DELETE FROM "User" WHERE email LIKE 'test%@xchange.eg';

-- =====================================================
-- CREATE 5 TEST USERS
-- =====================================================
-- Password hash for "Test@1234"
-- Generated with bcrypt, 10 rounds

INSERT INTO "User" (id, email, password, "fullName", phone, "accountType", "businessName", governorate, city, address, "isVerified", "createdAt", "updatedAt")
VALUES
  -- User 1: أحمد التاجر (Electronics - Direct Sales)
  (
    'test-user-001-uuid-here',
    'test1@xchange.eg',
    '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMvzTakPxh5HzTQoRh.1aZuVXYJKdGK',
    'أحمد التاجر',
    '+201111111111',
    'BUSINESS',
    'متجر أحمد للإلكترونيات',
    'Cairo',
    'Nasr City',
    '15 شارع عباس العقاد، مدينة نصر',
    true,
    NOW(),
    NOW()
  ),
  -- User 2: سارة المقايضة (Barter)
  (
    'test-user-002-uuid-here',
    'test2@xchange.eg',
    '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMvzTakPxh5HzTQoRh.1aZuVXYJKdGK',
    'سارة المقايضة',
    '+201222222222',
    'INDIVIDUAL',
    NULL,
    'Alexandria',
    'Smouha',
    '25 شارع فوزي معاذ، سموحة',
    true,
    NOW(),
    NOW()
  ),
  -- User 3: محمد المزادات (Auctions)
  (
    'test-user-003-uuid-here',
    'test3@xchange.eg',
    '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMvzTakPxh5HzTQoRh.1aZuVXYJKdGK',
    'محمد المزادات',
    '+201333333333',
    'INDIVIDUAL',
    NULL,
    'Giza',
    'Dokki',
    '8 شارع التحرير، الدقي',
    true,
    NOW(),
    NOW()
  ),
  -- User 4: فاطمة الخردة (Scrap Market)
  (
    'test-user-004-uuid-here',
    'test4@xchange.eg',
    '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMvzTakPxh5HzTQoRh.1aZuVXYJKdGK',
    'فاطمة الخردة',
    '+201444444444',
    'BUSINESS',
    'مؤسسة الخردة الذهبية',
    'Cairo',
    'Shubra',
    '120 شارع شبرا الرئيسي',
    true,
    NOW(),
    NOW()
  ),
  -- User 5: كريم الفاخر (Luxury)
  (
    'test-user-005-uuid-here',
    'test5@xchange.eg',
    '$2b$10$8K1p/a0dL1LXMIgoEDFrwOfMvzTakPxh5HzTQoRh.1aZuVXYJKdGK',
    'كريم الفاخر',
    '+201555555555',
    'INDIVIDUAL',
    NULL,
    'Cairo',
    'Zamalek',
    '5 شارع البرازيل، الزمالك',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  password = EXCLUDED.password,
  "fullName" = EXCLUDED."fullName",
  "updatedAt" = NOW();

-- =====================================================
-- GET CATEGORY IDS (adjust based on your categories)
-- =====================================================
-- Run this to see your categories:
-- SELECT id, slug, "nameAr" FROM "Category";

-- =====================================================
-- CREATE ITEMS FOR EACH USER
-- =====================================================

-- Items for User 1 (أحمد التاجر - Direct Sales)
INSERT INTO "Item" (id, "sellerId", "categoryId", "titleAr", "titleEn", "descriptionAr", "descriptionEn", condition, "estimatedValue", quantity, location, governorate, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE((SELECT id FROM "Category" WHERE slug = 'mobile-phones' LIMIT 1), (SELECT id FROM "Category" LIMIT 1)),
  'آيفون 15 برو ماكس 256GB جديد',
  'iPhone 15 Pro Max 256GB New',
  'آيفون 15 برو ماكس جديد بالكرتونة، ضمان أبل سنة كاملة. لون تيتانيوم طبيعي.',
  'Brand new iPhone 15 Pro Max in box, 1-year Apple warranty. Natural Titanium color.',
  'NEW',
  75000,
  3,
  'Nasr City',
  'Cairo',
  'ACTIVE',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'test1@xchange.eg';

INSERT INTO "Item" (id, "sellerId", "categoryId", "titleAr", "titleEn", "descriptionAr", "descriptionEn", condition, "estimatedValue", quantity, location, governorate, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE((SELECT id FROM "Category" WHERE slug = 'computers' LIMIT 1), (SELECT id FROM "Category" LIMIT 1)),
  'لابتوب ماك بوك اير M3 جديد',
  'MacBook Air M3 New',
  'ماك بوك اير M3 شريحة جديدة، 8GB RAM، 256GB SSD. لون ميدنايت.',
  'MacBook Air M3 chip new, 8GB RAM, 256GB SSD. Midnight color.',
  'NEW',
  55000,
  2,
  'Nasr City',
  'Cairo',
  'ACTIVE',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'test1@xchange.eg';

INSERT INTO "Item" (id, "sellerId", "categoryId", "titleAr", "titleEn", "descriptionAr", "descriptionEn", condition, "estimatedValue", quantity, location, governorate, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE((SELECT id FROM "Category" WHERE slug = 'electronics' LIMIT 1), (SELECT id FROM "Category" LIMIT 1)),
  'سماعات AirPods Pro 2 جديدة',
  'AirPods Pro 2 New',
  'سماعات أبل ايربودز برو 2 جديدة بالكرتونة، USB-C.',
  'Apple AirPods Pro 2 new in box, USB-C version.',
  'NEW',
  12000,
  5,
  'Nasr City',
  'Cairo',
  'ACTIVE',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'test1@xchange.eg';

-- Items for User 2 (سارة المقايضة - Barter)
INSERT INTO "Item" (id, "sellerId", "categoryId", "titleAr", "titleEn", "descriptionAr", "descriptionEn", condition, "estimatedValue", quantity, location, governorate, status, "desiredItemTitle", "desiredItemDescription", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE((SELECT id FROM "Category" WHERE slug = 'furniture' LIMIT 1), (SELECT id FROM "Category" LIMIT 1)),
  'أريكة جلد طبيعي 3 مقاعد',
  'Genuine Leather 3-Seater Sofa',
  'أريكة جلد طبيعي إيطالي، لون بني، حالة ممتازة. أبحث عن مقايضة بطاولة سفرة.',
  'Italian genuine leather sofa, brown color, excellent condition. Looking to trade for dining table.',
  'LIKE_NEW',
  25000,
  1,
  'Smouha',
  'Alexandria',
  'ACTIVE',
  'طاولة سفرة 6 أشخاص',
  'طاولة سفرة خشب زان مع 6 كراسي',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'test2@xchange.eg';

INSERT INTO "Item" (id, "sellerId", "categoryId", "titleAr", "titleEn", "descriptionAr", "descriptionEn", condition, "estimatedValue", quantity, location, governorate, status, "desiredItemTitle", "desiredItemDescription", "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE((SELECT id FROM "Category" WHERE slug = 'mobile-phones' LIMIT 1), (SELECT id FROM "Category" LIMIT 1)),
  'سامسونج S24 Ultra للمقايضة',
  'Samsung S24 Ultra for Barter',
  'سامسونج جالاكسي S24 Ultra، 512GB، حالة ممتازة. أقايضه بآيفون 15 برو.',
  'Samsung Galaxy S24 Ultra, 512GB, excellent condition. Trade for iPhone 15 Pro.',
  'LIKE_NEW',
  60000,
  1,
  'Smouha',
  'Alexandria',
  'ACTIVE',
  'آيفون 15 برو أو أحدث',
  'آيفون 15 برو أو برو ماكس بحالة جيدة',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'test2@xchange.eg';

-- Items for User 3 (محمد المزادات - Auctions)
INSERT INTO "Item" (id, "sellerId", "categoryId", "titleAr", "titleEn", "descriptionAr", "descriptionEn", condition, "estimatedValue", quantity, location, governorate, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE((SELECT id FROM "Category" WHERE slug = 'vehicles' LIMIT 1), (SELECT id FROM "Category" LIMIT 1)),
  'مرسيدس E200 موديل 2020 - مزاد',
  'Mercedes E200 2020 - Auction',
  'مرسيدس E200 موديل 2020، 45,000 كم، فبريكا بالكامل. المزاد يبدأ من 1,200,000 جنيه.',
  'Mercedes E200 2020 model, 45,000 km, fully original. Auction starts at 1,200,000 EGP.',
  'LIKE_NEW',
  1500000,
  1,
  'Dokki',
  'Giza',
  'ACTIVE',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'test3@xchange.eg';

INSERT INTO "Item" (id, "sellerId", "categoryId", "titleAr", "titleEn", "descriptionAr", "descriptionEn", condition, "estimatedValue", quantity, location, governorate, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE((SELECT id FROM "Category" WHERE slug = 'electronics' LIMIT 1), (SELECT id FROM "Category" LIMIT 1)),
  'كاميرا سوني A7IV - مزاد',
  'Sony A7IV Camera - Auction',
  'كاميرا سوني A7IV مع عدسة 24-70mm، حالة ممتازة. المزاد يبدأ من 80,000 جنيه.',
  'Sony A7IV camera with 24-70mm lens, excellent condition. Auction starts at 80,000 EGP.',
  'LIKE_NEW',
  120000,
  1,
  'Dokki',
  'Giza',
  'ACTIVE',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'test3@xchange.eg';

-- Items for User 4 (فاطمة الخردة - Scrap)
INSERT INTO "Item" (id, "sellerId", "categoryId", "titleAr", "titleEn", "descriptionAr", "descriptionEn", condition, "estimatedValue", quantity, location, governorate, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE((SELECT id FROM "Category" WHERE slug = 'scrap' LIMIT 1), (SELECT id FROM "Category" LIMIT 1)),
  'نحاس أصفر خردة - 50 كيلو',
  'Yellow Brass Scrap - 50kg',
  'نحاس أصفر خردة نظيف، 50 كيلو جاهز للتسليم. السعر للكيلو.',
  'Clean yellow brass scrap, 50kg ready for delivery. Price per kg.',
  'POOR',
  15000,
  50,
  'Shubra',
  'Cairo',
  'ACTIVE',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'test4@xchange.eg';

INSERT INTO "Item" (id, "sellerId", "categoryId", "titleAr", "titleEn", "descriptionAr", "descriptionEn", condition, "estimatedValue", quantity, location, governorate, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE((SELECT id FROM "Category" WHERE slug = 'scrap' LIMIT 1), (SELECT id FROM "Category" LIMIT 1)),
  'ألومنيوم خردة - 100 كيلو',
  'Aluminum Scrap - 100kg',
  'ألومنيوم خردة متنوع (علب، أسلاك، قطع)، 100 كيلو.',
  'Mixed aluminum scrap (cans, wires, pieces), 100kg.',
  'POOR',
  8000,
  100,
  'Shubra',
  'Cairo',
  'ACTIVE',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'test4@xchange.eg';

-- Items for User 5 (كريم الفاخر - Luxury)
INSERT INTO "Item" (id, "sellerId", "categoryId", "titleAr", "titleEn", "descriptionAr", "descriptionEn", condition, "estimatedValue", quantity, location, governorate, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE((SELECT id FROM "Category" WHERE slug = 'fashion' LIMIT 1), (SELECT id FROM "Category" LIMIT 1)),
  'ساعة رولكس صب مارينر أصلية',
  'Rolex Submariner Original Watch',
  'ساعة رولكس صب مارينر أصلية 100%، موديل 2022، مع الأوراق والضمان الدولي.',
  '100% original Rolex Submariner, 2022 model, with papers and international warranty.',
  'LIKE_NEW',
  850000,
  1,
  'Zamalek',
  'Cairo',
  'ACTIVE',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'test5@xchange.eg';

INSERT INTO "Item" (id, "sellerId", "categoryId", "titleAr", "titleEn", "descriptionAr", "descriptionEn", condition, "estimatedValue", quantity, location, governorate, status, "createdAt", "updatedAt")
SELECT
  gen_random_uuid(),
  u.id,
  COALESCE((SELECT id FROM "Category" WHERE slug = 'fashion' LIMIT 1), (SELECT id FROM "Category" LIMIT 1)),
  'حقيبة هيرميس بيركين 30 أصلية',
  'Hermès Birkin 30 Original Bag',
  'حقيبة هيرميس بيركين 30 أصلية، جلد توغو، لون إتوب. مع الفاتورة والكرتونة.',
  'Original Hermès Birkin 30, Togo leather, Etoupe color. With receipt and box.',
  'LIKE_NEW',
  1200000,
  1,
  'Zamalek',
  'Cairo',
  'ACTIVE',
  NOW(),
  NOW()
FROM "User" u WHERE u.email = 'test5@xchange.eg';

-- =====================================================
-- SUMMARY
-- =====================================================
--
-- ┌─────────────────────────┬──────────────────┬───────────────┐
-- │ Email                   │ Name             │ Market        │
-- ├─────────────────────────┼──────────────────┼───────────────┤
-- │ test1@xchange.eg        │ أحمد التاجر      │ Direct Sales  │
-- │ test2@xchange.eg        │ سارة المقايضة    │ Barter        │
-- │ test3@xchange.eg        │ محمد المزادات    │ Auctions      │
-- │ test4@xchange.eg        │ فاطمة الخردة     │ Scrap Market  │
-- │ test5@xchange.eg        │ كريم الفاخر      │ Luxury        │
-- └─────────────────────────┴──────────────────┴───────────────┘
--
-- Password for ALL: Test@1234
-- =====================================================
