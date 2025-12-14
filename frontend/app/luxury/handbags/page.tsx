'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getItems, Item } from '@/lib/api/items';
import {
  LUXURY_BRANDS,
  formatLuxuryPrice,
  getPriceTier,
} from '@/lib/api/luxury-marketplace';

const HANDBAG_BRANDS = LUXURY_BRANDS.HANDBAGS;

const BAG_SIZES = [
  { id: 'mini', nameAr: 'ميني', icon: '👝' },
  { id: 'small', nameAr: 'صغير', icon: '👜' },
  { id: 'medium', nameAr: 'متوسط', icon: '👜' },
  { id: 'large', nameAr: 'كبير', icon: '🛍️' },
];

const POPULAR_MODELS = [
  { brand: 'Hermès', models: ['Birkin', 'Kelly', 'Constance', 'Evelyne'] },
  { brand: 'Chanel', models: ['Classic Flap', 'Boy Bag', '2.55', 'Gabrielle'] },
  { brand: 'Louis Vuitton', models: ['Neverfull', 'Speedy', 'Alma', 'Capucines'] },
  { brand: 'Dior', models: ['Lady Dior', 'Saddle', 'Book Tote', '30 Montaigne'] },
];

export default function LuxuryHandbagsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [priceRange, setPriceRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'price_high' | 'price_low' | 'recent'>('price_high');

  useEffect(() => {
    loadHandbags();
  }, [selectedBrand, selectedSize, priceRange, sortBy]);

  const loadHandbags = async () => {
    setLoading(true);
    try {
      let minPrice = 20000;
      let maxPrice: number | undefined;

      switch (priceRange) {
        case '20k-100k':
          minPrice = 20000;
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
        categoryId: 'luxury-bags',
        minPrice,
        maxPrice,
        status: 'ACTIVE',
        limit: 50,
      });

      let fetchedItems = response.data?.items || [];

      if (selectedBrand) {
        fetchedItems = fetchedItems.filter(
          (item) => item.title.toLowerCase().includes(selectedBrand.toLowerCase())
        );
      }

      if (sortBy === 'price_high') {
        fetchedItems.sort((a, b) => (b.estimatedValue || 0) - (a.estimatedValue || 0));
      } else if (sortBy === 'price_low') {
        fetchedItems.sort((a, b) => (a.estimatedValue || 0) - (b.estimatedValue || 0));
      }

      setItems(fetchedItems);
    } catch (error) {
      console.error('Failed to load handbags:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-900/30 via-gray-900 to-gray-950"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-72 h-72 bg-rose-500/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <Link href="/luxury" className="hover:text-white">السلع الفاخرة</Link>
            <span>/</span>
            <span className="text-rose-400">حقائب فاخرة</span>
          </nav>

          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="flex-1 text-center lg:text-right">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-rose-500/20 rounded-full mb-4">
                <span className="text-2xl">👜</span>
                <span className="text-rose-400 font-medium">مجموعة الحقائب الفاخرة</span>
              </div>
              <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
                حقائب فاخرة
                <span className="block text-rose-400 mt-2">من أشهر دور الأزياء</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl">
                اكتشف أرقى الحقائب من هيرميس، شانيل، لويس فيتون وأفضل الماركات العالمية
              </p>
            </div>

            {/* Featured Brands */}
            <div className="grid grid-cols-2 gap-3">
              {HANDBAG_BRANDS.slice(0, 6).map((brand) => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(selectedBrand === brand ? null : brand)}
                  className={`p-4 rounded-xl transition text-center ${
                    selectedBrand === brand
                      ? 'bg-rose-500 text-white'
                      : 'bg-gray-800/50 text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <span className="text-sm font-medium">{brand}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Popular Models */}
      <section className="bg-gray-900 py-8 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg font-bold text-white text-center mb-6">الموديلات الأكثر طلباً</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {POPULAR_MODELS.map((brandModels) => (
              <div key={brandModels.brand} className="bg-gray-800/50 rounded-xl p-4">
                <h3 className="text-rose-400 font-bold mb-3">{brandModels.brand}</h3>
                <div className="flex flex-wrap gap-2">
                  {brandModels.models.map((model) => (
                    <button
                      key={model}
                      onClick={() => setSelectedBrand(brandModels.brand)}
                      className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs hover:bg-rose-500/20 hover:text-rose-400 transition"
                    >
                      {model}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Filters Bar */}
      <section className="bg-gray-900/80 border-b border-gray-800 sticky top-0 z-40 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              {/* Size Filter */}
              <div className="flex gap-2">
                {BAG_SIZES.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedSize(selectedSize === size.id ? null : size.id)}
                    className={`px-3 py-2 rounded-lg text-sm transition flex items-center gap-1 ${
                      selectedSize === size.id
                        ? 'bg-rose-500 text-white'
                        : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                    }`}
                  >
                    <span>{size.icon}</span>
                    <span>{size.nameAr}</span>
                  </button>
                ))}
              </div>

              {/* Price Range */}
              <select
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700 focus:border-rose-500 focus:outline-none"
              >
                <option value="all">كل الأسعار</option>
                <option value="20k-100k">20 - 100 ألف</option>
                <option value="100k-500k">100 - 500 ألف</option>
                <option value="500k-1m">500 ألف - مليون</option>
                <option value="1m+">أكثر من مليون</option>
              </select>

              {(selectedBrand || selectedSize || priceRange !== 'all') && (
                <button
                  onClick={() => {
                    setSelectedBrand(null);
                    setSelectedSize(null);
                    setPriceRange('all');
                  }}
                  className="px-4 py-2 text-rose-400 hover:text-rose-300 transition"
                >
                  مسح الفلاتر
                </button>
              )}
            </div>

            <div className="flex items-center gap-3">
              <span className="text-gray-400 text-sm">{items.length} حقيبة</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="px-4 py-2 bg-gray-800 text-white rounded-lg border border-gray-700"
              >
                <option value="price_high">الأعلى سعراً</option>
                <option value="price_low">الأقل سعراً</option>
                <option value="recent">الأحدث</option>
              </select>
            </div>
          </div>
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
            <div className="text-8xl mb-6 opacity-20">👜</div>
            <h3 className="text-2xl font-bold text-white mb-3">لا توجد حقائب متاحة</h3>
            <p className="text-gray-400 mb-8">لم نجد حقائب تطابق معايير البحث</p>
            <button
              onClick={() => {
                setSelectedBrand(null);
                setSelectedSize(null);
                setPriceRange('all');
              }}
              className="px-6 py-3 bg-rose-500 text-white rounded-lg font-medium hover:bg-rose-400 transition"
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
                  className="group bg-gray-800/50 rounded-2xl overflow-hidden border border-gray-700/50 hover:border-rose-500/50 transition-all duration-300 hover:transform hover:-translate-y-1"
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
                        <span className="text-6xl opacity-30">👜</span>
                      </div>
                    )}

                    <div className="absolute top-3 right-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold bg-gradient-to-r ${tier.color} text-white`}>
                        {tier.labelAr}
                      </span>
                    </div>

                    <div className="absolute top-3 left-3">
                      <span className="px-2 py-1 bg-emerald-500/90 text-white text-xs rounded flex items-center gap-1">
                        <span>✓</span> موثق
                      </span>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent opacity-60"></div>
                  </div>

                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-rose-400 text-sm font-medium">
                        {item.title.split(' ')[0]}
                      </span>
                    </div>

                    <h3 className="text-white font-bold text-lg mb-3 line-clamp-2 group-hover:text-rose-400 transition">
                      {item.title}
                    </h3>

                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                      <span className="flex items-center gap-1">
                        <span>📍</span>
                        {item.governorate || 'مصر'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold bg-gradient-to-r from-rose-400 to-orange-400 bg-clip-text text-transparent">
                        {formatLuxuryPrice(item.estimatedValue || 0)}
                      </div>
                      <span className="text-gray-500 text-xs">قابل للتفاوض</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Authentication Info */}
      <section className="bg-gray-900/50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-8">
            كيف نضمن أصالة الحقائب؟
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '🔍', title: 'فحص دقيق', desc: 'فحص كل تفاصيل الحقيبة' },
              { icon: '📜', title: 'التحقق من الأوراق', desc: 'مراجعة شهادات الأصالة' },
              { icon: '🔬', title: 'تقنية Entrupy', desc: 'توثيق بالذكاء الاصطناعي' },
              { icon: '✅', title: 'شهادة ضمان', desc: 'شهادة توثيق رقمية' },
            ].map((step, i) => (
              <div key={i} className="text-center p-6 bg-gray-800/30 rounded-xl">
                <div className="w-14 h-14 bg-rose-500/20 rounded-xl flex items-center justify-center mx-auto mb-4 text-2xl">
                  {step.icon}
                </div>
                <h3 className="text-white font-bold mb-2">{step.title}</h3>
                <p className="text-gray-400 text-sm">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">هل لديك حقيبة فاخرة للبيع؟</h2>
          <p className="text-gray-400 mb-8">بع حقيبتك الفاخرة بأفضل سعر مع ضمان التوثيق</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/luxury/sell?category=HANDBAGS"
              className="px-8 py-4 bg-gradient-to-r from-rose-500 to-orange-500 text-white rounded-xl font-bold hover:from-rose-400 hover:to-orange-400 transition"
            >
              👜 أضف حقيبتك الآن
            </Link>
            <Link
              href="/luxury/experts"
              className="px-8 py-4 bg-gray-800 text-white rounded-xl font-medium hover:bg-gray-700 transition border border-gray-700"
            >
              تحدث مع خبير توثيق
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
