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
  offererId: string;
  offeredItems: BarterItem[];
  requestedItems: BarterItem[];
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED';
  message?: string;
  counterOfferId?: string;
  offeredBundleValue?: number;
  itemRequests?: Array<{
    id: string;
    description: string;
    categoryId?: string;
    minPrice?: number;
    maxPrice?: number;
  }>;
  offerer: {
    id: string;
    fullName: string;
    email: string;
    userType: string;
  };
  recipient: {
    id: string;
    fullName: string;
    email: string;
    userType: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateBarterOfferData {
  offeredItemIds: string[];
  requestedItemIds: string[];
  message?: string;
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
    offers: BarterOffer[];
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
    preferenceSets: [
      {
        priority: 1,
        itemIds: data.requestedItemIds,
        description: data.message,
      },
    ],
    notes: data.message,
    isOpenOffer: true, // Open offer means anyone with the requested items can accept
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
  const response = await apiClient.post('/barter/chains/proposals', data);
  return response.data;
};

// Get chain proposals
export const getChainProposals = async (): Promise<any> => {
  const response = await apiClient.get('/barter/chains/proposals');
  return response.data;
};

// Accept chain proposal
export const acceptChainProposal = async (proposalId: string): Promise<any> => {
  const response = await apiClient.post(`/barter/chains/proposals/${proposalId}/accept`);
  return response.data;
};

// Reject chain proposal
export const rejectChainProposal = async (proposalId: string): Promise<any> => {
  const response = await apiClient.post(`/barter/chains/proposals/${proposalId}/reject`);
  return response.data;
};

// Get barter offers with filters
export const getBarterOffers = async (params?: {
  status?: string;
  isOpen?: boolean;
  page?: number;
  limit?: number;
}): Promise<any> => {
  const queryParams = new URLSearchParams();
  if (params?.status) queryParams.append('status', params.status);
  if (params?.isOpen !== undefined) queryParams.append('isOpen', params.isOpen.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`/barter/offers?${queryParams.toString()}`);
  return response.data;
};
