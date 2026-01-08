'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { EGYPTIAN_GOVERNORATES, getShippingCost } from '@/lib/constants/governorates';

interface CartItem {
  id: string;
  listingId: string;
  listing: {
    id: string;
    price: number;
    item: {
      id: string;
      title: string;
      images: string[];
      condition: string;
      seller: {
        id: string;
        fullName: string;
      };
    };
  };
  quantity: number;
}

interface Cart {
  id: string;
  items: CartItem[];
  totalItems: number;
  totalPrice: number;
}

export default function CheckoutPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    if (user) {
      fetchCart();
      // Auto-fill shipping address from user's profile
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.fullName || '',
        phone: user.phone || '',
        governorate: user.governorate || '',
        city: user.city || '',
        street: user.street || user.address || '',
      }));
    }
  }, [user]);

  useEffect(() => {
    // Calculate shipping cost based on governorate
    if (shippingAddress.governorate) {
      setShippingCost(getShippingCost(shippingAddress.governorate));
    }
  }, [shippingAddress.governorate]);

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const result = await response.json();
        // API returns { success: true, data: {...} }
        const cartData = result?.data || result;
        if (!cartData || !cartData.items || cartData.items.length === 0) {
          router.push('/cart');
          return;
        }
        setCart(cartData);
      } else {
        // Failed to load cart - redirect to cart page
        console.error('Failed to load cart:', response.status);
        router.push('/cart');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      router.push('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
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
          // Redirect to InstaPay
          try {
            const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/instapay/initiate`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ orderId: order.id }),
            });
            const paymentData = await paymentResponse.json();
            if (paymentResponse.ok && paymentData.data?.paymentUrl) {
              window.location.href = paymentData.data.paymentUrl;
            } else {
              // InstaPay not available - order created, redirect to orders
              alert('تم إنشاء الطلب بنجاح. إنستاباي غير متاح حالياً، يرجى الدفع عند الاستلام أو استخدام فوري.');
              router.push(`/dashboard/orders?success=${order.id}`);
            }
          } catch (paymentError) {
            console.error('InstaPay error:', paymentError);
            alert('تم إنشاء الطلب بنجاح. حدث خطأ في إنستاباي، يمكنك الدفع عند الاستلام.');
            router.push(`/dashboard/orders?success=${order.id}`);
          }
        } else if (paymentMethod === 'FAWRY') {
          // Show Fawry reference
          try {
            const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/fawry/create`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({ orderId: order.id }),
            });
            const paymentData = await paymentResponse.json();
            if (paymentResponse.ok && paymentData.data?.referenceNumber) {
              router.push(`/dashboard/orders?success=${order.id}&fawryRef=${paymentData.data.referenceNumber}`);
            } else {
              // Fawry not available
              alert('تم إنشاء الطلب بنجاح. فوري غير متاح حالياً، يرجى الدفع عند الاستلام.');
              router.push(`/dashboard/orders?success=${order.id}`);
            }
          } catch (paymentError) {
            console.error('Fawry error:', paymentError);
            alert('تم إنشاء الطلب بنجاح. حدث خطأ في فوري، يمكنك الدفع عند الاستلام.');
            router.push(`/dashboard/orders?success=${order.id}`);
          }
        }
      } else {
        const errorData = await response.json();
        const errorMessage = errorData.error?.message || errorData.message || 'فشل في إنشاء الطلب';
        alert(errorMessage);
        console.error('Order creation failed:', errorData);
      }
    } catch (error: any) {
      console.error('Failed to create order:', error);
      const errorMessage = error?.message || 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.';
      alert(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!user || !cart) {
    return null;
  }

  const totalAmount = cart.totalPrice + shippingCost;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">إتمام الشراء</h1>
            <Link href="/cart" className="text-primary-600 hover:underline">
              العودة للسلة
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">اختر المحافظة</option>
                      {EGYPTIAN_GOVERNORATES.map((gov) => (
                        <option key={gov.value} value={gov.value}>{gov.labelAr}</option>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.listing?.item?.images?.[0] && (
                          <img
                            src={item.listing?.item?.images?.[0] || ''}
                            alt={item.listing?.item?.title || 'منتج'}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.listing?.item?.title || 'منتج'}</p>
                        <p className="text-xs text-gray-500">الكمية: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        {((item.listing?.price || 0) * item.quantity).toLocaleString()} ج.م
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">المجموع الفرعي</span>
                    <span>{cart.totalPrice.toLocaleString()} ج.م</span>
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
                    <span className="text-primary-600">
                      {totalAmount.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !shippingAddress.governorate}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'جاري المعالجة...' : 'تأكيد الطلب'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
