'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getItems, Item } from '@/lib/api/items';
import { getCategories, Category } from '@/lib/api/categories';

// Dynamically import map component (no SSR)
const ItemsMap = dynamic(
  () => import('@/components/map/ItemsMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[500px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <p className="text-gray-500 text-sm">جاري تحميل الخريطة...</p>
        </div>
      </div>
    ),
  }
);

export default function MapPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, [selectedCategory]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [itemsResponse, categoriesResponse] = await Promise.all([
        getItems({
          limit: 500,
          categoryId: selectedCategory || undefined,
          status: 'ACTIVE',
        }),
        getCategories().catch(() => ({ success: false, data: [] })),
      ]);

      setItems(itemsResponse.data?.items || []);
      if (categoriesResponse.success) {
        setCategories(categoriesResponse.data.filter((c: Category) => !c.parentId));
      }
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter items by selected governorate
  const filteredItems = selectedGovernorate
    ? items.filter((item) => item.governorate === selectedGovernorate)
    : items;

  // Group items by governorate for stats
  const itemsByGovernorate: Record<string, number> = {};
  items.forEach((item) => {
    const gov = item.governorate || 'أخرى';
    itemsByGovernorate[gov] = (itemsByGovernorate[gov] || 0) + 1;
  });

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)} ألف`;
    }
    return price.toLocaleString('ar-EG');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">🗺️</span>
            <h1 className="text-2xl font-bold">خريطة الإعلانات</h1>
          </div>
          <p className="text-emerald-100">اكتشف الإعلانات القريبة منك على الخريطة</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <select
              value={selectedCategory || ''}
              onChange={(e) => setSelectedCategory(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">جميع الفئات</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
              ))}
            </select>

            {/* Governorate Filter */}
            {selectedGovernorate && (
              <div className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl">
                <span className="font-medium">{selectedGovernorate}</span>
                <button
                  onClick={() => setSelectedGovernorate(null)}
                  className="hover:text-emerald-900"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Stats */}
            <div className="mr-auto flex items-center gap-4 text-sm text-gray-600">
              <span>{items.length} إعلان</span>
              <span>{Object.keys(itemsByGovernorate).length} محافظة</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <ItemsMap
              items={items}
              selectedGovernorate={selectedGovernorate}
              onGovernorateSelect={setSelectedGovernorate}
              height="600px"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Governorate List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-bold text-gray-900">المحافظات</h2>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {Object.entries(itemsByGovernorate)
                  .sort((a, b) => b[1] - a[1])
                  .map(([gov, count]) => (
                    <button
                      key={gov}
                      onClick={() => setSelectedGovernorate(gov === selectedGovernorate ? null : gov)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-right ${
                        selectedGovernorate === gov ? 'bg-emerald-50' : ''
                      }`}
                    >
                      <span className={`font-medium ${selectedGovernorate === gov ? 'text-emerald-600' : 'text-gray-700'}`}>
                        {gov}
                      </span>
                      <span className={`text-sm ${selectedGovernorate === gov ? 'text-emerald-600' : 'text-gray-500'}`}>
                        {count} إعلان
                      </span>
                    </button>
                  ))}
              </div>
            </div>

            {/* Items in Selected Governorate */}
            {selectedGovernorate && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="font-bold text-gray-900">إعلانات {selectedGovernorate}</h2>
                  <span className="text-sm text-gray-500">{filteredItems.length} إعلان</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {filteredItems.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      لا توجد إعلانات في هذه المحافظة
                    </div>
                  ) : (
                    filteredItems.slice(0, 10).map((item) => (
                      <Link
                        key={item.id}
                        href={`/items/${item.id}`}
                        className="flex gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-100"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0].url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="text-xl opacity-30">📦</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 line-clamp-1">{item.title}</h3>
                          <p className="text-emerald-600 font-bold text-sm">
                            {formatPrice(item.estimatedValue || 0)} ج.م
                          </p>
                          {item.category && (
                            <span className="text-xs text-gray-500">{item.category.nameAr}</span>
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                  {filteredItems.length > 10 && (
                    <Link
                      href={`/items?governorate=${encodeURIComponent(selectedGovernorate)}`}
                      className="block p-4 text-center text-emerald-600 font-medium hover:bg-gray-50"
                    >
                      عرض كل الإعلانات ({filteredItems.length})
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">أضف إعلانك</h3>
              <p className="text-emerald-100 text-sm mb-4">
                شارك موقعك وساعد المشترين في الوصول إليك
              </p>
              <Link
                href="/inventory/add"
                className="inline-block px-4 py-2 bg-white text-emerald-600 rounded-lg font-medium hover:bg-gray-100 transition"
              >
                إضافة إعلان
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
