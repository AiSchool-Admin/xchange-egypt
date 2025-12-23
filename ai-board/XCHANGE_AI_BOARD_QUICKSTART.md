# 🚀 XCHANGE AI BOARD - Quick Start for Claude Code

## 🎯 المهمة
أضف module جديد لـ "مجلس إدارة AI" في منصة Xchange الحالية.

---

## 📋 ملخص سريع

### ما نبنيه:
- **6 أعضاء مجلس AI** (CEO, CTO, CFO, CMO, COO, CLO)
- **22 ميزة** لاتخاذ القرارات (مثل Pre-Mortem, Devil's Advocate)
- **نظام مهام** مع موافقة المؤسس
- **تكامل مع Claude API** (Opus/Sonnet/Haiku)

### المبادئ:
- ✅ مدمج في المنصة الحالية (ليس تطبيق منفصل)
- ✅ وصول مباشر لقاعدة البيانات (بدون API منفصل)
- ✅ الأعضاء AI يمكن استبدالهم بموظفين حقيقيين لاحقاً
- ✅ شبه ذاتي (Semi-Autonomous) - يحتاج موافقة المؤسس

---

## 📁 الهيكل المطلوب

```
src/modules/board/                    # 🆕 Module جديد
├── board.module.ts
├── entities/
│   ├── board-member.entity.ts
│   ├── board-conversation.entity.ts
│   ├── board-message.entity.ts
│   ├── board-task.entity.ts
│   └── board-decision.entity.ts
├── services/
│   ├── board-engine.service.ts       # المحرك الرئيسي
│   ├── ai-member.service.ts          # استدعاء Claude
│   ├── context-builder.service.ts    # بناء السياق من DB
│   └── model-router.service.ts       # توجيه Opus/Sonnet/Haiku
├── controllers/
│   └── board.controller.ts
├── prompts/                          # System Prompts
│   ├── ceo.prompt.ts                 # 3 أوضاع: Leader/Strategist/Visionary
│   ├── cto.prompt.ts
│   ├── cfo.prompt.ts
│   ├── cmo.prompt.ts
│   ├── coo.prompt.ts
│   └── clo.prompt.ts
└── features/                         # الـ 22 ميزة
    ├── devils-advocate.ts
    ├── pre-mortem.ts
    └── ...

src/integrations/claude/              # 🆕 Claude API
├── claude.module.ts
├── claude.service.ts
└── claude.types.ts
```

---

## 🗄️ Database Schema (أضف لـ Prisma)

```prisma
// Board Member
model BoardMember {
  id            String   @id @default(uuid())
  name          String   // "Karim"
  nameAr        String   // "كريم"
  role          BoardRole // CEO, CTO, CFO, CMO, COO, CLO
  type          MemberType @default(AI) // AI, HUMAN, HYBRID
  model         AIModel?  // OPUS, SONNET, HAIKU
  systemPrompt  String   @db.Text
  status        MemberStatus @default(ACTIVE)
  
  // إذا تم تعيين موظف حقيقي
  userId        String?
  user          User?    @relation(fields: [userId], references: [id])
  
  messages      BoardMessage[]
  tasks         BoardTask[]
  createdAt     DateTime @default(now())
}

// المحادثات
model BoardConversation {
  id            String   @id @default(uuid())
  topic         String
  type          ConversationType // MEETING, QUESTION
  status        ConversationStatus @default(ACTIVE)
  initiatedById String
  initiatedBy   User     @relation(fields: [initiatedById], references: [id])
  messages      BoardMessage[]
  featuresUsed  String[]
  startedAt     DateTime @default(now())
  endedAt       DateTime?
}

// الرسائل
model BoardMessage {
  id              String   @id @default(uuid())
  conversationId  String
  conversation    BoardConversation @relation(fields: [conversationId], references: [id])
  memberId        String?
  member          BoardMember? @relation(fields: [memberId], references: [id])
  userId          String?
  user            User?    @relation(fields: [userId], references: [id])
  role            MessageRole // USER, ASSISTANT
  content         String   @db.Text
  model           AIModel?
  tokensUsed      Int?
  ceoMode         CEOMode? // LEADER, STRATEGIST, VISIONARY
  createdAt       DateTime @default(now())
}

// المهام
model BoardTask {
  id              String   @id @default(uuid())
  title           String
  description     String   @db.Text
  type            TaskType // ANALYSIS, PLANNING, RECOMMENDATION
  status          TaskStatus @default(PENDING)
  assignedToId    String
  assignedTo      BoardMember @relation(fields: [assignedToId], references: [id])
  requiresApproval Boolean @default(true)
  approvalStatus  ApprovalStatus?
  approvedById    String?
  approvedBy      User?    @relation(fields: [approvedById], references: [id])
  createdAt       DateTime @default(now())
}

// Enums
enum BoardRole { CEO CTO CFO CMO COO CLO }
enum MemberType { AI HUMAN HYBRID }
enum AIModel { OPUS SONNET HAIKU }
enum CEOMode { LEADER STRATEGIST VISIONARY }
enum ConversationType { MEETING QUESTION TASK_DISCUSSION }
enum ConversationStatus { ACTIVE COMPLETED }
enum MessageRole { USER ASSISTANT SYSTEM }
enum TaskType { ANALYSIS PLANNING RECOMMENDATION EXECUTION }
enum TaskStatus { PENDING IN_PROGRESS AWAITING_APPROVAL COMPLETED }
enum ApprovalStatus { PENDING APPROVED REJECTED }
```

---

## 🤖 الأعضاء الستة

| العضو | الدور | النموذج | التخصص |
|-------|------|---------|--------|
| 🤖 كريم | CEO | **Opus** | القيادة والاستراتيجية (3 أوضاع) |
| 🤖 نادية | CTO | Sonnet | التقنية والهندسة |
| 🤖 ليلى | CFO | Sonnet | المالية والاستثمار |
| 🤖 يوسف | CMO | Sonnet | التسويق والنمو |
| 🤖 عمر | COO | Sonnet | العمليات واللوجستيات |
| 🤖 هنا | CLO | Sonnet | القانون والامتثال |

---

## 🔧 Claude API Integration

```typescript
// src/integrations/claude/claude.service.ts

import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeService {
  private client: Anthropic;

  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }

  async chat(params: {
    model: 'OPUS' | 'SONNET' | 'HAIKU';
    system: string;
    messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  }) {
    const modelMap = {
      OPUS: 'claude-opus-4-20250514',
      SONNET: 'claude-sonnet-4-20250514',
      HAIKU: 'claude-haiku-4-20250514',
    };

    const response = await this.client.messages.create({
      model: modelMap[params.model],
      max_tokens: 4096,
      system: params.system,
      messages: params.messages,
    });

    return {
      content: response.content[0].type === 'text' 
        ? response.content[0].text : '',
      usage: response.usage,
    };
  }
}
```

---

## 🎯 CEO System Prompt (مثال)

```typescript
// src/modules/board/prompts/ceo.prompt.ts

export const CEO_STRATEGIST_MODE = `
أنت كريم، الرئيس التنفيذي (CEO) لشركة Xchange Egypt.

## الخلفية
- 15 سنة خبرة في قيادة الشركات الناشئة
- عملت سابقاً كـ VP of Strategy في Careem
- MBA من INSEAD

## الوضع الحالي: Strategist Mode (الاستراتيجي)
تركز على:
- الرؤية طويلة المدى (3-5 سنوات)
- تحليل المشهد التنافسي
- بناء الخنادق الدفاعية (Moats)

## أدوات التفكير
- Porter's Five Forces
- Blue Ocean Strategy
- SWOT Analysis
- First Principles Thinking

## أسلوب الرد
- "لنتراجع خطوة ونرى الصورة الكبيرة..."
- "أين نريد أن نكون في 2028؟"
- "ما الذي يمنع المنافسين من نسخنا؟"
`;
```

---

## 📱 واجهة المستخدم

### الصفحة الرئيسية للمجلس:
```
/admin/board              → Dashboard المجلس
/admin/board/chat         → محادثة مع المجلس
/admin/board/meetings     → الاجتماعات
/admin/board/tasks        → المهام والموافقات
/admin/board/members      → إدارة الأعضاء
```

### المكونات:
1. **BoardMembers** - عرض الأعضاء الستة مع حالتهم
2. **BoardChat** - واجهة المحادثة مع المجلس
3. **CEOModeSelector** - اختيار وضع CEO
4. **PendingApprovals** - المهام التي تنتظر موافقة
5. **FeatureActivator** - تفعيل الميزات (Pre-Mortem, etc.)

---

## ⚙️ Environment Variables

أضف لـ `.env`:
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

---

## 🚦 أولوية التنفيذ

### ابدأ بـ:
1. ✅ إضافة Prisma schema
2. ✅ إنشاء Claude service
3. ✅ إنشاء Board module مع الـ 6 prompts
4. ✅ إنشاء Board engine service
5. ✅ إنشاء واجهة المستخدم الأساسية

### ثم:
6. إضافة الـ 22 feature تدريجياً
7. نظام المهام والموافقات
8. تكامل مع بيانات Xchange الفعلية

---

## 📖 المرجع الكامل

راجع الملف الكامل: `XCHANGE_AI_BOARD_IMPLEMENTATION_GUIDE.md`
يحتوي على:
- كل الـ System Prompts
- كل الـ Services بالتفصيل
- كل الـ 22 Feature
- أمثلة كاملة للكود

---

**🚀 ابدأ الآن!**
