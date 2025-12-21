'use client';

import React from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ScrollReveal from './ScrollReveal';

const PARTNERS = [
  { nameAr: 'البنك الأهلي', nameEn: 'National Bank', logo: '🏦', categoryKey: 'banks' },
  { nameAr: 'فوري', nameEn: 'Fawry', logo: '💳', categoryKey: 'payment' },
  { nameAr: 'أمان', nameEn: 'Aman', logo: '🔒', categoryKey: 'payment' },
  { nameAr: 'Uber', nameEn: 'Uber', logo: '🚗', categoryKey: 'transport' },
  { nameAr: 'Careem', nameEn: 'Careem', logo: '🚕', categoryKey: 'transport' },
  { nameAr: 'DHL', nameEn: 'DHL', logo: '📦', categoryKey: 'shipping' },
  { nameAr: 'Entrupy', nameEn: 'Entrupy', logo: '✅', categoryKey: 'verification' },
  { nameAr: 'Vodafone', nameEn: 'Vodafone', logo: '📱', categoryKey: 'telecom' },
];

const STATS_KEYS = ['activeUsers', 'successfulDeals', 'tradingVolume', 'satisfaction'];

const MEDIA_MENTIONS = [
  { nameAr: 'المصري اليوم', nameEn: 'Al-Masry Al-Youm', quoteKey: 'almasry' },
  { nameAr: 'CNN Arabic', nameEn: 'CNN Arabic', quoteKey: 'cnn' },
  { nameAr: 'Forbes Middle East', nameEn: 'Forbes Middle East', quoteKey: 'forbes' },
];

export default function TrustedPartners() {
  const t = useTranslations('partners');
  const locale = useLocale();

  return (
    <section className="py-16 bg-gray-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        {/* Partners Logos */}
        <ScrollReveal>
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 font-medium uppercase tracking-wider">{t('title')}</p>
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
                <span className="mt-2 text-sm text-gray-500">
                  {locale === 'ar' ? partner.nameAr : partner.nameEn}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Row */}
        <ScrollReveal delay={200}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
            {STATS_KEYS.map((key, index) => (
              <div
                key={index}
                className="text-center p-6 bg-white rounded-2xl shadow-sm border border-gray-100"
              >
                <div className="text-3xl md:text-4xl font-black text-emerald-600 mb-1">
                  {t(`stats.${key}.value`)}
                </div>
                <div className="text-sm text-gray-500">{t(`stats.${key}.label`)}</div>
              </div>
            ))}
          </div>
        </ScrollReveal>

        {/* Media Mentions */}
        <ScrollReveal delay={300}>
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 font-medium">{t('mediaTitle')}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {MEDIA_MENTIONS.map((media, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 text-center border border-gray-100"
              >
                <div className="text-lg font-bold text-gray-900 mb-2">
                  {locale === 'ar' ? media.nameAr : media.nameEn}
                </div>
                <p className="text-sm text-gray-500 italic">"{t(`media.${media.quoteKey}`)}"</p>
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
