'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  X,
  ChevronDown,
  MapPin,
  Home,
  DollarSign,
  Maximize2,
  FileCheck,
  ArrowUpDown,
} from 'lucide-react';
import {
  PropertyType,
  ListingType,
  TitleType,
  VerificationLevel,
} from '@/lib/api/properties';

interface PropertyFiltersProps {
  onFiltersChange: (filters: PropertyFiltersState) => void;
  initialFilters?: Partial<PropertyFiltersState>;
  governorates?: { name: string; nameAr: string }[];
  showSearch?: boolean;
}

export interface PropertyFiltersState {
  search?: string;
  governorate?: string;
  city?: string;
  district?: string;
  propertyTypes?: PropertyType[];
  listingType?: ListingType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  titleTypes?: TitleType[];
  verificationLevels?: VerificationLevel[];
  hasEscrow?: boolean;
  openToBarter?: boolean;
  sortBy?: 'createdAt' | 'price' | 'area';
  sortOrder?: 'asc' | 'desc';
}

const PROPERTY_TYPES: { value: PropertyType; label: string; icon: string }[] = [
  { value: 'APARTMENT', label: 'شقة', icon: '🏢' },
  { value: 'VILLA', label: 'فيلا', icon: '🏡' },
  { value: 'DUPLEX', label: 'دوبلكس', icon: '🏠' },
  { value: 'PENTHOUSE', label: 'بنتهاوس', icon: '🌇' },
  { value: 'STUDIO', label: 'ستوديو', icon: '🛋️' },
  { value: 'CHALET', label: 'شاليه', icon: '🏖️' },
  { value: 'TOWNHOUSE', label: 'تاون هاوس', icon: '🏘️' },
  { value: 'TWIN_HOUSE', label: 'توين هاوس', icon: '🏠' },
  { value: 'LAND', label: 'أرض', icon: '🌍' },
  { value: 'COMMERCIAL', label: 'تجاري', icon: '🏪' },
  { value: 'OFFICE', label: 'مكتب', icon: '🏢' },
  { value: 'RETAIL', label: 'محل', icon: '🏬' },
  { value: 'WAREHOUSE', label: 'مخزن', icon: '🏭' },
  { value: 'BUILDING', label: 'عمارة', icon: '🏗️' },
];

const TITLE_TYPES: { value: TitleType; label: string; color: string }[] = [
  { value: 'REGISTERED', label: 'عقد مسجل', color: 'bg-green-100 text-green-700' },
  { value: 'PRELIMINARY', label: 'عقد ابتدائي', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'POA', label: 'توكيل', color: 'bg-red-100 text-red-700' },
];

const VERIFICATION_LEVELS: { value: VerificationLevel; label: string }[] = [
  { value: 'DOCUMENTS_VERIFIED', label: 'مستندات موثقة' },
  { value: 'FIELD_VERIFIED', label: 'فحص ميداني' },
  { value: 'GOVERNMENT_VERIFIED', label: 'موثق حكومياً' },
];

const PRICE_RANGES = [
  { min: 0, max: 500000, label: 'أقل من 500 ألف' },
  { min: 500000, max: 1000000, label: '500 ألف - مليون' },
  { min: 1000000, max: 2000000, label: 'مليون - 2 مليون' },
  { min: 2000000, max: 5000000, label: '2 - 5 مليون' },
  { min: 5000000, max: 10000000, label: '5 - 10 مليون' },
  { min: 10000000, max: undefined, label: 'أكثر من 10 مليون' },
];

const AREA_RANGES = [
  { min: 0, max: 100, label: 'أقل من 100 م²' },
  { min: 100, max: 150, label: '100 - 150 م²' },
  { min: 150, max: 200, label: '150 - 200 م²' },
  { min: 200, max: 300, label: '200 - 300 م²' },
  { min: 300, max: 500, label: '300 - 500 م²' },
  { min: 500, max: undefined, label: 'أكثر من 500 م²' },
];

export const PropertyFilters: React.FC<PropertyFiltersProps> = ({
  onFiltersChange,
  initialFilters = {},
  governorates = [],
  showSearch = true,
}) => {
  const [filters, setFilters] = useState<PropertyFiltersState>(initialFilters);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialFilters.search || '');

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchTerm !== filters.search) {
        updateFilters({ search: searchTerm });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const updateFilters = (newFilters: Partial<PropertyFiltersState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const toggleArrayFilter = <T extends string>(
    key: keyof PropertyFiltersState,
    value: T
  ) => {
    const current = (filters[key] as T[] | undefined) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilters({ [key]: updated.length > 0 ? updated : undefined });
  };

  const clearFilters = () => {
    const cleared: PropertyFiltersState = {};
    setFilters(cleared);
    setSearchTerm('');
    onFiltersChange(cleared);
  };

  const activeFiltersCount = Object.values(filters).filter(
    (v) => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)
  ).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Main filters row */}
      <div className="p-4">
        <div className="flex flex-wrap gap-3">
          {/* Search */}
          {showSearch && (
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ابحث عن عقار..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}

          {/* Listing Type Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => updateFilters({ listingType: 'SALE' })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.listingType === 'SALE'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              للبيع
            </button>
            <button
              onClick={() => updateFilters({ listingType: 'RENT' })}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filters.listingType === 'RENT'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              للإيجار
            </button>
            {filters.listingType && (
              <button
                onClick={() => updateFilters({ listingType: undefined })}
                className="px-2 py-2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Location */}
          <div className="relative min-w-[150px]">
            <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filters.governorate || ''}
              onChange={(e) =>
                updateFilters({
                  governorate: e.target.value || undefined,
                  city: undefined,
                  district: undefined,
                })
              }
              className="w-full pr-9 pl-8 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">كل المحافظات</option>
              {governorates.map((gov) => (
                <option key={gov.name} value={gov.name}>
                  {gov.nameAr}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Property Type */}
          <div className="relative min-w-[150px]">
            <Home className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filters.propertyTypes?.[0] || ''}
              onChange={(e) =>
                updateFilters({
                  propertyTypes: e.target.value ? [e.target.value as PropertyType] : undefined,
                })
              }
              className="w-full pr-9 pl-8 py-2.5 border border-gray-300 rounded-lg appearance-none bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">نوع العقار</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.icon} {type.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-2 px-4 py-2.5 border rounded-lg transition-colors ${
              showAdvanced || activeFiltersCount > 2
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-gray-300 text-gray-600 hover:bg-gray-50'
            }`}
          >
            <SlidersHorizontal className="w-4 h-4" />
            <span>فلاتر متقدمة</span>
            {activeFiltersCount > 2 && (
              <span className="bg-blue-500 text-white text-xs rounded-full px-2 py-0.5">
                {activeFiltersCount - 2}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {activeFiltersCount > 0 && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <X className="w-4 h-4" />
              مسح الكل
            </button>
          )}
        </div>
      </div>

      {/* Advanced filters panel */}
      {showAdvanced && (
        <div className="border-t border-gray-200 p-4 space-y-4">
          {/* Price Range */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">السعر</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {PRICE_RANGES.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    updateFilters({
                      minPrice: range.min,
                      maxPrice: range.max,
                    })
                  }
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    filters.minPrice === range.min && filters.maxPrice === range.max
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Area Range */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Maximize2 className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">المساحة</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {AREA_RANGES.map((range, idx) => (
                <button
                  key={idx}
                  onClick={() =>
                    updateFilters({
                      minArea: range.min,
                      maxArea: range.max,
                    })
                  }
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    filters.minArea === range.min && filters.maxArea === range.max
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bedrooms & Bathrooms */}
          <div className="flex gap-6">
            <div>
              <span className="text-sm font-medium text-gray-700 mb-2 block">غرف النوم</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() =>
                      updateFilters({
                        bedrooms: filters.bedrooms === num ? undefined : num,
                      })
                    }
                    className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                      filters.bedrooms === num
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {num}+
                  </button>
                ))}
              </div>
            </div>
            <div>
              <span className="text-sm font-medium text-gray-700 mb-2 block">الحمامات</span>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    onClick={() =>
                      updateFilters({
                        bathrooms: filters.bathrooms === num ? undefined : num,
                      })
                    }
                    className={`w-10 h-10 rounded-lg border text-sm font-medium transition-colors ${
                      filters.bathrooms === num
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {num}+
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Title Types */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <FileCheck className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">نوع العقد</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {TITLE_TYPES.map((type) => (
                <button
                  key={type.value}
                  onClick={() => toggleArrayFilter('titleTypes', type.value)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    filters.titleTypes?.includes(type.value)
                      ? type.color + ' border-transparent'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Verification Levels */}
          <div>
            <span className="text-sm font-medium text-gray-700 mb-2 block">مستوى التحقق</span>
            <div className="flex flex-wrap gap-2">
              {VERIFICATION_LEVELS.map((level) => (
                <button
                  key={level.value}
                  onClick={() => toggleArrayFilter('verificationLevels', level.value)}
                  className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                    filters.verificationLevels?.includes(level.value)
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* Special Features */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.hasEscrow || false}
                onChange={(e) => updateFilters({ hasEscrow: e.target.checked || undefined })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">يدعم Escrow</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.openToBarter || false}
                onChange={(e) => updateFilters({ openToBarter: e.target.checked || undefined })}
                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">يقبل المبادلة</span>
            </label>
          </div>

          {/* Sort */}
          <div className="flex items-center gap-4 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <ArrowUpDown className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">ترتيب حسب:</span>
            </div>
            <select
              value={`${filters.sortBy || 'createdAt'}-${filters.sortOrder || 'desc'}`}
              onChange={(e) => {
                const [sortBy, sortOrder] = e.target.value.split('-') as [
                  'createdAt' | 'price' | 'area',
                  'asc' | 'desc'
                ];
                updateFilters({ sortBy, sortOrder });
              }}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="createdAt-desc">الأحدث أولاً</option>
              <option value="createdAt-asc">الأقدم أولاً</option>
              <option value="price-asc">السعر: الأقل</option>
              <option value="price-desc">السعر: الأعلى</option>
              <option value="area-asc">المساحة: الأصغر</option>
              <option value="area-desc">المساحة: الأكبر</option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyFilters;
