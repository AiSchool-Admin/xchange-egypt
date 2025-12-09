'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

interface OrderItem {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    images: string[];
  };
  quantity: number;
  price: number;
}

interface ShippingAddress {
  fullName: string;
  phone: string;
  governorate: string;
  city: string;
  street: string;
  building?: string;
  floor?: string;
  apartment?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

export default function OrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const successOrderId = searchParams.get('success');
  const fawryRef = searchParams.get('fawryRef');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  const fetchOrders = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const cancelOrder = async (orderId: string) => {
    if (!confirm('هل أنت متأكد من إلغاء هذا الطلب؟')) return;

    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        fetchOrders();
        setSelectedOrder(null);
      }
    } catch (error) {
      console.error('Failed to cancel order:', error);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">طلباتي</h1>
            <Link href="/dashboard" className="text-primary-600 hover:underline">
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        {successOrderId && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <span className="text-2xl">✅</span>
              <div>
                <h3 className="font-bold text-green-800">تم تأكيد الطلب بنجاح!</h3>
                <p className="text-green-700 text-sm">
                  تم تأكيد طلبك. ستتلقى تحديثات عبر الإشعارات.
                </p>
                {fawryRef && (
                  <p className="text-green-800 font-medium mt-2">
                    رقم مرجع فوري: <code className="bg-green-100 px-2 py-1 rounded">{fawryRef}</code>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">لا توجد طلبات بعد</h2>
            <p className="text-gray-600 mb-6">ابدأ بالتسوق لتظهر طلباتك هنا</p>
            <Link
              href="/items"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Orders List */}
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white rounded-xl shadow-lg p-4 cursor-pointer transition-all hover:shadow-xl ${
                    selectedOrder?.id === order.id ? 'ring-2 ring-primary-500' : ''
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="font-bold text-gray-900">طلب #{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status === 'PENDING' ? 'قيد الانتظار' :
                       order.status === 'CONFIRMED' ? 'مؤكد' :
                       order.status === 'PROCESSING' ? 'قيد المعالجة' :
                       order.status === 'SHIPPED' ? 'تم الشحن' :
                       order.status === 'DELIVERED' ? 'تم التسليم' :
                       order.status === 'CANCELLED' ? 'ملغي' : order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        {item.listing.images?.[0] && (
                          <img
                            src={item.listing.images[0]}
                            alt={item.listing.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    ))}
                    {order.items.length > 3 && (
                      <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-600">
                        +{order.items.length - 3}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${PAYMENT_STATUS_COLORS[order.paymentStatus]}`}>
                      {order.paymentMethod === 'COD' ? 'الدفع عند الاستلام' :
                       order.paymentMethod === 'INSTAPAY' ? 'إنستاباي' :
                       order.paymentMethod === 'FAWRY' ? 'فوري' : order.paymentMethod} - {
                       order.paymentStatus === 'PENDING' ? 'قيد الانتظار' :
                       order.paymentStatus === 'PAID' ? 'مدفوع' :
                       order.paymentStatus === 'FAILED' ? 'فشل' :
                       order.paymentStatus === 'REFUNDED' ? 'مسترد' : order.paymentStatus}
                    </span>
                    <span className="font-bold text-primary-600">
                      {order.total.toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Details */}
            <div className="lg:sticky lg:top-4 lg:h-fit">
              {selectedOrder ? (
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold">طلب #{selectedOrder.orderNumber}</h2>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedOrder.status]}`}>
                      {selectedOrder.status === 'PENDING' ? 'قيد الانتظار' :
                       selectedOrder.status === 'CONFIRMED' ? 'مؤكد' :
                       selectedOrder.status === 'PROCESSING' ? 'قيد المعالجة' :
                       selectedOrder.status === 'SHIPPED' ? 'تم الشحن' :
                       selectedOrder.status === 'DELIVERED' ? 'تم التسليم' :
                       selectedOrder.status === 'CANCELLED' ? 'ملغي' : selectedOrder.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-semibold mb-3">المنتجات</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {item.listing.images?.[0] && (
                              <img
                                src={item.listing.images[0]}
                                alt={item.listing.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.listing.title}</p>
                            <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{item.price.toLocaleString()} ج.م</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-semibold mb-2">عنوان الشحن</h3>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                      <p dir="ltr" className="text-left">{selectedOrder.shippingAddress.phone}</p>
                      <p>
                        {selectedOrder.shippingAddress.street}
                        {selectedOrder.shippingAddress.building && `، مبنى ${selectedOrder.shippingAddress.building}`}
                        {selectedOrder.shippingAddress.floor && `، الدور ${selectedOrder.shippingAddress.floor}`}
                        {selectedOrder.shippingAddress.apartment && `، شقة ${selectedOrder.shippingAddress.apartment}`}
                      </p>
                      <p>
                        {selectedOrder.shippingAddress.city}، {selectedOrder.shippingAddress.governorate}
                      </p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-semibold mb-2">الدفع</h3>
                    <div className="flex justify-between text-sm">
                      <span>طريقة الدفع:</span>
                      <span className="font-medium">
                        {selectedOrder.paymentMethod === 'COD' ? 'الدفع عند الاستلام' :
                         selectedOrder.paymentMethod === 'INSTAPAY' ? 'إنستاباي' :
                         selectedOrder.paymentMethod === 'FAWRY' ? 'فوري' : selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الحالة:</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${PAYMENT_STATUS_COLORS[selectedOrder.paymentStatus]}`}>
                        {selectedOrder.paymentStatus === 'PENDING' ? 'قيد الانتظار' :
                         selectedOrder.paymentStatus === 'PAID' ? 'مدفوع' :
                         selectedOrder.paymentStatus === 'FAILED' ? 'فشل' :
                         selectedOrder.paymentStatus === 'REFUNDED' ? 'مسترد' : selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">المجموع الفرعي</span>
                        <span>{selectedOrder.subtotal.toLocaleString()} ج.م</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">الشحن</span>
                        <span>{selectedOrder.shippingCost.toLocaleString()} ج.م</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>الإجمالي</span>
                        <span className="text-primary-600">{selectedOrder.total.toLocaleString()} ج.م</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  {selectedOrder.status === 'PENDING' && (
                    <div className="mt-4 pt-4 border-t">
                      <button
                        onClick={() => cancelOrder(selectedOrder.id)}
                        className="w-full py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors font-medium"
                      >
                        إلغاء الطلب
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="text-4xl mb-3">👆</div>
                  <p className="text-gray-600">اختر طلباً لعرض التفاصيل</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
