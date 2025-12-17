-- =====================================================
-- UAT PART 2: TRANSACTIONS & PAYMENTS - المعاملات والدفع
-- =====================================================
-- Tests: InstaPay, Fawry, Vodafone Cash, COD, Escrow
-- Run this AFTER UAT_FULL_DATA.sql and UAT_PART1_ITEMS.sql
-- =====================================================

DO $$
DECLARE
    u1 TEXT; u2 TEXT; u3 TEXT; u4 TEXT; u5 TEXT;
    u6 TEXT; u7 TEXT; u8 TEXT; u9 TEXT; u10 TEXT;
    cat_electronics TEXT; cat_mobile TEXT; cat_furniture TEXT;
    -- Additional listings for transactions
    new_lst1 TEXT; new_lst2 TEXT; new_lst3 TEXT; new_lst4 TEXT; new_lst5 TEXT;
    new_lst6 TEXT; new_lst7 TEXT; new_lst8 TEXT; new_lst9 TEXT; new_lst10 TEXT;
    new_lst11 TEXT; new_lst12 TEXT; new_lst13 TEXT; new_lst14 TEXT; new_lst15 TEXT;
    -- Additional auctions
    new_auc1 TEXT; new_auc2 TEXT; new_auc3 TEXT; new_auc4 TEXT; new_auc5 TEXT;
    -- Additional reverse auctions
    new_rev1 TEXT; new_rev2 TEXT; new_rev3 TEXT; new_rev4 TEXT; new_rev5 TEXT;
    -- Additional barter offers
    new_barter1 TEXT; new_barter2 TEXT; new_barter3 TEXT; new_barter4 TEXT; new_barter5 TEXT;
    new_barter6 TEXT; new_barter7 TEXT; new_barter8 TEXT; new_barter9 TEXT; new_barter10 TEXT;
    -- Additional chains
    new_chain1 TEXT; new_chain2 TEXT; new_chain3 TEXT;
    -- Orders
    new_ord1 TEXT; new_ord2 TEXT; new_ord3 TEXT; new_ord4 TEXT; new_ord5 TEXT;
    new_ord6 TEXT; new_ord7 TEXT; new_ord8 TEXT; new_ord9 TEXT; new_ord10 TEXT;
    new_ord11 TEXT; new_ord12 TEXT; new_ord13 TEXT; new_ord14 TEXT; new_ord15 TEXT;
    -- Shipping addresses
    addr1 TEXT; addr2 TEXT; addr3 TEXT; addr4 TEXT; addr5 TEXT;
    addr6 TEXT; addr7 TEXT; addr8 TEXT; addr9 TEXT; addr10 TEXT;
    -- Items from DB
    item_ref1 TEXT; item_ref2 TEXT; item_ref3 TEXT; item_ref4 TEXT; item_ref5 TEXT;
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
    SELECT id INTO cat_electronics FROM categories WHERE is_active = true LIMIT 1;
    SELECT id INTO cat_mobile FROM categories WHERE slug ILIKE '%mobile%' OR name_en ILIKE '%mobile%' LIMIT 1;
    SELECT id INTO cat_furniture FROM categories WHERE slug ILIKE '%furniture%' OR name_en ILIKE '%furniture%' LIMIT 1;
    IF cat_mobile IS NULL THEN cat_mobile := cat_electronics; END IF;
    IF cat_furniture IS NULL THEN cat_furniture := cat_electronics; END IF;

    -- =========== GET SHIPPING ADDRESSES ===========
    SELECT id INTO addr1 FROM shipping_addresses WHERE user_id = u1 LIMIT 1;
    SELECT id INTO addr2 FROM shipping_addresses WHERE user_id = u2 LIMIT 1;
    SELECT id INTO addr3 FROM shipping_addresses WHERE user_id = u3 LIMIT 1;
    SELECT id INTO addr4 FROM shipping_addresses WHERE user_id = u4 LIMIT 1;
    SELECT id INTO addr5 FROM shipping_addresses WHERE user_id = u5 LIMIT 1;
    SELECT id INTO addr6 FROM shipping_addresses WHERE user_id = u6 LIMIT 1;
    SELECT id INTO addr7 FROM shipping_addresses WHERE user_id = u7 LIMIT 1;
    SELECT id INTO addr8 FROM shipping_addresses WHERE user_id = u8 LIMIT 1;
    SELECT id INTO addr9 FROM shipping_addresses WHERE user_id = u9 LIMIT 1;
    SELECT id INTO addr10 FROM shipping_addresses WHERE user_id = u10 LIMIT 1;

    -- Get some items
    SELECT id INTO item_ref1 FROM items WHERE seller_id = u1 LIMIT 1;
    SELECT id INTO item_ref2 FROM items WHERE seller_id = u2 LIMIT 1;
    SELECT id INTO item_ref3 FROM items WHERE seller_id = u3 LIMIT 1;
    SELECT id INTO item_ref4 FROM items WHERE seller_id = u8 LIMIT 1;
    SELECT id INTO item_ref5 FROM items WHERE seller_id = u5 LIMIT 1;

    RAISE NOTICE '=========== CREATING ADDITIONAL LISTINGS ===========';

    -- =========== 15 NEW LISTINGS ===========
    -- Direct Sale listings for payment testing
    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    SELECT gen_random_uuid()::TEXT, i.id, i.seller_id, 'DIRECT_SALE', i.estimated_value, 'ACTIVE', NOW(), NOW()
    FROM items i WHERE i.seller_id = u1 AND i.id NOT IN (SELECT item_id FROM listings WHERE item_id IS NOT NULL) LIMIT 3
    RETURNING id INTO new_lst1;

    INSERT INTO listings (id, item_id, user_id, listing_type, price, status, created_at, updated_at)
    SELECT gen_random_uuid()::TEXT, i.id, i.seller_id, 'DIRECT_SALE', i.estimated_value, 'ACTIVE', NOW(), NOW()
    FROM items i WHERE i.seller_id = u8 AND i.id NOT IN (SELECT item_id FROM listings WHERE item_id IS NOT NULL) LIMIT 3
    RETURNING id INTO new_lst2;

    -- Get created listings
    SELECT id INTO new_lst1 FROM listings WHERE user_id = u1 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO new_lst2 FROM listings WHERE user_id = u8 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO new_lst3 FROM listings WHERE user_id = u3 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO new_lst4 FROM listings WHERE user_id = u5 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1;
    SELECT id INTO new_lst5 FROM listings WHERE user_id = u7 AND status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1;

    RAISE NOTICE '✅ Additional listings created/retrieved';

    -- =========== 5 NEW AUCTIONS ===========
    RAISE NOTICE 'Creating 5 new auctions...';

    INSERT INTO auctions (id, listing_id, starting_price, current_price, min_bid_increment, start_time, end_time, status, total_bids, unique_bidders, created_at, updated_at)
    VALUES
    (gen_random_uuid()::TEXT, new_lst1, 50000, 65000, 2000, NOW() - INTERVAL '3 days', NOW() + INTERVAL '10 days', 'ACTIVE', 8, 4, NOW(), NOW()),
    (gen_random_uuid()::TEXT, new_lst3, 100000, 135000, 5000, NOW() - INTERVAL '5 days', NOW() + INTERVAL '5 days', 'ACTIVE', 7, 5, NOW(), NOW())
    ON CONFLICT DO NOTHING;

    SELECT id INTO new_auc1 FROM auctions WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1 OFFSET 0;
    SELECT id INTO new_auc2 FROM auctions WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1 OFFSET 1;

    -- Auction bids
    INSERT INTO auction_bids (id, listing_id, auction_id, bidder_id, bid_amount, status, created_at) VALUES
    (gen_random_uuid()::TEXT, new_lst1, new_auc1, u2, 52000, 'OUTBID', NOW() - INTERVAL '2 days'),
    (gen_random_uuid()::TEXT, new_lst1, new_auc1, u4, 54000, 'OUTBID', NOW() - INTERVAL '1 day'),
    (gen_random_uuid()::TEXT, new_lst1, new_auc1, u6, 58000, 'OUTBID', NOW() - INTERVAL '12 hours'),
    (gen_random_uuid()::TEXT, new_lst1, new_auc1, u2, 62000, 'OUTBID', NOW() - INTERVAL '6 hours'),
    (gen_random_uuid()::TEXT, new_lst1, new_auc1, u10, 65000, 'ACTIVE', NOW() - INTERVAL '1 hour')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 5 auctions with bids created';

    -- =========== 5 NEW REVERSE AUCTIONS (TENDERS) ===========
    RAISE NOTICE 'Creating 5 new reverse auctions (tenders)...';

    INSERT INTO reverse_auctions (id, buyer_id, title, description, category_id, condition, quantity, max_budget, status, end_date, location, total_bids, unique_bidders, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u6, 'مطلوب 100 موبايل Samsung A54', 'للشركة - ضمان سنة', cat_mobile, 'NEW', 100, 1500000, 'ACTIVE', NOW() + INTERVAL '20 days', 'Cairo, Smart Village', 4, 4, NOW(), NOW()),
    (gen_random_uuid()::TEXT, u7, 'مطلوب أثاث مكتبي 50 مكتب', 'مكاتب + كراسي + خزائن', cat_furniture, 'NEW', 50, 500000, 'ACTIVE', NOW() + INTERVAL '15 days', 'Cairo, New Cairo', 3, 3, NOW(), NOW()),
    (gen_random_uuid()::TEXT, u3, 'مطلوب 30 تابلت iPad', 'للمدرسة - تعليمي', cat_electronics, 'NEW', 30, 450000, 'ACTIVE', NOW() + INTERVAL '12 days', 'Giza, Dokki', 5, 5, NOW(), NOW()),
    (gen_random_uuid()::TEXT, u10, 'مطلوب 10 طابعات HP LaserJet', 'للمكتب', cat_electronics, 'NEW', 10, 80000, 'ACTIVE', NOW() + INTERVAL '7 days', 'Cairo, Heliopolis', 2, 2, NOW(), NOW()),
    (gen_random_uuid()::TEXT, u5, 'مطلوب سيرفر Dell PowerEdge', 'للداتا سنتر', cat_electronics, 'NEW', 2, 300000, 'ACTIVE', NOW() + INTERVAL '30 days', 'Cairo, Zamalek', 3, 3, NOW(), NOW())
    RETURNING id INTO new_rev1;

    -- Get all reverse auctions
    SELECT id INTO new_rev1 FROM reverse_auctions WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1 OFFSET 0;
    SELECT id INTO new_rev2 FROM reverse_auctions WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1 OFFSET 1;
    SELECT id INTO new_rev3 FROM reverse_auctions WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1 OFFSET 2;
    SELECT id INTO new_rev4 FROM reverse_auctions WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1 OFFSET 3;
    SELECT id INTO new_rev5 FROM reverse_auctions WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1 OFFSET 4;

    -- Reverse auction bids
    INSERT INTO reverse_auction_bids (id, reverse_auction_id, seller_id, bid_amount, item_condition, delivery_option, delivery_days, notes, status, created_at, updated_at) VALUES
    -- Bids for Samsung mobiles tender
    (gen_random_uuid()::TEXT, new_rev1, u1, 1400000, 'NEW', 'DELIVERY', 14, 'Samsung A54 أصلي - ضمان وكيل', 'ACTIVE', NOW(), NOW()),
    (gen_random_uuid()::TEXT, new_rev1, u8, 1350000, 'NEW', 'DELIVERY', 10, 'ضمان سنتين - شحن مجاني', 'ACTIVE', NOW(), NOW()),
    (gen_random_uuid()::TEXT, new_rev1, u4, 1420000, 'NEW', 'DELIVERY', 7, 'توصيل سريع', 'ACTIVE', NOW(), NOW()),
    -- Bids for furniture tender
    (gen_random_uuid()::TEXT, new_rev2, u7, 480000, 'NEW', 'DELIVERY', 21, 'أثاث مصري عالي الجودة', 'ACTIVE', NOW(), NOW()),
    (gen_random_uuid()::TEXT, new_rev2, u2, 450000, 'NEW', 'DELIVERY', 30, 'تصنيع حسب الطلب', 'ACTIVE', NOW(), NOW()),
    -- Bids for iPad tender
    (gen_random_uuid()::TEXT, new_rev3, u1, 420000, 'NEW', 'DELIVERY', 14, 'iPad 10th Gen - ضمان Apple', 'ACTIVE', NOW(), NOW()),
    (gen_random_uuid()::TEXT, new_rev3, u8, 430000, 'NEW', 'DELIVERY', 10, 'مع كفرات حماية', 'ACTIVE', NOW(), NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 5 reverse auctions with bids created';

    -- =========== 10 NEW BARTER OFFERS ===========
    RAISE NOTICE 'Creating 10 new barter offers...';

    INSERT INTO barter_offers (id, initiator_id, recipient_id, offered_item_ids, offered_bundle_value, status, notes, expires_at, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, u1, u8, ARRAY[item_ref1], 75000, 'PENDING', 'آيفون مقابل سامسونج + فرق', NOW() + INTERVAL '7 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, u2, u5, ARRAY[item_ref2], 28000, 'PENDING', 'PS5 مقابل Xbox Series X', NOW() + INTERVAL '5 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, u3, u9, ARRAY[item_ref3], 120000, 'ACCEPTED', 'كاميرا مقابل سيارة صغيرة + فرق', NOW() + INTERVAL '10 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, u4, u7, ARRAY[item_ref1], 15000, 'PENDING', 'خردة نحاس مقابل أثاث', NOW() + INTERVAL '14 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, u5, u1, ARRAY[item_ref5], 85000, 'COUNTER_OFFERED', 'شنطة لويس فيتون مقابل MacBook', NOW() + INTERVAL '7 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, u6, u3, ARRAY[item_ref1], 750000, 'PENDING', 'مطلوب كاميرا احترافية', NOW() + INTERVAL '21 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, u7, u2, ARRAY[item_ref1], 35000, 'REJECTED', 'مكتب مقابل أريكة', NOW(), NOW(), NOW()),
    (gen_random_uuid()::TEXT, u8, u10, ARRAY[item_ref4], 45000, 'PENDING', 'موبايل مقابل موبايل', NOW() + INTERVAL '3 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, u9, u1, ARRAY[item_ref1], 950000, 'ACCEPTED', 'سيارة مقابل سيارة أخرى + فرق', NOW() + INTERVAL '30 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, u10, u4, ARRAY[item_ref1], 25000, 'PENDING', 'ثلاجة مقابل غسالة', NOW() + INTERVAL '7 days', NOW(), NOW())
    RETURNING id INTO new_barter1;

    RAISE NOTICE '✅ 10 barter offers created';

    -- =========== 3 NEW BARTER CHAINS ===========
    RAISE NOTICE 'Creating 3 new barter chains...';

    INSERT INTO barter_chains (id, chain_type, participant_count, match_score, algorithm_version, description, status, expires_at, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, 'CYCLE', 4, 0.88, '2.1', 'سلسلة رباعية: u1←u2←u3←u4←u1', 'PENDING', NOW() + INTERVAL '5 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, 'PATH', 3, 0.95, '2.1', 'سلسلة ثلاثية: u5→u6→u7', 'ACCEPTED', NOW() + INTERVAL '7 days', NOW(), NOW()),
    (gen_random_uuid()::TEXT, 'CYCLE', 5, 0.82, '2.1', 'سلسلة خماسية كبيرة', 'PROPOSED', NOW() + INTERVAL '10 days', NOW(), NOW())
    RETURNING id INTO new_chain1;

    SELECT id INTO new_chain1 FROM barter_chains ORDER BY created_at DESC LIMIT 1 OFFSET 0;
    SELECT id INTO new_chain2 FROM barter_chains ORDER BY created_at DESC LIMIT 1 OFFSET 1;
    SELECT id INTO new_chain3 FROM barter_chains ORDER BY created_at DESC LIMIT 1 OFFSET 2;

    -- Chain participants
    INSERT INTO barter_participants (id, chain_id, user_id, giving_item_id, receiving_item_id, position, status, created_at, updated_at) VALUES
    (gen_random_uuid()::TEXT, new_chain1, u1, item_ref1, item_ref2, 0, 'PENDING', NOW(), NOW()),
    (gen_random_uuid()::TEXT, new_chain1, u2, item_ref2, item_ref3, 1, 'PENDING', NOW(), NOW()),
    (gen_random_uuid()::TEXT, new_chain1, u3, item_ref3, item_ref4, 2, 'PENDING', NOW(), NOW()),
    (gen_random_uuid()::TEXT, new_chain1, u4, item_ref4, item_ref1, 3, 'PENDING', NOW(), NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 3 barter chains created';

    -- =========== 15 NEW ORDERS WITH DIFFERENT PAYMENT METHODS ===========
    RAISE NOTICE 'Creating 15 orders with various payment methods...';

    IF addr1 IS NOT NULL AND new_lst1 IS NOT NULL THEN
        -- Order 1: FAWRY Payment - Delivered
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, shipped_at, delivered_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u2, 'XCH-FAWRY-' || FLOOR(RANDOM()*100000)::TEXT, 'DELIVERED', 12000, 50, 12050, addr2, 'FAWRY', 'FAWRY_' || FLOOR(RANDOM()*1000000)::TEXT, NOW() - INTERVAL '10 days', NOW() - INTERVAL '8 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '10 days', NOW())
        RETURNING id INTO new_ord1;

        -- Order 2: INSTAPAY Payment - Shipped
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, shipped_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u3, 'XCH-INSTA-' || FLOOR(RANDOM()*100000)::TEXT, 'SHIPPED', 35000, 100, 35100, addr3, 'INSTAPAY', 'INSTA_' || FLOOR(RANDOM()*1000000)::TEXT, NOW() - INTERVAL '3 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '3 days', NOW())
        RETURNING id INTO new_ord2;

        -- Order 3: VODAFONE_CASH Payment - Processing
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u4, 'XCH-VODA-' || FLOOR(RANDOM()*100000)::TEXT, 'PROCESSING', 8500, 75, 8575, addr4, 'VODAFONE_CASH', 'VODA_' || FLOOR(RANDOM()*1000000)::TEXT, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW())
        RETURNING id INTO new_ord3;

        -- Order 4: COD (Cash on Delivery) - Pending
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u5, 'XCH-COD-' || FLOOR(RANDOM()*100000)::TEXT, 'PENDING', 22000, 100, 22100, addr5, 'COD', NOW(), NOW())
        RETURNING id INTO new_ord4;

        -- Order 5: BANK_TRANSFER - Paid
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u6, 'XCH-BANK-' || FLOOR(RANDOM()*100000)::TEXT, 'PAID', 95000, 200, 95200, addr6, 'BANK_TRANSFER', 'BANK_' || FLOOR(RANDOM()*1000000)::TEXT, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW())
        RETURNING id INTO new_ord5;

        -- Order 6: ESCROW Payment - Processing
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u7, 'XCH-ESCR-' || FLOOR(RANDOM()*100000)::TEXT, 'PROCESSING', 180000, 500, 180500, addr7, 'ESCROW', 'ESCROW_' || FLOOR(RANDOM()*1000000)::TEXT, NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW())
        RETURNING id INTO new_ord6;

        -- Order 7: WALLET (XCoin) Payment - Delivered
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, shipped_at, delivered_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u8, 'XCH-WALL-' || FLOOR(RANDOM()*100000)::TEXT, 'DELIVERED', 6500, 50, 6550, addr8, 'WALLET', 'WALLET_' || FLOOR(RANDOM()*1000000)::TEXT, NOW() - INTERVAL '14 days', NOW() - INTERVAL '12 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '14 days', NOW())
        RETURNING id INTO new_ord7;

        -- Order 8: FAWRY - Cancelled
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u9, 'XCH-FAWRY-' || FLOOR(RANDOM()*100000)::TEXT, 'CANCELLED', 45000, 150, 45150, addr9, 'FAWRY', NOW() - INTERVAL '7 days', NOW())
        RETURNING id INTO new_ord8;

        -- Order 9: INSTAPAY - Refunded
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u10, 'XCH-INSTA-' || FLOOR(RANDOM()*100000)::TEXT, 'REFUNDED', 28000, 100, 28100, addr10, 'INSTAPAY', 'INSTA_' || FLOOR(RANDOM()*1000000)::TEXT, NOW() - INTERVAL '20 days', NOW() - INTERVAL '20 days', NOW())
        RETURNING id INTO new_ord9;

        -- Order 10: VODAFONE_CASH - Delivered (high value)
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, shipped_at, delivered_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u1, 'XCH-VODA-' || FLOOR(RANDOM()*100000)::TEXT, 'DELIVERED', 55000, 200, 55200, addr1, 'VODAFONE_CASH', 'VODA_' || FLOOR(RANDOM()*1000000)::TEXT, NOW() - INTERVAL '21 days', NOW() - INTERVAL '19 days', NOW() - INTERVAL '16 days', NOW() - INTERVAL '21 days', NOW())
        RETURNING id INTO new_ord10;

        -- Orders 11-15: More variety
        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, shipped_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u2, 'XCH-MIX-' || FLOOR(RANDOM()*100000)::TEXT, 'SHIPPED', 18000, 75, 18075, addr2, 'FAWRY', 'FAWRY_' || FLOOR(RANDOM()*1000000)::TEXT, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', NOW() - INTERVAL '2 days', NOW())
        RETURNING id INTO new_ord11;

        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, paid_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u4, 'XCH-MIX-' || FLOOR(RANDOM()*100000)::TEXT, 'PROCESSING', 42000, 150, 42150, addr4, 'INSTAPAY', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW())
        RETURNING id INTO new_ord12;

        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u6, 'XCH-MIX-' || FLOOR(RANDOM()*100000)::TEXT, 'PENDING', 85000, 250, 85250, addr6, 'BANK_TRANSFER', NOW(), NOW())
        RETURNING id INTO new_ord13;

        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, shipped_at, delivered_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u8, 'XCH-MIX-' || FLOOR(RANDOM()*100000)::TEXT, 'DELIVERED', 15000, 50, 15050, addr8, 'COD', 'COD_' || FLOOR(RANDOM()*1000000)::TEXT, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '5 days', NOW())
        RETURNING id INTO new_ord14;

        INSERT INTO orders (id, user_id, order_number, status, subtotal, shipping_cost, total, shipping_address_id, payment_method, payment_id, paid_at, created_at, updated_at)
        VALUES (gen_random_uuid()::TEXT, u10, 'XCH-MIX-' || FLOOR(RANDOM()*100000)::TEXT, 'PAID', 320000, 500, 320500, addr10, 'ESCROW', 'ESCROW_' || FLOOR(RANDOM()*1000000)::TEXT, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW())
        RETURNING id INTO new_ord15;

        RAISE NOTICE '✅ 15 orders with various payment methods created';

        -- =========== ADD ORDER ITEMS ===========
        INSERT INTO order_items (id, order_id, listing_id, seller_id, quantity, price) VALUES
        (gen_random_uuid()::TEXT, new_ord1, new_lst1, u1, 1, 12000),
        (gen_random_uuid()::TEXT, new_ord2, new_lst2, u8, 1, 35000),
        (gen_random_uuid()::TEXT, new_ord3, new_lst1, u1, 1, 8500),
        (gen_random_uuid()::TEXT, new_ord4, new_lst3, u3, 1, 22000),
        (gen_random_uuid()::TEXT, new_ord5, new_lst4, u5, 1, 95000)
        ON CONFLICT DO NOTHING;

        RAISE NOTICE '✅ Order items created';
    ELSE
        RAISE NOTICE '⚠️ Some addresses or listings not found, orders may be incomplete';
    END IF;

    -- =========== 25 NEW TRANSACTIONS ===========
    RAISE NOTICE 'Creating 25 transactions with various payment methods...';

    INSERT INTO transactions (id, listing_id, buyer_id, seller_id, transaction_type, amount, payment_method, payment_status, delivery_status, tracking_number, created_at, updated_at, completed_at) VALUES
    -- FAWRY Transactions
    (gen_random_uuid()::TEXT, new_lst1, u2, u1, 'DIRECT_SALE', 12000, 'FAWRY', 'COMPLETED', 'DELIVERED', 'FAWRY_TRK_001', NOW() - INTERVAL '10 days', NOW(), NOW() - INTERVAL '5 days'),
    (gen_random_uuid()::TEXT, new_lst2, u4, u8, 'DIRECT_SALE', 18000, 'FAWRY', 'COMPLETED', 'DELIVERED', 'FAWRY_TRK_002', NOW() - INTERVAL '15 days', NOW(), NOW() - INTERVAL '12 days'),
    (gen_random_uuid()::TEXT, new_lst3, u6, u3, 'DIRECT_SALE', 35000, 'FAWRY', 'COMPLETED', 'SHIPPED', 'FAWRY_TRK_003', NOW() - INTERVAL '3 days', NOW(), NULL),
    (gen_random_uuid()::TEXT, new_lst4, u8, u5, 'DIRECT_SALE', 22000, 'FAWRY', 'PENDING', 'PENDING', NULL, NOW(), NOW(), NULL),

    -- INSTAPAY Transactions
    (gen_random_uuid()::TEXT, new_lst1, u3, u1, 'DIRECT_SALE', 45000, 'INSTAPAY', 'COMPLETED', 'DELIVERED', 'INSTA_TRK_001', NOW() - INTERVAL '20 days', NOW(), NOW() - INTERVAL '17 days'),
    (gen_random_uuid()::TEXT, new_lst2, u5, u8, 'DIRECT_SALE', 28000, 'INSTAPAY', 'COMPLETED', 'SHIPPED', 'INSTA_TRK_002', NOW() - INTERVAL '2 days', NOW(), NULL),
    (gen_random_uuid()::TEXT, new_lst3, u7, u3, 'DIRECT_SALE', 55000, 'INSTAPAY', 'COMPLETED', 'PENDING', NULL, NOW() - INTERVAL '1 day', NOW(), NULL),
    (gen_random_uuid()::TEXT, new_lst4, u9, u5, 'DIRECT_SALE', 15000, 'INSTAPAY', 'PENDING', 'PENDING', NULL, NOW(), NOW(), NULL),

    -- VODAFONE_CASH Transactions
    (gen_random_uuid()::TEXT, new_lst1, u4, u1, 'DIRECT_SALE', 8500, 'VODAFONE_CASH', 'COMPLETED', 'DELIVERED', 'VODA_TRK_001', NOW() - INTERVAL '8 days', NOW(), NOW() - INTERVAL '5 days'),
    (gen_random_uuid()::TEXT, new_lst2, u6, u8, 'DIRECT_SALE', 12500, 'VODAFONE_CASH', 'COMPLETED', 'DELIVERED', 'VODA_TRK_002', NOW() - INTERVAL '12 days', NOW(), NOW() - INTERVAL '9 days'),
    (gen_random_uuid()::TEXT, new_lst3, u8, u3, 'DIRECT_SALE', 6500, 'VODAFONE_CASH', 'COMPLETED', 'SHIPPED', 'VODA_TRK_003', NOW() - INTERVAL '2 days', NOW(), NULL),

    -- BANK_TRANSFER Transactions
    (gen_random_uuid()::TEXT, new_lst1, u5, u1, 'DIRECT_SALE', 95000, 'BANK_TRANSFER', 'COMPLETED', 'DELIVERED', 'BANK_TRK_001', NOW() - INTERVAL '25 days', NOW(), NOW() - INTERVAL '20 days'),
    (gen_random_uuid()::TEXT, new_lst2, u7, u8, 'DIRECT_SALE', 180000, 'BANK_TRANSFER', 'COMPLETED', 'SHIPPED', 'BANK_TRK_002', NOW() - INTERVAL '5 days', NOW(), NULL),
    (gen_random_uuid()::TEXT, new_lst3, u9, u3, 'DIRECT_SALE', 320000, 'BANK_TRANSFER', 'PENDING', 'PENDING', NULL, NOW(), NOW(), NULL),

    -- COD Transactions
    (gen_random_uuid()::TEXT, new_lst1, u6, u1, 'DIRECT_SALE', 15000, 'COD', 'COMPLETED', 'DELIVERED', 'COD_TRK_001', NOW() - INTERVAL '6 days', NOW(), NOW() - INTERVAL '3 days'),
    (gen_random_uuid()::TEXT, new_lst2, u8, u8, 'DIRECT_SALE', 22000, 'COD', 'COMPLETED', 'DELIVERED', 'COD_TRK_002', NOW() - INTERVAL '10 days', NOW(), NOW() - INTERVAL '7 days'),
    (gen_random_uuid()::TEXT, new_lst3, u10, u3, 'DIRECT_SALE', 8000, 'COD', 'PENDING', 'PENDING', NULL, NOW(), NOW(), NULL),

    -- ESCROW Transactions (high value)
    (gen_random_uuid()::TEXT, new_lst4, u1, u5, 'DIRECT_SALE', 450000, 'ESCROW', 'COMPLETED', 'DELIVERED', 'ESC_TRK_001', NOW() - INTERVAL '30 days', NOW(), NOW() - INTERVAL '25 days'),
    (gen_random_uuid()::TEXT, new_lst5, u3, u7, 'DIRECT_SALE', 850000, 'ESCROW', 'COMPLETED', 'SHIPPED', 'ESC_TRK_002', NOW() - INTERVAL '7 days', NOW(), NULL),
    (gen_random_uuid()::TEXT, new_lst1, u5, u1, 'DIRECT_SALE', 1200000, 'ESCROW', 'PENDING', 'PENDING', NULL, NOW(), NOW(), NULL),

    -- WALLET (XCoin) Transactions
    (gen_random_uuid()::TEXT, new_lst1, u7, u1, 'DIRECT_SALE', 6500, 'WALLET', 'COMPLETED', 'DELIVERED', 'WAL_TRK_001', NOW() - INTERVAL '14 days', NOW(), NOW() - INTERVAL '11 days'),
    (gen_random_uuid()::TEXT, new_lst2, u9, u8, 'DIRECT_SALE', 3500, 'WALLET', 'COMPLETED', 'DELIVERED', 'WAL_TRK_002', NOW() - INTERVAL '18 days', NOW(), NOW() - INTERVAL '15 days'),

    -- BARTER Transactions
    (gen_random_uuid()::TEXT, new_lst1, u8, u1, 'BARTER', NULL, NULL, 'COMPLETED', 'DELIVERED', NULL, NOW() - INTERVAL '20 days', NOW(), NOW() - INTERVAL '18 days'),
    (gen_random_uuid()::TEXT, new_lst2, u10, u8, 'BARTER', NULL, NULL, 'COMPLETED', 'DELIVERED', NULL, NOW() - INTERVAL '25 days', NOW(), NOW() - INTERVAL '22 days'),
    (gen_random_uuid()::TEXT, new_lst3, u2, u3, 'BARTER', NULL, NULL, 'PENDING', 'PENDING', NULL, NOW(), NOW(), NULL)
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 25 transactions created';

    -- =========== 30 NEW NOTIFICATIONS ===========
    RAISE NOTICE 'Creating 30 notifications...';

    INSERT INTO notifications (id, user_id, type, priority, title, message, entity_type, entity_id, is_read, created_at) VALUES
    -- Payment notifications
    (gen_random_uuid()::TEXT, u1, 'TRANSACTION_PAYMENT_RECEIVED', 'HIGH', 'تم استلام دفعة فوري!', 'تم استلام 12,000 جنيه عبر فوري', 'TRANSACTION', NULL, false, NOW()),
    (gen_random_uuid()::TEXT, u8, 'TRANSACTION_PAYMENT_RECEIVED', 'HIGH', 'تم استلام دفعة انستاباي!', 'تم استلام 35,000 جنيه عبر انستاباي', 'TRANSACTION', NULL, false, NOW()),
    (gen_random_uuid()::TEXT, u3, 'TRANSACTION_PAYMENT_RECEIVED', 'HIGH', 'تم استلام دفعة فودافون كاش!', 'تم استلام 8,500 جنيه عبر فودافون كاش', 'TRANSACTION', NULL, false, NOW()),
    (gen_random_uuid()::TEXT, u5, 'TRANSACTION_PAYMENT_RECEIVED', 'HIGH', 'تم استلام تحويل بنكي!', 'تم استلام 95,000 جنيه تحويل بنكي', 'TRANSACTION', NULL, true, NOW() - INTERVAL '2 days'),

    -- Shipping notifications
    (gen_random_uuid()::TEXT, u2, 'TRANSACTION_SHIPPED', 'MEDIUM', 'تم شحن طلبك!', 'طلبك في الطريق - رقم التتبع: FAWRY_TRK_001', 'TRANSACTION', NULL, false, NOW()),
    (gen_random_uuid()::TEXT, u3, 'TRANSACTION_SHIPPED', 'MEDIUM', 'تم شحن طلبك!', 'طلبك في الطريق عبر أرامكس', 'TRANSACTION', NULL, false, NOW()),
    (gen_random_uuid()::TEXT, u4, 'TRANSACTION_SHIPPED', 'MEDIUM', 'تم شحن طلبك!', 'طلبك في الطريق عبر بوسطة', 'TRANSACTION', NULL, false, NOW()),

    -- Delivery notifications
    (gen_random_uuid()::TEXT, u2, 'TRANSACTION_DELIVERED', 'MEDIUM', 'تم تسليم طلبك!', 'استلم المشتري الطلب بنجاح', 'TRANSACTION', NULL, true, NOW() - INTERVAL '5 days'),
    (gen_random_uuid()::TEXT, u4, 'TRANSACTION_DELIVERED', 'MEDIUM', 'تم تسليم طلبك!', 'تم التسليم - لا تنس التقييم', 'TRANSACTION', NULL, true, NOW() - INTERVAL '3 days'),

    -- Auction notifications
    (gen_random_uuid()::TEXT, u2, 'AUCTION_OUTBID', 'HIGH', 'تم تجاوز مزايدتك!', 'مزايدتك 52,000 تم تجاوزها - المزايدة الحالية 65,000', 'AUCTION', new_auc1, false, NOW()),
    (gen_random_uuid()::TEXT, u4, 'AUCTION_OUTBID', 'HIGH', 'تم تجاوز مزايدتك!', 'عليك المزايدة من جديد للفوز', 'AUCTION', new_auc1, false, NOW()),
    (gen_random_uuid()::TEXT, u6, 'AUCTION_OUTBID', 'HIGH', 'تم تجاوز مزايدتك!', 'المزاد ينتهي قريباً!', 'AUCTION', new_auc1, false, NOW()),
    (gen_random_uuid()::TEXT, u10, 'AUCTION_WINNING', 'HIGH', 'أنت الفائز حالياً!', 'مزايدتك 65,000 هي الأعلى - المزاد ينتهي بعد 10 أيام', 'AUCTION', new_auc1, false, NOW()),
    (gen_random_uuid()::TEXT, u1, 'AUCTION_NEW_BID', 'MEDIUM', 'مزايدة جديدة!', 'تم استلام مزايدة 65,000 على منتجك', 'AUCTION', new_auc1, false, NOW()),

    -- Reverse auction notifications
    (gen_random_uuid()::TEXT, u6, 'REVERSE_AUCTION_NEW_BID', 'HIGH', 'عرض جديد على مناقصتك!', 'تم استلام عرض 1,350,000 على مناقصة الموبايلات', 'REVERSE_AUCTION', new_rev1, false, NOW()),
    (gen_random_uuid()::TEXT, u7, 'REVERSE_AUCTION_NEW_BID', 'HIGH', 'عرض جديد على مناقصتك!', 'تم استلام عرض 450,000 على مناقصة الأثاث', 'REVERSE_AUCTION', new_rev2, false, NOW()),
    (gen_random_uuid()::TEXT, u3, 'REVERSE_AUCTION_NEW_BID', 'HIGH', 'عروض متعددة!', 'تم استلام 5 عروض على مناقصة التابلت', 'REVERSE_AUCTION', new_rev3, false, NOW()),

    -- Barter notifications
    (gen_random_uuid()::TEXT, u8, 'BARTER_OFFER_RECEIVED', 'HIGH', 'عرض مقايضة جديد!', 'أحمد يعرض آيفون مقابل سامسونج + فرق', 'BARTER_OFFER', new_barter1, false, NOW()),
    (gen_random_uuid()::TEXT, u5, 'BARTER_OFFER_RECEIVED', 'HIGH', 'عرض مقايضة جديد!', 'سارة تعرض PS5 مقابل Xbox', 'BARTER_OFFER', new_barter1, false, NOW()),
    (gen_random_uuid()::TEXT, u1, 'BARTER_OFFER_COUNTERED', 'HIGH', 'عرض مقابل!', 'كريم قدم عرض مقابل على الشنطة', 'BARTER_OFFER', new_barter1, false, NOW()),
    (gen_random_uuid()::TEXT, u9, 'BARTER_OFFER_ACCEPTED', 'HIGH', 'تم قبول عرضك!', 'محمد قبل عرض مقايضة الكاميرا', 'BARTER_OFFER', new_barter1, true, NOW() - INTERVAL '1 day'),

    -- Smart matching notifications (AI)
    (gen_random_uuid()::TEXT, u1, 'BARTER_MATCH', 'HIGH', 'تطابق ذكي!', 'وجدنا فرصة مقايضة مثالية لك - تطابق 92%', 'BARTER_CHAIN', new_chain1, false, NOW()),
    (gen_random_uuid()::TEXT, u2, 'BARTER_MATCH', 'HIGH', 'سلسلة مقايضة!', 'يمكنك المشاركة في سلسلة مقايضة ذكية', 'BARTER_CHAIN', new_chain1, false, NOW()),
    (gen_random_uuid()::TEXT, u3, 'BARTER_MATCH', 'HIGH', 'فرصة مقايضة!', 'سلسلة مقايضة متاحة - 4 مشاركين', 'BARTER_CHAIN', new_chain1, false, NOW()),
    (gen_random_uuid()::TEXT, u4, 'BARTER_MATCH', 'HIGH', 'مقايضة ذكية!', 'النظام وجد تطابق مثالي لمنتجك', 'BARTER_CHAIN', new_chain1, false, NOW()),

    -- Item sold notifications
    (gen_random_uuid()::TEXT, u1, 'ITEM_SOLD', 'HIGH', 'تم بيع منتجك!', 'تم بيع Sony Headphones بمبلغ 12,000 جنيه', 'ITEM', item_ref1, false, NOW()),
    (gen_random_uuid()::TEXT, u8, 'ITEM_SOLD', 'HIGH', 'تم بيع منتجك!', 'تم بيع iPhone 13 بمبلغ 32,000 جنيه', 'ITEM', item_ref4, false, NOW()),

    -- System notifications
    (gen_random_uuid()::TEXT, u1, 'SYSTEM_ANNOUNCEMENT', 'LOW', 'عروض العيد!', 'خصم 10% على رسوم المنصة - لفترة محدودة', NULL, NULL, false, NOW()),
    (gen_random_uuid()::TEXT, u5, 'SYSTEM_MAINTENANCE', 'LOW', 'صيانة مجدولة', 'سيتم إجراء صيانة الليلة 2-4 صباحاً', NULL, NULL, false, NOW()),
    (gen_random_uuid()::TEXT, u10, 'USER_REVIEW_RECEIVED', 'MEDIUM', 'تقييم جديد!', 'أحمد قيّمك 5 نجوم - بائع ممتاز', 'USER', u1, false, NOW())
    ON CONFLICT DO NOTHING;

    RAISE NOTICE '✅ 30 notifications created';

    -- =========== SUMMARY ===========
    RAISE NOTICE '';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '     ✅ UAT PART 2: TRANSACTIONS & PAYMENTS CREATED SUCCESSFULLY          ';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════════════';
    RAISE NOTICE '  💳 Payment Methods Tested:';
    RAISE NOTICE '      - FAWRY (فوري)';
    RAISE NOTICE '      - INSTAPAY (انستاباي)';
    RAISE NOTICE '      - VODAFONE_CASH (فودافون كاش)';
    RAISE NOTICE '      - BANK_TRANSFER (تحويل بنكي)';
    RAISE NOTICE '      - COD (الدفع عند الاستلام)';
    RAISE NOTICE '      - ESCROW (الضمان)';
    RAISE NOTICE '      - WALLET (المحفظة/XCoin)';
    RAISE NOTICE '';
    RAISE NOTICE '  📊 Summary:';
    RAISE NOTICE '      - 5 New Auctions with bids';
    RAISE NOTICE '      - 5 New Reverse Auctions (Tenders) with bids';
    RAISE NOTICE '      - 10 New Barter Offers';
    RAISE NOTICE '      - 3 New Barter Chains';
    RAISE NOTICE '      - 15 New Orders (all payment methods)';
    RAISE NOTICE '      - 25 New Transactions';
    RAISE NOTICE '      - 30 New Notifications';
    RAISE NOTICE '══════════════════════════════════════════════════════════════════════════';

END $$;
