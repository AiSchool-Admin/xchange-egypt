'use client';

import { Package, Tag, Info } from 'lucide-react';

const GENERAL_CATEGORIES = [
  { value: 'ELECTRONICS', label: 'إلكترونيات' },
  { value: 'FURNITURE', label: 'أثاث' },
  { value: 'HOME_APPLIANCES', label: 'أجهزة منزلية' },
  { value: 'SPORTS', label: 'رياضة ولياقة' },
  { value: 'BOOKS', label: 'كتب ومجلات' },
  { value: 'TOYS', label: 'ألعاب أطفال' },
  { value: 'MUSIC', label: 'آلات موسيقية' },
  { value: 'GARDEN', label: 'حدائق ونباتات' },
  { value: 'PETS', label: 'مستلزمات حيوانات' },
  { value: 'COLLECTIBLES', label: 'مقتنيات' },
  { value: 'FASHION', label: 'ملابس وأزياء' },
  { value: 'OTHER', label: 'أخرى' }
];

// Backend expects: NEW, LIKE_NEW, GOOD, FAIR, POOR
const CONDITIONS = [
  { value: 'NEW', label: 'جديد' },
  { value: 'LIKE_NEW', label: 'كالجديد (مستخدم قليلاً)' },
  { value: 'GOOD', label: 'جيد' },
  { value: 'FAIR', label: 'مقبول' },
  { value: 'POOR', label: 'للقطع/يحتاج إصلاح' }
];

interface GeneralFieldsProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function GeneralFields({ data, onChange }: GeneralFieldsProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* General Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Tag className="w-4 h-4 inline ml-1" />
          الفئة <span className="text-red-500">*</span>
        </label>
        <select
          value={data.generalCategory || ''}
          onChange={(e) => handleChange('generalCategory', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 bg-white"
        >
          <option value="">اختر الفئة</option>
          {GENERAL_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Custom Category - if "أخرى" selected */}
      {data.generalCategory === 'OTHER' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            حدد الفئة
          </label>
          <input
            type="text"
            value={data.customCategory || ''}
            onChange={(e) => handleChange('customCategory', e.target.value)}
            placeholder="اكتب فئة المنتج"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Brand/Make */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الماركة/الشركة المصنعة (اختياري)
        </label>
        <input
          type="text"
          value={data.brand || ''}
          onChange={(e) => handleChange('brand', e.target.value)}
          placeholder="مثال: Samsung, IKEA, Nike..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الموديل/النوع (اختياري)
        </label>
        <input
          type="text"
          value={data.model || ''}
          onChange={(e) => handleChange('model', e.target.value)}
          placeholder="رقم الموديل أو الاسم"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Package className="w-4 h-4 inline ml-1" />
          الحالة <span className="text-red-500">*</span>
        </label>
        <div className="space-y-2">
          {CONDITIONS.map(cond => (
            <label
              key={cond.value}
              className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                data.condition === cond.value
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 hover:border-indigo-300'
              }`}
            >
              <input
                type="radio"
                name="condition"
                value={cond.value}
                checked={data.condition === cond.value}
                onChange={(e) => handleChange('condition', e.target.value)}
                className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="mr-3 font-medium">{cond.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Quantity */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الكمية
        </label>
        <input
          type="number"
          min="1"
          value={data.quantity || 1}
          onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Dimensions - for furniture/appliances */}
      {(data.generalCategory === 'FURNITURE' || data.generalCategory === 'HOME_APPLIANCES') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الأبعاد (سم) - اختياري
          </label>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <input
                type="number"
                value={data.width || ''}
                onChange={(e) => handleChange('width', e.target.value)}
                placeholder="العرض"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="number"
                value={data.height || ''}
                onChange={(e) => handleChange('height', e.target.value)}
                placeholder="الارتفاع"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <input
                type="number"
                value={data.depth || ''}
                onChange={(e) => handleChange('depth', e.target.value)}
                placeholder="العمق"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Size - for fashion/sports */}
      {(data.generalCategory === 'FASHION' || data.generalCategory === 'SPORTS') && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            المقاس (اختياري)
          </label>
          <input
            type="text"
            value={data.size || ''}
            onChange={(e) => handleChange('size', e.target.value)}
            placeholder="مثال: L, XL, 42..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          اللون (اختياري)
        </label>
        <input
          type="text"
          value={data.color || ''}
          onChange={(e) => handleChange('color', e.target.value)}
          placeholder="مثال: أسود، أبيض، رمادي..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      {/* Warranty */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <input
          type="checkbox"
          id="hasWarranty"
          checked={data.hasWarranty || false}
          onChange={(e) => handleChange('hasWarranty', e.target.checked)}
          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <label htmlFor="hasWarranty" className="text-gray-700">
          يوجد ضمان ساري
        </label>
      </div>

      {data.hasWarranty && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            فترة الضمان المتبقية
          </label>
          <input
            type="text"
            value={data.warrantyPeriod || ''}
            onChange={(e) => handleChange('warrantyPeriod', e.target.value)}
            placeholder="مثال: 6 أشهر، سنة..."
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      )}

      {/* Original Receipt */}
      <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
        <input
          type="checkbox"
          id="hasReceipt"
          checked={data.hasReceipt || false}
          onChange={(e) => handleChange('hasReceipt', e.target.checked)}
          className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500"
        />
        <label htmlFor="hasReceipt" className="text-gray-700">
          يوجد فاتورة الشراء الأصلية
        </label>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Info className="w-4 h-4 inline ml-1" />
          ملاحظات إضافية
        </label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="أي تفاصيل إضافية تريد ذكرها..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
        />
      </div>
    </div>
  );
}
