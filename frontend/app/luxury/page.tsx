'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getItems, Item } from '@/lib/api/items';
import { getCategories, Category } from '@/lib/api/categories';

// Luxury categories with premium branding
const LUXURY_CATEGORIES = [
  { id: 'watches', nameAr: 'ساعات فاخرة', icon: '⌚', gradient: 'from-amber-600 to-yellow-500' },
  { id: 'jewelry', nameAr: 'مجوهرات', icon: '💎', gradient: 'from-purple-600 to-pink-500' },
  { id: 'bags', nameAr: 'حقائب فاخرة', icon: '👜', gradient: 'from-rose-600 to-orange-500' },
  { id: 'cars', nameAr: 'سيارات فاخرة', icon: '🏎️', gradient: 'from-gray-700 to-gray-900' },
  { id: 'art', nameAr: 'فنون وتحف', icon: '🖼️', gradient: 'from-teal-600 to-emerald-500' },
  { id: 'real-estate', nameAr: 'عقارات مميزة', icon: '🏰', gradient: 'from-blue-600 to-indigo-500' },
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
      // Calculate min/max price based on range
      let minPrice = LUXURY_MIN_PRICE;
      let maxPrice: number | undefined;

      switch (priceRange) {
        case '50k-100k':
          minPrice = 50000;
          maxPrice = 100000;
          break;
        case '100k-500k':
          minPrice = 100000;
          maxPrice = 500000;
          break;
        case '500k-1m':
          minPrice = 500000;
          maxPrice = 1000000;
          break;
        case '1m+':
          minPrice = 1000000;
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

      // Sort items
      if (sortBy === 'price_high') {
        sortedItems = sortedItems.sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));
      } else if (sortBy === 'price_low') {
        sortedItems = sortedItems.sort((a, b) => (a.estimatedValue || 0) - (b.estimatedValue || 0));
      }

      setItems(sortedItems);
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

        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-6">
              <span className="text-2xl">👑</span>
              <span className="text-amber-400 font-medium">سوق السلع الفاخرة</span>
            </div>
            <h1 className="text-4xl lg:text-6xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 bg-clip-text text-transparent">
                Xchange Luxury
              </span>
            </h1>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-8">
              اكتشف أرقى المنتجات الفاخرة والمقتنيات النادرة في مصر
            </p>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 mb-12">
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
          </div>
        </div>
      </section>

      {/* Luxury Categories */}
      <section className="bg-gray-900 py-8 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
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
            ))}
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="bg-gray-900/50 py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Price Range */}
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

            {/* Sort */}
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
          <div className="text-center py-20">
            <div className="text-6xl mb-6">👑</div>
            <h3 className="text-2xl font-bold text-white mb-3">لا توجد منتجات فاخرة حالياً</h3>
            <p className="text-gray-400 mb-8">كن أول من يعرض منتجاته الفاخرة على المنصة</p>
            <Link
              href="/inventory/add"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition"
            >
              <span>أضف منتجك الفاخر</span>
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => {
              const tier = getPriceTier(item.estimatedValue || 0);

              return (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300"
                >
                  {/* Image */}
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

                    {/* Tier Badge */}
                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${tier.color} ${tier.textColor}`}>
                      {tier.label}
                    </div>

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    {/* Category */}
                    {item.category && (
                      <div className="text-amber-500 text-sm mb-2">{item.category.nameAr}</div>
                    )}

                    {/* Title */}
                    <h3 className="text-white font-bold text-lg mb-3 line-clamp-2 group-hover:text-amber-400 transition">
                      {item.title}
                    </h3>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                        {formatPrice(item.estimatedValue || 0)}
                      </div>

                      {/* Location */}
                      <div className="flex items-center gap-1 text-gray-500 text-sm">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        </svg>
                        {item.governorate || 'مصر'}
                      </div>
                    </div>

                    {/* Condition */}
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

      {/* Why Luxury Section */}
      <section className="bg-gradient-to-b from-gray-900 to-gray-950 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            لماذا <span className="text-amber-400">Xchange Luxury</span>؟
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                ✓
              </div>
              <h3 className="text-xl font-bold text-white mb-3">منتجات أصلية 100%</h3>
              <p className="text-gray-400">جميع المنتجات مضمونة الأصالة ومعتمدة من خبراء متخصصين</p>
            </div>

            <div className="text-center p-8 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                🔒
              </div>
              <h3 className="text-xl font-bold text-white mb-3">معاملات آمنة</h3>
              <p className="text-gray-400">نظام دفع آمن مع ضمان استرداد الأموال في حالة عدم المطابقة</p>
            </div>

            <div className="text-center p-8 bg-gray-800/30 rounded-2xl border border-gray-700/50">
              <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl">
                🎯
              </div>
              <h3 className="text-xl font-bold text-white mb-3">خدمة VIP</h3>
              <p className="text-gray-400">دعم مخصص على مدار الساعة لعملائنا المميزين</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">هل لديك منتج فاخر للبيع؟</h2>
          <p className="text-gray-400 mb-8">انضم إلى سوق السلع الفاخرة واستهدف العملاء المميزين</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/inventory/add"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition"
            >
              أضف منتجك الآن
            </Link>
            <Link
              href="/items"
              className="px-8 py-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition border border-gray-700"
            >
              تصفح جميع المنتجات
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Xchange Luxury - سوق السلع الفاخرة في مصر
          </p>
        </div>
      </footer>
    </div>
  );
}
