'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Egyptian Governorates
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية', 'الغربية',
  'الدقهلية', 'المنوفية', 'البحيرة', 'كفر الشيخ', 'دمياط', 'بورسعيد',
  'الإسماعيلية', 'السويس', 'شمال سيناء', 'جنوب سيناء', 'البحر الأحمر',
  'الفيوم', 'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا',
  'الأقصر', 'أسوان', 'الوادي الجديد', 'مطروح'
];

const PACKAGE_TYPES = [
  { id: 'documents', name: 'مستندات', icon: '📄' },
  { id: 'parcel', name: 'طرد', icon: '📦' },
  { id: 'electronics', name: 'إلكترونيات', icon: '📱' },
  { id: 'clothing', name: 'ملابس', icon: '👕' },
  { id: 'furniture', name: 'أثاث', icon: '🪑' },
  { id: 'fragile', name: 'قابل للكسر', icon: '⚠️' },
  { id: 'other', name: 'أخرى', icon: '📋' },
];

interface FormData {
  // Pickup
  pickupAddress: string;
  pickupCity: string;
  pickupGov: string;
  pickupLandmark: string;
  senderName: string;
  senderPhone: string;

  // Dropoff
  dropoffAddress: string;
  dropoffCity: string;
  dropoffGov: string;
  dropoffLandmark: string;
  receiverName: string;
  receiverPhone: string;

  // Package
  packageType: string;
  description: string;
  weight: number;
  quantity: number;
  fragile: boolean;
  requiresCooling: boolean;

  // Schedule
  scheduledDate: string;
  flexibility: 'EXACT' | 'FLEXIBLE_HOURS' | 'FLEXIBLE_DAYS';

  // Payment
  paymentMethod: 'CASH' | 'CARD' | 'COD';
  codAmount: number;

  // Budget
  budgetMin: number;
  budgetMax: number;

  // Notes
  notes: string;
}

export default function NewShippingRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [estimate, setEstimate] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    pickupAddress: '',
    pickupCity: '',
    pickupGov: 'القاهرة',
    pickupLandmark: '',
    senderName: '',
    senderPhone: '',
    dropoffAddress: '',
    dropoffCity: '',
    dropoffGov: 'الإسكندرية',
    dropoffLandmark: '',
    receiverName: '',
    receiverPhone: '',
    packageType: 'parcel',
    description: '',
    weight: 1,
    quantity: 1,
    fragile: false,
    requiresCooling: false,
    scheduledDate: new Date().toISOString().split('T')[0],
    flexibility: 'FLEXIBLE_HOURS',
    paymentMethod: 'CASH',
    codAmount: 0,
    budgetMin: 0,
    budgetMax: 0,
    notes: '',
  });

  const updateForm = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getEstimate = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1000));

      const isIntercity = formData.pickupGov !== formData.dropoffGov;
      const basePrice = isIntercity ? 50 : 30;
      const weightPrice = formData.weight * 5;

      setEstimate({
        min: Math.round((basePrice + weightPrice) * 0.8),
        max: Math.round((basePrice + weightPrice) * 1.3),
      });

      updateForm('budgetMin', Math.round((basePrice + weightPrice) * 0.8));
      updateForm('budgetMax', Math.round((basePrice + weightPrice) * 1.3));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(r => setTimeout(r, 1500));

      // TODO: Submit to API
      alert('تم نشر طلبك بنجاح! ستستلم عروض الأسعار قريباً.');
      router.push('/marketplace');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 2) {
      getEstimate();
    }
    setStep(prev => Math.min(prev + 1, 4));
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/marketplace" className="text-gray-500 hover:text-gray-700">
              ✕
            </Link>
            <div>
              <h1 className="text-lg font-bold text-gray-900">طلب شحن جديد</h1>
              <p className="text-gray-500 text-sm">الخطوة {step} من 4</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex gap-2 mt-4">
            {[1, 2, 3, 4].map(s => (
              <div
                key={s}
                className={`flex-1 h-1 rounded-full ${
                  s <= step ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-6 pb-24">
        {/* Step 1: Pickup Location */}
        {step === 1 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <span className="text-green-600 font-bold">1</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">عنوان الاستلام</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المحافظة *
                  </label>
                  <select
                    value={formData.pickupGov}
                    onChange={e => updateForm('pickupGov', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المدينة / الحي *
                  </label>
                  <input
                    type="text"
                    value={formData.pickupCity}
                    onChange={e => updateForm('pickupCity', e.target.value)}
                    placeholder="مثال: المعادي، حدائق المعادي"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان التفصيلي *
                  </label>
                  <input
                    type="text"
                    value={formData.pickupAddress}
                    onChange={e => updateForm('pickupAddress', e.target.value)}
                    placeholder="الشارع، رقم المبنى، الطابق"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    علامة مميزة (اختياري)
                  </label>
                  <input
                    type="text"
                    value={formData.pickupLandmark}
                    onChange={e => updateForm('pickupLandmark', e.target.value)}
                    placeholder="بجوار مسجد، أمام صيدلية..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم المرسل *
                    </label>
                    <input
                      type="text"
                      value={formData.senderName}
                      onChange={e => updateForm('senderName', e.target.value)}
                      placeholder="الاسم"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      هاتف المرسل *
                    </label>
                    <input
                      type="tel"
                      value={formData.senderPhone}
                      onChange={e => updateForm('senderPhone', e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Dropoff */}
            <div className="bg-white rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <span className="text-red-600 font-bold">2</span>
                </div>
                <h2 className="text-lg font-bold text-gray-900">عنوان التوصيل</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المحافظة *
                  </label>
                  <select
                    value={formData.dropoffGov}
                    onChange={e => updateForm('dropoffGov', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  >
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المدينة / الحي *
                  </label>
                  <input
                    type="text"
                    value={formData.dropoffCity}
                    onChange={e => updateForm('dropoffCity', e.target.value)}
                    placeholder="مثال: سموحة"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان التفصيلي *
                  </label>
                  <input
                    type="text"
                    value={formData.dropoffAddress}
                    onChange={e => updateForm('dropoffAddress', e.target.value)}
                    placeholder="الشارع، رقم المبنى، الطابق"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم المستلم *
                    </label>
                    <input
                      type="text"
                      value={formData.receiverName}
                      onChange={e => updateForm('receiverName', e.target.value)}
                      placeholder="الاسم"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      هاتف المستلم *
                    </label>
                    <input
                      type="tel"
                      value={formData.receiverPhone}
                      onChange={e => updateForm('receiverPhone', e.target.value)}
                      placeholder="01xxxxxxxxx"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                      dir="ltr"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Package Details */}
        {step === 2 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">تفاصيل الشحنة</h2>

              <div className="space-y-6">
                {/* Package Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    نوع الشحنة *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {PACKAGE_TYPES.map(type => (
                      <button
                        key={type.id}
                        type="button"
                        onClick={() => updateForm('packageType', type.id)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          formData.packageType === type.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{type.icon}</div>
                        <div className="text-sm font-medium">{type.name}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    وصف الشحنة *
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={e => updateForm('description', e.target.value)}
                    placeholder="صف محتويات الشحنة..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  />
                </div>

                {/* Weight & Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الوزن التقريبي (كجم) *
                    </label>
                    <input
                      type="number"
                      min="0.1"
                      step="0.1"
                      value={formData.weight}
                      onChange={e => updateForm('weight', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عدد القطع
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={e => updateForm('quantity', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>

                {/* Special Requirements */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    متطلبات خاصة
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.fragile}
                        onChange={e => updateForm('fragile', e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-xl">⚠️</span>
                      <div>
                        <div className="font-medium">قابل للكسر</div>
                        <div className="text-gray-500 text-sm">يحتاج عناية خاصة</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.requiresCooling}
                        onChange={e => updateForm('requiresCooling', e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded"
                      />
                      <span className="text-xl">❄️</span>
                      <div>
                        <div className="font-medium">يحتاج تبريد</div>
                        <div className="text-gray-500 text-sm">مواد غذائية أو طبية</div>
                      </div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Schedule & Payment */}
        {step === 3 && (
          <div className="max-w-xl mx-auto space-y-6">
            {/* Price Estimate */}
            {estimate && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl p-6 text-white">
                <div className="text-sm opacity-80 mb-1">السعر التقديري</div>
                <div className="text-3xl font-bold mb-2">
                  {estimate.min} - {estimate.max} ج.م
                </div>
                <div className="text-sm opacity-80">
                  💡 ستتلقى عروض أسعار دقيقة من مزودي الخدمة
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">الموعد والدفع</h2>

              <div className="space-y-6">
                {/* Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    تاريخ الاستلام *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={e => updateForm('scheduledDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  />
                </div>

                {/* Flexibility */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    مرونة الموعد
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'EXACT', label: 'موعد محدد', desc: 'يجب الاستلام في هذا اليوم' },
                      { value: 'FLEXIBLE_HOURS', label: 'مرن بالساعات', desc: 'يمكن الاستلام في نفس اليوم أو التالي' },
                      { value: 'FLEXIBLE_DAYS', label: 'مرن بالأيام', desc: 'يمكن الاستلام خلال 3 أيام' },
                    ].map(opt => (
                      <label
                        key={opt.value}
                        className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer ${
                          formData.flexibility === opt.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="flexibility"
                          value={opt.value}
                          checked={formData.flexibility === opt.value}
                          onChange={e => updateForm('flexibility', e.target.value)}
                          className="w-5 h-5 text-purple-600"
                        />
                        <div>
                          <div className="font-medium">{opt.label}</div>
                          <div className="text-gray-500 text-sm">{opt.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    طريقة الدفع *
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'CASH', label: 'نقداً', icon: '💵' },
                      { value: 'CARD', label: 'بطاقة', icon: '💳' },
                      { value: 'COD', label: 'عند الاستلام', icon: '🤝' },
                    ].map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateForm('paymentMethod', opt.value)}
                        className={`p-4 rounded-xl border-2 text-center transition-all ${
                          formData.paymentMethod === opt.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{opt.icon}</div>
                        <div className="text-sm font-medium">{opt.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* COD Amount */}
                {formData.paymentMethod === 'COD' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      مبلغ التحصيل عند الاستلام (ج.م)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.codAmount}
                      onChange={e => updateForm('codAmount', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <p className="text-gray-500 text-sm mt-1">
                      المبلغ الذي سيتم تحصيله من المستلم
                    </p>
                  </div>
                )}

                {/* Budget Range */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    نطاق الميزانية (اختياري)
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      min="0"
                      value={formData.budgetMin || ''}
                      onChange={e => updateForm('budgetMin', parseFloat(e.target.value) || 0)}
                      placeholder="من"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      value={formData.budgetMax || ''}
                      onChange={e => updateForm('budgetMax', parseFloat(e.target.value) || 0)}
                      placeholder="إلى"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Review */}
        {step === 4 && (
          <div className="max-w-xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">مراجعة الطلب</h2>

              {/* Summary */}
              <div className="space-y-6">
                {/* Route */}
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <div className="w-0.5 h-16 bg-gray-200"></div>
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  </div>
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="text-sm text-gray-500">من</div>
                      <div className="font-medium">{formData.pickupGov}، {formData.pickupCity}</div>
                      <div className="text-gray-600 text-sm">{formData.pickupAddress}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500">إلى</div>
                      <div className="font-medium">{formData.dropoffGov}، {formData.dropoffCity}</div>
                      <div className="text-gray-600 text-sm">{formData.dropoffAddress}</div>
                    </div>
                  </div>
                </div>

                <hr />

                {/* Package */}
                <div>
                  <div className="text-sm text-gray-500 mb-2">الشحنة</div>
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">
                      {PACKAGE_TYPES.find(t => t.id === formData.packageType)?.icon}
                    </span>
                    <div>
                      <div className="font-medium">{formData.description || 'طرد'}</div>
                      <div className="text-gray-500 text-sm">
                        {formData.weight} كجم • {formData.quantity} قطعة
                      </div>
                    </div>
                  </div>
                </div>

                <hr />

                {/* Schedule */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">التاريخ</div>
                    <div className="font-medium">{formData.scheduledDate}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">الدفع</div>
                    <div className="font-medium">
                      {formData.paymentMethod === 'CASH' && 'نقداً'}
                      {formData.paymentMethod === 'CARD' && 'بطاقة'}
                      {formData.paymentMethod === 'COD' && `تحصيل ${formData.codAmount} ج.م`}
                    </div>
                  </div>
                </div>

                {estimate && (
                  <>
                    <hr />
                    <div className="bg-purple-50 rounded-xl p-4">
                      <div className="text-sm text-purple-600 mb-1">السعر التقديري</div>
                      <div className="text-2xl font-bold text-purple-700">
                        {estimate.min} - {estimate.max} ج.م
                      </div>
                    </div>
                  </>
                )}

                {/* Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات إضافية (اختياري)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e => updateForm('notes', e.target.value)}
                    placeholder="أي تعليمات خاصة للمزود..."
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Terms */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <p className="text-amber-800 text-sm">
                ⚠️ بالضغط على "نشر الطلب" فإنك توافق على شروط الاستخدام وسياسة الخصوصية
              </p>
            </div>
          </div>
        )}
      </main>

      {/* Footer Actions */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
        <div className="container mx-auto max-w-xl flex gap-4">
          {step > 1 && (
            <button
              onClick={prevStep}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium text-gray-700 transition-colors"
            >
              السابق
            </button>
          )}
          {step < 4 ? (
            <button
              onClick={nextStep}
              className="flex-1 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition-colors"
            >
              التالي
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex-1 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>جاري النشر...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>نشر الطلب</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
