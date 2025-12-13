'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  getMyDeliveryBookings,
  DeliveryBooking,
  DELIVERY_PROVIDERS,
  DELIVERY_STATUSES,
} from '@/lib/api/delivery';

// ============================================
// Delivery Page - صفحة التوصيل
// ============================================

export default function DeliveryPage() {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<DeliveryBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'sent' | 'received'>('sent');

  useEffect(() => {
    if (isAuthenticated) {
      loadBookings();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, activeTab]);

  const loadBookings = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await getMyDeliveryBookings({ type: activeTab });
      setBookings(response.data.bookings || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل الشحنات');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    return DELIVERY_STATUSES[status as keyof typeof DELIVERY_STATUSES] || {
      label: status,
      color: 'gray',
      icon: '📦',
    };
  };

  const getProviderInfo = (provider: string) => {
    return DELIVERY_PROVIDERS[provider as keyof typeof DELIVERY_PROVIDERS] || {
      nameAr: provider,
      icon: '📦',
      color: 'gray',
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-2xl shadow-sm max-w-md">
          <div className="text-6xl mb-4">🚚</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">خدمة التوصيل</h1>
          <p className="text-gray-600 mb-6">
            قم بتسجيل الدخول لإدارة شحناتك
          </p>
          <Link
            href="/login?redirect=/delivery"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-teal-600 to-cyan-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">🚚 خدمة التوصيل</h1>
              <p className="text-teal-100 mt-1">
                تتبع شحناتك ومشترياتك
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab('sent')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'sent'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📤 شحنات مرسلة
          </button>
          <button
            onClick={() => setActiveTab('received')}
            className={`px-6 py-3 rounded-xl font-medium transition ${
              activeTab === 'received'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            📥 شحنات مستلمة
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
            {error}
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-block w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-4 text-gray-600">جاري تحميل الشحنات...</p>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد شحنات</h3>
            <p className="text-gray-600 mb-6">
              {activeTab === 'sent'
                ? 'لم ترسل أي شحنات بعد'
                : 'لم تستلم أي شحنات بعد'}
            </p>
            <Link
              href="/items"
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-white rounded-xl font-medium hover:bg-teal-600 transition"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => {
              const statusInfo = getStatusInfo(booking.status);
              const providerInfo = getProviderInfo(booking.provider);

              return (
                <div
                  key={booking.id}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      {/* Provider & Status */}
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center text-2xl">
                          {providerInfo.icon}
                        </div>
                        <div>
                          <h3 className="font-bold text-gray-900">
                            {providerInfo.nameAr}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatDate(booking.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-${statusInfo.color}-100 text-${statusInfo.color}-700`}
                      >
                        <span>{statusInfo.icon}</span>
                        {statusInfo.label}
                      </div>
                    </div>

                    {/* Route */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <p className="text-xs text-gray-500">من</p>
                          <p className="font-medium text-gray-900">
                            {booking.pickupCity}, {booking.pickupGovernorate}
                          </p>
                        </div>
                        <div className="text-2xl text-gray-400">→</div>
                        <div className="flex-1 text-left">
                          <p className="text-xs text-gray-500">إلى</p>
                          <p className="font-medium text-gray-900">
                            {booking.deliveryCity}, {booking.deliveryGovernorate}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-500">تكلفة التوصيل</p>
                        <p className="font-bold text-gray-900">
                          {formatPrice(booking.deliveryCost)}
                        </p>
                      </div>
                      {booking.isCOD && booking.codAmount && (
                        <div>
                          <p className="text-xs text-gray-500">مبلغ الدفع عند الاستلام</p>
                          <p className="font-bold text-gray-900">
                            {formatPrice(booking.codAmount)}
                          </p>
                        </div>
                      )}
                      {booking.estimatedDelivery && (
                        <div>
                          <p className="text-xs text-gray-500">الموعد المتوقع</p>
                          <p className="font-bold text-gray-900">
                            {formatDate(booking.estimatedDelivery)}
                          </p>
                        </div>
                      )}
                      <div>
                        <p className="text-xs text-gray-500">الإجمالي</p>
                        <p className="font-bold text-teal-600">
                          {formatPrice(booking.totalCost)}
                        </p>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="mt-4 flex gap-2 flex-wrap">
                      {booking.hasInsurance && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">
                          🛡️ مؤمن
                        </span>
                      )}
                      {booking.isCOD && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">
                          💵 دفع عند الاستلام
                        </span>
                      )}
                      {booking.isFragile && (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-sm rounded-full">
                          ⚠️ قابل للكسر
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Info Section */}
        <div className="mt-12 p-6 bg-teal-50 rounded-2xl">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📦 شركاء التوصيل</h3>
          <div className="grid md:grid-cols-4 gap-4">
            {Object.entries(DELIVERY_PROVIDERS).map(([key, provider]) => (
              <div key={key} className="bg-white p-4 rounded-xl text-center">
                <div className="text-3xl mb-2">{provider.icon}</div>
                <p className="font-bold text-gray-900">{provider.nameAr}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
