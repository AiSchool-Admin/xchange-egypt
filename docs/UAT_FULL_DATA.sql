-- =====================================================
-- UAT FULL DATA - بيانات اختبار شاملة
-- =====================================================

DO $$
DECLARE
    -- Users
    u1 TEXT; u2 TEXT; u3 TEXT; u4 TEXT; u5 TEXT;
    u6 TEXT; u7 TEXT; u8 TEXT; u9 TEXT; u10 TEXT;
    -- Categories
    cat_electronics TEXT; cat_mobile TEXT; cat_computers TEXT;
    cat_furniture TEXT; cat_vehicles TEXT; cat_clothes TEXT;
    -- Items (30 items)
    item1 TEXT; item2 TEXT; item3 TEXT; item4 TEXT; item5 TEXT;
    item6 TEXT; item7 TEXT; item8 TEXT; item9 TEXT; item10 TEXT;
    item11 TEXT; item12 TEXT; item13 TEXT; item14 TEXT; item15 TEXT;
    item16 TEXT; item17 TEXT; item18 TEXT; item19 TEXT; item20 TEXT;
    item21 TEXT; item22 TEXT; item23 TEXT; item24 TEXT; item25 TEXT;
    item26 TEXT; item27 TEXT; item28 TEXT; item29 TEXT; item30 TEXT;
    -- Listings
    lst1 TEXT; lst2 TEXT; lst3 TEXT; lst4 TEXT; lst5 TEXT;
    lst6 TEXT; lst7 TEXT; lst8 TEXT; lst9 TEXT; lst10 TEXT;
    lst11 TEXT; lst12 TEXT; lst13 TEXT; lst14 TEXT; lst15 TEXT;
    -- Auctions
    auc1 TEXT; auc2 TEXT; auc3 TEXT;
    -- Barter
    barter1 TEXT; barter2 TEXT; barter3 TEXT; barter4 TEXT; barter5 TEXT;
    -- Chain
    chain1 TEXT;
    -- Reverse Auction
    rev1 TEXT; rev2 TEXT;
    -- Shipping Addresses
    addr1 TEXT; addr2 TEXT; addr3 TEXT; addr10 TEXT;
    -- Orders
    ord1 TEXT; ord2 TEXT; ord3 TEXT; ord4 TEXT; ord5 TEXT;
    -- Transactions
    trx1 TEXT; trx2 TEXT; trx3 TEXT; trx4 TEXT; trx5 TEXT;
BEGIN
    -- =========== GET USERS ===========
    SELECT id INTO u1 FROM users WHERE email = 'test1@xchange.eg' LIMIT 1;
    SELECT id INTO u2 FROM users WHERE email = 'test2@xchange.eg' LIMIT 1;
    SELECT id INTO u3 FROM users WHERE email = 'test3@xchange.eg' LIMIT 1;
    SELECT id INTO u4 FROM users WHERE email = 'test4@xchange.eg' LIMIT 1;
    SELECT id INTO u5 FROM users WHERE email = 'test5@xchange.eg' LIMIT 1;
    SELECT id INTO u6 FROM users WHERE email = 'test6@xchange.eg' LIMIT 1;
    SELECT id INTO u7 FROM users WHERE email = 'test7@xchange.eg' LIMIT 1;
    SELECT id INTO u8 FROM users WHERE email = 'test8@xchange.eg' LIMIT 1;
    SELECT id INTO u9 FROM users WHERE email = 'test9@xchange.eg' LIMIT 1;
    SELECT id INTO u10 FROM users WHERE email = 'test10@xchange.eg' LIMIT 1;

    -- =========== GET CATEGORIES ===========
    SELECT id INTO cat_electronics FROM categories WHERE slug = 'electronics' OR name_en ILIKE '%electron%' LIMIT 1;
    SELECT id INTO cat_mobile FROM categories WHERE slug = 'mobile-phones' OR name_en ILIKE '%mobile%' OR name_en ILIKE '%phone%' LIMIT 1;
    SELECT id INTO cat_computers FROM categories WHERE slug = 'computers' OR name_en ILIKE '%computer%' OR name_en ILIKE '%laptop%' LIMIT 1;
    SELECT id INTO cat_furniture FROM categories WHERE slug = 'furniture' OR name_en ILIKE '%furniture%' LIMIT 1;
    SELECT id INTO cat_vehicles FROM categories WHERE slug = 'vehicles' OR name_en ILIKE '%car%' OR name_en ILIKE '%vehicle%' LIMIT 1;
    SELECT id INTO cat_clothes FROM categories WHERE slug = 'fashion' OR name_en ILIKE '%cloth%' OR name_en ILIKE '%fashion%' LIMIT 1;

    -- Fallback
    IF cat_electronics IS NULL THEN SELECT id INTO cat_electronics FROM categories WHERE is_active = true LIMIT 1; END IF;
    IF cat_mobile IS NULL THEN cat_mobile := cat_electronics; END IF;
    IF cat_computers IS NULL THEN cat_computers := cat_electronics; END IF;
    IF cat_furniture IS NULL THEN cat_furniture := cat_electronics; END IF;
    IF cat_vehicles IS NULL THEN cat_vehicles := cat_electronics; END IF;
    IF cat_clothes IS NULL THEN cat_clothes := cat_electronics; END IF;

    -- =========== CREATE 30 ITEMS ===========
    RAISE NOTICE 'Creating items...';

    -- User 1 (أحمد التاجر) - إلكترونيات
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u1, 'آيفون 15 برو ماكس 256GB', 'جديد بالكرتونة ضمان سنة - تيتانيوم', cat_mobile, 'NEW', 75000, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400?text=iPhone15'], NOW(), NOW()) RETURNING id INTO item1;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u1, 'ماك بوك برو M3 14 انش', '16GB RAM - 512GB SSD', cat_computers, 'NEW', 95000, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400?text=MacBook'], NOW(), NOW()) RETURNING id INTO item2;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u1, 'آيباد برو 12.9 M2', 'مع Apple Pencil 2', cat_electronics, 'NEW', 45000, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400?text=iPad'], NOW(), NOW()) RETURNING id INTO item3;

    -- User 2 (سارة المقايضة) - للمقايضة
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u2, 'سامسونج S24 Ultra 512GB', 'للمقايضة بآيفون - حالة ممتازة', cat_mobile, 'LIKE_NEW', 60000, 'Alexandria', 'Smouha', 'ACTIVE', ARRAY['https://placehold.co/400?text=S24'], NOW(), NOW()) RETURNING id INTO item4;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u2, 'أريكة جلد طبيعي إيطالي', 'للمقايضة بطاولة سفرة', cat_furniture, 'LIKE_NEW', 25000, 'Alexandria', 'Smouha', 'ACTIVE', ARRAY['https://placehold.co/400?text=Sofa'], NOW(), NOW()) RETURNING id INTO item5;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u2, 'بلايستيشن 5 ديجيتال', 'مع 2 يد تحكم و5 ألعاب', cat_electronics, 'LIKE_NEW', 28000, 'Alexandria', 'Smouha', 'ACTIVE', ARRAY['https://placehold.co/400?text=PS5'], NOW(), NOW()) RETURNING id INTO item6;

    -- User 3 (محمد المزادات) - للمزادات
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u3, 'كاميرا سوني A7IV', 'مع عدسة 24-70mm f/2.8', cat_electronics, 'LIKE_NEW', 120000, 'Giza', 'Dokki', 'ACTIVE', ARRAY['https://placehold.co/400?text=SonyA7'], NOW(), NOW()) RETURNING id INTO item7;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u3, 'ساعة رولكس صبمارينر', 'أصلية مع الأوراق', cat_electronics, 'LIKE_NEW', 850000, 'Giza', 'Dokki', 'ACTIVE', ARRAY['https://placehold.co/400?text=Rolex'], NOW(), NOW()) RETURNING id INTO item8;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u3, 'لوحة فنية أصلية', 'للفنان محمود سعيد', cat_furniture, 'GOOD', 500000, 'Giza', 'Dokki', 'ACTIVE', ARRAY['https://placehold.co/400?text=Art'], NOW(), NOW()) RETURNING id INTO item9;

    -- User 4 (فاطمة الخردة)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u4, 'خردة نحاس 50 كيلو', 'نحاس نظيف للبيع', cat_electronics, 'FAIR', 15000, 'Cairo', 'Shubra', 'ACTIVE', ARRAY['https://placehold.co/400?text=Copper'], NOW(), NOW()) RETURNING id INTO item10;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u4, 'خردة ألومنيوم 100 كيلو', 'ألومنيوم صناعي', cat_electronics, 'FAIR', 8000, 'Cairo', 'Shubra', 'ACTIVE', ARRAY['https://placehold.co/400?text=Aluminum'], NOW(), NOW()) RETURNING id INTO item11;

    -- User 5 (كريم الفاخر)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u5, 'شنطة لويس فيتون أصلية', 'Limited Edition', cat_clothes, 'NEW', 85000, 'Cairo', 'Zamalek', 'ACTIVE', ARRAY['https://placehold.co/400?text=LV'], NOW(), NOW()) RETURNING id INTO item12;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u5, 'نظارة قوتشي 2024', 'موديل جديد', cat_clothes, 'NEW', 12000, 'Cairo', 'Zamalek', 'ACTIVE', ARRAY['https://placehold.co/400?text=Gucci'], NOW(), NOW()) RETURNING id INTO item13;

    -- User 6 (نورا المناقصات)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u6, 'مطلوب 50 لابتوب Dell', 'للشركة - مواصفات عالية', cat_computers, 'NEW', 750000, 'Cairo', 'Maadi', 'ACTIVE', ARRAY['https://placehold.co/400?text=Laptops'], NOW(), NOW()) RETURNING id INTO item14;

    -- User 7 (ياسر العقارات)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u7, 'مكتب إداري فاخر', 'مع كرسي ومكتبة', cat_furniture, 'NEW', 35000, 'Cairo', 'New Cairo', 'ACTIVE', ARRAY['https://placehold.co/400?text=Office'], NOW(), NOW()) RETURNING id INTO item15;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u7, 'غرفة نوم كاملة', 'خشب زان أحمر', cat_furniture, 'NEW', 65000, 'Cairo', 'New Cairo', 'ACTIVE', ARRAY['https://placehold.co/400?text=Bedroom'], NOW(), NOW()) RETURNING id INTO item16;

    -- User 8 (منى الموبايلات)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u8, 'آيفون 14 برو 256GB', 'مستعمل - بطارية 92%', cat_mobile, 'LIKE_NEW', 45000, 'Alexandria', 'Sidi Gaber', 'ACTIVE', ARRAY['https://placehold.co/400?text=iPhone14'], NOW(), NOW()) RETURNING id INTO item17;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u8, 'شاومي 14 Ultra', 'جديد بالكرتونة', cat_mobile, 'NEW', 42000, 'Alexandria', 'Sidi Gaber', 'ACTIVE', ARRAY['https://placehold.co/400?text=Xiaomi'], NOW(), NOW()) RETURNING id INTO item18;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u8, 'سامسونج Z Fold 5', 'حالة ممتازة', cat_mobile, 'LIKE_NEW', 55000, 'Alexandria', 'Sidi Gaber', 'ACTIVE', ARRAY['https://placehold.co/400?text=Fold5'], NOW(), NOW()) RETURNING id INTO item19;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u8, 'أوبو فايند X7', 'جديد', cat_mobile, 'NEW', 38000, 'Alexandria', 'Sidi Gaber', 'ACTIVE', ARRAY['https://placehold.co/400?text=Oppo'], NOW(), NOW()) RETURNING id INTO item20;

    -- User 9 (علي السيارات)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u9, 'تويوتا كامري 2022', 'فل كامل - 30000 كم', cat_vehicles, 'LIKE_NEW', 950000, 'Giza', '6th of October', 'ACTIVE', ARRAY['https://placehold.co/400?text=Camry'], NOW(), NOW()) RETURNING id INTO item21;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u9, 'هيونداي توسان 2023', 'زيرو - أول مالك', cat_vehicles, 'NEW', 1200000, 'Giza', '6th of October', 'ACTIVE', ARRAY['https://placehold.co/400?text=Tucson'], NOW(), NOW()) RETURNING id INTO item22;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u9, 'كيا سبورتاج 2021', '50000 كم - حالة ممتازة', cat_vehicles, 'GOOD', 850000, 'Giza', '6th of October', 'ACTIVE', ARRAY['https://placehold.co/400?text=Sportage'], NOW(), NOW()) RETURNING id INTO item23;

    -- User 10 (هدى المشتريات)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u10, 'أبحث عن ثلاجة سامسونج', 'مطلوب 18-22 قدم', cat_electronics, 'GOOD', 25000, 'Cairo', 'Heliopolis', 'ACTIVE', ARRAY['https://placehold.co/400?text=Wanted'], NOW(), NOW()) RETURNING id INTO item24;

    -- More items for variety
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u1, 'AirPods Pro 2', 'جديد بالكرتونة', cat_electronics, 'NEW', 8500, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400?text=AirPods'], NOW(), NOW()) RETURNING id INTO item25;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u1, 'Apple Watch Ultra 2', 'جديدة', cat_electronics, 'NEW', 35000, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400?text=Watch'], NOW(), NOW()) RETURNING id INTO item26;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u3, 'درون DJI Mavic 3', 'مع 3 بطاريات', cat_electronics, 'LIKE_NEW', 75000, 'Giza', 'Dokki', 'ACTIVE', ARRAY['https://placehold.co/400?text=Drone'], NOW(), NOW()) RETURNING id INTO item27;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u5, 'حذاء نايك اير جوردان', 'Limited Edition', cat_clothes, 'NEW', 15000, 'Cairo', 'Zamalek', 'ACTIVE', ARRAY['https://placehold.co/400?text=Jordan'], NOW(), NOW()) RETURNING id INTO item28;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u7, 'تلفزيون LG OLED 65', 'موديل 2024', cat_electronics, 'NEW', 55000, 'Cairo', 'New Cairo', 'ACTIVE', ARRAY['https://placehold.co/400?text=LGTV'], NOW(), NOW()) RETURNING id INTO item29;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u8, 'جوجل بيكسل 8 برو', 'جديد', cat_mobile, 'NEW', 40000, 'Alexandria', 'Sidi Gaber', 'ACTIVE', ARRAY['https://placehold.co/400?text=Pixel8'], NOW(), NOW()) RETURNING id INTO item30;

    RAISE NOTICE '✅ Created 30 items';

    -- =========== CREATE LISTINGS (15) ===========
    RAISE NOTICE 'Creating listings...';

    -- Direct Sale listings
    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item1, u1, 'DIRECT_SALE', 75000, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst1;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item2, u1, 'DIRECT_SALE', 95000, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst2;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item3, u1, 'DIRECT_SALE', 45000, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst3;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item17, u8, 'DIRECT_SALE', 45000, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst4;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item18, u8, 'DIRECT_SALE', 42000, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst5;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item25, u1, 'DIRECT_SALE', 8500, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst6;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item26, u1, 'DIRECT_SALE', 35000, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst7;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item12, u5, 'DIRECT_SALE', 85000, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst8;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item15, u7, 'DIRECT_SALE', 35000, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst9;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item29, u7, 'DIRECT_SALE', 55000, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst10;

    -- Auction listings
    INSERT INTO listings (id, item_id, user_id, listing_type, starting_bid, current_bid, bid_increment, status, end_date, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item7, u3, 'AUCTION', 80000, 105000, 5000, 'ACTIVE', NOW() + INTERVAL '7 days', NOW(), NOW()) RETURNING id INTO lst11;

    INSERT INTO listings (id, item_id, user_id, listing_type, starting_bid, current_bid, bid_increment, status, end_date, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item8, u3, 'AUCTION', 700000, 820000, 20000, 'ACTIVE', NOW() + INTERVAL '5 days', NOW(), NOW()) RETURNING id INTO lst12;

    INSERT INTO listings (id, item_id, user_id, listing_type, starting_bid, current_bid, bid_increment, status, end_date, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item27, u3, 'AUCTION', 50000, 68000, 3000, 'ACTIVE', NOW() + INTERVAL '3 days', NOW(), NOW()) RETURNING id INTO lst13;

    -- Barter listings
    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item4, u2, 'BARTER', 60000, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst14;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, item21, u9, 'BARTER', 950000, 'ACTIVE', NOW(), NOW()) RETURNING id INTO lst15;

    RAISE NOTICE '✅ Created 15 listings';

    -- =========== CREATE AUCTIONS (3) ===========
    RAISE NOTICE 'Creating auctions...';

    INSERT INTO auctions (id, listing_id, starting_price, current_price, min_bid_increment, start_time, end_time, status, total_bids, unique_bidders, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, lst11, 80000, 105000, 5000, NOW() - INTERVAL '2 days', NOW() + INTERVAL '7 days', 'ACTIVE', 5, 3, NOW(), NOW()) RETURNING id INTO auc1;

    INSERT INTO auctions (id, listing_id, starting_price, current_price, min_bid_increment, start_time, end_time, status, total_bids, unique_bidders, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, lst12, 700000, 820000, 20000, NOW() - INTERVAL '1 day', NOW() + INTERVAL '5 days', 'ACTIVE', 6, 4, NOW(), NOW()) RETURNING id INTO auc2;

    INSERT INTO auctions (id, listing_id, starting_price, current_price, min_bid_increment, start_time, end_time, status, total_bids, unique_bidders, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, lst13, 50000, 68000, 3000, NOW() - INTERVAL '12 hours', NOW() + INTERVAL '3 days', 'ACTIVE', 4, 2, NOW(), NOW()) RETURNING id INTO auc3;

    -- =========== CREATE AUCTION BIDS (15) ===========
    INSERT INTO auction_bids (id, listing_id, auction_id, bidder_id, bid_amount, status, created_at) VALUES
    -- Auction 1 bids (Camera)
    (gen_random_uuid()::TEXT, lst11, auc1, u5, 85000, 'OUTBID', NOW() - INTERVAL '36 hours'),
    (gen_random_uuid()::TEXT, lst11, auc1, u10, 90000, 'OUTBID', NOW() - INTERVAL '24 hours'),
    (gen_random_uuid()::TEXT, lst11, auc1, u5, 95000, 'OUTBID', NOW() - INTERVAL '12 hours'),
    (gen_random_uuid()::TEXT, lst11, auc1, u1, 100000, 'OUTBID', NOW() - INTERVAL '6 hours'),
    (gen_random_uuid()::TEXT, lst11, auc1, u5, 105000, 'ACTIVE', NOW() - INTERVAL '1 hour'),
    -- Auction 2 bids (Rolex)
    (gen_random_uuid()::TEXT, lst12, auc2, u5, 720000, 'OUTBID', NOW() - INTERVAL '20 hours'),
    (gen_random_uuid()::TEXT, lst12, auc2, u7, 740000, 'OUTBID', NOW() - INTERVAL '16 hours'),
    (gen_random_uuid()::TEXT, lst12, auc2, u1, 760000, 'OUTBID', NOW() - INTERVAL '12 hours'),
    (gen_random_uuid()::TEXT, lst12, auc2, u5, 780000, 'OUTBID', NOW() - INTERVAL '8 hours'),
    (gen_random_uuid()::TEXT, lst12, auc2, u7, 800000, 'OUTBID', NOW() - INTERVAL '4 hours'),
    (gen_random_uuid()::TEXT, lst12, auc2, u1, 820000, 'ACTIVE', NOW() - INTERVAL '1 hour'),
    -- Auction 3 bids (Drone)
    (gen_random_uuid()::TEXT, lst13, auc3, u10, 53000, 'OUTBID', NOW() - INTERVAL '10 hours'),
    (gen_random_uuid()::TEXT, lst13, auc3, u8, 59000, 'OUTBID', NOW() - INTERVAL '6 hours'),
    (gen_random_uuid()::TEXT, lst13, auc3, u10, 62000, 'OUTBID', NOW() - INTERVAL '3 hours'),
    (gen_random_uuid()::TEXT, lst13, auc3, u8, 68000, 'ACTIVE', NOW() - INTERVAL '30 minutes');

    RAISE NOTICE '✅ Created 3 auctions with 15 bids';

    -- =========== CREATE BARTER OFFERS (5) ===========
    RAISE NOTICE 'Creating barter offers...';

    INSERT INTO barter_offers (id, initiator_id, recipient_id, offered_item_ids, offered_bundle_value, status, notes, expires_at, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u2, u1, ARRAY[item4], 60000, 'PENDING', 'أعرض S24 Ultra مقابل iPhone 15 Pro', NOW() + INTERVAL '7 days', NOW(), NOW()) RETURNING id INTO barter1;

    INSERT INTO barter_offers (id, initiator_id, recipient_id, offered_item_ids, offered_bundle_value, status, notes, expires_at, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u2, u7, ARRAY[item5], 25000, 'PENDING', 'أريكة مقابل مكتب + كرسي', NOW() + INTERVAL '5 days', NOW(), NOW()) RETURNING id INTO barter2;

    INSERT INTO barter_offers (id, initiator_id, recipient_id, offered_item_ids, offered_bundle_value, status, notes, responded_at, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u9, u3, ARRAY[item21], 950000, 'ACCEPTED', 'كامري مقابل رولكس + كاميرا', NOW(), NOW(), NOW()) RETURNING id INTO barter3;

    INSERT INTO barter_offers (id, initiator_id, offered_item_ids, offered_bundle_value, status, is_open_offer, notes, expires_at, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u2, ARRAY[item6], 28000, 'PENDING', true, 'PS5 للمقايضة - أقبل عروض', NOW() + INTERVAL '14 days', NOW(), NOW()) RETURNING id INTO barter4;

    INSERT INTO barter_offers (id, initiator_id, recipient_id, offered_item_ids, offered_bundle_value, status, notes, responded_at, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u8, u1, ARRAY[item17, item18], 87000, 'REJECTED', 'iPhone 14 + Xiaomi مقابل MacBook', NOW(), NOW(), NOW()) RETURNING id INTO barter5;

    RAISE NOTICE '✅ Created 5 barter offers';

    -- =========== CREATE BARTER CHAIN ===========
    RAISE NOTICE 'Creating barter chain...';

    INSERT INTO barter_chains (id, chain_type, participant_count, match_score, algorithm_version, description, status, expires_at, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'CYCLE', 3, 0.92, '2.0', 'سلسلة: سارة ← أحمد ← منى ← سارة', 'PENDING', NOW() + INTERVAL '3 days', NOW(), NOW()) RETURNING id INTO chain1;

    INSERT INTO barter_participants (id, chain_id, user_id, giving_item_id, receiving_item_id, position, status, responded_at, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, chain1, u2, item4, item17, 0, 'ACCEPTED', NOW(), NOW(), NOW()),
    (gen_random_uuid()::TEXT, chain1, u1, item1, item4, 1, 'PENDING', NULL, NOW(), NOW()),
    (gen_random_uuid()::TEXT, chain1, u8, item17, item1, 2, 'PENDING', NULL, NOW(), NOW());

    RAISE NOTICE '✅ Created 1 barter chain with 3 participants';

    -- =========== CREATE REVERSE AUCTIONS (2) ===========
    RAISE NOTICE 'Creating reverse auctions...';

    INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, condition, quantity, max_budget, status, end_date, location, total_bids, unique_bidders, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u6, 'مطلوب 50 لابتوب Dell للشركة', 'مواصفات: Core i7, 16GB RAM, 512GB SSD', cat_computers, 'NEW', 50, 750000, 'ACTIVE', NOW() + INTERVAL '14 days', 'Cairo, Maadi', 3, 3, NOW(), NOW()) RETURNING id INTO rev1;

    INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, condition, quantity, max_budget, status, end_date, location, total_bids, unique_bidders, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, u7, 'مطلوب 20 شاشة للمكتب', 'شاشة 27 انش 4K', cat_electronics, 'NEW', 20, 120000, 'ACTIVE', NOW() + INTERVAL '10 days', 'Cairo, New Cairo', 2, 2, NOW(), NOW()) RETURNING id INTO rev2;

    -- Reverse auction bids
    INSERT INTO reverse_auction_bids (id, reverse_auction_id, seller_id, bid_amount, item_condition, delivery_option, delivery_days, notes, status, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, rev1, u1, 700000, 'NEW', 'DELIVERY', 14, 'Dell Latitude 5540 - ضمان 3 سنوات', 'ACTIVE', NOW(), NOW()),
    (gen_random_uuid()::TEXT, rev1, u4, 680000, 'NEW', 'DELIVERY', 10, 'Dell Inspiron 15 - ضمان سنتين', 'ACTIVE', NOW(), NOW()),
    (gen_random_uuid()::TEXT, rev1, u8, 720000, 'NEW', 'DELIVERY', 7, 'HP ProBook 450 G10', 'ACTIVE', NOW(), NOW()),
    (gen_random_uuid()::TEXT, rev2, u1, 110000, 'NEW', 'DELIVERY', 5, 'Dell UltraSharp 27 4K', 'ACTIVE', NOW(), NOW()),
    (gen_random_uuid()::TEXT, rev2, u8, 100000, 'NEW', 'DELIVERY', 7, 'LG 27UK850-W', 'ACTIVE', NOW(), NOW());

    RAISE NOTICE '✅ Created 2 reverse auctions with 5 bids';

    -- =========== CREATE SHIPPING ADDRESSES ===========
    RAISE NOTICE 'Creating shipping addresses...';

    INSERT INTO shipping_addresses (id, user_id, full_name, phone, address, city, governorate, is_default, created_at, updated_at)
    SELECT gen_random_uuid()::TEXT, id, full_name, COALESCE(phone, '+20100000000'), COALESCE(address, city || ', ' || governorate), city, governorate, true, NOW(), NOW()
    FROM users WHERE email LIKE 'test%@xchange.eg' AND city IS NOT NULL
    ON CONFLICT DO NOTHING;

    SELECT id INTO addr1 FROM shipping_addresses WHERE user_id = u1 LIMIT 1;
    SELECT id INTO addr2 FROM shipping_addresses WHERE user_id = u2 LIMIT 1;
    SELECT id INTO addr3 FROM shipping_addresses WHERE user_id = u3 LIMIT 1;
    SELECT id INTO addr10 FROM shipping_addresses WHERE user_id = u10 LIMIT 1;

    RAISE NOTICE '✅ Created shipping addresses';

    -- =========== CREATE ORDERS (5) ===========
    RAISE NOTICE 'Creating orders...';

    IF addr10 IS NOT NULL THEN
        -- Order 1: Delivered
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, shipped_at, delivered_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u10, 'XCH-' || FLOOR(RANDOM()*100000)::TEXT, 'DELIVERED', 45000, 100, 45100, addr10, 'CARD', 'PAY_' || FLOOR(RANDOM()*100000)::TEXT, NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '7 days', NOW()) RETURNING id INTO ord1;

        INSERT INTO order_items (id, order_id, listing_id, seller_id, quantity, price) VALUES (gen_random_uuid()::TEXT, ord1, lst4, u8, 1, 45000);

        -- Order 2: Shipped
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, shipped_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u10, 'XCH-' || FLOOR(RANDOM()*100000)::TEXT, 'SHIPPED', 95000, 150, 95150, addr10, 'CARD', 'PAY_' || FLOOR(RANDOM()*100000)::TEXT, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 days', NOW()) RETURNING id INTO ord2;

        INSERT INTO order_items (id, order_id, listing_id, seller_id, quantity, price) VALUES (gen_random_uuid()::TEXT, ord2, lst2, u1, 1, 95000);

        -- Order 3: Processing
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, paid_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u10, 'XCH-' || FLOOR(RANDOM()*100000)::TEXT, 'PROCESSING', 8500, 50, 8550, addr10, 'COD', NOW(), NOW(), NOW()) RETURNING id INTO ord3;

        INSERT INTO order_items (id, order_id, listing_id, seller_id, quantity, price) VALUES (gen_random_uuid()::TEXT, ord3, lst6, u1, 1, 8500);

        -- Order 4: Pending
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u5, 'XCH-' || FLOOR(RANDOM()*100000)::TEXT, 'PENDING', 42000, 100, 42100, addr10, 'CARD', NOW(), NOW()) RETURNING id INTO ord4;

        INSERT INTO order_items (id, order_id, listing_id, seller_id, quantity, price) VALUES (gen_random_uuid()::TEXT, ord4, lst5, u8, 1, 42000);

        -- Order 5: Cancelled
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u3, 'XCH-' || FLOOR(RANDOM()*100000)::TEXT, 'CANCELLED', 35000, 100, 35100, addr10, 'COD', NOW() - INTERVAL '5 days', NOW()) RETURNING id INTO ord5;

        INSERT INTO order_items (id, order_id, listing_id, seller_id, quantity, price) VALUES (gen_random_uuid()::TEXT, ord5, lst9, u7, 1, 35000);

        RAISE NOTICE '✅ Created 5 orders';
    END IF;

    -- =========== CREATE TRANSACTIONS (5) ===========
    RAISE NOTICE 'Creating transactions...';

    INSERT INTO transactions (id, listing_id, buyer_id, seller_id, transaction_type, amount, payment_method, payment_status, delivery_status, tracking_number, created_at, updated_at, completed_at) VALUES
    (gen_random_uuid()::TEXT, lst4, u10, u8, 'DIRECT_SALE', 45000, 'CARD', 'COMPLETED', 'DELIVERED', 'TRK001234', NOW() - INTERVAL '7 days', NOW(), NOW() - INTERVAL '2 days'),
    (gen_random_uuid()::TEXT, lst2, u10, u1, 'DIRECT_SALE', 95000, 'CARD', 'COMPLETED', 'SHIPPED', 'TRK005678', NOW() - INTERVAL '3 days', NOW(), NULL),
    (gen_random_uuid()::TEXT, lst6, u10, u1, 'DIRECT_SALE', 8500, 'COD', 'PENDING', 'PENDING', NULL, NOW(), NOW(), NULL),
    (gen_random_uuid()::TEXT, lst5, u5, u8, 'DIRECT_SALE', 42000, 'CARD', 'PENDING', 'PENDING', NULL, NOW(), NOW(), NULL),
    (gen_random_uuid()::TEXT, lst14, u1, u2, 'BARTER', NULL, NULL, 'COMPLETED', 'DELIVERED', NULL, NOW() - INTERVAL '10 days', NOW(), NOW() - INTERVAL '8 days');

    RAISE NOTICE '✅ Created 5 transactions';

    -- =========== CREATE NOTIFICATIONS (20) ===========
    RAISE NOTICE 'Creating notifications...';

    INSERT INTO notifications (id, user_id, type, priority, title, message, entity_type, entity_id, is_read, created_at) VALUES
    -- Barter notifications
    (gen_random_uuid()::TEXT, u1, 'BARTER_OFFER_RECEIVED', 'HIGH', 'عرض مقايضة جديد!', 'سارة تعرض Samsung S24 Ultra مقابل iPhone 15', 'BARTER_OFFER', barter1, false, NOW()),
    (gen_random_uuid()::TEXT, u7, 'BARTER_OFFER_RECEIVED', 'HIGH', 'عرض مقايضة جديد!', 'سارة تعرض أريكة جلد مقابل مكتب', 'BARTER_OFFER', barter2, false, NOW()),
    (gen_random_uuid()::TEXT, u1, 'BARTER_OFFER_RECEIVED', 'HIGH', 'فرصة مقايضة ذكية!', 'سلسلة مقايضة متاحة - 3 أطراف', 'BARTER_CHAIN', chain1, false, NOW()),
    (gen_random_uuid()::TEXT, u8, 'BARTER_OFFER_RECEIVED', 'HIGH', 'فرصة مقايضة ذكية!', 'يمكنك الحصول على iPhone 15 Pro', 'BARTER_CHAIN', chain1, false, NOW()),
    -- Auction notifications
    (gen_random_uuid()::TEXT, u10, 'AUCTION_OUTBID', 'HIGH', 'تم تجاوز عرضك!', 'عرضك على كاميرا سوني تم تجاوزه - الحالي 105,000', 'AUCTION', auc1, false, NOW()),
    (gen_random_uuid()::TEXT, u7, 'AUCTION_OUTBID', 'HIGH', 'تم تجاوز عرضك!', 'عرضك على رولكس تم تجاوزه - الحالي 820,000', 'AUCTION', auc2, false, NOW()),
    (gen_random_uuid()::TEXT, u10, 'AUCTION_OUTBID', 'HIGH', 'تم تجاوز عرضك!', 'عرضك على الدرون تم تجاوزه - الحالي 68,000', 'AUCTION', auc3, false, NOW()),
    (gen_random_uuid()::TEXT, u3, 'AUCTION_NEW_BID', 'MEDIUM', 'مزايدة جديدة!', 'تم استلام مزايدة 105,000 على الكاميرا', 'AUCTION', auc1, false, NOW()),
    (gen_random_uuid()::TEXT, u3, 'AUCTION_NEW_BID', 'MEDIUM', 'مزايدة جديدة!', 'تم استلام مزايدة 820,000 على الرولكس', 'AUCTION', auc2, false, NOW()),
    -- Reverse auction notifications
    (gen_random_uuid()::TEXT, u6, 'REVERSE_AUCTION_NEW_BID', 'MEDIUM', 'عروض جديدة على مناقصتك!', 'تم استلام 3 عروض على مناقصة اللابتوبات', 'REVERSE_AUCTION', rev1, false, NOW()),
    (gen_random_uuid()::TEXT, u7, 'REVERSE_AUCTION_NEW_BID', 'MEDIUM', 'عروض جديدة على مناقصتك!', 'تم استلام 2 عروض على مناقصة الشاشات', 'REVERSE_AUCTION', rev2, false, NOW()),
    -- Transaction notifications
    (gen_random_uuid()::TEXT, u10, 'TRANSACTION_SHIPPED', 'MEDIUM', 'تم شحن طلبك!', 'طلب MacBook Pro في الطريق إليك', 'ORDER', ord2, false, NOW()),
    (gen_random_uuid()::TEXT, u10, 'TRANSACTION_DELIVERED', 'MEDIUM', 'تم تسليم طلبك!', 'تم تسليم طلب iPhone 14 Pro بنجاح', 'ORDER', ord1, true, NOW() - INTERVAL '2 days'),
    (gen_random_uuid()::TEXT, u8, 'ITEM_SOLD', 'HIGH', 'تم بيع منتجك!', 'تم بيع iPhone 14 Pro بمبلغ 45,000 جنيه', 'ORDER', ord1, true, NOW() - INTERVAL '7 days'),
    (gen_random_uuid()::TEXT, u1, 'ITEM_SOLD', 'HIGH', 'تم بيع منتجك!', 'تم بيع MacBook Pro بمبلغ 95,000 جنيه', 'ORDER', ord2, false, NOW() - INTERVAL '3 days'),
    -- Price alerts
    (gen_random_uuid()::TEXT, u10, 'ITEM_PRICE_DROP', 'MEDIUM', 'انخفاض سعر!', 'انخفض سعر AirPods Pro من 9000 إلى 8500', 'ITEM', item25, false, NOW()),
    (gen_random_uuid()::TEXT, u5, 'ITEM_PRICE_DROP', 'MEDIUM', 'انخفاض سعر!', 'انخفض سعر شاومي 14 من 45000 إلى 42000', 'ITEM', item18, false, NOW()),
    -- Review requests
    (gen_random_uuid()::TEXT, u10, 'USER_REVIEW_RECEIVED', 'LOW', 'قيّم تجربتك', 'كيف كانت تجربتك مع منى الموبايلات؟', 'USER', u8, false, NOW()),
    -- Welcome
    (gen_random_uuid()::TEXT, u1, 'SYSTEM_ANNOUNCEMENT', 'LOW', 'مرحباً بك!', 'شكراً لانضمامك لمنصة Xchange', NULL, NULL, true, NOW() - INTERVAL '30 days'),
    (gen_random_uuid()::TEXT, u2, 'SYSTEM_ANNOUNCEMENT', 'LOW', 'مرحباً بك!', 'شكراً لانضمامك لمنصة Xchange', NULL, NULL, true, NOW() - INTERVAL '30 days');

    RAISE NOTICE '✅ Created 20 notifications';

    -- =========== SUMMARY ===========
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════';
    RAISE NOTICE '           ✅ UAT FULL DATA CREATED SUCCESSFULLY              ';
    RAISE NOTICE '══════════════════════════════════════════════════════════════';
    RAISE NOTICE '  📦 30 Items (منتجات متنوعة)';
    RAISE NOTICE '  📋 15 Listings (إعلانات)';
    RAISE NOTICE '  🔨 3 Auctions with 15 bids (مزادات)';
    RAISE NOTICE '  🔄 5 Barter offers (عروض مقايضة)';
    RAISE NOTICE '  ⛓️  1 Barter chain (سلسلة مقايضة)';
    RAISE NOTICE '  📢 2 Reverse auctions with 5 bids (مناقصات)';
    RAISE NOTICE '  🛒 5 Orders (طلبات)';
    RAISE NOTICE '  💰 5 Transactions (معاملات)';
    RAISE NOTICE '  🔔 20 Notifications (إشعارات)';
    RAISE NOTICE '══════════════════════════════════════════════════════════════';

END $$;
