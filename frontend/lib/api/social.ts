import apiClient from './client';

// ============================================
// Social Features API
// ============================================

export interface UserProfile {
  id: string;
  fullName: string;
  avatar?: string;
  bio?: string;
  governorate?: string;
  followerCount: number;
  followingCount: number;
  listingCount: number;
  isFollowing: boolean;
  isFollowedBy: boolean;
  joinedAt: string;
}

export interface ActivityItem {
  id: string;
  type: 'NEW_LISTING' | 'PRICE_DROP' | 'SOLD' | 'NEW_REVIEW' | 'ACHIEVEMENT';
  userId: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  data: {
    listingId?: string;
    listingTitle?: string;
    listingImage?: string;
    oldPrice?: number;
    newPrice?: number;
    reviewRating?: number;
    achievementName?: string;
  };
  createdAt: string;
}

export interface FeedResponse {
  success: boolean;
  data: {
    activities: ActivityItem[];
    pagination: {
      page: number;
      limit: number;
      hasMore: boolean;
    };
  };
}

// Follow a user
export const followUser = async (userId: string) => {
  const response = await apiClient.post(`/social/follow/${userId}`);
  return response.data;
};

// Unfollow a user
export const unfollowUser = async (userId: string) => {
  const response = await apiClient.delete(`/social/follow/${userId}`);
  return response.data;
};

// Get followers
export const getFollowers = async (userId: string, page = 1, limit = 20) => {
  const response = await apiClient.get(`/social/followers/${userId}`, {
    params: { page, limit },
  });
  return response.data;
};

// Get following
export const getFollowing = async (userId: string, page = 1, limit = 20) => {
  const response = await apiClient.get(`/social/following/${userId}`, {
    params: { page, limit },
  });
  return response.data;
};

// Get activity feed
export const getFeed = async (page = 1, limit = 20): Promise<FeedResponse> => {
  const response = await apiClient.get('/social/feed', {
    params: { page, limit },
  });
  return response.data;
};

// Get user profile
export const getUserProfile = async (userId: string) => {
  const response = await apiClient.get(`/social/profile/${userId}`);
  return response.data;
};

// Discover users to follow
export const discoverUsers = async (limit = 10) => {
  const response = await apiClient.get('/social/discover', {
    params: { limit },
  });
  return response.data;
};

// Search users
export const searchUsers = async (query: string, limit = 20) => {
  const response = await apiClient.get('/social/search', {
    params: { query, limit },
  });
  return response.data;
};
