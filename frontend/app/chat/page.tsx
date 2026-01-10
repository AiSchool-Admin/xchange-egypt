'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, User, MessageCircle, Search } from 'lucide-react';

interface Participant {
  id: string;
  fullName: string;
  avatar?: string;
  isOnline?: boolean;
}

interface LastMessage {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  lastMessage?: LastMessage;
  item?: {
    id: string;
    title: string;
    images?: string[];
  };
  unreadCount: number;
  updatedAt: string;
}

export default function ChatListPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login?redirect=/chat');
      return;
    }

    // Get user ID from token
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      setCurrentUserId(payload.userId || payload.sub || payload.id);
    } catch (e) {
      console.error('Error parsing token:', e);
    }

    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/chat/conversations?limit=50`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setError('حدث خطأ في تحميل المحادثات');
        return;
      }

      const data = await response.json();
      setConversations(data.data?.conversations || data.data || []);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  };

  const getOtherParticipant = (conversation: Conversation): Participant | null => {
    if (!conversation?.participants || !currentUserId) return null;
    return conversation.participants.find(p => p.id !== currentUserId) || null;
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'أمس';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('ar-EG', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ar-EG', { day: 'numeric', month: 'short' });
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchQuery.trim()) return true;
    const otherParticipant = getOtherParticipant(conv);
    const searchLower = searchQuery.toLowerCase();
    return (
      otherParticipant?.fullName?.toLowerCase().includes(searchLower) ||
      conv.item?.title?.toLowerCase().includes(searchLower) ||
      conv.lastMessage?.content?.toLowerCase().includes(searchLower)
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowRight className="w-5 h-5 text-gray-600" />
            </button>
            <h1 className="text-xl font-bold text-gray-900">المحادثات</h1>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث في المحادثات..."
              className="w-full bg-gray-100 border-0 rounded-xl pr-10 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>

      {/* Conversations List */}
      <div className="max-w-4xl mx-auto">
        {error ? (
          <div className="text-center py-16">
            <div className="text-red-500 text-6xl mb-4">!</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">{error}</h2>
            <button
              onClick={fetchConversations}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              إعادة المحاولة
            </button>
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="text-center py-16">
            <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {searchQuery ? 'لا توجد نتائج' : 'لا توجد محادثات'}
            </h2>
            <p className="text-gray-500">
              {searchQuery ? 'جرب البحث بكلمات مختلفة' : 'ابدأ محادثة جديدة من صفحة المنتج'}
            </p>
            {!searchQuery && (
              <Link
                href="/mobiles"
                className="inline-block mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              >
                تصفح المنتجات
              </Link>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredConversations.map((conversation) => {
              const otherParticipant = getOtherParticipant(conversation);
              const isOwnMessage = conversation.lastMessage?.senderId === currentUserId;

              return (
                <Link
                  key={conversation.id}
                  href={`/chat/${conversation.id}`}
                  className="flex items-center gap-3 px-4 py-4 hover:bg-gray-50 transition-colors"
                >
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    {otherParticipant?.avatar ? (
                      <Image
                        src={otherParticipant.avatar}
                        alt={otherParticipant.fullName || ''}
                        width={52}
                        height={52}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-13 h-13 bg-indigo-100 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600" />
                      </div>
                    )}
                    {otherParticipant?.isOnline && (
                      <span className="absolute bottom-0 left-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={`font-semibold text-gray-900 truncate ${conversation.unreadCount > 0 ? 'font-bold' : ''}`}>
                        {otherParticipant?.fullName || 'مستخدم'}
                      </h3>
                      <span className="text-xs text-gray-500 flex-shrink-0">
                        {conversation.lastMessage && formatTime(conversation.lastMessage.createdAt)}
                      </span>
                    </div>

                    {/* Item info */}
                    {conversation.item && (
                      <p className="text-xs text-indigo-600 truncate mb-1">
                        {conversation.item.title}
                      </p>
                    )}

                    {/* Last message */}
                    <div className="flex items-center justify-between">
                      <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                        {isOwnMessage && <span className="text-gray-400">أنت: </span>}
                        {conversation.lastMessage?.content || 'لا توجد رسائل'}
                      </p>
                      {conversation.unreadCount > 0 && (
                        <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mr-2">
                          {conversation.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
