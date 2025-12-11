-- Fix vehicle columns - use correct column names from schema
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_kilometers" INTEGER;

-- Drop incorrect column if exists
ALTER TABLE "items" DROP COLUMN IF EXISTS "vehicle_mileage";

-- Add index for vehicle_kilometers
CREATE INDEX IF NOT EXISTS "items_vehicle_kilometers_idx" ON "items"("vehicle_kilometers");
