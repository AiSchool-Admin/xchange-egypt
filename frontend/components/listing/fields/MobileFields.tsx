'use client';

import { Battery, Smartphone, HardDrive, Cpu, Info } from 'lucide-react';

// Brand and Model fields for mobile listings
const BRANDS = [
  { value: 'APPLE', label: 'Apple آبل' },
  { value: 'SAMSUNG', label: 'Samsung سامسونج' },
  { value: 'XIAOMI', label: 'Xiaomi شاومي' },
  { value: 'OPPO', label: 'OPPO أوبو' },
  { value: 'VIVO', label: 'Vivo فيفو' },
  { value: 'HUAWEI', label: 'Huawei هواوي' },
  { value: 'HONOR', label: 'Honor هونر' },
  { value: 'REALME', label: 'Realme ريلمي' },
  { value: 'INFINIX', label: 'Infinix إنفينكس' },
  { value: 'TECNO', label: 'Tecno تكنو' },
  { value: 'ONEPLUS', label: 'OnePlus ون بلس' },
  { value: 'GOOGLE', label: 'Google جوجل' },
  { value: 'NOKIA', label: 'Nokia نوكيا' },
  { value: 'MOTOROLA', label: 'Motorola موتورولا' },
  { value: 'OTHER', label: 'أخرى' },
];

const STORAGE_OPTIONS = [32, 64, 128, 256, 512, 1024];
const RAM_OPTIONS = [2, 3, 4, 6, 8, 12, 16];
// Backend expects: NEW, LIKE_NEW, GOOD, FAIR, POOR
const CONDITIONS = [
  { value: 'NEW', label: 'جديد', description: 'لم يستخدم من قبل' },
  { value: 'LIKE_NEW', label: 'ممتاز', description: 'كالجديد تماماً' },
  { value: 'GOOD', label: 'جيد جداً', description: 'استخدام خفيف' },
  { value: 'FAIR', label: 'جيد', description: 'علامات استخدام واضحة' },
  { value: 'POOR', label: 'مقبول', description: 'يحتاج صيانة بسيطة' }
];

const ACCESSORIES = [
  'الشاحن الأصلي', 'الكابل', 'السماعات', 'العلبة الأصلية',
  'الكتيب', 'واقي الشاشة', 'الجراب', 'شاحن لاسلكي'
];

interface MobileFieldsProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function MobileFields({ data, onChange }: MobileFieldsProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const toggleAccessory = (acc: string) => {
    const current = data.accessories || [];
    const updated = current.includes(acc)
      ? current.filter((a: string) => a !== acc)
      : [...current, acc];
    handleChange('accessories', updated);
  };

  return (
    <div className="space-y-6">
      {/* Brand Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Smartphone className="w-4 h-4 inline ml-1" />
          الماركة <span className="text-red-500">*</span>
        </label>
        <select
          value={data.brand || ''}
          onChange={(e) => handleChange('brand', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">اختر الماركة</option>
          {BRANDS.map(brand => (
            <option key={brand.value} value={brand.value}>{brand.label}</option>
          ))}
        </select>
      </div>

      {/* Model Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Smartphone className="w-4 h-4 inline ml-1" />
          الموديل <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={data.model || ''}
          onChange={(e) => handleChange('model', e.target.value)}
          placeholder="مثال: iPhone 15 Pro Max, Galaxy S24 Ultra"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          اكتب اسم الموديل الكامل
        </p>
      </div>

      {/* Storage & RAM */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <HardDrive className="w-4 h-4 inline ml-1" />
            السعة التخزينية <span className="text-red-500">*</span>
          </label>
          <select
            value={data.storageCapacity || ''}
            onChange={(e) => handleChange('storageCapacity', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر السعة</option>
            {STORAGE_OPTIONS.map(size => (
              <option key={size} value={size}>{size} GB</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Cpu className="w-4 h-4 inline ml-1" />
            الرام <span className="text-red-500">*</span>
          </label>
          <select
            value={data.ramSize || ''}
            onChange={(e) => handleChange('ramSize', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
          >
            <option value="">اختر الرام</option>
            {RAM_OPTIONS.map(size => (
              <option key={size} value={size}>{size} GB</option>
            ))}
          </select>
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اللون
        </label>
        <input
          type="text"
          value={data.color || ''}
          onChange={(e) => handleChange('color', e.target.value)}
          placeholder="مثال: أسود، أبيض، أزرق"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          حالة الجهاز <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {CONDITIONS.map(cond => (
            <button
              key={cond.value}
              type="button"
              onClick={() => handleChange('condition', cond.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                data.condition === cond.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <div className="font-bold text-sm">{cond.label}</div>
              <div className="text-xs text-gray-500">{cond.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Battery Health */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Battery className="w-4 h-4 inline ml-1" />
          صحة البطارية <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min="0"
            max="100"
            value={data.batteryHealth || 80}
            onChange={(e) => handleChange('batteryHealth', Number(e.target.value))}
            className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <span className={`text-2xl font-bold ${
            (data.batteryHealth || 80) >= 80 ? 'text-green-600' :
            (data.batteryHealth || 80) >= 60 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {data.batteryHealth || 80}%
          </span>
        </div>
      </div>

      {/* IMEI */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          رقم IMEI (اختياري)
        </label>
        <input
          type="text"
          value={data.imei || ''}
          onChange={(e) => handleChange('imei', e.target.value)}
          placeholder="15 رقم"
          maxLength={15}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          إدخال IMEI يزيد من ثقة المشترين ويمكنك من الحصول على شارة التوثيق
        </p>
      </div>

      {/* Accessories */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الملحقات المتضمنة
        </label>
        <div className="flex flex-wrap gap-2">
          {ACCESSORIES.map(acc => (
            <button
              key={acc}
              type="button"
              onClick={() => toggleAccessory(acc)}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                (data.accessories || []).includes(acc)
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {acc}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
