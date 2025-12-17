-- =====================================================
-- UAT SEED DATA - بيانات اختبار قبول المستخدم
-- Xchange Egypt Platform
-- =====================================================
-- Run this in Supabase SQL Editor
-- كلمة المرور لجميع الحسابات: Test@1234
-- Password hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi
-- =====================================================

DO $$
DECLARE
    -- User IDs
    v_user1_id TEXT;
    v_user2_id TEXT;
    v_user3_id TEXT;
    v_user4_id TEXT;
    v_user5_id TEXT;
    v_user6_id TEXT;
    v_user7_id TEXT;
    v_user8_id TEXT;
    v_user9_id TEXT;
    v_user10_id TEXT;

    -- Category IDs
    v_electronics_id TEXT;
    v_mobile_id TEXT;
    v_computers_id TEXT;
    v_furniture_id TEXT;
    v_vehicles_id TEXT;
    v_home_appliances_id TEXT;

    -- Item IDs
    v_item1_1_id TEXT; -- User1 iPhone
    v_item1_2_id TEXT; -- User1 MacBook
    v_item2_1_id TEXT; -- User2 Samsung
    v_item2_2_id TEXT; -- User2 Sofa
    v_item3_1_id TEXT; -- User3 Camera
    v_item3_2_id TEXT; -- User3 Antiques
    v_item6_1_id TEXT; -- User6 Laptops tender
    v_item8_1_id TEXT; -- User8 iPhone 14
    v_item8_2_id TEXT; -- User8 Xiaomi
    v_item9_1_id TEXT; -- User9 Toyota
    v_item10_1_id TEXT; -- User10 Wanted fridge

    -- Listing IDs
    v_listing1_id TEXT;
    v_listing2_id TEXT;
    v_auction_listing1_id TEXT;
    v_auction_listing2_id TEXT;
    v_mobile_listing1_id TEXT;

    -- Auction IDs
    v_auction1_id TEXT;

    -- Reverse Auction ID
    v_reverse_auction_id TEXT;

    -- Barter IDs
    v_barter_offer1_id TEXT;
    v_barter_offer2_id TEXT;
    v_barter_offer3_id TEXT;
    v_barter_chain_id TEXT;

    -- Order IDs
    v_order1_id TEXT;
    v_order2_id TEXT;

    -- Shipping Address IDs
    v_addr10_id TEXT;

    -- Password hash for Test@1234
    v_password_hash TEXT := '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi';

BEGIN
    -- =====================================================
    -- 1. CREATE TEST USERS (test1-test10@xchange.eg)
    -- =====================================================
    RAISE NOTICE '👥 Creating test users...';

    -- User 1: أحمد التاجر (Direct Sales - Electronics)
    INSERT INTO users (id, email, password_hash, full_name, phone, user_type, business_name, governorate, city, address, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'test1@xchange.eg', v_password_hash, 'أحمد التاجر', '+201111111111', 'BUSINESS', 'متجر أحمد للإلكترونيات', 'Cairo', 'Nasr City', '15 شارع عباس العقاد، مدينة نصر', true, true, 4.8, 45, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_user1_id;

    -- User 2: سارة المقايضة (Barter)
    INSERT INTO users (id, email, password_hash, full_name, phone, user_type, governorate, city, address, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'test2@xchange.eg', v_password_hash, 'سارة المقايضة', '+201222222222', 'INDIVIDUAL', 'Alexandria', 'Smouha', '25 شارع فوزي معاذ، سموحة', true, true, 4.9, 32, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_user2_id;

    -- User 3: محمد المزادات (Auctions)
    INSERT INTO users (id, email, password_hash, full_name, phone, user_type, governorate, city, address, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'test3@xchange.eg', v_password_hash, 'محمد المزادات', '+201333333333', 'INDIVIDUAL', 'Giza', 'Dokki', '8 شارع التحرير، الدقي', true, true, 4.7, 28, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_user3_id;

    -- User 4: فاطمة الخردة (Scrap Market)
    INSERT INTO users (id, email, password_hash, full_name, phone, user_type, business_name, governorate, city, address, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'test4@xchange.eg', v_password_hash, 'فاطمة الخردة', '+201444444444', 'BUSINESS', 'مؤسسة الخردة الذهبية', 'Cairo', 'Shubra', '120 شارع شبرا الرئيسي', true, true, 4.6, 67, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_user4_id;

    -- User 5: كريم الفاخر (Luxury Items)
    INSERT INTO users (id, email, password_hash, full_name, phone, user_type, governorate, city, address, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'test5@xchange.eg', v_password_hash, 'كريم الفاخر', '+201555555555', 'INDIVIDUAL', 'Cairo', 'Zamalek', '5 شارع البرازيل، الزمالك', true, true, 5.0, 15, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_user5_id;

    -- User 6: نورا المناقصات (Tenders)
    INSERT INTO users (id, email, password_hash, full_name, phone, user_type, business_name, governorate, city, address, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'test6@xchange.eg', v_password_hash, 'نورا المناقصات', '+201666666666', 'BUSINESS', 'شركة نورا للتوريدات', 'Cairo', 'Maadi', '45 شارع 9، المعادي', true, true, 4.5, 22, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_user6_id;

    -- User 7: ياسر العقارات (Real Estate)
    INSERT INTO users (id, email, password_hash, full_name, phone, user_type, business_name, governorate, city, address, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'test7@xchange.eg', v_password_hash, 'ياسر العقارات', '+201777777777', 'BUSINESS', 'ياسر للعقارات', 'Cairo', 'New Cairo', '10 التجمع الخامس، القاهرة الجديدة', true, true, 4.4, 18, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_user7_id;

    -- User 8: منى الموبايلات (Mobiles)
    INSERT INTO users (id, email, password_hash, full_name, phone, user_type, business_name, governorate, city, address, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'test8@xchange.eg', v_password_hash, 'منى الموبايلات', '+201888888888', 'BUSINESS', 'منى موبايل', 'Alexandria', 'Sidi Gaber', '78 شارع سيدي جابر', true, true, 4.8, 56, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_user8_id;

    -- User 9: علي السيارات (Cars)
    INSERT INTO users (id, email, password_hash, full_name, phone, user_type, business_name, governorate, city, address, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'test9@xchange.eg', v_password_hash, 'علي السيارات', '+201999999999', 'BUSINESS', 'معرض علي للسيارات', 'Giza', '6th of October', 'المحور المركزي، 6 أكتوبر', true, true, 4.3, 89, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_user9_id;

    -- User 10: هدى المشتريات (Buyer)
    INSERT INTO users (id, email, password_hash, full_name, phone, user_type, governorate, city, address, email_verified, phone_verified, rating, total_reviews, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'test10@xchange.eg', v_password_hash, 'هدى المشتريات', '+201000000010', 'INDIVIDUAL', 'Cairo', 'Heliopolis', '30 شارع الميرغني، مصر الجديدة', true, true, 4.7, 12, NOW(), NOW())
    ON CONFLICT (email) DO UPDATE SET updated_at = NOW()
    RETURNING id INTO v_user10_id;

    -- Get user IDs if they already exist
    IF v_user1_id IS NULL THEN SELECT id INTO v_user1_id FROM users WHERE email = 'test1@xchange.eg'; END IF;
    IF v_user2_id IS NULL THEN SELECT id INTO v_user2_id FROM users WHERE email = 'test2@xchange.eg'; END IF;
    IF v_user3_id IS NULL THEN SELECT id INTO v_user3_id FROM users WHERE email = 'test3@xchange.eg'; END IF;
    IF v_user4_id IS NULL THEN SELECT id INTO v_user4_id FROM users WHERE email = 'test4@xchange.eg'; END IF;
    IF v_user5_id IS NULL THEN SELECT id INTO v_user5_id FROM users WHERE email = 'test5@xchange.eg'; END IF;
    IF v_user6_id IS NULL THEN SELECT id INTO v_user6_id FROM users WHERE email = 'test6@xchange.eg'; END IF;
    IF v_user7_id IS NULL THEN SELECT id INTO v_user7_id FROM users WHERE email = 'test7@xchange.eg'; END IF;
    IF v_user8_id IS NULL THEN SELECT id INTO v_user8_id FROM users WHERE email = 'test8@xchange.eg'; END IF;
    IF v_user9_id IS NULL THEN SELECT id INTO v_user9_id FROM users WHERE email = 'test9@xchange.eg'; END IF;
    IF v_user10_id IS NULL THEN SELECT id INTO v_user10_id FROM users WHERE email = 'test10@xchange.eg'; END IF;

    RAISE NOTICE '   ✅ Created 10 test users';

    -- =====================================================
    -- 2. GET CATEGORY IDs
    -- =====================================================
    RAISE NOTICE '📂 Getting categories...';

    SELECT id INTO v_electronics_id FROM categories WHERE slug = 'electronics' LIMIT 1;
    SELECT id INTO v_mobile_id FROM categories WHERE slug = 'mobile-phones' LIMIT 1;
    SELECT id INTO v_computers_id FROM categories WHERE slug = 'computers' LIMIT 1;
    SELECT id INTO v_furniture_id FROM categories WHERE slug = 'furniture' LIMIT 1;
    SELECT id INTO v_vehicles_id FROM categories WHERE slug = 'vehicles' LIMIT 1;
    SELECT id INTO v_home_appliances_id FROM categories WHERE slug = 'home-appliances' LIMIT 1;

    -- Fallback to first available category
    IF v_electronics_id IS NULL THEN SELECT id INTO v_electronics_id FROM categories WHERE is_active = true LIMIT 1; END IF;
    IF v_mobile_id IS NULL THEN v_mobile_id := v_electronics_id; END IF;
    IF v_computers_id IS NULL THEN v_computers_id := v_electronics_id; END IF;
    IF v_furniture_id IS NULL THEN v_furniture_id := v_electronics_id; END IF;
    IF v_vehicles_id IS NULL THEN v_vehicles_id := v_electronics_id; END IF;
    IF v_home_appliances_id IS NULL THEN v_home_appliances_id := v_electronics_id; END IF;

    -- =====================================================
    -- 3. CREATE SHIPPING ADDRESSES
    -- =====================================================
    RAISE NOTICE '📍 Creating shipping addresses...';

    -- Create shipping addresses for test users (only for users with address)
    INSERT INTO shipping_addresses (id, user_id, full_name, phone, address, city, governorate, is_default, created_at, updated_at)
    SELECT gen_random_uuid()::TEXT, id, full_name, phone, COALESCE(address, city || ', ' || governorate), city, governorate, true, NOW(), NOW()
    FROM users
    WHERE email LIKE 'test%@xchange.eg' AND city IS NOT NULL AND governorate IS NOT NULL
    ON CONFLICT DO NOTHING;

    SELECT id INTO v_addr10_id FROM shipping_addresses WHERE user_id = v_user10_id LIMIT 1;

    -- =====================================================
    -- 4. CREATE ITEMS
    -- =====================================================
    RAISE NOTICE '📦 Creating items...';

    -- User 1 Items (Direct Sales - Electronics)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user1_id, 'آيفون 15 برو ماكس 256GB جديد', 'آيفون 15 برو ماكس جديد بالكرتونة، ضمان أبل سنة كاملة. لون تيتانيوم طبيعي.', v_mobile_id, 'NEW', 75000, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400x400?text=iPhone15'], 'DIRECT_SALE', NOW(), NOW())
    RETURNING id INTO v_item1_1_id;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user1_id, 'ماك بوك اير M3 جديد', 'ماك بوك اير M3 شريحة جديدة، 8GB RAM، 256GB SSD. لون ميدنايت.', v_computers_id, 'NEW', 55000, 'Cairo', 'Nasr City', 'ACTIVE', ARRAY['https://placehold.co/400x400?text=MacBook'], 'DIRECT_SALE', NOW(), NOW())
    RETURNING id INTO v_item1_2_id;

    -- User 2 Items (Barter)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, desired_item_title, desired_item_description, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user2_id, 'سامسونج S24 Ultra للمقايضة', 'سامسونج جالاكسي S24 Ultra، 512GB، حالة ممتازة. أقايضه بآيفون 15 برو.', v_mobile_id, 'LIKE_NEW', 60000, 'Alexandria', 'Smouha', 'ACTIVE', ARRAY['https://placehold.co/400x400?text=S24Ultra'], 'BARTER', 'آيفون 15 برو أو أحدث', 'آيفون 15 برو أو برو ماكس بحالة جيدة', NOW(), NOW())
    RETURNING id INTO v_item2_1_id;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, desired_item_title, desired_item_description, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user2_id, 'أريكة جلد طبيعي للمقايضة', 'أريكة جلد طبيعي إيطالي، لون بني، حالة ممتازة. أبحث عن طاولة سفرة.', v_furniture_id, 'LIKE_NEW', 25000, 'Alexandria', 'Smouha', 'ACTIVE', ARRAY['https://placehold.co/400x400?text=Sofa'], 'BARTER', 'طاولة سفرة 6 أشخاص', 'طاولة سفرة خشب زان مع 6 كراسي', NOW(), NOW())
    RETURNING id INTO v_item2_2_id;

    -- User 3 Items (Auctions)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user3_id, 'كاميرا سوني A7IV - مزاد', 'كاميرا سوني A7IV مع عدسة 24-70mm، حالة ممتازة. المزاد يبدأ من 80,000 جنيه.', v_electronics_id, 'LIKE_NEW', 120000, 'Giza', 'Dokki', 'ACTIVE', ARRAY['https://placehold.co/400x400?text=SonyA7'], 'AUCTION', NOW(), NOW())
    RETURNING id INTO v_item3_1_id;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user3_id, 'أنتيكات مصرية قديمة - مزاد', 'مجموعة أنتيكات مصرية من الثلاثينات، تشمل ساعة حائط ومرآة.', v_furniture_id, 'FAIR', 50000, 'Giza', 'Dokki', 'ACTIVE', ARRAY['https://placehold.co/400x400?text=Antiques'], 'AUCTION', NOW(), NOW())
    RETURNING id INTO v_item3_2_id;

    -- User 6 Item (Tender)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user6_id, 'مطلوب: 100 لابتوب Dell للشركة', 'نحتاج 100 لابتوب Dell أو HP للشركة، مواصفات: Core i5، 8GB RAM، 256GB SSD.', v_computers_id, 'NEW', 1500000, 'Cairo', 'Maadi', 'ACTIVE', ARRAY['https://placehold.co/400x400?text=Laptops'], 'DIRECT_BUY', NOW(), NOW())
    RETURNING id INTO v_item6_1_id;

    -- User 8 Items (Mobiles)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user8_id, 'آيفون 14 برو مستعمل', 'آيفون 14 برو 256GB، حالة ممتازة، بطارية 92%.', v_mobile_id, 'LIKE_NEW', 45000, 'Alexandria', 'Sidi Gaber', 'ACTIVE', ARRAY['https://placehold.co/400x400?text=iPhone14'], 'DIRECT_SALE', NOW(), NOW())
    RETURNING id INTO v_item8_1_id;

    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user8_id, 'شاومي 14 Ultra جديد', 'شاومي 14 Ultra 512GB جديد بالكرتونة.', v_mobile_id, 'NEW', 42000, 'Alexandria', 'Sidi Gaber', 'ACTIVE', ARRAY['https://placehold.co/400x400?text=Xiaomi14'], 'DIRECT_SALE', NOW(), NOW())
    RETURNING id INTO v_item8_2_id;

    -- User 9 Item (Vehicle for barter)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, desired_item_title, desired_item_description, vehicle_brand, vehicle_model, vehicle_year, vehicle_kilometers, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user9_id, 'تويوتا كامري 2022 للمقايضة', 'تويوتا كامري 2022، 30,000 كم، فل كامل. أقبل مقايضة بسيارة SUV.', v_vehicles_id, 'LIKE_NEW', 950000, 'Giza', '6th of October', 'ACTIVE', ARRAY['https://placehold.co/400x400?text=Camry'], 'BARTER', 'سيارة SUV', 'RAV4 أو Tucson أو ما يعادلها', 'Toyota', 'Camry', 2022, 30000, NOW(), NOW())
    RETURNING id INTO v_item9_1_id;

    -- User 10 Item (Looking to buy)
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, governorate, city, status, images, listing_type, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user10_id, 'أبحث عن ثلاجة سامسونج', 'أبحث عن ثلاجة سامسونج أو LG، 18-22 قدم، نوفروست.', v_home_appliances_id, 'GOOD', 25000, 'Cairo', 'Heliopolis', 'ACTIVE', ARRAY['https://placehold.co/400x400?text=Wanted'], 'DIRECT_BUY', NOW(), NOW())
    RETURNING id INTO v_item10_1_id;

    RAISE NOTICE '   ✅ Created 11 items';

    -- =====================================================
    -- 5. CREATE LISTINGS
    -- =====================================================
    RAISE NOTICE '📋 Creating listings...';

    -- Direct sale listings
    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_item1_1_id, v_user1_id, 'DIRECT_SALE', 75000, 'ACTIVE', NOW(), NOW())
    RETURNING id INTO v_listing1_id;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_item1_2_id, v_user1_id, 'DIRECT_SALE', 55000, 'ACTIVE', NOW(), NOW())
    RETURNING id INTO v_listing2_id;

    -- Auction listings
    INSERT INTO listings (id, item_id, user_id, listing_type, starting_bid, current_bid, bid_increment, reserve_price, status, end_date, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_item3_1_id, v_user3_id, 'AUCTION', 80000, 95000, 5000, 100000, 'ACTIVE', NOW() + INTERVAL '7 days', NOW(), NOW())
    RETURNING id INTO v_auction_listing1_id;

    INSERT INTO listings (id, item_id, user_id, listing_type, starting_bid, current_bid, bid_increment, status, end_date, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_item3_2_id, v_user3_id, 'AUCTION', 30000, 45000, 2000, 'ACTIVE', NOW() + INTERVAL '5 days', NOW(), NOW())
    RETURNING id INTO v_auction_listing2_id;

    -- Mobile listing
    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_item8_1_id, v_user8_id, 'DIRECT_SALE', 45000, 'ACTIVE', NOW(), NOW())
    RETURNING id INTO v_mobile_listing1_id;

    RAISE NOTICE '   ✅ Created 5 listings';

    -- =====================================================
    -- 6. CREATE AUCTION WITH BIDS
    -- =====================================================
    RAISE NOTICE '🔨 Creating auctions and bids...';

    INSERT INTO auctions (id, listing_id, starting_price, current_price, min_bid_increment, reserve_price, start_time, end_time, status, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_auction_listing1_id, 80000, 95000, 5000, 100000, NOW(), NOW() + INTERVAL '7 days', 'ACTIVE', NOW(), NOW())
    RETURNING id INTO v_auction1_id;

    -- Create bids
    INSERT INTO auction_bids (id, listing_id, auction_id, bidder_id, amount, status, created_at)
    VALUES
        (gen_random_uuid()::TEXT, v_auction_listing1_id, v_auction1_id, v_user5_id, 85000, 'OUTBID', NOW() - INTERVAL '2 hours'),
        (gen_random_uuid()::TEXT, v_auction_listing1_id, v_auction1_id, v_user10_id, 90000, 'OUTBID', NOW() - INTERVAL '1 hour'),
        (gen_random_uuid()::TEXT, v_auction_listing1_id, v_auction1_id, v_user5_id, 95000, 'ACTIVE', NOW() - INTERVAL '30 minutes');

    RAISE NOTICE '   ✅ Created auction with 3 bids';

    -- =====================================================
    -- 7. CREATE REVERSE AUCTION (TENDER)
    -- =====================================================
    RAISE NOTICE '📢 Creating reverse auction (tender)...';

    INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, quantity, max_budget, status, expires_at, governorate, city, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user6_id, 'مناقصة: 100 لابتوب للشركة', 'نحتاج 100 لابتوب Dell أو HP للشركة، مواصفات: Core i5، 8GB RAM، 256GB SSD.', v_computers_id, 100, 1500000, 'ACTIVE', NOW() + INTERVAL '14 days', 'Cairo', 'Maadi', NOW(), NOW())
    RETURNING id INTO v_reverse_auction_id;

    -- Create bids on tender
    INSERT INTO reverse_auction_bids (id, reverse_auction_id, seller_id, item_id, price_per_unit, total_price, delivery_days, warranty, notes, status, created_at, updated_at)
    VALUES
        (gen_random_uuid()::TEXT, v_reverse_auction_id, v_user1_id, v_item1_2_id, 14000, 1400000, 14, 'ضمان سنة', 'Dell Latitude 5540, original with warranty', 'ACTIVE', NOW(), NOW()),
        (gen_random_uuid()::TEXT, v_reverse_auction_id, v_user8_id, v_item8_2_id, 13500, 1350000, 10, 'ضمان سنتين', 'HP ProBook 450 G10, brand new', 'ACTIVE', NOW(), NOW());

    RAISE NOTICE '   ✅ Created tender with 2 bids';

    -- =====================================================
    -- 8. CREATE BARTER OFFERS
    -- =====================================================
    RAISE NOTICE '🔄 Creating barter offers...';

    -- Pending barter offer (Samsung for iPhone)
    INSERT INTO barter_offers (id, initiator_id, recipient_id, offered_item_ids, offered_bundle_value, status, notes, expires_at, market_type, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user2_id, v_user1_id, ARRAY[v_item2_1_id], 60000, 'PENDING', 'أعرض سامسونج S24 Ultra للمقايضة بآيفون 15 برو ماكس', NOW() + INTERVAL '7 days', 'NATIONAL', NOW(), NOW())
    RETURNING id INTO v_barter_offer1_id;

    -- Accepted barter offer
    INSERT INTO barter_offers (id, initiator_id, recipient_id, offered_item_ids, offered_bundle_value, status, notes, responded_at, market_type, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user9_id, v_user3_id, ARRAY[v_item9_1_id], 950000, 'ACCEPTED', 'مقايضة تويوتا كامري بمرسيدس', NOW(), 'NATIONAL', NOW(), NOW())
    RETURNING id INTO v_barter_offer2_id;

    -- Open barter offer
    INSERT INTO barter_offers (id, initiator_id, offered_item_ids, offered_bundle_value, status, is_open_offer, notes, expires_at, market_type, governorate, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, v_user2_id, ARRAY[v_item2_2_id], 25000, 'PENDING', true, 'أريكة جلد للمقايضة - أقبل عروض متنوعة', NOW() + INTERVAL '14 days', 'GOVERNORATE', 'Alexandria', NOW(), NOW())
    RETURNING id INTO v_barter_offer3_id;

    RAISE NOTICE '   ✅ Created 3 barter offers';

    -- =====================================================
    -- 9. CREATE BARTER CHAIN (SMART BARTER)
    -- =====================================================
    RAISE NOTICE '⛓️ Creating smart barter chain...';

    INSERT INTO barter_chains (id, chain_type, participant_count, match_score, algorithm_version, description, status, expires_at, created_at, updated_at)
    VALUES (gen_random_uuid()::TEXT, 'CYCLE', 3, 0.95, '2.0', 'سلسلة مقايضة: سارة ← أحمد ← منى ← سارة', 'PENDING', NOW() + INTERVAL '3 days', NOW(), NOW())
    RETURNING id INTO v_barter_chain_id;

    -- Add participants
    INSERT INTO barter_participants (id, chain_id, user_id, giving_item_id, receiving_item_id, position, status, responded_at, created_at, updated_at)
    VALUES
        (gen_random_uuid()::TEXT, v_barter_chain_id, v_user2_id, v_item2_1_id, v_item8_1_id, 0, 'ACCEPTED', NOW(), NOW(), NOW()),
        (gen_random_uuid()::TEXT, v_barter_chain_id, v_user1_id, v_item1_1_id, v_item2_1_id, 1, 'PENDING', NULL, NOW(), NOW()),
        (gen_random_uuid()::TEXT, v_barter_chain_id, v_user8_id, v_item8_1_id, v_item1_1_id, 2, 'PENDING', NULL, NOW(), NOW());

    RAISE NOTICE '   ✅ Created smart barter chain with 3 participants';

    -- =====================================================
    -- 10. CREATE ORDERS
    -- =====================================================
    RAISE NOTICE '🛒 Creating orders...';

    IF v_addr10_id IS NOT NULL THEN
        -- Completed order
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, shipped_at, delivered_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, v_user10_id, 'XCH-UAT-' || FLOOR(RANDOM() * 10000)::TEXT, 'DELIVERED', 45000, 100, 45100, v_addr10_id, 'CARD', 'PAY_' || FLOOR(EXTRACT(EPOCH FROM NOW()))::TEXT, NOW() - INTERVAL '5 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NOW(), NOW())
        RETURNING id INTO v_order1_id;

        INSERT INTO order_items (id, order_id, listing_id, seller_id, quantity, price, created_at)
        VALUES (gen_random_uuid()::TEXT, v_order1_id, v_mobile_listing1_id, v_user8_id, 1, 45000, NOW());

        -- Pending order
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, paid_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, v_user10_id, 'XCH-UAT-' || FLOOR(RANDOM() * 10000)::TEXT, 'PROCESSING', 55000, 150, 55150, v_addr10_id, 'COD', NOW(), NOW(), NOW())
        RETURNING id INTO v_order2_id;

        INSERT INTO order_items (id, order_id, listing_id, seller_id, quantity, price, created_at)
        VALUES (gen_random_uuid()::TEXT, v_order2_id, v_listing2_id, v_user1_id, 1, 55000, NOW());

        RAISE NOTICE '   ✅ Created 2 orders';
    END IF;

    -- =====================================================
    -- 11. CREATE NOTIFICATIONS
    -- =====================================================
    RAISE NOTICE '🔔 Creating notifications...';

    INSERT INTO notifications (id, user_id, type, priority, title, message, entity_type, entity_id, action_url, action_text, is_read, created_at, updated_at)
    VALUES
        -- Barter offer notification for User 1
        (gen_random_uuid()::TEXT, v_user1_id, 'BARTER_OFFER_RECEIVED', 'HIGH', '🔄 عرض مقايضة جديد!', 'سارة المقايضة تعرض Samsung S24 Ultra مقابل iPhone 15 Pro Max الخاص بك', 'BARTER_OFFER', v_barter_offer1_id, '/barter/respond/' || v_barter_offer1_id, 'عرض التفاصيل', false, NOW(), NOW()),

        -- Barter chain notification for User 1
        (gen_random_uuid()::TEXT, v_user1_id, 'BARTER_OFFER_RECEIVED', 'HIGH', '⛓️ فرصة مقايضة ذكية!', 'تم إيجاد سلسلة مقايضة مناسبة لمنتجك - 3 أطراف متطابقة', 'BARTER_CHAIN', v_barter_chain_id, '/barter/chains/' || v_barter_chain_id, 'عرض السلسلة', false, NOW(), NOW()),

        -- Barter chain notification for User 8
        (gen_random_uuid()::TEXT, v_user8_id, 'BARTER_OFFER_RECEIVED', 'HIGH', '⛓️ فرصة مقايضة ذكية!', 'تم إيجاد سلسلة مقايضة مناسبة - يمكنك الحصول على iPhone 15 Pro Max', 'BARTER_CHAIN', v_barter_chain_id, '/barter/chains/' || v_barter_chain_id, 'عرض السلسلة', false, NOW(), NOW()),

        -- Auction outbid notification for User 10
        (gen_random_uuid()::TEXT, v_user10_id, 'AUCTION_OUTBID', 'HIGH', '⚠️ تم تجاوز عرضك!', 'تم تجاوز عرضك على كاميرا سوني A7IV - العرض الحالي 95,000 جنيه', 'AUCTION', v_auction1_id, '/auctions/' || v_auction1_id, 'زيادة العرض', false, NOW(), NOW()),

        -- Tender bid notification for User 6
        (gen_random_uuid()::TEXT, v_user6_id, 'REVERSE_AUCTION_NEW_BID', 'MEDIUM', '📢 عروض جديدة على مناقصتك!', 'تم استلام 2 عروض على مناقصة اللابتوبات - راجع العروض', 'REVERSE_AUCTION', v_reverse_auction_id, '/tenders/' || v_reverse_auction_id, 'عرض العروض', false, NOW(), NOW()),

        -- Order shipped notification for User 10
        (gen_random_uuid()::TEXT, v_user10_id, 'TRANSACTION_SHIPPED', 'MEDIUM', '🚚 تم شحن طلبك!', 'طلبك MacBook Air M3 في الطريق إليك', 'ORDER', NULL, '/dashboard/orders', 'تتبع الطلب', false, NOW(), NOW()),

        -- Item sold notification for User 8
        (gen_random_uuid()::TEXT, v_user8_id, 'ITEM_SOLD', 'HIGH', '🎉 تم بيع منتجك!', 'تم بيع iPhone 14 Pro بمبلغ 45,000 جنيه', 'ORDER', NULL, '/dashboard/transactions', 'عرض التفاصيل', false, NOW(), NOW()),

        -- Barter match for User 2
        (gen_random_uuid()::TEXT, v_user2_id, 'BARTER_OFFER_RECEIVED', 'HIGH', '✨ تطابق مقايضة مثالي!', 'وجدنا منتجات تطابق ما تبحث عنه لمقايضة Samsung S24 Ultra', 'ITEM', v_item1_1_id, '/items/' || v_item1_1_id, 'عرض التطابق', false, NOW(), NOW()),

        -- Price drop alert
        (gen_random_uuid()::TEXT, v_user10_id, 'ITEM_PRICE_DROP', 'MEDIUM', '💰 انخفاض سعر!', 'انخفض سعر MacBook Air M3 من 60,000 إلى 55,000 جنيه', 'ITEM', v_item1_2_id, '/items/' || v_item1_2_id, 'شراء الآن', false, NOW(), NOW()),

        -- Review request
        (gen_random_uuid()::TEXT, v_user10_id, 'USER_REVIEW_RECEIVED', 'LOW', '⭐ قيّم تجربتك', 'كيف كانت تجربتك مع منى الموبايلات؟ شاركنا رأيك', 'USER', v_user8_id, '/users/' || v_user8_id || '/review', 'كتابة تقييم', false, NOW(), NOW());

    RAISE NOTICE '   ✅ Created 10 notifications';

    -- =====================================================
    -- 12. CREATE TRANSACTION RECORDS
    -- =====================================================
    RAISE NOTICE '💰 Creating transaction records...';

    INSERT INTO transactions (id, buyer_id, seller_id, listing_id, transaction_type, status, amount, platform_fee, seller_amount, payment_method, completed_at, created_at, updated_at)
    VALUES
        (gen_random_uuid()::TEXT, v_user10_id, v_user8_id, v_mobile_listing1_id, 'DIRECT_SALE', 'COMPLETED', 45000, 450, 44550, 'CARD', NOW() - INTERVAL '1 day', NOW(), NOW()),
        (gen_random_uuid()::TEXT, v_user10_id, v_user1_id, v_listing2_id, 'DIRECT_SALE', 'PENDING', 55000, 550, 54450, 'COD', NULL, NOW(), NOW());

    RAISE NOTICE '   ✅ Created 2 transaction records';

    -- =====================================================
    -- COMPLETE
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '                    ✅ UAT Data Created Successfully                    ';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '';
    RAISE NOTICE '  📊 Summary:';
    RAISE NOTICE '  ─────────────────────────────';
    RAISE NOTICE '  • 10 test users (test1-test10@xchange.eg)';
    RAISE NOTICE '  • 11 items';
    RAISE NOTICE '  • 5 listings';
    RAISE NOTICE '  • 1 auction with 3 bids';
    RAISE NOTICE '  • 1 tender with 2 bids';
    RAISE NOTICE '  • 3 barter offers';
    RAISE NOTICE '  • 1 smart barter chain';
    RAISE NOTICE '  • 2 orders';
    RAISE NOTICE '  • 10 notifications';
    RAISE NOTICE '';
    RAISE NOTICE '  🔐 Password for all accounts: Test@1234';
    RAISE NOTICE '';
    RAISE NOTICE '═══════════════════════════════════════════════════════════════════════';

END $$;

-- =====================================================
-- VERIFICATION QUERIES (Run separately to check data)
-- =====================================================

-- Check users
-- SELECT email, full_name, user_type, governorate FROM users WHERE email LIKE 'test%@xchange.eg' ORDER BY email;

-- Check items
-- SELECT title, listing_type, estimated_value, status FROM items WHERE seller_id IN (SELECT id FROM users WHERE email LIKE 'test%@xchange.eg');

-- Check notifications
-- SELECT u.email, n.title, n.type, n.is_read FROM notifications n JOIN users u ON n.user_id = u.id WHERE u.email LIKE 'test%@xchange.eg' ORDER BY n.created_at DESC;

-- Check barter offers
-- SELECT bo.status, bo.offered_bundle_value, u1.full_name as initiator, u2.full_name as recipient
-- FROM barter_offers bo
-- JOIN users u1 ON bo.initiator_id = u1.id
-- LEFT JOIN users u2 ON bo.recipient_id = u2.id;
