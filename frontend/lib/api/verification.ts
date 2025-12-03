import apiClient from './client';

// ============================================
// Seller Verification API
// ============================================

export type VerificationLevel = 'UNVERIFIED' | 'BASIC' | 'VERIFIED' | 'BUSINESS' | 'PREMIUM' | 'TRUSTED';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface VerificationBadge {
  id: string;
  type: string;
  name: string;
  nameAr: string;
  icon: string;
  earnedAt: string;
  expiresAt?: string;
}

export interface VerificationInfo {
  userId: string;
  level: VerificationLevel;
  status: VerificationStatus;
  badges: VerificationBadge[];
  trustScore: number;
  verifiedAt?: string;
  nextLevel?: VerificationLevel;
  requirements?: {
    name: string;
    nameAr: string;
    completed: boolean;
  }[];
}

export interface LevelRequirements {
  level: VerificationLevel;
  name: string;
  nameAr: string;
  requirements: string[];
  requirementsAr: string[];
  benefits: string[];
  benefitsAr: string[];
  trustBonus: number;
}

// Get my verification status
export const getMyVerification = async () => {
  const response = await apiClient.get('/verification/my-status');
  return response.data;
};

// Get all levels requirements
export const getLevelRequirements = async (): Promise<{ success: boolean; data: { levels: LevelRequirements[] } }> => {
  const response = await apiClient.get('/verification/levels');
  return response.data;
};

// Submit verification request
export const submitVerification = async (data: {
  requestedLevel: VerificationLevel;
  idType?: 'NATIONAL_ID' | 'PASSPORT';
  idNumber?: string;
  idFrontUrl?: string;
  idBackUrl?: string;
  selfieUrl?: string;
  businessName?: string;
  commercialRegNo?: string;
  taxId?: string;
  businessDocUrl?: string;
  addressProofUrl?: string;
}) => {
  const response = await apiClient.post('/verification/submit', data);
  return response.data;
};

// Get verification request status
export const getVerificationStatus = async (requestId: string) => {
  const response = await apiClient.get(`/verification/request/${requestId}`);
  return response.data;
};

// Get user's public verification info
export const getUserVerification = async (userId: string) => {
  const response = await apiClient.get(`/verification/user/${userId}`);
  return response.data;
};

// Get my badges
export const getMyBadges = async () => {
  const response = await apiClient.get('/verification/my-badges');
  return response.data;
};
