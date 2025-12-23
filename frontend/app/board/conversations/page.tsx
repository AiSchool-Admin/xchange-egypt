'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  getConversations,
  BoardConversation,
  getConversationTypeDisplayName,
} from '@/lib/api/board';

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<BoardConversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const data = await getConversations();
        setConversations(data);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

  const filteredConversations = conversations.filter((conv) => {
    if (filter === 'all') return true;
    if (filter === 'active') return conv.status === 'ACTIVE';
    if (filter === 'completed') return conv.status === 'COMPLETED';
    return true;
  });

  const typeIcons: Record<string, string> = {
    MEETING: '🎯',
    QUESTION: '💬',
    TASK_DISCUSSION: '📋',
    BRAINSTORM: '💡',
    REVIEW: '📝',
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">المحادثات السابقة</h1>
          <p className="text-gray-400 mt-1">جميع محادثاتك مع مجلس الإدارة</p>
        </div>
        <Link
          href="/board/chat"
          className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          محادثة جديدة
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {(['all', 'active', 'completed'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl transition-colors ${
              filter === f
                ? 'bg-primary-500 text-white'
                : 'bg-gray-800/50 text-gray-400 hover:text-white'
            }`}
          >
            {f === 'all' && 'الكل'}
            {f === 'active' && 'النشطة'}
            {f === 'completed' && 'المكتملة'}
          </button>
        ))}
      </div>

      {/* Conversations List */}
      {filteredConversations.length === 0 ? (
        <div className="p-12 bg-gray-800/50 rounded-2xl border border-gray-700/50 text-center">
          <div className="text-5xl mb-4">📭</div>
          <h3 className="text-xl font-semibold text-white mb-2">لا توجد محادثات</h3>
          <p className="text-gray-400">
            {filter === 'all'
              ? 'لم تبدأ أي محادثة مع المجلس بعد'
              : filter === 'active'
              ? 'لا توجد محادثات نشطة حالياً'
              : 'لا توجد محادثات مكتملة'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredConversations.map((conv) => (
            <Link
              key={conv.id}
              href={`/board/chat/${conv.id}`}
              className="group block p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all"
            >
              <div className="flex items-start gap-4">
                <div className="text-3xl">{typeIcons[conv.type] || '💬'}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white group-hover:text-primary-400 transition-colors">
                      {conv.topic}
                    </h3>
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        conv.status === 'ACTIVE'
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}
                    >
                      {conv.status === 'ACTIVE' ? 'نشطة' : 'مكتملة'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span>{getConversationTypeDisplayName(conv.type)}</span>
                    <span>•</span>
                    <span>{conv._count?.messages || 0} رسالة</span>
                    <span>•</span>
                    <span>{new Date(conv.createdAt).toLocaleDateString('ar-EG', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}</span>
                  </div>
                  {conv.summary && (
                    <p className="mt-3 text-sm text-gray-400 line-clamp-2">{conv.summary}</p>
                  )}
                </div>
                <svg
                  className="w-5 h-5 text-gray-500 group-hover:text-primary-400 transition-colors"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
