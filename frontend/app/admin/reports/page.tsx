'use client';

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { useAdmin } from '@/lib/contexts/AdminContext';

// API_URL already includes /api/v1 from environment variable
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface Report {
  id: string;
  reporterId: string;
  targetType: string;
  targetId: string;
  reason: string;
  description: string | null;
  status: 'PENDING' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';
  resolution: string | null;
  resolvedBy: string | null;
  resolvedAt: string | null;
  createdAt: string;
}

export default function ReportsPage() {
  const { hasPermission } = useAdmin();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('PENDING');
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [resolution, setResolution] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchReports = useCallback(async () => {
    const token = localStorage.getItem('adminAccessToken');
    if (!token) return;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);

      const response = await axios.get(`${API_URL}/admin/reports?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setReports(response.data.data.reports);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = async (status: 'RESOLVED' | 'DISMISSED') => {
    if (!selectedReport) return;

    const token = localStorage.getItem('adminAccessToken');
    if (!token) return;

    setActionLoading(true);
    try {
      await axios.put(
        `${API_URL}/admin/reports/${selectedReport.id}`,
        { resolution, status },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowModal(false);
      setSelectedReport(null);
      setResolution('');
      fetchReports();
    } catch (error: any) {
      alert(error.response?.data?.message || 'فشل في معالجة البلاغ');
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('ar-EG', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(date));
  };

  const statusLabels: Record<string, string> = {
    PENDING: 'معلق',
    REVIEWING: 'قيد المراجعة',
    RESOLVED: 'تم الحل',
    DISMISSED: 'مرفوض',
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-500/20 text-yellow-400',
    REVIEWING: 'bg-blue-500/20 text-blue-400',
    RESOLVED: 'bg-green-500/20 text-green-400',
    DISMISSED: 'bg-gray-500/20 text-gray-400',
  };

  const targetTypeLabels: Record<string, string> = {
    listing: 'إعلان',
    user: 'مستخدم',
    review: 'تقييم',
    message: 'رسالة',
  };

  return (
    <div className="p-8" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white mb-2">إدارة البلاغات</h1>
          <p className="text-gray-400">مراجعة ومعالجة بلاغات المستخدمين</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['PENDING', 'REVIEWING', 'RESOLVED', 'DISMISSED'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl transition-colors ${
              statusFilter === status
                ? 'bg-primary-600 text-white'
                : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'
            }`}
          >
            {statusLabels[status]}
          </button>
        ))}
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto mb-4"></div>
            <p className="text-gray-400">جاري التحميل...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-2xl border border-gray-700">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400">لا توجد بلاغات بهذه الحالة</p>
          </div>
        ) : (
          reports.map((report) => (
            <div key={report.id} className="bg-gray-800/50 rounded-2xl p-6 border border-gray-700">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${statusColors[report.status]}`}>
                      {statusLabels[report.status]}
                    </span>
                    <span className="text-gray-500 text-sm">
                      {targetTypeLabels[report.targetType] || report.targetType}
                    </span>
                  </div>

                  <h3 className="text-white font-medium mb-1">{report.reason}</h3>
                  {report.description && (
                    <p className="text-gray-400 text-sm mb-2">{report.description}</p>
                  )}

                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>تاريخ البلاغ: {formatDate(report.createdAt)}</span>
                    <span>معرف الهدف: {report.targetId.slice(0, 8)}...</span>
                  </div>

                  {report.resolution && (
                    <div className="mt-3 p-3 bg-gray-700/30 rounded-xl">
                      <p className="text-sm text-gray-300">القرار: {report.resolution}</p>
                      {report.resolvedAt && (
                        <p className="text-xs text-gray-500 mt-1">تم في: {formatDate(report.resolvedAt)}</p>
                      )}
                    </div>
                  )}
                </div>

                {report.status === 'PENDING' && hasPermission('reports:resolve') && (
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setShowModal(true);
                    }}
                    className="px-4 py-2 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors"
                  >
                    معالجة
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Resolve Modal */}
      {showModal && selectedReport && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-md border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">معالجة البلاغ</h3>

            <div className="mb-4 p-4 bg-gray-700/30 rounded-xl">
              <p className="text-gray-300 text-sm">{selectedReport.reason}</p>
              {selectedReport.description && (
                <p className="text-gray-400 text-xs mt-2">{selectedReport.description}</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">القرار / الملاحظات</label>
              <textarea
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="اكتب قرارك أو ملاحظاتك..."
                className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-xl text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none resize-none h-24"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedReport(null);
                  setResolution('');
                }}
                className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-xl hover:bg-gray-600 transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleResolve('DISMISSED')}
                disabled={actionLoading}
                className="flex-1 px-4 py-3 bg-gray-600 text-white rounded-xl hover:bg-gray-500 disabled:opacity-50 transition-colors"
              >
                رفض
              </button>
              <button
                onClick={() => handleResolve('RESOLVED')}
                disabled={actionLoading || !resolution}
                className="flex-1 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:opacity-50 transition-colors"
              >
                {actionLoading ? 'جاري...' : 'حل'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
