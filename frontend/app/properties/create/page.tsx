'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api/client';
import {
  createProperty,
  estimatePropertyValue,
  PROPERTY_TYPE_AR,
  LISTING_TYPE_AR,
  TITLE_TYPE_AR,
  FINISHING_LEVEL_AR,
  FURNISHING_STATUS_AR,
  PropertyType,
  ListingType,
  TitleType,
  FinishingLevel,
  FurnishingStatus,
} from '@/lib/api/properties';
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Home,
  MapPin,
  DollarSign,
  Maximize2,
  Bed,
  Bath,
  Layers,
  Calendar,
  Paintbrush,
  Compass,
  Image as ImageIcon,
  Shield,
  ArrowLeftRight,
  CheckCircle2,
  AlertTriangle,
  Info,
  Loader2,
  Plus,
  X,
  Upload,
} from 'lucide-react';

// Steps
const STEPS = [
  { id: 1, title: 'نوع العقار', icon: Home },
  { id: 2, title: 'الموقع', icon: MapPin },
  { id: 3, title: 'التفاصيل', icon: Maximize2 },
  { id: 4, title: 'السعر والمميزات', icon: DollarSign },
  { id: 5, title: 'الصور', icon: ImageIcon },
  { id: 6, title: 'المراجعة', icon: CheckCircle2 },
];

// Egyptian governorates
const GOVERNORATES = [
  { name: 'Cairo', nameAr: 'القاهرة' },
  { name: 'Giza', nameAr: 'الجيزة' },
  { name: 'Alexandria', nameAr: 'الإسكندرية' },
  { name: 'Qalyubia', nameAr: 'القليوبية' },
  { name: 'Sharqia', nameAr: 'الشرقية' },
  { name: 'Gharbia', nameAr: 'الغربية' },
  { name: 'Dakahlia', nameAr: 'الدقهلية' },
  { name: 'Beheira', nameAr: 'البحيرة' },
  { name: 'Monufia', nameAr: 'المنوفية' },
  { name: 'Kafr El Sheikh', nameAr: 'كفر الشيخ' },
  { name: 'Damietta', nameAr: 'دمياط' },
  { name: 'Port Said', nameAr: 'بور سعيد' },
  { name: 'Ismailia', nameAr: 'الإسماعيلية' },
  { name: 'Suez', nameAr: 'السويس' },
  { name: 'Fayoum', nameAr: 'الفيوم' },
  { name: 'Red Sea', nameAr: 'البحر الأحمر' },
  { name: 'Matrouh', nameAr: 'مطروح' },
  { name: 'South Sinai', nameAr: 'جنوب سيناء' },
];

// Amenities list
const AMENITIES = [
  { id: 'parking', label: 'موقف سيارات', icon: '🚗' },
  { id: 'garden', label: 'حديقة', icon: '🌳' },
  { id: 'pool', label: 'حمام سباحة', icon: '🏊' },
  { id: 'gym', label: 'صالة رياضية', icon: '🏋️' },
  { id: 'security', label: 'أمن 24/7', icon: '🔒' },
  { id: 'elevator', label: 'مصعد', icon: '🛗' },
  { id: 'ac', label: 'تكييف مركزي', icon: '❄️' },
  { id: 'balcony', label: 'بلكونة', icon: '🌅' },
  { id: 'storage', label: 'مخزن', icon: '📦' },
  { id: 'maidRoom', label: 'غرفة خادمة', icon: '🛏️' },
  { id: 'cctv', label: 'كاميرات مراقبة', icon: '📹' },
  { id: 'intercom', label: 'إنتركم', icon: '📞' },
];

// Barter preferences
const BARTER_PREFERENCES = [
  'شقة',
  'فيلا',
  'أرض',
  'سيارة',
  'ذهب',
  'محل تجاري',
  'مكتب',
  'شاليه',
];

interface FormData {
  // Step 1
  propertyType: PropertyType | '';
  listingType: ListingType | '';
  titleType: TitleType | '';

  // Step 2
  governorate: string;
  city: string;
  district: string;
  address: string;

  // Step 3
  title: string;
  description: string;
  area: number | '';
  bedrooms: number | '';
  bathrooms: number | '';
  floor: number | '';
  totalFloors: number | '';
  buildYear: number | '';
  finishingLevel: FinishingLevel | '';
  furnishingStatus: FurnishingStatus | '';
  direction: string;

  // Step 4
  price: number | '';
  amenities: string[];
  openToBarter: boolean;
  barterPreferences: string[];

  // Step 5
  images: string[];
  virtualTourUrl: string;
}

export default function CreatePropertyPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [estimatedValue, setEstimatedValue] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    propertyType: '',
    listingType: '',
    titleType: '',
    governorate: '',
    city: '',
    district: '',
    address: '',
    title: '',
    description: '',
    area: '',
    bedrooms: '',
    bathrooms: '',
    floor: '',
    totalFloors: '',
    buildYear: '',
    finishingLevel: '',
    furnishingStatus: '',
    direction: '',
    price: '',
    amenities: [],
    openToBarter: false,
    barterPreferences: [],
    images: [],
    virtualTourUrl: '',
  });

  const updateFormData = (updates: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  };

  // Auto-fill address from user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await api.get('/auth/profile');
        if (response.data.success && response.data.data) {
          const user = response.data.data;
          // Auto-fill location fields from user profile
          if (user.governorate || user.city || user.district || user.street) {
            setFormData(prev => ({
              ...prev,
              governorate: prev.governorate || user.governorate || '',
              city: prev.city || user.city || '',
              district: prev.district || user.district || '',
              address: prev.address || user.street || user.address || '',
            }));
          }
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      }
    };

    fetchUserProfile();
  }, []);

  const toggleAmenity = (amenityId: string) => {
    setFormData((prev) => ({
      ...prev,
      amenities: prev.amenities.includes(amenityId)
        ? prev.amenities.filter((a) => a !== amenityId)
        : [...prev.amenities, amenityId],
    }));
  };

  const toggleBarterPreference = (pref: string) => {
    setFormData((prev) => ({
      ...prev,
      barterPreferences: prev.barterPreferences.includes(pref)
        ? prev.barterPreferences.filter((p) => p !== pref)
        : [...prev.barterPreferences, pref],
    }));
  };

  const handleImageUpload = () => {
    // In a real app, this would open a file picker and upload to server
    const mockUrl = `https://picsum.photos/800/600?random=${Date.now()}`;
    setFormData((prev) => ({
      ...prev,
      images: [...prev.images, mockUrl],
    }));
  };

  const removeImage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const getEstimate = async () => {
    if (
      !formData.propertyType ||
      !formData.governorate ||
      !formData.city ||
      !formData.area
    )
      return;

    try {
      const estimate = await estimatePropertyValue({
        propertyType: formData.propertyType as PropertyType,
        governorate: formData.governorate,
        city: formData.city,
        area: Number(formData.area),
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        finishingLevel: formData.finishingLevel as FinishingLevel || undefined,
        floor: formData.floor ? Number(formData.floor) : undefined,
        buildYear: formData.buildYear ? Number(formData.buildYear) : undefined,
      });
      setEstimatedValue(estimate);
    } catch (err) {
      console.error('Error getting estimate:', err);
    }
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!formData.propertyType && !!formData.listingType && !!formData.titleType;
      case 2:
        return !!formData.governorate && !!formData.city && !!formData.address;
      case 3:
        return (
          !!formData.title &&
          !!formData.description &&
          !!formData.area &&
          Number(formData.area) > 0
        );
      case 4:
        return !!formData.price && Number(formData.price) > 0;
      case 5:
        return formData.images.length > 0;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        getEstimate();
      }
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length));
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setError(null);

      const property = await createProperty({
        title: formData.title,
        description: formData.description,
        propertyType: formData.propertyType as PropertyType,
        listingType: formData.listingType as ListingType,
        titleType: formData.titleType as TitleType,
        price: Number(formData.price),
        area: Number(formData.area),
        bedrooms: formData.bedrooms ? Number(formData.bedrooms) : undefined,
        bathrooms: formData.bathrooms ? Number(formData.bathrooms) : undefined,
        floor: formData.floor ? Number(formData.floor) : undefined,
        totalFloors: formData.totalFloors ? Number(formData.totalFloors) : undefined,
        buildYear: formData.buildYear ? Number(formData.buildYear) : undefined,
        finishingLevel: formData.finishingLevel as FinishingLevel || undefined,
        furnishingStatus: formData.furnishingStatus as FurnishingStatus || undefined,
        direction: formData.direction || undefined,
        governorate: formData.governorate,
        city: formData.city,
        district: formData.district || undefined,
        address: formData.address,
        images: formData.images,
        virtualTourUrl: formData.virtualTourUrl || undefined,
        amenities: formData.amenities,
        openToBarter: formData.openToBarter,
        barterPreferences: formData.openToBarter ? formData.barterPreferences : undefined,
      });

      router.push(`/properties/${property.id}`);
    } catch (err: any) {
      setError(err.message || 'فشل في إنشاء العقار');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="w-5 h-5" />
              <span>إلغاء</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-6 h-6 text-blue-600" />
              إضافة عقار جديد
            </h1>
            <div className="w-20" />
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div
                  key={step.id}
                  className="flex items-center"
                >
                  <div
                    className={`flex items-center gap-2 ${
                      isActive
                        ? 'text-blue-600'
                        : isCompleted
                        ? 'text-green-600'
                        : 'text-gray-400'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isActive
                          ? 'bg-blue-100'
                          : isCompleted
                          ? 'bg-green-100'
                          : 'bg-gray-100'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span className="hidden md:block text-sm font-medium">
                      {step.title}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-8 md:w-16 h-0.5 mx-2 ${
                        isCompleted ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Property Type */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">نوع العقار</h2>
                <p className="text-gray-600">اختر نوع العقار وطريقة البيع</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  نوع العقار *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {(Object.entries(PROPERTY_TYPE_AR) as [PropertyType, string][]).map(
                    ([type, label]) => (
                      <button
                        key={type}
                        onClick={() => updateFormData({ propertyType: type })}
                        className={`p-4 rounded-xl border-2 text-right transition-colors ${
                          formData.propertyType === type
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-gray-900">{label}</span>
                      </button>
                    )
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  طريقة العرض *
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => updateFormData({ listingType: 'SALE' })}
                    className={`p-6 rounded-xl border-2 text-center transition-colors ${
                      formData.listingType === 'SALE'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <DollarSign className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <span className="font-bold text-gray-900">للبيع</span>
                  </button>
                  <button
                    onClick={() => updateFormData({ listingType: 'RENT' })}
                    className={`p-6 rounded-xl border-2 text-center transition-colors ${
                      formData.listingType === 'RENT'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Home className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <span className="font-bold text-gray-900">للإيجار</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  نوع الملكية *
                </label>
                <div className="grid grid-cols-3 gap-4">
                  {(Object.entries(TITLE_TYPE_AR) as [TitleType, string][]).map(
                    ([type, label]) => (
                      <button
                        key={type}
                        onClick={() => updateFormData({ titleType: type })}
                        className={`p-4 rounded-xl border-2 text-center transition-colors ${
                          formData.titleType === type
                            ? type === 'REGISTERED'
                              ? 'border-green-500 bg-green-50'
                              : type === 'PRELIMINARY'
                              ? 'border-yellow-500 bg-yellow-50'
                              : 'border-red-500 bg-red-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium text-gray-900">{label}</span>
                      </button>
                    )
                  )}
                </div>
                {formData.titleType === 'POA' && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-700">
                      التوكيل يُعتبر من أخطر أنواع الملكية. تأكد من توفير جميع
                      المستندات اللازمة.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Location */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">الموقع</h2>
                <p className="text-gray-600">حدد موقع العقار بدقة</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المحافظة *
                  </label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => updateFormData({ governorate: e.target.value, city: '' })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map((gov) => (
                      <option key={gov.name} value={gov.name}>
                        {gov.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateFormData({ city: e.target.value })}
                    placeholder="مثال: المعادي"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحي (اختياري)
                </label>
                <input
                  type="text"
                  value={formData.district}
                  onChange={(e) => updateFormData({ district: e.target.value })}
                  placeholder="مثال: دجلة"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  العنوان التفصيلي *
                </label>
                <textarea
                  value={formData.address}
                  onChange={(e) => updateFormData({ address: e.target.value })}
                  placeholder="مثال: شارع 9، بجوار نادي وادي دجلة"
                  rows={3}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 3: Details */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">تفاصيل العقار</h2>
                <p className="text-gray-600">أضف تفاصيل العقار بدقة</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عنوان الإعلان *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData({ title: e.target.value })}
                  placeholder="مثال: شقة 3 غرف للبيع في المعادي"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الوصف *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData({ description: e.target.value })}
                  placeholder="اكتب وصفاً تفصيلياً للعقار..."
                  rows={5}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المساحة (م²) *
                  </label>
                  <input
                    type="number"
                    value={formData.area}
                    onChange={(e) => updateFormData({ area: e.target.value ? Number(e.target.value) : '' })}
                    placeholder="150"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    غرف النوم
                  </label>
                  <input
                    type="number"
                    value={formData.bedrooms}
                    onChange={(e) => updateFormData({ bedrooms: e.target.value ? Number(e.target.value) : '' })}
                    placeholder="3"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحمامات
                  </label>
                  <input
                    type="number"
                    value={formData.bathrooms}
                    onChange={(e) => updateFormData({ bathrooms: e.target.value ? Number(e.target.value) : '' })}
                    placeholder="2"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدور
                  </label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => updateFormData({ floor: e.target.value ? Number(e.target.value) : '' })}
                    placeholder="5"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    إجمالي الأدوار
                  </label>
                  <input
                    type="number"
                    value={formData.totalFloors}
                    onChange={(e) => updateFormData({ totalFloors: e.target.value ? Number(e.target.value) : '' })}
                    placeholder="10"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سنة البناء
                  </label>
                  <input
                    type="number"
                    value={formData.buildYear}
                    onChange={(e) => updateFormData({ buildYear: e.target.value ? Number(e.target.value) : '' })}
                    placeholder="2020"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مستوى التشطيب
                  </label>
                  <select
                    value={formData.finishingLevel}
                    onChange={(e) => updateFormData({ finishingLevel: e.target.value as FinishingLevel })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">اختر</option>
                    {(Object.entries(FINISHING_LEVEL_AR) as [FinishingLevel, string][]).map(
                      ([level, label]) => (
                        <option key={level} value={level}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة الفرش
                  </label>
                  <select
                    value={formData.furnishingStatus}
                    onChange={(e) => updateFormData({ furnishingStatus: e.target.value as FurnishingStatus })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">اختر</option>
                    {(Object.entries(FURNISHING_STATUS_AR) as [FurnishingStatus, string][]).map(
                      ([status, label]) => (
                        <option key={status} value={status}>
                          {label}
                        </option>
                      )
                    )}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Price & Features */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">السعر والمميزات</h2>
                <p className="text-gray-600">حدد السعر وأضف المميزات</p>
              </div>

              {/* AI Estimate */}
              {estimatedValue && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center gap-2 text-blue-700 font-medium mb-2">
                    <Info className="w-5 h-5" />
                    تقدير AI للقيمة السوقية
                  </div>
                  <div className="text-2xl font-bold text-blue-900 mb-1">
                    {formatCurrency(estimatedValue.estimatedValue.min)} -{' '}
                    {formatCurrency(estimatedValue.estimatedValue.max)}
                  </div>
                  <p className="text-sm text-blue-600">
                    المتوسط: {formatCurrency(estimatedValue.estimatedValue.average)} |
                    سعر المتر: {formatCurrency(estimatedValue.pricePerMeter.average)}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر (جنيه مصري) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => updateFormData({ price: e.target.value ? Number(e.target.value) : '' })}
                    placeholder="1500000"
                    className="w-full pr-10 pl-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                {formData.price && formData.area && (
                  <p className="text-sm text-gray-500 mt-1">
                    سعر المتر: {formatCurrency(Number(formData.price) / Number(formData.area))}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  المميزات
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {AMENITIES.map((amenity) => (
                    <button
                      key={amenity.id}
                      onClick={() => toggleAmenity(amenity.id)}
                      className={`flex items-center gap-2 p-3 rounded-lg border-2 transition-colors ${
                        formData.amenities.includes(amenity.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span>{amenity.icon}</span>
                      <span className="text-sm font-medium">{amenity.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Barter Option */}
              <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.openToBarter}
                    onChange={(e) => updateFormData({ openToBarter: e.target.checked })}
                    className="w-5 h-5 rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <div className="flex items-center gap-2 font-medium text-gray-900">
                      <ArrowLeftRight className="w-5 h-5 text-purple-600" />
                      أقبل المبادلة
                    </div>
                    <p className="text-sm text-gray-600">
                      السماح بمبادلة العقار بعقارات أو أصول أخرى
                    </p>
                  </div>
                </label>

                {formData.openToBarter && (
                  <div className="mt-4 pt-4 border-t border-purple-200">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      أفضل المبادلة بـ:
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {BARTER_PREFERENCES.map((pref) => (
                        <button
                          key={pref}
                          onClick={() => toggleBarterPreference(pref)}
                          className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                            formData.barterPreferences.includes(pref)
                              ? 'border-purple-500 bg-purple-100 text-purple-700'
                              : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                          }`}
                        >
                          {pref}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 5: Images */}
          {currentStep === 5 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">الصور</h2>
                <p className="text-gray-600">أضف صور عالية الجودة للعقار</p>
              </div>

              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">اسحب الصور هنا أو</p>
                <button
                  onClick={handleImageUpload}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  اختر صور
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  يُفضل إضافة 5-10 صور بدقة عالية
                </p>
              </div>

              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {formData.images.map((img, idx) => (
                    <div key={idx} className="relative group">
                      <img
                        src={img}
                        alt={`صورة ${idx + 1}`}
                        className="w-full aspect-square object-cover rounded-lg"
                      />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 left-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-2 right-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                          رئيسية
                        </span>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={handleImageUpload}
                    className="aspect-square border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-blue-500 hover:text-blue-600 transition-colors"
                  >
                    <Plus className="w-8 h-8" />
                    <span className="text-sm">إضافة المزيد</span>
                  </button>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رابط جولة افتراضية 360° (اختياري)
                </label>
                <input
                  type="url"
                  value={formData.virtualTourUrl}
                  onChange={(e) => updateFormData({ virtualTourUrl: e.target.value })}
                  placeholder="https://..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">مراجعة الإعلان</h2>
                <p className="text-gray-600">راجع البيانات قبل النشر</p>
              </div>

              {/* Preview Card */}
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {formData.images[0] && (
                  <img
                    src={formData.images[0]}
                    alt={formData.title}
                    className="w-full aspect-video object-cover"
                  />
                )}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {formData.title || 'عنوان الإعلان'}
                  </h3>
                  <div className="flex items-center gap-1 text-gray-600 mb-4">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {formData.district ? `${formData.district}، ` : ''}
                      {formData.city}، {formData.governorate}
                    </span>
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-4">
                    {formData.price ? formatCurrency(Number(formData.price)) : '---'}
                  </div>
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    <span className="flex items-center gap-1">
                      <Maximize2 className="w-4 h-4" />
                      {formData.area} م²
                    </span>
                    {formData.bedrooms && (
                      <span className="flex items-center gap-1">
                        <Bed className="w-4 h-4" />
                        {formData.bedrooms} غرف
                      </span>
                    )}
                    {formData.bathrooms && (
                      <span className="flex items-center gap-1">
                        <Bath className="w-4 h-4" />
                        {formData.bathrooms} حمام
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-6 space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع العقار:</span>
                  <span className="font-medium">
                    {formData.propertyType
                      ? PROPERTY_TYPE_AR[formData.propertyType]
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع العرض:</span>
                  <span className="font-medium">
                    {formData.listingType
                      ? LISTING_TYPE_AR[formData.listingType]
                      : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">نوع الملكية:</span>
                  <span className="font-medium">
                    {formData.titleType ? TITLE_TYPE_AR[formData.titleType] : '-'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">عدد الصور:</span>
                  <span className="font-medium">{formData.images.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">يقبل المبادلة:</span>
                  <span className="font-medium">
                    {formData.openToBarter ? 'نعم' : 'لا'}
                  </span>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                  <AlertTriangle className="w-5 h-5" />
                  {error}
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            {currentStep > 1 ? (
              <button
                onClick={prevStep}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowRight className="w-5 h-5" />
                السابق
              </button>
            ) : (
              <div />
            )}

            {currentStep < STEPS.length ? (
              <button
                onClick={nextStep}
                disabled={!validateStep(currentStep)}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
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
