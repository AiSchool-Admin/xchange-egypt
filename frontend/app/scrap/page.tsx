'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getScrapItems,
  getMetalPrices,
  getMarketStats,
  SCRAP_TYPE_AR,
  SCRAP_CONDITION_AR,
  METAL_TYPE_AR,
  SCRAP_PRICING_AR,
  ScrapType,
  ScrapCondition,
  MetalType,
  ScrapPricingType,
} from '@/lib/api/scrap-marketplace';

// Category icons
const SCRAP_TYPE_ICONS: Record<ScrapType, string> = {
  ELECTRONICS: '📱',
  HOME_APPLIANCES: '🔌',
  COMPUTERS: '💻',
  PHONES: '📞',
  CABLES_WIRES: '🔗',
  MOTORS: '⚙️',
  BATTERIES: '🔋',
  METAL_SCRAP: '🔩',
  CAR_PARTS: '🚗',
  FURNITURE_PARTS: '🪑',
  WOOD: '🪵',
  PLASTIC: '♻️',
  TEXTILES: '👕',
  PAPER: '📄',
  GLASS: '🪟',
  CONSTRUCTION: '🏗️',
  INDUSTRIAL: '🏭',
  MEDICAL: '⚕️',
  OTHER: '📦',
};

export default function ScrapMarketplacePage() {
  const [items, setItems] = useState<any[]>([]);
  const [metalPrices, setMetalPrices] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    scrapType: '' as ScrapType | '',
    scrapCondition: '' as ScrapCondition | '',
    metalType: '' as MetalType | '',
    pricingType: '' as ScrapPricingType | '',
    governorate: '',
    minPrice: '',
    maxPrice: '',
    page: 1,
  });

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [itemsResult, pricesResult, statsResult] = await Promise.all([
        getScrapItems({
          scrapType: filters.scrapType || undefined,
          scrapCondition: filters.scrapCondition || undefined,
          metalType: filters.metalType || undefined,
          pricingType: filters.pricingType || undefined,
          governorate: filters.governorate || undefined,
          minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
          maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
          page: filters.page,
          limit: 20,
        }),
        getMetalPrices(),
        getMarketStats(),
      ]);
      setItems(itemsResult.items || []);
      setMetalPrices(pricesResult || []);
      setStats(statsResult);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-orange-600 to-amber-600 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div>
              <h1 className="text-4xl font-bold mb-4">سوق التوالف</h1>
              <p className="text-xl opacity-90 mb-4">
                بيع واشتري التوالف والخردة بأفضل الأسعار
              </p>
              <div className="flex gap-4">
                <Link
                  href="/scrap/sell"
                  className="bg-white text-orange-600 px-6 py-3 rounded-lg font-bold hover:bg-orange-50 transition"
                >
                  بيع توالف
                </Link>
                <Link
                  href="/scrap/dealers"
                  className="border-2 border-white text-white px-6 py-3 rounded-lg font-bold hover:bg-white/10 transition"
                >
                  تجار معتمدين
                </Link>
              </div>
            </div>

            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-3 gap-6 text-center">
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="text-3xl font-bold">{stats.totalItems || 0}</div>
                  <div className="text-sm opacity-90">منتج متاح</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="text-3xl font-bold">{stats.totalDealers || 0}</div>
                  <div className="text-sm opacity-90">تاجر معتمد</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="text-3xl font-bold">{stats.totalRequests || 0}</div>
                  <div className="text-sm opacity-90">طلب شراء</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-4">
            <button
              onClick={() => setFilters((f) => ({ ...f, scrapType: '', page: 1 }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                !filters.scrapType
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            {Object.entries(SCRAP_TYPE_AR).slice(0, 10).map(([key, label]) => (
              <button
                key={key}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    scrapType: f.scrapType === key ? '' : (key as ScrapType),
                    page: 1,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                  filters.scrapType === key
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span>{SCRAP_TYPE_ICONS[key as ScrapType]}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters & Metal Prices */}
          <div className="lg:col-span-1 space-y-6">
            {/* Metal Prices Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                أسعار المعادن اليوم
              </h3>
              <div className="space-y-3">
                {metalPrices.length > 0 ? (
                  metalPrices.slice(0, 6).map((price: any) => (
                    <div
                      key={price.metalType}
                      className="flex justify-between items-center p-2 bg-gray-50 rounded-lg"
                    >
                      <span className="font-medium">
                        {METAL_TYPE_AR[price.metalType as MetalType] || price.metalType}
                      </span>
                      <span className="text-green-600 font-bold">
                        {price.pricePerKg} ج.م/كجم
                      </span>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-sm">جاري تحميل الأسعار...</p>
                )}
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">تصفية النتائج</h3>

              {/* Condition Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  value={filters.scrapCondition}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      scrapCondition: e.target.value as ScrapCondition,
                      page: 1,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">الكل</option>
                  {Object.entries(SCRAP_CONDITION_AR).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Metal Type Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع المعدن
                </label>
                <select
                  value={filters.metalType}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      metalType: e.target.value as MetalType,
                      page: 1,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">الكل</option>
                  {Object.entries(METAL_TYPE_AR).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pricing Type Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  طريقة التسعير
                </label>
                <select
                  value={filters.pricingType}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      pricingType: e.target.value as ScrapPricingType,
                      page: 1,
                    }))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">الكل</option>
                  {Object.entries(SCRAP_PRICING_AR).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نطاق السعر
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="من"
                    value={filters.minPrice}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, minPrice: e.target.value, page: 1 }))
                    }
                    className="w-1/2 border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="إلى"
                    value={filters.maxPrice}
                    onChange={(e) =>
                      setFilters((f) => ({ ...f, maxPrice: e.target.value, page: 1 }))
                    }
                    className="w-1/2 border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* Reset Button */}
              <button
                onClick={() =>
                  setFilters({
                    scrapType: '',
                    scrapCondition: '',
                    metalType: '',
                    pricingType: '',
                    governorate: '',
                    minPrice: '',
                    maxPrice: '',
                    page: 1,
                  })
                }
                className="w-full text-gray-500 text-sm hover:text-gray-700"
              >
                إعادة تعيين الفلاتر
              </button>
            </div>
          </div>

          {/* Main Content - Items Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {filters.scrapType
                  ? SCRAP_TYPE_AR[filters.scrapType]
                  : 'جميع المنتجات'}
              </h2>
              <span className="text-gray-500">{items.length} منتج</span>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-xl shadow-sm animate-pulse"
                  >
                    <div className="h-48 bg-gray-200 rounded-t-xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {items.map((item) => (
                  <Link
                    key={item.id}
                    href={`/scrap/${item.id}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition overflow-hidden"
                  >
                    {/* Image */}
                    <div className="relative h-48">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-4xl">
                          {SCRAP_TYPE_ICONS[item.scrapType as ScrapType] || '📦'}
                        </div>
                      )}
                      {/* Condition Badge */}
                      <div className="absolute top-2 right-2">
                        <span className="bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                          {SCRAP_CONDITION_AR[item.scrapCondition as ScrapCondition]}
                        </span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="p-4">
                      <h3 className="font-bold text-lg mb-1 line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2 line-clamp-2">
                        {item.description}
                      </p>

                      <div className="flex justify-between items-center">
                        <div className="text-lg font-bold text-green-600">
                          {item.estimatedValue.toLocaleString()} ج.م
                        </div>
                        {item.weightKg && (
                          <div className="text-sm text-gray-500">
                            {item.weightKg} كجم
                          </div>
                        )}
                      </div>

                      {/* Seller & Location */}
                      <div className="mt-3 pt-3 border-t flex justify-between items-center text-sm text-gray-500">
                        <span>{item.seller?.fullName}</span>
                        <span>{item.governorate}</span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">
                  لا توجد منتجات
                </h3>
                <p className="text-gray-500 mb-4">
                  كن أول من يبيع في هذه الفئة
                </p>
                <Link
                  href="/scrap/sell"
                  className="inline-block bg-orange-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-orange-700 transition"
                >
                  بيع الآن
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
