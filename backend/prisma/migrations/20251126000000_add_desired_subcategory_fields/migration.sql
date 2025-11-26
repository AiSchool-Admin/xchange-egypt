-- Add desired subcategory fields to items table for 3-level barter matching

-- Add Level 2: Desired Sub-Category
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "desired_sub_category_id" TEXT;

-- Add Level 3: Desired Sub-Sub-Category
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "desired_sub_sub_category_id" TEXT;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS "items_desired_sub_category_id_idx" ON "items"("desired_sub_category_id");
CREATE INDEX IF NOT EXISTS "items_desired_sub_sub_category_id_idx" ON "items"("desired_sub_sub_category_id");

-- Add comments for clarity
COMMENT ON COLUMN "items"."desired_category_id" IS 'Level 1: Primary category or fallback';
COMMENT ON COLUMN "items"."desired_sub_category_id" IS 'Level 2: Sub-category for matching';
COMMENT ON COLUMN "items"."desired_sub_sub_category_id" IS 'Level 3: Most specific category for matching';
