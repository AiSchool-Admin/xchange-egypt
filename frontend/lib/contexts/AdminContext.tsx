'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Admin {
  id: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'MODERATOR' | 'SUPPORT';
  avatar?: string;
  permissions: string[];
}

interface AdminContextType {
  admin: Admin | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  isSuperAdmin: () => boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: React.ReactNode }) {
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check if admin is logged in on mount
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('adminAccessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/v1/admin/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.success) {
          setAdmin({
            ...response.data.data.admin,
            permissions: response.data.data.permissions,
          });
        }
      } catch (error) {
        // Token might be expired, try to refresh
        const refreshToken = localStorage.getItem('adminRefreshToken');
        if (refreshToken) {
          try {
            const refreshResponse = await axios.post(`${API_URL}/api/v1/admin/auth/refresh`, {
              refreshToken,
            });

            if (refreshResponse.data.success) {
              localStorage.setItem('adminAccessToken', refreshResponse.data.data.accessToken);
              localStorage.setItem('adminRefreshToken', refreshResponse.data.data.refreshToken);

              // Retry getting admin info
              const retryResponse = await axios.get(`${API_URL}/api/v1/admin/auth/me`, {
                headers: { Authorization: `Bearer ${refreshResponse.data.data.accessToken}` },
              });

              if (retryResponse.data.success) {
                setAdmin({
                  ...retryResponse.data.data.admin,
                  permissions: retryResponse.data.data.permissions,
                });
              }
            }
          } catch {
            // Refresh failed, clear tokens
            localStorage.removeItem('adminAccessToken');
            localStorage.removeItem('adminRefreshToken');
          }
        } else {
          localStorage.removeItem('adminAccessToken');
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const response = await axios.post(`${API_URL}/api/v1/admin/auth/login`, {
      email,
      password,
    });

    if (response.data.success) {
      const { accessToken, refreshToken, admin: adminData } = response.data.data;

      localStorage.setItem('adminAccessToken', accessToken);
      localStorage.setItem('adminRefreshToken', refreshToken);

      // Get full admin info with permissions
      const meResponse = await axios.get(`${API_URL}/api/v1/admin/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (meResponse.data.success) {
        setAdmin({
          ...meResponse.data.data.admin,
          permissions: meResponse.data.data.permissions,
        });
      }

      router.push('/admin');
    }
  }, [router]);

  const logout = useCallback(async () => {
    const token = localStorage.getItem('adminAccessToken');
    const refreshToken = localStorage.getItem('adminRefreshToken');

    try {
      if (token) {
        await axios.post(
          `${API_URL}/api/v1/admin/auth/logout`,
          { refreshToken },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (error) {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('adminAccessToken');
      localStorage.removeItem('adminRefreshToken');
      setAdmin(null);
      router.push('/admin/login');
    }
  }, [router]);

  const hasPermission = useCallback((permission: string) => {
    if (!admin) return false;
    if (admin.role === 'SUPER_ADMIN') return true;
    return admin.permissions.includes(permission);
  }, [admin]);

  const isSuperAdmin = useCallback(() => {
    return admin?.role === 'SUPER_ADMIN';
  }, [admin]);

  return (
    <AdminContext.Provider value={{ admin, loading, login, logout, hasPermission, isSuperAdmin }}>
      {children}
    </AdminContext.Provider>
  );
}

export function useAdmin() {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
}
