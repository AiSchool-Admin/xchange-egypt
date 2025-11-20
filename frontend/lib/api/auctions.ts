import apiClient from './client';

export interface AuctionItem {
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
    businessName?: string;
    avatar?: string;
    rating?: number;
    userType?: string;
  };
}

export interface AuctionBid {
  id: string;
  auctionId: string;
  bidderId: string;
  bidAmount: number;
  isAutoBid?: boolean;
  maxAutoBid?: number;
  status: 'ACTIVE' | 'OUTBID' | 'WINNING' | 'WON' | 'LOST' | 'CANCELLED';
  createdAt: string;
  bidder: {
    id: string;
    fullName: string;
    businessName?: string;
    rating?: number;
  };
  // Legacy compatibility
  amount?: number;
}

export interface Auction {
  id: string;
  listingId?: string;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  minBidIncrement?: number;
  startTime: string;
  endTime: string;
  actualEndTime?: string;
  status: 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'COMPLETED' | 'CANCELLED';
  winnerId?: string;
  winningBidId?: string;
  totalBids?: number;
  uniqueBidders?: number;
  views?: number;
  autoExtend?: boolean;
  timesExtended?: number;
  listing?: {
    id: string;
    itemId: string;
    item: AuctionItem;
  };
  bids?: AuctionBid[];
  winningBid?: AuctionBid;
  // Legacy compatibility
  item?: AuctionItem;
  itemId?: string;
  bidCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface MyAuctionBid {
  auction: Auction;
  bids: AuctionBid[];
  latestBid: AuctionBid;
  totalBids: number;
}

export interface CreateAuctionData {
  itemId: string;
  startingPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  minBidIncrement?: number;
  startTime: string;
  endTime: string;
  autoExtend?: boolean;
  extensionMinutes?: number;
  extensionThreshold?: number;
  maxExtensions?: number;
}

export interface PlaceBidData {
  bidAmount: number;
  maxAutoBid?: number;
  // Legacy compatibility
  amount?: number;
}

export interface AuctionsResponse {
  success: boolean;
  data: {
    auctions: Auction[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages?: number;
      pages?: number;
    };
  };
}

export interface AuctionResponse {
  success: boolean;
  data: Auction;
}

export interface BidResponse {
  success: boolean;
  data: AuctionBid;
}

export interface MyBidsResponse {
  success: boolean;
  data: MyAuctionBid[];
}

// Get all auctions
export const getAuctions = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<AuctionsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

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

// Update auction (before it starts or has bids)
export const updateAuction = async (id: string, data: Partial<CreateAuctionData>): Promise<AuctionResponse> => {
  const response = await apiClient.patch(`/auctions/${id}`, data);
  return response.data;
};

// Place bid
export const placeBid = async (auctionId: string, data: PlaceBidData): Promise<BidResponse> => {
  // Transform to backend format
  const payload = {
    bidAmount: data.bidAmount || data.amount,
    maxAutoBid: data.maxAutoBid,
  };
  const response = await apiClient.post(`/auctions/${auctionId}/bid`, payload);
  return response.data;
};

// Buy now
export const buyNow = async (auctionId: string): Promise<AuctionResponse> => {
  const response = await apiClient.post(`/auctions/${auctionId}/buy-now`);
  return response.data;
};

// Get my auctions (as seller)
export const getMyAuctions = async (status?: string): Promise<AuctionsResponse> => {
  const queryParams = status ? `?status=${status}` : '';
  const response = await apiClient.get(`/auctions/my${queryParams}`);
  return response.data;
};

// Get my bids
export const getMyBids = async (): Promise<MyBidsResponse> => {
  const response = await apiClient.get('/auctions/my-bids');
  return response.data;
};

// Cancel auction
export const cancelAuction = async (id: string, reason?: string): Promise<AuctionResponse> => {
  const response = await apiClient.patch(`/auctions/${id}/cancel`, { reason });
  return response.data;
};

// Helper to get item from auction (handles nested structure)
export const getAuctionItem = (auction: Auction): AuctionItem | undefined => {
  return auction.listing?.item || auction.item;
};

// Helper to get bid count
export const getAuctionBidCount = (auction: Auction): number => {
  return auction.totalBids || auction.bidCount || 0;
};

// Helper to get bid amount (handles both formats)
export const getBidAmount = (bid: AuctionBid): number => {
  return bid.bidAmount || bid.amount || 0;
};
