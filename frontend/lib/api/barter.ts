import apiClient from './client';

export interface BarterItem {
  id: string;
  title: string;
  description: string;
  condition: string;
  estimatedValue?: number;
  images: Array<{ id: string; url: string; isPrimary: boolean }>;
  category: {
    id: string;
    nameEn: string;
  };
  seller: {
    id: string;
    fullName: string;
    userType: string;
  };
  createdAt: string;
}

export interface BarterOffer {
  id: string;
  initiatorId: string;
  recipientId?: string | null;
  offeredItemIds: string[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  message?: string;
  notes?: string;
  counterOfferId?: string;
  isOpenOffer?: boolean;
  offeredBundleValue?: number;
  preferenceSets?: Array<{
    id: string;
    priority: number;
    description?: string;
    items: Array<{
      id: string;
      item: {
        id: string;
        title: string;
        images: Array<{ id: string; url: string; isPrimary?: boolean }>;
        condition: string;
      };
    }>;
  }>;
  itemRequests?: Array<{
    id: string;
    description: string;
    category?: {
      id: string;
      nameAr: string;
      nameEn: string;
    } | null;
  }>;
  initiator: {
    id: string;
    fullName: string;
    email?: string;
    avatar?: string | null;
    userType?: string;
  };
  recipient?: {
    id: string;
    fullName: string;
    email?: string;
    avatar?: string | null;
    userType?: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBarterOfferData {
  offeredItemIds: string[];
  requestedItemIds: string[];
  recipientId?: string;
  message?: string;
  offeredCashAmount?: number;
  requestedCashAmount?: number;
  itemRequest?: {
    description: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  };
}

export interface BackendBarterOfferData {
  offeredItemIds: string[];
  preferenceSets: Array<{
    priority: number;
    itemIds: string[];
    description?: string;
  }>;
  recipientId?: string;
  notes?: string;
  expiresAt?: string;
  isOpenOffer?: boolean;
  offeredCashAmount?: number;
  requestedCashAmount?: number;
  itemRequests?: Array<{
    description: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  }>;
}

export interface BarterItemsResponse {
  success: boolean;
  data: {
    items: BarterItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface BarterOffersResponse {
  success: boolean;
  data: {
    items: BarterOffer[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface BarterOfferResponse {
  success: boolean;
  data: BarterOffer;
}

// Get barterable items (public)
export const getBarterItems = async (params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  search?: string;
  minValue?: number;
  maxValue?: number;
}): Promise<BarterItemsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.search) queryParams.append('search', params.search);
  if (params?.minValue) queryParams.append('minValue', params.minValue.toString());
  if (params?.maxValue) queryParams.append('maxValue', params.maxValue.toString());

  const response = await apiClient.get(`/barter/items?${queryParams.toString()}`);
  return response.data;
};

// Get my barter offers
export const getMyBarterOffers = async (): Promise<BarterOffersResponse> => {
  const response = await apiClient.get('/barter/offers/my');
  return response.data;
};

// Get open barter offers (from others)
export const getOpenBarterOffers = async (): Promise<BarterOffersResponse> => {
  const response = await apiClient.get('/barter/offers/open');
  return response.data;
};

// Get barter offer by ID
export const getBarterOffer = async (id: string): Promise<BarterOfferResponse> => {
  const response = await apiClient.get(`/barter/offers/${id}`);
  return response.data;
};

// Create barter offer
export const createBarterOffer = async (
  data: CreateBarterOfferData
): Promise<BarterOfferResponse> => {
  // Transform frontend data to backend format
  const backendData: BackendBarterOfferData = {
    offeredItemIds: data.offeredItemIds,
    preferenceSets: data.requestedItemIds.length > 0 ? [
      {
        priority: 1,
        itemIds: data.requestedItemIds,
        description: data.message,
      },
    ] : [],
    recipientId: data.recipientId,
    notes: data.message,
    isOpenOffer: !data.recipientId, // Open offer if no specific recipient
    offeredCashAmount: data.offeredCashAmount || 0,
    requestedCashAmount: data.requestedCashAmount || 0,
    itemRequests: data.itemRequest ? [data.itemRequest] : undefined,
  };

  const response = await apiClient.post('/barter/offers', backendData);
  return response.data;
};

// Accept barter offer
export const acceptBarterOffer = async (id: string): Promise<BarterOfferResponse> => {
  const response = await apiClient.post(`/barter/offers/${id}/accept`);
  return response.data;
};

// Reject barter offer
export const rejectBarterOffer = async (
  id: string,
  reason?: string
): Promise<BarterOfferResponse> => {
  const response = await apiClient.post(`/barter/offers/${id}/reject`, { reason });
  return response.data;
};

// Create counter offer
export const createCounterOffer = async (
  id: string,
  data: CreateBarterOfferData
): Promise<BarterOfferResponse> => {
  const response = await apiClient.post(`/barter/offers/${id}/counter`, data);
  return response.data;
};

// Cancel barter offer
export const cancelBarterOffer = async (id: string): Promise<BarterOfferResponse> => {
  const response = await apiClient.post(`/barter/offers/${id}/cancel`);
  return response.data;
};

// Complete barter exchange
export const completeBarterExchange = async (id: string): Promise<BarterOfferResponse> => {
  const response = await apiClient.post(`/barter/offers/${id}/complete`);
  return response.data;
};

// Find barter matches for an item
export const findBarterMatches = async (itemId: string): Promise<BarterItemsResponse> => {
  const response = await apiClient.get(`/barter/matches/${itemId}`);
  return response.data;
};

// ============================================
// Barter Chains (Multi-party trades)
// ============================================

// Discover chain opportunities for an item
export const discoverChainOpportunities = async (itemId: string): Promise<any> => {
  const response = await apiClient.get(`/barter/items/${itemId}/discover`);
  return response.data;
};

// Get my barter chains
export const getMyBarterChains = async (): Promise<any> => {
  const response = await apiClient.get('/barter/chains/my');
  return response.data;
};

// Get pending chain proposals
export const getPendingChainProposals = async (): Promise<any> => {
  const response = await apiClient.get('/barter/chains/pending');
  return response.data;
};

// Create smart barter proposal
export const createSmartProposal = async (itemId: string): Promise<any> => {
  const response = await apiClient.post('/barter/chains', { itemId });
  return response.data;
};

// Get chain by ID
export const getBarterChain = async (chainId: string): Promise<any> => {
  const response = await apiClient.get(`/barter/chains/${chainId}`);
  return response.data;
};

// Respond to chain proposal
export const respondToChain = async (chainId: string, accept: boolean, message?: string): Promise<any> => {
  const response = await apiClient.post(`/barter/chains/${chainId}/respond`, { accept, message });
  return response.data;
};

// Execute chain
export const executeChain = async (chainId: string): Promise<any> => {
  const response = await apiClient.post(`/barter/chains/${chainId}/execute`);
  return response.data;
};

// Cancel chain
export const cancelChain = async (chainId: string): Promise<any> => {
  const response = await apiClient.delete(`/barter/chains/${chainId}`);
  return response.data;
};
