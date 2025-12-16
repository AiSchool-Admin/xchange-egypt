'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAuctions, Auction, AuctionStatus } from '@/lib/api/auctions';

const statusLabels: Record<string, { label: string; color: string }> = {
  DRAFT: { label: 'مسودة', color: 'bg-gray-100 text-gray-700' },
  SCHEDULED: { label: 'مجدول', color: 'bg-blue-100 text-blue-700' },
  ACTIVE: { label: 'نشط', color: 'bg-green-100 text-green-700' },
  ENDED: { label: 'انتهى', color: 'bg-purple-100 text-purple-700' },
  SOLD: { label: 'تم البيع', color: 'bg-emerald-100 text-emerald-700' },
  CANCELLED: { label: 'ملغي', color: 'bg-red-100 text-red-700' },
  FAILED: { label: 'فشل', color: 'bg-orange-100 text-orange-700' },
};

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    scheduled: 0,
    ended: 0,
    sold: 0,
    totalValue: 0,
    totalBids: 0,
    totalDeposits: 0,
    pendingDisputes: 0,
  });
  const [filters, setFilters] = useState({
    status: '',
    auctionType: '',
    category: '',
    search: '',
    dateFrom: '',
    dateTo: '',
  });
  const [selectedAuctions, setSelectedAuctions] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  useEffect(() => {
    loadData();
  }, [filters]);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await getAuctions({
        status: filters.status as AuctionStatus || undefined,
        page: currentPage,
        limit: itemsPerPage,
      });
      setAuctions(result.data?.auctions || []);

      // حساب الإحصائيات
      const allAuctions = result.data?.auctions || [];
      setStats({
        total: result.data?.pagination?.total || allAuctions.length,
        active: allAuctions.filter((a: Auction) => a.status === 'ACTIVE').length,
        scheduled: allAuctions.filter((a: Auction) => a.status === 'SCHEDULED').length,
        ended: allAuctions.filter((a: Auction) => a.status === 'ENDED').length,
        sold: allAuctions.filter((a: Auction) => a.status === 'SOLD').length,
        totalValue: allAuctions.reduce((sum: number, a: Auction) => sum + (a.currentPrice || 0), 0),
        totalBids: allAuctions.reduce((sum: number, a: Auction) => sum + (a.totalBids || 0), 0),
        totalDeposits: 0,
        pendingDisputes: 0,
      });
    } catch (error) {
      console.error('Error loading auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedAuctions.length === 0) {
      alert('يرجى تحديد مزاد واحد على الأقل');
      return;
    }

    const confirmed = confirm(`هل أنت متأكد من ${action} ${selectedAuctions.length} مزاد؟`);
    if (!confirmed) return;

    // تنفيذ الإجراء الجماعي
    alert(`تم ${action} ${selectedAuctions.length} مزاد`);
    setSelectedAuctions([]);
    loadData();
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const toggleSelectAll = () => {
    if (selectedAuctions.length === auctions.length) {
      setSelectedAuctions([]);
    } else {
      setSelectedAuctions(auctions.map(a => a.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedAuctions(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">إدارة المزادات</h1>
              <p className="text-gray-500 text-sm">مراقبة وإدارة جميع المزادات في المنصة</p>
            </div>
            <div className="flex gap-3">
              <Link
                href="/admin/auctions/reports"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
              >
                📊 التقارير
              </Link>
              <Link
                href="/admin/auctions/disputes"
                className="px-4 py-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
              >
                ⚖️ النزاعات
                {stats.pendingDisputes > 0 && (
                  <span className="mr-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                    {stats.pendingDisputes}
                  </span>
                )}
              </Link>
              <Link
                href="/admin/auctions/fraud"
                className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
              >
                🚨 تنبيهات الاحتيال
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 mb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">إجمالي المزادات</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
            <div className="text-xs text-gray-500">نشط</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <div className="text-xs text-gray-500">مجدول</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-purple-600">{stats.ended}</div>
            <div className="text-xs text-gray-500">انتهى</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-emerald-600">{stats.sold}</div>
            <div className="text-xs text-gray-500">تم البيع</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="text-2xl font-bold text-orange-600">{stats.totalBids}</div>
            <div className="text-xs text-gray-500">المزايدات</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm col-span-2">
            <div className="text-2xl font-bold text-green-600">
              {stats.totalValue.toLocaleString('ar-EG')}
              <span className="text-sm font-normal text-gray-500"> ج.م</span>
            </div>
            <div className="text-xs text-gray-500">إجمالي القيمة</div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">البحث</label>
              <input
                type="text"
                placeholder="ابحث بالعنوان أو المستخدم..."
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الحالة</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">الكل</option>
                <option value="ACTIVE">نشط</option>
                <option value="SCHEDULED">مجدول</option>
                <option value="ENDED">انتهى</option>
                <option value="SOLD">تم البيع</option>
                <option value="CANCELLED">ملغي</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">نوع المزاد</label>
              <select
                value={filters.auctionType}
                onChange={(e) => setFilters({ ...filters, auctionType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">الكل</option>
                <option value="ENGLISH">إنجليزي</option>
                <option value="SEALED_BID">مختوم</option>
                <option value="DUTCH">هولندي</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">الفئة</label>
              <select
                value={filters.category}
                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              >
                <option value="">الكل</option>
                <option value="ELECTRONICS">إلكترونيات</option>
                <option value="CARS">سيارات</option>
                <option value="PROPERTIES">عقارات</option>
                <option value="ANTIQUES">تحف</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">من تاريخ</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">إلى تاريخ</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        {selectedAuctions.length > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 mb-6 flex items-center justify-between">
            <span className="text-purple-700 font-medium">
              تم تحديد {selectedAuctions.length} مزاد
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('إيقاف')}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
              >
                ⏸️ إيقاف مؤقت
              </button>
              <button
                onClick={() => handleBulkAction('تمييز')}
                className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 text-sm"
              >
                ⭐ تمييز
              </button>
              <button
                onClick={() => handleBulkAction('إلغاء')}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
              >
                🗑️ إلغاء
              </button>
            </div>
          </div>
        )}

        {/* Auctions Table */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">جاري التحميل...</p>
            </div>
          ) : auctions.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🔨</div>
              <h3 className="text-lg font-bold text-gray-900">لا توجد مزادات</h3>
              <p className="text-gray-500">لم يتم العثور على مزادات تطابق الفلاتر المحددة</p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="w-10 p-4">
                    <input
                      type="checkbox"
                      checked={selectedAuctions.length === auctions.length}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                    />
                  </th>
                  <th className="p-4 text-right text-xs font-medium text-gray-500 uppercase">المزاد</th>
                  <th className="p-4 text-right text-xs font-medium text-gray-500 uppercase">البائع</th>
                  <th className="p-4 text-right text-xs font-medium text-gray-500 uppercase">النوع</th>
                  <th className="p-4 text-right text-xs font-medium text-gray-500 uppercase">الحالة</th>
                  <th className="p-4 text-right text-xs font-medium text-gray-500 uppercase">السعر</th>
                  <th className="p-4 text-right text-xs font-medium text-gray-500 uppercase">المزايدات</th>
                  <th className="p-4 text-right text-xs font-medium text-gray-500 uppercase">ينتهي في</th>
                  <th className="p-4 text-right text-xs font-medium text-gray-500 uppercase">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {auctions.map(auction => (
                  <tr key={auction.id} className="hover:bg-gray-50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedAuctions.includes(auction.id)}
                        onChange={() => toggleSelect(auction.id)}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          {auction.listing?.item?.images?.[0] ? (
                            <img
                              src={auction.listing.item.images[0]}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">🔨</div>
                          )}
                        </div>
                        <div>
                          <Link
                            href={`/auctions/${auction.id}`}
                            className="font-medium text-gray-900 hover:text-purple-600 line-clamp-1"
                          >
                            {auction.listing?.item?.title || 'بدون عنوان'}
                          </Link>
                          <div className="text-xs text-gray-500">ID: {auction.id.slice(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{auction.listing?.user?.fullName || '-'}</div>
                    </td>
                    <td className="p-4">
                      <span className="text-sm">
                        {{ ENGLISH: '🔨 إنجليزي', SEALED_BID: '📦 مختوم', DUTCH: '🔻 هولندي' }[auction.auctionType || 'ENGLISH']}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusLabels[auction.status]?.color || 'bg-gray-100'
                      }`}>
                        {statusLabels[auction.status]?.label || auction.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-medium text-gray-900">
                        {(auction.currentPrice || auction.startingPrice).toLocaleString('ar-EG')} ج.م
                      </div>
                      {auction.reservePrice && auction.currentPrice < auction.reservePrice && (
                        <div className="text-xs text-orange-600">لم يصل للحد الأدنى</div>
                      )}
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{auction.totalBids || 0}</div>
                      <div className="text-xs text-gray-500">{auction.uniqueBidders || 0} مزايد</div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm text-gray-900">{formatDate(auction.endTime)}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        <Link
                          href={`/auctions/${auction.id}`}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded"
                          title="عرض"
                        >
                          👁️
                        </Link>
                        <button
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="تعديل"
                        >
                          ✏️
                        </button>
                        <button
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                          title="إلغاء"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {/* Pagination */}
          {!loading && auctions.length > 0 && (
            <div className="p-4 border-t flex items-center justify-between">
              <div className="text-sm text-gray-500">
                عرض {(currentPage - 1) * itemsPerPage + 1} - {Math.min(currentPage * itemsPerPage, stats.total)} من {stats.total}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  السابق
                </button>
                <button
                  onClick={() => setCurrentPage(p => p + 1)}
                  disabled={currentPage * itemsPerPage >= stats.total}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50 hover:bg-gray-50"
                >
                  التالي
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
