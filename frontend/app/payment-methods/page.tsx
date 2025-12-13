'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

interface PaymentMethod {
  id: string;
  name: string;
  nameEn: string;
  icon: string;
  type: 'wallet' | 'card' | 'installment' | 'cash';
  discount?: number;
  description: string;
  features: string[];
  howToUse: string[];
  color: string;
  available: boolean;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: 'vodafone-cash',
    name: 'فودافون كاش',
    nameEn: 'Vodafone Cash',
    icon: '📱',
    type: 'wallet',
    discount: 10,
    description: 'ادفع بمحفظة فودافون كاش واحصل على خصم 10% على مشترياتك',
    features: [
      'خصم 10% على جميع المشتريات',
      'دفع فوري وآمن',
      'لا حاجة لبطاقة بنكية',
      'إشعار فوري بالعملية',
    ],
    howToUse: [
      'اختر "فودافون كاش" عند الدفع',
      'أدخل رقم محفظتك',
      'ستصلك رسالة تأكيد بالمبلغ',
      'أدخل رمز التأكيد لإتمام الدفع',
    ],
    color: 'red',
    available: true,
  },
  {
    id: 'instapay',
    name: 'إنستاباي',
    nameEn: 'InstaPay',
    icon: '🏦',
    type: 'wallet',
    discount: 5,
    description: 'استخدم تحويل إنستاباي الفوري واحصل على خصم 5%',
    features: [
      'خصم 5% على جميع المشتريات',
      'تحويل فوري بين البنوك',
      '12.5 مليون مستخدم في مصر',
      'آمن ومعتمد من البنك المركزي',
    ],
    howToUse: [
      'افتح تطبيق InstaPay أو تطبيق بنكك',
      'اختر "تحويل InstaPay"',
      'أدخل رقم المحفظة الظاهر',
      'أدخل المبلغ المطلوب وأكد العملية',
    ],
    color: 'blue',
    available: true,
  },
  {
    id: 'orange-money',
    name: 'أورانج موني',
    nameEn: 'Orange Money',
    icon: '🍊',
    type: 'wallet',
    discount: 8,
    description: 'ادفع بمحفظة أورانج موني واحصل على خصم 8%',
    features: [
      'خصم 8% على جميع المشتريات',
      'سهولة الاستخدام',
      'متاح على مدار الساعة',
      'حدود سحب مرنة',
    ],
    howToUse: [
      'اختر "أورانج موني" عند الدفع',
      'أدخل رقم هاتفك',
      'ستصلك رسالة تأكيد',
      'أدخل الرمز السري لإتمام العملية',
    ],
    color: 'orange',
    available: true,
  },
  {
    id: 'etisalat-cash',
    name: 'اتصالات كاش',
    nameEn: 'Etisalat Cash',
    icon: '💚',
    type: 'wallet',
    discount: 8,
    description: 'ادفع بمحفظة اتصالات كاش واحصل على خصم 8%',
    features: [
      'خصم 8% على جميع المشتريات',
      'تحويل فوري',
      'رسوم منخفضة',
      'دعم فني متاح',
    ],
    howToUse: [
      'اختر "اتصالات كاش" عند الدفع',
      'أدخل رقم محفظتك',
      'ستصلك رسالة بتفاصيل العملية',
      'وافق على الدفع من تطبيق المحفظة',
    ],
    color: 'green',
    available: true,
  },
  {
    id: 'fawry',
    name: 'فوري',
    nameEn: 'Fawry',
    icon: '🏪',
    type: 'cash',
    description: 'ادفع نقداً في أي منفذ فوري واكسب نقاط فوري',
    features: [
      'اكسب نقاط فوري مع كل عملية',
      'ادفع نقداً بدون حساب بنكي',
      '+200,000 منفذ في مصر',
      'إيصال إلكتروني فوري',
    ],
    howToUse: [
      'اختر "الدفع عبر فوري"',
      'ستحصل على رقم مرجعي',
      'توجه لأقرب منفذ فوري',
      'أعط الكاشير الرقم المرجعي وادفع المبلغ',
    ],
    color: 'yellow',
    available: true,
  },
  {
    id: 'valu',
    name: 'ڤاليو',
    nameEn: 'ValU',
    icon: '💳',
    type: 'installment',
    description: 'قسّط مشترياتك على 60 شهر بدون فوائد',
    features: [
      'تقسيط حتى 60 شهر',
      'موافقة فورية',
      'بدون مقدم',
      'بدون فوائد على بعض المنتجات',
    ],
    howToUse: [
      'اختر "التقسيط مع ڤاليو"',
      'حدد عدد الأشهر',
      'أدخل بياناتك أو سجل دخول',
      'وافق على الشروط وأتم العملية',
    ],
    color: 'purple',
    available: true,
  },
  {
    id: 'credit-card',
    name: 'بطاقة ائتمان',
    nameEn: 'Credit Card',
    icon: '💳',
    type: 'card',
    description: 'ادفع ببطاقتك الائتمانية Visa أو Mastercard',
    features: [
      'قبول Visa و Mastercard',
      'دفع آمن ومشفر',
      'إمكانية التقسيط من البنك',
      'حماية المشتري',
    ],
    howToUse: [
      'اختر "بطاقة ائتمان"',
      'أدخل بيانات البطاقة',
      'أدخل رمز OTP من البنك',
      'تأكيد الدفع',
    ],
    color: 'gray',
    available: true,
  },
  {
    id: 'debit-card',
    name: 'بطاقة خصم مباشر',
    nameEn: 'Debit Card',
    icon: '🏧',
    type: 'card',
    description: 'ادفع ببطاقة الخصم المباشر من حسابك البنكي',
    features: [
      'خصم مباشر من حسابك',
      'لا فوائد أو رسوم إضافية',
      'آمن ومعتمد',
      'إيصال إلكتروني فوري',
    ],
    howToUse: [
      'اختر "بطاقة خصم مباشر"',
      'أدخل رقم البطاقة',
      'أدخل رمز التحقق',
      'أكد العملية',
    ],
    color: 'teal',
    available: true,
  },
];

export default function PaymentMethodsPage() {
  const { user } = useAuth();
  const [selectedType, setSelectedType] = useState<string>('all');
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  const filteredMethods = paymentMethods.filter(
    method => selectedType === 'all' || method.type === selectedType
  );

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      orange: 'bg-orange-500',
      green: 'bg-green-500',
      yellow: 'bg-yellow-500',
      purple: 'bg-purple-500',
      gray: 'bg-gray-500',
      teal: 'bg-teal-500',
    };
    return colors[color] || 'bg-gray-500';
  };

  const getBgColorClass = (color: string) => {
    const colors: Record<string, string> = {
      red: 'bg-red-50',
      blue: 'bg-blue-50',
      orange: 'bg-orange-50',
      green: 'bg-green-50',
      yellow: 'bg-yellow-50',
      purple: 'bg-purple-50',
      gray: 'bg-gray-50',
      teal: 'bg-teal-50',
    };
    return colors[color] || 'bg-gray-50';
  };

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">💳 طرق الدفع</h1>
          <p className="text-xl text-primary-100">
            اختر طريقة الدفع المناسبة لك واستمتع بخصومات حصرية
          </p>
        </div>
      </div>

      {/* Discount Banner */}
      <div className="max-w-7xl mx-auto px-4 -mt-6">
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-2xl p-6 shadow-xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-4xl">🎁</span>
              <div>
                <h2 className="text-xl font-bold">خصومات على المحافظ الإلكترونية!</h2>
                <p className="text-green-100">
                  ادفع بالمحفظة الإلكترونية واحصل على خصم يصل إلى 10%
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="bg-white/20 px-4 py-2 rounded-xl">فودافون 10%</span>
              <span className="bg-white/20 px-4 py-2 rounded-xl">أورانج 8%</span>
              <span className="bg-white/20 px-4 py-2 rounded-xl">اتصالات 8%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Filter Tabs */}
        <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
          {[
            { id: 'all', label: 'الكل', icon: '📋' },
            { id: 'wallet', label: 'محافظ إلكترونية', icon: '📱' },
            { id: 'card', label: 'بطاقات', icon: '💳' },
            { id: 'installment', label: 'تقسيط', icon: '📅' },
            { id: 'cash', label: 'نقدي', icon: '💵' },
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => setSelectedType(type.id)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium whitespace-nowrap transition-all ${
                selectedType === type.id
                  ? 'bg-primary-500 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <span>{type.icon}</span>
              {type.label}
            </button>
          ))}
        </div>

        {/* Payment Methods Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredMethods.map((method) => (
            <div
              key={method.id}
              className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${
                expandedMethod === method.id ? 'border-primary-500' : 'border-transparent'
              }`}
            >
              {/* Method Header */}
              <div
                className={`p-6 ${getBgColorClass(method.color)} cursor-pointer`}
                onClick={() => setExpandedMethod(expandedMethod === method.id ? null : method.id)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className={`w-16 h-16 ${getColorClass(method.color)} rounded-2xl flex items-center justify-center text-3xl text-white`}>
                      {method.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{method.name}</h3>
                      <p className="text-sm text-gray-500">{method.nameEn}</p>
                    </div>
                  </div>
                  {method.discount && (
                    <div className="bg-green-500 text-white px-4 py-2 rounded-xl font-bold">
                      خصم {method.discount}%
                    </div>
                  )}
                </div>
                <p className="text-gray-600 mt-4">{method.description}</p>
              </div>

              {/* Expanded Content */}
              {expandedMethod === method.id && (
                <div className="p-6 border-t border-gray-100">
                  {/* Features */}
                  <div className="mb-6">
                    <h4 className="font-bold text-gray-900 mb-3">✨ المميزات</h4>
                    <ul className="grid grid-cols-2 gap-2">
                      {method.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-green-500">✓</span>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* How to Use */}
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">📋 كيفية الاستخدام</h4>
                    <ol className="space-y-2">
                      {method.howToUse.map((step, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <span className={`w-6 h-6 ${getColorClass(method.color)} text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0`}>
                            {index + 1}
                          </span>
                          <span className="text-gray-600">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Security Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">🔒 أمان الدفع</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '🔐', title: 'تشفير SSL', desc: 'جميع البيانات مشفرة' },
              { icon: '🛡️', title: 'PCI DSS', desc: 'معيار أمان البطاقات' },
              { icon: '✓', title: '3D Secure', desc: 'تحقق إضافي للبطاقات' },
              { icon: '🏦', title: 'معتمد', desc: 'من البنك المركزي المصري' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="text-4xl mb-3">{item.icon}</div>
                <h3 className="font-bold text-gray-900">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">هل تحتاج مساعدة؟</h3>
              <p className="text-gray-600">فريق الدعم متاح على مدار الساعة لمساعدتك</p>
            </div>
            <div className="flex gap-4">
              <Link
                href="/help/payments"
                className="px-6 py-3 bg-white text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm"
              >
                📚 دليل الدفع
              </Link>
              <Link
                href="/contact"
                className="px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
              >
                💬 تواصل معنا
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
