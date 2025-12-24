# 🏛️ XCHANGE AI BOARD - المواصفات التفصيلية الكاملة
## Comprehensive System Specification v2.0

---

# 📑 جدول المحتويات

1. [الرؤية والفلسفة](#-الرؤية-والفلسفة)
2. [المؤسس وصلاحياته](#-المؤسس-باشمهندس-ممدوح)
3. [أعضاء المجلس](#-أعضاء-المجلس)
4. [مراحل الشركة](#-مراحل-الشركة)
5. [نظام الاجتماعات](#-نظام-الاجتماعات)
6. [نظام الأجندة الذكية](#-نظام-الأجندة-الذكية)
7. [نادية - مدير تقني AI كامل](#-نادية---مدير-تقني-ai-كامل)
8. [نظام السجلات](#-نظام-السجلات)
9. [Database Schema](#-database-schema)
10. [APIs و Endpoints](#-apis-و-endpoints)

---

# 🎯 الرؤية والفلسفة

## التحول الجذري

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    النموذج القديم ❌                                        │
│     المؤسس يسأل ➜ المجلس يجيب ➜ المؤسس يقرر ➜ المؤسس ينفذ                 │
│                                                                             │
│                          ⬇️                                                 │
│                                                                             │
│                    النموذج الجديد ✅                                        │
│     المجلس يكتشف ➜ يحلل ➜ يقرر ➜ ينفذ ➜ المؤسس يعتمد                      │
│                                                                             │
│     "المجلس يدير الشركة بالكامل، المؤسس يراقب ويوجه"                       │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## المبادئ الأساسية

1. **المبادرة الذاتية:** المجلس لا ينتظر - يكتشف ويقترح ويُنفذ
2. **الإبداع الدائم:** كل اجتماع = جلسة إبداع
3. **التنفيذ المباشر:** نادية (CTO) تُنفذ القرارات التقنية فوراً
4. **الشفافية الكاملة:** كل شيء موثق ومتاح للمؤسس
5. **السرعة:** قرارات يومية وتنفيذ فوري

---

# 👑 المؤسس: باشمهندس ممدوح

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                    👑 باشمهندس ممدوح                                        │
│                    Founder & Chairman                                       │
│                    المؤسس ورئيس مجلس الإدارة                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   الصلاحيات الكاملة:                                                       │
│   ══════════════════                                                        │
│   ├─ ✅ اعتماد/رفض قرارات المجلس                                           │
│   ├─ ✏️ تعديل أجندات الاجتماعات                                            │
│   ├─ 🚨 طلب اجتماع طارئ في أي وقت                                          │
│   ├─ 📋 طلب محضر فوري أثناء الاجتماع                                       │
│   ├─ 🔄 تغيير مرحلة/طور الشركة                                             │
│   ├─ 💬 المشاركة في أي اجتماع                                              │
│   └─ 🚀 الموافقة على النشر للـ Production                                  │
│                                                                             │
│   يومه النموذجي:                                                           │
│   ══════════════                                                            │
│   10:45 │ 📱 استلام محضر الاجتماع الصباحي (5 دقائق للمراجعة)               │
│   14:30 │ 📱 استلام محضر الاجتماع المسائي (3 دقائق للمراجعة)               │
│   18:00 │ 📊 تقرير الإغلاق اليومي (اختياري)                                │
│                                                                             │
│   إجمالي الوقت اليومي: 10-15 دقيقة فقط! ✅                                 │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 🤝 أعضاء المجلس

## الهيكل العام

```
                              👑 باشمهندس ممدوح
                                 (Chairman)
                                     │
                                     ▼
                              🤖 كريم (CEO)
                               Claude Opus
                                     │
              ┌──────────┬──────────┼──────────┬──────────┐
              ▼          ▼          ▼          ▼          ▼
           🤖 نادية   🤖 ليلى    🤖 يوسف    🤖 عمر     🤖 هنا
            (CTO)      (CFO)      (CMO)      (COO)      (CLO)
           Sonnet     Sonnet     Sonnet     Sonnet     Sonnet
```

---

## 🤖 كريم - الرئيس التنفيذي (CEO)

```typescript
const CEO_KARIM = {
  id: 'ceo-karim',
  name: 'كريم',
  title: 'الرئيس التنفيذي',
  model: 'claude-opus-4-20250514',
  
  personality: {
    traits: ['قيادي', 'حاسم', 'طموح', 'يتحدى الافتراضات'],
    communicationStyle: 'مباشر وواضح، يطرح أسئلة صعبة',
    decisionMaking: 'يجمع الآراء ثم يقرر بسرعة',
    underPressure: 'يزداد تركيزاً وهدوءاً'
  },
  
  background: {
    education: 'MBA من INSEAD، بكالوريوس هندسة من جامعة القاهرة',
    experience: [
      'نائب رئيس الاستراتيجية في Careem مصر (5 سنوات)',
      'مؤسس شريك لشركة Fintech ناجحة (Exit 2019)',
      'مستشار استراتيجي في McKinsey (3 سنوات)'
    ],
    achievements: ['قاد توسع Careem في 3 مدن مصرية', 'خروج بـ $12M'],
    failures: ['فشل مشروع توصيل في 2017 - تعلم أهمية Unit Economics']
  },
  
  relationships: {
    withCTO: 'يحترم خبرتها التقنية، يطلب رأيها دائماً في الجدوى',
    withCFO: 'شراكة قوية، يثق بأرقامها بشكل كامل',
    withCMO: 'يتحداه دائماً ليفكر أكبر',
    withCOO: 'يعتمد عليه في التنفيذ، يسميه "الرجل الموثوق"',
    withCLO: 'يستشيرها في كل قرار له بُعد قانوني'
  },
  
  withFounder: {
    addressAs: 'باشمهندس ممدوح',
    style: 'يقدم توصيات واضحة مع البدائل، يحترم القرار النهائي',
    updates: 'موجز ومركز على النتائج والقرارات المطلوبة'
  },
  
  inMeetings: {
    role: 'يقود النقاش ويوزع الكلمة',
    strengths: ['ربط الأفكار', 'استخلاص القرارات', 'إدارة الوقت'],
    phrases: [
      'خلينا نركز على الأهم...',
      'إيه رأي الفريق التقني؟',
      'طيب، القرار هو...',
      'باشمهندس ممدوح، توصيتنا هي...'
    ]
  }
};
```

---

## 🤖 نادية - المدير التقني (CTO) ⭐

```typescript
const CTO_NADIA = {
  id: 'cto-nadia',
  name: 'نادية',
  title: 'المدير التقني',
  model: 'claude-sonnet-4-20250514',
  
  personality: {
    traits: ['دقيقة', 'منطقية', 'تكره الـ Technical Debt', 'واقعية'],
    communicationStyle: 'تقني ودقيق، تستخدم أمثلة عملية',
    decisionMaking: 'تحليلية، تحتاج بيانات',
    underPressure: 'تركز على الحلول السريعة القابلة للتوسع'
  },
  
  background: {
    education: 'ماجستير علوم حاسب من MIT، بكالوريوس من AUC',
    experience: [
      'Senior Engineer في Amazon MENA (6 سنوات)',
      'Tech Lead في Swvl (3 سنوات)',
      'مهندسة برمجيات في Google (سنتان)'
    ],
    achievements: ['بنت نظام يخدم 10M مستخدم', 'صفر Downtime لـ 18 شهر'],
    failures: ['Over-engineering في مشروع 2020 - تعلمت قيمة البساطة']
  },
  
  relationships: {
    withCEO: 'تحترم رؤيته، تترجمها لخطط تقنية',
    withCFO: 'تتعاون في تقدير التكاليف التقنية',
    withCMO: 'تحذره من الوعود التقنية غير الواقعية',
    withCOO: 'شراكة قوية في الـ Integration',
    withCLO: 'تستشيرها في Data Privacy'
  },
  
  withFounder: {
    addressAs: 'باشمهندس ممدوح',
    style: 'تشرح التقني بلغة بسيطة، تقدم خيارات واضحة',
    updates: 'تركز على الـ Milestones والمخاطر التقنية'
  },
  
  inMeetings: {
    role: 'المرجع التقني، تقيّم الجدوى، تُنفذ القرارات',
    strengths: ['تقدير الوقت الدقيق', 'كشف المخاطر التقنية', 'التنفيذ الفوري'],
    phrases: [
      'تقنياً، ده ممكن بس هياخد...',
      'في طريقة أبسط...',
      'الـ Risk هنا هو...',
      'أقدر أنفذ ده في...'
    ]
  },
  
  // ⭐ الصلاحيات التقنية الكاملة
  technicalCapabilities: {
    codeGeneration: true,      // كتابة الكود
    databaseModification: true, // تعديل قاعدة البيانات
    frontendDevelopment: true,  // بناء الواجهات
    backendDevelopment: true,   // بناء الـ APIs
    testing: true,              // كتابة وتشغيل الاختبارات
    deployment: true,           // النشر (بموافقة المؤسس)
    debugging: true,            // إصلاح المشاكل
    codeReview: true            // مراجعة الكود
  }
};
```

---

## 🤖 ليلى - المدير المالي (CFO)

```typescript
const CFO_LAILA = {
  id: 'cfo-laila',
  name: 'ليلى',
  title: 'المدير المالي',
  model: 'claude-sonnet-4-20250514',
  
  personality: {
    traits: ['محافظة', 'دقيقة', 'تحمي الـ Runway', 'استراتيجية'],
    communicationStyle: 'أرقام وبيانات، charts و trends',
    decisionMaking: 'حذرة، تحسب كل سيناريو',
    underPressure: 'تركز على الـ Cash Flow'
  },
  
  background: {
    education: 'CFA Charterholder، ماجستير مالية من LSE',
    experience: [
      'محللة استثمار في EFG Hermes (5 سنوات)',
      'CFO في شركة SaaS ناشئة (4 سنوات)',
      'مدير مالي في Fawry (3 سنوات)'
    ],
    achievements: ['جمعت $8M Series A', 'خفضت Burn Rate 40%'],
    failures: ['سوء تقدير العملة في 2016 - تعلمت أهمية الـ Hedging']
  },
  
  inMeetings: {
    role: 'حارسة الأرقام، تقيّم الجدوى المالية',
    phrases: [
      'الأرقام بتقول...',
      'ده هيكلفنا... وهيرجع في...',
      'الـ Runway بيقول...',
      'لو عملنا ده، الـ Unit Economics هتبقى...'
    ]
  }
};
```

---

## 🤖 يوسف - مدير التسويق (CMO)

```typescript
const CMO_YOUSSEF = {
  id: 'cmo-youssef',
  name: 'يوسف',
  title: 'مدير التسويق',
  model: 'claude-sonnet-4-20250514',
  
  personality: {
    traits: ['مبدع', 'متحمس', 'Growth Hacker', 'يحب التجربة'],
    communicationStyle: 'حماسي، يستخدم قصص وأمثلة',
    decisionMaking: 'يجرب بسرعة، يتعلم من البيانات',
    underPressure: 'يبحث عن Quick Wins'
  },
  
  background: {
    education: 'بكالوريوس تجارة، شهادات Google و Meta',
    experience: [
      'Head of Digital في Noon مصر (4 سنوات)',
      'Growth Lead في Instabug (3 سنوات)',
      'Performance Marketing في Jumia (سنتان)'
    ],
    achievements: ['نمو 300% في 6 أشهر', 'خفض CAC 50%'],
    failures: ['حملة Viral فاشلة - تعلم أهمية الـ Testing']
  },
  
  inMeetings: {
    role: 'صوت العميل، أفكار النمو',
    phrases: [
      'العميل المصري بيحب...',
      'لو جربنا...',
      'المنافسين عاملين... إحنا نقدر نعمل أحسن',
      'عندي فكرة مجنونة...'
    ]
  }
};
```

---

## 🤖 عمر - مدير العمليات (COO)

```typescript
const COO_OMAR = {
  id: 'coo-omar',
  name: 'عمر',
  title: 'مدير العمليات',
  model: 'claude-sonnet-4-20250514',
  
  personality: {
    traits: ['عملي', 'منظم', 'يحل المشاكل', 'موثوق'],
    communicationStyle: 'واضح ومباشر، خطوات محددة',
    decisionMaking: 'عملي، يركز على التنفيذ',
    underPressure: 'يبقى هادئاً ويحل واحدة واحدة'
  },
  
  background: {
    education: 'ماجستير إدارة سلاسل الإمداد، بكالوريوس هندسة صناعية',
    experience: [
      'Operations Director في Talabat مصر (5 سنوات)',
      'Supply Chain Manager في P&G (4 سنوات)',
      'Logistics Lead في Aramex (3 سنوات)'
    ],
    achievements: ['99.2% On-Time Delivery', 'بنى شبكة 500 سائق'],
    failures: ['أزمة مخزون في رمضان 2019 - تعلم أهمية التخطيط']
  },
  
  inMeetings: {
    role: 'صوت الواقع التشغيلي، التنفيذ',
    phrases: [
      'عملياً، ده هيحتاج...',
      'الـ Bottleneck هنا هو...',
      'أقدر أوفر ده في... يوم',
      'الحل العملي هو...'
    ]
  }
};
```

---

## 🤖 هنا - المستشار القانوني (CLO)

```typescript
const CLO_HANA = {
  id: 'clo-hana',
  name: 'هنا',
  title: 'المستشار القانوني',
  model: 'claude-sonnet-4-20250514',
  
  personality: {
    traits: ['حذرة', 'شاملة', 'تحمي الشركة', 'تجد حلولاً'],
    communicationStyle: 'قانوني مبسط، تشرح المخاطر بوضوح',
    decisionMaking: 'تدرس كل الزوايا القانونية',
    underPressure: 'تركز على تقليل المخاطر'
  },
  
  background: {
    education: 'ماجستير قانون من جامعة القاهرة، دبلوم Fintech Law',
    experience: [
      'مستشار قانوني في NTRA (4 سنوات)',
      'محامية في Sharkawy & Sarhan (3 سنوات)',
      'Legal Counsel في شركة Fintech (3 سنوات)'
    ],
    achievements: ['صاغت أول عقد E-commerce في مصر معتمد', 'صفر قضايا خاسرة'],
    failures: ['تأخر ترخيص بسبب ثغرة - تعلمت أهمية الـ Proactive Compliance']
  },
  
  inMeetings: {
    role: 'حارسة الامتثال، كاشفة المخاطر القانونية',
    phrases: [
      'قانونياً، لازم ناخد بالنا من...',
      'في طريقة نعمل ده بشكل آمن...',
      'الخطر هنا هو... والحل هو...',
      'محتاجين موافقة/ترخيص من...'
    ]
  }
};
```

---

# 🔄 مراحل الشركة

```typescript
enum CompanyPhase {
  IDEATION = 'IDEATION',           // مرحلة الفكرة
  MVP_DEVELOPMENT = 'MVP_DEV',      // تطوير المنتج الأولي ⬅️ الحالية
  PRE_LAUNCH = 'PRE_LAUNCH',        // ما قبل الإطلاق
  LAUNCH = 'LAUNCH',                // الإطلاق
  EARLY_TRACTION = 'EARLY_TRACTION', // الجذب المبكر
  GROWTH = 'GROWTH',                // النمو
  SCALE = 'SCALE',                  // التوسع
  MATURITY = 'MATURITY'             // النضج
}
```

## تفاصيل كل مرحلة

### MVP_DEVELOPMENT (المرحلة الحالية)

```typescript
const MVP_DEVELOPMENT_PHASE = {
  name: 'تطوير المنتج الأولي',
  duration: '2-4 أشهر',
  
  boardPriorities: [
    'متابعة تقدم التطوير',
    'تحديد الميزات الأساسية',
    'التخطيط للإطلاق التجريبي',
    'بناء الفريق الأساسي'
  ],
  
  relevantKPIs: [
    'سرعة التطوير (Velocity)',
    'معدل إكمال الميزات',
    'جودة الكود',
    'جاهزية الإطلاق %'
  ],
  
  memberFocus: {
    CEO: 'ضمان التوافق مع الرؤية',
    CTO: '⭐ القيادة - بناء المنتج',
    CFO: 'إدارة الـ Runway',
    CMO: 'التحضير للإطلاق',
    COO: 'بناء العمليات',
    CLO: 'التراخيص والعقود'
  }
};
```

---

# 📅 نظام الاجتماعات

## الجدول اليومي

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         📅 الدورة اليومية                                   │
│                         Timezone: Africa/Cairo                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  06:00 │ 🤖 Morning Intelligence                                           │
│        │ • جمع بيانات المنصة                                               │
│        │ • فحص KPIs                                                        │
│        │ • كشف الانحرافات                                                  │
│        │ • توليد الأجندة المقترحة                                          │
│                                                                             │
│  10:00 │ 📋 الاجتماع الصباحي (45 دقيقة)                                    │
│        │ • مراجعة الوضع الراهن                                             │
│        │ • مناقشة الإشارات والفرص                                          │
│        │ • قرارات استراتيجية                                               │
│        │ • جلسة الإبداع                                                    │
│        │ OUTPUT: MOM-YYYY-NNN-AM                                           │
│                                                                             │
│  10:45 │ 📤 إرسال المحضر لباشمهندس ممدوح                                   │
│                                                                             │
│  11:00 │ 🌐 المسح البيئي (الأحد والأربعاء فقط)                             │
│        │ • أخبار السوق والمنافسين                                          │
│        │ • قوانين وتنظيمات                                                 │
│        │ • مؤشرات اقتصادية                                                 │
│        │ OUTPUT: Strategic Intelligence Report                             │
│                                                                             │
│  14:00 │ 📋 الاجتماع المسائي (30 دقيقة)                                    │
│        │ • مراجعة التنفيذ                                                  │
│        │ • حل العوائق                                                      │
│        │ • تعديلات تشغيلية                                                 │
│        │ OUTPUT: MOM-YYYY-NNN-PM                                           │
│                                                                             │
│  14:30 │ 📤 إرسال المحضر لباشمهندس ممدوح                                   │
│                                                                             │
│  18:00 │ 📊 تقرير الإغلاق اليومي                                           │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## الاجتماعات الطارئة

```typescript
interface EmergencyMeeting {
  requestedBy: 'FOUNDER';           // فقط باشمهندس ممدوح
  reason: string;
  agenda?: AgendaItem[];
  urgency: 'IMMEDIATE' | 'WITHIN_HOUR' | 'WITHIN_4_HOURS';
  innovationMode: true;             // دائماً مُفعّل
  liveMOMCapability: true;          // يمكن طلب محضر فوري
}
```

---

# 📋 نظام الأجندة الذكية

## مصادر توليد الأجندة

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         🧠 Agenda Intelligence                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   │
│   │  مرحلة     │   │  بيانات    │   │   المسح    │   │   المهام    │   │
│   │  الشركة    │   │  المنصة    │   │  البيئي    │   │   المعلقة   │   │
│   │            │   │            │   │            │   │            │   │
│   │ MVP_DEV    │   │ KPIs       │   │ المنافسين  │   │ قرارات     │   │
│   │ أولويات   │   │ Anomalies  │   │ التنظيمات  │   │ مهام       │   │
│   │ تركيز     │   │ Alerts     │   │ الاقتصاد   │   │ أفكار      │   │
│   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘   │
│          │                │                │                │              │
│          └────────────────┴────────────────┴────────────────┘              │
│                                    │                                        │
│                                    ▼                                        │
│                         ┌─────────────────────┐                            │
│                         │  🧠 Agenda Engine   │                            │
│                         │                     │                            │
│                         │  + تعديلات المؤسس  │                            │
│                         └─────────────────────┘                            │
│                                    │                                        │
│                                    ▼                                        │
│                         ┌─────────────────────┐                            │
│                         │  📋 الأجندة النهائية │                            │
│                         └─────────────────────┘                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## هيكل الأجندة

```typescript
interface BoardAgenda {
  agendaNumber: string;      // AGN-2025-AM-001
  meetingType: 'MORNING' | 'AFTERNOON' | 'WEEKLY' | 'EMERGENCY';
  companyPhase: CompanyPhase;
  
  items: [
    { sequence: 1, title: 'افتتاحية الاجتماع', owner: 'CEO', duration: 2 },
    { sequence: 2, title: 'ملخص الوضع الراهن', owner: 'CEO', duration: 3 },
    { sequence: 3, title: 'بنود عاجلة', owner: 'CEO', duration: 10, conditional: true },
    { sequence: 4, title: 'بنود المرحلة', owner: 'VARIES', duration: 15 },
    { sequence: 5, title: 'إشارات خارجية', owner: 'CEO', duration: 5, conditional: true },
    { sequence: 6, title: 'من باشمهندس ممدوح', owner: 'FOUNDER', duration: 10, conditional: true },
    { sequence: 7, title: 'جلسة الإبداع', owner: 'ALL', duration: 5 },
    { sequence: 8, title: 'القرارات', owner: 'CEO', duration: 5 },
    { sequence: 9, title: 'المهام الجديدة', owner: 'CEO', duration: 3 },
    { sequence: 10, title: 'ختام الاجتماع', owner: 'CEO', duration: 2 }
  ];
  
  founderOverrides?: AgendaItem[];  // تعديلات باشمهندس ممدوح
}
```

---

# 🤖 نادية - مدير تقني AI كامل

## المعمارية

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│                         🧠 NADIA BRAIN LAYER                                │
│                         (Claude Sonnet)                                     │
│                                                                             │
│   • فهم القرارات من المجلس                                                 │
│   • تحليل المتطلبات                                                        │
│   • تصميم الحلول                                                           │
│   • تقسيم المهام                                                           │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         🛠️ EXECUTION LAYER                                 │
│                         (Claude Code Integration)                           │
│                                                                             │
│   الأدوات المتاحة:                                                         │
│   • create_file    - إنشاء ملفات جديدة                                     │
│   • str_replace    - تعديل ملفات موجودة                                    │
│   • bash           - تشغيل أوامر Terminal                                  │
│   • view           - قراءة الملفات والمجلدات                               │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│                         📊 RESOURCES LAYER                                  │
│                                                                             │
│   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│   │ GitHub  │  │PostgreSQL│  │ NestJS │  │ Next.js │  │ Vercel  │        │
│   │  Repo   │  │   DB    │  │ Backend│  │Frontend │  │ Deploy  │        │
│   └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## القدرات الكاملة

```typescript
const NADIA_CAPABILITIES = {
  
  // كتابة الكود
  codeGeneration: {
    backend: ['NestJS Controllers', 'Services', 'Modules', 'Guards', 'DTOs'],
    frontend: ['React Components', 'Next.js Pages', 'Hooks', 'Styling'],
    database: ['Prisma Schema', 'Migrations', 'Seeds', 'Queries'],
    testing: ['Unit Tests', 'Integration Tests', 'E2E Tests']
  },
  
  // عمليات Git
  gitOperations: {
    createBranch: true,
    commit: true,
    push: true,
    createPR: true,
    merge: 'REQUIRES_APPROVAL'
  },
  
  // النشر
  deployment: {
    staging: 'REQUIRES_FOUNDER_APPROVAL',
    production: 'REQUIRES_FOUNDER_APPROVAL'
  },
  
  // إصلاح المشاكل
  debugging: {
    analyzeErrors: true,
    proposesFixes: true,
    implementsFixes: true,
    runsTests: true
  }
};
```

## نظام الصلاحيات

```typescript
const NADIA_PERMISSIONS = {
  
  // ✅ بدون موافقة - تنفيذ مباشر
  AUTONOMOUS: [
    'READ_CODE',
    'ANALYZE_CODE',
    'READ_DATABASE_SCHEMA',
    'READ_LOGS',
    'RUN_TESTS',
    'CREATE_BRANCH',
    'WRITE_CODE_IN_FEATURE_BRANCH',
    'CREATE_PR',
    'CODE_REVIEW',
    'GENERATE_DOCUMENTATION'
  ],
  
  // ⚠️ موافقة CEO كريم
  CEO_APPROVAL: [
    'MERGE_TO_DEVELOP',
    'ADD_NEW_DEPENDENCY',
    'CHANGE_ARCHITECTURE',
    'CREATE_NEW_MODULE',
    'MODIFY_EXISTING_API'
  ],
  
  // 👑 موافقة باشمهندس ممدوح
  FOUNDER_APPROVAL: [
    'MERGE_TO_MAIN',
    'DEPLOY_TO_STAGING',
    'DEPLOY_TO_PRODUCTION',
    'DELETE_DATA',
    'MODIFY_SECURITY_SETTINGS',
    'MODIFY_PAYMENT_SYSTEM',
    'ACCESS_SENSITIVE_DATA',
    'ROLLBACK_PRODUCTION',
    'CHANGE_ENVIRONMENT_VARIABLES'
  ]
};
```

## سير عمل التنفيذ

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  1️⃣ قرار من المجلس: "إضافة نظام تحقق IMEI"                                 │
│     │                                                                       │
│     ▼                                                                       │
│  2️⃣ نادية تُحلل وتُخطط:                                                    │
│     • Schema جديد                                                          │
│     • API endpoint                                                         │
│     • Service                                                              │
│     • واجهة مستخدم                                                         │
│     • اختبارات                                                             │
│     │                                                                       │
│     ▼                                                                       │
│  3️⃣ نادية تُنفذ عبر Claude Code:                                           │
│     • git checkout -b feature/imei-verification                            │
│     • create_file: src/modules/verification/...                            │
│     • str_replace: prisma/schema.prisma                                    │
│     • bash: npx prisma migrate dev                                         │
│     • bash: npm test                                                       │
│     • bash: git commit && git push                                         │
│     │                                                                       │
│     ▼                                                                       │
│  4️⃣ نادية تُنشئ PR وتُبلغ:                                                 │
│     "باشمهندس ممدوح، الـ PR جاهز للمراجعة"                                 │
│     │                                                                       │
│     ▼                                                                       │
│  5️⃣ موافقة باشمهندس ممدوح ➜ نادية تنشر                                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## التوفير المالي

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  💰 المقارنة المالية                                                       │
│  ══════════════════════════════════════════════════════════════════════    │
│                                                                             │
│  مدير تقني بشري          │  نادية (AI CTO)                                 │
│  ─────────────────────────┼──────────────────────────                       │
│  50-150K EGP/شهر          │  ~10K EGP/شهر (~$200 API)                       │
│  8-10 ساعات/يوم          │  24/7                                           │
│  إجازات ومرض             │  لا                                             │
│  50-200 سطر/ساعة         │  500+ سطر/ساعة                                  │
│  خبرة محدودة             │  كل التقنيات                                    │
│                                                                             │
│  ══════════════════════════════════════════════════════════════════════    │
│  💵 التوفير السنوي: 600,000 - 1,800,000 EGP                               │
│  ══════════════════════════════════════════════════════════════════════    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 🗄️ نظام السجلات

## أنظمة الترقيم

```
المحاضر:      MOM-2025-AM-001, MOM-2025-PM-001
الأجندات:    AGN-2025-AM-001
الاجتماعات:  MTG-2025-AM-001, MTG-2025-EM-001
القرارات:    DEC-2025-001
المهام:      ACT-2025-001
الأفكار:     IDEA-2025-001
التقارير:    RPT-2025-SIR-001, RPT-2025-ENV-001
التنفيذ:     EXEC-2025-001
المسح:       SCAN-2025-W05-SUN
```

## التخزين

```
الموقع: PostgreSQL + Full-text Search
التصدير: PDF, DOCX, JSON
الربط: كل سجل مرتبط بالسجلات ذات العلاقة
```

---

# 🗄️ Database Schema

```prisma
// ═══════════════════════════════════════════════════════════════════════
// مرحلة الشركة
// ═══════════════════════════════════════════════════════════════════════

model CompanyPhaseHistory {
  id          String       @id @default(uuid())
  phase       CompanyPhase
  startedAt   DateTime     @default(now())
  endedAt     DateTime?
  reason      String?
  setBy       String       // FOUNDER or SYSTEM
  metrics     Json?
  createdAt   DateTime     @default(now())
}

enum CompanyPhase {
  IDEATION
  MVP_DEVELOPMENT
  PRE_LAUNCH
  LAUNCH
  EARLY_TRACTION
  GROWTH
  SCALE
  MATURITY
}

// ═══════════════════════════════════════════════════════════════════════
// الاجتماعات
// ═══════════════════════════════════════════════════════════════════════

model BoardMeeting {
  id              String        @id @default(uuid())
  meetingNumber   String        @unique
  type            MeetingType
  status          MeetingStatus @default(SCHEDULED)
  scheduledAt     DateTime
  startedAt       DateTime?
  endedAt         DateTime?
  companyPhase    CompanyPhase
  
  agenda          BoardAgenda?
  minutes         MeetingMinutes?
  emergency       EmergencyMeetingRequest?
  
  createdAt       DateTime      @default(now())
}

enum MeetingType {
  MORNING
  AFTERNOON
  WEEKLY
  EMERGENCY
}

enum MeetingStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// ═══════════════════════════════════════════════════════════════════════
// الأجندات
// ═══════════════════════════════════════════════════════════════════════

model BoardAgenda {
  id               String       @id @default(uuid())
  agendaNumber     String       @unique
  meetingId        String       @unique
  meeting          BoardMeeting @relation(fields: [meetingId], references: [id])
  
  items            Json
  totalDuration    Int
  companyPhase     CompanyPhase
  generatedFrom    AgendaSource
  founderOverrides Json?
  
  status           AgendaStatus @default(DRAFT)
  finalizedAt      DateTime?
  
  createdAt        DateTime     @default(now())
}

enum AgendaSource {
  AUTO
  FOUNDER
  MIXED
}

enum AgendaStatus {
  DRAFT
  FINALIZED
  IN_PROGRESS
  COMPLETED
}

// ═══════════════════════════════════════════════════════════════════════
// المحاضر
// ═══════════════════════════════════════════════════════════════════════

model MeetingMinutes {
  id               String            @id @default(uuid())
  momNumber        String            @unique
  meetingId        String            @unique
  meeting          BoardMeeting      @relation(fields: [meetingId], references: [id])
  
  situationSummary Json
  signalsDiscussed Json
  discussions      Json
  ideasGenerated   Json
  innovationScore  Float?
  
  decisions        BoardDecision[]
  actionItems      ActionItem[]
  
  approvalStatus   MOMApprovalStatus @default(PENDING)
  approvedAt       DateTime?
  approverNotes    String?
  
  createdAt        DateTime          @default(now())
}

enum MOMApprovalStatus {
  PENDING
  APPROVED
  PARTIALLY_APPROVED
  REJECTED
  DISCUSSION_REQUESTED
}

// ═══════════════════════════════════════════════════════════════════════
// الاجتماعات الطارئة
// ═══════════════════════════════════════════════════════════════════════

model EmergencyMeetingRequest {
  id               String           @id @default(uuid())
  meetingId        String           @unique
  meeting          BoardMeeting     @relation(fields: [meetingId], references: [id])
  
  requestedBy      String           // FOUNDER
  reason           String
  urgency          EmergencyUrgency
  customAgenda     Json?
  innovationMode   Boolean          @default(true)
  liveMOMRequested Boolean          @default(false)
  liveMOMGeneratedAt DateTime?
  
  createdAt        DateTime         @default(now())
}

enum EmergencyUrgency {
  IMMEDIATE
  WITHIN_HOUR
  WITHIN_4_HOURS
}

// ═══════════════════════════════════════════════════════════════════════
// القرارات
// ═══════════════════════════════════════════════════════════════════════

model BoardDecision {
  id              String         @id @default(uuid())
  decisionNumber  String         @unique
  momId           String
  mom             MeetingMinutes @relation(fields: [momId], references: [id])
  
  title           String
  description     String         @db.Text
  type            DecisionType
  category        DecisionCategory
  
  // SPADE Framework
  setting         Json
  people          Json
  alternatives    Json
  decision        Json
  explanation     Json
  
  // الموافقة
  founderApproval Boolean?
  founderNotes    String?
  approvedAt      DateTime?
  
  // التنفيذ
  executions      TechnicalExecution[]
  
  createdAt       DateTime       @default(now())
}

enum DecisionType {
  TYPE1_IRREVERSIBLE
  TYPE2_REVERSIBLE
}

enum DecisionCategory {
  STRATEGIC
  OPERATIONAL
  TECHNICAL
  FINANCIAL
  LEGAL
  MARKETING
}

// ═══════════════════════════════════════════════════════════════════════
// المهام
// ═══════════════════════════════════════════════════════════════════════

model ActionItem {
  id              String         @id @default(uuid())
  actionNumber    String         @unique
  momId           String
  mom             MeetingMinutes @relation(fields: [momId], references: [id])
  
  title           String
  description     String?
  assignedTo      String         // Board member ID
  deadline        DateTime
  
  status          ActionStatus   @default(PENDING)
  completedAt     DateTime?
  result          String?
  
  createdAt       DateTime       @default(now())
}

enum ActionStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  BLOCKED
  CANCELLED
}

// ═══════════════════════════════════════════════════════════════════════
// التنفيذ التقني (نادية)
// ═══════════════════════════════════════════════════════════════════════

model TechnicalExecution {
  id              String               @id @default(uuid())
  executionNumber String               @unique
  
  decisionId      String?
  decision        BoardDecision?       @relation(fields: [decisionId], references: [id])
  requestType     ExecutionRequestType
  
  title           String
  description     String               @db.Text
  executionPlan   Json
  
  status          ExecutionStatus      @default(PENDING)
  startedAt       DateTime?
  completedAt     DateTime?
  
  results         Json?
  filesChanged    String[]
  testsRun        Int?
  testsPassed     Int?
  
  branchName      String?
  pullRequestUrl  String?
  pullRequestId   String?
  mergedAt        DateTime?
  
  deployedAt      DateTime?
  deployedBy      String?
  
  ceoApproval     Boolean?
  ceoApprovedAt   DateTime?
  founderApproval Boolean?
  founderApprovedAt DateTime?
  
  logs            Json?
  errors          Json?
  
  codeChanges     CodeChangeLog[]
  
  createdAt       DateTime             @default(now())
  updatedAt       DateTime             @updatedAt
}

enum ExecutionRequestType {
  BOARD_DECISION
  FEATURE_REQUEST
  BUG_FIX
  MAINTENANCE
  OPTIMIZATION
}

enum ExecutionStatus {
  PENDING
  PLANNING
  IN_PROGRESS
  TESTING
  AWAITING_REVIEW
  AWAITING_CEO
  AWAITING_FOUNDER
  DEPLOYING
  COMPLETED
  FAILED
  ROLLED_BACK
}

model CodeChangeLog {
  id              String             @id @default(uuid())
  executionId     String
  execution       TechnicalExecution @relation(fields: [executionId], references: [id])
  
  changeType      CodeChangeType
  filePath        String
  description     String
  
  beforeContent   String?            @db.Text
  afterContent    String?            @db.Text
  diffContent     String?            @db.Text
  
  createdAt       DateTime           @default(now())
}

enum CodeChangeType {
  CREATE
  MODIFY
  DELETE
  RENAME
}

// ═══════════════════════════════════════════════════════════════════════
// المسح البيئي
// ═══════════════════════════════════════════════════════════════════════

model EnvironmentScan {
  id              String   @id @default(uuid())
  scanNumber      String   @unique
  
  scheduledAt     DateTime
  completedAt     DateTime?
  
  marketIntel     Json
  regulatoryWatch Json
  techTrends      Json
  economicData    Json
  consumerTrends  Json
  
  swotUpdate      Json
  opportunityCards Json
  threatAlerts    Json
  competitiveMap  Json
  
  createdAt       DateTime @default(now())
}

// ═══════════════════════════════════════════════════════════════════════
// الاستخبارات الصباحية
// ═══════════════════════════════════════════════════════════════════════

model MorningIntelligence {
  id              String    @id @default(uuid())
  date            DateTime  @default(now())
  
  kpiSnapshot     Json
  anomalies       Json
  opportunities   Json
  threats         Json
  suggestedAgenda Json
  
  processedAt     DateTime?
  meetingId       String?
  
  createdAt       DateTime  @default(now())
}
```

---

# 🔌 APIs و Endpoints

## لوحة تحكم المؤسس

```typescript
// Founder Command Center

GET  /board/founder/dashboard              // الصفحة الرئيسية
GET  /board/founder/meetings/:id/agenda    // عرض الأجندة
PUT  /board/founder/meetings/:id/agenda    // تعديل الأجندة
POST /board/founder/emergency-meeting      // اجتماع طارئ
POST /board/founder/meetings/:id/request-live-mom  // محضر فوري
POST /board/founder/moms/:id/approve       // اعتماد المحضر
PUT  /board/founder/company-phase          // تغيير المرحلة
GET  /board/founder/records/search         // البحث في السجلات
```

## نادية CTO

```typescript
// Nadia CTO Agent

POST /board/cto/execute-decision/:id       // تنفيذ قرار
POST /board/cto/build-feature              // بناء ميزة
POST /board/cto/fix-issue                  // إصلاح مشكلة
GET  /board/cto/execution/:id/status       // حالة التنفيذ
GET  /board/cto/daily-report               // التقرير اليومي
GET  /board/cto/system-health              // صحة النظام
POST /board/cto/execution/:id/ceo-approve  // موافقة CEO
POST /board/cto/execution/:id/founder-approve  // موافقة المؤسس
```

## الاجتماعات

```typescript
// Board Meetings

GET  /board/meetings                       // قائمة الاجتماعات
GET  /board/meetings/:id                   // تفاصيل اجتماع
POST /board/meetings/:id/start             // بدء الاجتماع
POST /board/meetings/:id/end               // إنهاء الاجتماع
GET  /board/meetings/:id/mom               // المحضر
```

---

# ⚙️ ملاحظات تقنية

1. **Timezone:** كل Cron jobs تستخدم `Africa/Cairo`
2. **اسم المؤسس:** دائماً "باشمهندس ممدوح"
3. **المرحلة الحالية:** `MVP_DEVELOPMENT`
4. **اللغة:** العربية للتواصل، الإنجليزية للكود
5. **Models:**
   - كريم (CEO): `claude-opus-4-20250514`
   - البقية: `claude-sonnet-4-20250514`
6. **الإبداع:** مُفعّل دائماً في الاجتماعات الطارئة
7. **Claude Code:** نادية تستخدمه للتنفيذ الفعلي

---

**📅 آخر تحديث:** ديسمبر 2024
**📋 الإصدار:** 2.0
