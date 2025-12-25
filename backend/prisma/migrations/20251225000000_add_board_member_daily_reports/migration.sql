-- ============================================
-- BOARD MEMBER DAILY REPORTS - تقارير أعضاء المجلس اليومية
-- Migration: 20251225000000_add_board_member_daily_reports
-- ============================================

-- CreateEnum: BoardMemberReportType
DO $$ BEGIN
  CREATE TYPE "BoardMemberReportType" AS ENUM ('CONTENT_PACKAGE', 'FINANCIAL_REPORT', 'OPERATIONS_REPORT', 'LEGAL_REPORT', 'TECHNICAL_REPORT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- CreateTable: BoardMemberDailyReport - تقارير أعضاء المجلس اليومية
-- ============================================
CREATE TABLE IF NOT EXISTS "board_member_daily_reports" (
    "id" TEXT NOT NULL,
    "report_number" TEXT NOT NULL,

    -- Report Type and Author
    "type" "BoardMemberReportType" NOT NULL,
    "member_id" TEXT NOT NULL,
    "member_role" TEXT NOT NULL,

    -- Timing
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduled_time" TEXT,

    -- Content
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "summary" TEXT,
    "summary_ar" TEXT,
    "content" JSONB NOT NULL,

    -- Metrics
    "key_metrics" JSONB,
    "alerts" JSONB,
    "insights" JSONB,
    "recommendations" JSONB,

    -- Status
    "status" TEXT NOT NULL DEFAULT 'GENERATED',
    "generated_at" TIMESTAMP(3),
    "reviewed_at" TIMESTAMP(3),
    "reviewed_by" TEXT,

    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "board_member_daily_reports_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- CreateIndex
-- ============================================
CREATE UNIQUE INDEX IF NOT EXISTS "board_member_daily_reports_report_number_key" ON "board_member_daily_reports"("report_number");
CREATE INDEX IF NOT EXISTS "board_member_daily_reports_date_idx" ON "board_member_daily_reports"("date");
CREATE INDEX IF NOT EXISTS "board_member_daily_reports_member_id_idx" ON "board_member_daily_reports"("member_id");
CREATE INDEX IF NOT EXISTS "board_member_daily_reports_type_idx" ON "board_member_daily_reports"("type");
CREATE INDEX IF NOT EXISTS "board_member_daily_reports_member_role_idx" ON "board_member_daily_reports"("member_role");

-- ============================================
-- AddForeignKey
-- ============================================
DO $$ BEGIN
  ALTER TABLE "board_member_daily_reports" ADD CONSTRAINT "board_member_daily_reports_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "board_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
