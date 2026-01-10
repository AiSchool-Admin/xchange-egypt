'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getItems, Item } from '@/lib/api/items';
import { getCategories, getCategoryTree, Category } from '@/lib/api/categories';
import { EGYPT, getAllGovernorates, getCitiesByGovernorate, getDistrictsByCity } from '@/lib/data/egyptLocations';

// Dynamically import map component (no SSR)
const ItemsMap = dynamic(
  () => import('@/components/map/ItemsMap'),
  {
    ssr: false,
    loading: () => (
      <div className="h-[600px] bg-gray-100 rounded-xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">جاري تحميل الخريطة...</p>
        </div>
      </div>
    ),
  }
);

// Hierarchical category interface
interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}

export default function MapPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryWithChildren[]>([]);

  // Location filters
  const [selectedGovernorate, setSelectedGovernorate] = useState<string | null>(null);
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  // Category filters (hierarchical)
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get effective category ID for API call
  const effectiveCategoryId = selectedSubSubCategory || selectedSubCategory || selectedParentCategory;

  useEffect(() => {
    loadData();
  }, [effectiveCategoryId, selectedGovernorate, selectedCity, selectedDistrict]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Load categories with tree structure
      const [categoriesResponse, treeResponse] = await Promise.all([
        getCategories().catch((err) => {
          console.error('Categories API error:', err);
          return { success: false, data: [] };
        }),
        getCategoryTree().catch((err) => {
          console.error('Category tree API error:', err);
          return { success: false, data: [] };
        }),
      ]);

      if (categoriesResponse.success && categoriesResponse.data) {
        setAllCategories(categoriesResponse.data);
      }

      if (treeResponse.success && treeResponse.data) {
        setCategoryTree(treeResponse.data);
      }

      // Load items with filters
      // Note: API has max limit of 100 per request
      const itemsResponse = await getItems({
        limit: 100,
        categoryId: effectiveCategoryId || undefined,
        governorate: selectedGovernorate || undefined,
        city: selectedCity || undefined,
        district: selectedDistrict || undefined,
      }).catch((err) => {
        console.error('Items API error:', err);
        setError(`فشل تحميل الأصناف: ${err.message || 'خطأ في الاتصال'}`);
        return { success: false, data: { items: [] } };
      });

      const loadedItems = itemsResponse.data?.items || [];
      setItems(loadedItems);

      if (loadedItems.length === 0 && !error) {
        setError('لا توجد أصناف متاحة حالياً');
      }
    } catch (err: any) {
      console.error('Failed to load data:', err);
      setError(`خطأ: ${err.message || 'فشل الاتصال بالخادم'}`);
    } finally {
      setLoading(false);
    }
  };

  // Get parent categories (no parent) - these are already root nodes from tree API
  const parentCategories = useMemo(() => {
    return categoryTree;
  }, [categoryTree]);

  // Get subcategories for selected parent
  const subCategories = useMemo(() => {
    if (!selectedParentCategory) return [];
    const parent = parentCategories.find(c => c.id === selectedParentCategory);
    return parent?.children || [];
  }, [parentCategories, selectedParentCategory]);

  // Get sub-subcategories for selected subcategory
  const subSubCategories = useMemo(() => {
    if (!selectedSubCategory) return [];
    const sub = subCategories.find(c => c.id === selectedSubCategory);
    return sub?.children || [];
  }, [subCategories, selectedSubCategory]);

  // Get all governorates from egyptLocations
  const allGovernorates = useMemo(() => getAllGovernorates(), []);

  // Find governorate object by name (Arabic)
  const findGovernorateByName = (name: string) => {
    return allGovernorates.find(g => g.nameAr === name || g.nameEn === name || g.id === name);
  };

  // Get cities for selected governorate from egyptLocations
  const availableCities = useMemo(() => {
    if (!selectedGovernorate) return [];
    const gov = findGovernorateByName(selectedGovernorate);
    if (gov) {
      return gov.cities;
    }
    // Fallback: get cities from items if governorate not found in predefined list
    return [...new Set(
      items
        .filter(i => i.governorate === selectedGovernorate && i.city)
        .map(i => i.city!)
    )].map(name => ({ id: name, nameAr: name, nameEn: name, districts: [] }));
  }, [selectedGovernorate, items, allGovernorates]);

  // Get districts for selected city from egyptLocations
  const availableDistricts = useMemo(() => {
    if (!selectedGovernorate || !selectedCity) return [];
    const gov = findGovernorateByName(selectedGovernorate);
    if (gov) {
      const city = gov.cities.find(c => c.nameAr === selectedCity || c.nameEn === selectedCity || c.id === selectedCity);
      if (city) {
        return city.districts;
      }
    }
    // Fallback: get districts from items
    return [...new Set(
      items
        .filter(i => i.city === selectedCity && i.district)
        .map(i => i.district!)
    )].map(name => ({ id: name, nameAr: name, nameEn: name }));
  }, [selectedGovernorate, selectedCity, items, allGovernorates]);

  // Filter items by selected location
  const filteredItems = useMemo(() => {
    let result = items;
    if (selectedGovernorate) {
      result = result.filter((item) => item.governorate === selectedGovernorate);
    }
    if (selectedCity) {
      result = result.filter((item) => item.city === selectedCity);
    }
    if (selectedDistrict) {
      result = result.filter((item) => item.district === selectedDistrict);
    }
    return result;
  }, [items, selectedGovernorate, selectedCity, selectedDistrict]);

  // Group items by governorate for stats
  const itemsByGovernorate = useMemo(() => {
    const grouped: Record<string, number> = {};
    items.forEach((item) => {
      const gov = item.governorate || 'أخرى';
      grouped[gov] = (grouped[gov] || 0) + 1;
    });
    return grouped;
  }, [items]);

  // Handle parent category change
  const handleParentCategoryChange = (categoryId: string | null) => {
    setSelectedParentCategory(categoryId);
    setSelectedSubCategory(null);
    setSelectedSubSubCategory(null);
  };

  // Handle subcategory change
  const handleSubCategoryChange = (categoryId: string | null) => {
    setSelectedSubCategory(categoryId);
    setSelectedSubSubCategory(null);
  };

  // Handle governorate change
  const handleGovernorateChange = (governorate: string | null) => {
    setSelectedGovernorate(governorate);
    setSelectedCity(null);
    setSelectedDistrict(null);
  };

  // Handle city change
  const handleCityChange = (city: string | null) => {
    setSelectedCity(city);
    setSelectedDistrict(null);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setSelectedGovernorate(null);
    setSelectedCity(null);
    setSelectedDistrict(null);
    setSelectedParentCategory(null);
    setSelectedSubCategory(null);
    setSelectedSubSubCategory(null);
  };

  const hasActiveFilters = selectedGovernorate || selectedCity || selectedDistrict ||
    selectedParentCategory || selectedSubCategory || selectedSubSubCategory;

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
      <div className="bg-gradient-to-l from-emerald-600 via-teal-600 to-emerald-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🗺️</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold">خريطة الإعلانات التفاعلية</h1>
              <p className="text-emerald-100 text-sm">اكتشف الإعلانات القريبة منك على الخريطة</p>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 py-4">
          {/* Category Filters Row */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <span>📂</span> الفئات:
            </span>

            {/* Parent Category */}
            <select
              value={selectedParentCategory || ''}
              onChange={(e) => handleParentCategoryChange(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white min-w-[140px]"
            >
              <option value="">الفئة الرئيسية</option>
              {parentCategories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
              ))}
            </select>

            {/* Sub Category */}
            {selectedParentCategory && subCategories.length > 0 && (
              <select
                value={selectedSubCategory || ''}
                onChange={(e) => handleSubCategoryChange(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white min-w-[140px]"
              >
                <option value="">الفئة الفرعية</option>
                {subCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                ))}
              </select>
            )}

            {/* Sub-Sub Category */}
            {selectedSubCategory && subSubCategories.length > 0 && (
              <select
                value={selectedSubSubCategory || ''}
                onChange={(e) => setSelectedSubSubCategory(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white min-w-[140px]"
              >
                <option value="">الفئة الفرع-فرعية</option>
                {subSubCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                ))}
              </select>
            )}
          </div>

          {/* Location Filters Row */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <span>📍</span> الموقع:
            </span>

            {/* Governorate */}
            <select
              value={selectedGovernorate || ''}
              onChange={(e) => handleGovernorateChange(e.target.value || null)}
              className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white min-w-[140px]"
            >
              <option value="">جميع المحافظات</option>
              {allGovernorates.map((gov) => {
                const count = itemsByGovernorate[gov.nameAr] || 0;
                return (
                  <option key={gov.id} value={gov.nameAr}>
                    {gov.nameAr} {count > 0 ? `(${count})` : ''}
                  </option>
                );
              })}
            </select>

            {/* City */}
            {selectedGovernorate && availableCities.length > 0 && (
              <select
                value={selectedCity || ''}
                onChange={(e) => handleCityChange(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white min-w-[140px]"
              >
                <option value="">جميع المدن</option>
                {availableCities.map((city) => (
                  <option key={city.id} value={city.nameAr}>{city.nameAr}</option>
                ))}
              </select>
            )}

            {/* District */}
            {selectedCity && availableDistricts.length > 0 && (
              <select
                value={selectedDistrict || ''}
                onChange={(e) => setSelectedDistrict(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm bg-white min-w-[140px]"
              >
                <option value="">جميع الأحياء</option>
                {availableDistricts.map((district) => (
                  <option key={district.id} value={district.nameAr}>{district.nameAr}</option>
                ))}
              </select>
            )}

            {/* Clear Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-red-100 text-red-600 rounded-xl hover:bg-red-200 transition text-sm font-medium flex items-center gap-1"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                مسح الفلاتر
              </button>
            )}

            {/* Stats */}
            <div className="mr-auto flex items-center gap-4 text-sm">
              <span className="flex items-center gap-1 text-emerald-600 font-medium">
                <span className="w-2 h-2 bg-emerald-500 rounded-full"></span>
                {filteredItems.length} إعلان
              </span>
              <span className="flex items-center gap-1 text-blue-600 font-medium">
                <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                {Object.keys(itemsByGovernorate).length} محافظة
              </span>
              {error && (
                <span className="text-red-500 flex items-center gap-1">
                  <span>⚠️</span> {error}
                </span>
              )}
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
              selectedCity={selectedCity}
              onGovernorateSelect={handleGovernorateChange}
              onCitySelect={handleCityChange}
              height="600px"
            />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Active Filters Summary */}
            {hasActiveFilters && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                  <span>🔍</span> الفلاتر النشطة
                </h3>
                <div className="flex flex-wrap gap-2">
                  {selectedParentCategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-full text-xs font-medium">
                      {parentCategories.find(c => c.id === selectedParentCategory)?.nameAr}
                    </span>
                  )}
                  {selectedSubCategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-full text-xs font-medium">
                      {subCategories.find(c => c.id === selectedSubCategory)?.nameAr}
                    </span>
                  )}
                  {selectedSubSubCategory && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-cyan-100 text-cyan-700 rounded-full text-xs font-medium">
                      {subSubCategories.find(c => c.id === selectedSubSubCategory)?.nameAr}
                    </span>
                  )}
                  {selectedGovernorate && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      📍 {selectedGovernorate}
                    </span>
                  )}
                  {selectedCity && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-indigo-100 text-indigo-700 rounded-full text-xs font-medium">
                      🏘️ {selectedCity}
                    </span>
                  )}
                  {selectedDistrict && (
                    <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      🏠 {selectedDistrict}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Governorate List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gradient-to-l from-emerald-50 to-teal-50">
                <h2 className="font-bold text-gray-900 flex items-center gap-2">
                  <span>🗺️</span> المحافظات
                </h2>
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {loading ? (
                  <div className="p-6 text-center">
                    <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-gray-500 text-sm">جاري التحميل...</p>
                  </div>
                ) : (
                  allGovernorates.map((gov) => {
                    const count = itemsByGovernorate[gov.nameAr] || 0;
                    const isSelected = selectedGovernorate === gov.nameAr;
                    return (
                      <button
                        key={gov.id}
                        onClick={() => handleGovernorateChange(isSelected ? null : gov.nameAr)}
                        className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition text-right border-b border-gray-50 last:border-0 ${
                          isSelected ? 'bg-emerald-50' : ''
                        }`}
                      >
                        <span className={`font-medium flex items-center gap-2 ${isSelected ? 'text-emerald-600' : 'text-gray-700'}`}>
                          <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-emerald-500' : count > 0 ? 'bg-emerald-300' : 'bg-gray-200'}`}></span>
                          {gov.nameAr}
                        </span>
                        {count > 0 && (
                          <span className={`text-sm px-2 py-0.5 rounded-full ${
                            isSelected
                              ? 'bg-emerald-500 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {count}
                          </span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Items in Selected Location */}
            {(selectedGovernorate || selectedCity) && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-l from-blue-50 to-indigo-50">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <span>📦</span>
                    إعلانات {selectedCity || selectedGovernorate}
                  </h2>
                  <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
                    {filteredItems.length} إعلان
                  </span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                  {filteredItems.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <div className="text-3xl mb-2">📭</div>
                      <p className="text-sm">لا توجد إعلانات في هذا الموقع</p>
                    </div>
                  ) : (
                    filteredItems.slice(0, 10).map((item) => (
                      <Link
                        key={item.id}
                        href={`/items/${item.id}`}
                        className="flex gap-3 p-4 hover:bg-gray-50 transition border-b border-gray-100 last:border-0"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0 shadow-sm">
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0].url}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
                              <span className="text-xl opacity-30">📦</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-gray-900 line-clamp-1">{item.title}</h3>
                          <p className="text-emerald-600 font-bold text-sm">
                            {formatPrice(item.estimatedValue || 0)} ج.م
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            {item.category && (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                {item.category.nameAr}
                              </span>
                            )}
                            {item.city && (
                              <span className="text-xs text-gray-400">
                                🏘️ {item.city}
                              </span>
                            )}
                          </div>
                        </div>
                        {(item.isFeatured || item.promotionTier) && (
                          <span className="text-amber-500">⭐</span>
                        )}
                      </Link>
                    ))
                  )}
                  {filteredItems.length > 10 && (
                    <Link
                      href={`/items?governorate=${encodeURIComponent(selectedGovernorate || '')}&city=${encodeURIComponent(selectedCity || '')}`}
                      className="block p-4 text-center text-emerald-600 font-medium hover:bg-emerald-50 transition"
                    >
                      عرض كل الإعلانات ({filteredItems.length}) ←
                    </Link>
                  )}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <span className="text-xl">➕</span>
                </div>
                <h3 className="font-bold text-lg">أضف إعلانك</h3>
              </div>
              <p className="text-emerald-100 text-sm mb-4">
                شارك موقعك وساعد المشترين في الوصول إليك بسهولة
              </p>
              <Link
                href="/listing/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-600 rounded-xl font-medium hover:bg-gray-100 transition shadow-md"
              >
                <span>📝</span>
                إضافة إعلان جديد
              </Link>
            </div>

            {/* Map Legend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <span>ℹ️</span> دليل الخريطة
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">5</div>
                  <span>دائرة المحافظة (الرقم = عدد الإعلانات)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-500 rounded-full border-2 border-white shadow"></div>
                  <span>موقع الإعلان</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-amber-400 rounded-full border-2 border-white shadow flex items-center justify-center text-xs">⭐</div>
                  <span>إعلان مميز</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
