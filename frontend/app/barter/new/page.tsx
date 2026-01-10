'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createBarterOffer } from '@/lib/api/barter';
import { getMyItems } from '@/lib/api/items';
import { getBarterItems } from '@/lib/api/barter';
import { getRootCategories, Category } from '@/lib/api/categories';
import { useAuth } from '@/lib/contexts/AuthContext';

interface SelectableItem {
  id: string;
  title: string;
  description: string;
  price?: number;
  estimatedValue?: number;
  images: Array<{ url: string; isPrimary: boolean }>;
  category?: { id: string; nameEn: string; nameAr?: string };
  seller?: { id: string; fullName: string };
}

export default function CreateBarterOfferPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  // Items
  const [myItems, setMyItems] = useState<SelectableItem[]>([]);
  const [availableItems, setAvailableItems] = useState<SelectableItem[]>([]);
  const [loadingMyItems, setLoadingMyItems] = useState(true);
  const [loadingAvailableItems, setLoadingAvailableItems] = useState(true);

  // Selected items
  const [selectedOfferedItems, setSelectedOfferedItems] = useState<string[]>([]);
  const [selectedRequestedItems, setSelectedRequestedItems] = useState<string[]>([]);
  const [message, setMessage] = useState('');

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Request mode and preferences
  const [requestMode, setRequestMode] = useState<'select' | 'describe'>('select');
  const [requestDescription, setRequestDescription] = useState('');
  const [requestParentCategory, setRequestParentCategory] = useState('');
  const [requestSubCategory, setRequestSubCategory] = useState('');
  const [requestSubSubCategory, setRequestSubSubCategory] = useState('');
  const [requestKeywords, setRequestKeywords] = useState('');
  const [requestValueMin, setRequestValueMin] = useState('');
  const [requestValueMax, setRequestValueMax] = useState('');
  const [offeredCash, setOfferedCash] = useState(0);
  const [requestedCash, setRequestedCash] = useState(0);

  // Category hierarchy (3 levels)
  const parentCategories = categories;
  const selectedParent = categories.find(cat => cat.id === requestParentCategory);
  const subCategories = selectedParent?.children || [];
  const selectedSub = subCategories.find(cat => cat.id === requestSubCategory);
  const subSubCategories = selectedSub?.children || [];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadCategories();
    loadMyItems();
    loadAvailableItems();
  }, [user]);

  const loadCategories = async () => {
    try {
      const response = await getRootCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  };

  const loadMyItems = async () => {
    try {
      setLoadingMyItems(true);
      const response = await getMyItems();
      const items = Array.isArray(response?.data?.items) ? response.data.items : [];
      const availableItems = items.filter(
        (item: any) => item.status === 'ACTIVE'
      );
      setMyItems(availableItems);
    } catch (err: any) {
      console.error('Failed to load my items:', err);
      setError('فشل في تحميل منتجاتك. حاول مرة أخرى.');
      setMyItems([]);
    } finally {
      setLoadingMyItems(false);
    }
  };

  const loadAvailableItems = async () => {
    try {
      setLoadingAvailableItems(true);
      const response = await getBarterItems({ limit: 50 });
      const items = Array.isArray(response?.data?.items) ? response.data.items : [];
      const filtered = items.filter(
        (item) => item.seller?.id && item.seller.id !== user?.id
      );
      setAvailableItems(filtered);
    } catch (err: any) {
      console.error('Failed to load available items:', err);
      setAvailableItems([]);
    } finally {
      setLoadingAvailableItems(false);
    }
  };

  const toggleOfferedItem = (itemId: string) => {
    setSelectedOfferedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const toggleRequestedItem = (itemId: string) => {
    setSelectedRequestedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  // Calculate total values
  const offeredItemsValue = myItems
    .filter((item) => selectedOfferedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.estimatedValue || item.price || 0), 0);

  const requestedItemsValue = availableItems
    .filter((item) => selectedRequestedItems.includes(item.id))
    .reduce((sum, item) => sum + (item.estimatedValue || item.price || 0), 0);

  const totalOfferedValue = offeredItemsValue + offeredCash;
  const totalRequestedValue = requestedItemsValue + requestedCash;
  const valueDifference = totalOfferedValue - totalRequestedValue;
  const isBalanced = Math.abs(valueDifference) <= totalOfferedValue * 0.2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedOfferedItems.length === 0 && offeredCash === 0) {
      setError('يرجى اختيار منتج واحد على الأقل للعرض أو إضافة مبلغ نقدي');
      return;
    }

    if (requestMode === 'select' && selectedRequestedItems.length === 0 && requestedCash === 0) {
      setError('يرجى اختيار منتج واحد على الأقل تريده أو إضافة مبلغ نقدي');
      return;
    }

    if (requestMode === 'describe') {
      if (!requestDescription.trim()) {
        setError('يرجى وصف ما تبحث عنه');
        return;
      }
      if (!requestParentCategory) {
        setError('يرجى اختيار فئة');
        return;
      }
      if (!requestKeywords.trim()) {
        setError('يرجى إدخال كلمات مفتاحية');
        return;
      }
      if (!requestValueMin || parseFloat(requestValueMin) <= 0) {
        setError('يرجى إدخال قيمة دنيا صحيحة');
        return;
      }
      if (!requestValueMax || parseFloat(requestValueMax) <= 0) {
        setError('يرجى إدخال قيمة قصوى صحيحة');
        return;
      }
      if (parseFloat(requestValueMin) > parseFloat(requestValueMax)) {
        setError('القيمة الدنيا لا يمكن أن تكون أكبر من القيمة القصوى');
        return;
      }
    }

    setLoading(true);
    setError('');

    try {
      let recipientId: string | undefined;
      if (requestMode === 'select' && selectedRequestedItems.length > 0) {
        const selectedItems = availableItems.filter((item) =>
          selectedRequestedItems.includes(item.id)
        );
        const sellerIds = [...new Set(selectedItems.map((item) => item.seller?.id).filter(Boolean))];
        recipientId = sellerIds.length === 1 ? sellerIds[0] : undefined;
      }

      const offerData = {
        offeredItemIds: selectedOfferedItems,
        requestedItemIds: requestMode === 'select' ? selectedRequestedItems : [],
        recipientId,
        message: message || undefined,
        offeredCashAmount: offeredCash,
        requestedCashAmount: requestedCash,
        itemRequest: requestMode === 'describe' ? {
          description: requestDescription,
          categoryId: requestParentCategory,
          subcategoryId: requestSubCategory || undefined,
          subSubcategoryId: requestSubSubCategory || undefined,
          keywords: requestKeywords.split(',').map(k => k.trim()).filter(k => k.length > 0),
          minPrice: parseFloat(requestValueMin),
          maxPrice: parseFloat(requestValueMax),
        } : undefined,
      };

      await createBarterOffer(offerData);
      router.push('/barter/my-offers');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إنشاء عرض المقايضة');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const selectedOfferedDetails = myItems.filter((item) =>
    selectedOfferedItems.includes(item.id)
  );
  const selectedRequestedDetails = availableItems.filter((item) =>
    selectedRequestedItems.includes(item.id)
  );

  // Steps data
  const steps = [
    { number: 1, title: 'ما تعرضه', icon: '📦' },
    { number: 2, title: 'ما تريده', icon: '🎯' },
    { number: 3, title: 'مراجعة وإرسال', icon: '✅' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-teal-600 via-emerald-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link
            href="/barter"
            className="text-teal-100 hover:text-white flex items-center gap-2 mb-4 transition"
          >
            → العودة لسوق المقايضة
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
              🔄
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold">إنشاء عرض مقايضة جديد</h1>
              <p className="text-teal-100 mt-1">
                اعرض منتجاتك واحصل على ما تريد بدون نقود!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <button
                  onClick={() => setCurrentStep(step.number)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition ${
                    currentStep === step.number
                      ? 'bg-teal-100 text-teal-700'
                      : currentStep > step.number
                        ? 'text-teal-600'
                        : 'text-gray-400'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep === step.number
                      ? 'bg-teal-600 text-white'
                      : currentStep > step.number
                        ? 'bg-teal-200 text-teal-700'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.number ? '✓' : step.icon}
                  </span>
                  <span className="hidden sm:block font-medium">{step.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-20 h-1 mx-2 rounded ${
                    currentStep > step.number ? 'bg-teal-400' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3">
            <span className="text-2xl">⚠️</span>
            <p className="text-red-600 font-medium">{error}</p>
            <button onClick={() => setError('')} className="mr-auto text-red-400 hover:text-red-600">✕</button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Step 1: What I'm Offering */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-l from-orange-500 to-amber-500 text-white px-6 py-4">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span className="text-2xl">📦</span>
                    اختر المنتجات التي تريد عرضها
                  </h2>
                  <p className="text-orange-100 mt-1">يمكنك اختيار أكثر من منتج</p>
                </div>

                <div className="p-6">
                  {/* My Items */}
                  {loadingMyItems ? (
                    <div className="text-center py-12">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-600 border-t-transparent mb-4"></div>
                      <p className="text-gray-600">جاري تحميل منتجاتك...</p>
                    </div>
                  ) : myItems.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-2xl">
                      <span className="text-6xl block mb-4">📦</span>
                      <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد منتجات</h3>
                      <p className="text-gray-600 mb-4">أضف منتجاتك أولاً لتتمكن من المقايضة</p>
                      <Link
                        href="/listing/new"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition"
                      >
                        <span>➕</span>
                        أضف منتج جديد
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myItems.map((item) => {
                        const isSelected = selectedOfferedItems.includes(item.id);
                        const primaryImage =
                          item.images?.find((img) => img.isPrimary)?.url ||
                          item.images?.[0]?.url;

                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => toggleOfferedItem(item.id)}
                            className={`p-4 rounded-2xl border-2 transition-all text-right ${
                              isSelected
                                ? 'border-teal-500 bg-teal-50 shadow-lg'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow'
                            }`}
                          >
                            <div className="flex gap-4">
                              <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                {primaryImage ? (
                                  <img
                                    src={primaryImage}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-3xl text-gray-400">📦</div>
                                )}
                                {isSelected && (
                                  <div className="absolute inset-0 bg-teal-500/20 flex items-center justify-center">
                                    <span className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center font-bold">✓</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-gray-900 truncate mb-1">
                                  {item.title}
                                </h4>
                                <p className="text-sm text-gray-500 line-clamp-1 mb-2">
                                  {item.description}
                                </p>
                                <p className="text-lg font-bold text-teal-600">
                                  {(item.estimatedValue || item.price || 0).toLocaleString('ar-EG')} ج.م
                                </p>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Cash Offered */}
                  <div className="mt-6 pt-6 border-t">
                    <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      إضافة مبلغ نقدي (اختياري)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1 max-w-xs">
                        <input
                          type="number"
                          min="0"
                          value={offeredCash || ''}
                          onChange={(e) => setOfferedCash(Number(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-lg"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">ج.م</span>
                      </div>
                      <p className="text-gray-500">لموازنة الصفقة عند الحاجة</p>
                    </div>
                  </div>

                  {/* Summary */}
                  {(selectedOfferedItems.length > 0 || offeredCash > 0) && (
                    <div className="mt-6 p-4 bg-gradient-to-l from-teal-50 to-emerald-50 rounded-2xl border border-teal-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 mb-1">ما تعرضه:</p>
                          <p className="font-bold text-gray-800">
                            {selectedOfferedItems.length} منتج
                            {offeredCash > 0 && ` + ${offeredCash.toLocaleString('ar-EG')} ج.م نقداً`}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-gray-600 mb-1">إجمالي القيمة:</p>
                          <p className="text-2xl font-bold text-teal-600">
                            {totalOfferedValue.toLocaleString('ar-EG')} ج.م
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Button */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={selectedOfferedItems.length === 0 && offeredCash === 0}
                  className="px-8 py-4 bg-teal-600 text-white rounded-xl font-bold text-lg hover:bg-teal-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  التالي: حدد ما تريده
                  <span>←</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: What I Want */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-l from-purple-500 to-indigo-500 text-white px-6 py-4">
                  <h2 className="text-xl font-bold flex items-center gap-3">
                    <span className="text-2xl">🎯</span>
                    حدد ما تريده مقابل عرضك
                  </h2>
                  <p className="text-purple-100 mt-1">اختر من المنتجات المتاحة أو صف ما تبحث عنه</p>
                </div>

                <div className="p-6">
                  {/* Request Mode Toggle */}
                  <div className="flex gap-3 mb-6">
                    <button
                      type="button"
                      onClick={() => setRequestMode('select')}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition flex items-center justify-center gap-3 ${
                        requestMode === 'select'
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-2xl">📋</span>
                      اختر من المنتجات
                    </button>
                    <button
                      type="button"
                      onClick={() => setRequestMode('describe')}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-lg transition flex items-center justify-center gap-3 ${
                        requestMode === 'describe'
                          ? 'bg-purple-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <span className="text-2xl">✏️</span>
                      صف ما تريده
                    </button>
                  </div>

                  {requestMode === 'select' ? (
                    <>
                      {loadingAvailableItems ? (
                        <div className="text-center py-12">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
                          <p className="text-gray-600">جاري تحميل المنتجات المتاحة...</p>
                        </div>
                      ) : availableItems.length === 0 ? (
                        <div className="text-center py-12 bg-gray-50 rounded-2xl">
                          <span className="text-6xl block mb-4">🔍</span>
                          <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد منتجات متاحة</h3>
                          <p className="text-gray-600">جرب وصف ما تريده بدلاً من ذلك</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                          {availableItems.map((item) => {
                            const isSelected = selectedRequestedItems.includes(item.id);
                            const primaryImage =
                              item.images?.find((img) => img.isPrimary)?.url ||
                              item.images?.[0]?.url;

                            return (
                              <button
                                key={item.id}
                                type="button"
                                onClick={() => toggleRequestedItem(item.id)}
                                className={`p-4 rounded-2xl border-2 transition-all text-right ${
                                  isSelected
                                    ? 'border-purple-500 bg-purple-50 shadow-lg'
                                    : 'border-gray-200 hover:border-gray-300 hover:shadow'
                                }`}
                              >
                                <div className="flex gap-4">
                                  <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                                    {primaryImage ? (
                                      <img
                                        src={primaryImage}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-2xl text-gray-400">📦</div>
                                    )}
                                    {isSelected && (
                                      <div className="absolute inset-0 bg-purple-500/20 flex items-center justify-center">
                                        <span className="w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate text-sm">
                                      {item.title}
                                    </h4>
                                    <p className="text-xs text-gray-500 mb-1">
                                      {item.seller?.fullName}
                                    </p>
                                    <p className="text-sm font-bold text-purple-600">
                                      {(item.estimatedValue || 0).toLocaleString('ar-EG')} ج.م
                                    </p>
                                  </div>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="space-y-6">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <p className="text-amber-800 font-medium flex items-center gap-2">
                          <span className="text-xl">💡</span>
                          صف بالتفصيل ما تبحث عنه لنساعدك في إيجاد أفضل الصفقات
                        </p>
                      </div>

                      {/* Description */}
                      <div>
                        <label className="block text-lg font-bold text-gray-800 mb-2">
                          وصف ما تبحث عنه <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={requestDescription}
                          onChange={(e) => setRequestDescription(e.target.value)}
                          rows={4}
                          placeholder="مثال: أبحث عن لابتوب للألعاب بكارت RTX 3060 أو أفضل، أو هاتف ذكي مثل iPhone 13 أو Samsung S22..."
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                      </div>

                      {/* Categories */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block font-bold text-gray-800 mb-2">
                            الفئة الرئيسية <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={requestParentCategory}
                            onChange={(e) => {
                              setRequestParentCategory(e.target.value);
                              setRequestSubCategory('');
                              setRequestSubSubCategory('');
                            }}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                            required
                          >
                            <option value="">اختر الفئة</option>
                            {parentCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.nameAr || cat.nameEn}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-800 mb-2">
                            الفئة الفرعية
                          </label>
                          <select
                            value={requestSubCategory}
                            onChange={(e) => {
                              setRequestSubCategory(e.target.value);
                              setRequestSubSubCategory('');
                            }}
                            disabled={!requestParentCategory}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {requestParentCategory ? 'اختر الفئة الفرعية' : 'اختر الفئة أولاً'}
                            </option>
                            {subCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.nameAr || cat.nameEn}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block font-bold text-gray-800 mb-2">
                            الفئة الدقيقة
                          </label>
                          <select
                            value={requestSubSubCategory}
                            onChange={(e) => setRequestSubSubCategory(e.target.value)}
                            disabled={!requestSubCategory}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                          >
                            <option value="">
                              {requestSubCategory ? 'اختر الفئة الدقيقة' : 'اختر الفئة الفرعية أولاً'}
                            </option>
                            {subSubCategories.map((cat) => (
                              <option key={cat.id} value={cat.id}>{cat.nameAr || cat.nameEn}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      {/* Keywords */}
                      <div>
                        <label className="block font-bold text-gray-800 mb-2">
                          كلمات مفتاحية <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={requestKeywords}
                          onChange={(e) => setRequestKeywords(e.target.value)}
                          placeholder="مثال: آيفون، سامسونج، لابتوب (مفصولة بفاصلة)"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          required
                        />
                        <p className="text-sm text-gray-500 mt-1">أضف كلمات محددة لتحسين البحث</p>
                      </div>

                      {/* Value Range */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block font-bold text-gray-800 mb-2">
                            الحد الأدنى للقيمة <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={requestValueMin}
                              onChange={(e) => setRequestValueMin(e.target.value)}
                              min="0"
                              placeholder="0"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              required
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">ج.م</span>
                          </div>
                        </div>
                        <div>
                          <label className="block font-bold text-gray-800 mb-2">
                            الحد الأقصى للقيمة <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <input
                              type="number"
                              value={requestValueMax}
                              onChange={(e) => setRequestValueMax(e.target.value)}
                              min="0"
                              placeholder="0"
                              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                              required
                            />
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">ج.م</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Cash Requested */}
                  <div className="mt-6 pt-6 border-t">
                    <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">💰</span>
                      طلب مبلغ نقدي إضافي (اختياري)
                    </label>
                    <div className="flex items-center gap-4">
                      <div className="relative flex-1 max-w-xs">
                        <input
                          type="number"
                          min="0"
                          value={requestedCash || ''}
                          onChange={(e) => setRequestedCash(Number(e.target.value) || 0)}
                          placeholder="0"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-lg"
                        />
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-medium">ج.م</span>
                      </div>
                      <p className="text-gray-500">إذا كانت قيمة عرضك أكبر</p>
                    </div>
                  </div>

                  {/* Summary for Select Mode */}
                  {requestMode === 'select' && (selectedRequestedItems.length > 0 || requestedCash > 0) && (
                    <div className="mt-6 p-4 bg-gradient-to-l from-purple-50 to-indigo-50 rounded-2xl border border-purple-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-gray-600 mb-1">ما تطلبه:</p>
                          <p className="font-bold text-gray-800">
                            {selectedRequestedItems.length} منتج
                            {requestedCash > 0 && ` + ${requestedCash.toLocaleString('ar-EG')} ج.م نقداً`}
                          </p>
                        </div>
                        <div className="text-left">
                          <p className="text-gray-600 mb-1">إجمالي القيمة:</p>
                          <p className="text-2xl font-bold text-purple-600">
                            {totalRequestedValue.toLocaleString('ar-EG')} ج.م
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <span>→</span>
                  السابق
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={
                    requestMode === 'select'
                      ? (selectedRequestedItems.length === 0 && requestedCash === 0)
                      : (!requestDescription.trim() || !requestParentCategory || !requestKeywords.trim() || !requestValueMin || !requestValueMax)
                  }
                  className="px-8 py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  التالي: مراجعة العرض
                  <span>←</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Review & Submit */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Trade Balance */}
              {requestMode === 'select' && (
                <div className={`p-6 rounded-2xl border-2 ${
                  isBalanced
                    ? 'bg-green-50 border-green-300'
                    : valueDifference > 0
                      ? 'bg-amber-50 border-amber-300'
                      : 'bg-red-50 border-red-300'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-1">توازن الصفقة</h3>
                      <p className="text-gray-600">
                        {isBalanced
                          ? 'الصفقة متوازنة (في حدود 20%)'
                          : valueDifference > 0
                            ? `أنت تعرض ${valueDifference.toLocaleString('ar-EG')} ج.م أكثر`
                            : `أنت تطلب ${Math.abs(valueDifference).toLocaleString('ar-EG')} ج.م أكثر`
                        }
                      </p>
                    </div>
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl ${
                      isBalanced ? 'bg-green-200' : valueDifference > 0 ? 'bg-amber-200' : 'bg-red-200'
                    }`}>
                      {isBalanced ? '✅' : valueDifference > 0 ? '📈' : '📉'}
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* What I'm Offering */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-l from-teal-500 to-emerald-500 text-white px-6 py-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span>📦</span>
                      ما تعرضه
                    </h3>
                  </div>
                  <div className="p-6">
                    <div className="space-y-3">
                      {selectedOfferedDetails.map((item) => (
                        <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                          <img
                            src={item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url || ''}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-gray-800 truncate">{item.title}</p>
                            <p className="text-teal-600 font-medium">
                              {(item.estimatedValue || item.price || 0).toLocaleString('ar-EG')} ج.م
                            </p>
                          </div>
                        </div>
                      ))}
                      {offeredCash > 0 && (
                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                          <span className="text-2xl">💰</span>
                          <div>
                            <p className="font-bold text-gray-800">مبلغ نقدي</p>
                            <p className="text-amber-600 font-medium">{offeredCash.toLocaleString('ar-EG')} ج.م</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-600">الإجمالي:</span>
                        <span className="text-2xl font-bold text-teal-600">{totalOfferedValue.toLocaleString('ar-EG')} ج.م</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What I Want */}
                <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-l from-purple-500 to-indigo-500 text-white px-6 py-4">
                    <h3 className="text-lg font-bold flex items-center gap-2">
                      <span>🎯</span>
                      ما تطلبه
                    </h3>
                  </div>
                  <div className="p-6">
                    {requestMode === 'select' ? (
                      <div className="space-y-3">
                        {selectedRequestedDetails.map((item) => (
                          <div key={item.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <img
                              src={item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url || ''}
                              alt={item.title}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-bold text-gray-800 truncate">{item.title}</p>
                              <p className="text-purple-600 font-medium">
                                {(item.estimatedValue || 0).toLocaleString('ar-EG')} ج.م
                              </p>
                            </div>
                          </div>
                        ))}
                        {requestedCash > 0 && (
                          <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl">
                            <span className="text-2xl">💰</span>
                            <div>
                              <p className="font-bold text-gray-800">مبلغ نقدي</p>
                              <p className="text-amber-600 font-medium">{requestedCash.toLocaleString('ar-EG')} ج.م</p>
                            </div>
                          </div>
                        )}
                        <div className="mt-4 pt-4 border-t">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-gray-600">الإجمالي:</span>
                            <span className="text-2xl font-bold text-purple-600">{totalRequestedValue.toLocaleString('ar-EG')} ج.م</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="p-4 bg-purple-50 rounded-xl">
                          <p className="font-bold text-gray-800 mb-2">الوصف:</p>
                          <p className="text-gray-700">{requestDescription}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">الفئة:</p>
                            <p className="font-bold text-gray-800">
                              {parentCategories.find(c => c.id === requestParentCategory)?.nameAr || '-'}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-gray-500">نطاق القيمة:</p>
                            <p className="font-bold text-purple-600">
                              {parseFloat(requestValueMin).toLocaleString('ar-EG')} - {parseFloat(requestValueMax).toLocaleString('ar-EG')} ج.م
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">الكلمات المفتاحية:</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {requestKeywords.split(',').map((kw, i) => (
                              <span key={i} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                                {kw.trim()}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <label className="block text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <span className="text-2xl">💬</span>
                  رسالة للطرف الآخر (اختياري)
                </label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                  placeholder="أضف رسالة شخصية لتوضيح عرضك أو التفاوض..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Navigation & Submit */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="sm:flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <span>→</span>
                  تعديل العرض
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="sm:flex-1 px-8 py-4 bg-gradient-to-l from-teal-500 to-emerald-500 text-white rounded-xl font-bold text-lg hover:from-teal-600 hover:to-emerald-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      جاري الإرسال...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🚀</span>
                      إرسال عرض المقايضة
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
