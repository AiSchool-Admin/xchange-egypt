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
// Stats Data
// ============================================
const STATS = [
  { value: '50K+', label: 'منتج نشط', icon: '📦' },
  { value: '25K+', label: 'مستخدم موثوق', icon: '👥' },
  { value: '100K+', label: 'صفقة ناجحة', icon: '✅' },
  { value: '27', label: 'محافظة', icon: '🗺️' },
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
  const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
  const [activeTenders, setActiveTenders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

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
      const [categoriesRes, featuredRes, latestRes, saleRes, wantedRes, auctionsRes, tendersRes] = await Promise.all([
        getCategories().catch(() => ({ data: [] })),
        getItems({ limit: 4, featured: true, status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        getItems({ limit: 8, status: 'ACTIVE', sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => ({ data: { items: [] } })),
        getItems({ limit: 4, listingType: 'DIRECT_SALE', status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        getItems({ limit: 4, listingType: 'DIRECT_BUY', status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        getAuctions({ limit: 4, status: 'ACTIVE' }).catch(() => ({ data: { auctions: [] } })),
        apiClient.get('/reverse-auctions?status=ACTIVE&limit=4').catch(() => ({ data: { data: [] } })),
      ]);

      setCategories(categoriesRes.data || []);
      setFeaturedItems(featuredRes.data?.items || []);
      setLatestItems(latestRes.data?.items || []);
      setSaleItems(saleRes.data?.items || []);
      setWantedItems(wantedRes.data?.items || []);
      // Handle different response formats safely
      const auctionsData = auctionsRes as any;
      setActiveAuctions(auctionsData.data?.auctions || auctionsData.data?.data || []);
      const tendersData = tendersRes as any;
      setActiveTenders(tendersData.data?.data?.reverseAuctions || tendersData.data?.data || []);
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
          Hero Section
          ============================================ */}
      <section className="relative bg-gradient-to-br from-primary-600 via-primary-500 to-teal-500 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-72 h-72 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center max-w-3xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
              اشتري، بيع، أو بادل
              <span className="block text-primary-100">بكل سهولة وأمان</span>
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
              منصة XChange هي السوق الأول في مصر للتجارة الذكية والمقايضة.
              جديد، مستعمل، أو تالف - كل شيء له قيمة هنا.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8">
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

            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-4">
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
          Stats Section
          ============================================ */}
      <section className="relative -mt-8 z-10">
        <div className="max-w-5xl mx-auto px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl mb-2">{stat.icon}</div>
                <div className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          Categories Dropdown & Quick Links Section
          ============================================ */}
      <section className="py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center gap-4">
            {/* Categories Dropdown */}
            <div className="relative" ref={categoryDropdownRef}>
              <button
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className="flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-semibold hover:bg-primary-600 transition-all shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                <span>كل الفئات</span>
                <svg className={`w-4 h-4 transition-transform ${categoryDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {categoryDropdownOpen && (
                <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                  <div className="max-h-[70vh] overflow-y-auto">
                    {parentCategories.map((category) => {
                      const { icon, gradient } = getCategoryIcon(category.slug);
                      const subcategories = getSubcategories(category.id);
                      const isExpanded = expandedCategory === category.id;

                      return (
                        <div key={category.id} className="border-b border-gray-50 last:border-0">
                          <div
                            className="flex items-center justify-between p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                            onClick={() => {
                              if (subcategories.length > 0) {
                                setExpandedCategory(isExpanded ? null : category.id);
                              } else {
                                router.push(`/items?category=${category.slug}`);
                                setCategoryDropdownOpen(false);
                              }
                            }}
                          >
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center text-lg`}>
                                {icon}
                              </div>
                              <span className="font-medium text-gray-800">{category.nameAr}</span>
                            </div>
                            {subcategories.length > 0 && (
                              <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            )}
                          </div>

                          {/* Subcategories */}
                          {isExpanded && subcategories.length > 0 && (
                            <div className="bg-gray-50 py-2">
                              <Link
                                href={`/items?category=${category.slug}`}
                                className="block px-4 py-2 pr-14 text-sm text-primary-600 font-medium hover:bg-gray-100 transition-colors"
                                onClick={() => setCategoryDropdownOpen(false)}
                              >
                                عرض الكل في {category.nameAr}
                              </Link>
                              {subcategories.map((sub) => (
                                <Link
                                  key={sub.id}
                                  href={`/items?category=${sub.slug}`}
                                  className="block px-4 py-2 pr-14 text-sm text-gray-600 hover:text-primary-600 hover:bg-gray-100 transition-colors"
                                  onClick={() => setCategoryDropdownOpen(false)}
                                >
                                  {sub.nameAr}
                                </Link>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Category Links */}
            <div className="flex flex-wrap gap-2">
              {parentCategories.slice(0, 6).map((category) => {
                const { icon } = getCategoryIcon(category.slug);
                return (
                  <Link
                    key={category.id}
                    href={`/items?category=${category.slug}`}
                    className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:text-primary-600 transition-all shadow-sm border border-gray-100"
                  >
                    <span>{icon}</span>
                    <span className="hidden sm:inline">{category.nameAr}</span>
                  </Link>
                );
              })}
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
                      <div className="font-bold text-blue-600">{(tender.targetPrice || 0).toLocaleString()} ج.م</div>
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
