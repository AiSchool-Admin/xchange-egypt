-- ============================================
-- سوق المزادات المتقدم - Advanced Auction Marketplace
-- أفضل نظام مزادات في مصر والشرق الأوسط
-- ============================================

-- إنشاء الأنواع والتعدادات
DO $$ BEGIN
    CREATE TYPE "AuctionType" AS ENUM ('ENGLISH', 'SEALED_BID', 'DUTCH');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AuctionCategory" AS ENUM (
        'CARS', 'REAL_ESTATE', 'MOBILE_PHONES', 'GOLD_JEWELRY', 'SILVER_ITEMS',
        'ELECTRONICS', 'FURNITURE', 'ANTIQUES', 'ART', 'WATCHES',
        'LUXURY_BAGS', 'MACHINERY', 'SCRAP', 'CUSTOMS', 'BANK_ASSETS', 'OTHER'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AuctionDepositStatus" AS ENUM (
        'PENDING', 'PAID', 'HELD', 'REFUNDED', 'FORFEITED', 'APPLIED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "AuctionDisputeStatus" AS ENUM (
        'OPEN', 'UNDER_REVIEW', 'EVIDENCE_REQUESTED', 'ESCALATED',
        'RESOLVED_BUYER', 'RESOLVED_SELLER', 'CLOSED'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "FraudAlertType" AS ENUM (
        'SHILL_BIDDING', 'MULTIPLE_ACCOUNTS', 'RAPID_BIDDING', 'DEVICE_FINGERPRINT',
        'PAYMENT_FRAUD', 'SELLER_COLLUSION', 'FAKE_LISTING', 'SUSPICIOUS_PATTERN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "FraudAlertStatus" AS ENUM (
        'DETECTED', 'INVESTIGATING', 'CONFIRMED', 'FALSE_POSITIVE', 'RESOLVED', 'ACTION_TAKEN'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "BidderTrustLevel" AS ENUM (
        'NEW', 'BASIC', 'VERIFIED', 'TRUSTED', 'POWER_BIDDER', 'PREMIUM'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- تحديث جدول المزادات مع الأعمدة الجديدة
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "auction_type" "AuctionType" DEFAULT 'ENGLISH';
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "auction_category" "AuctionCategory";
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "requires_deposit" BOOLEAN DEFAULT false;
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "deposit_amount" FLOAT;
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "deposit_percentage" FLOAT;
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "watchlist_count" INTEGER DEFAULT 0;
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "is_featured" BOOLEAN DEFAULT false;
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "featured_until" TIMESTAMPTZ;
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "governorate" TEXT;
ALTER TABLE "auctions" ADD COLUMN IF NOT EXISTS "city" TEXT;

-- فهارس للمزادات
CREATE INDEX IF NOT EXISTS "auctions_auction_type_idx" ON "auctions"("auction_type");
CREATE INDEX IF NOT EXISTS "auctions_auction_category_idx" ON "auctions"("auction_category");
CREATE INDEX IF NOT EXISTS "auctions_is_featured_idx" ON "auctions"("is_featured");
CREATE INDEX IF NOT EXISTS "auctions_governorate_idx" ON "auctions"("governorate");

-- ============================================
-- قائمة مراقبة المزادات - Auction Watchlist
-- ============================================
CREATE TABLE IF NOT EXISTS "auction_watchlist" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "notify_on_bid" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_outbid" BOOLEAN NOT NULL DEFAULT true,
    "notify_on_ending" BOOLEAN NOT NULL DEFAULT true,
    "notify_before_end" INTEGER NOT NULL DEFAULT 30,
    "price_threshold" FLOAT,
    "added_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_watchlist_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auction_watchlist_user_id_auction_id_key" UNIQUE ("user_id", "auction_id"),
    CONSTRAINT "auction_watchlist_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "auction_watchlist_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "auction_watchlist_user_id_idx" ON "auction_watchlist"("user_id");
CREATE INDEX IF NOT EXISTS "auction_watchlist_auction_id_idx" ON "auction_watchlist"("auction_id");

-- ============================================
-- الإيداعات والضمانات - Auction Deposits
-- ============================================
CREATE TABLE IF NOT EXISTS "auction_deposits" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "auction_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" FLOAT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "status" "AuctionDepositStatus" NOT NULL DEFAULT 'PENDING',
    "payment_method" TEXT,
    "payment_reference" TEXT,
    "paid_at" TIMESTAMPTZ,
    "refunded_at" TIMESTAMPTZ,
    "refund_reference" TEXT,
    "refund_reason" TEXT,
    "forfeited_at" TIMESTAMPTZ,
    "forfeit_reason" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_deposits_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auction_deposits_auction_user_key" UNIQUE ("auction_id", "user_id"),
    CONSTRAINT "auction_deposits_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE,
    CONSTRAINT "auction_deposits_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "auction_deposits_auction_id_idx" ON "auction_deposits"("auction_id");
CREATE INDEX IF NOT EXISTS "auction_deposits_user_id_idx" ON "auction_deposits"("user_id");
CREATE INDEX IF NOT EXISTS "auction_deposits_status_idx" ON "auction_deposits"("status");

-- ============================================
-- المزادات المختومة - Sealed Bids
-- ============================================
CREATE TABLE IF NOT EXISTS "auction_sealed_bids" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "auction_id" TEXT NOT NULL,
    "bidder_id" TEXT NOT NULL,
    "encrypted_amount" TEXT NOT NULL,
    "bid_hash" TEXT NOT NULL,
    "revealed_amount" FLOAT,
    "is_revealed" BOOLEAN NOT NULL DEFAULT false,
    "revealed_at" TIMESTAMPTZ,
    "notes" TEXT,
    "submitted_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_sealed_bids_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auction_sealed_bids_auction_bidder_key" UNIQUE ("auction_id", "bidder_id"),
    CONSTRAINT "auction_sealed_bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE,
    CONSTRAINT "auction_sealed_bids_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "auction_sealed_bids_auction_id_idx" ON "auction_sealed_bids"("auction_id");
CREATE INDEX IF NOT EXISTS "auction_sealed_bids_bidder_id_idx" ON "auction_sealed_bids"("bidder_id");

-- ============================================
-- النزاعات - Auction Disputes
-- ============================================
CREATE TABLE IF NOT EXISTS "auction_disputes" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "auction_id" TEXT NOT NULL,
    "initiator_id" TEXT NOT NULL,
    "respondent_id" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" "AuctionDisputeStatus" NOT NULL DEFAULT 'OPEN',
    "evidence_urls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "resolution" TEXT,
    "resolved_by_id" TEXT,
    "resolved_at" TIMESTAMPTZ,
    "compensation_amount" FLOAT,
    "compensation_paid_to" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_disputes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auction_disputes_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE,
    CONSTRAINT "auction_disputes_initiator_id_fkey" FOREIGN KEY ("initiator_id") REFERENCES "users"("id"),
    CONSTRAINT "auction_disputes_respondent_id_fkey" FOREIGN KEY ("respondent_id") REFERENCES "users"("id"),
    CONSTRAINT "auction_disputes_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "users"("id")
);

CREATE INDEX IF NOT EXISTS "auction_disputes_auction_id_idx" ON "auction_disputes"("auction_id");
CREATE INDEX IF NOT EXISTS "auction_disputes_initiator_id_idx" ON "auction_disputes"("initiator_id");
CREATE INDEX IF NOT EXISTS "auction_disputes_status_idx" ON "auction_disputes"("status");

-- رسائل النزاع
CREATE TABLE IF NOT EXISTS "auction_dispute_messages" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "dispute_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_from_admin" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_dispute_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auction_dispute_messages_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "auction_disputes"("id") ON DELETE CASCADE,
    CONSTRAINT "auction_dispute_messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "users"("id")
);

CREATE INDEX IF NOT EXISTS "auction_dispute_messages_dispute_id_idx" ON "auction_dispute_messages"("dispute_id");

-- ============================================
-- تقييمات المزادات - Auction Reviews
-- ============================================
CREATE TABLE IF NOT EXISTS "auction_reviews" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "auction_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "reviewee_id" TEXT NOT NULL,
    "overall_rating" FLOAT NOT NULL,
    "accuracy_rating" FLOAT,
    "communication_rating" FLOAT,
    "shipping_rating" FLOAT,
    "payment_rating" FLOAT,
    "comment" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "response" TEXT,
    "responded_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_reviews_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auction_reviews_auction_reviewer_key" UNIQUE ("auction_id", "reviewer_id"),
    CONSTRAINT "auction_reviews_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE,
    CONSTRAINT "auction_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id"),
    CONSTRAINT "auction_reviews_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "users"("id")
);

CREATE INDEX IF NOT EXISTS "auction_reviews_auction_id_idx" ON "auction_reviews"("auction_id");
CREATE INDEX IF NOT EXISTS "auction_reviews_reviewer_id_idx" ON "auction_reviews"("reviewer_id");
CREATE INDEX IF NOT EXISTS "auction_reviews_reviewee_id_idx" ON "auction_reviews"("reviewee_id");

-- ============================================
-- كشف الاحتيال - Fraud Detection
-- ============================================
CREATE TABLE IF NOT EXISTS "auction_fraud_alerts" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "auction_id" TEXT,
    "user_id" TEXT,
    "bid_id" TEXT,
    "alert_type" "FraudAlertType" NOT NULL,
    "status" "FraudAlertStatus" NOT NULL DEFAULT 'DETECTED',
    "description" TEXT NOT NULL,
    "confidence" FLOAT NOT NULL DEFAULT 0,
    "device_fingerprint" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "metadata" JSONB,
    "action_taken" TEXT,
    "action_by_id" TEXT,
    "action_at" TIMESTAMPTZ,
    "detected_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMPTZ,

    CONSTRAINT "auction_fraud_alerts_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auction_fraud_alerts_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id"),
    CONSTRAINT "auction_fraud_alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id"),
    CONSTRAINT "auction_fraud_alerts_action_by_id_fkey" FOREIGN KEY ("action_by_id") REFERENCES "users"("id")
);

CREATE INDEX IF NOT EXISTS "auction_fraud_alerts_auction_id_idx" ON "auction_fraud_alerts"("auction_id");
CREATE INDEX IF NOT EXISTS "auction_fraud_alerts_user_id_idx" ON "auction_fraud_alerts"("user_id");
CREATE INDEX IF NOT EXISTS "auction_fraud_alerts_alert_type_idx" ON "auction_fraud_alerts"("alert_type");
CREATE INDEX IF NOT EXISTS "auction_fraud_alerts_status_idx" ON "auction_fraud_alerts"("status");

-- بصمات الأجهزة
CREATE TABLE IF NOT EXISTS "device_fingerprints" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL UNIQUE,
    "browser" TEXT,
    "os" TEXT,
    "device" TEXT,
    "screen_resolution" TEXT,
    "timezone" TEXT,
    "language" TEXT,
    "ip_addresses" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_trusted" BOOLEAN NOT NULL DEFAULT false,
    "is_flagged" BOOLEAN NOT NULL DEFAULT false,
    "flag_reason" TEXT,
    "first_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_seen_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usage_count" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "device_fingerprints_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "device_fingerprints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "device_fingerprints_user_id_idx" ON "device_fingerprints"("user_id");
CREATE INDEX IF NOT EXISTS "device_fingerprints_fingerprint_idx" ON "device_fingerprints"("fingerprint");
CREATE INDEX IF NOT EXISTS "device_fingerprints_is_flagged_idx" ON "device_fingerprints"("is_flagged");

-- ============================================
-- ملف المزايد - Bidder Profile
-- ============================================
CREATE TABLE IF NOT EXISTS "bidder_profiles" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL UNIQUE,
    "trust_level" "BidderTrustLevel" NOT NULL DEFAULT 'NEW',
    "trust_score" FLOAT NOT NULL DEFAULT 0,
    "total_bids" INTEGER NOT NULL DEFAULT 0,
    "total_wins" INTEGER NOT NULL DEFAULT 0,
    "total_losses" INTEGER NOT NULL DEFAULT 0,
    "win_rate" FLOAT NOT NULL DEFAULT 0,
    "total_bid_amount" FLOAT NOT NULL DEFAULT 0,
    "total_won_amount" FLOAT NOT NULL DEFAULT 0,
    "total_paid_amount" FLOAT NOT NULL DEFAULT 0,
    "completion_rate" FLOAT NOT NULL DEFAULT 100,
    "payment_speed" FLOAT NOT NULL DEFAULT 0,
    "dispute_rate" FLOAT NOT NULL DEFAULT 0,
    "max_bid_limit" FLOAT,
    "daily_bid_limit" INTEGER NOT NULL DEFAULT 50,
    "requires_deposit" BOOLEAN NOT NULL DEFAULT false,
    "deposit_percentage" FLOAT NOT NULL DEFAULT 10,
    "id_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "address_verified" BOOLEAN NOT NULL DEFAULT false,
    "bank_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_suspended" BOOLEAN NOT NULL DEFAULT false,
    "suspended_at" TIMESTAMPTZ,
    "suspend_reason" TEXT,
    "suspend_until" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bidder_profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "bidder_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "bidder_profiles_user_id_idx" ON "bidder_profiles"("user_id");
CREATE INDEX IF NOT EXISTS "bidder_profiles_trust_level_idx" ON "bidder_profiles"("trust_level");

-- ============================================
-- إشعارات المزادات - Auction Notifications
-- ============================================
CREATE TABLE IF NOT EXISTS "auction_notifications" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "user_id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMPTZ,
    "metadata" JSONB,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auction_notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "auction_notifications_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS "auction_notifications_user_id_idx" ON "auction_notifications"("user_id");
CREATE INDEX IF NOT EXISTS "auction_notifications_auction_id_idx" ON "auction_notifications"("auction_id");
CREATE INDEX IF NOT EXISTS "auction_notifications_is_read_idx" ON "auction_notifications"("is_read");
CREATE INDEX IF NOT EXISTS "auction_notifications_created_at_idx" ON "auction_notifications"("created_at");

-- ============================================
-- سجل نشاط المزادات - Auction Activity Log
-- ============================================
CREATE TABLE IF NOT EXISTS "auction_activity_logs" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "auction_id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "details" JSONB,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "device_fingerprint" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_activity_logs_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "auction_activity_logs_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE,
    CONSTRAINT "auction_activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id")
);

CREATE INDEX IF NOT EXISTS "auction_activity_logs_auction_id_idx" ON "auction_activity_logs"("auction_id");
CREATE INDEX IF NOT EXISTS "auction_activity_logs_user_id_idx" ON "auction_activity_logs"("user_id");
CREATE INDEX IF NOT EXISTS "auction_activity_logs_action_idx" ON "auction_activity_logs"("action");
CREATE INDEX IF NOT EXISTS "auction_activity_logs_created_at_idx" ON "auction_activity_logs"("created_at");

-- تحديث التحديثات التلقائية
CREATE OR REPLACE FUNCTION update_auction_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- تفعيل التحديث التلقائي على الجداول
DO $$ BEGIN
    CREATE TRIGGER update_auction_deposits_updated_at
    BEFORE UPDATE ON "auction_deposits"
    FOR EACH ROW EXECUTE PROCEDURE update_auction_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_auction_disputes_updated_at
    BEFORE UPDATE ON "auction_disputes"
    FOR EACH ROW EXECUTE PROCEDURE update_auction_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_auction_reviews_updated_at
    BEFORE UPDATE ON "auction_reviews"
    FOR EACH ROW EXECUTE PROCEDURE update_auction_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TRIGGER update_bidder_profiles_updated_at
    BEFORE UPDATE ON "bidder_profiles"
    FOR EACH ROW EXECUTE PROCEDURE update_auction_updated_at();
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
