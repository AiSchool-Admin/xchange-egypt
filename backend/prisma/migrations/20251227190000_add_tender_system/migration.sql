-- CreateEnum
CREATE TYPE "TenderCategory" AS ENUM ('HOME_SERVICES', 'IT_SERVICES', 'CONSTRUCTION', 'CONSULTING', 'MARKETING', 'LEGAL', 'ACCOUNTING', 'TRANSPORT', 'CLEANING', 'MAINTENANCE', 'DESIGN', 'TRAINING', 'OTHER');

-- CreateEnum
CREATE TYPE "TenderUrgency" AS ENUM ('URGENT', 'NORMAL', 'FLEXIBLE');

-- CreateEnum
CREATE TYPE "TenderRequestStatus" AS ENUM ('DRAFT', 'OPEN', 'UNDER_REVIEW', 'AWARDED', 'CANCELLED', 'EXPIRED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "TenderQuoteStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED', 'REJECTED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "TenderContractStatus" AS ENUM ('PENDING_SIGNATURES', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED', 'DISPUTED', 'TERMINATED');

-- CreateTable
CREATE TABLE "tender_service_requests" (
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
    "governorate" TEXT NOT NULL,
    "city" TEXT,
    "district" TEXT,
    "urgency" "TenderUrgency" NOT NULL DEFAULT 'NORMAL',
    "deadline" TIMESTAMP(3),
    "expected_start_date" TIMESTAMP(3),
    "expected_duration" TEXT,
    "requirements" JSONB,
    "attachments" TEXT[],
    "status" "TenderRequestStatus" NOT NULL DEFAULT 'OPEN',
    "quotes_count" INTEGER NOT NULL DEFAULT 0,
    "views_count" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3),
    "awarded_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tender_service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_quotes" (
    "id" TEXT NOT NULL,
    "quote_number" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "provider_id" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "description_ar" TEXT,
    "estimated_duration" TEXT NOT NULL,
    "delivery_date" TIMESTAMP(3),
    "terms_and_conditions" TEXT,
    "warranty" TEXT,
    "price_breakdown" JSONB,
    "attachments" TEXT[],
    "status" "TenderQuoteStatus" NOT NULL DEFAULT 'PENDING',
    "technical_score" DOUBLE PRECISION,
    "financial_score" DOUBLE PRECISION,
    "total_score" DOUBLE PRECISION,
    "evaluation_notes" TEXT,
    "valid_until" TIMESTAMP(3),
    "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "evaluated_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tender_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tender_contracts" (
    "id" TEXT NOT NULL,
    "contract_number" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "buyer_id" TEXT NOT NULL,
    "vendor_id" TEXT NOT NULL,
    "total_amount" DOUBLE PRECISION NOT NULL,
    "status" "TenderContractStatus" NOT NULL DEFAULT 'PENDING_SIGNATURES',
    "terms" TEXT,
    "milestones" JSONB,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "buyer_signed" BOOLEAN NOT NULL DEFAULT false,
    "buyer_signed_at" TIMESTAMP(3),
    "vendor_signed" BOOLEAN NOT NULL DEFAULT false,
    "vendor_signed_at" TIMESTAMP(3),
    "started_at" TIMESTAMP(3),
    "completed_at" TIMESTAMP(3),
    "cancelled_at" TIMESTAMP(3),
    "cancellation_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tender_contracts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tender_service_requests_reference_number_key" ON "tender_service_requests"("reference_number");

-- CreateIndex
CREATE INDEX "tender_service_requests_requester_id_idx" ON "tender_service_requests"("requester_id");

-- CreateIndex
CREATE INDEX "tender_service_requests_status_idx" ON "tender_service_requests"("status");

-- CreateIndex
CREATE INDEX "tender_service_requests_category_idx" ON "tender_service_requests"("category");

-- CreateIndex
CREATE INDEX "tender_service_requests_governorate_idx" ON "tender_service_requests"("governorate");

-- CreateIndex
CREATE UNIQUE INDEX "tender_quotes_quote_number_key" ON "tender_quotes"("quote_number");

-- CreateIndex
CREATE INDEX "tender_quotes_request_id_idx" ON "tender_quotes"("request_id");

-- CreateIndex
CREATE INDEX "tender_quotes_provider_id_idx" ON "tender_quotes"("provider_id");

-- CreateIndex
CREATE INDEX "tender_quotes_status_idx" ON "tender_quotes"("status");

-- CreateIndex
CREATE UNIQUE INDEX "tender_contracts_contract_number_key" ON "tender_contracts"("contract_number");

-- CreateIndex
CREATE UNIQUE INDEX "tender_contracts_request_id_key" ON "tender_contracts"("request_id");

-- CreateIndex
CREATE UNIQUE INDEX "tender_contracts_quote_id_key" ON "tender_contracts"("quote_id");

-- CreateIndex
CREATE INDEX "tender_contracts_buyer_id_idx" ON "tender_contracts"("buyer_id");

-- CreateIndex
CREATE INDEX "tender_contracts_vendor_id_idx" ON "tender_contracts"("vendor_id");

-- CreateIndex
CREATE INDEX "tender_contracts_status_idx" ON "tender_contracts"("status");

-- AddForeignKey
ALTER TABLE "tender_service_requests" ADD CONSTRAINT "tender_service_requests_requester_id_fkey" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_quotes" ADD CONSTRAINT "tender_quotes_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "tender_service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_quotes" ADD CONSTRAINT "tender_quotes_provider_id_fkey" FOREIGN KEY ("provider_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_contracts" ADD CONSTRAINT "tender_contracts_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "tender_service_requests"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_contracts" ADD CONSTRAINT "tender_contracts_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "tender_quotes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_contracts" ADD CONSTRAINT "tender_contracts_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tender_contracts" ADD CONSTRAINT "tender_contracts_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
