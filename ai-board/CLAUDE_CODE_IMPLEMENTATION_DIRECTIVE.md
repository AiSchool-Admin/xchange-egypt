# 🏛️ توجيه Claude Code - بناء مجلس إدارة Xchange الذاتي
## Implementation Directive v2.0

---

# 📋 ملخص المهمة

بناء **مجلس إدارة AI ذاتي** يدير شركة Xchange بالكامل:
- 6 أعضاء AI بشخصيات متكاملة
- اجتماعات يومية ذاتية (10:00 ص + 2:00 م)
- نادية (CTO) تُنفذ القرارات التقنية مباشرة عبر Claude Code
- المؤسس (باشمهندس ممدوح) يعتمد فقط

---

# 📁 الملف المرجعي

**راجع أولاً:** `docs/ai-board/XCHANGE_AI_BOARD_FULL_SPECIFICATION.md`

---

# 🎯 المطلوب بناؤه

## 1️⃣ ملفات التكوين (Config Files)

### شخصيات الأعضاء
```typescript
// src/modules/board/config/board-members.config.ts

export const BOARD_MEMBERS = {
  CEO_KARIM: {
    id: 'ceo-karim',
    name: 'كريم',
    title: 'الرئيس التنفيذي',
    model: 'claude-opus-4-20250514',
    personality: { traits, communicationStyle, decisionMaking, underPressure },
    background: { education, experience, achievements, failures },
    relationships: { withCTO, withCFO, withCMO, withCOO, withCLO },
    withFounder: { addressAs: 'باشمهندس ممدوح', style, updates },
    inMeetings: { role, strengths, phrases[] }
  },
  CTO_NADIA: { /* ... + technicalCapabilities */ },
  CFO_LAILA: { /* ... */ },
  CMO_YOUSSEF: { /* ... */ },
  COO_OMAR: { /* ... */ },
  CLO_HANA: { /* ... */ }
};
```

### مراحل الشركة
```typescript
// src/modules/board/config/company-phases.config.ts

export enum CompanyPhase {
  IDEATION, MVP_DEVELOPMENT, PRE_LAUNCH, LAUNCH,
  EARLY_TRACTION, GROWTH, SCALE, MATURITY
}

export const PHASE_CONTEXTS = {
  MVP_DEVELOPMENT: {
    name: 'تطوير المنتج الأولي',
    boardPriorities: [...],
    relevantKPIs: [...],
    memberFocus: { CEO, CTO, CFO, CMO, COO, CLO }
  },
  // ... باقي المراحل
};
```

### صلاحيات نادية
```typescript
// src/modules/board/config/nadia-permissions.config.ts

export const NADIA_PERMISSIONS = {
  AUTONOMOUS: [
    'READ_CODE', 'ANALYZE_CODE', 'RUN_TESTS',
    'CREATE_BRANCH', 'WRITE_CODE_IN_FEATURE_BRANCH',
    'CREATE_PR', 'GENERATE_DOCUMENTATION'
  ],
  CEO_APPROVAL: [
    'MERGE_TO_DEVELOP', 'ADD_NEW_DEPENDENCY',
    'CHANGE_ARCHITECTURE', 'CREATE_NEW_MODULE'
  ],
  FOUNDER_APPROVAL: [
    'MERGE_TO_MAIN', 'DEPLOY_TO_PRODUCTION',
    'DELETE_DATA', 'MODIFY_SECURITY_SETTINGS'
  ]
};
```

---

## 2️⃣ الخدمات الأساسية (Core Services)

### خدمة الاستخبارات الصباحية
```typescript
// src/modules/board/services/morning-intelligence.service.ts

@Injectable()
export class MorningIntelligenceService {
  
  // كل يوم الساعة 6 صباحاً
  @Cron('0 6 * * *', { timeZone: 'Africa/Cairo' })
  async generateMorningIntelligence(): Promise<MorningIntelligence> {
    // 1. جمع بيانات آخر 24 ساعة
    const platformData = await this.collectPlatformData();
    
    // 2. فحص KPIs
    const kpiSnapshot = await this.kpiService.getSnapshot();
    
    // 3. كشف الانحرافات
    const anomalies = await this.detectAnomalies(platformData);
    
    // 4. تحديد الفرص والتهديدات
    const signals = await this.analyzeSignals(platformData, anomalies);
    
    // 5. توليد الأجندة المقترحة
    const suggestedAgenda = await this.generateAgenda(signals);
    
    return this.prisma.morningIntelligence.create({
      data: { kpiSnapshot, anomalies, opportunities: signals.opportunities,
              threats: signals.threats, suggestedAgenda }
    });
  }
}
```

### خدمة الأجندة الذكية
```typescript
// src/modules/board/services/agenda-intelligence.service.ts

@Injectable()
export class AgendaIntelligenceService {
  
  async generateIntelligentAgenda(params: {
    meetingType: 'MORNING' | 'AFTERNOON' | 'WEEKLY' | 'EMERGENCY';
    date: Date;
    founderOverrides?: AgendaItem[];
  }): Promise<BoardAgenda> {
    
    // 1. جلب السياق
    const phase = await this.getCompanyPhase();
    const intelligence = await this.getMorningIntelligence();
    const pendingItems = await this.getPendingItems();
    
    // 2. تحديد البنود العاجلة
    const urgentItems = this.identifyUrgentItems(intelligence);
    
    // 3. بناء الأجندة حسب المرحلة
    const agenda = await this.buildAgenda({
      meetingType: params.meetingType,
      phase,
      urgentItems,
      founderOverrides: params.founderOverrides
    });
    
    // 4. تخصيص الوقت وتعيين المسؤولين
    return this.finalizeAgenda(agenda);
  }
}
```

### خدمة الاجتماعات الذاتية
```typescript
// src/modules/board/services/autonomous-meeting.service.ts

@Injectable()
export class AutonomousMeetingService {
  
  // الاجتماع الصباحي - 10:00
  @Cron('0 10 * * *', { timeZone: 'Africa/Cairo' })
  async conductMorningMeeting(): Promise<MeetingMinutes> {
    // 1. إنشاء الاجتماع
    const meeting = await this.createMeeting('MORNING');
    
    // 2. توليد الأجندة
    const agenda = await this.agendaService.generateIntelligentAgenda({
      meetingType: 'MORNING',
      date: new Date()
    });
    
    // 3. تنفيذ الاجتماع (AI Discussion)
    const discussion = await this.boardEngine.conductMeeting({
      meeting, agenda,
      innovationMode: true,
      participants: await this.getAllMembers()
    });
    
    // 4. توليد المحضر
    const mom = await this.generateMOM(meeting, discussion);
    
    // 5. إرسال للمؤسس
    await this.sendForApproval(mom);
    
    return mom;
  }
  
  // الاجتماع المسائي - 14:00
  @Cron('0 14 * * *', { timeZone: 'Africa/Cairo' })
  async conductAfternoonMeeting(): Promise<MeetingMinutes> {
    // نفس المنطق مع تركيز على التنفيذ
  }
}
```

### خدمة الاجتماعات الطارئة
```typescript
// src/modules/board/services/emergency-meeting.service.ts

@Injectable()
export class EmergencyMeetingService {
  
  async requestEmergencyMeeting(request: {
    requestedBy: 'FOUNDER';
    reason: string;
    agenda?: AgendaItem[];
    urgency: 'IMMEDIATE' | 'WITHIN_HOUR' | 'WITHIN_4_HOURS';
  }): Promise<EmergencyMeeting> {
    
    // 1. إنشاء الاجتماع
    const meeting = await this.createMeeting({
      type: 'EMERGENCY',
      reason: request.reason,
      urgency: request.urgency,
      innovationMode: true // ⭐ دائماً مُفعّل
    });
    
    // 2. الأجندة
    const agenda = request.agenda || 
                   await this.generateEmergencyAgenda(request.reason);
    
    // 3. إشعار الأعضاء
    await this.notifyAllMembers(meeting);
    
    return meeting;
  }
  
  // توليد محضر فوري أثناء الاجتماع
  async generateLiveMOM(meetingId: string): Promise<MeetingMinutes> {
    const meeting = await this.getMeetingWithConversation(meetingId);
    
    // CEO كريم يصيغ المحضر
    const mom = await this.ceoKarim.generateMOM(meeting);
    
    // إرسال فوري للمؤسس
    await this.sendForImmediateApproval(mom);
    
    return mom;
  }
}
```

### خدمة المسح البيئي
```typescript
// src/modules/board/services/environment-scanner.service.ts

@Injectable()
export class EnvironmentScannerService {
  
  // الأحد والأربعاء الساعة 11 صباحاً
  @Cron('0 11 * * 0,3', { timeZone: 'Africa/Cairo' })
  async performEnvironmentScan(): Promise<EnvironmentScan> {
    
    // استخدام web_search للبحث عن:
    const marketIntel = await this.scanMarketNews();      // أخبار السوق
    const regulatory = await this.scanRegulations();       // التنظيمات
    const techTrends = await this.scanTechNews();         // التقنيات
    const economic = await this.fetchEconomicData();       // الاقتصاد
    const consumer = await this.analyzeConsumerBehavior(); // المستهلك
    
    // تحليل SWOT
    const swot = await this.updateSWOT({
      marketIntel, regulatory, techTrends, economic, consumer
    });
    
    return this.prisma.environmentScan.create({
      data: {
        scanNumber: await this.generateScanNumber(),
        marketIntel, regulatoryWatch: regulatory, techTrends,
        economicData: economic, consumerTrends: consumer,
        swotUpdate: swot, opportunityCards: swot.opportunities,
        threatAlerts: swot.threats
      }
    });
  }
}
```

---

## 3️⃣ نادية - مدير تقني AI كامل ⭐

### تكامل Claude Code
```typescript
// src/modules/board/services/claude-code-integration.service.ts

@Injectable()
export class ClaudeCodeIntegrationService {
  
  private readonly anthropic: Anthropic;
  
  constructor() {
    this.anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    });
  }
  
  async executeTask(task: {
    prompt: string;
    workingDirectory: string;
    tools?: string[];
  }): Promise<ExecutionResult> {
    
    const response = await this.anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      tools: [
        {
          name: 'create_file',
          description: 'Create a new file',
          input_schema: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              content: { type: 'string' }
            }
          }
        },
        {
          name: 'str_replace',
          description: 'Replace text in file',
          input_schema: {
            type: 'object',
            properties: {
              path: { type: 'string' },
              old_str: { type: 'string' },
              new_str: { type: 'string' }
            }
          }
        },
        {
          name: 'bash',
          description: 'Run bash command',
          input_schema: {
            type: 'object',
            properties: { command: { type: 'string' } }
          }
        },
        {
          name: 'view',
          description: 'View file contents',
          input_schema: {
            type: 'object',
            properties: { path: { type: 'string' } }
          }
        }
      ],
      messages: [{ role: 'user', content: task.prompt }]
    });
    
    return this.processResponse(response);
  }
}
```

### خدمة نادية CTO Agent
```typescript
// src/modules/board/services/nadia-cto-agent.service.ts

@Injectable()
export class NadiaCTOAgentService {
  
  constructor(
    private readonly claudeCode: ClaudeCodeIntegrationService,
    private readonly prisma: PrismaService
  ) {}
  
  /**
   * تنفيذ قرار تقني من المجلس
   */
  async executeBoardDecision(decision: BoardDecision): Promise<ExecutionReport> {
    
    // 1. تحليل القرار وإنشاء خطة
    const plan = await this.createExecutionPlan(decision);
    
    // 2. التحقق من الصلاحيات
    await this.checkPermissions(plan);
    
    // 3. تنفيذ المهام
    const results = [];
    for (const task of plan.tasks) {
      const result = await this.executeTask(task);
      results.push(result);
      await this.updateProgress(decision.id, task.id, result);
    }
    
    // 4. إنشاء PR
    const pr = await this.createPullRequest(decision, results);
    
    // 5. تقرير النتائج
    return this.generateReport(decision, results, pr);
  }
  
  /**
   * تنفيذ مهمة واحدة
   */
  private async executeTask(task: TechnicalTask): Promise<TaskResult> {
    
    const prompt = `
أنا نادية، المدير التقني لـ Xchange.

المهمة: ${task.title}
الوصف: ${task.description}
الملفات: ${task.files.join(', ')}

سياق المشروع:
- Framework: NestJS + Next.js
- Database: PostgreSQL + Prisma
- Language: TypeScript

المتطلبات:
${task.requirements.join('\n')}

نفذ هذه المهمة بجودة عالية.
    `;
    
    return this.claudeCode.executeTask({
      prompt,
      workingDirectory: '/xchange-egypt'
    });
  }
  
  /**
   * بناء ميزة جديدة
   */
  async buildFeature(feature: {
    name: string;
    description: string;
    requirements: string[];
  }): Promise<FeatureBuildReport> {
    
    // 1. تصميم المعمارية
    const architecture = await this.designArchitecture(feature);
    
    // 2. تقسيم لمهام
    const tasks = await this.breakdownToTasks(architecture);
    
    // 3. تنفيذ
    const results = [];
    for (const task of tasks) {
      results.push(await this.executeTask(task));
    }
    
    // 4. اختبارات
    await this.runTests();
    
    // 5. توثيق
    await this.generateDocumentation(feature);
    
    return { feature, architecture, tasks, results };
  }
  
  /**
   * إصلاح مشكلة
   */
  async fixIssue(issue: {
    title: string;
    description: string;
    errorLogs?: string;
  }): Promise<FixReport> {
    
    // 1. تحليل
    const analysis = await this.analyzeIssue(issue);
    
    // 2. حل
    const solution = await this.determineSolution(analysis);
    
    // 3. تنفيذ
    const fix = await this.claudeCode.executeTask({
      prompt: `إصلاح: ${issue.title}\nالتحليل: ${analysis.summary}\nالحل: ${solution.description}`
    });
    
    // 4. اختبار
    const testResult = await this.runTests();
    
    return { issue, analysis, solution, fix, testResult };
  }
}
```

---

## 4️⃣ Controllers و APIs

### لوحة تحكم المؤسس
```typescript
// src/modules/board/controllers/founder-command.controller.ts

@Controller('board/founder')
export class FounderCommandController {
  
  @Get('dashboard')
  async getDashboard(): Promise<FounderDashboard> {
    return {
      quickSummary: await this.getSummary(),
      kpis: await this.getKPISnapshot(),
      todayMeetings: await this.getTodayMeetings(),
      pendingApprovals: await this.getPendingApprovals(),
      recentDecisions: await this.getRecentDecisions()
    };
  }
  
  @Get('meetings/:id/agenda')
  async getAgenda(@Param('id') meetingId: string) {}
  
  @Put('meetings/:id/agenda')
  async updateAgenda(@Param('id') id: string, @Body() updates: AgendaUpdate) {}
  
  @Post('emergency-meeting')
  async requestEmergencyMeeting(@Body() request: EmergencyMeetingDto) {}
  
  @Post('meetings/:id/request-live-mom')
  async requestLiveMOM(@Param('id') meetingId: string) {}
  
  @Post('moms/:id/approve')
  async approveMOM(@Param('id') momId: string, @Body() approval: ApprovalDto) {}
  
  @Put('company-phase')
  async setCompanyPhase(@Body() params: { phase: CompanyPhase; reason: string }) {}
  
  @Get('records/search')
  async searchRecords(@Query() query: RecordSearchQuery) {}
}
```

### نادية CTO Controller
```typescript
// src/modules/board/controllers/nadia-cto.controller.ts

@Controller('board/cto')
export class NadiaCTOController {
  
  @Post('execute-decision/:id')
  async executeDecision(@Param('id') decisionId: string) {}
  
  @Post('build-feature')
  async buildFeature(@Body() feature: BuildFeatureDto) {}
  
  @Post('fix-issue')
  async fixIssue(@Body() issue: FixIssueDto) {}
  
  @Get('execution/:id/status')
  async getExecutionStatus(@Param('id') executionId: string) {}
  
  @Get('daily-report')
  async getDailyReport() {}
  
  @Get('system-health')
  async getSystemHealth() {}
  
  @Post('execution/:id/ceo-approve')
  async ceoApprove(@Param('id') executionId: string) {}
  
  @Post('execution/:id/founder-approve')
  async founderApprove(@Param('id') executionId: string) {}
}
```

---

## 5️⃣ Cron Jobs

```typescript
// src/modules/board/cron/board.cron.ts

@Injectable()
export class BoardCronService {
  
  // 06:00 - تقرير الاستخبارات الصباحية
  @Cron('0 6 * * *', { timeZone: 'Africa/Cairo' })
  async morningIntelligence() {
    await this.morningIntelligenceService.generate();
  }
  
  // 10:00 - الاجتماع الصباحي
  @Cron('0 10 * * *', { timeZone: 'Africa/Cairo' })
  async morningMeeting() {
    await this.autonomousMeetingService.conductMorningMeeting();
  }
  
  // 11:00 (الأحد والأربعاء) - المسح البيئي
  @Cron('0 11 * * 0,3', { timeZone: 'Africa/Cairo' })
  async environmentScan() {
    await this.environmentScannerService.performScan();
  }
  
  // 14:00 - الاجتماع المسائي
  @Cron('0 14 * * *', { timeZone: 'Africa/Cairo' })
  async afternoonMeeting() {
    await this.autonomousMeetingService.conductAfternoonMeeting();
  }
  
  // 18:00 - تقرير الإغلاق اليومي
  @Cron('0 18 * * *', { timeZone: 'Africa/Cairo' })
  async dailyClosingReport() {
    await this.reportService.generateDailyClosing();
  }
}
```

---

## 6️⃣ Database Schema

أضف للـ `prisma/schema.prisma`:

```prisma
// راجع XCHANGE_AI_BOARD_FULL_SPECIFICATION.md للـ Schema الكامل

// الأهم:
model CompanyPhaseHistory { ... }
model BoardMeeting { ... }
model BoardAgenda { ... }
model MeetingMinutes { ... }
model EmergencyMeetingRequest { ... }
model BoardDecision { ... }
model ActionItem { ... }
model TechnicalExecution { ... }
model CodeChangeLog { ... }
model EnvironmentScan { ... }
model MorningIntelligence { ... }
```

---

# 📁 هيكل الملفات

```
src/modules/board/
├── config/
│   ├── board-members.config.ts
│   ├── company-phases.config.ts
│   └── nadia-permissions.config.ts
├── services/
│   ├── morning-intelligence.service.ts
│   ├── agenda-intelligence.service.ts
│   ├── autonomous-meeting.service.ts
│   ├── emergency-meeting.service.ts
│   ├── environment-scanner.service.ts
│   ├── claude-code-integration.service.ts
│   ├── nadia-cto-agent.service.ts
│   ├── mom-generator.service.ts
│   ├── approval-workflow.service.ts
│   └── record-management.service.ts
├── controllers/
│   ├── founder-command.controller.ts
│   ├── nadia-cto.controller.ts
│   └── board-meetings.controller.ts
├── cron/
│   └── board.cron.ts
├── entities/
│   └── *.entity.ts
├── dto/
│   └── *.dto.ts
└── board.module.ts
```

---

# 🚀 أولوية التنفيذ

## المرحلة 1: الأساسيات
1. ✅ Config files (الشخصيات، المراحل، الصلاحيات)
2. ✅ Prisma Schema
3. ✅ MorningIntelligenceService
4. ✅ AgendaIntelligenceService

## المرحلة 2: الاجتماعات
1. ✅ AutonomousMeetingService
2. ✅ EmergencyMeetingService
3. ✅ MOMGeneratorService
4. ✅ BoardCronService

## المرحلة 3: نادية CTO
1. ✅ ClaudeCodeIntegrationService
2. ✅ NadiaCTOAgentService
3. ✅ NadiaCTOController

## المرحلة 4: المؤسس
1. ✅ FounderCommandController
2. ✅ ApprovalWorkflowService
3. ✅ RecordManagementService

---

# ⚙️ ملاحظات مهمة

| الملاحظة | القيمة |
|----------|--------|
| **اسم المؤسس** | باشمهندس ممدوح |
| **المرحلة الحالية** | MVP_DEVELOPMENT |
| **Timezone** | Africa/Cairo |
| **CEO Model** | claude-opus-4-20250514 |
| **باقي الأعضاء** | claude-sonnet-4-20250514 |
| **الإبداع في الطوارئ** | دائماً مُفعّل |
| **النشر للـ Production** | يحتاج موافقة المؤسس |

---

# ✅ معايير النجاح

1. **الاجتماعات تعمل ذاتياً** - 10:00 و 14:00 يومياً
2. **المحاضر تُرسل للمؤسس** - خلال 15 دقيقة من نهاية الاجتماع
3. **نادية تُنفذ القرارات** - كتابة كود فعلي عبر Claude Code
4. **الأجندات ذكية** - تتكيف مع المرحلة والبيانات
5. **الاجتماعات الطارئة** - تعمل في أي وقت
6. **السجلات مُرقمة** - نظام ترقيم موحد

---

**🎯 الهدف: مجلس إدارة AI يدير Xchange 24/7 وباشمهندس ممدوح يعتمد فقط!**
