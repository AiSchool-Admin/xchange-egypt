import apiClient from './client';

// ============================================
// Types
// ============================================

export interface AIListingDraft {
  id: string;
  userId: string;
  sourceType: 'IMAGE' | 'VOICE' | 'TEXT';
  sourceUrl?: string;
  sourceText?: string;
  generatedTitle?: string;
  generatedDesc?: string;
  generatedCategory?: string;
  generatedTags: string[];
  estimatedPrice?: number;
  confidence?: number;
  detectedBrand?: string;
  detectedModel?: string;
  detectedCondition?: string;
  detectedColor?: string;
  status: 'DRAFT' | 'PUBLISHED' | 'DISCARDED';
  publishedItemId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIAnalysisResult {
  title: string;
  description: string;
  category: string;
  tags: string[];
  estimatedPrice: number;
  condition: string;
  brand?: string;
  model?: string;
  color?: string;
  confidence: number;
  draftId: string;
}

export interface PriceSuggestion {
  min: number;
  max: number;
  avg: number;
  count: number;
}

// ============================================
// API Functions
// ============================================

export const analyzeImage = async (imageUrl: string) => {
  const response = await apiClient.post('/ai-listing/analyze-image', { imageUrl });
  return response.data;
};

export const analyzeText = async (text: string) => {
  const response = await apiClient.post('/ai-listing/analyze-text', { text });
  return response.data;
};

export const getDrafts = async (status?: string) => {
  const response = await apiClient.get('/ai-listing/drafts', {
    params: { status },
  });
  return response.data;
};

export const getDraft = async (id: string) => {
  const response = await apiClient.get(`/ai-listing/drafts/${id}`);
  return response.data;
};

export const updateDraft = async (id: string, data: Partial<AIListingDraft>) => {
  const response = await apiClient.put(`/ai-listing/drafts/${id}`, data);
  return response.data;
};

export const publishDraft = async (id: string) => {
  const response = await apiClient.post(`/ai-listing/drafts/${id}/publish`);
  return response.data;
};

export const discardDraft = async (id: string) => {
  const response = await apiClient.delete(`/ai-listing/drafts/${id}`);
  return response.data;
};

export const getPriceSuggestion = async (category: string, condition?: string) => {
  const response = await apiClient.get('/ai-listing/price-suggestion', {
    params: { category, condition },
  });
  return response.data;
};
