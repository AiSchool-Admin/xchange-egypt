-- CreateEnum: Governance Enums
CREATE TYPE "BoardMeetingType" AS ENUM ('STANDUP', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'EMERGENCY');
CREATE TYPE "BoardMeetingStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "ActionItemStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'OVERDUE', 'CANCELLED');
CREATE TYPE "ActionItemPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "KPIStatus" AS ENUM ('GREEN', 'YELLOW', 'RED');
CREATE TYPE "KPICategory" AS ENUM ('FINANCIAL', 'OPERATIONAL', 'CUSTOMER', 'TECHNICAL', 'GROWTH', 'LEGAL');
CREATE TYPE "AlertSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL', 'EMERGENCY');
CREATE TYPE "AlertStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED', 'DISMISSED');
CREATE TYPE "SPADERole" AS ENUM ('SETTING', 'PEOPLE', 'ALTERNATIVES', 'DECIDE', 'EXPLAIN');
CREATE TYPE "SPADEStatus" AS ENUM ('INITIATED', 'SETTING_PHASE', 'PEOPLE_PHASE', 'ALTERNATIVES_PHASE', 'DECIDE_PHASE', 'EXPLAIN_PHASE', 'COMPLETED', 'CANCELLED');

-- CreateTable: BoardMeeting
CREATE TABLE "board_meetings" (
    "id" TEXT NOT NULL,
    "meeting_number" TEXT NOT NULL,
    "type" "BoardMeetingType" NOT NULL,
    "status" "BoardMeetingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "title" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description" TEXT,
    "description_ar" TEXT,
    "agenda" JSONB,
    "agenda_template_id" TEXT,
    "scheduled_at" TIMESTAMP(3) NOT NULL,
    "started_at" TIMESTAMP(3),
    "ended_at" TIMESTAMP(3),
    "duration" INTEGER,
    "trigger_alert_id" TEXT,
    "summary" TEXT,
    "summary_ar" TEXT,
    "conversation_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_meetings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BoardMeetingAttendee
CREATE TABLE "board_meeting_attendees" (
    "id" TEXT NOT NULL,
    "meeting_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "attended" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3),
    "left_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "board_meeting_attendees_pkey" PRIMARY KEY ("id")
);

-- CreateTable: ActionItem
CREATE TABLE "action_items" (
    "id" TEXT NOT NULL,
    "item_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description" TEXT,
    "description_ar" TEXT,
    "status" "ActionItemStatus" NOT NULL DEFAULT 'PENDING',
    "priority" "ActionItemPriority" NOT NULL DEFAULT 'MEDIUM',
    "assignee_id" TEXT NOT NULL,
    "assigned_by_id" TEXT NOT NULL,
    "meeting_id" TEXT,
    "decision_id" TEXT,
    "due_date" TIMESTAMP(3) NOT NULL,
    "completed_at" TIMESTAMP(3),
    "progress" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "action_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable: KPIMetric
CREATE TABLE "kpi_metrics" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "name_ar" TEXT NOT NULL,
    "description" TEXT,
    "description_ar" TEXT,
    "category" "KPICategory" NOT NULL,
    "unit" TEXT,
    "current_value" DOUBLE PRECISION NOT NULL,
    "previous_value" DOUBLE PRECISION,
    "target_value" DOUBLE PRECISION NOT NULL,
    "warning_threshold" DOUBLE PRECISION NOT NULL,
    "critical_threshold" DOUBLE PRECISION NOT NULL,
    "threshold_direction" TEXT NOT NULL DEFAULT 'above',
    "status" "KPIStatus" NOT NULL DEFAULT 'GREEN',
    "trend" TEXT,
    "trend_percentage" DOUBLE PRECISION,
    "owner_id" TEXT NOT NULL,
    "last_updated_at" TIMESTAMP(3) NOT NULL,
    "refresh_interval" INTEGER NOT NULL DEFAULT 86400,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kpi_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable: KPIHistory
CREATE TABLE "kpi_history" (
    "id" TEXT NOT NULL,
    "kpi_id" TEXT NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "status" "KPIStatus" NOT NULL,
    "recorded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BoardAlert
CREATE TABLE "board_alerts" (
    "id" TEXT NOT NULL,
    "alert_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "severity" "AlertSeverity" NOT NULL,
    "status" "AlertStatus" NOT NULL DEFAULT 'ACTIVE',
    "source_type" TEXT NOT NULL,
    "source_id" TEXT,
    "kpi_id" TEXT,
    "assigned_to_id" TEXT,
    "acknowledged_by_id" TEXT,
    "acknowledged_at" TIMESTAMP(3),
    "resolved_by_id" TEXT,
    "resolved_at" TIMESTAMP(3),
    "resolution" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BoardDecisionSPADE
CREATE TABLE "board_decisions_spade" (
    "id" TEXT NOT NULL,
    "decision_number" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "status" "SPADEStatus" NOT NULL DEFAULT 'INITIATED',
    "current_phase" "SPADERole" NOT NULL DEFAULT 'SETTING',
    "context" TEXT,
    "context_ar" TEXT,
    "constraints" JSONB,
    "deadline" TIMESTAMP(3),
    "decision_maker_id" TEXT NOT NULL,
    "selected_alternative_id" TEXT,
    "decided_at" TIMESTAMP(3),
    "explanation" TEXT,
    "explanation_ar" TEXT,
    "communication_plan" TEXT,
    "meeting_id" TEXT,
    "initiated_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "board_decisions_spade_pkey" PRIMARY KEY ("id")
);

-- CreateTable: BoardMemberOnSPADE
CREATE TABLE "board_member_on_spade" (
    "id" TEXT NOT NULL,
    "decision_id" TEXT NOT NULL,
    "member_id" TEXT NOT NULL,
    "role" TEXT,
    "opinion" TEXT,
    "opinion_ar" TEXT,
    "voted_for" TEXT,

    CONSTRAINT "board_member_on_spade_pkey" PRIMARY KEY ("id")
);

-- CreateTable: SPADEAlternative
CREATE TABLE "spade_alternatives" (
    "id" TEXT NOT NULL,
    "decision_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "title_ar" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "pros" JSONB,
    "cons" JSONB,
    "risks" JSONB,
    "cost" DOUBLE PRECISION,
    "time_estimate" TEXT,
    "score" DOUBLE PRECISION,
    "votes" INTEGER NOT NULL DEFAULT 0,
    "proposed_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "spade_alternatives_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "board_meetings_meeting_number_key" ON "board_meetings"("meeting_number");
CREATE UNIQUE INDEX "board_meetings_trigger_alert_id_key" ON "board_meetings"("trigger_alert_id");
CREATE UNIQUE INDEX "board_meetings_conversation_id_key" ON "board_meetings"("conversation_id");
CREATE INDEX "board_meetings_type_idx" ON "board_meetings"("type");
CREATE INDEX "board_meetings_status_idx" ON "board_meetings"("status");
CREATE INDEX "board_meetings_scheduled_at_idx" ON "board_meetings"("scheduled_at");

CREATE UNIQUE INDEX "board_meeting_attendees_meeting_id_member_id_key" ON "board_meeting_attendees"("meeting_id", "member_id");
CREATE INDEX "board_meeting_attendees_meeting_id_idx" ON "board_meeting_attendees"("meeting_id");
CREATE INDEX "board_meeting_attendees_member_id_idx" ON "board_meeting_attendees"("member_id");

CREATE UNIQUE INDEX "action_items_item_number_key" ON "action_items"("item_number");
CREATE INDEX "action_items_status_idx" ON "action_items"("status");
CREATE INDEX "action_items_priority_idx" ON "action_items"("priority");
CREATE INDEX "action_items_assignee_id_idx" ON "action_items"("assignee_id");
CREATE INDEX "action_items_due_date_idx" ON "action_items"("due_date");

CREATE UNIQUE INDEX "kpi_metrics_code_key" ON "kpi_metrics"("code");
CREATE INDEX "kpi_metrics_category_idx" ON "kpi_metrics"("category");
CREATE INDEX "kpi_metrics_status_idx" ON "kpi_metrics"("status");
CREATE INDEX "kpi_metrics_owner_id_idx" ON "kpi_metrics"("owner_id");

CREATE INDEX "kpi_history_kpi_id_idx" ON "kpi_history"("kpi_id");
CREATE INDEX "kpi_history_recorded_at_idx" ON "kpi_history"("recorded_at");

CREATE UNIQUE INDEX "board_alerts_alert_number_key" ON "board_alerts"("alert_number");
CREATE INDEX "board_alerts_severity_idx" ON "board_alerts"("severity");
CREATE INDEX "board_alerts_status_idx" ON "board_alerts"("status");
CREATE INDEX "board_alerts_kpi_id_idx" ON "board_alerts"("kpi_id");
CREATE INDEX "board_alerts_created_at_idx" ON "board_alerts"("created_at");

CREATE UNIQUE INDEX "board_decisions_spade_decision_number_key" ON "board_decisions_spade"("decision_number");
CREATE INDEX "board_decisions_spade_status_idx" ON "board_decisions_spade"("status");
CREATE INDEX "board_decisions_spade_current_phase_idx" ON "board_decisions_spade"("current_phase");
CREATE INDEX "board_decisions_spade_decision_maker_id_idx" ON "board_decisions_spade"("decision_maker_id");

CREATE UNIQUE INDEX "board_member_on_spade_decision_id_member_id_key" ON "board_member_on_spade"("decision_id", "member_id");
CREATE INDEX "board_member_on_spade_decision_id_idx" ON "board_member_on_spade"("decision_id");
CREATE INDEX "board_member_on_spade_member_id_idx" ON "board_member_on_spade"("member_id");

CREATE INDEX "spade_alternatives_decision_id_idx" ON "spade_alternatives"("decision_id");
CREATE INDEX "spade_alternatives_proposed_by_id_idx" ON "spade_alternatives"("proposed_by_id");

-- AddForeignKey
ALTER TABLE "board_meetings" ADD CONSTRAINT "board_meetings_trigger_alert_id_fkey" FOREIGN KEY ("trigger_alert_id") REFERENCES "board_alerts"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "board_meetings" ADD CONSTRAINT "board_meetings_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "board_conversations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "board_meeting_attendees" ADD CONSTRAINT "board_meeting_attendees_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "board_meetings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "board_meeting_attendees" ADD CONSTRAINT "board_meeting_attendees_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "board_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "action_items" ADD CONSTRAINT "action_items_assignee_id_fkey" FOREIGN KEY ("assignee_id") REFERENCES "board_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_assigned_by_id_fkey" FOREIGN KEY ("assigned_by_id") REFERENCES "board_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "board_meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "board_decisions_spade"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "kpi_metrics" ADD CONSTRAINT "kpi_metrics_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "board_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "kpi_history" ADD CONSTRAINT "kpi_history_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "kpi_metrics"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "board_alerts" ADD CONSTRAINT "board_alerts_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "kpi_metrics"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "board_alerts" ADD CONSTRAINT "board_alerts_assigned_to_id_fkey" FOREIGN KEY ("assigned_to_id") REFERENCES "board_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "board_alerts" ADD CONSTRAINT "board_alerts_acknowledged_by_id_fkey" FOREIGN KEY ("acknowledged_by_id") REFERENCES "board_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "board_alerts" ADD CONSTRAINT "board_alerts_resolved_by_id_fkey" FOREIGN KEY ("resolved_by_id") REFERENCES "board_members"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "board_decisions_spade" ADD CONSTRAINT "board_decisions_spade_decision_maker_id_fkey" FOREIGN KEY ("decision_maker_id") REFERENCES "board_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "board_decisions_spade" ADD CONSTRAINT "board_decisions_spade_selected_alternative_id_fkey" FOREIGN KEY ("selected_alternative_id") REFERENCES "spade_alternatives"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "board_decisions_spade" ADD CONSTRAINT "board_decisions_spade_meeting_id_fkey" FOREIGN KEY ("meeting_id") REFERENCES "board_meetings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "board_decisions_spade" ADD CONSTRAINT "board_decisions_spade_initiated_by_id_fkey" FOREIGN KEY ("initiated_by_id") REFERENCES "board_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "board_member_on_spade" ADD CONSTRAINT "board_member_on_spade_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "board_decisions_spade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "board_member_on_spade" ADD CONSTRAINT "board_member_on_spade_member_id_fkey" FOREIGN KEY ("member_id") REFERENCES "board_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "spade_alternatives" ADD CONSTRAINT "spade_alternatives_decision_id_fkey" FOREIGN KEY ("decision_id") REFERENCES "board_decisions_spade"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "spade_alternatives" ADD CONSTRAINT "spade_alternatives_proposed_by_id_fkey" FOREIGN KEY ("proposed_by_id") REFERENCES "board_members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
