/**
 * Psychological Pricing AI Service (Simplified)
 * خدمة التسعير النفسي بالذكاء الاصطناعي - نسخة مبسطة
 */

import prisma from '../lib/prisma';
import { ItemCondition } from '../types/prisma-enums';

// ============================================
// Types
// ============================================

interface PsychologicalPrice {
  original: number;
  optimized: number;
  strategy: string;
  confidence: number;
  displayFormats: {
    type: string;
    value: string;
    valueAr: string;
    appeal: number;
  }[];
  urgencyCue?: string;
  culturalNote?: string;
}

interface BuyerPersona {
  type: string;
  description: string;
  descriptionAr: string;
  recommendedApproach: string;
  recommendedApproachAr: string;
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

// Price thresholds (in EGP)
const PRICE_THRESHOLDS = {
  LOW: 500,
  MEDIUM: 5000,
  HIGH: 50000,
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
  // Get category info
  const category = await prisma.category.findUnique({
    where: { id: categoryId },
    select: { nameAr: true, nameEn: true },
  });

  // Get competitor prices
  const competitorPrices = await getCompetitorPrices(categoryId, condition);

  // Determine buyer persona based on price
  const buyerPersona = determineBuyerPersona(basePrice);

  // Generate price recommendations
  const recommendations: PsychologicalPrice[] = [];

  // Charm pricing (ends in 9)
  const charmPrice = applyCharmPricing(basePrice);
  recommendations.push({
    original: basePrice,
    optimized: charmPrice,
    strategy: 'CHARM_PRICING',
    confidence: 85,
    displayFormats: generateDisplayFormats(charmPrice),
    culturalNote: 'الأرقام المنتهية بـ 9 أو 99 شائعة ومحببة في السوق المصري',
  });

  // Anchor pricing (show "was" price)
  const anchorOriginal = Math.round(basePrice * 1.25 / 100) * 100;
  const anchorPrice = applyCharmPricing(basePrice * 0.95);
  const savings = anchorOriginal - anchorPrice;
  const savingsPercent = Math.round((savings / anchorOriginal) * 100);

  recommendations.push({
    original: anchorOriginal,
    optimized: anchorPrice,
    strategy: 'BUNDLE_ANCHOR',
    confidence: 88,
    displayFormats: [
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
      ...generateDisplayFormats(anchorPrice),
    ],
    urgencyCue: `🔥 خصم ${savingsPercent}% لفترة محدودة!`,
    culturalNote: 'المصريون يحبون رؤية التوفير بالأرقام',
  });

  // Egyptian sweet spot
  const egyptianPrice = calculateEgyptianSweetSpot(basePrice);
  recommendations.push({
    original: basePrice,
    optimized: egyptianPrice,
    strategy: 'EGYPTIAN_SWEET_SPOT',
    confidence: 90,
    displayFormats: generateDisplayFormats(egyptianPrice),
    culturalNote: 'هذا السعر محسّن خصيصاً للسوق المصري',
  });

  // Calculate optimal price
  const optimalPricePoint = charmPrice;

  // Calculate price elasticity
  const priceElasticity = await calculatePriceElasticity(categoryId);

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
  const optimized = applyCharmPricing(basePrice);

  return {
    optimized,
    strategy: 'CHARM_PRICING',
    tip: `Pricing at ${optimized} (${basePrice - optimized} less) increases perceived value`,
    tipAr: `التسعير بـ ${optimized} (أقل بـ ${basePrice - optimized}) يزيد القيمة المُدركة`,
  };
}

/**
 * Get pricing analysis for a category
 */
export async function getPricingAnalysis(categoryId: string): Promise<{
  categoryId: string;
  buyerPersona: BuyerPersona;
  priceElasticity: string;
  competitorPrices: number[];
}> {
  const competitorPrices = await getCompetitorPrices(categoryId, 'GOOD');
  const avgPrice = competitorPrices.length > 0
    ? competitorPrices.reduce((a, b) => a + b, 0) / competitorPrices.length
    : 1000;

  return {
    categoryId,
    buyerPersona: determineBuyerPersona(avgPrice),
    priceElasticity: 'ELASTIC',
    competitorPrices: competitorPrices.slice(0, 10),
  };
}

// ============================================
// Helper Functions
// ============================================

function applyCharmPricing(price: number): number {
  if (price < 100) {
    return Math.floor(price / 10) * 10 + 9;
  } else if (price < 1000) {
    return Math.floor(price / 100) * 100 + 99;
  } else if (price < 10000) {
    return Math.floor(price / 1000) * 1000 + 999;
  } else {
    return Math.floor(price / 10000) * 10000 + 9999;
  }
}

function calculateEgyptianSweetSpot(basePrice: number): number {
  if (basePrice < 100) {
    return Math.round(basePrice / 5) * 5;
  } else if (basePrice < 1000) {
    const rounded = Math.round(basePrice / 50) * 50;
    return rounded % 100 === 0 && rounded > 100 ? rounded - 1 : rounded;
  } else if (basePrice < 10000) {
    const thousands = Math.floor(basePrice / 1000);
    const remainder = basePrice % 1000;
    return remainder > 500 ? thousands * 1000 + 999 : thousands * 1000 + 499;
  } else {
    return Math.round(basePrice / 1000) * 1000 - 1;
  }
}

function generateDisplayFormats(price: number): { type: string; value: string; valueAr: string; appeal: number }[] {
  const formats = [];

  // Monthly installment
  const monthly = Math.ceil(price / 12);
  formats.push({
    type: 'MONTHLY',
    value: `${monthly.toLocaleString('en-EG')} EGP/month`,
    valueAr: `${monthly.toLocaleString('ar-EG')} ج.م/شهر`,
    appeal: 75,
  });

  // Daily cost
  if (price > 1000) {
    const daily = Math.ceil(price / (365 * 3));
    formats.push({
      type: 'DAILY',
      value: `Only ${daily} EGP/day`,
      valueAr: `فقط ${daily} ج.م/يوم`,
      appeal: 70,
    });
  }

  return formats;
}

function determineBuyerPersona(price: number): BuyerPersona {
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

async function calculatePriceElasticity(
  categoryId: string
): Promise<'ELASTIC' | 'INELASTIC' | 'UNIT_ELASTIC'> {
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
    return 'ELASTIC';
  } else if (highPriceSales > lowPriceSales) {
    return 'INELASTIC';
  }
  return 'UNIT_ELASTIC';
}

export type { PsychologicalPrice, PricingAnalysis, BuyerPersona };
