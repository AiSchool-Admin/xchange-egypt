-- ============================================
-- XChange Egypt - Auctions Seed Data
-- Creates Items -> Listings -> Auctions chain
-- ============================================

-- ============================================
-- Step 1: Create AUCTION Items
-- ============================================

-- Auction Item 1: iPhone 14 Pro
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    'auction-item-001',
    'f65fc633-c4fe-4348-9d75-96e99163aa74',
    'cat-electronics',
    'iPhone 14 Pro 256GB - مزاد يبدأ من 20,000 جنيه',
    'آيفون 14 برو 256GB، لون ذهبي، حالة ممتازة. البطارية 92%. يأتي مع الكرتونة الأصلية والشاحن. فرصة ممتازة للحصول على آيفون بسعر مميز!',
    'LIKE_NEW',
    45000,
    ARRAY['https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=800&q=80', 'https://images.unsplash.com/photo-1591337676887-a217a6970a8a?w=800&q=80'],
    'Cairo',
    'Nasr City',
    'AUCTION',
    true,
    'GOLD',
    'ACTIVE',
    NOW(),
    NOW()
);

-- Auction Item 2: MacBook Air M2
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    'auction-item-002',
    'e43722ef-30b0-4cba-8500-de07489d4e73',
    'cat-electronics',
    'MacBook Air M2 مزاد - فرصة لا تعوض',
    'ماك بوك اير M2، ذاكرة 8GB، تخزين 256GB SSD. لون فضي، حالة ممتازة جداً. استخدام 6 أشهر فقط، بطارية 100%. المزاد يبدأ من 25,000 جنيه.',
    'LIKE_NEW',
    50000,
    ARRAY['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800&q=80', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=800&q=80'],
    'Alexandria',
    'Smouha',
    'AUCTION',
    true,
    'PREMIUM',
    'ACTIVE',
    NOW(),
    NOW()
);

-- Auction Item 3: Samsung TV 55"
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, status, created_at, updated_at)
VALUES (
    'auction-item-003',
    'f65fc633-c4fe-4348-9d75-96e99163aa74',
    'cat-electronics',
    'Samsung Smart TV 55" 4K - مزاد',
    'شاشة سامسونج سمارت 55 بوصة، 4K Crystal UHD. موديل 2023. حالة ممتازة، ضمان المحل ساري. المزاد يبدأ من 8,000 جنيه!',
    'LIKE_NEW',
    18000,
    ARRAY['https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=800&q=80', 'https://images.unsplash.com/photo-1461151304267-38535e780c79?w=800&q=80'],
    'Cairo',
    'Downtown',
    'AUCTION',
    true,
    'ACTIVE',
    NOW(),
    NOW()
);

-- Auction Item 4: Antique Furniture
INSERT INTO items (id, seller_id, category_id, title, description, condition, estimated_value, images, governorate, city, listing_type, is_featured, promotion_tier, status, created_at, updated_at)
VALUES (
    'auction-item-004',
    '84696012-b58d-49c0-a940-173078de15c3',
    'cat-furniture',
    'طقم أنتيك نادر - مزاد للمهتمين',
    'طقم أنتيك من القرن التاسع عشر، خشب ماهوجني أصلي. يتضمن كنبة 3 مقاعد + 2 فوتيه + طاولة وسط. قطعة نادرة للمقتنين.',
    'GOOD',
    120000,
    ARRAY['https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&q=80', 'https://images.unsplash.com/photo-1493663284031-b7e3aefcae8e?w=800&q=80'],
    'Cairo',
    'Zamalek',
    'AUCTION',
    true,
    'GOLD',
    'ACTIVE',
    NOW(),
    NOW()
);

-- ============================================
-- Step 2: Create Listings for Auction Items
-- ============================================

INSERT INTO listings (id, item_id, user_id, listing_type, price, starting_bid, current_bid, bid_increment, status, start_date, end_date, created_at, updated_at)
VALUES (
    'listing-auction-001',
    'auction-item-001',
    'f65fc633-c4fe-4348-9d75-96e99163aa74',
    'AUCTION',
    45000,
    20000,
    25500,
    500,
    'ACTIVE',
    NOW(),
    NOW() + INTERVAL '7 days',
    NOW(),
    NOW()
);

INSERT INTO listings (id, item_id, user_id, listing_type, price, starting_bid, current_bid, bid_increment, status, start_date, end_date, created_at, updated_at)
VALUES (
    'listing-auction-002',
    'auction-item-002',
    'e43722ef-30b0-4cba-8500-de07489d4e73',
    'AUCTION',
    50000,
    25000,
    32000,
    1000,
    'ACTIVE',
    NOW(),
    NOW() + INTERVAL '5 days',
    NOW(),
    NOW()
);

INSERT INTO listings (id, item_id, user_id, listing_type, price, starting_bid, current_bid, bid_increment, status, start_date, end_date, created_at, updated_at)
VALUES (
    'listing-auction-003',
    'auction-item-003',
    'f65fc633-c4fe-4348-9d75-96e99163aa74',
    'AUCTION',
    18000,
    8000,
    11500,
    500,
    'ACTIVE',
    NOW(),
    NOW() + INTERVAL '3 days',
    NOW(),
    NOW()
);

INSERT INTO listings (id, item_id, user_id, listing_type, price, starting_bid, current_bid, bid_increment, status, start_date, end_date, created_at, updated_at)
VALUES (
    'listing-auction-004',
    'auction-item-004',
    '84696012-b58d-49c0-a940-173078de15c3',
    'AUCTION',
    120000,
    50000,
    75000,
    5000,
    'ACTIVE',
    NOW(),
    NOW() + INTERVAL '10 days',
    NOW(),
    NOW()
);

-- ============================================
-- Step 3: Create Auctions referencing Listings
-- ============================================

INSERT INTO auctions (id, listing_id, starting_price, current_price, buy_now_price, min_bid_increment, start_time, end_time, auto_extend, extension_minutes, extension_threshold, status, total_bids, unique_bidders, views, created_at, updated_at)
VALUES (
    'auction-001',
    'listing-auction-001',
    20000,
    25500,
    45000,
    500,
    NOW(),
    NOW() + INTERVAL '7 days',
    true,
    5,
    5,
    'ACTIVE',
    11,
    5,
    234,
    NOW(),
    NOW()
);

INSERT INTO auctions (id, listing_id, starting_price, current_price, buy_now_price, min_bid_increment, start_time, end_time, auto_extend, extension_minutes, extension_threshold, status, total_bids, unique_bidders, views, created_at, updated_at)
VALUES (
    'auction-002',
    'listing-auction-002',
    25000,
    32000,
    50000,
    1000,
    NOW(),
    NOW() + INTERVAL '5 days',
    true,
    5,
    5,
    'ACTIVE',
    7,
    4,
    189,
    NOW(),
    NOW()
);

INSERT INTO auctions (id, listing_id, starting_price, current_price, buy_now_price, min_bid_increment, start_time, end_time, auto_extend, extension_minutes, extension_threshold, status, total_bids, unique_bidders, views, created_at, updated_at)
VALUES (
    'auction-003',
    'listing-auction-003',
    8000,
    11500,
    18000,
    500,
    NOW(),
    NOW() + INTERVAL '3 days',
    true,
    5,
    5,
    'ACTIVE',
    7,
    3,
    156,
    NOW(),
    NOW()
);

INSERT INTO auctions (id, listing_id, starting_price, current_price, buy_now_price, min_bid_increment, start_time, end_time, auto_extend, extension_minutes, extension_threshold, status, total_bids, unique_bidders, views, created_at, updated_at)
VALUES (
    'auction-004',
    'listing-auction-004',
    50000,
    75000,
    120000,
    5000,
    NOW(),
    NOW() + INTERVAL '10 days',
    true,
    5,
    5,
    'ACTIVE',
    5,
    3,
    312,
    NOW(),
    NOW()
);

-- ============================================
-- DONE!
-- ============================================
-- Summary:
--   Auction Items: 4
--   Listings: 4
--   Auctions: 4
