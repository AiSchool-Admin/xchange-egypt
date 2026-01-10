'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getBarterOffer, acceptBarterOffer, BarterOffer } from '@/lib/api/barter';
import { getMyItems } from '@/lib/api/items';
import { useAuth } from '@/lib/contexts/AuthContext';

interface SelectableItem {
  id: string;
  title: string;
  estimatedValue?: number;
  price?: number;
  images: Array<{ url: string; isPrimary: boolean }>;
  description?: string;
}

export default function RespondToOfferPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const offerId = params.id as string;
  const preselectedOfferId = searchParams.get('offer');
  const { user } = useAuth();

  const [offer, setOffer] = useState<BarterOffer | null>(null);
  const [myItems, setMyItems] = useState<SelectableItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [cashOffer, setCashOffer] = useState(0);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user, offerId]);

  useEffect(() => {
    if (preselectedOfferId && myItems.length > 0) {
      const exists = myItems.some(item => item.id === preselectedOfferId);
      if (exists && !selectedItems.includes(preselectedOfferId)) {
        setSelectedItems([preselectedOfferId]);
      }
    }
  }, [preselectedOfferId, myItems]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [offerResponse, itemsResponse] = await Promise.all([
        getBarterOffer(offerId),
        getMyItems(),
      ]);
      setOffer(offerResponse.data);
      setMyItems(itemsResponse.data.items.filter((item: any) => item.status === 'ACTIVE'));
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل تفاصيل العرض');
    } finally {
      setLoading(false);
    }
  };

  const toggleItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const selectedItemsValue = myItems
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.estimatedValue || item.price || 0), 0);

  const totalOfferValue = selectedItemsValue + cashOffer;

  const handleSubmit = async () => {
    if (selectedItems.length === 0 && cashOffer === 0) {
      setError('يرجى اختيار منتج واحد على الأقل أو إضافة مبلغ نقدي');
      return;
    }

    try {
      setSubmitting(true);
      setError('');
      await acceptBarterOffer(offerId);
      router.push('/barter/complete?success=true');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إرسال الرد');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">جاري تحميل العرض...</p>
        </div>
      </div>
    );
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <span className="text-6xl block mb-4">🔍</span>
          <h2 className="text-xl font-bold text-gray-900 mb-2">العرض غير موجود</h2>
          <p className="text-gray-600 mb-6">قد يكون العرض قد انتهى أو تم حذفه</p>
          <Link href="/barter/open-offers" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition">
            العودة للعروض المفتوحة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-teal-600 via-emerald-600 to-green-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link
            href="/barter/open-offers"
            className="text-teal-200 hover:text-white flex items-center gap-2 mb-4 transition w-fit"
          >
            → العودة للعروض المفتوحة
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
              🤝
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">الرد على عرض المقايضة</h1>
              <p className="text-teal-200">
                اختر منتجاتك للتبادل مع {offer.initiator?.fullName || 'المستخدم'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-600 font-medium flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Offer Details */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-l from-green-50 to-emerald-50 px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">📋</span>
                  تفاصيل العرض
                </h2>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 font-bold text-xl">
                    {offer.initiator?.fullName?.charAt(0) || '👤'}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg">{offer.initiator?.fullName || 'مستخدم'}</h3>
                    <p className="text-gray-500">يعرض هذه المقايضة</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* What they're offering */}
                  <div className="bg-green-50 p-5 rounded-xl">
                    <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                      <span>📦</span>
                      يعرض:
                    </h4>
                    <p className="text-gray-700 font-medium mb-2">
                      {offer.offeredItemIds?.length || 0} منتج
                    </p>
                    {offer.offeredBundleValue && (
                      <p className="text-green-600 font-bold text-lg">
                        ~{offer.offeredBundleValue.toLocaleString('ar-EG')} ج.م
                      </p>
                    )}
                  </div>

                  {/* What they want */}
                  <div className="bg-blue-50 p-5 rounded-xl">
                    <h4 className="font-bold text-blue-700 mb-3 flex items-center gap-2">
                      <span>🎯</span>
                      يريد:
                    </h4>
                    {offer.itemRequests && offer.itemRequests.length > 0 ? (
                      <div className="space-y-2">
                        {offer.itemRequests.map((req) => (
                          <p key={req.id} className="text-gray-700">
                            • {req.description}
                          </p>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500">أي منتجات مناسبة للتبادل</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Select Your Items */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="bg-gradient-to-l from-purple-50 to-indigo-50 px-6 py-4 border-b">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <span className="text-xl">🎁</span>
                  اختر منتجاتك للتبادل ({selectedItems.length})
                </h2>
              </div>
              <div className="p-6">
                {myItems.length === 0 ? (
                  <div className="text-center py-8">
                    <span className="text-5xl block mb-4">📦</span>
                    <h3 className="font-bold text-gray-800 mb-2">لا توجد منتجات</h3>
                    <p className="text-gray-600 mb-4">أضف منتجاتك أولاً للتبادل</p>
                    <Link
                      href="/listing/new"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition"
                    >
                      <span>➕</span>
                      أضف منتج جديد
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-80 overflow-y-auto">
                    {myItems.map((item) => {
                      const isSelected = selectedItems.includes(item.id);
                      const primaryImage =
                        item.images?.find((img) => img.isPrimary)?.url ||
                        item.images?.[0]?.url;

                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => toggleItem(item.id)}
                          className={`p-4 rounded-2xl border-2 transition-all text-right ${
                            isSelected
                              ? 'border-teal-500 bg-teal-50 shadow-lg'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow'
                          }`}
                        >
                          <div className="flex gap-4">
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                              {primaryImage ? (
                                <img src={primaryImage} alt={item.title} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">📦</div>
                              )}
                              {isSelected && (
                                <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                                  <span className="w-6 h-6 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate text-sm">{item.title}</h4>
                              <p className="text-xs text-gray-500 line-clamp-1">{item.description}</p>
                              <p className="text-teal-600 font-bold mt-1">
                                {(item.estimatedValue || item.price || 0).toLocaleString('ar-EG')} ج.م
                              </p>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}

                {/* Cash */}
                <div className="mt-6 pt-6 border-t">
                  <label className="block font-bold text-gray-800 mb-3 flex items-center gap-2">
                    <span className="text-xl">💰</span>
                    إضافة مبلغ نقدي (اختياري)
                  </label>
                  <div className="relative max-w-xs">
                    <input
                      type="number"
                      min="0"
                      value={cashOffer || ''}
                      onChange={(e) => setCashOffer(Number(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">ج.م</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <label className="block font-bold text-gray-800 mb-3 flex items-center gap-2">
                <span className="text-xl">💬</span>
                رسالة (اختياري)
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                placeholder="أضف رسالة شخصية للتفاوض..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">📊</span>
                ملخص عرضك
              </h3>

              {selectedItems.length > 0 && (
                <div className="space-y-2 mb-4">
                  {myItems
                    .filter((item) => selectedItems.includes(item.id))
                    .map((item) => (
                      <div key={item.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700 truncate flex-1">{item.title}</span>
                        <span className="text-sm text-teal-600 font-bold whitespace-nowrap">
                          {(item.estimatedValue || item.price || 0).toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                    ))}
                </div>
              )}

              {cashOffer > 0 && (
                <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-lg mb-4">
                  <span className="text-sm font-medium text-gray-700">💰 مبلغ نقدي</span>
                  <span className="text-sm text-amber-600 font-bold mr-auto">
                    {cashOffer.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>
              )}

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center mb-6">
                  <span className="font-bold text-gray-700">إجمالي قيمة عرضك:</span>
                  <span className="text-2xl font-bold text-teal-600">
                    {totalOfferValue.toLocaleString('ar-EG')} ج.م
                  </span>
                </div>

                {/* Chat Button */}
                <button
                  type="button"
                  onClick={() => router.push(`/messages?userId=${offer.initiator?.id}`)}
                  className="w-full px-4 py-3 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition font-bold mb-3 flex items-center justify-center gap-2"
                >
                  <span>💬</span>
                  تواصل مع {offer.initiator?.fullName?.split(' ')[0] || 'المستخدم'} للتفاوض
                </button>

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={submitting || (selectedItems.length === 0 && cashOffer === 0)}
                  className="w-full px-4 py-4 bg-gradient-to-l from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      إرسال عرض المقايضة
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-full mt-3 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition font-bold"
                >
                  إلغاء
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
