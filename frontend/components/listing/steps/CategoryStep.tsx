'use client';

import { useState, useEffect } from 'react';
import { ListingCategory, LISTING_CATEGORIES } from '@/types/listing';
import { getRootCategories, Category } from '@/lib/api/categories';
import { Loader2 } from 'lucide-react';

interface CategoryStepProps {
  selectedCategory: ListingCategory | null;
  onSelect: (category: ListingCategory) => void;
  onCategoryIdSelect?: (categoryId: string) => void;
  selectedCategoryId?: string;
}

export default function CategoryStep({
  selectedCategory,
  onSelect,
  onCategoryIdSelect,
  selectedCategoryId
}: CategoryStepProps) {
  // Backend categories (3-level hierarchy)
  const [categories, setCategories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Form state for 3-level selection
  const [categoryLevel1, setCategoryLevel1] = useState('');
  const [categoryLevel2, setCategoryLevel2] = useState('');
  const [categoryLevel3, setCategoryLevel3] = useState('');

  // Load categories from backend
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const response = await getRootCategories();
        setCategories(response.data || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Load level 2 categories when level 1 changes
  useEffect(() => {
    if (categoryLevel1) {
      const parentCategory = categories.find(c => c.id === categoryLevel1);
      if (parentCategory?.children) {
        setLevel2Categories(parentCategory.children);
      } else {
        setLevel2Categories([]);
      }

      setLevel3Categories([]);
      setCategoryLevel2('');
      setCategoryLevel3('');

      // Notify parent of category selection
      if (onCategoryIdSelect) {
        onCategoryIdSelect(categoryLevel1);
      }

      // Map to simple category type
      mapToSimpleCategory(parentCategory);
    } else {
      setLevel2Categories([]);
      setLevel3Categories([]);
    }
  }, [categoryLevel1, categories]);

  // Load level 3 categories when level 2 changes
  useEffect(() => {
    if (categoryLevel2) {
      const level2Category = level2Categories.find(c => c.id === categoryLevel2);
      if (level2Category?.children) {
        setLevel3Categories(level2Category.children);
      } else {
        setLevel3Categories([]);
      }

      setCategoryLevel3('');
      if (onCategoryIdSelect) {
        onCategoryIdSelect(categoryLevel2);
      }
    } else {
      setLevel3Categories([]);
    }
  }, [categoryLevel2, level2Categories]);

  // Update selected category when level 3 changes
  useEffect(() => {
    if (categoryLevel3 && onCategoryIdSelect) {
      onCategoryIdSelect(categoryLevel3);
    }
  }, [categoryLevel3]);

  // Map backend category to simple ListingCategory type
  const mapToSimpleCategory = (category: Category | undefined) => {
    if (!category) return;

    const nameEn = category.nameEn?.toLowerCase() || '';
    const nameAr = category.nameAr || '';

    if (nameEn.includes('mobile') || nameEn.includes('phone') || nameAr.includes('موبايل') || nameAr.includes('هاتف')) {
      onSelect('MOBILE');
    } else if (nameEn.includes('vehicle') || nameEn.includes('car') || nameAr.includes('سيار') || nameAr.includes('مركب')) {
      onSelect('CAR');
    } else if (nameEn.includes('real') || nameEn.includes('property') || nameAr.includes('عقار') || nameAr.includes('شق')) {
      onSelect('PROPERTY');
    } else if (nameEn.includes('gold') || nameEn.includes('jewel') || nameAr.includes('ذهب') || nameAr.includes('مجوهر')) {
      onSelect('GOLD');
    } else if (nameEn.includes('luxury') || nameEn.includes('watch') || nameAr.includes('فاخر') || nameAr.includes('ساعة')) {
      onSelect('LUXURY');
    } else if (nameEn.includes('scrap') || nameEn.includes('metal') || nameAr.includes('خردة') || nameAr.includes('سكراب')) {
      onSelect('SCRAP');
    } else {
      onSelect('GENERAL');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">ما نوع المنتج؟</h2>
      <p className="text-gray-600 mb-6">اختر الفئة المناسبة لمنتجك</p>

      {/* Bulk Import Banner */}
      <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <span className="text-2xl">📦</span>
            <div>
              <h3 className="font-semibold text-purple-900 text-sm">
                هل لديك منتجات كثيرة؟
              </h3>
              <p className="text-xs text-purple-700">
                استخدم الاستيراد الجماعي لإضافة عدة منتجات دفعة واحدة
              </p>
            </div>
          </div>
          <a
            href="/inventory/bulk-import"
            className="px-4 py-2 bg-purple-600 text-white rounded-lg font-medium text-sm hover:bg-purple-700 transition-colors flex items-center gap-2"
          >
            <span>📥</span>
            استيراد جماعي
          </a>
        </div>
      </div>

      {/* 3-Level Category Selection */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">اختر الفئة التفصيلية</h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Level 1 - Main Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة الرئيسية <span className="text-red-500">*</span>
              </label>
              <select
                value={categoryLevel1}
                onChange={(e) => setCategoryLevel1(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white"
              >
                <option value="">اختر الفئة</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameAr || cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 2 - Sub Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة الفرعية
              </label>
              <select
                value={categoryLevel2}
                onChange={(e) => setCategoryLevel2(e.target.value)}
                disabled={!categoryLevel1 || level2Categories.length === 0}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!categoryLevel1 ? 'اختر الفئة الرئيسية أولاً' : level2Categories.length === 0 ? 'لا توجد فئات فرعية' : 'اختر الفئة الفرعية'}
                </option>
                {level2Categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameAr || cat.nameEn}
                  </option>
                ))}
              </select>
            </div>

            {/* Level 3 - Sub-Sub Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                الفئة الفرع-فرعية
              </label>
              <select
                value={categoryLevel3}
                onChange={(e) => setCategoryLevel3(e.target.value)}
                disabled={!categoryLevel2 || level3Categories.length === 0}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="">
                  {!categoryLevel2 ? 'اختر الفئة الفرعية أولاً' : level3Categories.length === 0 ? 'لا توجد فئات فرع-فرعية' : 'اختر الفئة الفرع-فرعية'}
                </option>
                {level3Categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.nameAr || cat.nameEn}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Quick Category Selection (Visual Grid) */}
      <div className="mt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">أو اختر من الفئات السريعة</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {LISTING_CATEGORIES.map((category) => (
            <button
              key={category.id}
              onClick={() => {
                onSelect(category.id);
                // Try to find matching category in backend categories
                const matchingCat = categories.find(c => {
                  const nameEn = c.nameEn?.toLowerCase() || '';
                  const nameAr = c.nameAr || '';
                  return nameEn.includes(category.nameEn.toLowerCase()) ||
                         nameAr.includes(category.nameAr);
                });
                if (matchingCat) {
                  setCategoryLevel1(matchingCat.id);
                  if (onCategoryIdSelect) {
                    onCategoryIdSelect(matchingCat.id);
                  }
                }
              }}
              className={`relative p-4 rounded-2xl border-2 transition-all text-center hover:shadow-lg ${
                selectedCategory === category.id
                  ? 'border-indigo-500 bg-indigo-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-indigo-300'
              }`}
            >
              {selectedCategory === category.id && (
                <div className="absolute top-2 left-2 w-5 h-5 bg-indigo-500 rounded-full flex items-center justify-center">
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}
              <div className="text-4xl mb-2">{category.icon}</div>
              <h3 className="font-bold text-gray-900 text-sm">{category.nameAr}</h3>
              <p className="text-xs text-gray-500 mt-1">{category.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Hint */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700">
          💡 <strong>نصيحة:</strong> اختر الفئة التفصيلية من القوائم المنسدلة للوصول لأكبر عدد من المشترين
        </p>
      </div>
    </div>
  );
}
