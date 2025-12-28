/**
 * Cars API Module
 * وحدة API للسيارات
 */

import apiClient from './client';

// ============================================
// Types
// ============================================

export interface CarListing {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuel_type: string;
  transmission: string;
  body_type: string;
  exterior_color: string;
  condition: string;
  city: string;
  governorate: string;
  images: string[];
  status: string;
  accepts_barter: boolean;
  barter_preferences?: {
    types: string[];
    preferred_makes: string[];
    min_year: number;
    accepts_cash_difference: boolean;
  };
  verification_level: string;
  seller_type: string;
  views_count: number;
  inquiries_count: number;
  favorites_count: number;
  created_at: string;
  expires_at: string;
  user: {
    id: string;
    name: string;
    phone?: string;
  };
}

export interface BarterProposal {
  id: string;
  type: string;
  status: string;
  requested_car: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
    owner: {
      id: string;
      name: string;
    };
  };
  offered_car?: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
  };
  offered_description?: string;
  cash_difference: number;
  cash_direction: 'PAY' | 'RECEIVE' | 'NONE';
  message?: string;
  proposer: {
    id: string;
    name: string;
    phone: string;
  };
  counter_offer?: {
    cash_difference: number;
    message: string;
    created_at: string;
  };
  created_at: string;
  updated_at: string;
  expires_at: string;
}

export interface CarTransaction {
  id: string;
  transaction_type: string;
  car: {
    id: string;
    make: string;
    model: string;
    year: number;
    price: number;
  };
  buyer: {
    id: string;
    name: string;
    phone: string;
  };
  seller: {
    id: string;
    name: string;
    phone: string;
  };
  agreed_price: number;
  platform_fee_buyer: number;
  platform_fee_seller: number;
  escrow_amount: number;
  status: string;
  payment_method: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  notes?: string;
}

export interface InspectionPartner {
  id: string;
  name: string;
  name_en: string;
  description: string;
  address: string;
  city: string;
  governorate: string;
  phone: string;
  email: string;
  website?: string;
  working_hours: string;
  services: string[];
  inspection_price: number;
  certification_level: string;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  location_lat?: number;
  location_lng?: number;
}

export interface ListingsFilters {
  make?: string;
  model?: string;
  yearMin?: number;
  yearMax?: number;
  bodyType?: string;
  transmission?: string;
  fuelType?: string;
  mileageMin?: number;
  mileageMax?: number;
  priceMin?: number;
  priceMax?: number;
  governorate?: string;
  city?: string;
  sellerType?: string;
  condition?: string;
  verificationLevel?: string;
  status?: string;
  allowBarter?: boolean;
  isFeatured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// ============================================
// Car Listings API
// ============================================

/**
 * Get car listings with filters
 */
export const getCarListings = async (filters?: ListingsFilters) => {
  const response = await apiClient.get('/cars/listings', { params: filters });
  return response.data;
};

/**
 * Get cars available for barter
 */
export const getBarterListings = async (filters?: ListingsFilters) => {
  const response = await apiClient.get('/cars/listings', {
    params: { ...filters, allowBarter: true, status: 'ACTIVE' }
  });
  return response.data;
};

/**
 * Get single car listing
 */
export const getCarListing = async (id: string) => {
  const response = await apiClient.get(`/cars/listings/${id}`);
  return response.data;
};

/**
 * Create car listing
 */
export const createCarListing = async (data: Partial<CarListing>) => {
  const response = await apiClient.post('/cars/listings', data);
  return response.data;
};

/**
 * Update car listing
 */
export const updateCarListing = async (id: string, data: Partial<CarListing>) => {
  const response = await apiClient.put(`/cars/listings/${id}`, data);
  return response.data;
};

/**
 * Delete car listing
 */
export const deleteCarListing = async (id: string) => {
  const response = await apiClient.delete(`/cars/listings/${id}`);
  return response.data;
};

/**
 * Get user's car listings
 */
export const getMyCarListings = async () => {
  const response = await apiClient.get('/cars/my-listings');
  return response.data;
};

// ============================================
// Barter Proposals API
// ============================================

/**
 * Get user's barter proposals
 */
export const getMyBarterProposals = async (type?: 'sent' | 'received' | 'all') => {
  const response = await apiClient.get('/cars/barter', { params: { type } });
  return response.data;
};

/**
 * Create barter proposal
 */
export const createBarterProposal = async (data: {
  offeredCarId?: string;
  offeredDescription?: string;
  requestedCarId: string;
  cashDifference?: number;
  message?: string;
}) => {
  const response = await apiClient.post('/cars/barter', data);
  return response.data;
};

/**
 * Respond to barter proposal (accept/reject/counter)
 */
export const respondToBarterProposal = async (
  id: string,
  data: {
    action: 'accept' | 'reject' | 'counter';
    receiverResponse?: string;
    counterOffer?: {
      cashDifference: number;
      message: string;
    };
  }
) => {
  const response = await apiClient.put(`/cars/barter/${id}/respond`, data);
  return response.data;
};

// ============================================
// Car Transactions API
// ============================================

/**
 * Get user's transactions
 */
export const getMyTransactions = async (type?: 'purchases' | 'sales' | 'all') => {
  const response = await apiClient.get('/cars/transactions', { params: { type } });
  return response.data;
};

/**
 * Create transaction (buy car)
 */
export const createTransaction = async (data: {
  carId: string;
  agreedPrice: number;
  paymentMethod: string;
}) => {
  const response = await apiClient.post('/cars/transactions', data);
  return response.data;
};

/**
 * Update transaction status
 */
export const updateTransactionStatus = async (
  id: string,
  data: { status: string; notes?: string }
) => {
  const response = await apiClient.put(`/cars/transactions/${id}/status`, data);
  return response.data;
};

// ============================================
// Inspection Partners API
// ============================================

/**
 * Get inspection partners
 */
export const getInspectionPartners = async (filters?: {
  governorate?: string;
  offersBasicInspection?: boolean;
  offersFullInspection?: boolean;
  offersPrePurchase?: boolean;
}) => {
  const response = await apiClient.get('/cars/partners', { params: filters });
  return response.data;
};

/**
 * Get single inspection partner
 */
export const getInspectionPartner = async (id: string) => {
  const response = await apiClient.get(`/cars/partners/${id}`);
  return response.data;
};

/**
 * Request car inspection
 */
export const requestInspection = async (data: {
  carId: string;
  partnerId: string;
  preferredDate?: string;
  notes?: string;
}) => {
  const response = await apiClient.post('/cars/inspections', data);
  return response.data;
};

// ============================================
// Price Calculator API
// ============================================

/**
 * Get price reference
 */
export const getCarPriceReference = async (make: string, model: string, year: number) => {
  const response = await apiClient.get('/cars/prices', { params: { make, model, year } });
  return response.data;
};

/**
 * Calculate transaction price
 */
export const calculatePrice = async (data: {
  listingPrice: number;
  make?: string;
  model?: string;
  year?: number;
}) => {
  const response = await apiClient.post('/cars/calculate', data);
  return response.data;
};

// ============================================
// Statistics API
// ============================================

/**
 * Get car marketplace statistics
 */
export const getCarStatistics = async () => {
  const response = await apiClient.get('/cars/statistics');
  return response.data;
};

/**
 * Get popular cars
 */
export const getPopularCars = async () => {
  const response = await apiClient.get('/cars/popular');
  return response.data;
};
