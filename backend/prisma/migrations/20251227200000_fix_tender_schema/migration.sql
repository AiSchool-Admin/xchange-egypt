-- Repair Migration: Fix tender system schema to match Prisma schema
-- This migration safely handles both fresh installs and repairs

-- Skip if tables don't exist (previous migration failed completely)
DO $$
BEGIN
    -- Check if tender_service_requests table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tender_service_requests') THEN
        -- Add missing columns to tender_service_requests
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_service_requests' AND column_name = 'currency') THEN
            ALTER TABLE "tender_service_requests" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'EGP';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_service_requests' AND column_name = 'closed_at') THEN
            ALTER TABLE "tender_service_requests" ADD COLUMN "closed_at" TIMESTAMP(3);
        END IF;

        -- Remove deprecated columns if they exist
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_service_requests' AND column_name = 'awarded_at') THEN
            ALTER TABLE "tender_service_requests" DROP COLUMN "awarded_at";
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_service_requests' AND column_name = 'completed_at') THEN
            ALTER TABLE "tender_service_requests" DROP COLUMN "completed_at";
        END IF;
    END IF;
END $$;

DO $$
BEGIN
    -- Check if tender_quotes table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tender_quotes') THEN
        -- Add missing columns to tender_quotes
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_quotes' AND column_name = 'currency') THEN
            ALTER TABLE "tender_quotes" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'EGP';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_quotes' AND column_name = 'evaluated_by') THEN
            ALTER TABLE "tender_quotes" ADD COLUMN "evaluated_by" TEXT;
        END IF;

        -- Rename terms_and_conditions to terms_conditions if needed
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_quotes' AND column_name = 'terms_and_conditions') THEN
            ALTER TABLE "tender_quotes" RENAME COLUMN "terms_and_conditions" TO "terms_conditions";
        END IF;

        -- Remove deprecated columns if they exist
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_quotes' AND column_name = 'submitted_at') THEN
            ALTER TABLE "tender_quotes" DROP COLUMN "submitted_at";
        END IF;
    END IF;
END $$;

DO $$
BEGIN
    -- Check if tender_contracts table exists
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tender_contracts') THEN
        -- Add missing columns to tender_contracts
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'currency') THEN
            ALTER TABLE "tender_contracts" ADD COLUMN "currency" TEXT NOT NULL DEFAULT 'EGP';
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'terms_ar') THEN
            ALTER TABLE "tender_contracts" ADD COLUMN "terms_ar" TEXT;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'completed_milestones') THEN
            ALTER TABLE "tender_contracts" ADD COLUMN "completed_milestones" INTEGER NOT NULL DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'total_milestones') THEN
            ALTER TABLE "tender_contracts" ADD COLUMN "total_milestones" INTEGER NOT NULL DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'progress_percentage') THEN
            ALTER TABLE "tender_contracts" ADD COLUMN "progress_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'paid_amount') THEN
            ALTER TABLE "tender_contracts" ADD COLUMN "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'pending_amount') THEN
            ALTER TABLE "tender_contracts" ADD COLUMN "pending_amount" DOUBLE PRECISION NOT NULL DEFAULT 0;
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'start_date') THEN
            ALTER TABLE "tender_contracts" ADD COLUMN "start_date" TIMESTAMP(3);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'expected_end_date') THEN
            ALTER TABLE "tender_contracts" ADD COLUMN "expected_end_date" TIMESTAMP(3);
        END IF;

        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'actual_end_date') THEN
            ALTER TABLE "tender_contracts" ADD COLUMN "actual_end_date" TIMESTAMP(3);
        END IF;

        -- Remove deprecated columns if they exist
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'progress') THEN
            ALTER TABLE "tender_contracts" DROP COLUMN "progress";
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'started_at') THEN
            ALTER TABLE "tender_contracts" DROP COLUMN "started_at";
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'cancelled_at') THEN
            ALTER TABLE "tender_contracts" DROP COLUMN "cancelled_at";
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'cancellation_reason') THEN
            ALTER TABLE "tender_contracts" DROP COLUMN "cancellation_reason";
        END IF;

        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tender_contracts' AND column_name = 'completed_at') THEN
            ALTER TABLE "tender_contracts" DROP COLUMN "completed_at";
        END IF;
    END IF;
END $$;

-- Add missing indexes (idempotent)
CREATE INDEX IF NOT EXISTS "tender_service_requests_urgency_idx" ON "tender_service_requests"("urgency");
CREATE INDEX IF NOT EXISTS "tender_service_requests_created_at_idx" ON "tender_service_requests"("created_at");
CREATE INDEX IF NOT EXISTS "tender_quotes_created_at_idx" ON "tender_quotes"("created_at");
CREATE INDEX IF NOT EXISTS "tender_contracts_created_at_idx" ON "tender_contracts"("created_at");
