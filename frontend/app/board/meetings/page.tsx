'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { founderFetch } from '@/lib/api/founder';
import { getMeetingTypeDisplay } from '@/lib/api/board';

interface AgendaItem {
  order: number;
  titleAr: string;
  title?: string;
  duration: number;
  type: string;
}

interface BoardMeeting {
  id: string;
  meetingNumber: string;
  title: string;
  titleAr: string;
  type: 'STANDUP' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'EMERGENCY';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  scheduledAt: string;
  duration?: number;
  startedAt?: string;
  endedAt?: string;
  agenda?: AgendaItem[];
  attendees?: any[];
  summary?: string;
  summaryAr?: string;
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<BoardMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');

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

  useEffect(() => {
    fetchMeetings();
  }, []);

  const handleScheduleTodaysMeetings = async () => {
    setScheduling(true);
    try {
      const response = await founderFetch('/board/meetings/schedule-today', {
        method: 'POST',
      });
      if (response.data && response.data.length > 0) {
        // Refresh meetings list
        await fetchMeetings();
        alert(`تم جدولة ${response.data.length} اجتماعات لليوم`);
      } else {
        alert('اجتماعات اليوم موجودة بالفعل');
      }
    } catch (error) {
      console.error('Error scheduling meetings:', error);
      alert('حدث خطأ أثناء جدولة الاجتماعات');
    } finally {
      setScheduling(false);
    }
  };

  // Get today's meetings
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todaysMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.scheduledAt);
    return meetingDate >= today && meetingDate < tomorrow;
  }).sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());

  // Next upcoming meeting (first one today that hasn't started, or first future one)
  const now = new Date();
  const nextMeeting = meetings
    .filter(m => new Date(m.scheduledAt) >= now && m.status !== 'COMPLETED')
    .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime())[0];

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      SCHEDULED: { label: 'مجدول', color: 'bg-blue-500/20 text-blue-400' },
      IN_PROGRESS: { label: 'جاري الآن', color: 'bg-yellow-500/20 text-yellow-400 animate-pulse' },
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

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      STANDUP: '☀️',
      WEEKLY: '📅',
      MONTHLY: '📊',
      QUARTERLY: '🎯',
      EMERGENCY: '🚨',
    };
    return icons[type] || '📋';
  };

  const filteredMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.scheduledAt);
    if (filter === 'upcoming') return meetingDate >= now && m.status !== 'COMPLETED';
    if (filter === 'completed') return m.status === 'COMPLETED';
    return true;
  });

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      weekday: 'long',
      month: 'short',
      day: 'numeric',
    });
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

      {/* Today's Meetings Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📆</span>
            <h2 className="text-xl font-bold text-white">اجتماعات اليوم</h2>
            <span className="text-sm text-gray-400">
              {new Date().toLocaleDateString('ar-EG', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
          </div>
          {todaysMeetings.length === 0 && (
            <button
              onClick={handleScheduleTodaysMeetings}
              disabled={scheduling}
              className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {scheduling ? (
                <>
                  <span className="animate-spin">⏳</span>
                  جاري الجدولة...
                </>
              ) : (
                <>
                  <span>➕</span>
                  جدولة اجتماعات اليوم
                </>
              )}
            </button>
          )}
        </div>

        {todaysMeetings.length === 0 ? (
          <div className="p-6 bg-gray-800/30 rounded-xl border border-gray-700/50 text-center">
            <span className="text-3xl mb-2 block">😴</span>
            <p className="text-gray-400 mb-4">لا توجد اجتماعات مجدولة لليوم</p>
            <p className="text-sm text-gray-500">
              اضغط على "جدولة اجتماعات اليوم" لإنشاء الاجتماع الصباحي (10 ص) والمسائي (2 م)
            </p>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {todaysMeetings.map((meeting) => (
              <Link
                key={meeting.id}
                href={`/board/meetings/${meeting.id}`}
                className={`p-5 rounded-xl border-2 ${getTypeColor(meeting.type)} hover:scale-[1.02] transition-all cursor-pointer`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{getTypeIcon(meeting.type)}</span>
                    <span className="text-lg font-bold text-white">{formatTime(meeting.scheduledAt)}</span>
                  </div>
                  {getStatusBadge(meeting.status)}
                </div>
                <h3 className="text-white font-semibold mb-2">{meeting.titleAr || meeting.title}</h3>
                <p className="text-xs text-gray-400 mb-3">
                  {getMeetingTypeDisplay(meeting.type)} • {meeting.duration || 60} دقيقة
                </p>

                {/* Agenda Preview */}
                {meeting.agenda && meeting.agenda.length > 0 && (
                  <div className="pt-3 border-t border-gray-700/30">
                    <p className="text-xs text-gray-500 mb-2">الأجندة ({meeting.agenda.length} بنود)</p>
                    <ul className="space-y-1">
                      {meeting.agenda.slice(0, 2).map((item, i) => (
                        <li key={i} className="text-xs text-gray-300 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary-500 flex-shrink-0"></span>
                          <span className="truncate">{item.titleAr || item.title}</span>
                          <span className="text-gray-500 flex-shrink-0">{item.duration}د</span>
                        </li>
                      ))}
                      {meeting.agenda.length > 2 && (
                        <li className="text-xs text-gray-500">+{meeting.agenda.length - 2} المزيد...</li>
                      )}
                    </ul>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Next Meeting Highlight */}
      {nextMeeting && !todaysMeetings.find(m => m.id === nextMeeting.id) && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">⏭️</span>
            <h2 className="text-xl font-bold text-white">الاجتماع القادم</h2>
          </div>
          <Link
            href={`/board/meetings/${nextMeeting.id}`}
            className={`block p-6 rounded-xl border-2 ${getTypeColor(nextMeeting.type)} hover:scale-[1.01] transition-all`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{getTypeIcon(nextMeeting.type)}</span>
                  <div>
                    <h3 className="text-lg font-bold text-white">{nextMeeting.titleAr || nextMeeting.title}</h3>
                    <p className="text-sm text-gray-400">{getMeetingTypeDisplay(nextMeeting.type)}</p>
                  </div>
                </div>
              </div>
              <div className="text-left">
                <p className="text-lg font-bold text-white">{formatDate(nextMeeting.scheduledAt)}</p>
                <p className="text-sm text-gray-400">{formatTime(nextMeeting.scheduledAt)}</p>
              </div>
            </div>
          </Link>
        </div>
      )}

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
            {f === 'all' ? 'جميع الاجتماعات' : f === 'upcoming' ? 'القادمة' : 'المكتملة'}
          </button>
        ))}
      </div>

      {/* All Meetings List */}
      {filteredMeetings.length === 0 ? (
        <div className="p-12 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
          <span className="text-5xl mb-4 block">📅</span>
          <h3 className="text-xl font-semibold text-white mb-2">لا توجد اجتماعات</h3>
          <p className="text-gray-400">لم يتم جدولة أي اجتماعات بعد</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredMeetings.map((meeting) => (
            <Link
              key={meeting.id}
              href={`/board/meetings/${meeting.id}`}
              className={`block p-4 rounded-xl border ${getTypeColor(meeting.type)} hover:bg-white/5 transition-all`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{getTypeIcon(meeting.type)}</span>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500">{meeting.meetingNumber}</span>
                      {getStatusBadge(meeting.status)}
                    </div>
                    <h3 className="text-white font-medium">{meeting.titleAr || meeting.title}</h3>
                  </div>
                </div>
                <div className="text-left">
                  <p className="text-sm text-white">{formatDate(meeting.scheduledAt)}</p>
                  <p className="text-xs text-gray-400">{formatTime(meeting.scheduledAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
