/**
 * @fileoverview خوارزمية التسعير العقاري (AVM - Automated Valuation Model)
 * @description نموذج تقييم آلي متقدم للسوق العقاري المصري
 * @author Xchange Real Estate
 * @version 1.0.0
 */

import { PropertyType, FinishingLevel, FurnishedStatus, PropertyStatus } from '@prisma/client';
import prisma from '../../lib/prisma';

// ============================================
// Types & Interfaces
// ============================================

/**
 * حالة العقار للتقييم
 */
export type PropertyCondition = 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';

/**
 * مدخلات تقييم العقار
 */
export interface PropertyInput {
  propertyType: PropertyType;
  totalArea: number;
  governorate: string;
  city?: string;
  area?: string;
  district?: string;
  compoundName?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  buildingAge?: number;
  condition: PropertyCondition;
  furnishingType?: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  features: string[];
  latitude?: number;
  longitude?: number;
  finishingLevel?: FinishingLevel;
}

/**
 * عقار مشابه للمقارنة
 */
export interface ComparableProperty {
  id: string;
  price: number;
  pricePerSqm: number;
  similarity: number;
  distance?: number;
  soldDate?: Date;
}

/**
 * تقدير السعر
 */
export interface PriceEstimate {
  estimatedPrice: number;
  pricePerMeter: number;
  confidence: number;
  priceRange: {
    min: number;
    max: number;
  };
  comparables: ComparableProperty[];
  marketDemand: 'HIGH' | 'MEDIUM' | 'LOW';
  breakdown: {
    basePrice: number;
    locationAdjustment: number;
    ageAdjustment: number;
    conditionAdjustment: number;
    featuresAdjustment: number;
    floorAdjustment: number;
    furnishingAdjustment: number;
  };
  marketInsights: {
    avgDaysOnMarket: number;
    priceTrend: 'RISING' | 'STABLE' | 'FALLING';
    priceChangePercent: number;
    supplyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  };
  recommendations: string[];
}

// ============================================
// Egyptian Market Data Constants
// ============================================

/**
 * متوسط أسعار المتر حسب المحافظة (EGP/م²)
 */
const GOVERNORATE_BASE_PRICES: Record<string, number> = {
  'القاهرة': 25000,
  'الجيزة': 22000,
  'الإسكندرية': 18000,
  'الدقهلية': 12000,
  'البحر الأحمر': 30000, // الغردقة وغيرها
  'البحيرة': 10000,
  'الفيوم': 8000,
  'الغربية': 11000,
  'الإسماعيلية': 15000,
  'المنوفية': 10000,
  'المنيا': 7000,
  'القليوبية': 14000,
  'الوادي الجديد': 6000,
  'السويس': 16000,
  'أسوان': 9000,
  'أسيوط': 8000,
  'بني سويف': 7500,
  'بورسعيد': 17000,
  'دمياط': 12000,
  'الشرقية': 11000,
  'جنوب سيناء': 35000, // شرم الشيخ
  'كفر الشيخ': 9000,
  'مطروح': 20000, // الساحل الشمالي
  'الأقصر': 10000,
  'قنا': 7000,
  'شمال سيناء': 8000,
  'سوهاج': 7000,
  // المدن الجديدة
  'التجمع الخامس': 35000,
  'الشيخ زايد': 32000,
  '6 أكتوبر': 25000,
  'مدينتي': 28000,
  'الرحاب': 26000,
  'المعادي': 30000,
  'العين السخنة': 40000,
  'الساحل الشمالي': 45000,
  // Default
  'DEFAULT': 15000,
};

/**
 * معاملات تعديل الموقع
 */
const LOCATION_ADJUSTMENTS: Record<string, number> = {
  // المدن الجديدة الراقية
  'التجمع الخامس': 1.15,
  'الشيخ زايد': 1.12,
  'مدينتي': 1.10,
  'الرحاب': 1.08,
  '6 أكتوبر': 1.05,
  // المناطق الساحلية
  'الساحل الشمالي': 1.50,
  'العين السخنة': 1.40,
  'البحر الأحمر': 1.30,
  'جنوب سيناء': 1.35,
  // العاصمة والجيزة
  'القاهرة': 1.00,
  'الجيزة': 0.98,
  'المعادي': 1.10,
  // الإسكندرية
  'الإسكندرية': 0.97,
  // الصعيد
  'المنيا': 0.85,
  'أسيوط': 0.85,
  'سوهاج': 0.80,
  'قنا': 0.80,
  'الأقصر': 0.88,
  'أسوان': 0.85,
  // Delta
  'الدقهلية': 0.90,
  'الغربية': 0.88,
  'المنوفية': 0.87,
  'الشرقية': 0.88,
  'البحيرة': 0.85,
};

/**
 * معاملات تعديل حالة العقار
 */
const CONDITION_ADJUSTMENTS: Record<PropertyCondition, number> = {
  'NEW': 1.20,
  'EXCELLENT': 1.10,
  'GOOD': 1.00,
  'FAIR': 0.85,
  'POOR': 0.70,
};

/**
 * معاملات تعديل التشطيب
 */
const FINISHING_ADJUSTMENTS: Record<FinishingLevel, number> = {
  'ULTRA_SUPER_LUX': 1.25,
  'SUPER_LUX': 1.15,
  'LUX': 1.08,
  'FINISHED': 1.00,
  'SEMI_FINISHED': 0.85,
  'UNFINISHED': 0.70,
};

/**
 * معاملات تعديل الفرش
 */
const FURNISHING_ADJUSTMENTS: Record<string, number> = {
  'FURNISHED': 1.15,
  'SEMI_FURNISHED': 1.08,
  'UNFURNISHED': 1.00,
};

/**
 * معاملات تعديل المميزات
 */
const FEATURE_ADJUSTMENTS: Record<string, number> = {
  'parking': 0.03,
  'elevator': 0.05,
  'garden': 0.08,
  'pool': 0.12,
  'security': 0.04,
  'gym': 0.06,
  'balcony': 0.03,
  'central_ac': 0.05,
  'storage': 0.02,
  'maid_room': 0.04,
  'driver_room': 0.03,
  'smart_home': 0.08,
  'rooftop': 0.06,
  'private_entrance': 0.05,
  'corner_unit': 0.04,
  'sea_view': 0.15,
  'nile_view': 0.18,
  'garden_view': 0.06,
  'city_view': 0.04,
};

/**
 * معاملات نوع العقار
 */
const PROPERTY_TYPE_MULTIPLIERS: Record<PropertyType, number> = {
  'APARTMENT': 1.00,
  'VILLA': 1.25,
  'TOWNHOUSE': 1.15,
  'DUPLEX': 1.10,
  'STUDIO': 0.95,
  'PENTHOUSE': 1.30,
  'CHALET': 1.20,
  'LAND': 0.80,
  'COMMERCIAL': 1.15,
  'OFFICE': 1.10,
  'SHOP': 1.20,
  'WAREHOUSE': 0.60,
  'BUILDING': 1.00,
  'FARM': 0.40,
};

// ============================================
// Helper Functions
// ============================================

/**
 * حساب المسافة بين نقطتين جغرافيتين (Haversine formula)
 * @param lat1 خط العرض الأول
 * @param lon1 خط الطول الأول
 * @param lat2 خط العرض الثاني
 * @param lon2 خط الطول الثاني
 * @returns المسافة بالكيلومتر
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // نصف قطر الأرض بالكيلومتر
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

/**
 * حساب معامل التشابه بين عقارين
 * @param input العقار المراد تقييمه
 * @param comparable العقار المشابه
 * @returns معامل التشابه (0-1)
 */
function calculateSimilarity(
  input: PropertyInput,
  comparable: {
    propertyType: PropertyType;
    areaSqm: number;
    bedrooms: number | null;
    bathrooms: number | null;
    governorate: string;
    city: string | null;
    floorNumber: number | null;
    finishingLevel: FinishingLevel | null;
    latitude: number | null;
    longitude: number | null;
  }
): number {
  let score = 0;
  let maxScore = 0;

  // نفس النوع (وزن 20%)
  maxScore += 20;
  if (input.propertyType === comparable.propertyType) {
    score += 20;
  }

  // المساحة (وزن 25%)
  maxScore += 25;
  const areaDiff = Math.abs(input.totalArea - comparable.areaSqm);
  const areaRatio = areaDiff / input.totalArea;
  if (areaRatio <= 0.1) score += 25;
  else if (areaRatio <= 0.2) score += 20;
  else if (areaRatio <= 0.3) score += 15;
  else if (areaRatio <= 0.5) score += 10;

  // الموقع (وزن 30%)
  maxScore += 30;
  if (input.governorate === comparable.governorate) {
    score += 15;
    if (input.city === comparable.city) {
      score += 10;
    }
    // المسافة الجغرافية
    if (input.latitude && input.longitude && comparable.latitude && comparable.longitude) {
      const distance = calculateDistance(
        input.latitude, input.longitude,
        comparable.latitude, comparable.longitude
      );
      if (distance <= 1) score += 5;
      else if (distance <= 3) score += 4;
      else if (distance <= 5) score += 3;
    }
  }

  // عدد الغرف (وزن 15%)
  if (input.bedrooms && comparable.bedrooms) {
    maxScore += 15;
    const bedroomDiff = Math.abs(input.bedrooms - comparable.bedrooms);
    if (bedroomDiff === 0) score += 15;
    else if (bedroomDiff === 1) score += 10;
    else if (bedroomDiff === 2) score += 5;
  }

  // الطابق (وزن 10%)
  if (input.floor !== undefined && comparable.floorNumber !== null) {
    maxScore += 10;
    const floorDiff = Math.abs(input.floor - comparable.floorNumber);
    if (floorDiff === 0) score += 10;
    else if (floorDiff <= 2) score += 7;
    else if (floorDiff <= 5) score += 4;
  }

  return maxScore > 0 ? score / maxScore : 0;
}

/**
 * حساب الوسيط (Median)
 * @param values مصفوفة القيم
 * @returns الوسيط
 */
function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * حساب الانحراف المعياري
 * @param values مصفوفة القيم
 * @returns الانحراف المعياري
 */
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;
  const avg = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - avg, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}

// ============================================
// Main Algorithm Functions
// ============================================

/**
 * إيجاد العقارات المشابهة
 * @param input مدخلات العقار
 * @returns قائمة العقارات المشابهة
 */
async function findComparableProperties(input: PropertyInput): Promise<ComparableProperty[]> {
  // بناء شروط البحث
  const areaMin = input.totalArea * 0.8;
  const areaMax = input.totalArea * 1.2;

  // البحث في قاعدة البيانات
  const properties = await prisma.property.findMany({
    where: {
      status: PropertyStatus.SOLD, // العقارات المباعة فقط للمقارنة
      propertyType: input.propertyType,
      governorate: input.governorate,
      areaSqm: {
        gte: areaMin,
        lte: areaMax,
      },
      salePrice: { not: null },
    },
    orderBy: { updatedAt: 'desc' },
    take: 50,
    select: {
      id: true,
      salePrice: true,
      pricePerSqm: true,
      propertyType: true,
      areaSqm: true,
      bedrooms: true,
      bathrooms: true,
      governorate: true,
      city: true,
      district: true,
      floorNumber: true,
      finishingLevel: true,
      latitude: true,
      longitude: true,
      updatedAt: true,
    },
  });

  // أيضاً البحث في العقارات النشطة للمقارنة
  const activeProperties = await prisma.property.findMany({
    where: {
      status: PropertyStatus.ACTIVE,
      propertyType: input.propertyType,
      governorate: input.governorate,
      areaSqm: {
        gte: areaMin,
        lte: areaMax,
      },
      salePrice: { not: null },
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: {
      id: true,
      salePrice: true,
      pricePerSqm: true,
      propertyType: true,
      areaSqm: true,
      bedrooms: true,
      bathrooms: true,
      governorate: true,
      city: true,
      district: true,
      floorNumber: true,
      finishingLevel: true,
      latitude: true,
      longitude: true,
      updatedAt: true,
    },
  });

  const allProperties = [...properties, ...activeProperties];

  // حساب معامل التشابه لكل عقار
  const comparables: ComparableProperty[] = allProperties
    .map(prop => {
      const similarity = calculateSimilarity(input, prop);
      let distance: number | undefined;

      if (input.latitude && input.longitude && prop.latitude && prop.longitude) {
        distance = calculateDistance(
          input.latitude, input.longitude,
          prop.latitude, prop.longitude
        );
      }

      return {
        id: prop.id,
        price: prop.salePrice!,
        pricePerSqm: prop.pricePerSqm || prop.salePrice! / prop.areaSqm,
        similarity,
        distance,
        soldDate: prop.updatedAt,
      };
    })
    .filter(comp => comp.similarity >= 0.5) // فقط العقارات ذات التشابه >= 50%
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 10);

  return comparables;
}

/**
 * الحصول على أسعار السوق الإقليمية
 * @param governorate المحافظة
 * @param city المدينة
 * @param propertyType نوع العقار
 * @returns بيانات السعر
 */
async function getRegionalPrices(
  governorate: string,
  city?: string,
  propertyType?: PropertyType
): Promise<{
  avgPricePerSqm: number;
  priceChangeMonthly: number;
  rentalYield: number;
}> {
  // البحث في جدول الأسعار الإقليمية
  const priceData = await prisma.propertyPrice.findFirst({
    where: {
      governorate,
      city: city || undefined,
      propertyType: propertyType || undefined,
    },
    orderBy: { recordedAt: 'desc' },
  });

  if (priceData) {
    return {
      avgPricePerSqm: priceData.pricePerSqmAvg || GOVERNORATE_BASE_PRICES[governorate] || GOVERNORATE_BASE_PRICES['DEFAULT'],
      priceChangeMonthly: priceData.priceChangeMonthly || 0,
      rentalYield: priceData.rentalYieldAvg || 0.07,
    };
  }

  // استخدام القيم الافتراضية
  return {
    avgPricePerSqm: GOVERNORATE_BASE_PRICES[governorate] || GOVERNORATE_BASE_PRICES['DEFAULT'],
    priceChangeMonthly: 0,
    rentalYield: 0.07,
  };
}

/**
 * حساب تعديل العمر
 * @param buildingAge عمر المبنى بالسنوات
 * @returns معامل التعديل
 */
function calculateAgeAdjustment(buildingAge?: number): number {
  if (buildingAge === undefined || buildingAge === 0) {
    return 1.20; // جديد
  }
  if (buildingAge === 1) {
    return 0.95; // سنة واحدة
  }
  // كل سنة إضافية: -5% (حد أقصى -60%)
  const depreciation = Math.min(0.60, (buildingAge - 1) * 0.05);
  return Math.max(0.40, 0.95 - depreciation);
}

/**
 * حساب تعديل الطابق
 * @param floor رقم الطابق
 * @returns معامل التعديل
 */
function calculateFloorAdjustment(floor?: number): number {
  if (floor === undefined) return 1.00;
  if (floor === 0) return 0.96; // الأرضي
  if (floor <= 3) return 1.00; // الطوابق المنخفضة
  // كل طابق فوق الثالث: +2%
  return 1 + (Math.min(floor - 3, 10) * 0.02);
}

/**
 * حساب تعديل المميزات
 * @param features قائمة المميزات
 * @returns معامل التعديل
 */
function calculateFeaturesAdjustment(features: string[]): number {
  let adjustment = 0;
  for (const feature of features) {
    const featureLower = feature.toLowerCase().replace(/\s+/g, '_');
    adjustment += FEATURE_ADJUSTMENTS[featureLower] || 0;
  }
  return 1 + adjustment;
}

/**
 * حساب الطلب السوقي
 * @param governorate المحافظة
 * @param propertyType نوع العقار
 * @returns مستوى الطلب
 */
async function calculateMarketDemand(
  governorate: string,
  propertyType: PropertyType
): Promise<'HIGH' | 'MEDIUM' | 'LOW'> {
  // حساب عدد العقارات المتاحة
  const supplyCount = await prisma.property.count({
    where: {
      governorate,
      propertyType,
      status: PropertyStatus.ACTIVE,
    },
  });

  // حساب عدد المعاملات الأخيرة
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const transactionCount = await prisma.property.count({
    where: {
      governorate,
      propertyType,
      status: PropertyStatus.SOLD,
      updatedAt: { gte: threeMonthsAgo },
    },
  });

  // نسبة الطلب للعرض
  const demandRatio = supplyCount > 0 ? transactionCount / supplyCount : 0;

  if (demandRatio >= 0.5) return 'HIGH';
  if (demandRatio >= 0.2) return 'MEDIUM';
  return 'LOW';
}

/**
 * حساب معامل الثقة
 * @param comparables العقارات المشابهة
 * @param hasRecentData هل البيانات حديثة
 * @returns معامل الثقة (0-100)
 */
function calculateConfidence(
  comparables: ComparableProperty[],
  hasRecentData: boolean
): number {
  let confidence = 50; // قاعدة أساسية

  // عدد العقارات المشابهة (حتى 25 نقطة)
  const comparableScore = Math.min(25, comparables.length * 5);
  confidence += comparableScore;

  // حداثة البيانات (حتى 15 نقطة)
  if (hasRecentData) confidence += 15;

  // تباين الأسعار (حتى 10 نقاط)
  if (comparables.length >= 3) {
    const prices = comparables.map(c => c.pricePerSqm);
    const stdDev = calculateStandardDeviation(prices);
    const mean = prices.reduce((a, b) => a + b, 0) / prices.length;
    const cv = stdDev / mean; // معامل الاختلاف
    if (cv <= 0.1) confidence += 10;
    else if (cv <= 0.2) confidence += 7;
    else if (cv <= 0.3) confidence += 4;
  }

  return Math.min(100, confidence);
}

// ============================================
// Main Export Function
// ============================================

/**
 * تقدير قيمة العقار
 * @param input مدخلات العقار
 * @returns تقدير السعر الشامل
 */
export async function estimatePropertyValue(input: PropertyInput): Promise<PriceEstimate> {
  const startTime = Date.now();

  // 1. إيجاد العقارات المشابهة
  const comparables = await findComparableProperties(input);

  // 2. الحصول على أسعار السوق الإقليمية
  const regionalPrices = await getRegionalPrices(
    input.governorate,
    input.city,
    input.propertyType
  );

  // 3. حساب السعر الأساسي
  let basePricePerSqm: number;
  if (comparables.length >= 3) {
    // استخدام الوسيط من العقارات المشابهة
    const pricesPerSqm = comparables.map(c => c.pricePerSqm);
    basePricePerSqm = calculateMedian(pricesPerSqm);
  } else {
    // استخدام المتوسطات الإقليمية
    basePricePerSqm = regionalPrices.avgPricePerSqm;
  }

  // السعر الأساسي الكلي
  const basePrice = basePricePerSqm * input.totalArea;

  // 4. حساب التعديلات

  // تعديل الموقع
  const locationMultiplier = LOCATION_ADJUSTMENTS[input.governorate] ||
    LOCATION_ADJUSTMENTS[input.city || ''] ||
    1.00;
  const locationAdjustment = basePrice * (locationMultiplier - 1);

  // تعديل العمر
  const ageMultiplier = calculateAgeAdjustment(input.buildingAge);
  const ageAdjustment = basePrice * (ageMultiplier - 1);

  // تعديل الحالة
  const conditionMultiplier = CONDITION_ADJUSTMENTS[input.condition];
  const conditionAdjustment = basePrice * (conditionMultiplier - 1);

  // تعديل المميزات
  const featuresMultiplier = calculateFeaturesAdjustment(input.features);
  const featuresAdjustment = basePrice * (featuresMultiplier - 1);

  // تعديل الطابق
  const floorMultiplier = calculateFloorAdjustment(input.floor);
  const floorAdjustment = basePrice * (floorMultiplier - 1);

  // تعديل الفرش
  const furnishingMultiplier = input.furnishingType
    ? FURNISHING_ADJUSTMENTS[input.furnishingType] || 1.00
    : 1.00;
  const furnishingAdjustment = basePrice * (furnishingMultiplier - 1);

  // تعديل نوع العقار
  const propertyTypeMultiplier = PROPERTY_TYPE_MULTIPLIERS[input.propertyType];

  // تعديل التشطيب
  const finishingMultiplier = input.finishingLevel
    ? FINISHING_ADJUSTMENTS[input.finishingLevel] || 1.00
    : 1.00;

  // 5. حساب السعر النهائي
  const totalMultiplier =
    locationMultiplier *
    ageMultiplier *
    conditionMultiplier *
    featuresMultiplier *
    floorMultiplier *
    furnishingMultiplier *
    propertyTypeMultiplier *
    finishingMultiplier;

  const estimatedPrice = Math.round(basePrice * totalMultiplier);
  const pricePerMeter = Math.round(estimatedPrice / input.totalArea);

  // 6. حساب نطاق السعر
  const priceVariation = comparables.length >= 5 ? 0.10 : 0.15;
  const priceRange = {
    min: Math.round(estimatedPrice * (1 - priceVariation)),
    max: Math.round(estimatedPrice * (1 + priceVariation)),
  };

  // 7. حساب الطلب السوقي
  const marketDemand = await calculateMarketDemand(input.governorate, input.propertyType);

  // 8. حساب معامل الثقة
  const hasRecentData = comparables.some(c => {
    if (!c.soldDate) return false;
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    return c.soldDate >= threeMonthsAgo;
  });
  const confidence = calculateConfidence(comparables, hasRecentData);

  // 9. حساب اتجاه السعر
  let priceTrend: 'RISING' | 'STABLE' | 'FALLING' = 'STABLE';
  if (regionalPrices.priceChangeMonthly > 2) priceTrend = 'RISING';
  else if (regionalPrices.priceChangeMonthly < -2) priceTrend = 'FALLING';

  // 10. حساب مستوى العرض
  const supplyCount = await prisma.property.count({
    where: {
      governorate: input.governorate,
      propertyType: input.propertyType,
      status: PropertyStatus.ACTIVE,
    },
  });
  let supplyLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  if (supplyCount > 100) supplyLevel = 'HIGH';
  else if (supplyCount > 30) supplyLevel = 'MEDIUM';
  else supplyLevel = 'LOW';

  // 11. توليد التوصيات
  const recommendations: string[] = [];

  if (marketDemand === 'HIGH') {
    recommendations.push('الطلب مرتفع في هذه المنطقة، فرصة جيدة للبيع');
  }
  if (priceTrend === 'RISING') {
    recommendations.push('الأسعار في ارتفاع، قد يكون من المفيد الانتظار لسعر أفضل');
  }
  if (confidence < 70) {
    recommendations.push('معامل الثقة متوسط، يُنصح بالحصول على تقييم ميداني');
  }
  if (input.condition === 'FAIR' || input.condition === 'POOR') {
    recommendations.push('تحسين حالة العقار قد يزيد القيمة بنسبة 15-30%');
  }
  if (!input.features.includes('parking')) {
    recommendations.push('إضافة موقف سيارات يمكن أن يزيد القيمة بنسبة 3%');
  }

  const executionTime = Date.now() - startTime;
  console.log(`AVM Execution time: ${executionTime}ms`);

  return {
    estimatedPrice,
    pricePerMeter,
    confidence,
    priceRange,
    comparables,
    marketDemand,
    breakdown: {
      basePrice,
      locationAdjustment,
      ageAdjustment,
      conditionAdjustment,
      featuresAdjustment,
      floorAdjustment,
      furnishingAdjustment,
    },
    marketInsights: {
      avgDaysOnMarket: 45, // TODO: حساب من البيانات الفعلية
      priceTrend,
      priceChangePercent: regionalPrices.priceChangeMonthly,
      supplyLevel,
    },
    recommendations,
  };
}

/**
 * تحديث أسعار السوق الإقليمية
 * يُستدعى دورياً لتحديث بيانات الأسعار
 */
export async function updateRegionalPrices(): Promise<void> {
  // الحصول على جميع المحافظات والمدن الفريدة
  const locations = await prisma.property.groupBy({
    by: ['governorate', 'city', 'propertyType'],
    where: {
      status: { in: [PropertyStatus.ACTIVE, PropertyStatus.SOLD] },
      salePrice: { not: null },
    },
    _avg: { pricePerSqm: true },
    _min: { pricePerSqm: true },
    _max: { pricePerSqm: true },
    _count: true,
  });

  // تحديث جدول الأسعار لكل موقع
  for (const loc of locations) {
    if (loc._count >= 5) { // على الأقل 5 عقارات للإحصاء
      await prisma.propertyPrice.upsert({
        where: {
          governorate_city_district_compoundName_propertyType: {
            governorate: loc.governorate,
            city: loc.city || '',
            district: '',
            compoundName: '',
            propertyType: loc.propertyType,
          },
        },
        update: {
          pricePerSqmAvg: loc._avg.pricePerSqm,
          pricePerSqmLow: loc._min.pricePerSqm,
          pricePerSqmHigh: loc._max.pricePerSqm,
          sampleSize: loc._count,
          recordedAt: new Date(),
        },
        create: {
          governorate: loc.governorate,
          city: loc.city || null,
          propertyType: loc.propertyType,
          pricePerSqmAvg: loc._avg.pricePerSqm,
          pricePerSqmLow: loc._min.pricePerSqm,
          pricePerSqmHigh: loc._max.pricePerSqm,
          sampleSize: loc._count,
        },
      });
    }
  }
}

export default {
  estimatePropertyValue,
  updateRegionalPrices,
  calculateSimilarity,
  calculateDistance,
};
