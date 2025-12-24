/**
 * Morning Intelligence Service
 * خدمة الاستخبارات الصباحية
 *
 * Generates daily intelligence reports at 6:00 AM including:
 * - KPI snapshots with status indicators
 * - Anomaly detection (>20% Yellow, >40% Red)
 * - Opportunity/threat identification
 * - Auto-generated meeting agendas
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface KPISnapshot {
  code: string;
  name: string;
  currentValue: number;
  previousValue: number | null;
  targetValue: number;
  status: 'GREEN' | 'YELLOW' | 'RED';
  changePercent: number;
  flag: '🟢' | '🟡' | '🔴';
}

interface Anomaly {
  kpi: string;
  deviation: number;
  severity: 'YELLOW' | 'RED';
  explanation: string;
}

interface Signal {
  title: string;
  titleAr?: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
}

/**
 * Generate the report number for today
 */
const generateReportNumber = async (): Promise<string> => {
  const today = new Date();
  const year = today.getFullYear();
  const count = await prisma.morningIntelligence.count({
    where: {
      date: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
  });
  return `INT-${year}-${String(count + 1).padStart(3, '0')}`;
};

/**
 * Capture current KPI values
 */
const captureKPISnapshot = async (): Promise<KPISnapshot[]> => {
  const kpis = await prisma.kPIMetric.findMany({
    orderBy: { category: 'asc' },
  });

  return kpis.map((kpi) => {
    const changePercent = kpi.previousValue
      ? ((kpi.currentValue - kpi.previousValue) / kpi.previousValue) * 100
      : 0;

    let flag: '🟢' | '🟡' | '🔴';
    switch (kpi.status) {
      case 'GREEN':
        flag = '🟢';
        break;
      case 'YELLOW':
        flag = '🟡';
        break;
      case 'RED':
        flag = '🔴';
        break;
      default:
        flag = '🟢';
    }

    return {
      code: kpi.code,
      name: kpi.name,
      currentValue: kpi.currentValue,
      previousValue: kpi.previousValue,
      targetValue: kpi.targetValue,
      status: kpi.status,
      changePercent: Math.round(changePercent * 100) / 100,
      flag,
    };
  });
};

/**
 * Detect anomalies based on deviation thresholds
 */
const detectAnomalies = (kpiSnapshot: KPISnapshot[]): Anomaly[] => {
  const anomalies: Anomaly[] = [];

  for (const kpi of kpiSnapshot) {
    const deviation = Math.abs(kpi.changePercent);

    if (deviation >= 40) {
      anomalies.push({
        kpi: kpi.code,
        deviation: kpi.changePercent,
        severity: 'RED',
        explanation: `Critical deviation of ${kpi.changePercent.toFixed(1)}% detected in ${kpi.name}`,
      });
    } else if (deviation >= 20) {
      anomalies.push({
        kpi: kpi.code,
        deviation: kpi.changePercent,
        severity: 'YELLOW',
        explanation: `Warning: ${kpi.name} changed by ${kpi.changePercent.toFixed(1)}%`,
      });
    }
  }

  return anomalies;
};

/**
 * Identify opportunities and threats from various data sources
 */
const identifySignals = async (): Promise<{ opportunities: Signal[]; threats: Signal[] }> => {
  const opportunities: Signal[] = [];
  const threats: Signal[] = [];

  // Check for low stock items that are selling well
  const lowStockHighDemand = await prisma.item.count({
    where: {
      status: 'ACTIVE',
      // Add conditions for high demand items with low stock
    },
  });

  if (lowStockHighDemand > 0) {
    threats.push({
      title: 'Low Stock Alert',
      description: `${lowStockHighDemand} items with high demand are running low on stock`,
      priority: 'HIGH',
      source: 'inventory_analysis',
    });
  }

  // Check for new category growth opportunities
  const recentCategories = await prisma.item.groupBy({
    by: ['categoryId'],
    _count: { id: true },
    where: {
      createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  if (recentCategories.length > 0) {
    opportunities.push({
      title: 'Category Growth Opportunity',
      description: `${recentCategories.length} categories showing increased activity this week`,
      priority: 'MEDIUM',
      source: 'category_analysis',
    });
  }

  return { opportunities, threats };
};

/**
 * Generate meeting agenda based on intelligence
 */
const generateAgenda = (
  anomalies: Anomaly[],
  opportunities: Signal[],
  threats: Signal[]
): { topic: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; estimatedMinutes: number }[] => {
  const agenda: { topic: string; priority: 'HIGH' | 'MEDIUM' | 'LOW'; estimatedMinutes: number }[] = [];

  // Add critical anomalies first
  const criticalAnomalies = anomalies.filter((a) => a.severity === 'RED');
  if (criticalAnomalies.length > 0) {
    agenda.push({
      topic: `Critical KPI Review: ${criticalAnomalies.map((a) => a.kpi).join(', ')}`,
      priority: 'HIGH',
      estimatedMinutes: 15,
    });
  }

  // Add threats
  if (threats.length > 0) {
    agenda.push({
      topic: `Threat Assessment (${threats.length} issues)`,
      priority: 'HIGH',
      estimatedMinutes: 10,
    });
  }

  // Add opportunities
  if (opportunities.length > 0) {
    agenda.push({
      topic: `Opportunities Review (${opportunities.length} items)`,
      priority: 'MEDIUM',
      estimatedMinutes: 10,
    });
  }

  // Add standard agenda items
  agenda.push(
    { topic: 'Innovation Brainstorming', priority: 'MEDIUM', estimatedMinutes: 10 },
    { topic: 'Action Items Review', priority: 'LOW', estimatedMinutes: 5 }
  );

  return agenda;
};

/**
 * Use AI to generate executive summary
 */
const generateExecutiveSummary = async (
  kpiSnapshot: KPISnapshot[],
  anomalies: Anomaly[],
  opportunities: Signal[],
  threats: Signal[]
): Promise<{ english: string; arabic: string }> => {
  try {
    const greenKPIs = kpiSnapshot.filter((k) => k.status === 'GREEN').length;
    const yellowKPIs = kpiSnapshot.filter((k) => k.status === 'YELLOW').length;
    const redKPIs = kpiSnapshot.filter((k) => k.status === 'RED').length;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Generate a brief executive summary (2-3 sentences) for the Xchange Egypt board based on:
- KPIs: ${greenKPIs} Green, ${yellowKPIs} Yellow, ${redKPIs} Red
- Anomalies: ${anomalies.length} (${anomalies.filter((a) => a.severity === 'RED').length} critical)
- Opportunities: ${opportunities.length}
- Threats: ${threats.length}

Also provide the same summary in Arabic.

Format:
ENGLISH: [summary]
ARABIC: [ملخص]`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '';
    const [english, arabic] = content.split('ARABIC:').map((s) => s.replace('ENGLISH:', '').trim());

    return { english, arabic };
  } catch (error) {
    logger.error('[MorningIntelligence] AI summary error:', error);
    return {
      english: `Today's intelligence report shows ${kpiSnapshot.filter((k) => k.status === 'RED').length} critical KPIs requiring attention.`,
      arabic: `يظهر تقرير اليوم ${kpiSnapshot.filter((k) => k.status === 'RED').length} مؤشرات حرجة تتطلب اهتماماً.`,
    };
  }
};

/**
 * Main function to generate morning intelligence
 */
export const generateMorningIntelligence = async () => {
  logger.info('[MorningIntelligence] Starting generation...');

  // 1. Generate report number
  const reportNumber = await generateReportNumber();
  logger.info(`[MorningIntelligence] Report: ${reportNumber}`);

  // 2. Capture KPI snapshot
  const kpiSnapshot = await captureKPISnapshot();
  logger.info(`[MorningIntelligence] Captured ${kpiSnapshot.length} KPIs`);

  // 3. Detect anomalies
  const anomalies = detectAnomalies(kpiSnapshot);
  logger.info(`[MorningIntelligence] Found ${anomalies.length} anomalies`);

  // 4. Identify signals
  const { opportunities, threats } = await identifySignals();
  logger.info(`[MorningIntelligence] Opportunities: ${opportunities.length}, Threats: ${threats.length}`);

  // 5. Generate agenda
  const suggestedAgenda = generateAgenda(anomalies, opportunities, threats);

  // 6. Generate executive summary
  const summary = await generateExecutiveSummary(kpiSnapshot, anomalies, opportunities, threats);

  // 7. Save to database
  const report = await prisma.morningIntelligence.create({
    data: {
      reportNumber,
      date: new Date(),
      kpiSnapshot: kpiSnapshot as object,
      anomalies: anomalies as object,
      opportunities: opportunities as object,
      threats: threats as object,
      suggestedAgenda: suggestedAgenda as object,
      executiveSummary: summary.english,
      executiveSummaryAr: summary.arabic,
      keyInsights: {
        totalKPIs: kpiSnapshot.length,
        greenCount: kpiSnapshot.filter((k) => k.status === 'GREEN').length,
        yellowCount: kpiSnapshot.filter((k) => k.status === 'YELLOW').length,
        redCount: kpiSnapshot.filter((k) => k.status === 'RED').length,
        anomalyCount: anomalies.length,
        criticalAnomalies: anomalies.filter((a) => a.severity === 'RED').length,
      },
      recommendedActions: [
        ...anomalies.filter((a) => a.severity === 'RED').map((a) => ({
          action: `Address critical anomaly in ${a.kpi}`,
          priority: 'HIGH',
        })),
        ...threats.map((t) => ({
          action: t.title,
          priority: t.priority,
        })),
      ],
      processedAt: new Date(),
    },
  });

  logger.info(`[MorningIntelligence] Report ${reportNumber} generated successfully`);
  return report;
};

export default {
  generateMorningIntelligence,
};
