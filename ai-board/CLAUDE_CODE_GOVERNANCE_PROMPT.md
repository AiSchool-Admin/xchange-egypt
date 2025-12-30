# 🏛️ مهمة: بناء أفضل مجلس إدارة ذكي لشركة ناشئة في العالم

## 📋 السياق
نحن نبني نظام مجلس إدارة مدعوم بالذكاء الاصطناعي لـ Xchange Egypt - منصة تجارة إلكترونية متعددة الأسواق.

المجلس يتكون من 6 أعضاء AI (CEO, CTO, CFO, CMO, COO, CLO) يقدمون استشارات استراتيجية للمؤسس.

**راجع الملفات التالية للتفاصيل الكاملة:**
- `docs/ai-board/XCHANGE_AI_BOARD_QUICKSTART.md`
- `docs/ai-board/XCHANGE_AI_BOARD_IMPLEMENTATION_GUIDE.md`
- `docs/ai-board/XCHANGE_BOARD_GOVERNANCE_SYSTEM.md`

---

## 🎯 المطلوب في هذه المرحلة: نظام الحوكمة المتكامل

### 1️⃣ نظام الاجتماعات الذكي

**أ) Database Schema - أضف الجداول التالية:**

```prisma
// أنواع الاجتماعات
enum MeetingType {
  STANDUP      // يومي 15 دقيقة
  WEEKLY       // أسبوعي 60 دقيقة
  MONTHLY      // شهري 2-3 ساعات
  QUARTERLY    // ربع سنوي 3 ساعات
  EMERGENCY    // طوارئ (يُطلق من التنبيهات)
  OPPORTUNITY  // فرص (يُطلق من مؤشرات إيجابية)
}

enum MeetingStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// جدول الاجتماعات
model BoardMeeting {
  id              String   @id @default(uuid())
  meetingNumber   String   @unique  // مثل: STD-2025-001
  type            MeetingType
  status          MeetingStatus @default(SCHEDULED)
  
  // الجدولة
  scheduledAt     DateTime
  startedAt       DateTime?
  endedAt         DateTime?
  durationMinutes Int?
  
  // الأجندة
  agenda          Json?    // قالب الأجندة
  
  // المشاركون
  participantIds  String[]
  founderPresent  Boolean @default(true)
  
  // المحادثة
  conversationId  String?
  conversation    BoardConversation? @relation(fields: [conversationId], references: [id])
  
  // النتائج
  decisions       BoardDecision[]
  actionItems     ActionItem[]
  
  // التنبيه (للاجتماعات الطارئة)
  triggeredByAlert String?
  triggerReason    String?
  
  // الملخص
  summary         String?  @db.Text
  summaryAr       String?  @db.Text
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

// جدول المهام
model ActionItem {
  id              String   @id @default(uuid())
  meetingId       String
  meeting         BoardMeeting @relation(fields: [meetingId], references: [id])
  
  title           String
  titleAr         String?
  description     String?  @db.Text
  
  // التكليف
  assignedToId    String
  assignedTo      BoardMember @relation(fields: [assignedToId], references: [id])
  
  // المواعيد
  deadline        DateTime
  completedAt     DateTime?
  
  // الحالة
  status          ActionStatus @default(PENDING)
  progressNotes   String?
  
  // المتابعة
  followUpDate    DateTime?
  carryForward    Boolean @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum ActionStatus {
  PENDING
  IN_PROGRESS
  BLOCKED
  COMPLETED
  OVERDUE
  CANCELLED
}

// جدول KPIs
model KPIMetric {
  id              String   @id @default(uuid())
  name            String
  nameAr          String
  category        KPICategory
  
  // القياس
  currentValue    Float
  targetValue     Float
  previousValue   Float?
  
  // العتبات
  yellowThreshold Float?
  redThreshold    Float?
  
  // الحالة
  status          KPIStatus @default(GREEN)
  
  // المسؤول
  ownerRole       BoardRole
  
  // التتبع
  frequency       String   // DAILY, WEEKLY, MONTHLY
  lastUpdated     DateTime
  
  // التنبيهات
  alertOnYellow   Boolean @default(true)
  alertOnRed      Boolean @default(true)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum KPICategory {
  FINANCIAL
  CUSTOMER
  OPERATIONS
  TEAM
}

enum KPIStatus {
  GREEN
  YELLOW
  RED
}

// جدول التنبيهات
model BoardAlert {
  id              String   @id @default(uuid())
  
  type            AlertType
  priority        AlertPriority
  
  // التفاصيل
  title           String
  titleAr         String
  description     String
  descriptionAr   String?
  
  // المصدر
  metricId        String?
  metricValue     Float?
  threshold       Float?
  
  // الإجراء
  action          AlertAction
  triggeredMeetingId String?
  
  // الإشعارات
  notifiedRoles   String[]
  acknowledgedBy  String?
  acknowledgedAt  DateTime?
  
  // الحالة
  status          AlertStatus @default(ACTIVE)
  resolvedAt      DateTime?
  resolution      String?
  
  createdAt       DateTime @default(now())
}

enum AlertType {
  RISK
  OPPORTUNITY
}

enum AlertPriority {
  CRITICAL
  HIGH
  MEDIUM
  LOW
}

enum AlertAction {
  EMERGENCY_MEETING
  ADD_TO_AGENDA
  NOTIFY_EXECUTIVE
  LOG_ONLY
}

enum AlertStatus {
  ACTIVE
  ACKNOWLEDGED
  RESOLVED
  DISMISSED
}
```

**ب) خدمة جدولة الاجتماعات:**

```typescript
// src/modules/board/services/meeting-scheduler.service.ts

@Injectable()
export class MeetingSchedulerService {
  
  // توليد رقم الاجتماع التسلسلي
  async generateMeetingNumber(type: MeetingType): Promise<string> {
    const year = new Date().getFullYear();
    const prefix = this.getMeetingPrefix(type);
    const count = await this.prisma.boardMeeting.count({
      where: {
        type,
        createdAt: {
          gte: new Date(`${year}-01-01`),
          lt: new Date(`${year + 1}-01-01`)
        }
      }
    });
    return `${prefix}-${year}-${String(count + 1).padStart(3, '0')}`;
  }
  
  private getMeetingPrefix(type: MeetingType): string {
    const prefixes = {
      STANDUP: 'STD',
      WEEKLY: 'WKY', 
      MONTHLY: 'MTH',
      QUARTERLY: 'QTR',
      EMERGENCY: 'EMR',
      OPPORTUNITY: 'OPP'
    };
    return prefixes[type];
  }
  
  // جدولة اجتماعات السنة
  async scheduleYearlyMeetings(year: number) {
    // يومي (الأحد - الخميس)
    // أسبوعي (كل أحد)
    // شهري (أول أحد من كل شهر)
    // ربع سنوي (نهاية كل ربع)
  }
  
  // إطلاق اجتماع طوارئ
  async triggerEmergencyMeeting(alert: BoardAlert) {
    const meetingNumber = await this.generateMeetingNumber('EMERGENCY');
    const meeting = await this.prisma.boardMeeting.create({
      data: {
        meetingNumber,
        type: 'EMERGENCY',
        status: 'SCHEDULED',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // خلال 24 ساعة
        triggeredByAlert: alert.id,
        triggerReason: alert.description
      }
    });
    return meeting;
  }
}
```

**ج) قوالب الأجندات:**

```typescript
// src/modules/board/templates/agenda-templates.ts

export const AGENDA_TEMPLATES = {
  
  // يومي - 15 دقيقة
  STANDUP: {
    duration: 15,
    items: [
      { title: 'العوائق والتصعيدات', titleEn: 'Blockers', minutes: 5 },
      { title: 'إنجازات الأمس', titleEn: 'Yesterday', minutes: 5 },
      { title: 'أولويات اليوم', titleEn: 'Today', minutes: 5 }
    ]
  },
  
  // أسبوعي - 60 دقيقة
  WEEKLY: {
    duration: 60,
    items: [
      { title: 'مراجعة المهام السابقة', titleEn: 'Action Review', minutes: 5 },
      { title: 'مراجعة KPIs', titleEn: 'KPI Dashboard', minutes: 15 },
      { title: 'تحديثات المديرين', titleEn: 'Executive Updates', minutes: 20 },
      { title: 'القرارات المطلوبة', titleEn: 'Decisions', minutes: 15 },
      { title: 'مهام جديدة', titleEn: 'New Actions', minutes: 5 }
    ]
  },
  
  // شهري - 150 دقيقة
  MONTHLY: {
    duration: 150,
    items: [
      { title: 'التقييم الاستراتيجي', titleEn: 'CEO Assessment', minutes: 20 },
      { title: 'موضوع للتعمق', titleEn: 'Deep Dive', minutes: 45 },
      { title: 'المراجعة المالية', titleEn: 'Financial Review', minutes: 20 },
      { title: 'الموارد والفريق', titleEn: 'Resources', minutes: 20 },
      { title: 'اتخاذ القرارات', titleEn: 'Decisions', minutes: 30 },
      { title: 'المهام والختام', titleEn: 'Actions & Close', minutes: 15 }
    ]
  },
  
  // ربع سنوي - 180 دقيقة
  QUARTERLY: {
    duration: 180,
    items: [
      { title: 'الصورة الكبيرة', titleEn: 'Big Picture', minutes: 15 },
      { title: 'المعايرة', titleEn: 'Calibration', minutes: 60 },
      { title: 'بناء الشركة', titleEn: 'Company Building', minutes: 30 },
      { title: 'التعمق الاستراتيجي', titleEn: 'Deep Dives', minutes: 60 },
      { title: 'الجلسة المغلقة', titleEn: 'Closed Session', minutes: 15 }
    ]
  }
};

// مواضيع التعمق الشهرية للسنة الأولى
export const MONTHLY_DEEP_DIVE_TOPICS = {
  1: 'Product-Market Fit Validation',
  2: 'Product-Market Fit Validation',
  3: 'Go-to-Market Strategy',
  4: 'Go-to-Market Strategy',
  5: 'Unit Economics & Pricing',
  6: 'Unit Economics & Pricing',
  7: 'Competitive Positioning',
  8: 'Competitive Positioning',
  9: 'Scaling Operations',
  10: 'Scaling Operations',
  11: 'Fundraising Strategy',
  12: 'Fundraising Strategy'
};
```

---

### 2️⃣ نظام KPIs والتنبيهات

**أ) تكوين KPIs:**

```typescript
// src/modules/board/config/kpis.config.ts

export const COMPANY_KPIS = [
  // مالية
  {
    name: 'GMV Growth',
    nameAr: 'نمو إجمالي قيمة البضائع',
    category: 'FINANCIAL',
    target: 20,
    yellowThreshold: 10,
    redThreshold: 5,
    frequency: 'MONTHLY',
    ownerRole: 'CEO',
    alertOnRed: true,
    triggerEmergency: false
  },
  {
    name: 'Runway Months',
    nameAr: 'المدرج بالأشهر',
    category: 'FINANCIAL',
    target: 18,
    yellowThreshold: 12,
    redThreshold: 6,
    frequency: 'MONTHLY',
    ownerRole: 'CFO',
    alertOnRed: true,
    triggerEmergency: true // 🚨 اجتماع طوارئ
  },
  {
    name: 'LTV:CAC Ratio',
    nameAr: 'نسبة القيمة للتكلفة',
    category: 'FINANCIAL',
    target: 3,
    yellowThreshold: 2.5,
    redThreshold: 2,
    frequency: 'MONTHLY',
    ownerRole: 'CFO',
    alertOnRed: true,
    triggerEmergency: false
  },
  
  // العملاء
  {
    name: 'NPS Score',
    nameAr: 'صافي نقاط الترويج',
    category: 'CUSTOMER',
    target: 50,
    yellowThreshold: 30,
    redThreshold: 0,
    frequency: 'MONTHLY',
    ownerRole: 'CMO',
    alertOnRed: true,
    triggerEmergency: false
  },
  {
    name: 'Monthly Churn',
    nameAr: 'معدل فقدان العملاء',
    category: 'CUSTOMER',
    target: 3,
    yellowThreshold: 5,
    redThreshold: 10,
    frequency: 'MONTHLY',
    ownerRole: 'CMO',
    alertOnRed: true,
    triggerEmergency: false
  },
  
  // العمليات
  {
    name: 'System Uptime',
    nameAr: 'وقت تشغيل النظام',
    category: 'OPERATIONS',
    target: 99.9,
    yellowThreshold: 99.5,
    redThreshold: 99,
    frequency: 'DAILY',
    ownerRole: 'CTO',
    alertOnRed: true,
    triggerEmergency: true // 🚨 اجتماع طوارئ
  },
  {
    name: 'On-Time Delivery',
    nameAr: 'التوصيل في الوقت',
    category: 'OPERATIONS',
    target: 95,
    yellowThreshold: 92,
    redThreshold: 85,
    frequency: 'WEEKLY',
    ownerRole: 'COO',
    alertOnRed: true,
    triggerEmergency: false
  }
];

// KPIs لكل مدير
export const EXECUTIVE_KPIS = {
  CEO: ['Revenue vs Plan', 'OKR Achievement', 'PMF Score'],
  CTO: ['Release Frequency', 'Uptime', 'MTTR', 'Code Coverage'],
  CFO: ['Runway', 'Budget Variance', 'CAC Payback'],
  CMO: ['CAC', 'Conversion Rate', 'ROAS', 'Repeat Purchase'],
  COO: ['On-Time Delivery', 'Fulfillment Accuracy', 'Support Response'],
  CLO: ['Compliance Rate', 'Contract Turnaround', 'Legal Spend']
};
```

**ب) خدمة التنبيهات:**

```typescript
// src/modules/board/services/alert-engine.service.ts

@Injectable()
export class AlertEngineService {
  
  // فحص KPI وإنشاء تنبيه إذا لزم
  async checkKPIAndAlert(kpi: KPIMetric) {
    let alertPriority: AlertPriority | null = null;
    let alertAction: AlertAction = 'LOG_ONLY';
    
    if (kpi.currentValue <= kpi.redThreshold) {
      alertPriority = 'CRITICAL';
      alertAction = kpi.triggerEmergency ? 'EMERGENCY_MEETING' : 'ADD_TO_AGENDA';
    } else if (kpi.currentValue <= kpi.yellowThreshold) {
      alertPriority = 'HIGH';
      alertAction = 'ADD_TO_AGENDA';
    }
    
    if (alertPriority && kpi.alertOnRed) {
      const alert = await this.createAlert({
        type: 'RISK',
        priority: alertPriority,
        title: `⚠️ ${kpi.name} Below Target`,
        titleAr: `⚠️ ${kpi.nameAr} أقل من الهدف`,
        description: `${kpi.name} at ${kpi.currentValue}, threshold: ${kpi.redThreshold}`,
        metricId: kpi.id,
        metricValue: kpi.currentValue,
        threshold: kpi.redThreshold,
        action: alertAction,
        notifiedRoles: [kpi.ownerRole, 'CEO']
      });
      
      // إطلاق اجتماع طوارئ إذا لزم
      if (alertAction === 'EMERGENCY_MEETING') {
        await this.meetingScheduler.triggerEmergencyMeeting(alert);
      }
      
      return alert;
    }
    
    return null;
  }
  
  // فحص فرصة
  async checkOpportunityAlert(metric: string, value: number, threshold: number) {
    if (value >= threshold) {
      return this.createAlert({
        type: 'OPPORTUNITY',
        priority: 'HIGH',
        title: `🚀 Opportunity: ${metric} Exceptional`,
        titleAr: `🚀 فرصة: ${metric} استثنائي`,
        description: `${metric} at ${value}, above threshold ${threshold}`,
        action: 'ADD_TO_AGENDA',
        notifiedRoles: ['CEO', 'CFO']
      });
    }
    return null;
  }
}
```

---

### 3️⃣ إطار القرارات SPADE

**أ) Schema للقرارات:**

```prisma
model BoardDecisionSPADE {
  id              String   @id @default(uuid())
  decisionNumber  String   @unique  // DEC-2025-001
  conversationId  String
  conversation    BoardConversation @relation(fields: [conversationId], references: [id])
  meetingId       String?
  meeting         BoardMeeting? @relation(fields: [meetingId], references: [id])
  
  // S - Setting
  question        String   // ما القرار المطلوب؟
  questionAr      String?
  deadline        DateTime
  importance      DecisionType // TYPE1 أو TYPE2
  context         String?  @db.Text
  
  // P - People
  responsibleId   String   // من يقود التحليل
  accountableId   String   // من يتخذ القرار النهائي
  consultedIds    String[] // من يُستشار
  informedIds     String[] // من يُبلَّغ
  
  // A - Alternatives
  alternatives    Json     // [{option, pros, cons, risks, impact}]
  
  // D - Decide
  selectedOption  String?
  rationale       String?  @db.Text
  rationaleAr     String?  @db.Text
  votes           BoardVote[]
  dissent         String?  // اعتراضات مسجلة
  
  // E - Explain
  summary         String?  @db.Text
  summaryAr       String?  @db.Text
  communicationPlan String?
  
  // الحالة
  status          SPADEStatus @default(SETTING)
  decidedAt       DateTime?
  implementedAt   DateTime?
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum DecisionType {
  TYPE1  // لا رجعة - يحتاج تصويت كامل
  TYPE2  // يمكن التراجع - يُفوض
}

enum SPADEStatus {
  SETTING
  ANALYZING
  DECIDING
  DECIDED
  COMMUNICATING
  IMPLEMENTED
}
```

**ب) خدمة القرارات:**

```typescript
// src/modules/board/services/decision-framework.service.ts

@Injectable()
export class DecisionFrameworkService {
  
  // بدء قرار جديد
  async initiateSPADE(params: {
    question: string;
    questionAr: string;
    deadline: Date;
    importance: 'TYPE1' | 'TYPE2';
    responsibleId: string;
    conversationId: string;
  }) {
    const decisionNumber = await this.generateDecisionNumber();
    
    return this.prisma.boardDecisionSPADE.create({
      data: {
        decisionNumber,
        ...params,
        accountableId: params.importance === 'TYPE1' ? 'FOUNDER' : params.responsibleId,
        status: 'SETTING'
      }
    });
  }
  
  // إضافة بديل
  async addAlternative(decisionId: string, alternative: {
    option: string;
    optionAr: string;
    pros: string[];
    cons: string[];
    risks: string[];
    estimatedImpact: string;
  }) {
    const decision = await this.prisma.boardDecisionSPADE.findUnique({
      where: { id: decisionId }
    });
    
    const alternatives = [...(decision.alternatives as any[] || []), alternative];
    
    return this.prisma.boardDecisionSPADE.update({
      where: { id: decisionId },
      data: { alternatives, status: 'ANALYZING' }
    });
  }
  
  // اتخاذ القرار
  async makeDecision(decisionId: string, params: {
    selectedOption: string;
    rationale: string;
    rationaleAr: string;
  }) {
    return this.prisma.boardDecisionSPADE.update({
      where: { id: decisionId },
      data: {
        ...params,
        status: 'DECIDED',
        decidedAt: new Date()
      }
    });
  }
  
  // توليد رقم القرار
  private async generateDecisionNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.boardDecisionSPADE.count({
      where: {
        createdAt: {
          gte: new Date(`${year}-01-01`)
        }
      }
    });
    return `DEC-${year}-${String(count + 1).padStart(3, '0')}`;
  }
}
```

---

### 4️⃣ واجهة المستخدم

**أ) صفحة تقويم الاجتماعات:**
- عرض شهري/أسبوعي
- ألوان مختلفة لكل نوع اجتماع
- اجتماعات الطوارئ باللون الأحمر
- النقر لعرض/بدء الاجتماع

**ب) واجهة الاجتماع النشط:**
- مؤقت يظهر الوقت المتبقي
- بند الأجندة الحالي مُظلل
- تسجيل الملاحظات في الوقت الفعلي
- زر لإنشاء قرار (SPADE)
- زر لإنشاء مهمة جديدة

**ج) لوحة KPIs:**
- كل المؤشرات مع حالة RAG
- رسوم بيانية للاتجاهات
- مؤشرات التنبيهات
- تفاصيل عند النقر

**د) سجل القرارات:**
- قائمة بكل القرارات
- فلترة حسب الحالة/النوع/المالك
- ربط بالاجتماع المصدر
- تتبع التنفيذ

---

## ⚙️ ملاحظات تقنية

1. **المنطقة الزمنية:** استخدم توقيت مصر (Africa/Cairo)
2. **اللغة:** كل النصوص تحتاج ترجمة عربية
3. **الترقيم:** كل اجتماع وقرار له رقم تسلسلي فريد
4. **التكامل:** KPIs تسحب من بيانات منصة Xchange الفعلية
5. **سجل التدقيق:** سجل كل الأنشطة والتغييرات

---

## 🚀 ابدأ بـ:

1. إضافة Prisma schema الجديد
2. تشغيل migration
3. إنشاء الخدمات الثلاث (MeetingScheduler, AlertEngine, DecisionFramework)
4. إنشاء واجهات المستخدم الأساسية

---

**🎯 الهدف: بناء أفضل نظام حوكمة ذكي لشركة ناشئة في العالم!**
