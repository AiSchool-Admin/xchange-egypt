'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LUXURY_CATEGORY_AR,
  LUXURY_STATUS_AR,
  LuxuryItemStatus,
  LuxuryCategoryType,
  formatLuxuryPrice,
  getStatusColor,
} from '@/lib/api/luxury-marketplace';

// Mock data for demo
interface MyLuxuryItem {
  id: string;
  titleAr: string;
  categoryType: LuxuryCategoryType;
  brand: string;
  model?: string;
  askingPrice: number;
  status: LuxuryItemStatus;
  verificationStatus: 'PENDING' | 'VERIFIED' | 'FAILED';
  images: string[];
  views: number;
  favorites: number;
  inquiries: number;
  offers: number;
  currentBid?: number;
  totalBids: number;
  auctionEnd?: string;
  createdAt: string;
  listedAt?: string;
}

const MOCK_LISTINGS: MyLuxuryItem[] = [
  {
    id: '1',
    titleAr: 'ساعة رولكس سبمارينر تاريخ 2023',
    categoryType: 'WATCHES',
    brand: 'Rolex',
    model: 'Submariner Date',
    askingPrice: 850000,
    status: 'LISTED',
    verificationStatus: 'VERIFIED',
    images: ['https://picsum.photos/400/300?random=1'],
    views: 245,
    favorites: 18,
    inquiries: 5,
    offers: 3,
    currentBid: 780000,
    totalBids: 12,
    auctionEnd: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: '2024-01-15T10:00:00Z',
    listedAt: '2024-01-16T14:00:00Z',
  },
  {
    id: '2',
    titleAr: 'حقيبة هيرميس بيركين 30 جلد توغو',
    categoryType: 'HANDBAGS',
    brand: 'Hermès',
    model: 'Birkin 30',
    askingPrice: 1200000,
    status: 'PENDING_VERIFICATION',
    verificationStatus: 'PENDING',
    images: ['https://picsum.photos/400/300?random=2'],
    views: 0,
    favorites: 0,
    inquiries: 0,
    offers: 0,
    totalBids: 0,
    createdAt: '2024-01-20T08:00:00Z',
  },
  {
    id: '3',
    titleAr: 'خاتم كارتييه لوف ذهب أصفر',
    categoryType: 'JEWELRY',
    brand: 'Cartier',
    model: 'Love Ring',
    askingPrice: 95000,
    status: 'SOLD',
    verificationStatus: 'VERIFIED',
    images: ['https://picsum.photos/400/300?random=3'],
    views: 520,
    favorites: 45,
    inquiries: 12,
    offers: 8,
    totalBids: 0,
    createdAt: '2024-01-10T12:00:00Z',
    listedAt: '2024-01-11T09:00:00Z',
  },
];

const STATUS_TABS = [
  { value: 'all', label: 'الكل', icon: '📦' },
  { value: 'LISTED', label: 'معروض', icon: '✅' },
  { value: 'PENDING_VERIFICATION', label: 'قيد التحقق', icon: '⏳' },
  { value: 'SOLD', label: 'تم البيع', icon: '🎉' },
  { value: 'WITHDRAWN', label: 'محذوف', icon: '🗑️' },
];

export default function MyLuxuryListingsPage() {
  const [listings, setListings] = useState<MyLuxuryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'price' | 'views'>('recent');

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    setLoading(true);
    try {
      // In production, call API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setListings(MOCK_LISTINGS);
    } catch (error) {
      console.error('Failed to load listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredListings = listings.filter((item) => {
    if (activeTab === 'all') return true;
    return item.status === activeTab;
  });

  const sortedListings = [...filteredListings].sort((a, b) => {
    if (sortBy === 'price') return b.askingPrice - a.askingPrice;
    if (sortBy === 'views') return b.views - a.views;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const getTimeRemaining = (endDate: string): string => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'انتهى';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} يوم ${hours} ساعة`;
    return `${hours} ساعة`;
  };

  const stats = {
    total: listings.length,
    listed: listings.filter((l) => l.status === 'LISTED').length,
    pending: listings.filter((l) => l.status === 'PENDING_VERIFICATION').length,
    sold: listings.filter((l) => l.status === 'SOLD').length,
    totalViews: listings.reduce((sum, l) => sum + l.views, 0),
    totalOffers: listings.reduce((sum, l) => sum + l.offers, 0),
  };

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
                <Link href="/luxury" className="hover:text-white">السلع الفاخرة</Link>
                <span>/</span>
                <span className="text-amber-400">إعلاناتي</span>
              </nav>
              <h1 className="text-2xl font-bold text-white">📦 إعلاناتي</h1>
              <p className="text-gray-400 mt-1">إدارة منتجاتك الفاخرة المعروضة</p>
            </div>
            <Link
              href="/luxury/sell"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition flex items-center gap-2"
            >
              <span>➕</span>
              <span>إضافة منتج جديد</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'إجمالي الإعلانات', value: stats.total, icon: '📦', color: 'bg-gray-800' },
            { label: 'معروض حالياً', value: stats.listed, icon: '✅', color: 'bg-emerald-500/20' },
            { label: 'قيد التحقق', value: stats.pending, icon: '⏳', color: 'bg-yellow-500/20' },
            { label: 'تم البيع', value: stats.sold, icon: '🎉', color: 'bg-purple-500/20' },
            { label: 'إجمالي المشاهدات', value: stats.totalViews, icon: '👁️', color: 'bg-blue-500/20' },
            { label: 'إجمالي العروض', value: stats.totalOffers, icon: '💰', color: 'bg-amber-500/20' },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4 border border-gray-700/50`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{stat.icon}</span>
                <span className="text-gray-400 text-sm">{stat.label}</span>
              </div>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs & Filters */}
      <div className="bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2 overflow-x-auto">
              {STATUS_TABS.map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setActiveTab(tab.value)}
                  className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap flex items-center gap-2 ${
                    activeTab === tab.value
                      ? 'bg-amber-500 text-gray-900'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.value !== 'all' && (
                    <span className="text-xs bg-black/20 px-2 py-0.5 rounded-full">
                      {listings.filter((l) => l.status === tab.value).length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700"
            >
              <option value="recent">الأحدث</option>
              <option value="price">الأعلى سعراً</option>
              <option value="views">الأكثر مشاهدة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-700 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/4 mb-3"></div>
                    <div className="h-8 bg-gray-700 rounded w-1/5"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : sortedListings.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="text-6xl mb-6">📦</div>
            <h3 className="text-2xl font-bold text-white mb-3">
              {activeTab === 'all' ? 'لا توجد إعلانات بعد' : 'لا توجد إعلانات في هذه الفئة'}
            </h3>
            <p className="text-gray-400 mb-8">ابدأ ببيع منتجاتك الفاخرة الآن</p>
            <Link
              href="/luxury/sell"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold"
            >
              <span>➕</span>
              <span>أضف منتجك الأول</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedListings.map((item) => (
              <div
                key={item.id}
                className="bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-amber-500/30 transition overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Image */}
                  <div className="md:w-48 h-48 md:h-auto bg-gray-900 flex-shrink-0">
                    {item.images[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.titleAr}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-4xl opacity-30">👑</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(item.status)}`}>
                            {LUXURY_STATUS_AR[item.status]}
                          </span>
                          {item.verificationStatus === 'VERIFIED' && (
                            <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-xs flex items-center gap-1">
                              <span>✓</span> موثق
                            </span>
                          )}
                          {item.verificationStatus === 'PENDING' && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs">
                              قيد التحقق
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{item.titleAr}</h3>
                        <p className="text-amber-500 text-sm">
                          {item.brand} {item.model && `• ${item.model}`}
                        </p>
                      </div>

                      <div className="text-left">
                        <div className="text-2xl font-bold text-white">
                          {formatLuxuryPrice(item.askingPrice)}
                        </div>
                        {item.currentBid && item.status === 'LISTED' && (
                          <div className="text-purple-400 text-sm mt-1">
                            أعلى مزايدة: {formatLuxuryPrice(item.currentBid)}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <span>👁️</span> {item.views} مشاهدة
                      </span>
                      <span className="flex items-center gap-1">
                        <span>❤️</span> {item.favorites} مفضلة
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💬</span> {item.inquiries} استفسار
                      </span>
                      <span className="flex items-center gap-1">
                        <span>💰</span> {item.offers} عرض
                      </span>
                      {item.totalBids > 0 && (
                        <span className="flex items-center gap-1 text-purple-400">
                          <span>🔨</span> {item.totalBids} مزايدة
                        </span>
                      )}
                    </div>

                    {/* Auction Timer */}
                    {item.auctionEnd && item.status === 'LISTED' && (
                      <div className="bg-purple-900/30 border border-purple-500/30 rounded-lg px-4 py-2 mb-4 inline-block">
                        <span className="text-purple-400 text-sm">
                          ⏰ ينتهي المزاد خلال: <strong>{getTimeRemaining(item.auctionEnd)}</strong>
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                      <Link
                        href={`/luxury/item/${item.id}`}
                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                      >
                        👁️ عرض
                      </Link>
                      {item.status === 'LISTED' && (
                        <>
                          <Link
                            href={`/luxury/edit/${item.id}`}
                            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition text-sm"
                          >
                            ✏️ تعديل
                          </Link>
                          <button className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-lg hover:bg-amber-500/30 transition text-sm">
                            📊 الإحصائيات
                          </button>
                          {item.offers > 0 && (
                            <Link
                              href={`/luxury/offers/${item.id}`}
                              className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg hover:bg-emerald-500/30 transition text-sm"
                            >
                              💰 عرض العروض ({item.offers})
                            </Link>
                          )}
                        </>
                      )}
                      {item.status === 'PENDING_VERIFICATION' && (
                        <span className="px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm">
                          ⏳ في انتظار مراجعة الخبراء
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
