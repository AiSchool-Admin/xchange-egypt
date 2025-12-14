/**
 * @fileoverview محرك التوصيات الذكي (AI Recommendation Engine)
 * @description نظام توصيات هجين (Content-Based + Collaborative Filtering)
 * @author Xchange Real Estate
 * @version 1.0.0
 */

import { PropertyType, PropertyStatus, FinishingLevel } from '@prisma/client';
import prisma from '../../lib/prisma';
import {
  findSimilarUsers,
  findSimilarProperties,
  jaccardSimilarity,
  UserSimilarityProfile,
  PropertySimilarityProfile,
} from './similarity';

// ============================================
// Types & Interfaces
// ============================================

/**
 * سجل مشاهدة
 */
export interface ViewRecord {
  propertyId: string;
  viewedAt: Date;
  duration: number; // بالثواني
}

/**
 * معايير البحث المحفوظة
 */
export interface SavedSearchCriteria {
  governorate?: string;
  city?: string;
  propertyType?: PropertyType;
  priceMin?: number;
  priceMax?: number;
  areaMin?: number;
  areaMax?: number;
  bedrooms?: number;
  features?: string[];
}

/**
 * ملف تعريف المستخدم للتوصيات
 */
export interface UserProfile {
  userId: string;
  viewHistory: ViewRecord[];
  favorites: string[];
  savedSearches: SavedSearchCriteria[];
  transactions: string[];
  governorate?: string;
}

/**
 * توصية عقار
 */
export interface PropertyRecommendation {
  propertyId: string;
  score: number;
  reasons: string[];
  reasonsAr: string[];
  scoreBreakdown: {
    contentBased: number;
    collaborative: number;
    trending: number;
    diversity: number;
  };
  property?: any; // بيانات العقار الكاملة
}

/**
 * خيارات التوصيات
 */
export interface RecommendationOptions {
  limit?: number;
  includeViewed?: boolean;
  includeFavorites?: boolean;
  diversityRatio?: number;
  freshness?: 'recent' | 'all';
}

// ============================================
// Constants
// ============================================

/**
 * أوزان مكونات التوصية
 */
const RECOMMENDATION_WEIGHTS = {
  contentBased: 0.40,
  collaborative: 0.25,
  trending: 0.20,
  diversity: 0.15,
};

/**
 * أوزان Content-Based
 */
const CONTENT_WEIGHTS = {
  location: 0.35,
  price: 0.25,
  propertyType: 0.20,
  features: 0.20,
};

/**
 * إعدادات التخزين المؤقت
 */
const CACHE_TTL_MS = 60 * 60 * 1000; // ساعة واحدة

// ============================================
// Cache Implementation
// ============================================

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

const recommendationCache = new Map<string, CacheEntry<PropertyRecommendation[]>>();

function getCachedRecommendations(userId: string): PropertyRecommendation[] | null {
  const entry = recommendationCache.get(userId);
  if (!entry) return null;

  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    recommendationCache.delete(userId);
    return null;
  }

  return entry.data;
}

function setCachedRecommendations(userId: string, recommendations: PropertyRecommendation[]): void {
  recommendationCache.set(userId, {
    data: recommendations,
    timestamp: Date.now(),
  });
}

// ============================================
// Content-Based Filtering
// ============================================

/**
 * بناء ملف تعريف تفضيلات المستخدم من سجل التصفح
 * @param profile ملف تعريف المستخدم
 */
async function buildUserPreferences(profile: UserProfile): Promise<{
  preferredGovernorates: Map<string, number>;
  preferredPropertyTypes: Map<PropertyType, number>;
  priceRange: { min: number; max: number; avg: number };
  areaRange: { min: number; max: number; avg: number };
  preferredFeatures: Map<string, number>;
}> {
  // جمع معرفات العقارات المشاهدة والمفضلة
  const propertyIds = [
    ...profile.viewHistory.map(v => v.propertyId),
    ...profile.favorites,
  ];

  if (propertyIds.length === 0) {
    return {
      preferredGovernorates: new Map(),
      preferredPropertyTypes: new Map(),
      priceRange: { min: 0, max: Infinity, avg: 0 },
      areaRange: { min: 0, max: Infinity, avg: 0 },
      preferredFeatures: new Map(),
    };
  }

  // جلب بيانات العقارات
  const properties = await prisma.property.findMany({
    where: { id: { in: propertyIds } },
    select: {
      id: true,
      governorate: true,
      propertyType: true,
      salePrice: true,
      areaSqm: true,
      amenities: true,
    },
  });

  // تحليل التفضيلات
  const governorateCounts = new Map<string, number>();
  const typeCounts = new Map<PropertyType, number>();
  const featureCounts = new Map<string, number>();
  const prices: number[] = [];
  const areas: number[] = [];

  for (const prop of properties) {
    // حساب الوزن (المفضلات أعلى من المشاهدات)
    const isFavorite = profile.favorites.includes(prop.id);
    const viewRecord = profile.viewHistory.find(v => v.propertyId === prop.id);
    let weight = 1;

    if (isFavorite) weight = 3;
    else if (viewRecord && viewRecord.duration > 60) weight = 2;
    else if (viewRecord && viewRecord.duration > 30) weight = 1.5;

    // المحافظة
    governorateCounts.set(
      prop.governorate,
      (governorateCounts.get(prop.governorate) || 0) + weight
    );

    // نوع العقار
    typeCounts.set(
      prop.propertyType,
      (typeCounts.get(prop.propertyType) || 0) + weight
    );

    // السعر والمساحة
    if (prop.salePrice) prices.push(prop.salePrice);
    if (prop.areaSqm) areas.push(prop.areaSqm);

    // المميزات
    if (prop.amenities && typeof prop.amenities === 'object') {
      const amenitiesObj = prop.amenities as Record<string, boolean>;
      for (const [feature, value] of Object.entries(amenitiesObj)) {
        if (value === true) {
          featureCounts.set(feature, (featureCounts.get(feature) || 0) + weight);
        }
      }
    }
  }

  // حساب نطاقات السعر والمساحة
  const sortedPrices = prices.sort((a, b) => a - b);
  const sortedAreas = areas.sort((a, b) => a - b);

  return {
    preferredGovernorates: governorateCounts,
    preferredPropertyTypes: typeCounts,
    priceRange: {
      min: sortedPrices.length > 0 ? sortedPrices[0] * 0.7 : 0,
      max: sortedPrices.length > 0 ? sortedPrices[sortedPrices.length - 1] * 1.3 : Infinity,
      avg: sortedPrices.length > 0 ? sortedPrices.reduce((a, b) => a + b, 0) / sortedPrices.length : 0,
    },
    areaRange: {
      min: sortedAreas.length > 0 ? sortedAreas[0] * 0.7 : 0,
      max: sortedAreas.length > 0 ? sortedAreas[sortedAreas.length - 1] * 1.3 : Infinity,
      avg: sortedAreas.length > 0 ? sortedAreas.reduce((a, b) => a + b, 0) / sortedAreas.length : 0,
    },
    preferredFeatures: featureCounts,
  };
}

/**
 * حساب درجة Content-Based لعقار
 * @param property العقار
 * @param preferences تفضيلات المستخدم
 */
function calculateContentBasedScore(
  property: {
    governorate: string;
    propertyType: PropertyType;
    salePrice: number | null;
    areaSqm: number;
    amenities: any;
  },
  preferences: Awaited<ReturnType<typeof buildUserPreferences>>
): number {
  let score = 0;

  // 1. تطابق الموقع (35%)
  const maxGovCount = Math.max(...Array.from(preferences.preferredGovernorates.values()), 1);
  const govCount = preferences.preferredGovernorates.get(property.governorate) || 0;
  const locationScore = govCount / maxGovCount;
  score += locationScore * CONTENT_WEIGHTS.location;

  // 2. تطابق السعر (25%)
  if (property.salePrice && preferences.priceRange.avg > 0) {
    const priceDiff = Math.abs(property.salePrice - preferences.priceRange.avg);
    const priceRange = preferences.priceRange.max - preferences.priceRange.min;
    const priceScore = Math.max(0, 1 - (priceDiff / (priceRange || 1)));
    score += priceScore * CONTENT_WEIGHTS.price;
  } else {
    score += 0.5 * CONTENT_WEIGHTS.price; // قيمة افتراضية
  }

  // 3. تطابق نوع العقار (20%)
  const maxTypeCount = Math.max(...Array.from(preferences.preferredPropertyTypes.values()), 1);
  const typeCount = preferences.preferredPropertyTypes.get(property.propertyType) || 0;
  const typeScore = typeCount / maxTypeCount;
  score += typeScore * CONTENT_WEIGHTS.propertyType;

  // 4. تطابق المميزات (20%)
  if (property.amenities && typeof property.amenities === 'object') {
    const amenitiesObj = property.amenities as Record<string, boolean>;
    const propertyFeatures = new Set(
      Object.entries(amenitiesObj)
        .filter(([, v]) => v)
        .map(([k]) => k)
    );
    const preferredFeatures = new Set(
      Array.from(preferences.preferredFeatures.keys())
    );
    const featureScore = jaccardSimilarity(propertyFeatures, preferredFeatures);
    score += featureScore * CONTENT_WEIGHTS.features;
  }

  return score;
}

// ============================================
// Collaborative Filtering
// ============================================

/**
 * إيجاد المستخدمين المشابهين وتوصياتهم
 * @param profile ملف تعريف المستخدم
 * @param limit عدد المستخدمين المشابهين
 */
async function getCollaborativeRecommendations(
  profile: UserProfile,
  limit: number = 20
): Promise<Map<string, number>> {
  // بناء ملف تعريف التشابه للمستخدم
  const userSimilarityProfile: UserSimilarityProfile = {
    userId: profile.userId,
    viewedPropertyIds: profile.viewHistory.map(v => v.propertyId),
    favoritePropertyIds: profile.favorites,
    searchedGovernorates: profile.savedSearches
      .map(s => s.governorate)
      .filter((g): g is string => g !== undefined),
    searchedPropertyTypes: profile.savedSearches
      .map(s => s.propertyType)
      .filter((t): t is PropertyType => t !== undefined),
    priceRange: {
      min: Math.min(...profile.savedSearches.map(s => s.priceMin || 0)),
      max: Math.max(...profile.savedSearches.map(s => s.priceMax || Infinity)),
    },
    areaRange: {
      min: Math.min(...profile.savedSearches.map(s => s.areaMin || 0)),
      max: Math.max(...profile.savedSearches.map(s => s.areaMax || Infinity)),
    },
    preferredBedrooms: profile.savedSearches
      .map(s => s.bedrooms)
      .filter((b): b is number => b !== undefined),
  };

  // جلب مستخدمين آخرين لديهم مفضلات
  const otherUsers = await prisma.propertyFavorite.groupBy({
    by: ['userId'],
    _count: true,
    having: {
      userId: {
        _count: {
          gte: 3, // على الأقل 3 مفضلات
        },
      },
    },
    take: 100,
  });

  // بناء ملفات تعريف المستخدمين الآخرين
  const otherUserProfiles: UserSimilarityProfile[] = [];

  for (const user of otherUsers) {
    if (user.userId === profile.userId) continue;

    const favorites = await prisma.propertyFavorite.findMany({
      where: { userId: user.userId },
      select: { propertyId: true },
    });

    otherUserProfiles.push({
      userId: user.userId,
      viewedPropertyIds: [],
      favoritePropertyIds: favorites.map(f => f.propertyId),
      searchedGovernorates: [],
      searchedPropertyTypes: [],
      priceRange: { min: 0, max: Infinity },
      areaRange: { min: 0, max: Infinity },
      preferredBedrooms: [],
    });
  }

  // إيجاد المستخدمين المشابهين
  const similarUsers = findSimilarUsers(userSimilarityProfile, otherUserProfiles, limit);

  // جمع مفضلات المستخدمين المشابهين
  const propertyScores = new Map<string, number>();
  const userFavorites = new Set(profile.favorites);

  for (const similarUser of similarUsers) {
    const favorites = await prisma.propertyFavorite.findMany({
      where: { userId: similarUser.id },
      select: { propertyId: true },
    });

    for (const fav of favorites) {
      if (!userFavorites.has(fav.propertyId)) {
        const currentScore = propertyScores.get(fav.propertyId) || 0;
        propertyScores.set(fav.propertyId, currentScore + similarUser.score);
      }
    }
  }

  // تطبيع الدرجات
  const maxScore = Math.max(...Array.from(propertyScores.values()), 1);
  for (const [propId, score] of propertyScores) {
    propertyScores.set(propId, score / maxScore);
  }

  return propertyScores;
}

// ============================================
// Trending Analysis
// ============================================

/**
 * حساب درجة الـ Trending للعقارات
 * @param governorate المحافظة (اختياري)
 */
async function getTrendingScores(governorate?: string): Promise<Map<string, number>> {
  const scores = new Map<string, number>();
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  // جلب العقارات النشطة
  const properties = await prisma.property.findMany({
    where: {
      status: PropertyStatus.ACTIVE,
      ...(governorate && { governorate }),
    },
    select: {
      id: true,
      viewsCount: true,
      favoritesCount: true,
      createdAt: true,
    },
    orderBy: [
      { viewsCount: 'desc' },
      { favoritesCount: 'desc' },
    ],
    take: 500,
  });

  // حساب الحد الأقصى للتطبيع
  const maxViews = Math.max(...properties.map(p => p.viewsCount), 1);
  const maxFavorites = Math.max(...properties.map(p => p.favoritesCount), 1);

  for (const prop of properties) {
    // سرعة المشاهدات (40%)
    const viewVelocity = prop.viewsCount / maxViews;

    // معدل الإضافة للمفضلات (30%)
    const favoriteRate = prop.favoritesCount / maxFavorites;

    // حداثة الإعلان (30%)
    const ageInDays = (Date.now() - prop.createdAt.getTime()) / (1000 * 60 * 60 * 24);
    const freshnessScore = Math.max(0, 1 - ageInDays / 30);

    const trendingScore = viewVelocity * 0.4 + favoriteRate * 0.3 + freshnessScore * 0.3;
    scores.set(prop.id, trendingScore);
  }

  return scores;
}

// ============================================
// Diversity Enhancement
// ============================================

/**
 * تطبيق التنويع على التوصيات
 * @param recommendations التوصيات
 * @param diversityRatio نسبة التنويع
 */
function applyDiversity(
  recommendations: PropertyRecommendation[],
  diversityRatio: number = 0.3
): PropertyRecommendation[] {
  if (recommendations.length <= 5) return recommendations;

  // تقسيم التوصيات
  const splitIndex = Math.floor(recommendations.length * (1 - diversityRatio));
  const topRecommendations = recommendations.slice(0, splitIndex);
  const diversePool = recommendations.slice(splitIndex);

  // تنويع المجموعة السفلية
  const seenGovernorates = new Set(topRecommendations.map(r => r.property?.governorate));
  const seenTypes = new Set(topRecommendations.map(r => r.property?.propertyType));

  const diverseRecommendations = diversePool.filter(r => {
    const gov = r.property?.governorate;
    const type = r.property?.propertyType;
    return !seenGovernorates.has(gov) || !seenTypes.has(type);
  });

  // دمج المجموعتين
  return [...topRecommendations, ...diverseRecommendations];
}

// ============================================
// Cold Start Handling
// ============================================

/**
 * توصيات للمستخدمين الجدد
 * @param governorate محافظة المستخدم
 * @param limit عدد التوصيات
 */
async function getColdStartRecommendations(
  governorate?: string,
  limit: number = 20
): Promise<PropertyRecommendation[]> {
  // 1. الحصول على درجات الـ Trending (40%)
  const trendingScores = await getTrendingScores(governorate);

  // 2. العقارات الشائعة في المحافظة (30%)
  const popularInGovernorate = governorate
    ? await prisma.property.findMany({
        where: {
          status: PropertyStatus.ACTIVE,
          governorate,
        },
        orderBy: [
          { favoritesCount: 'desc' },
          { viewsCount: 'desc' },
        ],
        take: 50,
        select: { id: true },
      })
    : [];

  // 3. تنويع (30%)
  const diverseProperties = await prisma.property.findMany({
    where: {
      status: PropertyStatus.ACTIVE,
      ...(governorate && { governorate: { not: governorate } }),
    },
    orderBy: { createdAt: 'desc' },
    take: 30,
    select: { id: true },
  });

  // دمج النتائج
  const recommendations: Map<string, PropertyRecommendation> = new Map();

  // Trending (40%)
  for (const [propId, score] of trendingScores) {
    recommendations.set(propId, {
      propertyId: propId,
      score: score * 0.4,
      reasons: ['Popular property'],
      reasonsAr: ['عقار رائج'],
      scoreBreakdown: {
        contentBased: 0,
        collaborative: 0,
        trending: score,
        diversity: 0,
      },
    });
  }

  // Popular in governorate (30%)
  for (let i = 0; i < popularInGovernorate.length; i++) {
    const propId = popularInGovernorate[i].id;
    const localScore = 1 - i / popularInGovernorate.length;
    const existing = recommendations.get(propId);

    if (existing) {
      existing.score += localScore * 0.3;
      existing.reasons.push('Popular in your area');
      existing.reasonsAr.push('شائع في منطقتك');
    } else {
      recommendations.set(propId, {
        propertyId: propId,
        score: localScore * 0.3,
        reasons: ['Popular in your area'],
        reasonsAr: ['شائع في منطقتك'],
        scoreBreakdown: {
          contentBased: 0,
          collaborative: 0,
          trending: localScore,
          diversity: 0,
        },
      });
    }
  }

  // Diversity (30%)
  for (let i = 0; i < diverseProperties.length; i++) {
    const propId = diverseProperties[i].id;
    const diversityScore = 1 - i / diverseProperties.length;
    const existing = recommendations.get(propId);

    if (existing) {
      existing.score += diversityScore * 0.3;
      existing.scoreBreakdown.diversity = diversityScore;
    } else {
      recommendations.set(propId, {
        propertyId: propId,
        score: diversityScore * 0.3,
        reasons: ['Discover new areas'],
        reasonsAr: ['اكتشف مناطق جديدة'],
        scoreBreakdown: {
          contentBased: 0,
          collaborative: 0,
          trending: 0,
          diversity: diversityScore,
        },
      });
    }
  }

  // ترتيب وإرجاع
  return Array.from(recommendations.values())
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

// ============================================
// Main Recommendation Function
// ============================================

/**
 * الحصول على التوصيات للمستخدم
 * @param profile ملف تعريف المستخدم
 * @param options خيارات التوصيات
 */
export async function getRecommendations(
  profile: UserProfile,
  options: RecommendationOptions = {}
): Promise<PropertyRecommendation[]> {
  const startTime = Date.now();
  const {
    limit = 20,
    includeViewed = false,
    includeFavorites = false,
    diversityRatio = 0.15,
  } = options;

  // التحقق من التخزين المؤقت
  const cached = getCachedRecommendations(profile.userId);
  if (cached) {
    console.log(`Recommendations served from cache for user ${profile.userId}`);
    return cached.slice(0, limit);
  }

  // التعامل مع Cold Start
  const isNewUser = profile.viewHistory.length < 3 && profile.favorites.length < 2;
  if (isNewUser) {
    const coldStartRecs = await getColdStartRecommendations(profile.governorate, limit);
    setCachedRecommendations(profile.userId, coldStartRecs);
    return coldStartRecs;
  }

  // 1. بناء تفضيلات المستخدم
  const preferences = await buildUserPreferences(profile);

  // 2. الحصول على توصيات Collaborative Filtering
  const collaborativeScores = await getCollaborativeRecommendations(profile);

  // 3. الحصول على درجات Trending
  const trendingScores = await getTrendingScores(profile.governorate);

  // 4. جلب العقارات المرشحة
  const excludeIds = new Set<string>();
  if (!includeViewed) {
    profile.viewHistory.forEach(v => excludeIds.add(v.propertyId));
  }
  if (!includeFavorites) {
    profile.favorites.forEach(f => excludeIds.add(f));
  }

  const candidateProperties = await prisma.property.findMany({
    where: {
      status: PropertyStatus.ACTIVE,
      id: { notIn: Array.from(excludeIds) },
    },
    take: 200,
    orderBy: { createdAt: 'desc' },
    include: {
      owner: {
        select: {
          id: true,
          fullName: true,
          avatar: true,
          rating: true,
        },
      },
    },
  });

  // 5. حساب الدرجات لكل عقار
  const recommendations: PropertyRecommendation[] = [];

  for (const property of candidateProperties) {
    // Content-Based Score (40%)
    const contentScore = calculateContentBasedScore(property, preferences);

    // Collaborative Score (25%)
    const collaborativeScore = collaborativeScores.get(property.id) || 0;

    // Trending Score (20%)
    const trendingScore = trendingScores.get(property.id) || 0;

    // Diversity Score (15%) - سيتم حسابه لاحقاً
    const diversityScore = 0.5; // قيمة افتراضية

    // الدرجة الإجمالية
    const totalScore =
      contentScore * RECOMMENDATION_WEIGHTS.contentBased +
      collaborativeScore * RECOMMENDATION_WEIGHTS.collaborative +
      trendingScore * RECOMMENDATION_WEIGHTS.trending +
      diversityScore * RECOMMENDATION_WEIGHTS.diversity;

    // بناء الأسباب
    const reasons: string[] = [];
    const reasonsAr: string[] = [];

    if (contentScore > 0.6) {
      reasons.push('Matches your preferences');
      reasonsAr.push('يتوافق مع تفضيلاتك');
    }
    if (collaborativeScore > 0.5) {
      reasons.push('Liked by similar users');
      reasonsAr.push('أعجب مستخدمين مشابهين');
    }
    if (trendingScore > 0.7) {
      reasons.push('Trending now');
      reasonsAr.push('رائج حالياً');
    }
    if (preferences.preferredGovernorates.has(property.governorate)) {
      reasons.push('In your preferred area');
      reasonsAr.push('في منطقتك المفضلة');
    }

    if (reasons.length === 0) {
      reasons.push('Recommended for you');
      reasonsAr.push('موصى به لك');
    }

    recommendations.push({
      propertyId: property.id,
      score: totalScore,
      reasons,
      reasonsAr,
      scoreBreakdown: {
        contentBased: contentScore,
        collaborative: collaborativeScore,
        trending: trendingScore,
        diversity: diversityScore,
      },
      property,
    });
  }

  // 6. ترتيب التوصيات
  recommendations.sort((a, b) => b.score - a.score);

  // 7. تطبيق التنويع
  const diversifiedRecommendations = applyDiversity(recommendations, diversityRatio);

  // 8. التخزين المؤقت
  const finalRecommendations = diversifiedRecommendations.slice(0, limit * 2);
  setCachedRecommendations(profile.userId, finalRecommendations);

  const executionTime = Date.now() - startTime;
  console.log(`Recommendations generated in ${executionTime}ms for user ${profile.userId}`);

  return finalRecommendations.slice(0, limit);
}

/**
 * إبطال التخزين المؤقت للمستخدم
 * @param userId معرف المستخدم
 */
export function invalidateUserCache(userId: string): void {
  recommendationCache.delete(userId);
}

/**
 * إبطال كل التخزين المؤقت
 */
export function invalidateAllCache(): void {
  recommendationCache.clear();
}

/**
 * الحصول على توصيات "مشابهة لهذا العقار"
 * @param propertyId معرف العقار
 * @param limit عدد النتائج
 */
export async function getSimilarPropertyRecommendations(
  propertyId: string,
  limit: number = 10
): Promise<PropertyRecommendation[]> {
  // جلب العقار المستهدف
  const targetProperty = await prisma.property.findUnique({
    where: { id: propertyId },
    include: {
      owner: {
        select: { id: true, fullName: true, avatar: true, rating: true },
      },
    },
  });

  if (!targetProperty) return [];

  // بناء ملف تعريف العقار
  const targetProfile: PropertySimilarityProfile = {
    id: targetProperty.id,
    propertyType: targetProperty.propertyType,
    governorate: targetProperty.governorate,
    city: targetProperty.city || undefined,
    area: targetProperty.areaSqm,
    price: targetProperty.salePrice || 0,
    bedrooms: targetProperty.bedrooms || undefined,
    bathrooms: targetProperty.bathrooms || undefined,
    finishingLevel: targetProperty.finishingLevel || undefined,
    features: extractFeatures(targetProperty.amenities),
    latitude: targetProperty.latitude || undefined,
    longitude: targetProperty.longitude || undefined,
  };

  // جلب العقارات المرشحة
  const candidates = await prisma.property.findMany({
    where: {
      status: PropertyStatus.ACTIVE,
      id: { not: propertyId },
      governorate: targetProperty.governorate,
    },
    take: 100,
    include: {
      owner: {
        select: { id: true, fullName: true, avatar: true, rating: true },
      },
    },
  });

  // بناء ملفات تعريف العقارات المرشحة
  const candidateProfiles: PropertySimilarityProfile[] = candidates.map(p => ({
    id: p.id,
    propertyType: p.propertyType,
    governorate: p.governorate,
    city: p.city || undefined,
    area: p.areaSqm,
    price: p.salePrice || 0,
    bedrooms: p.bedrooms || undefined,
    bathrooms: p.bathrooms || undefined,
    finishingLevel: p.finishingLevel || undefined,
    features: extractFeatures(p.amenities),
    latitude: p.latitude || undefined,
    longitude: p.longitude || undefined,
  }));

  // إيجاد العقارات المشابهة
  const similarResults = findSimilarProperties(targetProfile, candidateProfiles, limit);

  // بناء التوصيات
  const recommendations: PropertyRecommendation[] = [];

  for (const result of similarResults) {
    const property = candidates.find(p => p.id === result.id);
    if (!property) continue;

    const reasons: string[] = [];
    const reasonsAr: string[] = [];

    if (result.breakdown['location'] > 0.7) {
      reasons.push('Same area');
      reasonsAr.push('نفس المنطقة');
    }
    if (result.breakdown['propertyType'] > 0.8) {
      reasons.push('Same type');
      reasonsAr.push('نفس النوع');
    }
    if (result.breakdown['price'] > 0.7) {
      reasons.push('Similar price');
      reasonsAr.push('سعر مماثل');
    }
    if (result.breakdown['area'] > 0.8) {
      reasons.push('Similar size');
      reasonsAr.push('مساحة مماثلة');
    }

    recommendations.push({
      propertyId: result.id,
      score: result.score,
      reasons,
      reasonsAr,
      scoreBreakdown: {
        contentBased: result.score,
        collaborative: 0,
        trending: 0,
        diversity: 0,
      },
      property,
    });
  }

  return recommendations;
}

/**
 * استخراج المميزات من JSON
 * @param amenities كائن المرافق
 */
function extractFeatures(amenities: any): string[] {
  if (!amenities || typeof amenities !== 'object') return [];
  return Object.entries(amenities)
    .filter(([, value]) => value === true)
    .map(([key]) => key);
}

// ============================================
// Exports
// ============================================

export default {
  getRecommendations,
  getSimilarPropertyRecommendations,
  getColdStartRecommendations,
  invalidateUserCache,
  invalidateAllCache,
};
