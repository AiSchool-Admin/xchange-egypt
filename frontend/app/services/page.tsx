'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

// ============================================
// Service Categories
// ============================================
const SERVICE_CATEGORIES = [
  {
    id: 'home',
    name: 'خدمات المنزل',
    nameEn: 'Home Services',
    icon: '🏠',
    gradient: 'from-blue-500 to-indigo-600',
    subcategories: ['سباكة', 'كهرباء', 'نجارة', 'دهان', 'تنظيف', 'تكييف'],
  },
  {
    id: 'automotive',
    name: 'خدمات السيارات',
    nameEn: 'Automotive',
    icon: '🚗',
    gradient: 'from-red-500 to-orange-600',
    subcategories: ['صيانة', 'كهرباء سيارات', 'سمكرة', 'تلميع', 'إطارات'],
  },
  {
    id: 'tech',
    name: 'خدمات التقنية',
    nameEn: 'Tech Services',
    icon: '💻',
    gradient: 'from-purple-500 to-pink-600',
    subcategories: ['صيانة موبايل', 'صيانة لابتوب', 'برمجة', 'تصميم', 'شبكات'],
  },
  {
    id: 'beauty',
    name: 'التجميل والعناية',
    nameEn: 'Beauty & Care',
    icon: '💅',
    gradient: 'from-pink-500 to-rose-600',
    subcategories: ['حلاقة رجالي', 'تجميل نسائي', 'مساج', 'سبا'],
  },
  {
    id: 'education',
    name: 'التعليم والتدريب',
    nameEn: 'Education',
    icon: '📚',
    gradient: 'from-emerald-500 to-teal-600',
    subcategories: ['دروس خصوصية', 'لغات', 'موسيقى', 'رياضة', 'تنمية بشرية'],
  },
  {
    id: 'events',
    name: 'المناسبات',
    nameEn: 'Events',
    icon: '🎉',
    gradient: 'from-amber-500 to-yellow-600',
    subcategories: ['تصوير', 'تنظيم حفلات', 'كاترينج', 'DJ', 'ديكور'],
  },
  {
    id: 'professional',
    name: 'خدمات مهنية',
    nameEn: 'Professional',
    icon: '👔',
    gradient: 'from-slate-500 to-gray-700',
    subcategories: ['محاماة', 'محاسبة', 'استشارات', 'ترجمة', 'تسويق'],
  },
  {
    id: 'health',
    name: 'الصحة',
    nameEn: 'Health',
    icon: '🏥',
    gradient: 'from-green-500 to-emerald-600',
    subcategories: ['تمريض منزلي', 'علاج طبيعي', 'رعاية مسنين', 'طبيب منزلي'],
  },
];

// ============================================
// Featured Providers
// ============================================
const FEATURED_PROVIDERS = [
  {
    id: '1',
    name: 'محمد الفني',
    service: 'كهرباء منازل',
    rating: 4.9,
    reviews: 156,
    avatar: '👨‍🔧',
    verified: true,
    certified: true,
    responseTime: '30 دقيقة',
  },
  {
    id: '2',
    name: 'أحمد السباك',
    service: 'سباكة وصرف صحي',
    rating: 4.8,
    reviews: 203,
    avatar: '🔧',
    verified: true,
    certified: true,
    responseTime: '1 ساعة',
  },
  {
    id: '3',
    name: 'سارة المصممة',
    service: 'تصميم جرافيك',
    rating: 5.0,
    reviews: 89,
    avatar: '👩‍🎨',
    verified: true,
    certified: false,
    responseTime: '2 ساعة',
  },
  {
    id: '4',
    name: 'كريم المعلم',
    service: 'دروس رياضيات',
    rating: 4.7,
    reviews: 124,
    avatar: '👨‍🏫',
    verified: true,
    certified: true,
    responseTime: '45 دقيقة',
  },
];

// ============================================
// Protection Tiers
// ============================================
const PROTECTION_TIERS = [
  {
    name: 'Basic',
    nameAr: 'أساسي',
    duration: '14 يوم',
    coverage: '100%',
    icon: '🛡️',
    color: 'bg-gray-100 text-gray-700',
  },
  {
    name: 'Plus',
    nameAr: 'بلس',
    duration: '30 يوم',
    coverage: '100%',
    icon: '🛡️',
    color: 'bg-blue-100 text-blue-700',
  },
  {
    name: 'Premium',
    nameAr: 'بريميوم',
    duration: '90 يوم',
    coverage: '100%',
    icon: '🛡️',
    color: 'bg-purple-100 text-purple-700',
  },
  {
    name: 'Ultimate',
    nameAr: 'ألتيميت',
    duration: '365 يوم',
    coverage: '100%',
    icon: '👑',
    color: 'bg-amber-100 text-amber-700',
  },
];

// ============================================
// Main Services Page
// ============================================
export default function ServicesPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/services/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-cyan-500">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl animate-pulse delay-1000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-16 md:py-24">
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 rounded-full text-white text-sm font-bold mb-4">
              🔧 سوق الخدمات الجديد
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4">
              خدمات احترافية
              <br />
              <span className="text-cyan-200">مع ضمان Xchange Protect</span>
            </h1>
            <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-8">
              احجز أفضل مقدمي الخدمات المعتمدين في مصر. دفع آمن، ضمان على الخدمة، ومراجعات حقيقية.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن خدمة... سباك، كهربائي، مدرس..."
                  className="w-full px-6 py-5 pr-14 bg-white/95 backdrop-blur-sm rounded-2xl text-lg text-gray-800 placeholder-gray-400 shadow-2xl focus:ring-4 focus:ring-white/30 outline-none"
                />
                <button
                  type="submit"
                  className="absolute left-2 top-1/2 -translate-y-1/2 p-3 bg-gradient-to-r from-indigo-500 to-blue-500 text-white rounded-xl hover:from-indigo-600 hover:to-blue-600 transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </button>
              </div>
            </form>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { label: 'مقدم خدمة', value: '2,500+', icon: '👨‍🔧' },
              { label: 'خدمة مكتملة', value: '15,000+', icon: '✅' },
              { label: 'تقييم العملاء', value: '4.8', icon: '⭐' },
              { label: 'ضمان الخدمة', value: '100%', icon: '🛡️' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-black text-white">{stat.value}</div>
                <div className="text-sm text-white/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">📂 تصفح حسب الفئة</h2>
            <p className="text-gray-600">اختر نوع الخدمة التي تحتاجها</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {SERVICE_CATEGORIES.map((category) => (
              <Link
                key={category.id}
                href={`/services/category/${category.id}`}
                className="group relative bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-transparent overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${category.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className="relative z-10">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">{category.icon}</div>
                  <h3 className="text-lg font-bold text-gray-900 group-hover:text-white mb-2 transition-colors">
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-1">
                    {category.subcategories.slice(0, 3).map((sub) => (
                      <span
                        key={sub}
                        className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 group-hover:bg-white/20 group-hover:text-white rounded-full transition-colors"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>

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

      {/* Xchange Protect Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-4">🛡️ Xchange Protect</h2>
            <p className="text-lg text-white/80 max-w-2xl mx-auto">
              احجز بثقة مع ضمان Xchange Protect - استرد أموالك كاملة إذا لم تكن راضياً عن الخدمة
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {PROTECTION_TIERS.map((tier) => (
              <div
                key={tier.name}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-colors"
              >
                <div className="text-4xl mb-4">{tier.icon}</div>
                <h3 className="text-xl font-bold mb-1">{tier.nameAr}</h3>
                <p className="text-sm text-white/60 mb-4">{tier.name}</p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">مدة الضمان:</span>
                    <span className="font-bold">{tier.duration}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/70">نسبة التغطية:</span>
                    <span className="font-bold">{tier.coverage}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <p className="text-white/60 text-sm">
              * الضمان يشمل جودة الخدمة والالتزام بالموعد والمواصفات المتفق عليها
            </p>
          </div>
        </div>
      </section>

      {/* Featured Providers */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">⭐ مقدمي خدمات مميزين</h2>
              <p className="text-gray-500">أفضل مقدمي الخدمات المعتمدين</p>
            </div>
            <Link
              href="/services/providers"
              className="flex items-center gap-2 text-indigo-600 hover:text-indigo-700 font-bold"
            >
              عرض الكل
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_PROVIDERS.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-4xl">{provider.avatar}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{provider.name}</h3>
                      {provider.verified && (
                        <span className="text-blue-500" title="موثق">✓</span>
                      )}
                      {provider.certified && (
                        <span className="text-amber-500" title="Xchange Certified">🏆</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">{provider.service}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">التقييم:</span>
                    <span className="font-bold text-amber-500">⭐ {provider.rating}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">المراجعات:</span>
                    <span className="font-bold">{provider.reviews}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">وقت الرد:</span>
                    <span className="font-bold text-green-600">{provider.responseTime}</span>
                  </div>
                </div>

                <Link
                  href={`/services/provider/${provider.id}`}
                  className="block w-full py-3 bg-indigo-50 text-indigo-600 rounded-xl font-bold text-center hover:bg-indigo-100 transition-colors"
                >
                  عرض الملف
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-gray-900 mb-4">🔄 كيف يعمل سوق الخدمات؟</h2>
            <p className="text-gray-600">خطوات بسيطة للحصول على الخدمة</p>
          </div>

          <div className="grid md:grid-cols-4 gap-8">
            {[
              { step: 1, icon: '🔍', title: 'ابحث', desc: 'ابحث عن الخدمة التي تحتاجها' },
              { step: 2, icon: '📋', title: 'اختر', desc: 'قارن بين مقدمي الخدمات واختر الأفضل' },
              { step: 3, icon: '📅', title: 'احجز', desc: 'حدد الموعد المناسب وادفع بأمان' },
              { step: 4, icon: '✅', title: 'استمتع', desc: 'احصل على الخدمة مع ضمان Xchange' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold mx-auto mb-3">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Become a Provider CTA */}
      <section className="py-16 bg-gradient-to-r from-emerald-600 to-teal-600 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-black mb-4">
            👨‍🔧 هل أنت مقدم خدمة؟
          </h2>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            انضم لآلاف مقدمي الخدمات على XChange واحصل على عملاء جدد كل يوم.
            عمولة تبدأ من 10% فقط للمشتركين!
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/services/become-provider"
              className="px-8 py-4 bg-white text-emerald-600 rounded-xl font-bold text-lg hover:bg-white/90 transition-colors shadow-lg"
            >
              سجل كمقدم خدمة
            </Link>
            <Link
              href="/services/provider-guide"
              className="px-8 py-4 bg-white/20 text-white rounded-xl font-bold text-lg hover:bg-white/30 transition-colors"
            >
              تعرف على المزايا
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
