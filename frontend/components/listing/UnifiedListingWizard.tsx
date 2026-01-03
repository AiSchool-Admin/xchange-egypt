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
        return !!(formData.title && formData.description && formData.governorate);
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
      // Map category to backend categoryId (these should be actual category IDs from your database)
      const categoryIdMap: Record<ListingCategory, string> = {
        MOBILE: 'mobile-phones',
        CAR: 'vehicles',
        PROPERTY: 'real-estate',
        GOLD: 'gold-jewelry',
        LUXURY: 'luxury-items',
        SCRAP: 'scrap-materials',
        GENERAL: 'general'
      };

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
        categoryId: categoryIdMap[selectedCategory],
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
        // Call the items API
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/items`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
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
          throw new Error(result.message || 'فشل في نشر الإعلان');
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
