'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getLatestItems, PublicItem, MarketType, MARKET_CONFIG } from '@/lib/api/inventory';

// ============================================
// الفئات الرئيسية - Main Categories
// ============================================
const CATEGORIES = [
  { id: 'electronics', nameAr: 'إلكترونيات', icon: '📱', color: 'bg-blue-500' },
  { id: 'vehicles', nameAr: 'سيارات ومركبات', icon: '🚗', color: 'bg-red-500' },
  { id: 'properties', nameAr: 'عقارات', icon: '🏠', color: 'bg-green-500' },
  { id: 'furniture', nameAr: 'أثاث ومفروشات', icon: '🛋️', color: 'bg-amber-500' },
  { id: 'fashion', nameAr: 'أزياء وملابس', icon: '👗', color: 'bg-pink-500' },
  { id: 'jobs', nameAr: 'خدمات ووظائف', icon: '💼', color: 'bg-purple-500' },
  { id: 'sports', nameAr: 'رياضة وهوايات', icon: '⚽', color: 'bg-teal-500' },
  { id: 'kids', nameAr: 'أطفال ورضع', icon: '🧸', color: 'bg-orange-500' },
];

// ============================================
// مكون البحث - Search Component
// ============================================
function SearchBar() {
  const [query, setQuery] = useState('');

  return (
    <div className="relative max-w-2xl mx-auto">
      <div className="flex items-center bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-gray-100">
        <input
          type="text"
          placeholder="ابحث عن أي شيء تريده..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 px-6 py-4 text-lg outline-none text-right"
          dir="rtl"
        />
        <button className="px-8 py-4 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white font-bold hover:from-emerald-600 hover:to-emerald-700 transition-all">
          <span className="flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            بحث
          </span>
        </button>
      </div>
    </div>
  );
}

// ============================================
// مكون بطاقة الصنف - Item Card Component
// ============================================
function ItemCard({ item, type }: { item: PublicItem; type: 'supply' | 'demand' }) {
  const isSupply = type === 'supply';

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-EG');
  };

  return (
    <Link href={`/items/${item.id}`} className="group block">
      <div className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 group-hover:border-emerald-200">
        {/* Image */}
        <div className="relative h-52 bg-gray-100 overflow-hidden">
          {item.images && item.images.length > 0 ? (
            <img
              src={item.images[0]}
              alt={item.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${isSupply ? 'bg-gradient-to-br from-emerald-50 to-emerald-100' : 'bg-gradient-to-br from-blue-50 to-blue-100'}`}>
              <span className="text-6xl opacity-50">{isSupply ? '📦' : '🔍'}</span>
            </div>
          )}

          {/* Badge */}
          <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${isSupply ? 'bg-emerald-500' : 'bg-blue-500'}`}>
            {isSupply ? '🏷️ للبيع' : '🔍 مطلوب'}
          </div>

          {/* Favorite button */}
          <button className="absolute top-3 left-3 w-9 h-9 bg-white/90 backdrop-blur rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors">
            <svg className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Price */}
          <div className={`text-xl font-bold mb-2 ${isSupply ? 'text-emerald-600' : 'text-blue-600'}`}>
            {formatPrice(item.estimatedValue)}
          </div>

          {/* Title */}
          <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 text-right leading-relaxed">
            {item.title}
          </h3>

          {/* Location & Time */}
          <div className="flex items-center justify-between text-sm text-gray-500 pt-3 border-t border-gray-100">
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {item.location || item.user.governorate || 'مصر'}
            </span>
            <span>{formatDate(item.createdAt)}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ============================================
// صفحة الهبوط للزوار - Public Landing Page
// ============================================
function PublicLandingPage({ supplyItems, demandItems, loading }: {
  supplyItems: PublicItem[];
  demandItems: PublicItem[];
  loading: boolean;
}) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-bl from-emerald-600 via-emerald-500 to-teal-600 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'}}></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 lg:py-24">
          <div className="text-center text-white mb-12">
            <h1 className="text-4xl lg:text-6xl font-bold mb-4">
              بيع واشتري في مصر
            </h1>
            <p className="text-xl lg:text-2xl text-emerald-100 mb-2">
              منصة التبادل والمقايضة الأولى في مصر
            </p>
            <p className="text-emerald-200">
              أكثر من 10,000 إعلان نشط في 27 محافظة
            </p>
          </div>

          <SearchBar />

          {/* Quick Categories */}
          <div className="flex flex-wrap justify-center gap-3 mt-10">
            <span className="text-emerald-100 text-sm">الأكثر بحثاً:</span>
            {['آيفون', 'سيارات', 'شقق', 'لابتوب', 'أثاث'].map((term) => (
              <Link
                key={term}
                href={`/search?q=${term}`}
                className="px-4 py-1.5 bg-white/20 backdrop-blur text-white rounded-full text-sm hover:bg-white/30 transition-colors"
              >
                {term}
              </Link>
            ))}
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 100L60 90C120 80 240 60 360 50C480 40 600 40 720 45C840 50 960 60 1080 65C1200 70 1320 70 1380 70L1440 70V100H0Z" fill="#f9fafb"/>
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">تصفح حسب الفئة</h2>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.id}`}
              className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all hover:-translate-y-1 group"
            >
              <div className={`w-14 h-14 ${cat.color} rounded-2xl flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
                {cat.icon}
              </div>
              <span className="text-sm font-medium text-gray-700 text-center">{cat.nameAr}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Markets Section */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">اختر نطاق السوق</h2>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(MARKET_CONFIG).map(([key, market]) => (
              <Link
                key={key}
                href={`/?market=${key}`}
                className="p-6 rounded-2xl border-2 border-gray-100 hover:border-emerald-300 hover:bg-emerald-50 transition-all text-center group"
              >
                <span className="text-4xl mb-3 block group-hover:scale-110 transition-transform">{market.icon}</span>
                <h3 className="font-bold text-gray-800 mb-1">{market.nameAr}</h3>
                <p className="text-sm text-gray-500">{market.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Latest Offers Section */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-800">
            <span className="text-emerald-500">🏷️</span> أحدث العروض
          </h2>
          <Link href="/items" className="text-emerald-600 font-medium hover:text-emerald-700 flex items-center gap-1">
            عرض الكل
            <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-52 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded mb-2 w-24"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        ) : supplyItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {supplyItems.slice(0, 8).map((item) => (
              <ItemCard key={item.id} item={item} type="supply" />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <span className="text-6xl mb-4 block">📦</span>
            <p className="text-gray-500 mb-4">لا توجد عروض حالياً</p>
            <Link href="/inventory/add" className="px-6 py-3 bg-emerald-500 text-white rounded-xl font-medium hover:bg-emerald-600 transition-colors">
              أضف أول إعلان
            </Link>
          </div>
        )}
      </section>

      {/* Demands Section */}
      <section className="bg-blue-50 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold text-gray-800">
              <span className="text-blue-500">🔍</span> طلبات الشراء
            </h2>
            <Link href="/barter/open-offers" className="text-blue-600 font-medium hover:text-blue-700 flex items-center gap-1">
              عرض الكل
              <svg className="w-4 h-4 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          </div>

          {demandItems.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {demandItems.slice(0, 4).map((item) => (
                <ItemCard key={item.id} item={item} type="demand" />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <span className="text-5xl mb-4 block">🔍</span>
              <p className="text-gray-500">لا توجد طلبات حالياً</p>
            </div>
          )}
        </div>
      </section>

      {/* How it Works */}
      <section className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-gray-800 mb-12 text-center">كيف تعمل المنصة؟</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              📝
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">1. أنشئ إعلانك</h3>
            <p className="text-gray-600">سجل حسابك مجاناً وأضف إعلانك في دقائق مع صور وتفاصيل المنتج</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              🎯
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">2. نجد لك المطابقات</h3>
            <p className="text-gray-600">نظامنا الذكي يطابق عرضك مع الطلبات المناسبة تلقائياً</p>
          </div>
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
              🤝
            </div>
            <h3 className="text-xl font-bold mb-2 text-gray-800">3. أتمم الصفقة</h3>
            <p className="text-gray-600">تواصل مع الطرف الآخر وأتمم عملية البيع أو المقايضة بأمان</p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-4">ابدأ الآن مجاناً!</h2>
          <p className="text-xl text-emerald-100 mb-8">
            انضم لآلاف المستخدمين واستفد من نظام المطابقة الذكي
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-emerald-600 rounded-xl hover:bg-gray-100 transition-colors font-bold text-lg shadow-xl"
            >
              إنشاء حساب مجاني
            </Link>
            <Link
              href="/items"
              className="px-8 py-4 bg-emerald-700 text-white rounded-xl hover:bg-emerald-800 transition-colors font-medium text-lg border-2 border-emerald-400"
            >
              تصفح الإعلانات
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-white text-2xl font-bold mb-4">Xchange</h3>
              <p className="text-sm leading-relaxed">
                منصة مصرية للتبادل والمقايضة الذكية. نربط بين من يملك ومن يحتاج في جميع أنحاء مصر.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">روابط سريعة</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/items" className="hover:text-white transition-colors">تصفح العروض</Link></li>
                <li><Link href="/barter" className="hover:text-white transition-colors">المقايضة</Link></li>
                <li><Link href="/auctions" className="hover:text-white transition-colors">المزادات</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">الحساب</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/login" className="hover:text-white transition-colors">تسجيل الدخول</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">إنشاء حساب</Link></li>
                <li><Link href="/inventory" className="hover:text-white transition-colors">مخزوني</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2">
                  <span>📧</span> support@xchange.eg
                </li>
                <li className="flex items-center gap-2">
                  <span>📱</span> +20 123 456 7890
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>© {new Date().getFullYear()} Xchange Egypt. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// ============================================
// لوحة التحكم للمستخدمين - User Dashboard
// ============================================
function UserDashboard({ user, supplyItems, demandItems, loading }: {
  user: any;
  supplyItems: PublicItem[];
  demandItems: PublicItem[];
  loading: boolean;
}) {
  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Welcome Banner */}
      <section className="bg-gradient-to-l from-emerald-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold mb-1">
                مرحباً، {user.fullName}! 👋
              </h1>
              <p className="text-emerald-100">ماذا تريد أن تفعل اليوم؟</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/inventory/add"
                className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
              >
                <span>➕</span> إضافة إعلان
              </Link>
              <Link
                href="/notifications"
                className="px-6 py-3 bg-emerald-700 text-white rounded-xl font-medium hover:bg-emerald-800 transition-colors flex items-center gap-2"
              >
                <span>🔔</span> الإشعارات
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-bold text-gray-800">0</div>
            <div className="text-sm text-gray-500">إعلاناتي النشطة</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-emerald-600">0</div>
            <div className="text-sm text-gray-500">مطابقات جديدة</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">💬</div>
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-sm text-gray-500">رسائل غير مقروءة</div>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-3xl mb-2">🤝</div>
            <div className="text-2xl font-bold text-purple-600">0</div>
            <div className="text-sm text-gray-500">صفقات مكتملة</div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="max-w-7xl mx-auto px-4 py-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link href="/inventory" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-emerald-300 hover:shadow-lg transition-all text-center group">
            <div className="w-14 h-14 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform">
              📦
            </div>
            <span className="font-medium text-gray-700">مخزوني</span>
          </Link>
          <Link href="/inventory/add?side=SUPPLY" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-green-300 hover:shadow-lg transition-all text-center group">
            <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform">
              🏷️
            </div>
            <span className="font-medium text-gray-700">عرض للبيع</span>
          </Link>
          <Link href="/inventory/add?side=DEMAND" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-blue-300 hover:shadow-lg transition-all text-center group">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform">
              🔍
            </div>
            <span className="font-medium text-gray-700">طلب شراء</span>
          </Link>
          <Link href="/messages" className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:border-purple-300 hover:shadow-lg transition-all text-center group">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-3 text-2xl group-hover:scale-110 transition-transform">
              💬
            </div>
            <span className="font-medium text-gray-700">الرسائل</span>
          </Link>
        </div>
      </section>

      {/* Latest Offers */}
      <section className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            <span className="text-emerald-500">🏷️</span> أحدث العروض في السوق
          </h2>
          <Link href="/items" className="text-emerald-600 font-medium hover:text-emerald-700">
            عرض الكل ←
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4">
                  <div className="h-5 bg-gray-200 rounded mb-2 w-24"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        ) : supplyItems.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {supplyItems.slice(0, 4).map((item) => (
              <ItemCard key={item.id} item={item} type="supply" />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
            <span className="text-5xl mb-4 block">📦</span>
            <p className="text-gray-500 mb-4">لا توجد عروض حالياً</p>
            <Link href="/inventory/add" className="text-emerald-600 font-medium hover:text-emerald-700">
              أضف أول إعلان ←
            </Link>
          </div>
        )}
      </section>

      {/* Browse Categories */}
      <section className="bg-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-xl font-bold text-gray-800 mb-6">تصفح حسب الفئة</h2>
          <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.id}`}
                className="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-all group"
              >
                <div className={`w-12 h-12 ${cat.color} rounded-xl flex items-center justify-center text-xl mb-2 group-hover:scale-110 transition-transform`}>
                  {cat.icon}
                </div>
                <span className="text-xs text-gray-600 text-center">{cat.nameAr}</span>
              </Link>
            ))}
          </div>
        </div>
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
  const [loading, setLoading] = useState(true);
  const [selectedMarket, setSelectedMarket] = useState<MarketType | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await getLatestItems({
          limit: 8,
          marketType: selectedMarket || undefined,
        });
        if (response.success) {
          setSupplyItems(response.data.supply);
          setDemandItems(response.data.demand);
        }
      } catch (err: any) {
        console.error('Failed to fetch items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, [selectedMarket]);

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // Show different views based on authentication
  if (user) {
    return <UserDashboard user={user} supplyItems={supplyItems} demandItems={demandItems} loading={loading} />;
  }

  return <PublicLandingPage supplyItems={supplyItems} demandItems={demandItems} loading={loading} />;
}
