-- CreateEnum (idempotent)
DO $$ BEGIN
    CREATE TYPE "TenderCategory" AS ENUM ('HOME_SERVICES', 'IT_SERVICES', 'CONSTRUCTION', 'CONSULTING', 'MARKETING', 'LEGAL', 'ACCOUNTING', 'TRANSPORT', 'CLEANING', 'MAINTENANCE', 'DESIGN', 'TRAINING', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TenderUrgency" AS ENUM ('URGENT', 'NORMAL', 'FLEXIBLE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TenderRequestStatus" AS ENUM ('DRAFT', 'OPEN', 'UNDER_REVIEW', 'AWARDED', 'CANCELLED', 'EXPIRED', 'COMPLETED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TenderQuoteStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE "TenderContractStatus" AS ENUM ('PENDING_SIGNATURES', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'TERMINATED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- CreateTable (idempotent)
CREATE TABLE IF NOT EXISTS "tender_service_requests" (
    "id" TEXT NOT NULL,
    "reference_number" TEXT NOT NULL,
    "requester_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "description" TEXT NOT NULL,
    "description_ar" TEXT,
    "category" "TenderCategory" NOT NULL DEFAULT 'OTHER',
    "budget_min" DOUBLE PRECISION,
    "budget_max" DOUBLE PRECISION,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "governorate" TEXT NOT NULL,
    "city" TEXT,
    "district" TEXT,
    "urgency" "TenderUrgency" NOT NULL DEFAULT 'NORMAL',
    "deadline" TIMESTAMP(3),
    "expected_start_date" TIMESTAMP(3),
    "expected_duration" TEXT,
    "requirements" JSONB,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "TenderRequestStatus" NOT NULL DEFAULT 'OPEN',
    "quotes_count" INTEGER NOT NULL DEFAULT 0,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "tender_service_requests_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tender_quotes" (
    "id" TEXT NOT NULL,
    "quote_number" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "price_breakdown" JSONB,
    "description" TEXT NOT NULL,
    "description_ar" TEXT,
    "estimated_duration" TEXT NOT NULL,
    "delivery_date" TIMESTAMP(3),
    "terms_conditions" TEXT,
    "warranty" TEXT,
    "attachments" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "TenderQuoteStatus" NOT NULL DEFAULT 'PENDING',
    "technical_score" DOUBLE PRECISION,
    "financial_score" DOUBLE PRECISION,
    "total_score" DOUBLE PRECISION,
    "evaluation_notes" TEXT,
    "evaluated_at" TIMESTAMP(3),
    "evaluated_by" TEXT,
    "valid_until" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tender_quotes_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "tender_contracts" (
    "id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EGP',
    "terms" TEXT,
    "terms_ar" TEXT,
    "milestones" JSONB,
    "buyer_signed" BOOLEAN NOT NULL DEFAULT false,
    "buyer_signed_at" TIMESTAMP(3),
    "vendor_signed" BOOLEAN NOT NULL DEFAULT false,
    "vendor_signed_at" TIMESTAMP(3),
    "status" "TenderContractStatus" NOT NULL DEFAULT 'PENDING_SIGNATURES',
    "completed_milestones" INTEGER NOT NULL DEFAULT 0,
    "total_milestones" INTEGER NOT NULL DEFAULT 0,
    "progress_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "pending_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "start_date" TIMESTAMP(3),
    "expected_end_date" TIMESTAMP(3),
    "actual_end_date" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tender_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex (idempotent)
CREATE UNIQUE INDEX IF NOT EXISTS "tender_service_requests_reference_number_key" ON "tender_service_requests"("reference_number");
CREATE INDEX IF NOT EXISTS "tender_service_requests_requester_id_idx" ON "tender_service_requests"("requester_id");
CREATE INDEX IF NOT EXISTS "tender_service_requests_category_idx" ON "tender_service_requests"("category");
CREATE INDEX IF NOT EXISTS "tender_service_requests_status_idx" ON "tender_service_requests"("status");
CREATE INDEX IF NOT EXISTS "tender_service_requests_governorate_idx" ON "tender_service_requests"("governorate");
CREATE INDEX IF NOT EXISTS "tender_service_requests_urgency_idx" ON "tender_service_requests"("urgency");
CREATE INDEX IF NOT EXISTS "tender_service_requests_created_at_idx" ON "tender_service_requests"("created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "tender_quotes_quote_number_key" ON "tender_quotes"("quote_number");
CREATE INDEX IF NOT EXISTS "tender_quotes_request_id_idx" ON "tender_quotes"("request_id");
CREATE INDEX IF NOT EXISTS "tender_quotes_provider_id_idx" ON "tender_quotes"("provider_id");
CREATE INDEX IF NOT EXISTS "tender_quotes_status_idx" ON "tender_quotes"("status");
CREATE INDEX IF NOT EXISTS "tender_quotes_created_at_idx" ON "tender_quotes"("created_at");

CREATE UNIQUE INDEX IF NOT EXISTS "tender_contracts_contract_number_key" ON "tender_contracts"("contract_number");
CREATE UNIQUE INDEX IF NOT EXISTS "tender_contracts_request_id_key" ON "tender_contracts"("request_id");
CREATE UNIQUE INDEX IF NOT EXISTS "tender_contracts_quote_id_key" ON "tender_contracts"("quote_id");
CREATE INDEX IF NOT EXISTS "tender_contracts_buyer_id_idx" ON "tender_contracts"("buyer_id");
CREATE INDEX IF NOT EXISTS "tender_contracts_vendor_id_idx" ON "tender_contracts"("vendor_id");
CREATE INDEX IF NOT EXISTS "tender_contracts_status_idx" ON "tender_contracts"("status");
CREATE INDEX IF NOT EXISTS "tender_contracts_created_at_idx" ON "tender_contracts"("created_at");

-- AddForeignKey (idempotent - check before adding)
DO $$ BEGIN
    ALTER TABLE "tender_service_requests" ADD CONSTRAINT "tender_service_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tender_quotes" ADD CONSTRAINT "tender_quotes_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "tender_service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tender_quotes" ADD CONSTRAINT "tender_quotes_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tender_contracts" ADD CONSTRAINT "tender_contracts_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "tender_service_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tender_contracts" ADD CONSTRAINT "tender_contracts_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "tender_quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tender_contracts" ADD CONSTRAINT "tender_contracts_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    ALTER TABLE "tender_contracts" ADD CONSTRAINT "tender_contracts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
