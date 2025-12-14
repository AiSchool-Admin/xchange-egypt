"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  Car,
  Camera,
  FileText,
  Tag,
  CheckCircle,
  Upload,
  X,
  Plus,
  Info,
  Sparkles,
  ShieldCheck,
  Clock,
  Eye,
  RefreshCw,
  AlertCircle,
  ImageIcon,
} from "lucide-react";
import {
  VEHICLE_MAKE_AR,
  BODY_TYPE_AR,
  FUEL_TYPE_AR,
  TRANSMISSION_AR,
  CONDITION_AR,
  GOVERNORATE_AR,
  SELLER_TYPE_AR,
  type VehicleMake,
  type VehicleBodyType,
  type FuelType,
  type TransmissionType,
  type VehicleCondition,
  type Governorate,
  type SellerType,
} from "@/lib/api/vehicle-marketplace";

// Form steps
const STEPS = [
  { id: 1, title: "نوع السيارة", icon: Car },
  { id: 2, title: "المواصفات", icon: FileText },
  { id: 3, title: "الصور", icon: Camera },
  { id: 4, title: "السعر", icon: Tag },
  { id: 5, title: "معلومات البائع", icon: Info },
  { id: 6, title: "المراجعة", icon: Eye },
  { id: 7, title: "النشر", icon: CheckCircle },
];

// Year options
const YEARS = Array.from({ length: 35 }, (_, i) => 2025 - i);

// Color options
const COLORS_AR: Record<string, string> = {
  white: "أبيض",
  black: "أسود",
  silver: "فضي",
  gray: "رمادي",
  red: "أحمر",
  blue: "أزرق",
  green: "أخضر",
  gold: "ذهبي",
  beige: "بيج",
  brown: "بني",
  orange: "برتقالي",
  yellow: "أصفر",
  purple: "بنفسجي",
};

interface FormData {
  // Step 1: Vehicle Type
  make: VehicleMake | "";
  model: string;
  year: number | "";
  bodyType: VehicleBodyType | "";

  // Step 2: Specifications
  mileage: number | "";
  fuelType: FuelType | "";
  transmission: TransmissionType | "";
  engineSize: string;
  color: string;
  condition: VehicleCondition | "";
  features: string[];

  // Step 3: Images
  images: string[];

  // Step 4: Pricing
  askingPrice: number | "";
  priceNegotiable: boolean;
  allowBarter: boolean;
  barterPreferences: string;

  // Step 5: Seller Info
  sellerType: SellerType | "";
  governorate: Governorate | "";
  city: string;
  phone: string;
  whatsapp: string;
  description: string;
}

const AVAILABLE_FEATURES = [
  "تكييف",
  "فتحة سقف",
  "مقاعد جلد",
  "كاميرا خلفية",
  "حساسات ركن",
  "بلوتوث",
  "شاشة لمس",
  "نظام ملاحة",
  "مثبت سرعة",
  "ABS",
  "وسائد هوائية",
  "نظام صوتي متطور",
  "مقاعد كهربائية",
  "مرايا كهربائية",
  "زجاج كهربائي",
  "ريموت",
  "إضاءة LED",
  "عجلات ألمنيوم",
];

export default function SellVehiclePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    make: "",
    model: "",
    year: "",
    bodyType: "",
    mileage: "",
    fuelType: "",
    transmission: "",
    engineSize: "",
    color: "",
    condition: "",
    features: [],
    images: [],
    askingPrice: "",
    priceNegotiable: true,
    allowBarter: false,
    barterPreferences: "",
    sellerType: "",
    governorate: "",
    city: "",
    phone: "",
    whatsapp: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  const updateForm = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleFeature = (feature: string) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter((f) => f !== feature)
        : [...prev.features, feature],
    }));
  };

  const addImage = () => {
    // Simulate image upload
    const mockImages = [
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=800",
      "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?w=800",
      "https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=800",
      "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800",
    ];
    const randomImage = mockImages[Math.floor(Math.random() * mockImages.length)];
    if (formData.images.length < 10) {
      updateForm("images", [...formData.images, randomImage]);
    }
  };

  const removeImage = (index: number) => {
    updateForm(
      "images",
      formData.images.filter((_, i) => i !== index)
    );
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.make && formData.model && formData.year && formData.bodyType;
      case 2:
        return formData.mileage && formData.fuelType && formData.transmission && formData.condition;
      case 3:
        return formData.images.length >= 3;
      case 4:
        return formData.askingPrice;
      case 5:
        return formData.sellerType && formData.governorate && formData.phone;
      case 6:
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (currentStep < 7 && canProceed()) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));
    setIsSubmitting(false);
    setIsPublished(true);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-EG").format(price) + " جنيه";
  };

  // Render step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">نوع السيارة</h2>
            <p className="text-gray-600">أدخل المعلومات الأساسية عن سيارتك</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الشركة المصنعة *
                </label>
                <select
                  value={formData.make}
                  onChange={(e) => updateForm("make", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر الشركة</option>
                  {Object.entries(VEHICLE_MAKE_AR).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الموديل *
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => updateForm("model", e.target.value)}
                  placeholder="مثال: كامري"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سنة الصنع *
                </label>
                <select
                  value={formData.year}
                  onChange={(e) => updateForm("year", parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر السنة</option>
                  {YEARS.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الهيكل *
                </label>
                <select
                  value={formData.bodyType}
                  onChange={(e) => updateForm("bodyType", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر النوع</option>
                  {Object.entries(BODY_TYPE_AR).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">المواصفات</h2>
            <p className="text-gray-600">أدخل المواصفات التفصيلية للسيارة</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  عداد الكيلومترات *
                </label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => updateForm("mileage", parseInt(e.target.value))}
                  placeholder="مثال: 50000"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع الوقود *
                </label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => updateForm("fuelType", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر نوع الوقود</option>
                  {Object.entries(FUEL_TYPE_AR).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ناقل الحركة *
                </label>
                <select
                  value={formData.transmission}
                  onChange={(e) => updateForm("transmission", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر ناقل الحركة</option>
                  {Object.entries(TRANSMISSION_AR).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  سعة المحرك
                </label>
                <input
                  type="text"
                  value={formData.engineSize}
                  onChange={(e) => updateForm("engineSize", e.target.value)}
                  placeholder="مثال: 2.5L"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  اللون
                </label>
                <select
                  value={formData.color}
                  onChange={(e) => updateForm("color", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر اللون</option>
                  {Object.entries(COLORS_AR).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة *
                </label>
                <select
                  value={formData.condition}
                  onChange={(e) => updateForm("condition", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر الحالة</option>
                  {Object.entries(CONDITION_AR).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                المميزات
              </label>
              <div className="flex flex-wrap gap-2">
                {AVAILABLE_FEATURES.map((feature) => (
                  <button
                    key={feature}
                    type="button"
                    onClick={() => toggleFeature(feature)}
                    className={`px-4 py-2 rounded-full text-sm transition-colors ${
                      formData.features.includes(feature)
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {feature}
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">صور السيارة</h2>
            <p className="text-gray-600">
              أضف صور واضحة للسيارة (3 صور على الأقل، 10 صور كحد أقصى)
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {formData.images.map((image, index) => (
                <div key={index} className="relative aspect-video rounded-xl overflow-hidden group">
                  <img src={image} alt={`صورة ${index + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded">
                      الصورة الرئيسية
                    </span>
                  )}
                </div>
              ))}

              {formData.images.length < 10 && (
                <button
                  onClick={addImage}
                  className="aspect-video border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Upload className="w-8 h-8 text-gray-400" />
                  <span className="text-sm text-gray-500">إضافة صورة</span>
                </button>
              )}
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">نصائح للصور المثالية:</p>
                  <ul className="list-disc list-inside space-y-1 text-blue-700">
                    <li>التقط الصور في إضاءة جيدة</li>
                    <li>صوّر السيارة من جميع الزوايا</li>
                    <li>أضف صور للداخلية والمحرك</li>
                    <li>صوّر أي عيوب بوضوح للشفافية</li>
                  </ul>
                </div>
              </div>
            </div>

            {formData.images.length < 3 && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 text-amber-800">
                  <AlertCircle className="w-5 h-5" />
                  <span>يجب إضافة 3 صور على الأقل للمتابعة</span>
                </div>
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">السعر والمقايضة</h2>
            <p className="text-gray-600">حدد سعر السيارة وخيارات المقايضة</p>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  السعر المطلوب *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.askingPrice}
                    onChange={(e) => updateForm("askingPrice", parseInt(e.target.value))}
                    placeholder="أدخل السعر بالجنيه"
                    className="w-full p-3 pr-20 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                    جنيه
                  </span>
                </div>
                {formData.askingPrice && (
                  <p className="mt-2 text-sm text-gray-500">
                    {formatPrice(formData.askingPrice as number)}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">السعر قابل للتفاوض</p>
                  <p className="text-sm text-gray-500">السماح للمشترين بالتفاوض على السعر</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm("priceNegotiable", !formData.priceNegotiable)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    formData.priceNegotiable ? "bg-blue-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      formData.priceNegotiable ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p className="font-medium text-gray-900">قبول المقايضة</p>
                  <p className="text-sm text-gray-500">السماح بمقايضة السيارة بسيارة أخرى</p>
                </div>
                <button
                  type="button"
                  onClick={() => updateForm("allowBarter", !formData.allowBarter)}
                  className={`relative w-14 h-8 rounded-full transition-colors ${
                    formData.allowBarter ? "bg-green-600" : "bg-gray-300"
                  }`}
                >
                  <span
                    className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-transform ${
                      formData.allowBarter ? "right-1" : "left-1"
                    }`}
                  />
                </button>
              </div>

              {formData.allowBarter && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    تفضيلات المقايضة
                  </label>
                  <textarea
                    value={formData.barterPreferences}
                    onChange={(e) => updateForm("barterPreferences", e.target.value)}
                    placeholder="مثال: أفضل سيارة SUV موديل 2020 أو أحدث"
                    rows={3}
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              )}

              <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="text-sm text-green-800">
                    <p className="font-medium mb-1">تسعير ذكي مقترح:</p>
                    <p>
                      بناءً على السيارات المشابهة في السوق، السعر المقترح:{" "}
                      <span className="font-bold">450,000 - 520,000 جنيه</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">معلومات البائع</h2>
            <p className="text-gray-600">أدخل معلومات التواصل والموقع</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع البائع *
                </label>
                <select
                  value={formData.sellerType}
                  onChange={(e) => updateForm("sellerType", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر نوع البائع</option>
                  {Object.entries(SELLER_TYPE_AR).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المحافظة *
                </label>
                <select
                  value={formData.governorate}
                  onChange={(e) => updateForm("governorate", e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">اختر المحافظة</option>
                  {Object.entries(GOVERNORATE_AR).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  المدينة / المنطقة
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => updateForm("city", e.target.value)}
                  placeholder="مثال: مدينة نصر"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الهاتف *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateForm("phone", e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  رقم الواتساب (اختياري)
                </label>
                <input
                  type="tel"
                  value={formData.whatsapp}
                  onChange={(e) => updateForm("whatsapp", e.target.value)}
                  placeholder="01xxxxxxxxx"
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  وصف إضافي
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="أضف أي معلومات إضافية عن السيارة..."
                  rows={4}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">مراجعة الإعلان</h2>
            <p className="text-gray-600">راجع جميع المعلومات قبل النشر</p>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              {/* Preview Header */}
              {formData.images[0] && (
                <div className="relative h-64">
                  <img
                    src={formData.images[0]}
                    alt="الصورة الرئيسية"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-4 left-4 flex gap-2">
                    <span className="bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      <ImageIcon className="w-4 h-4 inline ml-1" />
                      {formData.images.length} صور
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {formData.make && VEHICLE_MAKE_AR[formData.make as VehicleMake]} {formData.model}{" "}
                    {formData.year}
                  </h3>
                  {formData.askingPrice && (
                    <p className="text-3xl font-bold text-blue-600 mt-2">
                      {formatPrice(formData.askingPrice as number)}
                      {formData.priceNegotiable && (
                        <span className="text-sm font-normal text-gray-500 mr-2">
                          (قابل للتفاوض)
                        </span>
                      )}
                    </p>
                  )}
                </div>

                {/* Quick Info */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <p className="text-sm text-gray-500">الكيلومترات</p>
                    <p className="font-bold">
                      {formData.mileage ? `${formData.mileage.toLocaleString()} كم` : "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <p className="text-sm text-gray-500">ناقل الحركة</p>
                    <p className="font-bold">
                      {formData.transmission
                        ? TRANSMISSION_AR[formData.transmission as TransmissionType]
                        : "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <p className="text-sm text-gray-500">الوقود</p>
                    <p className="font-bold">
                      {formData.fuelType ? FUEL_TYPE_AR[formData.fuelType as FuelType] : "-"}
                    </p>
                  </div>
                  <div className="bg-gray-50 p-3 rounded-xl text-center">
                    <p className="text-sm text-gray-500">الحالة</p>
                    <p className="font-bold">
                      {formData.condition
                        ? CONDITION_AR[formData.condition as VehicleCondition]
                        : "-"}
                    </p>
                  </div>
                </div>

                {/* Features */}
                {formData.features.length > 0 && (
                  <div>
                    <h4 className="font-bold text-gray-900 mb-2">المميزات</h4>
                    <div className="flex flex-wrap gap-2">
                      {formData.features.map((feature) => (
                        <span
                          key={feature}
                          className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Barter */}
                {formData.allowBarter && (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 text-green-800">
                      <RefreshCw className="w-5 h-5" />
                      <span className="font-medium">يقبل المقايضة</span>
                    </div>
                    {formData.barterPreferences && (
                      <p className="text-sm text-green-700 mt-1">
                        التفضيلات: {formData.barterPreferences}
                      </p>
                    )}
                  </div>
                )}

                {/* Location */}
                <div className="flex items-center gap-2 text-gray-600">
                  <span>
                    {formData.governorate && GOVERNORATE_AR[formData.governorate as Governorate]}
                    {formData.city && ` - ${formData.city}`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );

      case 7:
        if (isPublished) {
          return (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                تم نشر إعلانك بنجاح!
              </h2>
              <p className="text-gray-600 mb-8">
                إعلانك الآن مرئي لجميع المستخدمين في سوق السيارات
              </p>

              <div className="bg-gray-50 rounded-2xl p-6 max-w-md mx-auto mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-600">رقم الإعلان</span>
                  <span className="font-bold">#VH-2024-001234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">الحالة</span>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                    نشط
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/vehicles/my-listings"
                  className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors"
                >
                  عرض إعلاناتي
                </Link>
                <Link
                  href="/vehicles"
                  className="bg-gray-100 text-gray-700 px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  العودة للسوق
                </Link>
              </div>
            </div>
          );
        }

        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">نشر الإعلان</h2>
            <p className="text-gray-600">اختر باقة النشر المناسبة</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Free */}
              <div className="border border-gray-200 rounded-2xl p-6 hover:border-blue-300 transition-colors">
                <h3 className="text-xl font-bold text-gray-900 mb-2">مجاني</h3>
                <p className="text-3xl font-bold text-gray-900 mb-4">0 جنيه</p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>ظهور في نتائج البحث</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>صالح لمدة 30 يوم</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>حتى 5 صور</span>
                  </li>
                </ul>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "جاري النشر..." : "نشر مجاناً"}
                </button>
              </div>

              {/* Premium */}
              <div className="border-2 border-blue-500 rounded-2xl p-6 relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                  الأكثر شعبية
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">مميز</h3>
                <p className="text-3xl font-bold text-blue-600 mb-4">
                  199 <span className="text-lg font-normal">جنيه</span>
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>ظهور في أعلى النتائج</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>صالح لمدة 60 يوم</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>حتى 10 صور</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Sparkles className="w-5 h-5 text-blue-500" />
                    <span>شارة "مميز"</span>
                  </li>
                </ul>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 text-white py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "جاري النشر..." : "نشر كإعلان مميز"}
                </button>
              </div>

              {/* VIP */}
              <div className="border border-amber-300 rounded-2xl p-6 bg-amber-50">
                <h3 className="text-xl font-bold text-gray-900 mb-2">VIP</h3>
                <p className="text-3xl font-bold text-amber-600 mb-4">
                  499 <span className="text-lg font-normal">جنيه</span>
                </p>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>ظهور في الصفحة الرئيسية</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>صالح لمدة 90 يوم</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>صور غير محدودة</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <ShieldCheck className="w-5 h-5 text-amber-500" />
                    <span>شارة "VIP"</span>
                  </li>
                  <li className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-5 h-5 text-amber-500" />
                    <span>دعم أولوية</span>
                  </li>
                </ul>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-amber-500 text-white py-3 rounded-xl font-medium hover:bg-amber-600 transition-colors disabled:opacity-50"
                >
                  {isSubmitting ? "جاري النشر..." : "نشر كإعلان VIP"}
                </button>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/vehicles"
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">بيع سيارتك</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Progress Steps */}
        {!isPublished && (
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isComplete = step.id < currentStep;

                return (
                  <div key={step.id} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                          isComplete
                            ? "bg-green-500 text-white"
                            : isActive
                            ? "bg-blue-600 text-white"
                            : "bg-gray-200 text-gray-500"
                        }`}
                      >
                        {isComplete ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Icon className="w-5 h-5" />
                        )}
                      </div>
                      <span
                        className={`text-xs mt-2 hidden md:block ${
                          isActive ? "text-blue-600 font-medium" : "text-gray-500"
                        }`}
                      >
                        {step.title}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`w-8 md:w-16 h-1 mx-2 rounded ${
                          step.id < currentStep ? "bg-green-500" : "bg-gray-200"
                        }`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">{renderStepContent()}</div>

        {/* Navigation */}
        {!isPublished && currentStep < 7 && (
          <div className="flex items-center justify-between mt-6">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>السابق</span>
            </button>

            <button
              onClick={handleNext}
              disabled={!canProceed()}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{currentStep === 6 ? "متابعة للنشر" : "التالي"}</span>
              <ArrowRight className="w-5 h-5 rotate-180" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
