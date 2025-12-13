'use client';

import React from 'react';

// ============================================
// Constants - Real Estate
// ============================================
export const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'شقة', icon: '🏢' },
  { value: 'VILLA', label: 'فيلا', icon: '🏡' },
  { value: 'DUPLEX', label: 'دوبلكس', icon: '🏠' },
  { value: 'PENTHOUSE', label: 'بنتهاوس', icon: '🌆' },
  { value: 'STUDIO', label: 'ستوديو', icon: '🛏️' },
  { value: 'CHALET', label: 'شاليه', icon: '🏖️' },
  { value: 'TOWNHOUSE', label: 'تاون هاوس', icon: '🏘️' },
  { value: 'LAND', label: 'أرض', icon: '🌍' },
  { value: 'COMMERCIAL_SHOP', label: 'محل تجاري', icon: '🏪' },
  { value: 'OFFICE', label: 'مكتب', icon: '💼' },
  { value: 'WAREHOUSE', label: 'مخزن', icon: '📦' },
];

export const PROPERTY_FINISHING = [
  { value: 'NOT_FINISHED', label: 'بدون تشطيب' },
  { value: 'SEMI_FINISHED', label: 'نصف تشطيب' },
  { value: 'FULLY_FINISHED', label: 'تشطيب كامل' },
  { value: 'SUPER_LUX', label: 'سوبر لوكس' },
  { value: 'ULTRA_SUPER_LUX', label: 'الترا سوبر لوكس' },
  { value: 'FURNISHED', label: 'مفروش' },
];

export const PROPERTY_VIEWS = [
  { value: 'STREET', label: 'شارع' },
  { value: 'GARDEN', label: 'حديقة' },
  { value: 'SEA', label: 'بحر' },
  { value: 'NILE', label: 'نيل' },
  { value: 'POOL', label: 'حمام سباحة' },
  { value: 'CITY', label: 'مدينة' },
  { value: 'MAIN_ROAD', label: 'طريق رئيسي' },
];

// ============================================
// Constants - Vehicles
// ============================================
export const CAR_BRANDS = [
  'تويوتا', 'هيونداي', 'نيسان', 'كيا', 'شيفروليه', 'مرسيدس', 'بي إم دبليو',
  'أودي', 'فولكس فاجن', 'هوندا', 'مازدا', 'سوزوكي', 'ميتسوبيشي', 'فورد',
  'جيب', 'رينو', 'بيجو', 'سيات', 'سكودا', 'فيات', 'أوبل', 'MG', 'شيري',
  'جيلي', 'BYD', 'لادا', 'دايو', 'سوبارو', 'لكزس', 'إنفينيتي', 'بورش',
  'لاند روفر', 'جاجوار', 'فولفو', 'ألفا روميو', 'مازيراتي', 'فيراري',
];

export const FUEL_TYPES = [
  { value: 'PETROL', label: 'بنزين', icon: '⛽' },
  { value: 'DIESEL', label: 'ديزل', icon: '🛢️' },
  { value: 'ELECTRIC', label: 'كهرباء', icon: '🔋' },
  { value: 'HYBRID', label: 'هايبرد', icon: '🔌' },
  { value: 'NATURAL_GAS', label: 'غاز طبيعي', icon: '💨' },
  { value: 'LPG', label: 'غاز بترولي', icon: '🔥' },
];

export const TRANSMISSION_TYPES = [
  { value: 'AUTOMATIC', label: 'أوتوماتيك' },
  { value: 'MANUAL', label: 'مانيوال' },
  { value: 'CVT', label: 'CVT' },
  { value: 'SEMI_AUTOMATIC', label: 'نصف أوتوماتيك' },
];

export const BODY_TYPES = [
  { value: 'SEDAN', label: 'سيدان' },
  { value: 'HATCHBACK', label: 'هاتشباك' },
  { value: 'SUV', label: 'SUV' },
  { value: 'CROSSOVER', label: 'كروس أوفر' },
  { value: 'COUPE', label: 'كوبيه' },
  { value: 'CONVERTIBLE', label: 'كشف' },
  { value: 'PICKUP', label: 'بيك أب' },
  { value: 'VAN', label: 'فان' },
  { value: 'MINIVAN', label: 'ميني فان' },
  { value: 'WAGON', label: 'ستيشن واجن' },
];

export const CAR_COLORS = [
  'أبيض', 'أسود', 'فضي', 'رمادي', 'أحمر', 'أزرق', 'أخضر', 'بني', 'بيج',
  'ذهبي', 'برتقالي', 'أصفر', 'بنفسجي', 'وردي', 'شامبين',
];

// ============================================
// Interfaces
// ============================================
export interface RealEstateFilters {
  propertyType?: string;
  propertyFinishing?: string;
  propertyView?: string;
  minArea?: string;
  maxArea?: string;
  minBedrooms?: string;
  maxBedrooms?: string;
  minBathrooms?: string;
  maxBathrooms?: string;
  minFloor?: string;
  maxFloor?: string;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasSecurity?: boolean;
}

export interface VehicleFilters {
  vehicleBrand?: string;
  vehicleModel?: string;
  minYear?: string;
  maxYear?: string;
  minKilometers?: string;
  maxKilometers?: string;
  fuelType?: string;
  transmissionType?: string;
  bodyType?: string;
  vehicleColor?: string;
  hasWarranty?: boolean;
}

interface AdvancedFiltersProps {
  categorySlug?: string;
  realEstateFilters: RealEstateFilters;
  vehicleFilters: VehicleFilters;
  deliveryAvailable?: boolean;
  installmentAvailable?: boolean;
  onRealEstateChange: (filters: RealEstateFilters) => void;
  onVehicleChange: (filters: VehicleFilters) => void;
  onDeliveryChange: (value: boolean | undefined) => void;
  onInstallmentChange: (value: boolean | undefined) => void;
}

// ============================================
// Main Component
// ============================================
export default function AdvancedFilters({
  categorySlug,
  realEstateFilters,
  vehicleFilters,
  deliveryAvailable,
  installmentAvailable,
  onRealEstateChange,
  onVehicleChange,
  onDeliveryChange,
  onInstallmentChange,
}: AdvancedFiltersProps) {
  // Determine which advanced filters to show based on category
  const isRealEstate = categorySlug?.includes('real-estate') || categorySlug?.includes('عقارات');
  const isVehicle = categorySlug?.includes('vehicles') || categorySlug?.includes('cars') || categorySlug?.includes('سيارات');

  const currentYear = new Date().getFullYear();

  return (
    <div className="space-y-6">
      {/* ============================================
          Real Estate Filters
          ============================================ */}
      {isRealEstate && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            🏠 فلاتر العقارات
          </h3>

          {/* Property Type */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">نوع العقار</label>
            <select
              value={realEstateFilters.propertyType || ''}
              onChange={(e) => onRealEstateChange({ ...realEstateFilters, propertyType: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">الكل</option>
              {PROPERTY_TYPES.map((type) => (
                <option key={type.value} value={type.value}>{type.icon} {type.label}</option>
              ))}
            </select>
          </div>

          {/* Area Range */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">المساحة (م²)</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={realEstateFilters.minArea || ''}
                onChange={(e) => onRealEstateChange({ ...realEstateFilters, minArea: e.target.value || undefined })}
                placeholder="من"
                min="0"
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                value={realEstateFilters.maxArea || ''}
                onChange={(e) => onRealEstateChange({ ...realEstateFilters, maxArea: e.target.value || undefined })}
                placeholder="إلى"
                min="0"
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">غرف النوم</label>
            <div className="flex flex-wrap gap-2">
              {['1', '2', '3', '4', '5+'].map((num) => (
                <button
                  key={num}
                  onClick={() => onRealEstateChange({
                    ...realEstateFilters,
                    minBedrooms: realEstateFilters.minBedrooms === num ? undefined : num,
                  })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    realEstateFilters.minBedrooms === num
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">الحمامات</label>
            <div className="flex flex-wrap gap-2">
              {['1', '2', '3', '4+'].map((num) => (
                <button
                  key={num}
                  onClick={() => onRealEstateChange({
                    ...realEstateFilters,
                    minBathrooms: realEstateFilters.minBathrooms === num ? undefined : num,
                  })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    realEstateFilters.minBathrooms === num
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Finishing */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">التشطيب</label>
            <select
              value={realEstateFilters.propertyFinishing || ''}
              onChange={(e) => onRealEstateChange({ ...realEstateFilters, propertyFinishing: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">الكل</option>
              {PROPERTY_FINISHING.map((finish) => (
                <option key={finish.value} value={finish.value}>{finish.label}</option>
              ))}
            </select>
          </div>

          {/* View */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">الإطلالة</label>
            <select
              value={realEstateFilters.propertyView || ''}
              onChange={(e) => onRealEstateChange({ ...realEstateFilters, propertyView: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">الكل</option>
              {PROPERTY_VIEWS.map((view) => (
                <option key={view.value} value={view.value}>{view.label}</option>
              ))}
            </select>
          </div>

          {/* Amenities */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">المرافق</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'hasElevator', label: '🛗 مصعد', value: realEstateFilters.hasElevator },
                { key: 'hasParking', label: '🅿️ جراج', value: realEstateFilters.hasParking },
                { key: 'hasGarden', label: '🌳 حديقة', value: realEstateFilters.hasGarden },
                { key: 'hasPool', label: '🏊 حمام سباحة', value: realEstateFilters.hasPool },
                { key: 'hasGym', label: '💪 جيم', value: realEstateFilters.hasGym },
                { key: 'hasSecurity', label: '🔒 أمن', value: realEstateFilters.hasSecurity },
              ].map((amenity) => (
                <label key={amenity.key} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={amenity.value || false}
                    onChange={(e) => onRealEstateChange({
                      ...realEstateFilters,
                      [amenity.key]: e.target.checked || undefined,
                    })}
                    className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
                  />
                  <span className="text-sm text-gray-700">{amenity.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          Vehicle Filters
          ============================================ */}
      {isVehicle && (
        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            🚗 فلاتر السيارات
          </h3>

          {/* Brand */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">الماركة</label>
            <select
              value={vehicleFilters.vehicleBrand || ''}
              onChange={(e) => onVehicleChange({ ...vehicleFilters, vehicleBrand: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">الكل</option>
              {CAR_BRANDS.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">الموديل</label>
            <input
              type="text"
              value={vehicleFilters.vehicleModel || ''}
              onChange={(e) => onVehicleChange({ ...vehicleFilters, vehicleModel: e.target.value || undefined })}
              placeholder="مثال: كورولا"
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
            />
          </div>

          {/* Year Range */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">سنة الصنع</label>
            <div className="grid grid-cols-2 gap-2">
              <select
                value={vehicleFilters.minYear || ''}
                onChange={(e) => onVehicleChange({ ...vehicleFilters, minYear: e.target.value || undefined })}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="">من</option>
                {Array.from({ length: 30 }, (_, i) => currentYear - i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
              <select
                value={vehicleFilters.maxYear || ''}
                onChange={(e) => onVehicleChange({ ...vehicleFilters, maxYear: e.target.value || undefined })}
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              >
                <option value="">إلى</option>
                {Array.from({ length: 30 }, (_, i) => currentYear - i).map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Kilometers Range */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">الكيلومترات</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                value={vehicleFilters.minKilometers || ''}
                onChange={(e) => onVehicleChange({ ...vehicleFilters, minKilometers: e.target.value || undefined })}
                placeholder="من"
                min="0"
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
              <input
                type="number"
                value={vehicleFilters.maxKilometers || ''}
                onChange={(e) => onVehicleChange({ ...vehicleFilters, maxKilometers: e.target.value || undefined })}
                placeholder="إلى"
                min="0"
                className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">نوع الوقود</label>
            <div className="flex flex-wrap gap-2">
              {FUEL_TYPES.map((fuel) => (
                <button
                  key={fuel.value}
                  onClick={() => onVehicleChange({
                    ...vehicleFilters,
                    fuelType: vehicleFilters.fuelType === fuel.value ? undefined : fuel.value,
                  })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    vehicleFilters.fuelType === fuel.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {fuel.icon} {fuel.label}
                </button>
              ))}
            </div>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">ناقل الحركة</label>
            <div className="flex flex-wrap gap-2">
              {TRANSMISSION_TYPES.map((trans) => (
                <button
                  key={trans.value}
                  onClick={() => onVehicleChange({
                    ...vehicleFilters,
                    transmissionType: vehicleFilters.transmissionType === trans.value ? undefined : trans.value,
                  })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    vehicleFilters.transmissionType === trans.value
                      ? 'bg-primary-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {trans.label}
                </button>
              ))}
            </div>
          </div>

          {/* Body Type */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">نوع الهيكل</label>
            <select
              value={vehicleFilters.bodyType || ''}
              onChange={(e) => onVehicleChange({ ...vehicleFilters, bodyType: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">الكل</option>
              {BODY_TYPES.map((body) => (
                <option key={body.value} value={body.value}>{body.label}</option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs text-gray-500 mb-2">اللون</label>
            <select
              value={vehicleFilters.vehicleColor || ''}
              onChange={(e) => onVehicleChange({ ...vehicleFilters, vehicleColor: e.target.value || undefined })}
              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="">الكل</option>
              {CAR_COLORS.map((color) => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          {/* Warranty */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={vehicleFilters.hasWarranty || false}
              onChange={(e) => onVehicleChange({
                ...vehicleFilters,
                hasWarranty: e.target.checked || undefined,
              })}
              className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">🛡️ ضمان</span>
          </label>
        </div>
      )}

      {/* ============================================
          Service Availability Filters (Always shown)
          ============================================ */}
      <div className="space-y-3 pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700">🚚 الخدمات المتاحة</h3>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={deliveryAvailable || false}
            onChange={(e) => onDeliveryChange(e.target.checked || undefined)}
            className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">📦 توصيل متاح</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={installmentAvailable || false}
            onChange={(e) => onInstallmentChange(e.target.checked || undefined)}
            className="w-4 h-4 text-primary-500 rounded focus:ring-primary-500"
          />
          <span className="text-sm text-gray-700">💳 تقسيط متاح</span>
        </label>
      </div>
    </div>
  );
}
