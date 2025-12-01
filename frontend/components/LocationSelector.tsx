'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  EGYPT,
  getAllGovernorates,
  getCitiesByGovernorate,
  getDistrictsByCity,
  getLocationLabel,
  MarketScope,
  MARKET_SCOPES,
  Governorate,
  City,
  District,
} from '@/lib/data/egyptLocations';

export interface LocationSelection {
  scope: MarketScope;
  governorateId?: string;
  cityId?: string;
  districtId?: string;
}

interface LocationSelectorProps {
  value: LocationSelection;
  onChange: (selection: LocationSelection) => void;
  compact?: boolean;
  className?: string;
}

export default function LocationSelector({
  value,
  onChange,
  compact = false,
  className = '',
}: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [governorates] = useState<Governorate[]>(getAllGovernorates());
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Update cities when governorate changes
  useEffect(() => {
    if (value.governorateId) {
      setCities(getCitiesByGovernorate(value.governorateId));
    } else {
      setCities([]);
    }
  }, [value.governorateId]);

  // Update districts when city changes
  useEffect(() => {
    if (value.governorateId && value.cityId) {
      setDistricts(getDistrictsByCity(value.governorateId, value.cityId));
    } else {
      setDistricts([]);
    }
  }, [value.governorateId, value.cityId]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleScopeChange = (scope: MarketScope) => {
    if (scope === 'NATIONAL') {
      onChange({ scope, governorateId: undefined, cityId: undefined, districtId: undefined });
    } else {
      onChange({ ...value, scope });
    }
  };

  const handleGovernorateChange = (governorateId: string) => {
    if (governorateId) {
      onChange({
        scope: 'GOVERNORATE',
        governorateId,
        cityId: undefined,
        districtId: undefined,
      });
    } else {
      onChange({ scope: 'NATIONAL', governorateId: undefined, cityId: undefined, districtId: undefined });
    }
  };

  const handleCityChange = (cityId: string) => {
    if (cityId) {
      onChange({
        ...value,
        scope: 'CITY',
        cityId,
        districtId: undefined,
      });
    } else {
      onChange({
        ...value,
        scope: 'GOVERNORATE',
        cityId: undefined,
        districtId: undefined,
      });
    }
  };

  const handleDistrictChange = (districtId: string) => {
    if (districtId) {
      onChange({
        ...value,
        scope: 'DISTRICT',
        districtId,
      });
    } else {
      onChange({
        ...value,
        scope: 'CITY',
        districtId: undefined,
      });
    }
  };

  const locationLabel = getLocationLabel(value.governorateId, value.cityId, value.districtId);
  const scopeInfo = MARKET_SCOPES.find(s => s.id === value.scope);

  if (compact) {
    return (
      <div className={`relative ${className}`} ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:border-emerald-500 transition-colors text-sm font-medium text-gray-700"
        >
          <span className="text-lg">{scopeInfo?.icon || '📍'}</span>
          <span className="truncate max-w-[150px]">{locationLabel}</span>
          <svg
            className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute top-full right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-100 bg-gradient-to-l from-emerald-50 to-teal-50">
              <h3 className="font-bold text-gray-900">🗺️ تحديد نطاق السوق</h3>
              <p className="text-sm text-gray-600 mt-1">اختر المنطقة للبحث والتسوق</p>
            </div>

            <div className="p-4 space-y-4 max-h-[400px] overflow-y-auto">
              {/* All Egypt Option */}
              <button
                type="button"
                onClick={() => {
                  handleScopeChange('NATIONAL');
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
                  value.scope === 'NATIONAL' && !value.governorateId
                    ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
                    : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
                }`}
              >
                <span className="text-2xl">🇪🇬</span>
                <span className="font-medium">كل مصر</span>
                {value.scope === 'NATIONAL' && !value.governorateId && (
                  <span className="mr-auto text-emerald-600">✓</span>
                )}
              </button>

              {/* Governorate */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  🏛️ المحافظة
                </label>
                <select
                  value={value.governorateId || ''}
                  onChange={(e) => handleGovernorateChange(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                >
                  <option value="">اختر المحافظة</option>
                  {governorates.map((gov) => (
                    <option key={gov.id} value={gov.id}>
                      {gov.nameAr}
                    </option>
                  ))}
                </select>
              </div>

              {/* City */}
              {value.governorateId && cities.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🏙️ المدينة
                  </label>
                  <select
                    value={value.cityId || ''}
                    onChange={(e) => handleCityChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  >
                    <option value="">كل المدن</option>
                    {cities.map((city) => (
                      <option key={city.id} value={city.id}>
                        {city.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* District */}
              {value.cityId && districts.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    📍 الحي
                  </label>
                  <select
                    value={value.districtId || ''}
                    onChange={(e) => handleDistrictChange(e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                  >
                    <option value="">كل الأحياء</option>
                    {districts.map((district) => (
                      <option key={district.id} value={district.id}>
                        {district.nameAr}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-full py-2.5 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition font-medium"
              >
                تأكيد الاختيار
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Full version (for filters sidebar)
  return (
    <div className={className}>
      <div className="space-y-4">
        {/* Market Scope Title */}
        <div className="flex items-center gap-2 mb-2">
          <span className="text-lg">🗺️</span>
          <span className="font-bold text-gray-900">نطاق السوق</span>
        </div>

        {/* All Egypt Quick Option */}
        <button
          type="button"
          onClick={() => handleScopeChange('NATIONAL')}
          className={`w-full flex items-center gap-3 p-3 rounded-xl transition ${
            value.scope === 'NATIONAL' && !value.governorateId
              ? 'bg-emerald-100 text-emerald-700 border-2 border-emerald-500'
              : 'bg-gray-50 hover:bg-gray-100 border-2 border-transparent'
          }`}
        >
          <span className="text-xl">🇪🇬</span>
          <span className="font-medium">كل مصر</span>
          <span className="text-xs text-gray-500 mr-auto">جميع المحافظات</span>
        </button>

        {/* Governorate Select */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المحافظة
          </label>
          <select
            value={value.governorateId || ''}
            onChange={(e) => handleGovernorateChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
          >
            <option value="">اختر المحافظة</option>
            {governorates.map((gov) => (
              <option key={gov.id} value={gov.id}>
                {gov.nameAr}
              </option>
            ))}
          </select>
        </div>

        {/* City Select */}
        {value.governorateId && cities.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدينة
            </label>
            <select
              value={value.cityId || ''}
              onChange={(e) => handleCityChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            >
              <option value="">كل المدن في {governorates.find(g => g.id === value.governorateId)?.nameAr}</option>
              {cities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.nameAr}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* District Select */}
        {value.cityId && districts.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحي
            </label>
            <select
              value={value.districtId || ''}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
            >
              <option value="">كل الأحياء في {cities.find(c => c.id === value.cityId)?.nameAr}</option>
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.nameAr}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Current Selection Display */}
        {value.governorateId && (
          <div className="bg-emerald-50 rounded-xl p-3 flex items-center gap-2">
            <span className="text-lg">{scopeInfo?.icon}</span>
            <div className="flex-1">
              <p className="text-sm text-emerald-800 font-medium">{locationLabel}</p>
              <p className="text-xs text-emerald-600">النطاق المحدد للبحث والتسوق</p>
            </div>
            <button
              type="button"
              onClick={() => handleScopeChange('NATIONAL')}
              className="text-emerald-600 hover:text-emerald-700 text-sm"
            >
              إلغاء
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
