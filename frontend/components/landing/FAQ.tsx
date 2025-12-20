'use client';

import React, { useState } from 'react';
import ScrollReveal from './ScrollReveal';

const FAQS = [
  {
    question: 'هل XChange مجاني؟',
    answer: 'نعم! التسجيل ونشر الإعلانات مجاني تماماً. نأخذ عمولة صغيرة فقط عند إتمام الصفقة بنجاح (1-3% حسب الفئة).',
  },
  {
    question: 'كيف يعمل نظام الضمان (Escrow)؟',
    answer: 'عندما يدفع المشتري، تُحفظ الأموال في حساب آمن. لا تُحوّل للبائع إلا بعد تأكيد المشتري استلام المنتج ومطابقته للوصف. هذا يحمي الطرفين.',
  },
  {
    question: 'كيف أضمن أن المنتج أصلي؟',
    answer: 'نوفر فحوصات متخصصة حسب الفئة: فحص IMEI للموبايلات، فحص XRF للذهب، فحص 150 نقطة للسيارات، وفحص Entrupy للماركات الفاخرة.',
  },
  {
    question: 'ما هي المقايضة الذكية؟',
    answer: 'نظام ذكاء اصطناعي يجد لك صفقات مقايضة مثالية. يدعم المقايضة المباشرة (A↔B) وسلاسل متعددة الأطراف (A→B→C→A) مع إمكانية إضافة فرق نقدي.',
  },
  {
    question: 'كم يستغرق بيع منتج؟',
    answer: 'يعتمد على المنتج، لكن متوسط وقت البيع 2-5 أيام. يمكنك تسريع ذلك باستخدام الترويج المدفوع أو تسعير تنافسي.',
  },
  {
    question: 'هل يمكنني الشراء بالتقسيط؟',
    answer: 'نعم! نوفر خيارات تقسيط بالتعاون مع بنوك وشركات تمويل معتمدة. متاح للسيارات، العقارات، والموبايلات.',
  },
  {
    question: 'كيف أحمي نفسي من الاحتيال؟',
    answer: 'استخدم دائماً نظام الضمان للدفع، تحقق من توثيق البائع، اطلب معاينة المنتج، ولا تدفع خارج المنصة. فريقنا متاح 24/7 لأي استفسار.',
  },
  {
    question: 'هل يوجد تطبيق موبايل؟',
    answer: 'نعمل على إطلاق تطبيقات iOS و Android قريباً. حالياً الموقع متجاوب بالكامل ويعمل بسلاسة على الموبايل.',
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              ❓ الأسئلة الشائعة
            </h2>
            <p className="text-lg text-gray-600">
              كل ما تحتاج معرفته عن XChange
            </p>
          </div>
        </ScrollReveal>

        <div className="space-y-4">
          {FAQS.map((faq, index) => (
            <ScrollReveal key={index} delay={index * 50}>
              <div className="border border-gray-200 rounded-2xl overflow-hidden hover:border-emerald-300 transition-colors">
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full px-6 py-5 flex items-center justify-between text-right bg-white hover:bg-gray-50 transition-colors"
                >
                  <span className="font-bold text-gray-900 text-lg">{faq.question}</span>
                  <span
                    className={`w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center flex-shrink-0 mr-4 transition-transform ${
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
                    {faq.answer}
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Contact CTA */}
        <ScrollReveal delay={400}>
          <div className="text-center mt-12 p-8 bg-gray-50 rounded-2xl">
            <p className="text-gray-600 mb-4">لم تجد إجابة لسؤالك؟</p>
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors"
            >
              💬 تواصل معنا
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
