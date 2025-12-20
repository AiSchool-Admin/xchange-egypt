'use client';

import React from 'react';
import ScrollReveal from './ScrollReveal';

const PARTNERS = [
  { name: 'البنك الأهلي', logo: '🏦', category: 'بنوك' },
  { name: 'فوري', logo: '💳', category: 'دفع' },
  { name: 'أمان', logo: '🔒', category: 'دفع' },
  { name: 'Uber', logo: '🚗', category: 'نقل' },
  { name: 'Careem', logo: '🚕', category: 'نقل' },
  { name: 'DHL', logo: '📦', category: 'شحن' },
  { name: 'Entrupy', logo: '✅', category: 'توثيق' },
  { name: 'Vodafone', logo: '📱', category: 'اتصالات' },
];

const STATS = [
  { value: '125K+', label: 'مستخدم نشط' },
  { value: '89K+', label: 'صفقة ناجحة' },
  { value: '2.5B', label: 'ج.م حجم التداول' },
  { value: '98.5%', label: 'نسبة الرضا' },
];

const MEDIA_MENTIONS = [
  { name: 'المصري اليوم', quote: 'XChange يغير مفهوم التجارة الإلكترونية في مصر' },
  { name: 'CNN Arabic', quote: 'منصة مبتكرة تجمع 11 سوق في مكان واحد' },
  { name: 'Forbes Middle East', quote: 'من أسرع الشركات الناشئة نمواً في المنطقة' },
];

export default function TrustedPartners() {
  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Partners Logos */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">شركاؤنا الموثوقون</p>
          </div>
        </ScrollReveal>

        {/* Infinite Scroll Animation */}
        <div className="relative mb-16">
          <div className="flex animate-scroll">
            {[...PARTNERS, ...PARTNERS].map((partner, index) => (
              <div
                key={index}
                className="flex-shrink-0 mx-8 flex flex-col items-center"
              >
                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center text-4xl border border-gray-100">
                  {partner.logo}
                </div>
                <span className="mt-2 text-sm text-gray-500">{partner.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <ScrollReveal delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {STATS.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-500">{stat.label}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Media Mentions */}
        <ScrollReveal delay={300}>
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 font-medium">كما ظهرنا في</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {MEDIA_MENTIONS.map((media, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 text-center border border-gray-100"
              >
                <div className="text-lg font-bold text-gray-900 mb-2">{media.name}</div>
                <p className="text-sm text-gray-500 italic">"{media.quote}"</p>
              </div>
            ))}
          </div>
        </ScrollReveal>
      </div>

      {/* CSS for infinite scroll animation */}
      <style jsx>{`
        @keyframes scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
        .animate-scroll {
          animation: scroll 20s linear infinite;
        }
        .animate-scroll:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}
