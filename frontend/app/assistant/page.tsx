'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/lib/contexts/AuthContext';
import {
  createConversation,
  getConversations,
  getConversation,
  sendMessage,
  getQuickSuggestions,
  AIConversation,
  AIMessage,
} from '@/lib/api/ai-assistant';

function MessageBubble({ message, isUser }: { message: AIMessage; isUser: boolean }) {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isUser
            ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
        }`}
      >
        {!isUser && (
          <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
            <span className="text-xl">🤖</span>
            <span className="font-bold text-emerald-600 text-sm">المساعد الذكي</span>
          </div>
        )}
        <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>
        {message.suggestedAction && (
          <div className="mt-3 pt-2 border-t border-opacity-20 border-current">
            <span className="text-xs opacity-75">
              💡 الإجراء المقترح: {message.suggestedAction}
            </span>
          </div>
        )}
        <div className={`text-xs mt-2 ${isUser ? 'text-white/70' : 'text-gray-400'}`}>
          {new Date(message.createdAt).toLocaleTimeString('ar-EG', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}

function ConversationItem({
  conversation,
  isActive,
  onClick,
}: {
  conversation: AIConversation;
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-right p-3 rounded-xl transition-all ${
        isActive
          ? 'bg-gradient-to-l from-emerald-500 to-teal-500 text-white'
          : 'bg-white hover:bg-gray-50 border border-gray-100'
      }`}
    >
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">💬</span>
        <span className="font-bold text-sm truncate flex-1">
          {conversation.title || 'محادثة جديدة'}
        </span>
      </div>
      <div className={`text-xs ${isActive ? 'text-white/70' : 'text-gray-500'}`}>
        {conversation.messageCount} رسالة •{' '}
        {new Date(conversation.updatedAt).toLocaleDateString('ar-EG')}
      </div>
    </button>
  );
}

export default function AssistantPage() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<AIConversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<AIConversation | null>(null);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      fetchConversationsAndAutoStart();
      fetchSuggestions();
    } else {
      setLoading(false);
    }
  }, [user]);

  const fetchConversationsAndAutoStart = async () => {
    try {
      const response = await getConversations();
      const existingConversations = response.data?.conversations || [];
      setConversations(existingConversations);

      // Auto-start a new conversation if there are no existing ones
      if (existingConversations.length === 0) {
        await handleNewConversation();
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Try to create a new conversation even if fetching failed
      try {
        await handleNewConversation();
      } catch (createError) {
        console.error('Error creating conversation:', createError);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchSuggestions = async () => {
    try {
      const response = await getQuickSuggestions();
      setSuggestions(response.data?.suggestions || []);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const handleNewConversation = async () => {
    try {
      setLoading(true);
      const response = await createConversation();
      const newConversation = response.data?.conversation;
      if (newConversation) {
        setConversations([newConversation, ...conversations]);
        await loadConversation(newConversation.id);
      }
    } catch (error) {
      console.error('Error creating conversation:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadConversation = async (id: string) => {
    try {
      const response = await getConversation(id);
      const conversation = response.data?.conversation;
      if (conversation) {
        setActiveConversation(conversation);
        setMessages(conversation.messages || []);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async (content?: string) => {
    const messageContent = content || inputMessage.trim();
    if (!messageContent || !activeConversation || sending) return;

    setInputMessage('');
    setSending(true);

    // Optimistic update - add user message immediately
    const tempUserMessage: AIMessage = {
      id: 'temp-' + Date.now(),
      conversationId: activeConversation.id,
      role: 'USER',
      content: messageContent,
      suggestedItems: [],
      createdAt: new Date().toISOString(),
    };
    setMessages([...messages, tempUserMessage]);

    try {
      const response = await sendMessage(activeConversation.id, messageContent);
      const { userMessage, assistantMessage } = response.data;

      // Replace temp message and add assistant response
      setMessages((prev) =>
        prev.filter((m) => m.id !== tempUserMessage.id).concat([userMessage, assistantMessage])
      );

      // Update conversation in list
      setConversations((prev) =>
        prev.map((c) =>
          c.id === activeConversation.id
            ? { ...c, messageCount: c.messageCount + 2, updatedAt: new Date().toISOString() }
            : c
        )
      );
    } catch (error: any) {
      // Remove temp message on error
      setMessages((prev) => prev.filter((m) => m.id !== tempUserMessage.id));
      alert(error.response?.data?.message || 'حدث خطأ');
    } finally {
      setSending(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md">
          <span className="text-6xl mb-4 block">🤖</span>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">المساعد الذكي</h2>
          <p className="text-gray-600 mb-4">سجل دخول للتحدث مع المساعد الذكي</p>
          <a
            href="/login"
            className="inline-block bg-gradient-to-l from-emerald-500 to-teal-500 text-white px-6 py-3 rounded-lg font-bold"
          >
            تسجيل الدخول
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-80 bg-gray-50 border-l border-gray-200 flex flex-col">
            {/* Header */}
            <div className="p-4 bg-gradient-to-l from-emerald-600 to-teal-600 text-white">
              <h1 className="text-xl font-bold flex items-center gap-2">
                <span className="text-2xl">🤖</span>
                المساعد الذكي
              </h1>
              <p className="text-sm text-white/80 mt-1">اسأل أي شيء عن المقايضة والبيع</p>
            </div>

            {/* New Chat Button */}
            <div className="p-3">
              <button
                onClick={handleNewConversation}
                className="w-full py-3 bg-gradient-to-l from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2"
              >
                <span>➕</span>
                محادثة جديدة
              </button>
            </div>

            {/* Conversations List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {loading ? (
                <div className="space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-16 bg-gray-200 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : conversations.length > 0 ? (
                conversations.map((conv) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={activeConversation?.id === conv.id}
                    onClick={() => loadConversation(conv.id)}
                  />
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <span className="text-4xl block mb-2">💬</span>
                  <p>لا توجد محادثات</p>
                  <p className="text-sm">ابدأ محادثة جديدة!</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col bg-gray-100">
            {activeConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 bg-white border-b border-gray-200 shadow-sm">
                  <h2 className="font-bold text-gray-800">
                    {activeConversation.title || 'محادثة جديدة'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {activeConversation.messageCount} رسالة
                  </p>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4">
                  {messages.map((message) => (
                    <MessageBubble
                      key={message.id}
                      message={message}
                      isUser={message.role === 'USER'}
                    />
                  ))}
                  {sending && (
                    <div className="flex justify-start mb-4">
                      <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 shadow-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" />
                          <div
                            className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0.1s' }}
                          />
                          <div
                            className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"
                            style={{ animationDelay: '0.2s' }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Quick Suggestions */}
                {messages.length <= 2 && suggestions.length > 0 && (
                  <div className="px-4 pb-2">
                    <p className="text-xs text-gray-500 mb-2">💡 اقتراحات سريعة:</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((suggestion, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(suggestion)}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-700 hover:bg-emerald-50 hover:border-emerald-300 transition-all"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="اكتب رسالتك هنا..."
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      disabled={sending}
                    />
                    <button
                      onClick={() => handleSendMessage()}
                      disabled={!inputMessage.trim() || sending}
                      className="px-6 py-3 bg-gradient-to-l from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      إرسال
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center max-w-md">
                  <span className="text-8xl mb-6 block">🤖</span>
                  <h2 className="text-2xl font-bold text-gray-800 mb-2">مرحباً بك!</h2>
                  <p className="text-gray-600 mb-6">
                    أنا المساعد الذكي في XChange. يمكنني مساعدتك في:
                  </p>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {[
                      { icon: '🔍', text: 'البحث عن منتجات' },
                      { icon: '💱', text: 'اقتراح مقايضات' },
                      { icon: '💰', text: 'تقدير الأسعار' },
                      { icon: '📝', text: 'إنشاء إعلانات' },
                    ].map((item, i) => (
                      <div key={i} className="bg-white p-3 rounded-xl border border-gray-100">
                        <span className="text-2xl">{item.icon}</span>
                        <p className="mt-1 text-gray-700">{item.text}</p>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={handleNewConversation}
                    className="mt-6 px-6 py-3 bg-gradient-to-l from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-600 hover:to-teal-600"
                  >
                    ابدأ محادثة جديدة
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
