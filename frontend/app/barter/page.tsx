'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getBarterItems, BarterItem } from '@/lib/api/barter';
import { getCategories, Category } from '@/lib/api/categories';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useLanguage } from '@/lib/contexts/LanguageContext';

export default function BarterPage() {
  const { user } = useAuth();
  const { language, t } = useLanguage();
  const [items, setItems] = useState<BarterItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] = useState('');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Governorates list
  const governorates = [
    'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea', 'Beheira',
    'Fayoum', 'Gharbiya', 'Ismailia', 'Menofia', 'Minya', 'Qaliubiya',
    'New Valley', 'Suez', 'Aswan', 'Assiut', 'Beni Suef', 'Port Said',
    'Damietta', 'Sharkia', 'South Sinai', 'Kafr El Sheikh', 'Matrouh',
    'Luxor', 'Qena', 'North Sinai', 'Sohag'
  ];

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadItems();
  }, [page, selectedCategory, selectedCondition, selectedGovernorate, minValue, maxValue, searchQuery, sortBy]);

  const loadCategories = async () => {
    try {
      const response = await getCategories({ includeChildren: true });
      const parentCategories = response.data.filter(cat => !cat.parentId);
      setCategories(parentCategories);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const response = await getBarterItems({
        page,
        limit: 12,
        categoryId: selectedCategory || undefined,
        condition: selectedCondition || undefined,
        governorate: selectedGovernorate || undefined,
        minValue: minValue ? parseFloat(minValue) : undefined,
        maxValue: maxValue ? parseFloat(maxValue) : undefined,
        search: searchQuery || undefined,
      });

      let sortedItems = response.data.items;

      // Client-side sorting
      if (sortBy === 'value-high') {
        sortedItems = [...sortedItems].sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));
      } else if (sortBy === 'value-low') {
        sortedItems = [...sortedItems].sort((a, b) => (a.estimatedValue || 0) - (b.estimatedValue || 0));
      }

      setItems(sortedItems);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.total);
    } catch (err: any) {
      console.error('Barter items load error:', err);
      const errorMsg = err.response?.data?.message || err.message || 'Failed to load items';
      const statusCode = err.response?.status ? ` (${err.response.status})` : '';
      setError(`${errorMsg}${statusCode}`);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSelectedCategory('');
    setSelectedCondition('');
    setSelectedGovernorate('');
    setMinValue('');
    setMaxValue('');
    setSearchQuery('');
    setSortBy('newest');
    setPage(1);
  };

  const activeFiltersCount = [
    selectedCategory, selectedCondition, selectedGovernorate, minValue, maxValue, searchQuery
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold">🔄 Barter & Exchange</h1>
              <p className="text-green-100 mt-2">
                Trade items directly without money!
              </p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/barter/matches"
                className="bg-yellow-400 text-yellow-900 px-6 py-3 rounded-lg hover:bg-yellow-300 transition font-semibold shadow-lg"
              >
                Smart Matches
              </Link>
              <Link
                href="/barter/my-offers"
                className="bg-white bg-opacity-20 text-white px-6 py-3 rounded-lg hover:bg-opacity-30 transition font-semibold"
              >
                My Offers
              </Link>
              <Link
                href="/barter/new"
                className="bg-white text-green-600 px-6 py-3 rounded-lg hover:bg-green-50 transition font-semibold shadow-lg"
              >
                + Make Offer
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-20">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">
                  {t('الفلاتر', 'Filters')}
                  {activeFiltersCount > 0 && (
                    <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      {activeFiltersCount}
                    </span>
                  )}
                </h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-green-600 hover:text-green-700"
                >
                  {t('مسح الكل', 'Clear All')}
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('بحث', 'Search')}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setPage(1);
                  }}
                  placeholder={t('ابحث عن عناصر...', 'Search items...')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              {/* Sort */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('ترتيب حسب', 'Sort By')}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="newest">{t('الأحدث', 'Newest')}</option>
                  <option value="value-high">{t('القيمة: الأعلى', 'Value: High to Low')}</option>
                  <option value="value-low">{t('القيمة: الأقل', 'Value: Low to High')}</option>
                </select>
              </div>

              {/* Category Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('الفئة', 'Category')}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{t('جميع الفئات', 'All Categories')}</option>
                  {categories.map((cat) => (
                    <React.Fragment key={cat.id}>
                      <option value={cat.id}>
                        {language === 'ar' ? cat.nameAr : cat.nameEn}
                      </option>
                      {cat.children && cat.children.map((child) => (
                        <option key={child.id} value={child.id}>
                          &nbsp;&nbsp;↳ {language === 'ar' ? child.nameAr : child.nameEn}
                        </option>
                      ))}
                    </React.Fragment>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('الحالة', 'Condition')}
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => {
                    setSelectedCondition(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{t('أي حالة', 'Any Condition')}</option>
                  <option value="NEW">{t('جديد', 'New')}</option>
                  <option value="LIKE_NEW">{t('كالجديد', 'Like New')}</option>
                  <option value="GOOD">{t('جيد', 'Good')}</option>
                  <option value="FAIR">{t('مقبول', 'Fair')}</option>
                  <option value="POOR">{t('ضعيف', 'Poor')}</option>
                </select>
              </div>

              {/* Governorate Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('المحافظة', 'Governorate')}
                </label>
                <select
                  value={selectedGovernorate}
                  onChange={(e) => {
                    setSelectedGovernorate(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="">{t('جميع المحافظات', 'All Governorates')}</option>
                  {governorates.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              {/* Value Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('القيمة المقدرة (ج.م)', 'Estimated Value (EGP)')}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minValue}
                    onChange={(e) => {
                      setMinValue(e.target.value);
                      setPage(1);
                    }}
                    placeholder={t('الحد الأدنى', 'Min')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={maxValue}
                    onChange={(e) => {
                      setMaxValue(e.target.value);
                      setPage(1);
                    }}
                    placeholder={t('الحد الأقصى', 'Max')}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Results Count */}
              {!loading && (
                <div className="mb-4 text-sm text-gray-600">
                  {t(`${totalItems} نتيجة`, `${totalItems} results`)}
                </div>
              )}

              {/* Info Box */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="font-semibold text-green-900 text-sm mb-2">
                  {t('كيف يعمل', 'How It Works')}
                </h3>
                <ul className="text-xs text-green-800 space-y-1">
                  <li>• {t('تصفح العناصر المتاحة للتبادل', 'Browse items available for trade')}</li>
                  <li>• {t('قدم عروضا بعناصرك', 'Make offers with your items')}</li>
                  <li>• {t('تفاوض وأنهِ الصفقات', 'Negotiate and finalize deals')}</li>
                  <li>• {t('لا حاجة للمال!', 'No money needed!')}</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                <p className="mt-4 text-gray-600">Loading items...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadItems}
                  className="mt-4 text-green-600 hover:text-green-700"
                >
                  Try Again
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">No items found for barter</p>
                <p className="text-gray-500 mt-2">
                  Try adjusting your filters or check back later!
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items.map((item) => {
                    const primaryImage =
                      item.images?.find((img) => img.isPrimary)?.url ||
                      item.images?.[0]?.url;

                    return (
                      <Link
                        key={item.id}
                        href={`/barter/items/${item.id}`}
                        className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group"
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
                          <div className="absolute top-2 right-2">
                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                              Available
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-4">
                          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-green-600 transition">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                            {item.description}
                          </p>

                          <div className="mt-3 space-y-2">
                            {item.estimatedValue && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">
                                  Est. Value:
                                </span>
                                <span className="text-lg font-bold text-green-600">
                                  {item.estimatedValue.toLocaleString()} EGP
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between text-sm">
                              <span className="text-gray-600">{item.condition.replace('_', ' ')}</span>
                              <span className="text-gray-600">
                                {language === 'ar' ? (item.category as any).nameAr : item.category.nameEn}
                              </span>
                            </div>

                            <div className="pt-2 border-t">
                              <p className="text-xs text-gray-600">
                                By {item.seller.fullName}
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
                      Previous
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-4 py-2 rounded-lg ${
                              page === pageNum
                                ? 'bg-green-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Next
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
