/**
 * Laila CFO Service
 * خدمة ليلى المدير المالي
 *
 * Handles Laila's financial execution capabilities:
 * - Daily financial reports
 * - Runway calculations
 * - Unit economics analysis
 * - Revenue forecasting
 * - Budget tracking
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';
import {
  PermissionLevel,
  FinanceCategory,
  getActionConfig,
  ALL_LAILA_ACTIONS,
} from '../../config/board/laila-permissions.config';
import { getBoardMemberByRole, BoardRole } from '../../config/board/board-members.config';

const anthropic = new Anthropic();

export interface FinancialReport {
  id: string;
  date: Date;
  period: string;
  revenue: RevenueMetrics;
  costs: CostMetrics;
  profitability: ProfitabilityMetrics;
  cashFlow: CashFlowMetrics;
  insights: string[];
  insightsAr: string[];
  alerts: FinancialAlert[];
}

export interface RevenueMetrics {
  gmv: number;
  revenue: number;
  takeRate: number;
  transactionCount: number;
  averageOrderValue: number;
  revenueGrowth: number;
}

export interface CostMetrics {
  totalCosts: number;
  cogs: number;
  marketing: number;
  operations: number;
  technology: number;
  personnel: number;
  other: number;
}

export interface ProfitabilityMetrics {
  grossProfit: number;
  grossMargin: number;
  netProfit: number;
  netMargin: number;
  ebitda: number;
}

export interface CashFlowMetrics {
  openingBalance: number;
  inflows: number;
  outflows: number;
  closingBalance: number;
  burnRate: number;
  runwayMonths: number;
}

export interface FinancialAlert {
  type: 'WARNING' | 'CRITICAL';
  message: string;
  messageAr: string;
  metric: string;
  currentValue: number;
  threshold: number;
}

export interface UnitEconomics {
  cac: number;
  ltv: number;
  ltvCacRatio: number;
  paybackPeriod: number;
  averageRevenuePerUser: number;
  churnRate: number;
  insights: string[];
  insightsAr: string[];
}

export interface RunwayAnalysis {
  id: string;
  date: Date;
  currentCash: number;
  monthlyBurnRate: number;
  runwayMonths: number;
  scenarios: RunwayScenario[];
  recommendations: string[];
  recommendationsAr: string[];
}

export interface RunwayScenario {
  name: string;
  nameAr: string;
  burnRateChange: number;
  newRunway: number;
  assumptions: string[];
}

const generateTaskId = (): string => {
  const date = new Date().toISOString().split('T')[0].replace(/-/g, '');
  return `LAILA-${date}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
};

/**
 * Generate daily financial report
 * يتم تشغيلها يومياً الساعة 7:30 صباحاً
 */
export const generateDailyFinancialReport = async (): Promise<FinancialReport> => {
  logger.info('[LailaCFO] Generating daily financial report');

  const laila = getBoardMemberByRole(BoardRole.CFO);

  // Simulated financial data - in production, fetch from database/accounting system
  const revenue: RevenueMetrics = {
    gmv: 250000,
    revenue: 12500, // 5% take rate
    takeRate: 5,
    transactionCount: 85,
    averageOrderValue: 2941,
    revenueGrowth: 8.5,
  };

  const costs: CostMetrics = {
    totalCosts: 15000,
    cogs: 2000,
    marketing: 5000,
    operations: 3000,
    technology: 2500,
    personnel: 2000,
    other: 500,
  };

  const profitability: ProfitabilityMetrics = {
    grossProfit: revenue.revenue - costs.cogs,
    grossMargin: ((revenue.revenue - costs.cogs) / revenue.revenue) * 100,
    netProfit: revenue.revenue - costs.totalCosts,
    netMargin: ((revenue.revenue - costs.totalCosts) / revenue.revenue) * 100,
    ebitda: revenue.revenue - costs.totalCosts + 500,
  };

  const cashFlow: CashFlowMetrics = {
    openingBalance: 500000,
    inflows: revenue.revenue,
    outflows: costs.totalCosts,
    closingBalance: 500000 + revenue.revenue - costs.totalCosts,
    burnRate: costs.totalCosts - revenue.revenue,
    runwayMonths: 500000 / (costs.totalCosts - revenue.revenue > 0 ? costs.totalCosts - revenue.revenue : 1),
  };

  const alerts: FinancialAlert[] = [];

  if (cashFlow.runwayMonths < 6) {
    alerts.push({
      type: 'CRITICAL',
      message: 'Runway is below 6 months',
      messageAr: 'المدى الزمني أقل من 6 أشهر',
      metric: 'runway',
      currentValue: cashFlow.runwayMonths,
      threshold: 6,
    });
  }

  if (profitability.netMargin < -20) {
    alerts.push({
      type: 'WARNING',
      message: 'Net margin is significantly negative',
      messageAr: 'هامش الربح سالب بشكل كبير',
      metric: 'netMargin',
      currentValue: profitability.netMargin,
      threshold: -20,
    });
  }

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      system: `${laila?.systemPromptBase || ''}

أنت تقوم بتحليل البيانات المالية وتقديم رؤى استراتيجية.
ركز على: الكفاءة المالية، المخاطر، فرص التحسين.`,
      messages: [
        {
          role: 'user',
          content: `Analyze today's financial data:

Revenue: ${JSON.stringify(revenue)}
Costs: ${JSON.stringify(costs)}
Profitability: ${JSON.stringify(profitability)}
Cash Flow: ${JSON.stringify(cashFlow)}

Return as JSON:
{
  "insights": ["insight1", "insight2"],
  "insightsAr": ["رؤية 1", "رؤية 2"]
}`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { insights: [], insightsAr: [] };

    return {
      id: generateTaskId(),
      date: new Date(),
      period: 'Daily',
      revenue,
      costs,
      profitability,
      cashFlow,
      insights: parsed.insights || [],
      insightsAr: parsed.insightsAr || [],
      alerts,
    };
  } catch (error) {
    logger.error('[LailaCFO] Report generation error:', error);
    throw error;
  }
};

/**
 * Calculate runway with scenarios
 * يتم تشغيلها كل جمعة الساعة 8:00 صباحاً
 */
export const calculateRunway = async (): Promise<RunwayAnalysis> => {
  logger.info('[LailaCFO] Calculating runway analysis');

  const laila = getBoardMemberByRole(BoardRole.CFO);

  const currentCash = 500000; // EGP
  const monthlyBurnRate = 25000; // EGP
  const runwayMonths = currentCash / monthlyBurnRate;

  const scenarios: RunwayScenario[] = [
    {
      name: 'Conservative',
      nameAr: 'متحفظ',
      burnRateChange: 20,
      newRunway: currentCash / (monthlyBurnRate * 1.2),
      assumptions: ['Increased marketing spend', 'New hires'],
    },
    {
      name: 'Current Pace',
      nameAr: 'الوتيرة الحالية',
      burnRateChange: 0,
      newRunway: runwayMonths,
      assumptions: ['No major changes'],
    },
    {
      name: 'Optimized',
      nameAr: 'محسّن',
      burnRateChange: -15,
      newRunway: currentCash / (monthlyBurnRate * 0.85),
      assumptions: ['Cost reduction', 'Revenue growth'],
    },
    {
      name: 'Break-even Path',
      nameAr: 'مسار التعادل',
      burnRateChange: -100,
      newRunway: Infinity,
      assumptions: ['Achieve profitability'],
    },
  ];

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `${laila?.systemPromptBase || ''}

أنت تقوم بتحليل المدى الزمني المالي وتقديم توصيات.`,
      messages: [
        {
          role: 'user',
          content: `Analyze runway:
Current Cash: ${currentCash} EGP
Monthly Burn: ${monthlyBurnRate} EGP
Runway: ${runwayMonths.toFixed(1)} months

Provide recommendations in JSON:
{
  "recommendations": ["recommendation1"],
  "recommendationsAr": ["توصية 1"]
}`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { recommendations: [], recommendationsAr: [] };

    return {
      id: generateTaskId(),
      date: new Date(),
      currentCash,
      monthlyBurnRate,
      runwayMonths,
      scenarios,
      recommendations: parsed.recommendations || [],
      recommendationsAr: parsed.recommendationsAr || [],
    };
  } catch (error) {
    logger.error('[LailaCFO] Runway calculation error:', error);
    throw error;
  }
};

/**
 * Calculate unit economics
 */
export const calculateUnitEconomics = async (): Promise<UnitEconomics> => {
  logger.info('[LailaCFO] Calculating unit economics');

  const laila = getBoardMemberByRole(BoardRole.CFO);

  // Simulated data
  const cac = 35; // EGP
  const ltv = 180; // EGP
  const ltvCacRatio = ltv / cac;
  const paybackPeriod = cac / (ltv / 12);
  const arpu = 15; // Monthly
  const churnRate = 5; // %

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: `${laila?.systemPromptBase || ''}

أنت تقوم بتحليل اقتصاديات الوحدة.`,
      messages: [
        {
          role: 'user',
          content: `Analyze unit economics:
CAC: ${cac} EGP
LTV: ${ltv} EGP
LTV/CAC Ratio: ${ltvCacRatio.toFixed(2)}
Payback Period: ${paybackPeriod.toFixed(1)} months
ARPU: ${arpu} EGP
Churn: ${churnRate}%

Provide insights:
{
  "insights": ["insight1"],
  "insightsAr": ["رؤية 1"]
}`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { insights: [], insightsAr: [] };

    return {
      cac,
      ltv,
      ltvCacRatio,
      paybackPeriod,
      averageRevenuePerUser: arpu,
      churnRate,
      insights: parsed.insights || [],
      insightsAr: parsed.insightsAr || [],
    };
  } catch (error) {
    logger.error('[LailaCFO] Unit economics error:', error);
    throw error;
  }
};

/**
 * Generate monthly financial analysis
 * يتم تشغيلها أول كل شهر الساعة 8:00 صباحاً
 */
export const generateMonthlyAnalysis = async (): Promise<{
  id: string;
  month: string;
  yearOverYear: any;
  monthOverMonth: any;
  trends: string[];
  trendsAr: string[];
  forecast: any;
}> => {
  logger.info('[LailaCFO] Generating monthly financial analysis');

  return {
    id: generateTaskId(),
    month: new Date().toLocaleDateString('en-EG', { month: 'long', year: 'numeric' }),
    yearOverYear: {
      revenueGrowth: 45,
      gmvGrowth: 52,
      userGrowth: 38,
    },
    monthOverMonth: {
      revenueGrowth: 8,
      gmvGrowth: 10,
      userGrowth: 5,
    },
    trends: [
      'Consistent revenue growth trajectory',
      'Marketing efficiency improving',
      'Unit economics approaching sustainability',
    ],
    trendsAr: [
      'مسار نمو إيرادات مستمر',
      'تحسن كفاءة التسويق',
      'اقتصاديات الوحدة تقترب من الاستدامة',
    ],
    forecast: {
      nextMonthRevenue: 15000,
      nextQuarterRevenue: 50000,
      breakEvenMonth: 'Q3 2025',
    },
  };
};

/**
 * Get Laila's daily activity summary
 */
export const getDailyActivitySummary = async (): Promise<{
  reportsGenerated: number;
  alertsRaised: number;
  forecastsUpdated: number;
  budgetReviews: number;
}> => {
  return {
    reportsGenerated: 1,
    alertsRaised: 0,
    forecastsUpdated: 1,
    budgetReviews: 2,
  };
};

/**
 * Get available actions
 */
export const getAvailableActions = (permissionLevel?: PermissionLevel) => {
  let actions = ALL_LAILA_ACTIONS;
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
  generateDailyFinancialReport,
  calculateRunway,
  calculateUnitEconomics,
  generateMonthlyAnalysis,
  getDailyActivitySummary,
  getAvailableActions,
};
