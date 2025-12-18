// ============================================
// Bookings API - Service Booking Endpoints
// ============================================

import apiClient from './client';
import {
  ApiResponse,
  PaginatedResponse,
  ServiceBooking,
  BookingStatus,
  CreateBookingPayload,
  BookingPriceCalculation,
  ProtectLevel,
  ServiceReview,
  ServiceDispute,
  ChatMessage,
} from '../../types';

export const bookingsApi = {
  // ============================
  // Booking Management
  // ============================

  // Create a new booking
  createBooking: async (data: CreateBookingPayload): Promise<ApiResponse<ServiceBooking>> => {
    try {
      const response = await apiClient.post('/bookings', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to create booking' },
      };
    }
  },

  // Get booking by ID
  getBooking: async (bookingId: string): Promise<ApiResponse<ServiceBooking>> => {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch booking' },
      };
    }
  },

  // Get customer's bookings
  getMyBookings: async (params?: {
    status?: BookingStatus;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<ServiceBooking>>> => {
    try {
      const response = await apiClient.get('/bookings/my', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch bookings' },
      };
    }
  },

  // Calculate booking price
  calculatePrice: async (data: {
    serviceId: string;
    selectedAddOnIds?: string[];
    protectLevel: ProtectLevel;
    isExpressService?: boolean;
    discountCode?: string;
  }): Promise<ApiResponse<BookingPriceCalculation>> => {
    try {
      const response = await apiClient.post('/bookings/calculate-price', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to calculate price' },
      };
    }
  },

  // Cancel booking (customer)
  cancelBooking: async (bookingId: string, reason: string): Promise<ApiResponse<ServiceBooking>> => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/cancel`, { reason });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to cancel booking' },
      };
    }
  },

  // Confirm service completion (customer)
  confirmCompletion: async (bookingId: string): Promise<ApiResponse<ServiceBooking>> => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/confirm-completion`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to confirm completion' },
      };
    }
  },

  // ============================
  // Provider Actions
  // ============================

  // Accept booking (provider)
  acceptBooking: async (bookingId: string): Promise<ApiResponse<ServiceBooking>> => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/accept`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to accept booking' },
      };
    }
  },

  // Reject booking (provider)
  rejectBooking: async (bookingId: string, reason: string): Promise<ApiResponse<ServiceBooking>> => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/reject`, { reason });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to reject booking' },
      };
    }
  },

  // Start on way (provider)
  startOnWay: async (bookingId: string): Promise<ApiResponse<ServiceBooking>> => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/on-way`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to update status' },
      };
    }
  },

  // Start service (provider)
  startService: async (
    bookingId: string,
    beforePhotos?: string[]
  ): Promise<ApiResponse<ServiceBooking>> => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/start`, { beforePhotos });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to start service' },
      };
    }
  },

  // Complete service (provider)
  completeService: async (
    bookingId: string,
    afterPhotos?: string[],
    notes?: string
  ): Promise<ApiResponse<ServiceBooking>> => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/complete`, {
        afterPhotos,
        notes,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to complete service' },
      };
    }
  },

  // Get provider's bookings
  getProviderBookings: async (params?: {
    status?: BookingStatus;
    date?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<PaginatedResponse<ServiceBooking>>> => {
    try {
      const response = await apiClient.get('/bookings/provider', { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch bookings' },
      };
    }
  },

  // ============================
  // Milestones (Large Projects)
  // ============================

  // Complete milestone (provider)
  completeMilestone: async (
    bookingId: string,
    milestoneId: string,
    evidence?: string[]
  ): Promise<ApiResponse<ServiceBooking>> => {
    try {
      const response = await apiClient.post(
        `/bookings/${bookingId}/milestones/${milestoneId}/complete`,
        { evidence }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to complete milestone' },
      };
    }
  },

  // Approve milestone (customer)
  approveMilestone: async (
    bookingId: string,
    milestoneId: string,
    feedback?: string
  ): Promise<ApiResponse<ServiceBooking>> => {
    try {
      const response = await apiClient.post(
        `/bookings/${bookingId}/milestones/${milestoneId}/approve`,
        { feedback }
      );
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to approve milestone' },
      };
    }
  },

  // ============================
  // Reviews
  // ============================

  // Create review
  createReview: async (
    bookingId: string,
    data: {
      overallRating: number;
      qualityRating?: number;
      punctualityRating?: number;
      communicationRating?: number;
      valueRating?: number;
      reviewText?: string;
      reviewImages?: string[];
    }
  ): Promise<ApiResponse<ServiceReview>> => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/review`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to create review' },
      };
    }
  },

  // Get reviews for service
  getServiceReviews: async (
    serviceId: string,
    params?: { page?: number; limit?: number; sortBy?: string }
  ): Promise<ApiResponse<PaginatedResponse<ServiceReview>>> => {
    try {
      const response = await apiClient.get(`/services/${serviceId}/reviews`, { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch reviews' },
      };
    }
  },

  // Get reviews for provider
  getProviderReviews: async (
    providerId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<ServiceReview>>> => {
    try {
      const response = await apiClient.get(`/providers/${providerId}/reviews`, { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch reviews' },
      };
    }
  },

  // Respond to review (provider)
  respondToReview: async (
    reviewId: string,
    response: string
  ): Promise<ApiResponse<ServiceReview>> => {
    try {
      const res = await apiClient.post(`/reviews/${reviewId}/respond`, { response });
      return res.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to respond to review' },
      };
    }
  },

  // Vote review helpful/not helpful
  voteReview: async (reviewId: string, isHelpful: boolean): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post(`/reviews/${reviewId}/vote`, { isHelpful });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to vote' },
      };
    }
  },

  // ============================
  // Disputes
  // ============================

  // Create dispute
  createDispute: async (
    bookingId: string,
    data: {
      reason: string;
      descriptionAr: string;
      descriptionEn?: string;
      evidence?: string[];
    }
  ): Promise<ApiResponse<ServiceDispute>> => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/dispute`, data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to create dispute' },
      };
    }
  },

  // Get dispute
  getDispute: async (disputeId: string): Promise<ApiResponse<ServiceDispute>> => {
    try {
      const response = await apiClient.get(`/disputes/${disputeId}`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch dispute' },
      };
    }
  },

  // Add message to dispute
  addDisputeMessage: async (
    disputeId: string,
    message: string,
    attachments?: string[]
  ): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post(`/disputes/${disputeId}/message`, {
        message,
        attachments,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to send message' },
      };
    }
  },

  // ============================
  // Chat
  // ============================

  // Get chat messages
  getChatMessages: async (
    bookingId: string,
    params?: { page?: number; limit?: number }
  ): Promise<ApiResponse<PaginatedResponse<ChatMessage>>> => {
    try {
      const response = await apiClient.get(`/bookings/${bookingId}/chat`, { params });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch messages' },
      };
    }
  },

  // Send chat message
  sendChatMessage: async (
    bookingId: string,
    message: string,
    attachments?: string[]
  ): Promise<ApiResponse<ChatMessage>> => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/chat`, {
        message,
        attachments,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to send message' },
      };
    }
  },

  // Mark messages as read
  markMessagesRead: async (bookingId: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post(`/bookings/${bookingId}/chat/read`);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to mark as read' },
      };
    }
  },

  // ============================
  // Availability
  // ============================

  // Get provider availability for a date
  getAvailability: async (
    providerId: string,
    date: string
  ): Promise<ApiResponse<{ slots: string[]; bookedSlots: string[] }>> => {
    try {
      const response = await apiClient.get(`/providers/${providerId}/availability`, {
        params: { date },
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: { message: error.response?.data?.error?.message || 'Failed to fetch availability' },
      };
    }
  },
};
