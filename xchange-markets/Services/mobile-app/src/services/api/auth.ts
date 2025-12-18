// ============================================
// Auth API Service
// ============================================

import apiClient from './client';
import { ApiResponse, User, ServiceProvider, Wallet } from '../../types';

interface LoginPayload {
  email: string;
  password: string;
}

interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  governorate?: string;
  city?: string;
}

interface LoginResponse {
  user: User;
  provider: ServiceProvider | null;
  wallet: Wallet | null;
  accessToken: string;
  refreshToken: string;
}

interface RegisterResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

interface ProfileResponse {
  user: User;
  provider: ServiceProvider | null;
  wallet: Wallet | null;
}

interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export const authApi = {
  // Login
  login: async (data: LoginPayload): Promise<ApiResponse<LoginResponse>> => {
    try {
      const response = await apiClient.post('/auth/login', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Login failed',
        },
      };
    }
  },

  // Register
  register: async (data: RegisterPayload): Promise<ApiResponse<RegisterResponse>> => {
    try {
      const response = await apiClient.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Registration failed',
        },
      };
    }
  },

  // Logout
  logout: async (): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Logout failed',
        },
      };
    }
  },

  // Refresh Token
  refreshToken: async (refreshToken: string): Promise<ApiResponse<RefreshTokenResponse>> => {
    try {
      const response = await apiClient.post('/auth/refresh', { refreshToken });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Token refresh failed',
        },
      };
    }
  },

  // Get Profile
  getProfile: async (): Promise<ApiResponse<ProfileResponse>> => {
    try {
      const response = await apiClient.get('/auth/profile');
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Failed to get profile',
        },
      };
    }
  },

  // Update Profile
  updateProfile: async (data: Partial<User>): Promise<ApiResponse<User>> => {
    try {
      const response = await apiClient.put('/auth/profile', data);
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Failed to update profile',
        },
      };
    }
  },

  // Forgot Password
  forgotPassword: async (email: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Failed to send reset email',
        },
      };
    }
  },

  // Reset Password
  resetPassword: async (token: string, password: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/auth/reset-password', { token, password });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Failed to reset password',
        },
      };
    }
  },

  // Verify OTP
  verifyOtp: async (phone: string, otp: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/auth/verify-otp', { phone, otp });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'OTP verification failed',
        },
      };
    }
  },

  // Send OTP
  sendOtp: async (phone: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/auth/send-otp', { phone });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Failed to send OTP',
        },
      };
    }
  },

  // Change Password
  changePassword: async (currentPassword: string, newPassword: string): Promise<ApiResponse<null>> => {
    try {
      const response = await apiClient.post('/auth/change-password', {
        currentPassword,
        newPassword,
      });
      return response.data;
    } catch (error: any) {
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || 'Failed to change password',
        },
      };
    }
  },
};
