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
    name: string;
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
  const response = await apiClient.post('/barter/offers', data);
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
