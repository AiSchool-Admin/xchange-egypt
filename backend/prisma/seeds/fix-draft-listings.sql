-- Fix existing DRAFT mobile listings to ACTIVE
-- Run this script once to make existing listings visible

-- Update all DRAFT mobile listings to ACTIVE
UPDATE "mobile_listings"
SET status = 'ACTIVE'
WHERE status = 'DRAFT';

-- Show count of updated listings
SELECT COUNT(*) as updated_count
FROM "mobile_listings"
WHERE status = 'ACTIVE';
