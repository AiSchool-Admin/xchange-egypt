'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      {/* Hero Section */}
      <div className="bg-gradient-to-l from-slate-600 via-slate-500 to-slate-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            كيف يعمل سوق الفضة؟
          </h1>
          <p className="text-xl text-slate-200 max-w-2xl mx-auto">
            دليلك الشامل لبيع وشراء الفضة بأمان وبأفضل الأسعار
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <Link href="/silver" className="text-slate-600 hover:underline">
            ← العودة لسوق الفضة
          </Link>
        </nav>

        {/* For Sellers Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <span className="inline-block bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              للبائعين
            </span>
            <h2 className="text-3xl font-bold text-gray-800">بيع فضتك بأفضل سعر</h2>
            <p className="text-gray-600 mt-2">احصل على سعر أفضل من التاجر بخطوات بسيطة</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                icon: '📝',
                title: 'أنشئ إعلانك',
                description: 'صوّر قطعتك، حدد الوزن والنقاء، واختر السعر المناسب',
                details: ['التقط 3-5 صور واضحة', 'حدد الوزن بالجرام', 'اختر درجة النقاء (925, 999...)'],
              },
              {
                step: 2,
                icon: '✅',
                title: 'مراجعة وموافقة',
                description: 'فريقنا يراجع الإعلان خلال 2-4 ساعات',
                details: ['التحقق من جودة الصور', 'مراجعة السعر والتفاصيل', 'النشر بعد الموافقة'],
              },
              {
                step: 3,
                icon: '🛒',
                title: 'استقبل الطلبات',
                description: 'المشتري يدفع في حساب الضمان (Escrow)',
                details: ['إشعار فوري بالطلب', 'المبلغ محمي في الضمان', 'تواصل آمن مع المشتري'],
              },
              {
                step: 4,
                icon: '💰',
                title: 'احصل على أموالك',
                description: 'بعد تأكيد الاستلام، تُحول الأموال لحسابك',
                details: ['تحويل خلال 1-3 أيام عمل', 'عمولة 2% فقط', 'دعم على مدار الساعة'],
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative">
                <div className="absolute -top-4 right-4 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div className="text-4xl mb-4 mt-2">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {item.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/silver/sell"
              className="inline-block bg-green-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-green-600 transition-colors shadow-lg"
            >
              💰 ابدأ البيع الآن
            </Link>
          </div>
        </section>

        {/* For Buyers Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <span className="inline-block bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-bold mb-4">
              للمشترين
            </span>
            <h2 className="text-3xl font-bold text-gray-800">اشترِ فضة موثوقة بأسعار أقل</h2>
            <p className="text-gray-600 mt-2">وفّر حتى 30% مقارنة بأسعار المحلات</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                step: 1,
                icon: '🔍',
                title: 'تصفح واختر',
                description: 'ابحث عن القطعة المناسبة من بين مئات الإعلانات',
                details: ['فلترة بالنقاء والوزن', 'مقارنة الأسعار', 'مشاهدة الصور بالتفصيل'],
              },
              {
                step: 2,
                icon: '💳',
                title: 'ادفع بأمان',
                description: 'ادفع بأي طريقة - أموالك محمية في الضمان',
                details: ['فيزا/ماستركارد', 'فوري/InstaPay', 'تحويل بنكي'],
              },
              {
                step: 3,
                icon: '📦',
                title: 'استلم قطعتك',
                description: 'توصيل لباب بيتك مع تتبع مباشر',
                details: ['شحن مؤمن', 'تتبع لحظي', 'تغليف آمن'],
              },
              {
                step: 4,
                icon: '🔒',
                title: 'افحص وأكّد',
                description: '48 ساعة لفحص القطعة قبل تحرير الأموال للبائع',
                details: ['فترة فحص كاملة', 'إرجاع إذا لم تطابق', 'ضمان استرداد المال'],
              },
            ].map((item) => (
              <div key={item.step} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 relative">
                <div className="absolute -top-4 right-4 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                  {item.step}
                </div>
                <div className="text-4xl mb-4 mt-2">{item.icon}</div>
                <h3 className="text-lg font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{item.description}</p>
                <ul className="text-xs text-gray-500 space-y-1">
                  {item.details.map((detail, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-blue-500">✓</span>
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Link
              href="/silver"
              className="inline-block bg-blue-500 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-blue-600 transition-colors shadow-lg"
            >
              🛒 تصفح الفضة المتاحة
            </Link>
          </div>
        </section>

        {/* Escrow System Explanation */}
        <section className="mb-16">
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-3xl p-8 md:p-12">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">🔐</span>
              <h2 className="text-3xl font-bold text-gray-800 mb-4">نظام الضمان (Escrow)</h2>
              <p className="text-gray-600 max-w-2xl mx-auto">
                حماية كاملة لأموالك - لا يحصل البائع على المال حتى تستلم وتوافق
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">1️⃣</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">المشتري يدفع</h3>
                <p className="text-sm text-gray-600">
                  المبلغ يُحفظ في حساب الضمان الخاص بـ XChange
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">2️⃣</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">البائع يشحن</h3>
                <p className="text-sm text-gray-600">
                  يعلم البائع أن المال موجود، فيشحن بثقة
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">3️⃣</span>
                </div>
                <h3 className="font-bold text-gray-800 mb-2">تأكيد وتحويل</h3>
                <p className="text-sm text-gray-600">
                  بعد 48 ساعة أو تأكيد الاستلام، يُحول المبلغ للبائع
                </p>
              </div>
            </div>

            <div className="mt-8 bg-white rounded-xl p-6 border border-blue-200">
              <h4 className="font-bold text-blue-800 mb-3">ماذا لو لم تطابق القطعة الوصف؟</h4>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-start gap-3">
                  <span className="text-xl">📸</span>
                  <div>
                    <strong>صوّر المشكلة</strong>
                    <p className="text-gray-600">التقط صوراً توضح الفرق عن الإعلان</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">🚨</span>
                  <div>
                    <strong>افتح نزاع</strong>
                    <p className="text-gray-600">خلال 48 ساعة من الاستلام</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">⚖️</span>
                  <div>
                    <strong>مراجعة الفريق</strong>
                    <p className="text-gray-600">فريقنا يراجع ويقرر بعدالة</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-xl">💸</span>
                  <div>
                    <strong>استرداد المال</strong>
                    <p className="text-gray-600">إذا كان النزاع في صالحك</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Commission Structure */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">هيكل العمولات الشفاف</h2>
            <p className="text-gray-600 mt-2">عمولات عادلة وأقل بكثير من الفرق عند البيع للتاجر</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-green-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">💰</span>
                <h3 className="text-xl font-bold text-gray-800">عمولة البائع</h3>
              </div>
              <div className="text-5xl font-bold text-green-600 mb-4">2%</div>
              <p className="text-gray-600 text-sm mb-4">من قيمة البيع النهائية</p>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="text-sm text-green-700">
                  <strong>مثال:</strong> لو بعت قطعة بـ 1000 ج.م
                  <br />
                  العمولة = 20 ج.م فقط
                  <br />
                  تحصل على = 980 ج.م
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg border-2 border-blue-200">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-3xl">🛒</span>
                <h3 className="text-xl font-bold text-gray-800">عمولة المشتري</h3>
              </div>
              <div className="text-5xl font-bold text-blue-600 mb-4">2%</div>
              <p className="text-gray-600 text-sm mb-4">تُضاف لسعر الشراء</p>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="text-sm text-blue-700">
                  <strong>مثال:</strong> لو اشتريت قطعة بـ 1000 ج.م
                  <br />
                  العمولة = 20 ج.م
                  <br />
                  تدفع إجمالي = 1020 ج.م
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 max-w-2xl mx-auto">
            <div className="bg-amber-50 rounded-xl p-6 border border-amber-200">
              <h4 className="font-bold text-amber-800 mb-3 flex items-center gap-2">
                <span>💡</span>
                لماذا هذا أفضل من التاجر؟
              </h4>
              <p className="text-amber-700 text-sm">
                عند بيع فضتك لتاجر المجوهرات، يخصم عادة <strong>15-25%</strong> من القيمة.
                <br />
                على XChange تدفع <strong>2% فقط</strong> وتحصل على سعر قريب من سعر السوق!
              </p>
            </div>
          </div>
        </section>

        {/* Cross-Barter Feature */}
        <section className="mb-16">
          <div className="bg-gradient-to-l from-amber-500 via-slate-500 to-amber-500 rounded-3xl p-8 md:p-12 text-white">
            <div className="text-center mb-8">
              <span className="text-5xl mb-4 block">🔄</span>
              <h2 className="text-3xl font-bold mb-4">المقايضة عبر المعادن (Cross-Barter)</h2>
              <p className="text-white/90 max-w-2xl mx-auto">
                ميزة حصرية في XChange - بادل فضتك بذهب أو العكس!
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🥈➡️🥈</div>
                <h3 className="font-bold mb-2">فضة بفضة</h3>
                <p className="text-sm text-white/80">
                  بادل قطعة فضة بأخرى مباشرة
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🥈➡️🏆</div>
                <h3 className="font-bold mb-2">فضة بذهب</h3>
                <p className="text-sm text-white/80">
                  حوّل فضتك لذهب مع دفع الفرق
                </p>
              </div>
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🏆➡️🥈</div>
                <h3 className="font-bold mb-2">ذهب بفضة</h3>
                <p className="text-sm text-white/80">
                  استبدل ذهبك بفضة واحصل على الفرق
                </p>
              </div>
            </div>

            <div className="text-center mt-8">
              <Link
                href="/silver?allowBarter=true"
                className="inline-block bg-white text-slate-700 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 transition-colors"
              >
                🔄 تصفح القطع القابلة للمقايضة
              </Link>
            </div>
          </div>
        </section>

        {/* Trust & Safety */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">الأمان والثقة</h2>
            <p className="text-gray-600 mt-2">إجراءات متعددة لحماية كل معاملة</p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              {
                icon: '🔒',
                title: 'نظام الضمان',
                description: 'أموالك محمية حتى تستلم وتوافق',
              },
              {
                icon: '✅',
                title: 'توثيق البائعين',
                description: 'كل البائعين موثقون بالهوية الوطنية',
              },
              {
                icon: '📜',
                title: 'شهادات الفحص',
                description: 'خدمة فحص وتوثيق من محلات شريكة',
              },
              {
                icon: '⚖️',
                title: 'حل النزاعات',
                description: 'فريق محايد للفصل في أي خلاف',
              },
            ].map((item, idx) => (
              <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 text-center">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="font-bold text-gray-800 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-800">أسئلة شائعة</h2>
          </div>

          <div className="max-w-3xl mx-auto space-y-4">
            {[
              {
                q: 'كيف أعرف أن الفضة أصلية؟',
                a: 'يمكنك طلب قطع موثقة بشهادة من محلاتنا الشريكة. كما يمكنك طلب فحص القطعة قبل الشراء النهائي خلال فترة الـ 48 ساعة.',
              },
              {
                q: 'كم يستغرق استلام أموالي بعد البيع؟',
                a: 'بعد تأكيد المشتري للاستلام (أو انتهاء 48 ساعة الفحص)، تُحول الأموال لحسابك خلال 1-3 أيام عمل.',
              },
              {
                q: 'هل يمكنني إلغاء البيع بعد استلام طلب شراء؟',
                a: 'قبل أن يدفع المشتري، نعم. بعد الدفع، يجب إتمام المعاملة إلا في حالة اتفاق الطرفين على الإلغاء.',
              },
              {
                q: 'ما الفرق بين مستويات التوثيق (أساسي، موثق، معتمد)؟',
                a: 'أساسي: إعلان بدون فحص. موثق: تم التحقق من الصور والوصف. معتمد: تم فحص القطعة فعلياً من محل شريك وإصدار شهادة.',
              },
              {
                q: 'هل يمكنني الدفع عند الاستلام؟',
                a: 'حالياً، كل المدفوعات تتم مقدماً عبر نظام الضمان لحماية البائع والمشتري. ندرس إضافة الدفع عند الاستلام مستقبلاً.',
              },
              {
                q: 'كيف تحسب قيمة المقايضة بين الفضة والذهب؟',
                a: 'يتم حساب قيمة كل قطعة بسعر السوق الحالي، ثم حساب الفرق. الطرف صاحب القيمة الأقل يدفع الفرق (مع عمولة 3% للمقايضة عبر المعادن).',
              },
            ].map((faq, idx) => (
              <details
                key={idx}
                className="bg-white rounded-xl shadow-sm border border-gray-200 group"
              >
                <summary className="p-4 font-bold text-gray-800 cursor-pointer flex items-center justify-between">
                  {faq.q}
                  <span className="text-slate-500 group-open:rotate-180 transition-transform">▼</span>
                </summary>
                <div className="px-4 pb-4 text-gray-600 text-sm leading-relaxed">{faq.a}</div>
              </details>
            ))}
          </div>
        </section>

        {/* Final CTA */}
        <section>
          <div className="bg-gradient-to-l from-slate-600 to-slate-500 rounded-3xl p-8 md:p-12 text-white text-center">
            <h2 className="text-3xl font-bold mb-4">جاهز للبدء؟</h2>
            <p className="text-slate-200 mb-8 max-w-xl mx-auto">
              انضم لآلاف المستخدمين الذين يتداولون الفضة بأمان وبأفضل الأسعار
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/silver/sell"
                className="bg-white text-slate-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-colors shadow-lg"
              >
                💰 بيع فضتك
              </Link>
              <Link
                href="/silver"
                className="bg-slate-700 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition-colors"
              >
                🛒 اشترِ فضة
              </Link>
              <Link
                href="/silver/calculator"
                className="border-2 border-white text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors"
              >
                🧮 احسب السعر
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
