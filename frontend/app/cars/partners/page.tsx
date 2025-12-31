'use client';

/**
 * Car Inspection Partners Page
 * صفحة مراكز فحص السيارات
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getInspectionPartners, InspectionPartner } from '@/lib/api/cars';

const governorates = ['الكل', 'القاهرة', 'الجيزة', 'الإسكندرية', 'الغربية', 'الدقهلية'];
const certificationLevels = [
  { value: '', label: 'جميع المستويات' },
  { value: 'PLATINUM', label: 'بلاتيني', color: 'bg-purple-100 text-purple-800' },
  { value: 'GOLD', label: 'ذهبي', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'SILVER', label: 'فضي', color: 'bg-gray-200 text-gray-800' },
];

export default function PartnersPage() {
  const [partners, setPartners] = useState<InspectionPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGovernorate, setSelectedGovernorate] = useState('الكل');
  const [selectedCertification, setSelectedCertification] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'reviews'>('rating');

  // Fetch partners from API
  const fetchPartners = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getInspectionPartners(
        selectedGovernorate !== 'الكل' ? { governorate: selectedGovernorate } : {}
      );
      const data = response.data?.partners || response.data || [];
      setPartners(data);
    } catch (err: any) {
      console.error('Error fetching partners:', err);
      setError(err.response?.data?.message || 'حدث خطأ في تحميل البيانات');
    } finally {
      setLoading(false);
    }
  }, [selectedGovernorate]);

  useEffect(() => {
    fetchPartners();
  }, [fetchPartners]);

  // Filter and sort partners
  const filteredPartners = partners
    .filter(p => {
      if (selectedGovernorate !== 'الكل' && p.governorate !== selectedGovernorate) return false;
      if (selectedCertification && p.certification_level !== selectedCertification) return false;
      if (searchQuery && !p.name.includes(searchQuery) && !p.city.includes(searchQuery)) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'price') return a.inspection_price - b.inspection_price;
      if (sortBy === 'reviews') return b.reviews_count - a.reviews_count;
      return 0;
    });

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const getCertificationBadge = (level: string) => {
    const cert = certificationLevels.find(c => c.value === level);
    return cert || { label: level, color: 'bg-gray-100 text-gray-800' };
  };

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    return (
      <div className="flex items-center gap-0.5">
        {[...Array(fullStars)].map((_, i) => (
          <svg key={`full-${i}`} className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
        {hasHalfStar && (
          <svg className="w-4 h-4 text-yellow-400 fill-current" viewBox="0 0 20 20">
            <defs>
              <linearGradient id="halfGradient">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="#d1d5db" />
              </linearGradient>
            </defs>
            <path fill="url(#halfGradient)" d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <svg key={`empty-${i}`} className="w-4 h-4 text-gray-300 fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-orange-500 via-red-500 to-pink-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h1 className="text-4xl font-bold">مراكز فحص السيارات المعتمدة</h1>
            </div>
            <p className="text-xl text-orange-100 max-w-2xl mx-auto mb-6">
              شبكة من مراكز الفحص المعتمدة لضمان جودة وسلامة سيارتك
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/cars"
                className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors"
              >
                تصفح السيارات
              </Link>
              <Link
                href="/cars/sell"
                className="bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-800 transition-colors border border-orange-400"
              >
                بيع سيارتك
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Benefits Section */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">فحص موثوق</h3>
              <p className="text-sm text-gray-600">تقارير معتمدة ودقيقة</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">سريع</h3>
              <p className="text-sm text-gray-600">نتائج خلال ساعة واحدة</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">منتشرون</h3>
              <p className="text-sm text-gray-600">في جميع أنحاء مصر</p>
            </div>
            <div className="text-center">
              <div className="w-14 h-14 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-semibold mb-1">أسعار مناسبة</h3>
              <p className="text-sm text-gray-600">تبدأ من 350 جنيه</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">البحث</label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="اسم المركز أو المدينة..."
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>

            {/* Governorate */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">المحافظة</label>
              <select
                value={selectedGovernorate}
                onChange={(e) => setSelectedGovernorate(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                {governorates.map(gov => (
                  <option key={gov} value={gov}>{gov}</option>
                ))}
              </select>
            </div>

            {/* Certification Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">مستوى الاعتماد</label>
              <select
                value={selectedCertification}
                onChange={(e) => setSelectedCertification(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                {certificationLevels.map(level => (
                  <option key={level.value} value={level.value}>{level.label}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">ترتيب حسب</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'rating' | 'price' | 'reviews')}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              >
                <option value="rating">التقييم</option>
                <option value="price">السعر (الأقل)</option>
                <option value="reviews">عدد التقييمات</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <h2 className="text-xl font-bold">
            {loading ? 'جاري التحميل...' : `${filteredPartners.length} مركز فحص متاح`}
          </h2>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري تحميل مراكز الفحص...</p>
          </div>
        ) : error ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">حدث خطأ</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchPartners}
              className="text-orange-600 hover:text-orange-800 font-medium"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : (
        /* Partners Grid */
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPartners.map((partner) => {
            const certBadge = getCertificationBadge(partner.certification_level);

            return (
              <div key={partner.id} className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-shadow">
                {/* Header */}
                <div className="bg-gradient-to-l from-orange-500 to-red-500 p-4 text-white">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{partner.name}</h3>
                      <p className="text-sm text-orange-100">{partner.name_en}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${certBadge.color}`}>
                      {certBadge.label}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4">
                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    {renderStars(partner.rating)}
                    <span className="font-bold">{partner.rating}</span>
                    <span className="text-sm text-gray-500">({partner.reviews_count} تقييم)</span>
                  </div>

                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 line-clamp-2">{partner.description}</p>

                  {/* Location */}
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    </svg>
                    <span>{partner.address}، {partner.city}</span>
                  </div>

                  {/* Working Hours */}
                  <div className="flex items-start gap-2 text-sm text-gray-600 mb-4">
                    <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{partner.working_hours}</span>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {partner.services.slice(0, 4).map((service, idx) => (
                        <span key={idx} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                          {service}
                        </span>
                      ))}
                      {partner.services.length > 4 && (
                        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                          +{partner.services.length - 4}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between py-3 border-t">
                    <div>
                      <p className="text-xs text-gray-500">سعر الفحص</p>
                      <p className="text-xl font-bold text-orange-600">{formatPrice(partner.inspection_price)} جنيه</p>
                    </div>
                    <Link
                      href={`/cars/partners/${partner.id}`}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                    >
                      احجز الآن
                    </Link>
                  </div>

                  {/* Contact */}
                  <div className="flex gap-2 pt-3 border-t">
                    <a
                      href={`tel:${partner.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      اتصل
                    </a>
                    {partner.website && (
                      <a
                        href={partner.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                        الموقع
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        )}

        {filteredPartners.length === 0 && !loading && !error && (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">لا توجد مراكز مطابقة</h3>
            <p className="text-gray-600">جرب تغيير معايير البحث</p>
          </div>
        )}

        {/* Become a Partner */}
        <div className="bg-gradient-to-l from-orange-500 to-red-500 rounded-xl p-8 mt-12 text-white">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">هل لديك مركز فحص سيارات؟</h2>
            <p className="text-orange-100 mb-6">
              انضم لشبكة مراكز الفحص المعتمدة واحصل على عملاء جدد من خلال منصتنا
            </p>
            <button className="bg-white text-orange-600 px-8 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
              انضم كشريك
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
