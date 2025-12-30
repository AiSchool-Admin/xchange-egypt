# 🏛️ مهمة: بناء مجلس إدارة ذاتي يدير Xchange بالكامل

## 📋 السياق
نحن نُحوّل مجلس الإدارة الذكي من نظام استشاري إلى **نظام ذاتي يدير الشركة بالكامل**.

**الفلسفة الجديدة:**
- المجلس يكتشف ويحلل ويقرر
- المؤسس يعتمد فقط (موافقة/رفض/طلب مناقشة)
- اجتماعان يومياً (10:00 ص و 2:00 م)
- مسح بيئي خارجي (الأحد والأربعاء 11:00 ص)

**راجع الملف الكامل:** `docs/ai-board/XCHANGE_AUTONOMOUS_BOARD_SYSTEM.md`

---

## 🎯 المطلوب

### 1️⃣ نظام الاستخبارات الصباحية (Morning Intelligence)

```prisma
model MorningIntelligence {
  id              String   @id @default(uuid())
  date            DateTime @default(now())
  kpiSnapshot     Json     // All KPIs with RAG status
  anomalies       Json     // [{metric, value, deviation, severity}]
  opportunities   Json     // Detected opportunities
  threats         Json     // Detected threats
  suggestedAgenda Json     // Auto-generated agenda
  processedAt     DateTime?
  meetingId       String?
  createdAt       DateTime @default(now())
}
```

**MorningIntelligenceService:**
```typescript
@Cron('0 6 * * *', { timeZone: 'Africa/Cairo' })
async generateMorningIntelligence() {
  // 1. جمع بيانات آخر 24 ساعة من Xchange
  // 2. فحص KPIs وتحديد الحالة (GREEN/YELLOW/RED)
  // 3. كشف الانحرافات (>20% = Yellow, >40% = Red)
  // 4. تحديد الفرص والتهديدات
  // 5. توليد أجندة مقترحة للاجتماع الصباحي
}
```

---

### 2️⃣ نظام الاجتماعات الذاتية

**الاجتماع الصباحي (10:00 ص - 45 دقيقة):**
```typescript
@Cron('0 10 * * *', { timeZone: 'Africa/Cairo' })
async conductMorningMeeting() {
  // 1. قراءة تقرير الاستخبارات الصباحية
  // 2. إنشاء اجتماع جديد (MOM-2025-001-AM)
  // 3. CEO كريم يقود النقاش مع الأعضاء
  // 4. كل عضو يُدلي برأيه حسب تخصصه
  // 5. التصويت على القرارات
  // 6. توليد محضر الاجتماع (MOM)
  // 7. إرسال للمؤسس للاعتماد
}
```

**الاجتماع المسائي (14:00 - 30 دقيقة):**
```typescript
@Cron('0 14 * * *', { timeZone: 'Africa/Cairo' })
async conductAfternoonMeeting() {
  // تركيز على التنفيذ والعوائق
  // إنتاج MOM-2025-001-PM
}
```

---

### 3️⃣ نظام المسح البيئي الخارجي

```prisma
model EnvironmentScan {
  id              String   @id @default(uuid())
  scanNumber      String   @unique  // SCAN-2025-W05-SUN
  scheduledAt     DateTime
  completedAt     DateTime?
  marketIntel     Json     // Market news
  regulatoryWatch Json     // Regulations
  techTrends      Json     // Technology
  economicData    Json     // Economy
  consumerTrends  Json     // Consumer behavior
  swotUpdate      Json     // Updated SWOT
  opportunityCards Json    // New opportunities
  threatAlerts    Json     // New threats
  competitiveMap  Json     // Competitive position
  createdAt       DateTime @default(now())
}
```

**EnvironmentScannerService:**
```typescript
// الأحد والأربعاء الساعة 11 صباحاً
@Cron('0 11 * * 0,3', { timeZone: 'Africa/Cairo' })
async performEnvironmentScan() {
  // استخدام web_search للبحث عن:
  // 1. أخبار السوق والمنافسين
  // 2. قوانين وتنظيمات جديدة
  // 3. تقنيات واتجاهات
  // 4. مؤشرات اقتصادية (سعر الصرف، الذهب، التضخم)
  // 5. سلوك المستهلك
  // ثم توليد تقرير SWOT محدث
}
```

---

### 4️⃣ نظام محضر الاجتماع (MOM)

```prisma
model MeetingMinutes {
  id              String   @id @default(uuid())
  momNumber       String   @unique  // MOM-2025-001-AM
  meetingId       String
  meeting         BoardMeeting @relation(fields: [meetingId], references: [id])
  
  // المحتوى
  situationSummary Json    // ملخص الوضع الراهن
  signalsDiscussed Json    // الإشارات المناقشة
  discussions      Json    // النقاشات
  
  // القرارات والمهام
  decisions        BoardDecisionSPADE[]
  actionItems      ActionItem[]
  
  // الإبداع
  ideasGenerated   Json    // الأفكار المولدة
  innovationScore  Float?  // تقييم 1-10
  
  // الاعتماد
  approvalStatus   MOMApprovalStatus @default(PENDING)
  approvedAt       DateTime?
  approverNotes    String?
  
  createdAt        DateTime @default(now())
}

enum MOMApprovalStatus {
  PENDING              // في انتظار المؤسس
  APPROVED             // معتمد بالكامل
  PARTIALLY_APPROVED   // معتمد جزئياً
  REJECTED             // مرفوض
  DISCUSSION_REQUESTED // طلب مناقشة
}
```

---

### 5️⃣ عملية الاعتماد (Approval Workflow)

```typescript
// إرسال MOM للمؤسس
async sendForApproval(mom: MeetingMinutes) {
  // 1. إنشاء إشعار للمؤسس
  // 2. SLA: 4 ساعات للقرارات التشغيلية
  // 3. SLA: لا حد زمني للقرارات الاستراتيجية (مع تذكير كل ساعة)
}

// معالجة رد المؤسس
async processFounderResponse(momId: string, response: {
  status: 'APPROVED' | 'REJECTED' | 'PARTIAL' | 'DISCUSSION';
  decisions?: { decisionId: string; approved: boolean; notes?: string }[];
  notes?: string;
}) {
  // 1. تحديث حالة MOM
  // 2. تحديث حالة كل قرار
  // 3. إذا APPROVED: تنفيذ القرارات
  // 4. إذا DISCUSSION: فتح محادثة مع المجلس
}
```

---

### 6️⃣ وضع الإبداع الأقصى (Innovation Mode)

في كل اجتماع، المجلس يُنفذ:

```typescript
async runInnovationSession(context: MeetingContext) {
  const ideas = [];
  
  // 1. سؤال الـ 10X
  const tenXIdea = await this.ceoKarim.ask(
    `كيف نُحقق 10 أضعاف ${context.currentGoal} بنفس الموارد؟`
  );
  ideas.push(tenXIdea);
  
  // 2. التلقيح المتبادل (Cross-Pollination)
  const crossIdea = await this.boardEngine.crossPollinate(
    context.currentMarket, // مثل: الموبايلات
    this.getOtherMarkets() // مثل: الذهب، السيارات
  );
  ideas.push(crossIdea);
  
  // 3. هوس العميل (Customer Obsession)
  const customerIdea = await this.analyzeRecentComplaint();
  ideas.push(customerIdea);
  
  // 4. استغلال فجوات المنافسين
  const competitorIdea = await this.exploitCompetitorGaps();
  ideas.push(competitorIdea);
  
  // حفظ الأفكار مع تقييم
  return this.saveAndRankIdeas(ideas);
}
```

---

### 7️⃣ Cron Jobs المطلوبة

```typescript
// src/modules/board/board.cron.ts

@Injectable()
export class BoardCronService {
  
  // 06:00 - تقرير الاستخبارات الصباحية
  @Cron('0 6 * * *', { timeZone: 'Africa/Cairo' })
  async morningIntelligence() { }
  
  // 10:00 - الاجتماع الصباحي الاستراتيجي
  @Cron('0 10 * * *', { timeZone: 'Africa/Cairo' })
  async morningMeeting() { }
  
  // 11:00 (الأحد والأربعاء) - المسح البيئي
  @Cron('0 11 * * 0,3', { timeZone: 'Africa/Cairo' })
  async environmentScan() { }
  
  // 14:00 - الاجتماع المسائي التشغيلي
  @Cron('0 14 * * *', { timeZone: 'Africa/Cairo' })
  async afternoonMeeting() { }
  
  // 18:00 - تقرير الإغلاق اليومي
  @Cron('0 18 * * *', { timeZone: 'Africa/Cairo' })
  async dailyClosingReport() { }
}
```

---

## 📁 هيكل الملفات الجديد

```
src/modules/board/
├── cron/
│   └── board.cron.ts                 # All scheduled jobs
├── services/
│   ├── morning-intelligence.service.ts
│   ├── environment-scanner.service.ts
│   ├── autonomous-meeting.service.ts
│   ├── mom-generator.service.ts
│   ├── approval-workflow.service.ts
│   ├── innovation-engine.service.ts
│   └── competitive-intelligence.service.ts
├── entities/
│   ├── morning-intelligence.entity.ts
│   ├── environment-scan.entity.ts
│   ├── meeting-minutes.entity.ts
│   └── innovation-idea.entity.ts
└── templates/
    ├── mom-template.ts
    └── strategic-report-template.ts
```

---

## ⚙️ ملاحظات تقنية

1. **Timezone:** كل Cron jobs تستخدم `Africa/Cairo`
2. **ترقيم:** 
   - MOM: `MOM-2025-001-AM` / `MOM-2025-001-PM`
   - SCAN: `SCAN-2025-W05-SUN` / `SCAN-2025-W05-WED`
   - IDEA: `IDEA-2025-034`
3. **Web Search:** استخدم للمسح البيئي الخارجي
4. **الإبداع:** كل اجتماع يجب أن يُنتج 3-5 أفكار جديدة على الأقل
5. **الاعتماد:** Type 2 يُنفذ تلقائياً بعد 4 ساعات بدون رد

---

## 🚀 ابدأ بـ

1. أضف Prisma schema الجديد
2. أنشئ BoardCronService مع كل الـ Cron jobs
3. أنشئ MorningIntelligenceService
4. أنشئ AutonomousMeetingService
5. أنشئ MOMGeneratorService
6. أنشئ ApprovalWorkflowService

---

**🎯 الهدف: مجلس إدارة يعمل 24/7 ويدير الشركة بذكاء، والمؤسس يوافق فقط!**
