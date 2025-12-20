/**
 * Advanced AI Features API Client
 * عميل API للخدمات المتقدمة للذكاء الاصطناعي
 */

import apiClient from './client';

// ============================================
// Types
// ============================================

export interface PsychologicalPrice {
  original: number;
  optimized: number;
  strategy: string;
  confidence: number;
  displayFormats: {
    type: string;
    value: string;
    valueAr: string;
    appeal: number;
  }[];
  urgencyCue?: string;
  culturalNote?: string;
}

export interface BuyerPersona {
  type: string;
  description: string;
  descriptionAr: string;
  recommendedApproach: string;
  recommendedApproachAr: string;
}

export interface PricingAnalysis {
  recommendations: PsychologicalPrice[];
  optimalPricePoint: number;
  priceElasticity: 'ELASTIC' | 'INELASTIC' | 'UNIT_ELASTIC';
  buyerPersona: BuyerPersona;
  competitorPrices: number[];
}

export interface AuthenticityReport {
  overallScore: number;
  verdict: 'AUTHENTIC' | 'SUSPICIOUS' | 'LIKELY_FAKE' | 'INCONCLUSIVE';
  confidence: number;
  qualityScore: number;
  riskFactors: RiskFactor[];
  recommendations: AuthenticityRecommendation[];
  brandAnalysis?: BrandAnalysis;
}

export interface RiskFactor {
  type: 'HIGH' | 'MEDIUM' | 'LOW';
  factor: string;
  factorAr: string;
  description: string;
  descriptionAr: string;
}

export interface AuthenticityRecommendation {
  priority: string;
  action: string;
  actionAr: string;
  reason: string;
  reasonAr: string;
}

export interface BrandAnalysis {
  detectedBrand?: string;
  logoAuthenticity: number;
  labelConsistency: number;
  packagingScore: number;
  serialNumberFormat: 'VALID' | 'INVALID' | 'NOT_FOUND';
}

export interface SellerDashboard {
  overview: OverviewMetrics;
  salesPerformance: SalesPerformance;
  inventoryHealth: InventoryHealth;
  buyerInsights: BuyerInsights;
  competitionAnalysis: CompetitionAnalysis;
  recommendations: SellerRecommendation[];
  forecast: RevenueForecast;
}

export interface OverviewMetrics {
  totalRevenue: number;
  revenueChange: number;
  totalSales: number;
  salesChange: number;
  averageOrderValue: number;
  aovChange: number;
  conversionRate: number;
  conversionChange: number;
  activeListings: number;
  pendingOrders: number;
  rating: number;
  responseTime: number;
}

export interface SalesPerformance {
  byPeriod: { period: string; revenue: number; sales: number; avgPrice: number }[];
  byCategory: { categoryId: string; categoryName: string; revenue: number; sales: number; percentage: number }[];
  byDayOfWeek: { day: string; sales: number; revenue: number }[];
  byTimeOfDay: { hour: number; sales: number; percentage: number }[];
  topItems: { itemId: string; title: string; sales: number; revenue: number; avgTimeToSell: number }[];
  bestSellingHours: string[];
  bestSellingDays: string[];
}

export interface InventoryHealth {
  totalItems: number;
  activeItems: number;
  soldItems: number;
  staleItems: number;
  staleness: number;
  avgDaysToSell: number;
  turnoverRate: number;
  stockAgingDistribution: { range: string; count: number; percentage: number }[];
  relistingSuggestions: { itemId: string; title: string; daysListed: number; views: number; suggestion: string; suggestionAr: string }[];
}

export interface BuyerInsights {
  totalBuyers: number;
  repeatBuyers: number;
  repeatRate: number;
  topBuyerLocations: { location: string; buyers: number; revenue: number }[];
  buyerDemographics: { segment: string; count: number; avgSpend: number }[];
  communicationMetrics: { avgResponseTime: number; responseRate: number; messagesReceived: number; conversationsConverted: number };
  satisfaction: { rating: number; reviewCount: number; positivePercentage: number; commonCompliments: string[]; commonConcerns: string[] };
}

export interface CompetitionAnalysis {
  marketPosition: 'LEADER' | 'CHALLENGER' | 'FOLLOWER' | 'NICHER';
  pricePositioning: number;
  competitorCount: number;
  marketShare: number;
  strengthsVsCompetitors: string[];
  weaknessesVsCompetitors: string[];
  opportunities: string[];
  competitorPricing: { categoryName: string; yourAvgPrice: number; marketAvgPrice: number; difference: number }[];
}

export interface SellerRecommendation {
  id: string;
  type: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  potentialImpact: string;
  potentialImpactAr: string;
  action: string;
  actionAr: string;
  estimatedRevenueLift?: number;
}

export interface RevenueForecast {
  nextWeek: number;
  nextMonth: number;
  nextQuarter: number;
  confidence: number;
  trend: 'UP' | 'DOWN' | 'STABLE';
  factors: { factor: string; factorAr: string; impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL' }[];
}

// ============================================
// Psychological Pricing API
// ============================================

export async function generatePsychologicalPrices(
  categoryId: string,
  condition: string,
  basePrice: number
): Promise<PricingAnalysis> {
  const response = await apiClient.post('/ai-advanced/pricing/psychological', {
    categoryId,
    condition,
    basePrice,
  });
  return response.data.data;
}

export async function getQuickPsychologicalPrice(
  basePrice: number,
  categoryType?: string
): Promise<{ optimized: number; strategy: string; tip: string; tipAr: string }> {
  const response = await apiClient.post('/ai-advanced/pricing/quick', {
    basePrice,
    categoryType,
  });
  return response.data.data;
}

export async function getPricingAnalysis(categoryId: string): Promise<{
  categoryId: string;
  buyerPersona: BuyerPersona;
  priceElasticity: string;
  competitorPrices: number[];
}> {
  const response = await apiClient.get(`/ai-advanced/pricing/analysis/${categoryId}`);
  return response.data.data;
}

// ============================================
// Seller Intelligence API
// ============================================

export async function getSellerDashboard(
  period: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' = 'MONTH'
): Promise<SellerDashboard> {
  const response = await apiClient.get(`/ai-advanced/seller/dashboard?period=${period}`);
  return response.data.data;
}

export async function getQuickSellerStats(): Promise<{
  revenue: number;
  sales: number;
  activeListings: number;
  rating: number;
  pendingOrders: number;
}> {
  const response = await apiClient.get('/ai-advanced/seller/quick-stats');
  return response.data.data;
}

export async function getSalesPerformance(
  period: 'WEEK' | 'MONTH' | 'QUARTER' | 'YEAR' = 'MONTH'
): Promise<SalesPerformance> {
  const response = await apiClient.get(`/ai-advanced/seller/performance?period=${period}`);
  return response.data.data;
}

export async function getInventoryHealth(): Promise<InventoryHealth> {
  const response = await apiClient.get('/ai-advanced/seller/inventory-health');
  return response.data.data;
}

export async function getBuyerInsights(): Promise<BuyerInsights> {
  const response = await apiClient.get('/ai-advanced/seller/buyer-insights');
  return response.data.data;
}

export async function getCompetitionAnalysis(): Promise<CompetitionAnalysis> {
  const response = await apiClient.get('/ai-advanced/seller/competition');
  return response.data.data;
}

export async function getSellerRecommendations(): Promise<SellerRecommendation[]> {
  const response = await apiClient.get('/ai-advanced/seller/recommendations');
  return response.data.data;
}

export async function getRevenueForecast(): Promise<RevenueForecast> {
  const response = await apiClient.get('/ai-advanced/seller/forecast');
  return response.data.data;
}

// ============================================
// Visual Authenticity API
// ============================================

export async function analyzeAuthenticity(
  itemId: string,
  imageUrls?: string[],
  categoryType?: string
): Promise<AuthenticityReport> {
  const response = await apiClient.post('/ai-advanced/authenticity/analyze', {
    itemId,
    imageUrls,
    categoryType,
  });
  return response.data.data;
}

export async function quickAuthenticityCheck(imageUrl: string): Promise<{
  score: number;
  verdict: 'PASS' | 'REVIEW' | 'FAIL';
  issues: string[];
}> {
  const response = await apiClient.post('/ai-advanced/authenticity/quick-check', {
    imageUrl,
  });
  return response.data.data;
}

export async function getAuthenticityReport(itemId: string): Promise<AuthenticityReport> {
  const response = await apiClient.get(`/ai-advanced/authenticity/report/${itemId}`);
  return response.data.data;
}

export async function verifyBrand(
  itemId?: string,
  imageUrls?: string[],
  brandName?: string
): Promise<{
  brandAnalysis: BrandAnalysis;
  verdict: string;
  confidence: number;
}> {
  const response = await apiClient.post('/ai-advanced/authenticity/brand-verify', {
    itemId,
    imageUrls,
    brandName,
  });
  return response.data.data;
}

// ============================================
// Combined Insights
// ============================================

export async function getItemInsights(itemId: string): Promise<{
  itemId: string;
  authenticity: {
    score: number;
    verdict: string;
    confidence: number;
    riskFactors: RiskFactor[];
  };
  pricing: { optimized: number; strategy: string; tip: string; tipAr: string };
  recommendations: AuthenticityRecommendation[];
}> {
  const response = await apiClient.get(`/ai-advanced/insights/${itemId}`);
  return response.data.data;
}

export async function getAdvancedAiStatus(): Promise<{
  features: {
    psychologicalPricing: { status: string; version: string; description: string; descriptionAr: string };
    sellerIntelligence: { status: string; version: string; description: string; descriptionAr: string };
    visualAuthenticity: { status: string; version: string; description: string; descriptionAr: string };
  };
  lastUpdated: string;
}> {
  const response = await apiClient.get('/ai-advanced/status');
  return response.data.data;
}
