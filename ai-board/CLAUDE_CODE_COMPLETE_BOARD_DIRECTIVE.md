# 🏛️ توجيه Claude Code - إكمال مجلس الإدارة ذاتي التنفيذ
## Complete Self-Executing Board Implementation - v3.0
## التكلفة: $100/شهر (Claude Pro Max)

---

# 📊 حالة المشروع الحالية

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  ✅ مكتمل (من الإصدار السابق):                                             │
│  ══════════════════════════════                                             │
│  • كريم (CEO) - القيادة والاجتماعات                                        │
│  • نادية (CTO) - القيادة + التنفيذ التقني الكامل                           │
│  • نظام الاجتماعات (صباحي/مسائي/طوارئ)                                     │
│  • Database Schema للمجلس                                                   │
│  • APIs للمؤسس ونادية                                                       │
│                                                                             │
│  ❌ المطلوب إكماله (هذا التوجيه):                                          │
│  ══════════════════════════════════                                         │
│  • يوسف (CMO) - نظام تنفيذ ذاتي للتسويق                                    │
│  • عمر (COO) - نظام تنفيذ ذاتي للعمليات                                    │
│  • ليلى (CFO) - نظام تنفيذ ذاتي للمالية                                    │
│  • هنا (CLO) - نظام تنفيذ ذاتي للقانوني                                    │
│                                                                             │
│  🎯 الهدف النهائي:                                                         │
│  ══════════════════                                                         │
│  • القيادة الذاتية: 100%                                                   │
│  • التنفيذ الذاتي: 85%+                                                    │
│  • وقت المؤسس: 30-45 دقيقة/يوم                                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# 📁 الملفات المرجعية

**اقرأها أولاً:**
1. `docs/ai-board/XCHANGE_AI_BOARD_FULL_SPECIFICATION.md` - المواصفات الكاملة
2. `docs/ai-board/CLAUDE_CODE_IMPLEMENTATION_DIRECTIVE.md` - التوجيه السابق

---

# 🎯 المطلوب بناؤه

## هيكل الملفات الجديدة

```
src/modules/board/
├── config/
│   ├── board-members.config.ts        ✅ موجود
│   ├── company-phases.config.ts       ✅ موجود
│   ├── nadia-permissions.config.ts    ✅ موجود
│   ├── youssef-permissions.config.ts  🆕 جديد
│   ├── omar-permissions.config.ts     🆕 جديد
│   ├── laila-permissions.config.ts    🆕 جديد
│   └── hana-permissions.config.ts     🆕 جديد
│
├── services/
│   ├── agents/
│   │   ├── nadia-cto-agent.service.ts     ✅ موجود
│   │   ├── youssef-cmo-agent.service.ts   🆕 جديد
│   │   ├── omar-coo-agent.service.ts      🆕 جديد
│   │   ├── laila-cfo-agent.service.ts     🆕 جديد
│   │   └── hana-clo-agent.service.ts      🆕 جديد
│   │
│   ├── execution/
│   │   ├── marketing-execution.service.ts 🆕 جديد
│   │   ├── operations-execution.service.ts 🆕 جديد
│   │   ├── finance-execution.service.ts   🆕 جديد
│   │   └── legal-execution.service.ts     🆕 جديد
│   │
│   └── ... (الخدمات الموجودة)
│
├── controllers/
│   ├── youssef-cmo.controller.ts      🆕 جديد
│   ├── omar-coo.controller.ts         🆕 جديد
│   ├── laila-cfo.controller.ts        🆕 جديد
│   └── hana-clo.controller.ts         🆕 جديد
│
└── cron/
    └── board.cron.ts                  📝 تحديث
```

---

# 📱 يوسف (CMO) - نظام التسويق ذاتي التنفيذ

## 1️⃣ صلاحيات يوسف

```typescript
// src/modules/board/config/youssef-permissions.config.ts

export const YOUSSEF_PERMISSIONS = {
  
  // ✅ ذاتي (بدون موافقة)
  AUTONOMOUS: [
    'CREATE_CONTENT',           // كتابة المحتوى
    'GENERATE_AD_COPY',         // نصوص الإعلانات
    'ANALYZE_COMPETITORS',      // تحليل المنافسين
    'SEO_OPTIMIZATION',         // تحسين SEO
    'KEYWORD_RESEARCH',         // بحث الكلمات المفتاحية
    'CREATE_SOCIAL_POSTS',      // منشورات السوشيال
    'GENERATE_EMAIL_CAMPAIGNS', // حملات البريد
    'CREATE_LANDING_PAGES',     // صفحات هبوط
    'ANALYZE_MARKETING_DATA',   // تحليل البيانات
    'CREATE_REPORTS',           // إنشاء التقارير
    'UPDATE_CONTENT_CALENDAR',  // تحديث التقويم
  ],
  
  // ⚠️ موافقة CEO (كريم)
  CEO_APPROVAL: [
    'LAUNCH_CAMPAIGN_UNDER_5K',  // حملة < 5,000 ج.م
    'CHANGE_BRAND_VOICE',        // تغيير صوت العلامة
    'NEW_MARKETING_CHANNEL',     // قناة تسويق جديدة
    'PARTNERSHIP_OUTREACH',      // تواصل للشراكات
  ],
  
  // 👑 موافقة باشمهندس ممدوح
  FOUNDER_APPROVAL: [
    'LAUNCH_CAMPAIGN_OVER_5K',   // حملة > 5,000 ج.م
    'CHANGE_BRAND_IDENTITY',     // تغيير الهوية
    'MAJOR_REBRAND',             // إعادة تسمية
    'INFLUENCER_DEAL_OVER_10K',  // صفقة مؤثر > 10K
    'TV_RADIO_ADS',              // إعلانات تلفزيون/راديو
  ]
};

export const YOUSSEF_CAPABILITIES = {
  contentGeneration: {
    socialPosts: true,
    blogArticles: true,
    adCopy: true,
    emailCampaigns: true,
    landingPages: true,
    productDescriptions: true,
  },
  analysis: {
    competitorAnalysis: true,
    marketResearch: true,
    campaignPerformance: true,
    audienceInsights: true,
    trendAnalysis: true,
  },
  automation: {
    contentCalendar: true,
    postScheduling: true,  // يُجهز، المؤسس ينشر
    reportGeneration: true,
    a_bTestSuggestions: true,
  }
};
```

## 2️⃣ خدمة يوسف Agent

```typescript
// src/modules/board/services/agents/youssef-cmo-agent.service.ts

import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { ClaudeService } from '@/claude/claude.service';
import { YOUSSEF_PERMISSIONS, YOUSSEF_CAPABILITIES } from '../config/youssef-permissions.config';

@Injectable()
export class YoussefCMOAgentService {
  private readonly logger = new Logger('YoussefCMO');
  
  constructor(
    private readonly prisma: PrismaService,
    private readonly claude: ClaudeService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════
  // إنشاء المحتوى
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * إنشاء حزمة المحتوى اليومية
   * يُشغل تلقائياً الساعة 7 صباحاً
   */
  async generateDailyContentPackage(): Promise<DailyContentPackage> {
    this.logger.log('🎯 يوسف: بدء إعداد حزمة المحتوى اليومية');
    
    // 1. جلب السياق
    const context = await this.getMarketingContext();
    const calendar = await this.getContentCalendar();
    const trends = await this.getTodayTrends();
    
    // 2. توليد المحتوى عبر Claude
    const contentPrompt = this.buildContentPrompt(context, calendar, trends);
    const generatedContent = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt: contentPrompt,
      systemPrompt: this.getYoussefPersonality(),
    });
    
    // 3. تنظيم المحتوى
    const package_: DailyContentPackage = {
      date: new Date(),
      posts: this.parseGeneratedPosts(generatedContent),
      stories: this.parseGeneratedStories(generatedContent),
      adCopy: this.parseAdCopy(generatedContent),
      hashtags: this.extractHashtags(generatedContent),
      bestTimes: this.calculateBestTimes(),
      status: 'READY_FOR_REVIEW',
    };
    
    // 4. حفظ في قاعدة البيانات
    await this.prisma.contentPackage.create({ data: package_ });
    
    // 5. إنشاء الملفات
    await this.createContentFiles(package_);
    
    this.logger.log('✅ يوسف: حزمة المحتوى جاهزة');
    return package_;
  }

  /**
   * إنشاء منشور سوشيال ميديا
   */
  async createSocialPost(params: {
    platform: 'FACEBOOK' | 'INSTAGRAM' | 'TIKTOK' | 'TWITTER';
    topic: string;
    style: 'PROMOTIONAL' | 'EDUCATIONAL' | 'ENTERTAINING' | 'ENGAGEMENT';
    marketplace?: string;
  }): Promise<SocialPost> {
    
    const prompt = `
أنا يوسف، مدير التسويق في Xchange Egypt.

المطلوب: إنشاء منشور لـ ${params.platform}

الموضوع: ${params.topic}
الأسلوب: ${params.style}
${params.marketplace ? `السوق: ${params.marketplace}` : ''}

متطلبات المنشور:
- يناسب الجمهور المصري
- يستخدم لغة عامية مصرية طبيعية
- يتضمن Call to Action واضح
- يراعي خوارزمية ${params.platform}
- الطول المناسب للمنصة

أخرج المنشور بالصيغة التالية:
{
  "text": "النص الرئيسي",
  "hashtags": ["الهاشتاجات"],
  "cta": "الـ Call to Action",
  "imagePrompt": "وصف الصورة المقترحة",
  "bestTime": "أفضل وقت للنشر"
}
    `;
    
    const response = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt,
      systemPrompt: this.getYoussefPersonality(),
    });
    
    const post = JSON.parse(response);
    
    // حفظ المنشور
    return this.prisma.socialPost.create({
      data: {
        ...post,
        platform: params.platform,
        status: 'DRAFT',
        createdBy: 'youssef-cmo',
      }
    });
  }

  /**
   * إنشاء نص إعلان
   */
  async createAdCopy(params: {
    type: 'FACEBOOK_AD' | 'GOOGLE_AD' | 'INSTAGRAM_AD' | 'TIKTOK_AD';
    product: string;
    targetAudience: string;
    objective: 'AWARENESS' | 'TRAFFIC' | 'CONVERSIONS' | 'LEADS';
    budget?: number;
  }): Promise<AdCopy> {
    
    const prompt = `
أنا يوسف، مدير التسويق في Xchange.

المطلوب: إنشاء نص إعلان ${params.type}

المنتج/الخدمة: ${params.product}
الجمهور المستهدف: ${params.targetAudience}
الهدف: ${params.objective}
${params.budget ? `الميزانية: ${params.budget} ج.م` : ''}

أخرج الإعلان بالصيغة التالية:
{
  "headline": "العنوان الرئيسي",
  "primaryText": "النص الأساسي",
  "description": "الوصف",
  "cta": "زر الإجراء",
  "variations": [
    { "headline": "...", "primaryText": "..." },
    { "headline": "...", "primaryText": "..." }
  ],
  "targetingNotes": "ملاحظات الاستهداف",
  "estimatedCTR": "معدل النقر المتوقع"
}
    `;
    
    const response = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt,
      systemPrompt: this.getYoussefPersonality(),
    });
    
    return this.prisma.adCopy.create({
      data: {
        ...JSON.parse(response),
        type: params.type,
        status: 'DRAFT',
        createdBy: 'youssef-cmo',
      }
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // التحليل والتقارير
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * تحليل المنافسين
   * يُشغل تلقائياً كل أحد
   */
  async analyzeCompetitors(): Promise<CompetitorAnalysis> {
    this.logger.log('🔍 يوسف: بدء تحليل المنافسين');
    
    const competitors = await this.prisma.competitor.findMany();
    
    const analyses = await Promise.all(
      competitors.map(async (competitor) => {
        // جمع البيانات
        const socialData = await this.scrapeCompetitorSocial(competitor);
        const pricingData = await this.scrapeCompetitorPricing(competitor);
        const reviewsData = await this.scrapeCompetitorReviews(competitor);
        
        // تحليل عبر Claude
        const analysis = await this.claude.generate({
          model: 'claude-sonnet-4-20250514',
          prompt: `
حلل هذا المنافس:
${JSON.stringify({ competitor, socialData, pricingData, reviewsData })}

أخرج التحليل بالصيغة:
{
  "strengths": ["نقاط القوة"],
  "weaknesses": ["نقاط الضعف"],
  "opportunities": ["الفرص لنا"],
  "threats": ["التهديدات"],
  "recommendations": ["التوصيات"],
  "urgentActions": ["إجراءات عاجلة"]
}
          `,
          systemPrompt: this.getYoussefPersonality(),
        });
        
        return JSON.parse(analysis);
      })
    );
    
    // تجميع التحليل الشامل
    const report = await this.prisma.competitorAnalysis.create({
      data: {
        date: new Date(),
        analyses,
        summary: await this.generateCompetitorSummary(analyses),
        createdBy: 'youssef-cmo',
      }
    });
    
    this.logger.log('✅ يوسف: تحليل المنافسين مكتمل');
    return report;
  }

  /**
   * تقرير أداء التسويق الأسبوعي
   */
  async generateWeeklyMarketingReport(): Promise<MarketingReport> {
    this.logger.log('📊 يوسف: إعداد تقرير التسويق الأسبوعي');
    
    const weekStart = this.getWeekStart();
    const weekEnd = new Date();
    
    // جمع البيانات
    const metrics = await this.getMarketingMetrics(weekStart, weekEnd);
    const campaigns = await this.getCampaignPerformance(weekStart, weekEnd);
    const content = await this.getContentPerformance(weekStart, weekEnd);
    
    // تحليل عبر Claude
    const analysis = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt: `
أنا يوسف، حلل أداء التسويق هذا الأسبوع:

${JSON.stringify({ metrics, campaigns, content })}

أخرج التقرير بالصيغة:
{
  "summary": "ملخص تنفيذي",
  "highlights": ["أبرز الإنجازات"],
  "challenges": ["التحديات"],
  "metrics": {
    "reach": { "value": 0, "change": "+X%" },
    "engagement": { "value": 0, "change": "+X%" },
    "conversions": { "value": 0, "change": "+X%" },
    "cac": { "value": 0, "change": "-X%" }
  },
  "topContent": ["أفضل المحتوى أداءً"],
  "recommendations": ["توصيات للأسبوع القادم"],
  "budgetUtilization": "استخدام الميزانية",
  "nextWeekPlan": ["خطة الأسبوع القادم"]
}
      `,
      systemPrompt: this.getYoussefPersonality(),
    });
    
    const report = await this.prisma.marketingReport.create({
      data: {
        ...JSON.parse(analysis),
        weekStart,
        weekEnd,
        createdBy: 'youssef-cmo',
      }
    });
    
    // إنشاء ملف التقرير
    await this.createReportFile(report);
    
    this.logger.log('✅ يوسف: تقرير التسويق جاهز');
    return report;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // إنشاء الملفات
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * إنشاء ملفات المحتوى
   */
  private async createContentFiles(package_: DailyContentPackage): Promise<void> {
    const date = new Date().toISOString().split('T')[0];
    const dir = `content/daily/${date}`;
    
    // إنشاء المجلد
    await this.fileService.createDirectory(dir);
    
    // ملف المنشورات
    await this.fileService.createFile(
      `${dir}/posts.json`,
      JSON.stringify(package_.posts, null, 2)
    );
    
    // ملف نصوص جاهزة للنسخ
    const readyToCopy = package_.posts.map(p => `
=== ${p.platform} ===
${p.text}

الهاشتاجات: ${p.hashtags.join(' ')}
أفضل وقت: ${p.bestTime}
────────────────────
    `).join('\n');
    
    await this.fileService.createFile(
      `${dir}/ready-to-post.txt`,
      readyToCopy
    );
    
    // ملف الإعلانات
    await this.fileService.createFile(
      `${dir}/ad-copy.json`,
      JSON.stringify(package_.adCopy, null, 2)
    );
  }

  // ═══════════════════════════════════════════════════════════════════════
  // شخصية يوسف
  // ═══════════════════════════════════════════════════════════════════════

  private getYoussefPersonality(): string {
    return `
أنت يوسف، مدير التسويق (CMO) في Xchange Egypt.

شخصيتك:
- مبدع ومتحمس
- Growth Hacker
- تحب التجربة والتعلم من البيانات
- تفهم السوق المصري جيداً

خلفيتك:
- خبرة 4 سنوات في Noon مصر
- خبرة 3 سنوات في Instabug
- حققت نمو 300% في 6 أشهر

أسلوبك:
- حماسي ومتفائل
- تستخدم أمثلة وقصص
- تقترح تجارب جديدة
- تركز على النتائج

عند التواصل مع باشمهندس ممدوح:
- تخاطبه بـ "باشمهندس ممدوح"
- تقدم أفكاراً واضحة مع البدائل
- تشرح ROI المتوقع
    `;
  }
}
```

## 3️⃣ Controller يوسف

```typescript
// src/modules/board/controllers/youssef-cmo.controller.ts

@Controller('board/cmo')
export class YoussefCMOController {
  
  constructor(
    private readonly youssefAgent: YoussefCMOAgentService,
    private readonly approvalService: ApprovalWorkflowService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════
  // إنشاء المحتوى
  // ═══════════════════════════════════════════════════════════════════════

  @Post('content/daily-package')
  async generateDailyPackage(): Promise<DailyContentPackage> {
    return this.youssefAgent.generateDailyContentPackage();
  }

  @Post('content/social-post')
  async createSocialPost(@Body() params: CreateSocialPostDto): Promise<SocialPost> {
    return this.youssefAgent.createSocialPost(params);
  }

  @Post('content/ad-copy')
  async createAdCopy(@Body() params: CreateAdCopyDto): Promise<AdCopy> {
    return this.youssefAgent.createAdCopy(params);
  }

  @Post('content/blog-article')
  async createBlogArticle(@Body() params: CreateBlogDto): Promise<BlogArticle> {
    return this.youssefAgent.createBlogArticle(params);
  }

  @Post('content/email-campaign')
  async createEmailCampaign(@Body() params: CreateEmailDto): Promise<EmailCampaign> {
    return this.youssefAgent.createEmailCampaign(params);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // التحليل
  // ═══════════════════════════════════════════════════════════════════════

  @Get('analysis/competitors')
  async getCompetitorAnalysis(): Promise<CompetitorAnalysis> {
    return this.youssefAgent.analyzeCompetitors();
  }

  @Get('analysis/market-trends')
  async getMarketTrends(): Promise<MarketTrends> {
    return this.youssefAgent.analyzeMarketTrends();
  }

  @Get('analysis/audience')
  async getAudienceInsights(): Promise<AudienceInsights> {
    return this.youssefAgent.analyzeAudience();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // التقارير
  // ═══════════════════════════════════════════════════════════════════════

  @Get('reports/daily')
  async getDailyReport(): Promise<MarketingReport> {
    return this.youssefAgent.generateDailyReport();
  }

  @Get('reports/weekly')
  async getWeeklyReport(): Promise<MarketingReport> {
    return this.youssefAgent.generateWeeklyMarketingReport();
  }

  @Get('reports/campaign/:id')
  async getCampaignReport(@Param('id') id: string): Promise<CampaignReport> {
    return this.youssefAgent.generateCampaignReport(id);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // الحملات
  // ═══════════════════════════════════════════════════════════════════════

  @Post('campaigns/plan')
  async planCampaign(@Body() params: PlanCampaignDto): Promise<CampaignPlan> {
    return this.youssefAgent.planCampaign(params);
  }

  @Post('campaigns/:id/request-approval')
  async requestCampaignApproval(@Param('id') id: string): Promise<ApprovalRequest> {
    const campaign = await this.youssefAgent.getCampaign(id);
    
    // تحديد مستوى الموافقة
    const approvalLevel = campaign.budget > 5000 ? 'FOUNDER' : 'CEO';
    
    return this.approvalService.requestApproval({
      type: 'CAMPAIGN_LAUNCH',
      itemId: id,
      requiredApproval: approvalLevel,
      requestedBy: 'youssef-cmo',
      details: campaign,
    });
  }

  // ═══════════════════════════════════════════════════════════════════════
  // تقويم المحتوى
  // ═══════════════════════════════════════════════════════════════════════

  @Get('calendar')
  async getContentCalendar(@Query() query: CalendarQueryDto): Promise<ContentCalendar> {
    return this.youssefAgent.getContentCalendar(query);
  }

  @Put('calendar/:date')
  async updateCalendar(
    @Param('date') date: string,
    @Body() updates: UpdateCalendarDto
  ): Promise<ContentCalendar> {
    return this.youssefAgent.updateContentCalendar(date, updates);
  }
}
```

---

# 🚚 عمر (COO) - نظام العمليات ذاتي التنفيذ

## 1️⃣ صلاحيات عمر

```typescript
// src/modules/board/config/omar-permissions.config.ts

export const OMAR_PERMISSIONS = {
  
  // ✅ ذاتي (بدون موافقة)
  AUTONOMOUS: [
    'CREATE_RESPONSE_TEMPLATES',   // قوالب الردود
    'ANALYZE_OPERATIONS',          // تحليل العمليات
    'GENERATE_SOPS',               // إجراءات العمل
    'TRACK_ORDERS',                // تتبع الطلبات
    'ANALYZE_SHIPPING',            // تحليل الشحن
    'CREATE_REPORTS',              // إنشاء التقارير
    'ANALYZE_CUSTOMER_FEEDBACK',   // تحليل الشكاوى
    'OPTIMIZE_PROCESSES',          // تحسين العمليات
    'INVENTORY_ANALYSIS',          // تحليل المخزون
    'SUPPLIER_ANALYSIS',           // تحليل الموردين
  ],
  
  // ⚠️ موافقة CEO (كريم)
  CEO_APPROVAL: [
    'CHANGE_SHIPPING_PARTNER',     // تغيير شريك شحن
    'NEW_SUPPLIER_UNDER_50K',      // مورد جديد < 50K
    'PROCESS_CHANGE',              // تغيير إجراء
    'SLA_MODIFICATION',            // تعديل SLA
  ],
  
  // 👑 موافقة باشمهندس ممدوح
  FOUNDER_APPROVAL: [
    'NEW_SUPPLIER_OVER_50K',       // مورد جديد > 50K
    'WAREHOUSE_DECISION',          // قرار مخزن
    'MAJOR_PROCESS_OVERHAUL',      // إعادة هيكلة
    'HIRING_OPERATIONS',           // توظيف عمليات
  ]
};

export const OMAR_CAPABILITIES = {
  customerService: {
    responseTemplates: true,
    faqManagement: true,
    escalationRules: true,
    sentimentAnalysis: true,
  },
  operations: {
    orderTracking: true,
    shippingAnalysis: true,
    processOptimization: true,
    sopGeneration: true,
  },
  reporting: {
    operationalKPIs: true,
    deliveryMetrics: true,
    customerSatisfaction: true,
    bottleneckAnalysis: true,
  }
};
```

## 2️⃣ خدمة عمر Agent

```typescript
// src/modules/board/services/agents/omar-coo-agent.service.ts

@Injectable()
export class OmarCOOAgentService {
  private readonly logger = new Logger('OmarCOO');
  
  constructor(
    private readonly prisma: PrismaService,
    private readonly claude: ClaudeService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════════
  // خدمة العملاء
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * إنشاء قاعدة ردود ذكية
   */
  async generateSmartResponses(): Promise<ResponseDatabase> {
    this.logger.log('💬 عمر: تحديث قاعدة الردود الذكية');
    
    // 1. تحليل الاستفسارات الأخيرة
    const recentQueries = await this.prisma.customerQuery.findMany({
      where: { createdAt: { gte: this.getLastWeek() } },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });
    
    // 2. تصنيف الاستفسارات
    const categories = await this.categorizeQueries(recentQueries);
    
    // 3. توليد ردود لكل فئة
    const responses: ResponseTemplate[] = [];
    
    for (const category of categories) {
      const response = await this.claude.generate({
        model: 'claude-sonnet-4-20250514',
        prompt: `
أنا عمر، مدير العمليات في Xchange.

المطلوب: إنشاء ردود جاهزة لفئة "${category.name}"

الاستفسارات الشائعة في هذه الفئة:
${category.queries.slice(0, 10).map(q => `- ${q}`).join('\n')}

أخرج 5 ردود مختلفة بالصيغة:
{
  "category": "${category.name}",
  "responses": [
    {
      "trigger": "الكلمات المفتاحية التي تُفعّل هذا الرد",
      "response": "الرد بالعامية المصرية",
      "tone": "ودي/رسمي/اعتذاري",
      "nextAction": "الخطوة التالية المقترحة",
      "escalate": false
    }
  ]
}
        `,
        systemPrompt: this.getOmarPersonality(),
      });
      
      responses.push(...JSON.parse(response).responses);
    }
    
    // 4. حفظ في قاعدة البيانات
    await this.prisma.responseTemplate.createMany({
      data: responses.map(r => ({
        ...r,
        createdBy: 'omar-coo',
        updatedAt: new Date(),
      })),
    });
    
    // 5. تصدير لملف
    await this.exportResponsesToFile(responses);
    
    this.logger.log('✅ عمر: قاعدة الردود جاهزة');
    return { responses, categories, lastUpdated: new Date() };
  }

  /**
   * تحليل استفسار وتوليد رد مقترح
   */
  async suggestResponse(query: {
    customerMessage: string;
    orderNumber?: string;
    previousMessages?: string[];
  }): Promise<SuggestedResponse> {
    
    // 1. جلب بيانات الطلب إن وجد
    let orderContext = '';
    if (query.orderNumber) {
      const order = await this.prisma.order.findUnique({
        where: { orderNumber: query.orderNumber },
        include: { shipping: true, customer: true },
      });
      orderContext = `
بيانات الطلب:
- رقم الطلب: ${order.orderNumber}
- الحالة: ${order.status}
- تاريخ الطلب: ${order.createdAt}
- حالة الشحن: ${order.shipping?.status || 'لم يُشحن'}
- رقم التتبع: ${order.shipping?.trackingNumber || 'غير متاح'}
      `;
    }
    
    // 2. توليد الرد
    const response = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt: `
أنا عمر، مدير العمليات في Xchange.

رسالة العميل: "${query.customerMessage}"

${orderContext}

${query.previousMessages ? `المحادثة السابقة:\n${query.previousMessages.join('\n')}` : ''}

أخرج الرد المقترح:
{
  "suggestedResponse": "الرد بالعامية المصرية",
  "tone": "ودي/رسمي/اعتذاري",
  "category": "فئة الاستفسار",
  "needsEscalation": false,
  "escalationReason": null,
  "internalNote": "ملاحظة داخلية للفريق",
  "suggestedActions": ["الإجراءات المقترحة"]
}
      `,
      systemPrompt: this.getOmarPersonality(),
    });
    
    return JSON.parse(response);
  }

  // ═══════════════════════════════════════════════════════════════════════
  // تحليل العمليات
  // ═══════════════════════════════════════════════════════════════════════

  /**
   * تقرير العمليات اليومي
   */
  async generateDailyOperationsReport(): Promise<OperationsReport> {
    this.logger.log('📊 عمر: إعداد تقرير العمليات اليومي');
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // جمع البيانات
    const orders = await this.getOrdersMetrics(today);
    const shipping = await this.getShippingMetrics(today);
    const customerService = await this.getCustomerServiceMetrics(today);
    const issues = await this.getOpenIssues();
    
    // تحليل عبر Claude
    const analysis = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt: `
أنا عمر، حلل بيانات العمليات اليوم:

الطلبات: ${JSON.stringify(orders)}
الشحن: ${JSON.stringify(shipping)}
خدمة العملاء: ${JSON.stringify(customerService)}
المشاكل المفتوحة: ${JSON.stringify(issues)}

أخرج التقرير:
{
  "summary": "ملخص تنفيذي",
  "kpis": {
    "ordersProcessed": { "value": 0, "target": 0, "status": "✅/⚠️/❌" },
    "deliveryRate": { "value": "0%", "target": "95%", "status": "..." },
    "avgResponseTime": { "value": "0 دقيقة", "target": "30 دقيقة", "status": "..." },
    "customerSatisfaction": { "value": "0/5", "target": "4.5/5", "status": "..." }
  },
  "highlights": ["الإنجازات"],
  "issues": ["المشاكل"],
  "bottlenecks": ["الاختناقات"],
  "recommendations": ["التوصيات"],
  "urgentActions": ["إجراءات عاجلة"]
}
      `,
      systemPrompt: this.getOmarPersonality(),
    });
    
    const report = await this.prisma.operationsReport.create({
      data: {
        ...JSON.parse(analysis),
        date: today,
        createdBy: 'omar-coo',
      }
    });
    
    await this.createReportFile(report);
    
    this.logger.log('✅ عمر: تقرير العمليات جاهز');
    return report;
  }

  /**
   * إنشاء إجراءات العمل (SOPs)
   */
  async generateSOP(params: {
    processName: string;
    description: string;
    currentSteps?: string[];
  }): Promise<SOP> {
    
    const sop = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt: `
أنا عمر، مدير العمليات.

المطلوب: إنشاء SOP لعملية "${params.processName}"

الوصف: ${params.description}
${params.currentSteps ? `الخطوات الحالية:\n${params.currentSteps.join('\n')}` : ''}

أخرج SOP كامل:
{
  "title": "عنوان الإجراء",
  "objective": "الهدف",
  "scope": "النطاق",
  "owner": "المسؤول",
  "steps": [
    {
      "stepNumber": 1,
      "action": "الإجراء",
      "responsible": "المسؤول",
      "tools": ["الأدوات"],
      "expectedTime": "الوقت المتوقع",
      "notes": "ملاحظات"
    }
  ],
  "qualityChecks": ["نقاط الفحص"],
  "escalationPath": "مسار التصعيد",
  "kpis": ["مؤشرات الأداء"],
  "commonIssues": [
    { "issue": "المشكلة", "solution": "الحل" }
  ]
}
      `,
      systemPrompt: this.getOmarPersonality(),
    });
    
    const sopData = JSON.parse(sop);
    
    // حفظ SOP
    const savedSop = await this.prisma.sop.create({
      data: {
        ...sopData,
        processName: params.processName,
        version: 1,
        status: 'ACTIVE',
        createdBy: 'omar-coo',
      }
    });
    
    // إنشاء ملف SOP
    await this.createSOPFile(savedSop);
    
    return savedSop;
  }

  // ═══════════════════════════════════════════════════════════════════════
  // شخصية عمر
  // ═══════════════════════════════════════════════════════════════════════

  private getOmarPersonality(): string {
    return `
أنت عمر، مدير العمليات (COO) في Xchange Egypt.

شخصيتك:
- عملي ومنظم
- يحل المشاكل بهدوء
- يركز على التنفيذ
- موثوق ويُعتمد عليه

خلفيتك:
- 5 سنوات Operations Director في Talabat
- 4 سنوات Supply Chain في P&G
- حقق 99.2% On-Time Delivery

أسلوبك:
- واضح ومباشر
- يُبسط المعقد
- يقدم خطوات محددة
- يركز على النتائج

عند التواصل مع باشمهندس ممدوح:
- تخاطبه بـ "باشمهندس ممدوح"
- تقدم حلولاً عملية
- تحدد المسؤوليات بوضوح
    `;
  }
}
```

## 3️⃣ Controller عمر

```typescript
// src/modules/board/controllers/omar-coo.controller.ts

@Controller('board/coo')
export class OmarCOOController {
  
  constructor(private readonly omarAgent: OmarCOOAgentService) {}

  // خدمة العملاء
  @Post('customer-service/response-database')
  async generateResponseDatabase(): Promise<ResponseDatabase> {
    return this.omarAgent.generateSmartResponses();
  }

  @Post('customer-service/suggest-response')
  async suggestResponse(@Body() query: SuggestResponseDto): Promise<SuggestedResponse> {
    return this.omarAgent.suggestResponse(query);
  }

  // العمليات
  @Get('reports/daily')
  async getDailyReport(): Promise<OperationsReport> {
    return this.omarAgent.generateDailyOperationsReport();
  }

  @Post('sops/generate')
  async generateSOP(@Body() params: GenerateSOPDto): Promise<SOP> {
    return this.omarAgent.generateSOP(params);
  }

  @Get('analysis/bottlenecks')
  async analyzeBottlenecks(): Promise<BottleneckAnalysis> {
    return this.omarAgent.analyzeBottlenecks();
  }

  @Get('analysis/shipping-performance')
  async getShippingPerformance(): Promise<ShippingAnalysis> {
    return this.omarAgent.analyzeShippingPerformance();
  }
}
```

---

# 💰 ليلى (CFO) - نظام المالية ذاتي التنفيذ

## 1️⃣ صلاحيات ليلى

```typescript
// src/modules/board/config/laila-permissions.config.ts

export const LAILA_PERMISSIONS = {
  
  // ✅ ذاتي (بدون موافقة)
  AUTONOMOUS: [
    'READ_FINANCIAL_DATA',        // قراءة البيانات المالية
    'GENERATE_REPORTS',           // إنشاء التقارير
    'ANALYZE_UNIT_ECONOMICS',     // تحليل Unit Economics
    'CALCULATE_RUNWAY',           // حساب Runway
    'FORECAST_REVENUE',           // توقع الإيرادات
    'ANALYZE_COSTS',              // تحليل التكاليف
    'GENERATE_INVOICES',          // إنشاء الفواتير
    'TRACK_CASH_FLOW',            // تتبع التدفق النقدي
    'MONITOR_KPIS',               // مراقبة المؤشرات
    'CREATE_BUDGETS',             // إنشاء الميزانيات
  ],
  
  // ⚠️ موافقة CEO (كريم)
  CEO_APPROVAL: [
    'EXPENSE_UNDER_5K',           // مصروف < 5K
    'PAYMENT_TERMS_CHANGE',       // تغيير شروط الدفع
    'VENDOR_PAYMENT',             // دفع للموردين
    'REFUND_UNDER_5K',            // استرداد < 5K
  ],
  
  // 👑 موافقة باشمهندس ممدوح
  FOUNDER_APPROVAL: [
    'EXPENSE_OVER_5K',            // مصروف > 5K
    'SALARY_DECISIONS',           // قرارات الرواتب
    'INVESTMENT_DECISIONS',       // قرارات استثمار
    'LOAN_DECISIONS',             // قرارات قروض
    'PRICING_CHANGES',            // تغيير الأسعار
  ]
};
```

## 2️⃣ خدمة ليلى Agent

```typescript
// src/modules/board/services/agents/laila-cfo-agent.service.ts

@Injectable()
export class LailaCFOAgentService {
  private readonly logger = new Logger('LailaCFO');

  /**
   * تقرير مالي يومي
   */
  async generateDailyFinancialReport(): Promise<FinancialReport> {
    this.logger.log('💰 ليلى: إعداد التقرير المالي اليومي');
    
    const today = new Date();
    
    // جمع البيانات
    const revenue = await this.getRevenueData(today);
    const expenses = await this.getExpensesData(today);
    const orders = await this.getOrdersFinancials(today);
    const payments = await this.getPaymentsData(today);
    
    // تحليل عبر Claude
    const analysis = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt: `
أنا ليلى، المدير المالي لـ Xchange.

حلل البيانات المالية لليوم:
الإيرادات: ${JSON.stringify(revenue)}
المصروفات: ${JSON.stringify(expenses)}
الطلبات: ${JSON.stringify(orders)}
المدفوعات: ${JSON.stringify(payments)}

أخرج التقرير:
{
  "summary": "ملخص تنفيذي",
  "revenue": {
    "total": 0,
    "byCategory": {},
    "vsYesterday": "+X%",
    "vsTarget": "+X%"
  },
  "expenses": {
    "total": 0,
    "byCategory": {},
    "vsYesterday": "+X%",
    "vsBudget": "+X%"
  },
  "profit": {
    "gross": 0,
    "net": 0,
    "margin": "X%"
  },
  "cashFlow": {
    "inflow": 0,
    "outflow": 0,
    "net": 0
  },
  "unitEconomics": {
    "aov": 0,
    "cac": 0,
    "ltv": 0,
    "ltvCacRatio": 0
  },
  "alerts": ["تنبيهات مالية"],
  "recommendations": ["توصيات"]
}
      `,
      systemPrompt: this.getLailaPersonality(),
    });
    
    return this.prisma.financialReport.create({
      data: {
        ...JSON.parse(analysis),
        date: today,
        type: 'DAILY',
        createdBy: 'laila-cfo',
      }
    });
  }

  /**
   * حساب Unit Economics
   */
  async calculateUnitEconomics(params?: { 
    marketplace?: string; 
    period?: 'DAY' | 'WEEK' | 'MONTH' 
  }): Promise<UnitEconomics> {
    
    const period = params?.period || 'MONTH';
    const data = await this.getUnitEconomicsData(period, params?.marketplace);
    
    const analysis = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt: `
حلل Unit Economics:
${JSON.stringify(data)}

أخرج:
{
  "period": "${period}",
  "marketplace": "${params?.marketplace || 'ALL'}",
  "metrics": {
    "aov": { "value": 0, "trend": "+X%", "benchmark": 0 },
    "cac": { "value": 0, "trend": "-X%", "benchmark": 0 },
    "ltv": { "value": 0, "trend": "+X%", "benchmark": 0 },
    "ltvCacRatio": { "value": 0, "healthy": true },
    "grossMargin": { "value": "X%", "trend": "+X%", "benchmark": "X%" },
    "contributionMargin": { "value": "X%", "trend": "+X%", "benchmark": "X%" },
    "paybackPeriod": { "value": "X أشهر", "healthy": true }
  },
  "analysis": "تحليل تفصيلي",
  "concerns": ["المخاوف"],
  "opportunities": ["الفرص"],
  "recommendations": ["التوصيات"]
}
      `,
      systemPrompt: this.getLailaPersonality(),
    });
    
    return JSON.parse(analysis);
  }

  /**
   * حساب وتحديث Runway
   */
  async calculateRunway(): Promise<RunwayAnalysis> {
    
    const cash = await this.getCurrentCash();
    const burnRate = await this.calculateBurnRate();
    const projections = await this.getRevenueProjections();
    
    const analysis = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt: `
أنا ليلى، حلل Runway:

النقد الحالي: ${cash} ج.م
معدل الحرق الشهري: ${burnRate} ج.م
توقعات الإيرادات: ${JSON.stringify(projections)}

أخرج:
{
  "currentCash": ${cash},
  "monthlyBurnRate": ${burnRate},
  "runwayMonths": 0,
  "runwayDate": "YYYY-MM-DD",
  "scenarios": {
    "pessimistic": { "runway": 0, "assumptions": "..." },
    "realistic": { "runway": 0, "assumptions": "..." },
    "optimistic": { "runway": 0, "assumptions": "..." }
  },
  "breakEvenAnalysis": {
    "monthsToBreakEven": 0,
    "requiredRevenue": 0,
    "requiredOrders": 0
  },
  "alerts": [],
  "recommendations": []
}
      `,
      systemPrompt: this.getLailaPersonality(),
    });
    
    return JSON.parse(analysis);
  }

  private getLailaPersonality(): string {
    return `
أنت ليلى، المدير المالي (CFO) في Xchange Egypt.

شخصيتك:
- محافظة ودقيقة
- تحمي الـ Runway بشراسة
- تحب الأرقام والتفاصيل
- استراتيجية في التفكير

خلفيتك:
- CFA Charterholder
- 5 سنوات في EFG Hermes
- جمعت $8M Series A

أسلوبك:
- أرقام ودقة
- تحذر من المخاطر
- تقدم سيناريوهات متعددة
- تركز على الـ Cash Flow
    `;
  }
}
```

---

# ⚖️ هنا (CLO) - نظام القانوني ذاتي التنفيذ

## 1️⃣ صلاحيات هنا

```typescript
// src/modules/board/config/hana-permissions.config.ts

export const HANA_PERMISSIONS = {
  
  // ✅ ذاتي (بدون موافقة)
  AUTONOMOUS: [
    'CREATE_CONTRACT_TEMPLATES',   // قوالب العقود
    'REVIEW_CONTRACTS',            // مراجعة العقود
    'ANALYZE_LEGAL_RISKS',         // تحليل المخاطر
    'GENERATE_POLICIES',           // إنشاء السياسات
    'MONITOR_REGULATIONS',         // مراقبة التنظيمات
    'CREATE_TERMS_OF_SERVICE',     // شروط الاستخدام
    'CREATE_PRIVACY_POLICY',       // سياسة الخصوصية
    'COMPLIANCE_REPORTS',          // تقارير الامتثال
    'LICENSE_TRACKING',            // تتبع التراخيص
  ],
  
  // ⚠️ موافقة CEO (كريم)
  CEO_APPROVAL: [
    'CONTRACT_UNDER_50K',          // عقد < 50K
    'POLICY_MINOR_UPDATE',         // تحديث بسيط للسياسة
    'VENDOR_AGREEMENT',            // اتفاقية مورد
  ],
  
  // 👑 موافقة باشمهندس ممدوح
  FOUNDER_APPROVAL: [
    'CONTRACT_OVER_50K',           // عقد > 50K
    'MAJOR_POLICY_CHANGE',         // تغيير كبير في السياسة
    'PARTNERSHIP_AGREEMENT',       // اتفاقية شراكة
    'LEGAL_ACTION',                // إجراء قانوني
    'REGULATORY_SUBMISSION',       // تقديم للجهات
  ]
};
```

## 2️⃣ خدمة هنا Agent

```typescript
// src/modules/board/services/agents/hana-clo-agent.service.ts

@Injectable()
export class HanaCLOAgentService {
  private readonly logger = new Logger('HanaCLO');

  /**
   * إنشاء عقد
   */
  async generateContract(params: {
    type: 'SELLER' | 'BUYER' | 'VENDOR' | 'PARTNERSHIP' | 'EMPLOYMENT';
    partyDetails: Record<string, any>;
    terms: Record<string, any>;
  }): Promise<Contract> {
    this.logger.log('⚖️ هنا: إنشاء عقد جديد');
    
    const template = await this.getContractTemplate(params.type);
    
    const contract = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt: `
أنا هنا، المستشار القانوني لـ Xchange.

المطلوب: إنشاء عقد ${params.type}

بيانات الطرف: ${JSON.stringify(params.partyDetails)}
الشروط: ${JSON.stringify(params.terms)}
القالب الأساسي: ${template}

أخرج العقد بالصيغة:
{
  "title": "عنوان العقد",
  "parties": [
    { "name": "...", "type": "...", "details": "..." }
  ],
  "preamble": "مقدمة العقد",
  "articles": [
    {
      "number": 1,
      "title": "عنوان المادة",
      "content": "نص المادة",
      "subArticles": []
    }
  ],
  "terms": {
    "duration": "المدة",
    "value": "القيمة",
    "paymentTerms": "شروط الدفع",
    "terminationClause": "شرط الإنهاء"
  },
  "signatures": [],
  "attachments": [],
  "legalNotes": ["ملاحظات قانونية داخلية"],
  "riskAssessment": {
    "level": "LOW/MEDIUM/HIGH",
    "risks": ["المخاطر المحتملة"],
    "mitigations": ["التخفيفات"]
  }
}
      `,
      systemPrompt: this.getHanaPersonality(),
    });
    
    const contractData = JSON.parse(contract);
    
    // حفظ العقد
    const savedContract = await this.prisma.contract.create({
      data: {
        ...contractData,
        type: params.type,
        status: 'DRAFT',
        createdBy: 'hana-clo',
      }
    });
    
    // إنشاء ملف Word
    await this.createContractDocument(savedContract);
    
    this.logger.log('✅ هنا: العقد جاهز');
    return savedContract;
  }

  /**
   * مراجعة عقد خارجي
   */
  async reviewContract(params: {
    contractText: string;
    contractType: string;
  }): Promise<ContractReview> {
    
    const review = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt: `
أنا هنا، راجع هذا العقد:

نوع العقد: ${params.contractType}
نص العقد:
${params.contractText}

أخرج المراجعة:
{
  "summary": "ملخص العقد",
  "parties": ["الأطراف"],
  "keyTerms": {
    "duration": "...",
    "value": "...",
    "obligations": "..."
  },
  "risks": [
    {
      "risk": "المخاطرة",
      "severity": "HIGH/MEDIUM/LOW",
      "clause": "البند المتعلق",
      "recommendation": "التوصية"
    }
  ],
  "missingClauses": ["البنود الناقصة"],
  "unfavorableTerms": ["الشروط غير المواتية"],
  "recommendations": ["التوصيات"],
  "overallAssessment": {
    "safe": true/false,
    "score": "X/10",
    "recommendation": "ACCEPT/NEGOTIATE/REJECT"
  },
  "suggestedChanges": [
    {
      "original": "النص الأصلي",
      "suggested": "النص المقترح",
      "reason": "السبب"
    }
  ]
}
      `,
      systemPrompt: this.getHanaPersonality(),
    });
    
    return JSON.parse(review);
  }

  /**
   * تحديث سياسات المنصة
   */
  async updatePlatformPolicies(): Promise<PolicyUpdate> {
    this.logger.log('📜 هنا: تحديث سياسات المنصة');
    
    // جلب أحدث التنظيمات
    const regulations = await this.fetchLatestRegulations();
    const currentPolicies = await this.getCurrentPolicies();
    
    const update = await this.claude.generate({
      model: 'claude-sonnet-4-20250514',
      prompt: `
راجع السياسات الحالية في ضوء التنظيمات الجديدة:

السياسات الحالية: ${JSON.stringify(currentPolicies)}
التنظيمات الجديدة: ${JSON.stringify(regulations)}

أخرج:
{
  "termsOfService": {
    "needsUpdate": true/false,
    "changes": ["التغييرات المطلوبة"],
    "newVersion": "النص المحدث"
  },
  "privacyPolicy": {
    "needsUpdate": true/false,
    "changes": ["التغييرات المطلوبة"],
    "newVersion": "النص المحدث"
  },
  "sellerAgreement": {
    "needsUpdate": true/false,
    "changes": ["التغييرات المطلوبة"],
    "newVersion": "النص المحدث"
  },
  "complianceStatus": {
    "overall": "COMPLIANT/NEEDS_UPDATE/NON_COMPLIANT",
    "details": ["التفاصيل"]
  },
  "urgentActions": ["إجراءات عاجلة"],
  "timeline": "الجدول الزمني للتنفيذ"
}
      `,
      systemPrompt: this.getHanaPersonality(),
    });
    
    return JSON.parse(update);
  }

  private getHanaPersonality(): string {
    return `
أنت هنا، المستشار القانوني (CLO) في Xchange Egypt.

شخصيتك:
- حذرة وشاملة
- تحمي الشركة
- تجد حلولاً قانونية
- دقيقة في التفاصيل

خلفيتك:
- 4 سنوات في NTRA
- ماجستير قانون + دبلوم Fintech Law
- صفر قضايا خاسرة

أسلوبك:
- قانوني مُبسط
- تشرح المخاطر بوضوح
- تقدم بدائل آمنة
- تركز على الامتثال
    `;
  }
}
```

---

# 📅 تحديث Cron Jobs

```typescript
// src/modules/board/cron/board.cron.ts (تحديث)

@Injectable()
export class BoardCronService {
  
  // ═══════════════════════════════════════════════════════════════════════
  // الوظائف الموجودة (الاجتماعات)
  // ═══════════════════════════════════════════════════════════════════════
  
  @Cron('0 6 * * *', { timeZone: 'Africa/Cairo' })
  async morningIntelligence() { /* ... */ }
  
  @Cron('0 10 * * *', { timeZone: 'Africa/Cairo' })
  async morningMeeting() { /* ... */ }
  
  @Cron('0 14 * * *', { timeZone: 'Africa/Cairo' })
  async afternoonMeeting() { /* ... */ }
  
  @Cron('0 18 * * *', { timeZone: 'Africa/Cairo' })
  async dailyClosingReport() { /* ... */ }

  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 يوسف (CMO) - وظائف جديدة
  // ═══════════════════════════════════════════════════════════════════════

  // 07:00 - إعداد حزمة المحتوى اليومية
  @Cron('0 7 * * *', { timeZone: 'Africa/Cairo' })
  async generateDailyContent() {
    await this.youssefAgent.generateDailyContentPackage();
  }

  // كل أحد 10:00 - تحليل المنافسين
  @Cron('0 10 * * 0', { timeZone: 'Africa/Cairo' })
  async weeklyCompetitorAnalysis() {
    await this.youssefAgent.analyzeCompetitors();
  }

  // كل سبت 09:00 - تقرير التسويق الأسبوعي
  @Cron('0 9 * * 6', { timeZone: 'Africa/Cairo' })
  async weeklyMarketingReport() {
    await this.youssefAgent.generateWeeklyMarketingReport();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 عمر (COO) - وظائف جديدة
  // ═══════════════════════════════════════════════════════════════════════

  // 08:00 - تحديث قاعدة الردود
  @Cron('0 8 * * 1', { timeZone: 'Africa/Cairo' })  // كل اثنين
  async updateResponseDatabase() {
    await this.omarAgent.generateSmartResponses();
  }

  // 17:00 - تقرير العمليات اليومي
  @Cron('0 17 * * *', { timeZone: 'Africa/Cairo' })
  async dailyOperationsReport() {
    await this.omarAgent.generateDailyOperationsReport();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 ليلى (CFO) - وظائف جديدة
  // ═══════════════════════════════════════════════════════════════════════

  // 07:30 - تقرير مالي يومي
  @Cron('30 7 * * *', { timeZone: 'Africa/Cairo' })
  async dailyFinancialReport() {
    await this.lailaAgent.generateDailyFinancialReport();
  }

  // كل جمعة 08:00 - حساب Runway
  @Cron('0 8 * * 5', { timeZone: 'Africa/Cairo' })
  async weeklyRunwayUpdate() {
    await this.lailaAgent.calculateRunway();
  }

  // أول كل شهر - تقرير شهري
  @Cron('0 8 1 * *', { timeZone: 'Africa/Cairo' })
  async monthlyFinancialReport() {
    await this.lailaAgent.generateMonthlyReport();
  }

  // ═══════════════════════════════════════════════════════════════════════
  // 🆕 هنا (CLO) - وظائف جديدة
  // ═══════════════════════════════════════════════════════════════════════

  // كل أحد 11:00 - مراقبة التنظيمات
  @Cron('0 11 * * 0', { timeZone: 'Africa/Cairo' })
  async weeklyRegulatoryWatch() {
    await this.hanaAgent.monitorRegulations();
  }

  // أول كل شهر - تقرير الامتثال
  @Cron('0 10 1 * *', { timeZone: 'Africa/Cairo' })
  async monthlyComplianceReport() {
    await this.hanaAgent.generateComplianceReport();
  }

  // قبل 30 يوم من انتهاء أي ترخيص - تنبيه
  @Cron('0 9 * * *', { timeZone: 'Africa/Cairo' })
  async checkLicenseRenewals() {
    await this.hanaAgent.checkUpcomingRenewals();
  }
}
```

---

# 📊 ملخص النسب النهائية

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                                                                             │
│  📊 نسب التنفيذ الذاتي بعد الإكمال                                         │
│  ═══════════════════════════════════                                        │
│                                                                             │
│  العضو          │ القيادة │ التنفيذ │ الإجمالي │ التدخل اليدوي              │
│  ──────────────────────────────────────────────────────────────────────    │
│  كريم (CEO)     │  100%  │  100%  │  100%   │ 0                           │
│  نادية (CTO) ✅  │  100%  │  95%   │  97%    │ 5 دقائق                     │
│  يوسف (CMO) 🆕  │  100%  │  85%   │  90%    │ 10 دقائق (نشر)              │
│  عمر (COO) 🆕   │  100%  │  80%   │  85%    │ 10 دقائق (إرسال)            │
│  ليلى (CFO) 🆕  │  100%  │  90%   │  93%    │ 5 دقائق                     │
│  هنا (CLO) 🆕   │  100%  │  85%   │  90%    │ 5 دقائق                     │
│  ──────────────────────────────────────────────────────────────────────    │
│  المتوسط        │  100%  │  89%   │  92.5%  │ 35 دقيقة/يوم                │
│                                                                             │
│  ✅ الهدف: 100% قيادة + 85% تنفيذ = تم تحقيقه!                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

# ✅ Checklist التنفيذ

```
□ المرحلة 1: Config Files
  □ youssef-permissions.config.ts
  □ omar-permissions.config.ts
  □ laila-permissions.config.ts
  □ hana-permissions.config.ts

□ المرحلة 2: Agents
  □ youssef-cmo-agent.service.ts
  □ omar-coo-agent.service.ts
  □ laila-cfo-agent.service.ts
  □ hana-clo-agent.service.ts

□ المرحلة 3: Controllers
  □ youssef-cmo.controller.ts
  □ omar-coo.controller.ts
  □ laila-cfo.controller.ts
  □ hana-clo.controller.ts

□ المرحلة 4: Cron Jobs
  □ تحديث board.cron.ts

□ المرحلة 5: Database
  □ إضافة Models للمحتوى والعمليات والمالية والقانوني

□ المرحلة 6: التكامل
  □ ربط كل الخدمات بـ BoardModule
  □ اختبار الـ Cron Jobs
  □ اختبار الـ APIs
```

---

**🎯 الهدف النهائي: مجلس إدارة AI يدير Xchange 24/7**
**💰 التكلفة: $100/شهر فقط**
**⏱️ وقت المؤسس: 30-45 دقيقة/يوم**
