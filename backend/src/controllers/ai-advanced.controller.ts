/**
 * Advanced AI Features Controller
 * متحكم خدمات الذكاء الاصطناعي المتقدمة
 */

import { Request, Response } from 'express';
import * as psychologicalPricing from '../services/psychological-pricing.service';
import * as sellerIntelligence from '../services/seller-intelligence.service';
import * as visualAuthenticity from '../services/visual-authenticity.service';

// ============================================
// PSYCHOLOGICAL PRICING AI
// ============================================

/**
 * Generate psychologically optimized prices
 */
export async function generatePsychologicalPrices(req: Request, res: Response) {
  try {
    const { categoryId, condition, basePrice } = req.body;
    const userId = (req as any).user?.id;

    if (!categoryId || !condition || !basePrice) {
      return res.status(400).json({
        success: false,
        message: 'categoryId, condition, and basePrice are required',
        messageAr: 'مطلوب: معرف الفئة، الحالة، والسعر الأساسي',
      });
    }

    const analysis = await psychologicalPricing.generatePsychologicalPrices(
      categoryId,
      condition,
      basePrice,
      userId
    );

    return res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    console.error('Psychological pricing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to generate psychological prices',
      messageAr: 'فشل في توليد الأسعار النفسية',
    });
  }
}

/**
 * Get quick psychological price suggestion
 */
export async function getQuickPsychologicalPrice(req: Request, res: Response) {
  try {
    const { basePrice, categoryType } = req.body;

    if (!basePrice) {
      return res.status(400).json({
        success: false,
        message: 'basePrice is required',
        messageAr: 'السعر الأساسي مطلوب',
      });
    }

    const result = await psychologicalPricing.getQuickPsychologicalPrice(
      basePrice,
      categoryType
    );

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Quick pricing error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get quick price',
      messageAr: 'فشل في الحصول على السعر السريع',
    });
  }
}

/**
 * Get pricing psychology analysis for a category
 */
export async function getPricingAnalysis(req: Request, res: Response) {
  try {
    const { categoryId } = req.params;

    // Get sample prices and generate analysis
    const analysis = await psychologicalPricing.generatePsychologicalPrices(
      categoryId,
      'GOOD',
      10000 // Sample price
    );

    return res.json({
      success: true,
      data: {
        categoryId,
        buyerPersona: analysis.buyerPersona,
        priceElasticity: analysis.priceElasticity,
        competitorPrices: analysis.competitorPrices,
      },
    });
  } catch (error) {
    console.error('Pricing analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get pricing analysis',
      messageAr: 'فشل في الحصول على تحليل التسعير',
    });
  }
}

// ============================================
// SELLER INTELLIGENCE DASHBOARD
// ============================================

/**
 * Get comprehensive seller dashboard
 */
export async function getSellerDashboard(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const period = (req.query.period as 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR') || 'MONTH';

    const dashboard = await sellerIntelligence.getSellerDashboard(userId, period);

    return res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    console.error('Seller dashboard error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get seller dashboard',
      messageAr: 'فشل في الحصول على لوحة تحكم البائع',
    });
  }
}

/**
 * Get quick seller statistics
 */
export async function getQuickSellerStats(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const stats = await sellerIntelligence.getQuickSellerStats(userId);

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Quick stats error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get quick stats',
      messageAr: 'فشل في الحصول على الإحصائيات السريعة',
    });
  }
}

/**
 * Get sales performance data
 */
export async function getSalesPerformance(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;
    const period = (req.query.period as 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR') || 'MONTH';

    const dashboard = await sellerIntelligence.getSellerDashboard(userId, period);

    return res.json({
      success: true,
      data: dashboard.salesPerformance,
    });
  } catch (error) {
    console.error('Sales performance error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get sales performance',
      messageAr: 'فشل في الحصول على أداء المبيعات',
    });
  }
}

/**
 * Get inventory health metrics
 */
export async function getInventoryHealth(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const dashboard = await sellerIntelligence.getSellerDashboard(userId, 'MONTH');

    return res.json({
      success: true,
      data: dashboard.inventoryHealth,
    });
  } catch (error) {
    console.error('Inventory health error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get inventory health',
      messageAr: 'فشل في الحصول على صحة المخزون',
    });
  }
}

/**
 * Get buyer behavior insights
 */
export async function getBuyerInsights(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const dashboard = await sellerIntelligence.getSellerDashboard(userId, 'MONTH');

    return res.json({
      success: true,
      data: dashboard.buyerInsights,
    });
  } catch (error) {
    console.error('Buyer insights error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get buyer insights',
      messageAr: 'فشل في الحصول على رؤى المشترين',
    });
  }
}

/**
 * Get competition analysis
 */
export async function getCompetitionAnalysis(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const dashboard = await sellerIntelligence.getSellerDashboard(userId, 'MONTH');

    return res.json({
      success: true,
      data: dashboard.competitionAnalysis,
    });
  } catch (error) {
    console.error('Competition analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get competition analysis',
      messageAr: 'فشل في الحصول على تحليل المنافسة',
    });
  }
}

/**
 * Get personalized seller recommendations
 */
export async function getSellerRecommendations(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const dashboard = await sellerIntelligence.getSellerDashboard(userId, 'MONTH');

    return res.json({
      success: true,
      data: dashboard.recommendations,
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get recommendations',
      messageAr: 'فشل في الحصول على التوصيات',
    });
  }
}

/**
 * Get revenue forecast
 */
export async function getRevenueForecast(req: Request, res: Response) {
  try {
    const userId = (req as any).user.id;

    const dashboard = await sellerIntelligence.getSellerDashboard(userId, 'MONTH');

    return res.json({
      success: true,
      data: dashboard.forecast,
    });
  } catch (error) {
    console.error('Forecast error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get forecast',
      messageAr: 'فشل في الحصول على التوقعات',
    });
  }
}

// ============================================
// VISUAL AUTHENTICITY AI
// ============================================

/**
 * Perform comprehensive authenticity analysis
 */
export async function analyzeAuthenticity(req: Request, res: Response) {
  try {
    const { itemId, imageUrls, categoryType } = req.body;

    if (!itemId) {
      return res.status(400).json({
        success: false,
        message: 'itemId is required',
        messageAr: 'معرف المنتج مطلوب',
      });
    }

    const report = await visualAuthenticity.analyzeAuthenticity(
      itemId,
      imageUrls || [],
      categoryType
    );

    return res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Authenticity analysis error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to analyze authenticity',
      messageAr: 'فشل في تحليل الأصالة',
    });
  }
}

/**
 * Perform quick authenticity check
 */
export async function quickAuthenticityCheck(req: Request, res: Response) {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        message: 'imageUrl is required',
        messageAr: 'رابط الصورة مطلوب',
      });
    }

    const result = await visualAuthenticity.quickAuthenticityCheck(imageUrl);

    return res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('Quick check error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to perform quick check',
      messageAr: 'فشل في إجراء الفحص السريع',
    });
  }
}

/**
 * Get authenticity report for an item
 */
export async function getAuthenticityReport(req: Request, res: Response) {
  try {
    const { itemId } = req.params;

    const report = await visualAuthenticity.analyzeAuthenticity(itemId, []);

    return res.json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error('Get report error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get authenticity report',
      messageAr: 'فشل في الحصول على تقرير الأصالة',
    });
  }
}

/**
 * Verify brand authenticity
 */
export async function verifyBrand(req: Request, res: Response) {
  try {
    const { itemId, imageUrls, brandName } = req.body;

    if (!itemId && !imageUrls?.length) {
      return res.status(400).json({
        success: false,
        message: 'itemId or imageUrls required',
        messageAr: 'مطلوب معرف المنتج أو روابط الصور',
      });
    }

    const report = await visualAuthenticity.analyzeAuthenticity(
      itemId || 'temp-id',
      imageUrls || []
    );

    return res.json({
      success: true,
      data: {
        brandAnalysis: report.brandAnalysis,
        verdict: report.verdict,
        confidence: report.confidence,
      },
    });
  } catch (error) {
    console.error('Brand verify error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to verify brand',
      messageAr: 'فشل في التحقق من العلامة التجارية',
    });
  }
}

// ============================================
// COMBINED AI INSIGHTS
// ============================================

/**
 * Get all AI insights for an item
 */
export async function getItemInsights(req: Request, res: Response) {
  try {
    const { itemId } = req.params;
    const userId = (req as any).user.id;

    // Get authenticity report
    const authenticity = await visualAuthenticity.analyzeAuthenticity(itemId, []);

    // Get pricing insights (would need item details in production)
    const pricingTip = await psychologicalPricing.getQuickPsychologicalPrice(
      10000, // Would get actual item price
      'electronics'
    );

    return res.json({
      success: true,
      data: {
        itemId,
        authenticity: {
          score: authenticity.overallScore,
          verdict: authenticity.verdict,
          confidence: authenticity.confidence,
          riskFactors: authenticity.riskFactors.slice(0, 3),
        },
        pricing: pricingTip,
        recommendations: authenticity.recommendations.slice(0, 3),
      },
    });
  } catch (error) {
    console.error('Item insights error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to get item insights',
      messageAr: 'فشل في الحصول على رؤى المنتج',
    });
  }
}

/**
 * Get advanced AI features status
 */
export async function getAdvancedAiStatus(req: Request, res: Response) {
  return res.json({
    success: true,
    data: {
      features: {
        psychologicalPricing: {
          status: 'active',
          version: 'v1.0',
          description: 'AI-powered psychological pricing optimization',
          descriptionAr: 'تحسين التسعير النفسي بالذكاء الاصطناعي',
        },
        sellerIntelligence: {
          status: 'active',
          version: 'v1.0',
          description: 'Comprehensive seller analytics dashboard',
          descriptionAr: 'لوحة تحليلات شاملة للبائعين',
        },
        visualAuthenticity: {
          status: 'active',
          version: 'v1.0',
          description: 'Visual AI for product authenticity verification',
          descriptionAr: 'ذكاء اصطناعي بصري للتحقق من أصالة المنتجات',
        },
      },
      lastUpdated: new Date().toISOString(),
    },
  });
}
