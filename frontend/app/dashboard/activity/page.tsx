'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import apiClient from '@/lib/api/client';

// Types
interface ActivityItem {
  id: string;
  type: 'item' | 'transaction' | 'auction' | 'bid' | 'barter' | 'reverse_auction' | 'reverse_bid';
  title: string;
  subtitle: string;
  amount?: number;
  status: string;
  statusColor: string;
  date: string;
  image?: string;
  link: string;
  role?: string;
}

interface DashboardStats {
  items: number;
  sales: number;
  purchases: number;
  auctions: number;
  bids: number;
  barterOffers: number;
  reverseAuctions: number;
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-blue-100 text-blue-800',
  DELIVERED: 'bg-green-100 text-green-800',
  SHIPPED: 'bg-indigo-100 text-indigo-800',
  CANCELLED: 'bg-red-100 text-red-800',
  ENDED: 'bg-gray-100 text-gray-800',
  ACCEPTED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800',
  AWARDED: 'bg-purple-100 text-purple-800',
  WINNING: 'bg-green-100 text-green-800',
  OUTBID: 'bg-orange-100 text-orange-800',
  SOLD: 'bg-blue-100 text-blue-800',
  DRAFT: 'bg-gray-100 text-gray-800',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'نشط',
  PENDING: 'في الانتظار',
  COMPLETED: 'مكتمل',
  DELIVERED: 'تم التسليم',
  SHIPPED: 'تم الشحن',
  CANCELLED: 'ملغي',
  ENDED: 'منتهي',
  ACCEPTED: 'مقبول',
  REJECTED: 'مرفوض',
  AWARDED: 'تم الترسية',
  WINNING: 'أعلى مزايدة',
  OUTBID: 'تم تجاوزك',
  SOLD: 'تم البيع',
  DRAFT: 'مسودة',
};

export default function ActivityDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'all' | 'items' | 'transactions' | 'auctions' | 'barter' | 'reverse'>('all');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    items: 0,
    sales: 0,
    purchases: 0,
    auctions: 0,
    bids: 0,
    barterOffers: 0,
    reverseAuctions: 0,
  });

  // Data states
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [barterOffers, setBarterOffers] = useState<any[]>([]);
  const [reverseAuctions, setReverseAuctions] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadAllData();
    }
  }, [user]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadItems(),
        loadTransactions(),
        loadAuctions(),
        loadMyBids(),
        loadBarterOffers(),
        loadReverseAuctions(),
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadItems = async () => {
    try {
      // Use /items/my endpoint which returns authenticated user's items
      const response = await apiClient.get('/items/my?limit=50');
      const data = response.data.data?.items || response.data.data || [];
      setItems(data);
      setStats(s => ({ ...s, items: data.length }));
    } catch (err) {
      console.error('Error loading items:', err);
    }
  };

  const loadTransactions = async () => {
    try {
      const [salesRes, purchasesRes] = await Promise.all([
        apiClient.get('/transactions/my?role=seller'),
        apiClient.get('/transactions/my?role=buyer'),
      ]);
      const sales = salesRes.data.data?.transactions || [];
      const purchases = purchasesRes.data.data?.transactions || [];
      setTransactions([...sales, ...purchases]);
      setStats(s => ({ ...s, sales: sales.length, purchases: purchases.length }));
    } catch (err) {
      console.error('Error loading transactions:', err);
    }
  };

  const loadAuctions = async () => {
    try {
      const response = await apiClient.get('/auctions/my');
      const data = response.data.data || [];
      setAuctions(data);
      setStats(s => ({ ...s, auctions: data.length }));
    } catch (err) {
      console.error('Error loading auctions:', err);
    }
  };

  const loadMyBids = async () => {
    try {
      const response = await apiClient.get('/auctions/my-bids');
      const data = response.data.data || [];
      setMyBids(data);
      setStats(s => ({ ...s, bids: data.length }));
    } catch (err) {
      console.error('Error loading bids:', err);
    }
  };

  const loadBarterOffers = async () => {
    try {
      // Correct endpoint is /barter/offers/my
      const response = await apiClient.get('/barter/offers/my');
      const data = response.data.data?.offers || response.data.data || [];
      setBarterOffers(data);
      setStats(s => ({ ...s, barterOffers: data.length }));
    } catch (err) {
      console.error('Error loading barter offers:', err);
    }
  };

  const loadReverseAuctions = async () => {
    try {
      // Get all reverse auctions and filter by buyer
      const response = await apiClient.get('/reverse-auctions');
      const allAuctions = response.data.data?.auctions || response.data.data || [];
      const myAuctions = allAuctions.filter((a: any) => a.buyerId === user?.id);
      setReverseAuctions(myAuctions);
      setStats(s => ({ ...s, reverseAuctions: myAuctions.length }));
    } catch (err) {
      console.error('Error loading reverse auctions:', err);
    }
  };

  const getStatusColor = (status: string) => STATUS_COLORS[status] || 'bg-gray-100 text-gray-800';
  const getStatusLabel = (status: string) => STATUS_LABELS[status] || status;

  if (authLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">جاري التحميل...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-primary-600 to-teal-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">📊 نشاطي التجاري</h1>
              <p className="text-primary-100 mt-1">مرحباً {user.fullName}، هنا ملخص كل حركاتك التجارية</p>
            </div>
            <Link href="/dashboard" className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition">
              العودة للداشبورد
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-8">
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl mb-2">📦</div>
            <div className="text-2xl font-bold text-primary-600">{stats.items}</div>
            <div className="text-sm text-gray-600">منتجاتي</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl mb-2">💵</div>
            <div className="text-2xl font-bold text-green-600">{stats.sales}</div>
            <div className="text-sm text-gray-600">مبيعاتي</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl mb-2">🛒</div>
            <div className="text-2xl font-bold text-blue-600">{stats.purchases}</div>
            <div className="text-sm text-gray-600">مشترياتي</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl mb-2">🔨</div>
            <div className="text-2xl font-bold text-purple-600">{stats.auctions}</div>
            <div className="text-sm text-gray-600">مزاداتي</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-indigo-600">{stats.bids}</div>
            <div className="text-sm text-gray-600">مزايداتي</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl mb-2">🔄</div>
            <div className="text-2xl font-bold text-teal-600">{stats.barterOffers}</div>
            <div className="text-sm text-gray-600">المقايضات</div>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm text-center">
            <div className="text-3xl mb-2">📉</div>
            <div className="text-2xl font-bold text-orange-600">{stats.reverseAuctions}</div>
            <div className="text-sm text-gray-600">مناقصاتي</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 overflow-x-auto">
          <div className="flex gap-2 min-w-max">
            {[
              { key: 'all', label: 'الكل', icon: '📊' },
              { key: 'items', label: 'منتجاتي', icon: '📦' },
              { key: 'transactions', label: 'المعاملات', icon: '💰' },
              { key: 'auctions', label: 'المزادات', icon: '🔨' },
              { key: 'barter', label: 'المقايضات', icon: '🔄' },
              { key: 'reverse', label: 'المناقصات', icon: '📉' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            <p className="mt-4 text-gray-600">جاري تحميل البيانات...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Items Section */}
            {(activeTab === 'all' || activeTab === 'items') && items.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">📦 منتجاتي ({items.length})</h2>
                  <Link href="/items?user=me" className="text-primary-600 hover:underline text-sm">
                    عرض الكل ←
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {items.slice(0, activeTab === 'all' ? 3 : 9).map((item: any) => (
                    <Link
                      key={item.id}
                      href={`/items/${item.id}`}
                      className="flex gap-4 p-4 border rounded-lg hover:border-primary-300 transition"
                    >
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.images?.[0]?.url ? (
                          <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-2xl">📦</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium truncate">{item.title}</h3>
                        <p className="text-primary-600 font-bold">{item.estimatedValue?.toLocaleString()} ج.م</p>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusColor(item.status)}`}>
                          {getStatusLabel(item.status)}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions Section */}
            {(activeTab === 'all' || activeTab === 'transactions') && transactions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">💰 المعاملات ({transactions.length})</h2>
                  <Link href="/dashboard/transactions" className="text-primary-600 hover:underline text-sm">
                    عرض الكل ←
                  </Link>
                </div>
                <div className="space-y-3">
                  {transactions.slice(0, activeTab === 'all' ? 3 : 10).map((tx: any) => {
                    const isSeller = tx.sellerId === user?.id;
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:border-primary-300 transition"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            isSeller ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'
                          }`}>
                            {isSeller ? '💵' : '🛒'}
                          </div>
                          <div>
                            <p className="font-medium">{tx.listing?.item?.title || 'منتج'}</p>
                            <p className="text-sm text-gray-500">
                              {isSeller ? 'بيع إلى: ' : 'شراء من: '}
                              {isSeller ? tx.buyer?.fullName : tx.seller?.fullName}
                            </p>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className="font-bold text-primary-600">{tx.amount?.toLocaleString()} ج.م</p>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusColor(tx.deliveryStatus)}`}>
                            {getStatusLabel(tx.deliveryStatus)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Auctions Section */}
            {(activeTab === 'all' || activeTab === 'auctions') && (auctions.length > 0 || myBids.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4">🔨 المزادات</h2>

                {auctions.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3">مزاداتي ({auctions.length})</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {auctions.slice(0, activeTab === 'all' ? 2 : 6).map((auction: any) => (
                        <Link
                          key={auction.id}
                          href={`/auctions/${auction.id}`}
                          className="flex gap-4 p-4 border rounded-lg hover:border-purple-300 transition"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                            {auction.listing?.item?.images?.[0]?.url ? (
                              <img src={auction.listing.item.images[0].url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">🔨</div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{auction.listing?.item?.title || 'مزاد'}</h4>
                            <p className="text-purple-600 font-bold">{auction.currentPrice?.toLocaleString()} ج.م</p>
                            <div className="flex gap-2 mt-1">
                              <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(auction.status)}`}>
                                {getStatusLabel(auction.status)}
                              </span>
                              <span className="text-xs text-gray-500">{auction.totalBids || 0} مزايدة</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {myBids.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3">مزايداتي ({myBids.length})</h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {myBids.slice(0, activeTab === 'all' ? 2 : 6).map((bid: any) => (
                        <Link
                          key={bid.id}
                          href={`/auctions/${bid.auctionId}`}
                          className="flex gap-4 p-4 border rounded-lg hover:border-indigo-300 transition"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🎯</div>
                          <div className="flex-1">
                            <h4 className="font-medium">{bid.auction?.listing?.item?.title || 'مزاد'}</h4>
                            <p className="text-indigo-600 font-bold">مزايدتي: {bid.amount?.toLocaleString()} ج.م</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                              bid.isWinning ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {bid.isWinning ? 'أعلى مزايدة' : 'تم تجاوزك'}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Barter Section */}
            {(activeTab === 'all' || activeTab === 'barter') && barterOffers.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">🔄 عروض المقايضة ({barterOffers.length})</h2>
                  <Link href="/barter/my-offers" className="text-primary-600 hover:underline text-sm">
                    عرض الكل ←
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {barterOffers.slice(0, activeTab === 'all' ? 2 : 6).map((offer: any) => {
                    const isInitiator = offer.initiatorId === user?.id;
                    return (
                      <div
                        key={offer.id}
                        className="flex gap-4 p-4 border rounded-lg hover:border-teal-300 transition"
                      >
                        <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center text-xl">
                          {isInitiator ? '📤' : '📥'}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">
                            {isInitiator ? 'عرض مرسل' : 'عرض مستلم'}
                          </p>
                          <p className="text-sm text-gray-500">
                            {isInitiator ? `إلى: ${offer.recipient?.fullName}` : `من: ${offer.initiator?.fullName}`}
                          </p>
                          <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${getStatusColor(offer.status)}`}>
                            {getStatusLabel(offer.status)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Reverse Auctions Section */}
            {(activeTab === 'all' || activeTab === 'reverse') && reverseAuctions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">📉 مناقصاتي ({reverseAuctions.length})</h2>
                  <Link href="/reverse-auctions" className="text-primary-600 hover:underline text-sm">
                    عرض الكل ←
                  </Link>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  {reverseAuctions.slice(0, activeTab === 'all' ? 2 : 6).map((ra: any) => (
                    <Link
                      key={ra.id}
                      href={`/reverse-auctions/${ra.id}`}
                      className="flex gap-4 p-4 border rounded-lg hover:border-orange-300 transition"
                    >
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center text-xl">📉</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{ra.title}</h4>
                        <p className="text-orange-600 font-bold">الميزانية: {ra.maxBudget?.toLocaleString()} ج.م</p>
                        <div className="flex gap-2 mt-1">
                          <span className={`px-2 py-0.5 rounded text-xs ${getStatusColor(ra.status)}`}>
                            {getStatusLabel(ra.status)}
                          </span>
                          <span className="text-xs text-gray-500">{ra.totalBids || 0} عرض</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!loading &&
              items.length === 0 &&
              transactions.length === 0 &&
              auctions.length === 0 &&
              myBids.length === 0 &&
              barterOffers.length === 0 &&
              reverseAuctions.length === 0 && (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="text-6xl mb-4">📭</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">لا يوجد نشاط بعد</h2>
                <p className="text-gray-600 mb-6">ابدأ بإضافة منتجات أو التسوق لتظهر حركاتك هنا</p>
                <div className="flex justify-center gap-4">
                  <Link
                    href="/inventory/add"
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition"
                  >
                    ➕ أضف منتج
                  </Link>
                  <Link
                    href="/items"
                    className="px-6 py-3 border-2 border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition"
                  >
                    🛒 تصفح المنتجات
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
