// ============================================
// Services API - Service Marketplace Endpoints
// ============================================

import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  Service,
  ServiceCategory,
  ServiceSearchParams,
  ServiceRecommendation,
  LinkedMarketplace,
} from '../../types';

export const servicesApi = {
  // ============================
  // Categories
  // ============================

  // Get all categories
  getCategories: async (): Promise<ApiResponse<ServiceCategory[]>> => {
    try {
      const response = await apiClient.get('/services/categories');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch categories' },
      };
    }
  },

  // Get category by ID or slug
  getCategory: async (idOrSlug: string): Promise<ApiResponse<ServiceCategory>> => {
    try {
      const response = await apiClient.get(`/services/categories/${idOrSlug}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch category' },
      };
    }
  },

  // Get categories by marketplace
  getCategoriesByMarketplace: async (marketplace: LinkedMarketplace): Promise<ApiResponse<ServiceCategory[]>> => {
    try {
      const response = await apiClient.get(`/services/categories/marketplace/${marketplace}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch categories' },
      };
    }
  },

  // ============================
  // Services
  // ============================

  // Search services
  searchServices: async (params: ServiceSearchParams): Promise<ApiResponse<PaginatedResponse<Service>>> => {
    try {
      const response = await apiClient.get('/services/search', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to search services' },
      };
    }
  },

  // Get service by ID
  getService: async (serviceId: string): Promise<ApiResponse<Service>> => {
    try {
      const response = await apiClient.get(`/services/${serviceId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch service' },
      };
    }
  },

  // Get featured services
  getFeaturedServices: async (limit?: number): Promise<ApiResponse<Service[]>> => {
    try {
      const response = await apiClient.get('/services/featured', { params: { limit } });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch featured services' },
      };
    }
  },

  // Get services by category
  getServicesByCategory: async (
    categoryId: string,
    params?: Partial<ServiceSearchParams>
  ): Promise<ApiResponse<PaginatedResponse<Service>>> => {
    try {
      const response = await apiClient.get(`/services/category/${categoryId}`, { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch services' },
      };
    }
  },

  // Get services by provider
  getServicesByProvider: async (
    providerId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<Service>>> => {
    try {
      const response = await apiClient.get(`/services/provider/${providerId}`, { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch services' },
      };
    }
  },

  // Get nearby services
  getNearbyServices: async (
    latitude: number,
    longitude: number,
    radius: number = 10,
    params?: Partial<ServiceSearchParams>
  ): Promise<ApiResponse<PaginatedResponse<Service>>> => {
    try {
      const response = await apiClient.get('/services/nearby', {
        params: { latitude, longitude, radius, ...params },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch nearby services' },
      };
    }
  },

  // ============================
  // Recommendations (Smart Linking)
  // ============================

  // Get service recommendations for a product
  getRecommendations: async (
    productId: string,
    productType: LinkedMarketplace,
    transactionStage: 'viewing' | 'before_payment' | 'after_purchase' | 'sold'
  ): Promise<ApiResponse<ServiceRecommendation[]>> => {
    try {
      const response = await apiClient.post('/services/recommend', {
        productId,
        productType,
        transactionStage,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to get recommendations' },
      };
    }
  },

  // Get recommendations for auction winner
  getAuctionWinnerRecommendations: async (
    auctionId: string,
    itemType: LinkedMarketplace
  ): Promise<ApiResponse<ServiceRecommendation[]>> => {
    try {
      const response = await apiClient.post('/services/recommend/auction-winner', {
        auctionId,
        itemType,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to get recommendations' },
      };
    }
  },

  // ============================
  // User Interactions
  // ============================

  // Add service to favorites
  addToFavorites: async (serviceId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post(`/services/${serviceId}/favorite`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to add to favorites' },
      };
    }
  },

  // Remove from favorites
  removeFromFavorites: async (serviceId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/services/${serviceId}/favorite`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to remove from favorites' },
      };
    }
  },

  // Get user's favorite services
  getFavorites: async (params?: { page?: number; limit?: number }): Promise<ApiResponse<PaginatedResponse<Service>>> => {
    try {
      const response = await apiClient.get('/services/favorites', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch favorites' },
      };
    }
  },

  // Track service view (analytics)
  trackView: async (serviceId: string): Promise<void> => {
    try {
      await apiClient.post(`/services/${serviceId}/view`);
    } catch (error) {
      // Silent fail for analytics
      console.warn('Failed to track service view:', error);
    }
  },
};
