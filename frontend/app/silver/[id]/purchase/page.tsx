'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import apiClient from '@/lib/api/client';

interface SilverItem {
  id: string;
  title: string;
  purity: string;
  category: string;
  condition: string;
  weightGrams: number;
  askingPrice: number;
  images: string[];
  seller: {
    id: string;
    fullName: string;
    governorate?: string;
  };
  buyerPays: number;
  buyerCommission: number;
}

interface SilverPartner {
  id: string;
  name: string;
  nameAr: string;
  governorate: string;
  city: string;
  address: string;
  offersPickup: boolean;
}

const PURITY_LABELS: Record<string, string> = {
  S999: 'فضة نقية 999',
  S925: 'فضة إسترليني 925',
  S900: 'فضة 900',
  S800: 'فضة 800',
};

const DELIVERY_METHODS = [
  {
    id: 'HOME_DELIVERY',
    name: 'توصيل للمنزل',
    nameAr: 'توصيل للمنزل',
    icon: '🏠',
    description: 'توصيل آمن لباب بيتك خلال 2-5 أيام',
    fee: 50,
  },
  {
    id: 'PARTNER_PICKUP',
    name: 'استلام من محل شريك',
    nameAr: 'استلام من محل شريك',
    icon: '🏪',
    description: 'استلم من أقرب محل فضة شريك',
    fee: 0,
  },
  {
    id: 'SELLER_MEETUP',
    name: 'مقابلة البائع',
    nameAr: 'مقابلة البائع',
    icon: '🤝',
    description: 'تنسيق مقابلة مباشرة مع البائع',
    fee: 0,
  },
];

const PAYMENT_METHODS = [
  {
    id: 'CARD',
    name: 'بطاقة ائتمان/خصم',
    icon: '💳',
    description: 'فيزا، ماستركارد',
  },
  {
    id: 'FAWRY',
    name: 'فوري',
    icon: '🏦',
    description: 'ادفع من أي منفذ فوري',
  },
  {
    id: 'INSTAPAY',
    name: 'InstaPay',
    icon: '📱',
    description: 'تحويل فوري من أي بنك',
  },
  {
    id: 'WALLET',
    name: 'محفظة إلكترونية',
    icon: '👛',
    description: 'فودافون كاش، أورانج كاش، إتصالات كاش',
  },
];

export default function PurchaseSilverPage() {
  const params = useParams();
  const router = useRouter();
  const [item, setItem] = useState<SilverItem | null>(null);
  const [partners, setPartners] = useState<SilverPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(1); // 1: Delivery, 2: Payment, 3: Confirm

  // Form state
  const [deliveryMethod, setDeliveryMethod] = useState('HOME_DELIVERY');
  const [selectedPartner, setSelectedPartner] = useState<string>('');
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    building: '',
    floor: '',
    apartment: '',
    governorate: '',
    city: '',
    phone: '',
    notes: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('CARD');
  const [buyerNotes, setBuyerNotes] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    // Check auth
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push(`/login?redirect=/silver/${params.id}/purchase`);
      return;
    }

    const fetchData = async () => {
      try {
        const [itemRes, partnersRes] = await Promise.all([
          apiClient.get(`/silver/items/${params.id}`),
          apiClient.get('/silver/partners?offersPickup=true'),
        ]);

        const itemData = itemRes.data.data;
        if (itemData.status !== 'ACTIVE') {
          alert('هذه القطعة لم تعد متاحة للشراء');
          router.push(`/silver/${params.id}`);
          return;
        }

        setItem(itemData);
        setPartners(partnersRes.data.data || []);
      } catch (err) {
        console.error('Error fetching data:', err);
        alert('حدث خطأ في تحميل البيانات');
        router.push('/silver');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id, router]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(Math.round(price));
  };

  const getDeliveryFee = () => {
    const method = DELIVERY_METHODS.find(m => m.id === deliveryMethod);
    return method?.fee || 0;
  };

  const getTotalPrice = () => {
    if (!item) return 0;
    return item.buyerPays + getDeliveryFee();
  };

  const validateStep1 = () => {
    if (deliveryMethod === 'HOME_DELIVERY') {
      if (!deliveryAddress.street || !deliveryAddress.governorate || !deliveryAddress.phone) {
        alert('يرجى إكمال بيانات العنوان');
        return false;
      }
    } else if (deliveryMethod === 'PARTNER_PICKUP') {
      if (!selectedPartner) {
        alert('يرجى اختيار محل الاستلام');
        return false;
      }
    }
    return true;
  };

  const handleNextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async () => {
    if (!agreedToTerms) {
      alert('يرجى الموافقة على الشروط والأحكام');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        itemId: params.id,
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'HOME_DELIVERY'
          ? `${deliveryAddress.street}, عمارة ${deliveryAddress.building}, الدور ${deliveryAddress.floor}, شقة ${deliveryAddress.apartment}, ${deliveryAddress.city}, ${deliveryAddress.governorate}`
          : undefined,
        deliveryPartnerId: deliveryMethod === 'PARTNER_PICKUP' ? selectedPartner : undefined,
        buyerNotes,
        paymentMethod,
      };

      const res = await apiClient.post('/silver/transactions', payload);

      // Redirect to payment or success page
      router.push(`/silver/orders/${res.data.data.id}?status=pending_payment`);
    } catch (err: any) {
      console.error('Error creating order:', err);
      alert(err.response?.data?.message || 'حدث خطأ في إنشاء الطلب');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-slate-500 border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">جارٍ التحميل...</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">لم يتم العثور على القطعة</h2>
          <Link href="/silver" className="text-slate-600 hover:underline">
            العودة لسوق الفضة
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white" dir="rtl">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Link href={`/silver/${params.id}`} className="text-slate-600 hover:underline text-sm">
            ← العودة للقطعة
          </Link>
          <h1 className="text-2xl font-bold text-gray-800 mt-2">إتمام الشراء</h1>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-lg mx-auto">
            {[
              { num: 1, label: 'التوصيل' },
              { num: 2, label: 'الدفع' },
              { num: 3, label: 'التأكيد' },
            ].map((s, i) => (
              <div key={s.num} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s.num
                      ? 'bg-slate-500 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step > s.num ? '✓' : s.num}
                </div>
                <div className="mr-2 text-sm font-medium text-gray-600">{s.label}</div>
                {i < 2 && (
                  <div className={`flex-1 h-1 mx-4 rounded ${step > s.num ? 'bg-slate-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Delivery */}
            {step === 1 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">اختر طريقة الاستلام</h2>

                {/* Delivery Methods */}
                <div className="space-y-4 mb-6">
                  {DELIVERY_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        deliveryMethod === method.id
                          ? 'border-slate-500 bg-slate-50'
                          : 'border-gray-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value={method.id}
                        checked={deliveryMethod === method.id}
                        onChange={(e) => setDeliveryMethod(e.target.value)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{method.icon}</span>
                          <span className="font-bold text-gray-800">{method.nameAr}</span>
                          {method.fee > 0 && (
                            <span className="text-sm text-gray-500">+{formatPrice(method.fee)} ج.م</span>
                          )}
                          {method.fee === 0 && (
                            <span className="text-sm text-green-600 font-medium">مجاناً</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Home Delivery Form */}
                {deliveryMethod === 'HOME_DELIVERY' && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-4">
                    <h3 className="font-bold text-gray-800 mb-2">بيانات التوصيل</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المحافظة *</label>
                        <select
                          value={deliveryAddress.governorate}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, governorate: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                        >
                          <option value="">اختر المحافظة</option>
                          <option value="Cairo">القاهرة</option>
                          <option value="Giza">الجيزة</option>
                          <option value="Alexandria">الإسكندرية</option>
                          <option value="Dakahlia">الدقهلية</option>
                          <option value="Sharqia">الشرقية</option>
                          <option value="Qalyubia">القليوبية</option>
                          <option value="Port Said">بورسعيد</option>
                          <option value="Suez">السويس</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">المدينة/الحي</label>
                        <input
                          type="text"
                          value={deliveryAddress.city}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                          placeholder="مثال: مدينة نصر"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">العنوان التفصيلي *</label>
                      <input
                        type="text"
                        value={deliveryAddress.street}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                        placeholder="اسم الشارع والمنطقة"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">العمارة</label>
                        <input
                          type="text"
                          value={deliveryAddress.building}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, building: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الدور</label>
                        <input
                          type="text"
                          value={deliveryAddress.floor}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, floor: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">الشقة</label>
                        <input
                          type="text"
                          value={deliveryAddress.apartment}
                          onChange={(e) => setDeliveryAddress({ ...deliveryAddress, apartment: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">رقم الهاتف *</label>
                      <input
                        type="tel"
                        value={deliveryAddress.phone}
                        onChange={(e) => setDeliveryAddress({ ...deliveryAddress, phone: e.target.value })}
                        placeholder="01xxxxxxxxx"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                      />
                    </div>
                  </div>
                )}

                {/* Partner Pickup */}
                {deliveryMethod === 'PARTNER_PICKUP' && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-800 mb-4">اختر محل الاستلام</h3>
                    {partners.length > 0 ? (
                      <div className="space-y-3">
                        {partners.map((partner) => (
                          <label
                            key={partner.id}
                            className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                              selectedPartner === partner.id
                                ? 'border-slate-500 bg-white'
                                : 'border-gray-200 hover:border-slate-300'
                            }`}
                          >
                            <input
                              type="radio"
                              name="partner"
                              value={partner.id}
                              checked={selectedPartner === partner.id}
                              onChange={(e) => setSelectedPartner(e.target.value)}
                              className="mt-1"
                            />
                            <div>
                              <div className="font-bold text-gray-800">{partner.nameAr || partner.name}</div>
                              <div className="text-sm text-gray-600">{partner.address}</div>
                              <div className="text-xs text-gray-500">{partner.city}, {partner.governorate}</div>
                            </div>
                          </label>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-4">لا توجد محلات متاحة للاستلام حالياً</p>
                    )}
                  </div>
                )}

                {/* Seller Meetup */}
                {deliveryMethod === 'SELLER_MEETUP' && (
                  <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">⚠️</span>
                      <div>
                        <h3 className="font-bold text-amber-800 mb-1">ملاحظة مهمة</h3>
                        <p className="text-sm text-amber-700">
                          سيتم التنسيق مع البائع لترتيب مقابلة في مكان عام.
                          ننصح بالمقابلة في محل فضة شريك لضمان سلامة المعاملة.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">ملاحظات إضافية (اختياري)</label>
                  <textarea
                    value={buyerNotes}
                    onChange={(e) => setBuyerNotes(e.target.value)}
                    placeholder="أي ملاحظات أو تعليمات خاصة..."
                    rows={2}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-slate-500"
                  />
                </div>

                <button
                  onClick={handleNextStep}
                  className="w-full mt-6 bg-slate-500 text-white py-4 rounded-xl font-bold hover:bg-slate-600 transition-colors"
                >
                  التالي: طريقة الدفع ←
                </button>
              </div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">اختر طريقة الدفع</h2>

                <div className="space-y-4">
                  {PAYMENT_METHODS.map((method) => (
                    <label
                      key={method.id}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        paymentMethod === method.id
                          ? 'border-slate-500 bg-slate-50'
                          : 'border-gray-200 hover:border-slate-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <span className="text-2xl">{method.icon}</span>
                      <div>
                        <div className="font-bold text-gray-800">{method.name}</div>
                        <div className="text-sm text-gray-500">{method.description}</div>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Escrow Info */}
                <div className="mt-6 bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">🔒</span>
                    <div>
                      <h3 className="font-bold text-blue-800 mb-1">دفع آمن بنظام الضمان</h3>
                      <p className="text-sm text-blue-700">
                        أموالك ستُحفظ في حساب الضمان حتى تستلم القطعة وتوافق عليها.
                        لديك 48 ساعة لفحص القطعة بعد الاستلام.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    ← السابق
                  </button>
                  <button
                    onClick={handleNextStep}
                    className="flex-1 bg-slate-500 text-white py-4 rounded-xl font-bold hover:bg-slate-600 transition-colors"
                  >
                    التالي: التأكيد ←
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-6">تأكيد الطلب</h2>

                {/* Order Summary */}
                <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-700 mb-3">طريقة الاستلام</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {DELIVERY_METHODS.find(m => m.id === deliveryMethod)?.icon}
                      </span>
                      <div>
                        <div className="font-medium">
                          {DELIVERY_METHODS.find(m => m.id === deliveryMethod)?.nameAr}
                        </div>
                        {deliveryMethod === 'HOME_DELIVERY' && deliveryAddress.street && (
                          <div className="text-sm text-gray-500">
                            {deliveryAddress.street}, {deliveryAddress.city}, {deliveryAddress.governorate}
                          </div>
                        )}
                        {deliveryMethod === 'PARTNER_PICKUP' && selectedPartner && (
                          <div className="text-sm text-gray-500">
                            {partners.find(p => p.id === selectedPartner)?.nameAr}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4">
                    <h3 className="font-bold text-gray-700 mb-3">طريقة الدفع</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.icon}
                      </span>
                      <div className="font-medium">
                        {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.name}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <label className="flex items-start gap-3 mt-6 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreedToTerms}
                    onChange={(e) => setAgreedToTerms(e.target.checked)}
                    className="mt-1 w-5 h-5 rounded"
                  />
                  <span className="text-sm text-gray-600">
                    أوافق على{' '}
                    <Link href="/terms" className="text-slate-600 underline">
                      شروط الاستخدام
                    </Link>{' '}
                    وأفهم أن المبلغ سيُحجز في نظام الضمان حتى أؤكد استلام القطعة والموافقة عليها.
                  </span>
                </label>

                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    ← السابق
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={submitting || !agreedToTerms}
                    className="flex-1 bg-green-500 text-white py-4 rounded-xl font-bold hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'جارٍ الإرسال...' : `✓ تأكيد الدفع (${formatPrice(getTotalPrice())} ج.م)`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h3 className="font-bold text-gray-800 mb-4">ملخص الطلب</h3>

              {/* Item Preview */}
              <div className="flex gap-3 mb-4 pb-4 border-b border-gray-100">
                <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                  {item.images?.[0] ? (
                    <Image
                      src={item.images[0]}
                      alt={item.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-3xl">💍</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-800 text-sm line-clamp-2">{item.title}</h4>
                  <div className="text-xs text-gray-500 mt-1">
                    {PURITY_LABELS[item.purity]} • {item.weightGrams}g
                  </div>
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>سعر القطعة</span>
                  <span>{formatPrice(item.askingPrice)} ج.م</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>عمولة المشتري (2%)</span>
                  <span>{formatPrice(item.buyerCommission)} ج.م</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>رسوم التوصيل</span>
                  <span>{getDeliveryFee() > 0 ? `${formatPrice(getDeliveryFee())} ج.م` : 'مجاناً'}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 flex justify-between font-bold text-lg">
                  <span>الإجمالي</span>
                  <span className="text-slate-700">{formatPrice(getTotalPrice())} ج.م</span>
                </div>
              </div>

              {/* Security Badge */}
              <div className="mt-4 bg-green-50 rounded-lg p-3 text-center">
                <span className="text-green-600 text-sm font-medium">
                  🔒 معاملة آمنة بنظام الضمان
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
