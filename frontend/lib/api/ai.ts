/**
 * AI Features API Client
 * Connects frontend to AI backend endpoints
 */

import apiClient from './client';

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface PriceEstimationRequest {
  title: string;
  description?: string;
  categoryId: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  estimatedValue: number;
}

export interface PriceEstimationResponse {
  success: boolean;
  estimation: {
    estimatedPrice: number;
    confidence: number;
    priceRange: {
      min: number;
      max: number;
    };
    marketTrend: 'rising' | 'stable' | 'declining';
    comparableItems: number;
  };
  warning?: string;
  suggestion?: string;
}

export interface CategorySuggestion {
  id: string;
  name: string;
  confidence: number;
  parentCategory?: string;
  grandParentCategory?: string;  // For 3-level hierarchy
  fullPath?: string;  // Full path like "Mobiles ← Samsung ← Galaxy S23"
}

export interface CategorizationRequest {
  title: string;
  description?: string;
}

export interface CategorizationResponse {
  success: boolean;
  category: CategorySuggestion;
  alternatives: CategorySuggestion[];
}

export interface FraudCheckRequest {
  title: string;
  description: string;
  price: number;
  categoryId: string;
  images: string[];
  sellerId?: string;
}

export interface FraudCheckResponse {
  success: boolean;
  fraudScore: number; // 0-1
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  flags: string[];
  recommendation: 'APPROVED' | 'REVIEW_REQUIRED' | 'REJECTED';
  details: {
    priceDeviation?: number;
    suspiciousKeywords?: string[];
    imageCount: number;
  };
}

export interface BarterMatch {
  matchId: string;
  score: number;
  partnerId: string;
  partnerName: string;
  offeredItemId: string;
  offeredItemTitle: string;
  requestedItemId: string;
  requestedItemTitle: string;
  reason: string;
  successProbability: number;
}

export interface SmartSearchRequest {
  query: string;
  language?: 'ar' | 'en';
}

export interface SmartSearchResponse {
  success: boolean;
  terms: {
    original: string;
    expanded: string[];
    synonyms: string[];
    arabicTerms?: string[];
  };
}

// ============================================
// PRICE ESTIMATION
// ============================================

/**
 * Get AI price estimation for an item
 */
export async function estimatePrice(data: PriceEstimationRequest): Promise<PriceEstimationResponse> {
  try {
    const response = await apiClient.post('/ai/estimate-price', data);
    return response.data;
  } catch (error: any) {
    console.error('Price estimation error:', error);
    return {
      success: false,
      estimation: {
        estimatedPrice: data.estimatedValue,
        confidence: 0,
        priceRange: { min: 0, max: 0 },
        marketTrend: 'stable',
        comparableItems: 0,
      },
      warning: 'Unable to estimate price at this time',
    };
  }
}

/**
 * Validate if a price is reasonable
 */
export async function validatePrice(
  categoryId: string,
  price: number,
  condition: string
): Promise<{ valid: boolean; message?: string; suggestion?: string }> {
  try {
    const response = await apiClient.post('/ai/validate-price', {
      categoryId,
      price,
      condition,
    });
    return response.data;
  } catch (error) {
    console.error('Price validation error:', error);
    return { valid: true }; // Fail open - don't block user
  }
}

/**
 * Get price trends for a category
 */
export async function getPriceTrends(categoryId: string) {
  try {
    const response = await apiClient.get(`/ai/price-trends/${categoryId}`);
    return response.data;
  } catch (error) {
    console.error('Price trends error:', error);
    return null;
  }
}

// ============================================
// AUTO-CATEGORIZATION
// ============================================

/**
 * Get AI category suggestion based on title/description
 */
export async function categorizeItem(data: CategorizationRequest): Promise<CategorizationResponse | null> {
  try {
    const response = await apiClient.post('/ai/categorize', data);
    return response.data;
  } catch (error) {
    console.error('Categorization error:', error);
    return null;
  }
}

/**
 * Get category suggestions as user types
 */
export async function getCategorySuggestions(query: string): Promise<CategorySuggestion[]> {
  try {
    const response = await apiClient.get('/ai/categorize/suggestions', {
      params: { query },
    });
    return response.data.suggestions || [];
  } catch (error) {
    console.error('Category suggestions error:', error);
    return [];
  }
}

/**
 * Batch categorize multiple items
 */
export async function categorizeItems(items: CategorizationRequest[]): Promise<CategorizationResponse[]> {
  try {
    const response = await apiClient.post('/ai/categorize/batch', { items });
    return response.data.results || [];
  } catch (error) {
    console.error('Batch categorization error:', error);
    return [];
  }
}

// ============================================
// FRAUD DETECTION
// ============================================

/**
 * Check a listing for fraud indicators
 */
export async function checkListing(data: FraudCheckRequest): Promise<FraudCheckResponse | null> {
  try {
    const response = await apiClient.post('/ai/check-listing', data);
    return response.data;
  } catch (error) {
    console.error('Fraud check error:', error);
    return null;
  }
}

/**
 * Check user behavior for suspicious patterns (requires auth)
 */
export async function checkUserBehavior(userId: string) {
  try {
    const response = await apiClient.get(`/ai/check-user/${userId}`);
    return response.data;
  } catch (error) {
    console.error('User behavior check error:', error);
    return null;
  }
}

/**
 * Check transaction for fraud (requires auth)
 */
export async function checkTransaction(data: any) {
  try {
    const response = await apiClient.post('/ai/check-transaction', data);
    return response.data;
  } catch (error) {
    console.error('Transaction check error:', error);
    return null;
  }
}

// ============================================
// SMART SEARCH
// ============================================

/**
 * Get smart search terms with Arabic/English expansion
 */
export async function getSearchTerms(query: string, language?: 'ar' | 'en'): Promise<SmartSearchResponse | null> {
  try {
    const response = await apiClient.get('/ai/search-terms', {
      params: { query, language },
    });
    return response.data;
  } catch (error) {
    console.error('Smart search error:', error);
    return null;
  }
}

// ============================================
// BARTER RANKING & RECOMMENDATIONS
// ============================================

/**
 * Rank a barter cycle (requires auth)
 */
export async function rankBarterCycle(cycle: any) {
  try {
    const response = await apiClient.post('/ai/rank-barter-cycle', { cycle });
    return response.data;
  } catch (error) {
    console.error('Barter ranking error:', error);
    return null;
  }
}

/**
 * Rank multiple barter cycles (requires auth)
 */
export async function rankBarterCycles(cycles: any[]) {
  try {
    const response = await apiClient.post('/ai/rank-barter-cycles', { cycles });
    return response.data;
  } catch (error) {
    console.error('Multiple barter ranking error:', error);
    return null;
  }
}

/**
 * Get personalized barter recommendations (requires auth)
 */
export async function getBarterRecommendations(userId: string): Promise<BarterMatch[]> {
  try {
    const response = await apiClient.get(`/ai/barter-recommendations/${userId}`);
    return response.data.recommendations || [];
  } catch (error) {
    console.error('Barter recommendations error:', error);
    return [];
  }
}

// ============================================
// AI STATUS
// ============================================

/**
 * Get AI features status
 */
export async function getAIStatus() {
  try {
    const response = await apiClient.get('/ai/status');
    return response.data;
  } catch (error) {
    console.error('AI status error:', error);
    return {
      success: false,
      features: {},
    };
  }
}

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Check if price is within reasonable range
 */
export function isPriceReasonable(
  price: number,
  estimation: PriceEstimationResponse
): { reasonable: boolean; message?: string } {
  if (!estimation.success) {
    return { reasonable: true }; // Can't determine, allow it
  }

  const { min, max } = estimation.estimation.priceRange;
  const deviation = ((price - estimation.estimation.estimatedPrice) / estimation.estimation.estimatedPrice) * 100;

  if (price < min) {
    return {
      reasonable: false,
      message: `Price seems too low. Similar items: ${min.toLocaleString()}-${max.toLocaleString()} EGP`,
    };
  }

  if (price > max) {
    return {
      reasonable: false,
      message: `Price seems too high. Similar items: ${min.toLocaleString()}-${max.toLocaleString()} EGP`,
    };
  }

  if (Math.abs(deviation) > 30) {
    return {
      reasonable: false,
      message: `Price differs significantly from market average (${estimation.estimation.estimatedPrice.toLocaleString()} EGP)`,
    };
  }

  return { reasonable: true };
}

/**
 * Get risk level color for UI
 */
export function getRiskLevelColor(riskLevel: 'LOW' | 'MEDIUM' | 'HIGH'): string {
  switch (riskLevel) {
    case 'LOW':
      return 'green';
    case 'MEDIUM':
      return 'yellow';
    case 'HIGH':
      return 'red';
    default:
      return 'gray';
  }
}

/**
 * Format match score for display
 */
export function formatMatchScore(score: number): string {
  const percentage = Math.round(score * 100);
  if (percentage >= 90) return `${percentage}% ⭐⭐⭐`;
  if (percentage >= 75) return `${percentage}% ⭐⭐`;
  if (percentage >= 60) return `${percentage}% ⭐`;
  return `${percentage}%`;
}
