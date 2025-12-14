'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getItems, Item } from '@/lib/api/items';
import {
  LUXURY_BRANDS,
  WATCH_MOVEMENT_AR,
  formatLuxuryPrice,
  getConditionColor,
  getPriceTier,
  WatchMovementType,
} from '@/lib/api/luxury-marketplace';

// Popular watch brands for this page
const WATCH_BRANDS = LUXURY_BRANDS.WATCHES;

// Watch complications for filtering
const COMPLICATIONS = [
  { id: 'chronograph', nameAr: 'كرونوغراف', icon: '⏱️' },
  { id: 'date', nameAr: 'تاريخ', icon: '📅' },
  { id: 'moonphase', nameAr: 'طور القمر', icon: '🌙' },
  { id: 'gmt', nameAr: 'GMT', icon: '🌍' },
  { id: 'perpetual', nameAr: 'تقويم دائم', icon: '♾️' },
  { id: 'tourbillon', nameAr: 'توربيون', icon: '⚙️' },
];

export default function LuxuryWatchesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [movementType, setMovementType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'price_high' | 'price_low' | 'recent'>('price_high');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadWatches();
  }, [selectedBrand, priceRange, movementType, sortBy]);

  const loadWatches = async () => {
    setLoading(true);
    try {
      // Calculate price range
      let minPrice = 50000;
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
        case '1m-5m':
          minPrice = 1000000;
          maxPrice = 5000000;
          break;
        case '5m+':
          minPrice = 5000000;
          break;
      }

      const response = await getItems({
        categoryId: 'luxury-watches',
        minPrice,
        maxPrice,
        status: 'ACTIVE',
        limit: 50,
      });

      let fetchedItems = response.data?.items || [];

      // Filter by brand if selected
      if (selectedBrand) {
        fetchedItems = fetchedItems.filter(
          (item) => item.title.toLowerCase().includes(selectedBrand.toLowerCase())
        );
      }

      // Sort items
      if (sortBy === 'price_high') {
        fetchedItems.sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));
      } else if (sortBy === 'price_low') {
        fetchedItems.sort((a, b) => (a.estimatedValue || 0) - (b.estimatedValue || 0));
      }

      setItems(fetchedItems);
    } catch (error) {
      console.error('Failed to load watches:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/30 via-gray-900 to-gray-950"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-72 h-72 bg-amber-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-amber-600/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <Link href="/luxury" className="hover:text-white">السلع الفاخرة</Link>
            <span>/</span>
            <span className="text-amber-400">ساعات فاخرة</span>
          </nav>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/20 rounded-full mb-4">
                <span className="text-2xl">⌚</span>
                <span className="text-amber-400 font-medium">مجموعة الساعات الفاخرة</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                ساعات فاخرة
                <span className="block text-amber-400 mt-2">أصلية ومضمونة</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl">
                اكتشف أرقى الساعات السويسرية من رولكس، أوميغا، باتيك فيليب وأفضل الماركات العالمية
              </p>
            </div>

            {/* Featured Brands */}
            <div className="grid grid-cols-3 gap-3">
              {['Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'Cartier', 'TAG Heuer'].map(
                (brand) => (
                  <button
                    key={brand}
                    onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                    className={`p-4 rounded-xl transition text-center ${
                      selectedBrand === brand
                        ? 'bg-amber-500 text-gray-900'
                        : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span className="text-xs font-medium">{brand}</span>
                  </button>
                )
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="bg-gray-900/80 border-y border-gray-800 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            {/* Quick Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Price Range */}
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none"
              >
                <option value="all">كل الأسعار</option>
                <option value="50k-100k">50 - 100 ألف</option>
                <option value="100k-500k">100 - 500 ألف</option>
                <option value="500k-1m">500 ألف - مليون</option>
                <option value="1m-5m">1 - 5 مليون</option>
                <option value="5m+">أكثر من 5 مليون</option>
              </select>

              {/* Movement Type */}
              <select
                value={movementType || ''}
                onChange={(e) => setMovementType(e.target.value || null)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none"
              >
                <option value="">نوع الحركة</option>
                <option value="AUTOMATIC">أوتوماتيك</option>
                <option value="MANUAL">يدوي</option>
                <option value="QUARTZ">كوارتز</option>
              </select>

              {/* More Filters Button */}
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700 hover:bg-gray-700 transition flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                <span>فلاتر متقدمة</span>
              </button>

              {/* Clear Filters */}
              {(selectedBrand || priceRange !== 'all' || movementType) && (
                <button
                  onClick={() => {
                    setSelectedBrand(null);
                    setPriceRange('all');
                    setMovementType(null);
                  }}
                  className="px-4 py-2 text-amber-400 hover:text-amber-300 transition"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>

            {/* Sort & View */}
            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">{items.length} ساعة</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-amber-500 focus:outline-none"
              >
                <option value="price_high">الأعلى سعراً</option>
                <option value="price_low">الأقل سعراً</option>
                <option value="recent">الأحدث</option>
              </select>
            </div>
          </div>

          {/* Advanced Filters Panel */}
          {showFilters && (
            <div className="mt-4 p-4 bg-gray-800/50 rounded-xl grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {/* Brands */}
              <div className="col-span-2">
                <label className="text-gray-400 text-sm block mb-2">الماركة</label>
                <div className="flex flex-wrap gap-2">
                  {WATCH_BRANDS.slice(0, 8).map((brand) => (
                    <button
                      key={brand}
                      onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                      className={`px-3 py-1 rounded-full text-xs transition ${
                        selectedBrand === brand
                          ? 'bg-amber-500 text-gray-900'
                          : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </div>

              {/* Complications */}
              <div className="col-span-2">
                <label className="text-gray-400 text-sm block mb-2">المزايا</label>
                <div className="flex flex-wrap gap-2">
                  {COMPLICATIONS.map((comp) => (
                    <button
                      key={comp.id}
                      className="px-3 py-1 rounded-full text-xs bg-gray-700 text-gray-300 hover:bg-gray-600 transition flex items-center gap-1"
                    >
                      <span>{comp.icon}</span>
                      <span>{comp.nameAr}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Condition */}
              <div>
                <label className="text-gray-400 text-sm block mb-2">الحالة</label>
                <div className="flex flex-wrap gap-2">
                  {['A+', 'A', 'B+', 'B'].map((grade) => (
                    <button
                      key={grade}
                      className={`px-3 py-1 rounded text-xs ${getConditionColor(grade)}`}
                    >
                      {grade}
                    </button>
                  ))}
                </div>
              </div>

              {/* Box & Papers */}
              <div>
                <label className="text-gray-400 text-sm block mb-2">الملحقات</label>
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                    <span>مع العلبة الأصلية</span>
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-300">
                    <input type="checkbox" className="rounded bg-gray-700 border-gray-600" />
                    <span>مع الأوراق</span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Items Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-2xl overflow-hidden animate-pulse">
                <div className="h-64 bg-gray-700"></div>
                <div className="p-5">
                  <div className="h-4 bg-gray-700 rounded w-1/3 mb-3"></div>
                  <div className="h-6 bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-8 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-8xl mb-6 opacity-20">⌚</div>
            <h3 className="text-2xl font-bold text-white mb-3">لا توجد ساعات متاحة</h3>
            <p className="text-gray-400 mb-8">لم نجد ساعات تطابق معايير البحث الخاصة بك</p>
            <button
              onClick={() => {
                setSelectedBrand(null);
                setPriceRange('all');
                setMovementType(null);
              }}
              className="px-6 py-3 bg-amber-500 text-gray-900 rounded-lg font-medium hover:bg-amber-400 transition"
            >
              مسح الفلاتر
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {items.map((item) => {
              const tier = getPriceTier(item.estimatedValue || 0);

              return (
                <Link
                  key={item.id}
                  href={`/luxury/item/${item.id}`}
                  className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-amber-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
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
                        <span className="text-6xl opacity-30">⌚</span>
                      </div>
                    )}

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex flex-col gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${tier.color} text-white`}>
                        {tier.labelAr}
                      </span>
                    </div>

                    {/* Verified Badge */}
                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-emerald-500/90 text-white text-xs rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span>موثق</span>
                      </span>
                    </div>

                    {/* Quick Actions */}
                    <div className="absolute bottom-3 left-3 right-3 flex justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          // Add to favorites
                        }}
                        className="p-2 bg-white/90 rounded-full hover:bg-white transition"
                      >
                        <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </button>
                    </div>

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    {/* Brand */}
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-amber-500 text-sm font-medium">
                        {item.title.split(' ')[0]}
                      </span>
                      {item.condition === 'NEW' && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded">
                          جديد
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 className="text-white font-bold text-lg mb-3 line-clamp-2 group-hover:text-amber-400 transition">
                      {item.title}
                    </h3>

                    {/* Details */}
                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <span>📍</span>
                        {item.governorate || 'مصر'}
                      </span>
                      {item.condition && (
                        <span className={`px-2 py-0.5 rounded text-xs ${getConditionColor('A')}`}>
                          A+
                        </span>
                      )}
                    </div>

                    {/* Price */}
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xl font-bold bg-gradient-to-r from-amber-400 to-yellow-400 bg-clip-text text-transparent">
                          {formatLuxuryPrice(item.estimatedValue || 0)}
                        </div>
                      </div>
                      <span className="text-gray-500 text-xs">
                        قابل للتفاوض
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Why Buy Section */}
      <section className="bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            لماذا تشتري ساعتك من <span className="text-amber-400">Xchange Luxury</span>؟
          </h2>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '✓', title: 'أصالة مضمونة', desc: 'جميع الساعات موثقة من خبراء متخصصين' },
              { icon: '🔒', title: 'دفع آمن', desc: 'نظام الضمان يحمي أموالك حتى الاستلام' },
              { icon: '📜', title: 'شهادة توثيق', desc: 'شهادة رقمية لكل ساعة' },
              { icon: '🔄', title: 'ضمان الإرجاع', desc: '14 يوم لإرجاع الساعة' },
            ].map((feature, i) => (
              <div
                key={i}
                className="text-center p-6 bg-gray-800/30 rounded-xl border border-gray-700/50"
              >
                <div className="w-14 h-14 bg-amber-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
                  {feature.icon}
                </div>
                <h3 className="text-white font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-400 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">هل لديك ساعة فاخرة للبيع؟</h2>
          <p className="text-gray-400 mb-8">
            بع ساعتك بأفضل سعر مع ضمان التوثيق والوصول لآلاف المشترين المميزين
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/luxury/sell?category=WATCHES"
              className="px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold hover:from-amber-400 hover:to-yellow-400 transition"
            >
              أضف ساعتك الآن
            </Link>
            <Link
              href="/luxury/experts"
              className="px-8 py-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition border border-gray-700"
            >
              تحدث مع خبير
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
