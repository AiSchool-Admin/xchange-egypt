import apiClient from './client';

// ============================================
// Badges API Client
// عميل API الشارات
// ============================================

export interface BadgeInfo {
  type: string;
  nameAr: string;
  nameEn: string;
  description: string;
  icon: string;
  color: string;
  requirements: string[];
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeType: string;
  earnedAt: string;
  verifiedBy?: string;
  verificationNotes?: string;
  info?: BadgeInfo;
}

// Get all available badges info
export const getAllBadgesInfo = async (): Promise<{
  success: boolean;
  data: { badges: BadgeInfo[] };
}> => {
  const response = await apiClient.get('/badges');
  return response.data;
};

// Get badge requirements
export const getBadgeRequirements = async (badgeType: string): Promise<{
  success: boolean;
  data: { requirements: string[] };
}> => {
  const response = await apiClient.get(`/badges/requirements/${badgeType}`);
  return response.data;
};

// Get my badges
export const getMyBadges = async (): Promise<{
  success: boolean;
  data: { badges: UserBadge[] };
}> => {
  const response = await apiClient.get('/badges/my');
  return response.data;
};

// Get user's badges
export const getUserBadges = async (userId: string): Promise<{
  success: boolean;
  data: { badges: UserBadge[] };
}> => {
  const response = await apiClient.get(`/badges/user/${userId}`);
  return response.data;
};

// Check and award automatic badges
export const checkMyBadges = async (): Promise<{
  success: boolean;
  data: { awardedBadges: UserBadge[] };
  message: string;
}> => {
  const response = await apiClient.post('/badges/check');
  return response.data;
};

// Submit verification request
export const submitVerificationRequest = async (data: {
  badgeType: string;
  documents?: string[];
}): Promise<{
  success: boolean;
  data: {
    status: string;
    message: string;
    badgeType: string;
    info: BadgeInfo;
  };
}> => {
  const response = await apiClient.post('/badges/verify', data);
  return response.data;
};

// Badge display helpers
export const BADGE_DISPLAY = {
  PHONE_VERIFIED: {
    icon: '📱',
    color: 'emerald',
    bgColor: 'bg-emerald-100',
    textColor: 'text-emerald-700',
  },
  EMAIL_VERIFIED: {
    icon: '📧',
    color: 'blue',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
  },
  ID_VERIFIED: {
    icon: '🪪',
    color: 'purple',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
  },
  ADDRESS_VERIFIED: {
    icon: '📍',
    color: 'amber',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
  },
  BUSINESS_VERIFIED: {
    icon: '🏢',
    color: 'indigo',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
  },
  TRUSTED_SELLER: {
    icon: '⭐',
    color: 'yellow',
    bgColor: 'bg-yellow-100',
    textColor: 'text-yellow-700',
  },
  TOP_RATED: {
    icon: '🏆',
    color: 'orange',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
  },
  FAST_RESPONDER: {
    icon: '⚡',
    color: 'teal',
    bgColor: 'bg-teal-100',
    textColor: 'text-teal-700',
  },
  PREMIUM_MEMBER: {
    icon: '👑',
    color: 'violet',
    bgColor: 'bg-violet-100',
    textColor: 'text-violet-700',
  },
};

// Badge component helper
export const getBadgeDisplay = (badgeType: string) => {
  return BADGE_DISPLAY[badgeType as keyof typeof BADGE_DISPLAY] || {
    icon: '🏅',
    color: 'gray',
    bgColor: 'bg-gray-100',
    textColor: 'text-gray-700',
  };
};
