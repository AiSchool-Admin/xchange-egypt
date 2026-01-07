-- Script to create Listing records for items that don't have them
-- This fixes items that were created before the cart functionality was added
-- Run this on Railway/Supabase database

-- Create Listing records for items without any listings
INSERT INTO listings (
  id, item_id, user_id, listing_type,
  price, currency, status, start_date, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  i.id,
  i.seller_id,
  'DIRECT_SALE'::"ListingType",
  i.estimated_value,
  'EGP',
  'ACTIVE'::"ListingStatus",
  i.created_at,
  NOW(),
  NOW()
FROM items i
WHERE i.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM listings l WHERE l.item_id = i.id
  );

-- Report results
SELECT COUNT(*) as listings_created
FROM listings l
INNER JOIN items i ON l.item_id = i.id
WHERE l.created_at > NOW() - INTERVAL '1 minute';
