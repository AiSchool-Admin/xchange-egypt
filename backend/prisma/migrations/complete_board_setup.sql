-- =============================================
-- Complete Board Setup Script
-- سكريبت إعداد مجلس الإدارة الكامل
-- =============================================
-- Run this SQL on Supabase Dashboard -> SQL Editor
-- =============================================

-- =============================================
-- 1. CREATE ENUM TYPES
-- =============================================

-- Drop existing types if they exist (to avoid conflicts)
DO $$ BEGIN
    DROP TYPE IF EXISTS "BoardRole" CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS "BoardMemberType" CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS "BoardMemberStatus" CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS "AIModel" CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS "BoardConversationType" CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS "BoardConversationStatus" CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;

DO $$ BEGIN
    DROP TYPE IF EXISTS "BoardMessageRole" CASCADE;
EXCEPTION WHEN others THEN NULL; END $$;

-- Create ENUM types
CREATE TYPE "BoardRole" AS ENUM ('CEO', 'CTO', 'CFO', 'CMO', 'COO', 'CLO');
CREATE TYPE "BoardMemberType" AS ENUM ('AI', 'HUMAN', 'HYBRID');
CREATE TYPE "BoardMemberStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'ON_LEAVE');
CREATE TYPE "AIModel" AS ENUM ('OPUS', 'SONNET', 'HAIKU');
CREATE TYPE "BoardConversationType" AS ENUM ('MEETING', 'QUESTION', 'TASK_DISCUSSION', 'BRAINSTORM', 'REVIEW');
CREATE TYPE "BoardConversationStatus" AS ENUM ('ACTIVE', 'COMPLETED', 'ARCHIVED');
CREATE TYPE "BoardMessageRole" AS ENUM ('USER', 'ASSISTANT', 'SYSTEM');

-- =============================================
-- 2. CREATE FOUNDERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS "founders" (
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

-- =============================================
-- 3. CREATE FOUNDER REFRESH TOKENS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS "founder_refresh_tokens" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "token" TEXT UNIQUE NOT NULL,
    "founder_id" UUID NOT NULL REFERENCES "founders"("id") ON DELETE CASCADE,
    "expires_at" TIMESTAMP NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "ip_address" VARCHAR(50),
    "user_agent" TEXT
);

CREATE INDEX IF NOT EXISTS "idx_founder_refresh_tokens_founder_id" ON "founder_refresh_tokens"("founder_id");
CREATE INDEX IF NOT EXISTS "idx_founder_refresh_tokens_expires_at" ON "founder_refresh_tokens"("expires_at");

-- =============================================
-- 4. CREATE BOARD MEMBERS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS "board_members" (
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

CREATE INDEX IF NOT EXISTS "idx_board_members_role" ON "board_members"("role");
CREATE INDEX IF NOT EXISTS "idx_board_members_type" ON "board_members"("type");
CREATE INDEX IF NOT EXISTS "idx_board_members_status" ON "board_members"("status");

-- =============================================
-- 5. CREATE BOARD CONVERSATIONS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS "board_conversations" (
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

CREATE INDEX IF NOT EXISTS "idx_board_conversations_founder_id" ON "board_conversations"("founder_id");
CREATE INDEX IF NOT EXISTS "idx_board_conversations_type" ON "board_conversations"("type");
CREATE INDEX IF NOT EXISTS "idx_board_conversations_status" ON "board_conversations"("status");
CREATE INDEX IF NOT EXISTS "idx_board_conversations_created_at" ON "board_conversations"("created_at");

-- =============================================
-- 6. CREATE BOARD MESSAGES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS "board_messages" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "conversation_id" UUID NOT NULL REFERENCES "board_conversations"("id") ON DELETE CASCADE,
    "member_id" UUID REFERENCES "board_members"("id"),
    "founder_id" UUID REFERENCES "founders"("id"),
    "role" "BoardMessageRole" DEFAULT 'USER',
    "content" TEXT NOT NULL,
    "content_ar" TEXT,
    "model" "AIModel",
    "tokens_used" INTEGER,
    "processing_time_ms" INTEGER,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_board_messages_conversation_id" ON "board_messages"("conversation_id");
CREATE INDEX IF NOT EXISTS "idx_board_messages_member_id" ON "board_messages"("member_id");
CREATE INDEX IF NOT EXISTS "idx_board_messages_created_at" ON "board_messages"("created_at");

-- =============================================
-- 7. INSERT FOUNDER ACCOUNT
-- =============================================
-- Email: founder@xchange.eg
-- Password: Founder@XChange2024

INSERT INTO "founders" (
    "email",
    "password_hash",
    "full_name",
    "title",
    "company_name"
) VALUES (
    'founder@xchange.eg',
    '$2a$14$3Ig.eG0PmxGvcUNB5NDBJe9btGTpElGLHkobHwio.HtGLInkzLLHi',
    'محمد أحمد',
    'المؤسس ورئيس مجلس الإدارة',
    'XChange Egypt'
) ON CONFLICT ("email") DO UPDATE SET
    "full_name" = EXCLUDED."full_name",
    "updated_at" = CURRENT_TIMESTAMP;

-- =============================================
-- 8. INSERT BOARD MEMBERS (6 AI Executives)
-- =============================================

-- Delete existing members to avoid duplicates
DELETE FROM "board_members";

-- CEO - كريم (الرئيس التنفيذي)
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Karim',
    'كريم',
    'CEO',
    'AI',
    'OPUS',
    'ACTIVE',
    'أنت كريم، الرئيس التنفيذي لمنصة Xchange Egypt.

## هويتك
- اسمك: كريم
- منصبك: الرئيس التنفيذي (CEO)
- خبرتك: 20+ سنة في قيادة الشركات التقنية والتجارة الإلكترونية في الشرق الأوسط

## شخصيتك
- قائد ذو رؤية استراتيجية بعيدة المدى
- تتخذ قرارات مبنية على البيانات مع حدس تجاري قوي
- تؤمن بالابتكار المستمر والتكيف السريع مع السوق
- تضع العميل في مركز كل قرار
- توازن بين الطموح والواقعية

## مسؤولياتك
1. وضع الرؤية والاستراتيجية العامة للمنصة
2. قيادة فريق القيادة التنفيذية (C-Suite)
3. بناء ثقافة الابتكار والتميز
4. تمثيل الشركة أمام المستثمرين والشركاء
5. ضمان تحقيق أهداف النمو والربحية

## أسلوب التواصل
- واضح ومباشر مع لمسة إلهامية
- تستخدم أمثلة من السوق المصري والإقليمي
- تربط دائماً بين التكتيكات والاستراتيجية الكبرى
- تتحدث بثقة لكن تستمع جيداً للآراء المختلفة',
    '{"traits": ["visionary", "decisive", "strategic"], "expertise": ["leadership", "strategy", "growth"], "style": "inspirational"}'
);

-- CTO - نادية (المدير التقني)
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Nadia',
    'نادية',
    'CTO',
    'AI',
    'SONNET',
    'ACTIVE',
    'أنت نادية، المدير التقني لمنصة Xchange Egypt.

## هويتك
- اسمك: نادية
- منصبك: المدير التقني (CTO)
- خبرتك: 15+ سنة في هندسة البرمجيات وقيادة الفرق التقنية

## شخصيتك
- تقنية بامتياز مع فهم عميق للأعمال
- تؤمن بالحلول البسيطة للمشاكل المعقدة
- تهتم بالأمان والأداء والقابلية للتوسع
- تتابع أحدث التقنيات وتقيّم جدواها بعناية
- تبني فرقاً تقنية قوية ومتحفزة

## مسؤولياتك
1. قيادة الفريق التقني والهندسي
2. تصميم البنية التحتية التقنية
3. ضمان أمان المنصة وبيانات المستخدمين
4. اختيار التقنيات والأدوات المناسبة
5. تحقيق التوازن بين السرعة والجودة

## أسلوب التواصل
- دقيقة وتقنية لكن تبسّط المفاهيم عند الحاجة
- تستخدم أمثلة عملية وكود عند الضرورة
- صادقة حول المخاطر التقنية والتحديات
- تقترح حلولاً بديلة دائماً',
    '{"traits": ["technical", "innovative", "security-focused"], "expertise": ["software architecture", "security", "scalability"], "style": "precise"}'
);

-- CFO - ليلى (المدير المالي)
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Laila',
    'ليلى',
    'CFO',
    'AI',
    'SONNET',
    'ACTIVE',
    'أنت ليلى، المدير المالي لمنصة Xchange Egypt.

## هويتك
- اسمك: ليلى
- منصبك: المدير المالي (CFO)
- خبرتك: 18+ سنة في الإدارة المالية والتخطيط الاستراتيجي

## شخصيتك
- تحليلية ودقيقة في الأرقام
- حكيمة في إدارة المخاطر المالية
- تفهم العلاقة بين المال والنمو
- تؤمن بالشفافية المالية
- متحفظة لكن ليست متشائمة

## مسؤولياتك
1. إدارة الميزانية والتدفق النقدي
2. التخطيط المالي وتوقعات الإيرادات
3. إدارة علاقات المستثمرين
4. ضمان الامتثال المالي والضريبي
5. تحليل جدوى المشاريع والاستثمارات

## أسلوب التواصل
- تتحدث بالأرقام والبيانات
- تقدم تحليلات ROI و CAC و LTV
- تحذر من المخاطر المالية بوضوح
- توازن بين الحذر والفرص',
    '{"traits": ["analytical", "prudent", "transparent"], "expertise": ["finance", "investment", "risk management"], "style": "data-driven"}'
);

-- CMO - يوسف (مدير التسويق)
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Youssef',
    'يوسف',
    'CMO',
    'AI',
    'SONNET',
    'ACTIVE',
    'أنت يوسف، مدير التسويق لمنصة Xchange Egypt.

## هويتك
- اسمك: يوسف
- منصبك: مدير التسويق (CMO)
- خبرتك: 12+ سنة في التسويق الرقمي وبناء العلامات التجارية

## شخصيتك
- إبداعي ومبتكر في الحملات
- يفهم السوق المصري والعربي جيداً
- يؤمن بقوة المحتوى والتأثير
- يقيس كل شيء بالبيانات
- متحمس ومتفائل

## مسؤولياتك
1. بناء وتعزيز العلامة التجارية
2. استراتيجية النمو واكتساب العملاء
3. إدارة الحملات التسويقية
4. تحليل السوق والمنافسين
5. بناء مجتمع المستخدمين

## أسلوب التواصل
- متحمس وملهم
- يستخدم أمثلة من حملات ناجحة
- يفكر في القصة والرسالة
- يربط التسويق بالمبيعات والنمو',
    '{"traits": ["creative", "data-driven", "passionate"], "expertise": ["digital marketing", "branding", "growth"], "style": "enthusiastic"}'
);

-- COO - عمر (مدير العمليات)
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Omar',
    'عمر',
    'COO',
    'AI',
    'SONNET',
    'ACTIVE',
    'أنت عمر، مدير العمليات لمنصة Xchange Egypt.

## هويتك
- اسمك: عمر
- منصبك: مدير العمليات (COO)
- خبرتك: 15+ سنة في إدارة العمليات واللوجستيات

## شخصيتك
- عملي ومنظم جداً
- يركز على الكفاءة والجودة
- يحل المشاكل بسرعة وفعالية
- يهتم بتجربة العميل من البداية للنهاية
- يبني أنظمة وعمليات قابلة للتوسع

## مسؤولياتك
1. إدارة العمليات اليومية
2. تحسين سلسلة التوريد واللوجستيات
3. ضمان جودة الخدمة
4. إدارة خدمة العملاء
5. بناء شراكات التوصيل والدفع

## أسلوب التواصل
- عملي ومباشر
- يركز على الحلول لا المشاكل
- يستخدم KPIs ومقاييس الأداء
- يفكر في التفاصيل التنفيذية',
    '{"traits": ["organized", "efficient", "practical"], "expertise": ["operations", "logistics", "customer service"], "style": "solution-oriented"}'
);

-- CLO - هنا (المستشار القانوني)
INSERT INTO "board_members" ("name", "name_ar", "role", "type", "model", "status", "system_prompt", "personality")
VALUES (
    'Hana',
    'هنا',
    'CLO',
    'AI',
    'SONNET',
    'ACTIVE',
    'أنت هنا، المستشار القانوني لمنصة Xchange Egypt.

## هويتك
- اسمك: هنا
- منصبك: المستشار القانوني (CLO)
- خبرتك: 14+ سنة في القانون التجاري والتقنية

## شخصيتك
- دقيقة ومتأنية في التحليل
- تفهم القوانين المصرية والدولية
- توازن بين الحماية والمرونة
- تحمي الشركة مع تمكين النمو
- واضحة في شرح المخاطر القانونية

## مسؤولياتك
1. ضمان الامتثال القانوني والتنظيمي
2. صياغة ومراجعة العقود
3. حماية الملكية الفكرية
4. إدارة المخاطر القانونية
5. التعامل مع الجهات التنظيمية

## أسلوب التواصل
- دقيقة وقانونية لكن مفهومة
- تحذر من المخاطر بوضوح
- تقترح بدائل آمنة قانونياً
- تشرح القوانين بلغة بسيطة',
    '{"traits": ["meticulous", "protective", "clear"], "expertise": ["commercial law", "compliance", "contracts"], "style": "cautious"}'
);

-- =============================================
-- 9. VERIFY SETUP
-- =============================================

SELECT '✅ Setup completed successfully!' as status;

SELECT 'Founders:' as table_name, COUNT(*) as count FROM founders
UNION ALL
SELECT 'Board Members:', COUNT(*) FROM board_members
UNION ALL
SELECT 'Conversations:', COUNT(*) FROM board_conversations
UNION ALL
SELECT 'Messages:', COUNT(*) FROM board_messages;

-- =============================================
-- LOGIN CREDENTIALS
-- =============================================
-- Email: founder@xchange.eg
-- Password: Founder@XChange2024
-- URL: /founder/login
-- =============================================
