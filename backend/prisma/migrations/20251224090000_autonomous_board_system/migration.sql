-- ============================================
-- AUTONOMOUS AI BOARD SYSTEM - نظام المجلس الذاتي
-- Migration: 20251224090000_autonomous_board_system
-- ============================================

-- CreateEnum: Autonomous Board Enums (with IF NOT EXISTS logic)
DO $$ BEGIN
  CREATE TYPE "MOMApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'PARTIALLY_APPROVED', 'REJECTED', 'DISCUSSION_REQUESTED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "IntelligenceSignalType" AS ENUM ('OPPORTUNITY', 'THREAT', 'ANOMALY', 'TREND', 'URGENT');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "IdeaStatus" AS ENUM ('PROPOSED', 'UNDER_REVIEW', 'APPROVED', 'IN_PROGRESS', 'IMPLEMENTED', 'REJECTED', 'DEFERRED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ThreatLevel" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ScanType" AS ENUM ('MARKET', 'REGULATORY', 'TECHNOLOGY', 'ECONOMIC', 'CONSUMER', 'COMPETITIVE');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "DecisionType" AS ENUM ('TYPE_1_STRATEGIC', 'TYPE_2_OPERATIONAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- CreateTable: MorningIntelligence - الاستخبارات الصباحية
-- ============================================
CREATE TABLE IF NOT EXISTS "morning_intelligence" (
    "id" TEXT NOT NULL,
    "report_number" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kpi_snapshot" JSONB NOT NULL,
    "anomalies" JSONB,
    "opportunities" JSONB,
    "threats" JSONB,
    "internal_issues" JSONB,
    "suggested_agenda" JSONB,
    "executive_summary" TEXT,
    "executive_summary_ar" TEXT,
    "key_insights" JSONB,
    "recommended_actions" JSONB,
    "processed_at" TIMESTAMP(3),
    "ceo_reviewed_at" TIMESTAMP(3),
    "meeting_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "morning_intelligence_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- CreateTable: EnvironmentScan - المسح البيئي
-- ============================================
CREATE TABLE IF NOT EXISTS "environment_scans" (
    "id" TEXT NOT NULL,
    "scan_number" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "day_of_week" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "market_trends" JSONB,
    "competitor_moves" JSONB,
    "regulatory_changes" JSONB,
    "tech_trends" JSONB,
    "economic_indicators" JSONB,
    "consumer_insights" JSONB,
    "swot_analysis" JSONB,
    "strategic_recommendations" JSONB,
    "urgent_actions" JSONB,
    "sources_used" JSONB,
    "confidence_level" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "environment_scans_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- CreateTable: MeetingMinutes - محاضر الاجتماعات
-- ============================================
CREATE TABLE IF NOT EXISTS "meeting_minutes" (
    "id" TEXT NOT NULL,
    "mom_number" TEXT NOT NULL,
    "meeting_type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "meeting_id" UUID NOT NULL,
    "situation_summary" TEXT,
    "situation_summary_ar" TEXT,
    "kpi_highlights" JSONB,
    "signals_discussed" JSONB,
    "discussion_log" JSONB,
    "decisions" JSONB,
    "action_items_summary" JSONB,
    "innovation_score" INTEGER DEFAULT 0,
    "ideas_generated" INTEGER DEFAULT 0,
    "approval_status" "MOMApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approval_deadline" TIMESTAMP(3),
    "approved_at" TIMESTAMP(3),
    "approved_by_id" UUID,
    "approval_notes" TEXT,
    "auto_executed_at" TIMESTAMP(3),
    "reminders_sent" INTEGER NOT NULL DEFAULT 0,
    "last_reminder_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meeting_minutes_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- CreateTable: InnovationIdea - أفكار الابتكار
-- ============================================
CREATE TABLE IF NOT EXISTS "innovation_ideas" (
    "id" TEXT NOT NULL,
    "idea_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT,
    "description" TEXT NOT NULL,
    "description_ar" TEXT,
    "source_type" TEXT NOT NULL,
    "mom_id" TEXT,
    "proposed_by_id" UUID NOT NULL,
    "feasibility_score" INTEGER,
    "innovation_score" INTEGER,
    "impact_score" INTEGER,
    "overall_score" DOUBLE PRECISION,
    "status" "IdeaStatus" NOT NULL DEFAULT 'PROPOSED',
    "owner_id" UUID,
    "implementation_plan" TEXT,
    "implemented_at" TIMESTAMP(3),
    "results" TEXT,
    "impact_measured" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "innovation_ideas_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- CreateTable: CompetitorWatch - مراقبة المنافسين
-- ============================================
CREATE TABLE IF NOT EXISTS "competitor_watch" (
    "id" TEXT NOT NULL,
    "competitor_name" TEXT NOT NULL,
    "competitor_type" TEXT NOT NULL,
    "last_activity" TEXT,
    "activity_date" TIMESTAMP(3),
    "threat_level" "ThreatLevel" NOT NULL DEFAULT 'MEDIUM',
    "market_share" DOUBLE PRECISION,
    "strengths" JSONB,
    "weaknesses" JSONB,
    "pricing" JSONB,
    "features" JSONB,
    "recommended_response" TEXT,
    "urgency" TEXT,
    "last_scanned_at" TIMESTAMP(3),
    "data_source" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitor_watch_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- CreateTable: DailyClosingReport - تقرير الإغلاق اليومي
-- ============================================
CREATE TABLE IF NOT EXISTS "daily_closing_reports" (
    "id" TEXT NOT NULL,
    "report_number" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "executive_summary" TEXT,
    "executive_summary_ar" TEXT,
    "kpi_end_of_day" JSONB,
    "kpi_changes" JSONB,
    "meetings_held" INTEGER NOT NULL DEFAULT 0,
    "decisions_count" INTEGER NOT NULL DEFAULT 0,
    "action_items_created" INTEGER NOT NULL DEFAULT 0,
    "ideas_generated" INTEGER NOT NULL DEFAULT 0,
    "pending_approvals" INTEGER NOT NULL DEFAULT 0,
    "approved_today" INTEGER NOT NULL DEFAULT 0,
    "auto_executed" INTEGER NOT NULL DEFAULT 0,
    "tomorrow_agenda" JSONB,
    "tomorrow_alerts" JSONB,
    "founder_interaction_minutes" INTEGER,
    "founder_decisions" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "daily_closing_reports_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- CreateTable: AutonomousMeetingSession - جلسة الاجتماع الذاتي
-- ============================================
CREATE TABLE IF NOT EXISTS "autonomous_meeting_sessions" (
    "id" TEXT NOT NULL,
    "session_number" TEXT NOT NULL,
    "meeting_id" UUID NOT NULL,
    "participants" JSONB NOT NULL,
    "current_phase" TEXT,
    "phase_history" JSONB,
    "message_count" INTEGER NOT NULL DEFAULT 0,
    "total_tokens_used" INTEGER NOT NULL DEFAULT 0,
    "techniques_used" JSONB,
    "current_roles" JSONB,
    "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),
    "duration" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "autonomous_meeting_sessions_pkey" PRIMARY KEY ("id")
);

-- ============================================
-- CreateIndex (IF NOT EXISTS)
-- ============================================

-- Morning Intelligence Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "morning_intelligence_report_number_key" ON "morning_intelligence"("report_number");
CREATE UNIQUE INDEX IF NOT EXISTS "morning_intelligence_meeting_id_key" ON "morning_intelligence"("meeting_id");
CREATE INDEX IF NOT EXISTS "morning_intelligence_date_idx" ON "morning_intelligence"("date");

-- Environment Scans Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "environment_scans_scan_number_key" ON "environment_scans"("scan_number");
CREATE INDEX IF NOT EXISTS "environment_scans_date_idx" ON "environment_scans"("date");
CREATE INDEX IF NOT EXISTS "environment_scans_week_number_idx" ON "environment_scans"("week_number");

-- Meeting Minutes Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "meeting_minutes_mom_number_key" ON "meeting_minutes"("mom_number");
CREATE UNIQUE INDEX IF NOT EXISTS "meeting_minutes_meeting_id_key" ON "meeting_minutes"("meeting_id");
CREATE INDEX IF NOT EXISTS "meeting_minutes_date_idx" ON "meeting_minutes"("date");
CREATE INDEX IF NOT EXISTS "meeting_minutes_approval_status_idx" ON "meeting_minutes"("approval_status");

-- Innovation Ideas Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "innovation_ideas_idea_number_key" ON "innovation_ideas"("idea_number");
CREATE INDEX IF NOT EXISTS "innovation_ideas_status_idx" ON "innovation_ideas"("status");
CREATE INDEX IF NOT EXISTS "innovation_ideas_proposed_by_id_idx" ON "innovation_ideas"("proposed_by_id");

-- Competitor Watch Indexes
CREATE INDEX IF NOT EXISTS "competitor_watch_competitor_name_idx" ON "competitor_watch"("competitor_name");
CREATE INDEX IF NOT EXISTS "competitor_watch_threat_level_idx" ON "competitor_watch"("threat_level");

-- Daily Closing Reports Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "daily_closing_reports_report_number_key" ON "daily_closing_reports"("report_number");
CREATE INDEX IF NOT EXISTS "daily_closing_reports_date_idx" ON "daily_closing_reports"("date");

-- Autonomous Meeting Sessions Indexes
CREATE UNIQUE INDEX IF NOT EXISTS "autonomous_meeting_sessions_session_number_key" ON "autonomous_meeting_sessions"("session_number");
CREATE UNIQUE INDEX IF NOT EXISTS "autonomous_meeting_sessions_meeting_id_key" ON "autonomous_meeting_sessions"("meeting_id");
CREATE INDEX IF NOT EXISTS "autonomous_meeting_sessions_status_idx" ON "autonomous_meeting_sessions"("status");

-- ============================================
-- AddForeignKey (with duplicate handling)
-- ============================================

-- Morning Intelligence -> BoardMeeting
DO $$ BEGIN
  ALTER TABLE "morning_intelligence" ADD CONSTRAINT "morning_intelligence_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "board_meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Meeting Minutes -> BoardMeeting
DO $$ BEGIN
  ALTER TABLE "meeting_minutes" ADD CONSTRAINT "meeting_minutes_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "board_meetings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Innovation Idea -> MeetingMinutes
DO $$ BEGIN
  ALTER TABLE "innovation_ideas" ADD CONSTRAINT "innovation_ideas_mom_id_fkey" FOREIGN KEY ("mom_id") REFERENCES "meeting_minutes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Innovation Idea -> BoardMember (proposer)
DO $$ BEGIN
  ALTER TABLE "innovation_ideas" ADD CONSTRAINT "innovation_ideas_proposed_by_id_fkey" FOREIGN KEY ("proposed_by_id") REFERENCES "board_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Innovation Idea -> BoardMember (owner)
DO $$ BEGIN
  ALTER TABLE "innovation_ideas" ADD CONSTRAINT "innovation_ideas_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "board_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Autonomous Meeting Session -> BoardMeeting
DO $$ BEGIN
  ALTER TABLE "autonomous_meeting_sessions" ADD CONSTRAINT "autonomous_meeting_sessions_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "board_meetings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================
-- Seed initial competitors data
-- ============================================
INSERT INTO "competitor_watch" ("id", "competitor_name", "competitor_type", "threat_level", "created_at", "updated_at")
VALUES
  (gen_random_uuid(), 'OLX Egypt', 'DIRECT', 'HIGH', NOW(), NOW()),
  (gen_random_uuid(), 'Noon', 'INDIRECT', 'MEDIUM', NOW(), NOW()),
  (gen_random_uuid(), 'Amazon Egypt', 'INDIRECT', 'MEDIUM', NOW(), NOW()),
  (gen_random_uuid(), 'Jumia', 'INDIRECT', 'MEDIUM', NOW(), NOW()),
  (gen_random_uuid(), 'Dubizzle', 'DIRECT', 'LOW', NOW(), NOW()),
  (gen_random_uuid(), 'Facebook Marketplace', 'DIRECT', 'HIGH', NOW(), NOW())
ON CONFLICT DO NOTHING;
