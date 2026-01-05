'use client';

import { Crown, Watch, ShoppingBag, Glasses, Diamond, Shirt } from 'lucide-react';

const LUXURY_CATEGORIES = [
  { value: 'WATCHES', label: 'ساعات', icon: '⌚' },
  { value: 'BAGS', label: 'حقائب', icon: '👜' },
  { value: 'JEWELRY', label: 'مجوهرات فاخرة', icon: '💎' },
  { value: 'SHOES', label: 'أحذية', icon: '👞' },
  { value: 'ACCESSORIES', label: 'إكسسوارات', icon: '🕶️' },
  { value: 'CLOTHING', label: 'ملابس', icon: '👔' },
  { value: 'PENS', label: 'أقلام', icon: '🖊️' },
  { value: 'OTHER', label: 'أخرى', icon: '✨' }
];

const WATCH_BRANDS = [
  'Rolex', 'Omega', 'Cartier', 'Patek Philippe', 'Audemars Piguet',
  'Tag Heuer', 'Breitling', 'IWC', 'Panerai', 'Hublot',
  'Longines', 'Tissot', 'Richard Mille', 'أخرى'
];

const BAG_BRANDS = [
  'Louis Vuitton', 'Hermès', 'Chanel', 'Gucci', 'Prada',
  'Dior', 'Fendi', 'Bottega Veneta', 'Saint Laurent', 'Celine',
  'Balenciaga', 'Givenchy', 'Coach', 'Michael Kors', 'أخرى'
];

const CONDITIONS = [
  { value: 'NEW', label: 'جديد بالعلبة' },
  { value: 'LIKE_NEW', label: 'كالجديد' },
  { value: 'EXCELLENT', label: 'ممتاز' },
  { value: 'VERY_GOOD', label: 'جيد جداً' },
  { value: 'GOOD', label: 'جيد' },
  { value: 'FAIR', label: 'مقبول' }
];

interface LuxuryFieldsProps {
  data: Record<string, any>;
  onChange: (data: Record<string, any>) => void;
}

export default function LuxuryFields({ data, onChange }: LuxuryFieldsProps) {
  const handleChange = (field: string, value: any) => {
    onChange({ ...data, [field]: value });
  };

  const getBrandOptions = () => {
    switch (data.luxuryCategory) {
      case 'WATCHES':
        return WATCH_BRANDS;
      case 'BAGS':
      case 'SHOES':
      case 'CLOTHING':
        return BAG_BRANDS;
      default:
        return [...WATCH_BRANDS, ...BAG_BRANDS].filter((v, i, a) => a.indexOf(v) === i).sort();
    }
  };

  return (
    <div className="space-y-6">
      {/* Luxury Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <Crown className="w-4 h-4 inline ml-1" />
          نوع المنتج الفاخر <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {LUXURY_CATEGORIES.map(cat => (
            <button
              key={cat.value}
              type="button"
              onClick={() => handleChange('luxuryCategory', cat.value)}
              className={`p-3 rounded-xl border-2 text-center transition-all ${
                data.luxuryCategory === cat.value
                  ? 'border-purple-500 bg-purple-50 text-purple-700'
                  : 'border-gray-200 hover:border-purple-300'
              }`}
            >
              <span className="text-2xl block mb-1">{cat.icon}</span>
              <span className="text-sm font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الماركة <span className="text-red-500">*</span>
        </label>
        <select
          value={data.brand || ''}
          onChange={(e) => handleChange('brand', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
        >
          <option value="">اختر الماركة</option>
          {getBrandOptions().map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
        </select>
      </div>

      {/* Custom Brand - if "أخرى" selected */}
      {data.brand === 'أخرى' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم الماركة
          </label>
          <input
            type="text"
            value={data.customBrand || ''}
            onChange={(e) => handleChange('customBrand', e.target.value)}
            placeholder="أدخل اسم الماركة"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}

      {/* Model */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الموديل/الاسم
        </label>
        <input
          type="text"
          value={data.model || ''}
          onChange={(e) => handleChange('model', e.target.value)}
          placeholder="مثال: Submariner, Neverfull MM..."
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Condition */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الحالة <span className="text-red-500">*</span>
        </label>
        <select
          value={data.condition || ''}
          onChange={(e) => handleChange('condition', e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
        >
          <option value="">اختر الحالة</option>
          {CONDITIONS.map(cond => (
            <option key={cond.value} value={cond.value}>{cond.label}</option>
          ))}
        </select>
      </div>

      {/* Watch-specific fields */}
      {data.luxuryCategory === 'WATCHES' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                قطر العلبة (مم)
              </label>
              <input
                type="number"
                value={data.caseDiameter || ''}
                onChange={(e) => handleChange('caseDiameter', e.target.value)}
                placeholder="مثال: 40"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                نوع الحركة
              </label>
              <select
                value={data.movement || ''}
                onChange={(e) => handleChange('movement', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 bg-white"
              >
                <option value="">اختر</option>
                <option value="AUTOMATIC">أوتوماتيك</option>
                <option value="MANUAL">يدوي</option>
                <option value="QUARTZ">كوارتز</option>
              </select>
            </div>
          </div>
        </>
      )}

      {/* Bag/Shoes specific fields */}
      {(data.luxuryCategory === 'BAGS' || data.luxuryCategory === 'SHOES') && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                اللون
              </label>
              <input
                type="text"
                value={data.color || ''}
                onChange={(e) => handleChange('color', e.target.value)}
                placeholder="مثال: أسود، بني، بيج..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الخامة
              </label>
              <input
                type="text"
                value={data.material || ''}
                onChange={(e) => handleChange('material', e.target.value)}
                placeholder="مثال: جلد طبيعي، كانفاس..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {data.luxuryCategory === 'SHOES' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المقاس
              </label>
              <input
                type="text"
                value={data.size || ''}
                onChange={(e) => handleChange('size', e.target.value)}
                placeholder="مثال: 42 EU, 9 US..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}
        </>
      )}

      {/* Authenticity */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          الأصالة والتوثيق
        </label>

        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
          <input
            type="checkbox"
            id="hasBox"
            checked={data.hasBox || false}
            onChange={(e) => handleChange('hasBox', e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="hasBox" className="text-gray-700">
            يوجد العلبة الأصلية
          </label>
        </div>

        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
          <input
            type="checkbox"
            id="hasPapers"
            checked={data.hasPapers || false}
            onChange={(e) => handleChange('hasPapers', e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="hasPapers" className="text-gray-700">
            يوجد شهادة الضمان/الأوراق الأصلية
          </label>
        </div>

        <div className="flex items-center gap-3 p-4 bg-purple-50 rounded-xl">
          <input
            type="checkbox"
            id="hasReceipt"
            checked={data.hasReceipt || false}
            onChange={(e) => handleChange('hasReceipt', e.target.checked)}
            className="w-5 h-5 text-purple-600 rounded focus:ring-purple-500"
          />
          <label htmlFor="hasReceipt" className="text-gray-700">
            يوجد فاتورة الشراء
          </label>
        </div>
      </div>

      {/* Serial Number */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          الرقم التسلسلي (اختياري)
        </label>
        <input
          type="text"
          value={data.serialNumber || ''}
          onChange={(e) => handleChange('serialNumber', e.target.value)}
          placeholder="للتحقق من الأصالة"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
        />
        <p className="text-xs text-gray-500 mt-1">
          سيظهر فقط للمشترين الجادين بعد الموافقة
        </p>
      </div>

      {/* Additional Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ملاحظات إضافية
        </label>
        <textarea
          value={data.notes || ''}
          onChange={(e) => handleChange('notes', e.target.value)}
          placeholder="أي تفاصيل إضافية عن المنتج..."
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  );
}
