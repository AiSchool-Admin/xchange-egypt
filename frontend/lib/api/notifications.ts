import apiClient from './client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  priority: string;
  entityType?: string;
  entityId?: string;
  actionUrl?: string;
  actionText?: string;
  metadata?: any;
  createdAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: {
    notifications: Notification[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface UnreadCountResponse {
  success: boolean;
  data: {
    count: number;
  };
}

// Get notifications
export const getNotifications = async (params?: {
  page?: number;
  limit?: number;
  isRead?: boolean;
  type?: string;
}): Promise<NotificationsResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.isRead !== undefined) queryParams.append('isRead', params.isRead.toString());
  if (params?.type) queryParams.append('type', params.type);

  const response = await apiClient.get(`/notifications?${queryParams.toString()}`);
  return response.data;
};

// Get unread count
export const getUnreadCount = async (): Promise<UnreadCountResponse> => {
  const response = await apiClient.get('/notifications/unread-count');
  return response.data;
};

// Mark notification as read
export const markAsRead = async (id: string): Promise<any> => {
  const response = await apiClient.patch(`/notifications/${id}/read`);
  return response.data;
};

// Mark all as read
export const markAllAsRead = async (): Promise<any> => {
  const response = await apiClient.post('/notifications/mark-all-read');
  return response.data;
};

// Delete notification
export const deleteNotification = async (id: string): Promise<any> => {
  const response = await apiClient.delete(`/notifications/${id}`);
  return response.data;
};
