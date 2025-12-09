'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAdmin } from '@/lib/contexts/AdminContext';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface User {
  id: string;
  email: string;
  fullName: string;
  phone: string | null;
  userType: 'INDIVIDUAL' | 'BUSINESS';
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  avatar: string | null;
  rating: number;
  totalReviews: number;
  createdAt: string;
  lastLoginAt: string | null;
  _count: {
    items: number;
    listings: number;
    transactionsAsBuyer: number;
    transactionsAsSeller: number;
  };
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function UsersManagement() {
  const { hasPermission } = useAdmin();
  const [users, setUsers] = useState<User[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState<'suspend' | 'activate' | 'delete' | null>(null);
  const [suspendReason, setSuspendReason] = useState('');

  const fetchUsers = useCallback(async () => {
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
      if (typeFilter) params.append('userType', typeFilter);

      const response = await axios.get(`${API_URL}/api/v1/admin/users?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setUsers(response.data.data.users);
        setPagination(response.data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, statusFilter, typeFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAction = async () => {
    if (!selectedUser || !modalAction) return;

    const token = localStorage.getItem('adminAccessToken');
    if (!token) return;

    setActionLoading(true);
    try {
      let url = `${API_URL}/api/v1/admin/users/${selectedUser.id}`;
      let method = 'POST';

      if (modalAction === 'suspend') {
        url += '/suspend';
        await axios.post(url, { reason: suspendReason }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (modalAction === 'activate') {
        url += '/activate';
        await axios.post(url, {}, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else if (modalAction === 'delete') {
        await axios.delete(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      setSelectedUser(null);
      setModalAction(null);
      setSuspendReason('');
      fetchUsers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'فشل في تنفيذ العملية');
    } finally {
      setActionLoading(false);
    }
  };

  const openModal = (user: User, action: 'suspend' | 'activate' | 'delete') => {
    setSelectedUser(user);
    setModalAction(action);
    setShowModal(true);
  };

  const formatDate = (date: string | null) => {
    if (!date) return 'لم يسجل الدخول';
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const statusLabels: Record<string, string> = {
    ACTIVE: 'نشط',
    SUSPENDED: 'موقوف',
    DELETED: 'محذوف',
  };

  const statusColors: Record<string, string> = {
    ACTIVE: 'bg-green-500/20 text-green-400',
    SUSPENDED: 'bg-yellow-500/20 text-yellow-400',
    DELETED: 'bg-red-500/20 text-red-400',
  };

  const typeLabels: Record<string, string> = {
    INDIVIDUAL: 'فرد',
    BUSINESS: 'تاجر',
  };

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">إدارة المستخدمين</h1>
          <p className="text-gray-400">عرض وإدارة جميع مستخدمي المنصة</p>
        </div>
        <div className="text-sm text-gray-400">
          إجمالي: {pagination.total} مستخدم
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
                placeholder="بحث بالاسم، البريد، أو الهاتف..."
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
            <option value="SUSPENDED">موقوف</option>
            <option value="DELETED">محذوف</option>
          </select>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPagination(p => ({ ...p, page: 1 }));
            }}
            className="px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-xl text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
          >
            <option value="">كل الأنواع</option>
            <option value="INDIVIDUAL">فرد</option>
            <option value="BUSINESS">تاجر</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-gray-400">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p>لا يوجد مستخدمين مطابقين للبحث</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-700/30">
                <tr>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">المستخدم</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">النوع</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">الحالة</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">التقييم</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">الإعلانات</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">آخر دخول</th>
                  <th className="text-right p-4 text-sm font-medium text-gray-400">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.fullName}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${user.userType === 'BUSINESS' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}`}>
                        {typeLabels[user.userType]}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${statusColors[user.status]}`}>
                        {statusLabels[user.status]}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1">
                        <svg className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="text-white">{user.rating.toFixed(1)}</span>
                        <span className="text-gray-500 text-sm">({user.totalReviews})</span>
                      </div>
                    </td>
                    <td className="p-4 text-gray-400">
                      {user._count.items}
                    </td>
                    <td className="p-4 text-gray-400 text-sm">
                      {formatDate(user.lastLoginAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {user.status === 'ACTIVE' && hasPermission('users:suspend') && (
                          <button
                            onClick={() => openModal(user, 'suspend')}
                            className="p-2 text-yellow-400 hover:bg-yellow-500/20 rounded-lg transition-colors"
                            title="إيقاف"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          </button>
                        )}
                        {user.status === 'SUSPENDED' && hasPermission('users:update') && (
                          <button
                            onClick={() => openModal(user, 'activate')}
                            className="p-2 text-green-400 hover:bg-green-500/20 rounded-lg transition-colors"
                            title="تفعيل"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          </button>
                        )}
                        {hasPermission('users:delete') && user.status !== 'DELETED' && (
                          <button
                            onClick={() => openModal(user, 'delete')}
                            className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                            title="حذف"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-700 flex items-center justify-between">
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
      </div>

      {/* Action Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">
              {modalAction === 'suspend' && 'إيقاف المستخدم'}
              {modalAction === 'activate' && 'تفعيل المستخدم'}
              {modalAction === 'delete' && 'حذف المستخدم'}
            </h3>

            <p className="text-gray-400 mb-4">
              {modalAction === 'suspend' && `هل أنت متأكد من إيقاف حساب "${selectedUser.fullName}"؟`}
              {modalAction === 'activate' && `هل أنت متأكد من تفعيل حساب "${selectedUser.fullName}"؟`}
              {modalAction === 'delete' && `هل أنت متأكد من حذف حساب "${selectedUser.fullName}"؟ هذا الإجراء لا يمكن التراجع عنه.`}
            </p>

            {modalAction === 'suspend' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">سبب الإيقاف</label>
                <textarea
                  value={suspendReason}
                  onChange={(e) => setSuspendReason(e.target.value)}
                  placeholder="اكتب سبب إيقاف الحساب..."
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none h-24"
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedUser(null);
                  setModalAction(null);
                  setSuspendReason('');
                }}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleAction}
                disabled={actionLoading || (modalAction === 'suspend' && !suspendReason)}
                className={`flex-1 px-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  modalAction === 'delete'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : modalAction === 'suspend'
                    ? 'bg-yellow-600 text-white hover:bg-yellow-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                {actionLoading ? 'جاري التنفيذ...' : 'تأكيد'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
