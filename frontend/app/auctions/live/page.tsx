'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

// Mock live auction data
interface LiveAuction {
  id: string;
  title: string;
  currentBid: number;
  bidCount: number;
  viewerCount: number;
  timeLeft: number;
  seller: {
    name: string;
    avatar: string;
    rating: number;
  };
  thumbnailUrl: string;
  isLive: boolean;
  startTime: string;
  category: string;
}

const MOCK_LIVE_AUCTIONS: LiveAuction[] = [
  {
    id: '1',
    title: 'iPhone 14 Pro Max 256GB - جديد بالكرتونة',
    currentBid: 42000,
    bidCount: 23,
    viewerCount: 156,
    timeLeft: 1800,
    seller: { name: 'أحمد محمد', avatar: '👨', rating: 4.8 },
    thumbnailUrl: '',
    isLive: true,
    startTime: new Date().toISOString(),
    category: 'موبايلات',
  },
  {
    id: '2',
    title: 'سيارة هيونداي توسان 2022',
    currentBid: 850000,
    bidCount: 45,
    viewerCount: 312,
    timeLeft: 3600,
    seller: { name: 'معرض النجم', avatar: '🚗', rating: 4.9 },
    thumbnailUrl: '',
    isLive: true,
    startTime: new Date().toISOString(),
    category: 'سيارات',
  },
  {
    id: '3',
    title: 'شقة 150م² التجمع الخامس',
    currentBid: 2500000,
    bidCount: 12,
    viewerCount: 89,
    timeLeft: 7200,
    seller: { name: 'شركة الأمل العقارية', avatar: '🏢', rating: 4.7 },
    thumbnailUrl: '',
    isLive: false,
    startTime: new Date(Date.now() + 3600000).toISOString(),
    category: 'عقارات',
  },
];

export default function LiveAuctionsPage() {
  const { user } = useAuth();
  const [liveAuctions, setLiveAuctions] = useState<LiveAuction[]>(MOCK_LIVE_AUCTIONS);
  const [selectedAuction, setSelectedAuction] = useState<LiveAuction | null>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [chatMessages, setChatMessages] = useState<{ user: string; message: string; time: string }[]>([
    { user: 'أحمد', message: 'منتج رائع!', time: '10:30' },
    { user: 'سارة', message: 'هل يوجد ضمان؟', time: '10:31' },
    { user: 'محمد', message: 'تم المزايدة 42000', time: '10:32' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const chatRef = useRef<HTMLDivElement>(null);

  // Countdown timer
  const [timeLeft, setTimeLeft] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const updated = { ...prev };
        liveAuctions.forEach(auction => {
          if (updated[auction.id] === undefined) {
            updated[auction.id] = auction.timeLeft;
          } else if (updated[auction.id] > 0) {
            updated[auction.id] -= 1;
          }
        });
        return updated;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [liveAuctions]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}س ${minutes}د ${secs}ث`;
    }
    return `${minutes}د ${secs}ث`;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  const handleBid = () => {
    if (!selectedAuction || !bidAmount) return;
    const amount = parseFloat(bidAmount);
    if (amount <= selectedAuction.currentBid) {
      alert('يجب أن تكون المزايدة أعلى من السعر الحالي');
      return;
    }
    // In a real app, this would call an API
    setLiveAuctions(prev => prev.map(a =>
      a.id === selectedAuction.id
        ? { ...a, currentBid: amount, bidCount: a.bidCount + 1 }
        : a
    ));
    setSelectedAuction(prev => prev ? { ...prev, currentBid: amount, bidCount: prev.bidCount + 1 } : null);
    setChatMessages(prev => [...prev, {
      user: user?.fullName || 'زائر',
      message: `مزايدة جديدة: ${formatPrice(amount)} ج.م`,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setBidAmount('');
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    setChatMessages(prev => [...prev, {
      user: user?.fullName || 'زائر',
      message: newMessage,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setNewMessage('');
    setTimeout(() => {
      chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="relative">
                <span className="text-4xl">📹</span>
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">المزادات الحية بالفيديو</h1>
                <p className="text-red-100">شاهد وزايد مباشرة مع البائع</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/auctions"
                className="bg-white/20 text-white px-4 py-2 rounded-lg hover:bg-white/30 transition"
              >
                ← العودة للمزادات
              </Link>
              <Link
                href="/auctions/live/new"
                className="bg-white text-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-50 transition"
              >
                + بث مزاد مباشر
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {selectedAuction ? (
          /* Live Auction View */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Video Player */}
            <div className="lg:col-span-2">
              <div className="bg-black rounded-xl overflow-hidden">
                <div className="aspect-video relative">
                  <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
                    <div className="text-center">
                      <span className="text-6xl mb-4 block">📹</span>
                      <p className="text-white text-xl">بث مباشر</p>
                      <p className="text-gray-400 mt-2">{selectedAuction.title}</p>
                    </div>
                  </div>

                  {/* Live Badge */}
                  <div className="absolute top-4 right-4 flex items-center gap-2">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                      <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                      مباشر
                    </span>
                    <span className="bg-black/60 text-white px-3 py-1 rounded-full text-sm">
                      👁 {selectedAuction.viewerCount} مشاهد
                    </span>
                  </div>

                  {/* Timer */}
                  <div className="absolute bottom-4 right-4 bg-black/80 text-white px-4 py-2 rounded-lg">
                    <span className="text-xs text-gray-400 block">الوقت المتبقي</span>
                    <span className="text-xl font-bold text-red-400">
                      {formatTime(timeLeft[selectedAuction.id] || selectedAuction.timeLeft)}
                    </span>
                  </div>
                </div>

                {/* Auction Info */}
                <div className="bg-gray-800 p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-white text-xl font-bold">{selectedAuction.title}</h2>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-2xl">{selectedAuction.seller.avatar}</span>
                        <div>
                          <p className="text-white font-medium">{selectedAuction.seller.name}</p>
                          <p className="text-yellow-400 text-sm">⭐ {selectedAuction.seller.rating}</p>
                        </div>
                      </div>
                    </div>
                    <div className="text-left">
                      <p className="text-gray-400 text-sm">المزايدة الحالية</p>
                      <p className="text-3xl font-bold text-green-400">{formatPrice(selectedAuction.currentBid)} ج.م</p>
                      <p className="text-gray-400 text-sm">{selectedAuction.bidCount} مزايدة</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bidding Section */}
              <div className="bg-gray-800 rounded-xl p-4 mt-4">
                <h3 className="text-white font-bold mb-3">زايد الآن</h3>
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`الحد الأدنى: ${formatPrice(selectedAuction.currentBid + 100)} ج.م`}
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                  />
                  <button
                    onClick={handleBid}
                    className="px-8 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-lg font-bold hover:from-red-700 hover:to-pink-700 transition"
                  >
                    زايد
                  </button>
                </div>
                <div className="flex gap-2 mt-3">
                  {[100, 500, 1000, 5000].map((increment) => (
                    <button
                      key={increment}
                      onClick={() => setBidAmount(String(selectedAuction.currentBid + increment))}
                      className="flex-1 py-2 bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-600 transition"
                    >
                      +{formatPrice(increment)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setSelectedAuction(null)}
                className="mt-4 text-gray-400 hover:text-white transition"
              >
                ← العودة لقائمة المزادات
              </button>
            </div>

            {/* Chat */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-xl h-[600px] flex flex-col">
                <div className="p-4 border-b border-gray-700">
                  <h3 className="text-white font-bold">💬 الدردشة المباشرة</h3>
                </div>
                <div
                  ref={chatRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3"
                >
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="bg-gray-700/50 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{msg.user}</span>
                        <span className="text-gray-500 text-xs">{msg.time}</span>
                      </div>
                      <p className="text-gray-300 text-sm">{msg.message}</p>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                      placeholder="اكتب رسالة..."
                      className="flex-1 px-4 py-2 bg-gray-700 text-white rounded-lg focus:ring-2 focus:ring-red-500 focus:outline-none"
                    />
                    <button
                      onClick={handleSendMessage}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                    >
                      إرسال
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Auctions List */
          <>
            {/* Stats Bar */}
            <div className="bg-gray-800 rounded-xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-red-500 text-2xl">🔴</span>
                  <div>
                    <p className="text-gray-400 text-sm">مزادات حية الآن</p>
                    <p className="text-white font-bold">{liveAuctions.filter(a => a.isLive).length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-yellow-500 text-2xl">⏰</span>
                  <div>
                    <p className="text-gray-400 text-sm">قريباً</p>
                    <p className="text-white font-bold">{liveAuctions.filter(a => !a.isLive).length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-green-500 text-2xl">👥</span>
                  <div>
                    <p className="text-gray-400 text-sm">إجمالي المشاهدين</p>
                    <p className="text-white font-bold">{liveAuctions.reduce((acc, a) => acc + a.viewerCount, 0)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Now Section */}
            <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
              <span className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              مباشر الآن
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {liveAuctions.filter(a => a.isLive).map((auction) => (
                <div
                  key={auction.id}
                  onClick={() => setSelectedAuction(auction)}
                  className="bg-gray-800 rounded-xl overflow-hidden cursor-pointer hover:ring-2 hover:ring-red-500 transition group"
                >
                  <div className="aspect-video relative bg-gradient-to-br from-gray-700 to-gray-800">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-5xl opacity-50 group-hover:scale-110 transition-transform">📹</span>
                    </div>
                    <div className="absolute top-3 right-3 flex items-center gap-2">
                      <span className="bg-red-600 text-white px-2 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
                        LIVE
                      </span>
                      <span className="bg-black/60 text-white px-2 py-0.5 rounded-full text-xs">
                        👁 {auction.viewerCount}
                      </span>
                    </div>
                    <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1 rounded text-sm">
                      ⏱ {formatTime(timeLeft[auction.id] || auction.timeLeft)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-bold line-clamp-1 mb-2">{auction.title}</h3>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{auction.seller.avatar}</span>
                        <span className="text-gray-400 text-sm">{auction.seller.name}</span>
                      </div>
                      <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">{auction.category}</span>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-700">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">المزايدة الحالية</span>
                        <span className="text-green-400 font-bold">{formatPrice(auction.currentBid)} ج.م</span>
                      </div>
                      <p className="text-gray-500 text-xs mt-1">{auction.bidCount} مزايدة</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Upcoming Section */}
            {liveAuctions.filter(a => !a.isLive).length > 0 && (
              <>
                <h2 className="text-white text-xl font-bold mb-4 flex items-center gap-2">
                  <span className="text-yellow-500">⏰</span>
                  قريباً
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveAuctions.filter(a => !a.isLive).map((auction) => (
                    <div
                      key={auction.id}
                      className="bg-gray-800 rounded-xl overflow-hidden opacity-80 hover:opacity-100 transition"
                    >
                      <div className="aspect-video relative bg-gradient-to-br from-gray-700 to-gray-800">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-5xl opacity-50">📹</span>
                        </div>
                        <div className="absolute top-3 right-3">
                          <span className="bg-yellow-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                            قريباً
                          </span>
                        </div>
                        <div className="absolute bottom-3 right-3 bg-black/80 text-white px-3 py-1 rounded text-sm">
                          يبدأ: {new Date(auction.startTime).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                      <div className="p-4">
                        <h3 className="text-white font-bold line-clamp-1 mb-2">{auction.title}</h3>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{auction.seller.avatar}</span>
                            <span className="text-gray-400 text-sm">{auction.seller.name}</span>
                          </div>
                          <span className="bg-gray-700 text-gray-300 px-2 py-0.5 rounded text-xs">{auction.category}</span>
                        </div>
                        <div className="mt-3 pt-3 border-t border-gray-700">
                          <button className="w-full py-2 bg-yellow-600 text-white rounded-lg font-medium hover:bg-yellow-700 transition">
                            🔔 تذكيري
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}
