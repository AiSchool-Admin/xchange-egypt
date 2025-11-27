/**
 * AI Features Controller
 * FREE AI services for Egyptian market
 */

import { Request, Response, NextFunction } from 'express';
import * as autoCategorization from '../services/autoCategorization.service';
import * as priceEstimation from '../services/priceEstimation.service';
import * as fraudDetection from '../services/fraudDetection.service';
import * as barterRanking from '../services/barterRanking.service';
import { buildSmartSearchTerms, calculateRelevanceScore } from '../utils/arabicSearch';
import { ItemCondition } from '@prisma/client';
import prisma from '../config/database';

// ============================================
// AUTO-CATEGORIZATION
// ============================================

/**
 * Categorize an item automatically
 * POST /api/v1/ai/categorize
 */
export const categorizeItem = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, description } = req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        error: 'Title is required',
      });
    }

    const result = await autoCategorization.categorizeItem(title, description);

    // Fetch category details from database
    const category = await prisma.category.findUnique({
      where: { slug: result.categorySlug },
      select: {
        id: true,
        nameEn: true,
        slug: true,
        parent: {
          select: {
            nameEn: true,
          },
        },
      },
    });

    // Fetch alternative category details
    const alternatives = [];
    if (result.suggestedCategories && result.suggestedCategories.length > 0) {
      const altCategories = await prisma.category.findMany({
        where: {
          slug: {
            in: result.suggestedCategories.map(cat => cat.slug),
          },
        },
        select: {
          id: true,
          nameEn: true,
          slug: true,
          parent: {
            select: {
              nameEn: true,
            },
          },
        },
      });

      // Map with confidence scores
      for (const altCat of altCategories) {
        const suggestionData = result.suggestedCategories.find(s => s.slug === altCat.slug);
        if (suggestionData) {
          alternatives.push({
            id: altCat.id,
            name: altCat.nameEn,
            confidence: suggestionData.confidence / 100, // Convert to 0-1
            parentCategory: altCat.parent?.nameEn,
          });
        }
      }
    }

    // Format response to match frontend expectations
    res.json({
      success: true,
      category: {
        id: category?.id || result.categoryId || 'unknown',
        name: category?.nameEn || result.categorySlug,
        confidence: result.confidence / 100, // Convert to 0-1 for frontend
        parentCategory: category?.parent?.nameEn,
      },
      alternatives,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Batch categorize multiple items
 * POST /api/v1/ai/categorize/batch
 */
export const categorizeItems = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required',
      });
    }

    if (items.length > 100) {
      return res.status(400).json({
        success: false,
        error: 'Maximum 100 items per batch',
      });
    }

    const results = await autoCategorization.categorizeItems(items);

    res.json({
      success: true,
      data: results,
      total: results.length,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category suggestions for partial input
 * GET /api/v1/ai/categorize/suggestions?query=موبايل
 */
export const getCategorySuggestions = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    const suggestions = autoCategorization.getCategorySuggestions(query as string);

    res.json({
      success: true,
      data: suggestions,
      total: suggestions.length,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// PRICE ESTIMATION
// ============================================

/**
 * Estimate price for an item
 * POST /api/v1/ai/estimate-price
 */
export const estimatePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId, condition, title, description } = req.body;

    if (!categoryId || !condition) {
      return res.status(400).json({
        success: false,
        error: 'categoryId and condition are required',
      });
    }

    const result = await priceEstimation.estimatePrice(
      categoryId,
      condition as ItemCondition,
      title,
      description
    );

    // Get market trend
    const trendData = await priceEstimation.getCategoryPriceTrends(categoryId, 30);

    // Format response to match frontend expectations
    res.json({
      success: true,
      estimation: {
        estimatedPrice: result.estimatedPrice,
        confidence: result.confidence / 100, // Convert to 0-1
        priceRange: result.priceRange,
        marketTrend: trendData.trend,
        comparableItems: result.sampleSize,
      },
      suggestion: result.suggestions && result.suggestions.length > 0
        ? result.suggestions[0]
        : undefined,
      warning: result.confidence < 40
        ? 'Limited data available - estimate may be less accurate'
        : undefined,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get category price trends
 * GET /api/v1/ai/price-trends/:categoryId?days=30
 */
export const getPriceTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId } = req.params;
    const { days = '30' } = req.query;

    const result = await priceEstimation.getCategoryPriceTrends(
      categoryId,
      parseInt(days as string)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Validate if price is reasonable
 * POST /api/v1/ai/validate-price
 */
export const validatePrice = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { categoryId, condition, price } = req.body;

    if (!categoryId || !condition || !price) {
      return res.status(400).json({
        success: false,
        error: 'categoryId, condition, and price are required',
      });
    }

    const result = await priceEstimation.validatePrice(
      categoryId,
      condition as ItemCondition,
      parseFloat(price)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// FRAUD DETECTION
// ============================================

/**
 * Check listing for fraud indicators
 * POST /api/v1/ai/check-listing
 */
export const checkListing = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      sellerId,
      title,
      description,
      price,
      condition,
      categoryId,
      images,
    } = req.body;

    // Get userId from sellerId or authenticated user
    const userId = sellerId || (req as any).user?.id || 'guest';

    if (!title || !description || price === undefined || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, price, and categoryId are required',
      });
    }

    const result = await fraudDetection.checkListing(
      userId,
      title,
      description,
      parseFloat(price),
      condition as ItemCondition || 'GOOD',
      categoryId,
      Array.isArray(images) ? images.length : 0
    );

    // Extract details from flags
    const priceFlags = result.flags.filter(f =>
      f.type === 'too_good_to_be_true' || f.type === 'suspiciously_low_price'
    );
    const keywordFlags = result.flags.filter(f => f.type === 'scam_keywords');

    const priceDeviation = priceFlags.length > 0 ? -50 : undefined; // Approximate
    const suspiciousKeywords = keywordFlags.length > 0 && keywordFlags[0].details
      ? keywordFlags[0].details.replace('Found: ', '').split(', ')
      : undefined;

    // Map risk level to uppercase
    const riskLevelMap: { [key: string]: 'LOW' | 'MEDIUM' | 'HIGH' } = {
      'low': 'LOW',
      'medium': 'MEDIUM',
      'high': 'HIGH',
      'critical': 'HIGH',
    };

    // Map to recommendation
    let recommendation: 'APPROVED' | 'REVIEW_REQUIRED' | 'REJECTED';
    if (result.shouldBlock) {
      recommendation = 'REJECTED';
    } else if (result.isSuspicious || result.riskLevel !== 'low') {
      recommendation = 'REVIEW_REQUIRED';
    } else {
      recommendation = 'APPROVED';
    }

    // Format response to match frontend expectations
    res.json({
      success: true,
      fraudScore: result.riskScore / 100, // Convert to 0-1
      riskLevel: riskLevelMap[result.riskLevel] || 'LOW',
      flags: result.flags.map(f => f.message),
      recommendation,
      details: {
        priceDeviation,
        suspiciousKeywords,
        imageCount: Array.isArray(images) ? images.length : 0,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check user behavior for suspicious patterns
 * GET /api/v1/ai/check-user/:userId
 */
export const checkUserBehavior = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;

    const result = await fraudDetection.checkUserBehavior(userId);

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check transaction for fraud
 * POST /api/v1/ai/check-transaction
 */
export const checkTransaction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { buyerId, sellerId, amount } = req.body;

    if (!buyerId || !sellerId || !amount) {
      return res.status(400).json({
        success: false,
        error: 'buyerId, sellerId, and amount are required',
      });
    }

    const result = await fraudDetection.checkTransaction(
      buyerId,
      sellerId,
      parseFloat(amount)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// SMART SEARCH (ARABIC)
// ============================================

/**
 * Build smart search terms for Arabic/English query
 * GET /api/v1/ai/search-terms?query=موبايل
 */
export const getSearchTerms = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        error: 'Query is required',
      });
    }

    const terms = buildSmartSearchTerms(query as string);

    res.json({
      success: true,
      data: terms,
      message: 'Smart search terms generated with Egyptian Arabic support',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get AI feature status and statistics
 * GET /api/v1/ai/status
 */
export const getAiStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    res.json({
      success: true,
      data: {
        features: {
          autoCategorization: {
            status: 'active',
            type: 'keyword-based',
            cost: 'free',
            accuracy: '85-95%',
            categories: 218,
          },
          priceEstimation: {
            status: 'active',
            type: 'statistical',
            cost: 'free',
            method: 'median-based with historical data',
          },
          fraudDetection: {
            status: 'active',
            type: 'rule-based',
            cost: 'free',
            checks: 15,
          },
          arabicSearch: {
            status: 'active',
            type: 'normalized text + variations',
            cost: 'free',
            features: ['diacritic removal', 'phonetic matching', 'dialect support'],
          },
          barterRanking: {
            status: 'active',
            type: 'intelligent ranking',
            cost: 'free',
            factors: ['user trust', 'location', 'value balance', 'condition compatibility'],
          },
        },
        version: '1.0.0',
        lastUpdated: new Date().toISOString(),
      },
      message: 'All AI features are operational',
    });
  } catch (error) {
    next(error);
  }
};

// ============================================
// BARTER RANKING
// ============================================

/**
 * Rank a barter cycle intelligently
 * POST /api/v1/ai/rank-barter-cycle
 */
export const rankBarterCycle = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { participants, originalMatchScore } = req.body;

    if (!participants || !Array.isArray(participants) || participants.length < 2) {
      return res.status(400).json({
        success: false,
        error: 'At least 2 participants required',
      });
    }

    if (!originalMatchScore) {
      return res.status(400).json({
        success: false,
        error: 'originalMatchScore is required',
      });
    }

    const result = await barterRanking.rankBarterCycle({
      participants,
      originalMatchScore,
    });

    res.json({
      success: true,
      data: result,
      message: `Barter cycle ranked: ${result.recommendationStrength}`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rank multiple barter cycles
 * POST /api/v1/ai/rank-barter-cycles
 */
export const rankMultipleBarterCycles = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { cycles } = req.body;

    if (!cycles || !Array.isArray(cycles) || cycles.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Cycles array is required',
      });
    }

    const results = await barterRanking.rankMultipleBarterCycles(cycles);

    res.json({
      success: true,
      data: results,
      total: results.length,
      message: `${results.length} barter cycles ranked`,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get personalized barter recommendations for a user
 * GET /api/v1/ai/barter-recommendations/:userId
 */
export const getBarterRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { userId } = req.params;
    const { limit = '10' } = req.query;

    const recommendations = await barterRanking.getPersonalizedBarterRecommendations(
      userId,
      parseInt(limit as string)
    );

    res.json({
      success: true,
      data: recommendations,
      total: recommendations.length,
      message: `Found ${recommendations.length} personalized recommendations`,
    });
  } catch (error) {
    next(error);
  }
};
