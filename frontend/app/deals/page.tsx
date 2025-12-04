'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getActiveDeals, getUpcomingDeals, claimDeal, seedDemoDeals, FlashDeal } from '@/lib/api/deals';

// Countdown Timer Component
function CountdownTimer({ endTime }: { endTime: string }) {
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const diff = end - now;

      if (diff <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        return;
      }

      setTimeLeft({
        hours: Math.floor(diff / (1000 * 60 * 60)),
        minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((diff % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime]);

  return (
    <div className="flex gap-1 text-center">
      <div className="bg-red-600 text-white px-2 py-1 rounded">
        <div className="text-lg font-bold">{String(timeLeft.hours).padStart(2, '0')}</div>
        <div className="text-[10px]">ساعة</div>
      </div>
      <div className="bg-red-600 text-white px-2 py-1 rounded">
        <div className="text-lg font-bold">{String(timeLeft.minutes).padStart(2, '0')}</div>
        <div className="text-[10px]">دقيقة</div>
      </div>
      <div className="bg-red-600 text-white px-2 py-1 rounded">
        <div className="text-lg font-bold">{String(timeLeft.seconds).padStart(2, '0')}</div>
        <div className="text-[10px]">ثانية</div>
      </div>
    </div>
  );
}

// Deal Card Component
function DealCard({ deal, onClaim }: { deal: FlashDeal; onClaim: (id: string) => void }) {
  const progress = ((deal.soldQuantity + deal.reservedQuantity) / deal.totalQuantity) * 100;
  const images = deal.listing?.item?.images || [];
  const itemTitle = deal.listing?.item?.title || deal.title;

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all">
      {/* Badge */}
      <div className="bg-gradient-to-l from-red-500 to-orange-500 text-white py-2 px-4 flex items-center justify-between">
        <span className="font-bold flex items-center gap-1">
          <span className="text-xl">&#9889;</span> عرض خاص
        </span>
        <span className="bg-white/20 px-2 py-0.5 rounded-full text-sm">
          -{Math.round(deal.discountPercent)}%
        </span>
      </div>

      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {images[0] ? (
          <img
            src={images[0]}
            alt={deal.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
            &#128293;
          </div>
        )}
        <div className="absolute top-3 left-3">
          <CountdownTimer endTime={deal.endTime} />
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-bold text-gray-800 mb-2 line-clamp-2">{itemTitle}</h3>

        {/* Price */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-2xl font-bold text-red-600">
            {deal.dealPrice?.toLocaleString('ar-EG') || '0'} ج.م
          </span>
          <span className="text-gray-400 line-through text-sm">
            {deal.originalPrice?.toLocaleString('ar-EG') || '0'} ج.م
          </span>
        </div>

        {/* Progress */}
        <div className="mb-3">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>تم الحجز: {deal.soldQuantity || 0}</span>
            <span>المتبقي: {deal.availableQuantity || 0}</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-l from-red-500 to-orange-500 rounded-full transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Action */}
        <button
          onClick={() => onClaim(deal.id)}
          disabled={deal.availableQuantity === 0}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
            deal.availableQuantity > 0
              ? 'bg-gradient-to-l from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600'
              : 'bg-gray-300 cursor-not-allowed'
          }`}
        >
          {deal.availableQuantity > 0 ? 'احجز الآن!' : 'نفذت الكمية'}
        </button>
      </div>
    </div>
  );
}

export default function DealsPage() {
  const { user } = useAuth();
  const [activeDeals, setActiveDeals] = useState<FlashDeal[]>([]);
  const [upcomingDeals, setUpcomingDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const [activeRes, upcomingRes] = await Promise.all([
        getActiveDeals().catch(() => ({ success: false, data: { deals: [] } })),
        getUpcomingDeals().catch(() => ({ success: false, data: { deals: [] } })),
      ]);

      if (activeRes.success) setActiveDeals(activeRes.data.deals);
      if (upcomingRes.success) setUpcomingDeals(upcomingRes.data.deals);
    } catch (error) {
      console.error('Error fetching deals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    try {
      setSeeding(true);
      const result = await seedDemoDeals();
      if (result.success) {
        alert('تم إنشاء عروض تجريبية بنجاح!');
        fetchDeals();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء إنشاء العروض');
    } finally {
      setSeeding(false);
    }
  };

  const handleClaim = async (dealId: string) => {
    if (!user) {
      window.location.href = '/login?redirect=/deals';
      return;
    }

    try {
      setClaiming(dealId);
      const result = await claimDeal(dealId);
      if (result.success) {
        alert('تم حجز العرض بنجاح! يرجى إتمام الدفع خلال 15 دقيقة.');
        fetchDeals();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الحجز');
    } finally {
      setClaiming(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-red-600 via-orange-500 to-yellow-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-3 flex items-center justify-center gap-3">
            <span className="text-5xl">&#9889;</span>
            عروض فلاش
          </h1>
          <p className="text-xl text-white/90">عروض محدودة - اغتنم الفرصة قبل النفاذ!</p>
        </div>
      </section>

      {/* Active Deals */}
      <section className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-2xl">
            &#128293;
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">العروض النشطة الآن</h2>
            <p className="text-gray-500">سارع بالحجز قبل انتهاء العرض</p>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-12 bg-gray-200" />
                <div className="h-48 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4" />
                  <div className="h-8 bg-gray-200 rounded w-1/2" />
                  <div className="h-10 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : activeDeals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {activeDeals.map((deal) => (
              <DealCard key={deal.id} deal={deal} onClaim={handleClaim} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-2xl">
            <span className="text-6xl mb-4 block">&#128564;</span>
            <h3 className="text-xl font-bold text-gray-800 mb-2">لا توجد عروض نشطة حالياً</h3>
            <p className="text-gray-500 mb-6">تابعنا للحصول على أحدث العروض</p>

            {/* Demo Data Button */}
            <button
              onClick={handleSeedDemo}
              disabled={seeding}
              className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-50"
            >
              {seeding ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  جاري الإنشاء...
                </span>
              ) : (
                '🎯 إنشاء عروض تجريبية للاختبار'
              )}
            </button>
            <p className="text-gray-400 text-sm mt-3">اضغط هنا لإنشاء بيانات تجريبية</p>
          </div>
        )}
      </section>

      {/* Upcoming Deals */}
      {upcomingDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-2xl">
              &#128337;
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-800">عروض قادمة</h2>
              <p className="text-gray-500">جهّز نفسك لهذه العروض</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {upcomingDeals.map((deal) => {
              const images = deal.listing?.item?.images || [];
              const itemTitle = deal.listing?.item?.title || deal.title;
              return (
                <div
                  key={deal.id}
                  className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 opacity-75"
                >
                  <div className="bg-gradient-to-l from-blue-500 to-indigo-500 text-white py-2 px-4">
                    <span className="font-bold">قريباً</span>
                  </div>
                  <div className="h-48 bg-gray-100">
                    {images[0] ? (
                      <img
                        src={images[0]}
                        alt={deal.title}
                        className="w-full h-full object-cover grayscale"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
                        &#128337;
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-800 mb-2">{itemTitle}</h3>
                    <p className="text-gray-500 text-sm">
                      يبدأ: {new Date(deal.startTime).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* How it Works */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">كيف تعمل عروض فلاش؟</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#128276;
              </div>
              <h3 className="font-bold mb-2">1. تابع العروض</h3>
              <p className="text-gray-500 text-sm">راقب العروض النشطة والقادمة</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#9889;
              </div>
              <h3 className="font-bold mb-2">2. احجز بسرعة</h3>
              <p className="text-gray-500 text-sm">الكميات محدودة جداً</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#128179;
              </div>
              <h3 className="font-bold mb-2">3. ادفع خلال 15 دقيقة</h3>
              <p className="text-gray-500 text-sm">أتمم الدفع لتأكيد الحجز</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#127881;
              </div>
              <h3 className="font-bold mb-2">4. استلم بأفضل سعر</h3>
              <p className="text-gray-500 text-sm">وفّر حتى 70% من السعر</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
