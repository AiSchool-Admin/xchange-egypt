'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSocket } from '@/lib/contexts/SocketContext';
import {
  getConversations,
  getMessages,
  sendMessage as sendMessageAPI,
  getOrCreateConversation,
  Message,
} from '@/lib/api/chat';
import {
  getDealerDetails,
  DEALER_TYPE_AR,
  ScrapDealerType,
} from '@/lib/api/scrap-marketplace';

const DEALER_TYPE_ICONS: Record<ScrapDealerType, string> = {
  INDIVIDUAL_COLLECTOR: '👤',
  SCRAP_DEALER: '🏪',
  RECYCLING_COMPANY: '♻️',
  REPAIR_TECHNICIAN: '🔧',
  FACTORY: '🏭',
  EXPORT_COMPANY: '🚢',
};

const QUICK_MESSAGES = [
  'مرحباً، أريد بيع خردة',
  'ما هي الأسعار الحالية؟',
  'هل توفرون خدمة الجمع من الباب؟',
  'متى يمكنني تسليم المواد؟',
  'أريد معرفة أقرب فرع',
];

export default function DealerChatPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const {
    connected,
    sendMessage: sendSocketMessage,
    startTyping,
    stopTyping,
    onMessage,
    offMessage,
    onTyping,
    offTyping,
    onStopTyping,
    offStopTyping,
  } = useSocket();

  const [dealer, setDealer] = useState<any>(null);
  const [conversation, setConversation] = useState<any>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [showQuickMessages, setShowQuickMessages] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load dealer and conversation
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    if (params.dealerId) {
      loadDealer(params.dealerId as string);
    }
  }, [user, params.dealerId, router]);

  const loadDealer = async (dealerId: string) => {
    try {
      setLoading(true);
      const dealerData = await getDealerDetails(dealerId);
      setDealer(dealerData.data || dealerData);

      // Get or create conversation with dealer's user
      if (dealerData.data?.userId || dealerData.userId) {
        const userId = dealerData.data?.userId || dealerData.userId;
        const convResponse = await getOrCreateConversation(userId);
        setConversation(convResponse.data);

        // Load messages
        const msgResponse = await getMessages(convResponse.data.id, { limit: 100 });
        setMessages(msgResponse.data.messages || []);
        setTimeout(scrollToBottom, 100);

        // Hide quick messages if there are already messages
        if (msgResponse.data.messages?.length > 0) {
          setShowQuickMessages(false);
        }
      }
    } catch (error) {
      console.error('Error loading dealer/chat:', error);
    } finally {
      setLoading(false);
    }
  };

  // WebSocket listeners
  useEffect(() => {
    if (!connected || !conversation) return;

    const handleNewMessage = (message: Message) => {
      if (message.conversationId === conversation.id) {
        setMessages((prev) => {
          const exists = prev.find((m) => m.id === message.id);
          if (!exists) return [...prev, message];
          return prev;
        });
        scrollToBottom();
        setShowQuickMessages(false);
      }
    };

    const handleTypingStart = (event: { conversationId: string; userId: string }) => {
      if (event.conversationId === conversation.id && event.userId !== user?.id) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = (event: { conversationId: string; userId: string }) => {
      if (event.conversationId === conversation.id) {
        setIsTyping(false);
      }
    };

    onMessage(handleNewMessage);
    onTyping(handleTypingStart);
    onStopTyping(handleTypingStop);

    return () => {
      offMessage(handleNewMessage);
      offTyping(handleTypingStart);
      offStopTyping(handleTypingStop);
    };
  }, [connected, conversation, user, scrollToBottom, onMessage, offMessage, onTyping, offTyping, onStopTyping, offStopTyping]);

  const handleSend = async (messageText?: string) => {
    const content = messageText || newMessage.trim();
    if (!content || !conversation) return;

    setNewMessage('');
    setSending(true);
    setShowQuickMessages(false);

    if (connected && conversation) {
      stopTyping(conversation.id);
    }

    try {
      if (connected) {
        sendSocketMessage(conversation.id, content);
      }

      const response = await sendMessageAPI(conversation.id, content);
      setMessages((prev) => {
        const exists = prev.find((m) => m.id === response.data.id);
        if (!exists) return [...prev, response.data];
        return prev;
      });
      scrollToBottom();
      inputRef.current?.focus();
    } catch (error) {
      console.error('Error sending message:', error);
      setNewMessage(content);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (!conversation || !connected) return;

    startTyping(conversation.id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping(conversation.id);
    }, 3000);
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'اليوم';
    if (date.toDateString() === yesterday.toDateString()) return 'أمس';
    return date.toLocaleDateString('ar-EG', { weekday: 'long', day: 'numeric', month: 'short' });
  };

  // Group messages by date
  const groupedMessages = messages.reduce((groups: Record<string, Message[]>, message) => {
    const date = new Date(message.createdAt).toDateString();
    if (!groups[date]) groups[date] = [];
    groups[date].push(message);
    return groups;
  }, {});

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500">جاري تحميل المحادثة...</p>
        </div>
      </div>
    );
  }

  if (!dealer) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <span className="text-6xl mb-4 block">❌</span>
          <h2 className="text-xl font-bold text-gray-700 mb-4">التاجر غير موجود</h2>
          <Link
            href="/scrap/dealers"
            className="bg-orange-600 text-white px-6 py-3 rounded-lg font-bold"
          >
            العودة للتجار
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-l from-orange-600 to-amber-600 text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link
              href={`/scrap/dealers/${dealer.id}`}
              className="p-2 hover:bg-white/20 rounded-lg transition"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Link>

            <div className="relative">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-2xl">
                  {DEALER_TYPE_ICONS[dealer.dealerType as ScrapDealerType] || '🏪'}
                </span>
              </div>
              {connected && (
                <span className="absolute bottom-0 left-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></span>
              )}
            </div>

            <div className="flex-1">
              <h1 className="font-bold text-lg">
                {dealer.businessName || dealer.user?.fullName || 'تاجر'}
              </h1>
              <p className="text-sm text-white/80">
                {DEALER_TYPE_AR[dealer.dealerType as ScrapDealerType]}
                {isTyping && ' • يكتب...'}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {dealer.user?.phone && (
                <a
                  href={`tel:${dealer.user.phone}`}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <span className="text-xl">📞</span>
                </a>
              )}
              <Link
                href={`/scrap/dealers/${dealer.id}`}
                className="p-2 hover:bg-white/20 rounded-lg transition"
              >
                <span className="text-xl">👤</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Dealer Info Banner */}
      <div className="bg-orange-50 border-b border-orange-100 py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4">
              {dealer.governorate && (
                <span className="text-gray-600">
                  📍 {dealer.city && `${dealer.city}، `}{dealer.governorate}
                </span>
              )}
              {dealer.isVerified && (
                <span className="text-green-600">✓ موثق</span>
              )}
            </div>
            {dealer.offersPickup && (
              <span className="text-blue-600">🚛 يوفر خدمة الجمع</span>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Quick Messages */}
        {showQuickMessages && messages.length === 0 && (
          <div className="bg-white rounded-xl p-4 mb-4">
            <p className="text-sm text-gray-500 mb-3">رسائل سريعة:</p>
            <div className="flex flex-wrap gap-2">
              {QUICK_MESSAGES.map((msg, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(msg)}
                  className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm hover:bg-orange-200 transition"
                >
                  {msg}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages grouped by date */}
        {Object.entries(groupedMessages).map(([date, msgs]) => (
          <div key={date}>
            <div className="text-center mb-4">
              <span className="bg-gray-200 text-gray-600 px-4 py-1 rounded-full text-xs">
                {formatDate(msgs[0].createdAt)}
              </span>
            </div>

            {msgs.map((message, index) => {
              const isOwn = message.senderId === user.id;
              const showAvatar = !isOwn && (index === 0 || msgs[index - 1]?.senderId !== message.senderId);

              return (
                <div
                  key={message.id}
                  className={`flex mb-2 ${isOwn ? 'justify-start' : 'justify-end'}`}
                >
                  {!isOwn && showAvatar && (
                    <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center ml-2 flex-shrink-0">
                      <span className="text-sm">
                        {DEALER_TYPE_ICONS[dealer.dealerType as ScrapDealerType] || '🏪'}
                      </span>
                    </div>
                  )}
                  {!isOwn && !showAvatar && <div className="w-8 ml-2" />}

                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                      isOwn
                        ? 'bg-gradient-to-l from-orange-500 to-orange-600 text-white rounded-tr-sm'
                        : 'bg-white text-gray-900 shadow-sm rounded-tl-sm'
                    }`}
                  >
                    <p className="break-words">{message.content}</p>
                    <p className={`text-xs mt-1 ${isOwn ? 'text-orange-100' : 'text-gray-400'}`}>
                      {formatTime(message.createdAt)}
                      {isOwn && message.isRead && ' ✓✓'}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex justify-end">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);
              handleTyping();
            }}
            placeholder="اكتب رسالتك..."
            className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="px-5 py-3 bg-gradient-to-l from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 disabled:opacity-50 transition"
          >
            {sending ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
