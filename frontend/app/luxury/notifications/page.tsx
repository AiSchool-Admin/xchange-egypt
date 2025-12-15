"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Gavel,
  TrendingUp,
  Clock,
  Trophy,
  AlertCircle,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  ArrowRight,
  Package,
  Eye,
  MessageSquare
} from "lucide-react";
import { formatLuxuryPrice } from "@/lib/api/luxury-marketplace";

// Notification types
type NotificationType =
  | 'OUTBID'
  | 'AUCTION_ENDING'
  | 'AUCTION_WON'
  | 'AUCTION_LOST'
  | 'NEW_BID'
  | 'NEW_OFFER'
  | 'OFFER_ACCEPTED'
  | 'OFFER_REJECTED'
  | 'ITEM_VERIFIED'
  | 'ITEM_SOLD'
  | 'PRICE_DROP';

interface LuxuryNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  amount?: number;
  isRead: boolean;
  createdAt: Date;
  actionUrl?: string;
}

// Arabic labels for notification types
const NOTIFICATION_TYPE_AR: Record<NotificationType, string> = {
  'OUTBID': 'تم تجاوز مزايدتك',
  'AUCTION_ENDING': 'المزاد ينتهي قريباً',
  'AUCTION_WON': 'فزت بالمزاد',
  'AUCTION_LOST': 'انتهى المزاد',
  'NEW_BID': 'مزايدة جديدة',
  'NEW_OFFER': 'عرض جديد',
  'OFFER_ACCEPTED': 'تم قبول عرضك',
  'OFFER_REJECTED': 'تم رفض عرضك',
  'ITEM_VERIFIED': 'تم التحقق من المنتج',
  'ITEM_SOLD': 'تم بيع المنتج',
  'PRICE_DROP': 'انخفاض في السعر',
};

// Notification icon and color mapping
const getNotificationStyle = (type: NotificationType) => {
  switch (type) {
    case 'OUTBID':
      return { icon: TrendingUp, color: 'text-red-500', bg: 'bg-red-50' };
    case 'AUCTION_ENDING':
      return { icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50' };
    case 'AUCTION_WON':
      return { icon: Trophy, color: 'text-green-500', bg: 'bg-green-50' };
    case 'AUCTION_LOST':
      return { icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-50' };
    case 'NEW_BID':
      return { icon: Gavel, color: 'text-blue-500', bg: 'bg-blue-50' };
    case 'NEW_OFFER':
      return { icon: MessageSquare, color: 'text-purple-500', bg: 'bg-purple-50' };
    case 'OFFER_ACCEPTED':
      return { icon: Check, color: 'text-green-500', bg: 'bg-green-50' };
    case 'OFFER_REJECTED':
      return { icon: AlertCircle, color: 'text-red-500', bg: 'bg-red-50' };
    case 'ITEM_VERIFIED':
      return { icon: CheckCheck, color: 'text-emerald-500', bg: 'bg-emerald-50' };
    case 'ITEM_SOLD':
      return { icon: Package, color: 'text-green-500', bg: 'bg-green-50' };
    case 'PRICE_DROP':
      return { icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-50' };
    default:
      return { icon: Bell, color: 'text-gray-500', bg: 'bg-gray-50' };
  }
};

// Mock notifications data
const mockNotifications: LuxuryNotification[] = [
  {
    id: '1',
    type: 'OUTBID',
    title: 'تم تجاوز مزايدتك',
    message: 'قام مستخدم آخر بتقديم مزايدة أعلى على الساعة',
    itemId: 'watch-1',
    itemTitle: 'Rolex Submariner Date',
    itemImage: '/images/luxury/watch-1.jpg',
    amount: 485000,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
    actionUrl: '/luxury/item/watch-1',
  },
  {
    id: '2',
    type: 'AUCTION_ENDING',
    title: 'المزاد ينتهي قريباً',
    message: 'باقي ساعة واحدة على انتهاء المزاد',
    itemId: 'watch-2',
    itemTitle: 'Patek Philippe Nautilus',
    itemImage: '/images/luxury/watch-2.jpg',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    actionUrl: '/luxury/item/watch-2',
  },
  {
    id: '3',
    type: 'NEW_BID',
    title: 'مزايدة جديدة على منتجك',
    message: 'تلقيت مزايدة جديدة على ساعتك',
    itemId: 'watch-3',
    itemTitle: 'Audemars Piguet Royal Oak',
    itemImage: '/images/luxury/watch-3.jpg',
    amount: 720000,
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
    actionUrl: '/luxury/my-listings',
  },
  {
    id: '4',
    type: 'NEW_OFFER',
    title: 'عرض شراء جديد',
    message: 'تلقيت عرض شراء مباشر على منتجك',
    itemId: 'bag-1',
    itemTitle: 'Hermès Birkin 35',
    itemImage: '/images/luxury/bag-1.jpg',
    amount: 380000,
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3), // 3 hours ago
    actionUrl: '/luxury/my-listings',
  },
  {
    id: '5',
    type: 'AUCTION_WON',
    title: 'مبروك! فزت بالمزاد',
    message: 'لقد فزت بالمزاد وتم شراء الساعة بنجاح',
    itemId: 'watch-4',
    itemTitle: 'Omega Speedmaster Moonwatch',
    itemImage: '/images/luxury/watch-4.jpg',
    amount: 125000,
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    actionUrl: '/luxury/my-bids',
  },
  {
    id: '6',
    type: 'ITEM_VERIFIED',
    title: 'تم التحقق من منتجك',
    message: 'تم التحقق من أصالة منتجك بنجاح وهو الآن معروض للبيع',
    itemId: 'jewelry-1',
    itemTitle: 'خاتم ألماس بليانت 2 قيراط',
    itemImage: '/images/luxury/jewelry-1.jpg',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    actionUrl: '/luxury/my-listings',
  },
  {
    id: '7',
    type: 'OFFER_ACCEPTED',
    title: 'تم قبول عرضك',
    message: 'البائع وافق على عرضك للشراء',
    itemId: 'bag-2',
    itemTitle: 'Louis Vuitton Neverfull MM',
    itemImage: '/images/luxury/bag-2.jpg',
    amount: 45000,
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72), // 3 days ago
    actionUrl: '/luxury/my-bids',
  },
  {
    id: '8',
    type: 'PRICE_DROP',
    title: 'انخفاض في السعر',
    message: 'منتج في قائمة المفضلة انخفض سعره',
    itemId: 'watch-5',
    itemTitle: 'Tag Heuer Carrera',
    itemImage: '/images/luxury/watch-5.jpg',
    amount: 28000,
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96), // 4 days ago
    actionUrl: '/luxury/item/watch-5',
  },
];

// Time ago helper
function timeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'الآن';
  if (seconds < 3600) return `منذ ${Math.floor(seconds / 60)} دقيقة`;
  if (seconds < 86400) return `منذ ${Math.floor(seconds / 3600)} ساعة`;
  if (seconds < 604800) return `منذ ${Math.floor(seconds / 86400)} يوم`;
  return `منذ ${Math.floor(seconds / 604800)} أسبوع`;
}

type FilterType = 'all' | 'unread' | 'bids' | 'offers' | 'system';

export default function LuxuryNotificationsPage() {
  const [notifications, setNotifications] = useState<LuxuryNotification[]>(mockNotifications);
  const [filter, setFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'all') return true;
    if (filter === 'unread') return !n.isRead;
    if (filter === 'bids') return ['OUTBID', 'AUCTION_ENDING', 'AUCTION_WON', 'AUCTION_LOST', 'NEW_BID'].includes(n.type);
    if (filter === 'offers') return ['NEW_OFFER', 'OFFER_ACCEPTED', 'OFFER_REJECTED'].includes(n.type);
    if (filter === 'system') return ['ITEM_VERIFIED', 'ITEM_SOLD', 'PRICE_DROP'].includes(n.type);
    return true;
  });

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-white" dir="rtl">
      {/* Header */}
      <header className="bg-gradient-to-l from-amber-600 to-amber-700 text-white py-6 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/luxury" className="text-white/80 hover:text-white">
                <ArrowRight className="w-6 h-6" />
              </Link>
              <Bell className="w-8 h-8" />
              <div>
                <h1 className="text-2xl font-bold">الإشعارات</h1>
                <p className="text-amber-100 text-sm">
                  {unreadCount > 0
                    ? `لديك ${unreadCount} إشعار غير مقروء`
                    : 'لا توجد إشعارات جديدة'}
                </p>
              </div>
            </div>

            {notifications.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                  تعيين الكل كمقروء
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1 px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  مسح الكل
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'unread', label: 'غير مقروء' },
            { key: 'bids', label: 'المزايدات' },
            { key: 'offers', label: 'العروض' },
            { key: 'system', label: 'النظام' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as FilterType)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-amber-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-amber-50'
              }`}
            >
              {tab.label}
              {tab.key === 'unread' && unreadCount > 0 && (
                <span className="mr-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">
              لا توجد إشعارات
            </h3>
            <p className="text-gray-500">
              {filter === 'all'
                ? 'ستظهر إشعاراتك هنا عند وصولها'
                : 'لا توجد إشعارات في هذا التصنيف'}
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredNotifications.map(notification => {
              const style = getNotificationStyle(notification.type);
              const Icon = style.icon;

              return (
                <div
                  key={notification.id}
                  className={`bg-white rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md ${
                    !notification.isRead ? 'border-r-4 border-amber-500' : ''
                  }`}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className={`p-3 rounded-full ${style.bg}`}>
                        <Icon className={`w-6 h-6 ${style.color}`} />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className={`font-semibold ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                              {notification.title}
                            </h3>
                            <p className="text-gray-600 text-sm mt-0.5">
                              {notification.message}
                            </p>
                          </div>
                          <span className="text-xs text-gray-400 whitespace-nowrap">
                            {timeAgo(notification.createdAt)}
                          </span>
                        </div>

                        {/* Item Info */}
                        <div className="mt-3 flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Package className="w-6 h-6 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-800 truncate">
                              {notification.itemTitle}
                            </p>
                            {notification.amount && (
                              <p className="text-amber-600 text-sm font-semibold">
                                {formatLuxuryPrice(notification.amount)}
                              </p>
                            )}
                          </div>
                          {notification.actionUrl && (
                            <Link
                              href={notification.actionUrl}
                              className="px-3 py-1.5 bg-amber-100 text-amber-700 rounded-lg text-sm font-medium hover:bg-amber-200 transition-colors"
                            >
                              عرض
                            </Link>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="mt-3 flex items-center gap-2">
                          {!notification.isRead && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
                            >
                              <Check className="w-4 h-4" />
                              تعيين كمقروء
                            </button>
                          )}
                          <button
                            onClick={() => deleteNotification(notification.id)}
                            className="flex items-center gap-1 text-sm text-gray-500 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            حذف
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Notification Settings Link */}
        <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
          <h3 className="font-semibold text-gray-800 mb-3">إعدادات الإشعارات</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Gavel className="w-5 h-5 text-amber-600" />
                <span className="text-gray-700">إشعارات المزايدات</span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-600" />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-amber-600" />
                <span className="text-gray-700">تنبيهات انتهاء المزادات</span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-600" />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <MessageSquare className="w-5 h-5 text-amber-600" />
                <span className="text-gray-700">العروض والرسائل</span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-600" />
            </label>
            <label className="flex items-center justify-between p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-5 h-5 text-amber-600" />
                <span className="text-gray-700">تنبيهات انخفاض الأسعار</span>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-amber-600" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
