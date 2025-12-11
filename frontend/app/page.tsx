'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getItems, Item } from '@/lib/api/items';
import { getCategories, Category } from '@/lib/api/categories';
import { getAuctions, Auction } from '@/lib/api/auctions';
import apiClient from '@/lib/api/client';
import ItemCard, { ItemCardSkeleton } from '@/components/ui/ItemCard';

// ============================================
// Category Icons Mapping
// ============================================
const CATEGORY_ICONS: Record<string, { icon: string; gradient: string }> = {
  'electronics': { icon: '📱', gradient: 'from-blue-500 to-blue-600' },
  'vehicles': { icon: '🚗', gradient: 'from-purple-500 to-purple-600' },
  'real-estate': { icon: '🏠', gradient: 'from-emerald-500 to-emerald-600' },
  'fashion': { icon: '👕', gradient: 'from-pink-500 to-pink-600' },
  'furniture': { icon: '🛋️', gradient: 'from-amber-500 to-amber-600' },
  'home-garden': { icon: '🏡', gradient: 'from-green-500 to-green-600' },
  'home-appliances': { icon: '🏡', gradient: 'from-orange-500 to-orange-600' },
  'sports': { icon: '⚽', gradient: 'from-teal-500 to-teal-600' },
  'sports-hobbies': { icon: '⚽', gradient: 'from-teal-500 to-teal-600' },
  'books': { icon: '📚', gradient: 'from-indigo-500 to-indigo-600' },
  'books-media': { icon: '📚', gradient: 'from-indigo-500 to-indigo-600' },
  'gaming': { icon: '🎮', gradient: 'from-red-500 to-red-600' },
  'services': { icon: '💼', gradient: 'from-violet-500 to-violet-600' },
  'raw-materials': { icon: '🧱', gradient: 'from-gray-500 to-gray-600' },
  'default': { icon: '📦', gradient: 'from-gray-500 to-gray-600' },
};

// ============================================
// Flash Deals Data (Mock data for demonstration)
// ============================================
const FLASH_DEALS = [
  {
    id: 'deal-1',
    title: 'آيفون 14 برو ماكس',
    originalPrice: 45000,
    discountedPrice: 32000,
    discount: 29,
    image: '📱',
    sold: 45,
    total: 100,
  },
  {
    id: 'deal-2',
    title: 'سامسونج جالاكسي S23',
    originalPrice: 35000,
    discountedPrice: 25000,
    discount: 29,
    image: '📱',
    sold: 78,
    total: 100,
  },
  {
    id: 'deal-3',
    title: 'لابتوب ديل XPS 15',
    originalPrice: 55000,
    discountedPrice: 42000,
    discount: 24,
    image: '💻',
    sold: 23,
    total: 50,
  },
  {
    id: 'deal-4',
    title: 'ساعة أبل واتش Series 9',
    originalPrice: 18000,
    discountedPrice: 13500,
    discount: 25,
    image: '⌚',
    sold: 89,
    total: 100,
  },
];

// ============================================
// Charity Organizations Data
// ============================================
const CHARITIES = [
  {
    id: 'charity-1',
    name: 'مصر الخير',
    description: 'مساعدة الأسر الأكثر احتياجاً في مصر',
    logo: '🤲',
    color: 'from-green-500 to-emerald-600',
    totalDonations: 2500000,
    donorsCount: 15420,
    acceptsInKind: true,
    inKindCategories: ['ملابس', 'أثاث', 'أجهزة منزلية', 'طعام'],
  },
  {
    id: 'charity-2',
    name: 'بنك الطعام المصري',
    description: 'إطعام الجائعين ومحاربة هدر الطعام',
    logo: '🍞',
    color: 'from-amber-500 to-orange-600',
    totalDonations: 1850000,
    donorsCount: 12300,
    acceptsInKind: true,
    inKindCategories: ['طعام', 'مواد غذائية'],
  },
  {
    id: 'charity-3',
    name: 'أهل مصر',
    description: 'علاج الحروق للأطفال والكبار',
    logo: '❤️‍🩹',
    color: 'from-red-500 to-pink-600',
    totalDonations: 980000,
    donorsCount: 8750,
    acceptsInKind: true,
    inKindCategories: ['أدوية', 'مستلزمات طبية', 'ملابس أطفال'],
  },
  {
    id: 'charity-4',
    name: 'رسالة',
    description: 'تنمية المجتمع ومساعدة المحتاجين',
    logo: '💝',
    color: 'from-purple-500 to-violet-600',
    totalDonations: 1250000,
    donorsCount: 9800,
    acceptsInKind: true,
    inKindCategories: ['ملابس', 'أثاث', 'كتب', 'ألعاب أطفال', 'أجهزة إلكترونية'],
  },
];

// ============================================
// Recently Viewed Items (Mock)
// ============================================
const RECENTLY_VIEWED = [
  { id: 'rv-1', title: 'آيفون 13 برو', price: 28000, image: '📱', category: 'موبايلات' },
  { id: 'rv-2', title: 'لابتوب HP Pavilion', price: 18500, image: '💻', category: 'لابتوب' },
  { id: 'rv-3', title: 'سيارة هيونداي النترا', price: 450000, image: '🚗', category: 'سيارات' },
  { id: 'rv-4', title: 'ساعة أبل واتش SE', price: 8500, image: '⌚', category: 'ساعات' },
  { id: 'rv-5', title: 'سماعات سوني WH-1000', price: 6500, image: '🎧', category: 'إلكترونيات' },
  { id: 'rv-6', title: 'كاميرا كانون EOS', price: 22000, image: '📷', category: 'كاميرات' },
];

// ============================================
// Features Data
// ============================================
const FEATURES = [
  {
    icon: '🤖',
    title: 'بيع بالذكاء الصناعي',
    description: 'صور منتجك واحصل على إعلان جاهز',
    href: '/sell-ai',
    gradient: 'from-amber-500 to-orange-500',
  },
  {
    icon: '🔄',
    title: 'المقايضة الذكية',
    description: 'بادل منتجاتك بما تحتاجه',
    href: '/barter',
    gradient: 'from-blue-500 to-indigo-500',
  },
  {
    icon: '🚗',
    title: 'سوق السيارات',
    description: 'سيارات جديدة ومستعملة بأفضل الأسعار',
    href: '/vehicles',
    gradient: 'from-blue-600 to-indigo-700',
  },
  {
    icon: '🏠',
    title: 'سوق العقارات',
    description: 'شقق وفيلات وأراضي للبيع والإيجار',
    href: '/real-estate',
    gradient: 'from-emerald-600 to-green-700',
  },
  {
    icon: '🔒',
    title: 'نظام الضمان',
    description: 'صفقات آمنة 100%',
    href: '/escrow',
    gradient: 'from-emerald-500 to-teal-500',
  },
  {
    icon: '🔨',
    title: 'المزادات',
    description: 'مزادات حية على أفضل المنتجات',
    href: '/auctions',
    gradient: 'from-purple-500 to-purple-600',
  },
  {
    icon: '💳',
    title: 'التقسيط',
    description: 'اشتر الآن وادفع على أقساط مريحة',
    href: '/installments',
    gradient: 'from-violet-500 to-purple-600',
  },
  {
    icon: '🚚',
    title: 'التوصيل',
    description: 'توصيل سريع لجميع المحافظات',
    href: '/delivery',
    gradient: 'from-teal-500 to-cyan-500',
  },
  {
    icon: '🏅',
    title: 'الشارات والتحقق',
    description: 'زد مصداقيتك واكسب ثقة المشترين',
    href: '/badges',
    gradient: 'from-yellow-500 to-amber-500',
  },
  {
    icon: '📊',
    title: 'مقارنة المنتجات',
    description: 'قارن بين المنتجات واختر الأفضل',
    href: '/compare',
    gradient: 'from-pink-500 to-rose-500',
  },
];

// ============================================
// Main Home Component
// ============================================
export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const categoryDropdownRef = useRef<HTMLDivElement>(null);

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [latestItems, setLatestItems] = useState<Item[]>([]);
  const [saleItems, setSaleItems] = useState<Item[]>([]);
  const [wantedItems, setWantedItems] = useState<Item[]>([]);
  const [barterItems, setBarterItems] = useState<Item[]>([]);
  const [scrapItems, setScrapItems] = useState<Item[]>([]);
  const [luxuryItems, setLuxuryItems] = useState<Item[]>([]);
  const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
  const [activeTenders, setActiveTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [hoveredSubcategory, setHoveredSubcategory] = useState<string | null>(null);
  const [hoveredQuickCategory, setHoveredQuickCategory] = useState<string | null>(null);
  const [hoveredQuickSubcategory, setHoveredQuickSubcategory] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Flash Deals Countdown Timer
  const [flashDealsTime, setFlashDealsTime] = useState({
    hours: 5,
    minutes: 42,
    seconds: 18
  });

  // Donation Modal State
  const [donationModalOpen, setDonationModalOpen] = useState(false);
  const [selectedCharity, setSelectedCharity] = useState<typeof CHARITIES[0] | null>(null);
  const [donationAmount, setDonationAmount] = useState<number | null>(null);
  const [donationType, setDonationType] = useState<'money' | 'inkind'>('money');
  const [inKindDescription, setInKindDescription] = useState('');

  // Hero slides data
  const heroSlides = [
    {
      id: 'main',
      title: 'اشتري، بيع، أو بادل',
      subtitle: 'بكل سهولة وأمان',
      description: 'منصة XChange هي السوق الأول في مصر للتجارة الذكية والمقايضة. جديد، مستعمل، أو تالف - كل شيء له قيمة هنا.',
      gradient: 'from-primary-600 via-primary-500 to-teal-500',
      icon: '🔄',
      href: '/items',
    },
    {
      id: 'flash',
      title: 'عروض فلاش',
      subtitle: 'خصومات تصل إلى 70%',
      description: 'اغتنم الفرصة! عروض حصرية لفترة محدودة على أفضل المنتجات. سارع قبل انتهاء العرض.',
      gradient: 'from-red-600 via-orange-500 to-amber-500',
      icon: '⚡',
      badge: 'عرض محدود',
      href: '/deals',
    },
    {
      id: 'barter',
      title: 'بادل بدون نقود',
      subtitle: 'المقايضة الذكية',
      description: 'لديك شيء لا تحتاجه؟ بادله بشيء تريده! نظام مقايضة ذكي يجد لك أفضل الصفقات.',
      gradient: 'from-blue-600 via-indigo-500 to-purple-500',
      icon: '🔁',
      href: '/barter',
    },
    {
      id: 'auction',
      title: 'المزادات الحية',
      subtitle: 'زايد واربح',
      description: 'شارك في مزادات حقيقية على منتجات مميزة. اعثر على صفقات لا تُصدق!',
      gradient: 'from-purple-600 via-purple-500 to-pink-500',
      icon: '🔨',
      href: '/auctions',
    },
  ];

  // Auto-rotate slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000); // Change slide every 5 seconds
    return () => clearInterval(interval);
  }, [heroSlides.length]);

  // Flash Deals Countdown Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashDealsTime(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        } else {
          // Reset timer when it reaches 0
          hours = 5;
          minutes = 42;
          seconds = 18;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Quick categories with their parent IDs for fetching subcategories
  const quickCategories = [
    { slug: 'electronics', parentId: 'cat-electronics', name: 'إلكترونيات', icon: '📱' },
    { slug: 'vehicles', parentId: 'cat-vehicles', name: 'سيارات', icon: '🚗' },
    { slug: 'furniture', parentId: 'cat-furniture', name: 'أثاث', icon: '🛋️' },
    { slug: 'fashion', parentId: 'cat-fashion', name: 'ملابس', icon: '👕' },
    { slug: 'home-appliances', parentId: 'cat-home-appliances', name: 'أجهزة منزلية', icon: '🏠' },
  ];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
        setExpandedCategory(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load all data in parallel
      const [categoriesRes, featuredRes, latestRes, saleRes, wantedRes, barterRes, scrapRes, luxuryRes, auctionsRes, tendersRes] = await Promise.all([
        getCategories().catch(() => ({ data: [] })),
        getItems({ limit: 4, featured: true, status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        getItems({ limit: 8, status: 'ACTIVE', sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => ({ data: { items: [] } })),
        getItems({ limit: 4, listingType: 'DIRECT_SALE', status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        getItems({ limit: 4, listingType: 'DIRECT_BUY', status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        getItems({ limit: 4, listingType: 'BARTER', status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        getItems({ limit: 4, isScrap: true, status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        getItems({ limit: 4, categoryId: '516cbe98-eb69-4d5c-a0e1-021c3a3aa608', status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        getAuctions({ limit: 4, status: 'ACTIVE' }).catch(() => ({ data: { auctions: [] } })),
        apiClient.get('/reverse-auctions?status=ACTIVE&limit=4').catch(() => ({ data: { data: [] } })),
      ]);

      setCategories(categoriesRes.data || []);
      setFeaturedItems(featuredRes.data?.items || []);
      setLatestItems(latestRes.data?.items || []);
      setSaleItems(saleRes.data?.items || []);
      setWantedItems(wantedRes.data?.items || []);
      setBarterItems(barterRes.data?.items || []);
      setScrapItems(scrapRes.data?.items || []);
      setLuxuryItems(luxuryRes.data?.items || []);
      // Handle different response formats safely
      const auctionsData = auctionsRes as any;
      setActiveAuctions(auctionsData.data?.auctions || auctionsData.data?.data || []);
      const tendersData = tendersRes as any;
      setActiveTenders(tendersData.data?.data?.items || tendersData.data?.items || []);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get parent categories (categories without parent)
  const parentCategories = categories.filter(c => !c.parentId);

  // Get subcategories for a parent
  const getSubcategories = (parentId: string) => categories.filter(c => c.parentId === parentId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const getCategoryIcon = (slug: string) => {
    return CATEGORY_ICONS[slug] || CATEGORY_ICONS.default;
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* ============================================
          Hero Section with Dynamic Slides
          ============================================ */}
      <section className={`relative bg-gradient-to-br ${heroSlides[currentSlide].gradient} overflow-hidden transition-all duration-700`}>
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center max-w-3xl mx-auto">
            {/* Dynamic Content with Animation */}
            <div className="relative min-h-[160px] md:min-h-[180px] overflow-hidden pb-8">
              {heroSlides.map((slide, index) => (
                <Link
                  key={slide.id}
                  href={slide.href}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out cursor-pointer block ${
                    index === currentSlide
                      ? 'opacity-100 translate-x-0'
                      : index < currentSlide
                        ? 'opacity-0 -translate-x-full pointer-events-none'
                        : 'opacity-0 translate-x-full pointer-events-none'
                  }`}
                >
                  {/* Badge for special slides */}
                  {slide.badge && (
                    <div className="mb-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold animate-pulse">
                        <span>{slide.icon}</span>
                        {slide.badge}
                      </span>
                    </div>
                  )}

                  {/* Main Heading */}
                  <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-3 leading-tight hover:scale-105 transition-transform">
                    <span className="inline-block">{slide.icon}</span> {slide.title}
                    <span className="block text-white/90 text-xl md:text-2xl lg:text-3xl mt-1">{slide.subtitle}</span>
                  </h1>

                  {/* Subtitle */}
                  <p className="text-sm md:text-base text-white/80 max-w-2xl mx-auto">
                    {slide.description}
                  </p>
                </Link>
              ))}

              {/* Navigation Arrows - Clear Direction */}
              <button
                onClick={(e) => { e.preventDefault(); setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length); }}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-6 p-2 text-white hover:text-white/80 transition-all z-10 group"
                aria-label="السابق"
              >
                <svg className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
                </svg>
              </button>
              <button
                onClick={(e) => { e.preventDefault(); setCurrentSlide((prev) => (prev + 1) % heroSlides.length); }}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-6 p-2 text-white hover:text-white/80 transition-all z-10 group"
                aria-label="التالي"
              >
                <svg className="w-8 h-8 md:w-10 md:h-10 drop-shadow-lg group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M15.41 16.59L10.83 12l4.58-4.59L14 6l-6 6 6 6 1.41-1.41z"/>
                </svg>
              </button>

              {/* Slide Indicators - Inside slide area at bottom */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-3 pb-2 z-10">
                {heroSlides.map((slide, index) => (
                  <button
                    key={slide.id}
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCurrentSlide(index); }}
                    className={`transition-all duration-300 rounded-full ${
                      index === currentSlide
                        ? 'w-10 h-3 bg-white shadow-lg'
                        : 'w-3 h-3 bg-white/40 hover:bg-white/60'
                    }`}
                    aria-label={`انتقل إلى ${index + 1}`}
                  />
                ))}
              </div>
            </div>

            {/* Search Bar - Fixed/Static */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
              <div className="flex bg-white rounded-2xl shadow-xl overflow-hidden">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن أي شيء... موبايل، سيارة، أثاث"
                  className="flex-1 px-6 py-4 text-gray-700 outline-none text-lg"
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-primary-500 text-white font-semibold hover:bg-primary-600 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <span className="hidden sm:inline">بحث</span>
                </button>
              </div>
            </form>

            {/* Quick Actions - Context Aware */}
            <div className="flex flex-wrap justify-center gap-4">
              {currentSlide === 1 ? (
                // Flash deals slide - show deals link
                <>
                  <Link
                    href="/deals"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-xl font-semibold hover:bg-red-50 transition-all shadow-lg hover:shadow-xl animate-pulse"
                  >
                    <span>⚡</span>
                    تصفح العروض الآن
                  </Link>
                  <Link
                    href="/items"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
                  >
                    <span>🛒</span>
                    تصفح المنتجات
                  </Link>
                </>
              ) : currentSlide === 2 ? (
                // Barter slide
                <>
                  <Link
                    href="/barter"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    <span>🔁</span>
                    ابدأ المقايضة
                  </Link>
                  <Link
                    href={user ? '/inventory/add' : '/register'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
                  >
                    <span>➕</span>
                    أضف منتج للمقايضة
                  </Link>
                </>
              ) : currentSlide === 3 ? (
                // Auctions slide
                <>
                  <Link
                    href="/auctions"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    <span>🔨</span>
                    شارك في المزادات
                  </Link>
                  <Link
                    href="/auctions/create"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
                  >
                    <span>➕</span>
                    أنشئ مزادك
                  </Link>
                </>
              ) : (
                // Default main slide
                <>
                  <Link
                    href={user ? '/inventory/add' : '/register'}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 rounded-xl font-semibold hover:bg-primary-50 transition-all shadow-lg hover:shadow-xl"
                  >
                    <span>➕</span>
                    أضف إعلان مجاني
                  </Link>
                  <Link
                    href="/sell-ai"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-white/30 transition-all border border-white/30"
                  >
                    <span>✨</span>
                    بيع بالذكاء الصناعي
                  </Link>
                </>
              )}
            </div>

            {/* Trust Badges */}
            <div className="mt-12 flex flex-wrap justify-center gap-6 text-white/80 text-sm">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                إعلانات مجانية
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                دفع آمن
              </span>
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-300" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                ضمان الصفقات
              </span>
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* ============================================
          Flash Deals Section with Countdown
          ============================================ */}
      <section className="py-8 md:py-12 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-48 h-48 bg-white/10 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 relative">
          {/* Header with Countdown */}
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl animate-bounce">⚡</span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-white">عروض فلاش</h2>
                <p className="text-white/80 text-sm">خصومات حصرية لفترة محدودة!</p>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2">
              <span className="text-white/80 text-sm font-medium">ينتهي خلال:</span>
              <div className="flex items-center gap-1">
                {/* Hours */}
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] text-center">
                  <div className="text-2xl font-bold text-white">{String(flashDealsTime.hours).padStart(2, '0')}</div>
                  <div className="text-xs text-white/70">ساعة</div>
                </div>
                <span className="text-white text-2xl font-bold">:</span>
                {/* Minutes */}
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] text-center">
                  <div className="text-2xl font-bold text-white">{String(flashDealsTime.minutes).padStart(2, '0')}</div>
                  <div className="text-xs text-white/70">دقيقة</div>
                </div>
                <span className="text-white text-2xl font-bold">:</span>
                {/* Seconds */}
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2 min-w-[50px] text-center">
                  <div className="text-2xl font-bold text-white animate-pulse">{String(flashDealsTime.seconds).padStart(2, '0')}</div>
                  <div className="text-xs text-white/70">ثانية</div>
                </div>
              </div>
            </div>

            <Link
              href="/deals"
              className="hidden md:flex items-center gap-2 bg-white text-red-600 px-5 py-2.5 rounded-xl font-bold hover:bg-red-50 transition-colors shadow-lg"
            >
              عرض الكل
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {/* Flash Deals Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {FLASH_DEALS.map((deal) => (
              <Link
                key={deal.id}
                href={`/deals/${deal.id}`}
                className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 group"
              >
                {/* Discount Badge */}
                <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  -{deal.discount}%
                </div>

                {/* Product Image */}
                <div className="relative bg-gray-100 rounded-xl h-28 md:h-36 flex items-center justify-center mb-3 overflow-hidden">
                  <span className="text-5xl md:text-6xl group-hover:scale-110 transition-transform duration-300">{deal.image}</span>
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    -{deal.discount}%
                  </div>
                </div>

                {/* Product Info */}
                <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-1">{deal.title}</h3>

                {/* Prices */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg font-bold text-red-600">{deal.discountedPrice.toLocaleString()}</span>
                  <span className="text-xs text-gray-400 line-through">{deal.originalPrice.toLocaleString()}</span>
                  <span className="text-xs text-gray-500">ج.م</span>
                </div>

                {/* Stock Progress */}
                <div className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">تم البيع</span>
                    <span className="text-red-600 font-bold">{Math.round((deal.sold / deal.total) * 100)}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full transition-all duration-500"
                      style={{ width: `${(deal.sold / deal.total) * 100}%` }}
                    />
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Mobile View All Button */}
          <div className="md:hidden mt-4 text-center">
            <Link
              href="/deals"
              className="inline-flex items-center gap-2 bg-white text-red-600 px-6 py-3 rounded-xl font-bold"
            >
              عرض كل العروض
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          Promotional Category Banners
          ============================================ */}
      <section className="py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Electronics Banner */}
            <Link
              href="/items?category=electronics"
              className="relative group overflow-hidden rounded-2xl aspect-[4/3]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-700" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="relative h-full p-4 flex flex-col justify-between text-white">
                <div>
                  <span className="text-4xl md:text-5xl">📱</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-1">إلكترونيات</h3>
                  <p className="text-white/80 text-xs md:text-sm">خصم حتى 40%</p>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                عرض
              </div>
            </Link>

            {/* Vehicles Banner */}
            <Link
              href="/items?category=vehicles"
              className="relative group overflow-hidden rounded-2xl aspect-[4/3]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-gray-700 to-gray-900" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="relative h-full p-4 flex flex-col justify-between text-white">
                <div>
                  <span className="text-4xl md:text-5xl">🚗</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-1">سيارات</h3>
                  <p className="text-white/80 text-xs md:text-sm">أفضل الأسعار</p>
                </div>
              </div>
            </Link>

            {/* Fashion Banner */}
            <Link
              href="/items?category=fashion-women"
              className="relative group overflow-hidden rounded-2xl aspect-[4/3]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-500 to-rose-600" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="relative h-full p-4 flex flex-col justify-between text-white">
                <div>
                  <span className="text-4xl md:text-5xl">👗</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-1">أزياء نسائية</h3>
                  <p className="text-white/80 text-xs md:text-sm">تشكيلة جديدة</p>
                </div>
              </div>
              <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                جديد
              </div>
            </Link>

            {/* Home Banner */}
            <Link
              href="/items?category=home"
              className="relative group overflow-hidden rounded-2xl aspect-[4/3]"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600" />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
              <div className="relative h-full p-4 flex flex-col justify-between text-white">
                <div>
                  <span className="text-4xl md:text-5xl">🏠</span>
                </div>
                <div>
                  <h3 className="font-bold text-lg md:text-xl mb-1">المنزل والحديقة</h3>
                  <p className="text-white/80 text-xs md:text-sm">خصم 30%</p>
                </div>
              </div>
            </Link>
          </div>

          {/* Large Promo Banners */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {/* Free Shipping Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-500 to-teal-500 p-6 md:p-8">
              <div className="absolute top-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative flex items-center gap-4">
                <span className="text-5xl md:text-6xl">🚚</span>
                <div className="text-white">
                  <h3 className="font-bold text-xl md:text-2xl mb-1">شحن مجاني</h3>
                  <p className="text-white/80 text-sm md:text-base">على الطلبات أكثر من 500 ج.م</p>
                </div>
              </div>
            </div>

            {/* New User Discount Banner */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 p-6 md:p-8">
              <div className="absolute bottom-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
              <div className="relative flex items-center gap-4">
                <span className="text-5xl md:text-6xl">🎁</span>
                <div className="text-white">
                  <h3 className="font-bold text-xl md:text-2xl mb-1">مستخدم جديد؟</h3>
                  <p className="text-white/80 text-sm md:text-base">احصل على خصم 15% على أول طلب</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          Featured Items Section
          ============================================ */}
      {featuredItems.length > 0 && (
        <section className="py-12 md:py-16 bg-gradient-to-b from-amber-50/50 to-transparent">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <span className="text-3xl">⭐</span>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900">إعلانات مميزة</h2>
                  <p className="text-gray-500 mt-1">أفضل العروض المختارة لك</p>
                </div>
              </div>
              <Link
                href="/items?featured=true"
                className="hidden md:flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
              >
                عرض الكل
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.estimatedValue || 0}
                  images={item.images?.map(img => typeof img === 'string' ? img : img.url) || []}
                  condition={item.condition}
                  governorate={item.governorate}
                  listingType={item.listingType as any}
                  seller={item.seller ? { id: item.seller.id, name: item.seller.fullName || '' } : undefined}
                  isFeatured={true}
                  promotionTier={(item as any).promotionTier || 'PREMIUM'}
                  createdAt={item.createdAt}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ============================================
          Current Auctions Section
          ============================================ */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-purple-50/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔨</span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">المزادات الحالية</h2>
                <p className="text-gray-500 mt-1">شارك في المزادات واحصل على أفضل الصفقات</p>
              </div>
            </div>
            <Link
              href="/auctions"
              className="hidden md:flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              عرض الكل
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {activeAuctions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeAuctions.map((auction: any) => (
                <Link
                  key={auction.id}
                  href={`/auctions/${auction.id}`}
                  className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden group"
                >
                  <div className="relative h-48">
                    {auction.listing?.item?.images?.[0] ? (
                      <img
                        src={typeof auction.listing.item.images[0] === 'string' ? auction.listing.item.images[0] : auction.listing.item.images[0].url}
                        alt={auction.listing?.item?.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full bg-purple-100 flex items-center justify-center text-4xl">🔨</div>
                    )}
                    <div className="absolute top-2 right-2 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-bold">
                      مزاد نشط
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 line-clamp-1 mb-2">{auction.listing?.item?.title || 'مزاد'}</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs text-gray-500">السعر الحالي</div>
                        <div className="text-lg font-bold text-purple-600">{(auction.currentPrice || 0).toLocaleString()} ج.م</div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">عدد المزايدات</div>
                        <div className="font-bold text-gray-700">{auction.bidCount || 0}</div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="text-6xl mb-4">🔨</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد مزادات حالية</h3>
              <p className="text-gray-500 mb-4">تحقق لاحقاً للعثور على مزادات جديدة</p>
              <Link href="/auctions" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors">
                استعرض المزادات
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          Current Tenders Section (Reverse Auctions)
          ============================================ */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">📋</span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">المناقصات الحالية</h2>
                <p className="text-gray-500 mt-1">طلبات شراء تبحث عن أفضل عرض</p>
              </div>
            </div>
            <Link
              href="/reverse-auctions"
              className="hidden md:flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              عرض الكل
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {activeTenders.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {activeTenders.map((tender: any) => (
                <Link
                  key={tender.id}
                  href={`/reverse-auctions/${tender.id}`}
                  className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden p-5 border-2 border-transparent hover:border-blue-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold">مناقصة نشطة</span>
                    <span className="text-sm text-gray-500">{tender.bidsCount || 0} عرض</span>
                  </div>
                  <h3 className="font-bold text-gray-900 line-clamp-2 mb-3">{tender.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4">{tender.description}</p>
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div>
                      <div className="text-xs text-gray-500">الميزانية</div>
                      <div className="font-bold text-blue-600">{(tender.maxBudget || 0).toLocaleString()} ج.م</div>
                    </div>
                    <button className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors">
                      قدم عرضك
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد مناقصات حالية</h3>
              <p className="text-gray-500 mb-4">أنشئ طلب شراء ودع البائعين يتنافسون</p>
              <Link href="/reverse-auctions" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-colors">
                إنشاء طلب شراء
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          Sales Section (للبيع)
          ============================================ */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-green-50/50 to-transparent">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💰</span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">إعلانات للبيع</h2>
                <p className="text-gray-500 mt-1">منتجات معروضة للبيع المباشر</p>
              </div>
            </div>
            <Link
              href="/items?listingType=SALE"
              className="hidden md:flex items-center gap-2 text-green-600 hover:text-green-700 font-medium"
            >
              عرض الكل
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {saleItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.estimatedValue || 0}
                  images={item.images?.map(img => typeof img === 'string' ? img : img.url) || []}
                  condition={item.condition}
                  governorate={item.governorate}
                  listingType="DIRECT_SALE"
                  seller={item.seller ? { id: item.seller.id, name: item.seller.fullName || '' } : undefined}
                  createdAt={item.createdAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد منتجات للبيع</h3>
              <p className="text-gray-500 mb-4">كن أول من يبيع على المنصة</p>
              <Link href="/inventory/add" className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-colors">
                أضف إعلان للبيع
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          Wanted Section (مطلوب للشراء)
          ============================================ */}
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔍</span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">مطلوب للشراء</h2>
                <p className="text-gray-500 mt-1">أشخاص يبحثون عن منتجات معينة</p>
              </div>
            </div>
            <Link
              href="/items?listingType=WANTED"
              className="hidden md:flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
            >
              عرض الكل
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {wantedItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {wantedItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.estimatedValue || 0}
                  images={item.images?.map(img => typeof img === 'string' ? img : img.url) || []}
                  condition={item.condition}
                  governorate={item.governorate}
                  listingType="DIRECT_BUY"
                  seller={item.seller ? { id: item.seller.id, name: item.seller.fullName || '' } : undefined}
                  createdAt={item.createdAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد طلبات شراء</h3>
              <p className="text-gray-500 mb-4">أخبرنا ماذا تبحث عنه</p>
              <Link href="/inventory/add?type=WANTED" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600 transition-colors">
                أضف طلب شراء
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          Barter Section (المقايضة)
          ============================================ */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-teal-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">🔄</span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">للمقايضة</h2>
                <p className="text-gray-500 mt-1">بادل منتجاتك مع الآخرين بدون نقود</p>
              </div>
            </div>
            <Link
              href="/items?listingType=BARTER"
              className="hidden md:flex items-center gap-2 text-teal-600 hover:text-teal-700 font-medium"
            >
              عرض الكل
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {barterItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {barterItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.estimatedValue || 0}
                  images={item.images?.map(img => typeof img === 'string' ? img : img.url) || []}
                  condition={item.condition}
                  governorate={item.governorate}
                  listingType="BARTER"
                  seller={item.seller ? { id: item.seller.id, name: item.seller.fullName || '' } : undefined}
                  createdAt={item.createdAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="text-6xl mb-4">🔄</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد عروض مقايضة</h3>
              <p className="text-gray-500 mb-4">اعرض منتجك للمقايضة مع منتج آخر</p>
              <Link href="/inventory/add?type=BARTER" className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-semibold hover:bg-teal-600 transition-colors">
                أضف عرض مقايضة
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          Scrap Section (سوق التوالف)
          ============================================ */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-amber-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">♻️</span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">سوق التوالف</h2>
                <p className="text-gray-500 mt-1">خردة ومواد قابلة لإعادة التدوير</p>
              </div>
            </div>
            <Link
              href="/scrap"
              className="hidden md:flex items-center gap-2 text-amber-600 hover:text-amber-700 font-medium"
            >
              عرض الكل
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {scrapItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {scrapItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.estimatedValue || 0}
                  images={item.images?.map(img => typeof img === 'string' ? img : img.url) || []}
                  condition={item.condition}
                  governorate={item.governorate}
                  listingType={item.listingType as any}
                  seller={item.seller ? { id: item.seller.id, name: item.seller.fullName || '' } : undefined}
                  createdAt={item.createdAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="text-6xl mb-4">♻️</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد توالف حالياً</h3>
              <p className="text-gray-500 mb-4">اعرض المواد القابلة لإعادة التدوير</p>
              <Link href="/inventory/add?isScrap=true" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-semibold hover:bg-amber-600 transition-colors">
                أضف منتج للتوالف
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          Luxury Section (السلع الفاخرة)
          ============================================ */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <span className="text-3xl">💎</span>
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">السلع الفاخرة</h2>
                <p className="text-gray-500 mt-1">ساعات وحقائب ومجوهرات أصلية</p>
              </div>
            </div>
            <Link
              href="/items?categoryId=516cbe98-eb69-4d5c-a0e1-021c3a3aa608"
              className="hidden md:flex items-center gap-2 text-purple-600 hover:text-purple-700 font-medium"
            >
              عرض الكل
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {luxuryItems.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {luxuryItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.estimatedValue || 0}
                  images={item.images?.map(img => typeof img === 'string' ? img : img.url) || []}
                  condition={item.condition}
                  governorate={item.governorate}
                  listingType={item.listingType as any}
                  seller={item.seller ? { id: item.seller.id, name: item.seller.fullName || '' } : undefined}
                  createdAt={item.createdAt}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <div className="text-6xl mb-4">💎</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد سلع فاخرة حالياً</h3>
              <p className="text-gray-500 mb-4">اعرض ساعاتك وحقائبك ومجوهراتك الأصلية</p>
              <Link href="/inventory/add?categoryId=516cbe98-eb69-4d5c-a0e1-021c3a3aa608" className="inline-flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-semibold hover:bg-purple-600 transition-colors">
                أضف منتج فاخر
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ============================================
          Features Section
          ============================================ */}
      <section className="py-12 md:py-16 bg-gray-100/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">ميزات ذكية لتجربة أفضل</h2>
            <p className="text-gray-500 mt-2">تقنيات متقدمة لجعل البيع والشراء أسهل من أي وقت</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {FEATURES.map((feature, index) => (
              <Link
                key={index}
                href={feature.href}
                className="group relative bg-white rounded-2xl p-6 shadow-card hover:shadow-card-hover transition-all duration-300 border border-gray-100 overflow-hidden"
              >
                {/* Gradient Background on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />

                <div className="relative">
                  <div className={`w-14 h-14 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center text-2xl mb-4 shadow-lg`}>
                    {feature.icon}
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          Recently Viewed Section
          ============================================ */}
      <section className="py-8 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🕐</span>
              <div>
                <h2 className="text-xl font-bold text-gray-900">شاهدته مؤخراً</h2>
                <p className="text-gray-500 text-sm">المنتجات التي قمت بمشاهدتها</p>
              </div>
            </div>
            <button className="text-primary-600 text-sm font-medium hover:underline">
              مسح السجل
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {RECENTLY_VIEWED.map((item) => (
              <Link
                key={item.id}
                href={`/items/${item.id}`}
                className="flex-shrink-0 w-40 bg-gray-50 rounded-xl p-3 hover:bg-gray-100 transition-colors group"
              >
                <div className="w-full h-24 bg-white rounded-lg flex items-center justify-center mb-2">
                  <span className="text-4xl group-hover:scale-110 transition-transform">{item.image}</span>
                </div>
                <h3 className="font-medium text-gray-900 text-sm line-clamp-1 mb-1">{item.title}</h3>
                <div className="flex items-center justify-between">
                  <span className="text-primary-600 font-bold text-sm">{item.price.toLocaleString()}</span>
                  <span className="text-gray-400 text-xs">ج.م</span>
                </div>
                <span className="text-gray-400 text-xs">{item.category}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          Latest Items Section
          ============================================ */}
      <section className="py-12 md:py-16 bg-gray-100/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">أحدث الإعلانات</h2>
              <p className="text-gray-500 mt-1">اكتشف آخر المنتجات المضافة</p>
            </div>
            <Link
              href="/items"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-primary-600 hover:bg-primary-50 font-medium shadow-sm transition-colors"
            >
              عرض الكل
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <ItemCardSkeleton key={i} />
              ))
            ) : latestItems.length > 0 ? (
              latestItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.estimatedValue || 0}
                  images={item.images?.map(img => typeof img === 'string' ? img : img.url) || []}
                  condition={item.condition}
                  governorate={item.governorate}
                  listingType={item.listingType as any}
                  seller={item.seller ? { id: item.seller.id, name: item.seller.fullName || '' } : undefined}
                  createdAt={item.createdAt}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 bg-white rounded-2xl">
                <div className="text-6xl mb-4">📦</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد منتجات حتى الآن</h3>
                <p className="text-gray-500 mb-4">كن أول من يضيف منتج على المنصة!</p>
                <Link
                  href={user ? '/inventory/add' : '/register'}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-colors"
                >
                  <span>➕</span>
                  أضف إعلان الآن
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>


      {/* ============================================
          Markets Section
          ============================================ */}
      <section className="py-12 md:py-16 bg-gray-100/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">أسواق متخصصة</h2>
            <p className="text-gray-500 mt-2">اكتشف أسواقنا المتنوعة لكل احتياج</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Auctions Market */}
            <Link
              href="/auctions"
              className="group relative bg-gradient-to-br from-purple-500 to-purple-700 rounded-2xl p-6 overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <div className="relative text-white">
                <span className="text-4xl mb-4 block">🔨</span>
                <h3 className="text-xl font-bold mb-2">المزادات</h3>
                <p className="text-purple-100 text-sm mb-4">
                  شارك في مزادات حية واحصل على أفضل الصفقات
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  اكتشف المزادات
                  <svg className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Scrap Market */}
            <Link
              href="/scrap"
              className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <div className="relative text-white">
                <span className="text-4xl mb-4 block">♻️</span>
                <h3 className="text-xl font-bold mb-2">سوق التوالف</h3>
                <p className="text-emerald-100 text-sm mb-4">
                  بيع وشراء الخردة والمواد القابلة للتدوير
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  تصفح السوق
                  <svg className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>

            {/* Luxury Market */}
            <Link
              href="/luxury"
              className="group relative bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-6 overflow-hidden"
            >
              <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors" />
              <div className="relative text-white">
                <span className="text-4xl mb-4 block">👑</span>
                <h3 className="text-xl font-bold mb-2">السوق الفاخر</h3>
                <p className="text-amber-100 text-sm mb-4">
                  منتجات راقية وماركات عالمية موثوقة
                </p>
                <span className="inline-flex items-center gap-2 text-sm font-medium">
                  تسوق الآن
                  <svg className="w-4 h-4 rotate-180 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          Charity / Donations Section
          ============================================ */}
      <section className="py-12 md:py-16 bg-gradient-to-b from-emerald-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          {/* Section Header */}
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <span>🤲</span>
              ساهم في الخير
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">تبرع لمن يحتاج</h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              ساهم مع XChange في دعم الجمعيات الخيرية الموثوقة في مصر. كل تبرع يصنع فرقاً.
            </p>
          </div>

          {/* Stats Banner */}
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 mb-8 text-white">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-1">6.5M+</div>
                <div className="text-emerald-100 text-sm">إجمالي التبرعات (ج.م)</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-1">46K+</div>
                <div className="text-emerald-100 text-sm">متبرع</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-1">15+</div>
                <div className="text-emerald-100 text-sm">جمعية خيرية</div>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold mb-1">100%</div>
                <div className="text-emerald-100 text-sm">يصل للمحتاجين</div>
              </div>
            </div>
          </div>

          {/* Charity Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {CHARITIES.map((charity) => (
              <div
                key={charity.id}
                className="bg-white rounded-2xl shadow-card hover:shadow-card-hover transition-all overflow-hidden border border-gray-100"
              >
                {/* Charity Header */}
                <div className={`bg-gradient-to-r ${charity.color} p-4 text-white`}>
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{charity.logo}</span>
                    <div>
                      <h3 className="font-bold text-lg">{charity.name}</h3>
                      <p className="text-white/80 text-xs">{charity.description}</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="p-4">
                  <div className="flex justify-between text-sm mb-4">
                    <div>
                      <div className="text-gray-500 text-xs">إجمالي التبرعات</div>
                      <div className="font-bold text-gray-900">{charity.totalDonations.toLocaleString()} ج.م</div>
                    </div>
                    <div className="text-right">
                      <div className="text-gray-500 text-xs">عدد المتبرعين</div>
                      <div className="font-bold text-gray-900">{charity.donorsCount.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Quick Donate Buttons */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[10, 25, 50].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => {
                          setSelectedCharity(charity);
                          setDonationAmount(amount);
                          setDonationModalOpen(true);
                        }}
                        className="py-2 text-sm font-medium bg-gray-100 hover:bg-emerald-100 text-gray-700 hover:text-emerald-700 rounded-lg transition-colors"
                      >
                        {amount} ج.م
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Button */}
                  <button
                    onClick={() => {
                      setSelectedCharity(charity);
                      setDonationAmount(null);
                      setDonationModalOpen(true);
                    }}
                    className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    <span>💝</span>
                    تبرع الآن
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* View All Charities */}
          <div className="text-center">
            <Link
              href="/donations"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl font-medium hover:bg-emerald-200 transition-colors"
            >
              <span>🏛️</span>
              عرض كل الجمعيات الخيرية
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ============================================
          Donation Modal - Enhanced with In-Kind Donations
          ============================================ */}
      {donationModalOpen && selectedCharity && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDonationModalOpen(false)}>
          <div
            className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl animate-fade-in-up max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${selectedCharity.color} p-6 text-white sticky top-0`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-4xl">{selectedCharity.logo}</span>
                  <div>
                    <h3 className="font-bold text-xl">{selectedCharity.name}</h3>
                    <p className="text-white/80 text-sm">{selectedCharity.description}</p>
                  </div>
                </div>
                <button
                  onClick={() => setDonationModalOpen(false)}
                  className="p-2 hover:bg-white/20 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Donation Type Selector */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">نوع التبرع</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setDonationType('money')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-all ${
                      donationType === 'money'
                        ? 'bg-emerald-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-2xl">💵</span>
                    <div className="text-right">
                      <div className="font-bold">تبرع مالي</div>
                      <div className={`text-xs ${donationType === 'money' ? 'text-emerald-100' : 'text-gray-500'}`}>نقدي أو إلكتروني</div>
                    </div>
                  </button>
                  <button
                    onClick={() => setDonationType('inkind')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-xl font-medium transition-all ${
                      donationType === 'inkind'
                        ? 'bg-amber-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-2xl">📦</span>
                    <div className="text-right">
                      <div className="font-bold">تبرع عيني</div>
                      <div className={`text-xs ${donationType === 'inkind' ? 'text-amber-100' : 'text-gray-500'}`}>ملابس، أثاث، طعام</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Monetary Donation Section */}
              {donationType === 'money' && (
                <>
                  <h4 className="font-bold text-gray-900 mb-4">اختر مبلغ التبرع</h4>

                  {/* Quick Amounts */}
                  <div className="grid grid-cols-4 gap-3 mb-4">
                    {[10, 25, 50, 100].map((amount) => (
                      <button
                        key={amount}
                        onClick={() => setDonationAmount(amount)}
                        className={`py-3 rounded-xl font-bold transition-all ${
                          donationAmount === amount
                            ? 'bg-emerald-500 text-white shadow-lg'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {amount}
                      </button>
                    ))}
                  </div>

                  {/* Custom Amount Input */}
                  <div className="mb-6">
                    <label className="block text-sm text-gray-600 mb-2">أو أدخل مبلغ آخر</label>
                    <div className="relative">
                      <input
                        type="number"
                        placeholder="أدخل المبلغ"
                        value={donationAmount || ''}
                        onChange={(e) => setDonationAmount(Number(e.target.value) || null)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                      />
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">ج.م</span>
                    </div>
                  </div>

                  {/* Payment Methods */}
                  <div className="mb-6">
                    <label className="block text-sm text-gray-600 mb-3">طريقة الدفع</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button className="flex items-center justify-center gap-2 p-3 border-2 border-emerald-500 bg-emerald-50 rounded-xl text-emerald-700 font-medium">
                        <span>💳</span>
                        بطاقة ائتمان
                      </button>
                      <button className="flex items-center justify-center gap-2 p-3 border-2 border-gray-200 rounded-xl text-gray-600 hover:border-emerald-500 hover:bg-emerald-50 transition-colors">
                        <span>📱</span>
                        محفظة إلكترونية
                      </button>
                    </div>
                  </div>

                  {/* Donate Button */}
                  <button
                    disabled={!donationAmount || donationAmount <= 0}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span>💝</span>
                    تبرع بـ {donationAmount || 0} ج.م
                  </button>
                </>
              )}

              {/* In-Kind Donation Section */}
              {donationType === 'inkind' && (
                <>
                  <h4 className="font-bold text-gray-900 mb-4">تبرع بأغراضك</h4>

                  {/* Accepted Categories */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">الفئات المقبولة من هذه الجمعية:</label>
                    <div className="flex flex-wrap gap-2">
                      {selectedCharity.inKindCategories?.map((cat) => (
                        <span key={cat} className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-sm">
                          {cat}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Item Description */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">وصف التبرع العيني</label>
                    <textarea
                      placeholder="مثال: 10 قطع ملابس أطفال بحالة جيدة، أو ثلاجة صغيرة تعمل..."
                      value={inKindDescription}
                      onChange={(e) => setInKindDescription(e.target.value)}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none resize-none"
                    />
                  </div>

                  {/* Upload Images Option */}
                  <div className="mb-4">
                    <label className="block text-sm text-gray-600 mb-2">صور التبرع (اختياري)</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-amber-500 transition-colors cursor-pointer">
                      <span className="text-4xl block mb-2">📷</span>
                      <p className="text-sm text-gray-500">اضغط لرفع صور الأغراض</p>
                      <p className="text-xs text-gray-400 mt-1">PNG, JPG حتى 5MB</p>
                    </div>
                  </div>

                  {/* Pickup Options */}
                  <div className="mb-6">
                    <label className="block text-sm text-gray-600 mb-3">طريقة التسليم</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="radio" name="delivery" defaultChecked className="w-4 h-4 text-amber-500" />
                        <span className="text-xl">🏠</span>
                        <div>
                          <div className="font-medium text-gray-900">استلام من المنزل</div>
                          <div className="text-xs text-gray-500">سيتم التواصل معك لتحديد موعد</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="radio" name="delivery" className="w-4 h-4 text-amber-500" />
                        <span className="text-xl">📍</span>
                        <div>
                          <div className="font-medium text-gray-900">التوصيل لمقر الجمعية</div>
                          <div className="text-xs text-gray-500">عنوان المقر سيظهر بعد التأكيد</div>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                        <input type="radio" name="delivery" className="w-4 h-4 text-amber-500" />
                        <span className="text-xl">🔄</span>
                        <div>
                          <div className="font-medium text-gray-900">نقطة تبادل XChange</div>
                          <div className="text-xs text-gray-500">تسليم في أقرب نقطة تبادل</div>
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Submit In-Kind Donation */}
                  <button
                    disabled={!inKindDescription.trim()}
                    className="w-full py-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl font-bold text-lg transition-colors flex items-center justify-center gap-2"
                  >
                    <span>📦</span>
                    تأكيد التبرع العيني
                  </button>
                </>
              )}

              {/* Trust Note */}
              <p className="text-center text-xs text-gray-500 mt-4">
                {donationType === 'money'
                  ? '🔒 جميع التبرعات آمنة ومشفرة • يتم تحويل 100% للجمعية مباشرة'
                  : '✅ سيتم مراجعة التبرع والتواصل معك خلال 24 ساعة'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================
          CTA Section
          ============================================ */}
      <section className="py-16 md:py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-br from-primary-500 to-teal-500 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-white rounded-full blur-3xl" />
            </div>

            <div className="relative">
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6">
                جاهز تبدأ؟
              </h2>
              <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
                انضم لآلاف المستخدمين واستفد من أفضل منصة للتجارة في مصر
              </p>

              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href={user ? '/inventory/add' : '/register'}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-primary-600 rounded-xl font-bold text-lg hover:bg-primary-50 transition-all shadow-xl hover:shadow-2xl"
                >
                  {user ? (
                    <>
                      <span>➕</span>
                      أضف إعلانك الآن
                    </>
                  ) : (
                    <>
                      <span>🚀</span>
                      إنشاء حساب مجاني
                    </>
                  )}
                </Link>
                <Link
                  href="/items"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/20 backdrop-blur-sm text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-all border border-white/30"
                >
                  <span>🛒</span>
                  تصفح المنتجات
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          Footer
          ============================================ */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-xl">🔄</span>
                </div>
                <span className="text-xl font-bold text-white">XChange</span>
              </div>
              <p className="text-sm">
                منصة التجارة الذكية الأولى في مصر. بيع، اشتري، أو بادل بكل سهولة وأمان.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/items" className="hover:text-white transition-colors">تصفح المنتجات</Link></li>
                <li><Link href="/barter" className="hover:text-white transition-colors">المقايضة</Link></li>
                <li><Link href="/auctions" className="hover:text-white transition-colors">المزادات</Link></li>
                <li><Link href="/scrap" className="hover:text-white transition-colors">سوق التوالف</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-white font-semibold mb-4">خدماتنا</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/sell-ai" className="hover:text-white transition-colors">البيع بالذكاء الصناعي</Link></li>
                <li><Link href="/escrow" className="hover:text-white transition-colors">نظام الضمان</Link></li>
                <li><Link href="/exchange-points" className="hover:text-white transition-colors">نقاط التبادل</Link></li>
                <li><Link href="/wallet" className="hover:text-white transition-colors">المحفظة</Link></li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h4 className="text-white font-semibold mb-4">الدعم</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/help" className="hover:text-white transition-colors">مركز المساعدة</Link></li>
                <li><Link href="/safety" className="hover:text-white transition-colors">نصائح الأمان</Link></li>
                <li><Link href="/terms" className="hover:text-white transition-colors">الشروط والأحكام</Link></li>
                <li><Link href="/privacy" className="hover:text-white transition-colors">سياسة الخصوصية</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">
              © 2024 XChange Egypt. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm">تابعنا:</span>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
