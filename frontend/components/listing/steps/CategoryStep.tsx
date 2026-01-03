'use client';

import { ListingCategory, LISTING_CATEGORIES } from '@/types/listing';

interface CategoryStepProps {
  selectedCategory: ListingCategory | null;
  onSelect: (category: ListingCategory) => void;
}

export default function CategoryStep({ selectedCategory, onSelect }: CategoryStepProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">ما نوع المنتج؟</h2>
      <p className="text-gray-600 mb-8">اختر الفئة المناسبة لمنتجك</p>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {LISTING_CATEGORIES.map((category) => (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`relative p-6 rounded-2xl border-2 transition-all text-center hover:shadow-lg ${
              selectedCategory === category.id
                ? 'border-indigo-500 bg-indigo-50 shadow-md'
                : 'border-gray-200 bg-white hover:border-indigo-300'
            }`}
          >
            {/* Selection indicator */}
            {selectedCategory === category.id && (
              <div className="absolute top-2 left-2 w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}

            {/* Icon */}
            <div className="text-5xl mb-3">{category.icon}</div>

            {/* Name */}
            <h3 className="font-bold text-gray-900 mb-1">{category.nameAr}</h3>

            {/* Description */}
            <p className="text-xs text-gray-500">{category.description}</p>
          </button>
        ))}
      </div>

      {/* Hint */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700">
          💡 <strong>نصيحة:</strong> اختيار الفئة الصحيحة يساعد المشترين في العثور على منتجك بسهولة
        </p>
      </div>
    </div>
  );
}
