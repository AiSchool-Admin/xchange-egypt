'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

interface DashboardStats {
  items: number;
  sales: number;
  purchases: number;
  pendingOffers: number;
  activeAuctions: number;
  activeBids: number;
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    items: 0,
    sales: 0,
    purchases: 0,
    pendingOffers: 0,
    activeAuctions: 0,
    activeBids: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user) {
      loadStats();
    }
  }, [user]);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const [itemsRes, salesRes, purchasesRes, barterRes, auctionsRes, bidsRes] = await Promise.all([
        apiClient.get('/items/my?limit=1').catch(() => ({ data: { data: { pagination: { total: 0 } } } })),
        apiClient.get('/transactions/my?role=seller&limit=1').catch(() => ({ data: { data: { pagination: { total: 0 } } } })),
        apiClient.get('/transactions/my?role=buyer&limit=1').catch(() => ({ data: { data: { pagination: { total: 0 } } } })),
        apiClient.get('/barter/offers/my?type=received&status=PENDING&limit=1').catch(() => ({ data: { data: { pagination: { total: 0 } } } })),
        apiClient.get('/auctions/my?limit=1').catch(() => ({ data: { data: [] } })),
        apiClient.get('/auctions/my-bids?limit=1').catch(() => ({ data: { data: [] } })),
      ]);

      setStats({
        items: itemsRes.data.data?.pagination?.total || itemsRes.data.data?.items?.length || 0,
        sales: salesRes.data.data?.pagination?.total || salesRes.data.data?.transactions?.length || 0,
        purchases: purchasesRes.data.data?.pagination?.total || purchasesRes.data.data?.transactions?.length || 0,
        pendingOffers: barterRes.data.data?.pagination?.total || barterRes.data.data?.offers?.length || 0,
        activeAuctions: Array.isArray(auctionsRes.data.data) ? auctionsRes.data.data.length : 0,
        activeBids: Array.isArray(bidsRes.data.data) ? bidsRes.data.data.length : 0,
      });
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoadingStats(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <div className="text-xl text-gray-600">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-primary-600 via-primary-700 to-teal-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  '👤'
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold">مرحباً، {user.fullName}</h1>
                <p className="text-primary-100 text-sm">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors backdrop-blur-sm"
              >
                الصفحة الرئيسية
              </Link>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-white/10 hover:bg-red-500/80 rounded-lg transition-colors backdrop-blur-sm"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">📦</span>
              <span className="text-2xl font-bold text-primary-600">{loadingStats ? '...' : stats.items}</span>
            </div>
            <p className="text-sm text-gray-600">منتجاتي</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">💵</span>
              <span className="text-2xl font-bold text-green-600">{loadingStats ? '...' : stats.sales}</span>
            </div>
            <p className="text-sm text-gray-600">مبيعاتي</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🛒</span>
              <span className="text-2xl font-bold text-blue-600">{loadingStats ? '...' : stats.purchases}</span>
            </div>
            <p className="text-sm text-gray-600">مشترياتي</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔔</span>
              <span className="text-2xl font-bold text-orange-600">{loadingStats ? '...' : stats.pendingOffers}</span>
            </div>
            <p className="text-sm text-gray-600">عروض جديدة</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🔨</span>
              <span className="text-2xl font-bold text-purple-600">{loadingStats ? '...' : stats.activeAuctions}</span>
            </div>
            <p className="text-sm text-gray-600">مزاداتي</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">🎯</span>
              <span className="text-2xl font-bold text-indigo-600">{loadingStats ? '...' : stats.activeBids}</span>
            </div>
            <p className="text-sm text-gray-600">مزايداتي</p>
          </div>
        </div>

        {/* Main CTA */}
        <div className="bg-gradient-to-l from-primary-600 to-teal-600 rounded-2xl p-6 mb-8 text-white shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold mb-2">نشاطي التجاري الكامل</h2>
              <p className="text-primary-100">استعرض جميع منتجاتك ومعاملاتك ومزاداتك ومقايضاتك في مكان واحد</p>
            </div>
            <Link
              href="/dashboard/activity"
              className="px-8 py-4 bg-white text-primary-600 rounded-xl hover:bg-gray-100 transition-all font-bold flex items-center gap-3 shadow-lg whitespace-nowrap"
            >
              <span className="text-2xl">📊</span>
              عرض النشاط التجاري
            </Link>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Add New Item */}
          <Link
            href="/items/new"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-primary-200"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              ➕
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">أضف منتج جديد</h3>
            <p className="text-sm text-gray-500">أضف منتجاتك للبيع أو المقايضة أو المزاد</p>
          </Link>

          {/* Browse Items */}
          <Link
            href="/items"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-purple-200"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🛍️
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">تصفح المنتجات</h3>
            <p className="text-sm text-gray-500">استكشف آلاف المنتجات المتاحة</p>
          </Link>

          {/* Auctions */}
          <Link
            href="/auctions"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-indigo-200"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-indigo-200 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🔨
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">المزادات</h3>
            <p className="text-sm text-gray-500">شارك في المزادات واربح صفقات رائعة</p>
          </Link>

          {/* Barter */}
          <Link
            href="/barter"
            className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border-2 border-transparent hover:border-teal-200"
          >
            <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform">
              🔄
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-1">المقايضة</h3>
            <p className="text-sm text-gray-500">بادل منتجاتك بدون حاجة للمال</p>
          </Link>
        </div>

        {/* My Activity Sections */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* My Items & Listings */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-l from-purple-500 to-purple-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>📦</span> منتجاتي وإعلاناتي
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/items?user=me"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">📦</div>
                  <span className="font-medium">منتجاتي</span>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
              <Link
                href="/items/new"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">➕</div>
                  <span className="font-medium">إضافة منتج جديد</span>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
              <Link
                href="/auctions/new"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-purple-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">🔨</div>
                  <span className="font-medium">إنشاء مزاد جديد</span>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
            </div>
          </div>

          {/* My Transactions */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-l from-green-500 to-green-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>💰</span> معاملاتي المالية
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/dashboard/transactions"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">💵</div>
                  <span className="font-medium">مبيعاتي ومشترياتي</span>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
              <Link
                href="/cart"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">🛒</div>
                  <span className="font-medium">سلة التسوق</span>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
              <Link
                href="/dashboard/orders"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-green-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">📋</div>
                  <span className="font-medium">طلباتي</span>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
            </div>
          </div>

          {/* Auctions & Bids */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-l from-indigo-500 to-indigo-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🔨</span> المزادات والمزايدات
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/auctions"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">🔨</div>
                  <span className="font-medium">المزادات النشطة</span>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
              <Link
                href="/dashboard/activity"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">🎯</div>
                  <span className="font-medium">مزايداتي</span>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
              <Link
                href="/reverse-auctions"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">📉</div>
                  <span className="font-medium">المناقصات</span>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
            </div>
          </div>

          {/* Barter & Exchange */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-gradient-to-l from-teal-500 to-teal-600 px-6 py-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🔄</span> المقايضة والتبادل
              </h3>
            </div>
            <div className="p-4 space-y-3">
              <Link
                href="/barter/my-offers"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">📥</div>
                  <div>
                    <span className="font-medium">عروض المقايضة</span>
                    {stats.pendingOffers > 0 && (
                      <span className="mr-2 px-2 py-0.5 bg-orange-500 text-white text-xs rounded-full">
                        {stats.pendingOffers} جديد
                      </span>
                    )}
                  </div>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
              <Link
                href="/barter"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">🔍</div>
                  <span className="font-medium">البحث عن مقايضات</span>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
              <Link
                href="/barter/new"
                className="flex items-center justify-between p-3 rounded-xl hover:bg-teal-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">➕</div>
                  <span className="font-medium">إنشاء عرض مقايضة</span>
                </div>
                <span className="text-gray-400">←</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span>💡</span> كيف تستخدم XChange؟
          </h3>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <div className="text-3xl mb-2">1️⃣</div>
              <h4 className="font-semibold mb-1">أضف منتجاتك</h4>
              <p className="text-sm text-gray-500">صوّر منتجاتك وأضفها للمنصة</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <div className="text-3xl mb-2">2️⃣</div>
              <h4 className="font-semibold mb-1">اختر طريقة البيع</h4>
              <p className="text-sm text-gray-500">بيع مباشر، مزاد، أو مقايضة</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <div className="text-3xl mb-2">3️⃣</div>
              <h4 className="font-semibold mb-1">تواصل مع المشترين</h4>
              <p className="text-sm text-gray-500">استقبل العروض وتفاوض</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-gray-50">
              <div className="text-3xl mb-2">4️⃣</div>
              <h4 className="font-semibold mb-1">أتمم الصفقة</h4>
              <p className="text-sm text-gray-500">سلّم المنتج واستلم المقابل</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-500 text-sm">
              © 2024 XChange - منصة التبادل التجاري الأولى في مصر
            </p>
            <div className="flex gap-4 text-sm">
              <Link href="/about" className="text-gray-500 hover:text-primary-600">عن المنصة</Link>
              <Link href="/contact" className="text-gray-500 hover:text-primary-600">تواصل معنا</Link>
              <Link href="/terms" className="text-gray-500 hover:text-primary-600">الشروط والأحكام</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
