/**
 * Omar COO Service
 * خدمة عمر مدير العمليات
 *
 * Handles Omar's operations execution capabilities:
 * - Response template creation
 * - SOP generation
 * - Operations reporting
 * - Bottleneck analysis
 * - Shipping performance tracking
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';
import {
  PermissionLevel,
  OperationsCategory,
  getActionConfig,
  ALL_OMAR_ACTIONS,
} from '../../config/board/omar-permissions.config';
import { getBoardMemberByRole, BoardRole } from '../../config/board/board-members.config';

const anthropic = new Anthropic();

export interface ResponseTemplate {
  id: string;
  category: string;
  categoryAr: string;
  scenario: string;
  scenarioAr: string;
  response: string;
  responseAr: string;
  tags: string[];
  createdAt: Date;
}

export interface SOP {
  id: string;
  title: string;
  titleAr: string;
  department: string;
  version: string;
  steps: SOPStep[];
  owner: string;
  lastUpdated: Date;
}

export interface SOPStep {
  order: number;
  action: string;
  actionAr: string;
  responsible: string;
  tools: string[];
  expectedTime: string;
  notes?: string;
}

export interface OperationsReport {
  id: string;
  date: Date;
  period: string;
  kpis: OperationsKPI[];
  orderMetrics: OrderMetrics;
  customerServiceMetrics: CustomerServiceMetrics;
  bottlenecks: Bottleneck[];
  recommendations: string[];
  recommendationsAr: string[];
}

export interface OperationsKPI {
  name: string;
  nameAr: string;
  value: number;
  target: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
  trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface OrderMetrics {
  totalOrders: number;
  completedOrders: number;
  pendingOrders: number;
  cancelledOrders: number;
  fulfillmentRate: number;
  averageDeliveryTime: number;
}

export interface CustomerServiceMetrics {
  totalTickets: number;
  resolvedTickets: number;
  pendingTickets: number;
  averageResponseTime: number;
  averageResolutionTime: number;
  satisfactionScore: number;
}

export interface Bottleneck {
  area: string;
  areaAr: string;
  issue: string;
  issueAr: string;
  impact: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedFix: string;
  suggestedFixAr: string;
}

const generateTaskId = (): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `OMAR-${date}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
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
 * Generate response templates for customer service
 * يتم تشغيلها كل يوم إثنين الساعة 8:00 صباحاً
 */
export const generateResponseTemplates = async (category: string): Promise<ResponseTemplate[]> => {
  logger.info(`[OmarCOO] Generating response templates for ${category}`);

  const omar = getBoardMemberByRole(BoardRole.COO);

  const categories = {
    refunds: 'طلبات الاسترداد',
    complaints: 'الشكاوى',
    shipping: 'الشحن والتوصيل',
    listings: 'الإعلانات والقوائم',
    payments: 'المدفوعات',
    general: 'استفسارات عامة',
  };

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      system: `${omar?.systemPromptBase || ''}

أنت تقوم بإنشاء قوالب ردود خدمة العملاء لـ Xchange Egypt.
الردود يجب أن تكون:
- ودية ومهنية
- بالعربية المصرية
- تحل المشكلة بسرعة
- تبني الثقة مع العميل`,
      messages: [
        {
          role: 'user',
          content: `Generate 3 customer service response templates for category: ${category}

Return as JSON array:
[
  {
    "scenario": "When customer asks about...",
    "scenarioAr": "عندما يسأل العميل عن...",
    "response": "English response",
    "responseAr": "الرد بالعربية المصرية",
    "tags": ["tag1", "tag2"]
  }
]

Make responses:
- Empathetic and helpful
- Clear about next steps
- Include relevant policies
- Use Egyptian Arabic dialect`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((t: any) => ({
        id: generateTaskId(),
        category,
        categoryAr: categories[category as keyof typeof categories] || category,
        scenario: t.scenario,
        scenarioAr: t.scenarioAr,
        response: t.response,
        responseAr: t.responseAr,
        tags: t.tags || [],
        createdAt: new Date(),
      }));
    }

    throw new Error('Failed to parse templates');
  } catch (error) {
    logger.error('[OmarCOO] Template generation error:', error);
    throw error;
  }
};

/**
 * Generate SOP document
 */
export const generateSOP = async (processName: string, department: string): Promise<SOP> => {
  logger.info(`[OmarCOO] Generating SOP for ${processName}`);

  const omar = getBoardMemberByRole(BoardRole.COO);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      system: `${omar?.systemPromptBase || ''}

أنت تقوم بإنشاء إجراء تشغيلي معياري (SOP) لـ Xchange Egypt.
الإجراء يجب أن يكون:
- واضح ومحدد
- قابل للتنفيذ
- يتضمن أوقات متوقعة
- يحدد المسؤوليات`,
      messages: [
        {
          role: 'user',
          content: `Create an SOP for: ${processName}
Department: ${department}

Return as JSON:
{
  "title": "SOP Title",
  "titleAr": "عنوان الإجراء",
  "steps": [
    {
      "order": 1,
      "action": "Step description",
      "actionAr": "وصف الخطوة",
      "responsible": "Role/Person",
      "tools": ["tool1", "tool2"],
      "expectedTime": "5 minutes",
      "notes": "Optional notes"
    }
  ]
}`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        id: generateTaskId(),
        title: parsed.title,
        titleAr: parsed.titleAr,
        department,
        version: '1.0',
        steps: parsed.steps || [],
        owner: 'Omar',
        lastUpdated: new Date(),
      };
    }

    throw new Error('Failed to parse SOP');
  } catch (error) {
    logger.error('[OmarCOO] SOP generation error:', error);
    throw error;
  }
};

/**
 * Generate daily operations report
 * يتم تشغيلها يومياً الساعة 5:00 مساءً
 */
export const generateDailyOperationsReport = async (): Promise<OperationsReport> => {
  logger.info('[OmarCOO] Generating daily operations report');

  const omar = getBoardMemberByRole(BoardRole.COO);

  // Get real KPI data from database
  const dbKPIs = await prisma.kPIMetric.findMany({
    where: {
      code: {
        in: ['ORDER_FULFILLMENT', 'DELIVERY_TIME', 'DISPUTE_RATE', 'SUPPORT_RESPONSE'],
      },
    },
  });

  const getKPIValue = (code: string): number => {
    const kpi = dbKPIs.find((k) => k.code === code);
    return kpi?.currentValue || 0;
  };

  // Calculate real metrics from platform data
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalTransactions,
    completedTransactions,
    pendingTransactions,
    failedTransactions,
    totalConversations,
    conversationsWithResponse,
  ] = await Promise.all([
    prisma.transaction.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.transaction.count({
      where: { createdAt: { gte: todayStart }, paymentStatus: 'COMPLETED' },
    }),
    prisma.transaction.count({
      where: { createdAt: { gte: todayStart }, paymentStatus: 'PENDING' },
    }),
    prisma.transaction.count({
      where: { createdAt: { gte: todayStart }, paymentStatus: 'FAILED' },
    }),
    prisma.conversation.count({
      where: { createdAt: { gte: todayStart } },
    }),
    prisma.conversation.count({
      where: { createdAt: { gte: todayStart }, lastMessageAt: { not: null } },
    }),
  ]);

  const orderMetrics: OrderMetrics = {
    totalOrders: totalTransactions,
    completedOrders: completedTransactions,
    pendingOrders: pendingTransactions,
    cancelledOrders: failedTransactions,
    fulfillmentRate: getKPIValue('ORDER_FULFILLMENT'),
    averageDeliveryTime: getKPIValue('DELIVERY_TIME'),
  };

  const csMetrics: CustomerServiceMetrics = {
    totalTickets: totalConversations,
    resolvedTickets: conversationsWithResponse,
    pendingTickets: totalConversations - conversationsWithResponse,
    averageResponseTime: getKPIValue('SUPPORT_RESPONSE'),
    averageResolutionTime: getKPIValue('SUPPORT_RESPONSE') * 4, // Estimated
    satisfactionScore: 4.2, // Would come from ratings
  };

  const operationsKPIs: OperationsKPI[] = [
    {
      name: 'Order Fulfillment Rate',
      nameAr: 'معدل تنفيذ الطلبات',
      value: orderMetrics.fulfillmentRate,
      target: 85,
      status: orderMetrics.fulfillmentRate >= 85 ? 'GREEN' : orderMetrics.fulfillmentRate >= 75 ? 'YELLOW' : 'RED',
      trend: 'UP',
    },
    {
      name: 'Customer Satisfaction',
      nameAr: 'رضا العملاء',
      value: csMetrics.satisfactionScore,
      target: 4.5,
      status: csMetrics.satisfactionScore >= 4.5 ? 'GREEN' : csMetrics.satisfactionScore >= 4.0 ? 'YELLOW' : 'RED',
      trend: 'STABLE',
    },
    {
      name: 'First Response Time (min)',
      nameAr: 'وقت الرد الأول (دقيقة)',
      value: csMetrics.averageResponseTime,
      target: 10,
      status: csMetrics.averageResponseTime <= 10 ? 'GREEN' : csMetrics.averageResponseTime <= 20 ? 'YELLOW' : 'RED',
      trend: 'DOWN',
    },
  ];

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `${omar?.systemPromptBase || ''}

أنت تقوم بتحليل بيانات العمليات وتحديد الاختناقات.`,
      messages: [
        {
          role: 'user',
          content: `Analyze today's operations data and identify bottlenecks:

Order Metrics: ${JSON.stringify(orderMetrics)}
Customer Service: ${JSON.stringify(csMetrics)}
KPIs: ${JSON.stringify(operationsKPIs)}

Return as JSON:
{
  "bottlenecks": [
    {
      "area": "Area name",
      "areaAr": "اسم المنطقة",
      "issue": "Issue description",
      "issueAr": "وصف المشكلة",
      "impact": "HIGH",
      "suggestedFix": "Fix suggestion",
      "suggestedFixAr": "اقتراح الحل"
    }
  ],
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

      const operationsReport: OperationsReport = {
        id: generateTaskId(),
        date: new Date(),
        period: 'Daily',
        kpis: operationsKPIs,
        orderMetrics,
        customerServiceMetrics: csMetrics,
        bottlenecks: parsed.bottlenecks || [],
        recommendations: parsed.recommendations || [],
        recommendationsAr: parsed.recommendationsAr || [],
      };

      // Save to BoardMemberDailyReport
      const omarMember = await prisma.boardMember.findFirst({
        where: { role: 'COO' },
      });

      if (omarMember) {
        const reportNumber = `OR-${new Date().getFullYear()}-${String(await getNextReportNumber('OPERATIONS_REPORT')).padStart(3, '0')}`;

        await prisma.boardMemberDailyReport.create({
          data: {
            reportNumber,
            type: 'OPERATIONS_REPORT',
            memberId: omarMember.id,
            memberRole: 'COO',
            date: new Date(),
            scheduledTime: '17:00',
            title: 'Daily Operations Report',
            titleAr: 'تقرير العمليات اليومي',
            summary: `Orders: ${orderMetrics.totalOrders} (${orderMetrics.fulfillmentRate.toFixed(1)}% fulfillment), CS: ${csMetrics.resolvedTickets}/${csMetrics.totalTickets} tickets resolved`,
            summaryAr: `الطلبات: ${orderMetrics.totalOrders} (${orderMetrics.fulfillmentRate.toFixed(1)}% تنفيذ)، خدمة العملاء: ${csMetrics.resolvedTickets}/${csMetrics.totalTickets} تذكرة محلولة`,
            content: operationsReport as object,
            keyMetrics: {
              totalOrders: orderMetrics.totalOrders,
              completedOrders: orderMetrics.completedOrders,
              fulfillmentRate: orderMetrics.fulfillmentRate,
              avgDeliveryTime: orderMetrics.averageDeliveryTime,
              totalTickets: csMetrics.totalTickets,
              resolvedTickets: csMetrics.resolvedTickets,
            },
            insights: parsed.bottlenecks as object,
            recommendations: parsed.recommendations as object,
            status: 'GENERATED',
            generatedAt: new Date(),
          },
        });

        logger.info(`[OmarCOO] Operations report saved to database: ${reportNumber}`);
      }

      return operationsReport;
    }

    throw new Error('Failed to parse report');
  } catch (error) {
    logger.error('[OmarCOO] Report generation error:', error);
    throw error;
  }
};

/**
 * Analyze shipping performance
 */
export const analyzeShippingPerformance = async (): Promise<{
  carriers: Array<{
    name: string;
    deliveries: number;
    onTimeRate: number;
    avgDeliveryDays: number;
    rating: number;
  }>;
  issues: string[];
  recommendations: string[];
}> => {
  logger.info('[OmarCOO] Analyzing shipping performance');

  // Simulated carrier data
  const carriers = [
    { name: 'Bosta', deliveries: 85, onTimeRate: 92, avgDeliveryDays: 2.1, rating: 4.5 },
    { name: 'Aramex', deliveries: 45, onTimeRate: 88, avgDeliveryDays: 2.8, rating: 4.2 },
    { name: 'mylerz', deliveries: 20, onTimeRate: 95, avgDeliveryDays: 1.5, rating: 4.7 },
  ];

  return {
    carriers,
    issues: [
      'Delayed deliveries in Upper Egypt regions',
      'High return rate for COD orders',
    ],
    recommendations: [
      'Consider expanding mylerz partnership for same-day delivery',
      'Implement SMS tracking updates to reduce customer inquiries',
    ],
  };
};

/**
 * Get Omar's daily activity summary
 */
export const getDailyActivitySummary = async (): Promise<{
  templatesCreated: number;
  sopsUpdated: number;
  reportsGenerated: number;
  bottlenecksIdentified: number;
  ticketsReviewed: number;
}> => {
  return {
    templatesCreated: 3,
    sopsUpdated: 1,
    reportsGenerated: 1,
    bottlenecksIdentified: 2,
    ticketsReviewed: 15,
  };
};

/**
 * Get available actions
 */
export const getAvailableActions = (permissionLevel?: PermissionLevel) => {
  let actions = ALL_OMAR_ACTIONS;
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
  generateResponseTemplates,
  generateSOP,
  generateDailyOperationsReport,
  analyzeShippingPerformance,
  getDailyActivitySummary,
  getAvailableActions,
};
