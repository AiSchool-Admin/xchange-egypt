'use client';

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { useAdmin } from '@/lib/contexts/AdminContext';

// API_URL already includes /api/v1 from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface DashboardStats {
  users: {
    total: number;
    active: number;
    newToday: number;
    newThisWeek: number;
  };
  listings: {
    total: number;
    active: number;
    newToday: number;
  };
  orders: {
    total: number;
    completed: number;
    totalValue: number;
  };
  reports: {
    pending: number;
  };
}

interface ActivityLog {
  id: string;
  action: string;
  targetType: string;
  targetId: string;
  createdAt: string;
  admin: {
    id: string;
    fullName: string;
    email: string;
  };
}

export default function AdminDashboard() {
  const { admin } = useAdmin();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('adminAccessToken');
      if (!token) return;

      try {
        const [statsRes, logsRes] = await Promise.all([
          axios.get(`${API_URL}/admin/dashboard/stats`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/admin/logs?limit=10`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }

        if (logsRes.data.success) {
          setRecentActivity(logsRes.data.data.logs);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG').format(num);
  };

  const formatCurrency = (num: number) => {
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(num);
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      admin_login: 'تسجيل دخول',
      admin_logout: 'تسجيل خروج',
      user_suspend: 'إيقاف مستخدم',
      user_activate: 'تفعيل مستخدم',
      user_delete: 'حذف مستخدم',
      listing_delete: 'حذف إعلان',
      setting_update: 'تحديث إعداد',
      report_resolve: 'معالجة بلاغ',
      category_create: 'إنشاء فئة',
      category_update: 'تحديث فئة',
      category_delete: 'حذف فئة',
    };
    return labels[action] || action;
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700/50 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-700/50 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-2">مرحباً، {admin?.fullName}</h1>
        <p className="text-gray-400">نظرة عامة على المنصة</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Users Stats */}
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl p-6 border border-blue-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <span className="text-xs text-blue-400 bg-blue-500/20 px-2 py-1 rounded-full">
              +{formatNumber(stats?.users.newThisWeek || 0)} هذا الأسبوع
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{formatNumber(stats?.users.total || 0)}</h3>
          <p className="text-gray-400 text-sm">إجمالي المستخدمين</p>
          <div className="mt-3 pt-3 border-t border-blue-500/20">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">نشط</span>
              <span className="text-blue-400">{formatNumber(stats?.users.active || 0)}</span>
            </div>
          </div>
        </div>

        {/* Listings Stats */}
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 rounded-2xl p-6 border border-green-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <span className="text-xs text-green-400 bg-green-500/20 px-2 py-1 rounded-full">
              +{formatNumber(stats?.listings.newToday || 0)} اليوم
            </span>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{formatNumber(stats?.listings.total || 0)}</h3>
          <p className="text-gray-400 text-sm">إجمالي الإعلانات</p>
          <div className="mt-3 pt-3 border-t border-green-500/20">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">نشط</span>
              <span className="text-green-400">{formatNumber(stats?.listings.active || 0)}</span>
            </div>
          </div>
        </div>

        {/* Orders Stats */}
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 rounded-2xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{formatNumber(stats?.orders.completed || 0)}</h3>
          <p className="text-gray-400 text-sm">الطلبات المكتملة</p>
          <div className="mt-3 pt-3 border-t border-purple-500/20">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">القيمة</span>
              <span className="text-purple-400">{formatCurrency(stats?.orders.totalValue || 0)}</span>
            </div>
          </div>
        </div>

        {/* Reports Stats */}
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 rounded-2xl p-6 border border-red-500/20">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            {(stats?.reports.pending || 0) > 0 && (
              <span className="text-xs text-red-400 bg-red-500/20 px-2 py-1 rounded-full animate-pulse">
                تحتاج مراجعة
              </span>
            )}
          </div>
          <h3 className="text-3xl font-bold text-white mb-1">{formatNumber(stats?.reports.pending || 0)}</h3>
          <p className="text-gray-400 text-sm">بلاغات معلقة</p>
          <div className="mt-3 pt-3 border-t border-red-500/20">
            <Link href="/admin/reports" className="text-sm text-red-400 hover:text-red-300 transition-colors">
              عرض البلاغات ←
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">إجراءات سريعة</h2>
          <div className="space-y-3">
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">إدارة المستخدمين</p>
                <p className="text-gray-400 text-xs">عرض وتعديل المستخدمين</p>
              </div>
            </Link>

            <Link
              href="/admin/listings"
              className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">إدارة الإعلانات</p>
                <p className="text-gray-400 text-xs">مراجعة وحذف الإعلانات</p>
              </div>
            </Link>

            <Link
              href="/admin/reports"
              className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">معالجة البلاغات</p>
                <p className="text-gray-400 text-xs">مراجعة بلاغات المستخدمين</p>
              </div>
            </Link>

            <Link
              href="/admin/settings"
              className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-xl hover:bg-gray-700/50 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white text-sm font-medium">إعدادات المنصة</p>
                <p className="text-gray-400 text-xs">تخصيص إعدادات النظام</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">آخر النشاطات</h2>
            <Link href="/admin/logs" className="text-sm text-primary-400 hover:text-primary-300">
              عرض الكل
            </Link>
          </div>

          {recentActivity.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p>لا توجد نشاطات حتى الآن</p>
            </div>
          ) : (
            <div className="space-y-3">
              {recentActivity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 p-3 bg-gray-700/30 rounded-xl">
                  <div className="w-10 h-10 bg-gray-600/50 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {log.admin.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm">
                      <span className="font-medium">{log.admin.fullName}</span>
                      <span className="text-gray-400 mx-1">-</span>
                      <span className="text-gray-300">{getActionLabel(log.action)}</span>
                    </p>
                    {log.targetType && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {log.targetType}: {log.targetId?.slice(0, 8)}...
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 whitespace-nowrap">
                    {formatDate(log.createdAt)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
