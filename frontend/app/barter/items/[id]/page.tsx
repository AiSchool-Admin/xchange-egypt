'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { getItem, Item, getMyItems } from '@/lib/api/items';
import { createBarterOffer, findMyMatchingItem, BarterMatch } from '@/lib/api/barter';
import { useAuth } from '@/lib/contexts/AuthContext';

interface MyItem {
  id: string;
  title: string;
  estimatedValue?: number;
  price?: number;
  images: Array<{ url: string; isPrimary: boolean }>;
}

export default function BarterItemDetailPage() {
  const router = useRouter();
  const params = useParams();
  const itemId = params.id as string;
  const { user } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [myItems, setMyItems] = useState<MyItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [matchingItem, setMatchingItem] = useState<BarterMatch | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [message, setMessage] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    loadItem();
  }, [itemId]);

  useEffect(() => {
    if (user && item && item.seller?.id !== user.id) {
      loadMyItems();
      checkForMatch();
    }
  }, [user, item]);

  const loadItem = async () => {
    try {
      setLoading(true);
      const response = await getItem(itemId);
      setItem(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل المنتج');
    } finally {
      setLoading(false);
    }
  };

  const loadMyItems = async () => {
    try {
      const response = await getMyItems();
      const availableItems = response.data.items.filter(
        (i: any) => i.status === 'ACTIVE' && i.id !== itemId
      );
      setMyItems(availableItems);
    } catch (err: any) {
      console.error('Failed to load my items:', err);
    }
  };

  const checkForMatch = async () => {
    try {
      const response = await findMyMatchingItem(itemId);
      if (response.data) {
        setMatchingItem(response.data);
      }
    } catch (err) {
      console.error('Failed to check for match:', err);
    }
  };

  const toggleItem = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSubmitOffer = async () => {
    if (selectedItems.length === 0) {
      setError('يرجى اختيار منتج واحد على الأقل للمقايضة');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      await createBarterOffer({
        offeredItemIds: selectedItems,
        requestedItemIds: [itemId],
        recipientId: item?.seller?.id,
        message,
      });

      setSuccess('تم إرسال عرض المقايضة بنجاح!');
      setShowOfferModal(false);
      setTimeout(() => router.push('/barter/my-offers'), 2000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إرسال العرض');
    } finally {
      setSubmitting(false);
    }
  };

  const conditionAr: Record<string, string> = {
    NEW: 'جديد',
    LIKE_NEW: 'كالجديد',
    GOOD: 'جيد',
    FAIR: 'مقبول',
    POOR: 'ضعيف',
    FOR_PARTS: 'للقطع',
    DAMAGED: 'تالف',
    SCRAP: 'خردة',
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-xl text-gray-800 font-bold">المنتج غير موجود</p>
          <Link
            href="/barter"
            className="mt-4 inline-block text-teal-600 hover:text-teal-700"
          >
            العودة لسوق المقايضة
          </Link>
        </div>
      </div>
    );
  }

  const primaryImage =
    item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url;
  const isOwner = user?.id === item.seller?.id;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-green-600 text-white">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link
            href="/barter"
            className="text-teal-100 hover:text-white flex items-center gap-2 mb-4"
          >
            ← العودة لسوق المقايضة
          </Link>
          <h1 className="text-2xl font-bold">🔄 تفاصيل المنتج للمقايضة</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Images */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-sm overflow-hidden">
              <div className="relative aspect-square">
                {item.images && item.images.length > 0 ? (
                  <img
                    src={item.images[currentImageIndex]?.url || primaryImage}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                    <span className="text-6xl">🔄</span>
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <span className="bg-teal-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                    متاح للمقايضة
                  </span>
                </div>
              </div>
            </div>

            {/* Thumbnails */}
            {item.images && item.images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto">
                {item.images.map((img, index) => (
                  <button
                    key={img.id || index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                      currentImageIndex === index
                        ? 'border-teal-500'
                        : 'border-transparent'
                    }`}
                  >
                    <img
                      src={img.url}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {item.title}
              </h2>

              {item.estimatedValue && (
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-gray-600">القيمة التقديرية:</span>
                  <span className="text-2xl font-bold text-teal-600">
                    {item.estimatedValue.toLocaleString()} ج.م
                  </span>
                </div>
              )}

              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <span className="font-medium">الحالة:</span>
                  <span className="bg-gray-100 px-3 py-1 rounded-full">
                    {conditionAr[item.condition] || item.condition}
                  </span>
                </div>

                {item.category && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">الفئة:</span>
                    <span>{item.category.nameAr || item.category.nameEn}</span>
                  </div>
                )}

                {(item.governorate || item.city) && (
                  <div className="flex items-center gap-2">
                    <span className="font-medium">الموقع:</span>
                    <span>
                      {item.city}
                      {item.city && item.governorate && '، '}
                      {item.governorate}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t">
                <h3 className="font-bold text-gray-900 mb-2">الوصف</h3>
                <p className="text-gray-600 whitespace-pre-wrap">
                  {item.description}
                </p>
              </div>

              {/* Desired Items Section */}
              {(item.desiredItemTitle ||
                item.desiredItemDescription ||
                item.desiredCategory) && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-bold text-gray-900 mb-3">
                    🎯 ما يبحث عنه البائع
                  </h3>
                  <div className="bg-teal-50 p-4 rounded-lg space-y-2">
                    {item.desiredItemTitle && (
                      <p className="text-teal-800">
                        <span className="font-medium">يريد:</span>{' '}
                        {item.desiredItemTitle}
                      </p>
                    )}
                    {item.desiredCategory && (
                      <p className="text-teal-800">
                        <span className="font-medium">الفئة المطلوبة:</span>{' '}
                        {item.desiredCategory.nameAr ||
                          item.desiredCategory.nameEn}
                      </p>
                    )}
                    {item.desiredItemDescription && (
                      <p className="text-teal-700 text-sm">
                        {item.desiredItemDescription}
                      </p>
                    )}
                    {(item.desiredValueMin || item.desiredValueMax) && (
                      <p className="text-teal-800">
                        <span className="font-medium">القيمة المتوقعة:</span>{' '}
                        {item.desiredValueMin?.toLocaleString()} -{' '}
                        {item.desiredValueMax?.toLocaleString()} ج.م
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Seller Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">معلومات البائع</h3>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center">
                  {item.seller?.avatar ? (
                    <img
                      src={item.seller.avatar}
                      alt=""
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl text-teal-600">
                      {item.seller?.fullName?.charAt(0) || '👤'}
                    </span>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-900">
                    {item.seller?.fullName || 'مستخدم'}
                  </p>
                  <p className="text-sm text-gray-500">
                    {item.seller?.userType === 'BUSINESS'
                      ? '🏢 تاجر'
                      : '👤 فرد'}
                  </p>
                </div>
              </div>
            </div>

            {/* Match Alert */}
            {matchingItem && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-green-900 mb-2">
                  🎉 لديك منتج مطابق!
                </h3>
                <p className="text-green-700 text-sm mb-3">
                  منتجك "{matchingItem.myItem.title}" يتطابق مع ما يبحث عنه
                  البائع
                </p>
                <button
                  onClick={() => {
                    setSelectedItems([matchingItem.myItem.id]);
                    setShowOfferModal(true);
                  }}
                  className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition"
                >
                  قدم عرض مقايضة فوري
                </button>
              </div>
            )}

            {/* Action Buttons */}
            {!isOwner && user && (
              <div className="space-y-3">
                <button
                  onClick={() => setShowOfferModal(true)}
                  className="w-full bg-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-teal-700 transition"
                >
                  🔄 قدم عرض مقايضة
                </button>
                <Link
                  href={`/messages?to=${item.seller?.id}`}
                  className="block w-full text-center border-2 border-teal-600 text-teal-600 py-4 rounded-xl font-bold hover:bg-teal-50 transition"
                >
                  💬 تواصل مع البائع
                </Link>
              </div>
            )}

            {!user && (
              <div className="bg-gray-100 rounded-xl p-6 text-center">
                <p className="text-gray-600 mb-4">
                  سجل دخولك لتقديم عرض مقايضة
                </p>
                <Link
                  href="/login"
                  className="inline-block bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition"
                >
                  تسجيل الدخول
                </Link>
              </div>
            )}

            {isOwner && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                <p className="text-yellow-800">هذا منتجك</p>
                <Link
                  href="/inventory"
                  className="text-yellow-700 hover:underline mt-2 inline-block"
                >
                  إدارة المخزون ←
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Offer Modal */}
      {showOfferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">قدم عرض مقايضة</h2>
                <button
                  onClick={() => setShowOfferModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Target Item */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3">
                  تريد مقايضة مقابل:
                </h3>
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={primaryImage || '/placeholder.png'}
                    alt={item.title}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-semibold">{item.title}</p>
                    {item.estimatedValue && (
                      <p className="text-sm text-teal-600">
                        {item.estimatedValue.toLocaleString()} ج.م
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Select Items to Offer */}
              <div>
                <h3 className="font-bold text-gray-700 mb-3">
                  اختر منتجاتك للمقايضة:
                </h3>
                {myItems.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-lg">
                    <p className="text-gray-600 mb-4">
                      ليس لديك منتجات متاحة للمقايضة
                    </p>
                    <Link
                      href="/inventory/add"
                      className="text-teal-600 hover:underline"
                    >
                      + أضف منتج جديد
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                    {myItems.map((myItem) => (
                      <button
                        key={myItem.id}
                        onClick={() => toggleItem(myItem.id)}
                        className={`p-3 rounded-lg border-2 text-right transition ${
                          selectedItems.includes(myItem.id)
                            ? 'border-teal-500 bg-teal-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              myItem.images?.find((img) => img.isPrimary)?.url ||
                              myItem.images?.[0]?.url ||
                              '/placeholder.png'
                            }
                            alt={myItem.title}
                            className="w-12 h-12 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {myItem.title}
                            </p>
                            <p className="text-xs text-teal-600">
                              {(myItem.estimatedValue || myItem.price)?.toLocaleString()}{' '}
                              ج.م
                            </p>
                          </div>
                          {selectedItems.includes(myItem.id) && (
                            <span className="text-teal-500">✓</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Message */}
              <div>
                <label className="block font-bold text-gray-700 mb-2">
                  رسالة للبائع (اختياري)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="اكتب رسالة للبائع..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                />
              </div>

              {/* Summary */}
              {selectedItems.length > 0 && (
                <div className="p-4 bg-teal-50 rounded-lg">
                  <p className="text-teal-800">
                    تعرض {selectedItems.length} منتج(ات) للمقايضة
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t flex gap-3">
              <button
                onClick={() => setShowOfferModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                إلغاء
              </button>
              <button
                onClick={handleSubmitOffer}
                disabled={submitting || selectedItems.length === 0}
                className="flex-1 bg-teal-600 text-white px-6 py-3 rounded-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'جاري الإرسال...' : 'إرسال العرض'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
