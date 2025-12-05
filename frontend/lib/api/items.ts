import apiClient from './client';

export type PromotionTier = 'BASIC' | 'FEATURED' | 'PREMIUM' | 'GOLD' | 'PLATINUM';

export interface Item {
  id: string;
  title: string;
  description: string;
  condition: 'NEW' | 'LIKE_NEW' | 'GOOD' | 'FAIR' | 'POOR' | 'FOR_PARTS' | 'DAMAGED' | 'SCRAP';
  price?: number;
  estimatedValue?: number;
  location?: string;
  governorate?: string;
  city?: string;
  district?: string;
  status: 'DRAFT' | 'ACTIVE' | 'SOLD' | 'TRADED' | 'ARCHIVED';
  listingType?: 'DIRECT_SALE' | 'AUCTION' | 'BARTER' | 'DIRECT_BUY' | 'REVERSE_AUCTION';
  images: Array<{ id: string; url: string; isPrimary: boolean }>;
  // Featured/Promotion fields
  isFeatured?: boolean;
  promotionTier?: PromotionTier;
  promotedAt?: string;
  promotionExpiresAt?: string;
  // Barter preferences - What the seller wants in exchange
  desiredItemTitle?: string;
  desiredItemDescription?: string;
  desiredCategoryId?: string;
  desiredKeywords?: string;
  desiredValueMin?: number;
  desiredValueMax?: number;
  desiredCategory?: {
    id: string;
    nameEn: string;
    nameAr: string;
  };
  category?: {
    id: string;
    nameEn: string;
    nameAr: string;
    slug?: string;
  };
  seller?: {
    id: string;
    fullName: string;
    email?: string;
    userType?: string;
    avatar?: string;
    businessName?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  titleAr: string;
  titleEn?: string;
  descriptionAr: string;
  descriptionEn?: string;
  condition: string;
  categoryId: string;
  estimatedValue?: number;
  location: string;
  governorate: string;
  quantity?: number;
  imageUrls?: string[];
  // Barter preferences
  desiredCategoryId?: string;
  desiredKeywords?: string;
  desiredValueMin?: number;
  desiredValueMax?: number;
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
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  status?: string;
  sellerId?: string;
  // Location filters
  governorate?: string;
  city?: string;
  district?: string;
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}): Promise<ItemsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.condition) queryParams.append('condition', params.condition);
  if (params?.listingType) queryParams.append('listingType', params.listingType);
  if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.status) queryParams.append('status', params.status);
  if (params?.sellerId) queryParams.append('sellerId', params.sellerId);
  // Location params
  if (params?.governorate) queryParams.append('governorate', params.governorate);
  if (params?.city) queryParams.append('city', params.city);
  if (params?.district) queryParams.append('district', params.district);
  // Sorting params
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await apiClient.get(`/items/search?${queryParams.toString()}`);
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

// Featured items response
export interface FeaturedItemsResponse {
  success: boolean;
  data: {
    items: Item[];
  };
}

// Get featured items
export const getFeaturedItems = async (params?: {
  limit?: number;
  categoryId?: string;
  governorate?: string;
  minTier?: PromotionTier;
}): Promise<FeaturedItemsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.governorate) queryParams.append('governorate', params.governorate);
  if (params?.minTier) queryParams.append('minTier', params.minTier);

  const response = await apiClient.get(`/items/featured?${queryParams.toString()}`);
  return response.data;
};

// Get luxury items (high-value items)
export const getLuxuryItems = async (params?: {
  limit?: number;
  minPrice?: number;
  categoryId?: string;
  governorate?: string;
  sortBy?: 'price_high' | 'price_low' | 'recent';
}): Promise<FeaturedItemsResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.categoryId) queryParams.append('categoryId', params.categoryId);
  if (params?.governorate) queryParams.append('governorate', params.governorate);
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);

  const response = await apiClient.get(`/items/luxury?${queryParams.toString()}`);
  return response.data;
};

// Promote an item
export const promoteItem = async (
  itemId: string,
  tier: PromotionTier,
  durationDays?: number
): Promise<ItemResponse> => {
  const response = await apiClient.post(`/items/${itemId}/promote`, {
    tier,
    durationDays,
  });
  return response.data;
};

// Remove promotion from an item
export const removePromotion = async (itemId: string): Promise<ItemResponse> => {
  const response = await apiClient.delete(`/items/${itemId}/promote`);
  return response.data;
};
