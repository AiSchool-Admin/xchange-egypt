'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getItems, Item } from '@/lib/api/items';

// Vehicle brands
const VEHICLE_BRANDS = [
  { value: '', label: 'كل الماركات' },
  { value: 'Toyota', label: 'تويوتا' },
  { value: 'Honda', label: 'هوندا' },
  { value: 'Nissan', label: 'نيسان' },
  { value: 'Hyundai', label: 'هيونداي' },
  { value: 'Kia', label: 'كيا' },
  { value: 'BMW', label: 'بي إم دبليو' },
  { value: 'Mercedes', label: 'مرسيدس' },
  { value: 'Chevrolet', label: 'شيفروليه' },
  { value: 'Ford', label: 'فورد' },
  { value: 'Volkswagen', label: 'فولكس فاجن' },
  { value: 'Audi', label: 'أودي' },
  { value: 'Peugeot', label: 'بيجو' },
  { value: 'Renault', label: 'رينو' },
  { value: 'Fiat', label: 'فيات' },
  { value: 'Suzuki', label: 'سوزوكي' },
  { value: 'Mitsubishi', label: 'ميتسوبيشي' },
  { value: 'MG', label: 'إم جي' },
  { value: 'Chery', label: 'شيري' },
  { value: 'BYD', label: 'بي واي دي' },
  { value: 'Geely', label: 'جيلي' },
  { value: 'Other', label: 'أخرى' },
];

// Vehicle conditions
const VEHICLE_CONDITIONS = [
  { value: '', label: 'كل الحالات' },
  { value: 'NEW', label: 'جديدة (زيرو)' },
  { value: 'USED', label: 'مستعملة' },
  { value: 'ACCIDENT_FREE', label: 'بدون حوادث' },
  { value: 'MINOR_ACCIDENT', label: 'حادث بسيط' },
];

// Year options
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [brand, setBrand] = useState('');
  const [yearFrom, setYearFrom] = useState('');
  const [yearTo, setYearTo] = useState('');
  const [condition, setCondition] = useState('');
  const [maxKilometers, setMaxKilometers] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [governorate, setGovernorate] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Sort
  const [sortBy, setSortBy] = useState('newest');

  const governorates = [
    'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
    'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
    'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
    'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
    'قنا', 'شمال سيناء', 'سوهاج'
  ];

  useEffect(() => {
    loadVehicles();
  }, [page, brand, yearFrom, yearTo, condition, maxKilometers, minPrice, maxPrice, searchQuery, governorate, sortBy]);

  const loadVehicles = async () => {
    try {
      setLoading(true);
      // Search for vehicles using category or keywords
      const response = await getItems({
        page,
        limit: 12,
        search: searchQuery || 'سيارة',
        categoryId: undefined, // We'll filter by vehicle-related categories
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        governorate: governorate || undefined,
      });

      let items = response.data?.items || [];

      // Filter by vehicle fields if available
      if (brand) {
        items = items.filter((item: any) =>
          item.vehicleBrand?.toLowerCase().includes(brand.toLowerCase()) ||
          item.titleAr?.includes(brand) ||
          item.titleEn?.toLowerCase().includes(brand.toLowerCase())
        );
      }

      if (yearFrom) {
        items = items.filter((item: any) =>
          item.vehicleYear && item.vehicleYear >= parseInt(yearFrom)
        );
      }

      if (yearTo) {
        items = items.filter((item: any) =>
          item.vehicleYear && item.vehicleYear <= parseInt(yearTo)
        );
      }

      if (maxKilometers) {
        items = items.filter((item: any) =>
          item.vehicleKilometers && item.vehicleKilometers <= parseInt(maxKilometers)
        );
      }

      if (condition) {
        items = items.filter((item: any) =>
          item.vehicleConditionType === condition
        );
      }

      // Sort
      if (sortBy === 'price_asc') {
        items.sort((a: any, b: any) => (a.estimatedValue || 0) - (b.estimatedValue || 0));
      } else if (sortBy === 'price_desc') {
        items.sort((a: any, b: any) => (b.estimatedValue || 0) - (a.estimatedValue || 0));
      } else if (sortBy === 'km_asc') {
        items.sort((a: any, b: any) => (a.vehicleKilometers || 0) - (b.vehicleKilometers || 0));
      } else if (sortBy === 'year_desc') {
        items.sort((a: any, b: any) => (b.vehicleYear || 0) - (a.vehicleYear || 0));
      }

      setVehicles(items);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setTotalCount(response.data?.pagination?.total || items.length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل السيارات');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setBrand('');
    setYearFrom('');
    setYearTo('');
    setCondition('');
    setMaxKilometers('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setGovernorate('');
    setPage(1);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const formatKilometers = (km: number) => {
    if (km >= 1000) {
      return `${(km / 1000).toFixed(0)} ألف كم`;
    }
    return `${km} كم`;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <span className="text-4xl">🚗</span>
                سوق السيارات
              </h1>
              <p className="text-blue-100 mt-2">
                اعثر على سيارتك المثالية - {totalCount} سيارة متاحة
              </p>
            </div>
            <Link
              href="/items/new?category=vehicles"
              className="bg-white text-blue-600 px-6 py-3 rounded-xl font-bold hover:bg-blue-50 transition-all shadow-lg"
            >
              + أضف سيارتك
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Filters Sidebar */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold text-gray-800">فلترة البحث</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  مسح الكل
                </button>
              </div>

              {/* Search */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  بحث
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن سيارة..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Brand */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الماركة
                </label>
                <select
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {VEHICLE_BRANDS.map((b) => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                  ))}
                </select>
              </div>

              {/* Year Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سنة الصنع
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={yearFrom}
                    onChange={(e) => setYearFrom(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">من</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                  <select
                    value={yearTo}
                    onChange={(e) => setYearTo(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  >
                    <option value="">إلى</option>
                    {YEARS.map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Condition */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  حالة السيارة
                </label>
                <select
                  value={condition}
                  onChange={(e) => setCondition(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {VEHICLE_CONDITIONS.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>

              {/* Max Kilometers */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحد الأقصى للكيلومترات
                </label>
                <select
                  value={maxKilometers}
                  onChange={(e) => setMaxKilometers(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">بدون حد</option>
                  <option value="10000">10,000 كم</option>
                  <option value="30000">30,000 كم</option>
                  <option value="50000">50,000 كم</option>
                  <option value="100000">100,000 كم</option>
                  <option value="150000">150,000 كم</option>
                  <option value="200000">200,000 كم</option>
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر (جنيه)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="من"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="إلى"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Governorate */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحافظة
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">كل المحافظات</option>
                  {governorates.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Sort Bar */}
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <p className="text-gray-600">
                عرض <span className="font-bold text-gray-900">{vehicles.length}</span> سيارة
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">ترتيب حسب:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                >
                  <option value="newest">الأحدث</option>
                  <option value="price_asc">السعر: من الأقل للأعلى</option>
                  <option value="price_desc">السعر: من الأعلى للأقل</option>
                  <option value="km_asc">الكيلومترات: الأقل</option>
                  <option value="year_desc">السنة: الأحدث</option>
                </select>
              </div>
            </div>

            {/* Error State */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-600">{error}</p>
              </div>
            )}

            {/* Loading State */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4">
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : vehicles.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🚗</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد سيارات</h3>
                <p className="text-gray-600 mb-6">جرب تغيير معايير البحث</p>
                <button
                  onClick={clearFilters}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  مسح جميع الفلاتر
                </button>
              </div>
            ) : (
              <>
                {/* Vehicles Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {vehicles.map((vehicle) => (
                    <Link
                      key={vehicle.id}
                      href={`/items/${vehicle.id}`}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
                    >
                      <div className="relative h-48">
                        {vehicle.imageUrls && vehicle.imageUrls.length > 0 ? (
                          <img
                            src={vehicle.imageUrls[0]}
                            alt={vehicle.titleAr}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                            <span className="text-6xl">🚗</span>
                          </div>
                        )}
                        {(vehicle as any).vehicleYear && (
                          <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-1 rounded-lg text-sm font-bold">
                            {(vehicle as any).vehicleYear}
                          </div>
                        )}
                        {(vehicle as any).vehicleConditionType === 'NEW' && (
                          <div className="absolute top-3 left-3 bg-green-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
                            زيرو
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                          {vehicle.titleAr}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(vehicle as any).vehicleBrand && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {(vehicle as any).vehicleBrand}
                            </span>
                          )}
                          {(vehicle as any).vehicleKilometers && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              {formatKilometers((vehicle as any).vehicleKilometers)}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-blue-600">
                            {vehicle.estimatedValue ? `${formatPrice(vehicle.estimatedValue)} ج.م` : 'اتصل للسعر'}
                          </p>
                          <span className="text-xs text-gray-500">
                            {vehicle.governorate}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    <button
                      onClick={() => setPage(Math.max(1, page - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>
                    <span className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                      {page} / {totalPages}
                    </span>
                    <button
                      onClick={() => setPage(Math.min(totalPages, page + 1))}
                      disabled={page === totalPages}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
