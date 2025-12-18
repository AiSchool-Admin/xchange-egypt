// ============================================
// Auth Store - Zustand State Management
// ============================================

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { User, ServiceProvider, Wallet } from '../types';
import { authApi } from '../services/api/auth';
import { socketService } from '../services/socket';

interface AuthState {
  // State
  user: User | null;
  provider: ServiceProvider | null;
  wallet: Wallet | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isProvider: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  initializeAuth: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<boolean>;
  setUser: (user: User) => void;
  setProvider: (provider: ServiceProvider | null) => void;
  setWallet: (wallet: Wallet) => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
  clearError: () => void;
}

interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  governorate?: string;
  city?: string;
}

// Secure storage helpers
const secureStorage = {
  async setTokens(accessToken: string, refreshToken: string) {
    await SecureStore.setItemAsync('accessToken', accessToken);
    await SecureStore.setItemAsync('refreshToken', refreshToken);
  },
  async getTokens() {
    const accessToken = await SecureStore.getItemAsync('accessToken');
    const refreshToken = await SecureStore.getItemAsync('refreshToken');
    return { accessToken, refreshToken };
  },
  async clearTokens() {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  },
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      provider: null,
      wallet: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isProvider: false,
      isLoading: false,
      error: null,

      // Initialize authentication on app start
      initializeAuth: async () => {
        set({ isLoading: true, error: null });
        try {
          const { accessToken, refreshToken } = await secureStorage.getTokens();

          if (accessToken && refreshToken) {
            set({ accessToken, refreshToken });

            // Validate token and get user data
            const response = await authApi.getProfile();

            if (response.success && response.data) {
              const { user, provider, wallet } = response.data;
              set({
                user,
                provider,
                wallet,
                isAuthenticated: true,
                isProvider: !!provider,
                isLoading: false,
              });

              // Connect to socket
              socketService.connect(user.id);
            } else {
              // Token invalid, try refresh
              const refreshed = await get().refreshAccessToken();
              if (!refreshed) {
                await get().logout();
              }
            }
          } else {
            set({ isLoading: false });
          }
        } catch (error: any) {
          console.error('Auth initialization error:', error);
          set({ isLoading: false, error: error.message });
          // Clear invalid tokens
          await secureStorage.clearTokens();
        }
      },

      // Login
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.login({ email, password });

          if (response.success && response.data) {
            const { user, provider, wallet, accessToken, refreshToken } = response.data;

            // Store tokens securely
            await secureStorage.setTokens(accessToken, refreshToken);

            set({
              user,
              provider,
              wallet,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isProvider: !!provider,
              isLoading: false,
            });

            // Connect to socket
            socketService.connect(user.id);
          } else {
            throw new Error(response.error?.message || 'Login failed');
          }
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Register
      register: async (data: RegisterData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.register(data);

          if (response.success && response.data) {
            const { user, accessToken, refreshToken } = response.data;

            // Store tokens securely
            await secureStorage.setTokens(accessToken, refreshToken);

            set({
              user,
              accessToken,
              refreshToken,
              isAuthenticated: true,
              isProvider: false,
              isLoading: false,
            });

            // Connect to socket
            socketService.connect(user.id);
          } else {
            throw new Error(response.error?.message || 'Registration failed');
          }
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Logout
      logout: async () => {
        try {
          // Call logout API
          await authApi.logout();
        } catch (error) {
          console.warn('Logout API error:', error);
        } finally {
          // Disconnect socket
          socketService.disconnect();

          // Clear secure storage
          await secureStorage.clearTokens();

          // Reset state
          set({
            user: null,
            provider: null,
            wallet: null,
            accessToken: null,
            refreshToken: null,
            isAuthenticated: false,
            isProvider: false,
            isLoading: false,
            error: null,
          });
        }
      },

      // Refresh access token
      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const response = await authApi.refreshToken(refreshToken);

          if (response.success && response.data) {
            const { accessToken, refreshToken: newRefreshToken } = response.data;

            await secureStorage.setTokens(accessToken, newRefreshToken);
            set({ accessToken, refreshToken: newRefreshToken });

            return true;
          }
          return false;
        } catch (error) {
          console.error('Token refresh error:', error);
          return false;
        }
      },

      // Set user
      setUser: (user: User) => {
        set({ user });
      },

      // Set provider
      setProvider: (provider: ServiceProvider | null) => {
        set({ provider, isProvider: !!provider });
      },

      // Set wallet
      setWallet: (wallet: Wallet) => {
        set({ wallet });
      },

      // Update profile
      updateProfile: async (data: Partial<User>) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authApi.updateProfile(data);

          if (response.success && response.data) {
            set({ user: response.data, isLoading: false });
          } else {
            throw new Error(response.error?.message || 'Update failed');
          }
        } catch (error: any) {
          set({ isLoading: false, error: error.message });
          throw error;
        }
      },

      // Clear error
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        isProvider: state.isProvider,
      }),
    }
  )
);

// Selector hooks for optimized re-renders
export const useUser = () => useAuthStore((state) => state.user);
export const useProvider = () => useAuthStore((state) => state.provider);
export const useWallet = () => useAuthStore((state) => state.wallet);
export const useIsAuthenticated = () => useAuthStore((state) => state.isAuthenticated);
export const useIsProvider = () => useAuthStore((state) => state.isProvider);
