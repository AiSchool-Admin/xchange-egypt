import apiClient from './client';

export interface Category {
  id: string;
  name: string;
  nameAr: string;
  description?: string;
  descriptionAr?: string;
  icon?: string;
  parentId?: string;
  level: number;
  path: string;
  itemCount?: number;
  children?: Category[];
  createdAt: string;
  updatedAt: string;
}

export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}

export interface CategoryResponse {
  success: boolean;
  data: Category;
}

// Get all categories
export const getCategories = async (params?: {
  includeChildren?: boolean;
  parentId?: string;
}): Promise<CategoriesResponse> => {
  const queryParams = new URLSearchParams();

  if (params?.includeChildren) queryParams.append('includeChildren', 'true');
  if (params?.parentId) queryParams.append('parentId', params.parentId);

  const response = await apiClient.get(`/categories?${queryParams.toString()}`);
  return response.data;
};

// Get single category
export const getCategory = async (id: string): Promise<CategoryResponse> => {
  const response = await apiClient.get(`/categories/${id}`);
  return response.data;
};

// Get category tree (hierarchical)
export const getCategoryTree = async (): Promise<CategoriesResponse> => {
  const response = await apiClient.get('/categories/tree');
  return response.data;
};
