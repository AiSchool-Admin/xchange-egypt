'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import * as authApi from '../api/auth';
import type { User, LoginData, RegisterIndividualData, RegisterBusinessData } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginData) => Promise<void>;
  registerIndividual: (data: RegisterIndividualData) => Promise<void>;
  registerBusiness: (data: RegisterBusinessData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Load user on mount
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to load user:', error);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (data: LoginData) => {
    try {
      const response = await authApi.login(data);

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Set user
      setUser(response.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  };

  const registerIndividual = async (data: RegisterIndividualData) => {
    try {
      const response = await authApi.registerIndividual(data);

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Set user
      setUser(response.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Individual registration failed:', error);
      throw error;
    }
  };

  const registerBusiness = async (data: RegisterBusinessData) => {
    try {
      const response = await authApi.registerBusiness(data);

      // Store tokens
      localStorage.setItem('accessToken', response.accessToken);
      localStorage.setItem('refreshToken', response.refreshToken);

      // Set user
      setUser(response.user);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Business registration failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear state
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');

      // Redirect to login
      router.push('/login');
    }
  };

  const updateUser = async (data: Partial<User>) => {
    try {
      const updatedUser = await authApi.updateProfile(data);
      setUser(updatedUser);
    } catch (error) {
      console.error('Failed to update user:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        registerIndividual,
        registerBusiness,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
