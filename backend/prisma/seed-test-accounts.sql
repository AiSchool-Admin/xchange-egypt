-- =====================================================
-- 10 TEST ACCOUNTS FOR XCHANGE PLATFORM (Supabase)
-- =====================================================
-- Password for ALL accounts: Test@1234
-- =====================================================

-- Clear existing test users (if any)
DELETE FROM users WHERE email LIKE 'test%@xchange.eg';

-- =====================================================
-- CREATE 10 TEST USERS
-- =====================================================
-- Password hash for "Test@1234" (bcrypt, 10 rounds)

INSERT INTO users (id, email, password_hash, full_name, phone, user_type, business_name, governorate, city, address, email_verified, created_at, updated_at)
VALUES
  (
    gen_random_uuid(),
    'test1@xchange.eg',
    '$2b$10$EtbvwUriPSY3T0q4UvusJO1uqm2fLiGXBqQzAG3s7VTpS5MywFOYK',
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
  (
    gen_random_uuid(),
    'test2@xchange.eg',
    '$2b$10$EtbvwUriPSY3T0q4UvusJO1uqm2fLiGXBqQzAG3s7VTpS5MywFOYK',
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
  (
    gen_random_uuid(),
    'test3@xchange.eg',
    '$2b$10$EtbvwUriPSY3T0q4UvusJO1uqm2fLiGXBqQzAG3s7VTpS5MywFOYK',
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
  (
    gen_random_uuid(),
    'test4@xchange.eg',
    '$2b$10$EtbvwUriPSY3T0q4UvusJO1uqm2fLiGXBqQzAG3s7VTpS5MywFOYK',
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
  (
    gen_random_uuid(),
    'test5@xchange.eg',
    '$2b$10$EtbvwUriPSY3T0q4UvusJO1uqm2fLiGXBqQzAG3s7VTpS5MywFOYK',
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
  ),
  (
    gen_random_uuid(),
    'test6@xchange.eg',
    '$2b$10$EtbvwUriPSY3T0q4UvusJO1uqm2fLiGXBqQzAG3s7VTpS5MywFOYK',
    'عمر العقارات',
    '+201666666666',
    'BUSINESS',
    'شركة عمر للعقارات',
    'Cairo',
    'New Cairo',
    '45 شارع التسعين، التجمع الخامس',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'test7@xchange.eg',
    '$2b$10$EtbvwUriPSY3T0q4UvusJO1uqm2fLiGXBqQzAG3s7VTpS5MywFOYK',
    'نورا الموضة',
    '+201777777777',
    'BUSINESS',
    'بوتيك نورا للأزياء',
    'Cairo',
    'Maadi',
    '12 شارع 9، المعادي',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'test8@xchange.eg',
    '$2b$10$EtbvwUriPSY3T0q4UvusJO1uqm2fLiGXBqQzAG3s7VTpS5MywFOYK',
    'حسن السيارات',
    '+201888888888',
    'BUSINESS',
    'معرض حسن للسيارات',
    'Giza',
    '6th of October',
    'المحور المركزي، الحي السابع',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'test9@xchange.eg',
    '$2b$10$EtbvwUriPSY3T0q4UvusJO1uqm2fLiGXBqQzAG3s7VTpS5MywFOYK',
    'منى المقتنيات',
    '+201999999999',
    'INDIVIDUAL',
    NULL,
    'Alexandria',
    'Montaza',
    '8 شارع الجيش، المنتزه',
    true,
    NOW(),
    NOW()
  ),
  (
    gen_random_uuid(),
    'test10@xchange.eg',
    '$2b$10$EtbvwUriPSY3T0q4UvusJO1uqm2fLiGXBqQzAG3s7VTpS5MywFOYK',
    'يوسف الرياضة',
    '+201010101010',
    'BUSINESS',
    'سبورتس زون',
    'Cairo',
    'Heliopolis',
    '30 شارع الحجاز، مصر الجديدة',
    true,
    NOW(),
    NOW()
  )
ON CONFLICT (email) DO UPDATE SET
  password_hash = EXCLUDED.password_hash,
  full_name = EXCLUDED.full_name,
  updated_at = NOW();

-- =====================================================
-- CREATE ITEMS FOR EACH USER
-- =====================================================

-- Items for User 1 (أحمد التاجر - Direct Sales)
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'آيفون 15 برو ماكس 256GB جديد',
  'آيفون 15 برو ماكس جديد بالكرتونة، ضمان أبل سنة كاملة. لون تيتانيوم طبيعي.',
  'NEW',
  75000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test1@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'لابتوب ماك بوك اير M3 جديد',
  'ماك بوك اير M3 شريحة جديدة، 8GB RAM، 256GB SSD. لون ميدنايت.',
  'NEW',
  55000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test1@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'سماعات AirPods Pro 2 جديدة',
  'سماعات أبل ايربودز برو 2 جديدة بالكرتونة، USB-C.',
  'NEW',
  12000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test1@xchange.eg';

-- Items for User 2 (سارة المقايضة - Barter)
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, desired_item_title, desired_item_description, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'أريكة جلد طبيعي 3 مقاعد',
  'أريكة جلد طبيعي إيطالي، لون بني، حالة ممتازة. أبحث عن مقايضة بطاولة سفرة.',
  'LIKE_NEW',
  25000,
  'BARTER',
  'GOOD',
  'Alexandria',
  'ACTIVE',
  '{}',
  'طاولة سفرة 6 أشخاص',
  'طاولة سفرة خشب زان مع 6 كراسي',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test2@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, desired_item_title, desired_item_description, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'سامسونج S24 Ultra للمقايضة',
  'سامسونج جالاكسي S24 Ultra، 512GB، حالة ممتازة. أقايضه بآيفون 15 برو.',
  'LIKE_NEW',
  60000,
  'BARTER',
  'GOOD',
  'Alexandria',
  'ACTIVE',
  '{}',
  'آيفون 15 برو أو أحدث',
  'آيفون 15 برو أو برو ماكس بحالة جيدة',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test2@xchange.eg';

-- Items for User 3 (محمد المزادات - Auctions)
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'مرسيدس E200 موديل 2020 - مزاد',
  'مرسيدس E200 موديل 2020، 45,000 كم، فبريكا بالكامل. المزاد يبدأ من 1,200,000 جنيه.',
  'LIKE_NEW',
  1500000,
  'AUCTION',
  'GOOD',
  'Giza',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test3@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'كاميرا سوني A7IV - مزاد',
  'كاميرا سوني A7IV مع عدسة 24-70mm، حالة ممتازة. المزاد يبدأ من 80,000 جنيه.',
  'LIKE_NEW',
  120000,
  'AUCTION',
  'GOOD',
  'Giza',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test3@xchange.eg';

-- Items for User 4 (فاطمة الخردة - Scrap)
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, is_scrap, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'نحاس أصفر خردة - 50 كيلو',
  'نحاس أصفر خردة نظيف، 50 كيلو جاهز للتسليم. السعر للكيلو.',
  'POOR',
  15000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  true,
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test4@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, is_scrap, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'ألومنيوم خردة - 100 كيلو',
  'ألومنيوم خردة متنوع (علب، أسلاك، قطع)، 100 كيلو.',
  'POOR',
  8000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  true,
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test4@xchange.eg';

-- Items for User 5 (كريم الفاخر - Luxury)
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'ساعة رولكس صب مارينر أصلية',
  'ساعة رولكس صب مارينر أصلية 100%، موديل 2022، مع الأوراق والضمان الدولي.',
  'LIKE_NEW',
  850000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test5@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'حقيبة هيرميس بيركين 30 أصلية',
  'حقيبة هيرميس بيركين 30 أصلية، جلد توغو، لون إتوب. مع الفاتورة والكرتونة.',
  'LIKE_NEW',
  1200000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test5@xchange.eg';

-- Items for User 6 (عمر العقارات - Real Estate)
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, desired_item_title, desired_item_description, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'شقة 150م² بالتجمع الخامس للمقايضة',
  'شقة 150 متر مربع، 3 غرف، 2 حمام، تشطيب سوبر لوكس. أبحث عن مقايضة بسيارة + فرق نقدي.',
  'LIKE_NEW',
  3500000,
  'BARTER',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  'سيارة حديثة + فرق نقدي',
  'سيارة موديل 2022 أو أحدث + فرق نقدي',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test6@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'محل تجاري 80م² بمول تجاري',
  'محل تجاري 80 متر مربع في مول تجاري راقي، واجهة زجاجية، تكييف مركزي.',
  'NEW',
  2800000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test6@xchange.eg';

-- Items for User 7 (نورا الموضة - Fashion)
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'فستان سهرة شانيل أصلي',
  'فستان سهرة شانيل أصلي، مقاس M، لون أسود كلاسيكي. تم ارتداؤه مرة واحدة فقط.',
  'LIKE_NEW',
  85000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test7@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'حذاء لوبوتان أحمر أصلي',
  'حذاء كريستيان لوبوتان أصلي، كعب عالي، مقاس 38، لون أحمر مميز.',
  'LIKE_NEW',
  25000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test7@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, desired_item_title, desired_item_description, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'مجموعة حقائب ديور للمقايضة',
  'مجموعة من 3 حقائب ديور أصلية بحالات مختلفة. أقايضها بحقيبة لويس فيتون.',
  'GOOD',
  120000,
  'BARTER',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  'حقيبة لويس فيتون',
  'حقيبة لويس فيتون نيفرفول أو سبيدي',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test7@xchange.eg';

-- Items for User 8 (حسن السيارات - Cars Auction)
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'BMW X5 موديل 2022 - مزاد',
  'بي إم دبليو X5 موديل 2022، 25,000 كم، فل أوبشن، لون أبيض. المزاد يبدأ من 2,500,000 جنيه.',
  'LIKE_NEW',
  3200000,
  'AUCTION',
  'GOOD',
  'Giza',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test8@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'تويوتا كورولا 2023 - مزاد',
  'تويوتا كورولا هايبرد 2023، 10,000 كم، لون فضي. المزاد يبدأ من 850,000 جنيه.',
  'NEW',
  1100000,
  'AUCTION',
  'GOOD',
  'Giza',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test8@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'هيونداي توسان 2021 للبيع',
  'هيونداي توسان 2021، 35,000 كم، فبريكا، تكييف ديجيتال، شاشة.',
  'GOOD',
  750000,
  'DIRECT_SALE',
  'GOOD',
  'Giza',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test8@xchange.eg';

-- Items for User 9 (منى المقتنيات - Collectibles/Antiques)
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, desired_item_title, desired_item_description, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'طقم أنتيك صيني قديم للمقايضة',
  'طقم شاي صيني أنتيك من القرن 19، 12 قطعة، حالة ممتازة. أبحث عن لوحات فنية.',
  'GOOD',
  45000,
  'BARTER',
  'GOOD',
  'Alexandria',
  'ACTIVE',
  '{}',
  'لوحات فنية أصلية',
  'لوحات زيتية أو مائية لفنانين معروفين',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test9@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'ساعة جيب ذهبية أنتيك - مزاد',
  'ساعة جيب ذهبية سويسرية من عام 1920، تعمل بشكل ممتاز، مع السلسلة الأصلية.',
  'GOOD',
  180000,
  'AUCTION',
  'GOOD',
  'Alexandria',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test9@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'عملات مصرية قديمة - مجموعة نادرة',
  'مجموعة عملات مصرية من عهد الملك فاروق، 25 قطعة متنوعة.',
  'GOOD',
  35000,
  'DIRECT_SALE',
  'GOOD',
  'Alexandria',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test9@xchange.eg';

-- Items for User 10 (يوسف الرياضة - Sports Equipment)
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'جهاز مشي كهربائي احترافي',
  'جهاز مشي Technogym احترافي، سرعة حتى 20 كم/ساعة، شاشة LCD.',
  'LIKE_NEW',
  45000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test10@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'دراجة هوائية Trek Madone',
  'دراجة Trek Madone SLR، كربون فايبر، مقاس 56، مكونات Shimano Ultegra.',
  'LIKE_NEW',
  85000,
  'DIRECT_SALE',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test10@xchange.eg';

INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, listing_type, item_type, governorate, status, images, desired_item_title, desired_item_description, created_at, updated_at)
SELECT
  gen_random_uuid(),
  u.id,
  (SELECT id FROM categories LIMIT 1),
  'طاولة بينج بونج أولمبية للمقايضة',
  'طاولة بينج بونج Butterfly أولمبية، حالة ممتازة. أقايضها بأجهزة رياضية أخرى.',
  'GOOD',
  15000,
  'BARTER',
  'GOOD',
  'Cairo',
  'ACTIVE',
  '{}',
  'أجهزة رياضية',
  'دمبلز أو أثقال أو جهاز متعدد',
  NOW(),
  NOW()
FROM users u WHERE u.email = 'test10@xchange.eg';

-- =====================================================
-- VERIFY CREATED DATA
-- =====================================================
SELECT
  '✅ Users Created:' as status,
  COUNT(*) as count
FROM users
WHERE email LIKE 'test%@xchange.eg';

SELECT
  '✅ Items Created:' as status,
  COUNT(*) as count
FROM items i
JOIN users u ON i.seller_id = u.id
WHERE u.email LIKE 'test%@xchange.eg';

-- =====================================================
-- LOGIN CREDENTIALS (10 TEST ACCOUNTS)
-- =====================================================
--
-- ┌─────────────────────────┬──────────────────┬───────────────┬─────────────┐
-- │ Email                   │ Name             │ Market        │ Items       │
-- ├─────────────────────────┼──────────────────┼───────────────┼─────────────┤
-- │ test1@xchange.eg        │ أحمد التاجر      │ Electronics   │ 3 منتجات    │
-- │ test2@xchange.eg        │ سارة المقايضة    │ Barter        │ 2 منتجات    │
-- │ test3@xchange.eg        │ محمد المزادات    │ Auctions      │ 2 منتجات    │
-- │ test4@xchange.eg        │ فاطمة الخردة     │ Scrap Market  │ 2 منتجات    │
-- │ test5@xchange.eg        │ كريم الفاخر      │ Luxury        │ 2 منتجات    │
-- │ test6@xchange.eg        │ عمر العقارات     │ Real Estate   │ 2 منتجات    │
-- │ test7@xchange.eg        │ نورا الموضة      │ Fashion       │ 3 منتجات    │
-- │ test8@xchange.eg        │ حسن السيارات     │ Cars/Auction  │ 3 منتجات    │
-- │ test9@xchange.eg        │ منى المقتنيات    │ Collectibles  │ 3 منتجات    │
-- │ test10@xchange.eg       │ يوسف الرياضة     │ Sports        │ 3 منتجات    │
-- └─────────────────────────┴──────────────────┴───────────────┴─────────────┘
--
-- Password for ALL: Test@1234
-- Total Items: 25 items across all market types
-- =====================================================
