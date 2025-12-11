import apiClient from './client';

// Backend response wrapper
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    message: string;
    details?: unknown;
  };
}

export interface RegisterIndividualData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  city?: string;
  governorate?: string;
  district?: string;
  street?: string;
  latitude?: number;
  longitude?: number;
}

export interface RegisterBusinessData {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  businessName: string;
  taxId?: string;
  commercialRegNo?: string;
  city?: string;
  governorate?: string;
  district?: string;
  street?: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  userType: 'INDIVIDUAL' | 'BUSINESS';
  status?: string;
  avatar?: string;
  rating?: number;
  city?: string;
  governorate?: string;
  district?: string;
  street?: string;
  address?: string; // Combined address from backend
  latitude?: number;
  longitude?: number;
  businessName?: string;
  taxId?: string;
  commercialRegNo?: string;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Register a new individual user
 */
export const registerIndividual = async (data: RegisterIndividualData): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register/individual', data);
  return response.data.data!;
};

/**
 * Register a new business user
 */
export const registerBusiness = async (data: RegisterBusinessData): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register/business', data);
  return response.data.data!;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', data);
  return response.data.data!;
};

/**
 * Logout user
 */
export const logout = async (): Promise<void> => {
  const refreshToken = typeof window !== 'undefined'
    ? localStorage.getItem('refreshToken')
    : null;

  if (refreshToken) {
    await apiClient.post('/auth/logout', { refreshToken });
  }

  // Clear local storage
  if (typeof window !== 'undefined') {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
};

/**
 * Get current user profile
 */
export const getCurrentUser = async (): Promise<User> => {
  const response = await apiClient.get<ApiResponse<User>>('/auth/me');
  return response.data.data!;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  const response = await apiClient.post<ApiResponse<{ accessToken: string }>>('/auth/refresh', { refreshToken });
  return response.data.data!;
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await apiClient.put<ApiResponse<User>>('/auth/me', data);
  return response.data.data!;
};
