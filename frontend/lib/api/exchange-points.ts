import apiClient from './client';

// ============================================
// Types
// ============================================

export interface ExchangePoint {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  type: 'XCHANGE_HUB' | 'PARTNER_STORE' | 'POLICE_STATION' | 'MALL' | 'COFFEE_SHOP' | 'BANK';
  governorate: string;
  city: string;
  area?: string;
  address: string;
  addressAr?: string;
  latitude: number;
  longitude: number;
  googleMapsUrl?: string;
  phone?: string;
  whatsapp?: string;
  workingHours: any;
  is24Hours: boolean;
  hasParking: boolean;
  hasCCTV: boolean;
  hasWifi: boolean;
  hasWaitingArea: boolean;
  hasInspection: boolean;
  images: string[];
  coverImage?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'TEMPORARILY_CLOSED' | 'COMING_SOON';
  verifiedAt?: string;
  totalExchanges: number;
  avgRating: number;
  ratingCount: number;
  distance?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeBooking {
  id: string;
  pointId: string;
  user1Id: string;
  user2Id: string;
  transactionType: string;
  transactionId?: string;
  offerId?: string;
  scheduledDate: string;
  scheduledTime: string;
  duration: number;
  status: 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  confirmedByUser1: boolean;
  confirmedByUser2: boolean;
  user1CheckedIn?: string;
  user2CheckedIn?: string;
  completedAt?: string;
  completionNotes?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  cancelReason?: string;
  createdAt: string;
  updatedAt: string;
  point?: ExchangePoint;
}

export interface ExchangePointReview {
  id: string;
  pointId: string;
  userId: string;
  bookingId?: string;
  rating: number;
  safetyRating?: number;
  cleanlinessRating?: number;
  accessibilityRating?: number;
  comment?: string;
  createdAt: string;
}

// ============================================
// API Functions
// ============================================

export const getExchangePoints = async (filters?: {
  governorate?: string;
  city?: string;
  type?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
}) => {
  const response = await apiClient.get('/exchange-points', { params: filters });
  return response.data;
};

export const getExchangePoint = async (id: string) => {
  const response = await apiClient.get(`/exchange-points/${id}`);
  return response.data;
};

export const getNearbyPoints = async (latitude: number, longitude: number, radius?: number) => {
  const response = await apiClient.get('/exchange-points/nearby', {
    params: { latitude, longitude, radius },
  });
  return response.data;
};

export const getGovernorates = async () => {
  const response = await apiClient.get('/exchange-points/governorates');
  return response.data;
};

export const getAvailableSlots = async (pointId: string, date: string) => {
  const response = await apiClient.get(`/exchange-points/${pointId}/slots`, {
    params: { date },
  });
  return response.data;
};

export const createBooking = async (data: {
  pointId: string;
  user2Id: string;
  transactionType?: string;
  transactionId?: string;
  offerId?: string;
  scheduledDate: string;
  scheduledTime: string;
  duration?: number;
}) => {
  const response = await apiClient.post('/exchange-points/bookings', data);
  return response.data;
};

export const getMyBookings = async (status?: string) => {
  const response = await apiClient.get('/exchange-points/bookings/my', {
    params: { status },
  });
  return response.data;
};

export const confirmBooking = async (id: string) => {
  const response = await apiClient.post(`/exchange-points/bookings/${id}/confirm`);
  return response.data;
};

export const checkIn = async (id: string) => {
  const response = await apiClient.post(`/exchange-points/bookings/${id}/check-in`);
  return response.data;
};

export const completeBooking = async (id: string, notes?: string) => {
  const response = await apiClient.post(`/exchange-points/bookings/${id}/complete`, { notes });
  return response.data;
};

export const cancelBooking = async (id: string, reason?: string) => {
  const response = await apiClient.post(`/exchange-points/bookings/${id}/cancel`, { reason });
  return response.data;
};

export const addReview = async (pointId: string, data: {
  rating: number;
  safetyRating?: number;
  cleanlinessRating?: number;
  accessibilityRating?: number;
  comment?: string;
  bookingId?: string;
}) => {
  const response = await apiClient.post(`/exchange-points/${pointId}/reviews`, data);
  return response.data;
};
