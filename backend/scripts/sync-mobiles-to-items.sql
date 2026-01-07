-- Script to sync existing mobile listings to the general marketplace
-- This creates both Item and Listing records (required for cart/purchase)
-- Run this on Railway/Supabase database

-- Step 1: Create a temp table to store the mapping between mobile_listing and item IDs
CREATE TEMP TABLE temp_mobile_item_mapping AS
SELECT
  ml.id as mobile_listing_id,
  ml.seller_id,
  ml.title,
  COALESCE(ml.description, ml.brand || ' ' || ml.model || ' - ' || ml.storage_gb || 'GB') as description,
  ml.price_egp,
  ml.images,
  ml.governorate,
  ml.city,
  ml.district,
  ml.condition_grade,
  ml.created_at,
  gen_random_uuid() as new_item_id
FROM mobile_listings ml
WHERE ml.status = 'ACTIVE'
  AND NOT EXISTS (
    -- Skip if already synced (check by title and seller match)
    SELECT 1 FROM items i WHERE i.seller_id = ml.seller_id AND i.title = ml.title
  );

-- Step 2: Insert items
INSERT INTO items (
  id, seller_id, title, description,
  category_id, condition, estimated_value,
  images, governorate, city, district, status, created_at, updated_at
)
SELECT
  new_item_id,
  seller_id,
  title,
  description,
  '43185192-9afe-4d45-9929-8e194cea9e01',
  (CASE condition_grade
    WHEN 'A' THEN 'LIKE_NEW'
    WHEN 'B' THEN 'GOOD'
    WHEN 'C' THEN 'FAIR'
    WHEN 'D' THEN 'POOR'
    ELSE 'GOOD'
  END)::"ItemCondition",
  price_egp,
  ARRAY(SELECT jsonb_array_elements_text(images)),
  governorate,
  city,
  district,
  'ACTIVE'::"ItemStatus",
  created_at,
  NOW()
FROM temp_mobile_item_mapping;

-- Step 3: Create Listing records for cart/purchase functionality
INSERT INTO listings (
  id, item_id, user_id, listing_type,
  price, currency, status, start_date, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  new_item_id,
  seller_id,
  'DIRECT_SALE'::"ListingType",
  price_egp,
  'EGP',
  'ACTIVE'::"ListingStatus",
  NOW(),
  NOW(),
  NOW()
FROM temp_mobile_item_mapping;

-- Cleanup
DROP TABLE temp_mobile_item_mapping;

-- Report results
SELECT 'Sync complete. Check items and listings tables for new records.' as result;
