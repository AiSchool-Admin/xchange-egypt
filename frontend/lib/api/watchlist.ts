import apiClient from './client';

export interface WatchlistItem {
  id: string;
  itemId: string;
  item: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    images: { url: string }[];
    condition: string;
    location: string;
    status: string;
    listingType: 'DIRECT_SALE' | 'AUCTION' | 'BARTER';
    auctionEndTime?: string;
    currentBid?: number;
    bidCount?: number;
    seller: {
      id: string;
      fullName: string;
      rating: number;
      avatar?: string;
    };
    category?: {
      id: string;
      nameAr: string;
      nameEn: string;
    };
  };
  priceAlerts: {
    enabled: boolean;
    targetPrice?: number | null;
  };
  notifyOnPriceDrop: boolean;
  notifyOnBackInStock: boolean;
  addedAt: string;
  lastPriceChange?: {
    oldPrice: number;
    newPrice: number;
    changedAt: string;
  };
}

export interface WatchlistResponse {
  success: boolean;
  data: {
    watchlist: WatchlistItem[];
    total: number;
  };
}

export interface AddToWatchlistData {
  itemId: string;
  targetPrice?: number;
  notifyOnPriceDrop?: boolean;
  notifyOnBackInStock?: boolean;
}

export interface UpdateWatchlistData {
  targetPrice?: number;
  notifyOnPriceDrop?: boolean;
  notifyOnBackInStock?: boolean;
}

/**
 * Get user's watchlist
 */
export const getWatchlist = async (): Promise<WatchlistResponse> => {
  const response = await apiClient.get('/watchlist');
  return response.data;
};

/**
 * Add item to watchlist
 */
export const addToWatchlist = async (data: AddToWatchlistData) => {
  const response = await apiClient.post('/watchlist', data);
  return response.data;
};

/**
 * Update watchlist item settings
 */
export const updateWatchlistItem = async (id: string, data: UpdateWatchlistData) => {
  const response = await apiClient.put(`/watchlist/${id}`, data);
  return response.data;
};

/**
 * Remove item from watchlist
 */
export const removeFromWatchlist = async (id: string) => {
  const response = await apiClient.delete(`/watchlist/${id}`);
  return response.data;
};

/**
 * Check if item is in watchlist
 */
export const checkWatchlistStatus = async (itemId: string): Promise<{
  success: boolean;
  data: {
    inWatchlist: boolean;
    watchlistItemId: string | null;
  };
}> => {
  const response = await apiClient.get(`/watchlist/check/${itemId}`);
  return response.data;
};

/**
 * Toggle item in watchlist (add if not exists, remove if exists)
 */
export const toggleWatchlist = async (itemId: string): Promise<{
  success: boolean;
  inWatchlist: boolean;
  watchlistItemId?: string;
}> => {
  const status = await checkWatchlistStatus(itemId);

  if (status.data.inWatchlist && status.data.watchlistItemId) {
    await removeFromWatchlist(status.data.watchlistItemId);
    return { success: true, inWatchlist: false };
  } else {
    const result = await addToWatchlist({ itemId });
    return { success: true, inWatchlist: true, watchlistItemId: result.data.id };
  }
};
