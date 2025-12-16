'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  getAuctions,
  getFeaturedAuctions,
  addToWatchlist,
  removeFromWatchlist,
  checkWatchlist,
  Auction,
  AuctionType,
  AuctionCategory
} from '@/lib/api/auctions';
import { getCategories, Category } from '@/lib/api/categories';
import { useAuth } from '@/lib/contexts/AuthContext';

// Countdown Timer Component
const CountdownTimer: React.FC<{ endTime: string }> = ({ endTime }) => {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(endTime).getTime() - Date.now();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((difference / 1000 / 60) % 60);
        const seconds = Math.floor((difference / 1000) % 60);

        setIsUrgent(difference < 3600000); // Less than 1 hour

        if (days > 0) {
          setTimeLeft(`${days} يوم ${hours} ساعة`);
        } else if (hours > 0) {
          setTimeLeft(`${hours} س ${minutes} د ${seconds} ث`);
        } else {
          setTimeLeft(`${minutes} د ${seconds} ث`);
        }
      } else {
        setTimeLeft('انتهى');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return <span className={isUrgent ? 'text-red-400' : ''}>{timeLeft}</span>;
};

// Auction Type Labels
const auctionTypeLabels: Record<AuctionType, { label: string; icon: string; color: string }> = {
  ENGLISH: { label: 'مزاد إنجليزي', icon: '🔨', color: 'bg-purple-100 text-purple-800' },
  SEALED_BID: { label: 'عرض مختوم', icon: '📦', color: 'bg-blue-100 text-blue-800' },
  DUTCH: { label: 'مزاد هولندي', icon: '🔻', color: 'bg-orange-100 text-orange-800' },
};

// Auction Category Labels
const auctionCategoryLabels: Record<AuctionCategory, { label: string; icon: string }> = {
  GENERAL: { label: 'عام', icon: '📦' },
  CARS: { label: 'سيارات', icon: '🚗' },
  PROPERTIES: { label: 'عقارات', icon: '🏠' },
  ELECTRONICS: { label: 'إلكترونيات', icon: '📱' },
  ANTIQUES: { label: 'تحف', icon: '🏺' },
  ART: { label: 'فنون', icon: '🎨' },
  JEWELRY: { label: 'مجوهرات', icon: '💎' },
  COLLECTIBLES: { label: 'مقتنيات', icon: '🏆' },
  INDUSTRIAL: { label: 'صناعي', icon: '🏭' },
};

// Auction Card Component
const AuctionCard: React.FC<{
  auction: any;
  onWatchlistToggle: (auctionId: string, isInWatchlist: boolean) => void;
  watchlistStatus: Record<string, boolean>;
}> = ({ auction, onWatchlistToggle, watchlistStatus }) => {
  const item = auction.item || auction.listing?.item;
  if (!item) return null;

  const primaryImage = item.images?.find((img: any) => img.isPrimary)?.url || item.images?.[0]?.url;
  const isEnded = new Date(auction.endTime) < new Date();
  const hasStarted = new Date(auction.startTime) < new Date();
  const isInWatchlist = watchlistStatus[auction.id] || false;
  const auctionType = auction.auctionType || 'ENGLISH';

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition overflow-hidden group relative">
      {/* Watchlist Button */}
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onWatchlistToggle(auction.id, isInWatchlist);
        }}
        className={`absolute top-2 right-2 z-10 p-2 rounded-full transition ${
          isInWatchlist
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-white/80 text-gray-600 hover:bg-white hover:text-red-500'
        }`}
        title={isInWatchlist ? 'إزالة من المراقبة' : 'إضافة للمراقبة'}
      >
        <svg className="w-5 h-5" fill={isInWatchlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
      </button>

      <Link href={`/auctions/${auction.id}`}>
        {/* Image */}
        <div className="relative h-48 bg-gray-200">
          {primaryImage ? (
            <img
              src={primaryImage}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              <span className="text-4xl">🔨</span>
            </div>
          )}

          {/* Status Badge */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {isEnded ? (
              <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-semibold">
                منتهي
              </span>
            ) : !hasStarted ? (
              <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                قريبا
              </span>
            ) : (
              <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">
                مباشر
              </span>
            )}

            {/* Auction Type Badge */}
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${auctionTypeLabels[auctionType as AuctionType]?.color || 'bg-gray-100 text-gray-800'}`}>
              {auctionTypeLabels[auctionType as AuctionType]?.icon} {auctionTypeLabels[auctionType as AuctionType]?.label}
            </span>
          </div>

          {/* Featured Badge */}
          {auction.isFeatured && (
            <div className="absolute bottom-2 left-2">
              <span className="bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-semibold">
                مميز
              </span>
            </div>
          )}

          {/* Countdown */}
          {!isEnded && hasStarted && (
            <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-semibold">
              <CountdownTimer endTime={auction.endTime} />
            </div>
          )}

          {/* Deposit Required Badge */}
          {auction.requiresDeposit && (
            <div className="absolute top-12 left-2">
              <span className="bg-amber-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                يتطلب تأمين
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-purple-600 transition">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-1 mt-1">
            {item.description}
          </p>

          <div className="mt-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {auctionType === 'SEALED_BID' ? 'السعر المبدئي:' : 'المزايدة الحالية:'}
              </span>
              <span className="text-lg font-bold text-purple-600">
                {(auction.currentPrice || auction.startingPrice || 0).toLocaleString()} ج.م
              </span>
            </div>

            {auction.buyNowPrice && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">اشتري الآن:</span>
                <span className="font-semibold text-green-600">
                  {auction.buyNowPrice.toLocaleString()} ج.م
                </span>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span className="flex items-center gap-1">
                <span>{auction.totalBids || auction.bidCount || 0} مزايدة</span>
                {auction.watchlistCount > 0 && (
                  <span className="text-red-500 flex items-center gap-0.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {auction.watchlistCount}
                  </span>
                )}
              </span>
              {item.category && <span>{item.category.nameAr || item.category.nameEn}</span>}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default function AuctionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [featuredAuctions, setFeaturedAuctions] = useState<Auction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [watchlistStatus, setWatchlistStatus] = useState<Record<string, boolean>>({});

  // Filters
  const [selectedStatus, setSelectedStatus] = useState('ACTIVE');
  const [selectedAuctionType, setSelectedAuctionType] = useState<AuctionType | ''>('');
  const [selectedAuctionCategory, setSelectedAuctionCategory] = useState<AuctionCategory | ''>('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadCategories();
    loadFeaturedAuctions();
  }, []);

  useEffect(() => {
    loadAuctions();
  }, [page, selectedStatus, selectedAuctionType, selectedAuctionCategory, selectedCategory, minPrice, maxPrice]);

  const loadCategories = async () => {
    try {
      const response = await getCategories();
      setCategories(response.data);
    } catch (err: any) {
      console.error('Failed to load categories:', err);
    }
  };

  const loadFeaturedAuctions = async () => {
    try {
      const response = await getFeaturedAuctions(4);
      setFeaturedAuctions(response.data.auctions || []);
    } catch (err: any) {
      console.error('Failed to load featured auctions:', err);
    }
  };

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const response = await getAuctions({
        page,
        limit: 12,
        status: selectedStatus || undefined,
        auctionType: selectedAuctionType || undefined,
        auctionCategory: selectedAuctionCategory || undefined,
        categoryId: selectedCategory || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
        search: searchQuery || undefined,
      });

      setAuctions(response.data.auctions || []);
      setTotalPages(response.data.pagination?.totalPages || 1);

      // Check watchlist status for each auction if user is logged in
      if (user) {
        const statusPromises = (response.data.auctions || []).map(async (auction: Auction) => {
          try {
            const result = await checkWatchlist(auction.id);
            return { id: auction.id, isInWatchlist: result.data.isInWatchlist };
          } catch {
            return { id: auction.id, isInWatchlist: false };
          }
        });
        const statuses = await Promise.all(statusPromises);
        const statusMap: Record<string, boolean> = {};
        statuses.forEach(s => { statusMap[s.id] = s.isInWatchlist; });
        setWatchlistStatus(statusMap);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل المزادات');
    } finally {
      setLoading(false);
    }
  };

  const handleWatchlistToggle = async (auctionId: string, isCurrentlyInWatchlist: boolean) => {
    if (!user) {
      router.push('/login');
      return;
    }

    try {
      if (isCurrentlyInWatchlist) {
        await removeFromWatchlist(auctionId);
        setWatchlistStatus(prev => ({ ...prev, [auctionId]: false }));
      } else {
        await addToWatchlist(auctionId, {
          notifyOnBid: true,
          notifyOnOutbid: true,
          notifyOnEnding: true,
          notifyBeforeEnd: 30,
        });
        setWatchlistStatus(prev => ({ ...prev, [auctionId]: true }));
      }
    } catch (err: any) {
      console.error('Failed to toggle watchlist:', err);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadAuctions();
  };

  const clearFilters = () => {
    setSelectedStatus('ACTIVE');
    setSelectedAuctionType('');
    setSelectedAuctionCategory('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSearchQuery('');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-4xl font-bold">سوق المزادات</h1>
              <p className="text-purple-100 mt-2">زايد على المنتجات واحصل على أفضل الصفقات!</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/auctions/live"
                className="bg-red-500 text-white px-6 py-3 rounded-lg hover:bg-red-600 transition font-semibold shadow-lg flex items-center gap-2"
              >
                <span className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
                </span>
                مزادات بالفيديو
              </Link>
              {user && (
                <Link
                  href="/auctions/watchlist"
                  className="bg-white/20 text-white px-6 py-3 rounded-lg hover:bg-white/30 transition font-semibold flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  قائمة المراقبة
                </Link>
              )}
              <Link
                href="/auctions/new"
                className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-purple-50 transition font-semibold shadow-lg"
              >
                + إنشاء مزاد
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mt-6">
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن مزادات..."
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:ring-2 focus:ring-purple-300 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-purple-800 text-white px-6 py-3 rounded-lg hover:bg-purple-900 transition font-semibold"
              >
                بحث
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Auction Types Quick Filter */}
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => { setSelectedAuctionType(''); setPage(1); }}
            className={`px-4 py-2 rounded-full font-medium transition ${
              selectedAuctionType === '' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            الكل
          </button>
          {Object.entries(auctionTypeLabels).map(([type, { label, icon }]) => (
            <button
              key={type}
              onClick={() => { setSelectedAuctionType(type as AuctionType); setPage(1); }}
              className={`px-4 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                selectedAuctionType === type ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Featured Auctions */}
      {featuredAuctions.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="bg-gradient-to-r from-yellow-400 to-amber-500 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-amber-900 mb-4 flex items-center gap-2">
              <span>المزادات المميزة</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredAuctions.map((auction: any) => (
                <AuctionCard
                  key={auction.id}
                  auction={auction}
                  onWatchlistToggle={handleWatchlistToggle}
                  watchlistStatus={watchlistStatus}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Filters Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">الفلاتر</h2>
                <button
                  onClick={clearFilters}
                  className="text-sm text-purple-600 hover:text-purple-700"
                >
                  مسح الكل
                </button>
              </div>

              {/* Status Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                <select
                  value={selectedStatus}
                  onChange={(e) => {
                    setSelectedStatus(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">الكل</option>
                  <option value="ACTIVE">نشط</option>
                  <option value="PENDING">قريبا</option>
                  <option value="ENDED">منتهي</option>
                  <option value="COMPLETED">مكتمل</option>
                </select>
              </div>

              {/* Auction Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">فئة المزاد</label>
                <select
                  value={selectedAuctionCategory}
                  onChange={(e) => {
                    setSelectedAuctionCategory(e.target.value as AuctionCategory);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">جميع الفئات</option>
                  {Object.entries(auctionCategoryLabels).map(([cat, { label, icon }]) => (
                    <option key={cat} value={cat}>{icon} {label}</option>
                  ))}
                </select>
              </div>

              {/* Item Category Filter */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">فئة المنتج</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => {
                    setSelectedCategory(e.target.value);
                    setPage(1);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">جميع الفئات</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr || cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نطاق السعر (ج.م)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(e.target.value)}
                    placeholder="من"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(e.target.value)}
                    placeholder="إلى"
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Quick Links */}
              {user && (
                <div className="border-t pt-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">روابط سريعة</h3>
                  <div className="space-y-2">
                    <Link href="/auctions/watchlist" className="block text-purple-600 hover:text-purple-700 text-sm">
                      قائمة المراقبة
                    </Link>
                    <Link href="/auctions/my-bids" className="block text-purple-600 hover:text-purple-700 text-sm">
                      مزايداتي
                    </Link>
                    <Link href="/auctions/my-sealed-bids" className="block text-purple-600 hover:text-purple-700 text-sm">
                      عروضي المختومة
                    </Link>
                    <Link href="/auctions/deposits" className="block text-purple-600 hover:text-purple-700 text-sm">
                      إيداعاتي
                    </Link>
                    <Link href="/auctions/disputes" className="block text-purple-600 hover:text-purple-700 text-sm">
                      النزاعات
                    </Link>
                    <Link href="/auctions/reviews" className="block text-purple-600 hover:text-purple-700 text-sm">
                      التقييمات
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Auctions Grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                <p className="mt-4 text-gray-600">جاري تحميل المزادات...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <p className="text-red-600">{error}</p>
                <button
                  onClick={loadAuctions}
                  className="mt-4 text-purple-600 hover:text-purple-700"
                >
                  حاول مرة أخرى
                </button>
              </div>
            ) : auctions.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <p className="text-gray-600 text-lg">لا توجد مزادات</p>
                <p className="text-gray-500 mt-2">كن أول من يبدأ مزادا!</p>
                <Link
                  href="/auctions/new"
                  className="inline-block mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
                >
                  إنشاء مزاد
                </Link>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {auctions.map((auction: any) => (
                    <AuctionCard
                      key={auction.id}
                      auction={auction}
                      onWatchlistToggle={handleWatchlistToggle}
                      watchlistStatus={watchlistStatus}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      السابق
                    </button>
                    <div className="flex items-center gap-2">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        const pageNum = i + 1;
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`px-4 py-2 rounded-lg ${
                              page === pageNum
                                ? 'bg-purple-600 text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
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
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
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
