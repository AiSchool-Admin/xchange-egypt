'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { getAuction, Auction } from '@/lib/api/auctions';

const EGYPTIAN_GOVERNORATES = [
  { value: 'Cairo', label: 'القاهرة' },
  { value: 'Alexandria', label: 'الإسكندرية' },
  { value: 'Giza', label: 'الجيزة' },
  { value: 'Shubra El Kheima', label: 'شبرا الخيمة' },
  { value: 'Port Said', label: 'بورسعيد' },
  { value: 'Suez', label: 'السويس' },
  { value: 'Luxor', label: 'الأقصر' },
  { value: 'Mansoura', label: 'المنصورة' },
  { value: 'El-Mahalla El-Kubra', label: 'المحلة الكبرى' },
  { value: 'Tanta', label: 'طنطا' },
  { value: 'Asyut', label: 'أسيوط' },
  { value: 'Ismailia', label: 'الإسماعيلية' },
  { value: 'Faiyum', label: 'الفيوم' },
  { value: 'Zagazig', label: 'الزقازيق' },
  { value: 'Aswan', label: 'أسوان' },
  { value: 'Damietta', label: 'دمياط' },
  { value: 'Damanhur', label: 'دمنهور' },
  { value: 'Minya', label: 'المنيا' },
  { value: 'Beni Suef', label: 'بني سويف' },
  { value: 'Qena', label: 'قنا' },
  { value: 'Sohag', label: 'سوهاج' },
  { value: 'Hurghada', label: 'الغردقة' },
  { value: 'Shibin El Kom', label: 'شبين الكوم' },
  { value: 'Banha', label: 'بنها' },
  { value: 'Kafr El Sheikh', label: 'كفر الشيخ' },
  { value: 'Arish', label: 'العريش' },
  { value: 'Mallawi', label: 'ملوي' },
  { value: '10th of Ramadan', label: 'العاشر من رمضان' },
  { value: 'Bilbais', label: 'بلبيس' },
  { value: 'Marsa Matruh', label: 'مرسى مطروح' },
];

export default function AuctionCheckoutPage() {
  const params = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const auctionId = params.id as string;

  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'INSTAPAY' | 'FAWRY'>('COD');
  const [shippingCost, setShippingCost] = useState(0);

  const [shippingAddress, setShippingAddress] = useState({
    fullName: '',
    phone: '',
    governorate: '',
    city: '',
    street: '',
    buildingName: '',
    buildingNumber: '',
    floor: '',
    apartmentNumber: '',
    landmark: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user && auctionId) {
      fetchAuction();
      // Auto-fill shipping address from user's profile
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.fullName || '',
        phone: user.phone || '',
        governorate: user.governorate || '',
        city: user.city || '',
        street: user.street || '',
      }));
    }
  }, [user, auctionId]);

  useEffect(() => {
    // Calculate shipping cost based on governorate
    if (shippingAddress.governorate) {
      const costs: Record<string, number> = {
        'Cairo': 30, 'Giza': 30, 'Alexandria': 45, 'Port Said': 50,
        'Suez': 50, 'Luxor': 60, 'Aswan': 65, 'Hurghada': 55,
      };
      setShippingCost(costs[shippingAddress.governorate] || 50);
    }
  }, [shippingAddress.governorate]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      const response = await getAuction(auctionId);
      const auctionData = response.data;

      // Check if user is the winner
      if (auctionData.winnerId !== user?.id) {
        setError('أنت لست الفائز بهذا المزاد');
        return;
      }

      // Check auction status - only ENDED auctions can be checked out
      if (auctionData.status !== 'ENDED') {
        setError('المزاد لم ينتهِ بعد');
        return;
      }

      setAuction(auctionData);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل بيانات المزاد');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auction) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/auction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          auctionId: auction.id,
          shippingAddress,
          paymentMethod,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const order = result.data || result;

        if (paymentMethod === 'COD') {
          router.push(`/dashboard/orders?success=${order.id}`);
        } else if (paymentMethod === 'INSTAPAY') {
          const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/instapay/initiate`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ orderId: order.id }),
          });
          const paymentData = await paymentResponse.json();
          if (paymentData.paymentUrl) {
            window.location.href = paymentData.paymentUrl;
          } else {
            router.push(`/dashboard/orders?success=${order.id}`);
          }
        } else if (paymentMethod === 'FAWRY') {
          const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/fawry/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ orderId: order.id }),
          });
          const paymentData = await paymentResponse.json();
          router.push(`/dashboard/orders?success=${order.id}&fawryRef=${paymentData.referenceNumber}`);
        }
      } else {
        const errorData = await response.json();
        alert(errorData.message || errorData.error?.message || 'فشل في إنشاء الطلب');
      }
    } catch (err) {
      console.error('Failed to create order:', err);
      alert('فشل في إنشاء الطلب. حاول مرة أخرى.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">{error}</p>
          <Link href="/auctions" className="text-purple-600 hover:text-purple-700">
            العودة للمزادات
          </Link>
        </div>
      </div>
    );
  }

  if (!user || !auction) {
    return null;
  }

  // Get item details
  const item = auction.item || (auction as any).listing?.item;
  const finalPrice = auction.currentPrice || auction.startingPrice || 0;
  const totalAmount = finalPrice + shippingCost;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-l from-purple-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">إتمام شراء المزاد</h1>
              <p className="text-purple-100 mt-1">مبروك! لقد فزت بهذا المزاد</p>
            </div>
            <Link href={`/auctions/${auctionId}`} className="text-purple-100 hover:text-white">
              العودة للمزاد
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Shipping & Payment */}
            <div className="lg:col-span-2 space-y-6">
              {/* Shipping Address */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">عنوان الشحن</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      الاسم الكامل *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.fullName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      رقم الهاتف *
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المحافظة *
                    </label>
                    <select
                      required
                      value={shippingAddress.governorate}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, governorate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    >
                      <option value="">اختر المحافظة</option>
                      {EGYPTIAN_GOVERNORATES.map((gov) => (
                        <option key={gov.value} value={gov.value}>{gov.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      المدينة *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.city}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      عنوان الشارع *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingAddress.street}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      اسم المبنى
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.buildingName}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, buildingName: e.target.value })}
                      placeholder="مثال: برج النيل، عمارة السلام"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم المبنى
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.buildingNumber}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, buildingNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        الدور
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.floor}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, floor: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        رقم الشقة
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.apartmentNumber}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, apartmentNumber: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      علامة مميزة (اختياري)
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.landmark}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })}
                      placeholder="بجوار مسجد، مدرسة، إلخ."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">طريقة الدفع</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="ml-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">الدفع عند الاستلام</div>
                      <div className="text-sm text-gray-600">ادفع عند استلام طلبك</div>
                    </div>
                    <span className="text-2xl">💵</span>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="INSTAPAY"
                      checked={paymentMethod === 'INSTAPAY'}
                      onChange={() => setPaymentMethod('INSTAPAY')}
                      className="ml-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">إنستاباي</div>
                      <div className="text-sm text-gray-600">ادفع فوراً عبر إنستاباي</div>
                    </div>
                    <span className="text-2xl">📱</span>
                  </label>

                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="FAWRY"
                      checked={paymentMethod === 'FAWRY'}
                      onChange={() => setPaymentMethod('FAWRY')}
                      className="ml-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">فوري</div>
                      <div className="text-sm text-gray-600">ادفع من أي منفذ فوري</div>
                    </div>
                    <span className="text-2xl">🏪</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">ملخص الطلب</h2>

                {/* Won Item */}
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 text-xl">🏆</span>
                    <span className="font-semibold text-green-800">فزت بهذا المزاد!</span>
                  </div>
                </div>

                {/* Item */}
                <div className="flex gap-3 mb-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {item?.images?.[0] && (
                      <img
                        src={typeof item.images[0] === 'string' ? item.images[0] : item.images[0].url}
                        alt={item?.title}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900">{item?.title || 'منتج المزاد'}</p>
                    <p className="text-sm text-gray-500 mt-1">{item?.condition}</p>
                    {item?.category && (
                      <p className="text-xs text-gray-400 mt-1">{item.category.nameAr || item.category.nameEn}</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4 space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">سعر الفوز</span>
                    <span className="font-semibold text-purple-600">{finalPrice.toLocaleString()} ج.م</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">الشحن</span>
                    <span>
                      {shippingCost > 0 ? `${shippingCost} ج.م` : 'اختر المحافظة'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>الإجمالي</span>
                    <span className="text-purple-600">
                      {totalAmount.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !shippingAddress.governorate}
                  className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'جاري المعالجة...' : 'تأكيد الطلب'}
                </button>

                <p className="text-xs text-gray-500 text-center mt-4">
                  بالضغط على "تأكيد الطلب" فأنت توافق على شروط الاستخدام وسياسة الخصوصية
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
