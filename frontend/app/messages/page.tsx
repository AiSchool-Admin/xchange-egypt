'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSocket } from '@/lib/contexts/SocketContext';
import {
  getConversations,
  getMessages,
  sendMessage as sendMessageAPI,
  markMessagesAsRead,
  getOrCreateConversation,
  Conversation,
  Message,
} from '@/lib/api/chat';

export default function MessagesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const {
    connected,
    sendMessage: sendSocketMessage,
    markAsRead: markAsReadSocket,
    startTyping,
    stopTyping,
    onMessage,
    offMessage,
    onTyping,
    offTyping,
    onStopTyping,
    offStopTyping,
    onMessagesRead,
    offMessagesRead,
  } = useSocket();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [typingUsers, setTypingUsers] = useState<Record<string, boolean>>({});
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingRef = useRef<number>(0);

  const targetUserId = searchParams.get('userId');
  const itemId = searchParams.get('itemId');

  // Scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  // Load conversations
  const loadConversations = useCallback(async () => {
    try {
      const response = await getConversations({ limit: 50 });
      setConversations(response.data.conversations);
    } catch (error) {
      console.error('Failed to load conversations:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load messages for a conversation
  const loadMessages = useCallback(async (conversationId: string, showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      const response = await getMessages(conversationId, { limit: 100 });
      setMessages(response.data.messages);
      setTimeout(scrollToBottom, 100);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      if (showLoading) setLoading(false);
    }
  }, [scrollToBottom]);

  // Select a conversation
  const selectConversation = useCallback(async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    setTypingUsers({});
    await loadMessages(conversation.id);

    // Mark as read
    if (conversation.unreadCount > 0) {
      if (connected) {
        markAsReadSocket(conversation.id);
      } else {
        await markMessagesAsRead(conversation.id);
      }
      setConversations(prev =>
        prev.map(c => c.id === conversation.id ? { ...c, unreadCount: 0 } : c)
      );
    }
  }, [connected, loadMessages, markAsReadSocket]);

  // Start a new conversation
  const startConversation = useCallback(async (participant2Id: string, itemId?: string) => {
    try {
      const response = await getOrCreateConversation(participant2Id, itemId);
      const conv = response.data;
      setConversations(prev => {
        const exists = prev.find(c => c.id === conv.id);
        if (!exists) return [conv, ...prev];
        return prev;
      });
      selectConversation(conv);
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  }, [selectConversation]);

  // Handle sending message
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    setNewMessage('');
    setSendingMessage(true);

    // Stop typing indicator
    if (connected) {
      stopTyping(selectedConversation.id);
    }

    try {
      // Use WebSocket if connected, otherwise fall back to REST API
      if (connected) {
        sendSocketMessage(selectedConversation.id, messageContent);
      }

      // Always send via API to ensure persistence
      const response = await sendMessageAPI(selectedConversation.id, messageContent);

      // Only add if not already added by WebSocket
      setMessages(prev => {
        const exists = prev.find(m => m.id === response.data.id);
        if (!exists) return [...prev, response.data];
        return prev;
      });

      // Update conversation preview
      setConversations(prev =>
        prev.map(c =>
          c.id === selectedConversation.id
            ? { ...c, lastMessageText: messageContent, lastMessageAt: new Date().toISOString() }
            : c
        )
      );

      scrollToBottom();

      // Auto-focus input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
    } catch (error) {
      console.error('Failed to send message:', error);
      setNewMessage(messageContent); // Restore message on failure
    } finally {
      setSendingMessage(false);
    }
  }, [newMessage, selectedConversation, connected, stopTyping, sendSocketMessage, scrollToBottom]);

  // Handle typing indicator
  const handleTyping = useCallback(() => {
    if (!selectedConversation || !connected) return;

    const now = Date.now();
    if (now - lastTypingRef.current > 2000) {
      startTyping(selectedConversation.id);
      lastTypingRef.current = now;
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (selectedConversation) {
        stopTyping(selectedConversation.id);
      }
    }, 3000);
  }, [selectedConversation, connected, startTyping, stopTyping]);

  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'أمس';
    } else if (diffDays < 7) {
      return date.toLocaleDateString('ar-EG', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });
    }
  };

  // Initial load
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadConversations();
  }, [user, router, loadConversations]);

  // Handle URL params for new conversation
  useEffect(() => {
    if (targetUserId && user) {
      startConversation(targetUserId, itemId || undefined);
    }
  }, [targetUserId, itemId, user, startConversation]);

  // WebSocket event listeners
  useEffect(() => {
    if (!connected) return;

    const handleNewMessage = (message: Message) => {
      // Add message to current conversation
      if (selectedConversation && message.conversationId === selectedConversation.id) {
        setMessages(prev => {
          const exists = prev.find(m => m.id === message.id);
          if (!exists) return [...prev, message];
          return prev;
        });
        scrollToBottom();

        // Mark as read if we're viewing this conversation
        if (message.senderId !== user?.id) {
          markAsReadSocket(selectedConversation.id);
        }
      }

      // Update conversation list
      setConversations(prev => {
        const updated = prev.map(c => {
          if (c.id === message.conversationId) {
            return {
              ...c,
              lastMessageText: message.content,
              lastMessageAt: message.createdAt,
              unreadCount: selectedConversation?.id === c.id ? 0 : c.unreadCount + 1,
            };
          }
          return c;
        });
        // Move conversation to top
        const conv = updated.find(c => c.id === message.conversationId);
        if (conv) {
          return [conv, ...updated.filter(c => c.id !== message.conversationId)];
        }
        return updated;
      });
    };

    const handleTypingStart = (event: { conversationId: string; userId: string }) => {
      if (selectedConversation?.id === event.conversationId && event.userId !== user?.id) {
        setTypingUsers(prev => ({ ...prev, [event.userId]: true }));
      }
    };

    const handleTypingStop = (event: { conversationId: string; userId: string }) => {
      if (selectedConversation?.id === event.conversationId) {
        setTypingUsers(prev => {
          const updated = { ...prev };
          delete updated[event.userId];
          return updated;
        });
      }
    };

    const handleMessagesRead = (event: { conversationId: string; userId: string }) => {
      if (selectedConversation?.id === event.conversationId && event.userId !== user?.id) {
        setMessages(prev => prev.map(m => ({ ...m, isRead: true })));
      }
    };

    onMessage(handleNewMessage);
    onTyping(handleTypingStart);
    onStopTyping(handleTypingStop);
    onMessagesRead(handleMessagesRead);

    return () => {
      offMessage(handleNewMessage);
      offTyping(handleTypingStart);
      offStopTyping(handleTypingStop);
      offMessagesRead(handleMessagesRead);
    };
  }, [connected, selectedConversation, user, scrollToBottom, markAsReadSocket, onMessage, offMessage, onTyping, offTyping, onStopTyping, offStopTyping, onMessagesRead, offMessagesRead]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  if (!user) return null;

  const isTyping = Object.keys(typingUsers).length > 0;

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto">
        <div className="flex h-[calc(100vh-64px)]">
          {/* Conversations List */}
          <div className={`w-full md:w-1/3 bg-white border-l border-gray-200 flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-200 bg-gradient-to-l from-emerald-600 to-teal-600">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-bold text-white">الرسائل</h1>
                {connected && (
                  <span className="flex items-center gap-1 text-emerald-100 text-sm">
                    <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                    متصل
                  </span>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loading && conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-gray-500">جاري التحميل...</p>
                </div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">💬</span>
                  </div>
                  <p className="text-gray-600 font-medium mb-2">لا توجد محادثات</p>
                  <p className="text-sm text-gray-500">ابدأ محادثة من صفحة المنتج أو العروض</p>
                </div>
              ) : (
                conversations.map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => selectConversation(conversation)}
                    className={`w-full p-4 flex items-start gap-3 border-b border-gray-100 hover:bg-gray-50 transition text-right ${
                      selectedConversation?.id === conversation.id ? 'bg-emerald-50 border-r-4 border-r-emerald-500' : ''
                    }`}
                  >
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold flex-shrink-0">
                        {conversation.participant?.fullName?.charAt(0).toUpperCase() || 'م'}
                      </div>
                      {onlineUsers[conversation.participant?.id || ''] && (
                        <span className="absolute bottom-0 left-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conversation.participant?.fullName || 'مستخدم'}
                        </h3>
                        <span className="text-xs text-gray-500 flex-shrink-0 mr-2">
                          {conversation.lastMessageAt && formatTime(conversation.lastMessageAt)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 truncate mt-1">
                        {conversation.lastMessageText || 'لا توجد رسائل'}
                      </p>
                    </div>
                    {conversation.unreadCount > 0 && (
                      <span className="bg-emerald-500 text-white text-xs rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center flex-shrink-0 font-medium">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Thread */}
          <div className={`flex-1 flex flex-col ${selectedConversation ? 'flex' : 'hidden md:flex'}`}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white flex items-center gap-3 shadow-sm">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center font-bold">
                      {selectedConversation.participant?.fullName?.charAt(0).toUpperCase() || 'م'}
                    </div>
                    {onlineUsers[selectedConversation.participant?.id || ''] && (
                      <span className="absolute bottom-0 left-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="font-semibold text-gray-900">
                      {selectedConversation.participant?.fullName || 'مستخدم'}
                    </h2>
                    {isTyping ? (
                      <p className="text-sm text-emerald-600 flex items-center gap-1">
                        يكتب
                        <span className="flex gap-0.5">
                          <span className="w-1 h-1 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1 h-1 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1 h-1 bg-emerald-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </span>
                      </p>
                    ) : onlineUsers[selectedConversation.participant?.id || ''] ? (
                      <p className="text-sm text-green-600">متصل الآن</p>
                    ) : (
                      <p className="text-sm text-gray-500">غير متصل</p>
                    )}
                  </div>
                  {selectedConversation.item && (
                    <Link
                      href={`/items/${selectedConversation.item.id}`}
                      className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg hover:bg-gray-200 transition text-sm"
                    >
                      <span>📦</span>
                      <span className="text-gray-700 truncate max-w-[100px]">{selectedConversation.item.title}</span>
                    </Link>
                  )}
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-gray-50 to-gray-100">
                  {messages.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <span className="text-4xl">👋</span>
                      </div>
                      <p className="text-gray-600 font-medium mb-1">ابدأ المحادثة!</p>
                      <p className="text-sm text-gray-500">أرسل رسالة لبدء المحادثة</p>
                    </div>
                  ) : (
                    messages.map((message, index) => {
                      const isOwn = message.senderId === user.id;
                      const showAvatar = !isOwn && (index === 0 || messages[index - 1]?.senderId !== message.senderId);

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-start' : 'justify-end'}`}
                        >
                          {!isOwn && showAvatar && (
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold ml-2 flex-shrink-0">
                              {selectedConversation.participant?.fullName?.charAt(0).toUpperCase() || 'م'}
                            </div>
                          )}
                          {!isOwn && !showAvatar && <div className="w-8 ml-2" />}
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                              isOwn
                                ? 'bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-tr-sm'
                                : 'bg-white text-gray-900 shadow-sm border border-gray-100 rounded-tl-sm'
                            }`}
                          >
                            <p className="break-words leading-relaxed">{message.content}</p>
                            <div className={`text-xs mt-1 flex items-center gap-1 ${isOwn ? 'text-emerald-100' : 'text-gray-500'}`}>
                              {formatTime(message.createdAt)}
                              {isOwn && (
                                <span>
                                  {message.isRead ? (
                                    <svg className="w-4 h-4 text-blue-300" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M18 7l-1.41-1.41-6.34 6.34 1.41 1.41L18 7zm4.24-1.41L11.66 16.17 7.48 12l-1.41 1.41L11.66 19l12-12-1.42-1.41zM.41 13.41L6 19l1.41-1.41L1.83 12 .41 13.41z" />
                                    </svg>
                                  ) : (
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                                    </svg>
                                  )}
                                </span>
                              )}
                              {message.isEdited && <span>(معدّل)</span>}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Typing Indicator */}
                {isTyping && (
                  <div className="px-4 py-2 bg-white border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                      </div>
                      <span>{selectedConversation.participant?.fullName} يكتب...</span>
                    </div>
                  </div>
                )}

                {/* Message Input */}
                <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200">
                  <div className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={newMessage}
                      onChange={(e) => {
                        setNewMessage(e.target.value);
                        handleTyping();
                      }}
                      placeholder="اكتب رسالتك..."
                      className="flex-1 px-4 py-3 bg-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition"
                      disabled={sendingMessage}
                      dir="rtl"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim() || sendingMessage}
                      className="px-5 py-3 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      {sendingMessage ? (
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <>
                          <span className="hidden sm:inline">إرسال</span>
                          <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100">
                <div className="text-center">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                    <span className="text-5xl">💬</span>
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2">مرحباً بك في الرسائل</h2>
                  <p className="text-gray-500 mb-6">اختر محادثة من القائمة أو ابدأ محادثة جديدة</p>
                  <Link
                    href="/items"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-l from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition shadow-lg"
                  >
                    <span>تصفح المنتجات</span>
                    <svg className="w-5 h-5 rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
