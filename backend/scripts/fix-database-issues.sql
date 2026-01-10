-- ================================================
-- Fix Database Issues - Run on Supabase
-- إصلاح مشاكل قاعدة البيانات
-- ================================================

-- 1. Create price_alerts table if not exists
-- إنشاء جدول تنبيهات الأسعار

CREATE TABLE IF NOT EXISTS price_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Target (one of these)
  item_id UUID REFERENCES items(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  search_query TEXT,

  -- Alert conditions
  target_price DECIMAL,
  price_drop_percent DOUBLE PRECISION,
  alert_on_new BOOLEAN DEFAULT true,
  alert_type VARCHAR(20) DEFAULT 'BELOW',

  -- Watchlist notification preferences
  notify_on_price_drop BOOLEAN DEFAULT true,
  notify_on_back_in_stock BOOLEAN DEFAULT true,

  -- Additional filters
  min_condition VARCHAR(20),
  max_price DECIMAL,
  governorate VARCHAR(100),

  -- Notification preferences
  email_alert BOOLEAN DEFAULT true,
  push_alert BOOLEAN DEFAULT true,
  sms_alert BOOLEAN DEFAULT false,

  -- Status
  is_active BOOLEAN DEFAULT true,
  last_triggered_at TIMESTAMP,
  trigger_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP
);

-- Create indexes for price_alerts
CREATE INDEX IF NOT EXISTS idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_item_id ON price_alerts(item_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_category_id ON price_alerts(category_id);
CREATE INDEX IF NOT EXISTS idx_price_alerts_is_active ON price_alerts(is_active);

-- 2. Create Listing records for items without any listings
-- إنشاء سجلات Listing للعناصر التي ليس لديها

INSERT INTO listings (
  id, item_id, user_id, listing_type,
  price, currency, status, start_date, created_at, updated_at
)
SELECT
  gen_random_uuid(),
  i.id,
  i.seller_id,
  'DIRECT_SALE'::"ListingType",
  i.estimated_value,
  'EGP',
  'ACTIVE'::"ListingStatus",
  i.created_at,
  NOW(),
  NOW()
FROM items i
WHERE i.status = 'ACTIVE'
  AND NOT EXISTS (
    SELECT 1 FROM listings l WHERE l.item_id = i.id
  );

-- 3. Report results
SELECT
  (SELECT COUNT(*) FROM price_alerts) as price_alerts_count,
  (SELECT COUNT(*) FROM listings WHERE created_at > NOW() - INTERVAL '5 minutes') as new_listings_count,
  'Database fixes applied successfully!' as status;
