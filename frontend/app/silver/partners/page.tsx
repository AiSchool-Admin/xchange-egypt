'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import apiClient from '@/lib/api/client';

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية',
  'المنوفية', 'الغربية', 'البحيرة', 'أسيوط', 'سوهاج',
];

export default function SilverPartnersPage() {
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    governorate: '',
    offersCertification: false,
    offersPickup: false,
  });

  useEffect(() => {
    fetchPartners();
  }, [filters]);

  const fetchPartners = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.governorate) params.set('governorate', filters.governorate);
      if (filters.offersCertification) params.set('offersCertification', 'true');
      if (filters.offersPickup) params.set('offersPickup', 'true');

      const res = await apiClient.get(`/silver/partners?${params}`);
      setPartners(res.data.data || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">محلات الفضة الشريكة</h1>
          <p className="text-gray-600">
            شبكة من الصاغة المعتمدين لفحص وتوثيق قطع الفضة
          </p>
        </div>

        {/* Services Info */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: '🔬', title: 'فحص النقاء', desc: 'اختبار دقيق لنقاء الفضة' },
            { icon: '📜', title: 'شهادة توثيق', desc: 'شهادة معتمدة للقطعة' },
            { icon: '📦', title: 'استلام القطع', desc: 'نقطة تسليم واستلام' },
            { icon: '🧹', title: 'تنظيف الفضة', desc: 'خدمة تنظيف احترافية' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-4 text-center">
              <span className="text-3xl">{s.icon}</span>
              <h3 className="font-bold mt-2">{s.title}</h3>
              <p className="text-sm text-gray-600">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <select
              value={filters.governorate}
              onChange={(e) => setFilters(prev => ({ ...prev, governorate: e.target.value }))}
              className="p-2 border rounded-lg"
            >
              <option value="">كل المحافظات</option>
              {GOVERNORATES.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.offersCertification}
                onChange={(e) => setFilters(prev => ({ ...prev, offersCertification: e.target.checked }))}
                className="w-4 h-4"
              />
              <span>يقدم التوثيق</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.offersPickup}
                onChange={(e) => setFilters(prev => ({ ...prev, offersPickup: e.target.checked }))}
                className="w-4 h-4"
              />
              <span>نقطة استلام</span>
            </label>
          </div>
        </div>

        {/* Partners List */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600"></div>
          </div>
        ) : partners.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h2 className="text-xl font-bold mb-2">لا توجد محلات</h2>
            <p className="text-gray-600">جرب تغيير الفلاتر للعثور على محلات</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partners.map((partner) => (
              <div key={partner.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Header */}
                <div className="bg-gray-600 text-white p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg">{partner.nameAr || partner.name}</h3>
                      <p className="text-gray-200 text-sm">{partner.governorate} - {partner.city}</p>
                    </div>
                    {partner.isVerified && (
                      <span className="bg-green-500 px-2 py-1 rounded text-xs">✓ موثق</span>
                    )}
                  </div>
                </div>

                {/* Services */}
                <div className="p-4 border-b">
                  <div className="flex flex-wrap gap-2">
                    {partner.offersCertification && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        🔬 فحص وتوثيق
                      </span>
                    )}
                    {partner.offersPickup && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        📦 نقطة استلام
                      </span>
                    )}
                    {partner.offersRepair && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded text-xs">
                        🔧 إصلاح
                      </span>
                    )}
                    {partner.offersCleaning && (
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
                        🧹 تنظيف
                      </span>
                    )}
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📍</span>
                    <span>{partner.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">📞</span>
                    <a href={`tel:${partner.phone}`} className="text-gray-600 hover:underline">
                      {partner.phone}
                    </a>
                  </div>
                  {partner.whatsapp && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">💬</span>
                      <a
                        href={`https://wa.me/${partner.whatsapp}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:underline"
                      >
                        واتساب
                      </a>
                    </div>
                  )}
                  {partner.workingHours && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500">🕒</span>
                      <span>{partner.workingHours}</span>
                    </div>
                  )}
                </div>

                {/* Rating & Fee */}
                <div className="p-4 border-t bg-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="font-bold">{partner.rating?.toFixed(1) || '0.0'}</span>
                    <span className="text-gray-500 text-sm">({partner.totalReviews || 0})</span>
                  </div>
                  {partner.offersCertification && (
                    <div className="text-left">
                      <p className="text-xs text-gray-500">رسوم الفحص</p>
                      <p className="font-bold text-gray-600">{partner.certificationFee} ج.م</p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="p-4 border-t flex gap-2">
                  <a
                    href={`tel:${partner.phone}`}
                    className="flex-1 py-2 text-center border border-gray-600 text-gray-600 rounded-lg hover:bg-gray-50"
                  >
                    اتصال
                  </a>
                  {partner.whatsapp && (
                    <a
                      href={`https://wa.me/${partner.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2 text-center bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      واتساب
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Become a Partner CTA */}
        <div className="bg-gray-600 rounded-lg p-8 mt-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-2">هل تملك محل فضة؟</h2>
          <p className="mb-4">انضم لشبكة شركاء Xchange واحصل على المزيد من العملاء</p>
          <Link
            href="/silver/partners/apply"
            className="inline-block px-6 py-3 bg-white text-gray-600 rounded-lg font-bold hover:bg-gray-100"
          >
            انضم الآن
          </Link>
        </div>
      </div>
    </div>
  );
}
