'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import apiClient from '@/lib/api/client';

interface BarterOffer {
  id: string;
  status: string;
  message?: string;
  isOpenOffer: boolean;
  offeredBundleValue?: number;
  createdAt: string;
  initiatorId: string;
  recipientId?: string;
  initiator?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  recipient?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  _isMobileOffer?: boolean; // Flag to identify mobile barter proposals
  preferenceSets?: Array<{
    id: string;
    description?: string;
    items: Array<{
      id: string;
      item: {
        id: string;
        title: string;
        estimatedValue?: number | string;
        images?: string[] | Array<{ url: string }>;
      };
    }>;
  }>;
  itemRequests?: Array<{
    id: string;
    description?: string;
    category?: {
      nameAr: string;
      nameEn: string;
    };
  }>;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'في الانتظار',
  ACCEPTED: 'مقبول',
  REJECTED: 'مرفوض',
  CANCELLED: 'ملغي',
  COMPLETED: 'مكتمل',
  COUNTER_OFFERED: 'عرض مضاد',
};

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  ACCEPTED: 'bg-green-100 text-green-800 border-green-300',
  REJECTED: 'bg-red-100 text-red-800 border-red-300',
  CANCELLED: 'bg-gray-100 text-gray-800 border-gray-300',
  COMPLETED: 'bg-blue-100 text-blue-800 border-blue-300',
  COUNTER_OFFERED: 'bg-purple-100 text-purple-800 border-purple-300',
};

export default function MyBarterOffersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [sentOffers, setSentOffers] = useState<BarterOffer[]>([]);
  const [receivedOffers, setReceivedOffers] = useState<BarterOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'received' | 'sent'>('received');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadOffers();
    }
  }, [user, authLoading]);

  const loadOffers = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch from both general barter and mobile barter systems
      const [sentRes, receivedRes, mobileSentRes, mobileReceivedRes] = await Promise.all([
        apiClient.get('/barter/offers/my?type=sent').catch(() => ({ data: { data: [] } })),
        apiClient.get('/barter/offers/my?type=received').catch(() => ({ data: { data: [] } })),
        apiClient.get('/mobiles/barter/proposals').catch(() => ({ data: { data: [] } })),
        apiClient.get('/mobiles/barter/proposals/received').catch(() => ({ data: { data: [] } })),
      ]);

      // General barter offers
      const generalSent = sentRes.data.data?.items || sentRes.data.data?.offers || sentRes.data.data || [];
      const generalReceived = receivedRes.data.data?.items || receivedRes.data.data?.offers || receivedRes.data.data || [];

      // Mobile barter proposals - normalize to match general barter interface
      const mobileSent = (mobileSentRes.data.data || []).map((p: any) => ({
        id: p.id,
        status: p.status,
        message: p.proposerMessage,
        isOpenOffer: false,
        offeredBundleValue: p.offeredListing?.priceEgp || 0,
        createdAt: p.createdAt,
        initiatorId: p.proposerId,
        recipientId: p.receiverId,
        initiator: null, // Will be current user
        recipient: p.receiver,
        preferenceSets: [{
          id: `mobile-${p.id}`,
          items: [{
            id: `item-${p.offeredListingId}`,
            item: {
              id: p.offeredListingId,
              title: p.offeredListing?.titleAr || p.offeredListing?.title || `${p.offeredListing?.brand} ${p.offeredListing?.model}`,
              estimatedValue: p.offeredListing?.priceEgp,
              images: p.offeredListing?.images,
            }
          }]
        }],
        itemRequests: [{
          id: `req-${p.requestedListingId}`,
          description: p.requestedListing?.titleAr || p.requestedListing?.title || `${p.requestedListing?.brand} ${p.requestedListing?.model}`,
        }],
        _isMobileOffer: true, // Flag to identify mobile offers
      }));

      const mobileReceived = (mobileReceivedRes.data.data || []).map((p: any) => ({
        id: p.id,
        status: p.status,
        message: p.proposerMessage,
        isOpenOffer: false,
        offeredBundleValue: p.offeredListing?.priceEgp || 0,
        createdAt: p.createdAt,
        initiatorId: p.proposerId,
        recipientId: p.receiverId,
        initiator: p.proposer,
        recipient: null, // Will be current user
        preferenceSets: [{
          id: `mobile-${p.id}`,
          items: [{
            id: `item-${p.offeredListingId}`,
            item: {
              id: p.offeredListingId,
              title: p.offeredListing?.titleAr || p.offeredListing?.title || `${p.offeredListing?.brand} ${p.offeredListing?.model}`,
              estimatedValue: p.offeredListing?.priceEgp,
              images: p.offeredListing?.images,
            }
          }]
        }],
        itemRequests: [{
          id: `req-${p.requestedListingId}`,
          description: p.requestedListing?.titleAr || p.requestedListing?.title || `${p.requestedListing?.brand} ${p.requestedListing?.model}`,
        }],
        _isMobileOffer: true,
      }));

      // Merge and sort by date
      const allSent = [...generalSent, ...mobileSent].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      const allReceived = [...generalReceived, ...mobileReceived].sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setSentOffers(allSent);
      setReceivedOffers(allReceived);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل العروض');
    } finally {
      setLoading(false);
    }
  };

  // Helper to find if an offer is a mobile offer
  const findOffer = (offerId: string): BarterOffer | undefined => {
    return [...sentOffers, ...receivedOffers].find(o => o.id === offerId);
  };

  const handleCancel = async (offerId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا العرض؟')) return;
    try {
      setActionLoading(offerId);
      const offer = findOffer(offerId);
      if (offer?._isMobileOffer) {
        await apiClient.delete(`/mobiles/barter/proposals/${offerId}`);
      } else {
        await apiClient.post(`/barter/offers/${offerId}/cancel`);
      }
      await loadOffers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في إلغاء العرض');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAccept = async (offerId: string) => {
    if (!confirm('هل أنت متأكد من قبول هذا العرض؟')) return;
    try {
      setActionLoading(offerId);
      const offer = findOffer(offerId);
      if (offer?._isMobileOffer) {
        await apiClient.put(`/mobiles/barter/proposals/${offerId}/respond`, { response: 'ACCEPTED' });
      } else {
        await apiClient.post(`/barter/offers/${offerId}/accept`);
      }
      await loadOffers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في قبول العرض');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (offerId: string) => {
    if (!confirm('هل أنت متأكد من رفض هذا العرض؟')) return;
    try {
      setActionLoading(offerId);
      const offer = findOffer(offerId);
      if (offer?._isMobileOffer) {
        await apiClient.put(`/mobiles/barter/proposals/${offerId}/respond`, { response: 'REJECTED' });
      } else {
        await apiClient.post(`/barter/offers/${offerId}/reject`);
      }
      await loadOffers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في رفض العرض');
    } finally {
      setActionLoading(null);
    }
  };

  const handleComplete = async (offerId: string) => {
    if (!confirm('هل تؤكد إتمام عملية التبادل؟')) return;
    try {
      setActionLoading(offerId);
      const offer = findOffer(offerId);
      if (offer?._isMobileOffer) {
        // Mobile offers complete differently - might need to create a transaction
        alert('سيتم إتمام التبادل - تواصل مع الطرف الآخر للاتفاق على التفاصيل');
      } else {
        await apiClient.post(`/barter/offers/${offerId}/complete`);
      }
      await loadOffers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'فشل في إتمام التبادل');
    } finally {
      setActionLoading(null);
    }
  };

  const getOfferedItems = (offer: BarterOffer) => {
    return offer.preferenceSets?.[0]?.items || [];
  };

  const pendingReceivedCount = receivedOffers.filter(o => o.status === 'PENDING').length;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mb-4"></div>
          <div className="text-xl text-gray-600">جاري التحميل...</div>
        </div>
      </div>
    );
  }

  const renderOfferCard = (offer: BarterOffer, isReceived: boolean) => {
    const otherParty = isReceived ? offer.initiator : offer.recipient;
    const offeredItems = getOfferedItems(offer);

    return (
      <div
        key={offer.id}
        className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 ${
          isReceived && offer.status === 'PENDING' ? 'border-orange-300' : 'border-transparent'
        }`}
      >
        {/* Header */}
        <div className={`px-6 py-4 ${isReceived ? 'bg-gradient-to-l from-orange-500 to-orange-600' : 'bg-gradient-to-l from-teal-500 to-teal-600'}`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl backdrop-blur-sm">
                {otherParty?.avatar ? (
                  <img src={otherParty.avatar} alt="" className="w-full h-full rounded-full object-cover" />
                ) : (
                  isReceived ? '📥' : '📤'
                )}
              </div>
              <div className="text-white">
                <p className="font-bold text-lg">
                  {isReceived ? 'عرض وارد من' : 'عرض مرسل إلى'}: {otherParty?.fullName || 'عرض مفتوح'}
                </p>
                <p className="text-white/80 text-sm">
                  {new Date(offer.createdAt).toLocaleDateString('ar-EG', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-bold border ${STATUS_COLORS[offer.status]}`}>
              {STATUS_LABELS[offer.status] || offer.status}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Offered Items */}
          <div className="mb-6">
            <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
              <span className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">🎁</span>
              {isReceived ? 'المنتجات المعروضة لك' : 'المنتجات التي تعرضها'}
            </h4>
            {offeredItems.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {offeredItems.map((prefItem) => {
                  // Handle images as String[] or { url: string }[]
                  const imageUrl = Array.isArray(prefItem.item.images) && prefItem.item.images.length > 0
                    ? (typeof prefItem.item.images[0] === 'string' ? prefItem.item.images[0] : prefItem.item.images[0]?.url)
                    : null;
                  return (
                    <div key={prefItem.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl border">
                      <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {imageUrl ? (
                          <img src={imageUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{prefItem.item.title}</p>
                        {prefItem.item.estimatedValue && (
                          <p className="text-sm text-teal-600 font-medium">
                            {Number(prefItem.item.estimatedValue).toLocaleString()} ج.م
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 bg-gray-50 rounded-xl text-gray-500 text-center">
                لم يتم تحديد منتجات بعد
              </div>
            )}
          </div>

          {/* Item Requests */}
          {offer.itemRequests && offer.itemRequests.length > 0 && (
            <div className="mb-6">
              <h4 className="font-bold text-gray-700 mb-3 flex items-center gap-2">
                <span className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">🔍</span>
                {isReceived ? 'ما يريده مقابل ذلك' : 'ما تريده مقابل ذلك'}
              </h4>
              <div className="space-y-2">
                {offer.itemRequests.map((req) => (
                  <div key={req.id} className="p-3 bg-purple-50 rounded-xl border border-purple-200">
                    <p className="text-gray-800">{req.description}</p>
                    {req.category && (
                      <p className="text-sm text-purple-600 mt-1">
                        الفئة: {req.category.nameAr || req.category.nameEn}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Open Offer */}
          {offer.isOpenOffer && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 flex items-center gap-2">
                <span>⭐</span>
                عرض مفتوح - يقبل أي منتجات مناسبة
              </p>
            </div>
          )}

          {/* Message */}
          {offer.message && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
              <p className="text-sm text-gray-500 mb-1">رسالة:</p>
              <p className="text-gray-800">{offer.message}</p>
            </div>
          )}

          {/* Total Value */}
          {offer.offeredBundleValue && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
              <span className="text-gray-700">إجمالي قيمة العرض:</span>
              <span className="text-xl font-bold text-green-600">
                {offer.offeredBundleValue.toLocaleString()} ج.م
              </span>
            </div>
          )}

          {/* Action Buttons */}
          {offer.status === 'PENDING' && (
            <div className="flex flex-wrap gap-3 pt-4 border-t">
              {isReceived ? (
                <>
                  <button
                    onClick={() => handleAccept(offer.id)}
                    disabled={actionLoading === offer.id}
                    className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 font-bold flex items-center justify-center gap-2 transition"
                  >
                    {actionLoading === offer.id ? (
                      <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    ) : (
                      <>
                        <span>✅</span>
                        قبول العرض
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => handleReject(offer.id)}
                    disabled={actionLoading === offer.id}
                    className="flex-1 py-3 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-bold flex items-center justify-center gap-2 transition"
                  >
                    {actionLoading === offer.id ? (
                      <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                    ) : (
                      <>
                        <span>❌</span>
                        رفض العرض
                      </>
                    )}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => handleCancel(offer.id)}
                  disabled={actionLoading === offer.id}
                  className="py-3 px-6 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 disabled:opacity-50 font-bold flex items-center justify-center gap-2 transition"
                >
                  {actionLoading === offer.id ? (
                    <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600"></span>
                  ) : (
                    <>
                      <span>🚫</span>
                      إلغاء العرض
                    </>
                  )}
                </button>
              )}
            </div>
          )}

          {/* Complete Button for Accepted */}
          {offer.status === 'ACCEPTED' && (
            <div className="flex gap-3 pt-4 border-t">
              <button
                onClick={() => handleComplete(offer.id)}
                disabled={actionLoading === offer.id}
                className="flex-1 py-3 px-6 bg-purple-600 text-white rounded-xl hover:bg-purple-700 disabled:opacity-50 font-bold flex items-center justify-center gap-2 transition"
              >
                {actionLoading === offer.id ? (
                  <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                ) : (
                  <>
                    <span>🤝</span>
                    تأكيد إتمام التبادل
                  </>
                )}
              </button>
            </div>
          )}

          {/* Status Messages */}
          {offer.status === 'COMPLETED' && (
            <div className="text-center py-4 bg-blue-50 rounded-xl text-blue-700 mt-4">
              <span className="text-2xl block mb-2">✅</span>
              تم إتمام هذا التبادل بنجاح
            </div>
          )}

          {offer.status === 'REJECTED' && (
            <div className="text-center py-4 bg-red-50 rounded-xl text-red-700 mt-4">
              <span className="text-2xl block mb-2">❌</span>
              تم رفض هذا العرض
            </div>
          )}

          {offer.status === 'CANCELLED' && (
            <div className="text-center py-4 bg-gray-100 rounded-xl text-gray-600 mt-4">
              <span className="text-2xl block mb-2">🚫</span>
              تم إلغاء هذا العرض
            </div>
          )}
        </div>
      </div>
    );
  };

  const currentOffers = activeTab === 'received' ? receivedOffers : sentOffers;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-teal-600 via-teal-700 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/barter"
                className="text-teal-100 hover:text-white flex items-center gap-2 mb-2 transition"
              >
                → العودة للمقايضة
              </Link>
              <h1 className="text-3xl font-bold">عروض المقايضة</h1>
              <p className="text-teal-100 mt-1">إدارة العروض الواردة والصادرة</p>
            </div>
            <Link
              href="/barter/new"
              className="px-6 py-3 bg-white text-teal-600 rounded-xl hover:bg-gray-100 transition font-bold flex items-center gap-2 shadow-lg"
            >
              <span>➕</span>
              إنشاء عرض جديد
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-sm p-2 mb-8">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('received')}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition-colors flex items-center justify-center gap-3 ${
                activeTab === 'received'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">📥</span>
              عروض واردة
              {pendingReceivedCount > 0 && (
                <span className={`px-3 py-1 rounded-full text-sm ${
                  activeTab === 'received' ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'
                }`}>
                  {pendingReceivedCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('sent')}
              className={`flex-1 py-4 px-6 rounded-xl font-bold transition-colors flex items-center justify-center gap-3 ${
                activeTab === 'sent'
                  ? 'bg-teal-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="text-xl">📤</span>
              عروض صادرة
              <span className={`px-3 py-1 rounded-full text-sm ${
                activeTab === 'sent' ? 'bg-white text-teal-600' : 'bg-gray-300 text-gray-600'
              }`}>
                {sentOffers.length}
              </span>
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600 mb-4"></div>
            <p className="text-xl text-gray-600">جاري تحميل العروض...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <span className="text-5xl block mb-4">⚠️</span>
            <p className="text-red-600 text-lg mb-4">{error}</p>
            <button
              onClick={loadOffers}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-bold"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : currentOffers.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
            <span className="text-6xl block mb-4">{activeTab === 'received' ? '📥' : '📤'}</span>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {activeTab === 'received' ? 'لا توجد عروض واردة' : 'لا توجد عروض صادرة'}
            </h2>
            <p className="text-gray-500 mb-6">
              {activeTab === 'received'
                ? 'لم تتلق أي عروض مقايضة بعد'
                : 'لم ترسل أي عروض مقايضة بعد'}
            </p>
            <Link
              href="/barter/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-bold"
            >
              <span>➕</span>
              إنشاء عرض مقايضة
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {currentOffers.map((offer) => renderOfferCard(offer, activeTab === 'received'))}
          </div>
        )}
      </main>
    </div>
  );
}
