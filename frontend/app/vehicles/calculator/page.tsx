"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Calculator,
  Car,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Minus,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  DollarSign,
  BarChart3,
  Target,
  Zap,
  Clock,
  MapPin,
  Gauge,
  Settings,
} from "lucide-react";
import {
  VehicleMake,
  VEHICLE_MAKE_AR,
  VehicleBodyType,
  BODY_TYPE_AR,
  VehicleCondition,
  CONDITION_AR,
  FuelType,
  FUEL_TYPE_AR,
  TransmissionType,
  TRANSMISSION_AR,
  Governorate,
  GOVERNORATE_AR,
  InspectionGrade,
  INSPECTION_GRADE_AR,
  PricingInput,
  PriceEstimate,
  formatVehiclePrice,
  POPULAR_MODELS,
} from "@/lib/api/vehicle-marketplace";
import { calculateDynamicPrice } from "@/lib/algorithms/vehicle-algorithms";

// Vehicle makes array
const MAKES = Object.keys(VEHICLE_MAKE_AR) as VehicleMake[];
const BODY_TYPES = Object.keys(BODY_TYPE_AR) as VehicleBodyType[];
const CONDITIONS = Object.keys(CONDITION_AR) as VehicleCondition[];
const FUEL_TYPES = Object.keys(FUEL_TYPE_AR) as FuelType[];
const TRANSMISSIONS = Object.keys(TRANSMISSION_AR) as TransmissionType[];
const GOVERNORATES = Object.keys(GOVERNORATE_AR) as Governorate[];
const INSPECTION_GRADES = ["A", "B", "C", "D", "F"] as InspectionGrade[];

// Years array (last 30 years)
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 30 }, (_, i) => currentYear - i);

export default function VehicleCalculatorPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PriceEstimate | null>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<PricingInput>>({
    make: undefined,
    model: "",
    year: currentYear,
    mileage: 0,
    condition: "EXCELLENT",
    fuelType: "PETROL",
    transmission: "AUTOMATIC",
    bodyType: "SEDAN",
    governorate: "CAIRO",
    hasAccidents: false,
    inspectionGrade: undefined,
  });

  // Get models for selected make
  const availableModels = formData.make ? POPULAR_MODELS[formData.make] || [] : [];

  // Handle form change
  const handleChange = (field: keyof PricingInput, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // Reset model when make changes
    if (field === "make") {
      setFormData((prev) => ({ ...prev, model: "" }));
    }
  };

  // Calculate price
  const handleCalculate = async () => {
    if (!formData.make || !formData.model || !formData.year || formData.mileage === undefined) {
      return;
    }

    setLoading(true);

    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const estimate = calculateDynamicPrice(formData as PricingInput);
      setResult(estimate);
      setStep(3);
    } catch (error) {
      console.error("Error calculating price:", error);
    } finally {
      setLoading(false);
    }
  };

  // Reset calculator
  const handleReset = () => {
    setStep(1);
    setResult(null);
    setFormData({
      make: undefined,
      model: "",
      year: currentYear,
      mileage: 0,
      condition: "EXCELLENT",
      fuelType: "PETROL",
      transmission: "AUTOMATIC",
      bodyType: "SEDAN",
      governorate: "CAIRO",
      hasAccidents: false,
      inspectionGrade: undefined,
    });
  };

  // Can proceed to next step
  const canProceed = () => {
    if (step === 1) {
      return formData.make && formData.model && formData.year;
    }
    if (step === 2) {
      return formData.mileage !== undefined && formData.condition && formData.governorate;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-amber-500 via-orange-500 to-amber-600 text-white">
        <div className="container mx-auto px-4 py-12">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition"
          >
            <ArrowLeft className="w-5 h-5" />
            العودة لسوق السيارات
          </Link>

          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center">
              <Calculator className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold">حاسبة سعر السيارة</h1>
              <p className="text-amber-100 mt-1">اعرف القيمة السوقية العادلة لسيارتك بالذكاء الاصطناعي</p>
            </div>
          </div>

          {/* Features */}
          <div className="flex flex-wrap gap-4 mt-8">
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Zap className="w-4 h-4" />
              <span className="text-sm">خوارزمية AI متقدمة</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <BarChart3 className="w-4 h-4" />
              <span className="text-sm">بيانات السوق المصري</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
              <Target className="w-4 h-4" />
              <span className="text-sm">دقة 95%+</span>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-4">
            {[
              { num: 1, title: "بيانات السيارة" },
              { num: 2, title: "الحالة والموقع" },
              { num: 3, title: "النتيجة" },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2 rounded-full transition ${
                    step === s.num
                      ? "bg-amber-500 text-white"
                      : step > s.num
                      ? "bg-green-500 text-white"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {step > s.num ? (
                    <CheckCircle className="w-5 h-5" />
                  ) : (
                    <span className="w-5 h-5 flex items-center justify-center text-sm font-bold">
                      {s.num}
                    </span>
                  )}
                  <span className="font-medium">{s.title}</span>
                </div>
                {i < 2 && (
                  <ChevronRight className="w-5 h-5 mx-2 text-gray-300" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Step 1: Vehicle Info */}
        {step === 1 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Car className="w-7 h-7 text-amber-500" />
                بيانات السيارة الأساسية
              </h2>

              <div className="space-y-6">
                {/* Make */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الماركة *
                  </label>
                  <select
                    value={formData.make || ""}
                    onChange={(e) => handleChange("make", e.target.value as VehicleMake)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    <option value="">اختر الماركة</option>
                    {MAKES.map((make) => (
                      <option key={make} value={make}>
                        {VEHICLE_MAKE_AR[make]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Model */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الموديل *
                  </label>
                  {availableModels.length > 0 ? (
                    <select
                      value={formData.model}
                      onChange={(e) => handleChange("model", e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">اختر الموديل</option>
                      {availableModels.map((model) => (
                        <option key={model} value={model}>
                          {model}
                        </option>
                      ))}
                      <option value="other">أخرى</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={formData.model}
                      onChange={(e) => handleChange("model", e.target.value)}
                      placeholder="أدخل اسم الموديل"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  )}
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سنة الصنع *
                  </label>
                  <select
                    value={formData.year}
                    onChange={(e) => handleChange("year", parseInt(e.target.value))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {YEARS.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Body Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع الهيكل
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {BODY_TYPES.slice(0, 6).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => handleChange("bodyType", type)}
                        className={`p-3 rounded-xl border-2 transition text-center ${
                          formData.bodyType === type
                            ? "border-amber-500 bg-amber-50 text-amber-700"
                            : "border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        <span className="text-2xl block mb-1">{BODY_TYPE_AR[type].icon}</span>
                        <span className="text-sm">{BODY_TYPE_AR[type].label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Fuel & Transmission */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الوقود
                    </label>
                    <select
                      value={formData.fuelType}
                      onChange={(e) => handleChange("fuelType", e.target.value as FuelType)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {FUEL_TYPES.map((fuel) => (
                        <option key={fuel} value={fuel}>
                          {FUEL_TYPE_AR[fuel]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ناقل الحركة
                    </label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => handleChange("transmission", e.target.value as TransmissionType)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {TRANSMISSIONS.map((trans) => (
                        <option key={trans} value={trans}>
                          {TRANSMISSION_AR[trans]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <div className="mt-8">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canProceed()}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  التالي
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Condition & Location */}
        {step === 2 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-3">
                <Settings className="w-7 h-7 text-amber-500" />
                الحالة والموقع
              </h2>

              <div className="space-y-6">
                {/* Mileage */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <Gauge className="w-4 h-4 inline ml-1" />
                    الكيلومترات *
                  </label>
                  <input
                    type="number"
                    value={formData.mileage || ""}
                    onChange={(e) => handleChange("mileage", parseInt(e.target.value) || 0)}
                    placeholder="مثال: 50000"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">أدخل عدد الكيلومترات المقطوعة</p>
                </div>

                {/* Condition */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة السيارة *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {CONDITIONS.map((cond) => (
                      <button
                        key={cond}
                        type="button"
                        onClick={() => handleChange("condition", cond)}
                        className={`p-4 rounded-xl border-2 transition text-right ${
                          formData.condition === cond
                            ? "border-amber-500 bg-amber-50"
                            : "border-gray-200 hover:border-amber-300"
                        }`}
                      >
                        <span className="font-bold block">{CONDITION_AR[cond].label}</span>
                        <span className="text-xs text-gray-500">{CONDITION_AR[cond].description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Governorate */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    <MapPin className="w-4 h-4 inline ml-1" />
                    المحافظة *
                  </label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => handleChange("governorate", e.target.value as Governorate)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  >
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>
                        {GOVERNORATE_AR[gov]}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Accidents */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    هل تعرضت لحوادث؟
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => handleChange("hasAccidents", false)}
                      className={`flex-1 p-4 rounded-xl border-2 transition ${
                        formData.hasAccidents === false
                          ? "border-green-500 bg-green-50 text-green-700"
                          : "border-gray-200"
                      }`}
                    >
                      <CheckCircle className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-bold">لا، بدون حوادث</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleChange("hasAccidents", true)}
                      className={`flex-1 p-4 rounded-xl border-2 transition ${
                        formData.hasAccidents === true
                          ? "border-red-500 bg-red-50 text-red-700"
                          : "border-gray-200"
                      }`}
                    >
                      <AlertCircle className="w-6 h-6 mx-auto mb-2" />
                      <span className="font-bold">نعم، بها حادث</span>
                    </button>
                  </div>
                </div>

                {/* Inspection Grade (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    درجة الفحص (اختياري)
                  </label>
                  <div className="flex gap-2">
                    {INSPECTION_GRADES.map((grade) => (
                      <button
                        key={grade}
                        type="button"
                        onClick={() =>
                          handleChange(
                            "inspectionGrade",
                            formData.inspectionGrade === grade ? undefined : grade
                          )
                        }
                        className={`flex-1 py-3 rounded-xl border-2 font-bold transition ${
                          formData.inspectionGrade === grade
                            ? INSPECTION_GRADE_AR[grade].color
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {grade}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    إذا كان لديك تقرير فحص معتمد، اختر الدرجة
                  </p>
                </div>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex gap-4">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition"
                >
                  السابق
                </button>
                <button
                  onClick={handleCalculate}
                  disabled={!canProceed() || loading}
                  className="flex-1 py-4 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-xl font-bold text-lg hover:from-amber-600 hover:to-orange-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      جاري الحساب...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      احسب السعر
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Results */}
        {step === 3 && result && (
          <div className="max-w-4xl mx-auto">
            {/* Main Result Card */}
            <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-3xl p-8 text-white mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl opacity-90">القيمة السوقية المقدرة</h2>
                  <div className="text-5xl font-bold mt-2">
                    {formatVehiclePrice(result.estimatedValue)}
                  </div>
                </div>
                <div className="text-center">
                  <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center mb-2">
                    <span className="text-4xl font-bold">{result.confidence}%</span>
                  </div>
                  <span className="text-sm opacity-90">نسبة الثقة</span>
                </div>
              </div>

              {/* Price Range */}
              <div className="bg-white/10 rounded-2xl p-4 mb-6">
                <div className="flex items-center justify-between text-sm opacity-80 mb-2">
                  <span>أقل سعر متوقع</span>
                  <span>أعلى سعر متوقع</span>
                </div>
                <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="absolute h-full bg-white rounded-full"
                    style={{
                      left: "25%",
                      width: "50%",
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 font-bold">
                  <span>{formatVehiclePrice(result.priceRange.min)}</span>
                  <span>{formatVehiclePrice(result.priceRange.max)}</span>
                </div>
              </div>

              {/* Recommendations */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <DollarSign className="w-6 h-6 mx-auto mb-2 opacity-80" />
                  <div className="text-sm opacity-80">سعر البيع المقترح</div>
                  <div className="text-xl font-bold">
                    {formatVehiclePrice(result.recommendedAskingPrice)}
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <Target className="w-6 h-6 mx-auto mb-2 opacity-80" />
                  <div className="text-sm opacity-80">أقل سعر مقبول</div>
                  <div className="text-xl font-bold">
                    {formatVehiclePrice(result.recommendedMinPrice)}
                  </div>
                </div>
                <div className="bg-white/10 rounded-xl p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-2 opacity-80" />
                  <div className="text-sm opacity-80">بيع سريع</div>
                  <div className="text-xl font-bold">
                    {formatVehiclePrice(result.quickSalePrice)}
                  </div>
                </div>
              </div>
            </div>

            {/* Details Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Market Analysis */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-500" />
                  تحليل السوق
                </h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">حالة الطلب</span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-bold ${
                        result.marketDemand === "VERY_HIGH" || result.marketDemand === "HIGH"
                          ? "bg-green-100 text-green-700"
                          : result.marketDemand === "MEDIUM"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {result.marketDemand === "VERY_HIGH"
                        ? "طلب عالي جداً"
                        : result.marketDemand === "HIGH"
                        ? "طلب عالي"
                        : result.marketDemand === "MEDIUM"
                        ? "طلب متوسط"
                        : "طلب منخفض"}
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">معدل الاستهلاك السنوي</span>
                    <span className="font-bold text-red-600 flex items-center gap-1">
                      <TrendingDown className="w-4 h-4" />
                      {(result.depreciationRate * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-gray-600">القيمة بعد سنة</span>
                    <span className="font-bold">
                      {formatVehiclePrice(result.estimatedValueNextYear)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-amber-500" />
                  تفصيل السعر
                </h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">السعر الأساسي</span>
                    <span className="font-bold">
                      {formatVehiclePrice(result.breakdown.basePrice)}
                    </span>
                  </div>

                  {result.breakdown.mileageAdjustment !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">تعديل الكيلومترات</span>
                      <span
                        className={`font-bold flex items-center gap-1 ${
                          result.breakdown.mileageAdjustment > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {result.breakdown.mileageAdjustment > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        {formatVehiclePrice(Math.abs(result.breakdown.mileageAdjustment))}
                      </span>
                    </div>
                  )}

                  {result.breakdown.conditionAdjustment !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">تعديل الحالة</span>
                      <span
                        className={`font-bold ${
                          result.breakdown.conditionAdjustment > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {result.breakdown.conditionAdjustment > 0 ? "+" : ""}
                        {formatVehiclePrice(result.breakdown.conditionAdjustment)}
                      </span>
                    </div>
                  )}

                  {result.breakdown.locationAdjustment !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">تعديل الموقع</span>
                      <span
                        className={`font-bold ${
                          result.breakdown.locationAdjustment > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {result.breakdown.locationAdjustment > 0 ? "+" : ""}
                        {formatVehiclePrice(result.breakdown.locationAdjustment)}
                      </span>
                    </div>
                  )}

                  {result.breakdown.marketAdjustment !== 0 && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">تعديل السوق</span>
                      <span
                        className={`font-bold ${
                          result.breakdown.marketAdjustment > 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {result.breakdown.marketAdjustment > 0 ? "+" : ""}
                        {formatVehiclePrice(result.breakdown.marketAdjustment)}
                      </span>
                    </div>
                  )}

                  <div className="border-t pt-3 flex items-center justify-between">
                    <span className="font-bold text-gray-800">الإجمالي</span>
                    <span className="font-bold text-xl text-amber-600">
                      {formatVehiclePrice(result.estimatedValue)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Insights */}
              {result.insights.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    ملاحظات مهمة
                  </h3>

                  <div className="grid md:grid-cols-2 gap-4">
                    {result.insights.map((insight, i) => (
                      <div
                        key={i}
                        className={`p-4 rounded-xl flex items-start gap-3 ${
                          insight.type === "POSITIVE"
                            ? "bg-green-50"
                            : insight.type === "NEGATIVE"
                            ? "bg-red-50"
                            : "bg-gray-50"
                        }`}
                      >
                        {insight.type === "POSITIVE" ? (
                          <TrendingUp className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        ) : insight.type === "NEGATIVE" ? (
                          <TrendingDown className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <Info className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
                        )}
                        <span
                          className={
                            insight.type === "POSITIVE"
                              ? "text-green-800"
                              : insight.type === "NEGATIVE"
                              ? "text-red-800"
                              : "text-gray-800"
                          }
                        >
                          {insight.messageAr}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Comparables */}
              {result.comparables.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:col-span-2">
                  <h3 className="font-bold text-lg text-gray-800 mb-4 flex items-center gap-2">
                    <Car className="w-5 h-5 text-amber-500" />
                    سيارات مشابهة في السوق
                  </h3>

                  <div className="grid md:grid-cols-3 gap-4">
                    {result.comparables.map((comp, i) => (
                      <Link
                        key={i}
                        href={comp.link}
                        className="p-4 bg-gray-50 rounded-xl hover:bg-amber-50 transition"
                      >
                        <div className="font-bold text-gray-800 mb-2 line-clamp-1">
                          {comp.title}
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-lg font-bold text-amber-600">
                            {formatVehiclePrice(comp.price)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {comp.similarity}% تشابه
                          </span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          منذ {comp.daysListed} يوم
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleReset}
                className="flex-1 py-4 border-2 border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                حساب سيارة أخرى
              </button>
              <Link
                href="/vehicles/sell"
                className="flex-1 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-600 hover:to-teal-600 transition flex items-center justify-center gap-2"
              >
                <Car className="w-5 h-5" />
                أضف سيارتك للبيع الآن
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
