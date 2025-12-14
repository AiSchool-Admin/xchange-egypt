/**
 * Xchange Vehicle Marketplace Algorithms
 * خوارزميات التسعير الديناميكي والمقايضة والتوصيات
 *
 * @module vehicle-algorithms
 * @version 1.0.0
 */

import {
  PricingInput,
  PriceEstimate,
  MarketData,
  MarketDemand,
  VehicleCondition,
  VehicleMake,
  Governorate,
  InspectionGrade,
  BarterItem,
  BarterPreference,
  BarterChain,
  BarterMatchResult,
  UserProfile,
  RecommendationResult,
  RecommendationsResponse,
  VehicleListing,
  MOCK_VEHICLE_LISTINGS,
} from '../api/vehicle-marketplace';

// =============================================================================
// DYNAMIC PRICING ALGORITHM
// خوارزمية التسعير الديناميكي
// =============================================================================

/**
 * Base MSRP prices for vehicles in Egyptian market (2024)
 * أسعار السيارات الأساسية في السوق المصري
 */
const BASE_MSRP: Record<string, Record<string, number>> = {
  TOYOTA: {
    'Corolla': 1150000,
    'Camry': 1800000,
    'Yaris': 650000,
    'Fortuner': 2200000,
    'Land Cruiser': 5500000,
    'Hilux': 1100000,
    'Rush': 950000,
    'RAV4': 1600000,
    'C-HR': 1200000,
  },
  HYUNDAI: {
    'Elantra': 850000,
    'Tucson': 1300000,
    'Accent': 580000,
    'Creta': 750000,
    'Santa Fe': 1800000,
    'Sonata': 1400000,
    'i10': 420000,
    'Verna': 650000,
  },
  KIA: {
    'Cerato': 780000,
    'Sportage': 1200000,
    'Rio': 520000,
    'Sorento': 1700000,
    'Seltos': 850000,
    'Picanto': 450000,
    'K5': 1300000,
  },
  NISSAN: {
    'Sunny': 620000,
    'Sentra': 750000,
    'Juke': 850000,
    'Qashqai': 1100000,
    'X-Trail': 1400000,
    'Kicks': 780000,
  },
  MERCEDES: {
    'C-Class': 2500000,
    'E-Class': 3800000,
    'S-Class': 7500000,
    'GLC': 3200000,
    'GLE': 4500000,
    'A-Class': 1800000,
  },
  BMW: {
    '3 Series': 2400000,
    '5 Series': 3500000,
    '7 Series': 6500000,
    'X1': 2200000,
    'X3': 3000000,
    'X5': 4500000,
  },
  MG: {
    'MG5': 550000,
    'MG6': 720000,
    'ZS': 650000,
    'HS': 850000,
    'RX5': 950000,
  },
  CHERY: {
    'Tiggo 2': 480000,
    'Tiggo 3': 520000,
    'Tiggo 4': 680000,
    'Tiggo 7': 850000,
    'Tiggo 8': 1050000,
    'Arrizo 5': 550000,
  },
  CHEVROLET: {
    'Optra': 450000,
    'Cruze': 680000,
    'Aveo': 380000,
    'Captiva': 950000,
  },
  BYD: {
    'F3': 380000,
    'Song Plus': 950000,
    'Han': 1800000,
    'Dolphin': 850000,
    'Seal': 1500000,
  },
};

/**
 * Depreciation rates by year (Egyptian market)
 * معدلات الاستهلاك حسب السنة
 */
const DEPRECIATION_RATES: Record<number, number> = {
  0: 0,      // New
  1: 0.25,   // First year - 25% (higher in Egypt)
  2: 0.15,   // Second year - 15%
  3: 0.12,   // Third year - 12%
  4: 0.10,   // Fourth year - 10%
  5: 0.08,   // Fifth year onwards - 8%
};

/**
 * Mileage adjustment factors
 * عوامل تعديل الكيلومترات
 */
const MILEAGE_ADJUSTMENTS: Array<{ max: number; factor: number }> = [
  { max: 30000, factor: 1.05 },    // +5% premium for low mileage
  { max: 60000, factor: 1.00 },    // Baseline
  { max: 100000, factor: 0.92 },   // -8%
  { max: 150000, factor: 0.85 },   // -15%
  { max: 200000, factor: 0.75 },   // -25%
  { max: Infinity, factor: 0.65 }, // -35% for very high mileage
];

/**
 * Condition adjustment factors
 * عوامل تعديل الحالة
 */
const CONDITION_ADJUSTMENTS: Record<VehicleCondition, number> = {
  'NEW': 1.0,
  'LIKE_NEW': 0.98,
  'EXCELLENT': 0.95,
  'VERY_GOOD': 0.90,
  'GOOD': 0.85,
  'FAIR': 0.75,
  'NEEDS_WORK': 0.60,
};

/**
 * Location adjustment factors
 * عوامل تعديل الموقع
 */
const LOCATION_ADJUSTMENTS: Record<Governorate, number> = {
  'CAIRO': 1.0,        // Baseline
  'GIZA': 1.0,
  'ALEXANDRIA': 0.97,  // -3%
  'RED_SEA': 1.05,     // +5% tourism
  'SOUTH_SINAI': 1.05, // +5% tourism
  'PORT_SAID': 0.95,   // -5%
  'ISMAILIA': 0.95,
  'SUEZ': 0.95,
  'DAKAHLIA': 0.95,
  'SHARQIA': 0.95,
  'GHARBIA': 0.93,
  'MENOFIA': 0.93,
  'QALYUBIA': 0.97,
  'BEHEIRA': 0.92,
  'KAFR_EL_SHEIKH': 0.92,
  'DAMIETTA': 0.93,
  'FAYOUM': 0.90,      // -10% Upper Egypt
  'BENI_SUEF': 0.90,
  'MINYA': 0.90,
  'ASSIUT': 0.90,
  'SOHAG': 0.90,
  'QENA': 0.90,
  'LUXOR': 0.92,
  'ASWAN': 0.90,
  'NEW_VALLEY': 0.88,
  'MATROUH': 0.95,
  'NORTH_SINAI': 0.88,
};

/**
 * Inspection grade adjustments
 * عوامل تعديل درجة الفحص
 */
const INSPECTION_ADJUSTMENTS: Record<InspectionGrade, number> = {
  'A': 1.05,   // +5% for excellent inspection
  'B': 1.02,   // +2%
  'C': 1.0,    // Baseline
  'D': 0.95,   // -5%
  'F': 0.85,   // -15%
};

/**
 * Seasonal adjustment factors
 * عوامل التعديل الموسمية
 */
function getSeasonalAdjustment(): number {
  const month = new Date().getMonth() + 1;

  // January-February (tax season): +5%
  if (month === 1 || month === 2) return 1.05;

  // Ramadan period (approximate): -5%
  // This should be calculated based on Hijri calendar
  if (month === 3 || month === 4) return 0.95;

  // Summer (June-August): baseline
  if (month >= 6 && month <= 8) return 1.0;

  // December (year end): +3%
  if (month === 12) return 1.03;

  return 1.0;
}

/**
 * Calculate base price from MSRP with depreciation
 * حساب السعر الأساسي من سعر التجزئة مع الاستهلاك
 */
function calculateBasePrice(make: string, model: string, year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  // Get MSRP or estimate
  let msrp = BASE_MSRP[make]?.[model];

  if (!msrp) {
    // Estimate based on make category
    const premiumMakes = ['MERCEDES', 'BMW', 'AUDI', 'LEXUS', 'PORSCHE', 'LAND_ROVER'];
    const midMakes = ['TOYOTA', 'HYUNDAI', 'KIA', 'NISSAN', 'HONDA', 'MAZDA', 'VOLKSWAGEN'];

    if (premiumMakes.includes(make)) {
      msrp = 2500000; // Default premium
    } else if (midMakes.includes(make)) {
      msrp = 900000; // Default mid-range
    } else {
      msrp = 600000; // Default budget
    }
  }

  // Apply depreciation
  let value = msrp;
  for (let i = 1; i <= Math.min(age, 10); i++) {
    const rate = DEPRECIATION_RATES[Math.min(i, 5)] || 0.08;
    value *= (1 - rate);
  }

  return Math.round(value);
}

/**
 * Calculate mileage adjustment
 * حساب تعديل الكيلومترات
 */
function calculateMileageAdjustment(mileage: number, year: number): number {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;

  // Expected annual mileage in Egypt: 15,000 km
  const expectedMileage = age * 15000;
  const mileageRatio = mileage / (expectedMileage || 15000);

  // Find the appropriate adjustment tier
  for (const tier of MILEAGE_ADJUSTMENTS) {
    if (mileage <= tier.max) {
      // Apply additional penalty for high mileage ratio
      if (mileageRatio > 1.5) {
        return tier.factor * 0.95; // Additional 5% penalty
      }
      return tier.factor;
    }
  }

  return 0.65;
}

/**
 * Calculate features adjustment
 * حساب تعديل المميزات
 */
function calculateFeaturesAdjustment(features?: Record<string, any>): number {
  if (!features) return 1.0;

  let adjustment = 1.0;

  // Premium features
  if (features.sunroof === 'PANORAMIC') adjustment += 0.02;
  if (features.leatherSeats) adjustment += 0.015;
  if (features.camera360) adjustment += 0.01;
  if (features.adaptiveCruise) adjustment += 0.015;
  if (features.premiumAudio) adjustment += 0.01;
  if (features.heatedSeats) adjustment += 0.005;
  if (features.cooledSeats) adjustment += 0.01;
  if (features.allWheelDrive) adjustment += 0.03;

  // Cap the adjustment
  return Math.min(adjustment, 1.10);
}

/**
 * Calculate market demand
 * حساب طلب السوق
 */
function calculateMarketDemand(make: string, model: string): MarketDemand {
  // High demand makes/models in Egypt
  const highDemandModels = [
    'TOYOTA-Corolla', 'TOYOTA-Fortuner', 'HYUNDAI-Tucson', 'KIA-Sportage',
    'MERCEDES-C-Class', 'BMW-X5', 'TOYOTA-Land Cruiser',
  ];

  const mediumDemandMakes = ['TOYOTA', 'HYUNDAI', 'KIA', 'MERCEDES', 'BMW'];

  const key = `${make}-${model}`;

  if (highDemandModels.includes(key)) {
    return 'VERY_HIGH';
  }

  if (mediumDemandMakes.includes(make)) {
    return 'HIGH';
  }

  const lowDemandMakes = ['FIAT', 'PEUGEOT', 'RENAULT', 'OPEL'];
  if (lowDemandMakes.includes(make)) {
    return 'LOW';
  }

  return 'MEDIUM';
}

/**
 * Find comparable listings
 * البحث عن إعلانات مشابهة
 */
function findComparables(input: PricingInput, listings: VehicleListing[]): Array<{
  listingId: string;
  title: string;
  price: number;
  similarity: number;
  daysListed: number;
  link: string;
}> {
  const comparables: Array<any> = [];

  for (const listing of listings) {
    let similarity = 0;

    // Same make: 30%
    if (listing.make === input.make) similarity += 30;

    // Same model: 30%
    if (listing.model.toLowerCase() === input.model.toLowerCase()) similarity += 30;

    // Year within 1: 20%
    if (Math.abs(listing.year - input.year) <= 1) similarity += 20;
    else if (Math.abs(listing.year - input.year) <= 2) similarity += 10;

    // Mileage within 20%: 15%
    const mileageDiff = Math.abs(listing.mileage - input.mileage) / input.mileage;
    if (mileageDiff <= 0.2) similarity += 15;
    else if (mileageDiff <= 0.4) similarity += 8;

    // Same governorate: 5%
    if (listing.governorate === input.governorate) similarity += 5;

    if (similarity >= 50) {
      const daysListed = Math.floor(
        (Date.now() - new Date(listing.createdAt).getTime()) / (1000 * 60 * 60 * 24)
      );

      comparables.push({
        listingId: listing.id,
        title: listing.titleAr || listing.title,
        price: listing.askingPrice,
        similarity,
        daysListed,
        link: `/vehicles/${listing.id}`,
      });
    }
  }

  // Sort by similarity and return top 5
  return comparables
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

/**
 * Main pricing algorithm
 * الخوارزمية الرئيسية للتسعير
 */
export function calculateDynamicPrice(
  input: PricingInput,
  marketData?: MarketData
): PriceEstimate {
  // 1. Calculate base price
  const basePrice = calculateBasePrice(input.make, input.model, input.year);

  // 2. Calculate adjustments
  const mileageAdjustment = calculateMileageAdjustment(input.mileage, input.year);
  const conditionAdjustment = CONDITION_ADJUSTMENTS[input.condition] || 0.85;
  const locationAdjustment = LOCATION_ADJUSTMENTS[input.governorate] || 1.0;
  const featuresAdjustment = calculateFeaturesAdjustment(input.features);
  const seasonalAdjustment = getSeasonalAdjustment();

  // 3. Accident adjustment
  let accidentAdjustment = 1.0;
  if (input.hasAccidents) {
    switch (input.accidentSeverity) {
      case 'MINOR': accidentAdjustment = 0.95; break;
      case 'MODERATE': accidentAdjustment = 0.88; break;
      case 'MAJOR': accidentAdjustment = 0.75; break;
      default: accidentAdjustment = 0.90;
    }
  }

  // 4. Ownership adjustment
  let ownershipAdjustment = 1.0;
  if (input.previousOwners) {
    if (input.previousOwners === 1) ownershipAdjustment = 1.02; // First owner bonus
    else if (input.previousOwners >= 3) ownershipAdjustment = 0.95;
  }

  // 5. Inspection adjustment
  let inspectionAdjustment = 1.0;
  if (input.inspectionGrade) {
    inspectionAdjustment = INSPECTION_ADJUSTMENTS[input.inspectionGrade];
  }

  // 6. Market demand adjustment
  const marketDemand = calculateMarketDemand(input.make, input.model);
  let marketAdjustment = 1.0;
  switch (marketDemand) {
    case 'VERY_HIGH': marketAdjustment = 1.08; break;
    case 'HIGH': marketAdjustment = 1.04; break;
    case 'MEDIUM': marketAdjustment = 1.0; break;
    case 'LOW': marketAdjustment = 0.95; break;
    case 'VERY_LOW': marketAdjustment = 0.90; break;
  }

  // 7. Calculate final estimated value
  const adjustedPrice = basePrice *
    mileageAdjustment *
    conditionAdjustment *
    locationAdjustment *
    featuresAdjustment *
    seasonalAdjustment *
    accidentAdjustment *
    ownershipAdjustment *
    inspectionAdjustment *
    marketAdjustment;

  const estimatedValue = Math.round(adjustedPrice / 5000) * 5000; // Round to nearest 5000

  // 8. Calculate price range
  const variance = estimatedValue * 0.12; // 12% variance
  const priceRange = {
    min: Math.round((estimatedValue - variance) / 5000) * 5000,
    max: Math.round((estimatedValue + variance) / 5000) * 5000,
  };

  // 9. Calculate confidence score
  let confidence = 50; // Base confidence

  // Add confidence based on available data
  if (input.inspectionGrade) confidence += 15;
  if (input.serviceHistory) confidence += 10;
  if (marketData?.comparables?.length && marketData.comparables.length >= 5) confidence += 20;
  else if (marketData?.comparables?.length && marketData.comparables.length >= 3) confidence += 10;

  // Reduce confidence for rare vehicles
  if (marketDemand === 'VERY_LOW') confidence -= 10;

  confidence = Math.min(95, Math.max(30, confidence));

  // 10. Calculate recommendations
  const recommendedAskingPrice = Math.round((estimatedValue * 1.08) / 5000) * 5000;
  const recommendedMinPrice = Math.round((estimatedValue * 0.95) / 5000) * 5000;
  const quickSalePrice = Math.round((estimatedValue * 0.92) / 5000) * 5000;

  // 11. Find comparables
  const comparables = findComparables(input, MOCK_VEHICLE_LISTINGS);

  // 12. Calculate depreciation rate
  const currentYear = new Date().getFullYear();
  const age = currentYear - input.year;
  const depreciationRate = age === 0 ? 0 : DEPRECIATION_RATES[Math.min(age, 5)] || 0.08;

  // 13. Generate insights
  const insights: Array<{ type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'; message: string; messageAr: string }> = [];

  if (mileageAdjustment > 1) {
    insights.push({
      type: 'POSITIVE',
      message: 'Low mileage adds value',
      messageAr: 'الكيلومترات القليلة تضيف قيمة للسيارة',
    });
  } else if (mileageAdjustment < 0.9) {
    insights.push({
      type: 'NEGATIVE',
      message: 'High mileage reduces value',
      messageAr: 'الكيلومترات العالية تقلل من قيمة السيارة',
    });
  }

  if (marketDemand === 'VERY_HIGH' || marketDemand === 'HIGH') {
    insights.push({
      type: 'POSITIVE',
      message: 'This model is in high demand',
      messageAr: 'هذا الموديل عليه طلب عالي في السوق',
    });
  }

  if (input.hasAccidents) {
    insights.push({
      type: 'NEGATIVE',
      message: 'Accident history affects resale value',
      messageAr: 'تاريخ الحوادث يؤثر على قيمة إعادة البيع',
    });
  }

  if (seasonalAdjustment > 1) {
    insights.push({
      type: 'POSITIVE',
      message: 'Good time to sell - high demand season',
      messageAr: 'وقت جيد للبيع - موسم الطلب العالي',
    });
  }

  return {
    estimatedValue,
    priceRange,
    confidence,
    marketDemand,
    supplyLevel: 'MEDIUM',
    recommendedAskingPrice,
    recommendedMinPrice,
    quickSalePrice,
    depreciationRate,
    estimatedValueNextYear: Math.round(estimatedValue * (1 - depreciationRate)),
    breakdown: {
      basePrice,
      mileageAdjustment: Math.round(basePrice * (mileageAdjustment - 1)),
      conditionAdjustment: Math.round(basePrice * (conditionAdjustment - 1)),
      locationAdjustment: Math.round(basePrice * (locationAdjustment - 1)),
      featuresAdjustment: Math.round(basePrice * (featuresAdjustment - 1)),
      marketAdjustment: Math.round(basePrice * (marketAdjustment - 1)),
      seasonalAdjustment: Math.round(basePrice * (seasonalAdjustment - 1)),
      accidentAdjustment: Math.round(basePrice * (accidentAdjustment - 1)),
      ownershipAdjustment: Math.round(basePrice * (ownershipAdjustment - 1)),
    },
    comparables,
    insights,
  };
}

// =============================================================================
// MULTI-PARTY BARTER MATCHING ALGORITHM
// خوارزمية المقايضة متعددة الأطراف
// =============================================================================

/**
 * Compatibility matrix for barter items
 */
interface CompatibilityScore {
  userId: string;
  score: number;
  reasons: string[];
}

/**
 * Cross-category liquidity penalties
 */
const LIQUIDITY_PENALTIES: Record<string, number> = {
  'VEHICLE-VEHICLE': 1.0,
  'VEHICLE-PROPERTY': 0.7,
  'VEHICLE-GOLD': 0.9,
  'VEHICLE-PHONE': 0.8,
  'PROPERTY-PROPERTY': 1.0,
  'GOLD-GOLD': 1.0,
};

/**
 * Calculate compatibility between two users' preferences
 */
function calculateUserCompatibility(
  user1Offer: BarterItem,
  user1Seeking: BarterPreference,
  user2Offer: BarterItem,
  user2Seeking: BarterPreference
): number {
  let score = 0;

  // Check if user1's offer matches user2's seeking
  if (user2Seeking.seekingTypes.includes(user1Offer.type as any)) {
    score += 40;

    // Value range check
    if (user1Offer.estimatedValue >= user2Seeking.minValue &&
        user1Offer.estimatedValue <= user2Seeking.maxValue) {
      score += 30;
    } else {
      // Partial score for close values
      const midRange = (user2Seeking.minValue + user2Seeking.maxValue) / 2;
      const diff = Math.abs(user1Offer.estimatedValue - midRange) / midRange;
      if (diff < 0.2) score += 20;
      else if (diff < 0.4) score += 10;
    }
  }

  // Check if user2's offer matches user1's seeking
  if (user1Seeking.seekingTypes.includes(user2Offer.type as any)) {
    score += 40;

    if (user2Offer.estimatedValue >= user1Seeking.minValue &&
        user2Offer.estimatedValue <= user1Seeking.maxValue) {
      score += 30;
    } else {
      const midRange = (user1Seeking.minValue + user1Seeking.maxValue) / 2;
      const diff = Math.abs(user2Offer.estimatedValue - midRange) / midRange;
      if (diff < 0.2) score += 20;
      else if (diff < 0.4) score += 10;
    }
  }

  // Vehicle-specific preferences
  if (user1Offer.type === 'VEHICLE' && user2Seeking.vehiclePreferences) {
    const vehicleInfo = user1Offer.vehicleInfo;
    if (vehicleInfo) {
      // Make preference
      if (user2Seeking.vehiclePreferences.makes?.includes(vehicleInfo.make as any)) {
        score += 15;
      }
      // Year preference
      if (user2Seeking.vehiclePreferences.minYear &&
          vehicleInfo.year >= user2Seeking.vehiclePreferences.minYear) {
        score += 10;
      }
      // Mileage preference
      if (user2Seeking.vehiclePreferences.maxMileage &&
          vehicleInfo.mileage <= user2Seeking.vehiclePreferences.maxMileage) {
        score += 10;
      }
    }
  }

  return Math.min(score, 100);
}

/**
 * Calculate fairness score for a barter chain
 */
function calculateFairnessScore(chain: Partial<BarterChain>): number {
  if (!chain.participants || chain.participants.length === 0) return 0;

  const values = chain.participants.map(p => p.gives.estimatedValue);
  const avgValue = values.reduce((a, b) => a + b, 0) / values.length;

  // Calculate variance
  const variance = values.reduce((sum, v) => sum + Math.pow(v - avgValue, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = stdDev / avgValue;

  // Lower CV = more fair
  // CV of 0 = 100 score, CV of 0.5 = 0 score
  return Math.max(0, Math.round(100 * (1 - coefficientOfVariation * 2)));
}

/**
 * Calculate feasibility score based on user verification and history
 */
function calculateFeasibilityScore(chain: Partial<BarterChain>): number {
  // In a real implementation, this would check user verification levels,
  // past transaction success rates, etc.
  // For now, return a default score
  return 85;
}

/**
 * Optimize cash flows in a barter chain using greedy algorithm
 */
function optimizeCashFlows(
  participants: Array<{ userId: string; gives: BarterItem; receives: BarterItem }>
): Array<{ from: string; to: string; amount: number; reason: string }> {
  // Calculate imbalances
  const imbalances: Map<string, number> = new Map();

  for (const p of participants) {
    const currentBalance = imbalances.get(p.userId) || 0;
    const receivedValue = p.receives.estimatedValue;
    const givenValue = p.gives.estimatedValue;
    imbalances.set(p.userId, currentBalance + receivedValue - givenValue);
  }

  // Separate creditors and debtors
  const creditors: Array<{ userId: string; amount: number }> = [];
  const debtors: Array<{ userId: string; amount: number }> = [];

  imbalances.forEach((amount, userId) => {
    if (amount > 0) {
      creditors.push({ userId, amount });
    } else if (amount < 0) {
      debtors.push({ userId, amount: -amount });
    }
  });

  // Sort by amount (largest first)
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  // Greedy matching
  const cashFlows: Array<{ from: string; to: string; amount: number; reason: string }> = [];

  while (creditors.length > 0 && debtors.length > 0) {
    const creditor = creditors[0];
    const debtor = debtors[0];

    const transferAmount = Math.min(creditor.amount, debtor.amount);

    if (transferAmount > 0) {
      cashFlows.push({
        from: debtor.userId,
        to: creditor.userId,
        amount: Math.round(transferAmount),
        reason: 'فرق القيمة',
      });
    }

    creditor.amount -= transferAmount;
    debtor.amount -= transferAmount;

    if (creditor.amount <= 0) creditors.shift();
    if (debtor.amount <= 0) debtors.shift();
  }

  return cashFlows;
}

/**
 * Find direct (2-party) barter matches
 */
function findDirectMatches(
  userOffer: BarterItem,
  userPreference: BarterPreference,
  availableOffers: Array<{ item: BarterItem; preference: BarterPreference }>
): BarterChain[] {
  const matches: BarterChain[] = [];

  for (const other of availableOffers) {
    if (other.item.userId === userOffer.userId) continue;

    const compatibility = calculateUserCompatibility(
      userOffer,
      userPreference,
      other.item,
      other.preference
    );

    if (compatibility >= 60) {
      const participants = [
        {
          userId: userOffer.userId,
          userName: `User ${userOffer.userId}`,
          gives: userOffer,
          receives: other.item,
          cashFlow: other.item.estimatedValue - userOffer.estimatedValue,
        },
        {
          userId: other.item.userId,
          userName: `User ${other.item.userId}`,
          gives: other.item,
          receives: userOffer,
          cashFlow: userOffer.estimatedValue - other.item.estimatedValue,
        },
      ];

      const cashFlows = optimizeCashFlows(participants);
      const fairnessScore = calculateFairnessScore({ participants });
      const feasibilityScore = calculateFeasibilityScore({ participants });

      const chain: BarterChain = {
        id: `barter-direct-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: 'DIRECT',
        participants,
        totalValue: userOffer.estimatedValue + other.item.estimatedValue,
        maxImbalance: Math.abs(userOffer.estimatedValue - other.item.estimatedValue),
        fairnessScore,
        feasibilityScore,
        overallScore: Math.round((compatibility * 0.5) + (fairnessScore * 0.3) + (feasibilityScore * 0.2)),
        cashFlows,
        status: 'PROPOSED',
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        matchReasons: [
          'Direct value match',
          `${compatibility}% compatibility`,
        ],
        matchReasonsAr: [
          'تطابق مباشر في القيمة',
          `${compatibility}% توافق`,
        ],
      };

      matches.push(chain);
    }
  }

  return matches.sort((a, b) => b.overallScore - a.overallScore);
}

/**
 * Find 3-way circular barter matches
 */
function findThreeWayMatches(
  userOffer: BarterItem,
  userPreference: BarterPreference,
  availableOffers: Array<{ item: BarterItem; preference: BarterPreference }>
): BarterChain[] {
  const matches: BarterChain[] = [];

  // This is a simplified version - a full implementation would use graph algorithms
  for (let i = 0; i < availableOffers.length; i++) {
    for (let j = i + 1; j < availableOffers.length; j++) {
      const other1 = availableOffers[i];
      const other2 = availableOffers[j];

      if (other1.item.userId === userOffer.userId ||
          other2.item.userId === userOffer.userId) continue;

      // Check if A→B, B→C, C→A is viable
      const comp1 = calculateUserCompatibility(userOffer, userPreference, other1.item, other1.preference);
      const comp2 = calculateUserCompatibility(other1.item, other1.preference, other2.item, other2.preference);
      const comp3 = calculateUserCompatibility(other2.item, other2.preference, userOffer, userPreference);

      const avgCompatibility = (comp1 + comp2 + comp3) / 3;

      if (avgCompatibility >= 50) {
        const participants = [
          {
            userId: userOffer.userId,
            userName: `User ${userOffer.userId}`,
            gives: userOffer,
            receives: other2.item,
            cashFlow: 0,
          },
          {
            userId: other1.item.userId,
            userName: `User ${other1.item.userId}`,
            gives: other1.item,
            receives: userOffer,
            cashFlow: 0,
          },
          {
            userId: other2.item.userId,
            userName: `User ${other2.item.userId}`,
            gives: other2.item,
            receives: other1.item,
            cashFlow: 0,
          },
        ];

        const cashFlows = optimizeCashFlows(participants);
        const fairnessScore = calculateFairnessScore({ participants });
        const feasibilityScore = calculateFeasibilityScore({ participants });

        const chain: BarterChain = {
          id: `barter-3way-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          type: 'THREE_WAY',
          participants,
          totalValue: userOffer.estimatedValue + other1.item.estimatedValue + other2.item.estimatedValue,
          maxImbalance: Math.max(
            Math.abs(userOffer.estimatedValue - other1.item.estimatedValue),
            Math.abs(other1.item.estimatedValue - other2.item.estimatedValue),
            Math.abs(other2.item.estimatedValue - userOffer.estimatedValue)
          ),
          fairnessScore,
          feasibilityScore,
          overallScore: Math.round((avgCompatibility * 0.4) + (fairnessScore * 0.35) + (feasibilityScore * 0.25)),
          cashFlows,
          status: 'PROPOSED',
          expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
          matchReasons: [
            '3-way circular match',
            `${Math.round(avgCompatibility)}% average compatibility`,
          ],
          matchReasonsAr: [
            'مقايضة دائرية ثلاثية',
            `${Math.round(avgCompatibility)}% متوسط التوافق`,
          ],
        };

        matches.push(chain);
      }
    }
  }

  return matches.sort((a, b) => b.overallScore - a.overallScore).slice(0, 10);
}

/**
 * Main barter matching algorithm
 * الخوارزمية الرئيسية للمقايضة
 */
export function findBarterMatches(
  userOffer: BarterItem,
  userPreference: BarterPreference,
  maxChainLength: number = 4
): BarterMatchResult {
  // Mock available offers for demonstration
  const mockOffers: Array<{ item: BarterItem; preference: BarterPreference }> = [
    {
      item: {
        id: 'item-1',
        userId: 'user-2',
        type: 'VEHICLE',
        listingId: 'v-002',
        vehicleInfo: { make: 'HYUNDAI', model: 'Tucson', year: 2022, mileage: 35000, condition: 'EXCELLENT' },
        estimatedValue: 1150000,
        description: 'Hyundai Tucson 2022',
        descriptionAr: 'هيونداي توسان 2022',
        images: [],
      },
      preference: {
        userId: 'user-2',
        offerItem: {} as BarterItem,
        seekingTypes: ['VEHICLE'],
        vehiclePreferences: { makes: ['TOYOTA', 'MERCEDES'], minYear: 2020 },
        minValue: 900000,
        maxValue: 1300000,
        acceptsCashDifference: true,
        maxCashToReceive: 200000,
      },
    },
    {
      item: {
        id: 'item-2',
        userId: 'user-3',
        type: 'VEHICLE',
        listingId: 'v-005',
        vehicleInfo: { make: 'KIA', model: 'Sportage', year: 2023, mileage: 22000, condition: 'EXCELLENT' },
        estimatedValue: 1050000,
        description: 'Kia Sportage 2023',
        descriptionAr: 'كيا سبورتاج 2023',
        images: [],
      },
      preference: {
        userId: 'user-3',
        offerItem: {} as BarterItem,
        seekingTypes: ['VEHICLE', 'PROPERTY'],
        vehiclePreferences: { makes: ['BMW', 'MERCEDES'], minYear: 2019 },
        minValue: 800000,
        maxValue: 1500000,
        acceptsCashDifference: true,
        maxCashToPay: 300000,
      },
    },
    {
      item: {
        id: 'item-3',
        userId: 'user-4',
        type: 'VEHICLE',
        listingId: 'v-007',
        vehicleInfo: { make: 'NISSAN', model: 'Sunny', year: 2022, mileage: 40000, condition: 'EXCELLENT' },
        estimatedValue: 520000,
        description: 'Nissan Sunny 2022',
        descriptionAr: 'نيسان صني 2022',
        images: [],
      },
      preference: {
        userId: 'user-4',
        offerItem: {} as BarterItem,
        seekingTypes: ['VEHICLE'],
        vehiclePreferences: { makes: ['TOYOTA', 'HYUNDAI', 'KIA'] },
        minValue: 700000,
        maxValue: 1000000,
        acceptsCashDifference: true,
        maxCashToPay: 400000,
      },
    },
  ];

  const directMatches = findDirectMatches(userOffer, userPreference, mockOffers);
  const threeWayMatches = findThreeWayMatches(userOffer, userPreference, mockOffers);

  const allMatches = [...directMatches, ...threeWayMatches];
  const bestMatch = allMatches.length > 0 ? allMatches[0] : undefined;

  // Generate suggestions if no matches found
  const suggestions: Array<{ type: string; message: string; messageAr: string }> = [];

  if (allMatches.length === 0) {
    suggestions.push({
      type: 'EXPAND_PREFERENCES',
      message: 'Try expanding your preferences to find more matches',
      messageAr: 'جرب توسيع تفضيلاتك للعثور على مزيد من التطابقات',
    });

    if (!userPreference.acceptsCashDifference) {
      suggestions.push({
        type: 'ADD_CASH',
        message: 'Consider accepting cash difference to increase matches',
        messageAr: 'فكر في قبول فرق نقدي لزيادة فرص التطابق',
      });
    }
  }

  return {
    directMatches,
    threeWayMatches,
    chainMatches: [], // Complex chain matches would go here
    totalMatches: allMatches.length,
    bestMatch,
    suggestions,
  };
}

// =============================================================================
// AI RECOMMENDATION ENGINE
// محرك التوصيات الذكي
// =============================================================================

/**
 * Calculate content-based similarity score
 */
function calculateContentSimilarity(
  profile: UserProfile,
  listing: VehicleListing
): number {
  let score = 0;

  // Make affinity (30%)
  const makeAffinityScore = profile.implicitPreferences.makeAffinity[listing.make] || 0;
  score += makeAffinityScore * 30;

  // Price compatibility (25%)
  const { min, max } = profile.implicitPreferences.priceRange;
  if (listing.askingPrice >= min && listing.askingPrice <= max) {
    score += 25;
  } else {
    const midPrice = (min + max) / 2;
    const deviation = Math.abs(listing.askingPrice - midPrice) / midPrice;
    score += Math.max(0, 25 * (1 - deviation));
  }

  // Body type affinity (15%)
  const bodyTypeScore = profile.implicitPreferences.bodyTypeAffinity[listing.bodyType] || 0;
  score += bodyTypeScore * 15;

  // Location relevance (15%)
  if (profile.governorate && listing.governorate === profile.governorate) {
    score += 15;
  } else if (profile.governorate) {
    // Adjacent governorate bonus
    const adjacentPairs: Record<string, string[]> = {
      'CAIRO': ['GIZA', 'QALYUBIA'],
      'GIZA': ['CAIRO', 'FAYOUM'],
      'ALEXANDRIA': ['BEHEIRA', 'MATROUH'],
    };
    if (adjacentPairs[profile.governorate]?.includes(listing.governorate)) {
      score += 10;
    }
  }

  // Condition preference (10%)
  const conditionScore = profile.implicitPreferences.preferredConditions[listing.condition] || 0.5;
  score += conditionScore * 10;

  // Explicit preferences bonus (5%)
  if (profile.explicitPreferences) {
    if (profile.explicitPreferences.preferredMakes?.includes(listing.make)) {
      score += 3;
    }
    if (profile.explicitPreferences.preferredBodyTypes?.includes(listing.bodyType)) {
      score += 2;
    }
  }

  return Math.min(100, score);
}

/**
 * Calculate collaborative filtering score
 */
function calculateCollaborativeScore(
  userId: string,
  listingId: string,
  similarUsers: Map<string, number>
): number {
  // In a real implementation, this would query a database
  // For now, return a mock score based on listing popularity
  const listing = MOCK_VEHICLE_LISTINGS.find(l => l.id === listingId);
  if (!listing) return 0;

  // Popularity-based score
  const popularityScore = Math.min(100, (listing.views / 100) + (listing.favorites * 2));
  return popularityScore * 0.5; // Scale down
}

/**
 * Calculate trending score
 */
function calculateTrendingScore(listing: VehicleListing): number {
  const now = Date.now();
  const createdAt = new Date(listing.createdAt).getTime();
  const ageHours = (now - createdAt) / (1000 * 60 * 60);

  // Freshness factor (decays over 7 days)
  const freshness = Math.max(0, 1 - (ageHours / (7 * 24)));

  // View velocity (views per hour)
  const viewVelocity = listing.views / Math.max(1, ageHours);

  // Engagement rate
  const engagementRate = (listing.favorites + listing.inquiries) / Math.max(1, listing.views);

  // Combined trending score
  const trendingScore =
    (freshness * 30) +
    (Math.min(viewVelocity * 10, 40)) +
    (engagementRate * 300);

  return Math.min(100, trendingScore);
}

/**
 * Calculate value score (price vs market)
 */
function calculateValueScore(listing: VehicleListing): number {
  if (!listing.marketPrice) return 50;

  const priceDiff = (listing.marketPrice - listing.askingPrice) / listing.marketPrice;

  // Good deal: asking < market
  if (priceDiff > 0.1) return Math.min(100, 70 + (priceDiff * 100));
  if (priceDiff > 0) return 60 + (priceDiff * 100);

  // Overpriced
  return Math.max(0, 50 + (priceDiff * 100));
}

/**
 * Ensure diversity in recommendations
 */
function ensureDiversity(
  recommendations: RecommendationResult[],
  diversityFactor: number = 0.15
): RecommendationResult[] {
  if (recommendations.length <= 5) return recommendations;

  const result: RecommendationResult[] = [];
  const usedMakes = new Set<string>();
  const usedPriceRanges = new Set<string>();

  for (const rec of recommendations) {
    const make = rec.listing.make;
    const priceRange = Math.floor(rec.listing.askingPrice / 500000).toString();

    // Check diversity
    const makeCount = [...usedMakes].filter(m => m === make).length;
    const priceCount = [...usedPriceRanges].filter(p => p === priceRange).length;

    // Allow some duplicates but penalize
    if (makeCount >= 3 || priceCount >= 3) {
      // Apply diversity penalty
      rec.score *= (1 - diversityFactor);
      rec.scoreBreakdown.diversity = -10;
    }

    usedMakes.add(make);
    usedPriceRanges.add(priceRange);
    result.push(rec);
  }

  // Re-sort by score
  return result.sort((a, b) => b.score - a.score);
}

/**
 * Handle cold start for new users
 */
function handleColdStart(governorate?: Governorate): RecommendationResult[] {
  // Return trending + location-based recommendations
  let listings = [...MOCK_VEHICLE_LISTINGS];

  // Filter by governorate if provided
  if (governorate) {
    const localListings = listings.filter(l => l.governorate === governorate);
    if (localListings.length >= 5) {
      listings = localListings;
    }
  }

  // Sort by trending score
  return listings
    .map(listing => ({
      listingId: listing.id,
      listing,
      score: calculateTrendingScore(listing),
      scoreBreakdown: {
        relevance: 0,
        popularity: calculateTrendingScore(listing) * 0.4,
        freshness: calculateTrendingScore(listing) * 0.3,
        value: calculateValueScore(listing) * 0.2,
        diversity: 10,
      },
      reasons: ['Popular in your area', 'Trending listing'],
      reasonsAr: ['شائع في منطقتك', 'إعلان رائج'],
      recommendationType: 'TRENDING' as const,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 20);
}

/**
 * Main recommendation engine
 * محرك التوصيات الرئيسي
 */
export function getPersonalizedRecommendations(
  profile: UserProfile,
  limit: number = 20
): RecommendationsResponse {
  // Check for cold start
  if (profile.viewHistory.length < 5 && profile.favoriteListings.length === 0) {
    const coldStartRecs = handleColdStart(profile.governorate);
    return {
      personalized: [],
      trending: coldStartRecs.slice(0, 10),
      newArrivals: coldStartRecs.slice(10, 20),
      similarToViewed: [],
      similarToFavorites: [],
      coldStartRecommendations: coldStartRecs,
    };
  }

  // Calculate scores for all listings
  const scoredListings: RecommendationResult[] = MOCK_VEHICLE_LISTINGS.map(listing => {
    // Content-based score (40%)
    const contentScore = calculateContentSimilarity(profile, listing);

    // Collaborative score (25%)
    const collaborativeScore = calculateCollaborativeScore(
      profile.userId,
      listing.id,
      new Map()
    );

    // Trending score (20%)
    const trendingScore = calculateTrendingScore(listing);

    // Value score (15%)
    const valueScore = calculateValueScore(listing);

    // Combined score
    const totalScore =
      (contentScore * 0.40) +
      (collaborativeScore * 0.25) +
      (trendingScore * 0.20) +
      (valueScore * 0.15);

    // Generate reasons
    const reasons: string[] = [];
    const reasonsAr: string[] = [];

    if (contentScore > 70) {
      reasons.push('Matches your preferences');
      reasonsAr.push('يطابق تفضيلاتك');
    }

    if (trendingScore > 60) {
      reasons.push('Trending listing');
      reasonsAr.push('إعلان رائج');
    }

    if (valueScore > 70) {
      reasons.push('Great value');
      reasonsAr.push('قيمة ممتازة');
    }

    if (profile.implicitPreferences.makeAffinity[listing.make] > 0.7) {
      reasons.push(`You like ${listing.make}`);
      reasonsAr.push(`أنت تحب ${listing.make}`);
    }

    return {
      listingId: listing.id,
      listing,
      score: Math.round(totalScore),
      scoreBreakdown: {
        relevance: Math.round(contentScore * 0.4),
        popularity: Math.round(collaborativeScore * 0.25),
        freshness: Math.round(trendingScore * 0.2),
        value: Math.round(valueScore * 0.15),
        diversity: 0,
      },
      reasons,
      reasonsAr,
      recommendationType: 'PERSONALIZED' as const,
    };
  });

  // Apply diversity
  const diversifiedListings = ensureDiversity(scoredListings);

  // Split into categories
  const personalized = diversifiedListings.slice(0, 10);

  const trending = [...MOCK_VEHICLE_LISTINGS]
    .map(listing => ({
      listingId: listing.id,
      listing,
      score: calculateTrendingScore(listing),
      scoreBreakdown: {
        relevance: 0,
        popularity: calculateTrendingScore(listing) * 0.4,
        freshness: calculateTrendingScore(listing) * 0.3,
        value: calculateValueScore(listing) * 0.2,
        diversity: 10,
      },
      reasons: ['Trending now'],
      reasonsAr: ['رائج الآن'],
      recommendationType: 'TRENDING' as const,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  const newArrivals = [...MOCK_VEHICLE_LISTINGS]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10)
    .map(listing => ({
      listingId: listing.id,
      listing,
      score: 80 + Math.round(calculateValueScore(listing) * 0.2),
      scoreBreakdown: {
        relevance: 0,
        popularity: 0,
        freshness: 80,
        value: calculateValueScore(listing) * 0.2,
        diversity: 0,
      },
      reasons: ['New arrival'],
      reasonsAr: ['وصل حديثاً'],
      recommendationType: 'NEW_ARRIVAL' as const,
    }));

  // Similar to viewed (based on last 5 viewed)
  const recentViewed = profile.viewHistory.slice(-5);
  const similarToViewed: RecommendationResult[] = [];

  for (const view of recentViewed) {
    const viewedListing = MOCK_VEHICLE_LISTINGS.find(l => l.id === view.listingId);
    if (!viewedListing) continue;

    const similar = MOCK_VEHICLE_LISTINGS
      .filter(l => l.id !== viewedListing.id)
      .filter(l => l.make === viewedListing.make || l.bodyType === viewedListing.bodyType)
      .slice(0, 3)
      .map(listing => ({
        listingId: listing.id,
        listing,
        score: 70,
        scoreBreakdown: {
          relevance: 50,
          popularity: 10,
          freshness: 5,
          value: 5,
          diversity: 0,
        },
        reasons: [`Similar to ${viewedListing.titleAr}`],
        reasonsAr: [`مشابه لـ ${viewedListing.titleAr}`],
        recommendationType: 'SIMILAR' as const,
      }));

    similarToViewed.push(...similar);
  }

  // Similar to favorites
  const similarToFavorites: RecommendationResult[] = [];

  for (const favId of profile.favoriteListings.slice(0, 3)) {
    const favListing = MOCK_VEHICLE_LISTINGS.find(l => l.id === favId);
    if (!favListing) continue;

    const similar = MOCK_VEHICLE_LISTINGS
      .filter(l => l.id !== favListing.id)
      .filter(l => l.make === favListing.make)
      .slice(0, 2)
      .map(listing => ({
        listingId: listing.id,
        listing,
        score: 75,
        scoreBreakdown: {
          relevance: 55,
          popularity: 10,
          freshness: 5,
          value: 5,
          diversity: 0,
        },
        reasons: [`Because you liked ${favListing.titleAr}`],
        reasonsAr: [`لأنك أعجبت بـ ${favListing.titleAr}`],
        recommendationType: 'SIMILAR' as const,
      }));

    similarToFavorites.push(...similar);
  }

  return {
    personalized,
    trending,
    newArrivals,
    similarToViewed: similarToViewed.slice(0, 10),
    similarToFavorites: similarToFavorites.slice(0, 10),
  };
}

// =============================================================================
// EXPORTS
// =============================================================================

export {
  calculateBasePrice,
  calculateMileageAdjustment,
  calculateMarketDemand,
  getSeasonalAdjustment,
  calculateUserCompatibility,
  calculateFairnessScore,
  optimizeCashFlows,
  calculateContentSimilarity,
  calculateTrendingScore,
  calculateValueScore,
  ensureDiversity,
  handleColdStart,
};
