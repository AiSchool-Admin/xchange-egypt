/**
 * Xchange Transport - AI Pricing Simulator
 * =========================================
 *
 * نظام الذكاء الاصطناعي للتسعير الدقيق 100%
 *
 * المكونات:
 * 1. جمع البيانات التدريبية من الرحلات الفعلية
 * 2. تدريب النموذج لتحسين التنبؤات
 * 3. التنبؤ بالسعر الدقيق
 *
 * الهدف: تحقيق دقة 100% في التسعير
 */

import {
  OFFICIAL_PRICING,
  PricingFormula,
  SurgeFormula,
  getProductFormula,
  getSurgeFormula,
  getAllProviders,
  getAllProducts,
} from './official-pricing-data';
import {
  getRouteInfo,
  calculateApproximateRoute,
  Location,
  RouteInfo,
} from '../maps/google-maps';
import { redis } from '../../config/redis';

// ============================================
// Interfaces
// ============================================

export interface PriceEstimate {
  provider: string;
  providerAr: string;
  product: string;
  productAr: string;
  price: number;
  priceRange: {
    min: number;
    max: number;
  };
  currency: string;
  breakdown: {
    baseFare: number;
    distanceCost: number;
    timeCost: number;
    bookingFee: number;
    surgeMultiplier: number;
    surgeCost: number;
    totalBeforeSurge: number;
  };
  eta: number;
  distance: number;
  duration: number;
  surgeMultiplier: number;
  surgeReason?: string;
  confidence: number;
  features: string[];
  capacity: number;
  deepLink: string;
}

export interface TrainingDataPoint {
  id: string;
  timestamp: Date;
  provider: string;
  product: string;
  pickup: Location;
  dropoff: Location;
  distanceKm: number;
  durationMin: number;
  hour: number;
  dayOfWeek: number;
  isHoliday: boolean;
  isRaining: boolean;
  hasEvent: boolean;
  trafficCondition: 'light' | 'moderate' | 'heavy';
  predictedPrice: number;
  actualPrice: number;
  actualSurge: number;
  errorPercentage: number;
}

export interface SurgePrediction {
  multiplier: number;
  reason: string;
  confidence: number;
  factors: {
    timeBased: number;
    weather: number;
    holiday: number;
    event: number;
    demand: number;
  };
}

export interface PricingContext {
  time: Date;
  isHoliday: boolean;
  isRaining: boolean;
  hasEvent: boolean;
  eventName?: string;
  demandLevel?: 'low' | 'normal' | 'high' | 'extreme';
}

// ============================================
// Constants
// ============================================

const TRAINING_DATA_KEY = 'pricing:training_data';
const MODEL_WEIGHTS_KEY = 'pricing:model_weights';
const SURGE_HISTORY_KEY = 'pricing:surge_history';
const CACHE_TTL = 60; // 1 minute for price estimates

// Egyptian holidays (approximate dates)
const EGYPTIAN_HOLIDAYS = [
  { month: 1, day: 7, name: 'عيد الميلاد القبطي' },
  { month: 1, day: 25, name: 'عيد الثورة' },
  { month: 4, day: 25, name: 'عيد سيناء' },
  { month: 5, day: 1, name: 'عيد العمال' },
  { month: 7, day: 23, name: 'عيد الثورة' },
  { month: 10, day: 6, name: 'عيد القوات المسلحة' },
  // Eid dates vary - checked dynamically
];

// Deep links for providers - with correct URL schemes and web fallbacks
const DEEP_LINKS: Record<string, (pickup: Location, dropoff: Location, product: string) => string> = {
  UBER: (pickup, dropoff, product) => {
    // Uber universal link that works on both mobile and web
    const pickupLat = pickup.lat.toFixed(6);
    const pickupLng = pickup.lng.toFixed(6);
    const dropoffLat = dropoff.lat.toFixed(6);
    const dropoffLng = dropoff.lng.toFixed(6);
    return `https://m.uber.com/ul/?action=setPickup&pickup[latitude]=${pickupLat}&pickup[longitude]=${pickupLng}&dropoff[latitude]=${dropoffLat}&dropoff[longitude]=${dropoffLng}`;
  },
  CAREEM: (pickup, dropoff, product) => {
    // Careem web booking link
    return `https://app.careem.com/rides?pickup_latitude=${pickup.lat}&pickup_longitude=${pickup.lng}&dropoff_latitude=${dropoff.lat}&dropoff_longitude=${dropoff.lng}`;
  },
  BOLT: (pickup, dropoff, product) => {
    // Bolt web link
    return `https://bolt.eu/ride/?pickup_lat=${pickup.lat}&pickup_lng=${pickup.lng}&dest_lat=${dropoff.lat}&dest_lng=${dropoff.lng}`;
  },
  INDRIVE: (pickup, dropoff) => {
    // inDrive web link - note: inDrive doesn't have a direct booking deep link
    // Users need to open the app and enter addresses manually
    return `https://indrive.com/en/home/`;
  },
  DIDI: (pickup, dropoff) => {
    // DiDi web link
    return `https://web.didiglobal.com/`;
  },
  SWVL: () => {
    // Swvl web app
    return 'https://swvl.com/';
  },
  HALAN: (pickup, dropoff) => {
    // Halan web link
    return 'https://www.hfrweb.com/';
  },
};

// ============================================
// AI Pricing Simulator Class
// ============================================

export class AIPricingSimulator {
  private modelWeights: Map<string, number> = new Map();
  private surgeHistory: Map<string, number[]> = new Map();

  constructor() {
    this.loadModelWeights();
  }

  /**
   * Get accurate price estimates for all providers
   */
  async getAccuratePriceEstimates(
    pickup: Location,
    dropoff: Location,
    context?: Partial<PricingContext>
  ): Promise<PriceEstimate[]> {
    const estimates: PriceEstimate[] = [];
    const pricingContext = this.buildContext(context);

    // Get route info from Google Maps
    const routeInfo = await getRouteInfo(pickup, dropoff, pricingContext.time);

    // Calculate estimates for all providers and products
    for (const providerKey of getAllProviders()) {
      const providerData = OFFICIAL_PRICING[providerKey];

      for (const productKey of getAllProducts(providerKey)) {
        const productData = providerData.products[productKey];
        const formula = productData.formula;
        const surgeFormula = productData.surge;

        // Calculate surge multiplier
        const surgePrediction = this.predictSurge(
          providerKey,
          productKey,
          pricingContext,
          routeInfo.trafficCondition
        );

        // Calculate price using official formula
        const priceBreakdown = this.calculatePrice(
          formula,
          routeInfo,
          surgePrediction.multiplier
        );

        // Calculate ETA (based on driver availability simulation)
        const eta = this.simulateETA(providerKey, productKey, pricingContext);

        // Generate deep link
        const deepLink = DEEP_LINKS[providerKey]
          ? DEEP_LINKS[providerKey](pickup, dropoff, productKey)
          : '';

        // Calculate confidence based on provider data confidence and our model
        const confidence = this.calculateConfidence(
          providerData.confidence,
          surgePrediction.confidence
        );

        // Calculate price range (±5% for high confidence, ±15% for lower)
        const rangePercentage = confidence >= 0.9 ? 0.05 : confidence >= 0.8 ? 0.10 : 0.15;
        const priceRange = {
          min: Math.round(priceBreakdown.finalPrice * (1 - rangePercentage)),
          max: Math.round(priceBreakdown.finalPrice * (1 + rangePercentage)),
        };

        estimates.push({
          provider: providerData.provider,
          providerAr: providerData.providerAr,
          product: productKey,
          productAr: productData.nameAr,
          price: priceBreakdown.finalPrice,
          priceRange,
          currency: 'EGP',
          breakdown: priceBreakdown,
          eta,
          distance: routeInfo.distanceKm,
          duration: routeInfo.durationInTrafficMin,
          surgeMultiplier: surgePrediction.multiplier,
          surgeReason: surgePrediction.reason,
          confidence,
          features: productData.features,
          capacity: productData.capacity,
          deepLink,
        });
      }
    }

    // Sort by price
    estimates.sort((a, b) => a.price - b.price);

    return estimates;
  }

  /**
   * Calculate price using official formula
   */
  private calculatePrice(
    formula: PricingFormula,
    route: RouteInfo,
    surgeMultiplier: number
  ): {
    baseFare: number;
    distanceCost: number;
    timeCost: number;
    bookingFee: number;
    surgeMultiplier: number;
    surgeCost: number;
    totalBeforeSurge: number;
    finalPrice: number;
  } {
    const baseFare = formula.baseFare;
    const distanceCost = route.distanceKm * formula.perKm;
    const timeCost = route.durationInTrafficMin * formula.perMin;
    const bookingFee = formula.bookingFee;

    const totalBeforeSurge = baseFare + distanceCost + timeCost + bookingFee;
    const surgeCost = totalBeforeSurge * (surgeMultiplier - 1);
    const finalPrice = Math.max(
      formula.minFare,
      Math.round(totalBeforeSurge * surgeMultiplier)
    );

    return {
      baseFare,
      distanceCost: Math.round(distanceCost * 10) / 10,
      timeCost: Math.round(timeCost * 10) / 10,
      bookingFee,
      surgeMultiplier,
      surgeCost: Math.round(surgeCost),
      totalBeforeSurge: Math.round(totalBeforeSurge),
      finalPrice,
    };
  }

  /**
   * Predict surge multiplier using AI model
   */
  predictSurge(
    provider: string,
    product: string,
    context: PricingContext,
    trafficCondition: 'light' | 'moderate' | 'heavy'
  ): SurgePrediction {
    const surgeFormula = getSurgeFormula(provider, product);
    if (!surgeFormula) {
      return {
        multiplier: 1.0,
        reason: 'لا توجد بيانات',
        confidence: 0.5,
        factors: { timeBased: 1, weather: 1, holiday: 1, event: 1, demand: 1 },
      };
    }

    const hour = context.time.getHours();
    const factors = {
      timeBased: 1.0,
      weather: 1.0,
      holiday: 1.0,
      event: 1.0,
      demand: 1.0,
    };
    const reasons: string[] = [];

    // Time-based surge
    for (const [range, multiplier] of Object.entries(surgeFormula.timeBasedMultipliers)) {
      const [start, end] = range.split('-').map(Number);
      if (hour >= start && hour < end) {
        factors.timeBased = multiplier;
        if (multiplier > 1.2) {
          reasons.push(`ساعة الذروة (${start}:00 - ${end}:00)`);
        }
        break;
      }
    }

    // Weather surge
    if (context.isRaining) {
      factors.weather = surgeFormula.rainMultiplier;
      reasons.push('أمطار');
    }

    // Holiday surge
    if (context.isHoliday) {
      factors.holiday = surgeFormula.holidayMultiplier;
      reasons.push('عطلة رسمية');
    }

    // Event surge
    if (context.hasEvent) {
      factors.event = surgeFormula.eventMultiplier;
      reasons.push(context.eventName || 'حدث كبير');
    }

    // Demand-based surge (from traffic condition)
    if (trafficCondition === 'heavy') {
      factors.demand = 1.2;
      reasons.push('زحام شديد');
    } else if (trafficCondition === 'moderate') {
      factors.demand = 1.1;
    }

    // AI adjustment from learned patterns
    const aiAdjustment = this.getAIAdjustment(provider, product, hour, context);

    // Calculate final multiplier
    let multiplier =
      factors.timeBased *
      factors.weather *
      factors.holiday *
      factors.event *
      factors.demand *
      aiAdjustment;

    // Apply max surge cap
    multiplier = Math.min(multiplier, surgeFormula.maxSurge);
    multiplier = Math.round(multiplier * 100) / 100;

    // Confidence based on how many factors are at play
    const activeFactors = Object.values(factors).filter(f => f > 1).length;
    const confidence = activeFactors === 0 ? 0.95 : 0.95 - activeFactors * 0.05;

    return {
      multiplier,
      reason: reasons.length > 0 ? reasons.join(' + ') : 'طلب عادي',
      confidence: Math.max(0.7, confidence),
      factors,
    };
  }

  /**
   * Get AI adjustment from learned patterns
   */
  private getAIAdjustment(
    provider: string,
    product: string,
    hour: number,
    context: PricingContext
  ): number {
    const key = `${provider}:${product}:${hour}:${context.time.getDay()}`;
    const weight = this.modelWeights.get(key);

    // If we have learned adjustment, use it; otherwise return 1.0 (no adjustment)
    return weight !== undefined ? weight : 1.0;
  }

  /**
   * Simulate ETA based on provider patterns
   */
  private simulateETA(
    provider: string,
    product: string,
    context: PricingContext
  ): number {
    const hour = context.time.getHours();
    const baseEta = {
      UBER: 4,
      CAREEM: 5,
      BOLT: 5,
      INDRIVE: 7,
      DIDI: 6,
      SWVL: 10,
      HALAN: 3,
    }[provider] || 5;

    // Adjust for peak hours
    let multiplier = 1.0;
    if ((hour >= 8 && hour <= 10) || (hour >= 17 && hour <= 20)) {
      multiplier = 1.5;
    } else if ((hour >= 6 && hour <= 8) || (hour >= 20 && hour <= 22)) {
      multiplier = 1.3;
    }

    // Adjust for weather
    if (context.isRaining) {
      multiplier *= 1.4;
    }

    // Add some randomness (±2 minutes)
    const randomness = Math.random() * 4 - 2;

    return Math.max(1, Math.round(baseEta * multiplier + randomness));
  }

  /**
   * Build pricing context
   */
  private buildContext(context?: Partial<PricingContext>): PricingContext {
    const time = context?.time || new Date();

    return {
      time,
      isHoliday: context?.isHoliday ?? this.isHoliday(time),
      isRaining: context?.isRaining ?? false,
      hasEvent: context?.hasEvent ?? false,
      eventName: context?.eventName,
      demandLevel: context?.demandLevel ?? 'normal',
    };
  }

  /**
   * Check if date is an Egyptian holiday
   */
  private isHoliday(date: Date): boolean {
    const month = date.getMonth() + 1;
    const day = date.getDate();

    return EGYPTIAN_HOLIDAYS.some(h => h.month === month && h.day === day);
  }

  /**
   * Calculate overall confidence
   */
  private calculateConfidence(providerConfidence: number, surgeConfidence: number): number {
    return Math.round(((providerConfidence + surgeConfidence) / 2) * 100) / 100;
  }

  /**
   * Load model weights from Redis
   */
  private async loadModelWeights(): Promise<void> {
    try {
      const data = await redis?.get(MODEL_WEIGHTS_KEY);
      if (data) {
        const weights = JSON.parse(data);
        this.modelWeights = new Map(Object.entries(weights));
      }
    } catch (e) {
      // Redis not available, use default weights
    }
  }

  /**
   * Save model weights to Redis
   */
  private async saveModelWeights(): Promise<void> {
    try {
      const weights = Object.fromEntries(this.modelWeights);
      await redis?.set(MODEL_WEIGHTS_KEY, JSON.stringify(weights));
    } catch (e) {
      // Redis not available
    }
  }

  // ============================================
  // Training System
  // ============================================

  /**
   * Record actual ride data for training
   */
  async recordTrainingData(data: {
    provider: string;
    product: string;
    pickup: Location;
    dropoff: Location;
    distanceKm: number;
    durationMin: number;
    predictedPrice: number;
    actualPrice: number;
    actualSurge: number;
    context: PricingContext;
  }): Promise<void> {
    const dataPoint: TrainingDataPoint = {
      id: `train_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      provider: data.provider,
      product: data.product,
      pickup: data.pickup,
      dropoff: data.dropoff,
      distanceKm: data.distanceKm,
      durationMin: data.durationMin,
      hour: data.context.time.getHours(),
      dayOfWeek: data.context.time.getDay(),
      isHoliday: data.context.isHoliday,
      isRaining: data.context.isRaining,
      hasEvent: data.context.hasEvent,
      trafficCondition: 'moderate', // Would come from actual data
      predictedPrice: data.predictedPrice,
      actualPrice: data.actualPrice,
      actualSurge: data.actualSurge,
      errorPercentage: Math.abs(
        ((data.predictedPrice - data.actualPrice) / data.actualPrice) * 100
      ),
    };

    try {
      // Store training data point
      await redis?.lPush(TRAINING_DATA_KEY, JSON.stringify(dataPoint));

      // Keep only last 10000 data points
      await redis?.lTrim(TRAINING_DATA_KEY, 0, 9999);

      // Update surge history
      const surgeKey = `${data.provider}:${data.product}:${dataPoint.hour}`;
      const existingHistory = this.surgeHistory.get(surgeKey) || [];
      existingHistory.push(data.actualSurge);
      if (existingHistory.length > 100) {
        existingHistory.shift();
      }
      this.surgeHistory.set(surgeKey, existingHistory);

      // If error is significant, trigger model update
      if (dataPoint.errorPercentage > 10) {
        await this.updateModel(dataPoint);
      }
    } catch (e) {
      console.error('Error recording training data:', e);
    }
  }

  /**
   * Update model weights based on new data
   */
  private async updateModel(dataPoint: TrainingDataPoint): Promise<void> {
    const key = `${dataPoint.provider}:${dataPoint.product}:${dataPoint.hour}:${dataPoint.dayOfWeek}`;

    // Simple exponential moving average update
    const currentWeight = this.modelWeights.get(key) || 1.0;
    const actualAdjustment = dataPoint.actualPrice / dataPoint.predictedPrice;
    const learningRate = 0.1;

    const newWeight = currentWeight + learningRate * (actualAdjustment - currentWeight);
    this.modelWeights.set(key, newWeight);

    await this.saveModelWeights();
  }

  /**
   * Train model on historical data
   */
  async trainModel(): Promise<{
    dataPoints: number;
    averageError: number;
    improvementPotential: number;
  }> {
    try {
      const data = await redis?.lRange(TRAINING_DATA_KEY, 0, -1);
      if (!data || data.length === 0) {
        return { dataPoints: 0, averageError: 0, improvementPotential: 0 };
      }

      const dataPoints: TrainingDataPoint[] = data.map(d => JSON.parse(d));

      // Calculate statistics
      const totalError = dataPoints.reduce((sum, dp) => sum + dp.errorPercentage, 0);
      const averageError = totalError / dataPoints.length;

      // Group by key and calculate adjustments
      const keyGroups = new Map<string, TrainingDataPoint[]>();
      for (const dp of dataPoints) {
        const key = `${dp.provider}:${dp.product}:${dp.hour}:${dp.dayOfWeek}`;
        if (!keyGroups.has(key)) {
          keyGroups.set(key, []);
        }
        keyGroups.get(key)!.push(dp);
      }

      // Update weights for each group
      for (const [key, points] of keyGroups) {
        if (points.length >= 3) { // Minimum data points for reliable adjustment
          const avgAdjustment =
            points.reduce((sum, p) => sum + p.actualPrice / p.predictedPrice, 0) /
            points.length;
          this.modelWeights.set(key, avgAdjustment);
        }
      }

      await this.saveModelWeights();

      // Estimate improvement potential
      const improvementPotential = Math.min(averageError * 0.7, 15); // Max 15% improvement

      return {
        dataPoints: dataPoints.length,
        averageError: Math.round(averageError * 100) / 100,
        improvementPotential: Math.round(improvementPotential * 100) / 100,
      };
    } catch (e) {
      console.error('Error training model:', e);
      return { dataPoints: 0, averageError: 0, improvementPotential: 0 };
    }
  }

  /**
   * Get model statistics
   */
  async getModelStats(): Promise<{
    weightsCount: number;
    surgeHistoryEntries: number;
    trainingDataPoints: number;
    lastTrainedAt?: string;
  }> {
    let trainingDataPoints = 0;
    try {
      trainingDataPoints = await redis?.lLen(TRAINING_DATA_KEY) || 0;
    } catch (e) {
      // Redis not available
    }

    return {
      weightsCount: this.modelWeights.size,
      surgeHistoryEntries: this.surgeHistory.size,
      trainingDataPoints,
    };
  }

  // ============================================
  // Comparison and Recommendation
  // ============================================

  /**
   * Get best recommendation with AI scoring
   */
  getBestRecommendation(
    estimates: PriceEstimate[],
    preferences?: {
      prioritizePrice?: boolean;
      prioritizeTime?: boolean;
      prioritizeComfort?: boolean;
      maxPrice?: number;
      maxEta?: number;
    }
  ): PriceEstimate | null {
    if (estimates.length === 0) return null;

    const prefs = {
      prioritizePrice: preferences?.prioritizePrice ?? true,
      prioritizeTime: preferences?.prioritizeTime ?? false,
      prioritizeComfort: preferences?.prioritizeComfort ?? false,
      maxPrice: preferences?.maxPrice ?? Infinity,
      maxEta: preferences?.maxEta ?? Infinity,
    };

    // Filter by constraints
    let filtered = estimates.filter(
      e => e.price <= prefs.maxPrice && e.eta <= prefs.maxEta
    );

    if (filtered.length === 0) {
      filtered = estimates; // Fall back to all if no matches
    }

    // Score each option
    const minPrice = Math.min(...filtered.map(e => e.price));
    const maxPrice = Math.max(...filtered.map(e => e.price));
    const minEta = Math.min(...filtered.map(e => e.eta));
    const maxEta = Math.max(...filtered.map(e => e.eta));

    const scored = filtered.map(estimate => {
      // Price score (0-100, lower is better)
      const priceScore =
        maxPrice === minPrice
          ? 100
          : 100 - ((estimate.price - minPrice) / (maxPrice - minPrice)) * 100;

      // ETA score (0-100, lower is better)
      const etaScore =
        maxEta === minEta
          ? 100
          : 100 - ((estimate.eta - minEta) / (maxEta - minEta)) * 100;

      // Surge score (0-100, lower surge is better)
      const surgeScore = 100 - (estimate.surgeMultiplier - 1) * 50;

      // Comfort score (based on product type and features)
      const comfortScore = this.calculateComfortScore(estimate);

      // Reliability score (based on confidence)
      const reliabilityScore = estimate.confidence * 100;

      // Calculate weighted score
      let weights = { price: 0.4, eta: 0.25, surge: 0.15, comfort: 0.1, reliability: 0.1 };

      if (prefs.prioritizePrice) {
        weights = { price: 0.6, eta: 0.15, surge: 0.1, comfort: 0.05, reliability: 0.1 };
      } else if (prefs.prioritizeTime) {
        weights = { price: 0.2, eta: 0.5, surge: 0.1, comfort: 0.1, reliability: 0.1 };
      } else if (prefs.prioritizeComfort) {
        weights = { price: 0.2, eta: 0.15, surge: 0.1, comfort: 0.45, reliability: 0.1 };
      }

      const totalScore =
        priceScore * weights.price +
        etaScore * weights.eta +
        surgeScore * weights.surge +
        comfortScore * weights.comfort +
        reliabilityScore * weights.reliability;

      return { estimate, score: totalScore };
    });

    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);

    return scored[0]?.estimate || null;
  }

  /**
   * Calculate comfort score for an estimate
   */
  private calculateComfortScore(estimate: PriceEstimate): number {
    let score = 50; // Base score

    // Premium products get higher scores
    if (
      estimate.product.toLowerCase().includes('black') ||
      estimate.product.toLowerCase().includes('business')
    ) {
      score += 40;
    } else if (
      estimate.product.toLowerCase().includes('comfort') ||
      estimate.product.toLowerCase().includes('plus')
    ) {
      score += 25;
    } else if (estimate.product.toLowerCase().includes('xl')) {
      score += 15;
    }

    // Features add to score
    score += estimate.features.length * 5;

    // Capacity adds slightly
    if (estimate.capacity > 4) {
      score += 10;
    }

    return Math.min(100, score);
  }

  /**
   * Compare two estimates
   */
  compareEstimates(
    a: PriceEstimate,
    b: PriceEstimate
  ): {
    priceDiff: number;
    priceDiffPercent: number;
    etaDiff: number;
    surgeDiff: number;
    winner: 'A' | 'B' | 'TIE';
    reason: string;
  } {
    const priceDiff = a.price - b.price;
    const priceDiffPercent = ((a.price - b.price) / b.price) * 100;
    const etaDiff = a.eta - b.eta;
    const surgeDiff = a.surgeMultiplier - b.surgeMultiplier;

    let winner: 'A' | 'B' | 'TIE' = 'TIE';
    let reason = 'متساويان تقريباً';

    const aScore = 100 - (a.price / 10) - (a.eta * 2) - (a.surgeMultiplier * 10);
    const bScore = 100 - (b.price / 10) - (b.eta * 2) - (b.surgeMultiplier * 10);

    if (aScore > bScore + 5) {
      winner = 'A';
      reason = `${a.providerAr} ${a.productAr} أفضل`;
    } else if (bScore > aScore + 5) {
      winner = 'B';
      reason = `${b.providerAr} ${b.productAr} أفضل`;
    }

    return {
      priceDiff,
      priceDiffPercent: Math.round(priceDiffPercent * 10) / 10,
      etaDiff,
      surgeDiff: Math.round(surgeDiff * 100) / 100,
      winner,
      reason,
    };
  }
}

// ============================================
// Export Singleton Instance
// ============================================

export const pricingSimulator = new AIPricingSimulator();

// ============================================
// Convenience Functions
// ============================================

export async function getQuickEstimates(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number
): Promise<PriceEstimate[]> {
  return pricingSimulator.getAccuratePriceEstimates(
    { lat: pickupLat, lng: pickupLng },
    { lat: dropoffLat, lng: dropoffLng }
  );
}

export async function getBestRide(
  pickupLat: number,
  pickupLng: number,
  dropoffLat: number,
  dropoffLng: number
): Promise<PriceEstimate | null> {
  const estimates = await getQuickEstimates(
    pickupLat,
    pickupLng,
    dropoffLat,
    dropoffLng
  );
  return pricingSimulator.getBestRecommendation(estimates);
}
