import apiClient from './client';

export interface WishListItem {
  id: string;
  userId: string;
  categoryId?: string;
  description: string;
  keywords: string[];
  maxPrice?: number;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    nameAr: string;
    nameEn: string;
  };
}

export interface WishListMatch {
  wishListItem: WishListItem;
  matchingItems: any[];
  matchScore: number;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  referenceId?: string;
  referenceType?: string;
  isRead: boolean;
  createdAt: string;
}

export interface WishListResponse {
  success: boolean;
  data: {
    items: WishListItem[];
  };
}

export interface WishListMatchesResponse {
  success: boolean;
  data: {
    matches: WishListMatch[];
  };
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
  };
}

// Get user's wish list
export const getWishList = async (): Promise<WishListResponse> => {
  const response = await apiClient.get('/wishlist');
  return response.data;
};

// Add item to wish list
export const addToWishList = async (data: {
  categoryId?: string;
  description: string;
  keywords?: string[];
  maxPrice?: number;
}): Promise<{ success: boolean; data: WishListItem }> => {
  const response = await apiClient.post('/wishlist', data);
  return response.data;
};

// Remove item from wish list
export const removeFromWishList = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/wishlist/${id}`);
  return response.data;
};

// Find matches for wish list
export const findWishListMatches = async (): Promise<WishListMatchesResponse> => {
  const response = await apiClient.get('/wishlist/matches');
  return response.data;
};

// Check for new matches and get notification count
export const checkWishListMatches = async (): Promise<{ success: boolean; data: { notificationCount: number } }> => {
  const response = await apiClient.post('/wishlist/check-matches');
  return response.data;
};

// Get notifications
export const getNotifications = async (limit?: number): Promise<NotificationsResponse> => {
  const params = limit ? `?limit=${limit}` : '';
  const response = await apiClient.get(`/wishlist/notifications${params}`);
  return response.data;
};

// Mark notification as read
export const markNotificationRead = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.post(`/wishlist/notifications/${id}/read`);
  return response.data;
};
