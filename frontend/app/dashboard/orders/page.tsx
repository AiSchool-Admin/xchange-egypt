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
    if (!confirm('Are you sure you want to cancel this order?')) return;

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
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">My Orders</h1>
            <Link href="/dashboard" className="text-primary-600 hover:underline">
              Back to Dashboard
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
                <h3 className="font-bold text-green-800">Order Placed Successfully!</h3>
                <p className="text-green-700 text-sm">
                  Your order has been confirmed. You will receive updates via notification.
                </p>
                {fawryRef && (
                  <p className="text-green-800 font-medium mt-2">
                    Fawry Reference: <code className="bg-green-100 px-2 py-1 rounded">{fawryRef}</code>
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <Link
              href="/items"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Browse Items
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
                      <p className="font-bold text-gray-900">Order #{order.orderNumber}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('en-EG', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[order.status]}`}>
                      {order.status}
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
                      {order.paymentMethod} - {order.paymentStatus}
                    </span>
                    <span className="font-bold text-primary-600">
                      EGP {order.total.toLocaleString()}
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
                      <h2 className="text-xl font-bold">Order #{selectedOrder.orderNumber}</h2>
                      <p className="text-sm text-gray-500">
                        {new Date(selectedOrder.createdAt).toLocaleString('en-EG')}
                      </p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedOrder.status]}`}>
                      {selectedOrder.status}
                    </span>
                  </div>

                  {/* Items */}
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-semibold mb-3">Items</h3>
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
                            <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">EGP {item.price.toLocaleString()}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address */}
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-semibold mb-2">Shipping Address</h3>
                    <div className="text-sm text-gray-600">
                      <p className="font-medium text-gray-900">{selectedOrder.shippingAddress.fullName}</p>
                      <p>{selectedOrder.shippingAddress.phone}</p>
                      <p>
                        {selectedOrder.shippingAddress.street}
                        {selectedOrder.shippingAddress.building && `, Bldg ${selectedOrder.shippingAddress.building}`}
                        {selectedOrder.shippingAddress.floor && `, Floor ${selectedOrder.shippingAddress.floor}`}
                        {selectedOrder.shippingAddress.apartment && `, Apt ${selectedOrder.shippingAddress.apartment}`}
                      </p>
                      <p>
                        {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.governorate}
                      </p>
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="border-t pt-4 mb-4">
                    <h3 className="font-semibold mb-2">Payment</h3>
                    <div className="flex justify-between text-sm">
                      <span>Method:</span>
                      <span className="font-medium">{selectedOrder.paymentMethod}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Status:</span>
                      <span className={`px-2 py-0.5 rounded text-xs ${PAYMENT_STATUS_COLORS[selectedOrder.paymentStatus]}`}>
                        {selectedOrder.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="border-t pt-4">
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        <span>EGP {selectedOrder.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span>EGP {selectedOrder.shippingCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg pt-2 border-t">
                        <span>Total</span>
                        <span className="text-primary-600">EGP {selectedOrder.total.toLocaleString()}</span>
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
                        Cancel Order
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <div className="text-4xl mb-3">👆</div>
                  <p className="text-gray-600">Select an order to view details</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
