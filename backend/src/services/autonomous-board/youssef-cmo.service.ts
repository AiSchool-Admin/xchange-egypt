/**
 * Youssef CMO Service
 * خدمة يوسف مدير التسويق
 *
 * Handles Youssef's marketing execution capabilities:
 * - Daily content package generation
 * - Competitor analysis
 * - Marketing reports
 * - Ad copy creation
 * - Campaign management
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';
import {
  PermissionLevel,
  MarketingCategory,
  getActionConfig,
  requiresApproval,
  getRequiredApprover,
  ALL_YOUSSEF_ACTIONS,
} from '../../config/board/youssef-permissions.config';
import { getBoardMemberByRole, BoardRole } from '../../config/board/board-members.config';

const anthropic = new Anthropic();

export enum YoussefTaskStatus {
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface ContentPackage {
  id: string;
  date: Date;
  facebookPosts: SocialPost[];
  instagramPosts: SocialPost[];
  twitterPosts: SocialPost[];
  stories: StoryContent[];
  emailContent?: EmailContent;
  generatedAt: Date;
}

export interface SocialPost {
  platform: 'FACEBOOK' | 'INSTAGRAM' | 'TWITTER' | 'TIKTOK';
  content: string;
  contentAr: string;
  hashtags: string[];
  suggestedTime: string;
  mediaType: 'IMAGE' | 'VIDEO' | 'CAROUSEL' | 'TEXT';
  mediaDescription?: string;
  targetAudience: string;
}

export interface StoryContent {
  platform: 'INSTAGRAM' | 'FACEBOOK';
  slides: Array<{
    content: string;
    contentAr: string;
    type: 'TEXT' | 'POLL' | 'QUIZ' | 'COUNTDOWN';
  }>;
}

export interface EmailContent {
  subject: string;
  subjectAr: string;
  preheader: string;
  body: string;
  bodyAr: string;
  cta: string;
  ctaAr: string;
}

export interface CompetitorAnalysis {
  id: string;
  date: Date;
  competitors: CompetitorInsight[];
  marketTrends: string[];
  opportunities: string[];
  threats: string[];
  recommendations: string[];
  recommendationsAr: string[];
}

export interface CompetitorInsight {
  name: string;
  recentCampaigns: string[];
  pricingChanges: string[];
  newFeatures: string[];
  socialActivity: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface MarketingReport {
  id: string;
  period: string;
  kpis: MarketingKPI[];
  campaignPerformance: CampaignMetrics[];
  insights: string[];
  insightsAr: string[];
  recommendations: string[];
  recommendationsAr: string[];
  generatedAt: Date;
}

export interface MarketingKPI {
  name: string;
  nameAr: string;
  value: number;
  previousValue: number;
  change: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  status: 'GREEN' | 'YELLOW' | 'RED';
}

export interface CampaignMetrics {
  campaignName: string;
  platform: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  ctr: number;
  cpc: number;
  roas: number;
}

// Active tasks storage
const activeTasks: Map<string, any> = new Map();

/**
 * Generate task ID
 */
const generateTaskId = (): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `YOUSSEF-${date}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

/**
 * Get next report number for a given type
 */
const getNextReportNumber = async (type: string): Promise<number> => {
  const year = new Date().getFullYear();
  const count = await prisma.boardMemberDailyReport.count({
    where: {
      type: type as any,
      createdAt: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });
  return count + 1;
};

/**
 * Generate daily content package
 * يتم تشغيلها يومياً الساعة 7:00 صباحاً
 */
export const generateDailyContentPackage = async (): Promise<ContentPackage> => {
  logger.info('[YoussefCMO] Generating daily content package');

  const youssef = getBoardMemberByRole(BoardRole.CMO);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: `${youssef?.systemPromptBase || ''}

أنت تقوم بإنشاء حزمة المحتوى اليومية لـ Xchange Egypt.
المطلوب: محتوى جذاب للسوق المصري، بالعربية والإنجليزية.
الفئة المستهدفة: مستخدمي السوق المستعمل في مصر (18-45 سنة).`,
      messages: [
        {
          role: 'user',
          content: `Generate today's content package for Xchange Egypt marketplace.

Today's date: ${new Date().toLocaleDateString('ar-EG')}
Day: ${new Date().toLocaleDateString('en', { weekday: 'long' })}

Create content for:
1. 2 Facebook posts (one product-focused, one community-focused)
2. 2 Instagram posts (visual-first content)
3. 1 Twitter post (quick engagement)
4. 3 Instagram story slides

Return as JSON:
{
  "facebookPosts": [{"content": "", "contentAr": "", "hashtags": [], "suggestedTime": "10:00", "mediaType": "IMAGE", "mediaDescription": "", "targetAudience": ""}],
  "instagramPosts": [...],
  "twitterPosts": [...],
  "stories": [{"platform": "INSTAGRAM", "slides": [{"content": "", "contentAr": "", "type": "TEXT"}]}]
}

Focus on:
- Egyptian Arabic dialect (مصري)
- Trust and safety messaging
- Seasonal relevance
- Call-to-action for listing or buying`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      const contentPackage: ContentPackage = {
        id: generateTaskId(),
        date: new Date(),
        facebookPosts: parsed.facebookPosts || [],
        instagramPosts: parsed.instagramPosts || [],
        twitterPosts: parsed.twitterPosts || [],
        stories: parsed.stories || [],
        generatedAt: new Date(),
      };

      // Save to BoardMemberDailyReport
      const youssefMember = await prisma.boardMember.findFirst({
        where: { role: 'CMO' },
      });

      if (youssefMember) {
        const reportNumber = `CP-${new Date().getFullYear()}-${String(await getNextReportNumber('CONTENT_PACKAGE')).padStart(3, '0')}`;

        await prisma.boardMemberDailyReport.create({
          data: {
            reportNumber,
            type: 'CONTENT_PACKAGE',
            memberId: youssefMember.id,
            memberRole: 'CMO',
            date: new Date(),
            scheduledTime: '07:00',
            title: 'Daily Content Package',
            titleAr: 'حزمة المحتوى اليومية',
            summary: `Generated ${contentPackage.facebookPosts.length} Facebook posts, ${contentPackage.instagramPosts.length} Instagram posts, ${contentPackage.twitterPosts.length} Twitter posts, and ${contentPackage.stories.length} stories.`,
            summaryAr: `تم إنشاء ${contentPackage.facebookPosts.length} منشورات فيسبوك، ${contentPackage.instagramPosts.length} منشورات انستجرام، ${contentPackage.twitterPosts.length} تغريدات، و${contentPackage.stories.length} قصص.`,
            content: contentPackage as object,
            keyMetrics: {
              facebookPosts: contentPackage.facebookPosts.length,
              instagramPosts: contentPackage.instagramPosts.length,
              twitterPosts: contentPackage.twitterPosts.length,
              stories: contentPackage.stories.length,
            },
            status: 'GENERATED',
            generatedAt: new Date(),
          },
        });

        logger.info(`[YoussefCMO] Content package saved to database: ${reportNumber}`);
      }

      logger.info(`[YoussefCMO] Content package generated: ${contentPackage.id}`);
      return contentPackage;
    }

    throw new Error('Failed to parse content package');
  } catch (error) {
    logger.error('[YoussefCMO] Content generation error:', error);
    throw error;
  }
};

/**
 * Generate competitor analysis
 * يتم تشغيلها أسبوعياً يوم الأحد الساعة 10:00 صباحاً
 */
export const generateCompetitorAnalysis = async (): Promise<CompetitorAnalysis> => {
  logger.info('[YoussefCMO] Generating weekly competitor analysis');

  const youssef = getBoardMemberByRole(BoardRole.CMO);
  const competitors = ['OLX Egypt', 'Facebook Marketplace', 'Dubizzle', 'Noon', 'Jumia'];

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 3000,
      system: `${youssef?.systemPromptBase || ''}

أنت تقوم بتحليل المنافسين لـ Xchange Egypt.
ركز على: التسعير، الحملات، الميزات الجديدة، النشاط على السوشيال ميديا.`,
      messages: [
        {
          role: 'user',
          content: `Analyze competitors for Xchange Egypt:
${competitors.map((c) => `- ${c}`).join('\n')}

Provide analysis in JSON:
{
  "competitors": [
    {
      "name": "OLX Egypt",
      "recentCampaigns": ["..."],
      "pricingChanges": ["..."],
      "newFeatures": ["..."],
      "socialActivity": "High/Medium/Low",
      "threatLevel": "HIGH"
    }
  ],
  "marketTrends": ["trend1", "trend2"],
  "opportunities": ["opportunity1"],
  "threats": ["threat1"],
  "recommendations": ["recommendation in English"],
  "recommendationsAr": ["توصية بالعربية"]
}`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      const analysis: CompetitorAnalysis = {
        id: generateTaskId(),
        date: new Date(),
        competitors: parsed.competitors || [],
        marketTrends: parsed.marketTrends || [],
        opportunities: parsed.opportunities || [],
        threats: parsed.threats || [],
        recommendations: parsed.recommendations || [],
        recommendationsAr: parsed.recommendationsAr || [],
      };

      logger.info(`[YoussefCMO] Competitor analysis generated: ${analysis.id}`);
      return analysis;
    }

    throw new Error('Failed to parse competitor analysis');
  } catch (error) {
    logger.error('[YoussefCMO] Competitor analysis error:', error);
    throw error;
  }
};

/**
 * Generate weekly marketing report
 * يتم تشغيلها كل سبت الساعة 9:00 صباحاً
 */
export const generateWeeklyMarketingReport = async (): Promise<MarketingReport> => {
  logger.info('[YoussefCMO] Generating weekly marketing report');

  const youssef = getBoardMemberByRole(BoardRole.CMO);

  // Simulated marketing data - in production, fetch from analytics APIs
  const simulatedKPIs: MarketingKPI[] = [
    {
      name: 'Website Traffic',
      nameAr: 'زيارات الموقع',
      value: 15000,
      previousValue: 14200,
      change: 5.6,
      trend: 'UP',
      status: 'GREEN',
    },
    {
      name: 'New User Signups',
      nameAr: 'تسجيلات جديدة',
      value: 450,
      previousValue: 420,
      change: 7.1,
      trend: 'UP',
      status: 'GREEN',
    },
    {
      name: 'App Downloads',
      nameAr: 'تحميلات التطبيق',
      value: 1200,
      previousValue: 1100,
      change: 9.1,
      trend: 'UP',
      status: 'GREEN',
    },
    {
      name: 'Cost Per Acquisition',
      nameAr: 'تكلفة الاكتساب',
      value: 35,
      previousValue: 38,
      change: -7.9,
      trend: 'DOWN',
      status: 'GREEN',
    },
    {
      name: 'Social Engagement Rate',
      nameAr: 'معدل التفاعل',
      value: 4.2,
      previousValue: 3.8,
      change: 10.5,
      trend: 'UP',
      status: 'GREEN',
    },
  ];

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `${youssef?.systemPromptBase || ''}

أنت تقوم بإعداد التقرير التسويقي الأسبوعي.
قدم رؤى عملية وتوصيات محددة.`,
      messages: [
        {
          role: 'user',
          content: `Generate insights and recommendations based on this week's marketing KPIs:

${JSON.stringify(simulatedKPIs, null, 2)}

Provide in JSON:
{
  "insights": ["insight1 in English", "insight2"],
  "insightsAr": ["رؤية 1 بالعربية", "رؤية 2"],
  "recommendations": ["recommendation1", "recommendation2"],
  "recommendationsAr": ["توصية 1", "توصية 2"]
}`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);

      const report: MarketingReport = {
        id: generateTaskId(),
        period: `Week of ${new Date().toLocaleDateString('en-EG')}`,
        kpis: simulatedKPIs,
        campaignPerformance: [],
        insights: parsed.insights || [],
        insightsAr: parsed.insightsAr || [],
        recommendations: parsed.recommendations || [],
        recommendationsAr: parsed.recommendationsAr || [],
        generatedAt: new Date(),
      };

      logger.info(`[YoussefCMO] Marketing report generated: ${report.id}`);
      return report;
    }

    throw new Error('Failed to parse marketing report');
  } catch (error) {
    logger.error('[YoussefCMO] Marketing report error:', error);
    throw error;
  }
};

/**
 * Generate ad copy for a campaign
 */
export const generateAdCopy = async (
  campaignObjective: string,
  targetAudience: string,
  platform: string
): Promise<{
  headline: string;
  headlineAr: string;
  primaryText: string;
  primaryTextAr: string;
  cta: string;
  ctaAr: string;
  variations: Array<{ headline: string; primaryText: string }>;
}> => {
  logger.info(`[YoussefCMO] Generating ad copy for ${platform}`);

  const youssef = getBoardMemberByRole(BoardRole.CMO);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `${youssef?.systemPromptBase || ''}

أنت تكتب نصوص إعلانية لـ Xchange Egypt.
الإعلانات يجب أن تكون جذابة للمصريين وتبني الثقة.`,
      messages: [
        {
          role: 'user',
          content: `Create ad copy for ${platform}:

Objective: ${campaignObjective}
Target Audience: ${targetAudience}

Return as JSON:
{
  "headline": "English headline (max 40 chars)",
  "headlineAr": "عنوان بالعربية",
  "primaryText": "Primary text (max 125 chars)",
  "primaryTextAr": "النص الرئيسي بالعربية",
  "cta": "Call to action",
  "ctaAr": "الدعوة للعمل",
  "variations": [
    {"headline": "Variation 1", "primaryText": "..."},
    {"headline": "Variation 2", "primaryText": "..."}
  ]
}`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }

    throw new Error('Failed to parse ad copy');
  } catch (error) {
    logger.error('[YoussefCMO] Ad copy generation error:', error);
    throw error;
  }
};

/**
 * Get campaign suggestions based on seasonality
 */
export const getSeasonalCampaignSuggestions = async (): Promise<
  Array<{
    occasion: string;
    occasionAr: string;
    date: string;
    campaignIdea: string;
    campaignIdeaAr: string;
    suggestedBudget: number;
    expectedROAS: number;
  }>
> => {
  logger.info('[YoussefCMO] Getting seasonal campaign suggestions');

  const currentMonth = new Date().getMonth() + 1;
  const egyptianOccasions = [
    { month: 1, occasion: "New Year Sales", occasionAr: "تخفيضات رأس السنة" },
    { month: 3, occasion: "Mother's Day", occasionAr: "عيد الأم" },
    { month: 4, occasion: "Ramadan", occasionAr: "رمضان" },
    { month: 5, occasion: "Eid al-Fitr", occasionAr: "عيد الفطر" },
    { month: 7, occasion: "Summer Sales", occasionAr: "تخفيضات الصيف" },
    { month: 9, occasion: "Back to School", occasionAr: "العودة للمدارس" },
    { month: 11, occasion: "Black Friday", occasionAr: "الجمعة البيضاء" },
    { month: 12, occasion: "Year End Sale", occasionAr: "تخفيضات نهاية العام" },
  ];

  const upcomingOccasions = egyptianOccasions.filter(
    (o) => o.month >= currentMonth && o.month <= currentMonth + 2
  );

  return upcomingOccasions.map((o) => ({
    occasion: o.occasion,
    occasionAr: o.occasionAr,
    date: `${o.month}/2025`,
    campaignIdea: `Special ${o.occasion} campaign focusing on secondhand deals`,
    campaignIdeaAr: `حملة ${o.occasionAr} خاصة للصفقات المستعملة`,
    suggestedBudget: 5000,
    expectedROAS: 3.5,
  }));
};

/**
 * Get Youssef's daily activity summary
 */
export const getDailyActivitySummary = async (): Promise<{
  contentGenerated: number;
  campaignsActive: number;
  reportsCreated: number;
  competitorUpdates: number;
  pendingApprovals: number;
}> => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // In production, fetch from database
  return {
    contentGenerated: 5,
    campaignsActive: 3,
    reportsCreated: 1,
    competitorUpdates: 1,
    pendingApprovals: 2,
  };
};

/**
 * Get available actions Youssef can perform
 */
export const getAvailableActions = (
  permissionLevel?: PermissionLevel
): Array<{
  action: string;
  category: MarketingCategory;
  permissionLevel: PermissionLevel;
  description: string;
}> => {
  let actions = ALL_YOUSSEF_ACTIONS;

  if (permissionLevel) {
    actions = actions.filter((a) => a.permissionLevel === permissionLevel);
  }

  return actions.map((a) => ({
    action: a.action,
    category: a.category,
    permissionLevel: a.permissionLevel,
    description: a.description,
  }));
};

export default {
  generateDailyContentPackage,
  generateCompetitorAnalysis,
  generateWeeklyMarketingReport,
  generateAdCopy,
  getSeasonalCampaignSuggestions,
  getDailyActivitySummary,
  getAvailableActions,
};
