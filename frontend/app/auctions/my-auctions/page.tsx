'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getUserAuctions, cancelAuction, Auction, AuctionStatus } from '@/lib/api/auctions';

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'مسودة', color: 'bg-gray-100 text-gray-700' },
  SCHEDULED: { label: 'مجدول', color: 'bg-blue-100 text-blue-700' },
  ACTIVE: { label: 'نشط', color: 'bg-green-100 text-green-700' },
  ENDED: { label: 'انتهى', color: 'bg-purple-100 text-purple-700' },
  SOLD: { label: 'تم البيع', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
  FAILED: { label: 'فشل', color: 'bg-orange-100 text-orange-700' },
};

type TabType = 'all' | 'active' | 'scheduled' | 'ended' | 'sold';

export default function MyAuctionsPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    ended: 0,
    sold: 0,
    totalEarnings: 0,
    totalBids: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/auctions/my-auctions');
      return;
    }
    loadAuctions();
  }, [isAuthenticated]);

  const loadAuctions = async () => {
    try {
      setLoading(true);
      const result = await getUserAuctions();
      const auctionList = result.data || [];
      setAuctions(auctionList);

      // حساب الإحصائيات
      const active = auctionList.filter((a: Auction) => a.status === 'ACTIVE').length;
      const scheduled = auctionList.filter((a: Auction) => a.status === 'SCHEDULED').length;
      const ended = auctionList.filter((a: Auction) => a.status === 'ENDED').length;
      const sold = auctionList.filter((a: Auction) => a.status === 'SOLD').length;
      const totalEarnings = auctionList
        .filter((a: Auction) => a.status === 'SOLD')
        .reduce((sum: number, a: Auction) => sum + (a.currentPrice || 0), 0);
      const totalBids = auctionList.reduce((sum: number, a: Auction) => sum + (a.totalBids || 0), 0);

      setStats({
        total: auctionList.length,
        active,
        scheduled,
        ended,
        sold,
        totalEarnings,
        totalBids,
      });
    } catch (error) {
      console.error('Error loading auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (auctionId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا المزاد؟')) return;

    try {
      await cancelAuction(auctionId);
      loadAuctions();
    } catch (error: any) {
      alert(error.message || 'حدث خطأ أثناء إلغاء المزاد');
    }
  };

  const filteredAuctions = auctions.filter(auction => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return auction.status === 'ACTIVE';
    if (activeTab === 'scheduled') return auction.status === 'SCHEDULED';
    if (activeTab === 'ended') return auction.status === 'ENDED' || auction.status === 'FAILED';
    if (activeTab === 'sold') return auction.status === 'SOLD';
    return true;
  });

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return 'انتهى';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return `${days} يوم ${hours} ساعة`;
    if (hours > 0) return `${hours} ساعة ${minutes} دقيقة`;
    return `${minutes} دقيقة`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">مزاداتي</h1>
            <p className="text-gray-600 mt-1">إدارة جميع مزاداتك من مكان واحد</p>
          </div>
          <Link
            href="/auctions/create"
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
          >
            <span>+</span>
            إنشاء مزاد جديد
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-500">إجمالي المزادات</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-green-600">{stats.active}</div>
            <div className="text-sm text-gray-500">نشط</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-blue-600">{stats.scheduled}</div>
            <div className="text-sm text-gray-500">مجدول</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-emerald-600">{stats.sold}</div>
            <div className="text-sm text-gray-500">تم بيعها</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">{stats.totalBids}</div>
            <div className="text-sm text-gray-500">إجمالي المزايدات</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalEarnings.toLocaleString('ar-EG')}
              <span className="text-sm font-normal"> ج.م</span>
            </div>
            <div className="text-sm text-gray-500">إجمالي الأرباح</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b">
            {[
              { key: 'all', label: 'الكل', count: stats.total },
              { key: 'active', label: 'نشط', count: stats.active },
              { key: 'scheduled', label: 'مجدول', count: stats.scheduled },
              { key: 'ended', label: 'انتهى', count: stats.ended },
              { key: 'sold', label: 'تم البيع', count: stats.sold },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabType)}
                className={`px-6 py-4 font-medium transition-colors ${
                  activeTab === tab.key
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                <span className={`mr-2 px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.key ? 'bg-purple-100' : 'bg-gray-100'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Auctions List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">جاري تحميل المزادات...</p>
          </div>
        ) : filteredAuctions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔨</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد مزادات</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all'
                ? 'لم تقم بإنشاء أي مزادات بعد'
                : `لا توجد مزادات في قسم "${
                    { active: 'نشط', scheduled: 'مجدول', ended: 'انتهى', sold: 'تم البيع' }[activeTab]
                  }"`}
            </p>
            <Link
              href="/auctions/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              + إنشاء مزاد جديد
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAuctions.map(auction => (
              <div key={auction.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="flex">
                  {/* الصورة */}
                  <div className="w-48 h-40 flex-shrink-0">
                    {auction.listing?.item?.images?.[0] ? (
                      <img
                        src={auction.listing.item.images[0]}
                        alt={auction.listing.item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-4xl">🔨</span>
                      </div>
                    )}
                  </div>

                  {/* المحتوى */}
                  <div className="flex-1 p-5">
                    <div className="flex justify-between items-start">
                      <div>
                        <Link
                          href={`/auctions/${auction.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-purple-600"
                        >
                          {auction.listing?.item?.title || 'بدون عنوان'}
                        </Link>
                        <div className="flex items-center gap-3 mt-2">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            statusLabels[auction.status]?.color || 'bg-gray-100'
                          }`}>
                            {statusLabels[auction.status]?.label || auction.status}
                          </span>
                          {auction.isFeatured && (
                            <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                              ⭐ مميز
                            </span>
                          )}
                        </div>
                      </div>

                      {/* الإجراءات */}
                      <div className="flex gap-2">
                        <Link
                          href={`/auctions/${auction.id}`}
                          className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                          عرض
                        </Link>
                        {(auction.status === 'DRAFT' || auction.status === 'SCHEDULED') && (
                          <>
                            <Link
                              href={`/auctions/${auction.id}/edit`}
                              className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200"
                            >
                              تعديل
                            </Link>
                            <button
                              onClick={() => handleCancel(auction.id)}
                              className="px-3 py-1.5 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                            >
                              إلغاء
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* المعلومات */}
                    <div className="grid grid-cols-4 gap-4 mt-4">
                      <div>
                        <span className="text-xs text-gray-500">السعر الحالي</span>
                        <p className="font-bold text-purple-600">
                          {(auction.currentPrice || auction.startingPrice).toLocaleString('ar-EG')} ج.م
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">المزايدات</span>
                        <p className="font-bold text-gray-900">{auction.totalBids || 0}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">المشاهدات</span>
                        <p className="font-bold text-gray-900">{auction.views || 0}</p>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">
                          {auction.status === 'ACTIVE' ? 'ينتهي في' : 'تاريخ الانتهاء'}
                        </span>
                        <p className="font-bold text-gray-900">
                          {auction.status === 'ACTIVE'
                            ? getTimeRemaining(auction.endTime)
                            : formatDate(auction.endTime)}
                        </p>
                      </div>
                    </div>

                    {/* شريط التقدم للمزادات النشطة */}
                    {auction.status === 'ACTIVE' && auction.reservePrice && (
                      <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>الوصول للسعر الاحتياطي</span>
                          <span>
                            {Math.min(100, Math.round((auction.currentPrice / auction.reservePrice) * 100))}%
                          </span>
                        </div>
                        <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              auction.currentPrice >= auction.reservePrice ? 'bg-green-500' : 'bg-purple-500'
                            }`}
                            style={{
                              width: `${Math.min(100, (auction.currentPrice / auction.reservePrice) * 100)}%`,
                            }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/auctions/watchlist"
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">👁️</div>
              <div>
                <h3 className="font-bold text-gray-900">قائمة المراقبة</h3>
                <p className="text-sm text-gray-500">المزادات التي تتابعها</p>
              </div>
            </div>
          </Link>

          <Link
            href="/auctions/deposits"
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">💰</div>
              <div>
                <h3 className="font-bold text-gray-900">الودائع</h3>
                <p className="text-sm text-gray-500">إدارة الضمانات المالية</p>
              </div>
            </div>
          </Link>

          <Link
            href="/auctions/disputes"
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">⚖️</div>
              <div>
                <h3 className="font-bold text-gray-900">النزاعات</h3>
                <p className="text-sm text-gray-500">إدارة الشكاوى والنزاعات</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
