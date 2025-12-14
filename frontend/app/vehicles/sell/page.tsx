'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ArrowRightIcon,
  ArrowLeftIcon,
  PhotoIcon,
  CheckCircleIcon,
  SparklesIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  TruckIcon,
  InformationCircleIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  ArrowPathIcon,
  ClipboardDocumentCheckIcon,
} from '@heroicons/react/24/outline';
import { StarIcon } from '@heroicons/react/24/solid';
import {
  VEHICLE_MAKE_AR,
  VEHICLE_BODY_TYPE_AR,
  FUEL_TYPE_AR,
  TRANSMISSION_AR,
  VEHICLE_CONDITION_AR,
  GOVERNORATE_AR,
  type VehicleMake,
  type VehicleBodyType,
  type FuelType,
  type Transmission,
  type VehicleCondition,
  type Governorate,
  type PriceEstimate,
} from '@/lib/api/vehicle-marketplace';
import { calculateDynamicPrice } from '@/lib/algorithms/vehicle-algorithms';

// Models by make
const MODELS_BY_MAKE: Record<string, string[]> = {
  TOYOTA: ['كامري', 'كورولا', 'لاند كروزر', 'برادو', 'فورتشنر', 'يارس', 'هايلكس', 'راف فور', 'أفالون', 'هايلاندر'],
  HYUNDAI: ['إلنترا', 'توسان', 'سوناتا', 'أكسنت', 'سانتافي', 'كريتا', 'كونا', 'أزيرا', 'فيلوستر', 'باليسيد'],
  KIA: ['سيراتو', 'سبورتاج', 'سورينتو', 'بيكانتو', 'أوبتيما', 'ريو', 'كارنيفال', 'سيلتوس', 'ستينجر', 'تيلورايد'],
  NISSAN: ['صني', 'سنترا', 'باترول', 'إكس تريل', 'قشقاي', 'جوك', 'ماكسيما', 'ألتيما', 'تيتان', 'أرمادا'],
  CHEVROLET: ['أوبترا', 'كروز', 'كابتيفا', 'تاهو', 'سوبربان', 'ماليبو', 'ترافيرس', 'إمبالا', 'كولورادو', 'سيلفرادو'],
  MERCEDES: ['C-Class', 'E-Class', 'S-Class', 'GLC', 'GLE', 'GLS', 'A-Class', 'CLA', 'AMG GT', 'Maybach'],
  BMW: ['3 Series', '5 Series', '7 Series', 'X3', 'X5', 'X7', 'M3', 'M5', 'i4', 'iX'],
  AUDI: ['A4', 'A6', 'A8', 'Q5', 'Q7', 'Q8', 'RS6', 'e-tron', 'TT', 'R8'],
  VOLKSWAGEN: ['جولف', 'باسات', 'تيجوان', 'توارق', 'بولو', 'أرتيون', 'ID.4', 'جيتا', 'أطلس', 'تاوس'],
  HONDA: ['سيفيك', 'أكورد', 'CR-V', 'HR-V', 'بايلوت', 'أوديسي', 'سيتي', 'جاز', 'ريدجلاين', 'باسبورت'],
  MAZDA: ['3', '6', 'CX-5', 'CX-9', 'CX-30', 'MX-5', 'CX-50', 'CX-90'],
  FORD: ['فوكس', 'فيوجن', 'إكسبلورر', 'إكسبيديشن', 'رينجر', 'F-150', 'موستانج', 'إيدج', 'برونكو', 'إسكيب'],
  LEXUS: ['ES', 'IS', 'LS', 'RX', 'NX', 'LX', 'GX', 'LC', 'RC', 'UX'],
  PORSCHE: ['911', 'Cayenne', 'Macan', 'Panamera', 'Taycan', 'Boxster', 'Cayman', '718'],
  PEUGEOT: ['301', '308', '408', '508', '2008', '3008', '5008', 'Partner', 'Expert', 'Rifter'],
  RENAULT: ['لوجان', 'ميجان', 'داستر', 'كوليوس', 'كابتور', 'كليو', 'تاليسمان', 'فلوينس', 'سيمبول', 'كادجار'],
  SUZUKI: ['سويفت', 'ديزاير', 'فيتارا', 'جيمني', 'سياز', 'إرتيجا', 'بالينو', 'إس كروس', 'إغنيس', 'XL7'],
  MITSUBISHI: ['لانسر', 'باجيرو', 'أوتلاندر', 'إكليبس كروس', 'ASX', 'L200', 'مونتيرو', 'أتراج', 'إكسباندر', 'ميراج'],
  JEEP: ['رانجلر', 'جراند شيروكي', 'شيروكي', 'كومباس', 'رينيجيد', 'جلادياتور', 'واجونير', 'جراند واجونير'],
  LAND_ROVER: ['Range Rover', 'Range Rover Sport', 'Defender', 'Discovery', 'Evoque', 'Velar', 'Discovery Sport'],
  OTHER: ['موديل آخر'],
};

// Colors
const COLORS = [
  { id: 'white', name: 'أبيض', color: '#FFFFFF', border: true },
  { id: 'black', name: 'أسود', color: '#1a1a1a' },
  { id: 'silver', name: 'فضي', color: '#C0C0C0' },
  { id: 'gray', name: 'رمادي', color: '#808080' },
  { id: 'red', name: 'أحمر', color: '#DC2626' },
  { id: 'blue', name: 'أزرق', color: '#2563EB' },
  { id: 'green', name: 'أخضر', color: '#16A34A' },
  { id: 'gold', name: 'ذهبي', color: '#D4AF37' },
  { id: 'beige', name: 'بيج', color: '#F5F5DC' },
  { id: 'brown', name: 'بني', color: '#8B4513' },
  { id: 'navy', name: 'كحلي', color: '#000080' },
  { id: 'orange', name: 'برتقالي', color: '#F97316' },
];

// Features
const FEATURES = [
  { id: 'sunroof', name: 'فتحة سقف' },
  { id: 'leather', name: 'مقاعد جلد' },
  { id: 'navigation', name: 'نظام ملاحة' },
  { id: 'bluetooth', name: 'بلوتوث' },
  { id: 'backup_camera', name: 'كاميرا خلفية' },
  { id: 'parking_sensors', name: 'حساسات ركن' },
  { id: 'cruise_control', name: 'مثبت سرعة' },
  { id: 'keyless', name: 'تشغيل بدون مفتاح' },
  { id: 'heated_seats', name: 'مقاعد مدفأة' },
  { id: 'cooled_seats', name: 'مقاعد مبردة' },
  { id: 'apple_carplay', name: 'Apple CarPlay' },
  { id: 'android_auto', name: 'Android Auto' },
  { id: 'blind_spot', name: 'مراقبة النقطة العمياء' },
  { id: 'lane_assist', name: 'مساعد المسار' },
  { id: 'adaptive_cruise', name: 'مثبت سرعة تكيفي' },
  { id: '360_camera', name: 'كاميرا 360°' },
  { id: 'heads_up', name: 'شاشة عرض أمامية' },
  { id: 'wireless_charging', name: 'شحن لاسلكي' },
];

// Inspection points
const INSPECTION_CATEGORIES = [
  {
    name: 'المحرك ونظام الدفع',
    points: ['أداء المحرك', 'ناقل الحركة', 'نظام التبريد', 'نظام العادم', 'البطارية'],
  },
  {
    name: 'الهيكل الخارجي',
    points: ['الطلاء', 'الصدمات والخدوش', 'الأبواب', 'المصابيح', 'المرايا'],
  },
  {
    name: 'الداخلية',
    points: ['المقاعد', 'لوحة القيادة', 'عجلة القيادة', 'السقف الداخلي', 'الأرضيات'],
  },
  {
    name: 'الإطارات والفرامل',
    points: ['الإطارات الأمامية', 'الإطارات الخلفية', 'الفرامل', 'نظام ABS', 'فرامل اليد'],
  },
  {
    name: 'الأنظمة الكهربائية',
    points: ['نظام الصوت', 'التكييف', 'النوافذ الكهربائية', 'الأقفال المركزية', 'الإنارة الداخلية'],
  },
];

const CONDITION_GRADES = [
  { grade: 'A', label: 'ممتاز', description: 'حالة ممتازة، لا توجد عيوب ظاهرة', color: 'bg-green-500' },
  { grade: 'B', label: 'جيد جداً', description: 'حالة جيدة جداً، عيوب طفيفة جداً', color: 'bg-blue-500' },
  { grade: 'C', label: 'جيد', description: 'حالة جيدة، بعض علامات الاستخدام', color: 'bg-yellow-500' },
  { grade: 'D', label: 'مقبول', description: 'حالة مقبولة، يحتاج بعض الإصلاحات', color: 'bg-orange-500' },
  { grade: 'F', label: 'ضعيف', description: 'يحتاج إصلاحات كبيرة', color: 'bg-red-500' },
];

interface FormData {
  // Step 1: Basic Info
  make: VehicleMake | '';
  model: string;
  year: number | '';
  bodyType: VehicleBodyType | '';

  // Step 2: Details
  mileage: number | '';
  fuelType: FuelType | '';
  transmission: Transmission | '';
  color: string;
  engineSize: string;
  features: string[];

  // Step 3: Condition
  condition: VehicleCondition | '';
  inspectionGrades: Record<string, string>;
  accidentHistory: boolean;
  accidentDetails: string;
  serviceHistory: boolean;
  originalPaint: boolean;

  // Step 4: Photos
  photos: { id: string; url: string; type: string }[];

  // Step 5: Pricing
  askingPrice: number | '';
  acceptsBarter: boolean;
  barterPreferences: string;
  negotiable: boolean;

  // Step 6: Contact & Location
  governorate: Governorate | '';
  city: string;
  contactMethod: 'phone' | 'chat' | 'both';
  showPhone: boolean;

  // Step 7: Review
  agreedToTerms: boolean;
  description: string;
}

const STEPS = [
  { id: 1, name: 'معلومات أساسية', icon: TruckIcon },
  { id: 2, name: 'تفاصيل السيارة', icon: InformationCircleIcon },
  { id: 3, name: 'الحالة والفحص', icon: ClipboardDocumentCheckIcon },
  { id: 4, name: 'الصور', icon: PhotoIcon },
  { id: 5, name: 'التسعير', icon: CurrencyDollarIcon },
  { id: 6, name: 'الموقع والتواصل', icon: ShieldCheckIcon },
  { id: 7, name: 'المراجعة والنشر', icon: CheckCircleIcon },
];

export default function SellVehiclePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isCalculatingPrice, setIsCalculatingPrice] = useState(false);
  const [priceEstimate, setPriceEstimate] = useState<PriceEstimate | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    make: '',
    model: '',
    year: '',
    bodyType: '',
    mileage: '',
    fuelType: '',
    transmission: '',
    color: '',
    engineSize: '',
    features: [],
    condition: '',
    inspectionGrades: {},
    accidentHistory: false,
    accidentDetails: '',
    serviceHistory: true,
    originalPaint: true,
    photos: [],
    askingPrice: '',
    acceptsBarter: false,
    barterPreferences: '',
    negotiable: true,
    governorate: '',
    city: '',
    contactMethod: 'both',
    showPhone: true,
    agreedToTerms: false,
    description: '',
  });

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(featureId)
        ? prev.features.filter(f => f !== featureId)
        : [...prev.features, featureId],
    }));
  };

  const calculatePrice = () => {
    if (!formData.make || !formData.model || !formData.year || !formData.mileage || !formData.condition || !formData.governorate) {
      return;
    }

    setIsCalculatingPrice(true);

    setTimeout(() => {
      const estimate = calculateDynamicPrice({
        make: formData.make as VehicleMake,
        model: formData.model,
        year: formData.year as number,
        mileage: formData.mileage as number,
        condition: formData.condition as VehicleCondition,
        fuelType: formData.fuelType as FuelType || 'PETROL',
        transmission: formData.transmission as Transmission || 'AUTOMATIC',
        governorate: formData.governorate as Governorate,
        features: formData.features,
        accidentHistory: formData.accidentHistory,
        serviceHistory: formData.serviceHistory,
      });

      setPriceEstimate(estimate);
      setIsCalculatingPrice(false);
    }, 1500);
  };

  const addMockPhoto = (type: string) => {
    const id = Math.random().toString(36).substring(7);
    const mockUrls: Record<string, string> = {
      exterior_front: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=400',
      exterior_back: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=400',
      exterior_side: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400',
      interior_dashboard: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400',
      interior_seats: 'https://images.unsplash.com/photo-1606577924006-27d39b132ae2?w=400',
      engine: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400',
    };

    setFormData(prev => ({
      ...prev,
      photos: [...prev.photos, { id, url: mockUrls[type] || mockUrls.exterior_front, type }],
    }));
  };

  const removePhoto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter(p => p.id !== id),
    }));
  };

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 2000);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.make && formData.model && formData.year && formData.bodyType;
      case 2:
        return formData.mileage && formData.fuelType && formData.transmission && formData.color;
      case 3:
        return formData.condition;
      case 4:
        return formData.photos.length >= 3;
      case 5:
        return formData.askingPrice;
      case 6:
        return formData.governorate && formData.city;
      case 7:
        return formData.agreedToTerms;
      default:
        return true;
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gray-50" dir="rtl">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircleIcon className="w-12 h-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">تم نشر إعلانك بنجاح!</h1>
            <p className="text-gray-600 mb-8">
              سيتم مراجعة إعلانك خلال 24 ساعة وسيظهر في نتائج البحث بعد الموافقة عليه.
            </p>

            <div className="bg-gray-50 rounded-xl p-6 mb-8 text-right">
              <h3 className="font-semibold text-gray-900 mb-4">ملخص الإعلان</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">السيارة:</span>
                  <span className="font-medium">{VEHICLE_MAKE_AR[formData.make as VehicleMake]} {formData.model} {formData.year}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">السعر:</span>
                  <span className="font-medium text-primary-600">{formatPrice(formData.askingPrice as number)} جنيه</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الموقع:</span>
                  <span className="font-medium">{GOVERNORATE_AR[formData.governorate as Governorate]}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">رقم الإعلان:</span>
                  <span className="font-medium">#VH-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Link
                href="/vehicles/my-listings"
                className="flex-1 bg-primary-600 text-white py-3 px-6 rounded-xl font-medium hover:bg-primary-700 transition-colors"
              >
                عرض إعلاناتي
              </Link>
              <Link
                href="/vehicles"
                className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-xl font-medium hover:bg-gray-50 transition-colors"
              >
                العودة للرئيسية
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/vehicles" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowRightIcon className="w-5 h-5" />
              <span>العودة للسوق</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">بيع سيارتك</h1>
            <div className="w-24" />
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <button
                    onClick={() => isCompleted && setCurrentStep(step.id)}
                    className={`flex flex-col items-center gap-1 ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
                    disabled={!isCompleted}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isActive ? 'bg-primary-600 text-white' :
                      isCompleted ? 'bg-green-500 text-white' :
                      'bg-gray-200 text-gray-500'
                    }`}>
                      {isCompleted ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className={`text-xs hidden sm:block ${isActive ? 'text-primary-600 font-medium' : 'text-gray-500'}`}>
                      {step.name}
                    </span>
                  </button>
                  {index < STEPS.length - 1 && (
                    <div className={`w-8 sm:w-16 h-1 mx-1 rounded ${
                      currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
          {/* Step 1: Basic Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">معلومات السيارة الأساسية</h2>
                <p className="text-gray-600">ابدأ بإدخال المعلومات الأساسية لسيارتك</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الشركة المصنعة *</label>
                  <select
                    value={formData.make}
                    onChange={(e) => {
                      updateField('make', e.target.value as VehicleMake);
                      updateField('model', '');
                    }}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">اختر الشركة</option>
                    {Object.entries(VEHICLE_MAKE_AR).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموديل *</label>
                  <select
                    value={formData.model}
                    onChange={(e) => updateField('model', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    disabled={!formData.make}
                  >
                    <option value="">اختر الموديل</option>
                    {formData.make && MODELS_BY_MAKE[formData.make]?.map((model) => (
                      <option key={model} value={model}>{model}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سنة الصنع *</label>
                  <select
                    value={formData.year}
                    onChange={(e) => updateField('year', parseInt(e.target.value) || '')}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">اختر السنة</option>
                    {Array.from({ length: 30 }, (_, i) => 2025 - i).map((year) => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع الهيكل *</label>
                  <select
                    value={formData.bodyType}
                    onChange={(e) => updateField('bodyType', e.target.value as VehicleBodyType)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">اختر نوع الهيكل</option>
                    {Object.entries(VEHICLE_BODY_TYPE_AR).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Vehicle Details */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">تفاصيل السيارة</h2>
                <p className="text-gray-600">أدخل التفاصيل الفنية والمواصفات</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">عداد الكيلومترات *</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.mileage}
                      onChange={(e) => updateField('mileage', parseInt(e.target.value) || '')}
                      placeholder="مثال: 50000"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-sm">كم</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">نوع الوقود *</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => updateField('fuelType', e.target.value as FuelType)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">اختر نوع الوقود</option>
                    {Object.entries(FUEL_TYPE_AR).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ناقل الحركة *</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => updateField('transmission', e.target.value as Transmission)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">اختر ناقل الحركة</option>
                    {Object.entries(TRANSMISSION_AR).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">سعة المحرك</label>
                  <select
                    value={formData.engineSize}
                    onChange={(e) => updateField('engineSize', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">اختر سعة المحرك</option>
                    <option value="1.0">1.0 لتر</option>
                    <option value="1.2">1.2 لتر</option>
                    <option value="1.4">1.4 لتر</option>
                    <option value="1.5">1.5 لتر</option>
                    <option value="1.6">1.6 لتر</option>
                    <option value="1.8">1.8 لتر</option>
                    <option value="2.0">2.0 لتر</option>
                    <option value="2.4">2.4 لتر</option>
                    <option value="2.5">2.5 لتر</option>
                    <option value="2.7">2.7 لتر</option>
                    <option value="3.0">3.0 لتر</option>
                    <option value="3.5">3.5 لتر</option>
                    <option value="4.0">4.0 لتر</option>
                    <option value="4.5">4.5 لتر</option>
                    <option value="5.0+">5.0+ لتر</option>
                  </select>
                </div>
              </div>

              {/* Color Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">لون السيارة *</label>
                <div className="flex flex-wrap gap-3">
                  {COLORS.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => updateField('color', color.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-all ${
                        formData.color === color.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className={`w-6 h-6 rounded-full ${color.border ? 'border border-gray-300' : ''}`}
                        style={{ backgroundColor: color.color }}
                      />
                      <span className="text-sm">{color.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">المميزات والإضافات</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FEATURES.map((feature) => (
                    <button
                      key={feature.id}
                      onClick={() => toggleFeature(feature.id)}
                      className={`px-4 py-2 rounded-xl text-sm border-2 transition-all ${
                        formData.features.includes(feature.id)
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-700'
                      }`}
                    >
                      {feature.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Condition */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">حالة السيارة</h2>
                <p className="text-gray-600">صف حالة سيارتك بدقة للحصول على أفضل سعر</p>
              </div>

              {/* Overall Condition */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">الحالة العامة *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Object.entries(VEHICLE_CONDITION_AR).map(([key, value]) => (
                    <button
                      key={key}
                      onClick={() => updateField('condition', key as VehicleCondition)}
                      className={`p-4 rounded-xl border-2 text-right transition-all ${
                        formData.condition === key
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-900">{value}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {key === 'NEW' && 'سيارة جديدة بدون استخدام'}
                        {key === 'EXCELLENT' && 'حالة ممتازة، صيانة منتظمة'}
                        {key === 'GOOD' && 'حالة جيدة، استخدام طبيعي'}
                        {key === 'FAIR' && 'حالة مقبولة، قد تحتاج بعض الإصلاحات'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Detailed Inspection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">تقييم تفصيلي (اختياري)</label>
                <div className="space-y-4">
                  {INSPECTION_CATEGORIES.map((category) => (
                    <div key={category.name} className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-medium text-gray-900 mb-3">{category.name}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {category.points.map((point) => (
                          <div key={point} className="text-center">
                            <div className="text-xs text-gray-600 mb-2">{point}</div>
                            <select
                              value={formData.inspectionGrades[point] || ''}
                              onChange={(e) => updateField('inspectionGrades', { ...formData.inspectionGrades, [point]: e.target.value })}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                            >
                              <option value="">-</option>
                              {CONDITION_GRADES.map((grade) => (
                                <option key={grade.grade} value={grade.grade}>{grade.grade}</option>
                              ))}
                            </select>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* History Questions */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">هل تعرضت السيارة لحوادث؟</div>
                    <div className="text-sm text-gray-500">الإفصاح عن الحوادث مطلوب قانونياً</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.accidentHistory}
                      onChange={(e) => updateField('accidentHistory', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:-translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                {formData.accidentHistory && (
                  <textarea
                    value={formData.accidentDetails}
                    onChange={(e) => updateField('accidentDetails', e.target.value)}
                    placeholder="اذكر تفاصيل الحوادث والإصلاحات التي تمت..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-24"
                  />
                )}

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">سجل صيانة موثق</div>
                    <div className="text-sm text-gray-500">هل لديك سجل صيانة منتظم؟</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.serviceHistory}
                      onChange={(e) => updateField('serviceHistory', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:-translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <div className="font-medium text-gray-900">طلاء أصلي</div>
                    <div className="text-sm text-gray-500">هل الطلاء الخارجي أصلي بالكامل؟</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.originalPaint}
                      onChange={(e) => updateField('originalPaint', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:-translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Photos */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">صور السيارة</h2>
                <p className="text-gray-600">أضف صور واضحة لسيارتك (3 صور على الأقل)</p>
              </div>

              {/* Photo Requirements */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <h4 className="font-medium text-amber-800 mb-2">نصائح للحصول على أفضل النتائج:</h4>
                <ul className="text-sm text-amber-700 space-y-1">
                  <li>• التقط الصور في إضاءة جيدة (يفضل ضوء النهار)</li>
                  <li>• اغسل السيارة قبل التصوير</li>
                  <li>• صوّر من زوايا متعددة (أمام، خلف، جانب، داخلية)</li>
                  <li>• أضف صورة للعداد وصورة للمحرك</li>
                </ul>
              </div>

              {/* Photo Upload Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {/* Required Photos */}
                {[
                  { type: 'exterior_front', label: 'الواجهة الأمامية' },
                  { type: 'exterior_back', label: 'الواجهة الخلفية' },
                  { type: 'exterior_side', label: 'الجانب' },
                  { type: 'interior_dashboard', label: 'لوحة القيادة' },
                  { type: 'interior_seats', label: 'المقاعد' },
                  { type: 'engine', label: 'المحرك' },
                ].map((photoType) => {
                  const existingPhoto = formData.photos.find(p => p.type === photoType.type);

                  return (
                    <div key={photoType.type} className="relative">
                      {existingPhoto ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden border-2 border-green-500">
                          <img src={existingPhoto.url} alt={photoType.label} className="w-full h-full object-cover" />
                          <button
                            onClick={() => removePhoto(existingPhoto.id)}
                            className="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                          <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                            <span className="text-white text-xs">{photoType.label}</span>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => addMockPhoto(photoType.type)}
                          className="aspect-video w-full rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center gap-2 hover:border-primary-500 hover:bg-primary-50 transition-colors"
                        >
                          <PhotoIcon className="w-8 h-8 text-gray-400" />
                          <span className="text-sm text-gray-500">{photoType.label}</span>
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Photo Count */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <span className="text-gray-700">عدد الصور المرفوعة:</span>
                <span className={`font-bold ${formData.photos.length >= 3 ? 'text-green-600' : 'text-amber-600'}`}>
                  {formData.photos.length} / 6
                </span>
              </div>
            </div>
          )}

          {/* Step 5: Pricing */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">تسعير السيارة</h2>
                <p className="text-gray-600">حدد السعر المطلوب واختر خيارات البيع</p>
              </div>

              {/* AI Price Calculator */}
              {!priceEstimate ? (
                <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl p-6 border border-primary-200">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
                      <SparklesIcon className="w-6 h-6 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-gray-900 mb-1">احصل على تقييم AI للسعر</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        سنقوم بتحليل بيانات سيارتك ومقارنتها بالسوق للحصول على السعر العادل
                      </p>
                      <button
                        onClick={calculatePrice}
                        disabled={isCalculatingPrice}
                        className="bg-primary-600 text-white px-6 py-2 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {isCalculatingPrice ? (
                          <>
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                            جاري التحليل...
                          </>
                        ) : (
                          <>
                            <SparklesIcon className="w-5 h-5" />
                            احسب السعر
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white border-2 border-primary-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">تقييم AI</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      priceEstimate.confidence >= 0.8 ? 'bg-green-100 text-green-700' :
                      priceEstimate.confidence >= 0.6 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      ثقة {Math.round(priceEstimate.confidence * 100)}%
                    </span>
                  </div>

                  <div className="text-center py-4 border-b border-gray-200 mb-4">
                    <div className="text-sm text-gray-500 mb-1">السعر المقترح</div>
                    <div className="text-4xl font-bold text-primary-600">
                      {formatPrice(priceEstimate.estimatedValue)}
                      <span className="text-lg font-normal text-gray-500 mr-2">جنيه</span>
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                      النطاق: {formatPrice(priceEstimate.priceRange.min)} - {formatPrice(priceEstimate.priceRange.max)} جنيه
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-xs text-gray-500">بيع سريع</div>
                      <div className="font-bold text-green-600">{formatPrice(priceEstimate.recommendations?.quickSalePrice || priceEstimate.priceRange.min)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">السعر المثالي</div>
                      <div className="font-bold text-primary-600">{formatPrice(priceEstimate.recommendations?.askingPrice || priceEstimate.estimatedValue)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500">الحد الأدنى</div>
                      <div className="font-bold text-amber-600">{formatPrice(priceEstimate.recommendations?.minimumPrice || priceEstimate.priceRange.min * 0.9)}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => updateField('askingPrice', priceEstimate.recommendations?.askingPrice || priceEstimate.estimatedValue)}
                    className="w-full mt-4 py-2 text-primary-600 font-medium hover:bg-primary-50 rounded-xl transition-colors"
                  >
                    استخدم السعر المقترح
                  </button>
                </div>
              )}

              {/* Manual Price Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">السعر المطلوب *</label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.askingPrice}
                    onChange={(e) => updateField('askingPrice', parseInt(e.target.value) || '')}
                    placeholder="أدخل السعر المطلوب"
                    className="w-full px-4 py-4 text-xl border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">جنيه</span>
                </div>
              </div>

              {/* Barter Option */}
              <div className="bg-purple-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                      <ArrowPathIcon className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">قبول المقايضة</div>
                      <div className="text-sm text-gray-500">هل تقبل مقايضة سيارتك بسيارة أخرى؟</div>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.acceptsBarter}
                      onChange={(e) => updateField('acceptsBarter', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:-translate-x-full peer-checked:bg-purple-600 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                  </label>
                </div>

                {formData.acceptsBarter && (
                  <textarea
                    value={formData.barterPreferences}
                    onChange={(e) => updateField('barterPreferences', e.target.value)}
                    placeholder="صف تفضيلاتك للمقايضة (مثال: أبحث عن سيارة SUV موديل 2020 أو أحدث)"
                    className="w-full mt-4 px-4 py-3 border border-purple-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 h-20"
                  />
                )}
              </div>

              {/* Negotiable */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">السعر قابل للتفاوض</div>
                  <div className="text-sm text-gray-500">اسمح للمشترين بالتفاوض على السعر</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.negotiable}
                    onChange={(e) => updateField('negotiable', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:-translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
          )}

          {/* Step 6: Location & Contact */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">الموقع والتواصل</h2>
                <p className="text-gray-600">حدد موقعك وطريقة التواصل المفضلة</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة *</label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => updateField('governorate', e.target.value as Governorate)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">اختر المحافظة</option>
                    {Object.entries(GOVERNORATE_AR).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المدينة/المنطقة *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateField('city', e.target.value)}
                    placeholder="مثال: مدينة نصر"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>

              {/* Contact Method */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">طريقة التواصل المفضلة</label>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { id: 'phone', label: 'الهاتف فقط' },
                    { id: 'chat', label: 'الشات فقط' },
                    { id: 'both', label: 'الهاتف والشات' },
                  ].map((method) => (
                    <button
                      key={method.id}
                      onClick={() => updateField('contactMethod', method.id as 'phone' | 'chat' | 'both')}
                      className={`p-4 rounded-xl border-2 text-center transition-all ${
                        formData.contactMethod === method.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Show Phone */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <div className="font-medium text-gray-900">إظهار رقم الهاتف</div>
                  <div className="text-sm text-gray-500">السماح للمشترين برؤية رقم هاتفك</div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.showPhone}
                    onChange={(e) => updateField('showPhone', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:-translate-x-full peer-checked:bg-primary-600 after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
                </label>
              </div>
            </div>
          )}

          {/* Step 7: Review */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">مراجعة ونشر</h2>
                <p className="text-gray-600">راجع بيانات إعلانك قبل النشر</p>
              </div>

              {/* Summary Card */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Vehicle Preview */}
                <div className="relative h-48 bg-gray-200">
                  {formData.photos[0] ? (
                    <img src={formData.photos[0].url} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <PhotoIcon className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-xl font-bold text-white">
                      {formData.make && VEHICLE_MAKE_AR[formData.make as VehicleMake]} {formData.model} {formData.year}
                    </h3>
                    <div className="text-2xl font-bold text-primary-400">
                      {formatPrice(formData.askingPrice as number)} جنيه
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">نوع الهيكل:</span>
                    <span className="font-medium mr-2">{VEHICLE_BODY_TYPE_AR[formData.bodyType as VehicleBodyType]}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">الكيلومترات:</span>
                    <span className="font-medium mr-2">{formatPrice(formData.mileage as number)} كم</span>
                  </div>
                  <div>
                    <span className="text-gray-500">نوع الوقود:</span>
                    <span className="font-medium mr-2">{FUEL_TYPE_AR[formData.fuelType as FuelType]}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">ناقل الحركة:</span>
                    <span className="font-medium mr-2">{TRANSMISSION_AR[formData.transmission as Transmission]}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">الحالة:</span>
                    <span className="font-medium mr-2">{VEHICLE_CONDITION_AR[formData.condition as VehicleCondition]}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">الموقع:</span>
                    <span className="font-medium mr-2">{GOVERNORATE_AR[formData.governorate as Governorate]}</span>
                  </div>
                </div>

                {/* Badges */}
                <div className="px-4 pb-4 flex flex-wrap gap-2">
                  {formData.acceptsBarter && (
                    <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                      يقبل المقايضة
                    </span>
                  )}
                  {formData.negotiable && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      قابل للتفاوض
                    </span>
                  )}
                  {formData.serviceHistory && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                      سجل صيانة موثق
                    </span>
                  )}
                  {formData.originalPaint && (
                    <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                      طلاء أصلي
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف إضافي (اختياري)</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  placeholder="أضف أي معلومات إضافية تريد أن يعرفها المشترون عن سيارتك..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 h-32"
                />
              </div>

              {/* Terms */}
              <div className="bg-gray-50 rounded-xl p-4">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.agreedToTerms}
                    onChange={(e) => updateField('agreedToTerms', e.target.checked)}
                    className="mt-1 w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">أوافق على الشروط والأحكام</div>
                    <div className="text-sm text-gray-500">
                      بالضغط على نشر، أؤكد أن جميع المعلومات المقدمة صحيحة وأوافق على{' '}
                      <a href="#" className="text-primary-600 hover:underline">شروط الاستخدام</a>
                      {' '}و{' '}
                      <a href="#" className="text-primary-600 hover:underline">سياسة الخصوصية</a>
                    </div>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-2 px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <ArrowRightIcon className="w-5 h-5" />
                السابق
              </button>
            ) : (
              <div />
            )}

            {currentStep < 7 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="w-5 h-5" />
                    نشر الإعلان
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
