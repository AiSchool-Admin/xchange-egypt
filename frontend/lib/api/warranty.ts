import apiClient from './client';

// ============================================
// Warranty & Insurance API
// ============================================

export type WarrantyType = 'SELLER' | 'PLATFORM' | 'EXTENDED' | 'INSURANCE';
export type WarrantyStatus = 'ACTIVE' | 'EXPIRED' | 'CLAIMED' | 'VOID';
export type ClaimStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'IN_PROGRESS' | 'RESOLVED';

export interface Warranty {
  id: string;
  transactionId: string;
  itemId: string;
  buyerId: string;
  sellerId: string;
  warrantyType: WarrantyType;
  title: string;
  description: string;
  coverageDetails: {
    defects: boolean;
    malfunctions: boolean;
    accidentalDamage: boolean;
    theft: boolean;
    naturalDisaster: boolean;
  };
  exclusions: string[];
  maxClaimValue: number;
  durationMonths: number;
  startDate: string;
  endDate: string;
  status: WarrantyStatus;
  price: number;
  isPaid: boolean;
  item: {
    id: string;
    title: string;
    images: string[];
  };
  claims: WarrantyClaim[];
}

export interface WarrantyClaim {
  id: string;
  warrantyId: string;
  claimantId: string;
  issueType: 'DEFECT' | 'MALFUNCTION' | 'DAMAGE' | 'THEFT' | 'OTHER';
  issueDescription: string;
  evidenceUrls: string[];
  status: ClaimStatus;
  resolution?: 'REPAIR' | 'REPLACE' | 'REFUND';
  resolutionNotes?: string;
  claimAmount?: number;
  approvedAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}

export interface WarrantiesResponse {
  success: boolean;
  data: {
    warranties: Warranty[];
  };
}

// Get my warranties (as buyer)
export const getMyWarranties = async (): Promise<WarrantiesResponse> => {
  const response = await apiClient.get('/warranties/my-warranties');
  return response.data;
};

// Get warranty details
export const getWarranty = async (id: string) => {
  const response = await apiClient.get(`/warranties/${id}`);
  return response.data;
};

// Purchase extended warranty
export const purchaseWarranty = async (data: {
  transactionId: string;
  warrantyType: 'EXTENDED' | 'INSURANCE';
  durationMonths: number;
}) => {
  const response = await apiClient.post('/warranties/purchase', data);
  return response.data;
};

// File a claim
export const fileClaim = async (warrantyId: string, data: {
  issueType: string;
  issueDescription: string;
  evidenceUrls: string[];
}) => {
  const response = await apiClient.post(`/warranties/${warrantyId}/claim`, data);
  return response.data;
};

// Get claim status
export const getClaimStatus = async (claimId: string) => {
  const response = await apiClient.get(`/warranties/claims/${claimId}`);
  return response.data;
};

// Get warranty options for a transaction
export const getWarrantyOptions = async (transactionId: string) => {
  const response = await apiClient.get(`/warranties/options/${transactionId}`);
  return response.data;
};
