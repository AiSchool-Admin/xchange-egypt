'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface TrackingEvent {
  id: string;
  status: string;
  location: string;
  description: string;
  timestamp: string;
  icon: string;
}

interface DeliveryInfo {
  id: string;
  orderNumber: string;
  status: 'PENDING' | 'PICKED_UP' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'FAILED';
  estimatedDelivery: string;
  actualDelivery?: string;
  shippingMethod: string;
  carrier: string;
  trackingNumber: string;
  sender: {
    name: string;
    address: string;
    phone: string;
  };
  receiver: {
    name: string;
    address: string;
    phone: string;
  };
  package: {
    weight: string;
    dimensions: string;
    description: string;
  };
  events: TrackingEvent[];
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  driver?: {
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
  };
}

const mockDelivery: DeliveryInfo = {
  id: '1',
  orderNumber: 'XCH-2024-001234',
  status: 'OUT_FOR_DELIVERY',
  estimatedDelivery: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
  shippingMethod: 'توصيل في نفس اليوم',
  carrier: 'Xchange Express',
  trackingNumber: 'XE123456789EG',
  sender: {
    name: 'متجر التقنية الحديثة',
    address: 'المعادي، القاهرة',
    phone: '+20 100 123 4567',
  },
  receiver: {
    name: 'أحمد محمد',
    address: 'شارع التحرير، مدينة نصر، القاهرة',
    phone: '+20 101 234 5678',
  },
  package: {
    weight: '0.5 كجم',
    dimensions: '20 × 15 × 10 سم',
    description: 'iPhone 15 Pro Max',
  },
  events: [
    {
      id: '5',
      status: 'OUT_FOR_DELIVERY',
      location: 'مدينة نصر',
      description: 'الطرد في الطريق إليك',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      icon: '🚚',
    },
    {
      id: '4',
      status: 'ARRIVED_AT_HUB',
      location: 'مركز فرز مدينة نصر',
      description: 'وصل الطرد إلى مركز التوزيع المحلي',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      icon: '🏢',
    },
    {
      id: '3',
      status: 'IN_TRANSIT',
      location: 'القاهرة',
      description: 'الطرد في الطريق إلى مركز التوزيع',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      icon: '🚛',
    },
    {
      id: '2',
      status: 'PICKED_UP',
      location: 'المعادي',
      description: 'تم استلام الطرد من البائع',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      icon: '📦',
    },
    {
      id: '1',
      status: 'ORDER_PLACED',
      location: 'أونلاين',
      description: 'تم تأكيد الطلب',
      timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      icon: '✓',
    },
  ],
  currentLocation: {
    lat: 30.0444,
    lng: 31.2357,
    address: 'طريق النصر، مدينة نصر',
  },
  driver: {
    name: 'محمد إبراهيم',
    phone: '+20 102 345 6789',
    vehicle: 'دراجة نارية - رقم اللوحة: ق م ن 1234',
    rating: 4.9,
  },
};

const statusSteps = [
  { key: 'PENDING', label: 'قيد الانتظار', icon: '⏳' },
  { key: 'PICKED_UP', label: 'تم الاستلام', icon: '📦' },
  { key: 'IN_TRANSIT', label: 'في الطريق', icon: '🚛' },
  { key: 'OUT_FOR_DELIVERY', label: 'جاري التوصيل', icon: '🚚' },
  { key: 'DELIVERED', label: 'تم التسليم', icon: '✅' },
];

const formatTime = (timestamp: string) => {
  return new Date(timestamp).toLocaleString('ar-EG', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatTimeRemaining = (timestamp: string) => {
  const diff = new Date(timestamp).getTime() - Date.now();
  if (diff <= 0) return 'الآن';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours} ساعة و ${minutes} دقيقة`;
  }
  return `${minutes} دقيقة`;
};

export default function TrackingPage() {
  const params = useParams();
  const [delivery, setDelivery] = useState<DeliveryInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showMap, setShowMap] = useState(true);

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setDelivery(mockDelivery);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const getCurrentStepIndex = () => {
    if (!delivery) return 0;
    return statusSteps.findIndex(step => step.key === delivery.status);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل معلومات الشحنة...</p>
        </div>
      </div>
    );
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">📦</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">الشحنة غير موجودة</h1>
          <p className="text-gray-600 mb-6">تأكد من رقم التتبع وحاول مرة أخرى</p>
          <Link
            href="/orders"
            className="inline-block px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            العودة لطلباتي
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-primary-200 mb-1">رقم الطلب: {delivery.orderNumber}</p>
              <h1 className="text-2xl md:text-3xl font-bold">تتبع شحنتك</h1>
            </div>
            <div className="text-left">
              <p className="text-primary-200 mb-1">رقم التتبع</p>
              <p className="font-mono text-lg font-bold">{delivery.trackingNumber}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Estimated Delivery Banner */}
      {delivery.status !== 'DELIVERED' && (
        <div className="max-w-7xl mx-auto px-4 -mt-4">
          <div className="bg-white rounded-xl shadow-lg p-4 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                ⏱️
              </div>
              <div>
                <p className="text-gray-500 text-sm">الوصول المتوقع خلال</p>
                <p className="text-xl font-bold text-gray-900">
                  {formatTimeRemaining(delivery.estimatedDelivery)}
                </p>
              </div>
            </div>
            {delivery.driver && (
              <div className="flex items-center gap-4">
                <div className="text-left">
                  <p className="font-medium text-gray-900">{delivery.driver.name}</p>
                  <p className="text-sm text-gray-500">⭐ {delivery.driver.rating}</p>
                </div>
                <a
                  href={`tel:${delivery.driver.phone}`}
                  className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600 transition-colors"
                >
                  📞
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Progress Steps */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">حالة الشحنة</h2>

              <div className="flex items-center justify-between relative">
                {/* Progress Line */}
                <div className="absolute top-6 right-6 left-6 h-1 bg-gray-200 -z-0">
                  <div
                    className="h-full bg-primary-500 transition-all duration-500"
                    style={{ width: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
                  ></div>
                </div>

                {statusSteps.map((step, index) => (
                  <div key={step.key} className="flex flex-col items-center relative z-10">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-xl transition-all ${
                        index <= currentStep
                          ? 'bg-primary-500 text-white'
                          : 'bg-gray-200 text-gray-400'
                      } ${index === currentStep ? 'ring-4 ring-primary-200 scale-110' : ''}`}
                    >
                      {step.icon}
                    </div>
                    <span className={`mt-2 text-sm font-medium ${
                      index <= currentStep ? 'text-primary-600' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Map Section */}
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900">🗺️ موقع الشحنة</h2>
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="text-primary-600 text-sm hover:underline"
                >
                  {showMap ? 'إخفاء الخريطة' : 'إظهار الخريطة'}
                </button>
              </div>

              {showMap && (
                <div className="relative h-64 md:h-80 bg-gray-100">
                  {/* Placeholder for actual map */}
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-100 to-green-100">
                    <div className="text-center">
                      <div className="text-6xl mb-4">🗺️</div>
                      <p className="text-gray-600 font-medium">{delivery.currentLocation.address}</p>
                      <p className="text-sm text-gray-500 mt-2">
                        الإحداثيات: {delivery.currentLocation.lat.toFixed(4)}, {delivery.currentLocation.lng.toFixed(4)}
                      </p>
                    </div>
                  </div>

                  {/* Simulated moving marker */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="relative">
                      <div className="w-12 h-12 bg-primary-500 rounded-full flex items-center justify-center text-white text-2xl shadow-lg animate-bounce">
                        🚚
                      </div>
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-2 bg-black/20 rounded-full blur-sm"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-lg font-bold text-gray-900 mb-6">📋 سجل التتبع</h2>

              <div className="space-y-4">
                {delivery.events.map((event, index) => (
                  <div key={event.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                        index === 0 ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {event.icon}
                      </div>
                      {index < delivery.events.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-2"></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between">
                        <span className={`font-medium ${index === 0 ? 'text-primary-600' : 'text-gray-900'}`}>
                          {event.description}
                        </span>
                        <span className="text-sm text-gray-500">{formatTime(event.timestamp)}</span>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">📍 {event.location}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Driver Info */}
            {delivery.driver && delivery.status === 'OUT_FOR_DELIVERY' && (
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h3 className="font-bold text-gray-900 mb-4">🚚 المندوب</h3>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-14 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-bold text-xl">
                    {delivery.driver.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{delivery.driver.name}</p>
                    <p className="text-sm text-gray-500">⭐ {delivery.driver.rating} تقييم</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">{delivery.driver.vehicle}</p>
                <a
                  href={`tel:${delivery.driver.phone}`}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
                >
                  <span>📞</span>
                  اتصل بالمندوب
                </a>
              </div>
            )}

            {/* Package Info */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">📦 معلومات الطرد</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">الوصف</span>
                  <span className="text-gray-900">{delivery.package.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الوزن</span>
                  <span className="text-gray-900">{delivery.package.weight}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">الأبعاد</span>
                  <span className="text-gray-900">{delivery.package.dimensions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">طريقة الشحن</span>
                  <span className="text-gray-900">{delivery.shippingMethod}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">شركة الشحن</span>
                  <span className="text-gray-900">{delivery.carrier}</span>
                </div>
              </div>
            </div>

            {/* Addresses */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">📍 العناوين</h3>

              <div className="space-y-4">
                <div className="p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600">📤</span>
                    <span className="font-medium text-green-800">من</span>
                  </div>
                  <p className="font-bold text-gray-900">{delivery.sender.name}</p>
                  <p className="text-sm text-gray-600">{delivery.sender.address}</p>
                </div>

                <div className="flex justify-center">
                  <span className="text-2xl">↓</span>
                </div>

                <div className="p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-blue-600">📥</span>
                    <span className="font-medium text-blue-800">إلى</span>
                  </div>
                  <p className="font-bold text-gray-900">{delivery.receiver.name}</p>
                  <p className="text-sm text-gray-600">{delivery.receiver.address}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="font-bold text-gray-900 mb-4">⚡ إجراءات سريعة</h3>
              <div className="space-y-3">
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <span>📍</span>
                  تغيير عنوان التسليم
                </button>
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <span>📅</span>
                  إعادة جدولة التسليم
                </button>
                <button className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <span>💬</span>
                  الإبلاغ عن مشكلة
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
