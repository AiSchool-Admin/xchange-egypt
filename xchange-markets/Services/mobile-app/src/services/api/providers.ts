// ============================================
// Providers API - Service Provider Endpoints
// ============================================

import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  ServiceProvider,
  Service,
  ProviderSearchParams,
  ProviderAvailability,
  ProviderCertification,
  ProviderRegistrationPayload,
  VerificationLevel,
  ProviderSubscriptionTier,
} from '../../types';

interface ProviderStats {
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  completionRate: number;
  totalEarnings: number;
  pendingEarnings: number;
  thisMonthEarnings: number;
  averageRating: number;
  totalReviews: number;
  responseTime: number;
}

interface EarningsData {
  period: string;
  totalEarnings: number;
  commission: number;
  netEarnings: number;
  bookingsCount: number;
}

interface PayoutRequest {
  id: string;
  amount: number;
  status: string;
  bankName: string;
  bankAccountNumber: string;
  requestedAt: string;
  processedAt?: string;
  completedAt?: string;
}

export const providersApi = {
  // ============================
  // Provider Profile
  // ============================

  // Register as provider
  registerProvider: async (data: ProviderRegistrationPayload): Promise<ApiResponse<ServiceProvider>> => {
    try {
      const response = await apiClient.post('/providers/register', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to register as provider' },
      };
    }
  },

  // Get provider by ID
  getProvider: async (providerId: string): Promise<ApiResponse<ServiceProvider>> => {
    try {
      const response = await apiClient.get(`/providers/${providerId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch provider' },
      };
    }
  },

  // Search providers
  searchProviders: async (
    params: ProviderSearchParams
  ): Promise<ApiResponse<PaginatedResponse<ServiceProvider>>> => {
    try {
      const response = await apiClient.get('/providers/search', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to search providers' },
      };
    }
  },

  // Update provider profile
  updateProfile: async (data: Partial<ServiceProvider>): Promise<ApiResponse<ServiceProvider>> => {
    try {
      const response = await apiClient.put('/providers/profile', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to update profile' },
      };
    }
  },

  // Upload profile image
  uploadProfileImage: async (imageUri: string): Promise<ApiResponse<{ url: string }>> => {
    try {
      const formData = new FormData();
      formData.append('image', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'profile.jpg',
      } as any);

      const response = await apiClient.post('/providers/profile/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to upload image' },
      };
    }
  },

  // ============================
  // Services Management
  // ============================

  // Get my services (provider)
  getMyServices: async (params?: {
    page?: number;
    limit?: number;
    isActive?: boolean;
  }): Promise<ApiResponse<PaginatedResponse<Service>>> => {
    try {
      const response = await apiClient.get('/providers/services', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch services' },
      };
    }
  },

  // Create service
  createService: async (data: Partial<Service>): Promise<ApiResponse<Service>> => {
    try {
      const response = await apiClient.post('/providers/services', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to create service' },
      };
    }
  },

  // Update service
  updateService: async (serviceId: string, data: Partial<Service>): Promise<ApiResponse<Service>> => {
    try {
      const response = await apiClient.put(`/providers/services/${serviceId}`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to update service' },
      };
    }
  },

  // Delete service
  deleteService: async (serviceId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/providers/services/${serviceId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to delete service' },
      };
    }
  },

  // Toggle service active status
  toggleServiceStatus: async (serviceId: string): Promise<ApiResponse<Service>> => {
    try {
      const response = await apiClient.post(`/providers/services/${serviceId}/toggle-status`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to toggle status' },
      };
    }
  },

  // Upload service images
  uploadServiceImages: async (
    serviceId: string,
    imageUris: string[]
  ): Promise<ApiResponse<{ urls: string[] }>> => {
    try {
      const formData = new FormData();
      imageUris.forEach((uri, index) => {
        formData.append('images', {
          uri,
          type: 'image/jpeg',
          name: `service_${index}.jpg`,
        } as any);
      });

      const response = await apiClient.post(
        `/providers/services/${serviceId}/images`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to upload images' },
      };
    }
  },

  // ============================
  // Availability
  // ============================

  // Get availability settings
  getAvailability: async (): Promise<ApiResponse<ProviderAvailability[]>> => {
    try {
      const response = await apiClient.get('/providers/availability');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch availability' },
      };
    }
  },

  // Update availability
  updateAvailability: async (
    availability: ProviderAvailability[]
  ): Promise<ApiResponse<ProviderAvailability[]>> => {
    try {
      const response = await apiClient.put('/providers/availability', { availability });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to update availability' },
      };
    }
  },

  // Block specific dates
  blockDates: async (dates: string[]): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/providers/availability/block', { dates });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to block dates' },
      };
    }
  },

  // Toggle online status
  toggleOnlineStatus: async (isAvailable: boolean): Promise<ApiResponse<ServiceProvider>> => {
    try {
      const response = await apiClient.post('/providers/status', { isAvailable });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to update status' },
      };
    }
  },

  // ============================
  // Certifications
  // ============================

  // Get certifications
  getCertifications: async (): Promise<ApiResponse<ProviderCertification[]>> => {
    try {
      const response = await apiClient.get('/providers/certifications');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch certifications' },
      };
    }
  },

  // Add certification
  addCertification: async (
    data: Omit<ProviderCertification, 'id' | 'providerId' | 'isVerified'>
  ): Promise<ApiResponse<ProviderCertification>> => {
    try {
      const response = await apiClient.post('/providers/certifications', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to add certification' },
      };
    }
  },

  // Delete certification
  deleteCertification: async (certificationId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.delete(`/providers/certifications/${certificationId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to delete certification' },
      };
    }
  },

  // ============================
  // Statistics & Earnings
  // ============================

  // Get provider stats
  getStats: async (): Promise<ApiResponse<ProviderStats>> => {
    try {
      const response = await apiClient.get('/providers/stats');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch stats' },
      };
    }
  },

  // Get earnings data
  getEarnings: async (params?: {
    period?: 'day' | 'week' | 'month' | 'year';
    startDate?: string;
    endDate?: string;
  }): Promise<ApiResponse<EarningsData[]>> => {
    try {
      const response = await apiClient.get('/providers/earnings', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch earnings' },
      };
    }
  },

  // ============================
  // Payouts
  // ============================

  // Get payout history
  getPayouts: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
  }): Promise<ApiResponse<PaginatedResponse<PayoutRequest>>> => {
    try {
      const response = await apiClient.get('/providers/payouts', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch payouts' },
      };
    }
  },

  // Request payout
  requestPayout: async (amount: number): Promise<ApiResponse<PayoutRequest>> => {
    try {
      const response = await apiClient.post('/providers/payouts', { amount });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to request payout' },
      };
    }
  },

  // Update bank details
  updateBankDetails: async (data: {
    bankName: string;
    bankAccountName: string;
    bankAccountNumber: string;
    bankIban?: string;
  }): Promise<ApiResponse<ServiceProvider>> => {
    try {
      const response = await apiClient.put('/providers/bank-details', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to update bank details' },
      };
    }
  },

  // ============================
  // Subscription
  // ============================

  // Get subscription details
  getSubscription: async (): Promise<ApiResponse<{
    tier: ProviderSubscriptionTier;
    commissionRate: number;
    startDate?: string;
    endDate?: string;
    features: string[];
  }>> => {
    try {
      const response = await apiClient.get('/providers/subscription');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch subscription' },
      };
    }
  },

  // Upgrade subscription
  upgradeSubscription: async (tier: ProviderSubscriptionTier): Promise<ApiResponse<ServiceProvider>> => {
    try {
      const response = await apiClient.post('/providers/subscription/upgrade', { tier });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to upgrade subscription' },
      };
    }
  },

  // ============================
  // Express Service
  // ============================

  // Join express pool
  joinExpressPool: async (serviceIds: string[]): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/providers/express/join', { serviceIds });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to join express pool' },
      };
    }
  },

  // Update location (for express tracking)
  updateLocation: async (latitude: number, longitude: number): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/providers/express/location', {
        latitude,
        longitude,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to update location' },
      };
    }
  },

  // Toggle express availability
  toggleExpressStatus: async (isOnline: boolean): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/providers/express/status', { isOnline });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to toggle express status' },
      };
    }
  },
};
