import apiClient from './client';

// ============================================
// Group Buying (Tawfir) API
// ============================================

export interface DiscountTier {
  minQty: number;
  discount: number;
}

export interface GroupBuy {
  id: string;
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  originalPrice: number;
  currentPrice: number;
  currentDiscount: number;
  minQuantity: number;
  maxQuantity: number;
  currentQuantity: number;
  discountTiers: DiscountTier[];
  status: 'PENDING' | 'ACTIVE' | 'SUCCESSFUL' | 'FAILED' | 'CANCELLED';
  startsAt: string;
  endsAt: string;
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
  participantCount: number;
}

export interface GroupBuysResponse {
  success: boolean;
  data: {
    groupBuys: GroupBuy[];
    pagination: {
      page: number;
      limit: number;
      total: number;
    };
  };
}

// Get active group buys
export const getActiveGroupBuys = async (): Promise<GroupBuysResponse> => {
  const response = await apiClient.get('/group-buys/active');
  return response.data;
};

// Get single group buy
export const getGroupBuy = async (id: string) => {
  const response = await apiClient.get(`/group-buys/${id}`);
  return response.data;
};

// Join group buy
export const joinGroupBuy = async (groupBuyId: string, quantity: number = 1) => {
  const response = await apiClient.post(`/group-buys/${groupBuyId}/join`, {
    quantity,
  });
  return response.data;
};

// Leave group buy
export const leaveGroupBuy = async (groupBuyId: string) => {
  const response = await apiClient.post(`/group-buys/${groupBuyId}/leave`);
  return response.data;
};

// Get my participations
export const getMyParticipations = async () => {
  const response = await apiClient.get('/group-buys/my-participations');
  return response.data;
};

// Create group buy (for sellers)
export const createGroupBuy = async (data: {
  listingId: string;
  originalPrice: number;
  minQuantity: number;
  maxQuantity: number;
  discountTiers: DiscountTier[];
  endsAt: string;
}) => {
  const response = await apiClient.post('/group-buys', data);
  return response.data;
};
