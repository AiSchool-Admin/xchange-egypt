'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMatchingOffers, BarterOffer } from '@/lib/api/barter';

export default function OpenOffersPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [offers, setOffers] = useState<BarterOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'items' | 'describe'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      setLoading(true);
      const response = await getMatchingOffers();

      let offersData: any[] = [];
      if (Array.isArray(response)) {
        offersData = response;
      } else if (response?.data?.offers && Array.isArray(response.data.offers)) {
        offersData = response.data.offers;
      } else if (response?.data && Array.isArray(response.data)) {
        offersData = response.data;
      } else if (response?.offers && Array.isArray(response.offers)) {
        offersData = response.offers;
      }

      setOffers(offersData);
    } catch (err: any) {
      console.error('Failed to load offers:', err);
      setError(err.response?.data?.message || 'فشل في تحميل العروض المفتوحة');
    } finally {
      setLoading(false);
    }
  };

  const filteredOffers = offers.filter(offer => {
    if (filter === 'items' && (!offer.offeredItemIds || offer.offeredItemIds.length === 0)) return false;
    if (filter === 'describe' && (!offer.itemRequests || offer.itemRequests.length === 0)) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        offer.initiator?.fullName?.toLowerCase().includes(query) ||
        offer.itemRequests?.some(req => req.description?.toLowerCase().includes(query))
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Header */}
      <div className="bg-gradient-to-l from-green-600 via-teal-600 to-emerald-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-10">
          <Link
            href="/barter"
            className="text-green-200 hover:text-white flex items-center gap-2 mb-6 transition w-fit"
          >
            → العودة لسوق المقايضة
          </Link>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl shadow-xl">
              📋
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">العروض المفتوحة للمقايضة</h1>
              <p className="text-green-200 text-lg max-w-2xl">
                تصفح عروض المستخدمين الآخرين واعثر على فرص مقايضة مناسبة لك
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث في العروض..."
                className="w-full px-5 py-3 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl">🔍</span>
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'الكل', icon: '📋' },
                { value: 'items', label: 'عروض منتجات', icon: '📦' },
                { value: 'describe', label: 'طلبات محددة', icon: '📝' },
              ].map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as any)}
                  className={`px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition whitespace-nowrap ${
                    filter === f.value
                      ? 'bg-teal-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{f.icon}</span>
                  {f.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-600 font-medium flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">جاري تحميل العروض...</p>
          </div>
        ) : filteredOffers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <span className="text-7xl block mb-4">📭</span>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">لا توجد عروض مفتوحة</h2>
            <p className="text-gray-500 mb-6">
              {searchQuery ? 'جرب تغيير كلمات البحث' : 'كن أول من ينشئ عرض مقايضة مفتوح!'}
            </p>
            <Link
              href="/barter/new"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-l from-teal-500 to-emerald-500 text-white rounded-xl font-bold hover:from-teal-600 hover:to-emerald-600 transition shadow-lg"
            >
              <span className="text-xl">➕</span>
              أنشئ عرض مقايضة
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOffers.map((offer) => (
              <div key={offer.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition border border-gray-100">
                {/* Header */}
                <div className="bg-gradient-to-l from-teal-50 to-emerald-50 px-6 py-4 border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold">
                        {offer.initiator?.fullName?.charAt(0) || '👤'}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">
                          {offer.initiator?.fullName || 'مستخدم'}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {new Date(offer.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                      مفتوح
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    {/* Offering */}
                    <div className="bg-green-50 p-4 rounded-xl">
                      <h4 className="font-bold text-green-700 mb-2 flex items-center gap-2">
                        <span>📦</span>
                        يعرض:
                      </h4>
                      <p className="text-gray-700 font-medium">
                        {offer.offeredItemIds?.length || 0} منتج
                      </p>
                      {offer.offeredBundleValue && (
                        <p className="text-green-600 font-bold mt-2">
                          ~{offer.offeredBundleValue.toLocaleString('ar-EG')} ج.م
                        </p>
                      )}
                    </div>

                    {/* Looking for */}
                    <div className="bg-blue-50 p-4 rounded-xl">
                      <h4 className="font-bold text-blue-700 mb-2 flex items-center gap-2">
                        <span>🎯</span>
                        يريد:
                      </h4>
                      {offer.itemRequests && offer.itemRequests.length > 0 ? (
                        <div className="space-y-1">
                          {offer.itemRequests.slice(0, 2).map((req) => (
                            <p key={req.id} className="text-gray-700 text-sm line-clamp-1">
                              • {req.description}
                            </p>
                          ))}
                          {offer.itemRequests.length > 2 && (
                            <p className="text-blue-600 text-sm">+{offer.itemRequests.length - 2} المزيد</p>
                          )}
                        </div>
                      ) : offer.preferenceSets && offer.preferenceSets.length > 0 ? (
                        <div className="space-y-1">
                          {offer.preferenceSets.slice(0, 2).map((ps) => (
                            <div key={ps.id}>
                              {ps.description && (
                                <p className="text-gray-700 text-sm line-clamp-1">• {ps.description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">أي منتجات مناسبة</p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  {offer.message && (
                    <div className="mb-4 p-3 bg-gray-50 rounded-xl">
                      <p className="text-gray-700 text-sm line-clamp-2">💬 {offer.message}</p>
                    </div>
                  )}

                  {/* Actions */}
                  {user && user.id !== offer.initiator?.id ? (
                    <Link
                      href={`/barter/respond/${offer.id}`}
                      className="block w-full text-center bg-gradient-to-l from-teal-500 to-emerald-500 text-white px-4 py-3 rounded-xl hover:from-teal-600 hover:to-emerald-600 transition font-bold"
                    >
                      🤝 الرد على العرض
                    </Link>
                  ) : !user ? (
                    <Link
                      href="/login"
                      className="block w-full text-center bg-gray-100 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-200 transition font-bold"
                    >
                      سجل دخولك للرد على العرض
                    </Link>
                  ) : (
                    <div className="text-center text-gray-500 py-2">
                      هذا عرضك
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Stats */}
        {!loading && filteredOffers.length > 0 && (
          <div className="mt-8 text-center text-gray-500">
            عرض {filteredOffers.length} من {offers.length} عرض مفتوح
          </div>
        )}
      </div>
    </div>
  );
}
