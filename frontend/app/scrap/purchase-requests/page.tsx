'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getPurchaseRequests,
  SCRAP_TYPE_AR,
  METAL_TYPE_AR,
  SCRAP_CONDITION_AR,
  ScrapType,
  MetalType,
  PurchaseRequest,
} from '@/lib/api/scrap-marketplace';

const SCRAP_TYPE_ICONS: Record<ScrapType, string> = {
  ELECTRONICS: '📱',
  HOME_APPLIANCES: '🔌',
  COMPUTERS: '💻',
  PHONES: '📞',
  CABLES_WIRES: '🔗',
  MOTORS: '⚙️',
  BATTERIES: '🔋',
  METAL_SCRAP: '🔩',
  CAR_PARTS: '🚗',
  FURNITURE_PARTS: '🪑',
  WOOD: '🪵',
  PLASTIC: '♻️',
  TEXTILES: '👕',
  PAPER: '📄',
  GLASS: '🪟',
  CONSTRUCTION: '🏗️',
  INDUSTRIAL: '🏭',
  MEDICAL: '⚕️',
  OTHER: '📦',
};

export default function PurchaseRequestsPage() {
  const [requests, setRequests] = useState<PurchaseRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    scrapType: '' as ScrapType | '',
    metalType: '' as MetalType | '',
    governorate: '',
    status: 'ACTIVE',
    page: 1,
  });

  useEffect(() => {
    loadRequests();
  }, [filters]);

  const loadRequests = async () => {
    try {
      setLoading(true);
      const result = await getPurchaseRequests({
        scrapType: filters.scrapType || undefined,
        metalType: filters.metalType || undefined,
        governorate: filters.governorate || undefined,
        status: filters.status || undefined,
        page: filters.page,
        limit: 20,
      });
      setRequests(result.data?.requests || result.requests || []);
    } catch (error) {
      console.error('Error loading requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-indigo-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/scrap" className="text-white/80 hover:text-white mb-4 inline-block">
            &rarr; العودة لسوق التوالف
          </Link>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">🏭</span>
                <h1 className="text-4xl font-bold">طلبات الشراء B2B</h1>
              </div>
              <p className="text-xl opacity-90">
                طلبات شراء من المصانع وشركات التدوير - بيع بالجملة
              </p>
            </div>
            <Link
              href="/scrap/purchase-requests/create"
              className="bg-white text-indigo-600 px-6 py-3 rounded-lg font-bold hover:bg-indigo-50 transition"
            >
              + إنشاء طلب شراء
            </Link>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-indigo-800 text-white py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-center gap-8 text-center">
            <div>
              <div className="text-2xl font-bold">{requests.length}</div>
              <div className="text-sm opacity-80">طلب نشط</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {requests.reduce((sum, r) => sum + (r.offersCount || 0), 0)}
              </div>
              <div className="text-sm opacity-80">عرض مقدم</div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            <button
              onClick={() => setFilters((f) => ({ ...f, scrapType: '', page: 1 }))}
              className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                !filters.scrapType ? 'bg-indigo-600 text-white' : 'bg-gray-100 hover:bg-gray-200'
              }`}
            >
              الكل
            </button>
            {Object.entries(SCRAP_TYPE_AR).slice(0, 10).map(([key, label]) => (
              <button
                key={key}
                onClick={() =>
                  setFilters((f) => ({
                    ...f,
                    scrapType: f.scrapType === key ? '' : (key as ScrapType),
                    page: 1,
                  }))
                }
                className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition ${
                  filters.scrapType === key
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                <span>{SCRAP_TYPE_ICONS[key as ScrapType]}</span>
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Filters */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">تصفية النتائج</h3>

              {/* Metal Type */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  نوع المعدن
                </label>
                <select
                  value={filters.metalType}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, metalType: e.target.value as MetalType, page: 1 }))
                  }
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">الكل</option>
                  {Object.entries(METAL_TYPE_AR).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الحالة
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="ACTIVE">نشط</option>
                  <option value="">الكل</option>
                  <option value="FULFILLED">مكتمل</option>
                  <option value="EXPIRED">منتهي</option>
                </select>
              </div>

              <button
                onClick={() =>
                  setFilters({
                    scrapType: '',
                    metalType: '',
                    governorate: '',
                    status: 'ACTIVE',
                    page: 1,
                  })
                }
                className="w-full text-gray-500 text-sm hover:text-gray-700"
              >
                إعادة تعيين
              </button>
            </div>

            {/* CTA */}
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-2">هل أنت مصنع أو شركة تدوير؟</h3>
              <p className="text-sm opacity-90 mb-4">
                أنشئ طلب شراء للحصول على عروض من البائعين
              </p>
              <Link
                href="/scrap/purchase-requests/create"
                className="block text-center bg-white text-indigo-600 px-4 py-2 rounded-lg font-bold hover:bg-indigo-50 transition"
              >
                إنشاء طلب شراء
              </Link>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">
                {filters.scrapType
                  ? `طلبات شراء ${SCRAP_TYPE_AR[filters.scrapType]}`
                  : 'جميع طلبات الشراء'}
              </h2>
              <span className="text-gray-500">{requests.length} طلب</span>
            </div>

            {loading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="bg-white rounded-xl shadow-sm p-6 animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-2/3 mb-4" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
                    <div className="h-4 bg-gray-200 rounded w-1/3" />
                  </div>
                ))}
              </div>
            ) : requests.length > 0 ? (
              <div className="space-y-4">
                {requests.map((request) => (
                  <Link
                    key={request.id}
                    href={`/scrap/purchase-requests/${request.id}`}
                    className="block bg-white rounded-xl shadow-sm hover:shadow-lg transition p-6"
                  >
                    <div className="flex flex-col md:flex-row md:items-start gap-4">
                      {/* Icon */}
                      <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl flex-shrink-0">
                        {SCRAP_TYPE_ICONS[request.scrapType] || '📦'}
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <div>
                            <h3 className="font-bold text-lg">{request.title}</h3>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <span className="text-sm text-gray-500">
                                {SCRAP_TYPE_AR[request.scrapType]}
                              </span>
                              {request.metalType && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-sm text-gray-500">
                                    {METAL_TYPE_AR[request.metalType]}
                                  </span>
                                </>
                              )}
                              {request.governorate && (
                                <>
                                  <span className="text-gray-300">•</span>
                                  <span className="text-sm text-gray-500">{request.governorate}</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Status */}
                          <div>
                            {isExpired(request.expiresAt) ? (
                              <span className="bg-gray-100 text-gray-600 text-xs px-3 py-1 rounded-full">
                                منتهي
                              </span>
                            ) : (
                              <span className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full">
                                نشط
                              </span>
                            )}
                          </div>
                        </div>

                        {request.description && (
                          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {request.description}
                          </p>
                        )}

                        {/* Details Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {/* Quantity */}
                          <div>
                            <div className="text-gray-500">الكمية المطلوبة</div>
                            <div className="font-medium">
                              {request.minWeightKg && request.maxWeightKg
                                ? `${request.minWeightKg} - ${request.maxWeightKg} كجم`
                                : request.minWeightKg
                                ? `من ${request.minWeightKg} كجم`
                                : 'غير محدد'}
                            </div>
                          </div>

                          {/* Price */}
                          <div>
                            <div className="text-gray-500">السعر المعروض</div>
                            <div className="font-medium text-green-600">
                              {request.offeredPricePerKg
                                ? `${request.offeredPricePerKg} ج.م/كجم`
                                : request.offeredTotalPrice
                                ? `${request.offeredTotalPrice.toLocaleString()} ج.م`
                                : 'قابل للتفاوض'}
                            </div>
                          </div>

                          {/* Offers */}
                          <div>
                            <div className="text-gray-500">العروض</div>
                            <div className="font-medium">
                              {request.offersCount || 0} عرض
                            </div>
                          </div>

                          {/* Expires */}
                          <div>
                            <div className="text-gray-500">ينتهي في</div>
                            <div className="font-medium">
                              {request.expiresAt ? formatDate(request.expiresAt) : 'غير محدد'}
                            </div>
                          </div>
                        </div>

                        {/* Footer */}
                        <div className="mt-4 pt-4 border-t flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                              {request.buyer?.avatar ? (
                                <img
                                  src={request.buyer.avatar}
                                  alt=""
                                  className="w-full h-full rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-sm">👤</span>
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {request.buyer?.businessName || request.buyer?.fullName || 'مشتري'}
                              </div>
                              {request.buyer?.rating ? (
                                <div className="text-xs text-gray-500">
                                  ⭐ {request.buyer.rating.toFixed(1)}
                                </div>
                              ) : null}
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            {request.offersPickup && (
                              <span className="text-green-600 text-sm">🚛 يوفر التوصيل</span>
                            )}
                            <span className="text-indigo-600 font-medium">
                              قدم عرضك &larr;
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-white rounded-xl">
                <div className="text-6xl mb-4">📋</div>
                <h3 className="text-xl font-bold text-gray-700 mb-2">لا توجد طلبات</h3>
                <p className="text-gray-500 mb-4">لم نجد طلبات شراء تطابق معايير البحث</p>
                <Link
                  href="/scrap/purchase-requests/create"
                  className="inline-block bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700"
                >
                  إنشاء أول طلب
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
