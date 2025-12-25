'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { founderFetch } from '@/lib/api/founder';
import { getMeetingTypeDisplay, getRoleDisplayName } from '@/lib/api/board';

interface AgendaItem {
  id?: string;
  order: number;
  titleAr: string;
  title?: string;
  duration: number;
  type: string;
  description?: string;
  leadMember?: string;
}

interface Attendee {
  id: string;
  attended: boolean;
  member: {
    id: string;
    name: string;
    nameAr: string;
    role: string;
  };
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
  attendees?: Attendee[];
  summary?: string;
  summaryAr?: string;
  description?: string;
  descriptionAr?: string;
}

export default function MeetingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.meetingId as string;

  const [meeting, setMeeting] = useState<BoardMeeting | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingAgenda, setEditingAgenda] = useState(false);
  const [editedAgenda, setEditedAgenda] = useState<AgendaItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [newItem, setNewItem] = useState({ titleAr: '', duration: 10, type: 'DISCUSSION' });

  useEffect(() => {
    const fetchMeeting = async () => {
      try {
        const response = await founderFetch(`/board/meetings/${meetingId}`);
        setMeeting(response.data);
        if (response.data?.agenda) {
          setEditedAgenda(response.data.agenda);
        }
      } catch (error) {
        console.error('Error fetching meeting:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMeeting();
  }, [meetingId]);

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; color: string }> = {
      SCHEDULED: { label: 'مجدول', color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
      IN_PROGRESS: { label: 'جاري الآن', color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30 animate-pulse' },
      COMPLETED: { label: 'مكتمل', color: 'bg-green-500/20 text-green-400 border-green-500/30' },
      CANCELLED: { label: 'ملغي', color: 'bg-red-500/20 text-red-400 border-red-500/30' },
    };
    const s = statusMap[status] || { label: status, color: 'bg-gray-500/20 text-gray-400 border-gray-500/30' };
    return <span className={`px-3 py-1 rounded-full text-sm border ${s.color}`}>{s.label}</span>;
  };

  const getAgendaTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      REVIEW: '📋',
      PLANNING: '🎯',
      DISCUSSION: '💬',
      ALERTS: '🚨',
      DECISION: '⚡',
      UPDATES: '📢',
      ACTION_ITEMS: '✅',
      ANALYSIS: '📊',
      FINANCIAL: '💰',
      OPERATIONS: '⚙️',
      TECHNICAL: '💻',
      MARKETING: '📣',
      STRATEGY: '🧭',
      BRIEFING: '📝',
      IMPACT: '💥',
      ALTERNATIVES: '🔀',
      BREAK: '☕',
      OKRS: '🎯',
      MARKET: '🌍',
      SWOT: '📈',
      INNOVATION: '💡',
    };
    return icons[type] || '📌';
  };

  const getAgendaTypeName = (type: string) => {
    const names: Record<string, string> = {
      REVIEW: 'مراجعة',
      PLANNING: 'تخطيط',
      DISCUSSION: 'نقاش',
      ALERTS: 'تنبيهات',
      DECISION: 'قرار',
      UPDATES: 'تحديثات',
      ACTION_ITEMS: 'بنود عمل',
      ANALYSIS: 'تحليل',
      FINANCIAL: 'مالي',
      OPERATIONS: 'عمليات',
      TECHNICAL: 'تقني',
      MARKETING: 'تسويق',
      STRATEGY: 'استراتيجية',
      BRIEFING: 'إحاطة',
      IMPACT: 'تأثير',
      ALTERNATIVES: 'بدائل',
      BREAK: 'استراحة',
      OKRS: 'أهداف',
      MARKET: 'سوق',
      SWOT: 'تحليل SWOT',
      INNOVATION: 'ابتكار',
    };
    return names[type] || type;
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ar-EG', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ar-EG', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAgendaTimes = (agenda: AgendaItem[], startTime: string) => {
    const start = new Date(startTime);
    let currentTime = new Date(start);

    return agenda.map(item => {
      const itemStart = new Date(currentTime);
      currentTime = new Date(currentTime.getTime() + item.duration * 60000);
      const itemEnd = new Date(currentTime);
      return {
        ...item,
        startTime: itemStart.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        endTime: itemEnd.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      };
    });
  };

  const handleSaveAgenda = async () => {
    setSaving(true);
    try {
      await founderFetch(`/board/meetings/${meetingId}/agenda`, {
        method: 'PUT',
        body: JSON.stringify({ agenda: editedAgenda }),
      });
      setMeeting(prev => prev ? { ...prev, agenda: editedAgenda } : null);
      setEditingAgenda(false);
    } catch (error) {
      console.error('Error saving agenda:', error);
      alert('حدث خطأ أثناء حفظ الأجندة');
    } finally {
      setSaving(false);
    }
  };

  const handleAddItem = () => {
    if (!newItem.titleAr.trim()) return;

    const newAgendaItem: AgendaItem = {
      order: editedAgenda.length + 1,
      titleAr: newItem.titleAr,
      duration: newItem.duration,
      type: newItem.type,
    };

    setEditedAgenda([...editedAgenda, newAgendaItem]);
    setNewItem({ titleAr: '', duration: 10, type: 'DISCUSSION' });
  };

  const handleRemoveItem = (index: number) => {
    const updated = editedAgenda.filter((_, i) => i !== index);
    setEditedAgenda(updated.map((item, i) => ({ ...item, order: i + 1 })));
  };

  const handleMoveItem = (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= editedAgenda.length) return;

    const updated = [...editedAgenda];
    [updated[index], updated[newIndex]] = [updated[newIndex], updated[index]];
    setEditedAgenda(updated.map((item, i) => ({ ...item, order: i + 1 })));
  };

  const handleUpdateItem = (index: number, field: keyof AgendaItem, value: any) => {
    const updated = [...editedAgenda];
    updated[index] = { ...updated[index], [field]: value };
    setEditedAgenda(updated);
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!meeting) {
    return (
      <div className="p-8 text-center">
        <span className="text-5xl mb-4 block">❌</span>
        <h2 className="text-xl text-white mb-2">الاجتماع غير موجود</h2>
        <Link href="/board/meetings" className="text-primary-400 hover:underline">
          العودة للاجتماعات
        </Link>
      </div>
    );
  }

  const agendaWithTimes = meeting.agenda
    ? calculateAgendaTimes(meeting.agenda, meeting.scheduledAt)
    : [];

  const totalDuration = (meeting.agenda || []).reduce((sum, item) => sum + item.duration, 0);

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <Link href="/board/meetings" className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="text-sm text-gray-500">{meeting.meetingNumber}</span>
              {getStatusBadge(meeting.status)}
            </div>
            <h1 className="text-2xl font-bold text-white">{meeting.titleAr || meeting.title}</h1>
          </div>
        </div>

        {/* Meeting Info */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
          <div>
            <p className="text-xs text-gray-500 mb-1">التاريخ</p>
            <p className="text-white font-medium">{formatDate(meeting.scheduledAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">الوقت</p>
            <p className="text-white font-medium">{formatTime(meeting.scheduledAt)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">النوع</p>
            <p className="text-white font-medium">{getMeetingTypeDisplay(meeting.type)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">المدة</p>
            <p className="text-white font-medium">{totalDuration || meeting.duration || 60} دقيقة</p>
          </div>
        </div>
      </div>

      {/* Agenda Section */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">📋</span>
            <h2 className="text-xl font-bold text-white">أجندة الاجتماع</h2>
            <span className="text-sm text-gray-400">({(meeting.agenda || []).length} بنود)</span>
          </div>

          {meeting.status === 'SCHEDULED' && (
            <div className="flex gap-2">
              {editingAgenda ? (
                <>
                  <button
                    onClick={() => {
                      setEditedAgenda(meeting.agenda || []);
                      setEditingAgenda(false);
                    }}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={handleSaveAgenda}
                    disabled={saving}
                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50"
                  >
                    {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditingAgenda(true)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors flex items-center gap-2"
                >
                  <span>✏️</span>
                  تعديل الأجندة
                </button>
              )}
            </div>
          )}
        </div>

        {editingAgenda ? (
          /* Editing Mode */
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 p-6">
            <div className="space-y-3 mb-6">
              {editedAgenda.map((item, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-gray-900/50 rounded-lg border border-gray-700/30">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => handleMoveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => handleMoveItem(index, 'down')}
                      disabled={index === editedAgenda.length - 1}
                      className="p-1 text-gray-400 hover:text-white disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  <span className="text-gray-500 w-6">{index + 1}.</span>

                  <input
                    type="text"
                    value={item.titleAr}
                    onChange={(e) => handleUpdateItem(index, 'titleAr', e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                    placeholder="عنوان البند"
                  />

                  <select
                    value={item.type}
                    onChange={(e) => handleUpdateItem(index, 'type', e.target.value)}
                    className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  >
                    <option value="DISCUSSION">نقاش</option>
                    <option value="DECISION">قرار</option>
                    <option value="REVIEW">مراجعة</option>
                    <option value="PLANNING">تخطيط</option>
                    <option value="UPDATES">تحديثات</option>
                    <option value="ALERTS">تنبيهات</option>
                    <option value="ACTION_ITEMS">بنود عمل</option>
                    <option value="ANALYSIS">تحليل</option>
                    <option value="STRATEGY">استراتيجية</option>
                    <option value="BREAK">استراحة</option>
                  </select>

                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      value={item.duration}
                      onChange={(e) => handleUpdateItem(index, 'duration', parseInt(e.target.value) || 5)}
                      className="w-16 bg-gray-800 border border-gray-600 rounded-lg px-2 py-2 text-white text-center"
                      min={1}
                      max={120}
                    />
                    <span className="text-gray-400 text-sm">د</span>
                  </div>

                  <button
                    onClick={() => handleRemoveItem(index)}
                    className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg"
                  >
                    🗑️
                  </button>
                </div>
              ))}
            </div>

            {/* Add New Item */}
            <div className="flex items-center gap-3 p-3 bg-gray-900/30 rounded-lg border border-dashed border-gray-600">
              <span className="text-gray-500">➕</span>
              <input
                type="text"
                value={newItem.titleAr}
                onChange={(e) => setNewItem({ ...newItem, titleAr: e.target.value })}
                className="flex-1 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
                placeholder="إضافة بند جديد..."
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
              />
              <select
                value={newItem.type}
                onChange={(e) => setNewItem({ ...newItem, type: e.target.value })}
                className="bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white"
              >
                <option value="DISCUSSION">نقاش</option>
                <option value="DECISION">قرار</option>
                <option value="REVIEW">مراجعة</option>
                <option value="PLANNING">تخطيط</option>
                <option value="UPDATES">تحديثات</option>
              </select>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  value={newItem.duration}
                  onChange={(e) => setNewItem({ ...newItem, duration: parseInt(e.target.value) || 10 })}
                  className="w-16 bg-gray-800 border border-gray-600 rounded-lg px-2 py-2 text-white text-center"
                  min={1}
                  max={120}
                />
                <span className="text-gray-400 text-sm">د</span>
              </div>
              <button
                onClick={handleAddItem}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
              >
                إضافة
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-700/30">
              <p className="text-gray-400 text-sm">
                المدة الإجمالية: <span className="text-white font-medium">{editedAgenda.reduce((sum, item) => sum + item.duration, 0)} دقيقة</span>
              </p>
            </div>
          </div>
        ) : (
          /* View Mode */
          <div className="bg-gray-800/50 rounded-xl border border-gray-700/50 overflow-hidden">
            {agendaWithTimes.length === 0 ? (
              <div className="p-8 text-center">
                <span className="text-4xl mb-4 block">📝</span>
                <p className="text-gray-400">لم يتم تحديد أجندة بعد</p>
                {meeting.status === 'SCHEDULED' && (
                  <button
                    onClick={() => setEditingAgenda(true)}
                    className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                  >
                    إنشاء الأجندة
                  </button>
                )}
              </div>
            ) : (
              <div className="divide-y divide-gray-700/30">
                {agendaWithTimes.map((item, index) => (
                  <div key={index} className="p-4 hover:bg-gray-700/20 transition-colors">
                    <div className="flex items-start gap-4">
                      <div className="text-center min-w-[60px]">
                        <p className="text-sm font-medium text-white">{item.startTime}</p>
                        <p className="text-xs text-gray-500">{item.duration} د</p>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-gray-700/50 flex items-center justify-center text-lg">
                        {getAgendaTypeIcon(item.type)}
                      </div>

                      <div className="flex-1">
                        <h3 className="text-white font-medium mb-1">{item.titleAr || item.title}</h3>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-xs bg-gray-700/50 text-gray-300">
                            {getAgendaTypeName(item.type)}
                          </span>
                          {item.leadMember && (
                            <span className="text-xs text-gray-400">
                              القائد: {getRoleDisplayName(item.leadMember as any)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Attendees Section */}
      {meeting.attendees && meeting.attendees.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">👥</span>
            <h2 className="text-xl font-bold text-white">الحضور</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {meeting.attendees.map((attendee) => (
              <div
                key={attendee.id}
                className={`p-3 rounded-lg border ${
                  attendee.attended
                    ? 'bg-green-500/10 border-green-500/30'
                    : 'bg-gray-800/50 border-gray-700/50'
                }`}
              >
                <p className="text-sm font-medium text-white">{attendee.member.nameAr}</p>
                <p className="text-xs text-gray-400">{getRoleDisplayName(attendee.member.role as any)}</p>
                {meeting.status !== 'SCHEDULED' && (
                  <p className={`text-xs mt-1 ${attendee.attended ? 'text-green-400' : 'text-gray-500'}`}>
                    {attendee.attended ? '✓ حضر' : '✗ لم يحضر'}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Section (for completed meetings) */}
      {meeting.status === 'COMPLETED' && (meeting.summaryAr || meeting.summary) && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📝</span>
            <h2 className="text-xl font-bold text-white">ملخص الاجتماع</h2>
          </div>

          <div className="p-6 bg-gray-800/50 rounded-xl border border-gray-700/50">
            <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
              {meeting.summaryAr || meeting.summary}
            </p>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-3">
        {meeting.status === 'SCHEDULED' && (
          <button
            onClick={async () => {
              try {
                await founderFetch(`/board/meetings/${meetingId}/start`, { method: 'POST' });
                setMeeting(prev => prev ? { ...prev, status: 'IN_PROGRESS', startedAt: new Date().toISOString() } : null);
              } catch (error) {
                console.error('Error starting meeting:', error);
              }
            }}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
          >
            <span>▶️</span>
            بدء الاجتماع
          </button>
        )}

        {meeting.status === 'IN_PROGRESS' && (
          <button
            onClick={async () => {
              const summary = prompt('أدخل ملخص الاجتماع:');
              if (summary) {
                try {
                  await founderFetch(`/board/meetings/${meetingId}/end`, {
                    method: 'POST',
                    body: JSON.stringify({ summary, summaryAr: summary }),
                  });
                  setMeeting(prev => prev ? { ...prev, status: 'COMPLETED', endedAt: new Date().toISOString(), summaryAr: summary } : null);
                } catch (error) {
                  console.error('Error ending meeting:', error);
                }
              }
            }}
            className="px-6 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
          >
            <span>⏹️</span>
            إنهاء الاجتماع
          </button>
        )}
      </div>
    </div>
  );
}
