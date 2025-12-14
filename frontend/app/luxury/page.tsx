'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getItems, getLuxuryItems, Item } from '@/lib/api/items';

// Luxury categories with links to dedicated pages
const LUXURY_CATEGORIES = [
  { id: 'luxury-watches', slug: 'watches', nameAr: 'ساعات فاخرة', icon: '⌚', gradient: 'from-amber-600 to-yellow-500', hasPage: true },
  { id: 'jewelry', slug: 'jewelry', nameAr: 'مجوهرات', icon: '💎', gradient: 'from-purple-600 to-pink-500', hasPage: true },
  { id: 'luxury-bags', slug: 'handbags', nameAr: 'حقائب فاخرة', icon: '👜', gradient: 'from-rose-600 to-orange-500', hasPage: true },
  { id: 'perfumes', slug: 'perfumes', nameAr: 'عطور أصلية', icon: '🌸', gradient: 'from-pink-500 to-rose-400', hasPage: false },
  { id: 'luxury-pens', slug: 'pens', nameAr: 'أقلام فاخرة', icon: '🖊️', gradient: 'from-gray-600 to-gray-800', hasPage: false },
  { id: 'sunglasses', slug: 'sunglasses', nameAr: 'نظارات شمسية', icon: '🕶️', gradient: 'from-blue-600 to-indigo-500', hasPage: false },
];

// User account links
const USER_LINKS = [
  { href: '/luxury/my-listings', icon: '📦', title: 'إعلاناتي', desc: 'إدارة منتجاتك', gradient: 'from-blue-500 to-indigo-500' },
  { href: '/luxury/my-bids', icon: '🔨', title: 'مزايداتي', desc: 'تتبع مزايداتك', gradient: 'from-purple-500 to-violet-500' },
  { href: '/luxury/notifications', icon: '🔔', title: 'الإشعارات', desc: 'تنبيهات المزادات', gradient: 'from-red-500 to-pink-500' },
  { href: '/luxury/experts', icon: '👨‍💼', title: 'الخبراء', desc: 'توثيق المنتجات', gradient: 'from-emerald-500 to-teal-500' },
];

// Quick action links
const QUICK_ACTIONS = [
  { href: '/luxury/sell', icon: '➕', title: 'بيع منتجك', desc: 'أضف منتجك الفاخر', gradient: 'from-emerald-500 to-teal-500' },
  { href: '/luxury/watches', icon: '⌚', title: 'الساعات الفاخرة', desc: 'تصفح أفخم الساعات', gradient: 'from-amber-500 to-yellow-500' },
  { href: '/luxury/sell?category=JEWELRY', icon: '💎', title: 'بيع مجوهرات', desc: 'أضف مجوهراتك', gradient: 'from-purple-500 to-pink-500' },
  { href: '/luxury/sell?category=HANDBAGS', icon: '👜', title: 'بيع حقيبة', desc: 'أضف حقيبتك الفاخرة', gradient: 'from-rose-500 to-orange-500' },
];

// Minimum price threshold for luxury items (in EGP)
const LUXURY_MIN_PRICE = 50000;

export default function LuxuryMarketplacePage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_high' | 'price_low' | 'recent'>('price_high');
  const [priceRange, setPriceRange] = useState<'all' | '50k-100k' | '100k-500k' | '500k-1m' | '1m+'>('all');

  useEffect(() => {
    loadItems();
  }, [selectedCategory, sortBy, priceRange]);

  const loadItems = async () => {
    setLoading(true);
    try {
      let minPrice = LUXURY_MIN_PRICE;

      switch (priceRange) {
        case '50k-100k':
          minPrice = 50000;
          break;
        case '100k-500k':
          minPrice = 100000;
          break;
        case '500k-1m':
          minPrice = 500000;
          break;
        case '1m+':
          minPrice = 1000000;
          break;
      }

      try {
        const luxuryResponse = await getLuxuryItems({
          limit: 50,
          minPrice,
          categoryId: selectedCategory || undefined,
          sortBy,
        });

        let fetchedItems = luxuryResponse.data?.items || [];

        if (priceRange === '50k-100k') {
          fetchedItems = fetchedItems.filter(item => (item.estimatedValue || 0) <= 100000);
        } else if (priceRange === '100k-500k') {
          fetchedItems = fetchedItems.filter(item => (item.estimatedValue || 0) <= 500000);
        } else if (priceRange === '500k-1m') {
          fetchedItems = fetchedItems.filter(item => (item.estimatedValue || 0) <= 1000000);
        }

        setItems(fetchedItems);
      } catch (apiError) {
        let maxPrice: number | undefined;
        switch (priceRange) {
          case '50k-100k':
            maxPrice = 100000;
            break;
          case '100k-500k':
            maxPrice = 500000;
            break;
          case '500k-1m':
            maxPrice = 1000000;
            break;
        }

        const response = await getItems({
          minPrice,
          maxPrice,
          categoryId: selectedCategory || undefined,
          status: 'ACTIVE',
          limit: 50,
        });

        let sortedItems = response.data?.items || [];

        if (sortBy === 'price_high') {
          sortedItems = sortedItems.sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));
        } else if (sortBy === 'price_low') {
          sortedItems = sortedItems.sort((a, b) => (a.estimatedValue || 0) - (b.estimatedValue || 0));
        }

        setItems(sortedItems);
      }
    } catch (error) {
      console.error('Failed to load luxury items:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون ج.م`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)} ألف ج.م`;
    }
    return `${price.toLocaleString('ar-EG')} ج.م`;
  };

  const getPriceTier = (price: number) => {
    if (price >= 1000000) return { label: 'بلاتينيوم', color: 'bg-gradient-to-r from-gray-800 to-gray-600', textColor: 'text-white' };
    if (price >= 500000) return { label: 'ذهبي', color: 'bg-gradient-to-r from-amber-500 to-yellow-400', textColor: 'text-amber-900' };
    if (price >= 100000) return { label: 'فضي', color: 'bg-gradient-to-r from-gray-400 to-gray-300', textColor: 'text-gray-800' };
    return { label: 'مميز', color: 'bg-gradient-to-r from-emerald-500 to-teal-400', textColor: 'text-white' };
  };

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Premium Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-gray-900 to-gray-950"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 left-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-6">
              <span className="text-2xl">👑</span>
              <span className="text-amber-400 font-medium">السلع الفاخرة</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                السلع الفاخرة
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              اكتشف أرقى المنتجات الفاخرة والمقتنيات النادرة في مصر - ساعات، مجوهرات، حقائب وأكثر
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-8">
              <div className="text-center">
                <div className="text-3xl font-bold text-white">{items.length}+</div>
                <div className="text-gray-500 text-sm">منتج فاخر</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">100%</div>
                <div className="text-gray-500 text-sm">أصلي ومضمون</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-white">24/7</div>
                <div className="text-gray-500 text-sm">دعم VIP</div>
              </div>
            </div>

            {/* Main CTA Buttons */}
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/luxury/sell"
                className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition flex items-center gap-2"
              >
                <span>➕</span>
                <span>أضف منتجك الفاخر</span>
              </Link>
              <Link
                href="/luxury/watches"
                className="px-8 py-4 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition border border-gray-700 flex items-center gap-2"
              >
                <span>⌚</span>
                <span>تصفح الساعات</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Grid */}
      <section className="bg-gray-900/80 py-8 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-white text-center mb-6">⚡ الوصول السريع</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {QUICK_ACTIONS.map((action, i) => (
              <Link
                key={i}
                href={action.href}
                className={`p-4 rounded-xl bg-gradient-to-br ${action.gradient} hover:scale-105 transition-transform`}
              >
                <span className="text-3xl block mb-2">{action.icon}</span>
                <h3 className="text-white font-bold">{action.title}</h3>
                <p className="text-white/80 text-sm">{action.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* User Account Section */}
      <section className="bg-gray-800/50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-white text-center mb-6">👤 حسابي</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {USER_LINKS.map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className={`p-4 rounded-xl bg-gradient-to-br ${link.gradient} hover:scale-105 transition-transform`}
              >
                <span className="text-3xl block mb-2">{link.icon}</span>
                <h3 className="text-white font-bold">{link.title}</h3>
                <p className="text-white/80 text-sm">{link.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Categories with Links */}
      <section className="bg-gray-900 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-white text-center mb-6">📦 تصفح حسب الفئة</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => setSelectedCategory(null)}
              className={`px-6 py-3 rounded-full font-medium transition ${
                !selectedCategory
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              جميع الفئات
            </button>
            {LUXURY_CATEGORIES.map((cat) => (
              cat.hasPage ? (
                <Link
                  key={cat.id}
                  href={`/luxury/${cat.slug}`}
                  className={`px-6 py-3 rounded-full font-medium transition flex items-center gap-2 bg-gradient-to-r ${cat.gradient} text-white hover:opacity-90`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.nameAr}</span>
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">صفحة مخصصة</span>
                </Link>
              ) : (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-6 py-3 rounded-full font-medium transition flex items-center gap-2 ${
                    selectedCategory === cat.id
                      ? `bg-gradient-to-r ${cat.gradient} text-white`
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.nameAr}</span>
                </button>
              )
            ))}
          </div>
        </div>
      </section>

      {/* Navigation Links Section */}
      <section className="bg-gray-800/50 py-8 border-y border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-white text-center mb-6">🗺️ جميع صفحات السوق</h2>

          {/* Category Pages */}
          <h3 className="text-lg font-semibold text-amber-400 mb-4">📦 صفحات الفئات</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {/* Watches Page */}
            <Link
              href="/luxury/watches"
              className="p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-amber-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                  ⌚
                </div>
                <div>
                  <h3 className="text-white font-bold">الساعات الفاخرة</h3>
                  <p className="text-gray-400 text-sm">/luxury/watches</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3">Rolex, Omega, Patek Philippe والمزيد</p>
            </Link>

            {/* Jewelry Page */}
            <Link
              href="/luxury/jewelry"
              className="p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-purple-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                  💎
                </div>
                <div>
                  <h3 className="text-white font-bold">المجوهرات</h3>
                  <p className="text-gray-400 text-sm">/luxury/jewelry</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3">خواتم، قلائد، أساور، أقراط</p>
            </Link>

            {/* Handbags Page */}
            <Link
              href="/luxury/handbags"
              className="p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-rose-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                  👜
                </div>
                <div>
                  <h3 className="text-white font-bold">الحقائب الفاخرة</h3>
                  <p className="text-gray-400 text-sm">/luxury/handbags</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3">Hermès, Louis Vuitton, Chanel</p>
            </Link>

            {/* Experts Page */}
            <Link
              href="/luxury/experts"
              className="p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-emerald-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                  👨‍💼
                </div>
                <div>
                  <h3 className="text-white font-bold">خبراء التوثيق</h3>
                  <p className="text-gray-400 text-sm">/luxury/experts</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3">خبراء معتمدين للتحقق من الأصالة</p>
            </Link>
          </div>

          {/* User Account Pages */}
          <h3 className="text-lg font-semibold text-amber-400 mb-4">👤 صفحات المستخدم</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
            {/* Sell Page */}
            <Link
              href="/luxury/sell"
              className="p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-emerald-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                  ➕
                </div>
                <div>
                  <h3 className="text-white font-bold">بيع منتج فاخر</h3>
                  <p className="text-gray-400 text-sm">/luxury/sell</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3">نموذج متعدد الخطوات مع دعم المزايدة</p>
            </Link>

            {/* My Listings Page */}
            <Link
              href="/luxury/my-listings"
              className="p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-blue-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                  📦
                </div>
                <div>
                  <h3 className="text-white font-bold">إعلاناتي</h3>
                  <p className="text-gray-400 text-sm">/luxury/my-listings</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3">إدارة منتجاتك والعروض المقدمة</p>
            </Link>

            {/* My Bids Page */}
            <Link
              href="/luxury/my-bids"
              className="p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-purple-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                  🔨
                </div>
                <div>
                  <h3 className="text-white font-bold">مزايداتي</h3>
                  <p className="text-gray-400 text-sm">/luxury/my-bids</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3">تتبع حالة مزايداتك على المنتجات</p>
            </Link>

            {/* Notifications Page */}
            <Link
              href="/luxury/notifications"
              className="p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-red-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                  🔔
                </div>
                <div>
                  <h3 className="text-white font-bold">الإشعارات</h3>
                  <p className="text-gray-400 text-sm">/luxury/notifications</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3">تنبيهات المزادات والعروض</p>
            </Link>
          </div>

          {/* Other Pages */}
          <h3 className="text-lg font-semibold text-amber-400 mb-4">📄 صفحات أخرى</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Item Details Page */}
            <Link
              href="/luxury/item/demo"
              className="p-6 bg-gray-900 rounded-xl border border-gray-700 hover:border-amber-500 transition group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition">
                  🔍
                </div>
                <div>
                  <h3 className="text-white font-bold">تفاصيل المنتج</h3>
                  <p className="text-gray-400 text-sm">/luxury/item/[id]</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3">معرض صور، مزايدة، عروض أسعار</p>
            </Link>

            {/* Main Luxury Page */}
            <div className="p-6 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center text-2xl">
                  👑
                </div>
                <div>
                  <h3 className="text-amber-400 font-bold">أنت هنا</h3>
                  <p className="text-gray-400 text-sm">/luxury</p>
                </div>
              </div>
              <p className="text-gray-500 text-sm mt-3">الصفحة الرئيسية للسلع الفاخرة</p>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-gray-900/50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'كل الأسعار' },
                { value: '50k-100k', label: '50 - 100 ألف' },
                { value: '100k-500k', label: '100 - 500 ألف' },
                { value: '500k-1m', label: '500 ألف - مليون' },
                { value: '1m+', label: 'مليون +' },
              ].map((range) => (
                <button
                  key={range.value}
                  onClick={() => setPriceRange(range.value as typeof priceRange)}
                  className={`px-4 py-2 rounded-lg text-sm transition ${
                    priceRange === range.value
                      ? 'bg-amber-500 text-gray-900 font-medium'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 focus:outline-none focus:border-amber-500"
            >
              <option value="price_high">الأعلى سعراً</option>
              <option value="price_low">الأقل سعراً</option>
              <option value="recent">الأحدث</option>
            </select>
          </div>
        </div>
      </section>

      {/* Items Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-white mb-8">🏆 المنتجات الفاخرة المعروضة</h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-700"></div>
                <div className="p-6">
                  <div className="h-6 bg-gray-700 rounded w-1/2 mb-3"></div>
                  <div className="h-4 bg-gray-700 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="text-6xl mb-6">👑</div>
            <h3 className="text-2xl font-bold text-white mb-3">لا توجد منتجات فاخرة حالياً</h3>
            <p className="text-gray-400 mb-8">كن أول من يعرض منتجاته الفاخرة على المنصة</p>
            <Link
              href="/luxury/sell"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition"
            >
              <span>➕</span>
              <span>أضف منتجك الفاخر الآن</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const tier = getPriceTier(item.estimatedValue || 0);

              return (
                <Link
                  key={item.id}
                  href={`/luxury/item/${item.id}`}
                  className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300"
                >
                  <div className="relative h-64 bg-gray-900 overflow-hidden">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0].url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-6xl opacity-20">👑</span>
                      </div>
                    )}

                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${tier.color} ${tier.textColor}`}>
                      {tier.label}
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                  </div>

                  <div className="p-6">
                    {item.category && (
                      <div className="text-amber-500 text-sm mb-2">{item.category.nameAr}</div>
                    )}

                    <h3 className="text-white font-bold text-lg mb-3 line-clamp-2 group-hover:text-amber-400 transition">
                      {item.title}
                    </h3>

                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                        {formatPrice(item.estimatedValue || 0)}
                      </div>

                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {item.governorate || 'مصر'}
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs ${
                        item.condition === 'NEW' ? 'bg-emerald-500/20 text-emerald-400' :
                        item.condition === 'LIKE_NEW' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-gray-700 text-gray-400'
                      }`}>
                        {item.condition === 'NEW' ? 'جديد' :
                         item.condition === 'LIKE_NEW' ? 'كالجديد' :
                         item.condition === 'GOOD' ? 'جيد' :
                         item.condition === 'FAIR' ? 'مقبول' : 'مستعمل'}
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            لماذا <span className="text-amber-400">السلع الفاخرة</span> على Xchange؟
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '✓', title: 'منتجات أصلية', desc: 'توثيق من خبراء متخصصين', gradient: 'from-amber-500 to-yellow-500' },
              { icon: '🔒', title: 'دفع آمن', desc: 'نظام ضمان للمشتري والبائع', gradient: 'from-purple-500 to-pink-500' },
              { icon: '🔨', title: 'مزادات حية', desc: 'نظام مزايدة احترافي', gradient: 'from-blue-500 to-cyan-500' },
              { icon: '🎯', title: 'خدمة VIP', desc: 'دعم على مدار الساعة', gradient: 'from-emerald-500 to-teal-500' },
            ].map((feature, i) => (
              <div key={i} className="text-center p-6 bg-gray-800/30 rounded-2xl border border-gray-700/50">
                <div className={`w-14 h-14 bg-gradient-to-r ${feature.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">هل لديك منتج فاخر للبيع؟</h2>
          <p className="text-gray-400 mb-8">انضم إلى سوق السلع الفاخرة واستهدف العملاء المميزين</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/luxury/sell"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition flex items-center justify-center gap-2"
            >
              <span>➕</span>
              <span>أضف منتجك الآن</span>
            </Link>
            <Link
              href="/luxury/watches"
              className="px-8 py-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition border border-gray-700 flex items-center justify-center gap-2"
            >
              <span>⌚</span>
              <span>تصفح الساعات الفاخرة</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white font-bold mb-4">👑 السلع الفاخرة</h3>
              <p className="text-gray-400 text-sm">سوق المنتجات الفاخرة الأول في مصر - ساعات، مجوهرات، حقائب وأكثر</p>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">الفئات</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/luxury/watches" className="text-gray-400 hover:text-amber-400">⌚ الساعات الفاخرة</Link></li>
                <li><Link href="/luxury/jewelry" className="text-gray-400 hover:text-amber-400">💎 المجوهرات</Link></li>
                <li><Link href="/luxury/handbags" className="text-gray-400 hover:text-amber-400">👜 الحقائب الفاخرة</Link></li>
                <li><Link href="/luxury/experts" className="text-gray-400 hover:text-amber-400">👨‍💼 خبراء التوثيق</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">حسابي</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/luxury/sell" className="text-gray-400 hover:text-amber-400">➕ بيع منتج فاخر</Link></li>
                <li><Link href="/luxury/my-listings" className="text-gray-400 hover:text-amber-400">📦 إعلاناتي</Link></li>
                <li><Link href="/luxury/my-bids" className="text-gray-400 hover:text-amber-400">🔨 مزايداتي</Link></li>
                <li><Link href="/luxury/notifications" className="text-gray-400 hover:text-amber-400">🔔 الإشعارات</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-bold mb-4">روابط سريعة</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/luxury" className="text-gray-400 hover:text-amber-400">🏠 الصفحة الرئيسية</Link></li>
                <li><Link href="/luxury/item/demo" className="text-gray-400 hover:text-amber-400">🔍 تفاصيل المنتج</Link></li>
                <li><Link href="/" className="text-gray-400 hover:text-amber-400">🔙 العودة للسوق الرئيسي</Link></li>
              </ul>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-gray-800">
            <p className="text-gray-500">
              © {new Date().getFullYear()} Xchange - السلع الفاخرة في مصر
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
