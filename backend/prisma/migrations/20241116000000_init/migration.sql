-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('INDIVIDUAL', 'BUSINESS');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'SUSPENDED', 'DELETED');

-- CreateEnum
CREATE TYPE "ItemCondition" AS ENUM ('NEW', 'LIKE_NEW', 'GOOD', 'FAIR', 'POOR');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('DRAFT', 'ACTIVE', 'SOLD', 'TRADED', 'ARCHIVED', 'DELETED');

-- CreateEnum
CREATE TYPE "ListingType" AS ENUM ('DIRECT_SALE', 'AUCTION', 'REVERSE_AUCTION', 'BARTER');

-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "BarterOfferStatus" AS ENUM ('PENDING', 'COUNTER_OFFERED', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "BarterChainStatus" AS ENUM ('PROPOSED', 'PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ParticipantStatus" AS ENUM ('PENDING', 'ACCEPTED', 'REJECTED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "AuctionStatus" AS ENUM ('DRAFT', 'SCHEDULED', 'ACTIVE', 'ENDED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BidStatus" AS ENUM ('ACTIVE', 'OUTBID', 'WINNING', 'WON', 'LOST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ReverseAuctionStatus" AS ENUM ('DRAFT', 'ACTIVE', 'ENDED', 'AWARDED', 'COMPLETED', 'CANCELLED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ReverseAuctionBidStatus" AS ENUM ('ACTIVE', 'OUTBID', 'WINNING', 'WON', 'LOST', 'WITHDRAWN', 'REJECTED');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DIRECT_SALE', 'AUCTION', 'REVERSE_AUCTION', 'BARTER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "DeliveryStatus" AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED', 'RETURNED');

-- CreateEnum
CREATE TYPE "ReviewStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'FLAGGED', 'HIDDEN');

-- CreateEnum
CREATE TYPE "ReviewType" AS ENUM ('SELLER_REVIEW', 'BUYER_REVIEW', 'ITEM_REVIEW');

-- CreateEnum
CREATE TYPE "ReportReason" AS ENUM ('SPAM', 'OFFENSIVE_LANGUAGE', 'FAKE_REVIEW', 'IRRELEVANT', 'PERSONAL_INFORMATION', 'OTHER');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('AUCTION_NEW_BID', 'AUCTION_OUTBID', 'AUCTION_WINNING', 'AUCTION_WON', 'AUCTION_LOST', 'AUCTION_ENDING_SOON', 'AUCTION_ENDED', 'REVERSE_AUCTION_NEW_REQUEST', 'REVERSE_AUCTION_NEW_BID', 'REVERSE_AUCTION_OUTBID', 'REVERSE_AUCTION_WINNING', 'REVERSE_AUCTION_WON', 'REVERSE_AUCTION_AWARDED', 'REVERSE_AUCTION_ENDING_SOON', 'BARTER_OFFER_RECEIVED', 'BARTER_OFFER_ACCEPTED', 'BARTER_OFFER_REJECTED', 'BARTER_OFFER_COUNTERED', 'BARTER_OFFER_EXPIRED', 'ITEM_SOLD', 'ITEM_PRICE_DROP', 'ITEM_AVAILABLE', 'TRANSACTION_PAYMENT_RECEIVED', 'TRANSACTION_SHIPPED', 'TRANSACTION_DELIVERED', 'USER_WELCOME', 'USER_EMAIL_VERIFICATION', 'USER_PASSWORD_RESET', 'USER_REVIEW_RECEIVED', 'SYSTEM_MAINTENANCE', 'SYSTEM_ANNOUNCEMENT');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'EMAIL', 'SMS', 'PUSH');

-- CreateEnum
CREATE TYPE "NotificationPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "EmailStatus" AS ENUM ('PENDING', 'SENDING', 'SENT', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MessageType" AS ENUM ('TEXT', 'IMAGE', 'FILE', 'ITEM', 'OFFER', 'SYSTEM');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "phone" TEXT,
    "user_type" "UserType" NOT NULL DEFAULT 'INDIVIDUAL',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "avatar" TEXT,
    "bio" TEXT,
    "address" TEXT,
    "city" TEXT,
    "governorate" TEXT,
    "postal_code" TEXT,
    "business_name" TEXT,
    "tax_id" TEXT,
    "commercial_reg_no" TEXT,
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_reviews" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "icon" TEXT,
    "image" TEXT,
    "parent_id" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "condition" "ItemCondition" NOT NULL,
    "estimated_value" DOUBLE PRECISION NOT NULL,
    "images" TEXT[],
    "location" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "specifications" JSONB,
    "status" "ItemStatus" NOT NULL DEFAULT 'ACTIVE',
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "listing_type" "ListingType" NOT NULL,
    "price" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "starting_bid" DOUBLE PRECISION,
    "current_bid" DOUBLE PRECISION,
    "bid_increment" DOUBLE PRECISION,
    "reserve_price" DOUBLE PRECISION,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3),
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "listings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barter_offers" (
    "id" TEXT NOT NULL,
    "initiator_id" TEXT NOT NULL,
    "recipient_id" TEXT,
    "offered_item_ids" TEXT[],
    "offered_bundle_value" DOUBLE PRECISION NOT NULL,
    "matched_preference_set_id" TEXT,
    "notes" TEXT,
    "expires_at" TIMESTAMP(3),
    "is_open_offer" BOOLEAN NOT NULL DEFAULT false,
    "status" "BarterOfferStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "responded_at" TIMESTAMP(3),

    CONSTRAINT "barter_offers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barter_preference_sets" (
    "id" TEXT NOT NULL,
    "barter_offer_id" TEXT NOT NULL,
    "priority" INTEGER NOT NULL,
    "total_value" DOUBLE PRECISION NOT NULL,
    "value_difference" DOUBLE PRECISION NOT NULL,
    "is_balanced" BOOLEAN NOT NULL DEFAULT true,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barter_preference_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barter_preference_items" (
    "id" TEXT NOT NULL,
    "preference_set_id" TEXT NOT NULL,
    "item_id" TEXT NOT NULL,
    "item_value" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barter_preference_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barter_chains" (
    "id" TEXT NOT NULL,
    "chain_type" TEXT NOT NULL,
    "participant_count" INTEGER NOT NULL,
    "match_score" DOUBLE PRECISION NOT NULL,
    "algorithm_version" TEXT NOT NULL DEFAULT '1.0',
    "description" TEXT,
    "status" "BarterChainStatus" NOT NULL DEFAULT 'PROPOSED',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "barter_chains_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "barter_participants" (
    "id" TEXT NOT NULL,
    "chain_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "giving_item_id" TEXT NOT NULL,
    "receiving_item_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" "ParticipantStatus" NOT NULL DEFAULT 'PENDING',
    "response_message" TEXT,
    "responded_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "barter_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auctions" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "starting_price" DOUBLE PRECISION NOT NULL,
    "current_price" DOUBLE PRECISION NOT NULL,
    "buy_now_price" DOUBLE PRECISION,
    "reserve_price" DOUBLE PRECISION,
    "min_bid_increment" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "actual_end_time" TIMESTAMP(3),
    "auto_extend" BOOLEAN NOT NULL DEFAULT true,
    "extension_minutes" INTEGER NOT NULL DEFAULT 5,
    "extension_threshold" INTEGER NOT NULL DEFAULT 5,
    "times_extended" INTEGER NOT NULL DEFAULT 0,
    "max_extensions" INTEGER NOT NULL DEFAULT 3,
    "status" "AuctionStatus" NOT NULL DEFAULT 'DRAFT',
    "total_bids" INTEGER NOT NULL DEFAULT 0,
    "unique_bidders" INTEGER NOT NULL DEFAULT 0,
    "views" INTEGER NOT NULL DEFAULT 0,
    "winner_id" TEXT,
    "winning_bid_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "auction_bids" (
    "id" TEXT NOT NULL,
    "auction_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "bidder_id" TEXT NOT NULL,
    "bid_amount" DOUBLE PRECISION NOT NULL,
    "previous_bid" DOUBLE PRECISION,
    "is_auto_bid" BOOLEAN NOT NULL DEFAULT false,
    "max_auto_bid" DOUBLE PRECISION,
    "status" "BidStatus" NOT NULL DEFAULT 'ACTIVE',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auction_bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reverse_auctions" (
    "id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category_id" TEXT NOT NULL,
    "condition" "ItemCondition" NOT NULL,
    "specifications" JSONB,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "location" TEXT,
    "delivery_preference" TEXT,
    "max_budget" DOUBLE PRECISION,
    "target_price" DOUBLE PRECISION,
    "start_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" "ReverseAuctionStatus" NOT NULL DEFAULT 'DRAFT',
    "total_bids" INTEGER NOT NULL DEFAULT 0,
    "unique_bidders" INTEGER NOT NULL DEFAULT 0,
    "lowest_bid" DOUBLE PRECISION,
    "views" INTEGER NOT NULL DEFAULT 0,
    "winner_id" TEXT,
    "winning_bid_id" TEXT,
    "buyer_notes" TEXT,
    "public_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "awarded_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "reverse_auctions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reverse_auction_bids" (
    "id" TEXT NOT NULL,
    "reverse_auction_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "bid_amount" DOUBLE PRECISION NOT NULL,
    "previous_bid" DOUBLE PRECISION,
    "item_id" TEXT,
    "item_condition" "ItemCondition" NOT NULL,
    "item_description" TEXT,
    "item_images" TEXT[],
    "delivery_option" TEXT NOT NULL,
    "delivery_days" INTEGER,
    "delivery_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notes" TEXT,
    "status" "ReverseAuctionBidStatus" NOT NULL DEFAULT 'ACTIVE',
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reverse_auction_bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "transaction_type" "TransactionType" NOT NULL,
    "amount" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "payment_method" TEXT,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "delivery_status" "DeliveryStatus" NOT NULL DEFAULT 'PENDING',
    "tracking_number" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "reviewed_id" TEXT NOT NULL,
    "review_type" "ReviewType" NOT NULL DEFAULT 'SELLER_REVIEW',
    "overall_rating" INTEGER NOT NULL,
    "item_as_described" INTEGER,
    "communication" INTEGER,
    "shipping_speed" INTEGER,
    "packaging" INTEGER,
    "title" TEXT,
    "comment" TEXT,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_verified_purchase" BOOLEAN NOT NULL DEFAULT false,
    "status" "ReviewStatus" NOT NULL DEFAULT 'APPROVED',
    "helpful_count" INTEGER NOT NULL DEFAULT 0,
    "not_helpful_count" INTEGER NOT NULL DEFAULT 0,
    "report_count" INTEGER NOT NULL DEFAULT 0,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_responses" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "responder_id" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "review_responses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_votes" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_helpful" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "review_reports" (
    "id" TEXT NOT NULL,
    "review_id" TEXT NOT NULL,
    "reporter_id" TEXT NOT NULL,
    "reason" "ReportReason" NOT NULL,
    "description" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "resolved_by" TEXT,
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "review_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "wish_list_items" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category_id" TEXT,
    "description" TEXT NOT NULL,
    "keywords" TEXT[],
    "max_price" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wish_list_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "action_url" TEXT,
    "action_text" TEXT,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "email_enabled" BOOLEAN NOT NULL DEFAULT true,
    "sms_enabled" BOOLEAN NOT NULL DEFAULT false,
    "push_enabled" BOOLEAN NOT NULL DEFAULT true,
    "preferences" JSONB NOT NULL DEFAULT '{}',
    "quiet_hours_start" INTEGER,
    "quiet_hours_end" INTEGER,
    "email_digest" BOOLEAN NOT NULL DEFAULT false,
    "digest_time" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_queue" (
    "id" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "user_id" TEXT,
    "subject" TEXT NOT NULL,
    "html_body" TEXT NOT NULL,
    "text_body" TEXT,
    "template_name" TEXT,
    "template_data" JSONB,
    "notification_type" "NotificationType",
    "entity_type" TEXT,
    "entity_id" TEXT,
    "status" "EmailStatus" NOT NULL DEFAULT 'PENDING',
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "last_attempt_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "error" TEXT,
    "priority" "NotificationPriority" NOT NULL DEFAULT 'MEDIUM',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_for" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "email_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_history" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "query" TEXT NOT NULL,
    "filters" JSONB,
    "results_count" INTEGER NOT NULL DEFAULT 0,
    "category" TEXT,
    "location" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "search_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "popular_searches" (
    "id" TEXT NOT NULL,
    "query" TEXT NOT NULL,
    "search_count" INTEGER NOT NULL DEFAULT 1,
    "trend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "last_searched_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "popular_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_searches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "query" TEXT,
    "filters" JSONB NOT NULL,
    "notify_on_new" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_used_at" TIMESTAMP(3),

    CONSTRAINT "saved_searches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "search_suggestions" (
    "id" TEXT NOT NULL,
    "keyword" TEXT NOT NULL,
    "display_text" TEXT NOT NULL,
    "category" TEXT,
    "click_count" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "search_suggestions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "conversations" (
    "id" TEXT NOT NULL,
    "participant1_id" TEXT NOT NULL,
    "participant2_id" TEXT NOT NULL,
    "item_id" TEXT,
    "transaction_id" TEXT,
    "last_message_at" TIMESTAMP(3),
    "last_message_text" TEXT,
    "unread_count_1" INTEGER NOT NULL DEFAULT 0,
    "unread_count_2" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "recipient_id" TEXT NOT NULL,
    "type" "MessageType" NOT NULL DEFAULT 'TEXT',
    "content" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "item_id" TEXT,
    "offer_id" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'SENT',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "is_edited" BOOLEAN NOT NULL DEFAULT false,
    "edited_at" TIMESTAMP(3),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "typing_indicators" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "typing_indicators_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_presence" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "is_online" BOOLEAN NOT NULL DEFAULT false,
    "last_seen_at" TIMESTAMP(3),
    "socket_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_presence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blocked_users" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "blocked_user_id" TEXT NOT NULL,
    "reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "blocked_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_user_type_idx" ON "users"("user_type");

-- CreateIndex
CREATE INDEX "users_status_idx" ON "users"("status");

-- CreateIndex
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");

-- CreateIndex
CREATE INDEX "refresh_tokens_expires_at_idx" ON "refresh_tokens"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_slug_idx" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "categories_parent_id_idx" ON "categories"("parent_id");

-- CreateIndex
CREATE INDEX "categories_is_active_idx" ON "categories"("is_active");

-- CreateIndex
CREATE INDEX "items_seller_id_idx" ON "items"("seller_id");

-- CreateIndex
CREATE INDEX "items_category_id_idx" ON "items"("category_id");

-- CreateIndex
CREATE INDEX "items_status_idx" ON "items"("status");

-- CreateIndex
CREATE INDEX "items_created_at_idx" ON "items"("created_at");

-- CreateIndex
CREATE INDEX "listings_item_id_idx" ON "listings"("item_id");

-- CreateIndex
CREATE INDEX "listings_user_id_idx" ON "listings"("user_id");

-- CreateIndex
CREATE INDEX "listings_listing_type_idx" ON "listings"("listing_type");

-- CreateIndex
CREATE INDEX "listings_status_idx" ON "listings"("status");

-- CreateIndex
CREATE INDEX "listings_end_date_idx" ON "listings"("end_date");

-- CreateIndex
CREATE INDEX "barter_offers_initiator_id_idx" ON "barter_offers"("initiator_id");

-- CreateIndex
CREATE INDEX "barter_offers_recipient_id_idx" ON "barter_offers"("recipient_id");

-- CreateIndex
CREATE INDEX "barter_offers_status_idx" ON "barter_offers"("status");

-- CreateIndex
CREATE INDEX "barter_offers_expires_at_idx" ON "barter_offers"("expires_at");

-- CreateIndex
CREATE INDEX "barter_offers_is_open_offer_idx" ON "barter_offers"("is_open_offer");

-- CreateIndex
CREATE INDEX "barter_preference_sets_barter_offer_id_idx" ON "barter_preference_sets"("barter_offer_id");

-- CreateIndex
CREATE INDEX "barter_preference_sets_priority_idx" ON "barter_preference_sets"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "barter_preference_sets_barter_offer_id_priority_key" ON "barter_preference_sets"("barter_offer_id", "priority");

-- CreateIndex
CREATE INDEX "barter_preference_items_preference_set_id_idx" ON "barter_preference_items"("preference_set_id");

-- CreateIndex
CREATE INDEX "barter_preference_items_item_id_idx" ON "barter_preference_items"("item_id");

-- CreateIndex
CREATE UNIQUE INDEX "barter_preference_items_preference_set_id_item_id_key" ON "barter_preference_items"("preference_set_id", "item_id");

-- CreateIndex
CREATE INDEX "barter_chains_status_idx" ON "barter_chains"("status");

-- CreateIndex
CREATE INDEX "barter_chains_chain_type_idx" ON "barter_chains"("chain_type");

-- CreateIndex
CREATE INDEX "barter_chains_created_at_idx" ON "barter_chains"("created_at");

-- CreateIndex
CREATE INDEX "barter_chains_expires_at_idx" ON "barter_chains"("expires_at");

-- CreateIndex
CREATE INDEX "barter_participants_chain_id_idx" ON "barter_participants"("chain_id");

-- CreateIndex
CREATE INDEX "barter_participants_user_id_idx" ON "barter_participants"("user_id");

-- CreateIndex
CREATE INDEX "barter_participants_status_idx" ON "barter_participants"("status");

-- CreateIndex
CREATE UNIQUE INDEX "barter_participants_chain_id_user_id_key" ON "barter_participants"("chain_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "auctions_listing_id_key" ON "auctions"("listing_id");

-- CreateIndex
CREATE UNIQUE INDEX "auctions_winning_bid_id_key" ON "auctions"("winning_bid_id");

-- CreateIndex
CREATE INDEX "auctions_status_idx" ON "auctions"("status");

-- CreateIndex
CREATE INDEX "auctions_start_time_idx" ON "auctions"("start_time");

-- CreateIndex
CREATE INDEX "auctions_end_time_idx" ON "auctions"("end_time");

-- CreateIndex
CREATE INDEX "auctions_winner_id_idx" ON "auctions"("winner_id");

-- CreateIndex
CREATE INDEX "auction_bids_auction_id_idx" ON "auction_bids"("auction_id");

-- CreateIndex
CREATE INDEX "auction_bids_listing_id_idx" ON "auction_bids"("listing_id");

-- CreateIndex
CREATE INDEX "auction_bids_bidder_id_idx" ON "auction_bids"("bidder_id");

-- CreateIndex
CREATE INDEX "auction_bids_status_idx" ON "auction_bids"("status");

-- CreateIndex
CREATE INDEX "auction_bids_created_at_idx" ON "auction_bids"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "reverse_auctions_winning_bid_id_key" ON "reverse_auctions"("winning_bid_id");

-- CreateIndex
CREATE INDEX "reverse_auctions_buyer_id_idx" ON "reverse_auctions"("buyer_id");

-- CreateIndex
CREATE INDEX "reverse_auctions_category_id_idx" ON "reverse_auctions"("category_id");

-- CreateIndex
CREATE INDEX "reverse_auctions_status_idx" ON "reverse_auctions"("status");

-- CreateIndex
CREATE INDEX "reverse_auctions_start_date_idx" ON "reverse_auctions"("start_date");

-- CreateIndex
CREATE INDEX "reverse_auctions_end_date_idx" ON "reverse_auctions"("end_date");

-- CreateIndex
CREATE INDEX "reverse_auctions_winner_id_idx" ON "reverse_auctions"("winner_id");

-- CreateIndex
CREATE INDEX "reverse_auctions_lowest_bid_idx" ON "reverse_auctions"("lowest_bid");

-- CreateIndex
CREATE INDEX "reverse_auction_bids_reverse_auction_id_idx" ON "reverse_auction_bids"("reverse_auction_id");

-- CreateIndex
CREATE INDEX "reverse_auction_bids_seller_id_idx" ON "reverse_auction_bids"("seller_id");

-- CreateIndex
CREATE INDEX "reverse_auction_bids_item_id_idx" ON "reverse_auction_bids"("item_id");

-- CreateIndex
CREATE INDEX "reverse_auction_bids_status_idx" ON "reverse_auction_bids"("status");

-- CreateIndex
CREATE INDEX "reverse_auction_bids_bid_amount_idx" ON "reverse_auction_bids"("bid_amount");

-- CreateIndex
CREATE INDEX "reverse_auction_bids_created_at_idx" ON "reverse_auction_bids"("created_at");

-- CreateIndex
CREATE INDEX "transactions_listing_id_idx" ON "transactions"("listing_id");

-- CreateIndex
CREATE INDEX "transactions_buyer_id_idx" ON "transactions"("buyer_id");

-- CreateIndex
CREATE INDEX "transactions_seller_id_idx" ON "transactions"("seller_id");

-- CreateIndex
CREATE INDEX "transactions_payment_status_idx" ON "transactions"("payment_status");

-- CreateIndex
CREATE INDEX "transactions_delivery_status_idx" ON "transactions"("delivery_status");

-- CreateIndex
CREATE INDEX "reviews_transaction_id_idx" ON "reviews"("transaction_id");

-- CreateIndex
CREATE INDEX "reviews_reviewer_id_idx" ON "reviews"("reviewer_id");

-- CreateIndex
CREATE INDEX "reviews_reviewed_id_idx" ON "reviews"("reviewed_id");

-- CreateIndex
CREATE INDEX "reviews_overall_rating_idx" ON "reviews"("overall_rating");

-- CreateIndex
CREATE INDEX "reviews_status_idx" ON "reviews"("status");

-- CreateIndex
CREATE INDEX "reviews_is_verified_purchase_idx" ON "reviews"("is_verified_purchase");

-- CreateIndex
CREATE INDEX "reviews_created_at_idx" ON "reviews"("created_at");

-- CreateIndex
CREATE INDEX "reviews_helpful_count_idx" ON "reviews"("helpful_count");

-- CreateIndex
CREATE UNIQUE INDEX "reviews_transaction_id_reviewer_id_key" ON "reviews"("transaction_id", "reviewer_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_responses_review_id_key" ON "review_responses"("review_id");

-- CreateIndex
CREATE INDEX "review_responses_review_id_idx" ON "review_responses"("review_id");

-- CreateIndex
CREATE INDEX "review_responses_responder_id_idx" ON "review_responses"("responder_id");

-- CreateIndex
CREATE INDEX "review_responses_created_at_idx" ON "review_responses"("created_at");

-- CreateIndex
CREATE INDEX "review_votes_review_id_idx" ON "review_votes"("review_id");

-- CreateIndex
CREATE INDEX "review_votes_user_id_idx" ON "review_votes"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "review_votes_review_id_user_id_key" ON "review_votes"("review_id", "user_id");

-- CreateIndex
CREATE INDEX "review_reports_review_id_idx" ON "review_reports"("review_id");

-- CreateIndex
CREATE INDEX "review_reports_reporter_id_idx" ON "review_reports"("reporter_id");

-- CreateIndex
CREATE INDEX "review_reports_is_resolved_idx" ON "review_reports"("is_resolved");

-- CreateIndex
CREATE INDEX "review_reports_created_at_idx" ON "review_reports"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "review_reports_review_id_reporter_id_key" ON "review_reports"("review_id", "reporter_id");

-- CreateIndex
CREATE INDEX "wish_list_items_user_id_idx" ON "wish_list_items"("user_id");

-- CreateIndex
CREATE INDEX "wish_list_items_category_id_idx" ON "wish_list_items"("category_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_type_idx" ON "notifications"("type");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "notifications_priority_idx" ON "notifications"("priority");

-- CreateIndex
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateIndex
CREATE INDEX "notifications_expires_at_idx" ON "notifications"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_user_id_key" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "notification_preferences_user_id_idx" ON "notification_preferences"("user_id");

-- CreateIndex
CREATE INDEX "email_queue_status_idx" ON "email_queue"("status");

-- CreateIndex
CREATE INDEX "email_queue_priority_idx" ON "email_queue"("priority");

-- CreateIndex
CREATE INDEX "email_queue_created_at_idx" ON "email_queue"("created_at");

-- CreateIndex
CREATE INDEX "email_queue_scheduled_for_idx" ON "email_queue"("scheduled_for");

-- CreateIndex
CREATE INDEX "email_queue_user_id_idx" ON "email_queue"("user_id");

-- CreateIndex
CREATE INDEX "search_history_user_id_idx" ON "search_history"("user_id");

-- CreateIndex
CREATE INDEX "search_history_query_idx" ON "search_history"("query");

-- CreateIndex
CREATE INDEX "search_history_created_at_idx" ON "search_history"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "popular_searches_query_key" ON "popular_searches"("query");

-- CreateIndex
CREATE INDEX "popular_searches_search_count_idx" ON "popular_searches"("search_count");

-- CreateIndex
CREATE INDEX "popular_searches_trend_idx" ON "popular_searches"("trend");

-- CreateIndex
CREATE INDEX "popular_searches_last_searched_at_idx" ON "popular_searches"("last_searched_at");

-- CreateIndex
CREATE INDEX "saved_searches_user_id_idx" ON "saved_searches"("user_id");

-- CreateIndex
CREATE INDEX "saved_searches_created_at_idx" ON "saved_searches"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "search_suggestions_keyword_key" ON "search_suggestions"("keyword");

-- CreateIndex
CREATE INDEX "search_suggestions_keyword_idx" ON "search_suggestions"("keyword");

-- CreateIndex
CREATE INDEX "search_suggestions_category_idx" ON "search_suggestions"("category");

-- CreateIndex
CREATE INDEX "search_suggestions_is_active_idx" ON "search_suggestions"("is_active");

-- CreateIndex
CREATE INDEX "search_suggestions_priority_idx" ON "search_suggestions"("priority");

-- CreateIndex
CREATE INDEX "conversations_participant1_id_idx" ON "conversations"("participant1_id");

-- CreateIndex
CREATE INDEX "conversations_participant2_id_idx" ON "conversations"("participant2_id");

-- CreateIndex
CREATE INDEX "conversations_item_id_idx" ON "conversations"("item_id");

-- CreateIndex
CREATE INDEX "conversations_transaction_id_idx" ON "conversations"("transaction_id");

-- CreateIndex
CREATE INDEX "conversations_last_message_at_idx" ON "conversations"("last_message_at");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_participant1_id_participant2_id_key" ON "conversations"("participant1_id", "participant2_id");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- CreateIndex
CREATE INDEX "messages_sender_id_idx" ON "messages"("sender_id");

-- CreateIndex
CREATE INDEX "messages_recipient_id_idx" ON "messages"("recipient_id");

-- CreateIndex
CREATE INDEX "messages_created_at_idx" ON "messages"("created_at");

-- CreateIndex
CREATE INDEX "messages_status_idx" ON "messages"("status");

-- CreateIndex
CREATE INDEX "messages_is_read_idx" ON "messages"("is_read");

-- CreateIndex
CREATE INDEX "typing_indicators_conversation_id_idx" ON "typing_indicators"("conversation_id");

-- CreateIndex
CREATE INDEX "typing_indicators_expires_at_idx" ON "typing_indicators"("expires_at");

-- CreateIndex
CREATE UNIQUE INDEX "typing_indicators_conversation_id_user_id_key" ON "typing_indicators"("conversation_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_presence_user_id_key" ON "user_presence"("user_id");

-- CreateIndex
CREATE INDEX "user_presence_user_id_idx" ON "user_presence"("user_id");

-- CreateIndex
CREATE INDEX "user_presence_is_online_idx" ON "user_presence"("is_online");

-- CreateIndex
CREATE INDEX "blocked_users_user_id_idx" ON "blocked_users"("user_id");

-- CreateIndex
CREATE INDEX "blocked_users_blocked_user_id_idx" ON "blocked_users"("blocked_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "blocked_users_user_id_blocked_user_id_key" ON "blocked_users"("user_id", "blocked_user_id");

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "listings" ADD CONSTRAINT "listings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barter_offers" ADD CONSTRAINT "barter_offers_initiator_id_fkey" FOREIGN KEY ("initiator_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barter_offers" ADD CONSTRAINT "barter_offers_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barter_preference_sets" ADD CONSTRAINT "barter_preference_sets_barter_offer_id_fkey" FOREIGN KEY ("barter_offer_id") REFERENCES "barter_offers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barter_preference_items" ADD CONSTRAINT "barter_preference_items_preference_set_id_fkey" FOREIGN KEY ("preference_set_id") REFERENCES "barter_preference_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barter_preference_items" ADD CONSTRAINT "barter_preference_items_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barter_participants" ADD CONSTRAINT "barter_participants_chain_id_fkey" FOREIGN KEY ("chain_id") REFERENCES "barter_chains"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barter_participants" ADD CONSTRAINT "barter_participants_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barter_participants" ADD CONSTRAINT "barter_participants_giving_item_id_fkey" FOREIGN KEY ("giving_item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "barter_participants" ADD CONSTRAINT "barter_participants_receiving_item_id_fkey" FOREIGN KEY ("receiving_item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auctions" ADD CONSTRAINT "auctions_winning_bid_id_fkey" FOREIGN KEY ("winning_bid_id") REFERENCES "auction_bids"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_bids" ADD CONSTRAINT "auction_bids_auction_id_fkey" FOREIGN KEY ("auction_id") REFERENCES "auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_bids" ADD CONSTRAINT "auction_bids_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "auction_bids" ADD CONSTRAINT "auction_bids_bidder_id_fkey" FOREIGN KEY ("bidder_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reverse_auctions" ADD CONSTRAINT "reverse_auctions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reverse_auctions" ADD CONSTRAINT "reverse_auctions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reverse_auctions" ADD CONSTRAINT "reverse_auctions_winning_bid_id_fkey" FOREIGN KEY ("winning_bid_id") REFERENCES "reverse_auction_bids"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reverse_auction_bids" ADD CONSTRAINT "reverse_auction_bids_reverse_auction_id_fkey" FOREIGN KEY ("reverse_auction_id") REFERENCES "reverse_auctions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reverse_auction_bids" ADD CONSTRAINT "reverse_auction_bids_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reverse_auction_bids" ADD CONSTRAINT "reverse_auction_bids_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_transaction_id_fkey" FOREIGN KEY ("transaction_id") REFERENCES "transactions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_reviewed_id_fkey" FOREIGN KEY ("reviewed_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_responses" ADD CONSTRAINT "review_responses_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_votes" ADD CONSTRAINT "review_votes_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "review_reports" ADD CONSTRAINT "review_reports_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "reviews"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wish_list_items" ADD CONSTRAINT "wish_list_items_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "wish_list_items" ADD CONSTRAINT "wish_list_items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
