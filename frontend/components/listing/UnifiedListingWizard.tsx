'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, Check, Loader2 } from 'lucide-react';
import {
  ListingCategory,
  TransactionType,
  WizardOptions,
  StepInfo,
  UnifiedListing,
  LISTING_CATEGORIES,
  TRANSACTION_TYPES,
  CommonFields
} from '@/types/listing';
import { createItem, CreateItemData } from '@/lib/api/items';
import apiClient from '@/lib/api/client';

// Step Components
import CategoryStep from './steps/CategoryStep';
import DetailsStep from './steps/DetailsStep';
import TransactionStep from './steps/TransactionStep';
import ReviewStep from './steps/ReviewStep';

interface UnifiedListingWizardProps {
  options?: WizardOptions;
  onComplete?: (listing: UnifiedListing) => void;
}

export default function UnifiedListingWizard({
  options = {},
  onComplete
}: UnifiedListingWizardProps) {
  const router = useRouter();
  const { preselectedCategory, preselectedTransactionType, customTitle, backUrl } = options;

  // Wizard State
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [selectedCategory, setSelectedCategory] = useState<ListingCategory | null>(
    preselectedCategory || null
  );
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(''); // Backend category ID
  const [selectedTransactionType, setSelectedTransactionType] = useState<TransactionType | null>(
    preselectedTransactionType || null
  );
  const [formData, setFormData] = useState<Partial<CommonFields>>({
    title: '',
    description: '',
    governorate: '',
    city: '',
    images: []
  });
  const [categorySpecificData, setCategorySpecificData] = useState<Record<string, any>>({});
  const [pricingData, setPricingData] = useState<Record<string, any>>({});
  const [auctionData, setAuctionData] = useState<Record<string, any>>({});
  const [barterData, setBarterData] = useState<Record<string, any>>({});

  // Build steps based on options
  const buildSteps = useCallback((): StepInfo[] => {
    const steps: StepInfo[] = [];

    // Step 1: Category (skip if preselected)
    if (!preselectedCategory) {
      steps.push({
        id: 'category',
        nameAr: 'نوع المنتج',
        nameEn: 'Product Type',
        icon: '📦',
        status: currentStep === steps.length ? 'current' : currentStep > steps.length ? 'completed' : 'pending'
      });
    }

    // Step 2: Details (always shown)
    steps.push({
      id: 'details',
      nameAr: 'بيانات المنتج',
      nameEn: 'Product Details',
      icon: '📝',
      status: currentStep === steps.length ? 'current' : currentStep > steps.length ? 'completed' : 'pending'
    });

    // Step 3: Transaction Type (skip if preselected)
    if (!preselectedTransactionType) {
      steps.push({
        id: 'transaction',
        nameAr: 'نوع المعاملة',
        nameEn: 'Transaction Type',
        icon: '💰',
        status: currentStep === steps.length ? 'current' : currentStep > steps.length ? 'completed' : 'pending'
      });
    }

    // Step 4: Review (always shown)
    steps.push({
      id: 'review',
      nameAr: 'المراجعة والنشر',
      nameEn: 'Review & Publish',
      icon: '✅',
      status: currentStep === steps.length ? 'current' : currentStep > steps.length ? 'completed' : 'pending'
    });

    return steps;
  }, [currentStep, preselectedCategory, preselectedTransactionType]);

  const steps = buildSteps();

  // Get current step ID
  const getCurrentStepId = () => {
    return steps[currentStep]?.id || 'category';
  };

  // Navigation
  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const goBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else if (backUrl) {
      router.push(backUrl);
    }
  };

  // Validation
  const canProceed = (): boolean => {
    const stepId = getCurrentStepId();

    switch (stepId) {
      case 'category':
        return !!selectedCategory;
      case 'details':
        // Require at least Level 1 category from the 3-level selector
        const hasCategory = !!(
          categorySpecificData?.categoryLevel1 ||
          categorySpecificData?.categoryLevel2 ||
          categorySpecificData?.categoryLevel3
        );
        return !!(formData.title && formData.description && formData.governorate && hasCategory);
      case 'transaction':
        return !!selectedTransactionType;
      case 'review':
        return true;
      default:
        return false;
    }
  };

  // Submit
  const handleSubmit = async () => {
    if (!selectedCategory || !selectedTransactionType) return;

    setIsSubmitting(true);

    try {
      // Get the most specific category ID from the 3-level selector in DetailsStep
      // Priority: Level 3 > Level 2 > Level 1 > selectedCategoryId from CategoryStep
      const categoryFromDetailsStep =
        categorySpecificData?.categoryLevel3 ||
        categorySpecificData?.categoryLevel2 ||
        categorySpecificData?.categoryLevel1;

      // Use the category from DetailsStep's 3-level selector if available
      const finalCategoryId = categoryFromDetailsStep || selectedCategoryId;

      // Validate we have a valid category ID
      if (!finalCategoryId) {
        throw new Error('يرجى اختيار الفئة من القائمة المنسدلة');
      }

      // Map transaction type to listing type
      const listingTypeMap: Record<TransactionType, string> = {
        DIRECT_SALE: 'DIRECT_SALE',
        DIRECT_PURCHASE: 'DIRECT_BUY',
        AUCTION: 'AUCTION',
        REVERSE_AUCTION: 'REVERSE_AUCTION',
        BARTER: 'BARTER'
      };

      // Build the payload according to CreateItemData interface
      const payload = {
        titleAr: formData.title || '',
        titleEn: formData.title || '', // Use Arabic title as English fallback
        descriptionAr: formData.description || '',
        descriptionEn: formData.description || '', // Use Arabic description as English fallback
        condition: (categorySpecificData as any).condition || 'GOOD',
        categoryId: finalCategoryId,
        estimatedValue: pricingData.price ? parseFloat(String(pricingData.price)) : undefined,
        location: formData.governorate || 'القاهرة',
        governorate: formData.governorate || 'القاهرة',
        listingType: listingTypeMap[selectedTransactionType],
        imageUrls: formData.images || [],
        // Barter preferences
        desiredKeywords: (barterData as any).preferences || undefined,
        desiredValueMin: (barterData as any).minValue ? parseFloat(String((barterData as any).minValue)) : undefined,
        desiredValueMax: (barterData as any).maxValue ? parseFloat(String((barterData as any).maxValue)) : undefined,
        // Category-specific data as additional fields
        ...categorySpecificData
      };

      if (onComplete) {
        const listing: UnifiedListing = {
          category: selectedCategory,
          transactionType: selectedTransactionType,
          data: {
            ...formData,
            ...categorySpecificData
          } as any,
          pricing: pricingData as any,
          auction: selectedTransactionType === 'AUCTION' ? auctionData as any : undefined,
          barter: selectedTransactionType === 'BARTER' ? barterData as any : undefined
        };
        await onComplete(listing);
      } else {
        // Check if this is a mobile listing - use mobile-specific API
        if (selectedCategory === 'MOBILE') {
          // Map condition to mobile condition grade
          const conditionGradeMap: Record<string, string> = {
            'NEW': 'A',
            'LIKE_NEW': 'A',
            'GOOD': 'B',
            'FAIR': 'C',
            'POOR': 'D'
          };

          // Extract brand from level 2 category name (e.g., "Samsung" -> "SAMSUNG")
          const brandName = categorySpecificData?.categoryLevel2Name || '';
          const brandMap: Record<string, string> = {
            'Apple': 'APPLE', 'آبل': 'APPLE',
            'Samsung': 'SAMSUNG', 'سامسونج': 'SAMSUNG',
            'Xiaomi': 'XIAOMI', 'شاومي': 'XIAOMI',
            'OPPO': 'OPPO', 'أوبو': 'OPPO',
            'Vivo': 'VIVO', 'فيفو': 'VIVO',
            'Huawei': 'HUAWEI', 'هواوي': 'HUAWEI',
            'Honor': 'HONOR', 'هونر': 'HONOR',
            'Realme': 'REALME', 'ريلمي': 'REALME',
            'Infinix': 'INFINIX', 'إنفينكس': 'INFINIX',
            'Tecno': 'TECNO', 'تكنو': 'TECNO',
            'OnePlus': 'ONEPLUS', 'ون بلس': 'ONEPLUS',
            'Google': 'GOOGLE', 'جوجل': 'GOOGLE',
            'Nokia': 'NOKIA', 'نوكيا': 'NOKIA',
            'Motorola': 'MOTOROLA', 'موتورولا': 'MOTOROLA',
          };
          const extractedBrand = brandMap[brandName] || 'OTHER';

          // Extract model from level 3 category name (e.g., "iPhone 15 Pro Max")
          const modelName = categorySpecificData?.categoryLevel3Name || categorySpecificData?.categoryLevel3NameAr || payload.titleAr || 'Unknown';

          const mobilePayload = {
            title: payload.titleAr,
            titleAr: payload.titleAr,
            description: payload.descriptionAr,
            descriptionAr: payload.descriptionAr,
            brand: extractedBrand,
            model: modelName,
            storageGb: parseInt(categorySpecificData?.storageCapacity) || 64,
            ramGb: categorySpecificData?.ramSize ? parseInt(categorySpecificData.ramSize) : null,
            color: categorySpecificData?.color || '',
            colorAr: categorySpecificData?.color || '',
            imei: categorySpecificData?.imei || null,
            conditionGrade: conditionGradeMap[categorySpecificData?.condition || payload.condition] || 'B',
            batteryHealth: categorySpecificData?.batteryHealth || null,
            screenCondition: 'GOOD',
            bodyCondition: 'GOOD',
            originalParts: true,
            hasBox: (categorySpecificData?.accessories || []).includes('العلبة الأصلية'),
            hasAccessories: (categorySpecificData?.accessories || []).length > 0,
            accessoriesDetails: (categorySpecificData?.accessories || []).join('، ') || null,
            priceEgp: pricingData.price ? parseFloat(String(pricingData.price)) : 0,
            negotiable: pricingData.negotiable ?? true,
            acceptsBarter: selectedTransactionType === 'BARTER',
            barterPreferences: barterData || null,
            images: payload.imageUrls || [],
            governorate: payload.governorate,
            city: formData.city || '',
            district: formData.district || ''
          };

          const response = await apiClient.post('/mobiles/listings', mobilePayload);

          if (response.data.success) {
            alert('تم نشر إعلان الموبايل بنجاح!');
            const listingId = response.data.data?.id;
            if (listingId) {
              router.push(`/mobiles/${listingId}`);
            } else {
              router.push('/mobiles');
            }
          } else {
            throw new Error(response.data.error || 'فشل في نشر إعلان الموبايل');
          }
        } else if (selectedCategory === 'PROPERTY') {
          // Property-specific handling - use properties API
          // Map transaction type to property listing type
          const propertyListingTypeMap: Record<string, string> = {
            'DIRECT_SALE': 'SALE',
            'DIRECT_PURCHASE': 'RENT', // For buyers looking to rent
            'AUCTION': 'SALE',
            'REVERSE_AUCTION': 'RENT',
            'BARTER': 'SALE',
          };

          // Determine listing type (SALE or RENT)
          const propertyListingType = propertyListingTypeMap[selectedTransactionType] || 'SALE';
          const priceValue = pricingData.price ? parseFloat(String(pricingData.price)) : 0;

          // Map property type from category name or use default
          const propertyTypeMap: Record<string, string> = {
            'شقة': 'APARTMENT',
            'شقق': 'APARTMENT',
            'فيلا': 'VILLA',
            'فلل': 'VILLA',
            'توين هاوس': 'TWIN_HOUSE',
            'تاون هاوس': 'TOWNHOUSE',
            'بنتهاوس': 'PENTHOUSE',
            'دوبلكس': 'DUPLEX',
            'استوديو': 'STUDIO',
            'روف': 'PENTHOUSE',
            'شاليه': 'CHALET',
            'أرض': 'LAND',
            'محل': 'COMMERCIAL',
            'مكتب': 'OFFICE',
            'عمارة': 'BUILDING',
          };

          // Try to extract property type from category level 3 name
          const categoryLevel3Name = categorySpecificData?.categoryLevel3NameAr || '';
          let detectedPropertyType = 'APARTMENT';
          for (const [keyword, type] of Object.entries(propertyTypeMap)) {
            if (categoryLevel3Name.includes(keyword)) {
              detectedPropertyType = type;
              break;
            }
          }

          const propertyPayload = {
            title: payload.titleAr,
            titleAr: payload.titleAr,
            description: payload.descriptionAr,
            descriptionAr: payload.descriptionAr,
            propertyType: categorySpecificData?.propertyType || detectedPropertyType,
            listingType: propertyListingType,
            titleType: categorySpecificData?.titleType || 'PRELIMINARY',
            // Price fields - use salePrice for sale, rentPrice for rent
            salePrice: propertyListingType === 'SALE' ? priceValue : undefined,
            rentPrice: propertyListingType === 'RENT' ? priceValue : undefined,
            rentPeriod: propertyListingType === 'RENT' ? 'MONTHLY' : undefined,
            priceNegotiable: pricingData.negotiable ?? true,
            // Area - backend expects areaSqm
            areaSqm: categorySpecificData?.area ? parseInt(String(categorySpecificData.area)) : 100,
            bedrooms: categorySpecificData?.bedrooms ? parseInt(String(categorySpecificData.bedrooms)) : undefined,
            bathrooms: categorySpecificData?.bathrooms ? parseInt(String(categorySpecificData.bathrooms)) : undefined,
            // Floor - backend expects floorNumber
            floorNumber: categorySpecificData?.floor ? parseInt(String(categorySpecificData.floor)) : undefined,
            totalFloors: categorySpecificData?.totalFloors ? parseInt(String(categorySpecificData.totalFloors)) : undefined,
            // Finishing - map to backend enum values
            finishingLevel: categorySpecificData?.finishingLevel || undefined,
            furnished: categorySpecificData?.furnishingStatus || undefined,
            // Location
            governorate: formData.governorate || 'القاهرة',
            city: formData.city || '',
            district: formData.district || undefined,
            address: formData.street || formData.district || '',
            // Coordinates for map
            latitude: formData.latitude || undefined,
            longitude: formData.longitude || undefined,
            // Compound information
            isCompound: categorySpecificData?.isCompound || false,
            compoundName: categorySpecificData?.isCompound ? categorySpecificData?.compoundName : undefined,
            // Media
            images: formData.images || [],
            // Amenities - store as JSON object
            amenities: categorySpecificData?.amenities ? { items: categorySpecificData.amenities } : undefined,
            // Barter - backend expects openForBarter
            openForBarter: selectedTransactionType === 'BARTER' || barterData?.acceptsBarter || false,
            barterPreferences: barterData?.preferences ? { items: barterData.preferences } : undefined,
          };

          const response = await apiClient.post('/properties', propertyPayload);

          if (response.data.success || response.data.id) {
            alert('تم نشر إعلان العقار بنجاح!');
            const propertyId = response.data.data?.id || response.data.id;
            if (propertyId) {
              router.push(`/properties/${propertyId}`);
            } else {
              router.push('/properties');
            }
          } else {
            throw new Error(response.data.error || 'فشل في نشر إعلان العقار');
          }
        } else {
          // Call the items API using the createItem function for other categories
          const createData: CreateItemData = {
            titleAr: payload.titleAr,
            titleEn: payload.titleEn,
            descriptionAr: payload.descriptionAr,
            descriptionEn: payload.descriptionEn,
            condition: payload.condition,
            categoryId: payload.categoryId,
            estimatedValue: payload.estimatedValue,
            location: payload.location,
            governorate: payload.governorate,
            imageUrls: payload.imageUrls,
            desiredKeywords: payload.desiredKeywords,
            desiredValueMin: payload.desiredValueMin,
            desiredValueMax: payload.desiredValueMax
          };

          const result = await createItem(createData);

          if (result.success) {
            // Redirect based on category
            const redirectMap: Record<ListingCategory, string> = {
              MOBILE: '/mobiles',
              CAR: '/cars',
              PROPERTY: '/properties',
              GOLD: '/gold',
              LUXURY: '/luxury',
              SCRAP: '/scrap',
              GENERAL: '/items'
            };

            // Show success message
            alert('تم نشر الإعلان بنجاح!');

            // Redirect to the item page or category page
            const itemId = result.data?.id;
            if (itemId) {
              router.push(`/items/${itemId}`);
            } else {
              router.push(options.backUrl || redirectMap[selectedCategory] || '/items');
            }
          } else {
            throw new Error('فشل في نشر الإعلان');
          }
        }
      }
    } catch (error) {
      console.error('Error submitting listing:', error);
      alert(error instanceof Error ? error.message : 'حدث خطأ أثناء نشر الإعلان');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step content
  const renderStepContent = () => {
    const stepId = getCurrentStepId();

    switch (stepId) {
      case 'category':
        return (
          <CategoryStep
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
            onCategoryIdSelect={setSelectedCategoryId}
            selectedCategoryId={selectedCategoryId}
          />
        );

      case 'details':
        return (
          <DetailsStep
            category={selectedCategory || preselectedCategory!}
            formData={formData}
            categoryData={categorySpecificData}
            onFormDataChange={setFormData}
            onCategoryDataChange={setCategorySpecificData}
            onCategoryChange={setSelectedCategory}
          />
        );

      case 'transaction':
        return (
          <TransactionStep
            selectedType={selectedTransactionType}
            onSelect={setSelectedTransactionType}
            pricingData={pricingData}
            auctionData={auctionData}
            barterData={barterData}
            onPricingChange={setPricingData}
            onAuctionChange={setAuctionData}
            onBarterChange={setBarterData}
          />
        );

      case 'review':
        return (
          <ReviewStep
            category={selectedCategory || preselectedCategory!}
            transactionType={selectedTransactionType || preselectedTransactionType!}
            formData={formData}
            categoryData={categorySpecificData}
            pricingData={pricingData}
            auctionData={auctionData}
            barterData={barterData}
          />
        );

      default:
        return null;
    }
  };

  const categoryInfo = LISTING_CATEGORIES.find(c => c.id === (selectedCategory || preselectedCategory));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50" dir="rtl">
      {/* Header */}
      <div className={`bg-gradient-to-r ${categoryInfo?.color || 'from-indigo-600 to-purple-600'} text-white`}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">
            {customTitle || 'إضافة إعلان جديد'}
          </h1>
          {categoryInfo && (
            <p className="text-white/80">
              {categoryInfo.icon} {categoryInfo.nameAr} - {categoryInfo.description}
            </p>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-4">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                {/* Step Circle */}
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                    index < currentStep
                      ? 'bg-green-500 text-white'
                      : index === currentStep
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {index < currentStep ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span>{step.icon}</span>
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`hidden sm:block mr-2 text-sm ${
                    index === currentStep ? 'text-indigo-600 font-bold' : 'text-gray-500'
                  }`}
                >
                  {step.nameAr}
                </span>

                {/* Connector Line */}
                {index < steps.length - 1 && (
                  <div
                    className={`w-12 h-1 mx-2 rounded ${
                      index < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Step Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
            {renderStepContent()}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              onClick={goBack}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
            >
              <ArrowRight className="w-5 h-5" />
              {currentStep === 0 ? 'إلغاء' : 'السابق'}
            </button>

            {currentStep === steps.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    جاري النشر...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    نشر الإعلان
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={goNext}
                disabled={!canProceed()}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                التالي
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
