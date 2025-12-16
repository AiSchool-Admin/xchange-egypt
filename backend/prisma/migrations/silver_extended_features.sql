-- Silver Extended Features Migration
-- ميزات سوق الفضة المتقدمة

-- ============================================
-- Trade-In System - نظام الاستبدال
-- ============================================

CREATE TABLE IF NOT EXISTS silver_trade_ins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Status
    status VARCHAR(50) NOT NULL DEFAULT 'PENDING_REVIEW',
    -- PENDING_REVIEW, ITEM_RECEIVED, OFFER_MADE, OFFER_ACCEPTED, OFFER_REJECTED, COMPLETED, CANCELLED

    -- Old Item Details
    old_item_description TEXT NOT NULL,
    old_item_category VARCHAR(50) NOT NULL,
    old_item_purity VARCHAR(10) NOT NULL,
    old_item_weight_grams DECIMAL(10,3) NOT NULL,
    old_item_condition VARCHAR(20) NOT NULL,
    old_item_images TEXT[] NOT NULL,

    -- Estimated Valuation
    estimated_market_value DECIMAL(12,2),
    estimated_credit_rate DECIMAL(5,2),
    estimated_credit DECIMAL(12,2),

    -- Final Valuation (after assessment)
    final_credit DECIMAL(12,2),
    assessment_notes TEXT,
    assessed_by UUID,
    assessed_at TIMESTAMP,

    -- Target Item (optional)
    target_item_id UUID REFERENCES silver_items(id),
    price_difference DECIMAL(12,2) DEFAULT 0,

    -- Delivery
    delivery_method VARCHAR(30) NOT NULL, -- MAIL, OFFICE_DROP, HOME_PICKUP
    pickup_address TEXT,
    preferred_date DATE,

    -- Timestamps
    accepted_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_silver_trade_ins_user ON silver_trade_ins(user_id);
CREATE INDEX idx_silver_trade_ins_status ON silver_trade_ins(status);
CREATE INDEX idx_silver_trade_ins_created ON silver_trade_ins(created_at);

-- ============================================
-- Savings Account System - نظام حساب التوفير
-- ============================================

CREATE TABLE IF NOT EXISTS silver_savings_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Account Info
    account_number VARCHAR(50) NOT NULL UNIQUE,
    account_name VARCHAR(100) NOT NULL,

    -- Balance
    balance_grams DECIMAL(12,6) NOT NULL DEFAULT 0,
    balance_egp DECIMAL(12,2) NOT NULL DEFAULT 0,

    -- Investment Tracking
    total_deposited DECIMAL(12,2) NOT NULL DEFAULT 0,
    total_withdrawn DECIMAL(12,2) NOT NULL DEFAULT 0,
    average_purchase_price DECIMAL(10,2) NOT NULL DEFAULT 0,

    -- Goals
    target_goal_grams DECIMAL(12,6),
    target_date DATE,

    -- Auto-invest
    auto_invest_amount DECIMAL(10,2),
    auto_invest_day INTEGER CHECK (auto_invest_day >= 1 AND auto_invest_day <= 28),

    -- Pending Operations
    pending_withdrawal DECIMAL(12,6) DEFAULT 0,

    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_silver_savings_user_active ON silver_savings_accounts(user_id) WHERE is_active = true;
CREATE INDEX idx_silver_savings_account_number ON silver_savings_accounts(account_number);

-- Savings Transactions
CREATE TABLE IF NOT EXISTS silver_savings_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_id UUID NOT NULL REFERENCES silver_savings_accounts(id) ON DELETE CASCADE,

    -- Type
    type VARCHAR(20) NOT NULL, -- DEPOSIT, WITHDRAWAL, FEE, TRANSFER
    withdrawal_type VARCHAR(20), -- CASH, PHYSICAL, PARTIAL

    -- Amounts
    amount_egp DECIMAL(12,2) NOT NULL,
    amount_grams DECIMAL(12,6) NOT NULL,
    price_per_gram DECIMAL(10,2) NOT NULL,
    fee DECIMAL(10,2) DEFAULT 0,

    -- Payment
    payment_method VARCHAR(30),
    payment_reference VARCHAR(100),

    -- For Physical Withdrawal
    delivery_address TEXT,

    -- Status
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING', -- PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
    estimated_completion TIMESTAMP,

    -- Timestamps
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    completed_at TIMESTAMP
);

CREATE INDEX idx_silver_savings_trans_account ON silver_savings_transactions(account_id);
CREATE INDEX idx_silver_savings_trans_type ON silver_savings_transactions(type);
CREATE INDEX idx_silver_savings_trans_created ON silver_savings_transactions(created_at);

-- ============================================
-- Extended Certificate Fields
-- ============================================

ALTER TABLE silver_certificates
ADD COLUMN IF NOT EXISTS valuation_type VARCHAR(20),
ADD COLUMN IF NOT EXISTS valuation_fee DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS valuation_status VARCHAR(20) DEFAULT 'PENDING',
ADD COLUMN IF NOT EXISTS appointment_date DATE,
ADD COLUMN IF NOT EXISTS appointment_time VARCHAR(10),
ADD COLUMN IF NOT EXISTS delivery_method VARCHAR(30),
ADD COLUMN IF NOT EXISTS customer_address TEXT,
ADD COLUMN IF NOT EXISTS customer_notes TEXT,
ADD COLUMN IF NOT EXISTS requested_by UUID,
ADD COLUMN IF NOT EXISTS craftsmanship_score INTEGER,
ADD COLUMN IF NOT EXISTS market_value DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS suggested_price DECIMAL(12,2),
ADD COLUMN IF NOT EXISTS condition_grade VARCHAR(20),
ADD COLUMN IF NOT EXISTS expert_notes TEXT,
ADD COLUMN IF NOT EXISTS valuation_images TEXT[],
ADD COLUMN IF NOT EXISTS expert_id UUID,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Make item_id nullable for standalone valuations
ALTER TABLE silver_certificates ALTER COLUMN item_id DROP NOT NULL;
ALTER TABLE silver_certificates ALTER COLUMN partner_id DROP NOT NULL;

-- ============================================
-- Silver Item Additional Fields
-- ============================================

ALTER TABLE silver_items
ADD COLUMN IF NOT EXISTS allow_gold_barter BOOLEAN DEFAULT false;

-- ============================================
-- Review System Extension for Silver
-- ============================================

ALTER TABLE reviews
ADD COLUMN IF NOT EXISTS transaction_id UUID,
ADD COLUMN IF NOT EXISTS seller_response TEXT,
ADD COLUMN IF NOT EXISTS seller_responded_at TIMESTAMP,
ADD COLUMN IF NOT EXISTS is_reported BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS report_reason TEXT,
ADD COLUMN IF NOT EXISTS reported_by UUID,
ADD COLUMN IF NOT EXISTS reported_at TIMESTAMP;

-- ============================================
-- Indexes for Performance
-- ============================================

CREATE INDEX IF NOT EXISTS idx_reviews_transaction ON reviews(transaction_id);
CREATE INDEX IF NOT EXISTS idx_silver_certs_valuation_status ON silver_certificates(valuation_status);
CREATE INDEX IF NOT EXISTS idx_silver_certs_requested_by ON silver_certificates(requested_by);
