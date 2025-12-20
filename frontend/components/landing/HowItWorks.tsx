'use client';

import React, { useState } from 'react';
import ScrollReveal from './ScrollReveal';

const STEPS = {
  buy: [
    {
      step: 1,
      icon: '🔍',
      title: 'ابحث عن ما تريد',
      description: 'استخدم البحث الذكي والفلاتر المتقدمة للعثور على المنتج المثالي',
    },
    {
      step: 2,
      icon: '💬',
      title: 'تواصل مع البائع',
      description: 'راسل البائع مباشرة أو اطلب معاينة المنتج قبل الشراء',
    },
    {
      step: 3,
      icon: '🔒',
      title: 'ادفع بأمان',
      description: 'أموالك محمية بنظام الضمان حتى تستلم المنتج وتتأكد منه',
    },
    {
      step: 4,
      icon: '📦',
      title: 'استلم منتجك',
      description: 'استلم المنتج وتأكد من مطابقته للوصف ثم أكد الاستلام',
    },
  ],
  sell: [
    {
      step: 1,
      icon: '📸',
      title: 'صوّر منتجك',
      description: 'التقط صور واضحة واكتب وصفاً دقيقاً لمنتجك',
    },
    {
      step: 2,
      icon: '🏷️',
      title: 'حدد السعر',
      description: 'استخدم مقترح السعر الذكي أو حدد سعرك المناسب',
    },
    {
      step: 3,
      icon: '📢',
      title: 'انشر إعلانك',
      description: 'اختر الفئة المناسبة وانشر إعلانك ليراه آلاف المشترين',
    },
    {
      step: 4,
      icon: '💰',
      title: 'استلم أموالك',
      description: 'بعد تأكيد المشتري للاستلام، تصلك أموالك مباشرة',
    },
  ],
  barter: [
    {
      step: 1,
      icon: '📦',
      title: 'أضف منتجك للمقايضة',
      description: 'حدد المنتج الذي تريد استبداله وما تبحث عنه',
    },
    {
      step: 2,
      icon: '🤖',
      title: 'الذكاء الاصطناعي يبحث',
      description: 'نظامنا يجد لك أفضل العروض المتطابقة من آلاف المستخدمين',
    },
    {
      step: 3,
      icon: '🤝',
      title: 'وافق على العرض',
      description: 'راجع العروض واختر الأنسب. يمكنك إضافة فرق نقدي',
    },
    {
      step: 4,
      icon: '🔄',
      title: 'أتم المقايضة',
      description: 'استلم وسلم المنتجات بحماية نظام الضمان',
    },
  ],
};

type TabType = 'buy' | 'sell' | 'barter';

const TABS: { id: TabType; label: string; icon: string }[] = [
  { id: 'buy', label: 'كيف تشتري', icon: '🛒' },
  { id: 'sell', label: 'كيف تبيع', icon: '💰' },
  { id: 'barter', label: 'كيف تبادل', icon: '🔄' },
];

export default function HowItWorks() {
  const [activeTab, setActiveTab] = useState<TabType>('buy');

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              ⚡ كيف يعمل XChange؟
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              ابدأ في دقائق! عملية بسيطة وآمنة من البداية للنهاية
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
                <span className="ml-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Steps */}
        <div className="relative">
          {/* Connection Line - Desktop */}
          <div className="hidden md:block absolute top-24 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-emerald-200 via-emerald-400 to-emerald-200 rounded-full" />

          <div className="grid md:grid-cols-4 gap-6 md:gap-4">
            {STEPS[activeTab].map((step, index) => (
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
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>

        {/* CTA */}
        <ScrollReveal delay={600}>
          <div className="text-center mt-12">
            <a
              href={activeTab === 'barter' ? '/barter' : activeTab === 'sell' ? '/inventory/add' : '/items'}
              className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl"
            >
              {activeTab === 'buy' ? 'ابدأ التسوق الآن' : activeTab === 'sell' ? 'أضف إعلانك الأول' : 'ابدأ المقايضة'}
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
