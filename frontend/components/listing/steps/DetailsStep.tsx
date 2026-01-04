'use client';

import { useState, useEffect, useCallback } from 'react';
import { Upload, X, MapPin, Navigation, Loader2, Sparkles } from 'lucide-react';
import { ListingCategory, CommonFields, LISTING_CATEGORIES } from '@/types/listing';
import { useAuth } from '@/lib/contexts/AuthContext';
import { categorizeItem } from '@/lib/api/ai';

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

// Map AI category slugs to our ListingCategory type
const AI_CATEGORY_MAP: Record<string, ListingCategory> = {
  // Mobile & Phones
  'mobile-phones': 'MOBILE',
  'smartphones': 'MOBILE',
  'phones': 'MOBILE',
  'iphone': 'MOBILE',
  'samsung': 'MOBILE',
  'huawei': 'MOBILE',
  'oppo': 'MOBILE',
  'xiaomi': 'MOBILE',
  'mobiles': 'MOBILE',
  'هواتف': 'MOBILE',
  'موبايل': 'MOBILE',
  'جوال': 'MOBILE',
  // Vehicles & Cars
  'cars': 'CAR',
  'sedans': 'CAR',
  'suv': 'CAR',
  'motorcycles': 'CAR',
  'vehicles': 'CAR',
  'auto': 'CAR',
  'truck': 'CAR',
  'سيارات': 'CAR',
  'سيارة': 'CAR',
  'موتوسيكل': 'CAR',
  // Real Estate
  'apartments': 'PROPERTY',
  'villas': 'PROPERTY',
  'land': 'PROPERTY',
  'real-estate': 'PROPERTY',
  'property': 'PROPERTY',
  'houses': 'PROPERTY',
  'شقق': 'PROPERTY',
  'شقة': 'PROPERTY',
  'فيلا': 'PROPERTY',
  'عقارات': 'PROPERTY',
  'أراضي': 'PROPERTY',
  // Gold & Jewelry
  'gold': 'GOLD',
  'jewelry': 'GOLD',
  'gold-jewelry': 'GOLD',
  'diamonds': 'GOLD',
  'ذهب': 'GOLD',
  'مجوهرات': 'GOLD',
  // Luxury
  'watches': 'LUXURY',
  'bags': 'LUXURY',
  'luxury': 'LUXURY',
  'luxury-items': 'LUXURY',
  'designer': 'LUXURY',
  'ساعات': 'LUXURY',
  'حقائب': 'LUXURY',
  // General Electronics & Items
  'laptops': 'GENERAL',
  'tablets': 'GENERAL',
  'tv': 'GENERAL',
  'cameras': 'GENERAL',
  'refrigerators': 'GENERAL',
  'washing-machines': 'GENERAL',
  'air-conditioners': 'GENERAL',
  'sofas': 'GENERAL',
  'beds': 'GENERAL',
  'video-games': 'GENERAL',
  'gym-equipment': 'GENERAL',
  'bicycles': 'GENERAL',
  'books': 'GENERAL',
  'electronics': 'GENERAL',
  'furniture': 'GENERAL',
  'appliances': 'GENERAL',
  'general': 'GENERAL',
  'أجهزة': 'GENERAL',
  'الكترونيات': 'GENERAL',
  'أثاث': 'GENERAL',
  // Scrap & Recycling
  'scrap': 'SCRAP',
  'metal': 'SCRAP',
  'recycling': 'SCRAP',
  'scrap-materials': 'SCRAP',
  'خردة': 'SCRAP',
  'سكراب': 'SCRAP',
};

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
  const [aiError, setAiError] = useState<string | null>(null);
  const [suggestedCategory, setSuggestedCategory] = useState<{
    category: ListingCategory;
    categoryName: string;
    confidence: number;
    isMatch: boolean; // true if AI confirms current category
  } | null>(null);
  const { user } = useAuth();

  const categoryInfo = LISTING_CATEGORIES.find(c => c.id === category);

  // Debounce title for AI categorization
  const debouncedTitle = useDebounce(formData.title || '', 1000);

  // AI Category Detection
  useEffect(() => {
    const detectCategory = async () => {
      if (!debouncedTitle || debouncedTitle.length < 5) {
        setSuggestedCategory(null);
        setAiError(null);
        return;
      }

      setAiLoading(true);
      setAiError(null);
      try {
        const result = await categorizeItem({
          title: debouncedTitle,
          description: formData.description || undefined
        });

        if (result && result.success && result.category) {
          const aiSlug = result.category.id || result.category.name?.toLowerCase() || '';
          const mappedCategory = AI_CATEGORY_MAP[aiSlug];

          if (mappedCategory) {
            const categoryDetails = LISTING_CATEGORIES.find(c => c.id === mappedCategory);
            const isMatch = mappedCategory === category;
            setSuggestedCategory({
              category: mappedCategory,
              categoryName: categoryDetails?.nameAr || mappedCategory,
              confidence: result.category.confidence,
              isMatch
            });
          } else {
            // AI returned a category we don't have mapped - show current as confirmed
            const categoryDetails = LISTING_CATEGORIES.find(c => c.id === category);
            setSuggestedCategory({
              category: category,
              categoryName: categoryDetails?.nameAr || category,
              confidence: 0.5,
              isMatch: true
            });
          }
        } else {
          setSuggestedCategory(null);
        }
      } catch (error) {
        console.error('AI categorization error:', error);
        setAiError('تعذر تحليل الفئة');
        setSuggestedCategory(null);
      } finally {
        setAiLoading(false);
      }
    };

    detectCategory();
  }, [debouncedTitle, formData.description, category]);

  // Set default address from user profile (governorate, city, district)
  useEffect(() => {
    if (user && (user.governorate || user.city || user.district)) {
      const updates: Partial<CommonFields> = { ...formData };
      let hasUpdates = false;

      if (!formData.governorate && user.governorate) {
        updates.governorate = user.governorate;
        hasUpdates = true;
      }
      if (!formData.city && (user.city || user.district)) {
        // Use district first as it's more specific, then city
        updates.city = user.district || user.city || '';
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

            if (matchedGov) {
              onFormDataChange({
                ...formData,
                governorate: matchedGov,
                city: address.city || address.town || address.village || formData.city
              });
            } else if (governorate) {
              onFormDataChange({
                ...formData,
                city: address.city || address.town || address.village || formData.city
              });
            }
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
            عنوان الإعلان <span className="text-red-500">*</span>
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

          {/* AI Loading Indicator */}
          {aiLoading && (
            <div className="mt-2 flex items-center gap-2 text-indigo-600 text-sm">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>الذكاء الاصطناعي يحلل المنتج...</span>
            </div>
          )}

          {/* AI Error */}
          {aiError && !aiLoading && (
            <div className="mt-2 text-sm text-amber-600">
              ⚠️ {aiError}
            </div>
          )}

          {/* AI Category Confirmation (when AI agrees with current category) */}
          {suggestedCategory && suggestedCategory.isMatch && !aiLoading && (
            <div className="mt-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm text-green-800 font-medium">
                    ✨ الذكاء الاصطناعي يؤكد اختيارك
                  </p>
                  <p className="text-sm text-green-600">
                    الفئة "{suggestedCategory.categoryName}" مناسبة لمنتجك
                    {suggestedCategory.confidence > 0.7 && ' (ثقة عالية)'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* AI Category Suggestion (when AI suggests different category) */}
          {suggestedCategory && !suggestedCategory.isMatch && !aiLoading && onCategoryChange && (
            <div className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-purple-800 font-medium">
                    🤖 اقتراح الذكاء الاصطناعي
                  </p>
                  <p className="text-sm text-purple-600 mt-1">
                    يبدو أن منتجك ينتمي لفئة "{suggestedCategory.categoryName}"
                    {suggestedCategory.confidence > 0.7 && ' (ثقة عالية)'}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onCategoryChange(suggestedCategory.category);
                      setSuggestedCategory(null);
                    }}
                    className="mt-2 px-3 py-1.5 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    تغيير الفئة إلى {suggestedCategory.categoryName}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => setSuggestedCategory(null)}
                  className="text-purple-400 hover:text-purple-600"
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
            الوصف <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder="اكتب وصفاً تفصيلياً للمنتج، حالته، ملحقاته، سبب البيع..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Location */}
        <div className="space-y-4">
          {/* GPS Button */}
          <div className="flex items-center gap-3">
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
            {gpsError && (
              <span className="text-red-500 text-sm">{gpsError}</span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                المدينة / المنطقة
              </label>
              <input
                type="text"
                value={formData.city || ''}
                onChange={(e) => handleInputChange('city', e.target.value)}
                placeholder="مثال: مدينة نصر"
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
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
      </div>

      {/* Category-Specific Fields */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-bold text-gray-900 mb-4">
          تفاصيل {categoryInfo?.nameAr || 'المنتج'}
        </h3>
        {renderCategoryFields()}
      </div>
    </div>
  );
}
