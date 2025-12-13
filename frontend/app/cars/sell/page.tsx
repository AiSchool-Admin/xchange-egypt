'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import apiClient from '@/lib/api/client';
import { useAuth } from '@/lib/contexts/AuthContext';

// Egyptian Governorates
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'المنوفية', 'القليوبية',
  'البحيرة', 'الغربية', 'كفر الشيخ', 'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس',
  'شمال سيناء', 'جنوب سيناء', 'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'أسوان',
  'الأقصر', 'قنا', 'سوهاج', 'أسيوط', 'المنيا', 'بني سويف', 'الفيوم'
];

// Car Makes (Popular in Egypt)
const CAR_MAKES = [
  { name: 'تويوتا', nameEn: 'Toyota' },
  { name: 'هيونداي', nameEn: 'Hyundai' },
  { name: 'كيا', nameEn: 'Kia' },
  { name: 'نيسان', nameEn: 'Nissan' },
  { name: 'شيفروليه', nameEn: 'Chevrolet' },
  { name: 'مرسيدس', nameEn: 'Mercedes-Benz' },
  { name: 'بي إم دبليو', nameEn: 'BMW' },
  { name: 'أودي', nameEn: 'Audi' },
  { name: 'فولكس فاجن', nameEn: 'Volkswagen' },
  { name: 'هوندا', nameEn: 'Honda' },
  { name: 'مازدا', nameEn: 'Mazda' },
  { name: 'ميتسوبيشي', nameEn: 'Mitsubishi' },
  { name: 'سوزوكي', nameEn: 'Suzuki' },
  { name: 'فيات', nameEn: 'Fiat' },
  { name: 'بيجو', nameEn: 'Peugeot' },
  { name: 'رينو', nameEn: 'Renault' },
  { name: 'سكودا', nameEn: 'Skoda' },
  { name: 'MG', nameEn: 'MG' },
  { name: 'شيري', nameEn: 'Chery' },
  { name: 'جيلي', nameEn: 'Geely' },
  { name: 'بي واي دي', nameEn: 'BYD' },
  { name: 'جاك', nameEn: 'JAC' },
  { name: 'لادا', nameEn: 'Lada' },
  { name: 'أخرى', nameEn: 'Other' },
];

const BODY_TYPES = [
  { value: 'SEDAN', label: 'سيدان', icon: '🚗' },
  { value: 'HATCHBACK', label: 'هاتشباك', icon: '🚙' },
  { value: 'SUV', label: 'SUV', icon: '🚙' },
  { value: 'CROSSOVER', label: 'كروس أوفر', icon: '🚙' },
  { value: 'COUPE', label: 'كوبيه', icon: '🚘' },
  { value: 'CONVERTIBLE', label: 'مكشوفة', icon: '🏎️' },
  { value: 'PICKUP', label: 'بيك أب', icon: '🛻' },
  { value: 'VAN', label: 'فان', icon: '🚐' },
  { value: 'MINIVAN', label: 'ميني فان', icon: '🚐' },
  { value: 'WAGON', label: 'ستيشن', icon: '🚗' },
];

const TRANSMISSIONS = [
  { value: 'AUTOMATIC', label: 'أوتوماتيك' },
  { value: 'MANUAL', label: 'مانيوال' },
  { value: 'CVT', label: 'CVT' },
  { value: 'DCT', label: 'DCT (دبل كلتش)' },
];

const FUEL_TYPES = [
  { value: 'PETROL', label: 'بنزين' },
  { value: 'DIESEL', label: 'ديزل' },
  { value: 'HYBRID', label: 'هايبرد' },
  { value: 'ELECTRIC', label: 'كهربائي' },
  { value: 'NATURAL_GAS', label: 'غاز طبيعي' },
  { value: 'LPG', label: 'غاز (LPG)' },
];

const CONDITIONS = [
  { value: 'NEW', label: 'جديدة - زيرو', desc: 'لم تُستخدم من قبل' },
  { value: 'LIKE_NEW', label: 'كالجديدة', desc: 'استخدام خفيف جداً' },
  { value: 'EXCELLENT', label: 'ممتازة', desc: 'حالة ممتازة بدون عيوب' },
  { value: 'GOOD', label: 'جيدة', desc: 'حالة جيدة مع بعض علامات الاستخدام' },
  { value: 'FAIR', label: 'مقبولة', desc: 'تحتاج بعض الإصلاحات البسيطة' },
  { value: 'NEEDS_WORK', label: 'تحتاج صيانة', desc: 'تحتاج إصلاحات' },
];

const ACCIDENT_HISTORY = [
  { value: 'NONE', label: 'بدون حوادث', color: 'text-green-600' },
  { value: 'MINOR', label: 'حادث بسيط (خدوش/صدمات خفيفة)', color: 'text-yellow-600' },
  { value: 'MODERATE', label: 'حادث متوسط (إصلاح أجزاء)', color: 'text-orange-600' },
  { value: 'MAJOR', label: 'حادث كبير (هيكل/شاسيه)', color: 'text-red-600' },
];

const COMMON_FEATURES = [
  'شاشة لمس', 'نظام ملاحة GPS', 'كاميرا خلفية', 'كاميرا 360', 'حساسات ركن',
  'فتحة سقف', 'فتحة سقف بانورامية', 'مقاعد جلد', 'مقاعد مُدفأة', 'مقاعد مُبردة',
  'تكييف أوتوماتيك', 'تكييف خلفي', 'مثبت سرعة', 'مثبت سرعة تكيفي',
  'بلوتوث', 'Apple CarPlay', 'Android Auto', 'شاحن لاسلكي',
  'مرايا كهربائية', 'مرايا قابلة للطي', 'زجاج كهربائي', 'قفل مركزي',
  'ريموت', 'تشغيل بدون مفتاح', 'إضاءة LED', 'إضاءة زينون',
  'جنوط ألومنيوم', 'سبويلر', 'بودي كيت', 'تظليل زجاج',
  'نظام صوت متميز', 'ABS', 'ESP', 'وسائد هوائية', 'نظام تتبع',
];

export default function SellCarPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [priceEstimate, setPriceEstimate] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    // Seller Info
    sellerType: 'OWNER',
    showroomName: '',
    dealerLicense: '',

    // Basic Info
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    bodyType: 'SEDAN',

    // Technical Specs
    transmission: 'AUTOMATIC',
    fuelType: 'PETROL',
    engineSize: '',
    horsepower: '',
    cylinders: '',
    drivetrain: '',

    // Condition
    mileage: '',
    condition: 'GOOD',
    accidentHistory: 'NONE',
    serviceHistory: false,
    warrantyRemaining: '',

    // Colors
    exteriorColor: '',
    interiorColor: '',

    // Features
    features: [] as string[],

    // Images
    images: [] as string[],
    videoUrl: '',

    // Pricing
    askingPrice: '',
    priceNegotiable: true,
    installmentAvailable: false,

    // Barter
    allowBarter: false,
    barterWithCars: false,
    barterWithProperty: false,
    barterDescription: '',
    barterPreferredMakes: [] as string[],
    maxCashDifference: '',

    // Location
    governorate: '',
    city: '',

    // Description
    title: '',
    description: '',
  });

  // Check authentication
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/cars/sell');
    }
  }, [user, authLoading, router]);

  // Auto-generate title
  useEffect(() => {
    if (formData.make && formData.model && formData.year) {
      const condition = formData.condition === 'NEW' ? 'زيرو' : '';
      setFormData(prev => ({
        ...prev,
        title: `${formData.make} ${formData.model} ${formData.year} ${condition}`.trim()
      }));
    }
  }, [formData.make, formData.model, formData.year, formData.condition]);

  // Get price estimate
  const fetchPriceEstimate = async () => {
    if (formData.make && formData.model && formData.year) {
      try {
        const response = await apiClient.get(`/cars/prices?make=${formData.make}&model=${formData.model}&year=${formData.year}`);
        if (response.data.success && response.data.data) {
          setPriceEstimate(response.data.data);
        }
      } catch (error) {
        console.log('No price reference found');
      }
    }
  };

  useEffect(() => {
    fetchPriceEstimate();
  }, [formData.make, formData.model, formData.year]);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const toggleBarterMake = (make: string) => {
    setFormData(prev => ({
      ...prev,
      barterPreferredMakes: prev.barterPreferredMakes.includes(make)
        ? prev.barterPreferredMakes.filter(m => m !== make)
        : [...prev.barterPreferredMakes, make]
    }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // In production, upload to server and get URLs
      // For demo, use placeholder URLs
      const newImages = Array.from(files).map((_, i) =>
        `https://images.unsplash.com/photo-${Date.now() + i}?w=800`
      );
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 10)
      }));
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.make && formData.model && formData.year && formData.bodyType);
      case 2:
        return !!(formData.mileage && formData.condition && formData.exteriorColor);
      case 3:
        return formData.images.length >= 1;
      case 4:
        return !!(formData.askingPrice && formData.governorate && formData.title);
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 4));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await apiClient.post('/cars/listings', {
        ...formData,
        mileage: parseInt(formData.mileage),
        askingPrice: parseFloat(formData.askingPrice),
        engineSize: formData.engineSize ? parseFloat(formData.engineSize) : undefined,
        horsepower: formData.horsepower ? parseInt(formData.horsepower) : undefined,
        cylinders: formData.cylinders ? parseInt(formData.cylinders) : undefined,
        maxCashDifference: formData.maxCashDifference ? parseFloat(formData.maxCashDifference) : undefined,
      });

      if (response.data.success) {
        router.push(`/cars/${response.data.data.id}?success=true`);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء نشر الإعلان');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-blue-700 to-blue-600 text-white py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Link href="/cars" className="text-blue-200 hover:text-white mb-4 inline-block">
            → العودة لسوق السيارات
          </Link>
          <h1 className="text-3xl font-bold mb-2">🚗 بيع سيارتك على Xchange</h1>
          <p className="text-blue-100">وصّل لآلاف المشترين بنظام آمن ومضمون</p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {[
              { num: 1, label: 'معلومات السيارة' },
              { num: 2, label: 'الحالة والمواصفات' },
              { num: 3, label: 'الصور' },
              { num: 4, label: 'السعر والنشر' },
            ].map((step, idx) => (
              <div key={step.num} className="flex items-center">
                <div className={`flex items-center ${idx > 0 ? 'mr-4' : ''}`}>
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    currentStep >= step.num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.num ? '✓' : step.num}
                  </div>
                  <span className={`mr-2 text-sm hidden sm:block ${
                    currentStep >= step.num ? 'text-blue-600 font-medium' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={`w-12 h-1 mx-2 rounded ${
                    currentStep > step.num ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        {/* Step 1: Basic Info */}
        {currentStep === 1 && (
          <div className="space-y-6">
            {/* Seller Type */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">نوع البائع</h2>
              <div className="grid grid-cols-3 gap-4">
                {[
                  { value: 'OWNER', label: 'مالك', icon: '👤', desc: 'أبيع سيارتي الخاصة' },
                  { value: 'DEALER', label: 'تاجر', icon: '🏪', desc: 'أعمل في تجارة السيارات' },
                  { value: 'SHOWROOM', label: 'معرض', icon: '🏢', desc: 'أملك معرض سيارات' },
                ].map(type => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleInputChange('sellerType', type.value)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${
                      formData.sellerType === type.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <div className="text-3xl mb-2">{type.icon}</div>
                    <div className="font-bold">{type.label}</div>
                    <div className="text-xs text-gray-500">{type.desc}</div>
                  </button>
                ))}
              </div>

              {formData.sellerType === 'SHOWROOM' && (
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">اسم المعرض *</label>
                    <input
                      type="text"
                      value={formData.showroomName}
                      onChange={(e) => handleInputChange('showroomName', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="مثال: معرض النجوم للسيارات"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">رقم الرخصة</label>
                    <input
                      type="text"
                      value={formData.dealerLicense}
                      onChange={(e) => handleInputChange('dealerLicense', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Car Info */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">معلومات السيارة</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الماركة *</label>
                  <select
                    value={formData.make}
                    onChange={(e) => handleInputChange('make', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر الماركة</option>
                    {CAR_MAKES.map(make => (
                      <option key={make.nameEn} value={make.name}>{make.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الموديل *</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: كورولا، توسان، النترا"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سنة الصنع *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => handleInputChange('year', parseInt(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {Array.from({ length: 30 }, (_, i) => new Date().getFullYear() + 1 - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الفئة (Trim)</label>
                  <input
                    type="text"
                    value={formData.trim}
                    onChange={(e) => handleInputChange('trim', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: XLI، GLS، Highline"
                  />
                </div>
              </div>

              {/* Body Type */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">نوع الهيكل *</label>
                <div className="grid grid-cols-5 gap-2">
                  {BODY_TYPES.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => handleInputChange('bodyType', type.value)}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.bodyType === type.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="text-2xl">{type.icon}</div>
                      <div className="text-xs mt-1">{type.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Estimate */}
              {priceEstimate && (
                <div className="mt-6 bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                    <span>💡</span> السعر المرجعي في السوق
                  </div>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatPrice(priceEstimate.minPrice)} - {formatPrice(priceEstimate.maxPrice)} ج.م
                  </div>
                  <div className="text-sm text-blue-600">
                    متوسط: {formatPrice(priceEstimate.averagePrice)} ج.م
                  </div>
                </div>
              )}
            </div>

            {/* Technical Specs */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">المواصفات الفنية</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ناقل الحركة *</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => handleInputChange('transmission', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {TRANSMISSIONS.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">نوع الوقود *</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => handleInputChange('fuelType', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    {FUEL_TYPES.map(f => (
                      <option key={f.value} value={f.value}>{f.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">سعة المحرك (لتر)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.engineSize}
                    onChange={(e) => handleInputChange('engineSize', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: 1.6"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">قوة المحرك (حصان)</label>
                  <input
                    type="number"
                    value={formData.horsepower}
                    onChange={(e) => handleInputChange('horsepower', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: 130"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Condition */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* Mileage & Condition */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">حالة السيارة</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">الكيلومترات *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.mileage}
                    onChange={(e) => handleInputChange('mileage', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-lg"
                    placeholder="أدخل عدد الكيلومترات"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">كم</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">الحالة العامة *</label>
                <div className="grid grid-cols-3 gap-3">
                  {CONDITIONS.map(c => (
                    <button
                      key={c.value}
                      type="button"
                      onClick={() => handleInputChange('condition', c.value)}
                      className={`p-4 rounded-lg border-2 text-right transition-all ${
                        formData.condition === c.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className="font-bold">{c.label}</div>
                      <div className="text-xs text-gray-500">{c.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">تاريخ الحوادث *</label>
                <div className="space-y-2">
                  {ACCIDENT_HISTORY.map(a => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => handleInputChange('accidentHistory', a.value)}
                      className={`w-full p-3 rounded-lg border-2 text-right transition-all flex items-center gap-3 ${
                        formData.accidentHistory === a.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full ${
                        a.value === 'NONE' ? 'bg-green-500' :
                        a.value === 'MINOR' ? 'bg-yellow-500' :
                        a.value === 'MODERATE' ? 'bg-orange-500' : 'bg-red-500'
                      }`} />
                      <span className={formData.accidentHistory === a.value ? 'font-bold' : ''}>
                        {a.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.serviceHistory}
                    onChange={(e) => handleInputChange('serviceHistory', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <div>
                    <div className="font-medium">سجل صيانة متوفر</div>
                    <div className="text-xs text-gray-500">صيانة توكيل أو موثقة</div>
                  </div>
                </label>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ضمان متبقي</label>
                  <input
                    type="text"
                    value={formData.warrantyRemaining}
                    onChange={(e) => handleInputChange('warrantyRemaining', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: سنة أو 20,000 كم"
                  />
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">الألوان</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اللون الخارجي *</label>
                  <input
                    type="text"
                    value={formData.exteriorColor}
                    onChange={(e) => handleInputChange('exteriorColor', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: أبيض لؤلؤي، أسود ميتاليك"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">اللون الداخلي</label>
                  <input
                    type="text"
                    value={formData.interiorColor}
                    onChange={(e) => handleInputChange('interiorColor', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: بيج، أسود"
                  />
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">المميزات والتجهيزات</h2>
              <div className="flex flex-wrap gap-2">
                {COMMON_FEATURES.map(feature => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={`px-4 py-2 rounded-full text-sm transition-all ${
                      formData.features.includes(feature)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {formData.features.includes(feature) ? '✓ ' : ''}{feature}
                  </button>
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-3">
                اختر المميزات المتوفرة في سيارتك ({formData.features.length} مختارة)
              </p>
            </div>
          </div>
        )}

        {/* Step 3: Images */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">صور السيارة</h2>
              <p className="text-gray-500 mb-4">أضف صور واضحة للسيارة من جميع الزوايا (حتى 10 صور)</p>

              {/* Upload Area */}
              <label className="block border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                <div className="text-4xl mb-2">📷</div>
                <div className="font-bold text-gray-700">اضغط لرفع الصور</div>
                <div className="text-sm text-gray-500">أو اسحب الصور هنا</div>
              </label>

              {/* Image Preview */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-5 gap-4 mt-6">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-sm hover:bg-red-600"
                      >
                        ×
                      </button>
                      {idx === 0 && (
                        <div className="absolute bottom-0 left-0 right-0 bg-blue-600 text-white text-xs py-1 text-center">
                          الصورة الرئيسية
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Tips */}
              <div className="mt-6 bg-amber-50 rounded-lg p-4">
                <h3 className="font-bold text-amber-800 mb-2">📸 نصائح للصور الاحترافية:</h3>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• التقط الصور في ضوء النهار الطبيعي</li>
                  <li>• صوّر السيارة من الأمام، الخلف، الجانبين، والداخل</li>
                  <li>• أظهر عداد الكيلومترات والتابلوه</li>
                  <li>• صوّر أي عيوب بوضوح (للمصداقية)</li>
                </ul>
              </div>
            </div>

            {/* Video URL */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">🎥 فيديو (اختياري)</h2>
              <input
                type="url"
                value={formData.videoUrl}
                onChange={(e) => handleInputChange('videoUrl', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="رابط فيديو YouTube أو TikTok"
              />
            </div>
          </div>
        )}

        {/* Step 4: Price & Publish */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Pricing */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">السعر</h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">السعر المطلوب *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.askingPrice}
                    onChange={(e) => handleInputChange('askingPrice', e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-2xl font-bold"
                    placeholder="أدخل السعر"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-lg">ج.م</span>
                </div>
              </div>

              {priceEstimate && formData.askingPrice && (
                <div className={`p-4 rounded-lg ${
                  parseFloat(formData.askingPrice) <= priceEstimate.averagePrice
                    ? 'bg-green-50 text-green-700'
                    : 'bg-amber-50 text-amber-700'
                }`}>
                  {parseFloat(formData.askingPrice) <= priceEstimate.averagePrice
                    ? '✓ سعرك تنافسي مقارنة بالسوق'
                    : '⚠️ سعرك أعلى من متوسط السوق'}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 mt-4">
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.priceNegotiable}
                    onChange={(e) => handleInputChange('priceNegotiable', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="font-medium">السعر قابل للتفاوض</span>
                </label>
                <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    checked={formData.installmentAvailable}
                    onChange={(e) => handleInputChange('installmentAvailable', e.target.checked)}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span className="font-medium">💳 تقسيط متاح</span>
                </label>
              </div>
            </div>

            {/* Barter Options */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">🔄 خيارات المقايضة</h2>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.allowBarter}
                    onChange={(e) => handleInputChange('allowBarter', e.target.checked)}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <span className="font-medium">أقبل المقايضة</span>
                </label>
              </div>

              {formData.allowBarter && (
                <div className="space-y-4 border-t pt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-purple-50">
                      <input
                        type="checkbox"
                        checked={formData.barterWithCars}
                        onChange={(e) => handleInputChange('barterWithCars', e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded"
                      />
                      <div>
                        <div className="font-medium">🚗 مقايضة بسيارة</div>
                        <div className="text-xs text-gray-500">سيارة + فرق نقدي</div>
                      </div>
                    </label>
                    <label className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-purple-50">
                      <input
                        type="checkbox"
                        checked={formData.barterWithProperty}
                        onChange={(e) => handleInputChange('barterWithProperty', e.target.checked)}
                        className="w-5 h-5 text-purple-600 rounded"
                      />
                      <div>
                        <div className="font-medium">🏠 مقايضة بعقار</div>
                        <div className="text-xs text-gray-500">شقة أو أرض</div>
                      </div>
                    </label>
                  </div>

                  {formData.barterWithCars && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        الماركات المفضلة للمقايضة
                      </label>
                      <div className="flex flex-wrap gap-2">
                        {['تويوتا', 'هيونداي', 'كيا', 'نيسان', 'مرسيدس', 'بي إم دبليو'].map(make => (
                          <button
                            key={make}
                            type="button"
                            onClick={() => toggleBarterMake(make)}
                            className={`px-3 py-1 rounded-full text-sm ${
                              formData.barterPreferredMakes.includes(make)
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                          >
                            {make}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      أقصى فرق نقدي أقبله
                    </label>
                    <input
                      type="number"
                      value={formData.maxCashDifference}
                      onChange={(e) => handleInputChange('maxCashDifference', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="مثال: 200000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      تفاصيل إضافية عن المقايضة
                    </label>
                    <textarea
                      value={formData.barterDescription}
                      onChange={(e) => handleInputChange('barterDescription', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      rows={2}
                      placeholder="مثال: أقبل سيارة موديل 2020 فأحدث مع دفع الفرق"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">📍 الموقع</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة *</label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => handleInputChange('governorate', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map(gov => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">المدينة/المنطقة</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="مثال: مدينة نصر، الشيخ زايد"
                  />
                </div>
              </div>
            </div>

            {/* Title & Description */}
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-4">📝 العنوان والوصف</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">عنوان الإعلان *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="سيُنشأ تلقائياً أو أدخل عنوان مخصص"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">الوصف</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    rows={4}
                    placeholder="أضف تفاصيل إضافية عن السيارة... (سبب البيع، مميزات خاصة، إلخ)"
                  />
                </div>
              </div>
            </div>

            {/* Commission Info */}
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="font-bold text-blue-800 mb-2">💰 العمولات</h3>
              <p className="text-blue-700">
                عمولة Xchange: <span className="font-bold">1.5%</span> على البائع + <span className="font-bold">1.5%</span> على المشتري
              </p>
              {formData.askingPrice && (
                <p className="text-blue-600 mt-2">
                  ستحصل على: <span className="font-bold text-xl">
                    {formatPrice(parseFloat(formData.askingPrice) * 0.985)} ج.م
                  </span> بعد خصم العمولة
                </p>
              )}
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between mt-8">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={prevStep}
              className="px-6 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50"
            >
              → السابق
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={nextStep}
              disabled={!validateStep(currentStep)}
              className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              التالي ←
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || !validateStep(4)}
              className="px-8 py-3 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  جاري النشر...
                </>
              ) : (
                <>✓ نشر الإعلان</>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
