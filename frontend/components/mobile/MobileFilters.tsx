'use client';

import { useState, useEffect } from 'react';
import { ChevronDown, X, Shield, RefreshCw, Battery } from 'lucide-react';

interface FiltersProps {
  filters: {
    brand: string;
    model: string;
    minPrice: string;
    maxPrice: string;
    condition: string;
    governorate: string;
    acceptsBarter: boolean;
    imeiVerified: boolean;
    sort: string;
  };
  onFilterChange: (key: string, value: any) => void;
}

const BRANDS = [
  { value: 'APPLE', label: 'Apple' },
  { value: 'SAMSUNG', label: 'Samsung' },
  { value: 'XIAOMI', label: 'Xiaomi' },
  { value: 'OPPO', label: 'OPPO' },
  { value: 'VIVO', label: 'Vivo' },
  { value: 'REALME', label: 'Realme' },
  { value: 'HUAWEI', label: 'Huawei' },
  { value: 'HONOR', label: 'Honor' },
  { value: 'INFINIX', label: 'Infinix' },
  { value: 'TECNO', label: 'Tecno' },
  { value: 'NOKIA', label: 'Nokia' },
  { value: 'MOTOROLA', label: 'Motorola' },
  { value: 'GOOGLE', label: 'Google' },
  { value: 'ONEPLUS', label: 'OnePlus' },
];

const CONDITIONS = [
  { value: 'A', label: 'ممتاز (A)', description: 'كالجديد تماماً' },
  { value: 'B', label: 'جيد جداً (B)', description: 'استخدام خفيف' },
  { value: 'C', label: 'جيد (C)', description: 'علامات استخدام واضحة' },
  { value: 'D', label: 'مقبول (D)', description: 'يحتاج صيانة بسيطة' },
];

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'القليوبية', 'الشرقية',
  'الدقهلية', 'الغربية', 'المنوفية', 'البحيرة', 'كفر الشيخ',
  'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'الفيوم',
  'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا',
  'الأقصر', 'أسوان', 'البحر الأحمر', 'الوادي الجديد', 'مطروح',
  'شمال سيناء', 'جنوب سيناء'
];

const PRICE_RANGES = [
  { min: 0, max: 5000, label: 'أقل من 5,000 ج.م' },
  { min: 5000, max: 10000, label: '5,000 - 10,000 ج.م' },
  { min: 10000, max: 20000, label: '10,000 - 20,000 ج.م' },
  { min: 20000, max: 30000, label: '20,000 - 30,000 ج.م' },
  { min: 30000, max: 50000, label: '30,000 - 50,000 ج.م' },
  { min: 50000, max: 100000, label: '50,000 - 100,000 ج.م' },
  { min: 100000, max: 0, label: 'أكثر من 100,000 ج.م' },
];

export default function MobileFilters({ filters, onFilterChange }: FiltersProps) {
  const [models, setModels] = useState<string[]>([]);
  const [expandedSections, setExpandedSections] = useState({
    brand: true,
    price: true,
    condition: true,
    location: true,
    features: true
  });

  useEffect(() => {
    if (filters.brand) {
      fetchModels(filters.brand);
    } else {
      setModels([]);
    }
  }, [filters.brand]);

  const fetchModels = async (brand: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/mobiles/brands/${brand}/models`);
      const data = await response.json();
      if (data.success) {
        setModels(data.data);
      }
    } catch (error) {
      console.error('Error fetching models:', error);
    }
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section as keyof typeof prev]
    }));
  };

  const clearFilters = () => {
    onFilterChange('brand', '');
    onFilterChange('model', '');
    onFilterChange('minPrice', '');
    onFilterChange('maxPrice', '');
    onFilterChange('condition', '');
    onFilterChange('governorate', '');
    onFilterChange('acceptsBarter', false);
    onFilterChange('imeiVerified', false);
  };

  const activeFiltersCount = [
    filters.brand,
    filters.model,
    filters.minPrice || filters.maxPrice,
    filters.condition,
    filters.governorate,
    filters.acceptsBarter,
    filters.imeiVerified
  ].filter(Boolean).length;

  return (
    <div className="bg-white rounded-xl shadow-sm p-4 sticky top-24">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-4 border-b">
        <h3 className="font-bold text-lg">الفلاتر</h3>
        {activeFiltersCount > 0 && (
          <button
            onClick={clearFilters}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            مسح الكل ({activeFiltersCount})
          </button>
        )}
      </div>

      {/* Brand Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full py-2 font-medium"
        >
          <span>العلامة التجارية</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.brand ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.brand && (
          <div className="mt-2 space-y-1 max-h-48 overflow-y-auto">
            {BRANDS.map(brand => (
              <label
                key={brand.value}
                className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="brand"
                  value={brand.value}
                  checked={filters.brand === brand.value}
                  onChange={(e) => {
                    onFilterChange('brand', e.target.value);
                    onFilterChange('model', '');
                  }}
                  className="w-4 h-4 text-indigo-600"
                />
                <span>{brand.label}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Model Filter - Shows only when brand is selected */}
      {filters.brand && models.length > 0 && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">الموديل</label>
          <select
            value={filters.model}
            onChange={(e) => onFilterChange('model', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2"
          >
            <option value="">كل الموديلات</option>
            {models.map(model => (
              <option key={model} value={model}>{model}</option>
            ))}
          </select>
        </div>
      )}

      {/* Price Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full py-2 font-medium"
        >
          <span>السعر</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.price ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.price && (
          <div className="mt-2 space-y-3">
            {/* Quick Select */}
            <div className="space-y-1">
              {PRICE_RANGES.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    onFilterChange('minPrice', range.min.toString());
                    onFilterChange('maxPrice', range.max > 0 ? range.max.toString() : '');
                  }}
                  className={`block w-full text-right text-sm p-2 rounded-lg transition-colors ${
                    filters.minPrice === range.min.toString() &&
                    (filters.maxPrice === range.max.toString() || (!filters.maxPrice && range.max === 0))
                      ? 'bg-indigo-100 text-indigo-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            {/* Custom Range */}
            <div className="flex gap-2 items-center pt-2 border-t">
              <input
                type="number"
                placeholder="من"
                value={filters.minPrice}
                onChange={(e) => onFilterChange('minPrice', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
              <span className="text-gray-400">-</span>
              <input
                type="number"
                placeholder="إلى"
                value={filters.maxPrice}
                onChange={(e) => onFilterChange('maxPrice', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* Condition Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('condition')}
          className="flex items-center justify-between w-full py-2 font-medium"
        >
          <span>الحالة</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.condition ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.condition && (
          <div className="mt-2 space-y-1">
            {CONDITIONS.map(condition => (
              <label
                key={condition.value}
                className="flex items-start gap-2 p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="radio"
                  name="condition"
                  value={condition.value}
                  checked={filters.condition === condition.value}
                  onChange={(e) => onFilterChange('condition', e.target.value)}
                  className="w-4 h-4 text-indigo-600 mt-0.5"
                />
                <div>
                  <span className="font-medium">{condition.label}</span>
                  <p className="text-xs text-gray-500">{condition.description}</p>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Location Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('location')}
          className="flex items-center justify-between w-full py-2 font-medium"
        >
          <span>المحافظة</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.location ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.location && (
          <div className="mt-2">
            <select
              value={filters.governorate}
              onChange={(e) => onFilterChange('governorate', e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-3 py-2"
            >
              <option value="">كل المحافظات</option>
              {GOVERNORATES.map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Features Filter */}
      <div className="mb-4">
        <button
          onClick={() => toggleSection('features')}
          className="flex items-center justify-between w-full py-2 font-medium"
        >
          <span>المميزات</span>
          <ChevronDown className={`w-5 h-5 transition-transform ${expandedSections.features ? 'rotate-180' : ''}`} />
        </button>
        {expandedSections.features && (
          <div className="mt-2 space-y-2">
            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-green-300 hover:bg-green-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={filters.imeiVerified}
                onChange={(e) => onFilterChange('imeiVerified', e.target.checked)}
                className="w-5 h-5 text-green-600 rounded"
              />
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-green-600" />
                <div>
                  <span className="font-medium">IMEI موثق</span>
                  <p className="text-xs text-gray-500">أجهزة تم التحقق من سلامة IMEI</p>
                </div>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-purple-300 hover:bg-purple-50 cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={filters.acceptsBarter}
                onChange={(e) => onFilterChange('acceptsBarter', e.target.checked)}
                className="w-5 h-5 text-purple-600 rounded"
              />
              <div className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="font-medium">يقبل المقايضة</span>
                  <p className="text-xs text-gray-500">إمكانية تبديل بجهاز آخر</p>
                </div>
              </div>
            </label>
          </div>
        )}
      </div>

      {/* Apply Button - Mobile only */}
      <button className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors lg:hidden mt-4">
        تطبيق الفلاتر
      </button>
    </div>
  );
}
