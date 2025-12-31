'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getPlans, getMySubscription, subscribe, SubscriptionPlan, UserSubscription } from '@/lib/api/subscriptions';

const TIER_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  FREE: { bg: 'bg-gray-100', text: 'text-gray-600', border: 'border-gray-200', gradient: 'from-gray-400 to-gray-500' },
  BASIC: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-200', gradient: 'from-blue-400 to-blue-500' },
  PROFESSIONAL: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-200', gradient: 'from-purple-400 to-purple-600' },
  BUSINESS: { bg: 'bg-amber-100', text: 'text-amber-600', border: 'border-amber-200', gradient: 'from-amber-400 to-amber-600' },
  ENTERPRISE: { bg: 'bg-gradient-to-br from-amber-200 to-yellow-200', text: 'text-amber-700', border: 'border-amber-300', gradient: 'from-amber-500 to-yellow-500' },
};

const TIER_ICONS: Record<string, string> = {
  FREE: '🌟',
  BASIC: '⭐',
  PROFESSIONAL: '💎',
  BUSINESS: '👑',
  ENTERPRISE: '🏆',
};

function PlanCard({
  plan,
  currentTier,
  billingCycle,
  onSubscribe,
  loading,
}: {
  plan: SubscriptionPlan;
  currentTier?: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  onSubscribe: (planId: string) => void;
  loading: boolean;
}) {
  const colors = TIER_COLORS[plan.tier] || TIER_COLORS.FREE;
  const price = billingCycle === 'MONTHLY' ? plan.monthlyPrice : plan.yearlyPrice;
  const monthlyEquivalent = billingCycle === 'YEARLY' ? Math.round(plan.yearlyPrice / 12) : plan.monthlyPrice;
  const isCurrent = currentTier === plan.tier;
  const isPopular = plan.tier === 'PROFESSIONAL';

  return (
    <div
      className={`relative bg-white rounded-2xl shadow-lg overflow-hidden border-2 ${
        isPopular ? 'border-purple-400 ring-2 ring-purple-200' : colors.border
      } hover:shadow-xl transition-all`}
    >
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute top-0 right-0 bg-purple-500 text-white px-4 py-1 text-sm font-bold rounded-bl-xl">
          الأكثر شعبية
        </div>
      )}

      {/* Header */}
      <div className={`p-6 ${colors.bg}`}>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl">{TIER_ICONS[plan.tier]}</span>
          <div>
            <h3 className={`text-xl font-bold ${colors.text}`}>{plan.nameAr}</h3>
            <p className="text-gray-500 text-sm">{plan.descriptionAr}</p>
          </div>
        </div>
      </div>

      {/* Price */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-end gap-2">
          <span className="text-4xl font-bold text-gray-800">
            {price === 0 ? 'مجاني' : `${price.toLocaleString('ar-EG')}`}
          </span>
          {price > 0 && (
            <span className="text-gray-500 mb-1">
              ج.م / {billingCycle === 'MONTHLY' ? 'شهر' : 'سنة'}
            </span>
          )}
        </div>
        {billingCycle === 'YEARLY' && price > 0 && (
          <p className="text-green-600 text-sm mt-1">
            &#10003; وفّر {Math.round(((plan.monthlyPrice * 12 - plan.yearlyPrice) / (plan.monthlyPrice * 12)) * 100)}% - يعادل {monthlyEquivalent} ج.م/شهر
          </p>
        )}
      </div>

      {/* Features */}
      <div className="p-6">
        <ul className="space-y-3">
          <li className="flex items-center gap-2">
            <span className="text-green-500">&#10003;</span>
            <span>{plan.maxListings === -1 ? 'إعلانات غير محدودة' : `${plan.maxListings} إعلان`}</span>
          </li>
          <li className="flex items-center gap-2">
            <span className="text-green-500">&#10003;</span>
            <span>{plan.maxImages} صورة لكل إعلان</span>
          </li>
          {plan.featuredListings > 0 && (
            <li className="flex items-center gap-2">
              <span className="text-green-500">&#10003;</span>
              <span>{plan.featuredListings} إعلان مميز مجاني</span>
            </li>
          )}
          {plan.boostCredits > 0 && (
            <li className="flex items-center gap-2">
              <span className="text-green-500">&#10003;</span>
              <span>{plan.boostCredits} رصيد تعزيز شهري</span>
            </li>
          )}
          {plan.xcoinMultiplier > 1 && (
            <li className="flex items-center gap-2">
              <span className="text-amber-500">&#128176;</span>
              <span>مضاعف XCoin: {plan.xcoinMultiplier}x</span>
            </li>
          )}
          {plan.monthlyXcoin > 0 && (
            <li className="flex items-center gap-2">
              <span className="text-amber-500">&#128176;</span>
              <span>{plan.monthlyXcoin} XCoin مجاني شهرياً</span>
            </li>
          )}
          {plan.prioritySupport && (
            <li className="flex items-center gap-2">
              <span className="text-blue-500">&#128222;</span>
              <span>دعم فني أولوية</span>
            </li>
          )}
          {plan.analyticsAccess && (
            <li className="flex items-center gap-2">
              <span className="text-purple-500">&#128200;</span>
              <span>تحليلات متقدمة</span>
            </li>
          )}
          {plan.apiAccess && (
            <li className="flex items-center gap-2">
              <span className="text-gray-500">&#128187;</span>
              <span>وصول API</span>
            </li>
          )}
        </ul>
      </div>

      {/* Action */}
      <div className="p-6 pt-0">
        <button
          onClick={() => onSubscribe(plan.id)}
          disabled={isCurrent || loading}
          className={`w-full py-3 rounded-xl font-bold text-white transition-all ${
            isCurrent
              ? 'bg-gray-300 cursor-not-allowed'
              : `bg-gradient-to-l ${colors.gradient} hover:opacity-90`
          }`}
        >
          {isCurrent ? 'خطتك الحالية' : plan.tier === 'FREE' ? 'البدء مجاناً' : 'اشترك الآن'}
        </button>
      </div>
    </div>
  );
}

export default function PremiumPage() {
  const { user } = useAuth();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [billingCycle, setBillingCycle] = useState<'MONTHLY' | 'YEARLY'>('MONTHLY');
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, subRes] = await Promise.all([
        getPlans().catch(() => ({ success: false, data: { plans: [] } })),
        user ? getMySubscription().catch(() => ({ success: false, data: null })) : Promise.resolve({ success: false, data: null }),
      ]);

      if (plansRes.success) setPlans(plansRes.data.plans);
      if (subRes.success && subRes.data) setSubscription(subRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (planId: string) => {
    if (!user) {
      window.location.href = '/login?redirect=/premium';
      return;
    }

    try {
      setSubscribing(true);
      const result = await subscribe(planId, billingCycle);
      if (result.success) {
        alert('تم الاشتراك بنجاح!');
        fetchData();
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'حدث خطأ أثناء الاشتراك');
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero */}
      <section className="bg-gradient-to-l from-purple-600 via-indigo-500 to-blue-500 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">
            <span className="text-5xl">&#128142;</span> خطط Premium
          </h1>
          <p className="text-xl text-white/90 mb-8">اختر الخطة المناسبة لاحتياجاتك واستمتع بمزايا حصرية</p>

          {/* Billing Toggle */}
          <div className="inline-flex bg-white/20 rounded-xl p-1">
            <button
              onClick={() => setBillingCycle('MONTHLY')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'MONTHLY' ? 'bg-white text-purple-600' : 'text-white'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setBillingCycle('YEARLY')}
              className={`px-6 py-2 rounded-lg font-medium transition-all ${
                billingCycle === 'YEARLY' ? 'bg-white text-purple-600' : 'text-white'
              }`}
            >
              سنوي
              <span className="mr-1 text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
                وفّر 20%
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-7xl mx-auto px-4 py-12 -mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden animate-pulse">
                <div className="h-24 bg-gray-200" />
                <div className="p-6 space-y-3">
                  <div className="h-10 bg-gray-200 rounded w-1/2" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-12 bg-gray-200 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {plans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                currentTier={subscription?.plan.tier}
                billingCycle={billingCycle}
                onSubscribe={handleSubscribe}
                loading={subscribing}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features Comparison */}
      <section className="bg-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">لماذا Premium؟</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#128640;
              </div>
              <h3 className="font-bold mb-2 text-lg">ظهور أكثر</h3>
              <p className="text-gray-500">إعلاناتك تظهر في المقدمة وتحصل على مشاهدات أكثر</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#128176;
              </div>
              <h3 className="font-bold mb-2 text-lg">مكافآت XCoin</h3>
              <p className="text-gray-500">احصل على مضاعفات XCoin ومكافآت شهرية مجانية</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-3xl">
                &#128200;
              </div>
              <h3 className="font-bold mb-2 text-lg">تحليلات متقدمة</h3>
              <p className="text-gray-500">تتبع أداء إعلاناتك واتخذ قرارات أفضل</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-4xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-8 text-center">الأسئلة الشائعة</h2>
        <div className="space-y-4">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">هل يمكنني إلغاء اشتراكي في أي وقت؟</h3>
            <p className="text-gray-600">نعم، يمكنك إلغاء اشتراكك في أي وقت. ستستمر في الاستفادة من المزايا حتى نهاية فترة الاشتراك الحالية.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">ما هي طرق الدفع المتاحة؟</h3>
            <p className="text-gray-600">نقبل الدفع عبر البطاقات الائتمانية، فوري، وفودافون كاش.</p>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-2">هل يمكنني ترقية خطتي لاحقاً؟</h3>
            <p className="text-gray-600">بالطبع! يمكنك الترقية في أي وقت وسيتم احتساب الفرق فقط.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
