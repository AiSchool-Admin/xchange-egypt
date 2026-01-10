'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getBarterItems, BarterItem } from '@/lib/api/barter';
import { getCategories, Category } from '@/lib/api/categories';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getBarterRecommendations, BarterMatch, formatMatchScore } from '@/lib/api/ai';
import apiClient from '@/lib/api/client';

// Types for platform stats
interface PlatformStats {
  totalItems: number;
  activeOffers: number;
  completedTrades: number;
  successRate: number;
  savedMoney: number;
  activeUsers: number;
}

interface CategoryWithCount {
  id: string;
  name: string;
  icon: string;
  count: number;
  slug?: string;
  color: string;
}

// Default stats (shown while loading)
const DEFAULT_STATS: PlatformStats = {
  totalItems: 0,
  activeOffers: 0,
  completedTrades: 0,
  successRate: 95,
  savedMoney: 0,
  activeUsers: 0,
};

// Default categories (shown while loading)
const DEFAULT_CATEGORIES: CategoryWithCount[] = [
  { id: '1', name: 'إلكترونيات', icon: '📱', count: 0, color: 'from-blue-500 to-indigo-600' },
  { id: '2', name: 'أثاث منزلي', icon: '🛋️', count: 0, color: 'from-amber-500 to-orange-600' },
  { id: '3', name: 'ملابس وأزياء', icon: '👗', count: 0, color: 'from-pink-500 to-rose-600' },
  { id: '4', name: 'كتب ومجلات', icon: '📚', count: 0, color: 'from-emerald-500 to-teal-600' },
  { id: '5', name: 'سيارات', icon: '🚗', count: 0, color: 'from-slate-600 to-gray-800' },
  { id: '6', name: 'رياضة', icon: '⚽', count: 0, color: 'from-green-500 to-emerald-600' },
  { id: '7', name: 'أطفال', icon: '🧸', count: 0, color: 'from-purple-500 to-violet-600' },
  { id: '8', name: 'أجهزة منزلية', icon: '🔌', count: 0, color: 'from-red-500 to-rose-600' },
];

const FEATURES = [
  {
    icon: '🤖',
    title: 'مطابقة ذكية بالـ AI',
    description: 'نظام ذكاء اصطناعي متطور يجد أفضل الصفقات المناسبة لك تلقائياً',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    icon: '🔗',
    title: 'سلاسل المقايضة',
    description: 'مقايضات متعددة الأطراف: A←B←C←A بضغطة زر واحدة',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    icon: '🤝',
    title: 'صناديق جماعية',
    description: 'اجمع قيمة منتجاتك مع آخرين للحصول على منتج أكبر قيمة',
    color: 'bg-green-100 text-green-700',
  },
  {
    icon: '💰',
    title: 'مقايضة + كاش',
    description: 'أضف مبلغ نقدي لموازنة الصفقة عند اختلاف القيم',
    color: 'bg-amber-100 text-amber-700',
  },
  {
    icon: '🔒',
    title: 'نظام الضمان',
    description: 'حماية كاملة للطرفين مع نظام Escrow المتقدم',
    color: 'bg-red-100 text-red-700',
  },
  {
    icon: '⚡',
    title: 'مقايضة فورية',
    description: 'صفقات سريعة مع إشعارات لحظية وتواصل مباشر',
    color: 'bg-cyan-100 text-cyan-700',
  },
];

const HOW_IT_WORKS = [
  { step: 1, icon: '📦', title: 'أضف منتجك', desc: 'صوّر منتجك وأضفه للمقايضة مع تحديد ما تريده' },
  { step: 2, icon: '🔍', title: 'اكتشف الفرص', desc: 'تصفح المنتجات أو دع الـ AI يجد لك أفضل الصفقات' },
  { step: 3, icon: '🤝', title: 'تفاوض وقدم عرض', desc: 'تواصل مع الطرف الآخر وقدم عرض مقايضة' },
  { step: 4, icon: '✅', title: 'أتم الصفقة', desc: 'بادل منتجاتك بدون نقود وبأمان تام!' },
];

export default function BarterPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<BarterItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Platform Stats
  const [platformStats, setPlatformStats] = useState<PlatformStats>(DEFAULT_STATS);
  const [statCategories, setStatCategories] = useState<CategoryWithCount[]>(DEFAULT_CATEGORIES);
  const [loadingStats, setLoadingStats] = useState(true);

  // AI Recommendations
  const [recommendations, setRecommendations] = useState<BarterMatch[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Load platform stats
  const loadPlatformStats = useCallback(async () => {
    try {
      setLoadingStats(true);
      const response = await apiClient.get('/barter/stats');
      if (response?.data?.success && response.data.data) {
        if (response.data.data.stats) {
          setPlatformStats(response.data.data.stats);
        }
        if (response.data.data.categories?.length > 0) {
          setStatCategories(response.data.data.categories);
        }
      }
    } catch (err) {
      console.error('Failed to load platform stats:', err);
      // Keep default stats on error
    } finally {
      setLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    loadCategories();
    loadPlatformStats();
  }, [loadPlatformStats]);

  // Load AI recommendations when user is logged in
  useEffect(() => {
    if (user?.id) {
      loadRecommendations();
    }
  }, [user]);

  const loadRecommendations = async () => {
    if (!user?.id) return;
    setLoadingRecommendations(true);
    try {
      const recs = await getBarterRecommendations(user.id);
      setRecommendations(recs);
    } catch (err) {
      console.error('Failed to load recommendations:', err);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, [page, selectedCategory, minValue, maxValue, searchQuery, user]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getBarterItems({
        page,
        limit: 12,
        categoryId: selectedCategory || undefined,
        minValue: minValue ? parseFloat(minValue) : undefined,
        maxValue: maxValue ? parseFloat(maxValue) : undefined,
        search: searchQuery || undefined,
      });

      const responseData = response as any;
      let items = responseData?.data?.items || responseData?.items || [];
      const pagination = responseData?.data?.pagination || responseData?.pagination || { totalPages: 1 };

      // Filter out current user's items from barter marketplace
      if (user) {
        items = items.filter((item: BarterItem) => item.seller?.id !== user.id);
      }

      setItems(items);
      setTotalPages(pagination.totalPages || 1);
    } catch (err: any) {
      console.error('Barter items error:', err);
      setError(err.response?.data?.message || err.message || 'فشل في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setMinValue('');
    setMaxValue('');
    setSearchQuery('');
    setPage(1);
  };

  const conditionAr: Record<string, string> = {
    'NEW': 'جديد',
    'LIKE_NEW': 'كالجديد',
    'GOOD': 'جيد',
    'FAIR': 'مقبول',
    'POOR': 'ضعيف',
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* ===============================================
          Hero Section - الواجهة الرئيسية المميزة
          =============================================== */}
      <section className="relative bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 text-white overflow-hidden">
        {/* خلفية متحركة */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* النص الرئيسي */}
            <div className="text-center lg:text-right">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
                أول سوق مقايضة ذكية في مصر والشرق الأوسط
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 leading-tight">
                بادل منتجاتك
                <span className="block text-yellow-300">بدون نقود!</span>
              </h1>

              <p className="text-lg lg:text-xl text-teal-100 mb-8 max-w-xl mx-auto lg:mx-0">
                منصة Xchange تربطك بآلاف المستخدمين لمبادلة ما لا تحتاجه بما تحتاجه فعلاً.
                وفّر أموالك واحصل على ما تريد بذكاء!
              </p>

              {/* أزرار الإجراء */}
              <div className="flex flex-wrap gap-4 justify-center lg:justify-start">
                <Link
                  href="/barter/new"
                  className="px-8 py-4 bg-white text-teal-700 rounded-2xl font-bold text-lg hover:bg-yellow-300 hover:text-teal-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
                >
                  <span className="text-2xl">🔄</span>
                  ابدأ المقايضة الآن
                </Link>
                <Link
                  href="/barter/guide"
                  className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold text-lg hover:bg-white/30 transition-all flex items-center gap-2"
                >
                  <span className="text-2xl">📖</span>
                  كيف تعمل؟
                </Link>
              </div>
            </div>

            {/* إحصائيات */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                <div className="text-4xl font-bold text-yellow-300 mb-1">
                  {loadingStats ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <>{platformStats.completedTrades.toLocaleString('ar-EG')}+</>
                  )}
                </div>
                <div className="text-teal-100">صفقة ناجحة</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                <div className="text-4xl font-bold text-yellow-300 mb-1">
                  {loadingStats ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <>{platformStats.activeUsers.toLocaleString('ar-EG')}+</>
                  )}
                </div>
                <div className="text-teal-100">مستخدم نشط</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                <div className="text-4xl font-bold text-yellow-300 mb-1">
                  {loadingStats ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <>{platformStats.successRate}%</>
                  )}
                </div>
                <div className="text-teal-100">نسبة النجاح</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all">
                <div className="text-4xl font-bold text-yellow-300 mb-1">
                  {loadingStats ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <>{platformStats.savedMoney >= 1000000
                        ? `${(platformStats.savedMoney / 1000000).toFixed(1)}M`
                        : platformStats.savedMoney.toLocaleString('ar-EG')}</>
                  )}
                </div>
                <div className="text-teal-100">جنيه تم توفيره</div>
              </div>
            </div>
          </div>
        </div>

        {/* موجة سفلية */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* ===============================================
          شريط التنقل السريع
          =============================================== */}
      <section className="bg-white border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            <Link
              href="/barter"
              className="flex items-center gap-2 px-5 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm whitespace-nowrap"
            >
              <span>🏠</span>
              الرئيسية
            </Link>
            <Link
              href="/barter/new"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-orange-500 to-amber-500 text-white rounded-xl font-bold text-sm whitespace-nowrap hover:from-orange-600 hover:to-amber-600 transition-all"
            >
              <span>➕</span>
              أضف عرض مقايضة
            </Link>
            <Link
              href="/barter/open-offers"
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-gray-200 transition"
            >
              <span>📋</span>
              العروض المفتوحة
            </Link>
            <Link
              href="/barter/my-offers"
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-gray-200 transition"
            >
              <span>📁</span>
              عروضي
            </Link>
            <Link
              href="/barter/chains"
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-gray-200 transition"
            >
              <span>🔗</span>
              سلاسل المقايضة
            </Link>
            <Link
              href="/pools"
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm whitespace-nowrap hover:bg-gray-200 transition"
            >
              <span>🤝</span>
              الصناديق الجماعية
            </Link>
            <Link
              href="/barter/recommendations"
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-l from-purple-500 to-indigo-500 text-white rounded-xl font-bold text-sm whitespace-nowrap hover:from-purple-600 hover:to-indigo-600 transition-all"
            >
              <span>🤖</span>
              توصيات AI
            </Link>
          </div>
        </div>
      </section>

      {/* ===============================================
          توصيات الذكاء الاصطناعي
          =============================================== */}
      {user && (recommendations.length > 0 || loadingRecommendations) && (
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="bg-gradient-to-l from-purple-50 via-indigo-50 to-blue-50 border border-purple-200 rounded-3xl p-6 lg:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-lg">
                  🤖
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-purple-900">توصيات الذكاء الاصطناعي</h2>
                  <p className="text-purple-700">مقايضات مقترحة بناءً على منتجاتك وتفضيلاتك</p>
                </div>
              </div>
              <Link
                href="/barter/recommendations"
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition flex items-center gap-2"
              >
                عرض الكل
                <span>←</span>
              </Link>
            </div>

            {loadingRecommendations ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
                <span className="mr-4 text-purple-600 font-medium">جاري تحليل أفضل الفرص...</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendations.slice(0, 6).map((rec) => (
                  <div
                    key={rec.matchId}
                    className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all border border-purple-100 group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="bg-gradient-to-l from-purple-500 to-indigo-500 text-white px-3 py-1 rounded-full text-sm font-bold">
                          {formatMatchScore(rec.score)}
                        </span>
                      </div>
                      <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                        نجاح: {Math.round(rec.successProbability * 100)}%
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-xl">
                        <span className="text-2xl">🔄</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-orange-600 font-medium">منتجك</p>
                          <p className="font-bold text-gray-800 truncate">{rec.offeredItemTitle}</p>
                        </div>
                      </div>

                      <div className="flex justify-center">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <span className="text-purple-600">↕️</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-3 bg-green-50 rounded-xl">
                        <span className="text-2xl">✨</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-green-600 font-medium">تحصل على</p>
                          <p className="font-bold text-gray-800 truncate">{rec.requestedItemTitle}</p>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mt-4 p-3 bg-gray-50 rounded-xl line-clamp-2">
                      💡 {rec.reason}
                    </p>

                    <div className="flex gap-2 mt-4">
                      <Link
                        href={`/barter/items/${rec.requestedItemId}`}
                        className="flex-1 text-center px-4 py-2.5 bg-purple-100 text-purple-700 rounded-xl text-sm font-bold hover:bg-purple-200 transition"
                      >
                        التفاصيل
                      </Link>
                      <Link
                        href={`/barter/respond/${rec.requestedItemId}?offer=${rec.offeredItemId}`}
                        className="flex-1 text-center px-4 py-2.5 bg-gradient-to-l from-green-500 to-emerald-500 text-white rounded-xl text-sm font-bold hover:from-green-600 hover:to-emerald-600 transition"
                      >
                        قدم عرض
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* ===============================================
          التصفح حسب الفئات
          =============================================== */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">تصفح حسب الفئة</h2>
          <Link href="/items" className="text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1">
            عرض الكل
            <span>←</span>
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {statCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex flex-col items-center p-4 rounded-2xl transition-all hover:scale-105 ${
                selectedCategory === cat.id
                  ? 'bg-gradient-to-br ' + cat.color + ' text-white shadow-lg'
                  : 'bg-white hover:shadow-md border border-gray-100'
              }`}
            >
              <span className="text-3xl mb-2">{cat.icon}</span>
              <span className="font-bold text-sm">{cat.name}</span>
              <span className={`text-xs mt-1 ${selectedCategory === cat.id ? 'text-white/80' : 'text-gray-500'}`}>
                {loadingStats ? '...' : cat.count.toLocaleString('ar-EG')} منتج
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ===============================================
          منطقة البحث والفلترة
          =============================================== */}
      <section className="max-w-7xl mx-auto px-4 pb-4">
        <div className="bg-white rounded-2xl shadow-sm p-4 flex flex-col lg:flex-row gap-4 items-center">
          {/* بحث */}
          <div className="flex-1 w-full">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                placeholder="ابحث عن منتجات للمقايضة..."
                className="w-full px-5 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
            </div>
          </div>

          {/* فلاتر سريعة */}
          <div className="flex gap-2 flex-wrap">
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setPage(1);
              }}
              className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white"
            >
              <option value="">كل الفئات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nameAr || cat.nameEn}
                </option>
              ))}
            </select>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl font-medium flex items-center gap-2 transition ${
                showFilters ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span>⚙️</span>
              فلاتر متقدمة
            </button>

            {(selectedCategory || minValue || maxValue || searchQuery) && (
              <button
                onClick={clearFilters}
                className="px-4 py-3 bg-red-100 text-red-700 rounded-xl font-medium hover:bg-red-200 transition flex items-center gap-2"
              >
                <span>✕</span>
                مسح الفلاتر
              </button>
            )}
          </div>
        </div>

        {/* فلاتر متقدمة */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-sm p-4 mt-4 border-2 border-teal-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">القيمة من (جنيه)</label>
                <input
                  type="number"
                  value={minValue}
                  onChange={(e) => setMinValue(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">القيمة إلى (جنيه)</label>
                <input
                  type="number"
                  value={maxValue}
                  onChange={(e) => setMaxValue(e.target.value)}
                  placeholder="غير محدد"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={() => setPage(1)}
                  className="w-full px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition"
                >
                  تطبيق الفلاتر
                </button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ===============================================
          قائمة المنتجات
          =============================================== */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            منتجات متاحة للمقايضة
            {items.length > 0 && (
              <span className="text-lg font-normal text-gray-500 mr-2">
                ({items.length} منتج)
              </span>
            )}
          </h2>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <span className="text-6xl block mb-4">⚠️</span>
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={loadItems}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <span className="text-7xl block mb-4">🔄</span>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">لا توجد منتجات للمقايضة</h3>
            <p className="text-gray-500 mb-6">جرب تغيير الفلاتر أو كن أول من يضيف منتج!</p>
            <Link
              href="/barter/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-l from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:from-teal-600 hover:to-emerald-600 transition shadow-lg"
            >
              <span className="text-xl">➕</span>
              أضف منتجك للمقايضة
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => {
                const primaryImage = item.images && item.images.length > 0
                  ? (typeof item.images[0] === 'string'
                      ? item.images[0]
                      : item.images.find((img: any) => img.isPrimary)?.url ||
                        (item.images[0] as any)?.url)
                  : undefined;

                return (
                  <Link
                    key={item.id}
                    href={`/barter/items/${item.id}`}
                    className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden group border border-gray-100"
                  >
                    {/* صورة */}
                    <div className="relative h-48 bg-gray-100 overflow-hidden">
                      {primaryImage ? (
                        <img
                          src={primaryImage}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300">
                          <span className="text-6xl">🔄</span>
                        </div>
                      )}

                      {/* شارة المقايضة */}
                      <div className="absolute top-3 right-3">
                        <span className="bg-gradient-to-l from-teal-500 to-emerald-500 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
                          متاح للمقايضة
                        </span>
                      </div>
                    </div>

                    {/* المحتوى */}
                    <div className="p-4">
                      <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition mb-2">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2 mb-3">
                        {item.description}
                      </p>

                      <div className="space-y-2">
                        {item.estimatedValue && (
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-500">القيمة التقديرية</span>
                            <span className="text-lg font-bold text-teal-600">
                              {item.estimatedValue.toLocaleString('ar-EG')} ج.م
                            </span>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="bg-gray-100 px-2 py-1 rounded-lg text-gray-600">
                            {conditionAr[item.condition] || item.condition}
                          </span>
                          {item.category && (
                            <span className="text-gray-500">
                              {item.category.nameAr || item.category.nameEn}
                            </span>
                          )}
                        </div>

                        <div className="pt-3 border-t flex items-center gap-2">
                          <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
                            <span className="text-teal-600 text-sm">
                              {item.seller?.fullName?.charAt(0) || '👤'}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {item.seller?.fullName || 'مستخدم'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* الصفحات */}
            {totalPages > 1 && (
              <div className="mt-10 flex justify-center items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                >
                  السابق
                </button>

                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = i + 1;
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setPage(pageNum)}
                        className={`w-10 h-10 rounded-xl font-bold transition ${
                          page === pageNum
                            ? 'bg-teal-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="px-2 text-gray-400">...</span>
                      <button
                        onClick={() => setPage(totalPages)}
                        className={`w-10 h-10 rounded-xl font-bold transition ${
                          page === totalPages
                            ? 'bg-teal-600 text-white'
                            : 'hover:bg-gray-100 text-gray-700'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-3 border-2 border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </section>

      {/* ===============================================
          كيف تعمل المقايضة
          =============================================== */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">كيف تعمل المقايضة؟</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              أربع خطوات بسيطة لمبادلة منتجاتك بدون نقود
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {HOW_IT_WORKS.map((step, index) => (
              <div key={step.step} className="relative">
                {index < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-gradient-to-l from-teal-200 to-teal-400 -z-10"></div>
                )}
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                    <span className="text-4xl">{step.icon}</span>
                  </div>
                  <div className="bg-teal-600 text-white w-8 h-8 rounded-full flex items-center justify-center mx-auto -mt-6 mb-4 font-bold text-sm shadow-lg">
                    {step.step}
                  </div>
                  <h3 className="font-bold text-lg text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-gray-600 text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===============================================
          مميزات المنصة
          =============================================== */}
      <section className="py-16 bg-gradient-to-br from-gray-50 to-teal-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">لماذا Xchange أفضل منصة مقايضة؟</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              تقنيات متقدمة وحلول ذكية لتجربة مقايضة استثنائية
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all border border-gray-100 group"
              >
                <div className={`w-14 h-14 ${feature.color} rounded-2xl flex items-center justify-center mb-4 text-2xl group-hover:scale-110 transition-transform`}>
                  {feature.icon}
                </div>
                <h3 className="font-bold text-lg text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===============================================
          CTA Section - دعوة للعمل
          =============================================== */}
      <section className="bg-gradient-to-br from-teal-600 via-emerald-600 to-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            جاهز لتبادل منتجاتك؟
          </h2>
          <p className="text-teal-100 text-lg mb-8 max-w-2xl mx-auto">
            انضم لآلاف المستخدمين الذين يوفرون أموالهم يومياً من خلال المقايضة الذكية
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link
              href="/barter/new"
              className="px-8 py-4 bg-white text-teal-700 rounded-2xl font-bold text-lg hover:bg-yellow-300 hover:text-teal-800 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 flex items-center gap-2"
            >
              <span className="text-2xl">🔄</span>
              ابدأ المقايضة الآن
            </Link>
            {!user && (
              <Link
                href="/register"
                className="px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-2xl font-bold text-lg hover:bg-white/30 transition-all flex items-center gap-2"
              >
                <span className="text-2xl">👤</span>
                إنشاء حساب مجاني
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
