'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { useSocket } from '@/lib/contexts/SocketContext';
import {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  Notification,
} from '@/lib/api/notifications';

export default function NotificationsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { onMatchFound, offMatchFound } = useSocket();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadNotifications();
  }, [user]);

  // Listen for real-time match notifications
  useEffect(() => {
    const handleMatchNotification = (notification: any) => {
      console.log('🔔 Received match notification:', notification);
      // Refresh notifications from database
      loadNotifications();
      // Optionally show a toast here
    };

    onMatchFound(handleMatchNotification);

    return () => {
      offMatchFound(handleMatchNotification);
    };
  }, [onMatchFound, offMatchFound]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications({ limit: 50 });
      setNotifications(response.data.notifications || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      console.error('Failed to mark as read:', err);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read first
    if (!notification.isRead) {
      await handleMarkAsRead(notification.id);
    }

    // Navigate based on notification type or action URL
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
      return;
    }

    // Handle different notification types
    switch (notification.type) {
      case 'ITEM_SOLD':
        // Seller notification - go to sales/incoming orders
        router.push('/dashboard/sales');
        break;
      case 'ORDER_SHIPPED':
      case 'ORDER_DELIVERED':
      case 'ORDER_CONFIRMED':
      case 'ORDER_COMPLETED':
      case 'TRANSACTION_SHIPPED':
      case 'TRANSACTION_DELIVERED':
      case 'TRANSACTION_UPDATE':
      case 'TRANSACTION_PAYMENT_RECEIVED':
        // Buyer notification - go to orders page
        router.push('/dashboard/orders');
        break;
      case 'BARTER_OFFER_RECEIVED':
      case 'BARTER_OFFER':
        router.push('/barter');
        break;
      case 'BARTER_ACCEPTED':
      case 'BARTER_REJECTED':
        if (notification.entityId) {
          router.push(`/barter/${notification.entityId}`);
        } else {
          router.push('/barter');
        }
        break;
      case 'MESSAGE':
        if (notification.entityId) {
          router.push(`/messages/${notification.entityId}`);
        } else {
          router.push('/messages');
        }
        break;
      case 'ORDER':
        router.push('/dashboard/orders');
        break;
      default:
        // For other types, just mark as read
        break;
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all as read:', err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'BARTER_OFFER':
        return '🔄';
      case 'BARTER_OFFER_RECEIVED':
        return '🎯';
      case 'BARTER_ACCEPTED':
        return '✅';
      case 'BARTER_REJECTED':
        return '❌';
      case 'MESSAGE':
        return '💬';
      case 'ORDER':
        return '📦';
      case 'PAYMENT':
        return '💳';
      default:
        return '🔔';
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center text-white/80 hover:text-white mb-4"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold">Notifications</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Actions */}
        {notifications.length > 0 && (
          <div className="flex justify-end mb-4">
            <button
              onClick={handleMarkAllAsRead}
              className="text-sm text-purple-600 hover:text-purple-700"
            >
              Mark all as read
            </button>
          </div>
        )}

        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <p className="text-4xl mb-4">🔔</p>
            <p className="text-gray-600">No notifications yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                onClick={() => handleNotificationClick(notification)}
                className={`bg-white rounded-lg shadow-sm p-4 border-l-4 cursor-pointer transition-all hover:shadow-md ${
                  notification.isRead
                    ? 'border-gray-200 hover:border-gray-300'
                    : 'border-purple-500 bg-purple-50 hover:bg-purple-100'
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">
                    {getNotificationIcon(notification.type)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">
                      {notification.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(notification.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    {!notification.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="text-xs text-purple-600 hover:text-purple-700 px-2 py-1 rounded hover:bg-purple-100"
                      >
                        Mark read
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="text-xs text-red-600 hover:text-red-700 px-2 py-1 rounded hover:bg-red-50"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {/* Show action hint */}
                {(notification.type === 'BARTER_OFFER_RECEIVED' || notification.type === 'BARTER_OFFER') && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <span className="text-xs text-purple-600 font-medium">
                      Click to view barter matches →
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
