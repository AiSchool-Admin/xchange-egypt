'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getUserDeposits, AuctionDeposit, DepositStatus } from '@/lib/api/auctions';
import { useAuth } from '@/lib/contexts/AuthContext';

const statusLabels: Record<DepositStatus, { label: string; color: string }> = {
  PENDING: { label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'مدفوع', color: 'bg-green-100 text-green-800' },
  REFUNDED: { label: 'مسترد', color: 'bg-blue-100 text-blue-800' },
  FORFEITED: { label: 'مصادر', color: 'bg-red-100 text-red-800' },
  APPLIED: { label: 'مُطبق', color: 'bg-purple-100 text-purple-800' },
};

export default function DepositsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [deposits, setDeposits] = useState<AuctionDeposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filter, setFilter] = useState<DepositStatus | ''>('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/auctions/deposits');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadDeposits();
    }
  }, [user, page]);

  const loadDeposits = async () => {
    try {
      setLoading(true);
      const response = await getUserDeposits(page, 12);
      setDeposits(response.data.deposits || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (err: any) {
      setError(err.response?.data?.message || 'فشل في تحميل الإيداعات');
    } finally {
      setLoading(false);
    }
  };

  const filteredDeposits = filter ? deposits.filter(d => d.status === filter) : deposits;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) return null;

  // Calculate stats
  const totalPaid = deposits.filter(d => d.status === 'PAID').reduce((sum, d) => sum + d.amount, 0);
  const totalRefunded = deposits.filter(d => d.status === 'REFUNDED').reduce((sum, d) => sum + d.amount, 0);
  const totalApplied = deposits.filter(d => d.status === 'APPLIED').reduce((sum, d) => sum + d.amount, 0);

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-amber-500 to-orange-500 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <Link href="/auctions" className="text-white/80 hover:text-white flex items-center gap-2 mb-4">
            <span>العودة للمزادات</span>
          </Link>
          <h1 className="text-4xl font-bold">إيداعاتي</h1>
          <p className="text-amber-100 mt-2">إدارة تأمينات المزادات</p>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">إجمالي الإيداعات</p>
            <p className="text-2xl font-bold text-gray-900">{deposits.length}</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">المبلغ المدفوع</p>
            <p className="text-2xl font-bold text-green-600">{totalPaid.toLocaleString()} ج.م</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">المبلغ المسترد</p>
            <p className="text-2xl font-bold text-blue-600">{totalRefunded.toLocaleString()} ج.م</p>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-gray-600">المبلغ المُطبق</p>
            <p className="text-2xl font-bold text-purple-600">{totalApplied.toLocaleString()} ج.م</p>
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
            الكل ({deposits.length})
          </button>
          {Object.entries(statusLabels).map(([status, { label }]) => {
            const count = deposits.filter(d => d.status === status).length;
            return (
              <button
                key={status}
                onClick={() => setFilter(status as DepositStatus)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition ${
                  filter === status ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {label} ({count})
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
            <button onClick={loadDeposits} className="mt-4 text-purple-600 hover:text-purple-700">
              حاول مرة أخرى
            </button>
          </div>
        ) : filteredDeposits.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg">
            <p className="text-gray-600 text-lg">لا توجد إيداعات</p>
            <Link href="/auctions" className="inline-block mt-4 text-purple-600 hover:text-purple-700">
              تصفح المزادات
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المزاد</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">المبلغ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">طريقة الدفع</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDeposits.map((deposit) => {
                  const auction = deposit.auction;
                  const item = auction?.item || (auction as any)?.listing?.item;

                  return (
                    <tr key={deposit.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0">
                            {item?.images?.[0]?.url ? (
                              <img src={item.images[0].url} alt={item?.title} className="w-full h-full object-cover rounded-lg" />
                            ) : (
                              <span className="w-full h-full flex items-center justify-center text-gray-400 text-xl">🔨</span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">{item?.title || 'مزاد'}</p>
                            <p className="text-sm text-gray-500">#{auction?.id?.slice(0, 8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 font-semibold text-gray-900">
                        {deposit.amount.toLocaleString()} ج.م
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {deposit.paymentMethod}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusLabels[deposit.status]?.color}`}>
                          {statusLabels[deposit.status]?.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        {deposit.paidAt ? new Date(deposit.paidAt).toLocaleDateString('ar-EG') : '-'}
                      </td>
                      <td className="px-6 py-4">
                        <Link
                          href={`/auctions/${auction?.id}`}
                          className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                        >
                          عرض المزاد
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
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
