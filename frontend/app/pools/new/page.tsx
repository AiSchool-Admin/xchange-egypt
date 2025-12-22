'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMyItems } from '@/lib/api/items';
import { createBarterPool } from '@/lib/api/barter-pools';
import { getRootCategories, Category } from '@/lib/api/categories';

interface SelectableItem {
  id: string;
  title: string;
  estimatedValue?: number;
  price?: number;
  images: Array<{ url: string; isPrimary: boolean }>;
  description?: string;
}

export default function CreatePoolPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(1);

  // My items
  const [myItems, setMyItems] = useState<SelectableItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  // Categories
  const [categories, setCategories] = useState<Category[]>([]);

  // Pool details
  const [poolName, setPoolName] = useState('');
  const [poolDescription, setPoolDescription] = useState('');
  const [targetValue, setTargetValue] = useState('');
  const [targetDescription, setTargetDescription] = useState('');
  const [targetCategory, setTargetCategory] = useState('');
  const [deadline, setDeadline] = useState('');
  const [minParticipants, setMinParticipants] = useState(2);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [isPublic, setIsPublic] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    try {
      setLoadingItems(true);
      const [itemsResponse, categoriesResponse] = await Promise.all([
        getMyItems(),
        getRootCategories(),
      ]);
      setMyItems(itemsResponse.data.items.filter((item: any) => item.status === 'ACTIVE'));
      setCategories(categoriesResponse.data || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل البيانات');
    } finally {
      setLoadingItems(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!poolName.trim()) {
      setError('يرجى إدخال اسم للصندوق');
      return;
    }
    if (!targetDescription.trim()) {
      setError('يرجى وصف ما تريد الحصول عليه');
      return;
    }
    if (!targetValue || parseFloat(targetValue) <= 0) {
      setError('يرجى إدخال القيمة المستهدفة');
      return;
    }
    if (selectedItems.length === 0) {
      setError('يرجى اختيار منتج واحد على الأقل للمساهمة به');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const targetVal = parseFloat(targetValue);
      const deadlineDays = deadline
        ? Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
        : 30;

      await createBarterPool({
        title: poolName,
        description: poolDescription,
        targetDescription: targetDescription,
        targetCategoryId: targetCategory || undefined,
        targetMinValue: targetVal * 0.9,
        targetMaxValue: targetVal * 1.1,
        maxParticipants,
        deadlineDays: Math.max(1, deadlineDays),
        initialContribution: selectedItems.length > 0 ? {
          itemId: selectedItems[0],
        } : undefined,
      });

      router.push('/pools?success=created');
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في إنشاء الصندوق');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  const steps = [
    { number: 1, title: 'تفاصيل الصندوق', icon: '📋' },
    { number: 2, title: 'ما تريد الحصول عليه', icon: '🎯' },
    { number: 3, title: 'مساهمتك', icon: '🎁' },
    { number: 4, title: 'مراجعة وإنشاء', icon: '✅' },
  ];

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-amber-600 via-orange-600 to-red-600 text-white">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <Link
            href="/pools"
            className="text-amber-200 hover:text-white flex items-center gap-2 mb-4 transition w-fit"
          >
            → العودة للصناديق الجماعية
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
              🤝
            </div>
            <div>
              <h1 className="text-3xl font-bold mb-1">إنشاء صندوق مقايضة جماعية</h1>
              <p className="text-amber-200">
                اجمع منتجاتك مع آخرين للحصول على منتج أكبر قيمة!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {steps.map((s, index) => (
              <div key={s.number} className="flex items-center">
                <button
                  onClick={() => setStep(s.number)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-xl transition ${
                    step === s.number
                      ? 'bg-amber-100 text-amber-700'
                      : step > s.number
                        ? 'text-amber-600'
                        : 'text-gray-400'
                  }`}
                >
                  <span className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step === s.number
                      ? 'bg-amber-600 text-white'
                      : step > s.number
                        ? 'bg-amber-200 text-amber-700'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.number ? '✓' : s.icon}
                  </span>
                  <span className="hidden sm:block font-medium">{s.title}</span>
                </button>
                {index < steps.length - 1 && (
                  <div className={`hidden sm:block w-16 h-1 mx-2 rounded ${
                    step > s.number ? 'bg-amber-400' : 'bg-gray-200'
                  }`}></div>
                )}
              </div>
            ))}
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

        <form onSubmit={handleSubmit}>
          {/* Step 1: Pool Details */}
          {step === 1 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                تفاصيل الصندوق
              </h2>

              <div>
                <label className="block font-bold text-gray-800 mb-2">
                  اسم الصندوق <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={poolName}
                  onChange={(e) => setPoolName(e.target.value)}
                  placeholder="مثال: صندوق شراء iPhone 15 Pro"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-2">
                  وصف الصندوق (اختياري)
                </label>
                <textarea
                  value={poolDescription}
                  onChange={(e) => setPoolDescription(e.target.value)}
                  rows={3}
                  placeholder="صف الهدف من هذا الصندوق والشروط..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-gray-800 mb-2">الحد الأدنى للمشاركين</label>
                  <input
                    type="number"
                    min="2"
                    value={minParticipants}
                    onChange={(e) => setMinParticipants(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block font-bold text-gray-800 mb-2">الحد الأقصى للمشاركين</label>
                  <input
                    type="number"
                    min="2"
                    value={maxParticipants}
                    onChange={(e) => setMaxParticipants(Number(e.target.value))}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-2">الموعد النهائي (اختياري)</label>
                <input
                  type="date"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublic}
                    onChange={(e) => setIsPublic(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
                <span className="font-medium text-gray-700">صندوق عام (يمكن لأي شخص الانضمام)</span>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  disabled={!poolName.trim()}
                  className="px-8 py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  التالي
                  <span>←</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Target Item */}
          {step === 2 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🎯</span>
                ما الذي تريدون الحصول عليه؟
              </h2>

              <div>
                <label className="block font-bold text-gray-800 mb-2">
                  وصف المنتج المستهدف <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={targetDescription}
                  onChange={(e) => setTargetDescription(e.target.value)}
                  rows={4}
                  placeholder="مثال: iPhone 15 Pro Max 256GB لون أسود، جديد أو مستعمل بحالة ممتازة..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-2">
                  القيمة المستهدفة <span className="text-red-500">*</span>
                </label>
                <div className="relative max-w-xs">
                  <input
                    type="number"
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                    required
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">ج.م</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-800 mb-2">الفئة (اختياري)</label>
                <select
                  value={targetCategory}
                  onChange={(e) => setTargetCategory(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.nameAr || cat.nameEn}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <span>→</span>
                  السابق
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  disabled={!targetDescription.trim() || !targetValue}
                  className="px-8 py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  التالي
                  <span>←</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Contribution */}
          {step === 3 && (
            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="text-2xl">🎁</span>
                مساهمتك في الصندوق
              </h2>

              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl">
                <p className="text-amber-800 font-medium flex items-center gap-2">
                  <span className="text-xl">💡</span>
                  اختر المنتجات التي تريد المساهمة بها في هذا الصندوق
                </p>
              </div>

              {loadingItems ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mb-4"></div>
                  <p className="text-gray-600">جاري تحميل منتجاتك...</p>
                </div>
              ) : myItems.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-2xl">
                  <span className="text-6xl block mb-4">📦</span>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد منتجات</h3>
                  <p className="text-gray-600 mb-4">أضف منتجاتك أولاً للمساهمة بها</p>
                  <Link
                    href="/inventory/add"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 text-white rounded-xl font-bold hover:bg-amber-700 transition"
                  >
                    <span>➕</span>
                    أضف منتج جديد
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {myItems.map((item) => {
                    const isSelected = selectedItems.includes(item.id);
                    const primaryImage = item.images?.find((img) => img.isPrimary)?.url || item.images?.[0]?.url;

                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleItem(item.id)}
                        className={`p-4 rounded-2xl border-2 transition-all text-right ${
                          isSelected
                            ? 'border-amber-500 bg-amber-50 shadow-lg'
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
                              <div className="absolute inset-0 bg-amber-500/20 flex items-center justify-center">
                                <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</span>
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate text-sm">{item.title}</h4>
                            <p className="text-amber-600 font-bold mt-1">
                              {(item.estimatedValue || item.price || 0).toLocaleString('ar-EG')} ج.م
                            </p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Summary */}
              {selectedItems.length > 0 && (
                <div className="p-4 bg-gradient-to-l from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-600 mb-1">مساهمتك:</p>
                      <p className="font-bold text-gray-800">{selectedItems.length} منتج</p>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-600 mb-1">إجمالي القيمة:</p>
                      <p className="text-2xl font-bold text-amber-600">
                        {selectedItemsValue.toLocaleString('ar-EG')} ج.م
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-amber-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">التقدم نحو الهدف:</span>
                      <span className="font-bold text-amber-700">
                        {Math.min(100, Math.round((selectedItemsValue / parseFloat(targetValue || '1')) * 100))}%
                      </span>
                    </div>
                    <div className="mt-2 h-3 bg-amber-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-l from-amber-500 to-orange-500 rounded-full transition-all"
                        style={{ width: `${Math.min(100, (selectedItemsValue / parseFloat(targetValue || '1')) * 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition flex items-center gap-2"
                >
                  <span>→</span>
                  السابق
                </button>
                <button
                  type="button"
                  onClick={() => setStep(4)}
                  disabled={selectedItems.length === 0}
                  className="px-8 py-4 bg-amber-600 text-white rounded-xl font-bold text-lg hover:bg-amber-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  التالي
                  <span>←</span>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-2xl">✅</span>
                  مراجعة تفاصيل الصندوق
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">اسم الصندوق</p>
                      <p className="font-bold text-gray-900">{poolName}</p>
                    </div>
                    {poolDescription && (
                      <div className="p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-500 mb-1">الوصف</p>
                        <p className="text-gray-700">{poolDescription}</p>
                      </div>
                    )}
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">عدد المشاركين</p>
                      <p className="font-bold text-gray-900">{minParticipants} - {maxParticipants}</p>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-500 mb-1">الرؤية</p>
                      <p className="font-bold text-gray-900">{isPublic ? 'عام 🌐' : 'خاص 🔒'}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-amber-50 rounded-xl">
                      <p className="text-sm text-amber-600 mb-1">المنتج المستهدف</p>
                      <p className="font-bold text-gray-900">{targetDescription}</p>
                      <p className="text-2xl font-bold text-amber-600 mt-2">
                        {parseFloat(targetValue).toLocaleString('ar-EG')} ج.م
                      </p>
                    </div>

                    <div className="p-4 bg-green-50 rounded-xl">
                      <p className="text-sm text-green-600 mb-2">مساهمتك ({selectedItems.length} منتج)</p>
                      <div className="space-y-2">
                        {myItems
                          .filter((item) => selectedItems.includes(item.id))
                          .map((item) => (
                            <div key={item.id} className="flex justify-between items-center">
                              <span className="text-gray-700 truncate">{item.title}</span>
                              <span className="text-green-600 font-bold whitespace-nowrap">
                                {(item.estimatedValue || item.price || 0).toLocaleString('ar-EG')} ج.م
                              </span>
                            </div>
                          ))}
                      </div>
                      <div className="mt-3 pt-3 border-t border-green-200 flex justify-between">
                        <span className="font-bold text-gray-700">الإجمالي:</span>
                        <span className="text-xl font-bold text-green-600">
                          {selectedItemsValue.toLocaleString('ar-EG')} ج.م
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="sm:flex-1 px-6 py-4 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
                >
                  <span>→</span>
                  تعديل
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="sm:flex-1 px-8 py-4 bg-gradient-to-l from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      جاري الإنشاء...
                    </>
                  ) : (
                    <>
                      <span className="text-xl">🚀</span>
                      إنشاء الصندوق
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
