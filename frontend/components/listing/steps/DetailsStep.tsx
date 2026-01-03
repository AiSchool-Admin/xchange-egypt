'use client';

import { useState } from 'react';
import { Upload, X, MapPin } from 'lucide-react';
import { ListingCategory, CommonFields, LISTING_CATEGORIES } from '@/types/listing';

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
}

export default function DetailsStep({
  category,
  formData,
  categoryData,
  onFormDataChange,
  onCategoryDataChange
}: DetailsStepProps) {
  const [dragActive, setDragActive] = useState(false);

  const categoryInfo = LISTING_CATEGORIES.find(c => c.id === category);

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

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            صور المنتج <span className="text-red-500">*</span>
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
