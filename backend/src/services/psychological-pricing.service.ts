/**
 * Psychological Pricing AI Service
 * خدمة التسعير النفسي بالذكاء الاصطناعي
 *
 * Advanced pricing psychology techniques:
 * - Charm pricing (9-ending prices)
 * - Anchor pricing (comparative pricing)
 * - Left-digit effect optimization
 * - Social proof integration
 * - Bundle pricing suggestions
 * - Urgency & scarcity cues
 * - Cultural pricing patterns (Egyptian market)
 */

import prisma from '../lib/prisma';
import { ItemCondition } from '@prisma/client';

// ============================================
// Types
// ============================================

interface PsychologicalPrice {
  original: number;
  optimized: number;
  strategy: PricingStrategy;
  confidence: number;
  psychologyFactors: PsychologyFactor[];
  displayFormats: DisplayFormat[];
  socialProof?: SocialProofData;
  urgencyCue?: string;
  culturalNote?: string;
}

type PricingStrategy =
  | 'CHARM_PRICING'           // Ends in 9 (999, 4999)
  | 'ROUND_PRICING'           // Round numbers for luxury (5000, 10000)
  | 'PRESTIGE_PRICING'        // Premium perception (slightly above market)
  | 'BUNDLE_ANCHOR'           // Show savings vs buying separately
  | 'DECOY_PRICING'           // Position between options
  | 'LOSS_LEADER'             // Below cost to attract buyers
  | 'EGYPTIAN_SWEET_SPOT';    // Local market preferences

interface PsychologyFactor {
  name: string;
  nameAr: string;
  impact: 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  descriptionAr: string;
}

interface DisplayFormat {
  type: 'MONTHLY' | 'DAILY' | 'PER_USE' | 'SAVINGS' | 'PERCENTAGE_OFF';
  value: string;
  valueAr: string;
  appeal: number; // 0-100
}

interface SocialProofData {
  recentBuyers: number;
  viewsToday: number;
  wishlistCount: number;
  similarSoldCount: number;
  avgTimeToSell: number;
  message: string;
  messageAr: string;
}

interface PricingAnalysis {
  categoryId: string;
  condition: ItemCondition;
  basePrice: number;
  recommendations: PsychologicalPrice[];
  competitorPrices: number[];
  optimalPricePoint: number;
  priceElasticity: 'ELASTIC' | 'INELASTIC' | 'UNIT_ELASTIC';
  buyerPersona: BuyerPersona;
}

interface BuyerPersona {
  type: 'BARGAIN_HUNTER' | 'VALUE_SEEKER' | 'QUALITY_FOCUSED' | 'IMPULSE_BUYER';
  description: string;
  descriptionAr: string;
  recommendedApproach: string;
  recommendedApproachAr: string;
}

// ============================================
// Configuration
// ============================================

// Egyptian market charm numbers (culturally significant)
const CHARM_ENDINGS = {
  STANDARD: [9, 99, 999],
  EGYPTIAN: [5, 50, 500, 100], // Egyptians often prefer 5s and round 100s
  PREMIUM: [0, 0, 0], // Round numbers for luxury
};

// Price thresholds for strategy selection (in EGP)
const PRICE_THRESHOLDS = {
  MICRO: 100,           // < 100 EGP - impulse buys
  LOW: 500,             // 100-500 EGP
  MEDIUM: 5000,         // 500-5000 EGP
  HIGH: 50000,          // 5000-50000 EGP
  LUXURY: 500000,       // > 50000 EGP
};

// Category-specific psychology patterns
const CATEGORY_PSYCHOLOGY: Record<string, {
  preferredStrategy: PricingStrategy;
  priceEnding: number[];
  useDecimal: boolean;
}> = {
  electronics: {
    preferredStrategy: 'CHARM_PRICING',
    priceEnding: [99, 999],
    useDecimal: false,
  },
  vehicles: {
    preferredStrategy: 'ROUND_PRICING',
    priceEnding: [0, 1000],
    useDecimal: false,
  },
  fashion: {
    preferredStrategy: 'CHARM_PRICING',
    priceEnding: [9, 99],
    useDecimal: false,
  },
  property: {
    preferredStrategy: 'ROUND_PRICING',
    priceEnding: [0, 1000],
    useDecimal: false,
  },
  gold: {
    preferredStrategy: 'PRESTIGE_PRICING',
    priceEnding: [0, 50],
    useDecimal: true,
  },
};

// ============================================
// Main Functions
// ============================================

/**
 * Generate psychologically optimized prices
 */
export async function generatePsychologicalPrices(
  categoryId: string,
  condition: ItemCondition,
  basePrice: number,
  userId?: string
): Promise<PricingAnalysis> {
  // Get category info for strategy selection
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    include: { parent: { include: { parent: true } } },
  });

  const categoryType = getCategoryType(category);
  const categoryConfig = CATEGORY_PSYCHOLOGY[categoryType] || CATEGORY_PSYCHOLOGY.electronics;

  // Analyze competitors
  const competitorPrices = await getCompetitorPrices(categoryId, condition);

  // Determine buyer persona
  const buyerPersona = await determineBuyerPersona(categoryId, basePrice);

  // Get social proof data
  const socialProof = await getSocialProofData(categoryId);

  // Generate multiple price recommendations
  const recommendations: PsychologicalPrice[] = [];

  // 1. Charm Pricing (most effective for most categories)
  recommendations.push(await generateCharmPrice(basePrice, categoryConfig, socialProof));

  // 2. Round Pricing (for luxury/high-value items)
  if (basePrice > PRICE_THRESHOLDS.HIGH) {
    recommendations.push(await generateRoundPrice(basePrice, socialProof));
  }

  // 3. Anchor Pricing (show "was" price)
  recommendations.push(await generateAnchorPrice(basePrice, competitorPrices, socialProof));

  // 4. Egyptian Sweet Spot (locally optimized)
  recommendations.push(await generateEgyptianSweetSpot(basePrice, socialProof));

  // Calculate optimal price point
  const optimalPricePoint = calculateOptimalPrice(basePrice, competitorPrices, buyerPersona);

  // Determine price elasticity
  const priceElasticity = await calculatePriceElasticity(categoryId);

  // Store analysis
  await storePricingAnalysis({
    categoryId,
    condition,
    basePrice,
    optimalPrice: optimalPricePoint,
    strategy: recommendations[0].strategy,
    userId,
  });

  return {
    categoryId,
    condition,
    basePrice,
    recommendations,
    competitorPrices: competitorPrices.slice(0, 5),
    optimalPricePoint,
    priceElasticity,
    buyerPersona,
  };
}

/**
 * Get quick psychological price suggestion
 */
export async function getQuickPsychologicalPrice(
  basePrice: number,
  categoryType?: string
): Promise<{ optimized: number; strategy: string; tip: string; tipAr: string }> {
  const config = categoryType
    ? CATEGORY_PSYCHOLOGY[categoryType] || CATEGORY_PSYCHOLOGY.electronics
    : CATEGORY_PSYCHOLOGY.electronics;

  const optimized = applyCharmPricing(basePrice, config.priceEnding);

  return {
    optimized,
    strategy: config.preferredStrategy,
    tip: getQuickTip(basePrice, optimized),
    tipAr: getQuickTipAr(basePrice, optimized),
  };
}

// ============================================
// Price Generation Functions
// ============================================

async function generateCharmPrice(
  basePrice: number,
  config: typeof CATEGORY_PSYCHOLOGY.electronics,
  socialProof: SocialProofData
): Promise<PsychologicalPrice> {
  const optimized = applyCharmPricing(basePrice, config.priceEnding);
  const savings = basePrice - optimized;

  const psychologyFactors: PsychologyFactor[] = [
    {
      name: 'Left-Digit Effect',
      nameAr: 'تأثير الرقم الأيسر',
      impact: 'HIGH',
      description: 'Buyers perceive 999 as significantly less than 1000',
      descriptionAr: 'المشترون يرون 999 أقل بكثير من 1000',
    },
    {
      name: 'Charm Number',
      nameAr: 'الرقم الجذاب',
      impact: 'MEDIUM',
      description: 'Prices ending in 9 are perceived as deals',
      descriptionAr: 'الأسعار المنتهية بـ 9 تُعتبر صفقات',
    },
  ];

  const displayFormats = generateDisplayFormats(optimized);

  return {
    original: basePrice,
    optimized,
    strategy: 'CHARM_PRICING',
    confidence: 85,
    psychologyFactors,
    displayFormats,
    socialProof,
    urgencyCue: generateUrgencyCue(socialProof),
    culturalNote: 'الأرقام المنتهية بـ 9 أو 99 شائعة ومحببة في السوق المصري',
  };
}

async function generateRoundPrice(
  basePrice: number,
  socialProof: SocialProofData
): Promise<PsychologicalPrice> {
  const optimized = roundToNearestPrestige(basePrice);

  const psychologyFactors: PsychologyFactor[] = [
    {
      name: 'Prestige Perception',
      nameAr: 'إدراك الجودة العالية',
      impact: 'HIGH',
      description: 'Round numbers signal quality and premium value',
      descriptionAr: 'الأرقام المستديرة تشير للجودة والقيمة المميزة',
    },
    {
      name: 'Cognitive Fluency',
      nameAr: 'السهولة الإدراكية',
      impact: 'MEDIUM',
      description: 'Easy to remember and compare',
      descriptionAr: 'سهلة التذكر والمقارنة',
    },
  ];

  return {
    original: basePrice,
    optimized,
    strategy: 'ROUND_PRICING',
    confidence: 80,
    psychologyFactors,
    displayFormats: generateDisplayFormats(optimized),
    socialProof,
    culturalNote: 'الأرقام المستديرة تعطي انطباعاً بالفخامة والجودة العالية',
  };
}

async function generateAnchorPrice(
  basePrice: number,
  competitorPrices: number[],
  socialProof: SocialProofData
): Promise<PsychologicalPrice> {
  // Calculate anchor (was price) - typically 15-30% higher
  const anchorMultiplier = 1.2 + Math.random() * 0.15; // 20-35% higher
  const anchorPrice = Math.round(basePrice * anchorMultiplier / 100) * 100;
  const optimized = applyCharmPricing(basePrice, [99, 999]);

  const savings = anchorPrice - optimized;
  const savingsPercent = Math.round((savings / anchorPrice) * 100);

  const psychologyFactors: PsychologyFactor[] = [
    {
      name: 'Anchoring Effect',
      nameAr: 'تأثير التثبيت',
      impact: 'HIGH',
      description: `Showing "was ${anchorPrice}" makes ${optimized} feel like a great deal`,
      descriptionAr: `عرض "كان ${anchorPrice}" يجعل ${optimized} تبدو صفقة ممتازة`,
    },
    {
      name: 'Loss Aversion',
      nameAr: 'النفور من الخسارة',
      impact: 'HIGH',
      description: `Save ${savings} EGP (${savingsPercent}%) creates urgency`,
      descriptionAr: `وفر ${savings} ج.م (${savingsPercent}%) يخلق إلحاحاً`,
    },
  ];

  const displayFormats: DisplayFormat[] = [
    {
      type: 'SAVINGS',
      value: `Save ${savings.toLocaleString('en-EG')} EGP`,
      valueAr: `وفر ${savings.toLocaleString('ar-EG')} ج.م`,
      appeal: 90,
    },
    {
      type: 'PERCENTAGE_OFF',
      value: `${savingsPercent}% OFF`,
      valueAr: `خصم ${savingsPercent}%`,
      appeal: 85,
    },
    ...generateDisplayFormats(optimized),
  ];

  return {
    original: anchorPrice,
    optimized,
    strategy: 'BUNDLE_ANCHOR',
    confidence: 88,
    psychologyFactors,
    displayFormats,
    socialProof,
    urgencyCue: `🔥 خصم ${savingsPercent}% لفترة محدودة!`,
    culturalNote: 'المصريون يحبون رؤية التوفير بالأرقام - أظهر السعر الأصلي والخصم',
  };
}

async function generateEgyptianSweetSpot(
  basePrice: number,
  socialProof: SocialProofData
): Promise<PsychologicalPrice> {
  // Egyptian market specific patterns
  let optimized: number;

  if (basePrice < 100) {
    // Under 100: use multiples of 5 or 10
    optimized = Math.round(basePrice / 5) * 5;
  } else if (basePrice < 1000) {
    // 100-1000: prefer 50s and 100s (e.g., 350, 450, 500)
    optimized = Math.round(basePrice / 50) * 50;
    // Apply slight charm if close to round number
    if (optimized % 100 === 0 && optimized > 100) {
      optimized -= 1; // 500 -> 499
    }
  } else if (basePrice < 10000) {
    // 1000-10000: use X,999 or X,500
    const thousands = Math.floor(basePrice / 1000);
    const remainder = basePrice % 1000;
    if (remainder > 500) {
      optimized = thousands * 1000 + 999;
    } else {
      optimized = thousands * 1000 + 499;
    }
  } else {
    // Above 10000: round to nearest 1000 with charm
    optimized = Math.round(basePrice / 1000) * 1000 - 1;
  }

  const psychologyFactors: PsychologyFactor[] = [
    {
      name: 'Local Market Fit',
      nameAr: 'ملائمة السوق المحلي',
      impact: 'HIGH',
      description: 'Price optimized for Egyptian buyer preferences',
      descriptionAr: 'السعر محسّن لتفضيلات المشترين المصريين',
    },
    {
      name: 'Currency Psychology',
      nameAr: 'نفسية العملة',
      impact: 'MEDIUM',
      description: 'Aligned with common Egyptian pound denominations',
      descriptionAr: 'متوافق مع فئات الجنيه المصري الشائعة',
    },
  ];

  return {
    original: basePrice,
    optimized,
    strategy: 'EGYPTIAN_SWEET_SPOT',
    confidence: 90,
    psychologyFactors,
    displayFormats: generateDisplayFormats(optimized),
    socialProof,
    culturalNote: 'هذا السعر محسّن خصيصاً للسوق المصري بناءً على عادات الشراء المحلية',
  };
}

// ============================================
// Helper Functions
// ============================================

function applyCharmPricing(price: number, endings: number[]): number {
  const magnitude = Math.pow(10, Math.floor(Math.log10(price)));

  if (price < 100) {
    return Math.floor(price / 10) * 10 + 9; // 45 -> 49
  } else if (price < 1000) {
    return Math.floor(price / 100) * 100 + 99; // 450 -> 499
  } else if (price < 10000) {
    return Math.floor(price / 1000) * 1000 + 999; // 4500 -> 4999
  } else {
    return Math.floor(price / 10000) * 10000 + 9999; // 45000 -> 49999
  }
}

function roundToNearestPrestige(price: number): number {
  if (price < 1000) {
    return Math.round(price / 100) * 100;
  } else if (price < 10000) {
    return Math.round(price / 500) * 500;
  } else if (price < 100000) {
    return Math.round(price / 5000) * 5000;
  } else {
    return Math.round(price / 10000) * 10000;
  }
}

function generateDisplayFormats(price: number): DisplayFormat[] {
  const formats: DisplayFormat[] = [];

  // Monthly installment (assume 12 months)
  const monthly = Math.ceil(price / 12);
  formats.push({
    type: 'MONTHLY',
    value: `${monthly.toLocaleString('en-EG')} EGP/month`,
    valueAr: `${monthly.toLocaleString('ar-EG')} ج.م/شهر`,
    appeal: 75,
  });

  // Daily cost (for items with lifespan)
  if (price > 1000) {
    const dailyOver3Years = Math.ceil(price / (365 * 3));
    formats.push({
      type: 'DAILY',
      value: `Only ${dailyOver3Years} EGP/day`,
      valueAr: `فقط ${dailyOver3Years} ج.م/يوم`,
      appeal: 70,
    });
  }

  return formats;
}

function generateUrgencyCue(socialProof: SocialProofData): string {
  if (socialProof.viewsToday > 50) {
    return `🔥 ${socialProof.viewsToday} شخص يشاهد هذا الإعلان الآن!`;
  }
  if (socialProof.wishlistCount > 10) {
    return `❤️ ${socialProof.wishlistCount} شخص أضافوه للمفضلة`;
  }
  if (socialProof.recentBuyers > 0) {
    return `✨ ${socialProof.recentBuyers} اشتروا منتجات مشابهة اليوم`;
  }
  return '⚡ عرض لفترة محدودة';
}

async function getCompetitorPrices(
  categoryId: string,
  condition: ItemCondition
): Promise<number[]> {
  const items = await prisma.item.findMany({
    where: {
      categoryId,
      condition,
      status: 'ACTIVE',
      estimatedValue: { gt: 0 },
    },
    select: { estimatedValue: true },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });

  return items.map(i => i.estimatedValue).sort((a, b) => a - b);
}

async function getSocialProofData(categoryId: string): Promise<SocialProofData> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [recentTransactions, wishlistCount, activeListings] = await Promise.all([
    prisma.transaction.count({
      where: {
        listing: { item: { categoryId } },
        paymentStatus: 'COMPLETED',
        createdAt: { gte: today },
      },
    }),
    prisma.wishListItem.count({
      where: { categoryId },
    }),
    prisma.listing.findMany({
      where: {
        item: { categoryId },
        status: 'ACTIVE',
      },
      select: { views: true },
      take: 10,
    }),
  ]);

  const totalViews = activeListings.reduce((sum, l) => sum + l.views, 0);

  return {
    recentBuyers: recentTransactions,
    viewsToday: Math.floor(totalViews / Math.max(activeListings.length, 1)),
    wishlistCount,
    similarSoldCount: recentTransactions * 7, // Estimate weekly
    avgTimeToSell: 5,
    message: `${recentTransactions} people bought similar items today`,
    messageAr: `${recentTransactions} أشخاص اشتروا منتجات مشابهة اليوم`,
  };
}

async function determineBuyerPersona(
  categoryId: string,
  price: number
): Promise<BuyerPersona> {
  // Analyze category and price to determine likely buyer
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { name: true, nameAr: true },
  });

  if (price < PRICE_THRESHOLDS.LOW) {
    return {
      type: 'IMPULSE_BUYER',
      description: 'Quick decision makers looking for deals',
      descriptionAr: 'متخذو قرارات سريعة يبحثون عن الصفقات',
      recommendedApproach: 'Use urgency cues and low friction checkout',
      recommendedApproachAr: 'استخدم إشارات الإلحاح وسهولة الشراء',
    };
  } else if (price < PRICE_THRESHOLDS.MEDIUM) {
    return {
      type: 'VALUE_SEEKER',
      description: 'Researches options, wants best value for money',
      descriptionAr: 'يبحث عن الخيارات، يريد أفضل قيمة مقابل المال',
      recommendedApproach: 'Highlight value proposition and comparisons',
      recommendedApproachAr: 'أبرز قيمة المنتج والمقارنات',
    };
  } else if (price < PRICE_THRESHOLDS.HIGH) {
    return {
      type: 'QUALITY_FOCUSED',
      description: 'Prioritizes quality and reliability over price',
      descriptionAr: 'يفضل الجودة والموثوقية على السعر',
      recommendedApproach: 'Emphasize quality guarantees and authenticity',
      recommendedApproachAr: 'أكد على ضمانات الجودة والأصالة',
    };
  } else {
    return {
      type: 'BARGAIN_HUNTER',
      description: 'Seeks the best deals on high-value items',
      descriptionAr: 'يبحث عن أفضل الصفقات للمنتجات عالية القيمة',
      recommendedApproach: 'Show savings, payment plans, and exclusivity',
      recommendedApproachAr: 'أظهر التوفير وخطط الدفع والحصرية',
    };
  }
}

async function calculatePriceElasticity(
  categoryId: string
): Promise<'ELASTIC' | 'INELASTIC' | 'UNIT_ELASTIC'> {
  // Simplified elasticity based on category demand patterns
  const [highPriceSales, lowPriceSales] = await Promise.all([
    prisma.transaction.count({
      where: {
        listing: {
          item: { categoryId },
          price: { gte: 10000 },
        },
        paymentStatus: 'COMPLETED',
      },
    }),
    prisma.transaction.count({
      where: {
        listing: {
          item: { categoryId },
          price: { lt: 10000 },
        },
        paymentStatus: 'COMPLETED',
      },
    }),
  ]);

  if (lowPriceSales > highPriceSales * 3) {
    return 'ELASTIC'; // Price sensitive
  } else if (highPriceSales > lowPriceSales) {
    return 'INELASTIC'; // Not price sensitive
  }
  return 'UNIT_ELASTIC';
}

function calculateOptimalPrice(
  basePrice: number,
  competitorPrices: number[],
  buyerPersona: BuyerPersona
): number {
  if (competitorPrices.length === 0) {
    return applyCharmPricing(basePrice, [99, 999]);
  }

  const median = competitorPrices[Math.floor(competitorPrices.length / 2)];

  switch (buyerPersona.type) {
    case 'BARGAIN_HUNTER':
      return applyCharmPricing(Math.min(basePrice, median * 0.95), [99, 999]);
    case 'VALUE_SEEKER':
      return applyCharmPricing(median, [99, 999]);
    case 'QUALITY_FOCUSED':
      return roundToNearestPrestige(Math.max(basePrice, median * 1.05));
    case 'IMPULSE_BUYER':
      return applyCharmPricing(Math.min(basePrice, median * 0.9), [9, 99]);
    default:
      return applyCharmPricing(basePrice, [99, 999]);
  }
}

function getCategoryType(category: any): string {
  if (!category) return 'electronics';

  const name = (category.name || '').toLowerCase();
  const parentName = (category.parent?.name || '').toLowerCase();

  if (name.includes('car') || name.includes('سيار') || parentName.includes('vehicle')) {
    return 'vehicles';
  }
  if (name.includes('property') || name.includes('عقار') || name.includes('شقة')) {
    return 'property';
  }
  if (name.includes('gold') || name.includes('ذهب')) {
    return 'gold';
  }
  if (name.includes('fashion') || name.includes('ملابس') || name.includes('أزياء')) {
    return 'fashion';
  }

  return 'electronics';
}

function getQuickTip(basePrice: number, optimized: number): string {
  const diff = basePrice - optimized;
  if (diff > 0) {
    return `Pricing at ${optimized} (${diff} less) increases perceived value`;
  }
  return `Round number ${optimized} signals premium quality`;
}

function getQuickTipAr(basePrice: number, optimized: number): string {
  const diff = basePrice - optimized;
  if (diff > 0) {
    return `التسعير بـ ${optimized} (أقل بـ ${diff}) يزيد القيمة المُدركة`;
  }
  return `الرقم المستدير ${optimized} يشير للجودة العالية`;
}

async function storePricingAnalysis(data: {
  categoryId: string;
  condition: ItemCondition;
  basePrice: number;
  optimalPrice: number;
  strategy: PricingStrategy;
  userId?: string;
}) {
  // Store for analytics and ML improvement
  return prisma.pricePrediction.create({
    data: {
      categoryId: data.categoryId,
      condition: data.condition,
      predictedPrice: data.optimalPrice,
      suggestedPrice: data.optimalPrice,
      priceStrategy: data.strategy,
      confidenceScore: 85,
      priceRangeMin: data.basePrice * 0.9,
      priceRangeMax: data.basePrice * 1.1,
      userId: data.userId,
      modelVersion: 'psych-v1.0',
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });
}

// ============================================
// Exports
// ============================================

export {
  PsychologicalPrice,
  PricingAnalysis,
  PricingStrategy,
  BuyerPersona,
};
