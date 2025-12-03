-- Add DIRECT_BUY to ListingType enum
ALTER TYPE "ListingType" ADD VALUE IF NOT EXISTS 'DIRECT_BUY';

-- Add listing_type column to items table
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "listing_type" "ListingType" NOT NULL DEFAULT 'DIRECT_SALE';

-- Create indexes for listing_type
CREATE INDEX IF NOT EXISTS "items_listing_type_idx" ON "items"("listing_type");
CREATE INDEX IF NOT EXISTS "items_listing_type_status_idx" ON "items"("listing_type", "status");
CREATE INDEX IF NOT EXISTS "items_listing_type_category_id_idx" ON "items"("listing_type", "category_id");
