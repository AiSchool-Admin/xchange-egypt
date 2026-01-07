'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { getItems, Item } from '@/lib/api/items';
import { getCategoryTree, Category } from '@/lib/api/categories';

// Extended Category type with children
interface CategoryWithChildren extends Category {
  children?: CategoryWithChildren[];
}
import LocationSelector, { LocationSelection } from '@/components/LocationSelector';
import { getLocationLabel, getGovernorateNameAr, getCityNameAr, getDistrictNameAr } from '@/lib/data/egyptLocations';
import ItemCard, { ItemCardSkeleton, ItemCardProps } from '@/components/ui/ItemCard';
import { useAuth } from '@/lib/contexts/AuthContext';

// New enhanced components
import SmartSearch from '@/components/items/SmartSearch';
import QuickViewModal from '@/components/items/QuickViewModal';
import PriceRangeSlider from '@/components/items/PriceRangeSlider';
import RecentlyViewed, { addToRecentlyViewed } from '@/components/items/RecentlyViewed';

// ============================================
// Cross-Market Navigation
// ============================================
const MARKET_TABS_CONFIG = [
  { id: 'all', nameKey: 'all', icon: '🛒', href: '/items', active: true },
  { id: 'sale', nameKey: 'forSale', icon: '🏷️', listingType: 'DIRECT_SALE' },
  { id: 'auction', nameKey: 'auctions', icon: '🔨', href: '/auctions' },
  { id: 'barter', nameKey: 'barter', icon: '🔄', listingType: 'BARTER' },
  { id: 'wanted', nameKey: 'wanted', icon: '🔍', listingType: 'DIRECT_BUY' },
  { id: 'tenders', nameKey: 'tenders', icon: '📋', href: '/reverse-auctions' },
];

const SPECIALIZED_MARKETS_CONFIG = [
  { id: 'cars', nameKey: 'cars', icon: '🚗', href: '/cars', color: 'bg-blue-500' },
  { id: 'properties', nameKey: 'properties', icon: '🏠', href: '/properties', color: 'bg-emerald-500' },
  { id: 'mobiles', nameKey: 'mobiles', icon: '📱', href: '/mobiles', color: 'bg-violet-500' },
  { id: 'gold', nameKey: 'gold', icon: '💰', href: '/gold', color: 'bg-yellow-500' },
  { id: 'silver', nameKey: 'silver', icon: '🥈', href: '/silver', color: 'bg-slate-400' },
  { id: 'luxury', nameKey: 'luxury', icon: '👑', href: '/luxury', color: 'bg-purple-500' },
  { id: 'scrap', nameKey: 'scrap', icon: '♻️', href: '/scrap', color: 'bg-green-500' },
];

// ============================================
// Constants
// ============================================
const CONDITIONS_CONFIG = [
  { value: 'NEW', labelKey: 'new', icon: '✨' },
  { value: 'LIKE_NEW', labelKey: 'likeNew', icon: '🌟' },
  { value: 'GOOD', labelKey: 'good', icon: '👍' },
  { value: 'FAIR', labelKey: 'fair', icon: '👌' },
  { value: 'POOR', labelKey: 'used', icon: '📦' },
];

const LISTING_TYPES_CONFIG = [
  { value: '', labelKey: 'all', icon: '🛒' },
  { value: 'DIRECT_SALE', labelKey: 'directSale', icon: '🏷️' },
  { value: 'AUCTION', labelKey: 'auction', icon: '🔨' },
  { value: 'BARTER', labelKey: 'barter', icon: '🔄' },
  { value: 'DIRECT_BUY', labelKey: 'wantedToBuy', icon: '🔍' },
  { value: 'REVERSE_AUCTION', labelKey: 'tenders', icon: '📢' },
];

const SORT_OPTIONS_CONFIG = [
  { value: 'createdAt:desc', labelKey: 'newest' },
  { value: 'createdAt:asc', labelKey: 'oldest' },
  { value: 'estimatedValue:asc', labelKey: 'priceLow' },
  { value: 'estimatedValue:desc', labelKey: 'priceHigh' },
];

// ============================================
// Main Component
// ============================================
function ItemsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const t = useTranslations('browse');
  const locale = useLocale();

  // URL params
  const categorySlug = searchParams.get('category');
  const searchQuery = searchParams.get('search');
  const governorateParam = searchParams.get('governorate');
  const cityParam = searchParams.get('city');
  const districtParam = searchParams.get('district');
  const userParam = searchParams.get('user');

  // Check if viewing own items
  const isMyItems = userParam === 'me';

  // State
  const [items, setItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<CategoryWithChildren[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [categoriesError, setCategoriesError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters - Hierarchical categories
  const [search, setSearch] = useState(searchQuery || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchQuery || '');
  const [selectedMainCategory, setSelectedMainCategory] = useState('');
  const [selectedSubCategory, setSelectedSubCategory] = useState('');
  const [selectedSubSubCategory, setSelectedSubSubCategory] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [selectedListingType, setSelectedListingType] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [debouncedMinPrice, setDebouncedMinPrice] = useState('');
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('createdAt:desc');

  // Location
  const [location, setLocation] = useState<LocationSelection>({
    scope: governorateParam ? (cityParam ? (districtParam ? 'DISTRICT' : 'CITY') : 'GOVERNORATE') : 'NATIONAL',
    governorateId: governorateParam || undefined,
    cityId: cityParam || undefined,
    districtId: districtParam || undefined,
  });

  // View
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Quick View Modal
  const [quickViewItem, setQuickViewItem] = useState<{
    id: string;
    title: string;
    description?: string;
    price: number;
    images: string[];
    condition?: string;
    governorate?: string;
    city?: string;
    category?: string;
    seller?: { id: string; name: string; avatar?: string; rating?: number };
    listingType?: string;
    createdAt?: string;
  } | null>(null);

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Set category from URL (find in tree)
  useEffect(() => {
    if (categorySlug && categories.length > 0) {
      // Search in hierarchy
      for (const mainCat of categories) {
        if (mainCat.slug === categorySlug) {
          setSelectedMainCategory(mainCat.id);
          return;
        }
        if (mainCat.children) {
          for (const subCat of mainCat.children) {
            if (subCat.slug === categorySlug) {
              setSelectedMainCategory(mainCat.id);
              setSelectedSubCategory(subCat.id);
              return;
            }
            if (subCat.children) {
              for (const subSubCat of subCat.children) {
                if (subSubCat.slug === categorySlug) {
                  setSelectedMainCategory(mainCat.id);
                  setSelectedSubCategory(subCat.id);
                  setSelectedSubSubCategory(subSubCat.id);
                  return;
                }
              }
            }
          }
        }
      }
    }
  }, [categorySlug, categories]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  // Debounce price
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);
      setPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  // Get the most specific selected category ID
  const selectedCategoryId = selectedSubSubCategory || selectedSubCategory || selectedMainCategory;

  // Load items when filters change
  useEffect(() => {
    // For "my items", wait for user to be loaded
    if (isMyItems && !currentUser) return;
    loadItems();
  }, [page, selectedMainCategory, selectedSubCategory, selectedSubSubCategory, selectedCondition, selectedListingType, debouncedMinPrice, debouncedMaxPrice, debouncedSearch, location, sortBy, isMyItems, currentUser]);

  const loadCategories = async () => {
    setCategoriesLoading(true);
    setCategoriesError('');
    try {
      console.log('[Categories] Loading category tree...');
      const response = await getCategoryTree();
      console.log('[Categories] API Response:', response);

      // Handle response structure: response is { success, message, data: [...] }
      const categoryData = response.data || [];
      console.log('[Categories] Category data:', categoryData);

      if (Array.isArray(categoryData)) {
        setCategories(categoryData as CategoryWithChildren[]);
        console.log(`[Categories] Loaded ${categoryData.length} categories`);
      } else {
        console.error('[Categories] Invalid data format:', categoryData);
        setCategoriesError('تنسيق بيانات الفئات غير صالح');
      }
    } catch (err: any) {
      console.error('[Categories] Failed to load categories:', err);
      setCategoriesError(err.response?.data?.message || err.message || 'فشل في تحميل الفئات');
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Get subcategories for selected main category
  const getSubCategories = (): CategoryWithChildren[] => {
    if (!selectedMainCategory) return [];
    const mainCat = categories.find(c => c.id === selectedMainCategory);
    return mainCat?.children || [];
  };

  // Get sub-subcategories for selected subcategory
  const getSubSubCategories = (): CategoryWithChildren[] => {
    if (!selectedSubCategory) return [];
    const subCats = getSubCategories();
    const subCat = subCats.find(c => c.id === selectedSubCategory);
    return subCat?.children || [];
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      setError('');

      // Build location filters
      let governorateFilter: string | undefined;
      let cityFilter: string | undefined;
      let districtFilter: string | undefined;

      if (location.governorateId) {
        governorateFilter = getGovernorateNameAr(location.governorateId);
        if (location.cityId) {
          cityFilter = getCityNameAr(location.governorateId, location.cityId);
          if (location.districtId) {
            districtFilter = getDistrictNameAr(location.governorateId, location.cityId, location.districtId);
          }
        }
      }

      // Parse sort
      const [sortField, sortOrder] = sortBy.split(':');

      const response = await getItems({
        page,
        limit: 12,
        categoryId: selectedCategoryId || undefined,
        condition: selectedCondition || undefined,
        listingType: selectedListingType || undefined,
        minPrice: debouncedMinPrice ? parseFloat(debouncedMinPrice) : undefined,
        maxPrice: debouncedMaxPrice ? parseFloat(debouncedMaxPrice) : undefined,
        search: debouncedSearch || undefined,
        status: isMyItems ? undefined : 'ACTIVE', // Show all statuses for own items
        sellerId: isMyItems && currentUser ? currentUser.id : undefined,
        governorate: governorateFilter,
        city: cityFilter,
        district: districtFilter,
        sortBy: sortField,
        sortOrder: sortOrder as 'asc' | 'desc',
      });

      // Show all items including current user's items
      setItems(response.data.items);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.total);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل المنتجات');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setSelectedMainCategory('');
    setSelectedSubCategory('');
    setSelectedSubSubCategory('');
    setSelectedCondition('');
    setSelectedListingType('');
    setMinPrice('');
    setMaxPrice('');
    setDebouncedMinPrice('');
    setDebouncedMaxPrice('');
    setLocation({ scope: 'NATIONAL' });
    setSortBy('createdAt:desc');
    setPage(1);
    router.push('/items');
  };

  const handleLocationChange = (newLocation: LocationSelection) => {
    setLocation(newLocation);
    setPage(1);
  };

  // Handle quick view
  const handleQuickView = (item: ItemCardProps) => {
    const images: string[] = [];
    if (item.images) {
      item.images.forEach(img => {
        if (typeof img === 'string') {
          images.push(img);
        } else if (img && typeof img === 'object' && 'url' in img) {
          images.push(img.url);
        }
      });
    }

    setQuickViewItem({
      id: item.id,
      title: item.title,
      description: item.description,
      price: item.price,
      images,
      condition: item.condition,
      governorate: item.governorate,
      city: item.city,
      category: item.category,
      seller: item.seller,
      listingType: item.listingType,
      createdAt: item.createdAt,
    });

    // Also add to recently viewed
    addToRecentlyViewed({
      id: item.id,
      title: item.title,
      price: item.price,
      image: images[0],
    });
  };

  // Handle price range change
  const handlePriceRangeChange = (min: number, max: number) => {
    setMinPrice(min > 0 ? min.toString() : '');
    setMaxPrice(max < 1000000 ? max.toString() : '');
  };

  // Handle main category change - reset subcategories
  const handleMainCategoryChange = (categoryId: string) => {
    setSelectedMainCategory(categoryId);
    setSelectedSubCategory('');
    setSelectedSubSubCategory('');
    setPage(1);
  };

  // Handle subcategory change - reset sub-subcategory
  const handleSubCategoryChange = (categoryId: string) => {
    setSelectedSubCategory(categoryId);
    setSelectedSubSubCategory('');
    setPage(1);
  };

  // Handle sub-subcategory change
  const handleSubSubCategoryChange = (categoryId: string) => {
    setSelectedSubSubCategory(categoryId);
    setPage(1);
  };

  const getCategoryName = () => {
    if (isMyItems) {
      return t('myItems');
    }
    // Get the most specific selected category name
    if (selectedSubSubCategory) {
      const subSubCats = getSubSubCategories();
      const cat = subSubCats.find(c => c.id === selectedSubSubCategory);
      return (locale === 'ar' ? cat?.nameAr : cat?.nameEn) || t('title');
    }
    if (selectedSubCategory) {
      const subCats = getSubCategories();
      const cat = subCats.find(c => c.id === selectedSubCategory);
      return (locale === 'ar' ? cat?.nameAr : cat?.nameEn) || t('title');
    }
    if (selectedMainCategory) {
      const cat = categories.find(c => c.id === selectedMainCategory);
      return (locale === 'ar' ? cat?.nameAr : cat?.nameEn) || t('title');
    }
    return t('title');
  };

  const locationLabel = getLocationLabel(location.governorateId, location.cityId, location.districtId);

  const hasActiveFilters = selectedMainCategory || selectedCondition || selectedListingType || debouncedSearch || debouncedMinPrice || debouncedMaxPrice || location.governorateId;

  // Get active market tab
  const getActiveTab = () => {
    if (!selectedListingType) return 'all';
    const tab = MARKET_TABS_CONFIG.find(t => t.listingType === selectedListingType);
    return tab?.id || 'all';
  };

  const handleTabClick = (tab: typeof MARKET_TABS_CONFIG[0]) => {
    if (tab.href) {
      router.push(tab.href);
    } else if (tab.listingType) {
      setSelectedListingType(tab.listingType);
      setPage(1);
    } else {
      setSelectedListingType('');
      setPage(1);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
      {/* ============================================
          Hero Header with Search
          ============================================ */}
      <div className="bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Title & Actions */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-black">{getCategoryName()}</h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-white/80">
                  {totalItems > 0 ? `${totalItems.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')} ${t('productsAvailable')}` : t('browseProducts')}
                </span>
                {location.governorateId && (
                  <span className="bg-white/20 px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                    📍 {locationLabel}
                  </span>
                )}
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/barter"
                className="bg-white/20 backdrop-blur-sm text-white px-5 py-3 rounded-xl hover:bg-white/30 transition font-bold flex items-center gap-2"
              >
                <span>🔄</span>
                {t('barter')}
              </Link>
              <Link
                href="/listing/new?category=GENERAL&back=/items"
                className="bg-white text-emerald-600 px-6 py-3 rounded-xl hover:bg-emerald-50 transition font-bold flex items-center gap-2 shadow-lg"
              >
                <span>➕</span>
                {t('addListing')}
              </Link>
            </div>
          </div>

          {/* Market Type Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {MARKET_TABS_CONFIG.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all ${
                  getActiveTab() === tab.id
                    ? 'bg-white text-emerald-600 shadow-lg'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                <span>{tab.icon}</span>
                {t(`marketTabs.${tab.nameKey}`)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ============================================
          Specialized Markets Quick Links
          ============================================ */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide">
            <span className="text-sm text-gray-500 whitespace-nowrap">{t('specializedMarkets')}</span>
            {SPECIALIZED_MARKETS_CONFIG.map((market) => (
              <Link
                key={market.id}
                href={market.href}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm font-medium text-gray-700 transition whitespace-nowrap"
              >
                <span>{market.icon}</span>
                {t(`markets.${market.nameKey}`)}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Recently Viewed Section */}
        <RecentlyViewed maxItems={6} />

        {/* ============================================
            Top Bar - Search & Sort
            ============================================ */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Smart Search with Autocomplete */}
            <div className="flex-1">
              <SmartSearch
                value={search}
                onChange={setSearch}
                onSearch={(value) => {
                  setSearch(value);
                  setDebouncedSearch(value);
                  setPage(1);
                }}
                placeholder={t('searchPlaceholder')}
                categories={categories.map(c => ({
                  id: c.id,
                  nameAr: c.nameAr,
                  slug: c.slug,
                  itemCount: 0, // Could be populated from API
                }))}
              />
            </div>

            {/* Filter Toggle - Mobile */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 rounded-xl font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {t('filters')}
              {hasActiveFilters && (
                <span className="w-2 h-2 bg-primary-500 rounded-full" />
              )}
            </button>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white rounded-xl border-2 border-gray-200 focus:border-primary-500 outline-none font-medium min-w-[150px] text-gray-900 cursor-pointer"
            >
              {SORT_OPTIONS_CONFIG.map(option => (
                <option key={option.value} value={option.value}>{t(`sortOptions.${option.labelKey}`)}</option>
              ))}
            </select>

            {/* View Toggle */}
            <div className="hidden md:flex bg-gray-100 rounded-xl p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm' : ''}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* ============================================
              Filters Sidebar
              ============================================ */}
          <div className={`lg:col-span-1 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-20 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold text-gray-900">{t('filters')}</h2>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    {t('clearAll')}
                  </button>
                )}
              </div>

              {/* Location */}
              <div className="pb-6 border-b border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">{t('location')}</label>
                <LocationSelector
                  value={location}
                  onChange={handleLocationChange}
                />
              </div>

              {/* Category - Hierarchical */}
              <div className="pb-6 border-b border-gray-100 space-y-3">
                <label className="block text-sm font-semibold text-gray-700">{t('category')}</label>

                {/* Category Loading State */}
                {categoriesLoading ? (
                  <div className="flex items-center gap-2 text-gray-500 py-3">
                    <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm">{t('loadingCategories')}</span>
                  </div>
                ) : categoriesError ? (
                  <div className="text-red-500 text-sm py-2">
                    <p>⚠️ {categoriesError}</p>
                    <button
                      onClick={loadCategories}
                      className="text-primary-600 hover:text-primary-700 mt-1 underline"
                    >
                      {t('retry')}
                    </button>
                  </div>
                ) : categories.length === 0 ? (
                  <div className="text-gray-500 text-sm py-2">
                    <p>{t('noCategoriesAvailable')}</p>
                  </div>
                ) : (
                  <>
                    {/* Main Category */}
                    <select
                      value={selectedMainCategory}
                      onChange={(e) => handleMainCategoryChange(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                    >
                      <option value="">{t('allMainCategories')}</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{locale === 'ar' ? cat.nameAr : cat.nameEn}</option>
                      ))}
                    </select>

                    {/* Subcategory - shown when main category selected */}
                    {selectedMainCategory && getSubCategories().length > 0 && (
                      <select
                        value={selectedSubCategory}
                        onChange={(e) => handleSubCategoryChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      >
                        <option value="">{t('allSubcategories')}</option>
                        {getSubCategories().map((cat) => (
                          <option key={cat.id} value={cat.id}>{locale === 'ar' ? cat.nameAr : cat.nameEn}</option>
                        ))}
                      </select>
                    )}

                    {/* Sub-subcategory - shown when subcategory selected */}
                    {selectedSubCategory && getSubSubCategories().length > 0 && (
                      <select
                        value={selectedSubSubCategory}
                        onChange={(e) => handleSubSubCategoryChange(e.target.value)}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent transition"
                      >
                        <option value="">{t('allSubSubcategories')}</option>
                        {getSubSubCategories().map((cat) => (
                          <option key={cat.id} value={cat.id}>{locale === 'ar' ? cat.nameAr : cat.nameEn}</option>
                        ))}
                      </select>
                    )}
                  </>
                )}
              </div>

              {/* Listing Type */}
              <div className="pb-6 border-b border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">{t('listingType')}</label>
                <div className="flex flex-wrap gap-2">
                  {LISTING_TYPES_CONFIG.map(type => (
                    <button
                      key={type.value}
                      onClick={() => { setSelectedListingType(type.value); setPage(1); }}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                        selectedListingType === type.value
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {type.icon} {t(`listingTypes.${type.labelKey}`)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div className="pb-6 border-b border-gray-100">
                <label className="block text-sm font-semibold text-gray-700 mb-3">{t('condition')}</label>
                <div className="space-y-2">
                  {CONDITIONS_CONFIG.map(cond => (
                    <label key={cond.value} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="radio"
                        name="condition"
                        value={cond.value}
                        checked={selectedCondition === cond.value}
                        onChange={(e) => { setSelectedCondition(e.target.value); setPage(1); }}
                        className="w-4 h-4 text-primary-500 focus:ring-primary-500"
                      />
                      <span className="text-gray-700 group-hover:text-primary-600 transition-colors">
                        {cond.icon} {t(`conditions.${cond.labelKey}`)}
                      </span>
                    </label>
                  ))}
                  {selectedCondition && (
                    <button
                      onClick={() => { setSelectedCondition(''); setPage(1); }}
                      className="text-sm text-primary-600 hover:text-primary-700"
                    >
                      {t('clearSelection')}
                    </button>
                  )}
                </div>
              </div>

              {/* Price Range Slider */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">{t('price')}</label>
                <PriceRangeSlider
                  min={0}
                  max={1000000}
                  minValue={minPrice ? parseInt(minPrice) : 0}
                  maxValue={maxPrice ? parseInt(maxPrice) : 1000000}
                  onChange={handlePriceRangeChange}
                  step={100}
                />
              </div>

              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="pt-4 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-700 mb-3">{t('activeFilters')}</p>
                  <div className="flex flex-wrap gap-2">
                    {location.governorateId && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                        📍 {locationLabel}
                        <button onClick={() => handleLocationChange({ scope: 'NATIONAL' })} className="hover:text-blue-900">×</button>
                      </span>
                    )}
                    {selectedMainCategory && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {getCategoryName()}
                        <button onClick={() => { setSelectedMainCategory(''); setSelectedSubCategory(''); setSelectedSubSubCategory(''); }} className="hover:text-primary-900">×</button>
                      </span>
                    )}
                    {selectedCondition && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm">
                        {t(`conditions.${CONDITIONS_CONFIG.find(c => c.value === selectedCondition)?.labelKey}`)}
                        <button onClick={() => setSelectedCondition('')} className="hover:text-primary-900">×</button>
                      </span>
                    )}
                    {selectedListingType && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                        {t(`listingTypes.${LISTING_TYPES_CONFIG.find(t => t.value === selectedListingType)?.labelKey}`)}
                        <button onClick={() => setSelectedListingType('')} className="hover:text-amber-900">×</button>
                      </span>
                    )}
                    {debouncedSearch && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                        "{debouncedSearch}"
                        <button onClick={() => { setSearch(''); setDebouncedSearch(''); }} className="hover:text-gray-900">×</button>
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ============================================
              Items Grid
              ============================================ */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <ItemCardSkeleton key={i} variant={viewMode === 'list' ? 'horizontal' : 'default'} />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">😔</div>
                <p className="text-red-600 text-lg mb-4">{error}</p>
                <button
                  onClick={loadItems}
                  className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                  {t('tryAgain')}
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{t('noProducts')}</h3>
                <p className="text-gray-500 mb-6">
                  {hasActiveFilters
                    ? t('tryAdjustingFilters')
                    : t('beFirstToAdd')}
                </p>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                  >
                    {t('clearFilters')}
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* Results count */}
                <div className="mb-4 flex justify-between items-center text-sm text-gray-600">
                  <span>
                    {t('showing')} {items.length} {t('of')} {totalItems.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-US')} {t('products')}
                  </span>
                </div>

                {/* Items */}
                <div className={`grid gap-4 md:gap-6 ${viewMode === 'grid' ? 'grid-cols-2 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                  {items.map((item) => (
                    <ItemCard
                      key={item.id}
                      id={item.id}
                      title={item.title}
                      description={item.description}
                      price={item.estimatedValue || 0}
                      images={item.images?.map(img => img.url) || []}
                      condition={item.condition}
                      governorate={item.governorate}
                      city={item.city}
                      listingType={item.listingType as any}
                      category={item.category?.nameAr}
                      seller={item.seller ? { id: item.seller.id, name: item.seller.fullName || '' } : undefined}
                      createdAt={item.createdAt}
                      variant={viewMode === 'list' ? 'horizontal' : 'default'}
                      showQuickView={true}
                      onQuickView={handleQuickView}
                    />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-10 flex justify-center gap-2">
                    <button
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                    >
                      {t('previous')}
                    </button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (page <= 3) {
                          pageNum = i + 1;
                        } else if (page >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = page - 2 + i;
                        }
                        return (
                          <button
                            key={pageNum}
                            onClick={() => setPage(pageNum)}
                            className={`w-10 h-10 rounded-xl font-medium transition ${
                              page === pageNum
                                ? 'bg-primary-500 text-white'
                                : 'bg-white border border-gray-200 hover:bg-gray-50'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>
                    <button
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                      className="px-5 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition"
                    >
                      {t('next')}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        isOpen={!!quickViewItem}
        onClose={() => setQuickViewItem(null)}
        item={quickViewItem}
      />
    </div>
  );
}

export default function ItemsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-gray-600">جاري تحميل المنتجات...</p>
        </div>
      </div>
    }>
      <ItemsContent />
    </Suspense>
  );
}
