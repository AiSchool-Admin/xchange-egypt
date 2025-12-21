/**
 * صفحة المزاد العكسي المباشر
 * Live Reverse Auction Page
 * سوق المناقصات - Xchange Egypt
 */

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

// ==================== Types ====================
interface Auction {
  id: string;
  tenderId: string;
  tenderTitle: string;
  tenderReference: string;
  status: 'PENDING' | 'ACTIVE' | 'EXTENDED' | 'ENDED' | 'CANCELLED';
  startPrice: number;
  currentPrice: number;
  minimumDecrement: number;
  currency: string;
  startTime: string;
  endTime: string;
  extensionMinutes: number;
  extensionThreshold: number;
  totalBids: number;
  uniqueBidders: number;
  owner: {
    name: string;
    type: string;
    logo?: string;
  };
}

interface Bid {
  id: string;
  bidderId: string;
  bidderName: string;
  bidderAlias: string; // Anonymous display name
  amount: number;
  timestamp: string;
  isLeading: boolean;
  isMyBid: boolean;
}

interface Participant {
  id: string;
  alias: string;
  isOnline: boolean;
  lastBidTime?: string;
  totalBids: number;
}

// ==================== WebSocket Hook ====================
const useAuctionWebSocket = (auctionId: string, onMessage: (data: any) => void) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [reconnecting, setReconnecting] = useState(false);

  const connect = useCallback(() => {
    // In production, use actual WebSocket URL
    const wsUrl = `wss://api.xchange.eg/ws/auction/${auctionId}`;

    // Simulated connection for demo
    setConnected(true);
    console.log('WebSocket connected (simulated)');
  }, [auctionId]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnected(false);
  }, []);

  const sendBid = useCallback((amount: number) => {
    // In production, send via WebSocket
    console.log('Sending bid:', amount);
    // Simulate bid acceptance
    setTimeout(() => {
      onMessage({
        type: 'BID_ACCEPTED',
        data: {
          id: Date.now().toString(),
          amount,
          timestamp: new Date().toISOString(),
        },
      });
    }, 500);
  }, [onMessage]);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { connected, reconnecting, sendBid };
};

// ==================== Component ====================
export default function LiveAuctionPage() {
  const router = useRouter();
  const params = useParams();
  const auctionId = params?.id as string;

  // State
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [bidAmount, setBidAmount] = useState<number>(0);
  const [submittingBid, setSubmittingBid] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [myAlias] = useState('المزايد #7');
  const [soundEnabled, setSoundEnabled] = useState(true);

  const bidsContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // WebSocket handler
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'NEW_BID':
        setBids(prev => [data.data, ...prev]);
        setAuction(prev => prev ? {
          ...prev,
          currentPrice: data.data.amount,
          totalBids: prev.totalBids + 1,
        } : null);
        if (soundEnabled && audioRef.current) {
          audioRef.current.play().catch(() => {});
        }
        break;
      case 'AUCTION_EXTENDED':
        setAuction(prev => prev ? {
          ...prev,
          endTime: data.data.newEndTime,
          status: 'EXTENDED',
        } : null);
        break;
      case 'AUCTION_ENDED':
        setAuction(prev => prev ? {
          ...prev,
          status: 'ENDED',
        } : null);
        break;
      case 'BID_ACCEPTED':
        setSubmittingBid(false);
        setShowConfirmation(false);
        setBidAmount(0);
        break;
      case 'BID_REJECTED':
        setSubmittingBid(false);
        setError(data.data.reason);
        break;
    }
  }, [soundEnabled]);

  const { connected, sendBid } = useAuctionWebSocket(auctionId, handleWebSocketMessage);

  // Load auction data
  useEffect(() => {
    loadAuctionData();
  }, [auctionId]);

  // Timer effect
  useEffect(() => {
    if (!auction || auction.status === 'ENDED') return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const remaining = Math.max(0, end - now);
      setTimeRemaining(remaining);

      if (remaining === 0) {
        setAuction(prev => prev ? { ...prev, status: 'ENDED' } : null);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [auction]);

  // Auto-scroll to latest bids
  useEffect(() => {
    if (bidsContainerRef.current) {
      bidsContainerRef.current.scrollTop = 0;
    }
  }, [bids]);

  const loadAuctionData = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    const mockAuction: Auction = {
      id: auctionId,
      tenderId: 'tender-1',
      tenderTitle: 'مناقصة توريد أجهزة حاسب آلي لوزارة التربية والتعليم',
      tenderReference: 'TND-2024-00125',
      status: 'ACTIVE',
      startPrice: 700000,
      currentPrice: 625000,
      minimumDecrement: 5000,
      currency: 'EGP',
      startTime: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // Started 30 mins ago
      endTime: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Ends in 15 mins
      extensionMinutes: 5,
      extensionThreshold: 2,
      totalBids: 12,
      uniqueBidders: 5,
      owner: {
        name: 'وزارة التربية والتعليم',
        type: 'GOVERNMENT',
      },
    };

    const mockBids: Bid[] = [
      { id: '12', bidderId: 'v5', bidderName: 'شركة النور', bidderAlias: 'المزايد #5', amount: 625000, timestamp: new Date(Date.now() - 2 * 60 * 1000).toISOString(), isLeading: true, isMyBid: false },
      { id: '11', bidderId: 'v7', bidderName: 'شركتي', bidderAlias: 'المزايد #7', amount: 630000, timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), isLeading: false, isMyBid: true },
      { id: '10', bidderId: 'v3', bidderName: 'شركة التقنية', bidderAlias: 'المزايد #3', amount: 635000, timestamp: new Date(Date.now() - 7 * 60 * 1000).toISOString(), isLeading: false, isMyBid: false },
      { id: '9', bidderId: 'v5', bidderName: 'شركة النور', bidderAlias: 'المزايد #5', amount: 640000, timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), isLeading: false, isMyBid: false },
      { id: '8', bidderId: 'v7', bidderName: 'شركتي', bidderAlias: 'المزايد #7', amount: 645000, timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), isLeading: false, isMyBid: true },
      { id: '7', bidderId: 'v1', bidderName: 'شركة الأمل', bidderAlias: 'المزايد #1', amount: 650000, timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(), isLeading: false, isMyBid: false },
    ];

    const mockParticipants: Participant[] = [
      { id: 'v1', alias: 'المزايد #1', isOnline: true, totalBids: 3 },
      { id: 'v3', alias: 'المزايد #3', isOnline: true, totalBids: 2 },
      { id: 'v5', alias: 'المزايد #5', isOnline: true, totalBids: 4 },
      { id: 'v7', alias: 'المزايد #7', isOnline: true, totalBids: 2 },
      { id: 'v9', alias: 'المزايد #9', isOnline: false, totalBids: 1 },
    ];

    setAuction(mockAuction);
    setBids(mockBids);
    setParticipants(mockParticipants);
    setBidAmount(mockAuction.currentPrice - mockAuction.minimumDecrement);
    setLoading(false);
  };

  // Format currency
  const formatCurrency = (amount: number, currency: string = 'EGP') => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  // Format time remaining
  const formatTimeRemaining = (ms: number) => {
    if (ms <= 0) return '00:00:00';

    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((ms % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  // Format relative time
  const formatRelativeTime = (timestamp: string) => {
    const diff = Date.now() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);

    if (minutes < 1) return `منذ ${seconds} ثانية`;
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    return `منذ ${Math.floor(minutes / 60)} ساعة`;
  };

  // Handle bid submission
  const handleSubmitBid = () => {
    if (!auction || bidAmount >= auction.currentPrice) {
      setError('يجب أن يكون عرضك أقل من السعر الحالي');
      return;
    }

    if (auction.currentPrice - bidAmount < auction.minimumDecrement) {
      setError(`الحد الأدنى للتخفيض هو ${formatCurrency(auction.minimumDecrement)}`);
      return;
    }

    setShowConfirmation(true);
  };

  const confirmBid = () => {
    setSubmittingBid(true);
    setError(null);
    sendBid(bidAmount);

    // Simulate bid acceptance
    setTimeout(() => {
      const newBid: Bid = {
        id: Date.now().toString(),
        bidderId: 'v7',
        bidderName: 'شركتي',
        bidderAlias: myAlias,
        amount: bidAmount,
        timestamp: new Date().toISOString(),
        isLeading: true,
        isMyBid: true,
      };

      setBids(prev => prev.map(b => ({ ...b, isLeading: false })));
      setBids(prev => [newBid, ...prev]);
      setAuction(prev => prev ? {
        ...prev,
        currentPrice: bidAmount,
        totalBids: prev.totalBids + 1,
      } : null);
      setBidAmount(bidAmount - (auction?.minimumDecrement || 5000));
      setSubmittingBid(false);
      setShowConfirmation(false);
    }, 1000);
  };

  // Quick bid buttons
  const getQuickBidAmounts = () => {
    if (!auction) return [];
    const decrements = [1, 2, 3, 5];
    return decrements.map(mult => auction.currentPrice - (auction.minimumDecrement * mult));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-500 border-t-transparent mx-auto"></div>
          <p className="mt-4 text-gray-400">جاري الاتصال بالمزاد...</p>
        </div>
      </div>
    );
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <p className="text-red-500 text-lg">لم يتم العثور على المزاد</p>
          <Link href="/tenders" className="mt-4 text-emerald-500 hover:underline">
            العودة إلى المناقصات
          </Link>
        </div>
      </div>
    );
  }

  const isAuctionEnded = auction.status === 'ENDED' || timeRemaining === 0;
  const isLeading = bids[0]?.isMyBid;

  return (
    <div className="min-h-screen bg-gray-900" dir="rtl">
      {/* Audio element for bid notifications */}
      <audio ref={audioRef} src="/sounds/bid-notification.mp3" preload="auto" />

      {/* Header */}
      <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link href={`/tenders/${auction.tenderId}`} className="text-gray-400 hover:text-white">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
              <div>
                <h1 className="text-lg font-bold text-white">المزاد العكسي المباشر</h1>
                <p className="text-sm text-gray-400">{auction.tenderReference}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                connected ? 'bg-emerald-900/50 text-emerald-400' : 'bg-red-900/50 text-red-400'
              }`}>
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`}></span>
                <span className="text-xs">{connected ? 'متصل' : 'غير متصل'}</span>
              </div>

              {/* Sound Toggle */}
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg ${soundEnabled ? 'text-emerald-400' : 'text-gray-500'}`}
              >
                {soundEnabled ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
                  </svg>
                )}
              </button>

              {/* My Alias */}
              <div className="bg-gray-700 px-3 py-1 rounded-lg">
                <span className="text-sm text-gray-300">أنت: </span>
                <span className="text-sm font-medium text-emerald-400">{myAlias}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Auction Info Card */}
            <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
              <h2 className="text-lg font-bold text-white mb-2">{auction.tenderTitle}</h2>
              <p className="text-gray-400 text-sm">{auction.owner.name}</p>

              {/* Status & Timer */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                {/* Status */}
                <div className={`p-4 rounded-lg ${
                  isAuctionEnded ? 'bg-red-900/30 border border-red-800' :
                  auction.status === 'EXTENDED' ? 'bg-orange-900/30 border border-orange-800' :
                  'bg-emerald-900/30 border border-emerald-800'
                }`}>
                  <p className="text-sm text-gray-400">حالة المزاد</p>
                  <p className={`text-xl font-bold ${
                    isAuctionEnded ? 'text-red-400' :
                    auction.status === 'EXTENDED' ? 'text-orange-400' :
                    'text-emerald-400'
                  }`}>
                    {isAuctionEnded ? 'انتهى' :
                     auction.status === 'EXTENDED' ? 'ممتد' : 'جاري'}
                  </p>
                </div>

                {/* Timer */}
                <div className={`p-4 rounded-lg ${
                  timeRemaining < 60000 ? 'bg-red-900/30 border border-red-800 animate-pulse' :
                  timeRemaining < 300000 ? 'bg-orange-900/30 border border-orange-800' :
                  'bg-gray-700 border border-gray-600'
                }`}>
                  <p className="text-sm text-gray-400">الوقت المتبقي</p>
                  <p className={`text-3xl font-mono font-bold ${
                    timeRemaining < 60000 ? 'text-red-400' :
                    timeRemaining < 300000 ? 'text-orange-400' :
                    'text-white'
                  }`}>
                    {formatTimeRemaining(timeRemaining)}
                  </p>
                </div>
              </div>

              {/* Price Info */}
              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-400">سعر البدء</p>
                  <p className="text-lg font-bold text-gray-300">{formatCurrency(auction.startPrice)}</p>
                </div>
                <div className="bg-emerald-900/50 rounded-lg p-4 text-center border-2 border-emerald-600">
                  <p className="text-sm text-emerald-400">السعر الحالي</p>
                  <p className="text-2xl font-bold text-emerald-400">{formatCurrency(auction.currentPrice)}</p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-400">الحد الأدنى للتخفيض</p>
                  <p className="text-lg font-bold text-gray-300">{formatCurrency(auction.minimumDecrement)}</p>
                </div>
              </div>

              {/* Savings */}
              <div className="mt-4 bg-emerald-900/20 rounded-lg p-3 text-center">
                <span className="text-emerald-400">
                  التوفير الحالي: {formatCurrency(auction.startPrice - auction.currentPrice)} ({((auction.startPrice - auction.currentPrice) / auction.startPrice * 100).toFixed(1)}%)
                </span>
              </div>
            </div>

            {/* Bid Input */}
            {!isAuctionEnded && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
                <h3 className="text-lg font-bold text-white mb-4">تقديم عرض</h3>

                {/* Position Indicator */}
                <div className={`mb-4 p-3 rounded-lg ${
                  isLeading ? 'bg-emerald-900/30 border border-emerald-700' : 'bg-orange-900/30 border border-orange-700'
                }`}>
                  {isLeading ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">أنت في المقدمة حالياً!</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-400">
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      <span className="font-medium">تم تجاوزك! قدم عرضاً أقل</span>
                    </div>
                  )}
                </div>

                {/* Quick Bid Buttons */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">مزايدة سريعة:</p>
                  <div className="grid grid-cols-4 gap-2">
                    {getQuickBidAmounts().map((amount, index) => (
                      <button
                        key={index}
                        onClick={() => setBidAmount(amount)}
                        className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                          bidAmount === amount
                            ? 'bg-emerald-600 text-white'
                            : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                        }`}
                      >
                        {formatCurrency(amount)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Bid Input */}
                <div className="mb-4">
                  <label className="block text-sm text-gray-400 mb-2">أو أدخل مبلغاً مخصصاً:</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={bidAmount || ''}
                      onChange={(e) => setBidAmount(parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white text-lg font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      placeholder="أدخل المبلغ"
                      max={auction.currentPrice - auction.minimumDecrement}
                    />
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      {auction.currency}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    الحد الأقصى المسموح: {formatCurrency(auction.currentPrice - auction.minimumDecrement)}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmitBid}
                  disabled={submittingBid || bidAmount >= auction.currentPrice}
                  className="w-full py-4 bg-emerald-600 text-white rounded-lg font-bold text-lg hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingBid ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      جاري الإرسال...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                      تقديم العرض
                    </span>
                  )}
                </button>

                <p className="mt-3 text-xs text-gray-500 text-center">
                  بالضغط على "تقديم العرض" فإنك توافق على الالتزام بهذا السعر في حال الفوز
                </p>
              </div>
            )}

            {/* Auction Ended Message */}
            {isAuctionEnded && (
              <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-center">
                <svg className="w-16 h-16 text-gray-500 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="text-xl font-bold text-white mt-4">انتهى المزاد</h3>
                <p className="text-gray-400 mt-2">
                  السعر النهائي: {formatCurrency(auction.currentPrice)}
                </p>
                {isLeading ? (
                  <div className="mt-4 p-4 bg-emerald-900/30 rounded-lg border border-emerald-700">
                    <p className="text-emerald-400 font-bold text-lg">مبروك! لقد فزت بالمزاد!</p>
                    <Link href={`/contracts/new?tenderId=${auction.tenderId}`} className="mt-3 inline-block px-6 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                      متابعة إجراءات التعاقد
                    </Link>
                  </div>
                ) : (
                  <p className="mt-4 text-gray-500">الفائز: {bids[0]?.bidderAlias}</p>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Bids History */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-white">سجل العروض</h3>
                <span className="text-sm text-gray-400">{auction.totalBids} عرض</span>
              </div>
              <div ref={bidsContainerRef} className="max-h-96 overflow-y-auto">
                {bids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className={`px-4 py-3 border-b border-gray-700/50 ${
                      bid.isMyBid ? 'bg-emerald-900/20' : ''
                    } ${index === 0 ? 'bg-emerald-900/30' : ''}`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {index === 0 && (
                          <span className="px-2 py-0.5 bg-emerald-600 text-white text-xs rounded-full">
                            الأدنى
                          </span>
                        )}
                        <span className={`text-sm ${bid.isMyBid ? 'text-emerald-400 font-medium' : 'text-gray-300'}`}>
                          {bid.bidderAlias}
                          {bid.isMyBid && ' (أنت)'}
                        </span>
                      </div>
                      <span className="text-sm font-bold text-white">
                        {formatCurrency(bid.amount)}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{formatRelativeTime(bid.timestamp)}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Participants */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-700 flex items-center justify-between">
                <h3 className="font-bold text-white">المشاركون</h3>
                <span className="text-sm text-gray-400">{auction.uniqueBidders} مشارك</span>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  {participants.map(participant => (
                    <div key={participant.id} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${participant.isOnline ? 'bg-emerald-400' : 'bg-gray-500'}`}></span>
                        <span className={`text-sm ${participant.alias === myAlias ? 'text-emerald-400 font-medium' : 'text-gray-300'}`}>
                          {participant.alias}
                          {participant.alias === myAlias && ' (أنت)'}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{participant.totalBids} عروض</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Rules */}
            <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
              <h3 className="font-bold text-white mb-3">قواعد المزاد</h3>
              <ul className="space-y-2 text-sm text-gray-400">
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  الحد الأدنى للتخفيض: {formatCurrency(auction.minimumDecrement)}
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  يُمدد المزاد {auction.extensionMinutes} دقائق إذا قُدم عرض في آخر {auction.extensionThreshold} دقيقة
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  هويات المزايدين مخفية أثناء المزاد
                </li>
                <li className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  العرض الأدنى المؤهل يفوز بالمزاد
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Bid Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl max-w-md w-full p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-4">تأكيد العرض</h3>
            <div className="bg-gray-700 rounded-lg p-4 mb-6">
              <p className="text-gray-400 text-sm mb-1">قيمة العرض:</p>
              <p className="text-3xl font-bold text-emerald-400">{formatCurrency(bidAmount)}</p>
            </div>
            <p className="text-gray-400 text-sm mb-6">
              بالمتابعة، أنت ملتزم بهذا السعر وستدخل في عقد مع صاحب المناقصة في حال فوزك.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmation(false)}
                className="flex-1 py-3 bg-gray-700 text-gray-300 rounded-lg hover:bg-gray-600"
              >
                إلغاء
              </button>
              <button
                onClick={confirmBid}
                disabled={submittingBid}
                className="flex-1 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-600 flex items-center justify-center gap-2"
              >
                {submittingBid ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    جاري الإرسال...
                  </>
                ) : (
                  'تأكيد'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
