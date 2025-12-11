'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBarterItems, BarterItem } from '@/lib/api/barter';
import { getCategories, Category } from '@/lib/api/categories';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function BarterPage() {
  const { user } = useAuth();
  const [items, setItems] = useState<BarterItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCategories();
  }, []);

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

      // Handle different response formats safely
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

  // Condition translations
  const conditionAr: Record<string, string> = {
    'NEW': 'جديد',
    'LIKE_NEW': 'كالجديد',
    'GOOD': 'جيد',
    'FAIR': 'مقبول',
    'POOR': 'ضعيف',
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold">🔄 سوق المقايضة</h1>
              <p className="text-green-100 mt-2">
                بادل منتجاتك مع الآخرين بدون نقود!
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/barter/chains"
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition font-semibold text-sm"
              >
                🔗 سلاسل المقايضة
              </Link>
              <Link
                href="/barter/open-offers"
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition font-semibold text-sm"
              >
                العروض المفتوحة
              </Link>
              <Link
                href="/barter/my-offers"
                className="bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg hover:bg-opacity-30 transition font-semibold text-sm"
              >
                عروضي
              </Link>
              <Link
                href="/barter/new"
                className="bg-white text-teal-600 px-4 py-2 rounded-lg hover:bg-teal-50 transition font-semibold shadow-lg text-sm"
              >
                + أضف عرض مقايضة
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800">تصفية النتائج</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-teal-600 hover:text-teal-700"
                >
                  مسح الكل
                </button>
              </div>

              {/* Search */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البحث
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder="ابحث عن منتج..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                >
                  <option value="">كل الفئات</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr || cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Value Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  القيمة التقديرية (جنيه)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minValue}
                    onChange={(e) => setMinValue(e.target.value)}
                    placeholder="من"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={maxValue}
                    onChange={(e) => setMaxValue(e.target.value)}
                    placeholder="إلى"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl">
                <h3 className="font-bold text-teal-900 text-sm mb-2">
                  كيف تعمل المقايضة؟
                </h3>
                <ul className="text-xs text-teal-800 space-y-1">
                  <li>• تصفح المنتجات المعروضة للمقايضة</li>
                  <li>• قدم عرضاً بمنتجك مقابل منتج آخر</li>
                  <li>• تفاوض مع صاحب المنتج</li>
                  <li>• أتم الصفقة بدون نقود!</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
                <p className="mt-4 text-gray-600">جاري تحميل المنتجات...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadItems}
                  className="mt-4 text-teal-600 hover:text-teal-700"
                >
                  حاول مرة أخرى
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl">
                <div className="text-6xl mb-4">🔄</div>
                <p className="text-gray-800 text-xl font-bold">لا توجد منتجات للمقايضة</p>
                <p className="text-gray-500 mt-2">
                  جرب تغيير الفلاتر أو عُد لاحقاً!
                </p>
                <Link
                  href="/barter/new"
                  className="inline-block mt-4 px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition"
                >
                  أضف منتجك للمقايضة
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items.map((item) => {
                    const primaryImage =
                      typeof item.images?.[0] === 'string'
                        ? item.images[0]
                        : item.images?.find((img: any) => img.isPrimary)?.url ||
                          (item.images?.[0] as any)?.url;

                    return (
                      <Link
                        key={item.id}
                        href={`/barter/items/${item.id}`}
                        className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden group"
                      >
                        {/* Image */}
                        <div className="relative h-48 bg-gray-200">
                          {primaryImage ? (
                            <img
                              src={primaryImage}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400">
                              <span className="text-4xl">🔄</span>
                            </div>
                          )}

                          {/* Badge */}
                          <div className="absolute top-2 left-2">
                            <span className="bg-teal-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              متاح للمقايضة
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-teal-600 transition">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {item.description}
                          </p>

                          <div className="mt-3 space-y-2">
                            {item.estimatedValue && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  القيمة التقديرية:
                                </span>
                                <span className="text-lg font-bold text-teal-600">
                                  {item.estimatedValue.toLocaleString()} ج.م
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{conditionAr[item.condition] || item.condition}</span>
                              {item.category && <span className="text-gray-500">{item.category.nameAr || item.category.nameEn}</span>}
                            </div>

                            <div className="pt-2 border-t">
                              <p className="text-xs text-gray-600">
                                بواسطة {item.seller?.fullName || 'مستخدم'}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>
                    <span className="px-4 py-2 bg-teal-50 text-teal-700 rounded-lg font-medium">
                      {page} من {totalPages}
                    </span>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      التالي
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
