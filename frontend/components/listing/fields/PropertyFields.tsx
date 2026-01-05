'use client';

import { Home, Bed, Bath, Maximize } from 'lucide-react';

const PROPERTY_TYPES = [
  { value: 'APARTMENT', label: 'شقة' },
  { value: 'VILLA', label: 'فيلا' },
  { value: 'TOWNHOUSE', label: 'تاون هاوس' },
  { value: 'DUPLEX', label: 'دوبلكس' },
  { value: 'PENTHOUSE', label: 'بنتهاوس' },
  { value: 'STUDIO', label: 'استوديو' },
  { value: 'LAND', label: 'أرض' },
  { value: 'COMMERCIAL', label: 'تجاري' }
];

const LISTING_TYPES = [
  { value: 'SALE', label: 'للبيع' },
  { value: 'RENT', label: 'للإيجار' }
];

const FINISHING_LEVELS = [
  { value: 'SUPER_LUX', label: 'سوبر لوكس' },
  { value: 'LUX', label: 'لوكس' },
  { value: 'SEMI_FINISHED', label: 'نصف تشطيب' },
  { value: 'NOT_FINISHED', label: 'بدون تشطيب' }
];

const FURNISHING_STATUS = [
  { value: 'FURNISHED', label: 'مفروش' },
  { value: 'SEMI_FURNISHED', label: 'نصف مفروش' },
  { value: 'UNFURNISHED', label: 'بدون أثاث' }
];

const AMENITIES = [
  'مواقف سيارات', 'حديقة', 'حمام سباحة', 'جيم', 'أمن 24/7',
  'مصعد', 'تكييف مركزي', 'بلكونة', 'مخزن', 'غرفة خادمة',
  'كاميرات مراقبة', 'إنتركوم', 'غاز طبيعي', 'سخان مركزي'
];

interface PropertyFieldsProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function PropertyFields({ data, onChange }: PropertyFieldsProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleAmenity = (amenity: string) => {
    const current = data.amenities || [];
    const updated = current.includes(amenity)
      ? current.filter((a: string) => a !== amenity)
      : [...current, amenity];
    handleChange('amenities', updated);
  };

  return (
    <div className="space-y-6">
      {/* Property Type & Listing Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Home className="w-4 h-4 inline ml-1" />
            نوع العقار <span className="text-red-500">*</span>
          </label>
          <select
            value={data.propertyType || ''}
            onChange={(e) => handleChange('propertyType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر النوع</option>
            {PROPERTY_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع الإعلان <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-4">
            {LISTING_TYPES.map(type => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleChange('listingType', type.value)}
                className={`flex-1 py-3 rounded-xl border-2 text-center font-medium transition-all ${
                  data.listingType === type.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                    : 'border-gray-200 hover:border-indigo-300'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Maximize className="w-4 h-4 inline ml-1" />
          المساحة (م²) <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={data.area || ''}
          onChange={(e) => handleChange('area', e.target.value)}
          placeholder="0"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Bedrooms & Bathrooms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Bed className="w-4 h-4 inline ml-1" />
            عدد الغرف
          </label>
          <select
            value={data.bedrooms || ''}
            onChange={(e) => handleChange('bedrooms', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Bath className="w-4 h-4 inline ml-1" />
            عدد الحمامات
          </label>
          <select
            value={data.bathrooms || ''}
            onChange={(e) => handleChange('bathrooms', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر</option>
            {[1, 2, 3, 4, 5, 6].map(num => (
              <option key={num} value={num}>{num}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Floor */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الدور
        </label>
        <select
          value={data.floor || ''}
          onChange={(e) => handleChange('floor', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">اختر</option>
          <option value="ground">أرضي</option>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(num => (
            <option key={num} value={num}>الدور {num}</option>
          ))}
        </select>
      </div>

      {/* Finishing & Furnishing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مستوى التشطيب
          </label>
          <select
            value={data.finishingLevel || ''}
            onChange={(e) => handleChange('finishingLevel', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر</option>
            {FINISHING_LEVELS.map(level => (
              <option key={level.value} value={level.value}>{level.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            حالة الأثاث
          </label>
          <select
            value={data.furnishingStatus || ''}
            onChange={(e) => handleChange('furnishingStatus', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر</option>
            {FURNISHING_STATUS.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Amenities */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          المرافق والخدمات
        </label>
        <div className="flex flex-wrap gap-2">
          {AMENITIES.map(amenity => (
            <button
              key={amenity}
              type="button"
              onClick={() => toggleAmenity(amenity)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                (data.amenities || []).includes(amenity)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {amenity}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
