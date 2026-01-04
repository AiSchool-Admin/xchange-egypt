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

// Advanced filter parameters
export interface ItemFilterParams {
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
  featured?: boolean;
  isScrap?: boolean;
  // Location filters
  governorate?: string;
  city?: string;
  district?: string;
  // Sorting
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  // Real Estate filters
  propertyType?: string;
  propertyFinishing?: string;
  propertyView?: string;
  minArea?: number;
  maxArea?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minFloor?: number;
  maxFloor?: number;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasSecurity?: boolean;
  // Vehicle filters
  vehicleBrand?: string;
  vehicleModel?: string;
  minYear?: number;
  maxYear?: number;
  minKilometers?: number;
  maxKilometers?: number;
  fuelType?: string;
  transmissionType?: string;
  bodyType?: string;
  vehicleColor?: string;
  hasWarranty?: boolean;
  // Service availability filters
  deliveryAvailable?: boolean;
  installmentAvailable?: boolean;
}

// Get all items with filters
export const getItems = async (params?: ItemFilterParams): Promise<ItemsResponse> => {
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
  if (params?.featured !== undefined) queryParams.append('featured', params.featured.toString());
  if (params?.isScrap !== undefined) queryParams.append('isScrap', params.isScrap.toString());
  // Location params
  if (params?.governorate) queryParams.append('governorate', params.governorate);
  if (params?.city) queryParams.append('city', params.city);
  if (params?.district) queryParams.append('district', params.district);
  // Sorting params
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  // Real Estate filters
  if (params?.propertyType) queryParams.append('propertyType', params.propertyType);
  if (params?.propertyFinishing) queryParams.append('propertyFinishing', params.propertyFinishing);
  if (params?.propertyView) queryParams.append('propertyView', params.propertyView);
  if (params?.minArea) queryParams.append('minArea', params.minArea.toString());
  if (params?.maxArea) queryParams.append('maxArea', params.maxArea.toString());
  if (params?.minBedrooms) queryParams.append('minBedrooms', params.minBedrooms.toString());
  if (params?.maxBedrooms) queryParams.append('maxBedrooms', params.maxBedrooms.toString());
  if (params?.minBathrooms) queryParams.append('minBathrooms', params.minBathrooms.toString());
  if (params?.maxBathrooms) queryParams.append('maxBathrooms', params.maxBathrooms.toString());
  if (params?.minFloor) queryParams.append('minFloor', params.minFloor.toString());
  if (params?.maxFloor) queryParams.append('maxFloor', params.maxFloor.toString());
  if (params?.hasElevator !== undefined) queryParams.append('hasElevator', params.hasElevator.toString());
  if (params?.hasParking !== undefined) queryParams.append('hasParking', params.hasParking.toString());
  if (params?.hasGarden !== undefined) queryParams.append('hasGarden', params.hasGarden.toString());
  if (params?.hasPool !== undefined) queryParams.append('hasPool', params.hasPool.toString());
  if (params?.hasGym !== undefined) queryParams.append('hasGym', params.hasGym.toString());
  if (params?.hasSecurity !== undefined) queryParams.append('hasSecurity', params.hasSecurity.toString());

  // Vehicle filters
  if (params?.vehicleBrand) queryParams.append('vehicleBrand', params.vehicleBrand);
  if (params?.vehicleModel) queryParams.append('vehicleModel', params.vehicleModel);
  if (params?.minYear) queryParams.append('minYear', params.minYear.toString());
  if (params?.maxYear) queryParams.append('maxYear', params.maxYear.toString());
  if (params?.minKilometers) queryParams.append('minKilometers', params.minKilometers.toString());
  if (params?.maxKilometers) queryParams.append('maxKilometers', params.maxKilometers.toString());
  if (params?.fuelType) queryParams.append('fuelType', params.fuelType);
  if (params?.transmissionType) queryParams.append('transmissionType', params.transmissionType);
  if (params?.bodyType) queryParams.append('bodyType', params.bodyType);
  if (params?.vehicleColor) queryParams.append('vehicleColor', params.vehicleColor);
  if (params?.hasWarranty !== undefined) queryParams.append('hasWarranty', params.hasWarranty.toString());

  // Service availability filters
  if (params?.deliveryAvailable !== undefined) queryParams.append('deliveryAvailable', params.deliveryAvailable.toString());
  if (params?.installmentAvailable !== undefined) queryParams.append('installmentAvailable', params.installmentAvailable.toString());

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
  // Use /items/create for JSON data (when images are URLs)
  // Use /items for multipart/form-data (when uploading files directly)
  const response = await apiClient.post('/items/create', data);
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
