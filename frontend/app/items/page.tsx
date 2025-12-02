'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getItems, Item } from '@/lib/api/items';
import { getCategories, Category } from '@/lib/api/categories';
import LocationSelector, { LocationSelection } from '@/components/LocationSelector';
import { getLocationLabel, getGovernorateNameAr, getCityNameAr, getDistrictNameAr } from '@/lib/data/egyptLocations';

const CONDITIONS = {
  NEW: 'جديد',
  LIKE_NEW: 'شبه جديد',
  GOOD: 'جيد',
  FAIR: 'مقبول',
  POOR: 'مستعمل',
};

export default function ItemsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const governorateParam = searchParams.get('governorate');
  const cityParam = searchParams.get('city');
  const districtParam = searchParams.get('district');

  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState(searchQuery || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');

  // Location Filter
  const [location, setLocation] = useState<LocationSelection>({
    scope: governorateParam ? (cityParam ? (districtParam ? 'DISTRICT' : 'CITY') : 'GOVERNORATE') : 'NATIONAL',
    governorateId: governorateParam || undefined,
    cityId: cityParam || undefined,
    districtId: districtParam || undefined,
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load categories and set initial category from URL
  useEffect(() => {
    loadCategories();
  }, []);

  // Set selected category from URL slug when categories are loaded
  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      const category = categories.find(cat => cat.slug === categorySlug);
      if (category) {
        setSelectedCategory(category.id);
      }
    }
  }, [categorySlug, categories]);

  // Debounce search input (auto-search as user types)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Debounce price inputs
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  // Load items when filters change
  useEffect(() => {
    loadItems();
  }, [page, selectedCategory, selectedCondition, debouncedMinPrice, debouncedMaxPrice, debouncedSearch, location]);

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

      // Convert location IDs to Arabic names for API filtering
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

      const response = await getItems({
        page,
        limit: 12,
        categoryId: selectedCategory || undefined,
        condition: selectedCondition || undefined,
        minPrice: debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined,
        maxPrice: debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined,
        search: debouncedSearch || undefined,
        status: 'ACTIVE',
        governorate: governorateFilter,
        city: cityFilter,
        district: districtFilter,
      });

      setItems(response.data.items);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل العناصر');
    } finally {
      setLoading(false);
    }
  };

  const updateURL = (params: Record<string, string | undefined>) => {
    const urlParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value) urlParams.set(key, value);
    });
    const queryString = urlParams.toString();
    router.push(queryString ? `/items?${queryString}` : '/items');
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedCategory('');
    setSelectedCondition('');
    setMinPrice('');
    setMaxPrice('');
    setDebouncedMinPrice('');
    setDebouncedMaxPrice('');
    setLocation({ scope: 'NATIONAL' });
    setPage(1);
    router.push('/items');
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setPage(1);
    if (categoryId) {
      const category = categories.find(cat => cat.id === categoryId);
      if (category) {
        updateURL({
          category: category.slug,
          governorate: location.governorateId,
          city: location.cityId,
          district: location.districtId,
        });
      }
    } else {
      updateURL({
        governorate: location.governorateId,
        city: location.cityId,
        district: location.districtId,
      });
    }
  };

  const handleLocationChange = (newLocation: LocationSelection) => {
    setLocation(newLocation);
    setPage(1);
    const category = categories.find(cat => cat.id === selectedCategory);
    updateURL({
      category: category?.slug,
      governorate: newLocation.governorateId,
      city: newLocation.cityId,
      district: newLocation.districtId,
    });
  };

  const getCategoryName = () => {
    if (selectedCategory) {
      const category = categories.find(cat => cat.id === selectedCategory);
      return category?.nameAr || 'السوق';
    }
    return 'السوق';
  };

  const locationLabel = getLocationLabel(location.governorateId, location.cityId, location.districtId);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">{getCategoryName()}</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-emerald-100">
                  {totalItems > 0 ? `${totalItems} عنصر متاح` : 'تصفح وشراء العناصر'}
                </span>
                {location.governorateId && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                    📍 {locationLabel}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <LocationSelector
                value={location}
                onChange={handleLocationChange}
                compact
              />
              <Link
                href="/inventory/add"
                className="bg-white text-emerald-600 px-6 py-3 rounded-xl hover:bg-emerald-50 transition font-bold flex items-center gap-2 shadow-lg"
              >
                <span>➕</span>
                أضف إعلان جديد
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">🔍 الفلاتر</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  مسح الكل
                </button>
              </div>

              {/* Location Filter */}
              <div className="pb-6 border-b border-gray-100">
                <LocationSelector
                  value={location}
                  onChange={handleLocationChange}
                />
              </div>

              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  البحث
                </label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث عن العناصر..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                />
                <p className="text-xs text-gray-500 mt-1">النتائج تتحدث أثناء الكتابة</p>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الفئة
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategoryChange(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
                >
                  <option value="">جميع الفئات</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* Condition Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => {
                    setSelectedCondition(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition bg-white"
                >
                  <option value="">أي حالة</option>
                  <option value="NEW">جديد</option>
                  <option value="LIKE_NEW">شبه جديد</option>
                  <option value="GOOD">جيد</option>
                  <option value="FAIR">مقبول</option>
                  <option value="POOR">مستعمل</option>
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نطاق السعر (ج.م)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="من"
                    min="0"
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="إلى"
                    min="0"
                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Active Filters */}
              {(selectedCategory || selectedCondition || debouncedSearch || debouncedMinPrice || debouncedMaxPrice || location.governorateId) && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-2">الفلاتر النشطة:</p>
                  <div className="flex flex-wrap gap-2">
                    {location.governorateId && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        📍 {locationLabel}
                        <button onClick={() => handleLocationChange({ scope: 'NATIONAL' })} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                    {selectedCategory && (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {categories.find(c => c.id === selectedCategory)?.nameAr}
                        <button onClick={() => handleCategoryChange('')} className="hover:text-emerald-900">×</button>
                      </span>
                    )}
                    {selectedCondition && (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        {CONDITIONS[selectedCondition as keyof typeof CONDITIONS]}
                        <button onClick={() => setSelectedCondition('')} className="hover:text-emerald-900">×</button>
                      </span>
                    )}
                    {debouncedSearch && (
                      <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                        "{debouncedSearch}"
                        <button onClick={() => { setSearch(''); setDebouncedSearch(''); }} className="hover:text-emerald-900">×</button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Items Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-16">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                <p className="mt-4 text-gray-600">جاري تحميل العناصر...</p>
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <p className="text-red-600 text-lg">{error}</p>
                <button
                  onClick={loadItems}
                  className="mt-4 text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  حاول مرة أخرى
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">📦</div>
                <p className="text-gray-600 text-xl font-medium">لا توجد عناصر</p>
                <p className="text-gray-500 mt-2">
                  {location.governorateId
                    ? `لا توجد عناصر في ${locationLabel}. جرب توسيع نطاق البحث.`
                    : 'جرب تعديل الفلاتر أو البحث عن شيء آخر'}
                </p>
                <button
                  onClick={clearFilters}
                  className="mt-6 bg-emerald-500 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition font-medium"
                >
                  عرض جميع العناصر في كل مصر
                </button>
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-4 flex justify-between items-center">
                  <p className="text-gray-600">
                    عرض {items.length} من {totalItems} عنصر
                    {location.governorateId && <span className="text-emerald-600"> في {locationLabel}</span>}
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {items.map((item) => (
                    <Link
                      key={item.id}
                      href={`/items/${item.id}`}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden group"
                    >
                      {/* Image */}
                      <div className="relative h-52 bg-gray-100">
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images.find((img) => img.isPrimary)?.url || item.images[0]?.url}
                            alt={item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-5xl">📦</span>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-700">
                          {CONDITIONS[item.condition as keyof typeof CONDITIONS] || item.condition}
                        </div>
                        {item.governorate && (
                          <div className="absolute top-3 left-3 bg-blue-500/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs text-white">
                            📍 {item.governorate}
                          </div>
                        )}
                        {item.images && item.images.length > 1 && (
                          <div className="absolute bottom-3 left-3 bg-black/50 backdrop-blur-sm px-2 py-1 rounded text-xs text-white">
                            📷 {item.images.length}
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 line-clamp-1 group-hover:text-emerald-600 transition text-lg">
                          {item.title}
                        </h3>
                        <p className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {item.description}
                        </p>

                        <div className="mt-4 flex items-center justify-between">
                          <div>
                            {item.estimatedValue ? (
                              <p className="text-xl font-bold text-emerald-600">
                                {item.estimatedValue.toLocaleString('ar-EG')} ج.م
                              </p>
                            ) : (
                              <p className="text-sm text-gray-500">اتصل للسعر</p>
                            )}
                          </div>
                          {item.category && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                              {item.category.nameAr}
                            </span>
                          )}
                        </div>

                        <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-gray-500">
                            <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-xs font-bold">
                              {item.seller.fullName?.charAt(0).toUpperCase() || 'م'}
                            </div>
                            <span className="truncate max-w-[100px]">{item.seller.fullName}</span>
                          </div>
                          <span className="text-emerald-600 font-bold group-hover:translate-x-[-4px] transition-transform">
                            عرض التفاصيل ←
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
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
                                ? 'bg-emerald-500 text-white'
                                : 'border border-gray-200 hover:bg-gray-50'
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
                      className="px-5 py-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
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
