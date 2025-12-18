'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

// Sample provider data
const SAMPLE_PROVIDER = {
  id: '1',
  name: 'محمد أحمد الفني',
  title: 'فني كهرباء معتمد',
  avatar: '👨‍🔧',
  rating: 4.9,
  reviews: 156,
  completedJobs: 234,
  responseTime: '30 دقيقة',
  memberSince: '2023',
  verified: true,
  certified: true,
  about: 'فني كهرباء بخبرة أكثر من 15 سنة في جميع أعمال الكهرباء المنزلية والتجارية. حاصل على شهادة من المعهد الفني ومعتمد من XChange.',
  services: [
    { name: 'تركيب كهرباء جديدة', price: 200, duration: '2-4 ساعات' },
    { name: 'صيانة كهرباء', price: 150, duration: '1-2 ساعة' },
    { name: 'تركيب إضاءة', price: 100, duration: '1 ساعة' },
    { name: 'فحص كهرباء شامل', price: 250, duration: '2 ساعة' },
  ],
  reviews: [
    { id: 1, user: 'أحمد محمود', rating: 5, comment: 'شغل ممتاز والتزام بالموعد. أنصح به', date: '2024-01-15' },
    { id: 2, user: 'سارة علي', rating: 5, comment: 'محترف جداً وأسعاره معقولة', date: '2024-01-10' },
    { id: 3, user: 'محمد حسن', rating: 4, comment: 'شغل جيد لكن تأخر قليلاً', date: '2024-01-05' },
  ],
  availability: ['السبت', 'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء'],
  areas: ['القاهرة', 'الجيزة', '6 أكتوبر'],
};

export default function ProviderProfilePage() {
  const params = useParams();
  const router = useRouter();
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const provider = SAMPLE_PROVIDER;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <section className="bg-gradient-to-r from-indigo-600 to-blue-600 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <nav className="flex items-center gap-2 text-white/70 text-sm mb-6">
            <Link href="/" className="hover:text-white">الرئيسية</Link>
            <span>/</span>
            <Link href="/services" className="hover:text-white">الخدمات</Link>
            <span>/</span>
            <span className="text-white">{provider.name}</span>
          </nav>

          <div className="flex flex-col md:flex-row items-start gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center text-5xl">
              {provider.avatar}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-black text-white">{provider.name}</h1>
                {provider.verified && <span className="text-blue-200" title="موثق">✓</span>}
                {provider.certified && <span className="text-amber-300" title="Xchange Certified">🏆</span>}
              </div>
              <p className="text-white/80 mb-4">{provider.title}</p>
              <div className="flex flex-wrap gap-4 text-white/90 text-sm">
                <span>⭐ {provider.rating} ({provider.reviews} مراجعة)</span>
                <span>✅ {provider.completedJobs} خدمة مكتملة</span>
                <span>⏱️ رد خلال {provider.responseTime}</span>
                <span>📅 عضو منذ {provider.memberSince}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowBookingModal(true)}
                className="px-6 py-3 bg-white text-indigo-600 rounded-xl font-bold hover:bg-white/90 transition-colors"
              >
                احجز الآن
              </button>
              <button className="px-4 py-3 bg-white/20 text-white rounded-xl hover:bg-white/30 transition-colors">
                💬
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* About */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">عن مقدم الخدمة</h2>
                <p className="text-gray-600 leading-relaxed">{provider.about}</p>
              </div>

              {/* Services */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 mb-4">الخدمات المقدمة</h2>
                <div className="space-y-3">
                  {provider.services.map((service, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-xl cursor-pointer transition-colors ${
                        selectedService === index
                          ? 'border-indigo-500 bg-indigo-50'
                          : 'border-gray-200 hover:border-indigo-300'
                      }`}
                      onClick={() => setSelectedService(index)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-bold text-gray-900">{service.name}</h3>
                          <p className="text-sm text-gray-500">⏱️ {service.duration}</p>
                        </div>
                        <div className="text-left">
                          <div className="text-xl font-bold text-indigo-600">{service.price} ج.م</div>
                          <p className="text-xs text-gray-500">يبدأ من</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900">المراجعات</h2>
                  <span className="text-amber-500 font-bold">⭐ {provider.rating}/5</span>
                </div>
                <div className="space-y-4">
                  {provider.reviews.map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-4 last:border-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm">👤</div>
                          <span className="font-bold text-gray-900">{review.user}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-500">{'⭐'.repeat(review.rating)}</span>
                          <span className="text-xs text-gray-500">{review.date}</span>
                        </div>
                      </div>
                      <p className="text-gray-600">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Book */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">احجز الآن</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-600 mb-2">اختر الخدمة</label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none">
                      {provider.services.map((service, index) => (
                        <option key={index} value={index}>
                          {service.name} - {service.price} ج.م
                        </option>
                      ))}
                    </select>
                  </div>
                  <button
                    onClick={() => setShowBookingModal(true)}
                    className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    متابعة الحجز
                  </button>
                </div>
              </div>

              {/* Availability */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">أوقات العمل</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.availability.map((day) => (
                    <span key={day} className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                      {day}
                    </span>
                  ))}
                </div>
              </div>

              {/* Areas */}
              <div className="bg-white rounded-2xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">مناطق الخدمة</h3>
                <div className="flex flex-wrap gap-2">
                  {provider.areas.map((area) => (
                    <span key={area} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm">
                      📍 {area}
                    </span>
                  ))}
                </div>
              </div>

              {/* Protection Badge */}
              <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">🛡️</span>
                  <h3 className="text-lg font-bold">Xchange Protect</h3>
                </div>
                <p className="text-white/80 text-sm">
                  هذا المقدم محمي بضمان Xchange. استرد أموالك كاملة إذا لم تكن راضياً.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">احجز موعد</h2>
              <button
                onClick={() => setShowBookingModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-600 mb-2">اختر التاريخ</label>
                <input type="date" className="w-full px-4 py-3 border border-gray-200 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">اختر الوقت</label>
                <select className="w-full px-4 py-3 border border-gray-200 rounded-xl">
                  <option>9:00 صباحاً</option>
                  <option>10:00 صباحاً</option>
                  <option>11:00 صباحاً</option>
                  <option>12:00 ظهراً</option>
                  <option>2:00 مساءً</option>
                  <option>3:00 مساءً</option>
                  <option>4:00 مساءً</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-2">العنوان</label>
                <textarea
                  placeholder="أدخل عنوانك بالتفصيل..."
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl h-24 resize-none"
                />
              </div>
              <button className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">
                تأكيد الحجز
              </button>
              <p className="text-xs text-gray-500 text-center">
                🛡️ محمي بضمان Xchange Protect
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
