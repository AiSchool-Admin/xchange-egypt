import apiClient from './client';

// ============================================
// Comparison API Client
// عميل API المقارنة
// ============================================

export interface ComparisonField {
  field: string;
  labelAr: string;
  labelEn: string;
  values: (string | number | boolean | null)[];
}

export interface ComparisonItem {
  id: string;
  title: string;
  images?: Array<{ url: string }>;
  estimatedValue?: number;
  condition: string;
  governorate?: string;
  seller?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating?: number;
  };
  category?: {
    nameAr: string;
    nameEn: string;
  };
}

export interface Comparison {
  id: string;
  title: string | null;
  items: ComparisonItem[];
  comparisonFields: ComparisonField[];
  shareCode: string | null;
  createdAt: string;
}

export interface ComparisonListItem {
  id: string;
  title: string | null;
  itemIds: string[];
  isPublic: boolean;
  shareCode: string | null;
  createdAt: string;
  itemPreviews: Array<{
    id: string;
    title: string;
    images?: Array<{ url: string }>;
    estimatedValue?: number;
  }>;
}

export interface CreateComparisonData {
  itemIds: string[];
  title?: string;
  categorySlug?: string;
  isPublic?: boolean;
}

export interface UpdateComparisonData {
  title?: string;
  itemIds?: string[];
  isPublic?: boolean;
}

// Create a new comparison
export const createComparison = async (data: CreateComparisonData): Promise<{ success: boolean; data: Comparison }> => {
  const response = await apiClient.post('/comparisons', data);
  return response.data;
};

// Get comparison by ID
export const getComparison = async (id: string): Promise<{ success: boolean; data: Comparison }> => {
  const response = await apiClient.get(`/comparisons/${id}`);
  return response.data;
};

// Get comparison by share code (public)
export const getComparisonByShareCode = async (shareCode: string): Promise<{ success: boolean; data: Comparison }> => {
  const response = await apiClient.get(`/comparisons/share/${shareCode}`);
  return response.data;
};

// Get user's comparisons
export const getMyComparisons = async (params?: {
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data: {
    comparisons: ComparisonListItem[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`/comparisons/my?${queryParams.toString()}`);
  return response.data;
};

// Update comparison
export const updateComparison = async (id: string, data: UpdateComparisonData): Promise<{ success: boolean; data: Comparison }> => {
  const response = await apiClient.put(`/comparisons/${id}`, data);
  return response.data;
};

// Delete comparison
export const deleteComparison = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/comparisons/${id}`);
  return response.data;
};
