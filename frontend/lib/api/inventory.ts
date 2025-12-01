import apiClient from './client';

export type InventorySide = 'SUPPLY' | 'DEMAND';
export type InventoryItemType = 'GOODS' | 'SERVICES' | 'CASH';
export type ListingType = 'DIRECT_SALE' | 'AUCTION' | 'BARTER' | 'DIRECT_BUY' | 'REVERSE_AUCTION';
export type MarketType = 'DISTRICT' | 'CITY' | 'GOVERNORATE' | 'NATIONAL';

// Market configuration - Unified fees: 25 EGP + 5% commission
// الميزة الرئيسية: المطابقة التلقائية بالقرب الجغرافي
export const MARKET_CONFIG = {
  DISTRICT: {
    id: 'DISTRICT',
    nameAr: 'سوق الحي',
    nameEn: 'District Market',
    icon: '🏘️',
    color: 'green',
    listingFee: 25,
    commission: 5,
    maxValue: null,
    description: 'نطاق الحي - أقرب المستخدمين',
    descriptionEn: 'District scope - Nearest users',
  },
  CITY: {
    id: 'CITY',
    nameAr: 'سوق المدينة',
    nameEn: 'City Market',
    icon: '🏙️',
    color: 'blue',
    listingFee: 25,
    commission: 5,
    maxValue: null,
    description: 'نطاق المدينة بأكملها',
    descriptionEn: 'Entire city scope',
  },
  GOVERNORATE: {
    id: 'GOVERNORATE',
    nameAr: 'سوق المحافظة',
    nameEn: 'Governorate Market',
    icon: '🗺️',
    color: 'purple',
    listingFee: 25,
    commission: 5,
    maxValue: null,
    description: 'نطاق المحافظة بأكملها',
    descriptionEn: 'Entire governorate scope',
  },
  NATIONAL: {
    id: 'NATIONAL',
    nameAr: 'السوق الشامل',
    nameEn: 'National Market',
    icon: '🇪🇬',
    color: 'amber',
    listingFee: 25,
    commission: 5,
    maxValue: null,
    description: 'كل مصر - 27 محافظة',
    descriptionEn: 'All Egypt - 27 governorates',
  },
};

export interface InventoryItem {
  id: string;
  userId: string;
  side: InventorySide;
  type: InventoryItemType;
  title: string;
  description: string;
  estimatedValue: number;
  listingType: ListingType;
  status: 'ACTIVE' | 'PENDING' | 'MATCHED' | 'COMPLETED' | 'CANCELLED';
  images: string[];
  categoryId?: string;
  desiredCategoryId?: string;
  desiredKeywords?: string;
  // Market & Location
  marketType: MarketType;
  governorate?: string;
  city?: string;
  district?: string;
  viewCount: number;
  matchCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryStats {
  supply: number;
  demand: number;
  matched: number;
  completed: number;
}

export interface InventoryResponse {
  success: boolean;
  data: {
    items: InventoryItem[];
    total: number;
    stats: {
      active: number;
      pending: number;
      sold: number;
    };
  };
}

export interface CreateInventoryItemInput {
  side: InventorySide;
  type: InventoryItemType;
  title: string;
  description: string;
  estimatedValue: number;
  listingType: ListingType;
  images?: string[];
  categoryId?: string;
  desiredCategoryId?: string;
  desiredKeywords?: string;
  // Market & Location
  marketType?: MarketType;
  governorate?: string;
  city?: string;
  district?: string;
  startingBid?: number;
  auctionDurationDays?: number;
}

// Get user's inventory
export const getInventory = async (params?: {
  side?: InventorySide;
  type?: InventoryItemType;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<InventoryResponse> => {
  const queryParams = new URLSearchParams();
  if (params?.side) queryParams.append('side', params.side);
  if (params?.type) queryParams.append('type', params.type);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());

  const response = await apiClient.get(`/inventory?${queryParams.toString()}`);
  return response.data;
};

// Get inventory stats
export const getInventoryStats = async (): Promise<{ success: boolean; data: InventoryStats }> => {
  const response = await apiClient.get('/inventory/stats');
  return response.data;
};

// Create inventory item
export const createInventoryItem = async (input: CreateInventoryItemInput): Promise<any> => {
  const response = await apiClient.post('/inventory', input);
  return response.data;
};

// Update item status
export const updateItemStatus = async (id: string, status: string): Promise<any> => {
  const response = await apiClient.patch(`/inventory/${id}/status`, { status });
  return response.data;
};

// Delete inventory item
export const deleteInventoryItem = async (id: string): Promise<any> => {
  const response = await apiClient.delete(`/inventory/${id}`);
  return response.data;
};

// Find matches for item
export const findMatches = async (id: string): Promise<any> => {
  const response = await apiClient.get(`/inventory/${id}/matches`);
  return response.data;
};

// Public API - Get latest items for home page (no auth required)
export interface PublicItem {
  id: string;
  side: InventorySide;
  type?: InventoryItemType;
  title: string;
  description: string;
  estimatedValue: number;
  minValue?: number;
  maxValue?: number;
  images?: string[];
  category?: {
    id: string;
    nameAr: string;
    nameEn: string;
  } | null;
  // Market & Location
  marketType?: MarketType;
  governorate?: string | null;
  city?: string | null;
  district?: string | null;
  location?: string;
  keywords?: string[];
  user: {
    id: string;
    name: string;
    avatar?: string | null;
    governorate?: string | null;
    city?: string | null;
  };
  views?: number;
  expiresAt?: string;
  createdAt: string;
}

export interface LatestItemsResponse {
  success: boolean;
  data: {
    supply: PublicItem[];
    demand: PublicItem[];
  };
}

export interface GetLatestItemsParams {
  limit?: number;
  marketType?: MarketType;
  governorate?: string;
}

export const getLatestItems = async (params: GetLatestItemsParams = {}): Promise<LatestItemsResponse> => {
  const { limit = 8, marketType, governorate } = params;
  const queryParams = new URLSearchParams();
  queryParams.append('limit', limit.toString());
  if (marketType) queryParams.append('marketType', marketType);
  if (governorate) queryParams.append('governorate', governorate);

  const response = await apiClient.get(`/inventory/latest?${queryParams.toString()}`);
  return response.data;
};
