'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAdmin } from '@/lib/contexts/AdminContext';

// API_URL already includes /api/v1 from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface Listing {
  id: string;
  title: string;
  description: string | null;
  price: number | null;
  status: string;
  images: string[];
  createdAt: string;
  seller: {
    id: string;
    fullName: string;
    email: string;
  };
  category: {
    id: string;
    nameAr: string;
    nameEn: string;
  } | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ListingsManagement() {
  const { hasPermission } = useAdmin();
  const [listings, setListings] = useState<Listing[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchListings = useCallback(async () => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (search) params.append('search', search);
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`${API_URL}/admin/listings?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setListings(response.data.data.items);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch listings:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleDelete = async () => {
    if (!selectedListing) return;

    const token = localStorage.getItem('adminAccessToken');
    if (!token) return;

    setActionLoading(true);
    try {
      await axios.delete(
        `${API_URL}/admin/listings/${selectedListing.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { reason: deleteReason },
        }
      );

      setShowModal(false);
      setSelectedListing(null);
      setDeleteReason('');
      fetchListings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'فشل في حذف الإعلان');
    } finally {
      setActionLoading(false);
    }
  };

  const handleFeature = async (listingId: string, featured: boolean) => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) return;

    try {
      await axios.post(
        `${API_URL}/admin/listings/${listingId}/feature`,
        { featured },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchListings();
    } catch (error: any) {
      alert(error.response?.data?.message || 'فشل في تمييز الإعلان');
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
    }).format(new Date(date));
  };

  const formatPrice = (price: number | null) => {
    if (!price) return 'غير محدد';
    return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(price);
  };

  const statusLabels: Record<string, string> = {
    DRAFT: 'مسودة',
    ACTIVE: 'نشط',
    SOLD: 'مباع',
    TRADED: 'تم تبادله',
    ARCHIVED: 'مؤرشف',
    DELETED: 'محذوف',
  };

  const statusColors: Record<string, string> = {
    DRAFT: 'bg-gray-500/20 text-gray-400',
    ACTIVE: 'bg-green-500/20 text-green-400',
    SOLD: 'bg-blue-500/20 text-blue-400',
    TRADED: 'bg-purple-500/20 text-purple-400',
    ARCHIVED: 'bg-yellow-500/20 text-yellow-400',
    DELETED: 'bg-red-500/20 text-red-400',
  };

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">إدارة الإعلانات</h1>
          <p className="text-gray-400">عرض ومراجعة جميع إعلانات المنصة</p>
        </div>
        <div className="text-sm text-gray-400">
          إجمالي: {pagination.total} إعلان
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 rounded-2xl p-4 mb-6 border border-gray-700">
        <div className="flex flex-wrap gap-4">
          {/* Search */}
          <div className="flex-1 min-w-[250px]">
            <div className="relative">
              <svg className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="بحث بالعنوان أو الوصف..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPagination(p => ({ ...p, page: 1 }));
                }}
                className="w-full pr-10 pl-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className="px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="">كل الحالات</option>
            <option value="ACTIVE">نشط</option>
            <option value="DRAFT">مسودة</option>
            <option value="SOLD">مباع</option>
            <option value="ARCHIVED">مؤرشف</option>
            <option value="DELETED">محذوف</option>
          </select>
        </div>
      </div>

      {/* Listings Grid */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-400">جاري التحميل...</p>
        </div>
      ) : listings.length === 0 ? (
        <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <p className="text-gray-400">لا توجد إعلانات مطابقة للبحث</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div key={listing.id} className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
              {/* Image */}
              <div className="aspect-video bg-gray-700 relative">
                {listing.images && listing.images.length > 0 ? (
                  <img
                    src={listing.images?.[0] || ''}
                    alt={listing.title || 'إعلان'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <span className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs ${statusColors[listing.status]}`}>
                  {statusLabels[listing.status]}
                </span>
              </div>

              {/* Content */}
              <div className="p-4">
                <h3 className="text-white font-medium mb-1 truncate">{listing.title}</h3>
                <p className="text-primary-400 font-bold mb-2">{formatPrice(listing.price)}</p>

                <div className="flex items-center gap-2 text-xs text-gray-400 mb-3">
                  <span>{listing.category?.nameAr || 'بدون فئة'}</span>
                  <span>•</span>
                  <span>{formatDate(listing.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-400 mb-4">
                  <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center text-xs text-white">
                    {listing.seller.fullName.charAt(0)}
                  </div>
                  <span className="truncate">{listing.seller.fullName}</span>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {hasPermission('listings:feature') && listing.status === 'ACTIVE' && (
                    <button
                      onClick={() => handleFeature(listing.id, true)}
                      className="flex-1 px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors text-sm"
                    >
                      تمييز
                    </button>
                  )}
                  {hasPermission('listings:delete') && listing.status !== 'DELETED' && (
                    <button
                      onClick={() => {
                        setSelectedListing(listing);
                        setShowModal(true);
                      }}
                      className="flex-1 px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
                    >
                      حذف
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-400">
            صفحة {pagination.page} من {pagination.totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
              disabled={pagination.page === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              السابق
            </button>
            <button
              onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
              disabled={pagination.page === pagination.totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
            >
              التالي
            </button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showModal && selectedListing && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">حذف الإعلان</h3>

            <p className="text-gray-400 mb-4">
              هل أنت متأكد من حذف الإعلان "{selectedListing.title}"؟
            </p>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">سبب الحذف</label>
              <textarea
                value={deleteReason}
                onChange={(e) => setDeleteReason(e.target.value)}
                placeholder="اكتب سبب حذف الإعلان..."
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none h-24"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedListing(null);
                  setDeleteReason('');
                }}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                disabled={actionLoading || !deleteReason}
                className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'جاري الحذف...' : 'حذف'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
