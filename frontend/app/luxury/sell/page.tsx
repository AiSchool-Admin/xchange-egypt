'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api/client';
import { getCategories, Category } from '@/lib/api/categories';

const LUXURY_CATEGORIES = [
  { value: 'luxury-watches', label: 'ساعات فاخرة', icon: '⌚', minPrice: 50000 },
  { value: 'jewelry', label: 'مجوهرات', icon: '💎', minPrice: 50000 },
  { value: 'luxury-bags', label: 'حقائب فاخرة', icon: '👜', minPrice: 30000 },
  { value: 'paintings', label: 'لوحات فنية', icon: '🖼️', minPrice: 50000 },
  { value: 'antiques', label: 'تحف أثرية', icon: '🏺', minPrice: 50000 },
  { value: 'perfumes', label: 'عطور أصلية', icon: '🌸', minPrice: 5000 },
  { value: 'other-luxury', label: 'أخرى فاخرة', icon: '👑', minPrice: 50000 },
];

const CONDITION_OPTIONS = [
  { value: 'NEW', label: 'جديد', description: 'لم يُستخدم مطلقاً - مع العلبة والضمان', icon: '✨' },
  { value: 'LIKE_NEW', label: 'كالجديد', description: 'استخدام بسيط جداً - بدون أي علامات', icon: '🌟' },
  { value: 'GOOD', label: 'جيد', description: 'استخدام عادي - علامات طفيفة', icon: '👍' },
  { value: 'FAIR', label: 'مقبول', description: 'آثار استخدام واضحة', icon: '👌' },
];

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج',
];

export default function SellLuxuryPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1);
  const [categories, setCategories] = useState<Category[]>([]);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    luxuryCategory: '',
    categoryId: '',
    condition: 'LIKE_NEW',
    estimatedValue: '',
    governorate: '',
    brand: '',
    model: '',
    yearOfManufacture: '',
    serialNumber: '',
    hasAuthenticityCertificate: false,
    authenticityCertificate: '',
    images: [] as string[],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/luxury/sell');
      return;
    }

    const fetchCategories = async () => {
      try {
        const res = await getCategories();
        setCategories(res.data || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'يرجى إدخال عنوان المنتج';
    }
    if (!formData.luxuryCategory) {
      newErrors.luxuryCategory = 'يرجى اختيار فئة المنتج';
    }
    if (!formData.condition) {
      newErrors.condition = 'يرجى اختيار حالة المنتج';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.estimatedValue || parseFloat(formData.estimatedValue) <= 0) {
      newErrors.estimatedValue = 'يرجى إدخال السعر المطلوب';
    }

    const selectedCategory = LUXURY_CATEGORIES.find(c => c.value === formData.luxuryCategory);
    if (selectedCategory && parseFloat(formData.estimatedValue) < selectedCategory.minPrice) {
      newErrors.estimatedValue = `الحد الأدنى لهذه الفئة هو ${formatPrice(selectedCategory.minPrice)} ج.م`;
    }

    if (!formData.governorate) {
      newErrors.governorate = 'يرجى اختيار المحافظة';
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
      // Find the matching category from database
      const matchingCategory = categories.find(
        c => c.slug === formData.luxuryCategory || c.nameEn?.toLowerCase().includes(formData.luxuryCategory)
      );

      const res = await apiClient.post('/items', {
        titleAr: formData.title,
        titleEn: formData.title,
        descriptionAr: formData.description,
        descriptionEn: formData.description,
        condition: formData.condition,
        categoryId: matchingCategory?.id || formData.categoryId,
        estimatedValue: parseFloat(formData.estimatedValue),
        governorate: formData.governorate,
        brand: formData.brand || undefined,
        model: formData.model || undefined,
        yearOfManufacture: formData.yearOfManufacture ? parseInt(formData.yearOfManufacture) : undefined,
        serialNumber: formData.serialNumber || undefined,
        authenticityCertificate: formData.hasAuthenticityCertificate ? formData.authenticityCertificate : undefined,
        imageUrls: formData.images,
        listingType: 'DIRECT_SALE',
      });

      router.push(`/luxury/${res.data.data.id}`);
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
      setFormData({ ...formData, images: newImages.slice(0, 8) });
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-amber-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-400">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  const selectedCategory = LUXURY_CATEGORIES.find(c => c.value === formData.luxuryCategory);

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/luxury" className="text-amber-400 hover:underline text-sm mb-2 inline-block">
            ← العودة لسوق الرفاهية
          </Link>
          <h1 className="text-3xl font-bold text-white">بيع منتج فاخر</h1>
          <p className="text-gray-400 mt-2">
            اعرض منتجك الفاخر للعملاء المميزين واحصل على أفضل سعر
          </p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'التفاصيل' },
              { num: 2, label: 'التسعير والموقع' },
              { num: 3, label: 'المراجعة' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                    step >= s.num
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900'
                      : 'bg-gray-800 text-gray-500'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <div className="mr-2 text-sm font-medium text-gray-400">{s.label}</div>
                {i < 2 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${step > s.num ? 'bg-amber-500' : 'bg-gray-800'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Details */}
        {step === 1 && (
          <div className="bg-gray-800/50 rounded-2xl p-6 space-y-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">تفاصيل المنتج</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                عنوان المنتج <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="مثال: ساعة رولكس صبمارينر أصلية 2023"
                className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.title ? 'border-red-500' : 'border-gray-700'
                }`}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Luxury Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                فئة المنتج <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {LUXURY_CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, luxuryCategory: cat.value })}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      formData.luxuryCategory === cat.value
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                    }`}
                  >
                    <div className="text-3xl mb-2">{cat.icon}</div>
                    <div className="text-sm font-medium text-white">{cat.label}</div>
                  </button>
                ))}
              </div>
              {errors.luxuryCategory && <p className="text-red-500 text-sm mt-1">{errors.luxuryCategory}</p>}
            </div>

            {/* Condition Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                حالة المنتج <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {CONDITION_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, condition: opt.value })}
                    className={`p-4 rounded-xl border-2 text-right transition-all ${
                      formData.condition === opt.value
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-gray-700 hover:border-gray-600 bg-gray-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xl">{opt.icon}</span>
                      <span className="font-bold text-white">{opt.label}</span>
                    </div>
                    <div className="text-xs text-gray-400">{opt.description}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Brand & Model */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  العلامة التجارية
                </label>
                <input
                  type="text"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  placeholder="مثال: Rolex, Louis Vuitton"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الموديل
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="مثال: Submariner, Neverfull"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Year & Serial */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  سنة الصنع
                </label>
                <input
                  type="number"
                  value={formData.yearOfManufacture}
                  onChange={(e) => setFormData({ ...formData, yearOfManufacture: e.target.value })}
                  placeholder="مثال: 2023"
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  الرقم التسلسلي
                </label>
                <input
                  type="text"
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="اختياري"
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                الوصف
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="أضف تفاصيل عن المنتج، تاريخ الشراء، سبب البيع، الملحقات المتوفرة..."
                rows={4}
                className="w-full px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              />
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                صور المنتج (حتى 8 صور)
              </label>
              <div className="grid grid-cols-4 gap-3">
                {formData.images.map((img, idx) => (
                  <div key={idx} className="relative aspect-square bg-gray-900 rounded-xl overflow-hidden">
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
                {formData.images.length < 8 && (
                  <label className="aspect-square border-2 border-dashed border-gray-700 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-amber-500 transition-colors bg-gray-900/50">
                    <span className="text-3xl text-gray-500">+</span>
                    <span className="text-xs text-gray-500">إضافة صورة</span>
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
                💡 صور احترافية عالية الجودة تزيد من فرص البيع بشكل كبير
              </p>
            </div>

            {/* Next Button */}
            <button
              type="button"
              onClick={handleNextStep}
              className="w-full bg-gradient-to-l from-amber-500 to-yellow-500 text-gray-900 py-4 rounded-xl font-bold text-lg hover:from-amber-400 hover:to-yellow-400 transition-all"
            >
              التالي: التسعير ←
            </button>
          </div>
        )}

        {/* Step 2: Pricing & Location */}
        {step === 2 && (
          <div className="bg-gray-800/50 rounded-2xl p-6 space-y-6 border border-gray-700/50">
            <h2 className="text-xl font-bold text-white mb-4">التسعير والموقع</h2>

            {/* Category Min Price Info */}
            {selectedCategory && (
              <div className="bg-amber-500/10 rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{selectedCategory.icon}</span>
                  <div>
                    <div className="text-amber-400 font-medium">{selectedCategory.label}</div>
                    <div className="text-sm text-gray-400">
                      الحد الأدنى للسعر: {formatPrice(selectedCategory.minPrice)} ج.م
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                السعر المطلوب <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.estimatedValue}
                  onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                  placeholder={selectedCategory ? `الحد الأدنى: ${formatPrice(selectedCategory.minPrice)}` : 'أدخل السعر'}
                  className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                    errors.estimatedValue ? 'border-red-500' : 'border-gray-700'
                  }`}
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">ج.م</span>
              </div>
              {errors.estimatedValue && <p className="text-red-500 text-sm mt-1">{errors.estimatedValue}</p>}
            </div>

            {/* Governorate */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                المحافظة <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.governorate}
                onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                className={`w-full px-4 py-3 bg-gray-900 border rounded-xl text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent ${
                  errors.governorate ? 'border-red-500' : 'border-gray-700'
                }`}
              >
                <option value="">اختر المحافظة</option>
                {GOVERNORATES.map((gov) => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
              {errors.governorate && <p className="text-red-500 text-sm mt-1">{errors.governorate}</p>}
            </div>

            {/* Authenticity Certificate */}
            <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-700">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasAuthenticityCertificate}
                  onChange={(e) => setFormData({ ...formData, hasAuthenticityCertificate: e.target.checked })}
                  className="mt-1 w-5 h-5 rounded border-gray-600 text-amber-500 focus:ring-amber-500 bg-gray-800"
                />
                <div>
                  <div className="font-medium text-white">لدي شهادة أصالة للمنتج</div>
                  <div className="text-sm text-gray-400">
                    شهادة الأصالة تزيد من ثقة المشترين وقيمة منتجك
                  </div>
                </div>
              </label>

              {formData.hasAuthenticityCertificate && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={formData.authenticityCertificate}
                    onChange={(e) => setFormData({ ...formData, authenticityCertificate: e.target.value })}
                    placeholder="رقم أو تفاصيل شهادة الأصالة"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                </div>
              )}
            </div>

            {/* VIP Benefits */}
            <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-xl p-4 border border-amber-500/20">
              <h3 className="font-bold text-amber-400 mb-3 flex items-center gap-2">
                <span>👑</span>
                مميزات البيع في سوق الرفاهية
              </h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">✓</span>
                  عرض منتجك لعملاء مميزين يبحثون عن الجودة
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">✓</span>
                  حماية المعاملات بنظام الضمان الآمن
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">✓</span>
                  دعم VIP على مدار الساعة
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-amber-400">✓</span>
                  عمولة منخفضة 2% فقط
                </li>
              </ul>
            </div>

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex-1 bg-gray-700 text-white py-4 rounded-xl font-bold hover:bg-gray-600 transition-all"
              >
                ← السابق
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex-1 bg-gradient-to-l from-amber-500 to-yellow-500 text-gray-900 py-4 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition-all"
              >
                التالي: المراجعة ←
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Preview */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4">مراجعة الإعلان</h2>

              {/* Preview Card */}
              <div className="border border-gray-700 rounded-xl overflow-hidden bg-gray-900/50">
                {/* Images */}
                <div className="relative aspect-video bg-gray-900">
                  {formData.images.length > 0 ? (
                    <Image
                      src={formData.images[0]}
                      alt={formData.title}
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-8xl opacity-20">
                        {selectedCategory?.icon || '👑'}
                      </span>
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedCategory?.icon}</span>
                    <span className="text-amber-400 text-sm">{selectedCategory?.label}</span>
                  </div>

                  <h3 className="text-xl font-bold text-white">{formData.title}</h3>

                  <div className="flex flex-wrap gap-2">
                    <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-sm">
                      {CONDITION_OPTIONS.find(c => c.value === formData.condition)?.label}
                    </span>
                    {formData.brand && (
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                        {formData.brand}
                      </span>
                    )}
                    {formData.model && (
                      <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                        {formData.model}
                      </span>
                    )}
                    <span className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                      📍 {formData.governorate}
                    </span>
                  </div>

                  {formData.description && (
                    <p className="text-gray-400 text-sm">{formData.description}</p>
                  )}

                  <div className="bg-gradient-to-r from-amber-500/10 to-yellow-500/10 rounded-lg p-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">السعر المطلوب</span>
                      <span className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                        {formatPrice(parseFloat(formData.estimatedValue))} ج.م
                      </span>
                    </div>
                  </div>

                  {formData.hasAuthenticityCertificate && (
                    <div className="flex items-center gap-2 text-amber-400 text-sm">
                      <span>📜</span>
                      <span>يحمل شهادة أصالة</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Commission Info */}
            <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50">
              <h3 className="font-bold text-white mb-3">تفاصيل البيع</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>السعر المطلوب</span>
                  <span className="text-white">{formatPrice(parseFloat(formData.estimatedValue))} ج.م</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>عمولة المنصة (2%)</span>
                  <span className="text-red-400">- {formatPrice(parseFloat(formData.estimatedValue) * 0.02)} ج.م</span>
                </div>
                <div className="border-t border-gray-700 pt-2 flex justify-between font-bold">
                  <span className="text-white">ستحصل على</span>
                  <span className="text-amber-400">{formatPrice(parseFloat(formData.estimatedValue) * 0.98)} ج.م</span>
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-gray-900/50 rounded-xl p-4 text-sm text-gray-400 border border-gray-700/50">
              <p className="mb-2">بالنشر، أنت توافق على:</p>
              <ul className="list-disc list-inside space-y-1">
                <li>صحة المعلومات المقدمة عن المنتج</li>
                <li>أصالة المنتج وعدم تزويره</li>
                <li>استخدام نظام الضمان للمعاملات</li>
                <li>خصم عمولة 2% عند إتمام البيع</li>
              </ul>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="flex-1 bg-gray-700 text-white py-4 rounded-xl font-bold hover:bg-gray-600 transition-all"
              >
                ← تعديل
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 bg-gradient-to-l from-emerald-500 to-teal-500 text-white py-4 rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50"
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
