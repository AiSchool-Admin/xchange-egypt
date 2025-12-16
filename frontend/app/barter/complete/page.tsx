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
      setError('معرف العنصر غير موجود');
      setLoading(false);
    }
  }, [user, theirItemId]);

  const loadMatch = async (itemId: string) => {
    try {
      setLoading(true);
      const response = await findMyMatchingItem(itemId);

      if (response.data) {
        if (myItemId && response.data.myItem.id !== myItemId) {
          // Find item matches but not the specific one from URL - this is OK
        }
        setMatch(response.data);
      } else {
        setError('لم يتم العثور على عنصر مطابق');
      }
    } catch (err: any) {
      console.error('Error loading match:', err);
      setError(err.response?.data?.message || 'فشل في تحميل المطابقة');
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

    try {
      await createBarterOffer(offerData);
      setSuccess(true);
    } catch (err: any) {
      console.error('[BarterComplete] Error creating barter offer:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || 'فشل في إنشاء عرض المقايضة';
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600 text-lg">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error && !match) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50" dir="rtl">
        <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">❌</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">حدث خطأ</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/barter"
            className="inline-flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-teal-700 transition"
          >
            <span>←</span>
            العودة لسوق المقايضة
          </Link>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-teal-50" dir="rtl">
        <div className="text-center max-w-lg mx-auto p-8 bg-white rounded-3xl shadow-2xl">
          {/* Success Animation */}
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <span className="text-5xl">🎉</span>
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute -bottom-2 -left-2 w-6 h-6 bg-teal-400 rounded-full animate-ping delay-300"></div>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            تم إرسال عرض المقايضة بنجاح!
          </h1>
          <p className="text-gray-600 mb-6 text-lg">
            سيتم إعلام <span className="font-bold text-teal-600">{match?.theirItem.seller?.fullName}</span> بعرضك وسيتمكن من قبوله أو رفضه.
          </p>

          {/* What's Next */}
          <div className="bg-teal-50 rounded-2xl p-6 mb-6 text-right">
            <h3 className="font-bold text-teal-800 mb-3 flex items-center gap-2">
              <span>📋</span>
              الخطوات التالية
            </h3>
            <ul className="space-y-2 text-teal-700">
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-teal-200 rounded-full flex items-center justify-center text-sm">1</span>
                انتظر رد الطرف الآخر
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-teal-200 rounded-full flex items-center justify-center text-sm">2</span>
                تواصل معه عند القبول
              </li>
              <li className="flex items-center gap-2">
                <span className="w-6 h-6 bg-teal-200 rounded-full flex items-center justify-center text-sm">3</span>
                أتم عملية التبادل
              </li>
            </ul>
          </div>

          <div className="flex gap-4">
            <Link
              href="/barter/my-offers"
              className="flex-1 bg-gradient-to-l from-teal-500 to-emerald-500 text-white px-6 py-4 rounded-xl font-bold hover:from-teal-600 hover:to-emerald-600 transition shadow-lg flex items-center justify-center gap-2"
            >
              <span>📋</span>
              عروضي
            </Link>
            <Link
              href="/barter"
              className="flex-1 border-2 border-gray-200 text-gray-700 px-6 py-4 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
            >
              <span>🔄</span>
              تصفح المزيد
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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-teal-600 via-emerald-600 to-green-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-yellow-300 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-8">
          <Link
            href={`/barter/items/${theirItemId}`}
            className="text-teal-200 hover:text-white flex items-center gap-2 mb-4 w-fit transition"
          >
            → العودة للمنتج
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
              🔄
            </div>
            <div>
              <h1 className="text-3xl font-bold">إتمام المقايضة</h1>
              <p className="text-teal-200 mt-1">تأكيد عرض المقايضة بين المنتجات المتطابقة</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-600 font-medium flex-1">{error}</p>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        {/* Match Display */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          {/* Match Header */}
          <div className="bg-gradient-to-l from-green-500 to-emerald-500 text-white px-6 py-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-3xl">🎯</span>
              <h2 className="text-xl font-bold">تطابق مثالي!</h2>
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              {/* My Item */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-5 rounded-2xl border-2 border-orange-200">
                <p className="text-sm text-orange-600 font-bold mb-3 text-center flex items-center justify-center gap-2">
                  <span>🎁</span>
                  ما ستقدمه
                </p>
                <div className="aspect-square bg-white rounded-xl overflow-hidden mb-3 shadow-sm">
                  {getItemImage(match.myItem) ? (
                    <img
                      src={getItemImage(match.myItem)}
                      alt={match.myItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl bg-gray-50">
                      📦
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-1">
                  {match.myItem.title}
                </h3>
                <p className="text-orange-600 font-bold text-center text-lg">
                  {match.myItem.estimatedValue.toLocaleString('ar-EG')} ج.م
                </p>
                {match.myItem.category && (
                  <p className="text-xs text-gray-500 text-center mt-2 bg-white px-3 py-1 rounded-full">
                    {match.myItem.category.nameAr || match.myItem.category.nameEn}
                  </p>
                )}
              </div>

              {/* Exchange Arrow */}
              <div className="flex justify-center items-center">
                <div className="w-20 h-20 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-4xl">⇄</span>
                </div>
              </div>

              {/* Their Item */}
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-5 rounded-2xl border-2 border-green-200">
                <p className="text-sm text-green-600 font-bold mb-3 text-center flex items-center justify-center gap-2">
                  <span>✨</span>
                  ما ستحصل عليه
                </p>
                <div className="aspect-square bg-white rounded-xl overflow-hidden mb-3 shadow-sm">
                  {getItemImage(match.theirItem) ? (
                    <img
                      src={getItemImage(match.theirItem)}
                      alt={match.theirItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-4xl bg-gray-50">
                      📦
                    </div>
                  )}
                </div>
                <h3 className="font-bold text-gray-900 text-center mb-1">
                  {match.theirItem.title}
                </h3>
                <p className="text-green-600 font-bold text-center text-lg">
                  {match.theirItem.estimatedValue.toLocaleString('ar-EG')} ج.م
                </p>
                {match.theirItem.category && (
                  <p className="text-xs text-gray-500 text-center mt-2 bg-white px-3 py-1 rounded-full">
                    {match.theirItem.category.nameAr || match.theirItem.category.nameEn}
                  </p>
                )}
                {match.theirItem.seller && (
                  <p className="text-xs text-gray-500 text-center mt-2 flex items-center justify-center gap-1">
                    <span>👤</span>
                    {match.theirItem.seller.fullName}
                  </p>
                )}
              </div>
            </div>

            {/* Value Comparison */}
            <div className={`mt-6 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4 ${
              isBalanced ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isBalanced ? 'bg-green-200' : 'bg-yellow-200'}`}>
                  <span className="text-2xl">{isBalanced ? '✅' : '⚠️'}</span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">
                    {isBalanced ? 'تبادل متوازن' : 'فرق في القيمة'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {isBalanced
                      ? 'الفرق في القيمة ضمن 20%'
                      : valueDiff > 0
                        ? `أنت تقدم ${valueDiff.toLocaleString('ar-EG')} ج.م أكثر`
                        : `أنت تطلب ${Math.abs(valueDiff).toLocaleString('ar-EG')} ج.م أكثر`
                    }
                  </p>
                </div>
              </div>
              <div className="text-center sm:text-left bg-white px-4 py-2 rounded-xl">
                <p className="text-sm text-gray-600">عرضك: <span className="font-bold text-orange-600">{match.myItem.estimatedValue.toLocaleString('ar-EG')} ج.م</span></p>
                <p className="text-sm text-gray-600">طلبك: <span className="font-bold text-green-600">{match.theirItem.estimatedValue.toLocaleString('ar-EG')} ج.م</span></p>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <label className="block font-bold text-gray-700 mb-3 flex items-center gap-2">
            <span className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">💬</span>
            رسالة للبائع (اختياري)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="أضف رسالة مع عرض المقايضة..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 px-6 py-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition font-bold flex items-center justify-center gap-2"
          >
            <span>✕</span>
            إلغاء
          </button>
          <button
            onClick={handleConfirmBarter}
            disabled={submitting}
            className="flex-1 bg-gradient-to-l from-teal-500 to-emerald-500 text-white px-6 py-4 rounded-xl hover:from-teal-600 hover:to-emerald-600 transition font-bold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg flex items-center justify-center gap-2"
          >
            {submitting ? (
              <>
                <span className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></span>
                جاري الإرسال...
              </>
            ) : (
              <>
                <span>✅</span>
                تأكيد عرض المقايضة
              </>
            )}
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-5 bg-gradient-to-l from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-xl">💡</span>
            </div>
            <div>
              <p className="font-bold text-blue-900 mb-1">ملاحظة مهمة</p>
              <p className="text-sm text-blue-800">
                سيتم إرسال عرض المقايضة إلى <span className="font-bold">{match.theirItem.seller?.fullName}</span>.
                سيتمكن من قبول العرض أو رفضه. في حالة القبول، يمكنكم التواصل لإتمام عملية التبادل بأمان.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
