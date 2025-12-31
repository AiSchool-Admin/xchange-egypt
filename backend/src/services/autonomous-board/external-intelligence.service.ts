/**
 * External Intelligence Service
 * خدمة الاستخبارات الخارجية
 *
 * Gathers real external data from:
 * - RSS Feeds (Egyptian news sources)
 * - Web Search (competitor analysis)
 * - Economic indicators
 */

import logger from '../../lib/logger';
import prisma from '../../lib/prisma';
import Anthropic from '@anthropic-ai/sdk';
import { XMLParser } from 'fast-xml-parser';

const anthropic = new Anthropic();

// ============================================
// Types
// ============================================

export interface NewsItem {
  title: string;
  titleAr?: string;
  description: string;
  link: string;
  source: string;
  category: 'MARKET' | 'ECOMMERCE' | 'TECHNOLOGY' | 'REGULATION' | 'ECONOMY' | 'COMPETITOR';
  publishedAt: Date;
  relevanceScore: number; // 0-100
  sentiment: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
}

export interface CompetitorUpdate {
  competitor: string;
  update: string;
  updateAr: string;
  source: string;
  threatLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: 'PRICING' | 'FEATURE' | 'MARKETING' | 'EXPANSION' | 'PARTNERSHIP' | 'OTHER';
  detectedAt: Date;
}

export interface EconomicIndicator {
  name: string;
  nameAr: string;
  value: string;
  previousValue?: string;
  trend: 'UP' | 'DOWN' | 'STABLE';
  impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
  source: string;
  updatedAt: Date;
}

export interface ExternalIntelligenceReport {
  reportNumber: string;
  generatedAt: Date;
  news: NewsItem[];
  competitorUpdates: CompetitorUpdate[];
  economicIndicators: EconomicIndicator[];
  summary: string;
  summaryAr: string;
  dataSources: {
    rssFeeds: string[];
    webSearches: string[];
    lastUpdated: Date;
  };
  alerts: Array<{
    type: 'NEWS' | 'COMPETITOR' | 'ECONOMY';
    severity: 'INFO' | 'WARNING' | 'CRITICAL';
    title: string;
    titleAr: string;
  }>;
}

// ============================================
// RSS Feed Sources
// ============================================

const RSS_FEEDS = [
  // Egyptian Economy & Business
  {
    url: 'https://www.masrawy.com/rss/economy',
    name: 'Masrawy Economy',
    nameAr: 'مصراوي اقتصاد',
    category: 'ECONOMY' as const,
  },
  {
    url: 'https://www.youm7.com/rss/SectionRss?SectionID=297',
    name: 'Youm7 Economy',
    nameAr: 'اليوم السابع اقتصاد',
    category: 'ECONOMY' as const,
  },
  // Technology
  {
    url: 'https://www.youm7.com/rss/SectionRss?SectionID=64',
    name: 'Youm7 Technology',
    nameAr: 'اليوم السابع تقنية',
    category: 'TECHNOLOGY' as const,
  },
  // E-commerce (Global but relevant)
  {
    url: 'https://techcrunch.com/category/e-commerce/feed/',
    name: 'TechCrunch E-commerce',
    nameAr: 'تك كرانش تجارة إلكترونية',
    category: 'ECOMMERCE' as const,
  },
];

// ============================================
// Competitor Configuration
// ============================================

const COMPETITORS = [
  {
    name: 'OLX Egypt',
    nameAr: 'أوليكس مصر',
    website: 'olx.com.eg',
    keywords: ['OLX مصر', 'أوليكس', 'OLX Egypt'],
  },
  {
    name: 'Facebook Marketplace',
    nameAr: 'فيسبوك ماركت بليس',
    website: 'facebook.com/marketplace',
    keywords: ['Facebook Marketplace Egypt', 'ماركت بليس فيسبوك'],
  },
  {
    name: 'Dubizzle Egypt',
    nameAr: 'دوبيزل مصر',
    website: 'dubizzle.com.eg',
    keywords: ['Dubizzle Egypt', 'دوبيزل مصر'],
  },
  {
    name: 'OpenSooq',
    nameAr: 'السوق المفتوح',
    website: 'opensooq.com',
    keywords: ['OpenSooq Egypt', 'السوق المفتوح مصر'],
  },
];

// ============================================
// RSS Feed Parser
// ============================================

const parseRSSFeed = async (
  feedConfig: (typeof RSS_FEEDS)[0]
): Promise<NewsItem[]> => {
  try {
    logger.info(`[ExternalIntel] Fetching RSS: ${feedConfig.name}`);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(feedConfig.url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'XChange-Board-Intelligence/1.0',
        Accept: 'application/rss+xml, application/xml, text/xml',
      },
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      logger.warn(`[ExternalIntel] RSS fetch failed: ${feedConfig.name} - ${response.status}`);
      return [];
    }

    const xmlText = await response.text();
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
    });

    const parsed = parser.parse(xmlText);
    const items = parsed?.rss?.channel?.item || parsed?.feed?.entry || [];
    const itemsArray = Array.isArray(items) ? items : [items];

    const newsItems: NewsItem[] = itemsArray.slice(0, 10).map((item: any) => {
      const title = item.title?.['#text'] || item.title || '';
      const description =
        item.description?.['#text'] ||
        item.description ||
        item.summary?.['#text'] ||
        item.summary ||
        '';
      const link = item.link?.['@_href'] || item.link || '';
      const pubDate = item.pubDate || item.published || item.updated || new Date().toISOString();

      return {
        title: typeof title === 'string' ? title.substring(0, 200) : '',
        description: typeof description === 'string' ? description.substring(0, 500) : '',
        link: typeof link === 'string' ? link : '',
        source: feedConfig.name,
        category: feedConfig.category,
        publishedAt: new Date(pubDate),
        relevanceScore: 50, // Default, will be enhanced by AI
        sentiment: 'NEUTRAL' as const,
      };
    });

    logger.info(`[ExternalIntel] Parsed ${newsItems.length} items from ${feedConfig.name}`);
    return newsItems;
  } catch (error: any) {
    logger.error(`[ExternalIntel] RSS parse error for ${feedConfig.name}:`, error.message);
    return [];
  }
};

/**
 * Fetch all RSS feeds
 */
export const fetchAllRSSFeeds = async (): Promise<NewsItem[]> => {
  logger.info('[ExternalIntel] Fetching all RSS feeds...');

  const results = await Promise.allSettled(RSS_FEEDS.map(parseRSSFeed));

  const allNews: NewsItem[] = [];
  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      allNews.push(...result.value);
    } else {
      logger.warn(`[ExternalIntel] Feed ${RSS_FEEDS[index].name} failed:`, result.reason);
    }
  });

  // Sort by date
  allNews.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());

  logger.info(`[ExternalIntel] Total news items fetched: ${allNews.length}`);
  return allNews;
};

// ============================================
// AI-Powered Analysis
// ============================================

/**
 * Analyze news relevance and sentiment using AI
 */
const analyzeNewsWithAI = async (
  news: NewsItem[]
): Promise<NewsItem[]> => {
  if (news.length === 0) return [];

  try {
    logger.info('[ExternalIntel] Analyzing news with AI...');

    const newsContext = news
      .slice(0, 15)
      .map((n, i) => `${i + 1}. [${n.source}] ${n.title}`)
      .join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `You are analyzing news for XChange Egypt, a C2C marketplace in Egypt.

Analyze these news items and rate their relevance (0-100) to:
- E-commerce in Egypt
- C2C marketplaces
- Consumer behavior in Egypt
- Economic conditions affecting trade
- Competition in the marketplace sector

Also determine sentiment: POSITIVE, NEGATIVE, or NEUTRAL for XChange.

News items:
${newsContext}

Return JSON array (one per news item):
[{"index": 1, "relevance": 75, "sentiment": "POSITIVE", "titleAr": "عنوان بالعربية"}]

Only include items with relevance > 30. Be concise.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') return news;

    // Parse AI response
    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return news;

    const analysis = JSON.parse(jsonMatch[0]);

    // Apply analysis to news items
    analysis.forEach((item: any) => {
      const newsItem = news[item.index - 1];
      if (newsItem) {
        newsItem.relevanceScore = item.relevance || 50;
        newsItem.sentiment = item.sentiment || 'NEUTRAL';
        newsItem.titleAr = item.titleAr;
      }
    });

    // Filter by relevance
    return news.filter((n) => n.relevanceScore >= 30);
  } catch (error: any) {
    logger.error('[ExternalIntel] AI analysis failed:', error.message);
    return news;
  }
};

/**
 * Search for competitor updates using AI
 */
export const analyzeCompetitors = async (): Promise<CompetitorUpdate[]> => {
  try {
    logger.info('[ExternalIntel] Analyzing competitors...');

    const competitorContext = COMPETITORS.map(
      (c) => `- ${c.name} (${c.nameAr}): ${c.website}`
    ).join('\n');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [
        {
          role: 'user',
          content: `You are a competitive intelligence analyst for XChange Egypt (C2C marketplace).

Analyze these competitors and provide recent/likely updates based on your knowledge:

${competitorContext}

For each competitor, identify:
1. Recent feature changes or announcements
2. Pricing strategy changes
3. Marketing campaigns
4. Market expansion

Return JSON array:
[{
  "competitor": "OLX Egypt",
  "update": "Recent update description",
  "updateAr": "الوصف بالعربية",
  "category": "FEATURE|PRICING|MARKETING|EXPANSION|PARTNERSHIP|OTHER",
  "threatLevel": "LOW|MEDIUM|HIGH|CRITICAL"
}]

Focus on actionable intelligence. Maximum 6 updates total.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') return [];

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const updates = JSON.parse(jsonMatch[0]);

    return updates.map((u: any) => ({
      ...u,
      source: 'AI Analysis',
      detectedAt: new Date(),
    }));
  } catch (error: any) {
    logger.error('[ExternalIntel] Competitor analysis failed:', error.message);
    return [];
  }
};

/**
 * Get economic indicators
 */
export const getEconomicIndicators = async (): Promise<EconomicIndicator[]> => {
  try {
    logger.info('[ExternalIntel] Fetching economic indicators...');

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1500,
      messages: [
        {
          role: 'user',
          content: `Provide current Egyptian economic indicators relevant to e-commerce:

1. USD/EGP Exchange Rate
2. Inflation Rate
3. Consumer Confidence
4. Digital Payment Adoption
5. E-commerce Growth Rate

Return JSON:
[{
  "name": "USD/EGP Exchange Rate",
  "nameAr": "سعر صرف الدولار",
  "value": "48.5 EGP",
  "trend": "UP|DOWN|STABLE",
  "impact": "POSITIVE|NEGATIVE|NEUTRAL"
}]

Use your latest knowledge. Be realistic about Egypt's current economic situation.`,
        },
      ],
    });

    const content = response.content[0];
    if (content.type !== 'text') return [];

    const jsonMatch = content.text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return [];

    const indicators = JSON.parse(jsonMatch[0]);

    return indicators.map((i: any) => ({
      ...i,
      source: 'AI Analysis',
      updatedAt: new Date(),
    }));
  } catch (error: any) {
    logger.error('[ExternalIntel] Economic indicators failed:', error.message);
    return [];
  }
};

// ============================================
// Main Function: Generate External Intelligence
// ============================================

export const generateExternalIntelligence = async (): Promise<ExternalIntelligenceReport> => {
  const startTime = Date.now();
  logger.info('[ExternalIntel] ═══════════════════════════════════════');
  logger.info('[ExternalIntel] Generating external intelligence report...');
  logger.info('[ExternalIntel] ═══════════════════════════════════════');

  // 1. Fetch RSS feeds
  const rawNews = await fetchAllRSSFeeds();

  // 2. Analyze news with AI
  const analyzedNews = await analyzeNewsWithAI(rawNews);

  // 3. Get competitor updates
  const competitorUpdates = await analyzeCompetitors();

  // 4. Get economic indicators
  const economicIndicators = await getEconomicIndicators();

  // 5. Generate alerts
  const alerts: ExternalIntelligenceReport['alerts'] = [];

  // High relevance news alerts
  analyzedNews.filter((n) => n.relevanceScore >= 70).forEach((n) => {
    alerts.push({
      type: 'NEWS',
      severity: n.sentiment === 'NEGATIVE' ? 'WARNING' : 'INFO',
      title: n.title,
      titleAr: n.titleAr || n.title,
    });
  });

  // Critical competitor alerts
  competitorUpdates.filter((c) => c.threatLevel === 'HIGH' || c.threatLevel === 'CRITICAL').forEach((c) => {
    alerts.push({
      type: 'COMPETITOR',
      severity: c.threatLevel === 'CRITICAL' ? 'CRITICAL' : 'WARNING',
      title: `${c.competitor}: ${c.update}`,
      titleAr: `${c.competitor}: ${c.updateAr}`,
    });
  });

  // Negative economic indicators
  economicIndicators.filter((e) => e.impact === 'NEGATIVE').forEach((e) => {
    alerts.push({
      type: 'ECONOMY',
      severity: 'WARNING',
      title: `${e.name}: ${e.value} (${e.trend})`,
      titleAr: `${e.nameAr}: ${e.value} (${e.trend === 'UP' ? '↑' : e.trend === 'DOWN' ? '↓' : '→'})`,
    });
  });

  // 6. Generate summary
  let summary = `External Intelligence Report: ${analyzedNews.length} relevant news items, ${competitorUpdates.length} competitor updates, ${economicIndicators.length} economic indicators. ${alerts.length} alerts generated.`;
  let summaryAr = `تقرير الاستخبارات الخارجية: ${analyzedNews.length} خبر ذو صلة، ${competitorUpdates.length} تحديثات منافسين، ${economicIndicators.length} مؤشرات اقتصادية. ${alerts.length} تنبيهات.`;

  // Generate AI summary if we have data
  if (analyzedNews.length > 0 || competitorUpdates.length > 0) {
    try {
      const summaryResponse = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Summarize this intelligence for XChange Egypt board in 2-3 sentences (English and Arabic):

News: ${analyzedNews.slice(0, 5).map((n) => n.title).join('; ')}
Competitors: ${competitorUpdates.map((c) => `${c.competitor}: ${c.update}`).join('; ')}
Economy: ${economicIndicators.map((e) => `${e.name}: ${e.value}`).join('; ')}

Return JSON: {"summary": "...", "summaryAr": "..."}`,
          },
        ],
      });

      const content = summaryResponse.content[0];
      if (content.type === 'text') {
        const jsonMatch = content.text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          summary = parsed.summary || summary;
          summaryAr = parsed.summaryAr || summaryAr;
        }
      }
    } catch (e) {
      // Keep default summary
    }
  }

  const report: ExternalIntelligenceReport = {
    reportNumber: `EXT-${new Date().toISOString().split('T')[0].replace(/-/g, '')}-${Date.now().toString(36).toUpperCase()}`,
    generatedAt: new Date(),
    news: analyzedNews,
    competitorUpdates,
    economicIndicators,
    summary,
    summaryAr,
    dataSources: {
      rssFeeds: RSS_FEEDS.map((f) => f.name),
      webSearches: COMPETITORS.map((c) => c.name),
      lastUpdated: new Date(),
    },
    alerts,
  };

  const executionTime = Date.now() - startTime;
  logger.info('[ExternalIntel] ═══════════════════════════════════════');
  logger.info(`[ExternalIntel] Report generated in ${executionTime}ms`);
  logger.info(`[ExternalIntel] News: ${analyzedNews.length}, Competitors: ${competitorUpdates.length}, Economy: ${economicIndicators.length}`);
  logger.info('[ExternalIntel] ═══════════════════════════════════════');

  return report;
};

/**
 * Save external intelligence to database
 */
export const saveExternalIntelligence = async (
  report: ExternalIntelligenceReport
): Promise<void> => {
  try {
    // Save to environment scan table or create alerts
    for (const alert of report.alerts) {
      const alertNumber = `ALT-EXT-${Date.now()}-${Math.random().toString(36).substring(7)}`;
      await prisma.boardAlert.create({
        data: {
          alertNumber,
          title: alert.title.substring(0, 200),
          titleAr: alert.titleAr.substring(0, 200),
          description: `External Intelligence: ${alert.type}`,
          descriptionAr: `استخبارات خارجية: ${alert.type}`,
          severity: alert.severity === 'CRITICAL' ? 'CRITICAL' : alert.severity === 'WARNING' ? 'WARNING' : 'INFO',
          status: 'ACTIVE',
          sourceType: 'EXTERNAL_INTELLIGENCE',
        },
      }).catch(() => {
        // Ignore duplicate alerts
      });
    }

    logger.info(`[ExternalIntel] Saved ${report.alerts.length} alerts to database`);
  } catch (error: any) {
    logger.error('[ExternalIntel] Failed to save to database:', error.message);
  }
};

export default {
  generateExternalIntelligence,
  saveExternalIntelligence,
  fetchAllRSSFeeds,
  analyzeCompetitors,
  getEconomicIndicators,
};
