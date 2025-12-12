-- ============================================
-- Gold & Silver Marketplace - Complete Seed Data
-- بيانات تجريبية كاملة لسوق الذهب والفضة
-- ============================================
-- تنفيذ: انسخ هذا الملف إلى Supabase SQL Editor وقم بتنفيذه
-- ملاحظة: تأكد من وجود مستخدمين في جدول users قبل التنفيذ
-- ============================================

-- ============================================
-- خطوة 1: الحصول على معرفات المستخدمين
-- Step 1: Get User IDs
-- ============================================
DO $$
DECLARE
    user1_id TEXT;
    user2_id TEXT;
    user3_id TEXT;
    user4_id TEXT;
    user5_id TEXT;

    -- Gold items
    gold_item1_id TEXT;
    gold_item2_id TEXT;
    gold_item3_id TEXT;
    gold_item4_id TEXT;
    gold_item5_id TEXT;
    gold_item6_id TEXT;
    gold_item7_id TEXT;
    gold_item8_id TEXT;
    gold_item9_id TEXT;
    gold_item10_id TEXT;

    -- Silver items
    silver_item1_id TEXT;
    silver_item2_id TEXT;
    silver_item3_id TEXT;
    silver_item4_id TEXT;
    silver_item5_id TEXT;
    silver_item6_id TEXT;
    silver_item7_id TEXT;
    silver_item8_id TEXT;
    silver_item9_id TEXT;
    silver_item10_id TEXT;

    -- Partners
    gold_partner1_id TEXT;
    gold_partner2_id TEXT;
    silver_partner1_id TEXT;
    silver_partner2_id TEXT;
BEGIN
    -- Get 5 users (or create if needed)
    SELECT id INTO user1_id FROM users ORDER BY created_at LIMIT 1;
    SELECT id INTO user2_id FROM users ORDER BY created_at OFFSET 1 LIMIT 1;
    SELECT id INTO user3_id FROM users ORDER BY created_at OFFSET 2 LIMIT 1;
    SELECT id INTO user4_id FROM users ORDER BY created_at OFFSET 3 LIMIT 1;
    SELECT id INTO user5_id FROM users ORDER BY created_at OFFSET 4 LIMIT 1;

    -- Fallback: Use first user for all if not enough users
    IF user2_id IS NULL THEN user2_id := user1_id; END IF;
    IF user3_id IS NULL THEN user3_id := user1_id; END IF;
    IF user4_id IS NULL THEN user4_id := user1_id; END IF;
    IF user5_id IS NULL THEN user5_id := user1_id; END IF;

    IF user1_id IS NULL THEN
        RAISE EXCEPTION 'لا يوجد مستخدمين في قاعدة البيانات. يرجى إنشاء مستخدم واحد على الأقل أولاً.';
    END IF;

    RAISE NOTICE 'Using users: %, %, %, %, %', user1_id, user2_id, user3_id, user4_id, user5_id;

    -- ============================================
    -- خطوة 2: أسعار الذهب
    -- Step 2: Gold Prices
    -- ============================================
    DELETE FROM gold_prices WHERE source = 'seed';

    INSERT INTO gold_prices (id, karat, buy_price, sell_price, source) VALUES
        (gen_random_uuid()::text, 'K24', 4800, 4850, 'seed'),
        (gen_random_uuid()::text, 'K21', 4200, 4250, 'seed'),
        (gen_random_uuid()::text, 'K18', 3600, 3650, 'seed');

    RAISE NOTICE 'Gold prices inserted';

    -- ============================================
    -- خطوة 3: شركاء الذهب
    -- Step 3: Gold Partners
    -- ============================================
    -- Check if partners exist
    SELECT id INTO gold_partner1_id FROM gold_partners WHERE name = 'Gold House Cairo' LIMIT 1;
    SELECT id INTO gold_partner2_id FROM gold_partners WHERE name = 'Al-Sagha Alexandria' LIMIT 1;

    IF gold_partner1_id IS NULL THEN
        INSERT INTO gold_partners (name, name_ar, shop_type, address, governorate, phone, is_verified, offers_certification, certification_fee, offers_pickup)
        VALUES ('Gold House Cairo', 'بيت الذهب القاهرة', 'GOLD_SHOP', 'شارع الصاغة، الحسين', 'القاهرة', '01011111111', true, true, 50, true)
        RETURNING id INTO gold_partner1_id;
    END IF;

    IF gold_partner2_id IS NULL THEN
        INSERT INTO gold_partners (name, name_ar, shop_type, address, governorate, phone, is_verified, offers_certification, certification_fee, offers_pickup)
        VALUES ('Al-Sagha Alexandria', 'الصاغة الإسكندرية', 'GOLD_SHOP', 'شارع النبي دانيال، وسط البلد', 'الإسكندرية', '01022222222', true, true, 40, true)
        RETURNING id INTO gold_partner2_id;
    END IF;

    RAISE NOTICE 'Gold partners ready: %, %', gold_partner1_id, gold_partner2_id;

    -- ============================================
    -- خطوة 4: قطع الذهب (10 قطع متنوعة)
    -- Step 4: Gold Items (10 diverse items)
    -- ============================================
    DELETE FROM gold_items WHERE title LIKE '%SEED%' OR title LIKE '%تجريبي%';

    -- Item 1: خاتم عيار 21
    INSERT INTO gold_items (seller_id, title, description, category, karat, weight_grams, condition, asking_price_per_gram, total_asking_price, gold_price_at_listing, governorate, city, verification_level, status, allow_barter)
    VALUES (user1_id, 'خاتم ذهب عيار 21 كلاسيكي', 'خاتم ذهب أصلي عيار 21، تصميم كلاسيكي أنيق، مناسب للخطوبة أو هدية. حالة ممتازة.', 'RING', 'K21', 5.5, 'LIKE_NEW', 4300, 23650, 4250, 'القاهرة', 'مدينة نصر', 'VERIFIED', 'ACTIVE', true)
    RETURNING id INTO gold_item1_id;

    -- Item 2: سلسلة عيار 18
    INSERT INTO gold_items (seller_id, title, description, category, karat, weight_grams, condition, asking_price_per_gram, total_asking_price, gold_price_at_listing, governorate, city, verification_level, status, allow_barter)
    VALUES (user2_id, 'سلسلة ذهب عيار 18 إيطالي', 'سلسلة ذهب إيطالي عيار 18، طول 50 سم، تصميم حديث. استعمال خفيف.', 'NECKLACE', 'K18', 8.2, 'GOOD', 3700, 30340, 3650, 'الإسكندرية', 'سموحة', 'BASIC', 'ACTIVE', false)
    RETURNING id INTO gold_item2_id;

    -- Item 3: إسورة عيار 21
    INSERT INTO gold_items (seller_id, title, description, category, karat, weight_grams, condition, asking_price_per_gram, total_asking_price, gold_price_at_listing, governorate, city, verification_level, status, allow_barter)
    VALUES (user3_id, 'إسورة ذهب عيار 21 منقوشة', 'إسورة ذهب عيار 21 بنقوش عربية جميلة، وزن ثقيل. حالة ممتازة.', 'BRACELET', 'K21', 15.0, 'LIKE_NEW', 4280, 64200, 4250, 'الجيزة', 'الدقي', 'CERTIFIED', 'ACTIVE', true)
    RETURNING id INTO gold_item3_id;

    -- Item 4: طقم كامل عيار 21
    INSERT INTO gold_items (seller_id, title, description, category, karat, weight_grams, condition, asking_price_per_gram, total_asking_price, gold_price_at_listing, governorate, city, verification_level, status, allow_barter)
    VALUES (user1_id, 'طقم ذهب عيار 21 كامل (سلسلة + حلق + إسورة)', 'طقم ذهب كامل عيار 21 يشمل سلسلة وحلق وإسورة. تصميم موحد راقي. مناسب للمناسبات.', 'SET', 'K21', 28.5, 'GOOD', 4320, 123120, 4250, 'القاهرة', 'المعادي', 'VERIFIED', 'ACTIVE', true)
    RETURNING id INTO gold_item4_id;

    -- Item 5: سبيكة عيار 24
    INSERT INTO gold_items (seller_id, title, description, category, karat, weight_grams, condition, asking_price_per_gram, total_asking_price, gold_price_at_listing, governorate, city, verification_level, status, allow_barter)
    VALUES (user4_id, 'سبيكة ذهب عيار 24 - 10 جرام', 'سبيكة ذهب خالص عيار 24، وزن 10 جرام بالضبط. مختومة ومعتمدة. مثالية للاستثمار.', 'BAR', 'K24', 10.0, 'NEW', 4900, 49000, 4850, 'القاهرة', 'مصر الجديدة', 'CERTIFIED', 'ACTIVE', false)
    RETURNING id INTO gold_item5_id;

    -- Item 6: حلق عيار 18
    INSERT INTO gold_items (seller_id, title, description, category, karat, weight_grams, condition, asking_price_per_gram, total_asking_price, gold_price_at_listing, governorate, city, verification_level, status, allow_barter)
    VALUES (user2_id, 'حلق ذهب عيار 18 مع لؤلؤ', 'حلق ذهب عيار 18 مرصع بلؤلؤ طبيعي. تصميم أنيق للمناسبات.', 'EARRING', 'K18', 4.0, 'LIKE_NEW', 3750, 15000, 3650, 'الإسكندرية', 'المنتزه', 'VERIFIED', 'ACTIVE', true)
    RETURNING id INTO gold_item6_id;

    -- Item 7: خاتم عيار 24
    INSERT INTO gold_items (seller_id, title, description, category, karat, weight_grams, condition, asking_price_per_gram, total_asking_price, gold_price_at_listing, governorate, city, verification_level, status, allow_barter)
    VALUES (user5_id, 'خاتم ذهب عيار 24 للرجال', 'خاتم ذهب خالص عيار 24، تصميم رجالي بسيط وأنيق.', 'RING', 'K24', 7.0, 'NEW', 4920, 34440, 4850, 'القاهرة', 'التجمع الخامس', 'BASIC', 'ACTIVE', false)
    RETURNING id INTO gold_item7_id;

    -- Item 8: سلسلة عيار 21 مع تعليقة
    INSERT INTO gold_items (seller_id, title, description, category, karat, weight_grams, condition, asking_price_per_gram, total_asking_price, gold_price_at_listing, governorate, city, verification_level, status, allow_barter)
    VALUES (user3_id, 'سلسلة ذهب عيار 21 مع تعليقة قلب', 'سلسلة ذهب عيار 21 مع تعليقة على شكل قلب. هدية رومانسية مثالية.', 'NECKLACE', 'K21', 6.8, 'LIKE_NEW', 4350, 29580, 4250, 'الجيزة', '6 أكتوبر', 'VERIFIED', 'ACTIVE', true)
    RETURNING id INTO gold_item8_id;

    -- Item 9: عملة ذهب قديمة
    INSERT INTO gold_items (seller_id, title, description, category, karat, weight_grams, condition, asking_price_per_gram, total_asking_price, gold_price_at_listing, governorate, city, verification_level, status, allow_barter)
    VALUES (user4_id, 'عملة ذهب جنيه مصري قديم', 'جنيه ذهب مصري قديم، قطعة نادرة للمهتمين بالعملات. حالة جيدة جداً.', 'COIN', 'K21', 8.0, 'ANTIQUE', 5000, 40000, 4250, 'القاهرة', 'وسط البلد', 'CERTIFIED', 'ACTIVE', false)
    RETURNING id INTO gold_item9_id;

    -- Item 10: أنتيك - سوار قديم
    INSERT INTO gold_items (seller_id, title, description, category, karat, weight_grams, condition, asking_price_per_gram, total_asking_price, gold_price_at_listing, governorate, city, verification_level, status, allow_barter)
    VALUES (user1_id, 'سوار ذهب أنتيك من الأربعينات', 'سوار ذهب أصلي من الأربعينات، تصميم فريد ونادر. قطعة متحفية.', 'BRACELET', 'K18', 22.0, 'ANTIQUE', 4200, 92400, 3650, 'القاهرة', 'الزمالك', 'CERTIFIED', 'ACTIVE', true)
    RETURNING id INTO gold_item10_id;

    RAISE NOTICE 'Gold items inserted: 10 items';

    -- ============================================
    -- خطوة 5: معاملات الذهب (5 معاملات)
    -- Step 5: Gold Transactions (5 transactions)
    -- ============================================
    DELETE FROM gold_transactions WHERE admin_notes LIKE '%SEED%';

    -- Transaction 1: مكتملة
    INSERT INTO gold_transactions (item_id, buyer_id, seller_id, gold_price_at_transaction, item_price, buyer_commission, seller_commission, total_amount, status, delivery_method, escrow_status, completed_at, admin_notes)
    VALUES (gold_item1_id, user2_id, user1_id, 4250, 23650, 165.55, 165.55, 23815.55, 'COMPLETED', 'PARTNER_PICKUP', 'RELEASED', NOW() - INTERVAL '3 days', 'SEED DATA');

    -- Transaction 2: في انتظار الضمان
    INSERT INTO gold_transactions (item_id, buyer_id, seller_id, gold_price_at_transaction, item_price, buyer_commission, seller_commission, total_amount, status, delivery_method, escrow_status, admin_notes)
    VALUES (gold_item2_id, user3_id, user2_id, 3650, 30340, 212.38, 212.38, 30552.38, 'ESCROW_HELD', 'HOME_DELIVERY', 'HELD', 'SEED DATA');

    -- Transaction 3: تم الشحن
    INSERT INTO gold_transactions (item_id, buyer_id, seller_id, gold_price_at_transaction, item_price, buyer_commission, seller_commission, total_amount, status, delivery_method, escrow_status, admin_notes)
    VALUES (gold_item5_id, user1_id, user4_id, 4850, 49000, 343, 343, 49343, 'SHIPPED', 'PARTNER_PICKUP', 'HELD', 'SEED DATA');

    -- Transaction 4: في مرحلة الفحص
    INSERT INTO gold_transactions (item_id, buyer_id, seller_id, gold_price_at_transaction, item_price, buyer_commission, seller_commission, total_amount, status, delivery_method, escrow_status, inspection_started_at, inspection_ends_at, admin_notes)
    VALUES (gold_item6_id, user4_id, user2_id, 3650, 15000, 105, 105, 15105, 'INSPECTION', 'BUYER_PICKUP', 'HELD', NOW() - INTERVAL '1 day', NOW() + INTERVAL '1 day', 'SEED DATA');

    -- Transaction 5: معلقة
    INSERT INTO gold_transactions (item_id, buyer_id, seller_id, gold_price_at_transaction, item_price, buyer_commission, seller_commission, total_amount, status, delivery_method, escrow_status, admin_notes)
    VALUES (gold_item7_id, user3_id, user5_id, 4850, 34440, 241.08, 241.08, 34681.08, 'PENDING', 'HOME_DELIVERY', 'PENDING', 'SEED DATA');

    RAISE NOTICE 'Gold transactions inserted: 5 transactions';

    -- ============================================
    -- خطوة 6: أسعار الفضة
    -- Step 6: Silver Prices
    -- ============================================
    DELETE FROM silver_prices WHERE source = 'seed';

    INSERT INTO silver_prices (id, purity, buy_price, sell_price, source) VALUES
        (gen_random_uuid()::text, 'S999', 60, 65, 'seed'),
        (gen_random_uuid()::text, 'S925', 50, 55, 'seed'),
        (gen_random_uuid()::text, 'S900', 45, 50, 'seed'),
        (gen_random_uuid()::text, 'S800', 40, 45, 'seed');

    RAISE NOTICE 'Silver prices inserted';

    -- ============================================
    -- خطوة 7: شركاء الفضة
    -- Step 7: Silver Partners
    -- ============================================
    SELECT id INTO silver_partner1_id FROM silver_partners WHERE name = 'Silver House Cairo' LIMIT 1;
    SELECT id INTO silver_partner2_id FROM silver_partners WHERE name = 'Sterling Silver Alex' LIMIT 1;

    IF silver_partner1_id IS NULL THEN
        INSERT INTO silver_partners (name, name_ar, shop_type, address, governorate, phone, is_verified, offers_certification, certification_fee, offers_pickup)
        VALUES ('Silver House Cairo', 'بيت الفضة القاهرة', 'SILVER_SHOP', 'شارع التحرير، وسط البلد', 'القاهرة', '01033333333', true, true, 30, true)
        RETURNING id INTO silver_partner1_id;
    END IF;

    IF silver_partner2_id IS NULL THEN
        INSERT INTO silver_partners (name, name_ar, shop_type, address, governorate, phone, is_verified, offers_certification, certification_fee, offers_pickup)
        VALUES ('Sterling Silver Alex', 'ستيرلينج سيلفر الإسكندرية', 'JEWELRY_SHOP', 'شارع أبو قير، محطة الرمل', 'الإسكندرية', '01044444444', true, true, 25, true)
        RETURNING id INTO silver_partner2_id;
    END IF;

    RAISE NOTICE 'Silver partners ready: %, %', silver_partner1_id, silver_partner2_id;

    -- ============================================
    -- خطوة 8: قطع الفضة (10 قطع متنوعة)
    -- Step 8: Silver Items (10 diverse items)
    -- ============================================
    DELETE FROM silver_items WHERE title LIKE '%SEED%' OR title LIKE '%تجريبي%';

    -- Item 1: خاتم فضة إسترليني
    INSERT INTO silver_items (seller_id, title, description, category, purity, weight_grams, condition, asking_price_per_gram, total_asking_price, silver_price_at_listing, governorate, city, verification_level, status, allow_barter, allow_gold_barter)
    VALUES (user1_id, 'خاتم فضة إسترليني 925 بحجر الزركون', 'خاتم فضة إسترليني عيار 925 مرصع بحجر الزركون الأبيض. تصميم عصري أنيق.', 'RING', 'S925', 8.5, 'NEW', 58, 493, 55, 'القاهرة', 'مدينة نصر', 'VERIFIED', 'ACTIVE', true, true)
    RETURNING id INTO silver_item1_id;

    -- Item 2: سلسلة فضة 999
    INSERT INTO silver_items (seller_id, title, description, category, purity, weight_grams, condition, asking_price_per_gram, total_asking_price, silver_price_at_listing, governorate, city, verification_level, status, allow_barter, allow_gold_barter)
    VALUES (user2_id, 'سلسلة فضة نقية 999 إيطالي', 'سلسلة فضة نقية عيار 999، صناعة إيطالية. طول 60 سم، سمك 3 مم.', 'NECKLACE', 'S999', 25.0, 'LIKE_NEW', 68, 1700, 65, 'الإسكندرية', 'سموحة', 'CERTIFIED', 'ACTIVE', true, false)
    RETURNING id INTO silver_item2_id;

    -- Item 3: إسورة فضة 925 منقوشة
    INSERT INTO silver_items (seller_id, title, description, category, purity, weight_grams, condition, asking_price_per_gram, total_asking_price, silver_price_at_listing, governorate, city, verification_level, status, allow_barter, allow_gold_barter)
    VALUES (user3_id, 'إسورة فضة إسترليني منقوشة يدوياً', 'إسورة فضة 925 بنقوش يدوية فرعونية. قطعة فنية مميزة.', 'BRACELET', 'S925', 35.0, 'GOOD', 60, 2100, 55, 'الجيزة', 'الهرم', 'VERIFIED', 'ACTIVE', true, true)
    RETURNING id INTO silver_item3_id;

    -- Item 4: طقم فضة كامل
    INSERT INTO silver_items (seller_id, title, description, category, purity, weight_grams, condition, asking_price_per_gram, total_asking_price, silver_price_at_listing, governorate, city, verification_level, status, allow_barter, allow_gold_barter)
    VALUES (user4_id, 'طقم فضة 925 كامل (سلسلة + حلق + خاتم)', 'طقم فضة إسترليني كامل بتصميم موحد. مثالي للهدايا والمناسبات.', 'SET', 'S925', 45.0, 'NEW', 62, 2790, 55, 'القاهرة', 'المعادي', 'CERTIFIED', 'ACTIVE', true, true)
    RETURNING id INTO silver_item4_id;

    -- Item 5: سبيكة فضة 999
    INSERT INTO silver_items (seller_id, title, description, category, purity, weight_grams, condition, asking_price_per_gram, total_asking_price, silver_price_at_listing, governorate, city, verification_level, status, allow_barter, allow_gold_barter)
    VALUES (user5_id, 'سبيكة فضة نقية 999 - 100 جرام', 'سبيكة فضة نقية عيار 999، وزن 100 جرام. مختومة ومعتمدة للاستثمار.', 'BAR', 'S999', 100.0, 'NEW', 70, 7000, 65, 'القاهرة', 'مصر الجديدة', 'CERTIFIED', 'ACTIVE', false, false)
    RETURNING id INTO silver_item5_id;

    -- Item 6: حلق فضة مع فيروز
    INSERT INTO silver_items (seller_id, title, description, category, purity, weight_grams, condition, asking_price_per_gram, total_asking_price, silver_price_at_listing, governorate, city, verification_level, status, allow_barter, allow_gold_barter)
    VALUES (user1_id, 'حلق فضة 925 مع حجر الفيروز', 'حلق فضة إسترليني مرصع بحجر الفيروز الطبيعي. تصميم بوهيمي جميل.', 'EARRING', 'S925', 6.0, 'LIKE_NEW', 65, 390, 55, 'الإسكندرية', 'المنتزه', 'BASIC', 'ACTIVE', true, false)
    RETURNING id INTO silver_item6_id;

    -- Item 7: تعليقة فضة بتصميم فرعوني
    INSERT INTO silver_items (seller_id, title, description, category, purity, weight_grams, condition, asking_price_per_gram, total_asking_price, silver_price_at_listing, governorate, city, verification_level, status, allow_barter, allow_gold_barter)
    VALUES (user2_id, 'تعليقة فضة 925 عين حورس', 'تعليقة فضة إسترليني على شكل عين حورس الفرعونية. رمز الحماية والحظ.', 'PENDANT', 'S925', 12.0, 'NEW', 58, 696, 55, 'الأقصر', 'وسط المدينة', 'VERIFIED', 'ACTIVE', true, true)
    RETURNING id INTO silver_item7_id;

    -- Item 8: خلخال فضة
    INSERT INTO silver_items (seller_id, title, description, category, purity, weight_grams, condition, asking_price_per_gram, total_asking_price, silver_price_at_listing, governorate, city, verification_level, status, allow_barter, allow_gold_barter)
    VALUES (user3_id, 'خلخال فضة 925 مع جلاجل', 'خلخال فضة إسترليني مع جلاجل صغيرة. تصميم هندي تقليدي.', 'ANKLET', 'S925', 18.0, 'GOOD', 56, 1008, 55, 'القاهرة', 'الدقي', 'BASIC', 'ACTIVE', true, false)
    RETURNING id INTO silver_item8_id;

    -- Item 9: عملة فضة قديمة
    INSERT INTO silver_items (seller_id, title, description, category, purity, weight_grams, condition, asking_price_per_gram, total_asking_price, silver_price_at_listing, governorate, city, verification_level, status, allow_barter, allow_gold_barter)
    VALUES (user4_id, 'عملة فضة مصرية قديمة - 20 قرش 1937', 'عملة فضة مصرية نادرة من عهد الملك فاروق. حالة ممتازة للمقتنين.', 'COIN', 'S900', 14.0, 'ANTIQUE', 100, 1400, 50, 'القاهرة', 'وسط البلد', 'CERTIFIED', 'ACTIVE', false, false)
    RETURNING id INTO silver_item9_id;

    -- Item 10: قطعة أنتيك - صينية فضة
    INSERT INTO silver_items (seller_id, title, description, category, purity, weight_grams, condition, asking_price_per_gram, total_asking_price, silver_price_at_listing, governorate, city, verification_level, status, allow_barter, allow_gold_barter)
    VALUES (user5_id, 'قطعة أنتيك - ملعقة فضة عثمانية', 'ملعقة فضة عثمانية أصلية من القرن 19. قطعة نادرة للمقتنين.', 'ANTIQUE', 'S800', 85.0, 'ANTIQUE', 80, 6800, 45, 'القاهرة', 'الزمالك', 'CERTIFIED', 'ACTIVE', true, true)
    RETURNING id INTO silver_item10_id;

    RAISE NOTICE 'Silver items inserted: 10 items';

    -- ============================================
    -- خطوة 9: معاملات الفضة (5 معاملات)
    -- Step 9: Silver Transactions (5 transactions)
    -- ============================================
    DELETE FROM silver_transactions WHERE admin_notes LIKE '%SEED%';

    -- Transaction 1: مكتملة
    INSERT INTO silver_transactions (item_id, buyer_id, seller_id, silver_price_at_transaction, item_price, buyer_commission, seller_commission, total_amount, status, delivery_method, escrow_status, completed_at, admin_notes)
    VALUES (silver_item1_id, user3_id, user1_id, 55, 493, 9.86, 9.86, 502.86, 'COMPLETED', 'PARTNER_PICKUP', 'RELEASED', NOW() - INTERVAL '2 days', 'SEED DATA');

    -- Transaction 2: في انتظار الضمان
    INSERT INTO silver_transactions (item_id, buyer_id, seller_id, silver_price_at_transaction, item_price, buyer_commission, seller_commission, total_amount, status, delivery_method, escrow_status, admin_notes)
    VALUES (silver_item2_id, user4_id, user2_id, 65, 1700, 34, 34, 1734, 'ESCROW_HELD', 'HOME_DELIVERY', 'HELD', 'SEED DATA');

    -- Transaction 3: تم الشحن
    INSERT INTO silver_transactions (item_id, buyer_id, seller_id, silver_price_at_transaction, item_price, buyer_commission, seller_commission, total_amount, status, delivery_method, escrow_status, admin_notes)
    VALUES (silver_item4_id, user1_id, user4_id, 55, 2790, 55.8, 55.8, 2845.8, 'SHIPPED', 'PARTNER_PICKUP', 'HELD', 'SEED DATA');

    -- Transaction 4: في مرحلة الفحص
    INSERT INTO silver_transactions (item_id, buyer_id, seller_id, silver_price_at_transaction, item_price, buyer_commission, seller_commission, total_amount, status, delivery_method, escrow_status, inspection_started_at, inspection_ends_at, admin_notes)
    VALUES (silver_item5_id, user2_id, user5_id, 65, 7000, 140, 140, 7140, 'INSPECTION', 'BUYER_PICKUP', 'HELD', NOW() - INTERVAL '12 hours', NOW() + INTERVAL '36 hours', 'SEED DATA');

    -- Transaction 5: معلقة
    INSERT INTO silver_transactions (item_id, buyer_id, seller_id, silver_price_at_transaction, item_price, buyer_commission, seller_commission, total_amount, status, delivery_method, escrow_status, admin_notes)
    VALUES (silver_item7_id, user5_id, user2_id, 55, 696, 13.92, 13.92, 709.92, 'PENDING', 'HOME_DELIVERY', 'PENDING', 'SEED DATA');

    RAISE NOTICE 'Silver transactions inserted: 5 transactions';

    -- ============================================
    -- خطوة 10: تحديث إحصائيات المستخدمين
    -- Step 10: Update User Statistics
    -- ============================================
    -- يمكن إضافة تحديثات للإحصائيات هنا إذا لزم الأمر

    RAISE NOTICE '✅ تم إنشاء جميع البيانات التجريبية بنجاح!';
    RAISE NOTICE '   - Gold Items: 10';
    RAISE NOTICE '   - Gold Transactions: 5';
    RAISE NOTICE '   - Silver Items: 10';
    RAISE NOTICE '   - Silver Transactions: 5';

END $$;

-- ============================================
-- التحقق من البيانات
-- Verify Data
-- ============================================
SELECT 'Gold Items' as type, COUNT(*) as count FROM gold_items WHERE status = 'ACTIVE'
UNION ALL
SELECT 'Gold Transactions', COUNT(*) FROM gold_transactions
UNION ALL
SELECT 'Gold Partners', COUNT(*) FROM gold_partners WHERE is_active = true
UNION ALL
SELECT 'Gold Prices', COUNT(*) FROM gold_prices
UNION ALL
SELECT 'Silver Items', COUNT(*) FROM silver_items WHERE status = 'ACTIVE'
UNION ALL
SELECT 'Silver Transactions', COUNT(*) FROM silver_transactions
UNION ALL
SELECT 'Silver Partners', COUNT(*) FROM silver_partners WHERE is_active = true
UNION ALL
SELECT 'Silver Prices', COUNT(*) FROM silver_prices;
