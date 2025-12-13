import apiClient from './client';

// ============================================
// Delivery API Client
// عميل API التوصيل
// ============================================

export interface DeliveryOption {
  provider: string;
  providerNameAr: string;
  speed: string;
  speedNameAr: string;
  estimatedDays: number;
  cost: number;
  insuranceCost?: number;
  features: string[];
}

export interface DeliveryOptionsRequest {
  pickupGovernorate: string;
  pickupCity?: string;
  deliveryGovernorate: string;
  deliveryCity?: string;
  packageWeight?: number;
  isCOD?: boolean;
}

export interface DeliveryBooking {
  id: string;
  orderId?: string;
  transactionId?: string;
  senderId: string;
  receiverId: string;
  provider: string;
  pickupAddress: string;
  pickupCity: string;
  pickupGovernorate: string;
  pickupPhone: string;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryGovernorate: string;
  deliveryPhone: string;
  packageWeight?: number;
  packageDescription?: string;
  isFragile: boolean;
  deliveryCost: number;
  insuranceCost: number;
  totalCost: number;
  codAmount?: number;
  deliverySpeed?: string;
  hasInsurance: boolean;
  isCOD: boolean;
  status: string;
  estimatedDelivery?: string;
  pickedUpAt?: string;
  deliveredAt?: string;
  createdAt: string;
  trackingHistory?: DeliveryTracking[];
}

export interface DeliveryTracking {
  id: string;
  status: string;
  location?: string;
  description?: string;
  timestamp: string;
}

export interface CreateBookingData {
  orderId?: string;
  transactionId?: string;
  receiverId: string;
  provider: string;
  pickupAddress: string;
  pickupCity: string;
  pickupGovernorate: string;
  pickupPhone: string;
  pickupLat?: number;
  pickupLng?: number;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryGovernorate: string;
  deliveryPhone: string;
  deliveryLat?: number;
  deliveryLng?: number;
  packageWeight?: number;
  packageDimensions?: { length: number; width: number; height: number };
  packageDescription?: string;
  isFragile?: boolean;
  deliverySpeed?: string;
  hasInsurance?: boolean;
  isCOD?: boolean;
  codAmount?: number;
  senderNotes?: string;
}

// Get delivery options for a route
export const getDeliveryOptions = async (data: DeliveryOptionsRequest): Promise<{
  success: boolean;
  data: { options: DeliveryOption[] };
}> => {
  const response = await apiClient.post('/delivery/options', data);
  return response.data;
};

// Create a delivery booking
export const createDeliveryBooking = async (data: CreateBookingData): Promise<{
  success: boolean;
  data: DeliveryBooking;
}> => {
  const response = await apiClient.post('/delivery/bookings', data);
  return response.data;
};

// Get booking by ID
export const getDeliveryBooking = async (id: string): Promise<{
  success: boolean;
  data: DeliveryBooking;
}> => {
  const response = await apiClient.get(`/delivery/bookings/${id}`);
  return response.data;
};

// Get user's delivery bookings
export const getMyDeliveryBookings = async (params?: {
  type?: 'sent' | 'received';
  page?: number;
  limit?: number;
}): Promise<{
  success: boolean;
  data: {
    bookings: DeliveryBooking[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}> => {
  const queryParams = new URLSearchParams();
  if (params?.type) queryParams.append('type', params.type);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`/delivery/bookings/my?${queryParams.toString()}`);
  return response.data;
};

// Cancel booking
export const cancelDeliveryBooking = async (id: string): Promise<{
  success: boolean;
  data: DeliveryBooking;
}> => {
  const response = await apiClient.post(`/delivery/bookings/${id}/cancel`);
  return response.data;
};

// Provider display helpers
export const DELIVERY_PROVIDERS = {
  OPEX: { nameAr: 'OPEX', icon: '📦', color: 'blue' },
  BOSTA: { nameAr: 'بوسطة', icon: '🚚', color: 'green' },
  ARAMEX: { nameAr: 'أرامكس', icon: '✈️', color: 'orange' },
  SELF_DELIVERY: { nameAr: 'استلام شخصي', icon: '🤝', color: 'gray' },
};

export const DELIVERY_STATUSES = {
  PENDING: { label: 'في انتظار التأكيد', color: 'yellow', icon: '⏳' },
  CONFIRMED: { label: 'تم التأكيد', color: 'blue', icon: '✅' },
  PICKED_UP: { label: 'تم الاستلام', color: 'indigo', icon: '📦' },
  IN_TRANSIT: { label: 'في الطريق', color: 'purple', icon: '🚚' },
  OUT_FOR_DELIVERY: { label: 'خارج للتوصيل', color: 'teal', icon: '🏃' },
  DELIVERED: { label: 'تم التوصيل', color: 'green', icon: '🎉' },
  FAILED: { label: 'فشل التوصيل', color: 'red', icon: '❌' },
  CANCELLED: { label: 'ملغي', color: 'gray', icon: '🚫' },
  RETURNED: { label: 'مرتجع', color: 'orange', icon: '↩️' },
};
