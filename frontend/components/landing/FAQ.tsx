'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ScrollReveal from './ScrollReveal';

const FAQ_KEYS = [
  'free',
  'escrow',
  'authentic',
  'smartBarter',
  'sellTime',
  'installments',
  'fraud',
  'mobileApp',
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const t = useTranslations('faq');
  const locale = useLocale();

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-600">
              {t('subtitle')}
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {FAQ_KEYS.map((key, index) => (
            <ScrollReveal key={key} delay={index * 50}>
              <div className="border border-gray-200 rounded-2xl overflow-hidden hover:border-emerald-300 transition-colors">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className={`w-full px-6 py-5 flex items-center justify-between ${locale === 'ar' ? 'text-right' : 'text-left'} bg-white hover:bg-gray-50 transition-colors`}
                >
                  <span className="font-bold text-gray-900 text-lg">{t(`questions.${key}.question`)}</span>
                  <span
                    className={`w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 ${locale === 'ar' ? 'mr-4' : 'ml-4'} transition-transform ${
                      openIndex === index ? 'rotate-180' : ''
                    }`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>

                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openIndex === index ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {t(`questions.${key}.answer`)}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Contact CTA */}
        <ScrollReveal delay={400}>
          <div className="text-center mt-12 p-8 bg-gray-50 rounded-2xl">
            <p className="text-gray-600 mb-4">{t('contact.text')}</p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
            >
              💬 {t('contact.button')}
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
