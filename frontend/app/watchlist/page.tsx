'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

// Types
interface WatchlistItem {
  id: string;
  itemId: string;
  item: {
    id: string;
    title: string;
    price: number;
    originalPrice?: number;
    images: { url: string }[];
    condition: string;
    location: string;
    status: string;
    listingType: 'DIRECT_SALE' | 'AUCTION' | 'BARTER';
    auctionEndTime?: string;
    currentBid?: number;
    bidCount?: number;
    seller: {
      id: string;
      fullName: string;
      rating: number;
    };
  };
  priceAlerts: {
    enabled: boolean;
    targetPrice?: number;
  };
  auctionAlerts: {
    enabled: boolean;
    minutesBefore: number;
  };
  similarItemsAlert: boolean;
  addedAt: string;
  lastPriceChange?: {
    oldPrice: number;
    newPrice: number;
    changedAt: string;
  };
}

interface Notification {
  id: string;
  type: 'PRICE_DROP' | 'AUCTION_ENDING' | 'SIMILAR_ITEM' | 'BACK_IN_STOCK';
  title: string;
  message: string;
  itemId: string;
  read: boolean;
  createdAt: string;
}

// Mock data
const mockWatchlist: WatchlistItem[] = [
  {
    id: '1',
    itemId: 'item1',
    item: {
      id: 'item1',
      title: 'iPhone 15 Pro Max 256GB - أزرق تيتانيوم',
      price: 62000,
      originalPrice: 65000,
      images: [{ url: '' }],
      condition: 'NEW',
      location: 'القاهرة',
      status: 'ACTIVE',
      listingType: 'DIRECT_SALE',
      seller: { id: '1', fullName: 'متجر التقنية', rating: 4.8 },
    },
    priceAlerts: { enabled: true, targetPrice: 60000 },
    auctionAlerts: { enabled: false, minutesBefore: 30 },
    similarItemsAlert: true,
    addedAt: '2024-01-10',
    lastPriceChange: { oldPrice: 65000, newPrice: 62000, changedAt: '2024-01-12' },
  },
  {
    id: '2',
    itemId: 'item2',
    item: {
      id: 'item2',
      title: 'سيارة تويوتا كورولا 2022 - حالة ممتازة',
      price: 850000,
      images: [{ url: '' }],
      condition: 'LIKE_NEW',
      location: 'الجيزة',
      status: 'ACTIVE',
      listingType: 'AUCTION',
      auctionEndTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
      currentBid: 850000,
      bidCount: 15,
      seller: { id: '2', fullName: 'أحمد محمود', rating: 4.5 },
    },
    priceAlerts: { enabled: false },
    auctionAlerts: { enabled: true, minutesBefore: 30 },
    similarItemsAlert: false,
    addedAt: '2024-01-08',
  },
  {
    id: '3',
    itemId: 'item3',
    item: {
      id: 'item3',
      title: 'شقة 150 متر - مدينة نصر - تشطيب سوبر لوكس',
      price: 2500000,
      images: [{ url: '' }],
      condition: 'NEW',
      location: 'القاهرة',
      status: 'ACTIVE',
      listingType: 'DIRECT_SALE',
      seller: { id: '3', fullName: 'عقارات النيل', rating: 4.9 },
    },
    priceAlerts: { enabled: true, targetPrice: 2300000 },
    auctionAlerts: { enabled: false, minutesBefore: 30 },
    similarItemsAlert: true,
    addedAt: '2024-01-05',
  },
  {
    id: '4',
    itemId: 'item4',
    item: {
      id: 'item4',
      title: 'MacBook Pro M3 Max - 36GB RAM',
      price: 125000,
      images: [{ url: '' }],
      condition: 'NEW',
      location: 'الإسكندرية',
      status: 'SOLD',
      listingType: 'DIRECT_SALE',
      seller: { id: '4', fullName: 'تك ستور', rating: 4.7 },
    },
    priceAlerts: { enabled: false },
    auctionAlerts: { enabled: false, minutesBefore: 30 },
    similarItemsAlert: true,
    addedAt: '2024-01-01',
  },
];

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'PRICE_DROP',
    title: '📉 انخفاض السعر!',
    message: 'انخفض سعر iPhone 15 Pro Max من 65,000 إلى 62,000 ج.م',
    itemId: 'item1',
    read: false,
    createdAt: '2024-01-12T10:30:00',
  },
  {
    id: '2',
    type: 'AUCTION_ENDING',
    title: '⏰ المزاد ينتهي قريباً!',
    message: 'مزاد تويوتا كورولا ينتهي خلال ساعتين',
    itemId: 'item2',
    read: false,
    createdAt: '2024-01-12T09:00:00',
  },
  {
    id: '3',
    type: 'SIMILAR_ITEM',
    title: '🔍 منتج مشابه جديد',
    message: 'تم إضافة شقة مشابهة في مدينة نصر بسعر 2,400,000 ج.م',
    itemId: 'item3',
    read: true,
    createdAt: '2024-01-11T15:00:00',
  },
];

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('ar-EG').format(price);
};

const formatTimeRemaining = (endTime: string) => {
  const diff = new Date(endTime).getTime() - Date.now();
  if (diff <= 0) return 'انتهى';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 24) {
    const days = Math.floor(hours / 24);
    return `${days} يوم`;
  }
  return `${hours}س ${minutes}د`;
};

export default function WatchlistPage() {
  const { user, isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'auctions' | 'price_alerts' | 'sold'>('all');
  const [showNotifications, setShowNotifications] = useState(false);
  const [editingAlerts, setEditingAlerts] = useState<string | null>(null);
  const [alertSettings, setAlertSettings] = useState<{
    priceAlert: boolean;
    targetPrice: string;
    auctionAlert: boolean;
    minutesBefore: number;
    similarAlert: boolean;
  }>({
    priceAlert: false,
    targetPrice: '',
    auctionAlert: false,
    minutesBefore: 30,
    similarAlert: false,
  });

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setWatchlist(mockWatchlist);
      setNotifications(mockNotifications);
      setLoading(false);
    }, 500);
  }, []);

  const removeFromWatchlist = (id: string) => {
    setWatchlist(prev => prev.filter(item => item.id !== id));
  };

  const openAlertSettings = (item: WatchlistItem) => {
    setEditingAlerts(item.id);
    setAlertSettings({
      priceAlert: item.priceAlerts.enabled,
      targetPrice: item.priceAlerts.targetPrice?.toString() || '',
      auctionAlert: item.auctionAlerts.enabled,
      minutesBefore: item.auctionAlerts.minutesBefore,
      similarAlert: item.similarItemsAlert,
    });
  };

  const saveAlertSettings = () => {
    if (editingAlerts) {
      setWatchlist(prev => prev.map(item => {
        if (item.id === editingAlerts) {
          return {
            ...item,
            priceAlerts: {
              enabled: alertSettings.priceAlert,
              targetPrice: alertSettings.targetPrice ? parseInt(alertSettings.targetPrice) : undefined,
            },
            auctionAlerts: {
              enabled: alertSettings.auctionAlert,
              minutesBefore: alertSettings.minutesBefore,
            },
            similarItemsAlert: alertSettings.similarAlert,
          };
        }
        return item;
      }));
      setEditingAlerts(null);
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredWatchlist = watchlist.filter(item => {
    switch (activeTab) {
      case 'auctions':
        return item.item.listingType === 'AUCTION' && item.item.status === 'ACTIVE';
      case 'price_alerts':
        return item.priceAlerts.enabled;
      case 'sold':
        return item.item.status === 'SOLD';
      default:
        return item.item.status === 'ACTIVE';
    }
  });

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4" dir="rtl">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">قائمة المتابعة</h1>
          <p className="text-gray-600 mb-6">سجل دخولك لحفظ المنتجات المفضلة وتلقي إشعارات عن تغيرات الأسعار</p>
          <Link
            href="/login?redirect=/watchlist"
            className="block w-full py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" dir="rtl">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل قائمة المتابعة...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">❤️ قائمة المتابعة</h1>
            <p className="text-gray-600">تابع منتجاتك المفضلة واحصل على إشعارات فورية</p>
          </div>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-3 bg-white rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <span className="text-2xl">🔔</span>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {showNotifications && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-bold text-gray-900">الإشعارات</span>
                  <button className="text-sm text-primary-600 hover:underline">
                    تحديد الكل كمقروء
                  </button>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      لا توجد إشعارات
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <Link
                        key={notif.id}
                        href={`/items/${notif.itemId}`}
                        className={`block p-4 border-b border-gray-50 hover:bg-gray-50 transition-colors ${
                          !notif.read ? 'bg-primary-50' : ''
                        }`}
                      >
                        <div className="font-medium text-gray-900">{notif.title}</div>
                        <div className="text-sm text-gray-600 mt-1">{notif.message}</div>
                        <div className="text-xs text-gray-400 mt-2">
                          {new Date(notif.createdAt).toLocaleDateString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-sm p-2 mb-6 flex gap-2 overflow-x-auto">
          {[
            { id: 'all', label: 'الكل', count: watchlist.filter(i => i.item.status === 'ACTIVE').length },
            { id: 'auctions', label: '🔨 مزادات', count: watchlist.filter(i => i.item.listingType === 'AUCTION' && i.item.status === 'ACTIVE').length },
            { id: 'price_alerts', label: '📉 تنبيهات الأسعار', count: watchlist.filter(i => i.priceAlerts.enabled).length },
            { id: 'sold', label: '✓ تم البيع', count: watchlist.filter(i => i.item.status === 'SOLD').length },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-shrink-0 py-2 px-4 rounded-lg font-medium transition-all flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-primary-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {tab.label}
              <span className={`px-2 py-0.5 rounded-full text-xs ${
                activeTab === tab.id ? 'bg-white/20' : 'bg-gray-100'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Watchlist Items */}
        {filteredWatchlist.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">القائمة فارغة</h2>
            <p className="text-gray-600 mb-6">
              {activeTab === 'all'
                ? 'ابدأ بإضافة منتجات إلى قائمة المتابعة'
                : 'لا توجد منتجات في هذا التصنيف'}
            </p>
            <Link
              href="/items"
              className="inline-block px-6 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
            >
              تصفح المنتجات
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWatchlist.map((watchItem) => (
              <div
                key={watchItem.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden ${
                  watchItem.item.status === 'SOLD' ? 'opacity-60' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row">
                  {/* Item Image */}
                  <div className="md:w-48 h-48 md:h-auto relative flex-shrink-0">
                    {watchItem.item.images[0]?.url ? (
                      <img
                        src={watchItem.item.images[0].url}
                        alt={watchItem.item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}

                    {/* Status Badge */}
                    {watchItem.item.status === 'SOLD' && (
                      <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                        <span className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold">
                          تم البيع
                        </span>
                      </div>
                    )}

                    {/* Auction Badge */}
                    {watchItem.item.listingType === 'AUCTION' && watchItem.item.status === 'ACTIVE' && (
                      <div className="absolute top-2 right-2 bg-amber-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                        🔨 مزاد
                      </div>
                    )}

                    {/* Price Drop Badge */}
                    {watchItem.lastPriceChange && watchItem.lastPriceChange.newPrice < watchItem.lastPriceChange.oldPrice && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white px-3 py-1 rounded-lg text-sm font-bold">
                        📉 انخفض السعر!
                      </div>
                    )}
                  </div>

                  {/* Item Details */}
                  <div className="flex-1 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <Link
                          href={`/items/${watchItem.item.id}`}
                          className="text-lg font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                        >
                          {watchItem.item.title}
                        </Link>

                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                          <span>📍 {watchItem.item.location}</span>
                          <span>•</span>
                          <span>⭐ {watchItem.item.seller.rating}</span>
                          <span>•</span>
                          <Link href={`/store/${watchItem.item.seller.id}`} className="text-primary-600 hover:underline">
                            {watchItem.item.seller.fullName}
                          </Link>
                        </div>

                        {/* Price */}
                        <div className="mt-3">
                          {watchItem.item.listingType === 'AUCTION' ? (
                            <div className="flex items-center gap-4">
                              <div>
                                <span className="text-sm text-gray-500">المزايدة الحالية</span>
                                <div className="text-2xl font-bold text-primary-600">
                                  {formatPrice(watchItem.item.currentBid || 0)} ج.م
                                </div>
                              </div>
                              <div>
                                <span className="text-sm text-gray-500">عدد المزايدات</span>
                                <div className="text-lg font-bold text-gray-900">
                                  {watchItem.item.bidCount}
                                </div>
                              </div>
                              <div className="bg-red-100 text-red-700 px-4 py-2 rounded-xl">
                                <span className="text-sm">ينتهي خلال</span>
                                <div className="text-lg font-bold">
                                  {formatTimeRemaining(watchItem.item.auctionEndTime!)}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center gap-3">
                              <span className="text-2xl font-bold text-primary-600">
                                {formatPrice(watchItem.item.price)} ج.م
                              </span>
                              {watchItem.item.originalPrice && watchItem.item.originalPrice > watchItem.item.price && (
                                <span className="text-lg text-gray-400 line-through">
                                  {formatPrice(watchItem.item.originalPrice)} ج.م
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Active Alerts */}
                        <div className="flex flex-wrap gap-2 mt-3">
                          {watchItem.priceAlerts.enabled && (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                              📉 تنبيه السعر: {formatPrice(watchItem.priceAlerts.targetPrice || 0)} ج.م
                            </span>
                          )}
                          {watchItem.auctionAlerts.enabled && (
                            <span className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm">
                              ⏰ تنبيه قبل {watchItem.auctionAlerts.minutesBefore} دقيقة
                            </span>
                          )}
                          {watchItem.similarItemsAlert && (
                            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                              🔍 منتجات مشابهة
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => openAlertSettings(watchItem)}
                          className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                          title="إعدادات التنبيهات"
                        >
                          🔔
                        </button>
                        <button
                          onClick={() => removeFromWatchlist(watchItem.id)}
                          className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                          title="إزالة من القائمة"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Alert Settings Modal */}
        {editingAlerts && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-6">🔔 إعدادات التنبيهات</h3>

              <div className="space-y-6">
                {/* Price Alert */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-medium text-gray-900">📉 تنبيه تغير السعر</span>
                      <p className="text-sm text-gray-500 mt-1">احصل على إشعار عند انخفاض السعر</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={alertSettings.priceAlert}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, priceAlert: e.target.checked }))}
                      className="w-5 h-5 accent-primary-500"
                    />
                  </label>
                  {alertSettings.priceAlert && (
                    <div className="mt-4">
                      <label className="text-sm text-gray-600">السعر المستهدف (ج.م)</label>
                      <input
                        type="number"
                        value={alertSettings.targetPrice}
                        onChange={(e) => setAlertSettings(prev => ({ ...prev, targetPrice: e.target.value }))}
                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary-500"
                        placeholder="أدخل السعر المستهدف"
                      />
                    </div>
                  )}
                </div>

                {/* Auction Alert */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-medium text-gray-900">⏰ تنبيه انتهاء المزاد</span>
                      <p className="text-sm text-gray-500 mt-1">احصل على إشعار قبل انتهاء المزاد</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={alertSettings.auctionAlert}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, auctionAlert: e.target.checked }))}
                      className="w-5 h-5 accent-primary-500"
                    />
                  </label>
                  {alertSettings.auctionAlert && (
                    <div className="mt-4">
                      <label className="text-sm text-gray-600">التنبيه قبل</label>
                      <select
                        value={alertSettings.minutesBefore}
                        onChange={(e) => setAlertSettings(prev => ({ ...prev, minutesBefore: parseInt(e.target.value) }))}
                        className="w-full mt-1 px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary-500"
                      >
                        <option value={15}>15 دقيقة</option>
                        <option value={30}>30 دقيقة</option>
                        <option value={60}>ساعة</option>
                        <option value={120}>ساعتين</option>
                        <option value={1440}>يوم كامل</option>
                      </select>
                    </div>
                  )}
                </div>

                {/* Similar Items Alert */}
                <div className="p-4 bg-gray-50 rounded-xl">
                  <label className="flex items-center justify-between cursor-pointer">
                    <div>
                      <span className="font-medium text-gray-900">🔍 منتجات مشابهة</span>
                      <p className="text-sm text-gray-500 mt-1">احصل على إشعار عند إضافة منتج مشابه</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={alertSettings.similarAlert}
                      onChange={(e) => setAlertSettings(prev => ({ ...prev, similarAlert: e.target.checked }))}
                      className="w-5 h-5 accent-primary-500"
                    />
                  </label>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setEditingAlerts(null)}
                  className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  إلغاء
                </button>
                <button
                  onClick={saveAlertSettings}
                  className="flex-1 py-3 bg-primary-500 text-white rounded-xl font-medium hover:bg-primary-600 transition-colors"
                >
                  حفظ التنبيهات
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
