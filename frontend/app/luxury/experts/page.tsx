'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LUXURY_CATEGORY_AR,
  LUXURY_CATEGORY_ICONS,
  LuxuryCategoryType,
  LuxuryExpert,
} from '@/lib/api/luxury-marketplace';

// Mock experts data
const MOCK_EXPERTS: LuxuryExpert[] = [
  {
    id: '1',
    userId: 'user-1',
    nameAr: 'أحمد محمود',
    nameEn: 'Ahmed Mahmoud',
    titleAr: 'خبير ساعات معتمد',
    titleEn: 'Certified Watch Expert',
    bioAr: 'خبير معتمد في الساعات الفاخرة مع خبرة 15 عاماً. متخصص في توثيق ساعات رولكس، أوميغا، وباتيك فيليب. حاصل على شهادات دولية في تقييم الساعات.',
    avatar: 'https://i.pravatar.cc/150?img=1',
    specializations: ['WATCHES'],
    certifiedBrands: ['Rolex', 'Omega', 'Patek Philippe', 'Audemars Piguet', 'Cartier'],
    yearsExperience: 15,
    entrupyCertified: true,
    totalVerifications: 2500,
    accuracyRate: 99.8,
    avgRating: 4.9,
    totalReviews: 342,
    isActive: true,
    governorate: 'القاهرة',
  },
  {
    id: '2',
    userId: 'user-2',
    nameAr: 'سارة أحمد',
    nameEn: 'Sara Ahmed',
    titleAr: 'خبيرة مجوهرات وأحجار كريمة',
    titleEn: 'Jewelry & Gemstone Expert',
    bioAr: 'خبيرة معتمدة من GIA في تقييم الألماس والأحجار الكريمة. 12 عاماً من الخبرة في تقييم المجوهرات الفاخرة من كارتييه، فان كليف، وبولغاري.',
    avatar: 'https://i.pravatar.cc/150?img=5',
    specializations: ['JEWELRY'],
    certifiedBrands: ['Cartier', 'Van Cleef & Arpels', 'Bulgari', 'Tiffany', 'Harry Winston'],
    yearsExperience: 12,
    entrupyCertified: false,
    totalVerifications: 1800,
    accuracyRate: 99.5,
    avgRating: 4.8,
    totalReviews: 256,
    isActive: true,
    governorate: 'القاهرة',
  },
  {
    id: '3',
    userId: 'user-3',
    nameAr: 'محمد علي',
    nameEn: 'Mohamed Ali',
    titleAr: 'خبير حقائب فاخرة',
    titleEn: 'Luxury Bags Expert',
    bioAr: 'متخصص في توثيق حقائب هيرميس وشانيل ولويس فيتون. معتمد من Entrupy للتحقق من أصالة الحقائب. 10 سنوات خبرة في سوق الحقائب الفاخرة.',
    avatar: 'https://i.pravatar.cc/150?img=3',
    specializations: ['HANDBAGS'],
    certifiedBrands: ['Hermès', 'Chanel', 'Louis Vuitton', 'Dior', 'Gucci', 'Prada'],
    yearsExperience: 10,
    entrupyCertified: true,
    totalVerifications: 3200,
    accuracyRate: 99.9,
    avgRating: 5.0,
    totalReviews: 489,
    isActive: true,
    governorate: 'الإسكندرية',
  },
  {
    id: '4',
    userId: 'user-4',
    nameAr: 'خالد حسن',
    nameEn: 'Khaled Hassan',
    titleAr: 'خبير تحف وفنون',
    titleEn: 'Art & Antiques Expert',
    bioAr: 'خبير في تقييم اللوحات الفنية والتحف الأثرية. حاصل على شهادة من كريستيز للمزادات. 20 عاماً من الخبرة في تقييم الفنون والمقتنيات.',
    avatar: 'https://i.pravatar.cc/150?img=4',
    specializations: ['ART', 'ANTIQUES'],
    certifiedBrands: [],
    yearsExperience: 20,
    entrupyCertified: false,
    totalVerifications: 800,
    accuracyRate: 98.5,
    avgRating: 4.7,
    totalReviews: 124,
    isActive: true,
    governorate: 'القاهرة',
  },
  {
    id: '5',
    userId: 'user-5',
    nameAr: 'نور حسين',
    nameEn: 'Nour Hussein',
    titleAr: 'خبيرة ساعات ومجوهرات',
    titleEn: 'Watches & Jewelry Expert',
    bioAr: 'خبيرة متعددة التخصصات في الساعات والمجوهرات الفاخرة. 8 سنوات خبرة. متخصصة في ساعات المجوهرات النسائية.',
    avatar: 'https://i.pravatar.cc/150?img=9',
    specializations: ['WATCHES', 'JEWELRY'],
    certifiedBrands: ['Cartier', 'Chopard', 'Piaget', 'Bulgari'],
    yearsExperience: 8,
    entrupyCertified: true,
    totalVerifications: 1200,
    accuracyRate: 99.2,
    avgRating: 4.9,
    totalReviews: 178,
    isActive: true,
    governorate: 'الجيزة',
  },
];

const SPECIALIZATION_FILTERS: { value: LuxuryCategoryType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'جميع التخصصات', icon: '👑' },
  { value: 'WATCHES', label: 'ساعات', icon: '⌚' },
  { value: 'JEWELRY', label: 'مجوهرات', icon: '💎' },
  { value: 'HANDBAGS', label: 'حقائب', icon: '👜' },
  { value: 'ART', label: 'فنون', icon: '🖼️' },
  { value: 'ANTIQUES', label: 'تحف', icon: '🏺' },
];

export default function LuxuryExpertsPage() {
  const [experts, setExperts] = useState<LuxuryExpert[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSpecialization, setSelectedSpecialization] = useState<LuxuryCategoryType | 'all'>('all');
  const [selectedExpert, setSelectedExpert] = useState<LuxuryExpert | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  useEffect(() => {
    loadExperts();
  }, []);

  const loadExperts = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setExperts(MOCK_EXPERTS);
    } catch (error) {
      console.error('Failed to load experts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExperts = experts.filter((expert) => {
    if (selectedSpecialization === 'all') return true;
    return expert.specializations.includes(selectedSpecialization);
  });

  const handleContactExpert = (expert: LuxuryExpert) => {
    setSelectedExpert(expert);
    setShowContactModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-gray-900 to-gray-950"></div>
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <Link href="/luxury" className="hover:text-white">السلع الفاخرة</Link>
            <span>/</span>
            <span className="text-emerald-400">خبراء التوثيق</span>
          </nav>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/20 rounded-full mb-6">
              <span className="text-2xl">👨‍🔬</span>
              <span className="text-emerald-400 font-medium">خبراء معتمدون</span>
            </div>
            <h1 className="text-3xl lg:text-5xl font-bold text-white mb-4">
              خبراء توثيق
              <span className="block text-emerald-400 mt-2">السلع الفاخرة</span>
            </h1>
            <p className="text-gray-400 text-lg">
              فريق من الخبراء المعتمدين لتوثيق أصالة منتجاتك الفاخرة - ساعات، مجوهرات، حقائب وأكثر
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-gray-900 py-8 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: experts.length, label: 'خبير معتمد', icon: '👨‍🔬' },
              { value: experts.reduce((sum, e) => sum + e.totalVerifications, 0).toLocaleString('ar-EG'), label: 'عملية توثيق', icon: '✅' },
              { value: '99.5%', label: 'نسبة الدقة', icon: '🎯' },
              { value: '4.9', label: 'تقييم العملاء', icon: '⭐' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl mb-1">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specialization Filter */}
      <section className="bg-gray-900/50 py-6 sticky top-0 z-40 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-wrap justify-center gap-3">
            {SPECIALIZATION_FILTERS.map((filter) => (
              <button
                key={filter.value}
                onClick={() => setSelectedSpecialization(filter.value)}
                className={`px-5 py-2 rounded-full font-medium transition flex items-center gap-2 ${
                  selectedSpecialization === filter.value
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{filter.icon}</span>
                <span>{filter.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Experts Grid */}
      <section className="max-w-7xl mx-auto px-4 py-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-2xl p-6 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-20 h-20 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-700 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="h-20 bg-gray-700 rounded mb-4"></div>
                <div className="h-10 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
        ) : filteredExperts.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-6 opacity-30">👨‍🔬</div>
            <h3 className="text-2xl font-bold text-white mb-3">لا يوجد خبراء في هذا التخصص</h3>
            <p className="text-gray-400">جرب اختيار تخصص آخر</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExperts.map((expert) => (
              <div
                key={expert.id}
                className="bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-emerald-500/30 transition overflow-hidden"
              >
                {/* Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <div className="relative">
                      <img
                        src={expert.avatar || `https://ui-avatars.com/api/?name=${expert.nameAr}&background=random`}
                        alt={expert.nameAr}
                        className="w-20 h-20 rounded-full object-cover border-2 border-emerald-500"
                      />
                      {expert.entrupyCertified && (
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-white">{expert.nameAr}</h3>
                      <p className="text-emerald-400 text-sm">{expert.titleAr}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-yellow-400">⭐ {expert.avgRating}</span>
                        <span className="text-gray-500 text-sm">({expert.totalReviews} تقييم)</span>
                      </div>
                    </div>
                  </div>

                  {/* Specializations */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {expert.specializations.map((spec) => (
                      <span
                        key={spec}
                        className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs flex items-center gap-1"
                      >
                        <span>{LUXURY_CATEGORY_ICONS[spec]}</span>
                        <span>{LUXURY_CATEGORY_AR[spec]}</span>
                      </span>
                    ))}
                  </div>

                  {/* Bio */}
                  <p className="text-gray-400 text-sm mb-4 line-clamp-3">{expert.bioAr}</p>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-gray-700">
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{expert.yearsExperience}</div>
                      <div className="text-gray-500 text-xs">سنة خبرة</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-white">{expert.totalVerifications.toLocaleString('ar-EG')}</div>
                      <div className="text-gray-500 text-xs">توثيق</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-emerald-400">{expert.accuracyRate}%</div>
                      <div className="text-gray-500 text-xs">دقة</div>
                    </div>
                  </div>

                  {/* Certified Brands */}
                  {expert.certifiedBrands.length > 0 && (
                    <div className="mb-4">
                      <p className="text-gray-500 text-xs mb-2">معتمد لتوثيق:</p>
                      <div className="flex flex-wrap gap-1">
                        {expert.certifiedBrands.slice(0, 4).map((brand) => (
                          <span key={brand} className="px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded text-xs">
                            {brand}
                          </span>
                        ))}
                        {expert.certifiedBrands.length > 4 && (
                          <span className="px-2 py-0.5 text-gray-500 text-xs">
                            +{expert.certifiedBrands.length - 4}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Badges */}
                  <div className="flex gap-2 mb-4">
                    {expert.entrupyCertified && (
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">
                        ✓ Entrupy معتمد
                      </span>
                    )}
                    <span className="px-3 py-1 bg-gray-700 text-gray-300 rounded-full text-xs">
                      📍 {expert.governorate}
                    </span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleContactExpert(expert)}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition"
                  >
                    💬 تواصل مع الخبير
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it Works */}
      <section className="bg-gray-900/50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-12">
            كيف يعمل نظام التوثيق؟
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', icon: '📸', title: 'أرسل الصور', desc: 'صور واضحة للمنتج من جميع الزوايا' },
              { step: '2', icon: '🔍', title: 'فحص الخبير', desc: 'خبير متخصص يفحص التفاصيل' },
              { step: '3', icon: '📋', title: 'تقرير التوثيق', desc: 'تقرير شامل عن أصالة المنتج' },
              { step: '4', icon: '✅', title: 'شهادة رقمية', desc: 'شهادة توثيق معتمدة' },
            ].map((item, i) => (
              <div key={i} className="text-center relative">
                <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                  {item.icon}
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="text-white font-bold mb-2">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">هل أنت خبير في السلع الفاخرة؟</h2>
          <p className="text-gray-400 mb-8">انضم لفريق خبرائنا وساعد في توثيق المنتجات الفاخرة</p>
          <Link
            href="/luxury/apply-expert"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition"
          >
            <span>📝</span>
            <span>تقدم كخبير توثيق</span>
          </Link>
        </div>
      </section>

      {/* Contact Modal */}
      {showContactModal && selectedExpert && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">تواصل مع الخبير</h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="flex items-center gap-4 mb-6">
              <img
                src={selectedExpert.avatar}
                alt={selectedExpert.nameAr}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h4 className="text-white font-bold">{selectedExpert.nameAr}</h4>
                <p className="text-emerald-400 text-sm">{selectedExpert.titleAr}</p>
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="text-white font-medium block mb-2">نوع الخدمة</label>
                <select className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white">
                  <option>توثيق منتج جديد</option>
                  <option>استشارة قبل الشراء</option>
                  <option>تقييم سعر السوق</option>
                  <option>فحص مباشر</option>
                </select>
              </div>
              <div>
                <label className="text-white font-medium block mb-2">رسالتك</label>
                <textarea
                  rows={4}
                  placeholder="اكتب تفاصيل طلبك..."
                  className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  alert('تم إرسال طلبك للخبير');
                  setShowContactModal(false);
                }}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg font-bold"
              >
                إرسال الطلب
              </button>
              <button
                onClick={() => setShowContactModal(false)}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
