'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getWatchlist, removeFromWatchlist, WatchlistItem } from '@/lib/api/auctions';
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

        setIsUrgent(difference < 3600000);

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

  return <span className={isUrgent ? 'text-red-500 font-bold' : ''}>{timeLeft}</span>;
};

export default function WatchlistPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/auctions/watchlist');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadWatchlist();
    }
  }, [user, page]);

  const loadWatchlist = async () => {
    try {
      setLoading(true);
      const response = await getWatchlist(page, 12);
      setItems(response.data.items || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل قائمة المراقبة');
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (auctionId: string) => {
    if (!confirm('هل تريد إزالة هذا المزاد من قائمة المراقبة؟')) return;

    try {
      await removeFromWatchlist(auctionId);
      setItems(prev => prev.filter(item => item.auctionId !== auctionId));
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في إزالة المزاد');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-red-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/auctions" className="text-white/80 hover:text-white flex items-center gap-2 mb-4">
            <span>العودة للمزادات</span>
          </Link>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <svg className="w-10 h-10" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            قائمة المراقبة
          </h1>
          <p className="text-red-100 mt-2">المزادات التي تتابعها</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">جاري التحميل...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button onClick={loadWatchlist} className="mt-4 text-purple-600 hover:text-purple-700">
              حاول مرة أخرى
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <svg className="w-16 h-16 mx-auto text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <p className="text-gray-600 text-lg mt-4">قائمة المراقبة فارغة</p>
            <p className="text-gray-500 mt-2">أضف مزادات لمتابعتها</p>
            <Link href="/auctions" className="inline-block mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
              تصفح المزادات
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item) => {
                const auction = item.auction;
                const auctionItem = auction?.item || (auction as any)?.listing?.item;
                if (!auctionItem) return null;

                const primaryImage = auctionItem.images?.find((img: any) => img.isPrimary)?.url || auctionItem.images?.[0]?.url;
                const isEnded = new Date(auction.endTime) < new Date();
                const hasStarted = new Date(auction.startTime) < new Date();

                return (
                  <div key={item.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                    <Link href={`/auctions/${auction.id}`}>
                      <div className="relative h-48 bg-gray-200">
                        {primaryImage ? (
                          <img src={primaryImage} alt={auctionItem.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                            <span className="text-4xl">🔨</span>
                          </div>
                        )}

                        <div className="absolute top-2 left-2">
                          {isEnded ? (
                            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-semibold">منتهي</span>
                          ) : !hasStarted ? (
                            <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-semibold">قريبا</span>
                          ) : (
                            <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold animate-pulse">مباشر</span>
                          )}
                        </div>

                        {!isEnded && hasStarted && (
                          <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm">
                            <CountdownTimer endTime={auction.endTime} />
                          </div>
                        )}
                      </div>

                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 line-clamp-1">{auctionItem.title}</h3>
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-sm text-gray-600">المزايدة الحالية:</span>
                          <span className="text-lg font-bold text-purple-600">{(auction.currentPrice || 0).toLocaleString()} ج.م</span>
                        </div>
                        <div className="mt-1 text-sm text-gray-600">
                          {auction.bidCount || 0} مزايدة
                        </div>
                      </div>
                    </Link>

                    <div className="px-4 pb-4 border-t pt-3">
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
                        <span>إشعارات:</span>
                        <div className="flex gap-2">
                          {item.notifyOnBid && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded">مزايدة</span>}
                          {item.notifyOnOutbid && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded">تخطي</span>}
                          {item.notifyOnEnding && <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded">انتهاء</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemove(auction.id)}
                        className="w-full py-2 text-red-600 hover:bg-red-50 rounded-lg transition text-sm font-medium"
                      >
                        إزالة من القائمة
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex justify-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  السابق
                </button>
                <span className="px-4 py-2">{page} / {totalPages}</span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
