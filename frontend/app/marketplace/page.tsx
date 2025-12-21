'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MarketplacePage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'provider'>('customer');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">سوق النقل الذكي</h1>
              <p className="text-purple-200 text-sm">شحن ورحلات بين المدن</p>
            </div>
            <Link href="/" className="text-purple-200 hover:text-white">
              ← العودة
            </Link>
          </div>
        </div>
      </header>

      {/* Tab Selector */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('customer')}
              className={`py-4 px-6 font-medium border-b-2 transition-colors ${
                activeTab === 'customer'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              👤 أطلب خدمة
            </button>
            <button
              onClick={() => setActiveTab('provider')}
              className={`py-4 px-6 font-medium border-b-2 transition-colors ${
                activeTab === 'provider'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              🚚 قدّم خدمة
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'customer' ? <CustomerView /> : <ProviderView />}
      </main>
    </div>
  );
}

// =====================================================
// CUSTOMER VIEW
// =====================================================

function CustomerView() {
  return (
    <div className="space-y-8">
      {/* Service Selection */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">اختر نوع الخدمة</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Shipping Service */}
          <Link
            href="/marketplace/shipping/new"
            className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-purple-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                📦
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">خدمة الشحن</h3>
                <p className="text-gray-600 text-sm mb-3">
                  اشحن طرودك ومستنداتك مع أفضل العروض من شركات الشحن والمناديب
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                    طرود
                  </span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                    مستندات
                  </span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                    أثاث
                  </span>
                  <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded-full">
                    إلكترونيات
                  </span>
                </div>
              </div>
              <span className="text-purple-500 text-2xl">←</span>
            </div>
          </Link>

          {/* Intercity Ride Service */}
          <Link
            href="/marketplace/rides/new"
            className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-indigo-500 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 bg-indigo-100 rounded-xl flex items-center justify-center text-3xl group-hover:scale-110 transition-transform">
                🚗
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">رحلات بين المدن</h3>
                <p className="text-gray-600 text-sm mb-3">
                  احجز رحلتك بين المحافظات مع سائقين موثوقين وأسعار تنافسية
                </p>
                <div className="flex flex-wrap gap-2">
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                    القاهرة - الإسكندرية
                  </span>
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                    الصعيد
                  </span>
                  <span className="px-2 py-1 bg-indigo-50 text-indigo-700 text-xs rounded-full">
                    الدلتا
                  </span>
                </div>
              </div>
              <span className="text-indigo-500 text-2xl">←</span>
            </div>
          </Link>
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">كيف يعمل النظام؟</h2>
        <div className="grid md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
              1️⃣
            </div>
            <h3 className="font-bold text-gray-900 mb-1">انشر طلبك</h3>
            <p className="text-gray-600 text-sm">حدد تفاصيل الشحنة أو الرحلة</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
              2️⃣
            </div>
            <h3 className="font-bold text-gray-900 mb-1">استلم العروض</h3>
            <p className="text-gray-600 text-sm">تلقى عروض أسعار من المزودين</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
              3️⃣
            </div>
            <h3 className="font-bold text-gray-900 mb-1">قارن واختر</h3>
            <p className="text-gray-600 text-sm">اختر أفضل عرض يناسبك</p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-xl mx-auto mb-3">
              4️⃣
            </div>
            <h3 className="font-bold text-gray-900 mb-1">تتبع وقيّم</h3>
            <p className="text-gray-600 text-sm">تابع الخدمة وقيّم المزود</p>
          </div>
        </div>
      </section>

      {/* My Requests */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">طلباتي</h2>
          <Link
            href="/marketplace/requests"
            className="text-purple-600 hover:text-purple-800 text-sm font-medium"
          >
            عرض الكل ←
          </Link>
        </div>
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد طلبات حالياً</h3>
          <p className="text-gray-600 mb-4">ابدأ بإنشاء طلب شحن أو رحلة جديد</p>
        </div>
      </section>
    </div>
  );
}

// =====================================================
// PROVIDER VIEW
// =====================================================

function ProviderView() {
  const [isRegistered, setIsRegistered] = useState(false);

  if (!isRegistered) {
    return (
      <div className="max-w-2xl mx-auto">
        {/* Provider Registration CTA */}
        <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-8 text-white text-center">
          <div className="text-6xl mb-4">🚚</div>
          <h2 className="text-2xl font-bold mb-2">انضم كمزود خدمة</h2>
          <p className="text-purple-100 mb-6">
            سجّل الآن واستقبل طلبات الشحن والرحلات من العملاء في منطقتك
          </p>
          <Link
            href="/marketplace/provider/register"
            className="inline-block bg-white text-purple-600 px-8 py-3 rounded-xl font-bold hover:bg-purple-50 transition-colors"
          >
            سجّل كمزود خدمة
          </Link>
        </div>

        {/* Benefits */}
        <div className="mt-8 grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">💰</div>
            <h3 className="font-bold text-gray-900 mb-1">زيادة الدخل</h3>
            <p className="text-gray-600 text-sm">احصل على طلبات إضافية وزد دخلك</p>
          </div>
          <div className="bg-white rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">📱</div>
            <h3 className="font-bold text-gray-900 mb-1">إشعارات فورية</h3>
            <p className="text-gray-600 text-sm">استلم إشعار بكل طلب جديد في منطقتك</p>
          </div>
          <div className="bg-white rounded-xl p-5 text-center">
            <div className="text-3xl mb-2">⭐</div>
            <h3 className="font-bold text-gray-900 mb-1">بناء السمعة</h3>
            <p className="text-gray-600 text-sm">اجمع تقييمات إيجابية وزد عملاءك</p>
          </div>
        </div>

        {/* Provider Types */}
        <div className="mt-8 bg-white rounded-2xl p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">من يمكنه التسجيل؟</h3>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">👤</span>
              <div>
                <h4 className="font-bold text-gray-900">أفراد</h4>
                <p className="text-gray-600 text-sm">سائقين ومناديب توصيل</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">🏪</span>
              <div>
                <h4 className="font-bold text-gray-900">شركات صغيرة</h4>
                <p className="text-gray-600 text-sm">مكاتب توصيل وشركات نقل صغيرة</p>
              </div>
            </div>
            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
              <span className="text-2xl">🏢</span>
              <div>
                <h4 className="font-bold text-gray-900">شركات كبيرة</h4>
                <p className="text-gray-600 text-sm">شركات شحن ونقل مرخصة</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Provider Dashboard (if registered)
  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-purple-600">0</div>
          <div className="text-gray-600 text-sm">طلبات جديدة</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-indigo-600">0</div>
          <div className="text-gray-600 text-sm">عروضي المعلقة</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-green-600">0</div>
          <div className="text-gray-600 text-sm">عروض مقبولة</div>
        </div>
        <div className="bg-white rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-amber-600">0.0</div>
          <div className="text-gray-600 text-sm">تقييمي</div>
        </div>
      </div>

      {/* Open Requests */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">الطلبات المتاحة</h2>
        <div className="bg-white rounded-2xl p-8 text-center">
          <div className="text-6xl mb-4">🔍</div>
          <h3 className="text-lg font-bold text-gray-900 mb-2">لا توجد طلبات حالياً</h3>
          <p className="text-gray-600">سيتم إشعارك عند وجود طلبات جديدة في منطقتك</p>
        </div>
      </section>
    </div>
  );
}
