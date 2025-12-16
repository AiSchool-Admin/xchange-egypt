'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getAuctions, Auction, AuctionType, AuctionCategory, AuctionStatus } from '@/lib/api/auctions';

// فلاتر البحث
const auctionTypes: { value: AuctionType | ''; label: string }[] = [
  { value: '', label: 'جميع الأنواع' },
  { value: 'ENGLISH', label: '🔨 مزاد إنجليزي' },
  { value: 'SEALED_BID', label: '📦 عرض مختوم' },
  { value: 'DUTCH', label: '🔻 مزاد هولندي' },
];

const auctionCategories: { value: AuctionCategory | ''; label: string }[] = [
  { value: '', label: 'جميع الفئات' },
  { value: 'GENERAL', label: '📦 عام' },
  { value: 'CARS', label: '🚗 سيارات' },
  { value: 'PROPERTIES', label: '🏠 عقارات' },
  { value: 'ELECTRONICS', label: '📱 إلكترونيات' },
  { value: 'ANTIQUES', label: '🏺 تحف وأنتيكات' },
  { value: 'ART', label: '🎨 فنون' },
  { value: 'JEWELRY', label: '💎 مجوهرات' },
  { value: 'COLLECTIBLES', label: '🏆 مقتنيات' },
  { value: 'INDUSTRIAL', label: '🏭 معدات صناعية' },
];

const governorates = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج',
];

const conditions = [
  { value: '', label: 'جميع الحالات' },
  { value: 'NEW', label: 'جديد' },
  { value: 'LIKE_NEW', label: 'كالجديد' },
  { value: 'GOOD', label: 'جيد' },
  { value: 'FAIR', label: 'مقبول' },
  { value: 'POOR', label: 'يحتاج إصلاح' },
];

const sortOptions = [
  { value: 'endTime_asc', label: 'ينتهي قريباً' },
  { value: 'endTime_desc', label: 'ينتهي لاحقاً' },
  { value: 'currentPrice_asc', label: 'السعر: من الأقل' },
  { value: 'currentPrice_desc', label: 'السعر: من الأعلى' },
  { value: 'totalBids_desc', label: 'الأكثر مزايدات' },
  { value: 'views_desc', label: 'الأكثر مشاهدة' },
  { value: 'createdAt_desc', label: 'الأحدث' },
];

export default function AdvancedSearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(false);
  const [totalResults, setTotalResults] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const itemsPerPage = 20;

  // فلاتر البحث
  const [filters, setFilters] = useState({
    query: searchParams.get('q') || '',
    auctionType: '' as AuctionType | '',
    category: '' as AuctionCategory | '',
    status: 'ACTIVE' as AuctionStatus | '',
    governorate: '',
    condition: '',
    priceMin: '',
    priceMax: '',
    sortBy: 'endTime_asc',
    featured: false,
    hasDeposit: false,
    endingSoon: false,
  });

  useEffect(() => {
    performSearch();
  }, [filters, currentPage]);

  const performSearch = async () => {
    try {
      setLoading(true);
      const result = await getAuctions({
        search: filters.query || undefined,
        status: filters.status as AuctionStatus || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });

      let filtered = result.data || [];

      // تطبيق الفلاتر المحلية
      if (filters.auctionType) {
        filtered = filtered.filter((a: Auction) => a.auctionType === filters.auctionType);
      }
      if (filters.category) {
        filtered = filtered.filter((a: Auction) => a.auctionCategory === filters.category);
      }
      if (filters.governorate) {
        filtered = filtered.filter((a: Auction) => a.governorate === filters.governorate);
      }
      if (filters.priceMin) {
        filtered = filtered.filter((a: Auction) => a.currentPrice >= parseFloat(filters.priceMin));
      }
      if (filters.priceMax) {
        filtered = filtered.filter((a: Auction) => a.currentPrice <= parseFloat(filters.priceMax));
      }
      if (filters.featured) {
        filtered = filtered.filter((a: Auction) => a.isFeatured);
      }
      if (filters.endingSoon) {
        const oneDay = 24 * 60 * 60 * 1000;
        filtered = filtered.filter((a: Auction) => {
          const endTime = new Date(a.endTime).getTime();
          return endTime - Date.now() < oneDay;
        });
      }

      // الترتيب
      const [sortField, sortDir] = filters.sortBy.split('_');
      filtered.sort((a: Auction, b: Auction) => {
        let aVal: any = a[sortField as keyof Auction];
        let bVal: any = b[sortField as keyof Auction];
        if (sortField === 'endTime' || sortField === 'createdAt') {
          aVal = new Date(aVal).getTime();
          bVal = new Date(bVal).getTime();
        }
        return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
      });

      setAuctions(filtered);
      setTotalResults(result.pagination?.total || filtered.length);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      auctionType: '',
      category: '',
      status: 'ACTIVE',
      governorate: '',
      condition: '',
      priceMin: '',
      priceMax: '',
      sortBy: 'endTime_asc',
      featured: false,
      hasDeposit: false,
      endingSoon: false,
    });
    setCurrentPage(1);
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return { text: 'انتهى', urgent: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { text: `${days} يوم ${hours} ساعة`, urgent: false };
    if (hours > 0) return { text: `${hours} ساعة ${minutes} دقيقة`, urgent: hours < 3 };
    return { text: `${minutes} دقيقة`, urgent: true };
  };

  const activeFiltersCount = Object.values(filters).filter(v => v && v !== 'ACTIVE' && v !== 'endTime_asc').length;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/auctions" className="text-gray-500 hover:text-gray-700">
              ←
            </Link>
            <div className="flex-1 relative">
              <input
                type="text"
                value={filters.query}
                onChange={(e) => handleFilterChange('query', e.target.value)}
                placeholder="ابحث في المزادات..."
                className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-3 rounded-xl flex items-center gap-2 ${
                showFilters ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
              }`}
            >
              🎛️ الفلاتر
              {activeFiltersCount > 0 && (
                <span className="px-2 py-0.5 bg-purple-500 text-white rounded-full text-xs">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Sidebar Filters */}
          {showFilters && (
            <div className="w-72 flex-shrink-0">
              <div className="bg-white rounded-xl shadow-sm p-5 sticky top-24">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-bold text-gray-900">الفلاتر</h3>
                  <button
                    onClick={clearFilters}
                    className="text-sm text-purple-600 hover:text-purple-700"
                  >
                    مسح الكل
                  </button>
                </div>

                <div className="space-y-5">
                  {/* نوع المزاد */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نوع المزاد</label>
                    <select
                      value={filters.auctionType}
                      onChange={(e) => handleFilterChange('auctionType', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      {auctionTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* الفئة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">الفئة</label>
                    <select
                      value={filters.category}
                      onChange={(e) => handleFilterChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      {auctionCategories.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* الحالة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">حالة المزاد</label>
                    <select
                      value={filters.status}
                      onChange={(e) => handleFilterChange('status', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">الكل</option>
                      <option value="ACTIVE">نشط</option>
                      <option value="SCHEDULED">مجدول</option>
                      <option value="ENDED">انتهى</option>
                      <option value="SOLD">تم البيع</option>
                    </select>
                  </div>

                  {/* المحافظة */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة</label>
                    <select
                      value={filters.governorate}
                      onChange={(e) => handleFilterChange('governorate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">جميع المحافظات</option>
                      {governorates.map(gov => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  {/* نطاق السعر */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">نطاق السعر (جنيه)</label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="من"
                        value={filters.priceMin}
                        onChange={(e) => handleFilterChange('priceMin', e.target.value)}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      />
                      <input
                        type="number"
                        placeholder="إلى"
                        value={filters.priceMax}
                        onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                        className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>

                  {/* خيارات إضافية */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.featured}
                        onChange={(e) => handleFilterChange('featured', e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700">⭐ مزادات مميزة فقط</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={filters.endingSoon}
                        onChange={(e) => handleFilterChange('endingSoon', e.target.checked)}
                        className="w-4 h-4 text-purple-600 rounded"
                      />
                      <span className="text-sm text-gray-700">⏰ تنتهي خلال 24 ساعة</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Results */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-gray-600">
                {loading ? 'جاري البحث...' : `${totalResults} نتيجة`}
              </div>
              <select
                value={filters.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                {sortOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Results Grid */}
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="bg-white rounded-xl p-4 animate-pulse">
                    <div className="w-full h-40 bg-gray-200 rounded-lg mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : auctions.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد نتائج</h3>
                <p className="text-gray-600 mb-4">جرب تغيير الفلاتر أو استخدام كلمات بحث مختلفة</p>
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                >
                  مسح الفلاتر
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {auctions.map(auction => {
                  const timeRemaining = getTimeRemaining(auction.endTime);
                  return (
                    <Link
                      key={auction.id}
                      href={`/auctions/${auction.id}`}
                      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                    >
                      {/* الصورة */}
                      <div className="relative h-48">
                        {auction.listing?.item?.images?.[0] ? (
                          <img
                            src={auction.listing.item.images[0]}
                            alt={auction.listing.item.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-5xl">🔨</span>
                          </div>
                        )}

                        {/* الشارات */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1">
                          {auction.isFeatured && (
                            <span className="px-2 py-1 bg-yellow-500 text-white text-xs rounded-full">
                              ⭐ مميز
                            </span>
                          )}
                          {auction.auctionType !== 'ENGLISH' && (
                            <span className="px-2 py-1 bg-purple-500 text-white text-xs rounded-full">
                              {auction.auctionType === 'SEALED_BID' ? '📦 مختوم' : '🔻 هولندي'}
                            </span>
                          )}
                        </div>

                        {/* الوقت المتبقي */}
                        <div className={`absolute bottom-2 left-2 px-2 py-1 rounded-lg text-xs font-medium ${
                          timeRemaining.urgent
                            ? 'bg-red-500 text-white animate-pulse'
                            : 'bg-black/60 text-white'
                        }`}>
                          ⏰ {timeRemaining.text}
                        </div>
                      </div>

                      {/* المحتوى */}
                      <div className="p-4">
                        <h3 className="font-bold text-gray-900 line-clamp-1 mb-2">
                          {auction.listing?.item?.title || 'بدون عنوان'}
                        </h3>

                        <div className="flex justify-between items-center mb-3">
                          <div>
                            <div className="text-xs text-gray-500">السعر الحالي</div>
                            <div className="font-bold text-purple-600">
                              {(auction.currentPrice || auction.startingPrice).toLocaleString('ar-EG')} ج.م
                            </div>
                          </div>
                          <div className="text-left">
                            <div className="text-xs text-gray-500">المزايدات</div>
                            <div className="font-bold text-gray-900">{auction.totalBids || 0}</div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>📍 {auction.governorate || 'غير محدد'}</span>
                          <span>👁️ {auction.views || 0} مشاهدة</span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}

            {/* Pagination */}
            {!loading && auctions.length > 0 && (
              <div className="mt-6 flex justify-center gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  السابق
                </button>
                <span className="px-4 py-2 text-gray-600">
                  صفحة {currentPage} من {Math.ceil(totalResults / itemsPerPage)}
                </span>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage * itemsPerPage >= totalResults}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  التالي
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
