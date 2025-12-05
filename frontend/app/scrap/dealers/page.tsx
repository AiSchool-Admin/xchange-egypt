'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getScrapDealers,
  SCRAP_TYPE_AR,
  METAL_TYPE_AR,
  DEALER_TYPE_AR,
  ScrapType,
  MetalType,
  ScrapDealerType,
} from '@/lib/api/scrap-marketplace';

// Dealer type icons
const DEALER_TYPE_ICONS: Record<ScrapDealerType, string> = {
  INDIVIDUAL_COLLECTOR: '👤',
  SCRAP_DEALER: '🏪',
  RECYCLING_COMPANY: '♻️',
  REPAIR_TECHNICIAN: '🔧',
  FACTORY: '🏭',
  EXPORT_COMPANY: '🚢',
};

export default function ScrapDealersPage() {
  const [dealers, setDealers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    dealerType: '' as ScrapDealerType | '',
    governorate: '',
    specialization: '' as ScrapType | '',
    offersPickup: false,
  });

  useEffect(() => {
    loadDealers();
  }, [filters]);

  const loadDealers = async () => {
    try {
      setLoading(true);
      const result = await getScrapDealers({
        dealerType: filters.dealerType || undefined,
        governorate: filters.governorate || undefined,
        specialization: filters.specialization || undefined,
        offersPickup: filters.offersPickup || undefined,
      });
      setDealers(result.dealers || []);
    } catch (error) {
      console.error('Error loading dealers:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-amber-600 to-orange-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/scrap" className="text-white/80 hover:text-white mb-4 inline-block">
            &rarr; العودة لسوق التوالف
          </Link>
          <h1 className="text-4xl font-bold mb-4">تجار التوالف المعتمدين</h1>
          <p className="text-xl opacity-90">
            تواصل مع تجار الخردة وشركات إعادة التدوير المعتمدين
          </p>
        </div>
      </div>

      {/* Dealer Types */}
      <div className="bg-white border-b py-6">
        <div className="container mx-auto px-4">
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button
              onClick={() => setFilters((f) => ({ ...f, dealerType: '' }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                !filters.dealerType ? 'bg-orange-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            {Object.entries(DEALER_TYPE_AR).map(([key, label]) => (
              <button
                key={key}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    dealerType: f.dealerType === key ? '' : (key as ScrapDealerType),
                  }))
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                  filters.dealerType === key
                    ? 'bg-orange-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span>{DEALER_TYPE_ICONS[key as ScrapDealerType]}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar - Filters */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">تصفية النتائج</h3>

              {/* Specialization Filter */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">التخصص</label>
                <select
                  value={filters.specialization}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, specialization: e.target.value as ScrapType }))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">الكل</option>
                  {Object.entries(SCRAP_TYPE_AR).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Pickup Service */}
              <div className="flex items-center gap-3 mb-4">
                <input
                  type="checkbox"
                  id="offersPickup"
                  checked={filters.offersPickup}
                  onChange={(e) => setFilters((f) => ({ ...f, offersPickup: e.target.checked }))}
                  className="w-5 h-5 text-orange-600"
                />
                <label htmlFor="offersPickup" className="font-medium">
                  يوفر خدمة التوصيل
                </label>
              </div>

              {/* Reset */}
              <button
                onClick={() =>
                  setFilters({
                    dealerType: '',
                    governorate: '',
                    specialization: '',
                    offersPickup: false,
                  })
                }
                className="w-full text-gray-500 text-sm hover:text-gray-700"
              >
                إعادة تعيين الفلاتر
              </button>
            </div>

            {/* Become a Dealer CTA */}
            <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">انضم إلينا</h3>
              <p className="text-sm opacity-90 mb-4">
                هل أنت تاجر خردة أو شركة إعادة تدوير؟ سجّل الآن للحصول على شارة التوثيق
              </p>
              <Link
                href="/scrap/dealers/register"
                className="block text-center bg-white text-green-600 px-4 py-2 rounded-lg font-bold hover:bg-green-50 transition"
              >
                سجّل كتاجر
              </Link>
            </div>
          </div>

          {/* Main Content - Dealers Grid */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {filters.dealerType ? DEALER_TYPE_AR[filters.dealerType] : 'جميع التجار'}
              </h2>
              <span className="text-gray-500">{dealers.length} تاجر</span>
            </div>

            {loading ? (
              <div className="grid md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm animate-pulse p-6">
                    <div className="flex gap-4">
                      <div className="w-16 h-16 bg-gray-200 rounded-full" />
                      <div className="flex-1 space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : dealers.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-6">
                {dealers.map((dealer) => (
                  <Link
                    key={dealer.id}
                    href={`/scrap/dealers/${dealer.id}`}
                    className="bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6"
                  >
                    <div className="flex gap-4">
                      {/* Avatar */}
                      <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center text-2xl">
                        {dealer.user?.avatar ? (
                          <img
                            src={dealer.user.avatar}
                            alt={dealer.businessName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          DEALER_TYPE_ICONS[dealer.dealerType as ScrapDealerType]
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-bold text-lg">
                            {dealer.businessName || dealer.user?.fullName}
                          </h3>
                          {dealer.isVerified && (
                            <span className="text-green-500" title="موثق">
                              ✓
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mb-2">
                          {DEALER_TYPE_AR[dealer.dealerType as ScrapDealerType]}
                          {dealer.governorate && ` • ${dealer.governorate}`}
                        </p>

                        {/* Specializations */}
                        {dealer.specializations?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {dealer.specializations.slice(0, 3).map((spec: ScrapType) => (
                              <span
                                key={spec}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                              >
                                {SCRAP_TYPE_AR[spec]}
                              </span>
                            ))}
                            {dealer.specializations.length > 3 && (
                              <span className="text-xs text-gray-400">
                                +{dealer.specializations.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        {/* Stats */}
                        <div className="flex gap-4 text-sm text-gray-500">
                          {dealer.rating > 0 && (
                            <span>⭐ {dealer.rating.toFixed(1)}</span>
                          )}
                          {dealer.totalTransactions > 0 && (
                            <span>{dealer.totalTransactions} معاملة</span>
                          )}
                          {dealer.offersPickup && (
                            <span className="text-green-600">🚛 توصيل</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا يوجد تجار</h3>
                <p className="text-gray-500 mb-4">
                  لم نجد تجار يطابقون معايير البحث
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
