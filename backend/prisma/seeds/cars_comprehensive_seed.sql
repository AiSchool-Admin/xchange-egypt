-- =====================================================
-- Comprehensive Seed Data for Cars Marketplace
-- بيانات اختبارية شاملة لسوق السيارات
-- =====================================================

-- Test Users (مستخدمين اختبار)
-- Note: These users have password: Test123!@#
INSERT INTO "User" (id, email, password, name, phone, role, is_verified, created_at)
VALUES
  ('user_test_1', 'ahmed@test.com', '$2b$10$K8GpZn5mXxKqzp5YJzKvYuKXqHqjKqP5YJzKvYuKXqHqjKqP5YJz', 'أحمد محمد', '01012345678', 'USER', true, NOW() - INTERVAL '30 days'),
  ('user_test_2', 'mohamed@test.com', '$2b$10$K8GpZn5mXxKqzp5YJzKvYuKXqHqjKqP5YJzKvYuKXqHqjKqP5YJz', 'محمد علي', '01123456789', 'USER', true, NOW() - INTERVAL '25 days'),
  ('user_test_3', 'khaled@test.com', '$2b$10$K8GpZn5mXxKqzp5YJzKvYuKXqHqjKqP5YJzKvYuKXqHqjKqP5YJz', 'خالد محمود', '01234567890', 'USER', true, NOW() - INTERVAL '20 days'),
  ('user_test_4', 'dealer_nile@test.com', '$2b$10$K8GpZn5mXxKqzp5YJzKvYuKXqHqjKqP5YJzKvYuKXqHqjKqP5YJz', 'معرض النيل للسيارات', '01098765432', 'USER', true, NOW() - INTERVAL '60 days'),
  ('user_test_5', 'showroom_star@test.com', '$2b$10$K8GpZn5mXxKqzp5YJzKvYuKXqHqjKqP5YJzKvYuKXqHqjKqP5YJz', 'شركة النجم للسيارات', '01111222333', 'USER', true, NOW() - INTERVAL '90 days'),
  ('user_admin', 'admin@xchange.eg', '$2b$10$K8GpZn5mXxKqzp5YJzKvYuKXqHqjKqP5YJzKvYuKXqHqjKqP5YJz', 'مدير النظام', '01000000000', 'ADMIN', true, NOW() - INTERVAL '120 days')
ON CONFLICT (id) DO NOTHING;

-- Additional Car Price References (أسعار مرجعية إضافية)
INSERT INTO "CarPrice" (make, model, year, min_price, max_price, avg_price, currency, last_updated)
VALUES
  -- Toyota
  ('Toyota', 'Corolla', 2024, 850000, 1050000, 950000, 'EGP', NOW()),
  ('Toyota', 'Corolla', 2023, 780000, 950000, 865000, 'EGP', NOW()),
  ('Toyota', 'Corolla', 2022, 700000, 850000, 775000, 'EGP', NOW()),
  ('Toyota', 'Camry', 2024, 1200000, 1500000, 1350000, 'EGP', NOW()),
  ('Toyota', 'Camry', 2023, 1050000, 1350000, 1200000, 'EGP', NOW()),
  ('Toyota', 'RAV4', 2024, 1400000, 1800000, 1600000, 'EGP', NOW()),
  ('Toyota', 'RAV4', 2023, 1250000, 1600000, 1425000, 'EGP', NOW()),
  ('Toyota', 'Fortuner', 2024, 1800000, 2300000, 2050000, 'EGP', NOW()),

  -- Hyundai
  ('Hyundai', 'Elantra', 2024, 750000, 950000, 850000, 'EGP', NOW()),
  ('Hyundai', 'Elantra', 2023, 680000, 850000, 765000, 'EGP', NOW()),
  ('Hyundai', 'Tucson', 2024, 1100000, 1400000, 1250000, 'EGP', NOW()),
  ('Hyundai', 'Tucson', 2023, 980000, 1250000, 1115000, 'EGP', NOW()),
  ('Hyundai', 'Accent', 2024, 520000, 680000, 600000, 'EGP', NOW()),
  ('Hyundai', 'Creta', 2024, 850000, 1050000, 950000, 'EGP', NOW()),

  -- Kia
  ('Kia', 'Cerato', 2024, 700000, 900000, 800000, 'EGP', NOW()),
  ('Kia', 'Cerato', 2023, 630000, 800000, 715000, 'EGP', NOW()),
  ('Kia', 'Sportage', 2024, 1050000, 1350000, 1200000, 'EGP', NOW()),
  ('Kia', 'Sportage', 2023, 920000, 1200000, 1060000, 'EGP', NOW()),
  ('Kia', 'Seltos', 2024, 800000, 1000000, 900000, 'EGP', NOW()),

  -- BMW
  ('BMW', '320i', 2024, 1800000, 2200000, 2000000, 'EGP', NOW()),
  ('BMW', '320i', 2023, 1600000, 1950000, 1775000, 'EGP', NOW()),
  ('BMW', 'X3', 2024, 2200000, 2800000, 2500000, 'EGP', NOW()),
  ('BMW', 'X5', 2024, 3500000, 4500000, 4000000, 'EGP', NOW()),

  -- Mercedes-Benz
  ('Mercedes-Benz', 'C200', 2024, 2000000, 2500000, 2250000, 'EGP', NOW()),
  ('Mercedes-Benz', 'C200', 2023, 1750000, 2200000, 1975000, 'EGP', NOW()),
  ('Mercedes-Benz', 'E200', 2024, 2800000, 3500000, 3150000, 'EGP', NOW()),
  ('Mercedes-Benz', 'GLC', 2024, 2500000, 3200000, 2850000, 'EGP', NOW()),

  -- Nissan
  ('Nissan', 'Sentra', 2024, 680000, 880000, 780000, 'EGP', NOW()),
  ('Nissan', 'Sunny', 2024, 520000, 680000, 600000, 'EGP', NOW()),
  ('Nissan', 'X-Trail', 2024, 1300000, 1700000, 1500000, 'EGP', NOW()),

  -- Honda
  ('Honda', 'Civic', 2024, 850000, 1100000, 975000, 'EGP', NOW()),
  ('Honda', 'Accord', 2024, 1200000, 1500000, 1350000, 'EGP', NOW()),
  ('Honda', 'CR-V', 2024, 1400000, 1800000, 1600000, 'EGP', NOW()),

  -- Chevrolet
  ('Chevrolet', 'Optra', 2024, 450000, 580000, 515000, 'EGP', NOW()),
  ('Chevrolet', 'Captiva', 2024, 900000, 1150000, 1025000, 'EGP', NOW())
ON CONFLICT DO NOTHING;

-- Car Partners / Inspection Centers (مراكز الفحص)
INSERT INTO "CarPartner" (id, name, name_en, description, address, city, governorate, phone, email, website, working_hours, services, inspection_price, certification_level, rating, reviews_count, is_active)
VALUES
  ('partner_1', 'مركز الفحص الشامل', 'Complete Inspection Center', 'مركز فحص معتمد يقدم خدمات فحص شاملة للسيارات بأحدث الأجهزة والتقنيات الألمانية', '15 شارع التحرير، الدقي', 'الجيزة', 'الجيزة', '01012345678', 'info@complete-inspection.com', 'https://complete-inspection.com', 'يومياً من 9 صباحاً حتى 9 مساءً', '["فحص شامل","فحص حوادث","فحص كمبيوتر","فحص فرامل","فحص تعليق","تقرير مفصل"]', 500, 'PLATINUM', 4.8, 256, true),
  ('partner_2', 'أوتو تشيك', 'Auto Check', 'خبرة أكثر من 15 عاماً في فحص السيارات. معتمدون من كبرى شركات التأمين والتمويل', '25 طريق الإسكندرية الصحراوي', 'الإسكندرية', 'الإسكندرية', '01123456789', 'contact@autocheck.eg', 'https://autocheck.eg', 'السبت - الخميس من 8 صباحاً حتى 8 مساءً', '["فحص شامل","فحص حوادث","فحص كمبيوتر","فحص طلاء","تقرير مفصل"]', 450, 'GOLD', 4.6, 189, true),
  ('partner_3', 'كار سكان مصر', 'Car Scan Egypt', 'أحدث تقنيات الفحص بالأشعة والليزر. تقارير رقمية فورية مع صور وفيديو', '100 شارع مصطفى النحاس، مدينة نصر', 'القاهرة', 'القاهرة', '01234567890', 'scan@carscan.eg', NULL, 'يومياً من 10 صباحاً حتى 10 مساءً', '["فحص بالأشعة","فحص ليزر","فحص كمبيوتر","فحص شامل","تقرير رقمي","صور وفيديو"]', 650, 'PLATINUM', 4.9, 312, true),
  ('partner_4', 'مركز فحص الدلتا', 'Delta Inspection Center', 'المركز الرائد في منطقة الدلتا. أسعار تنافسية وجودة عالية', '5 شارع سعيد، طنطا', 'طنطا', 'الغربية', '01098765432', 'delta@carinspection.com', NULL, 'السبت - الخميس من 9 صباحاً حتى 6 مساءً', '["فحص شامل","فحص حوادث","فحص كمبيوتر","تقرير مفصل"]', 350, 'SILVER', 4.4, 98, true),
  ('partner_5', 'بريميوم كار تشيك', 'Premium Car Check', 'خدمة VIP للفحص مع خدمة توصيل السيارة. متخصصون في السيارات الفاخرة والرياضية', '50 شارع التسعين، التجمع الخامس', 'القاهرة الجديدة', 'القاهرة', '01111222333', 'premium@carcheck.eg', 'https://premiumcarcheck.eg', 'يومياً من 8 صباحاً حتى 11 مساءً', '["فحص VIP","توصيل السيارة","فحص فاخر","فحص كمبيوتر متقدم","تقرير تفصيلي","ضمان التقرير"]', 850, 'PLATINUM', 4.9, 145, true),
  ('partner_6', 'تراست كار', 'Trust Car', 'مركز فحص موثوق بخبرة كبيرة. نقدم خدماتنا للأفراد والشركات', '30 طريق الحرية، المنصورة', 'المنصورة', 'الدقهلية', '01000111222', 'trust@trustcar.eg', NULL, 'السبت - الخميس من 9 صباحاً حتى 7 مساءً', '["فحص شامل","فحص تجاري","فحص أساطيل","فحص كمبيوتر","تقرير مفصل"]', 400, 'GOLD', 4.5, 167, true)
ON CONFLICT (id) DO NOTHING;

-- Car Listings (إعلانات السيارات)
INSERT INTO "CarListing" (id, user_id, make, model, year, mileage, fuel_type, transmission, body_type, exterior_color, interior_color, engine_size, horsepower, condition, price, currency, negotiable, description, features, images, city, governorate, address, status, seller_type, accepts_barter, barter_preferences, verification_level, views_count, inquiries_count, favorites_count, created_at, expires_at)
VALUES
  -- Owner listings
  ('car_1', 'user_test_1', 'Toyota', 'Camry', 2022, 35000, 'PETROL', 'AUTOMATIC', 'SEDAN', 'أبيض لؤلؤي', 'بيج', '2.5L', 200, 'EXCELLENT', 850000, 'EGP', true, 'تويوتا كامري 2022 فل كامل - صيانة وكالة - مالك أول - حالة ممتازة جداً. السيارة بدون أي حوادث وجميع الصيانات منتظمة.', '["فتحة سقف","شاشة لمس","كاميرا خلفية","حساسات أمامية وخلفية","تحكم مثبت السرعة","مقاعد جلد","تبريد مقاعد"]', '["/cars/camry-white-1.jpg","/cars/camry-white-2.jpg"]', 'مدينة نصر', 'القاهرة', 'شارع عباس العقاد', 'ACTIVE', 'OWNER', true, '{"types":["CAR_TO_CAR"],"preferred_makes":["Honda","Hyundai","Kia"],"min_year":2020,"accepts_cash_difference":true}', 'VERIFIED', 245, 12, 8, NOW() - INTERVAL '15 days', NOW() + INTERVAL '15 days'),

  ('car_2', 'user_test_2', 'BMW', '320i', 2021, 45000, 'PETROL', 'AUTOMATIC', 'SEDAN', 'أسود معدني', 'أسود', '2.0L Turbo', 255, 'EXCELLENT', 1200000, 'EGP', true, 'BMW 320i موديل 2021 - سبورت لاين - أعلى فئة. السيارة بحالة الوكالة وجميع الكماليات.', '["M Sport Package","Navigation","Leather Seats","Sunroof","Park Distance Control","LED Headlights","Ambient Lighting"]', '["/cars/bmw-320-black.jpg"]', 'سموحة', 'الإسكندرية', 'شارع أبو قير', 'ACTIVE', 'OWNER', true, '{"types":["CAR_TO_CAR","CAR_TO_PROPERTY"],"preferred_makes":["Mercedes-Benz","Audi"],"min_year":2019,"accepts_cash_difference":true}', 'INSPECTED', 520, 35, 22, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days'),

  ('car_3', 'user_test_3', 'Hyundai', 'Tucson', 2023, 15000, 'PETROL', 'AUTOMATIC', 'SUV', 'رمادي', 'رمادي', '1.6L Turbo', 180, 'LIKE_NEW', 950000, 'EGP', false, 'هيونداي توسان 2023 - الشكل الجديد - كالزيرو. ضمان الوكيل ساري وجميع الصيانات مدفوعة.', '["شاشة 10.25 بوصة","Apple CarPlay","Android Auto","كاميرا 360","تحكم مثبت تكيفي","فرامل طوارئ تلقائية"]', '["/cars/tucson-gray.jpg"]', 'الدقي', 'الجيزة', 'شارع مصدق', 'ACTIVE', 'OWNER', true, '{"types":["CAR_TO_CAR"],"preferred_makes":["Toyota","Nissan","Kia"],"min_year":2021,"accepts_cash_difference":true}', 'CERTIFIED', 180, 8, 5, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days'),

  -- Dealer listings
  ('car_4', 'user_test_4', 'Mercedes-Benz', 'C200', 2020, 60000, 'PETROL', 'AUTOMATIC', 'SEDAN', 'فضي', 'أسود', '2.0L Turbo', 194, 'GOOD', 1400000, 'EGP', true, 'مرسيدس C200 موديل 2020 - AMG Line - صيانة كاملة. متوفر ضمان من المعرض لمدة سنة.', '["AMG Package","Panoramic Roof","360 Camera","Burmester Sound","Memory Seats","Wireless Charging"]', '["/cars/mercedes-c-silver.jpg"]', 'المهندسين', 'الجيزة', 'شارع السودان', 'ACTIVE', 'DEALER', true, '{"types":["CAR_TO_CAR","CAR_TO_PROPERTY"],"preferred_makes":["BMW","Audi","Lexus"],"min_year":2018,"accepts_cash_difference":true}', 'VERIFIED', 380, 25, 15, NOW() - INTERVAL '20 days', NOW() + INTERVAL '10 days'),

  ('car_5', 'user_test_4', 'Kia', 'Sportage', 2022, 28000, 'PETROL', 'AUTOMATIC', 'SUV', 'أحمر', 'أسود', '1.6L Turbo', 177, 'EXCELLENT', 780000, 'EGP', true, 'كيا سبورتاج 2022 - فل أوبشن - كاش أو تقسيط. متوفر تمويل بنكي بأقساط مريحة.', '["شاشة لمس كبيرة","كاميرا خلفية","حساسات ركن","تحكم مثبت سرعة","مقاعد جلد","إضاءة LED"]', '["/cars/sportage-red.jpg"]', 'المهندسين', 'الجيزة', 'شارع السودان', 'ACTIVE', 'DEALER', false, '{}', 'CERTIFIED', 290, 18, 11, NOW() - INTERVAL '8 days', NOW() + INTERVAL '22 days'),

  ('car_6', 'user_test_4', 'Toyota', 'Corolla', 2023, 22000, 'PETROL', 'AUTOMATIC', 'SEDAN', 'أبيض', 'بيج', '1.6L', 132, 'EXCELLENT', 820000, 'EGP', true, 'تويوتا كورولا 2023 - أعلى فئة - ضمان الوكيل. السيارة نظيفة جداً ومالك أول.', '["Toyota Safety Sense","Lane Departure Alert","Adaptive Cruise Control","Wireless Charging","JBL Sound System"]', '["/cars/corolla-white.jpg"]', 'المهندسين', 'الجيزة', 'شارع السودان', 'ACTIVE', 'DEALER', true, '{"types":["CAR_TO_CAR"],"preferred_makes":["Hyundai","Kia","Honda"],"min_year":2021,"accepts_cash_difference":true}', 'VERIFIED', 410, 28, 19, NOW() - INTERVAL '12 days', NOW() + INTERVAL '18 days'),

  -- Showroom listings
  ('car_7', 'user_test_5', 'Honda', 'Civic', 2024, 5000, 'PETROL', 'AUTOMATIC', 'SEDAN', 'أزرق معدني', 'أسود', '1.5L Turbo', 180, 'LIKE_NEW', 980000, 'EGP', false, 'هوندا سيفيك 2024 - زيرو كيلو متر - استلام من الشركة مباشرة. ضمان 5 سنوات.', '["Honda Sensing Suite","Digital Instrument Cluster","Wireless Apple CarPlay","Bose Sound System","Adaptive Dampers"]', '["/cars/civic-blue.jpg"]', 'التجمع الخامس', 'القاهرة', 'شارع التسعين الجنوبي', 'ACTIVE', 'SHOWROOM', false, '{}', 'CERTIFIED', 650, 45, 32, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days'),

  ('car_8', 'user_test_5', 'Nissan', 'Sentra', 2024, 0, 'PETROL', 'CVT', 'SEDAN', 'أسود', 'بيج', '1.8L', 145, 'NEW', 720000, 'EGP', true, 'نيسان سنترا 2024 - موديل جديد - زيرو. أفضل سعر في السوق مع ضمان 3 سنوات.', '["Nissan Safety Shield","ProPILOT Assist","Bose Audio","Zero Gravity Seats","Intelligent Around View Monitor"]', '["/cars/sentra-black.jpg"]', 'التجمع الخامس', 'القاهرة', 'شارع التسعين الجنوبي', 'ACTIVE', 'SHOWROOM', true, '{"types":["CAR_TO_CAR"],"preferred_makes":["Toyota","Hyundai","Kia","Honda"],"min_year":2022,"accepts_cash_difference":true}', 'CERTIFIED', 320, 22, 14, NOW() - INTERVAL '7 days', NOW() + INTERVAL '23 days'),

  ('car_9', 'user_test_5', 'Hyundai', 'Elantra', 2024, 8000, 'PETROL', 'AUTOMATIC', 'SEDAN', 'أبيض', 'أسود', '1.6L', 147, 'LIKE_NEW', 780000, 'EGP', true, 'هيونداي النترا 2024 - الشكل الجديد كلياً - فل كامل. تصميم رياضي مميز.', '["Digital Key","Blind Spot Collision Avoidance","Lane Following Assist","Highway Driving Assist","Bose Audio"]', '["/cars/elantra-white.jpg"]', 'التجمع الخامس', 'القاهرة', 'شارع التسعين الجنوبي', 'ACTIVE', 'SHOWROOM', false, '{}', 'CERTIFIED', 480, 35, 25, NOW() - INTERVAL '6 days', NOW() + INTERVAL '24 days'),

  -- More owner listings
  ('car_10', 'user_test_1', 'Chevrolet', 'Optra', 2021, 55000, 'PETROL', 'AUTOMATIC', 'SEDAN', 'فضي', 'رمادي', '1.5L', 112, 'GOOD', 420000, 'EGP', true, 'شيفروليه أوبترا 2021 - حالة ممتازة - صيانة دورية. مناسبة للاستخدام اليومي.', '["تكييف","شاشة","كاميرا خلفية","حساسات","مثبت سرعة"]', '["/cars/optra-silver.jpg"]', 'شبرا', 'القاهرة', 'شارع شبرا الرئيسي', 'ACTIVE', 'OWNER', true, '{"types":["CAR_TO_CAR"],"preferred_makes":["Hyundai","Kia","Nissan"],"min_year":2019,"accepts_cash_difference":true}', 'BASIC', 95, 6, 3, NOW() - INTERVAL '18 days', NOW() + INTERVAL '12 days'),

  -- Sold listing
  ('car_11', 'user_test_2', 'Toyota', 'RAV4', 2021, 40000, 'HYBRID', 'AUTOMATIC', 'SUV', 'أخضر زيتي', 'بيج', '2.5L Hybrid', 219, 'EXCELLENT', 1350000, 'EGP', false, 'تويوتا راف فور هايبرد 2021 - فل كامل - حالة ممتازة. تم البيع عبر المنصة.', '["Hybrid System","Toyota Safety Sense 2.0","JBL Audio","Panoramic Roof","Power Liftgate"]', '["/cars/rav4-green.jpg"]', 'الشيخ زايد', 'الجيزة', 'الحي الثاني', 'SOLD', 'OWNER', false, '{}', 'INSPECTED', 850, 52, 38, NOW() - INTERVAL '45 days', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO NOTHING;

-- Car Transactions (معاملات السيارات)
INSERT INTO "CarTransaction" (id, listing_id, buyer_id, seller_id, transaction_type, agreed_price, platform_fee_buyer, platform_fee_seller, escrow_amount, status, payment_method, inspection_id, notes, created_at, updated_at, completed_at)
VALUES
  -- Completed transaction
  ('txn_1', 'car_11', 'user_test_3', 'user_test_2', 'DIRECT_SALE', 1320000, 19800, 19800, 1339800, 'COMPLETED', 'ESCROW', NULL, 'تمت المعاملة بنجاح - تم تسليم السيارة وتحويل المبلغ', NOW() - INTERVAL '30 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days'),

  -- In escrow transaction
  ('txn_2', 'car_2', 'user_test_1', 'user_test_2', 'DIRECT_SALE', 1180000, 17700, 17700, 1197700, 'IN_ESCROW', 'ESCROW', NULL, 'في انتظار فحص السيارة', NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', NULL),

  -- Pending payment transaction
  ('txn_3', 'car_5', 'user_test_3', 'user_test_4', 'DIRECT_SALE', 760000, 11400, 11400, 771400, 'PENDING_PAYMENT', 'ESCROW', NULL, 'في انتظار دفع المشتري', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NULL),

  -- Cancelled transaction
  ('txn_4', 'car_6', 'user_test_1', 'user_test_4', 'DIRECT_SALE', 800000, 12000, 12000, 0, 'CANCELLED', 'CASH', NULL, 'تم الإلغاء بناءً على طلب المشتري', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days', NULL),

  -- Barter transaction
  ('txn_5', 'car_3', 'user_test_1', 'user_test_3', 'BARTER', 100000, 1500, 1500, 101500, 'PENDING_INSPECTION', 'ESCROW', NULL, 'مقايضة + فرق 100,000 جنيه - في انتظار الفحص', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NULL)
ON CONFLICT (id) DO NOTHING;

-- Car Barter Proposals (عروض المقايضة)
INSERT INTO "CarBarterProposal" (id, listing_id, proposer_id, barter_type, offered_listing_id, offered_description, estimated_value, cash_difference, cash_direction, message, status, counter_offer, created_at, updated_at, expires_at)
VALUES
  -- Pending proposal
  ('barter_1', 'car_1', 'user_test_2', 'CAR_TO_CAR', NULL, 'هوندا سيفيك 2021 - فضي - أوتوماتيك - 40,000 كم - حالة ممتازة - صيانة وكالة', 720000, 130000, 'PROPOSER_PAYS', 'مهتم بالمقايضة، السيارة بحالة ممتازة وصيانة وكالة كاملة', 'PENDING', NULL, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW() + INTERVAL '3 days'),

  -- Counter offered proposal
  ('barter_2', 'car_2', 'user_test_3', 'CAR_TO_CAR', NULL, 'مرسيدس C180 2020 - أسود - 55,000 كم - فل كامل', 1050000, 100000, 'PROPOSER_PAYS', 'سيارتي فل أوبشن وحالتها ممتازة', 'COUNTER_OFFERED', '{"cash_difference":150000,"message":"أحتاج فرق 150,000 جنيه نظراً لأن سيارتي موديل أحدث","created_at":"2024-12-11T14:00:00Z"}', NOW() - INTERVAL '6 days', NOW() - INTERVAL '2 days', NOW() + INTERVAL '1 day'),

  -- Accepted proposal (linked to txn_5)
  ('barter_3', 'car_3', 'user_test_1', 'CAR_TO_CAR', 'car_10', NULL, 420000, 530000, 'PROPOSER_PAYS', 'عرض مقايضة شيفروليه أوبترا + فرق نقدي', 'ACCEPTED', NULL, NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', NOW() + INTERVAL '2 days'),

  -- Rejected proposal
  ('barter_4', 'car_6', 'user_test_3', 'CAR_TO_CAR', NULL, 'هيونداي أكسنت 2019 - أبيض - 70,000 كم', 380000, 440000, 'PROPOSER_PAYS', 'مستعد لدفع فرق كبير', 'REJECTED', NULL, NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '3 days'),

  -- Expired proposal
  ('barter_5', 'car_4', 'user_test_1', 'CAR_TO_CAR', 'car_10', NULL, 420000, 980000, 'PROPOSER_PAYS', 'مقايضة + فرق', 'EXPIRED', NULL, NOW() - INTERVAL '15 days', NOW() - INTERVAL '15 days', NOW() - INTERVAL '8 days'),

  -- Car to property proposal
  ('barter_6', 'car_7', 'user_test_2', 'CAR_TO_PROPERTY', NULL, 'شقة 100 متر في مدينة نصر - تشطيب سوبر لوكس', 1500000, 0, 'OWNER_PAYS', 'عرض مقايضة السيارة بشقة + استلام فرق', 'PENDING', NULL, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() + INTERVAL '6 days')
ON CONFLICT (id) DO NOTHING;

-- Car Inspections (فحوصات السيارات)
INSERT INTO "CarInspection" (id, listing_id, partner_id, requested_by, inspection_date, status, report, rating, issues_found, cost, notes, created_at, updated_at)
VALUES
  -- Completed inspection for car_2
  ('insp_1', 'car_2', 'partner_1', 'user_test_2', NOW() - INTERVAL '25 days', 'COMPLETED', '{"overall_score":92,"engine":95,"transmission":90,"brakes":88,"suspension":92,"body":94,"interior":93,"electrical":91,"recommendations":["تغيير زيت المحرك","فحص تيل الفرامل الخلفية"]}', 4.8, '["خدش بسيط في الصدام الخلفي"]', 500, 'فحص شامل - السيارة بحالة ممتازة عموماً', NOW() - INTERVAL '26 days', NOW() - INTERVAL '25 days'),

  -- Pending inspection for txn_2
  ('insp_2', 'car_2', 'partner_3', 'user_test_1', NOW() + INTERVAL '2 days', 'SCHEDULED', NULL, NULL, NULL, 650, 'فحص مجدول للمعاملة txn_2', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

  -- Completed inspection for car_3
  ('insp_3', 'car_3', 'partner_5', 'user_test_3', NOW() - INTERVAL '10 days', 'COMPLETED', '{"overall_score":98,"engine":99,"transmission":98,"brakes":97,"suspension":99,"body":98,"interior":98,"electrical":97,"recommendations":[]}', 5.0, '[]', 850, 'فحص VIP - السيارة بحالة الزيرو', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days'),

  -- Cancelled inspection
  ('insp_4', 'car_6', 'partner_2', 'user_test_1', NOW() - INTERVAL '18 days', 'CANCELLED', NULL, NULL, NULL, 450, 'تم الإلغاء بسبب إلغاء المعاملة', NOW() - INTERVAL '20 days', NOW() - INTERVAL '18 days')
ON CONFLICT (id) DO NOTHING;

-- Update some statistics
UPDATE "CarListing" SET views_count = views_count + FLOOR(RANDOM() * 100)::int WHERE status = 'ACTIVE';
UPDATE "CarListing" SET inquiries_count = inquiries_count + FLOOR(RANDOM() * 20)::int WHERE status = 'ACTIVE';
UPDATE "CarListing" SET favorites_count = favorites_count + FLOOR(RANDOM() * 15)::int WHERE status = 'ACTIVE';

-- Output success message
SELECT 'Comprehensive Cars Marketplace seed data inserted successfully!' as status;
SELECT 'Users: ' || COUNT(*) FROM "User" WHERE id LIKE 'user_test_%' OR id = 'user_admin';
SELECT 'Car Prices: ' || COUNT(*) FROM "CarPrice";
SELECT 'Car Partners: ' || COUNT(*) FROM "CarPartner";
SELECT 'Car Listings: ' || COUNT(*) FROM "CarListing" WHERE id LIKE 'car_%';
SELECT 'Car Transactions: ' || COUNT(*) FROM "CarTransaction" WHERE id LIKE 'txn_%';
SELECT 'Barter Proposals: ' || COUNT(*) FROM "CarBarterProposal" WHERE id LIKE 'barter_%';
SELECT 'Car Inspections: ' || COUNT(*) FROM "CarInspection" WHERE id LIKE 'insp_%';
