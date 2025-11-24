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
  description?: string; // For description-based requests
  offeredCashAmount?: number;
  requestedCashAmount?: number;
  itemRequest?: {
    description: string;
    categoryId?: string;
    subcategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    keywords?: string[];
    condition?: string;
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
    subcategoryId?: string;
    minPrice?: number;
    maxPrice?: number;
    keywords?: string[];
    condition?: string;
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
  const descriptionText = data.description || data.message;

  const backendData: BackendBarterOfferData = {
    offeredItemIds: data.offeredItemIds,
    preferenceSets: data.requestedItemIds.length > 0 ? [
      {
        priority: 1,
        itemIds: data.requestedItemIds || [],
        description: descriptionText,
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

// Discover chain opportunities for an item
export const discoverChainOpportunities = async (itemId: string): Promise<any> => {
  const response = await apiClient.get(`/barter/opportunities/${itemId}`);
  return response.data;
};

// Create chain proposal
export const createChainProposal = async (data: {
  participantItemIds: string[];
}): Promise<any> => {
  const response = await apiClient.post('/barter/chains', data);
  return response.data;
};

// Get my barter chains
export const getChainProposals = async (): Promise<any> => {
  const response = await apiClient.get('/barter/chains/my');
  return response.data;
};

// Get pending chain proposals
export const getPendingChainProposals = async (): Promise<any> => {
  const response = await apiClient.get('/barter/chains/pending');
  return response.data;
};

// Accept chain proposal
export const acceptChainProposal = async (chainId: string): Promise<any> => {
  const response = await apiClient.post(`/barter/chains/${chainId}/respond`, { action: 'ACCEPT' });
  return response.data;
};

// Reject chain proposal
export const rejectChainProposal = async (chainId: string): Promise<any> => {
  const response = await apiClient.post(`/barter/chains/${chainId}/respond`, { action: 'REJECT' });
  return response.data;
};

// Get matching offers (open offers from others)
export const getMatchingOffers = async (params?: {
  page?: number;
  limit?: number;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`/barter/offers/matching?${queryParams.toString()}`);
  return response.data;
};

// Get my barter offers
export const getMyBarterOffers = async (params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`/barter/offers/my?${queryParams.toString()}`);
  return response.data;
};
