// ============================================
// Auctions API - Xchange Egypt Marketplace
// خدمات المزادات
// ============================================

import { apiClient } from './client';
import { Listing, Category, Location, Seller, PaginatedResponse } from './listings';

// Types
export interface Auction {
  id: string;
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  currency: 'EGP' | 'USD';
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  category: Category;
  images: string[];
  location: Location;
  seller: Seller;
  status: 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'SOLD' | 'CANCELLED';
  startTime: string;
  endTime: string;
  bidsCount: number;
  highestBidder?: BidderInfo;
  isWatching?: boolean;
  hasUserBid?: boolean;
  userHighestBid?: number;
  minimumBidIncrement: number;
  autoExtend: boolean;
  extensionMinutes: number;
  createdAt: string;
  updatedAt: string;
}

export interface Bid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidder: BidderInfo;
  amount: number;
  isWinning: boolean;
  isAutoBid: boolean;
  createdAt: string;
}

export interface BidderInfo {
  id: string;
  fullName: string;
  avatar?: string;
  rating: number;
  isVerified: boolean;
}

export interface AutoBidSettings {
  maxAmount: number;
  incrementAmount?: number;
  isActive: boolean;
}

export interface AuctionsFilter {
  categoryId?: string;
  governorate?: string;
  status?: 'UPCOMING' | 'ACTIVE' | 'ENDED';
  minPrice?: number;
  maxPrice?: number;
  condition?: string[];
  sortBy?: 'ending_soon' | 'newly_listed' | 'most_bids' | 'price_low' | 'price_high';
  search?: string;
  page?: number;
  limit?: number;
}

export interface CreateAuctionData {
  title: string;
  titleAr?: string;
  description: string;
  descriptionAr?: string;
  startingPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  currency?: 'EGP' | 'USD';
  condition: string;
  categoryId: string;
  images: string[];
  governorate: string;
  city: string;
  startTime: string;
  duration: number; // in hours
  minimumBidIncrement?: number;
  autoExtend?: boolean;
  extensionMinutes?: number;
}

// API Functions
export const auctionsApi = {
  // Get all auctions with filters
  getAuctions: async (filters?: AuctionsFilter): Promise<PaginatedResponse<Auction>> => {
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

    const response = await apiClient.get(`/auctions?${params.toString()}`);
    return response.data;
  },

  // Get single auction by ID
  getAuction: async (id: string): Promise<Auction> => {
    const response = await apiClient.get(`/auctions/${id}`);
    return response.data;
  },

  // Create new auction
  createAuction: async (data: CreateAuctionData): Promise<Auction> => {
    const response = await apiClient.post('/auctions', data);
    return response.data;
  },

  // Update auction (only before it starts)
  updateAuction: async (id: string, data: Partial<CreateAuctionData>): Promise<Auction> => {
    const response = await apiClient.put(`/auctions/${id}`, data);
    return response.data;
  },

  // Cancel auction
  cancelAuction: async (id: string, reason?: string): Promise<void> => {
    await apiClient.post(`/auctions/${id}/cancel`, { reason });
  },

  // Place bid
  placeBid: async (auctionId: string, amount: number): Promise<Bid> => {
    const response = await apiClient.post(`/auctions/${auctionId}/bid`, { amount });
    return response.data;
  },

  // Set auto-bid
  setAutoBid: async (auctionId: string, settings: AutoBidSettings): Promise<AutoBidSettings> => {
    const response = await apiClient.post(`/auctions/${auctionId}/auto-bid`, settings);
    return response.data;
  },

  // Get auto-bid settings
  getAutoBid: async (auctionId: string): Promise<AutoBidSettings | null> => {
    const response = await apiClient.get(`/auctions/${auctionId}/auto-bid`);
    return response.data;
  },

  // Cancel auto-bid
  cancelAutoBid: async (auctionId: string): Promise<void> => {
    await apiClient.delete(`/auctions/${auctionId}/auto-bid`);
  },

  // Buy now
  buyNow: async (auctionId: string): Promise<{ orderId: string }> => {
    const response = await apiClient.post(`/auctions/${auctionId}/buy-now`);
    return response.data;
  },

  // Get auction bids
  getAuctionBids: async (auctionId: string, page = 1, limit = 50): Promise<PaginatedResponse<Bid>> => {
    const response = await apiClient.get(`/auctions/${auctionId}/bids?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Toggle watch auction
  toggleWatch: async (auctionId: string): Promise<{ isWatching: boolean }> => {
    const response = await apiClient.post(`/auctions/${auctionId}/watch`);
    return response.data;
  },

  // Get watched auctions
  getWatchedAuctions: async (page = 1, limit = 20): Promise<PaginatedResponse<Auction>> => {
    const response = await apiClient.get(`/auctions/watching?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get user's auctions (as seller)
  getMyAuctions: async (status?: string, page = 1, limit = 20): Promise<PaginatedResponse<Auction>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);

    const response = await apiClient.get(`/auctions/my?${params.toString()}`);
    return response.data;
  },

  // Get user's bids
  getMyBids: async (status?: 'winning' | 'outbid' | 'won' | 'lost', page = 1, limit = 20): Promise<PaginatedResponse<{
    auction: Auction;
    bid: Bid;
    status: string;
  }>> => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.append('status', status);

    const response = await apiClient.get(`/auctions/my-bids?${params.toString()}`);
    return response.data;
  },

  // Get ending soon auctions
  getEndingSoon: async (limit = 10): Promise<Auction[]> => {
    const response = await apiClient.get(`/auctions/ending-soon?limit=${limit}`);
    return response.data;
  },

  // Get hot auctions (most bids)
  getHotAuctions: async (limit = 10): Promise<Auction[]> => {
    const response = await apiClient.get(`/auctions/hot?limit=${limit}`);
    return response.data;
  },

  // Get upcoming auctions
  getUpcomingAuctions: async (limit = 10): Promise<Auction[]> => {
    const response = await apiClient.get(`/auctions/upcoming?limit=${limit}`);
    return response.data;
  },

  // Get auction statistics
  getAuctionStats: async (id: string): Promise<{
    totalBids: number;
    uniqueBidders: number;
    priceHistory: { time: string; price: number }[];
    viewsHistory: { date: string; count: number }[];
  }> => {
    const response = await apiClient.get(`/auctions/${id}/stats`);
    return response.data;
  },

  // Subscribe to auction updates (WebSocket registration)
  subscribeToAuction: async (auctionId: string): Promise<void> => {
    await apiClient.post(`/auctions/${auctionId}/subscribe`);
  },

  // Unsubscribe from auction updates
  unsubscribeFromAuction: async (auctionId: string): Promise<void> => {
    await apiClient.post(`/auctions/${auctionId}/unsubscribe`);
  },
};

export default auctionsApi;
