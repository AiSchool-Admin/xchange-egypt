'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  registerScrapDealer,
  SCRAP_TYPE_AR,
  METAL_TYPE_AR,
  DEALER_TYPE_AR,
  ScrapType,
  MetalType,
  ScrapDealerType,
} from '@/lib/api/scrap-marketplace';

const DEALER_TYPE_ICONS: Record<ScrapDealerType, string> = {
  INDIVIDUAL_COLLECTOR: '👤',
  SCRAP_DEALER: '🏪',
  RECYCLING_COMPANY: '♻️',
  REPAIR_TECHNICIAN: '🔧',
  FACTORY: '🏭',
  EXPORT_COMPANY: '🚢',
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
];

export default function DealerRegistrationPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    dealerType: '' as ScrapDealerType | '',
    businessName: '',
    commercialRegNo: '',
    taxCardNo: '',
    recyclingLicenseNo: '',
    address: '',
    governorate: '',
    city: '',
    specializations: [] as ScrapType[],
    acceptedMetals: [] as MetalType[],
    minWeightKg: '',
    maxWeightKg: '',
    offersPickup: true,
    pickupFee: '',
    pickupRadiusKm: '',
  });

  const toggleSpecialization = (type: ScrapType) => {
    setFormData((f) => ({
      ...f,
      specializations: f.specializations.includes(type)
        ? f.specializations.filter((t) => t !== type)
        : [...f.specializations, type],
    }));
  };

  const toggleMetal = (type: MetalType) => {
    setFormData((f) => ({
      ...f,
      acceptedMetals: f.acceptedMetals.includes(type)
        ? f.acceptedMetals.filter((t) => t !== type)
        : [...f.acceptedMetals, type],
    }));
  };

  const handleSubmit = async () => {
    if (!formData.dealerType || formData.specializations.length === 0) {
      setError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await registerScrapDealer({
        dealerType: formData.dealerType as ScrapDealerType,
        businessName: formData.businessName || undefined,
        commercialRegNo: formData.commercialRegNo || undefined,
        taxCardNo: formData.taxCardNo || undefined,
        recyclingLicenseNo: formData.recyclingLicenseNo || undefined,
        address: formData.address || undefined,
        governorate: formData.governorate || undefined,
        city: formData.city || undefined,
        specializations: formData.specializations,
        acceptedMetals: formData.acceptedMetals.length > 0 ? formData.acceptedMetals : undefined,
        minWeightKg: formData.minWeightKg ? parseFloat(formData.minWeightKg) : undefined,
        maxWeightKg: formData.maxWeightKg ? parseFloat(formData.maxWeightKg) : undefined,
        offersPickup: formData.offersPickup,
        pickupFee: formData.pickupFee ? parseFloat(formData.pickupFee) : undefined,
        pickupRadiusKm: formData.pickupRadiusKm ? parseFloat(formData.pickupRadiusKm) : undefined,
      });
      router.push('/scrap/dealers?success=registered');
    } catch (err: any) {
      setError(err.response?.data?.error || 'حدث خطأ في التسجيل');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-amber-600 to-orange-600 text-white py-8">
        <div className="container mx-auto px-4">
          <Link href="/scrap/dealers" className="text-white/80 hover:text-white mb-4 inline-block">
            &rarr; العودة للتجار
          </Link>
          <h1 className="text-3xl font-bold">تسجيل كتاجر توالف</h1>
          <p className="opacity-90 mt-2">
            انضم لشبكة تجار التوالف المعتمدين واحصل على عملاء جدد
          </p>
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-4">
            {[
              { num: 1, label: 'نوع النشاط' },
              { num: 2, label: 'التخصصات' },
              { num: 3, label: 'البيانات' },
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
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Step 1: Dealer Type */}
          {step === 1 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">ما نوع نشاطك؟</h2>

              <div className="grid grid-cols-2 gap-4">
                {Object.entries(DEALER_TYPE_AR).map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() =>
                      setFormData((f) => ({ ...f, dealerType: key as ScrapDealerType }))
                    }
                    className={`p-6 rounded-xl border-2 text-center transition ${
                      formData.dealerType === key
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="text-4xl mb-3">
                      {DEALER_TYPE_ICONS[key as ScrapDealerType]}
                    </div>
                    <div className="font-medium">{label}</div>
                  </button>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!formData.dealerType}
                  className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Specializations */}
          {step === 2 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">ما هي تخصصاتك؟</h2>

              <div className="mb-6">
                <label className="block font-medium mb-3">أنواع التوالف التي تشتريها *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {Object.entries(SCRAP_TYPE_AR).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => toggleSpecialization(key as ScrapType)}
                      className={`p-3 rounded-lg border-2 text-sm transition ${
                        formData.specializations.includes(key as ScrapType)
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      {formData.specializations.includes(key as ScrapType) && '✓ '}
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {formData.specializations.includes('METAL_SCRAP') && (
                <div className="mb-6">
                  <label className="block font-medium mb-3">أنواع المعادن المقبولة</label>
                  <div className="grid grid-cols-3 gap-2">
                    {Object.entries(METAL_TYPE_AR).map(([key, label]) => (
                      <button
                        key={key}
                        onClick={() => toggleMetal(key as MetalType)}
                        className={`p-2 rounded-lg border text-sm transition ${
                          formData.acceptedMetals.includes(key as MetalType)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        {formData.acceptedMetals.includes(key as MetalType) && '✓ '}
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-2">الحد الأدنى للكمية (كجم)</label>
                  <input
                    type="number"
                    value={formData.minWeightKg}
                    onChange={(e) => setFormData((f) => ({ ...f, minWeightKg: e.target.value }))}
                    placeholder="مثال: 10"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
                <div>
                  <label className="block font-medium mb-2">الحد الأقصى للكمية (كجم)</label>
                  <input
                    type="number"
                    value={formData.maxWeightKg}
                    onChange={(e) => setFormData((f) => ({ ...f, maxWeightKg: e.target.value }))}
                    placeholder="مثال: 5000"
                    className="w-full border rounded-lg px-4 py-3"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button onClick={() => setStep(1)} className="text-gray-600 px-6 py-3">
                  السابق
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={formData.specializations.length === 0}
                  className="bg-orange-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-orange-700 transition disabled:opacity-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Business Info */}
          {step === 3 && (
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-6">بيانات النشاط</h2>

              <div className="space-y-6">
                {/* Business Name */}
                {formData.dealerType !== 'INDIVIDUAL_COLLECTOR' && (
                  <div>
                    <label className="block font-medium mb-2">اسم الشركة / المنشأة</label>
                    <input
                      type="text"
                      value={formData.businessName}
                      onChange={(e) => setFormData((f) => ({ ...f, businessName: e.target.value }))}
                      placeholder="اسم نشاطك التجاري"
                      className="w-full border rounded-lg px-4 py-3"
                    />
                  </div>
                )}

                {/* Documents */}
                {['RECYCLING_COMPANY', 'FACTORY', 'EXPORT_COMPANY', 'SCRAP_DEALER'].includes(
                  formData.dealerType
                ) && (
                  <div className="p-4 bg-gray-50 rounded-lg space-y-4">
                    <h3 className="font-medium">المستندات (للتوثيق)</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">رقم السجل التجاري</label>
                        <input
                          type="text"
                          value={formData.commercialRegNo}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, commercialRegNo: e.target.value }))
                          }
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">رقم البطاقة الضريبية</label>
                        <input
                          type="text"
                          value={formData.taxCardNo}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, taxCardNo: e.target.value }))
                          }
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    </div>
                    {formData.dealerType === 'RECYCLING_COMPANY' && (
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          رقم رخصة إعادة التدوير
                        </label>
                        <input
                          type="text"
                          value={formData.recyclingLicenseNo}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, recyclingLicenseNo: e.target.value }))
                          }
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                    )}
                  </div>
                )}

                {/* Location */}
                <div>
                  <h3 className="font-medium mb-4">الموقع</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">المحافظة</label>
                      <select
                        value={formData.governorate}
                        onChange={(e) =>
                          setFormData((f) => ({ ...f, governorate: e.target.value }))
                        }
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
                      <label className="block text-sm text-gray-600 mb-1">المدينة</label>
                      <input
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData((f) => ({ ...f, city: e.target.value }))}
                        placeholder="المدينة أو الحي"
                        className="w-full border rounded-lg px-4 py-3"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">العنوان بالتفصيل</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData((f) => ({ ...f, address: e.target.value }))}
                      placeholder="الشارع والمنطقة"
                      className="w-full border rounded-lg px-4 py-3"
                    />
                  </div>
                </div>

                {/* Pickup Service */}
                <div className="p-4 bg-green-50 rounded-lg">
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
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">رسوم التوصيل (ج.م)</label>
                        <input
                          type="number"
                          value={formData.pickupFee}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, pickupFee: e.target.value }))
                          }
                          placeholder="0 للمجاني"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">نطاق التوصيل (كم)</label>
                        <input
                          type="number"
                          value={formData.pickupRadiusKm}
                          onChange={(e) =>
                            setFormData((f) => ({ ...f, pickupRadiusKm: e.target.value }))
                          }
                          placeholder="مثال: 30"
                          className="w-full border rounded-lg px-3 py-2"
                        />
                      </div>
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
                  {loading ? 'جاري التسجيل...' : 'إتمام التسجيل'}
                </button>
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="mt-8 bg-amber-50 rounded-xl p-6">
            <h3 className="font-bold text-lg mb-4 text-amber-800">مميزات التسجيل كتاجر</h3>
            <ul className="space-y-2 text-amber-700">
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>الظهور في دليل التجار المعتمدين</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>استقبال عروض البيع من المستخدمين</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>إنشاء طلبات شراء بالجملة</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>شارة التوثيق بعد التحقق</span>
              </li>
              <li className="flex items-center gap-2">
                <span>✓</span>
                <span>تقييمات وآراء العملاء</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
