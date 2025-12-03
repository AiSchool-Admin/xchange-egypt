import apiClient from './client';

// ============================================
// Price Alerts API
// ============================================

export type AlertType = 'ITEM' | 'CATEGORY' | 'SEARCH' | 'SELLER';

export interface PriceAlert {
  id: string;
  userId: string;
  type: AlertType;
  name: string;
  targetPrice?: number;
  currentPrice?: number;
  priceDropPercentage?: number;
  itemId?: string;
  categoryId?: string;
  searchQuery?: string;
  sellerId?: string;
  isActive: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifySms: boolean;
  lastTriggeredAt?: string;
  triggerCount: number;
  createdAt: string;
  item?: {
    id: string;
    title: string;
    images: string[];
    estimatedValue: number;
  };
  category?: {
    id: string;
    nameAr: string;
  };
}

export interface AlertsResponse {
  success: boolean;
  data: {
    alerts: PriceAlert[];
  };
}

// Get my alerts
export const getMyAlerts = async (): Promise<AlertsResponse> => {
  const response = await apiClient.get('/price-alerts');
  return response.data;
};

// Create alert
export const createAlert = async (data: {
  type: AlertType;
  name: string;
  targetPrice?: number;
  priceDropPercentage?: number;
  itemId?: string;
  categoryId?: string;
  searchQuery?: string;
  sellerId?: string;
  notifyEmail?: boolean;
  notifyPush?: boolean;
  notifySms?: boolean;
}) => {
  const response = await apiClient.post('/price-alerts', data);
  return response.data;
};

// Update alert
export const updateAlert = async (id: string, data: Partial<{
  name: string;
  targetPrice: number;
  priceDropPercentage: number;
  isActive: boolean;
  notifyEmail: boolean;
  notifyPush: boolean;
  notifySms: boolean;
}>) => {
  const response = await apiClient.put(`/price-alerts/${id}`, data);
  return response.data;
};

// Delete alert
export const deleteAlert = async (id: string) => {
  const response = await apiClient.delete(`/price-alerts/${id}`);
  return response.data;
};

// Toggle alert
export const toggleAlert = async (id: string) => {
  const response = await apiClient.post(`/price-alerts/${id}/toggle`);
  return response.data;
};
