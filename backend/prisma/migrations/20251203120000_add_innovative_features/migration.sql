-- XChange Egypt - Innovative Features Migration
-- نظام المميزات المبتكرة

-- ============================================
-- 1. XCoin Wallet & Economy System
-- ============================================

-- Wallet Transaction Types
CREATE TYPE "WalletTransactionType" AS ENUM (
    'REWARD_SIGNUP',
    'REWARD_FIRST_DEAL',
    'REWARD_REFERRAL',
    'REWARD_REVIEW',
    'REWARD_ACHIEVEMENT',
    'REWARD_DAILY_LOGIN',
    'REWARD_CHALLENGE',
    'RECEIVED_FROM_USER',
    'REFUND',
    'ADMIN_CREDIT',
    'PROMOTE_LISTING',
    'UNLOCK_CONTACT',
    'BARTER_BALANCE',
    'ESCROW_DEPOSIT',
    'SENT_TO_USER',
    'COMMISSION_FEE',
    'ADMIN_DEBIT',
    'ESCROW_FREEZE',
    'ESCROW_RELEASE',
    'ESCROW_REFUND'
);

CREATE TYPE "WalletTransactionStatus" AS ENUM (
    'PENDING',
    'COMPLETED',
    'FAILED',
    'CANCELLED',
    'REVERSED'
);

-- Wallets table
CREATE TABLE "wallets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "frozen_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetime_earned" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "lifetime_spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "wallets_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "wallets_user_id_key" ON "wallets"("user_id");
CREATE INDEX "wallets_balance_idx" ON "wallets"("balance");

-- Wallet Transactions table
CREATE TABLE "wallet_transactions" (
    "id" TEXT NOT NULL,
    "wallet_id" TEXT NOT NULL,
    "type" "WalletTransactionType" NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "balance_before" DOUBLE PRECISION NOT NULL,
    "balance_after" DOUBLE PRECISION NOT NULL,
    "status" "WalletTransactionStatus" NOT NULL DEFAULT 'COMPLETED',
    "related_user_id" TEXT,
    "related_entity_type" TEXT,
    "related_entity_id" TEXT,
    "description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "wallet_transactions_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "wallet_transactions_wallet_id_idx" ON "wallet_transactions"("wallet_id");
CREATE INDEX "wallet_transactions_type_idx" ON "wallet_transactions"("type");
CREATE INDEX "wallet_transactions_status_idx" ON "wallet_transactions"("status");
CREATE INDEX "wallet_transactions_created_at_idx" ON "wallet_transactions"("created_at");
CREATE INDEX "wallet_transactions_related_user_id_idx" ON "wallet_transactions"("related_user_id");

-- ============================================
-- 2. Multi-Dimensional Reputation System
-- ============================================

CREATE TYPE "TrustLevel" AS ENUM (
    'NEWCOMER',
    'BRONZE',
    'SILVER',
    'GOLD',
    'PLATINUM',
    'DIAMOND',
    'ELITE'
);

-- User Reputation table
CREATE TABLE "user_reputations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "trust_level" "TrustLevel" NOT NULL DEFAULT 'NEWCOMER',
    "communication_score" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "reliability_score" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "item_accuracy_score" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "delivery_speed_score" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "fairness_score" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "barter_quality_score" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "total_deals" INTEGER NOT NULL DEFAULT 0,
    "successful_deals" INTEGER NOT NULL DEFAULT 0,
    "disputes_initiated" INTEGER NOT NULL DEFAULT 0,
    "disputes_lost" INTEGER NOT NULL DEFAULT 0,
    "refunds_given" INTEGER NOT NULL DEFAULT 0,
    "badges" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "verified_since" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_calculated_at" TIMESTAMP(3),

    CONSTRAINT "user_reputations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_reputations_user_id_key" ON "user_reputations"("user_id");
CREATE INDEX "user_reputations_overall_score_idx" ON "user_reputations"("overall_score");
CREATE INDEX "user_reputations_trust_level_idx" ON "user_reputations"("trust_level");

-- Reputation History table
CREATE TABLE "reputation_history" (
    "id" TEXT NOT NULL,
    "reputation_id" TEXT NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "trust_level" "TrustLevel" NOT NULL,
    "change_reason" TEXT NOT NULL,
    "change_amount" DOUBLE PRECISION NOT NULL,
    "related_entity_type" TEXT,
    "related_entity_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reputation_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "reputation_history_reputation_id_idx" ON "reputation_history"("reputation_id");
CREATE INDEX "reputation_history_created_at_idx" ON "reputation_history"("created_at");

-- ============================================
-- 3. Smart Escrow & Dispute Resolution
-- ============================================

CREATE TYPE "EscrowStatus" AS ENUM (
    'CREATED',
    'FUNDED',
    'PENDING_DELIVERY',
    'DELIVERED',
    'INSPECTION',
    'RELEASED',
    'DISPUTED',
    'REFUNDED',
    'CANCELLED',
    'EXPIRED'
);

CREATE TYPE "EscrowType" AS ENUM (
    'SALE',
    'BARTER',
    'BARTER_CHAIN',
    'SERVICE'
);

CREATE TYPE "DisputeStatus" AS ENUM (
    'OPEN',
    'UNDER_REVIEW',
    'AWAITING_RESPONSE',
    'MEDIATION',
    'ESCALATED',
    'RESOLVED',
    'CLOSED'
);

CREATE TYPE "DisputeResolution" AS ENUM (
    'BUYER_FAVORED',
    'SELLER_FAVORED',
    'PARTIAL_REFUND',
    'MUTUAL_AGREEMENT',
    'NO_RESOLUTION'
);

CREATE TYPE "DisputeReason" AS ENUM (
    'ITEM_NOT_RECEIVED',
    'ITEM_NOT_AS_DESCRIBED',
    'ITEM_DAMAGED',
    'WRONG_ITEM',
    'PARTIAL_DELIVERY',
    'QUALITY_ISSUE',
    'COUNTERFEIT',
    'SELLER_NOT_RESPONDING',
    'BUYER_NOT_RESPONDING',
    'PAYMENT_ISSUE',
    'OTHER'
);

-- Escrow table
CREATE TABLE "escrows" (
    "id" TEXT NOT NULL,
    "escrow_type" "EscrowType" NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "xcoin_amount" DOUBLE PRECISION,
    "transaction_id" TEXT,
    "barter_offer_id" TEXT,
    "barter_chain_id" TEXT,
    "item_id" TEXT,
    "status" "EscrowStatus" NOT NULL DEFAULT 'CREATED',
    "funded_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "inspection_ends_at" TIMESTAMP(3),
    "released_at" TIMESTAMP(3),
    "auto_release_after" INTEGER NOT NULL DEFAULT 48,
    "auto_release" BOOLEAN NOT NULL DEFAULT true,
    "facilitator_id" TEXT,
    "facilitator_fee" DOUBLE PRECISION,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "expires_at" TIMESTAMP(3),

    CONSTRAINT "escrows_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "escrows_buyer_id_idx" ON "escrows"("buyer_id");
CREATE INDEX "escrows_seller_id_idx" ON "escrows"("seller_id");
CREATE INDEX "escrows_status_idx" ON "escrows"("status");
CREATE INDEX "escrows_transaction_id_idx" ON "escrows"("transaction_id");
CREATE INDEX "escrows_barter_offer_id_idx" ON "escrows"("barter_offer_id");
CREATE INDEX "escrows_barter_chain_id_idx" ON "escrows"("barter_chain_id");
CREATE INDEX "escrows_facilitator_id_idx" ON "escrows"("facilitator_id");

-- Escrow Milestones table
CREATE TABLE "escrow_milestones" (
    "id" TEXT NOT NULL,
    "escrow_id" TEXT NOT NULL,
    "milestone" TEXT NOT NULL,
    "description" TEXT,
    "actor_id" TEXT,
    "actor_type" TEXT,
    "evidence" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "escrow_milestones_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "escrow_milestones_escrow_id_idx" ON "escrow_milestones"("escrow_id");
CREATE INDEX "escrow_milestones_milestone_idx" ON "escrow_milestones"("milestone");

-- Disputes table
CREATE TABLE "disputes" (
    "id" TEXT NOT NULL,
    "escrow_id" TEXT NOT NULL,
    "initiator_id" TEXT NOT NULL,
    "respondent_id" TEXT NOT NULL,
    "reason" "DisputeReason" NOT NULL,
    "description" TEXT NOT NULL,
    "evidence" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "requested_amount" DOUBLE PRECISION,
    "requested_outcome" TEXT,
    "status" "DisputeStatus" NOT NULL DEFAULT 'OPEN',
    "resolution" "DisputeResolution",
    "resolution_amount" DOUBLE PRECISION,
    "resolution_notes" TEXT,
    "resolved_by" TEXT,
    "resolved_at" TIMESTAMP(3),
    "assigned_to" TEXT,
    "assigned_at" TIMESTAMP(3),
    "response_deadline" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "disputes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "disputes_escrow_id_key" ON "disputes"("escrow_id");
CREATE INDEX "disputes_initiator_id_idx" ON "disputes"("initiator_id");
CREATE INDEX "disputes_respondent_id_idx" ON "disputes"("respondent_id");
CREATE INDEX "disputes_status_idx" ON "disputes"("status");
CREATE INDEX "disputes_assigned_to_idx" ON "disputes"("assigned_to");

-- Dispute Messages table
CREATE TABLE "dispute_messages" (
    "id" TEXT NOT NULL,
    "dispute_id" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_role" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dispute_messages_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "dispute_messages_dispute_id_idx" ON "dispute_messages"("dispute_id");
CREATE INDEX "dispute_messages_sender_id_idx" ON "dispute_messages"("sender_id");
CREATE INDEX "dispute_messages_created_at_idx" ON "dispute_messages"("created_at");

-- ============================================
-- 4. Gamification & Achievements System
-- ============================================

CREATE TYPE "AchievementCategory" AS ENUM (
    'TRADING',
    'BARTER',
    'SOCIAL',
    'REPUTATION',
    'SPECIAL',
    'SEASONAL'
);

CREATE TYPE "AchievementRarity" AS ENUM (
    'COMMON',
    'UNCOMMON',
    'RARE',
    'EPIC',
    'LEGENDARY'
);

CREATE TYPE "ChallengeType" AS ENUM (
    'DAILY',
    'WEEKLY',
    'MONTHLY',
    'SPECIAL'
);

-- User Levels table
CREATE TABLE "user_levels" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level" INTEGER NOT NULL DEFAULT 1,
    "current_xp" INTEGER NOT NULL DEFAULT 0,
    "total_xp" INTEGER NOT NULL DEFAULT 0,
    "xp_to_next_level" INTEGER NOT NULL DEFAULT 100,
    "title" TEXT NOT NULL DEFAULT 'مبتدئ',
    "daily_login_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_login_streak" INTEGER NOT NULL DEFAULT 0,
    "last_login_date" TIMESTAMP(3),
    "weekly_deals" INTEGER NOT NULL DEFAULT 0,
    "weekly_xp" INTEGER NOT NULL DEFAULT 0,
    "week_start_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_levels_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_levels_user_id_key" ON "user_levels"("user_id");
CREATE INDEX "user_levels_level_idx" ON "user_levels"("level");
CREATE INDEX "user_levels_total_xp_idx" ON "user_levels"("total_xp");

-- Achievements table
CREATE TABLE "achievements" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "badge_color" TEXT NOT NULL DEFAULT '#FFD700',
    "category" "AchievementCategory" NOT NULL,
    "requirement" INTEGER NOT NULL DEFAULT 1,
    "requirement_type" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "coin_reward" INTEGER NOT NULL DEFAULT 0,
    "rarity" "AchievementRarity" NOT NULL DEFAULT 'COMMON',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_secret" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "achievements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "achievements_code_key" ON "achievements"("code");
CREATE INDEX "achievements_category_idx" ON "achievements"("category");
CREATE INDEX "achievements_is_active_idx" ON "achievements"("is_active");

-- User Achievements table
CREATE TABLE "user_achievements" (
    "id" TEXT NOT NULL,
    "user_level_id" TEXT NOT NULL,
    "achievement_id" TEXT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "rewards_claimed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_achievements_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "user_achievements_user_level_id_achievement_id_key" ON "user_achievements"("user_level_id", "achievement_id");
CREATE INDEX "user_achievements_user_level_id_idx" ON "user_achievements"("user_level_id");
CREATE INDEX "user_achievements_achievement_id_idx" ON "user_achievements"("achievement_id");
CREATE INDEX "user_achievements_is_completed_idx" ON "user_achievements"("is_completed");

-- Challenges table
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "description_en" TEXT NOT NULL,
    "challenge_type" "ChallengeType" NOT NULL,
    "target_value" INTEGER NOT NULL,
    "target_type" TEXT NOT NULL,
    "xp_reward" INTEGER NOT NULL DEFAULT 0,
    "coin_reward" INTEGER NOT NULL DEFAULT 0,
    "special_reward" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "challenges_challenge_type_idx" ON "challenges"("challenge_type");
CREATE INDEX "challenges_is_active_idx" ON "challenges"("is_active");
CREATE INDEX "challenges_start_date_idx" ON "challenges"("start_date");
CREATE INDEX "challenges_end_date_idx" ON "challenges"("end_date");

-- Challenge Participations table
CREATE TABLE "challenge_participations" (
    "id" TEXT NOT NULL,
    "challenge_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "current_value" INTEGER NOT NULL DEFAULT 0,
    "is_completed" BOOLEAN NOT NULL DEFAULT false,
    "completed_at" TIMESTAMP(3),
    "rewards_claimed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenge_participations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "challenge_participations_challenge_id_user_id_key" ON "challenge_participations"("challenge_id", "user_id");
CREATE INDEX "challenge_participations_challenge_id_idx" ON "challenge_participations"("challenge_id");
CREATE INDEX "challenge_participations_user_id_idx" ON "challenge_participations"("user_id");
CREATE INDEX "challenge_participations_is_completed_idx" ON "challenge_participations"("is_completed");

-- ============================================
-- 5. Collective Barter Pools
-- ============================================

CREATE TYPE "BarterPoolStatus" AS ENUM (
    'OPEN',
    'MATCHING',
    'MATCHED',
    'NEGOTIATING',
    'EXECUTING',
    'COMPLETED',
    'FAILED',
    'CANCELLED'
);

-- Barter Pools table
CREATE TABLE "barter_pools" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target_category_id" TEXT,
    "target_description" TEXT NOT NULL,
    "target_min_value" DOUBLE PRECISION NOT NULL,
    "target_max_value" DOUBLE PRECISION NOT NULL,
    "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "participant_count" INTEGER NOT NULL DEFAULT 0,
    "max_participants" INTEGER NOT NULL DEFAULT 10,
    "status" "BarterPoolStatus" NOT NULL DEFAULT 'OPEN',
    "creator_id" TEXT NOT NULL,
    "matched_item_id" TEXT,
    "matched_seller_id" TEXT,
    "matched_value" DOUBLE PRECISION,
    "deadline" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "barter_pools_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "barter_pools_status_idx" ON "barter_pools"("status");
CREATE INDEX "barter_pools_creator_id_idx" ON "barter_pools"("creator_id");
CREATE INDEX "barter_pools_target_category_id_idx" ON "barter_pools"("target_category_id");
CREATE INDEX "barter_pools_deadline_idx" ON "barter_pools"("deadline");

-- Barter Pool Participants table
CREATE TABLE "barter_pool_participants" (
    "id" TEXT NOT NULL,
    "pool_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT,
    "cash_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "xcoin_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_value" DOUBLE PRECISION NOT NULL,
    "share_percentage" DOUBLE PRECISION NOT NULL,
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "barter_pool_participants_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "barter_pool_participants_pool_id_user_id_key" ON "barter_pool_participants"("pool_id", "user_id");
CREATE INDEX "barter_pool_participants_pool_id_idx" ON "barter_pool_participants"("pool_id");
CREATE INDEX "barter_pool_participants_user_id_idx" ON "barter_pool_participants"("user_id");

-- ============================================
-- 6. Certified Facilitators Network
-- ============================================

CREATE TYPE "FacilitatorLevel" AS ENUM (
    'BRONZE',
    'SILVER',
    'GOLD',
    'PLATINUM'
);

CREATE TYPE "FacilitatorStatus" AS ENUM (
    'PENDING',
    'ACTIVE',
    'SUSPENDED',
    'REVOKED'
);

-- Facilitators table
CREATE TABLE "facilitators" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "level" "FacilitatorLevel" NOT NULL DEFAULT 'BRONZE',
    "status" "FacilitatorStatus" NOT NULL DEFAULT 'PENDING',
    "display_name" TEXT NOT NULL,
    "bio" TEXT,
    "specializations" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "service_areas" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 0.03,
    "min_commission" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "insurance_coverage" DOUBLE PRECISION NOT NULL DEFAULT 10000,
    "insurance_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "total_deals" INTEGER NOT NULL DEFAULT 0,
    "successful_deals" INTEGER NOT NULL DEFAULT 0,
    "total_volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "verified_at" TIMESTAMP(3),
    "verified_by" TEXT,
    "id_document" TEXT,
    "commercial_reg" TEXT,
    "is_available" BOOLEAN NOT NULL DEFAULT true,
    "availability_schedule" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "facilitators_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "facilitators_user_id_key" ON "facilitators"("user_id");
CREATE INDEX "facilitators_level_idx" ON "facilitators"("level");
CREATE INDEX "facilitators_status_idx" ON "facilitators"("status");
CREATE INDEX "facilitators_is_available_idx" ON "facilitators"("is_available");

-- Facilitator Assignments table
CREATE TABLE "facilitator_assignments" (
    "id" TEXT NOT NULL,
    "facilitator_id" TEXT NOT NULL,
    "assignment_type" TEXT NOT NULL,
    "escrow_id" TEXT,
    "barter_chain_id" TEXT,
    "buyer_id" TEXT NOT NULL,
    "seller_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ASSIGNED',
    "commission_amount" DOUBLE PRECISION NOT NULL,
    "commission_paid" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "completion_notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),

    CONSTRAINT "facilitator_assignments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "facilitator_assignments_facilitator_id_idx" ON "facilitator_assignments"("facilitator_id");
CREATE INDEX "facilitator_assignments_escrow_id_idx" ON "facilitator_assignments"("escrow_id");
CREATE INDEX "facilitator_assignments_barter_chain_id_idx" ON "facilitator_assignments"("barter_chain_id");
CREATE INDEX "facilitator_assignments_status_idx" ON "facilitator_assignments"("status");

-- Facilitator Reviews table
CREATE TABLE "facilitator_reviews" (
    "id" TEXT NOT NULL,
    "facilitator_id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "assignment_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "professionalism_rating" INTEGER NOT NULL,
    "communication_rating" INTEGER NOT NULL,
    "speed_rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "facilitator_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "facilitator_reviews_assignment_id_reviewer_id_key" ON "facilitator_reviews"("assignment_id", "reviewer_id");
CREATE INDEX "facilitator_reviews_facilitator_id_idx" ON "facilitator_reviews"("facilitator_id");
CREATE INDEX "facilitator_reviews_reviewer_id_idx" ON "facilitator_reviews"("reviewer_id");
CREATE INDEX "facilitator_reviews_rating_idx" ON "facilitator_reviews"("rating");

-- ============================================
-- 7. Referral System
-- ============================================

-- Referrals table
CREATE TABLE "referrals" (
    "id" TEXT NOT NULL,
    "referrer_id" TEXT NOT NULL,
    "referred_id" TEXT NOT NULL,
    "referral_code" TEXT NOT NULL,
    "referrer_reward" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "referred_reward" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "rewards_claimed" BOOLEAN NOT NULL DEFAULT false,
    "claimed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referrals_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "referrals_referred_id_key" ON "referrals"("referred_id");
CREATE INDEX "referrals_referrer_id_idx" ON "referrals"("referrer_id");
CREATE INDEX "referrals_referral_code_idx" ON "referrals"("referral_code");

-- Referral Codes table
CREATE TABLE "referral_codes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "usage_count" INTEGER NOT NULL DEFAULT 0,
    "max_usages" INTEGER,
    "referrer_reward" DOUBLE PRECISION NOT NULL DEFAULT 100,
    "referred_reward" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "referral_codes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "referral_codes_code_key" ON "referral_codes"("code");
CREATE INDEX "referral_codes_user_id_idx" ON "referral_codes"("user_id");
CREATE INDEX "referral_codes_is_active_idx" ON "referral_codes"("is_active");

-- ============================================
-- 8. Platform Analytics & Insights
-- ============================================

-- Market Insights table
CREATE TABLE "market_insights" (
    "id" TEXT NOT NULL,
    "period_type" TEXT NOT NULL,
    "period_start" TIMESTAMP(3) NOT NULL,
    "period_end" TIMESTAMP(3) NOT NULL,
    "category_id" TEXT,
    "governorate" TEXT,
    "total_listings" INTEGER NOT NULL DEFAULT 0,
    "total_deals" INTEGER NOT NULL DEFAULT 0,
    "total_barters" INTEGER NOT NULL DEFAULT 0,
    "total_volume" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avg_price" DOUBLE PRECISION,
    "min_price" DOUBLE PRECISION,
    "max_price" DOUBLE PRECISION,
    "price_change" DOUBLE PRECISION,
    "total_demand" INTEGER NOT NULL DEFAULT 0,
    "supply_demand_ratio" DOUBLE PRECISION,
    "avg_time_to_sell" DOUBLE PRECISION,
    "conversion_rate" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_insights_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "market_insights_period_type_period_start_category_id_governorate_key" ON "market_insights"("period_type", "period_start", "category_id", "governorate");
CREATE INDEX "market_insights_period_type_idx" ON "market_insights"("period_type");
CREATE INDEX "market_insights_period_start_idx" ON "market_insights"("period_start");
CREATE INDEX "market_insights_category_id_idx" ON "market_insights"("category_id");
CREATE INDEX "market_insights_governorate_idx" ON "market_insights"("governorate");

-- XChange Index table
CREATE TABLE "xchange_index" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "index_value" DOUBLE PRECISION NOT NULL,
    "previous_value" DOUBLE PRECISION,
    "change_percent" DOUBLE PRECISION,
    "barter_volume" DOUBLE PRECISION NOT NULL,
    "direct_sale_volume" DOUBLE PRECISION NOT NULL,
    "auction_volume" DOUBLE PRECISION NOT NULL,
    "active_users" INTEGER NOT NULL,
    "new_listings" INTEGER NOT NULL,
    "completed_deals" INTEGER NOT NULL,
    "success_rate" DOUBLE PRECISION NOT NULL,
    "avg_deal_time" DOUBLE PRECISION NOT NULL,
    "dispute_rate" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "xchange_index_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "xchange_index_date_key" ON "xchange_index"("date");
CREATE INDEX "xchange_index_date_idx" ON "xchange_index"("date");

-- ============================================
-- Foreign Key Constraints
-- ============================================

-- Wallet FK
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "wallet_transactions" ADD CONSTRAINT "wallet_transactions_wallet_id_fkey" FOREIGN KEY ("wallet_id") REFERENCES "wallets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Reputation FK
ALTER TABLE "user_reputations" ADD CONSTRAINT "user_reputations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reputation_history" ADD CONSTRAINT "reputation_history_reputation_id_fkey" FOREIGN KEY ("reputation_id") REFERENCES "user_reputations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Escrow & Dispute FK
ALTER TABLE "escrow_milestones" ADD CONSTRAINT "escrow_milestones_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "escrows"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "disputes" ADD CONSTRAINT "disputes_escrow_id_fkey" FOREIGN KEY ("escrow_id") REFERENCES "escrows"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "dispute_messages" ADD CONSTRAINT "dispute_messages_dispute_id_fkey" FOREIGN KEY ("dispute_id") REFERENCES "disputes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Gamification FK
ALTER TABLE "user_levels" ADD CONSTRAINT "user_levels_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_level_id_fkey" FOREIGN KEY ("user_level_id") REFERENCES "user_levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_fkey" FOREIGN KEY ("achievement_id") REFERENCES "achievements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "challenge_participations" ADD CONSTRAINT "challenge_participations_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Barter Pool FK
ALTER TABLE "barter_pool_participants" ADD CONSTRAINT "barter_pool_participants_pool_id_fkey" FOREIGN KEY ("pool_id") REFERENCES "barter_pools"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Facilitator FK
ALTER TABLE "facilitators" ADD CONSTRAINT "facilitators_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "facilitator_assignments" ADD CONSTRAINT "facilitator_assignments_facilitator_id_fkey" FOREIGN KEY ("facilitator_id") REFERENCES "facilitators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "facilitator_reviews" ADD CONSTRAINT "facilitator_reviews_facilitator_id_fkey" FOREIGN KEY ("facilitator_id") REFERENCES "facilitators"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================
-- Seed Default Achievements
-- ============================================

INSERT INTO "achievements" ("id", "code", "name_ar", "name_en", "description_ar", "description_en", "icon", "badge_color", "category", "requirement", "requirement_type", "xp_reward", "coin_reward", "rarity", "display_order") VALUES
-- Trading Achievements
(gen_random_uuid(), 'FIRST_DEAL', 'أول صفقة', 'First Deal', 'أتم أول صفقة لك على المنصة', 'Complete your first deal on the platform', '🎯', '#4CAF50', 'TRADING', 1, 'DEALS', 50, 100, 'COMMON', 1),
(gen_random_uuid(), 'DEAL_MASTER_10', 'تاجر نشط', 'Active Trader', 'أتم 10 صفقات ناجحة', 'Complete 10 successful deals', '⭐', '#2196F3', 'TRADING', 10, 'DEALS', 100, 200, 'UNCOMMON', 2),
(gen_random_uuid(), 'DEAL_MASTER_50', 'تاجر محترف', 'Pro Trader', 'أتم 50 صفقة ناجحة', 'Complete 50 successful deals', '🌟', '#9C27B0', 'TRADING', 50, 'DEALS', 300, 500, 'RARE', 3),
(gen_random_uuid(), 'DEAL_MASTER_100', 'تاجر خبير', 'Expert Trader', 'أتم 100 صفقة ناجحة', 'Complete 100 successful deals', '💎', '#E91E63', 'TRADING', 100, 'DEALS', 500, 1000, 'EPIC', 4),

-- Barter Achievements
(gen_random_uuid(), 'FIRST_BARTER', 'أول مقايضة', 'First Barter', 'أتم أول مقايضة لك', 'Complete your first barter', '🔄', '#FF9800', 'BARTER', 1, 'BARTERS', 75, 150, 'COMMON', 5),
(gen_random_uuid(), 'BARTER_CHAIN', 'سلسلة المقايضة', 'Barter Chain', 'شارك في سلسلة مقايضة مع 3+ أطراف', 'Participate in a barter chain with 3+ parties', '⛓️', '#795548', 'BARTER', 1, 'CHAIN_PARTICIPATION', 200, 300, 'RARE', 6),
(gen_random_uuid(), 'BARTER_MASTER', 'ملك المقايضة', 'Barter Master', 'أتم 25 مقايضة ناجحة', 'Complete 25 successful barters', '👑', '#FFD700', 'BARTER', 25, 'BARTERS', 400, 750, 'EPIC', 7),

-- Social Achievements
(gen_random_uuid(), 'FIRST_REVIEW', 'أول تقييم', 'First Review', 'اكتب أول تقييم لك', 'Write your first review', '📝', '#00BCD4', 'SOCIAL', 1, 'REVIEWS', 25, 50, 'COMMON', 8),
(gen_random_uuid(), 'HELPFUL_REVIEWER', 'مُقيّم مفيد', 'Helpful Reviewer', 'احصل على 10 تصويتات مفيدة على تقييماتك', 'Get 10 helpful votes on your reviews', '👍', '#8BC34A', 'SOCIAL', 10, 'HELPFUL_VOTES', 100, 200, 'UNCOMMON', 9),
(gen_random_uuid(), 'REFERRAL_CHAMPION', 'بطل الإحالات', 'Referral Champion', 'قم بإحالة 10 أصدقاء للمنصة', 'Refer 10 friends to the platform', '👥', '#3F51B5', 'SOCIAL', 10, 'REFERRALS', 300, 500, 'RARE', 10),

-- Reputation Achievements
(gen_random_uuid(), 'FIVE_STAR', 'خمس نجوم', 'Five Stars', 'احصل على تقييم 5 نجوم', 'Get a 5-star rating', '⭐', '#FFC107', 'REPUTATION', 1, 'FIVE_STAR_RATING', 50, 100, 'COMMON', 11),
(gen_random_uuid(), 'TRUSTED_SELLER', 'بائع موثوق', 'Trusted Seller', 'حافظ على تقييم 4.5+ مع 20 صفقة', 'Maintain 4.5+ rating with 20 deals', '🛡️', '#607D8B', 'REPUTATION', 20, 'TRUSTED_DEALS', 250, 400, 'RARE', 12),
(gen_random_uuid(), 'PLATINUM_MEMBER', 'عضو بلاتيني', 'Platinum Member', 'الوصول لمستوى الثقة البلاتيني', 'Reach Platinum trust level', '🏆', '#E0E0E0', 'REPUTATION', 1, 'PLATINUM_LEVEL', 1000, 2000, 'LEGENDARY', 13),

-- Special Achievements
(gen_random_uuid(), 'EARLY_ADOPTER', 'رائد مبكر', 'Early Adopter', 'انضم للمنصة في السنة الأولى', 'Join the platform in its first year', '🚀', '#FF5722', 'SPECIAL', 1, 'EARLY_JOIN', 200, 500, 'EPIC', 14),
(gen_random_uuid(), 'BIG_DEAL', 'صفقة كبيرة', 'Big Deal', 'أتم صفقة بقيمة 100,000+ جنيه', 'Complete a deal worth 100,000+ EGP', '💰', '#4CAF50', 'SPECIAL', 1, 'BIG_DEAL_VALUE', 500, 1000, 'LEGENDARY', 15);
