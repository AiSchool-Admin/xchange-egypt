"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Smartphone,
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Shield,
  Camera,
  Battery,
  HardDrive,
  DollarSign,
  ArrowLeftRight,
  Upload,
  X,
  AlertCircle,
  Loader2,
  Info,
} from "lucide-react";
import {
  MobileBrand,
  MobileConditionGrade,
  MobileScreenCondition,
  MobileBodyCondition,
  MOBILE_BRAND_AR,
  CONDITION_GRADE_AR,
  SCREEN_CONDITION_AR,
  BODY_CONDITION_AR,
  POPULAR_MODELS,
  STORAGE_OPTIONS,
  EGYPTIAN_GOVERNORATES,
  formatMobilePrice,
  getConditionGradeColor,
} from "@/lib/api/mobile-marketplace";

const STEPS = [
  { id: 1, title: "نوع الجهاز", icon: Smartphone },
  { id: 2, title: "التحقق من IMEI", icon: Shield },
  { id: 3, title: "حالة الجهاز", icon: Battery },
  { id: 4, title: "التسعير", icon: DollarSign },
  { id: 5, title: "الصور", icon: Camera },
  { id: 6, title: "المراجعة", icon: CheckCircle },
];

export default function MobileSellPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imeiChecking, setImeiChecking] = useState(false);
  const [imeiResult, setImeiResult] = useState<{
    valid: boolean;
    status: string;
    message: string;
  } | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    // Step 1: Device Type
    brand: "" as MobileBrand | "",
    model: "",
    customModel: "",
    storageGb: 128,
    ramGb: 0,
    color: "",

    // Step 2: IMEI
    imei: "",

    // Step 3: Condition
    conditionGrade: "" as MobileConditionGrade | "",
    batteryHealth: 100,
    screenCondition: "" as MobileScreenCondition | "",
    bodyCondition: "" as MobileBodyCondition | "",
    originalParts: true,
    hasBox: false,
    hasAccessories: false,
    accessoriesDetails: "",

    // Step 4: Pricing
    priceEgp: 0,
    negotiable: true,
    acceptsBarter: false,
    barterPreferredBrands: [] as MobileBrand[],
    barterMinValue: 0,
    barterMaxCashDiff: 0,

    // Step 5: Photos
    images: [] as File[],
    verificationImage: null as File | null,

    // Location
    governorate: "",
    city: "",
    district: "",

    // Description
    title: "",
    description: "",
  });

  const updateForm = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const handleIMEICheck = async () => {
    if (formData.imei.length !== 15) return;

    setImeiChecking(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));

    setImeiResult({
      valid: true,
      status: "CLEAN",
      message: "الجهاز نظيف وغير محظور",
    });
    setImeiChecking(false);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.brand && (formData.model || formData.customModel) && formData.storageGb;
      case 2:
        return formData.imei.length === 15 && imeiResult?.valid;
      case 3:
        return formData.conditionGrade && formData.screenCondition && formData.bodyCondition;
      case 4:
        return formData.priceEgp > 0 && formData.governorate;
      case 5:
        return formData.images.length >= 4;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    // Simulate submission
    await new Promise(resolve => setTimeout(resolve, 2000));
    // Redirect to success page
    window.location.href = "/mobile/my-listings?success=1";
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/mobile" className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
              <ArrowRight className="w-5 h-5" />
              <span>إلغاء</span>
            </Link>
            <h1 className="text-lg font-bold">بيع موبايل</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between max-w-3xl mx-auto">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div
                  className={`flex flex-col items-center ${
                    currentStep >= step.id ? "text-blue-600" : "text-gray-400"
                  }`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${
                      currentStep > step.id
                        ? "bg-green-500 text-white"
                        : currentStep === step.id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    {currentStep > step.id ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : (
                      <step.icon className="w-5 h-5" />
                    )}
                  </div>
                  <span className="text-xs hidden md:block">{step.title}</span>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    className={`w-8 md:w-16 h-1 mx-2 rounded ${
                      currentStep > step.id ? "bg-green-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Form Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Step 1: Device Type */}
          {currentStep === 1 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">نوع الجهاز</h2>

              {/* Brand */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">الماركة *</label>
                <div className="grid grid-cols-4 gap-3">
                  {(Object.keys(MOBILE_BRAND_AR) as MobileBrand[]).slice(0, 12).map(brand => (
                    <button
                      key={brand}
                      onClick={() => updateForm({ brand, model: "", customModel: "" })}
                      className={`p-3 rounded-xl text-center transition ${
                        formData.brand === brand
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="text-sm font-medium">{MOBILE_BRAND_AR[brand]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Model */}
              {formData.brand && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموديل *</label>
                  {POPULAR_MODELS[formData.brand] ? (
                    <div className="space-y-2">
                      <select
                        value={formData.model}
                        onChange={(e) => updateForm({ model: e.target.value, customModel: "" })}
                        className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">اختر الموديل</option>
                        {POPULAR_MODELS[formData.brand]?.map(model => (
                          <option key={model} value={model}>{model}</option>
                        ))}
                        <option value="other">موديل آخر</option>
                      </select>
                      {formData.model === "other" && (
                        <input
                          type="text"
                          value={formData.customModel}
                          onChange={(e) => updateForm({ customModel: e.target.value })}
                          placeholder="اكتب اسم الموديل"
                          className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      )}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={formData.customModel}
                      onChange={(e) => updateForm({ customModel: e.target.value })}
                      placeholder="اكتب اسم الموديل"
                      className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  )}
                </div>
              )}

              {/* Storage */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">السعة التخزينية *</label>
                <div className="flex flex-wrap gap-2">
                  {STORAGE_OPTIONS.map(storage => (
                    <button
                      key={storage}
                      onClick={() => updateForm({ storageGb: storage })}
                      className={`px-4 py-2 rounded-xl transition ${
                        formData.storageGb === storage
                          ? "bg-blue-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {storage >= 1024 ? `${storage / 1024}TB` : `${storage}GB`}
                    </button>
                  ))}
                </div>
              </div>

              {/* Color */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">اللون</label>
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => updateForm({ color: e.target.value })}
                  placeholder="مثال: أسود، أبيض، ذهبي"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Step 2: IMEI Verification */}
          {currentStep === 2 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">التحقق من IMEI</h2>
              <p className="text-gray-500 text-sm mb-6">
                أدخل رقم IMEI للتحقق من أن الجهاز غير مسروق أو محظور
              </p>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">رقم IMEI *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={formData.imei}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, "").slice(0, 15);
                      updateForm({ imei: value });
                      setImeiResult(null);
                    }}
                    placeholder="أدخل 15 رقم"
                    maxLength={15}
                    className="flex-1 px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
                    dir="ltr"
                  />
                  <button
                    onClick={handleIMEICheck}
                    disabled={formData.imei.length !== 15 || imeiChecking}
                    className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {imeiChecking ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <Shield className="w-5 h-5" />
                    )}
                    تحقق
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  للحصول على IMEI: اطلب *#06# من لوحة الاتصال
                </p>
              </div>

              {imeiResult && (
                <div className={`p-4 rounded-xl ${imeiResult.valid ? "bg-green-50" : "bg-red-50"}`}>
                  <div className="flex items-center gap-2">
                    {imeiResult.valid ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-600" />
                    )}
                    <span className={`font-medium ${imeiResult.valid ? "text-green-800" : "text-red-800"}`}>
                      {imeiResult.message}
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-6 p-4 bg-blue-50 rounded-xl">
                <h3 className="font-medium text-blue-800 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  لماذا نحتاج IMEI؟
                </h3>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• التحقق من أن الجهاز غير مسروق</li>
                  <li>• التأكد من عدم وجود حظر على الجهاز</li>
                  <li>• حماية المشتري والبائع</li>
                </ul>
              </div>
            </div>
          )}

          {/* Step 3: Condition */}
          {currentStep === 3 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">حالة الجهاز</h2>

              {/* Condition Grade */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">تصنيف الحالة العامة *</label>
                <div className="grid grid-cols-4 gap-3">
                  {(["A", "B", "C", "D"] as MobileConditionGrade[]).map(grade => (
                    <button
                      key={grade}
                      onClick={() => updateForm({ conditionGrade: grade })}
                      className={`p-4 rounded-xl text-center transition ${
                        formData.conditionGrade === grade
                          ? getConditionGradeColor(grade) + " ring-2 ring-offset-2 ring-blue-500"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      <span className="text-2xl font-bold block">{grade}</span>
                      <span className="text-xs">{CONDITION_GRADE_AR[grade].label}</span>
                    </button>
                  ))}
                </div>
                {formData.conditionGrade && (
                  <p className="text-sm text-gray-500 mt-2">
                    {CONDITION_GRADE_AR[formData.conditionGrade].desc}
                  </p>
                )}
              </div>

              {/* Battery Health */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  صحة البطارية: {formData.batteryHealth}%
                </label>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={formData.batteryHealth}
                  onChange={(e) => updateForm({ batteryHealth: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Screen Condition */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">حالة الشاشة *</label>
                <select
                  value={formData.screenCondition}
                  onChange={(e) => updateForm({ screenCondition: e.target.value as MobileScreenCondition })}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر حالة الشاشة</option>
                  {Object.entries(SCREEN_CONDITION_AR).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              {/* Body Condition */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">حالة الجسم الخارجي *</label>
                <select
                  value={formData.bodyCondition}
                  onChange={(e) => updateForm({ bodyCondition: e.target.value as MobileBodyCondition })}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر حالة الجسم</option>
                  {Object.entries(BODY_CONDITION_AR).map(([key, value]) => (
                    <option key={key} value={key}>{value}</option>
                  ))}
                </select>
              </div>

              {/* Extras */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.originalParts}
                    onChange={(e) => updateForm({ originalParts: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span>جميع القطع أصلية</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasBox}
                    onChange={(e) => updateForm({ hasBox: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span>يوجد العلبة الأصلية</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.hasAccessories}
                    onChange={(e) => updateForm({ hasAccessories: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span>يوجد إكسسوارات</span>
                </label>
              </div>

              {formData.hasAccessories && (
                <div className="mt-4">
                  <input
                    type="text"
                    value={formData.accessoriesDetails}
                    onChange={(e) => updateForm({ accessoriesDetails: e.target.value })}
                    placeholder="ما هي الإكسسوارات المتوفرة؟"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Step 4: Pricing */}
          {currentStep === 4 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">التسعير والموقع</h2>

              {/* Price */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">السعر المطلوب (ج.م) *</label>
                <input
                  type="number"
                  value={formData.priceEgp || ""}
                  onChange={(e) => updateForm({ priceEgp: Number(e.target.value) })}
                  placeholder="0"
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-2xl font-bold text-left"
                  dir="ltr"
                />
                {formData.priceEgp > 0 && (
                  <p className="text-lg text-blue-600 font-medium mt-2">
                    {formatMobilePrice(formData.priceEgp)}
                  </p>
                )}
              </div>

              <div className="mb-6">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.negotiable}
                    onChange={(e) => updateForm({ negotiable: e.target.checked })}
                    className="w-5 h-5 text-blue-600 rounded"
                  />
                  <span>السعر قابل للتفاوض</span>
                </label>
              </div>

              {/* Barter */}
              <div className="mb-6 p-4 bg-purple-50 rounded-xl">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.acceptsBarter}
                    onChange={(e) => updateForm({ acceptsBarter: e.target.checked })}
                    className="w-5 h-5 text-purple-600 rounded"
                  />
                  <div>
                    <span className="font-medium text-purple-800">قبول المقايضة</span>
                    <p className="text-sm text-purple-600">السماح للمشترين بعرض أجهزتهم للتبادل</p>
                  </div>
                </label>
              </div>

              {/* Location */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة *</label>
                <select
                  value={formData.governorate}
                  onChange={(e) => updateForm({ governorate: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">اختر المحافظة</option>
                  {EGYPTIAN_GOVERNORATES.map(gov => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">المدينة</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => updateForm({ city: e.target.value })}
                    placeholder="اختياري"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحي</label>
                  <input
                    type="text"
                    value={formData.district}
                    onChange={(e) => updateForm({ district: e.target.value })}
                    placeholder="اختياري"
                    className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Photos */}
          {currentStep === 5 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-2">صور الجهاز</h2>
              <p className="text-gray-500 text-sm mb-6">
                أضف 4 صور على الأقل: من الأمام، الخلف، الجوانب، والشاشة مفتوحة
              </p>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-6">
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-2">اسحب الصور هنا أو</p>
                <label className="inline-block px-6 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                  اختر الصور
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      updateForm({ images: [...formData.images, ...files].slice(0, 8) });
                    }}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">حد أقصى 8 صور • PNG, JPG حتى 5MB</p>
              </div>

              {/* Uploaded Images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-4 gap-3 mb-6">
                  {formData.images.map((file, idx) => (
                    <div key={idx} className="relative aspect-square bg-gray-100 rounded-xl overflow-hidden">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`صورة ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => {
                          const newImages = [...formData.images];
                          newImages.splice(idx, 1);
                          updateForm({ images: newImages });
                        }}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-1 left-1 px-2 py-0.5 bg-blue-600 text-white text-xs rounded">
                          رئيسية
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Verification Photo */}
              <div className="p-4 bg-amber-50 rounded-xl">
                <h3 className="font-medium text-amber-800 mb-2">صورة التحقق من الملكية</h3>
                <p className="text-sm text-amber-700 mb-3">
                  صور الجهاز مع ورقة مكتوب عليها كود التحقق: <strong>XCH-{Date.now().toString(36).toUpperCase()}</strong>
                </p>
                <label className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg cursor-pointer hover:bg-amber-700 text-sm">
                  <Camera className="w-4 h-4 inline ml-1" />
                  رفع صورة التحقق
                  <input type="file" accept="image/*" className="hidden" />
                </label>
              </div>
            </div>
          )}

          {/* Step 6: Review */}
          {currentStep === 6 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-bold mb-6">مراجعة الإعلان</h2>

              {/* Title */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">عنوان الإعلان</label>
                <input
                  type="text"
                  value={formData.title || `${MOBILE_BRAND_AR[formData.brand as MobileBrand]} ${formData.model || formData.customModel} ${formData.storageGb}GB`}
                  onChange={(e) => updateForm({ title: e.target.value })}
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Description */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">وصف الجهاز</label>
                <textarea
                  rows={4}
                  value={formData.description}
                  onChange={(e) => updateForm({ description: e.target.value })}
                  placeholder="اكتب وصفاً تفصيلياً للجهاز..."
                  className="w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              {/* Summary */}
              <div className="p-4 bg-gray-50 rounded-xl space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-500">الماركة والموديل</span>
                  <span className="font-medium">{MOBILE_BRAND_AR[formData.brand as MobileBrand]} {formData.model || formData.customModel}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">السعة</span>
                  <span className="font-medium">{formData.storageGb} GB</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الحالة</span>
                  <span className={`font-medium px-2 py-0.5 rounded ${getConditionGradeColor(formData.conditionGrade as MobileConditionGrade)}`}>
                    {formData.conditionGrade}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">البطارية</span>
                  <span className="font-medium">{formData.batteryHealth}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الموقع</span>
                  <span className="font-medium">{formData.governorate}</span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-gray-700 font-medium">السعر</span>
                  <span className="text-xl font-bold text-blue-600">{formatMobilePrice(formData.priceEgp)}</span>
                </div>
              </div>

              {/* Platform Fee */}
              <div className="mt-6 p-4 bg-blue-50 rounded-xl text-sm text-blue-700">
                <p className="font-medium mb-1">عمولة المنصة عند البيع: 5%</p>
                <p>ستحصل على {formatMobilePrice(formData.priceEgp * 0.95)} بعد البيع</p>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8">
            {currentStep > 1 ? (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="flex items-center gap-2 px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                <ArrowRight className="w-5 h-5" />
                السابق
              </button>
            ) : (
              <div></div>
            )}

            {currentStep < 6 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                التالي
                <ArrowLeft className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 disabled:bg-gray-300"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
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
