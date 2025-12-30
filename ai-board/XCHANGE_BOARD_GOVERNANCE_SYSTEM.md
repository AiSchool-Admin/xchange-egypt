# 🏛️ XCHANGE AI BOARD - World-Class Governance System

## 📋 MISSION STATEMENT

Build the **world's best AI-powered Board of Directors** for Xchange Egypt - a governance system that combines:
- Best practices from Y Combinator, Sequoia, First Round Capital
- Decision frameworks from Stripe, Airbnb, Shopify
- AI-powered automation for meetings, KPIs, alerts, and decisions

---

## 🎯 CORE PHILOSOPHY

### The Board Works FOR the Founder
> "Every single entrepreneur forgets that the board works for them." - Jeff Bonforte

The AI Board should:
- **Challenge** the founder with hard questions
- **Support** with data-driven insights
- **Execute** tasks assigned by the founder
- **Alert** when risks or opportunities arise

### The 70/30 Rule
- **70%** of meeting time = Strategic discussion & decisions
- **30%** of meeting time = Status updates & reports

### Type 1 vs Type 2 Decisions
- **Type 1 (Irreversible):** Require full board deliberation, voting, founder approval
- **Type 2 (Reversible):** Delegated to appropriate executive, faster execution

---

## 📅 MEETING SYSTEM ARCHITECTURE

### Meeting Types & Numbering Convention

```typescript
enum MeetingType {
  STANDUP = 'STD',      // Daily 15-min
  WEEKLY = 'WKY',       // Weekly 60-min operational
  MONTHLY = 'MTH',      // Monthly 2-3hr strategic
  QUARTERLY = 'QTR',    // Quarterly 3hr board review
  EMERGENCY = 'EMR',    // Triggered by alerts
  OPPORTUNITY = 'OPP'   // Triggered by positive signals
}

// Numbering: [TYPE]-[YYYY]-[SEQUENCE]
// Examples: STD-2025-001, WKY-2025-012, MTH-2025-03, QTR-2025-Q1
```

### Database Schema Addition

```prisma
// Meeting Management
model BoardMeeting {
  id              String   @id @default(uuid())
  meetingNumber   String   @unique  // STD-2025-001
  type            MeetingType
  status          MeetingStatus @default(SCHEDULED)
  
  // Scheduling
  scheduledAt     DateTime
  startedAt       DateTime?
  endedAt         DateTime?
  duration        Int?     // minutes
  
  // Agenda
  agenda          BoardAgenda?
  agendaItems     AgendaItem[]
  
  // Participants
  participants    BoardMember[]
  founderPresent  Boolean @default(true)
  
  // Outcomes
  decisions       BoardDecision[]
  actionItems     ActionItem[]
  
  // Trigger (for emergency/opportunity meetings)
  triggeredBy     String?  // Alert ID or manual
  triggerReason   String?
  
  // Notes & Recording
  transcript      String?  @db.Text
  summary         String?  @db.Text
  summaryAr       String?  @db.Text
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model BoardAgenda {
  id              String   @id @default(uuid())
  meetingId       String   @unique
  meeting         BoardMeeting @relation(fields: [meetingId], references: [id])
  
  // Template used
  templateType    AgendaTemplate
  
  // Time allocation
  totalMinutes    Int
  
  items           AgendaItem[]
  
  // Pre-meeting prep
  preparedAt      DateTime?
  distributedAt   DateTime?
  
  createdAt       DateTime @default(now())
}

model AgendaItem {
  id              String   @id @default(uuid())
  agendaId        String
  agenda          BoardAgenda @relation(fields: [agendaId], references: [id])
  meetingId       String
  meeting         BoardMeeting @relation(fields: [meetingId], references: [id])
  
  // Item details
  sequence        Int
  title           String
  titleAr         String?
  description     String?  @db.Text
  
  // Time
  allocatedMinutes Int
  actualMinutes   Int?
  
  // Type
  itemType        AgendaItemType // UPDATE, DISCUSSION, DECISION, ACTION_REVIEW
  
  // Owner
  ownerId         String?
  owner           BoardMember? @relation(fields: [ownerId], references: [id])
  
  // Outcome
  status          ItemStatus @default(PENDING)
  notes           String?  @db.Text
  decision        BoardDecision?
  
  createdAt       DateTime @default(now())
}

model ActionItem {
  id              String   @id @default(uuid())
  meetingId       String
  meeting         BoardMeeting @relation(fields: [meetingId], references: [id])
  
  // Item details
  title           String
  titleAr         String?
  description     String?  @db.Text
  
  // Assignment
  assignedToId    String
  assignedTo      BoardMember @relation(fields: [assignedToId], references: [id])
  
  // Timeline
  deadline        DateTime
  completedAt     DateTime?
  
  // Status tracking
  status          ActionStatus @default(PENDING)
  progressNotes   String?
  
  // Follow-up
  followUpDate    DateTime?
  carryForward    Boolean @default(false)
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

enum MeetingType {
  STANDUP
  WEEKLY
  MONTHLY
  QUARTERLY
  EMERGENCY
  OPPORTUNITY
}

enum MeetingStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

enum AgendaTemplate {
  DAILY_STANDUP
  WEEKLY_OPS
  MONTHLY_STRATEGIC
  QUARTERLY_REVIEW
  EMERGENCY
  OPPORTUNITY
}

enum AgendaItemType {
  UPDATE
  DISCUSSION
  DECISION
  ACTION_REVIEW
  DEEP_DIVE
}

enum ItemStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  DEFERRED
  CANCELLED
}

enum ActionStatus {
  PENDING
  IN_PROGRESS
  BLOCKED
  COMPLETED
  OVERDUE
  CANCELLED
}
```

---

## 📊 AGENDA TEMPLATES

### 1. Daily Standup (15 minutes) - STD

```typescript
const DAILY_STANDUP_TEMPLATE = {
  type: 'STANDUP',
  duration: 15,
  items: [
    {
      sequence: 1,
      title: 'Blockers & Escalations',
      titleAr: 'العوائق والتصعيدات',
      allocatedMinutes: 5,
      itemType: 'UPDATE',
      description: 'Critical blockers requiring immediate attention',
      autoPopulate: 'blocked_tasks' // Auto-fill from task system
    },
    {
      sequence: 2,
      title: 'Yesterday Completions',
      titleAr: 'إنجازات الأمس',
      allocatedMinutes: 5,
      itemType: 'UPDATE',
      description: 'Key accomplishments from previous day',
      autoPopulate: 'completed_tasks_24h'
    },
    {
      sequence: 3,
      title: 'Today Priorities',
      titleAr: 'أولويات اليوم',
      allocatedMinutes: 5,
      itemType: 'UPDATE',
      description: 'Top 3 priorities for each executive',
      autoPopulate: 'today_priorities'
    }
  ]
};
```

### 2. Weekly Operational (60 minutes) - WKY

```typescript
const WEEKLY_OPS_TEMPLATE = {
  type: 'WEEKLY',
  duration: 60,
  items: [
    {
      sequence: 1,
      title: 'Previous Actions Review',
      titleAr: 'مراجعة المهام السابقة',
      allocatedMinutes: 5,
      itemType: 'ACTION_REVIEW',
      autoPopulate: 'pending_action_items'
    },
    {
      sequence: 2,
      title: 'KPI Dashboard Review',
      titleAr: 'مراجعة مؤشرات الأداء',
      allocatedMinutes: 15,
      itemType: 'UPDATE',
      autoPopulate: 'weekly_kpis',
      description: 'Red/Yellow/Green status on core metrics'
    },
    {
      sequence: 3,
      title: 'Executive Updates',
      titleAr: 'تحديثات المديرين التنفيذيين',
      allocatedMinutes: 20,
      itemType: 'UPDATE',
      description: 'Each executive: 1 win, 1 risk',
      subItems: [
        { owner: 'CEO', focus: 'Strategic progress' },
        { owner: 'CTO', focus: 'Technical milestones' },
        { owner: 'CFO', focus: 'Financial health' },
        { owner: 'CMO', focus: 'Growth metrics' },
        { owner: 'COO', focus: 'Operations efficiency' },
        { owner: 'CLO', focus: 'Compliance status' }
      ]
    },
    {
      sequence: 4,
      title: 'Blockers & Decisions',
      titleAr: 'العوائق والقرارات',
      allocatedMinutes: 15,
      itemType: 'DECISION',
      description: 'Items requiring collective input'
    },
    {
      sequence: 5,
      title: 'Action Items',
      titleAr: 'المهام الجديدة',
      allocatedMinutes: 5,
      itemType: 'UPDATE',
      description: 'Assign owners and deadlines'
    }
  ]
};
```

### 3. Monthly Strategic (120-180 minutes) - MTH

```typescript
const MONTHLY_STRATEGIC_TEMPLATE = {
  type: 'MONTHLY',
  duration: 150, // 2.5 hours
  items: [
    {
      sequence: 1,
      title: 'CEO Strategic Assessment',
      titleAr: 'التقييم الاستراتيجي للرئيس التنفيذي',
      allocatedMinutes: 20,
      itemType: 'UPDATE',
      owner: 'CEO',
      description: 'State of company, market position, competitive threats'
    },
    {
      sequence: 2,
      title: 'Deep Dive Topic',
      titleAr: 'موضوع للنقاش المعمق',
      allocatedMinutes: 45,
      itemType: 'DEEP_DIVE',
      description: 'One major strategic challenge',
      // Rotates based on company phase - see DEEP_DIVE_ROTATION
    },
    {
      sequence: 3,
      title: 'Financial Review',
      titleAr: 'المراجعة المالية',
      allocatedMinutes: 20,
      itemType: 'UPDATE',
      owner: 'CFO',
      description: 'Runway, burn rate, unit economics trends'
    },
    {
      sequence: 4,
      title: 'Resource & Team',
      titleAr: 'الموارد والفريق',
      allocatedMinutes: 20,
      itemType: 'DISCUSSION',
      description: 'Hiring pipeline, org design, capability gaps'
    },
    {
      sequence: 5,
      title: 'Decision Making',
      titleAr: 'اتخاذ القرارات',
      allocatedMinutes: 30,
      itemType: 'DECISION',
      description: 'Formal votes on strategic items'
    },
    {
      sequence: 6,
      title: 'Action Items & Close',
      titleAr: 'المهام والختام',
      allocatedMinutes: 15,
      itemType: 'UPDATE',
      description: 'Assignments with owners and deadlines'
    }
  ]
};

// Deep Dive Topic Rotation for Year 1
const DEEP_DIVE_ROTATION = {
  'Month 1-2': 'Product-Market Fit Validation',
  'Month 3-4': 'Go-to-Market Strategy',
  'Month 5-6': 'Unit Economics & Pricing',
  'Month 7-8': 'Competitive Positioning',
  'Month 9-10': 'Scaling Operations',
  'Month 11-12': 'Fundraising Strategy'
};
```

### 4. Quarterly Board Review (180 minutes) - QTR

```typescript
const QUARTERLY_REVIEW_TEMPLATE = {
  type: 'QUARTERLY',
  duration: 180, // 3 hours
  items: [
    {
      sequence: 1,
      title: 'Big Picture',
      titleAr: 'الصورة الكبيرة',
      allocatedMinutes: 15,
      itemType: 'UPDATE',
      owner: 'CEO',
      description: 'Highlights, lowlights, where help needed'
    },
    {
      sequence: 2,
      title: 'Calibration',
      titleAr: 'المعايرة',
      allocatedMinutes: 60,
      itemType: 'UPDATE',
      description: 'Financial vs forecast, marketing vs targets, product metrics',
      subItems: [
        { title: 'Financial Performance', owner: 'CFO' },
        { title: 'Product & Engineering', owner: 'CTO' },
        { title: 'Marketing & Growth', owner: 'CMO' },
        { title: 'Operations', owner: 'COO' }
      ]
    },
    {
      sequence: 3,
      title: 'Company Building',
      titleAr: 'بناء الشركة',
      allocatedMinutes: 30,
      itemType: 'DISCUSSION',
      description: 'Forward org chart, product roadmap, BD pipeline'
    },
    {
      sequence: 4,
      title: 'Strategic Deep Dives',
      titleAr: 'التعمق الاستراتيجي',
      allocatedMinutes: 60,
      itemType: 'DEEP_DIVE',
      description: '1-2 strategic topics (30 min each)'
    },
    {
      sequence: 5,
      title: 'Closed Session',
      titleAr: 'الجلسة المغلقة',
      allocatedMinutes: 15,
      itemType: 'DISCUSSION',
      description: 'Feedback to leadership, formalities'
    }
  ]
};
```

---

## 📈 KPI SYSTEM

### Company-Level KPIs

```typescript
interface CompanyKPI {
  id: string;
  name: string;
  nameAr: string;
  category: 'FINANCIAL' | 'CUSTOMER' | 'OPERATIONS' | 'TEAM';
  formula: string;
  
  // Targets & Thresholds
  target: number;
  yellowThreshold: number;  // Warning
  redThreshold: number;     // Critical
  
  // Tracking
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY';
  owner: BoardRole;
  
  // Alert configuration
  alertOnYellow: boolean;
  alertOnRed: boolean;
  triggerEmergencyMeeting: boolean;
}

const COMPANY_KPIS: CompanyKPI[] = [
  // Financial
  {
    id: 'gmv_growth',
    name: 'GMV Growth Rate',
    nameAr: 'معدل نمو إجمالي قيمة البضائع',
    category: 'FINANCIAL',
    formula: '(Current GMV - Previous GMV) / Previous GMV * 100',
    target: 20, // 20% MoM
    yellowThreshold: 10,
    redThreshold: 5,
    frequency: 'MONTHLY',
    owner: 'CEO',
    alertOnYellow: true,
    alertOnRed: true,
    triggerEmergencyMeeting: false
  },
  {
    id: 'runway_months',
    name: 'Runway (Months)',
    nameAr: 'المدرج (بالأشهر)',
    category: 'FINANCIAL',
    formula: 'Cash Balance / Monthly Burn Rate',
    target: 18,
    yellowThreshold: 12,
    redThreshold: 6,
    frequency: 'MONTHLY',
    owner: 'CFO',
    alertOnYellow: true,
    alertOnRed: true,
    triggerEmergencyMeeting: true // RED triggers emergency meeting
  },
  {
    id: 'ltv_cac_ratio',
    name: 'LTV:CAC Ratio',
    nameAr: 'نسبة القيمة الدائمة إلى تكلفة الاستحواذ',
    category: 'FINANCIAL',
    formula: 'Customer Lifetime Value / Customer Acquisition Cost',
    target: 3,
    yellowThreshold: 2.5,
    redThreshold: 2,
    frequency: 'MONTHLY',
    owner: 'CFO',
    alertOnYellow: true,
    alertOnRed: true,
    triggerEmergencyMeeting: false
  },
  {
    id: 'burn_rate',
    name: 'Monthly Burn Rate',
    nameAr: 'معدل الحرق الشهري',
    category: 'FINANCIAL',
    formula: 'Starting Cash - Ending Cash',
    target: null, // Track trend, not absolute
    yellowThreshold: null, // 20% above plan
    redThreshold: null, // 30% above plan
    frequency: 'MONTHLY',
    owner: 'CFO',
    alertOnYellow: true,
    alertOnRed: true,
    triggerEmergencyMeeting: false
  },
  
  // Customer
  {
    id: 'nps_score',
    name: 'Net Promoter Score',
    nameAr: 'صافي نقاط الترويج',
    category: 'CUSTOMER',
    formula: '% Promoters - % Detractors',
    target: 50,
    yellowThreshold: 30,
    redThreshold: 0,
    frequency: 'MONTHLY',
    owner: 'CMO',
    alertOnYellow: true,
    alertOnRed: true,
    triggerEmergencyMeeting: false
  },
  {
    id: 'monthly_active_users',
    name: 'Monthly Active Users',
    nameAr: 'المستخدمين النشطين شهرياً',
    category: 'CUSTOMER',
    formula: 'Unique users with activity in 30 days',
    target: null, // Growth target
    yellowThreshold: null,
    redThreshold: null,
    frequency: 'MONTHLY',
    owner: 'CMO',
    alertOnYellow: false,
    alertOnRed: false,
    triggerEmergencyMeeting: false
  },
  {
    id: 'customer_churn',
    name: 'Monthly Churn Rate',
    nameAr: 'معدل فقدان العملاء',
    category: 'CUSTOMER',
    formula: 'Lost Customers / Starting Customers * 100',
    target: 3,
    yellowThreshold: 5,
    redThreshold: 10,
    frequency: 'MONTHLY',
    owner: 'CMO',
    alertOnYellow: true,
    alertOnRed: true,
    triggerEmergencyMeeting: false
  },
  
  // Operations
  {
    id: 'system_uptime',
    name: 'System Uptime',
    nameAr: 'وقت تشغيل النظام',
    category: 'OPERATIONS',
    formula: 'Uptime Hours / Total Hours * 100',
    target: 99.9,
    yellowThreshold: 99.5,
    redThreshold: 99,
    frequency: 'DAILY',
    owner: 'CTO',
    alertOnYellow: true,
    alertOnRed: true,
    triggerEmergencyMeeting: true // System down = emergency
  },
  {
    id: 'on_time_delivery',
    name: 'On-Time Delivery Rate',
    nameAr: 'معدل التوصيل في الوقت المحدد',
    category: 'OPERATIONS',
    formula: 'On-Time Deliveries / Total Deliveries * 100',
    target: 95,
    yellowThreshold: 92,
    redThreshold: 85,
    frequency: 'WEEKLY',
    owner: 'COO',
    alertOnYellow: true,
    alertOnRed: true,
    triggerEmergencyMeeting: false
  },
  {
    id: 'verification_rate',
    name: 'Listing Verification Rate',
    nameAr: 'معدل التحقق من الإعلانات',
    category: 'OPERATIONS',
    formula: 'Verified Listings / Total Listings * 100',
    target: 90,
    yellowThreshold: 80,
    redThreshold: 70,
    frequency: 'WEEKLY',
    owner: 'COO',
    alertOnYellow: true,
    alertOnRed: true,
    triggerEmergencyMeeting: false
  }
];
```

### Executive KPIs

```typescript
// CEO KPIs
const CEO_KPIS = [
  { name: 'Revenue vs Plan', target: '100%', frequency: 'MONTHLY' },
  { name: 'Strategic OKR Achievement', target: '>80%', frequency: 'QUARTERLY' },
  { name: 'Product-Market Fit Score', target: 'NPS >40', frequency: 'MONTHLY' },
  { name: 'Fundraising Progress', target: 'On track', frequency: 'QUARTERLY' },
  { name: 'Employee Engagement', target: '>70%', frequency: 'QUARTERLY' }
];

// CTO KPIs
const CTO_KPIS = [
  { name: 'Release Frequency', target: 'Weekly', frequency: 'WEEKLY' },
  { name: 'System Uptime', target: '99.9%', frequency: 'DAILY' },
  { name: 'MTTR (Mean Time to Recovery)', target: '<4 hours', frequency: 'INCIDENT' },
  { name: 'Code Coverage', target: '>80%', frequency: 'SPRINT' },
  { name: 'Technical Debt Ratio', target: '<20%', frequency: 'MONTHLY' },
  { name: 'Sprint Velocity Trend', target: 'Stable/Improving', frequency: 'SPRINT' }
];

// CFO KPIs
const CFO_KPIS = [
  { name: 'Runway (Months)', target: '>18', frequency: 'MONTHLY' },
  { name: 'Budget vs Actual Variance', target: '<10%', frequency: 'MONTHLY' },
  { name: 'CAC Payback Period', target: '<6 months', frequency: 'MONTHLY' },
  { name: 'Gross Margin', target: '>30%', frequency: 'MONTHLY' },
  { name: 'Revenue Forecast Accuracy', target: '>90%', frequency: 'QUARTERLY' }
];

// CMO KPIs
const CMO_KPIS = [
  { name: 'Customer Acquisition Cost', target: 'Decreasing', frequency: 'MONTHLY' },
  { name: 'Conversion Rate', target: '>2%', frequency: 'WEEKLY' },
  { name: 'Return on Ad Spend', target: '>3:1', frequency: 'WEEKLY' },
  { name: 'Organic Traffic Growth', target: '>10% MoM', frequency: 'MONTHLY' },
  { name: 'Repeat Purchase Rate', target: '>30%', frequency: 'MONTHLY' }
];

// COO KPIs
const COO_KPIS = [
  { name: 'On-Time Delivery Rate', target: '>95%', frequency: 'WEEKLY' },
  { name: 'Order Fulfillment Accuracy', target: '>99%', frequency: 'WEEKLY' },
  { name: 'Customer Support Response Time', target: '<4 hours', frequency: 'DAILY' },
  { name: 'Verification Turnaround', target: '<24 hours', frequency: 'DAILY' },
  { name: 'Partner Satisfaction Score', target: '>80%', frequency: 'MONTHLY' }
];

// CLO KPIs
const CLO_KPIS = [
  { name: 'Legal Compliance Rate', target: '100%', frequency: 'MONTHLY' },
  { name: 'Contract Review Turnaround', target: '<5 days', frequency: 'WEEKLY' },
  { name: 'Active Disputes', target: 'Track & Minimize', frequency: 'MONTHLY' },
  { name: 'Data Privacy Compliance', target: '100%', frequency: 'MONTHLY' },
  { name: 'Legal Spend as % of Revenue', target: '<2%', frequency: 'MONTHLY' }
];
```

---

## 🚨 ALERT SYSTEM

### Alert Configuration

```typescript
interface BoardAlert {
  id: string;
  type: 'RISK' | 'OPPORTUNITY';
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  
  // Trigger
  metric: string;
  condition: 'ABOVE' | 'BELOW' | 'CHANGE';
  threshold: number;
  
  // Response
  action: 'EMERGENCY_MEETING' | 'ADD_TO_AGENDA' | 'NOTIFY_EXECUTIVE' | 'LOG_ONLY';
  notifyRoles: BoardRole[];
  autoScheduleMeeting: boolean;
  meetingWithinHours?: number;
  
  // Message
  titleTemplate: string;
  titleTemplateAr: string;
  descriptionTemplate: string;
}

const RISK_ALERTS: BoardAlert[] = [
  // CRITICAL - Trigger Emergency Meeting
  {
    id: 'runway_critical',
    type: 'RISK',
    priority: 'CRITICAL',
    metric: 'runway_months',
    condition: 'BELOW',
    threshold: 6,
    action: 'EMERGENCY_MEETING',
    notifyRoles: ['CEO', 'CFO'],
    autoScheduleMeeting: true,
    meetingWithinHours: 24,
    titleTemplate: '🚨 CRITICAL: Runway Below 6 Months',
    titleTemplateAr: '🚨 حرج: المدرج أقل من 6 أشهر',
    descriptionTemplate: 'Cash runway has dropped to {value} months. Immediate action required.'
  },
  {
    id: 'system_down',
    type: 'RISK',
    priority: 'CRITICAL',
    metric: 'system_uptime',
    condition: 'BELOW',
    threshold: 99,
    action: 'EMERGENCY_MEETING',
    notifyRoles: ['CEO', 'CTO'],
    autoScheduleMeeting: true,
    meetingWithinHours: 4,
    titleTemplate: '🚨 CRITICAL: System Uptime Critical',
    titleTemplateAr: '🚨 حرج: وقت تشغيل النظام حرج',
    descriptionTemplate: 'System uptime at {value}%. Immediate technical review required.'
  },
  
  // HIGH - Schedule Review Within 72 Hours
  {
    id: 'revenue_miss',
    type: 'RISK',
    priority: 'HIGH',
    metric: 'revenue_vs_plan',
    condition: 'BELOW',
    threshold: 70,
    action: 'ADD_TO_AGENDA',
    notifyRoles: ['CEO', 'CFO', 'CMO'],
    autoScheduleMeeting: false,
    titleTemplate: '⚠️ HIGH: Revenue 30%+ Below Plan',
    titleTemplateAr: '⚠️ عالي: الإيرادات أقل من الخطة بـ 30%+',
    descriptionTemplate: 'Monthly revenue at {value}% of plan. Strategic review needed.'
  },
  {
    id: 'churn_spike',
    type: 'RISK',
    priority: 'HIGH',
    metric: 'customer_churn',
    condition: 'ABOVE',
    threshold: 10,
    action: 'ADD_TO_AGENDA',
    notifyRoles: ['CEO', 'CMO', 'COO'],
    autoScheduleMeeting: false,
    titleTemplate: '⚠️ HIGH: Customer Churn Spike',
    titleTemplateAr: '⚠️ عالي: ارتفاع حاد في فقدان العملاء',
    descriptionTemplate: 'Monthly churn rate at {value}%. Root cause analysis required.'
  },
  
  // MEDIUM - Add to Weekly Agenda
  {
    id: 'nps_decline',
    type: 'RISK',
    priority: 'MEDIUM',
    metric: 'nps_score',
    condition: 'BELOW',
    threshold: 30,
    action: 'ADD_TO_AGENDA',
    notifyRoles: ['CMO', 'COO'],
    autoScheduleMeeting: false,
    titleTemplate: '📊 MEDIUM: NPS Below Target',
    titleTemplateAr: '📊 متوسط: صافي نقاط الترويج أقل من الهدف',
    descriptionTemplate: 'NPS score at {value}. Customer experience review recommended.'
  },
  {
    id: 'delivery_issues',
    type: 'RISK',
    priority: 'MEDIUM',
    metric: 'on_time_delivery',
    condition: 'BELOW',
    threshold: 92,
    action: 'NOTIFY_EXECUTIVE',
    notifyRoles: ['COO'],
    autoScheduleMeeting: false,
    titleTemplate: '📊 MEDIUM: Delivery Performance Declining',
    titleTemplateAr: '📊 متوسط: تراجع أداء التوصيل',
    descriptionTemplate: 'On-time delivery rate at {value}%. Operations review needed.'
  }
];

const OPPORTUNITY_ALERTS: BoardAlert[] = [
  {
    id: 'growth_spike',
    type: 'OPPORTUNITY',
    priority: 'HIGH',
    metric: 'gmv_growth',
    condition: 'ABOVE',
    threshold: 50,
    action: 'ADD_TO_AGENDA',
    notifyRoles: ['CEO', 'CMO', 'CFO'],
    autoScheduleMeeting: false,
    titleTemplate: '🚀 OPPORTUNITY: Exceptional Growth',
    titleTemplateAr: '🚀 فرصة: نمو استثنائي',
    descriptionTemplate: 'GMV growth at {value}%. Consider scaling strategy.'
  },
  {
    id: 'viral_moment',
    type: 'OPPORTUNITY',
    priority: 'HIGH',
    metric: 'organic_signups',
    condition: 'ABOVE',
    threshold: 200, // 200% of normal
    action: 'ADD_TO_AGENDA',
    notifyRoles: ['CEO', 'CMO'],
    autoScheduleMeeting: false,
    titleTemplate: '🚀 OPPORTUNITY: Viral Traction',
    titleTemplateAr: '🚀 فرصة: انتشار فيروسي',
    descriptionTemplate: 'Organic signups at {value}% of normal. Capitalize immediately.'
  },
  {
    id: 'unit_economics_excellent',
    type: 'OPPORTUNITY',
    priority: 'MEDIUM',
    metric: 'ltv_cac_ratio',
    condition: 'ABOVE',
    threshold: 5,
    action: 'ADD_TO_AGENDA',
    notifyRoles: ['CEO', 'CFO', 'CMO'],
    autoScheduleMeeting: false,
    titleTemplate: '🚀 OPPORTUNITY: Strong Unit Economics',
    titleTemplateAr: '🚀 فرصة: اقتصاديات وحدة قوية',
    descriptionTemplate: 'LTV:CAC ratio at {value}. Consider increasing growth investment.'
  }
];
```

---

## ⚖️ DECISION FRAMEWORK

### SPADE Framework Implementation

```typescript
interface BoardDecisionSPADE {
  id: string;
  conversationId: string;
  
  // S - Setting
  setting: {
    question: string;        // What exactly are we deciding?
    questionAr: string;
    deadline: DateTime;      // When must we decide?
    importance: 'TYPE1' | 'TYPE2';
    context: string;
  };
  
  // P - People
  people: {
    responsible: string;     // Who drives the analysis?
    accountable: string;     // Who makes the final call?
    consulted: string[];     // Who provides input?
    informed: string[];      // Who needs to know?
  };
  
  // A - Alternatives
  alternatives: {
    option: string;
    optionAr: string;
    pros: string[];
    cons: string[];
    risks: string[];
    estimatedImpact: string;
    recommendedBy?: string;
  }[];
  
  // D - Decide
  decision: {
    selectedOption: string;
    rationale: string;
    rationaleAr: string;
    dissent?: string;        // Recorded disagreements
    votes?: BoardVote[];
  };
  
  // E - Explain
  explanation: {
    summary: string;
    summaryAr: string;
    communicationPlan: string;
    stakeholdersInformed: string[];
    verbalCommitments: string[];
  };
  
  // Meta
  status: 'SETTING' | 'ANALYZING' | 'DECIDING' | 'DECIDED' | 'COMMUNICATED';
  createdAt: DateTime;
  decidedAt?: DateTime;
  implementedAt?: DateTime;
}
```

### Decision Documentation

```typescript
interface DecisionRecord {
  decisionNumber: string;    // DEC-2025-001
  date: DateTime;
  
  // Core
  decision: string;
  decisionAr: string;
  type: 'STRATEGIC' | 'OPERATIONAL' | 'GOVERNANCE';
  reversibility: 'TYPE1' | 'TYPE2';
  
  // Context
  rationale: string;
  alternativesConsidered: string[];
  assumptions: string[];
  
  // Ownership
  owner: string;
  deadline: DateTime;
  
  // Tracking
  status: 'PROPOSED' | 'APPROVED' | 'IN_PROGRESS' | 'IMPLEMENTED' | 'REVISED' | 'REVERTED';
  outcome?: string;
  lessonsLearned?: string;
  
  // Follow-up
  reviewDate: DateTime;
  linkedMeetingId: string;
}
```

---

## 🔄 MEETING FLOW SERVICE

### Auto-Generate Meetings

```typescript
// src/modules/board/services/meeting-scheduler.service.ts

@Injectable()
export class MeetingSchedulerService {
  
  /**
   * Schedule recurring meetings for the year
   */
  async scheduleYearlyMeetings(year: number) {
    // Daily Standups (Mon-Fri)
    await this.scheduleDailyStandups(year);
    
    // Weekly Ops (Every Sunday)
    await this.scheduleWeeklyMeetings(year);
    
    // Monthly Strategic (First Sunday of each month)
    await this.scheduleMonthlyMeetings(year);
    
    // Quarterly Reviews
    await this.scheduleQuarterlyMeetings(year);
  }
  
  /**
   * Generate agenda for a meeting
   */
  async generateAgenda(meetingId: string) {
    const meeting = await this.getMeeting(meetingId);
    const template = this.getTemplate(meeting.type);
    
    // Auto-populate data-driven items
    const agenda = await this.populateAgenda(template, meeting);
    
    // Add any pending decisions/action items
    agenda.items = await this.addPendingItems(agenda.items, meeting);
    
    return agenda;
  }
  
  /**
   * Trigger emergency meeting from alert
   */
  async triggerEmergencyMeeting(alert: BoardAlert, data: any) {
    const meeting = await this.createMeeting({
      type: 'EMERGENCY',
      triggeredBy: alert.id,
      triggerReason: alert.descriptionTemplate.replace('{value}', data.value),
      scheduledAt: new Date(Date.now() + alert.meetingWithinHours * 60 * 60 * 1000),
    });
    
    // Notify relevant board members
    await this.notifyMembers(alert.notifyRoles, meeting);
    
    // Generate emergency agenda
    await this.generateEmergencyAgenda(meeting, alert);
    
    return meeting;
  }
  
  /**
   * Auto-generate meeting summary
   */
  async generateMeetingSummary(meetingId: string) {
    const meeting = await this.getMeetingWithMessages(meetingId);
    
    const summary = await this.aiMember.generateSummary({
      messages: meeting.conversation.messages,
      decisions: meeting.decisions,
      actionItems: meeting.actionItems,
    });
    
    await this.prisma.boardMeeting.update({
      where: { id: meetingId },
      data: { 
        summary: summary.english,
        summaryAr: summary.arabic,
      },
    });
    
    return summary;
  }
}
```

---

## 📱 UI COMPONENTS

### Meeting Dashboard

```typescript
// Key UI Components to Build:

// 1. Meeting Calendar View
// - Shows all scheduled meetings
// - Color-coded by type (daily/weekly/monthly/quarterly)
// - Emergency meetings highlighted in red
// - Click to view/start meeting

// 2. Active Meeting Interface
// - Timer showing elapsed time vs allocated
// - Current agenda item highlighted
// - Real-time note-taking
// - Decision recording
// - Action item creation

// 3. KPI Dashboard
// - All KPIs with RAG status
// - Trend charts
// - Alert indicators
// - Drill-down capability

// 4. Decision Log
// - Searchable list of all decisions
// - Filter by status, type, owner
// - Link to originating meeting
// - Follow-up tracking

// 5. Action Item Tracker
// - Kanban board (Pending/In Progress/Blocked/Done)
// - Filter by owner, deadline, meeting
// - Overdue items highlighted
// - Progress notes
```

---

## 🚀 IMPLEMENTATION PRIORITY

### Phase 1: Core Meeting System
1. ✅ Meeting schema and types
2. ✅ Agenda templates (Daily, Weekly, Monthly, Quarterly)
3. ✅ Meeting scheduler service
4. ✅ Basic meeting UI

### Phase 2: KPI & Alerts
1. ✅ KPI tracking system
2. ✅ Alert configuration
3. ✅ Emergency meeting triggers
4. ✅ KPI dashboard UI

### Phase 3: Decision Framework
1. ✅ SPADE framework implementation
2. ✅ Decision documentation
3. ✅ Voting system enhancement
4. ✅ Decision log UI

### Phase 4: Automation
1. ✅ Auto-agenda generation
2. ✅ Data-driven agenda population
3. ✅ Meeting summary generation
4. ✅ Action item follow-up reminders

---

## 📝 NOTES FOR CLAUDE CODE

1. **Meeting Numbering:** All meetings must have sequential, type-prefixed IDs (STD-2025-001)

2. **Arabic Support:** All user-facing text needs Arabic translations

3. **Time Zones:** Use Egypt time (Africa/Cairo) for all scheduling

4. **Data Integration:** KPIs should pull from actual Xchange platform data

5. **Alert Testing:** Create test mode to simulate alerts without real data triggers

6. **Founder Override:** Founder can always override any AI decision or recommendation

7. **Audit Trail:** Log all meeting activities, decisions, and changes

---

**🎯 Goal: Build the most sophisticated AI-powered board governance system in the world!**
