/**
 * Environment Scanner Service
 * خدمة المسح البيئي الخارجي
 *
 * Runs twice weekly (Sunday & Wednesday at 11:00 AM)
 * Scans external environment for:
 * - Market trends
 * - Competitor moves
 * - Regulatory changes
 * - Technology trends
 * - Economic indicators
 * - Consumer behavior
 */

import prisma from '../../lib/prisma';
import logger from '../../lib/logger';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic();

interface MarketTrend {
  trend: string;
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  source: string;
  confidence: number;
}

interface CompetitorMove {
  competitor: string;
  move: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
}

interface RegulatoryChange {
  change: string;
  impact: string;
  deadline?: Date;
  source: string;
}

interface EconomicIndicator {
  indicator: string;
  value: string | number;
  change: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
}

/**
 * Generate scan number
 */
const generateScanNumber = async (): Promise<string> => {
  const today = new Date();
  const year = today.getFullYear();

  // Calculate week number
  const startOfYear = new Date(year, 0, 1);
  const diff = today.getTime() - startOfYear.getTime();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const weekNumber = Math.ceil(diff / oneWeek);

  const dayOfWeek = today.getDay() === 0 ? 'SUN' : 'WED';

  return `SCAN-${year}-W${String(weekNumber).padStart(2, '0')}-${dayOfWeek}`;
};

/**
 * Scan market trends using AI analysis
 */
const scanMarketTrends = async (): Promise<MarketTrend[]> => {
  try {
    // In production, this would use web scraping or news APIs
    // For now, we'll use AI to generate insights based on general knowledge

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `As an analyst for an Egyptian C2C marketplace (similar to OLX), identify 3 current market trends in the Egyptian e-commerce/marketplace sector.

Format as JSON array:
[{"trend": "...", "impact": "POSITIVE|NEGATIVE|NEUTRAL", "confidence": 0.7}]`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const trends = JSON.parse(jsonMatch[0]);
      return trends.map((t: { trend: string; impact: string; confidence: number }) => ({
        ...t,
        source: 'AI_ANALYSIS',
      }));
    }
    return [];
  } catch (error) {
    logger.error('[EnvironmentScanner] Market trends scan error:', error);
    return [];
  }
};

/**
 * Scan competitor activities
 */
const scanCompetitors = async (): Promise<CompetitorMove[]> => {
  try {
    // Get competitor data from our database
    const competitors = await prisma.competitorWatch.findMany({
      orderBy: { threatLevel: 'desc' },
    });

    const moves: CompetitorMove[] = [];

    // Use AI to analyze potential competitive threats
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Analyze potential competitive moves from these Egyptian marketplace competitors: OLX Egypt, Dubizzle, Facebook Marketplace.

What recent or likely moves should Xchange watch for?

Format as JSON array:
[{"competitor": "...", "move": "...", "threatLevel": "LOW|MEDIUM|HIGH|CRITICAL"}]`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const aiMoves = JSON.parse(jsonMatch[0]);
      moves.push(
        ...aiMoves.map((m: { competitor: string; move: string; threatLevel: string }) => ({
          ...m,
          source: 'AI_ANALYSIS',
        }))
      );
    }

    // Add any recent activities from our competitor tracking
    for (const comp of competitors) {
      if (comp.lastActivity) {
        moves.push({
          competitor: comp.competitorName,
          move: comp.lastActivity,
          threatLevel: comp.threatLevel,
          source: 'INTERNAL_TRACKING',
        });
      }
    }

    return moves;
  } catch (error) {
    logger.error('[EnvironmentScanner] Competitor scan error:', error);
    return [];
  }
};

/**
 * Scan regulatory environment
 */
const scanRegulatory = async (): Promise<RegulatoryChange[]> => {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `What are current or upcoming regulatory considerations for e-commerce marketplaces in Egypt?
Consider: consumer protection, digital payments, data privacy, cross-border commerce.

Format as JSON array:
[{"change": "...", "impact": "...", "deadline": null}]`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const changes = JSON.parse(jsonMatch[0]);
      return changes.map((c: { change: string; impact: string; deadline?: string }) => ({
        ...c,
        source: 'AI_ANALYSIS',
      }));
    }
    return [];
  } catch (error) {
    logger.error('[EnvironmentScanner] Regulatory scan error:', error);
    return [];
  }
};

/**
 * Scan technology trends
 */
const scanTechTrends = async (): Promise<{ trend: string; relevance: string; adoptionTimeline: string }[]> => {
  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: `What are the top 3 technology trends that could impact C2C marketplaces in Egypt?
Consider: AI, mobile payments, logistics tech, verification systems.

Format as JSON array:
[{"trend": "...", "relevance": "...", "adoptionTimeline": "SHORT|MEDIUM|LONG"}]`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '[]';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error) {
    logger.error('[EnvironmentScanner] Tech trends scan error:', error);
    return [];
  }
};

/**
 * Get economic indicators
 */
const getEconomicIndicators = async (): Promise<EconomicIndicator[]> => {
  // In production, this would fetch from economic data APIs
  // For now, return placeholder data

  return [
    { indicator: 'USD/EGP Exchange Rate', value: '30.90', change: '+0.5%', trend: 'UP' as const },
    { indicator: 'Inflation Rate (Annual)', value: '35.2%', change: '-1.3%', trend: 'DOWN' as const },
    { indicator: 'Consumer Confidence Index', value: '68', change: '+2', trend: 'UP' as const },
    { indicator: 'E-commerce Growth (YoY)', value: '+18%', change: '+3%', trend: 'UP' as const },
  ];
};

/**
 * Generate SWOT analysis
 */
const generateSWOTAnalysis = async (
  marketTrends: MarketTrend[],
  competitorMoves: CompetitorMove[],
  regulatoryChanges: RegulatoryChange[]
): Promise<{
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}> => {
  try {
    const context = {
      trends: marketTrends.slice(0, 3),
      competitors: competitorMoves.slice(0, 3),
      regulatory: regulatoryChanges.slice(0, 2),
    };

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 500,
      messages: [
        {
          role: 'user',
          content: `Based on this environmental scan data for Xchange Egypt (a C2C marketplace with barter features):
${JSON.stringify(context, null, 2)}

Generate a SWOT analysis with 2-3 items each.

Format as JSON:
{"strengths": [...], "weaknesses": [...], "opportunities": [...], "threats": [...]}`,
        },
      ],
    });

    const content = message.content[0].type === 'text' ? message.content[0].text : '{}';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  } catch (error) {
    logger.error('[EnvironmentScanner] SWOT analysis error:', error);
    return { strengths: [], weaknesses: [], opportunities: [], threats: [] };
  }
};

/**
 * Main function to run environment scan
 */
export const runEnvironmentScan = async () => {
  const today = new Date();
  const dayOfWeek = today.getDay();

  // Only run on Sunday (0) and Wednesday (3)
  if (dayOfWeek !== 0 && dayOfWeek !== 3) {
    logger.info('[EnvironmentScanner] Not a scan day, skipping');
    return null;
  }

  logger.info('[EnvironmentScanner] Starting environment scan...');

  // 1. Generate scan number
  const scanNumber = await generateScanNumber();
  const weekNumber = parseInt(scanNumber.split('-W')[1]?.split('-')[0] || '1');

  // 2. Run all scans in parallel
  const [marketTrends, competitorMoves, regulatoryChanges, techTrends, economicIndicators] = await Promise.all([
    scanMarketTrends(),
    scanCompetitors(),
    scanRegulatory(),
    scanTechTrends(),
    getEconomicIndicators(),
  ]);

  // 3. Generate SWOT analysis
  const swotAnalysis = await generateSWOTAnalysis(marketTrends, competitorMoves, regulatoryChanges);

  // 4. Identify urgent actions
  const urgentActions: { action: string; priority: string; deadline?: string }[] = [];

  // High-threat competitor moves need response
  const criticalMoves = competitorMoves.filter((m) => m.threatLevel === 'CRITICAL' || m.threatLevel === 'HIGH');
  for (const move of criticalMoves) {
    urgentActions.push({
      action: `Respond to ${move.competitor}: ${move.move}`,
      priority: move.threatLevel,
    });
  }

  // 5. Generate strategic recommendations
  const strategicRecommendations = [
    ...swotAnalysis.opportunities.map((o) => ({ recommendation: `Pursue opportunity: ${o}`, type: 'OPPORTUNITY' })),
    ...swotAnalysis.threats.map((t) => ({ recommendation: `Mitigate threat: ${t}`, type: 'THREAT' })),
  ];

  // 6. Save scan to database
  const scan = await prisma.environmentScan.create({
    data: {
      scanNumber,
      weekNumber,
      dayOfWeek: dayOfWeek === 0 ? 'SUN' : 'WED',
      date: today,
      marketTrends: marketTrends as object,
      competitorMoves: competitorMoves as object,
      regulatoryChanges: regulatoryChanges as object,
      techTrends: techTrends as object,
      economicIndicators: economicIndicators as object,
      swotAnalysis: swotAnalysis as object,
      strategicRecommendations: strategicRecommendations as object,
      urgentActions: urgentActions as object,
      sourcesUsed: [
        { source: 'AI_ANALYSIS', reliability: 0.7 },
        { source: 'INTERNAL_TRACKING', reliability: 0.9 },
      ],
      confidenceLevel: 0.75,
    },
  });

  // 7. Update competitor watch with latest scan time
  await prisma.competitorWatch.updateMany({
    data: { lastScannedAt: today },
  });

  logger.info(`[EnvironmentScanner] Scan ${scanNumber} completed`);
  logger.info(`  - Market trends: ${marketTrends.length}`);
  logger.info(`  - Competitor moves: ${competitorMoves.length}`);
  logger.info(`  - Regulatory changes: ${regulatoryChanges.length}`);
  logger.info(`  - Urgent actions: ${urgentActions.length}`);

  return scan;
};

export default {
  runEnvironmentScan,
};
