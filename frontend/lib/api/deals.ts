import apiClient from './client';

// ============================================
// Flash Deals API
// ============================================

export interface FlashDeal {
  id: string;
  title: string;
  description: string | null;
  originalPrice: number;
  dealPrice: number;
  discountPercent: number;
  totalQuantity: number;
  soldQuantity: number;
  reservedQuantity: number;
  availableQuantity: number;
  maxPerUser: number;
  startTime: string;
  endTime: string;
  timeRemaining: number;
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'SOLD_OUT' | 'CANCELLED';
  isFeatured: boolean;
  listing: {
    id: string;
    item: {
      id: string;
      title: string;
      images: string[];
      category: { nameAr: string; nameEn: string };
    };
    user: {
      id: string;
      fullName: string;
      rating: number;
    };
  };
}

export interface FlashDealsResponse {
  success: boolean;
  data: {
    deals: FlashDeal[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

// Get active flash deals
export const getActiveDeals = async (): Promise<FlashDealsResponse> => {
  const response = await apiClient.get('/flash-deals/active');
  // Handle both array response and object response
  const data = response.data;
  if (Array.isArray(data)) {
    return { success: true, data: { deals: data } };
  }
  if (data.success !== undefined) {
    return data;
  }
  return { success: true, data: { deals: data.deals || data || [] } };
};

// Get upcoming flash deals
export const getUpcomingDeals = async (): Promise<FlashDealsResponse> => {
  const response = await apiClient.get('/flash-deals/upcoming');
  // Handle both array response and object response
  const data = response.data;
  if (Array.isArray(data)) {
    return { success: true, data: { deals: data } };
  }
  if (data.success !== undefined) {
    return data;
  }
  return { success: true, data: { deals: data.deals || data || [] } };
};

// Get single deal
export const getDeal = async (id: string) => {
  const response = await apiClient.get(`/flash-deals/${id}`);
  return response.data;
};

// Claim a deal
export const claimDeal = async (dealId: string) => {
  const response = await apiClient.post(`/flash-deals/${dealId}/claim`);
  return response.data;
};

// Complete claim (after payment)
export const completeClaim = async (claimId: string, transactionId: string) => {
  const response = await apiClient.post(`/flash-deals/claims/${claimId}/complete`, {
    transactionId,
  });
  return response.data;
};

// Get my claims
export const getMyClaims = async () => {
  const response = await apiClient.get('/flash-deals/my-claims');
  return response.data;
};

// Seed demo flash deals (for testing)
export const seedDemoDeals = async () => {
  const response = await apiClient.post('/seed/seed-flash-deals');
  return response.data;
};
