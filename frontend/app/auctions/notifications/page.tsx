'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/lib/contexts/AuthContext';

interface Notification {
  id: string;
  type: 'OUTBID' | 'AUCTION_WON' | 'AUCTION_ENDING' | 'AUCTION_STARTED' | 'WATCHLIST' | 'DEPOSIT' | 'DISPUTE' | 'REVIEW' | 'SYSTEM';
  title: string;
  message: string;
  auctionId?: string;
  auctionTitle?: string;
  isRead: boolean;
  createdAt: string;
  data?: any;
}

const notificationIcons: Record<string, string> = {
  OUTBID: '⚠️',
  AUCTION_WON: '🎉',
  AUCTION_ENDING: '⏰',
  AUCTION_STARTED: '🔔',
  WATCHLIST: '👁️',
  DEPOSIT: '💰',
  DISPUTE: '⚖️',
  REVIEW: '⭐',
  SYSTEM: '📢',
};

const notificationColors: Record<string, string> = {
  OUTBID: 'border-orange-500 bg-orange-50',
  AUCTION_WON: 'border-green-500 bg-green-50',
  AUCTION_ENDING: 'border-red-500 bg-red-50',
  AUCTION_STARTED: 'border-blue-500 bg-blue-50',
  WATCHLIST: 'border-purple-500 bg-purple-50',
  DEPOSIT: 'border-yellow-500 bg-yellow-50',
  DISPUTE: 'border-gray-500 bg-gray-50',
  REVIEW: 'border-pink-500 bg-pink-50',
  SYSTEM: 'border-gray-500 bg-gray-50',
};

// بيانات تجريبية
const sampleNotifications: Notification[] = [
  {
    id: '1',
    type: 'OUTBID',
    title: 'تم تجاوز مزايدتك!',
    message: 'قام مستخدم آخر بتقديم عرض أعلى على iPhone 15 Pro Max. السعر الحالي: 45,000 جنيه',
    auctionId: 'auction-1',
    auctionTitle: 'iPhone 15 Pro Max 256GB',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    type: 'AUCTION_ENDING',
    title: 'المزاد على وشك الانتهاء!',
    message: 'مزاد MacBook Pro M3 سينتهي خلال ساعة واحدة',
    auctionId: 'auction-2',
    auctionTitle: 'MacBook Pro M3 14"',
    isRead: false,
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    type: 'AUCTION_WON',
    title: 'مبروك! لقد فزت بالمزاد 🎉',
    message: 'لقد فزت بمزاد PlayStation 5 بسعر 22,500 جنيه. يرجى إتمام عملية الدفع',
    auctionId: 'auction-3',
    auctionTitle: 'PlayStation 5 + 10 ألعاب',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    type: 'WATCHLIST',
    title: 'مزاد جديد في قائمة مراقبتك',
    message: 'تمت إضافة مزاد جديد قد يهمك: ساعة Rolex Submariner',
    auctionId: 'auction-4',
    auctionTitle: 'ساعة Rolex Submariner',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    type: 'DEPOSIT',
    title: 'تم استلام الإيداع',
    message: 'تم تأكيد إيداعك بقيمة 5,000 جنيه لمزاد Mercedes-Benz E200',
    auctionId: 'auction-5',
    auctionTitle: 'Mercedes-Benz E200 2022',
    isRead: true,
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '6',
    type: 'AUCTION_STARTED',
    title: 'بدأ المزاد!',
    message: 'مزاد طقم أنتيك فيكتوري بدأ الآن. كن أول المزايدين!',
    auctionId: 'auction-6',
    auctionTitle: 'طقم أنتيك فيكتوري',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '7',
    type: 'REVIEW',
    title: 'تقييم جديد',
    message: 'حصلت على تقييم 5 نجوم من المشتري على مزاد iPhone 14 Pro',
    isRead: true,
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

type FilterType = 'all' | 'unread' | 'bids' | 'auctions' | 'system';

export default function NotificationsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>(sampleNotifications);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<FilterType>('all');
  const [settings, setSettings] = useState({
    emailOutbid: true,
    emailWon: true,
    emailEnding: true,
    pushEnabled: true,
    pushOutbid: true,
    pushWon: true,
    pushEnding: true,
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/login?redirect=/auctions/notifications');
    }
  }, [isAuthenticated]);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    if (filter === 'bids') return ['OUTBID', 'AUCTION_WON'].includes(n.type);
    if (filter === 'auctions') return ['AUCTION_ENDING', 'AUCTION_STARTED', 'WATCHLIST'].includes(n.type);
    if (filter === 'system') return ['DEPOSIT', 'DISPUTE', 'REVIEW', 'SYSTEM'].includes(n.type);
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    if (confirm('هل أنت متأكد من حذف جميع الإشعارات؟')) {
      setNotifications([]);
    }
  };

  const formatTime = (date: string) => {
    const now = new Date();
    const notifDate = new Date(date);
    const diff = now.getTime() - notifDate.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'الآن';
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    if (hours < 24) return `منذ ${hours} ساعة`;
    if (days < 7) return `منذ ${days} يوم`;
    return notifDate.toLocaleDateString('ar-EG');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري التحقق...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8" dir="rtl">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">الإشعارات</h1>
            <p className="text-gray-500 text-sm">
              {unreadCount > 0 ? `لديك ${unreadCount} إشعار غير مقروء` : 'لا توجد إشعارات جديدة'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
            >
              ⚙️ الإعدادات
            </button>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200"
              >
                ✓ تحديد الكل كمقروء
              </button>
            )}
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-4">إعدادات الإشعارات</h3>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Email Notifications */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  📧 إشعارات البريد الإلكتروني
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailOutbid}
                      onChange={(e) => setSettings({ ...settings, emailOutbid: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-600">عند تجاوز مزايدتي</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailWon}
                      onChange={(e) => setSettings({ ...settings, emailWon: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-600">عند الفوز بمزاد</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailEnding}
                      onChange={(e) => setSettings({ ...settings, emailEnding: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-600">قبل انتهاء المزاد</span>
                  </label>
                </div>
              </div>

              {/* Push Notifications */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  🔔 إشعارات الموقع
                </h4>
                <div className="space-y-3">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushEnabled}
                      onChange={(e) => setSettings({ ...settings, pushEnabled: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                    />
                    <span className="text-sm text-gray-600">تفعيل الإشعارات</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushOutbid}
                      onChange={(e) => setSettings({ ...settings, pushOutbid: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                      disabled={!settings.pushEnabled}
                    />
                    <span className={`text-sm ${settings.pushEnabled ? 'text-gray-600' : 'text-gray-400'}`}>
                      عند تجاوز مزايدتي
                    </span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushWon}
                      onChange={(e) => setSettings({ ...settings, pushWon: e.target.checked })}
                      className="w-4 h-4 text-purple-600 rounded"
                      disabled={!settings.pushEnabled}
                    />
                    <span className={`text-sm ${settings.pushEnabled ? 'text-gray-600' : 'text-gray-400'}`}>
                      عند الفوز بمزاد
                    </span>
                  </label>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t flex justify-end">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                حفظ الإعدادات
              </button>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm mb-6">
          <div className="flex border-b overflow-x-auto">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'unread', label: 'غير مقروء', count: unreadCount },
              { key: 'bids', label: 'المزايدات' },
              { key: 'auctions', label: 'المزادات' },
              { key: 'system', label: 'النظام' },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key as FilterType)}
                className={`px-5 py-3 font-medium whitespace-nowrap transition-colors ${
                  filter === tab.key
                    ? 'text-purple-600 border-b-2 border-purple-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="mr-2 px-2 py-0.5 bg-red-500 text-white rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">لا توجد إشعارات</h3>
            <p className="text-gray-600">ستظهر هنا الإشعارات المتعلقة بمزاداتك ومزايداتك</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`bg-white rounded-xl shadow-sm overflow-hidden border-r-4 ${
                  notificationColors[notification.type]
                } ${!notification.isRead ? 'ring-2 ring-purple-200' : ''}`}
              >
                <div className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{notificationIcons[notification.type]}</div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className={`font-bold ${notification.isRead ? 'text-gray-700' : 'text-gray-900'}`}>
                            {notification.title}
                          </h3>
                          <p className="text-gray-600 text-sm mt-1">{notification.message}</p>
                          {notification.auctionTitle && (
                            <Link
                              href={`/auctions/${notification.auctionId}`}
                              className="text-purple-600 hover:text-purple-700 text-sm mt-2 inline-block"
                            >
                              عرض المزاد: {notification.auctionTitle} ←
                            </Link>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-400">{formatTime(notification.createdAt)}</span>
                          {!notification.isRead && (
                            <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-2 mt-3">
                        {!notification.isRead && (
                          <button
                            onClick={() => markAsRead(notification.id)}
                            className="text-xs text-purple-600 hover:text-purple-700"
                          >
                            تحديد كمقروء
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="text-xs text-red-600 hover:text-red-700"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Clear All Button */}
            {filteredNotifications.length > 0 && (
              <div className="text-center pt-4">
                <button
                  onClick={clearAll}
                  className="text-sm text-gray-500 hover:text-red-600"
                >
                  🗑️ حذف جميع الإشعارات
                </button>
              </div>
            )}
          </div>
        )}

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href="/auctions/watchlist"
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">👁️</div>
              <div>
                <h3 className="font-bold text-gray-900">قائمة المراقبة</h3>
                <p className="text-sm text-gray-500">إدارة المزادات المتابعة</p>
              </div>
            </div>
          </Link>

          <Link
            href="/auctions/my-auctions"
            className="bg-white rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-4">
              <div className="text-3xl">🔨</div>
              <div>
                <h3 className="font-bold text-gray-900">مزاداتي</h3>
                <p className="text-sm text-gray-500">إدارة المزادات الخاصة بك</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
