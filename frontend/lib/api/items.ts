import apiClient from './client';

export interface Item {
  id: string;
  title: string;
  description: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR';
  price?: number;
  location?: string;
  status: 'AVAILABLE' | 'RESERVED' | 'SOLD';
  images: Array<{ id: string; url: string; isPrimary: boolean }>;
  category: {
    id: string;
    nameEn: string;
    nameAr: string;
  };
  seller: {
    id: string;
    fullName: string;
    email: string;
    userType: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  title: string;
  description: string;
  condition: string;
  price?: number;
  categoryId: string;
  location?: string;
  imageUrls?: string[];
}

export interface ItemsResponse {
  success: boolean;
  data: {
    items: Item[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ItemResponse {
  success: boolean;
  data: Item;
}

// Get all items with filters
export const getItems = async (params?: {
  page?: number;
  limit?: number;
  categoryId?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: string;
}): Promise<ItemsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.condition) queryParams.append('condition', params.condition);
  if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);

  const response = await apiClient.get(`/items?${queryParams.toString()}`);
  return response.data;
};

// Get single item by ID
export const getItem = async (id: string): Promise<ItemResponse> => {
  const response = await apiClient.get(`/items/${id}`);
  return response.data;
};

// Create new item
export const createItem = async (data: CreateItemData): Promise<ItemResponse> => {
  const response = await apiClient.post('/items', data);
  return response.data;
};

// Update item
export const updateItem = async (id: string, data: Partial<CreateItemData>): Promise<ItemResponse> => {
  const response = await apiClient.put(`/items/${id}`, data);
  return response.data;
};

// Delete item
export const deleteItem = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/items/${id}`);
  return response.data;
};

// Get user's items
export const getMyItems = async (): Promise<ItemsResponse> => {
  const response = await apiClient.get('/items/my');
  return response.data;
};
