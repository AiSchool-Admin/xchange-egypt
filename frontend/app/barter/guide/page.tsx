'use client';

import React, { useState } from 'react';
import Link from 'next/link';

const GUIDE_SECTIONS = [
  {
    id: 'intro',
    title: 'مقدمة عن سوق المقايضة',
    icon: '🔄',
    content: `
      سوق المقايضة في Xchange هو أول سوق مقايضة ذكية في مصر والشرق الأوسط.
      يتيح لك تبادل منتجاتك بدون الحاجة للنقود، مما يوفر عليك المال ويساعدك في الحصول على ما تحتاجه.

      المقايضة ليست جديدة، لكن التقنية جعلتها أسهل وأكثر فعالية من أي وقت مضى!
    `,
  },
  {
    id: 'how-it-works',
    title: 'كيف تعمل المقايضة؟',
    icon: '⚙️',
    steps: [
      { icon: '📦', title: 'أضف منتجك', desc: 'صوّر منتجك وأضفه مع وصف دقيق وتحديد القيمة التقديرية وما تريده بالمقابل' },
      { icon: '🔍', title: 'اكتشف الفرص', desc: 'تصفح المنتجات المتاحة أو دع الذكاء الاصطناعي يجد لك أفضل الصفقات المناسبة' },
      { icon: '🤝', title: 'قدم عرضك', desc: 'عند إيجاد ما يناسبك، قدم عرض مقايضة للطرف الآخر' },
      { icon: '💬', title: 'تفاوض', desc: 'تواصل مع الطرف الآخر للاتفاق على التفاصيل' },
      { icon: '✅', title: 'أتم الصفقة', desc: 'عند الموافقة، اتفقا على مكان وموعد التبادل وأتم الصفقة!' },
    ],
  },
  {
    id: 'features',
    title: 'مميزات سوق المقايضة',
    icon: '⭐',
    features: [
      {
        icon: '🤖',
        title: 'مطابقة ذكية بالذكاء الاصطناعي',
        desc: 'نظام متطور يحلل منتجاتك وتفضيلاتك ليجد لك أفضل الصفقات تلقائياً',
      },
      {
        icon: '🔗',
        title: 'سلاسل المقايضة',
        desc: 'عندما لا تجد مقايضة مباشرة، نجد لك سلاسل متعددة الأطراف (A→B→C→A)',
      },
      {
        icon: '🤝',
        title: 'الصناديق الجماعية',
        desc: 'اجمع منتجاتك مع آخرين للحصول على منتج أكبر قيمة معاً',
      },
      {
        icon: '💰',
        title: 'مقايضة + نقد',
        desc: 'يمكنك إضافة مبلغ نقدي لموازنة الصفقة عند اختلاف القيم',
      },
      {
        icon: '📋',
        title: 'عروض مفتوحة',
        desc: 'أنشئ عرض مفتوح يصف ما تعرضه وما تريده، ودع الآخرين يأتون إليك',
      },
      {
        icon: '🔒',
        title: 'نظام تقييم آمن',
        desc: 'نظام تقييمات ومراجعات لضمان التعامل مع مستخدمين موثوقين',
      },
    ],
  },
  {
    id: 'types',
    title: 'أنواع المقايضة',
    icon: '📊',
    types: [
      {
        title: 'مقايضة مباشرة',
        icon: '↔️',
        desc: 'أبسط أنواع المقايضة: منتجك مقابل منتج شخص آخر مباشرة',
        example: 'هاتف Samsung ↔️ PlayStation 4',
      },
      {
        title: 'مقايضة + نقد',
        icon: '💵',
        desc: 'عندما تختلف قيم المنتجات، يمكن إضافة مبلغ نقدي للموازنة',
        example: 'iPhone قديم + 2000 جنيه ↔️ iPhone جديد',
      },
      {
        title: 'سلاسل المقايضة',
        icon: '🔗',
        desc: 'مقايضة متعددة الأطراف عندما لا يمكن إيجاد مقايضة مباشرة',
        example: 'أنت (لابتوب) → أحمد (هاتف) → محمد (كاميرا) → أنت',
      },
      {
        title: 'الصناديق الجماعية',
        icon: '🤝',
        desc: 'عدة أشخاص يجمعون منتجاتهم للحصول على منتج واحد كبير',
        example: '5 أشخاص يجمعون منتجاتهم للحصول على MacBook Pro',
      },
    ],
  },
  {
    id: 'tips',
    title: 'نصائح للمقايضة الناجحة',
    icon: '💡',
    tips: [
      {
        icon: '📷',
        title: 'صور احترافية',
        desc: 'التقط صور واضحة من زوايا متعددة. الصور الجيدة تزيد فرص نجاح المقايضة بنسبة 80%!',
      },
      {
        icon: '📝',
        title: 'وصف دقيق',
        desc: 'اكتب وصفاً تفصيلياً يشمل: الحالة، المواصفات، العيوب إن وجدت، وسبب المقايضة',
      },
      {
        icon: '💰',
        title: 'تقييم عادل',
        desc: 'حدد قيمة تقديرية واقعية لمنتجك. القيمة العادلة تجذب عروضاً جدية',
      },
      {
        icon: '🎯',
        title: 'حدد ما تريد',
        desc: 'كن واضحاً في تحديد ما تبحث عنه. هذا يساعد الآخرين على معرفة إذا كان لديهم ما يناسبك',
      },
      {
        icon: '💬',
        title: 'تواصل فعال',
        desc: 'رد على الرسائل بسرعة وكن واضحاً في التفاوض. التواصل الجيد يبني الثقة',
      },
      {
        icon: '🤝',
        title: 'كن مرناً',
        desc: 'أحياناً المرونة في التفاوض تؤدي لصفقات أفضل مما توقعت',
      },
    ],
  },
  {
    id: 'safety',
    title: 'نصائح الأمان',
    icon: '🔒',
    safety: [
      { icon: '📍', text: 'قابل في مكان عام ومزدحم (مول، كافيه، محطة مترو)' },
      { icon: '👥', text: 'اصطحب شخصاً معك عند اللقاء الأول' },
      { icon: '📱', text: 'افحص المنتج جيداً قبل إتمام التبادل' },
      { icon: '🧾', text: 'احتفظ بسجل للمحادثات والاتفاقات' },
      { icon: '⭐', text: 'تحقق من تقييمات المستخدم قبل التعامل' },
      { icon: '❌', text: 'لا ترسل منتجك قبل استلام ما يقابله' },
    ],
  },
  {
    id: 'faq',
    title: 'الأسئلة الشائعة',
    icon: '❓',
    faqs: [
      {
        q: 'هل يمكنني المقايضة بدون حساب؟',
        a: 'لا، تحتاج لإنشاء حساب مجاني للمقايضة. هذا يضمن الأمان ويتيح لك متابعة عروضك.',
      },
      {
        q: 'كيف أحدد قيمة منتجي؟',
        a: 'ابحث عن منتجات مشابهة في السوق وحدد قيمة واقعية. يمكنك استخدام أدوات التقييم في المنصة.',
      },
      {
        q: 'ماذا لو لم أجد ما أريد؟',
        a: 'أنشئ عرض مفتوح يصف ما تبحث عنه، أو استخدم سلاسل المقايضة والصناديق الجماعية.',
      },
      {
        q: 'هل هناك رسوم على المقايضة؟',
        a: 'المقايضات الأساسية مجانية. بعض الخدمات المتقدمة قد تتطلب رسوماً رمزية.',
      },
      {
        q: 'ماذا لو ألغى الطرف الآخر الصفقة؟',
        a: 'نظام التقييمات يساعد في تحديد المستخدمين الموثوقين. الإلغاءات المتكررة تؤثر على التقييم.',
      },
    ],
  },
];

export default function BarterGuidePage() {
  const [activeSection, setActiveSection] = useState('intro');

  const currentSection = GUIDE_SECTIONS.find(s => s.id === activeSection);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-teal-600 via-emerald-600 to-green-700 text-white">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <Link
            href="/barter"
            className="text-teal-200 hover:text-white flex items-center gap-2 mb-6 transition w-fit"
          >
            → العودة لسوق المقايضة
          </Link>

          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center text-4xl shadow-xl">
              📖
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold mb-2">دليل المقايضة الشامل</h1>
              <p className="text-teal-200 text-lg max-w-2xl">
                كل ما تحتاج معرفته للبدء في المقايضة وتحقيق أفضل الصفقات
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-4 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4">المحتويات</h3>
              <nav className="space-y-1">
                {GUIDE_SECTIONS.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`w-full text-right px-4 py-3 rounded-xl transition flex items-center gap-3 ${
                      activeSection === section.id
                        ? 'bg-teal-100 text-teal-700 font-bold'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-xl">{section.icon}</span>
                    <span className="text-sm">{section.title}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl shadow-sm p-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-4xl">{currentSection?.icon}</span>
                <h2 className="text-2xl font-bold text-gray-900">{currentSection?.title}</h2>
              </div>

              {/* Intro Section */}
              {activeSection === 'intro' && currentSection?.content && (
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 whitespace-pre-line leading-relaxed">{currentSection.content}</p>
                  <div className="mt-8 flex gap-4">
                    <Link
                      href="/barter/new"
                      className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 transition"
                    >
                      ابدأ المقايضة الآن
                    </Link>
                    <button
                      onClick={() => setActiveSection('how-it-works')}
                      className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition"
                    >
                      كيف تعمل؟
                    </button>
                  </div>
                </div>
              )}

              {/* How it Works */}
              {activeSection === 'how-it-works' && currentSection?.steps && (
                <div className="space-y-6">
                  {currentSection.steps.map((step, index) => (
                    <div key={index} className="flex gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                        {step.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full text-sm font-bold">
                            خطوة {index + 1}
                          </span>
                          <h3 className="font-bold text-gray-900">{step.title}</h3>
                        </div>
                        <p className="text-gray-600">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Features */}
              {activeSection === 'features' && currentSection?.features && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSection.features.map((feature, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{feature.icon}</span>
                        <h3 className="font-bold text-gray-900">{feature.title}</h3>
                      </div>
                      <p className="text-gray-600 text-sm">{feature.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Types */}
              {activeSection === 'types' && currentSection?.types && (
                <div className="space-y-6">
                  {currentSection.types.map((type, index) => (
                    <div key={index} className="p-6 border-2 border-gray-100 rounded-2xl hover:border-teal-200 transition">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="text-3xl">{type.icon}</span>
                        <h3 className="text-xl font-bold text-gray-900">{type.title}</h3>
                      </div>
                      <p className="text-gray-600 mb-3">{type.desc}</p>
                      <div className="p-3 bg-teal-50 rounded-xl">
                        <span className="text-sm text-teal-700 font-medium">مثال: </span>
                        <span className="text-sm text-teal-800">{type.example}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Tips */}
              {activeSection === 'tips' && currentSection?.tips && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {currentSection.tips.map((tip, index) => (
                    <div key={index} className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{tip.icon}</span>
                        <div>
                          <h3 className="font-bold text-gray-900 mb-1">{tip.title}</h3>
                          <p className="text-gray-600 text-sm">{tip.desc}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Safety */}
              {activeSection === 'safety' && currentSection?.safety && (
                <div className="space-y-3">
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl mb-6">
                    <p className="text-red-700 font-medium flex items-center gap-2">
                      <span className="text-xl">⚠️</span>
                      سلامتك أولاً! اتبع هذه النصائح لتجربة مقايضة آمنة
                    </p>
                  </div>
                  {currentSection.safety.map((item, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl">
                      <span className="text-2xl">{item.icon}</span>
                      <p className="text-gray-700 font-medium">{item.text}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* FAQ */}
              {activeSection === 'faq' && currentSection?.faqs && (
                <div className="space-y-4">
                  {currentSection.faqs.map((faq, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-xl">
                      <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
                        <span className="text-teal-600">س:</span>
                        {faq.q}
                      </h3>
                      <p className="text-gray-600 flex items-start gap-2">
                        <span className="text-green-600 font-bold">ج:</span>
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Navigation */}
              <div className="mt-8 pt-6 border-t flex justify-between">
                {GUIDE_SECTIONS.findIndex(s => s.id === activeSection) > 0 && (
                  <button
                    onClick={() => {
                      const currentIndex = GUIDE_SECTIONS.findIndex(s => s.id === activeSection);
                      setActiveSection(GUIDE_SECTIONS[currentIndex - 1].id);
                    }}
                    className="px-4 py-2 text-teal-600 font-medium flex items-center gap-2 hover:bg-teal-50 rounded-xl transition"
                  >
                    → السابق
                  </button>
                )}
                <div className="flex-1"></div>
                {GUIDE_SECTIONS.findIndex(s => s.id === activeSection) < GUIDE_SECTIONS.length - 1 && (
                  <button
                    onClick={() => {
                      const currentIndex = GUIDE_SECTIONS.findIndex(s => s.id === activeSection);
                      setActiveSection(GUIDE_SECTIONS[currentIndex + 1].id);
                    }}
                    className="px-4 py-2 text-teal-600 font-medium flex items-center gap-2 hover:bg-teal-50 rounded-xl transition"
                  >
                    التالي ←
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
