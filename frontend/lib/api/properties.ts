import apiClient from './client';

export interface RealEstateProperty {
  id: string;
  sellerId: string;
  title: string;
  titleAr: string;
  description?: string;
  descriptionAr?: string;
  propertyType: string;
  listingType: string;
  salePrice?: number;
  rentPrice?: number;
  areaSqm: number;
  bedrooms?: number;
  bathrooms?: number;
  floor?: number;
  totalFloors?: number;
  buildYear?: number;
  finishing?: string;
  furnishingType?: string;
  view?: string;
  governorate: string;
  city?: string;
  district?: string;
  compoundName?: string;
  streetName?: string;
  buildingNumber?: string;
  latitude?: number;
  longitude?: number;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasSecurity?: boolean;
  hasBalcony?: boolean;
  hasCentralAC?: boolean;
  hasNaturalGas?: boolean;
  hasLandline?: boolean;
  hasInternet?: boolean;
  viewsCount: number;
  favoritesCount: number;
  images?: Array<{ id: string; url: string; isPrimary: boolean }>;
  status: string;
  createdAt: string;
  updatedAt: string;
  seller?: {
    id: string;
    fullName: string;
    email?: string;
    phone?: string;
  };
}

export interface PropertiesResponse {
  success: boolean;
  data: {
    properties: RealEstateProperty[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface PropertyResponse {
  success: boolean;
  data: RealEstateProperty;
}

export interface PropertySearchParams {
  page?: number;
  limit?: number;
  search?: string;
  propertyType?: string;
  listingType?: string;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  governorate?: string;
  city?: string;
  district?: string;
  finishing?: string;
  furnishingType?: string;
  view?: string;
  hasElevator?: boolean;
  hasParking?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  hasGym?: boolean;
  hasSecurity?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const searchProperties = async (params?: PropertySearchParams): Promise<PropertiesResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.page) queryParams.append('page', params.page.toString());
  if (params?.limit) queryParams.append('limit', params.limit.toString());
  if (params?.search) queryParams.append('search', params.search);
  if (params?.propertyType) queryParams.append('propertyType', params.propertyType);
  if (params?.listingType) queryParams.append('listingType', params.listingType);
  if (params?.minPrice) queryParams.append('minPrice', params.minPrice.toString());
  if (params?.maxPrice) queryParams.append('maxPrice', params.maxPrice.toString());
  if (params?.minArea) queryParams.append('minArea', params.minArea.toString());
  if (params?.maxArea) queryParams.append('maxArea', params.maxArea.toString());
  if (params?.bedrooms) queryParams.append('bedrooms', params.bedrooms.toString());
  if (params?.bathrooms) queryParams.append('bathrooms', params.bathrooms.toString());
  if (params?.governorate) queryParams.append('governorate', params.governorate);
  if (params?.city) queryParams.append('city', params.city);
  if (params?.district) queryParams.append('district', params.district);
  if (params?.finishing) queryParams.append('finishing', params.finishing);
  if (params?.furnishingType) queryParams.append('furnishingType', params.furnishingType);
  if (params?.view) queryParams.append('view', params.view);
  if (params?.hasElevator !== undefined) queryParams.append('hasElevator', params.hasElevator.toString());
  if (params?.hasParking !== undefined) queryParams.append('hasParking', params.hasParking.toString());
  if (params?.hasGarden !== undefined) queryParams.append('hasGarden', params.hasGarden.toString());
  if (params?.hasPool !== undefined) queryParams.append('hasPool', params.hasPool.toString());
  if (params?.hasGym !== undefined) queryParams.append('hasGym', params.hasGym.toString());
  if (params?.hasSecurity !== undefined) queryParams.append('hasSecurity', params.hasSecurity.toString());
  if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
  if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

  const response = await apiClient.get(`/properties?${queryParams.toString()}`);
  return response.data;
};

export const getProperty = async (id: string): Promise<PropertyResponse> => {
  const response = await apiClient.get(`/properties/${id}`);
  return response.data;
};

export const getMyProperties = async (): Promise<PropertiesResponse> => {
  const response = await apiClient.get('/properties/my-properties');
  return response.data;
};

export const getFavoriteProperties = async (): Promise<PropertiesResponse> => {
  const response = await apiClient.get('/properties/favorites');
  return response.data;
};

export const addToFavorites = async (propertyId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.post(`/properties/${propertyId}/favorite`);
  return response.data;
};

export const removeFromFavorites = async (propertyId: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/properties/${propertyId}/favorite`);
  return response.data;
};

export const createProperty = async (data: any): Promise<PropertyResponse> => {
  const response = await apiClient.post('/properties', data);
  return response.data;
};

export const updateProperty = async (id: string, data: any): Promise<PropertyResponse> => {
  const response = await apiClient.put(`/properties/${id}`, data);
  return response.data;
};

export const deleteProperty = async (id: string): Promise<{ success: boolean }> => {
  const response = await apiClient.delete(`/properties/${id}`);
  return response.data;
};
