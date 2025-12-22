'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Request {
  id: string;
  serviceType: 'SHIPPING' | 'INTERCITY_RIDE';
  status: 'DRAFT' | 'OPEN' | 'QUOTED' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED';
  pickup: {
    governorate: string;
    city: string;
  };
  dropoff: {
    governorate: string;
    city: string;
  };
  scheduledDate: string;
  quotesCount: number;
  createdAt: string;
  acceptedPrice?: number;
}

// Mock data
const MOCK_REQUESTS: Request[] = [
  {
    id: 'req_123',
    serviceType: 'SHIPPING',
    status: 'QUOTED',
    pickup: { governorate: 'القاهرة', city: 'مدينة نصر' },
    dropoff: { governorate: 'الإسكندرية', city: 'سموحة' },
    scheduledDate: '2024-01-15',
    quotesCount: 3,
    createdAt: '2024-01-10T10:00:00Z',
  },
  {
    id: 'req_124',
    serviceType: 'INTERCITY_RIDE',
    status: 'ACCEPTED',
    pickup: { governorate: 'الجيزة', city: 'المهندسين' },
    dropoff: { governorate: 'البحر الأحمر', city: 'الغردقة' },
    scheduledDate: '2024-01-18',
    quotesCount: 5,
    createdAt: '2024-01-09T14:00:00Z',
    acceptedPrice: 1200,
  },
  {
    id: 'req_125',
    serviceType: 'SHIPPING',
    status: 'OPEN',
    pickup: { governorate: 'القاهرة', city: 'المعادي' },
    dropoff: { governorate: 'الشرقية', city: 'الزقازيق' },
    scheduledDate: '2024-01-20',
    quotesCount: 0,
    createdAt: '2024-01-11T09:00:00Z',
  },
  {
    id: 'req_126',
    serviceType: 'INTERCITY_RIDE',
    status: 'COMPLETED',
    pickup: { governorate: 'الإسكندرية', city: 'العجمي' },
    dropoff: { governorate: 'مطروح', city: 'مرسى مطروح' },
    scheduledDate: '2024-01-05',
    quotesCount: 4,
    createdAt: '2024-01-01T11:00:00Z',
    acceptedPrice: 800,
  },
];

export default function MyRequestsPage() {
  const router = useRouter();
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setRequests(MOCK_REQUESTS);
      setLoading(false);
    }, 500);
  }, []);

  const getFilteredRequests = () => {
    switch (filter) {
      case 'active':
        return requests.filter(r => ['OPEN', 'QUOTED', 'ACCEPTED', 'IN_PROGRESS'].includes(r.status));
      case 'completed':
        return requests.filter(r => ['COMPLETED', 'CANCELLED', 'EXPIRED'].includes(r.status));
      default:
        return requests;
    }
  };

  const getStatusBadge = (status: Request['status']) => {
    const badges: Record<Request['status'], { label: string; color: string; icon: string }> = {
      DRAFT: { label: 'مسودة', color: 'bg-gray-100 text-gray-600', icon: '📝' },
      OPEN: { label: 'مفتوح للعروض', color: 'bg-green-100 text-green-700', icon: '🔓' },
      QUOTED: { label: 'عروض جديدة', color: 'bg-blue-100 text-blue-700', icon: '💬' },
      ACCEPTED: { label: 'تم قبول عرض', color: 'bg-purple-100 text-purple-700', icon: '✅' },
      IN_PROGRESS: { label: 'جاري التنفيذ', color: 'bg-amber-100 text-amber-700', icon: '🚚' },
      COMPLETED: { label: 'مكتمل', color: 'bg-green-100 text-green-700', icon: '✓' },
      CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: '✗' },
      EXPIRED: { label: 'منتهي', color: 'bg-gray-100 text-gray-600', icon: '⏰' },
    };
    return badges[status];
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-EG', {
      month: 'short',
      day: 'numeric',
    });
  };

  const filteredRequests = getFilteredRequests();

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push('/marketplace')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              رجوع
            </button>
            <h1 className="text-lg font-bold">طلباتي</h1>
            <div className="w-16" />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* Filters */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'الكل' },
            { value: 'active', label: 'نشط' },
            { value: 'completed', label: 'مكتمل' },
          ].map(f => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value as typeof filter)}
              className={`px-4 py-2 rounded-full whitespace-nowrap ${
                filter === f.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border text-gray-600 hover:bg-gray-50'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-500">جاري التحميل...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredRequests.length === 0 && (
          <div className="bg-white rounded-xl p-8 text-center">
            <span className="text-5xl mb-4 block">📋</span>
            <h3 className="text-lg font-bold mb-2">لا توجد طلبات</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'لم تقم بإنشاء أي طلبات بعد'
                : filter === 'active'
                ? 'لا توجد طلبات نشطة'
                : 'لا توجد طلبات مكتملة'}
            </p>
            <Link
              href="/marketplace"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
            >
              إنشاء طلب جديد
            </Link>
          </div>
        )}

        {/* Requests List */}
        {!loading && filteredRequests.length > 0 && (
          <div className="space-y-4">
            {filteredRequests.map(request => {
              const badge = getStatusBadge(request.status);

              return (
                <Link
                  key={request.id}
                  href={`/marketplace/requests/${request.id}`}
                  className="block bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">
                        {request.serviceType === 'SHIPPING' ? '📦' : '🚗'}
                      </span>
                      <div>
                        <h3 className="font-bold">
                          {request.serviceType === 'SHIPPING' ? 'شحن' : 'رحلة'}
                        </h3>
                        <p className="text-sm text-gray-500">#{request.id}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                      {badge.icon} {badge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-3">
                    <span>{request.pickup.governorate}</span>
                    <span>←</span>
                    <span>{request.dropoff.governorate}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <span className="text-gray-500">
                        📅 {formatDate(request.scheduledDate)}
                      </span>
                      {request.quotesCount > 0 && (
                        <span className={request.status === 'QUOTED' ? 'text-blue-600 font-medium' : 'text-gray-500'}>
                          💬 {request.quotesCount} عرض
                        </span>
                      )}
                    </div>
                    {request.acceptedPrice && (
                      <span className="font-bold text-green-600">
                        {request.acceptedPrice} ج.م
                      </span>
                    )}
                  </div>

                  {request.status === 'QUOTED' && (
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center gap-2 text-blue-600 text-sm font-medium">
                        <span className="animate-pulse">●</span>
                        لديك عروض جديدة - اضغط للمراجعة
                      </div>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Create New Request FAB */}
        <Link
          href="/marketplace"
          className="fixed bottom-6 left-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-blue-700 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </Link>
      </div>
    </div>
  );
}
