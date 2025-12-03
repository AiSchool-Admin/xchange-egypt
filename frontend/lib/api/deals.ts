import apiClient from './client';

// ============================================
// Flash Deals API
// ============================================

export interface FlashDeal {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  quantity: number;
  claimedCount: number;
  remainingCount: number;
  startsAt: string;
  endsAt: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'SOLD_OUT';
  listing: {
    id: string;
    title: string;
    images: string[];
    category: { nameAr: string };
  };
  seller: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface FlashDealsResponse {
  success: boolean;
  data: {
    deals: FlashDeal[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

// Get active flash deals
export const getActiveDeals = async (): Promise<FlashDealsResponse> => {
  const response = await apiClient.get('/flash-deals/active');
  return response.data;
};

// Get upcoming flash deals
export const getUpcomingDeals = async (): Promise<FlashDealsResponse> => {
  const response = await apiClient.get('/flash-deals/upcoming');
  return response.data;
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
