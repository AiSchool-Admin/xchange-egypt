'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useSocket } from '@/lib/contexts/SocketContext';
import { getNotifications, markAsRead, Notification as AppNotification } from '@/lib/api/notifications';
import { COLLECTION_STATUS_AR, CollectionRequestStatus } from '@/lib/api/scrap-marketplace';

interface ScrapNotificationsProps {
  onNotificationCount?: (count: number) => void;
}

// Scrap-specific notification types
const SCRAP_NOTIFICATION_TYPES = [
  'COLLECTION_ACCEPTED',
  'COLLECTION_SCHEDULED',
  'COLLECTION_IN_TRANSIT',
  'COLLECTION_ARRIVED',
  'COLLECTION_COMPLETED',
  'COLLECTION_CANCELLED',
  'PURCHASE_REQUEST_OFFER',
  'OFFER_ACCEPTED',
  'OFFER_REJECTED',
  'NEW_PURCHASE_REQUEST',
  'DEALER_VERIFIED',
  'PRICE_UPDATE',
];

const getNotificationIcon = (type: string): string => {
  switch (type) {
    case 'COLLECTION_ACCEPTED':
      return '✅';
    case 'COLLECTION_SCHEDULED':
      return '📅';
    case 'COLLECTION_IN_TRANSIT':
      return '🚛';
    case 'COLLECTION_ARRIVED':
      return '📍';
    case 'COLLECTION_COMPLETED':
      return '💰';
    case 'COLLECTION_CANCELLED':
      return '❌';
    case 'PURCHASE_REQUEST_OFFER':
      return '📦';
    case 'OFFER_ACCEPTED':
      return '🎉';
    case 'OFFER_REJECTED':
      return '😔';
    case 'NEW_PURCHASE_REQUEST':
      return '🏭';
    case 'DEALER_VERIFIED':
      return '✓';
    case 'PRICE_UPDATE':
      return '📈';
    default:
      return '🔔';
  }
};

const getNotificationColor = (type: string): string => {
  switch (type) {
    case 'COLLECTION_ACCEPTED':
    case 'OFFER_ACCEPTED':
    case 'COLLECTION_COMPLETED':
    case 'DEALER_VERIFIED':
      return 'border-green-500 bg-green-50';
    case 'COLLECTION_CANCELLED':
    case 'OFFER_REJECTED':
      return 'border-red-500 bg-red-50';
    case 'COLLECTION_IN_TRANSIT':
    case 'COLLECTION_ARRIVED':
      return 'border-blue-500 bg-blue-50';
    case 'PURCHASE_REQUEST_OFFER':
    case 'NEW_PURCHASE_REQUEST':
      return 'border-indigo-500 bg-indigo-50';
    default:
      return 'border-orange-500 bg-orange-50';
  }
};

export function ScrapNotifications({ onNotificationCount }: ScrapNotificationsProps) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const { socket, connected } = useSocket();

  const loadNotifications = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getNotifications({ limit: 50 });
      // Filter scrap-related notifications
      const scrapNotifications = response.data.notifications.filter((n) =>
        SCRAP_NOTIFICATION_TYPES.includes(n.type) ||
        n.type.startsWith('COLLECTION_') ||
        n.type.startsWith('SCRAP_')
      );
      setNotifications(scrapNotifications);

      const unreadCount = scrapNotifications.filter((n) => !n.isRead).length;
      onNotificationCount?.(unreadCount);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  }, [onNotificationCount]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // Listen for real-time notifications
  useEffect(() => {
    if (!socket || !connected) return;

    const handleNewNotification = (notification: any) => {
      if (
        SCRAP_NOTIFICATION_TYPES.includes(notification.type) ||
        notification.type.startsWith('COLLECTION_') ||
        notification.type.startsWith('SCRAP_')
      ) {
        setNotifications((prev) => [notification, ...prev]);
        onNotificationCount?.(notifications.filter((n) => !n.isRead).length + 1);

        // Show browser notification if permitted
        if (Notification.permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/favicon.ico',
          });
        }
      }
    };

    socket.on('notification', handleNewNotification);
    socket.on('collection_update', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
      socket.off('collection_update', handleNewNotification);
    };
  }, [socket, connected, notifications, onNotificationCount]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      const unreadCount = notifications.filter((n) => !n.isRead && n.id !== id).length;
      onNotificationCount?.(unreadCount);
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const getActionUrl = (notification: AppNotification): string => {
    if (notification.actionUrl) return notification.actionUrl;

    switch (notification.type) {
      case 'COLLECTION_ACCEPTED':
      case 'COLLECTION_SCHEDULED':
      case 'COLLECTION_IN_TRANSIT':
      case 'COLLECTION_ARRIVED':
      case 'COLLECTION_COMPLETED':
      case 'COLLECTION_CANCELLED':
        return '/scrap/collection';
      case 'PURCHASE_REQUEST_OFFER':
      case 'OFFER_ACCEPTED':
      case 'OFFER_REJECTED':
        return notification.entityId
          ? `/scrap/purchase-requests/${notification.entityId}`
          : '/scrap/purchase-requests';
      case 'NEW_PURCHASE_REQUEST':
        return '/scrap/purchase-requests';
      case 'DEALER_VERIFIED':
        return '/scrap/dealers';
      case 'PRICE_UPDATE':
        return '/scrap/prices';
      default:
        return '/scrap';
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'الآن';
    if (diffMins < 60) return `منذ ${diffMins} دقيقة`;
    if (diffHours < 24) return `منذ ${diffHours} ساعة`;
    if (diffDays < 7) return `منذ ${diffDays} يوم`;
    return date.toLocaleDateString('ar-EG');
  };

  const displayedNotifications = showAll ? notifications : notifications.slice(0, 5);
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔔</span>
          <h3 className="font-bold">إشعارات الخردة</h3>
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {connected && (
          <span className="flex items-center gap-1 text-green-600 text-sm">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
            مباشر
          </span>
        )}
      </div>

      {/* Notifications List */}
      <div className="divide-y max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-4xl mb-2 block">📭</span>
            لا توجد إشعارات
          </div>
        ) : (
          displayedNotifications.map((notification) => (
            <Link
              key={notification.id}
              href={getActionUrl(notification)}
              onClick={() => !notification.isRead && handleMarkAsRead(notification.id)}
              className={`block p-4 hover:bg-gray-50 transition border-r-4 ${
                notification.isRead
                  ? 'border-transparent'
                  : getNotificationColor(notification.type)
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                <div className="flex-1 min-w-0">
                  <p className={`font-medium ${notification.isRead ? 'text-gray-600' : 'text-gray-900'}`}>
                    {notification.title}
                  </p>
                  <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatTime(notification.createdAt)}
                  </p>
                </div>
                {!notification.isRead && (
                  <span className="w-2 h-2 bg-orange-500 rounded-full flex-shrink-0 mt-2"></span>
                )}
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Footer */}
      {notifications.length > 5 && (
        <div className="p-3 border-t text-center">
          <button
            onClick={() => setShowAll(!showAll)}
            className="text-orange-600 hover:text-orange-700 text-sm font-medium"
          >
            {showAll ? 'عرض أقل' : `عرض الكل (${notifications.length})`}
          </button>
        </div>
      )}
    </div>
  );
}

// Toast notification component for real-time updates
export function ScrapNotificationToast({
  notification,
  onClose,
}: {
  notification: AppNotification;
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-4 left-4 max-w-sm bg-white rounded-xl shadow-2xl border-r-4 p-4 animate-slide-up z-50 ${getNotificationColor(
        notification.type
      )}`}
      dir="rtl"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
        <div className="flex-1">
          <p className="font-bold text-gray-900">{notification.title}</p>
          <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
        </div>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Hook for requesting notification permission
export function useNotificationPermission() {
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if ('Notification' in window) {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result;
    }
    return 'denied';
  };

  return { permission, requestPermission };
}
