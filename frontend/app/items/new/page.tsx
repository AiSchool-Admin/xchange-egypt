'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { createItem } from '@/lib/api/items';
import { getRootCategories, Category } from '@/lib/api/categories';
import { ImageUpload } from '@/components/ui/ImageUpload';
import { useAuth } from '@/lib/contexts/AuthContext';
import { PriceWarning, CategorySuggestion, FraudWarning } from '@/components/ai';
import * as aiApi from '@/lib/api/ai';
import { useDebounce } from '@/lib/hooks/useDebounce';

// Translations
const translations = {
  ar: {
    // Page Header
    pageTitle: 'إضافة منتج جديد',
    pageSubtitle: 'أدخل تفاصيل المنتج أدناه',
    versionBadge: '✅ الإصدار 2.0 - المقايضة متاحة',

    // Requirements
    requirements: 'المعلومات المطلوبة',
    reqTitle: 'العنوان: 3 حروف على الأقل، 200 كحد أقصى',
    reqDescription: 'الوصف: 10 حروف على الأقل (كن مفصلاً!)',
    reqCategory: 'الفئة: اختر من القائمة',
    reqCondition: 'الحالة: اختر حالة المنتج',
    reqValue: 'القيمة المقدرة: اختياري (يساعد في المطابقة)',
    reqGovernorate: 'المحافظة: اختر محافظتك',
    reqLocation: 'الموقع: الحي/المنطقة (3 حروف على الأقل)',
    reqPhotos: 'الصور: اختياري لكن يُنصح به',

    // Form Fields
    title: 'العنوان',
    titlePlaceholder: 'مثال: iPhone 12 Pro Max 256GB',
    minChars: 'حد أدنى 3 حروف',
    characters: 'حرف',

    description: 'الوصف',
    descriptionPlaceholder: 'اوصف منتجك بالتفصيل (10 حروف على الأقل)...',
    needMoreChars: 'تحتاج {count} حرف إضافي (10 على الأقل)',
    minRequirementMet: 'الحد الأدنى متحقق ✓',

    // Categories
    mainCategory: 'الفئة الرئيسية',
    subCategory: 'الفئة الفرعية',
    subSubCategory: 'الفئة الفرع-فرعية',
    selectCategory: 'اختر الفئة',
    selectMainFirst: 'اختر الفئة الرئيسية أولاً',
    selectSubFirst: 'اختر الفئة الفرعية أولاً',
    noSubCategories: 'لا توجد فئات فرعية',
    noSubSubCategories: 'لا توجد فئات فرع-فرعية',

    // Condition
    condition: 'الحالة',
    conditionNew: 'جديد',
    conditionLikeNew: 'شبه جديد',
    conditionGood: 'جيد',
    conditionFair: 'مقبول',
    conditionPoor: 'ضعيف',

    // Price
    estimatedValue: 'القيمة المقدرة (جنيه)',
    pricePlaceholder: 'مثال: 15000',
    priceOptional: 'اختياري - القيمة المقدرة للمنتج',

    // Location
    governorate: 'المحافظة',
    selectGovernorate: 'اختر المحافظة',
    location: 'الموقع',
    locationPlaceholder: 'مثال: مدينة نصر، وسط البلد',
    locationHelp: 'الحي أو المنطقة (3 حروف على الأقل)',
    locationNeedMore: 'تحتاج {count} حرف إضافي (3 على الأقل)',

    // Governorates
    cairo: 'القاهرة',
    giza: 'الجيزة',
    alexandria: 'الإسكندرية',
    dakahlia: 'الدقهلية',
    redSea: 'البحر الأحمر',
    beheira: 'البحيرة',
    fayoum: 'الفيوم',
    gharbiya: 'الغربية',
    ismailia: 'الإسماعيلية',
    menofia: 'المنوفية',
    minya: 'المنيا',
    qaliubiya: 'القليوبية',
    newValley: 'الوادي الجديد',
    suez: 'السويس',
    aswan: 'أسوان',
    assiut: 'أسيوط',
    beniSuef: 'بني سويف',
    portSaid: 'بورسعيد',
    damietta: 'دمياط',
    sharkia: 'الشرقية',
    southSinai: 'جنوب سيناء',
    kafrElSheikh: 'كفر الشيخ',
    matrouh: 'مطروح',
    luxor: 'الأقصر',
    qena: 'قنا',
    northSinai: 'شمال سيناء',
    sohag: 'سوهاج',

    // Barter Section
    barterPreferences: 'تفضيلات المقايضة',
    barterDescription: 'تفعيل مبادلة هذا المنتج بمنتجات أخرى',
    barterTip: 'حدد ما تبحث عنه في المقابل. نظام المطابقة الذكي سيجد أفضل الصفقات لك!',
    whatYouWant: 'ماذا تريد في المقابل؟',
    whatYouWantPlaceholder: 'مثال: سيارة سيدان موديل 2020',
    whatYouWantHelp: 'أدخل اسم الصنف المطلوب بالتحديد',
    desiredDescription: 'وصف الصنف المطلوب',
    desiredDescriptionPlaceholder: 'مثال: أريد سيارة سيدان بحالة جيدة، موديل 2018 أو أحدث',
    desiredCategory: 'الفئة المطلوبة',
    anyCategory: 'أي فئة',
    desiredSubCategory: 'الفئة الفرعية المطلوبة',
    anySubCategory: 'أي فئة فرعية',
    desiredKeywords: 'كلمات مفتاحية',
    keywordsPlaceholder: 'مثال: ماك بوك، لابتوب، ديل (مفصولة بفاصلة)',
    keywordsHelp: 'أضف كلمات مفتاحية للعثور على تطابقات أفضل',
    minValue: 'الحد الأدنى (جنيه)',
    maxValue: 'الحد الأقصى (جنيه)',
    proTip: 'نصيحة احترافية:',
    proTipText: 'كلما كنت أكثر تحديداً، كلما حصلت على تطابقات أفضل! سيُعلمك الذكاء الاصطناعي فوراً عند إدراج منتج مطابق.',

    // Images
    photos: 'الصور',

    // Buttons
    cancel: 'إلغاء',
    listItem: 'إضافة المنتج',
    creating: 'جاري الإنشاء...',

    // Errors
    titleError: 'العنوان يجب أن يكون 3 حروف على الأقل',
    descriptionError: 'الوصف يجب أن يكون 10 حروف على الأقل',
    categoryError: 'الرجاء اختيار فئة',
    governorateError: 'الرجاء اختيار محافظة',
    locationError: 'الموقع يجب أن يكون 3 حروف على الأقل',
    fraudError: 'هذا الإعلان يحتوي على مؤشرات مشبوهة. يرجى مراجعة التحذيرات أدناه.',
    createError: 'فشل إنشاء المنتج. يرجى التحقق من جميع الحقول.',

    // Required
    required: '*',
  },
  en: {
    // Page Header
    pageTitle: 'Add New Product',
    pageSubtitle: 'Fill in the details below to list your item',
    versionBadge: '✅ VERSION 2.0 - BARTER ENABLED',

    // Requirements
    requirements: 'Required Information',
    reqTitle: 'Title: Minimum 3 characters, maximum 200',
    reqDescription: 'Description: Minimum 10 characters (be detailed!)',
    reqCategory: 'Category: Select from dropdown',
    reqCondition: 'Condition: Choose item condition',
    reqValue: 'Estimated Value: Optional (helps with barter matching)',
    reqGovernorate: 'Governorate: Select your governorate',
    reqLocation: 'Location: Area/neighborhood (minimum 3 characters)',
    reqPhotos: 'Photos: Optional but recommended',

    // Form Fields
    title: 'Title',
    titlePlaceholder: 'e.g., iPhone 12 Pro Max 256GB',
    minChars: 'Minimum 3 characters',
    characters: 'characters',

    description: 'Description',
    descriptionPlaceholder: 'Describe your item in detail (minimum 10 characters)...',
    needMoreChars: 'Need {count} more characters (minimum 10)',
    minRequirementMet: 'Minimum requirement met ✓',

    // Categories
    mainCategory: 'Main Category',
    subCategory: 'Sub-Category',
    subSubCategory: 'Sub-Sub-Category',
    selectCategory: 'Select category',
    selectMainFirst: 'Select main category first',
    selectSubFirst: 'Select sub-category first',
    noSubCategories: 'No sub-categories',
    noSubSubCategories: 'No sub-sub-categories',

    // Condition
    condition: 'Condition',
    conditionNew: 'New',
    conditionLikeNew: 'Like New',
    conditionGood: 'Good',
    conditionFair: 'Fair',
    conditionPoor: 'Poor',

    // Price
    estimatedValue: 'Estimated Value (EGP)',
    pricePlaceholder: 'e.g., 15000',
    priceOptional: 'Optional - estimated value of the item',

    // Location
    governorate: 'Governorate',
    selectGovernorate: 'Select governorate',
    location: 'Location',
    locationPlaceholder: 'e.g., Nasr City, Downtown',
    locationHelp: 'Area or neighborhood (minimum 3 characters)',
    locationNeedMore: 'Need {count} more characters (minimum 3)',

    // Governorates
    cairo: 'Cairo',
    giza: 'Giza',
    alexandria: 'Alexandria',
    dakahlia: 'Dakahlia',
    redSea: 'Red Sea',
    beheira: 'Beheira',
    fayoum: 'Fayoum',
    gharbiya: 'Gharbiya',
    ismailia: 'Ismailia',
    menofia: 'Menofia',
    minya: 'Minya',
    qaliubiya: 'Qaliubiya',
    newValley: 'New Valley',
    suez: 'Suez',
    aswan: 'Aswan',
    assiut: 'Assiut',
    beniSuef: 'Beni Suef',
    portSaid: 'Port Said',
    damietta: 'Damietta',
    sharkia: 'Sharkia',
    southSinai: 'South Sinai',
    kafrElSheikh: 'Kafr El Sheikh',
    matrouh: 'Matrouh',
    luxor: 'Luxor',
    qena: 'Qena',
    northSinai: 'North Sinai',
    sohag: 'Sohag',

    // Barter Section
    barterPreferences: 'Barter Preferences',
    barterDescription: 'Enable trading this item for other items',
    barterTip: 'Specify what you\'re looking for in exchange. Our smart matching system will find the best trades for you!',
    whatYouWant: 'What do you want in exchange?',
    whatYouWantPlaceholder: 'e.g., Sedan car 2020 model',
    whatYouWantHelp: 'Enter the specific item name you want',
    desiredDescription: 'Desired Item Description',
    desiredDescriptionPlaceholder: 'e.g., I want a sedan car in good condition, 2018 model or newer',
    desiredCategory: 'Desired Category',
    anyCategory: 'Any category',
    desiredSubCategory: 'Desired Sub-Category',
    anySubCategory: 'Any sub-category',
    desiredKeywords: 'Desired Keywords',
    keywordsPlaceholder: 'e.g., MacBook, laptop, Dell XPS (comma-separated)',
    keywordsHelp: 'Add keywords to help find better matches',
    minValue: 'Min Value (EGP)',
    maxValue: 'Max Value (EGP)',
    proTip: 'Pro Tip:',
    proTipText: 'The more specific you are, the better matches you\'ll get! Our AI will notify you instantly when a matching item is listed.',

    // Images
    photos: 'Photos',

    // Buttons
    cancel: 'Cancel',
    listItem: 'List Item',
    creating: 'Creating...',

    // Errors
    titleError: 'Title must be at least 3 characters long',
    descriptionError: 'Description must be at least 10 characters long',
    categoryError: 'Please select a category',
    governorateError: 'Please select a governorate',
    locationError: 'Location must be at least 3 characters long',
    fraudError: 'This listing has suspicious indicators. Please review the warnings below.',
    createError: 'Failed to create item. Please check all fields.',

    // Required
    required: '*',
  },
};

type Language = 'ar' | 'en';

// Mapping for governorate names (Arabic -> English value)
const governorateMapping: { [key: string]: string } = {
  // Arabic names
  'القاهرة': 'Cairo',
  'الجيزة': 'Giza',
  'الإسكندرية': 'Alexandria',
  'الاسكندرية': 'Alexandria',
  'الدقهلية': 'Dakahlia',
  'البحر الأحمر': 'Red Sea',
  'البحيرة': 'Beheira',
  'الفيوم': 'Fayoum',
  'الغربية': 'Gharbiya',
  'الإسماعيلية': 'Ismailia',
  'الاسماعيلية': 'Ismailia',
  'المنوفية': 'Menofia',
  'المنيا': 'Minya',
  'القليوبية': 'Qaliubiya',
  'الوادي الجديد': 'New Valley',
  'السويس': 'Suez',
  'أسوان': 'Aswan',
  'اسوان': 'Aswan',
  'أسيوط': 'Assiut',
  'اسيوط': 'Assiut',
  'بني سويف': 'Beni Suef',
  'بورسعيد': 'Port Said',
  'دمياط': 'Damietta',
  'الشرقية': 'Sharkia',
  'جنوب سيناء': 'South Sinai',
  'كفر الشيخ': 'Kafr El Sheikh',
  'مطروح': 'Matrouh',
  'الأقصر': 'Luxor',
  'الاقصر': 'Luxor',
  'قنا': 'Qena',
  'شمال سيناء': 'North Sinai',
  'سوهاج': 'Sohag',
  // English names (for case-insensitive matching)
  'cairo': 'Cairo',
  'giza': 'Giza',
  'alexandria': 'Alexandria',
  'dakahlia': 'Dakahlia',
  'red sea': 'Red Sea',
  'beheira': 'Beheira',
  'fayoum': 'Fayoum',
  'gharbiya': 'Gharbiya',
  'ismailia': 'Ismailia',
  'menofia': 'Menofia',
  'minya': 'Minya',
  'qaliubiya': 'Qaliubiya',
  'new valley': 'New Valley',
  'suez': 'Suez',
  'aswan': 'Aswan',
  'assiut': 'Assiut',
  'beni suef': 'Beni Suef',
  'port said': 'Port Said',
  'damietta': 'Damietta',
  'sharkia': 'Sharkia',
  'south sinai': 'South Sinai',
  'kafr el sheikh': 'Kafr El Sheikh',
  'matrouh': 'Matrouh',
  'luxor': 'Luxor',
  'qena': 'Qena',
  'north sinai': 'North Sinai',
  'sohag': 'Sohag',
};

// Function to normalize governorate name to English value
const normalizeGovernorate = (value: string | undefined): string => {
  if (!value) return '';

  // Check if it's already a valid English value
  const validValues = [
    'Cairo', 'Giza', 'Alexandria', 'Dakahlia', 'Red Sea', 'Beheira', 'Fayoum',
    'Gharbiya', 'Ismailia', 'Menofia', 'Minya', 'Qaliubiya', 'New Valley', 'Suez',
    'Aswan', 'Assiut', 'Beni Suef', 'Port Said', 'Damietta', 'Sharkia', 'South Sinai',
    'Kafr El Sheikh', 'Matrouh', 'Luxor', 'Qena', 'North Sinai', 'Sohag'
  ];

  if (validValues.includes(value)) {
    return value;
  }

  // Try to find in mapping (Arabic or lowercase English)
  const mapped = governorateMapping[value] || governorateMapping[value.toLowerCase()];
  if (mapped) {
    return mapped;
  }

  // Return empty if not found (will show placeholder in dropdown)
  return '';
};

export default function NewItemPage() {
  const router = useRouter();
  const { user } = useAuth();

  // Language state - default to Arabic
  const [lang, setLang] = useState<Language>('ar');
  const t = translations[lang];
  const isRTL = lang === 'ar';

  const [categories, setCategories] = useState<Category[]>([]);
  const [level2Categories, setLevel2Categories] = useState<Category[]>([]);
  const [level3Categories, setLevel3Categories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);

  // Ref to track when setting from AI suggestion
  const isSettingFromAISuggestion = useRef(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    categoryLevel1: '',
    categoryLevel2: '',
    categoryLevel3: '',
    selectedCategoryId: '',
    condition: 'GOOD',
    price: '',
    location: '',
    governorate: '',
    // Barter preferences
    enableBarter: false,
    desiredItemTitle: '',
    desiredItemDescription: '',
    desiredParentCategoryId: '',
    desiredCategoryId: '',
    desiredKeywords: '',
    desiredValueMin: '',
    desiredValueMax: '',
  });

  // AI Features State
  const [priceEstimation, setPriceEstimation] = useState<aiApi.PriceEstimationResponse | null>(null);
  const [priceLoading, setPriceLoading] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<aiApi.CategorySuggestion[]>([]);
  const [categoryLoading, setCategoryLoading] = useState(false);
  const [fraudCheck, setFraudCheck] = useState<aiApi.FraudCheckResponse | null>(null);

  // Debounced values for AI calls
  const debouncedTitle = useDebounce(formData.title, 1000);
  const debouncedPrice = useDebounce(formData.price, 800);

  // Desired categories for barter
  const desiredParent = categories.find(cat => cat.id === formData.desiredParentCategoryId);
  const desiredSubCategories = desiredParent?.children || [];

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadCategories();

    // Auto-fill location from user profile
    if (user.governorate || user.city || user.district) {
      const normalizedGovernorate = normalizeGovernorate(user.governorate);
      setFormData(prev => ({
        ...prev,
        governorate: normalizedGovernorate,
        location: user.district || user.city || '',
      }));
    }
  }, [user, router]);

  const loadCategories = async () => {
    try {
      const response = await getRootCategories();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to load categories:', err);
      setCategories([]);
    }
  };

  // Load level 2 categories when level 1 changes
  useEffect(() => {
    if (formData.categoryLevel1) {
      const parentCategory = categories.find(c => c.id === formData.categoryLevel1);
      if (parentCategory?.children) {
        setLevel2Categories(parentCategory.children);
      } else {
        setLevel2Categories([]);
      }

      // Only reset child values if NOT setting from AI suggestion
      if (!isSettingFromAISuggestion.current) {
        setLevel3Categories([]);
        setFormData(prev => ({
          ...prev,
          categoryLevel2: '',
          categoryLevel3: '',
          selectedCategoryId: formData.categoryLevel1,
        }));
      }
    } else {
      setLevel2Categories([]);
      setLevel3Categories([]);
    }
  }, [formData.categoryLevel1, categories]);

  // Load level 3 categories when level 2 changes
  useEffect(() => {
    if (formData.categoryLevel2) {
      const level2Category = level2Categories.find(c => c.id === formData.categoryLevel2);
      if (level2Category?.children) {
        setLevel3Categories(level2Category.children);
      } else {
        setLevel3Categories([]);
      }

      // Only reset child values if NOT setting from AI suggestion
      if (!isSettingFromAISuggestion.current) {
        setFormData(prev => ({
          ...prev,
          categoryLevel3: '',
          selectedCategoryId: formData.categoryLevel2,
        }));
      }
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

  // AI: Auto-categorize when title changes
  const suggestCategory = async () => {
    if (!debouncedTitle || debouncedTitle.length < 3) return;

    setCategoryLoading(true);
    try {
      const result = await aiApi.categorizeItem({
        title: debouncedTitle,
        description: formData.description,
      });

      if (result && result.success) {
        setCategorySuggestions([result.category, ...result.alternatives]);
      }
    } catch (error) {
      console.error('Category suggestion error:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  // AI: Validate price
  const validatePriceWithAI = async () => {
    const price = parseFloat(debouncedPrice);
    if (isNaN(price) || price <= 0 || !formData.selectedCategoryId) return;

    setPriceLoading(true);
    try {
      const result = await aiApi.estimatePrice({
        title: formData.title,
        description: formData.description,
        categoryId: formData.selectedCategoryId,
        condition: formData.condition as any,
        estimatedValue: price,
      });

      setPriceEstimation(result);
    } catch (error) {
      console.error('Price estimation error:', error);
    } finally {
      setPriceLoading(false);
    }
  };

  // AI: Handle category selection from AI suggestion - Apply all 3 levels at once
  const handleAICategorySelect = (categoryId: string) => {
    // Find the category path in the tree
    const findCategoryPath = (cats: Category[], targetId: string, path: Category[][] = []): Category[][] | null => {
      for (const cat of cats) {
        if (cat.id === targetId) {
          return [...path, [cat]];
        }
        if (cat.children) {
          const found = findCategoryPath(cat.children, targetId, [...path, [cat]]);
          if (found) return found;
        }
      }
      return null;
    };

    const categoryPathWithObjects = findCategoryPath(categories, categoryId);
    if (categoryPathWithObjects && categoryPathWithObjects.length > 0) {
      // Set flag to prevent useEffects from resetting values
      isSettingFromAISuggestion.current = true;

      // Extract IDs from the path
      const level1Id = categoryPathWithObjects[0]?.[0]?.id || '';
      const level2Id = categoryPathWithObjects[1]?.[0]?.id || '';
      const level3Id = categoryPathWithObjects[2]?.[0]?.id || '';

      // Also populate the level2 and level3 category arrays directly
      const level1Category = categories.find(c => c.id === level1Id);
      if (level1Category?.children) {
        setLevel2Categories(level1Category.children);

        // If there's a level 2 selected, populate level 3 as well
        if (level2Id) {
          const level2Category = level1Category.children.find(c => c.id === level2Id);
          if (level2Category?.children) {
            setLevel3Categories(level2Category.children);
          } else {
            setLevel3Categories([]);
          }
        }
      }

      // Set all form data at once
      setFormData(prev => ({
        ...prev,
        categoryLevel1: level1Id,
        categoryLevel2: level2Id,
        categoryLevel3: level3Id,
        selectedCategoryId: categoryId,
      }));

      // Clear suggestions after selection
      setCategorySuggestions([]);

      // Reset the flag after a short delay
      setTimeout(() => {
        isSettingFromAISuggestion.current = false;
      }, 100);
    }
  };

  // AI: Run fraud check before submit
  const runFraudCheck = async (): Promise<boolean> => {
    const result = await aiApi.checkListing({
      title: formData.title,
      description: formData.description,
      price: parseFloat(formData.price) || 0,
      categoryId: formData.selectedCategoryId,
      images: uploadedImages,
    });

    setFraudCheck(result);

    if (result && result.riskLevel === 'HIGH') {
      setError(t.fraudError);
      return false;
    }

    return true;
  };

  // AI: Effects for auto-suggestions
  useEffect(() => {
    if (debouncedTitle.length >= 3) {
      suggestCategory();
    }
  }, [debouncedTitle, formData.description]);

  useEffect(() => {
    if (debouncedPrice && formData.selectedCategoryId) {
      validatePriceWithAI();
    }
  }, [debouncedPrice, formData.selectedCategoryId, formData.condition]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;

    // Reset sub-category when parent category changes
    if (name === 'desiredParentCategoryId') {
      setFormData({
        ...formData,
        desiredParentCategoryId: value,
        desiredCategoryId: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: newValue,
      });
    }
  };

  const handleUploadComplete = (urls: string[]) => {
    setUploadedImages((prev) => [...prev, ...urls]);
    setError('');
  };

  const handleUploadError = (errorMsg: string) => {
    setError(errorMsg);
  };

  const removeImage = (url: string) => {
    setUploadedImages((prev) => prev.filter((img) => img !== url));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!formData.title || formData.title.length < 3) {
      setError(t.titleError);
      return;
    }

    if (!formData.description || formData.description.length < 10) {
      setError(t.descriptionError);
      return;
    }

    if (!formData.selectedCategoryId) {
      setError(t.categoryError);
      return;
    }

    if (!formData.governorate) {
      setError(t.governorateError);
      return;
    }

    if (!formData.location || formData.location.length < 3) {
      setError(t.locationError);
      return;
    }

    try {
      setLoading(true);
      const itemData: any = {
        titleAr: formData.title,
        titleEn: formData.title,
        descriptionAr: formData.description,
        descriptionEn: formData.description,
        categoryId: formData.selectedCategoryId,
        condition: formData.condition,
        estimatedValue: formData.price ? parseFloat(formData.price) : 0,
        location: formData.location,
        governorate: formData.governorate,
        imageUrls: uploadedImages.length > 0 ? uploadedImages : undefined,
      };

      // Add barter preferences if enabled
      if (formData.enableBarter) {
        if (formData.desiredItemTitle) {
          itemData.desiredItemTitle = formData.desiredItemTitle;
        }
        if (formData.desiredItemDescription) {
          itemData.desiredItemDescription = formData.desiredItemDescription;
        }
        if (formData.desiredCategoryId) {
          itemData.desiredCategoryId = formData.desiredCategoryId;
        }
        if (formData.desiredKeywords) {
          itemData.desiredKeywords = formData.desiredKeywords;
        }
        if (formData.desiredValueMin) {
          itemData.desiredValueMin = parseFloat(formData.desiredValueMin);
        }
        if (formData.desiredValueMax) {
          itemData.desiredValueMax = parseFloat(formData.desiredValueMax);
        }
      }

      await createItem(itemData);

      router.push('/items?success=true');
    } catch (err: any) {
      setError(err.response?.data?.message || t.createError);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  // Governorates list with translations
  const governorates = [
    { value: 'Cairo', label: t.cairo },
    { value: 'Giza', label: t.giza },
    { value: 'Alexandria', label: t.alexandria },
    { value: 'Dakahlia', label: t.dakahlia },
    { value: 'Red Sea', label: t.redSea },
    { value: 'Beheira', label: t.beheira },
    { value: 'Fayoum', label: t.fayoum },
    { value: 'Gharbiya', label: t.gharbiya },
    { value: 'Ismailia', label: t.ismailia },
    { value: 'Menofia', label: t.menofia },
    { value: 'Minya', label: t.minya },
    { value: 'Qaliubiya', label: t.qaliubiya },
    { value: 'New Valley', label: t.newValley },
    { value: 'Suez', label: t.suez },
    { value: 'Aswan', label: t.aswan },
    { value: 'Assiut', label: t.assiut },
    { value: 'Beni Suef', label: t.beniSuef },
    { value: 'Port Said', label: t.portSaid },
    { value: 'Damietta', label: t.damietta },
    { value: 'Sharkia', label: t.sharkia },
    { value: 'South Sinai', label: t.southSinai },
    { value: 'Kafr El Sheikh', label: t.kafrElSheikh },
    { value: 'Matrouh', label: t.matrouh },
    { value: 'Luxor', label: t.luxor },
    { value: 'Qena', label: t.qena },
    { value: 'North Sinai', label: t.northSinai },
    { value: 'Sohag', label: t.sohag },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Header with Language Switcher */}
          <div className="mb-6 flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{t.pageTitle}</h1>
              <p className="text-gray-600 mt-1">{t.pageSubtitle}</p>
              <div className="mt-2 inline-block px-3 py-1 bg-green-100 text-green-800 text-xs font-bold rounded-full">
                {t.versionBadge}
              </div>
            </div>
            <button
              onClick={() => setLang(lang === 'ar' ? 'en' : 'ar')}
              className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <span className="text-lg">{lang === 'ar' ? '🇬🇧' : '🇪🇬'}</span>
              <span className="text-sm font-medium">{lang === 'ar' ? 'English' : 'العربية'}</span>
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {/* AI: Fraud Warning */}
          {fraudCheck && fraudCheck.riskLevel !== 'LOW' && <FraudWarning fraudCheck={fraudCheck} />}

          {/* Requirements Info Box */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 text-sm mb-2">📋 {t.requirements}</h3>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• {t.reqTitle}</li>
              <li>• {t.reqDescription}</li>
              <li>• {t.reqCategory}</li>
              <li>• {t.reqCondition}</li>
              <li>• {t.reqValue}</li>
              <li>• {t.reqGovernorate}</li>
              <li>• {t.reqLocation}</li>
              <li>• {t.reqPhotos}</li>
            </ul>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.title} <span className="text-red-500">{t.required}</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={200}
                placeholder={t.titlePlaceholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={formData.title.length < 3 ? 'text-red-500' : 'text-gray-500'}>
                  {t.minChars}
                </span>
                <span className="text-gray-500">{formData.title.length}/200 {t.characters}</span>
              </div>

              {/* AI: Category Suggestions */}
              {categorySuggestions.length > 0 && (
                <CategorySuggestion
                  suggestions={categorySuggestions}
                  onSelect={handleAICategorySelect}
                  loading={categoryLoading}
                />
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.description} <span className="text-red-500">{t.required}</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                placeholder={t.descriptionPlaceholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <div className="flex justify-between text-xs mt-1">
                <span className={formData.description.length < 10 ? 'text-red-500 font-medium' : 'text-gray-500'}>
                  {formData.description.length < 10
                    ? t.needMoreChars.replace('{count}', String(10 - formData.description.length))
                    : t.minRequirementMet}
                </span>
                <span className="text-gray-500">{formData.description.length}/5000 {t.characters}</span>
              </div>
            </div>

            {/* 3-Level Categories */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Level 1 - Main Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.mainCategory} <span className="text-red-500">{t.required}</span>
                </label>
                <select
                  name="categoryLevel1"
                  value={formData.categoryLevel1}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">{t.selectCategory}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {isRTL ? cat.nameAr : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level 2 - Sub Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.subCategory}
                </label>
                <select
                  name="categoryLevel2"
                  value={formData.categoryLevel2}
                  onChange={handleChange}
                  disabled={!formData.categoryLevel1 || level2Categories.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.categoryLevel1 ? t.selectMainFirst : level2Categories.length === 0 ? t.noSubCategories : t.selectCategory}
                  </option>
                  {level2Categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {isRTL ? cat.nameAr : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level 3 - Sub-Sub Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.subSubCategory}
                </label>
                <select
                  name="categoryLevel3"
                  value={formData.categoryLevel3}
                  onChange={handleChange}
                  disabled={!formData.categoryLevel2 || level3Categories.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                >
                  <option value="">
                    {!formData.categoryLevel2 ? t.selectSubFirst : level3Categories.length === 0 ? t.noSubSubCategories : t.selectCategory}
                  </option>
                  {level3Categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {isRTL ? cat.nameAr : cat.nameEn}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Condition */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.condition} <span className="text-red-500">{t.required}</span>
              </label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="NEW">{t.conditionNew}</option>
                <option value="LIKE_NEW">{t.conditionLikeNew}</option>
                <option value="GOOD">{t.conditionGood}</option>
                <option value="FAIR">{t.conditionFair}</option>
                <option value="POOR">{t.conditionPoor}</option>
              </select>
            </div>

            {/* Price/Estimated Value */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.estimatedValue}
              </label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleChange}
                min="0"
                step="0.01"
                placeholder={t.pricePlaceholder}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
              <p className="text-xs text-gray-500 mt-1">{t.priceOptional}</p>

              {/* AI: Price Warning */}
              {formData.price && formData.selectedCategoryId && (
                <PriceWarning
                  estimation={priceEstimation}
                  enteredPrice={parseFloat(formData.price)}
                  loading={priceLoading}
                />
              )}
            </div>

            {/* Location and Governorate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.governorate} <span className="text-red-500">{t.required}</span>
                </label>
                <select
                  name="governorate"
                  value={formData.governorate}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="">{t.selectGovernorate}</option>
                  {governorates.map((gov) => (
                    <option key={gov.value} value={gov.value}>
                      {gov.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.location} <span className="text-red-500">{t.required}</span>
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  minLength={3}
                  maxLength={200}
                  placeholder={t.locationPlaceholder}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className={`text-xs mt-1 ${formData.location.length > 0 && formData.location.length < 3 ? 'text-red-500' : 'text-gray-500'}`}>
                  {formData.location.length > 0 && formData.location.length < 3
                    ? t.locationNeedMore.replace('{count}', String(3 - formData.location.length))
                    : t.locationHelp}
                </p>
              </div>
            </div>

            {/* Barter Preferences Section */}
            <div className="border-t border-gray-200 pt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">🔄 {t.barterPreferences}</h3>
                  <p className="text-sm text-gray-600">{t.barterDescription}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    name="enableBarter"
                    checked={formData.enableBarter}
                    onChange={handleChange}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600"></div>
                </label>
              </div>

              {formData.enableBarter && (
                <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800 mb-4">
                    ✨ {t.barterTip}
                  </p>

                  {/* Desired Item Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.whatYouWant} <span className="text-red-500">{t.required}</span>
                    </label>
                    <input
                      type="text"
                      name="desiredItemTitle"
                      value={formData.desiredItemTitle}
                      onChange={handleChange}
                      placeholder={t.whatYouWantPlaceholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      {t.whatYouWantHelp}
                    </p>
                  </div>

                  {/* Desired Item Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.desiredDescription}
                    </label>
                    <textarea
                      name="desiredItemDescription"
                      value={formData.desiredItemDescription}
                      onChange={handleChange}
                      rows={3}
                      placeholder={t.desiredDescriptionPlaceholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Desired Category */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.desiredCategory}
                      </label>
                      <select
                        name="desiredParentCategoryId"
                        value={formData.desiredParentCategoryId}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      >
                        <option value="">{t.anyCategory}</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {isRTL ? cat.nameAr : cat.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.desiredSubCategory}
                      </label>
                      <select
                        name="desiredCategoryId"
                        value={formData.desiredCategoryId}
                        onChange={handleChange}
                        disabled={!formData.desiredParentCategoryId}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                      >
                        <option value="">
                          {formData.desiredParentCategoryId ? t.anySubCategory : t.selectMainFirst}
                        </option>
                        {desiredSubCategories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {isRTL ? cat.nameAr : cat.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Desired Keywords */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.desiredKeywords}
                    </label>
                    <input
                      type="text"
                      name="desiredKeywords"
                      value={formData.desiredKeywords}
                      onChange={handleChange}
                      placeholder={t.keywordsPlaceholder}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-600 mt-1">
                      {t.keywordsHelp}
                    </p>
                  </div>

                  {/* Desired Value Range */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.minValue}
                      </label>
                      <input
                        type="number"
                        name="desiredValueMin"
                        value={formData.desiredValueMin}
                        onChange={handleChange}
                        min="0"
                        step="100"
                        placeholder="12000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t.maxValue}
                      </label>
                      <input
                        type="number"
                        name="desiredValueMax"
                        value={formData.desiredValueMax}
                        onChange={handleChange}
                        min="0"
                        step="100"
                        placeholder="18000"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="p-3 bg-white border border-green-300 rounded-lg">
                    <p className="text-xs text-green-800">
                      💡 <strong>{t.proTip}</strong> {t.proTipText}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.photos}</label>
              <ImageUpload onUploadComplete={handleUploadComplete} onUploadError={handleUploadError} />

              {uploadedImages.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                  {uploadedImages.map((url, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={url}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(url)}
                        className={`absolute top-2 ${isRTL ? 'left-2' : 'right-2'} bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition`}
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition"
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t.creating : t.listItem}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
