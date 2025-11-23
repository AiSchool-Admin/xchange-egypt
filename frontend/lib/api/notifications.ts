import apiClient from './client';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  isRead: boolean;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  actionText?: string;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    items: Notification[];
    pagination: {
      total: number;
      page: number;
      limit: number;
    };
  };
}

// Get user notifications
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}): Promise<NotificationsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.unreadOnly) queryParams.append('unreadOnly', 'true');

  const response = await apiClient.get(`/notifications?${queryParams.toString()}`);
  return response.data;
};

// Get unread notification count
export const getUnreadCount = async (): Promise<{ count: number }> => {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data.data;
};

// Mark notification as read
export const markAsRead = async (notificationId: string): Promise<void> => {
  await apiClient.patch(`/notifications/${notificationId}/read`);
};

// Mark all notifications as read
export const markAllAsRead = async (): Promise<void> => {
  await apiClient.patch('/notifications/read-all');
};
