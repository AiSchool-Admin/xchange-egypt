// ============================================
// Gold Trading API - Xchange Egypt Marketplace
// خدمات تجارة الذهب
// ============================================

import { apiClient } from './client';
import { PaginatedResponse, Location, Seller } from './listings';

// Types
export interface GoldPrice {
  karat: 18 | 21 | 24;
  buyPrice: number;
  sellPrice: number;
  currency: 'EGP';
  updatedAt: string;
  change24h: number;
  changePercent24h: number;
}

export interface GoldPriceHistory {
  karat: number;
  prices: {
    date: string;
    buyPrice: number;
    sellPrice: number;
  }[];
}

export interface GoldListing {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  type: 'JEWELRY' | 'BULLION' | 'COINS' | 'SCRAP';
  karat: 18 | 21 | 24;
  weight: number; // in grams
  pricePerGram?: number;
  totalPrice: number;
  currency: 'EGP';
  condition: 'NEW' | 'USED' | 'ANTIQUE';
  images: string[];
  location: Location;
  seller: Seller;
  status: 'ACTIVE' | 'SOLD' | 'PENDING' | 'EXPIRED';
  isNegotiable: boolean;
  hasCertificate: boolean;
  certificateImage?: string;
  hallmarkVerified: boolean;
  views: number;
  favorites: number;
  isFavorited?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface GoldDealer {
  id: string;
  businessName: string;
  businessNameAr?: string;
  ownerName: string;
  avatar?: string;
  coverImage?: string;
  description?: string;
  location: Location;
  address: string;
  phone: string;
  whatsapp?: string;
  rating: number;
  reviewsCount: number;
  isVerified: boolean;
  isCertified: boolean;
  certificationNumber?: string;
  operatingHours?: {
    day: string;
    open: string;
    close: string;
    isClosed: boolean;
  }[];
  services: ('BUY' | 'SELL' | 'REPAIR' | 'APPRAISAL' | 'CUSTOM')[];
  specialties: string[];
  listingsCount: number;
  memberSince: string;
}

export interface GoldOrder {
  id: string;
  type: 'BUY' | 'SELL';
  listing?: GoldListing;
  dealer?: GoldDealer;
  karat: number;
  weight: number;
  pricePerGram: number;
  totalAmount: number;
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  paymentMethod?: string;
  paymentStatus?: string;
  meetingLocation?: string;
  meetingTime?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GoldListingsFilter {
  type?: string;
  karat?: number[];
  minWeight?: number;
  maxWeight?: number;
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  governorate?: string;
  hasCertificate?: boolean;
  hallmarkVerified?: boolean;
  sortBy?: 'newest' | 'price_low' | 'price_high' | 'weight';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateGoldListingData {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  type: string;
  karat: number;
  weight: number;
  totalPrice: number;
  condition: string;
  images: string[];
  governorate: string;
  city: string;
  isNegotiable?: boolean;
  hasCertificate?: boolean;
  certificateImage?: string;
}

// API Functions
export const goldApi = {
  // Get current gold prices
  getPrices: async (): Promise<GoldPrice[]> => {
    const response = await apiClient.get('/gold/prices');
    return response.data;
  },

  // Get gold price history
  getPriceHistory: async (karat: number, period: '1D' | '1W' | '1M' | '3M' | '1Y' = '1M'): Promise<GoldPriceHistory> => {
    const response = await apiClient.get(`/gold/prices/history?karat=${karat}&period=${period}`);
    return response.data;
  },

  // Get all gold listings
  getListings: async (filters?: GoldListingsFilter): Promise<PaginatedResponse<GoldListing>> => {
    const params = new URLSearchParams();

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            value.forEach(v => params.append(key, String(v)));
          } else {
            params.append(key, String(value));
          }
        }
      });
    }

    const response = await apiClient.get(`/gold/listings?${params.toString()}`);
    return response.data;
  },

  // Get single gold listing
  getListing: async (id: string): Promise<GoldListing> => {
    const response = await apiClient.get(`/gold/listings/${id}`);
    return response.data;
  },

  // Create gold listing
  createListing: async (data: CreateGoldListingData): Promise<GoldListing> => {
    const response = await apiClient.post('/gold/listings', data);
    return response.data;
  },

  // Update gold listing
  updateListing: async (id: string, data: Partial<CreateGoldListingData>): Promise<GoldListing> => {
    const response = await apiClient.put(`/gold/listings/${id}`, data);
    return response.data;
  },

  // Delete gold listing
  deleteListing: async (id: string): Promise<void> => {
    await apiClient.delete(`/gold/listings/${id}`);
  },

  // Toggle favorite
  toggleFavorite: async (id: string): Promise<{ isFavorited: boolean }> => {
    const response = await apiClient.post(`/gold/listings/${id}/favorite`);
    return response.data;
  },

  // Get gold dealers
  getDealers: async (governorate?: string, page = 1, limit = 20): Promise<PaginatedResponse<GoldDealer>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (governorate) params.append('governorate', governorate);

    const response = await apiClient.get(`/gold/dealers?${params.toString()}`);
    return response.data;
  },

  // Get single dealer
  getDealer: async (id: string): Promise<GoldDealer> => {
    const response = await apiClient.get(`/gold/dealers/${id}`);
    return response.data;
  },

  // Get dealer listings
  getDealerListings: async (dealerId: string, page = 1, limit = 20): Promise<PaginatedResponse<GoldListing>> => {
    const response = await apiClient.get(`/gold/dealers/${dealerId}/listings?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get nearby dealers
  getNearbyDealers: async (latitude: number, longitude: number, radiusKm = 10): Promise<GoldDealer[]> => {
    const response = await apiClient.get(`/gold/dealers/nearby?lat=${latitude}&lng=${longitude}&radius=${radiusKm}`);
    return response.data;
  },

  // Calculate gold value
  calculateValue: async (karat: number, weight: number, type: 'BUY' | 'SELL' = 'SELL'): Promise<{
    pricePerGram: number;
    totalValue: number;
    marketPrice: number;
    difference: number;
  }> => {
    const response = await apiClient.get(`/gold/calculate?karat=${karat}&weight=${weight}&type=${type}`);
    return response.data;
  },

  // Create gold order
  createOrder: async (data: {
    listingId?: string;
    dealerId?: string;
    type: 'BUY' | 'SELL';
    karat: number;
    weight: number;
    paymentMethod?: string;
    meetingLocation?: string;
    meetingTime?: string;
    notes?: string;
  }): Promise<GoldOrder> => {
    const response = await apiClient.post('/gold/orders', data);
    return response.data;
  },

  // Get user's gold orders
  getMyOrders: async (type?: 'BUY' | 'SELL', status?: string, page = 1, limit = 20): Promise<PaginatedResponse<GoldOrder>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (type) params.append('type', type);
    if (status) params.append('status', status);

    const response = await apiClient.get(`/gold/orders/my?${params.toString()}`);
    return response.data;
  },

  // Get gold order details
  getOrder: async (id: string): Promise<GoldOrder> => {
    const response = await apiClient.get(`/gold/orders/${id}`);
    return response.data;
  },

  // Update order status
  updateOrderStatus: async (id: string, status: string, notes?: string): Promise<GoldOrder> => {
    const response = await apiClient.put(`/gold/orders/${id}/status`, { status, notes });
    return response.data;
  },

  // Get price alerts
  getPriceAlerts: async (): Promise<{
    id: string;
    karat: number;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
    isActive: boolean;
  }[]> => {
    const response = await apiClient.get('/gold/alerts');
    return response.data;
  },

  // Create price alert
  createPriceAlert: async (data: {
    karat: number;
    targetPrice: number;
    condition: 'ABOVE' | 'BELOW';
  }): Promise<{ id: string }> => {
    const response = await apiClient.post('/gold/alerts', data);
    return response.data;
  },

  // Delete price alert
  deletePriceAlert: async (id: string): Promise<void> => {
    await apiClient.delete(`/gold/alerts/${id}`);
  },

  // Get my gold listings
  getMyListings: async (status?: string, page = 1, limit = 20): Promise<PaginatedResponse<GoldListing>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);

    const response = await apiClient.get(`/gold/listings/my?${params.toString()}`);
    return response.data;
  },
};

export default goldApi;
