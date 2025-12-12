'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api/client';

interface SilverPrice {
  purity: string;
  buyPrice: number;
  sellPrice: number;
}

interface PriceEstimate {
  askingPrice: number;
  sellerCommission: number;
  sellerReceives: number;
  marketPrice: number;
}

const PURITY_OPTIONS = [
  { value: 'S999', label: 'فضة نقية 999', purity: '99.9%' },
  { value: 'S925', label: 'فضة إسترليني 925', purity: '92.5%' },
  { value: 'S900', label: 'فضة 900', purity: '90%' },
  { value: 'S800', label: 'فضة 800', purity: '80%' },
];

const CATEGORY_OPTIONS = [
  { value: 'RING', label: 'خاتم', icon: '💍' },
  { value: 'NECKLACE', label: 'سلسلة', icon: '📿' },
  { value: 'BRACELET', label: 'إسورة', icon: '⌚' },
  { value: 'EARRING', label: 'حلق', icon: '✨' },
  { value: 'PENDANT', label: 'تعليقة', icon: '🔶' },
  { value: 'ANKLET', label: 'خلخال', icon: '💫' },
  { value: 'COIN', label: 'عملة فضية', icon: '🪙' },
  { value: 'BAR', label: 'سبيكة', icon: '🥈' },
  { value: 'SET', label: 'طقم', icon: '👑' },
  { value: 'ANTIQUE', label: 'أنتيك', icon: '🏺' },
  { value: 'OTHER', label: 'أخرى', icon: '📦' },
];

const CONDITION_OPTIONS = [
  { value: 'NEW', label: 'جديد', description: 'لم يُستخدم مطلقاً' },
  { value: 'LIKE_NEW', label: 'كالجديد', description: 'استخدام بسيط، لا توجد خدوش' },
  { value: 'GOOD', label: 'جيد', description: 'استخدام عادي، خدوش طفيفة' },
  { value: 'FAIR', label: 'مقبول', description: 'آثار استخدام واضحة' },
  { value: 'ANTIQUE', label: 'أنتيك', description: 'قطعة قديمة ذات قيمة' },
];

export default function SellSilverPage() {
  const router = useRouter();
  const [prices, setPrices] = useState<Record<string, SilverPrice>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Details, 2: Pricing, 3: Preview
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    purity: 'S925',
    category: 'RING',
    condition: 'GOOD',
    weightGrams: '',
    pricePerGram: '',
    images: [] as string[],
    allowBarter: false,
    allowGoldBarter: false,
    barterDescription: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/silver/sell');
      return;
    }

    // Fetch silver prices
    const fetchPrices = async () => {
      try {
        const res = await apiClient.get('/silver/prices');
        setPrices(res.data.data);
      } catch (err) {
        console.error('Error fetching prices:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPrices();
  }, [router]);

  // Calculate price estimate when weight or price changes
  useEffect(() => {
    if (formData.weightGrams && formData.pricePerGram && formData.purity) {
      const weight = parseFloat(formData.weightGrams);
      const pricePerGram = parseFloat(formData.pricePerGram);

      if (weight > 0 && pricePerGram > 0) {
        calculateEstimate(weight, pricePerGram);
      }
    }
  }, [formData.weightGrams, formData.pricePerGram, formData.purity]);

  const calculateEstimate = async (weight: number, pricePerGram: number) => {
    try {
      const res = await apiClient.post('/silver/calculate', {
        weightGrams: weight,
        purity: formData.purity,
        sellerPricePerGram: pricePerGram,
      });
      setPriceEstimate(res.data.data);
    } catch (err) {
      console.error('Error calculating price:', err);
    }
  };

  const getCurrentPrice = () => {
    return prices[formData.purity];
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'يرجى إدخال عنوان القطعة';
    }
    if (!formData.purity) {
      newErrors.purity = 'يرجى اختيار النقاء';
    }
    if (!formData.category) {
      newErrors.category = 'يرجى اختيار الفئة';
    }
    if (!formData.condition) {
      newErrors.condition = 'يرجى اختيار الحالة';
    }
    if (!formData.weightGrams || parseFloat(formData.weightGrams) <= 0) {
      newErrors.weightGrams = 'يرجى إدخال وزن صحيح';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.pricePerGram || parseFloat(formData.pricePerGram) <= 0) {
      newErrors.pricePerGram = 'يرجى إدخال سعر الجرام';
    }

    const currentPrice = getCurrentPrice();
    if (currentPrice && parseFloat(formData.pricePerGram) > currentPrice.sellPrice * 1.2) {
      newErrors.pricePerGram = 'السعر مرتفع جداً مقارنة بسعر السوق';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2 && validateStep2()) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);

    try {
      const res = await apiClient.post('/silver/items', {
        title: formData.title,
        description: formData.description,
        purity: formData.purity,
        category: formData.category,
        condition: formData.condition,
        weightGrams: parseFloat(formData.weightGrams),
        askingPricePerGram: parseFloat(formData.pricePerGram),
        images: formData.images,
        allowBarter: formData.allowBarter,
        allowGoldBarter: formData.allowGoldBarter,
        barterDescription: formData.barterDescription,
      });

      // Redirect to the new item
      router.push(`/silver/${res.data.data.id}`);
    } catch (err: any) {
      console.error('Error creating item:', err);
      alert(err.response?.data?.error?.message || 'حدث خطأ في إنشاء الإعلان');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = [...formData.images];
      for (let i = 0; i < files.length; i++) {
        newImages.push(URL.createObjectURL(files[i]));
      }
      setFormData({ ...formData, images: newImages.slice(0, 5) });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-slate-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  const currentPrice = getCurrentPrice();

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/silver" className="text-slate-600 hover:underline text-sm mb-2 inline-block">
            ← العودة لسوق الفضة
          </Link>
          <h1 className="text-3xl font-bold text-gray-800">بيع فضتك</h1>
          <p className="text-gray-600 mt-2">
            اعرض قطعتك الفضية للبيع بأفضل سعر واحصل على المبلغ بأمان
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'التفاصيل' },
              { num: 2, label: 'التسعير' },
              { num: 3, label: 'المراجعة' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num
                      ? 'bg-slate-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <div className="mr-2 text-sm font-medium text-gray-600">{s.label}</div>
                {i < 2 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${step > s.num ? 'bg-slate-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">تفاصيل القطعة</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                عنوان الإعلان <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: خاتم فضة إسترليني بتصميم عصري"
                className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Purity Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                درجة النقاء <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PURITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, purity: opt.value })}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      formData.purity === opt.value
                        ? 'border-slate-500 bg-slate-50'
                        : 'border-gray-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold text-lg">{opt.label}</div>
                    <div className="text-xs text-gray-500">نقاء {opt.purity}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع القطعة <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {CATEGORY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, category: opt.value })}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${
                      formData.category === opt.value
                        ? 'border-slate-500 bg-slate-50'
                        : 'border-gray-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{opt.icon}</div>
                    <div className="text-xs font-medium">{opt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Condition Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                حالة القطعة <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CONDITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, condition: opt.value })}
                    className={`p-4 rounded-xl border-2 text-right transition-all ${
                      formData.condition === opt.value
                        ? 'border-slate-500 bg-slate-50'
                        : 'border-gray-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="font-bold">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Weight */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوزن بالجرام <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={formData.weightGrams}
                  onChange={(e) => setFormData({ ...formData, weightGrams: e.target.value })}
                  placeholder="مثال: 15"
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.weightGrams ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">جرام</span>
              </div>
              {errors.weightGrams && <p className="text-red-500 text-sm mt-1">{errors.weightGrams}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الوصف (اختياري)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أضف تفاصيل إضافية عن القطعة مثل العلامة التجارية، التصميم، سبب البيع..."
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                صور القطعة (حتى 5 صور)
              </label>
              <div className="grid grid-cols-5 gap-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                    <Image src={img} alt={`صورة ${idx + 1}`} fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ✕
                    </button>
                  </div>
                ))}
                {formData.images.length < 5 && (
                  <label className="aspect-square border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-slate-500 transition-colors">
                    <span className="text-3xl text-gray-400">+</span>
                    <span className="text-xs text-gray-400">إضافة صورة</span>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 صور واضحة تزيد من فرص البيع. التقط صوراً من زوايا مختلفة.
              </p>
            </div>

            {/* Barter Options */}
            <div className="bg-blue-50 rounded-xl p-4">
              <h3 className="font-bold text-blue-800 mb-3">🔄 خيارات المقايضة</h3>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowBarter}
                    onChange={(e) => setFormData({ ...formData, allowBarter: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span>قابل للمقايضة بفضة أخرى</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowGoldBarter}
                    onChange={(e) => setFormData({ ...formData, allowGoldBarter: e.target.checked })}
                    className="w-5 h-5 text-amber-600 rounded"
                  />
                  <span>🏆 قابل للمقايضة بذهب (Cross-Barter)</span>
                </label>
                {(formData.allowBarter || formData.allowGoldBarter) && (
                  <textarea
                    value={formData.barterDescription}
                    onChange={(e) => setFormData({ ...formData, barterDescription: e.target.value })}
                    placeholder="صف ما تبحث عنه في المقايضة..."
                    rows={2}
                    className="w-full px-4 py-2 border border-blue-200 rounded-lg mt-2"
                  />
                )}
              </div>
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-gradient-to-l from-slate-500 to-slate-600 text-white py-4 rounded-xl font-bold text-lg hover:from-slate-600 hover:to-slate-700 transition-all"
            >
              التالي: التسعير ←
            </button>
          </div>
        )}

        {/* Step 2: Pricing */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-800 mb-4">تسعير القطعة</h2>

            {/* Current Market Price Info */}
            {currentPrice && (
              <div className="bg-gradient-to-br from-slate-50 to-gray-50 rounded-xl p-4 border border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-slate-700">سعر {PURITY_OPTIONS.find(p => p.value === formData.purity)?.label} اليوم</div>
                    <div className="text-2xl font-bold text-slate-800">{formatPrice(currentPrice.sellPrice)} ج.م/جرام</div>
                  </div>
                  <div className="text-4xl">📊</div>
                </div>
              </div>
            )}

            {/* Price Per Gram */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                سعر الجرام المطلوب <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="1"
                  min="0"
                  value={formData.pricePerGram}
                  onChange={(e) => setFormData({ ...formData, pricePerGram: e.target.value })}
                  placeholder={currentPrice ? `السعر المقترح: ${formatPrice(currentPrice.sellPrice * 0.95)}` : 'أدخل السعر'}
                  className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-slate-500 focus:border-transparent ${
                    errors.pricePerGram ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">ج.م/جرام</span>
              </div>
              {errors.pricePerGram && <p className="text-red-500 text-sm mt-1">{errors.pricePerGram}</p>}
              <p className="text-xs text-gray-500 mt-2">
                💡 نصيحة: سعر قريب من سعر السوق يجذب المشترين بسرعة
              </p>
            </div>

            {/* Quick Price Buttons */}
            {currentPrice && (
              <div className="flex gap-2">
                {[0.90, 0.95, 1.00].map((multiplier) => (
                  <button
                    key={multiplier}
                    type="button"
                    onClick={() => setFormData({
                      ...formData,
                      pricePerGram: Math.round(currentPrice.sellPrice * multiplier).toString()
                    })}
                    className="flex-1 py-2 px-3 bg-gray-100 hover:bg-slate-100 rounded-lg text-sm font-medium transition-colors"
                  >
                    {multiplier === 1.00 ? 'سعر السوق' : `${Math.round((1 - multiplier) * 100)}% خصم`}
                    <br />
                    <span className="text-slate-700">
                      {formatPrice(currentPrice.sellPrice * multiplier)}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* Price Estimate Card */}
            {priceEstimate && (
              <div className="bg-green-50 rounded-xl p-6 border border-green-200">
                <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                  <span className="text-2xl">💰</span>
                  ما ستحصل عليه
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-gray-600">
                    <span>السعر الإجمالي ({formData.weightGrams} جرام)</span>
                    <span>{formatPrice(priceEstimate.askingPrice)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>عمولة المنصة (2%)</span>
                    <span className="text-red-600">- {formatPrice(priceEstimate.sellerCommission)} ج.م</span>
                  </div>
                  <div className="border-t border-green-200 pt-3 flex justify-between font-bold text-lg">
                    <span>صافي المبلغ</span>
                    <span className="text-green-700">{formatPrice(priceEstimate.sellerReceives)} ج.م</span>
                  </div>
                </div>
              </div>
            )}

            {/* Commission Info */}
            <div className="bg-blue-50 rounded-xl p-4 flex items-start gap-3">
              <span className="text-2xl">ℹ️</span>
              <div className="text-sm text-blue-700">
                <strong>عمولة عادلة:</strong> 2% من قيمة البيع للبائع.
                <br />
                المشتري يدفع 2% أيضاً، إجمالي العمولة 4%. (أقل من الفرق عند بيع للتاجر!)
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                ← السابق
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 bg-gradient-to-l from-slate-500 to-slate-600 text-white py-4 rounded-xl font-bold hover:from-slate-600 hover:to-slate-700 transition-all"
              >
                التالي: المراجعة ←
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">مراجعة الإعلان</h2>

              {/* Preview Card */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Images */}
                <div className="relative aspect-video bg-gray-100">
                  {formData.images.length > 0 ? (
                    <Image
                      src={formData.images[0]}
                      alt={formData.title}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-8xl">
                        {CATEGORY_OPTIONS.find(c => c.value === formData.category)?.icon || '💍'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <h3 className="text-xl font-bold text-gray-800">{formData.title}</h3>

                  <div className="flex flex-wrap gap-2">
                    <span className="bg-slate-100 text-slate-700 px-3 py-1 rounded-full text-sm">
                      {PURITY_OPTIONS.find(p => p.value === formData.purity)?.label}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {CATEGORY_OPTIONS.find(c => c.value === formData.category)?.label}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {CONDITION_OPTIONS.find(c => c.value === formData.condition)?.label}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm">
                      {formData.weightGrams} جرام
                    </span>
                    {formData.allowBarter && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">🔄 مقايضة</span>
                    )}
                    {formData.allowGoldBarter && (
                      <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">🏆 ذهب↔فضة</span>
                    )}
                  </div>

                  {formData.description && (
                    <p className="text-gray-600 text-sm">{formData.description}</p>
                  )}

                  {priceEstimate && (
                    <div className="bg-slate-50 rounded-lg p-4 mt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600">السعر المطلوب</span>
                        <span className="text-2xl font-bold text-slate-700">
                          {formatPrice(priceEstimate.askingPrice)} ج.م
                        </span>
                      </div>
                      <div className="flex justify-between items-center mt-2 text-sm">
                        <span className="text-gray-500">سعر الجرام</span>
                        <span className="text-gray-700">{formatPrice(parseFloat(formData.pricePerGram))} ج.م</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Final Summary */}
            {priceEstimate && (
              <div className="bg-green-50 rounded-2xl p-6 border border-green-200">
                <h3 className="font-bold text-green-800 mb-3">ملخص البيع</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>سعر البيع</span>
                    <span>{formatPrice(priceEstimate.askingPrice)} ج.م</span>
                  </div>
                  <div className="flex justify-between text-red-600">
                    <span>عمولة المنصة</span>
                    <span>- {formatPrice(priceEstimate.sellerCommission)} ج.م</span>
                  </div>
                  <div className="border-t border-green-200 pt-2 flex justify-between font-bold text-lg">
                    <span>ستحصل على</span>
                    <span className="text-green-700">{formatPrice(priceEstimate.sellerReceives)} ج.م</span>
                  </div>
                </div>
              </div>
            )}

            {/* Terms */}
            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
              <p className="mb-2">بالنشر، أنت توافق على:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>صحة المعلومات المقدمة عن القطعة</li>
                <li>استخدام نظام الضمان للمعاملات</li>
                <li>خصم عمولة 2% عند إتمام البيع</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-all"
              >
                ← تعديل
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-gradient-to-l from-green-500 to-emerald-500 text-white py-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all disabled:opacity-50"
              >
                {submitting ? 'جارٍ النشر...' : '✓ نشر الإعلان'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
