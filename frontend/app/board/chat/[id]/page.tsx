'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getConversation,
  sendMessage,
  endConversation,
  getBoardMembers,
  BoardConversation,
  BoardMember,
  BoardMemberResponse,
  CEOMode,
  getRoleDisplayName,
  getCEOModeDisplayName,
  getConversationTypeDisplayName,
} from '@/lib/api/board';

interface Message {
  id: string;
  type: 'user' | 'assistant';
  content: string;
  member?: {
    name: string;
    nameAr: string;
    role: string;
  };
  ceoMode?: CEOMode;
  tokensUsed?: number;
  timestamp: Date;
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id as string;

  const [conversation, setConversation] = useState<BoardConversation | null>(null);
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [ceoMode, setCeoMode] = useState<CEOMode>('LEADER');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [convData, membersData] = await Promise.all([
          getConversation(conversationId),
          getBoardMembers(),
        ]);
        setConversation(convData);
        setMembers(membersData);

        // Convert conversation messages to our format
        const msgs: Message[] = (convData.messages || []).map((m: any) => ({
          id: m.id,
          type: m.role === 'USER' ? 'user' : 'assistant',
          content: m.content,
          member: m.member
            ? {
                name: m.member.name,
                nameAr: m.member.nameAr,
                role: m.member.role,
              }
            : undefined,
          ceoMode: m.ceoMode,
          tokensUsed: m.tokensUsed,
          timestamp: new Date(m.createdAt),
        }));
        setMessages(msgs);
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || sending) return;

    const userMessage = input.trim();
    setInput('');
    setSending(true);

    // Add user message to UI
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      const result = await sendMessage(conversationId, {
        content: userMessage,
        targetMemberIds: selectedMembers.length > 0 ? selectedMembers : undefined,
        ceoMode: selectedMembers.some((id) => members.find((m) => m.id === id)?.role === 'CEO')
          ? ceoMode
          : undefined,
      });

      // Add AI responses
      const aiMessages: Message[] = result.responses.map((response: BoardMemberResponse) => ({
        id: `${Date.now()}-${response.memberId}`,
        type: 'assistant' as const,
        content: response.content,
        member: {
          name: response.memberName,
          nameAr: response.memberNameAr,
          role: response.memberRole,
        },
        ceoMode: response.ceoMode,
        tokensUsed: response.tokensUsed,
        timestamp: new Date(),
      }));

      setMessages((prev) => [...prev, ...aiMessages]);
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleEndConversation = async () => {
    if (!confirm('هل أنت متأكد من إنهاء المحادثة؟')) return;

    try {
      await endConversation(conversationId);
      setConversation((prev) => (prev ? { ...prev, status: 'COMPLETED' } : null));
    } catch (error) {
      console.error('Error ending conversation:', error);
    }
  };

  const roleColors: Record<string, string> = {
    CEO: 'from-purple-500 to-purple-600',
    CTO: 'from-blue-500 to-blue-600',
    CFO: 'from-green-500 to-green-600',
    CMO: 'from-orange-500 to-orange-600',
    COO: 'from-yellow-500 to-yellow-600',
    CLO: 'from-red-500 to-red-600',
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!conversation) {
    return (
      <div className="p-8 text-center">
        <h1 className="text-2xl font-bold text-white mb-4">المحادثة غير موجودة</h1>
        <Link href="/board/conversations" className="text-primary-400 hover:underline">
          العودة للمحادثات
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50 bg-gray-800/30">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">{conversation.topic}</h1>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-sm text-gray-400">
                  {getConversationTypeDisplayName(conversation.type)}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-xs ${
                    conversation.status === 'ACTIVE'
                      ? 'bg-green-500/20 text-green-400'
                      : 'bg-gray-500/20 text-gray-400'
                  }`}
                >
                  {conversation.status === 'ACTIVE' ? 'نشطة' : 'مكتملة'}
                </span>
              </div>
            </div>
            {conversation.status === 'ACTIVE' && (
              <button
                onClick={handleEndConversation}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
              >
                إنهاء المحادثة
              </button>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-start' : 'justify-end'}`}
            >
              <div
                className={`max-w-2xl rounded-2xl p-4 ${
                  message.type === 'user'
                    ? 'bg-primary-500/20 border border-primary-500/30'
                    : 'bg-gray-800/80 border border-gray-700/50'
                }`}
              >
                {message.member && (
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${
                        roleColors[message.member.role] || 'from-gray-500 to-gray-600'
                      } flex items-center justify-center`}
                    >
                      <span className="text-sm font-bold text-white">
                        {message.member.nameAr.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <span className="font-semibold text-white">{message.member.nameAr}</span>
                      <span className="text-xs text-gray-400 mr-2">
                        {getRoleDisplayName(message.member.role as any)}
                      </span>
                      {message.ceoMode && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full">
                          {getCEOModeDisplayName(message.ceoMode)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
                {message.type === 'user' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">أ</span>
                    </div>
                    <span className="font-semibold text-white">أنت</span>
                  </div>
                )}
                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>
                <div className="text-xs text-gray-500 mt-2">
                  {message.timestamp.toLocaleTimeString('ar-EG')}
                  {message.tokensUsed && ` • ${message.tokensUsed} token`}
                </div>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex justify-end">
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.1s' }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"
                      style={{ animationDelay: '0.2s' }}
                    ></div>
                  </div>
                  <span className="text-gray-400">المجلس يفكر...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        {conversation.status === 'ACTIVE' && (
          <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
            <div className="flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="اكتب رسالتك..."
                className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
                disabled={sending}
              />
              <button
                onClick={handleSend}
                disabled={sending || !input.trim()}
                className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors"
              >
                إرسال
              </button>
            </div>
          </div>
        )}

        {/* Summary for completed conversations */}
        {conversation.status === 'COMPLETED' && conversation.summary && (
          <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
            <h3 className="font-semibold text-white mb-2">📝 ملخص المحادثة</h3>
            <p className="text-gray-400">{conversation.summary}</p>
          </div>
        )}
      </div>
    </div>
  );
}
