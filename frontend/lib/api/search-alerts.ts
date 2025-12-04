import apiClient from './client';

// ============================================
// Types
// ============================================

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  query?: string;
  filters: {
    categoryId?: string;
    governorate?: string;
    minPrice?: number;
    maxPrice?: number;
    condition?: string;
    type?: string;
  };
  notifyOnNew: boolean;
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
}

export interface SearchAlert {
  id: string;
  savedSearchId: string;
  userId: string;
  isActive: boolean;
  frequency: 'INSTANT' | 'DAILY' | 'WEEKLY';
  notifyPush: boolean;
  notifyEmail: boolean;
  notifyWhatsapp: boolean;
  alertsSent: number;
  lastAlertAt?: string;
  matchedItems: number;
  createdAt: string;
  updatedAt: string;
}

export interface AlertStats {
  totalAlerts: number;
  activeAlerts: number;
  totalSent: number;
  matchedItems: number;
}

// ============================================
// API Functions
// ============================================

// Saved Searches
export const createSavedSearch = async (data: {
  name: string;
  query?: string;
  filters: SavedSearch['filters'];
  notifyOnNew?: boolean;
}) => {
  const response = await apiClient.post('/search-alerts/saved', data);
  return response.data;
};

export const getSavedSearches = async () => {
  const response = await apiClient.get('/search-alerts/saved');
  return response.data;
};

export const getSavedSearch = async (id: string) => {
  const response = await apiClient.get(`/search-alerts/saved/${id}`);
  return response.data;
};

export const updateSavedSearch = async (id: string, data: Partial<SavedSearch>) => {
  const response = await apiClient.put(`/search-alerts/saved/${id}`, data);
  return response.data;
};

export const deleteSavedSearch = async (id: string) => {
  const response = await apiClient.delete(`/search-alerts/saved/${id}`);
  return response.data;
};

export const executeSavedSearch = async (id: string, page = 1, limit = 20) => {
  const response = await apiClient.get(`/search-alerts/saved/${id}/execute`, {
    params: { page, limit },
  });
  return response.data;
};

export const getRecentMatches = async (savedSearchId: string, limit = 10) => {
  const response = await apiClient.get(`/search-alerts/saved/${savedSearchId}/matches`, {
    params: { limit },
  });
  return response.data;
};

// Alerts
export const getAlerts = async () => {
  const response = await apiClient.get('/search-alerts/alerts');
  return response.data;
};

export const createAlert = async (data: {
  savedSearchId: string;
  frequency?: string;
  notifyPush?: boolean;
  notifyEmail?: boolean;
  notifyWhatsapp?: boolean;
}) => {
  const response = await apiClient.post('/search-alerts/alerts', data);
  return response.data;
};

export const toggleAlert = async (id: string) => {
  const response = await apiClient.post(`/search-alerts/alerts/${id}/toggle`);
  return response.data;
};

export const deleteAlert = async (id: string) => {
  const response = await apiClient.delete(`/search-alerts/alerts/${id}`);
  return response.data;
};

// Stats
export const getAlertStats = async () => {
  const response = await apiClient.get('/search-alerts/stats');
  return response.data;
};
