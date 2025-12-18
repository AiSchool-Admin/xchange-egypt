'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// ============================================
// Service Categories Data
// ============================================
const SERVICE_CATEGORIES: Record<string, {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  gradient: string;
  description: string;
  subcategories: { id: string; name: string; icon: string }[];
}> = {
  home: {
    id: 'home',
    name: 'خدمات المنزل',
    nameEn: 'Home Services',
    icon: '🏠',
    gradient: 'from-blue-500 to-indigo-600',
    description: 'جميع الخدمات المنزلية من صيانة وتنظيف وإصلاحات',
    subcategories: [
      { id: 'plumbing', name: 'سباكة', icon: '🔧' },
      { id: 'electrical', name: 'كهرباء', icon: '⚡' },
      { id: 'carpentry', name: 'نجارة', icon: '🪚' },
      { id: 'painting', name: 'دهان', icon: '🎨' },
      { id: 'cleaning', name: 'تنظيف', icon: '🧹' },
      { id: 'ac', name: 'تكييف', icon: '❄️' },
      { id: 'pest-control', name: 'مكافحة حشرات', icon: '🪲' },
      { id: 'gardening', name: 'حدائق', icon: '🌳' },
    ],
  },
  automotive: {
    id: 'automotive',
    name: 'خدمات السيارات',
    nameEn: 'Automotive',
    icon: '🚗',
    gradient: 'from-red-500 to-orange-600',
    description: 'صيانة وإصلاح جميع أنواع السيارات',
    subcategories: [
      { id: 'maintenance', name: 'صيانة عامة', icon: '🔧' },
      { id: 'car-electrical', name: 'كهرباء سيارات', icon: '⚡' },
      { id: 'body-work', name: 'سمكرة ودهان', icon: '🎨' },
      { id: 'detailing', name: 'تلميع', icon: '✨' },
      { id: 'tires', name: 'إطارات', icon: '🛞' },
      { id: 'ac-car', name: 'تكييف سيارات', icon: '❄️' },
      { id: 'towing', name: 'سحب سيارات', icon: '🚛' },
    ],
  },
  tech: {
    id: 'tech',
    name: 'خدمات التقنية',
    nameEn: 'Tech Services',
    icon: '💻',
    gradient: 'from-purple-500 to-pink-600',
    description: 'صيانة الأجهزة وخدمات البرمجة والتصميم',
    subcategories: [
      { id: 'mobile-repair', name: 'صيانة موبايل', icon: '📱' },
      { id: 'laptop-repair', name: 'صيانة لابتوب', icon: '💻' },
      { id: 'programming', name: 'برمجة', icon: '👨‍💻' },
      { id: 'design', name: 'تصميم جرافيك', icon: '🎨' },
      { id: 'networking', name: 'شبكات', icon: '🌐' },
      { id: 'data-recovery', name: 'استعادة بيانات', icon: '💾' },
      { id: 'web-dev', name: 'تطوير مواقع', icon: '🖥️' },
    ],
  },
  beauty: {
    id: 'beauty',
    name: 'التجميل والعناية',
    nameEn: 'Beauty & Care',
    icon: '💅',
    gradient: 'from-pink-500 to-rose-600',
    description: 'خدمات التجميل والعناية الشخصية',
    subcategories: [
      { id: 'barber', name: 'حلاقة رجالي', icon: '💈' },
      { id: 'beauty-salon', name: 'تجميل نسائي', icon: '💅' },
      { id: 'massage', name: 'مساج', icon: '💆' },
      { id: 'spa', name: 'سبا', icon: '🧖' },
      { id: 'makeup', name: 'مكياج', icon: '💄' },
      { id: 'nails', name: 'أظافر', icon: '💅' },
    ],
  },
  education: {
    id: 'education',
    name: 'التعليم والتدريب',
    nameEn: 'Education',
    icon: '📚',
    gradient: 'from-emerald-500 to-teal-600',
    description: 'دروس خصوصية وتدريب في جميع المجالات',
    subcategories: [
      { id: 'tutoring', name: 'دروس خصوصية', icon: '📖' },
      { id: 'languages', name: 'لغات', icon: '🗣️' },
      { id: 'music', name: 'موسيقى', icon: '🎵' },
      { id: 'sports', name: 'رياضة', icon: '⚽' },
      { id: 'development', name: 'تنمية بشرية', icon: '🧠' },
      { id: 'quran', name: 'تحفيظ قرآن', icon: '📿' },
      { id: 'computer', name: 'كمبيوتر', icon: '💻' },
    ],
  },
  events: {
    id: 'events',
    name: 'المناسبات',
    nameEn: 'Events',
    icon: '🎉',
    gradient: 'from-amber-500 to-yellow-600',
    description: 'تنظيم الحفلات والمناسبات',
    subcategories: [
      { id: 'photography', name: 'تصوير', icon: '📸' },
      { id: 'event-planning', name: 'تنظيم حفلات', icon: '🎊' },
      { id: 'catering', name: 'كاترينج', icon: '🍽️' },
      { id: 'dj', name: 'DJ', icon: '🎧' },
      { id: 'decoration', name: 'ديكور', icon: '🎀' },
      { id: 'flowers', name: 'زهور', icon: '💐' },
      { id: 'video', name: 'فيديو', icon: '🎬' },
    ],
  },
  professional: {
    id: 'professional',
    name: 'خدمات مهنية',
    nameEn: 'Professional',
    icon: '👔',
    gradient: 'from-slate-500 to-gray-700',
    description: 'خدمات قانونية ومحاسبية واستشارية',
    subcategories: [
      { id: 'legal', name: 'محاماة', icon: '⚖️' },
      { id: 'accounting', name: 'محاسبة', icon: '📊' },
      { id: 'consulting', name: 'استشارات', icon: '💼' },
      { id: 'translation', name: 'ترجمة', icon: '🌍' },
      { id: 'marketing', name: 'تسويق', icon: '📢' },
      { id: 'hr', name: 'موارد بشرية', icon: '👥' },
    ],
  },
  health: {
    id: 'health',
    name: 'الصحة',
    nameEn: 'Health',
    icon: '🏥',
    gradient: 'from-green-500 to-emerald-600',
    description: 'خدمات صحية ورعاية منزلية',
    subcategories: [
      { id: 'nursing', name: 'تمريض منزلي', icon: '👩‍⚕️' },
      { id: 'physiotherapy', name: 'علاج طبيعي', icon: '🏃' },
      { id: 'elderly-care', name: 'رعاية مسنين', icon: '👴' },
      { id: 'home-doctor', name: 'طبيب منزلي', icon: '👨‍⚕️' },
      { id: 'lab', name: 'تحاليل منزلية', icon: '🧪' },
      { id: 'mental-health', name: 'صحة نفسية', icon: '🧠' },
    ],
  },
};

// ============================================
// Sample Providers
// ============================================
const SAMPLE_PROVIDERS = [
  { id: '1', name: 'محمد أحمد', rating: 4.9, reviews: 156, responseTime: '30 دقيقة', price: 150, verified: true, certified: true },
  { id: '2', name: 'أحمد محمود', rating: 4.8, reviews: 203, responseTime: '1 ساعة', price: 120, verified: true, certified: true },
  { id: '3', name: 'سارة علي', rating: 5.0, reviews: 89, responseTime: '2 ساعة', price: 200, verified: true, certified: false },
  { id: '4', name: 'كريم حسن', rating: 4.7, reviews: 124, responseTime: '45 دقيقة', price: 180, verified: true, certified: true },
  { id: '5', name: 'نور الدين', rating: 4.6, reviews: 98, responseTime: '1 ساعة', price: 100, verified: true, certified: false },
  { id: '6', name: 'فاطمة محمد', rating: 4.9, reviews: 167, responseTime: '30 دقيقة', price: 160, verified: true, certified: true },
];

// ============================================
// Main Category Page
// ============================================
export default function ServiceCategoryPage() {
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;

  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'reviews'>('rating');

  const category = SERVICE_CATEGORIES[categoryId];

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">الفئة غير موجودة</h1>
          <p className="text-gray-500 mb-6">لم نتمكن من العثور على هذه الفئة</p>
          <Link href="/services" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
            العودة لسوق الخدمات
          </Link>
        </div>
      </div>
    );
  }

  const sortedProviders = [...SAMPLE_PROVIDERS].sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'price') return a.price - b.price;
    if (sortBy === 'reviews') return b.reviews - a.reviews;
    return 0;
  });

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <section className={`relative overflow-hidden bg-gradient-to-br ${category.gradient}`}>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-white rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 md:py-16">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-6">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-white">الخدمات</Link>
            <span>/</span>
            <span className="text-white">{category.name}</span>
          </nav>

          <div className="flex items-center gap-6">
            <div className="text-7xl">{category.icon}</div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-white mb-2">{category.name}</h1>
              <p className="text-lg text-white/80">{category.description}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Subcategories */}
      <section className="py-8 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setSelectedSubcategory(null)}
              className={`px-4 py-2 rounded-full font-medium transition-colors ${
                selectedSubcategory === null
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            {category.subcategories.map((sub) => (
              <button
                key={sub.id}
                onClick={() => setSelectedSubcategory(sub.id)}
                className={`px-4 py-2 rounded-full font-medium transition-colors flex items-center gap-2 ${
                  selectedSubcategory === sub.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span>{sub.icon}</span>
                {sub.name}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Filters & Sort */}
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <p className="text-gray-600">
              <span className="font-bold text-gray-900">{sortedProviders.length}</span> مقدم خدمة متاح
            </p>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">ترتيب حسب:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="rating">التقييم</option>
                <option value="price">السعر (الأقل)</option>
                <option value="reviews">عدد المراجعات</option>
              </select>
            </div>
          </div>

          {/* Providers Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedProviders.map((provider) => (
              <div
                key={provider.id}
                className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow border border-gray-100"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-blue-100 rounded-xl flex items-center justify-center text-2xl">
                    👨‍🔧
                  </div>
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
                    <p className="text-sm text-gray-500">{category.name}</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-amber-500">⭐ {provider.rating}</div>
                    <div className="text-xs text-gray-500">التقييم</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-gray-900">{provider.reviews}</div>
                    <div className="text-xs text-gray-500">مراجعة</div>
                  </div>
                  <div className="text-center p-2 bg-gray-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{provider.price} ج.م</div>
                    <div className="text-xs text-gray-500">يبدأ من</div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <span>⏱️ وقت الرد: {provider.responseTime}</span>
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs">متاح الآن</span>
                </div>

                <div className="flex gap-2">
                  <Link
                    href={`/services/provider/${provider.id}`}
                    className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold text-center hover:bg-indigo-700 transition-colors"
                  >
                    عرض الملف
                  </Link>
                  <button className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
                    💬
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Xchange Protect Banner */}
      <section className="py-8 bg-gradient-to-r from-indigo-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="text-4xl">🛡️</div>
              <div>
                <h3 className="text-xl font-bold">جميع الخدمات محمية بـ Xchange Protect</h3>
                <p className="text-white/80">استرد أموالك كاملة إذا لم تكن راضياً عن الخدمة</p>
              </div>
            </div>
            <Link
              href="/services#protection"
              className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-white/90 transition-colors"
            >
              تعرف على المزيد
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
