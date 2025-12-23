// ============================================
// Listings API - Xchange Egypt Marketplace
// خدمات الإعلانات - البيع والشراء
// ============================================

import { apiClient } from './client';

// Types
export interface Listing {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  currency: 'EGP' | 'USD';
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  category: Category;
  subcategory?: Category;
  images: string[];
  location: Location;
  seller: Seller;
  status: 'ACTIVE' | 'SOLD' | 'PENDING' | 'EXPIRED' | 'DRAFT';
  views: number;
  favorites: number;
  isFavorited?: boolean;
  isNegotiable: boolean;
  allowBarter: boolean;
  barterPreferences?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
}

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  icon?: string;
  image?: string;
  parentId?: string;
  children?: Category[];
  listingsCount?: number;
}

export interface Location {
  governorate: string;
  governorateAr: string;
  city: string;
  cityAr: string;
  area?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface Seller {
  id: string;
  fullName: string;
  avatar?: string;
  rating: number;
  reviewsCount: number;
  listingsCount: number;
  isVerified: boolean;
  memberSince: string;
  responseTime?: string;
  responseRate?: number;
}

export interface ListingsFilter {
  categoryId?: string;
  subcategoryId?: string;
  governorate?: string;
  city?: string;
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  sortBy?: 'newest' | 'oldest' | 'price_low' | 'price_high' | 'popular';
  search?: string;
  allowBarter?: boolean;
  isNegotiable?: boolean;
  page?: number;
  limit?: number;
}

export interface CreateListingData {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  price: number;
  currency?: 'EGP' | 'USD';
  condition: string;
  categoryId: string;
  subcategoryId?: string;
  images: string[];
  governorate: string;
  city: string;
  area?: string;
  isNegotiable?: boolean;
  allowBarter?: boolean;
  barterPreferences?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasMore: boolean;
  };
}

// API Functions
export const listingsApi = {
  // Get all listings with filters
  getListings: async (filters?: ListingsFilter): Promise<PaginatedResponse<Listing>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, v));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await apiClient.get(`/listings?${params.toString()}`);
    return response.data;
  },

  // Get single listing by ID
  getListing: async (id: string): Promise<Listing> => {
    const response = await apiClient.get(`/listings/${id}`);
    return response.data;
  },

  // Create new listing
  createListing: async (data: CreateListingData): Promise<Listing> => {
    const response = await apiClient.post('/listings', data);
    return response.data;
  },

  // Update listing
  updateListing: async (id: string, data: Partial<CreateListingData>): Promise<Listing> => {
    const response = await apiClient.put(`/listings/${id}`, data);
    return response.data;
  },

  // Delete listing
  deleteListing: async (id: string): Promise<void> => {
    await apiClient.delete(`/listings/${id}`);
  },

  // Mark as sold
  markAsSold: async (id: string, buyerId?: string): Promise<Listing> => {
    const response = await apiClient.post(`/listings/${id}/sold`, { buyerId });
    return response.data;
  },

  // Toggle favorite
  toggleFavorite: async (id: string): Promise<{ isFavorited: boolean }> => {
    const response = await apiClient.post(`/listings/${id}/favorite`);
    return response.data;
  },

  // Get user's favorites
  getFavorites: async (page = 1, limit = 20): Promise<PaginatedResponse<Listing>> => {
    const response = await apiClient.get(`/listings/favorites?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get user's listings
  getMyListings: async (status?: string, page = 1, limit = 20): Promise<PaginatedResponse<Listing>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);

    const response = await apiClient.get(`/listings/my?${params.toString()}`);
    return response.data;
  },

  // Get seller's listings
  getSellerListings: async (sellerId: string, page = 1, limit = 20): Promise<PaginatedResponse<Listing>> => {
    const response = await apiClient.get(`/listings/seller/${sellerId}?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Report listing
  reportListing: async (id: string, reason: string, details?: string): Promise<void> => {
    await apiClient.post(`/listings/${id}/report`, { reason, details });
  },

  // Get similar listings
  getSimilarListings: async (id: string, limit = 10): Promise<Listing[]> => {
    const response = await apiClient.get(`/listings/${id}/similar?limit=${limit}`);
    return response.data;
  },

  // Upload images
  uploadImages: async (images: FormData): Promise<string[]> => {
    const response = await apiClient.post('/upload/images', images, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.urls;
  },

  // Get categories
  getCategories: async (): Promise<Category[]> => {
    const response = await apiClient.get('/categories');
    return response.data;
  },

  // Get category by ID
  getCategory: async (id: string): Promise<Category> => {
    const response = await apiClient.get(`/categories/${id}`);
    return response.data;
  },

  // Search listings
  searchListings: async (query: string, filters?: ListingsFilter): Promise<PaginatedResponse<Listing>> => {
    return listingsApi.getListings({ ...filters, search: query });
  },

  // Get trending listings
  getTrendingListings: async (limit = 10): Promise<Listing[]> => {
    const response = await apiClient.get(`/listings/trending?limit=${limit}`);
    return response.data;
  },

  // Get recent listings
  getRecentListings: async (limit = 10): Promise<Listing[]> => {
    const response = await apiClient.get(`/listings/recent?limit=${limit}`);
    return response.data;
  },

  // Refresh listing (bump to top)
  refreshListing: async (id: string): Promise<Listing> => {
    const response = await apiClient.post(`/listings/${id}/refresh`);
    return response.data;
  },

  // Get listing statistics (for seller)
  getListingStats: async (id: string): Promise<{
    views: number;
    favorites: number;
    messages: number;
    viewsHistory: { date: string; count: number }[];
  }> => {
    const response = await apiClient.get(`/listings/${id}/stats`);
    return response.data;
  },
};

export default listingsApi;
