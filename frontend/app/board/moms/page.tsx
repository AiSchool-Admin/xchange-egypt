'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { founderFetch } from '@/lib/api/founder';

interface MeetingMinutes {
  id: string;
  momNumber: string;
  meetingId: string;
  titleAr: string;
  title: string;
  date: string;
  attendees: any[];
  agendaItems: any[];
  decisions: any[];
  actionItems: any[];
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

export default function MeetingMinutesPage() {
  const [minutes, setMinutes] = useState<MeetingMinutes[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');

  useEffect(() => {
    const fetchMinutes = async () => {
      try {
        const response = await founderFetch('/board/autonomous/moms');
        setMinutes(response.data || []);
      } catch (error) {
        console.error('Error fetching meeting minutes:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMinutes();
  }, []);

  const handleApprove = async (momId: string) => {
    try {
      await founderFetch(`/board/autonomous/moms/${momId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ action: 'APPROVE' }),
      });
      setMinutes(prev => prev.map(m =>
        m.id === momId ? { ...m, status: 'APPROVED' } : m
      ));
    } catch (error) {
      console.error('Error approving MOM:', error);
    }
  };

  const filteredMinutes = minutes.filter(m => {
    if (filter === 'pending') return m.status === 'PENDING_APPROVAL';
    if (filter === 'approved') return m.status === 'APPROVED';
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="px-2 py-1 rounded-full text-xs bg-green-500/20 text-green-400">معتمد</span>;
      case 'PENDING_APPROVAL':
        return <span className="px-2 py-1 rounded-full text-xs bg-yellow-500/20 text-yellow-400">بانتظار الموافقة</span>;
      case 'REJECTED':
        return <span className="px-2 py-1 rounded-full text-xs bg-red-500/20 text-red-400">مرفوض</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-xs bg-gray-500/20 text-gray-400">مسودة</span>;
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/board" className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">محاضر الاجتماعات</h1>
            <p className="text-gray-400">عرض ومراجعة محاضر اجتماعات المجلس</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'pending', 'approved'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {f === 'all' ? 'الكل' : f === 'pending' ? 'بانتظار الموافقة' : 'المعتمدة'}
          </button>
        ))}
      </div>

      {/* Minutes List */}
      {filteredMinutes.length === 0 ? (
        <div className="p-12 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
          <span className="text-5xl mb-4 block">📋</span>
          <h3 className="text-xl font-semibold text-white mb-2">لا توجد محاضر</h3>
          <p className="text-gray-400">لم يتم إنشاء أي محاضر اجتماعات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMinutes.map((mom) => (
            <div
              key={mom.id}
              className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-500">{mom.momNumber}</span>
                    {getStatusBadge(mom.status)}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{mom.titleAr || mom.title}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {new Date(mom.date).toLocaleDateString('ar-EG', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                </div>

                {mom.status === 'PENDING_APPROVAL' && (
                  <button
                    onClick={() => handleApprove(mom.id)}
                    className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors"
                  >
                    اعتماد
                  </button>
                )}
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-4 gap-4 pt-4 border-t border-gray-700/50">
                <div>
                  <p className="text-xs text-gray-500">الحضور</p>
                  <p className="font-medium text-white">{mom.attendees?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">بنود الأجندة</p>
                  <p className="font-medium text-white">{mom.agendaItems?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">القرارات</p>
                  <p className="font-medium text-white">{mom.decisions?.length || 0}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">بنود العمل</p>
                  <p className="font-medium text-white">{mom.actionItems?.length || 0}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
