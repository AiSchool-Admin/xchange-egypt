-- CreateEnum
CREATE TYPE "PromotionTier" AS ENUM ('BASIC', 'FEATURED', 'PREMIUM', 'GOLD', 'PLATINUM');

-- AlterTable
ALTER TABLE "items" ADD COLUMN "is_featured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "items" ADD COLUMN "promotion_tier" "PromotionTier" NOT NULL DEFAULT 'BASIC';
ALTER TABLE "items" ADD COLUMN "promoted_at" TIMESTAMP(3);
ALTER TABLE "items" ADD COLUMN "promotion_expires_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "items_is_featured_idx" ON "items"("is_featured");

-- CreateIndex
CREATE INDEX "items_promotion_tier_idx" ON "items"("promotion_tier");

-- CreateIndex
CREATE INDEX "items_is_featured_status_idx" ON "items"("is_featured", "status");

-- CreateIndex
CREATE INDEX "items_promotion_expires_at_idx" ON "items"("promotion_expires_at");
