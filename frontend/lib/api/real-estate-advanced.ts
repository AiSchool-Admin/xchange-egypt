import api from './client';

// ============================================
// Real Estate Advanced API - خوارزميات سوق العقارات المتقدمة
// ============================================

// ============================================
// Types - أنواع البيانات
// ============================================

export type PropertyType =
  | 'APARTMENT'
  | 'VILLA'
  | 'DUPLEX'
  | 'PENTHOUSE'
  | 'STUDIO'
  | 'CHALET'
  | 'TOWNHOUSE'
  | 'TWIN_HOUSE'
  | 'LAND'
  | 'COMMERCIAL'
  | 'OFFICE'
  | 'RETAIL'
  | 'WAREHOUSE'
  | 'BUILDING';

export type PropertyCondition = 'NEW' | 'EXCELLENT' | 'GOOD' | 'FAIR' | 'NEEDS_RENOVATION';

export type MarketDemand = 'HIGH' | 'MEDIUM' | 'LOW';

// Arabic translations
export const PROPERTY_TYPE_AR: Record<PropertyType, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  DUPLEX: 'دوبلكس',
  PENTHOUSE: 'بنتهاوس',
  STUDIO: 'ستوديو',
  CHALET: 'شاليه',
  TOWNHOUSE: 'تاون هاوس',
  TWIN_HOUSE: 'توين هاوس',
  LAND: 'أرض',
  COMMERCIAL: 'تجاري',
  OFFICE: 'مكتب',
  RETAIL: 'محل',
  WAREHOUSE: 'مخزن',
  BUILDING: 'عمارة',
};

export const PROPERTY_CONDITION_AR: Record<PropertyCondition, string> = {
  NEW: 'جديد',
  EXCELLENT: 'ممتاز',
  GOOD: 'جيد',
  FAIR: 'مقبول',
  NEEDS_RENOVATION: 'يحتاج تجديد',
};

export const MARKET_DEMAND_AR: Record<MarketDemand, string> = {
  HIGH: 'مرتفع',
  MEDIUM: 'متوسط',
  LOW: 'منخفض',
};

// ============================================
// AVM - Automated Valuation Model
// ============================================

export interface PropertyInput {
  propertyType: PropertyType;
  area: number;
  governorate: string;
  city?: string;
  district?: string;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  buildYear?: number;
  condition?: PropertyCondition;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasSecurity?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasBalcony?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface ComparableProperty {
  id: string;
  price: number;
  pricePerMeter: number;
  area: number;
  governorate: string;
  city?: string;
  distance?: number;
  similarity: number;
  adjustedPrice: number;
}

export interface PriceBreakdown {
  basePrice: number;
  locationAdjustment: number;
  ageAdjustment: number;
  conditionAdjustment: number;
  featuresAdjustment: number;
  marketTrendAdjustment: number;
}

export interface PriceEstimate {
  estimatedPrice: number;
  pricePerMeter: number;
  confidence: number;
  priceRange: {
    min: number;
    max: number;
  };
  comparables: ComparableProperty[];
  marketDemand: MarketDemand;
  breakdown: PriceBreakdown;
}

// Estimate property value using AVM
export async function estimatePropertyValue(input: PropertyInput): Promise<PriceEstimate> {
  const response = await api.post('/real-estate/advanced/pricing/estimate', input);
  return response.data.data || response.data;
}

// Get price history for a property
export async function getPriceHistory(propertyId: string): Promise<{
  history: Array<{ date: string; price: number; source: string }>;
  trend: 'UP' | 'DOWN' | 'STABLE';
  averageChange: number;
}> {
  const response = await api.get(`/real-estate/advanced/pricing/history/${propertyId}`);
  return response.data.data || response.data;
}

// Get market trends
export async function getMarketTrends(filters?: {
  governorate?: string;
  city?: string;
  propertyType?: PropertyType;
  period?: 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
}): Promise<{
  trends: Array<{
    period: string;
    averagePrice: number;
    transactionCount: number;
    priceChange: number;
  }>;
  forecast: {
    nextMonth: number;
    nextQuarter: number;
    confidence: number;
  };
}> {
  const params = new URLSearchParams();
  if (filters?.governorate) params.append('governorate', filters.governorate);
  if (filters?.city) params.append('city', filters.city);
  if (filters?.propertyType) params.append('propertyType', filters.propertyType);
  if (filters?.period) params.append('period', filters.period);

  const response = await api.get(`/real-estate/advanced/pricing/trends?${params.toString()}`);
  return response.data.data || response.data;
}

// ============================================
// Multi-Party Barter Matching - المقايضة متعددة الأطراف
// ============================================

export interface BarterProperty {
  id: string;
  title: string;
  price: number;
  propertyType: PropertyType;
  governorate: string;
  city?: string;
  area: number;
  images?: string[];
  ownerId: string;
  ownerName?: string;
}

export interface BarterChain {
  chainId: string;
  participants: Array<{
    userId: string;
    userName?: string;
    givesProperty: BarterProperty;
    receivesProperty: BarterProperty;
    cashFlow: number;
  }>;
  totalValue: number;
  cashRequired: number;
  fairnessScore: number;
  feasibilityScore: number;
  score: number;
}

export interface BarterMatch {
  type: 'DIRECT' | 'THREE_WAY' | 'FOUR_WAY' | 'MULTI_PARTY';
  chain: BarterChain;
  validUntil: string;
}

// Find barter matches for a property
export async function findBarterMatches(propertyId: string, options?: {
  maxChainLength?: number;
  maxCashDifference?: number;
  preferredGovernorate?: string;
  preferredPropertyTypes?: PropertyType[];
}): Promise<{
  directMatches: BarterMatch[];
  multiPartyMatches: BarterMatch[];
  totalMatches: number;
}> {
  const response = await api.post(`/real-estate/advanced/barter/matches/${propertyId}`, options || {});
  return response.data.data || response.data;
}

// Get suggested barter opportunities
export async function getBarterSuggestions(userId: string, limit?: number): Promise<{
  suggestions: BarterMatch[];
  potentialSavings: number;
}> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());

  const response = await api.get(`/real-estate/advanced/barter/suggestions/${userId}?${params.toString()}`);
  return response.data.data || response.data;
}

// Validate a barter chain
export async function validateBarterChain(chainId: string): Promise<{
  isValid: boolean;
  errors: string[];
  warnings: string[];
  estimatedCompletionTime: number;
}> {
  const response = await api.get(`/real-estate/advanced/barter/validate/${chainId}`);
  return response.data.data || response.data;
}

// Initiate barter chain
export async function initiateBarterChain(chainId: string): Promise<{
  success: boolean;
  transactionId: string;
  nextSteps: string[];
}> {
  const response = await api.post(`/real-estate/advanced/barter/initiate/${chainId}`);
  return response.data.data || response.data;
}

// ============================================
// AI Recommendations - التوصيات الذكية
// ============================================

export interface RecommendedProperty {
  id: string;
  title: string;
  price: number;
  pricePerMeter?: number;
  propertyType: PropertyType;
  governorate: string;
  city?: string;
  district?: string;
  area: number;
  bedrooms?: number;
  bathrooms?: number;
  images: string[];
  matchScore: number;
  matchReasons: string[];
  source: 'CONTENT_BASED' | 'COLLABORATIVE' | 'TRENDING' | 'DISCOVERY';
}

export interface RecommendationsResponse {
  recommendations: RecommendedProperty[];
  totalCount: number;
  diversityScore: number;
  lastUpdated: string;
}

// Get personalized recommendations
export async function getRecommendations(options?: {
  limit?: number;
  excludeViewed?: boolean;
  includeReasons?: boolean;
  diversityWeight?: number;
}): Promise<RecommendationsResponse> {
  const params = new URLSearchParams();
  if (options?.limit) params.append('limit', options.limit.toString());
  if (options?.excludeViewed !== undefined) params.append('excludeViewed', options.excludeViewed.toString());
  if (options?.includeReasons !== undefined) params.append('includeReasons', options.includeReasons.toString());
  if (options?.diversityWeight) params.append('diversityWeight', options.diversityWeight.toString());

  const response = await api.get(`/real-estate/advanced/recommendations?${params.toString()}`);
  return response.data.data || response.data;
}

// Get similar properties
export async function getSimilarProperties(propertyId: string, limit?: number): Promise<{
  similarProperties: RecommendedProperty[];
}> {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());

  const response = await api.get(`/real-estate/advanced/recommendations/similar/${propertyId}?${params.toString()}`);
  return response.data.data || response.data;
}

// Record property view (for collaborative filtering)
export async function recordPropertyView(propertyId: string): Promise<void> {
  await api.post(`/real-estate/advanced/recommendations/view/${propertyId}`);
}

// Get trending properties
export async function getTrendingProperties(filters?: {
  governorate?: string;
  propertyType?: PropertyType;
  limit?: number;
}): Promise<{
  trending: RecommendedProperty[];
}> {
  const params = new URLSearchParams();
  if (filters?.governorate) params.append('governorate', filters.governorate);
  if (filters?.propertyType) params.append('propertyType', filters.propertyType);
  if (filters?.limit) params.append('limit', filters.limit.toString());

  const response = await api.get(`/real-estate/advanced/recommendations/trending?${params.toString()}`);
  return response.data.data || response.data;
}

// ============================================
// User Preferences - تفضيلات المستخدم
// ============================================

export interface UserPreferences {
  preferredGovernorate?: string[];
  preferredPropertyTypes?: PropertyType[];
  budgetMin?: number;
  budgetMax?: number;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  mustHaveFeatures?: string[];
  dealBreakers?: string[];
}

// Save user preferences
export async function saveUserPreferences(preferences: UserPreferences): Promise<void> {
  await api.post('/real-estate/advanced/preferences', preferences);
}

// Get user preferences
export async function getUserPreferences(): Promise<UserPreferences> {
  const response = await api.get('/real-estate/advanced/preferences');
  return response.data.data || response.data;
}

// ============================================
// Export default
// ============================================

export default {
  // AVM
  estimatePropertyValue,
  getPriceHistory,
  getMarketTrends,
  // Barter
  findBarterMatches,
  getBarterSuggestions,
  validateBarterChain,
  initiateBarterChain,
  // Recommendations
  getRecommendations,
  getSimilarProperties,
  recordPropertyView,
  getTrendingProperties,
  // Preferences
  saveUserPreferences,
  getUserPreferences,
};
