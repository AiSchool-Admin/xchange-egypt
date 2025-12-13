'use client';

/**
 * Car Price Calculator Page
 * حاسبة أسعار السيارات
 */

import { useState } from 'react';
import Link from 'next/link';

// Price Reference Data
const carPriceData: Record<string, Record<string, Record<number, { min: number; max: number; avg: number }>>> = {
  'Toyota': {
    'Corolla': {
      2024: { min: 850000, max: 1050000, avg: 950000 },
      2023: { min: 780000, max: 950000, avg: 865000 },
      2022: { min: 700000, max: 850000, avg: 775000 },
      2021: { min: 620000, max: 750000, avg: 685000 },
      2020: { min: 550000, max: 680000, avg: 615000 },
    },
    'Camry': {
      2024: { min: 1200000, max: 1500000, avg: 1350000 },
      2023: { min: 1050000, max: 1350000, avg: 1200000 },
      2022: { min: 900000, max: 1150000, avg: 1025000 },
      2021: { min: 800000, max: 1000000, avg: 900000 },
      2020: { min: 720000, max: 880000, avg: 800000 },
    },
    'RAV4': {
      2024: { min: 1400000, max: 1800000, avg: 1600000 },
      2023: { min: 1250000, max: 1600000, avg: 1425000 },
      2022: { min: 1100000, max: 1400000, avg: 1250000 },
      2021: { min: 950000, max: 1250000, avg: 1100000 },
      2020: { min: 850000, max: 1100000, avg: 975000 },
    },
  },
  'Hyundai': {
    'Elantra': {
      2024: { min: 750000, max: 950000, avg: 850000 },
      2023: { min: 680000, max: 850000, avg: 765000 },
      2022: { min: 600000, max: 750000, avg: 675000 },
      2021: { min: 530000, max: 670000, avg: 600000 },
      2020: { min: 470000, max: 600000, avg: 535000 },
    },
    'Tucson': {
      2024: { min: 1100000, max: 1400000, avg: 1250000 },
      2023: { min: 980000, max: 1250000, avg: 1115000 },
      2022: { min: 850000, max: 1100000, avg: 975000 },
      2021: { min: 750000, max: 950000, avg: 850000 },
      2020: { min: 670000, max: 850000, avg: 760000 },
    },
    'Accent': {
      2024: { min: 520000, max: 680000, avg: 600000 },
      2023: { min: 470000, max: 620000, avg: 545000 },
      2022: { min: 420000, max: 560000, avg: 490000 },
      2021: { min: 380000, max: 500000, avg: 440000 },
      2020: { min: 340000, max: 450000, avg: 395000 },
    },
  },
  'Kia': {
    'Cerato': {
      2024: { min: 700000, max: 900000, avg: 800000 },
      2023: { min: 630000, max: 800000, avg: 715000 },
      2022: { min: 560000, max: 720000, avg: 640000 },
      2021: { min: 500000, max: 650000, avg: 575000 },
      2020: { min: 450000, max: 580000, avg: 515000 },
    },
    'Sportage': {
      2024: { min: 1050000, max: 1350000, avg: 1200000 },
      2023: { min: 920000, max: 1200000, avg: 1060000 },
      2022: { min: 800000, max: 1050000, avg: 925000 },
      2021: { min: 700000, max: 920000, avg: 810000 },
      2020: { min: 620000, max: 820000, avg: 720000 },
    },
  },
  'BMW': {
    '320i': {
      2024: { min: 1800000, max: 2200000, avg: 2000000 },
      2023: { min: 1600000, max: 1950000, avg: 1775000 },
      2022: { min: 1400000, max: 1700000, avg: 1550000 },
      2021: { min: 1200000, max: 1500000, avg: 1350000 },
      2020: { min: 1050000, max: 1300000, avg: 1175000 },
    },
    'X3': {
      2024: { min: 2200000, max: 2800000, avg: 2500000 },
      2023: { min: 1950000, max: 2500000, avg: 2225000 },
      2022: { min: 1700000, max: 2200000, avg: 1950000 },
      2021: { min: 1500000, max: 1900000, avg: 1700000 },
      2020: { min: 1300000, max: 1700000, avg: 1500000 },
    },
  },
  'Mercedes-Benz': {
    'C200': {
      2024: { min: 2000000, max: 2500000, avg: 2250000 },
      2023: { min: 1750000, max: 2200000, avg: 1975000 },
      2022: { min: 1500000, max: 1900000, avg: 1700000 },
      2021: { min: 1300000, max: 1650000, avg: 1475000 },
      2020: { min: 1150000, max: 1450000, avg: 1300000 },
    },
    'E200': {
      2024: { min: 2800000, max: 3500000, avg: 3150000 },
      2023: { min: 2450000, max: 3100000, avg: 2775000 },
      2022: { min: 2100000, max: 2700000, avg: 2400000 },
      2021: { min: 1850000, max: 2350000, avg: 2100000 },
      2020: { min: 1600000, max: 2050000, avg: 1825000 },
    },
  },
  'Nissan': {
    'Sentra': {
      2024: { min: 680000, max: 880000, avg: 780000 },
      2023: { min: 610000, max: 780000, avg: 695000 },
      2022: { min: 540000, max: 700000, avg: 620000 },
      2021: { min: 480000, max: 620000, avg: 550000 },
      2020: { min: 430000, max: 560000, avg: 495000 },
    },
    'Sunny': {
      2024: { min: 520000, max: 680000, avg: 600000 },
      2023: { min: 470000, max: 610000, avg: 540000 },
      2022: { min: 420000, max: 550000, avg: 485000 },
      2021: { min: 380000, max: 500000, avg: 440000 },
      2020: { min: 340000, max: 450000, avg: 395000 },
    },
  },
};

// Condition adjustment factors
const conditionFactors: Record<string, { factor: number; label: string; description: string }> = {
  'LIKE_NEW': { factor: 1.05, label: 'كالجديدة', description: 'لا توجد أي خدوش أو عيوب' },
  'EXCELLENT': { factor: 1.0, label: 'ممتازة', description: 'خدوش طفيفة جداً' },
  'GOOD': { factor: 0.92, label: 'جيدة', description: 'خدوش واضحة مع حالة ميكانيكية جيدة' },
  'FAIR': { factor: 0.82, label: 'مقبولة', description: 'تحتاج بعض الإصلاحات' },
  'POOR': { factor: 0.65, label: 'ضعيفة', description: 'تحتاج إصلاحات كثيرة' },
};

// Mileage adjustment (per 10,000 km)
const getMileageAdjustment = (mileage: number, year: number) => {
  const currentYear = new Date().getFullYear();
  const age = currentYear - year;
  const expectedMileage = age * 15000; // 15,000 km per year expected
  const mileageDiff = mileage - expectedMileage;
  // -1% for every 10,000 km above expected, +0.5% for every 10,000 km below
  const adjustment = mileageDiff > 0
    ? -(mileageDiff / 10000) * 0.01
    : Math.abs(mileageDiff / 10000) * 0.005;
  return Math.max(-0.15, Math.min(0.05, adjustment)); // Cap between -15% and +5%
};

export default function CarCalculatorPage() {
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [condition, setCondition] = useState('EXCELLENT');
  const [hasAccidents, setHasAccidents] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [calculatedPrice, setCalculatedPrice] = useState<{
    min: number;
    max: number;
    avg: number;
    adjustments: { label: string; value: string; amount: number }[];
  } | null>(null);

  const makes = Object.keys(carPriceData);
  const models = make ? Object.keys(carPriceData[make] || {}) : [];
  const years = make && model ? Object.keys(carPriceData[make]?.[model] || {}).map(Number) : [];

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  const calculatePrice = () => {
    if (!make || !model || !year || !mileage) return;

    const basePrice = carPriceData[make]?.[model]?.[parseInt(year)];
    if (!basePrice) {
      alert('لا تتوفر بيانات أسعار لهذه السيارة');
      return;
    }

    const adjustments: { label: string; value: string; amount: number }[] = [];
    let totalAdjustment = 1;

    // Condition adjustment
    const conditionInfo = conditionFactors[condition];
    const conditionAdjustment = conditionInfo.factor - 1;
    if (conditionAdjustment !== 0) {
      adjustments.push({
        label: 'حالة السيارة',
        value: conditionInfo.label,
        amount: conditionAdjustment * 100,
      });
      totalAdjustment *= conditionInfo.factor;
    }

    // Mileage adjustment
    const mileageAdj = getMileageAdjustment(parseInt(mileage), parseInt(year));
    if (mileageAdj !== 0) {
      adjustments.push({
        label: 'المسافة المقطوعة',
        value: `${formatPrice(parseInt(mileage))} كم`,
        amount: mileageAdj * 100,
      });
      totalAdjustment *= (1 + mileageAdj);
    }

    // Accidents adjustment
    if (hasAccidents) {
      adjustments.push({
        label: 'حوادث سابقة',
        value: 'نعم',
        amount: -10,
      });
      totalAdjustment *= 0.9;
    }

    setCalculatedPrice({
      min: basePrice.min * totalAdjustment,
      max: basePrice.max * totalAdjustment,
      avg: basePrice.avg * totalAdjustment,
      adjustments,
    });
    setShowResults(true);
  };

  const resetCalculator = () => {
    setMake('');
    setModel('');
    setYear('');
    setMileage('');
    setCondition('EXCELLENT');
    setHasAccidents(false);
    setShowResults(false);
    setCalculatedPrice(null);
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-green-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              <h1 className="text-4xl font-bold">حاسبة أسعار السيارات</h1>
            </div>
            <p className="text-xl text-green-100 max-w-2xl mx-auto">
              احسب القيمة السوقية العادلة لسيارتك بناءً على بيانات السوق المصري الفعلية
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Calculator Form */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6">بيانات السيارة</h2>

            {/* Make */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">الماركة *</label>
              <select
                value={make}
                onChange={(e) => {
                  setMake(e.target.value);
                  setModel('');
                  setYear('');
                  setShowResults(false);
                }}
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              >
                <option value="">اختر الماركة</option>
                {makes.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Model */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">الموديل *</label>
              <select
                value={model}
                onChange={(e) => {
                  setModel(e.target.value);
                  setYear('');
                  setShowResults(false);
                }}
                disabled={!make}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
              >
                <option value="">اختر الموديل</option>
                {models.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            {/* Year */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">سنة الصنع *</label>
              <select
                value={year}
                onChange={(e) => {
                  setYear(e.target.value);
                  setShowResults(false);
                }}
                disabled={!model}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 disabled:bg-gray-100"
              >
                <option value="">اختر السنة</option>
                {years.sort((a, b) => b - a).map(y => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>

            {/* Mileage */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">المسافة المقطوعة (كم) *</label>
              <input
                type="number"
                value={mileage}
                onChange={(e) => {
                  setMileage(e.target.value);
                  setShowResults(false);
                }}
                placeholder="مثال: 50000"
                className="w-full border border-gray-300 rounded-lg px-4 py-3"
              />
            </div>

            {/* Condition */}
            <div className="mb-5">
              <label className="block text-sm font-medium text-gray-700 mb-2">حالة السيارة</label>
              <div className="space-y-2">
                {Object.entries(conditionFactors).map(([key, info]) => (
                  <label
                    key={key}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      condition === key ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="condition"
                      value={key}
                      checked={condition === key}
                      onChange={(e) => {
                        setCondition(e.target.value);
                        setShowResults(false);
                      }}
                      className="text-green-600"
                    />
                    <div>
                      <span className="font-medium">{info.label}</span>
                      <p className="text-xs text-gray-500">{info.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Accidents */}
            <div className="mb-6">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={hasAccidents}
                  onChange={(e) => {
                    setHasAccidents(e.target.checked);
                    setShowResults(false);
                  }}
                  className="w-5 h-5 text-green-600 rounded"
                />
                <div>
                  <span className="font-medium">السيارة تعرضت لحوادث سابقة</span>
                  <p className="text-xs text-gray-500">هذا يؤثر على قيمة السيارة بنسبة -10%</p>
                </div>
              </label>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={calculatePrice}
                disabled={!make || !model || !year || !mileage}
                className="flex-1 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                احسب السعر
              </button>
              <button
                onClick={resetCalculator}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                إعادة
              </button>
            </div>
          </div>

          {/* Results */}
          <div>
            {showResults && calculatedPrice ? (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-6">نتيجة التقييم</h2>

                {/* Car Info */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <p className="text-sm text-gray-600 mb-1">السيارة</p>
                  <p className="text-xl font-bold">{make} {model} {year}</p>
                </div>

                {/* Price Range */}
                <div className="text-center mb-6">
                  <p className="text-sm text-gray-600 mb-2">القيمة السوقية المقدرة</p>
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {formatPrice(calculatedPrice.avg)} جنيه
                  </div>
                  <div className="text-sm text-gray-500">
                    النطاق: {formatPrice(calculatedPrice.min)} - {formatPrice(calculatedPrice.max)} جنيه
                  </div>
                </div>

                {/* Price Range Visualization */}
                <div className="mb-6">
                  <div className="relative h-8 bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full">
                    <div
                      className="absolute top-0 bottom-0 w-1 bg-white shadow-lg rounded"
                      style={{
                        left: `${((calculatedPrice.avg - calculatedPrice.min) / (calculatedPrice.max - calculatedPrice.min)) * 100}%`,
                        transform: 'translateX(-50%)',
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>الأدنى</span>
                    <span>المتوسط</span>
                    <span>الأعلى</span>
                  </div>
                </div>

                {/* Adjustments */}
                {calculatedPrice.adjustments.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-medium mb-3">عوامل التعديل</h3>
                    <div className="space-y-2">
                      {calculatedPrice.adjustments.map((adj, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <div>
                            <span className="text-gray-600">{adj.label}:</span>
                            <span className="mr-2">{adj.value}</span>
                          </div>
                          <span className={adj.amount >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {adj.amount >= 0 ? '+' : ''}{adj.amount.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fees Info */}
                <div className="bg-blue-50 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-blue-800 mb-2">عند البيع عبر المنصة</h3>
                  <div className="space-y-1 text-sm text-blue-700">
                    <div className="flex justify-between">
                      <span>عمولة البائع (1.5%)</span>
                      <span>{formatPrice(calculatedPrice.avg * 0.015)} جنيه</span>
                    </div>
                    <div className="flex justify-between">
                      <span>صافي البائع</span>
                      <span className="font-medium">{formatPrice(calculatedPrice.avg * 0.985)} جنيه</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="space-y-3">
                  <Link
                    href="/cars/sell"
                    className="block w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium text-center"
                  >
                    بيع سيارتك الآن
                  </Link>
                  <Link
                    href="/cars"
                    className="block w-full py-3 border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-medium text-center"
                  >
                    تصفح السيارات المعروضة
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-600 mb-2">أدخل بيانات سيارتك</h3>
                  <p className="text-gray-500 text-sm">
                    ستظهر نتيجة التقييم هنا بعد إدخال البيانات المطلوبة
                  </p>
                </div>

                {/* Tips */}
                <div className="border-t pt-6 mt-6">
                  <h3 className="font-medium mb-4">نصائح للحصول على أفضل سعر</h3>
                  <ul className="space-y-3 text-sm text-gray-600">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>احصل على فحص معتمد من مراكز الفحص المعتمدة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>وفر جميع مستندات الصيانة والفواتير</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>التقط صوراً واضحة وعالية الجودة</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>كن صادقاً في وصف حالة السيارة</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Market Insights */}
            <div className="bg-white rounded-xl shadow-sm p-6 mt-6">
              <h3 className="font-medium mb-4">رؤى السوق</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">+5.2%</div>
                  <p className="text-sm text-gray-600">ارتفاع أسعار السيارات اليابانية</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">-3.1%</div>
                  <p className="text-sm text-gray-600">انخفاض السيارات الأوروبية</p>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">15,000</div>
                  <p className="text-sm text-gray-600">متوسط الكيلومترات السنوية</p>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">7 أيام</div>
                  <p className="text-sm text-gray-600">متوسط وقت البيع</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Popular Cars Table */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8">
          <h2 className="text-xl font-bold mb-6">أسعار السيارات الأكثر طلباً</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-right py-3 px-4 font-medium">السيارة</th>
                  <th className="text-center py-3 px-4 font-medium">2024</th>
                  <th className="text-center py-3 px-4 font-medium">2023</th>
                  <th className="text-center py-3 px-4 font-medium">2022</th>
                  <th className="text-center py-3 px-4 font-medium">2021</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { make: 'Toyota', model: 'Corolla' },
                  { make: 'Hyundai', model: 'Elantra' },
                  { make: 'Kia', model: 'Cerato' },
                  { make: 'Nissan', model: 'Sentra' },
                  { make: 'Toyota', model: 'Camry' },
                ].map((car, idx) => (
                  <tr key={idx} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{car.make} {car.model}</td>
                    {[2024, 2023, 2022, 2021].map(year => {
                      const price = carPriceData[car.make]?.[car.model]?.[year]?.avg;
                      return (
                        <td key={year} className="text-center py-3 px-4 text-sm">
                          {price ? `${formatPrice(price)} جنيه` : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-500 mt-4 text-center">
            * الأسعار تقريبية وتعتمد على حالة السيارة والمسافة المقطوعة - آخر تحديث: ديسمبر 2024
          </p>
        </div>
      </div>
    </div>
  );
}
