-- XChange Egypt - Add Missing Scrap Marketplace Columns
-- This migration adds columns that were missing from the scrap marketplace migration

-- ============================================
-- Add Missing Scrap Fields to Items Table
-- ============================================

-- Price per kg for scrap items
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "price_per_kg" DOUBLE PRECISION;

-- Metal purity percentage
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "metal_purity" DOUBLE PRECISION;

-- Repairability fields
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "is_repairable" BOOLEAN;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "repair_cost_estimate" DOUBLE PRECISION;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "working_parts_desc" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "defect_description" TEXT;

-- Add index for price_per_kg queries
CREATE INDEX IF NOT EXISTS "items_price_per_kg_idx" ON "items"("price_per_kg");
