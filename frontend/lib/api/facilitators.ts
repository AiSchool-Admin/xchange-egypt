import apiClient from './client';

// ============================================
// Types
// ============================================

export interface Facilitator {
  id: string;
  userId: string;
  displayName: string;
  bio?: string;
  level: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM';
  status: 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'REVOKED';
  specializations: string[];
  serviceAreas: string[];
  commissionRate: number;
  minCommission: number;
  insuranceCoverage: number;
  avgRating: number;
  totalDeals: number;
  successfulDeals: number;
  totalVolume: number;
  isAvailable: boolean;
  verifiedAt?: string;
  createdAt: string;
  user?: {
    id: string;
    fullName: string;
    avatar?: string;
    governorate?: string;
  };
  reviews?: FacilitatorReview[];
}

export interface FacilitatorReview {
  id: string;
  facilitatorId: string;
  reviewerId: string;
  assignmentId: string;
  rating: number;
  professionalismRating: number;
  communicationRating: number;
  speedRating: number;
  comment?: string;
  createdAt: string;
}

export interface FacilitatorAssignment {
  id: string;
  facilitatorId: string;
  assignmentType: 'ESCROW' | 'BARTER_CHAIN' | 'INSPECTION';
  escrowId?: string;
  barterChainId?: string;
  buyerId: string;
  sellerId: string;
  commissionAmount: number;
  status: 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  completedAt?: string;
  completionNotes?: string;
  createdAt: string;
}

// ============================================
// API Functions
// ============================================

export const getAvailableFacilitators = async (params?: {
  governorate?: string;
  specialization?: string;
  minRating?: number;
  dealValue?: number;
}) => {
  const response = await apiClient.get('/facilitators', { params });
  return response.data;
};

export const getTopFacilitators = async (params?: {
  governorate?: string;
  specialization?: string;
  limit?: number;
}) => {
  const response = await apiClient.get('/facilitators/top', { params });
  return response.data;
};

export const getFacilitatorProfile = async (id: string) => {
  const response = await apiClient.get(`/facilitators/${id}`);
  return response.data;
};

export const getMyFacilitatorProfile = async () => {
  const response = await apiClient.get('/facilitators/user/me');
  return response.data;
};

export const getMyAssignments = async (params?: {
  status?: string;
  limit?: number;
  offset?: number;
}) => {
  const response = await apiClient.get('/facilitators/user/my-assignments', { params });
  return response.data;
};

export const applyForFacilitator = async (data: {
  displayName: string;
  bio?: string;
  specializations: string[];
  serviceAreas: string[];
  idDocument: string;
  commercialReg?: string;
}) => {
  const response = await apiClient.post('/facilitators/apply', data);
  return response.data;
};

export const updateFacilitatorProfile = async (id: string, data: {
  displayName?: string;
  bio?: string;
  specializations?: string[];
  serviceAreas?: string[];
  isAvailable?: boolean;
}) => {
  const response = await apiClient.patch(`/facilitators/${id}`, data);
  return response.data;
};

export const toggleAvailability = async (id: string) => {
  const response = await apiClient.post(`/facilitators/${id}/toggle-availability`);
  return response.data;
};

export const assignFacilitator = async (id: string, data: {
  assignmentType: 'ESCROW' | 'BARTER_CHAIN' | 'INSPECTION';
  escrowId?: string;
  barterChainId?: string;
  sellerId: string;
  dealValue: number;
}) => {
  const response = await apiClient.post(`/facilitators/${id}/assign`, data);
  return response.data;
};

export const startAssignment = async (assignmentId: string) => {
  const response = await apiClient.post(`/facilitators/assignments/${assignmentId}/start`);
  return response.data;
};

export const completeAssignment = async (assignmentId: string, completionNotes?: string) => {
  const response = await apiClient.post(`/facilitators/assignments/${assignmentId}/complete`, { completionNotes });
  return response.data;
};

export const submitReview = async (assignmentId: string, data: {
  rating: number;
  professionalismRating: number;
  communicationRating: number;
  speedRating: number;
  comment?: string;
}) => {
  const response = await apiClient.post(`/facilitators/assignments/${assignmentId}/review`, data);
  return response.data;
};
