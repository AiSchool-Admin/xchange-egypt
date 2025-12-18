-- =====================================================
-- XChange Egypt - UAT Scenario 2: Auction Journey
-- رحلة المزاد - اختبار في Supabase SQL Editor
-- =====================================================
-- المستخدمون:
-- البائع: test4@xchange.eg (سارة)
-- المزايد 1: test5@xchange.eg (فاطمة)
-- المزايد 2: test6@xchange.eg (عمر)
-- المزايد 3: test7@xchange.eg (محمود)
-- =====================================================
-- Enums:
-- AuctionStatus: DRAFT, SCHEDULED, ACTIVE, ENDED, CANCELLED, COMPLETED
-- BidStatus: ACTIVE, OUTBID, WINNING, WON, LOST, CANCELLED
-- =====================================================

DO $$
DECLARE
    -- البائع
    v_seller_id TEXT;
    v_seller_name TEXT;
    v_seller_wallet_id TEXT;

    -- المزايدين
    v_bidder1_id TEXT;
    v_bidder1_name TEXT;
    v_bidder1_wallet_id TEXT;

    v_bidder2_id TEXT;
    v_bidder2_name TEXT;
    v_bidder2_wallet_id TEXT;

    v_bidder3_id TEXT;
    v_bidder3_name TEXT;
    v_bidder3_wallet_id TEXT;

    -- المنتج والمزاد
    v_category_id TEXT;
    v_item_id TEXT;
    v_listing_id TEXT;
    v_auction_id TEXT;

    -- المزايدات
    v_bid1_id TEXT;
    v_bid2_id TEXT;
    v_bid3_id TEXT;
    v_bid4_id TEXT;
    v_bid5_id TEXT;

    -- المعاملة
    v_transaction_id TEXT;
    v_escrow_id TEXT;
    v_review_id TEXT;

    -- القيم
    v_starting_price DECIMAL := 5000;
    v_reserve_price DECIMAL := 8000;
    v_min_increment DECIMAL := 100;
    v_current_price DECIMAL := 5000;
    v_winning_price DECIMAL := 9000;
    v_platform_fee DECIMAL;
    v_seller_amount DECIMAL;

BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'السيناريو الثاني: رحلة المزاد (Auction Journey)';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.1: جلب المستخدمين
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.1: جلب المستخدمين';

    -- البائع (سارة)
    SELECT id, COALESCE(full_name, 'سارة البائعة') INTO v_seller_id, v_seller_name
    FROM users WHERE email = 'test4@xchange.eg' LIMIT 1;
    IF v_seller_id IS NULL THEN
        RAISE EXCEPTION 'البائع test4@xchange.eg غير موجود!';
    END IF;
    RAISE NOTICE 'البائع: %', v_seller_name;

    -- المزايد 1 (فاطمة)
    SELECT id, COALESCE(full_name, 'فاطمة') INTO v_bidder1_id, v_bidder1_name
    FROM users WHERE email = 'test5@xchange.eg' LIMIT 1;
    IF v_bidder1_id IS NULL THEN
        RAISE EXCEPTION 'المزايد test5@xchange.eg غير موجود!';
    END IF;
    RAISE NOTICE 'المزايد 1: %', v_bidder1_name;

    -- المزايد 2 (عمر)
    SELECT id, COALESCE(full_name, 'عمر') INTO v_bidder2_id, v_bidder2_name
    FROM users WHERE email = 'test6@xchange.eg' LIMIT 1;
    IF v_bidder2_id IS NULL THEN
        RAISE EXCEPTION 'المزايد test6@xchange.eg غير موجود!';
    END IF;
    RAISE NOTICE 'المزايد 2: %', v_bidder2_name;

    -- المزايد 3 (محمود)
    SELECT id, COALESCE(full_name, 'محمود') INTO v_bidder3_id, v_bidder3_name
    FROM users WHERE email = 'test7@xchange.eg' LIMIT 1;
    IF v_bidder3_id IS NULL THEN
        RAISE EXCEPTION 'المزايد test7@xchange.eg غير موجود!';
    END IF;
    RAISE NOTICE 'المزايد 3: %', v_bidder3_name;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.2: إعداد المحافظ
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.2: إعداد المحافظ';

    -- محفظة البائع
    SELECT id INTO v_seller_wallet_id FROM wallets WHERE user_id = v_seller_id LIMIT 1;
    IF v_seller_wallet_id IS NULL THEN
        v_seller_wallet_id := 'uat2-wallet-seller-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
        INSERT INTO wallets (id, user_id, balance, frozen_balance, lifetime_earned, lifetime_spent, created_at, updated_at)
        VALUES (v_seller_wallet_id, v_seller_id, 0, 0, 0, 0, NOW(), NOW());
    END IF;
    RAISE NOTICE 'محفظة البائع جاهزة';

    -- محفظة المزايد 1
    SELECT id INTO v_bidder1_wallet_id FROM wallets WHERE user_id = v_bidder1_id LIMIT 1;
    IF v_bidder1_wallet_id IS NULL THEN
        v_bidder1_wallet_id := 'uat2-wallet-b1-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
        INSERT INTO wallets (id, user_id, balance, frozen_balance, lifetime_earned, lifetime_spent, created_at, updated_at)
        VALUES (v_bidder1_wallet_id, v_bidder1_id, 50000, 0, 0, 0, NOW(), NOW());
    ELSE
        UPDATE wallets SET balance = 50000 WHERE id = v_bidder1_wallet_id;
    END IF;

    -- محفظة المزايد 2
    SELECT id INTO v_bidder2_wallet_id FROM wallets WHERE user_id = v_bidder2_id LIMIT 1;
    IF v_bidder2_wallet_id IS NULL THEN
        v_bidder2_wallet_id := 'uat2-wallet-b2-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
        INSERT INTO wallets (id, user_id, balance, frozen_balance, lifetime_earned, lifetime_spent, created_at, updated_at)
        VALUES (v_bidder2_wallet_id, v_bidder2_id, 50000, 0, 0, 0, NOW(), NOW());
    ELSE
        UPDATE wallets SET balance = 50000 WHERE id = v_bidder2_wallet_id;
    END IF;

    -- محفظة المزايد 3
    SELECT id INTO v_bidder3_wallet_id FROM wallets WHERE user_id = v_bidder3_id LIMIT 1;
    IF v_bidder3_wallet_id IS NULL THEN
        v_bidder3_wallet_id := 'uat2-wallet-b3-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
        INSERT INTO wallets (id, user_id, balance, frozen_balance, lifetime_earned, lifetime_spent, created_at, updated_at)
        VALUES (v_bidder3_wallet_id, v_bidder3_id, 50000, 0, 0, 0, NOW(), NOW());
    ELSE
        UPDATE wallets SET balance = 50000 WHERE id = v_bidder3_wallet_id;
    END IF;

    RAISE NOTICE 'محافظ المزايدين جاهزة (50,000 ج.م لكل واحد)';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.3: إنشاء المنتج للمزاد
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.3: إنشاء المنتج للمزاد';

    SELECT id INTO v_category_id FROM categories LIMIT 1;

    v_item_id := 'uat2-auction-item-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO items (id, seller_id, title, description, category_id, condition, estimated_value, location, images, status, created_at, updated_at)
    VALUES (
        v_item_id, v_seller_id,
        'ساعة Rolex Submariner أصلية - مزاد',
        'ساعة رولكس سبمارينر أصلية، موديل 2022، مع الأوراق والضمان',
        v_category_id, 'LIKE_NEW', 15000,
        'القاهرة - الزمالك',
        ARRAY['https://example.com/rolex.jpg'],
        'ACTIVE', NOW(), NOW()
    );
    RAISE NOTICE 'تم إنشاء المنتج: ساعة Rolex Submariner';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.4: إنشاء قائمة المزاد
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.4: إنشاء قائمة المزاد';

    v_listing_id := 'uat2-auction-listing-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO listings (id, item_id, user_id, listing_type, price, currency, status, views, created_at, updated_at)
    VALUES (v_listing_id, v_item_id, v_seller_id, 'AUCTION', v_starting_price, 'EGP', 'ACTIVE', 0, NOW(), NOW());
    RAISE NOTICE 'تم إنشاء قائمة المزاد';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.5: إنشاء المزاد
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.5: إنشاء المزاد';

    v_auction_id := 'uat2-auction-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO auctions (
        id, listing_id,
        starting_price, current_price, reserve_price,
        min_bid_increment, buy_now_price,
        start_time, end_time,
        auto_extend, extension_minutes, extension_threshold,
        times_extended, max_extensions,
        status, total_bids, unique_bidders, views,
        created_at, updated_at
    ) VALUES (
        v_auction_id, v_listing_id,
        v_starting_price, v_starting_price, v_reserve_price,
        v_min_increment, 12000, -- Buy Now price
        NOW(), NOW() + INTERVAL '2 days',
        true, 5, 5,  -- auto extend 5 min if bid in last 5 min
        0, 3,
        'SCHEDULED', 0, 0, 0,
        NOW(), NOW()
    );
    RAISE NOTICE 'تم إنشاء المزاد:';
    RAISE NOTICE '  - سعر البداية: 5,000 ج.م';
    RAISE NOTICE '  - السعر الاحتياطي: 8,000 ج.م';
    RAISE NOTICE '  - الحد الأدنى للزيادة: 100 ج.م';
    RAISE NOTICE '  - الشراء الفوري: 12,000 ج.م';

    -- إشعار البائع
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES ('uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8), v_seller_id, 'AUCTION',
            'تم إنشاء مزادك!', 'مزاد ساعة Rolex جاهز للبدء',
            jsonb_build_object('auctionId', v_auction_id), false, NOW());

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.6: بدء المزاد
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.6: بدء المزاد';

    UPDATE auctions SET status = 'ACTIVE', updated_at = NOW() WHERE id = v_auction_id;
    RAISE NOTICE 'المزاد الآن ACTIVE - جاهز للمزايدات';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.7: المزايدة الأولى (فاطمة - 5,500)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.7: المزايدة الأولى';

    v_bid1_id := 'uat2-bid1-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO auction_bids (id, auction_id, listing_id, bidder_id, bid_amount, previous_bid, is_auto_bid, status, created_at)
    VALUES (v_bid1_id, v_auction_id, v_listing_id, v_bidder1_id, 5500, v_current_price, false, 'WINNING', NOW());
    v_current_price := 5500;

    UPDATE auctions SET current_price = v_current_price, total_bids = 1, unique_bidders = 1, updated_at = NOW()
    WHERE id = v_auction_id;

    RAISE NOTICE '% زايد بـ 5,500 ج.م', v_bidder1_name;

    -- إشعار البائع
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES ('uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8), v_seller_id, 'AUCTION',
            'مزايدة جديدة!', v_bidder1_name || ' زايد بـ 5,500 ج.م',
            jsonb_build_object('auctionId', v_auction_id, 'bidAmount', 5500), false, NOW());

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.8: المزايدة الثانية (عمر - 6,000)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.8: المزايدة الثانية';

    -- تحديث المزايدة السابقة لـ OUTBID
    UPDATE auction_bids SET status = 'OUTBID' WHERE id = v_bid1_id;

    v_bid2_id := 'uat2-bid2-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO auction_bids (id, auction_id, listing_id, bidder_id, bid_amount, previous_bid, is_auto_bid, status, created_at)
    VALUES (v_bid2_id, v_auction_id, v_listing_id, v_bidder2_id, 6000, v_current_price, false, 'WINNING', NOW());
    v_current_price := 6000;

    UPDATE auctions SET current_price = v_current_price, total_bids = 2, unique_bidders = 2, updated_at = NOW()
    WHERE id = v_auction_id;

    RAISE NOTICE '% زايد بـ 6,000 ج.م', v_bidder2_name;

    -- إشعار المزايد السابق
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES ('uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8), v_bidder1_id, 'AUCTION',
            'تم تجاوز مزايدتك!', 'مزايدة أعلى: 6,000 ج.م - زايد مرة أخرى!',
            jsonb_build_object('auctionId', v_auction_id), false, NOW());

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.9: المزايدة الثالثة (محمود - 7,000)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.9: المزايدة الثالثة';

    UPDATE auction_bids SET status = 'OUTBID' WHERE id = v_bid2_id;

    v_bid3_id := 'uat2-bid3-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO auction_bids (id, auction_id, listing_id, bidder_id, bid_amount, previous_bid, is_auto_bid, status, created_at)
    VALUES (v_bid3_id, v_auction_id, v_listing_id, v_bidder3_id, 7000, v_current_price, false, 'WINNING', NOW());
    v_current_price := 7000;

    UPDATE auctions SET current_price = v_current_price, total_bids = 3, unique_bidders = 3, updated_at = NOW()
    WHERE id = v_auction_id;

    RAISE NOTICE '% زايد بـ 7,000 ج.م', v_bidder3_name;

    -- إشعار المزايد السابق
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES ('uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8), v_bidder2_id, 'AUCTION',
            'تم تجاوز مزايدتك!', 'مزايدة أعلى: 7,000 ج.م',
            jsonb_build_object('auctionId', v_auction_id), false, NOW());

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.10: المزايدة الرابعة (فاطمة ترجع - 8,500) تتجاوز السعر الاحتياطي
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.10: المزايدة الرابعة (تتجاوز السعر الاحتياطي!)';

    UPDATE auction_bids SET status = 'OUTBID' WHERE id = v_bid3_id;

    v_bid4_id := 'uat2-bid4-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO auction_bids (id, auction_id, listing_id, bidder_id, bid_amount, previous_bid, is_auto_bid, status, created_at)
    VALUES (v_bid4_id, v_auction_id, v_listing_id, v_bidder1_id, 8500, v_current_price, false, 'WINNING', NOW());
    v_current_price := 8500;

    UPDATE auctions SET current_price = v_current_price, total_bids = 4, updated_at = NOW()
    WHERE id = v_auction_id;

    RAISE NOTICE '% زايدت بـ 8,500 ج.م - تجاوزت السعر الاحتياطي (8,000)!', v_bidder1_name;

    -- إشعار البائع بتجاوز السعر الاحتياطي
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES ('uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8), v_seller_id, 'AUCTION',
            'تم تجاوز السعر الاحتياطي!', 'المزايدة الحالية 8,500 ج.م - البيع مضمون!',
            jsonb_build_object('auctionId', v_auction_id), false, NOW());

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.11: المزايدة في آخر 5 دقائق (عمر - 9,000) - Auto Extend
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.11: مزايدة في آخر 5 دقائق - تمديد تلقائي!';

    UPDATE auction_bids SET status = 'OUTBID' WHERE id = v_bid4_id;

    v_bid5_id := 'uat2-bid5-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO auction_bids (id, auction_id, listing_id, bidder_id, bid_amount, previous_bid, is_auto_bid, status, created_at)
    VALUES (v_bid5_id, v_auction_id, v_listing_id, v_bidder2_id, 9000, v_current_price, false, 'WINNING', NOW());
    v_current_price := 9000;
    v_winning_price := 9000;

    -- تمديد المزاد 5 دقائق
    UPDATE auctions SET
        current_price = v_current_price,
        total_bids = 5,
        times_extended = 1,
        end_time = end_time + INTERVAL '5 minutes',
        updated_at = NOW()
    WHERE id = v_auction_id;

    RAISE NOTICE '% زايد بـ 9,000 ج.م', v_bidder2_name;
    RAISE NOTICE 'تم تمديد المزاد 5 دقائق إضافية!';

    -- إشعار جميع المزايدين
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES
    ('uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8), v_bidder1_id, 'AUCTION',
     'تم تمديد المزاد!', 'مزايدة جديدة 9,000 ج.م - تم التمديد 5 دقائق',
     jsonb_build_object('auctionId', v_auction_id), false, NOW()),
    ('uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8), v_bidder3_id, 'AUCTION',
     'تم تمديد المزاد!', 'مزايدة جديدة 9,000 ج.م - تم التمديد 5 دقائق',
     jsonb_build_object('auctionId', v_auction_id), false, NOW());

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.12: انتهاء المزاد
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.12: انتهاء المزاد';

    -- تحديث المزايدة الفائزة
    UPDATE auction_bids SET status = 'WON' WHERE id = v_bid5_id;

    -- تحديث باقي المزايدات لـ LOST
    UPDATE auction_bids SET status = 'LOST' WHERE auction_id = v_auction_id AND id != v_bid5_id;

    -- تحديث المزاد
    UPDATE auctions SET
        status = 'ENDED',
        actual_end_time = NOW(),
        winner_id = v_bidder2_id,
        winning_bid_id = v_bid5_id,
        updated_at = NOW()
    WHERE id = v_auction_id;

    RAISE NOTICE 'انتهى المزاد!';
    RAISE NOTICE 'الفائز: % بمبلغ 9,000 ج.م', v_bidder2_name;

    -- إشعار الفائز
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES ('uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8), v_bidder2_id, 'AUCTION',
            'مبروك! فزت بالمزاد!', 'فزت بساعة Rolex بمبلغ 9,000 ج.م - أكمل الدفع الآن',
            jsonb_build_object('auctionId', v_auction_id, 'amount', v_winning_price), false, NOW());

    -- إشعار البائع
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES ('uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8), v_seller_id, 'AUCTION',
            'انتهى مزادك!', 'فاز ' || v_bidder2_name || ' بـ 9,000 ج.م',
            jsonb_build_object('auctionId', v_auction_id), false, NOW());

    -- إشعار الخاسرين
    INSERT INTO notifications (id, user_id, type, title, message, metadata, is_read, created_at)
    VALUES
    ('uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8), v_bidder1_id, 'AUCTION',
     'انتهى المزاد', 'للأسف لم تفز هذه المرة. السعر النهائي: 9,000 ج.م',
     jsonb_build_object('auctionId', v_auction_id), false, NOW()),
    ('uat2-notif-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8), v_bidder3_id, 'AUCTION',
     'انتهى المزاد', 'للأسف لم تفز هذه المرة. السعر النهائي: 9,000 ج.م',
     jsonb_build_object('auctionId', v_auction_id), false, NOW());

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.13: إتمام الصفقة (الدفع عبر Instapay)
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.13: إتمام الصفقة (الدفع عبر Instapay)';

    v_platform_fee := v_winning_price * 0.05; -- 5% رسوم
    v_seller_amount := v_winning_price - v_platform_fee;

    v_transaction_id := 'uat2-trans-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO transactions (
        id, listing_id, buyer_id, seller_id,
        transaction_type, amount, currency,
        payment_method, payment_status, delivery_status,
        created_at, updated_at
    ) VALUES (
        v_transaction_id, v_listing_id,
        v_bidder2_id, v_seller_id,
        'AUCTION', v_winning_price, 'EGP',
        'INSTAPAY', -- الدفع عبر Instapay
        'PENDING', 'PENDING',
        NOW(), NOW()
    );
    RAISE NOTICE 'تم إنشاء المعاملة - طريقة الدفع: INSTAPAY';
    RAISE NOTICE 'المبلغ: 9,000 ج.م';

    -- محاكاة دفع Instapay
    RAISE NOTICE '';
    RAISE NOTICE 'جاري معالجة دفع Instapay...';
    RAISE NOTICE 'رقم المرجع: INSTA-AUCTION-%', UPPER(SUBSTRING(v_auction_id, 13, 8));

    -- إنشاء Escrow
    v_escrow_id := 'uat2-escrow-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO escrows (
        id, escrow_type, buyer_id, seller_id,
        amount, currency, transaction_id, item_id,
        status, funded_at, created_at, updated_at
    ) VALUES (
        v_escrow_id, 'SALE', v_bidder2_id, v_seller_id,
        v_winning_price, 'EGP', v_transaction_id, v_item_id,
        'FUNDED', NOW(), NOW(), NOW()
    );
    RAISE NOTICE 'تم استلام الدفع وحجزه في Escrow';

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.14: الشحن والتسليم
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.14: الشحن والتسليم';

    UPDATE transactions SET
        delivery_status = 'SHIPPED',
        tracking_number = 'ARAMEX-AUCTION-' || UPPER(SUBSTRING(v_transaction_id, 12, 8)),
        updated_at = NOW()
    WHERE id = v_transaction_id;
    RAISE NOTICE 'تم شحن المنتج';

    -- تأكيد الاستلام
    UPDATE transactions SET
        delivery_status = 'DELIVERED',
        payment_status = 'COMPLETED',
        completed_at = NOW(),
        updated_at = NOW()
    WHERE id = v_transaction_id;

    -- تحرير Escrow
    UPDATE escrows SET status = 'RELEASED', released_at = NOW(), updated_at = NOW()
    WHERE id = v_escrow_id;

    -- تحويل للبائع
    UPDATE wallets SET balance = balance + v_seller_amount WHERE id = v_seller_wallet_id;
    RAISE NOTICE 'تم تحويل % ج.م للبائع (بعد خصم 5%% رسوم)', v_seller_amount;

    -- تحديث المزاد والمنتج
    UPDATE auctions SET status = 'COMPLETED', updated_at = NOW() WHERE id = v_auction_id;
    UPDATE items SET status = 'SOLD', updated_at = NOW() WHERE id = v_item_id;
    UPDATE listings SET status = 'COMPLETED', updated_at = NOW() WHERE id = v_listing_id;

    -- ═══════════════════════════════════════════════════════════════
    -- الخطوة 2.15: التقييم
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE 'الخطوة 2.15: التقييم';

    v_review_id := 'uat2-review-' || SUBSTRING(gen_random_uuid()::TEXT, 1, 8);
    INSERT INTO reviews (id, transaction_id, reviewer_id, reviewed_id, review_type, overall_rating, comment, is_verified_purchase, created_at, updated_at)
    VALUES (v_review_id, v_transaction_id, v_bidder2_id, v_seller_id, 'SELLER_REVIEW', 5,
            'ساعة أصلية 100%! التغليف ممتاز والتوصيل سريع. شكراً!', true, NOW(), NOW());
    RAISE NOTICE 'تم إضافة تقييم 5 نجوم';

    -- ═══════════════════════════════════════════════════════════════
    -- ملخص النتائج
    -- ═══════════════════════════════════════════════════════════════
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'ملخص السيناريو الثاني - المزاد';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'المنتج: ساعة Rolex Submariner';
    RAISE NOTICE 'سعر البداية: 5,000 ج.م';
    RAISE NOTICE 'السعر الاحتياطي: 8,000 ج.م';
    RAISE NOTICE '---';
    RAISE NOTICE 'المزايدات:';
    RAISE NOTICE '  1. % - 5,500 ج.م (OUTBID)', v_bidder1_name;
    RAISE NOTICE '  2. % - 6,000 ج.م (OUTBID)', v_bidder2_name;
    RAISE NOTICE '  3. % - 7,000 ج.م (OUTBID)', v_bidder3_name;
    RAISE NOTICE '  4. % - 8,500 ج.م (OUTBID) - تجاوز السعر الاحتياطي!', v_bidder1_name;
    RAISE NOTICE '  5. % - 9,000 ج.م (WON) + تمديد تلقائي', v_bidder2_name;
    RAISE NOTICE '---';
    RAISE NOTICE 'الفائز: % (test6@xchange.eg)', v_bidder2_name;
    RAISE NOTICE 'السعر النهائي: 9,000 ج.م';
    RAISE NOTICE 'طريقة الدفع: INSTAPAY';
    RAISE NOTICE 'رسوم المنصة (5%%): % ج.م', v_platform_fee;
    RAISE NOTICE 'المبلغ للبائع: % ج.م', v_seller_amount;
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';
    RAISE NOTICE 'اكتمل السيناريو الثاني بنجاح!';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════';

END $$;

-- ═══════════════════════════════════════════════════════════════════
-- استعلامات التحقق
-- ═══════════════════════════════════════════════════════════════════

SELECT 'المزاد:' as section;
SELECT id, status, starting_price, current_price, reserve_price, total_bids, times_extended
FROM auctions WHERE id LIKE 'uat2-%';

SELECT 'المزايدات:' as section;
SELECT b.id, u.full_name as bidder, b.bid_amount, b.status
FROM auction_bids b
JOIN users u ON b.bidder_id = u.id
WHERE b.auction_id LIKE 'uat2-%'
ORDER BY b.bid_amount;

SELECT 'المعاملة:' as section;
SELECT id, transaction_type, payment_method, payment_status, delivery_status, amount
FROM transactions WHERE id LIKE 'uat2-%';

SELECT 'Escrow:' as section;
SELECT id, escrow_type, amount, status FROM escrows WHERE id LIKE 'uat2-%';

SELECT 'التقييم:' as section;
SELECT id, overall_rating, comment FROM reviews WHERE id LIKE 'uat2-%';
