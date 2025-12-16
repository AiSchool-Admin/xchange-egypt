'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserDisputes, AuctionDispute, DisputeStatus } from '@/lib/api/auctions';
import { useAuth } from '@/lib/contexts/AuthContext';

const statusLabels: Record<DisputeStatus, { label: string; color: string; icon: string }> = {
  OPEN: { label: 'مفتوح', color: 'bg-yellow-100 text-yellow-800', icon: '🔓' },
  IN_REVIEW: { label: 'قيد المراجعة', color: 'bg-blue-100 text-blue-800', icon: '🔍' },
  RESOLVED: { label: 'تم الحل', color: 'bg-green-100 text-green-800', icon: '✅' },
  ESCALATED: { label: 'مُصعّد', color: 'bg-red-100 text-red-800', icon: '⬆️' },
  CLOSED: { label: 'مغلق', color: 'bg-gray-100 text-gray-800', icon: '🔒' },
};

const disputeTypeLabels: Record<string, string> = {
  NON_PAYMENT: 'عدم الدفع',
  ITEM_NOT_AS_DESCRIBED: 'المنتج مختلف عن الوصف',
  ITEM_NOT_RECEIVED: 'لم يصل المنتج',
  UNAUTHORIZED_BID: 'مزايدة غير مصرح بها',
  SHILL_BIDDING: 'مزايدة وهمية',
  OTHER: 'أخرى',
};

export default function DisputesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [disputes, setDisputes] = useState<AuctionDispute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<DisputeStatus | ''>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/auctions/disputes');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadDisputes();
    }
  }, [user, page]);

  const loadDisputes = async () => {
    try {
      setLoading(true);
      const response = await getUserDisputes(page, 12);
      setDisputes(response.data.disputes || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل النزاعات');
    } finally {
      setLoading(false);
    }
  };

  const filteredDisputes = filter ? disputes.filter(d => d.status === filter) : disputes;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return null;

  // Stats
  const openDisputes = disputes.filter(d => d.status === 'OPEN' || d.status === 'IN_REVIEW').length;
  const resolvedDisputes = disputes.filter(d => d.status === 'RESOLVED').length;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-red-600 to-rose-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/auctions" className="text-white/80 hover:text-white flex items-center gap-2 mb-4">
            <span>العودة للمزادات</span>
          </Link>
          <h1 className="text-4xl font-bold">النزاعات</h1>
          <p className="text-red-100 mt-2">إدارة النزاعات المتعلقة بالمزادات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">إجمالي النزاعات</p>
            <p className="text-2xl font-bold text-gray-900">{disputes.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">النزاعات المفتوحة</p>
            <p className="text-2xl font-bold text-yellow-600">{openDisputes}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">تم حلها</p>
            <p className="text-2xl font-bold text-green-600">{resolvedDisputes}</p>
          </div>
        </div>
      </div>

      {/* Filter */}
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setFilter('')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition ${
              filter === '' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            الكل ({disputes.length})
          </button>
          {Object.entries(statusLabels).map(([status, { label, icon }]) => {
            const count = disputes.filter(d => d.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilter(status as DisputeStatus)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition flex items-center gap-1 ${
                  filter === status ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{icon}</span>
                <span>{label} ({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 pb-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-red-600">{error}</p>
            <button onClick={loadDisputes} className="mt-4 text-purple-600 hover:text-purple-700">
              حاول مرة أخرى
            </button>
          </div>
        ) : filteredDisputes.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">لا توجد نزاعات</p>
            <p className="text-gray-500 mt-2">هذا أمر جيد!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredDisputes.map((dispute) => {
              const isInitiator = dispute.initiatorId === user.id;

              return (
                <Link
                  key={dispute.id}
                  href={`/auctions/disputes/${dispute.id}`}
                  className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[dispute.status]?.color}`}>
                          {statusLabels[dispute.status]?.icon} {statusLabels[dispute.status]?.label}
                        </span>
                        <span className="text-sm text-gray-500">
                          #{dispute.id.slice(0, 8)}
                        </span>
                      </div>

                      <h3 className="font-semibold text-gray-900 mb-1">
                        {disputeTypeLabels[dispute.disputeType] || dispute.disputeType}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">{dispute.reason}</p>

                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {isInitiator ? 'أنت البادئ' : 'أنت المستجيب'}
                        </span>
                        <span>•</span>
                        <span>
                          {isInitiator
                            ? `ضد: ${dispute.respondent?.fullName}`
                            : `من: ${dispute.initiator?.fullName}`}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(dispute.createdAt).toLocaleDateString('ar-EG')}
                        </span>
                      </div>
                    </div>

                    <div className="text-left">
                      <span className="text-purple-600 text-sm font-medium">
                        عرض التفاصيل ←
                      </span>
                      {dispute.messages && dispute.messages.length > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          {dispute.messages.length} رسالة
                        </p>
                      )}
                    </div>
                  </div>

                  {dispute.resolution && (
                    <div className="mt-4 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-green-800">
                        <span className="font-medium">القرار: </span>
                        {dispute.resolution}
                      </p>
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              السابق
            </button>
            <span className="px-4 py-2">{page} / {totalPages}</span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              التالي
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
