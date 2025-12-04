'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getLatestItems, PublicItem } from '@/lib/api/inventory';
import { getItems, getFeaturedItems, Item } from '@/lib/api/items';
import { getCategories, Category } from '@/lib/api/categories';

// ============================================
// الفئات الافتراضية - Default Categories (fallback)
// ============================================
const DEFAULT_CATEGORIES = [
  { id: 'electronics', slug: 'electronics', nameAr: 'إلكترونيات', icon: '📱', color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600' },
  { id: 'vehicles', slug: 'vehicles', nameAr: 'سيارات ومركبات', icon: '🚗', color: 'bg-red-500', gradient: 'from-red-500 to-red-600' },
  { id: 'real-estate', slug: 'real-estate', nameAr: 'عقارات', icon: '🏠', color: 'bg-green-500', gradient: 'from-green-500 to-green-600' },
  { id: 'furniture', slug: 'furniture', nameAr: 'أثاث ومفروشات', icon: '🛋️', color: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600' },
  { id: 'fashion', slug: 'fashion', nameAr: 'أزياء وملابس', icon: '👗', color: 'bg-pink-500', gradient: 'from-pink-500 to-pink-600' },
  { id: 'services', slug: 'services', nameAr: 'خدمات', icon: '💼', color: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600' },
  { id: 'sports-hobbies', slug: 'sports-hobbies', nameAr: 'رياضة وهوايات', icon: '⚽', color: 'bg-teal-500', gradient: 'from-teal-500 to-teal-600' },
  { id: 'home-appliances', slug: 'home-appliances', nameAr: 'أجهزة منزلية', icon: '🏡', color: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600' },
];

// Map category slugs to icons and colors
const CATEGORY_STYLES: Record<string, { icon: string; color: string; gradient: string }> = {
  'electronics': { icon: '📱', color: 'bg-blue-500', gradient: 'from-blue-500 to-blue-600' },
  'vehicles': { icon: '🚗', color: 'bg-red-500', gradient: 'from-red-500 to-red-600' },
  'real-estate': { icon: '🏠', color: 'bg-green-500', gradient: 'from-green-500 to-green-600' },
  'furniture': { icon: '🛋️', color: 'bg-amber-500', gradient: 'from-amber-500 to-amber-600' },
  'fashion': { icon: '👗', color: 'bg-pink-500', gradient: 'from-pink-500 to-pink-600' },
  'services': { icon: '💼', color: 'bg-purple-500', gradient: 'from-purple-500 to-purple-600' },
  'sports-hobbies': { icon: '⚽', color: 'bg-teal-500', gradient: 'from-teal-500 to-teal-600' },
  'home-appliances': { icon: '🏡', color: 'bg-orange-500', gradient: 'from-orange-500 to-orange-600' },
  'raw-materials': { icon: '🧱', color: 'bg-gray-500', gradient: 'from-gray-500 to-gray-600' },
  'books-media': { icon: '📚', color: 'bg-indigo-500', gradient: 'from-indigo-500 to-indigo-600' },
};

// Transform API category to display format
interface DisplayCategory {
  id: string;
  slug: string;
  nameAr: string;
  icon: string;
  color: string;
  gradient: string;
}

const transformCategory = (cat: Category): DisplayCategory => {
  const style = CATEGORY_STYLES[cat.slug] || { icon: '📦', color: 'bg-gray-500', gradient: 'from-gray-500 to-gray-600' };
  return {
    id: cat.id,
    slug: cat.slug,
    nameAr: cat.nameAr,
    ...style,
  };
};

// ============================================
// مكون البحث - Search Component
// ============================================
function SearchBar() {
  const [query, setQuery] = useState('');
  const [governorate, setGovernorate] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('search', query);
    if (governorate) params.set('governorate', governorate);
    window.location.href = `/items${params.toString() ? '?' + params.toString() : ''}`;
  };

  return (
    <form onSubmit={handleSearch} className="w-full max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row gap-2 bg-white rounded-2xl shadow-xl p-2 border border-gray-100">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="ابحث عن أي شيء... سيارة، موبايل، شقة..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full px-5 py-3 rounded-xl outline-none text-gray-700 bg-gray-50 focus:bg-white transition-colors"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={governorate}
            onChange={(e) => setGovernorate(e.target.value)}
            className="px-4 py-3 rounded-xl outline-none text-gray-700 bg-gray-50 border-0 min-w-[140px]"
          >
            <option value="">كل مصر</option>
            <option value="cairo">القاهرة</option>
            <option value="giza">الجيزة</option>
            <option value="alexandria">الإسكندرية</option>
            <option value="qalyubia">القليوبية</option>
            <option value="sharqia">الشرقية</option>
            <option value="dakahlia">الدقهلية</option>
            <option value="gharbia">الغربية</option>
            <option value="menoufia">المنوفية</option>
            <option value="beheira">البحيرة</option>
            <option value="kafr-el-sheikh">كفر الشيخ</option>
            <option value="damietta">دمياط</option>
            <option value="port-said">بورسعيد</option>
            <option value="ismailia">الإسماعيلية</option>
            <option value="suez">السويس</option>
            <option value="red-sea">البحر الأحمر</option>
            <option value="south-sinai">جنوب سيناء</option>
            <option value="north-sinai">شمال سيناء</option>
            <option value="fayoum">الفيوم</option>
            <option value="beni-suef">بني سويف</option>
            <option value="minya">المنيا</option>
            <option value="assiut">أسيوط</option>
            <option value="sohag">سوهاج</option>
            <option value="qena">قنا</option>
            <option value="luxor">الأقصر</option>
            <option value="aswan">أسوان</option>
            <option value="matrouh">مطروح</option>
            <option value="new-valley">الوادي الجديد</option>
          </select>
          <button
            type="submit"
            className="px-8 py-3 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white font-bold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="hidden md:inline">بحث</span>
          </button>
        </div>
      </div>
    </form>
  );
}

// ============================================
// مكون بطاقة الصنف المصغرة - Small Item Card
// ============================================
function SmallItemCard({ item, type }: { item: PublicItem; type: 'supply' | 'demand' }) {
  const isSupply = type === 'supply';

  const formatPrice = (price: number) => {
    if (price >= 1000000) {
      return `${(price / 1000000).toFixed(1)} مليون ج.م`;
    } else if (price >= 1000) {
      return `${(price / 1000).toFixed(0)} ألف ج.م`;
    }
    return `${price.toLocaleString('ar-EG')} ج.م`;
  };

  return (
    <Link href={`/items/${item.id}`} className="group block">
      <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border border-gray-100">
        <div className="relative h-36 bg-gray-100">
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <span className="text-4xl opacity-30">{isSupply ? '📦' : '🔍'}</span>
            </div>
          )}
        </div>
        <div className="p-3">
          <div className="text-emerald-600 font-bold text-sm mb-1">{formatPrice(item.estimatedValue)}</div>
          <h3 className="text-gray-800 text-sm line-clamp-2 leading-snug">{item.title}</h3>
          <div className="text-xs text-gray-400 mt-2 flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            {item.location || item.user?.governorate || 'مصر'}
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================
// قسم الفئة - Category Section
// ============================================
function CategorySection({
  category,
  items,
  type
}: {
  category: DisplayCategory;
  items: PublicItem[];
  type: 'supply' | 'demand'
}) {
  if (items.length === 0) return null;

  const title = type === 'supply'
    ? `${category.nameAr} للبيع`
    : `مطلوب ${category.nameAr}`;

  return (
    <section className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${category.gradient} flex items-center justify-center text-xl shadow-lg`}>
            {category.icon}
          </div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        </div>
        <Link
          href={`/items?category=${category.slug}`}
          className="text-emerald-600 text-sm font-medium hover:text-emerald-700 flex items-center gap-1"
        >
          عرض الكل
          <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {items.slice(0, 6).map((item) => (
          <SmallItemCard key={item.id} item={item} type={type} />
        ))}
      </div>
    </section>
  );
}

// ============================================
// صفحة الهبوط للزوار - Public Landing Page
// ============================================
function PublicLandingPage({ supplyItems, demandItems, featuredItems, loading, categories }: {
  supplyItems: PublicItem[];
  demandItems: PublicItem[];
  featuredItems: Item[];
  loading: boolean;
  categories: DisplayCategory[];
}) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <section className="bg-gradient-to-bl from-emerald-600 via-emerald-500 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12 lg:py-16">
          <div className="text-center mb-8">
            <h1 className="text-3xl lg:text-5xl font-bold mb-3">
              بيع واشتري في مصر
            </h1>
            <p className="text-emerald-100 text-lg">
              أكبر منصة للإعلانات المبوبة في مصر - مجاناً 100%
            </p>
          </div>
          <SearchBar />
        </div>
      </section>

      {/* Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-gray-800 mb-6">تصفح حسب الفئة</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/items?category=${cat.slug}`}
              className="flex flex-col items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group border border-gray-100"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform shadow-md`}>
                {cat.icon}
              </div>
              <span className="text-xs font-medium text-gray-600 text-center leading-tight">{cat.nameAr}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Quick Action Buttons */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex flex-wrap justify-center gap-3">
          <Link
            href="/inventory/add?side=SUPPLY"
            className="flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors shadow-lg"
          >
            <span>📦</span> أضف إعلان للبيع
          </Link>
          <Link
            href="/inventory/add?side=DEMAND"
            className="flex items-center gap-2 px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors shadow-lg"
          >
            <span>🔍</span> أضف طلب شراء
          </Link>
          <Link
            href="/inventory/add?listingType=BARTER"
            className="flex items-center gap-2 px-6 py-3 bg-purple-500 text-white rounded-xl font-medium hover:bg-purple-600 transition-colors shadow-lg"
          >
            <span>🔄</span> مقايضة
          </Link>
        </div>
      </section>

      {/* Featured Items - إعلانات مميزة */}
      {featuredItems.length > 0 && (
        <section className="bg-gradient-to-l from-amber-50 to-yellow-50 py-10">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-yellow-400 rounded-xl flex items-center justify-center text-2xl shadow-lg">
                  ⭐
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">إعلانات مميزة</h2>
                  <p className="text-amber-700 text-sm">إعلانات مروّجة من البائعين</p>
                </div>
              </div>
              <Link href="/promote" className="text-amber-600 text-sm font-medium hover:text-amber-700 flex items-center gap-1">
                روّج إعلانك
                <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredItems.map((item) => (
                <Link key={item.id} href={`/items/${item.id}`} className="group block">
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-200 overflow-hidden border-2 border-amber-200 relative">
                    {/* Featured Badge */}
                    <div className="absolute top-2 right-2 z-10">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        item.promotionTier === 'GOLD' ? 'bg-amber-500 text-white' :
                        item.promotionTier === 'PREMIUM' ? 'bg-gray-400 text-white' :
                        'bg-orange-500 text-white'
                      }`}>
                        {item.promotionTier === 'GOLD' ? '👑 ذهبي' :
                         item.promotionTier === 'PREMIUM' ? '⭐ فضي' :
                         '🌟 مميز'}
                      </span>
                    </div>
                    <div className="relative h-36 bg-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-yellow-100">
                          <span className="text-4xl opacity-30">⭐</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-amber-600 font-bold text-sm mb-1">
                        {(item.estimatedValue || 0).toLocaleString('ar-EG')} ج.م
                      </div>
                      <h3 className="text-gray-800 text-sm line-clamp-2 leading-snug">{item.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Items by Category - Supply */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🏷️</span>
            <h2 className="text-2xl font-bold text-gray-800">إعلانات للبيع</h2>
          </div>
          <Link href="/items" className="text-emerald-600 text-sm font-medium hover:text-emerald-700 flex items-center gap-1">
            عرض الكل
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100">
                <div className="h-36 bg-gray-200"></div>
                <div className="p-3">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : supplyItems.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {supplyItems.slice(0, 12).map((item) => (
              <SmallItemCard key={item.id} item={item} type="supply" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <span className="text-5xl mb-4 block">📦</span>
            <p className="text-gray-500 mb-4">لا توجد إعلانات حالياً</p>
            <Link href="/inventory/add" className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors inline-block">
              أضف أول إعلان
            </Link>
          </div>
        )}
      </section>

      {/* Items by Category - Demand */}
      <section className="bg-blue-50 py-10">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔍</span>
              <h2 className="text-2xl font-bold text-gray-800">طلبات الشراء</h2>
            </div>
            <Link href="/barter/open-offers" className="text-blue-600 text-sm font-medium hover:text-blue-700 flex items-center gap-1">
              عرض الكل
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {demandItems.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {demandItems.slice(0, 12).map((item) => (
                <SmallItemCard key={item.id} item={item} type="demand" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <span className="text-5xl mb-4 block">🔍</span>
              <p className="text-gray-500 mb-4">لا توجد طلبات حالياً</p>
              <Link href="/inventory/add?side=DEMAND" className="px-6 py-3 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors inline-block">
                أضف طلب شراء
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Smart Features Showcase */}
      <section className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-sm font-medium mb-4">
              مميزات حصرية
            </span>
            <h2 className="text-3xl font-bold mb-4">تجربة ذكية ومتطورة</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              نستخدم أحدث التقنيات لنوفر لك تجربة تسوق وبيع فريدة من نوعها
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Link href="/assistant" className="group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-purple-500/50 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  🤖
                </div>
                <h3 className="text-lg font-bold mb-2">المساعد الذكي</h3>
                <p className="text-gray-400 text-sm">
                  تحدث مع مساعدنا الذكي للحصول على اقتراحات مخصصة وإجابات فورية
                </p>
              </div>
            </Link>

            <Link href="/sell-ai" className="group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-amber-500/50 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  ✨
                </div>
                <h3 className="text-lg font-bold mb-2">بيع بالـ AI</h3>
                <p className="text-gray-400 text-sm">
                  صور منتجك فقط والذكاء الاصطناعي يملأ كل البيانات تلقائياً
                </p>
              </div>
            </Link>

            <Link href="/wallet" className="group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-emerald-500/50 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  💳
                </div>
                <h3 className="text-lg font-bold mb-2">محفظة XCoin</h3>
                <p className="text-gray-400 text-sm">
                  اربح نقاط على كل معاملة واستبدلها بمميزات حصرية
                </p>
              </div>
            </Link>

            <Link href="/exchange-points" className="group">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:border-blue-500/50 transition-all hover:-translate-y-2">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform">
                  📍
                </div>
                <h3 className="text-lg font-bold mb-2">نقاط التبادل الآمنة</h3>
                <p className="text-gray-400 text-sm">
                  أماكن موثوقة ومراقبة للقاء وإتمام الصفقات بأمان
                </p>
              </div>
            </Link>
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all transform hover:scale-105"
            >
              ابدأ الآن مجاناً
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-10 text-center">كيف تستخدم المنصة؟</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 card-hover">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              📝
            </div>
            <h3 className="font-bold mb-2 text-gray-800">1. سجّل مجاناً</h3>
            <p className="text-gray-500 text-sm">أنشئ حسابك في ثوانٍ</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 card-hover">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              📸
            </div>
            <h3 className="font-bold mb-2 text-gray-800">2. أضف إعلانك</h3>
            <p className="text-gray-500 text-sm">صور ووصف المنتج</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 card-hover">
            <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🎯
            </div>
            <h3 className="font-bold mb-2 text-gray-800">3. نجد لك مشترين</h3>
            <p className="text-gray-500 text-sm">مطابقة ذكية تلقائية</p>
          </div>
          <div className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100 card-hover">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
              🤝
            </div>
            <h3 className="font-bold mb-2 text-gray-800">4. أتمم الصفقة</h3>
            <p className="text-gray-500 text-sm">تواصل وبيع بأمان</p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white py-12">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-2xl font-bold mb-3">ابدأ البيع الآن!</h2>
          <p className="text-emerald-100 mb-6">أضف إعلانك الأول مجاناً وابدأ في البيع</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/register" className="px-8 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-gray-100 transition-colors">
              إنشاء حساب مجاني
            </Link>
            <Link href="/items" className="px-8 py-3 bg-emerald-700 text-white rounded-xl font-medium hover:bg-emerald-800 transition-colors border border-emerald-400">
              تصفح الإعلانات
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🔄</span>
                <h3 className="text-white text-xl font-bold">Xchange</h3>
              </div>
              <p className="text-sm mb-4">منصة مصرية للإعلانات المبوبة والمقايضة الذكية</p>
              <div className="flex gap-3">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  📘
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  📷
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-gray-700 transition-colors">
                  🐦
                </a>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">الفئات</h4>
              <ul className="space-y-3 text-sm">
                {DEFAULT_CATEGORIES.slice(0, 5).map(cat => (
                  <li key={cat.id}>
                    <Link href={`/items?category=${cat.slug}`} className="hover:text-emerald-400 transition-colors flex items-center gap-2">
                      <span>{cat.icon}</span>
                      {cat.nameAr}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">خدماتنا</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/items" className="hover:text-emerald-400 transition-colors">تصفح الإعلانات</Link></li>
                <li><Link href="/luxury" className="hover:text-emerald-400 transition-colors">سوق الفاخرة 👑</Link></li>
                <li><Link href="/escrow" className="hover:text-emerald-400 transition-colors">نظام الضمان 🔒</Link></li>
                <li><Link href="/auctions" className="hover:text-emerald-400 transition-colors">المزادات 🔨</Link></li>
                <li><Link href="/barter" className="hover:text-emerald-400 transition-colors">المقايضة 🔄</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">مميزات ذكية</h4>
              <ul className="space-y-3 text-sm">
                <li><Link href="/assistant" className="hover:text-emerald-400 transition-colors">المساعد الذكي 🤖</Link></li>
                <li><Link href="/sell-ai" className="hover:text-emerald-400 transition-colors">بيع بالـ AI ✨</Link></li>
                <li><Link href="/wallet" className="hover:text-emerald-400 transition-colors">محفظة XCoin 💳</Link></li>
                <li><Link href="/exchange-points" className="hover:text-emerald-400 transition-colors">نقاط التبادل 📍</Link></li>
                <li><Link href="/saved-searches" className="hover:text-emerald-400 transition-colors">تنبيهات البحث 🔔</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-3 text-sm">
                <li className="flex items-center gap-2">
                  <span>📧</span>
                  support@xchange.eg
                </li>
                <li className="flex items-center gap-2">
                  <span>📱</span>
                  +20 123 456 7890
                </li>
                <li className="flex items-center gap-2">
                  <span>📍</span>
                  القاهرة، مصر
                </li>
              </ul>
              <div className="mt-4">
                <Link href="/exchange-points" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm">
                  عرض نقاط التبادل
                  <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm">© {new Date().getFullYear()} Xchange Egypt. جميع الحقوق محفوظة.</p>
            <div className="flex gap-6 text-sm">
              <Link href="#" className="hover:text-white transition-colors">سياسة الخصوصية</Link>
              <Link href="#" className="hover:text-white transition-colors">شروط الاستخدام</Link>
              <Link href="#" className="hover:text-white transition-colors">الدعم</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// لوحة التحكم للمستخدمين - User Dashboard
// ============================================
function UserDashboard({ user, supplyItems, demandItems, featuredItems, loading }: {
  user: any;
  supplyItems: PublicItem[];
  demandItems: PublicItem[];
  featuredItems: Item[];
  loading: boolean;
}) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center text-2xl">
                {user.fullName?.charAt(0) || '👤'}
              </div>
              <div>
                <h1 className="text-xl font-bold">مرحباً، {user.fullName}!</h1>
                <p className="text-emerald-100 text-sm">ماذا تريد أن تفعل اليوم؟</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/inventory/add" className="px-5 py-2 bg-white text-emerald-600 rounded-xl font-bold hover:bg-gray-100 transition-colors text-sm">
                ➕ إعلان جديد
              </Link>
              <Link href="/notifications" className="px-5 py-2 bg-emerald-700 text-white rounded-xl font-medium hover:bg-emerald-800 transition-colors text-sm">
                🔔 الإشعارات
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/inventory" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-xl">📦</div>
              <div>
                <div className="text-xl font-bold text-gray-800">0</div>
                <div className="text-xs text-gray-500">إعلاناتي</div>
              </div>
            </div>
          </Link>
          <Link href="/notifications" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-xl">🎯</div>
              <div>
                <div className="text-xl font-bold text-blue-600">0</div>
                <div className="text-xs text-gray-500">مطابقات</div>
              </div>
            </div>
          </Link>
          <Link href="/messages" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center text-xl">💬</div>
              <div>
                <div className="text-xl font-bold text-purple-600">0</div>
                <div className="text-xs text-gray-500">رسائل</div>
              </div>
            </div>
          </Link>
          <Link href="/barter/my-offers" className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">🔄</div>
              <div>
                <div className="text-xl font-bold text-amber-600">0</div>
                <div className="text-xs text-gray-500">مقايضات</div>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* Smart Features Quick Access */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="bg-gradient-to-l from-gray-900 to-gray-800 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-white">مميزات ذكية</h2>
            <span className="text-xs text-emerald-400 bg-emerald-500/20 px-3 py-1 rounded-full">جديد</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link href="/sell-ai" className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all group text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-500 rounded-xl flex items-center justify-center text-xl mx-auto mb-2 group-hover:scale-110 transition-transform">
                ✨
              </div>
              <span className="font-medium text-white text-sm">بيع بالـ AI</span>
            </Link>
            <Link href="/wallet" className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all group text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center text-xl mx-auto mb-2 group-hover:scale-110 transition-transform">
                💳
              </div>
              <span className="font-medium text-white text-sm">محفظتي</span>
            </Link>
            <Link href="/exchange-points" className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all group text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center text-xl mx-auto mb-2 group-hover:scale-110 transition-transform">
                📍
              </div>
              <span className="font-medium text-white text-sm">نقاط التبادل</span>
            </Link>
            <Link href="/saved-searches" className="bg-white/10 backdrop-blur rounded-xl p-4 hover:bg-white/20 transition-all group text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-xl mx-auto mb-2 group-hover:scale-110 transition-transform">
                🔔
              </div>
              <span className="font-medium text-white text-sm">تنبيهاتي</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/inventory" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-md transition-all text-center card-hover">
            <div className="text-3xl mb-2">📦</div>
            <span className="font-medium text-gray-700 text-sm">مخزوني</span>
          </Link>
          <Link href="/inventory/add?side=SUPPLY" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-md transition-all text-center card-hover">
            <div className="text-3xl mb-2">🏷️</div>
            <span className="font-medium text-gray-700 text-sm">عرض للبيع</span>
          </Link>
          <Link href="/inventory/add?side=DEMAND" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-md transition-all text-center card-hover">
            <div className="text-3xl mb-2">🔍</div>
            <span className="font-medium text-gray-700 text-sm">طلب شراء</span>
          </Link>
          <Link href="/messages" className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:border-purple-300 hover:shadow-md transition-all text-center card-hover">
            <div className="text-3xl mb-2">💬</div>
            <span className="font-medium text-gray-700 text-sm">الرسائل</span>
          </Link>
        </div>
      </section>

      {/* Browse Categories */}
      <section className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">تصفح حسب الفئة</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
            {DEFAULT_CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/items?category=${cat.slug}`}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-all group"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${cat.gradient} flex items-center justify-center text-lg mb-1 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <span className="text-xs text-gray-600 text-center">{cat.nameAr.split(' ')[0]}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Items - إعلانات مميزة */}
      {featuredItems.length > 0 && (
        <section className="bg-gradient-to-l from-amber-50 to-yellow-50 py-6">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-2xl">⭐</span>
                <h2 className="text-lg font-bold text-gray-800">إعلانات مميزة</h2>
              </div>
              <Link href="/promote" className="text-amber-600 text-sm font-medium">روّج إعلانك ←</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {featuredItems.slice(0, 6).map((item) => (
                <Link key={item.id} href={`/items/${item.id}`} className="group block">
                  <div className="bg-white rounded-xl shadow-sm hover:shadow-lg transition-all duration-200 overflow-hidden border-2 border-amber-200 relative">
                    <div className="absolute top-2 right-2 z-10">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        item.promotionTier === 'GOLD' ? 'bg-amber-500 text-white' :
                        item.promotionTier === 'PREMIUM' ? 'bg-gray-400 text-white' :
                        'bg-orange-500 text-white'
                      }`}>
                        {item.promotionTier === 'GOLD' ? '👑' : item.promotionTier === 'PREMIUM' ? '⭐' : '🌟'}
                      </span>
                    </div>
                    <div className="h-32 bg-gray-100">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0].url}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-yellow-100">
                          <span className="text-3xl opacity-30">⭐</span>
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-amber-600 font-bold text-sm mb-1">
                        {(item.estimatedValue || 0).toLocaleString('ar-EG')} ج.م
                      </div>
                      <h3 className="text-gray-800 text-sm line-clamp-1">{item.title}</h3>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Latest in Market */}
      <section className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-800">أحدث الإعلانات</h2>
          <Link href="/items" className="text-emerald-600 text-sm font-medium">عرض الكل ←</Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl overflow-hidden animate-pulse border border-gray-100">
                <div className="h-36 bg-gray-200"></div>
                <div className="p-3"><div className="h-4 bg-gray-200 rounded w-20"></div></div>
              </div>
            ))}
          </div>
        ) : supplyItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {supplyItems.slice(0, 6).map((item) => (
              <SmallItemCard key={item.id} item={item} type="supply" />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
            <span className="text-4xl mb-3 block">📦</span>
            <p className="text-gray-500 text-sm">لا توجد إعلانات</p>
          </div>
        )}
      </section>
    </div>
  );
}

// ============================================
// Main Component
// ============================================
export default function Home() {
  const { user, loading: authLoading } = useAuth();
  const [supplyItems, setSupplyItems] = useState<PublicItem[]>([]);
  const [demandItems, setDemandItems] = useState<PublicItem[]>([]);
  const [featuredItems, setFeaturedItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<DisplayCategory[]>(DEFAULT_CATEGORIES);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories first
        const categoriesResponse = await getCategories().catch(() => ({ success: false, data: [] }));

        // Transform categories from API
        if (categoriesResponse.success && categoriesResponse.data.length > 0) {
          const parentCategories = categoriesResponse.data
            .filter((cat: Category) => !cat.parentId)
            .map(transformCategory);
          setCategories(parentCategories.length > 0 ? parentCategories : DEFAULT_CATEGORIES);
        }

        // Fetch featured items
        try {
          const featuredResponse = await getFeaturedItems({ limit: 6 });
          if (featuredResponse.success && featuredResponse.data?.items) {
            setFeaturedItems(featuredResponse.data.items);
          }
        } catch (featuredError) {
          console.log('Failed to fetch featured items:', featuredError);
        }

        // Try inventory API first
        try {
          const itemsResponse = await getLatestItems({ limit: 24 });
          console.log('Inventory API response:', itemsResponse);
          if (itemsResponse.success && (itemsResponse.data.supply.length > 0 || itemsResponse.data.demand.length > 0)) {
            setSupplyItems(itemsResponse.data.supply);
            setDemandItems(itemsResponse.data.demand);
            console.log('Loaded from inventory API - Supply:', itemsResponse.data.supply.length, 'Demand:', itemsResponse.data.demand.length);
            return;
          }
          console.log('Inventory API returned empty, trying items API...');
        } catch (inventoryError) {
          console.log('Inventory API failed:', inventoryError, '- trying items API...');
        }

        // Fallback: Try items API without status filter
        try {
          const itemsResult = await getItems({ limit: 24 });
          console.log('Items API response:', itemsResult);
          if (itemsResult.success && itemsResult.data?.items && itemsResult.data.items.length > 0) {
            // Transform items to PublicItem format
            const transformedItems: PublicItem[] = itemsResult.data.items.map((item: any) => ({
              id: item.id,
              side: 'SUPPLY' as const,
              title: item.title,
              description: item.description,
              estimatedValue: item.estimatedValue || 0,
              images: item.images?.map((img: any) => typeof img === 'string' ? img : img.url) || [],
              category: item.category,
              governorate: item.governorate,
              location: item.location,
              user: {
                id: item.seller?.id || '',
                name: item.seller?.fullName || '',
                avatar: item.seller?.avatar,
                governorate: item.seller?.governorate,
              },
              createdAt: item.createdAt,
            }));
            console.log('Transformed items:', transformedItems.length);
            setSupplyItems(transformedItems);
          } else {
            console.log('No items returned from API');
          }
        } catch (itemsError) {
          console.error('Items API also failed:', itemsError);
        }
      } catch (err: any) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-500 text-sm">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <UserDashboard user={user} supplyItems={supplyItems} demandItems={demandItems} featuredItems={featuredItems} loading={loading} />;
  }

  return <PublicLandingPage supplyItems={supplyItems} demandItems={demandItems} featuredItems={featuredItems} loading={loading} categories={categories} />;
}
