'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
  street?: string;
  address?: string;
  building?: string;
  floor?: string;
  apartment?: string;
}

interface Buyer {
  id: string;
  fullName: string;
  phone: string;
  email: string;
}

interface Order {
  id: string;
  orderNumber: string;
  status: string;
  paymentStatus?: string;
  paymentMethod: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  shippingAddress: ShippingAddress;
  user: Buyer;
  items: OrderItem[];
  createdAt: string;
  trackingNumber?: string;
  // For direct transactions
  isDirectTransaction?: boolean;
  buyer?: Buyer;
  listing?: {
    item: {
      id: string;
      title: string;
      images: string[];
    };
    price: number;
  };
  amount?: number;
  deliveryStatus?: string;
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PAID: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-purple-100 text-purple-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'قيد الانتظار',
  PAID: 'مدفوع',
  PROCESSING: 'جاري التجهيز',
  SHIPPED: 'تم الشحن',
  DELIVERED: 'تم التسليم',
  CANCELLED: 'ملغي',
};

export default function SellerSalesPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchSellerOrders();
    }
  }, [user, statusFilter]);

  const fetchSellerOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');

      // Fetch both cart orders and direct transactions
      const [ordersRes, transactionsRes] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/seller${statusFilter ? `?status=${statusFilter}` : ''}`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/my?role=seller`, {
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
            fullName: tx.buyer?.fullName || 'المشتري',
            phone: tx.buyer?.phone || '',
            governorate: '',
            city: '',
          },
          user: tx.buyer || { id: tx.buyerId, fullName: 'المشتري', phone: '', email: '' },
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
        }));

        // Filter by status if needed
        const filtered = statusFilter
          ? convertedTransactions.filter((t: Order) => t.status === statusFilter || t.deliveryStatus === statusFilter)
          : convertedTransactions;

        allOrders.push(...filtered);
      }

      // Sort by date (newest first)
      allOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      setOrders(allOrders);
    } catch (error) {
      console.error('Failed to fetch seller orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('accessToken');
      const order = orders.find(o => o.id === orderId);

      // Use different API for direct transactions vs cart orders
      if (order?.isDirectTransaction) {
        // Update transaction delivery status
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${orderId}/delivery-status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            deliveryStatus: newStatus,
            trackingNumber: trackingNumber || undefined,
          }),
        });

        if (response.ok) {
          await fetchSellerOrders();
          setSelectedOrder(null);
          setTrackingNumber('');
        } else {
          const error = await response.json();
          alert(error.message || 'فشل تحديث حالة الطلب');
        }
      } else {
        // Update cart order status
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/seller/${orderId}/status`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: newStatus,
            trackingNumber: trackingNumber || undefined,
          }),
        });

        if (response.ok) {
          await fetchSellerOrders();
          setSelectedOrder(null);
          setTrackingNumber('');
        } else {
          const error = await response.json();
          alert(error.message || 'فشل تحديث حالة الطلب');
        }
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
      alert('حدث خطأ أثناء تحديث الطلب');
    } finally {
      setUpdatingStatus(false);
    }
  };

  // Helper to get effective status for both orders and transactions
  const getEffectiveStatus = (order: Order) => {
    if (order.isDirectTransaction) {
      return order.deliveryStatus || order.paymentStatus || 'PENDING';
    }
    return order.status;
  };

  // Confirm payment for direct transactions
  const confirmPayment = async (transactionId: string) => {
    setUpdatingStatus(true);
    try {
      const token = localStorage.getItem('accessToken');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/${transactionId}/confirm-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        await fetchSellerOrders();
        // Update selectedOrder with new payment status
        const updatedOrders = await response.json();
        setSelectedOrder(prev => prev ? { ...prev, paymentStatus: 'COMPLETED' } : null);
      } else {
        const error = await response.json();
        alert(error.message || 'فشل تأكيد الدفع');
      }
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      alert('حدث خطأ أثناء تأكيد الدفع');
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const pendingCount = orders.filter(o => o.status === 'PENDING' || o.status === 'PAID').length;
  const processingCount = orders.filter(o => o.status === 'PROCESSING').length;
  const shippedCount = orders.filter(o => o.status === 'SHIPPED').length;

  return (
    <div dir="rtl" className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-primary-600">المبيعات والطلبات الواردة</h1>
              <p className="text-sm text-gray-500 mt-1">إدارة الطلبات على منتجاتك</p>
            </div>
            <Link href="/dashboard" className="text-primary-600 hover:underline">
              العودة للوحة التحكم
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
            <div className="text-sm text-yellow-700">طلبات جديدة</div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-purple-600">{processingCount}</div>
            <div className="text-sm text-purple-700">جاري التجهيز</div>
          </div>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-center">
            <div className="text-3xl font-bold text-indigo-600">{shippedCount}</div>
            <div className="text-sm text-indigo-700">تم الشحن</div>
          </div>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">تصفية حسب الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">جميع الطلبات</option>
              <option value="PENDING">قيد الانتظار</option>
              <option value="PAID">مدفوع</option>
              <option value="PROCESSING">جاري التجهيز</option>
              <option value="SHIPPED">تم الشحن</option>
              <option value="DELIVERED">تم التسليم</option>
            </select>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">لا توجد طلبات بعد</h2>
            <p className="text-gray-600 mb-6">ستظهر طلبات العملاء على منتجاتك هنا</p>
            <Link
              href="/items"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              أضف منتجات للبيع
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
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {STATUS_LABELS[order.status] || order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    {order.items.slice(0, 3).map((item) => (
                      <div key={item.id} className="w-12 h-12 bg-gray-100 rounded overflow-hidden">
                        {item.listing?.item?.images?.[0] && (
                          <img
                            src={item.listing.item.images[0]}
                            alt={item.listing.item.title}
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
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{order.user?.fullName}</span>
                      <span className="mx-2">•</span>
                      <span>{order.shippingAddress?.governorate}</span>
                    </div>
                    <span className="font-bold text-primary-600">
                      {order.items.reduce((sum, item) => sum + item.price, 0).toLocaleString()} ج.م
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Details */}
            <div className="lg:sticky lg:top-4">
              {selectedOrder ? (
                <div className="bg-white rounded-xl shadow-lg p-6 max-h-[calc(100vh-120px)] overflow-y-auto">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-bold">طلب #{selectedOrder.orderNumber}</h2>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}
                      </p>
                      {selectedOrder.isDirectTransaction && (
                        <span className="text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded mt-1 inline-block">
                          شراء مباشر
                        </span>
                      )}
                    </div>
                    <div className="text-left">
                      {selectedOrder.isDirectTransaction ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">الدفع:</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              selectedOrder.paymentStatus === 'COMPLETED' ? 'bg-green-100 text-green-800' :
                              selectedOrder.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {selectedOrder.paymentStatus === 'COMPLETED' ? 'مكتمل' :
                               selectedOrder.paymentStatus === 'PENDING' ? 'في الانتظار' :
                               selectedOrder.paymentStatus}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-gray-500">التوصيل:</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[selectedOrder.deliveryStatus || 'PENDING']}`}>
                              {STATUS_LABELS[selectedOrder.deliveryStatus || 'PENDING'] || selectedOrder.deliveryStatus}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedOrder.status]}`}>
                          {STATUS_LABELS[selectedOrder.status] || selectedOrder.status}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Buyer Info */}
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <span>👤</span> بيانات المشتري
                    </h3>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p className="font-medium text-gray-900">{selectedOrder.user?.fullName}</p>
                      <p dir="ltr" className="text-left">{selectedOrder.user?.phone}</p>
                      {selectedOrder.user?.email && <p>{selectedOrder.user?.email}</p>}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <span>📦</span> المنتجات المطلوبة
                    </h3>
                    <div className="space-y-3 max-h-48 overflow-y-auto">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex gap-3">
                          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                            {item.listing?.item?.images?.[0] && (
                              <img
                                src={item.listing.item.images[0]}
                                alt={item.listing.item.title}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.listing?.item?.title}</p>
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
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <span>📍</span> عنوان الشحن
                    </h3>
                    <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                      <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                      <p dir="ltr" className="text-left">{selectedOrder.shippingAddress.phone}</p>
                      <p>
                        {selectedOrder.shippingAddress.street || selectedOrder.shippingAddress.address}
                        {selectedOrder.shippingAddress.building && `، مبنى ${selectedOrder.shippingAddress.building}`}
                        {selectedOrder.shippingAddress.floor && `، الدور ${selectedOrder.shippingAddress.floor}`}
                        {selectedOrder.shippingAddress.apartment && `، شقة ${selectedOrder.shippingAddress.apartment}`}
                      </p>
                      <p className="font-medium">
                        {selectedOrder.shippingAddress.city}، {selectedOrder.shippingAddress.governorate}
                      </p>
                    </div>
                  </div>

                  {/* Payment & Summary */}
                  <div className="border-t pt-4 mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-600">طريقة الدفع:</span>
                      <span className="font-medium">
                        {selectedOrder.paymentMethod === 'COD' ? 'الدفع عند الاستلام' :
                         selectedOrder.paymentMethod === 'INSTAPAY' ? 'إنستاباي' :
                         selectedOrder.paymentMethod === 'FAWRY' ? 'فوري' : selectedOrder.paymentMethod}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t">
                      <span>إجمالي مبيعاتك</span>
                      <span className="text-green-600">
                        {selectedOrder.items.reduce((sum, item) => sum + item.price, 0).toLocaleString()} ج.م
                      </span>
                    </div>
                  </div>

                  {/* Tracking Number (for shipped orders) */}
                  {selectedOrder.trackingNumber && (
                    <div className="border-t pt-4 mb-4">
                      <h3 className="font-semibold mb-2">رقم التتبع</h3>
                      <p className="bg-gray-100 px-3 py-2 rounded font-mono">{selectedOrder.trackingNumber}</p>
                    </div>
                  )}

                  {/* Actions for Direct Transactions */}
                  {selectedOrder.isDirectTransaction ? (
                    <div className="border-t pt-4 space-y-3">
                      {/* Direct Transaction Workflow: PENDING -> confirm payment -> SHIPPED -> DELIVERED */}
                      {selectedOrder.deliveryStatus === 'PENDING' && (
                        <>
                          {selectedOrder.paymentStatus !== 'COMPLETED' ? (
                            // Step 1: Confirm payment first
                            <button
                              onClick={() => confirmPayment(selectedOrder.id)}
                              disabled={updatingStatus}
                              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                            >
                              {updatingStatus ? 'جاري التحديث...' : 'تأكيد استلام الدفع'}
                            </button>
                          ) : (
                            // Step 2: Mark as shipped (payment already confirmed)
                            <>
                              <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="رقم التتبع (اختياري)"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                              />
                              <button
                                onClick={() => updateOrderStatus(selectedOrder.id, 'SHIPPED')}
                                disabled={updatingStatus}
                                className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                              >
                                {updatingStatus ? 'جاري التحديث...' : 'تم الشحن'}
                              </button>
                            </>
                          )}
                        </>
                      )}

                      {selectedOrder.deliveryStatus === 'SHIPPED' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'DELIVERED')}
                          disabled={updatingStatus}
                          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                        >
                          {updatingStatus ? 'جاري التحديث...' : 'تأكيد التسليم'}
                        </button>
                      )}

                      {selectedOrder.deliveryStatus === 'DELIVERED' && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
                          <span className="text-2xl mb-2 block">✅</span>
                          تم إتمام هذا الطلب بنجاح
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Actions for Cart-based Orders */
                    <div className="border-t pt-4 space-y-3">
                      {(selectedOrder.status === 'PENDING' || selectedOrder.status === 'PAID') && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'PROCESSING')}
                          disabled={updatingStatus}
                          className="w-full py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
                        >
                          {updatingStatus ? 'جاري التحديث...' : 'بدء تجهيز الطلب'}
                        </button>
                      )}

                      {selectedOrder.status === 'PROCESSING' && (
                        <>
                          <input
                            type="text"
                            value={trackingNumber}
                            onChange={(e) => setTrackingNumber(e.target.value)}
                            placeholder="رقم التتبع (اختياري)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          />
                          <button
                            onClick={() => updateOrderStatus(selectedOrder.id, 'SHIPPED')}
                            disabled={updatingStatus}
                            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium disabled:opacity-50"
                          >
                            {updatingStatus ? 'جاري التحديث...' : 'تم الشحن'}
                          </button>
                        </>
                      )}

                      {selectedOrder.status === 'SHIPPED' && (
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'DELIVERED')}
                          disabled={updatingStatus}
                          className="w-full py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium disabled:opacity-50"
                        >
                          {updatingStatus ? 'جاري التحديث...' : 'تأكيد التسليم'}
                        </button>
                      )}

                      {selectedOrder.status === 'DELIVERED' && (
                        <div className="bg-green-50 text-green-700 p-4 rounded-lg text-center">
                          <span className="text-2xl mb-2 block">✅</span>
                          تم إتمام هذا الطلب بنجاح
                        </div>
                      )}
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
