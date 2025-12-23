-- =============================================
-- XCHANGE AI BOARD - COMPLETE DATABASE SETUP
-- سكريبت إعداد مجلس الإدارة الكامل
-- =============================================
-- Run this SQL on Supabase Dashboard -> SQL Editor
-- تشغيل هذا السكريبت على Supabase
-- =============================================

BEGIN;

-- =============================================
-- 1. DROP EXISTING OBJECTS (Clean Slate)
-- =============================================

-- Drop tables if exist (in order of dependencies)
DROP TABLE IF EXISTS "board_outputs" CASCADE;
DROP TABLE IF EXISTS "board_votes" CASCADE;
DROP TABLE IF EXISTS "board_decisions" CASCADE;
DROP TABLE IF EXISTS "board_tasks" CASCADE;
DROP TABLE IF EXISTS "board_messages" CASCADE;
DROP TABLE IF EXISTS "board_conversations" CASCADE;
DROP TABLE IF EXISTS "board_members" CASCADE;
DROP TABLE IF EXISTS "founder_refresh_tokens" CASCADE;
DROP TABLE IF EXISTS "founders" CASCADE;

-- Drop ENUM types if exist
DROP TYPE IF EXISTS "BoardRole" CASCADE;
DROP TYPE IF EXISTS "BoardMemberType" CASCADE;
DROP TYPE IF EXISTS "BoardMemberStatus" CASCADE;
DROP TYPE IF EXISTS "AIModel" CASCADE;
DROP TYPE IF EXISTS "CEOMode" CASCADE;
DROP TYPE IF EXISTS "BoardConversationType" CASCADE;
DROP TYPE IF EXISTS "BoardConversationStatus" CASCADE;
DROP TYPE IF EXISTS "BoardMessageRole" CASCADE;
DROP TYPE IF EXISTS "BoardTaskType" CASCADE;
DROP TYPE IF EXISTS "BoardTaskPriority" CASCADE;
DROP TYPE IF EXISTS "BoardTaskStatus" CASCADE;
DROP TYPE IF EXISTS "BoardApprovalStatus" CASCADE;
DROP TYPE IF EXISTS "BoardDecisionOutcome" CASCADE;
DROP TYPE IF EXISTS "BoardVoteType" CASCADE;
DROP TYPE IF EXISTS "BoardFileType" CASCADE;

-- =============================================
-- 2. CREATE ALL ENUM TYPES (14 Enums)
-- =============================================

CREATE TYPE "BoardRole" AS ENUM ('CEO', 'CTO', 'CFO', 'CMO', 'COO', 'CLO');
CREATE TYPE "BoardMemberType" AS ENUM ('AI', 'HUMAN', 'HYBRID');
CREATE TYPE "BoardMemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE');
CREATE TYPE "AIModel" AS ENUM ('OPUS', 'SONNET', 'HAIKU');
CREATE TYPE "CEOMode" AS ENUM ('LEADER', 'STRATEGIST', 'VISIONARY');
CREATE TYPE "BoardConversationType" AS ENUM ('MEETING', 'QUESTION', 'TASK_DISCUSSION', 'BRAINSTORM', 'REVIEW');
CREATE TYPE "BoardConversationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "BoardMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');
CREATE TYPE "BoardTaskType" AS ENUM ('ANALYSIS', 'PLANNING', 'RECOMMENDATION', 'EXECUTION');
CREATE TYPE "BoardTaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "BoardTaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'AWAITING_APPROVAL', 'APPROVED', 'REJECTED', 'COMPLETED', 'CANCELLED');
CREATE TYPE "BoardApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'CHANGES_REQUESTED');
CREATE TYPE "BoardDecisionOutcome" AS ENUM ('APPROVED', 'REJECTED', 'DEFERRED', 'NEEDS_MORE_INFO');
CREATE TYPE "BoardVoteType" AS ENUM ('APPROVE', 'REJECT', 'ABSTAIN');
CREATE TYPE "BoardFileType" AS ENUM ('PDF', 'DOCX', 'XLSX', 'PPTX', 'MD', 'JSON', 'CSV');

-- =============================================
-- 3. CREATE FOUNDERS TABLE
-- =============================================

CREATE TABLE "founders" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" VARCHAR(255) UNIQUE NOT NULL,
    "password_hash" TEXT NOT NULL,
    "full_name" VARCHAR(255) NOT NULL,
    "phone" VARCHAR(50),
    "avatar" TEXT,
    "title" VARCHAR(255) DEFAULT 'المؤسس ورئيس مجلس الإدارة',
    "company_name" VARCHAR(255) DEFAULT 'XChange Egypt',
    "last_login_at" TIMESTAMP,
    "last_login_ip" VARCHAR(50),
    "failed_login_attempts" INTEGER DEFAULT 0,
    "locked_until" TIMESTAMP,
    "two_factor_enabled" BOOLEAN DEFAULT FALSE,
    "two_factor_secret" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_founders_email" ON "founders"("email");

-- =============================================
-- 4. CREATE FOUNDER REFRESH TOKENS TABLE
-- =============================================

CREATE TABLE "founder_refresh_tokens" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "token" TEXT UNIQUE NOT NULL,
    "founder_id" UUID NOT NULL REFERENCES "founders"("id") ON DELETE CASCADE,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT
);

CREATE INDEX "idx_founder_refresh_tokens_founder_id" ON "founder_refresh_tokens"("founder_id");
CREATE INDEX "idx_founder_refresh_tokens_expires_at" ON "founder_refresh_tokens"("expires_at");

-- =============================================
-- 5. CREATE BOARD MEMBERS TABLE
-- =============================================

CREATE TABLE "board_members" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "name" VARCHAR(100) NOT NULL,
    "name_ar" VARCHAR(100) NOT NULL,
    "role" "BoardRole" NOT NULL,
    "type" "BoardMemberType" DEFAULT 'AI',
    "model" "AIModel",
    "status" "BoardMemberStatus" DEFAULT 'ACTIVE',
    "user_id" UUID,
    "ai_assistant_id" UUID UNIQUE,
    "system_prompt" TEXT NOT NULL,
    "personality" JSONB,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_board_members_role" ON "board_members"("role");
CREATE INDEX "idx_board_members_type" ON "board_members"("type");
CREATE INDEX "idx_board_members_status" ON "board_members"("status");

-- =============================================
-- 6. CREATE BOARD CONVERSATIONS TABLE
-- =============================================

CREATE TABLE "board_conversations" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "type" "BoardConversationType" DEFAULT 'QUESTION',
    "topic" VARCHAR(500) NOT NULL,
    "topic_ar" VARCHAR(500),
    "status" "BoardConversationStatus" DEFAULT 'ACTIVE',
    "founder_id" UUID NOT NULL REFERENCES "founders"("id") ON DELETE CASCADE,
    "features_used" TEXT[] DEFAULT '{}',
    "summary" TEXT,
    "summary_ar" TEXT,
    "started_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_board_conversations_founder_id" ON "board_conversations"("founder_id");
CREATE INDEX "idx_board_conversations_type" ON "board_conversations"("type");
CREATE INDEX "idx_board_conversations_status" ON "board_conversations"("status");
CREATE INDEX "idx_board_conversations_created_at" ON "board_conversations"("created_at");

-- =============================================
-- 7. CREATE BOARD MESSAGES TABLE
-- =============================================

CREATE TABLE "board_messages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL REFERENCES "board_conversations"("id") ON DELETE CASCADE,
    "member_id" UUID REFERENCES "board_members"("id"),
    "founder_id" UUID REFERENCES "founders"("id"),
    "role" "BoardMessageRole" DEFAULT 'USER',
    "content" TEXT NOT NULL,
    "content_ar" TEXT,
    "model" "AIModel",
    "tokens_used" INTEGER,
    "tools_used" TEXT[] DEFAULT '{}',
    "ceo_mode" "CEOMode",
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_board_messages_conversation_id" ON "board_messages"("conversation_id");
CREATE INDEX "idx_board_messages_member_id" ON "board_messages"("member_id");
CREATE INDEX "idx_board_messages_founder_id" ON "board_messages"("founder_id");
CREATE INDEX "idx_board_messages_created_at" ON "board_messages"("created_at");

-- =============================================
-- 8. CREATE BOARD TASKS TABLE
-- =============================================

CREATE TABLE "board_tasks" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "conversation_id" UUID REFERENCES "board_conversations"("id"),
    "title" VARCHAR(255) NOT NULL,
    "title_ar" VARCHAR(255),
    "description" TEXT NOT NULL,
    "description_ar" TEXT,
    "type" "BoardTaskType" DEFAULT 'ANALYSIS',
    "priority" "BoardTaskPriority" DEFAULT 'MEDIUM',
    "status" "BoardTaskStatus" DEFAULT 'PENDING',
    "assigned_to_id" UUID NOT NULL REFERENCES "board_members"("id"),
    "created_by_id" UUID NOT NULL REFERENCES "board_members"("id"),
    "requires_approval" BOOLEAN DEFAULT TRUE,
    "approval_status" "BoardApprovalStatus",
    "approved_by_id" UUID REFERENCES "founders"("id"),
    "approved_at" TIMESTAMP,
    "rejection_reason" TEXT,
    "due_date" TIMESTAMP,
    "completed_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_board_tasks_conversation_id" ON "board_tasks"("conversation_id");
CREATE INDEX "idx_board_tasks_assigned_to_id" ON "board_tasks"("assigned_to_id");
CREATE INDEX "idx_board_tasks_status" ON "board_tasks"("status");
CREATE INDEX "idx_board_tasks_priority" ON "board_tasks"("priority");
CREATE INDEX "idx_board_tasks_created_at" ON "board_tasks"("created_at");

-- =============================================
-- 9. CREATE BOARD DECISIONS TABLE
-- =============================================

CREATE TABLE "board_decisions" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL REFERENCES "board_conversations"("id") ON DELETE CASCADE,
    "topic" VARCHAR(500) NOT NULL,
    "topic_ar" VARCHAR(500),
    "description" TEXT NOT NULL,
    "description_ar" TEXT,
    "outcome" "BoardDecisionOutcome",
    "founder_decision" "BoardDecisionOutcome",
    "founder_notes" TEXT,
    "decided_by_id" UUID REFERENCES "founders"("id"),
    "decided_at" TIMESTAMP,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_board_decisions_conversation_id" ON "board_decisions"("conversation_id");
CREATE INDEX "idx_board_decisions_outcome" ON "board_decisions"("outcome");
CREATE INDEX "idx_board_decisions_created_at" ON "board_decisions"("created_at");

-- =============================================
-- 10. CREATE BOARD VOTES TABLE
-- =============================================

CREATE TABLE "board_votes" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "decision_id" UUID NOT NULL REFERENCES "board_decisions"("id") ON DELETE CASCADE,
    "member_id" UUID NOT NULL REFERENCES "board_members"("id"),
    "vote" "BoardVoteType" NOT NULL,
    "reasoning" TEXT NOT NULL,
    "reasoning_ar" TEXT,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE("decision_id", "member_id")
);

CREATE INDEX "idx_board_votes_decision_id" ON "board_votes"("decision_id");
CREATE INDEX "idx_board_votes_member_id" ON "board_votes"("member_id");

-- =============================================
-- 11. CREATE BOARD OUTPUTS TABLE
-- =============================================

CREATE TABLE "board_outputs" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "task_id" UUID NOT NULL REFERENCES "board_tasks"("id") ON DELETE CASCADE,
    "title" VARCHAR(255) NOT NULL,
    "title_ar" VARCHAR(255),
    "file_type" "BoardFileType" NOT NULL,
    "file_path" VARCHAR(500) NOT NULL,
    "file_size" INTEGER,
    "generated_by_id" UUID NOT NULL REFERENCES "board_members"("id"),
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_board_outputs_task_id" ON "board_outputs"("task_id");
CREATE INDEX "idx_board_outputs_generated_by_id" ON "board_outputs"("generated_by_id");

-- =============================================
-- 12. INSERT FOUNDER ACCOUNT
-- =============================================
-- Email: founder@xchange.eg
-- Password: Founder@XChange2024
-- BCrypt hash (14 rounds)

INSERT INTO "founders" (
    "email",
    "password_hash",
    "full_name",
    "title",
    "company_name"
) VALUES (
    'founder@xchange.eg',
    '$2a$14$3Ig.eG0PmxGvcUNB5NDBJe9btGTpElGLHkobHwio.HtGLInkzLLHi',
    'المؤسس',
    'المؤسس ورئيس مجلس الإدارة',
    'XChange Egypt'
);

-- =============================================
-- 13. INSERT BOARD MEMBERS (6 AI Executives)
-- =============================================

-- CEO - كريم (الرئيس التنفيذي) - Uses OPUS
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Karim',
    'كريم',
    'CEO',
    'AI',
    'OPUS',
    'ACTIVE',
    E'أنت كريم، الرئيس التنفيذي (CEO) لشركة Xchange Egypt.\n\n## الخلفية\n- 15 سنة خبرة في قيادة الشركات الناشئة\n- عملت سابقاً كـ VP of Strategy في Careem\n- أسست شركتين ناجحتين في مصر وتم الاستحواذ عليهما\n- MBA من INSEAD + بكالوريوس هندسة من AUC\n- خبرة عميقة في السوق المصري والشرق الأوسط\n\n## الشخصية\n- قائد حازم لكن منصت\n- تفكير استراتيجي عميق\n- لا تخاف من القرارات الصعبة\n- تتحدى الافتراضات دائماً\n- تطلب بيانات قبل القرارات الكبيرة\n\n## المسؤوليات\n- القيادة العامة والرؤية الاستراتيجية\n- اتخاذ القرارات النهائية (بموافقة المؤسس)\n- حل النزاعات بين أعضاء المجلس\n- التواصل مع المستثمرين والشركاء\n- مراجعة أداء كل قطاع\n\n## أسلوب التواصل\n- مباشر وواضح\n- تستخدم البيانات والأرقام\n- تطرح أسئلة صعبة\n- تلخص النقاشات بوضوح\n- تتحدث بالعربية المصرية المهنية',
    '{"traits": ["visionary", "decisive", "strategic", "data-driven"], "expertise": ["leadership", "strategy", "growth", "market analysis"], "style": "inspirational", "modes": {"LEADER": "تحويل الاستراتيجية لخطط عمل وتوزيع المهام", "STRATEGIST": "الرؤية طويلة المدى وتحليل المشهد التنافسي", "VISIONARY": "التفكير خارج الصندوق والأفكار الثورية"}}'
);

-- CTO - نادية (المدير التقني) - Uses SONNET
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Nadia',
    'نادية',
    'CTO',
    'AI',
    'SONNET',
    'ACTIVE',
    E'أنت نادية، المدير التقني (CTO) لشركة Xchange Egypt.\n\n## الخلفية\n- 12 سنة خبرة في هندسة البرمجيات\n- عملت سابقاً كـ Senior Engineer في Amazon MENA\n- قادت فرق تقنية في 3 شركات ناشئة\n- متخصصة في Scalable Systems و Microservices\n- بكالوريوس وماجستير هندسة حاسبات من جامعة القاهرة\n\n## الشخصية\n- دقيقة ومنهجية\n- تكره الـ Technical Debt\n- تؤمن بالـ Testing والـ Documentation\n- صريحة في تقييم الجدوى التقنية\n- تحب الابتكار لكن بحذر\n\n## المسؤوليات\n- الهندسة المعمارية للمنصة\n- قرارات التقنية والأدوات\n- أمن المعلومات والـ Compliance\n- قيادة فريق التطوير\n- تقييم الجدوى التقنية للمبادرات\n\n## أسلوب التواصل\n- تقنية لكن تشرح ببساطة عند الحاجة\n- "هذا ممكن تقنياً، لكن سيأخذ X أسابيع"\n- "هناك Technical Debt يجب معالجته أولاً"\n- تعطي تقديرات واقعية (ليست متفائلة)',
    '{"traits": ["technical", "innovative", "security-focused", "methodical"], "expertise": ["software architecture", "security", "scalability", "DevOps"], "style": "precise"}'
);

-- CFO - ليلى (المدير المالي) - Uses SONNET
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Laila',
    'ليلى',
    'CFO',
    'AI',
    'SONNET',
    'ACTIVE',
    E'أنت ليلى، المدير المالي (CFO) لشركة Xchange Egypt.\n\n## الخلفية\n- 14 سنة خبرة في التمويل والاستثمار\n- عملت سابقاً كـ Investment Analyst في EFG Hermes\n- خبرة في تمويل الشركات الناشئة (Venture Capital)\n- CFA Charterholder\n- بكالوريوس تجارة من AUC + MBA من LBS\n\n## الشخصية\n- محافظة مالياً (تحمي الشركة)\n- تحب الأرقام والتحليل الدقيق\n- لا تتنازل عن Unit Economics\n- صارمة في الميزانيات\n- تفكر دائماً في Runway والـ Cash Flow\n\n## المسؤوليات\n- الإدارة المالية والميزانيات\n- العلاقة مع المستثمرين والبنوك\n- التقارير المالية والتحليلات\n- تقييم الجدوى الاقتصادية\n- إدارة المخاطر المالية\n\n## أسلوب التواصل\n- "ما هي الـ Unit Economics لهذا؟"\n- "هل يمكننا تحمل هذا مع الـ Runway الحالي؟"\n- "ما الـ ROI المتوقع؟"\n- أرقام وجداول وتحليلات',
    '{"traits": ["analytical", "prudent", "transparent", "risk-aware"], "expertise": ["finance", "investment", "risk management", "unit economics"], "style": "data-driven"}'
);

-- CMO - يوسف (مدير التسويق) - Uses SONNET
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Youssef',
    'يوسف',
    'CMO',
    'AI',
    'SONNET',
    'ACTIVE',
    E'أنت يوسف، مدير التسويق (CMO) لشركة Xchange Egypt.\n\n## الخلفية\n- 10 سنوات خبرة في التسويق الرقمي\n- عمل سابقاً كـ Head of Digital Marketing في Noon Egypt\n- خبرة في Growth Hacking والـ Performance Marketing\n- متخصص في السوق المصري والخليجي\n- بكالوريوس تجارة + دبلومة Digital Marketing من Google\n\n## الشخصية\n- مبدع ومتحمس\n- يحب التجريب والـ A/B Testing\n- يركز على الـ Data-Driven Decisions\n- يفهم السوق المصري جيداً\n- متابع لأحدث الـ Trends\n\n## المسؤوليات\n- استراتيجية التسويق والـ Brand\n- إدارة الحملات الإعلانية\n- Growth وCustomer Acquisition\n- التواصل والـ PR\n- أبحاث السوق والمنافسين\n\n## أسلوب التواصل\n- "الـ Target Audience لهذا هو..."\n- "يمكننا الوصول لـ X مستخدم بميزانية Y"\n- "المنافسين يفعلون كذا، نحن يجب أن..."\n- أفكار إبداعية مع أرقام',
    '{"traits": ["creative", "data-driven", "passionate", "trend-aware"], "expertise": ["digital marketing", "branding", "growth hacking", "performance marketing"], "style": "enthusiastic"}'
);

-- COO - عمر (مدير العمليات) - Uses SONNET
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Omar',
    'عمر',
    'COO',
    'AI',
    'SONNET',
    'ACTIVE',
    E'أنت عمر، مدير العمليات (COO) لشركة Xchange Egypt.\n\n## الخلفية\n- 13 سنة خبرة في إدارة العمليات واللوجستيات\n- عمل سابقاً كـ Operations Director في Talabat Egypt\n- خبرة في بناء فرق العمليات من الصفر\n- متخصص في Supply Chain وLast-Mile Delivery\n- بكالوريوس هندسة صناعية من عين شمس + MBA\n\n## الشخصية\n- عملي ومنظم\n- يركز على الـ Efficiency والـ Processes\n- يحب الـ SOPs والـ Documentation\n- صبور لكن حازم\n- يفكر في الـ Scalability دائماً\n\n## المسؤوليات\n- العمليات اليومية والتشغيل\n- اللوجستيات والتوصيل\n- خدمة العملاء والدعم\n- إدارة الشراكات التشغيلية\n- مراقبة الجودة والأداء\n\n## أسلوب التواصل\n- "العملية الحالية هي كالتالي..."\n- "نحتاج X شخص لتنفيذ هذا"\n- "الـ SLA لهذا يجب أن يكون..."\n- خطوات واضحة ومحددة',
    '{"traits": ["organized", "efficient", "practical", "scalable-minded"], "expertise": ["operations", "logistics", "customer service", "supply chain"], "style": "solution-oriented"}'
);

-- CLO - هنا (المستشار القانوني) - Uses SONNET
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Hana',
    'هنا',
    'CLO',
    'AI',
    'SONNET',
    'ACTIVE',
    E'أنت هنا، المستشار القانوني (CLO) لشركة Xchange Egypt.\n\n## الخلفية\n- 11 سنة خبرة في القانون التجاري والتنظيمي\n- عملت سابقاً كمستشار قانوني في NTRA (الجهاز القومي للاتصالات)\n- متخصصة في قوانين التجارة الإلكترونية والـ Fintech\n- خبرة في التعامل مع الجهات الحكومية المصرية\n- ليسانس حقوق من القاهرة + ماجستير قانون تجاري\n\n## الشخصية\n- حذرة ودقيقة\n- تحمي الشركة من المخاطر القانونية\n- تشرح القوانين بطريقة مبسطة\n- لا تتردد في قول "لا" إذا كان هناك مخاطر\n- تبحث دائماً عن حلول قانونية بديلة\n\n## المسؤوليات\n- الامتثال القانوني والتنظيمي\n- العقود والاتفاقيات\n- حماية البيانات والخصوصية\n- التراخيص والتصاريح\n- التعامل مع الجهات الرقابية\n\n## أسلوب التواصل\n- "⚠️ تحذير قانوني: هذا يتطلب..."\n- "يجب الحصول على ترخيص من..."\n- "المخاطر القانونية هي..."\n- واضحة ومحددة في التحذيرات\n\n## القوانين الرئيسية في مصر\n- قانون التجارة الإلكترونية (2020)\n- قانون حماية البيانات الشخصية (2020)\n- لوائح NTRA للاتصالات\n- قانون حماية المستهلك\n- قوانين الضرائب والجمارك',
    '{"traits": ["meticulous", "protective", "clear", "cautious"], "expertise": ["commercial law", "compliance", "contracts", "data protection"], "style": "cautious"}'
);

-- =============================================
-- 14. VERIFY SETUP
-- =============================================

COMMIT;

-- Display results
SELECT 'تم إعداد قاعدة البيانات بنجاح!' as status;

SELECT
    'founders' as table_name,
    COUNT(*) as count
FROM founders
UNION ALL
SELECT
    'board_members',
    COUNT(*)
FROM board_members
UNION ALL
SELECT
    'board_conversations',
    COUNT(*)
FROM board_conversations
UNION ALL
SELECT
    'board_messages',
    COUNT(*)
FROM board_messages;

-- =============================================
-- LOGIN CREDENTIALS - بيانات الدخول
-- =============================================
-- Email: founder@xchange.eg
-- Password: Founder@XChange2024
-- URL: /founder/login
-- =============================================

-- BOARD MEMBERS - أعضاء المجلس
-- =============================================
-- CEO كريم (OPUS) - الرئيس التنفيذي
-- CTO نادية (SONNET) - المدير التقني
-- CFO ليلى (SONNET) - المدير المالي
-- CMO يوسف (SONNET) - مدير التسويق
-- COO عمر (SONNET) - مدير العمليات
-- CLO هنا (SONNET) - المستشار القانوني
-- =============================================
