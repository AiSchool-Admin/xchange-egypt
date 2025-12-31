-- Add missing fields to price_alerts table for watchlist functionality

-- AlertType field for price threshold direction
ALTER TABLE "price_alerts" ADD COLUMN "alert_type" TEXT NOT NULL DEFAULT 'BELOW';

-- Watchlist notification preferences
ALTER TABLE "price_alerts" ADD COLUMN "notify_on_price_drop" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "price_alerts" ADD COLUMN "notify_on_back_in_stock" BOOLEAN NOT NULL DEFAULT true;

-- Add foreign key constraint for item relationship (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'price_alerts_item_id_fkey'
    ) THEN
        ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_item_id_fkey"
        FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- Add foreign key constraint for category relationship (if not exists)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'price_alerts_category_id_fkey'
    ) THEN
        ALTER TABLE "price_alerts" ADD CONSTRAINT "price_alerts_category_id_fkey"
        FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;
