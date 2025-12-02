'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getMyItems, Item, promoteItem } from '@/lib/api/items';

interface PromotionPlan {
  id: string;
  name: string;
  nameAr: string;
  tier: 'gold' | 'silver' | 'bronze';
  duration: number;
  price: number;
  features: string[];
  icon: string;
  gradient: string;
  popular?: boolean;
}

const PROMOTION_PLANS: PromotionPlan[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    nameAr: 'برونزي',
    tier: 'bronze',
    duration: 3,
    price: 50,
    icon: '🌟',
    gradient: 'from-orange-600 to-amber-700',
    features: [
      'ظهور مميز لمدة 3 أيام',
      'شارة برونزية على الإعلان',
      'أولوية في نتائج البحث',
    ],
  },
  {
    id: 'silver',
    name: 'Silver',
    nameAr: 'فضي',
    tier: 'silver',
    duration: 7,
    price: 100,
    icon: '⭐',
    gradient: 'from-gray-400 to-gray-500',
    popular: true,
    features: [
      'ظهور مميز لمدة 7 أيام',
      'شارة فضية على الإعلان',
      'أولوية عالية في البحث',
      'إشعارات للمشترين المهتمين',
    ],
  },
  {
    id: 'gold',
    name: 'Gold',
    nameAr: 'ذهبي',
    tier: 'gold',
    duration: 14,
    price: 200,
    icon: '👑',
    gradient: 'from-amber-500 to-yellow-400',
    features: [
      'ظهور مميز لمدة 14 يوم',
      'شارة ذهبية على الإعلان',
      'الأولوية القصوى في البحث',
      'ظهور في قسم الإعلانات المميزة',
      'إشعارات للمشترين المهتمين',
      'تقرير تفصيلي عن المشاهدات',
    ],
  },
];

export default function PromotePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PromotionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<'select-item' | 'select-plan' | 'confirm'>('select-item');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/promote');
      return;
    }

    if (user) {
      loadUserItems();
    }
  }, [user, authLoading, router]);

  const loadUserItems = async () => {
    try {
      const response = await getMyItems();
      // Filter only active items that are not already featured
      const activeItems = (response.data?.items || []).filter(
        (item: Item) => item.status === 'ACTIVE'
      );
      setItems(activeItems);
    } catch (error) {
      console.error('Failed to load items:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('ar-EG');
  };

  const handleSelectItem = (item: Item) => {
    setSelectedItem(item);
    setStep('select-plan');
  };

  const handleSelectPlan = (plan: PromotionPlan) => {
    setSelectedPlan(plan);
    setStep('confirm');
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (!selectedItem || !selectedPlan) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Map plan tier to API tier
      const tierMap: Record<string, string> = {
        bronze: 'FEATURED',
        silver: 'PREMIUM',
        gold: 'GOLD',
      };

      const response = await promoteItem(selectedItem.id, {
        tier: tierMap[selectedPlan.tier] as any,
        durationDays: selectedPlan.duration,
      });

      if (response.success) {
        alert(`تم ترويج إعلانك بنجاح! 🎉\n\nسيظهر في قسم الإعلانات المميزة لمدة ${selectedPlan.duration} أيام.`);
        router.push('/inventory');
      } else {
        setError('حدث خطأ أثناء الترويج. حاول مرة أخرى.');
      }
    } catch (err: any) {
      console.error('Promotion error:', err);
      setError(err.message || 'حدث خطأ أثناء الترويج. حاول مرة أخرى.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-amber-600 to-yellow-500 text-gray-900">
        <div className="max-w-5xl mx-auto px-4 py-12 text-center">
          <div className="text-5xl mb-4">👑</div>
          <h1 className="text-3xl font-bold mb-3">روّج إعلانك</h1>
          <p className="text-amber-900/80 text-lg">زد من ظهور إعلانك وصل لمشترين أكثر</p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            <div className={`flex items-center gap-2 ${step === 'select-item' ? 'text-amber-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'select-item' ? 'bg-amber-500 text-white' : selectedItem ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                {selectedItem ? '✓' : '1'}
              </div>
              <span className="font-medium">اختر الإعلان</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === 'select-plan' ? 'text-amber-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'select-plan' ? 'bg-amber-500 text-white' : selectedPlan ? 'bg-green-500 text-white' : 'bg-gray-200'}`}>
                {selectedPlan ? '✓' : '2'}
              </div>
              <span className="font-medium">اختر الباقة</span>
            </div>
            <div className="w-8 h-px bg-gray-300"></div>
            <div className={`flex items-center gap-2 ${step === 'confirm' ? 'text-amber-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'confirm' ? 'bg-amber-500 text-white' : 'bg-gray-200'}`}>
                3
              </div>
              <span className="font-medium">التأكيد</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Step 1: Select Item */}
        {step === 'select-item' && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-6">اختر الإعلان الذي تريد ترويجه</h2>

            {items.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد إعلانات نشطة</h3>
                <p className="text-gray-500 mb-6">أنشئ إعلاناً أولاً ثم عد لترويجه</p>
                <Link
                  href="/inventory/add"
                  className="px-6 py-3 bg-amber-500 text-white rounded-xl font-medium hover:bg-amber-600 transition"
                >
                  إنشاء إعلان جديد
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-amber-400 hover:shadow-lg transition-all text-right"
                  >
                    <div className="h-32 bg-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-4xl opacity-30">📦</span>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2">{item.title}</h3>
                      <p className="text-amber-600 font-bold mt-2">
                        {formatPrice(item.estimatedValue || 0)} ج.م
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Select Plan */}
        {step === 'select-plan' && selectedItem && (
          <div>
            <button
              onClick={() => setStep('select-item')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              تغيير الإعلان
            </button>

            <div className="bg-white rounded-xl p-4 border border-gray-200 mb-8 flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                {selectedItem.images && selectedItem.images.length > 0 ? (
                  <img
                    src={selectedItem.images[0].url}
                    alt={selectedItem.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-2xl opacity-30">📦</span>
                  </div>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{selectedItem.title}</h3>
                <p className="text-amber-600 font-bold">{formatPrice(selectedItem.estimatedValue || 0)} ج.م</p>
              </div>
            </div>

            <h2 className="text-xl font-bold text-gray-900 mb-6">اختر باقة الترويج</h2>

            <div className="grid md:grid-cols-3 gap-6">
              {PROMOTION_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border-2 overflow-hidden transition-all ${
                    selectedPlan?.id === plan.id
                      ? 'border-amber-500 shadow-xl'
                      : 'border-gray-200 hover:border-amber-300 hover:shadow-lg'
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-0 right-0 bg-amber-500 text-white text-center py-1 text-sm font-medium">
                      الأكثر شيوعاً
                    </div>
                  )}

                  <div className={`p-6 ${plan.popular ? 'pt-10' : ''}`}>
                    {/* Icon & Name */}
                    <div className="text-center mb-6">
                      <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r ${plan.gradient} flex items-center justify-center text-3xl mb-3`}>
                        {plan.icon}
                      </div>
                      <h3 className="text-xl font-bold text-gray-900">{plan.nameAr}</h3>
                      <p className="text-gray-500">{plan.duration} أيام</p>
                    </div>

                    {/* Price */}
                    <div className="text-center mb-6">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      <span className="text-gray-500 mr-1">ج.م</span>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                          <svg className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>

                    {/* Button */}
                    <button
                      onClick={() => handleSelectPlan(plan)}
                      className={`w-full py-3 rounded-xl font-bold transition ${
                        plan.tier === 'gold'
                          ? 'bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 hover:from-amber-400 hover:to-yellow-300'
                          : 'bg-gray-900 text-white hover:bg-gray-800'
                      }`}
                    >
                      اختر هذه الباقة
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Confirm */}
        {step === 'confirm' && selectedItem && selectedPlan && (
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setStep('select-plan')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              تغيير الباقة
            </button>

            <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
              <div className={`p-6 bg-gradient-to-r ${selectedPlan.gradient} text-center`}>
                <div className="text-4xl mb-2">{selectedPlan.icon}</div>
                <h2 className="text-xl font-bold text-white">باقة {selectedPlan.nameAr}</h2>
              </div>

              <div className="p-6">
                {/* Item Summary */}
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6">
                  <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                    {selectedItem.images && selectedItem.images.length > 0 ? (
                      <img
                        src={selectedItem.images[0].url}
                        alt={selectedItem.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-xl opacity-30">📦</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 line-clamp-1">{selectedItem.title}</h3>
                    <p className="text-amber-600 font-bold">{formatPrice(selectedItem.estimatedValue || 0)} ج.م</p>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>الباقة</span>
                    <span>{selectedPlan.nameAr}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>المدة</span>
                    <span>{selectedPlan.duration} أيام</span>
                  </div>
                  <hr className="border-gray-200" />
                  <div className="flex justify-between text-lg font-bold text-gray-900">
                    <span>الإجمالي</span>
                    <span>{selectedPlan.price} ج.م</span>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
                    {error}
                  </div>
                )}

                {/* Confirm Button */}
                <button
                  onClick={handleConfirm}
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-yellow-400 text-gray-900 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-5 h-5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></span>
                      جاري الترويج...
                    </span>
                  ) : (
                    'تأكيد الترويج'
                  )}
                </button>

                <p className="text-center text-sm text-gray-500 mt-4">
                  بالضغط على "تأكيد الترويج" أنت توافق على شروط الاستخدام
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
