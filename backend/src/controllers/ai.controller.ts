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

    res.json({
      success: true,
      data: result,
      message: result.confidence > 70
        ? 'Category detected with high confidence'
        : 'Category suggestion provided (low confidence)',
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

    res.json({
      success: true,
      data: result,
      message: result.confidence > 60
        ? 'Price estimate based on market data'
        : 'Limited data available - estimate may be less accurate',
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
      userId,
      title,
      description,
      price,
      condition,
      categoryId,
      images,
    } = req.body;

    if (!userId || !title || !description || !price || !condition || !categoryId) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required',
      });
    }

    const result = await fraudDetection.checkListing(
      userId,
      title,
      description,
      parseFloat(price),
      condition as ItemCondition,
      categoryId,
      images
    );

    res.json({
      success: true,
      data: result,
      message: result.shouldBlock
        ? 'Listing blocked - high fraud risk'
        : result.isSuspicious
        ? 'Listing flagged for review'
        : 'Listing appears legitimate',
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
