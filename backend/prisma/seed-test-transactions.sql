-- =====================================================
-- TEST TRANSACTIONS FOR XCHANGE PLATFORM
-- =====================================================
-- This creates sample transactions between test users
-- Run this AFTER running seed-test-accounts.sql
-- =====================================================

-- =====================================================
-- STEP 1: CREATE LISTINGS FROM ITEMS
-- =====================================================

-- Create listings for all test items
INSERT INTO listings (id, item_id, user_id, listing_type, price, status, start_date, created_at, updated_at)
SELECT
  gen_random_uuid(),
  i.id,
  i.seller_id,
  i.listing_type,
  i.estimated_value,
  'ACTIVE',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days',
  NOW()
FROM items i
JOIN users u ON i.seller_id = u.id
WHERE u.email LIKE 'test%@xchange.eg'
ON CONFLICT DO NOTHING;

-- =====================================================
-- STEP 2: DIRECT SALE TRANSACTIONS (Completed Purchases)
-- =====================================================

-- Transaction 1: test2 buys iPhone from test1
INSERT INTO transactions (id, listing_id, buyer_id, seller_id, transaction_type, amount, currency, payment_status, delivery_status, payment_method, created_at, updated_at, completed_at)
SELECT
  gen_random_uuid(),
  l.id,
  (SELECT id FROM users WHERE email = 'test2@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test1@xchange.eg'),
  'DIRECT_SALE',
  75000,
  'EGP',
  'COMPLETED',
  'DELIVERED',
  'CASH_ON_DELIVERY',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
FROM listings l
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%آيفون 15%'
LIMIT 1;

-- Transaction 2: test6 buys MacBook from test1
INSERT INTO transactions (id, listing_id, buyer_id, seller_id, transaction_type, amount, currency, payment_status, delivery_status, payment_method, created_at, updated_at, completed_at)
SELECT
  gen_random_uuid(),
  l.id,
  (SELECT id FROM users WHERE email = 'test6@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test1@xchange.eg'),
  'DIRECT_SALE',
  55000,
  'EGP',
  'COMPLETED',
  'DELIVERED',
  'BANK_TRANSFER',
  NOW() - INTERVAL '4 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
FROM listings l
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%ماك بوك%'
LIMIT 1;

-- Transaction 3: test7 buys Rolex from test5 (Luxury)
INSERT INTO transactions (id, listing_id, buyer_id, seller_id, transaction_type, amount, currency, payment_status, delivery_status, payment_method, created_at, updated_at, completed_at)
SELECT
  gen_random_uuid(),
  l.id,
  (SELECT id FROM users WHERE email = 'test7@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test5@xchange.eg'),
  'DIRECT_SALE',
  850000,
  'EGP',
  'COMPLETED',
  'DELIVERED',
  'BANK_TRANSFER',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '1 day',
  NOW() - INTERVAL '1 day'
FROM listings l
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%رولكس%'
LIMIT 1;

-- Transaction 4: test10 buys Coins from test9 (Collectibles)
INSERT INTO transactions (id, listing_id, buyer_id, seller_id, transaction_type, amount, currency, payment_status, delivery_status, payment_method, created_at, updated_at)
SELECT
  gen_random_uuid(),
  l.id,
  (SELECT id FROM users WHERE email = 'test10@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test9@xchange.eg'),
  'DIRECT_SALE',
  35000,
  'EGP',
  'COMPLETED',
  'SHIPPED',
  'CASH_ON_DELIVERY',
  NOW() - INTERVAL '2 days',
  NOW()
FROM listings l
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%عملات مصرية%'
LIMIT 1;

-- Transaction 5: test3 buys Copper Scrap from test4 (Scrap Market)
INSERT INTO transactions (id, listing_id, buyer_id, seller_id, transaction_type, amount, currency, payment_status, delivery_status, payment_method, created_at, updated_at)
SELECT
  gen_random_uuid(),
  l.id,
  (SELECT id FROM users WHERE email = 'test3@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test4@xchange.eg'),
  'DIRECT_SALE',
  15000,
  'EGP',
  'PENDING',
  'PENDING',
  'CASH_ON_DELIVERY',
  NOW() - INTERVAL '1 day',
  NOW()
FROM listings l
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%نحاس%'
LIMIT 1;

-- =====================================================
-- STEP 3: BARTER OFFERS (Pending & Completed)
-- =====================================================

-- Barter Offer 1: test2 offers Sofa to test6 for Real Estate exchange
INSERT INTO barter_offers (id, initiator_id, recipient_id, status, offered_item_ids, offered_bundle_value, requested_cash_amount, market_type, governorate, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'test2@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test6@xchange.eg'),
  'PENDING',
  ARRAY[(SELECT i.id FROM items i JOIN users u ON i.seller_id = u.id WHERE u.email = 'test2@xchange.eg' AND i.title LIKE '%أريكة%' LIMIT 1)],
  25000,
  0,
  'GOVERNORATE',
  'Cairo',
  'أريد مقايضة الأريكة بشقة صغيرة أو محل تجاري مع دفع الفرق',
  NOW() - INTERVAL '3 days',
  NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'test2@xchange.eg');

-- Barter Offer 2: test7 offers Dior bags to test9 for Antiques
INSERT INTO barter_offers (id, initiator_id, recipient_id, status, offered_item_ids, offered_bundle_value, market_type, governorate, notes, created_at, updated_at, responded_at)
SELECT
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'test7@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test9@xchange.eg'),
  'ACCEPTED',
  ARRAY[(SELECT i.id FROM items i JOIN users u ON i.seller_id = u.id WHERE u.email = 'test7@xchange.eg' AND i.title LIKE '%ديور%' LIMIT 1)],
  120000,
  'NATIONAL',
  'Cairo',
  'أقايض حقائب ديور بالطقم الأنتيك الصيني - صفقة رائعة للطرفين',
  NOW() - INTERVAL '5 days',
  NOW() - INTERVAL '2 days',
  NOW() - INTERVAL '2 days'
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'test7@xchange.eg');

-- Barter Offer 3: test10 offers Ping Pong table to test2 for Samsung
INSERT INTO barter_offers (id, initiator_id, recipient_id, status, offered_item_ids, offered_bundle_value, offered_cash_amount, market_type, governorate, notes, created_at, updated_at)
SELECT
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'test10@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test2@xchange.eg'),
  'PENDING',
  ARRAY[(SELECT i.id FROM items i JOIN users u ON i.seller_id = u.id WHERE u.email = 'test10@xchange.eg' AND i.title LIKE '%بينج بونج%' LIMIT 1)],
  15000,
  45000,
  'GOVERNORATE',
  'Alexandria',
  'أعرض طاولة بينج بونج + 45,000 جنيه مقابل سامسونج S24 Ultra',
  NOW() - INTERVAL '1 day',
  NOW()
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'test10@xchange.eg');

-- Barter Offer 4: Completed barter between test9 and test2
INSERT INTO barter_offers (id, initiator_id, recipient_id, status, offered_item_ids, offered_bundle_value, market_type, governorate, notes, created_at, updated_at, responded_at)
SELECT
  gen_random_uuid(),
  (SELECT id FROM users WHERE email = 'test9@xchange.eg'),
  (SELECT id FROM users WHERE email = 'test2@xchange.eg'),
  'COMPLETED',
  ARRAY[(SELECT i.id FROM items i JOIN users u ON i.seller_id = u.id WHERE u.email = 'test9@xchange.eg' AND i.title LIKE '%أنتيك%' LIMIT 1)],
  45000,
  'NATIONAL',
  'Alexandria',
  'تمت المقايضة بنجاح - شكراً على التعامل الراقي',
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '7 days',
  NOW() - INTERVAL '7 days'
WHERE EXISTS (SELECT 1 FROM users WHERE email = 'test9@xchange.eg');

-- =====================================================
-- STEP 4: AUCTIONS WITH BIDS
-- =====================================================

-- Create Auction 1: Mercedes E200 (test3)
INSERT INTO auctions (id, listing_id, starting_price, current_price, reserve_price, min_bid_increment, start_time, end_time, status, total_bids, unique_bidders, views, auto_extend, extension_minutes, max_extensions, created_at, updated_at)
SELECT
  gen_random_uuid(),
  l.id,
  1200000,
  1450000,
  1400000,
  10000,
  NOW() - INTERVAL '5 days',
  NOW() + INTERVAL '2 days',
  'ACTIVE',
  8,
  4,
  156,
  true,
  5,
  3,
  NOW() - INTERVAL '5 days',
  NOW()
FROM listings l
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%مرسيدس%'
LIMIT 1;

-- Create Auction 2: BMW X5 (test8)
INSERT INTO auctions (id, listing_id, starting_price, current_price, reserve_price, min_bid_increment, start_time, end_time, status, total_bids, unique_bidders, views, auto_extend, created_at, updated_at)
SELECT
  gen_random_uuid(),
  l.id,
  2500000,
  2850000,
  2700000,
  25000,
  NOW() - INTERVAL '3 days',
  NOW() + INTERVAL '4 days',
  'ACTIVE',
  5,
  3,
  89,
  true,
  NOW() - INTERVAL '3 days',
  NOW()
FROM listings l
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%BMW X5%'
LIMIT 1;

-- Create Auction 3: Sony Camera (test3) - Ended with winner
INSERT INTO auctions (id, listing_id, starting_price, current_price, reserve_price, min_bid_increment, start_time, end_time, actual_end_time, status, total_bids, unique_bidders, views, winner_id, created_at, updated_at)
SELECT
  gen_random_uuid(),
  l.id,
  80000,
  115000,
  100000,
  5000,
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '3 days',
  NOW() - INTERVAL '3 days',
  'COMPLETED',
  12,
  5,
  234,
  (SELECT id FROM users WHERE email = 'test5@xchange.eg'),
  NOW() - INTERVAL '10 days',
  NOW() - INTERVAL '3 days'
FROM listings l
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%سوني A7IV%'
LIMIT 1;

-- Create Auction 4: Antique Pocket Watch (test9)
INSERT INTO auctions (id, listing_id, starting_price, current_price, reserve_price, min_bid_increment, start_time, end_time, status, total_bids, unique_bidders, views, auto_extend, created_at, updated_at)
SELECT
  gen_random_uuid(),
  l.id,
  150000,
  175000,
  160000,
  5000,
  NOW() - INTERVAL '2 days',
  NOW() + INTERVAL '5 days',
  'ACTIVE',
  4,
  3,
  67,
  true,
  NOW() - INTERVAL '2 days',
  NOW()
FROM listings l
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%ساعة جيب%'
LIMIT 1;

-- =====================================================
-- STEP 5: AUCTION BIDS
-- =====================================================

-- Bids on Mercedes auction
INSERT INTO auction_bids (id, auction_id, listing_id, bidder_id, bid_amount, status, created_at)
SELECT
  gen_random_uuid(),
  a.id,
  a.listing_id,
  (SELECT id FROM users WHERE email = 'test5@xchange.eg'),
  1250000,
  'OUTBID',
  NOW() - INTERVAL '4 days'
FROM auctions a
JOIN listings l ON a.listing_id = l.id
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%مرسيدس%'
LIMIT 1;

INSERT INTO auction_bids (id, auction_id, listing_id, bidder_id, bid_amount, status, created_at)
SELECT
  gen_random_uuid(),
  a.id,
  a.listing_id,
  (SELECT id FROM users WHERE email = 'test6@xchange.eg'),
  1350000,
  'OUTBID',
  NOW() - INTERVAL '3 days'
FROM auctions a
JOIN listings l ON a.listing_id = l.id
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%مرسيدس%'
LIMIT 1;

INSERT INTO auction_bids (id, auction_id, listing_id, bidder_id, bid_amount, status, created_at)
SELECT
  gen_random_uuid(),
  a.id,
  a.listing_id,
  (SELECT id FROM users WHERE email = 'test8@xchange.eg'),
  1450000,
  'WINNING',
  NOW() - INTERVAL '1 day'
FROM auctions a
JOIN listings l ON a.listing_id = l.id
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%مرسيدس%'
LIMIT 1;

-- Bids on BMW auction
INSERT INTO auction_bids (id, auction_id, listing_id, bidder_id, bid_amount, status, created_at)
SELECT
  gen_random_uuid(),
  a.id,
  a.listing_id,
  (SELECT id FROM users WHERE email = 'test5@xchange.eg'),
  2600000,
  'OUTBID',
  NOW() - INTERVAL '2 days'
FROM auctions a
JOIN listings l ON a.listing_id = l.id
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%BMW X5%'
LIMIT 1;

INSERT INTO auction_bids (id, auction_id, listing_id, bidder_id, bid_amount, status, created_at)
SELECT
  gen_random_uuid(),
  a.id,
  a.listing_id,
  (SELECT id FROM users WHERE email = 'test6@xchange.eg'),
  2850000,
  'WINNING',
  NOW() - INTERVAL '1 day'
FROM auctions a
JOIN listings l ON a.listing_id = l.id
JOIN items i ON l.item_id = i.id
WHERE i.title LIKE '%BMW X5%'
LIMIT 1;

-- =====================================================
-- STEP 6: UPDATE USER RATINGS & STATS
-- =====================================================

-- Update ratings for active sellers
UPDATE users SET rating = 4.8, total_reviews = 12 WHERE email = 'test1@xchange.eg';
UPDATE users SET rating = 4.5, total_reviews = 8 WHERE email = 'test2@xchange.eg';
UPDATE users SET rating = 4.9, total_reviews = 15 WHERE email = 'test3@xchange.eg';
UPDATE users SET rating = 4.2, total_reviews = 6 WHERE email = 'test4@xchange.eg';
UPDATE users SET rating = 5.0, total_reviews = 20 WHERE email = 'test5@xchange.eg';
UPDATE users SET rating = 4.6, total_reviews = 9 WHERE email = 'test6@xchange.eg';
UPDATE users SET rating = 4.7, total_reviews = 11 WHERE email = 'test7@xchange.eg';
UPDATE users SET rating = 4.4, total_reviews = 7 WHERE email = 'test8@xchange.eg';
UPDATE users SET rating = 4.8, total_reviews = 14 WHERE email = 'test9@xchange.eg';
UPDATE users SET rating = 4.3, total_reviews = 5 WHERE email = 'test10@xchange.eg';

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

SELECT '✅ Listings Created:' as status, COUNT(*) as count FROM listings l
JOIN users u ON l.user_id = u.id WHERE u.email LIKE 'test%@xchange.eg';

SELECT '✅ Transactions Created:' as status, COUNT(*) as count FROM transactions t
JOIN users u ON t.buyer_id = u.id WHERE u.email LIKE 'test%@xchange.eg';

SELECT '✅ Barter Offers Created:' as status, COUNT(*) as count FROM barter_offers b
JOIN users u ON b.initiator_id = u.id WHERE u.email LIKE 'test%@xchange.eg';

SELECT '✅ Auctions Created:' as status, COUNT(*) as count FROM auctions;

SELECT '✅ Auction Bids Created:' as status, COUNT(*) as count FROM auction_bids;

-- =====================================================
-- TRANSACTION SUMMARY
-- =====================================================
--
-- ┌────────────────────────────────────────────────────────────────────────┐
-- │                    DIRECT SALE TRANSACTIONS                            │
-- ├─────────┬─────────┬─────────────────────────┬───────────┬─────────────┤
-- │ Buyer   │ Seller  │ Item                    │ Amount    │ Status      │
-- ├─────────┼─────────┼─────────────────────────┼───────────┼─────────────┤
-- │ test2   │ test1   │ iPhone 15 Pro Max       │ 75,000    │ DELIVERED   │
-- │ test6   │ test1   │ MacBook Air M3          │ 55,000    │ DELIVERED   │
-- │ test7   │ test5   │ Rolex Submariner        │ 850,000   │ DELIVERED   │
-- │ test10  │ test9   │ Egyptian Coins          │ 35,000    │ SHIPPED     │
-- │ test3   │ test4   │ Copper Scrap            │ 15,000    │ PENDING     │
-- └─────────┴─────────┴─────────────────────────┴───────────┴─────────────┘
--
-- ┌────────────────────────────────────────────────────────────────────────┐
-- │                        BARTER OFFERS                                   │
-- ├─────────┬─────────┬─────────────────────────────────────┬─────────────┤
-- │ From    │ To      │ Offer                               │ Status      │
-- ├─────────┼─────────┼─────────────────────────────────────┼─────────────┤
-- │ test2   │ test6   │ Sofa for Real Estate                │ PENDING     │
-- │ test7   │ test9   │ Dior Bags for Antiques              │ ACCEPTED    │
-- │ test10  │ test2   │ Ping Pong + Cash for Samsung        │ PENDING     │
-- │ test9   │ test2   │ Antiques Exchange                   │ COMPLETED   │
-- └─────────┴─────────┴─────────────────────────────────────┴─────────────┘
--
-- ┌────────────────────────────────────────────────────────────────────────┐
-- │                        ACTIVE AUCTIONS                                 │
-- ├─────────┬─────────────────────────┬───────────┬───────────┬───────────┤
-- │ Seller  │ Item                    │ Start     │ Current   │ Bids      │
-- ├─────────┼─────────────────────────┼───────────┼───────────┼───────────┤
-- │ test3   │ Mercedes E200 2020      │ 1,200,000 │ 1,450,000 │ 8 bids    │
-- │ test8   │ BMW X5 2022             │ 2,500,000 │ 2,850,000 │ 5 bids    │
-- │ test9   │ Antique Pocket Watch    │ 150,000   │ 175,000   │ 4 bids    │
-- │ test3   │ Sony A7IV (COMPLETED)   │ 80,000    │ 115,000   │ Winner:5  │
-- └─────────┴─────────────────────────┴───────────┴───────────┴───────────┘
--
-- =====================================================
