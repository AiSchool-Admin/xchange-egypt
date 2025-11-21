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

export interface PreferenceSet {
  id: string;
  priority: number;
  totalValue: number;
  valueDifference: number;
  isBalanced: boolean;
  items: BarterItem[];
}

export interface BarterOffer {
  id: string;
  initiatorId: string;
  recipientId?: string;
  offeredItemIds: string[];
  offeredItems?: BarterItem[];
  offeredBundleValue: number;
  status: 'PENDING' | 'COUNTER_OFFERED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'COMPLETED' | 'CANCELLED';
  isOpenOffer: boolean;
  notes?: string;
  expiresAt?: string;
  preferenceSets?: PreferenceSet[];
  initiator: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  recipient?: {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BarterChainParticipant {
  id: string;
  userId: string;
  givingItemId: string;
  receivingItemId: string;
  position: number;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED';
  user: {
    id: string;
    fullName: string;
    email: string;
  };
  givingItem: BarterItem;
  receivingItem: BarterItem;
}

export interface BarterChain {
  id: string;
  chainType: 'CYCLE' | 'CHAIN';
  participantCount: number;
  matchScore: number;
  status: 'PROPOSED' | 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'COMPLETED' | 'EXPIRED' | 'CANCELLED';
  expiresAt: string;
  participants: BarterChainParticipant[];
  createdAt: string;
}

export interface SmartOpportunity {
  id: string;
  type: 'cycle' | 'chain' | 'CYCLE' | 'CHAIN';
  participants: Array<{
    id?: string;
    userId: string;
    givingItemId: string;
    receivingItemId: string;
    user?: { fullName: string };
    givingItem?: BarterItem;
    receivingItem?: BarterItem;
  }>;
  score: number;
  matchScore?: number;
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
    sent?: BarterOffer[];
    received?: BarterOffer[];
    offers?: BarterOffer[];
    items?: BarterOffer[];
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
  message?: string;
}

export interface BarterChainsResponse {
  success: boolean;
  data: {
    chains: BarterChain[];
  };
}

export interface BarterChainResponse {
  success: boolean;
  data: BarterChain;
  message?: string;
}

export interface SmartOpportunitiesResponse {
  success: boolean;
  data: {
    opportunities: SmartOpportunity[];
  };
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
    isOpenOffer: true,
  };

  const response = await apiClient.post('/barter/offers', backendData);
  return response.data;
};

// Accept barter offer
export const acceptBarterOffer = async (id: string, preferenceSetId?: string): Promise<BarterOfferResponse> => {
  const response = await apiClient.post(`/barter/offers/${id}/accept`, { preferenceSetId });
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
  data: { offeredItemIds: string[]; requestedItemIds: string[]; notes?: string }
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

// Get smart barter opportunities for an item
export const getSmartOpportunities = async (itemId: string): Promise<SmartOpportunitiesResponse> => {
  const response = await apiClient.get(`/barter/opportunities/${itemId}`);
  return response.data;
};

// ========== Chain/Multi-party Barter ==========

// Get my barter chains
export const getMyBarterChains = async (): Promise<BarterChainsResponse> => {
  const response = await apiClient.get('/barter/chains/my');
  return response.data;
};

// Get pending chain proposals
export const getPendingChainProposals = async (): Promise<BarterChainsResponse> => {
  const response = await apiClient.get('/barter/chains/pending');
  return response.data;
};

// Get chain statistics
export const getChainStats = async (): Promise<{ success: boolean; data: any }> => {
  const response = await apiClient.get('/barter/chains/stats');
  return response.data;
};

// Create smart barter proposal (chain/cycle)
export const createBarterChain = async (opportunity: SmartOpportunity): Promise<BarterChainResponse> => {
  const response = await apiClient.post('/barter/chains', opportunity);
  return response.data;
};

// Get chain by ID
export const getBarterChain = async (id: string): Promise<BarterChainResponse> => {
  const response = await apiClient.get(`/barter/chains/${id}`);
  return response.data;
};

// Respond to chain proposal (accept/reject)
export const respondToChainProposal = async (
  id: string,
  accept: boolean,
  reason?: string
): Promise<BarterChainResponse> => {
  const response = await apiClient.post(`/barter/chains/${id}/respond`, { accept, reason });
  return response.data;
};

// Execute/complete chain
export const executeBarterChain = async (id: string): Promise<BarterChainResponse> => {
  const response = await apiClient.post(`/barter/chains/${id}/execute`);
  return response.data;
};

// Cancel chain
export const cancelBarterChain = async (id: string): Promise<BarterChainResponse> => {
  const response = await apiClient.delete(`/barter/chains/${id}`);
  return response.data;
};

// ========== Multi-Party Matching Algorithm ==========

export interface BarterNode {
  userId: string;
  userName: string;
  userAvatar?: string;
  offeredItems: {
    id: string;
    title: string;
    value: number;
    categoryId: string;
    images?: { url: string }[];
  }[];
  wantedCategories: string[];
  wantedMinValue: number;
  wantedMaxValue: number;
}

export interface MultiPartyMatch {
  chain: BarterNode[];
  totalValue: number;
  matchScore: number;
  type: 'two-party' | 'three-party' | 'multi-party';
}

export interface MultiPartyMatchesResponse {
  success: boolean;
  data: {
    matches: MultiPartyMatch[];
  };
}

export interface SuggestedPartner {
  id: string;
  fullName: string;
  avatar?: string;
  matchingItems: BarterItem[];
  matchScore: number;
}

export interface SuggestedPartnersResponse {
  success: boolean;
  data: {
    partners: SuggestedPartner[];
  };
}

// Find multi-party barter matches
export const getMultiPartyMatches = async (maxChainLength?: number): Promise<MultiPartyMatchesResponse> => {
  const params = maxChainLength ? `?maxChainLength=${maxChainLength}` : '';
  const response = await apiClient.get(`/barter/multi-party-matches${params}`);
  return response.data;
};

// Get suggested barter partners
export const getSuggestedPartners = async (itemId?: string): Promise<SuggestedPartnersResponse> => {
  const params = itemId ? `?itemId=${itemId}` : '';
  const response = await apiClient.get(`/barter/suggested-partners${params}`);
  return response.data;
};
