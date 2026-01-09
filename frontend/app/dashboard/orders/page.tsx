'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

interface OrderItem {
  id: string;
  listing: {
    id: string;
    price: number;
    item: {
      id: string;
      title: string;
      images: string[];
    };
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
  trackingNumber?: string;
  isDirectTransaction?: boolean;
  deliveryStatus?: string;
  isProperty?: boolean; // Flag to identify property orders
  seller?: {
    id: string;
    fullName: string;
    phone: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  // Property-specific status colors
  INQUIRY_SENT: 'bg-blue-100 text-blue-800',
  VIEWING_SCHEDULED: 'bg-cyan-100 text-cyan-800',
  VIEWED: 'bg-teal-100 text-teal-800',
  NEGOTIATION: 'bg-amber-100 text-amber-800',
  PRICE_AGREED: 'bg-lime-100 text-lime-800',
  CONTRACT_PENDING: 'bg-orange-100 text-orange-800',
  CONTRACT_SIGNED: 'bg-emerald-100 text-emerald-800',
  PAYMENT_PENDING: 'bg-yellow-100 text-yellow-800',
  ESCROW_FUNDED: 'bg-purple-100 text-purple-800',
  REGISTRATION_PENDING: 'bg-indigo-100 text-indigo-800',
  HANDOVER: 'bg-sky-100 text-sky-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'طلب جديد',
  PAID: 'تم الدفع',
  PROCESSING: 'جاري التجهيز',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغي',
  REFUNDED: 'مسترد',
  // Property-specific statuses
  INQUIRY_SENT: 'تم التواصل',
  VIEWING_SCHEDULED: 'موعد المعاينة',
  VIEWED: 'تمت المعاينة',
  NEGOTIATION: 'جاري التفاوض',
  PRICE_AGREED: 'تم الاتفاق',
  CONTRACT_PENDING: 'في انتظار العقد',
  CONTRACT_SIGNED: 'تم توقيع العقد',
  PAYMENT_PENDING: 'في انتظار الدفع',
  ESCROW_FUNDED: 'تم إيداع الضمان',
  REGISTRATION_PENDING: 'في انتظار التسجيل',
  HANDOVER: 'جاري التسليم',
  COMPLETED: 'تم التسليم',
};

const PAYMENT_STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-green-100 text-green-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
};

// Order tracking steps for physical items
const TRACKING_STEPS = [
  { status: 'PENDING', label: 'طلب جديد', icon: '📋' },
  { status: 'PAID', label: 'تم الدفع', icon: '💳' },
  { status: 'PROCESSING', label: 'جاري التجهيز', icon: '📦' },
  { status: 'SHIPPED', label: 'تم الشحن', icon: '🚚' },
  { status: 'DELIVERED', label: 'تم التسليم', icon: '✅' },
];

// Order tracking steps for properties (no shipping)
const PROPERTY_TRACKING_STEPS = [
  { status: 'PENDING', label: 'طلب جديد', icon: '📋' },
  { status: 'INQUIRY_SENT', label: 'تم التواصل', icon: '💬' },
  { status: 'VIEWING_SCHEDULED', label: 'معاينة', icon: '👁️' },
  { status: 'NEGOTIATION', label: 'تفاوض', icon: '🤝' },
  { status: 'CONTRACT_PENDING', label: 'العقد', icon: '📝' },
  { status: 'COMPLETED', label: 'تم التسليم', icon: '✅' },
];

// Order tracking component
function OrderTracking({ status, isCOD, isProperty = false }: { status: string; isCOD: boolean; isProperty?: boolean }) {
  // Use property-specific steps for property orders
  let steps = isProperty ? PROPERTY_TRACKING_STEPS : TRACKING_STEPS;

  // For COD (physical items only), skip PAID step
  if (!isProperty && isCOD) {
    steps = steps.filter(s => s.status !== 'PAID');
  }

  const currentIndex = steps.findIndex(s => s.status === status);
  const isCancelled = status === 'CANCELLED' || status === 'REFUNDED';

  if (isCancelled) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <span className="text-3xl">❌</span>
        <p className="text-red-700 font-medium mt-2">
          {status === 'CANCELLED' ? 'تم إلغاء الطلب' : 'تم استرداد المبلغ'}
        </p>
      </div>
    );
  }

  return (
    <div className="py-4">
      <div className="flex items-center justify-between relative">
        {/* Progress line */}
        <div className="absolute top-6 right-6 left-6 h-1 bg-gray-200 rounded-full" />
        <div
          className="absolute top-6 right-6 h-1 bg-primary-500 rounded-full transition-all duration-500"
          style={{
            width: currentIndex >= 0
              ? `${(currentIndex / (steps.length - 1)) * 100}%`
              : '0%'
          }}
        />

        {/* Steps */}
        {steps.map((step, index) => {
          const isCompleted = currentIndex >= index;
          const isCurrent = currentIndex === index;

          return (
            <div key={step.status} className="flex flex-col items-center relative z-10">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all duration-300 ${
                  isCompleted
                    ? 'bg-primary-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-400'
                } ${isCurrent ? 'ring-4 ring-primary-200 scale-110' : ''}`}
              >
                {step.icon}
              </div>
              <span className={`mt-2 text-xs font-medium text-center max-w-[60px] ${
                isCompleted ? 'text-primary-600' : 'text-gray-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function OrdersContent() {
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
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      // Fetch both cart orders and direct transactions
      const [ordersRes, transactionsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/my?role=buyer`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const allOrders: Order[] = [];

      // Add cart-based orders
      if (ordersRes.ok) {
        const ordersData = await ordersRes.json();
        const orders = ordersData.data?.orders || [];
        allOrders.push(...orders);
      }

      // Add direct transactions (converted to order-like format)
      if (transactionsRes.ok) {
        const transData = await transactionsRes.json();
        const transactions = transData.data?.transactions || [];

        const convertedTransactions = transactions.map((tx: any) => ({
          id: tx.id,
          orderNumber: `TX-${tx.id.slice(0, 8).toUpperCase()}`,
          status: tx.deliveryStatus || tx.paymentStatus || 'PENDING',
          paymentStatus: tx.paymentStatus,
          paymentMethod: tx.paymentMethod || 'CASH_ON_DELIVERY',
          subtotal: Number(tx.amount) || 0,
          shippingCost: 0,
          total: Number(tx.amount) || 0,
          shippingAddress: {
            fullName: tx.seller?.fullName || 'البائع',
            phone: tx.seller?.phone || '',
            governorate: '',
            city: '',
            street: '',
          },
          items: tx.listing ? [{
            id: tx.id,
            listing: {
              id: tx.listing.id,
              price: Number(tx.amount) || 0,
              item: tx.listing.item || { id: '', title: 'منتج', images: [] },
            },
            quantity: 1,
            price: Number(tx.amount) || 0,
          }] : [],
          createdAt: tx.createdAt,
          trackingNumber: tx.trackingNumber,
          isDirectTransaction: true,
          deliveryStatus: tx.deliveryStatus,
          seller: tx.seller,
        }));

        allOrders.push(...convertedTransactions);
      }

      // Sort by date (newest first)
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setOrders(allOrders);
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
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">أنت المشتري</span>
              </div>
              <h1 className="text-2xl font-bold text-primary-600 mt-1">📋 تابع طلباتي</h1>
              <p className="text-sm text-gray-500 mt-1">المنتجات التي اشتريتها وحالة توصيلها</p>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Link href="/dashboard" className="text-primary-600 hover:underline text-sm">
                العودة للوحة التحكم
              </Link>
              <Link href="/dashboard/sales" className="text-sm text-gray-500 hover:text-primary-600">
                📥 طلبات على منتجاتي (كبائع) ←
              </Link>
            </div>
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
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-gray-900">طلب #{order.orderNumber}</p>
                        {order.isDirectTransaction && (
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                            شراء مباشر
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>

                  {/* Product images and names */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-2">
                      {order.items.slice(0, 3).map((item) => (
                        <div key={item.id} className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                          {item.listing?.item?.images?.[0] ? (
                            <img
                              src={item.listing.item.images[0]}
                              alt={item.listing.item?.title || 'منتج'}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">📷</div>
                          )}
                        </div>
                      ))}
                      {order.items.length > 3 && (
                        <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-sm text-gray-600">
                          +{order.items.length - 3}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {order.items.map(item => item.listing?.item?.title || 'منتج').join('، ')}
                    </p>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className={`px-2 py-1 rounded text-xs ${PAYMENT_STATUS_COLORS[order.paymentStatus] || 'bg-gray-100'}`}>
                      {order.paymentMethod === 'COD' || order.paymentMethod === 'CASH_ON_DELIVERY' ? 'الدفع عند الاستلام' :
                       order.paymentMethod === 'INSTAPAY' ? 'إنستاباي' :
                       order.paymentMethod === 'FAWRY' ? 'فوري' : order.paymentMethod}
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
                      {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                    </span>
                  </div>

                  {/* Order Tracking Timeline */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <h3 className="font-semibold mb-2 text-center">
                      {selectedOrder.isProperty ? 'مراحل شراء العقار' : 'تتبع الطلب'}
                    </h3>
                    <OrderTracking
                      status={selectedOrder.status}
                      isCOD={selectedOrder.paymentMethod === 'COD' || selectedOrder.paymentMethod === 'CASH_ON_DELIVERY'}
                      isProperty={selectedOrder.isProperty}
                    />
                  </div>

                  {/* Items */}
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-semibold mb-3">المنتجات</h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {item.listing.item?.images?.[0] && (
                              <img
                                src={item.listing.item.images[0]}
                                alt={item.listing.item.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.listing.item?.title}</p>
                            <p className="text-sm text-gray-600">الكمية: {item.quantity}</p>
                          </div>
                          <div className="text-left">
                            <p className="font-medium">{item.price.toLocaleString()} ج.م</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address - Only for physical items, not properties */}
                  {!selectedOrder.isProperty && (
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
                  )}

                  {/* Property Location - Only for properties */}
                  {selectedOrder.isProperty && selectedOrder.seller && (
                    <div className="border-t pt-4 mb-4">
                      <h3 className="font-semibold mb-2">بيانات البائع</h3>
                      <div className="text-sm text-gray-600">
                        <p className="font-medium text-gray-900">{selectedOrder.seller.fullName}</p>
                        <p dir="ltr" className="text-left">{selectedOrder.seller.phone}</p>
                        <p className="text-xs text-gray-500 mt-2">
                          سيتم التواصل معك لترتيب موعد المعاينة
                        </p>
                      </div>
                    </div>
                  )}

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

export default function OrdersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    }>
      <OrdersContent />
    </Suspense>
  );
}
