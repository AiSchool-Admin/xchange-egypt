'use client';

import { Car, Fuel, Gauge, Calendar } from 'lucide-react';

const MAKES = [
  'Toyota', 'Hyundai', 'Nissan', 'Kia', 'Mercedes-Benz', 'BMW',
  'Chevrolet', 'Honda', 'Mitsubishi', 'Suzuki', 'Peugeot', 'Renault',
  'Fiat', 'Skoda', 'Volkswagen', 'MG', 'Chery', 'BYD', 'Geely', 'SEAT',
  'Jeep', 'Land Rover', 'Audi'
];

const BODY_TYPES = [
  { value: 'SEDAN', label: 'سيدان' },
  { value: 'SUV', label: 'SUV' },
  { value: 'HATCHBACK', label: 'هاتشباك' },
  { value: 'COUPE', label: 'كوبيه' },
  { value: 'VAN', label: 'فان' },
  { value: 'WAGON', label: 'ستيشن' },
  { value: 'PICKUP', label: 'بيك أب' },
  { value: 'CONVERTIBLE', label: 'مكشوفة' }
];

const TRANSMISSIONS = [
  { value: 'AUTOMATIC', label: 'أوتوماتيك' },
  { value: 'MANUAL', label: 'مانيوال' },
  { value: 'CVT', label: 'CVT' },
  { value: 'DCT', label: 'DCT' }
];

const FUEL_TYPES = [
  { value: 'PETROL', label: 'بنزين' },
  { value: 'DIESEL', label: 'ديزل' },
  { value: 'HYBRID', label: 'هايبرد' },
  { value: 'ELECTRIC', label: 'كهربائي' },
  { value: 'LPG', label: 'غاز' },
  { value: 'NATURAL_GAS', label: 'غاز طبيعي' }
];

// Backend expects: NEW, LIKE_NEW, GOOD, FAIR, POOR
const CONDITIONS = [
  { value: 'NEW', label: 'جديدة' },
  { value: 'LIKE_NEW', label: 'كالجديدة' },
  { value: 'GOOD', label: 'جيدة' },
  { value: 'FAIR', label: 'مقبولة' },
  { value: 'POOR', label: 'تحتاج صيانة' }
];

const FEATURES = [
  'تكييف', 'ABS', 'وسائد هوائية', 'فتحة سقف', 'كاميرا خلفية', 'حساسات ركن',
  'شاشة', 'بلوتوث', 'USB', 'مثبت سرعة', 'جلد', 'LED', 'نظام ملاحة', 'Apple CarPlay'
];

interface CarFieldsProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function CarFields({ data, onChange }: CarFieldsProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleFeature = (feature: string) => {
    const current = data.features || [];
    const updated = current.includes(feature)
      ? current.filter((f: string) => f !== feature)
      : [...current, feature];
    handleChange('features', updated);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 31 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-6">
      {/* Make & Model */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Car className="w-4 h-4 inline ml-1" />
            الماركة <span className="text-red-500">*</span>
          </label>
          <select
            value={data.make || ''}
            onChange={(e) => handleChange('make', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر الماركة</option>
            {MAKES.map(make => (
              <option key={make} value={make}>{make}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الموديل <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={data.model || ''}
            onChange={(e) => handleChange('model', e.target.value)}
            placeholder="مثال: Corolla, Elantra"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Year & Body Type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline ml-1" />
            سنة الصنع <span className="text-red-500">*</span>
          </label>
          <select
            value={data.year || ''}
            onChange={(e) => handleChange('year', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر السنة</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع الهيكل <span className="text-red-500">*</span>
          </label>
          <select
            value={data.bodyType || ''}
            onChange={(e) => handleChange('bodyType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر النوع</option>
            {BODY_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Mileage */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Gauge className="w-4 h-4 inline ml-1" />
          الكيلومترات <span className="text-red-500">*</span>
        </label>
        <input
          type="number"
          value={data.mileage || ''}
          onChange={(e) => handleChange('mileage', e.target.value)}
          placeholder="0"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Transmission & Fuel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            ناقل الحركة <span className="text-red-500">*</span>
          </label>
          <select
            value={data.transmission || ''}
            onChange={(e) => handleChange('transmission', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر</option>
            {TRANSMISSIONS.map(trans => (
              <option key={trans.value} value={trans.value}>{trans.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Fuel className="w-4 h-4 inline ml-1" />
            نوع الوقود <span className="text-red-500">*</span>
          </label>
          <select
            value={data.fuelType || ''}
            onChange={(e) => handleChange('fuelType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر</option>
            {FUEL_TYPES.map(fuel => (
              <option key={fuel.value} value={fuel.value}>{fuel.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          حالة السيارة <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
          {CONDITIONS.map(cond => (
            <button
              key={cond.value}
              type="button"
              onClick={() => handleChange('condition', cond.value)}
              className={`p-3 rounded-xl border-2 text-center text-sm transition-all ${
                data.condition === cond.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              {cond.label}
            </button>
          ))}
        </div>
      </div>

      {/* Colors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اللون الخارجي
          </label>
          <input
            type="text"
            value={data.exteriorColor || ''}
            onChange={(e) => handleChange('exteriorColor', e.target.value)}
            placeholder="مثال: أبيض، فضي"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اللون الداخلي
          </label>
          <input
            type="text"
            value={data.interiorColor || ''}
            onChange={(e) => handleChange('interiorColor', e.target.value)}
            placeholder="مثال: بيج، أسود"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Features */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          المميزات
        </label>
        <div className="flex flex-wrap gap-2">
          {FEATURES.map(feature => (
            <button
              key={feature}
              type="button"
              onClick={() => toggleFeature(feature)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                (data.features || []).includes(feature)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {feature}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
