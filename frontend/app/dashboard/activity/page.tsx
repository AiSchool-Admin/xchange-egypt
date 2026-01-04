'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import apiClient from '@/lib/api/client';
import { getPrimaryImageUrl } from '@/lib/api/items';

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
  wonAuctions: number;
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
    wonAuctions: 0,
    barterOffers: 0,
    reverseAuctions: 0,
  });

  // Data states
  const [items, setItems] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [wonAuctions, setWonAuctions] = useState<any[]>([]);
  const [barterOffers, setBarterOffers] = useState<any[]>([]);
  const [sentBarterOffers, setSentBarterOffers] = useState<any[]>([]);
  const [receivedBarterOffers, setReceivedBarterOffers] = useState<any[]>([]);
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

      // Separate won auctions from active bids
      const won = data.filter((item: any) =>
        item.latestBid?.status === 'WON' ||
        item.bids?.some((b: any) => b.status === 'WON')
      );
      const activeBids = data.filter((item: any) =>
        item.latestBid?.status !== 'WON' &&
        !item.bids?.some((b: any) => b.status === 'WON')
      );

      setWonAuctions(won);
      setMyBids(activeBids);
      setStats(s => ({ ...s, bids: data.length, wonAuctions: won.length }));
    } catch (err) {
      console.error('Error loading bids:', err);
    }
  };

  const loadBarterOffers = async () => {
    try {
      // Load sent and received offers separately
      const [sentRes, receivedRes] = await Promise.all([
        apiClient.get('/barter/offers/my?type=sent'),
        apiClient.get('/barter/offers/my?type=received'),
      ]);
      // Backend returns { items: [...], pagination: {...} }
      const sent = sentRes.data.data?.items || sentRes.data.data?.offers || [];
      const received = receivedRes.data.data?.items || receivedRes.data.data?.offers || [];
      setSentBarterOffers(Array.isArray(sent) ? sent : []);
      setReceivedBarterOffers(Array.isArray(received) ? received : []);
      const allOffers = [...(Array.isArray(sent) ? sent : []), ...(Array.isArray(received) ? received : [])];
      setBarterOffers(allOffers);
      setStats(s => ({ ...s, barterOffers: allOffers.length }));
    } catch (err) {
      console.error('Error loading barter offers:', err);
    }
  };

  const loadReverseAuctions = async () => {
    try {
      // Get user's reverse auctions directly using buyerId filter
      const response = await apiClient.get(`/reverse-auctions?buyerId=${user?.id}`);

      // Backend returns { data: { items: [...], pagination: {...} } }
      const myAuctions = response.data?.data?.items || response.data?.data?.auctions || [];
      setReverseAuctions(myAuctions);
      setStats(s => ({ ...s, reverseAuctions: myAuctions.length }));
    } catch (err: any) {
      console.error('Error loading reverse auctions:', err.response?.data || err.message || err);
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
            <div className="text-3xl mb-2">🏆</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.wonAuctions}</div>
            <div className="text-sm text-gray-600">فائز بمزاد</div>
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
                        {getPrimaryImageUrl(item.images) ? (
                          <img src={getPrimaryImageUrl(item.images)} alt={item.title} className="w-full h-full object-cover" />
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
                      <Link
                        key={tx.id}
                        href={`/dashboard/transactions?selected=${tx.id}`}
                        className="flex items-center justify-between p-4 border rounded-lg hover:border-primary-300 hover:bg-gray-50 transition cursor-pointer"
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
                      </Link>
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
                            {getPrimaryImageUrl(auction.listing?.item?.images) ? (
                              <img src={getPrimaryImageUrl(auction.listing?.item?.images)} alt="" className="w-full h-full object-cover" />
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

                {/* Won Auctions Section */}
                {wonAuctions.length > 0 && (
                  <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
                    <h3 className="font-semibold text-yellow-800 mb-3 flex items-center gap-2">
                      <span className="text-2xl">🏆</span>
                      مزادات فائز بها ({wonAuctions.length})
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {wonAuctions.slice(0, activeTab === 'all' ? 2 : 6).map((item: any) => (
                        <Link
                          key={item.auction?.id || item.latestBid?.auctionId}
                          href={`/auctions/${item.auction?.id || item.latestBid?.auctionId}`}
                          className="flex gap-4 p-4 bg-white border-2 border-yellow-300 rounded-lg hover:border-yellow-400 transition"
                        >
                          <div className="w-16 h-16 bg-yellow-100 rounded-lg flex items-center justify-center text-2xl">🏆</div>
                          <div className="flex-1">
                            <h4 className="font-medium">{item.auction?.listing?.item?.title || 'مزاد'}</h4>
                            <p className="text-yellow-700 font-bold">
                              فزت بـ: {item.latestBid?.bidAmount?.toLocaleString() || item.auction?.currentPrice?.toLocaleString()} ج.م
                            </p>
                            <span className="inline-block px-2 py-0.5 rounded text-xs bg-yellow-200 text-yellow-800">
                              فائز
                            </span>
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
                          key={bid.id || bid.latestBid?.id}
                          href={`/auctions/${bid.auction?.id || bid.latestBid?.auctionId}`}
                          className="flex gap-4 p-4 border rounded-lg hover:border-indigo-300 transition"
                        >
                          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🎯</div>
                          <div className="flex-1">
                            <h4 className="font-medium">{bid.auction?.listing?.item?.title || 'مزاد'}</h4>
                            <p className="text-indigo-600 font-bold">مزايدتي: {bid.latestBid?.bidAmount?.toLocaleString()} ج.م</p>
                            <span className={`inline-block px-2 py-0.5 rounded text-xs ${
                              bid.latestBid?.status === 'WINNING' ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                            }`}>
                              {bid.latestBid?.status === 'WINNING' ? 'أعلى مزايدة' : 'تم تجاوزك'}
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
            {(activeTab === 'all' || activeTab === 'barter') && (receivedBarterOffers.length > 0 || sentBarterOffers.length > 0) && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">🔄 عروض المقايضة ({barterOffers.length})</h2>
                  <Link href="/barter/my-offers" className="text-primary-600 hover:underline text-sm">
                    عرض الكل ←
                  </Link>
                </div>

                {/* Received Offers - Important! */}
                {receivedBarterOffers.length > 0 && (
                  <div className="mb-6">
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-sm">📥</span>
                      عروض واردة ({receivedBarterOffers.length})
                      {receivedBarterOffers.filter((o: any) => o.status === 'PENDING').length > 0 && (
                        <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                          {receivedBarterOffers.filter((o: any) => o.status === 'PENDING').length} جديد
                        </span>
                      )}
                    </h3>
                    <div className="grid gap-3">
                      {receivedBarterOffers.slice(0, activeTab === 'all' ? 2 : 6).map((offer: any) => {
                        const offeredItems = offer.preferenceSets?.[0]?.items || [];
                        const itemTitle = offeredItems[0]?.item?.title || 'منتج';
                        return (
                          <Link
                            key={offer.id}
                            href={`/barter/respond/${offer.id}`}
                            className="flex gap-4 p-4 border-2 border-orange-200 bg-orange-50 rounded-lg hover:border-orange-400 transition"
                          >
                            <div className="w-14 h-14 bg-white rounded-lg overflow-hidden flex-shrink-0 border">
                              {getPrimaryImageUrl(offeredItems[0]?.item?.images) ? (
                                <img src={getPrimaryImageUrl(offeredItems[0]?.item?.images)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">🔄</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-orange-800 truncate">{itemTitle}</p>
                              <p className="text-sm text-gray-600">
                                من: <span className="font-medium">{offer.initiator?.fullName}</span>
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`inline-block px-2 py-0.5 rounded text-xs ${getStatusColor(offer.status)}`}>
                                  {getStatusLabel(offer.status)}
                                </span>
                                {offer.status === 'PENDING' && (
                                  <span className="text-xs text-orange-600 font-medium">← اضغط للرد</span>
                                )}
                              </div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Sent Offers */}
                {sentBarterOffers.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                      <span className="w-6 h-6 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center text-sm">📤</span>
                      عروض صادرة ({sentBarterOffers.length})
                    </h3>
                    <div className="grid gap-3">
                      {sentBarterOffers.slice(0, activeTab === 'all' ? 2 : 6).map((offer: any) => {
                        const offeredItems = offer.preferenceSets?.[0]?.items || [];
                        const itemTitle = offeredItems[0]?.item?.title || 'منتج';
                        return (
                          <Link
                            key={offer.id}
                            href={`/barter/respond/${offer.id}`}
                            className="flex gap-4 p-4 border rounded-lg hover:border-teal-300 hover:bg-gray-50 transition"
                          >
                            <div className="w-14 h-14 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {getPrimaryImageUrl(offeredItems[0]?.item?.images) ? (
                                <img src={getPrimaryImageUrl(offeredItems[0]?.item?.images)} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-2xl">🔄</div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium truncate">{itemTitle}</p>
                              <p className="text-sm text-gray-600">
                                إلى: <span className="font-medium">{offer.recipient?.fullName}</span>
                              </p>
                              <span className={`inline-block px-2 py-0.5 rounded text-xs mt-1 ${getStatusColor(offer.status)}`}>
                                {getStatusLabel(offer.status)}
                              </span>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
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
                    href="/listing/new"
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
