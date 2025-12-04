-- ============================================
-- بيانات العرض التوضيحي للمستثمرين
-- Demo Seed Data for Investor Presentation
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
-- 2. إنشاء الفئات (مع تحديث ID إذا كانت موجودة)
-- Create Categories (update ID if exists)
-- ============================================

-- Delete existing demo categories if any
DELETE FROM categories WHERE id LIKE 'cat-%';

-- Insert categories with custom IDs
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
-- 3. إنشاء المنتجات العادية
-- Create Regular Items
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
  ('item-011', 'demo-user-003', 'تويوتا كورولا 2019', 'كورولا 2019 أوتوماتيك، 60000 كم، حالة ممتازة. صيانة توكيل. فابريكا بالكامل.', 'GOOD', 450000, ARRAY['https://images.unsplash.com/photo-1590362891991-f776e747a588?w=800'], 'الجيزة', '6 أكتوبر', 'cat-vehicles', 'ACTIVE', 534, false, 'GOLD', 'DIRECT_SALE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. إنشاء منتجات سوق الفاخرة
-- Create Luxury Items
-- ============================================

INSERT INTO items (id, seller_id, title, description, condition, estimated_value, images, governorate, city, category_id, status, views, is_featured, promotion_tier, listing_type, created_at, updated_at)
VALUES
  ('luxury-001', 'demo-user-005', 'ساعة Rolex Submariner Date', 'رولكس صب مارينر أصلية 100%، موديل 2022. مع جميع الأوراق والصندوق الأصلي وشهادة الضمان. ريفيرنس 126610LN.', 'LIKE_NEW', 850000, ARRAY['https://images.unsplash.com/photo-1587836374828-4dbafa94cf0e?w=800'], 'القاهرة', 'المعادي', 'cat-luxury', 'ACTIVE', 1234, true, 'PLATINUM', 'DIRECT_SALE', NOW(), NOW()),
  ('luxury-002', 'demo-user-005', 'حقيبة Louis Vuitton Neverfull MM', 'حقيبة لويس فيتون نيفرفول أصلية، مقاس متوسط، استعمال خفيف جداً. مع الدست باج والإيصال الأصلي من باريس.', 'LIKE_NEW', 65000, ARRAY['https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=800'], 'الجيزة', 'الشيخ زايد', 'cat-luxury', 'ACTIVE', 567, true, 'GOLD', 'DIRECT_SALE', NOW(), NOW()),
  ('luxury-003', 'demo-user-005', 'خاتم ألماس 2 قيراط', 'خاتم سوليتير ألماس 2 قيراط، ذهب أبيض 18 قيراط، نقاء VS1، لون F. شهادة GIA مرفقة.', 'NEW', 450000, ARRAY['https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=800'], 'القاهرة', 'المعادي', 'cat-luxury', 'ACTIVE', 345, true, 'PLATINUM', 'DIRECT_SALE', NOW(), NOW()),
  ('luxury-004', 'demo-user-005', 'ساعة Patek Philippe Nautilus', 'باتيك فيليب نوتيلوس 5711/1A، ستيل، مع جميع الأوراق والصندوق. نادرة جداً - موقوف إنتاجها.', 'LIKE_NEW', 2500000, ARRAY['https://images.unsplash.com/photo-1523170335258-f5ed11844a49?w=800'], 'الإسكندرية', 'سان ستيفانو', 'cat-luxury', 'ACTIVE', 2156, true, 'PLATINUM', 'DIRECT_SALE', NOW(), NOW()),
  ('luxury-005', 'demo-user-010', 'طقم مجوهرات ذهب عيار 21', 'طقم كامل: عقد + أسورة + حلق + خاتم. ذهب عيار 21، وزن إجمالي 85 جرام. صناعة يدوية راقية.', 'NEW', 320000, ARRAY['https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800'], 'الأقصر', 'الأقصر', 'cat-luxury', 'ACTIVE', 423, true, 'GOLD', 'DIRECT_SALE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 5. إنشاء منتجات سوق التوالف
-- Create Scrap Items
-- ============================================

INSERT INTO items (id, seller_id, title, description, condition, estimated_value, images, governorate, city, category_id, status, views, is_scrap, scrap_type, scrap_condition, metal_type, weight_kg, price_per_kg, scrap_pricing_type, is_repairable, repair_cost_estimate, listing_type, created_at, updated_at)
VALUES
  ('scrap-001', 'demo-user-007', 'خردة نحاس نقي 50 كيلو', 'نحاس أحمر نقي من كابلات كهربائية، نظيف وجاهز للصهر. نسبة نقاء 99%.', 'POOR', 14000, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], 'الجيزة', 'الشيخ زايد', 'cat-scrap', 'ACTIVE', 89, true, 'CABLES_WIRES', 'TOTALLY_DAMAGED', 'COPPER', 50, 280, 'PER_KG', false, NULL, 'DIRECT_SALE', NOW(), NOW()),
  ('scrap-002', 'demo-user-007', 'ثلاجة توشيبا تالفة للخردة', 'ثلاجة قديمة لا تعمل، صالحة للتفكيك واستخراج النحاس والألومنيوم. الموتور سليم.', 'POOR', 1500, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], 'القاهرة', 'شبرا', 'cat-scrap', 'ACTIVE', 45, true, 'HOME_APPLIANCES', 'NOT_WORKING', NULL, 80, NULL, 'PER_PIECE', true, 2500, 'DIRECT_SALE', NOW(), NOW()),
  ('scrap-003', 'demo-user-007', 'موتور سيارة تويوتا للخردة', 'موتور تويوتا كورولا 2010، محتاج عمرة كاملة أو للخردة. الكتلة سليمة.', 'POOR', 3500, ARRAY['https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=800'], 'الإسكندرية', 'برج العرب', 'cat-scrap', 'ACTIVE', 67, true, 'CAR_PARTS', 'NOT_WORKING', 'IRON', 150, NULL, 'PER_PIECE', true, 8000, 'DIRECT_SALE', NOW(), NOW()),
  ('scrap-004', 'demo-user-007', 'ألومنيوم نوافذ قديمة 100 كيلو', 'ألومنيوم من نوافذ مفككة، نظيف من الزجاج والبلاستيك. جاهز للتدوير.', 'POOR', 8500, ARRAY['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'], 'الدقهلية', 'المنصورة', 'cat-scrap', 'ACTIVE', 56, true, 'CONSTRUCTION', 'TOTALLY_DAMAGED', 'ALUMINUM', 100, 85, 'PER_KG', false, NULL, 'DIRECT_SALE', NOW(), NOW()),
  ('scrap-005', 'demo-user-007', 'بطاريات سيارات مستعملة 20 قطعة', 'بطاريات 12 فولت مستعملة، بعضها يعمل (5 قطع)، معظمها للرصاص. إجمالي الوزن 400 كيلو.', 'POOR', 6000, ARRAY['https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800'], 'بورسعيد', 'بورسعيد', 'cat-scrap', 'ACTIVE', 78, true, 'BATTERIES', 'PARTIALLY_WORKING', 'LEAD', 400, NULL, 'PER_LOT', false, NULL, 'DIRECT_SALE', NOW(), NOW()),
  ('scrap-006', 'demo-user-007', 'لابتوبات وكمبيوترات قديمة 15 جهاز', 'أجهزة كمبيوتر قديمة للخردة، تصلح لاستخراج المعادن الثمينة من اللوحات الإلكترونية.', 'POOR', 4500, ARRAY['https://images.unsplash.com/photo-1518770660439-4636190af475?w=800'], 'القاهرة', 'وسط البلد', 'cat-scrap', 'ACTIVE', 92, true, 'COMPUTERS', 'NOT_WORKING', NULL, 60, NULL, 'PER_LOT', false, NULL, 'DIRECT_SALE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 6. إنشاء القوائم (Listings)
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
-- 7. إنشاء عروض فلاش
-- Create Flash Deals
-- ============================================

INSERT INTO flash_deals (id, title, description, listing_id, original_price, deal_price, discount_percent, total_quantity, sold_quantity, reserved_quantity, start_time, end_time, status, created_at, updated_at)
VALUES
  ('flash-001', 'عرض فلاش: خصم 40% على iPhone 15 Pro Max', 'عرض لفترة محدودة! وفر 26,000 جنيه على أحدث آيفون', 'listing-001', 65000, 39000, 40, 10, 3, 1, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '5 hours', 'ACTIVE', NOW(), NOW()),
  ('flash-002', 'عرض فلاش: خصم 35% على Samsung S24 Ultra', 'سامسونج الرائد بخصم مذهل - الكمية محدودة!', 'listing-002', 48000, 31200, 35, 8, 2, 0, NOW() - INTERVAL '2 hours', NOW() + INTERVAL '4 hours', 'ACTIVE', NOW(), NOW()),
  ('flash-003', 'عرض فلاش: خصم 30% على MacBook Pro M3', 'ماك بوك برو بأقل سعر - لفترة محدودة جداً', 'listing-003', 95000, 66500, 30, 5, 1, 1, NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '6 hours', 'ACTIVE', NOW(), NOW()),
  ('flash-004', 'عرض فلاش: خصم 50% على PlayStation 5', 'بلايستيشن 5 بنصف السعر! عرض لا يُفوت', 'listing-004', 28000, 14000, 50, 15, 8, 2, NOW() - INTERVAL '3 hours', NOW() + INTERVAL '3 hours', 'ACTIVE', NOW(), NOW()),
  ('flash-005', 'عرض فلاش: خصم 25% على ثلاجة توشيبا', 'ثلاجة توشيبا الموفرة للطاقة بسعر مخفض', 'listing-005', 22000, 16500, 25, 6, 2, 0, NOW() - INTERVAL '1 hour', NOW() + INTERVAL '8 hours', 'ACTIVE', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 8. إنشاء نقاط التبادل الآمنة
-- Create Exchange Points
-- ============================================

INSERT INTO exchange_points (id, name, name_en, description, address, governorate, city, latitude, longitude, safety_rating, amenities, is_active, is_verified, total_meetups, created_at, updated_at)
VALUES
  ('ep-001', 'مول سيتي ستارز - البوابة الرئيسية', 'City Stars Mall - Main Gate', 'نقطة تبادل آمنة عند البوابة الرئيسية لمول سيتي ستارز، كاميرات مراقبة 24/7 وأمن مستمر', 'شارع عمر بن الخطاب، مدينة نصر', 'القاهرة', 'مدينة نصر', 30.0733, 31.3456, 5, ARRAY['مواقف سيارات', 'كاميرات مراقبة', 'أمن 24 ساعة', 'مطاعم قريبة', 'مترو قريب'], true, true, 234, NOW(), NOW()),
  ('ep-002', 'كارفور المعادي - منطقة الاستلام', 'Carrefour Maadi - Pickup Area', 'منطقة الاستلام في كارفور المعادي، مكان واسع ومضاء جيداً مع أمن', 'شارع 9، المعادي', 'القاهرة', 'المعادي', 29.9602, 31.2569, 5, ARRAY['مواقف سيارات مجانية', 'كاميرات مراقبة', 'أمن', 'كافيهات'], true, true, 189, NOW(), NOW()),
  ('ep-003', 'سان ستيفانو مول - الطابق الأرضي', 'San Stefano Mall - Ground Floor', 'نقطة تبادل في سان ستيفانو، بجوار مدخل السينما - مكان مزدحم وآمن', 'طريق الكورنيش، سان ستيفانو', 'الإسكندرية', 'سان ستيفانو', 31.2437, 29.9673, 5, ARRAY['مواقف سيارات', 'أمن', 'كافيهات', 'سينما'], true, true, 156, NOW(), NOW()),
  ('ep-004', 'داندي مول - المدخل الشمالي', 'Dandy Mall - North Entrance', 'نقطة تبادل آمنة في داندي مول 6 أكتوبر، منطقة راقية وآمنة', '6 أكتوبر، الحي المتميز', 'الجيزة', '6 أكتوبر', 29.9792, 30.9347, 4, ARRAY['مواقف سيارات', 'أمن', 'مطاعم'], true, true, 145, NOW(), NOW()),
  ('ep-005', 'محطة مترو السادات', 'Sadat Metro Station', 'عند مخرج التحرير، مكان عام ومزدحم وآمن - قلب القاهرة', 'ميدان التحرير، وسط البلد', 'القاهرة', 'وسط البلد', 30.0444, 31.2357, 4, ARRAY['مترو', 'مكان عام', 'كاميرات', 'شرطة قريبة'], true, true, 312, NOW(), NOW()),
  ('ep-006', 'مول العرب - البوابة 3', 'Mall of Arabia - Gate 3', 'أكبر مول في 6 أكتوبر، منطقة آمنة ومنظمة', 'طريق الواحات، 6 أكتوبر', 'الجيزة', '6 أكتوبر', 29.9725, 30.9428, 5, ARRAY['مواقف سيارات ضخمة', 'أمن 24 ساعة', 'مطاعم', 'سينما'], true, true, 278, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 9. إنشاء المحافظ
-- Create Wallets
-- ============================================

INSERT INTO wallets (id, user_id, balance, frozen_balance, lifetime_earned, lifetime_spent, created_at, updated_at)
SELECT
  'wallet-' || SUBSTRING(id FROM 11),
  id,
  FLOOR(RANDOM() * 5000 + 500)::numeric,
  FLOOR(RANDOM() * 200)::numeric,
  FLOOR(RANDOM() * 8000 + 1000)::numeric,
  FLOOR(RANDOM() * 2000)::numeric,
  NOW(),
  NOW()
FROM users
WHERE email LIKE '%@demo.xchange.eg'
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 10. إنشاء معاملات المحفظة
-- Create Wallet Transactions
-- ============================================

INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, created_at)
SELECT
  gen_random_uuid()::text,
  w.id,
  'REWARD_SIGNUP',
  100,
  w.balance,
  'مكافأة التسجيل في المنصة',
  NOW() - INTERVAL '30 days'
FROM wallets w
WHERE w.id LIKE 'wallet-%';

INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, created_at)
SELECT
  gen_random_uuid()::text,
  w.id,
  'REWARD_FIRST_DEAL',
  250,
  w.balance,
  'مكافأة إتمام أول صفقة',
  NOW() - INTERVAL '25 days'
FROM wallets w
WHERE w.id LIKE 'wallet-%';

INSERT INTO wallet_transactions (id, wallet_id, type, amount, balance_after, description, created_at)
SELECT
  gen_random_uuid()::text,
  w.id,
  'REWARD_REVIEW',
  50,
  w.balance,
  'مكافأة كتابة تقييم',
  NOW() - INTERVAL '10 days'
FROM wallets w
WHERE w.id LIKE 'wallet-%';

-- ============================================
-- 11. إنشاء تاجر التوالف المعتمد
-- Create Verified Scrap Dealer
-- ============================================

INSERT INTO scrap_dealer_verifications (id, user_id, dealer_type, business_name, governorate, city, address, specializations, accepted_metals, offers_pickup, pickup_radius_km, pickup_fee, min_weight_kg, status, is_verified, verified_at, rating, total_reviews, total_transactions, total_weight_bought_kg, created_at, updated_at)
VALUES
  ('dealer-001', 'demo-user-007', 'SCRAP_DEALER', 'يوسف لتجارة الخردة والمعادن', 'الجيزة', 'الشيخ زايد', 'المنطقة الصناعية، الشيخ زايد', ARRAY['METAL_SCRAP', 'CABLES_WIRES', 'HOME_APPLIANCES', 'CAR_PARTS', 'BATTERIES']::scrap_type[], ARRAY['COPPER', 'ALUMINUM', 'IRON', 'STEEL', 'BRASS', 'LEAD']::metal_type[], true, 50, 100, 10, 'APPROVED', true, NOW(), 4.7, 156, 234, 12500, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 12. إنشاء أسعار المعادن
-- Create Metal Prices
-- ============================================

INSERT INTO metal_prices (id, metal_type, price_per_kg, currency, source, date, created_at)
VALUES
  (gen_random_uuid()::text, 'COPPER', 280, 'EGP', 'سوق الخردة المصري', CURRENT_DATE, NOW()),
  (gen_random_uuid()::text, 'ALUMINUM', 85, 'EGP', 'سوق الخردة المصري', CURRENT_DATE, NOW()),
  (gen_random_uuid()::text, 'IRON', 12, 'EGP', 'سوق الخردة المصري', CURRENT_DATE, NOW()),
  (gen_random_uuid()::text, 'STEEL', 15, 'EGP', 'سوق الخردة المصري', CURRENT_DATE, NOW()),
  (gen_random_uuid()::text, 'BRASS', 190, 'EGP', 'سوق الخردة المصري', CURRENT_DATE, NOW()),
  (gen_random_uuid()::text, 'BRONZE', 210, 'EGP', 'سوق الخردة المصري', CURRENT_DATE, NOW()),
  (gen_random_uuid()::text, 'LEAD', 48, 'EGP', 'سوق الخردة المصري', CURRENT_DATE, NOW()),
  (gen_random_uuid()::text, 'STAINLESS_STEEL', 38, 'EGP', 'سوق الخردة المصري', CURRENT_DATE, NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 13. إنشاء الوسيط المعتمد
-- Create Verified Facilitator
-- ============================================

INSERT INTO facilitators (id, user_id, display_name, bio, specializations, governorates, commission_rate, is_verified, verification_date, status, rating, total_deals, successful_deals, total_value_facilitated, created_at, updated_at)
VALUES
  ('facilitator-001', 'demo-user-009', 'خالد منصور - وسيط معتمد', 'وسيط معتمد من منصة Xchange، خبرة 5 سنوات في المقايضات الكبيرة والعقارات والسيارات. ضمان نجاح الصفقة أو استرداد العمولة.', ARRAY['السيارات', 'العقارات', 'الإلكترونيات', 'الأثاث'], ARRAY['القاهرة', 'الجيزة', 'الإسكندرية', 'بورسعيد', 'الدقهلية'], 2.5, true, NOW(), 'ACTIVE', 4.85, 87, 82, 2500000, NOW(), NOW())
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- 14. إنشاء صندوق مقايضة
-- Create Barter Pool
-- ============================================

INSERT INTO barter_pools (id, name, description, category_id, min_participants, max_participants, status, total_value, participants_count, governorate, created_at, updated_at)
VALUES
  ('pool-001', 'صندوق مقايضة الإلكترونيات', 'صندوق لتبادل الأجهزة الإلكترونية والهواتف الذكية. انضم الآن وبادل جهازك القديم بآخر جديد!', 'cat-electronics', 3, 20, 'ACTIVE', 150000, 5, 'القاهرة', NOW(), NOW()),
  ('pool-002', 'صندوق مقايضة الأثاث المنزلي', 'صندوق متخصص في تبادل الأثاث المنزلي. غيّر ديكور منزلك بدون دفع فرق كبير!', 'cat-furniture', 3, 15, 'ACTIVE', 200000, 4, 'الجيزة', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 15. إنشاء التقييمات
-- Create Reviews
-- ============================================

INSERT INTO reviews (id, reviewer_id, reviewed_id, rating, comment, is_verified_purchase, created_at, updated_at)
VALUES
  (gen_random_uuid()::text, 'demo-user-002', 'demo-user-001', 5, 'تجربة ممتازة مع أحمد! المنتج مطابق للوصف تماماً والتسليم كان في الموعد. أنصح بالتعامل معه بشدة.', true, NOW() - INTERVAL '20 days', NOW()),
  (gen_random_uuid()::text, 'demo-user-003', 'demo-user-001', 5, 'بائع محترف وأمين. الهاتف كان بحالة ممتازة كما وصفه. شكراً أحمد!', true, NOW() - INTERVAL '15 days', NOW()),
  (gen_random_uuid()::text, 'demo-user-001', 'demo-user-003', 5, 'عمر شخص محترم جداً، السيارة كانت فابريكا كما قال. صفقة ناجحة 100%', true, NOW() - INTERVAL '10 days', NOW()),
  (gen_random_uuid()::text, 'demo-user-004', 'demo-user-005', 5, 'محمد خبير حقيقي في الساعات الفاخرة. الرولكس أصلية 100% مع كل الأوراق. سعر عادل جداً.', true, NOW() - INTERVAL '8 days', NOW()),
  (gen_random_uuid()::text, 'demo-user-006', 'demo-user-002', 4, 'سارة لطيفة جداً والأثاث كان بحالة جيدة. التواصل كان سهل وسريع.', true, NOW() - INTERVAL '5 days', NOW()),
  (gen_random_uuid()::text, 'demo-user-008', 'demo-user-007', 5, 'يوسف تاجر أمين ومحترف. أسعاره عادلة ويوفر خدمة التوصيل. أفضل تاجر خردة تعاملت معه!', true, NOW() - INTERVAL '3 days', NOW()),
  (gen_random_uuid()::text, 'demo-user-001', 'demo-user-009', 5, 'خالد وسيط ممتاز! ساعدني في إتمام صفقة سيارة بقيمة 500,000 جنيه بكل سلاسة. محترف ويستحق العمولة.', true, NOW() - INTERVAL '2 days', NOW()),
  (gen_random_uuid()::text, 'demo-user-005', 'demo-user-010', 5, 'بازار ليلى مكان رائع للتحف! ليلى صادقة جداً في وصف المنتجات. أنصح بزيارة محلها في الأقصر.', true, NOW() - INTERVAL '1 day', NOW())
ON CONFLICT DO NOTHING;

-- ============================================
-- 16. تحديث إحصائيات المستخدمين
-- Update User Statistics
-- ============================================

UPDATE users u
SET
  rating = COALESCE((
    SELECT AVG(rating)::numeric(3,2)
    FROM reviews
    WHERE reviewed_id = u.id
  ), u.rating),
  total_reviews = (
    SELECT COUNT(*)
    FROM reviews
    WHERE reviewed_id = u.id
  )
WHERE email LIKE '%@demo.xchange.eg';

-- ============================================
-- تم بنجاح! ✅
-- Success!
-- ============================================

SELECT
  '✅ تم إنشاء بيانات العرض التوضيحي بنجاح!' as message,
  (SELECT COUNT(*) FROM users WHERE email LIKE '%@demo.xchange.eg') as users_created,
  (SELECT COUNT(*) FROM items WHERE seller_id LIKE 'demo-user-%') as items_created,
  (SELECT COUNT(*) FROM flash_deals WHERE id LIKE 'flash-%') as flash_deals_created,
  (SELECT COUNT(*) FROM exchange_points WHERE id LIKE 'ep-%') as exchange_points_created,
  (SELECT COUNT(*) FROM wallets WHERE id LIKE 'wallet-%') as wallets_created;
