import apiClient from './client';

// ============================================
// أنواع البيانات - Types
// ============================================

export type AuctionType = 'ENGLISH' | 'SEALED_BID' | 'DUTCH';
export type AuctionCategory = 'GENERAL' | 'CARS' | 'PROPERTIES' | 'ELECTRONICS' | 'ANTIQUES' | 'ART' | 'JEWELRY' | 'COLLECTIBLES' | 'INDUSTRIAL';
export type AuctionStatus = 'DRAFT' | 'SCHEDULED' | 'ACTIVE' | 'ENDED' | 'CANCELLED' | 'COMPLETED';
export type DepositStatus = 'PENDING' | 'PAID' | 'REFUNDED' | 'FORFEITED' | 'APPLIED';
export type DisputeStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'ESCALATED' | 'CLOSED';

export interface Auction {
  id: string;
  itemId: string;
  listingId: string;
  startingPrice: number;
  currentPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  minBidIncrement?: number;
  startTime: string;
  endTime: string;
  status: AuctionStatus;
  auctionType: AuctionType;
  auctionCategory?: AuctionCategory;
  requiresDeposit: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  isFeatured: boolean;
  watchlistCount: number;
  winnerId?: string;
  bidCount: number;
  totalBids?: number;
  uniqueBidders?: number;
  views?: number;
  governorate?: string;
  city?: string;
  item: {
    id: string;
    title: string;
    description: string;
    condition: string;
    images: Array<string | { id: string; url: string; isPrimary: boolean }>;
    category: {
      id: string;
      nameEn: string;
      nameAr: string;
    };
    seller: {
      id: string;
      fullName: string;
      userType: string;
      rating?: number;
    };
  };
  listing?: {
    item: Auction['item'];
    user?: {
      id: string;
      fullName: string;
      userType: string;
      rating?: number;
    };
  };
  bids?: Array<{
    id: string;
    bidAmount: number;
    amount?: number;
    createdAt: string;
    bidder: {
      id: string;
      fullName: string;
    };
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface WatchlistItem {
  id: string;
  userId: string;
  auctionId: string;
  notifyOnBid: boolean;
  notifyOnOutbid: boolean;
  notifyOnEnding: boolean;
  notifyBeforeEnd: number;
  priceThreshold?: number;
  addedAt: string;
  auction: Auction;
}

export interface AuctionDeposit {
  id: string;
  userId: string;
  auctionId: string;
  amount: number;
  status: DepositStatus;
  paymentMethod: string;
  paymentReference?: string;
  paidAt?: string;
  refundedAt?: string;
  forfeitedAt?: string;
  auction: Auction;
}

export interface SealedBid {
  id: string;
  auctionId: string;
  bidderId: string;
  encryptedBidAmount: string;
  bidAmount?: number;
  isRevealed: boolean;
  isWinner: boolean;
  submittedAt: string;
  revealedAt?: string;
  auction: Auction;
}

export interface AuctionDispute {
  id: string;
  auctionId: string
  initiatorId: string;
  respondentId: string;
  disputeType: string;
  reason: string;
  description: string;
  status: DisputeStatus;
  resolution?: string;
  initiator: { id: string; fullName: string };
  respondent: { id: string; fullName: string };
  messages: DisputeMessage[];
  createdAt: string;
  resolvedAt?: string;
}

export interface DisputeMessage {
  id: string;
  disputeId: string;
  senderId: string;
  message: string;
  isAdmin: boolean;
  attachments: string[];
  createdAt: string;
}

export interface AuctionReview {
  id: string;
  auctionId: string;
  reviewerId: string;
  revieweeId: string;
  overallRating: number;
  accuracyRating?: number;
  communicationRating?: number;
  shippingRating?: number;
  paymentRating?: number;
  comment: string;
  images: string[];
  response?: string;
  respondedAt?: string;
  reviewer: { id: string; fullName: string; avatar?: string };
  reviewee: { id: string; fullName: string; avatar?: string };
  createdAt: string;
}

export interface CreateAuctionData {
  itemId?: string;
  // Item data (when creating item and auction together)
  title?: string;
  description?: string;
  condition?: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  categoryId?: string;
  images?: string[];
  governorate?: string;
  city?: string;
  // Auction settings
  startingPrice: number;
  reservePrice?: number;
  buyNowPrice?: number;
  minBidIncrement?: number;
  startTime: string;
  endTime: string;
  auctionType?: AuctionType;
  auctionCategory?: AuctionCategory;
  requiresDeposit?: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  autoExtend?: boolean;
  extensionMinutes?: number;
  isFeatured?: boolean;
}

export interface PlaceBidData {
  bidAmount: number;
  maxAutoBid?: number;
}

export interface AddToWatchlistData {
  notifyOnBid?: boolean;
  notifyOnOutbid?: boolean;
  notifyOnEnding?: boolean;
  notifyBeforeEnd?: number;
  priceThreshold?: number;
}

export interface SubmitSealedBidData {
  bidAmount: number;
  maxBid?: number;
}

export interface CreateDisputeData {
  disputeType: 'NON_PAYMENT' | 'ITEM_NOT_AS_DESCRIBED' | 'ITEM_NOT_RECEIVED' | 'UNAUTHORIZED_BID' | 'SHILL_BIDDING' | 'OTHER';
  reason: string;
  description: string;
  attachments?: string[];
}

export interface CreateReviewData {
  overallRating: number;
  accuracyRating?: number;
  communicationRating?: number;
  shippingRating?: number;
  paymentRating?: number;
  comment: string;
  images?: string[];
}

// Response Types
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

export interface WatchlistResponse {
  success: boolean;
  data: {
    items: WatchlistItem[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface DepositsResponse {
  success: boolean;
  data: {
    deposits: AuctionDeposit[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface SealedBidsResponse {
  success: boolean;
  data: {
    bids: SealedBid[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface DisputesResponse {
  success: boolean;
  data: {
    disputes: AuctionDispute[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: AuctionReview[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// ============================================
// المزادات الأساسية - Basic Auction APIs
// ============================================

// Get all auctions
export const getAuctions = async (params?: {
  page?: number;
  limit?: number;
  status?: string;
  auctionType?: AuctionType;
  auctionCategory?: AuctionCategory;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  governorate?: string;
  isFeatured?: boolean;
  search?: string;
}): Promise<AuctionsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.status) queryParams.append('status', params.status);
  if (params?.auctionType) queryParams.append('auctionType', params.auctionType);
  if (params?.auctionCategory) queryParams.append('auctionCategory', params.auctionCategory);
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.governorate) queryParams.append('governorate', params.governorate);
  if (params?.isFeatured) queryParams.append('isFeatured', 'true');
  if (params?.search) queryParams.append('search', params.search);

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

// ============================================
// قائمة المراقبة - Watchlist APIs
// ============================================

// Get user's watchlist
export const getWatchlist = async (page = 1, limit = 20): Promise<WatchlistResponse> => {
  const response = await apiClient.get(`/auctions/watchlist?page=${page}&limit=${limit}`);
  return response.data;
};

// Add auction to watchlist
export const addToWatchlist = async (auctionId: string, data: AddToWatchlistData = {}): Promise<{ success: boolean; data: WatchlistItem }> => {
  const response = await apiClient.post(`/auctions/${auctionId}/watchlist`, data);
  return response.data;
};

// Remove from watchlist
export const removeFromWatchlist = async (auctionId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/auctions/${auctionId}/watchlist`);
  return response.data;
};

// Check if auction is in watchlist
export const checkWatchlist = async (auctionId: string): Promise<{ success: boolean; data: { isInWatchlist: boolean } }> => {
  const response = await apiClient.get(`/auctions/${auctionId}/watchlist/check`);
  return response.data;
};

// ============================================
// الإيداعات - Deposits APIs
// ============================================

// Get user's deposits
export const getUserDeposits = async (page = 1, limit = 20): Promise<DepositsResponse> => {
  const response = await apiClient.get(`/auctions/deposits?page=${page}&limit=${limit}`);
  return response.data;
};

// Pay deposit for auction
export const payDeposit = async (auctionId: string, data: { paymentMethod: string; paymentReference?: string }): Promise<{ success: boolean; data: AuctionDeposit }> => {
  const response = await apiClient.post(`/auctions/${auctionId}/deposit`, data);
  return response.data;
};

// Check if user has valid deposit
export const checkDeposit = async (auctionId: string): Promise<{ success: boolean; data: { hasDeposit: boolean } }> => {
  const response = await apiClient.get(`/auctions/${auctionId}/deposit/check`);
  return response.data;
};

// ============================================
// المزايدات المختومة - Sealed Bids APIs
// ============================================

// Submit sealed bid
export const submitSealedBid = async (auctionId: string, data: SubmitSealedBidData): Promise<{ success: boolean; data: SealedBid }> => {
  const response = await apiClient.post(`/auctions/${auctionId}/sealed-bid`, data);
  return response.data;
};

// Get my sealed bids
export const getMySealedBids = async (page = 1, limit = 20): Promise<SealedBidsResponse> => {
  const response = await apiClient.get(`/auctions/my-sealed-bids?page=${page}&limit=${limit}`);
  return response.data;
};

// Check if sealed bid submitted
export const checkSealedBid = async (auctionId: string): Promise<{ success: boolean; data: { hasSubmitted: boolean } }> => {
  const response = await apiClient.get(`/auctions/${auctionId}/sealed-bid/check`);
  return response.data;
};

// ============================================
// المزايدة بالوكالة - Proxy Bidding APIs
// ============================================

// Set proxy bid (auto-bid)
export const setProxyBid = async (auctionId: string, maxBidAmount: number): Promise<BidResponse> => {
  const response = await apiClient.post(`/auctions/${auctionId}/proxy-bid`, { maxBidAmount });
  return response.data;
};

// ============================================
// النزاعات - Disputes APIs
// ============================================

// Get user's disputes
export const getUserDisputes = async (page = 1, limit = 20): Promise<DisputesResponse> => {
  const response = await apiClient.get(`/auctions/disputes?page=${page}&limit=${limit}`);
  return response.data;
};

// Create dispute
export const createDispute = async (auctionId: string, data: CreateDisputeData): Promise<{ success: boolean; data: AuctionDispute }> => {
  const response = await apiClient.post(`/auctions/${auctionId}/dispute`, data);
  return response.data;
};

// Get dispute details
export const getDisputeDetails = async (disputeId: string): Promise<{ success: boolean; data: AuctionDispute }> => {
  const response = await apiClient.get(`/auctions/disputes/${disputeId}`);
  return response.data;
};

// Respond to dispute
export const respondToDispute = async (disputeId: string, message: string, attachments?: string[]): Promise<{ success: boolean; data: DisputeMessage }> => {
  const response = await apiClient.post(`/auctions/disputes/${disputeId}/respond`, { message, attachments });
  return response.data;
};

// ============================================
// التقييمات - Reviews APIs
// ============================================

// Create review
export const createReview = async (auctionId: string, data: CreateReviewData): Promise<{ success: boolean; data: AuctionReview }> => {
  const response = await apiClient.post(`/auctions/${auctionId}/review`, data);
  return response.data;
};

// Get auction reviews
export const getAuctionReviews = async (auctionId: string): Promise<{ success: boolean; data: AuctionReview[] }> => {
  const response = await apiClient.get(`/auctions/${auctionId}/reviews`);
  return response.data;
};

// Respond to review
export const respondToReview = async (reviewId: string, response: string): Promise<{ success: boolean; data: AuctionReview }> => {
  const res = await apiClient.post(`/auctions/reviews/${reviewId}/respond`, { response });
  return res.data;
};

// Check if user can review auction
export const canReviewAuction = async (auctionId: string): Promise<{ success: boolean; data: { canReview: boolean; reason?: string } }> => {
  const response = await apiClient.get(`/auctions/${auctionId}/can-review`);
  return response.data;
};

// Get my reviews
export const getMyReviews = async (type: 'received' | 'given' = 'received', page = 1, limit = 20): Promise<ReviewsResponse> => {
  const response = await apiClient.get(`/auctions/my-reviews?type=${type}&page=${page}&limit=${limit}`);
  return response.data;
};

// ============================================
// البحث المتقدم - Advanced Search
// ============================================

export const searchAuctions = async (params: {
  query?: string;
  auctionType?: AuctionType;
  auctionCategory?: AuctionCategory;
  minPrice?: number;
  maxPrice?: number;
  status?: AuctionStatus;
  governorate?: string;
  city?: string;
  endingSoon?: boolean;
  hasNoBids?: boolean;
  sortBy?: 'endTime' | 'currentPrice' | 'bidCount' | 'watchlistCount';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}): Promise<AuctionsResponse> => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const response = await apiClient.get(`/auctions/search?${queryParams.toString()}`);
  return response.data;
};

// ============================================
// المزادات المميزة - Featured Auctions
// ============================================

export const getFeaturedAuctions = async (limit = 6): Promise<AuctionsResponse> => {
  const response = await apiClient.get(`/auctions?isFeatured=true&status=ACTIVE&limit=${limit}`);
  return response.data;
};

// ============================================
// المزادات المنتهية قريباً - Ending Soon
// ============================================

export const getEndingSoonAuctions = async (limit = 6): Promise<AuctionsResponse> => {
  const response = await apiClient.get(`/auctions?status=ACTIVE&sortBy=endTime&sortOrder=asc&limit=${limit}`);
  return response.data;
};
