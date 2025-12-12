'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api/client';

// Types
interface CarListing {
  id: string;
  title: string;
  description?: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  bodyType: string;
  transmission: string;
  fuelType: string;
  mileage: number;
  condition: string;
  exteriorColor: string;
  images: string[];
  askingPrice: number;
  marketPrice?: number;
  priceNegotiable: boolean;
  allowBarter: boolean;
  barterWithCars: boolean;
  barterWithProperty: boolean;
  governorate: string;
  city: string;
  sellerType: string;
  showroomName?: string;
  verificationLevel: string;
  status: string;
  views: number;
  createdAt: string;
  seller: {
    id: string;
    fullName: string;
    avatar?: string;
    rating: number;
    totalReviews: number;
  };
  buyerPays: number;
  buyerCommission: number;
  inspection?: {
    overallScore?: number;
    recommendation?: string;
  };
}

interface CarStats {
  activeListings: number;
  barterListings: number;
  completedTransactions: number;
  topMakes: Array<{ make: string; count: number }>;
}

// Constants
const BODY_TYPE_LABELS: Record<string, { label: string; icon: string }> = {
  SEDAN: { label: 'سيدان', icon: '🚗' },
  HATCHBACK: { label: 'هاتشباك', icon: '🚙' },
  SUV: { label: 'SUV', icon: '🚙' },
  CROSSOVER: { label: 'كروس أوفر', icon: '🚙' },
  COUPE: { label: 'كوبيه', icon: '🚘' },
  CONVERTIBLE: { label: 'مكشوفة', icon: '🏎️' },
  PICKUP: { label: 'بيك أب', icon: '🛻' },
  VAN: { label: 'فان', icon: '🚐' },
  MINIVAN: { label: 'ميني فان', icon: '🚐' },
  WAGON: { label: 'ستيشن', icon: '🚗' },
  TRUCK: { label: 'شاحنة', icon: '🚚' },
  BUS: { label: 'أتوبيس', icon: '🚌' },
};

const TRANSMISSION_LABELS: Record<string, string> = {
  AUTOMATIC: 'أوتوماتيك',
  MANUAL: 'مانيوال',
  CVT: 'CVT',
  DCT: 'DCT',
};

const FUEL_TYPE_LABELS: Record<string, string> = {
  PETROL: 'بنزين',
  DIESEL: 'ديزل',
  ELECTRIC: 'كهربائي',
  HYBRID: 'هايبرد',
  NATURAL_GAS: 'غاز طبيعي',
  LPG: 'غاز',
};

const CONDITION_LABELS: Record<string, string> = {
  NEW: 'جديدة',
  LIKE_NEW: 'كالجديدة',
  EXCELLENT: 'ممتازة',
  GOOD: 'جيدة',
  FAIR: 'مقبولة',
  NEEDS_WORK: 'تحتاج صيانة',
};

const SELLER_TYPE_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  OWNER: { label: 'مالك', color: 'bg-blue-100 text-blue-700', icon: '👤' },
  DEALER: { label: 'تاجر', color: 'bg-purple-100 text-purple-700', icon: '🏪' },
  SHOWROOM: { label: 'معرض', color: 'bg-amber-100 text-amber-700', icon: '🏢' },
};

const VERIFICATION_BADGES: Record<string, { label: string; color: string; icon: string }> = {
  BASIC: { label: 'أساسي', color: 'bg-gray-100 text-gray-600', icon: '⚪' },
  VERIFIED: { label: 'موثق', color: 'bg-blue-100 text-blue-700', icon: '🔵' },
  INSPECTED: { label: 'مفحوصة', color: 'bg-green-100 text-green-700', icon: '✅' },
  CERTIFIED: { label: 'معتمدة', color: 'bg-emerald-100 text-emerald-700', icon: '🟢' },
};

const POPULAR_MAKES = [
  { name: 'تويوتا', nameEn: 'Toyota', logo: '🚗' },
  { name: 'هيونداي', nameEn: 'Hyundai', logo: '🚙' },
  { name: 'كيا', nameEn: 'Kia', logo: '🚘' },
  { name: 'نيسان', nameEn: 'Nissan', logo: '🚗' },
  { name: 'شيفروليه', nameEn: 'Chevrolet', logo: '🚙' },
  { name: 'مرسيدس', nameEn: 'Mercedes', logo: '🚘' },
  { name: 'بي إم دبليو', nameEn: 'BMW', logo: '🏎️' },
  { name: 'MG', nameEn: 'MG', logo: '🚗' },
];

export default function CarsMarketplacePage() {
  const router = useRouter();
  const [listings, setListings] = useState<CarListing[]>([]);
  const [stats, setStats] = useState<CarStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingListings, setLoadingListings] = useState(true);

  // Filters
  const [selectedMake, setSelectedMake] = useState<string>('');
  const [selectedBodyType, setSelectedBodyType] = useState<string>('');
  const [selectedSellerType, setSelectedSellerType] = useState<string>('');
  const [priceRange, setPriceRange] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [allowBarterOnly, setAllowBarterOnly] = useState<boolean>(false);

  // Fetch statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/cars/statistics');
        if (response.data.success) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching car stats:', error);
      }
    };

    fetchStats();
  }, []);

  // Fetch car listings
  useEffect(() => {
    const fetchListings = async () => {
      setLoadingListings(true);
      try {
        const params = new URLSearchParams();
        params.append('status', 'ACTIVE');
        if (selectedMake) params.append('make', selectedMake);
        if (selectedBodyType) params.append('bodyType', selectedBodyType);
        if (selectedSellerType) params.append('sellerType', selectedSellerType);
        if (searchQuery) params.append('search', searchQuery);
        if (allowBarterOnly) params.append('allowBarter', 'true');

        // Price range
        if (priceRange) {
          const [min, max] = priceRange.split('-');
          if (min) params.append('priceMin', min);
          if (max) params.append('priceMax', max);
        }

        params.append('sortBy', sortBy);
        params.append('sortOrder', sortBy === 'askingPrice' ? 'asc' : 'desc');
        params.append('limit', '20');

        const response = await apiClient.get(`/cars/listings?${params.toString()}`);
        if (response.data.success) {
          setListings(response.data.data.listings);
        }
      } catch (error) {
        console.error('Error fetching car listings:', error);
      } finally {
        setLoadingListings(false);
        setLoading(false);
      }
    };

    fetchListings();
  }, [selectedMake, selectedBodyType, selectedSellerType, priceRange, searchQuery, sortBy, allowBarterOnly]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  const formatMileage = (mileage: number) => {
    if (mileage >= 1000) {
      return `${Math.round(mileage / 1000)}K`;
    }
    return mileage.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-blue-700">جاري تحميل سوق السيارات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-blue-700 via-blue-600 to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              🚗 سوق السيارات
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              أول منصة في مصر بنظام Escrow لتداول ومقايضة السيارات بأمان
            </p>
            <p className="text-blue-200 mt-2">
              فلتر نوع البائع • نظام ضمان آمن • مقايضة سيارة بسيارة أو بعقار
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{stats?.activeListings || 0}</div>
              <div className="text-blue-200 text-sm">سيارة معروضة</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{stats?.barterListings || 0}</div>
              <div className="text-blue-200 text-sm">قابلة للمقايضة</div>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <div className="text-3xl font-bold">{stats?.completedTransactions || 0}</div>
              <div className="text-blue-200 text-sm">صفقة مكتملة</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Link
              href="/cars/sell"
              className="bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              🚗 اعرض سيارتك للبيع
            </Link>
            <Link
              href="/cars/barter"
              className="bg-blue-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors"
            >
              🔄 مقايضة سيارة بسيارة
            </Link>
            <Link
              href="/cars/how-it-works"
              className="border-2 border-white text-white px-8 py-3 rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              ❓ كيف يعمل
            </Link>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 text-center">
            <div className="text-3xl mb-2">👤</div>
            <h3 className="font-bold text-sm mb-1">فلتر نوع البائع</h3>
            <p className="text-gray-600 text-xs">
              مالك / تاجر / معرض
              <br />
              <span className="text-blue-600 font-bold">ميزة حصرية في مصر!</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 text-center">
            <div className="text-3xl mb-2">🔒</div>
            <h3 className="font-bold text-sm mb-1">نظام Escrow</h3>
            <p className="text-gray-600 text-xs">
              المبلغ محفوظ لحين إتمام المعاملة
              <br />
              <span className="text-green-600 font-bold">حماية للبائع والمشتري</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 text-center">
            <div className="text-3xl mb-2">🔄</div>
            <h3 className="font-bold text-sm mb-1">مقايضة مرنة</h3>
            <p className="text-gray-600 text-xs">
              سيارة بسيارة + فرق نقدي
              <br />
              <span className="text-purple-600 font-bold">أو سيارة بعقار!</span>
            </p>
          </div>
          <div className="bg-white rounded-xl p-5 shadow-sm border border-blue-100 text-center">
            <div className="text-3xl mb-2">🔍</div>
            <h3 className="font-bold text-sm mb-1">فحص معتمد</h3>
            <p className="text-gray-600 text-xs">
              مراكز فحص شريكة
              <br />
              <span className="text-amber-600 font-bold">تقرير شامل مع كل سيارة</span>
            </p>
          </div>
        </div>
      </div>

      {/* Popular Makes */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h2 className="text-lg font-bold mb-4">الماركات الأكثر طلباً</h2>
        <div className="flex flex-wrap gap-3">
          {POPULAR_MAKES.map((make) => (
            <button
              key={make.nameEn}
              onClick={() => setSelectedMake(selectedMake === make.name ? '' : make.name)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all ${
                selectedMake === make.name
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-700 border-gray-200 hover:border-blue-400'
              }`}
            >
              <span>{make.logo}</span>
              <span className="font-medium">{make.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Filters & Search */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
          <div className="flex flex-wrap gap-4 items-center">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="ابحث بالماركة، الموديل، السنة..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Body Type Filter */}
            <select
              value={selectedBodyType}
              onChange={(e) => setSelectedBodyType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">نوع الهيكل</option>
              {Object.entries(BODY_TYPE_LABELS).map(([key, { label, icon }]) => (
                <option key={key} value={key}>{icon} {label}</option>
              ))}
            </select>

            {/* Seller Type Filter - ميزة حصرية */}
            <select
              value={selectedSellerType}
              onChange={(e) => setSelectedSellerType(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 bg-blue-50"
            >
              <option value="">نوع البائع ⭐</option>
              <option value="OWNER">👤 مالك أول</option>
              <option value="DEALER">🏪 تاجر</option>
              <option value="SHOWROOM">🏢 معرض</option>
            </select>

            {/* Price Range */}
            <select
              value={priceRange}
              onChange={(e) => setPriceRange(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">نطاق السعر</option>
              <option value="0-500000">أقل من 500 ألف</option>
              <option value="500000-1000000">500 ألف - مليون</option>
              <option value="1000000-2000000">مليون - 2 مليون</option>
              <option value="2000000-">أكثر من 2 مليون</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">الأحدث</option>
              <option value="askingPrice">السعر: الأقل</option>
              <option value="year">السنة: الأحدث</option>
              <option value="mileage">الكيلومترات: الأقل</option>
              <option value="views">الأكثر مشاهدة</option>
            </select>

            {/* Barter Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={allowBarterOnly}
                onChange={(e) => setAllowBarterOnly(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm">🔄 قابلة للمقايضة فقط</span>
            </label>
          </div>
        </div>
      </div>

      {/* Car Listings Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">السيارات المتاحة</h2>

        {loadingListings ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden shadow-sm animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد سيارات متاحة</h3>
            <p className="text-gray-500 mb-6">جرّب تغيير معايير البحث أو كن أول من يعرض سيارته</p>
            <Link
              href="/cars/sell"
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors"
            >
              🚗 اعرض سيارتك الآن
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <Link
                key={listing.id}
                href={`/cars/${listing.id}`}
                className="bg-white rounded-xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all group"
              >
                {/* Image */}
                <div className="relative h-48 bg-gradient-to-br from-blue-100 to-slate-100">
                  {listing.images?.[0] ? (
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      {BODY_TYPE_LABELS[listing.bodyType]?.icon || '🚗'}
                    </div>
                  )}

                  {/* Seller Type Badge */}
                  <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold ${SELLER_TYPE_BADGES[listing.sellerType]?.color}`}>
                    {SELLER_TYPE_BADGES[listing.sellerType]?.icon} {SELLER_TYPE_BADGES[listing.sellerType]?.label}
                  </div>

                  {/* Verification Badge */}
                  {listing.verificationLevel !== 'BASIC' && (
                    <div className={`absolute top-2 left-2 px-2 py-1 rounded-full text-xs font-bold ${VERIFICATION_BADGES[listing.verificationLevel]?.color}`}>
                      {VERIFICATION_BADGES[listing.verificationLevel]?.icon}
                    </div>
                  )}

                  {/* Barter Badge */}
                  {listing.allowBarter && (
                    <div className="absolute bottom-2 right-2 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      🔄 مقايضة
                    </div>
                  )}

                  {/* Condition Badge */}
                  {listing.condition === 'NEW' && (
                    <div className="absolute bottom-2 left-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                      زيرو
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-4">
                  <h3 className="font-bold text-gray-800 mb-1 line-clamp-1">{listing.title}</h3>

                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full text-xs">
                      {listing.year}
                    </span>
                    <span>{TRANSMISSION_LABELS[listing.transmission]}</span>
                    <span>•</span>
                    <span>{formatMileage(listing.mileage)} كم</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-bold text-blue-600">
                        {formatPrice(listing.askingPrice)} ج.م
                      </div>
                      {listing.priceNegotiable && (
                        <div className="text-xs text-gray-500">قابل للتفاوض</div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-xs text-gray-400">{listing.governorate}</div>
                      {listing.showroomName && (
                        <div className="text-xs text-amber-600 font-medium">{listing.showroomName}</div>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* How It Works Section */}
      <div className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">كيف يعمل سوق السيارات؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">1</div>
              <h3 className="font-bold mb-2">اعرض أو ابحث</h3>
              <p className="text-sm text-gray-600">اعرض سيارتك للبيع أو تصفح السيارات المتاحة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">2</div>
              <h3 className="font-bold mb-2">تواصل آمن</h3>
              <p className="text-sm text-gray-600">تواصل مع البائع/المشتري عبر المنصة</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">3</div>
              <h3 className="font-bold mb-2">فحص واتفاق</h3>
              <p className="text-sm text-gray-600">اطلب فحص من مركز معتمد واتفق على السعر</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl mx-auto mb-4">4</div>
              <h3 className="font-bold mb-2">إتمام آمن</h3>
              <p className="text-sm text-gray-600">ادفع بأمان عبر Escrow ونقل الملكية</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-l from-blue-700 to-blue-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-3xl font-bold mb-4">عندك سيارة للبيع أو المقايضة؟</h2>
          <p className="text-blue-100 mb-6 max-w-xl mx-auto">
            اعرض سيارتك على Xchange ووصل لآلاف المشترين.
            <br />
            عمولة 1.5% فقط على البائع + 1.5% على المشتري!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/cars/sell"
              className="inline-block bg-white text-blue-600 px-8 py-3 rounded-xl font-bold hover:bg-blue-50 transition-colors shadow-lg"
            >
              🚗 اعرض للبيع
            </Link>
            <Link
              href="/cars/barter"
              className="inline-block bg-blue-800 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-900 transition-colors"
            >
              🔄 اعرض للمقايضة
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
