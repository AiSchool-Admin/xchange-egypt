'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import {
  Search, Filter, Grid, List, Smartphone, Shield,
  RefreshCw, MapPin, Heart, ChevronDown, Sparkles,
  Battery, CheckCircle2, AlertCircle, TrendingUp
} from 'lucide-react';
import MobileCard from '@/components/mobile/MobileCard';
import MobileFilters from '@/components/mobile/MobileFilters';

const BRANDS = [
  { value: 'APPLE', label: 'Apple', icon: '🍎' },
  { value: 'SAMSUNG', label: 'Samsung', icon: '📱' },
  { value: 'XIAOMI', label: 'Xiaomi', icon: '📲' },
  { value: 'OPPO', label: 'OPPO', icon: '📱' },
  { value: 'HUAWEI', label: 'Huawei', icon: '📱' },
  { value: 'REALME', label: 'Realme', icon: '📱' },
  { value: 'INFINIX', label: 'Infinix', icon: '📱' },
  { value: 'TECNO', label: 'Tecno', icon: '📱' },
];

const CONDITION_GRADES = [
  { value: 'A', label: 'ممتاز', labelEn: 'Excellent', color: 'text-green-600' },
  { value: 'B', label: 'جيد جداً', labelEn: 'Very Good', color: 'text-blue-600' },
  { value: 'C', label: 'جيد', labelEn: 'Good', color: 'text-yellow-600' },
  { value: 'D', label: 'مقبول', labelEn: 'Fair', color: 'text-orange-600' },
];

interface MobileListing {
  id: string;
  title: string;
  titleAr?: string;
  brand: string;
  model: string;
  storageGb: number;
  priceEgp: number;
  conditionGrade: string;
  batteryHealth?: number;
  imeiVerified: boolean;
  imeiStatus: string;
  acceptsBarter: boolean;
  images: string[];
  governorate: string;
  city?: string;
  viewsCount: number;
  favoritesCount: number;
  featured: boolean;
  createdAt: string;
  seller: {
    id: string;
    fullName: string;
    avatar?: string;
    rating: number;
    totalReviews: number;
  };
}

export default function MobilesPage() {
  const searchParams = useSearchParams();
  const [listings, setListings] = useState<MobileListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter states
  const [filters, setFilters] = useState({
    brand: searchParams.get('brand') || '',
    model: searchParams.get('model') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    condition: searchParams.get('condition') || '',
    governorate: searchParams.get('governorate') || '',
    acceptsBarter: searchParams.get('barter') === 'true',
    imeiVerified: searchParams.get('verified') === 'true',
    sort: searchParams.get('sort') || 'newest',
  });

  useEffect(() => {
    fetchListings();
  }, [filters, currentPage]);

  const fetchListings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.brand) params.append('brand', filters.brand);
      if (filters.model) params.append('model', filters.model);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.condition) params.append('condition', filters.condition);
      if (filters.governorate) params.append('governorate', filters.governorate);
      if (filters.acceptsBarter) params.append('acceptsBarter', 'true');
      if (filters.imeiVerified) params.append('imeiVerified', 'true');
      params.append('sort', filters.sort);
      params.append('page', currentPage.toString());
      params.append('limit', '20');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/mobiles/listings?${params}`);
      const data = await response.json();

      if (data.success) {
        setListings(data.data);
        setTotalCount(data.pagination?.total || 0);
      }
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white">
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-right">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                سوق الموبايلات
              </h1>
              <p className="text-xl text-white/90 mb-6">
                اشتري، بيع، أو قايض موبايلك بأمان مع التحقق من IMEI و نظام Escrow
              </p>
              <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                <Link
                  href="/mobiles/sell"
                  className="bg-white text-indigo-600 px-6 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors flex items-center gap-2"
                >
                  <Smartphone className="w-5 h-5" />
                  بيع موبايلك
                </Link>
                <Link
                  href="/mobiles/barter"
                  className="bg-white/20 backdrop-blur text-white px-6 py-3 rounded-xl font-bold hover:bg-white/30 transition-colors flex items-center gap-2"
                >
                  <RefreshCw className="w-5 h-5" />
                  مقايضة ذكية
                </Link>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-6 text-center">
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl font-bold">{totalCount || '500+'}</div>
                <div className="text-sm text-white/80">موبايل متاح</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl font-bold flex items-center justify-center gap-1">
                  <Shield className="w-6 h-6" />
                  100%
                </div>
                <div className="text-sm text-white/80">تحقق IMEI</div>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-xl p-4">
                <div className="text-3xl font-bold">0%</div>
                <div className="text-sm text-white/80">عمولة للمشتري</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Brand Filters */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4 overflow-x-auto pb-2">
            <button
              onClick={() => handleFilterChange('brand', '')}
              className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
                !filters.brand
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            {BRANDS.map(brand => (
              <button
                key={brand.value}
                onClick={() => handleFilterChange('brand', brand.value)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition-colors flex items-center gap-2 ${
                  filters.brand === brand.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{brand.icon}</span>
                {brand.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-8">
          {/* Sidebar Filters - Desktop */}
          <div className="hidden lg:block w-72 flex-shrink-0">
            <MobileFilters
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {/* Listings */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm"
                >
                  <Filter className="w-5 h-5" />
                  الفلاتر
                </button>
                <span className="text-gray-600">
                  {totalCount} نتيجة
                </span>
              </div>

              <div className="flex items-center gap-4">
                {/* Sort */}
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-2 text-sm"
                >
                  <option value="newest">الأحدث</option>
                  <option value="price_asc">السعر: الأقل أولاً</option>
                  <option value="price_desc">السعر: الأعلى أولاً</option>
                  <option value="popular">الأكثر مشاهدة</option>
                </select>

                {/* View Mode */}
                <div className="flex bg-white rounded-lg shadow-sm overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                  >
                    <Grid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-indigo-600 text-white' : 'text-gray-600'}`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile Filters Panel */}
            {showFilters && (
              <div className="lg:hidden mb-6 bg-white rounded-xl shadow-lg p-4">
                <MobileFilters
                  filters={filters}
                  onFilterChange={handleFilterChange}
                />
              </div>
            )}

            {/* Featured Section */}
            {currentPage === 1 && !filters.brand && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  <h2 className="text-xl font-bold">إعلانات مميزة</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {listings.filter(l => l.featured).slice(0, 3).map(listing => (
                    <MobileCard key={listing.id} listing={listing} featured />
                  ))}
                </div>
              </div>
            )}

            {/* Listings Grid/List */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl h-80 animate-pulse" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-xl">
                <Smartphone className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                  لا توجد نتائج
                </h3>
                <p className="text-gray-600 mb-4">
                  جرب تغيير معايير البحث
                </p>
                <button
                  onClick={() => setFilters({
                    brand: '', model: '', minPrice: '', maxPrice: '',
                    condition: '', governorate: '', acceptsBarter: false,
                    imeiVerified: false, sort: 'newest'
                  })}
                  className="text-indigo-600 font-medium hover:underline"
                >
                  إعادة تعيين الفلاتر
                </button>
              </div>
            ) : (
              <div className={viewMode === 'grid'
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'space-y-4'
              }>
                {listings.filter(l => !l.featured || currentPage > 1 || filters.brand).map(listing => (
                  <MobileCard
                    key={listing.id}
                    listing={listing}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            {/* Pagination */}
            {totalCount > 20 && (
              <div className="flex justify-center mt-8 gap-2">
                {Array.from({ length: Math.ceil(totalCount / 20) }, (_, i) => i + 1)
                  .slice(Math.max(0, currentPage - 3), currentPage + 2)
                  .map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 rounded-lg ${
                        currentPage === page
                          ? 'bg-indigo-600 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      {page}
                    </button>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Trust Features */}
      <div className="bg-white py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-bold text-center mb-8">لماذا Xchange Mobile؟</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-green-50 to-emerald-50">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="font-bold mb-2">التحقق من IMEI</h3>
              <p className="text-gray-600 text-sm">
                نتحقق من كل جهاز للتأكد من عدم وجوده في القائمة السوداء
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="font-bold mb-2">نظام Escrow</h3>
              <p className="text-gray-600 text-sm">
                أموالك محمية حتى تستلم وتفحص الجهاز
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="font-bold mb-2">المقايضة الذكية</h3>
              <p className="text-gray-600 text-sm">
                خوارزمية ذكية تجد لك أفضل صفقات المقايضة
              </p>
            </div>

            <div className="text-center p-6 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50">
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Battery className="w-8 h-8 text-amber-600" />
              </div>
              <h3 className="font-bold mb-2">فحص البطارية</h3>
              <p className="text-gray-600 text-sm">
                نعرض نسبة صحة البطارية الحقيقية لكل جهاز
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
