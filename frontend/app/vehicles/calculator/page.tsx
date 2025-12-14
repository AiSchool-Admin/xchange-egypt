"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Calculator,
  Car,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Info,
  ChevronDown,
  Sparkles,
  BarChart3,
  PieChart,
  Percent,
  Calendar,
  Settings,
  RefreshCw,
  Check,
} from "lucide-react";
import {
  VEHICLE_MAKE_AR,
  BODY_TYPE_AR,
  CONDITION_AR,
  type VehicleMake,
  type VehicleBodyType,
  type VehicleCondition,
} from "@/lib/api/vehicle-marketplace";

// Year options
const YEARS = Array.from({ length: 35 }, (_, i) => 2025 - i);

// Base prices for different makes (in EGP)
const MAKE_BASE_PRICES: Partial<Record<VehicleMake, number>> = {
  toyota: 600000,
  honda: 550000,
  nissan: 500000,
  hyundai: 450000,
  kia: 420000,
  mercedes: 1500000,
  bmw: 1400000,
  audi: 1300000,
  volkswagen: 600000,
  chevrolet: 480000,
  ford: 520000,
  peugeot: 380000,
  renault: 350000,
  fiat: 320000,
  suzuki: 350000,
  mitsubishi: 450000,
  mazda: 520000,
  skoda: 450000,
  geely: 400000,
  chery: 380000,
  mg: 450000,
  byd: 600000,
  jetour: 550000,
  changan: 420000,
};

// Body type multipliers
const BODY_TYPE_MULTIPLIERS: Partial<Record<VehicleBodyType, number>> = {
  sedan: 1.0,
  suv: 1.25,
  hatchback: 0.9,
  coupe: 1.1,
  convertible: 1.3,
  wagon: 0.95,
  pickup: 1.15,
  van: 1.1,
  minivan: 1.05,
  crossover: 1.15,
};

// Condition multipliers
const CONDITION_MULTIPLIERS: Record<VehicleCondition, number> = {
  new: 1.0,
  excellent: 0.85,
  good: 0.7,
  fair: 0.55,
  poor: 0.4,
};

// Depreciation rate per year
const DEPRECIATION_RATE = 0.12; // 12% per year

// Loan calculations
interface LoanCalculation {
  monthlyPayment: number;
  totalPayment: number;
  totalInterest: number;
}

export default function VehicleCalculatorPage() {
  const [activeTab, setActiveTab] = useState<"valuation" | "loan" | "comparison">("valuation");

  // Valuation form
  const [make, setMake] = useState<VehicleMake | "">("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState<number>(2020);
  const [bodyType, setBodyType] = useState<VehicleBodyType | "">("");
  const [mileage, setMileage] = useState<number>(50000);
  const [condition, setCondition] = useState<VehicleCondition>("good");

  // Loan form
  const [vehiclePrice, setVehiclePrice] = useState<number>(500000);
  const [downPayment, setDownPayment] = useState<number>(100000);
  const [loanTerm, setLoanTerm] = useState<number>(60); // months
  const [interestRate, setInterestRate] = useState<number>(18); // annual %

  // Comparison
  const [compareVehicles, setCompareVehicles] = useState<
    { make: VehicleMake; model: string; year: number; price: number }[]
  >([]);

  // Calculate vehicle value
  const estimatedValue = useMemo(() => {
    if (!make || !bodyType) return null;

    const basePrice = MAKE_BASE_PRICES[make] || 500000;
    const bodyMultiplier = BODY_TYPE_MULTIPLIERS[bodyType] || 1.0;
    const conditionMultiplier = CONDITION_MULTIPLIERS[condition];

    // Calculate age depreciation
    const currentYear = new Date().getFullYear();
    const age = currentYear - year;
    const depreciationMultiplier = Math.pow(1 - DEPRECIATION_RATE, age);

    // Mileage adjustment (every 10k km above 50k reduces value by 1%)
    const mileageAdjustment = mileage > 50000 ? 1 - ((mileage - 50000) / 10000) * 0.01 : 1;

    const value =
      basePrice * bodyMultiplier * conditionMultiplier * depreciationMultiplier * mileageAdjustment;

    return {
      estimated: Math.round(value),
      low: Math.round(value * 0.9),
      high: Math.round(value * 1.1),
      marketAverage: Math.round(value * 1.02),
    };
  }, [make, bodyType, year, mileage, condition]);

  // Calculate loan
  const loanCalculation = useMemo((): LoanCalculation => {
    const principal = vehiclePrice - downPayment;
    const monthlyRate = interestRate / 100 / 12;
    const numPayments = loanTerm;

    const monthlyPayment =
      (principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments))) /
      (Math.pow(1 + monthlyRate, numPayments) - 1);

    const totalPayment = monthlyPayment * numPayments;
    const totalInterest = totalPayment - principal;

    return {
      monthlyPayment: Math.round(monthlyPayment),
      totalPayment: Math.round(totalPayment),
      totalInterest: Math.round(totalInterest),
    };
  }, [vehiclePrice, downPayment, loanTerm, interestRate]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("ar-EG").format(price) + " جنيه";
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-blue-600 to-indigo-700 text-white">
        <div className="max-w-5xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <Link
              href="/vehicles"
              className="flex items-center gap-2 text-white/80 hover:text-white"
            >
              <ArrowRight className="w-5 h-5" />
              <span>العودة للسوق</span>
            </Link>
          </div>

          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Calculator className="w-10 h-10" />
              <h1 className="text-3xl md:text-4xl font-bold">حاسبة السيارات</h1>
            </div>
            <p className="text-blue-100 text-lg">
              تقييم السيارات وحساب التمويل بدقة عالية
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setActiveTab("valuation")}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                activeTab === "valuation"
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Car className="w-5 h-5 inline ml-2" />
              تقييم السيارة
            </button>
            <button
              onClick={() => setActiveTab("loan")}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                activeTab === "loan"
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <Percent className="w-5 h-5 inline ml-2" />
              حاسبة التمويل
            </button>
            <button
              onClick={() => setActiveTab("comparison")}
              className={`px-6 py-3 rounded-xl font-medium transition-colors ${
                activeTab === "comparison"
                  ? "bg-white text-blue-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              <BarChart3 className="w-5 h-5 inline ml-2" />
              مقارنة الأسعار
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Valuation Tab */}
        {activeTab === "valuation" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Settings className="w-6 h-6 text-blue-600" />
                بيانات السيارة
              </h2>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الشركة المصنعة
                  </label>
                  <select
                    value={make}
                    onChange={(e) => setMake(e.target.value as VehicleMake)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">الموديل</label>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    placeholder="مثال: كامري"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      سنة الصنع
                    </label>
                    <select
                      value={year}
                      onChange={(e) => setYear(parseInt(e.target.value))}
                      className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {YEARS.map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      نوع الهيكل
                    </label>
                    <select
                      value={bodyType}
                      onChange={(e) => setBodyType(e.target.value as VehicleBodyType)}
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الكيلومترات: {mileage.toLocaleString()} كم
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="300000"
                    step="5000"
                    value={mileage}
                    onChange={(e) => setMileage(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>0 كم</span>
                    <span>300,000 كم</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">الحالة</label>
                  <div className="grid grid-cols-5 gap-2">
                    {Object.entries(CONDITION_AR).map(([key, value]) => (
                      <button
                        key={key}
                        onClick={() => setCondition(key as VehicleCondition)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-colors ${
                          condition === key
                            ? "bg-blue-600 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              {estimatedValue ? (
                <>
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-6 text-white">
                    <div className="flex items-center gap-2 mb-4">
                      <Sparkles className="w-6 h-6" />
                      <h3 className="text-lg font-bold">القيمة التقديرية</h3>
                    </div>
                    <p className="text-4xl font-bold mb-2">
                      {formatPrice(estimatedValue.estimated)}
                    </p>
                    <p className="text-blue-200 text-sm">
                      النطاق: {formatPrice(estimatedValue.low)} - {formatPrice(estimatedValue.high)}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">تحليل السعر</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span className="text-gray-600">متوسط السوق</span>
                        <span className="font-bold text-gray-900">
                          {formatPrice(estimatedValue.marketAverage)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <span className="text-green-700">سعر ممتاز للشراء</span>
                        <span className="font-bold text-green-700">
                          {"<"} {formatPrice(estimatedValue.low)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                        <span className="text-red-700">سعر مرتفع</span>
                        <span className="font-bold text-red-700">
                          {">"} {formatPrice(estimatedValue.high)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">عوامل التقييم</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">
                          الشركة: {make && VEHICLE_MAKE_AR[make]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">
                          العمر: {new Date().getFullYear() - year} سنة
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">
                          الحالة: {CONDITION_AR[condition]}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Check className="w-5 h-5 text-green-500" />
                        <span className="text-gray-600">
                          الكيلومترات: {mileage.toLocaleString()} كم
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                  <Calculator className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-900 mb-2">أدخل بيانات السيارة</h3>
                  <p className="text-gray-600">
                    اختر الشركة المصنعة ونوع الهيكل للحصول على تقييم تقريبي
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Loan Calculator Tab */}
        {activeTab === "loan" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Form */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-blue-600" />
                بيانات التمويل
              </h2>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سعر السيارة: {formatPrice(vehiclePrice)}
                  </label>
                  <input
                    type="range"
                    min="100000"
                    max="5000000"
                    step="50000"
                    value={vehiclePrice}
                    onChange={(e) => setVehiclePrice(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المقدم: {formatPrice(downPayment)} ({((downPayment / vehiclePrice) * 100).toFixed(0)}%)
                  </label>
                  <input
                    type="range"
                    min="0"
                    max={vehiclePrice * 0.5}
                    step="10000"
                    value={downPayment}
                    onChange={(e) => setDownPayment(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    مدة التمويل: {loanTerm} شهر ({(loanTerm / 12).toFixed(1)} سنة)
                  </label>
                  <input
                    type="range"
                    min="12"
                    max="84"
                    step="6"
                    value={loanTerm}
                    onChange={(e) => setLoanTerm(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>سنة</span>
                    <span>7 سنوات</span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    معدل الفائدة: {interestRate}% سنوياً
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="30"
                    step="0.5"
                    value={interestRate}
                    onChange={(e) => setInterestRate(parseFloat(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10%</span>
                    <span>30%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Results */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-6 h-6" />
                  <h3 className="text-lg font-bold">القسط الشهري</h3>
                </div>
                <p className="text-4xl font-bold mb-2">
                  {formatPrice(loanCalculation.monthlyPayment)}
                </p>
                <p className="text-green-200 text-sm">لمدة {loanTerm} شهر</p>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">ملخص التمويل</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">سعر السيارة</span>
                    <span className="font-bold text-gray-900">{formatPrice(vehiclePrice)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">المقدم</span>
                    <span className="font-bold text-green-600">- {formatPrice(downPayment)}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-600">مبلغ التمويل</span>
                    <span className="font-bold text-gray-900">
                      {formatPrice(vehiclePrice - downPayment)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <span className="text-red-700">إجمالي الفوائد</span>
                    <span className="font-bold text-red-700">
                      + {formatPrice(loanCalculation.totalInterest)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
                    <span className="text-blue-800 font-bold">إجمالي المدفوعات</span>
                    <span className="text-xl font-bold text-blue-800">
                      {formatPrice(loanCalculation.totalPayment + downPayment)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div className="text-sm text-amber-800">
                    <p className="font-medium mb-1">ملاحظة:</p>
                    <p>
                      هذه الحسابات تقريبية وقد تختلف حسب شروط البنك أو جهة التمويل. الأسعار الفعلية
                      قد تتضمن رسوم إضافية.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Comparison Tab */}
        {activeTab === "comparison" && (
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">مقارنة الأسعار</h3>
              <p className="text-gray-600 mb-6">
                قريباً - ستتمكن من مقارنة أسعار السيارات المختلفة
              </p>
              <Link
                href="/vehicles/listings"
                className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 inline-block"
              >
                تصفح السيارات
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
