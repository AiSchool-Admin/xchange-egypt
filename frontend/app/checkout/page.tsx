'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';

const EGYPTIAN_GOVERNORATES = [
  'Cairo', 'Alexandria', 'Giza', 'Shubra El Kheima', 'Port Said',
  'Suez', 'Luxor', 'Mansoura', 'El-Mahalla El-Kubra', 'Tanta',
  'Asyut', 'Ismailia', 'Faiyum', 'Zagazig', 'Aswan', 'Damietta',
  'Damanhur', 'Minya', 'Beni Suef', 'Qena', 'Sohag', 'Hurghada',
  'Shibin El Kom', 'Banha', 'Kafr El Sheikh', 'Arish', 'Mallawi',
  '10th of Ramadan', 'Bilbais', 'Marsa Matruh'
];

interface CartItem {
  id: string;
  listing: {
    id: string;
    title: string;
    price: number;
    images: string[];
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
    building: '',
    floor: '',
    apartment: '',
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
      setShippingAddress(prev => ({
        ...prev,
        fullName: user.fullName || '',
        phone: user.phone || '',
      }));
    }
  }, [user]);

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

  const fetchCart = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.ok) {
        const data = await response.json();
        setCart(data);
        if (!data || data.items.length === 0) {
          router.push('/cart');
        }
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cart || cart.items.length === 0) return;

    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
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
        const order = await response.json();

        if (paymentMethod === 'COD') {
          router.push(`/dashboard/orders?success=${order.id}`);
        } else if (paymentMethod === 'INSTAPAY') {
          // Redirect to InstaPay
          const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/instapay/initiate`, {
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
          // Show Fawry reference
          const paymentResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/fawry/initiate`, {
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
        const error = await response.json();
        alert(error.message || 'Failed to create order');
      }
    } catch (error) {
      console.error('Failed to create order:', error);
      alert('Failed to create order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user || !cart) {
    return null;
  }

  const totalAmount = cart.totalPrice + shippingCost;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-primary-600">Checkout</h1>
            <Link href="/cart" className="text-primary-600 hover:underline">
              Back to Cart
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
                <h2 className="text-xl font-bold mb-4">Shipping Address</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name *
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
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingAddress.phone}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Governorate *
                    </label>
                    <select
                      required
                      value={shippingAddress.governorate}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, governorate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    >
                      <option value="">Select Governorate</option>
                      {EGYPTIAN_GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City *
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
                      Street Address *
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
                      Building
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.building}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, building: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Floor
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
                        Apt
                      </label>
                      <input
                        type="text"
                        value={shippingAddress.apartment}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, apartment: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Landmark (optional)
                    </label>
                    <input
                      type="text"
                      value={shippingAddress.landmark}
                      onChange={(e) => setShippingAddress({ ...shippingAddress, landmark: e.target.value })}
                      placeholder="Near mosque, school, etc."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold mb-4">Payment Method</h2>
                <div className="space-y-3">
                  <label className="flex items-center p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="COD"
                      checked={paymentMethod === 'COD'}
                      onChange={() => setPaymentMethod('COD')}
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Cash on Delivery</div>
                      <div className="text-sm text-gray-600">Pay when you receive your order</div>
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
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">InstaPay</div>
                      <div className="text-sm text-gray-600">Pay instantly via InstaPay</div>
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
                      className="mr-3"
                    />
                    <div className="flex-1">
                      <div className="font-semibold">Fawry</div>
                      <div className="text-sm text-gray-600">Pay at any Fawry outlet</div>
                    </div>
                    <span className="text-2xl">🏪</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 className="text-xl font-bold mb-4">Order Summary</h2>

                {/* Items */}
                <div className="space-y-3 mb-4 max-h-48 overflow-y-auto">
                  {cart.items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                        {item.listing.images?.[0] && (
                          <img
                            src={item.listing.images[0]}
                            alt={item.listing.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.listing.title}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                      <div className="text-sm font-medium">
                        EGP {(item.listing.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span>EGP {cart.totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span>
                      {shippingCost > 0 ? `EGP ${shippingCost}` : 'Select governorate'}
                    </span>
                  </div>
                </div>

                <div className="border-t pt-4 mb-6">
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span className="text-primary-600">
                      EGP {totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting || !shippingAddress.governorate}
                  className="w-full py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Processing...' : 'Place Order'}
                </button>
              </div>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
