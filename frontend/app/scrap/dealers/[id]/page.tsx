'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  getDealerDetails,
  SCRAP_TYPE_AR,
  METAL_TYPE_AR,
  DEALER_TYPE_AR,
  ScrapType,
  MetalType,
  ScrapDealerType,
} from '@/lib/api/scrap-marketplace';

const DEALER_TYPE_ICONS: Record<ScrapDealerType, string> = {
  INDIVIDUAL_COLLECTOR: '👤',
  SCRAP_DEALER: '🏪',
  RECYCLING_COMPANY: '♻️',
  REPAIR_TECHNICIAN: '🔧',
  FACTORY: '🏭',
  EXPORT_COMPANY: '🚢',
};

export default function DealerDetailPage() {
  const params = useParams();
  const [dealer, setDealer] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadDealer(params.id as string);
    }
  }, [params.id]);

  const loadDealer = async (id: string) => {
    try {
      setLoading(true);
      const result = await getDealerDetails(id);
      setDealer(result.data || result);
    } catch (error) {
      console.error('Error loading dealer:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="animate-spin w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-xl font-bold text-gray-700 mb-2">التاجر غير موجود</h2>
          <Link
            href="/scrap/dealers"
            className="inline-block mt-4 bg-orange-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            العودة للتجار
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-amber-600 to-orange-600 text-white py-12">
        <div className="container mx-auto px-4">
          <Link href="/scrap/dealers" className="text-white/80 hover:text-white mb-4 inline-block">
            &rarr; العودة للتجار
          </Link>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Avatar */}
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center">
              {dealer.user?.avatar ? (
                <img
                  src={dealer.user.avatar}
                  alt={dealer.businessName}
                  className="w-full h-full rounded-2xl object-cover"
                />
              ) : (
                <span className="text-5xl">
                  {DEALER_TYPE_ICONS[dealer.dealerType as ScrapDealerType] || '🏪'}
                </span>
              )}
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">
                  {dealer.businessName || dealer.user?.fullName || 'تاجر'}
                </h1>
                {dealer.isVerified && (
                  <span className="bg-green-500 text-white text-sm px-3 py-1 rounded-full">
                    ✓ موثق
                  </span>
                )}
              </div>
              <p className="text-xl opacity-90 mb-2">
                {DEALER_TYPE_AR[dealer.dealerType as ScrapDealerType]}
              </p>
              <div className="flex items-center gap-4 opacity-80">
                {dealer.governorate && (
                  <span className="flex items-center gap-1">
                    📍 {dealer.city && `${dealer.city}، `}
                    {dealer.governorate}
                  </span>
                )}
                {dealer.rating > 0 && (
                  <span className="flex items-center gap-1">
                    ⭐ {dealer.rating.toFixed(1)} ({dealer.totalReviews || 0} تقييم)
                  </span>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="flex gap-6 text-center">
              <div className="bg-white/20 rounded-xl px-6 py-4">
                <div className="text-3xl font-bold">{dealer.totalDeals || 0}</div>
                <div className="text-sm opacity-80">صفقة</div>
              </div>
              <div className="bg-white/20 rounded-xl px-6 py-4">
                <div className="text-3xl font-bold">{dealer.totalTransactions || 0}</div>
                <div className="text-sm opacity-80">معاملة</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Specializations */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">التخصصات</h2>
              <div className="flex flex-wrap gap-3">
                {dealer.specializations?.map((spec: ScrapType) => (
                  <span
                    key={spec}
                    className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-medium"
                  >
                    {SCRAP_TYPE_AR[spec]}
                  </span>
                ))}
              </div>

              {dealer.acceptedMetals?.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-3">المعادن المقبولة</h3>
                  <div className="flex flex-wrap gap-2">
                    {dealer.acceptedMetals.map((metal: MetalType) => (
                      <span
                        key={metal}
                        className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                      >
                        {METAL_TYPE_AR[metal]}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Quantity Requirements */}
            {(dealer.minWeightKg || dealer.maxWeightKg) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">متطلبات الكمية</h2>
                <div className="grid grid-cols-2 gap-4">
                  {dealer.minWeightKg && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">الحد الأدنى</div>
                      <div className="text-xl font-bold">{dealer.minWeightKg} كجم</div>
                    </div>
                  )}
                  {dealer.maxWeightKg && (
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-500 mb-1">الحد الأقصى</div>
                      <div className="text-xl font-bold">{dealer.maxWeightKg} كجم</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Price List */}
            {dealer.priceList && Object.keys(dealer.priceList).length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">قائمة الأسعار</h2>
                <div className="space-y-2">
                  {Object.entries(dealer.priceList).map(([key, price]) => (
                    <div
                      key={key}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <span>{METAL_TYPE_AR[key as MetalType] || SCRAP_TYPE_AR[key as ScrapType] || key}</span>
                      <span className="font-bold text-green-600">{price as number} ج.م/كجم</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location */}
            {dealer.address && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">الموقع</h2>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">📍</span>
                  <div>
                    <p className="font-medium">{dealer.address}</p>
                    <p className="text-gray-500">
                      {dealer.city && `${dealer.city}، `}
                      {dealer.governorate}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Contact Card */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold text-lg mb-4">تواصل مع التاجر</h3>

              <div className="space-y-3">
                {dealer.user?.phone && (
                  <a
                    href={`tel:${dealer.user.phone}`}
                    className="flex items-center justify-center gap-2 w-full bg-orange-600 text-white py-3 rounded-lg font-bold hover:bg-orange-700 transition"
                  >
                    <span>📞</span>
                    <span>اتصل الآن</span>
                  </a>
                )}

                {dealer.user?.phone && (
                  <a
                    href={`https://wa.me/${dealer.user.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                      `مرحباً، أريد البيع لكم من منصة XChange`
                    )}`}
                    target="_blank"
                    className="flex items-center justify-center gap-2 w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition"
                  >
                    <span>📱</span>
                    <span>واتساب</span>
                  </a>
                )}

                <Link
                  href={`/scrap/chat/${dealer.id}`}
                  className="flex items-center justify-center gap-2 w-full bg-blue-500 text-white py-3 rounded-lg font-bold hover:bg-blue-600 transition"
                >
                  <span>💬</span>
                  <span>محادثة مباشرة</span>
                </Link>

                <Link
                  href={`/scrap/sell?dealer=${dealer.id}`}
                  className="flex items-center justify-center gap-2 w-full border-2 border-orange-600 text-orange-600 py-3 rounded-lg font-bold hover:bg-orange-50 transition"
                >
                  <span>📦</span>
                  <span>أعرض عليه</span>
                </Link>
              </div>
            </div>

            {/* Pickup Service */}
            {dealer.offersPickup && (
              <div className="bg-green-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🚛</span>
                  <h3 className="font-bold text-lg text-green-800">خدمة التوصيل متاحة</h3>
                </div>
                <div className="space-y-2 text-sm text-green-700">
                  {dealer.pickupFee !== null && (
                    <p>
                      رسوم التوصيل:{' '}
                      <strong>
                        {dealer.pickupFee === 0 ? 'مجاني' : `${dealer.pickupFee} ج.م`}
                      </strong>
                    </p>
                  )}
                  {dealer.pickupRadiusKm && (
                    <p>
                      نطاق التوصيل: <strong>{dealer.pickupRadiusKm} كم</strong>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Verification */}
            {dealer.isVerified && (
              <div className="bg-blue-50 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">✅</span>
                  <h3 className="font-bold text-lg text-blue-800">تاجر موثق</h3>
                </div>
                <p className="text-sm text-blue-700">
                  تم التحقق من بيانات هذا التاجر من قبل فريق XChange
                </p>
              </div>
            )}

            {/* Documents */}
            {(dealer.commercialRegNo || dealer.taxCardNo || dealer.recyclingLicenseNo) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold text-lg mb-4">المستندات</h3>
                <div className="space-y-2 text-sm">
                  {dealer.commercialRegNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">السجل التجاري</span>
                      <span className="font-medium">{dealer.commercialRegNo}</span>
                    </div>
                  )}
                  {dealer.taxCardNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">البطاقة الضريبية</span>
                      <span className="font-medium">{dealer.taxCardNo}</span>
                    </div>
                  )}
                  {dealer.recyclingLicenseNo && (
                    <div className="flex justify-between">
                      <span className="text-gray-500">رخصة التدوير</span>
                      <span className="font-medium">{dealer.recyclingLicenseNo}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Member Since */}
            <div className="bg-gray-100 rounded-xl p-4 text-center text-sm text-gray-500">
              عضو منذ{' '}
              {new Date(dealer.createdAt).toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
