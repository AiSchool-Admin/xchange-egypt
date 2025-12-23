'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface OpenRequest {
  id: string;
  serviceType: 'SHIPPING' | 'INTERCITY_RIDE';
  pickup: {
    governorate: string;
    city: string;
    address: string;
  };
  dropoff: {
    governorate: string;
    city: string;
    address: string;
  };
  scheduledDate: string;
  scheduledTime?: string;
  flexibility: string;
  paymentMethod: string;
  budgetMin?: number;
  budgetMax?: number;
  quotesCount: number;
  createdAt: string;
  expiresAt: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  // Shipping specific
  shippingDetails?: {
    weight: number;
    packageType: string;
    quantity: number;
    fragile: boolean;
  };
  // Ride specific
  rideDetails?: {
    passengers: number;
    luggage: number;
    vehiclePreference?: string;
  };
}

// Mock data
const MOCK_REQUESTS: OpenRequest[] = [
  {
    id: 'req_201',
    serviceType: 'SHIPPING',
    pickup: { governorate: 'القاهرة', city: 'مدينة نصر', address: 'شارع عباس العقاد' },
    dropoff: { governorate: 'الإسكندرية', city: 'سموحة', address: 'شارع فوزي معاذ' },
    scheduledDate: '2024-01-15',
    scheduledTime: '10:00',
    flexibility: 'FLEXIBLE_HOURS',
    paymentMethod: 'CASH',
    budgetMin: 200,
    budgetMax: 400,
    quotesCount: 2,
    createdAt: '2024-01-12T08:00:00Z',
    expiresAt: '2024-01-17T08:00:00Z',
    priority: 'HIGH',
    shippingDetails: {
      weight: 30,
      packageType: 'إلكترونيات',
      quantity: 2,
      fragile: true,
    },
  },
  {
    id: 'req_202',
    serviceType: 'INTERCITY_RIDE',
    pickup: { governorate: 'الجيزة', city: 'الدقي', address: 'ميدان المساحة' },
    dropoff: { governorate: 'البحر الأحمر', city: 'الغردقة', address: 'طريق الجونة' },
    scheduledDate: '2024-01-18',
    scheduledTime: '06:00',
    flexibility: 'EXACT',
    paymentMethod: 'CASH',
    quotesCount: 0,
    createdAt: '2024-01-12T10:00:00Z',
    expiresAt: '2024-01-15T10:00:00Z',
    priority: 'MEDIUM',
    rideDetails: {
      passengers: 4,
      luggage: 3,
      vehiclePreference: 'SUV',
    },
  },
  {
    id: 'req_203',
    serviceType: 'SHIPPING',
    pickup: { governorate: 'الشرقية', city: 'الزقازيق', address: 'شارع الجلاء' },
    dropoff: { governorate: 'القاهرة', city: 'المعادي', address: 'شارع 9' },
    scheduledDate: '2024-01-16',
    flexibility: 'FLEXIBLE_DAYS',
    paymentMethod: 'COD',
    budgetMax: 300,
    quotesCount: 5,
    createdAt: '2024-01-11T14:00:00Z',
    expiresAt: '2024-01-18T14:00:00Z',
    priority: 'LOW',
    shippingDetails: {
      weight: 10,
      packageType: 'مستندات',
      quantity: 1,
      fragile: false,
    },
  },
];

export default function ProviderDashboardPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<OpenRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'shipping' | 'rides'>('all');
  const [selectedRequest, setSelectedRequest] = useState<OpenRequest | null>(null);
  const [showQuoteModal, setShowQuoteModal] = useState(false);

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setRequests(MOCK_REQUESTS);
      setLoading(false);
    }, 500);
  }, []);

  const getFilteredRequests = () => {
    let filtered = [...requests];

    if (filter === 'shipping') {
      filtered = filtered.filter(r => r.serviceType === 'SHIPPING');
    } else if (filter === 'rides') {
      filtered = filtered.filter(r => r.serviceType === 'INTERCITY_RIDE');
    }

    // Sort by priority (HIGH first)
    return filtered.sort((a, b) => {
      const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  };

  const getPriorityBadge = (priority: OpenRequest['priority']) => {
    switch (priority) {
      case 'HIGH':
        return { label: 'في منطقتك', color: 'bg-green-100 text-green-700', icon: '📍' };
      case 'MEDIUM':
        return { label: 'قريب منك', color: 'bg-blue-100 text-blue-700', icon: '📍' };
      case 'LOW':
        return { label: 'مناطق أخرى', color: 'bg-gray-100 text-gray-600', icon: '📍' };
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `منذ ${diffDays} يوم`;
    if (diffHours > 0) return `منذ ${diffHours} ساعة`;
    return 'الآن';
  };

  const formatExpiresIn = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} يوم`;
    if (diffHours > 0) return `${diffHours} ساعة`;
    return 'قريباً';
  };

  const openQuoteModal = (request: OpenRequest) => {
    setSelectedRequest(request);
    setShowQuoteModal(true);
  };

  const filteredRequests = getFilteredRequests();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-green-600 to-green-700 text-white">
        <div className="max-w-3xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => router.push('/marketplace')}
              className="flex items-center gap-2 text-white/80 hover:text-white"
            >
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              رجوع
            </button>
            <Link
              href="/marketplace/provider/my-quotes"
              className="text-white/80 hover:text-white text-sm"
            >
              عروضي
            </Link>
          </div>
          <h1 className="text-2xl font-bold">الطلبات المتاحة</h1>
          <p className="text-green-100 mt-1">تصفح طلبات العملاء وقدم عروضك</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'الكل', icon: '📋' },
            { value: 'shipping', label: 'شحن', icon: '📦' },
            { value: 'rides', label: 'رحلات', icon: '🚗' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as typeof filter)}
              className={`px-4 py-2 rounded-full whitespace-nowrap flex items-center gap-2 ${
                filter === f.value
                  ? 'bg-green-600 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{f.icon}</span>
              {f.label}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {requests.filter(r => r.priority === 'HIGH').length}
            </p>
            <p className="text-xs text-gray-500">في منطقتك</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-blue-600">
              {requests.length}
            </p>
            <p className="text-xs text-gray-500">إجمالي الطلبات</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-600">
              {requests.filter(r => r.quotesCount === 0).length}
            </p>
            <p className="text-xs text-gray-500">بدون عروض</p>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">جاري التحميل...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRequests.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center">
            <span className="text-5xl mb-4 block">📭</span>
            <h3 className="text-lg font-bold mb-2">لا توجد طلبات متاحة</h3>
            <p className="text-gray-600">
              سيتم إشعارك عند وصول طلبات جديدة في مناطق تغطيتك.
            </p>
          </div>
        )}

        {/* Requests List */}
        {!loading && filteredRequests.length > 0 && (
          <div className="space-y-4">
            {filteredRequests.map(request => {
              const priorityBadge = getPriorityBadge(request.priority);

              return (
                <div
                  key={request.id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                    request.priority === 'HIGH' ? 'ring-2 ring-green-300' : ''
                  }`}
                >
                  {/* Priority Banner */}
                  {request.priority === 'HIGH' && (
                    <div className="bg-green-50 px-4 py-2 text-sm text-green-700 font-medium">
                      ⭐ طلب في منطقتك - أولوية عالية
                    </div>
                  )}

                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">
                          {request.serviceType === 'SHIPPING' ? '📦' : '🚗'}
                        </span>
                        <div>
                          <h3 className="font-bold">
                            {request.serviceType === 'SHIPPING' ? 'طلب شحن' : 'طلب رحلة'}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {formatTimeAgo(request.createdAt)} • ينتهي خلال {formatExpiresIn(request.expiresAt)}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${priorityBadge.color}`}>
                        {priorityBadge.icon} {priorityBadge.label}
                      </span>
                    </div>

                    {/* Route */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-green-500">●</span>
                        <span className="font-medium">{request.pickup.governorate}</span>
                        <span className="text-gray-400">-</span>
                        <span className="text-sm text-gray-600">{request.pickup.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-red-500">●</span>
                        <span className="font-medium">{request.dropoff.governorate}</span>
                        <span className="text-gray-400">-</span>
                        <span className="text-sm text-gray-600">{request.dropoff.city}</span>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="flex flex-wrap gap-3 text-sm mb-4">
                      <span className="flex items-center gap-1 text-gray-600">
                        <span>📅</span>
                        {request.scheduledDate}
                        {request.scheduledTime && ` - ${request.scheduledTime}`}
                      </span>

                      {request.shippingDetails && (
                        <>
                          <span className="flex items-center gap-1 text-gray-600">
                            <span>⚖️</span>
                            {request.shippingDetails.weight} كجم
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <span>📋</span>
                            {request.shippingDetails.packageType}
                          </span>
                          {request.shippingDetails.fragile && (
                            <span className="flex items-center gap-1 text-amber-600">
                              <span>⚠️</span>
                              قابل للكسر
                            </span>
                          )}
                        </>
                      )}

                      {request.rideDetails && (
                        <>
                          <span className="flex items-center gap-1 text-gray-600">
                            <span>👥</span>
                            {request.rideDetails.passengers} ركاب
                          </span>
                          <span className="flex items-center gap-1 text-gray-600">
                            <span>🧳</span>
                            {request.rideDetails.luggage} حقائب
                          </span>
                        </>
                      )}
                    </div>

                    {/* Budget & Quotes */}
                    <div className="flex items-center justify-between">
                      <div>
                        {(request.budgetMin || request.budgetMax) && (
                          <p className="text-sm text-gray-500">
                            الميزانية:{' '}
                            <span className="font-medium text-gray-700">
                              {request.budgetMin && `${request.budgetMin}`}
                              {request.budgetMin && request.budgetMax && ' - '}
                              {request.budgetMax && `${request.budgetMax}`} ج.م
                            </span>
                          </p>
                        )}
                        <p className="text-sm text-gray-500">
                          العروض: <span className="font-medium">{request.quotesCount}</span>
                          {request.quotesCount === 0 && (
                            <span className="text-green-600 mr-2">• كن أول من يقدم عرض!</span>
                          )}
                        </p>
                      </div>

                      <button
                        onClick={() => openQuoteModal(request)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                      >
                        قدم عرضك
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quote Modal */}
      {showQuoteModal && selectedRequest && (
        <QuoteModal
          request={selectedRequest}
          onClose={() => {
            setShowQuoteModal(false);
            setSelectedRequest(null);
          }}
          onSubmit={() => {
            // Refresh requests after submitting quote
            setShowQuoteModal(false);
            setSelectedRequest(null);
          }}
        />
      )}
    </div>
  );
}

// Quote Modal Component
function QuoteModal({
  request,
  onClose,
  onSubmit,
}: {
  request: OpenRequest;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const [price, setPrice] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [estimatedHours, setEstimatedHours] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vehicleOptions = request.serviceType === 'SHIPPING'
    ? [
        { value: 'MOTORCYCLE', label: 'موتوسيكل' },
        { value: 'CAR', label: 'سيارة' },
        { value: 'VAN', label: 'فان' },
        { value: 'PICKUP', label: 'بيك أب' },
        { value: 'TRUCK_SMALL', label: 'نقل صغير' },
        { value: 'TRUCK_MEDIUM', label: 'نقل متوسط' },
      ]
    : [
        { value: 'SEDAN', label: 'سيدان' },
        { value: 'SUV', label: 'SUV' },
        { value: 'MINIVAN', label: 'ميني فان' },
        { value: 'BUS_SMALL', label: 'ميني باص' },
      ];

  const handleSubmit = async () => {
    if (!price || !vehicleType || !estimatedHours) return;

    setIsSubmitting(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit();
    } catch (error) {
      console.error('Submit error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center justify-between">
          <h2 className="font-bold text-lg">تقديم عرض سعر</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            ✕
          </button>
        </div>

        <div className="p-4 space-y-4">
          {/* Request Summary */}
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm">
              <span>{request.serviceType === 'SHIPPING' ? '📦' : '🚗'}</span>
              <span className="font-medium">{request.pickup.governorate}</span>
              <span>←</span>
              <span className="font-medium">{request.dropoff.governorate}</span>
            </div>
            {request.budgetMax && (
              <p className="text-sm text-gray-500 mt-1">
                ميزانية العميل: حتى {request.budgetMax} ج.م
              </p>
            )}
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              السعر المقترح (ج.م) *
            </label>
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder="0"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg font-bold"
            />
          </div>

          {/* Vehicle Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              نوع المركبة *
            </label>
            <select
              value={vehicleType}
              onChange={e => setVehicleType(e.target.value)}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">اختر نوع المركبة</option>
              {vehicleOptions.map(v => (
                <option key={v.value} value={v.value}>{v.label}</option>
              ))}
            </select>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              الوقت المتوقع للوصول (بالساعات) *
            </label>
            <input
              type="number"
              value={estimatedHours}
              onChange={e => setEstimatedHours(e.target.value)}
              placeholder="3"
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ملاحظات للعميل
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="مثال: تأمين شامل، توصيل حتى الباب..."
              rows={3}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            />
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!price || !vehicleType || !estimatedHours || isSubmitting}
            className={`w-full py-3 rounded-lg font-medium ${
              price && vehicleType && estimatedHours && !isSubmitting
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                جاري الإرسال...
              </span>
            ) : (
              `إرسال العرض - ${price || '0'} ج.م`
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
