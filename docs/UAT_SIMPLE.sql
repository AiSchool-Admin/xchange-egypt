-- =====================================================
-- UAT SEED DATA - نسخة مبسطة تعمل مباشرة
-- كلمة المرور: Test@1234
-- =====================================================

-- 1. إنشاء المستخدمين الاختباريين
INSERT INTO users (id, email, password_hash, full_name, phone, user_type, governorate, city, address, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
VALUES
(gen_random_uuid()::TEXT, 'test1@xchange.eg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'أحمد التاجر', '+201111111111', 'BUSINESS', 'Cairo', 'Nasr City', '15 شارع عباس العقاد', true, true, 4.8, 45, NOW(), NOW()),
(gen_random_uuid()::TEXT, 'test2@xchange.eg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'سارة المقايضة', '+201222222222', 'INDIVIDUAL', 'Alexandria', 'Smouha', '25 شارع فوزي معاذ', true, true, 4.9, 32, NOW(), NOW()),
(gen_random_uuid()::TEXT, 'test3@xchange.eg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'محمد المزادات', '+201333333333', 'INDIVIDUAL', 'Giza', 'Dokki', '8 شارع التحرير', true, true, 4.7, 28, NOW(), NOW()),
(gen_random_uuid()::TEXT, 'test4@xchange.eg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'فاطمة الخردة', '+201444444444', 'BUSINESS', 'Cairo', 'Shubra', '120 شارع شبرا', true, true, 4.6, 67, NOW(), NOW()),
(gen_random_uuid()::TEXT, 'test5@xchange.eg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'كريم الفاخر', '+201555555555', 'INDIVIDUAL', 'Cairo', 'Zamalek', '5 شارع البرازيل', true, true, 5.0, 15, NOW(), NOW()),
(gen_random_uuid()::TEXT, 'test6@xchange.eg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'نورا المناقصات', '+201666666666', 'BUSINESS', 'Cairo', 'Maadi', '45 شارع 9', true, true, 4.5, 22, NOW(), NOW()),
(gen_random_uuid()::TEXT, 'test7@xchange.eg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'ياسر العقارات', '+201777777777', 'BUSINESS', 'Cairo', 'New Cairo', '10 التجمع الخامس', true, true, 4.4, 18, NOW(), NOW()),
(gen_random_uuid()::TEXT, 'test8@xchange.eg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'منى الموبايلات', '+201888888888', 'BUSINESS', 'Alexandria', 'Sidi Gaber', '78 شارع سيدي جابر', true, true, 4.8, 56, NOW(), NOW()),
(gen_random_uuid()::TEXT, 'test9@xchange.eg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'علي السيارات', '+201999999999', 'BUSINESS', 'Giza', '6th of October', 'المحور المركزي', true, true, 4.3, 89, NOW(), NOW()),
(gen_random_uuid()::TEXT, 'test10@xchange.eg', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'هدى المشتريات', '+201000000010', 'INDIVIDUAL', 'Cairo', 'Heliopolis', '30 شارع الميرغني', true, true, 4.7, 12, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- 2. إنشاء عناوين الشحن
INSERT INTO shipping_addresses (id, user_id, full_name, phone, address, city, governorate, is_default, created_at, updated_at)
SELECT gen_random_uuid()::TEXT, id, full_name, phone, address, city, governorate, true, NOW(), NOW()
FROM users WHERE email LIKE 'test%@xchange.eg'
ON CONFLICT DO NOTHING;

-- 3. إنشاء المنتجات
INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
SELECT
    gen_random_uuid()::TEXT,
    (SELECT id FROM users WHERE email = 'test1@xchange.eg'),
    'آيفون 15 برو ماكس 256GB',
    'آيفون جديد بالكرتونة، ضمان سنة',
    (SELECT id FROM categories WHERE is_active = true LIMIT 1),
    'NEW',
    75000,
    'Cairo',
    'Nasr City',
    'ACTIVE',
    ARRAY['https://placehold.co/400x400?text=iPhone15'],
    'DIRECT_SALE',
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'test1@xchange.eg');

INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
SELECT
    gen_random_uuid()::TEXT,
    (SELECT id FROM users WHERE email = 'test1@xchange.eg'),
    'ماك بوك اير M3',
    'ماك بوك اير جديد',
    (SELECT id FROM categories WHERE is_active = true LIMIT 1),
    'NEW',
    55000,
    'Cairo',
    'Nasr City',
    'ACTIVE',
    ARRAY['https://placehold.co/400x400?text=MacBook'],
    'DIRECT_SALE',
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'test1@xchange.eg');

INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, desired_item_title, created_at, updated_at)
SELECT
    gen_random_uuid()::TEXT,
    (SELECT id FROM users WHERE email = 'test2@xchange.eg'),
    'سامسونج S24 Ultra للمقايضة',
    'سامسونج S24 Ultra حالة ممتازة',
    (SELECT id FROM categories WHERE is_active = true LIMIT 1),
    'LIKE_NEW',
    60000,
    'Alexandria',
    'Smouha',
    'ACTIVE',
    ARRAY['https://placehold.co/400x400?text=S24'],
    'BARTER',
    'آيفون 15 برو',
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'test2@xchange.eg');

INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
SELECT
    gen_random_uuid()::TEXT,
    (SELECT id FROM users WHERE email = 'test3@xchange.eg'),
    'كاميرا سوني A7IV - مزاد',
    'كاميرا سوني مع عدسة',
    (SELECT id FROM categories WHERE is_active = true LIMIT 1),
    'LIKE_NEW',
    120000,
    'Giza',
    'Dokki',
    'ACTIVE',
    ARRAY['https://placehold.co/400x400?text=Sony'],
    'AUCTION',
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'test3@xchange.eg');

INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
SELECT
    gen_random_uuid()::TEXT,
    (SELECT id FROM users WHERE email = 'test8@xchange.eg'),
    'آيفون 14 برو مستعمل',
    'آيفون 14 برو حالة ممتازة',
    (SELECT id FROM categories WHERE is_active = true LIMIT 1),
    'LIKE_NEW',
    45000,
    'Alexandria',
    'Sidi Gaber',
    'ACTIVE',
    ARRAY['https://placehold.co/400x400?text=iPhone14'],
    'DIRECT_SALE',
    NOW(),
    NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'test8@xchange.eg');

-- 4. إنشاء الإعلانات (Listings)
INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
SELECT
    gen_random_uuid()::TEXT,
    i.id,
    i.seller_id,
    'DIRECT_SALE',
    i.estimated_value,
    'ACTIVE',
    NOW(),
    NOW()
FROM items i
JOIN users u ON i.seller_id = u.id
WHERE u.email LIKE 'test%@xchange.eg' AND i.listing_type = 'DIRECT_SALE'
ON CONFLICT DO NOTHING;

-- 5. إنشاء إشعارات
INSERT INTO notifications (id, user_id, type, priority, title, message, is_read, created_at, updated_at)
SELECT
    gen_random_uuid()::TEXT,
    id,
    'BARTER_OFFER_RECEIVED',
    'HIGH',
    'مرحباً بك في Xchange!',
    'شكراً لانضمامك. ابدأ الآن بتصفح المنتجات أو إضافة منتجاتك',
    false,
    NOW(),
    NOW()
FROM users WHERE email LIKE 'test%@xchange.eg';

-- Done!
SELECT 'تم إنشاء البيانات بنجاح! كلمة المرور: Test@1234' as result;
