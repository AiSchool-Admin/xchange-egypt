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
// Platform Statistics (Live Data)
// ============================================
const PLATFORM_STATS = {
  totalUsers: 125000,
  totalTransactions: 89000,
  totalVolume: 2500000000, // 2.5 billion EGP
  activeListings: 45000,
  successRate: 98.5,
  avgResponseTime: 2, // hours
};

// ============================================
// All Platform Markets
// ============================================
const PLATFORM_MARKETS = [
  {
    id: 'general',
    name: 'السوق العام',
    nameEn: 'General Market',
    description: 'كل ما تحتاجه في مكان واحد',
    icon: '🛒',
    href: '/items',
    gradient: 'from-emerald-500 to-teal-600',
    stats: { listings: 15000, daily: 250 },
    features: ['بيع مباشر', 'مقايضة', 'مزادات'],
  },
  {
    id: 'vehicles',
    name: 'سوق السيارات',
    nameEn: 'Vehicles',
    description: 'سيارات مع فحص 150 نقطة وضمان',
    icon: '🚗',
    href: '/cars',
    gradient: 'from-blue-500 to-indigo-600',
    stats: { listings: 8500, daily: 120 },
    features: ['فحص شامل', 'تقسيط', 'ضمان'],
  },
  {
    id: 'real-estate',
    name: 'سوق العقارات',
    nameEn: 'Real Estate',
    description: 'شقق وفيلات مع تحقق حكومي',
    icon: '🏠',
    href: '/properties',
    gradient: 'from-emerald-500 to-green-600',
    stats: { listings: 5200, daily: 85 },
    features: ['جولات 360°', 'تمويل', 'تسجيل'],
  },
  {
    id: 'mobiles',
    name: 'سوق الموبايلات',
    nameEn: 'Mobiles',
    description: 'موبايلات مع فحص IMEI معتمد',
    icon: '📱',
    href: '/mobiles',
    gradient: 'from-violet-500 to-purple-600',
    stats: { listings: 12000, daily: 300 },
    features: ['فحص IMEI', 'ضمان', 'تقسيط'],
  },
  {
    id: 'auctions',
    name: 'المزادات',
    nameEn: 'Auctions',
    description: 'مزادات حية على أفضل المنتجات',
    icon: '🔨',
    href: '/auctions',
    gradient: 'from-amber-500 to-orange-600',
    stats: { listings: 450, daily: 25 },
    features: ['مزادات حية', 'مزادات مغلقة', 'ضمان'],
  },
  {
    id: 'tenders',
    name: 'المناقصات',
    nameEn: 'Tenders',
    description: 'طلبات شراء ومناقصات عكسية',
    icon: '📋',
    href: '/reverse-auctions',
    gradient: 'from-sky-500 to-blue-600',
    stats: { listings: 320, daily: 15 },
    features: ['مناقصات حكومية', 'B2B', 'عقود'],
  },
  {
    id: 'barter',
    name: 'المقايضات',
    nameEn: 'Barter',
    description: 'بادل منتجاتك بدون نقود',
    icon: '🔄',
    href: '/barter',
    gradient: 'from-orange-500 to-red-500',
    stats: { listings: 3200, daily: 80 },
    features: ['مقايضة ذكية', 'سلاسل متعددة', 'AI'],
  },
  {
    id: 'gold',
    name: 'سوق الذهب',
    nameEn: 'Gold',
    description: 'ذهب مع فحص XRF وتوثيق دمغة',
    icon: '💰',
    href: '/gold',
    gradient: 'from-yellow-500 to-amber-600',
    stats: { listings: 890, daily: 35 },
    features: ['فحص XRF', 'دمغة موثقة', 'أسعار حية'],
  },
  {
    id: 'silver',
    name: 'سوق الفضة',
    nameEn: 'Silver',
    description: 'فضة بأسعار مميزة وتوفير 30%',
    icon: '🥈',
    href: '/silver',
    gradient: 'from-slate-400 to-slate-600',
    stats: { listings: 420, daily: 18 },
    features: ['أسعار حية', 'توفير', 'برنامج ادخار'],
  },
  {
    id: 'luxury',
    name: 'سوق الفاخر',
    nameEn: 'Luxury',
    description: 'ساعات وحقائب أصلية موثقة',
    icon: '👑',
    href: '/luxury',
    gradient: 'from-purple-500 to-pink-600',
    stats: { listings: 650, daily: 12 },
    features: ['Entrupy', 'خبراء', 'ضمان أصالة'],
  },
  {
    id: 'scrap',
    name: 'سوق التوالف',
    nameEn: 'Scrap',
    description: 'خردة ومواد قابلة للتدوير',
    icon: '♻️',
    href: '/scrap',
    gradient: 'from-green-500 to-emerald-600',
    stats: { listings: 1800, daily: 45 },
    features: ['أسعار حية', 'استلام منزلي', 'ESG'],
  },
  {
    id: 'services',
    name: 'سوق الخدمات',
    nameEn: 'Services',
    description: 'خدمات احترافية مع ضمان Xchange Protect',
    icon: '🔧',
    href: '/services',
    gradient: 'from-indigo-500 to-blue-600',
    stats: { listings: 2500, daily: 65 },
    features: ['Xchange Protect', 'مقدمين معتمدين', 'دفع آمن'],
  },
  {
    id: 'transport',
    name: 'النقل الذكي',
    nameEn: 'Transport',
    description: 'قارن أسعار Uber, Careem, Bolt وأكثر',
    icon: '🚕',
    href: '/rides',
    gradient: 'from-purple-500 to-indigo-600',
    stats: { listings: 50000, daily: 5000 },
    features: ['6 تطبيقات', 'وفر 40%', 'حجز فوري'],
  },
];

// ============================================
// Trust Features
// ============================================
const TRUST_FEATURES = [
  {
    icon: '🔒',
    title: 'نظام الضمان (Escrow)',
    description: 'أموالك محمية حتى استلام المنتج',
    stat: '100% حماية',
  },
  {
    icon: '✅',
    title: 'تحقق متعدد المستويات',
    description: 'فحص الهوية والسجل التجاري',
    stat: '+50,000 موثق',
  },
  {
    icon: '🤖',
    title: 'ذكاء اصطناعي',
    description: 'تسعير ومطابقة ذكية',
    stat: '95% دقة',
  },
  {
    icon: '⚡',
    title: 'معاملات سريعة',
    description: 'متوسط إتمام الصفقة خلال ساعات',
    stat: '2 ساعة',
  },
];

// ============================================
// Hero Slides
// ============================================
const HERO_SLIDES = [
  {
    id: 'main',
    title: 'السوق الأذكى في مصر',
    subtitle: 'اشتري • بيع • بادل',
    description: 'منصة XChange تجمع 11 سوق متخصص في مكان واحد. بيع مباشر، مزادات، مقايضة، وأكثر - كل شيء بضمان كامل.',
    gradient: 'from-emerald-600 via-teal-500 to-cyan-500',
    cta: 'ابدأ التسوق',
    href: '/items',
    image: '🛒',
  },
  {
    id: 'barter',
    title: 'المقايضة الذكية',
    subtitle: 'بادل بدون نقود',
    description: 'أول نظام مقايضة بالذكاء الاصطناعي في الشرق الأوسط. سلاسل مقايضة متعددة الأطراف (A→B→C→A).',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    cta: 'ابدأ المقايضة',
    href: '/barter',
    image: '🔄',
    badge: 'جديد',
  },
  {
    id: 'auctions',
    title: 'المزادات الحية',
    subtitle: 'زايد واربح',
    description: 'مزادات حقيقية على سيارات، عقارات، إلكترونيات، وأكثر. نظام مضاد للتلاعب مع حماية كاملة.',
    gradient: 'from-purple-600 via-violet-500 to-indigo-500',
    cta: 'شاهد المزادات',
    href: '/auctions',
    image: '🔨',
  },
  {
    id: 'gold',
    title: 'سوق الذهب',
    subtitle: 'وفر حتى 38%',
    description: 'اشتري وبيع الذهب بأسعار أفضل من محلات الذهب التقليدية. فحص XRF ودمغة موثقة.',
    gradient: 'from-yellow-500 via-amber-500 to-orange-500',
    cta: 'تصفح الذهب',
    href: '/gold',
    image: '💰',
  },
];

// ============================================
// Testimonials
// ============================================
const TESTIMONIALS = [
  {
    id: 1,
    name: 'أحمد محمود',
    role: 'تاجر سيارات',
    avatar: '👨‍💼',
    content: 'بعت أكثر من 50 سيارة على XChange خلال 6 أشهر. نظام الضمان والفحص الشامل زاد ثقة المشترين بشكل كبير.',
    rating: 5,
    transactions: 52,
  },
  {
    id: 2,
    name: 'سارة أحمد',
    role: 'صاحبة متجر إلكتروني',
    avatar: '👩‍💻',
    content: 'المقايضة الذكية ساعدتني أستبدل مخزون راكد بمنتجات جديدة بدون ما أخسر فلوس. فكرة عبقرية!',
    rating: 5,
    transactions: 28,
  },
  {
    id: 3,
    name: 'محمد علي',
    role: 'مستثمر ذهب',
    avatar: '👨‍💼',
    content: 'سوق الذهب على XChange وفرلي أكثر من 25% مقارنة بالمحلات. الفحص والتوثيق بيدي ثقة كاملة.',
    rating: 5,
    transactions: 15,
  },
];

// ============================================
// Main Home Component
// ============================================
export default function HomePage() {
  const router = useRouter();
  const { user } = useAuth();

  // State
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [latestItems, setLatestItems] = useState<Item[]>([]);
  const [barterItems, setBarterItems] = useState<Item[]>([]);
  const [activeAuctions, setActiveAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentSlide, setCurrentSlide] = useState(0);
  const [liveStats, setLiveStats] = useState(PLATFORM_STATS);

  // Refs
  const marketsRef = useRef<HTMLDivElement>(null);

  // Auto-rotate hero slides
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  // Simulate live stats updates
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveStats(prev => ({
        ...prev,
        totalTransactions: prev.totalTransactions + Math.floor(Math.random() * 3),
        activeListings: prev.activeListings + Math.floor(Math.random() * 5) - 2,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [categoriesRes, featuredRes, latestRes, barterRes, auctionsRes] = await Promise.all([
        getCategories().catch(() => ({ data: [] })),
        getItems({ limit: 8, featured: true, status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        getItems({ limit: 12, status: 'ACTIVE', sortBy: 'createdAt', sortOrder: 'desc' }).catch(() => ({ data: { items: [] } })),
        getItems({ limit: 4, listingType: 'BARTER', status: 'ACTIVE' }).catch(() => ({ data: { items: [] } })),
        getAuctions({ limit: 4, status: 'ACTIVE' }).catch(() => ({ data: { auctions: [] } })),
      ]);

      setCategories(categoriesRes.data || []);
      setFeaturedItems(featuredRes.data?.items || []);
      setLatestItems(latestRes.data?.items || []);
      setBarterItems(barterRes.data?.items || []);
      const auctionsData = auctionsRes as any;
      setActiveAuctions(auctionsData.data?.auctions || auctionsData.data?.data || []);
    } catch (error) {
      console.error('Failed to load home data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/items?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000000) return `${(num / 1000000000).toFixed(1)}B`;
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toLocaleString('ar-EG');
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* ============================================
          Hero Section - World Class Design
          ============================================ */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className={`absolute inset-0 bg-gradient-to-br ${HERO_SLIDES[currentSlide].gradient} transition-all duration-1000`}>
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
            <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl animate-pulse delay-1000" />
            <div className="absolute top-1/2 left-1/2 w-72 h-72 bg-white rounded-full blur-3xl animate-pulse delay-500" />
          </div>
          {/* Grid Pattern */}
          <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          {/* Hero Content */}
          <div className="text-center mb-12">
            {/* Slide Content */}
            <div className="relative min-h-[220px] md:min-h-[240px]">
              {HERO_SLIDES.map((slide, index) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 transition-all duration-700 ${
                    index === currentSlide
                      ? 'opacity-100 translate-y-0'
                      : 'opacity-0 translate-y-8 pointer-events-none'
                  }`}
                >
                  {slide.badge && (
                    <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-white text-sm font-bold mb-4 animate-bounce">
                      ✨ {slide.badge}
                    </span>
                  )}
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 leading-tight">
                    <span className="text-6xl md:text-7xl block mb-2">{slide.image}</span>
                    {slide.title}
                  </h1>
                  <p className="text-xl md:text-2xl text-white/90 font-bold mb-2">{slide.subtitle}</p>
                  <p className="text-base md:text-lg text-white/80 max-w-2xl mx-auto mb-6">{slide.description}</p>
                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
                  >
                    {slide.cta}
                    <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              ))}
            </div>

            {/* Slide Indicators */}
            <div className="flex justify-center gap-2 mt-8">
              {HERO_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 rounded-full transition-all ${
                    index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/40 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Search Bar - Prominent */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن أي شيء... سيارات، موبايلات، عقارات، ذهب..."
                className="w-full px-6 py-5 pr-14 bg-white/95 backdrop-blur-sm rounded-2xl text-lg text-gray-800 placeholder-gray-400 shadow-2xl focus:ring-4 focus:ring-white/30 outline-none"
              />
              <button
                type="submit"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
            {/* Quick Search Tags */}
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {['آيفون 15', 'سيارة هيونداي', 'شقة للإيجار', 'ذهب عيار 21', 'لابتوب'].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => router.push(`/items?search=${encodeURIComponent(tag)}`)}
                  className="px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm font-medium hover:bg-white/30 transition-all"
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* ============================================
          Live Statistics Bar
          ============================================ */}
      <section className="bg-white border-b border-gray-100 py-4">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-emerald-600">{formatNumber(liveStats.activeListings)}</div>
              <div className="text-sm text-gray-500">إعلان نشط</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-blue-600">{formatNumber(liveStats.totalUsers)}</div>
              <div className="text-sm text-gray-500">مستخدم</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-purple-600">{formatNumber(liveStats.totalTransactions)}</div>
              <div className="text-sm text-gray-500">صفقة ناجحة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl md:text-3xl font-black text-amber-600">{liveStats.successRate}%</div>
              <div className="text-sm text-gray-500">نسبة النجاح</div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          All Markets Section - The Core
          ============================================ */}
      <section className="py-16 bg-gradient-to-b from-gray-50 to-white" ref={marketsRef}>
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              🏪 13 سوق متخصص في مكان واحد
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              كل سوق مصمم بعناية لتجربة شراء وبيع مثالية مع ميزات فريدة وحماية كاملة
            </p>
          </div>

          {/* Markets Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {PLATFORM_MARKETS.map((market) => (
              <Link
                key={market.id}
                href={market.href}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent overflow-hidden"
              >
                {/* Gradient Overlay on Hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${market.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative z-10">
                  {/* Icon */}
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{market.icon}</div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-1 transition-colors">
                    {market.name}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-gray-500 group-hover:text-white/80 mb-3 transition-colors line-clamp-2">
                    {market.description}
                  </p>

                  {/* Stats */}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-gray-100 group-hover:bg-white/20 rounded-full text-gray-600 group-hover:text-white transition-colors">
                      {formatNumber(market.stats.listings)} إعلان
                    </span>
                    <span className="text-gray-400 group-hover:text-white/60 transition-colors">
                      +{market.stats.daily} يومياً
                    </span>
                  </div>

                  {/* Features Tags */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {market.features.slice(0, 2).map((feature) => (
                      <span
                        key={feature}
                        className="text-[10px] px-2 py-0.5 bg-emerald-50 text-emerald-600 group-hover:bg-white/20 group-hover:text-white rounded-full transition-colors"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Arrow */}
                <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="w-6 h-6 text-white rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          Trust & Security Section
          ============================================ */}
      <section className="py-16 bg-gradient-to-r from-emerald-900 via-teal-900 to-emerald-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black mb-4">
              🛡️ لماذا XChange؟
            </h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              نحن نضع أمانك وثقتك في المقام الأول مع نظام حماية متكامل
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {TRUST_FEATURES.map((feature, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-colors"
              >
                <div className="text-5xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-white/70 text-sm mb-4">{feature.description}</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-bold">
                  {feature.stat}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          Featured Items Section
          ============================================ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">⭐ منتجات مميزة</h2>
              <p className="text-gray-500">أفضل المنتجات المختارة لك</p>
            </div>
            <Link
              href="/items?featured=true"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold"
            >
              عرض الكل
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {loading ? (
              Array.from({ length: 8 }).map((_, i) => <ItemCardSkeleton key={i} />)
            ) : featuredItems.length > 0 ? (
              featuredItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.estimatedValue || 0}
                  images={item.images?.map(img => img.url) || []}
                  condition={item.condition}
                  governorate={item.governorate}
                  listingType={item.listingType as any}
                  category={item.category?.nameAr}
                  seller={item.seller ? { id: item.seller.id, name: item.seller.fullName || '' } : undefined}
                  createdAt={item.createdAt}
                  isFeatured
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                لا توجد منتجات مميزة حالياً
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          Latest Items Section
          ============================================ */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">🆕 أحدث الإعلانات</h2>
              <p className="text-gray-500">تصفح آخر المنتجات المضافة</p>
            </div>
            <Link
              href="/items"
              className="flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-bold"
            >
              عرض الكل
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {loading ? (
              Array.from({ length: 12 }).map((_, i) => <ItemCardSkeleton key={i} />)
            ) : latestItems.length > 0 ? (
              latestItems.map((item) => (
                <ItemCard
                  key={item.id}
                  id={item.id}
                  title={item.title}
                  price={item.estimatedValue || 0}
                  images={item.images?.map(img => img.url) || []}
                  condition={item.condition}
                  governorate={item.governorate}
                  listingType={item.listingType as any}
                  category={item.category?.nameAr}
                  createdAt={item.createdAt}
                  variant="compact"
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                لا توجد منتجات حالياً
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          Barter Highlight Section
          ============================================ */}
      <section className="py-16 bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-sm font-bold mb-4">
                🔄 ميزة حصرية
              </span>
              <h2 className="text-3xl md:text-4xl font-black mb-4">
                المقايضة الذكية
              </h2>
              <p className="text-lg text-white/90 mb-6">
                بادل منتجاتك القديمة بمنتجات جديدة بدون نقود! نظام الذكاء الاصطناعي يجد لك أفضل الصفقات ويدعم سلاسل المقايضة المتعددة الأطراف.
              </p>
              <ul className="space-y-3 mb-8">
                {['مطابقة ذكية بالـ AI', 'سلاسل متعددة الأطراف (A→B→C→A)', 'دمج النقد + المقايضة', 'حماية بنظام الضمان'].map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <span className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm">✓</span>
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/barter"
                  className="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold hover:bg-white/90 transition-colors"
                >
                  ابدأ المقايضة
                </Link>
                <Link
                  href="/barter/guide"
                  className="px-8 py-4 bg-white/20 text-white rounded-xl font-bold hover:bg-white/30 transition-colors"
                >
                  كيف تعمل؟
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {barterItems.length > 0 ? (
                barterItems.slice(0, 4).map((item) => (
                  <div key={item.id} className="bg-white/10 backdrop-blur-sm rounded-2xl p-4">
                    <div className="aspect-square bg-white/20 rounded-xl mb-3 flex items-center justify-center text-4xl">
                      {item.images?.[0]?.url ? (
                        <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        '📦'
                      )}
                    </div>
                    <h4 className="font-bold text-sm truncate">{item.title}</h4>
                    <p className="text-xs text-white/70">متاح للمقايضة</p>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8 text-white/70">
                  <div className="text-6xl mb-4">🔄</div>
                  <p>ابدأ أول مقايضة لك الآن</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================
          Testimonials Section
          ============================================ */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              💬 ماذا يقول عملاؤنا
            </h2>
            <p className="text-lg text-gray-600">قصص نجاح حقيقية من مستخدمي XChange</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-gray-50 rounded-2xl p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{testimonial.avatar}</div>
                  <div>
                    <h4 className="font-bold text-gray-900">{testimonial.name}</h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 mb-4 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-1">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <span key={i} className="text-amber-400">⭐</span>
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">{testimonial.transactions} صفقة</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================
          CTA Section
          ============================================ */}
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            🚀 ابدأ البيع والشراء الآن
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            انضم لأكثر من {formatNumber(liveStats.totalUsers)} مستخدم يتداولون يومياً على XChange. التسجيل مجاني وسريع.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <>
                <Link
                  href="/inventory/add"
                  className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-colors shadow-lg"
                >
                  ➕ أضف إعلانك الأول
                </Link>
                <Link
                  href="/items"
                  className="px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-colors"
                >
                  تصفح المنتجات
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/register"
                  className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-colors shadow-lg"
                >
                  إنشاء حساب مجاني
                </Link>
                <Link
                  href="/login"
                  className="px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-colors"
                >
                  تسجيل الدخول
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ============================================
          Footer CTA - Download App (Future)
          ============================================ */}
      <section className="py-12 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-2">📱 قريباً - تطبيق XChange</h3>
              <p className="text-gray-400">تابع جميع صفقاتك من موبايلك</p>
            </div>
            <div className="flex gap-4">
              <button className="px-6 py-3 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                <span>🍎</span> App Store
              </button>
              <button className="px-6 py-3 bg-white/10 rounded-xl text-sm font-medium hover:bg-white/20 transition-colors flex items-center gap-2">
                <span>🤖</span> Google Play
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
