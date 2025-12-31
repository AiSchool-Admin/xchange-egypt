'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  getConversation,
  sendMessage,
  conductStructuredDiscussion,
  generateCEOSummary,
  recordFounderDecision,
  endConversation,
  getBoardMembers,
  BoardConversation,
  BoardMember,
  BoardMemberResponse,
  CEOMode,
  CEOSummary,
  StructuredDiscussionItem,
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
    avatar?: string;
  };
  respondingTo?: string;
  sequence?: number;
  responseType?: 'initial' | 'response' | 'question' | 'summary';
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
  const [useStructuredMode, setUseStructuredMode] = useState(true);
  const [ceoSummary, setCeoSummary] = useState<CEOSummary | null>(null);
  const [showDecisionModal, setShowDecisionModal] = useState(false);
  const [decision, setDecision] = useState('');
  const [selectedAlternative, setSelectedAlternative] = useState('');
  const [currentResponder, setCurrentResponder] = useState<string | null>(null);
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
                avatar: membersData.find((mb: BoardMember) => mb.id === m.member?.id)?.avatar,
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
  }, [messages, currentResponder]);

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
      if (useStructuredMode) {
        // Use structured sequential discussion
        const result = await conductStructuredDiscussion(conversationId, {
          content: userMessage,
          maxResponders: 6,
        });

        // Add responses one by one with animation effect
        for (const item of result.discussion) {
          const member = members.find((m) => m.id === item.response.memberId);
          setCurrentResponder(item.response.memberNameAr);

          await new Promise((resolve) => setTimeout(resolve, 500)); // Small delay for UX

          const aiMsg: Message = {
            id: `${Date.now()}-${item.response.memberId}`,
            type: 'assistant',
            content: item.response.content,
            member: {
              name: item.response.memberName,
              nameAr: item.response.memberNameAr,
              role: item.response.memberRole,
              avatar: member?.avatar,
            },
            respondingTo: item.respondingTo,
            sequence: item.sequence,
            responseType: item.type,
            ceoMode: item.response.ceoMode,
            tokensUsed: item.response.tokensUsed,
            timestamp: new Date(),
          };

          setMessages((prev) => [...prev, aiMsg]);
        }
        setCurrentResponder(null);
      } else {
        // Use regular batch mode
        const result = await sendMessage(conversationId, {
          content: userMessage,
        });

        const aiMessages: Message[] = result.responses.map((response: BoardMemberResponse) => {
          const member = members.find((m) => m.id === response.memberId);
          return {
            id: `${Date.now()}-${response.memberId}`,
            type: 'assistant' as const,
            content: response.content,
            member: {
              name: response.memberName,
              nameAr: response.memberNameAr,
              role: response.memberRole,
              avatar: member?.avatar,
            },
            ceoMode: response.ceoMode,
            tokensUsed: response.tokensUsed,
            timestamp: new Date(),
          };
        });

        setMessages((prev) => [...prev, ...aiMessages]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const handleRequestSummary = async () => {
    setSending(true);
    setCurrentResponder('كريم (الرئيس التنفيذي) يعد الملخص...');

    try {
      const summary = await generateCEOSummary(conversationId);
      setCeoSummary(summary);

      // Refresh conversation to get the summary message
      const convData = await getConversation(conversationId);
      const msgs: Message[] = (convData.messages || []).map((m: any) => {
        const member = members.find((mb) => mb.id === m.memberId);
        return {
          id: m.id,
          type: m.role === 'USER' ? 'user' : 'assistant',
          content: m.content,
          member: m.member
            ? {
                name: m.member.name,
                nameAr: m.member.nameAr,
                role: m.member.role,
                avatar: member?.avatar,
              }
            : undefined,
          ceoMode: m.ceoMode,
          tokensUsed: m.tokensUsed,
          timestamp: new Date(m.createdAt),
        };
      });
      setMessages(msgs);
    } catch (error) {
      console.error('Error generating summary:', error);
    } finally {
      setSending(false);
      setCurrentResponder(null);
    }
  };

  const handleMakeDecision = async () => {
    if (!decision.trim()) return;

    setSending(true);
    try {
      await recordFounderDecision(conversationId, {
        decision,
        selectedAlternative: selectedAlternative || undefined,
      });

      setShowDecisionModal(false);
      setConversation((prev) => (prev ? { ...prev, status: 'COMPLETED' } : null));

      // Refresh conversation
      const convData = await getConversation(conversationId);
      setConversation(convData);
    } catch (error) {
      console.error('Error recording decision:', error);
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
    COO: 'from-teal-500 to-teal-600',
    CLO: 'from-rose-500 to-rose-600',
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
    <div className="flex h-screen bg-gray-900">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700/50 bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/board"
                className="text-gray-400 hover:text-white transition-colors"
              >
                ← العودة
              </Link>
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
            </div>
            <div className="flex items-center gap-3">
              {/* Mode Toggle */}
              <label className="flex items-center gap-2 text-sm text-gray-400 cursor-pointer">
                <span>نقاش متتابع</span>
                <div
                  className={`relative w-12 h-6 rounded-full transition-colors ${useStructuredMode ? 'bg-primary-500' : 'bg-gray-600'}`}
                  onClick={() => setUseStructuredMode(!useStructuredMode)}
                >
                  <div
                    className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${useStructuredMode ? 'right-1' : 'left-1'}`}
                  ></div>
                </div>
              </label>

              {conversation.status === 'ACTIVE' && (
                <>
                  <button
                    onClick={handleRequestSummary}
                    disabled={sending}
                    className="px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 rounded-xl transition-colors disabled:opacity-50"
                  >
                    📊 طلب ملخص CEO
                  </button>
                  <button
                    onClick={() => setShowDecisionModal(true)}
                    className="px-4 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-400 rounded-xl transition-colors"
                  >
                    ✅ اتخاذ قرار
                  </button>
                  <button
                    onClick={handleEndConversation}
                    className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-xl transition-colors"
                  >
                    إنهاء
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
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
                {/* Response context */}
                {message.respondingTo && (
                  <div className="text-xs text-gray-500 mb-2 flex items-center gap-1">
                    <span>↩️</span>
                    <span>ردًا على {message.respondingTo}</span>
                  </div>
                )}

                {message.member && (
                  <div className="flex items-center gap-3 mb-3">
                    {/* Avatar */}
                    {message.member.avatar ? (
                      <img
                        src={message.member.avatar}
                        alt={message.member.nameAr}
                        className="w-10 h-10 rounded-xl"
                      />
                    ) : (
                      <div
                        className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                          roleColors[message.member.role] || 'from-gray-500 to-gray-600'
                        } flex items-center justify-center`}
                      >
                        <span className="text-sm font-bold text-white">
                          {message.member.nameAr.charAt(0)}
                        </span>
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">{message.member.nameAr}</span>
                        {message.sequence && (
                          <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded-full">
                            #{message.sequence}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {getRoleDisplayName(message.member.role as any)}
                      </span>
                      {message.ceoMode && (
                        <span className="text-xs bg-purple-500/20 text-purple-400 px-2 py-0.5 rounded-full mr-2">
                          {getCEOModeDisplayName(message.ceoMode)}
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {message.type === 'user' && (
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-primary-500 flex items-center justify-center">
                      <span className="text-sm font-bold text-white">👤</span>
                    </div>
                    <span className="font-semibold text-white">المؤسس</span>
                  </div>
                )}

                <div className="text-gray-200 whitespace-pre-wrap leading-relaxed">
                  {message.content}
                </div>

                <div className="text-xs text-gray-500 mt-2 flex items-center gap-2">
                  <span>{message.timestamp.toLocaleTimeString('ar-EG')}</span>
                  {message.tokensUsed && <span>• {message.tokensUsed} token</span>}
                  {message.responseType && message.responseType !== 'response' && (
                    <span className={`px-2 py-0.5 rounded-full ${
                      message.responseType === 'initial' ? 'bg-blue-500/20 text-blue-400' :
                      message.responseType === 'question' ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {message.responseType === 'initial' ? 'بداية' :
                       message.responseType === 'question' ? 'سؤال' : 'ملخص'}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}

          {/* Current responder indicator */}
          {currentResponder && (
            <div className="flex justify-end">
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-400">{currentResponder}</span>
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
                placeholder="اكتب رسالتك للمجلس..."
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

      {/* CEO Summary Sidebar */}
      {ceoSummary && (
        <div className="w-80 border-r border-gray-700/50 bg-gray-800/30 p-4 overflow-y-auto">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            ملخص الرئيس التنفيذي
          </h2>

          <div className="space-y-4">
            {/* Alternatives */}
            <div className="bg-gray-800/50 rounded-xl p-4">
              <h3 className="font-semibold text-white mb-2">البدائل المطروحة</h3>
              <ul className="space-y-2">
                {ceoSummary.alternatives.map((alt, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="w-6 h-6 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-xs flex-shrink-0">
                      {i + 1}
                    </span>
                    <span>{alt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Recommendation */}
            <div className="bg-purple-500/10 border border-purple-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-purple-400 mb-2">توصية الرئيس التنفيذي</h3>
              <p className="text-gray-300 text-sm">{ceoSummary.recommendation}</p>
            </div>

            {/* Risks */}
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-red-400 mb-2">المخاطر</h3>
              <ul className="space-y-1">
                {ceoSummary.risks.map((risk, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                    <span className="text-red-400">⚠️</span>
                    {risk}
                  </li>
                ))}
              </ul>
            </div>

            {/* Next Steps */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <h3 className="font-semibold text-green-400 mb-2">الخطوات التالية</h3>
              <ul className="space-y-1">
                {ceoSummary.nextSteps.map((step, i) => (
                  <li key={i} className="text-gray-300 text-sm flex items-center gap-2">
                    <span className="text-green-400">→</span>
                    {step}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setShowDecisionModal(true)}
              className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-colors"
            >
              ✅ اتخاذ القرار النهائي
            </button>
          </div>
        </div>
      )}

      {/* Decision Modal */}
      {showDecisionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold text-white mb-4">اتخاذ القرار النهائي</h2>

            {ceoSummary && (
              <div className="mb-4">
                <label className="block text-sm text-gray-400 mb-2">اختر البديل:</label>
                <select
                  value={selectedAlternative}
                  onChange={(e) => setSelectedAlternative(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white"
                >
                  <option value="">-- اختر --</option>
                  {ceoSummary.alternatives.map((alt, i) => (
                    <option key={i} value={alt}>{alt}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-2">القرار:</label>
              <textarea
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                placeholder="اكتب قرارك هنا..."
                className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white h-32 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowDecisionModal(false)}
                className="flex-1 py-3 bg-gray-700 hover:bg-gray-600 text-white rounded-xl transition-colors"
              >
                إلغاء
              </button>
              <button
                onClick={handleMakeDecision}
                disabled={!decision.trim() || sending}
                className="flex-1 py-3 bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white rounded-xl font-semibold transition-colors"
              >
                تأكيد القرار
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
