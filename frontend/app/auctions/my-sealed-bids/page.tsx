'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMySealedBids, SealedBid } from '@/lib/api/auctions';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function MySealedBidsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [bids, setBids] = useState<SealedBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<'all' | 'pending' | 'revealed' | 'winner'>('all');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/auctions/my-sealed-bids');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadBids();
    }
  }, [user, page]);

  const loadBids = async () => {
    try {
      setLoading(true);
      const response = await getMySealedBids(page, 12);
      setBids(response.data.bids || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل العروض المختومة');
    } finally {
      setLoading(false);
    }
  };

  const filteredBids = bids.filter(bid => {
    if (filter === 'all') return true;
    if (filter === 'pending') return !bid.isRevealed;
    if (filter === 'revealed') return bid.isRevealed;
    if (filter === 'winner') return bid.isWinner;
    return true;
  });

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return null;

  // Stats
  const totalBids = bids.length;
  const pendingBids = bids.filter(b => !b.isRevealed).length;
  const wonBids = bids.filter(b => b.isWinner).length;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/auctions" className="text-white/80 hover:text-white flex items-center gap-2 mb-4">
            <span>العودة للمزادات</span>
          </Link>
          <h1 className="text-4xl font-bold flex items-center gap-3">
            <span>📦</span>
            عروضي المختومة
          </h1>
          <p className="text-blue-100 mt-2">العروض السرية التي قدمتها في مزادات العروض المختومة</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">إجمالي العروض</p>
            <p className="text-2xl font-bold text-gray-900">{totalBids}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">قيد الانتظار</p>
            <p className="text-2xl font-bold text-blue-600">{pendingBids}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">العروض الفائزة</p>
            <p className="text-2xl font-bold text-green-600">{wonBids}</p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="max-w-7xl mx-auto px-4 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-2">كيف تعمل العروض المختومة؟</h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• تقوم بتقديم عرضك السري دون معرفة عروض الآخرين</li>
            <li>• يتم الكشف عن جميع العروض بعد انتهاء المزاد</li>
            <li>• الفائز هو صاحب أعلى عرض</li>
            <li>• لا يمكنك تعديل عرضك بعد تقديمه</li>
          </ul>
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            الكل ({totalBids})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'pending' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            قيد الانتظار ({pendingBids})
          </button>
          <button
            onClick={() => setFilter('revealed')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'revealed' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            تم الكشف ({bids.filter(b => b.isRevealed).length})
          </button>
          <button
            onClick={() => setFilter('winner')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === 'winner' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            فائز ({wonBids})
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button onClick={loadBids} className="mt-4 text-purple-600 hover:text-purple-700">
              حاول مرة أخرى
            </button>
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">لا توجد عروض مختومة</p>
            <Link href="/auctions?auctionType=SEALED_BID" className="inline-block mt-4 text-purple-600 hover:text-purple-700">
              تصفح مزادات العروض المختومة
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBids.map((bid) => {
              const auction = bid.auction;
              const item = auction?.item || (auction as any)?.listing?.item;
              const primaryImage = item?.images?.[0] ? (typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url) : undefined;
              const isEnded = auction ? new Date(auction.endTime) < new Date() : false;

              return (
                <div key={bid.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <Link href={`/auctions/${bid.auctionId}`}>
                    <div className="relative h-40 bg-gray-200">
                      {primaryImage ? (
                        <img src={primaryImage} alt={item?.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          <span className="text-4xl">📦</span>
                        </div>
                      )}

                      {/* Status Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1">
                        {bid.isWinner ? (
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            فائز
                          </span>
                        ) : bid.isRevealed ? (
                          <span className="bg-gray-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            لم تفز
                          </span>
                        ) : (
                          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-semibold">
                            مختوم
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-1">{item?.title || 'مزاد'}</h3>

                      <div className="mt-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">عرضك:</span>
                          <span className="font-bold text-purple-600">
                            {bid.isRevealed && bid.bidAmount
                              ? `${bid.bidAmount.toLocaleString()} ج.م`
                              : '******'}
                          </span>
                        </div>

                        {bid.isRevealed && auction && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">أعلى عرض:</span>
                            <span className="font-semibold text-gray-900">
                              {(auction.currentPrice || 0).toLocaleString()} ج.م
                            </span>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          تم التقديم: {new Date(bid.submittedAt).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    </div>
                  </Link>

                  {bid.isWinner && (
                    <div className="px-4 pb-4 border-t pt-3">
                      <Link
                        href={`/checkout/auction/${bid.auctionId}`}
                        className="block w-full py-2 bg-green-600 text-white text-center rounded-lg hover:bg-green-700 transition font-medium"
                      >
                        إتمام الشراء
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

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
      </div>
    </div>
  );
}
