/**
 * @fileoverview وحدة التحكم للخدمات المتقدمة لسوق العقارات
 * @description API endpoints للتسعير والمقايضة والتوصيات
 * @author Xchange Real Estate
 * @version 1.0.0
 */

import { Request, Response, NextFunction } from 'express';
import { PropertyType, FinishingLevel } from '@prisma/client';
import {
  estimatePropertyValue,
  updateRegionalPrices,
  PropertyInput,
  PropertyCondition,
} from '../services/real-estate/pricing-algorithm';
import {
  getBarterMatcher,
  initializeBarterMatcher,
  MatchOptions,
} from '../services/real-estate/barter-matcher';
import {
  getRecommendations,
  getSimilarPropertyRecommendations,
  getColdStartRecommendations,
  invalidateUserCache,
  UserProfile,
  RecommendationOptions,
} from '../services/real-estate/recommendation-engine';
import { successResponse, errorResponse } from '../utils/response';
import { BadRequestError } from '../utils/errors';
import prisma from '../lib/prisma';

// ============================================
// التسعير العقاري (AVM)
// ============================================

/**
 * تقدير قيمة العقار
 * POST /api/real-estate/estimate-value
 */
export const estimateValue = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      propertyType,
      totalArea,
      governorate,
      city,
      area,
      district,
      compoundName,
      bedrooms,
      bathrooms,
      floor,
      buildingAge,
      condition,
      furnishingType,
      features,
      latitude,
      longitude,
      finishingLevel,
    } = req.body;

    // التحقق من البيانات المطلوبة
    if (!propertyType || !totalArea || !governorate || !condition) {
      throw new BadRequestError('Missing required fields: propertyType, totalArea, governorate, condition');
    }

    const input: PropertyInput = {
      propertyType: propertyType as PropertyType,
      totalArea: Number(totalArea),
      governorate,
      city,
      area,
      district,
      compoundName,
      bedrooms: bedrooms ? Number(bedrooms) : undefined,
      bathrooms: bathrooms ? Number(bathrooms) : undefined,
      floor: floor ? Number(floor) : undefined,
      buildingAge: buildingAge ? Number(buildingAge) : undefined,
      condition: condition as PropertyCondition,
      furnishingType,
      features: features || [],
      latitude: latitude ? Number(latitude) : undefined,
      longitude: longitude ? Number(longitude) : undefined,
      finishingLevel: finishingLevel as FinishingLevel | undefined,
    };

    const estimate = await estimatePropertyValue(input);

    return successResponse(res, estimate, 'Property value estimated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * تحديث أسعار السوق (Admin only)
 * POST /api/real-estate/admin/update-prices
 */
export const updateMarketPrices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await updateRegionalPrices();
    return successResponse(res, null, 'Market prices updated successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * الحصول على متوسط الأسعار حسب المنطقة
 * GET /api/real-estate/market-prices
 */
export const getMarketPrices = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { governorate, city, propertyType } = req.query;

    const where: any = {};
    if (governorate) where.governorate = governorate;
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;

    const prices = await prisma.propertyPrice.findMany({
      where,
      orderBy: { recordedAt: 'desc' },
      take: 100,
    });

    return successResponse(res, prices, 'Market prices retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// نظام المقايضة متعدد الأطراف
// ============================================

/**
 * البحث عن سلاسل المقايضة
 * GET /api/real-estate/barter/matches
 */
export const findBarterMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      maxChainLength,
      minFairnessScore,
      maxCashFlowPercent,
      prioritizeSimplicity,
      limit,
    } = req.query;

    const options: MatchOptions = {
      maxChainLength: maxChainLength ? Number(maxChainLength) : 5,
      minFairnessScore: minFairnessScore ? Number(minFairnessScore) : 0.6,
      maxCashFlowPercent: maxCashFlowPercent ? Number(maxCashFlowPercent) : 0.25,
      prioritizeSimplicity: prioritizeSimplicity === 'true',
      limit: limit ? Number(limit) : 20,
    };

    // تهيئة المطابق وتحميل العروض
    const matcher = await initializeBarterMatcher();
    const results = await matcher.findMatches(options);

    return successResponse(res, results, 'Barter matches found successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * البحث عن مطابقات مباشرة لعرض معين
 * GET /api/real-estate/barter/:offerId/direct-matches
 */
export const findDirectBarterMatches = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { offerId } = req.params;

    const matcher = await initializeBarterMatcher();
    const matches = await matcher.findDirectMatches(offerId);

    return successResponse(res, matches, 'Direct matches found successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * التحقق من صحة سلسلة مقايضة
 * POST /api/real-estate/barter/validate-chain
 */
export const validateBarterChain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chain } = req.body;

    if (!chain) {
      throw new BadRequestError('Chain data is required');
    }

    const matcher = getBarterMatcher();
    const validation = await matcher.validateChain(chain);

    return successResponse(res, validation, 'Chain validated');
  } catch (error) {
    next(error);
  }
};

/**
 * حفظ سلسلة مقايضة
 * POST /api/real-estate/barter/save-chain
 */
export const saveBarterChain = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { chain } = req.body;

    if (!chain) {
      throw new BadRequestError('Chain data is required');
    }

    const matcher = getBarterMatcher();

    // التحقق أولاً
    const validation = await matcher.validateChain(chain);
    if (!validation.valid) {
      throw new BadRequestError(`Invalid chain: ${validation.errors.join(', ')}`);
    }

    const chainId = await matcher.saveChain(chain);

    return successResponse(res, { chainId, warnings: validation.warnings }, 'Chain saved successfully', 201);
  } catch (error) {
    next(error);
  }
};

/**
 * الحصول على إحصائيات المقايضة
 * GET /api/real-estate/barter/stats
 */
export const getBarterStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const matcher = await initializeBarterMatcher();
    const stats = matcher.getStats();

    return successResponse(res, stats, 'Barter stats retrieved successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// محرك التوصيات الذكي
// ============================================

/**
 * الحصول على التوصيات للمستخدم
 * GET /api/real-estate/recommendations
 */
export const getUserRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    const {
      limit,
      includeViewed,
      includeFavorites,
      diversityRatio,
    } = req.query;

    const options: RecommendationOptions = {
      limit: limit ? Number(limit) : 20,
      includeViewed: includeViewed === 'true',
      includeFavorites: includeFavorites === 'true',
      diversityRatio: diversityRatio ? Number(diversityRatio) : 0.15,
    };

    // بناء ملف تعريف المستخدم
    const profile = await buildUserProfile(userId);
    const recommendations = await getRecommendations(profile, options);

    return successResponse(res, recommendations, 'Recommendations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * الحصول على عقارات مشابهة
 * GET /api/real-estate/:propertyId/similar
 */
export const getSimilarProperties = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { propertyId } = req.params;
    const { limit } = req.query;

    const recommendations = await getSimilarPropertyRecommendations(
      propertyId,
      limit ? Number(limit) : 10
    );

    return successResponse(res, recommendations, 'Similar properties retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * الحصول على توصيات للمستخدمين الجدد
 * GET /api/real-estate/recommendations/trending
 */
export const getTrendingRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { governorate, limit } = req.query;

    const recommendations = await getColdStartRecommendations(
      governorate as string | undefined,
      limit ? Number(limit) : 20
    );

    return successResponse(res, recommendations, 'Trending recommendations retrieved successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * إبطال التخزين المؤقت للتوصيات
 * POST /api/real-estate/recommendations/refresh
 */
export const refreshRecommendations = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    invalidateUserCache(userId);

    // إعادة حساب التوصيات
    const profile = await buildUserProfile(userId);
    const recommendations = await getRecommendations(profile);

    return successResponse(res, recommendations, 'Recommendations refreshed successfully');
  } catch (error) {
    next(error);
  }
};

/**
 * تسجيل تفاعل المستخدم (لتحسين التوصيات)
 * POST /api/real-estate/recommendations/interaction
 */
export const recordInteraction = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new BadRequestError('User authentication required');
    }

    const { propertyId, interactionType, duration } = req.body;

    if (!propertyId || !interactionType) {
      throw new BadRequestError('propertyId and interactionType are required');
    }

    // تسجيل التفاعل (يمكن توسيعه لاحقاً)
    // حالياً نكتفي بإبطال التخزين المؤقت
    invalidateUserCache(userId);

    return successResponse(res, null, 'Interaction recorded successfully');
  } catch (error) {
    next(error);
  }
};

// ============================================
// Helper Functions
// ============================================

/**
 * بناء ملف تعريف المستخدم من قاعدة البيانات
 * @param userId معرف المستخدم
 */
async function buildUserProfile(userId: string): Promise<UserProfile> {
  // جلب بيانات المستخدم
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      governorate: true,
    },
  });

  // جلب المفضلات
  const favorites = await prisma.propertyFavorite.findMany({
    where: { userId },
    select: { propertyId: true },
    orderBy: { createdAt: 'desc' },
  });

  // جلب البحوث المحفوظة
  const savedSearches = await prisma.savedSearch.findMany({
    where: { userId },
    select: { filters: true },
    take: 10,
  });

  // جلب المعاملات
  const transactions = await prisma.propertyTransaction.findMany({
    where: {
      OR: [
        { buyerId: userId },
        { property: { ownerId: userId } },
      ],
    },
    select: { propertyId: true },
    take: 20,
  });

  // تحويل البحوث المحفوظة
  const parsedSearches = savedSearches.map(s => {
    const filters = s.filters as Record<string, any> || {};
    return {
      governorate: filters.governorate,
      city: filters.city,
      propertyType: filters.propertyType,
      priceMin: filters.priceMin,
      priceMax: filters.priceMax,
      areaMin: filters.areaMin,
      areaMax: filters.areaMax,
      bedrooms: filters.bedrooms,
      features: filters.features,
    };
  });

  return {
    userId,
    viewHistory: [], // يمكن إضافة جدول لسجل المشاهدات لاحقاً
    favorites: favorites.map(f => f.propertyId),
    savedSearches: parsedSearches,
    transactions: transactions.map(t => t.propertyId),
    governorate: user?.governorate || undefined,
  };
}

// ============================================
// Export All Controllers
// ============================================

export default {
  // Pricing
  estimateValue,
  updateMarketPrices,
  getMarketPrices,
  // Barter
  findBarterMatches,
  findDirectBarterMatches,
  validateBarterChain,
  saveBarterChain,
  getBarterStats,
  // Recommendations
  getUserRecommendations,
  getSimilarProperties,
  getTrendingRecommendations,
  refreshRecommendations,
  recordInteraction,
};
