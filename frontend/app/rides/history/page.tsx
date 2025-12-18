'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Sample ride history data
const SAMPLE_RIDES = [
  {
    id: '1',
    date: '2024-01-15',
    time: '14:30',
    pickup: 'مطار القاهرة الدولي',
    dropoff: 'وسط البلد',
    provider: 'Uber',
    providerLogo: '🚗',
    type: 'UberX',
    price: 85,
    status: 'completed',
    rating: 5,
  },
  {
    id: '2',
    date: '2024-01-14',
    time: '09:15',
    pickup: 'المعادي',
    dropoff: 'مدينة نصر',
    provider: 'Careem',
    providerLogo: '🟢',
    type: 'Go',
    price: 45,
    status: 'completed',
    rating: 4,
  },
  {
    id: '3',
    date: '2024-01-13',
    time: '18:45',
    pickup: 'الشيخ زايد',
    dropoff: 'مول مصر',
    provider: 'Bolt',
    providerLogo: '⚡',
    type: 'Bolt',
    price: 35,
    status: 'completed',
    rating: 5,
  },
  {
    id: '4',
    date: '2024-01-12',
    time: '11:00',
    pickup: '6 أكتوبر',
    dropoff: 'الأهرامات',
    provider: 'inDrive',
    providerLogo: '🔵',
    type: 'City',
    price: 55,
    status: 'cancelled',
    rating: null,
  },
];

export default function RideHistoryPage() {
  const [filter, setFilter] = useState<'all' | 'completed' | 'cancelled'>('all');

  const filteredRides = SAMPLE_RIDES.filter(ride => {
    if (filter === 'all') return true;
    return ride.status === filter;
  });

  const totalSpent = SAMPLE_RIDES.filter(r => r.status === 'completed').reduce((sum, r) => sum + r.price, 0);
  const totalRides = SAMPLE_RIDES.filter(r => r.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <section className="bg-gradient-to-r from-purple-600 to-indigo-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <Link href="/rides" className="text-white/70 text-sm hover:text-white mb-4 block">
            ← العودة للبحث
          </Link>
          <h1 className="text-3xl font-black text-white">📋 سجل رحلاتي</h1>
          <p className="text-white/80 mt-2">جميع رحلاتك السابقة</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-6 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-black text-purple-600">{totalRides}</div>
              <div className="text-sm text-gray-500">رحلة مكتملة</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-green-600">{totalSpent} ج.م</div>
              <div className="text-sm text-gray-500">إجمالي الإنفاق</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-black text-amber-600">4.8</div>
              <div className="text-sm text-gray-500">متوسط التقييم</div>
            </div>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section className="py-4 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2">
            {(['all', 'completed', 'cancelled'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  filter === f
                    ? 'bg-purple-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {f === 'all' && 'الكل'}
                {f === 'completed' && '✅ مكتملة'}
                {f === 'cancelled' && '❌ ملغية'}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Rides List */}
      <section className="py-6">
        <div className="max-w-7xl mx-auto px-4">
          <div className="space-y-4">
            {filteredRides.map((ride) => (
              <div
                key={ride.id}
                className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                      {ride.providerLogo}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-gray-900">{ride.provider}</h3>
                        <span className="text-sm text-gray-500">• {ride.type}</span>
                        {ride.status === 'cancelled' && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-xs">ملغية</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">{ride.date} • {ride.time}</p>
                    </div>
                  </div>
                  <div className="text-left">
                    <div className="text-xl font-bold text-gray-900">{ride.price} ج.م</div>
                    {ride.rating && (
                      <div className="text-sm text-amber-500">{'⭐'.repeat(ride.rating)}</div>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-gray-600">
                  <span className="w-3 h-3 bg-green-500 rounded-full"></span>
                  <span>{ride.pickup}</span>
                  <span className="text-gray-400">→</span>
                  <span className="w-3 h-3 bg-red-500 rounded-full"></span>
                  <span>{ride.dropoff}</span>
                </div>

                {ride.status === 'completed' && (
                  <div className="mt-4 flex gap-2">
                    <button className="flex-1 py-2 bg-purple-50 text-purple-600 rounded-xl font-medium hover:bg-purple-100 transition-colors">
                      🔄 إعادة الحجز
                    </button>
                    <button className="flex-1 py-2 bg-gray-50 text-gray-600 rounded-xl font-medium hover:bg-gray-100 transition-colors">
                      📝 تفاصيل
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>

          {filteredRides.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚗</div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">لا توجد رحلات</h2>
              <p className="text-gray-500 mb-6">لم تقم بأي رحلات بعد</p>
              <Link
                href="/rides"
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors"
              >
                ابدأ رحلتك الأولى
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
