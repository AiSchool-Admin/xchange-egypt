/**
 * Reviews API Client
 * API for the review and rating system
 */

import apiClient from './client';

// Types
export type ReviewStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED' | 'HIDDEN';
export type ReviewType = 'SELLER_REVIEW' | 'BUYER_REVIEW' | 'ITEM_REVIEW';
export type ReportReason = 'SPAM' | 'OFFENSIVE_LANGUAGE' | 'FAKE_REVIEW' | 'IRRELEVANT' | 'PERSONAL_INFORMATION' | 'OTHER';

export interface Review {
  id: string;
  transactionId: string;
  reviewerId: string;
  reviewedId: string;
  reviewType: ReviewType;
  overallRating: number;
  itemAsDescribed?: number;
  communication?: number;
  shippingSpeed?: number;
  packaging?: number;
  title?: string;
  comment?: string;
  images: string[];
  isVerifiedPurchase: boolean;
  status: ReviewStatus;
  helpfulCount: number;
  notHelpfulCount: number;
  reportCount: number;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
  reviewer?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating: number;
    totalReviews: number;
  };
  reviewed?: {
    id: string;
    fullName: string;
    avatar?: string;
    rating?: number;
  };
  response?: ReviewResponse;
  votes?: ReviewVote[];
  _count?: {
    votes: number;
  };
}

export interface ReviewResponse {
  id: string;
  reviewId: string;
  responderId: string;
  message: string;
  isEdited: boolean;
  editedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewVote {
  id: string;
  reviewId: string;
  userId: string;
  isHelpful: boolean;
  createdAt: string;
}

export interface ReviewStats {
  totalReviews: number;
  averageRating: number;
  ratingBreakdown: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  verifiedPurchasePercentage: number;
  detailedRatings: {
    itemAsDescribed: number;
    communication: number;
    shippingSpeed: number;
    packaging: number;
  };
}

export interface CreateReviewInput {
  transactionId: string;
  reviewedId: string;
  reviewType?: ReviewType;
  overallRating: number;
  itemAsDescribed?: number;
  communication?: number;
  shippingSpeed?: number;
  packaging?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface UpdateReviewInput {
  overallRating?: number;
  itemAsDescribed?: number;
  communication?: number;
  shippingSpeed?: number;
  packaging?: number;
  title?: string;
  comment?: string;
  images?: string[];
}

export interface GetReviewsParams {
  reviewedId?: string;
  reviewerId?: string;
  transactionId?: string;
  reviewType?: ReviewType;
  status?: ReviewStatus;
  minRating?: number;
  maxRating?: number;
  isVerifiedPurchase?: boolean;
  page?: number;
  limit?: number;
  sortBy?: 'recent' | 'rating_high' | 'rating_low' | 'helpful';
}

// API Response types
interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface PaginatedResponse<T> {
  success: boolean;
  data: {
    reviews: T[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// ============================================
// Review CRUD Operations
// ============================================

/**
 * Create a new review
 */
export const createReview = async (input: CreateReviewInput): Promise<ApiResponse<Review>> => {
  const response = await apiClient.post('/reviews', input);
  return response.data;
};

/**
 * Get reviews with filters
 */
export const getReviews = async (params?: GetReviewsParams): Promise<PaginatedResponse<Review>> => {
  const queryParams = new URLSearchParams();

  if (params?.reviewedId) queryParams.append('reviewedId', params.reviewedId);
  if (params?.reviewerId) queryParams.append('reviewerId', params.reviewerId);
  if (params?.transactionId) queryParams.append('transactionId', params.transactionId);
  if (params?.reviewType) queryParams.append('reviewType', params.reviewType);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.minRating) queryParams.append('minRating', params.minRating.toString());
  if (params?.maxRating) queryParams.append('maxRating', params.maxRating.toString());
  if (params?.isVerifiedPurchase !== undefined) queryParams.append('isVerifiedPurchase', params.isVerifiedPurchase.toString());
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

  const response = await apiClient.get(`/reviews?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get a single review by ID
 */
export const getReviewById = async (id: string): Promise<ApiResponse<Review>> => {
  const response = await apiClient.get(`/reviews/${id}`);
  return response.data;
};

/**
 * Update a review
 */
export const updateReview = async (id: string, input: UpdateReviewInput): Promise<ApiResponse<Review>> => {
  const response = await apiClient.patch(`/reviews/${id}`, input);
  return response.data;
};

/**
 * Delete a review
 */
export const deleteReview = async (id: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete(`/reviews/${id}`);
  return response.data;
};

// ============================================
// Review Response Operations
// ============================================

/**
 * Add a response to a review
 */
export const addReviewResponse = async (reviewId: string, message: string): Promise<ApiResponse<ReviewResponse>> => {
  const response = await apiClient.post(`/reviews/${reviewId}/response`, { message });
  return response.data;
};

/**
 * Update a review response
 */
export const updateReviewResponse = async (responseId: string, message: string): Promise<ApiResponse<ReviewResponse>> => {
  const response = await apiClient.patch(`/reviews/responses/${responseId}`, { message });
  return response.data;
};

/**
 * Delete a review response
 */
export const deleteReviewResponse = async (responseId: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete(`/reviews/responses/${responseId}`);
  return response.data;
};

// ============================================
// Review Voting Operations
// ============================================

/**
 * Vote on a review (helpful/not helpful)
 */
export const voteReview = async (reviewId: string, isHelpful: boolean): Promise<ApiResponse<ReviewVote>> => {
  const response = await apiClient.post(`/reviews/${reviewId}/vote`, { isHelpful });
  return response.data;
};

/**
 * Remove vote from a review
 */
export const removeVote = async (reviewId: string): Promise<ApiResponse<{ message: string }>> => {
  const response = await apiClient.delete(`/reviews/${reviewId}/vote`);
  return response.data;
};

// ============================================
// Review Reporting Operations
// ============================================

/**
 * Report a review
 */
export const reportReview = async (
  reviewId: string,
  reason: ReportReason,
  description?: string
): Promise<ApiResponse<any>> => {
  const response = await apiClient.post(`/reviews/${reviewId}/report`, { reason, description });
  return response.data;
};

// ============================================
// Statistics Operations
// ============================================

/**
 * Get review statistics for a user
 */
export const getUserReviewStats = async (userId: string): Promise<ApiResponse<ReviewStats>> => {
  const response = await apiClient.get(`/reviews/users/${userId}/stats`);
  return response.data;
};

/**
 * Check if user can review a transaction
 */
export const canReviewTransaction = async (transactionId: string): Promise<ApiResponse<{ canReview: boolean; reason?: string }>> => {
  const response = await apiClient.get(`/reviews/transactions/${transactionId}/can-review`);
  return response.data;
};
