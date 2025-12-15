'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createScrapItem,
  SCRAP_TYPE_AR,
  SCRAP_CONDITION_AR,
  METAL_TYPE_AR,
  SCRAP_PRICING_AR,
  ScrapType,
  ScrapCondition,
  MetalType,
  ScrapPricingType,
} from '@/lib/api/scrap-marketplace';
import { ImageUpload } from '@/components/ui/ImageUpload';

// Category icons
const SCRAP_TYPE_ICONS: Record<ScrapType, string> = {
  ELECTRONICS: '📱',
  HOME_APPLIANCES: '🔌',
  COMPUTERS: '💻',
  PHONES: '📞',
  CABLES_WIRES: '🔗',
  MOTORS: '⚙️',
  BATTERIES: '🔋',
  METAL_SCRAP: '🔩',
  CAR_PARTS: '🚗',
  FURNITURE_PARTS: '🪑',
  WOOD: '🪵',
  PLASTIC: '♻️',
  TEXTILES: '👕',
  PAPER: '📄',
  GLASS: '🪟',
  CONSTRUCTION: '🏗️',
  INDUSTRIAL: '🏭',
  MEDICAL: '⚕️',
  OTHER: '📦',
};

export default function SellScrapPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scrapType: '' as ScrapType | '',
    scrapCondition: '' as ScrapCondition | '',
    scrapPricingType: '' as ScrapPricingType | '',
    estimatedValue: '',
    weightKg: '',
    pricePerKg: '',
    metalType: '' as MetalType | '',
    metalPurity: '',
    isRepairable: false,
    repairCostEstimate: '',
    workingPartsDesc: '',
    defectDescription: '',
    images: [] as string[],
    governorate: '',
    city: '',
    district: '',
    location: '',
  });

  const handleSubmit = async () => {
    if (!formData.scrapType || !formData.scrapCondition || !formData.scrapPricingType) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await createScrapItem({
        title: formData.title,
        description: formData.description,
        scrapType: formData.scrapType as ScrapType,
        scrapCondition: formData.scrapCondition as ScrapCondition,
        scrapPricingType: formData.scrapPricingType as ScrapPricingType,
        estimatedValue: parseFloat(formData.estimatedValue) || 0,
        weightKg: formData.weightKg ? parseFloat(formData.weightKg) : undefined,
        pricePerKg: formData.pricePerKg ? parseFloat(formData.pricePerKg) : undefined,
        metalType: formData.metalType as MetalType || undefined,
        metalPurity: formData.metalPurity ? parseFloat(formData.metalPurity) : undefined,
        isRepairable: formData.isRepairable,
        repairCostEstimate: formData.repairCostEstimate
          ? parseFloat(formData.repairCostEstimate)
          : undefined,
        workingPartsDesc: formData.workingPartsDesc || undefined,
        defectDescription: formData.defectDescription || undefined,
        images: formData.images,
        governorate: formData.governorate || undefined,
        city: formData.city || undefined,
        district: formData.district || undefined,
        location: formData.location || undefined,
      });
      router.push('/scrap?success=created');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في نشر المنتج');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-orange-600 to-amber-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/scrap" className="text-white/80 hover:text-white mb-4 inline-block">
            &rarr; العودة لسوق التوالف
          </Link>
          <h1 className="text-3xl font-bold">بيع توالف جديدة</h1>
          <p className="opacity-90 mt-2">أضف منتجك وابدأ في البيع</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4">
            {[
              { num: 1, label: 'نوع المنتج' },
              { num: 2, label: 'التفاصيل' },
              { num: 3, label: 'السعر والموقع' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-2 ${
                  step >= s.num ? 'text-orange-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num ? 'bg-orange-600 text-white' : 'bg-gray-200'
                  }`}
                >
                  {s.num}
                </div>
                <span className="hidden sm:inline">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Type Selection */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">اختر نوع التوالف</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(SCRAP_TYPE_AR).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFormData((f) => ({ ...f, scrapType: key as ScrapType }))}
                    className={`p-4 rounded-xl border-2 text-center transition ${
                      formData.scrapType === key
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{SCRAP_TYPE_ICONS[key as ScrapType]}</div>
                    <div className="font-medium text-sm">{label}</div>
                  </button>
                ))}
              </div>

              {formData.scrapType && (
                <div className="mt-6">
                  <h3 className="font-bold mb-4">حالة المنتج</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(SCRAP_CONDITION_AR).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() =>
                          setFormData((f) => ({ ...f, scrapCondition: key as ScrapCondition }))
                        }
                        className={`p-3 rounded-lg border-2 text-center transition ${
                          formData.scrapCondition === key
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.scrapType || !formData.scrapCondition}
                  className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Details */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">تفاصيل المنتج</h2>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block font-medium mb-2">عنوان المنتج *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                    placeholder="مثال: ثلاجة توشيبا تالفة"
                    className="w-full border rounded-lg px-4 py-3"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-medium mb-2">الوصف *</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                    placeholder="اوصف حالة المنتج بالتفصيل..."
                    rows={4}
                    className="w-full border rounded-lg px-4 py-3"
                    required
                  />
                </div>

                {/* Metal Type (if applicable) */}
                {['METAL_SCRAP', 'CABLES_WIRES', 'MOTORS'].includes(formData.scrapType) && (
                  <div>
                    <label className="block font-medium mb-2">نوع المعدن</label>
                    <select
                      value={formData.metalType}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, metalType: e.target.value as MetalType }))
                      }
                      className="w-full border rounded-lg px-4 py-3"
                    >
                      <option value="">اختر نوع المعدن</option>
                      {Object.entries(METAL_TYPE_AR).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Weight */}
                <div>
                  <label className="block font-medium mb-2">الوزن (كجم)</label>
                  <input
                    type="number"
                    value={formData.weightKg}
                    onChange={(e) => setFormData((f) => ({ ...f, weightKg: e.target.value }))}
                    placeholder="الوزن التقريبي"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

                {/* Defect Description */}
                <div>
                  <label className="block font-medium mb-2">وصف العطل أو التلف</label>
                  <textarea
                    value={formData.defectDescription}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, defectDescription: e.target.value }))
                    }
                    placeholder="ما هو العطل بالتحديد؟"
                    rows={2}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

                {/* Repairable */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isRepairable"
                    checked={formData.isRepairable}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, isRepairable: e.target.checked }))
                    }
                    className="w-5 h-5"
                  />
                  <label htmlFor="isRepairable" className="font-medium">
                    قابل للإصلاح
                  </label>
                </div>

                {formData.isRepairable && (
                  <>
                    <div>
                      <label className="block font-medium mb-2">تكلفة الإصلاح المتوقعة (ج.م)</label>
                      <input
                        type="number"
                        value={formData.repairCostEstimate}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, repairCostEstimate: e.target.value }))
                        }
                        placeholder="التكلفة التقريبية"
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2">الأجزاء الشغالة</label>
                      <input
                        type="text"
                        value={formData.workingPartsDesc}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, workingPartsDesc: e.target.value }))
                        }
                        placeholder="مثال: الموتور، الكومبروسور..."
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>
                  </>
                )}

                {/* Image Upload */}
                <div className="border-t pt-6">
                  <label className="block font-bold mb-2">صور المنتج</label>
                  <p className="text-sm text-gray-500 mb-4">
                    أضف صور واضحة للمنتج لزيادة فرص البيع (حتى 10 صور)
                  </p>
                  <ImageUpload
                    multiple
                    category="items"
                    maxFiles={10}
                    onUploadComplete={(urls) =>
                      setFormData((f) => ({ ...f, images: [...f.images, ...urls] }))
                    }
                    onUploadError={(error) => setError(error)}
                  />

                  {/* Preview uploaded images */}
                  {formData.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-2">
                        الصور المرفوعة ({formData.images.length})
                      </p>
                      <div className="grid grid-cols-4 gap-2">
                        {formData.images.map((url, index) => (
                          <div key={index} className="relative aspect-square">
                            <img
                              src={url}
                              alt={`صورة ${index + 1}`}
                              className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                setFormData((f) => ({
                                  ...f,
                                  images: f.images.filter((_, i) => i !== index),
                                }))
                              }
                              className="absolute top-1 right-1 bg-red-500 text-white w-6 h-6 rounded-full text-sm hover:bg-red-600"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-600 px-6 py-3 hover:text-gray-800"
                >
                  السابق
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.title || !formData.description}
                  className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Price & Location */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">السعر والموقع</h2>

              <div className="space-y-6">
                {/* Pricing Type */}
                <div>
                  <label className="block font-medium mb-2">طريقة التسعير *</label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(SCRAP_PRICING_AR).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() =>
                          setFormData((f) => ({
                            ...f,
                            scrapPricingType: key as ScrapPricingType,
                          }))
                        }
                        className={`p-3 rounded-lg border-2 text-center transition ${
                          formData.scrapPricingType === key
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                {formData.scrapPricingType !== 'REVERSE_AUCTION' && (
                  <>
                    <div>
                      <label className="block font-medium mb-2">
                        {formData.scrapPricingType === 'PER_KG'
                          ? 'السعر للكيلو (ج.م)'
                          : 'السعر (ج.م)'} *
                      </label>
                      <input
                        type="number"
                        value={
                          formData.scrapPricingType === 'PER_KG'
                            ? formData.pricePerKg
                            : formData.estimatedValue
                        }
                        onChange={(e) =>
                          formData.scrapPricingType === 'PER_KG'
                            ? setFormData((f) => ({ ...f, pricePerKg: e.target.value }))
                            : setFormData((f) => ({ ...f, estimatedValue: e.target.value }))
                        }
                        placeholder="أدخل السعر"
                        className="w-full border rounded-lg px-4 py-3"
                        required
                      />
                    </div>

                    {formData.scrapPricingType !== 'PER_KG' && (
                      <div>
                        <label className="block font-medium mb-2">القيمة التقديرية (ج.م)</label>
                        <input
                          type="number"
                          value={formData.estimatedValue}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, estimatedValue: e.target.value }))
                          }
                          placeholder="القيمة التقديرية للمنتج"
                          className="w-full border rounded-lg px-4 py-3"
                        />
                      </div>
                    )}
                  </>
                )}

                {/* Location */}
                <div className="border-t pt-6">
                  <h3 className="font-bold mb-4">الموقع</h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-medium mb-2">المحافظة</label>
                      <input
                        type="text"
                        value={formData.governorate}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, governorate: e.target.value }))
                        }
                        placeholder="مثال: القاهرة"
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>
                    <div>
                      <label className="block font-medium mb-2">المدينة</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                        placeholder="مثال: مدينة نصر"
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-gray-600 px-6 py-3 hover:text-gray-800"
                >
                  السابق
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading || !formData.scrapPricingType}
                  className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'جاري النشر...' : 'نشر المنتج'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
