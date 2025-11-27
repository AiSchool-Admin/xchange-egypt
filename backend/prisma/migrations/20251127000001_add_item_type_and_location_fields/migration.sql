-- CreateEnum: ItemType (if not exists)
DO $$ BEGIN
 CREATE TYPE "ItemType" AS ENUM ('GOOD', 'SERVICE', 'CASH');
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;

-- AlterTable: Add item_type and location fields to items
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "item_type" "ItemType" NOT NULL DEFAULT 'GOOD';
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "cash_amount" DOUBLE PRECISION;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "service_hours" DOUBLE PRECISION;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "service_duration" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "latitude" DOUBLE PRECISION;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "longitude" DOUBLE PRECISION;

-- CreateIndex for item_type
CREATE INDEX IF NOT EXISTS "items_item_type_idx" ON "items"("item_type");
