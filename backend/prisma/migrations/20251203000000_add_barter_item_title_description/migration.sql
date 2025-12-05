-- AlterTable - Add desired item title and description for barter preferences
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "desired_item_title" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "desired_item_description" TEXT;
