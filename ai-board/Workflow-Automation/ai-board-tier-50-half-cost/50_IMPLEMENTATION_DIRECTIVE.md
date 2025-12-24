# 💫 توجيه التنفيذ - المرحلة 50%
## Tier 50: Half-Cost Implementation Directive

---

# 🎯 الهدف

بناء نظام مجلس إدارة AI **نصف آلي** مع:
- Claude API للذكاء
- APIs أساسية للتكامل
- Cron Jobs للأتمتة
- Dashboard بسيط

---

# 📁 هيكل المشروع

```
xchange-ai-board/
├── src/
│   ├── modules/
│   │   ├── board/
│   │   │   ├── services/
│   │   │   │   ├── board-meeting.service.ts
│   │   │   │   ├── claude-ai.service.ts
│   │   │   │   ├── daily-report.service.ts
│   │   │   │   └── members/
│   │   │   │       ├── ceo-karim.service.ts
│   │   │   │       ├── cto-nadia.service.ts
│   │   │   │       ├── cmo-youssef.service.ts
│   │   │   │       ├── coo-omar.service.ts
│   │   │   │       ├── cfo-laila.service.ts
│   │   │   │       └── clo-hana.service.ts
│   │   │   ├── cron/
│   │   │   │   └── board.cron.ts
│   │   │   ├── controllers/
│   │   │   │   └── board.controller.ts
│   │   │   └── board.module.ts
│   │   │
│   │   ├── integrations/
│   │   │   ├── bosta/
│   │   │   │   └── bosta.service.ts
│   │   │   ├── paymob/
│   │   │   │   └── paymob.service.ts
│   │   │   ├── sendgrid/
│   │   │   │   └── sendgrid.service.ts
│   │   │   └── buffer/
│   │   │       └── buffer.service.ts
│   │   │
│   │   └── dashboard/
│   │       └── dashboard.service.ts
│   │
│   └── app.module.ts
│
├── prisma/
│   └── schema.prisma
│
└── package.json
```

---

# 🛠️ الخدمات الأساسية

## 1. Claude AI Service

```typescript
// src/modules/board/services/claude-ai.service.ts

import Anthropic from '@anthropic-ai/sdk';

@Injectable()
export class ClaudeAIService {
  private client: Anthropic;
  
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  
  async chat(params: {
    systemPrompt: string;
    userMessage: string;
    maxTokens?: number;
  }): Promise<string> {
    const response = await this.client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: params.maxTokens || 4000,
      system: params.systemPrompt,
      messages: [{ role: 'user', content: params.userMessage }]
    });
    
    return response.content[0].type === 'text' 
      ? response.content[0].text 
      : '';
  }
  
  async boardMeeting(params: {
    type: 'MORNING' | 'AFTERNOON';
    data: any;
  }): Promise<BoardMeetingResult> {
    const systemPrompt = this.getBoardSystemPrompt();
    const userMessage = this.buildMeetingPrompt(params);
    
    const response = await this.chat({
      systemPrompt,
      userMessage,
      maxTokens: 8000
    });
    
    return this.parseMeetingResponse(response);
  }
  
  private getBoardSystemPrompt(): string {
    return `
أنتم مجلس إدارة Xchange Egypt:

## الأعضاء:
- كريم (CEO): قائد، حاسم، يجمع الآراء ويقرر
- نادية (CTO): دقيقة، منطقية، تقنية
- يوسف (CMO): مبدع، متحمس، Growth Hacker
- عمر (COO): عملي، منظم، يحل المشاكل
- ليلى (CFO): محافظة، دقيقة، تحمي الـ Runway
- هنا (CLO): حذرة، شاملة، تحمي الشركة

## القواعد:
1. كل عضو يتحدث بشخصيته
2. خاطبوا المؤسس بـ "باشمهندس ممدوح"
3. قرارات واضحة ومهام محددة
4. إبداع في كل اجتماع
    `;
  }
}
```

## 2. Board Meeting Service

```typescript
// src/modules/board/services/board-meeting.service.ts

@Injectable()
export class BoardMeetingService {
  constructor(
    private readonly claude: ClaudeAIService,
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
    private readonly email: SendGridService
  ) {}
  
  async conductMorningMeeting(): Promise<MeetingMinutes> {
    // 1. جمع البيانات
    const data = await this.gatherMeetingData();
    
    // 2. توليد الأجندة
    const agenda = await this.generateAgenda('MORNING', data);
    
    // 3. عقد الاجتماع (Claude)
    const discussion = await this.claude.boardMeeting({
      type: 'MORNING',
      data: { ...data, agenda }
    });
    
    // 4. حفظ المحضر
    const meeting = await this.prisma.boardMeeting.create({
      data: {
        type: 'MORNING',
        date: new Date(),
        agenda,
        minutes: discussion.minutes,
        decisions: discussion.decisions,
        status: 'COMPLETED'
      }
    });
    
    // 5. إرسال للمؤسس
    await this.email.sendMeetingMinutes({
      to: process.env.FOUNDER_EMAIL,
      meeting
    });
    
    return meeting;
  }
  
  async conductAfternoonMeeting(): Promise<MeetingMinutes> {
    // نفس المنطق مع تركيز على التنفيذ
  }
  
  private async gatherMeetingData() {
    const [metrics, orders, issues, campaigns] = await Promise.all([
      this.metrics.getYesterdayMetrics(),
      this.prisma.order.findMany({ where: { status: 'PENDING' } }),
      this.prisma.issue.findMany({ where: { status: 'OPEN' } }),
      this.prisma.campaign.findMany({ where: { status: 'ACTIVE' } })
    ]);
    
    return { metrics, orders, issues, campaigns };
  }
}
```

## 3. Cron Jobs

```typescript
// src/modules/board/cron/board.cron.ts

@Injectable()
export class BoardCronService {
  constructor(
    private readonly meetingService: BoardMeetingService,
    private readonly reportService: DailyReportService
  ) {}
  
  // الاجتماع الصباحي - 9:00 صباحاً
  @Cron('0 9 * * *', { timeZone: 'Africa/Cairo' })
  async morningMeeting() {
    console.log('🏛️ Starting morning meeting...');
    await this.meetingService.conductMorningMeeting();
  }
  
  // الاجتماع المسائي - 2:00 مساءً
  @Cron('0 14 * * *', { timeZone: 'Africa/Cairo' })
  async afternoonMeeting() {
    console.log('🏛️ Starting afternoon meeting...');
    await this.meetingService.conductAfternoonMeeting();
  }
  
  // جمع البيانات - 6:00 صباحاً
  @Cron('0 6 * * *', { timeZone: 'Africa/Cairo' })
  async collectDailyData() {
    console.log('📊 Collecting daily data...');
    await this.reportService.collectAndSaveMetrics();
  }
  
  // التقرير اليومي - 6:00 مساءً
  @Cron('0 18 * * *', { timeZone: 'Africa/Cairo' })
  async dailyReport() {
    console.log('📋 Generating daily report...');
    await this.reportService.generateAndSendDailyReport();
  }
}
```

## 4. Bosta Integration

```typescript
// src/modules/integrations/bosta/bosta.service.ts

@Injectable()
export class BostaService {
  private readonly apiUrl = 'https://app.bosta.co/api/v2';
  
  constructor(private readonly http: HttpService) {}
  
  async createShipment(params: {
    pickupAddress: Address;
    deliveryAddress: Address;
    items: Item[];
    cod?: number;
  }): Promise<Shipment> {
    const response = await this.http.post(
      `${this.apiUrl}/deliveries`,
      {
        type: params.cod ? 'CASH_COLLECTION' : 'DELIVERY',
        specs: { packageDetails: { itemsCount: params.items.length } },
        dropOffAddress: params.deliveryAddress,
        pickupAddress: params.pickupAddress,
        cod: params.cod,
        businessReference: `XCH-${Date.now()}`
      },
      {
        headers: { Authorization: `Bearer ${process.env.BOSTA_API_KEY}` }
      }
    );
    
    return response.data;
  }
  
  async trackShipment(trackingNumber: string): Promise<TrackingInfo> {
    const response = await this.http.get(
      `${this.apiUrl}/deliveries/${trackingNumber}`,
      {
        headers: { Authorization: `Bearer ${process.env.BOSTA_API_KEY}` }
      }
    );
    
    return response.data;
  }
  
  async getDeliveryReport(date: Date): Promise<DeliveryReport> {
    // جلب تقرير التوصيل اليومي
  }
}
```

## 5. Member Services Examples

```typescript
// src/modules/board/services/members/cmo-youssef.service.ts

@Injectable()
export class CMOYoussefService {
  constructor(
    private readonly claude: ClaudeAIService,
    private readonly buffer: BufferService
  ) {}
  
  async generateWeeklyContent(): Promise<ContentPlan> {
    const prompt = `
أنت يوسف، مدير التسويق لـ Xchange.
أنشئ خطة محتوى للأسبوع القادم:
- 7 منشورات (1/يوم)
- لـ Facebook و Instagram
- باللغة العربية المصرية
- تركيز على: [الفئة المستهدفة]

لكل منشور أعطني:
1. النص
2. نوع الصورة المطلوبة
3. أفضل وقت للنشر
4. الهاشتاجات
    `;
    
    const response = await this.claude.chat({
      systemPrompt: 'أنت يوسف، مدير تسويق مبدع ومتحمس',
      userMessage: prompt
    });
    
    return this.parseContentPlan(response);
  }
  
  async scheduleContent(content: ContentPlan): Promise<void> {
    for (const post of content.posts) {
      await this.buffer.schedulePost({
        text: post.text,
        media: post.mediaUrl,
        scheduledAt: post.scheduledAt,
        profiles: ['facebook', 'instagram']
      });
    }
  }
  
  async getMarketingReport(): Promise<MarketingReport> {
    // تحليل أداء التسويق
  }
}
```

---

# 📊 Database Schema

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ═══════════════════════════════════════════════════════════════
// Board Meetings
// ═══════════════════════════════════════════════════════════════

model BoardMeeting {
  id          String      @id @default(uuid())
  type        MeetingType
  date        DateTime
  agenda      Json
  minutes     Json
  decisions   Json
  tasks       Task[]
  status      String      @default("COMPLETED")
  createdAt   DateTime    @default(now())
}

enum MeetingType {
  MORNING
  AFTERNOON
  EMERGENCY
  WEEKLY
}

model Task {
  id          String       @id @default(uuid())
  meetingId   String?
  meeting     BoardMeeting? @relation(fields: [meetingId], references: [id])
  title       String
  description String?
  assignedTo  BoardMember
  priority    Priority     @default(MEDIUM)
  status      TaskStatus   @default(PENDING)
  dueDate     DateTime
  completedAt DateTime?
  createdAt   DateTime     @default(now())
}

enum BoardMember {
  CEO
  CTO
  CMO
  COO
  CFO
  CLO
}

enum Priority {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}

enum TaskStatus {
  PENDING
  IN_PROGRESS
  COMPLETED
  CANCELLED
}

// ═══════════════════════════════════════════════════════════════
// Metrics
// ═══════════════════════════════════════════════════════════════

model DailyMetrics {
  id            String   @id @default(uuid())
  date          DateTime @unique
  revenue       Float
  expenses      Float
  orders        Int
  newCustomers  Int
  activeUsers   Int
  issues        Int
  avgRating     Float?
  createdAt     DateTime @default(now())
}

// ═══════════════════════════════════════════════════════════════
// Marketing
// ═══════════════════════════════════════════════════════════════

model MarketingCampaign {
  id            String   @id @default(uuid())
  name          String
  platform      String
  objective     String
  status        String
  budget        Float
  spend         Float    @default(0)
  reach         Int      @default(0)
  clicks        Int      @default(0)
  conversions   Int      @default(0)
  startDate     DateTime
  endDate       DateTime?
  createdAt     DateTime @default(now())
}

model ScheduledPost {
  id            String   @id @default(uuid())
  platform      String
  content       String
  mediaUrl      String?
  scheduledAt   DateTime
  publishedAt   DateTime?
  status        String   @default("SCHEDULED")
  engagement    Json?
  createdAt     DateTime @default(now())
}

// ═══════════════════════════════════════════════════════════════
// Operations
// ═══════════════════════════════════════════════════════════════

model Shipment {
  id              String   @id @default(uuid())
  orderId         String
  trackingNumber  String   @unique
  carrier         String   @default("BOSTA")
  status          String
  pickupAddress   Json
  deliveryAddress Json
  cod             Float?
  shippedAt       DateTime?
  deliveredAt     DateTime?
  createdAt       DateTime @default(now())
}

model CustomerIssue {
  id            String   @id @default(uuid())
  customerId    String
  orderId       String?
  type          String
  description   String
  priority      Priority @default(MEDIUM)
  status        String   @default("OPEN")
  assignedTo    String?
  resolution    String?
  resolvedAt    DateTime?
  createdAt     DateTime @default(now())
}
```

---

# 🔌 Environment Variables

```env
# .env

# Database
DATABASE_URL="postgresql://user:pass@host:5432/xchange_board"

# Claude API
ANTHROPIC_API_KEY="sk-ant-..."

# Bosta
BOSTA_API_KEY="your_bosta_api_key"

# Paymob
PAYMOB_API_KEY="your_paymob_api_key"

# SendGrid
SENDGRID_API_KEY="SG...."
FOUNDER_EMAIL="mamdouh@xchange.com"

# Buffer
BUFFER_ACCESS_TOKEN="your_buffer_token"

# App
NODE_ENV="production"
PORT=3000
```

---

# 🚀 أوامر التنفيذ

```bash
# 1. إنشاء المشروع
npx @nestjs/cli new xchange-ai-board

# 2. تثبيت الحزم
npm install @anthropic-ai/sdk @prisma/client
npm install @nestjs/schedule @nestjs/config
npm install @sendgrid/mail axios

# 3. إعداد Prisma
npx prisma init
npx prisma migrate dev --name init
npx prisma generate

# 4. تشغيل التطوير
npm run start:dev

# 5. النشر
npm run build
```

---

# ✅ Checklist التنفيذ

## الأسبوع 1
- [ ] إنشاء مشروع NestJS
- [ ] إعداد PostgreSQL
- [ ] تكامل Claude API
- [ ] إنشاء ClaudeAIService

## الأسبوع 2
- [ ] إنشاء BoardMeetingService
- [ ] إعداد Cron Jobs
- [ ] تكامل SendGrid
- [ ] تكامل Bosta

## الأسبوع 3
- [ ] إنشاء Member Services
- [ ] تكامل Buffer
- [ ] Dashboard بسيط

## الأسبوع 4
- [ ] اختبار شامل
- [ ] نشر على Vercel
- [ ] توثيق

---

**🎯 المرحلة 50% = أساس قوي للأتمتة!**
