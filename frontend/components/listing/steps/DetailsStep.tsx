'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Upload, X, MapPin, Navigation, Loader2, Sparkles } from 'lucide-react';
import { ListingCategory, CommonFields, LISTING_CATEGORIES } from '@/types/listing';
import { useAuth } from '@/lib/contexts/AuthContext';
import { categorizeItem, CategorySuggestion as CategorySuggestionType } from '@/lib/api/ai';
import { CategorySuggestion } from '@/components/ai';
import { getRootCategories, Category } from '@/lib/api/categories';

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Category-specific field components
import MobileFields from '../fields/MobileFields';
import CarFields from '../fields/CarFields';
import PropertyFields from '../fields/PropertyFields';
import GoldFields from '../fields/GoldFields';
import LuxuryFields from '../fields/LuxuryFields';
import GeneralFields from '../fields/GeneralFields';
import PropertyLocationPicker from '@/components/PropertyLocationPicker';

// Egyptian Governorates
const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحيرة',
  'الشرقية', 'المنوفية', 'الغربية', 'كفر الشيخ', 'الفيوم',
  'بني سويف', 'المنيا', 'أسيوط', 'سوهاج', 'قنا',
  'أسوان', 'الأقصر', 'البحر الأحمر', 'الوادي الجديد', 'مطروح',
  'شمال سيناء', 'جنوب سيناء', 'بورسعيد', 'السويس', 'الإسماعيلية',
  'دمياط', 'القليوبية'
];

interface DetailsStepProps {
  category: ListingCategory;
  formData: Partial<CommonFields>;
  categoryData: Record<string, any>;
  onFormDataChange: (data: Partial<CommonFields>) => void;
  onCategoryDataChange: (data: Record<string, any>) => void;
  onCategoryChange?: (category: ListingCategory) => void;
}

export default function DetailsStep({
  category,
  formData,
  categoryData,
  onFormDataChange,
  onCategoryDataChange,
  onCategoryChange
}: DetailsStepProps) {
  const [dragActive, setDragActive] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestionType[]>([]);
  const { user } = useAuth();

  // 3-Level Category Selection State - Initialize from categoryData if available
  const [categories, setCategories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);
  const [categoryLevel1, setCategoryLevel1] = useState(categoryData?.categoryLevel1 || '');
  const [categoryLevel2, setCategoryLevel2] = useState(categoryData?.categoryLevel2 || '');
  const [categoryLevel3, setCategoryLevel3] = useState(categoryData?.categoryLevel3 || '');
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // Ref to track if AI is auto-populating (to prevent useEffect from clearing values)
  const isAIPopulating = useRef(false);

  const categoryInfo = LISTING_CATEGORIES.find(c => c.id === category);

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
        setCategoriesLoading(false);
      }
    };
    loadCategories();
  }, []);

  // Auto-select mobile category when on mobile listing page
  useEffect(() => {
    if (category === 'MOBILE' && categories.length > 0 && !categoryLevel1) {
      // Find the "الموبايلات" or "Mobiles" category
      const mobileCategory = categories.find(c =>
        c.slug === 'mobiles' ||
        c.nameAr === 'الموبايلات' ||
        c.nameEn?.toLowerCase() === 'mobiles'
      );
      if (mobileCategory) {
        setCategoryLevel1(mobileCategory.id);
        if (mobileCategory.children) {
          setLevel2Categories(mobileCategory.children);
        }
      }
    }
  }, [category, categories, categoryLevel1]);

  // Auto-select property category when on property listing page
  useEffect(() => {
    if (category === 'PROPERTY' && categories.length > 0 && !categoryLevel1) {
      // Find the "العقارات" or "Properties" category
      const propertyCategory = categories.find(c =>
        c.slug === 'properties' ||
        c.slug === 'real-estate' ||
        c.nameAr === 'العقارات' ||
        c.nameEn?.toLowerCase() === 'properties' ||
        c.nameEn?.toLowerCase() === 'real estate'
      );
      if (propertyCategory) {
        setCategoryLevel1(propertyCategory.id);
        if (propertyCategory.children) {
          setLevel2Categories(propertyCategory.children);
        }
      }
    }
  }, [category, categories, categoryLevel1]);

  // Load level 2 categories when level 1 changes (manual selection only)
  useEffect(() => {
    if (categoryLevel1) {
      const parentCategory = categories.find(c => c.id === categoryLevel1);
      if (parentCategory?.children) {
        setLevel2Categories(parentCategory.children);
      } else {
        setLevel2Categories([]);
      }
      // Only clear level2/level3 if NOT being auto-populated by AI
      if (!isAIPopulating.current) {
        setLevel3Categories([]);
        setCategoryLevel2('');
        setCategoryLevel3('');
      }
    } else {
      setLevel2Categories([]);
      setLevel3Categories([]);
    }
  }, [categoryLevel1, categories]);

  // Load level 3 categories when level 2 changes (manual selection only)
  useEffect(() => {
    if (categoryLevel2) {
      const level2Category = level2Categories.find(c => c.id === categoryLevel2);
      if (level2Category?.children) {
        setLevel3Categories(level2Category.children);
      } else {
        setLevel3Categories([]);
      }
      // Only clear level3 if NOT being auto-populated by AI
      if (!isAIPopulating.current) {
        setCategoryLevel3('');
      }
    } else {
      setLevel3Categories([]);
    }
  }, [categoryLevel2, level2Categories]);

  // Save category levels to categoryData whenever they change (including names for mobile)
  useEffect(() => {
    if (categoryLevel1 || categoryLevel2 || categoryLevel3) {
      // Find category names for mobile listings (brand/model)
      const level1Category = categories.find(c => c.id === categoryLevel1);
      const level2Category = level2Categories.find(c => c.id === categoryLevel2);
      const level3Category = level3Categories.find(c => c.id === categoryLevel3);

      onCategoryDataChange({
        ...categoryData,
        categoryLevel1,
        categoryLevel2,
        categoryLevel3,
        // Save names for mobile brand/model extraction
        categoryLevel1Name: level1Category?.nameEn || level1Category?.nameAr || '',
        categoryLevel2Name: level2Category?.nameEn || level2Category?.nameAr || '',
        categoryLevel3Name: level3Category?.nameEn || level3Category?.nameAr || '',
        // Save Arabic names too
        categoryLevel2NameAr: level2Category?.nameAr || '',
        categoryLevel3NameAr: level3Category?.nameAr || '',
      });
    }
  }, [categoryLevel1, categoryLevel2, categoryLevel3, categories, level2Categories, level3Categories]);

  // Restore level2/level3 categories from saved state when categories are loaded
  useEffect(() => {
    if (categories.length > 0 && categoryData?.categoryLevel1) {
      const level1Category = categories.find(c => c.id === categoryData.categoryLevel1);
      if (level1Category?.children) {
        setLevel2Categories(level1Category.children);

        if (categoryData?.categoryLevel2) {
          const level2Category = level1Category.children.find(c => c.id === categoryData.categoryLevel2);
          if (level2Category?.children) {
            setLevel3Categories(level2Category.children);
          }
        }
      }
    }
  }, [categories, categoryData?.categoryLevel1, categoryData?.categoryLevel2]);

  // Debounce title for AI categorization
  const debouncedTitle = useDebounce(formData.title || '', 1000);

  // Helper function to find category path in tree
  // Searches by id, slug, or name to handle various AI response formats
  const findCategoryPath = (cats: Category[], target: string, path: Category[] = []): Category[] | null => {
    const targetLower = target.toLowerCase();

    for (const cat of cats) {
      // Match by id, slug, or normalized name
      const isMatch =
        cat.id === target ||
        cat.slug === target ||
        cat.slug === targetLower ||
        cat.nameEn?.toLowerCase() === targetLower ||
        cat.nameAr === target;

      if (isMatch) {
        return [...path, cat];
      }
      if (cat.children) {
        const found = findCategoryPath(cat.children, target, [...path, cat]);
        if (found) return found;
      }
    }
    return null;
  };

  // Auto-populate category dropdowns from AI result
  const autoPopulateCategoryFromAI = (categoryId: string, categoryName?: string, parentCategoryName?: string) => {
    // Try to find category by ID first, then by name if that fails
    let categoryPath = findCategoryPath(categories, categoryId);

    // If not found by ID, try by name
    if (!categoryPath && categoryName) {
      categoryPath = findCategoryPath(categories, categoryName);
    }

    // If still not found and we have parent info, try to find parent + child
    if (!categoryPath && parentCategoryName && categoryName) {
      // Find parent first
      const parentPath = findCategoryPath(categories, parentCategoryName);
      if (parentPath && parentPath.length > 0) {
        const parentCat = parentPath[parentPath.length - 1];
        if (parentCat.children) {
          // Find child within parent
          const childCat = parentCat.children.find(c =>
            c.nameEn?.toLowerCase() === categoryName.toLowerCase() ||
            c.nameAr === categoryName ||
            c.slug === categoryId.toLowerCase()
          );
          if (childCat) {
            categoryPath = [...parentPath, childCat];
          }
        }
      }
    }

    if (categoryPath && categoryPath.length > 0) {
      const level1Id = categoryPath[0]?.id || '';
      const level2Id = categoryPath[1]?.id || '';
      const level3Id = categoryPath[2]?.id || '';

      // Mark as AI populating to prevent useEffect from clearing values
      isAIPopulating.current = true;

      // Populate level2 and level3 category arrays
      const level1Category = categories.find(c => c.id === level1Id);
      if (level1Category?.children) {
        setLevel2Categories(level1Category.children);

        if (level2Id) {
          const level2Category = level1Category.children.find(c => c.id === level2Id);
          if (level2Category?.children) {
            setLevel3Categories(level2Category.children);
          }
        }
      }

      // Set all selections
      setCategoryLevel1(level1Id);
      setCategoryLevel2(level2Id);
      setCategoryLevel3(level3Id);

      // Reset flag after React has processed the state updates
      // Using requestAnimationFrame to ensure it happens after useEffects run
      requestAnimationFrame(() => {
        isAIPopulating.current = false;
      });

      console.log('[AI Category] Populated path:', categoryPath.map(c => c.nameEn || c.nameAr).join(' → '));
    } else {
      console.log('[AI Category] Could not find category path for:', categoryId, categoryName);
    }
  };

  // Handle AI category selection
  const handleAICategorySelect = (suggestion: CategorySuggestionType) => {
    autoPopulateCategoryFromAI(suggestion.id, suggestion.name, suggestion.parentCategory);
    setCategorySuggestions([]); // Clear suggestions after selection
  };

  // AI Category Detection
  useEffect(() => {
    const detectCategory = async () => {
      if (!debouncedTitle || debouncedTitle.length < 5) {
        setCategorySuggestions([]);
        return;
      }

      setAiLoading(true);
      try {
        const result = await categorizeItem({
          title: debouncedTitle,
          description: formData.description || undefined
        });

        if (result && result.success && result.category) {
          // Store all suggestions (main + alternatives)
          const suggestions = [result.category, ...result.alternatives];
          setCategorySuggestions(suggestions);

          // Auto-populate category dropdowns from AI result immediately
          if (result.category.id && categories.length > 0) {
            autoPopulateCategoryFromAI(
              result.category.id,
              result.category.name,
              result.category.parentCategory
            );
          }
        } else {
          setCategorySuggestions([]);
        }
      } catch (error) {
        console.error('AI categorization error:', error);
        setCategorySuggestions([]);
      } finally {
        setAiLoading(false);
      }
    };

    detectCategory();
  }, [debouncedTitle, formData.description]);

  // Auto-populate first suggestion when categories load (if suggestions exist but not populated yet)
  useEffect(() => {
    if (categorySuggestions.length > 0 && categories.length > 0 && !categoryLevel1) {
      const firstSuggestion = categorySuggestions[0];
      autoPopulateCategoryFromAI(
        firstSuggestion.id,
        firstSuggestion.name,
        firstSuggestion.parentCategory
      );
    }
  }, [categories, categorySuggestions, categoryLevel1]);

  // Set default address from user profile (governorate, city, district, street)
  useEffect(() => {
    if (user && (user.governorate || user.city || user.district || user.street)) {
      const updates: Partial<CommonFields> = { ...formData };
      let hasUpdates = false;

      if (!formData.governorate && user.governorate) {
        updates.governorate = user.governorate;
        hasUpdates = true;
      }
      if (!formData.city && user.city) {
        updates.city = user.city;
        hasUpdates = true;
      }
      if (!formData.district && user.district) {
        updates.district = user.district;
        hasUpdates = true;
      }
      if (!formData.street && user.street) {
        updates.street = user.street;
        hasUpdates = true;
      }

      if (hasUpdates) {
        onFormDataChange(updates);
      }
    }
  }, [user]);

  // Get location from GPS
  const handleGetGpsLocation = () => {
    if (!navigator.geolocation) {
      setGpsError('المتصفح لا يدعم تحديد الموقع');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          // Use reverse geocoding to get address from coordinates
          const { latitude, longitude } = position.coords;

          // Try to get address from OpenStreetMap Nominatim
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&accept-language=ar`
          );

          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};

            // Map governorate names
            let governorate = address.state || address.county || '';

            // Try to match to our governorate list
            const matchedGov = GOVERNORATES.find(g =>
              governorate.includes(g) || g.includes(governorate.replace('محافظة ', ''))
            );

            // Extract city, district, and street from OpenStreetMap data
            const city = address.city || address.town || address.village || '';
            const district = address.suburb || address.neighbourhood || address.city_district || address.quarter || '';
            const street = address.road || address.street || '';

            // Build update object with all available location data
            const locationUpdate: Partial<CommonFields> = {
              ...formData,
              // Store coordinates for properties
              latitude: latitude,
              longitude: longitude,
            };

            if (matchedGov) {
              locationUpdate.governorate = matchedGov;
            }
            if (city) {
              locationUpdate.city = city;
            }
            if (district) {
              locationUpdate.district = district;
            }
            if (street) {
              locationUpdate.street = street;
            }

            onFormDataChange(locationUpdate);
          }
        } catch (error) {
          console.error('Error getting location:', error);
          setGpsError('فشل في تحديد الموقع');
        } finally {
          setGpsLoading(false);
        }
      },
      (error) => {
        setGpsLoading(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError('يرجى السماح بالوصول للموقع');
            break;
          case error.POSITION_UNAVAILABLE:
            setGpsError('الموقع غير متوفر');
            break;
          case error.TIMEOUT:
            setGpsError('انتهت مهلة تحديد الموقع');
            break;
          default:
            setGpsError('فشل في تحديد الموقع');
        }
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle input change
  const handleInputChange = (field: keyof CommonFields, value: any) => {
    onFormDataChange({ ...formData, [field]: value });
  };

  // Handle image upload
  const handleImageUpload = (files: FileList | null) => {
    if (!files) return;

    const currentImages = formData.images || [];
    const newImages = Array.from(files).map(file => URL.createObjectURL(file));

    onFormDataChange({
      ...formData,
      images: [...currentImages, ...newImages].slice(0, 10)
    });
  };

  // Remove image
  const removeImage = (index: number) => {
    const currentImages = formData.images || [];
    onFormDataChange({
      ...formData,
      images: currentImages.filter((_, i) => i !== index)
    });
  };

  // Handle drag events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleImageUpload(e.dataTransfer.files);
  };

  // Render category-specific fields
  const renderCategoryFields = () => {
    switch (category) {
      case 'MOBILE':
        return (
          <MobileFields
            data={categoryData}
            onChange={onCategoryDataChange}
          />
        );
      case 'CAR':
        return (
          <CarFields
            data={categoryData}
            onChange={onCategoryDataChange}
          />
        );
      case 'PROPERTY':
        return (
          <PropertyFields
            data={categoryData}
            onChange={onCategoryDataChange}
          />
        );
      case 'GOLD':
        return (
          <GoldFields
            data={categoryData}
            onChange={onCategoryDataChange}
          />
        );
      case 'LUXURY':
        return (
          <LuxuryFields
            data={categoryData}
            onChange={onCategoryDataChange}
          />
        );
      case 'SCRAP':
      case 'GENERAL':
      default:
        return (
          <GeneralFields
            data={categoryData}
            onChange={onCategoryDataChange}
          />
        );
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          بيانات {categoryInfo?.nameAr || 'المنتج'}
        </h2>
        <p className="text-gray-600">أدخل تفاصيل المنتج بدقة لجذب المشترين</p>
      </div>

      {/* Common Fields */}
      <div className="space-y-6">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            اسم السلعة/الخدمة <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title || ''}
            onChange={(e) => handleInputChange('title', e.target.value)}
            placeholder="مثال: iPhone 14 Pro Max 256GB حالة ممتازة"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            maxLength={200}
          />
          <p className="text-xs text-gray-500 mt-1">
            {(formData.title || '').length}/200 حرف
          </p>

          {/* AI Category Suggestions */}
          {aiLoading && (
            <div className="mt-3 p-3 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="flex items-center gap-2 text-purple-700 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>🤖 الذكاء الاصطناعي يحلل المنتج...</span>
              </div>
            </div>
          )}

          {/* AI Suggestions - using proper CategorySuggestion component styling */}
          {!aiLoading && categorySuggestions.length > 0 && (
            <div className="mt-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-purple-800 font-medium mb-3">
                    🤖 اقتراحات الذكاء الاصطناعي للفئة
                  </p>

                  {/* Primary Suggestion */}
                  <button
                    type="button"
                    onClick={() => handleAICategorySelect(categorySuggestions[0])}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {/* Show full path if available (Mobiles ← Samsung ← Galaxy S23) */}
                    {categorySuggestions[0].fullPath ||
                      (categorySuggestions[0].grandParentCategory ? `${categorySuggestions[0].grandParentCategory} ← ` : '') +
                      (categorySuggestions[0].parentCategory ? `${categorySuggestions[0].parentCategory} ← ` : '') +
                      categorySuggestions[0].name
                    }
                    <span className="px-2 py-0.5 bg-purple-800 rounded-full text-xs">
                      {Math.round(categorySuggestions[0].confidence * 100)}% تطابق
                    </span>
                  </button>

                  {/* Alternative Suggestions */}
                  {categorySuggestions.length > 1 && (
                    <div className="mt-3">
                      <p className="text-xs text-purple-700 mb-2">أو جرب هذه الفئات:</p>
                      <div className="space-y-1">
                        {categorySuggestions.slice(1, 4).map((alt) => (
                          <button
                            key={alt.id}
                            type="button"
                            onClick={() => handleAICategorySelect(alt)}
                            className="block w-full text-right px-3 py-1.5 bg-white border border-purple-200 hover:bg-purple-50 text-sm text-purple-700 rounded-lg transition-colors"
                          >
                            {/* Show full path for alternatives too */}
                            {alt.fullPath ||
                              (alt.grandParentCategory ? `${alt.grandParentCategory} ← ` : '') +
                              (alt.parentCategory ? `${alt.parentCategory} ← ` : '') +
                              alt.name
                            }
                            <span className="mr-2 text-xs text-purple-500">
                              ({Math.round(alt.confidence * 100)}% تطابق)
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="mt-3 text-xs text-purple-600">
                    💡 اضغط على اقتراح لتعبئة الفئة تلقائياً
                  </p>
                </div>

                {/* Close button */}
                <button
                  type="button"
                  onClick={() => setCategorySuggestions([])}
                  className="text-purple-400 hover:text-purple-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            التفاصيل <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="اكتب وصفاً تفصيلياً للمنتج، حالته، ملحقاته، سبب البيع..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* 3-Level Category Selection */}
        <div className="p-4 bg-gray-50 rounded-xl">
          <h4 className="text-sm font-bold text-gray-900 mb-4">الفئة التفصيلية</h4>
          {categoriesLoading ? (
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Level 1 - Main Category */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  الفئة الرئيسية
                </label>
                <select
                  value={categoryLevel1}
                  onChange={(e) => setCategoryLevel1(e.target.value)}
                  disabled={category === 'MOBILE' || category === 'PROPERTY'}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100"
                >
                  <option value="">اختر الفئة</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr || cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level 2 - Sub Category (Brand for mobiles, Transaction for properties) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {category === 'MOBILE' ? 'الماركة' : category === 'PROPERTY' ? 'المعاملة' : 'الفئة الفرعية'}
                </label>
                <select
                  value={categoryLevel2}
                  onChange={(e) => setCategoryLevel2(e.target.value)}
                  disabled={!categoryLevel1 || level2Categories.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!categoryLevel1 ? 'اختر الرئيسية أولاً' : level2Categories.length === 0 ? (category === 'MOBILE' ? 'لا توجد ماركات' : category === 'PROPERTY' ? 'لا توجد معاملات' : 'لا توجد فرعية') : (category === 'MOBILE' ? 'اختر الماركة' : category === 'PROPERTY' ? 'اختر المعاملة' : 'اختر الفئة')}
                  </option>
                  {level2Categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.nameAr || cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level 3 - Sub-Sub Category (Model for mobiles, Property Type for properties) */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  {category === 'MOBILE' ? 'الموديل' : category === 'PROPERTY' ? 'نوع العقار' : 'الفئة الفرع-فرعية'}
                </label>
                <select
                  value={categoryLevel3}
                  onChange={(e) => setCategoryLevel3(e.target.value)}
                  disabled={!categoryLevel2 || level3Categories.length === 0}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!categoryLevel2 ? (category === 'MOBILE' ? 'اختر الماركة أولاً' : category === 'PROPERTY' ? 'اختر المعاملة أولاً' : 'اختر الفرعية أولاً') : level3Categories.length === 0 ? (category === 'MOBILE' ? 'لا توجد موديلات' : category === 'PROPERTY' ? 'لا توجد أنواع' : 'لا توجد فرع-فرعية') : (category === 'MOBILE' ? 'اختر الموديل' : category === 'PROPERTY' ? 'اختر نوع العقار' : 'اختر الفئة')}
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
      </div>

      {/* Category-Specific Fields (only for specific categories, not GENERAL/SCRAP) */}
      {category !== 'GENERAL' && category !== 'SCRAP' && (
        <div className="border-t pt-8">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            تفاصيل {categoryInfo?.nameAr || 'المنتج'}
          </h3>
          {renderCategoryFields()}
        </div>
      )}

      {/* Images */}
      <div className="border-t pt-8">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          صور المنتج <span className="text-gray-400">(اختياري)</span>
        </label>

        {/* Drop Zone */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
            dragActive
              ? 'border-indigo-500 bg-indigo-50'
              : 'border-gray-300 hover:border-indigo-400'
          }`}
        >
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-2">اسحب الصور هنا أو</p>
          <label className="cursor-pointer">
            <span className="text-indigo-600 font-medium hover:underline">اختر من جهازك</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => handleImageUpload(e.target.files)}
              className="hidden"
            />
          </label>
          <p className="text-xs text-gray-500 mt-2">PNG, JPG حتى 10 صور (الحد الأقصى 5MB لكل صورة)</p>
        </div>

        {/* Image Preview */}
        {(formData.images || []).length > 0 && (
          <div className="grid grid-cols-4 md:grid-cols-5 gap-3 mt-4">
            {(formData.images || []).map((img, index) => (
              <div key={index} className="relative group aspect-square">
                <img
                  src={img}
                  alt={`صورة ${index + 1}`}
                  className="w-full h-full object-cover rounded-lg"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
                {index === 0 && (
                  <span className="absolute bottom-1 right-1 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded">
                    رئيسية
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Location */}
      <div className="border-t pt-8 space-y-4">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          {category === 'PROPERTY' ? 'موقع العقار' : 'العنوان'}
        </h3>

        {/* Property Map Location Section */}
        {category === 'PROPERTY' && (
          <div className="mb-6">
            {/* Display selected location */}
            {(formData.latitude && formData.longitude) ? (
              <div className="rounded-xl overflow-hidden border border-gray-200">
                {/* Map Preview */}
                <div className="relative aspect-[16/9] bg-gray-100">
                  <iframe
                    src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(formData.longitude) - 0.01},${Number(formData.latitude) - 0.01},${Number(formData.longitude) + 0.01},${Number(formData.latitude) + 0.01}&layer=mapnik&marker=${formData.latitude},${formData.longitude}`}
                    className="w-full h-full border-0"
                    allowFullScreen
                  />
                </div>
                {/* Address display */}
                <div className="p-4 bg-white">
                  <div className="flex items-start gap-2 text-gray-700">
                    <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium">
                        {categoryData?.compoundName && `${categoryData.compoundName}، `}
                        {formData.district && `${formData.district}، `}
                        {formData.city && `${formData.city}، `}
                        {formData.governorate}
                      </p>
                      {formData.street && (
                        <p className="text-sm text-gray-500 mt-1">{formData.street}</p>
                      )}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const lat = formData.latitude;
                      const lng = formData.longitude;
                      window.open(`https://www.google.com/maps?q=${lat},${lng}`, '_blank');
                    }}
                    className="mt-3 flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    انظر الموقع
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-700 mb-2">
                  💡 استخدم زر "تحديد موقعي" لتحديد موقع العقار على الخريطة تلقائياً
                </p>
              </div>
            )}
          </div>
        )}

        {/* GPS Button and Map Picker */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleGetGpsLocation}
            disabled={gpsLoading}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors disabled:opacity-50"
          >
            {gpsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
            <span>تحديد موقعي تلقائياً</span>
          </button>
          <button
            type="button"
            onClick={() => setShowMapPicker(true)}
            className="flex items-center gap-2 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
          >
            <MapPin className="w-4 h-4" />
            <span>تحديد على الخريطة</span>
          </button>
          {gpsError && (
            <span className="text-red-500 text-sm">{gpsError}</span>
          )}
        </div>

        {/* Map Picker Modal */}
        {showMapPicker && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6">
              <PropertyLocationPicker
                latitude={formData.latitude}
                longitude={formData.longitude}
                onLocationChange={(lat, lng) => {
                  onFormDataChange({
                    ...formData,
                    latitude: lat,
                    longitude: lng,
                  });
                }}
                onClose={() => setShowMapPicker(false)}
              />
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowMapPicker(false)}
                  className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  تأكيد الموقع
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Address Grid - 4 fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Governorate */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4 inline ml-1" />
              المحافظة <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.governorate || ''}
              onChange={(e) => handleInputChange('governorate', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            >
              <option value="">اختر المحافظة</option>
              {GOVERNORATES.map(gov => (
                <option key={gov} value={gov}>{gov}</option>
              ))}
            </select>
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              المدينة
            </label>
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => handleInputChange('city', e.target.value)}
              placeholder="مثال: العبور، مدينة نصر"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              الحي / المنطقة
            </label>
            <input
              type="text"
              value={formData.district || ''}
              onChange={(e) => handleInputChange('district', e.target.value)}
              placeholder="مثال: الحي الأول، المنطقة الصناعية"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          {/* Street */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {category === 'PROPERTY' ? 'العنوان التفصيلي للعقار' : 'الشارع / العنوان التفصيلي'}
            </label>
            <input
              type="text"
              value={formData.street || ''}
              onChange={(e) => handleInputChange('street', e.target.value)}
              placeholder={category === 'PROPERTY' ? 'مثال: برج النيل، شارع الجمهورية' : 'مثال: شارع الجمهورية، بجوار المسجد الكبير'}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Hint */}
      <div className="mt-8 p-4 bg-blue-50 rounded-xl">
        <p className="text-sm text-blue-700">
          💡 <strong>نصيحة:</strong> أدخل بيانات دقيقة وصور واضحة لزيادة فرص البيع
        </p>
      </div>
    </div>
  );
}
