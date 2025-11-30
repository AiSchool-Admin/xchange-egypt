import apiClient from './client';

export type InventorySide = 'SUPPLY' | 'DEMAND';
export type InventoryItemType = 'GOODS' | 'SERVICES' | 'CASH';
export type ListingType = 'DIRECT_SALE' | 'AUCTION' | 'BARTER' | 'DIRECT_BUY' | 'REVERSE_AUCTION';

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
  governorate?: string;
  city?: string;
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
  governorate?: string;
  city?: string;
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
