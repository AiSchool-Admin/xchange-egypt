'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getBoardMembers,
  getConversations,
  getServiceStatus,
  BoardMember,
  BoardConversation,
  ServiceStatus,
  getRoleDisplayName,
  getRoleColor,
} from '@/lib/api/board';

export default function BoardDashboard() {
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [conversations, setConversations] = useState<BoardConversation[]>([]);
  const [status, setStatus] = useState<ServiceStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [membersData, conversationsData, statusData] = await Promise.all([
          getBoardMembers(),
          getConversations(),
          getServiceStatus(),
        ]);
        setMembers(membersData);
        setConversations(conversationsData);
        setStatus(statusData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const roleColors: Record<string, string> = {
    CEO: 'from-purple-500 to-purple-600',
    CTO: 'from-blue-500 to-blue-600',
    CFO: 'from-green-500 to-green-600',
    CMO: 'from-orange-500 to-orange-600',
    COO: 'from-yellow-500 to-yellow-600',
    CLO: 'from-red-500 to-red-600',
  };

  const quickActions = [
    {
      title: 'اسأل سؤال سريع',
      description: 'احصل على إجابة فورية من أحد أعضاء المجلس',
      href: '/board/chat?type=QUESTION',
      icon: '💬',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'عقد اجتماع',
      description: 'ناقش موضوع مع كل أعضاء المجلس',
      href: '/board/chat?type=MEETING',
      icon: '🎯',
      color: 'from-purple-500 to-pink-500',
    },
    {
      title: 'عصف ذهني',
      description: 'استكشف أفكار جديدة مع الفريق',
      href: '/board/chat?type=BRAINSTORM',
      icon: '💡',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      title: 'مراجعة خطة',
      description: 'راجع خطة أو استراتيجية مع المجلس',
      href: '/board/chat?type=REVIEW',
      icon: '📋',
      color: 'from-green-500 to-emerald-500',
    },
  ];

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
        <h1 className="text-3xl font-bold text-white mb-2">مرحباً بك في مجلس الإدارة</h1>
        <p className="text-gray-400">فريقك التنفيذي من الذكاء الاصطناعي جاهز لمساعدتك</p>
      </div>

      {/* Status Bar */}
      {status && (
        <div className="mb-8 p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`w-3 h-3 rounded-full ${status.claude.isAvailable ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <span className="text-gray-300">
              {status.claude.isAvailable ? 'المجلس جاهز ومتاح' : 'خدمة Claude غير متاحة حالياً'}
            </span>
          </div>
          <div className="text-sm text-gray-500">
            {status.claude.requestsThisMinute}/{status.claude.maxRequestsPerMinute} طلب/دقيقة
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-10">
        <h2 className="text-xl font-semibold text-white mb-4">إجراءات سريعة</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.title}
              href={action.href}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gray-800/50 border border-gray-700/50 hover:border-gray-600 transition-all duration-300"
            >
              <div className={`absolute inset-0 bg-gradient-to-br ${action.color} opacity-0 group-hover:opacity-10 transition-opacity`}></div>
              <div className="text-4xl mb-4">{action.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2">{action.title}</h3>
              <p className="text-sm text-gray-400">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Board Members */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">أعضاء المجلس</h2>
          <Link href="/board/members" className="text-primary-400 hover:text-primary-300 text-sm">
            عرض الكل ←
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {members.map((member) => (
            <Link
              key={member.id}
              href={`/board/chat?member=${member.id}`}
              className="group relative p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 text-center"
            >
              <div className={`w-16 h-16 mx-auto mb-3 rounded-2xl bg-gradient-to-br ${roleColors[member.role]} p-0.5`}>
                <div className="w-full h-full rounded-[14px] bg-gray-800 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{member.nameAr.charAt(0)}</span>
                </div>
              </div>
              <h3 className="font-semibold text-white">{member.nameAr}</h3>
              <p className="text-sm text-gray-400">{getRoleDisplayName(member.role)}</p>
              <div className={`mt-2 inline-block px-2 py-0.5 rounded-full text-xs ${
                member.model === 'OPUS'
                  ? 'bg-purple-500/20 text-purple-400'
                  : 'bg-blue-500/20 text-blue-400'
              }`}>
                {member.model}
              </div>
              <div className={`absolute top-3 left-3 w-2.5 h-2.5 rounded-full ${
                member.status === 'ACTIVE' ? 'bg-green-500' : 'bg-gray-500'
              }`}></div>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Conversations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">المحادثات الأخيرة</h2>
          <Link href="/board/conversations" className="text-primary-400 hover:text-primary-300 text-sm">
            عرض الكل ←
          </Link>
        </div>

        {conversations.length === 0 ? (
          <div className="p-12 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
            <div className="text-5xl mb-4">💬</div>
            <h3 className="text-xl font-semibold text-white mb-2">لا توجد محادثات بعد</h3>
            <p className="text-gray-400 mb-6">ابدأ أول محادثة مع مجلس الإدارة</p>
            <Link
              href="/board/chat"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              محادثة جديدة
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.slice(0, 5).map((conv) => (
              <Link
                key={conv.id}
                href={`/board/chat/${conv.id}`}
                className="block p-4 bg-gray-800/50 rounded-xl border border-gray-700/50 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{conv.topic}</h4>
                    <p className="text-sm text-gray-400 mt-1">
                      {conv._count?.messages || 0} رسالة • {new Date(conv.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs ${
                    conv.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    {conv.status === 'ACTIVE' ? 'نشطة' : 'مكتملة'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
