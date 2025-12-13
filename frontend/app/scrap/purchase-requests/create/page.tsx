'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  createPurchaseRequest,
  SCRAP_TYPE_AR,
  METAL_TYPE_AR,
  SCRAP_CONDITION_AR,
  ScrapType,
  MetalType,
  ScrapCondition,
} from '@/lib/api/scrap-marketplace';

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

const GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الدقهلية',
  'الشرقية',
  'القليوبية',
  'كفر الشيخ',
  'الغربية',
  'المنوفية',
  'البحيرة',
  'الإسماعيلية',
  'السويس',
  'بورسعيد',
  'دمياط',
  'الفيوم',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج',
  'قنا',
  'أسوان',
  'الأقصر',
  'البحر الأحمر',
  'مطروح',
];

export default function CreatePurchaseRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scrapType: '' as ScrapType | '',
    metalType: '' as MetalType | '',
    scrapCondition: '' as ScrapCondition | '',
    minWeightKg: '',
    maxWeightKg: '',
    offeredPricePerKg: '',
    offeredTotalPrice: '',
    isNegotiable: true,
    governorate: '',
    city: '',
    offersPickup: true,
    pickupAddress: '',
    expiresInDays: '30',
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.scrapType) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + parseInt(formData.expiresInDays || '30'));

      await createPurchaseRequest({
        title: formData.title,
        description: formData.description || undefined,
        scrapType: formData.scrapType as ScrapType,
        metalType: formData.metalType as MetalType || undefined,
        scrapCondition: formData.scrapCondition as ScrapCondition || undefined,
        minWeightKg: formData.minWeightKg ? parseFloat(formData.minWeightKg) : undefined,
        maxWeightKg: formData.maxWeightKg ? parseFloat(formData.maxWeightKg) : undefined,
        offeredPricePerKg: formData.offeredPricePerKg
          ? parseFloat(formData.offeredPricePerKg)
          : undefined,
        offeredTotalPrice: formData.offeredTotalPrice
          ? parseFloat(formData.offeredTotalPrice)
          : undefined,
        isNegotiable: formData.isNegotiable,
        governorate: formData.governorate || undefined,
        city: formData.city || undefined,
        offersPickup: formData.offersPickup,
        pickupAddress: formData.pickupAddress || undefined,
        expiresAt: expiresAt.toISOString(),
      });

      router.push('/scrap/purchase-requests?success=created');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في إنشاء الطلب');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-indigo-600 to-purple-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Link
            href="/scrap/purchase-requests"
            className="text-white/80 hover:text-white mb-4 inline-block"
          >
            &rarr; العودة لطلبات الشراء
          </Link>
          <h1 className="text-3xl font-bold">إنشاء طلب شراء جديد</h1>
          <p className="opacity-90 mt-2">
            أنشئ طلب شراء للحصول على عروض من البائعين والجامعين
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4">
            {[
              { num: 1, label: 'نوع الخردة' },
              { num: 2, label: 'الكمية والسعر' },
              { num: 3, label: 'التفاصيل' },
            ].map((s) => (
              <div
                key={s.num}
                className={`flex items-center gap-2 ${
                  step >= s.num ? 'text-indigo-600' : 'text-gray-400'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num ? 'bg-indigo-600 text-white' : 'bg-gray-200'
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Type Selection */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">ما نوع الخردة التي تريد شراءها؟</h2>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {Object.entries(SCRAP_TYPE_AR).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => setFormData((f) => ({ ...f, scrapType: key as ScrapType }))}
                    className={`p-4 rounded-xl border-2 text-center transition ${
                      formData.scrapType === key
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{SCRAP_TYPE_ICONS[key as ScrapType]}</div>
                    <div className="font-medium text-sm">{label}</div>
                  </button>
                ))}
              </div>

              {/* Metal Type (if applicable) */}
              {formData.scrapType === 'METAL_SCRAP' && (
                <div className="mt-6">
                  <h3 className="font-bold mb-4">نوع المعدن</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {Object.entries(METAL_TYPE_AR).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => setFormData((f) => ({ ...f, metalType: key as MetalType }))}
                        className={`p-3 rounded-lg border-2 text-sm transition ${
                          formData.metalType === key
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
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
                  disabled={!formData.scrapType}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Quantity & Price */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">الكمية والسعر</h2>

              <div className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block font-medium mb-2">عنوان الطلب *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData((f) => ({ ...f, title: e.target.value }))}
                    placeholder="مثال: مطلوب نحاس أحمر 500 كيلو"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block font-medium mb-2">الوصف</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData((f) => ({ ...f, description: e.target.value }))}
                    placeholder="اكتب تفاصيل إضافية عن المواصفات المطلوبة..."
                    rows={3}
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>

                {/* Weight Range */}
                <div>
                  <label className="block font-medium mb-2">الكمية المطلوبة (كجم)</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input
                        type="number"
                        value={formData.minWeightKg}
                        onChange={(e) => setFormData((f) => ({ ...f, minWeightKg: e.target.value }))}
                        placeholder="الحد الأدنى"
                        className="w-full border rounded-lg px-4 py-3"
                        min="0"
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={formData.maxWeightKg}
                        onChange={(e) => setFormData((f) => ({ ...f, maxWeightKg: e.target.value }))}
                        placeholder="الحد الأقصى"
                        className="w-full border rounded-lg px-4 py-3"
                        min="0"
                      />
                    </div>
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="block font-medium mb-2">السعر المعروض للكيلو (ج.م)</label>
                  <input
                    type="number"
                    value={formData.offeredPricePerKg}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, offeredPricePerKg: e.target.value }))
                    }
                    placeholder="السعر للكيلو الواحد"
                    className="w-full border rounded-lg px-4 py-3"
                    min="0"
                  />
                </div>

                {/* Negotiable */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isNegotiable"
                    checked={formData.isNegotiable}
                    onChange={(e) => setFormData((f) => ({ ...f, isNegotiable: e.target.checked }))}
                    className="w-5 h-5"
                  />
                  <label htmlFor="isNegotiable" className="font-medium">
                    السعر قابل للتفاوض
                  </label>
                </div>

                {/* Condition */}
                <div>
                  <label className="block font-medium mb-2">الحالة المقبولة</label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(SCRAP_CONDITION_AR).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() =>
                          setFormData((f) => ({
                            ...f,
                            scrapCondition: f.scrapCondition === key ? '' : (key as ScrapCondition),
                          }))
                        }
                        className={`p-3 rounded-lg border-2 text-sm transition ${
                          formData.scrapCondition === key
                            ? 'border-indigo-500 bg-indigo-50'
                            : 'border-gray-200 hover:border-indigo-300'
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="text-gray-600 px-6 py-3">
                  السابق
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!formData.title}
                  className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-indigo-700 transition disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">تفاصيل إضافية</h2>

              <div className="space-y-6">
                {/* Location */}
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block font-medium mb-2">المحافظة</label>
                    <select
                      value={formData.governorate}
                      onChange={(e) => setFormData((f) => ({ ...f, governorate: e.target.value }))}
                      className="w-full border rounded-lg px-4 py-3"
                    >
                      <option value="">اختر المحافظة</option>
                      {GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>
                          {gov}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium mb-2">المدينة</label>
                    <input
                      type="text"
                      value={formData.city}
                      onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                      placeholder="المدينة أو الحي"
                      className="w-full border rounded-lg px-4 py-3"
                    />
                  </div>
                </div>

                {/* Pickup */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3 mb-4">
                    <input
                      type="checkbox"
                      id="offersPickup"
                      checked={formData.offersPickup}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, offersPickup: e.target.checked }))
                      }
                      className="w-5 h-5"
                    />
                    <label htmlFor="offersPickup" className="font-medium">
                      أوفر خدمة الاستلام من البائع
                    </label>
                  </div>
                  {formData.offersPickup && (
                    <div>
                      <label className="block text-sm text-gray-600 mb-2">عنوان الاستلام</label>
                      <input
                        type="text"
                        value={formData.pickupAddress}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, pickupAddress: e.target.value }))
                        }
                        placeholder="العنوان الذي سيتم الاستلام منه"
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>
                  )}
                </div>

                {/* Expires */}
                <div>
                  <label className="block font-medium mb-2">مدة صلاحية الطلب</label>
                  <select
                    value={formData.expiresInDays}
                    onChange={(e) => setFormData((f) => ({ ...f, expiresInDays: e.target.value }))}
                    className="w-full border rounded-lg px-4 py-3"
                  >
                    <option value="7">أسبوع واحد</option>
                    <option value="14">أسبوعين</option>
                    <option value="30">شهر واحد</option>
                    <option value="60">شهرين</option>
                    <option value="90">3 أشهر</option>
                  </select>
                </div>
              </div>

              {/* Summary */}
              <div className="mt-6 p-4 bg-indigo-50 rounded-lg">
                <h3 className="font-bold mb-3">ملخص الطلب</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">النوع:</span>
                    <span className="font-medium">{SCRAP_TYPE_AR[formData.scrapType as ScrapType]}</span>
                  </div>
                  {formData.metalType && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">المعدن:</span>
                      <span className="font-medium">
                        {METAL_TYPE_AR[formData.metalType as MetalType]}
                      </span>
                    </div>
                  )}
                  {(formData.minWeightKg || formData.maxWeightKg) && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">الكمية:</span>
                      <span className="font-medium">
                        {formData.minWeightKg && formData.maxWeightKg
                          ? `${formData.minWeightKg} - ${formData.maxWeightKg} كجم`
                          : `${formData.minWeightKg || formData.maxWeightKg} كجم`}
                      </span>
                    </div>
                  )}
                  {formData.offeredPricePerKg && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">السعر:</span>
                      <span className="font-medium text-green-600">
                        {formData.offeredPricePerKg} ج.م/كجم
                        {formData.isNegotiable && ' (قابل للتفاوض)'}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(2)} className="text-gray-600 px-6 py-3">
                  السابق
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:opacity-50"
                >
                  {loading ? 'جاري الإنشاء...' : 'نشر طلب الشراء'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
