-- Add sub-subcategory support to ItemRequest model
-- This enables 3-level category hierarchy: Category > Sub-Category > Sub-Sub-Category

ALTER TABLE "item_requests" ADD COLUMN "sub_subcategory_id" TEXT;

-- Add index for sub_subcategory_id for efficient lookups
CREATE INDEX "item_requests_sub_subcategory_id_idx" ON "item_requests"("sub_subcategory_id");
