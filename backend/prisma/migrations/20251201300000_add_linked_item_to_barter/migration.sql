-- AlterTable: Add linked_item_id to barter_offers for linking demand to supply
ALTER TABLE "barter_offers" ADD COLUMN "linked_item_id" TEXT;

-- CreateIndex
CREATE INDEX "barter_offers_linked_item_id_idx" ON "barter_offers"("linked_item_id");
