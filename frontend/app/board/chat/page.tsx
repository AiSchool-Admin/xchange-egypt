'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  getBoardMembers,
  startConversation,
  sendMessage,
  BoardMember,
  BoardMessage,
  BoardMemberResponse,
  CEOMode,
  ConversationType,
  getRoleDisplayName,
  getCEOModeDisplayName,
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

export default function BoardChat() {
  const searchParams = useSearchParams();
  const [members, setMembers] = useState<BoardMember[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [ceoMode, setCeoMode] = useState<CEOMode>('LEADER');
  const [features, setFeatures] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const typeParam = searchParams.get('type') as ConversationType | null;
  const memberParam = searchParams.get('member');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getBoardMembers();
        setMembers(data);

        // If a specific member is requested
        if (memberParam) {
          setSelectedMembers([memberParam]);
        }
      } catch (error) {
        console.error('Error fetching members:', error);
      }
    };

    fetchMembers();
  }, [memberParam]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    // Add user message to UI
    const userMsg: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);

    try {
      let currentConversationId = conversationId;

      // Start conversation if not exists
      if (!currentConversationId) {
        const conversation = await startConversation({
          topic: userMessage.substring(0, 100),
          type: typeParam || 'QUESTION',
          features,
        });
        currentConversationId = conversation.id;
        setConversationId(conversation.id);
      }

      // Send message
      const result = await sendMessage(currentConversationId, {
        content: userMessage,
        targetMemberIds: selectedMembers.length > 0 ? selectedMembers : undefined,
        ceoMode: selectedMembers.some(id => members.find(m => m.id === id)?.role === 'CEO') ? ceoMode : undefined,
        features,
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
      // Add error message
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: 'assistant',
          content: 'عذراً، حدث خطأ أثناء معالجة رسالتك. يرجى المحاولة مرة أخرى.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMember = (memberId: string) => {
    setSelectedMembers((prev) =>
      prev.includes(memberId)
        ? prev.filter((id) => id !== memberId)
        : [...prev, memberId]
    );
  };

  const toggleFeature = (feature: string) => {
    setFeatures((prev) =>
      prev.includes(feature)
        ? prev.filter((f) => f !== feature)
        : [...prev, feature]
    );
  };

  const roleColors: Record<string, string> = {
    CEO: 'from-purple-500 to-purple-600',
    CTO: 'from-blue-500 to-blue-600',
    CFO: 'from-green-500 to-green-600',
    CMO: 'from-orange-500 to-orange-600',
    COO: 'from-yellow-500 to-yellow-600',
    CLO: 'from-red-500 to-red-600',
  };

  const featureOptions = [
    { id: 'devils-advocate', name: 'محامي الشيطان', icon: '😈' },
    { id: 'pre-mortem', name: 'تحليل ما قبل الفشل', icon: '⚠️' },
    { id: 'board-challenges-founder', name: 'تحدي المؤسس', icon: '🎯' },
  ];

  return (
    <div className="flex h-screen">
      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-700/50 bg-gray-800/30">
          <h1 className="text-xl font-bold text-white">
            {typeParam === 'MEETING' && '🎯 اجتماع مجلس الإدارة'}
            {typeParam === 'BRAINSTORM' && '💡 عصف ذهني'}
            {typeParam === 'REVIEW' && '📋 مراجعة'}
            {(!typeParam || typeParam === 'QUESTION') && '💬 محادثة جديدة'}
          </h1>
          <p className="text-sm text-gray-400">
            {selectedMembers.length === 0
              ? 'سيتم تحديد المتحدثين تلقائياً بناءً على الموضوع'
              : `${selectedMembers.length} عضو محدد`}
          </p>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🏛️</div>
              <h2 className="text-2xl font-bold text-white mb-2">مجلس الإدارة جاهز</h2>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                اكتب سؤالك أو موضوعك وسيقوم أعضاء المجلس المناسبين بالرد عليك بناءً على خبرتهم
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {[
                  'ما استراتيجية النمو المقترحة؟',
                  'كيف نحسن تجربة المستخدم؟',
                  'ما الميزانية المطلوبة للتوسع؟',
                  'هل هناك مخاطر قانونية؟',
                ].map((suggestion) => (
                  <button
                    key={suggestion}
                    onClick={() => setInput(suggestion)}
                    className="px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-xl text-sm text-gray-300 transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

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
                {message.tokensUsed && (
                  <div className="text-xs text-gray-500 mt-2">
                    {message.tokensUsed} token
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-end">
              <div className="bg-gray-800/80 border border-gray-700/50 rounded-2xl p-4">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  <span className="text-gray-400">المجلس يفكر...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-gray-700/50 bg-gray-800/30">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="اكتب رسالتك للمجلس..."
              className="flex-1 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-primary-500 transition-colors"
              disabled={loading}
            />
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="px-6 py-3 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-700 disabled:cursor-not-allowed text-white rounded-xl transition-colors flex items-center gap-2"
            >
              <span>إرسال</span>
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Settings Sidebar */}
      <div className="w-80 border-r border-gray-700/50 bg-gray-800/30 p-4 overflow-y-auto">
        {/* Member Selection */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-400 mb-3">اختر المتحدثين (اختياري)</h3>
          <div className="space-y-2">
            {members.map((member) => (
              <button
                key={member.id}
                onClick={() => toggleMember(member.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  selectedMembers.includes(member.id)
                    ? 'bg-primary-500/20 border border-primary-500/50'
                    : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                    roleColors[member.role]
                  } flex items-center justify-center`}
                >
                  <span className="text-sm font-bold text-white">{member.nameAr.charAt(0)}</span>
                </div>
                <div className="flex-1 text-right">
                  <div className="font-medium text-white">{member.nameAr}</div>
                  <div className="text-xs text-gray-400">{getRoleDisplayName(member.role)}</div>
                </div>
                {selectedMembers.includes(member.id) && (
                  <svg className="w-5 h-5 text-primary-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* CEO Mode */}
        {selectedMembers.some((id) => members.find((m) => m.id === id)?.role === 'CEO') && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-400 mb-3">وضع كريم (CEO)</h3>
            <div className="space-y-2">
              {(['LEADER', 'STRATEGIST', 'VISIONARY'] as CEOMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setCeoMode(mode)}
                  className={`w-full p-3 rounded-xl text-right transition-all ${
                    ceoMode === mode
                      ? 'bg-purple-500/20 border border-purple-500/50'
                      : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'
                  }`}
                >
                  <div className="font-medium text-white">{getCEOModeDisplayName(mode)}</div>
                  <div className="text-xs text-gray-400">
                    {mode === 'LEADER' && 'تركيز على التنفيذ والقرارات السريعة'}
                    {mode === 'STRATEGIST' && 'تحليل عميق وخطط طويلة المدى'}
                    {mode === 'VISIONARY' && 'أفكار جريئة وتفكير خارج الصندوق'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        <div>
          <h3 className="text-sm font-semibold text-gray-400 mb-3">خيارات متقدمة</h3>
          <div className="space-y-2">
            {featureOptions.map((feature) => (
              <button
                key={feature.id}
                onClick={() => toggleFeature(feature.id)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                  features.includes(feature.id)
                    ? 'bg-yellow-500/20 border border-yellow-500/50'
                    : 'bg-gray-800/50 border border-gray-700/50 hover:border-gray-600'
                }`}
              >
                <span className="text-2xl">{feature.icon}</span>
                <span className="text-white">{feature.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
