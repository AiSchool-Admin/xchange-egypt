'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowRightIcon,
  BellAlertIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  DevicePhoneMobileIcon,
  EnvelopeIcon,
  ChatBubbleLeftRightIcon,
  InformationCircleIcon,
  ArrowTrendingDownIcon,
  SparklesIcon,
  CheckIcon
} from '@heroicons/react/24/outline';

// Provider configuration
const PROVIDERS = [
  { id: 'ALL', name: 'All Providers', nameAr: 'جميع التطبيقات', color: 'bg-gradient-to-r from-purple-500 to-indigo-500', logo: '🚗' },
  { id: 'UBER', name: 'Uber', nameAr: 'أوبر', color: 'bg-black', logo: '🚗' },
  { id: 'CAREEM', name: 'Careem', nameAr: 'كريم', color: 'bg-green-600', logo: '🚕' },
  { id: 'BOLT', name: 'Bolt', nameAr: 'بولت', color: 'bg-[#34D186]', logo: '⚡' },
  { id: 'INDRIVE', name: 'inDrive', nameAr: 'إن درايف', color: 'bg-[#C8F026]', logo: '🤝' },
  { id: 'DIDI', name: 'DiDi', nameAr: 'ديدي', color: 'bg-orange-500', logo: '🔶' },
  { id: 'SWVL', name: 'Swvl', nameAr: 'سويفل', color: 'bg-red-600', logo: '🚌' },
  { id: 'HALAN', name: 'Halan', nameAr: 'هلان', color: 'bg-yellow-500', logo: '🛵' },
];

const VEHICLE_TYPES = [
  { id: 'ALL', name: 'Any Vehicle', nameAr: 'أي نوع', icon: '🚗' },
  { id: 'ECONOMY', name: 'Economy', nameAr: 'اقتصادي', icon: '💰' },
  { id: 'COMFORT', name: 'Comfort', nameAr: 'مريح', icon: '🚙' },
  { id: 'PREMIUM', name: 'Premium', nameAr: 'فاخر', icon: '✨' },
  { id: 'XL', name: 'XL / Van', nameAr: 'عائلي', icon: '🚐' },
];

// Popular locations
const POPULAR_LOCATIONS = [
  { name: 'Cairo Airport', nameAr: 'مطار القاهرة', lat: 30.1219, lng: 31.4056 },
  { name: 'Smart Village', nameAr: 'القرية الذكية', lat: 30.0708, lng: 31.0169 },
  { name: 'Tahrir Square', nameAr: 'ميدان التحرير', lat: 30.0444, lng: 31.2357 },
  { name: 'Cairo Festival City', nameAr: 'كايرو فيستيفال سيتي', lat: 30.0285, lng: 31.4085 },
  { name: 'Mall of Arabia', nameAr: 'مول العرب', lat: 29.9728, lng: 30.9428 },
  { name: 'Maadi Grand Mall', nameAr: 'المعادي جراند مول', lat: 29.9602, lng: 31.2569 },
];

interface SavedAddress {
  id: string;
  name: string;
  nameAr: string;
  address: string;
  addressAr: string;
  lat: number;
  lng: number;
}

export default function NewPriceAlertPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);

  // Form state
  const [formData, setFormData] = useState({
    pickupAddress: '',
    pickupAddressAr: '',
    pickupLat: 0,
    pickupLng: 0,
    dropoffAddress: '',
    dropoffAddressAr: '',
    dropoffLat: 0,
    dropoffLng: 0,
    targetPrice: 0,
    suggestedPrice: 0,
    currentAvgPrice: 0,
    provider: 'ALL',
    vehicleType: 'ALL',
    expiresInDays: 7,
    notifyPush: true,
    notifyEmail: false,
    notifySms: false,
  });

  const [isCalculating, setIsCalculating] = useState(false);

  // Load saved addresses
  useEffect(() => {
    const stored = localStorage.getItem('xchange_saved_addresses');
    if (stored) {
      setSavedAddresses(JSON.parse(stored));
    }
  }, []);

  // Calculate estimated price when locations are selected
  useEffect(() => {
    if (formData.pickupLat && formData.dropoffLat) {
      calculateEstimate();
    }
  }, [formData.pickupLat, formData.dropoffLat, formData.provider, formData.vehicleType]);

  const calculateEstimate = () => {
    setIsCalculating(true);

    // Simulate price calculation
    setTimeout(() => {
      const distance = calculateDistance(
        formData.pickupLat, formData.pickupLng,
        formData.dropoffLat, formData.dropoffLng
      );

      // Base pricing formula
      const baseFare = 15;
      const perKm = 6;
      const avgPrice = Math.round(baseFare + (distance * perKm));
      const suggestedTarget = Math.round(avgPrice * 0.85); // 15% discount target

      setFormData(prev => ({
        ...prev,
        currentAvgPrice: avgPrice,
        suggestedPrice: suggestedTarget,
        targetPrice: prev.targetPrice || suggestedTarget
      }));

      setIsCalculating(false);
    }, 500);
  };

  // Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Select location
  const selectLocation = (type: 'pickup' | 'dropoff', location: { nameAr: string; lat: number; lng: number }) => {
    if (type === 'pickup') {
      setFormData(prev => ({
        ...prev,
        pickupAddressAr: location.nameAr,
        pickupLat: location.lat,
        pickupLng: location.lng
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        dropoffAddressAr: location.nameAr,
        dropoffLat: location.lat,
        dropoffLng: location.lng
      }));
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    // Create alert object
    const newAlert = {
      id: Date.now().toString(),
      ...formData,
      isActive: true,
      isTriggered: false,
      priceHistory: [{ price: formData.currentAvgPrice, timestamp: new Date().toISOString() }],
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + formData.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    };

    // Save to localStorage
    const existing = JSON.parse(localStorage.getItem('xchange_price_alerts') || '[]');
    localStorage.setItem('xchange_price_alerts', JSON.stringify([newAlert, ...existing]));

    // Redirect to alerts page
    router.push('/rides/alerts');
  };

  // Validation
  const canProceed = () => {
    if (step === 1) {
      return formData.pickupLat && formData.dropoffLat;
    }
    if (step === 2) {
      return formData.targetPrice > 0;
    }
    return true;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <Link href="/rides/alerts" className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition-colors">
              <ArrowRightIcon className="w-5 h-5" />
              <span>العودة للتنبيهات</span>
            </Link>

            <div className="flex items-center gap-3 mb-2">
              <BellAlertIcon className="w-10 h-10" />
              <h1 className="text-3xl font-bold">تنبيه سعر جديد</h1>
            </div>
            <p className="text-white/80">سنخبرك فور انخفاض السعر للمستوى المطلوب</p>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'المسار' },
              { num: 2, label: 'السعر' },
              { num: 3, label: 'الإعدادات' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className={`flex items-center gap-2 ${step >= s.num ? 'text-orange-600' : 'text-gray-400'}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step > s.num
                      ? 'bg-green-500 text-white'
                      : step === s.num
                        ? 'bg-orange-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {step > s.num ? <CheckIcon className="w-5 h-5" /> : s.num}
                  </div>
                  <span className="font-medium hidden sm:block">{s.label}</span>
                </div>
                {i < 2 && (
                  <div className={`w-16 sm:w-24 h-1 mx-2 rounded ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Step 1: Route Selection */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MapPinIcon className="w-6 h-6 text-orange-600" />
                حدد مسار رحلتك
              </h2>

              {/* Pickup */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">نقطة الانطلاق</label>
                <input
                  type="text"
                  value={formData.pickupAddressAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, pickupAddressAr: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="من أين؟"
                />

                {/* Saved Addresses */}
                {savedAddresses.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-2">العناوين المحفوظة</p>
                    <div className="flex flex-wrap gap-2">
                      {savedAddresses.slice(0, 3).map(addr => (
                        <button
                          key={addr.id}
                          onClick={() => selectLocation('pickup', addr)}
                          className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                            formData.pickupAddressAr === addr.addressAr
                              ? 'bg-orange-600 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {addr.nameAr}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Popular Locations */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">أماكن شائعة</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_LOCATIONS.slice(0, 4).map(loc => (
                      <button
                        key={loc.nameAr}
                        onClick={() => selectLocation('pickup', loc)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          formData.pickupAddressAr === loc.nameAr
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {loc.nameAr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Dropoff */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">الوجهة</label>
                <input
                  type="text"
                  value={formData.dropoffAddressAr}
                  onChange={(e) => setFormData(prev => ({ ...prev, dropoffAddressAr: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="إلى أين؟"
                />

                {/* Popular Locations */}
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">أماكن شائعة</p>
                  <div className="flex flex-wrap gap-2">
                    {POPULAR_LOCATIONS.filter(l => l.nameAr !== formData.pickupAddressAr).slice(0, 4).map(loc => (
                      <button
                        key={loc.nameAr}
                        onClick={() => selectLocation('dropoff', loc)}
                        className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                          formData.dropoffAddressAr === loc.nameAr
                            ? 'bg-orange-600 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {loc.nameAr}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Provider & Vehicle Selection */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">تفضيلات (اختياري)</h3>

              {/* Provider */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">التطبيق</label>
                <div className="grid grid-cols-4 gap-2">
                  {PROVIDERS.slice(0, 8).map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => setFormData(prev => ({ ...prev, provider: provider.id }))}
                      className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        formData.provider === provider.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{provider.logo}</span>
                      <span className="text-xs">{provider.nameAr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Vehicle Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع السيارة</label>
                <div className="grid grid-cols-5 gap-2">
                  {VEHICLE_TYPES.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setFormData(prev => ({ ...prev, vehicleType: type.id }))}
                      className={`p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                        formData.vehicleType === type.id
                          ? 'border-orange-500 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-xl">{type.icon}</span>
                      <span className="text-xs">{type.nameAr}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Price Target */}
        {step === 2 && (
          <div className="space-y-6">
            {/* Route Summary */}
            <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex flex-col items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <div className="w-0.5 h-6 bg-gray-300"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-500">من: <span className="text-gray-900 font-medium">{formData.pickupAddressAr}</span></p>
                  <p className="text-sm text-gray-500">إلى: <span className="text-gray-900 font-medium">{formData.dropoffAddressAr}</span></p>
                </div>
              </div>
            </div>

            {/* Price Input */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <CurrencyDollarIcon className="w-6 h-6 text-orange-600" />
                السعر المستهدف
              </h2>

              {isCalculating ? (
                <div className="text-center py-8">
                  <div className="animate-spin w-10 h-10 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-500">جاري حساب الأسعار...</p>
                </div>
              ) : (
                <>
                  {/* Current Average */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-gray-600">متوسط السعر الحالي</span>
                      <span className="text-2xl font-bold text-gray-900">{formData.currentAvgPrice} ج.م</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-green-600">
                      <SparklesIcon className="w-4 h-4" />
                      <span>نقترح سعر {formData.suggestedPrice} ج.م (وفر {Math.round((1 - formData.suggestedPrice / formData.currentAvgPrice) * 100)}%)</span>
                    </div>
                  </div>

                  {/* Target Price Input */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">أريد إشعاري عندما يصل السعر إلى</label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.targetPrice || ''}
                        onChange={(e) => setFormData(prev => ({ ...prev, targetPrice: Number(e.target.value) }))}
                        className="w-full px-4 py-4 text-2xl font-bold text-center border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="0"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-gray-500">ج.م</span>
                    </div>
                  </div>

                  {/* Quick Select Buttons */}
                  <div className="grid grid-cols-4 gap-2 mb-6">
                    {[
                      { label: '-5%', value: Math.round(formData.currentAvgPrice * 0.95) },
                      { label: '-10%', value: Math.round(formData.currentAvgPrice * 0.90) },
                      { label: '-15%', value: Math.round(formData.currentAvgPrice * 0.85) },
                      { label: '-20%', value: Math.round(formData.currentAvgPrice * 0.80) },
                    ].map(option => (
                      <button
                        key={option.label}
                        onClick={() => setFormData(prev => ({ ...prev, targetPrice: option.value }))}
                        className={`p-3 rounded-xl border-2 transition-all ${
                          formData.targetPrice === option.value
                            ? 'border-orange-500 bg-orange-50 text-orange-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-lg font-bold">{option.value}</div>
                        <div className="text-xs text-gray-500">{option.label}</div>
                      </button>
                    ))}
                  </div>

                  {/* Savings Preview */}
                  {formData.targetPrice > 0 && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
                          <ArrowTrendingDownIcon className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="text-sm text-green-700">ستوفر تقريباً</p>
                          <p className="text-2xl font-bold text-green-600">
                            {formData.currentAvgPrice - formData.targetPrice} ج.م
                            <span className="text-sm font-normal text-green-600 mr-2">
                              ({Math.round((1 - formData.targetPrice / formData.currentAvgPrice) * 100)}%)
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Settings */}
        {step === 3 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
              <h2 className="text-xl font-bold mb-4">ملخص التنبيه</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-white/80">المسار</span>
                  <span className="font-medium">{formData.pickupAddressAr} → {formData.dropoffAddressAr}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">السعر المستهدف</span>
                  <span className="font-bold text-2xl">{formData.targetPrice} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-white/80">التوفير المتوقع</span>
                  <span className="font-medium">{formData.currentAvgPrice - formData.targetPrice} ج.م ({Math.round((1 - formData.targetPrice / formData.currentAvgPrice) * 100)}%)</span>
                </div>
              </div>
            </div>

            {/* Expiration */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <ClockIcon className="w-5 h-5 text-orange-600" />
                مدة التنبيه
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { days: 3, label: '3 أيام' },
                  { days: 7, label: 'أسبوع' },
                  { days: 14, label: 'أسبوعين' },
                  { days: 30, label: 'شهر' },
                ].map(option => (
                  <button
                    key={option.days}
                    onClick={() => setFormData(prev => ({ ...prev, expiresInDays: option.days }))}
                    className={`p-3 rounded-xl border-2 transition-all ${
                      formData.expiresInDays === option.days
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notification Settings */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-4">طريقة الإشعار</h3>
              <div className="space-y-3">
                {[
                  { key: 'notifyPush', icon: DevicePhoneMobileIcon, label: 'إشعارات التطبيق', desc: 'إشعار فوري على هاتفك' },
                  { key: 'notifyEmail', icon: EnvelopeIcon, label: 'البريد الإلكتروني', desc: 'رسالة على بريدك' },
                  { key: 'notifySms', icon: ChatBubbleLeftRightIcon, label: 'رسالة SMS', desc: 'رسالة نصية على رقمك' },
                ].map(option => (
                  <label
                    key={option.key}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                      formData[option.key as keyof typeof formData]
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData[option.key as keyof typeof formData] as boolean}
                      onChange={(e) => setFormData(prev => ({ ...prev, [option.key]: e.target.checked }))}
                      className="w-5 h-5 text-orange-600 rounded focus:ring-orange-500"
                    />
                    <option.icon className="w-6 h-6 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 flex items-start gap-3">
              <InformationCircleIcon className="w-6 h-6 text-blue-600 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">كيف يعمل؟</p>
                <p>نراقب الأسعار كل 15 دقيقة ونرسل لك إشعاراً فورياً عندما يصل السعر للمستوى المطلوب. يمكنك إيقاف التنبيه في أي وقت.</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-4 mt-8">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 px-6 py-4 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all"
            >
              السابق
            </button>
          )}
          {step < 3 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className={`flex-1 px-6 py-4 rounded-xl font-bold transition-all ${
                canProceed()
                  ? 'bg-orange-600 text-white hover:bg-orange-700'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
            >
              التالي
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              className="flex-1 px-6 py-4 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-xl font-bold hover:from-orange-700 hover:to-amber-700 transition-all flex items-center justify-center gap-2"
            >
              <BellAlertIcon className="w-6 h-6" />
              إنشاء التنبيه
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
