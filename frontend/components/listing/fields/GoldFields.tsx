'use client';

import { Gem, Scale, Sparkles } from 'lucide-react';

const GOLD_KARATS = [
  { value: '24', label: 'عيار 24' },
  { value: '22', label: 'عيار 22' },
  { value: '21', label: 'عيار 21' },
  { value: '18', label: 'عيار 18' },
  { value: '14', label: 'عيار 14' }
];

const GOLD_CATEGORIES = [
  { value: 'JEWELRY', label: 'مجوهرات' },
  { value: 'COINS', label: 'عملات ذهبية' },
  { value: 'BARS', label: 'سبائك' },
  { value: 'ANTIQUE', label: 'تحف وأنتيكات' },
  { value: 'ACCESSORIES', label: 'إكسسوارات' }
];

const JEWELRY_TYPES = [
  { value: 'RING', label: 'خاتم' },
  { value: 'NECKLACE', label: 'سلسلة' },
  { value: 'BRACELET', label: 'سوار/إسورة' },
  { value: 'EARRINGS', label: 'حلق' },
  { value: 'PENDANT', label: 'تعليقة' },
  { value: 'ANKLET', label: 'خلخال' },
  { value: 'SET', label: 'طقم كامل' },
  { value: 'OTHER', label: 'أخرى' }
];

const GOLD_CONDITIONS = [
  { value: 'NEW', label: 'جديد' },
  { value: 'LIKE_NEW', label: 'كالجديد' },
  { value: 'EXCELLENT', label: 'ممتاز' },
  { value: 'GOOD', label: 'جيد' },
  { value: 'FAIR', label: 'مقبول' }
];

interface GoldFieldsProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function GoldFields({ data, onChange }: GoldFieldsProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="space-y-6">
      {/* Gold Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Gem className="w-4 h-4 inline ml-1" />
          نوع الذهب <span className="text-red-500">*</span>
        </label>
        <select
          value={data.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
        >
          <option value="">اختر النوع</option>
          {GOLD_CATEGORIES.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Jewelry Type - only shown for JEWELRY category */}
      {data.category === 'JEWELRY' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            نوع المجوهرات
          </label>
          <select
            value={data.jewelryType || ''}
            onChange={(e) => handleChange('jewelryType', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="">اختر</option>
            {JEWELRY_TYPES.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </div>
      )}

      {/* Karat & Weight */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Sparkles className="w-4 h-4 inline ml-1" />
            العيار <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {GOLD_KARATS.map(karat => (
              <button
                key={karat.value}
                type="button"
                onClick={() => handleChange('karat', karat.value)}
                className={`px-4 py-2 rounded-xl border-2 font-medium transition-all ${
                  data.karat === karat.value
                    ? 'border-amber-500 bg-amber-50 text-amber-700'
                    : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                {karat.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Scale className="w-4 h-4 inline ml-1" />
            الوزن (جرام) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            step="0.01"
            value={data.weightGrams || ''}
            onChange={(e) => handleChange('weightGrams', e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الحالة <span className="text-red-500">*</span>
        </label>
        <select
          value={data.condition || ''}
          onChange={(e) => handleChange('condition', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
        >
          <option value="">اختر الحالة</option>
          {GOLD_CONDITIONS.map(cond => (
            <option key={cond.value} value={cond.value}>{cond.label}</option>
          ))}
        </select>
      </div>

      {/* Stones & Gems */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الأحجار الكريمة (إن وجدت)
        </label>
        <input
          type="text"
          value={data.stones || ''}
          onChange={(e) => handleChange('stones', e.target.value)}
          placeholder="مثال: ألماس، زمرد، ياقوت..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Certificate */}
      <div className="flex items-center gap-3 p-4 bg-amber-50 rounded-xl">
        <input
          type="checkbox"
          id="hasCertificate"
          checked={data.hasCertificate || false}
          onChange={(e) => handleChange('hasCertificate', e.target.checked)}
          className="w-5 h-5 text-amber-600 rounded focus:ring-amber-500"
        />
        <label htmlFor="hasCertificate" className="text-gray-700">
          يوجد شهادة/فاتورة من محل موثوق
        </label>
      </div>

      {/* Brand/Maker */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الماركة/الصانع (اختياري)
        </label>
        <input
          type="text"
          value={data.brand || ''}
          onChange={(e) => handleChange('brand', e.target.value)}
          placeholder="مثال: لازوردي، داماس..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ملاحظات إضافية
        </label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="أي تفاصيل إضافية عن القطعة..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
        />
      </div>
    </div>
  );
}
