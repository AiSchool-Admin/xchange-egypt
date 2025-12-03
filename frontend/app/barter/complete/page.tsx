'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { findMyMatchingItem, BarterMatch, createBarterOffer } from '@/lib/api/barter';
import { useAuth } from '@/lib/contexts/AuthContext';

export default function BarterCompletePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const theirItemId = searchParams.get('theirItem');
  const myItemId = searchParams.get('myItem');

  const [match, setMatch] = useState<BarterMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (theirItemId) {
      loadMatch(theirItemId);
    } else {
      setError('معرف العنصر غير موجود / Item ID not found');
      setLoading(false);
    }
  }, [user, theirItemId]);

  const loadMatch = async (itemId: string) => {
    try {
      setLoading(true);
      const response = await findMyMatchingItem(itemId);

      if (response.data) {
        // If myItemId is specified in URL, verify it matches
        if (myItemId && response.data.myItem.id !== myItemId) {
          // Find item matches but not the specific one from URL
          // This is OK, we'll use what we found
        }
        setMatch(response.data);
      } else {
        setError('لم يتم العثور على عنصر مطابق / No matching item found');
      }
    } catch (err: any) {
      console.error('Error loading match:', err);
      setError(err.response?.data?.message || 'فشل في تحميل المطابقة / Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmBarter = async () => {
    if (!match) return;

    setSubmitting(true);
    setError('');

    const offerData = {
      offeredItemIds: [match.myItem.id],
      requestedItemIds: [match.theirItem.id],
      recipientId: match.theirItem.sellerId,
      message: message || `مقايضة: "${match.myItem.title}" مقابل "${match.theirItem.title}"`,
    };

    console.log('[BarterComplete] Creating offer with:', offerData);

    try {
      await createBarterOffer(offerData);
      setSuccess(true);
    } catch (err: any) {
      console.error('[BarterComplete] Error creating barter offer:', err);
      console.error('[BarterComplete] Error response:', err.response?.data);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'فشل في إنشاء عرض المقايضة / Failed to create barter offer';
      setError(errorMsg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!user) {
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل... / Loading...</p>
        </div>
      </div>
    );
  }

  if (error && !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">❌</div>
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link
            href="/barter"
            className="inline-block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition"
          >
            العودة للمقايضات / Back to Barter
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
          <div className="text-6xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-green-600 mb-2">
            تم إرسال عرض المقايضة!
          </h1>
          <p className="text-gray-600 mb-6">
            Barter offer sent successfully!
          </p>
          <p className="text-gray-500 text-sm mb-6">
            سيتم إعلام {match?.theirItem.seller?.fullName} بعرضك وسيتمكن من قبوله أو رفضه.
          </p>
          <div className="flex gap-3">
            <Link
              href="/barter/my-offers"
              className="flex-1 bg-purple-600 text-white px-4 py-3 rounded-lg hover:bg-purple-700 transition font-semibold"
            >
              عروضي / My Offers
            </Link>
            <Link
              href="/"
              className="flex-1 border border-gray-300 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              الرئيسية / Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!match) {
    return null;
  }

  const getItemImage = (item: BarterMatch['myItem'] | BarterMatch['theirItem']) => {
    const primaryImage = item.images?.find(img => img.isPrimary);
    return primaryImage?.url || item.images?.[0]?.url;
  };

  const valueDiff = match.myItem.estimatedValue - match.theirItem.estimatedValue;
  const isBalanced = Math.abs(valueDiff) <= Math.max(match.myItem.estimatedValue, match.theirItem.estimatedValue) * 0.2;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href={`/items/${theirItemId}`}
            className="text-purple-200 hover:text-white flex items-center gap-2 mb-4"
          >
            ← العودة للعنصر / Back to Item
          </Link>
          <h1 className="text-3xl font-bold">🔄 إتمام المقايضة / Complete Barter</h1>
          <p className="text-purple-200 mt-2">
            تأكيد عرض المقايضة بين العناصر المتطابقة
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Match Display */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-6">
          <div className="p-6">
            <div className="flex items-center justify-center gap-2 mb-6">
              <span className="text-2xl">🎯</span>
              <h2 className="text-xl font-bold text-gray-900">تطابق مثالي! / Perfect Match!</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* My Item */}
              <div className="bg-green-50 p-4 rounded-lg border-2 border-green-200">
                <p className="text-sm text-green-700 font-semibold mb-3 text-center">
                  🎁 ما ستقدمه / What You Offer
                </p>
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3">
                  {getItemImage(match.myItem) ? (
                    <img
                      src={getItemImage(match.myItem)}
                      alt={match.myItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      📦
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-1">
                  {match.myItem.title}
                </h3>
                <p className="text-green-600 font-semibold text-center">
                  {match.myItem.estimatedValue.toLocaleString()} ج.م
                </p>
                {match.myItem.category && (
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {match.myItem.category.nameAr || match.myItem.category.nameEn}
                  </p>
                )}
              </div>

              {/* Exchange Arrow */}
              <div className="flex justify-center items-center">
                <div className="text-5xl">⇄</div>
              </div>

              {/* Their Item */}
              <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                <p className="text-sm text-blue-700 font-semibold mb-3 text-center">
                  🎯 ما ستحصل عليه / What You Get
                </p>
                <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3">
                  {getItemImage(match.theirItem) ? (
                    <img
                      src={getItemImage(match.theirItem)}
                      alt={match.theirItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl">
                      📦
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-1">
                  {match.theirItem.title}
                </h3>
                <p className="text-blue-600 font-semibold text-center">
                  {match.theirItem.estimatedValue.toLocaleString()} ج.م
                </p>
                {match.theirItem.category && (
                  <p className="text-xs text-gray-500 text-center mt-1">
                    {match.theirItem.category.nameAr || match.theirItem.category.nameEn}
                  </p>
                )}
                {match.theirItem.seller && (
                  <p className="text-xs text-gray-500 text-center mt-1">
                    👤 {match.theirItem.seller.fullName}
                  </p>
                )}
              </div>
            </div>

            {/* Value Comparison */}
            <div className={`mt-6 p-4 rounded-lg ${
              isBalanced ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-semibold text-gray-900">
                    {isBalanced ? '✅ تبادل متوازن' : '⚠️ فرق في القيمة'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isBalanced
                      ? 'الفرق في القيمة ضمن 20%'
                      : valueDiff > 0
                        ? `أنت تقدم ${valueDiff.toLocaleString()} ج.م أكثر`
                        : `أنت تطلب ${Math.abs(valueDiff).toLocaleString()} ج.م أكثر`
                    }
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">عرضك: {match.myItem.estimatedValue.toLocaleString()} ج.م</p>
                  <p className="text-sm text-gray-600">طلبك: {match.theirItem.estimatedValue.toLocaleString()} ج.م</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            رسالة للبائع (اختياري) / Message to Seller (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="أضف رسالة مع عرض المقايضة... / Add a message with your barter offer..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-semibold text-gray-700"
          >
            إلغاء / Cancel
          </button>
          <button
            onClick={handleConfirmBarter}
            disabled={submitting}
            className="flex-1 bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <span className="flex items-center justify-center gap-2">
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                جاري الإرسال...
              </span>
            ) : (
              '✅ تأكيد عرض المقايضة / Confirm Barter Offer'
            )}
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>ملاحظة:</strong> سيتم إرسال عرض المقايضة إلى {match.theirItem.seller?.fullName}.
            سيتمكن من قبول العرض أو رفضه. في حالة القبول، يمكنكم التواصل لإتمام التبادل.
          </p>
        </div>
      </div>
    </div>
  );
}
