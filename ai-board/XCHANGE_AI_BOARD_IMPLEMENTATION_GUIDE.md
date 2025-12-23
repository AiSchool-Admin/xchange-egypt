# 🏛️ XCHANGE AI BOARD - Implementation Guide for Claude Code

## 📋 PROJECT OVERVIEW

We are adding an **AI-powered Board of Directors** module to the existing Xchange e-commerce platform. This is NOT a separate application - it's integrated directly into the Xchange platform.

### Key Concepts
- **6 AI Board Members** (CEO, CTO, CFO, CMO, COO, CLO) that provide strategic advice
- **22 Decision-Making Features** based on proven frameworks
- **Direct Database Access** - no API needed, board reads from same PostgreSQL
- **Hybrid Roles** - AI members can be augmented/replaced by real humans
- **Semi-Autonomous** - prepares plans and reports, founder approves before execution

### Tech Stack (Same as Xchange Platform)
- **Backend**: Node.js / NestJS / TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Frontend**: React / Next.js (Web Admin) + React Native (Mobile)
- **AI**: Claude API (Opus/Sonnet/Haiku)

---

## 📁 FILE STRUCTURE

Add these new directories/files to the existing Xchange project:

```
src/
├── modules/
│   └── board/                          # 🆕 NEW MODULE
│       ├── board.module.ts
│       ├── entities/
│       │   ├── board-member.entity.ts
│       │   ├── board-conversation.entity.ts
│       │   ├── board-message.entity.ts
│       │   ├── board-task.entity.ts
│       │   ├── board-decision.entity.ts
│       │   └── board-output.entity.ts
│       ├── dto/
│       │   ├── create-message.dto.ts
│       │   ├── create-task.dto.ts
│       │   └── board-query.dto.ts
│       ├── services/
│       │   ├── board-engine.service.ts      # Main orchestrator
│       │   ├── ai-member.service.ts         # Claude API calls
│       │   ├── context-builder.service.ts   # Builds context from DB
│       │   ├── task-manager.service.ts      # Task queue & execution
│       │   ├── approval-gate.service.ts     # Founder approval workflow
│       │   ├── output-generator.service.ts  # Creates reports/plans
│       │   └── model-router.service.ts      # Routes to Opus/Sonnet/Haiku
│       ├── controllers/
│       │   ├── board.controller.ts
│       │   ├── meeting.controller.ts
│       │   └── task.controller.ts
│       ├── prompts/                         # System prompts for AI members
│       │   ├── index.ts
│       │   ├── ceo.prompt.ts
│       │   ├── cto.prompt.ts
│       │   ├── cfo.prompt.ts
│       │   ├── cmo.prompt.ts
│       │   ├── coo.prompt.ts
│       │   └── clo.prompt.ts
│       ├── features/                        # The 22 implemented ideas
│       │   ├── index.ts
│       │   ├── foundation/
│       │   │   ├── board-challenges-founder.ts
│       │   │   ├── reverse-board.ts
│       │   │   ├── failure-simulator.ts
│       │   │   ├── member-voting.ts
│       │   │   └── meeting-scheduler.ts
│       │   ├── thinking/
│       │   │   ├── devils-advocate.ts
│       │   │   ├── pre-mortem.ts
│       │   │   └── one-question.ts
│       │   ├── reality-voices/
│       │   │   ├── customer-who-left.ts
│       │   │   ├── competitor-who-won.ts
│       │   │   ├── investor-who-rejected.ts
│       │   │   ├── regulator-who-shut.ts
│       │   │   ├── partner-who-rejected.ts
│       │   │   └── future-killer.ts
│       │   └── soul-mirrors/
│       │       ├── inverted-decision.ts
│       │       ├── one-action.ts
│       │       └── final-confession.ts
│       └── tools/                           # AI Tools (Function Calling)
│           ├── index.ts
│           ├── xchange-data.tool.ts         # Query platform data
│           ├── web-search.tool.ts           # Search the web
│           ├── github.tool.ts               # Access codebase
│           ├── report-generator.tool.ts     # Create documents
│           └── external-apis.tool.ts        # Currency, metals, etc.
│
├── integrations/
│   └── claude/                              # 🆕 Claude API Integration
│       ├── claude.module.ts
│       ├── claude.service.ts
│       ├── claude.types.ts
│       └── claude.config.ts
│
└── common/
    └── enums/
        └── board.enum.ts                    # 🆕 Board-related enums
```

---

## 🗄️ DATABASE SCHEMA

Add these tables to your Prisma schema:

```prisma
// ============================================
// BOARD OF DIRECTORS TABLES
// ============================================

// Board Member (AI or Human)
model BoardMember {
  id              String   @id @default(uuid())
  name            String   // "Karim", "Nadia", etc.
  nameAr          String   // "كريم", "نادية"
  role            BoardRole
  type            MemberType @default(AI)
  model           AIModel?   // OPUS, SONNET, HAIKU (null if human)
  status          MemberStatus @default(ACTIVE)
  
  // If human is assigned
  userId          String?
  user            User?    @relation(fields: [userId], references: [id])
  
  // AI Assistant (kept when human is assigned)
  aiAssistantId   String?  @unique
  aiAssistant     BoardMember? @relation("HumanAIAssistant", fields: [aiAssistantId], references: [id])
  humanMember     BoardMember? @relation("HumanAIAssistant")
  
  // Personality & expertise
  systemPrompt    String   @db.Text
  personality     Json     // { traits: [], style: "", expertise: [] }
  
  // Relations
  messages        BoardMessage[]
  assignedTasks   BoardTask[]  @relation("AssignedTo")
  createdTasks    BoardTask[]  @relation("CreatedBy")
  votes           BoardVote[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Conversation/Meeting
model BoardConversation {
  id              String   @id @default(uuid())
  type            ConversationType // MEETING, QUESTION, TASK_DISCUSSION
  topic           String
  topicAr         String?
  status          ConversationStatus @default(ACTIVE)
  
  // Participants
  initiatedById   String   // Usually founder
  initiatedBy     User     @relation(fields: [initiatedById], references: [id])
  
  // Content
  messages        BoardMessage[]
  decisions       BoardDecision[]
  tasks           BoardTask[]
  
  // Features activated in this conversation
  featuresUsed    String[] // ["devils-advocate", "pre-mortem"]
  
  // Summary (generated at end)
  summary         String?  @db.Text
  summaryAr       String?  @db.Text
  
  startedAt       DateTime @default(now())
  endedAt         DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Individual Message
model BoardMessage {
  id              String   @id @default(uuid())
  conversationId  String
  conversation    BoardConversation @relation(fields: [conversationId], references: [id])
  
  // Sender (member or founder)
  memberId        String?
  member          BoardMember? @relation(fields: [memberId], references: [id])
  userId          String?      // If from founder/human
  user            User?        @relation(fields: [userId], references: [id])
  
  role            MessageRole  // USER, ASSISTANT, SYSTEM
  content         String       @db.Text
  contentAr       String?      @db.Text
  
  // AI metadata
  model           AIModel?
  tokensUsed      Int?
  toolsUsed       String[]     // Tools called during this message
  
  // CEO mode (if applicable)
  ceoMode         CEOMode?     // LEADER, STRATEGIST, VISIONARY
  
  createdAt       DateTime @default(now())
}

// Task assigned to member(s)
model BoardTask {
  id              String   @id @default(uuid())
  conversationId  String?
  conversation    BoardConversation? @relation(fields: [conversationId], references: [id])
  
  title           String
  titleAr         String?
  description     String   @db.Text
  descriptionAr   String?  @db.Text
  
  type            TaskType     // ANALYSIS, PLANNING, RECOMMENDATION, EXECUTION
  priority        TaskPriority @default(MEDIUM)
  status          TaskStatus   @default(PENDING)
  
  // Assignment
  assignedToId    String
  assignedTo      BoardMember  @relation("AssignedTo", fields: [assignedToId], references: [id])
  createdById     String
  createdBy       BoardMember  @relation("CreatedBy", fields: [createdById], references: [id])
  
  // Approval
  requiresApproval Boolean    @default(true)
  approvalStatus  ApprovalStatus?
  approvedById    String?
  approvedBy      User?        @relation(fields: [approvedById], references: [id])
  approvedAt      DateTime?
  rejectionReason String?
  
  // Output
  outputs         BoardOutput[]
  
  dueDate         DateTime?
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// Decision made by board
model BoardDecision {
  id              String   @id @default(uuid())
  conversationId  String
  conversation    BoardConversation @relation(fields: [conversationId], references: [id])
  
  topic           String
  topicAr         String?
  description     String   @db.Text
  descriptionAr   String?  @db.Text
  
  // Voting
  votes           BoardVote[]
  outcome         DecisionOutcome // APPROVED, REJECTED, DEFERRED
  
  // Founder final decision
  founderDecision DecisionOutcome?
  founderNotes    String?
  decidedAt       DateTime?
  
  createdAt       DateTime @default(now())
}

// Vote from board member
model BoardVote {
  id              String   @id @default(uuid())
  decisionId      String
  decision        BoardDecision @relation(fields: [decisionId], references: [id])
  memberId        String
  member          BoardMember @relation(fields: [memberId], references: [id])
  
  vote            VoteType     // APPROVE, REJECT, ABSTAIN
  reasoning       String       @db.Text
  reasoningAr     String?      @db.Text
  
  createdAt       DateTime @default(now())
  
  @@unique([decisionId, memberId])
}

// Output file generated
model BoardOutput {
  id              String   @id @default(uuid())
  taskId          String
  task            BoardTask @relation(fields: [taskId], references: [id])
  
  title           String
  titleAr         String?
  fileType        FileType     // PDF, DOCX, XLSX, MD, JSON
  filePath        String
  fileSize        Int?
  
  generatedById   String
  generatedBy     BoardMember  @relation(fields: [generatedById], references: [id])
  
  createdAt       DateTime @default(now())
}

// ============================================
// ENUMS
// ============================================

enum BoardRole {
  CEO
  CTO
  CFO
  CMO
  COO
  CLO
}

enum MemberType {
  AI
  HUMAN
  HYBRID  // Human with AI assistant
}

enum MemberStatus {
  ACTIVE
  INACTIVE
  ON_LEAVE
}

enum AIModel {
  OPUS
  SONNET
  HAIKU
}

enum CEOMode {
  LEADER
  STRATEGIST
  VISIONARY
}

enum ConversationType {
  MEETING
  QUESTION
  TASK_DISCUSSION
  BRAINSTORM
  REVIEW
}

enum ConversationStatus {
  ACTIVE
  COMPLETED
  ARCHIVED
}

enum MessageRole {
  USER
  ASSISTANT
  SYSTEM
}

enum TaskType {
  ANALYSIS
  PLANNING
  RECOMMENDATION
  EXECUTION
}

enum TaskPriority {
  LOW
  MEDIUM
  HIGH
  URGENT
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  AWAITING_APPROVAL
  APPROVED
  REJECTED
  COMPLETED
  CANCELLED
}

enum ApprovalStatus {
  PENDING
  APPROVED
  REJECTED
  CHANGES_REQUESTED
}

enum DecisionOutcome {
  APPROVED
  REJECTED
  DEFERRED
  NEEDS_MORE_INFO
}

enum VoteType {
  APPROVE
  REJECT
  ABSTAIN
}

enum FileType {
  PDF
  DOCX
  XLSX
  PPTX
  MD
  JSON
  CSV
}
```

---

## 🤖 SYSTEM PROMPTS FOR BOARD MEMBERS

### CEO - Karim (كريم)

```typescript
// src/modules/board/prompts/ceo.prompt.ts

export const CEO_BASE_PROMPT = `
أنت كريم، الرئيس التنفيذي (CEO) لشركة Xchange Egypt.

## الخلفية
- 15 سنة خبرة في قيادة الشركات الناشئة
- عملت سابقاً كـ VP of Strategy في Careem
- أسست شركتين ناجحتين في مصر وتم الاستحواذ عليهما
- MBA من INSEAD + بكالوريوس هندسة من AUC
- خبرة عميقة في السوق المصري والشرق الأوسط

## الشخصية
- قائد حازم لكن منصت
- تفكير استراتيجي عميق
- لا تخاف من القرارات الصعبة
- تتحدى الافتراضات دائماً
- تطلب بيانات قبل القرارات الكبيرة

## المسؤوليات
- القيادة العامة والرؤية الاستراتيجية
- اتخاذ القرارات النهائية (بموافقة المؤسس)
- حل النزاعات بين أعضاء المجلس
- التواصل مع المستثمرين والشركاء
- مراجعة أداء كل قطاع

## أسلوب التواصل
- مباشر وواضح
- تستخدم البيانات والأرقام
- تطرح أسئلة صعبة
- تلخص النقاشات بوضوح
- تتحدث بالعربية المصرية المهنية
`;

export const CEO_LEADER_MODE = `
${CEO_BASE_PROMPT}

## الوضع الحالي: Leader Mode (القائد)
في هذا الوضع، أنت تركز على:
- تحويل الاستراتيجية لخطط عمل
- توزيع المهام على الفريق
- متابعة التنفيذ والمواعيد
- حل المشكلات اليومية

## أسلوب الرد
- قرارات سريعة وواضحة
- "نحتاج أن ننفذ هذا بحلول [تاريخ]"
- "من المسؤول عن هذا؟"
- "ما العقبات؟ كيف نحلها؟"
`;

export const CEO_STRATEGIST_MODE = `
${CEO_BASE_PROMPT}

## الوضع الحالي: Strategist Mode (الاستراتيجي)
في هذا الوضع، أنت تركز على:
- الرؤية طويلة المدى (3-5 سنوات)
- تحليل المشهد التنافسي
- بناء الخنادق الدفاعية (Moats)
- تحديد الفرص والتهديدات

## أدوات التفكير
- Porter's Five Forces
- Blue Ocean Strategy
- SWOT Analysis
- First Principles Thinking

## أسلوب الرد
- "لنتراجع خطوة ونرى الصورة الكبيرة..."
- "أين نريد أن نكون في 2028؟"
- "ما الذي يمنع المنافسين من نسخنا؟"
- تحليل معمق مع frameworks واضحة
`;

export const CEO_VISIONARY_MODE = `
${CEO_BASE_PROMPT}

## الوضع الحالي: Visionary Mode (صاحب الرؤية)
في هذا الوضع، أنت تركز على:
- التفكير خارج الصندوق
- الأفكار الثورية والمجنونة
- تحدي كل الافتراضات
- تخيل المستقبل

## أدوات التفكير
- "ماذا لو...؟" (What if?)
- التفكير العكسي (Inversion)
- أسئلة الـ 10x
- استعارة نماذج من صناعات أخرى

## أسلوب الرد
- "انسَ كل ما نعرفه عن السوق..."
- "ماذا لو كان المستحيل ممكناً؟"
- "ما الذي لم يجرؤ أحد على فعله؟"
- أفكار جريئة بدون قيود
`;
```

### CTO - Nadia (نادية)

```typescript
// src/modules/board/prompts/cto.prompt.ts

export const CTO_PROMPT = `
أنت نادية، المدير التقني (CTO) لشركة Xchange Egypt.

## الخلفية
- 12 سنة خبرة في هندسة البرمجيات
- عملت سابقاً كـ Senior Engineer في Amazon MENA
- قادت فرق تقنية في 3 شركات ناشئة
- متخصصة في Scalable Systems و Microservices
- بكالوريوس وماجستير هندسة حاسبات من جامعة القاهرة

## الشخصية
- دقيقة ومنهجية
- تكره الـ "Technical Debt"
- تؤمن بالـ Testing والـ Documentation
- صريحة في تقييم الجدوى التقنية
- تحب الابتكار لكن بحذر

## المسؤوليات
- الهندسة المعمارية للمنصة
- قرارات التقنية والأدوات
- أمن المعلومات والـ Compliance
- قيادة فريق التطوير
- تقييم الجدوى التقنية للمبادرات

## أسلوب التواصل
- تقنية لكن تشرح ببساطة عند الحاجة
- "هذا ممكن تقنياً، لكن سيأخذ X أسابيع"
- "هناك Technical Debt يجب معالجته أولاً"
- تعطي تقديرات واقعية (ليست متفائلة)

## الأدوات المتاحة
- github_repo: الوصول لكود Xchange
- code_analysis: تحليل جودة الكود
- tech_search: البحث عن حلول تقنية
- performance_metrics: مقاييس الأداء

## عند مناقشة أي مبادرة
1. قيّم الجدوى التقنية
2. قدّر الوقت والموارد المطلوبة
3. حدد المخاطر التقنية
4. اقترح البدائل إن وجدت
`;
```

### CFO - Laila (ليلى)

```typescript
// src/modules/board/prompts/cfo.prompt.ts

export const CFO_PROMPT = `
أنت ليلى، المدير المالي (CFO) لشركة Xchange Egypt.

## الخلفية
- 14 سنة خبرة في التمويل والاستثمار
- عملت سابقاً كـ Investment Analyst في EFG Hermes
- خبرة في تمويل الشركات الناشئة (Venture Capital)
- CFA Charterholder
- بكالوريوس تجارة من AUC + MBA من LBS

## الشخصية
- محافظة مالياً (تحمي الشركة)
- تحب الأرقام والتحليل الدقيق
- لا تتنازل عن Unit Economics
- صارمة في الميزانيات
- تفكر دائماً في Runway والـ Cash Flow

## المسؤوليات
- الإدارة المالية والميزانيات
- العلاقة مع المستثمرين والبنوك
- التقارير المالية والتحليلات
- تقييم الجدوى الاقتصادية
- إدارة المخاطر المالية

## أسلوب التواصل
- "ما هي الـ Unit Economics لهذا؟"
- "هل يمكننا تحمل هذا مع الـ Runway الحالي؟"
- "ما الـ ROI المتوقع؟"
- أرقام وجداول وتحليلات

## الأدوات المتاحة
- xchange_financials: بيانات الإيرادات والتكاليف
- currency_rates: أسعار العملات
- financial_modeling: نماذج مالية
- spreadsheet_generator: إنشاء Excel

## عند مناقشة أي مبادرة
1. ما التكلفة الإجمالية؟
2. ما العائد المتوقع ومتى؟
3. ما تأثيرها على Cash Flow؟
4. ما المخاطر المالية؟
`;
```

### CMO - Youssef (يوسف)

```typescript
// src/modules/board/prompts/cmo.prompt.ts

export const CMO_PROMPT = `
أنت يوسف، مدير التسويق (CMO) لشركة Xchange Egypt.

## الخلفية
- 10 سنوات خبرة في التسويق الرقمي
- عمل سابقاً كـ Head of Digital Marketing في Noon Egypt
- خبرة في Growth Hacking والـ Performance Marketing
- متخصص في السوق المصري والخليجي
- بكالوريوس تجارة + دبلومة Digital Marketing من Google

## الشخصية
- مبدع ومتحمس
- يحب التجريب والـ A/B Testing
- يركز على الـ Data-Driven Decisions
- يفهم السوق المصري جيداً
- متابع لأحدث الـ Trends

## المسؤوليات
- استراتيجية التسويق والـ Brand
- إدارة الحملات الإعلانية
- Growth وCustomer Acquisition
- التواصل والـ PR
- أبحاث السوق والمنافسين

## أسلوب التواصل
- "الـ Target Audience لهذا هو..."
- "يمكننا الوصول لـ X مستخدم بميزانية Y"
- "المنافسين يفعلون كذا، نحن يجب أن..."
- أفكار إبداعية مع أرقام

## الأدوات المتاحة
- facebook_ads: بيانات حملات فيسبوك
- google_ads: بيانات حملات جوجل
- web_search: أبحاث المنافسين
- campaign_analytics: تحليلات الحملات

## عند مناقشة أي مبادرة
1. من الجمهور المستهدف؟
2. ما قنوات التسويق المناسبة؟
3. ما الميزانية المطلوبة والـ CAC المتوقع؟
4. كيف نميز أنفسنا عن المنافسين؟
`;
```

### COO - Omar (عمر)

```typescript
// src/modules/board/prompts/coo.prompt.ts

export const COO_PROMPT = `
أنت عمر، مدير العمليات (COO) لشركة Xchange Egypt.

## الخلفية
- 13 سنة خبرة في إدارة العمليات واللوجستيات
- عمل سابقاً كـ Operations Director في Talabat Egypt
- خبرة في بناء فرق العمليات من الصفر
- متخصص في Supply Chain وLast-Mile Delivery
- بكالوريوس هندسة صناعية من عين شمس + MBA

## الشخصية
- عملي ومنظم
- يركز على الـ Efficiency والـ Processes
- يحب الـ SOPs والـ Documentation
- صبور لكن حازم
- يفكر في الـ Scalability دائماً

## المسؤوليات
- العمليات اليومية والتشغيل
- اللوجستيات والتوصيل
- خدمة العملاء والدعم
- إدارة الشراكات التشغيلية
- مراقبة الجودة والأداء

## أسلوب التواصل
- "العملية الحالية هي كالتالي..."
- "نحتاج X شخص لتنفيذ هذا"
- "الـ SLA لهذا يجب أن يكون..."
- خطوات واضحة ومحددة

## الأدوات المتاحة
- xchange_operations: بيانات العمليات
- bosta_api: بيانات الشحن
- inventory_tracker: المخزون
- supplier_database: الموردين

## عند مناقشة أي مبادرة
1. ما الموارد البشرية المطلوبة؟
2. ما العمليات التي يجب بناؤها؟
3. ما الـ SLAs والمعايير؟
4. كيف نضمن الجودة؟
`;
```

### CLO - Hana (هنا)

```typescript
// src/modules/board/prompts/clo.prompt.ts

export const CLO_PROMPT = `
أنت هنا، المستشار القانوني (CLO) لشركة Xchange Egypt.

## الخلفية
- 11 سنة خبرة في القانون التجاري والتنظيمي
- عملت سابقاً كمستشار قانوني في NTRA (الجهاز القومي للاتصالات)
- متخصصة في قوانين التجارة الإلكترونية والـ Fintech
- خبرة في التعامل مع الجهات الحكومية المصرية
- ليسانس حقوق من القاهرة + ماجستير قانون تجاري

## الشخصية
- حذرة ودقيقة
- تحمي الشركة من المخاطر القانونية
- تشرح القوانين بطريقة مبسطة
- لا تتردد في قول "لا" إذا كان هناك مخاطر
- تبحث دائماً عن حلول قانونية بديلة

## المسؤوليات
- الامتثال القانوني والتنظيمي
- العقود والاتفاقيات
- حماية البيانات والخصوصية
- التراخيص والتصاريح
- التعامل مع الجهات الرقابية

## أسلوب التواصل
- "⚠️ تحذير قانوني: هذا يتطلب..."
- "يجب الحصول على ترخيص من..."
- "المخاطر القانونية هي..."
- واضحة ومحددة في التحذيرات

## الأدوات المتاحة
- web_search: البحث عن قوانين
- ntra_regulations: لوائح الاتصالات
- legal_database: قاعدة البيانات القانونية
- compliance_checker: فحص الامتثال

## عند مناقشة أي مبادرة
1. ما التراخيص المطلوبة؟
2. ما المخاطر القانونية؟
3. هل نحتاج عقود خاصة؟
4. ما متطلبات حماية البيانات؟

## القوانين الرئيسية في مصر
- قانون التجارة الإلكترونية (2020)
- قانون حماية البيانات الشخصية (2020)
- لوائح NTRA للاتصالات
- قانون حماية المستهلك
- قوانين الضرائب والجمارك
`;
```

---

## 🔧 CORE SERVICES

### Board Engine Service

```typescript
// src/modules/board/services/board-engine.service.ts

import { Injectable } from '@nestjs/common';
import { AIMemberService } from './ai-member.service';
import { ContextBuilderService } from './context-builder.service';
import { ModelRouterService } from './model-router.service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class BoardEngineService {
  constructor(
    private prisma: PrismaService,
    private aiMember: AIMemberService,
    private contextBuilder: ContextBuilderService,
    private modelRouter: ModelRouterService,
  ) {}

  /**
   * Start a new board conversation
   */
  async startConversation(params: {
    userId: string;
    topic: string;
    type: ConversationType;
    features?: string[];
  }) {
    const conversation = await this.prisma.boardConversation.create({
      data: {
        topic: params.topic,
        type: params.type,
        initiatedById: params.userId,
        featuresUsed: params.features || [],
      },
    });
    
    return conversation;
  }

  /**
   * Send message to board and get responses
   */
  async sendMessage(params: {
    conversationId: string;
    userId: string;
    content: string;
    targetMemberIds?: string[];  // Specific members to respond
    ceoMode?: CEOMode;          // If addressing CEO
    features?: string[];         // Features to activate
  }) {
    // 1. Save user message
    const userMessage = await this.prisma.boardMessage.create({
      data: {
        conversationId: params.conversationId,
        userId: params.userId,
        role: 'USER',
        content: params.content,
      },
    });

    // 2. Build context from Xchange data
    const context = await this.contextBuilder.buildContext({
      conversationId: params.conversationId,
      features: params.features,
    });

    // 3. Determine which members should respond
    const members = await this.determinRespondingMembers(params);

    // 4. Get responses from each member
    const responses = [];
    for (const member of members) {
      const response = await this.aiMember.getResponse({
        member,
        conversation: params.conversationId,
        userMessage: params.content,
        context,
        ceoMode: member.role === 'CEO' ? params.ceoMode : undefined,
        features: params.features,
      });
      
      responses.push(response);
    }

    // 5. Check if voting is needed
    if (params.features?.includes('member-voting')) {
      await this.conductVoting(params.conversationId, params.content);
    }

    return {
      userMessage,
      responses,
    };
  }

  /**
   * Activate a specific feature
   */
  async activateFeature(params: {
    conversationId: string;
    feature: string;
    input?: any;
  }) {
    // Import and execute feature
    const featureModule = await import(`../features/${params.feature}`);
    return featureModule.execute({
      conversationId: params.conversationId,
      input: params.input,
      prisma: this.prisma,
      aiMember: this.aiMember,
      contextBuilder: this.contextBuilder,
    });
  }

  /**
   * Determine which members should respond
   */
  private async determinRespondingMembers(params: {
    conversationId: string;
    targetMemberIds?: string[];
    content: string;
  }) {
    if (params.targetMemberIds?.length) {
      return this.prisma.boardMember.findMany({
        where: { id: { in: params.targetMemberIds } },
      });
    }

    // Analyze content to determine relevant members
    const content = params.content.toLowerCase();
    const relevantRoles: BoardRole[] = [];

    if (content.includes('تقني') || content.includes('كود') || content.includes('تطوير')) {
      relevantRoles.push('CTO');
    }
    if (content.includes('مالي') || content.includes('ميزانية') || content.includes('تكلفة')) {
      relevantRoles.push('CFO');
    }
    if (content.includes('تسويق') || content.includes('إعلان') || content.includes('عملاء')) {
      relevantRoles.push('CMO');
    }
    if (content.includes('عمليات') || content.includes('توصيل') || content.includes('شحن')) {
      relevantRoles.push('COO');
    }
    if (content.includes('قانون') || content.includes('ترخيص') || content.includes('تنظيم')) {
      relevantRoles.push('CLO');
    }

    // CEO always participates in strategic discussions
    if (content.includes('استراتيج') || content.includes('قرار') || relevantRoles.length === 0) {
      relevantRoles.push('CEO');
    }

    return this.prisma.boardMember.findMany({
      where: { 
        role: { in: relevantRoles },
        status: 'ACTIVE',
      },
    });
  }

  /**
   * Conduct voting among board members
   */
  private async conductVoting(conversationId: string, topic: string) {
    const members = await this.prisma.boardMember.findMany({
      where: { status: 'ACTIVE' },
    });

    const decision = await this.prisma.boardDecision.create({
      data: {
        conversationId,
        topic,
      },
    });

    for (const member of members) {
      const voteResponse = await this.aiMember.getVote({
        member,
        topic,
        conversationId,
      });

      await this.prisma.boardVote.create({
        data: {
          decisionId: decision.id,
          memberId: member.id,
          vote: voteResponse.vote,
          reasoning: voteResponse.reasoning,
        },
      });
    }

    return decision;
  }
}
```

### AI Member Service

```typescript
// src/modules/board/services/ai-member.service.ts

import { Injectable } from '@nestjs/common';
import { ClaudeService } from '../../integrations/claude/claude.service';
import { ModelRouterService } from './model-router.service';
import { 
  CEO_LEADER_MODE, 
  CEO_STRATEGIST_MODE, 
  CEO_VISIONARY_MODE 
} from '../prompts/ceo.prompt';
import { CTO_PROMPT } from '../prompts/cto.prompt';
import { CFO_PROMPT } from '../prompts/cfo.prompt';
import { CMO_PROMPT } from '../prompts/cmo.prompt';
import { COO_PROMPT } from '../prompts/coo.prompt';
import { CLO_PROMPT } from '../prompts/clo.prompt';

@Injectable()
export class AIMemberService {
  private prompts = {
    CEO: { LEADER: CEO_LEADER_MODE, STRATEGIST: CEO_STRATEGIST_MODE, VISIONARY: CEO_VISIONARY_MODE },
    CTO: CTO_PROMPT,
    CFO: CFO_PROMPT,
    CMO: CMO_PROMPT,
    COO: COO_PROMPT,
    CLO: CLO_PROMPT,
  };

  constructor(
    private claude: ClaudeService,
    private modelRouter: ModelRouterService,
  ) {}

  async getResponse(params: {
    member: BoardMember;
    conversation: string;
    userMessage: string;
    context: any;
    ceoMode?: CEOMode;
    features?: string[];
  }) {
    // 1. Get system prompt for member
    let systemPrompt: string;
    if (params.member.role === 'CEO') {
      const mode = params.ceoMode || 'LEADER';
      systemPrompt = this.prompts.CEO[mode];
    } else {
      systemPrompt = this.prompts[params.member.role];
    }

    // 2. Add feature-specific instructions
    if (params.features?.includes('devils-advocate')) {
      systemPrompt += `\n\n## وضع خاص: محامي الشيطان
في هذه المحادثة، يجب أن تعارض وتتحدى كل فكرة تُطرح.
ابحث عن نقاط الضعف والمخاطر والمشاكل المحتملة.`;
    }

    if (params.features?.includes('board-challenges-founder')) {
      systemPrompt += `\n\n## وضع خاص: تحدي المؤسس
لا توافق بسهولة. اطلب بيانات وأدلة.
اسأل أسئلة صعبة ومحرجة.
تصرف كمستثمر متشكك.`;
    }

    // 3. Build messages array
    const messages = [
      {
        role: 'user',
        content: `## السياق الحالي لـ Xchange
${JSON.stringify(params.context, null, 2)}

## رسالة المؤسس
${params.userMessage}

---
رد كـ ${params.member.nameAr} (${params.member.role}) بناءً على خبرتك ومسؤولياتك.`,
      },
    ];

    // 4. Get model based on member role
    const model = this.modelRouter.getModelForRole(params.member.role);

    // 5. Define available tools
    const tools = this.getToolsForMember(params.member.role);

    // 6. Call Claude API
    const response = await this.claude.chat({
      model,
      system: systemPrompt,
      messages,
      tools,
    });

    return {
      memberId: params.member.id,
      memberName: params.member.nameAr,
      memberRole: params.member.role,
      content: response.content,
      model,
      tokensUsed: response.usage?.total_tokens,
      toolsUsed: response.toolCalls?.map(t => t.name) || [],
    };
  }

  async getVote(params: {
    member: BoardMember;
    topic: string;
    conversationId: string;
  }) {
    const prompt = `
أنت ${params.member.nameAr}، ${params.member.role} في مجلس إدارة Xchange.

الموضوع المطروح للتصويت: ${params.topic}

يجب أن تصوت بـ:
- APPROVE (موافق)
- REJECT (رافض)  
- ABSTAIN (ممتنع)

أعطِ تصويتك مع تبرير من وجهة نظر دورك.

الرد بصيغة JSON:
{
  "vote": "APPROVE|REJECT|ABSTAIN",
  "reasoning": "التبرير بالعربية..."
}
`;

    const response = await this.claude.chat({
      model: 'SONNET',
      messages: [{ role: 'user', content: prompt }],
    });

    return JSON.parse(response.content);
  }

  private getToolsForMember(role: BoardRole) {
    const commonTools = ['xchange_data', 'web_search'];
    
    const roleTools = {
      CEO: [...commonTools, 'competitor_analysis', 'strategy_frameworks'],
      CTO: [...commonTools, 'github_repo', 'code_analysis', 'tech_search'],
      CFO: [...commonTools, 'financial_modeling', 'currency_rates', 'spreadsheet_generator'],
      CMO: [...commonTools, 'facebook_ads', 'google_ads', 'campaign_analytics'],
      COO: [...commonTools, 'bosta_api', 'inventory_tracker', 'supplier_database'],
      CLO: [...commonTools, 'legal_database', 'compliance_checker', 'ntra_regulations'],
    };

    return roleTools[role] || commonTools;
  }
}
```

### Model Router Service

```typescript
// src/modules/board/services/model-router.service.ts

import { Injectable } from '@nestjs/common';

@Injectable()
export class ModelRouterService {
  /**
   * Route to appropriate model based on role and task
   */
  getModelForRole(role: BoardRole, taskType?: string): AIModel {
    // CEO always uses Opus for strategic/visionary tasks
    if (role === 'CEO') {
      return 'OPUS';
    }

    // C-Suite uses Sonnet
    if (['CTO', 'CFO', 'CMO', 'COO', 'CLO'].includes(role)) {
      return 'SONNET';
    }

    // Default to Haiku for simple tasks
    return 'HAIKU';
  }

  /**
   * Route based on task complexity
   */
  getModelForTask(taskType: TaskType): AIModel {
    switch (taskType) {
      case 'ANALYSIS':
        return 'SONNET';  // Balanced
      case 'PLANNING':
        return 'OPUS';    // Complex
      case 'RECOMMENDATION':
        return 'SONNET';  // Balanced
      case 'EXECUTION':
        return 'HAIKU';   // Simple
      default:
        return 'SONNET';
    }
  }

  /**
   * Get model string for Claude API
   */
  getModelString(model: AIModel): string {
    switch (model) {
      case 'OPUS':
        return 'claude-opus-4-20250514';
      case 'SONNET':
        return 'claude-sonnet-4-20250514';
      case 'HAIKU':
        return 'claude-haiku-4-20250514';
      default:
        return 'claude-sonnet-4-20250514';
    }
  }
}
```

---

## 🛠️ CLAUDE API INTEGRATION

```typescript
// src/integrations/claude/claude.service.ts

import { Injectable } from '@nestjs/common';
import Anthropic from '@anthropic-ai/sdk';
import { ModelRouterService } from '../../modules/board/services/model-router.service';

@Injectable()
export class ClaudeService {
  private client: Anthropic;

  constructor(private modelRouter: ModelRouterService) {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async chat(params: {
    model: AIModel;
    system?: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
    tools?: string[];
    maxTokens?: number;
  }) {
    const modelString = this.modelRouter.getModelString(params.model);
    
    // Convert tool names to tool definitions
    const toolDefinitions = params.tools?.map(t => this.getToolDefinition(t));

    const response = await this.client.messages.create({
      model: modelString,
      max_tokens: params.maxTokens || 4096,
      system: params.system,
      messages: params.messages,
      tools: toolDefinitions,
    });

    // Handle tool calls if any
    if (response.stop_reason === 'tool_use') {
      return this.handleToolCalls(response, params);
    }

    return {
      content: response.content[0].type === 'text' ? response.content[0].text : '',
      usage: response.usage,
      toolCalls: [],
    };
  }

  private async handleToolCalls(response: any, originalParams: any) {
    const toolCalls = response.content.filter(c => c.type === 'tool_use');
    const toolResults = [];

    for (const toolCall of toolCalls) {
      const result = await this.executeToolCall(toolCall.name, toolCall.input);
      toolResults.push({
        type: 'tool_result',
        tool_use_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    // Continue conversation with tool results
    const continueResponse = await this.client.messages.create({
      model: this.modelRouter.getModelString(originalParams.model),
      max_tokens: originalParams.maxTokens || 4096,
      system: originalParams.system,
      messages: [
        ...originalParams.messages,
        { role: 'assistant', content: response.content },
        { role: 'user', content: toolResults },
      ],
    });

    return {
      content: continueResponse.content[0].type === 'text' 
        ? continueResponse.content[0].text : '',
      usage: continueResponse.usage,
      toolCalls: toolCalls.map(t => ({ name: t.name, input: t.input })),
    };
  }

  private getToolDefinition(toolName: string) {
    const tools = {
      xchange_data: {
        name: 'xchange_data',
        description: 'Query Xchange platform data (revenue, users, markets, etc.)',
        input_schema: {
          type: 'object',
          properties: {
            dataType: { 
              type: 'string', 
              enum: ['revenue', 'users', 'markets', 'transactions', 'complaints'] 
            },
            period: { type: 'string', enum: ['daily', 'weekly', 'monthly', 'yearly'] },
            market: { type: 'string' },
          },
          required: ['dataType'],
        },
      },
      web_search: {
        name: 'web_search',
        description: 'Search the web for current information',
        input_schema: {
          type: 'object',
          properties: {
            query: { type: 'string', description: 'Search query' },
          },
          required: ['query'],
        },
      },
      github_repo: {
        name: 'github_repo',
        description: 'Access Xchange codebase on GitHub',
        input_schema: {
          type: 'object',
          properties: {
            action: { type: 'string', enum: ['list_files', 'read_file', 'search_code'] },
            path: { type: 'string' },
            query: { type: 'string' },
          },
          required: ['action'],
        },
      },
      // Add more tool definitions...
    };

    return tools[toolName];
  }

  private async executeToolCall(toolName: string, input: any) {
    // Import and execute tool
    const toolModule = await import(`../../modules/board/tools/${toolName}.tool`);
    return toolModule.execute(input);
  }
}
```

---

## 🎨 FRONTEND COMPONENTS

### Board Dashboard Page

```typescript
// src/pages/admin/board/index.tsx (or appropriate location)

import React, { useState } from 'react';
import { BoardMembers } from '@/components/board/BoardMembers';
import { BoardChat } from '@/components/board/BoardChat';
import { PendingApprovals } from '@/components/board/PendingApprovals';
import { BoardMeetings } from '@/components/board/BoardMeetings';

export default function BoardDashboard() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [ceoMode, setCeoMode] = useState<'LEADER' | 'STRATEGIST' | 'VISIONARY'>('LEADER');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            🏛️ مجلس إدارة Xchange
          </h1>
          <p className="text-gray-500">إدارة استراتيجية مدعومة بالذكاء الاصطناعي</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-12 gap-6">
          
          {/* Board Members Panel */}
          <div className="col-span-3">
            <BoardMembers 
              onMemberClick={(member) => {/* Start conversation */}}
              onCeoModeChange={setCeoMode}
              currentCeoMode={ceoMode}
            />
          </div>

          {/* Main Chat Area */}
          <div className="col-span-6">
            <BoardChat 
              conversationId={activeConversation}
              ceoMode={ceoMode}
            />
          </div>

          {/* Right Sidebar */}
          <div className="col-span-3 space-y-6">
            <PendingApprovals />
            <BoardMeetings />
          </div>

        </div>
      </main>
    </div>
  );
}
```

### Board Members Component

```typescript
// src/components/board/BoardMembers.tsx

import React from 'react';

interface BoardMember {
  id: string;
  name: string;
  nameAr: string;
  role: string;
  type: 'AI' | 'HUMAN' | 'HYBRID';
  status: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
}

export function BoardMembers({ 
  onMemberClick, 
  onCeoModeChange,
  currentCeoMode 
}) {
  const members: BoardMember[] = [
    { id: '1', name: 'Karim', nameAr: 'كريم', role: 'CEO', type: 'AI', status: 'ACTIVE' },
    { id: '2', name: 'Nadia', nameAr: 'نادية', role: 'CTO', type: 'AI', status: 'ACTIVE' },
    { id: '3', name: 'Laila', nameAr: 'ليلى', role: 'CFO', type: 'AI', status: 'ACTIVE' },
    { id: '4', name: 'Youssef', nameAr: 'يوسف', role: 'CMO', type: 'AI', status: 'ACTIVE' },
    { id: '5', name: 'Omar', nameAr: 'عمر', role: 'COO', type: 'AI', status: 'ACTIVE' },
    { id: '6', name: 'Hana', nameAr: 'هنا', role: 'CLO', type: 'AI', status: 'ACTIVE' },
  ];

  const roleColors = {
    CEO: 'bg-purple-100 border-purple-500 text-purple-700',
    CTO: 'bg-blue-100 border-blue-500 text-blue-700',
    CFO: 'bg-green-100 border-green-500 text-green-700',
    CMO: 'bg-orange-100 border-orange-500 text-orange-700',
    COO: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    CLO: 'bg-red-100 border-red-500 text-red-700',
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h2 className="text-lg font-semibold mb-4 text-right">👥 أعضاء المجلس</h2>
      
      <div className="space-y-3">
        {members.map((member) => (
          <div
            key={member.id}
            onClick={() => onMemberClick(member)}
            className={`p-3 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${roleColors[member.role]}`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">{member.role}</span>
              <span className="text-lg">
                {member.type === 'AI' ? '🤖' : member.type === 'HYBRID' ? '👤🤖' : '👤'}
              </span>
            </div>
            <div className="text-right mt-1">
              <p className="font-bold">{member.nameAr}</p>
              <p className="text-xs opacity-75">{member.name}</p>
            </div>
            
            {/* CEO Mode Selector */}
            {member.role === 'CEO' && (
              <div className="mt-2 flex gap-1">
                {['LEADER', 'STRATEGIST', 'VISIONARY'].map((mode) => (
                  <button
                    key={mode}
                    onClick={(e) => {
                      e.stopPropagation();
                      onCeoModeChange(mode);
                    }}
                    className={`text-xs px-2 py-1 rounded ${
                      currentCeoMode === mode 
                        ? 'bg-purple-600 text-white' 
                        : 'bg-purple-200 text-purple-700'
                    }`}
                  >
                    {mode === 'LEADER' ? 'قائد' : mode === 'STRATEGIST' ? 'استراتيجي' : 'رؤيوي'}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Assign Human Button */}
      <button className="w-full mt-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600">
        + تعيين موظف حقيقي
      </button>
    </div>
  );
}
```

---

## 📋 IMPLEMENTED FEATURES (22 Ideas)

Each feature should be in its own file under `src/modules/board/features/`:

### Example: Pre-Mortem Feature

```typescript
// src/modules/board/features/thinking/pre-mortem.ts

import { Injectable } from '@nestjs/common';

export interface PreMortemInput {
  decision: string;
  conversationId: string;
}

export interface PreMortemOutput {
  failureScenarios: Array<{
    scenario: string;
    probability: number;
    impact: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    prevention: string;
  }>;
  overallRisk: number;
  recommendation: string;
}

export async function execute(params: {
  conversationId: string;
  input: PreMortemInput;
  prisma: any;
  aiMember: any;
  contextBuilder: any;
}): Promise<PreMortemOutput> {
  const prompt = `
أنت محلل مخاطر متخصص. مهمتك هي كتابة "تقرير ما بعد الفشل" (Pre-Mortem) قبل اتخاذ القرار.

## القرار المقترح
${params.input.decision}

## المطلوب
تخيل أننا في المستقبل بعد سنة، وهذا القرار فشل فشلاً ذريعاً.
اكتب تقريراً يشرح:

1. 10 سيناريوهات مختلفة للفشل
2. احتمالية كل سيناريو (0-100%)
3. تأثير كل سيناريو (LOW/MEDIUM/HIGH/CRITICAL)
4. كيف نمنع كل سيناريو

## صيغة الرد (JSON)
{
  "failureScenarios": [
    {
      "scenario": "وصف السيناريو",
      "probability": 30,
      "impact": "HIGH",
      "prevention": "كيف نمنعه"
    }
  ],
  "overallRisk": 45,
  "recommendation": "التوصية النهائية"
}
`;

  const response = await params.aiMember.claude.chat({
    model: 'SONNET',
    messages: [{ role: 'user', content: prompt }],
  });

  const result = JSON.parse(response.content);

  // Save to conversation
  await params.prisma.boardMessage.create({
    data: {
      conversationId: params.conversationId,
      role: 'ASSISTANT',
      content: `## 💀 تحليل Pre-Mortem

### سيناريوهات الفشل المحتملة:
${result.failureScenarios.map((s, i) => `
${i + 1}. **${s.scenario}**
   - الاحتمالية: ${s.probability}%
   - التأثير: ${s.impact}
   - الوقاية: ${s.prevention}
`).join('\n')}

### مستوى المخاطر الإجمالي: ${result.overallRisk}%

### التوصية:
${result.recommendation}`,
      toolsUsed: ['pre-mortem'],
    },
  });

  return result;
}
```

---

## 🔐 ENVIRONMENT VARIABLES

Add these to your `.env`:

```env
# Claude API
ANTHROPIC_API_KEY=sk-ant-api03-...

# Model Configuration
CLAUDE_OPUS_MODEL=claude-opus-4-20250514
CLAUDE_SONNET_MODEL=claude-sonnet-4-20250514
CLAUDE_HAIKU_MODEL=claude-haiku-4-20250514

# External APIs (optional, add as needed)
GITHUB_TOKEN=ghp_...
GOOGLE_DRIVE_API_KEY=...
FACEBOOK_ADS_TOKEN=...
METALS_API_KEY=...
```

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Foundation
1. ✅ Database schema (Prisma migrations)
2. ✅ Claude integration service
3. ✅ Board members with prompts
4. ✅ Basic board engine
5. ✅ Simple chat UI

### Phase 2: Features
1. ✅ Implement 10 Foundation ideas
2. ✅ Implement 3 Thinking ideas
3. ✅ Implement 6 Reality Voices
4. ✅ Implement 3 Soul Mirrors
5. ✅ Feature activation UI

### Phase 3: Advanced
1. ✅ Task management system
2. ✅ Approval workflow
3. ✅ Output generation (PDF, DOCX, XLSX)
4. ✅ External API integrations
5. ✅ Deep Research feature

### Phase 4: Polish
1. ✅ Human role assignment
2. ✅ AI Assistant mode
3. ✅ Meeting scheduler
4. ✅ Notifications
5. ✅ Mobile UI

---

## 📝 NOTES FOR CLAUDE CODE

1. **Integration with existing Xchange**: This module should integrate seamlessly with existing user authentication, database, and API structure.

2. **Arabic Support**: All user-facing text should support Arabic (RTL). System prompts and responses are in Arabic.

3. **Model Cost Optimization**: Use Haiku for simple tasks, Sonnet for most work, Opus only for CEO strategic decisions.

4. **Error Handling**: Gracefully handle Claude API errors, rate limits, and timeouts.

5. **Testing**: Write tests for critical paths (board engine, approval workflow, Claude integration).

---

**Ready to build! 🚀**
