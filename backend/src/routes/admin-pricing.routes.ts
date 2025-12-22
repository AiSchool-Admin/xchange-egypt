import { Router, Request, Response, NextFunction } from 'express';
import { authenticate } from '../middleware/auth';
import {
  pricingSimulator,
  PricingContext,
} from '../lib/pricing/ai-pricing-simulator';
import {
  OFFICIAL_PRICING,
  getAllProviders,
  getAllProducts,
  getProviderPricing,
} from '../lib/pricing/official-pricing-data';

const router = Router();

// ============================================
// Admin check middleware
// ============================================
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const adminEmails = ['admin@xchange.com', 'admin@xchange-egypt.com'];
  if (!req.user || !adminEmails.includes(req.user.email)) {
    return res.status(403).json({
      success: false,
      message: 'Admin access required',
    });
  }
  next();
};

// ============================================
// Pricing Data Management
// ============================================

/**
 * @route   GET /api/v1/admin/pricing/providers
 * @desc    Get all provider pricing configurations
 * @access  Admin
 */
router.get('/providers', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const providers = getAllProviders().map(providerKey => {
      const data = OFFICIAL_PRICING[providerKey];
      return {
        id: providerKey,
        name: data.provider,
        nameAr: data.providerAr,
        lastUpdated: data.lastUpdated,
        source: data.source,
        confidence: data.confidence,
        products: Object.entries(data.products).map(([productKey, product]) => ({
          id: productKey,
          nameAr: product.nameAr,
          formula: product.formula,
          surge: product.surge,
          capacity: product.capacity,
          features: product.features,
        })),
      };
    });

    return res.json({
      success: true,
      data: {
        providers,
        totalProviders: providers.length,
        totalProducts: providers.reduce((sum, p) => sum + p.products.length, 0),
      },
    });
  } catch (error) {
    console.error('Error getting provider pricing:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get provider pricing',
    });
  }
});

/**
 * @route   GET /api/v1/admin/pricing/providers/:providerId
 * @desc    Get specific provider pricing
 * @access  Admin
 */
router.get('/providers/:providerId', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { providerId } = req.params;
    const data = getProviderPricing(providerId.toUpperCase());

    if (!data) {
      return res.status(404).json({
        success: false,
        message: 'Provider not found',
      });
    }

    return res.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error getting provider:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get provider',
    });
  }
});

// ============================================
// AI Model Management
// ============================================

/**
 * @route   GET /api/v1/admin/pricing/model/stats
 * @desc    Get AI model statistics
 * @access  Admin
 */
router.get('/model/stats', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const stats = await pricingSimulator.getModelStats();

    return res.json({
      success: true,
      data: {
        ...stats,
        status: stats.weightsCount > 0 ? 'TRAINED' : 'NOT_TRAINED',
        version: 'AI_SIMULATOR_V1',
        capabilities: [
          'Official pricing formulas',
          'Time-based surge prediction',
          'Weather impact analysis',
          'Holiday & event detection',
          'Traffic condition awareness',
          'Learning from user feedback',
        ],
      },
    });
  } catch (error) {
    console.error('Error getting model stats:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get model stats',
    });
  }
});

/**
 * @route   POST /api/v1/admin/pricing/model/train
 * @desc    Train AI model on collected data
 * @access  Admin
 */
router.post('/model/train', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const result = await pricingSimulator.trainModel();

    return res.json({
      success: true,
      data: {
        ...result,
        message: result.dataPoints > 0
          ? `تم تدريب النموذج على ${result.dataPoints} نقطة بيانات`
          : 'لا توجد بيانات تدريب متاحة',
      },
    });
  } catch (error) {
    console.error('Error training model:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to train model',
    });
  }
});

// ============================================
// Training Data Collection
// ============================================

/**
 * @route   POST /api/v1/admin/pricing/training-data
 * @desc    Record actual ride price for model training
 * @access  Admin (or can be opened for users)
 */
router.post('/training-data', authenticate, async (req: Request, res: Response) => {
  try {
    const {
      provider,
      product,
      pickupLat,
      pickupLng,
      dropoffLat,
      dropoffLng,
      distanceKm,
      durationMin,
      predictedPrice,
      actualPrice,
      actualSurge,
      isRaining,
      hasEvent,
      eventName,
    } = req.body;

    // Validate required fields
    if (!provider || !product || !actualPrice) {
      return res.status(400).json({
        success: false,
        message: 'Provider, product, and actual price are required',
      });
    }

    const context: PricingContext = {
      time: new Date(),
      isHoliday: false,
      isRaining: isRaining || false,
      hasEvent: hasEvent || false,
      eventName: eventName,
    };

    await pricingSimulator.recordTrainingData({
      provider: provider.toUpperCase(),
      product,
      pickup: { lat: pickupLat, lng: pickupLng },
      dropoff: { lat: dropoffLat, lng: dropoffLng },
      distanceKm: distanceKm || 0,
      durationMin: durationMin || 0,
      predictedPrice: predictedPrice || 0,
      actualPrice,
      actualSurge: actualSurge || 1.0,
      context,
    });

    return res.json({
      success: true,
      message: 'تم حفظ بيانات التدريب بنجاح',
      data: {
        provider,
        product,
        actualPrice,
        predictedPrice,
        accuracy: predictedPrice ? Math.round((1 - Math.abs(predictedPrice - actualPrice) / actualPrice) * 100) : null,
      },
    });
  } catch (error) {
    console.error('Error recording training data:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record training data',
    });
  }
});

// ============================================
// Surge Analysis
// ============================================

/**
 * @route   GET /api/v1/admin/pricing/surge/analysis
 * @desc    Get surge pattern analysis
 * @access  Admin
 */
interface HourData {
  hour: number;
  label: string;
  providers: Record<string, { multiplier: number; reason: string }>;
  avgMultiplier?: number;
}

router.get('/surge/analysis', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const now = new Date();
    const analysis: HourData[] = [];

    // Analyze surge for each hour
    for (let hour = 0; hour < 24; hour++) {
      const time = new Date(now);
      time.setHours(hour, 0, 0, 0);

      const context: PricingContext = {
        time,
        isHoliday: false,
        isRaining: false,
        hasEvent: false,
      };

      const hourData: HourData = {
        hour,
        label: getHourLabel(hour),
        providers: {},
      };

      for (const provider of ['UBER', 'CAREEM', 'BOLT', 'DIDI']) {
        const products = getAllProducts(provider);
        const mainProduct = products[0];
        if (mainProduct) {
          const surge = pricingSimulator.predictSurge(
            provider,
            mainProduct,
            context,
            'moderate'
          );
          hourData.providers[provider] = {
            multiplier: surge.multiplier,
            reason: surge.reason,
          };
        }
      }

      // Calculate average
      const values = Object.values(hourData.providers).map(p => p.multiplier);
      hourData.avgMultiplier = values.length > 0
        ? Math.round((values.reduce((a: number, b: number) => a + b, 0) / values.length) * 100) / 100
        : 1.0;

      analysis.push(hourData);
    }

    // Find peak and low hours
    const sortedByMultiplier = [...analysis].sort((a, b) => b.avgMultiplier - a.avgMultiplier);
    const peakHours = sortedByMultiplier.slice(0, 3).map(h => h.hour);
    const lowHours = sortedByMultiplier.slice(-3).map(h => h.hour);

    return res.json({
      success: true,
      data: {
        hourlyAnalysis: analysis,
        summary: {
          peakHours,
          peakHoursLabels: peakHours.map(getHourLabel),
          lowHours,
          lowHoursLabels: lowHours.map(getHourLabel),
          maxSurge: sortedByMultiplier[0]?.avgMultiplier || 1.0,
          minSurge: sortedByMultiplier[sortedByMultiplier.length - 1]?.avgMultiplier || 1.0,
          avgDailySurge: Math.round(
            (analysis.reduce((sum, h) => sum + h.avgMultiplier, 0) / 24) * 100
          ) / 100,
        },
        recommendations: [
          `أفضل وقت للحجز: ${lowHours.map(getHourLabel).join(', ')}`,
          `تجنب الحجز في: ${peakHours.map(getHourLabel).join(', ')}`,
          'استخدم تنبيهات الأسعار للحصول على أفضل سعر',
        ],
      },
    });
  } catch (error) {
    console.error('Error getting surge analysis:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get surge analysis',
    });
  }
});

/**
 * @route   GET /api/v1/admin/pricing/comparison
 * @desc    Get price comparison across all providers for a route
 * @access  Admin
 */
interface ProviderProduct {
  product: string;
  productAr: string;
  price: number;
  priceRange: { min: number; max: number };
  surge: number;
  confidence: number;
}

interface ProviderComparison {
  provider: string;
  providerAr: string;
  products: ProviderProduct[];
  cheapest: number;
  avgPrice: number;
}

router.get('/comparison', authenticate, requireAdmin, async (req: Request, res: Response) => {
  try {
    const { pickupLat, pickupLng, dropoffLat, dropoffLng } = req.query;

    if (!pickupLat || !pickupLng || !dropoffLat || !dropoffLng) {
      return res.status(400).json({
        success: false,
        message: 'Pickup and dropoff coordinates are required',
      });
    }

    const estimates = await pricingSimulator.getAccuratePriceEstimates(
      { lat: parseFloat(pickupLat as string), lng: parseFloat(pickupLng as string) },
      { lat: parseFloat(dropoffLat as string), lng: parseFloat(dropoffLng as string) }
    );

    // Group by provider
    const byProvider: Record<string, ProviderComparison> = {};
    for (const estimate of estimates) {
      if (!byProvider[estimate.provider]) {
        byProvider[estimate.provider] = {
          provider: estimate.provider,
          providerAr: estimate.providerAr,
          products: [],
          cheapest: 0,
          avgPrice: 0,
        };
      }
      byProvider[estimate.provider].products.push({
        product: estimate.product,
        productAr: estimate.productAr,
        price: estimate.price,
        priceRange: estimate.priceRange,
        surge: estimate.surgeMultiplier,
        confidence: estimate.confidence,
      });
    }

    // Calculate stats for each provider
    for (const key of Object.keys(byProvider)) {
      const provider = byProvider[key];
      const prices = provider.products.map(p => p.price);
      provider.cheapest = Math.min(...prices);
      provider.avgPrice = Math.round(prices.reduce((a: number, b: number) => a + b, 0) / prices.length);
    }

    // Sort providers by cheapest price
    const sorted = Object.values(byProvider).sort((a, b) => a.cheapest - b.cheapest);

    return res.json({
      success: true,
      data: {
        comparison: sorted,
        cheapestProvider: sorted[0]?.provider,
        cheapestPrice: sorted[0]?.cheapest,
        mostExpensiveProvider: sorted[sorted.length - 1]?.provider,
        mostExpensivePrice: sorted[sorted.length - 1]?.cheapest,
        potentialSavings: (sorted[sorted.length - 1]?.cheapest || 0) - (sorted[0]?.cheapest || 0),
      },
    });
  } catch (error) {
    console.error('Error getting price comparison:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get price comparison',
    });
  }
});

// ============================================
// Helper Functions
// ============================================

function getHourLabel(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour < 12) return `${hour} AM`;
  if (hour === 12) return '12 PM';
  return `${hour - 12} PM`;
}

export default router;
