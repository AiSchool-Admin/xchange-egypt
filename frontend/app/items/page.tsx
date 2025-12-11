'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getItems, Item } from '@/lib/api/items';
import { getCategoryTree, Category } from '@/lib/api/categories';

// Extended Category type with children
interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}
import LocationSelector, { LocationSelection } from '@/components/LocationSelector';
import { getLocationLabel, getGovernorateNameAr, getCityNameAr, getDistrictNameAr } from '@/lib/data/egyptLocations';
import ItemCard, { ItemCardSkeleton } from '@/components/ui/ItemCard';
import { useAuth } from '@/lib/contexts/AuthContext';

// ============================================
// Constants
// ============================================
const CONDITIONS = [
  { value: 'NEW', label: 'جديد', icon: '✨' },
  { value: 'LIKE_NEW', label: 'شبه جديد', icon: '🌟' },
  { value: 'GOOD', label: 'جيد', icon: '👍' },
  { value: 'FAIR', label: 'مقبول', icon: '👌' },
  { value: 'POOR', label: 'مستعمل', icon: '📦' },
];

const LISTING_TYPES = [
  { value: '', label: 'الكل', icon: '🛒' },
  { value: 'DIRECT_SALE', label: 'بيع مباشر', icon: '🏷️' },
  { value: 'AUCTION', label: 'مزاد', icon: '🔨' },
  { value: 'BARTER', label: 'مقايضة', icon: '🔄' },
  { value: 'DIRECT_BUY', label: 'مطلوب للشراء', icon: '🔍' },
  { value: 'REVERSE_AUCTION', label: 'مناقصات', icon: '📢' },
];

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'الأحدث' },
  { value: 'createdAt:asc', label: 'الأقدم' },
  { value: 'estimatedValue:asc', label: 'السعر: الأقل' },
  { value: 'estimatedValue:desc', label: 'السعر: الأعلى' },
];

// ============================================
// Main Component
// ============================================
export default function ItemsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();

  // URL params
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const governorateParam = searchParams.get('governorate');
  const cityParam = searchParams.get('city');
  const districtParam = searchParams.get('district');
  const userParam = searchParams.get('user');

  // Check if viewing own items
  const isMyItems = userParam === 'me';

  // State
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters - Hierarchical categories
  const [search, setSearch] = useState(searchQuery || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery || '');
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedListingType, setSelectedListingType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:desc');

  // Location
  const [location, setLocation] = useState<LocationSelection>({
    scope: governorateParam ? (cityParam ? (districtParam ? 'DISTRICT' : 'CITY') : 'GOVERNORATE') : 'NATIONAL',
    governorateId: governorateParam || undefined,
    cityId: cityParam || undefined,
    districtId: districtParam || undefined,
  });

  // View
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Set category from URL (find in tree)
  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      // Search in hierarchy
      for (const mainCat of categories) {
        if (mainCat.slug === categorySlug) {
          setSelectedMainCategory(mainCat.id);
          return;
        }
        if (mainCat.children) {
          for (const subCat of mainCat.children) {
            if (subCat.slug === categorySlug) {
              setSelectedMainCategory(mainCat.id);
              setSelectedSubCategory(subCat.id);
              return;
            }
            if (subCat.children) {
              for (const subSubCat of subCat.children) {
                if (subSubCat.slug === categorySlug) {
                  setSelectedMainCategory(mainCat.id);
                  setSelectedSubCategory(subCat.id);
                  setSelectedSubSubCategory(subSubCat.id);
                  return;
                }
              }
            }
          }
        }
      }
    }
  }, [categorySlug, categories]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Debounce price
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  // Get the most specific selected category ID
  const selectedCategoryId = selectedSubSubCategory || selectedSubCategory || selectedMainCategory;

  // Load items when filters change
  useEffect(() => {
    // For "my items", wait for user to be loaded
    if (isMyItems && !currentUser) return;
    loadItems();
  }, [page, selectedMainCategory, selectedSubCategory, selectedSubSubCategory, selectedCondition, selectedListingType, debouncedMinPrice, debouncedMaxPrice, debouncedSearch, location, sortBy, isMyItems, currentUser]);

  const loadCategories = async () => {
    try {
      const response = await getCategoryTree();
      setCategories(response.data as CategoryWithChildren[]);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

  // Get subcategories for selected main category
  const getSubCategories = (): CategoryWithChildren[] => {
    if (!selectedMainCategory) return [];
    const mainCat = categories.find(c => c.id === selectedMainCategory);
    return mainCat?.children || [];
  };

  // Get sub-subcategories for selected subcategory
  const getSubSubCategories = (): CategoryWithChildren[] => {
    if (!selectedSubCategory) return [];
    const subCats = getSubCategories();
    const subCat = subCats.find(c => c.id === selectedSubCategory);
    return subCat?.children || [];
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');

      // Build location filters
      let governorateFilter: string | undefined;
      let cityFilter: string | undefined;
      let districtFilter: string | undefined;

      if (location.governorateId) {
        governorateFilter = getGovernorateNameAr(location.governorateId);
        if (location.cityId) {
          cityFilter = getCityNameAr(location.governorateId, location.cityId);
          if (location.districtId) {
            districtFilter = getDistrictNameAr(location.governorateId, location.cityId, location.districtId);
          }
        }
      }

      // Parse sort
      const [sortField, sortOrder] = sortBy.split(':');

      const response = await getItems({
        page,
        limit: 12,
        categoryId: selectedCategoryId || undefined,
        condition: selectedCondition || undefined,
        listingType: selectedListingType || undefined,
        minPrice: debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined,
        maxPrice: debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined,
        search: debouncedSearch || undefined,
        status: isMyItems ? undefined : 'ACTIVE', // Show all statuses for own items
        sellerId: isMyItems && currentUser ? currentUser.id : undefined,
        governorate: governorateFilter,
        city: cityFilter,
        district: districtFilter,
        sortBy: sortField,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      // Filter out current user's items when browsing marketplace (not own items view)
      let filteredItems = response.data.items;
      if (!isMyItems && currentUser) {
        filteredItems = response.data.items.filter((item: Item) => item.seller?.id !== currentUser.id);
      }

      setItems(filteredItems);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(isMyItems || !currentUser ? response.data.pagination.total : filteredItems.length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedMainCategory('');
    setSelectedSubCategory('');
    setSelectedSubSubCategory('');
    setSelectedCondition('');
    setSelectedListingType('');
    setMinPrice('');
    setMaxPrice('');
    setDebouncedMinPrice('');
    setDebouncedMaxPrice('');
    setLocation({ scope: 'NATIONAL' });
    setSortBy('createdAt:desc');
    setPage(1);
    router.push('/items');
  };

  const handleLocationChange = (newLocation: LocationSelection) => {
    setLocation(newLocation);
    setPage(1);
  };

  // Handle main category change - reset subcategories
  const handleMainCategoryChange = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory('');
    setSelectedSubSubCategory('');
    setPage(1);
  };

  // Handle subcategory change - reset sub-subcategory
  const handleSubCategoryChange = (categoryId: string) => {
    setSelectedSubCategory(categoryId);
    setSelectedSubSubCategory('');
    setPage(1);
  };

  // Handle sub-subcategory change
  const handleSubSubCategoryChange = (categoryId: string) => {
    setSelectedSubSubCategory(categoryId);
    setPage(1);
  };

  const getCategoryName = () => {
    if (isMyItems) {
      return '📦 منتجاتي';
    }
    // Get the most specific selected category name
    if (selectedSubSubCategory) {
      const subSubCats = getSubSubCategories();
      const cat = subSubCats.find(c => c.id === selectedSubSubCategory);
      return cat?.nameAr || 'السوق';
    }
    if (selectedSubCategory) {
      const subCats = getSubCategories();
      const cat = subCats.find(c => c.id === selectedSubCategory);
      return cat?.nameAr || 'السوق';
    }
    if (selectedMainCategory) {
      const cat = categories.find(c => c.id === selectedMainCategory);
      return cat?.nameAr || 'السوق';
    }
    return 'السوق';
  };

  const locationLabel = getLocationLabel(location.governorateId, location.cityId, location.districtId);

  const hasActiveFilters = selectedMainCategory || selectedCondition || selectedListingType || debouncedSearch || debouncedMinPrice || debouncedMaxPrice || location.governorateId;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* ============================================
          Header
          ============================================ */}
      <div className="bg-gradient-to-l from-primary-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{getCategoryName()}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-primary-100">
                  {totalItems > 0 ? `${totalItems.toLocaleString('ar-EG')} منتج متاح` : 'تصفح المنتجات'}
                </span>
                {location.governorateId && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    📍 {locationLabel}
                  </span>
                )}
              </div>
            </div>
            <Link
              href="/inventory/add"
              className="bg-white text-primary-600 px-6 py-3 rounded-xl hover:bg-primary-50 transition font-bold flex items-center gap-2 shadow-lg"
            >
              <span>➕</span>
              أضف إعلان جديد
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* ============================================
            Top Bar - Search & Sort
            ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="ابحث عن المنتجات..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-primary-500 transition-all outline-none placeholder-gray-500 text-gray-900"
              />
              <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            {/* Filter Toggle - Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-xl font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              الفلاتر
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none font-medium min-w-[150px] text-gray-900 cursor-pointer"
            >
              {SORT_OPTIONS.map(option => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="hidden md:flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ============================================
              Filters Sidebar
              ============================================ */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">🔍 الفلاتر</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    مسح الكل
                  </button>
                )}
              </div>

              {/* Location */}
              <div className="pb-6 border-b border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">📍 الموقع</label>
                <LocationSelector
                  value={location}
                  onChange={handleLocationChange}
                />
              </div>

              {/* Category - Hierarchical */}
              <div className="pb-6 border-b border-gray-100 space-y-3">
                <label className="block text-sm font-semibold text-gray-700">📂 الفئة</label>

                {/* Main Category */}
                <select
                  value={selectedMainCategory}
                  onChange={(e) => handleMainCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                >
                  <option value="">جميع الفئات الرئيسية</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                  ))}
                </select>

                {/* Subcategory - shown when main category selected */}
                {selectedMainCategory && getSubCategories().length > 0 && (
                  <select
                    value={selectedSubCategory}
                    onChange={(e) => handleSubCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  >
                    <option value="">جميع الفئات الفرعية</option>
                    {getSubCategories().map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                    ))}
                  </select>
                )}

                {/* Sub-subcategory - shown when subcategory selected */}
                {selectedSubCategory && getSubSubCategories().length > 0 && (
                  <select
                    value={selectedSubSubCategory}
                    onChange={(e) => handleSubSubCategoryChange(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  >
                    <option value="">جميع الفئات الفرعية-فرعية</option>
                    {getSubSubCategories().map((cat) => (
                      <option key={cat.id} value={cat.id}>{cat.nameAr}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Listing Type */}
              <div className="pb-6 border-b border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">🏷️ نوع الإعلان</label>
                <div className="flex flex-wrap gap-2">
                  {LISTING_TYPES.map(type => (
                    <button
                      key={type.value}
                      onClick={() => { setSelectedListingType(type.value); setPage(1); }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedListingType === type.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type.icon} {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="pb-6 border-b border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">📊 الحالة</label>
                <div className="space-y-2">
                  {CONDITIONS.map(cond => (
                    <label key={cond.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="condition"
                        value={cond.value}
                        checked={selectedCondition === cond.value}
                        onChange={(e) => { setSelectedCondition(e.target.value); setPage(1); }}
                        className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 group-hover:text-primary-600 transition-colors">
                        {cond.icon} {cond.label}
                      </span>
                    </label>
                  ))}
                  {selectedCondition && (
                    <button
                      onClick={() => { setSelectedCondition(''); setPage(1); }}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      مسح الاختيار
                    </button>
                  )}
                </div>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">💰 السعر (ج.م)</label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="من"
                    min="0"
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="إلى"
                    min="0"
                    className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">الفلاتر النشطة:</p>
                  <div className="flex flex-wrap gap-2">
                    {location.governorateId && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        📍 {locationLabel}
                        <button onClick={() => handleLocationChange({ scope: 'NATIONAL' })} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                    {selectedMainCategory && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {getCategoryName()}
                        <button onClick={() => { setSelectedMainCategory(''); setSelectedSubCategory(''); setSelectedSubSubCategory(''); }} className="hover:text-primary-900">×</button>
                      </span>
                    )}
                    {selectedCondition && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {CONDITIONS.find(c => c.value === selectedCondition)?.label}
                        <button onClick={() => setSelectedCondition('')} className="hover:text-primary-900">×</button>
                      </span>
                    )}
                    {selectedListingType && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                        {LISTING_TYPES.find(t => t.value === selectedListingType)?.label}
                        <button onClick={() => setSelectedListingType('')} className="hover:text-amber-900">×</button>
                      </span>
                    )}
                    {debouncedSearch && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        "{debouncedSearch}"
                        <button onClick={() => { setSearch(''); setDebouncedSearch(''); }} className="hover:text-gray-900">×</button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================
              Items Grid
              ============================================ */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ItemCardSkeleton key={i} variant={viewMode === 'list' ? 'horizontal' : 'default'} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-red-600 text-lg mb-4">{error}</p>
                <button
                  onClick={loadItems}
                  className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                  حاول مرة أخرى
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد منتجات</h3>
                <p className="text-gray-500 mb-6">
                  {hasActiveFilters
                    ? 'جرب تعديل الفلاتر أو البحث عن شيء آخر'
                    : 'كن أول من يضيف منتج!'}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                  >
                    مسح الفلاتر
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
                  <span>
                    عرض {items.length} من {totalItems.toLocaleString('ar-EG')} منتج
                  </span>
                </div>

                {/* Items */}
                <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {items.map((item) => (
                    <ItemCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      price={item.estimatedValue || 0}
                      images={item.images?.map(img => img.url) || []}
                      condition={item.condition}
                      governorate={item.governorate}
                      listingType={item.listingType as any}
                      category={item.category?.nameAr}
                      seller={item.seller ? { id: item.seller.id, name: item.seller.fullName || '' } : undefined}
                      createdAt={item.createdAt}
                      variant={viewMode === 'list' ? 'horizontal' : 'default'}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                    >
                      السابق
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-xl font-medium transition ${
                              page === pageNum
                                ? 'bg-primary-500 text-white'
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
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
                      className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
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
