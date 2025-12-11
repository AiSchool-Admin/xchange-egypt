'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getItems, Item } from '@/lib/api/items';

// Property types
const PROPERTY_TYPES = [
  { value: '', label: 'كل الأنواع' },
  { value: 'APARTMENT', label: 'شقة' },
  { value: 'VILLA', label: 'فيلا' },
  { value: 'DUPLEX', label: 'دوبلكس' },
  { value: 'PENTHOUSE', label: 'بنتهاوس' },
  { value: 'STUDIO', label: 'ستوديو' },
  { value: 'CHALET', label: 'شاليه' },
  { value: 'TOWNHOUSE', label: 'تاون هاوس' },
  { value: 'LAND', label: 'أرض' },
  { value: 'COMMERCIAL_SHOP', label: 'محل تجاري' },
  { value: 'OFFICE', label: 'مكتب' },
  { value: 'WAREHOUSE', label: 'مخزن' },
  { value: 'BUILDING', label: 'عمارة' },
];

// Property finishing
const PROPERTY_FINISHINGS = [
  { value: '', label: 'كل التشطيبات' },
  { value: 'NOT_FINISHED', label: 'بدون تشطيب' },
  { value: 'SEMI_FINISHED', label: 'نصف تشطيب' },
  { value: 'FULLY_FINISHED', label: 'تشطيب كامل' },
  { value: 'SUPER_LUX', label: 'سوبر لوكس' },
  { value: 'ULTRA_SUPER_LUX', label: 'الترا سوبر لوكس' },
  { value: 'FURNISHED', label: 'مفروش' },
];

// Property views
const PROPERTY_VIEWS = [
  { value: '', label: 'كل الإطلالات' },
  { value: 'STREET', label: 'شارع' },
  { value: 'GARDEN', label: 'حديقة' },
  { value: 'SEA', label: 'بحر' },
  { value: 'NILE', label: 'نيل' },
  { value: 'POOL', label: 'حمام سباحة' },
  { value: 'CITY', label: 'مدينة' },
  { value: 'CORNER', label: 'ناصية' },
  { value: 'MAIN_ROAD', label: 'طريق رئيسي' },
];

// Listing types
const LISTING_TYPES = [
  { value: '', label: 'الكل' },
  { value: 'FOR_SALE', label: 'للبيع' },
  { value: 'FOR_RENT', label: 'للإيجار' },
  { value: 'FOR_EXCHANGE', label: 'للمقايضة' },
];

// Room counts
const ROOM_COUNTS = [
  { value: '', label: 'أي عدد' },
  { value: '1', label: '1 غرفة' },
  { value: '2', label: '2 غرفة' },
  { value: '3', label: '3 غرف' },
  { value: '4', label: '4 غرف' },
  { value: '5', label: '5+ غرف' },
];

export default function RealEstatePage() {
  const [properties, setProperties] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [propertyType, setPropertyType] = useState('');
  const [listingType, setListingType] = useState('');
  const [finishing, setFinishing] = useState('');
  const [view, setView] = useState('');
  const [rooms, setRooms] = useState('');
  const [minArea, setMinArea] = useState('');
  const [maxArea, setMaxArea] = useState('');
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
    'قنا', 'شمال سيناء', 'سوهاج', 'الساحل الشمالي', 'العين السخنة', '6 أكتوبر',
    'الشيخ زايد', 'التجمع الخامس', 'المعادي', 'مدينتي', 'الرحاب'
  ];

  useEffect(() => {
    loadProperties();
  }, [page, propertyType, listingType, finishing, view, rooms, minArea, maxArea, minPrice, maxPrice, searchQuery, governorate, sortBy]);

  const loadProperties = async () => {
    try {
      setLoading(true);
      // Search for properties using category or keywords
      const response = await getItems({
        page,
        limit: 12,
        search: searchQuery || 'عقار شقة فيلا',
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        governorate: governorate || undefined,
      });

      let items = response.data?.items || [];

      // Filter by property fields if available
      if (propertyType) {
        items = items.filter((item: any) =>
          item.propertyType === propertyType
        );
      }

      if (listingType) {
        items = items.filter((item: any) =>
          item.propertyListingType === listingType
        );
      }

      if (finishing) {
        items = items.filter((item: any) =>
          item.propertyFinishing === finishing
        );
      }

      if (view) {
        items = items.filter((item: any) =>
          item.propertyView === view
        );
      }

      if (rooms) {
        const roomCount = parseInt(rooms);
        items = items.filter((item: any) => {
          if (roomCount === 5) return item.propertyRooms >= 5;
          return item.propertyRooms === roomCount;
        });
      }

      if (minArea) {
        items = items.filter((item: any) =>
          item.propertyArea && item.propertyArea >= parseInt(minArea)
        );
      }

      if (maxArea) {
        items = items.filter((item: any) =>
          item.propertyArea && item.propertyArea <= parseInt(maxArea)
        );
      }

      // Sort
      if (sortBy === 'price_asc') {
        items.sort((a: any, b: any) => (a.estimatedValue || 0) - (b.estimatedValue || 0));
      } else if (sortBy === 'price_desc') {
        items.sort((a: any, b: any) => (b.estimatedValue || 0) - (a.estimatedValue || 0));
      } else if (sortBy === 'area_asc') {
        items.sort((a: any, b: any) => (a.propertyArea || 0) - (b.propertyArea || 0));
      } else if (sortBy === 'area_desc') {
        items.sort((a: any, b: any) => (b.propertyArea || 0) - (a.propertyArea || 0));
      }

      setProperties(items);
      setTotalPages(response.data?.pagination?.totalPages || 1);
      setTotalCount(response.data?.pagination?.total || items.length);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل العقارات');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setPropertyType('');
    setListingType('');
    setFinishing('');
    setView('');
    setRooms('');
    setMinArea('');
    setMaxArea('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setGovernorate('');
    setPage(1);
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون`;
    }
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const getPropertyTypeLabel = (type: string) => {
    return PROPERTY_TYPES.find(t => t.value === type)?.label || type;
  };

  const getFinishingLabel = (type: string) => {
    return PROPERTY_FINISHINGS.find(t => t.value === type)?.label || type;
  };

  const getListingTypeColor = (type: string) => {
    switch (type) {
      case 'FOR_SALE': return 'bg-green-500';
      case 'FOR_RENT': return 'bg-blue-500';
      case 'FOR_EXCHANGE': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const getListingTypeLabel = (type: string) => {
    switch (type) {
      case 'FOR_SALE': return 'للبيع';
      case 'FOR_RENT': return 'للإيجار';
      case 'FOR_EXCHANGE': return 'للمقايضة';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <span className="text-4xl">🏠</span>
                سوق العقارات
              </h1>
              <p className="text-emerald-100 mt-2">
                اعثر على عقارك المثالي - {totalCount} عقار متاح
              </p>
            </div>
            <Link
              href="/items/new?category=real-estate"
              className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-bold hover:bg-emerald-50 transition-all shadow-lg"
            >
              + أضف عقارك
            </Link>
          </div>

          {/* Quick Filters */}
          <div className="flex flex-wrap gap-2 mt-6">
            {LISTING_TYPES.slice(1).map((type) => (
              <button
                key={type.value}
                onClick={() => setListingType(listingType === type.value ? '' : type.value)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  listingType === type.value
                    ? 'bg-white text-emerald-600'
                    : 'bg-emerald-500/30 text-white hover:bg-emerald-500/50'
                }`}
              >
                {type.label}
              </button>
            ))}
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
                  className="text-sm text-emerald-600 hover:text-emerald-800"
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
                  placeholder="ابحث عن عقار..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Property Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع العقار
                </label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              {/* Finishing */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  التشطيب
                </label>
                <select
                  value={finishing}
                  onChange={(e) => setFinishing(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {PROPERTY_FINISHINGS.map((f) => (
                    <option key={f.value} value={f.value}>{f.label}</option>
                  ))}
                </select>
              </div>

              {/* Rooms */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عدد الغرف
                </label>
                <select
                  value={rooms}
                  onChange={(e) => setRooms(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {ROOM_COUNTS.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>

              {/* Area Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المساحة (م²)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minArea}
                    onChange={(e) => setMinArea(e.target.value)}
                    placeholder="من"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="number"
                    value={maxArea}
                    onChange={(e) => setMaxArea(e.target.value)}
                    placeholder="إلى"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* View */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الإطلالة
                </label>
                <select
                  value={view}
                  onChange={(e) => setView(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  {PROPERTY_VIEWS.map((v) => (
                    <option key={v.value} value={v.value}>{v.label}</option>
                  ))}
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
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="إلى"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  />
                </div>
              </div>

              {/* Governorate */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المنطقة
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="">كل المناطق</option>
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
                عرض <span className="font-bold text-gray-900">{properties.length}</span> عقار
              </p>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">ترتيب حسب:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                >
                  <option value="newest">الأحدث</option>
                  <option value="price_asc">السعر: من الأقل للأعلى</option>
                  <option value="price_desc">السعر: من الأعلى للأقل</option>
                  <option value="area_asc">المساحة: من الأصغر للأكبر</option>
                  <option value="area_desc">المساحة: من الأكبر للأصغر</option>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            ) : properties.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🏠</div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد عقارات</h3>
                <p className="text-gray-600 mb-6">جرب تغيير معايير البحث</p>
                <button
                  onClick={clearFilters}
                  className="text-emerald-600 hover:text-emerald-800 font-medium"
                >
                  مسح جميع الفلاتر
                </button>
              </div>
            ) : (
              <>
                {/* Properties Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {properties.map((property) => (
                    <Link
                      key={property.id}
                      href={`/items/${property.id}`}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all group"
                    >
                      <div className="relative h-48">
                        {property.images && property.images.length > 0 ? (
                          <img
                            src={property.images[0].url}
                            alt={property.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-emerald-100 to-teal-100 flex items-center justify-center">
                            <span className="text-6xl">🏠</span>
                          </div>
                        )}
                        {(property as any).propertyListingType && (
                          <div className={`absolute top-3 right-3 ${getListingTypeColor((property as any).propertyListingType)} text-white px-3 py-1 rounded-lg text-sm font-bold`}>
                            {getListingTypeLabel((property as any).propertyListingType)}
                          </div>
                        )}
                        {(property as any).propertyType && (
                          <div className="absolute bottom-3 right-3 bg-black/60 text-white px-2 py-1 rounded text-xs">
                            {getPropertyTypeLabel((property as any).propertyType)}
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-emerald-600 transition-colors">
                          {property.title}
                        </h3>

                        {/* Property Details */}
                        <div className="flex flex-wrap gap-3 mb-3 text-sm text-gray-600">
                          {(property as any).propertyArea && (
                            <span className="flex items-center gap-1">
                              <span>📐</span>
                              {(property as any).propertyArea} م²
                            </span>
                          )}
                          {(property as any).propertyRooms && (
                            <span className="flex items-center gap-1">
                              <span>🛏️</span>
                              {(property as any).propertyRooms} غرف
                            </span>
                          )}
                          {(property as any).propertyBathrooms && (
                            <span className="flex items-center gap-1">
                              <span>🚿</span>
                              {(property as any).propertyBathrooms} حمام
                            </span>
                          )}
                        </div>

                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          {(property as any).propertyFinishing && (
                            <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-xs">
                              {getFinishingLabel((property as any).propertyFinishing)}
                            </span>
                          )}
                          {(property as any).propertyFloor && (
                            <span className="bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs">
                              الدور {(property as any).propertyFloor}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <p className="text-xl font-bold text-emerald-600">
                            {property.estimatedValue ? `${formatPrice(property.estimatedValue)} ج.م` : 'اتصل للسعر'}
                          </p>
                          <span className="text-xs text-gray-500">
                            📍 {property.governorate || property.location}
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
                    <span className="px-4 py-2 bg-emerald-600 text-white rounded-lg">
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
