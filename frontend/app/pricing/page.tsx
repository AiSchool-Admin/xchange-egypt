'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

interface PlanFeature {
  name: string;
  free: boolean | string;
  plus: boolean | string;
  pro: boolean | string;
  business: boolean | string;
}

const features: PlanFeature[] = [
  { name: 'عدد الإعلانات الشهرية', free: '5', plus: '20', pro: 'غير محدود', business: 'غير محدود' },
  { name: 'صور لكل إعلان', free: '5', plus: '10', pro: '20', business: '50' },
  { name: 'مدة الإعلان', free: '30 يوم', plus: '60 يوم', pro: '90 يوم', business: '180 يوم' },
  { name: 'شارة مميزة', free: false, plus: true, pro: true, business: true },
  { name: 'أولوية في نتائج البحث', free: false, plus: true, pro: true, business: true },
  { name: 'إحصائيات الإعلانات', free: 'أساسية', plus: 'متقدمة', pro: 'احترافية', business: 'كاملة + API' },
  { name: 'دعم العملاء', free: 'عادي', plus: 'أولوية', pro: 'VIP', business: 'مدير حساب مخصص' },
  { name: 'إعلانات مميزة مجانية', free: '0', plus: '2/شهر', pro: '5/شهر', business: '15/شهر' },
  { name: 'متجر مخصص', free: false, plus: false, pro: true, business: true },
  { name: 'URL متجر مخصص', free: false, plus: false, pro: false, business: true },
  { name: 'API للتكامل', free: false, plus: false, pro: false, business: true },
  { name: 'تقارير مبيعات', free: false, plus: 'شهرية', pro: 'أسبوعية', business: 'يومية' },
  { name: 'استيراد بالجملة', free: false, plus: false, pro: true, business: true },
  { name: 'عمولة مخفضة', free: '5%', plus: '4%', pro: '3%', business: '2%' },
  { name: 'إشعارات المطابقة الذكية', free: '5/يوم', plus: 'غير محدود', pro: 'غير محدود', business: 'غير محدود' },
];

const plans = [
  {
    id: 'free',
    name: 'مجاني',
    nameEn: 'Free',
    price: 0,
    period: 'شهرياً',
    description: 'للمستخدمين الجدد والبيع العرضي',
    color: 'gray',
    icon: '🆓',
    popular: false,
  },
  {
    id: 'plus',
    name: 'Plus',
    nameEn: 'Plus',
    price: 49,
    period: 'شهرياً',
    description: 'للبائعين النشطين',
    color: 'blue',
    icon: '⭐',
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    nameEn: 'Pro',
    price: 149,
    period: 'شهرياً',
    description: 'للبائعين المحترفين',
    color: 'purple',
    icon: '💎',
    popular: false,
  },
  {
    id: 'business',
    name: 'Business',
    nameEn: 'Business',
    price: 299,
    period: 'شهرياً',
    description: 'للشركات والمتاجر الكبيرة',
    color: 'amber',
    icon: '🏢',
    popular: false,
  },
];

const testimonials = [
  {
    name: 'أحمد محمد',
    role: 'صاحب متجر إلكترونيات',
    plan: 'Pro',
    image: '',
    quote: 'منذ الترقية لباقة Pro، زادت مبيعاتي بنسبة 150%. المتجر المخصص والإحصائيات المتقدمة غيرت طريقة إدارتي للعمل.',
  },
  {
    name: 'سارة أحمد',
    role: 'بائعة ملابس',
    plan: 'Plus',
    image: '',
    quote: 'باقة Plus مثالية لي. الشارة المميزة وأولوية الظهور ساعدتني في الوصول لعملاء أكثر.',
  },
  {
    name: 'شركة النيل للسيارات',
    role: 'وكالة سيارات',
    plan: 'Business',
    image: '',
    quote: 'API التكامل ومدير الحساب المخصص وفروا علينا ساعات من العمل اليومي. استثمار ممتاز.',
  },
];

const faqs = [
  {
    question: 'هل يمكنني تغيير الباقة في أي وقت؟',
    answer: 'نعم، يمكنك الترقية أو تقليل الباقة في أي وقت. عند الترقية، يتم خصم المبلغ المتبقي من باقتك الحالية. عند التخفيض، يتم تطبيق الباقة الجديدة في الدورة التالية.',
  },
  {
    question: 'هل هناك فترة تجريبية؟',
    answer: 'نعم! نقدم فترة تجريبية مجانية لمدة 14 يوم على باقة Plus وPro. يمكنك الإلغاء في أي وقت خلال الفترة التجريبية.',
  },
  {
    question: 'ما هي طرق الدفع المتاحة؟',
    answer: 'نقبل البطاقات الائتمانية (Visa, Mastercard)، فودافون كاش، أورانج موني، فوري، وInstaPay.',
  },
  {
    question: 'هل يمكنني استرداد المبلغ؟',
    answer: 'نعم، نقدم ضمان استرداد المبلغ خلال 30 يوم إذا لم تكن راضياً عن الخدمة.',
  },
  {
    question: 'ماذا يحدث لإعلاناتي إذا ألغيت الاشتراك؟',
    answer: 'ستبقى إعلاناتك الحالية نشطة حتى انتهاء مدتها. بعد الإلغاء، ستعود لحدود الباقة المجانية.',
  },
];

export default function PricingPage() {
  const { user } = useAuth();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const getPrice = (basePrice: number) => {
    if (billingCycle === 'yearly') {
      return Math.round(basePrice * 10); // 2 months free
    }
    return basePrice;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">اختر الباقة المناسبة لك</h1>
          <p className="text-xl text-primary-100 mb-8">
            ابدأ مجاناً وقم بالترقية عندما تحتاج لمميزات أكثر
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-full p-2">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                billingCycle === 'monthly'
                  ? 'bg-white text-primary-600'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              شهري
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-full font-medium transition-all flex items-center gap-2 ${
                billingCycle === 'yearly'
                  ? 'bg-white text-primary-600'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              سنوي
              <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full">
                وفر 17%
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 -mt-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white rounded-2xl shadow-xl overflow-hidden relative ${
                plan.popular ? 'ring-2 ring-primary-500 scale-105 z-10' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-0 right-0 bg-primary-500 text-white text-center py-1 text-sm font-bold">
                  الأكثر شعبية ⭐
                </div>
              )}

              <div className={`p-6 ${plan.popular ? 'pt-10' : ''}`}>
                {/* Plan Header */}
                <div className="text-center mb-6">
                  <span className="text-4xl">{plan.icon}</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-2">{plan.name}</h3>
                  <p className="text-gray-500 text-sm">{plan.description}</p>
                </div>

                {/* Price */}
                <div className="text-center mb-6">
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-4xl font-bold text-gray-900">
                      {formatPrice(getPrice(plan.price))}
                    </span>
                    <span className="text-gray-500">ج.م</span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {billingCycle === 'yearly' ? 'سنوياً' : 'شهرياً'}
                  </span>
                  {billingCycle === 'yearly' && plan.price > 0 && (
                    <div className="text-green-600 text-sm mt-1">
                      توفير {formatPrice(plan.price * 2)} ج.م
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                <Link
                  href={user ? `/checkout/subscription?plan=${plan.id}&cycle=${billingCycle}` : '/register'}
                  className={`block w-full py-3 rounded-xl font-medium text-center transition-all ${
                    plan.popular
                      ? 'bg-primary-500 text-white hover:bg-primary-600'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {plan.price === 0 ? 'ابدأ مجاناً' : 'ابدأ الآن'}
                </Link>

                {plan.price > 0 && (
                  <p className="text-center text-xs text-gray-500 mt-2">
                    14 يوم تجربة مجانية
                  </p>
                )}
              </div>

              {/* Features Preview */}
              <div className="border-t border-gray-100 p-6">
                <ul className="space-y-3">
                  {features.slice(0, 6).map((feature, index) => {
                    const value = feature[plan.id as keyof PlanFeature];
                    return (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        {value === true ? (
                          <span className="text-green-500">✓</span>
                        ) : value === false ? (
                          <span className="text-gray-300">✕</span>
                        ) : (
                          <span className="text-primary-500">✓</span>
                        )}
                        <span className="text-gray-600">{feature.name}</span>
                        {typeof value === 'string' && (
                          <span className="text-gray-900 font-medium mr-auto">{value}</span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Full Features Comparison */}
      <div className="max-w-7xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">مقارنة المميزات الكاملة</h2>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="text-right py-4 px-6 font-bold text-gray-900">الميزة</th>
                {plans.map((plan) => (
                  <th key={plan.id} className="py-4 px-6 text-center">
                    <span className="text-2xl block mb-1">{plan.icon}</span>
                    <span className="font-bold text-gray-900">{plan.name}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {features.map((feature, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50/50' : ''}>
                  <td className="py-4 px-6 text-gray-700">{feature.name}</td>
                  {plans.map((plan) => {
                    const value = feature[plan.id as keyof PlanFeature];
                    return (
                      <td key={plan.id} className="py-4 px-6 text-center">
                        {value === true ? (
                          <span className="text-green-500 text-xl">✓</span>
                        ) : value === false ? (
                          <span className="text-gray-300 text-xl">—</span>
                        ) : (
                          <span className="text-gray-900 font-medium">{value}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">ماذا يقول عملاؤنا</h2>

          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-lg p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                  <span className="mr-auto bg-primary-100 text-primary-600 px-3 py-1 rounded-full text-sm font-medium">
                    {testimonial.plan}
                  </span>
                </div>
                <p className="text-gray-600 leading-relaxed">"{testimonial.quote}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">الأسئلة الشائعة</h2>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm overflow-hidden">
              <button
                onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-right"
              >
                <span className="font-bold text-gray-900">{faq.question}</span>
                <span className={`text-2xl transition-transform ${expandedFaq === index ? 'rotate-45' : ''}`}>
                  +
                </span>
              </button>
              {expandedFaq === index && (
                <div className="px-6 pb-6 text-gray-600 leading-relaxed">
                  {faq.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">جاهز للبدء؟</h2>
          <p className="text-xl text-primary-100 mb-8">
            انضم لآلاف البائعين الناجحين على منصة Xchange
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="px-8 py-4 bg-white text-primary-600 rounded-xl font-bold hover:bg-gray-100 transition-colors"
            >
              ابدأ مجاناً الآن
            </Link>
            <Link
              href="/contact"
              className="px-8 py-4 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-colors"
            >
              تواصل مع المبيعات
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
