-- =====================================================
-- Comprehensive Seed Data for Real Estate Marketplace
-- بيانات اختبارية شاملة لسوق العقارات
-- =====================================================

-- Get existing user IDs (we'll use a function to get them dynamically)
-- الحصول على معرفات المستخدمين الحاليين

-- =====================================================
-- PROPERTIES - العقارات
-- =====================================================

-- First, let's create properties using existing users
-- سنقوم بإنشاء عقارات باستخدام المستخدمين الحاليين

-- Property 1: شقة فاخرة في التجمع الخامس (للبيع)
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, compound_name, address,
  area_sqm, bedrooms, bathrooms, floor_number, total_floors,
  finishing_level, furnished, amenities,
  listing_type, sale_price, price_per_sqm, price_negotiable,
  installment_available, installment_years, down_payment_percent, monthly_installment,
  delivery_status, title_type, verification_level,
  open_for_barter, barter_preferences,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Luxury Apartment in New Cairo',
  'شقة فاخرة في التجمع الخامس',
  'Stunning 3-bedroom apartment with panoramic views. High-end finishes, spacious living areas, and premium amenities.',
  'شقة مذهلة 3 غرف نوم مع إطلالة بانورامية. تشطيبات فاخرة ومساحات واسعة ومرافق متميزة. الكمبوند يضم حمامات سباحة وجيم ومناطق للأطفال.',
  'APARTMENT', 'Cairo', 'New Cairo', 'Fifth Settlement', 'Mivida', 'Block 15, Building 7',
  185, 3, 2, 5, 8,
  'SUPER_LUX', 'FURNISHED', '["pool","gym","security","parking","garden","playground","clubhouse"]'::jsonb,
  'SALE', 4500000, 24324, true,
  true, 7, 15, 48750,
  'READY', 'REGISTERED', 'GOVERNMENT_VERIFIED',
  true, '{"acceptedTypes": ["VILLA", "APARTMENT", "CAR"], "minValue": 3000000, "maxCashDifference": 1500000}'::jsonb,
  'ACTIVE', true, 'PREMIUM', 1250, 45,
  '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800","https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"]'::jsonb,
  NOW() - INTERVAL '30 days', NOW(), NOW() + INTERVAL '60 days'
FROM users u WHERE u.email = 'test6@xchange.eg' LIMIT 1;

-- Property 2: فيلا في الشيخ زايد (للبيع)
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, compound_name, address,
  area_sqm, garden_area, bedrooms, bathrooms, total_floors,
  finishing_level, furnished, amenities,
  listing_type, sale_price, price_per_sqm, price_negotiable,
  installment_available, installment_years, down_payment_percent,
  delivery_status, title_type, verification_level,
  open_for_barter, barter_preferences,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Standalone Villa in Sheikh Zayed',
  'فيلا مستقلة في الشيخ زايد',
  'Beautiful standalone villa with private garden and pool. 5 bedrooms, modern design, prime location.',
  'فيلا مستقلة رائعة مع حديقة خاصة وحمام سباحة. 5 غرف نوم، تصميم عصري، موقع متميز في قلب الشيخ زايد.',
  'VILLA', 'Giza', 'Sheikh Zayed', 'Beverly Hills', 'Beverly Hills', 'Street 10, Villa 25',
  450, 200, 5, 4, 3,
  'SUPER_LUX', 'SEMI_FURNISHED', '["private_pool","garden","garage","security","smart_home","bbq_area"]'::jsonb,
  'SALE', 12000000, 26667, true,
  true, 10, 20,
  'READY', 'REGISTERED', 'FIELD_VERIFIED',
  true, '{"acceptedTypes": ["APARTMENT", "LAND"], "minValue": 8000000, "maxCashDifference": 4000000}'::jsonb,
  'ACTIVE', true, 'FEATURED', 890, 32,
  '["https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800","https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800","https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]'::jsonb,
  NOW() - INTERVAL '20 days', NOW(), NOW() + INTERVAL '70 days'
FROM users u WHERE u.email = 'test6@xchange.eg' LIMIT 1;

-- Property 3: شقة للإيجار في المعادي
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, address,
  area_sqm, bedrooms, bathrooms, floor_number, total_floors,
  finishing_level, furnished, amenities,
  listing_type, rent_price, rent_period,
  delivery_status, title_type, verification_level,
  open_for_barter,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Modern Apartment for Rent in Maadi',
  'شقة عصرية للإيجار في المعادي',
  'Fully furnished modern apartment in Maadi Sarayat. Walking distance to restaurants and shops.',
  'شقة مفروشة بالكامل وعصرية في المعادي السرايات. على بعد خطوات من المطاعم والمحلات التجارية.',
  'APARTMENT', 'Cairo', 'Maadi', 'Maadi Sarayat', 'Street 9, Building 15',
  140, 2, 1, 3, 5,
  'LUX', 'FURNISHED', '["ac","internet","parking","security"]'::jsonb,
  'RENT', 18000, 'monthly',
  'READY', 'REGISTERED', 'DOCUMENTS_VERIFIED',
  false,
  'ACTIVE', false, 'BASIC', 520, 18,
  '["https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800","https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800"]'::jsonb,
  NOW() - INTERVAL '15 days', NOW(), NOW() + INTERVAL '45 days'
FROM users u WHERE u.email = 'test7@xchange.eg' LIMIT 1;

-- Property 4: أرض للبيع في العين السخنة
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, address,
  area_sqm,
  finishing_level,
  listing_type, sale_price, price_per_sqm, price_negotiable,
  delivery_status, title_type, verification_level,
  open_for_barter, barter_preferences,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Prime Land in Ain Sokhna',
  'أرض مميزة في العين السخنة',
  'Prime beachfront land with sea view. Perfect for villa construction or investment.',
  'أرض مميزة على الشاطئ مباشرة مع إطلالة على البحر. مثالية لبناء فيلا أو للاستثمار.',
  'LAND', 'Suez', 'Ain Sokhna', 'Porto Sokhna', 'Phase 2, Plot 45',
  800,
  NULL,
  'SALE', 3200000, 4000, true,
  NULL, 'PRELIMINARY', 'DOCUMENTS_VERIFIED',
  true, '{"acceptedTypes": ["APARTMENT", "CAR"], "minValue": 2000000, "maxCashDifference": 1200000}'::jsonb,
  'ACTIVE', false, 'BASIC', 340, 12,
  '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800","https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800"]'::jsonb,
  NOW() - INTERVAL '25 days', NOW(), NOW() + INTERVAL '65 days'
FROM users u WHERE u.email = 'test1@xchange.eg' LIMIT 1;

-- Property 5: دوبلكس في مدينة نصر
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, address,
  area_sqm, roof_area, bedrooms, bathrooms, floor_number, total_floors,
  finishing_level, furnished, amenities,
  listing_type, sale_price, price_per_sqm, price_negotiable,
  installment_available,
  delivery_status, title_type, verification_level,
  open_for_barter,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Spacious Duplex in Nasr City',
  'دوبلكس واسع في مدينة نصر',
  'Large duplex apartment with private roof terrace. Great for families, near all amenities.',
  'دوبلكس كبير مع تراس خاص على السطح. مثالي للعائلات، قريب من جميع الخدمات.',
  'DUPLEX', 'Cairo', 'Nasr City', 'First Zone', 'Abbas El-Akkad Street',
  280, 50, 4, 3, 7, 8,
  'SUPER_LUX', 'UNFURNISHED', '["roof_terrace","parking","elevator","security"]'::jsonb,
  'SALE', 3800000, 13571, false,
  false,
  'READY', 'REGISTERED', 'GOVERNMENT_VERIFIED',
  false,
  'ACTIVE', false, 'BASIC', 420, 15,
  '["https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800","https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800"]'::jsonb,
  NOW() - INTERVAL '10 days', NOW(), NOW() + INTERVAL '50 days'
FROM users u WHERE u.email = 'test3@xchange.eg' LIMIT 1;

-- Property 6: شاليه في الساحل الشمالي
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, compound_name, address,
  area_sqm, garden_area, bedrooms, bathrooms,
  finishing_level, furnished, amenities,
  listing_type, sale_price, rent_price, rent_period, price_negotiable,
  delivery_status, title_type, verification_level,
  open_for_barter, barter_preferences,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Beach Chalet in North Coast',
  'شاليه على البحر في الساحل الشمالي',
  'Beautiful chalet with direct beach access. Perfect summer getaway with stunning sea views.',
  'شاليه جميل مع وصول مباشر للشاطئ. ملاذ صيفي مثالي مع إطلالات بحرية خلابة.',
  'CHALET', 'Matrouh', 'North Coast', 'Sidi Abdel Rahman', 'Hacienda Bay', 'Phase 3, Unit 120',
  120, 40, 3, 2,
  'SUPER_LUX', 'FURNISHED', '["beach_access","pool","lagoon","gym","restaurants","water_sports"]'::jsonb,
  'BOTH', 2800000, 5000, 'daily',true,
  'READY', 'REGISTERED', 'FIELD_VERIFIED',
  true, '{"acceptedTypes": ["APARTMENT", "CAR"], "minValue": 2000000, "maxCashDifference": 800000}'::jsonb,
  'ACTIVE', true, 'FEATURED', 980, 55,
  '["https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800","https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800","https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800"]'::jsonb,
  NOW() - INTERVAL '35 days', NOW(), NOW() + INTERVAL '55 days'
FROM users u WHERE u.email = 'test5@xchange.eg' LIMIT 1;

-- Property 7: مكتب إداري في وسط البلد
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, address,
  area_sqm, floor_number, total_floors,
  finishing_level, amenities,
  listing_type, rent_price, rent_period, price_negotiable,
  delivery_status, title_type, verification_level,
  open_for_barter,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Commercial Office in Downtown',
  'مكتب إداري في وسط البلد',
  'Prime commercial office space in downtown Cairo. Perfect for startups and established businesses.',
  'مساحة مكتبية تجارية متميزة في وسط القاهرة. مثالي للشركات الناشئة والمؤسسات.',
  'OFFICE', 'Cairo', 'Downtown', 'Tahrir Square', 'Talaat Harb Street, Building 50',
  150, 6, 10,
  'LUX', '["ac","elevator","parking","meeting_room","reception","24hr_security"]'::jsonb,
  'RENT', 35000, 'monthly', true,
  'READY', 'REGISTERED', 'DOCUMENTS_VERIFIED',
  false,
  'ACTIVE', false, 'BASIC', 280, 8,
  '["https://images.unsplash.com/photo-1497366216548-37526070297c?w=800","https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800"]'::jsonb,
  NOW() - INTERVAL '18 days', NOW(), NOW() + INTERVAL '42 days'
FROM users u WHERE u.email = 'test1@xchange.eg' LIMIT 1;

-- Property 8: محل تجاري في الإسكندرية
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, address,
  area_sqm,
  finishing_level, amenities,
  listing_type, sale_price, price_per_sqm, price_negotiable,
  delivery_status, title_type, verification_level,
  open_for_barter, barter_preferences,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Commercial Shop in Alexandria',
  'محل تجاري في الإسكندرية',
  'Prime location shop on main street. High foot traffic, perfect for retail business.',
  'محل تجاري في موقع متميز على الشارع الرئيسي. حركة مشاة عالية، مثالي للتجارة.',
  'SHOP', 'Alexandria', 'Smouha', 'Fawzy Moaz Street', 'Building 15, Ground Floor',
  80,
  'SEMI_FINISHED', '["display_window","bathroom","electricity_3phase"]'::jsonb,
  'SALE', 1800000, 22500, true,
  'READY', 'REGISTERED', 'FIELD_VERIFIED',
  true, '{"acceptedTypes": ["APARTMENT", "CAR"], "minValue": 1200000, "maxCashDifference": 600000}'::jsonb,
  'ACTIVE', false, 'BASIC', 195, 7,
  '["https://images.unsplash.com/photo-1604719312566-8912e9227c6a?w=800"]'::jsonb,
  NOW() - INTERVAL '22 days', NOW(), NOW() + INTERVAL '38 days'
FROM users u WHERE u.email = 'test2@xchange.eg' LIMIT 1;

-- Property 9: توين هاوس في 6 أكتوبر
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, compound_name, address,
  area_sqm, garden_area, bedrooms, bathrooms, total_floors,
  finishing_level, furnished, amenities,
  listing_type, sale_price, price_per_sqm, price_negotiable,
  installment_available, installment_years, down_payment_percent, monthly_installment,
  delivery_status, delivery_date, title_type, verification_level,
  open_for_barter,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Twin House in 6th of October',
  'توين هاوس في السادس من أكتوبر',
  'Brand new twin house in a prestigious compound. Under construction, delivery in 2025.',
  'توين هاوس جديد في كمبوند راقي. تحت الإنشاء، التسليم في 2025.',
  'TWIN_HOUSE', 'Giza', '6th of October', 'Palm Hills', 'Palm Hills October', 'Phase 4, Unit 88',
  320, 100, 4, 4, 2,
  'CORE_SHELL', 'UNFURNISHED', '["pool","gym","security","clubhouse","kids_area"]'::jsonb,
  'SALE', 5500000, 17188, true,
  true, 8, 10, 51563,
  'UNDER_CONSTRUCTION', '2025-06-30', 'PRELIMINARY', 'DOCUMENTS_VERIFIED',
  false,
  'ACTIVE', false, 'BASIC', 320, 22,
  '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800","https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800"]'::jsonb,
  NOW() - INTERVAL '40 days', NOW(), NOW() + INTERVAL '50 days'
FROM users u WHERE u.email = 'test6@xchange.eg' LIMIT 1;

-- Property 10: بنتهاوس في الزمالك
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, address,
  area_sqm, roof_area, bedrooms, bathrooms, floor_number, total_floors,
  finishing_level, furnished, amenities,
  listing_type, sale_price, price_per_sqm, price_negotiable,
  delivery_status, title_type, verification_level,
  open_for_barter, barter_preferences,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Luxurious Penthouse in Zamalek',
  'بنتهاوس فاخر في الزمالك',
  'Exclusive penthouse with Nile view. The epitome of luxury living in Cairo most prestigious area.',
  'بنتهاوس حصري مع إطلالة على النيل. قمة الرفاهية في أرقى مناطق القاهرة.',
  'PENTHOUSE', 'Cairo', 'Zamalek', 'Zamalek', 'Brazil Street',
  400, 150, 5, 4, 10, 10,
  'SUPER_LUX', 'FURNISHED', '["nile_view","private_roof","jacuzzi","smart_home","wine_cellar","gym","sauna"]'::jsonb,
  'SALE', 25000000, 62500, true,
  'READY', 'REGISTERED', 'GOVERNMENT_VERIFIED',
  true, '{"acceptedTypes": ["VILLA", "LAND"], "minValue": 15000000, "maxCashDifference": 10000000}'::jsonb,
  'ACTIVE', true, 'PREMIUM', 1580, 78,
  '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800","https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800","https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800"]'::jsonb,
  NOW() - INTERVAL '45 days', NOW(), NOW() + INTERVAL '45 days'
FROM users u WHERE u.email = 'test5@xchange.eg' LIMIT 1;

-- Property 11: ستوديو في المهندسين
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, address,
  area_sqm, bedrooms, bathrooms, floor_number, total_floors,
  finishing_level, furnished, amenities,
  listing_type, rent_price, rent_period, price_negotiable,
  delivery_status, title_type, verification_level,
  open_for_barter,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Cozy Studio in Mohandessin',
  'ستوديو مريح في المهندسين',
  'Perfect studio for singles or couples. Modern finishes, fully equipped kitchen.',
  'ستوديو مثالي للأفراد أو الأزواج. تشطيبات حديثة ومطبخ مجهز بالكامل.',
  'STUDIO', 'Giza', 'Mohandessin', 'Arab League Street', 'Building 35, Apt 12',
  55, 1, 1, 4, 7,
  'LUX', 'FURNISHED', '["ac","wifi","washing_machine","fully_equipped_kitchen"]'::jsonb,
  'RENT', 8000, 'monthly', true,
  'READY', 'PRELIMINARY', 'DOCUMENTS_VERIFIED',
  false,
  'ACTIVE', false, 'BASIC', 180, 6,
  '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800"]'::jsonb,
  NOW() - INTERVAL '8 days', NOW(), NOW() + INTERVAL '52 days'
FROM users u WHERE u.email = 'test7@xchange.eg' LIMIT 1;

-- Property 12: مخزن في المنطقة الصناعية
INSERT INTO properties (
  id, owner_id, title, title_ar, description, description_ar,
  property_type, governorate, city, district, address,
  area_sqm,
  finishing_level, amenities,
  listing_type, rent_price, rent_period, price_negotiable,
  delivery_status, title_type, verification_level,
  open_for_barter,
  status, featured, promotion_tier, views_count, favorites_count,
  images, created_at, updated_at, expires_at
)
SELECT
  gen_random_uuid(),
  u.id,
  'Industrial Warehouse in 10th of Ramadan',
  'مخزن صناعي في العاشر من رمضان',
  'Large warehouse suitable for storage or light manufacturing. Easy truck access.',
  'مخزن كبير مناسب للتخزين أو التصنيع الخفيف. سهولة دخول الشاحنات.',
  'WAREHOUSE', 'Sharqia', '10th of Ramadan', 'Industrial Zone A', 'Plot 150',
  500,
  'UNFINISHED', '["loading_dock","24hr_security","electricity","water"]'::jsonb,
  'RENT', 25000, 'monthly', true,
  'READY', 'REGISTERED', 'DOCUMENTS_VERIFIED',
  false,
  'ACTIVE', false, 'BASIC', 95, 3,
  '["https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800"]'::jsonb,
  NOW() - INTERVAL '28 days', NOW(), NOW() + INTERVAL '32 days'
FROM users u WHERE u.email = 'test4@xchange.eg' LIMIT 1;

-- =====================================================
-- PROPERTY TRANSACTIONS - معاملات العقارات
-- =====================================================

-- Transaction 1: صفقة بيع مكتملة مع Escrow
INSERT INTO property_transactions (
  id, transaction_type, property_id, buyer_id, seller_id,
  agreed_price, buyer_commission, seller_commission,
  escrow_status, escrow_amount, escrow_deposited_at, escrow_released_at,
  documents_verified, government_verified,
  status, notes, created_at, updated_at, completed_at
)
SELECT
  gen_random_uuid(),
  'SALE',
  (SELECT id FROM properties WHERE title_ar = 'دوبلكس واسع في مدينة نصر' LIMIT 1),
  (SELECT id FROM users WHERE email = 'test5@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test3@xchange.eg'),
  3700000, 37000, 74000,
  'RELEASED', 370000, NOW() - INTERVAL '45 days', NOW() - INTERVAL '5 days',
  true, true,
  'COMPLETED', 'تمت الصفقة بنجاح. تم نقل الملكية رسمياً.',
  NOW() - INTERVAL '50 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days';

-- Transaction 2: صفقة بيع جارية مع Escrow
INSERT INTO property_transactions (
  id, transaction_type, property_id, buyer_id, seller_id,
  agreed_price, buyer_commission, seller_commission,
  escrow_status, escrow_amount, escrow_deposited_at,
  documents_verified, government_verified,
  status, notes, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  'SALE',
  (SELECT id FROM properties WHERE title_ar = 'شقة فاخرة في التجمع الخامس' LIMIT 1),
  (SELECT id FROM users WHERE email = 'test2@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test6@xchange.eg'),
  4400000, 44000, 88000,
  'VERIFICATION_IN_PROGRESS', 440000, NOW() - INTERVAL '10 days',
  true, false,
  'REGISTRATION_PENDING', 'في انتظار التحقق الحكومي',
  NOW() - INTERVAL '15 days', NOW();

-- Transaction 3: عقد إيجار نشط
INSERT INTO property_transactions (
  id, transaction_type, property_id, tenant_id, landlord_id, seller_id,
  agreed_price,
  security_deposit, deposit_protected,
  lease_start_date, lease_end_date,
  status, notes, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  'RENT',
  (SELECT id FROM properties WHERE title_ar = 'شقة عصرية للإيجار في المعادي' LIMIT 1),
  (SELECT id FROM users WHERE email = 'test3@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test7@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test7@xchange.eg'),
  18000,
  36000, true,
  NOW() - INTERVAL '30 days', NOW() + INTERVAL '335 days',
  'COMPLETED', 'عقد إيجار سنوي مع حماية التأمين',
  NOW() - INTERVAL '32 days', NOW();

-- Transaction 4: مقايضة عقار بسيارة
INSERT INTO property_transactions (
  id, transaction_type, property_id, secondary_item_id, secondary_item_type,
  buyer_id, seller_id,
  agreed_price, cash_difference,
  escrow_status, escrow_amount,
  status, notes, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  'BARTER_CAR',
  (SELECT id FROM properties WHERE title_ar = 'محل تجاري في الإسكندرية' LIMIT 1),
  NULL, 'CAR',
  (SELECT id FROM users WHERE email = 'test2@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test2@xchange.eg'),
  1800000, 600000,
  'PENDING_DEPOSIT', 600000,
  'INITIATED', 'مقايضة محل تجاري بسيارة BMW مع فرق نقدي',
  NOW() - INTERVAL '5 days', NOW();

-- Transaction 5: صفقة ملغاة
INSERT INTO property_transactions (
  id, transaction_type, property_id, buyer_id, seller_id,
  agreed_price,
  escrow_status, escrow_amount, escrow_deposited_at, escrow_released_at,
  status, notes, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  'SALE',
  (SELECT id FROM properties WHERE title_ar = 'أرض مميزة في العين السخنة' LIMIT 1),
  (SELECT id FROM users WHERE email = 'test9@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test1@xchange.eg'),
  3000000,
  'REFUNDED', 300000, NOW() - INTERVAL '25 days', NOW() - INTERVAL '10 days',
  'CANCELLED', 'تم إلغاء الصفقة بسبب عدم اكتمال التحقق من المستندات',
  NOW() - INTERVAL '30 days', NOW() - INTERVAL '10 days';

-- =====================================================
-- PROPERTY BARTER PROPOSALS - عروض مقايضة العقارات
-- =====================================================

-- Barter Proposal 1: عرض مقايضة شقة بفيلا
INSERT INTO property_barter_proposals (
  id, proposer_id, receiver_id,
  offered_property_id, requested_property_id,
  cash_difference, cash_payer,
  message, status, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'test3@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test6@xchange.eg'),
  (SELECT id FROM properties WHERE title_ar = 'دوبلكس واسع في مدينة نصر' LIMIT 1),
  (SELECT id FROM properties WHERE title_ar = 'فيلا مستقلة في الشيخ زايد' LIMIT 1),
  8200000, (SELECT id FROM users WHERE email = 'test3@xchange.eg'),
  'مهتم بمقايضة الدوبلكس بالفيلا مع دفع الفرق. الدوبلكس في حالة ممتازة وموقع متميز.',
  'PENDING', NOW() - INTERVAL '3 days', NOW();

-- Barter Proposal 2: عرض مقايضة شاليه بشقة
INSERT INTO property_barter_proposals (
  id, proposer_id, receiver_id,
  offered_property_id, requested_property_id,
  cash_difference, cash_payer,
  message, status, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'test2@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test5@xchange.eg'),
  (SELECT id FROM properties WHERE title_ar = 'محل تجاري في الإسكندرية' LIMIT 1),
  (SELECT id FROM properties WHERE title_ar = 'شاليه على البحر في الساحل الشمالي' LIMIT 1),
  1000000, (SELECT id FROM users WHERE email = 'test2@xchange.eg'),
  'أرغب في مقايضة المحل بالشاليه للاستمتاع بالصيف مع العائلة',
  'REJECTED', NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days';

-- =====================================================
-- FIELD INSPECTIONS - الفحوصات الميدانية
-- =====================================================

-- Field Inspection 1: فحص مكتمل
INSERT INTO field_inspections (
  id, property_id, inspector_id, requested_by_id,
  inspection_type, scheduled_date,
  status, overall_rating, recommendation,
  structural_condition, electrical_condition, plumbing_condition,
  finishing_quality, amenities_working,
  notes, report_url, photos,
  created_at, updated_at, completed_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM properties WHERE title_ar = 'شقة فاخرة في التجمع الخامس' LIMIT 1),
  (SELECT id FROM users WHERE email = 'test10@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test2@xchange.eg'),
  'PRE_PURCHASE', NOW() - INTERVAL '20 days',
  'COMPLETED', 92, 'HIGHLY_RECOMMENDED',
  95, 90, 88, 95, 92,
  'العقار في حالة ممتازة. جميع المرافق تعمل بشكل جيد. موصى به للشراء.',
  '/reports/inspection-001.pdf',
  '["https://example.com/inspection1.jpg","https://example.com/inspection2.jpg"]'::jsonb,
  NOW() - INTERVAL '22 days', NOW() - INTERVAL '18 days', NOW() - INTERVAL '18 days';

-- Field Inspection 2: فحص مجدول
INSERT INTO field_inspections (
  id, property_id, inspector_id, requested_by_id,
  inspection_type, scheduled_date,
  status,
  notes,
  created_at, updated_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM properties WHERE title_ar = 'فيلا مستقلة في الشيخ زايد' LIMIT 1),
  NULL,
  (SELECT id FROM users WHERE email = 'test3@xchange.eg'),
  'COMPREHENSIVE', NOW() + INTERVAL '5 days',
  'SCHEDULED',
  'فحص شامل مطلوب قبل إتمام صفقة المقايضة',
  NOW() - INTERVAL '2 days', NOW();

-- =====================================================
-- RENTAL CONTRACTS - عقود الإيجار
-- =====================================================

-- Rental Contract 1: عقد إيجار نشط
INSERT INTO rental_contracts (
  id, property_id, landlord_id, tenant_id,
  start_date, end_date, monthly_rent,
  security_deposit, deposit_protected, deposit_escrow_id,
  contract_type, payment_day, grace_period_days,
  utilities_included, maintenance_responsibility,
  status, notes, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM properties WHERE title_ar = 'شقة عصرية للإيجار في المعادي' LIMIT 1),
  (SELECT id FROM users WHERE email = 'test7@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test3@xchange.eg'),
  NOW() - INTERVAL '30 days', NOW() + INTERVAL '335 days', 18000,
  36000, true, gen_random_uuid()::text,
  'NEW_RENT', 1, 5,
  '["water","gas"]'::jsonb, 'LANDLORD',
  'ACTIVE', 'عقد إيجار سنوي مع إمكانية التجديد',
  NOW() - INTERVAL '32 days', NOW();

-- Rental Contract 2: عقد إيجار منتهي
INSERT INTO rental_contracts (
  id, property_id, landlord_id, tenant_id,
  start_date, end_date, monthly_rent,
  security_deposit, deposit_protected,
  contract_type, payment_day,
  status, notes, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  (SELECT id FROM properties WHERE title_ar = 'ستوديو مريح في المهندسين' LIMIT 1),
  (SELECT id FROM users WHERE email = 'test7@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test9@xchange.eg'),
  NOW() - INTERVAL '400 days', NOW() - INTERVAL '35 days', 7500,
  15000, false,
  'NEW_RENT', 5,
  'COMPLETED', 'عقد منتهي بتاريخه بدون مشاكل',
  NOW() - INTERVAL '402 days', NOW() - INTERVAL '35 days';

-- =====================================================
-- PROPERTY FAVORITES - المفضلة
-- =====================================================

-- Add some favorites
INSERT INTO property_favorites (id, user_id, property_id, created_at)
SELECT gen_random_uuid(), u.id, p.id, NOW() - INTERVAL '5 days'
FROM users u, properties p
WHERE u.email = 'test1@xchange.eg' AND p.title_ar = 'شقة فاخرة في التجمع الخامس'
ON CONFLICT DO NOTHING;

INSERT INTO property_favorites (id, user_id, property_id, created_at)
SELECT gen_random_uuid(), u.id, p.id, NOW() - INTERVAL '3 days'
FROM users u, properties p
WHERE u.email = 'test2@xchange.eg' AND p.title_ar = 'فيلا مستقلة في الشيخ زايد'
ON CONFLICT DO NOTHING;

INSERT INTO property_favorites (id, user_id, property_id, created_at)
SELECT gen_random_uuid(), u.id, p.id, NOW() - INTERVAL '7 days'
FROM users u, properties p
WHERE u.email = 'test3@xchange.eg' AND p.title_ar = 'بنتهاوس فاخر في الزمالك'
ON CONFLICT DO NOTHING;

INSERT INTO property_favorites (id, user_id, property_id, created_at)
SELECT gen_random_uuid(), u.id, p.id, NOW() - INTERVAL '2 days'
FROM users u, properties p
WHERE u.email = 'test4@xchange.eg' AND p.title_ar = 'شاليه على البحر في الساحل الشمالي'
ON CONFLICT DO NOTHING;

INSERT INTO property_favorites (id, user_id, property_id, created_at)
SELECT gen_random_uuid(), u.id, p.id, NOW() - INTERVAL '1 day'
FROM users u, properties p
WHERE u.email = 'test5@xchange.eg' AND p.title_ar = 'توين هاوس في السادس من أكتوبر'
ON CONFLICT DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
SELECT
  'Real Estate Marketplace seeded successfully!' as message,
  (SELECT COUNT(*) FROM properties) as total_properties,
  (SELECT COUNT(*) FROM property_transactions) as total_transactions,
  (SELECT COUNT(*) FROM rental_contracts) as total_rentals,
  (SELECT COUNT(*) FROM field_inspections) as total_inspections,
  (SELECT COUNT(*) FROM property_barter_proposals) as total_barter_proposals;
