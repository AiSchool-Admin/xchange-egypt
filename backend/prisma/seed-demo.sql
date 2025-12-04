-- ============================================
-- بيانات العرض التوضيحي للمستثمرين (نسخة مبسطة)
-- Demo Seed Data for Investor Presentation (Simplified)
-- ============================================
-- تشغيل هذا السكربت في Supabase SQL Editor
-- Run this script in Supabase SQL Editor

-- ============================================
-- 1. إنشاء المستخدمين التجريبيين
-- Create Demo Users
-- Password: Demo@123 (bcrypt hash)
-- ============================================

INSERT INTO users (id, email, password_hash, full_name, phone, governorate, city, bio, user_type, business_name, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
VALUES
  ('demo-user-001', 'ahmed.hassan@demo.xchange.eg', '$2b$10$8K1p/a0dL1LXMc0RVuQmQOqBkYfHZKGFhGKjGxPkLzxFKXyZQxXCq', 'أحمد حسن محمود', '+201001234567', 'القاهرة', 'مدينة نصر', 'تاجر إلكترونيات منذ 10 سنوات، متخصص في الهواتف الذكية', 'BUSINESS', 'حسن للإلكترونيات', true, true, 4.8, 45, NOW(), NOW()),
  ('demo-user-002', 'sara.mohamed@demo.xchange.eg', '$2b$10$8K1p/a0dL1LXMc0RVuQmQOqBkYfHZKGFhGKjGxPkLzxFKXyZQxXCq', 'سارة محمد عبدالله', '+201112345678', 'الإسكندرية', 'سموحة', 'مهتمة بالأثاث المنزلي والديكور', 'INDIVIDUAL', NULL, true, true, 4.5, 23, NOW(), NOW()),
  ('demo-user-003', 'omar.ali@demo.xchange.eg', '$2b$10$8K1p/a0dL1LXMc0RVuQmQOqBkYfHZKGFhGKjGxPkLzxFKXyZQxXCq', 'عمر علي إبراهيم', '+201223456789', 'الجيزة', '6 أكتوبر', 'خبير في السيارات المستعملة وقطع الغيار', 'BUSINESS', 'عمر موتورز', true, true, 4.9, 67, NOW(), NOW()),
  ('demo-user-004', 'fatma.ahmed@demo.xchange.eg', '$2b$10$8K1p/a0dL1LXMc0RVuQmQOqBkYfHZKGFhGKjGxPkLzxFKXyZQxXCq', 'فاطمة أحمد السيد', '+201098765432', 'الدقهلية', 'المنصورة', 'أعمل في مجال الأجهزة المنزلية والكهربائية', 'INDIVIDUAL', NULL, true, true, 4.6, 31, NOW(), NOW()),
  ('demo-user-005', 'mohamed.ibrahim@demo.xchange.eg', '$2b$10$8K1p/a0dL1LXMc0RVuQmQOqBkYfHZKGFhGKjGxPkLzxFKXyZQxXCq', 'محمد إبراهيم خليل', '+201156789012', 'القاهرة', 'المعادي', 'جامع ومتداول للساعات الفاخرة والمجوهرات', 'BUSINESS', 'خليل للساعات الفاخرة', true, true, 4.95, 89, NOW(), NOW()),
  ('demo-user-006', 'noura.hassan@demo.xchange.eg', '$2b$10$8K1p/a0dL1LXMc0RVuQmQOqBkYfHZKGFhGKjGxPkLzxFKXyZQxXCq', 'نورا حسن عبدالرحمن', '+201267890123', 'الإسكندرية', 'المنتزه', 'مصممة أزياء ومهتمة بالموضة', 'INDIVIDUAL', NULL, true, true, 4.7, 28, NOW(), NOW()),
  ('demo-user-007', 'youssef.kamal@demo.xchange.eg', '$2b$10$8K1p/a0dL1LXMc0RVuQmQOqBkYfHZKGFhGKjGxPkLzxFKXyZQxXCq', 'يوسف كمال محمود', '+201012345000', 'الجيزة', 'الشيخ زايد', 'تاجر توالف ومواد قابلة لإعادة التدوير', 'BUSINESS', 'يوسف لتجارة الخردة', true, true, 4.6, 156, NOW(), NOW()),
  ('demo-user-008', 'mona.salem@demo.xchange.eg', '$2b$10$8K1p/a0dL1LXMc0RVuQmQOqBkYfHZKGFhGKjGxPkLzxFKXyZQxXCq', 'منى سالم أحمد', '+201178901234', 'أسيوط', 'أسيوط', 'معلمة ومهتمة بالكتب والأدوات التعليمية', 'INDIVIDUAL', NULL, true, true, 4.4, 15, NOW(), NOW()),
  ('demo-user-009', 'khaled.mansour@demo.xchange.eg', '$2b$10$8K1p/a0dL1LXMc0RVuQmQOqBkYfHZKGFhGKjGxPkLzxFKXyZQxXCq', 'خالد منصور عبدالله', '+201289012345', 'بورسعيد', 'بورسعيد', 'وسيط معتمد في المقايضات الكبيرة', 'BUSINESS', 'منصور للوساطة', true, true, 4.85, 82, NOW(), NOW()),
  ('demo-user-010', 'layla.omar@demo.xchange.eg', '$2b$10$8K1p/a0dL1LXMc0RVuQmQOqBkYfHZKGFhGKjGxPkLzxFKXyZQxXCq', 'ليلى عمر حسين', '+201190123456', 'الأقصر', 'الأقصر', 'صاحبة محل للتحف والأنتيكات', 'BUSINESS', 'بازار ليلى', true, true, 4.75, 42, NOW(), NOW())
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. إنشاء الفئات
-- Create Categories
-- ============================================

DELETE FROM categories WHERE id LIKE 'cat-%';

INSERT INTO categories (id, name_en, name_ar, slug, icon, is_active, created_at, updated_at)
VALUES
  ('cat-electronics', 'Electronics', 'الإلكترونيات', 'electronics', '📱', true, NOW(), NOW()),
  ('cat-appliances', 'Home Appliances', 'الأجهزة المنزلية', 'home-appliances', '🏠', true, NOW(), NOW()),
  ('cat-furniture', 'Furniture', 'الأثاث', 'furniture', '🛋️', true, NOW(), NOW()),
  ('cat-vehicles', 'Vehicles', 'المركبات', 'vehicles', '🚗', true, NOW(), NOW()),
  ('cat-luxury', 'Luxury', 'الفاخرة', 'luxury', '💎', true, NOW(), NOW()),
  ('cat-scrap', 'Scrap', 'التوالف', 'scrap', '♻️', true, NOW(), NOW())
ON CONFLICT (slug) DO UPDATE SET id = EXCLUDED.id, name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar, icon = EXCLUDED.icon;

-- ============================================
-- 3. إنشاء المنتجات
-- Create Items
-- ============================================

INSERT INTO items (id, seller_id, title, description, condition, estimated_value, images, governorate, city, category_id, status, views, is_featured, promotion_tier, listing_type, created_at, updated_at)
VALUES
  -- Electronics
  ('item-001', 'demo-user-001', 'iPhone 15 Pro Max 256GB', 'آيفون 15 برو ماكس جديد لم يفتح، ضمان سنة من أبل مصر. اللون تيتانيوم طبيعي. الكرتونة مغلفة.', 'NEW', 65000, ARRAY['https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800'], 'القاهرة', 'مدينة نصر', 'cat-electronics', 'ACTIVE', 523, true, 'GOLD', 'DIRECT_SALE', NOW(), NOW()),
  ('item-002', 'demo-user-001', 'Samsung Galaxy S24 Ultra 512GB', 'سامسونج S24 ألترا مستعمل أسبوعين فقط، كل الملحقات الأصلية موجودة. اللون أسود تيتانيوم.', 'LIKE_NEW', 48000, ARRAY['https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800'], 'الإسكندرية', 'سموحة', 'cat-electronics', 'ACTIVE', 312, false, 'FEATURED', 'DIRECT_SALE', NOW(), NOW()),
  ('item-003', 'demo-user-003', 'MacBook Pro M3 Pro 14 بوصة', 'ماك بوك برو M3 برو، رام 18 جيجا، 512 SSD. مثالي للمصممين والمبرمجين. ضمان أبل سنتين.', 'NEW', 95000, ARRAY['https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800'], 'الجيزة', '6 أكتوبر', 'cat-electronics', 'ACTIVE', 445, true, 'PLATINUM', 'DIRECT_SALE', NOW(), NOW()),
  ('item-004', 'demo-user-001', 'Sony PlayStation 5 Slim', 'بلايستيشن 5 سليم الإصدار الجديد مع 2 يد تحكم. استعمال شهر واحد فقط.', 'LIKE_NEW', 28000, ARRAY['https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=800'], 'القاهرة', 'مدينة نصر', 'cat-electronics', 'ACTIVE', 289, false, 'BASIC', 'DIRECT_SALE', NOW(), NOW()),

  -- Home Appliances
  ('item-005', 'demo-user-004', 'ثلاجة توشيبا 18 قدم نوفروست', 'ثلاجة توشيبا انفرتر موفرة للطاقة، لون سيلفر، ضمان 5 سنوات من الوكيل. جديدة بالكرتونة.', 'NEW', 22000, ARRAY['https://images.unsplash.com/photo-1584568694244-14fbdf83bd30?w=800'], 'الدقهلية', 'المنصورة', 'cat-appliances', 'ACTIVE', 178, false, 'FEATURED', 'DIRECT_SALE', NOW(), NOW()),
  ('item-006', 'demo-user-004', 'غسالة LG 9 كيلو فول أوتوماتيك', 'غسالة LG موتور انفرتر، برامج متعددة، استعمال سنة واحدة. حالة ممتازة.', 'GOOD', 12000, ARRAY['https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800'], 'الدقهلية', 'المنصورة', 'cat-appliances', 'ACTIVE', 145, false, 'BASIC', 'DIRECT_SALE', NOW(), NOW()),
  ('item-007', 'demo-user-002', 'تكييف شارب 1.5 حصان انفرتر', 'تكييف شارب انفرتر موفر للكهرباء، بارد/ساخن. ضمان 5 سنوات.', 'NEW', 28000, ARRAY['https://images.unsplash.com/photo-1585771724684-38269d6639fd?w=800'], 'الإسكندرية', 'سموحة', 'cat-appliances', 'ACTIVE', 234, true, 'GOLD', 'DIRECT_SALE', NOW(), NOW()),

  -- Furniture
  ('item-008', 'demo-user-002', 'طقم صالون كلاسيك 9 قطع', 'طقم صالون خشب زان مصري، تنجيد شامواه فاخر، صناعة دمياط. 3 كنب + 4 فوتيهات + 2 ركنة.', 'GOOD', 35000, ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800'], 'الجيزة', 'الشيخ زايد', 'cat-furniture', 'ACTIVE', 267, false, 'FEATURED', 'DIRECT_SALE', NOW(), NOW()),
  ('item-009', 'demo-user-006', 'غرفة نوم مودرن كاملة', 'غرفة نوم مودرن: سرير 180 سم، دولاب 6 ضلفة، 2 كمودينو، تسريحة مع مرآة. خشب MDF عالي الجودة.', 'LIKE_NEW', 45000, ARRAY['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800'], 'الإسكندرية', 'المنتزه', 'cat-furniture', 'ACTIVE', 189, true, 'GOLD', 'DIRECT_SALE', NOW(), NOW()),

  -- Vehicles
  ('item-010', 'demo-user-003', 'هيونداي إلنترا AD 2020', 'إلنترا 2020 فابريكا بالكامل، 45000 كم فقط، رخصة سنة. اللون أبيض لؤلؤي. فحص شامل متاح.', 'GOOD', 580000, ARRAY['https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=800'], 'القاهرة', 'مدينة نصر', 'cat-vehicles', 'ACTIVE', 678, true, 'PLATINUM', 'DIRECT_SALE', NOW(), NOW()),
  ('item-011', 'demo-user-003', 'تويوتا كورولا 2019', 'كورولا 2019 أوتوماتيك، 60000 كم، حالة ممتازة. صيانة توكيل. فابريكا بالكامل.', 'GOOD', 450000, ARRAY['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800'], 'الجيزة', '6 أكتوبر', 'cat-vehicles', 'ACTIVE', 534, false, 'GOLD', 'DIRECT_SALE', NOW(), NOW()),

  -- Luxury
  ('luxury-001', 'demo-user-005', 'ساعة Rolex Submariner Date', 'رولكس صب مارينر أصلية 100%، موديل 2022. مع جميع الأوراق والصندوق الأصلي وشهادة الضمان.', 'LIKE_NEW', 850000, ARRAY['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800'], 'القاهرة', 'المعادي', 'cat-luxury', 'ACTIVE', 1234, true, 'PLATINUM', 'DIRECT_SALE', NOW(), NOW()),
  ('luxury-002', 'demo-user-005', 'حقيبة Louis Vuitton Neverfull MM', 'حقيبة لويس فيتون نيفرفول أصلية، مقاس متوسط، استعمال خفيف جداً.', 'LIKE_NEW', 65000, ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'], 'الجيزة', 'الشيخ زايد', 'cat-luxury', 'ACTIVE', 567, true, 'GOLD', 'DIRECT_SALE', NOW(), NOW()),
  ('luxury-003', 'demo-user-005', 'خاتم ألماس 2 قيراط', 'خاتم سوليتير ألماس 2 قيراط، ذهب أبيض 18 قيراط، نقاء VS1، لون F. شهادة GIA مرفقة.', 'NEW', 450000, ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'], 'القاهرة', 'المعادي', 'cat-luxury', 'ACTIVE', 345, true, 'PLATINUM', 'DIRECT_SALE', NOW(), NOW()),

  -- Scrap (as regular items)
  ('scrap-001', 'demo-user-007', 'خردة نحاس نقي 50 كيلو', 'نحاس أحمر نقي من كابلات كهربائية، نظيف وجاهز للصهر. نسبة نقاء 99%.', 'POOR', 14000, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], 'الجيزة', 'الشيخ زايد', 'cat-scrap', 'ACTIVE', 89, false, 'BASIC', 'DIRECT_SALE', NOW(), NOW()),
  ('scrap-002', 'demo-user-007', 'ألومنيوم نوافذ قديمة 100 كيلو', 'ألومنيوم من نوافذ مفككة، نظيف من الزجاج والبلاستيك. جاهز للتدوير.', 'POOR', 8500, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], 'الدقهلية', 'المنصورة', 'cat-scrap', 'ACTIVE', 56, false, 'BASIC', 'DIRECT_SALE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. إنشاء القوائم (Listings)
-- Create Listings
-- ============================================

INSERT INTO listings (id, item_id, user_id, listing_type, price, status, views, created_at, updated_at)
SELECT
  'listing-' || SUBSTRING(id FROM 6),
  id,
  seller_id,
  'DIRECT_SALE',
  estimated_value,
  'ACTIVE',
  views,
  created_at,
  updated_at
FROM items
WHERE id LIKE 'item-%' OR id LIKE 'luxury-%' OR id LIKE 'scrap-%'
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. إنشاء عروض فلاش (إذا كان الجدول موجود)
-- Create Flash Deals (if table exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'flash_deals') THEN
    INSERT INTO flash_deals (id, title, description, listing_id, original_price, deal_price, discount_percent, total_quantity, sold_quantity, reserved_quantity, start_time, end_time, status, created_at, updated_at)
    VALUES
      ('flash-001', 'عرض فلاش: خصم 40% على iPhone 15 Pro Max', 'عرض لفترة محدودة! وفر 26,000 جنيه على أحدث آيفون', 'listing-001', 65000, 39000, 40, 10, 3, 1, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '5 hours', 'ACTIVE', NOW(), NOW()),
      ('flash-002', 'عرض فلاش: خصم 35% على Samsung S24 Ultra', 'سامسونج الرائد بخصم مذهل - الكمية محدودة!', 'listing-002', 48000, 31200, 35, 8, 2, 0, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 'ACTIVE', NOW(), NOW()),
      ('flash-003', 'عرض فلاش: خصم 30% على MacBook Pro M3', 'ماك بوك برو بأقل سعر - لفترة محدودة جداً', 'listing-003', 95000, 66500, 30, 5, 1, 1, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '6 hours', 'ACTIVE', NOW(), NOW())
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- ============================================
-- 6. إنشاء التقييمات (إذا كان الجدول موجود)
-- Create Reviews (if table exists)
-- ============================================

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'reviews') THEN
    INSERT INTO reviews (id, reviewer_id, reviewed_id, rating, comment, is_verified_purchase, created_at, updated_at)
    VALUES
      (gen_random_uuid()::text, 'demo-user-002', 'demo-user-001', 5, 'تجربة ممتازة مع أحمد! المنتج مطابق للوصف تماماً والتسليم كان في الموعد.', true, NOW() - INTERVAL '20 days', NOW()),
      (gen_random_uuid()::text, 'demo-user-003', 'demo-user-001', 5, 'بائع محترف وأمين. الهاتف كان بحالة ممتازة كما وصفه.', true, NOW() - INTERVAL '15 days', NOW()),
      (gen_random_uuid()::text, 'demo-user-001', 'demo-user-003', 5, 'عمر شخص محترم جداً، السيارة كانت فابريكا كما قال.', true, NOW() - INTERVAL '10 days', NOW()),
      (gen_random_uuid()::text, 'demo-user-004', 'demo-user-005', 5, 'محمد خبير حقيقي في الساعات الفاخرة. سعر عادل جداً.', true, NOW() - INTERVAL '8 days', NOW())
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- ============================================
-- تم بنجاح! ✅
-- Success!
-- ============================================

SELECT
  '✅ تم إنشاء بيانات العرض التوضيحي بنجاح!' as message,
  (SELECT COUNT(*) FROM users WHERE email LIKE '%@demo.xchange.eg') as users_created,
  (SELECT COUNT(*) FROM items WHERE seller_id LIKE 'demo-user-%') as items_created,
  (SELECT COUNT(*) FROM listings WHERE id LIKE 'listing-%') as listings_created;
