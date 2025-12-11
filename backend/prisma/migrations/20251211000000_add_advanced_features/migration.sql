-- Add Real Estate fields to items
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "property_type" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "property_finishing" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "property_view" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "property_listing_type" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "area_in_sqm" DOUBLE PRECISION;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "bedrooms" INTEGER;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "bathrooms" INTEGER;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "floor_number" INTEGER;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "total_floors" INTEGER;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "build_year" INTEGER;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "has_elevator" BOOLEAN;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "has_parking" BOOLEAN;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "has_garden" BOOLEAN;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "has_security" BOOLEAN;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "has_pool" BOOLEAN;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "rent_price" DOUBLE PRECISION;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "is_negotiable" BOOLEAN;

-- Add Vehicle fields to items
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_brand" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_model" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_year" INTEGER;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_mileage" INTEGER;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_fuel_type" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_transmission" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_body_type" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_color" TEXT;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_engine_size" DOUBLE PRECISION;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_license_valid" BOOLEAN;
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "vehicle_accident_free" BOOLEAN;

-- Create ItemComparison table
CREATE TABLE IF NOT EXISTS "item_comparisons" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT,
    "item_ids" TEXT[],
    "category_slug" TEXT,
    "is_public" BOOLEAN NOT NULL DEFAULT false,
    "share_code" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "item_comparisons_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "item_comparisons_share_code_key" ON "item_comparisons"("share_code");
CREATE INDEX IF NOT EXISTS "item_comparisons_user_id_idx" ON "item_comparisons"("user_id");
CREATE INDEX IF NOT EXISTS "item_comparisons_share_code_idx" ON "item_comparisons"("share_code");

-- Create DeliveryBooking table
CREATE TABLE IF NOT EXISTS "delivery_bookings" (
    "id" TEXT NOT NULL,
    "order_id" TEXT,
    "transaction_id" TEXT,
    "sender_id" TEXT NOT NULL,
    "receiver_id" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_order_id" TEXT,
    "pickup_address" TEXT NOT NULL,
    "pickup_city" TEXT NOT NULL,
    "pickup_governorate" TEXT NOT NULL,
    "pickup_phone" TEXT NOT NULL,
    "pickup_lat" DOUBLE PRECISION,
    "pickup_lng" DOUBLE PRECISION,
    "delivery_address" TEXT NOT NULL,
    "delivery_city" TEXT NOT NULL,
    "delivery_governorate" TEXT NOT NULL,
    "delivery_phone" TEXT NOT NULL,
    "delivery_lat" DOUBLE PRECISION,
    "delivery_lng" DOUBLE PRECISION,
    "package_weight" DOUBLE PRECISION,
    "package_dimensions" JSONB,
    "package_description" TEXT,
    "is_fragile" BOOLEAN NOT NULL DEFAULT false,
    "delivery_cost" DOUBLE PRECISION NOT NULL,
    "insurance_cost" DOUBLE PRECISION,
    "cod_amount" DOUBLE PRECISION,
    "total_cost" DOUBLE PRECISION NOT NULL,
    "delivery_speed" TEXT,
    "has_insurance" BOOLEAN NOT NULL DEFAULT false,
    "is_cod" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "tracking_number" TEXT,
    "tracking_url" TEXT,
    "estimated_delivery" TIMESTAMP(3),
    "picked_up_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "sender_notes" TEXT,
    "receiver_notes" TEXT,
    "failure_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "delivery_bookings_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "delivery_bookings_sender_id_idx" ON "delivery_bookings"("sender_id");
CREATE INDEX IF NOT EXISTS "delivery_bookings_receiver_id_idx" ON "delivery_bookings"("receiver_id");
CREATE INDEX IF NOT EXISTS "delivery_bookings_status_idx" ON "delivery_bookings"("status");
CREATE INDEX IF NOT EXISTS "delivery_bookings_tracking_number_idx" ON "delivery_bookings"("tracking_number");

-- Create Badge table
CREATE TABLE IF NOT EXISTS "badges" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "criteria" JSONB NOT NULL,
    "points" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "badges_name_key" ON "badges"("name");

-- Create UserBadge table
CREATE TABLE IF NOT EXISTS "user_badges" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "badge_id" TEXT NOT NULL,
    "verification_data" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "user_badges_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_badges_user_id_badge_id_key" ON "user_badges"("user_id", "badge_id");
CREATE INDEX IF NOT EXISTS "user_badges_user_id_idx" ON "user_badges"("user_id");
CREATE INDEX IF NOT EXISTS "user_badges_badge_id_idx" ON "user_badges"("badge_id");

-- Create InstallmentConfig table
CREATE TABLE IF NOT EXISTS "installment_configs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "description_ar" TEXT,
    "min_amount" DOUBLE PRECISION NOT NULL,
    "max_amount" DOUBLE PRECISION NOT NULL,
    "min_months" INTEGER NOT NULL,
    "max_months" INTEGER NOT NULL,
    "interest_rate" DOUBLE PRECISION NOT NULL,
    "admin_fee_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "late_payment_fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "grace_period_days" INTEGER NOT NULL DEFAULT 0,
    "requires_verification" BOOLEAN NOT NULL DEFAULT true,
    "allowed_categories" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "installment_configs_pkey" PRIMARY KEY ("id")
);

-- Create Installment table
CREATE TABLE IF NOT EXISTS "installments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "item_id" TEXT,
    "order_id" TEXT,
    "config_id" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "down_payment" DOUBLE PRECISION NOT NULL,
    "financed_amount" DOUBLE PRECISION NOT NULL,
    "interest_amount" DOUBLE PRECISION NOT NULL,
    "total_payable" DOUBLE PRECISION NOT NULL,
    "monthly_payment" DOUBLE PRECISION NOT NULL,
    "number_of_months" INTEGER NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verification_status" TEXT NOT NULL DEFAULT 'PENDING',
    "verification_data" JSONB,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "installments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "installments_user_id_idx" ON "installments"("user_id");
CREATE INDEX IF NOT EXISTS "installments_status_idx" ON "installments"("status");

-- Create InstallmentPayment table
CREATE TABLE IF NOT EXISTS "installment_payments" (
    "id" TEXT NOT NULL,
    "installment_id" TEXT NOT NULL,
    "payment_number" INTEGER NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "principal" DOUBLE PRECISION NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3) NOT NULL,
    "paid_date" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "late_fee" DOUBLE PRECISION,
    "payment_method" TEXT,
    "transaction_ref" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "installment_payments_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "installment_payments_installment_id_idx" ON "installment_payments"("installment_id");
CREATE INDEX IF NOT EXISTS "installment_payments_due_date_idx" ON "installment_payments"("due_date");
CREATE INDEX IF NOT EXISTS "installment_payments_status_idx" ON "installment_payments"("status");

-- Add indexes for items real estate and vehicle fields
CREATE INDEX IF NOT EXISTS "items_property_type_idx" ON "items"("property_type");
CREATE INDEX IF NOT EXISTS "items_property_finishing_idx" ON "items"("property_finishing");
CREATE INDEX IF NOT EXISTS "items_area_in_sqm_idx" ON "items"("area_in_sqm");
CREATE INDEX IF NOT EXISTS "items_bedrooms_idx" ON "items"("bedrooms");
CREATE INDEX IF NOT EXISTS "items_vehicle_brand_idx" ON "items"("vehicle_brand");
CREATE INDEX IF NOT EXISTS "items_vehicle_year_idx" ON "items"("vehicle_year");
