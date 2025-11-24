-- AlterTable: Add barter preference fields to items table
ALTER TABLE "items" ADD COLUMN "desired_category_id" TEXT;
ALTER TABLE "items" ADD COLUMN "desired_keywords" TEXT;
ALTER TABLE "items" ADD COLUMN "desired_value_min" DOUBLE PRECISION;
ALTER TABLE "items" ADD COLUMN "desired_value_max" DOUBLE PRECISION;

-- CreateIndex: Add index for desired_category_id
CREATE INDEX "items_desired_category_id_idx" ON "items"("desired_category_id");
