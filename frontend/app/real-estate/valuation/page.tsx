'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  estimatePropertyValue,
  PropertyInput,
  PriceEstimate,
  PropertyType,
  PropertyCondition,
  PROPERTY_TYPE_AR,
  PROPERTY_CONDITION_AR,
  MARKET_DEMAND_AR,
} from '@/lib/api/real-estate-advanced';

// Egyptian governorates
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة',
  'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية',
  'الوادي الجديد', 'السويس', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد',
  'دمياط', 'الشرقية', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر',
  'قنا', 'شمال سيناء', 'سوهاج'
];

// Popular cities by governorate
const CITIES: Record<string, string[]> = {
  'القاهرة': ['مدينة نصر', 'المعادي', 'التجمع الخامس', 'مصر الجديدة', 'الرحاب', 'مدينتي', 'العاصمة الإدارية', 'الشروق', 'بدر', 'العبور'],
  'الجيزة': ['6 أكتوبر', 'الشيخ زايد', 'الهرم', 'فيصل', 'الدقي', 'المهندسين', 'حدائق الأهرام', 'الحوامدية'],
  'الإسكندرية': ['سموحة', 'جليم', 'سان ستيفانو', 'المنتزه', 'العصافرة', 'السيوف', 'بحري', 'العجمي', 'برج العرب'],
};

// Property types
const PROPERTY_TYPES: PropertyType[] = [
  'APARTMENT', 'VILLA', 'DUPLEX', 'PENTHOUSE', 'STUDIO',
  'CHALET', 'TOWNHOUSE', 'TWIN_HOUSE', 'LAND', 'COMMERCIAL',
  'OFFICE', 'RETAIL', 'WAREHOUSE', 'BUILDING'
];

// Property conditions
const PROPERTY_CONDITIONS: PropertyCondition[] = [
  'NEW', 'EXCELLENT', 'GOOD', 'FAIR', 'NEEDS_RENOVATION'
];

export default function PropertyValuationPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimate, setEstimate] = useState<PriceEstimate | null>(null);

  // Form state
  const [propertyType, setPropertyType] = useState<PropertyType>('APARTMENT');
  const [area, setArea] = useState('');
  const [governorate, setGovernorate] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [floor, setFloor] = useState('');
  const [totalFloors, setTotalFloors] = useState('');
  const [buildYear, setBuildYear] = useState('');
  const [condition, setCondition] = useState<PropertyCondition>('GOOD');

  // Features
  const [hasElevator, setHasElevator] = useState(false);
  const [hasParking, setHasParking] = useState(false);
  const [hasGarden, setHasGarden] = useState(false);
  const [hasSecurity, setHasSecurity] = useState(false);
  const [hasPool, setHasPool] = useState(false);
  const [hasGym, setHasGym] = useState(false);
  const [hasBalcony, setHasBalcony] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!area || !governorate) {
      setError('يرجى إدخال المساحة والمحافظة');
      return;
    }

    setLoading(true);
    setError('');
    setEstimate(null);

    try {
      const input: PropertyInput = {
        propertyType,
        area: parseFloat(area),
        governorate,
        city: city || undefined,
        district: district || undefined,
        bedrooms: bedrooms ? parseInt(bedrooms) : undefined,
        bathrooms: bathrooms ? parseInt(bathrooms) : undefined,
        floor: floor ? parseInt(floor) : undefined,
        totalFloors: totalFloors ? parseInt(totalFloors) : undefined,
        buildYear: buildYear ? parseInt(buildYear) : undefined,
        condition,
        hasElevator,
        hasParking,
        hasGarden,
        hasSecurity,
        hasPool,
        hasGym,
        hasBalcony,
      };

      const result = await estimatePropertyValue(input);
      setEstimate(result);
    } catch (err: any) {
      setError(err.response?.data?.message || 'حدث خطأ أثناء تقدير السعر');
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(2)} مليون جنيه`;
    }
    return new Intl.NumberFormat('ar-EG').format(price) + ' جنيه';
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600 bg-green-100';
    if (confidence >= 0.6) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return 'دقة عالية';
    if (confidence >= 0.6) return 'دقة متوسطة';
    return 'دقة منخفضة';
  };

  const getDemandColor = (demand: string) => {
    switch (demand) {
      case 'HIGH': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'LOW': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-emerald-200 text-sm mb-2">
                <Link href="/real-estate" className="hover:text-white">سوق العقارات</Link>
                <span>/</span>
                <span>تقييم العقار</span>
              </div>
              <h1 className="text-3xl md:text-4xl font-bold flex items-center gap-3">
                <span className="text-4xl">&#x1F4B0;</span>
                تقييم العقار - AVM
              </h1>
              <p className="text-emerald-100 mt-2">
                احصل على تقدير دقيق لقيمة عقارك باستخدام خوارزمية التقييم الآلي
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form Section */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-6">معلومات العقار</h2>

              {/* Basic Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    نوع العقار *
                  </label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {PROPERTY_TYPES.map((type) => (
                      <option key={type} value={type}>{PROPERTY_TYPE_AR[type]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المساحة (م&#178;) *
                  </label>
                  <input
                    type="number"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    placeholder="مثال: 150"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  />
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المحافظة *
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => { setGovernorate(e.target.value); setCity(''); }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    required
                  >
                    <option value="">اختر المحافظة</option>
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    المدينة
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    disabled={!governorate}
                  >
                    <option value="">اختر المدينة</option>
                    {(CITIES[governorate] || []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحي
                  </label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="مثال: المنطقة الأولى"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Rooms */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    غرف النوم
                  </label>
                  <input
                    type="number"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    placeholder="3"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الحمامات
                  </label>
                  <input
                    type="number"
                    value={bathrooms}
                    onChange={(e) => setBathrooms(e.target.value)}
                    placeholder="2"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    الدور
                  </label>
                  <input
                    type="number"
                    value={floor}
                    onChange={(e) => setFloor(e.target.value)}
                    placeholder="5"
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    إجمالي الأدوار
                  </label>
                  <input
                    type="number"
                    value={totalFloors}
                    onChange={(e) => setTotalFloors(e.target.value)}
                    placeholder="10"
                    min="1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Condition & Year */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    حالة العقار
                  </label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value as PropertyCondition)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  >
                    {PROPERTY_CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>{PROPERTY_CONDITION_AR[cond]}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    سنة البناء
                  </label>
                  <input
                    type="number"
                    value={buildYear}
                    onChange={(e) => setBuildYear(e.target.value)}
                    placeholder="2020"
                    min="1950"
                    max={new Date().getFullYear()}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Features */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  المميزات
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { key: 'hasElevator', label: 'أسانسير', state: hasElevator, setState: setHasElevator },
                    { key: 'hasParking', label: 'جراج', state: hasParking, setState: setHasParking },
                    { key: 'hasGarden', label: 'حديقة', state: hasGarden, setState: setHasGarden },
                    { key: 'hasSecurity', label: 'أمن', state: hasSecurity, setState: setHasSecurity },
                    { key: 'hasPool', label: 'حمام سباحة', state: hasPool, setState: setHasPool },
                    { key: 'hasGym', label: 'جيم', state: hasGym, setState: setHasGym },
                    { key: 'hasBalcony', label: 'بلكونة', state: hasBalcony, setState: setHasBalcony },
                  ].map((feature) => (
                    <label
                      key={feature.key}
                      className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                        feature.state
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={feature.state}
                        onChange={(e) => feature.setState(e.target.checked)}
                        className="sr-only"
                      />
                      <span className={`w-4 h-4 border-2 rounded flex items-center justify-center ${
                        feature.state ? 'border-emerald-500 bg-emerald-500' : 'border-gray-300'
                      }`}>
                        {feature.state && <span className="text-white text-xs">&#10003;</span>}
                      </span>
                      <span className="text-sm">{feature.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                  <p className="text-red-600">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <span className="animate-spin">&#9696;</span>
                    جاري التقييم...
                  </>
                ) : (
                  <>
                    <span>&#x1F4B0;</span>
                    قيّم العقار
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Section */}
          <div className="lg:col-span-1">
            {estimate ? (
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-4">
                <h2 className="text-xl font-bold text-gray-800 mb-6">نتيجة التقييم</h2>

                {/* Main Price */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl p-6 text-white mb-6">
                  <p className="text-emerald-100 text-sm mb-1">السعر التقديري</p>
                  <p className="text-3xl font-bold">{formatPrice(estimate.estimatedPrice)}</p>
                  <p className="text-emerald-100 text-sm mt-2">
                    {formatPrice(estimate.pricePerMeter)} / م&#178;
                  </p>
                </div>

                {/* Price Range */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 mb-2">نطاق السعر</p>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-800 font-medium">{formatPrice(estimate.priceRange.min)}</span>
                    <span className="text-gray-400">-</span>
                    <span className="text-gray-800 font-medium">{formatPrice(estimate.priceRange.max)}</span>
                  </div>
                </div>

                {/* Confidence & Demand */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className={`rounded-lg p-3 text-center ${getConfidenceColor(estimate.confidence)}`}>
                    <p className="text-xs mb-1">الدقة</p>
                    <p className="font-bold">{getConfidenceText(estimate.confidence)}</p>
                    <p className="text-xs">{Math.round(estimate.confidence * 100)}%</p>
                  </div>
                  <div className={`rounded-lg p-3 text-center ${getDemandColor(estimate.marketDemand)}`}>
                    <p className="text-xs mb-1">الطلب</p>
                    <p className="font-bold">{MARKET_DEMAND_AR[estimate.marketDemand]}</p>
                  </div>
                </div>

                {/* Breakdown */}
                <div className="border-t pt-4">
                  <h3 className="font-bold text-gray-800 mb-3">تفاصيل التقييم</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">السعر الأساسي</span>
                      <span className="font-medium">{formatPrice(estimate.breakdown.basePrice)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تعديل الموقع</span>
                      <span className={`font-medium ${estimate.breakdown.locationAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {estimate.breakdown.locationAdjustment >= 0 ? '+' : ''}{formatPrice(estimate.breakdown.locationAdjustment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تعديل العمر</span>
                      <span className={`font-medium ${estimate.breakdown.ageAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {estimate.breakdown.ageAdjustment >= 0 ? '+' : ''}{formatPrice(estimate.breakdown.ageAdjustment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تعديل الحالة</span>
                      <span className={`font-medium ${estimate.breakdown.conditionAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {estimate.breakdown.conditionAdjustment >= 0 ? '+' : ''}{formatPrice(estimate.breakdown.conditionAdjustment)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">تعديل المميزات</span>
                      <span className={`font-medium ${estimate.breakdown.featuresAdjustment >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {estimate.breakdown.featuresAdjustment >= 0 ? '+' : ''}{formatPrice(estimate.breakdown.featuresAdjustment)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Comparables */}
                {estimate.comparables && estimate.comparables.length > 0 && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-bold text-gray-800 mb-3">عقارات مشابهة ({estimate.comparables.length})</h3>
                    <div className="space-y-2">
                      {estimate.comparables.slice(0, 3).map((comp, idx) => (
                        <div key={idx} className="bg-gray-50 rounded-lg p-3 text-sm">
                          <div className="flex justify-between mb-1">
                            <span className="text-gray-600">{comp.area} م&#178;</span>
                            <span className="font-medium">{formatPrice(comp.price)}</span>
                          </div>
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{comp.governorate}</span>
                            <span>تشابه {Math.round(comp.similarity * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <div className="border-t pt-4 mt-4">
                  <Link
                    href="/properties/create"
                    className="block w-full bg-emerald-600 text-white py-3 rounded-lg font-bold text-center hover:bg-emerald-700 transition-colors"
                  >
                    أضف عقارك بهذا السعر
                  </Link>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="text-center py-8">
                  <span className="text-6xl block mb-4">&#x1F3E0;</span>
                  <h3 className="text-lg font-bold text-gray-800 mb-2">تقييم عقارك</h3>
                  <p className="text-gray-600 text-sm">
                    أدخل تفاصيل عقارك للحصول على تقدير دقيق لقيمته السوقية
                  </p>
                </div>

                <div className="border-t pt-4 mt-4">
                  <h4 className="font-bold text-gray-800 mb-3">مميزات التقييم</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">&#10003;</span>
                      تقييم فوري ودقيق
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">&#10003;</span>
                      مقارنة مع عقارات مشابهة
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">&#10003;</span>
                      تحليل الموقع والمميزات
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-emerald-500">&#10003;</span>
                      اتجاهات السوق
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
