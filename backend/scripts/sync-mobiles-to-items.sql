-- Script to sync existing mobile listings to the general marketplace (items table)
-- Run this on Railway/Supabase database

INSERT INTO items (
  id, seller_id, title, description,
  category_id, condition, estimated_value,
  images, governorate, city, district, status, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  seller_id,
  title,
  COALESCE(description, brand || ' ' || model || ' - ' || storage_gb || 'GB'),
  '43185192-9afe-4d45-9929-8e194cea9e01',
  CASE condition_grade
    WHEN 'A' THEN 'LIKE_NEW'
    WHEN 'B' THEN 'GOOD'
    WHEN 'C' THEN 'FAIR'
    WHEN 'D' THEN 'POOR'
    ELSE 'GOOD'
  END,
  price_egp,
  images,
  governorate,
  city,
  district,
  'ACTIVE',
  created_at,
  NOW()
FROM mobile_listings
WHERE status = 'ACTIVE';
