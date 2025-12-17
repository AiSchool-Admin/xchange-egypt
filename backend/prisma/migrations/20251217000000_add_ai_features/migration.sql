-- =====================================================
-- AI Features Migration - ميزات الذكاء الاصطناعي
-- =====================================================
-- Creates tables for:
-- 1. Price Predictions (توقعات الأسعار)
-- 2. AI Conversations (محادثات المساعد الذكي)
-- 3. AI Messages (رسائل المساعد)
-- 4. AI Listing Drafts (مسودات الإعلانات الذكية)
-- =====================================================

-- CreateEnum: AI Conversation Status (if not exists)
DO $$ BEGIN
    CREATE TYPE "AIConversationStatus" AS ENUM ('ACTIVE', 'CLOSED', 'ARCHIVED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateEnum: AI Message Role (if not exists)
DO $$ BEGIN
    CREATE TYPE "AIMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable: Price Predictions (توقعات الأسعار)
CREATE TABLE IF NOT EXISTS "price_predictions" (
    "id" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "condition" "ItemCondition" NOT NULL DEFAULT 'GOOD',
    "title" TEXT,
    "description" TEXT,

    -- Prediction results
    "predicted_price" DOUBLE PRECISION NOT NULL,
    "confidence_score" DOUBLE PRECISION NOT NULL,
    "price_range_min" DOUBLE PRECISION NOT NULL,
    "price_range_max" DOUBLE PRECISION NOT NULL,

    -- Prediction factors
    "market_trend" TEXT,
    "demand_level" TEXT,
    "seasonal_factor" DOUBLE PRECISION,
    "competition_level" TEXT,

    -- Data sources
    "sample_size" INTEGER NOT NULL DEFAULT 0,
    "data_quality" TEXT NOT NULL DEFAULT 'LIMITED',
    "model_version" TEXT NOT NULL DEFAULT 'v1.0',

    -- Recommendations
    "suggested_price" DOUBLE PRECISION,
    "price_strategy" TEXT,
    "recommendations" JSONB,

    -- References
    "user_id" TEXT,
    "item_id" TEXT,

    -- Timestamps
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL DEFAULT (CURRENT_TIMESTAMP + INTERVAL '30 days'),

    CONSTRAINT "price_predictions_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AI Conversations (محادثات المساعد الذكي)
CREATE TABLE IF NOT EXISTS "ai_conversations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    -- Conversation details
    "title" TEXT,
    "context" TEXT,
    "status" "AIConversationStatus" NOT NULL DEFAULT 'ACTIVE',

    -- Related entities
    "related_item_id" TEXT,
    "related_offer_id" TEXT,

    -- Stats
    "message_count" INTEGER NOT NULL DEFAULT 0,

    -- Timestamps
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_message_at" TIMESTAMP(3),

    CONSTRAINT "ai_conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AI Messages (رسائل المساعد)
CREATE TABLE IF NOT EXISTS "ai_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,

    -- Message details
    "role" "AIMessageRole" NOT NULL,
    "content" TEXT NOT NULL,
    "metadata" JSONB,

    -- AI-specific
    "model" TEXT,
    "tokens" INTEGER,
    "confidence" DOUBLE PRECISION,

    -- Actions suggested
    "suggested_items" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "suggested_action" TEXT,

    -- Timestamps
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable: AI Listing Drafts (مسودات الإعلانات الذكية)
CREATE TABLE IF NOT EXISTS "ai_listing_drafts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,

    -- Source
    "source_type" TEXT NOT NULL DEFAULT 'TEXT',
    "source_url" TEXT,
    "source_text" TEXT,

    -- AI Generated content
    "generated_title" TEXT,
    "generated_desc" TEXT,
    "generated_category" TEXT,
    "generated_tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "estimated_price" DOUBLE PRECISION,
    "confidence" DOUBLE PRECISION,

    -- Detected attributes
    "detected_brand" TEXT,
    "detected_model" TEXT,
    "detected_condition" TEXT,
    "detected_color" TEXT,

    -- Status
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "published_item_id" TEXT,

    -- Timestamps
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ai_listing_drafts_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey: price_predictions -> categories (only if table exists and constraint doesn't exist)
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'categories') THEN
        IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'price_predictions_category_id_fkey') THEN
            ALTER TABLE "price_predictions"
            ADD CONSTRAINT "price_predictions_category_id_fkey"
            FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
        END IF;
    END IF;
END $$;

-- AddForeignKey: ai_messages -> ai_conversations
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'ai_messages_conversation_id_fkey') THEN
        ALTER TABLE "ai_messages"
        ADD CONSTRAINT "ai_messages_conversation_id_fkey"
        FOREIGN KEY ("conversation_id") REFERENCES "ai_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END $$;

-- CreateIndexes: price_predictions
CREATE INDEX IF NOT EXISTS "price_predictions_category_id_idx" ON "price_predictions"("category_id");
CREATE INDEX IF NOT EXISTS "price_predictions_user_id_idx" ON "price_predictions"("user_id");
CREATE INDEX IF NOT EXISTS "price_predictions_item_id_idx" ON "price_predictions"("item_id");
CREATE INDEX IF NOT EXISTS "price_predictions_created_at_idx" ON "price_predictions"("created_at");

-- CreateIndexes: ai_conversations
CREATE INDEX IF NOT EXISTS "ai_conversations_user_id_idx" ON "ai_conversations"("user_id");
CREATE INDEX IF NOT EXISTS "ai_conversations_status_idx" ON "ai_conversations"("status");
CREATE INDEX IF NOT EXISTS "ai_conversations_created_at_idx" ON "ai_conversations"("created_at");

-- CreateIndexes: ai_messages
CREATE INDEX IF NOT EXISTS "ai_messages_conversation_id_idx" ON "ai_messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "ai_messages_created_at_idx" ON "ai_messages"("created_at");

-- CreateIndexes: ai_listing_drafts
CREATE INDEX IF NOT EXISTS "ai_listing_drafts_user_id_idx" ON "ai_listing_drafts"("user_id");
CREATE INDEX IF NOT EXISTS "ai_listing_drafts_status_idx" ON "ai_listing_drafts"("status");
CREATE INDEX IF NOT EXISTS "ai_listing_drafts_created_at_idx" ON "ai_listing_drafts"("created_at");
