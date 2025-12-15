'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  LUXURY_CATEGORY_AR,
  LuxuryCategoryType,
  formatLuxuryPrice,
  BidStatus,
} from '@/lib/api/luxury-marketplace';

interface MyBid {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  itemBrand: string;
  categoryType: LuxuryCategoryType;
  myBidAmount: number;
  currentHighBid: number;
  askingPrice: number;
  status: BidStatus;
  totalBids: number;
  auctionEnd: string;
  bidTime: string;
  isWinning: boolean;
  seller: {
    name: string;
    avatar?: string;
  };
}

const MOCK_BIDS: MyBid[] = [
  {
    id: '1',
    itemId: 'item-1',
    itemTitle: 'ساعة باتيك فيليب نوتيلس 5711',
    itemImage: 'https://picsum.photos/400/300?random=10',
    itemBrand: 'Patek Philippe',
    categoryType: 'WATCHES',
    myBidAmount: 7200000,
    currentHighBid: 7200000,
    askingPrice: 7500000,
    status: 'WINNING',
    totalBids: 18,
    auctionEnd: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    bidTime: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    isWinning: true,
    seller: { name: 'أحمد محمود' },
  },
  {
    id: '2',
    itemId: 'item-2',
    itemTitle: 'حقيبة شانيل كلاسيك فلاب متوسطة',
    itemImage: 'https://picsum.photos/400/300?random=11',
    itemBrand: 'Chanel',
    categoryType: 'HANDBAGS',
    myBidAmount: 550000,
    currentHighBid: 620000,
    askingPrice: 650000,
    status: 'OUTBID',
    totalBids: 12,
    auctionEnd: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
    bidTime: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    isWinning: false,
    seller: { name: 'سارة أحمد' },
  },
  {
    id: '3',
    itemId: 'item-3',
    itemTitle: 'ساعة رولكس ديتونا ستيل',
    itemImage: 'https://picsum.photos/400/300?random=12',
    itemBrand: 'Rolex',
    categoryType: 'WATCHES',
    myBidAmount: 1650000,
    currentHighBid: 1650000,
    askingPrice: 1800000,
    status: 'WON',
    totalBids: 25,
    auctionEnd: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    bidTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    isWinning: true,
    seller: { name: 'محمد علي' },
  },
  {
    id: '4',
    itemId: 'item-4',
    itemTitle: 'سوار كارتييه لوف ذهب وردي',
    itemImage: 'https://picsum.photos/400/300?random=13',
    itemBrand: 'Cartier',
    categoryType: 'JEWELRY',
    myBidAmount: 380000,
    currentHighBid: 450000,
    askingPrice: 480000,
    status: 'LOST',
    totalBids: 15,
    auctionEnd: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    bidTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    isWinning: false,
    seller: { name: 'نور حسين' },
  },
];

const BID_STATUS_AR: Record<BidStatus, string> = {
  ACTIVE: 'نشط',
  OUTBID: 'تم تجاوزك',
  WINNING: 'في المقدمة',
  WON: 'فزت بالمزاد',
  LOST: 'خسرت المزاد',
  CANCELLED: 'ملغي',
  EXPIRED: 'منتهي',
};

const BID_STATUS_COLOR: Record<BidStatus, string> = {
  ACTIVE: 'bg-blue-500/20 text-blue-400',
  OUTBID: 'bg-red-500/20 text-red-400',
  WINNING: 'bg-emerald-500/20 text-emerald-400',
  WON: 'bg-purple-500/20 text-purple-400',
  LOST: 'bg-gray-500/20 text-gray-400',
  CANCELLED: 'bg-gray-500/20 text-gray-400',
  EXPIRED: 'bg-gray-500/20 text-gray-400',
};

const STATUS_TABS = [
  { value: 'all', label: 'الكل', icon: '🔨' },
  { value: 'active', label: 'نشطة', icon: '⚡' },
  { value: 'winning', label: 'في المقدمة', icon: '🏆' },
  { value: 'outbid', label: 'تم تجاوزي', icon: '⚠️' },
  { value: 'won', label: 'فزت بها', icon: '🎉' },
  { value: 'lost', label: 'خسرتها', icon: '😔' },
];

export default function MyBidsPage() {
  const [bids, setBids] = useState<MyBid[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [showBidModal, setShowBidModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState<MyBid | null>(null);
  const [newBidAmount, setNewBidAmount] = useState('');

  useEffect(() => {
    loadBids();
  }, []);

  const loadBids = async () => {
    setLoading(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      setBids(MOCK_BIDS);
    } catch (error) {
      console.error('Failed to load bids:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredBids = bids.filter((bid) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return ['ACTIVE', 'WINNING', 'OUTBID'].includes(bid.status);
    if (activeTab === 'winning') return bid.status === 'WINNING';
    if (activeTab === 'outbid') return bid.status === 'OUTBID';
    if (activeTab === 'won') return bid.status === 'WON';
    if (activeTab === 'lost') return bid.status === 'LOST';
    return true;
  });

  const getTimeRemaining = (endDate: string): { text: string; urgent: boolean } => {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();

    if (diff <= 0) return { text: 'انتهى', urgent: false };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (days > 0) return { text: `${days} يوم ${hours} ساعة`, urgent: false };
    if (hours > 0) return { text: `${hours} ساعة ${minutes} دقيقة`, urgent: hours < 6 };
    return { text: `${minutes} دقيقة`, urgent: true };
  };

  const handleIncreaseBid = (bid: MyBid) => {
    setSelectedBid(bid);
    setNewBidAmount((bid.currentHighBid + 5000).toString());
    setShowBidModal(true);
  };

  const submitNewBid = () => {
    alert(`تم رفع المزايدة إلى ${Number(newBidAmount).toLocaleString('ar-EG')} ج.م`);
    setShowBidModal(false);
    setSelectedBid(null);
  };

  const stats = {
    total: bids.length,
    active: bids.filter((b) => ['ACTIVE', 'WINNING', 'OUTBID'].includes(b.status)).length,
    winning: bids.filter((b) => b.status === 'WINNING').length,
    won: bids.filter((b) => b.status === 'WON').length,
    totalBidAmount: bids.reduce((sum, b) => sum + b.myBidAmount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-950" dir="rtl">
      {/* Header */}
      <div className="bg-gray-900 border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <nav className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <Link href="/luxury" className="hover:text-white">السلع الفاخرة</Link>
            <span>/</span>
            <span className="text-amber-400">مزايداتي</span>
          </nav>
          <h1 className="text-2xl font-bold text-white">🔨 مزايداتي</h1>
          <p className="text-gray-400 mt-1">تتبع جميع مزايداتك على المنتجات الفاخرة</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: 'إجمالي المزايدات', value: stats.total, icon: '🔨', color: 'bg-gray-800' },
            { label: 'مزادات نشطة', value: stats.active, icon: '⚡', color: 'bg-blue-500/20' },
            { label: 'في المقدمة', value: stats.winning, icon: '🏆', color: 'bg-emerald-500/20' },
            { label: 'فزت بها', value: stats.won, icon: '🎉', color: 'bg-purple-500/20' },
            { label: 'إجمالي المزايدات', value: formatLuxuryPrice(stats.totalBidAmount), icon: '💰', color: 'bg-amber-500/20', isPrice: true },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-xl p-4 border border-gray-700/50`}>
              <div className="flex items-center gap-2 mb-2">
                <span>{stat.icon}</span>
                <span className="text-gray-400 text-sm">{stat.label}</span>
              </div>
              <div className={`font-bold text-white ${stat.isPrice ? 'text-lg' : 'text-2xl'}`}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-gray-900/50 border-y border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex gap-2 overflow-x-auto">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 rounded-lg font-medium transition whitespace-nowrap flex items-center gap-2 ${
                  activeTab === tab.value
                    ? 'bg-amber-500 text-gray-900'
                    : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Bids List */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-gray-800/50 rounded-xl p-6 animate-pulse">
                <div className="flex gap-6">
                  <div className="w-32 h-32 bg-gray-700 rounded-lg"></div>
                  <div className="flex-1">
                    <div className="h-6 bg-gray-700 rounded w-1/3 mb-3"></div>
                    <div className="h-4 bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredBids.length === 0 ? (
          <div className="text-center py-20 bg-gray-900/50 rounded-2xl border border-gray-800">
            <div className="text-6xl mb-6">🔨</div>
            <h3 className="text-2xl font-bold text-white mb-3">لا توجد مزايدات</h3>
            <p className="text-gray-400 mb-8">ابدأ المزايدة على المنتجات الفاخرة</p>
            <Link
              href="/luxury"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-xl font-bold"
            >
              <span>🛍️</span>
              <span>تصفح المنتجات</span>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredBids.map((bid) => {
              const timeRemaining = getTimeRemaining(bid.auctionEnd);
              const isActive = ['ACTIVE', 'WINNING', 'OUTBID'].includes(bid.status);

              return (
                <div
                  key={bid.id}
                  className={`bg-gray-800/50 rounded-xl border transition overflow-hidden ${
                    bid.status === 'OUTBID'
                      ? 'border-red-500/50'
                      : bid.status === 'WINNING'
                      ? 'border-emerald-500/50'
                      : 'border-gray-700/50'
                  }`}
                >
                  <div className="flex flex-col md:flex-row">
                    {/* Image */}
                    <Link href={`/luxury/item/${bid.itemId}`} className="md:w-48 h-48 md:h-auto bg-gray-900 flex-shrink-0">
                      <img
                        src={bid.itemImage}
                        alt={bid.itemTitle}
                        className="w-full h-full object-cover hover:scale-105 transition"
                      />
                    </Link>

                    {/* Content */}
                    <div className="flex-1 p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${BID_STATUS_COLOR[bid.status]}`}>
                              {bid.status === 'WINNING' && '🏆 '}
                              {bid.status === 'OUTBID' && '⚠️ '}
                              {bid.status === 'WON' && '🎉 '}
                              {BID_STATUS_AR[bid.status]}
                            </span>
                            <span className="text-gray-500 text-sm">
                              {LUXURY_CATEGORY_AR[bid.categoryType]}
                            </span>
                          </div>
                          <Link href={`/luxury/item/${bid.itemId}`}>
                            <h3 className="text-xl font-bold text-white hover:text-amber-400 transition mb-1">
                              {bid.itemTitle}
                            </h3>
                          </Link>
                          <p className="text-amber-500 text-sm">{bid.itemBrand}</p>
                        </div>

                        {/* Price Info */}
                        <div className="text-left space-y-1">
                          <div className="text-gray-400 text-sm">مزايدتك</div>
                          <div className={`text-xl font-bold ${bid.isWinning ? 'text-emerald-400' : 'text-white'}`}>
                            {formatLuxuryPrice(bid.myBidAmount)}
                          </div>
                          {!bid.isWinning && isActive && (
                            <div className="text-red-400 text-sm">
                              أعلى مزايدة: {formatLuxuryPrice(bid.currentHighBid)}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Auction Info */}
                      <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                        <span className="text-gray-400">
                          🔨 {bid.totalBids} مزايدة
                        </span>
                        <span className="text-gray-400">
                          💰 السعر المطلوب: {formatLuxuryPrice(bid.askingPrice)}
                        </span>
                        {isActive && (
                          <span className={`px-3 py-1 rounded-full ${timeRemaining.urgent ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-300'}`}>
                            ⏰ {timeRemaining.text}
                          </span>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-3">
                        <Link
                          href={`/luxury/item/${bid.itemId}`}
                          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition text-sm"
                        >
                          👁️ عرض المنتج
                        </Link>

                        {bid.status === 'OUTBID' && (
                          <button
                            onClick={() => handleIncreaseBid(bid)}
                            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-lg font-bold hover:from-amber-400 hover:to-yellow-400 transition text-sm"
                          >
                            ⬆️ رفع المزايدة
                          </button>
                        )}

                        {bid.status === 'WINNING' && (
                          <span className="px-4 py-2 bg-emerald-500/20 text-emerald-400 rounded-lg text-sm">
                            ✓ أنت في المقدمة
                          </span>
                        )}

                        {bid.status === 'WON' && (
                          <button className="px-4 py-2 bg-purple-500 text-white rounded-lg font-bold hover:bg-purple-400 transition text-sm">
                            💳 إتمام الدفع
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Increase Bid Modal */}
      {showBidModal && selectedBid && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-md w-full p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">رفع المزايدة</h3>
              <button
                onClick={() => setShowBidModal(false)}
                className="text-gray-400 hover:text-white text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-400 mb-2">{selectedBid.itemTitle}</p>
              <div className="flex justify-between text-sm mb-4">
                <span className="text-gray-500">أعلى مزايدة حالية:</span>
                <span className="text-white font-bold">{formatLuxuryPrice(selectedBid.currentHighBid)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">مزايدتك السابقة:</span>
                <span className="text-red-400">{formatLuxuryPrice(selectedBid.myBidAmount)}</span>
              </div>
            </div>

            <div className="mb-6">
              <label className="text-white font-medium block mb-2">المزايدة الجديدة (ج.م)</label>
              <input
                type="number"
                value={newBidAmount}
                onChange={(e) => setNewBidAmount(e.target.value)}
                min={selectedBid.currentHighBid + 5000}
                step={5000}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white text-xl focus:border-amber-500 focus:outline-none"
              />
              <p className="text-gray-500 text-sm mt-2">
                الحد الأدنى: {formatLuxuryPrice(selectedBid.currentHighBid + 5000)}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={submitNewBid}
                className="flex-1 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 text-gray-900 rounded-lg font-bold"
              >
                تأكيد المزايدة
              </button>
              <button
                onClick={() => setShowBidModal(false)}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg"
              >
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
