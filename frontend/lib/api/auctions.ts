import apiClient from './client';

export interface Auction {
  id: string;
  itemId: string;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  minBidIncrement?: number;
  startTime: string;
  endTime: string;
  status: 'PENDING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';
  winnerId?: string;
  bidCount: number;
  item: {
    id: string;
    title: string;
    description: string;
    condition: string;
    images: Array<{ id: string; url: string; isPrimary: boolean }>;
    category: {
      id: string;
      nameEn: string;
      nameAr: string;
    };
    seller: {
      id: string;
      fullName: string;
      userType: string;
    };
  };
  bids?: Array<{
    id: string;
    bidAmount: number;
    amount?: number; // Legacy support
    createdAt: string;
    bidder: {
      id: string;
      fullName: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAuctionData {
  itemId: string;
  startingPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  startTime: string;
  endTime: string;
}

export interface PlaceBidData {
  bidAmount: number;
}

export interface AuctionsResponse {
  success: boolean;
  data: {
    auctions: Auction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface AuctionResponse {
  success: boolean;
  data: Auction;
}

export interface BidResponse {
  success: boolean;
  data: {
    id: string;
    auctionId: string;
    amount: number;
    createdAt: string;
  };
}

// Get all auctions
export const getAuctions = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
}): Promise<AuctionsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());

  const response = await apiClient.get(`/auctions?${queryParams.toString()}`);
  return response.data;
};

// Get single auction
export const getAuction = async (id: string): Promise<AuctionResponse> => {
  const response = await apiClient.get(`/auctions/${id}`);
  return response.data;
};

// Create auction
export const createAuction = async (data: CreateAuctionData): Promise<AuctionResponse> => {
  const response = await apiClient.post('/auctions', data);
  return response.data;
};

// Place bid
export const placeBid = async (auctionId: string, data: PlaceBidData): Promise<BidResponse> => {
  const response = await apiClient.post(`/auctions/${auctionId}/bid`, data);
  return response.data;
};

// Buy now
export const buyNow = async (auctionId: string): Promise<AuctionResponse> => {
  const response = await apiClient.post(`/auctions/${auctionId}/buy-now`);
  return response.data;
};

// Get my auctions (as seller)
export const getMyAuctions = async (): Promise<AuctionsResponse> => {
  const response = await apiClient.get('/auctions/my');
  return response.data;
};

// Get my bids
export const getMyBids = async (): Promise<AuctionsResponse> => {
  const response = await apiClient.get('/auctions/my-bids');
  return response.data;
};

// Cancel auction
export const cancelAuction = async (id: string): Promise<AuctionResponse> => {
  const response = await apiClient.patch(`/auctions/${id}/cancel`);
  return response.data;
};
