'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Mock data types
interface Quote {
  id: string;
  provider: {
    id: string;
    name: string;
    type: 'INDIVIDUAL' | 'SMALL_BUSINESS' | 'COMPANY';
    rating: number;
    totalRatings: number;
    completedOrders: number;
    isVerified: boolean;
    profilePhoto?: string;
  };
  price: number;
  vehicleType: string;
  estimatedDuration: number;
  estimatedArrival: string;
  notes?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  priceBreakdown: {
    basePrice: number;
    distanceCharge?: number;
    extras?: { name: string; price: number }[];
  };
}

interface Request {
  id: string;
  serviceType: 'SHIPPING' | 'INTERCITY_RIDE';
  status: 'OPEN' | 'QUOTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
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
  quotesCount: number;
  quotes: Quote[];
  createdAt: string;
  expiresAt: string;
  shippingDetails?: {
    weight: number;
    packageType: string;
    quantity: number;
  };
  rideDetails?: {
    passengers: number;
    luggage: number;
  };
}

// Mock data for demo
const MOCK_REQUEST: Request = {
  id: 'req_123',
  serviceType: 'SHIPPING',
  status: 'QUOTED',
  pickup: {
    governorate: 'القاهرة',
    city: 'مدينة نصر',
    address: 'شارع مكرم عبيد، عمارة 15',
  },
  dropoff: {
    governorate: 'الإسكندرية',
    city: 'سموحة',
    address: 'شارع 14 مايو، بجوار كارفور',
  },
  scheduledDate: '2024-01-15',
  scheduledTime: '10:00',
  quotesCount: 3,
  createdAt: '2024-01-10T10:00:00Z',
  expiresAt: '2024-01-17T10:00:00Z',
  shippingDetails: {
    weight: 25,
    packageType: 'إلكترونيات',
    quantity: 2,
  },
  quotes: [
    {
      id: 'quote_1',
      provider: {
        id: 'prov_1',
        name: 'شركة النيل للشحن',
        type: 'COMPANY',
        rating: 4.8,
        totalRatings: 156,
        completedOrders: 423,
        isVerified: true,
        profilePhoto: undefined,
      },
      price: 350,
      vehicleType: 'VAN',
      estimatedDuration: 180,
      estimatedArrival: '2024-01-15T13:00:00Z',
      notes: 'تأمين شامل على الشحنة. توصيل حتى باب المنزل.',
      status: 'PENDING',
      createdAt: '2024-01-10T12:00:00Z',
      priceBreakdown: {
        basePrice: 250,
        distanceCharge: 80,
        extras: [{ name: 'تأمين', price: 20 }],
      },
    },
    {
      id: 'quote_2',
      provider: {
        id: 'prov_2',
        name: 'محمد أحمد',
        type: 'INDIVIDUAL',
        rating: 4.5,
        totalRatings: 42,
        completedOrders: 89,
        isVerified: true,
      },
      price: 280,
      vehicleType: 'PICKUP',
      estimatedDuration: 200,
      estimatedArrival: '2024-01-15T14:00:00Z',
      notes: 'متاح للتوصيل في أي وقت',
      status: 'PENDING',
      createdAt: '2024-01-10T14:00:00Z',
      priceBreakdown: {
        basePrice: 200,
        distanceCharge: 80,
      },
    },
    {
      id: 'quote_3',
      provider: {
        id: 'prov_3',
        name: 'توصيل إكسبريس',
        type: 'SMALL_BUSINESS',
        rating: 4.2,
        totalRatings: 28,
        completedOrders: 45,
        isVerified: false,
      },
      price: 320,
      vehicleType: 'VAN',
      estimatedDuration: 150,
      estimatedArrival: '2024-01-15T12:30:00Z',
      status: 'PENDING',
      createdAt: '2024-01-10T15:00:00Z',
      priceBreakdown: {
        basePrice: 280,
        distanceCharge: 40,
      },
    },
  ],
};

export default function RequestDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const [request, setRequest] = useState<Request | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [actionType, setActionType] = useState<'accept' | 'reject'>('accept');
  const [processing, setProcessing] = useState(false);
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'time'>('price');

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setRequest(MOCK_REQUEST);
      setLoading(false);
    }, 500);
  }, [params.id]);

  const handleAcceptQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setActionType('accept');
    setShowConfirmModal(true);
  };

  const handleRejectQuote = (quote: Quote) => {
    setSelectedQuote(quote);
    setActionType('reject');
    setShowConfirmModal(true);
  };

  const confirmAction = async () => {
    if (!selectedQuote) return;

    setProcessing(true);
    try {
      // API call would go here
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (actionType === 'accept') {
        // Update local state
        setRequest(prev => prev ? {
          ...prev,
          status: 'ACCEPTED',
          quotes: prev.quotes.map(q =>
            q.id === selectedQuote.id
              ? { ...q, status: 'ACCEPTED' }
              : { ...q, status: 'REJECTED' }
          ),
        } : null);
      } else {
        setRequest(prev => prev ? {
          ...prev,
          quotes: prev.quotes.map(q =>
            q.id === selectedQuote.id
              ? { ...q, status: 'REJECTED' }
              : q
          ),
        } : null);
      }

      setShowConfirmModal(false);
      setSelectedQuote(null);
    } catch (error) {
      console.error('Action error:', error);
    } finally {
      setProcessing(false);
    }
  };

  const getSortedQuotes = () => {
    if (!request) return [];
    const quotes = [...request.quotes].filter(q => q.status !== 'REJECTED');

    switch (sortBy) {
      case 'price':
        return quotes.sort((a, b) => a.price - b.price);
      case 'rating':
        return quotes.sort((a, b) => b.provider.rating - a.provider.rating);
      case 'time':
        return quotes.sort((a, b) => a.estimatedDuration - b.estimatedDuration);
      default:
        return quotes;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours} ساعة و ${mins} دقيقة` : `${hours} ساعة`;
  };

  const getProviderTypeBadge = (type: Quote['provider']['type']) => {
    switch (type) {
      case 'COMPANY':
        return { label: 'شركة', color: 'bg-blue-100 text-blue-700' };
      case 'SMALL_BUSINESS':
        return { label: 'نشاط تجاري', color: 'bg-purple-100 text-purple-700' };
      case 'INDIVIDUAL':
        return { label: 'فرد', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const getStatusBadge = (status: Request['status']) => {
    switch (status) {
      case 'OPEN':
        return { label: 'مفتوح للعروض', color: 'bg-green-100 text-green-700' };
      case 'QUOTED':
        return { label: 'تم استلام عروض', color: 'bg-blue-100 text-blue-700' };
      case 'ACCEPTED':
        return { label: 'تم قبول عرض', color: 'bg-purple-100 text-purple-700' };
      case 'IN_PROGRESS':
        return { label: 'جاري التنفيذ', color: 'bg-amber-100 text-amber-700' };
      case 'COMPLETED':
        return { label: 'مكتمل', color: 'bg-green-100 text-green-700' };
      case 'CANCELLED':
        return { label: 'ملغي', color: 'bg-red-100 text-red-700' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-700' };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-xl text-gray-600">الطلب غير موجود</p>
          <button
            onClick={() => router.back()}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
          >
            رجوع
          </button>
        </div>
      </div>
    );
  }

  const sortedQuotes = getSortedQuotes();
  const acceptedQuote = request.quotes.find(q => q.status === 'ACCEPTED');

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              رجوع
            </button>
            <span className={`px-3 py-1 rounded-full text-sm ${getStatusBadge(request.status).color}`}>
              {getStatusBadge(request.status).label}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Request Summary */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">
              {request.serviceType === 'SHIPPING' ? '📦' : '🚗'}
            </span>
            <div>
              <h1 className="text-xl font-bold">
                {request.serviceType === 'SHIPPING' ? 'طلب شحن' : 'طلب رحلة'}
              </h1>
              <p className="text-sm text-gray-500">#{request.id}</p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="text-green-500 mt-1">●</span>
              <div>
                <p className="text-sm text-gray-500">من</p>
                <p className="font-medium">{request.pickup.governorate} - {request.pickup.city}</p>
                <p className="text-sm text-gray-600">{request.pickup.address}</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="text-red-500 mt-1">●</span>
              <div>
                <p className="text-sm text-gray-500">إلى</p>
                <p className="font-medium">{request.dropoff.governorate} - {request.dropoff.city}</p>
                <p className="text-sm text-gray-600">{request.dropoff.address}</p>
              </div>
            </div>

            <div className="flex items-center gap-6 pt-3 border-t">
              <div>
                <p className="text-sm text-gray-500">الموعد</p>
                <p className="font-medium">{request.scheduledDate} {request.scheduledTime && `- ${request.scheduledTime}`}</p>
              </div>

              {request.shippingDetails && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">الوزن</p>
                    <p className="font-medium">{request.shippingDetails.weight} كجم</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الكمية</p>
                    <p className="font-medium">{request.shippingDetails.quantity} قطعة</p>
                  </div>
                </>
              )}

              {request.rideDetails && (
                <>
                  <div>
                    <p className="text-sm text-gray-500">الركاب</p>
                    <p className="font-medium">{request.rideDetails.passengers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">الحقائب</p>
                    <p className="font-medium">{request.rideDetails.luggage}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Accepted Quote Banner */}
        {acceptedQuote && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl">✅</span>
              <div className="flex-1">
                <h3 className="font-bold text-green-800">تم قبول عرض</h3>
                <p className="text-green-700">
                  {acceptedQuote.provider.name} - {acceptedQuote.price} ج.م
                </p>
              </div>
              <button className="px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                تواصل الآن
              </button>
            </div>
          </div>
        )}

        {/* Quotes Section */}
        {!acceptedQuote && sortedQuotes.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold">
                العروض المتاحة ({sortedQuotes.length})
              </h2>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as 'price' | 'rating' | 'time')}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="price">الأقل سعراً</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="time">الأسرع وصولاً</option>
              </select>
            </div>

            <div className="space-y-4">
              {sortedQuotes.map((quote, index) => {
                const typeBadge = getProviderTypeBadge(quote.provider.type);

                return (
                  <div
                    key={quote.id}
                    className={`bg-white rounded-xl p-4 shadow-sm border-2 ${
                      index === 0 ? 'border-green-300' : 'border-transparent'
                    }`}
                  >
                    {index === 0 && (
                      <div className="text-xs text-green-600 font-medium mb-2">
                        🏆 أفضل عرض
                      </div>
                    )}

                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          {quote.provider.profilePhoto ? (
                            <img
                              src={quote.provider.profilePhoto}
                              alt={quote.provider.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <span className="text-xl">
                              {quote.provider.type === 'COMPANY' ? '🏢' :
                               quote.provider.type === 'SMALL_BUSINESS' ? '🏪' : '👤'}
                            </span>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold">{quote.provider.name}</h3>
                            {quote.provider.isVerified && (
                              <span className="text-blue-500">✓</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <span className={`px-2 py-0.5 rounded-full text-xs ${typeBadge.color}`}>
                              {typeBadge.label}
                            </span>
                            <span className="text-amber-500">★ {quote.provider.rating}</span>
                            <span className="text-gray-500">({quote.provider.totalRatings})</span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {quote.provider.completedOrders} طلب مكتمل
                          </p>
                        </div>
                      </div>

                      <div className="text-left">
                        <p className="text-2xl font-bold text-green-600">{quote.price} ج.م</p>
                        <p className="text-xs text-gray-500">شامل الضريبة</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                      <span className="flex items-center gap-1">
                        <span>🚛</span>
                        {quote.vehicleType === 'VAN' ? 'فان' :
                         quote.vehicleType === 'PICKUP' ? 'بيك أب' :
                         quote.vehicleType === 'TRUCK_SMALL' ? 'نقل صغير' : quote.vehicleType}
                      </span>
                      <span className="flex items-center gap-1">
                        <span>⏱️</span>
                        {formatDuration(quote.estimatedDuration)}
                      </span>
                    </div>

                    {quote.notes && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-4 text-sm text-gray-600">
                        {quote.notes}
                      </div>
                    )}

                    {/* Price Breakdown */}
                    <details className="mb-4">
                      <summary className="text-sm text-blue-600 cursor-pointer hover:underline">
                        تفاصيل السعر
                      </summary>
                      <div className="mt-2 bg-gray-50 rounded-lg p-3 space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>السعر الأساسي</span>
                          <span>{quote.priceBreakdown.basePrice} ج.م</span>
                        </div>
                        {quote.priceBreakdown.distanceCharge && (
                          <div className="flex justify-between">
                            <span>رسوم المسافة</span>
                            <span>{quote.priceBreakdown.distanceCharge} ج.م</span>
                          </div>
                        )}
                        {quote.priceBreakdown.extras?.map(extra => (
                          <div key={extra.name} className="flex justify-between">
                            <span>{extra.name}</span>
                            <span>{extra.price} ج.م</span>
                          </div>
                        ))}
                        <div className="flex justify-between font-bold pt-2 border-t">
                          <span>الإجمالي</span>
                          <span>{quote.price} ج.م</span>
                        </div>
                      </div>
                    </details>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleAcceptQuote(quote)}
                        className="flex-1 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700"
                      >
                        قبول العرض
                      </button>
                      <button
                        onClick={() => handleRejectQuote(quote)}
                        className="px-4 py-3 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
                      >
                        رفض
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* No Quotes Yet */}
        {!acceptedQuote && sortedQuotes.length === 0 && request.status === 'OPEN' && (
          <div className="bg-white rounded-xl p-8 text-center">
            <span className="text-5xl mb-4 block">⏳</span>
            <h3 className="text-lg font-bold mb-2">في انتظار العروض</h3>
            <p className="text-gray-600">
              تم إرسال طلبك لمزودي الخدمة. ستتلقى إشعاراً عند وصول عروض جديدة.
            </p>
          </div>
        )}
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && selectedQuote && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold mb-4">
              {actionType === 'accept' ? 'تأكيد قبول العرض' : 'تأكيد رفض العرض'}
            </h3>

            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{selectedQuote.provider.name}</span>
                <span className="font-bold text-green-600">{selectedQuote.price} ج.م</span>
              </div>
            </div>

            {actionType === 'accept' && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-700">
                <strong>تنبيه:</strong> بعد قبول العرض، سيتم رفض جميع العروض الأخرى تلقائياً.
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                disabled={processing}
                className="flex-1 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
              >
                إلغاء
              </button>
              <button
                onClick={confirmAction}
                disabled={processing}
                className={`flex-1 py-3 rounded-lg font-medium text-white ${
                  actionType === 'accept'
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {processing ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    جاري المعالجة...
                  </span>
                ) : (
                  actionType === 'accept' ? 'تأكيد القبول' : 'تأكيد الرفض'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
