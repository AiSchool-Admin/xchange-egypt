-- =====================================================
-- UAT PART 1: 50 ITEMS ADDITIONAL - منتجات إضافية
-- =====================================================
-- Run this AFTER UAT_FULL_DATA.sql
-- =====================================================

DO $$
DECLARE
    u1 TEXT; u2 TEXT; u3 TEXT; u4 TEXT; u5 TEXT;
    u6 TEXT; u7 TEXT; u8 TEXT; u9 TEXT; u10 TEXT;
    cat_electronics TEXT; cat_mobile TEXT; cat_computers TEXT;
    cat_furniture TEXT; cat_vehicles TEXT; cat_clothes TEXT;
    cat_appliances TEXT; cat_sports TEXT; cat_books TEXT;
BEGIN
    -- =========== GET USERS ===========
    SELECT id INTO u1 FROM users WHERE email = 'test1@xchange.eg';
    SELECT id INTO u2 FROM users WHERE email = 'test2@xchange.eg';
    SELECT id INTO u3 FROM users WHERE email = 'test3@xchange.eg';
    SELECT id INTO u4 FROM users WHERE email = 'test4@xchange.eg';
    SELECT id INTO u5 FROM users WHERE email = 'test5@xchange.eg';
    SELECT id INTO u6 FROM users WHERE email = 'test6@xchange.eg';
    SELECT id INTO u7 FROM users WHERE email = 'test7@xchange.eg';
    SELECT id INTO u8 FROM users WHERE email = 'test8@xchange.eg';
    SELECT id INTO u9 FROM users WHERE email = 'test9@xchange.eg';
    SELECT id INTO u10 FROM users WHERE email = 'test10@xchange.eg';

    -- =========== GET CATEGORIES ===========
    SELECT id INTO cat_electronics FROM categories WHERE slug = 'electronics' OR name_en ILIKE '%electron%' LIMIT 1;
    SELECT id INTO cat_mobile FROM categories WHERE slug = 'mobile-phones' OR name_en ILIKE '%mobile%' LIMIT 1;
    SELECT id INTO cat_computers FROM categories WHERE slug = 'computers' OR name_en ILIKE '%computer%' LIMIT 1;
    SELECT id INTO cat_furniture FROM categories WHERE slug = 'furniture' OR name_en ILIKE '%furniture%' LIMIT 1;
    SELECT id INTO cat_vehicles FROM categories WHERE slug = 'vehicles' OR name_en ILIKE '%vehicle%' LIMIT 1;
    SELECT id INTO cat_clothes FROM categories WHERE slug = 'fashion' OR name_en ILIKE '%fashion%' LIMIT 1;
    SELECT id INTO cat_appliances FROM categories WHERE slug = 'appliances' OR name_en ILIKE '%appliance%' LIMIT 1;
    SELECT id INTO cat_sports FROM categories WHERE slug = 'sports' OR name_en ILIKE '%sport%' LIMIT 1;
    SELECT id INTO cat_books FROM categories WHERE slug = 'books' OR name_en ILIKE '%book%' LIMIT 1;

    -- Fallbacks
    IF cat_electronics IS NULL THEN SELECT id INTO cat_electronics FROM categories WHERE is_active = true LIMIT 1; END IF;
    IF cat_mobile IS NULL THEN cat_mobile := cat_electronics; END IF;
    IF cat_computers IS NULL THEN cat_computers := cat_electronics; END IF;
    IF cat_furniture IS NULL THEN cat_furniture := cat_electronics; END IF;
    IF cat_vehicles IS NULL THEN cat_vehicles := cat_electronics; END IF;
    IF cat_clothes IS NULL THEN cat_clothes := cat_electronics; END IF;
    IF cat_appliances IS NULL THEN cat_appliances := cat_electronics; END IF;
    IF cat_sports IS NULL THEN cat_sports := cat_electronics; END IF;
    IF cat_books IS NULL THEN cat_books := cat_electronics; END IF;

    RAISE NOTICE 'Creating 50 additional items...';

    -- =========== ELECTRONICS (10 items) ===========
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u1, 'سماعات Sony WH-1000XM5', 'أفضل سماعات إلغاء ضوضاء - جديدة', cat_electronics, 'NEW', 12000, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400?text=Sony'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u1, 'شاشة Dell 32 4K', 'شاشة احترافية للتصميم', cat_electronics, 'NEW', 18000, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400?text=Dell32'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u3, 'بروجكتور Epson 4K', 'للسينما المنزلية', cat_electronics, 'LIKE_NEW', 35000, 'Giza', 'Dokki', 'ACTIVE', ARRAY['https://placehold.co/400?text=Epson'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u5, 'مكبر صوت JBL PartyBox', 'قوة 300 وات', cat_electronics, 'NEW', 15000, 'Cairo', 'Zamalek', 'ACTIVE', ARRAY['https://placehold.co/400?text=JBL'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u7, 'راوتر ASUS Gaming', 'WiFi 6E - سرعة فائقة', cat_electronics, 'NEW', 8500, 'Cairo', 'New Cairo', 'ACTIVE', ARRAY['https://placehold.co/400?text=ASUS'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u8, 'كاميرا GoPro Hero 12', 'للمغامرات', cat_electronics, 'NEW', 22000, 'Alexandria', 'Sidi Gaber', 'ACTIVE', ARRAY['https://placehold.co/400?text=GoPro'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u3, 'عدسة Canon 50mm f/1.4', 'عدسة بورتريه احترافية', cat_electronics, 'LIKE_NEW', 18000, 'Giza', 'Dokki', 'ACTIVE', ARRAY['https://placehold.co/400?text=Canon50'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u1, 'Nintendo Switch OLED', 'مع 3 ألعاب', cat_electronics, 'LIKE_NEW', 14000, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400?text=Switch'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u5, 'Xbox Series X', 'جديد بالكرتونة', cat_electronics, 'NEW', 25000, 'Cairo', 'Zamalek', 'ACTIVE', ARRAY['https://placehold.co/400?text=Xbox'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u10, 'مايكروفون Blue Yeti', 'للبث المباشر', cat_electronics, 'NEW', 6500, 'Cairo', 'Heliopolis', 'ACTIVE', ARRAY['https://placehold.co/400?text=BlueYeti'], NOW(), NOW());

    RAISE NOTICE '✅ 10 Electronics items created';

    -- =========== MOBILES (10 items) ===========
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u8, 'iPhone 13 Pro 128GB', 'بطارية 88% - حالة ممتازة', cat_mobile, 'GOOD', 32000, 'Alexandria', 'Sidi Gaber', 'ACTIVE', ARRAY['https://placehold.co/400?text=iPhone13'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u8, 'Samsung A54 5G', 'جديد بالضمان', cat_mobile, 'NEW', 15000, 'Alexandria', 'Sidi Gaber', 'ACTIVE', ARRAY['https://placehold.co/400?text=A54'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u2, 'Huawei P60 Pro', 'كاميرا Leica', cat_mobile, 'NEW', 38000, 'Alexandria', 'Smouha', 'ACTIVE', ARRAY['https://placehold.co/400?text=P60'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u1, 'OnePlus 12', 'أسرع شحن في العالم', cat_mobile, 'NEW', 42000, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400?text=OnePlus12'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u6, 'Google Pixel 7a', 'أفضل كاميرا بالفئة المتوسطة', cat_mobile, 'NEW', 18000, 'Cairo', 'Maadi', 'ACTIVE', ARRAY['https://placehold.co/400?text=Pixel7a'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u4, 'Realme GT 5', 'للجيمنج', cat_mobile, 'LIKE_NEW', 22000, 'Cairo', 'Shubra', 'ACTIVE', ARRAY['https://placehold.co/400?text=RealmeGT5'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u9, 'iPhone 12 64GB', 'للبيع أو المقايضة', cat_mobile, 'GOOD', 22000, 'Giza', '6th of October', 'ACTIVE', ARRAY['https://placehold.co/400?text=iPhone12'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u10, 'Xiaomi 13T Pro', 'شاشة AMOLED 144Hz', cat_mobile, 'NEW', 28000, 'Cairo', 'Heliopolis', 'ACTIVE', ARRAY['https://placehold.co/400?text=Xiaomi13T'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u2, 'Samsung Z Flip 5', 'موبايل قابل للطي', cat_mobile, 'LIKE_NEW', 42000, 'Alexandria', 'Smouha', 'ACTIVE', ARRAY['https://placehold.co/400?text=ZFlip5'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u7, 'Nothing Phone 2', 'تصميم فريد مع LED', cat_mobile, 'NEW', 28000, 'Cairo', 'New Cairo', 'ACTIVE', ARRAY['https://placehold.co/400?text=Nothing2'], NOW(), NOW());

    RAISE NOTICE '✅ 10 Mobile items created';

    -- =========== COMPUTERS & LAPTOPS (8 items) ===========
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u1, 'Dell XPS 15 2024', 'i9, 32GB, RTX 4070', cat_computers, 'NEW', 85000, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400?text=XPS15'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u6, 'HP Spectre x360', 'لابتوب 2 في 1', cat_computers, 'LIKE_NEW', 55000, 'Cairo', 'Maadi', 'ACTIVE', ARRAY['https://placehold.co/400?text=Spectre'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u3, 'iMac 24 M3', 'شاشة 4.5K Retina', cat_computers, 'NEW', 75000, 'Giza', 'Dokki', 'ACTIVE', ARRAY['https://placehold.co/400?text=iMac24'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u7, 'Lenovo ThinkPad X1', 'لابتوب أعمال', cat_computers, 'GOOD', 42000, 'Cairo', 'New Cairo', 'ACTIVE', ARRAY['https://placehold.co/400?text=ThinkPad'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u4, 'جهاز تجميعة Gaming PC', 'RTX 4080, i7-14700K', cat_computers, 'NEW', 95000, 'Cairo', 'Shubra', 'ACTIVE', ARRAY['https://placehold.co/400?text=GamingPC'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u5, 'Mac Mini M2 Pro', '32GB RAM', cat_computers, 'NEW', 65000, 'Cairo', 'Zamalek', 'ACTIVE', ARRAY['https://placehold.co/400?text=MacMini'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u8, 'ASUS ROG Strix', 'لابتوب جيمنج', cat_computers, 'LIKE_NEW', 58000, 'Alexandria', 'Sidi Gaber', 'ACTIVE', ARRAY['https://placehold.co/400?text=ROG'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u10, 'Surface Pro 9', 'تابلت بقوة لابتوب', cat_computers, 'NEW', 48000, 'Cairo', 'Heliopolis', 'ACTIVE', ARRAY['https://placehold.co/400?text=Surface9'], NOW(), NOW());

    RAISE NOTICE '✅ 8 Computer items created';

    -- =========== FURNITURE (7 items) ===========
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u7, 'طاولة سفرة 8 كراسي', 'خشب زان فاخر', cat_furniture, 'NEW', 45000, 'Cairo', 'New Cairo', 'ACTIVE', ARRAY['https://placehold.co/400?text=DiningTable'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u2, 'كنبة حرف L', 'قماش مستورد', cat_furniture, 'LIKE_NEW', 35000, 'Alexandria', 'Smouha', 'ACTIVE', ARRAY['https://placehold.co/400?text=LSofa'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u9, 'غرفة أطفال كاملة', 'دولاب + سرير + مكتب', cat_furniture, 'NEW', 55000, 'Giza', '6th of October', 'ACTIVE', ARRAY['https://placehold.co/400?text=KidsRoom'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u5, 'مكتبة خشب ماهوجني', 'تحفة فنية', cat_furniture, 'GOOD', 28000, 'Cairo', 'Zamalek', 'ACTIVE', ARRAY['https://placehold.co/400?text=Bookshelf'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u6, 'كرسي مكتب Herman Miller', 'الأصلي - للعمل الطويل', cat_furniture, 'LIKE_NEW', 22000, 'Cairo', 'Maadi', 'ACTIVE', ARRAY['https://placehold.co/400?text=HermanMiller'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u10, 'مرتبة طبية 180x200', 'ضمان 10 سنوات', cat_furniture, 'NEW', 18000, 'Cairo', 'Heliopolis', 'ACTIVE', ARRAY['https://placehold.co/400?text=Mattress'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u3, 'أنتيك - بوفيه فرنسي', 'عمره 100 سنة', cat_furniture, 'GOOD', 85000, 'Giza', 'Dokki', 'ACTIVE', ARRAY['https://placehold.co/400?text=Antique'], NOW(), NOW());

    RAISE NOTICE '✅ 7 Furniture items created';

    -- =========== VEHICLES (5 items) ===========
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u9, 'مرسيدس C200 2021', 'AMG Line - فل الفل', cat_vehicles, 'LIKE_NEW', 1800000, 'Giza', '6th of October', 'ACTIVE', ARRAY['https://placehold.co/400?text=MercedesC200'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u9, 'BMW X3 2022', 'M Sport Package', cat_vehicles, 'LIKE_NEW', 2200000, 'Giza', '6th of October', 'ACTIVE', ARRAY['https://placehold.co/400?text=BMWX3'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u4, 'نيسان سنترا 2020', '60000 كم - حالة ممتازة', cat_vehicles, 'GOOD', 650000, 'Cairo', 'Shubra', 'ACTIVE', ARRAY['https://placehold.co/400?text=Sentra'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u6, 'شيري تيجو 8 برو 2023', 'زيرو - وكالة', cat_vehicles, 'NEW', 1100000, 'Cairo', 'Maadi', 'ACTIVE', ARRAY['https://placehold.co/400?text=Tiggo8'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u7, 'سكوتر SYM 150', 'موديل 2024', cat_vehicles, 'NEW', 85000, 'Cairo', 'New Cairo', 'ACTIVE', ARRAY['https://placehold.co/400?text=SYM150'], NOW(), NOW());

    RAISE NOTICE '✅ 5 Vehicle items created';

    -- =========== FASHION & LUXURY (5 items) ===========
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u5, 'ساعة Omega Seamaster', 'أصلية مع الأوراق', cat_clothes, 'LIKE_NEW', 180000, 'Cairo', 'Zamalek', 'ACTIVE', ARRAY['https://placehold.co/400?text=Omega'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u5, 'حقيبة Hermès Birkin', 'إصدار محدود', cat_clothes, 'NEW', 450000, 'Cairo', 'Zamalek', 'ACTIVE', ARRAY['https://placehold.co/400?text=Hermes'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u2, 'جاكيت جلد إيطالي', 'ماركة Armani', cat_clothes, 'LIKE_NEW', 15000, 'Alexandria', 'Smouha', 'ACTIVE', ARRAY['https://placehold.co/400?text=Armani'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u10, 'طقم ذهب عيار 21', 'سلسلة + خاتم + حلق', cat_clothes, 'NEW', 65000, 'Cairo', 'Heliopolis', 'ACTIVE', ARRAY['https://placehold.co/400?text=GoldSet'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u3, 'عقد ألماس 2 قيراط', 'شهادة GIA', cat_clothes, 'NEW', 350000, 'Giza', 'Dokki', 'ACTIVE', ARRAY['https://placehold.co/400?text=Diamond'], NOW(), NOW());

    RAISE NOTICE '✅ 5 Fashion & Luxury items created';

    -- =========== HOME APPLIANCES (5 items) ===========
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u10, 'ثلاجة Samsung 22 قدم', 'إنفرتر - توفير طاقة', cat_appliances, 'NEW', 32000, 'Cairo', 'Heliopolis', 'ACTIVE', ARRAY['https://placehold.co/400?text=SamsungFridge'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u6, 'غسالة LG 10 كيلو', 'AI DD - ذكية', cat_appliances, 'NEW', 22000, 'Cairo', 'Maadi', 'ACTIVE', ARRAY['https://placehold.co/400?text=LGWasher'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u4, 'تكييف Carrier 2.25 حصان', 'إنفرتر بارد فقط', cat_appliances, 'NEW', 28000, 'Cairo', 'Shubra', 'ACTIVE', ARRAY['https://placehold.co/400?text=CarrierAC'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u7, 'فرن كهربائي Bosch', 'بلت إن 60 سم', cat_appliances, 'LIKE_NEW', 18000, 'Cairo', 'New Cairo', 'ACTIVE', ARRAY['https://placehold.co/400?text=BoschOven'], NOW(), NOW()),
    (gen_random_uuid()::TEXT, u2, 'غسالة أطباق Beko', '14 فرد', cat_appliances, 'NEW', 15000, 'Alexandria', 'Smouha', 'ACTIVE', ARRAY['https://placehold.co/400?text=BekoDishwasher'], NOW(), NOW());

    RAISE NOTICE '✅ 5 Home Appliances items created';

    -- =========== SUMMARY ===========
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════';
    RAISE NOTICE '     ✅ UAT PART 1: 50 ADDITIONAL ITEMS CREATED               ';
    RAISE NOTICE '══════════════════════════════════════════════════════════════';
    RAISE NOTICE '  📱 10 Electronics';
    RAISE NOTICE '  📱 10 Mobiles';
    RAISE NOTICE '  💻 8 Computers';
    RAISE NOTICE '  🪑 7 Furniture';
    RAISE NOTICE '  🚗 5 Vehicles';
    RAISE NOTICE '  👜 5 Fashion & Luxury';
    RAISE NOTICE '  🏠 5 Home Appliances';
    RAISE NOTICE '══════════════════════════════════════════════════════════════';
    RAISE NOTICE '  Total: 50 new items added to the platform';
    RAISE NOTICE '══════════════════════════════════════════════════════════════';

END $$;
