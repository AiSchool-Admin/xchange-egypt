'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { founderFetch } from '@/lib/api/founder';
import { getMeetingTypeDisplay } from '@/lib/api/board';

interface BoardMeeting {
  id: string;
  meetingNumber: string;
  title: string;
  titleAr: string;
  type: 'STANDUP' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'EMERGENCY';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  startedAt?: string;
  endedAt?: string;
  agenda?: any[];
  attendees?: any[];
  summary?: string;
  summaryAr?: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        const response = await founderFetch('/board/meetings');
        setMeetings(response.data || []);
      } catch (error) {
        console.error('Error fetching meetings:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeetings();
  }, []);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      SCHEDULED: { label: 'مجدول', color: 'bg-blue-500/20 text-blue-400' },
      IN_PROGRESS: { label: 'جاري', color: 'bg-yellow-500/20 text-yellow-400' },
      COMPLETED: { label: 'مكتمل', color: 'bg-green-500/20 text-green-400' },
      CANCELLED: { label: 'ملغي', color: 'bg-red-500/20 text-red-400' },
    };
    const s = statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400' };
    return <span className={`px-2 py-1 rounded-full text-xs ${s.color}`}>{s.label}</span>;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      STANDUP: 'border-blue-500/50 bg-blue-500/10',
      WEEKLY: 'border-purple-500/50 bg-purple-500/10',
      MONTHLY: 'border-green-500/50 bg-green-500/10',
      QUARTERLY: 'border-orange-500/50 bg-orange-500/10',
      EMERGENCY: 'border-red-500/50 bg-red-500/10',
    };
    return colors[type] || 'border-gray-500/50 bg-gray-500/10';
  };

  const filteredMeetings = meetings.filter(m => {
    const now = new Date();
    const meetingDate = new Date(m.scheduledAt);
    if (filter === 'upcoming') return meetingDate >= now && m.status !== 'COMPLETED';
    if (filter === 'completed') return m.status === 'COMPLETED';
    return true;
  });

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
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/board" className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-white">الاجتماعات</h1>
            <p className="text-gray-400">جدول اجتماعات مجلس الإدارة</p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 mb-6">
        {(['all', 'upcoming', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg transition-colors ${
              filter === f
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50'
            }`}
          >
            {f === 'all' ? 'الكل' : f === 'upcoming' ? 'القادمة' : 'المكتملة'}
          </button>
        ))}
      </div>

      {/* Meetings List */}
      {filteredMeetings.length === 0 ? (
        <div className="p-12 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
          <span className="text-5xl mb-4 block">📅</span>
          <h3 className="text-xl font-semibold text-white mb-2">لا توجد اجتماعات</h3>
          <p className="text-gray-400">لم يتم جدولة أي اجتماعات بعد</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMeetings.map((meeting) => (
            <div
              key={meeting.id}
              className={`p-6 rounded-xl border ${getTypeColor(meeting.type)}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm text-gray-500">{meeting.meetingNumber}</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700/50 text-gray-300">
                      {getMeetingTypeDisplay(meeting.type)}
                    </span>
                    {getStatusBadge(meeting.status)}
                  </div>
                  <h3 className="text-lg font-semibold text-white">{meeting.titleAr || meeting.title}</h3>
                </div>
                <div className="text-left">
                  <p className="text-sm text-white font-medium">
                    {new Date(meeting.scheduledAt).toLocaleDateString('ar-EG', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-xs text-gray-400">
                    {new Date(meeting.scheduledAt).toLocaleTimeString('ar-EG', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              {/* Summary if completed */}
              {meeting.status === 'COMPLETED' && (meeting.summaryAr || meeting.summary) && (
                <div className="pt-4 border-t border-gray-700/30">
                  <p className="text-sm text-gray-300 line-clamp-2">
                    {meeting.summaryAr || meeting.summary}
                  </p>
                </div>
              )}

              {/* Agenda preview if scheduled */}
              {meeting.status === 'SCHEDULED' && meeting.agenda && meeting.agenda.length > 0 && (
                <div className="pt-4 border-t border-gray-700/30">
                  <p className="text-xs text-gray-500 mb-2">الأجندة</p>
                  <ul className="text-sm text-gray-300 space-y-1">
                    {meeting.agenda.slice(0, 3).map((item: any, i: number) => (
                      <li key={i} className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                        {item.titleAr || item.title || item}
                      </li>
                    ))}
                    {meeting.agenda.length > 3 && (
                      <li className="text-gray-500">+{meeting.agenda.length - 3} المزيد</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
