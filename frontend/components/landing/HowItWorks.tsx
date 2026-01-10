'use client';

import React, { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import ScrollReveal from './ScrollReveal';

const STEPS_CONFIG = {
  buy: [
    { step: 1, icon: '🔍', titleKey: 'buy.step1.title', descKey: 'buy.step1.description' },
    { step: 2, icon: '💬', titleKey: 'buy.step2.title', descKey: 'buy.step2.description' },
    { step: 3, icon: '🔒', titleKey: 'buy.step3.title', descKey: 'buy.step3.description' },
    { step: 4, icon: '📦', titleKey: 'buy.step4.title', descKey: 'buy.step4.description' },
  ],
  sell: [
    { step: 1, icon: '📸', titleKey: 'sell.step1.title', descKey: 'sell.step1.description' },
    { step: 2, icon: '🏷️', titleKey: 'sell.step2.title', descKey: 'sell.step2.description' },
    { step: 3, icon: '📢', titleKey: 'sell.step3.title', descKey: 'sell.step3.description' },
    { step: 4, icon: '💰', titleKey: 'sell.step4.title', descKey: 'sell.step4.description' },
  ],
  barter: [
    { step: 1, icon: '📦', titleKey: 'barter.step1.title', descKey: 'barter.step1.description' },
    { step: 2, icon: '🤖', titleKey: 'barter.step2.title', descKey: 'barter.step2.description' },
    { step: 3, icon: '🤝', titleKey: 'barter.step3.title', descKey: 'barter.step3.description' },
    { step: 4, icon: '🔄', titleKey: 'barter.step4.title', descKey: 'barter.step4.description' },
  ],
};

type TabType = 'buy' | 'sell' | 'barter';

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<TabType>('buy');
  const t = useTranslations('howItWorks');
  const locale = useLocale();

  const TABS: { id: TabType; labelKey: string; icon: string }[] = [
    { id: 'buy', labelKey: 'tabs.buy', icon: '🛒' },
    { id: 'sell', labelKey: 'tabs.sell', icon: '💰' },
    { id: 'barter', labelKey: 'tabs.barter', icon: '🔄' },
  ];

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              {t('title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('subtitle')}
            </p>
          </div>
        </ScrollReveal>

        {/* Tabs */}
        <ScrollReveal delay={100}>
          <div className="flex justify-center gap-2 mb-12">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-xl font-bold text-sm md:text-base transition-all ${
                  activeTab === tab.id
                    ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                <span className={locale === 'ar' ? 'ml-2' : 'mr-2'}>{tab.icon}</span>
                {t(tab.labelKey)}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 rounded-full" />

          <div className="grid md:grid-cols-4 gap-6 md:gap-4">
            {STEPS_CONFIG[activeTab].map((step, index) => (
              <ScrollReveal key={step.step} delay={index * 150} animation="fadeUp">
                <div className="relative bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow border border-gray-100 text-center group">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 bg-emerald-500 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg group-hover:scale-110 transition-transform">
                    {step.step}
                  </div>

                  {/* Icon */}
                  <div className="text-5xl mb-4 mt-4 group-hover:scale-110 transition-transform">
                    {step.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{t(step.titleKey)}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{t(step.descKey)}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <ScrollReveal delay={600}>
          <div className="text-center mt-12">
            <a
              href={activeTab === 'barter' ? '/barter' : activeTab === 'sell' ? '/listing/new' : '/items'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl"
            >
              {t(`cta.${activeTab}`)}
              <svg className={`w-5 h-5 ${locale === 'ar' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
