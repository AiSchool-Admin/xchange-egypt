'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Egyptian governorates
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر',
  'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية',
  'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'أسوان',
  'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'الشرقية',
  'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا',
  'شمال سيناء', 'سوهاج'
];

// Vehicle types for rides
const VEHICLE_TYPES = [
  { value: 'SEDAN', label: 'سيدان', labelEn: 'Sedan', capacity: 4, icon: '🚗' },
  { value: 'SUV', label: 'SUV', labelEn: 'SUV', capacity: 6, icon: '🚙' },
  { value: 'MINIVAN', label: 'ميني فان', labelEn: 'Minivan', capacity: 7, icon: '🚐' },
  { value: 'BUS_SMALL', label: 'ميني باص', labelEn: 'Mini Bus', capacity: 14, icon: '🚌' },
  { value: 'BUS_LARGE', label: 'باص كبير', labelEn: 'Large Bus', capacity: 50, icon: '🚌' },
];

// Available amenities
const AMENITIES = [
  { value: 'AC', label: 'تكييف', icon: '❄️' },
  { value: 'WIFI', label: 'واي فاي', icon: '📶' },
  { value: 'USB_CHARGER', label: 'شاحن USB', icon: '🔌' },
  { value: 'WATER', label: 'مياه', icon: '💧' },
  { value: 'SNACKS', label: 'وجبات خفيفة', icon: '🍪' },
  { value: 'LUGGAGE_SPACE', label: 'مساحة أمتعة كبيرة', icon: '🧳' },
];

interface FormData {
  // Step 1: Locations
  pickupGovernorate: string;
  pickupCity: string;
  pickupAddress: string;
  pickupLandmark: string;
  dropoffGovernorate: string;
  dropoffCity: string;
  dropoffAddress: string;
  dropoffLandmark: string;
  // Step 2: Ride Details
  passengers: number;
  luggage: number;
  vehiclePreference: string;
  amenities: string[];
  // Step 3: Schedule & Payment
  scheduledDate: string;
  scheduledTime: string;
  flexibility: 'EXACT' | 'FLEXIBLE_HOURS' | 'FLEXIBLE_DAYS';
  paymentMethod: 'CASH' | 'CARD' | 'WALLET';
  budgetMin: string;
  budgetMax: string;
  // Step 4: Contact
  customerName: string;
  customerPhone: string;
  customerNotes: string;
}

export default function NewRideRequestPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showEstimate, setShowEstimate] = useState(false);
  const [estimate, setEstimate] = useState<{ min: number; max: number } | null>(null);

  const [formData, setFormData] = useState<FormData>({
    pickupGovernorate: '',
    pickupCity: '',
    pickupAddress: '',
    pickupLandmark: '',
    dropoffGovernorate: '',
    dropoffCity: '',
    dropoffAddress: '',
    dropoffLandmark: '',
    passengers: 1,
    luggage: 0,
    vehiclePreference: '',
    amenities: [],
    scheduledDate: '',
    scheduledTime: '',
    flexibility: 'EXACT',
    paymentMethod: 'CASH',
    budgetMin: '',
    budgetMax: '',
    customerName: '',
    customerPhone: '',
    customerNotes: '',
  });

  const updateField = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleAmenity = (amenity: string) => {
    setFormData(prev => ({
      ...prev,
      amenities: prev.amenities.includes(amenity)
        ? prev.amenities.filter(a => a !== amenity)
        : [...prev.amenities, amenity],
    }));
  };

  const getEstimate = async () => {
    // Mock estimate based on governorates
    const isIntercity = formData.pickupGovernorate !== formData.dropoffGovernorate;
    const baseDistance = isIntercity ? 150 : 30; // km
    const perKmRate = formData.passengers <= 4 ? 5 : formData.passengers <= 7 ? 6 : 8;
    const basePrice = baseDistance * perKmRate;

    setEstimate({
      min: Math.round(basePrice * 0.85),
      max: Math.round(basePrice * 1.25),
    });
    setShowEstimate(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Redirect to requests list
      router.push('/marketplace?tab=my-requests&success=true');
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.pickupGovernorate && formData.pickupAddress &&
               formData.dropoffGovernorate && formData.dropoffAddress;
      case 2:
        return formData.passengers > 0;
      case 3:
        return formData.scheduledDate && formData.paymentMethod;
      case 4:
        return formData.customerName && formData.customerPhone;
      default:
        return true;
    }
  };

  // Get recommended vehicle based on passengers
  const getRecommendedVehicle = () => {
    const passengers = formData.passengers;
    if (passengers <= 4) return 'SEDAN';
    if (passengers <= 6) return 'SUV';
    if (passengers <= 7) return 'MINIVAN';
    if (passengers <= 14) return 'BUS_SMALL';
    return 'BUS_LARGE';
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-600 to-blue-700 text-white">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-4"
          >
            <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            رجوع
          </button>
          <h1 className="text-2xl font-bold">طلب رحلة بين المدن</h1>
          <p className="text-blue-100 mt-1">احصل على عروض أسعار من السائقين</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex justify-between">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    s < step
                      ? 'bg-green-500 text-white'
                      : s === step
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {s < step ? '✓' : s}
                </div>
                {s < 4 && (
                  <div
                    className={`w-16 sm:w-24 h-1 mx-1 ${
                      s < step ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>المواقع</span>
            <span>تفاصيل الرحلة</span>
            <span>الموعد والدفع</span>
            <span>المراجعة</span>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Step 1: Locations */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">📍</span>
                نقطة الانطلاق
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المحافظة *
                  </label>
                  <select
                    value={formData.pickupGovernorate}
                    onChange={e => updateField('pickupGovernorate', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المدينة / المنطقة
                  </label>
                  <input
                    type="text"
                    value={formData.pickupCity}
                    onChange={e => updateField('pickupCity', e.target.value)}
                    placeholder="مثال: مدينة نصر"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان التفصيلي *
                  </label>
                  <input
                    type="text"
                    value={formData.pickupAddress}
                    onChange={e => updateField('pickupAddress', e.target.value)}
                    placeholder="الشارع، رقم المبنى"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    علامة مميزة
                  </label>
                  <input
                    type="text"
                    value={formData.pickupLandmark}
                    onChange={e => updateField('pickupLandmark', e.target.value)}
                    placeholder="بجوار مسجد، أمام مول، إلخ"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🏁</span>
                الوجهة
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المحافظة *
                  </label>
                  <select
                    value={formData.dropoffGovernorate}
                    onChange={e => updateField('dropoffGovernorate', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    المدينة / المنطقة
                  </label>
                  <input
                    type="text"
                    value={formData.dropoffCity}
                    onChange={e => updateField('dropoffCity', e.target.value)}
                    placeholder="مثال: الإبراهيمية"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    العنوان التفصيلي *
                  </label>
                  <input
                    type="text"
                    value={formData.dropoffAddress}
                    onChange={e => updateField('dropoffAddress', e.target.value)}
                    placeholder="الشارع، رقم المبنى"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    علامة مميزة
                  </label>
                  <input
                    type="text"
                    value={formData.dropoffLandmark}
                    onChange={e => updateField('dropoffLandmark', e.target.value)}
                    placeholder="بجوار محطة، أمام فندق، إلخ"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {formData.pickupGovernorate && formData.dropoffGovernorate &&
             formData.pickupGovernorate !== formData.dropoffGovernorate && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-blue-700">
                  <span className="text-xl">🚗</span>
                  <span className="font-medium">
                    رحلة بين المحافظات: {formData.pickupGovernorate} ← {formData.dropoffGovernorate}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Ride Details */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">👥</span>
                عدد الركاب
              </h2>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => updateField('passengers', Math.max(1, formData.passengers - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="text-4xl font-bold text-blue-600">{formData.passengers}</span>
                  <p className="text-sm text-gray-500">راكب</p>
                </div>
                <button
                  onClick={() => updateField('passengers', Math.min(50, formData.passengers + 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🧳</span>
                عدد الحقائب
              </h2>

              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => updateField('luggage', Math.max(0, formData.luggage - 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                >
                  -
                </button>
                <div className="text-center">
                  <span className="text-4xl font-bold text-blue-600">{formData.luggage}</span>
                  <p className="text-sm text-gray-500">حقيبة</p>
                </div>
                <button
                  onClick={() => updateField('luggage', Math.min(20, formData.luggage + 1))}
                  className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
                >
                  +
                </button>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">🚗</span>
                نوع المركبة المفضل
              </h2>

              <div className="grid grid-cols-2 gap-3">
                {VEHICLE_TYPES.map(vehicle => {
                  const isRecommended = vehicle.value === getRecommendedVehicle();
                  const isSelected = formData.vehiclePreference === vehicle.value;
                  const canFit = vehicle.capacity >= formData.passengers;

                  return (
                    <button
                      key={vehicle.value}
                      onClick={() => updateField('vehiclePreference', vehicle.value)}
                      disabled={!canFit}
                      className={`p-4 rounded-xl border-2 text-right relative ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : canFit
                          ? 'border-gray-200 hover:border-blue-300'
                          : 'border-gray-100 bg-gray-50 opacity-50'
                      }`}
                    >
                      {isRecommended && canFit && (
                        <span className="absolute top-2 left-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          مُوصى به
                        </span>
                      )}
                      <span className="text-3xl mb-2 block">{vehicle.icon}</span>
                      <span className="font-medium block">{vehicle.label}</span>
                      <span className="text-sm text-gray-500">حتى {vehicle.capacity} ركاب</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">✨</span>
                وسائل الراحة المطلوبة
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {AMENITIES.map(amenity => {
                  const isSelected = formData.amenities.includes(amenity.value);

                  return (
                    <button
                      key={amenity.value}
                      onClick={() => toggleAmenity(amenity.value)}
                      className={`p-3 rounded-xl border-2 text-center ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="text-2xl block mb-1">{amenity.icon}</span>
                      <span className="text-sm">{amenity.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Schedule & Payment */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">📅</span>
                موعد الرحلة
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    التاريخ *
                  </label>
                  <input
                    type="date"
                    value={formData.scheduledDate}
                    onChange={e => updateField('scheduledDate', e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الوقت المفضل
                  </label>
                  <input
                    type="time"
                    value={formData.scheduledTime}
                    onChange={e => updateField('scheduledTime', e.target.value)}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مرونة الموعد
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { value: 'EXACT', label: 'موعد محدد' },
                      { value: 'FLEXIBLE_HOURS', label: 'مرن (±3 ساعات)' },
                      { value: 'FLEXIBLE_DAYS', label: 'مرن (±يوم)' },
                    ].map(option => (
                      <button
                        key={option.value}
                        onClick={() => updateField('flexibility', option.value as FormData['flexibility'])}
                        className={`p-3 rounded-lg text-sm ${
                          formData.flexibility === option.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">💳</span>
                طريقة الدفع
              </h2>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'CASH', label: 'نقدي', icon: '💵' },
                  { value: 'CARD', label: 'بطاقة', icon: '💳' },
                  { value: 'WALLET', label: 'محفظة', icon: '📱' },
                ].map(method => (
                  <button
                    key={method.value}
                    onClick={() => updateField('paymentMethod', method.value as FormData['paymentMethod'])}
                    className={`p-4 rounded-xl border-2 text-center ${
                      formData.paymentMethod === method.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <span className="text-2xl block mb-1">{method.icon}</span>
                    <span className="font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">💰</span>
                الميزانية المتوقعة (اختياري)
              </h2>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1">من</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.budgetMin}
                      onChange={e => updateField('budgetMin', e.target.value)}
                      placeholder="0"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="absolute left-3 top-3 text-gray-400">ج.م</span>
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm text-gray-500 mb-1">إلى</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.budgetMax}
                      onChange={e => updateField('budgetMax', e.target.value)}
                      placeholder="0"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <span className="absolute left-3 top-3 text-gray-400">ج.م</span>
                  </div>
                </div>
              </div>

              <button
                onClick={getEstimate}
                className="mt-4 w-full py-2 border-2 border-blue-500 text-blue-600 rounded-lg font-medium hover:bg-blue-50"
              >
                احصل على تقدير السعر
              </button>

              {showEstimate && estimate && (
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">السعر المتوقع:</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {estimate.min} - {estimate.max} ج.م
                  </p>
                  <p className="text-xs text-gray-500 mt-2">
                    * تقدير أولي. ستتلقى عروض أسعار دقيقة من السائقين.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">👤</span>
                بيانات التواصل
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    الاسم *
                  </label>
                  <input
                    type="text"
                    value={formData.customerName}
                    onChange={e => updateField('customerName', e.target.value)}
                    placeholder="اسمك الكامل"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    رقم الهاتف *
                  </label>
                  <input
                    type="tel"
                    value={formData.customerPhone}
                    onChange={e => updateField('customerPhone', e.target.value)}
                    placeholder="01xxxxxxxxx"
                    dir="ltr"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ملاحظات إضافية
                  </label>
                  <textarea
                    value={formData.customerNotes}
                    onChange={e => updateField('customerNotes', e.target.value)}
                    placeholder="أي تفاصيل إضافية للسائق..."
                    rows={3}
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl p-4 shadow-sm">
              <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span className="text-2xl">📋</span>
                ملخص الطلب
              </h2>

              <div className="space-y-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">نوع الخدمة</span>
                  <span className="font-medium">رحلة بين المدن</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">من</span>
                  <span className="font-medium">{formData.pickupGovernorate} - {formData.pickupAddress}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">إلى</span>
                  <span className="font-medium">{formData.dropoffGovernorate} - {formData.dropoffAddress}</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">عدد الركاب</span>
                  <span className="font-medium">{formData.passengers} راكب</span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">عدد الحقائب</span>
                  <span className="font-medium">{formData.luggage} حقيبة</span>
                </div>

                {formData.vehiclePreference && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">نوع المركبة</span>
                    <span className="font-medium">
                      {VEHICLE_TYPES.find(v => v.value === formData.vehiclePreference)?.label}
                    </span>
                  </div>
                )}

                {formData.amenities.length > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">وسائل الراحة</span>
                    <span className="font-medium">
                      {formData.amenities.map(a => AMENITIES.find(am => am.value === a)?.label).join('، ')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">الموعد</span>
                  <span className="font-medium">
                    {formData.scheduledDate} {formData.scheduledTime && `- ${formData.scheduledTime}`}
                  </span>
                </div>

                <div className="flex justify-between py-2 border-b">
                  <span className="text-gray-500">طريقة الدفع</span>
                  <span className="font-medium">
                    {formData.paymentMethod === 'CASH' ? 'نقدي' :
                     formData.paymentMethod === 'CARD' ? 'بطاقة' : 'محفظة إلكترونية'}
                  </span>
                </div>

                {(formData.budgetMin || formData.budgetMax) && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-gray-500">الميزانية</span>
                    <span className="font-medium">
                      {formData.budgetMin && `${formData.budgetMin} ج.م`}
                      {formData.budgetMin && formData.budgetMax && ' - '}
                      {formData.budgetMax && `${formData.budgetMax} ج.م`}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex gap-3">
                <span className="text-2xl">ℹ️</span>
                <div>
                  <h3 className="font-medium text-amber-800">ماذا سيحدث بعد النشر؟</h3>
                  <ul className="mt-2 text-sm text-amber-700 space-y-1">
                    <li>• سيتم إرسال طلبك لجميع السائقين في مصر</li>
                    <li>• ستتلقى عروض أسعار من السائقين المهتمين</li>
                    <li>• يمكنك مقارنة العروض واختيار الأنسب لك</li>
                    <li>• الطلب صالح لمدة 7 أيام</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
          <div className="max-w-2xl mx-auto flex gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep(step - 1)}
                className="flex-1 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50"
              >
                السابق
              </button>
            )}

            {step < 4 ? (
              <button
                onClick={() => setStep(step + 1)}
                disabled={!canProceed()}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  canProceed()
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                التالي
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className={`flex-1 py-3 rounded-xl font-medium ${
                  canProceed() && !isSubmitting
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري النشر...
                  </span>
                ) : (
                  'نشر الطلب'
                )}
              </button>
            )}
          </div>
        </div>

        {/* Spacer for fixed bottom nav */}
        <div className="h-24" />
      </div>
    </div>
  );
}
