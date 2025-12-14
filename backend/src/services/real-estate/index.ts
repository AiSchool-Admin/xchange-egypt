/**
 * @fileoverview تصدير خدمات سوق العقارات
 * @description نقطة الدخول الرئيسية لجميع خدمات العقارات المتقدمة
 * @author Xchange Real Estate
 * @version 1.0.0
 */

// ============================================
// خوارزمية التسعير العقاري
// ============================================
export {
  estimatePropertyValue,
  updateRegionalPrices,
  type PropertyInput,
  type PriceEstimate,
  type PropertyCondition,
  type ComparableProperty,
} from './pricing-algorithm';

// ============================================
// نظام المقايضة متعدد الأطراف
// ============================================
export {
  BarterMatcher,
  getBarterMatcher,
  initializeBarterMatcher,
  type BarterChain,
  type ChainParticipant,
  type CashFlow,
  type MatchResult,
  type MatchOptions,
} from './barter-matcher';

export {
  BarterGraph,
  type BarterOffer,
  type BarterItem,
  type BarterItemType,
  type GraphNode,
  type GraphEdge,
  type GraphCycle,
  type SearchCriteria,
} from './barter-graph';

// ============================================
// محرك التوصيات الذكي
// ============================================
export {
  getRecommendations,
  getSimilarPropertyRecommendations,
  getColdStartRecommendations,
  invalidateUserCache,
  invalidateAllCache,
  type UserProfile,
  type ViewRecord,
  type SavedSearchCriteria,
  type PropertyRecommendation,
  type RecommendationOptions,
} from './recommendation-engine';

// ============================================
// خوارزميات التشابه
// ============================================
export {
  jaccardSimilarity,
  calculateUserSimilarity,
  calculatePropertySimilarity,
  findSimilarUsers,
  findSimilarProperties,
  calculateHaversineDistance,
  calculateNumericSimilarity,
  cosineSimilarity,
  propertyToVector,
  type UserSimilarityProfile,
  type PropertySimilarityProfile,
  type SimilarityResult,
} from './similarity';

// ============================================
// Default Export
// ============================================
import pricingAlgorithm from './pricing-algorithm';
import barterMatcher from './barter-matcher';
import recommendationEngine from './recommendation-engine';
import similarity from './similarity';

export default {
  pricing: pricingAlgorithm,
  barter: barterMatcher,
  recommendations: recommendationEngine,
  similarity,
};
