'use client';

import { useState } from 'react';
import { Calendar, Clock, DollarSign, RefreshCw, Tag } from 'lucide-react';
import { TransactionType, TRANSACTION_TYPES } from '@/types/listing';

interface TransactionStepProps {
  selectedType: TransactionType | null;
  onSelect: (type: TransactionType) => void;
  pricingData: Record<string, any>;
  auctionData: Record<string, any>;
  barterData: Record<string, any>;
  onPricingChange: (data: Record<string, any>) => void;
  onAuctionChange: (data: Record<string, any>) => void;
  onBarterChange: (data: Record<string, any>) => void;
}

export default function TransactionStep({
  selectedType,
  onSelect,
  pricingData,
  auctionData,
  barterData,
  onPricingChange,
  onAuctionChange,
  onBarterChange
}: TransactionStepProps) {
  // Group transaction types
  const sellingTypes = TRANSACTION_TYPES.filter(t => t.isSelling);
  const buyingTypes = TRANSACTION_TYPES.filter(t => !t.isSelling);

  // Render pricing fields for direct sale/purchase
  const renderDirectPricingFields = () => (
    <div className="space-y-4 mt-6 p-6 bg-gray-50 rounded-xl">
      <h4 className="font-bold text-gray-900 flex items-center gap-2">
        <DollarSign className="w-5 h-5 text-green-600" />
        تحديد السعر
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            السعر (ج.م) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={pricingData.price || ''}
            onChange={(e) => onPricingChange({ ...pricingData, price: e.target.value })}
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={pricingData.negotiable || false}
              onChange={(e) => onPricingChange({ ...pricingData, negotiable: e.target.checked })}
              className="w-5 h-5 text-indigo-600 rounded"
            />
            <span className="text-gray-700">قابل للتفاوض</span>
          </label>
        </div>
      </div>
    </div>
  );

  // Render auction fields
  const renderAuctionFields = () => (
    <div className="space-y-4 mt-6 p-6 bg-amber-50 rounded-xl">
      <h4 className="font-bold text-gray-900 flex items-center gap-2">
        <Tag className="w-5 h-5 text-amber-600" />
        إعدادات المزاد
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            سعر البداية (ج.م) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={auctionData.startingPrice || ''}
            onChange={(e) => onAuctionChange({ ...auctionData, startingPrice: e.target.value })}
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            السعر الاحتياطي (اختياري)
          </label>
          <input
            type="number"
            value={auctionData.reservePrice || ''}
            onChange={(e) => onAuctionChange({ ...auctionData, reservePrice: e.target.value })}
            placeholder="الحد الأدنى للبيع"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            سعر الشراء الفوري (اختياري)
          </label>
          <input
            type="number"
            value={auctionData.buyNowPrice || ''}
            onChange={(e) => onAuctionChange({ ...auctionData, buyNowPrice: e.target.value })}
            placeholder="للشراء مباشرة بدون مزايدة"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مدة المزاد <span className="text-red-500">*</span>
          </label>
          <select
            value={auctionData.duration || '7'}
            onChange={(e) => onAuctionChange({ ...auctionData, duration: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 bg-white"
          >
            <option value="1">يوم واحد</option>
            <option value="3">3 أيام</option>
            <option value="5">5 أيام</option>
            <option value="7">أسبوع</option>
            <option value="14">أسبوعين</option>
          </select>
        </div>
      </div>

      <div className="p-3 bg-amber-100 rounded-lg text-sm text-amber-800">
        💡 <strong>نصيحة:</strong> السعر الاحتياطي يضمن عدم بيع المنتج بأقل من المبلغ المحدد
      </div>
    </div>
  );

  // Render barter fields
  const renderBarterFields = () => (
    <div className="space-y-4 mt-6 p-6 bg-purple-50 rounded-xl">
      <h4 className="font-bold text-gray-900 flex items-center gap-2">
        <RefreshCw className="w-5 h-5 text-purple-600" />
        تفضيلات المقايضة
      </h4>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          ماذا تريد مقابل منتجك؟
        </label>
        <textarea
          value={barterData.preferences || ''}
          onChange={(e) => onBarterChange({ ...barterData, preferences: e.target.value })}
          placeholder="مثال: أريد iPhone 15 أو Samsung S24 أو سيارة موديل 2020+"
          rows={3}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={barterData.acceptsCashDifference || false}
            onChange={(e) => onBarterChange({ ...barterData, acceptsCashDifference: e.target.checked })}
            className="w-5 h-5 text-purple-600 rounded"
          />
          <span className="text-gray-700">أقبل فرق نقدي</span>
        </label>
      </div>

      {barterData.acceptsCashDifference && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الحد الأقصى للفرق النقدي (ج.م)
          </label>
          <input
            type="number"
            value={barterData.maxCashDifference || ''}
            onChange={(e) => onBarterChange({ ...barterData, maxCashDifference: e.target.value })}
            placeholder="0"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
          />
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          القيمة التقديرية لمنتجك (ج.م)
        </label>
        <input
          type="number"
          value={barterData.estimatedValue || ''}
          onChange={(e) => onBarterChange({ ...barterData, estimatedValue: e.target.value })}
          placeholder="لمساعدة الآخرين في تقديم عروض مناسبة"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500"
        />
      </div>
    </div>
  );

  // Render reverse auction fields
  const renderReverseAuctionFields = () => (
    <div className="space-y-4 mt-6 p-6 bg-blue-50 rounded-xl">
      <h4 className="font-bold text-gray-900 flex items-center gap-2">
        <Tag className="w-5 h-5 text-blue-600" />
        إعدادات المناقصة
      </h4>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            الميزانية القصوى (ج.م) <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            value={pricingData.maxPrice || ''}
            onChange={(e) => onPricingChange({ ...pricingData, maxPrice: e.target.value })}
            placeholder="أقصى مبلغ مستعد لدفعه"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            مدة استقبال العروض <span className="text-red-500">*</span>
          </label>
          <select
            value={auctionData.duration || '7'}
            onChange={(e) => onAuctionChange({ ...auctionData, duration: e.target.value })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="1">يوم واحد</option>
            <option value="3">3 أيام</option>
            <option value="5">5 أيام</option>
            <option value="7">أسبوع</option>
            <option value="14">أسبوعين</option>
          </select>
        </div>
      </div>

      <div className="p-3 bg-blue-100 rounded-lg text-sm text-blue-800">
        💡 <strong>كيف تعمل المناقصة:</strong> ستستقبل عروض من البائعين وتختار أفضل عرض
      </div>
    </div>
  );

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">كيف تريد إتمام المعاملة؟</h2>
      <p className="text-gray-600 mb-8">اختر الطريقة المناسبة لك</p>

      {/* Selling Options */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">أريد بيع</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sellingTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`relative p-5 rounded-xl border-2 transition-all text-right ${
                selectedType === type.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              {selectedType === type.id && (
                <div className="absolute top-2 left-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className="text-3xl block mb-2">{type.icon}</span>
              <h4 className="font-bold text-gray-900">{type.nameAr}</h4>
              <p className="text-xs text-gray-500 mt-1">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Buying Options */}
      <div className="mb-8">
        <h3 className="text-lg font-bold text-gray-800 mb-4">أريد شراء</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {buyingTypes.map((type) => (
            <button
              key={type.id}
              onClick={() => onSelect(type.id)}
              className={`relative p-5 rounded-xl border-2 transition-all text-right ${
                selectedType === type.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              {selectedType === type.id && (
                <div className="absolute top-2 left-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <span className="text-3xl block mb-2">{type.icon}</span>
              <h4 className="font-bold text-gray-900">{type.nameAr}</h4>
              <p className="text-xs text-gray-500 mt-1">{type.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Type-specific fields */}
      {selectedType === 'DIRECT_SALE' && renderDirectPricingFields()}
      {selectedType === 'DIRECT_PURCHASE' && renderDirectPricingFields()}
      {selectedType === 'AUCTION' && renderAuctionFields()}
      {selectedType === 'REVERSE_AUCTION' && renderReverseAuctionFields()}
      {selectedType === 'BARTER' && renderBarterFields()}
    </div>
  );
}
