import apiClient from './client';

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    phone?: string;
    role: string;
    avatar?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Register a new user
 */
export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/register', data);
  return response.data;
};

/**
 * Login user
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const response = await apiClient.post('/auth/login', data);
  return response.data;
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
  const response = await apiClient.get('/auth/me');
  return response.data;
};

/**
 * Refresh access token
 */
export const refreshToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  const response = await apiClient.post('/auth/refresh', { refreshToken });
  return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (data: Partial<User>): Promise<User> => {
  const response = await apiClient.put('/auth/me', data);
  return response.data;
};
