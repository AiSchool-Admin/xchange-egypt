'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSocket } from '@/lib/contexts/SocketContext';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { CategorySuggestion } from '@/components/ai/CategorySuggestion';
import { PriceWarning } from '@/components/ai/PriceWarning';
import { FraudWarning } from '@/components/ai/FraudWarning';
import { createInventoryItem, MarketType, MARKET_CONFIG } from '@/lib/api/inventory';
import { getRootCategories, Category } from '@/lib/api/categories';
import {
  categorizeItem,
  estimatePrice,
  checkListing,
  CategorySuggestion as CategorySuggestionType,
  PriceEstimationResponse,
  FraudCheckResponse,
} from '@/lib/api/ai';
import { useDebounce } from '@/lib/hooks/useDebounce';
import {
  getGovernorates,
  getCities,
  getDistricts,
  Governorate,
  City,
  District,
} from '@/lib/api/locations';

type ItemSide = 'supply' | 'demand';
type ItemType = 'goods' | 'services' | 'cash';
type ListingType = 'direct_sale' | 'auction' | 'barter' | 'direct_buy' | 'reverse_auction';
type ItemCondition = 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';

interface FormData {
  side: ItemSide;
  type: ItemType;
  title: string;
  description: string;
  // 3-Level Category Selection
  categoryLevel1: string;
  categoryLevel2: string;
  categoryLevel3: string;
  selectedCategoryId: string;
  // Condition
  condition: ItemCondition;
  value: string;
  listingType: ListingType;
  images: string[];
  // Auction specific
  startingBid: string;
  auctionDuration: string;
  // Barter specific
  desiredCategoryLevel1: string;
  desiredCategoryLevel2: string;
  desiredCategoryLevel3: string;
  desiredCategoryId: string;
  desiredKeywords: string;
  desiredValueMin: string;
  desiredValueMax: string;
  // Market Type
  marketType: MarketType;
  // Location
  governorateId: string;
  governorateName: string;
  cityId: string;
  cityName: string;
  districtId: string;
  districtName: string;
}

const CONDITION_OPTIONS: { value: ItemCondition; label: string; labelAr: string; icon: string }[] = [
  { value: 'NEW', label: 'New', labelAr: 'جديد', icon: '✨' },
  { value: 'LIKE_NEW', label: 'Like New', labelAr: 'كالجديد', icon: '🌟' },
  { value: 'GOOD', label: 'Good', labelAr: 'جيد', icon: '👍' },
  { value: 'FAIR', label: 'Fair', labelAr: 'مقبول', icon: '👌' },
  { value: 'POOR', label: 'Poor', labelAr: 'ضعيف', icon: '⚠️' },
];

function AddInventoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading } = useAuth();
  const { onMatchFound, offMatchFound } = useSocket();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    side: (searchParams.get('side') as ItemSide) || 'supply',
    type: (searchParams.get('type') as ItemType) || 'goods',
    title: '',
    description: '',
    categoryLevel1: '',
    categoryLevel2: '',
    categoryLevel3: '',
    selectedCategoryId: '',
    condition: 'GOOD',
    value: '',
    listingType: 'direct_sale',
    images: [],
    startingBid: '',
    auctionDuration: '7',
    desiredCategoryLevel1: '',
    desiredCategoryLevel2: '',
    desiredCategoryLevel3: '',
    desiredCategoryId: '',
    desiredKeywords: '',
    desiredValueMin: '',
    desiredValueMax: '',
    marketType: 'DISTRICT',
    governorateId: '',
    governorateName: '',
    cityId: '',
    cityName: '',
    districtId: '',
    districtName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Location state
  const [governorates, setGovernorates] = useState<Governorate[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [loadingLocations, setLoadingLocations] = useState(false);

  // Category state - 3 levels
  const [rootCategories, setRootCategories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  // Desired category state for barter
  const [desiredLevel2Categories, setDesiredLevel2Categories] = useState<Category[]>([]);
  const [desiredLevel3Categories, setDesiredLevel3Categories] = useState<Category[]>([]);

  // AI Features state
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestionType[]>([]);
  const [loadingCategorySuggestion, setLoadingCategorySuggestion] = useState(false);
  const [priceEstimation, setPriceEstimation] = useState<PriceEstimationResponse | null>(null);
  const [loadingPriceEstimation, setLoadingPriceEstimation] = useState(false);
  const [fraudCheck, setFraudCheck] = useState<FraudCheckResponse | null>(null);
  const [loadingFraudCheck, setLoadingFraudCheck] = useState(false);

  // Debounced values for AI features
  const debouncedTitle = useDebounce(formData.title, 1000);
  const debouncedValue = useDebounce(formData.value, 800);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Load governorates on mount
  useEffect(() => {
    const loadGovernorates = async () => {
      const data = await getGovernorates();
      setGovernorates(data);
    };
    loadGovernorates();
  }, []);

  // Load root categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await getRootCategories();
        if (response.success && response.data) {
          setRootCategories(response.data);
        }
      } catch (error) {
        console.error('Error loading categories:', error);
      } finally {
        setLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Load cities when governorate changes
  useEffect(() => {
    if (formData.governorateId) {
      setLoadingLocations(true);
      getCities(formData.governorateId).then(data => {
        setCities(data);
        setDistricts([]);
        setLoadingLocations(false);
      });
    } else {
      setCities([]);
      setDistricts([]);
    }
  }, [formData.governorateId]);

  // Load districts when city changes
  useEffect(() => {
    if (formData.governorateId && formData.cityId) {
      setLoadingLocations(true);
      getDistricts(formData.governorateId, formData.cityId).then(data => {
        setDistricts(data);
        setLoadingLocations(false);
      });
    } else {
      setDistricts([]);
    }
  }, [formData.governorateId, formData.cityId]);

  // Load level 2 categories when level 1 changes
  useEffect(() => {
    if (formData.categoryLevel1) {
      const parentCategory = rootCategories.find(c => c.id === formData.categoryLevel1);
      if (parentCategory?.children) {
        setLevel2Categories(parentCategory.children);
      } else {
        setLevel2Categories([]);
      }
      setLevel3Categories([]);
      setFormData(prev => ({
        ...prev,
        categoryLevel2: '',
        categoryLevel3: '',
        selectedCategoryId: formData.categoryLevel1,
      }));
    } else {
      setLevel2Categories([]);
      setLevel3Categories([]);
    }
  }, [formData.categoryLevel1, rootCategories]);

  // Load level 3 categories when level 2 changes
  useEffect(() => {
    if (formData.categoryLevel2) {
      const level2Category = level2Categories.find(c => c.id === formData.categoryLevel2);
      if (level2Category?.children) {
        setLevel3Categories(level2Category.children);
      } else {
        setLevel3Categories([]);
      }
      setFormData(prev => ({
        ...prev,
        categoryLevel3: '',
        selectedCategoryId: formData.categoryLevel2,
      }));
    } else {
      setLevel3Categories([]);
    }
  }, [formData.categoryLevel2, level2Categories]);

  // Update selected category when level 3 changes
  useEffect(() => {
    if (formData.categoryLevel3) {
      setFormData(prev => ({
        ...prev,
        selectedCategoryId: formData.categoryLevel3,
      }));
    }
  }, [formData.categoryLevel3]);

  // Load desired level 2 categories for barter
  useEffect(() => {
    if (formData.desiredCategoryLevel1) {
      const parentCategory = rootCategories.find(c => c.id === formData.desiredCategoryLevel1);
      if (parentCategory?.children) {
        setDesiredLevel2Categories(parentCategory.children);
      } else {
        setDesiredLevel2Categories([]);
      }
      setDesiredLevel3Categories([]);
      setFormData(prev => ({
        ...prev,
        desiredCategoryLevel2: '',
        desiredCategoryLevel3: '',
        desiredCategoryId: formData.desiredCategoryLevel1,
      }));
    } else {
      setDesiredLevel2Categories([]);
      setDesiredLevel3Categories([]);
    }
  }, [formData.desiredCategoryLevel1, rootCategories]);

  // Load desired level 3 categories for barter
  useEffect(() => {
    if (formData.desiredCategoryLevel2) {
      const level2Category = desiredLevel2Categories.find(c => c.id === formData.desiredCategoryLevel2);
      if (level2Category?.children) {
        setDesiredLevel3Categories(level2Category.children);
      } else {
        setDesiredLevel3Categories([]);
      }
      setFormData(prev => ({
        ...prev,
        desiredCategoryLevel3: '',
        desiredCategoryId: formData.desiredCategoryLevel2,
      }));
    } else {
      setDesiredLevel3Categories([]);
    }
  }, [formData.desiredCategoryLevel2, desiredLevel2Categories]);

  // Update desired category ID when level 3 changes
  useEffect(() => {
    if (formData.desiredCategoryLevel3) {
      setFormData(prev => ({
        ...prev,
        desiredCategoryId: formData.desiredCategoryLevel3,
      }));
    }
  }, [formData.desiredCategoryLevel3]);

  // AI Category Suggestion - trigger on title change
  useEffect(() => {
    if (debouncedTitle && debouncedTitle.length >= 3) {
      const fetchSuggestions = async () => {
        setLoadingCategorySuggestion(true);
        try {
          const result = await categorizeItem({
            title: debouncedTitle,
            description: formData.description,
          });
          if (result) {
            const suggestions = [result.category, ...result.alternatives];
            setCategorySuggestions(suggestions);
          }
        } catch (error) {
          console.error('Category suggestion error:', error);
        } finally {
          setLoadingCategorySuggestion(false);
        }
      };
      fetchSuggestions();
    } else {
      setCategorySuggestions([]);
    }
  }, [debouncedTitle, formData.description]);

  // AI Price Estimation - trigger on value change
  useEffect(() => {
    if (debouncedValue && formData.selectedCategoryId && parseInt(debouncedValue) > 0) {
      const fetchEstimation = async () => {
        setLoadingPriceEstimation(true);
        try {
          const result = await estimatePrice({
            title: formData.title,
            description: formData.description,
            categoryId: formData.selectedCategoryId,
            condition: formData.condition,
            estimatedValue: parseInt(debouncedValue),
          });
          setPriceEstimation(result);
        } catch (error) {
          console.error('Price estimation error:', error);
        } finally {
          setLoadingPriceEstimation(false);
        }
      };
      fetchEstimation();
    } else {
      setPriceEstimation(null);
    }
  }, [debouncedValue, formData.selectedCategoryId, formData.condition, formData.title, formData.description]);

  // Listen for match notifications after submission
  useEffect(() => {
    if (submitSuccess) {
      const handleMatch = (notification: any) => {
        console.log('🎯 New match found:', notification);
        // Could show a toast notification here
      };
      onMatchFound(handleMatch);
      return () => {
        offMatchFound(handleMatch);
      };
    }
  }, [submitSuccess, onMatchFound, offMatchFound]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGovernorateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const governorateId = e.target.value;
    const governorate = governorates.find(g => g.id === governorateId);
    setFormData(prev => ({
      ...prev,
      governorateId,
      governorateName: governorate?.nameEn || '',
      cityId: '',
      cityName: '',
      districtId: '',
      districtName: '',
    }));
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = e.target.value;
    const city = cities.find(c => c.id === cityId);
    setFormData(prev => ({
      ...prev,
      cityId,
      cityName: city?.nameEn || '',
      districtId: '',
      districtName: '',
    }));
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    const district = districts.find(d => d.id === districtId);
    setFormData(prev => ({
      ...prev,
      districtId,
      districtName: district?.nameEn || '',
    }));
  };

  const handleCategorySuggestionSelect = (categoryId: string) => {
    // Find the category in the tree and set all levels
    const findCategoryPath = (categories: Category[], targetId: string, path: string[] = []): string[] | null => {
      for (const cat of categories) {
        if (cat.id === targetId) {
          return [...path, cat.id];
        }
        if (cat.children) {
          const found = findCategoryPath(cat.children, targetId, [...path, cat.id]);
          if (found) return found;
        }
      }
      return null;
    };

    const categoryPath = findCategoryPath(rootCategories, categoryId);
    if (categoryPath) {
      setFormData(prev => ({
        ...prev,
        categoryLevel1: categoryPath[0] || '',
        categoryLevel2: categoryPath[1] || '',
        categoryLevel3: categoryPath[2] || '',
        selectedCategoryId: categoryId,
      }));
    } else {
      // If not found in tree, just set it directly
      setFormData(prev => ({
        ...prev,
        selectedCategoryId: categoryId,
      }));
    }
  };

  const handleImageUpload = (urls: string[]) => {
    setFormData(prev => ({ ...prev, images: [...prev.images, ...urls] }));
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const runFraudCheck = async () => {
    if (!formData.title || !formData.description || !formData.value) return;

    setLoadingFraudCheck(true);
    try {
      const result = await checkListing({
        title: formData.title,
        description: formData.description,
        price: parseInt(formData.value),
        categoryId: formData.selectedCategoryId,
        images: formData.images,
        sellerId: user?.id,
      });
      setFraudCheck(result);
    } catch (error) {
      console.error('Fraud check error:', error);
    } finally {
      setLoadingFraudCheck(false);
    }
  };

  const handleSubmit = async () => {
    // Run fraud check before submitting (for supply side)
    if (formData.side === 'supply') {
      await runFraudCheck();
      // If high risk, don't submit
      if (fraudCheck?.riskLevel === 'HIGH') {
        alert('Your listing has been flagged for review. Please modify and try again.');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      // Build location string: District, City, Governorate
      const locationParts = [];
      if (formData.districtName) locationParts.push(formData.districtName);
      if (formData.cityName) locationParts.push(formData.cityName);
      if (formData.governorateName) locationParts.push(formData.governorateName);

      // Map form data to API format
      const apiInput = {
        side: formData.side.toUpperCase() as 'SUPPLY' | 'DEMAND',
        type: formData.type.toUpperCase() as 'GOODS' | 'SERVICES' | 'CASH',
        title: formData.title,
        description: formData.description,
        estimatedValue: parseInt(formData.value) || 0,
        listingType: formData.listingType.toUpperCase() as any,
        images: formData.images,
        categoryId: formData.selectedCategoryId || undefined,
        condition: formData.condition,
        desiredCategoryId: formData.desiredCategoryId || undefined,
        desiredKeywords: formData.desiredKeywords || undefined,
        desiredValueMin: formData.desiredValueMin ? parseInt(formData.desiredValueMin) : undefined,
        desiredValueMax: formData.desiredValueMax ? parseInt(formData.desiredValueMax) : undefined,
        // Market & Location
        marketType: formData.marketType,
        governorate: formData.governorateName || undefined,
        city: formData.cityName || undefined,
        district: formData.districtName || undefined,
        startingBid: formData.startingBid ? parseInt(formData.startingBid) : undefined,
        auctionDurationDays: formData.auctionDuration ? parseInt(formData.auctionDuration) : undefined,
      };

      await createInventoryItem(apiInput);
      setSubmitSuccess(true);

      // Show success message with matching info
      if (formData.listingType === 'barter') {
        alert('🎉 تم إنشاء العنصر بنجاح!\n\nسيتم إشعارك فوراً عند وجود تطابق مناسب.');
      }

      router.push('/inventory');
    } catch (error) {
      console.error('Submit error:', error);
      alert('Failed to create item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getListingOptions = (): { value: ListingType; label: string; labelAr: string; icon: string; desc: string }[] => {
    if (formData.side === 'supply') {
      return [
        { value: 'direct_sale', label: 'Direct Sale', labelAr: 'بيع مباشر', icon: '🏷️', desc: 'Set your price, sell instantly' },
        { value: 'auction', label: 'Auction', labelAr: 'مزاد', icon: '🔨', desc: 'Let buyers bid for the best price' },
        { value: 'barter', label: 'Barter', labelAr: 'مقايضة', icon: '🔄', desc: 'Trade for something you need' },
      ];
    } else {
      return [
        { value: 'direct_buy', label: 'Direct Buy', labelAr: 'شراء مباشر', icon: '🛒', desc: 'Find and purchase available items' },
        { value: 'reverse_auction', label: 'Reverse Auction', labelAr: 'مزاد عكسي', icon: '📢', desc: 'Post your need, sellers compete' },
      ];
    }
  };

  const getCategoryDisplayName = (categoryId: string): string => {
    const findInTree = (categories: Category[]): string | null => {
      for (const cat of categories) {
        if (cat.id === categoryId) return `${cat.nameEn} - ${cat.nameAr}`;
        if (cat.children) {
          const found = findInTree(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findInTree(rootCategories) || categoryId;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return null;

  const totalSteps = formData.side === 'supply' ? 6 : 5;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/inventory" className="text-gray-500 hover:text-gray-700">
              ← Back
            </Link>
            <div className="text-sm text-gray-500">
              Step {step} of {totalSteps}
            </div>
          </div>
          {/* Progress Bar */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-300"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        {/* Step 1: Choose Side */}
        {step === 1 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ماذا تريد أن تفعل؟
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              What would you like to do?
            </p>

            <div className="grid sm:grid-cols-2 gap-6 max-w-xl mx-auto">
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, side: 'supply', listingType: 'direct_sale' }));
                  setStep(2);
                }}
                className={`p-8 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  formData.side === 'supply'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="text-5xl mb-4">📤</div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">عندي / I Have</h2>
                <p className="text-gray-600 text-sm">شيء للبيع أو المزاد أو المقايضة</p>
                <p className="text-gray-500 text-xs mt-1">Something to sell, auction, or trade</p>
              </button>

              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, side: 'demand', listingType: 'direct_buy' }));
                  setStep(2);
                }}
                className={`p-8 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  formData.side === 'demand'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="text-5xl mb-4">📥</div>
                <h2 className="text-xl font-bold text-gray-800 mb-1">أحتاج / I Need</h2>
                <p className="text-gray-600 text-sm">أبحث عن سلع أو خدمات أو نقد</p>
                <p className="text-gray-500 text-xs mt-1">Looking for goods, services, or cash</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Choose Type */}
        {step === 2 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              ما نوع العنصر؟
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              {formData.side === 'supply'
                ? "ماذا تعرض؟ / What are you offering?"
                : "ماذا تبحث عنه؟ / What are you looking for?"}
            </p>

            <div className="grid sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, type: 'goods' }));
                  setStep(3);
                }}
                className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  formData.type === 'goods'
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 bg-white hover:border-purple-300'
                }`}
              >
                <div className="text-4xl mb-3">📦</div>
                <h3 className="font-bold text-gray-800 mb-1">سلع / Goods</h3>
                <p className="text-gray-500 text-xs">منتجات مادية</p>
              </button>

              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, type: 'services' }));
                  setStep(3);
                }}
                className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  formData.type === 'services'
                    ? 'border-indigo-500 bg-indigo-50'
                    : 'border-gray-200 bg-white hover:border-indigo-300'
                }`}
              >
                <div className="text-4xl mb-3">🛠️</div>
                <h3 className="font-bold text-gray-800 mb-1">خدمات / Services</h3>
                <p className="text-gray-500 text-xs">مهارات وخبرات</p>
              </button>

              <button
                onClick={() => {
                  setFormData(prev => ({ ...prev, type: 'cash' }));
                  setStep(3);
                }}
                className={`p-6 rounded-2xl border-2 transition-all transform hover:scale-105 ${
                  formData.type === 'cash'
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-green-300'
                }`}
              >
                <div className="text-4xl mb-3">💰</div>
                <h3 className="font-bold text-gray-800 mb-1">نقد / Cash</h3>
                <p className="text-gray-500 text-xs">تبادل نقدي</p>
              </button>
            </div>

            <button
              onClick={() => setStep(1)}
              className="mt-8 text-gray-500 hover:text-gray-700"
            >
              ← رجوع / Go back
            </button>
          </div>
        )}

        {/* Step 3: Details */}
        {step === 3 && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              أخبرنا عن العنصر
            </h1>
            <p className="text-gray-600 mb-8 text-center">
              Tell us about it - Add details to help others find your listing
            </p>

            <div className="bg-white rounded-2xl p-6 shadow-lg space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  العنوان / Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder={formData.type === 'goods' ? "e.g., iPhone 13 Pro, 256GB" : formData.type === 'services' ? "e.g., Professional Photography" : "e.g., 5000 EGP Cash"}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                  required
                />

                {/* AI Category Suggestions */}
                <CategorySuggestion
                  suggestions={categorySuggestions}
                  onSelect={handleCategorySuggestionSelect}
                  loading={loadingCategorySuggestion}
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  الوصف / Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe your item in detail... / صف العنصر بالتفصيل..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors resize-none"
                  required
                />
              </div>

              {/* 3-Level Category Selection */}
              {formData.type === 'goods' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📂</span>
                    <label className="text-sm font-semibold text-gray-700">الفئة / Category</label>
                    {loadingCategories && <span className="animate-spin text-xs">⏳</span>}
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    {/* Level 1 - Root Category */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        الفئة الرئيسية / Main Category
                      </label>
                      <select
                        name="categoryLevel1"
                        value={formData.categoryLevel1}
                        onChange={handleChange}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                      >
                        <option value="">اختر الفئة...</option>
                        {rootCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nameEn} - {cat.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Level 2 - Sub Category */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        الفئة الفرعية / Sub Category
                      </label>
                      <select
                        name="categoryLevel2"
                        value={formData.categoryLevel2}
                        onChange={handleChange}
                        disabled={!formData.categoryLevel1 || level2Categories.length === 0}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!formData.categoryLevel1 ? 'اختر الفئة الرئيسية أولاً' : level2Categories.length === 0 ? 'لا توجد فئات فرعية' : 'اختر الفئة الفرعية...'}
                        </option>
                        {level2Categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nameEn} - {cat.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Level 3 - Sub-Sub Category */}
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">
                        الفئة التفصيلية / Detailed Category
                      </label>
                      <select
                        name="categoryLevel3"
                        value={formData.categoryLevel3}
                        onChange={handleChange}
                        disabled={!formData.categoryLevel2 || level3Categories.length === 0}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {!formData.categoryLevel2 ? 'اختر الفئة الفرعية أولاً' : level3Categories.length === 0 ? 'لا توجد فئات تفصيلية' : 'اختر الفئة التفصيلية...'}
                        </option>
                        {level3Categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nameEn} - {cat.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Selected Category Preview */}
                  {formData.selectedCategoryId && (
                    <div className="p-3 bg-purple-50 rounded-xl">
                      <div className="text-xs text-purple-600 font-medium mb-1">الفئة المختارة / Selected Category:</div>
                      <div className="text-sm text-purple-800 font-medium">
                        {getCategoryDisplayName(formData.selectedCategoryId)}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Condition - Only for Goods */}
              {formData.type === 'goods' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    الحالة / Condition *
                  </label>
                  <div className="grid grid-cols-5 gap-2">
                    {CONDITION_OPTIONS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, condition: option.value }))}
                        className={`p-3 rounded-xl border-2 transition-all text-center ${
                          formData.condition === option.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="text-2xl mb-1">{option.icon}</div>
                        <div className="text-xs font-medium text-gray-700">{option.label}</div>
                        <div className="text-xs text-gray-500">{option.labelAr}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Value */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  القيمة التقديرية (ج.م) / Estimated Value (EGP) *
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleChange}
                  placeholder="أدخل المبلغ / Enter amount"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                  required
                />

                {/* AI Price Estimation */}
                <PriceWarning
                  estimation={priceEstimation}
                  enteredPrice={parseInt(formData.value) || 0}
                  loading={loadingPriceEstimation}
                />
              </div>

              {/* Images */}
              {formData.type !== 'cash' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    الصور / Photos {formData.side === 'supply' && '(recommended / مُستحسن)'}
                  </label>
                  <ImageUpload
                    multiple={true}
                    category="items"
                    onUploadComplete={handleImageUpload}
                    maxFiles={5}
                  />
                  {formData.images.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-2">
                      {formData.images.map((url, index) => (
                        <div key={index} className="relative aspect-square rounded-lg overflow-hidden">
                          <img src={url} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Location - Cascading Dropdowns */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📍</span>
                  <label className="text-sm font-semibold text-gray-700">الموقع / Location</label>
                  {loadingLocations && (
                    <span className="animate-spin text-xs">⏳</span>
                  )}
                </div>
                <div className="grid sm:grid-cols-3 gap-4">
                  {/* Governorate */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      المحافظة / Governorate
                    </label>
                    <select
                      value={formData.governorateId}
                      onChange={handleGovernorateChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors"
                    >
                      <option value="">اختر المحافظة...</option>
                      {governorates.map(gov => (
                        <option key={gov.id} value={gov.id}>
                          {gov.nameEn} - {gov.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* City */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      المدينة / City
                    </label>
                    <select
                      value={formData.cityId}
                      onChange={handleCityChange}
                      disabled={!formData.governorateId || cities.length === 0}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.governorateId ? 'اختر المحافظة أولاً' : 'اختر المدينة...'}
                      </option>
                      {cities.map(city => (
                        <option key={city.id} value={city.id}>
                          {city.nameEn} - {city.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* District */}
                  <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      الحي / District
                    </label>
                    <select
                      value={formData.districtId}
                      onChange={handleDistrictChange}
                      disabled={!formData.cityId || districts.length === 0}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                    >
                      <option value="">
                        {!formData.cityId ? 'اختر المدينة أولاً' : districts.length === 0 ? 'لا توجد أحياء متاحة' : 'اختر الحي...'}
                      </option>
                      {districts.map(district => (
                        <option key={district.id} value={district.id}>
                          {district.nameEn} - {district.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Location Preview */}
                {(formData.governorateName || formData.cityName || formData.districtName) && (
                  <div className="p-3 bg-purple-50 rounded-xl">
                    <div className="text-xs text-purple-600 font-medium mb-1">الموقع المختار / Selected Location:</div>
                    <div className="text-sm text-purple-800">
                      {[formData.districtName, formData.cityName, formData.governorateName]
                        .filter(Boolean)
                        .join(', ')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                ← رجوع / Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!formData.title || !formData.description || !formData.value}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg transition-all"
              >
                متابعة / Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Market Selection */}
        {step === 4 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-4">
              اختر نطاق السوق
            </h1>
            <p className="text-gray-600 mb-2">
              Choose Market Scope - حدد النطاق الجغرافي الذي تريد عرض إعلانك فيه
            </p>
            <p className="text-sm text-purple-600 mb-8">
              رسوم موحدة: 25 ج.م + 5% عمولة على كل المستويات
            </p>

            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {(Object.keys(MARKET_CONFIG) as MarketType[]).map((marketId) => {
                const market = MARKET_CONFIG[marketId];
                const isSelected = formData.marketType === marketId;
                const colorClasses = {
                  green: isSelected ? 'border-green-500 bg-green-50' : 'border-gray-200 hover:border-green-300',
                  blue: isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-300',
                  purple: isSelected ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-purple-300',
                  amber: isSelected ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-amber-300',
                };
                return (
                  <button
                    key={marketId}
                    onClick={() => setFormData(prev => ({ ...prev, marketType: marketId }))}
                    className={`p-6 rounded-2xl border-2 transition-all bg-white text-left ${
                      colorClasses[market.color as keyof typeof colorClasses] || colorClasses.green
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-3xl">{market.icon}</span>
                      <div>
                        <h3 className="font-bold text-gray-800">{market.nameAr}</h3>
                        <p className="text-sm text-gray-500">{market.nameEn}</p>
                      </div>
                      {isSelected && (
                        <span className="mr-auto text-2xl text-green-500">✓</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">{market.description}</p>
                  </button>
                );
              })}
            </div>

            {/* Fee info banner */}
            <div className="mt-8 p-4 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-xl max-w-xl mx-auto">
              <div className="flex items-center justify-center gap-2 text-purple-800">
                <span className="text-xl">🇪🇬</span>
                <span className="font-bold">25 ج.م</span>
                <span>رسوم الإدراج</span>
                <span className="mx-2">+</span>
                <span className="font-bold">5%</span>
                <span>عمولة عند البيع</span>
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                ← رجوع / Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                متابعة / Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Listing Type */}
        {step === 5 && (
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">
              كيف تريد {formData.side === 'supply' ? 'البيع' : 'الحصول عليه'}؟
            </h1>
            <p className="text-gray-600 mb-8">
              How do you want to {formData.side === 'supply' ? 'sell' : 'get'} it?
            </p>

            <div className="space-y-4 max-w-xl mx-auto">
              {getListingOptions().map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({ ...prev, listingType: option.value }))}
                  className={`w-full p-6 rounded-2xl border-2 transition-all text-left flex items-center gap-4 ${
                    formData.listingType === option.value
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 bg-white hover:border-purple-300'
                  }`}
                >
                  <div className="text-4xl">{option.icon}</div>
                  <div>
                    <h3 className="font-bold text-gray-800">{option.labelAr} / {option.label}</h3>
                    <p className="text-gray-500 text-sm">{option.desc}</p>
                  </div>
                  {formData.listingType === option.value && (
                    <div className="ml-auto text-purple-600 text-2xl">✓</div>
                  )}
                </button>
              ))}
            </div>

            {/* Additional fields for specific listing types */}
            {formData.listingType === 'auction' && (
              <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg max-w-xl mx-auto">
                <h3 className="font-bold text-gray-800 mb-4">إعدادات المزاد / Auction Settings</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      السعر الابتدائي (ج.م) / Starting Bid (EGP)
                    </label>
                    <input
                      type="number"
                      name="startingBid"
                      value={formData.startingBid}
                      onChange={handleChange}
                      placeholder="e.g., 1000"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      المدة (أيام) / Duration (days)
                    </label>
                    <select
                      name="auctionDuration"
                      value={formData.auctionDuration}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                    >
                      <option value="1">1 day / يوم واحد</option>
                      <option value="3">3 days / 3 أيام</option>
                      <option value="7">7 days / 7 أيام</option>
                      <option value="14">14 days / 14 يوم</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {formData.listingType === 'barter' && (
              <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg max-w-xl mx-auto text-left">
                <h3 className="font-bold text-gray-800 mb-4">ماذا تريد في المقابل؟ / What do you want in exchange?</h3>
                <div className="space-y-4">
                  {/* 3-Level Desired Category Selection */}
                  <div className="space-y-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      الفئة المطلوبة / Desired Category
                    </label>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {/* Desired Level 1 */}
                      <select
                        name="desiredCategoryLevel1"
                        value={formData.desiredCategoryLevel1}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm"
                      >
                        <option value="">أي فئة / Any category</option>
                        {rootCategories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nameEn} - {cat.nameAr}
                          </option>
                        ))}
                      </select>

                      {/* Desired Level 2 */}
                      <select
                        name="desiredCategoryLevel2"
                        value={formData.desiredCategoryLevel2}
                        onChange={handleChange}
                        disabled={!formData.desiredCategoryLevel1}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm disabled:bg-gray-100"
                      >
                        <option value="">الفئة الفرعية...</option>
                        {desiredLevel2Categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nameEn} - {cat.nameAr}
                          </option>
                        ))}
                      </select>

                      {/* Desired Level 3 */}
                      <select
                        name="desiredCategoryLevel3"
                        value={formData.desiredCategoryLevel3}
                        onChange={handleChange}
                        disabled={!formData.desiredCategoryLevel2}
                        className="w-full px-3 py-2 rounded-lg border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-sm disabled:bg-gray-100"
                      >
                        <option value="">الفئة التفصيلية...</option>
                        {desiredLevel3Categories.map(cat => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nameEn} - {cat.nameAr}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Keywords */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      كلمات مفتاحية / Keywords (what you're looking for)
                    </label>
                    <input
                      type="text"
                      name="desiredKeywords"
                      value={formData.desiredKeywords}
                      onChange={handleChange}
                      placeholder="e.g., laptop, MacBook, iPhone"
                      className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                    />
                  </div>

                  {/* Desired Value Range */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      نطاق القيمة المطلوبة (ج.م) / Desired Value Range (EGP)
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <input
                          type="number"
                          name="desiredValueMin"
                          value={formData.desiredValueMin}
                          onChange={handleChange}
                          placeholder="الحد الأدنى / Min"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <input
                          type="number"
                          name="desiredValueMax"
                          value={formData.desiredValueMax}
                          onChange={handleChange}
                          placeholder="الحد الأقصى / Max"
                          className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Real-time matching hint */}
                  <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                    <div className="flex items-center gap-2 text-green-700">
                      <span className="text-xl">🤖</span>
                      <span className="text-sm font-medium">
                        سيُعلمك الذكاء الاصطناعي فوراً عند وجود تطابق مناسب!
                      </span>
                    </div>
                    <p className="text-xs text-green-600 mt-1">
                      Our AI will notify you instantly when a matching item is listed
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                ← رجوع / Back
              </button>
              <button
                onClick={() => formData.side === 'supply' ? setStep(6) : handleSubmit()}
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> جاري الإنشاء...
                  </span>
                ) : formData.side === 'supply' ? (
                  'متابعة / Continue →'
                ) : (
                  'إنشاء الإعلان / Create Listing'
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Review & Submit (Supply only) */}
        {step === 6 && (
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2 text-center">
              مراجعة الإعلان
            </h1>
            <p className="text-gray-600 mb-8 text-center">
              Review Your Listing - تأكد من صحة جميع البيانات قبل النشر
            </p>

            {/* Fraud Warning */}
            {fraudCheck && (
              <div className="mb-6">
                <FraudWarning fraudCheck={fraudCheck} />
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {/* Preview Image */}
              {formData.images.length > 0 ? (
                <div className="aspect-video bg-gray-100">
                  <img src={formData.images[0]} alt="" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="aspect-video bg-gradient-to-br from-purple-100 to-indigo-100 flex items-center justify-center">
                  <span className="text-6xl">
                    {formData.type === 'goods' ? '📦' : formData.type === 'services' ? '🛠️' : '💰'}
                  </span>
                </div>
              )}

              <div className="p-6">
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.listingType === 'direct_sale' ? 'bg-purple-100 text-purple-700' :
                    formData.listingType === 'auction' ? 'bg-indigo-100 text-indigo-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {formData.listingType === 'direct_sale' ? '🏷️ بيع مباشر' :
                     formData.listingType === 'auction' ? '🔨 مزاد' :
                     '🔄 مقايضة'}
                  </span>
                  <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                    {formData.type === 'goods' ? '📦 سلع' : formData.type === 'services' ? '🛠️ خدمات' : '💰 نقد'}
                  </span>
                  {formData.condition && formData.type === 'goods' && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      {CONDITION_OPTIONS.find(c => c.value === formData.condition)?.icon} {formData.condition}
                    </span>
                  )}
                  {/* Market Type Badge */}
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    formData.marketType === 'DISTRICT' ? 'bg-green-100 text-green-700' :
                    formData.marketType === 'CITY' ? 'bg-blue-100 text-blue-700' :
                    formData.marketType === 'GOVERNORATE' ? 'bg-purple-100 text-purple-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {MARKET_CONFIG[formData.marketType].icon} {MARKET_CONFIG[formData.marketType].nameAr}
                  </span>
                </div>

                <h2 className="text-2xl font-bold text-gray-800 mb-2">{formData.title}</h2>
                <p className="text-gray-600 mb-4">{formData.description}</p>

                {/* Category Display */}
                {formData.selectedCategoryId && (
                  <div className="mb-4 p-3 bg-purple-50 rounded-lg">
                    <span className="text-sm text-purple-600 font-medium">الفئة: </span>
                    <span className="text-sm text-purple-800">{getCategoryDisplayName(formData.selectedCategoryId)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <div className="text-sm text-gray-500">القيمة / Value</div>
                    <div className="text-2xl font-bold text-purple-600">
                      {parseInt(formData.value).toLocaleString()} ج.م
                    </div>
                  </div>
                  {formData.governorateName && (
                    <div className="text-right">
                      <div className="text-sm text-gray-500">الموقع / Location</div>
                      <div className="text-gray-800">
                        {[formData.districtName, formData.cityName, formData.governorateName]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    </div>
                  )}
                </div>

                {formData.listingType === 'barter' && (formData.desiredKeywords || formData.desiredCategoryId) && (
                  <div className="mt-4 p-4 bg-green-50 rounded-xl">
                    <div className="text-sm text-green-700 font-medium mb-2">أبحث عن / Looking for:</div>
                    {formData.desiredCategoryId && (
                      <div className="text-green-800 mb-1">
                        📂 {getCategoryDisplayName(formData.desiredCategoryId)}
                      </div>
                    )}
                    {formData.desiredKeywords && (
                      <div className="text-green-800 mb-1">
                        🔍 {formData.desiredKeywords}
                      </div>
                    )}
                    {(formData.desiredValueMin || formData.desiredValueMax) && (
                      <div className="text-green-800">
                        💰 {formData.desiredValueMin || '0'} - {formData.desiredValueMax || '∞'} ج.م
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between mt-8">
              <button
                onClick={() => setStep(5)}
                className="px-6 py-3 text-gray-600 hover:text-gray-800"
              >
                ← رجوع / Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || (fraudCheck?.riskLevel === 'HIGH')}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span> جاري النشر...
                  </span>
                ) : (
                  'نشر الإعلان 🚀 / Publish Listing'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AddInventoryPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    }>
      <AddInventoryContent />
    </Suspense>
  );
}
